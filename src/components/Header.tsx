import React, { useState, useEffect, useRef } from 'react';
import {
  Flame,
  MessageCircle,
  Menu,
  X,
  FileText,
  Calculator,
  ChevronDown,
  ShieldCheck,
  Phone,
  Layers,
  Award,
  Building2,
  Compass,
  Video,
  BookOpen,
  Download,
  FileDown,
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { SUPPORTED_LANGUAGES } from '../i18n/languages';
import { LanguageCode } from '../types';
import { COMPANY_INFO } from '../data/company';
import { FlagIcon } from './FlagIcon';
import { scrollToElement } from '../utils/scrollHelper';
import { CatalogDownloadModal } from './CatalogDownloadModal';

interface HeaderProps {
  onOpenRfq?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenRfq }) => {
  const { currentLanguage, setLanguage, t, isRTL, geoInfo } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [catalogModalOpen, setCatalogModalOpen] = useState(false);
  
  const headerRef = useRef<HTMLElement | null>(null);
  const langDropdownRef = useRef<HTMLDivElement | null>(null);
  const navDropdownsRef = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle clicking outside to close all open dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      
      // Close language dropdown if clicked outside
      if (langDropdownRef.current && !langDropdownRef.current.contains(target)) {
        setLangDropdownOpen(false);
      }

      // Close navigation dropdowns if clicked outside
      if (activeDropdown) {
        const activeNavEl = navDropdownsRef.current[activeDropdown];
        if (activeNavEl && !activeNavEl.contains(target)) {
          setActiveDropdown(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside, { passive: true });
    document.addEventListener('touchstart', handleClickOutside, { passive: true });

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [activeDropdown]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    setActiveDropdown(null);
    setLangDropdownOpen(false);
    const targetId = href.replace('#', '');
    scrollToElement(targetId);
  };

  const toggleNavDropdown = (menuKey: string) => {
    setLangDropdownOpen(false);
    setActiveDropdown((prev) => (prev === menuKey ? null : menuKey));
  };

  const toggleLangDropdown = () => {
    setActiveDropdown(null);
    setLangDropdownOpen((prev) => !prev);
  };

  const handleLanguageSelect = (code: LanguageCode) => {
    setLanguage(code);
    setLangDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  const currentLangInfo = SUPPORTED_LANGUAGES[currentLanguage];

  // Concise, Conceptual Dropdown Menu Categories
  const menuCategories = [
    {
      id: 'products',
      title: t.navProducts,
      icon: Layers,
      href: '#products',
      badge: '13',
      items: [
        {
          label: isRTL ? 'همه ۱۳ مدل' : 'All 13 Models',
          desc: isRTL ? 'کاتالوگ جامع کپسول‌ها' : 'Complete portfolio',
          href: '#products',
          icon: Layers,
        },
        {
          label: isRTL ? 'خانگی و پیکنیک' : 'Domestic & Camping',
          desc: isRTL ? '۰.۵ تا ۱۱ کیلوگرم' : '0.5kg – 11kg cylinders',
          href: '#products',
          icon: Flame,
        },
        {
          label: isRTL ? 'صنعتی و کارگاهی' : 'Industrial & Heavy',
          desc: isRTL ? '۲۵ تا ۵۰ کیلوگرم' : '25kg – 50kg heavy duty',
          href: '#products',
          icon: Building2,
        },
        {
          label: isRTL ? 'مخازن خودرویی' : 'Automotive LPG',
          desc: isRTL ? 'مخازن ۶۰ تا ۸۰ لیتر' : '60L – 80L auto tanks',
          href: '#products',
          icon: Compass,
        },
        {
          label: t.navSpecifications,
          desc: isRTL ? 'نقشه و تست فشار' : 'Drawings & test limits',
          href: '#specifications',
          icon: FileText,
        },
      ],
    },
    {
      id: 'quality',
      title: t.navQuality,
      icon: ShieldCheck,
      href: '#quality',
      badge: 'ISO',
      items: [
        {
          label: isRTL ? 'ویدیوهای کارخانه و خطوط تولید' : 'Factory Video Tour',
          desc: isRTL ? 'بازدید مدیر کارخانه (آقای موسی عمویی)' : 'Executive tour & production lines',
          href: '#factory-tour',
          icon: Video,
        },
        {
          label: isRTL ? 'استانداردها' : 'ISO & Certifications',
          desc: isRTL ? 'ISO 9001 و ملی ایران' : 'Global accredited standards',
          href: '#quality',
          icon: ShieldCheck,
        },
        {
          label: isRTL ? 'تست هیدرواستاتیک' : '30-Bar Hydro Test',
          desc: isRTL ? 'آزمون فشار ۳۰ بار' : '100% burst & leak tested',
          href: '#quality',
          icon: Award,
        },
      ],
    },
    {
      id: 'articles',
      title: t.navArticles,
      icon: BookOpen,
      href: '#articles',
      badge: 'NEW',
      items: [
        {
          label: isRTL ? 'استانداردهای مهندسی و ساخت' : 'Manufacturing Standards',
          desc: isRTL ? 'تحلیل متالورژی، جوشکاری و PWHT' : 'Metallurgy, SAW welding & PWHT',
          href: '#articles',
          icon: FileText,
        },
        {
          label: isRTL ? 'مدیریت، نگهداری و حمل‌ونقل' : 'Storage & Logistics Safety',
          desc: isRTL ? 'NFPA 58، OSHA و استانداردهای ADR' : 'NFPA 58, OSHA & ADR compliance',
          href: '#articles',
          icon: ShieldCheck,
        },
      ],
    },
    {
      id: 'about',
      title: t.navHistory,
      icon: Building2,
      href: '#history',
      badge: '1970',
      items: [
        {
          label: isRTL ? 'درباره کارخانه' : 'Factory Heritage',
          desc: isRTL ? 'تأسیس از سال ۱۳۴۹' : 'Since 1970 (50+ years)',
          href: '#history',
          icon: Building2,
        },
        {
          label: isRTL ? 'صادرات و تماس' : 'Export & Contact',
          desc: isRTL ? '۱۲+ کشور جهان' : '12+ global destinations',
          href: '#contact',
          icon: Phone,
        },
      ],
    },
  ];

  return (
    <>
      <header
        id="main-header"
        ref={headerRef}
        className="fixed top-2 sm:top-3 left-0 right-0 z-50 px-2 sm:px-4 lg:px-6 transition-all duration-300 pointer-events-none"
      >
        {/* Floating Desktop Container */}
        <div
          className={`pointer-events-auto max-w-6xl mx-auto transition-all duration-300 rounded-full border relative overflow-visible ${
            isScrolled
              ? 'bg-[#081219]/95 lg:bg-slate-900/80 lg:backdrop-blur-xl border-slate-700/80 lg:border-white/30 shadow-[0_12px_32px_rgba(0,0,0,0.5)] py-1.5 px-3 sm:px-4'
              : 'bg-[#081219]/95 lg:bg-slate-900/70 lg:backdrop-blur-lg border-slate-700/60 lg:border-white/30 shadow-[0_16px_40px_rgba(0,0,0,0.45)] py-2 px-3 sm:px-5'
          }`}
        >
          {/* Subtle top reflection line */}
          <div className="absolute inset-x-8 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none rounded-full" />
          
          <div className="flex items-center justify-between gap-1.5 sm:gap-3 relative z-10">
            
            {/* Brand Logo */}
            <a
              href="#hero"
              onClick={(e) => handleNavClick(e, '#hero')}
              className="flex items-center gap-2 group focus:outline-none shrink-0"
              aria-label="M Gas Official Website"
            >
              <div className="flex items-center justify-center p-1 rounded-xl bg-white/20 border border-white/40 group-hover:bg-white/30 transition-all duration-200">
                <img
                  src="/logo/new-logo-mgas-2(1)_fixed.svg"
                  alt="M Gas Logo"
                  width={36}
                  height={36}
                  style={{ aspectRatio: '1/1' }}
                  decoding="async"
                  className={`object-contain transition-all duration-200 ${
                    isScrolled ? 'h-6 sm:h-7' : 'h-7 sm:h-8'
                  }`}
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="hidden xl:inline text-xs font-bold text-white tracking-wide">
                {t.brandName}
              </span>
            </a>

            {/* Compact Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1">
              
              {/* Home Direct Link */}
              <a
                href="#hero"
                onClick={(e) => handleNavClick(e, '#hero')}
                className="px-2.5 py-1 rounded-full text-xs font-semibold text-white/90 hover:text-white hover:bg-white/20 transition-all duration-150"
              >
                {t.navHome}
              </a>

              {/* Dropdown Menus */}
              {menuCategories.map((category) => {
                const isOpen = activeDropdown === category.id;
                const IconComp = category.icon;

                return (
                  <div
                    key={category.id}
                    ref={(el) => {
                      navDropdownsRef.current[category.id] = el;
                    }}
                    className="relative"
                    onMouseEnter={() => {
                      setActiveDropdown(category.id);
                    }}
                    onMouseLeave={() => {
                      setActiveDropdown(null);
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => toggleNavDropdown(category.id)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-all duration-150 ${
                        isOpen
                          ? 'bg-white/25 text-white shadow-sm ring-1 ring-white/40'
                          : 'text-white/90 hover:text-white hover:bg-white/20'
                      }`}
                    >
                      <IconComp className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{category.title}</span>
                      <ChevronDown
                        className={`w-3 h-3 text-white/70 transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-white' : ''
                        }`}
                      />
                    </button>

                    {/* Compact Glass Dropdown Panel */}
                    {isOpen && (
                      <div
                        className={`absolute top-full mt-2 w-64 rounded-2xl p-2 border border-white/30 shadow-[0_16px_40px_rgba(0,0,0,0.6)] z-50 animate-in fade-in slide-in-from-top-1 duration-150 ${
                          isRTL ? 'right-0' : 'left-0'
                        }`}
                        style={{
                          background: 'rgba(15, 23, 42, 0.95)',
                          backdropFilter: 'blur(28px)',
                          WebkitBackdropFilter: 'blur(28px)',
                        }}
                      >
                        <div className="space-y-0.5">
                          {category.items.map((item, idx) => {
                            const ItemIcon = item.icon;
                            return (
                              <a
                                key={idx}
                                href={item.href}
                                onClick={(e) => handleNavClick(e, item.href)}
                                className="group flex items-center gap-2.5 p-1.5 px-2 rounded-xl hover:bg-white/15 transition-all duration-150"
                              >
                                <div className="p-1.5 rounded-lg bg-white/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors shrink-0">
                                  <ItemIcon className="w-3.5 h-3.5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors truncate">
                                    {item.label}
                                  </div>
                                  <div className="text-[10px] text-slate-300 truncate">
                                    {item.desc}
                                  </div>
                                </div>
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Direct Contact Link */}
              <a
                href="#contact"
                onClick={(e) => handleNavClick(e, '#contact')}
                className="px-2.5 py-1 rounded-full text-xs font-semibold text-white/90 hover:text-white hover:bg-white/20 transition-all duration-150"
              >
                {t.navContact}
              </a>
            </nav>

            {/* Right Action Elements */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              
              {/* Download Catalog PDF Button */}
              <button
                type="button"
                onClick={() => setCatalogModalOpen(true)}
                className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-amber-300 hover:text-amber-200 border border-amber-500/40 px-2.5 py-1 text-xs font-semibold transition-all lg:backdrop-blur-md shrink-0 shadow-sm"
                title={t.navDownloadCatalog}
              >
                <FileDown className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden md:inline">{t.navDownloadCatalog}</span>
                <span className="md:hidden font-mono">PDF</span>
              </button>

              {/* WhatsApp Quick Link */}
              <a
                href={`https://wa.me/${COMPANY_INFO.contacts.internationalSalesManager.whatsapp.replace('+', '')}?text=Hello%20M%20Gas%20Sales`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 hover:bg-emerald-500/35 text-emerald-200 border border-emerald-400/40 px-2.5 py-1 text-xs font-semibold transition-all lg:backdrop-blur-md"
                title={t.salesManagerWhatsApp}
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">WhatsApp</span>
              </a>

              {/* Language Selector Dropdown - Showing visual Flag icon initially as requested */}
              <div className="relative" ref={langDropdownRef}>
                <button
                  type="button"
                  onClick={toggleLangDropdown}
                  className={`inline-flex items-center justify-center gap-1.5 rounded-full transition-all lg:backdrop-blur-md border ${
                    langDropdownOpen
                      ? 'bg-white/30 text-white border-white/60 shadow-sm ring-1 ring-white/30'
                      : 'bg-white/20 hover:bg-white/30 text-white border-white/40'
                  } px-2.5 py-1 text-xs`}
                  aria-expanded={langDropdownOpen}
                  aria-label="Select Language"
                >
                  <FlagIcon code={currentLangInfo.code} size="sm" className="shadow-sm" />
                  <ChevronDown
                    className={`w-3 h-3 text-white/80 transition-transform duration-200 ${
                      langDropdownOpen ? 'rotate-180 text-white' : ''
                    }`}
                  />
                </button>

                {langDropdownOpen && (
                  <div
                    className={`absolute top-full mt-2 w-56 rounded-2xl p-1.5 border border-white/40 shadow-[0_16px_40px_rgba(0,0,0,0.6)] z-50 animate-in fade-in duration-150 ${
                      isRTL ? 'left-0' : 'right-0'
                    }`}
                    style={{
                      background: 'rgba(15, 23, 42, 0.95)',
                      backdropFilter: 'blur(28px)',
                      WebkitBackdropFilter: 'blur(28px)',
                    }}
                  >
                    {geoInfo?.countryCode && (
                      <div className="px-2.5 py-1.5 mb-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-300 flex items-center justify-between">
                        <span className="truncate">IP: {geoInfo.countryName || geoInfo.countryCode}</span>
                        <span className="font-mono text-[9px] px-1 py-0.5 rounded bg-emerald-500/20 text-emerald-200">AUTO</span>
                      </div>
                    )}
                    <div className="max-h-60 overflow-y-auto space-y-0.5 custom-scrollbar">
                      {Object.values(SUPPORTED_LANGUAGES).map((lang) => (
                        <button
                          key={lang.code}
                          type="button"
                          onClick={() => handleLanguageSelect(lang.code)}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-all ${
                            currentLanguage === lang.code
                              ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                              : 'text-slate-200 hover:bg-white/15 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <FlagIcon code={lang.code} size="sm" />
                            <span className="text-xs font-medium">{lang.nativeName}</span>
                          </div>
                          <span
                            className={`text-[10px] font-mono px-1 py-0.5 rounded ${
                              currentLanguage === lang.code
                                ? 'bg-slate-950/20 text-slate-950'
                                : 'bg-white/10 text-slate-400'
                            }`}
                          >
                            {lang.code.toUpperCase()}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Quick RFQ Calculator Trigger Button */}
              <button
                type="button"
                onClick={onOpenRfq}
                className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-bold px-3 py-1 text-xs shadow-md shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 shrink-0"
              >
                <Calculator className="w-3.5 h-3.5 text-slate-950" />
                <span className="truncate">{t.navCalculator}</span>
              </button>

              {/* Mobile Menu Toggle Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-1.5 rounded-full bg-white/20 border border-white/40 text-white hover:bg-white/30 transition-colors"
                aria-label="Open Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-slate-950/95 backdrop-blur-2xl lg:hidden pt-20 px-5 pb-6 flex flex-col justify-between overflow-y-auto animate-fadeIn">
          <div className="space-y-4">
            
            {/* Mobile Header Brand */}
            <div className="flex items-center justify-between pb-3 border-b border-white/15">
              <img
                src="/logo/new-logo-mgas-2(1)_fixed.svg"
                alt="M Gas Logo"
                width={32}
                height={32}
                style={{ aspectRatio: '1/1' }}
                decoding="async"
                className="h-8 w-auto object-contain"
                referrerPolicy="no-referrer"
              />
              <span className="text-xs text-slate-400 font-sans">
                {t.sinceYear}
              </span>
            </div>

            {/* Download Catalog PDF on Mobile */}
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setCatalogModalOpen(true);
              }}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-amber-950/40 hover:bg-amber-900/60 border border-amber-600/40 text-amber-200 text-xs font-semibold transition-colors"
            >
              <div className="flex items-center gap-2">
                <FileDown className="w-4 h-4 text-amber-400" />
                <span>{t.navDownloadCatalog}</span>
              </div>
              <span className="font-mono text-amber-300 bg-amber-900/60 px-2 py-0.5 rounded text-[10px]">PDF (2026)</span>
            </button>

            {/* Sales WhatsApp on Mobile */}
            <a
              href={`https://wa.me/${COMPANY_INFO.contacts.internationalSalesManager.whatsapp.replace('+', '')}?text=Hello%20M%20Gas%20Sales`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-2xl bg-emerald-950/60 border border-emerald-800/40 text-emerald-200 text-xs font-semibold"
            >
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>{t.salesManagerWhatsApp}</span>
              </div>
              <span className="font-mono text-emerald-300">WhatsApp</span>
            </a>

            {/* Nav links on Mobile */}
            <nav className="flex flex-col space-y-1">
              <a
                href="#hero"
                onClick={(e) => handleNavClick(e, '#hero')}
                className="px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
              >
                {t.navHome}
              </a>
              <a
                href="#products"
                onClick={(e) => handleNavClick(e, '#products')}
                className="px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-200 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-between"
              >
                <span>{t.navProducts}</span>
                <span className="text-xs bg-white/15 px-2 py-0.5 rounded-full text-emerald-300">13</span>
              </a>
              <a
                href="#quality"
                onClick={(e) => handleNavClick(e, '#quality')}
                className="px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
              >
                {t.navQuality}
              </a>
              <a
                href="#history"
                onClick={(e) => handleNavClick(e, '#history')}
                className="px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
              >
                {t.navHistory}
              </a>
              <a
                href="#contact"
                onClick={(e) => handleNavClick(e, '#contact')}
                className="px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
              >
                {t.navContact}
              </a>
            </nav>

            {/* Language grid on mobile */}
            <div className="space-y-1.5 pt-2 border-t border-white/10">
              <div className="text-[11px] font-semibold text-slate-400 px-1 uppercase tracking-wider">
                {t.selectLanguage}
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {Object.values(SUPPORTED_LANGUAGES).map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => handleLanguageSelect(lang.code)}
                    className={`flex items-center gap-2.5 p-2 rounded-xl border text-xs text-start transition-all ${
                      currentLanguage === lang.code
                        ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 font-bold shadow-sm'
                        : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <FlagIcon code={lang.code} size="sm" />
                    <span className="truncate">{lang.nativeName}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom mobile info */}
          <div className="pt-4 border-t border-white/15 text-xs text-slate-400 flex items-center justify-between">
            <span>{COMPANY_INFO.emails.sales}</span>
            <p className="text-[10px] text-slate-500">{t.brandName}</p>
          </div>
        </div>
      )}

      {/* Official Catalog Download Modal */}
      <CatalogDownloadModal
        isOpen={catalogModalOpen}
        onClose={() => setCatalogModalOpen(false)}
      />
    </>
  );
};
