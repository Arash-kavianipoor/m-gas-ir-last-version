import React, { useState, useMemo } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { PRODUCTS } from '../data/products';
import { Product, ProductCategory } from '../types';
import { GlowCard } from './ui/GlowCard';
import { Link } from '../router/RouterContext';
import {
  Layers,
  Search,
  Filter,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Send,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  Flame,
  Award,
  Truck,
  Box,
  Scale,
  Gauge,
  Sparkles,
} from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';
import { COMPANY_INFO } from '../data/company';

interface ProductsPageProps {
  onAddToRfq: (product: Product) => void;
  onOpenSpecsModal?: (product: Product) => void;
}

export const ProductsPage: React.FC<ProductsPageProps> = ({ onAddToRfq, onOpenSpecsModal }) => {
  const { currentLanguage, isRTL, t, formatNumber } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  const categories = useMemo(() => {
    return [
      { id: 'all', label: t.categoryAll, count: PRODUCTS.length },
      {
        id: 'workshops',
        label: t.categoryWorkshops,
        count: PRODUCTS.filter((p) => p.category === 'workshops').length,
      },
      {
        id: 'home',
        label: t.categoryHome,
        count: PRODUCTS.filter((p) => p.category === 'home').length,
      },
      {
        id: 'automotive',
        label: t.categoryAutomotive,
        count: PRODUCTS.filter((p) => p.category === 'automotive').length,
      },
    ];
  }, [t]);

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((product) => {
      const loc = product.locales[currentLanguage] || product.locales.fa || product.locales.en;
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        loc.name.toLowerCase().includes(query) ||
        loc.shortDescription.toLowerCase().includes(query) ||
        product.slug.toLowerCase().includes(query) ||
        String(product.volume).includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery, currentLanguage]);

  return (
    <div className="min-h-screen bg-[#050D12] text-slate-100 pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center gap-2 text-xs text-slate-400">
            <li>
              <Link to="/" className="hover:text-emerald-400 transition-colors">
                {isRTL ? 'صفحه اصلی' : 'Home'}
              </Link>
            </li>
            <li>
              <ChevronRight className={`w-3.5 h-3.5 text-slate-600 ${isRTL ? 'rotate-180' : ''}`} />
            </li>
            <li className="text-emerald-400 font-semibold" aria-current="page">
              {isRTL ? 'فروشگاه و کاتالوگ محصولات' : 'Products & Catalog'}
            </li>
          </ol>
        </nav>

        {/* Header Hero Section with Target Keywords */}
        <header className="mb-10 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-medium mb-4">
            <Flame className="w-4 h-4 text-emerald-400" />
            <span>
              {isRTL
                ? 'کمپانی تولید سیلندر گاز مایع در ایران | کاتالوگ رسمی کارخانه ام گاز'
                : 'Premier LPG Cylinder Manufacturing Company in Iran | Official Store'}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-4">
            {isRTL
              ? 'کاتالوگ و فروشگاه کمپانی تولید سیلندر گاز مایع در ایران'
              : 'LPG Gas Cylinders Store & Complete Engineering Catalog'}
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl mx-auto">
            {isRTL
              ? 'مجموعه کامل ۱۳ مدل کپسول گاز مایع از ۰.۵ تا ۶۰ لیتری و مخازن استاندارد اتوگاز خودرو، تولید شده در برترین کمپانی تولید سیلندر گاز مایع در ایران با گواهی استاندارد ملی ISIRI 841، آزمون ۱۰۰٪ هیدرواستاتیک ۳۰ بار و جوشکاری اتوماتیک زیرپودری.'
              : 'Explore the full portfolio of 13 certified LPG cylinders (0.5L to 60L) and automotive autogas tanks manufactured by Iran’s leading LPG cylinder manufacturing company under ISO 9001 and strict 30-bar pressure proof testing.'}
          </p>
        </header>

        {/* Controls: Search and Categories */}
        <div className="mb-10 flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
          {/* Categories */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {categories.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                    active
                      ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/25'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span
                    className={`text-[11px] px-1.5 py-0.5 rounded-full ${
                      active ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className={`w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-3' : 'left-3'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isRTL ? 'جستجوی مدل، ظرفیت یا وزن...' : 'Search cylinder model or capacity...'}
              className={`w-full py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 ${
                isRTL ? 'pr-9 pl-3 text-right' : 'pl-9 pr-3 text-left'
              }`}
            />
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const loc = product.locales[currentLanguage] || product.locales.fa || product.locales.en;
            return (
              <GlowCard key={product.id} className="flex flex-col justify-between group overflow-hidden">
                <div>
                  {/* Product Image & Badges */}
                  <div className="relative aspect-4/3 overflow-hidden rounded-xl bg-gradient-to-b from-slate-900 to-slate-950 p-4 flex items-center justify-center border border-slate-800/80">
                    <img
                      src={product.image}
                      alt={loc.name}
                      loading="lazy"
                      className="max-h-full max-w-full object-contain filter drop-shadow-2xl transition-transform duration-300 group-hover:scale-105"
                    />

                    {/* Popular / New Badges */}
                    <div className="absolute top-2.5 right-2.5 flex flex-col gap-1">
                      {product.isPopular && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow">
                          {isRTL ? 'پرفروش‌ترین' : 'Popular'}
                        </span>
                      )}
                      {product.category === 'automotive' && (
                        <span className="px-2 py-0.5 rounded-full bg-blue-500 text-white text-[10px] font-black uppercase tracking-wider shadow">
                          Auto LPG
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded bg-slate-950/80 border border-slate-700/60 text-slate-300 text-[11px] font-mono">
                      {product.volume} {loc.name.includes('کیلو') || loc.name.includes('kg') ? t.unitKg : t.unitLiter}
                    </div>
                  </div>

                  {/* Title & Short Description */}
                  <div className="pt-4 pb-2">
                    <Link
                      to={`/products/${product.slug}`}
                      className="block group/link"
                    >
                      <h2 className="text-base font-bold text-white group-hover/link:text-emerald-400 transition-colors line-clamp-1 mb-1">
                        {loc.name}
                      </h2>
                    </Link>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
                      {loc.shortDescription}
                    </p>

                    {/* Technical Highlights Quick Specs Table */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/70 mb-3">
                      <div>
                        <span className="text-slate-500 block">{t.emptyWeight}:</span>
                        <span className="font-semibold text-slate-200 font-mono">
                          {formatNumber(product.emptyWeightKg)} {t.unitKg}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">{t.testPressure}:</span>
                        <span className="font-semibold text-emerald-400 font-mono">
                          {formatNumber(product.testPressureBar)} {t.unitBar}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">{isRTL ? 'ضخامت ورق' : 'Thickness'}:</span>
                        <span className="font-semibold text-slate-200 font-mono">
                          {formatNumber(product.bodyThicknessMm)} {t.unitMm}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">{t.minOrder}:</span>
                        <span className="font-semibold text-amber-400 font-mono">
                          {formatNumber(product.minOrder)} {isRTL ? 'عدد' : 'pcs'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions: View Product Detail & Add to RFQ */}
                <div className="pt-2 border-t border-slate-800/70 flex flex-col gap-2">
                  <Link
                    to={`/products/${product.slug}`}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-700/80"
                  >
                    <span>{isRTL ? 'مشاهده مشخصات کامل و نقشه' : 'View Full Specs & Blueprint'}</span>
                    <ArrowIcon className="w-3.5 h-3.5 text-emerald-400" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => onAddToRfq(product)}
                    className="w-full py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-500/20 active:scale-98 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{t.heroCtaQuote}</span>
                  </button>
                </div>
              </GlowCard>
            );
          })}
        </div>

        {/* Global Logistics & Container Shipping Specs Banner */}
        <section className="mt-16 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-emerald-950/30 border border-slate-800">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-3">
              <Truck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isRTL ? 'لجستیک و حمل و نقل بین‌المللی صادراتی' : 'Export Shipping & Container Logistics'}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
              {isRTL
                ? 'تأمین کانتینری و بسته‌بندی صادراتی کپسول گاز ام گاز'
                : 'Bulk Container Delivery & Certified Packaging by M Gas'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
              {isRTL
                ? 'کارخانه ام گاز به عنوان بزرگترین کمپانی تولید سیلندر گاز مایع در ایران، تمامی محموله‌های صادراتی را با پالت‌بندی اختصاصی، فوم محافظ و چیدمان بهینه کانتینر ۲۰ فوت و ۴۰ فوت های‌کیوب (HQ) همراه با بازرسی بین‌المللی SGS و آزمون هیدرواستاتیک ارسال می‌نماید.'
                : 'As Iran’s leading LPG cylinder manufacturing company, M Gas handles full container loads with customized protective palletization, SGS quality inspection certificates, and optimized stacking for 20ft and 40ft HQ shipping.'}
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                to="/calculator"
                className="py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
              >
                <span>{isRTL ? 'محاسبه آنلاین ظرفیت کانتینر' : 'Online Container Calculator'}</span>
                <ArrowIcon className="w-3.5 h-3.5" />
              </Link>

              <a
                href={`https://wa.me/${COMPANY_INFO.contacts.internationalSalesManager.whatsapp.replace('+', '')}?text=${encodeURIComponent(
                  'Hello M Gas, I am inquiring about wholesale cylinder orders.'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-xs flex items-center gap-2 transition-all border border-slate-700"
              >
                <WhatsAppIcon className="w-4 h-4 text-emerald-400" />
                <span>{isRTL ? 'مشاوره سفارش با مدیر فروش در واتس‌اپ' : 'Contact Sales Manager'}</span>
              </a>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};
