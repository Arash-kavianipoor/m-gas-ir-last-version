import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { FACTORY_CERTIFICATES, FactoryCertificate } from '../data/certificates';
import {
  Award,
  ShieldCheck,
  FileCheck2,
  Eye,
  X,
  ExternalLink,
  CheckCircle2,
  Building2,
  FileText,
  BadgeCheck,
  Download,
} from 'lucide-react';
import { LanguageCode } from '../types';

interface CertificatesSectionProps {
  id?: string;
  variant?: 'home' | 'about';
  onOpenRfq?: () => void;
}

export const CertificatesSection: React.FC<CertificatesSectionProps> = ({
  id = 'certificates',
  variant = 'home',
  onOpenRfq,
}) => {
  const { currentLanguage, isRTL } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'national' | 'quality' | 'international'>('all');
  const [activeModalCert, setActiveModalCert] = useState<FactoryCertificate | null>(null);

  const lang = (currentLanguage as LanguageCode) || 'fa';

  const filteredCerts = FACTORY_CERTIFICATES.filter((cert) => {
    if (selectedCategory === 'all') return true;
    return cert.category === selectedCategory;
  });

  const getLocalized = (field: Record<LanguageCode, string>) => {
    return field[lang] || field.fa || field.en;
  };

  const labels = {
    badge: {
      fa: 'تضمین اصالت، بازرسی ۳۰ بار و انطباق فنی',
      en: 'Authenticity, 30-Bar Hydrostatic Testing & Compliance',
      ar: 'ضمان الجودة واختبارات الضغط ۳۰ بار والمطابقة الفنية',
      ru: 'Гарантия подлинности, испытания под давлением 30 бар и сертификация',
      tr: 'Özgünlük Garantisi, 30 Bar Basınç Testi ve Teknik Uygunluk',
      de: 'Echtheitsgarantie, 30-Bar-Prüfung und technische Konformität',
      ur: 'اصلیت کی ضمانت، ۳۰ بار پریشر ٹیسٹنگ اور تکنیکی مطابقت',
      hy: 'Իսկության երաշխիք, 30 բար ճնշման փորձարկում և համապատասխանություն',
    },
    title: {
      fa: 'گواهینامه‌های رسمی و استانداردهای بین‌المللی کارخانه ام گاز',
      en: 'Official Quality Certifications & International Standards',
      ar: 'الشهادات الرسمية والمعايير الدولية لمصنع إم غاز',
      ru: 'Официальные сертификаты качества и международные стандарты M Gas',
      tr: 'M Gas Fabrikası Resmi Kalite Sertifikaları ve Uluslararası Standartlar',
      de: 'Offizielle Qualitätszertifikate und internationale Normen von M Gas',
      ur: 'ایم گیس فیکٹری کے سرکاری کوالٹی سرٹیفکیٹس اور بین الاقوامی معیارات',
      hy: 'M Gas Գործարանի Պաշտոնական Որակի Սերտիֆիկատները և Միջազգային Ստանդարտները',
    },
    description: {
      fa: 'تمامی سیلندرهای گاز مایع و مخازن تولیدی در کارخانه ام گاز دارای پروانه رسمی استاندارد ملی ایران (ISIRI 841)، گواهینامه بین‌المللی سیستم مدیریت کیفیت ISO 9001:2015 و تطابق با دستورالعمل‌های اروپایی EN 1442 و CE جهت صادرات به بازارهای جهانی هستند.',
      en: 'Every liquefied petroleum gas cylinder manufactured at M Gas conforms to the National Standard of Iran (ISIRI 841), ISO 9001:2015 Quality Management System, and European EN 1442 / CE pressure vessel directives for cross-border export.',
      ar: 'تخضع جميع أسطوانات الغاز المسال في مصنع إم غاز للمواصفة القياسية الوطنية الإيرانية (ISIRI 841)، وشهادة نظام إدارة الجودة الدولية ISO 9001:2015، والمطابقة لمعايير EN 1442 و CE الأوروبية للشحن الدولي.',
      ru: 'Все баллоны сжиженного газа завода M Gas соответствуют национальному стандарту Ирана (ISIRI 841), международному сертификату ISO 9001:2015 и европейским директивам EN 1442 / CE для экспортных поставок.',
      tr: 'M Gas fabrikasında üretilen tüm LPG tüpleri, İran Ulusal Standardı (ISIRI 841), ISO 9001:2015 Kalite Yönetim Sistemi ve uluslararası ihracat için Avrupa EN 1442 / CE direktiflerine uygundur.',
      de: 'Jede bei M Gas hergestellte Flüssiggasflasche erfüllt die nationale Norm des Iran (ISIRI 841), ISO 9001:2015 und die europäischen Druckgeräterichtlinien EN 1442 / CE für den weltweiten Export.',
      ur: 'ایم گیس فیکٹری میں تیار کردہ تمام ایل پی جی سلنڈرز ایران کے قومی معیار (ISIRI 841)، کوالٹی مینجمنٹ سسٹم ISO 9001:2015 اور برآمد کے لیے یورپی EN 1442 / CE ہدایات کے مطابق ہیں۔',
      hy: 'M Gas գործարանում արտադրված բոլոր հեղուկ գազի բալոնները համապատասխանում են Իրանի ազգային ստանդարտին (ISIRI 841), ISO 9001:2015-ին և եվրոպական EN 1442 / CE պահանջներին:',
    },
    filterAll: {
      fa: 'همه گواهینامه‌ها (۳)',
      en: 'All Certificates (3)',
      ar: 'جميع الشهادات (٣)',
      ru: 'Все сертификаты (3)',
      tr: 'Tüm Sertifikalar (3)',
      de: 'Alle Zertifikate (3)',
      ur: 'تمام سرٹیفکیٹس (۳)',
      hy: 'Բոլոր Սերտիֆիկատները (3)',
    },
    filterNational: {
      fa: 'استاندارد ملی ایران (ISIRI)',
      en: 'National Standard (ISIRI)',
      ar: 'المواصفات الوطنية (ISIRI)',
      ru: 'Национальный стандарт (ISIRI)',
      tr: 'Ulusal Standart (ISIRI)',
      de: 'Nationale Norm (ISIRI)',
      ur: 'قومی معیار (ISIRI)',
      hy: 'Ազգային Ստանդարտ (ISIRI)',
    },
    filterQuality: {
      fa: 'مدیریت کیفیت و تست ۳۰ بار',
      en: 'ISO Quality & 30-Bar Proof',
      ar: 'إدارة الجودة وضغط ۳۰ بار',
      ru: 'Качество ISO и тест 30 бар',
      tr: 'ISO Kalite ve 30 Bar Testi',
      de: 'ISO-Qualität & 30-Bar-Prüfung',
      ur: 'کوالٹی مینجمنٹ اور ۳۰ بار ٹیسٹ',
      hy: 'ISO Որակ և 30 Բար Փորձարկում',
    },
    filterInternational: {
      fa: 'بین‌المللی و صادرات (EN / CE)',
      en: 'International & Export (EN / CE)',
      ar: 'الدولية والتصدير (EN / CE)',
      ru: 'Международные и экспорт (EN / CE)',
      tr: 'Uluslararası ve İhracat (EN / CE)',
      de: 'International & Export (EN / CE)',
      ur: 'بین الاقوامی اور برآمد (EN / CE)',
      hy: 'Միջազգային և Արտահանում (EN / CE)',
    },
    viewHighRes: {
      fa: 'مشاهده سند با کیفیت بالا',
      en: 'Inspect High-Res Document',
      ar: 'معاينة الوثيقة بدقة عالية',
      ru: 'Просмотр документа в высоком разрешении',
      tr: 'Yüksek Çözünürlüklü Belgeyi İncele',
      de: 'Hochauflösendes Dokument ansehen',
      ur: 'اعلیٰ کوالٹی میں دستاویز دیکھیں',
      hy: 'Դիտել Բարձր Որակով Փաստաթուղթը',
    },
    docNumber: {
      fa: 'شماره پرونده / استاندارد',
      en: 'Registration / Standard Ref',
      ar: 'رقم الملف / المرجع',
      ru: 'Рег. номер / Ссылка на стандарт',
      tr: 'Kayıt / Standart Ref',
      de: 'Registrierungs- / Norm-Ref',
      ur: 'رجسٹریشن / ریفرنس نمبر',
      hy: 'Գրանցման / Ստանդարտի համար',
    },
    issuer: {
      fa: 'مرجع صادرکننده:',
      en: 'Issuing Authority:',
      ar: 'الجهة المانحة:',
      ru: 'Орган выдачи:',
      tr: 'Veren Kuruluş:',
      de: 'Ausstellende Behörde:',
      ur: 'جاری کنندہ ادارہ:',
      hy: 'Տրամադրող մարմին՝',
    },
    scopeLabel: {
      fa: 'دامنه کاربرد و استانداردهای فنی:',
      en: 'Certified Scope & Technical Criteria:',
      ar: 'نطاق الاعتماد والمعايير الفنية:',
      ru: 'Область действия и тех. критерии:',
      tr: 'Sertifikalı Kapsam ve Teknik Kriterler:',
      de: 'Zertifizierter Geltungsbereich & Prüfkriterien:',
      ur: 'سرٹیفائیڈ دائرہ کار اور تکنیکی معیار:',
      hy: 'Հավաստագրված ոլորտ և տեխնիկական չափանիշներ՝',
    },
    validityLabel: {
      fa: 'وضعیت نظارت و اعتبار:',
      en: 'Surveillance & Verification Status:',
      ar: 'حالة الصلاحية والرقابة المستمرة:',
      ru: 'Статус надзора и подтверждения:',
      tr: 'Gözetim ve Doğrulama Durumu:',
      de: 'Überwachungs- & Validierungsstatus:',
      ur: 'نگرانی اور توثیق کی حیثیت:',
      hy: 'Վավերականության և վերահսկողության կարգավիճակ՝',
    },
    verifiedTitle: {
      fa: 'تاییدیه ۱۰۰٪ انفرادی آزمون هیدرواستاتیک ۳۰ بار در کارخانه کرج',
      en: '100% Individual 30-Bar Hydrostatic Proof Verification at Karaj Works',
      ar: 'فحص هيدروستاتيكي فردي بنسبة ۱۰۰٪ بضغط ۳۰ بار في مصنع كرج',
      ru: '100% индивидуальное гидростатическое испытание под давлением 30 бар на заводе в Карадже',
      tr: 'Karac Fabrikasında %100 Bireysel 30 Bar Hidrostatik Doğrulama',
      de: '100%ige Einzelprüfung bei 30 Bar im Werk Karaj',
      ur: 'کرج فیکٹری میں ۳۰ بار پریشر پر ۱۰۰ فیصد انفرادی ہائیڈروسٹیٹک تصدیق',
      hy: '100% անհատական 30 բար հիդրոստատիկ փորձարկում Քարաջի գործարանում',
    },
    downloadAction: {
      fa: 'مشاهده فایل اصل سند',
      en: 'Open Full Document',
      ar: 'فتح الوثيقة الكاملة',
      ru: 'Открыть полный документ',
      tr: 'Tam Belgeyi Aç',
      de: 'Vollständiges Dokument öffnen',
      ur: 'مکمل دستاویز کھولیں',
      hy: 'Բացել ամբողջական փաստաթուղթը',
    },
    closeModal: {
      fa: 'بستن',
      en: 'Close',
      ar: 'إغلاق',
      ru: 'Закрыть',
      tr: 'Kapat',
      de: 'Schließen',
      ur: 'بند کریں',
      hy: 'Փակել',
    },
    stat1: { fa: '۳۰ بار فشار تست هیدرواستاتیک', en: '30-Bar Hydrostatic Proof' },
    stat2: { fa: '۱۰۰٪ آزمون رادیوگرافی جوش SAW', en: '100% SAW Weld Radiography' },
    stat3: { fa: 'ISO 9001:2015 و استاندارد ملی', en: 'ISO 9001:2015 & National Standard' },
    stat4: { fa: 'مطابق اسناد بازرسی صادراتی SGS', en: 'SGS Export Inspection Ready' },
  };

  return (
    <section
      id={id}
      className={`relative py-20 lg:py-28 overflow-hidden ${
        variant === 'about'
          ? 'bg-gradient-to-b from-slate-950 via-[#061219] to-slate-950 border-t border-slate-800'
          : 'bg-[#050D12] border-t border-slate-800/80'
      }`}
    >
      {/* Background Ambience Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 -right-48 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:32px_32px] opacity-20" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-bold mb-4 shadow-sm">
            <Award className="w-4 h-4 text-emerald-400" />
            <span>{labels.badge[lang] || labels.badge.fa}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight tracking-tight mb-4">
            {labels.title[lang] || labels.title.fa}
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            {labels.description[lang] || labels.description.fa}
          </p>

          {/* Interactive Category Filter Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8 p-1.5 bg-slate-900/90 border border-slate-800 rounded-2xl max-w-2xl mx-auto backdrop-blur-md">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all duration-200 cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {labels.filterAll[lang] || labels.filterAll.fa}
            </button>
            <button
              onClick={() => setSelectedCategory('national')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all duration-200 cursor-pointer ${
                selectedCategory === 'national'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {labels.filterNational[lang] || labels.filterNational.fa}
            </button>
            <button
              onClick={() => setSelectedCategory('quality')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all duration-200 cursor-pointer ${
                selectedCategory === 'quality'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {labels.filterQuality[lang] || labels.filterQuality.fa}
            </button>
            <button
              onClick={() => setSelectedCategory('international')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all duration-200 cursor-pointer ${
                selectedCategory === 'international'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {labels.filterInternational[lang] || labels.filterInternational.fa}
            </button>
          </div>
        </div>

        {/* Certificates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {filteredCerts.map((cert) => {
            const certTitle = getLocalized(cert.title);
            const certIssuer = getLocalized(cert.issuer);
            const certScope = getLocalized(cert.scope);
            const certValidity = getLocalized(cert.validity);

            return (
              <div
                key={cert.id}
                className="group relative flex flex-col rounded-2xl bg-gradient-to-b from-slate-900/90 to-[#08151e]/90 border border-slate-800 hover:border-emerald-500/40 transition-all duration-300 shadow-xl overflow-hidden hover:-translate-y-1"
              >
                {/* Header Strip with Standard Code */}
                <div className="p-4 pb-3 flex items-center justify-between border-b border-slate-800/70 bg-slate-900/40">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="font-mono text-xs font-bold text-emerald-300 tracking-wide">
                      {cert.standardCode}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {cert.documentNumber}
                  </span>
                </div>

                {/* Certificate Document Thumbnail Preview */}
                <div
                  onClick={() => setActiveModalCert(cert)}
                  className="relative aspect-[3/4] w-full bg-slate-950/80 cursor-pointer overflow-hidden p-3 flex items-center justify-center group/preview"
                >
                  {/* Subtle Framing Mat */}
                  <div className="relative w-full h-full rounded-lg overflow-hidden border border-slate-700/50 shadow-inner bg-slate-900 flex items-center justify-center">
                    <img
                      src={cert.image}
                      alt={certTitle}
                      loading="lazy"
                      className="w-full h-full object-cover object-top transition-transform duration-500 group-hover/preview:scale-105"
                    />
                    
                    {/* Dark gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent opacity-0 group-hover/preview:opacity-100 transition-opacity duration-300 flex items-end justify-center p-4">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 text-xs font-bold shadow-lg transform translate-y-2 group-hover/preview:translate-y-0 transition-transform duration-300">
                        <Eye className="w-3.5 h-3.5" />
                        <span>{labels.viewHighRes[lang] || labels.viewHighRes.fa}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-2 leading-snug">
                      {certTitle}
                    </h3>

                    {/* Issuer Information */}
                    <div className="mt-2 text-xs text-slate-400 flex items-start gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-500 mt-0.5 shrink-0" />
                      <span className="line-clamp-2 leading-relaxed">{certIssuer}</span>
                    </div>

                    {/* Scope description */}
                    <p className="mt-3 text-[11px] text-slate-400/90 leading-relaxed line-clamp-3">
                      {certScope}
                    </p>
                  </div>

                  {/* Footer Action & Verified Stamp */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span className="truncate max-w-[140px]">{certValidity}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveModalCert(cert)}
                      className="inline-flex items-center gap-1 text-xs text-slate-300 hover:text-emerald-400 font-semibold transition-colors cursor-pointer"
                    >
                      <span>{labels.viewHighRes[lang] || labels.viewHighRes.fa}</span>
                      <ExternalLink className="w-3 h-3 rtl:rotate-180" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Verified Technical Standards Banner */}
        <div className="mt-12 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900/90 via-[#0a1824]/90 to-slate-900/90 border border-emerald-500/20 shadow-xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x md:rtl:divide-x-reverse divide-slate-800">
            <div className="pt-4 md:pt-0">
              <span className="font-mono text-2xl lg:text-3xl font-black text-emerald-400 block mb-1">
                30 Bar
              </span>
              <span className="text-xs text-slate-300 font-medium">
                {labels.stat1[lang] || labels.stat1.fa}
              </span>
            </div>
            <div className="pt-4 md:pt-0">
              <span className="font-mono text-2xl lg:text-3xl font-black text-emerald-400 block mb-1">
                100% NDT
              </span>
              <span className="text-xs text-slate-300 font-medium">
                {labels.stat2[lang] || labels.stat2.fa}
              </span>
            </div>
            <div className="pt-4 md:pt-0">
              <span className="font-mono text-2xl lg:text-3xl font-black text-emerald-400 block mb-1">
                ISO 9001
              </span>
              <span className="text-xs text-slate-300 font-medium">
                {labels.stat3[lang] || labels.stat3.fa}
              </span>
            </div>
            <div className="pt-4 md:pt-0">
              <span className="font-mono text-2xl lg:text-3xl font-black text-emerald-400 block mb-1">
                SGS / TÜV
              </span>
              <span className="text-xs text-slate-300 font-medium">
                {labels.stat4[lang] || labels.stat4.fa}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* High-Resolution Document Modal Viewer */}
      {activeModalCert && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
          onClick={() => setActiveModalCert(null)}
        >
          <div
            className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col lg:flex-row max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button Top-Corner */}
            <button
              onClick={() => setActiveModalCert(null)}
              className="absolute top-4 end-4 z-20 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer shadow-lg"
              aria-label={labels.closeModal[lang] || labels.closeModal.fa}
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left/Top: High-Res Image Display */}
            <div className="lg:w-7/12 bg-slate-950 p-4 sm:p-6 flex items-center justify-center overflow-auto border-b lg:border-b-0 lg:border-e border-slate-800">
              <div className="relative max-h-[65vh] lg:max-h-[78vh] w-auto rounded-lg overflow-hidden border border-slate-700/60 shadow-2xl">
                <img
                  src={activeModalCert.image}
                  alt={getLocalized(activeModalCert.title)}
                  className="w-auto h-auto max-h-[65vh] lg:max-h-[78vh] object-contain mx-auto"
                />
              </div>
            </div>

            {/* Right/Bottom: Certificate Details & Verification Sheet */}
            <div className="lg:w-5/12 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <BadgeCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/25">
                    {activeModalCert.standardCode}
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-black text-white leading-snug">
                  {getLocalized(activeModalCert.title)}
                </h3>

                <div className="space-y-3 pt-2 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-1 font-semibold">
                      {labels.issuer[lang] || labels.issuer.fa}
                    </span>
                    <p className="text-slate-200 font-medium leading-relaxed">
                      {getLocalized(activeModalCert.issuer)}
                    </p>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-1 font-semibold">
                      {labels.docNumber[lang] || labels.docNumber.fa}
                    </span>
                    <p className="font-mono text-emerald-300 font-bold">
                      {activeModalCert.documentNumber}
                    </p>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-1 font-semibold">
                      {labels.scopeLabel[lang] || labels.scopeLabel.fa}
                    </span>
                    <p className="text-slate-300 leading-relaxed text-xs">
                      {getLocalized(activeModalCert.scope)}
                    </p>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-1 font-semibold">
                      {labels.validityLabel[lang] || labels.validityLabel.fa}
                    </span>
                    <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{getLocalized(activeModalCert.validity)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row gap-3">
                <a
                  href={activeModalCert.image}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>{labels.downloadAction[lang] || labels.downloadAction.fa}</span>
                </a>
                <button
                  type="button"
                  onClick={() => setActiveModalCert(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
                >
                  {labels.closeModal[lang] || labels.closeModal.fa}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
