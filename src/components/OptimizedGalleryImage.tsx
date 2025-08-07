import React, { useState } from 'react';
import { useOptimizedImageLoader } from '../hooks/useOptimizedImageLoader';
import { Image, Loader2 } from 'lucide-react';

interface OptimizedGalleryImageProps {
  src: string;
  alt: string;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
  placeholder?: React.ReactNode;
  showLoadingIndicator?: boolean;
}

const OptimizedGalleryImage: React.FC<OptimizedGalleryImageProps> = ({
  src,
  alt,
  className = '',
  onLoad,
  onError,
  placeholder,
  showLoadingIndicator = true
}) => {
  const [hasError, setHasError] = useState(false);
  
  const {
    ref,
    isLoading,
    isLoaded,
    isInView
  } = useOptimizedImageLoader(src, {
    threshold: 0.1,
    rootMargin: '100px',
    enablePreload: true
  });

  const handleLoad = () => {
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Placeholder por defecto
  const defaultPlaceholder = (
    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
      <Image size={32} className="text-gray-400" />
    </div>
  );

  // Si hay error, mostrar placeholder
  if (hasError) {
    return (
      <div className={`w-full h-full bg-gray-100 flex items-center justify-center ${className}`}>
        <div className="text-center">
          <Image size={24} className="text-gray-400 mx-auto mb-2" />
          <p className="text-xs text-gray-500">Error al cargar</p>
        </div>
      </div>
    );
  }

  // Si no está en vista, mostrar placeholder
  if (!isInView) {
    return (
      <div className={`w-full h-full bg-gray-100 flex items-center justify-center ${className}`}>
        {placeholder || defaultPlaceholder}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Indicador de carga */}
      {isLoading && showLoadingIndicator && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
          <Loader2 size={20} className="text-gray-400 animate-spin" />
        </div>
      )}

      {/* Imagen */}
      <img
        ref={ref}
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
      />

      {/* Placeholder mientras carga */}
      {!isLoaded && !isLoading && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          {placeholder || defaultPlaceholder}
        </div>
      )}
    </div>
  );
};

export default OptimizedGalleryImage;
