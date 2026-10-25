import React, { useState, useMemo } from 'react';
import { Product, ProductCategory } from '../types';
import { PRODUCTS, getProductsByCategory } from '../data/products';
import { useLanguage } from '../i18n/LanguageContext';
import { GlowCard } from './ui/GlowCard';
import {
  Layers,
  ShieldCheck,
  Search,
  CheckCircle2,
  FileSpreadsheet,
  ChevronRight,
  Info,
  Scale,
  Ruler,
  Gauge,
  Plus,
  Compass,
  DollarSign,
  Maximize2,
  Filter,
  Eye,
} from 'lucide-react';

interface ProductCatalogProps {
  onSelectProductForSpecs: (product: Product) => void;
  onAddToRfq: (product: Product) => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  onSelectProductForSpecs,
  onAddToRfq,
}) => {
  const { currentLanguage, t, formatNumber, formatDimension, isRTL } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredPreviewImage, setHoveredPreviewImage] = useState<string | null>(null);

  const categories: { key: ProductCategory | 'all'; label: string }[] = [
    { key: 'all', label: t.categoryAll || 'All Cylinders (13 Models)' },
    { key: 'workshops', label: t.categoryWorkshops || 'Workshops & Industry' },
    { key: 'home', label: t.categoryHome || 'Domestic & Picnic' },
    { key: 'automotive', label: t.categoryAutomotive || 'Automotive Autogas' },
  ];

  const filteredProducts = useMemo(() => {
    let prods = selectedCategory === 'all' ? PRODUCTS : getProductsByCategory(selectedCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      prods = prods.filter((p) => {
        const loc = p.locales[currentLanguage] || p.locales.en;
        return (
          loc.name.toLowerCase().includes(q) ||
          loc.shortDescription.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q) ||
          p.volume.toString().includes(q)
        );
      });
    }
    return prods;
  }, [selectedCategory, searchQuery, currentLanguage]);

  return (
    <section id="products" className="relative py-24 bg-[#050D12] overflow-hidden">
      
      {/* Background radial accent */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-500/5 blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <Layers className="w-4 h-4" />
            <span>{t.productsSectionBadge || 'ISO 9001 & ISIRI 841 Certified Fleet'}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
            {t.productsSectionTitle || 'Standard Industrial & Domestic Gas Cylinders'}
          </h2>

          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            {t.productsSectionSubtitle || 'Comprehensive range of 13 standard LPG cylinders manufactured from high-grade pressure vessel steel with 30-bar hydrostatic testing.'}
          </p>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10">
          
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {categories.map((cat) => (
              <button
                key={cat.key}
                type="button"
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  selectedCategory === cat.key
                    ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/25 ring-2 ring-emerald-400'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder || 'Search cylinder capacity, size...'}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const loc = product.locales[currentLanguage] || product.locales.en;
            return (
              <GlowCard key={product.id} glowColor="emerald" className="flex flex-col h-full">
                <div className="p-5 flex flex-col h-full justify-between space-y-4">
                  
                  {/* Top Badges & Volume */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-xs font-bold">
                        {product.volume} {product.volumeUnit}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800">
                        {product.testPressureBar} Bar Tested
                      </span>
                    </div>

                    {/* Product Image: Slot 1 Real Factory Photo, Slot 2 Realistic 3D Render on Hover */}
                    <a
                      href={`/products/${product.slug}`}
                      onClick={(e) => {
                        e.preventDefault();
                        onSelectProductForSpecs(product);
                      }}
                      className="block relative aspect-square w-full rounded-xl bg-slate-950/80 border border-slate-800/80 p-4 overflow-hidden group cursor-pointer"
                      title={loc.name}
                    >
                      {/* Image 1: Authentic Factory Photograph */}
                      <img
                        src={product.images?.referenceReal || product.images?.front || product.image}
                        alt={loc.imageAlt || `${loc.name} - تصویر واقعی کپسول گاز مایع تولید کارخانه`}
                        width={300}
                        height={300}
                        style={{ aspectRatio: '1/1' }}
                        className={`max-h-full max-w-full object-contain mx-auto transition-all duration-300 ${
                          product.images?.realisticRender ? 'group-hover:opacity-0 group-hover:scale-95' : 'group-hover:scale-110'
                        }`}
                        loading="lazy"
                        decoding="async"
                      />

                      {/* Image 2: Photorealistic 3D Render (shown on hover) */}
                      {product.images?.realisticRender && (
                        <img
                          src={product.images.realisticRender}
                          alt={`${loc.name} - رندر استودیویی سه‌بعدی واقع گرایانه مخزن و کپسول گاز مایع`}
                          width={300}
                          height={300}
                          style={{ aspectRatio: '1/1' }}
                          className="max-h-full max-w-full object-contain mx-auto transition-all duration-300 absolute inset-0 m-auto p-4 opacity-0 group-hover:opacity-100 group-hover:scale-105 pointer-events-none"
                          loading="lazy"
                          decoding="async"
                        />
                      )}

                      {/* View Indicator Badge */}
                      <div className="absolute top-2 left-2 z-10 flex items-center gap-1">
                        <span className="px-2 py-0.5 rounded-md bg-slate-900/90 border border-slate-700/70 text-[10px] text-slate-300 font-medium">
                          {product.images?.realisticRender ? (currentLanguage === 'fa' ? 'عکس واقعی + رندر ۲' : currentLanguage === 'de' ? 'Werksfoto + 3D' : 'Real + 3D Render') : (currentLanguage === 'fa' ? 'عکس واقعی' : currentLanguage === 'de' ? 'Werksfoto' : 'Real Photo')}
                        </span>
                      </div>

                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="px-3 py-1.5 rounded-full bg-slate-900/90 text-emerald-400 text-xs font-bold flex items-center gap-1.5 shadow-lg border border-emerald-500/30">
                          <Eye className="w-3.5 h-3.5" />
                          <span>{currentLanguage === 'fa' ? 'مشاهده مشخصات فنی' : currentLanguage === 'de' ? 'Spezifikationen ansehen' : 'View Specifications'}</span>
                        </span>
                      </div>
                    </a>

                    {/* Title & Short Description */}
                    <div className="mt-4 space-y-1.5">
                      <h3 className="text-base font-bold text-white leading-snug line-clamp-2">
                        <a
                          href={`/products/${product.slug}`}
                          onClick={(e) => {
                            e.preventDefault();
                            onSelectProductForSpecs(product);
                          }}
                          className="hover:text-emerald-400 transition-colors"
                        >
                          {loc.name}
                        </a>
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {loc.shortDescription}
                      </p>
                    </div>
                  </div>

                  {/* Specs Snapshot */}
                  <div className="space-y-3 pt-3 border-t border-slate-800/80">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-800/60">
                        <span className="text-[10px] text-slate-500 block">{t.emptyWeight}</span>
                        <span className="font-mono font-bold text-slate-200">{product.emptyWeightKg} {t.unitKg}</span>
                      </div>
                      <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-800/60">
                        <span className="text-[10px] text-slate-500 block">{t.cylinderHeight}</span>
                        <span className="font-mono font-bold text-slate-200">{product.heightCm} {t.unitCm}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <a
                        href={`/products/${product.slug}`}
                        onClick={(e) => {
                          e.preventDefault();
                          onSelectProductForSpecs(product);
                        }}
                        className="w-full py-2 px-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 text-xs font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer"
                        title={`${loc.name} - ${currentLanguage === 'fa' ? 'نقشه و تست فشار' : 'Blueprint & 3D'}`}
                      >
                        <Compass className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{currentLanguage === 'fa' ? 'نقشه و مشخصات' : 'Specs & 3D'}</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => onAddToRfq(product)}
                        className="w-full py-2 px-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{t.navCalculator || 'Add to RFQ'}</span>
                      </button>
                    </div>
                  </div>

                </div>
              </GlowCard>
            );
          })}
        </div>

        {/* View All Store Products Button */}
        <div className="mt-12 text-center">
          <a
            href="/products"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all"
          >
            <Layers className="w-5 h-5" />
            <span>
              {currentLanguage === 'fa'
                ? 'ورود به فروشگاه مستقل و مشاهده مشخصات کامل تمام ۱۴ مدل'
                : 'Enter Official Store & Explore All 14 Models'}
            </span>
          </a>
        </div>

      </div>

      {/* 100% Viewport Height Floating Image Preview on Hover (Desktop requirement 1) */}
      {hoveredPreviewImage && (
        <div className="hidden lg:flex fixed inset-0 z-50 pointer-events-none items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative h-full max-h-[92vh] aspect-[4/3] rounded-3xl bg-slate-950/95 border border-emerald-500/40 p-4 shadow-2xl shadow-emerald-500/20 flex items-center justify-center">
            <img
              src={hoveredPreviewImage}
              alt="High Definition Full Height Preview"
              className="h-full w-full object-contain"
            />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-emerald-500/50 text-emerald-400 text-xs font-bold">
              {currentLanguage === 'fa' ? 'پیش‌نمایش ۱۰۰٪ ارتفاع کارخانه ام گاز' : '100% Full Height View'}
            </div>
          </div>
        </div>
      )}

    </section>
  );
};
