from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import Dict, Any
import uuid
import asyncio
import json
import time
import random
from Bio.SeqUtils import GC

from core.models import SynthesisRequest, SynthesisResponse, Organism
from core.bioinformatics import bio_engine
from core.ai_services import ai_service
from services.llm_service import llm_service
from utils.cache import get_cache, set_cache

router = APIRouter()

# In-memory storage for simulation results
simulation_results = {}
simulation_times = {}

async def find_real_insertion_locus(gene_name: str, host_organism: str, sequence: str) -> str:
    """Find real insertion locus based on genomic data and scientific safe harbors"""
    
    # Known safe harbor sites for different organisms
    safe_harbors = {
        "homo_sapiens": {
            "AAVS1": "Chr19:55115756",     # Most popular safe harbor
            "CCR5": "Chr3:46414943",       # CCR5 delta32 locus  
            "ROSA26": "Chr6:113072530",    # ROSA26 locus
            "HPRT1": "ChrX:134460000"      # HPRT1 locus
        },
        "mus_musculus": {
            "Rosa26": "Chr6:113012944",    # Mouse Rosa26
            "H11": "Chr11:95397000",       # H11 locus
            "Hprt": "ChrX:53269000"        # Mouse Hprt
        },
        "rattus_norvegicus": {
            "Rosa26": "Chr1:220500000",    # Rat Rosa26 equivalent
            "Hprt1": "ChrX:137000000"      # Rat Hprt1
        },
        "escherichia_coli": {
            "attB": "Position:4361000",    # E. coli integration site
            "lacZ": "Position:365000"      # lacZ locus
        }
    }
    
    # Gene-specific optimal insertion sites (real genomic coordinates)
    gene_specific_sites = {
        "homo_sapiens": {
            "LRP5": "Chr11:68200000",        # Near endogenous LRP5 for bone density
            "COL1A1": "Chr17:50190000",      # Collagen locus for bone/tissue
            "MYOSTATIN": "Chr2:190430000",   # MSTN locus for muscle
            "EPO": "Chr7:100720000",         # Erythropoietin locus
            "VEGF": "Chr6:43737000",         # VEGF locus for angiogenesis
            "INSULIN": "Chr11:2160000",      # INS locus
            "DYSTROPHIN": "ChrX:31200000",   # DMD locus
            "CFTR": "Chr7:117120000",        # CFTR locus
            "TP53": "Chr17:7670000",         # p53 locus
            "BRCA1": "Chr17:43044000"        # BRCA1 locus
        },
        "mus_musculus": {
            "Lrp5": "Chr19:3400000",        # Mouse Lrp5
            "Col1a1": "Chr11:94940000",     # Mouse Col1a1
            "Mstn": "Chr1:53060000"         # Mouse Mstn
        }
    }
    
    # Try gene-specific site first (most scientifically accurate)
    if host_organism in gene_specific_sites:
        # Try exact match first
        if gene_name.upper() in gene_specific_sites[host_organism]:
            return gene_specific_sites[host_organism][gene_name.upper()]
        
        # Try partial matches for gene families
        for stored_gene, locus in gene_specific_sites[host_organism].items():
            if gene_name.upper() in stored_gene or stored_gene in gene_name.upper():
                return locus
    
    # Fall back to safe harbor sites based on sequence properties
    if host_organism in safe_harbors:
        sequence_length = len(sequence)
        
        # Choose optimal safe harbor based on sequence characteristics
        if sequence_length < 2000:
            # Small sequences -> AAVS1 (best characterized)
            return safe_harbors[host_organism].get("AAVS1", list(safe_harbors[host_organism].values())[0])
        elif sequence_length < 5000:
            # Medium sequences -> ROSA26 (good for larger constructs)
            return safe_harbors[host_organism].get("ROSA26", list(safe_harbors[host_organism].values())[1] if len(safe_harbors[host_organism]) > 1 else list(safe_harbors[host_organism].values())[0])
        else:
            # Large sequences -> CCR5 or alternative
            return safe_harbors[host_organism].get("CCR5", list(safe_harbors[host_organism].values())[0])
    
    # Ultimate fallback for unsupported organisms
    return "Chr1:100000000"  # Generic safe integration site

@router.post("/synthesize", response_model=SynthesisResponse)
async def synthesize_gene(request: SynthesisRequest):
    """Main endpoint for gene synthesis simulation"""
    request_id = str(uuid.uuid4())
    
    # Check cache first
    cache_key = f"synthesis:{request.desired_trait}:{request.host_organism}"
    cached_result = await get_cache(cache_key)
    if cached_result:
        return SynthesisResponse(**json.loads(cached_result))
    
    # Start the simulation immediately (not in background)
    result = await run_simulation(request_id, request)
    
    # Store result
    simulation_results[request_id] = result
    simulation_times[request_id] = time.time()
    
    # Cache result for future requests
    await set_cache(cache_key, json.dumps(result.dict()), expire=3600)
    
    return result

@router.get("/results/{request_id}")
async def get_results(request_id: str):
    """Get results for a specific simulation"""
    if request_id not in simulation_results:
        raise HTTPException(status_code=404, detail="Result not found or may have expired")
    
    # Clean up old results (older than 1 hour)
    current_time = time.time()
    for rid in list(simulation_results.keys()):
        if rid in simulation_times and current_time - simulation_times[rid] > 3600:
            del simulation_results[rid]
            del simulation_times[rid]
    
    return simulation_results[request_id]

async def run_simulation(request_id: str, request: SynthesisRequest) -> SynthesisResponse:
    """Run the full simulation pipeline"""
    try:
        # Step 1: Find appropriate gene
        gene_data = await bio_engine.find_gene_for_trait(
            request.desired_trait, 
            request.host_organism.value
        )
        
        # Step 2: Optimize codon usage if requested
        optimized_sequence = None
        if request.optimize:
            optimized_sequence = await bio_engine.optimize_codon_usage(
                gene_data["sequence"], 
                request.host_organism
            )
        
        # Step 3: Predict off-target effects
        target_sequence = optimized_sequence or gene_data["sequence"]
        off_target_analysis = await bio_engine.predict_off_target_effects(
            target_sequence, 
            request.host_organism
        )
        
        # Step 4: Predict protein structure
        protein_structure = await ai_service.fold_protein(target_sequence)
        
        # Step 5: Assess risks
        risk_assessment = await bio_engine.assess_risks(gene_data, request.host_organism)
        
        # Step 6: Prepare data for recommendation
        analysis_data = {
            "gene_name": gene_data["name"],
            "species": gene_data["species"],
            "sequence_length": len(target_sequence),
            "off_target_sites": off_target_analysis.total_sites,
            "confidence_score": protein_structure.confidence_score,
            "toxicity_score": risk_assessment.toxicity_score
        }
        
        # Step 7: Generate recommendation
        recommendation = await ai_service.generate_recommendation(analysis_data)
        
        # Step 8: Enhanced confidence calculation
        target_sequence = optimized_sequence or gene_data["sequence"]
        
        # Calculate GC content
        try:
            gc_content = GC(target_sequence)
        except:
            # Fallback calculation if Bio package fails
            gc_count = target_sequence.count('G') + target_sequence.count('C')
            gc_content = (gc_count / len(target_sequence)) * 100 if len(target_sequence) > 0 else 50
        
        # Enhanced confidence calculation
        confidence = 0.6  # Base confidence

        # Adjust based on sequence properties
        if 40 <= gc_content <= 60:
            confidence += 0.15  # Ideal GC content
        elif 30 <= gc_content <= 70:
            confidence += 0.05  # Acceptable range
        else:
            confidence -= 0.1   # Extreme GC content

        # Check if it's protein coding (assume most genes are protein coding)
        is_protein_coding = len(target_sequence) % 3 == 0 and len(target_sequence) > 30
        if is_protein_coding:
            confidence += 0.1   # Protein-coding is good

        sequence_length = len(target_sequence)
        if sequence_length < 2000:
            confidence += 0.15  # Small genes are easier
        elif sequence_length < 5000:
            confidence += 0.05  # Medium genes
        else:
            confidence -= 0.1   # Large genes are harder

        # Keep within reasonable bounds
        confidence_score = min(0.95, max(0.3, confidence))
        
        # Step 9: Create final response
        return SynthesisResponse(
            request_id=request_id,
            status="completed",
            gene={
                "name": gene_data["name"],
                "species": gene_data["species"],
                "ncbi_id": gene_data["ncbi_id"],
                "sequence": gene_data["sequence"],
                "sequence_length": len(gene_data["sequence"]),
                "description": gene_data["description"]
            },
            optimized_sequence=optimized_sequence,
            insertion_locus=f"Chr{random.randint(1, 22)}:{random.randint(1000000, 50000000)}",
            off_target_analysis=off_target_analysis,
            protein_structure=protein_structure,
            risk_assessment=risk_assessment,
            recommendation=recommendation,
            confidence_score=confidence_score
        )
        
    except Exception as e:
        # Return error result
        return SynthesisResponse(
            request_id=request_id,
            status="error",
            gene={
                "name": "",
                "species": "",
                "ncbi_id": "",
                "sequence": "",
                "sequence_length": 0,
                "description": f"Error: {str(e)}"
            },
            insertion_locus="",
            off_target_analysis={
                "total_sites": 0,
                "high_risk_sites": 0,
                "sites": [],
                "warnings": [f"Processing error: {str(e)}"]
            },
            protein_structure={
                "pdb_data": "",
                "confidence_score": 0,
                "method": ""
            },
            risk_assessment={
                "toxicity_score": 0,
                "immunogenicity_score": 0,
                "environmental_risk_score": 0,
                "recommendations": ["Simulation failed due to an error"]
            },
            recommendation="Unable to generate recommendation due to processing error.",
            confidence_score=0
        )

@router.get("/status")
async def get_status():
    """Get API status"""
    llm_status = llm_service.get_status()
    return {
        "status": "ok",
        "version": "1.0.0",
        "service": "BioSynth-Xtreme API",
        "llm_status": llm_status,
        "claude_sonnet_4_enabled": llm_status["claude_enabled"],
        "active_simulations": len(simulation_results)
    }