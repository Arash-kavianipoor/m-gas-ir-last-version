/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';
import { RouterProvider, useRouter, Link } from './router/RouterContext';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { CustomerBrandsStrip } from './components/CustomerBrandsStrip';
import { ProductCatalog } from './components/ProductCatalog';
import { QualityProcess } from './components/QualityProcess';
import { FactoryVideoTour } from './components/FactoryVideoTour';
import { ArticlesSection } from './components/ArticlesSection';
import { ArticleDetail } from './components/ArticleDetail';
import { HistoryVision } from './components/HistoryVision';
import { FaqSection } from './components/FaqSection';
import { RfqCalculator } from './components/RfqCalculator';
import { ContactSection } from './components/ContactSection';
import { HoverFooter } from './components/ui/HoverFooter';
import { TechnicalSpecsModal } from './components/TechnicalSpecsModal';
import { MeniscusMobileNav } from './components/MeniscusMobileNav';
import { ProductsPage } from './components/ProductsPage';
import { ProductDetailPage } from './components/ProductDetailPage';
import { Product, RfqItem } from './types';
import {
  ArrowUp,
  ChevronRight,
  Flame,
  Layers,
  ShieldCheck,
  Video,
  BookOpen,
  Building2,
  Award,
  Calculator,
  Phone,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import { WhatsAppIcon } from './components/WhatsAppIcon';
import { COMPANY_INFO } from './data/company';
import { TECHNICAL_ARTICLES, Article } from './data/articles';
import { PRODUCTS } from './data/products';
import { SeoHead } from './seo/SeoHead';
import { scrollToTop as smoothOrInstantScrollToTop } from './utils/scrollHelper';

function MainWebsite() {
  const { currentLanguage, isRTL, t } = useLanguage();
  const { currentPath, navigate } = useRouter();
  const [selectedProductForSpecs, setSelectedProductForSpecs] = useState<Product | null>(null);
  const [rfqItems, setRfqItems] = useState<RfqItem[]>([]);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  // Resolve matching product or article based on clean URL path
  const matchedProduct = useMemo(() => {
    if (currentPath.startsWith('/products/')) {
      const slug = currentPath.replace('/products/', '').split('?')[0].split('#')[0];
      return PRODUCTS.find((p) => p.slug === slug || p.id === slug) || null;
    }
    return null;
  }, [currentPath]);

  const matchedArticle = useMemo(() => {
    if (currentPath.startsWith('/articles/')) {
      const slug = currentPath.replace('/articles/', '').split('?')[0].split('#')[0];
      return TECHNICAL_ARTICLES.find((a) => a.slug === slug || a.id === slug) || null;
    }
    return null;
  }, [currentPath]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleOpenRfq = () => {
    navigate('/calculator');
    smoothOrInstantScrollToTop();
  };

  const handleExploreProducts = () => {
    navigate('/products');
    smoothOrInstantScrollToTop();
  };

  const handleAddToRfq = (product: Product, selectedColor?: { code: string; nameFa: string; nameEn: string } | null) => {
    const ralStr = selectedColor ? `${selectedColor.code} - ${selectedColor.nameEn}` : (product.defaultRalCode || 'RAL 6018');
    setRfqItems((prev) => {
      const exists = prev.find((item) => item.productId === product.id && item.selectedRalColor === ralStr);
      if (exists) {
        return prev.map((item) =>
          item.productId === product.id && item.selectedRalColor === ralStr
            ? { ...item, quantity: item.quantity + product.minOrder }
            : item
        );
      }
      return [...prev, { productId: product.id, quantity: product.minOrder, selectedRalColor: ralStr }];
    });

    navigate('/calculator');
    smoothOrInstantScrollToTop();
  };

  const scrollToTop = () => {
    smoothOrInstantScrollToTop();
  };

  const isVazir = isRTL || currentLanguage === 'fa' || currentLanguage === 'ar';

  // Render standalone page views
  const renderContent = () => {
    // 1. Standalone Single Product Detail Page
    if (currentPath.startsWith('/products/') && matchedProduct) {
      return (
        <ProductDetailPage
          product={matchedProduct}
          onAddToRfq={handleAddToRfq}
        />
      );
    }

    // 2. Standalone Products & Shop Catalog Page
    if (currentPath === '/products' || (currentPath.startsWith('/products/') && !matchedProduct)) {
      return (
        <ProductsPage
          onAddToRfq={handleAddToRfq}
          onOpenSpecsModal={(p) => setSelectedProductForSpecs(p)}
        />
      );
    }

    // 3. Standalone Single Article Reader Page
    if (currentPath.startsWith('/articles/') && matchedArticle) {
      return (
        <ArticleDetail
          article={matchedArticle}
          onBack={() => navigate('/articles')}
          onSelectArticle={(a) => navigate('/articles/' + a.slug)}
          onOpenRfq={handleOpenRfq}
        />
      );
    }

    // 4. Standalone Quality & Standards Page
    if (currentPath === '/quality') {
      return (
        <div className="pt-24 pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
            <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6">
              <Link to="/" className="hover:text-emerald-400 transition-colors">{t.navHome}</Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600 rtl:rotate-180" />
              <span className="text-emerald-400 font-semibold">{t.navQuality}</span>
            </nav>
            <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-900/90 via-[#0a1824]/90 to-slate-900/90 border border-emerald-500/30 shadow-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4">
                <ShieldCheck className="w-4 h-4" />
                <span>{isRTL ? 'استاندارد ملی و بین‌المللی ۳۰ بار فشار' : '30-Bar Hydrostatic Proof Standards'}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-4">
                {isRTL
                  ? 'کنترل کیفیت، آزمون ۳۰ بار و استانداردهای کمپانی تولید سیلندر گاز مایع در ایران'
                  : 'Quality Assurance & 30-Bar Testing at Premier LPG Cylinder Manufacturer in Iran'}
              </h1>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-4xl">
                {isRTL
                  ? 'تمامی سیلندرهای تولیدی کارخانه ام گاز از ورق‌های فولادی استاندارد مخازن تحت فشار، پرس هیدرولیک کشش عمیق، جوشکاری مکانیزه زیرپودری SAW، کوره تنش‌زدایی یکنواخت و آزمون فشار هیدرواستاتیک ۱۰۰٪ با ۳۰ بار فشار تولید و صادر می‌شوند.'
                  : 'Every liquefied petroleum gas cylinder manufactured at M Gas undergoes deep drawing hydraulic forming, submerged arc welding (SAW), stress-relief heat treatment, and 100% individual 30-bar hydrostatic proof pressure verification.'}
              </p>
            </div>
          </div>
          <QualityProcess />
          <CustomerBrandsStrip />
        </div>
      );
    }

    // 5. Standalone Factory Video Tour Page
    if (currentPath === '/factory-tour') {
      return (
        <div className="pt-24 pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
            <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6">
              <Link to="/" className="hover:text-emerald-400 transition-colors">{t.navHome}</Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600 rtl:rotate-180" />
              <span className="text-emerald-400 font-semibold">{isRTL ? 'مستند ویدئویی خطوط تولید' : 'Factory Video Tour'}</span>
            </nav>
            <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-900/90 via-[#0a1824]/90 to-slate-900/90 border border-cyan-500/30 shadow-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-4">
                <Video className="w-4 h-4" />
                <span>{isRTL ? 'مستند کارخانه ام گاز کرج' : 'Documentary Video Tour'}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-4">
                {isRTL
                  ? 'مستند ویدئویی خطوط تولید کارخانه ام گاز؛ مدیریت موسی عمویی'
                  : 'Factory Video Tour & Automated Production Lines | M Gas Factory'}
              </h1>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-4xl">
                {isRTL
                  ? 'مشاهده ۵ ویدئوی اختصاصی با کیفیت بالا از مراحل ساخت، جوشکاری مکانیزه زیرپودری، بازرسی چشمی و نظارت مستقیم آقای موسی عمویی مدیر و بنیانگذار کارخانه ام گاز در کرج.'
                  : 'Experience five authentic factory production videos showcasing press lines, automated submerged arc welding, hydrostatic burst testing, and executive leadership by Mousa Amooie.'}
              </p>
            </div>
          </div>
          <FactoryVideoTour />
        </div>
      );
    }

    // 6. Standalone Articles Knowledge Base Page
    if (currentPath === '/articles') {
      return (
        <div className="pt-24 pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
            <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6">
              <Link to="/" className="hover:text-emerald-400 transition-colors">{t.navHome}</Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600 rtl:rotate-180" />
              <span className="text-emerald-400 font-semibold">{t.navArticles}</span>
            </nav>
            <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-900/90 via-[#0a1824]/90 to-slate-900/90 border border-emerald-500/30 shadow-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4">
                <BookOpen className="w-4 h-4" />
                <span>{isRTL ? 'مرجع متالورژی و ایمنی مهندسی' : 'Engineering Knowledge Base'}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-4">
                {isRTL
                  ? 'مقالات مهندسی و متالورژی کمپانی تولید سیلندر گاز مایع در ایران'
                  : 'Engineering & Metallurgy Articles | LPG Cylinder Manufacturing Standards'}
              </h1>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-4xl">
                {isRTL
                  ? 'تحلیل جامع استانداردهای ساخت کپسول گاز، متالورژی ورق‌های فولادی مخازن تحت فشار، بازرسی رادیوگرافی جوش، الزامات NFPA 58 و دستورالعمل‌های بین‌المللی حمل‌ونقل ADR.'
                  : 'In-depth engineering analyses covering pressure vessel steel metallurgy, submerged arc weld inspection, NFPA 58 standards, and international hazardous material transport protocols.'}
              </p>
            </div>
          </div>
          <ArticlesSection onSelectArticle={(a) => navigate('/articles/' + a.slug)} />
        </div>
      );
    }

    // 7. Standalone Heritage & Leadership Page
    if (currentPath === '/about' || currentPath === '/history') {
      return (
        <div className="pt-24 pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
            <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6">
              <Link to="/" className="hover:text-emerald-400 transition-colors">{t.navHome}</Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600 rtl:rotate-180" />
              <span className="text-emerald-400 font-semibold">{t.navHistory}</span>
            </nav>
            <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-900/90 via-[#0a1824]/90 to-slate-900/90 border border-emerald-500/30 shadow-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4">
                <Building2 className="w-4 h-4" />
                <span>{isRTL ? 'بیش از ۵۰ سال افتخار صنعتی (۱۳۴۹)' : 'Over 50 Years Industrial Legacy (Est. 1970)'}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-4">
                {isRTL
                  ? 'تاریخچه و پیشینه کمپانی تولید سیلندر گاز مایع در ایران؛ مدیریت موسی عمویی'
                  : '50+ Years Heritage & Vision | Premier LPG Cylinder Manufacturer in Iran'}
              </h1>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-4xl">
                {isRTL
                  ? 'از سال ۱۳۴۹ تا کنون، کارخانه ام گاز با مدیریت و بنیانگذاری آقای موسی عمویی در خط مقدم صنعت مخازن تحت فشار ایران و خاورمیانه قرار داشته و صادرات به بیش از ۱۲ کشور را ثبت نموده است.'
                  : 'Since 1970, M Gas Factory under the executive leadership of Mousa Amooie has manufactured certified LPG cylinders powering industries and homes across Iran and over 12 global export hubs.'}
              </p>
            </div>
          </div>
          <HistoryVision />
        </div>
      );
    }

    // 8. Standalone FAQ & Compliance Page
    if (currentPath === '/faq') {
      return (
        <div className="pt-24 pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
            <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6">
              <Link to="/" className="hover:text-emerald-400 transition-colors">{t.navHome}</Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600 rtl:rotate-180" />
              <span className="text-emerald-400 font-semibold">{isRTL ? 'پرسش‌های متداول' : 'FAQ'}</span>
            </nav>
            <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-900/90 via-[#0a1824]/90 to-slate-900/90 border border-amber-500/30 shadow-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-4">
                <Award className="w-4 h-4" />
                <span>{isRTL ? 'پاسخ به سوالات فنی و بازرگانی' : 'Technical & Commercial FAQ'}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-4">
                {isRTL
                  ? 'سوالات متداول خریداران کپسول گاز مایع؛ کمپانی تولید سیلندر در ایران'
                  : 'Frequently Asked Questions | LPG Cylinder Manufacturing & Export'}
              </h1>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-4xl">
                {isRTL
                  ? 'پاسخ به پرسش‌های رایج در زمینه فشار کاری و تست، ضخامت ورق‌های فولادی، شرایط کانتینربندی صادراتی و حداقل تیراژ تولید سفارشی.'
                  : 'Clear, engineering-verified answers to common questions regarding working pressure, steel thickness, MOQ, container capacity, and color customization.'}
              </p>
            </div>
          </div>
          <FaqSection onOpenRfq={handleOpenRfq} />
        </div>
      );
    }

    // 9. Standalone RFQ & Logistics Calculator Page
    if (currentPath === '/calculator') {
      return (
        <div className="pt-24 pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
            <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6">
              <Link to="/" className="hover:text-emerald-400 transition-colors">{t.navHome}</Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600 rtl:rotate-180" />
              <span className="text-emerald-400 font-semibold">{t.navCalculator}</span>
            </nav>
            <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-900/90 via-[#0a1824]/90 to-slate-900/90 border border-pink-500/30 shadow-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-400 text-xs font-bold uppercase tracking-wider mb-4">
                <Calculator className="w-4 h-4" />
                <span>{isRTL ? 'محاسبه کانتینربندی و استعلام آنلاین' : 'Container Logistics & Online RFQ'}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-4">
                {isRTL
                  ? 'استعلام قیمت عمده و محاسبه ظرفیت بارگیری کانتینر کپسول گاز'
                  : 'Online RFQ & Shipping Container Loading Capacity Calculator'}
              </h1>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-4xl">
                {isRTL
                  ? 'تعداد کپسول مورد نیاز خود را وارد کنید تا ظرفیت کانتینر ۲۰ فوت، ۴۰ فوت های‌کیوب (HQ)، وزن ناخالص و پیش‌فاکتور رسمی به صورت زنده محاسبه و مستقیماً برای واحد فروش صادر شود.'
                  : 'Enter your desired cylinder quantities to instantly compute 20ft and 40ft HQ container loading capacities, gross shipping tonnage, and dispatch directly to M Gas export directorate.'}
              </p>
            </div>
          </div>
          <RfqCalculator
            initialItems={rfqItems}
            onClearItems={() => setRfqItems([])}
          />
        </div>
      );
    }

    // 10. Standalone Contact & Location Page
    if (currentPath === '/contact') {
      return (
        <div className="pt-24 pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
            <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6">
              <Link to="/" className="hover:text-emerald-400 transition-colors">{t.navHome}</Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600 rtl:rotate-180" />
              <span className="text-emerald-400 font-semibold">{t.navContact}</span>
            </nav>
            <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-900/90 via-[#0a1824]/90 to-slate-900/90 border border-emerald-500/30 shadow-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4">
                <Phone className="w-4 h-4" />
                <span>{isRTL ? 'تماس با واحد فروش و آدرس کارخانه کرج' : 'Karaj Factory Location & Export Contact'}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-4">
                {isRTL
                  ? 'تماس با کارخانه، نشانی کرج و واحد فروش کمپانی تولید سیلندر گاز مایع در ایران'
                  : 'Contact Karaj Factory & International Export Directorate | M Gas'}
              </h1>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-4xl">
                {isRTL
                  ? 'ارتباط مستقیم با مدیریت کارخانه ام گاز (آقای موسی عمویی)، ساعات کاری، لوکیشن کارخانه در کرج و مشاوره تخصصی در واتس‌اپ.'
                  : 'Direct inquiry with M Gas factory management in Karaj, working hours, exact factory location, and instant WhatsApp international sales support.'}
              </p>
            </div>
          </div>
          <ContactSection />
        </div>
      );
    }

    // Default Home Page View (Full showcase)
    return (
      <main className="relative">
        {/* Hero Section */}
        <Hero
          onOpenRfq={handleOpenRfq}
          onExploreProducts={handleExploreProducts}
        />

        {/* OEM & Customer Brands Trust Bar */}
        <CustomerBrandsStrip />

        {/* 14 Gas Cylinders Catalog Preview with link to /products */}
        <ProductCatalog
          onSelectProductForSpecs={(p) => navigate('/products/' + p.slug)}
          onAddToRfq={handleAddToRfq}
        />

        {/* 30-Bar Hydrostatic Testing & Metallurgical Process */}
        <QualityProcess />

        {/* Factory Video Tour */}
        <FactoryVideoTour />

        {/* Technical Articles */}
        <ArticlesSection onSelectArticle={(a) => navigate('/articles/' + a.slug)} />

        {/* 50-Year Heritage (Est. 1970) */}
        <HistoryVision />

        {/* Frequently Asked Questions */}
        <FaqSection onOpenRfq={handleOpenRfq} />

        {/* RFQ Logistics & Container Estimator */}
        <RfqCalculator
          initialItems={rfqItems}
          onClearItems={() => setRfqItems([])}
        />

        {/* Factory Address in Karaj & Direct Contacts */}
        <ContactSection />
      </main>
    );
  };

  return (
    <div className={`min-h-screen bg-[#050D12] text-slate-100 selection:bg-emerald-500 selection:text-slate-950 ${isVazir ? 'font-vazirmatn' : 'font-sans'}`}>
      {/* Centralized Clean Multilingual SEO Engine & JSON-LD Syncer */}
      <SeoHead
        currentPath={currentPath}
        activeArticle={matchedArticle}
        activeProduct={matchedProduct || selectedProductForSpecs}
      />
      
      {/* Sticky Header with Clean URL Routing */}
      <Header onOpenRfq={handleOpenRfq} />

      {/* Dynamic Content View */}
      {renderContent()}

      {/* Hover Footer */}
      <HoverFooter />

      {/* Technical Drawing Modal */}
      <TechnicalSpecsModal
        product={selectedProductForSpecs}
        onClose={() => setSelectedProductForSpecs(null)}
        onAddToRfq={handleAddToRfq}
      />

      {/* Meniscus Interactive Dock Navigation (Mobile & Tablet) */}
      <MeniscusMobileNav
        onOpenRfq={handleOpenRfq}
        onExploreProducts={handleExploreProducts}
      />

      {/* Floating Action Buttons */}
      <div
        className={`fixed bottom-22 sm:bottom-24 lg:bottom-6 z-40 flex flex-col items-center gap-3 ${
          isRTL ? 'left-4 sm:left-6' : 'right-4 sm:right-6'
        }`}
      >
        {showScrollTop && (
          <button
            type="button"
            onClick={scrollToTop}
            className="p-2.5 sm:p-3 rounded-full bg-slate-900 lg:bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 shadow-xl lg:backdrop-blur-md transition-all transform hover:-translate-y-1"
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        )}

        <a
          href={`https://wa.me/${COMPANY_INFO.contacts.internationalSalesManager.whatsapp.replace('+', '')}?text=Hello%20M%20Gas%20International%20Sales`}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 shadow-2xl shadow-[#25D366]/40 transition-all transform hover:scale-105 active:scale-95"
          title={t.salesManagerWhatsApp}
        >
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="hidden lg:inline-flex animate-ping absolute h-full w-full rounded-full bg-[#25D366] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#128C7E]"></span>
          </span>
          <WhatsAppIcon className="w-6 h-6 sm:w-7 sm:h-7 text-slate-950" />
        </a>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <RouterProvider>
      <LanguageProvider>
        <MainWebsite />
      </LanguageProvider>
    </RouterProvider>
  );
}
