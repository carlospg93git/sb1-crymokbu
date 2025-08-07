import { useState, useEffect, useCallback, useRef } from 'react';

interface UseOptimizedImageLoaderOptions {
  threshold?: number;
  rootMargin?: string;
  enablePreload?: boolean;
}

interface ImageLoadState {
  isLoading: boolean;
  isLoaded: boolean;
  hasError: boolean;
  isInView: boolean;
}

export const useOptimizedImageLoader = (
  src: string,
  options: UseOptimizedImageLoaderOptions = {}
) => {
  const {
    threshold = 0.1,
    rootMargin = '50px',
    enablePreload = true
  } = options;

  const [state, setState] = useState<ImageLoadState>({
    isLoading: false,
    isLoaded: false,
    hasError: false,
    isInView: false
  });

  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Función para cargar la imagen
  const loadImage = useCallback(() => {
    if (!src || state.isLoaded || state.isLoading) return;

    setState(prev => ({ ...prev, isLoading: true, hasError: false }));

    const img = new Image();
    
    img.onload = () => {
      setState(prev => ({
        ...prev,
        isLoading: false,
        isLoaded: true,
        hasError: false
      }));
    };

    img.onerror = () => {
      setState(prev => ({
        ...prev,
        isLoading: false,
        isLoaded: false,
        hasError: true
      }));
    };

    img.src = src;
  }, [src, state.isLoaded, state.isLoading]);

  // Configurar Intersection Observer para lazy loading
  useEffect(() => {
    if (!imgRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setState(prev => ({ ...prev, isInView: true }));
            loadImage();
            // Una vez que la imagen está en vista, desconectar el observer
            if (observerRef.current) {
              observerRef.current.disconnect();
            }
          }
        });
      },
      {
        threshold,
        rootMargin
      }
    );

    observerRef.current.observe(imgRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadImage, threshold, rootMargin]);

  // Preload de imágenes cuando están cerca del viewport
  useEffect(() => {
    if (!enablePreload || !src || state.isLoaded) return;

    const preloadObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !state.isInView) {
            // Preload la imagen cuando está cerca del viewport
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = src;
            document.head.appendChild(link);
          }
        });
      },
      {
        threshold: 0,
        rootMargin: '200px' // Preload cuando está a 200px del viewport
      }
    );

    if (imgRef.current) {
      preloadObserver.observe(imgRef.current);
    }

    return () => {
      preloadObserver.disconnect();
    };
  }, [src, state.isLoaded, state.isInView, enablePreload]);

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return {
    ref: imgRef,
    ...state,
    loadImage
  };
};

// Hook para manejar múltiples imágenes
export const useOptimizedGalleryLoader = (
  items: Array<{ key: string; thumbnailUrl: string; originalUrl: string }>,
  options: UseOptimizedImageLoaderOptions = {}
) => {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set());
  const [errorImages, setErrorImages] = useState<Set<string>>(new Set());

  const loadImage = useCallback((key: string, url: string) => {
    if (loadedImages.has(key) || loadingImages.has(key)) return;

    setLoadingImages(prev => new Set(prev).add(key));

    const img = new Image();
    
    img.onload = () => {
      setLoadedImages(prev => new Set(prev).add(key));
      setLoadingImages(prev => {
        const newSet = new Set(prev);
        newSet.delete(key);
        return newSet;
      });
    };

    img.onerror = () => {
      setErrorImages(prev => new Set(prev).add(key));
      setLoadingImages(prev => {
        const newSet = new Set(prev);
        newSet.delete(key);
        return newSet;
      });
    };

    img.src = url;
  }, [loadedImages, loadingImages]);

  const preloadOriginal = useCallback((key: string, originalUrl: string) => {
    if (loadedImages.has(key)) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = originalUrl;
      document.head.appendChild(link);
    }
  }, [loadedImages]);

  return {
    loadedImages,
    loadingImages,
    errorImages,
    loadImage,
    preloadOriginal,
    isImageLoaded: (key: string) => loadedImages.has(key),
    isImageLoading: (key: string) => loadingImages.has(key),
    isImageError: (key: string) => errorImages.has(key)
  };
};
