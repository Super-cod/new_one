'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SynthesisForm } from '@/components/forms/synthesis-form';
import { ErrorBoundary } from '@/components/shared/error-boundary';
import { VideoBackground } from '@/components/shared/video-background';
import { LoadingPage } from '@/components/shared/loading-page';

export function InputLanding() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSuccess = (requestId: string) => {
    // Don't set processing to false immediately, let the navigation happen
    // with the loading state still active for smoother transition
    router.push(`/results?id=${requestId}`);
  };

  if (isProcessing) {
    return (
      <LoadingPage 
        message="Analyzing your genetic modification request. Our AI is processing the DNA sequences, optimizing codons, and performing comprehensive safety analysis..."
      />
    );
  }

  return (
    <ErrorBoundary>
      <VideoBackground 
        videoSrc="/videos/dna-background-2.mp4"
        className="min-h-screen"
        overlay={false}
        saturation={100}
      >
        <div className="min-h-screen py-12 px-4">
          <div className="max-w-2xl mx-auto">
            {/* Header with stronger background */}
            <div className="text-center mb-8 bg-white/80 backdrop-blur-lg rounded-2xl p-8 border border-white/50 shadow-2xl">
              <h1 className="text-4xl font-heading font-bold text-slate-800 mb-4">
                Welcome to <span className="text-genetic-600">Xeno-Synth</span>
              </h1>
              <p className="text-lg text-slate-600 max-w-xl mx-auto font-medium">
                Advanced genetic modification synthesis platform for designing safe and effective genetic interventions
              </p>
            </div>
            
            {/* Form with stronger background */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-white/50 shadow-2xl">
              <SynthesisForm 
                onSuccess={handleSuccess} 
                onSubmitStart={() => setIsProcessing(true)}
                onError={() => setIsProcessing(false)}
              />
            </div>
          </div>
        </div>
      </VideoBackground>
    </ErrorBoundary>
  );
}