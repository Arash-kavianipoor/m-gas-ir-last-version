import React, { useState } from 'react';
import { Product } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { Eye, ShieldCheck, Sparkles, ZoomIn } from 'lucide-react';

interface CylinderAngleViewerProps {
  product: Product;
}

export const CylinderAngleViewer: React.FC<CylinderAngleViewerProps> = ({ product }) => {
  const { currentLanguage, t } = useLanguage();
  const [activeAngle, setActiveAngle] = useState<'real' | 'render' | 'front' | 'valveDetail'>('real');
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  const loc = product.locales[currentLanguage] || product.locales.en || product.locales.fa;

  const angles = [
    {
      key: 'real' as const,
      labelFa: '۱. تصویر واقعی کارخانه',
      labelEn: '1. Real Factory Photo',
      labelDe: '1. Echtes Werksfoto',
      src: product.images?.referenceReal || product.image,
      alt: `${loc.name} - ${loc.imageAlt || 'تصویر واقعی خط تولید و کپسول گاز کارخانه'}`,
    },
    {
      key: 'render' as const,
      labelFa: '۲. رندر واقع‌گرایانه',
      labelEn: '2. Realistic 3D Render',
      labelDe: '2. Realistisches 3D-Modell',
      src: product.images?.realisticRender || product.images?.perspective || product.image,
      alt: `${loc.name} - رندر استودیویی واقع گرایانه و مدل سه بعدی صنعتی مهندسی مخازن تحت فشار ام گاز`,
    },
    {
      key: 'front' as const,
      labelFa: '۳. نمای روبرو',
      labelEn: '3. Front View',
      labelDe: '3. Frontansicht',
      src: product.images?.front || product.image,
      alt: `${loc.name} - نمای روبرو و مشخصات بدنه کپسول گاز استاندارد ۳۰ بار`,
    },
    {
      key: 'valveDetail' as const,
      labelFa: '۴. جزئیات شیر و گارد',
      labelEn: '4. Valve & Collar',
      labelDe: '4. Ventil & Kragen',
      src: product.images?.valveDetail || product.image,
      alt: `${loc.name} - جزئیات شیر برنجی، سوپاپ اطمینان و گارد محافظ دسته کپسول گاز`,
    },
  ];

  const currentAngleObj = angles.find((a) => a.key === activeAngle) || angles[0];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  return (
    <div className="space-y-4">
      {/* Main 4:3 Aspect Viewer with 100% Hover Zoom (No click modal needed on desktop) */}
      <div
        className="relative aspect-[4/3] w-full rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center group cursor-crosshair"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onMouseMove={handleMouseMove}
      >
        {/* Background Grid Accent */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#10b981 1px, transparent 1px)`,
            backgroundSize: '16px 16px',
          }}
        />

        {/* The Cylinder Image with Precision Zoom on Mouse Hover */}
        <img
          src={currentAngleObj.src}
          alt={currentAngleObj.alt}
          className={`max-h-full max-w-full object-contain transition-transform duration-200 pointer-events-none drop-shadow-2xl ${
            isHovered ? 'scale-[1.8]' : 'scale-100'
          }`}
          style={
            isHovered
              ? {
                  transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
                }
              : undefined
          }
          loading="lazy"
          referrerPolicy="no-referrer"
        />

        {/* Hover Hint Badge */}
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-[11px] text-slate-300 flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
          <Eye className="w-3.5 h-3.5 text-emerald-400" />
          <span>{currentLanguage === 'fa' ? 'هاور ماوس برای بزرگ‌نمایی ۱۰۰٪' : currentLanguage === 'de' ? 'Hover für 100% Zoom' : 'Hover for 100% zoom'}</span>
        </div>

        {/* 30-Bar Testing Badge */}
        <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-emerald-950/80 backdrop-blur-md border border-emerald-500/40 text-[11px] text-emerald-300 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>30-Bar Hydrostatic Tested</span>
        </div>
      </div>

      {/* Angle Selector Thumbnails */}
      <div className="grid grid-cols-4 gap-2">
        {angles.map((angle) => (
          <button
            key={angle.key}
            type="button"
            onClick={() => setActiveAngle(angle.key)}
            className={`p-1.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
              activeAngle === angle.key
                ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-500/50'
                : 'border-slate-800 bg-slate-900/40 hover:bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="w-full aspect-[4/3] rounded-lg overflow-hidden bg-slate-950/60 flex items-center justify-center">
              <img
                src={angle.src}
                alt={angle.alt}
                className="w-full h-full object-contain p-0.5"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="text-[10px] font-medium truncate w-full px-1">
              {currentLanguage === 'fa' ? angle.labelFa : currentLanguage === 'de' ? angle.labelDe : angle.labelEn}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
