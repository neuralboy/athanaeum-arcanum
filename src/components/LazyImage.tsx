import React, { useState } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  aspectRatio?: string;
}

export default function LazyImage({ src, alt, className = "", containerClassName = "", aspectRatio = "aspect-[3/4]" }: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className={`relative overflow-hidden bg-surface-container-highest ${aspectRatio} ${containerClassName}`}>
      {/* Placeholder / Loading State */}
      {!isLoaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface-container-highest animate-pulse">
          <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface-container-highest text-outline text-[10px] uppercase tracking-widest px-4 text-center">
          Image Unavailable
        </div>
      )}

      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        onError={() => setError(true)}
        className={`w-full h-full object-cover transition-all duration-1000 ease-out ${className} ${
          isLoaded ? 'opacity-100 blur-0 scale-100' : 'opacity-0 blur-xl scale-110'
        }`}
        referrerPolicy="no-referrer"
      />

      {/* Editorial Overlay (Optional, can be passed via children if needed, but keeping it simple for now) */}
      <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/40 to-transparent pointer-events-none" />
    </div>
  );
}
