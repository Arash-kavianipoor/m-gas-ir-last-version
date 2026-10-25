import { LanguageCode, Product } from '../types';
import { SEO_CONFIG, TARGET_SEO_PHRASES } from './config';
import { COMPANY_INFO } from '../data/company';
import { PRODUCTS } from '../data/products';
import { TECHNICAL_ARTICLES, Article } from '../data/articles';
import { FACTORY_VIDEOS } from '../data/factoryVideos';
import { getBaseUrlForLanguage } from '../utils/subdomains';
import { FAQS_DATA } from '../data/faqs';
import { PAGE_TRANSLATIONS } from '../i18n/pageTranslations';

export function generateOrganizationSchema(lang: LanguageCode = 'fa') {
  const baseUrl = getBaseUrlForLanguage(lang);
  const phrases = TARGET_SEO_PHRASES[lang] || TARGET_SEO_PHRASES.fa;

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${baseUrl}/#organization`,
    name: SEO_CONFIG.organization.name,
    legalName: SEO_CONFIG.organization.legalName,
    alternateName: [
      ...SEO_CONFIG.organization.alternateName,
      phrases.cylinderManufacturer,
    ],
    slogan: phrases.cylinderManufacturer,
    description: phrases.fullDescription,
    url: baseUrl,
    logo: {
      '@type': 'ImageObject',
      url: SEO_CONFIG.organization.logo,
      width: 512,
      height: 512,
    },
    image: SEO_CONFIG.organization.image,
    founder: {
      '@type': 'Person',
      name: SEO_CONFIG.organization.founder.name,
      jobTitle: SEO_CONFIG.organization.founder.jobTitle,
      image: SEO_CONFIG.organization.founder.image,
    },
    foundingDate: SEO_CONFIG.organization.foundingDate,
    email: COMPANY_INFO.emails.sales,
    telephone: COMPANY_INFO.contacts.factoryCentral.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: COMPANY_INFO.address.fullPersian,
      addressLocality: 'کرج',
      addressRegion: 'استان البرز',
      addressCountry: 'IR',
    },
    sameAs: [
      'https://www.linkedin.com/company/mgas',
      'https://www.instagram.com/mgas.ir',
    ],
    knowsAbout: [
      phrases.cylinderManufacturer,
      phrases.domesticIndustrial,
      phrases.autoLpgTanks,
      ...SEO_CONFIG.organization.knowsAbout,
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: phrases.cylinderManufacturer,
      itemListElement: [
        {
          '@type': 'OfferCatalog',
          name: 'کپسول‌های گاز خانگی و پیکنیک (Domestic & Camping Cylinders)',
        },
        {
          '@type': 'OfferCatalog',
          name: 'سیلندرهای گاز صنعتی و کارگاهی (Industrial LPG Cylinders)',
        },
        {
          '@type': 'OfferCatalog',
          name: 'مخازن گاز مایع خودرو (Automotive LPG Autogas Tanks)',
        },
      ],
    },
  };
}

export function generateLocalBusinessSchema(lang: LanguageCode) {
  const baseUrl = getBaseUrlForLanguage(lang);
  const phrases = TARGET_SEO_PHRASES[lang] || TARGET_SEO_PHRASES.fa;

  return {
    '@context': 'https://schema.org',
    '@type': 'ManufacturingBusiness',
    '@id': `${baseUrl}/#localbusiness`,
    name: SEO_CONFIG.organization.name,
    description: phrases.fullDescription,
    slogan: phrases.cylinderManufacturer,
    image: `${SEO_CONFIG.siteUrl}/banners/DSC080212591.webp`,
    telephone: COMPANY_INFO.contacts.factoryCentral.phone,
    email: COMPANY_INFO.emails.sales,
    url: baseUrl,
    address: {
      '@type': 'PostalAddress',
      streetAddress: COMPANY_INFO.address.fullPersian,
      addressLocality: 'کرج',
      addressRegion: 'استان البرز',
      addressCountry: 'IR',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: SEO_CONFIG.organization.geo.latitude,
      longitude: SEO_CONFIG.organization.geo.longitude,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
        opens: '08:00',
        closes: '18:00',
      },
    ],
    priceRange: '$$$',
    knowsAbout: [
      phrases.cylinderManufacturer,
      phrases.domesticIndustrial,
      phrases.autoLpgTanks,
    ],
  };
}

export function generateCoreCompetenciesSchema(lang: LanguageCode) {
  const baseUrl = getBaseUrlForLanguage(lang);
  const phrases = TARGET_SEO_PHRASES[lang] || TARGET_SEO_PHRASES.fa;

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': `${baseUrl}/#core-competencies`,
    name: phrases.cylinderManufacturer,
    description: phrases.fullDescription,
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: phrases.cylinderManufacturer,
        description: 'بزرگترین کارخانه و کمپانی تولید سیلندر گاز مایع در ایران با آزمون فشار ۳۰ بار هیدرواستاتیک',
        url: `${baseUrl}/products`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: phrases.domesticIndustrial,
        description: 'طیف کامل سیلندرهای خانگی و صنعتی از ۰.۵ لیتری تا ۶۰ لیتری و ۵۰ کیلویی',
        url: `${baseUrl}/products`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: phrases.autoLpgTanks,
        description: 'تولید مخازن گازسوز استاندارد خودرو و اتوگاز با رعایت تمامی استانداردهای ایمنی ملی و جهانی',
        url: `${baseUrl}/products`,
      },
    ],
  };
}

export function generateWebSiteSchema(lang: LanguageCode) {
  const baseUrl = getBaseUrlForLanguage(lang);
  const langConfig = SEO_CONFIG.languages[lang] || SEO_CONFIG.languages.fa;
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${baseUrl}/#website`,
    url: baseUrl,
    name: SEO_CONFIG.siteName,
    inLanguage: langConfig.locale.replace('_', '-'),
    publisher: {
      '@id': `${baseUrl}/#organization`,
    },
  };
}

export function generateBreadcrumbSchema(
  lang: LanguageCode,
  activeArticle?: Article | null,
  activeProduct?: Product | null,
  activeSection?: string | null
) {
  const baseUrl = getBaseUrlForLanguage(lang);
  const pt = PAGE_TRANSLATIONS[lang] || PAGE_TRANSLATIONS.fa;
  const items = [
    {
      '@type': 'ListItem',
      position: 1,
      name: pt.navHome,
      item: `${baseUrl}/`,
    },
  ];

  if (activeProduct) {
    items.push({
      '@type': 'ListItem',
      position: 2,
      name: pt.productsBreadcrumb,
      item: `${baseUrl}/products`,
    });
    const loc = activeProduct.locales[lang] || activeProduct.locales.fa || activeProduct.locales.en;
    items.push({
      '@type': 'ListItem',
      position: 3,
      name: loc.name,
      item: `${baseUrl}/products/${activeProduct.slug}`,
    });
  } else if (activeArticle) {
    items.push({
      '@type': 'ListItem',
      position: 2,
      name: pt.navArticlesStandards,
      item: `${baseUrl}/articles`,
    });
    items.push({
      '@type': 'ListItem',
      position: 3,
      name: activeArticle.title[lang] || activeArticle.title.fa || activeArticle.title.en,
      item: `${baseUrl}/articles/${activeArticle.slug}`,
    });
  } else if (activeSection && activeSection !== 'hero') {
    const sectionNames: Record<string, { label: string; path: string }> = {
      products: { label: pt.productsBreadcrumb, path: '/products' },
      quality: { label: pt.navQualityIso, path: '/quality' },
      'factory-tour': { label: pt.navQualityVideoTour, path: '/factory-tour' },
      articles: { label: pt.navArticlesStandards, path: '/articles' },
      about: { label: pt.navAboutHeritage, path: '/about' },
      history: { label: pt.navAboutHeritage, path: '/about' },
      faq: { label: pt.navAboutFaq, path: '/faq' },
      calculator: { label: pt.navAboutRfq, path: '/calculator' },
      contact: { label: pt.navAboutContact, path: '/contact' },
    };
    const sName = sectionNames[activeSection];
    const label = sName ? sName.label : activeSection;
    const cleanSectionPath = sName ? sName.path : `/${activeSection}`;
    items.push({
      '@type': 'ListItem',
      position: 2,
      name: label,
      item: `${baseUrl}${cleanSectionPath}`,
    });
  } else {
    items.push({
      '@type': 'ListItem',
      position: 2,
      name: pt.productsMainTitle,
      item: `${baseUrl}/products`,
    });
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  };
}

export function generateVideosSchema(lang: LanguageCode) {
  return FACTORY_VIDEOS.map((vid) => ({
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: vid.title[lang] || vid.title.fa || vid.title.en,
    description: vid.description[lang] || vid.description.fa || vid.description.en,
    thumbnailUrl: `${SEO_CONFIG.siteUrl}${vid.thumbnail}`,
    contentUrl: `${SEO_CONFIG.siteUrl}${vid.videoSrc}`,
    uploadDate: '2024-01-15T08:00:00+03:30',
    duration: `PT${vid.duration.replace(':', 'M')}S`,
    publisher: {
      '@type': 'Organization',
      name: SEO_CONFIG.organization.name,
      logo: {
        '@type': 'ImageObject',
        url: SEO_CONFIG.organization.logo,
      },
    },
  }));
}

export function generateSingleProductSchema(prod: Product, lang: LanguageCode) {
  const baseUrl = getBaseUrlForLanguage(lang);
  const loc = prod.locales[lang] || prod.locales.fa || prod.locales.en;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${baseUrl}/products/${prod.slug}`,
    name: loc.name,
    image: `${SEO_CONFIG.siteUrl}${prod.image}`,
    description: loc.fullDescription || loc.shortDescription,
    sku: prod.id,
    brand: {
      '@type': 'Brand',
      name: 'ام گاز (M Gas) - کمپانی تولید سیلندر گاز مایع در ایران',
    },
    manufacturer: {
      '@id': `${baseUrl}/#organization`,
    },
    weight: {
      '@type': 'QuantitativeValue',
      value: prod.emptyWeightKg,
      unitCode: 'KGM',
    },
    height: {
      '@type': 'QuantitativeValue',
      value: prod.heightCm,
      unitCode: 'CMT',
    },
    width: {
      '@type': 'QuantitativeValue',
      value: prod.circleDiameterCm,
      unitCode: 'CMT',
    },
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: 'Manufacturer',
        value: 'کمپانی تولید سیلندر گاز مایع در ایران (M Gas Co.)',
      },
      {
        '@type': 'PropertyValue',
        name: 'Test Pressure',
        value: `${prod.testPressureBar} Bar (100% Hydrostatic Proof Expansion)`,
      },
      {
        '@type': 'PropertyValue',
        name: 'Working Pressure',
        value: `${prod.workingPressureBar} Bar`,
      },
      {
        '@type': 'PropertyValue',
        name: 'Material Specification',
        value: prod.material,
      },
      {
        '@type': 'PropertyValue',
        name: 'Standard Compliance',
        value: 'ISIRI 841 / ISIRI 304 / ISO 9001 / EN 1442',
      },
    ],
    offers: {
      '@type': 'Offer',
      url: `${baseUrl}/products/${prod.slug}`,
      priceCurrency: 'USD',
      price: prod.unitPriceUsd ? String(prod.unitPriceUsd) : undefined,
      priceValidUntil: '2027-12-31',
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@id': `${baseUrl}/#organization`,
      },
    },
  };
}

export function generateProductsSchema(lang: LanguageCode) {
  return PRODUCTS.map((prod) => generateSingleProductSchema(prod, lang));
}

export function generateFaqSchema(lang: LanguageCode) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS_DATA.map((f) => {
      const loc = f.locales[lang] || f.locales.fa;
      return {
        '@type': 'Question',
        name: loc.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: loc.answer,
        },
      };
    }),
  };
}

export function generateArticleSchema(article: Article, lang: LanguageCode) {
  const baseUrl = getBaseUrlForLanguage(lang);
  const title = article.title[lang] || article.title.fa || article.title.en;
  const description = article.abstract[lang] || article.abstract.fa || article.abstract.en;

  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: title,
    description: description,
    image: `${SEO_CONFIG.siteUrl}${article.coverImage}`,
    datePublished: article.publishDate,
    dateModified: article.modifyDate,
    author: {
      '@type': 'Person',
      name: article.author.name,
    },
    publisher: {
      '@id': `${baseUrl}/#organization`,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}/articles/${article.slug}`,
    },
  };
}

export function generateAllArticlesSchema(lang: LanguageCode) {
  return TECHNICAL_ARTICLES.map((art) => generateArticleSchema(art, lang));
}
