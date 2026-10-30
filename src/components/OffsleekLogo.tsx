import React from 'react';
import originalLogo from '../assets/OFFSLEEK Floating Molecule Logo.png';

interface OffsleekLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

/**
 * Shared OFFSLEEK Brand Logo Component
 * References the authentic original uploaded logo asset: "OFFSLEEK Floating Molecule Logo.png"
 * Used consistently across login, dashboard, sidebar, receipts, and future modules.
 */
export const OffsleekLogo: React.FC<OffsleekLogoProps> = ({ className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-8 sm:h-9 w-auto',
    md: 'h-14 sm:h-16 lg:h-20 w-auto',
    lg: 'h-18 sm:h-20 lg:h-24 w-auto',
    xl: 'h-20 sm:h-24 lg:h-26 xl:h-28 w-auto',
    '2xl': 'h-28 sm:h-32 lg:h-36 xl:h-40 w-auto',
  }[size];

  return (
    <div className={`inline-flex items-center select-none ${className}`} aria-label="OFFSLEEK">
      <img
        src={originalLogo}
        alt="OFFSLEEK"
        className={`${sizeClasses} object-contain object-left max-w-full`}
        referrerPolicy="no-referrer"
        loading="eager"
        decoding="sync"
      />
    </div>
  );
};
