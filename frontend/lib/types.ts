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
  total_sites: number;
  high_risk_sites: number;
  sites: string[];
  warnings: string[];
}

export interface ProteinStructure {
  pdb_data: string;
  confidence_score: number;
  method: string;
}

export interface RiskAssessment {
  toxicity_score: number;
  immunogenicity_score: number;
  environmental_risk_score: number;
  recommendations: string[];
}

export interface SynthesisResponse {
  request_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  gene: GeneData;
  optimized_sequence: string | null;
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
