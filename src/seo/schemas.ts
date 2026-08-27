import { SEO_CONFIG } from './config';
import { LanguageCode } from '../types';
import { PRODUCTS } from '../data/products';
import { FACTORY_VIDEOS } from '../data/factoryVideos';
import { TECHNICAL_ARTICLES, Article } from '../data/articles';

export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    ...SEO_CONFIG.organization,
  };
}

export function generateWebSiteSchema(currentLang: LanguageCode) {
  const langConfig = SEO_CONFIG.languages[currentLang] || SEO_CONFIG.languages.fa;

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SEO_CONFIG.siteName,
    alternateName: 'M Gas Cylinders',
    url: SEO_CONFIG.siteUrl,
    inLanguage: langConfig.hreflang,
    description: langConfig.description,
    publisher: {
      '@type': 'Organization',
      name: SEO_CONFIG.organization.name,
      logo: {
        '@type': 'ImageObject',
        url: SEO_CONFIG.organization.logo,
      },
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SEO_CONFIG.siteUrl}/?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function generateBreadcrumbSchema(currentLang: LanguageCode, activeArticle?: Article) {
  const isFa = currentLang === 'fa';

  const baseItems = [
    {
      '@type': 'ListItem',
      position: 1,
      name: isFa ? 'صفحه اصلی' : 'Home',
      item: `${SEO_CONFIG.siteUrl}/?lang=${currentLang}`,
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: isFa ? 'کاتالوگ محصولات کپسول گاز' : 'LPG Cylinders Catalog',
      item: `${SEO_CONFIG.siteUrl}/?lang=${currentLang}#products`,
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: isFa ? 'تور ویدیویی کارخانه و خطوط تولید' : 'Factory Video Tour',
      item: `${SEO_CONFIG.siteUrl}/?lang=${currentLang}#factory-tour`,
    },
    {
      '@type': 'ListItem',
      position: 4,
      name: isFa ? 'دانشنامه و مقالات مهندسی' : 'Engineering Articles',
      item: `${SEO_CONFIG.siteUrl}/?lang=${currentLang}#articles`,
    },
  ];

  if (activeArticle) {
    baseItems.push({
      '@type': 'ListItem',
      position: 5,
      name: activeArticle.title[currentLang] || activeArticle.title.fa,
      item: `${SEO_CONFIG.siteUrl}/#article=${activeArticle.slug}&lang=${currentLang}`,
    });
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: baseItems,
  };
}

export function generateVideosSchema(currentLang: LanguageCode) {
  const getLoc = (dict: Record<string, string>) => dict[currentLang] || dict.fa || dict.en || '';

  return FACTORY_VIDEOS.map((video, index) => ({
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: getLoc(video.title),
    description: getLoc(video.description),
    thumbnailUrl: [
      `${SEO_CONFIG.siteUrl}${video.thumbnail}`,
    ],
    uploadDate: '2023-03-03T18:43:00+03:30',
    duration: index === 0 ? 'PT1M30S' : 'PT0M45S',
    contentUrl: `${SEO_CONFIG.siteUrl}${video.videoSrc}`,
    embedUrl: `${SEO_CONFIG.siteUrl}${video.videoSrc}`,
    inLanguage: currentLang,
    publisher: {
      '@type': 'Organization',
      name: SEO_CONFIG.organization.name,
      logo: {
        '@type': 'ImageObject',
        url: SEO_CONFIG.organization.logo,
      },
    },
    creator: video.isManagerTour ? {
      '@type': 'Person',
      name: 'Mousa Amooie',
      jobTitle: 'Managing Director',
    } : {
      '@type': 'Organization',
      name: SEO_CONFIG.organization.name,
    },
  }));
}

export function generateProductsSchema(currentLang: LanguageCode) {
  return PRODUCTS.map((product) => {
    const localeInfo = product.locales[currentLang] || product.locales.fa;

    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: localeInfo.name,
      image: [
        `${SEO_CONFIG.siteUrl}${product.images.front}`,
        `${SEO_CONFIG.siteUrl}${product.images.perspective}`,
        `${SEO_CONFIG.siteUrl}${product.images.valveDetail}`,
      ],
      description: localeInfo.fullDescription || localeInfo.shortDescription,
      sku: product.id,
      mpn: `MGAS-${product.volume}${product.volumeUnit.toUpperCase()}`,
      brand: {
        '@type': 'Brand',
        name: 'M Gas',
      },
      category: product.category,
      material: product.material,
      height: `${product.heightCm} cm`,
      weight: `${product.emptyWeightKg} kg`,
      offers: {
        '@type': 'Offer',
        url: `${SEO_CONFIG.siteUrl}/?lang=${currentLang}#products`,
        priceCurrency: 'USD',
        price: product.unitPriceUsd ? String(product.unitPriceUsd) : '35.00',
        priceValidUntil: '2027-12-31',
        itemCondition: 'https://schema.org/NewCondition',
        availability: 'https://schema.org/InStock',
        seller: {
          '@type': 'Organization',
          name: SEO_CONFIG.organization.name,
        },
      },
      additionalProperty: [
        {
          '@type': 'PropertyValue',
          name: 'Hydrostatic Test Pressure',
          value: `${product.testPressureBar} Bar`,
        },
        {
          '@type': 'PropertyValue',
          name: 'Working Pressure',
          value: `${product.workingPressureBar} Bar`,
        },
        {
          '@type': 'PropertyValue',
          name: 'Body Steel Thickness',
          value: `${product.bodyThicknessMm} mm`,
        },
        {
          '@type': 'PropertyValue',
          name: 'Valve Standard',
          value: product.valveStandard,
        },
      ],
    };
  });
}

export function generateArticleSchema(article: Article, currentLang: LanguageCode) {
  const getLoc = (dict: Record<string, string>) => dict[currentLang] || dict.fa || dict.en || '';
  const getLocArray = (dict: Record<string, string[]>) => dict[currentLang] || dict.fa || dict.en || [];

  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SEO_CONFIG.siteUrl}/#article=${article.slug}&lang=${currentLang}`,
    },
    headline: getLoc(article.title),
    description: getLoc(article.abstract),
    image: [
      `${SEO_CONFIG.siteUrl}${article.coverImage}`,
      `${SEO_CONFIG.siteUrl}/seo/og-mgas-${currentLang}.jpg`,
    ],
    datePublished: article.publishDate,
    dateModified: article.modifyDate,
    inLanguage: currentLang,
    articleSection: getLoc(article.category),
    keywords: getLocArray(article.tags).join(', '),
    author: [
      {
        '@type': 'Person',
        name: 'Mousa Amooie',
        jobTitle: 'Managing Director & Pressure Vessel Specialist',
        worksFor: {
          '@type': 'Organization',
          name: SEO_CONFIG.organization.name,
        },
      },
      {
        '@type': 'Organization',
        name: `${SEO_CONFIG.organization.name} Technical Directorate`,
        url: SEO_CONFIG.siteUrl,
      },
    ],
    publisher: {
      '@type': 'Organization',
      name: SEO_CONFIG.organization.name,
      logo: {
        '@type': 'ImageObject',
        url: SEO_CONFIG.organization.logo,
      },
    },
    citation: article.references.map((ref) => ref.title),
    about: {
      '@type': 'Thing',
      name: 'Liquefied Petroleum Gas (LPG) Pressure Vessels',
      description: 'Design, metallurgical selection, hydrostatic proof testing, and regulatory compliance standards for refillable welded steel gas cylinders.',
    },
  };
}

export function generateAllArticlesSchema(currentLang: LanguageCode) {
  return TECHNICAL_ARTICLES.map((article) => generateArticleSchema(article, currentLang));
}

