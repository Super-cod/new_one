# services/__init__.py
from .ncbi_client import NCBIClient, ncbi_client
from .protein_folding import ProteinFoldingService, protein_folder
from .llm_service import LLMService, llm_service

__all__ = [
    'NCBIClient',
    'ncbi_client',
    'ProteinFoldingService',
    'protein_folder',
    'LLMService',
    'llm_service'
]