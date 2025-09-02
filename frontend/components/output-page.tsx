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
import { synthesisAPI } from '@/lib/api/synthesis-api';

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

    console.log(`🔍 Loading results for request ID: ${requestId}`);

    const loadResults = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Try to get results from the API (which checks sessionStorage first, then backend)
        console.log(`📡 Attempting to fetch results for ${requestId}...`);
        const fetchedResult = await synthesisAPI.getResult(requestId);
        
        console.log(`✅ Successfully loaded results for ${requestId}:`, fetchedResult);
        console.log(`🧬 Gene: ${fetchedResult.gene.name}, Status: ${fetchedResult.status}`);
        
        setResult(fetchedResult);
        
        // Check if this was from demo mode
        const demoMode = sessionStorage.getItem(`synthesis_mode_${requestId}`);
        if (demoMode === 'demo') {
          console.log('🎭 Results loaded from demo mode');
        } else {
          console.log('🔬 Results loaded from backend');
        }
        
      } catch (error) {
        console.error(`❌ Failed to load results for ${requestId}:`, error);
        
        // If we can't fetch the result, try one more time with a generated mock result
        // This is a last resort fallback
        try {
          const fallbackResult = generateFallbackResult(requestId);
          console.log(`🎭 Using fallback result for ${requestId}`);
          setResult(fallbackResult);
        } catch (fallbackError) {
          console.error('❌ Even fallback failed:', fallbackError);
          setError('Failed to load results. The analysis may have expired or not completed properly.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, [requestId]);

  if (loading) {
    return <LoadingPage />;
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
              
              {/* Show backend connection status */}
              <div className="mt-2 text-sm text-gray-600">
                {sessionStorage.getItem(`synthesis_mode_${requestId}`) === 'demo' ? (
                  <span className="text-blue-600">Demo Mode - Simulated Results</span>
                ) : (
                  <span className="text-green-600">Backend Connected - Real Analysis</span>
                )}
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

            {/* Risk Assessment */}
            {result.risk_assessment && (
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-white/50 shadow-2xl p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Risk Assessment</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {result.risk_assessment.toxicity_score !== undefined && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {(result.risk_assessment.toxicity_score * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">Toxicity Score</div>
                    </div>
                  )}
                  {result.risk_assessment.immunogenicity_score !== undefined && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {(result.risk_assessment.immunogenicity_score * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">Immunogenicity</div>
                    </div>
                  )}
                  {result.risk_assessment.environmental_risk_score !== undefined && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {(result.risk_assessment.environmental_risk_score * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">Environmental Risk</div>
                    </div>
                  )}
                </div>
                {result.risk_assessment.recommendations && result.risk_assessment.recommendations.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Safety Recommendations:</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {result.risk_assessment.recommendations.map((rec, index) => (
                        <li key={index} className="text-gray-700">{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Protein Structure */}
            {result.protein_structure && (
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-white/50 shadow-2xl p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Protein Structure Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Structure Confidence</h4>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(result.protein_structure.confidence_score || 0) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold">
                        {((result.protein_structure.confidence_score || 0) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Prediction Method</h4>
                    <span className="text-gray-700">{result.protein_structure.method || 'AlphaFold'}</span>
                  </div>
                </div>
              </div>
            )}

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

// Fallback function - only used if everything else fails
function generateFallbackResult(requestId: string): SynthesisResponse {
  console.log('🚨 Generating emergency fallback result');
  
  return {
    request_id: requestId,
    status: 'completed',
    gene: {
      name: 'FALLBACK_GENE',
      species: 'homo_sapiens',
      ncbi_id: 'NM_000000.1',
      sequence: 'ATGTCCAAACCTACAGTAAAAACCCTGGCCGACTAG',
      sequence_length: 36,
      description: 'Fallback gene sequence - results could not be loaded properly'
    },
    optimized_sequence: null,
    insertion_locus: 'Chr1:100000000',
    off_target_analysis: {
      total_sites: 0,
      high_risk_sites: 0,
      sites: [],
      warnings: ['Results could not be loaded properly']
    },
    protein_structure: {
      pdb_data: '',
      confidence_score: 0,
      method: 'N/A'
    },
    risk_assessment: {
      toxicity_score: 0,
      immunogenicity_score: 0,
      environmental_risk_score: 0,
      recommendations: ['Results could not be loaded - please try again']
    },
    recommendation: 'Results could not be loaded properly. Please return to the home page and try your analysis again.',
    confidence_score: 0
  };
}