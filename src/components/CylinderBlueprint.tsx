import React from 'react';
import { Product } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { CYLINDER_DRAWINGS } from '../data/cylinderDrawings';
import { ShieldCheck, Ruler, Scale, Gauge, Layers, Compass } from 'lucide-react';

interface CylinderBlueprintProps {
  product: Product;
}

export const CylinderBlueprint: React.FC<CylinderBlueprintProps> = ({ product }) => {
  const { currentLanguage, t, formatNumber, formatDimension } = useLanguage();
  const loc = product.locales[currentLanguage] || product.locales.en;
  const isAuto = product.category === 'automotive';

  const autoDrawing = isAuto
    ? (product.drawingId
        ? CYLINDER_DRAWINGS.find((d) => d.id === product.drawingId)
        : CYLINDER_DRAWINGS.find((d) => d.title.toLowerCase().includes(String(product.volume))))
    : null;

  // Visual aspect calculations based on real dimensions (for vertical cylinders)
  const heightRatio = Math.min(Math.max((product.heightCm / 150) * 220, 100), 240);
  const widthRatio = Math.min(Math.max((product.circleDiameterCm / 36) * 110, 45), 120);

  return (
    <div className="bg-slate-950/80 border border-emerald-500/20 rounded-2xl p-4 sm:p-6 backdrop-blur-xl relative overflow-hidden">
      
      {/* Background blueprint grid */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, #10b981 1px, transparent 1px),
            linear-gradient(to bottom, #10b981 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
        }}
      />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* SVG Engineering Drawing Stage */}
        <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-4 min-h-[300px]">
          {isAuto && autoDrawing ? (
            <div className="w-full flex flex-col items-center space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[11px] font-mono text-emerald-400">
                <Compass className="w-3.5 h-3.5" />
                <span>{currentLanguage === 'fa' ? 'نقشه دوبعدی مشخصات فنی کاتالوگ کارخانه' : '2D Orthographic Factory Catalog Drawing'}</span>
              </div>

              {/* Exact 2D CAD Drawing from Catalog with blueprint styling */}
              <div className="w-full bg-slate-900/70 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-center shadow-lg">
                <svg
                  viewBox={autoDrawing.viewBox}
                  className="w-full max-w-[380px] h-auto drop-shadow-[0_5px_15px_rgba(16,185,129,0.2)]"
                >
                  {autoDrawing.lines.map((l, i) => (
                    <line
                      key={`l-${i}`}
                      x1={l.x1}
                      y1={l.y1}
                      x2={l.x2}
                      y2={l.y2}
                      stroke={l.stroke === '#111' ? '#34d399' : '#10b981'}
                      strokeWidth={l.strokeWidth * 1.3}
                    />
                  ))}
                  {autoDrawing.circles.map((c, i) => (
                    <circle
                      key={`c-${i}`}
                      cx={c.cx}
                      cy={c.cy}
                      r={c.r}
                      fill="none"
                      stroke="#34d399"
                      strokeWidth={1.5}
                    />
                  ))}
                  {autoDrawing.texts.map((tx, i) => (
                    <text
                      key={`tx-${i}`}
                      x={tx.x}
                      y={tx.y}
                      textAnchor="middle"
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="monospace"
                      fill="#e2e8f0"
                    >
                      {tx.val}
                    </text>
                  ))}
                </svg>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-emerald-300">
                <span className="bg-slate-900/90 px-2.5 py-1 rounded-lg border border-emerald-800/40">
                  {currentLanguage === 'fa' ? 'طول' : 'Length'}: {product.heightCm} cm
                </span>
                <span className="bg-slate-900/90 px-2.5 py-1 rounded-lg border border-emerald-800/40">
                  {currentLanguage === 'fa' ? 'قطر' : 'Diameter'}: Ø {product.circleDiameterCm} cm
                </span>
                <span className="bg-slate-900/90 px-2.5 py-1 rounded-lg border border-emerald-800/40">
                  {currentLanguage === 'fa' ? 'وزن' : 'Weight'}: {product.emptyWeightKg} kg
                </span>
              </div>
            </div>
          ) : (
            <div className="relative flex items-center justify-center">
              {/* Height dimension guide lines */}
              <div className="absolute -left-10 sm:-left-12 top-4 bottom-4 flex flex-col items-center justify-between text-[11px] font-mono text-emerald-400">
                <div className="w-2 h-0.5 bg-emerald-500/60" />
                <div className="h-full w-px bg-emerald-500/40 border-l border-dashed border-emerald-400 my-1" />
                <span className="py-1 px-1 bg-slate-900 rounded border border-emerald-800/40 font-bold whitespace-nowrap">
                  {product.heightCm} cm
                </span>
                <div className="h-full w-px bg-emerald-500/40 border-l border-dashed border-emerald-400 my-1" />
                <div className="w-2 h-0.5 bg-emerald-500/60" />
              </div>

              {/* Cylinder SVG Rendering */}
              <svg
                width={widthRatio + 40}
                height={heightRatio + 60}
                viewBox={`0 0 ${widthRatio + 40} ${heightRatio + 60}`}
                className="drop-shadow-[0_15px_25px_rgba(16,185,129,0.25)]"
              >
                <defs>
                  <linearGradient id={`cylGrad-${product.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#064e3b" />
                    <stop offset="25%" stopColor="#059669" />
                    <stop offset="50%" stopColor="#10b981" />
                    <stop offset="75%" stopColor="#059669" />
                    <stop offset="100%" stopColor="#022c22" />
                  </linearGradient>

                  <linearGradient id="brassGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#b45309" />
                    <stop offset="50%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#78350f" />
                  </linearGradient>

                  <linearGradient id="metalGuard" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#334155" />
                    <stop offset="50%" stopColor="#64748b" />
                    <stop offset="100%" stopColor="#1e293b" />
                  </linearGradient>
                </defs>

                {/* Valve Assembly on top */}
                <rect
                  x={(widthRatio + 40) / 2 - 6}
                  y={6}
                  width="12"
                  height="14"
                  rx="2"
                  fill="url(#brassGrad)"
                  stroke="#d97706"
                  strokeWidth="0.5"
                />
                <circle
                  cx={(widthRatio + 40) / 2 + 4}
                  cy={10}
                  r="4"
                  fill="#f59e0b"
                />

                {/* Protective Top Collar / Handle Ring */}
                <path
                  d={`
                    M ${(widthRatio + 40) / 2 - widthRatio / 2 + 6} 24
                    C ${(widthRatio + 40) / 2 - widthRatio / 2 + 6} 12, ${(widthRatio + 40) / 2 + widthRatio / 2 - 6} 12, ${(widthRatio + 40) / 2 + widthRatio / 2 - 6} 24
                  `}
                  fill="none"
                  stroke="url(#metalGuard)"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                />

                {/* Top dome */}
                <ellipse
                  cx={(widthRatio + 40) / 2}
                  cy={30}
                  rx={widthRatio / 2}
                  ry={widthRatio / 4}
                  fill={`url(#cylGrad-${product.id})`}
                />

                {/* Body Cylinder */}
                <rect
                  x={(widthRatio + 40) / 2 - widthRatio / 2}
                  y={30}
                  width={widthRatio}
                  height={heightRatio - 10}
                  fill={`url(#cylGrad-${product.id})`}
                />

                {/* Circumference Robotic Weld Line */}
                <line
                  x1={(widthRatio + 40) / 2 - widthRatio / 2}
                  y1={30 + heightRatio / 2}
                  x2={(widthRatio + 40) / 2 + widthRatio / 2}
                  y2={30 + heightRatio / 2}
                  stroke="#34d399"
                  strokeWidth="0.8"
                  strokeDasharray="2,2"
                  opacity="0.7"
                />

                {/* Bottom dome */}
                <ellipse
                  cx={(widthRatio + 40) / 2}
                  cy={20 + heightRatio}
                  rx={widthRatio / 2}
                  ry={widthRatio / 4}
                  fill={`url(#cylGrad-${product.id})`}
                />

                {/* Foot Ring Base */}
                <rect
                  x={(widthRatio + 40) / 2 - widthRatio / 2 + 3}
                  y={18 + heightRatio}
                  width={widthRatio - 6}
                  height="12"
                  rx="3"
                  fill="url(#metalGuard)"
                  stroke="#0f172a"
                  strokeWidth="1"
                />

                {/* Center Embossed Brand Text */}
                <text
                  x={(widthRatio + 40) / 2}
                  y={26 + heightRatio / 2}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.3)"
                  fontSize="9"
                  fontWeight="900"
                  fontFamily="monospace"
                  letterSpacing="1"
                >
                  M-GAS
                </text>
              </svg>
            </div>
          )}

          {!isAuto && (
            <div className="mt-3 flex items-center justify-center gap-2 text-[11px] font-mono text-emerald-400">
              <span className="w-3 h-px bg-emerald-500/40" />
              <span className="bg-slate-900/90 px-2 py-0.5 rounded border border-emerald-800/40">
                Ø {product.circleDiameterCm} cm
              </span>
              <span className="w-3 h-px bg-emerald-500/40" />
            </div>
          )}
        </div>

        {/* Specifications Data Grid */}
        <div className="w-full md:w-1/2 space-y-3.5 text-xs text-slate-300">
          <div className="border-b border-emerald-500/20 pb-2">
            <h4 className="text-base font-bold text-white tracking-wide">
              {loc.name}
            </h4>
            <p className="text-xs text-emerald-400 font-mono mt-0.5">
              SKU: {product.slug.toUpperCase()} | {product.volume} {product.volumeUnit} {isAuto ? '• ECE R67' : ''}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <span className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-1">
                <Scale className="w-3.5 h-3.5 text-emerald-400" />
                {t.emptyWeight}
              </span>
              <span className="font-mono text-sm font-bold text-white">
                {product.emptyWeightKg} {t.unitKg}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <span className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-1">
                <Ruler className="w-3.5 h-3.5 text-emerald-400" />
                {isAuto ? (currentLanguage === 'fa' ? 'طول مخزن' : 'Tank Length') : t.cylinderHeight}
              </span>
              <span className="font-mono text-sm font-bold text-white">
                {product.heightCm} {t.unitCm}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <span className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-1">
                <Compass className="w-3.5 h-3.5 text-emerald-400" />
                {isAuto ? (currentLanguage === 'fa' ? 'قطر مخزن' : 'Tank Diameter') : t.circleDiameter}
              </span>
              <span className="font-mono text-sm font-bold text-white">
                Ø {product.circleDiameterCm} {t.unitCm}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <span className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-1">
                <Gauge className="w-3.5 h-3.5 text-emerald-400" />
                {t.testPressure}
              </span>
              <span className="font-mono text-sm font-bold text-emerald-400">
                {product.testPressureBar} {t.unitBar}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 col-span-2">
              <span className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-1">
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                {t.minOrder}
              </span>
              <span className="font-mono text-sm font-bold text-amber-400">
                {formatNumber(product.minOrder)}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/30 space-y-1 text-[11px]">
            <div className="flex items-center gap-1.5 text-emerald-300 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.safetyCertifications}</span>
            </div>
            <p className="text-slate-400">
              {product.material} • {product.valveStandard} • {product.coating}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
