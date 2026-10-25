import { SeoConfig } from '../types';

export const COMPANY_INFO = {
  name: 'M Gas Cylinder Factory',
  persianName: 'کارخانه تولید کپسول گاز ام گاز',
  brand: 'M Gas (mgas.ir)',
  establishedYear: 1970,
  establishedYearJalali: 1349,
  exportCountriesCount: 12,
  domain: 'https://mgas.ir',
  
  // Official Department Emails (from prompt)
  emails: {
    info: 'Info@mgas.ir',
    sales: 'Seller@mgas.ir',
    system: 'No_replay@mgas.ir',
  },

  // Contact Persons & Phones (from prompt)
  contacts: {
    domesticDirector: {
      name: 'Mousa Amooie',
      persianName: 'موسی عمویی',
      roleEn: 'Factory Director & General Manager',
      roleFa: 'مدیریت کارخانه و مدیر ارشد تولید',
      mobile: '+989124628269',
      mobileDisplay: '+98 (912) 462-8269',
      landline: '+982636606842',
      landlineDisplay: '+98 (26) 3660-6842',
    },
    internationalSalesManager: {
      name: 'Arash Kavianipoor',
      persianName: 'آرش کاویانی‌پور',
      roleEn: 'International Sales & Export Representative',
      roleFa: 'نماینده فروش و امور بین‌الملل (خارج از ایران)',
      whatsapp: '+989128634908',
      whatsappDisplay: '+989128634908',
    },
    factoryCentral: {
      phone: '+982636606842',
      phoneDisplay: '+98 (26) 3660-6842',
      whatsappSupport: '+989124628269',
      whatsappSupportDisplay: '+98 (912) 462-8269',
    },
  },

  // Working Hours (from prompt)
  workingHours: {
    daysEn: 'Saturday – Thursday',
    daysFa: 'شنبه تا پنج‌شنبه',
    time: '08:00 – 18:00',
    fridayEn: 'Friday Closed (24/7 Online Support Active)',
    fridayFa: 'جمعه تعطیل (پشتیبانی آنلاین و واتس‌اپ ۲۴/۷ فعال است)',
  },

  // Address and Map location (from prompt)
  address: {
    fullEnglish: 'No. 36, behind of Oil Reservoir, Karaj – Mallard Rd., Karaj, Alborz Province, IRAN',
    officeAddressEnglish: 'Trans-Electric Street, behind the Oil Company Tanks, Malard Road, Karaj, Alborz Province, Iran',
    fullPersian: 'استان البرز، کرج، جاده ملارد، پشت انبار نفت (مخازن شرکت نفت)، خیابان ترانس برق، پلاک ۳۶',
    plusCode: 'QX6W+RX6',
    locationCode: 'QX6W+RX6, Karaj, Terans-e-Barq, Iran',
    fullPlusCodeAddress: 'QX6W+RX6، Tehran/Alborz Province, Karaj, Terans-e-Barq, Iran',
    coordinates: { lat: 35.768134, lng: 50.985922 },
    googleMapEmbedUrl: 'https://maps.google.com/maps?q=35.768134,50.985922&t=&z=16&ie=UTF8&iwloc=&output=embed',
    googleMapDirectUrl: 'https://www.google.com/maps/search/?api=1&query=35.768134,50.985922',
    googleMapPlusCodeUrl: 'https://www.google.com/maps/search/?api=1&query=QX6W%2BRX6+Karaj+Iran',
  },

  // Quality & Standards
  certifications: [
    { code: 'ISO 9001:2015', label: 'Quality Management System' },
    { code: 'ISO 11118', label: 'Gas Cylinders - Non-refillable and refillable metallic gas cylinders' },
    { code: 'EN 1442', label: 'LPG Equipment and Accessories - Transportable Refillable Welded Steel Cylinders' },
    { code: 'ISIRI 841', label: 'National Standard of Iran for LPG Cylinders' },
    { code: 'DOT-4BA', label: 'US Department of Transportation Cylinder Standard' },
    { code: 'TPED / CE', label: 'European Transportable Pressure Equipment Directive' },
  ],
};

export const COMPANY_ADDRESS: Record<import('../types').LanguageCode, string> = {
  fa: 'استان البرز، کرج، جاده ملارد، پشت انبار نفت (مخازن شرکت نفت)، خیابان ترانس برق، پلاک ۳۶',
  en: 'No. 36, behind Oil Reservoir, Trans-Electric St., Karaj-Malard Rd., Karaj, Alborz Province, Iran',
  ar: 'مبنى ۳۶، خلف مستودع النفط، شارع ترانس كهرباء، طريق كرج-ملارد، كرج، محافظة البرز، إيران',
  de: 'Nr. 36, hinter dem Öllager, Trans-Electric-Str., Karaj-Malard-Str., Karaj, Provinz Alborz, Iran',
  ur: 'مکان نمبر ۳۶، آئل ڈپو کے پیچھے، ٹرانس الیکٹرک اسٹریٹ، کرج - ملارد روڈ، کرج، صوبہ البرز، ایران',
  tr: 'No: 36, Petrol Deposu arkası, Trans Elektrik Cad., Karac-Malard Yolu, Karac, Elburz Eyaleti, İran',
  ru: '№ 36, за нефтебазой, ул. Транс-Электрик, шоссе Карадж-Малард, Карадж, провинция Альборз, Иран',
  hy: 'Թիվ 36, Նավթաբազայի հետևում, Տրանս-Էլեկտրիկ փողոց, Քարաջ-Մալարդ ճանապարհ, Քարաջ, Ալբորզի նահանգ, Իրան',
};

export const DIRECTOR_ROLES: Record<import('../types').LanguageCode, { name: string; role: string }> = {
  fa: { name: 'موسی عمویی', role: 'مدیریت کارخانه و مدیر ارشد تولید' },
  en: { name: 'Mousa Amooie', role: 'Factory Director & General Manager' },
  ar: { name: 'موسى عموئي', role: 'مدير المصنع والمدير العام للإنتاج' },
  de: { name: 'Mousa Amooie', role: 'Werksleiter & Generaldirektor' },
  ur: { name: 'موسیٰ عموئی', role: 'فیکٹری ڈائریکٹر اور جنرل منیجر' },
  tr: { name: 'Mousa Amooie', role: 'Fabrika Müdürü ve Genel Müdür' },
  ru: { name: 'Муса Амуи', role: 'Директор завода и генеральный управляющий' },
  hy: { name: 'Մուսա Ամուի', role: 'Գործարանի տնօրեն և գլխավոր մենեջեր' },
};

export const SEO_CONFIG: SeoConfig = {
  siteName: 'M Gas | کارخانه تولید کپسول گاز ام گاز',
  siteUrl: 'https://mgas.ir',
  defaultTitle: 'M Gas | کارخانه تولید کپسول گاز مایع (LPG) و مخازن استاندارد',
  defaultDescription: 'کارخانه ام گاز (mgas.ir) تولیدکننده انواع کپسول‌های گاز مایع LPG و مخازن گاز صنعتی، خانگی و کارگاهی با استانداردهای بین‌المللی و صادرات به بیش از ۱۲ کشور جهان از سال ۱۳۴۹.',
  defaultImage: 'https://mgas.ir/og-image.jpg',
  twitterCard: 'summary_large_image',
  organization: {
    name: 'M Gas Cylinder Manufacturing Factory',
    legalName: 'M Gas Industrial Group',
    foundingYear: 1970,
    url: 'https://mgas.ir',
    logo: 'https://mgas.ir/logo.png',
    telephoneDomestic: '+982636606842',
    telephoneInternational: '+989128634908',
    emailInfo: 'Info@mgas.ir',
    emailSales: 'Seller@mgas.ir',
    address: {
      streetAddress: 'Trans-Electric St., behind Oil Reservoir, Karaj-Mallard Rd.',
      addressLocality: 'Karaj',
      addressRegion: 'Alborz',
      postalCode: '31686',
      addressCountry: 'IR',
    },
    geo: {
      latitude: 35.768134,
      longitude: 50.985922,
    },
  },
};
