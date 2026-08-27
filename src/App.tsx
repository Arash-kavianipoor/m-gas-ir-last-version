/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';
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
import { Product, RfqItem } from './types';
import { MessageCircle, Phone, ArrowUp } from 'lucide-react';
import { COMPANY_INFO } from './data/company';
import { TECHNICAL_ARTICLES, Article } from './data/articles';
import { SeoHead } from './seo/SeoHead';
import { scrollToElement, scrollToTop as smoothOrInstantScrollToTop } from './utils/scrollHelper';

function MainWebsite() {
  const { currentLanguage, isRTL, t } = useLanguage();
  const [selectedProductForSpecs, setSelectedProductForSpecs] = useState<Product | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [rfqItems, setRfqItems] = useState<RfqItem[]>([]);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Synchronize URL hash with selected article for deep-linking and SEO
  useEffect(() => {
    const parseHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#article=')) {
        const slug = hash.replace('#article=', '').split('&')[0];
        const match = TECHNICAL_ARTICLES.find((a) => a.slug === slug || a.id === slug);
        if (match) {
          setSelectedArticle(match);
          return;
        }
      }
      if (!hash.startsWith('#article=')) {
        setSelectedArticle(null);
      }
    };

    parseHash();
    window.addEventListener('hashchange', parseHash, { passive: true });
    return () => window.removeEventListener('hashchange', parseHash);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleOpenArticle = (article: Article) => {
    setSelectedArticle(article);
    window.location.hash = `article=${article.slug}`;
    smoothOrInstantScrollToTop();
  };

  const handleCloseArticle = () => {
    setSelectedArticle(null);
    window.location.hash = 'articles';
  };

  const handleOpenRfq = () => {
    if (selectedArticle) {
      setSelectedArticle(null);
      window.location.hash = 'calculator';
      setTimeout(() => {
        scrollToElement('calculator');
      }, 100);
      return;
    }
    scrollToElement('calculator');
  };

  const handleExploreProducts = () => {
    scrollToElement('products');
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

    // Scroll to the calculator
    handleOpenRfq();
  };

  const scrollToTop = () => {
    smoothOrInstantScrollToTop();
  };

  return (
    <div className={`min-h-screen bg-[#050D12] text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950 ${isRTL ? 'font-vazirmatn' : ''}`}>
      {/* Centralized Multilingual SEO Engine & JSON-LD Syncer */}
      <SeoHead activeArticle={selectedArticle} />
      
      {/* Sticky Shrinking Header */}
      {!selectedArticle && <Header onOpenRfq={handleOpenRfq} />}

      {/* Main Content Flow or Dedicated Article Reader View */}
      {selectedArticle ? (
        <ArticleDetail
          article={selectedArticle}
          onBack={handleCloseArticle}
          onSelectArticle={handleOpenArticle}
          onOpenRfq={handleOpenRfq}
        />
      ) : (
        <main className="relative">
          {/* Hero Section with 30px bottom radius and glassmorphism styling */}
          <Hero
            onOpenRfq={handleOpenRfq}
            onExploreProducts={handleExploreProducts}
          />

          {/* Minimal Customer & OEM Brands Trust Bar */}
          <CustomerBrandsStrip />

          {/* 13 Gas Cylinders Catalog with GlowCards & Technical Filters */}
          <ProductCatalog
            onSelectProductForSpecs={setSelectedProductForSpecs}
            onAddToRfq={handleAddToRfq}
          />

          {/* Engineering Quality, 30-Bar Hydrostatic Testing & Metallurgical Process */}
          <QualityProcess />

          {/* Factory Video Tour & Production Line Footage (Including Managing Director Mr. Mousa Amooie Inspection) */}
          <FactoryVideoTour />

          {/* Technical Articles & Engineering Knowledge Base */}
          <ArticlesSection onSelectArticle={handleOpenArticle} />

          {/* 50-Year Heritage (Est. 1970), Vision & 12+ Export Destinational Hubs */}
          <HistoryVision />

          {/* Frequently Asked Questions: Manufacturing, 30-Bar Testing, Shipping & ISO Certifications */}
          <FaqSection onOpenRfq={handleOpenRfq} />

          {/* Interactive RFQ Logistics & Container Estimator with WhatsApp Dispatch */}
          <RfqCalculator
            initialItems={rfqItems}
            onClearItems={() => setRfqItems([])}
          />

          {/* Factory Address in Karaj, Shift Work Hours & Direct Contacts */}
          <ContactSection />
        </main>
      )}

      {/* Hover Footer with Animated Brand Gradient & Spotlight */}
      <HoverFooter />

      {/* Interactive Blueprint & Technical Drawing Modal */}
      <TechnicalSpecsModal
        product={selectedProductForSpecs}
        onClose={() => setSelectedProductForSpecs(null)}
        onAddToRfq={handleAddToRfq}
      />

      {/* Meniscus Interactive Fluid Dock Navigation (Strictly Mobile & Tablet View) */}
      <MeniscusMobileNav
        onOpenRfq={handleOpenRfq}
        onExploreProducts={handleExploreProducts}
        activeSectionOverride={selectedArticle ? 'articles' : null}
      />

      {/* Floating Quick WhatsApp Action Button (bottom right / left based on RTL, lifted on mobile for Meniscus Dock clearance) */}
      <div
        className={`fixed bottom-22 sm:bottom-24 lg:bottom-6 z-40 flex flex-col items-center gap-3 ${
          isRTL ? 'left-4 sm:left-6' : 'right-4 sm:right-6'
        }`}
      >
        {/* Scroll To Top button */}
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

        {/* Direct WhatsApp Manager Float */}
        <a
          href={`https://wa.me/${COMPANY_INFO.contacts.internationalSalesManager.whatsapp.replace('+', '')}?text=Hello%20M%20Gas%20International%20Sales`}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-2xl shadow-emerald-500/40 transition-all transform hover:scale-105 active:scale-95"
          title={t.salesManagerWhatsApp}
        >
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="hidden lg:inline-flex animate-ping absolute h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600"></span>
          </span>
          <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 fill-slate-950" />
        </a>
      </div>

    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <MainWebsite />
    </LanguageProvider>
  );
}
