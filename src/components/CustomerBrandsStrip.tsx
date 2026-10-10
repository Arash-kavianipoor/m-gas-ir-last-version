import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { Award, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const CustomerBrandsStrip: React.FC = () => {
  const { currentLanguage, t } = useLanguage();

  const brands = [
    { name: 'Iran Khodro (IKCO)', logo: '/customers/ikco.svg', alt: 'Iran Khodro Industrial Group' },
    { name: 'SAIPA Automotive', logo: '/customers/saipa.svg', alt: 'SAIPA Automotive Group' },
    { name: 'ISACO Aftersales', logo: '/customers/isaco.svg', alt: 'ISACO Spare Parts & Distribution' },
    { name: 'National Iranian Gas Co. Partners', logo: '/customers/pngimage.parspng.com10.png', alt: 'Industrial LPG Distribution' },
  ];

  return (
    <section className="relative py-8 bg-slate-950/90 border-y border-slate-800/80 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Section Sub-heading */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block">
                {currentLanguage === 'fa' ? 'مشتریان عمده و طرف‌های تجاری' : 'OEM & Major Industrial Partners'}
              </span>
              <p className="text-sm font-semibold text-slate-200">
                {currentLanguage === 'fa' ? 'تأمین‌کننده مورد اعتماد صنایع بزرگ و خودروسازان' : 'Trusted by Leading Automotive & Gas Corporations'}
              </p>
            </div>
          </div>

          {/* Brands Logos Showcase */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            {brands.map((brand, idx) => (
              <div
                key={idx}
                className="group relative flex items-center justify-center px-4 py-2 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-emerald-500/40 transition-all hover:scale-105"
              >
                <img
                  src={brand.logo}
                  alt={brand.alt}
                  className="h-8 sm:h-10 w-auto object-contain brightness-90 contrast-125 group-hover:brightness-110 transition-all"
                  loading="lazy"
                />
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};
