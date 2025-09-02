'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingPage } from '@/components/shared/loading-page';
import { ErrorBoundary } from '@/components/shared/error-boundary';
import { VideoBackground } from '@/components/shared/video-background';
import { GeneInfoCard } from '@/components/results/gene-info-card';
import { SequenceDisplay } from '@/components/results/sequence-display';
import { OffTargetAnalysis } from '@/components/results/off-target-analysis';
import { SynthesisResponse } from '@/lib/types';

// Mock data for demonstration - replace with actual API call
const generateMockResult = (requestId: string): SynthesisResponse => ({
  request_id: requestId,
  status: 'completed',
  gene: {
    name: 'BGLAP',
    species: 'homo_sapiens',
    ncbi_id: 'NM_199173.6',
    sequence: 'ATGAAAGCCCTCACACTCCTCGCCCTATTGGCCCTGATGCTCCTCCTTCCCAGCCTGTTATGCTTCAAACCTAAAATAGAAGACCCAGGCGCAGAAGTTGGAGCAGCTAAGAGGGAGAGCCTGGCAGGTACAGTCTGAAAATTCAGGCTCAAGCCCCAGTACATCCAGTTTGAGGGAGGAGCTACATTGAAACAGAATCTTTGATTATCCAGTATAACGTGGGAACAGGGATCCCTAAAAGACAAGTCCATTCTGGAGAAATTCTGGGTGGGGTGGAGGATCTCTGAGAAAAGGAGGTCTGGGTTGATCCCCAGAACTCTAAAGCCTTCTTTCCCTGGGTTAGGAAAGGATGAGCTAACAAGTACTATGAGGGGGAGGATTGGAGACCTCCTTAATTCCAGAGAGGTGTTGAACTTTTGTCCTCCCAGACATACTCCACCTACCAGATATTTTAACAGGGTACAGTACGAGACTTATTCCTAGAGACAGAGTTTCTTAGTGATGATTATGGGTCCTTCTCAGAAGAATAGACCTGGTTTGATCTCAGATGGGGCCCGGGTGGCATTTGACTGGGAGGCTCAGGCTACAATTAGCCATCGGTGGCTACGCTGTGACCCCTGATGTCCAGGAGACGCCACAGGCCACAGATGGAACTGGATGAGGGAAAGAGAGGACCAAGGTAGAGGAGCCTGGGTAAGACGGGGTTTAACTGGAATAAGAGGGTCAGAGAAGGGATCAACGTTTCCACCGTAAATGATGATGGATTTCCTGGCACTGCTGGAAATAGGGGTCCTCCCTGTAAGAACGTGGAGAGCAGAGTCTTGGATTTGGTGAAGGGTCATGCTACCCTGGGGCAAGGTCAGATCCTGAAGCAAATTGCTTTCTTTCCTGGGTAAGACAAGGTGATGCTTATGAAATGGAGGAACTGAGTAAGAGGAGTTAGAAGAGGAGGTGTTGAACTTTTGTCCACCCCAGACATACTCCACCTACCAGATATTTTAACAGGGTACAGTACGAGACTTATTCCTAGAGACAGAGTTTCTTAGTGATGATTATGGGTCCTTCTCAGAAGAATAGACCTGGTTTGATCTCAGATGGGGCCCGGGTGGCATTTGACTGGGAGGCTCAGGCTACAATTAGCCATCGGTGGCTACGCTGTGACCCCTGATGTCCAGGAGACGCCACAGGCCACAGATGGAACTGGATGAGGGAAAGAGAGGACCAAGGTAGAGGAGCCTGGGTAAGACGGGGTTTAACTGGAATAAGAGGGTCAGAGAAGGGATCAACGTTTCCACCGTAAATGATGATGGATTTCCTGGCACTGCTGGAAATAGGGGTCCTCCCTGTAAGAACGTGGAGAGCAGAGTCTTGGATTTGGTGAAGGGTCATGCTACCCTGGGGCAAGGTCAGATCCTGAAGCAAATTGCTTTCTTTCCTGGGTAAGACAAGGTGATGCTTATGAAATGGAGGAACTGAGTAAGAGGAGTTAGAAGAGGAGGTGTTGAACTTTTGTCCACCCCAGACATACTCCACCTACCAGATATTTTAACAGGGTACAGTACGAGACTTATTCCTAGAGACAGAGTTTCTTAGTGATGATTATGGGTCCTTCTCAGAAGAATAGACCTGGTTTGATCTCAGATGGGGCCCGGGTGGCATTTGACTGGGAGGCTCAGGCTACAATTAGCCATCGGTGGCTACGCTGTGACCCCTGATGTCCAGGAGACGCCACAGGCCACAGATGGAACTGGATGAGGGAAAGAGAGGACCAAGGTAGAGGAGCCTGGGTAAGACGGGGTTTAACTGGAATAAGAGGGTCAGAGAAGGGATCAACGTTTCCACCGTAAATGATGATGGATTTCCTGGCACTGCTGGAAATAGGGGTCCTCCCTGTAAGAACGTGGAGAGCAGAGTCTTGGATTTGGTGAAGGGTCATGCTACCCTGGGGCAAGGTCAGATCCTGAAGCAAATTGCTTTCTTTCCTGGGTAAGACAAGGTGATGCTTATGAAATGGAGGAACTGAGTAAGAGGAGTTAGAAGAGGAGGTGTTGAACTTTTGTCCACCCCAGACATACTCCACCTACCAGATATTTTAACAGGGTACAGTACGAGACTTATTCCTAGAGACAGAGTTTCTTAGTGATGATTATGGGTCCTTCTCAGAAGAATAGACCTGGTTTGATCTCAGATGGGGCCCGGGTGGCATTTGACTGGGAGGCTCAGGCTACAATTAGCCATCGGTGGCTACGCTGTGACCCCTGATGTCCAGGAGACGCCACAGGCCACAGATGGAACTGGATGAGGGAAAGAGAGGACCAAGGTAGAGGAGCCTGGGTAAGACGGGGTTTAACTGGAATAAGAGGGTCAGAGAAGGGATCAACGTTTCCACCGTAAATGATGATGGATTTCCTGGCACTGCTGGAAATAGGGGTCCTCCCTGTAAGAACGTGGAGAGCAGAGTCTTGGATTTGGTGAAGGGTCATGCTACCCTGGGGCAAGGTCAGATCCTGAAGCAAATTGCTTTCTTTCCTGGGTAAGACAAGGTGATGCTTATGAAATGGAGGAACTGAGTAAGAGGAGTTAGAAGAGGAGGTGTTGAACTTTTGTCCTCCCAGACATACTCCACCTACCAGATATTTTAACAGGGTACAGTACGAGACTTATTCCTAGAGACAGAGTTTCTTAGTGATGATTATGGGTCCTTCTCAGAAGAATAGACCTGGTTTGATCTCAGATGGGGCCCGGGTGGCATTTGACTGGGAGGCTCAGGCTACAATTAGCCATCGGTGGCTACGCTGTGACCCCTGATGTCCAGGAGACGCCACAGGCCACAGATGGAACTGGATGAGGGAAAGAGAGGACCAAGGTAGAGGAGCCTGGGTAAGACGGGGTTTAACTGGAATAAGAGGGTCAGAGAAGGGATCAACGTTTCCACCGTAAATGATGATGGATTTCCTGGCACTGCTGGAAATAGGGGTCCTCCCTGTAAGAACGTGGAGAGCAGAGTCTTGGATTTGGTGAAGGGTCATGCTACCCTGGGGCAAGGTCAGATCCTGAAGCAAATTGCTTTCTTTCCTGGGTAAGACAAGGTGATGCTTATGAAATGGAGGAACTGAG',
    sequence_length: 2847,
    description: 'Bone gamma-carboxyglutamate protein (osteocalcin) - a hormone produced by osteoblasts that regulates bone formation and mineralization'
  },
  optimized_sequence: 'ATGAAAGCCCTCACACTCCTCGCCCTATTGGCCCTGATGCTCCTCCTTCCCAGCCTGTTATGCTTCAAACCTAAAATAGAAGACCCAGGCGCAGAAGTTGGAGCAGCTAAGAGGGAGAGCCTGGCAGGTACAGTCTGAAAATTCAGGCTCAAGCCCCAGTACATCCAGTTTGAGGGAGGAGCTACATTGAAACAGAATCTTTGATTATCCAGTATAACGTGGGAACAGGGATCCCTAAAAGACAAGTCCATTCTGGAGAAATTCTGGGTGGGGTGGAGGATCTCTGAGAAAAGGAGGTCTGGGTTGATCCCCAGAACTCTAAAGCCTTCTTTCCCTGGGTTAGGAAAGGATGAGCTAACAAGTACTATGAGGGGGAGGATTGGAGACCTCCTTAATTCCAGAGAGGTGTTGAACTTTTGTCCTCCCAGACATACTCCACCTACCAGATATTTTAACAGGGTACAGTACGAGACTTATTCCTAGAGACAGAGTTTCTTAGTGATGATTATGGGTCCTTCTCAGAAGAATAGACCTGGTTTGATCTCAGATGGGGCCCGGGTGGCATTTGACTGGGAGGCTCAGGCTACAATTAGCCATCGGTGGCTACGCTGTGACCCCTGATGTCCAGGAGACGCCACAGGCCACAGATGGAACTGGATGAGGGAAAGAGAGGACCAAGGTAGAGGAGCCTGGGTAAGACGGGGTTTAACTGGAATAAGAGGGTCAGAGAAGGGATCAACGTTTCCACCGTAAATGATGATGGATTTCCTGGCACTGCTGGAAATAGGGGTCCTCCCTGTAAGAACGTGGAGAGCAGAGTCTTGGATTTGGTGAAGGGTCATGCTACCCTGGGGCAAGGTCAGATCCTGAAGCAAATTGCTTTCTTTCCTGGGTAAGACAAGGTGATGCTTATGAAATGGAGGAACTGAGTAAGAGGAGTTAGAAGAGGAGGTGTTGAACTTTTGTCCACCCCAGACATACTCCACCTACCAGATATTTTAACAGGGTACAGTACGAGACTTATTCCTAGAGACAGAGTTTCTTAGTGATGATTATGGGTCCTTCTCAGAAGAATAGACCTGGTTTGATCTCAGATGGGGCCCGGGTGGCATTTGACTGGGAGGCTCAGGCTACAATTAGCCATCGGTGGCTACGCTGTGACCCCTGATGTCCAGGAGACGCCACAGGCCACAGATGGAACTGGATGAGGGAAAGAGAGGACCAAGGTAGAGGAGCCTGGGTAAGACGGGGTTTAACTGGAATAAGAGGGTCAGAGAAGGGATCAACGTTTCCACCGTAAATGATGATGGATTTCCTGGCACTGCTGGAAATAGGGGTCCTCCCTGTAAGAACGTGGAGAGCAGAGTCTTGGATTTGGTGAAGGGTCATGCTACCCTGGGGCAAGGTCAGATCCTGAAGCAAATTGCTTTCTTTCCTGGGTAAGACAAGGTGATGCTTATGAAATGGAGGAACTGAGTAAGAGGAGTTAGAAGAGGAGGTGTTGAACTTTTGTCCACCCCAGACATACTCCACCTACCAGATATTTTAACAGGGTACAGTACGAGACTTATTCCTAGAGACAGAGTTTCTTAGTGATGATTATGGGTCCTTCTCAGAAGAATAGACCTGGTTTGATCTCAGATGGGGCCCGGGTGGCATTTGACTGGGAGGCTCAGGCTACAATTAGCCATCGGTGGCTACGCTGTGACCCCTGATGTCCAGGAGACGCCACAGGCCACAGATGGAACTGGATGAGGGAAAGAGAGGACCAAGGTAGAGGAGCCTGGGTAAGACGGGGTTTAACTGGAATAAGAGGGTCAGAGAAGGGATCAACGTTTCCACCGTAAATGATGATGGATTTCCTGGCACTGCTGGAAATAGGGGTCCTCCCTGTAAGAACGTGGAGAGCAGAGTCTTGGATTTGGTGAAGGGTCATGCTACCCTGGGGCAAGGTCAGATCCTGAAGCAAATTGCTTTCTTTCCTGGGTAAGACAAGGTGATGCTTATGAAATGGAGGAACTGAGTAAGAGGAGTTAGAAGAGGAGGTGTTGAACTTTTGTCCTCCCAGACATACTCCACCTACCAGATATTTTAACAGGGTACAGTACGAGACTTATTCCTAGAGACAGAGTTTCTTAGTGATGATTATGGGTCCTTCTCAGAAGAATAGACCTGGTTTGATCTCAGATGGGGCCCGGGTGGCATTTGACTGGGAGGCTCAGGCTACAATTAGCCATCGGTGGCTACGCTGTGACCCCTGATGTCCAGGAGACGCCACAGGCCACAGATGGAACTGGATGAGGGAAAGAGAGGACCAAGGTAGAGGAGCCTGGGTAAGACGGGGTTTAACTGGAATAAGAGGGTCAGAGAAGGGATCAACGTTTCCACCGTAAATGATGATGGATTTCCTGGCACTGCTGGAAATAGGGGTCCTCCCTGTAAGAACGTGGAGAGCAGAGTCTTGGATTTGGTGAAGGGTCATGCTACCCTGGGGCAAGGTCAGATCCTGAAGCAAATTGCTTTCTTTCCTGGGTAAGACAAGGTGATGCTTATGAAATGGAGGAACTGAG',
  insertion_locus: 'Chr12:13,042,354',
  off_target_analysis: {
    sites_found: 2,
    warnings: ['Potential off-target site detected on chromosome 7', 'Consider additional validation for chromosome 12 site']
  },
  protein_structure: {
    pdb_data: 'mock_pdb_data',
    structure_confidence: 0.87
  },
  risk_assessment: {
    overall_risk: 'medium',
    safety_score: 0.78,
    warnings: ['Monitor for unexpected bone density changes', 'Regular calcium level monitoring recommended']
  },
  recommendation: 'This genetic modification shows promising potential for enhancing bone density. The moderate risk profile suggests proceeding with careful monitoring and staged implementation. Consider pilot studies in cell culture before animal models.',
  confidence_score: 0.85
});

export function OutputPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const requestId = searchParams.get('id');
  
  const [result, setResult] = useState<SynthesisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!requestId) {
      setError('No request ID provided');
      setLoading(false);
      return;
    }

    // In demo mode, we can load results immediately with minimal delay
    // Just enough time to show the loading page briefly
    const timer = setTimeout(() => {
      try {
        const mockResult = generateMockResult(requestId);
        setResult(mockResult);
      } catch {
        setError('Failed to load results');
      } finally {
        setLoading(false);
      }
    }, 500); // Reduced from 1500ms to 500ms

    return () => clearTimeout(timer);
  }, [requestId]);

  if (loading) {
    return (
      <LoadingPage />
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertDescription>
                {error || 'Results not found'}
              </AlertDescription>
            </Alert>
            <Button onClick={() => router.push('/')} className="w-full">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <VideoBackground 
        videoSrc="/videos/dna-background-2.mp4"
        className="min-h-screen"
        overlay={false}
        saturation={120}
      >
        <div className="min-h-screen py-8 px-4">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Header with stronger background */}
            <div className="text-center bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-white/50 shadow-2xl">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Synthesis Results
              </h1>
              <p className="text-gray-700">Request ID: {result.request_id}</p>
              <div className="mt-4">
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  result.status === 'completed' 
                    ? 'bg-green-100/80 text-green-800 border border-green-200' 
                    : 'bg-yellow-100/80 text-yellow-800 border border-yellow-200'
                }`}>
                  {result.status.charAt(0).toUpperCase() + result.status.slice(1)}
                </span>
              </div>
            </div>

            {/* Main Results Grid with stronger backgrounds */}
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-white/50 shadow-2xl">
                <GeneInfoCard 
                  gene={result.gene} 
                  confidenceScore={result.confidence_score}
                />
              </div>
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-white/50 shadow-2xl">
                <OffTargetAnalysis analysis={result.off_target_analysis} />
              </div>
            </div>

            {/* Sequence Display - Full Width with stronger background */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-white/50 shadow-2xl">
              <SequenceDisplay 
                originalSequence={result.gene.sequence}
                optimizedSequence={result.optimized_sequence}
                insertionLocus={result.insertion_locus}
              />
            </div>

            {/* Recommendation with stronger background */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-white/50 shadow-2xl p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Expert Recommendation</h3>
              <p className="text-gray-700 leading-relaxed">
                {result.recommendation}
              </p>
            </div>

            {/* Actions with stronger background */}
            <div className="flex justify-center space-x-4 bg-white/80 backdrop-blur-lg rounded-xl p-4 border border-white/50 shadow-xl">
              <Button 
                onClick={() => router.push('/')} 
                variant="outline" 
                className="bg-white/50 backdrop-blur-sm border-white/30 hover:bg-white/70"
              >
                New Analysis
              </Button>
              <Button 
                onClick={() => window.print()}
                className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white border-none"
              >
                Download Report
              </Button>
            </div>
          </div>
        </div>
      </VideoBackground>
    </ErrorBoundary>
  );
}