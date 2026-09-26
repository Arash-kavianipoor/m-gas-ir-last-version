import React from 'react';
import { LanguageCode } from '../types';

interface FlagIconProps {
  code: LanguageCode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const FLAGS: Record<LanguageCode, string> = {
  en: '🇬🇧',
  fa: '🇮🇷',
  ar: '🇸🇦',
  de: '🇩🇪',
  ur: '🇵🇰',
  hy: '🇦🇲',
  tr: '🇹🇷',
  ru: '🇷🇺',
};

export const FlagIcon: React.FC<FlagIconProps> = ({ code, size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
  };

  return (
    <span
      className={`inline-flex items-center justify-center select-none ${sizeClasses[size]} ${className}`}
      role="img"
      aria-label={`${code} flag`}
    >
      {FLAGS[code] || '🌐'}
    </span>
  );
};
