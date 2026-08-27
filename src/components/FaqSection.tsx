import React, { useState, useMemo } from 'react';
import {
  HelpCircle,
  ChevronDown,
  Search,
  ShieldCheck,
  Truck,
  Layers,
  Sparkles,
  Flame,
  MessageCircle,
  FileCheck,
  Wrench,
  CheckCircle2,
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { COMPANY_INFO } from '../data/company';

interface FaqItem {
  id: string;
  category: 'manufacturing' | 'shipping' | 'standards' | 'customization';
  qFa: string;
  qEn: string;
  aFa: string;
  aEn: string;
  badgeFa?: string;
  badgeEn?: string;
}

const FAQ_DATABASE: FaqItem[] = [
  {
    id: 'faq-manufacturing-process',
    category: 'manufacturing',
    qFa: 'فرآیند تولید و استانداردهای متالورژی کپسول‌های گاز ام گاز چگونه است؟',
    qEn: 'What is the manufacturing process and metallurgical standard of M-Gas LPG cylinders?',
    aFa: 'کپسول‌های ام گاز از ورق‌های فولادی میکروآلیاژی با استحکام کششی بالا (استاندارد HP295 / SG295) با ضخامت مهندسی‌شده تولید می‌شوند. خط تولید شامل پرس‌های کشش عمیق خودکار (Deep Drawing)، جوشکاری رباتیک زیرپودری (Submerged-Arc Welding)، کوره عملیات حرارتی نرمالایزینگ (Normalizing Furnace در دمای ۹۰۰+ درجه سانتی‌گراد) جهت رفع تنش‌های پسماند جوشکاری، و شات‌بلاست تمام‌اتوماتیک است.',
    aEn: 'M-Gas cylinders are manufactured from specialized high-tensile micro-alloyed steel sheets (HP295 / SG295 standard). The production line utilizes automated multi-stage deep drawing presses, robotic submerged-arc seam welding, continuous normalizing heat-treatment furnaces (at 900°C+ to relieve all residual welding stresses), and fully automated shot blasting for surface preparation.',
    badgeFa: 'فولاد HP295 و عملیات حرارتی',
    badgeEn: 'HP295 Steel & Normalizing',
  },
  {
    id: 'faq-hydrostatic-testing',
    category: 'standards',
    qFa: 'آزمون‌های کنترل کیفیت و تست فشار هیدرواستاتیک در چه مراحلی انجام می‌شود؟',
    qEn: 'What quality control and hydrostatic pressure testing procedures are conducted?',
    aFa: '۱۰۰٪ سیلندرهای تولیدی پیش از خروج از خط تولید تحت آزمون فشار هیدرواستاتیک ۳۰ الی ۳۴ بار (بیش از دو برابر فشار کاری استاندارد) در حمام تست ویژه قرار می‌گیرند. علاوه بر این، تست رادیوگرافی (X-Ray) درز جوش، آزمون متلاشی‌شدن تحت فشار هیدرولیک (Burst Test با مقاومت بیش از ۸۵ بار) و آزمون خمش و کشش متالورژیکی به صورت تصادفی روی نمونه‌های هر بهر تولیدی انجام می‌شود.',
    aEn: '100% of manufactured cylinders undergo strict hydrostatic pressure testing at 30 to 34 Bar (over 2x the standard working pressure) in specialized automated testing chambers. Additionally, radiographic X-ray weld inspection, hydraulic burst testing (>85 Bar limit), and metallurgical tensile/elongation tests are performed systematically on random batch samples.',
    badgeFa: 'تست هیدرواستاتیک ۳۰-۳۴ بار',
    badgeEn: '30-34 Bar Hydraulic Test',
  },
  {
    id: 'faq-certifications-iso-en',
    category: 'standards',
    qFa: 'مجتمع کارخانجات ام گاز دارای چه سرتیفیکیت‌ها و استانداردهای بین‌المللی است؟',
    qEn: 'Which international certifications and regulatory standards does M-Gas hold?',
    aFa: 'کارخانه ام گاز دارنده گواهینامه رسمی مدیریت کیفیت ISO 9001:2015، تاییدیه استاندارد ملی ایران (ISIRI 841 و ISIRI 6734)، و انطباق کامل با استاندارد اروپایی EN 1442 و الزامات DOT-4BA/4BW است. کلیه محموله‌های صادراتی همراه با برگه بازرسی متالورژی و سرتیفیکیت آزمون هیدرواستاتیک و تاییدیه بازرسان بین‌المللی (مانند SGS) ارائه می‌گردد.',
    aEn: 'M-Gas holds ISO 9001:2015 Quality Management certification, strict compliance with European Standard EN 1442 (Transportable Refillable Welded Steel Cylinders for LPG), and alignment with DOT-4BA/4BW specifications. All export shipments are accompanied by mill test certificates, hydrostatic test sheets, and third-party inspection reports (e.g., SGS or equivalent).',
    badgeFa: 'ISO 9001:2015 & EN 1442',
    badgeEn: 'ISO 9001 & EN 1442',
  },
  {
    id: 'faq-shipping-containers',
    category: 'shipping',
    qFa: 'ظرفیت بارگیری در کانتینرهای ۲۰ و ۴۰ فوت صادراتی و شرایط حمل چگونه است؟',
    qEn: 'What are the container loading capacities (20ft & 40ft HQ) and international shipping terms?',
    aFa: 'سیلندرها بر روی پالت‌های چوبی ضدعفونی‌شده (Fumigated) یا به صورت چیدمان بار فله با توری‌های محافظ پلی‌اتیلنی و تسمه‌کشی مقاوم بسته‌بندی می‌شوند. یک کانتینر ۲۰ فوت استاندارد حدود ۹۰۰ تا ۱۲۰۰ عدد کپسول و کانتینر ۴۰ فوت های‌کیوب (40ft HQ) تا بیش از ۲۴۰۰ عدد کپسول (بسته به حجم سیلندر) بارگیری می‌کند. تحویل به صورت FOB بندرعباس یا CIF بنادر مقصد در سراسر جهان انجام می‌شود.',
    aEn: 'Cylinders are packed on heat-treated fumigated wooden pallets or bulk-stowed with protective polyethylene netting and heavy-duty strapping. A standard 20ft container accommodates approx. 900 to 1,200 units, while a 40ft High Cube (HQ) container holds up to 2,400+ units depending on cylinder volume. Shipments are available under FOB (Bandar Abbas) or CIF terms to global destination ports.',
    badgeFa: 'کانتینر ۲۰ و ۴۰ فوت HQ',
    badgeEn: '20ft & 40ft HQ Logistics',
  },
  {
    id: 'faq-custom-coating-ral',
    category: 'customization',
    qFa: 'آیا امکان سفارشی‌سازی رنگ پودری الکترواستاتیک بر اساس کدهای RAL و درج لوگوی اختصاصی وجود دارد؟',
    qEn: 'Can we customize the electrostatic powder coating color via RAL charts and emboss our company logo?',
    aFa: 'بله، تمامی سیلندرها با پوشش پودری الکترواستاتیک کوره‌ای با ضخامت ۶۰ الی ۸۰ میکرون و مقاوم در برابر اشعه UV و سایش پوشش داده می‌شوند. خریداران می‌توانند رنگ دلخواه خود را از میان کدهای استاندارد رال (RAL Classic) انتخاب کنند. همچنین برای سفارش‌های کانتینری، امکان حک برجسته (Embossing) نام و لوگوی شرکت خریدار روی طوقه یا بدنه کپسول فراهم است.',
    aEn: 'Yes. All cylinders are coated with electrostatic thermosetting polyester powder (60–80 microns thickness) offering superior resistance to UV, corrosion, and abrasion. Clients can specify any color from the RAL Classic color catalog. For container-scale orders, custom embossing of company branding, logos, and tare weight on the cylinder collar or body is fully supported.',
    badgeFa: 'پوشش پودری RAL و حک لوگو',
    badgeEn: 'Custom RAL Coating & Embossing',
  },
  {
    id: 'faq-valves-compatibility',
    category: 'customization',
    qFa: 'شیرآلات و اتصالات کپسول‌ها با کدام استانداردهای جهانی سازگار هستند؟',
    qEn: 'Which international valve thread standards and safety relief mechanisms are supported?',
    aFa: 'سیلندرهای ام گاز با انواع شیرآلات استاندارد جهانی شامل رزوه‌های POL (CGA 510)، رزوه‌های اروپایی G.4 و G.8، شیرهای فشاری کامپکت ۲۰ میلی‌متر و ۲۲ میلی‌متر (Quick-On)، و اتصالات BS 341 سازگار هستند. کلیه شیرآلات مجهز به سوپاپ اطمینان اطمینان‌بخش (PRV - Pressure Relief Valve) با فشار تخلیه استاندارد ۲۵ الی ۲۸ بار هستند.',
    aEn: 'M-Gas cylinders support universal valve specifications including POL (CGA 510), European G.4/G.8 threads, 20mm/22mm compact Quick-On valves, and BS 341 fittings. All valves integrate calibrated Pressure Relief Valves (PRV) rated at 25–28 Bar to prevent over-pressurization during abnormal thermal conditions.',
    badgeFa: 'شیرهای POL، Quick-On و PRV',
    badgeEn: 'POL, Quick-On & PRV Valves',
  },
  {
    id: 'faq-moq-leadtime',
    category: 'shipping',
    qFa: 'حداقل تیراژ سفارش (MOQ) و زمان تحویل سفارش‌های صادراتی چقدر است؟',
    qEn: 'What is the Minimum Order Quantity (MOQ) and production lead time for export orders?',
    aFa: 'حداقل تیراژ برای کپسول‌های سنگین صنعتی (۴۵ و ۵۰ کیلوگرم) از ۴۵۰ عدد، برای کپسول‌های خانگی و کارگاهی (۱۰ تا ۲۸ لیتر) از ۱۰۰۰ عدد، و برای کپسول‌های پیک‌نیکی از ۳۰۰۰ تا ۷۰۰۰ عدد است. زمان تولید سفارش‌های کانتینری استاندارد بین ۱۵ الی ۲۵ روز کاری پس از نهایی‌شدن پیش‌فاکتور و تایید نمونه اولیه است.',
    aEn: 'The Minimum Order Quantity (MOQ) ranges from 450 units for large industrial cylinders (45kg & 50kg), 1,000 units for standard commercial/home cylinders (10L to 28L), and 3,000 to 7,000 units for compact picnic sizes. Production lead time for standard container batches is typically 15 to 25 working days following Proforma Invoice confirmation.',
    badgeFa: 'حداقل سفارش از ۴۵۰ عدد',
    badgeEn: 'MOQ from 450 units',
  },
  {
    id: 'faq-lifespan-warranty',
    category: 'manufacturing',
    qFa: 'طول عمر مفید، دوره‌های بازرسی ادواری و گارانتی سیلندرهای گاز مایع چقدر است؟',
    qEn: 'What is the operational lifespan, periodic re-qualification cycle, and warranty of the cylinders?',
    aFa: 'سیلندرهای ام گاز با طراحی مهندسی با دوام، طول عمر کاری بیش از ۱۵ سال دارند. طبق استانداردهای بین‌المللی، آزمون هیدرواستاتیک ادواری هر ۵ سال یک‌بار توصیه می‌شود. کلیه محصولات شامل گارانتی اصالت مواد اولیه، مقاومت مکانیکی درز جوش و انطباق کامل با مشخصات فنی تاییدشده هستند.',
    aEn: 'Engineered for exceptional durability, M-Gas cylinders have a designed operational lifespan exceeding 15+ years under standard operational conditions. Periodic hydrostatic re-qualification is recommended every 5 years according to international safety standards. All products are backed by manufacturing warranties covering metallurgical integrity and weld seam performance.',
    badgeFa: 'طول عمر بیش از ۱۵ سال',
    badgeEn: '15+ Years Design Life',
  },
];

interface FaqSectionProps {
  onOpenRfq?: () => void;
}

export const FaqSection: React.FC<FaqSectionProps> = ({ onOpenRfq }) => {
  const { currentLanguage, isRTL, t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<'all' | 'manufacturing' | 'shipping' | 'standards' | 'customization'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openIds, setOpenIds] = useState<string[]>(['faq-manufacturing-process', 'faq-hydrostatic-testing']);

  const categories = [
    { id: 'all', labelFa: 'همه پرسش‌ها', labelEn: 'All Questions', icon: HelpCircle },
    { id: 'manufacturing', labelFa: 'تولید و آزمون کیفیت', labelEn: 'Manufacturing & QC', icon: Wrench },
    { id: 'standards', labelFa: 'استانداردها و سرتیفیکیت‌ها', labelEn: 'Certificates & Specs', icon: ShieldCheck },
    { id: 'shipping', labelFa: 'حمل، کانتینر و صادرات', labelEn: 'Shipping & Logistics', icon: Truck },
    { id: 'customization', labelFa: 'رنگ پودری و شیرآلات', labelEn: 'Customization & Valves', icon: Layers },
  ];

  const filteredFaqs = useMemo(() => {
    return FAQ_DATABASE.filter((item) => {
      // Category filter
      if (activeCategory !== 'all' && item.category !== activeCategory) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const qText = (currentLanguage === 'fa' ? item.qFa : item.qEn).toLowerCase();
        const aText = (currentLanguage === 'fa' ? item.aFa : item.aEn).toLowerCase();
        return qText.includes(q) || aText.includes(q);
      }
      return true;
    });
  }, [activeCategory, searchQuery, currentLanguage]);

  const toggleAccordion = (id: string) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <section id="faq" className="py-20 bg-[#071118] relative border-t border-slate-800/80">
      
      {/* Background ambient glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[140px]" />
        <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-teal-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider shadow-lg">
            <HelpCircle className="w-4 h-4 text-emerald-400" />
            <span>{t.faqBadge || (currentLanguage === 'fa' ? 'مرکز دانش و پرسش‌های متداول' : 'Knowledge Base & FAQ')}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {t.faqTitle || (currentLanguage === 'fa' ? 'پاسخ به سوالات متداول تولید، صادرات و استانداردها' : 'Frequently Asked Technical & Commercial Questions')}
          </h2>

          <p className="text-sm sm:text-base text-slate-300">
            {t.faqSubtitle || (currentLanguage === 'fa'
              ? 'اطلاعات کامل درباره فرآیندهای مهندسی ساخت، آزمون‌های ۳۰ بار هیدرواستاتیک، بارگیری کانتینری و سرتیفیکیت‌های بین‌المللی'
              : 'Detailed insights on cylinder fabrication, 30-bar hydraulic testing, international shipping logistics, and compliance standards')}
          </p>
        </div>

        {/* Categories Bar & Search */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10">
          
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900/95 border border-slate-800 w-full md:w-auto">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id as any)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-md shadow-emerald-950'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{currentLanguage === 'fa' ? cat.labelFa : cat.labelEn}</span>
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className={`w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-3.5' : 'left-3.5'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={currentLanguage === 'fa' ? 'جستجو در سوالات و پاسخ‌ها...' : 'Search inquiries...'}
              className={`w-full bg-slate-900/95 border border-slate-800 rounded-2xl py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 transition-colors ${
                isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'
              }`}
            />
          </div>
        </div>

        {/* Accordion List */}
        {filteredFaqs.length > 0 ? (
          <div className="space-y-3.5">
            {filteredFaqs.map((faq) => {
              const isOpen = openIds.includes(faq.id);
              const question = currentLanguage === 'fa' ? faq.qFa : faq.qEn;
              const answer = currentLanguage === 'fa' ? faq.aFa : faq.aEn;
              const badge = currentLanguage === 'fa' ? faq.badgeFa : faq.badgeEn;

              return (
                <div
                  key={faq.id}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isOpen
                      ? 'bg-slate-900/90 border-emerald-500/40 shadow-lg shadow-emerald-950/20'
                      : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900/70'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleAccordion(faq.id)}
                    className="w-full flex items-center justify-between p-4 sm:p-5 text-start gap-4 transition-colors"
                    aria-expanded={isOpen}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isOpen ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-emerald-400'
                      }`}>
                        <HelpCircle className="w-4 h-4" />
                      </div>
                      <div className="space-y-1">
                        <span className="text-sm sm:text-base font-bold text-white block">
                          {question}
                        </span>
                        {badge && (
                          <span className="inline-block text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-800/40">
                            {badge}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className={`w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center shrink-0 text-slate-400 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 bg-emerald-500/20 text-emerald-300' : ''
                    }`}>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {/* Accordion Expandable Content */}
                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 pt-1 border-t border-slate-800/80 text-slate-300 text-xs sm:text-sm leading-relaxed space-y-3 animate-fadeIn">
                      <p className="text-justify">{answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-10 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-400">
            <p>{currentLanguage === 'fa' ? 'هیچ پرسشی با عبارت جستجو شده یافت نشد.' : 'No matching questions found.'}</p>
          </div>
        )}

        {/* Bottom Direct Inquiry Help Card */}
        <div className="mt-12 p-6 rounded-3xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/60 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1 text-center sm:text-start">
            <h4 className="text-base font-bold text-white flex items-center justify-center sm:justify-start gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>{currentLanguage === 'fa' ? 'پرسش دیگری دارید یا نیاز به مشاوره فنی دارید؟' : 'Have a custom inquiry or need technical consultation?'}</span>
            </h4>
            <p className="text-xs text-slate-400">
              {currentLanguage === 'fa'
                ? 'تیم مهندسی و مدیر فروش بین‌المللی کارخانه به صورت ۲۴ ساعته پاسخگوی سوالات شما در واتس‌اپ هستند.'
                : 'Our engineering & international sales directors are available 24/7 on WhatsApp.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              href={`https://wa.me/${COMPANY_INFO.contacts.internationalSalesManager.whatsapp.replace('+', '')}?text=${encodeURIComponent(
                'Hello M Gas, I have a technical question regarding your LPG cylinders manufacturing and export terms.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{currentLanguage === 'fa' ? 'گفتگو در واتس‌اپ' : 'Ask on WhatsApp'}</span>
            </a>

            {onOpenRfq && (
              <button
                type="button"
                onClick={onOpenRfq}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
              >
                <span>{t.heroCtaQuote}</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </section>
  );
};
