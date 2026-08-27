import React, { useEffect, useRef, useState, ReactNode } from 'react';
import { detectDevice } from '../utils/deviceDetection';

export interface GlowCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: 'blue' | 'purple' | 'green' | 'red' | 'orange';
  size?: 'sm' | 'md' | 'lg';
  width?: string | number;
  height?: string | number;
  customSize?: boolean;
}

const glowColorMap = {
  blue: { base: 220, spread: 200 },
  purple: { base: 280, spread: 300 },
  green: { base: 140, spread: 180 },
  red: { base: 0, spread: 200 },
  orange: { base: 30, spread: 200 }
};

const sizeMap = {
  sm: 'w-48 h-64',
  md: 'w-64 h-80',
  lg: 'w-80 h-96'
};

export const GlowCard: React.FC<GlowCardProps> = ({ 
  children, 
  className = '', 
  glowColor = 'green',
  size = 'md',
  width,
  height,
  customSize = false
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkIsDesktop = () => {
      const device = detectDevice();
      const isWideScreen = window.innerWidth >= 1024;
      const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
      setIsDesktop(!device.lowGpuMode && isWideScreen && hasFinePointer);
    };

    checkIsDesktop();
    window.addEventListener('resize', checkIsDesktop, { passive: true });

    const syncPointer = (e: PointerEvent) => {
      if (!cardRef.current || !isDesktop) return;
      const { clientX: x, clientY: y } = e;
      
      cardRef.current.style.setProperty('--x', x.toFixed(2));
      cardRef.current.style.setProperty('--xp', (x / window.innerWidth).toFixed(2));
      cardRef.current.style.setProperty('--y', y.toFixed(2));
      cardRef.current.style.setProperty('--yp', (y / window.innerHeight).toFixed(2));
    };

    if (isDesktop) {
      document.addEventListener('pointermove', syncPointer, { passive: true });
    }

    return () => {
      window.removeEventListener('resize', checkIsDesktop);
      document.removeEventListener('pointermove', syncPointer);
    };
  }, [isDesktop]);

  const { base, spread } = glowColorMap[glowColor] || glowColorMap.green;

  const getSizeClasses = () => {
    if (customSize) {
      return '';
    }
    return sizeMap[size];
  };

  const getInlineStyles = () => {
    // If on mobile/low-GPU device, return lightweight static style without dynamic gradients
    if (!isDesktop) {
      const mobileStyles: React.CSSProperties = {
        backgroundColor: '#0F172A',
        borderColor: 'rgba(51, 65, 85, 0.7)',
        position: 'relative',
      };
      if (width !== undefined) {
        mobileStyles.width = typeof width === 'number' ? `${width}px` : width;
      }
      if (height !== undefined) {
        mobileStyles.height = typeof height === 'number' ? `${height}px` : height;
      }
      return mobileStyles;
    }

    const baseStyles: React.CSSProperties & Record<string, any> = {
      '--base': base,
      '--spread': spread,
      '--radius': '24',
      '--border': '1',
      '--backdrop': 'rgba(15, 23, 42, 0.85)',
      '--backup-border': 'rgba(51, 65, 85, 0.5)',
      '--size': '260',
      '--outer': '1',
      '--border-size': 'calc(var(--border, 1) * 1px)',
      '--spotlight-size': 'calc(var(--size, 260) * 1px)',
      '--hue': 'calc(var(--base) + (var(--xp, 0) * var(--spread, 0)))',
      backgroundColor: 'var(--backdrop, rgba(15, 23, 42, 0.85))',
      border: '1px solid var(--backup-border)',
      position: 'relative',
      backgroundImage: `radial-gradient(
        var(--spotlight-size) var(--spotlight-size) at
        calc(var(--x, 0) * 1px)
        calc(var(--y, 0) * 1px),
        hsl(var(--hue, 140) 80% 60% / 0.15), transparent
      )`,
    };

    if (width !== undefined) {
      baseStyles.width = typeof width === 'number' ? `${width}px` : width;
    }
    if (height !== undefined) {
      baseStyles.height = typeof height === 'number' ? `${height}px` : height;
    }

    return baseStyles;
  };

  return (
    <div
      ref={cardRef}
      style={getInlineStyles()}
      className={`
        ${getSizeClasses()}
        rounded-2xl lg:rounded-3xl 
        relative 
        shadow-xl
        p-4 lg:p-5 
        ${isDesktop ? 'backdrop-blur-md' : 'border border-slate-700/80'}
        transition-colors duration-200
        ${className}
      `}
    >
      <div ref={innerRef} className="relative z-10 w-full h-full flex flex-col">
        {children}
      </div>
    </div>
  );
};

