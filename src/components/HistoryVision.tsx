import React from 'react';
import {
  History,
  Target,
  Globe2,
  Compass,
  CheckCircle,
  Building2,
  Award,
  TrendingUp,
  UserCheck,
  Quote,
  ShieldCheck,
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { GlowCard } from './ui/GlowCard';

export const HistoryVision: React.FC = () => {
  const { t, isRTL, currentLanguage } = useLanguage();

  const founderContent = {
    badge: {
      fa: 'رهبری و مدیریت ارشد کارخانه',
      en: 'Executive Leadership & Founder',
      ar: 'القيادة التنفيذية والمؤسس',
      de: 'Unternehmensführung & Gründer',
      ur: 'ایگزیکٹو لیڈرشپ اور بانی',
      hy: 'Ղեկավարություն և հիմնադիր',
      tr: 'Üst Yönetim ve Kurucu',
      ru: 'Руководство и основатель завода',
    },
    name: {
      fa: 'آقای موسی عمویی',
      en: 'Mr. Mousa Amooie',
      ar: 'السيد موسى عموئي',
      de: 'Herr Mousa Amooie',
      ur: 'جناب موسیٰ عموئی',
      hy: 'Պրն. Մուսա Ամուի',
      tr: 'Sn. Mousa Amooie',
      ru: 'Г-н Муса Амуи',
    },
    role: {
      fa: 'بنیان‌گذار، مدیرعامل و پیشگام صنعت تولید مخازن و سیلندرهای گاز مایع (تأسیس ۱۳۴۹)',
      en: 'Founder, Managing Director & Pioneer of LPG Pressure Vessel Manufacturing (Est. 1970)',
      ar: 'المؤسس والمدير العام ورائد صناعة تصنيع أسطوانات وأوعية الغاز المسال (تأسس 1970)',
      de: 'Gründer, Geschäftsführer & Pionier der Flüssiggasbehälter-Herstellung (Gegr. 1970)',
      ur: 'بانی، مینجنگ ڈائریکٹر اور ایل پی جی سلنڈر مینوفیکچرنگ انڈسٹری کے سرخیل (قیام 1970)',
      hy: 'Հիմնադիր, գլխավոր տնօրեն և LPG ճնշման անոթների արտադրության առաջամարտիկ (հիմնադրված 1970 թ.)',
      tr: 'Kurucu, Genel Müdür ve LPG Basınçlı Kap İmalat Sanayii Öncüsü (Kuruluş 1970)',
      ru: 'Основатель, генеральный директор и пионер производства сосудов под давлением LPG (Осн. 1970)',
    },
    quote: {
      fa: '«هدف ما در طول بیش از پنج دهه فعالیت صنعتی، تلفیق بالاترین استانداردهای ایمنی مهندسی با فناوری‌های روز قالب‌گیری هیدرولیک و جوشکاری اتوماتیک بوده است. هر سیلندر تولیدی با نام M Gas، نماد تعهد بی‌قیدوشرط ما به حفظ جان و ایمنی مصرف‌کنندگان در سراسر جهان است.»',
      en: '"Throughout more than five decades of industrial manufacturing, our guiding mission has remained steadfast: integrating uncompromising engineering safety with precision hydraulic forming and automated submerged arc welding. Every cylinder bearing the M Gas name represents our unconditional commitment to consumer safety worldwide."',
      ar: '«على مدى أكثر من خمسة عقود من العمل الصناعي، تمثلت مهمتنا في دمج أعلى معايير السلامة الهندسية مع أحدث تقنيات القولبة الهيدروليكية واللحام الآلي. كل أسطوانة تحمل اسم M Gas هي رمز لالتزامنا الصارم بسلامة المستهلكين حول العالم.»',
      de: '"In über fünf Jahrzehnten industrieller Fertigung war es stets unser Anspruch, kompromisslose technische Sicherheit mit moderner hydraulischer Umformung und automatisiertem Schweißen zu verbinden. Jeder Zylinder mit dem Namen M Gas steht für unser bedingungsloses Bekenntnis zur Sicherheit weltweit."',
      ur: '"پانچ دہائیوں سے زیادہ کی صنعتی مینوفیکچرنگ کے دوران، ہمارا مشن ہمیشہ غیر سمجھوتہ شدہ انجینئرنگ سیفٹی کو جدید ہائیڈرولک فارمنگ اور خودکار ویلڈنگ کے ساتھ جوڑنا رہا ہے۔ M Gas کا نام رکھنے والا ہر سلنڈر دنیا بھر میں صارفین کی حفاظت کے لیے ہمارے غیر مشروط عزم کی علامت ہے۔"',
      hy: '"Ավելի քան հինգ տասնամյակ արդյունաբերական արտադրության ընթացքում մեր նպատակն է եղել անզիջում ինժեներական անվտանգությունը համատեղել առաջադեմ տեխնոլոգիաների հետ: M Gas անվամբ յուրաքանչյուր բալոն սպառողների անվտանգության մեր երաշխիքն է:"',
      tr: '"Elli yılı aşkın sanayi üretimimiz boyunca temel misyonumuz; tavizsiz mühendislik güvenliğini modern hidrolik presleme ve otomatik tozaltı kaynağı ile buluşturmak olmuştur. M Gas adını taşıyan her tüp, dünya genelinde tüketici güvenliğine olan koşulsuz bağlılığımızın simgesidir."',
      ru: '"На протяжении более пяти десятилетий нашей промышленной деятельности нашей неизменной целью было объединение бескомпромиссной инженерной безопасности с передовыми технологиями формовки и автоматической сварки. Каждый баллон с маркировкой M Gas — это символ нашей безусловной ответственности за безопасность потребителей по всему миру."',
    },
  };

  const getLoc = (dict: Record<string, string>) => dict[currentLanguage] || dict.fa || dict.en;

  return (
    <section id="history" className="py-20 bg-[#07141B] relative">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
            <History className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t.historyBadge}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {t.historyTitle}
          </h2>

          <p className="text-sm sm:text-base text-slate-300">
            {t.historySubtitle}
          </p>
        </div>

        {/* Featured Founder & Managing Director Leadership Card */}
        <div className="mb-16 rounded-3xl bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-[#07141B] border-2 border-emerald-500/30 shadow-2xl shadow-emerald-950/40 relative overflow-hidden">
          {/* Ambient Background Glows - desktop GPU only */}
          <div className="hidden lg:block absolute top-0 start-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="hidden lg:block absolute bottom-0 end-0 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 items-stretch">
            {/* Founder Full-Height Uncropped Portrait (Positioned on the Left on Desktop) */}
            <div className="order-1 ltr:lg:order-1 rtl:lg:order-2 lg:col-span-5 xl:col-span-4 relative flex flex-col items-center justify-end bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent border-b lg:border-b-0 lg:border-r border-slate-800/80 p-6 pt-10 sm:p-8 lg:p-6">
              {/* Top Founder Tag (Mobile only) */}
              <div className="w-full flex justify-center mb-4 lg:hidden">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500 text-slate-950 text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-500/20">
                  <UserCheck className="w-4 h-4" />
                  <span>FOUNDER & MANAGING DIRECTOR</span>
                </span>
              </div>

              {/* Uncropped Full Height Photo Display */}
              <div className="relative w-full h-[380px] sm:h-[440px] lg:h-[500px] xl:h-[540px] flex items-end justify-center">
                {/* Subtle soft spotlight glow behind person */}
                <div className="hidden lg:block absolute bottom-4 inset-x-8 h-72 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

                <img
                  src="/founder/mousa-amooie.png"
                  alt={getLoc(founderContent.name)}
                  width={400}
                  height={540}
                  loading="lazy"
                  decoding="async"
                  style={{ aspectRatio: '400/540' }}
                  className="relative z-10 max-h-full max-w-full w-auto h-auto object-contain object-bottom drop-shadow-[0_20px_40px_rgba(0,0,0,0.85)] filter transition-transform duration-500 hover:scale-[1.02]"
                  referrerPolicy="no-referrer"
                />

                {/* Subtle bottom fade to seamlessly blend into container base */}
                <div className="absolute bottom-0 inset-x-0 h-6 bg-gradient-to-t from-slate-950/60 to-transparent pointer-events-none z-20" />
              </div>

              {/* Founder Nameplate on bottom of image column */}
              <div className="mt-4 w-full text-center py-2.5 px-4 rounded-2xl bg-slate-950/80 border border-slate-800/90 backdrop-blur-md z-20">
                <div className="text-base sm:text-lg font-black text-white">
                  {getLoc(founderContent.name)}
                </div>
                <div className="text-xs text-emerald-400 font-mono font-bold">
                  Mousa Amooie
                </div>
              </div>
            </div>

            {/* Founder Message, Heritage & Credentials Column (Positioned on the Right on Desktop) */}
            <div className="order-2 ltr:lg:order-2 rtl:lg:order-1 lg:col-span-7 xl:col-span-8 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                {/* Header Badge & Designation */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>{getLoc(founderContent.badge)}</span>
                  </div>

                  <span className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500 text-slate-950 text-[11px] font-black uppercase tracking-wider shadow-lg shadow-emerald-500/20">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>FOUNDER & MD</span>
                  </span>
                </div>

                <div>
                  <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {getLoc(founderContent.name)}
                  </h3>
                  <p className="text-xs sm:text-sm text-emerald-400/90 font-medium mt-1">
                    {getLoc(founderContent.role)}
                  </p>
                </div>

                {/* Founder Direct Statement / Quote */}
                <div className="relative bg-slate-950/70 p-5 sm:p-7 rounded-2xl border border-slate-800/80 shadow-inner">
                  <Quote className="w-8 h-8 text-emerald-500/30 mb-2 rotate-180 rtl:rotate-0" />
                  <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal text-justify">
                    {getLoc(founderContent.quote)}
                  </p>
                  <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
                    <span className="text-emerald-400 font-bold">
                      {getLoc(founderContent.name)} — M Gas Manufacturing Co.
                    </span>
                    <span className="font-mono text-slate-500">
                      Est. 1970 • 50+ Years Heritage
                    </span>
                  </div>
                </div>
              </div>

              {/* Key Metrics / Heritage Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                  <div className="text-lg sm:text-xl font-mono font-black text-emerald-400">1970</div>
                  <div className="text-[11px] text-slate-400">{isRTL ? 'سال تأسیس و آغاز فعالیت' : 'Established Year'}</div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                  <div className="text-lg sm:text-xl font-mono font-black text-emerald-400">50+ Bar</div>
                  <div className="text-[11px] text-slate-400">{isRTL ? 'مقاومت ترکیدگی هیدرولیک' : 'Burst Test Threshold'}</div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-center col-span-2 sm:col-span-1">
                  <div className="text-lg sm:text-xl font-mono font-black text-emerald-400">12+ Countries</div>
                  <div className="text-[11px] text-slate-400">{isRTL ? 'بازارهای صادراتی بین‌المللی' : 'Export Destinations'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Grid Pillars: History, Vision, Strategy */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 1. History Card */}
          <GlowCard
            glowColor="emerald"
            className="p-8 bg-slate-900/90 flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-950/80 border border-emerald-500/40 p-2 flex items-center justify-center shadow-lg shadow-emerald-950/40">
                <img
                  src="/logo/favicon.svg"
                  alt="M Gas Heritage Logo"
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="flex items-baseline justify-between">
                <h3 className="text-xl font-bold text-white">
                  {t.milestone1970Title}
                </h3>
                <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                  Est. 1970
                </span>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed text-justify">
                {t.historyText1}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800 text-xs text-emerald-400 font-medium flex items-center gap-2">
              <Award className="w-4 h-4" />
              <span>{t.historyCalloutSpecialists}</span>
            </div>
          </GlowCard>

          {/* 2. Vision Card */}
          <GlowCard
            glowColor="blue"
            className="p-8 bg-slate-900/90 flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-950/80 border border-blue-700/40 flex items-center justify-center text-blue-400">
                <Target className="w-6 h-6" />
              </div>

              <div className="flex items-baseline justify-between">
                <h3 className="text-xl font-bold text-white">
                  {t.milestone2010Title}
                </h3>
                <span className="text-xs font-mono text-blue-400 font-bold bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/40">
                  Global Standard
                </span>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed text-justify">
                {t.historyText2}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800 text-xs text-blue-400 font-medium flex items-center gap-2">
              <Globe2 className="w-4 h-4" />
              <span>{t.exportToCountries}</span>
            </div>
          </GlowCard>

          {/* 3. Strategy Card */}
          <GlowCard
            glowColor="purple"
            className="p-8 bg-slate-900/90 flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-950/80 border border-purple-700/40 flex items-center justify-center text-purple-400">
                <Compass className="w-6 h-6" />
              </div>

              <div className="flex items-baseline justify-between">
                <h3 className="text-xl font-bold text-white">
                  {t.milestone2026Title}
                </h3>
                <span className="text-xs font-mono text-purple-400 font-bold bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/40">
                  Continuous R&D
                </span>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed text-justify">
                {t.historyText3}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800 text-xs text-purple-400 font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span>{t.milestone2026Desc}</span>
            </div>
          </GlowCard>

        </div>

      </div>
    </section>
  );
};

