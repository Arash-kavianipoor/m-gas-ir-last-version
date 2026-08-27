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
      whatsapp: '+447833783825',
      whatsappDisplay: '+44 7833 783825',
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
    googleMapEmbedUrl: 'https://maps.google.com/maps?q=35.768134,50.985922&z=15&output=embed',
    googleMapDirectUrl: 'https://maps.google.com/?q=35.768134,50.985922',
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
    telephoneInternational: '+447833783825',
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
