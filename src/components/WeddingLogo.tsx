import React, { useState, useEffect } from 'react';
import { getStoredCustomLogo, subscribeToLogoChanges } from '../utils/logoStorage';
import defaultLogoSvgUrl from '../assets/wedding-logo.svg';
import { DEFAULT_WEDDING_LOGO_DATA_URI } from '../assets/defaultLogoDataUri';

interface WeddingLogoProps {
  className?: string;
  alt?: string;
  onClick?: () => void;
  title?: string;
}

export const WeddingLogo: React.FC<WeddingLogoProps> = ({
  className = 'w-10 h-10',
  alt = 'កត់ត្រា - Wedding Record System Logo',
  onClick,
  title,
}) => {
  const [logoSrc, setLogoSrc] = useState<string>(() => {
    return getStoredCustomLogo() || defaultLogoSvgUrl || DEFAULT_WEDDING_LOGO_DATA_URI;
  });
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const unsub = subscribeToLogoChanges((newLogo) => {
      setLogoSrc(newLogo || defaultLogoSvgUrl || DEFAULT_WEDDING_LOGO_DATA_URI);
      setHasError(false);
    });
    return unsub;
  }, []);

  const handleImageError = () => {
    // If external/custom/asset fails to load (e.g. 404 on GitHub Pages), immediately fallback to embedded SVG Data URI
    if (!hasError) {
      setHasError(true);
      setLogoSrc(DEFAULT_WEDDING_LOGO_DATA_URI);
    }
  };

  return (
    <img
      src={hasError ? DEFAULT_WEDDING_LOGO_DATA_URI : logoSrc}
      alt={alt}
      title={title}
      onError={handleImageError}
      onClick={onClick}
      className={`object-contain select-none shrink-0 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      referrerPolicy="no-referrer"
    />
  );
};
