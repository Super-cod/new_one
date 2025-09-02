from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum

class Organism(str, Enum):
    HUMAN = "homo_sapiens"
    MOUSE = "mus_musculus"
    RAT = "rattus_norvegicus"
    ZEBRAFISH = "danio_rerio"
    FRUITFLY = "drosophila_melanogaster"
    E_COLI = "escherichia_coli"

class SynthesisRequest(BaseModel):
    host_organism: Organism
    desired_trait: str = Field(..., min_length=3, max_length=100)
    optimize: bool = True
    safety_check: bool = True

class GeneData(BaseModel):
    name: str
    species: str
    ncbi_id: str
    sequence: str
    sequence_length: int
    description: str

class OffTargetSite(BaseModel):
    sequence: str
    chromosome: str
    position: int
    mismatch_count: int
    potential_impact: str

class OffTargetAnalysis(BaseModel):
    total_sites: int
    high_risk_sites: int
    sites: List[OffTargetSite]
    warnings: List[str]

class ProteinStructure(BaseModel):
    pdb_data: str
    confidence_score: float
    method: str

class RiskAssessment(BaseModel):
    toxicity_score: float
    immunogenicity_score: float
    environmental_risk_score: float
    recommendations: List[str]

class SynthesisResponse(BaseModel):
    request_id: str
    status: str
    gene: GeneData
    optimized_sequence: Optional[str] = None
    insertion_locus: str
    off_target_analysis: OffTargetAnalysis
    protein_structure: ProteinStructure
    risk_assessment: RiskAssessment
    recommendation: str
    confidence_score: float