import aiohttp
import asyncio
from typing import Optional, Dict, Any
from Bio import Entrez, SeqIO
from io import StringIO
import xml.etree.ElementTree as ET

from core.config import settings

# Set up NCBI email
Entrez.email = settings.NCBI_EMAIL
if settings.NCBI_API_KEY:
    Entrez.api_key = settings.NCBI_API_KEY

class NCBIClient:
    def __init__(self):
        self.base_url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils"
        self.timeout = aiohttp.ClientTimeout(total=30)
    
    async def search_gene(self, query: str, organism: str, max_results: int = 5) -> list:
        """Search for genes related to a query in a specific organism"""
        try:
            search_handle = Entrez.esearch(
                db="gene", 
                term=f"{query}[Gene] AND {organism}[Organism]", 
                retmax=max_results
            )
            search_results = Entrez.read(search_handle)
            search_handle.close()
            return search_results.get("IdList", [])
        except Exception as e:
            print(f"Error searching gene: {e}")
            return []
    
    async def get_gene_info(self, gene_id: str) -> Optional[Dict[str, Any]]:
        """Get detailed information about a gene"""
        try:
            handle = Entrez.efetch(db="gene", id=gene_id, retmode="xml")
            records = Entrez.read(handle)
            handle.close()
            
            if not records:
                return None
                
            gene_info = records[0]
            return {
                "id": gene_id,
                "name": gene_info.get("Entrezgene_gene", {}).get("Gene-ref", {}).get("Gene-ref_locus", ""),
                "description": gene_info.get("Entrezgene_gene", {}).get("Gene-ref", {}).get("Gene-ref_desc", ""),
                "organism": gene_info.get("Entrezgene_source", {}).get("BioSource", {}).get("BioSource_org", {}).get("Org-ref", {}).get("Org-ref_taxname", "")
            }
        except Exception as e:
            print(f"Error fetching gene info: {e}")
            return None
    
    async def get_gene_sequence(self, gene_id: str) -> Optional[str]:
        """Get the nucleotide sequence for a gene"""
        try:
            # First get the nucleotide ID for the gene
            handle = Entrez.elink(dbfrom="gene", db="nucleotide", id=gene_id)
            link_results = Entrez.read(handle)
            handle.close()
            
            if not link_results or not link_results[0].get("LinkSetDb"):
                return None
                
            nuccore_ids = [link["Id"] for link in link_results[0]["LinkSetDb"][0]["Link"]]
            if not nuccore_ids:
                return None
                
            # Get the sequence for the first nucleotide ID
            handle = Entrez.efetch(db="nucleotide", id=nuccore_ids[0], rettype="fasta", retmode="text")
            sequence = handle.read()
            handle.close()
            
            return sequence
        except Exception as e:
            print(f"Error fetching gene sequence: {e}")
            return None
    
    async def get_protein_sequence(self, gene_id: str) -> Optional[str]:
        """Get the protein sequence for a gene"""
        try:
            # Link gene to protein
            handle = Entrez.elink(dbfrom="gene", db="protein", id=gene_id)
            link_results = Entrez.read(handle)
            handle.close()
            
            if not link_results or not link_results[0].get("LinkSetDb"):
                return None
                
            protein_ids = [link["Id"] for link in link_results[0]["LinkSetDb"][0]["Link"]]
            if not protein_ids:
                return None
                
            # Get the sequence for the first protein ID
            handle = Entrez.efetch(db="protein", id=protein_ids[0], rettype="fasta", retmode="text")
            sequence = handle.read()
            handle.close()
            
            return sequence
        except Exception as e:
            print(f"Error fetching protein sequence: {e}")
            return None

# Create a global instance
ncbi_client = NCBIClient()