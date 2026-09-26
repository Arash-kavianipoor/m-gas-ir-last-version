import React from 'react';
import { LanguageCode } from '../types';

interface FlagIconProps {
  code: LanguageCode | string;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

export const FlagIcon: React.FC<FlagIconProps> = ({ code, className = '', size = 'sm' }) => {
  const sizeClasses = {
    xs: 'w-4 h-3',
    sm: 'w-5 h-3.5',
    md: 'w-6 h-4',
    lg: 'w-7 h-5',
  }[size] || 'w-5 h-3.5';

  const normalizedCode = code.toLowerCase();

  const renderFlag = () => {
    switch (normalizedCode) {
      case 'fa':
      case 'ir':
        // Flag of Iran
        return (
          <svg viewBox="0 0 630 420" className="w-full h-full object-cover">
            <rect width="630" height="140" fill="#239F40" />
            <rect y="140" width="630" height="140" fill="#FFFFFF" />
            <rect y="280" width="630" height="140" fill="#DA0000" />
            {/* Center Emblem of Iran in Red */}
            <g transform="translate(315, 210) scale(0.62)">
              <path
                d="M0,-85 C-12,-45 -48,-15 -48,25 C-48,55 -25,75 0,78 C25,75 48,55 48,25 C48,-15 12,-45 0,-85 Z"
                fill="#DA0000"
              />
              <path
                d="M0,-72 C-8,-38 -38,-12 -38,22 C-38,48 -18,65 0,68 C18,65 38,48 38,22 C38,-12 8,-38 0,-72 Z"
                fill="#FFFFFF"
              />
              <path
                d="M0,-60 C-5,-30 -28,-8 -28,20 C-28,40 -12,54 0,56 C12,54 28,40 28,20 C28,-8 5,-30 0,-60 Z"
                fill="#DA0000"
              />
              <circle cx="0" cy="-6" r="10" fill="#FFFFFF" />
              <path d="M-4,-70 L4,-70 L4,70 L-4,70 Z" fill="#DA0000" />
              <path d="M-20,-75 Q0,-95 20,-75 Q0,-82 -20,-75 Z" fill="#DA0000" />
            </g>
          </svg>
        );

      case 'en':
      case 'gb':
      case 'uk':
        // Flag of the United Kingdom (Union Jack)
        return (
          <svg viewBox="0 0 60 30" className="w-full h-full object-cover">
            <clipPath id="s">
              <path d="M0,0 v30 h60 v-30 z" />
            </clipPath>
            <clipPath id="t">
              <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
            </clipPath>
            <g clipPath="url(#s)">
              <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
              <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
              <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#t)" stroke="#C8102E" strokeWidth="4" />
              <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
              <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
            </g>
          </svg>
        );

      case 'ar':
      case 'sa':
        // Flag of Saudi Arabia
        return (
          <svg viewBox="0 0 600 400" className="w-full h-full object-cover">
            <rect width="600" height="400" fill="#006C35" />
            {/* Arabic Script Shahada representation & Sword */}
            <g fill="#FFFFFF">
              {/* Stylized Shahada calligraphy bar */}
              <path d="M150,150 Q180,130 220,150 T300,140 T380,155 T450,140 Q430,170 380,165 T300,175 T210,160 Q170,175 150,150 Z" />
              <path d="M180,120 L195,120 L195,185 L180,185 Z" />
              <path d="M240,115 L255,115 L255,185 L240,185 Z" />
              <path d="M310,115 L325,115 L325,185 L310,185 Z" />
              <path d="M365,120 L380,120 L380,185 L365,185 Z" />
              <path d="M415,125 L430,125 L430,185 L415,185 Z" />
              {/* Sword */}
              <path d="M160,230 L420,230 L440,225 L435,235 L420,235 L160,235 Z" />
              <path d="M430,220 L445,230 L430,240 Z" />
              <circle cx="160" cy="232.5" r="8" />
              <rect x="175" y="222" width="6" height="21" rx="2" />
            </g>
          </svg>
        );

      case 'de':
        // Flag of Germany
        return (
          <svg viewBox="0 0 5 3" className="w-full h-full object-cover">
            <rect width="5" height="1" y="0" fill="#000000" />
            <rect width="5" height="1" y="1" fill="#DD0000" />
            <rect width="5" height="1" y="2" fill="#FFCE00" />
          </svg>
        );

      case 'ur':
      case 'pk':
        // Flag of Pakistan
        return (
          <svg viewBox="0 0 600 400" className="w-full h-full object-cover">
            <rect width="600" height="400" fill="#115740" />
            <rect width="150" height="400" fill="#FFFFFF" />
            <g transform="translate(375, 200) rotate(-40)">
              <circle cx="0" cy="0" r="90" fill="#FFFFFF" />
              <circle cx="28" cy="-5" r="80" fill="#115740" />
              <polygon
                points="42,-25 47,-8 65,-8 50,3 56,20 42,9 28,20 34,3 19,-8 37,-8"
                fill="#FFFFFF"
                transform="rotate(20 42 0)"
              />
            </g>
          </svg>
        );

      case 'hy':
      case 'am':
        // Flag of Armenia
        return (
          <svg viewBox="0 0 6 3" className="w-full h-full object-cover">
            <rect width="6" height="1" y="0" fill="#D90012" />
            <rect width="6" height="1" y="1" fill="#0033A0" />
            <rect width="6" height="1" y="2" fill="#F2A800" />
          </svg>
        );

      case 'tr':
        // Flag of Turkey
        return (
          <svg viewBox="0 0 600 400" className="w-full h-full object-cover">
            <rect width="600" height="400" fill="#E30A17" />
            {/* White Crescent */}
            <circle cx="250" cy="200" r="100" fill="#FFFFFF" />
            <circle cx="275" cy="200" r="80" fill="#E30A17" />
            {/* White 5-point Star */}
            <g transform="translate(365, 200) rotate(-20) scale(0.65)">
              <polygon
                points="0,-60 18,-18 60,-18 25,8 37,50 0,25 -37,50 -25,8 -60,-18 -18,-18"
                fill="#FFFFFF"
              />
            </g>
          </svg>
        );

      case 'ru':
        // Flag of Russia
        return (
          <svg viewBox="0 0 6 3" className="w-full h-full object-cover">
            <rect width="6" height="1" y="0" fill="#FFFFFF" />
            <rect width="6" height="1" y="1" fill="#0039A6" />
            <rect width="6" height="1" y="2" fill="#D52B1E" />
          </svg>
        );

      default:
        return (
          <div className="w-full h-full bg-slate-700 flex items-center justify-center text-[9px] font-bold text-white uppercase">
            {normalizedCode.slice(0, 2)}
          </div>
        );
    }
  };

  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 overflow-hidden rounded-[3px] shadow-[0_1px_3px_rgba(0,0,0,0.3)] ring-1 ring-white/30 ${sizeClasses} ${className}`}
      aria-hidden="true"
    >
      {renderFlag()}
    </div>
  );
};
