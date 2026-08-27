import React, { useState, useMemo } from 'react';
import {
  Flame,
  Search,
  Filter,
  Scale,
  Ruler,
  Layers,
  ShieldCheck,
  MessageCircle,
  Calculator,
  Eye,
  CheckCircle,
  ChevronRight,
  Info,
  DollarSign,
  Palette,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { PRODUCTS } from '../data/products';
import { Product, ProductCategory } from '../types';
import { GlowCard } from './ui/GlowCard';
import { CylinderAngleViewer } from './CylinderAngleViewer';
import { RalColor, getRalColorByCode, RAL_POPULAR_COLORS } from '../data/ralColors';
import { RalColorModal } from './RalColorModal';
import { COMPANY_INFO } from '../data/company';

interface ProductCatalogProps {
  onSelectProductForSpecs: (product: Product) => void;
  onAddToRfq: (product: Product, selectedColor?: RalColor | null) => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  onSelectProductForSpecs,
  onAddToRfq,
}) => {
  const { currentLanguage, t, formatNumber, isRTL } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // State to hold selected RAL color per product card
  const [productColors, setProductColors] = useState<Record<string, RalColor>>({});
  
  // State for opening full RAL color modal for a specific product
  const [activeColorPickerProduct, setActiveColorPickerProduct] = useState<Product | null>(null);

  const categories = [
    { id: 'all', label: t.categoryAll },
    { id: 'workshops', label: t.categoryWorkshops },
    { id: 'home', label: t.categoryHome },
    { id: 'automotive', label: t.categoryAutomotive },
  ];

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((product) => {
      // Category filter
      if (selectedCategory !== 'all' && product.category !== selectedCategory) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const loc = product.locales[currentLanguage] || product.locales.en;
        const matchesName = loc.name.toLowerCase().includes(q);
        const matchesVolume = `${product.volume}`.includes(q);
        const matchesWeight = `${product.emptyWeightKg}`.includes(q);
        const matchesDimensions = `${product.circleDiameterCm}`.includes(q) || `${product.heightCm}`.includes(q);
        const matchesSpecs = loc.fullDescription.toLowerCase().includes(q);
        return matchesName || matchesVolume || matchesWeight || matchesDimensions || matchesSpecs;
      }
      return true;
    });
  }, [selectedCategory, searchQuery, currentLanguage]);

  const handleSetProductColor = (productId: string, color: RalColor) => {
    setProductColors((prev) => ({
      ...prev,
      [productId]: color,
    }));
  };

  return (
    <section id="products" className="py-20 bg-[#060F14] relative">
      
      {/* Background ambient lighting */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 right-1/4 w-[450px] h-[450px] bg-emerald-500/5 rounded-full blur-[140px]" />
        <div className="absolute bottom-10 left-1/4 w-[450px] h-[450px] bg-teal-500/5 rounded-full blur-[140px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider shadow-lg">
            <Flame className="w-4 h-4 text-emerald-400" />
            <span>{t.productsSectionBadge}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {t.productsSectionTitle}
          </h2>

          <p className="text-sm sm:text-base text-slate-300">
            {t.productsSectionSubtitle}
          </p>

          {/* 3-Angle & Color Feature Callout */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-900/80 border border-slate-700/60 text-xs text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {currentLanguage === 'fa'
                ? 'قابلیت مشاهده در ۳ زاویه استاندارد (4:3) و تغییر رنگ پوشش کوره ای با کاتالوگ بین‌المللی RAL'
                : 'Interactive 3-Angle 4:3 views & instant powder coating RAL color selection'}
            </span>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10">
          
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900/95 border border-slate-800 w-full md:w-auto">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all flex-1 md:flex-none text-center ${
                  selectedCategory === cat.id
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-950 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className={`w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-3.5' : 'left-3.5'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className={`w-full bg-slate-900/95 border border-slate-800 rounded-2xl py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 transition-colors ${
                isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'
              }`}
            />
          </div>
        </div>

        {/* Product Cards Grid with GlowCard and CylinderAngleViewer */}
        {filteredProducts.length > 0 ? (
          <div className="product-catalog-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredProducts.map((product) => {
              const loc = product.locales[currentLanguage] || product.locales.en;
              const selectedColor = productColors[product.id] || null;
              const currentColorObj = selectedColor || getRalColorByCode(product.defaultRalCode || 'RAL 6018');
              const currentColorName = currentColorObj
                ? currentLanguage === 'fa'
                  ? `${currentColorObj.code} (${currentColorObj.nameFa})`
                  : `${currentColorObj.code} (${currentColorObj.nameEn})`
                : product.defaultRalCode;

              const whatsappOrderUrl = `https://wa.me/${COMPANY_INFO.contacts.internationalSalesManager.whatsapp.replace('+', '')}?text=${encodeURIComponent(
                `Hello M Gas, I would like to order: ${loc.name} (Volume: ${product.volume} ${product.volumeUnit}, MOQ: ${product.minOrder} units, Preferred Coating: ${currentColorName}).`
              )}`;

              return (
                <GlowCard
                  key={product.id}
                  glowColor="gold"
                  className="p-5 flex flex-col justify-between group h-full bg-slate-900/95"
                >
                  <div className="space-y-4">
                    
                    {/* Top Row: Category Tag, MOQ, and Unit Price */}
                    <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                      <span className="text-[11px] font-medium text-emerald-400 bg-emerald-950/70 px-2.5 py-1 rounded-lg border border-emerald-800/40">
                        {loc.categoryLabel}
                      </span>

                      <div className="flex items-center gap-2">
                        {product.unitPriceUsd && (
                          <span className="text-[11px] font-mono font-bold text-amber-300 bg-amber-950/40 px-2 py-0.5 rounded-lg border border-amber-700/40">
                            ${product.unitPriceUsd}
                          </span>
                        )}
                        <span className="text-[11px] font-mono text-amber-300 bg-amber-950/40 px-2 py-0.5 rounded-lg border border-amber-800/40 flex items-center gap-1">
                          <Layers className="w-3 h-3 text-amber-400" />
                          <span>MOQ: {formatNumber(product.minOrder)}</span>
                        </span>
                      </div>
                    </div>

                    {/* 4:3 Ratio 3-Angle & Real Photo Visualizer */}
                    <CylinderAngleViewer
                      product={product}
                      selectedColor={selectedColor}
                      showControls={true}
                      onOpenColorPicker={() => setActiveColorPickerProduct(product)}
                    />

                    {/* Quick RAL Color Swatches row under the visualizer */}
                    <div className="flex items-center justify-between gap-2 px-1 pt-1">
                      <div className="flex items-center gap-2 py-1">
                        {RAL_POPULAR_COLORS.slice(0, 5).map((color) => {
                          const isSelected = (selectedColor?.code || product.defaultRalCode) === color.code;
                          return (
                            <button
                              key={color.code}
                              type="button"
                              onClick={() => handleSetProductColor(product.id, color)}
                              title={`${color.code} - ${currentLanguage === 'fa' ? color.nameFa : color.nameEn}`}
                              className={`w-5 h-5 rounded-full ${
                                isSelected
                                  ? 'border-2 border-amber-400 lg:scale-125 lg:ring-2 lg:ring-amber-500/50'
                                  : 'border border-slate-700/80 lg:hover:scale-110'
                              }`}
                              style={{ backgroundColor: color.hex }}
                            />
                          );
                        })}
                      </div>

                      <button
                        type="button"
                        onClick={() => setActiveColorPickerProduct(product)}
                        className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium lg:transition-colors shrink-0"
                      >
                        <Palette className="w-3 h-3" />
                        <span>{currentLanguage === 'fa' ? 'رنگ‌های بیشتر' : 'More Colors'}</span>
                      </button>
                    </div>

                    {/* Cylinder Name & Capacity Highlight */}
                    <div>
                      <div className="flex items-baseline justify-between gap-2">
                        <h3 className="text-lg font-bold text-white group-hover:text-amber-300 lg:transition-colors">
                          {loc.name}
                        </h3>
                        <span className="text-xl font-black font-mono text-amber-400 shrink-0">
                          {product.volume} <span className="text-xs text-slate-400 font-normal">{product.volumeUnit}</span>
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                        {loc.shortDescription}
                      </p>
                    </div>

                    {/* Specifications Grid */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      
                      {/* Empty Weight */}
                      <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800/80">
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-0.5">
                          <Scale className="w-3 h-3 text-emerald-400" />
                          <span>{t.emptyWeight}</span>
                        </div>
                        <span className="font-mono text-xs font-bold text-white">
                          {product.emptyWeightKg} {t.unitKg}
                        </span>
                      </div>

                      {/* Circle Diameter */}
                      <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800/80">
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-0.5">
                          <Ruler className="w-3 h-3 text-emerald-400" />
                          <span>{t.circleDiameter}</span>
                        </div>
                        <span className="font-mono text-xs font-bold text-white">
                          {product.circleDiameterCm} {t.unitCm}
                        </span>
                      </div>

                      {/* Height */}
                      <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800/80">
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-0.5">
                          <Ruler className="w-3 h-3 text-emerald-400" />
                          <span>{t.cylinderHeight}</span>
                        </div>
                        <span className="font-mono text-xs font-bold text-white">
                          {product.heightCm} {t.unitCm}
                        </span>
                      </div>

                      {/* Test Pressure */}
                      <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800/80">
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-0.5">
                          <ShieldCheck className="w-3 h-3 text-emerald-400" />
                          <span>{t.testPressure}</span>
                        </div>
                        <span className="font-mono text-xs font-bold text-emerald-400">
                          {product.testPressureBar} {t.unitBar}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-4 border-t border-slate-800/80 mt-4 space-y-2">
                    
                    {/* Primary Button: Direct WhatsApp Order */}
                    <a
                      href={whatsappOrderUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-950/40 lg:transition-all transition-colors active:scale-[0.98]"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>{t.orderViaWhatsApp}</span>
                    </a>

                    {/* Secondary Action Buttons: Specs & RFQ Add */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => onSelectProductForSpecs(product)}
                        className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700/60 lg:transition-colors active:scale-[0.98]"
                      >
                        <Eye className="w-3 h-3 text-emerald-400" />
                        <span>{t.viewTechnicalDrawing}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onAddToRfq(product, selectedColor)}
                        className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 text-xs font-medium border border-emerald-800/40 lg:transition-colors active:scale-[0.98]"
                      >
                        <Calculator className="w-3 h-3 text-emerald-400" />
                        <span>{t.addToRfq}</span>
                      </button>
                    </div>
                  </div>
                </GlowCard>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-400 space-y-3">
            <Info className="w-8 h-8 text-slate-500 mx-auto" />
            <p className="text-sm">{t.noProductsFound}</p>
          </div>
        )}

        {/* Global RAL Color Modal for Cards */}
        {activeColorPickerProduct && (
          <RalColorModal
            isOpen={Boolean(activeColorPickerProduct)}
            onClose={() => setActiveColorPickerProduct(null)}
            selectedColor={productColors[activeColorPickerProduct.id] || null}
            onSelectColor={(col) => handleSetProductColor(activeColorPickerProduct.id, col)}
          />
        )}

      </div>
    </section>
  );
};
