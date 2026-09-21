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
      title: 'کارخانه کپسول گاز ام گاز | تولید کننده و صادرکننده سیلندر گاز مایع (LPG) | M Gas',
      description: 'کارخانه ام گاز (مدیریت آقای موسی عمویی - تأسیس ۱۳۴۹) - بزرگترین تولیدکننده و صادرکننده کپسول گاز مایع ۵۰، ۱۱.۸ و ۲ کیلویی، سیلندرهای صنعتی و مخازن گاز خودرو با آزمون فشار ۳۰ بار هیدرواستاتیک و استاندارد ISO 9001 و EN 1442.',
      keywords: 'ام گاز, شرکت ام گاز, کارخانه ام گاز, تولید کننده کپسول گاز در ایران, سیلندر گاز, شرکت سیلندر, کپسول گاز مایع, شرکت کپسول گاز, کارخانه سیلندر سازی, ساخت کپسول گاز, کپسول ۵۰ کیلویی, کپسول ۱۱ کیلویی, کپسول پیک نیک, تامین گازهای صنعتی, موسی عمویی, سیلندر گاز مایع, LPG cylinder manufacturer, صادرات کپسول گاز, m-gas, mgas',
      ogTitle: 'کارخانه تولید کپسول و سیلندر گاز مایع ام گاز (M Gas)',
      ogDescription: '۵۰+ سال سابقه درخشان در ساخت انواع کپسول‌های گاز خانگی، صنعتی ۵۰ کیلویی و خودرویی با آزمون فشار ۳۰ بار، رنگ پودری الکترواستاتیک کوره‌ای و صادرات مستقیم.',
    },
    en: {
      code: 'en',
      locale: 'en_US',
      hreflang: 'en',
      name: 'English',
      title: 'M Gas | Premier LPG Cylinder Manufacturer & Industrial Gas Bottle Exporter',
      description: 'M Gas (Est. 1970 - Managing Director Mousa Amooie) - Certified manufacturer of LPG cylinders (50kg industrial, 11kg household, 2kg camping, Auto LPG) compliant with ISO 9001, EN 1442, and ISIRI standards with 30-bar hydrostatic testing.',
      keywords: 'M Gas, m-gas, mgas, m gas cylinder, m gas lpg, LPG cylinder manufacturer in Iran, LPG cylinder manufacturer, 50kg LPG cylinder, 11kg gas bottle, picnic cylinder, Mousa Amooie, industrial gas bottles, gas cylinder factory, cylinder exporter, LPG pressure vessel',
      ogTitle: 'M Gas - Premier LPG Cylinder Manufacturer & Exporter',
      ogDescription: '50+ years of industrial excellence. Heavy hydraulic drawing, 30-bar hydrostatic pressure testing, automated powder coating, and global export to 12+ countries.',
    },
    ar: {
      code: 'ar',
      locale: 'ar_SA',
      hreflang: 'ar',
      name: 'العربية',
      title: 'مصنع م غاز | تصنيع وتصدير أسطوانات الغاز المسال (LPG) والغازات الصناعية | M Gas',
      description: 'مصنع م غاز (تأسس ۱۹۷۰ - بإدارة السيد موسى عموئي - Mousa Amooie) - الشركة الرائدة في تصنيع وتصدير أسطوانات الغاز المسال ۵۰ كغ، ۱۱.۸ كغ، ۲ كغ والتخييم وفق معايير ISO 9001 و EN 1442 مع فحص هيدروستاتيكي ۳۰ بار.',
      keywords: 'مصنع أسطوانات الغاز, أسطوانة غاز مسال, م غاز, شرکت ام گاز, موسى عموئي, تصدير أسطوانات الغاز, أسطوانة 50 كيلو, اسطوانات غاز ۱۱ كغ, اسطوانة غاز منزلي, LPG cylinder factory, M Gas Cylinders',
      ogTitle: 'م غاز (M Gas) - مصنع أسطوانات الغاز المسال المعتمد دولياً',
      ogDescription: 'أعلى معايير الأمان والجودة، فحص هيدروستاتيكي 30 بار، طلاء حراري بالفرن، وتصدير لأكثر من 12 دولة في الشرق الأوسط وأفريقيا.',
    },
    de: {
      code: 'de',
      locale: 'de_DE',
      hreflang: 'de',
      name: 'Deutsch',
      title: 'M Gas | Hersteller & Exporteur von Flüssiggasflaschen (LPG) & Gaszylindern',
      description: 'M Gas Zylinderfabrik (Gegründet 1970 - GF Mousa Amooie) - Zertifizierter Hersteller von 50kg Industrie- und 11kg Haushalts-Flüssiggasflaschen sowie Campingflaschen nach ISO 9001 und EN 1442 mit 30-Bar-Druckprüfung.',
      keywords: 'Flüssiggasflaschen Hersteller, LPG Zylinder, Propangasflasche 11kg, Gasflasche 50kg, M Gas, Mousa Amooie, Gasflaschen Export, M Gas Zylinder Fabrik, Camping Gasflaschen',
      ogTitle: 'M Gas - Industrielle Fertigung von Flüssiggasflaschen & LPG-Zylindern',
      ogDescription: 'Über 50 Jahre Erfahrung in der Fertigung robuster Gasflaschen mit 30-Bar-Druckprüfung und Pulverbeschichtung.',
    },
    ur: {
      code: 'ur',
      locale: 'ur_PK',
      hreflang: 'ur',
      name: 'اردو',
      title: 'ایم گیس | ایل پی جی اور صنعتی مائع گیس سلنڈر مینوفیکچرنگ فیکٹری | M Gas Pakistan',
      description: 'کارخانہ ایم گیس (ڈائریکٹر موسیٰ عموئی - Mousa Amooie) - 50 کلو صنعتی، 11.8 کلو گھریلو، 2 کلو کیمپنگ اور آٹو ایل پی جی سلنڈرز کا بین الاقوامی مینوفیکچرر اور پاکستان کو برآمد کنندہ برائے ISO 9001 اور EN 1442۔',
      keywords: 'ایل پی جی سلنڈر, گیس سلنڈر بنانے والی فیکٹری, کپسول گاز مایع, 11.8 کلو گیس سلنڈر, 50 کلو کمرشل سلنڈر, پکنک گیس سلنڈر, سیلنڈر گیس قیمت, ایم گیس, موسی عموئی, ایل پی جی سلنڈر پاکستان, LPG Cylinders Pakistan, Gas cylinder exporter, M Gas, m-gas, mgas',
      ogTitle: 'ایم گیس (M Gas) - بین الاقوامی معیار کے ایل پی جی اور مائع گیس سلنڈر بنانے والی فیکٹری',
      ogDescription: 'اعلیٰ درجے کی روبوٹک مینوفیکچرنگ، 30 بار ہائیڈروسٹیٹک ٹیسٹنگ، اوون الیکٹرو اسٹاٹک پاؤڈر کوٹنگ اور پاکستان و مشرق وسطیٰ کو باقاعدہ ترسیل۔',
    },
    hy: {
      code: 'hy',
      locale: 'hy_AM',
      hreflang: 'hy',
      name: 'Հայերեն',
      title: 'M Gas | Հեղուկ գազի (LPG) և արդյունաբերական բալոնների արտադրություն և արտահանում',
      description: 'M Gas գործարան (Հիմնադրված 1970թ. - Տնօրեն Մուսա Ամուի) - 50կգ, 11կգ, 2կգ և ավտոգազի LPG գազաբալոնների սերտիֆիկացված արտադրող և արտահանող ISO 9001 և EN 1442 ստանդարտներով։',
      keywords: 'գազաբալոնների արտադրություն, LPG բալոններ, M Gas, Մուսա Ամուի, 11կգ գազի բալոն, 50կգ բալոն, m-gas, գազի բալոնների գործարան',
      ogTitle: 'M Gas - Գազաբալոնների առաջատար արտադրող և արտահանող',
      ogDescription: '30 բար հիդրոստատիկ փորձարկում, վառարանում մշակված փոշեներկ և միջազգային առաքում։',
    },
    tr: {
      code: 'tr',
      locale: 'tr_TR',
      hreflang: 'tr',
      name: 'Türkçe',
      title: 'M Gas | LPG Tüpü ve Sanayi Gaz Silindirleri Üretici & İhracatçı Fabrika',
      description: 'M Gas Tüp Fabrikası (Kuruluş 1970 - Genel Müdür Mousa Amooie) - ISO 9001 ve EN 1442 onaylı 50kg sanayi tüpü, 11-12kg mutfak tüpü, piknik tüpü ve otogaz LPG tüpü üretimi ve ihracatı.',
      keywords: 'tüp markaları, LPG tüpü üreticisi, tüp imalatı, 50kg sanayi tüpü, 12 kg mutfak tüpü, piknik tüpü, M Gas, Mousa Amooie, gaz tüpü ihracatı, sanayi gaz silindirleri, m-gas',
      ogTitle: 'M Gas - Güvenilir LPG Tüpü İmalatçısı ve İhracatçısı',
      ogDescription: '50 yılı aşkın tecrübe, 30 bar hidrostatik sızdırmazlık testi, elektrostatik fırın boya ve 12+ ülkeye ihracat ağı.',
    },
    ru: {
      code: 'ru',
      locale: 'ru_RU',
      hreflang: 'ru',
      name: 'Русский',
      title: 'М Газ | Завод-производитель пропановых газовых баллонов LPG и сосудов давления',
      description: 'Завод М Газ (Основан в 1970 г. - Гендиректор Муса Амуи - Mousa Amooie) - производство и экспорт сертифицированных баллонов для сжиженного газа LPG (50 л, 27 л, 5 л, кемпинг) по стандартам ISO 9001 и ГОСТ с гидроиспытанием 30 бар.',
      keywords: 'производство газовых баллонов, завод баллонов LPG, баллон 50 литров, баллон 27 литров, М Газ, Муса Амуи, экспорт газовых баллонов, m gas, пропановый баллон',
      ogTitle: 'М Газ (M Gas) - Ведущий производитель и экспортер газовых баллонов',
      ogDescription: 'Испытания давлением 30 бар, автоматическая роботизированная сварка, конвейерное полимерное покрытие и экспорт в страны СНГ и Ближнего Востока.',
    },
  } as Record<LanguageCode, SeoLanguageConfig>,
};
