import React, { useState } from 'react';
import { Camera, Eye, RotateCw, Sparkles, ZoomIn, Palette, Image as ImageIcon, Cpu, Maximize2, X } from 'lucide-react';
import { Product } from '../types';
import { RalColor } from '../data/ralColors';
import { useLanguage } from '../i18n/LanguageContext';
import { getProductAnglePhoto } from '../data/productAngleImages';

interface CylinderAngleViewerProps {
  product: Product;
  selectedColor?: RalColor | null;
  activeAngle?: 'front' | 'perspective' | 'valveDetail' | 'real';
  onAngleChange?: (angle: 'front' | 'perspective' | 'valveDetail' | 'real') => void;
  showControls?: boolean;
  className?: string;
  onOpenColorPicker?: () => void;
}

export const CylinderAngleViewer: React.FC<CylinderAngleViewerProps> = ({
  product,
  selectedColor,
  activeAngle: controlledAngle,
  onAngleChange,
  showControls = true,
  className = '',
  onOpenColorPicker,
}) => {
  const { currentLanguage } = useLanguage();
  const [internalAngle, setInternalAngle] = useState<'front' | 'perspective' | 'valveDetail' | 'real'>('real');
  const [isZoomed, setIsZoomed] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [renderMode, setRenderMode] = useState<'photo' | 'cad'>('photo');
  const [imageLoaded, setImageLoaded] = useState(false);

  const activeAngle = controlledAngle ?? internalAngle;
  const setAngle = (angle: 'front' | 'perspective' | 'valveDetail' | 'real') => {
    setImageLoaded(false);
    if (onAngleChange) {
      onAngleChange(angle);
    } else {
      setInternalAngle(angle);
    }
  };

  const currentColorHex = selectedColor ? selectedColor.hex : product.cylinderColor;
  const currentRalCode = selectedColor ? selectedColor.code : (product.defaultRalCode || 'RAL 6018');

  // Angle labels in multiple languages
  const angleLabels = {
    real: {
      fa: 'عکس کارخانه (مرجع)',
      en: 'Factory Reference',
      icon: Camera,
    },
    front: {
      fa: 'زاویه ۱: نمای روبرو',
      en: 'Angle 1: Front View',
      icon: Eye,
    },
    perspective: {
      fa: 'زاویه ۲: پرسپکتیو ۳ بعدی',
      en: 'Angle 2: Perspective View',
      icon: RotateCw,
    },
    valveDetail: {
      fa: 'زاویه ۳: نمای کلوزآپ شیر و یقه',
      en: 'Angle 3: Valve & Collar Close-up',
      icon: Sparkles,
    },
  };

  // Resolve image for current angle
  const getAngleImageData = (): { src: string; isMacroZoom?: boolean } => {
    if (activeAngle === 'real') {
      return { src: product.image || product.images?.referenceReal || '/products/11 Liter/DSC08566-1-scaled.webp' };
    }

    // Realistic studio angle photo matching the reference cylinder
    const studioAnglePhoto = getProductAnglePhoto(product.category, product.volume, activeAngle);
    if (studioAnglePhoto) {
      return { src: studioAnglePhoto };
    }

    if (activeAngle === 'front') {
      return { src: product.images?.front || product.image || '/products/11 Liter/DSC08566-1-scaled.webp' };
    }
    if (activeAngle === 'perspective') {
      return { src: product.images?.perspective || product.images?.front || product.image || '/products/11 Liter/DSC08566-1-scaled.webp' };
    }
    if (activeAngle === 'valveDetail') {
      if (product.images?.valveDetail && product.images.valveDetail !== product.images.front) {
        return { src: product.images.valveDetail };
      }
      // Zoom focused on top valve/collar
      return { src: product.image || product.images?.front || '/products/11 Liter/DSC08566-1-scaled.webp', isMacroZoom: true };
    }
    return { src: product.image || '/products/11 Liter/DSC08566-1-scaled.webp' };
  };

  const currentImageInfo = getAngleImageData();
  const isSmallPicnic = product.volume <= 1.5;
  const isIndustrialTall = product.volume >= 25 && product.volume <= 60 && product.category === 'workshops';
  const isAutoLpg = product.category === 'automotive';

  return (
    <div className={`flex flex-col space-y-3 ${className}`}>
      {/* 4:3 Aspect Ratio Visualizer Box */}
      <div className="relative w-full aspect-[4/3] rounded-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-[#050C10] border border-slate-800/80 overflow-hidden shadow-inner flex items-center justify-center p-3 group">
        
        {/* Studio Lighting & Ambient Grid - ONLY ON DESKTOP */}
        <div
          className="hidden lg:block absolute inset-0 pointer-events-none transition-colors duration-500"
          style={{
            background: `radial-gradient(circle at 50% 45%, ${currentColorHex}22 0%, rgba(34,197,94,0.06) 40%, transparent 70%)`
          }}
        />
        <div className="hidden lg:block absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-30" />

        {/* Floor Horizon Line & Light Spot - ONLY ON DESKTOP */}
        <div className="hidden lg:block absolute bottom-4 inset-x-8 h-12 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.85)_0%,transparent_75%)] pointer-events-none rounded-full" />

        {/* Selected RAL Color Indicator Badge */}
        <div className="absolute top-3 start-3 z-20 flex items-center gap-2 bg-slate-900 px-2.5 py-1 rounded-full border border-slate-700/80 shadow-md text-[11px] font-mono text-slate-200">
          <span
            className="w-3 h-3 rounded-full border border-white/40 shadow-sm shrink-0"
            style={{ backgroundColor: currentColorHex }}
          />
          <span className="font-bold">{currentRalCode}</span>
          {onOpenColorPicker && (
            <button
              onClick={onOpenColorPicker}
              className="text-emerald-400 hover:text-emerald-300 transition-colors ms-1"
              title="Change RAL Color"
            >
              <Palette className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Angle Badge & Render Mode Switcher */}
        <div className="absolute top-3 end-3 z-20 flex items-center gap-1.5">
          <div className="bg-slate-900 px-2.5 py-1 rounded-full border border-slate-700/80 shadow-md text-[11px] text-slate-300 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 lg:animate-pulse" />
            <span>{currentLanguage === 'fa' ? angleLabels[activeAngle].fa : angleLabels[activeAngle].en}</span>
          </div>

          <button
            type="button"
            onClick={() => setRenderMode(renderMode === 'photo' ? 'cad' : 'photo')}
            className="p-1 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-emerald-400 border border-slate-700/80 shadow-md transition-colors text-[10px] px-2 flex items-center gap-1"
            title={renderMode === 'photo' ? 'Switch to Vector CAD Mode' : 'Switch to Realistic Photo Mode'}
          >
            {renderMode === 'photo' ? <Cpu className="w-3 h-3 text-emerald-400" /> : <ImageIcon className="w-3 h-3 text-amber-400" />}
            <span className="font-mono text-[9px] uppercase">{renderMode === 'photo' ? 'CAD' : 'Photo'}</span>
          </button>
        </div>

        {/* Content Render Area */}
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
          
          {/* ============= PHOTO RENDER MODE (DEFAULT & AUTHENTIC) ============= */}
          {renderMode === 'photo' && (
            <div className="relative w-full h-full flex items-center justify-center p-2 aspect-[4/3]">
              {/* Subtle Loading Skeleton placeholder before image finishes loading */}
              {!imageLoaded && (
                <div className="absolute inset-4 rounded-xl bg-slate-800/40 animate-pulse flex items-center justify-center pointer-events-none">
                  <div className="w-16 h-28 rounded-2xl bg-slate-700/30 border border-slate-600/20" />
                </div>
              )}

              <img
                src={currentImageInfo.src}
                alt={`${product.locales[currentLanguage]?.name || product.id} - ${activeAngle}`}
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
                className={`max-w-full max-h-full object-contain transition-opacity duration-300 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                } ${
                  isZoomed
                    ? 'scale-150'
                    : currentImageInfo.isMacroZoom
                    ? 'scale-[1.8] origin-top translate-y-6'
                    : 'lg:hover:scale-105'
                }`}
              />

              {/* Spec Overlay Pill */}
              <div className="absolute bottom-2 start-2 bg-slate-950/90 px-2 py-0.5 rounded-md text-[10px] font-mono text-slate-300 border border-slate-800">
                {product.volume} {product.volumeUnit}
              </div>
            </div>
          )}

          {/* ============= CAD VECTOR BLUEPRINT MODE ============= */}
          {renderMode === 'cad' && (
            <div className="relative w-full h-full flex items-center justify-center p-2">
              <svg
                viewBox="0 0 400 300"
                className="w-full h-full max-h-full object-contain"
              >
                <defs>
                  {/* Cylinder Body Gradient */}
                  <linearGradient id={`cyl-grad-front-${product.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#0a0a0a" stopOpacity="0.8" />
                    <stop offset="15%" stopColor={currentColorHex} stopOpacity="0.75" />
                    <stop offset="45%" stopColor="#ffffff" stopOpacity="0.45" />
                    <stop offset="60%" stopColor={currentColorHex} stopOpacity="0.95" />
                    <stop offset="85%" stopColor={currentColorHex} stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#000000" stopOpacity="0.85" />
                  </linearGradient>

                  {/* Metallic Brass Valve Gradient */}
                  <linearGradient id={`brass-grad-${product.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#854d0e" />
                    <stop offset="35%" stopColor="#fef08a" />
                    <stop offset="70%" stopColor="#ca8a04" />
                    <stop offset="100%" stopColor="#713f12" />
                  </linearGradient>

                  {/* Steel Collar / Base Gradient */}
                  <linearGradient id={`steel-collar-${product.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#1e293b" />
                    <stop offset="50%" stopColor="#64748b" />
                    <stop offset="100%" stopColor="#0f172a" />
                  </linearGradient>

                  {/* Floor Shadow */}
                  <radialGradient id={`floor-shadow-${product.id}`} cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="rgba(0,0,0,0.8)" />
                    <stop offset="100%" stopColor="rgba(0,0,0,0)" />
                  </radialGradient>
                </defs>

                {/* Floor Shadow */}
                <ellipse cx="200" cy="275" rx={isIndustrialTall ? 55 : (isAutoLpg ? 120 : 75)} ry="12" fill={`url(#floor-shadow-${product.id})`} />

                {/* Auto LPG Toroidal / Cylindrical Horizontal Tank */}
                {isAutoLpg ? (
                  <g transform="translate(40, 50)">
                    {/* Horizontal Main Shell */}
                    <rect x="30" y="50" width="260" height="130" rx="65" fill={`url(#cyl-grad-front-${product.id})`} stroke="#334155" strokeWidth="2" />
                    {/* Circumferential Seam Welds */}
                    <path d="M 95 50 L 95 180" stroke="#0f172a" strokeWidth="2.5" strokeDasharray="3,3" opacity="0.6" />
                    <path d="M 225 50 L 225 180" stroke="#0f172a" strokeWidth="2.5" strokeDasharray="3,3" opacity="0.6" />
                    {/* Multivalve Plate Housing */}
                    <circle cx="160" cy="115" r="28" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
                    <circle cx="160" cy="115" r="20" fill={`url(#brass-grad-${product.id})`} />
                    <circle cx="160" cy="115" r="6" fill="#0f172a" />
                    {/* Mounting Feet */}
                    <rect x="70" y="175" width="24" height="24" rx="4" fill={`url(#steel-collar-${product.id})`} />
                    <rect x="226" y="175" width="24" height="24" rx="4" fill={`url(#steel-collar-${product.id})`} />
                  </g>
                ) : (
                  /* Standard Vertical Cylinders (Workshops & Domestic) */
                  <g transform={isIndustrialTall ? 'translate(140, 20)' : (isSmallPicnic ? 'translate(125, 45)' : 'translate(120, 28)')}>
                    
                    {/* Stand Ring Base */}
                    <path
                      d={isIndustrialTall 
                        ? "M 10 230 C 10 242 110 242 110 230 L 105 210 L 15 210 Z"
                        : (isSmallPicnic
                          ? "M 15 190 C 15 200 135 200 135 190 L 130 175 L 20 175 Z"
                          : "M 12 215 C 12 228 148 228 148 215 L 142 195 L 18 195 Z")
                      }
                      fill={`url(#steel-collar-${product.id})`}
                      stroke="#0f172a"
                      strokeWidth="1.5"
                    />

                    {/* Main Cylindrical Shell */}
                    <path
                      d={isIndustrialTall
                        ? "M 15 50 C 15 20 105 20 105 50 L 105 210 C 105 220 15 220 15 210 Z"
                        : (isSmallPicnic
                          ? "M 20 45 C 20 20 130 20 130 45 L 130 175 C 130 185 20 185 20 175 Z"
                          : "M 18 50 C 18 20 142 20 142 50 L 142 195 C 142 205 18 205 18 195 Z")
                      }
                      fill={`url(#cyl-grad-front-${product.id})`}
                      stroke="#1e293b"
                      strokeWidth="2"
                    />

                    {/* Longitudinal Seam Weld Line */}
                    <line
                      x1={isIndustrialTall ? 60 : (isSmallPicnic ? 75 : 80)}
                      y1="50"
                      x2={isIndustrialTall ? 60 : (isSmallPicnic ? 75 : 80)}
                      y2={isIndustrialTall ? 210 : (isSmallPicnic ? 175 : 195)}
                      stroke="#000000"
                      strokeWidth="2"
                      strokeDasharray="2,2"
                      opacity="0.4"
                    />

                    {/* Protective Shroud / Collar with Handle Slots */}
                    <path
                      d={isIndustrialTall
                        ? "M 25 50 C 25 15 95 15 95 50 L 95 20 C 95 8 25 8 25 20 Z"
                        : (isSmallPicnic
                          ? "M 40 45 C 40 18 110 18 110 45 L 110 22 C 110 12 40 12 40 22 Z"
                          : "M 32 50 C 32 15 128 15 128 50 L 128 18 C 128 8 32 8 32 18 Z")
                      }
                      fill={`url(#steel-collar-${product.id})`}
                      stroke="#0f172a"
                      strokeWidth="1.5"
                    />

                    {/* Collar Hand Grip Slots */}
                    <rect
                      x={isIndustrialTall ? 45 : (isSmallPicnic ? 60 : 62)}
                      y="16"
                      width={isIndustrialTall ? 30 : 36}
                      height="10"
                      rx="5"
                      fill="#030712"
                    />

                    {/* Central High-Pressure Brass Valve */}
                    <g transform={isIndustrialTall ? "translate(52, 12)" : (isSmallPicnic ? "translate(67, 14)" : "translate(72, 14)")}>
                      <rect x="2" y="4" width="12" height="18" rx="2" fill={`url(#brass-grad-${product.id})`} stroke="#713f12" strokeWidth="1" />
                      <ellipse cx="8" cy="4" rx="10" ry="4" fill="#dc2626" />
                      <circle cx="8" cy="4" r="3" fill="#ffffff" />
                    </g>

                    {/* M GAS Factory Stamp & Technical Legend */}
                    <text
                      x={isIndustrialTall ? 60 : (isSmallPicnic ? 75 : 80)}
                      y={isIndustrialTall ? 120 : (isSmallPicnic ? 95 : 105)}
                      fill="#ffffff"
                      opacity="0.85"
                      fontSize={isIndustrialTall ? "11" : "12"}
                      fontWeight="bold"
                      fontFamily="monospace"
                      textAnchor="middle"
                      letterSpacing="1"
                    >
                      M GAS {product.volume}{product.volumeUnit.charAt(0)}
                    </text>
                  </g>
                )}
              </svg>
            </div>
          )}

        </div>

        {/* Quick Zoom Toggle & Lightbox Buttons */}
        <div className="absolute bottom-3 end-3 z-20 flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsZoomed(!isZoomed)}
            className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 shadow-lg lg:transition-all transition-colors active:scale-95"
            title={isZoomed ? 'Zoom Out' : 'Zoom In'}
          >
            <ZoomIn className={`w-4 h-4 ${isZoomed ? 'text-emerald-400' : ''}`} />
          </button>
          
          <button
            type="button"
            onClick={() => setIsLightboxOpen(true)}
            className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 shadow-lg lg:transition-all transition-colors active:scale-95"
            title="Inspect Full Resolution Photo"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* 4 Angle Selection Buttons */}
      {showControls && (
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
          
          {/* Button 1: Factory Real Reference */}
          <button
            type="button"
            onClick={() => {
              setRenderMode('photo');
              setAngle('real');
            }}
            className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center lg:transition-all transition-colors active:scale-95 ${
              activeAngle === 'real' && renderMode === 'photo'
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-md ring-1 ring-emerald-500/50'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Camera className="w-3.5 h-3.5 mb-1 text-emerald-400" />
            <span className="text-[10px] font-bold leading-tight">
              {currentLanguage === 'fa' ? 'عکس واقعی' : 'Real Photo'}
            </span>
          </button>

          {/* Button 2: Front View */}
          <button
            type="button"
            onClick={() => {
              setRenderMode('photo');
              setAngle('front');
            }}
            className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center lg:transition-all transition-colors active:scale-95 ${
              activeAngle === 'front' && renderMode === 'photo'
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-md ring-1 ring-emerald-500/50'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5 mb-1 text-emerald-400" />
            <span className="text-[10px] font-bold leading-tight">
              {currentLanguage === 'fa' ? 'زاویه ۱ (روبرو)' : 'Angle 1 (Front)'}
            </span>
          </button>

          {/* Button 3: 45° Perspective */}
          <button
            type="button"
            onClick={() => {
              setRenderMode('photo');
              setAngle('perspective');
            }}
            className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center lg:transition-all transition-colors active:scale-95 ${
              activeAngle === 'perspective' && renderMode === 'photo'
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-md ring-1 ring-emerald-500/50'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <RotateCw className="w-3.5 h-3.5 mb-1 text-emerald-400" />
            <span className="text-[10px] font-bold leading-tight">
              {currentLanguage === 'fa' ? 'زاویه ۲ (۴۵°)' : 'Angle 2 (45°)'}
            </span>
          </button>

          {/* Button 4: Valve & Collar Detail */}
          <button
            type="button"
            onClick={() => {
              setRenderMode('photo');
              setAngle('valveDetail');
            }}
            className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center lg:transition-all transition-colors active:scale-95 ${
              activeAngle === 'valveDetail' && renderMode === 'photo'
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-md ring-1 ring-emerald-500/50'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 mb-1 text-emerald-400" />
            <span className="text-[10px] font-bold leading-tight">
              {currentLanguage === 'fa' ? 'زاویه ۳ (شیر)' : 'Angle 3 (Valve)'}
            </span>
          </button>

        </div>
      )}

      {/* FULL RESOLUTION LIGHTBOX MODAL */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 sm:p-8 animate-fadeIn">
          <div className="relative max-w-4xl w-full max-h-[90vh] bg-slate-950 border border-slate-800 rounded-3xl p-6 flex flex-col items-center shadow-2xl">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-4 end-4 p-2 rounded-full bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header Title */}
            <div className="w-full flex items-center justify-between mb-4 border-b border-slate-800 pb-3 pe-10">
              <h3 className="text-base sm:text-lg font-bold text-white">
                {product.locales[currentLanguage]?.name || product.id}
              </h3>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-800/40">
                {product.volume} {product.volumeUnit} • {currentRalCode}
              </span>
            </div>

            {/* Main High-Res Image Container */}
            <div className="relative w-full flex-1 min-h-[300px] flex items-center justify-center overflow-hidden aspect-[4/3]">
              <img
                src={currentImageInfo.src}
                alt={product.locales[currentLanguage]?.name || product.id}
                width={800}
                height={600}
                loading="lazy"
                decoding="async"
                style={{ aspectRatio: '4/3' }}
                className="max-w-full max-h-[65vh] object-contain drop-shadow-2xl"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Footer Gallery Thumbnails */}
            {product.images?.gallery && product.images.gallery.length > 1 && (
              <div className="flex items-center gap-2 mt-4 overflow-x-auto max-w-full py-1">
                {product.images.gallery.map((gImg, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (idx === 0) setAngle('front');
                      else if (idx === 1) setAngle('perspective');
                      else setAngle('valveDetail');
                    }}
                    className={`relative w-16 h-16 rounded-xl overflow-hidden border p-1 bg-slate-900 shrink-0 transition-all ${
                      currentImageInfo.src === gImg ? 'border-emerald-400 ring-2 ring-emerald-500/50' : 'border-slate-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={gImg}
                      alt={`thumb ${idx}`}
                      width={64}
                      height={64}
                      loading="lazy"
                      decoding="async"
                      style={{ aspectRatio: '1/1' }}
                      className="w-full h-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
