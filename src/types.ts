export type LanguageCode = 'en' | 'fa' | 'ar' | 'de' | 'ur' | 'hy' | 'tr' | 'ru';

export interface LanguageInfo {
  code: LanguageCode;
  locale: string;
  name: string;
  nativeName: string;
  flag: string;
  dir: 'ltr' | 'rtl';
  countryName: string;
  subdomain: string | null;
  domain: string;
}

export type ProductCategory = 'workshops' | 'home' | 'automotive';

export interface ProductLocalizedInfo {
  name: string;
  shortDescription: string;
  fullDescription: string;
  categoryLabel: string;
  applications: string[];
  features: string[];
  technicalFeatures?: string[];
  specsSummary?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  imageAlt?: string;
}

export interface ProductImages {
  front: string;
  perspective: string;
  valveDetail: string;
  referenceReal: string;
  gallery: string[];
}

export interface Product {
  id: string;
  slug: string;
  category: ProductCategory;
  volume: number;
  volumeUnit: string;
  emptyWeightKg: number;
  circleDiameterCm: number;
  heightCm: number;
  minOrder: number;
  unitPriceUsd: number;
  testPressureBar: number;
  workingPressureBar: number;
  bodyThicknessMm: number;
  material: string;
  valveStandard: string;
  coating: string;
  isPopular?: boolean;
  isNew?: boolean;
  defaultRalCode?: string;
  cylinderColor?: string;
  image: string;
  images: ProductImages;
  locales: Record<LanguageCode, ProductLocalizedInfo>;
}

export interface RfqItem {
  productId: string;
  quantity: number;
  selectedRalColor?: string;
}

export interface SeoConfig {
  siteName: string;
  siteUrl: string;
  defaultTitle?: string;
  defaultDescription?: string;
  defaultImage?: string;
  twitterCard?: string;
  defaultLanguage?: LanguageCode;
  organization?: any;
  languages?: any;
  [key: string]: any;
}
