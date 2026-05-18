
import React, { useState, useEffect } from 'react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** 
   * Fallback image URL when the primary src fails.
   * Defaults to a generic Icons8 cloud image or a placeholder service.
   */
  fallback?: string;
  /** 
   * Alternative text for when the primary source should show original word text on fallback.
   */
  fallbackText?: string;
}

/**
 * A robust image component that handles:
 * 1. Image loading errors with fallbacks
 * 2. Referrer policy for external icon services (Icons8)
 * 3. Default dimensions to prevent layout shift
 * 4. Lazy loading by default
 */
const SafeImage: React.FC<SafeImageProps> = ({ 
  src, 
  alt, 
  fallback,
  fallbackText,
  className,
  style,
  ...props 
}) => {
  const [imgSrc, setImgSrc] = useState<string | undefined>(src);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    setImgSrc(src);
    setIsError(false);
  }, [src]);

  const handleError = () => {
    if (isError) return; // Prevent infinite loop if fallback also fails
    
    setIsError(true);
    
    if (fallback) {
      setImgSrc(fallback);
    } else if (fallbackText) {
      // Use a consistent placeholder service with the text
      setImgSrc(`https://placehold.co/200x200/6366f1/ffffff?text=${encodeURIComponent(fallbackText)}`);
    } else {
      // Default generic fallback
      setImgSrc('https://img.icons8.com/clouds/200/image.png');
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt || 'image'}
      className={className}
      style={{
        display: 'block',
        minWidth: props.width || '1px',
        minHeight: props.height || '1px',
        ...style
      }}
      onError={handleError}
      referrerPolicy="no-referrer"
      loading="lazy"
      {...props}
    />
  );
};

export default SafeImage;
