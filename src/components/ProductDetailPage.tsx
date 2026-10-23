import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { Product } from '../types';
import { PRODUCTS } from '../data/products';
import { Link, useRouter } from '../router/RouterContext';
import {
  ChevronRight,
  ShieldCheck,
  Send,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  FileText,
  Truck,
  Box,
  Scale,
  Gauge,
  Flame,
  Layers,
  Palette,
  Eye,
  Award,
} from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';
import { COMPANY_INFO } from '../data/company';
import { CylinderBlueprint } from './CylinderBlueprint';
import { CylinderAngleViewer } from './CylinderAngleViewer';
import { RalColorModal } from './RalColorModal';
import { RalColor } from '../data/ralColors';

interface ProductDetailPageProps {
  product: Product;
  onAddToRfq: (product: Product, selectedColor?: RalColor | null) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ product, onAddToRfq }) => {
  const { currentLanguage, isRTL, t, formatNumber } = useLanguage();
  const { navigate } = useRouter();
  const [showBlueprint, setShowBlueprint] = useState(false);
  const [showRalModal, setShowRalModal] = useState(false);
  const [selectedColor, setSelectedColor] = useState<RalColor | null>(null);

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;
  const loc = product.locales[currentLanguage] || product.locales.fa || product.locales.en;

  // Other related products in same or similar category
  const relatedProducts = PRODUCTS.filter((p) => p.id !== product.id).slice(0, 4);

  const handleInquiryWhatsApp = () => {
    const colorText = selectedColor ? ` (Color: ${selectedColor.code})` : '';
    const message = `Hello M Gas Sales Directorate,\nI would like to inquire about wholesale order and price for: ${loc.name}${colorText} - Minimum Order: ${product.minOrder} units.`;
    const url = `https://wa.me/${COMPANY_INFO.contacts.internationalSalesManager.whatsapp.replace('+', '')}?text=${encodeURIComponent(
      message
    )}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-[#050D12] text-slate-100 pt-28 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <li>
              <Link to="/" className="hover:text-emerald-400 transition-colors">
                {isRTL ? 'صفحه اصلی' : 'Home'}
              </Link>
            </li>
            <li>
              <ChevronRight className={`w-3.5 h-3.5 text-slate-600 ${isRTL ? 'rotate-180' : ''}`} />
            </li>
            <li>
              <Link to="/products" className="hover:text-emerald-400 transition-colors">
                {isRTL ? 'فروشگاه و کاتالوگ' : 'Products Store'}
              </Link>
            </li>
            <li>
              <ChevronRight className={`w-3.5 h-3.5 text-slate-600 ${isRTL ? 'rotate-180' : ''}`} />
            </li>
            <li className="text-emerald-400 font-semibold truncate max-w-[200px] sm:max-w-none" aria-current="page">
              {loc.name}
            </li>
          </ol>
        </nav>

        {/* Top Product Presentation Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
          
          {/* Left Column (5 Cols): Multi-Angle Product Visualizer & Blueprint Toggle */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="relative aspect-square rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 p-6 flex items-center justify-center border border-slate-800 shadow-2xl overflow-hidden">
              <CylinderAngleViewer product={product} />

              {/* 30-Bar Pressure Proof Seal */}
              <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>30 BAR TESTED</span>
              </div>
            </div>

            {/* Visualizer Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setShowBlueprint(!showBlueprint)}
                className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  showBlueprint
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/20'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                <Eye className="w-4 h-4" />
                <span>{showBlueprint ? (isRTL ? 'نمایش عکس سیلندر' : 'Show 3D Angles') : (isRTL ? 'نمایش نقشه مهندسی' : 'View Blueprint')}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowRalModal(true)}
                className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Palette className="w-4 h-4 text-emerald-400" />
                <span>{isRTL ? 'انتخاب رنگ سفارشی RAL' : 'Custom RAL Color'}</span>
              </button>
            </div>

            {selectedColor && (
              <div className="p-3 rounded-xl bg-slate-900/80 border border-emerald-500/30 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full border border-white/20 shadow"
                    style={{ backgroundColor: selectedColor.code }}
                  />
                  <span className="font-medium text-slate-200">
                    {isRTL ? selectedColor.nameFa : selectedColor.nameEn} ({selectedColor.code})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedColor(null)}
                  className="text-slate-400 hover:text-rose-400 text-[11px] underline cursor-pointer"
                >
                  {isRTL ? 'تنظیم مجدد' : 'Reset'}
                </button>
              </div>
            )}
          </div>

          {/* Right Column (7 Cols): Product Specs, Engineering Detail & Inquiry */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              {/* Product Badge with SEO Keywords */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-3">
                <Flame className="w-3.5 h-3.5" />
                <span>
                  {isRTL
                    ? 'کمپانی تولید سیلندر گاز مایع در ایران | استاندارد ملی ISIRI 841'
                    : 'Certified by Top LPG Cylinder Manufacturing Company in Iran'}
                </span>
              </div>

              {/* Main Heading H1 */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight mb-3">
                {loc.name}
              </h1>

              {/* Description */}
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-6">
                {loc.fullDescription || loc.shortDescription}
              </p>

              {/* Technical Specifications Grid */}
              <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 mb-6">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-emerald-400" />
                  <span>{isRTL ? 'مشخصات فنی و استانداردهای متالورژی' : 'Technical Specifications & Metallurgy'}</span>
                </h2>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="text-slate-500 block mb-1">{t.emptyWeight}</span>
                    <span className="text-slate-100 font-mono font-bold text-sm">
                      {formatNumber(product.emptyWeightKg)} {t.unitKg}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="text-slate-500 block mb-1">{t.circleDiameter}</span>
                    <span className="text-slate-100 font-mono font-bold text-sm">
                      {formatNumber(product.circleDiameterCm)} {t.unitCm}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="text-slate-500 block mb-1">{t.cylinderHeight}</span>
                    <span className="text-slate-100 font-mono font-bold text-sm">
                      {formatNumber(product.heightCm)} {t.unitCm}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="text-slate-500 block mb-1">{isRTL ? 'ضخامت ورق بدنه' : 'Wall Thickness'}</span>
                    <span className="text-slate-100 font-mono font-bold text-sm">
                      {formatNumber(product.bodyThicknessMm)} {t.unitMm}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="text-slate-500 block mb-1">{t.testPressure}</span>
                    <span className="text-emerald-400 font-mono font-bold text-sm">
                      {formatNumber(product.testPressureBar)} {t.unitBar}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="text-slate-500 block mb-1">{t.workingPressure}</span>
                    <span className="text-slate-100 font-mono font-bold text-sm">
                      {formatNumber(product.workingPressureBar)} {t.unitBar}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="text-slate-500 block mb-1">{isRTL ? 'استاندارد شیر' : 'Valve Standard'}</span>
                    <span className="text-slate-100 font-medium">{product.valveStandard}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="text-slate-500 block mb-1">{isRTL ? 'گرید فولاد' : 'Steel Grade'}</span>
                    <span className="text-slate-100 font-mono font-semibold">{product.material}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="text-slate-500 block mb-1">{t.minOrder}</span>
                    <span className="text-amber-400 font-mono font-bold text-sm">
                      {formatNumber(product.minOrder)} {isRTL ? 'عدد' : 'pcs'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Key Features & Certified Applications */}
              <div className="mb-6">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  {isRTL ? 'ویژگی‌های فنی و کاربردها:' : 'Engineering Features & Verified Applications:'}
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                  {loc.features.map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                  {loc.applications.map((app, idx) => (
                    <li key={`app-${idx}`} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span>{app}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Call To Actions */}
            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={() => onAddToRfq(product, selectedColor)}
                className="w-full sm:w-auto flex-1 py-3.5 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-xl shadow-emerald-500/25 active:scale-98 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{isRTL ? 'افزودن به پیش‌فاکتور و استعلام رسمی (RFQ)' : 'Add to RFQ & Request Quote'}</span>
              </button>

              <button
                type="button"
                onClick={handleInquiryWhatsApp}
                className="w-full sm:w-auto py-3.5 px-6 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-xl shadow-[#25D366]/20 active:scale-98 cursor-pointer"
              >
                <WhatsAppIcon className="w-4 h-4 text-slate-950" />
                <span>{isRTL ? 'استعلام فوری در واتس‌اپ مدیر فروش' : 'WhatsApp Sales Manager'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Blueprint Visualizer Display Section */}
        {showBlueprint && (
          <div className="mb-16 p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-400" />
              <span>{isRTL ? `نقشه مهندسی و ابعاد استاندارد ${loc.name}` : `Technical Blueprint & Engineering Dimensions`}</span>
            </h2>
            <CylinderBlueprint product={product} />
          </div>
        )}

        {/* Related Products from the Catalog */}
        <section className="pt-12 border-t border-slate-800">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
                {isRTL ? 'سایر مدل‌های کپسول گاز کارخانه ام گاز' : 'Other LPG Cylinder Models by M Gas'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                {isRTL ? 'تولید شده در بزرگترین کمپانی تولید سیلندر گاز مایع در ایران' : 'Manufactured by leading LPG cylinder company in Iran'}
              </p>
            </div>
            <Link
              to="/products"
              className="py-2 px-3.5 rounded-xl bg-slate-850 hover:bg-slate-800 text-emerald-400 font-semibold text-xs flex items-center gap-1.5 transition-colors border border-slate-700/80"
            >
              <span>{isRTL ? 'مشاهده همه ۱۳ مدل' : 'View All Models'}</span>
              <ArrowIcon className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((rel) => {
              const relLoc = rel.locales[currentLanguage] || rel.locales.fa || rel.locales.en;
              return (
                <Link
                  key={rel.id}
                  to={`/products/${rel.slug}`}
                  className="group p-4 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/40 transition-all flex flex-col justify-between"
                >
                  <div className="aspect-square rounded-xl bg-slate-950 p-3 mb-3 flex items-center justify-center overflow-hidden">
                    <img
                      src={rel.image}
                      alt={relLoc.name}
                      loading="lazy"
                      className="max-h-full max-w-full object-contain filter drop-shadow group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-1 mb-1">
                      {relLoc.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mb-2">{relLoc.shortDescription}</p>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>{rel.volume} {rel.volumeUnit}</span>
                      <span className="text-emerald-400 font-semibold">{rel.testPressureBar} Bar</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

      </div>

      {/* RAL Color Selection Modal */}
      <RalColorModal
        isOpen={showRalModal}
        onClose={() => setShowRalModal(false)}
        onSelectColor={(color) => {
          setSelectedColor(color);
          setShowRalModal(false);
        }}
        selectedColor={selectedColor}
      />
    </div>
  );
};
