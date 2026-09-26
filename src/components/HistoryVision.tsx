import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { COMPANY_INFO } from '../data/company';
import { Building2, Globe2, Award, History, CheckCircle2, UserCheck, ShieldCheck } from 'lucide-react';

export const HistoryVision: React.FC = () => {
  const { currentLanguage, t } = useLanguage();

  return (
    <section id="history" className="relative py-24 bg-[#050D12] border-t border-slate-800 overflow-hidden">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Story & Founder */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <History className="w-4 h-4" />
              <span>{currentLanguage === 'fa' ? 'بیش از نیم قرن افتخار صنعت (تأسیس ۱۳۴۹)' : 'Over 50 Years of Manufacturing Excellence (Est. 1970)'}</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
              {currentLanguage === 'fa'
                ? 'داستان کارخانه ام گاز؛ تعهد به ایمنی، نوآوری و صادرات بین‌المللی'
                : 'The M Gas Legacy: Dedicated to Safety, Precision, and Global Reach'}
            </h2>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              {currentLanguage === 'fa'
                ? 'کارخانه تولید کپسول گاز ام گاز از سال ۱۳۴۹ با مدیریت مهندس موسی عمویی فعالیت خود را آغاز نموده و امروزه به عنوان یکی از بزرگ‌ترین صادرکنندگان مخازن گاز مایع به بیش از ۱۲ کشور در خاورمیانه، آسیای میانه و قفقاز شناخته می‌شود.'
                : 'Founded in 1970 by Managing Director Mousa Amooie, M Gas has grown from a specialized domestic workshop into a premier industrial manufacturer supplying certified LPG cylinders and auto tanks to over 12 global markets across the Middle East, Central Asia, and the Caucasus.'}
            </p>

            {/* Founder Note Card */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-800 shrink-0 border border-emerald-500/30">
                <img
                  src="/founder/mousa-amooie.webp"
                  alt="Mousa Amooie - Managing Director"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">
                  {currentLanguage === 'fa' ? 'مهندس موسی عمویی' : 'Mousa Amooie'}
                </h4>
                <p className="text-xs text-emerald-400 font-semibold">
                  {currentLanguage === 'fa' ? 'مدیریت ارشد و بنیان‌گذار کارخانه ام گاز' : 'Managing Director & Founder'}
                </p>
                <p className="text-xs text-slate-400 italic pt-1">
                  {currentLanguage === 'fa'
                    ? '«ایمنی مصرف‌کننده و دوام مادام‌العمر مخزن، اصولی هستند که هرگز در خط تولید ام گاز بر سر آنها مصالحه نمی‌شود.»'
                    : '"Consumer safety and lifecycle durability are non-negotiable principles across all M Gas production lines."'}
                </p>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 text-center">
                <span className="font-mono text-2xl sm:text-3xl font-black text-emerald-400 block">50+</span>
                <span className="text-[11px] text-slate-400 font-medium">
                  {currentLanguage === 'fa' ? 'سال سابقه تولید' : 'Years Experience'}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 text-center">
                <span className="font-mono text-2xl sm:text-3xl font-black text-emerald-400 block">12+</span>
                <span className="text-[11px] text-slate-400 font-medium">
                  {currentLanguage === 'fa' ? 'کشور مقصد صادرات' : 'Export Hubs'}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 text-center">
                <span className="font-mono text-2xl sm:text-3xl font-black text-emerald-400 block">30 Bar</span>
                <span className="text-[11px] text-slate-400 font-medium">
                  {currentLanguage === 'fa' ? 'فشار تست اثباتی' : 'Proof Testing'}
                </span>
              </div>
            </div>

          </div>

          {/* Right Column: Factory Image & Export Destinations */}
          <div className="lg:col-span-5 space-y-6">
            <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl group">
              <img
                src="/banners/DSC08591.webp"
                alt="M Gas Factory Facility"
                className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700/60 text-xs text-slate-200 flex items-center justify-between">
                <span className="font-semibold">{currentLanguage === 'fa' ? 'مجتمع صنعتی کارخانه در استان البرز (کرج)' : 'Karaj Industrial Facility, Alborz'}</span>
                <Globe2 className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
