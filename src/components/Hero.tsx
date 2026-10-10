import React, { useState, useEffect, useRef } from 'react';
import {
  Flame,
  ShieldCheck,
  Award,
  Globe2,
  ArrowRight,
  ArrowLeft,
  MessageCircle,
  Calculator,
  Layers,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Factory,
  Maximize2,
  X,
  Sparkles,
  Car,
  Wrench,
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { COMPANY_INFO } from '../data/company';
import { HERO_BANNERS, HeroBannerSlide } from '../data/heroBanners';

interface HeroProps {
  onOpenRfq: () => void;
  onExploreProducts: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenRfq, onExploreProducts }) => {
  const { t, isRTL, currentLanguage } = useLanguage();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const SLIDE_DURATION = 6500; // 6.5 seconds per slide
  const totalSlides = HERO_BANNERS.length;
  const currentSlide: HeroBannerSlide = HERO_BANNERS[currentSlideIndex];

  // Auto-slide effect
  useEffect(() => {
    if (isPlaying && !isZoomOpen) {
      timerRef.current = setInterval(() => {
        setCurrentSlideIndex((prev) => (prev + 1) % totalSlides);
      }, SLIDE_DURATION);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying, isZoomOpen, totalSlides, currentSlideIndex]);

  const handleNext = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % totalSlides);
  };

  const handlePrev = () => {
    setCurrentSlideIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const handleSlideSelect = (index: number) => {
    setCurrentSlideIndex(index);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        if (isRTL) handlePrev();
        else handleNext();
      } else {
        if (isRTL) handleNext();
        else handlePrev();
      }
    }
    setTouchStartX(null);
  };

  const getLoc = (record: Record<string, any>) => {
    return record[currentLanguage] || record['fa'] || record['en'] || '';
  };

  const getSlideFeatures = (slide: HeroBannerSlide) => {
    return slide.features[currentLanguage] || slide.features['fa'] || slide.features['en'] || [];
  };

  return (
    <section
      id="hero"
      className="relative w-full pt-20 sm:pt-24 md:pt-28 pb-8 sm:pb-12 overflow-hidden bg-[#071116] border-b border-emerald-950/60"
      onMouseEnter={() => setIsPlaying(false)}
      onMouseLeave={() => setIsPlaying(true)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background ambient lighting - rendered exclusively on desktop GPUs */}
      <div className="hidden lg:block absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="hidden lg:block absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Header Badge */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 sm:mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 backdrop-blur-md shadow-md">
            <Factory className="w-4 h-4 text-emerald-400" />
            <span className="text-xs sm:text-sm font-bold text-emerald-300">
              {getLoc(currentSlide.badge)}
            </span>
          </div>

          {/* Slide Indicator & Controls */}
          <div className="flex items-center gap-2 sm:gap-3 bg-slate-900/80 border border-white/10 px-3 py-1.5 rounded-full backdrop-blur-md">
            <span className="text-xs font-mono text-emerald-400 font-bold">
              0{currentSlideIndex + 1} / 0{totalSlides}
            </span>
            <div className="h-3 w-px bg-slate-700" />
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1 text-slate-300 hover:text-white transition-colors"
              title={isPlaying ? 'توقف موقت اسلایدر' : 'شروع پخش خودکار'}
              aria-label={isPlaying ? 'Pause banner slideshow' : 'Play banner slideshow'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={isRTL ? handleNext : handlePrev}
                className="p-1 text-slate-300 hover:text-white hover:bg-white/10 rounded transition-colors"
                aria-label="Previous banner"
              >
                {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={isRTL ? handlePrev : handleNext}
                className="p-1 text-slate-300 hover:text-white hover:bg-white/10 rounded transition-colors"
                aria-label="Next banner"
              >
                {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* MAIN CINEMATIC HERO BANNER DISPLAY */}
        <div className="rounded-2xl sm:rounded-3xl overflow-hidden border border-emerald-500/30 shadow-2xl bg-slate-950">
          
          {/* Banner Image Stage: 100% Clear & Unobstructed */}
          <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] md:aspect-[2.4/1] lg:aspect-[2.8/1] min-h-[220px] max-h-[460px] overflow-hidden bg-slate-950">
            <div
              key={currentSlide.id}
              className="absolute inset-0 w-full h-full transition-opacity duration-500 ease-out"
            >
              <img
                src={currentSlide.image}
                alt={getLoc(currentSlide.title)}
                width={1400}
                height={500}
                style={{ aspectRatio: '2.8/1' }}
                className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-[1.02]"
                loading="eager"
                decoding="async"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Banner Fullscreen Zoom Button */}
            <button
              type="button"
              onClick={() => setIsZoomOpen(true)}
              className="absolute top-3 end-3 sm:top-4 sm:end-4 z-20 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/75 hover:bg-slate-900 text-white text-xs font-semibold border border-white/20 backdrop-blur-md shadow-lg transition-transform hover:scale-105"
              title="نمایش تصویر بنر با کیفیت اصلی"
            >
              <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">مشاهده تصویر بنر (HD)</span>
            </button>

            {/* Slide Indicator Dots */}
            <div className="absolute bottom-3 inset-x-0 z-20 flex items-center justify-center gap-2">
              {HERO_BANNERS.map((_, dotIdx) => (
                <button
                  key={dotIdx}
                  type="button"
                  onClick={() => handleSlideSelect(dotIdx)}
                  className={`transition-all duration-300 rounded-full ${
                    dotIdx === currentSlideIndex
                      ? 'w-7 h-2 bg-emerald-400 shadow-md shadow-emerald-500/50'
                      : 'w-2 h-2 bg-white/40 hover:bg-white/80'
                  }`}
                  aria-label={`Slide ${dotIdx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* FULL-WIDTH CONTENT BOX BELOW THE IMAGE */}
          <div className="p-5 sm:p-7 md:p-8 bg-gradient-to-b from-slate-900/95 via-slate-950/90 to-[#071116] border-t border-emerald-500/20">
            <div
              key={`content-${currentSlide.id}`}
              className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 transition-all duration-300"
            >
              {/* Left/Main Column: Headings & Details */}
              <div className="space-y-3 max-w-3xl">
                {/* Tagline pill */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-bold backdrop-blur-md">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{getLoc(currentSlide.tagline)}</span>
                </div>

                {/* Main Headline */}
                <h1 className="text-lg sm:text-2xl md:text-3xl font-black text-white leading-tight tracking-tight">
                  {getLoc(currentSlide.title)}
                </h1>

                {/* Highlight subtitle */}
                <p className="text-xs sm:text-sm md:text-base font-bold text-emerald-400 leading-snug">
                  {getLoc(currentSlide.titleHighlight)}
                </p>

                {/* Short Description */}
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {getLoc(currentSlide.description)}
                </p>

                {/* 3 Key Feature Chips */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {getSlideFeatures(currentSlide).map((feat: string, fIdx: number) => (
                    <span
                      key={fIdx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-950 border border-emerald-500/30 text-xs text-slate-200 shadow-sm"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {feat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right Column: Call to Action Buttons */}
              <div className="flex flex-col sm:flex-row lg:flex-col shrink-0 gap-2.5 min-w-[240px]">
                <a
                  href={`https://wa.me/${COMPANY_INFO.contacts.internationalSalesManager.whatsapp.replace('+', '')}?text=Hello%20M%20Gas%20Factory%2C%20I%20would%20like%20to%20inquire%20about%20${encodeURIComponent(getLoc(currentSlide.title))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-xl shadow-emerald-950/60 hover:shadow-emerald-800/80 transition-all transform hover:-translate-y-0.5"
                >
                  <MessageCircle className="w-4 h-4 fill-white/20" />
                  <span>{getLoc(currentSlide.primaryCtaText)}</span>
                  {isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                </a>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={onOpenRfq}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition-colors hover:border-emerald-500/50"
                  >
                    <Calculator className="w-4 h-4 text-emerald-400" />
                    <span>{t.heroCtaQuote}</span>
                  </button>

                  <button
                    type="button"
                    onClick={onExploreProducts}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-700/40 text-xs font-medium transition-colors"
                  >
                    <Layers className="w-4 h-4 text-emerald-400" />
                    <span>{t.heroCtaProducts}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Core Manufacturing Capabilities / SEO Strategic Pillars */}
        <section
          aria-label="Core Manufacturing Capabilities"
          className="mt-6 sm:mt-8 p-3.5 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-slate-900/90 to-teal-950/70 border border-emerald-500/40 backdrop-blur-md shadow-xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            
            {/* Pillar 1: تولید کننده بزرگ سیلندر/کپسول گاز مایع در ایران */}
            <article className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-950/80 border border-emerald-500/20 hover:border-emerald-400/50 transition-all group">
              <div className="shrink-0 w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                <Factory className="w-5 h-5" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400/80 block">
                  Pillar 01 • استانداردهای کشوری و جهانی
                </span>
                <h2 className="text-xs sm:text-sm font-bold text-white group-hover:text-emerald-300 transition-colors leading-snug">
                  {t.seoMetaLpgManufacturerInIran}
                </h2>
              </div>
            </article>

            {/* Pillar 2: تولید کننده انواع سیلندرهای گاز خانگی و صنعتی */}
            <article className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-950/80 border border-teal-500/20 hover:border-teal-400/50 transition-all group">
              <div className="shrink-0 w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400 group-hover:scale-105 transition-transform">
                <Wrench className="w-5 h-5" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <span className="text-[10px] uppercase font-bold tracking-wider text-teal-400/80 block">
                  Pillar 02 • تنوع ابعاد ۰.۵ لیتری تا ۵۰ کیلویی
                </span>
                <h2 className="text-xs sm:text-sm font-bold text-white group-hover:text-teal-300 transition-colors leading-snug">
                  {t.seoMetaDomesticIndustrialCylinders}
                </h2>
              </div>
            </article>

            {/* Pillar 3: تولید کننده مخازن گاز مایع انواع خودرو */}
            <article className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-950/80 border border-cyan-500/20 hover:border-cyan-400/50 transition-all group">
              <div className="shrink-0 w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                <Car className="w-5 h-5" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400/80 block">
                  Pillar 03 • اتوگاز خودرویی استاندارد
                </span>
                <h2 className="text-xs sm:text-sm font-bold text-white group-hover:text-cyan-300 transition-colors leading-snug">
                  {t.seoMetaAutoLpgTanks}
                </h2>
              </div>
            </article>

          </div>
        </section>

        {/* 4 Standard Stats Cards */}
        <div className="mt-6 sm:mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          
          <div className="p-3 sm:p-4 rounded-2xl bg-slate-900/60 border border-emerald-500/20 backdrop-blur-md shadow-md flex flex-col items-center text-center space-y-1 group hover:border-emerald-500/40 transition-colors">
            <div className="w-8 h-8 rounded-xl bg-emerald-950/80 border border-emerald-700/40 flex items-center justify-center mb-0.5 text-emerald-400">
              <Award className="w-4 h-4" />
            </div>
            <span className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight group-hover:text-emerald-300 transition-colors">
              {t.heroStat1Value}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {t.heroStat1Label}
            </span>
          </div>

          <div className="p-3 sm:p-4 rounded-2xl bg-slate-900/60 border border-emerald-500/20 backdrop-blur-md shadow-md flex flex-col items-center text-center space-y-1 group hover:border-emerald-500/40 transition-colors">
            <div className="w-8 h-8 rounded-xl bg-emerald-950/80 border border-emerald-700/40 flex items-center justify-center mb-0.5 text-emerald-400">
              <Globe2 className="w-4 h-4" />
            </div>
            <span className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight group-hover:text-emerald-300 transition-colors">
              {t.heroStat2Value}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {t.heroStat2Label}
            </span>
          </div>

          <div className="p-3 sm:p-4 rounded-2xl bg-slate-900/60 border border-emerald-500/20 backdrop-blur-md shadow-md flex flex-col items-center text-center space-y-1 group hover:border-emerald-500/40 transition-colors">
            <div className="w-8 h-8 rounded-xl bg-emerald-950/80 border border-emerald-700/40 flex items-center justify-center mb-0.5 text-emerald-400">
              <Flame className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight group-hover:text-emerald-300 transition-colors">
              {t.heroStat3Value}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {t.heroStat3Label}
            </span>
          </div>

          <div className="p-3 sm:p-4 rounded-2xl bg-slate-900/60 border border-emerald-500/20 backdrop-blur-md shadow-md flex flex-col items-center text-center space-y-1 group hover:border-emerald-500/40 transition-colors">
            <div className="w-8 h-8 rounded-xl bg-emerald-950/80 border border-emerald-700/40 flex items-center justify-center mb-0.5 text-emerald-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight group-hover:text-emerald-300 transition-colors">
              {t.heroStat4Value}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {t.heroStat4Label}
            </span>
          </div>
        </div>

      </div>

      {/* FULLSCREEN HIGH-RES MODAL FOR BANNER VIEWING */}
      {isZoomOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-lg p-4 animate-fadeIn"
          onClick={() => setIsZoomOpen(false)}
        >
          <div
            className="relative max-w-6xl w-full max-h-[90vh] bg-slate-900 rounded-3xl border border-emerald-500/40 shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950/70">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold border border-emerald-500/40">
                  بنر 0{currentSlideIndex + 1}
                </span>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">
                    {getLoc(currentSlide.tagline)}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {getLoc(currentSlide.title)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={isRTL ? handleNext : handlePrev}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-colors"
                  title="بنر قبلی"
                >
                  {isRTL ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                </button>
                <button
                  type="button"
                  onClick={isRTL ? handlePrev : handleNext}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-colors"
                  title="بنر بعدی"
                >
                  {isRTL ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                </button>
                <button
                  type="button"
                  onClick={() => setIsZoomOpen(false)}
                  className="p-2 rounded-xl bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800/40 transition-colors"
                  title="بستن"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Image Box */}
            <div className="relative flex-1 bg-black flex items-center justify-center p-2 sm:p-4 overflow-auto">
              <img
                src={currentSlide.image}
                alt={getLoc(currentSlide.title)}
                width={1400}
                height={600}
                loading="lazy"
                decoding="async"
                style={{ aspectRatio: '2.33/1' }}
                className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-2xl"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Modal Footer */}
            <div className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {HERO_BANNERS.map((b, bIdx) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setCurrentSlideIndex(bIdx)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      bIdx === currentSlideIndex
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    بنر 0{bIdx + 1}
                  </button>
                ))}
              </div>

              <a
                href={`https://wa.me/${COMPANY_INFO.contacts.internationalSalesManager.whatsapp.replace('+', '')}?text=Hello%20M%20Gas%20Factory%2C%20Inquiry%20regarding%20${encodeURIComponent(getLoc(currentSlide.title))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>استعلام در واتساپ</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
