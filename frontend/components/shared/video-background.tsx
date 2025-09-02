'use client';

import { ReactNode } from 'react';

interface VideoBackgroundProps {
  children: ReactNode;
  videoSrc?: string;
  fallbackImage?: string;
  overlay?: boolean;
  className?: string;
  saturation?: number; // new prop
}

export function VideoBackground({ 
  children, 
  videoSrc, 
  fallbackImage = '/dna-background.jpg',
  overlay = true,
  className = '',
  saturation = 100, // default 100% (no change)
}: VideoBackgroundProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Video Background */}
      {videoSrc ? (
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ 
            filter: `saturate(${saturation}%)`,
            // Optimize for portrait video (2160x3840) on landscape screens
            objectPosition: 'center center',
            minWidth: '100%',
            minHeight: '100%'
          }}
        >
          <source src={videoSrc} type="video/mp4" />
          {/* Fallback for browsers that don't support video */}
          <div 
            className="absolute inset-0 w-full h-full bg-cover bg-center bg-gradient-to-br from-blue-100 via-purple-50 to-green-100"
            style={{ backgroundImage: `url(${fallbackImage})`, filter: `saturate(${saturation}%)` }}
          />
        </video>
      ) : (
        /* Placeholder for video */
        <div
          className="absolute inset-0 w-full h-full"
          style={{ filter: `saturate(${saturation}%)` }}
        >
          {/* Animated DNA/Molecular background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-purple-50 to-green-100">
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
              <div className="absolute top-3/4 right-1/4 w-64 h-64 bg-green-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-75"></div>
              <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-150"></div>
            </div>
            {/* DNA Helix Pattern */}
            <div className="absolute inset-0 opacity-10">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <pattern id="dna" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                    <circle cx="5" cy="5" r="1" fill="#3B82F6" opacity="0.3">
                      <animate attributeName="opacity" values="0.3;0.8;0.3" dur="3s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="15" cy="15" r="1" fill="#10B981" opacity="0.3">
                      <animate attributeName="opacity" values="0.8;0.3;0.8" dur="3s" repeatCount="indefinite" />
                    </circle>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#dna)" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Overlay */}
      {overlay && (
        <div className="absolute inset-0 bg-white/40 backdrop-blur-sm" />
      )}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Video Placeholder Instructions */}
      {!videoSrc && (
        <div className="absolute bottom-4 right-4 z-20">
          <div className="bg-black/50 text-white text-xs px-3 py-2 rounded-lg backdrop-blur-sm">
            <p className="font-medium">🎥 Video Placeholder</p>
            <p className="opacity-75">Add your video to /public/videos/</p>
          </div>
        </div>
      )}
    </div>
  );
}
