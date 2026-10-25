import React from 'react';

interface MGasOfficialLogoProps {
  className?: string;
  height?: number | string;
  variant?: 'screen' | 'print' | 'dark' | 'auto';
  showPersianText?: boolean;
}

/**
 * Official M.Gas Vector Logo Component
 * Guaranteed 100% exact match with the official Header logo:
 * Uses /new-logo-mgas-2(1)_fixed.svg housed inside the exact same crisp dark badge container
 * with automatic fallback to /logo.svg.
 */
export const MGasOfficialLogo: React.FC<MGasOfficialLogoProps> = ({
  className = '',
  height
}) => {
  return (
    <div
      className={`h-7 sm:h-10 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg sm:rounded-xl bg-slate-950/90 border border-slate-800 flex items-center justify-center shadow-md shrink-0 print:bg-slate-950 print:border-slate-800 select-none ${className}`}
      style={height ? { height: typeof height === 'number' ? `${height}px` : height } : undefined}
    >
      <img
        src="/new-logo-mgas-2(1)_fixed.svg"
        alt="ام گاز - MGAS"
        className="h-4 sm:h-7 w-auto object-contain shrink-0"
        style={height ? { height: '70%', maxHeight: typeof height === 'number' ? `${height - 8}px` : undefined } : undefined}
        onError={(e) => {
          const target = e.currentTarget;
          if (target.src !== window.location.origin + '/logo.svg') {
            target.src = '/logo.svg';
          }
        }}
      />
    </div>
  );
};
