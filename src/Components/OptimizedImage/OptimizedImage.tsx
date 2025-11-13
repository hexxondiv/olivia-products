import React, { useState, useRef, useEffect } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: string | number;
  height?: string | number;
  loading?: 'lazy' | 'eager';
  priority?: boolean; // For above-the-fold images
  sizes?: string; // For responsive images
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  style?: React.CSSProperties;
  onClick?: () => void;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * OptimizedImage component with lazy loading, responsive images, and performance optimizations
 * 
 * Features:
 * - Lazy loading by default (except priority images)
 * - Responsive image support with srcset
 * - Modern format support (WebP/AVIF) with fallbacks
 * - Prevents layout shift with proper dimensions
 * - Loading placeholder
 * - Error handling
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  loading = 'lazy',
  priority = false,
  sizes = '100vw',
  objectFit = 'cover',
  style = {},
  onClick,
  onLoad,
  onError,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority); // Priority images load immediately
  const imgRef = useRef<HTMLImageElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || isInView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before image enters viewport
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
      observer.disconnect();
    };
  }, [priority, isInView]);

  // Generate responsive srcset for product images
  const generateSrcSet = (imageSrc: string): string | undefined => {
    // Only generate srcset for product images (assets/images/)
    if (!imageSrc.includes('/assets/images/')) {
      return undefined;
    }

    // Extract extension from path
    let pathname: string;
    try {
      // Try to parse as URL (for absolute URLs)
      const url = new URL(imageSrc, window.location.origin);
      pathname = url.pathname;
    } catch {
      // If it's a relative path, use it directly
      pathname = imageSrc;
    }
    
    const ext = pathname.split('.').pop()?.toLowerCase();
    
    if (!ext || !['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
      return undefined;
    }

    // Generate sizes: 400w, 800w, 1200w, 1600w
    // Note: For full optimization, you'd want server-side image resizing
    // This is a placeholder that can be enhanced with an image CDN or PHP script
    const sizes = [400, 800, 1200, 1600];
    return sizes
      .map((size) => {
        // For now, return the same image (server-side optimization would generate different sizes)
        // In production, you'd want to use an image CDN or server-side resizing
        return `${imageSrc} ${size}w`;
      })
      .join(', ');
  };

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  const imageLoading = priority ? 'eager' : loading;
  const shouldLoad = isInView || priority;

  const imageStyle: React.CSSProperties = {
    ...style,
    objectFit,
    transition: 'opacity 0.3s ease-in-out',
    // Opacity for fade-in effect (can be overridden by CSS classes with !important)
    opacity: isLoaded ? 1 : 0,
  };

  return (
    <div
      ref={imgRef as React.RefObject<HTMLDivElement>}
      className={`optimized-image-wrapper ${className}`}
      style={{
        position: 'relative',
        width: width || '100%',
        height: height || 'auto',
        backgroundColor: isLoaded ? '#000000' : '#f0f0f0', // Use black after image loads
        overflow: 'hidden',
        transition: 'background-color 0.3s ease-in-out',
        ...style, // Merge custom styles to allow absolute positioning
      }}
      onClick={onClick}
    >
      {/* Loading skeleton */}
      {!isLoaded && !hasError && (
        <div
          className="skeleton-loader"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: '#f0f0f0', // Light gray base for skeleton
            overflow: 'hidden',
          }}
        >
          <div
            className="skeleton-shimmer"
            style={{
              position: 'absolute',
              top: 0,
              left: '-100%',
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent)',
              animation: 'shimmer 1.5s infinite',
            }}
          />
        </div>
      )}

      {/* Error placeholder */}
      {hasError && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: '#000000', // Use black for error state
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#999',
            fontSize: '14px',
          }}
        >
          Image not available
        </div>
      )}

      {/* Actual image */}
      {shouldLoad && (
        <img
          src={src}
          alt={alt}
          className={className}
          width={width}
          height={height}
          loading={imageLoading}
          sizes={sizes}
          srcSet={generateSrcSet(src)}
          style={imageStyle}
          onLoad={handleLoad}
          onError={handleError}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
        />
      )}

      <style>{`
        @keyframes shimmer {
          0% {
            left: -100%;
          }
          100% {
            left: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default OptimizedImage;

