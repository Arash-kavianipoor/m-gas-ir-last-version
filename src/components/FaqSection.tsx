import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { HelpCircle, ChevronDown, MessageCircle, ShieldCheck, Phone } from 'lucide-react';
import { COMPANY_INFO } from '../data/company';

interface FaqSectionProps {
  onOpenRfq?: () => void;
}

export const FaqSection: React.FC<FaqSectionProps> = ({ onOpenRfq }) => {
  const { currentLanguage, t } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      qFa: 'آیا کلیه سیلندرهای تولیدی ام گاز تحت آزمون هیدرواستاتیک ۳۰ بار قرار می‌گیرند؟',
      qEn: 'Are all M Gas cylinders tested with 30-bar hydrostatic proof pressure?',
      aFa: 'بله، بدون هیچ‌گونه استثنا، ۱۰۰٪ کپسول‌های گاز تولید شده در کارخانه ام گاز در ایستگاه‌های مکانیزه تحت فشار ۳۰ بار آب (۱.۵ برابر فشار کارکرد نامی) تست شده و در صورت هرگونه افت فشار یا تغییر فرم میکرونی از خط خارج می‌گردند.',
      aEn: 'Yes. 100% of manufactured cylinders without exception undergo mandatory 30-bar hydrostatic proof pressure testing (1.5x working pressure) and continuous underwater bubble leakage inspection.',
    },
    {
      qFa: 'حداقل تیراژ سفارش (MOQ) برای خرید عمده و محموله‌های صادراتی چقدر است؟',
      qEn: 'What is the minimum order quantity (MOQ) for bulk & export shipments?',
      aFa: 'حداقل تیراژ بسته به ظرفیت سیلندر (از ۰.۵ لیتر تا ۶۰ لیتر) بین ۲۰۰ الی ۱۰۰۰ عدد متغیر است. همچنین امکان بارگیری ترکیبی چند مدل مختلف در یک کانتینر ۲۰ فوت یا ۴۰ فوت های‌کیوب فراهم است.',
      aEn: 'MOQ ranges between 200 and 1,000 units depending on cylinder volume (0.5L to 60L). Mixed container loadouts with multiple cylinder capacities are also supported.',
    },
    {
      qFa: 'آیا امکان سفارشی‌سازی رنگ بدنه بر اساس کد اختصاصی رال (RAL) مشتری وجود دارد؟',
      qEn: 'Is custom RAL color powder coating available for cylinders?',
      aFa: 'بله، خط رنگ تمام اتوماتیک الکترواستاتیک کارخانه ام گاز قابلیت اجرای بیش از ۲۰۰ کد رنگ استاندارد بین‌المللی RAL را با ضخامت کنترل‌شده ۱۰۰ تا ۱۲۰ میکرون دارد.',
      aEn: 'Yes, our automated electrostatic powder coating facility supports all 200+ international standard RAL color codes with baked epoxy-polyester finish.',
    },
    {
      qFa: 'سیلندرهای ام گاز با چه نوع شیرها و استانداردهایی مونتاژ می‌شوند؟',
      qEn: 'What valve specifications and international standards are fitted?',
      aFa: 'سیلندرهای صادراتی متناسب با کشور مقصد با شیرهای استاندارد برنجی با رزوه W21.8، رزوه چپ‌گرد، شیرهای سوپاپ‌دار یا مولتی‌والوهای خودرویی ECE R67 مونتاژ و آزمایش می‌شوند.',
      aEn: 'Cylinders are assembled according to destination market standards with certified brass valves (W21.8, POL, left-hand threads, compact camping valves, or ECE R67 automotive multivalves).',
    },
    {
      qFa: 'چه استانداردهای ملی و بین‌المللی برای سیلندرهای ام گاز اخذ شده است؟',
      qEn: 'Which national and international certifications does M Gas hold?',
      aFa: 'کارخانه ام گاز دارنده نشان استاندارد ملی ایران (ISIRI 841 و ISIRI 406)، گواهینامه مدیریت کیفیت بین‌المللی ISO 9001:2015 و تاییدیه مقاومت تست فشار مخازن است.',
      aEn: 'M Gas holds the National Standard of Iran (ISIRI 841 / ISIRI 406), ISO 9001:2015 Quality Management Certification, and Pressure Equipment Directive approvals.',
    },
  ];

  return (
    <section id="faq" className="relative py-24 bg-slate-950 border-t border-slate-800 overflow-hidden">
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <HelpCircle className="w-4 h-4" />
            <span>{currentLanguage === 'fa' ? 'سوالات متداول مشتریان و بازرگانان' : 'Frequently Asked Questions'}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {currentLanguage === 'fa' ? 'پاسخ به سوالات فنی، تولید و صادرات' : 'Technical Specifications & Export Logistics FAQ'}
          </h2>
        </div>

        {/* Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-slate-900/60 border border-slate-800/80 overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-5 flex items-center justify-between text-start gap-4 hover:bg-slate-900/90 transition-colors"
                >
                  <span className="text-sm sm:text-base font-bold text-slate-100">
                    {currentLanguage === 'fa' ? faq.qFa : faq.qEn}
                  </span>
                  <div
                    className={`p-1.5 rounded-lg bg-slate-800 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-emerald-400 bg-emerald-500/10' : ''
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/40">
                    {currentLanguage === 'fa' ? faq.aFa : faq.aEn}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Callout */}
        <div className="mt-12 p-6 rounded-2xl bg-emerald-950/30 border border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-start">
          <div>
            <h4 className="text-sm font-bold text-white">
              {currentLanguage === 'fa' ? 'سوالی دارید که در لیست بالا نیست؟' : 'Have a custom inquiry or special technical requirement?'}
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              {currentLanguage === 'fa' ? 'کارشناسان فنی و مدیر فروش بین‌الملل آماده پاسخگویی هستند.' : 'Our engineering and export dispatch desks are available 24/7.'}
            </p>
          </div>

          <a
            href={`https://wa.me/${COMPANY_INFO.contacts.internationalSalesManager.whatsapp.replace('+', '')}?text=Hello%20M%20Gas%20Sales`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 text-xs font-bold transition-all flex items-center gap-2 shrink-0 shadow-lg shadow-[#25D366]/20"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{currentLanguage === 'fa' ? 'گفتگو در واتس‌اپ' : 'Chat on WhatsApp'}</span>
          </a>
        </div>

      </div>
    </section>
  );
};
