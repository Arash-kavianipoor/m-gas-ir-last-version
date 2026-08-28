import React, { useEffect, useRef, useState, ReactNode } from 'react';

export interface GlowCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: 'gold' | 'amber' | 'emerald' | 'green' | 'blue' | 'purple' | 'red' | 'orange';
  size?: 'sm' | 'md' | 'lg';
  width?: string | number;
  height?: string | number;
  customSize?: boolean;
}

const glowGradients: Record<string, { gradient: string; innerGlow: string; shadow: string; borderFallback: string }> = {
  gold: {
    gradient: 'radial-gradient(320px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), #FDE047 0%, #F59E0B 35%, #D97706 65%, transparent 100%)',
    innerGlow: 'radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(251, 191, 36, 0.07) 0%, rgba(245, 158, 11, 0.03) 45%, transparent 80%)',
    shadow: 'lg:hover:shadow-[0_12px_40px_-5px_rgba(245,158,11,0.28)]',
    borderFallback: 'bg-slate-800/90 lg:group-hover/glowcard:bg-amber-500/30',
  },
  amber: {
    gradient: 'radial-gradient(320px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), #FCD34D 0%, #F59E0B 40%, #B45309 70%, transparent 100%)',
    innerGlow: 'radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(245, 158, 11, 0.07) 0%, rgba(217, 119, 6, 0.03) 45%, transparent 80%)',
    shadow: 'lg:hover:shadow-[0_12px_40px_-5px_rgba(245,158,11,0.25)]',
    borderFallback: 'bg-slate-800/90 lg:group-hover/glowcard:bg-amber-600/30',
  },
  emerald: {
    gradient: 'radial-gradient(320px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), #6EE7B7 0%, #10B981 40%, #047857 70%, transparent 100%)',
    innerGlow: 'radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(52, 211, 153, 0.06) 0%, rgba(16, 185, 129, 0.02) 45%, transparent 80%)',
    shadow: 'lg:hover:shadow-[0_12px_40px_-5px_rgba(16,185,129,0.25)]',
    borderFallback: 'bg-slate-800/90 lg:group-hover/glowcard:bg-emerald-600/30',
  },
  green: {
    gradient: 'radial-gradient(320px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), #86EFAC 0%, #22C55E 40%, #15803D 70%, transparent 100%)',
    innerGlow: 'radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(74, 222, 128, 0.06) 0%, rgba(34, 197, 94, 0.02) 45%, transparent 80%)',
    shadow: 'lg:hover:shadow-[0_12px_40px_-5px_rgba(34,197,94,0.25)]',
    borderFallback: 'bg-slate-800/90 lg:group-hover/glowcard:bg-green-600/30',
  },
  blue: {
    gradient: 'radial-gradient(320px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), #93C5FD 0%, #3B82F6 40%, #1D4ED8 70%, transparent 100%)',
    innerGlow: 'radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(96, 165, 250, 0.06) 0%, rgba(59, 130, 246, 0.02) 45%, transparent 80%)',
    shadow: 'lg:hover:shadow-[0_12px_40px_-5px_rgba(59,130,246,0.25)]',
    borderFallback: 'bg-slate-800/90 lg:group-hover/glowcard:bg-blue-600/30',
  },
  purple: {
    gradient: 'radial-gradient(320px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), #D8B4FE 0%, #A855F7 40%, #6B21A8 70%, transparent 100%)',
    innerGlow: 'radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(192, 132, 252, 0.06) 0%, rgba(168, 85, 247, 0.02) 45%, transparent 80%)',
    shadow: 'lg:hover:shadow-[0_12px_40px_-5px_rgba(168,85,247,0.25)]',
    borderFallback: 'bg-slate-800/90 lg:group-hover/glowcard:bg-purple-600/30',
  },
  red: {
    gradient: 'radial-gradient(320px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), #FCA5A5 0%, #EF4444 40%, #B91C1C 70%, transparent 100%)',
    innerGlow: 'radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(248, 113, 113, 0.06) 0%, rgba(239, 68, 68, 0.02) 45%, transparent 80%)',
    shadow: 'lg:hover:shadow-[0_12px_40px_-5px_rgba(239,68,68,0.25)]',
    borderFallback: 'bg-slate-800/90 lg:group-hover/glowcard:bg-red-600/30',
  },
  orange: {
    gradient: 'radial-gradient(320px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), #FDBA74 0%, #F97316 40%, #C2410C 70%, transparent 100%)',
    innerGlow: 'radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(251, 146, 60, 0.06) 0%, rgba(249, 115, 22, 0.02) 45%, transparent 80%)',
    shadow: 'lg:hover:shadow-[0_12px_40px_-5px_rgba(249,115,22,0.25)]',
    borderFallback: 'bg-slate-800/90 lg:group-hover/glowcard:bg-orange-600/30',
  },
};

const sizeMap = {
  sm: 'w-full sm:w-48 min-h-64',
  md: 'w-full sm:w-64 min-h-80',
  lg: 'w-full sm:w-80 min-h-96',
};

export const GlowCard: React.FC<GlowCardProps> = ({
  children,
  className = '',
  glowColor = 'gold',
  size = 'md',
  width,
  height,
  customSize = true,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    // Only enable interactive spotlight on desktop screens (>=1024px and pointer fine)
    const checkIsDesktop = () => {
      const isWideScreen = window.innerWidth >= 1024;
      const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
      setIsDesktop(isWideScreen && hasFinePointer);
    };

    checkIsDesktop();
    window.addEventListener('resize', checkIsDesktop, { passive: true });

    const handlePointerMove = (e: PointerEvent) => {
      if (!cardRef.current || !isDesktop) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      cardRef.current.style.setProperty('--mouse-x', `${x.toFixed(1)}px`);
      cardRef.current.style.setProperty('--mouse-y', `${y.toFixed(1)}px`);
    };

    const card = cardRef.current;
    if (card && isDesktop) {
      card.addEventListener('pointermove', handlePointerMove, { passive: true });
    }

    return () => {
      window.removeEventListener('resize', checkIsDesktop);
      if (card) {
        card.removeEventListener('pointermove', handlePointerMove);
      }
    };
  }, [isDesktop]);

  const colorConfig = glowGradients[glowColor] || glowGradients.gold;

  const getSizeClasses = () => {
    if (customSize) {
      return '';
    }
    return sizeMap[size];
  };

  const getInlineStyles = (): React.CSSProperties => {
    const baseStyles: any = {
      position: 'relative',
    };

    if (width !== undefined) {
      baseStyles.width = typeof width === 'number' ? `${width}px` : width;
    }
    if (height !== undefined) {
      baseStyles.height = typeof height === 'number' ? `${height}px` : height;
    }

    return baseStyles;
  };

  // Ultra-lightweight direct render on Mobile & Tablet (prevents GPU memory spikes and compositor tearing)
  if (!isDesktop) {
    return (
      <div
        className={`w-full rounded-2xl bg-slate-900 border border-slate-800/80 shadow-md ${className}`}
        style={width || height ? { width, height } : undefined}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      ref={cardRef}
      data-glow
      style={getInlineStyles()}
      className={`
        ${getSizeClasses()}
        group/glowcard
        relative
        p-[3px]
        rounded-3xl
        ${colorConfig.borderFallback}
        transition-all
        duration-300
        hover:-translate-y-1
        ${colorConfig.shadow}
        overflow-hidden
      `}
    >
      {/* Dynamic 3px Border Spotlight - ONLY on Desktop */}
      <div
        className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 group-hover/glowcard:opacity-100 transition-opacity duration-200 z-0"
        style={{
          background: colorConfig.gradient,
        }}
      />

      {/* Inner Card Container */}
      <div
        className={`
          relative
          z-10
          w-full
          h-full
          rounded-[calc(1.5rem-3px)]
          bg-slate-900
          transition-colors
          duration-300
          overflow-hidden
          ${className}
        `}
      >
        {/* Subtle Ambient Background Mouse Glow (very gentle, soft depth) - ONLY on Desktop */}
        <div
          className="pointer-events-none absolute inset-0 opacity-0 group-hover/glowcard:opacity-100 transition-opacity duration-300 z-0"
          style={{
            background: colorConfig.innerGlow,
          }}
        />

        {/* Card Content */}
        <div className="relative z-10 w-full h-full flex flex-col justify-between">
          {children}
        </div>
      </div>
    </div>
  );
};
