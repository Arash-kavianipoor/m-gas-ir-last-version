import React from 'react';
import { LanguageCode } from '../types';

interface FlagIconProps {
  code: LanguageCode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const FlagIcon: React.FC<FlagIconProps> = ({ code, size = 'md', className = '' }) => {
  const sizeMap = {
    sm: 'w-5 h-3.5',
    md: 'w-6 h-4',
    lg: 'w-8 h-5.5',
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  const renderFlagSvg = () => {
    switch (code) {
      case 'fa': // Iran
        return (
          <svg viewBox="0 0 640 400" className="w-full h-full object-cover">
            <rect width="640" height="133.3" fill="#239f40" />
            <rect y="133.3" width="640" height="133.4" fill="#ffffff" />
            <rect y="266.7" width="640" height="133.3" fill="#da0000" />
            {/* National Emblem Center */}
            <g transform="translate(320, 200) scale(0.65)" fill="#da0000">
              <path d="M 0,-45 C 8,-30 18,-15 18,10 C 18,25 0,35 0,35 C 0,35 -18,25 -18,10 C -18,-15 -8,-30 0,-45 Z" />
              <path d="M 12,-20 C 35,0 42,25 24,42 C 16,35 15,22 10,12 Z" />
              <path d="M -12,-20 C -35,0 -42,25 -24,42 C -16,35 -15,22 -10,12 Z" />
              <path d="M 0,-52 L 2,-47 L -2,-47 Z" />
            </g>
          </svg>
        );

      case 'en': // United Kingdom (UK)
        return (
          <svg viewBox="0 0 640 400" className="w-full h-full object-cover">
            <clipPath id="uk-clip">
              <rect width="640" height="400" />
            </clipPath>
            <g clipPath="url(#uk-clip)">
              <rect width="640" height="400" fill="#012169" />
              <path d="M0,0 L640,400 M640,0 L0,400" stroke="#ffffff" strokeWidth="60" />
              <path d="M0,0 L640,400 M640,0 L0,400" stroke="#c8102e" strokeWidth="20" />
              <path d="M320,0 V400 M0,200 H640" stroke="#ffffff" strokeWidth="100" />
              <path d="M320,0 V400 M0,200 H640" stroke="#c8102e" strokeWidth="60" />
            </g>
          </svg>
        );

      case 'de': // Germany
        return (
          <svg viewBox="0 0 640 400" className="w-full h-full object-cover">
            <rect width="640" height="133.3" fill="#000000" />
            <rect y="133.3" width="640" height="133.4" fill="#dd0000" />
            <rect y="266.7" width="640" height="133.3" fill="#ffce00" />
          </svg>
        );

      case 'ar': // Saudi Arabia
        return (
          <svg viewBox="0 0 640 400" className="w-full h-full object-cover">
            <rect width="640" height="400" fill="#006C35" />
            {/* Arabic Shahada script & sword representation */}
            <g fill="#ffffff" transform="translate(320, 180) scale(0.7)">
              <path d="M-120,40 L120,40 L100,50 L-100,50 L-110,60 L-120,40 Z" />
              <circle cx="-125" cy="45" r="7" />
              {/* Symbolic inscription bar */}
              <rect x="-140" y="-50" width="280" height="20" rx="4" opacity="0.95" />
              <rect x="-120" y="-20" width="240" height="14" rx="3" opacity="0.95" />
            </g>
          </svg>
        );

      case 'tr': // Turkey
        return (
          <svg viewBox="0 0 640 400" className="w-full h-full object-cover">
            <rect width="640" height="400" fill="#e30a17" />
            <circle cx="260" cy="200" r="100" fill="#ffffff" />
            <circle cx="285" cy="200" r="80" fill="#e30a17" />
            {/* Star */}
            <polygon
              fill="#ffffff"
              points="380,200 345,212 358,177 358,223 345,188"
              transform="rotate(-15 360 200)"
            />
          </svg>
        );

      case 'ur': // Pakistan
        return (
          <svg viewBox="0 0 640 400" className="w-full h-full object-cover">
            <rect width="640" height="400" fill="#01411C" />
            <rect width="160" height="400" fill="#ffffff" />
            {/* Crescent and Star */}
            <g transform="translate(400, 200) rotate(-40)">
              <circle cx="0" cy="0" r="90" fill="#ffffff" />
              <circle cx="25" cy="-15" r="80" fill="#01411C" />
              <polygon
                fill="#ffffff"
                points="0,-45 13,-10 47,-10 20,10 30,45 0,25 -30,45 -20,10 -47,-10 -13,-10"
                transform="translate(40, -40) scale(0.55)"
              />
            </g>
          </svg>
        );

      case 'ru': // Russia
        return (
          <svg viewBox="0 0 640 400" className="w-full h-full object-cover">
            <rect width="640" height="133.3" fill="#ffffff" />
            <rect y="133.3" width="640" height="133.4" fill="#0039A6" />
            <rect y="266.7" width="640" height="133.3" fill="#D52B1E" />
          </svg>
        );

      case 'hy': // Armenia
        return (
          <svg viewBox="0 0 640 400" className="w-full h-full object-cover">
            <rect width="640" height="133.3" fill="#D90012" />
            <rect y="133.3" width="640" height="133.4" fill="#0033A0" />
            <rect y="266.7" width="640" height="133.3" fill="#F2A800" />
          </svg>
        );

      default:
        return (
          <svg viewBox="0 0 640 400" className="w-full h-full object-cover">
            <rect width="640" height="400" fill="#0f172a" />
            <circle cx="320" cy="200" r="100" fill="#10b981" />
          </svg>
        );
    }
  };

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-md border border-white/25 shadow-sm bg-slate-950 ${currentSize} ${className}`}
      role="img"
      aria-label={`${code} flag`}
    >
      {renderFlagSvg()}
    </span>
  );
};
