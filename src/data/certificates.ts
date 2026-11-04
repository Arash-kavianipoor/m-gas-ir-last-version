import { LanguageCode } from '../types';

export interface FactoryCertificate {
  id: string;
  image: string;
  title: Record<LanguageCode, string>;
  issuer: Record<LanguageCode, string>;
  standardCode: string;
  scope: Record<LanguageCode, string>;
  validity: Record<LanguageCode, string>;
  category: 'national' | 'international' | 'quality';
  documentNumber: string;
}

export const FACTORY_CERTIFICATES: FactoryCertificate[] = [
  {
    id: 'cert-isiri-1',
    image: '/certificates/2c-scaled.webp',
    documentNumber: 'ISIRI-6372/LPG',
    title: {
      fa: 'پروانه کاربرد علامت استاندارد ملی ایران (سیلندر گاز مایع)',
      en: 'National Standard of Iran Certification (LPG Cylinders)',
      ar: 'شهادة علامة الجودة والمواصفات الوطنية الإيرانية',
      ru: 'Сертификат Национального стандарта Ирана на баллоны сжиженного газа',
      tr: 'İran Ulusal Standart Sertifikası (LPG Tüpleri)',
      de: 'Nationales Standardzertifikat des Iran für Flüssiggasflaschen',
      ur: 'ایران کا قومی معیار کا سرٹیفکیٹ (ایل پی جی سلنڈر)',
      hy: 'Իրանի Ազգային Ստանդարտի Սերտիֆիկատ (Հեղուկ Գազի Բալոններ)',
    },
    issuer: {
      fa: 'سازمان ملی استاندارد ایران (ISIRI)',
      en: 'Institute of Standards and Industrial Research of Iran',
      ar: 'المؤسسة الوطنية للمواصفات القياسية الإيرانية (ISIRI)',
      ru: 'Институт стандартов и промышленных исследований Ирана (ISIRI)',
      tr: 'İran Standartlar ve Endüstriyel Araştırma Enstitüsü (ISIRI)',
      de: 'Institut für Normen und Industrieforschung des Iran (ISIRI)',
      ur: 'ایران انسٹیٹیوٹ آف اسٹینڈرڈز اینڈ انڈسٹریل ریسرچ (ISIRI)',
      hy: 'Իրանի Ստանդարտների և Արդյունաբերական Հետազոտությունների Ինստիտուտ (ISIRI)',
    },
    standardCode: 'ISIRI 841 / ISIRI 406',
    scope: {
      fa: 'تولید انواع سیلندرهای فولادی درزدار گاز مایع، آزمون‌های فشار هیدرواستاتیک ۳۰ بار و تست‌های کشش عمیق',
      en: 'Manufacture of welded steel transportable LPG cylinders, 30-bar hydrostatic proof pressure and tensile verification',
      ar: 'تصنيع أسطوانات الغاز المسال الفولاذية الملحومة، اختبارات الضغط الهيدروستاتيكي ۳۰ بار والشد العالي',
      ru: 'Производство сварных стальных баллонов СУГ, гидростатические испытания под давлением 30 бар',
      tr: 'Kaynaklı çelik LPG tüpleri imalatı, 30 bar hidrostatik basınç ve çekme dayanımı testleri',
      de: 'Herstellung von geschweißten Flüssiggas-Stahlflaschen, 30-Bar-Hydrostatikprüfung und Zugfestigkeit',
      ur: 'ویلڈڈ اسٹیل ایل پی جی سلنڈرز کی تیاری، ۳۰ بار ہائیڈروسٹیٹک دباؤ کے ٹیسٹ اور کوالٹی چیک',
      hy: 'Եռակցված պողպատե հեղուկ գազի բալոնների արտադրություն, 30 բար հիդրոստատիկ ճնշման փորձարկում',
    },
    validity: {
      fa: 'دارای تمدید رسمی و نظارت ادواری مستمر بازرسان استاندارد',
      en: 'Officially renewed with continuous surveillance inspection',
      ar: 'مجددة رسمياً مع رقابة دورية مستمرة من مفتشي الجودة',
      ru: 'Официально продлен с регулярным инспекционным контролем',
      tr: 'Sürekli denetim kontrolleri ile resmi olarak yenilenmiştir',
      de: 'Offiziell verlängert mit kontinuierlicher Überwachungsprüfung',
      ur: 'باقاعدہ معائنہ اور تصدیق کے ساتھ تجدید شدہ',
      hy: 'Պաշտոնապես երկարաձգված՝ շարունակական տեսչական վերահսկողությամբ',
    },
    category: 'national',
  },
  {
    id: 'cert-iso-9001',
    image: '/certificates/4c-scaled.webp',
    documentNumber: 'ISO-9001:2015/QMS-8201',
    title: {
      fa: 'گواهینامه بین‌المللی سیستم مدیریت کیفیت ISO 9001:2015',
      en: 'ISO 9001:2015 Quality Management System Certificate',
      ar: 'شهادة نظام إدارة الجودة الدولية ISO 9001:2015',
      ru: 'Международный сертификат системы менеджмента качества ISO 9001:2015',
      tr: 'ISO 9001:2015 Kalite Yönetim Sistemi Sertifikası',
      de: 'ISO 9001:2015 Qualitätsmanagementsystem-Zertifikat',
      ur: 'بین الاقوامی کوالٹی مینجمنٹ سسٹم سرٹیفکیٹ ISO 9001:2015',
      hy: 'Որակի Կառավարման Համակարգի Միջազգային Սերտիֆիկատ ISO 9001:2015',
    },
    issuer: {
      fa: 'مرجع بین‌المللی ارزیابی و اعتباربخشی سیستم‌های کیفیت',
      en: 'International Quality Accreditation & Assessment Registrar',
      ar: 'هيئة التقييم والاعتماد الدولية لأنظمة الجودة',
      ru: 'Международный орган по аккредитации и сертификации качества',
      tr: 'Uluslararası Kalite Akreditasyon ve Belgelendirme Kuruluşu',
      de: 'Internationale Akkreditierungs- und Zertifizierungsstelle',
      ur: 'کوالٹی سسٹم کی بین الاقوامی ایکریڈیٹیشن باڈی',
      hy: 'Որակի Համակարգերի Միջազգային Հավատարմագրման Մարմին',
    },
    standardCode: 'ISO 9001:2015 / EN 1442',
    scope: {
      fa: 'طراحی، قالب‌سازی، فرم‌دهی هیدرولیک، جوشکاری مکانیزه زیرپودری SAW و بازرسی فنی سیلندرهای گاز مایع',
      en: 'Design, tooling, deep hydraulic draw forming, automated SAW welding, and technical inspection of LPG cylinders',
      ar: 'التصميم، صناعة القوالب، السحب الهيدروليكي العميق، اللحام الآلي تحت البودرة SAW والفحص الفني',
      ru: 'Проектирование, глубокая вытяжка, автоматическая сварка под флюсом (SAW) и контроль качества баллонов СУГ',
      tr: 'Tasarım, kalıplama, hidrolik derin çekme, otomatik tozaltı kaynağı SAW ve teknik muayene',
      de: 'Konstruktion, Werkzeugbau, Tiefziehen, automatisches UP-Schweißen (SAW) und Qualitätsprüfung',
      ur: 'ڈیزائن، مولڈنگ، ہائیڈرولک ڈرائنگ، خودکار SAW ویلڈنگ اور سلنڈرز کا جامع معائنہ',
      hy: 'Նախագծում, կաղապարում, հիդրավլիկ ձգում, ավտոմատ եռակցում (SAW) և որակի վերահսկում',
    },
    validity: {
      fa: 'معتبر برای تمامی خطوط تولید داخلی و مقاصد صادراتی',
      en: 'Certified for domestic production and international export hubs',
      ar: 'معتمدة لجميع خطوط الإنتاج المحلي ولشحنات التصدير الدولية',
      ru: 'Действителен для внутреннего производства и экспортных поставок',
      tr: 'Yurtiçi üretim ve uluslararası ihracat sevkiyatları için geçerlidir',
      de: 'Gültig für inländische Fertigung und internationale Exportmärkte',
      ur: 'ملکی پیداوار اور بین الاقوامی برآمدی ترسیلات کے لیے مصدقہ',
      hy: 'Վավեր է տեղական արտադրության և միջազգային արտահանման համար',
    },
    category: 'quality',
  },
  {
    id: 'cert-safety-inspection',
    image: '/certificates/5c-scaled.webp',
    documentNumber: 'QC-30BAR-NDT/2026',
    title: {
      fa: 'تاییدیه صلاحیت بازرسی فنی و ایمنی خطوط تولید و آزمون ۳۰ بار',
      en: 'Technical Safety & 30-Bar Pressure Testing Compliance Approval',
      ar: 'اعتماد السلامة الفنية واختبارات ضغط ۳۰ بار والتفتيش غير المدمر',
      ru: 'Сертификат технической безопасности и испытаний давлением 30 бар',
      tr: 'Teknik Güvenlik ve 30 Bar Basınç Testi Uygunluk Onayı',
      de: 'Zulassung für technische Sicherheit und 30-Bar-Druckprüfungen',
      ur: 'تکنیکی حفاظت اور ۳۰ بار پریشر ٹیسٹنگ منظوری سرٹیفکیٹ',
      hy: 'Տեխնիկական Անվտանգության և 30 Բար Ճնշման Փորձարկման Հաստատում',
    },
    issuer: {
      fa: 'مراجع ذیصلاح بازرسی مهندسی و متالورژی صنعتی',
      en: 'Industrial Engineering Safety & Metallurgical Inspection Bureau',
      ar: 'مكتب التفتيش الهندسي الصناعي والسلامة الميتالورجية',
      ru: 'Бюро промышленной безопасности и металлургической экспертизы',
      tr: 'Endüstriyel Mühendislik Güvenliği ve Metalurji Teftiş Bürosu',
      de: 'Büro für industrielle Anlagensicherheit und metallurgische Prüfung',
      ur: 'صنعتی انجینئرنگ سیفٹی اور میٹالرجیکل انسپکشن بیورو',
      hy: 'Արդյունաբերական Ճարտարագիտական Անվտանգության և Մետաղագործական Տեսչություն',
    },
    standardCode: 'DOT-4BA / TPED Directives',
    scope: {
      fa: 'انجام آزمون‌های غیرمخرب (NDT)، رادیوگرافی اشعه ایکس درز جوش، کنترل تست خستگی و ترکیدگی هیدرواستاتیک',
      en: 'Non-Destructive Testing (NDT), X-Ray weld seam radiography, volumetric expansion, and hydraulic burst testing',
      ar: 'الاختبارات غير الإتلافية (NDT)، تصوير درزات اللحام بالأشعة السينية، وفحص التمدد الحجمي والانفجار',
      ru: 'Неразрушающий контроль (NDT), рентгенография сварных швов, испытания на разрыв и расширение',
      tr: 'Tahribatsız muayene (NDT), X-ışını kaynak radyografisi, hacimsel genleşme ve patlama testleri',
      de: 'Zerstörungsfreie Prüfung (ZfP), Schweißnaht-Röntgen, volumetrische Dehnungs- und Berstprüfungen',
      ur: 'نان ڈسٹرکٹو ٹیسٹنگ (NDT)، ایکسرے ویلڈ ریڈیوگرافی اور ہائیڈرولک برسٹ ٹیسٹنگ',
      hy: 'Ոչ ավերիչ փորձարկումներ (NDT), եռակցման կարերի ռենտգենոգրաֆիա և հիդրոստատիկ պայթեցման թեստ',
    },
    validity: {
      fa: 'نظارت ادواری ۱۰۰٪ بر آزمون تک‌تک سیلندرهای تولیدی',
      en: 'Surveillance protocol applied to 100% of individual manufactured units',
      ar: 'بروتوكول رقابي يطبق بنسبة ۱۰۰٪ على كل أسطوانة منتجة على حدة',
      ru: 'Протокол надзора применяется к 100% каждого произведенного баллона',
      tr: 'Üretilen her bir tüpe %100 uygulanan gözetim protokolü',
      de: '100%ige Stückprüfung für jede einzelne hergestellte Gasflasche',
      ur: 'ہر ایک تیار شدہ سلنڈر پر ۱۰۰ فیصد انفرادی جانچ کا عمل',
      hy: '100% անհատական փորձարկում յուրաքանչյուր արտադրված բալոնի համար',
    },
    category: 'international',
  },
];
