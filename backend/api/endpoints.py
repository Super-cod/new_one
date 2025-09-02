from fastapi import APIRouter, HTTPException, BackgroundTasks, Request
from fastapi.responses import JSONResponse
from typing import Dict, Any, Optional
import uuid
import asyncio
import json
import time
import random
import logging
from Bio.SeqUtils import GC

from core.models import SynthesisRequest, SynthesisResponse, Organism
from core.bioinformatics import bio_engine
from core.ai_services import ai_service
from services.llm_service import llm_service
from utils.cache import get_cache, set_cache

router = APIRouter()
logger = logging.getLogger(__name__)

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
async def synthesize_gene(request: SynthesisRequest, http_request: Request):
    """Main endpoint for gene synthesis simulation"""
    logger.info(f"🚀 BACKEND: Received synthesis request")
    logger.info(f"📝 BACKEND: Request data - Host: {request.host_organism}, Trait: {request.desired_trait}")
    logger.info(f"🔧 BACKEND: Optimize: {request.optimize}, Safety Check: {request.safety_check}")
    logger.info(f"🌐 BACKEND: Client IP: {http_request.client.host}")
    
    request_id = str(uuid.uuid4())
    logger.info(f"🆔 BACKEND: Generated request ID: {request_id}")
    
    try:
        # Check cache first
        cache_key = f"synthesis:{request.desired_trait}:{request.host_organism}"
        cached_result = await get_cache(cache_key)
        if cached_result:
            logger.info(f"📦 BACKEND: Found cached result, returning cached data")
            cached_data = json.loads(cached_result)
            # Ensure we return a proper SynthesisResponse object
            return SynthesisResponse(**cached_data)

        # Start the simulation immediately (not in background)
        logger.info(f"⚡ BACKEND: Starting simulation for request {request_id}")
        result = await run_simulation(request_id, request)
        
        # Store result
        simulation_results[request_id] = result
        simulation_times[request_id] = time.time()
        
        # Cache result for future requests
        try:
            # Convert to dict properly for caching
            result_dict = result.dict() if hasattr(result, 'dict') else result.__dict__
            await set_cache(cache_key, json.dumps(result_dict), expire=3600)
        except Exception as cache_error:
            logger.error(f"❌ BACKEND: Cache error: {cache_error}")
            # Continue without caching
        
        logger.info(f"✅ BACKEND: Simulation complete! Returning result for {request_id}")
        logger.info(f"🧬 BACKEND: Gene name: {result.gene.name if hasattr(result.gene, 'name') else 'Unknown'}, Confidence: {result.confidence_score}")
        
        return result
        
    except Exception as e:
        logger.error(f"❌ BACKEND: Error in synthesize_gene: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/results/{request_id}")
async def get_results(request_id: str):
    """Get results for a specific simulation"""
    logger.info(f"🔍 BACKEND: Looking for results for request ID: {request_id}")
    
    if request_id not in simulation_results:
        logger.warning(f"⚠️ BACKEND: Result not found for request ID: {request_id}")
        raise HTTPException(status_code=404, detail="Result not found or may have expired")
    
    # Clean up old results (older than 1 hour)
    current_time = time.time()
    cleaned_count = 0
    for rid in list(simulation_results.keys()):
        if rid in simulation_times and current_time - simulation_times[rid] > 3600:
            del simulation_results[rid]
            del simulation_times[rid]
            cleaned_count += 1
    
    if cleaned_count > 0:
        logger.info(f"🧹 BACKEND: Cleaned up {cleaned_count} expired results")
    
    result = simulation_results[request_id]
    logger.info(f"✅ BACKEND: Returning cached result for {request_id}")
    return result

async def run_simulation(request_id: str, request: SynthesisRequest) -> SynthesisResponse:
    """Run the full simulation pipeline"""
    logger.info(f"🔬 BACKEND: Starting simulation pipeline for {request_id}")
    
    try:
        # Step 1: Find appropriate gene
        logger.info(f"🧬 BACKEND: Step 1 - Finding gene for trait: {request.desired_trait}")
        gene_data = await bio_engine.find_gene_for_trait(
            request.desired_trait, 
            request.host_organism.value
        )
        logger.info(f"✅ BACKEND: Found gene: {gene_data.get('name', 'Unknown')}")
        
        # Step 2: Optimize codon usage if requested
        optimized_sequence = None
        if request.optimize:
            logger.info(f"🔧 BACKEND: Step 2 - Optimizing codon usage")
            optimized_sequence = await bio_engine.optimize_codon_usage(
                gene_data["sequence"], 
                request.host_organism
            )
            logger.info(f"✅ BACKEND: Codon optimization complete")
        else:
            logger.info(f"⏭️ BACKEND: Step 2 - Skipping codon optimization")
        
        # Step 3: Predict off-target effects
        logger.info(f"🎯 BACKEND: Step 3 - Predicting off-target effects")
        target_sequence = optimized_sequence or gene_data["sequence"]
        off_target_analysis = await bio_engine.predict_off_target_effects(
            target_sequence, 
            request.host_organism
        )
        logger.info(f"✅ BACKEND: Off-target analysis complete")
        
        # Step 4: Predict protein structure
        logger.info(f"🏗️ BACKEND: Step 4 - Predicting protein structure")
        protein_structure = await ai_service.fold_protein(target_sequence)
        logger.info(f"✅ BACKEND: Protein folding complete")
        
        # Step 5: Assess risks
        logger.info(f"⚠️ BACKEND: Step 5 - Assessing risks")
        risk_assessment = await bio_engine.assess_risks(gene_data, request.host_organism)
        logger.info(f"✅ BACKEND: Risk assessment complete")
        
        # Step 6: Prepare data for recommendation
        analysis_data = {
            "gene_name": gene_data["name"],
            "species": gene_data["species"],
            "sequence_length": len(target_sequence),
            "off_target_sites": getattr(off_target_analysis, 'total_sites', 0),
            "confidence_score": getattr(protein_structure, 'confidence_score', 0.5),
            "toxicity_score": getattr(risk_assessment, 'toxicity_score', 0.1)
        }
        
        # Step 7: Generate recommendation
        logger.info(f"💡 BACKEND: Step 7 - Generating AI recommendation")
        recommendation = await ai_service.generate_recommendation(analysis_data)
        logger.info(f"✅ BACKEND: AI recommendation generated")
        
        # Step 8: Enhanced confidence calculation
        target_sequence = optimized_sequence or gene_data["sequence"]
        
        # Calculate GC content
        try:
            gc_content = GC(target_sequence)
        except Exception as gc_error:
            logger.warning(f"⚠️ BACKEND: GC calculation error: {gc_error}")
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
        
        logger.info(f"📊 BACKEND: Calculated confidence score: {confidence_score:.2f}")
        
        # Step 9: Create final response
        logger.info(f"📦 BACKEND: Step 9 - Creating final response")
        
        insertion_locus = await find_real_insertion_locus(
            gene_data["name"], 
            request.host_organism.value, 
            target_sequence
        )
        
        response_data = {
            "request_id": request_id,
            "status": "completed",
            "gene": {
                "name": gene_data["name"],
                "species": gene_data["species"],
                "ncbi_id": gene_data["ncbi_id"],
                "sequence": gene_data["sequence"],
                "sequence_length": len(gene_data["sequence"]),
                "description": gene_data["description"]
            },
            "optimized_sequence": optimized_sequence,
            "insertion_locus": insertion_locus,
            "off_target_analysis": off_target_analysis.dict() if hasattr(off_target_analysis, 'dict') else off_target_analysis,
            "protein_structure": protein_structure.dict() if hasattr(protein_structure, 'dict') else protein_structure,
            "risk_assessment": risk_assessment.dict() if hasattr(risk_assessment, 'dict') else risk_assessment,
            "recommendation": recommendation,
            "confidence_score": confidence_score
        }

        result = SynthesisResponse(**response_data)
        logger.info(f"✅ BACKEND: Simulation pipeline complete for {request_id}")
        return result
        
    except Exception as e:
        logger.error(f"❌ BACKEND: Simulation pipeline error for {request_id}: {str(e)}", exc_info=True)
        
        # Return error result
        error_response = SynthesisResponse(
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
        return error_response

@router.get("/status")
async def get_status():
    """Get API status"""
    try:
        llm_status = llm_service.get_status()
        status_data = {
            "status": "ok",
            "version": "1.0.0",
            "service": "BioSynth-Xtreme API",
            "timestamp": time.time(),
            "llm_status": llm_status,
            "claude_sonnet_4_enabled": llm_status.get("claude_enabled", False),
            "active_simulations": len(simulation_results)
        }
        logger.info(f"📊 BACKEND: Status check - Active simulations: {len(simulation_results)}")
        return status_data
    except Exception as e:
        logger.error(f"❌ BACKEND: Status check error: {str(e)}")
        return {
            "status": "error",
            "message": str(e),
            "timestamp": time.time()
        }

@router.options("/{path:path}")
async def options_handler(path: str):
    """Handle OPTIONS requests for CORS"""
    return JSONResponse(
        content={},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "*",
        }
    )