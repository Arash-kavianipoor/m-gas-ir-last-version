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
import { useRouter } from '../router/RouterContext';

interface HeaderProps {
  onOpenRfq?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenRfq }) => {
  const { currentLanguage, setLanguage, t, isRTL, geoInfo } = useLanguage();
  const { navigate } = useRouter();
  const isVazir = currentLanguage === 'fa' || currentLanguage === 'ar' || isRTL;
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [pinnedDropdown, setPinnedDropdown] = useState<string | null>(null);
  const [catalogModalOpen, setCatalogModalOpen] = useState(false);
  
  const headerRef = useRef<HTMLElement | null>(null);
  const langDropdownRef = useRef<HTMLDivElement | null>(null);
  const navDropdownsRef = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const cancelCloseTimeout = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const handleMouseEnter = (menuKey: string) => {
    cancelCloseTimeout();
    setActiveDropdown(menuKey);
  };

  const handleMouseLeave = (menuKey: string) => {
    // If user clicked to pin this dropdown open, do not close on mouse leave
    if (pinnedDropdown === menuKey) {
      return;
    }
    cancelCloseTimeout();
    // 300ms generous grace period so the pointer moves freely without premature closing
    closeTimeoutRef.current = setTimeout(() => {
      setActiveDropdown((current) => (current === menuKey ? null : current));
    }, 300);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle clicking outside to close all open dropdowns on empty space click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      
      // Close language dropdown if clicked outside
      if (langDropdownRef.current && !langDropdownRef.current.contains(target)) {
        setLangDropdownOpen(false);
      }

      // Close navigation dropdowns if clicked outside on empty space
      if (activeDropdown) {
        const activeNavEl = navDropdownsRef.current[activeDropdown];
        if (activeNavEl && !activeNavEl.contains(target)) {
          setActiveDropdown(null);
          setPinnedDropdown(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside, { passive: true });
    document.addEventListener('touchstart', handleClickOutside, { passive: true });

    return () => {
      cancelCloseTimeout();
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [activeDropdown]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    cancelCloseTimeout();
    setMobileMenuOpen(false);
    setActiveDropdown(null);
    setPinnedDropdown(null);
    setLangDropdownOpen(false);
    
    // Normalize path to clean page URL
    let cleanPath = path;
    if (cleanPath.startsWith('#')) {
      const name = cleanPath.replace('#', '');
      if (name === 'hero' || !name) cleanPath = '/';
      else if (name === 'history') cleanPath = '/about';
      else cleanPath = '/' + name;
    }
    
    navigate(cleanPath);
  };

  const toggleNavDropdown = (menuKey: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    cancelCloseTimeout();
    setLangDropdownOpen(false);

    // If already pinned and open, close it
    if (pinnedDropdown === menuKey) {
      setActiveDropdown(null);
      setPinnedDropdown(null);
    } else {
      // Pin open so it stays open across all devices until empty space is clicked
      setActiveDropdown(menuKey);
      setPinnedDropdown(menuKey);
    }
  };

  const toggleLangDropdown = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    cancelCloseTimeout();
    setActiveDropdown(null);
    setPinnedDropdown(null);
    setLangDropdownOpen((prev) => !prev);
  };

  const handleLanguageSelect = (code: LanguageCode) => {
    setLanguage(code);
    setLangDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  const currentLangInfo = SUPPORTED_LANGUAGES[currentLanguage];

  // Standalone Clean Dropdown Menu Categories
  const menuCategories = [
    {
      id: 'products',
      title: t.navProducts,
      icon: Layers,
      href: '/products',
      badge: '14',
      items: [
        {
          label: isRTL ? 'فروشگاه و تمام ۱۴ مدل' : 'Store & All 14 Models',
          desc: isRTL ? 'کاتالوگ جامع کپسول‌ها' : 'Complete portfolio & shop',
          href: '/products',
          icon: Layers,
        },
        {
          label: isRTL ? 'خانگی و پیکنیک' : 'Domestic & Camping',
          desc: isRTL ? '۰.۵ تا ۱۱ کیلوگرم' : '0.5kg – 11kg cylinders',
          href: '/products',
          icon: Flame,
        },
        {
          label: isRTL ? 'صنعتی و کارگاهی' : 'Industrial & Heavy',
          desc: isRTL ? '۲۵ تا ۵۰ کیلوگرم' : '25kg – 50kg heavy duty',
          href: '/products',
          icon: Building2,
        },
        {
          label: isRTL ? 'مخازن خودرویی' : 'Automotive LPG Tanks',
          desc: isRTL ? 'مخازن ۶۰ لیتر استانداردی' : '60L auto LPG tanks',
          href: '/products',
          icon: Compass,
        },
      ],
    },
    {
      id: 'quality',
      title: t.navQuality,
      icon: ShieldCheck,
      href: '/quality',
      badge: 'ISO',
      items: [
        {
          label: isRTL ? 'استانداردها و کنترل کیفیت' : 'Quality & ISO Standards',
          desc: isRTL ? 'ISO 9001 و آزمون هیدرواستاتیک ۳۰ بار' : 'Accredited global standards & testing',
          href: '/quality',
          icon: ShieldCheck,
        },
        {
          label: isRTL ? 'مستند ویدئویی خطوط تولید' : 'Factory Video Tour',
          desc: isRTL ? 'بازدید مدیر کارخانه (آقای موسی عمویی)' : 'Production lines & inspection tour',
          href: '/factory-tour',
          icon: Video,
        },
      ],
    },
    {
      id: 'articles',
      title: t.navArticles,
      icon: BookOpen,
      href: '/articles',
      badge: 'NEW',
      items: [
        {
          label: isRTL ? 'استانداردهای مهندسی و ساخت' : 'Manufacturing Standards',
          desc: isRTL ? 'تحلیل متالورژی، جوشکاری و PWHT' : 'Metallurgy, SAW welding & PWHT',
          href: '/articles/engineering-standards-lpg-cylinder-manufacturing',
          icon: FileText,
        },
        {
          label: isRTL ? 'مدیریت، نگهداری و حمل‌ونقل' : 'Storage & Logistics Safety',
          desc: isRTL ? 'NFPA 58، OSHA و استانداردهای ADR' : 'NFPA 58, OSHA & ADR compliance',
          href: '/articles/lpg-cylinder-management-storage-transportation-safety',
          icon: ShieldCheck,
        },
      ],
    },
    {
      id: 'about',
      title: t.navHistory,
      icon: Building2,
      href: '/about',
      badge: '1970',
      items: [
        {
          label: isRTL ? 'درباره کارخانه و بنیانگذار' : 'Factory Heritage & Founder',
          desc: isRTL ? 'تأسیس از سال ۱۳۴۹ (مدیریت موسی عمویی)' : 'Since 1970 (50+ years experience)',
          href: '/about',
          icon: Building2,
        },
        {
          label: isRTL ? 'پرسش‌های متداول' : 'FAQ & Certification',
          desc: isRTL ? 'پاسخ به سوالات فنی و بازرگانی' : 'Technical & export questions',
          href: '/faq',
          icon: Award,
        },
        {
          label: isRTL ? 'استعلام قیمت و کانتینربندی' : 'Online RFQ Calculator',
          desc: isRTL ? 'محاسبه کانتینر ۲۰ و ۴۰ فوت' : 'Container stuffing & weight',
          href: '/calculator',
          icon: Calculator,
        },
        {
          label: isRTL ? 'تماس و صادرات' : 'Export & Karaj Factory',
          desc: isRTL ? 'تماس با واحد فروش و آدرس کارخانه' : 'Global sales desk & direct contact',
          href: '/contact',
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
        className={`fixed top-0 left-0 right-0 z-[100] w-full transition-all duration-200 ${
          isVazir ? 'font-vazir' : ''
        } ${
          isScrolled
            ? 'bg-[#061017]/98 backdrop-blur-xl border-b border-emerald-500/30 shadow-[0_8px_30px_rgba(0,0,0,0.7)] py-2 sm:py-2.5'
            : 'bg-[#061017]/90 backdrop-blur-lg border-b border-slate-800/80 shadow-[0_4px_20px_rgba(0,0,0,0.5)] py-2.5 sm:py-3.5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-2 sm:gap-4 relative z-10">
            
            {/* Brand Logo & Title */}
            <a
              href="/"
              onClick={(e) => handleNavClick(e, '/')}
              className="flex items-center gap-2.5 group focus:outline-none shrink-0"
              aria-label="M Gas Official Website"
            >
              <div className="flex items-center justify-center p-1.5 sm:p-2 min-w-[100px] sm:min-w-[130px] h-12 sm:h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/40 group-hover:border-emerald-400 group-hover:bg-emerald-500/25 transition-all shadow-sm">
                <img
                  src="/logo/new-logo-mgas-2.svg"
                  alt="M Gas Logo"
                  width={130}
                  height={56}
                  decoding="async"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.src.endsWith('.png')) {
                      target.src = '/logo/new-logo-mgas-2.png';
                    }
                  }}
                  className="w-auto h-9 sm:h-11 max-w-[120px] sm:max-w-[130px] object-contain transition-transform group-hover:scale-105 filter drop-shadow-md"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-sm sm:text-base font-black text-white tracking-wide group-hover:text-emerald-300 transition-colors">
                  {t.brandName}
                </span>
                <span className="text-[10px] text-emerald-400/80 font-medium hidden sm:inline">
                  {t.sinceYear}
                </span>
              </div>
            </a>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5">
              
              {/* Home Direct Link */}
              <a
                href="/"
                onClick={(e) => handleNavClick(e, '/')}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800/80 transition-colors"
              >
                {t.navHome}
              </a>

              {/* Dropdown Menus */}
              {menuCategories.map((category) => {
                const isOpen = activeDropdown === category.id;
                const isPinned = pinnedDropdown === category.id;
                const IconComp = category.icon;

                return (
                  <div
                    key={category.id}
                    ref={(el) => {
                      navDropdownsRef.current[category.id] = el;
                    }}
                    className="relative"
                    onMouseEnter={() => handleMouseEnter(category.id)}
                    onMouseLeave={() => handleMouseLeave(category.id)}
                  >
                    <button
                      type="button"
                      aria-haspopup="true"
                      aria-expanded={isOpen}
                      onClick={(e) => toggleNavDropdown(category.id, e)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer select-none ${
                        isOpen
                          ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/60 shadow-[0_0_12px_rgba(16,185,129,0.3)] ring-1 ring-emerald-500/40'
                          : 'text-slate-200 hover:text-white hover:bg-slate-800/80 border border-transparent hover:border-slate-700/60'
                      }`}
                    >
                      <IconComp className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{category.title}</span>
                      <ChevronDown
                        className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-emerald-400' : ''
                        }`}
                      />
                    </button>

                    {/* Glass Dropdown Panel with Zero-Gap Bridge */}
                    {isOpen && (
                      <div
                        className={`absolute top-full pt-1.5 w-64 z-50 animate-in fade-in slide-in-from-top-1 duration-150 ${
                          isRTL ? 'right-0' : 'left-0'
                        }`}
                        onMouseEnter={() => handleMouseEnter(category.id)}
                        onMouseLeave={() => handleMouseLeave(category.id)}
                      >
                        {/* Invisible hover bridge to eliminate pointer gap between trigger and menu */}
                        <div className="absolute -top-2 left-0 right-0 h-3 bg-transparent pointer-events-auto" />

                        <div className="rounded-2xl p-2 bg-[#09151F]/98 backdrop-blur-2xl border border-emerald-500/30 shadow-[0_16px_40px_rgba(0,0,0,0.85)]">
                          <div className="space-y-0.5">
                            {category.items.map((item, idx) => {
                              const ItemIcon = item.icon;
                              return (
                                <a
                                  key={idx}
                                  href={item.href}
                                  onClick={(e) => handleNavClick(e, item.href)}
                                  className="group flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-800/80 transition-colors"
                                >
                                  <div className="p-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors shrink-0">
                                    <ItemIcon className="w-3.5 h-3.5" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-xs font-bold text-slate-100 group-hover:text-emerald-300 transition-colors truncate">
                                      {item.label}
                                    </div>
                                    <div className="text-[10px] text-slate-400 truncate">
                                      {item.desc}
                                    </div>
                                  </div>
                                </a>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Direct Contact Link */}
              <a
                href="/contact"
                onClick={(e) => handleNavClick(e, '/contact')}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800/80 transition-colors"
              >
                {t.navContact}
              </a>
            </nav>

            {/* Right Action Elements */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              
              {/* Download Catalog PDF Button */}
              <button
                type="button"
                onClick={() => setCatalogModalOpen(true)}
                className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 hover:text-amber-200 border border-amber-500/40 px-2.5 sm:px-3 py-1.5 text-xs font-semibold transition-colors shadow-sm"
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
                className="hidden xs:inline-flex items-center gap-1 rounded-xl bg-emerald-950/50 hover:bg-emerald-900/70 text-emerald-300 border border-emerald-500/40 px-2.5 py-1.5 text-xs font-semibold transition-colors"
                title={t.salesManagerWhatsApp}
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden md:inline">WhatsApp</span>
              </a>

              {/* Language Selector Dropdown */}
              <div className="relative" ref={langDropdownRef}>
                <button
                  type="button"
                  onClick={(e) => toggleLangDropdown(e)}
                  className={`inline-flex items-center justify-center gap-1.5 rounded-xl transition-all duration-150 border cursor-pointer select-none ${
                    langDropdownOpen
                      ? 'bg-slate-800 text-white border-emerald-500 shadow-sm ring-1 ring-emerald-500/40'
                      : 'bg-slate-900/90 hover:bg-slate-800 text-slate-200 border-slate-700/80'
                  } px-2.5 py-1.5 text-xs`}
                  aria-expanded={langDropdownOpen}
                  aria-haspopup="true"
                  aria-label="Select Language"
                >
                  <FlagIcon code={currentLangInfo.code} size="sm" className="shadow-sm" />
                  <ChevronDown
                    className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${
                      langDropdownOpen ? 'rotate-180 text-emerald-400' : ''
                    }`}
                  />
                </button>

                {langDropdownOpen && (
                  <div
                    className={`absolute top-full pt-1.5 w-56 z-50 animate-in fade-in duration-150 ${
                      isRTL ? 'left-0' : 'right-0'
                    }`}
                  >
                    {/* Invisible hover bridge */}
                    <div className="absolute -top-2 left-0 right-0 h-3 bg-transparent pointer-events-auto" />

                    <div className="rounded-2xl p-1.5 bg-[#09151F]/98 backdrop-blur-2xl border border-emerald-500/30 shadow-[0_16px_40px_rgba(0,0,0,0.85)]">
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
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-colors cursor-pointer ${
                              currentLanguage === lang.code
                                ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                                : 'text-slate-200 hover:bg-slate-800 hover:text-white'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <FlagIcon code={lang.code} size="sm" />
                              <div className="flex flex-col text-start leading-tight min-w-0">
                                <span className="text-xs font-medium truncate">{lang.nativeName}</span>
                                <span className={`text-[9px] font-mono truncate ${
                                  currentLanguage === lang.code ? 'text-slate-900 font-semibold' : 'text-emerald-400/80'
                                }`}>
                                  {lang.domain}
                                </span>
                              </div>
                            </div>
                            <span
                              className={`text-[10px] font-mono px-1 py-0.5 rounded shrink-0 ${
                                currentLanguage === lang.code
                                  ? 'bg-slate-950/20 text-slate-950'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {lang.code.toUpperCase()}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick RFQ Calculator Trigger Button */}
              <button
                type="button"
                onClick={onOpenRfq}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold px-2.5 sm:px-3 py-1.5 text-xs shadow-md shadow-emerald-500/20 transition-colors shrink-0"
              >
                <Calculator className="w-3.5 h-3.5 text-slate-950" />
                <span className="truncate">{t.navCalculator}</span>
              </button>

              {/* Mobile Menu Toggle Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-200 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="Open Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-4 h-4 text-emerald-400" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          data-header-drawer
          className={`fixed inset-0 z-40 bg-slate-950/95 backdrop-blur-2xl lg:hidden pt-20 px-5 pb-6 flex flex-col justify-between overflow-y-auto animate-fadeIn ${
            isVazir ? 'font-vazir' : ''
          }`}
        >
          <div className="space-y-4">
            
            {/* Mobile Header Brand */}
            <div className="flex items-center justify-between pb-3 border-b border-white/15">
              <img
                src="/logo/new-logo-mgas-2.svg"
                alt="M Gas Logo"
                width={32}
                height={32}
                style={{ aspectRatio: '1/1' }}
                decoding="async"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.src.endsWith('.png')) {
                    target.src = '/logo/new-logo-mgas-2.png';
                  }
                }}
                className="h-8 w-auto object-contain"
                referrerPolicy="no-referrer"
              />
              <span className={`text-xs text-slate-400 ${isVazir ? 'font-vazir' : 'font-sans'}`}>
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
                href="/"
                onClick={(e) => handleNavClick(e, '/')}
                className="px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
              >
                {t.navHome}
              </a>
              <a
                href="/products"
                onClick={(e) => handleNavClick(e, '/products')}
                className="px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-200 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-between"
              >
                <span>{t.navProducts}</span>
                <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">14</span>
              </a>
              <a
                href="/quality"
                onClick={(e) => handleNavClick(e, '/quality')}
                className="px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
              >
                {t.navQuality}
              </a>
              <a
                href="/factory-tour"
                onClick={(e) => handleNavClick(e, '/factory-tour')}
                className="px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
              >
                {isRTL ? 'مستند ویدئویی خطوط تولید' : 'Factory Video Tour'}
              </a>
              <a
                href="/articles"
                onClick={(e) => handleNavClick(e, '/articles')}
                className="px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
              >
                {t.navArticles}
              </a>
              <a
                href="/about"
                onClick={(e) => handleNavClick(e, '/about')}
                className="px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
              >
                {t.navHistory}
              </a>
              <a
                href="/faq"
                onClick={(e) => handleNavClick(e, '/faq')}
                className="px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
              >
                {isRTL ? 'پرسش‌های متداول' : 'FAQ'}
              </a>
              <a
                href="/calculator"
                onClick={(e) => handleNavClick(e, '/calculator')}
                className="px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
              >
                {t.navCalculator}
              </a>
              <a
                href="/contact"
                onClick={(e) => handleNavClick(e, '/contact')}
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
                    className={`flex items-center gap-2 p-2 rounded-xl border text-xs text-start transition-all ${
                      currentLanguage === lang.code
                        ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 font-bold shadow-sm'
                        : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <FlagIcon code={lang.code} size="sm" />
                    <div className="flex flex-col min-w-0">
                      <span className="truncate leading-snug">{lang.nativeName}</span>
                      <span className="text-[9px] font-mono text-emerald-400/80 truncate">{lang.domain}</span>
                    </div>
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
