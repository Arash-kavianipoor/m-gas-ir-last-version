import { LanguageCode } from '../types';
import { getBaseUrlForLanguage, getDomainForLanguage } from '../utils/subdomains';

export interface SeoLanguageConfig {
  code: LanguageCode;
  locale: string;
  hreflang: string;
  name: string;
  subdomain: string | null;
  domain: string;
  subdomainUrl: string;
  title: string;
  description: string;
  keywords: string;
  ogTitle: string;
  ogDescription: string;
}

export interface TargetSeoPhrases {
  cylinderManufacturer: string;
  domesticIndustrial: string;
  autoLpgTanks: string;
  fullDescription: string;
}

export const TARGET_SEO_PHRASES: Record<LanguageCode, TargetSeoPhrases> = {
  fa: {
    cylinderManufacturer: 'کمپانی تولید سیلندر گاز مایع در ایران',
    domesticIndustrial: 'تولیدکننده انواع سیلندرهای گاز خانگی، کارگاهی و صنعتی',
    autoLpgTanks: 'تولیدکننده مخازن گاز مایع انواع خودرو (Auto LPG)',
    fullDescription: 'کارخانه ام گاز؛ بزرگترین کمپانی تولید سیلندر گاز مایع در ایران، تولیدکننده کپسول‌های گاز خانگی، صنعتی و مخازن اتوگاز خودرو با آزمون فشار ۳۰ بار هیدرواستاتیک و استاندارد ISO 9001.',
  },
  en: {
    cylinderManufacturer: 'Major Manufacturer of LPG Cylinders & Gas Bottles in Iran',
    domesticIndustrial: 'Manufacturer of All Types of Domestic and Industrial Gas Cylinders',
    autoLpgTanks: 'Manufacturer of Automotive LPG Tanks and Gas Cylinders for All Vehicle Types',
    fullDescription: 'Official M Gas catalog and technical specifications for LPG cylinders, industrial pressure vessels, and automotive autogas tanks. Contact us for bulk orders and export inquiries.',
  },
  ar: {
    cylinderManufacturer: 'أكبر مصنّع لأسطوانات وخزانات الغاز المسال (LPG) في إيران',
    domesticIndustrial: 'مصنّع لجميع أنواع أسطوانات الغاز المنزلية والصناعية',
    autoLpgTanks: 'مصنّع خزانات الغاز المسال (LPG) لمختلف أنواع السيارات',
    fullDescription: 'مصنع م غاز: أكبر مصنّع لأسطوانات وخزانات الغاز المسال (LPG) في إيران، مصنّع لجميع أنواع أسطوانات الغاز المنزلية والصناعية، ومصنّع خزانات الغاز المسال لمختلف أنواع السيارات وفق أعلى معايير الجودة العالمية ISO 9001 و EN 1442.',
  },
  de: {
    cylinderManufacturer: 'Führender Hersteller von Flüssiggasflaschen (LPG) & Gaszylindern im Iran',
    domesticIndustrial: 'Hersteller aller Arten von Haushalts- und industriellen Gasflaschen',
    autoLpgTanks: 'Hersteller von Auto-LPG-Tanks und Autogasbehältern für alle Fahrzeugtypen',
    fullDescription: 'M Gas: Führender Hersteller von Flüssiggasflaschen (LPG) und Gaszylindern im Iran, Hersteller aller Arten von Haushalts- und industriellen Gasflaschen (0,5L–60L und 50kg) sowie Hersteller von Auto-LPG-Tanks für alle Fahrzeugtypen nach ISO 9001.',
  },
  ur: {
    cylinderManufacturer: 'ایران میں ایل پی جی گیس سلنڈرز اور کپسولز کا بڑا مینوفیکچرر',
    domesticIndustrial: 'تمام اقسام کے گھریلو اور صنعتی گیس سلنڈرز کا مینوفیکچرر',
    autoLpgTanks: 'ہر قسم کی گاڑیوں کے لیے آٹو ایل پی جی مائع گیس ٹینکوں کا مینوفیکچرر',
    fullDescription: 'ایم گیس فیکٹری: ایران میں ایل پی جی گیس سلنڈرز اور کپسولز کا سب سے بڑا مینوفیکچرر، تمام اقسام کے گھریلو اور صنعتی گیس سلنڈرز کا مینوفیکچرر اور ہر قسم کی گاڑیوں کے لیے آٹو ایل پی جی مائع گیس ٹینکوں کا مینوفیکچرر باقاعدہ کوالٹی اور برآمد کے ساتھ۔',
  },
  hy: {
    cylinderManufacturer: 'Իրանում հեղուկ գազի (LPG) գազաբալոնների խոշորագույն արտադրող',
    domesticIndustrial: 'Կենցաղային և արդյունաբերական բոլոր տեսակի գազաբալոնների արտադրող',
    autoLpgTanks: 'Տարբեր տեսակի ավտոմեքենաների համար ավտոգազի (Auto LPG) բաքերի արտադրող',
    fullDescription: 'M Gas գործարան. Իրանում հեղուկ գազի (LPG) գազաբալոնների խոշորագույն արտադրող, կենցաղային և արդյունաբերական բոլոր տեսակի գազաբալոնների արտադրող (0.5լ-ից 60լ և 50կգ) և տարբեր տեսակի ավտոմեքենաների համար ավտոգազի բաքերի արտադրող ISO 9001 ստանդարտով:',
  },
  tr: {
    cylinderManufacturer: "İran'ın Büyük LPG Tüpü ve Sıvılaştırılmış Gaz Silindiri Üreticisi",
    domesticIndustrial: 'Evsel ve Endüstriyel Her Çeşit Gaz Silindiri ve Tüpü Üreticisi',
    autoLpgTanks: 'Her Türlü Araç İçin Otogaz (Auto LPG) Tankları ve Tüpleri Üreticisi',
    fullDescription: "M Gas Tüp Fabrikası: İran'ın büyük LPG tüpü ve sıvılaştırılmış gaz silindiri üreticisi, evsel ve endüstriyel her çeşit gaz silindiri ve tüpü üreticisi, her türlü araç için otogaz (Auto LPG) tankları ve tüpleri üreticisi. ISO 9001 ve EN 1442 standartlarında üretim ve ihracat.",
  },
  ru: {
    cylinderManufacturer: 'Крупнейший производитель баллонов для сжиженного газа (LPG) в Иране',
    domesticIndustrial: 'Производитель всех видов бытовых и промышленных газовых баллонов',
    autoLpgTanks: 'Производитель автомобильных газовых баллонов и емкостей СНГ (Auto LPG) для всех типов авто',
    fullDescription: 'Завод М Газ: Крупнейший производитель баллонов для сжиженного газа (LPG) в Иране, производитель всех видов бытовых и промышленных газовых баллонов (от 0.5 до 60 л и 50 кг) и производитель автомобильных газовых емкостей (Auto LPG) для всех типов авто по стандартам ISO 9001 и ГОСТ.',
  },
};

export const SEO_CONFIG = {
  siteName: 'ام گاز | M Gas',
  siteUrl: 'https://mgas.ir',
  defaultLanguage: 'fa' as LanguageCode,
  defaultLocale: 'fa_IR',
  defaultImage: 'https://mgas.ir/logo/new-logo-mgas-2.png',
  defaultOgImageWidth: 1200,
  defaultOgImageHeight: 630,
  twitterCard: 'summary_large_image' as const,
  twitterHandle: '@mgas_cylinders',
  
  organization: {
    '@type': 'Organization' as const,
    name: 'M Gas Cylinder Manufacturing Co.',
    legalName: 'شرکت تولیدی و صنعتی کپسول و سیلندر گاز مایع م گاز',
    alternateName: [
      'ام گاز',
      'M Gas',
      'M-Gas',
      'کارخانه کپسول گاز ام گاز',
      'کارخانه تولید سیلندر گاز مایع ام گاز',
    ],
    slogan: 'کمپانی تولید سیلندر گاز مایع در ایران | تولیدکننده انواع کپسول و مخازن استاندارد LPG',
    foundingDate: '1970-03-21',
    founder: {
      '@type': 'Person',
      name: 'Mousa Amooie',
      alternateName: 'موسی عمویی',
      jobTitle: 'Managing Director & Founder',
      image: 'https://mgas.ir/founder/mousa-amooie.webp',
    },
    url: 'https://mgas.ir',
    logo: 'https://mgas.ir/logo/new-logo-mgas-2.png',
    image: 'https://mgas.ir/founder/mousa-amooie-inspection.webp',
    telephone: '+98-26-36606842',
    email: 'Seller@mgas.ir',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'استان البرز، کرج، جاده ملارد، پشت انبار نفت، خیابان ترانس برق، پلاک ۳۶',
      addressLocality: 'کرج',
      addressRegion: 'استان البرز',
      postalCode: '31698-54321',
      addressCountry: 'IR',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 35.7833,
      longitude: 50.9833,
    },
    sameAs: [
      'https://www.linkedin.com/company/mgas-cylinders',
      'https://www.instagram.com/mgas.ir',
    ],
    knowsAbout: [
      'کمپانی تولید سیلندر گاز مایع در ایران',
      'بزرگترین کمپانی تولید سیلندر گاز مایع در ایران و خاورمیانه',
      'کارخانه کپسول گاز ام گاز به مدیریت موسی عمویی',
      'تولیدکننده کپسول و سیلندر گاز مایع LPG',
      'تولیدکننده انواع سیلندرهای گاز خانگی و صنعتی',
      'تولیدکننده مخازن گاز مایع انواع خودرو',
      'ISIRI 841 / ISIRI 304 Standard Certified',
      'ISO 9001:2015 Quality Management',
      'EN 1442 European Standard Gas Cylinders',
      'DOT 4BA / DOT 4BW Compliance',
      '30-Bar Hydrostatic Proof Pressure Testing',
      'Electrostatic Powder Coating',
    ],
  },

  languages: {
    fa: {
      code: 'fa',
      locale: 'fa_IR',
      hreflang: 'fa',
      name: 'فارسی',
      subdomain: null,
      domain: 'mgas.ir',
      subdomainUrl: 'https://mgas.ir',
      title: 'کمپانی تولید سیلندر گاز مایع در ایران | کارخانه ام گاز (موسی عمویی)',
      description: 'بزرگترین کمپانی تولید سیلندر گاز مایع در ایران؛ تولیدکننده انواع کپسول گاز خانگی، کارگاهی، صنعتی و مخازن اتوگاز خودرو با آزمون فشار ۳۰ بار هیدرواستاتیک و استاندارد ISO 9001.',
      keywords: 'کمپانی تولید سیلندر گاز مایع در ایران, کارخانه تولید کپسول گاز, تولید کننده سیلندر گاز مایع, مخزن گاز مایع خودرو, کپسول ۱۱ کیلویی',
      ogTitle: 'کمپانی تولید سیلندر گاز مایع در ایران | کارخانه ام گاز (موسی عمویی)',
      ogDescription: 'بزرگترین کمپانی تولید سیلندر گاز مایع در ایران؛ تولیدکننده انواع کپسول گاز خانگی، کارگاهی، صنعتی و مخازن اتوگاز خودرو با آزمون فشار ۳۰ بار هیدرواستاتیک و استاندارد ISO 9001.',
    },
    en: {
      code: 'en',
      locale: 'en_US',
      hreflang: 'en',
      name: 'English',
      subdomain: 'en',
      domain: 'en.mgas.ir',
      subdomainUrl: 'https://en.mgas.ir',
      title: 'M Gas | LPG Cylinder Manufacturer in Iran | Domestic, Industrial & Auto Tanks',
      description: 'Official M Gas catalog and technical specifications for LPG cylinders, industrial pressure vessels, and automotive autogas tanks. Contact us for bulk orders and export inquiries.',
      keywords: '',
      ogTitle: 'M Gas - Major LPG Cylinder & Automotive Gas Tank Manufacturer in Iran',
      ogDescription: 'Official M Gas catalog and technical specifications for LPG cylinders, industrial pressure vessels, and automotive autogas tanks. 30-bar hydrostatic proof testing and global exports.',
    },
    ar: {
      code: 'ar',
      locale: 'ar_SA',
      hreflang: 'ar',
      name: 'العربية',
      subdomain: 'ar',
      domain: 'ar.mgas.ir',
      subdomainUrl: 'https://ar.mgas.ir',
      title: 'م غاز | أكبر مصنّع لأسطوانات وخزانات الغاز المسال (LPG) في إيران',
      description: 'م غاز (بإدارة موسى عموئي): أكبر مصنّع لأسطوانات وخزانات الغاز المسال (LPG) في إيران، مصنّع لجميع أنواع أسطوانات الغاز المنزلية والصناعية ومصنّع خزانات الغاز المسال للسيارات وفق ISO 9001.',
      keywords: '',
      ogTitle: 'م غاز | أكبر مصنّع لأسطوانات الغاز وخزانات السيارات في إيران',
      ogDescription: 'أكبر مصنّع لأسطوانات الغاز المسال في إيران، مصنّع أسطوانات الغاز المنزلية والصناعية وخزانات غاز السيارات مع فحص هيدروستاتيكي 30 بار وشهادة ISO 9001.',
    },
    de: {
      code: 'de',
      locale: 'de_DE',
      hreflang: 'de',
      name: 'Deutsch',
      subdomain: 'de',
      domain: 'de.mgas.ir',
      subdomainUrl: 'https://de.mgas.ir',
      title: 'M Gas | Führender Hersteller von Flüssiggasflaschen (LPG) im Iran',
      description: 'M Gas: Führender Hersteller von Flüssiggasflaschen (LPG) & Gaszylindern im Iran, Hersteller aller Arten von Haushalts- und industriellen Gasflaschen sowie Hersteller von Auto-LPG-Tanks nach ISO 9001.',
      keywords: '',
      ogTitle: 'M Gas - Führender Hersteller von Flüssiggasflaschen & Autogastanks im Iran',
      ogDescription: 'Führender Hersteller von LPG-Flaschen im Iran, Haushalts- & Industrie-Gaszylindern sowie Auto-LPG-Tanks mit 30-Bar-Prüfung und globalem Export.',
    },
    ur: {
      code: 'ur',
      locale: 'ur_PK',
      hreflang: 'ur',
      name: 'اردو',
      subdomain: 'ur',
      domain: 'ur.mgas.ir',
      subdomainUrl: 'https://ur.mgas.ir',
      title: 'ایم گیس | ایران میں ایل پی جی گیس سلنڈرز اور کپسولز کا بڑا مینوفیکچرر',
      description: 'ایم گیس: ایران میں ایل پی جی گیس سلنڈرز اور کپسولز کا سب سے بڑا مینوفیکچرر، تمام اقسام کے گھریلو اور صنعتی گیس سلنڈرز اور گاڑیوں کے لیے آٹو ایل پی جی مائع گیس ٹینکوں کا مینوفیکچرر۔',
      keywords: '',
      ogTitle: 'ایم گیس - ایران میں ایل پی جی گیس سلنڈرز اور آٹو ٹینکوں کا سب سے بڑا مینوفیکچرر',
      ogDescription: 'ایران میں ایل پی جی گیس سلنڈرز کا بڑا مینوفیکچرر، گھریلو اور صنعتی سلنڈرز اور گاڑیوں کے آٹو گیس ٹینکوں کی معیاری مینوفیکچرنگ اور بین الاقوامی برآمد۔',
    },
    hy: {
      code: 'hy',
      locale: 'hy_AM',
      hreflang: 'hy',
      name: 'Հայերեն',
      subdomain: 'hy',
      domain: 'hy.mgas.ir',
      subdomainUrl: 'https://hy.mgas.ir',
      title: 'M Gas | Իրանում հեղուկ գազի (LPG) գազաբալոնների խոշորագույն արտադրող',
      description: 'M Gas գործարան: Իրանում հեղուկ գազի (LPG) գազաբալոնների խոշորագույն արտադրող, կենցաղային և արդյունաբերական բոլոր տեսակի գազաբալոնների արտադրող ISO 9001 ստանդարտով:',
      keywords: '',
      ogTitle: 'M Gas - Իրանում LPG գազաբալոնների և ավտոբաքերի առաջատար արտադրող',
      ogDescription: 'Իրանում հեղուկ գազի բալոնների խոշոր արտադրող, կենցաղային և արդյունաբերական գազաբալոններ և ավտոգազի բաքեր 30 բար հիդրոստատիկ փորձարկմամբ:',
    },
    tr: {
      code: 'tr',
      locale: 'tr_TR',
      hreflang: 'tr',
      name: 'Türkçe',
      subdomain: 'tr',
      domain: 'tr.mgas.ir',
      subdomainUrl: 'https://tr.mgas.ir',
      title: "M Gas | İran'ın Büyük LPG Tüpü ve Sıvılaştırılmış Gaz Silindiri Üreticisi",
      description: "M Gas Tüp Fabrikası: İran'ın büyük LPG tüpü ve sıvılaştırılmış gaz silindiri üreticisi, evsel ve endüstriyel her çeşit gaz silindiri ve tüpü üreticisi, araç otogaz tankları üreticisi. ISO 9001 ve EN 1442 standartları.",
      keywords: '',
      ogTitle: "M Gas - İran'ın Büyük LPG Tüpü ve Otogaz Tankları Üreticisi",
      ogDescription: "İran'ın büyük LPG tüpü üreticisi, evsel ve endüstriyel silindirler ile araç otogaz tankları imalatında 50+ yıllık tecrübe ve ihracat ağı.",
    },
    ru: {
      code: 'ru',
      locale: 'ru_RU',
      hreflang: 'ru',
      name: 'Русский',
      subdomain: 'ru',
      domain: 'ru.mgas.ir',
      subdomainUrl: 'https://ru.mgas.ir',
      title: 'М Газ | Крупнейший производитель баллонов LPG и емкостей СУГ в Иране',
      description: 'Завод М Газ: Крупнейший производитель баллонов для сжиженного газа (LPG) в Иране, производитель всех видов бытовых и промышленных газовых баллонов и автомобильных емкостей (Auto LPG).',
      keywords: '',
      ogTitle: 'М Газ - Крупнейший производитель баллонов LPG и автогазовых емкостей в Иране',
      ogDescription: 'Крупнейший завод газовых баллонов в Иране: производство бытовых, промышленных баллонов и автомобильных емкостей СУГ с гидроиспытаниями 30 бар.',
    },
  } as Record<LanguageCode, SeoLanguageConfig>,
};
