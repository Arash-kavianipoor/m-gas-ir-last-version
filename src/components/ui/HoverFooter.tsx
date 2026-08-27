import React, { useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  ExternalLink,
  ShieldCheck,
  Award,
  ChevronRight,
  Flame,
  MessageCircle,
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { COMPANY_INFO } from '../../data/company';

export const TextHoverEffect: React.FC<{ text: string; className?: string }> = ({ text, className = '' }) => {
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCursor({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div className={`relative w-full flex items-center justify-center select-none overflow-hidden ${className}`}>
      <svg
        className="w-full h-28 sm:h-36 md:h-44"
        viewBox="0 0 800 160"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <defs>
          <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="50%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <radialGradient
            id="revealMask"
            gradientUnits="userSpaceOnUse"
            r="160"
            cx={cursor.x * 1.6}
            cy={cursor.y * 1.6}
          >
            <stop offset="0%" stopColor="white" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <mask id="textMask">
            <rect x="0" y="0" width="800" height="160" fill="url(#revealMask)" />
          </mask>
        </defs>

        {/* Background stroke text */}
        <text
          x="50%"
          y="65%"
          textAnchor="middle"
          dominantBaseline="middle"
          stroke="rgba(255, 255, 255, 0.07)"
          strokeWidth="1.5"
          fill="none"
          className="font-black text-6xl sm:text-7xl md:text-8xl tracking-widest uppercase font-mono"
        >
          {text}
        </text>

        {/* Revealed glowing text on hover */}
        <text
          x="50%"
          y="65%"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="url(#textGradient)"
          stroke="#10b981"
          strokeWidth="0.8"
          mask="url(#textMask)"
          className={`font-black text-6xl sm:text-7xl md:text-8xl tracking-widest uppercase font-mono transition-opacity duration-300 ${
            hovered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {text}
        </text>
      </svg>
    </div>
  );
};

export const FooterBackgroundGradient: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-emerald-500/10 rounded-full blur-[120px]" />
      <div className="absolute -bottom-10 right-10 w-[300px] h-[300px] bg-teal-500/10 rounded-full blur-[90px]" />
      <div className="absolute -bottom-10 left-10 w-[300px] h-[300px] bg-emerald-700/10 rounded-full blur-[90px]" />
    </div>
  );
};

export const HoverFooter: React.FC = () => {
  const { t, isRTL, currentLanguage } = useLanguage();

  return (
    <footer id="footer" className="relative mt-20 border-t border-slate-800/80 bg-[#0B131E] text-slate-300 overflow-hidden">
      <FooterBackgroundGradient />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 pb-12 border-b border-slate-800">
          
          {/* Brand & Mission */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/logo/new-logo-mgas-2(1)_fixed.svg"
                alt="M Gas Official Logo"
                width={48}
                height={48}
                loading="lazy"
                decoding="async"
                style={{ aspectRatio: '1/1' }}
                className="h-12 w-auto object-contain filter drop-shadow"
                referrerPolicy="no-referrer"
              />
              <span className="text-xs text-slate-400 block border-s border-slate-700/60 ps-2.5">
                {t.sinceYear}
              </span>
            </div>

            <p className="text-sm text-slate-400 leading-relaxed text-justify">
              {t.footerAboutText}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-950/60 text-emerald-300 border border-emerald-800/40">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                ISO 9001 / EN 1442
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-800/80 text-slate-300 border border-slate-700">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                {t.exportToCountries}
              </span>
            </div>

            {/* Quick Links */}
            <div className="pt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium">
              <a href="#articles" className="text-emerald-400 hover:text-emerald-300 transition-colors">
                {t.navArticles}
              </a>
              <span className="text-slate-700">•</span>
              <a href="#products" className="text-slate-400 hover:text-white transition-colors">
                {t.navProducts}
              </a>
              <span className="text-slate-700">•</span>
              <a href="#factory-tour" className="text-slate-400 hover:text-white transition-colors">
                {isRTL ? 'ویدیوهای کارخانه' : 'Factory Videos'}
              </a>
              <span className="text-slate-700">•</span>
              <a href="#calculator" className="text-slate-400 hover:text-white transition-colors">
                {t.navCalculator}
              </a>
            </div>
          </div>

          {/* Department Emails */}
          <div className="space-y-4">
            <h4 className="text-base font-semibold text-white tracking-wide border-b border-emerald-500/20 pb-2 flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-400" />
              {t.officialEmailsTitle}
            </h4>

            <ul className="space-y-3 text-sm">
              <li className="p-2.5 rounded-lg bg-slate-900/50 border border-slate-800/80 hover:border-emerald-500/30 transition-colors">
                <span className="text-xs text-slate-400 block mb-0.5">{t.emailSupport}</span>
                <a
                  href={`mailto:${COMPANY_INFO.emails.info}`}
                  dir="ltr"
                  className="font-mono text-emerald-400 hover:text-emerald-300 flex items-center justify-between"
                >
                  <span className="isolate">{COMPANY_INFO.emails.info}</span>
                  <ChevronRight className={`w-3.5 h-3.5 opacity-60 ${isRTL ? 'rotate-180' : ''}`} />
                </a>
              </li>

              <li className="p-2.5 rounded-lg bg-slate-900/50 border border-slate-800/80 hover:border-emerald-500/30 transition-colors">
                <span className="text-xs text-slate-400 block mb-0.5">{t.emailSales}</span>
                <a
                  href={`mailto:${COMPANY_INFO.emails.sales}`}
                  dir="ltr"
                  className="font-mono text-emerald-400 hover:text-emerald-300 flex items-center justify-between"
                >
                  <span className="isolate">{COMPANY_INFO.emails.sales}</span>
                  <ChevronRight className={`w-3.5 h-3.5 opacity-60 ${isRTL ? 'rotate-180' : ''}`} />
                </a>
              </li>

              <li className="p-2.5 rounded-lg bg-slate-900/50 border border-slate-800/80">
                <span className="text-xs text-slate-400 block mb-0.5">{t.emailAutomated}</span>
                <span dir="ltr" className="font-mono text-slate-300 isolate text-xs block">
                  {COMPANY_INFO.emails.system}
                </span>
              </li>
            </ul>
          </div>

          {/* Contact Hotline & WhatsApp */}
          <div className="space-y-4">
            <h4 className="text-base font-semibold text-white tracking-wide border-b border-emerald-500/20 pb-2 flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-400" />
              {t.footerContactUs}
            </h4>

            <div className="space-y-3 text-sm">
              <div className="p-2.5 rounded-lg bg-slate-900/50 border border-slate-800/80">
                <span className="text-xs text-slate-400 block mb-0.5">
                  {t.contactInternationalSales}
                </span>
                <span className="text-xs font-semibold text-slate-300 block mb-1">
                  {COMPANY_INFO.contacts.internationalSalesManager.name}
                </span>
                <a
                  href={`https://wa.me/${COMPANY_INFO.contacts.internationalSalesManager.whatsapp.replace('+', '')}?text=Hello%20M%20Gas%20International%20Sales`}
                  target="_blank"
                  rel="noopener noreferrer"
                  dir="ltr"
                  className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-mono text-xs bg-emerald-950/40 px-2.5 py-1 rounded border border-emerald-800/30"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span className="isolate">{COMPANY_INFO.contacts.internationalSalesManager.whatsappDisplay}</span>
                </a>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900/50 border border-slate-800/80">
                <span className="text-xs text-slate-400 block mb-0.5">
                  {t.contactDomesticManagement}
                </span>
                <span className="text-xs font-semibold text-slate-300 block mb-1">
                  {COMPANY_INFO.contacts.domesticDirector.name}
                </span>
                <div className="flex flex-col gap-1">
                  <a
                    href={`tel:${COMPANY_INFO.contacts.domesticDirector.mobile}`}
                    dir="ltr"
                    className="text-xs font-mono text-slate-300 hover:text-emerald-400 flex items-center gap-2"
                  >
                    <Phone className="w-3 h-3 text-emerald-400" />
                    <span className="isolate">{COMPANY_INFO.contacts.domesticDirector.mobileDisplay}</span>
                  </a>
                  <a
                    href={`tel:${COMPANY_INFO.contacts.domesticDirector.landline}`}
                    dir="ltr"
                    className="text-xs font-mono text-slate-400 hover:text-emerald-400 flex items-center gap-2"
                  >
                    <Phone className="w-3 h-3 text-slate-500" />
                    <span className="isolate">{COMPANY_INFO.contacts.domesticDirector.landlineDisplay}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Location & Shift Hours */}
          <div className="space-y-4">
            <h4 className="text-base font-semibold text-white tracking-wide border-b border-emerald-500/20 pb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              {t.addressTitle}
            </h4>

            <div className="text-sm space-y-3 text-slate-400">
              <p className="leading-relaxed text-xs">
                {currentLanguage === 'fa' ? COMPANY_INFO.address.fullPersian : COMPANY_INFO.address.fullEnglish}
              </p>

              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs space-y-1">
                <div className="flex items-center gap-2 text-slate-300 font-medium">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  {t.contactShiftHours}
                </div>
                <p className="text-slate-400 text-[11px]">{t.contactShiftHoursValue}</p>
                <p className="text-emerald-400/90 text-[11px]">{t.contactFridayStatus}</p>
              </div>

              <a
                href={COMPANY_INFO.address.googleMapDirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs text-emerald-400 hover:text-emerald-300 font-medium pt-1"
              >
                <span>{t.getDirections}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Text Hover Effect with Brand name */}
        <div className="pt-8 pb-4">
          <TextHoverEffect text="M-GAS CYLINDERS" />
        </div>

        {/* Copyright & Bottom Bar */}
        <div className="pt-6 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-start">
            <p>
              &copy; 1970 - {new Date().getFullYear()} {t.footerRights}
            </p>
            <span className="hidden sm:inline text-slate-700">|</span>
            <p className="text-slate-400">
              Website designed by{' '}
              <a
                href="https://sorena-it.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:text-emerald-300 transition-colors font-medium underline underline-offset-2"
              >
                Sorena-IT
              </a>
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="text-slate-600">mgas.ir</span>
            <span>•</span>
            <span className="text-slate-400">Karaj, Alborz, IRAN</span>
            <span>•</span>
            <span className="text-emerald-400/80 font-mono isolate" dir="ltr">+44 7833 783825</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
