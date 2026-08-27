export type LanguageCode = 'fa' | 'en' | 'ar' | 'de' | 'ur' | 'hy' | 'tr' | 'ru';

export type TextDirection = 'rtl' | 'ltr';

export interface LanguageInfo {
  code: LanguageCode;
  locale: string;
  name: string;
  nativeName: string;
  flag: string;
  dir: TextDirection;
  countryName: string;
}

export type ProductCategory = 'workshops' | 'home' | 'automotive';

export interface ProductLocalizedInfo {
  name: string;
  shortDescription: string;
  fullDescription: string;
  categoryLabel: string;
  applications: string[];
  features: string[];
  specsSummary: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
  imageAlt: string;
}

export interface ProductImages {
  front: string;
  perspective: string;
  valveDetail: string;
  referenceReal: string;
  gallery?: string[];
}

export interface ProductAngleView {
  id: string;
  angleKey: 'front' | 'perspective' | 'valveDetail' | 'referenceReal';
  angleNameFa: string;
  angleNameEn: string;
  imageSrc: string;
  descriptionFa: string;
  descriptionEn: string;
}

export interface Product {
  id: string;
  slug: string;
  category: ProductCategory;
  volume: number;
  volumeUnit: 'Liter' | 'Kg';
  emptyWeightKg: number;
  circleDiameterCm: number;
  heightCm: number;
  minOrder: number;
  unitPriceUsd?: number;
  testPressureBar: number;
  workingPressureBar: number;
  bodyThicknessMm: number;
  material: string;
  valveStandard: string;
  coating: string;
  isPopular?: boolean;
  isNew?: boolean;
  cylinderColor: string;
  defaultRalCode?: string;
  image?: string;
  images: ProductImages;
  locales: Record<LanguageCode, ProductLocalizedInfo>;
}

export interface RfqItem {
  productId: string;
  quantity: number;
  selectedRalColor?: string;
}

export interface ContactFormData {
  fullName: string;
  companyName: string;
  email: string;
  phone: string;
  country: string;
  inquiryType: 'sales' | 'support' | 'export' | 'partnership' | 'careers';
  preferredContact: 'whatsapp' | 'email' | 'phone';
  cylinderModel?: string;
  quantity?: number;
  message: string;
}

export interface SeoConfig {
  siteName: string;
  siteUrl: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultImage: string;
  twitterCard: 'summary_large_image' | 'summary';
  organization: {
    name: string;
    legalName: string;
    foundingYear: number;
    url: string;
    logo: string;
    telephoneDomestic: string;
    telephoneInternational: string;
    emailInfo: string;
    emailSales: string;
    address: {
      streetAddress: string;
      addressLocality: string;
      addressRegion: string;
      postalCode: string;
      addressCountry: string;
    };
    geo: {
      latitude: number;
      longitude: number;
    };
  };
}
