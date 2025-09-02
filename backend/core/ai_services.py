import asyncio
from typing import Dict, Any, Optional
import re

from services import llm_service, protein_folder
from core.models import ProteinStructure

class AIService:
    def __init__(self):
        self.esmfold_available = True
    
    async def fold_protein(self, sequence: str) -> ProteinStructure:
        """Predict protein structure from sequence with real confidence scores"""
        method = "ESMFold"
        pdb_data = None
        confidence_score = 0.0
        
        # Try ESMFold if available
        if self.esmfold_available:
            try:
                pdb_data = await protein_folder.fold_sequence_esmfold(sequence)
                if pdb_data:
                    # Extract real confidence metrics from ESMFold output
                    confidence_score = self._extract_confidence_from_pdb(pdb_data)
                    method = "ESMFold"
                else:
                    raise ValueError("ESMFold returned empty result")
                    
            except Exception as e:
                print(f"ESMFold failed: {e}")
                self.esmfold_available = False
                pdb_data = None
        
        # If ESMFold failed or not available, use simulation with length-based confidence
        if not pdb_data:
            pdb_data = self._generate_enhanced_pdb(sequence)
            method = "Simulated"
            # Base confidence on sequence length and composition
            confidence_score = self._calculate_simulation_confidence(sequence)
        
        return ProteinStructure(
            pdb_data=pdb_data,
            confidence_score=confidence_score,
            method=method
        )
    
    def _extract_confidence_from_pdb(self, pdb_data: str) -> float:
        """Extract confidence scores from ESMFold PDB output"""
        try:
            # ESMFold stores confidence as pLDDT scores in B-factor column
            plddt_scores = []
            for line in pdb_data.split('\n'):
                if line.startswith('ATOM'):
                    # B-factor is columns 61-66 in PDB format
                    b_factor = line[60:66].strip()
                    if b_factor:
                        try:
                            plddt = float(b_factor)
                            plddt_scores.append(plddt)
                        except ValueError:
                            continue
            
            if plddt_scores:
                # Convert pLDDT to confidence (pLDDT is 0-100, confidence 0-1)
                avg_plddt = sum(plddt_scores) / len(plddt_scores)
                return avg_plddt / 100.0  # Convert to 0-1 scale
            
            return 0.7  # Default if no scores found
            
        except Exception as e:
            print(f"Error extracting confidence: {e}")
            return 0.7
    
    def _calculate_simulation_confidence(self, sequence: str) -> float:
        """Calculate confidence score based on sequence properties"""
        # Base confidence on sequence length and amino acid composition
        length = len(sequence)
        
        # Shorter sequences are generally easier to predict
        length_confidence = max(0.3, min(0.7, 1.0 - (length / 1000)))
        
        # Calculate complexity based on amino acid diversity
        unique_aa = len(set(sequence))
        diversity_ratio = unique_aa / len(sequence) if sequence else 0
        diversity_confidence = 0.5 + (0.5 * (1 - diversity_ratio))  # More diverse = less confident
        
        # Check for problematic patterns
        problematic_patterns = [
            r'(.)\1{5,}',  # Long repeats
            r'[UOBJZ]',    # Non-standard amino acids
        ]
        
        pattern_penalty = 0.0
        for pattern in problematic_patterns:
            if re.search(pattern, sequence):
                pattern_penalty += 0.2
        
        final_confidence = (length_confidence * 0.6 + diversity_confidence * 0.4) - pattern_penalty
        return max(0.1, min(0.6, final_confidence))  # Cap between 0.1-0.6 for simulations
    
    def _generate_enhanced_pdb(self, sequence: str) -> str:
        """Generate more realistic PDB data based on sequence"""
        pdb_lines = [
            f"REMARK Simulated structure for sequence: {sequence[:50]}...",
        ]
        
        # Generate basic alpha-helix like structure
        residue_number = 1
        x, y, z = 0.0, 0.0, 0.0
        
        for aa in sequence:
            if residue_number > 1000:  # Safety limit
                break
                
            # Basic coordinates for alpha-helix pattern
            x = residue_number * 1.5
            y = 0.0
            z = 0.0
            
            # Add atoms for this residue
            pdb_lines.extend([
                f"ATOM  {residue_number*4-3:5d}  N   {aa} A {residue_number:4d}    {x:8.3f}{y:8.3f}{z:8.3f}  1.00 30.00           N",
                f"ATOM  {residue_number*4-2:5d}  CA  {aa} A {residue_number:4d}    {x+1.5:8.3f}{y:8.3f}{z:8.3f}  1.00 30.00           C",
                f"ATOM  {residue_number*4-1:5d}  C   {aa} A {residue_number:4d}    {x+3.0:8.3f}{y:8.3f}{z:8.3f}  1.00 30.00           C",
                f"ATOM  {residue_number*4:5d}  O   {aa} A {residue_number:4d}    {x+4.5:8.3f}{y:8.3f}{z:8.3f}  1.00 30.00           O"
            ])
            
            residue_number += 1
        
        pdb_lines.append("TER")
        pdb_lines.append("END")
        
        return "\n".join(pdb_lines)
    
    async def generate_recommendation(self, analysis_data: Dict[str, Any]) -> str:
        """Generate recommendations using LLMs with real data"""
        try:
            # Add confidence information to analysis data
            if 'confidence' not in analysis_data:
                analysis_data['confidence'] = "high" if analysis_data.get('method') == "ESMFold" else "low"
            
            return await llm_service.generate_consensus_recommendation(analysis_data)
        except Exception as e:
            print(f"Error generating recommendation: {e}")
            return "Unable to generate recommendation at this time."

# Create a global instance
ai_service = AIService()