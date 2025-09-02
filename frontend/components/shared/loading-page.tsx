'use client';

import { useEffect, useState } from 'react';

interface LoadingPageProps {
  message?: string;
  progress?: number;
}

const loadingMessages = [
  "Decoding genetic sequences...",
  "Optimizing codon usage...",
  "Analyzing protein folding...",
  "Performing safety validation...",
  "Computing off-target effects...",
  "Synthesizing recommendations...",
  "Finalizing analysis..."
];

export function LoadingPage({ 
  message, 
  progress 
}: LoadingPageProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [dots, setDots] = useState('');

  useEffect(() => {
    // Cycle through loading messages
    const messageInterval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2000);

    // Animate dots
    const dotsInterval = setInterval(() => {
      setDots((prev) => {
        if (prev.length >= 3) return '';
        return prev + '.';
      });
    }, 500);

    return () => {
      clearInterval(messageInterval);
      clearInterval(dotsInterval);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Full Screen Video Background */}
      <div className="absolute inset-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ 
            filter: 'brightness(0.7) saturate(120%)',
            // Optimize for portrait video (2160x3840) 
            objectPosition: 'center center',
            minWidth: '100%',
            minHeight: '100%'
          }}
        >
          <source src="/videos/dna-loading.mp4" type="video/mp4" />
          {/* Fallback animated background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-green-900">
            <div className="absolute inset-0 opacity-40">
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400 rounded-full mix-blend-screen filter blur-3xl animate-pulse"></div>
              <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-green-400 rounded-full mix-blend-screen filter blur-3xl animate-pulse delay-75"></div>
              <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-purple-400 rounded-full mix-blend-screen filter blur-3xl animate-pulse delay-150"></div>
            </div>
          </div>
        </video>
      </div>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="text-center max-w-2xl mx-auto">
          
          {/* Main DNA Animation */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              {/* Outer rotating ring */}
              <div className="w-32 h-32 border-4 border-blue-300/30 rounded-full animate-spin-slow"></div>
              
              {/* Inner rotating ring */}
              <div className="absolute inset-2 w-28 h-28 border-4 border-green-400/50 rounded-full animate-spin-reverse"></div>
              
              {/* DNA Helix in center */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-6xl animate-pulse text-white drop-shadow-lg">
                  🧬
                </div>
              </div>
              
              {/* Pulsing dots around */}
              <div className="absolute top-0 left-1/2 w-3 h-3 bg-blue-400 rounded-full animate-ping"></div>
              <div className="absolute bottom-0 left-1/2 w-3 h-3 bg-green-400 rounded-full animate-ping delay-75"></div>
              <div className="absolute left-0 top-1/2 w-3 h-3 bg-purple-400 rounded-full animate-ping delay-150"></div>
              <div className="absolute right-0 top-1/2 w-3 h-3 bg-yellow-400 rounded-full animate-ping delay-200"></div>
            </div>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-wide">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 bg-clip-text text-transparent animate-pulse">
              Synthesizing
            </span>
          </h1>

          {/* Animated Message */}
          <div className="mb-8">
            <p className="text-xl md:text-2xl text-blue-100 font-light animate-fade-in">
              {message || loadingMessages[currentMessageIndex]}
              <span className="text-blue-300">{dots}</span>
            </p>
          </div>

          {/* Progress Bar (if provided) */}
          {progress !== undefined && (
            <div className="mb-8 max-w-md mx-auto">
              <div className="flex justify-between text-sm text-blue-200 mb-2">
                <span>Analysis Progress</span>
                <span>{Math.round(progress * 100)}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3 backdrop-blur-sm">
                <div 
                  className="bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 h-3 rounded-full transition-all duration-500 shadow-lg"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Processing Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 max-w-4xl mx-auto">
            {[
              { icon: "🔬", text: "Sequence Analysis", color: "blue" },
              { icon: "⚗️", text: "Optimization", color: "green" },
              { icon: "🛡️", text: "Safety Check", color: "purple" },
              { icon: "📊", text: "Results", color: "yellow" }
            ].map((step, index) => (
              <div 
                key={index}
                className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20 animate-fade-in"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="text-2xl mb-2 animate-bounce" style={{ animationDelay: `${index * 0.3}s` }}>
                  {step.icon}
                </div>
                <p className="text-white text-sm font-medium">{step.text}</p>
                <div className={`w-full bg-white/20 rounded-full h-1 mt-2`}>
                  <div className={`bg-${step.color}-400 h-1 rounded-full animate-pulse`} style={{ width: '100%' }} />
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Info */}
          <div className="text-blue-200 text-sm space-y-1 bg-black/20 backdrop-blur-md rounded-lg p-4 border border-white/20">
            <p className="flex items-center justify-center space-x-2">
              <span>⏱️</span>
              <span>Advanced AI analysis in progress</span>
            </p>
            <p className="flex items-center justify-center space-x-2">
              <span>🤖</span>
              <span>Processing genetic modifications with safety validation</span>
            </p>
          </div>
        </div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-300 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>
    </div>
  );
}
