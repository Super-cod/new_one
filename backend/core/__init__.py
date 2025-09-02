# core/__init__.py
from .bioinformatics import BioinformaticsEngine
from .ai_services import AIService
from .config import settings
from .models import *

# Create global instances
bio_engine = BioinformaticsEngine()
ai_service = AIService()

__all__ = [
    'bio_engine',
    'ai_service',
    'settings',
    'SynthesisRequest',
    'SynthesisResponse',
    'Organism',
    'GeneData',
    'OffTargetSite',
    'OffTargetAnalysis',
    'ProteinStructure',
    'RiskAssessment'
]