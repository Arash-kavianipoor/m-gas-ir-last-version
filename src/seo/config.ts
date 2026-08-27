import { LanguageCode } from '../types';

export interface SeoLanguageConfig {
  code: LanguageCode;
  locale: string;
  hreflang: string;
  name: string;
  title: string;
  description: string;
  keywords: string;
  ogTitle: string;
  ogDescription: string;
}

export const SEO_CONFIG = {
  siteName: 'M Gas | کارخانه تولید کپسول گاز ام گاز',
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
    alternateName: ['ام گاز', 'M Gas', 'M-Gas', 'Mousa Amooie Gas Cylinder Mfg'],
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
      'LPG Gas Cylinders Manufacturing',
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
    fa: {
      code: 'fa',
      locale: 'fa_IR',
      hreflang: 'fa',
      name: 'فارسی',
      title: 'M Gas | کارخانه تولید کپسول گاز مایع (LPG) و صنعتی ام گاز | mgas.ir',
      description: 'کارخانه م گاز (مدیریت آقای موسی عمویی) - تولیدکننده و صادرکننده انواع کپسول‌های گاز مایع (LPG) ۵۰، ۱۱، ۲ کیلویی، مسافرتی و خودرویی با استاندارد ملی ایران و ISO 9001.',
      keywords: 'کپسول گاز, تولید کپسول گاز, کپسول ۵۰ کیلویی, کپسول ۱۱ کیلویی, کپسول پیک نیک, ام گاز, موسی عمویی, سیلندر گاز مایع, LPG cylinder, صادرات کپسول گاز',
      ogTitle: 'کارخانه تولید کپسول و سیلندر گاز مایع ام گاز (M Gas)',
      ogDescription: 'بزرگترین خطوط تولید کپسول گاز خانگی، صنعتی و خودرویی با آزمون فشار ۳۰ بار، کوره پخت رنگ الکترواستاتیک و صادرات به ۱۲+ کشور.',
    },
    en: {
      code: 'en',
      locale: 'en_US',
      hreflang: 'en',
      name: 'English',
      title: 'M Gas | Leading LPG & Industrial Gas Cylinder Manufacturer & Exporter',
      description: 'M Gas (Managing Director Mr. Mousa Amooie) - Certified manufacturer of LPG cylinders (50kg, 11kg, 2kg, Camping, Auto LPG) compliant with ISO 9001, EN 1442, and ISIRI standards.',
      keywords: 'LPG cylinder manufacturer, gas cylinders, 50kg LPG cylinder, 11kg gas bottle, picnic cylinder, M Gas, Mousa Amooie, industrial gas bottles, cylinder exporter',
      ogTitle: 'M Gas - Premier LPG Cylinder Manufacturer & Exporter',
      ogDescription: '50+ years of manufacturing excellence. Heavy hydraulic drawing, 30-bar hydrostatic testing, oven powder coating, and global export to 12+ countries.',
    },
    ar: {
      code: 'ar',
      locale: 'ar_SA',
      hreflang: 'ar',
      name: 'العربية',
      title: 'م غاز | مصنع أسطوانات الغاز المسال (LPG) والغازات الصناعية المعتمد | M Gas',
      description: 'مصنع م غاز (بإدارة السيد موسى عموئي - Mousa Amooie) - تصنيع وتصدير أسطوانات الغاز المسال سعة 50 كغ، 11 كغ، 2 كغ والتخييم وفق معايير ISO 9001 و EN 1442.',
      keywords: 'مصنع أسطوانات الغاز, أسطوانة غاز مسال, م غاز, موسى عموئي, تصدير أسطوانات الغاز, أسطوانة 50 كيلو, أسطوانة 11 كغ, LPG cylinder factory',
      ogTitle: 'م غاز (M Gas) - مصنع أسطوانات الغاز المسال المعتمد دولياً',
      ogDescription: 'أعلى معايير الأمان والجودة، فحص هيدروستاتيكي 30 بار، طلاء حراري بالفرن، وتصدير لأكثر من 12 دولة في الشرق الأوسط وأفريقيا.',
    },
    de: {
      code: 'de',
      locale: 'de_DE',
      hreflang: 'de',
      name: 'Deutsch',
      title: 'M Gas | Hersteller & Exporteur von Flüssiggasflaschen (LPG) & Gaszylindern',
      description: 'M Gas (Geschäftsführer Mousa Amooie) - Zertifizierter Hersteller von Flüssiggasflaschen (50kg, 11kg, 2kg Camping) nach ISO 9001 und EN 1442 Standards.',
      keywords: 'Flüssiggasflaschen Hersteller, LPG Zylinder, Propangasflasche 11kg, Gasflasche 50kg, M Gas, Mousa Amooie, Gasflaschen Export',
      ogTitle: 'M Gas - Industrielle Fertigung von Flüssiggasflaschen & LPG-Zylindern',
      ogDescription: 'Über 50 Jahre Erfahrung in der Fertigung robuster Gasflaschen mit 30-Bar-Druckprüfung und Pulverbeschichtung.',
    },
    ur: {
      code: 'ur',
      locale: 'ur_PK',
      hreflang: 'ur',
      name: 'اردو',
      title: 'ایم گیس | مائع پیٹرولیم گیس (LPG) اور صنعتی گیس سلنڈر بنانے والی فیکٹری',
      description: 'ایم گیس (ڈائریکٹر موسیٰ عموئی) - 50 کلو، 11 کلو، 2 کلو ایل پی جی اور کیمپنگ گیس سلنڈرز کا مصدقہ مینوفیکچرر اور ایکسپورٹر برائے ISO 9001۔',
      keywords: 'ایل پی جی سلنڈر فیکٹری, گیس سلنڈر مینوفیکچرر, ایم گیس, موسی عموئی, 11 کلو گیس سلنڈر, 50 کلو سلنڈر, LPG Cylinders',
      ogTitle: 'ایم گیس - بین الاقوامی معیار کے ایل پی جی سلنڈر بنانے والی فیکٹری',
      ogDescription: 'اعلیٰ درجے کی مینوفیکچرنگ، 30 بار ہائیڈروسٹیٹک ٹیسٹنگ اور الیکٹرو اسٹاٹک کوٹنگ کے ساتھ برآمدی سہولت۔',
    },
    hy: {
      code: 'hy',
      locale: 'hy_AM',
      hreflang: 'hy',
      name: 'Հայերեն',
      title: 'M Gas | Հեղուկ գազի (LPG) և արդյունաբերական բալոնների արտադրություն',
      description: 'M Gas գործարան (տնօրեն Մուսա Ամուի) - 50կգ, 11կգ, 2կգ LPG գազաբալոնների արտադրող և արտահանող ISO 9001 ստանդարտներով։',
      keywords: 'գազաբալոնների արտադրություն, LPG բալոններ, M Gas, Մուսա Ամուի, 11կգ գազի բալոն, 50կգ բալոն',
      ogTitle: 'M Gas - Գազաբալոնների առաջատար արտադրող և արտահանող',
      ogDescription: '30 բար հիդրոստատիկ փորձարկում, վառարանում մշակված փոշեներկ և միջազգային առաքում։',
    },
    tr: {
      code: 'tr',
      locale: 'tr_TR',
      hreflang: 'tr',
      name: 'Türkçe',
      title: 'M Gas | LPG Tüpü ve Sanayi Gaz Silindirleri Üretici & İhracatçı Firma',
      description: 'M Gas Fabrikası (Genel Müdür Mousa Amooie) - ISO 9001 ve EN 1442 standartlarına uygun 50kg, 11kg, 2kg piknik ve otogaz LPG tüpü üretimi ve ihracatı.',
      keywords: 'LPG tüpü üreticisi, tüp imalatı, 50kg sanayi tüpü, 11kg mutfak tüpü, piknik tüpü, M Gas, Mousa Amooie, gaz tüpü ihracatı',
      ogTitle: 'M Gas - Güvenilir LPG Tüpü İmalatçısı ve İhracatçısı',
      ogDescription: '50 yılı aşkın tecrübe, 30 bar hidrostatik sızdırmazlık testi, elektrostatik fırın boya ve 12+ ülkeye ihracat ağı.',
    },
    ru: {
      code: 'ru',
      locale: 'ru_RU',
      hreflang: 'ru',
      name: 'Русский',
      title: 'М Газ | Завод по производству пропановых и промышленных газовых баллонов LPG',
      description: 'Завод М Газ (генеральный директор Муса Амуи - Mousa Amooie) - производство и экспорт газовых баллонов LPG (50л, 27л, 5л, кемпинг) по стандартам ISO 9001 и ГОСТ.',
      keywords: 'производство газовых баллонов, завод баллонов LPG, баллон 50 литров, баллон 27 литров, М Газ, Муса Амуи, экспорт газовых баллонов',
      ogTitle: 'М Газ (M Gas) - Ведущий производитель и экспортер газовых баллонов',
      ogDescription: 'Испытания давлением 30 бар, автоматическая роботизированная сварка, конвейерное полимерное покрытие и экспорт в страны СНГ и Ближнего Востока.',
    },
  } as Record<LanguageCode, SeoLanguageConfig>,
};
