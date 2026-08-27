import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Award,
  Layers,
  Scale,
  Ruler,
  Gauge,
  CheckCircle2,
  MessageCircle,
  FileCheck,
  DollarSign,
  Palette,
  Camera,
  Compass,
  Images,
} from 'lucide-react';
import { Product } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { CylinderBlueprint } from './CylinderBlueprint';
import { CylinderAngleViewer } from './CylinderAngleViewer';
import { RalColorPicker } from './RalColorPicker';
import { RalColor, getRalColorByCode } from '../data/ralColors';
import { COMPANY_INFO } from '../data/company';

interface TechnicalSpecsModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToRfq: (product: Product, selectedColor?: RalColor | null) => void;
}

export const TechnicalSpecsModal: React.FC<TechnicalSpecsModalProps> = ({
  product,
  onClose,
  onAddToRfq,
}) => {
  const { currentLanguage, t, formatNumber } = useLanguage();
  const [activeTab, setActiveTab] = useState<'angles' | 'blueprint' | 'gallery'>('angles');
  const [selectedColor, setSelectedColor] = useState<RalColor | null>(null);
  const [activeAngle, setActiveAngle] = useState<'front' | 'perspective' | 'valveDetail' | 'real'>('real');

  if (!product) return null;

  const loc = product.locales[currentLanguage] || product.locales.en;
  const currentColorObj = selectedColor || getRalColorByCode(product.defaultRalCode || 'RAL 6018');
  const currentColorName = currentColorObj
    ? currentLanguage === 'fa'
      ? `${currentColorObj.code} (${currentColorObj.nameFa})`
      : `${currentColorObj.code} (${currentColorObj.nameEn})`
    : product.defaultRalCode;

  const whatsappUrl = `https://wa.me/${COMPANY_INFO.contacts.internationalSalesManager.whatsapp.replace('+', '')}?text=${encodeURIComponent(
    `Hello M Gas, I need technical quotation for: ${loc.name} (Volume: ${product.volume} ${product.volumeUnit}, MOQ: ${product.minOrder} units, Preferred Coating: ${currentColorName}).`
  )}`;

  const galleryImages = product.images?.gallery || (product.image ? [product.image] : []);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="relative w-full max-w-5xl bg-[#081218] border border-emerald-500/30 rounded-3xl shadow-2xl overflow-hidden max-h-[94vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/80 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-950/80 border border-emerald-700/40 flex items-center justify-center text-emerald-400 shrink-0">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  {loc.name}
                </h3>
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-700/40">
                  {product.volume} {product.volumeUnit}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                ISO 9001:2015 • ISIRI 439 / EN 1442 Standard
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            aria-label={t.closeModal}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs between 3D Angles, Blueprint, and Factory Gallery */}
        <div className="px-5 pt-3 border-b border-slate-800/80 bg-slate-900/40 flex items-center gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('angles')}
            className={`px-4 py-2 rounded-t-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'angles'
                ? 'border-emerald-500 text-emerald-400 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>{currentLanguage === 'fa' ? 'زوایای محصول و کاتالوگ رنگ (4:3)' : '3-Angle Views & RAL Colors (4:3)'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('blueprint')}
            className={`px-4 py-2 rounded-t-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'blueprint'
                ? 'border-emerald-500 text-emerald-400 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>{t.viewTechnicalDrawing}</span>
          </button>

          {galleryImages.length > 1 && (
            <button
              type="button"
              onClick={() => setActiveTab('gallery')}
              className={`px-4 py-2 rounded-t-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 border-b-2 ${
                activeTab === 'gallery'
                  ? 'border-emerald-500 text-emerald-400 bg-slate-800/60'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Images className="w-4 h-4" />
              <span>
                {currentLanguage === 'fa' ? `گالری عکس کارخانه (${galleryImages.length})` : `Factory Gallery (${galleryImages.length})`}
              </span>
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* TAB 1: 3-ANGLE 4:3 VIEWER & RAL COATING CUSTOMIZER */}
          {activeTab === 'angles' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: 4:3 Angle Visualizer */}
              <div className="lg:col-span-7">
                <CylinderAngleViewer
                  product={product}
                  selectedColor={selectedColor}
                  activeAngle={activeAngle}
                  onAngleChange={setActiveAngle}
                  showControls={true}
                />
              </div>

              {/* Right Column: RAL Color Picker, Pricing & Quick Specs */}
              <div className="lg:col-span-5 space-y-4">
                
                {/* RAL Color Coating Picker */}
                <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
                  <RalColorPicker
                    selectedColor={selectedColor}
                    onSelectColor={(col) => setSelectedColor(col)}
                    defaultRalCode={product.defaultRalCode}
                  />
                </div>

                {/* Pricing & MOQ Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900/60 to-slate-950 border border-emerald-500/20 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{currentLanguage === 'fa' ? 'قیمت واحد (تقریبی صادراتی):' : 'Unit Price (Export):'}</span>
                    </span>
                    <span className="font-mono text-base font-black text-emerald-400">
                      ${product.unitPriceUsd || '--'} USD
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800/80">
                    <span>{t.minOrder}:</span>
                    <span className="font-mono font-bold text-amber-400">
                      {formatNumber(product.minOrder)} {currentLanguage === 'fa' ? 'عدد' : 'units'}
                    </span>
                  </div>
                </div>

                {/* Core Specs Snapshot */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">{t.testPressure}</span>
                    <span className="font-mono font-bold text-emerald-400">{product.testPressureBar} {t.unitBar}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">{t.emptyWeight}</span>
                    <span className="font-mono font-bold text-white">{product.emptyWeightKg} {t.unitKg}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">{t.circleDiameter}</span>
                    <span className="font-mono font-bold text-white">{product.circleDiameterCm} {t.unitCm}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">{t.cylinderHeight}</span>
                    <span className="font-mono font-bold text-white">{product.heightCm} {t.unitCm}</span>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: TECHNICAL BLUEPRINT */}
          {activeTab === 'blueprint' && (
            <div className="space-y-4">
              <CylinderBlueprint product={product} />
            </div>
          )}

          {/* TAB 3: FACTORY GALLERY */}
          {activeTab === 'gallery' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-400" />
                <span>{currentLanguage === 'fa' ? 'تصاویر واقعی کارخانه و خط تولید' : 'Authentic Factory & Line Photos'}</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {galleryImages.map((imgSrc, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-[4/3] rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden p-2 flex items-center justify-center group"
                  >
                    <img
                      src={imgSrc}
                      alt={`${loc.name} photo ${idx + 1}`}
                      width={400}
                      height={300}
                      style={{ aspectRatio: '4/3' }}
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (!target.src.includes('DSC08566-1-scaled.webp')) {
                          target.src = '/products/11 Liter/DSC08566-1-scaled.webp';
                        }
                      }}
                      className="max-w-full max-h-full object-contain filter drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute bottom-2 start-2 text-[10px] font-mono bg-black/70 px-2 py-0.5 rounded text-slate-300">
                      Photo #{idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Full Description & Engineering Details */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>{t.specDetails}</span>
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed text-justify">
              {loc.fullDescription}
            </p>
          </div>

          {/* Features and Applications Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Key Advantages */}
            <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-2.5">
              <h5 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{loc.categoryLabel}</span>
              </h5>
              <ul className="space-y-2">
                {loc.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Target Applications */}
            <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-2.5">
              <h5 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" />
                <span>Target Applications</span>
              </h5>
              <ul className="space-y-2">
                {loc.applications.map((app, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0" />
                    <span>{app}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Standards & Metallurgical Test Certifications */}
          <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-800/30 space-y-2 text-xs text-slate-300">
            <h5 className="font-bold text-emerald-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{t.standardCompliance}</span>
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-400">
              <div>• {t.materialSpec}: {product.material}</div>
              <div>• {t.valveConnection}: {product.valveStandard}</div>
              <div>• {t.coatingFinish}: {product.coating} ({currentColorName})</div>
              <div>• {t.burstPressureLimit}: 30 Bar (100% Hydrostatic Proof)</div>
            </div>
          </div>

          {/* Delivery & Shipping Notice */}
          <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/20 text-[11px] text-amber-200/90 flex items-start gap-2.5">
            <div className="w-2 h-2 rounded-full bg-amber-400 mt-1 shrink-0" />
            <div>
              <span className="font-bold text-amber-300 block mb-0.5">{t.shippingTermsTitle}</span>
              <p className="leading-relaxed text-slate-300">
                {t.shippingTermsFactoryGate} {t.shippingTermsArrangement}
              </p>
            </div>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-800/80 bg-slate-950/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400 text-center sm:text-start flex items-center gap-3">
            <div>
              <span className="text-slate-300 font-semibold">{t.minOrder}:</span>{' '}
              <span className="font-mono font-bold text-amber-400">{formatNumber(product.minOrder)} units</span>
            </div>
            {product.unitPriceUsd && (
              <div>
                <span className="text-slate-300 font-semibold">Price:</span>{' '}
                <span className="font-mono font-bold text-emerald-400">${product.unitPriceUsd}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                onAddToRfq(product, selectedColor);
                onClose();
              }}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
            >
              {t.addToRfq}
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/50 transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{t.orderViaWhatsApp}</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};
