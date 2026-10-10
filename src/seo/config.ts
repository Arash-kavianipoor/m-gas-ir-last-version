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
    cylinderManufacturer: 'تولید کننده بزرگ سیلندر/کپسول گاز مایع در ایران',
    domesticIndustrial: 'تولید کننده انواع سیلندرهای گاز خانگی و صنعتی',
    autoLpgTanks: 'تولید کننده مخازن گاز مایع انواع خودرو',
    fullDescription: 'کارخانه ام گاز: تولید کننده بزرگ سیلندر/کپسول گاز مایع در ایران، تولید کننده انواع سیلندرهای گاز خانگی و صنعتی (۰.۵ الی ۶۰ لیتر و ۵۰ کیلوگرم) و تولید کننده مخازن گاز مایع انواع خودرو با استاندارد ملی ایران و ISO 9001.',
  },
  en: {
    cylinderManufacturer: 'Major Manufacturer of LPG Cylinders & Gas Bottles in Iran',
    domesticIndustrial: 'Manufacturer of All Types of Domestic and Industrial Gas Cylinders',
    autoLpgTanks: 'Manufacturer of Automotive LPG Tanks and Gas Cylinders for All Vehicle Types',
    fullDescription: 'M Gas Cylinder Mfg Co: Major manufacturer of LPG cylinders and gas bottles in Iran, manufacturer of all types of domestic and industrial gas cylinders (0.5L to 60L & 50kg), and manufacturer of automotive LPG tanks for all vehicle types with ISO 9001 & EN 1442 certifications.',
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
  siteName: 'M Gas | کارخانه تولید کپسول گاز ام گاز',
  siteUrl: 'https://mgas.ir',
  defaultLanguage: 'en' as LanguageCode,
  defaultLocale: 'en_US',
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
      'تولید کننده بزرگ سیلندر گاز مایع در ایران',
      'تولید کننده کپسول گاز در ایران',
      'Mousa Amooie Gas Cylinder Mfg',
    ],
    slogan: 'تولید کننده بزرگ سیلندر/کپسول گاز مایع در ایران | خانگی، صنعتی و خودرویی',
    foundingDate: '1970-03-21',
    founder: {
      '@type': 'Person',
      name: 'Mousa Amooie',
      alternateName: 'موسی عمویی',
      jobTitle: 'Managing Director & Founder',
      image: 'https://mgas.ir/founder/mousa-amooie.png',
    },
    url: 'https://mgas.ir',
    logo: 'https://mgas.ir/logo/new-logo-mgas-2.png',
    image: 'https://mgas.ir/founder/mousa-amooie-inspection.png',
    telephone: '+98-21-88888888',
    email: 'export@mgas.ir',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Industrial Zone, Phase 2, M Gas Boulevard',
      addressLocality: 'Tehran',
      addressRegion: 'Tehran Province',
      postalCode: '14155-6345',
      addressCountry: 'IR',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 35.6892,
      longitude: 51.3890,
    },
    sameAs: [
      'https://www.linkedin.com/company/mgas-cylinders',
      'https://www.instagram.com/mgas.ir',
      'https://twitter.com/mgas_cylinders',
    ],
    knowsAbout: [
      'تولید کننده بزرگ سیلندر/کپسول گاز مایع در ایران',
      'تولید کننده انواع سیلندرهای گاز خانگی و صنعتی',
      'تولید کننده مخازن گاز مایع انواع خودرو',
      'Major LPG Cylinder & Gas Bottle Manufacturer in Iran',
      'Manufacturer of Domestic and Industrial Gas Cylinders',
      'Automotive LPG Tanks and Cylinders for Vehicles',
      'أكبر مصنع لأسطوانات وخزانات الغاز المسال في إيران',
      'ISIRI 841 / ISIRI 304 Standard Certified',
      'ISO 9001:2015 Quality Management',
      'EN 1442 European Standard Gas Cylinders',
      'DOT 4BA / DOT 4BW Compliance',
      '30-Bar Hydrostatic Proof Pressure Testing',
      'Electrostatic Powder Coating',
      'International Industrial Exporting',
    ],
  },

  languages: {
    en: {
      code: 'en',
      locale: 'en_US',
      hreflang: 'en',
      name: 'English',
      subdomain: null,
      domain: 'mgas.ir',
      subdomainUrl: 'https://mgas.ir',
      title: 'M Gas | Major LPG Cylinder Manufacturer in Iran | Domestic, Industrial & Auto Tanks',
      description: 'M Gas: Major LPG cylinder manufacturer in Iran, manufacturer of all types of domestic and industrial gas cylinders (0.5L-60L & 50kg), and manufacturer of automotive LPG tanks for all vehicle types. ISO 9001 & EN 1442 certified.',
      keywords: 'Major LPG cylinder manufacturer in Iran, manufacturer of domestic and industrial gas cylinders, automotive LPG tanks manufacturer, LPG cylinder factory Iran, industrial gas bottles, auto gas tanks, 50kg cylinder, 11kg gas bottle, picnic cylinder, Mousa Amooie, cylinder exporter, LPG pressure vessel, M Gas, m-gas, mgas',
      ogTitle: 'M Gas - Major LPG Cylinder & Automotive Gas Tank Manufacturer in Iran',
      ogDescription: 'Major manufacturer of LPG cylinders in Iran, domestic & industrial gas cylinders, and auto LPG tanks for all vehicle types. 30-bar hydrostatic testing and global export to 12+ countries.',
    },
    fa: {
      code: 'fa',
      locale: 'fa_IR',
      hreflang: 'fa',
      name: 'فارسی',
      subdomain: 'fa',
      domain: 'fa.mgas.ir',
      subdomainUrl: 'https://fa.mgas.ir',
      title: 'کارخانه ام گاز | تولید کننده بزرگ سیلندر/کپسول گاز مایع در ایران | خانگی، صنعتی و خودرو',
      description: 'کارخانه ام گاز (مدیریت موسی عمویی): تولید کننده بزرگ سیلندر/کپسول گاز مایع در ایران، تولید کننده انواع سیلندرهای گاز خانگی و صنعتی، و تولید کننده مخازن گاز مایع انواع خودرو با آزمون فشار ۳۰ بار هیدرواستاتیک و استانداردهای ISO 9001 و ملی ایران.',
      keywords: 'تولید کننده بزرگ سیلندر/کپسول گاز مایع در ایران, تولید کننده انواع سیلندرهای گاز خانگی و صنعتی, تولید کننده مخازن گاز مایع انواع خودرو, کارخانه ام گاز, شرکت ام گاز, تولید کننده کپسول گاز در ایران, سیلندر گاز مایع, کپسول ۵۰ کیلویی, کپسول ۱۱ کیلویی, کپسول گاز خودرو, مخزن گاز خودرو, سیلندر گاز صنعتی, موسی عمویی, صادرات کپسول گاز, LPG cylinder manufacturer Iran',
      ogTitle: 'کارخانه ام گاز | تولید کننده بزرگ سیلندر و مخازن گاز مایع در ایران',
      ogDescription: 'تولید کننده بزرگ سیلندر/کپسول گاز مایع در ایران، تولید کننده انواع سیلندرهای گاز خانگی و صنعتی و تولید کننده مخازن گاز مایع انواع خودرو با استانداردهای ملی و بین‌المللی.',
    },
    ar: {
      code: 'ar',
      locale: 'ar_SA',
      hreflang: 'ar',
      name: 'العربية',
      subdomain: 'ar',
      domain: 'ar.mgas.ir',
      subdomainUrl: 'https://ar.mgas.ir',
      title: 'م غاز | أكبر مصنّع لأسطوانات وخزانات الغاز المسال (LPG) في إيران | أسطوانات منزلية وصناعية',
      description: 'م غاز (بإدارة موسى عموئي): أكبر مصنّع لأسطوانات وخزانات الغاز المسال (LPG) في إيران، مصنّع لجميع أنواع أسطوانات الغاز المنزلية والصناعية ومصنّع خزانات الغاز المسال لمختلف أنواع السيارات وفق معايير ISO 9001 و EN 1442.',
      keywords: 'أكبر مصنع لأسطوانات وخزانات الغاز المسال في إيران, مصنع أسطوانات الغاز المنزلية والصناعية, مصنع خزانات الغاز المسال لمختلف أنواع السيارات, م غاز, موسى عموئي, تصدير أسطوانات الغاز, أسطوانة 50 كيلو, اسطوانات غاز ۱۱ كغ, LPG cylinder factory Iran',
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
      title: 'M Gas | Führender Hersteller von Flüssiggasflaschen (LPG) im Iran | Industrie & Autogas',
      description: 'M Gas: Führender Hersteller von Flüssiggasflaschen (LPG) & Gaszylindern im Iran, Hersteller aller Arten von Haushalts- und industriellen Gasflaschen sowie Hersteller von Auto-LPG-Tanks für alle Fahrzeugtypen nach ISO 9001 und EN 1442.',
      keywords: 'Führender Hersteller von Flüssiggasflaschen im Iran, Hersteller aller Arten von Haushalts und Industrie Gasflaschen, Hersteller von Auto LPG Tanks für alle Fahrzeugtypen, LPG Zylinder, Propangasflasche 11kg, Gasflasche 50kg, M Gas, Mousa Amooie',
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
      description: 'ایم گیس: ایران میں ایل پی جی گیس سلنڈرز اور کپسولز کا سب سے بڑا مینوفیکچرر، تمام اقسام کے گھریلو اور صنعتی گیس سلنڈرز کا مینوفیکچرر اور ہر قسم کی گاڑیوں کے لیے آٹو ایل پی جی مائع گیس ٹینکوں کا مینوفیکچرر برائے ISO 9001 اور EN 1442۔',
      keywords: 'ایران میں ایل پی جی گیس سلنڈرز کا مینوفیکچرر, تمام اقسام کے گھریلو اور صنعتی گیس سلنڈرز کا مینوفیکچرر, گاڑیوں کے لیے آٹو ایل پی جی مائع گیس ٹینکوں کا مینوفیکچرر, ایم گیس, گیس سلنڈر فیکٹری, کپسول گاز مایع, 50 کلو کمرشل سلنڈر, LPG Cylinders Iran',
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
      description: 'M Gas գործարան: Իրանում հեղուկ գազի (LPG) գազաբալոնների խոշորագույն արտադրող, կենցաղային և արդյունաբերական բոլոր տեսակի գազաբալոնների արտադրող և տարբեր տեսակի ավտոմեքենաների համար ավտոգազի (Auto LPG) բաքերի արտադրող:',
      keywords: 'Իրանում հեղուկ գազի բալոնների խոշորագույն արտադրող, կենցաղային և արդյունաբերական գազաբալոնների արտադրող, ավտոմեքենաների ավտոգազի բաքերի արտադրող, LPG բալոններ, M Gas, Մուսա Ամուի, 11կգ գազի բալոն, 50կգ բալոն',
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
      description: "M Gas Tüp Fabrikası: İran'ın büyük LPG tüpü ve sıvılaştırılmış gaz silindiri üreticisi, evsel ve endüstriyel her çeşit gaz silindiri ve tüpü üreticisi, her türlü araç için otogaz (Auto LPG) tankları ve tüpleri üreticisi. ISO 9001 ve EN 1442 standartları.",
      keywords: "İran'ın büyük LPG tüpü üreticisi, evsel ve endüstriyel her çeşit gaz silindiri üreticisi, her türlü araç için otogaz Auto LPG tankları üreticisi, LPG tüp imalatı, 50kg sanayi tüpü, 12 kg mutfak tüpü, M Gas, Mousa Amooie, gaz tüpü ihracatı",
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
      description: 'Завод М Газ: Крупнейший производитель баллонов для сжиженного газа (LPG) в Иране, производитель всех видов бытовых и промышленных газовых баллонов и производитель автомобильных газовых емкостей (Auto LPG) для всех типов авто.',
      keywords: 'Крупнейший производитель баллонов для сжиженного газа LPG в Иране, производитель бытовых и промышленных газовых баллонов, производитель автомобильных газовых баллонов для всех типов авто, завод баллонов LPG, баллон 50 литров, М Газ, Муса Амуи',
      ogTitle: 'М Газ - Крупнейший производитель баллонов LPG и автогазовых емкостей в Иране',
      ogDescription: 'Крупнейший завод газовых баллонов в Иране: производство бытовых, промышленных баллонов и автомобильных емкостей СУГ с гидроиспытаниями 30 бар.',
    },
  } as Record<LanguageCode, SeoLanguageConfig>,
};

