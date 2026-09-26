import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Maximize2, ShieldCheck, ZoomIn, Layers } from 'lucide-react';
import { Product } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface CylinderAngleViewerProps {
  product: Product;
  className?: string;
}

export const CylinderAngleViewer: React.FC<CylinderAngleViewerProps> = ({
  product,
  className = '',
}) => {
  const { currentLanguage } = useLanguage();
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Primary authentic high-resolution product image
  const primaryImageSrc =
    product.image ||
    product.images?.referenceReal ||
    product.images?.front ||
    '/products/11 Liter/DSC08566-1-scaled.webp';

  const productName = product.locales[currentLanguage]?.name || product.id;

  return (
    <div className={`flex flex-col ${className}`}>
      {/* 4:3 Aspect Ratio Image Card - Desktop Hover Full-Height Preview */}
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label={`${productName} - ${currentLanguage === 'fa' ? 'پیش‌نمایش ۱۰۰٪ ارتفاع با هاور' : '100% full-height preview on hover'}`}
        className="relative w-full aspect-[4/3] rounded-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-[#050C10] border border-slate-800/80 overflow-hidden shadow-inner flex items-center justify-center p-3 group transition-all duration-300 hover:border-emerald-500/50 hover:shadow-emerald-950/30 hover:shadow-lg select-none"
      >
        {/* Subtle Ambient Lighting on Desktop */}
        <div className="hidden lg:block absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(34,197,94,0.08)_0%,transparent_70%)] pointer-events-none" />
        <div className="hidden lg:block absolute bottom-3 inset-x-8 h-8 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.8)_0%,transparent_75%)] pointer-events-none rounded-full" />

        {/* Capacity badge */}
        <div className="absolute top-3 start-3 z-10 bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-xl border border-slate-700/80 shadow-md text-[11px] font-mono font-bold text-slate-200">
          {product.volume} {product.volumeUnit}
        </div>

        {/* Hover indicator badge */}
        <div className="absolute top-3 end-3 z-10 opacity-70 group-hover:opacity-100 transition-opacity bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-700/80 shadow-md text-slate-300 group-hover:text-emerald-400">
          <Maximize2 className="w-3.5 h-3.5" />
        </div>

        {/* Main Product Image */}
        <div className="relative w-full h-full flex items-center justify-center p-1 overflow-hidden">
          {!imageLoaded && (
            <div className="absolute inset-4 rounded-xl bg-slate-800/30 animate-pulse flex items-center justify-center pointer-events-none">
              <div className="w-16 h-28 rounded-2xl bg-slate-700/20" />
            </div>
          )}

          <img
            src={primaryImageSrc}
            alt={productName}
            width={400}
            height={300}
            style={{ aspectRatio: '4/3' }}
            referrerPolicy="no-referrer"
            loading="lazy"
            decoding="async"
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              const target = e.currentTarget;
              if (!target.src.includes('DSC08566-1-scaled.webp')) {
                target.src = '/products/11 Liter/DSC08566-1-scaled.webp';
              }
              setImageLoaded(true);
            }}
            className={`max-w-full max-h-full object-contain transition-transform duration-300 ease-out group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </div>

        {/* Bottom hover bar prompt */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent py-2 px-3 flex items-center justify-center gap-1.5 text-[11px] text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <ZoomIn className="w-3.5 h-3.5 text-emerald-400" />
          <span>{currentLanguage === 'fa' ? 'نمایش ۱۰۰٪ ارتفاع با هاور موس' : '100% full-height on hover'}</span>
        </div>
      </div>

      {/* 100% VIEWPORT HEIGHT DESKTOP HOVER OVERLAY PORTAL */}
      {isHovered &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-[99999] pointer-events-none flex flex-col items-center justify-between p-3 sm:p-5 bg-black/90 backdrop-blur-md animate-fadeIn"
            aria-hidden="true"
          >
            {/* Top Floating Info Bar */}
            <div className="w-full max-w-4xl flex items-center justify-between px-5 py-2.5 rounded-2xl bg-slate-900/95 border border-emerald-500/30 shadow-2xl backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
                    {productName}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {product.locales[currentLanguage]?.categoryLabel || 'LPG Cylinder'} • ISO 9001:2015 / EN 1442
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-mono font-bold text-emerald-400 bg-emerald-950/90 px-3 py-1 rounded-xl border border-emerald-700/50">
                  {product.volume} {product.volumeUnit}
                </span>
                <span className="hidden sm:inline-block text-[11px] font-mono text-amber-300 bg-amber-950/70 px-2.5 py-1 rounded-xl border border-amber-600/40">
                  30 Bar Hydrostatic
                </span>
              </div>
            </div>

            {/* Main High-Resolution Image at 100% Available Screen Height */}
            <div className="relative flex-1 w-full max-w-5xl flex items-center justify-center overflow-hidden my-1">
              <img
                src={primaryImageSrc}
                alt={productName}
                width={1200}
                height={1200}
                loading="eager"
                decoding="sync"
                className="h-[84vh] max-h-screen w-auto max-w-[94vw] object-contain drop-shadow-[0_25px_60px_rgba(0,0,0,0.98)] select-none"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Bottom Specs Strip */}
            <div className="w-full max-w-4xl flex flex-wrap items-center justify-center sm:justify-between gap-3 px-5 py-2.5 rounded-2xl bg-slate-900/95 border border-slate-800 shadow-2xl backdrop-blur-md text-xs text-slate-300">
              <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] sm:text-xs">
                <span className="bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                  {currentLanguage === 'fa' ? 'فشار تست:' : 'Test Pressure:'}{' '}
                  <strong className="text-emerald-400">{product.testPressureBar} Bar</strong>
                </span>
                <span className="bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                  {currentLanguage === 'fa' ? 'ارتفاع:' : 'Height:'}{' '}
                  <strong className="text-white">{product.heightCm} cm</strong>
                </span>
                <span className="bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                  {currentLanguage === 'fa' ? 'قطر:' : 'Diameter:'}{' '}
                  <strong className="text-white">{product.circleDiameterCm} cm</strong>
                </span>
                <span className="bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                  {currentLanguage === 'fa' ? 'وزن بدنه:' : 'Tare Weight:'}{' '}
                  <strong className="text-white">{product.emptyWeightKg} kg</strong>
                </span>
              </div>

              <div className="text-[11px] text-slate-400 font-medium">
                {currentLanguage === 'fa'
                  ? 'پیش‌نمایش ۱۰۰٪ ارتفاع (با کنار رفتن موس بسته می‌شود)'
                  : '100% full-height preview (closes on mouse leave)'}
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
