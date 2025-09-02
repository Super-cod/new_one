// Core API Types
export interface SynthesisRequest {
  host_organism: string;
  desired_trait: string;
  optimize: boolean;
  safety_check: boolean;
}

export interface GeneData {
  name: string;
  species: string;
  ncbi_id: string;
  sequence: string;
  sequence_length: number;
  description: string;
}

export interface OffTargetAnalysis {
  sites_found: number;
  warnings: string[];
}

export interface ProteinStructure {
  pdb_data: string;
  structure_confidence: number;
}

export interface RiskAssessment {
  overall_risk: 'low' | 'medium' | 'high';
  safety_score: number;
  warnings: string[];
}

export interface SynthesisResponse {
  request_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  gene: GeneData;
  optimized_sequence: string;
  insertion_locus: string;
  off_target_analysis: OffTargetAnalysis;
  protein_structure: ProteinStructure;
  risk_assessment: RiskAssessment;
  recommendation: string;
  confidence_score: number;
}

// UI State Types
export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

export interface ErrorState {
  hasError: boolean;
  message?: string;
  code?: string;
}

// Form Types
export interface FormErrors {
  host_organism?: string;
  desired_trait?: string;
  general?: string;
}

export interface FormState {
  data: SynthesisRequest;
  errors: FormErrors;
  isSubmitting: boolean;
}
