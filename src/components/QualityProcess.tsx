import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { ShieldCheck, Gauge, CheckCircle2, Award, Microscope, Flame, Factory, Sparkles } from 'lucide-react';

export const QualityProcess: React.FC = () => {
  const { currentLanguage, t } = useLanguage();

  const steps = [
    {
      step: '01',
      titleFa: 'ورق فولادی استاندارد P265GH / St37',
      titleEn: 'Certified P265GH Pressure Vessel Steel',
      descFa: 'تأمین ورق‌های فولادی استاندارد مخازن تحت فشار با آزمون‌های متالورژی و مقاومت کششی دقیق.',
      descEn: 'Procurement of certified pressure vessel steel with ultrasonic flaw detection and tensile tests.',
      icon: LayersIcon,
    },
    {
      step: '02',
      titleFa: 'فرم‌دهی هیدرولیک و پرس عمیق',
      titleEn: 'Hydraulic Deep Drawing & Flanging',
      descFa: 'فرم‌دهی یکنواخت عدسی‌های سر و ته با پرس‌های هیدرولیک چندمرحله‌ای به منظور حذف تمرکز تنش.',
      descEn: 'Uniform dome deep-drawing via multi-stage hydraulic stamping to eliminate stress concentrations.',
      icon: Factory,
    },
    {
      step: '03',
      titleFa: 'جوشکاری زیرپودری اتوماتیک (SAW)',
      titleEn: 'Automated Submerged Arc Welding',
      descFa: 'جوشکاری تمام اتوماتیک درز محیطی با بالاترین کیفیت نفوذ و بررسی دوره‌ای رادیوگرافی (X-Ray).',
      descEn: 'Fully automated circumferential welding with continuous melt pool shield and X-ray radiograph audits.',
      icon: Flame,
    },
    {
      step: '04',
      titleFa: 'تست هیدرواستاتیک ۱۰۰٪ با فشار ۳۰ بار',
      titleEn: '100% 30-Bar Hydrostatic Proof Testing',
      descFa: 'آزمون فشار هیدرولیکی تمام سیلندرها تا ۳۰ بار و تست نشت حباب‌های میکرونی در حوضچه‌های زیر آب.',
      descEn: 'Mandatory proof pressure testing of all units up to 30 bar along with continuous underwater leak checks.',
      icon: Gauge,
    },
    {
      step: '05',
      titleFa: 'رنگ‌آمیزی الکترواستاتیک کوره‌ای',
      titleEn: 'Oven-Baked Electrostatic Powder Coating',
      descFa: 'شستشوی چندمرحله‌ای فسفاته و پاشش رنگ پودری کوره‌ای با ضخامت حداقل ۱۰۰ میکرون ضدسایش و UV.',
      descEn: 'Multi-stage phosphating wash followed by 100μm+ oven-baked epoxy-polyester electrostatic coating.',
      icon: Sparkles,
    },
    {
      step: '06',
      titleFa: 'کنترل نهایی، مونتاژ شیر و صدور گواهی',
      titleEn: 'Valve Assembly & Quality Certification',
      descFa: 'مونتاژ گشتاور دقیق شیرهای استاندارد، تست نشتی نهایی و صدور شناسنامه فنی و بارکد ردیابی کپسول.',
      descEn: 'Torque-calibrated valve installation, secondary airtightness test, and batch tracking certification.',
      icon: ShieldCheck,
    },
  ];

  function LayersIcon(props: any) {
    return <Microscope {...props} />;
  }

  return (
    <section id="quality" className="relative py-24 bg-slate-950 border-t border-slate-800 overflow-hidden">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <Award className="w-4 h-4" />
            <span>{currentLanguage === 'fa' ? 'استاندارد و کنترل کیفیت ۳۰ بار' : 'Zero-Defect Quality Engineering'}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
            {currentLanguage === 'fa' ? 'فرآیند ۶ مرحله‌ای تولید و آزمون ایمنی سیلندر' : '6-Stage Manufacturing & Proof-Testing Lifecycle'}
          </h2>

          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            {currentLanguage === 'fa'
              ? 'تولید بر پایه استانداردهای جهانی مخازن تحت فشار، خطوط جوش تمام اتوماتیک و آزمون تک به تک محصولات.'
              : 'Engineered according to international pressure vessel directives with strict hydrostatic audits on every single cylinder.'}
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="relative p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition-all group flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="font-mono text-2xl font-black text-slate-700 group-hover:text-emerald-500/40 transition-colors">
                      {item.step}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white leading-snug">
                    {currentLanguage === 'fa' ? item.titleFa : item.titleEn}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    {currentLanguage === 'fa' ? item.descFa : item.descEn}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-800/60 flex items-center gap-2 text-[11px] text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>ISO 9001:2015 & ISIRI 841</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
