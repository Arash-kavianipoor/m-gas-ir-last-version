import { LanguageCode } from '../types';
import { SEO_CONFIG } from './config';
import { COMPANY_INFO } from '../data/company';
import { PRODUCTS } from '../data/products';
import { TECHNICAL_ARTICLES, Article } from '../data/articles';
import { FACTORY_VIDEOS } from '../data/factoryVideos';
import { getBaseUrlForLanguage, getDomainForLanguage } from '../utils/subdomains';

export function generateOrganizationSchema(lang: LanguageCode = 'en') {
  const baseUrl = getBaseUrlForLanguage(lang);
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${baseUrl}/#organization`,
    name: SEO_CONFIG.organization.name,
    legalName: SEO_CONFIG.organization.legalName,
    alternateName: SEO_CONFIG.organization.alternateName,
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
      streetAddress: COMPANY_INFO.address.officeAddressEnglish,
      addressLocality: 'Karaj',
      addressRegion: 'Alborz Province',
      addressCountry: 'IR',
    },
    sameAs: [
      'https://www.linkedin.com/company/mgas',
      'https://www.instagram.com/mgas_cylinders',
    ],
  };
}

export function generateLocalBusinessSchema(lang: LanguageCode) {
  const baseUrl = getBaseUrlForLanguage(lang);
  return {
    '@context': 'https://schema.org',
    '@type': 'ManufacturingBusiness',
    '@id': `${baseUrl}/#localbusiness`,
    name: SEO_CONFIG.organization.name,
    image: `${SEO_CONFIG.siteUrl}/banners/factory_hero.jpg`,
    telephone: COMPANY_INFO.contacts.factoryCentral.phone,
    email: COMPANY_INFO.emails.sales,
    url: baseUrl,
    address: {
      '@type': 'PostalAddress',
      streetAddress: COMPANY_INFO.address.officeAddressEnglish,
      addressLocality: 'Karaj',
      addressRegion: 'Alborz',
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
    priceRange: '$$',
  };
}

export function generateWebSiteSchema(lang: LanguageCode) {
  const baseUrl = getBaseUrlForLanguage(lang);
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${baseUrl}/#website`,
    url: baseUrl,
    name: SEO_CONFIG.siteName,
    inLanguage: lang,
    publisher: {
      '@id': `${baseUrl}/#organization`,
    },
  };
}

export function generateBreadcrumbSchema(lang: LanguageCode, activeArticle?: Article | null) {
  const baseUrl = getBaseUrlForLanguage(lang);
  const items = [
    {
      '@type': 'ListItem',
      position: 1,
      name: lang === 'fa' ? 'صفحه اصلی' : 'Home',
      item: `${baseUrl}/`,
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: lang === 'fa' ? 'محصولات و سیلندرها' : 'LPG Cylinders',
      item: `${baseUrl}/#products`,
    },
  ];

  if (activeArticle) {
    items.push({
      '@type': 'ListItem',
      position: 3,
      name: activeArticle.title[lang] || activeArticle.title.en || activeArticle.title.fa,
      item: `${baseUrl}/#article=${activeArticle.slug}`,
    });
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  };
}

export function generateVideosSchema(lang: LanguageCode) {
  const baseUrl = getBaseUrlForLanguage(lang);
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

export function generateProductsSchema(lang: LanguageCode) {
  const baseUrl = getBaseUrlForLanguage(lang);
  return PRODUCTS.map((prod) => {
    const loc = prod.locales[lang] || prod.locales.en;
    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      '@id': `${baseUrl}/#product-${prod.id}`,
      name: loc.name,
      image: `${SEO_CONFIG.siteUrl}${prod.image}`,
      description: loc.shortDescription,
      sku: prod.id,
      brand: {
        '@type': 'Brand',
        name: 'M Gas',
      },
      offers: {
        '@type': 'Offer',
        url: `${baseUrl}/#products`,
        priceCurrency: 'USD',
        price: prod.unitPriceUsd || '45.00',
        availability: 'https://schema.org/InStock',
        seller: {
          '@type': 'Organization',
          name: SEO_CONFIG.organization.name,
        },
      },
    };
  });
}

export function generateFaqSchema(lang: LanguageCode) {
  const faqs = [
    {
      qFa: 'آیا کلیه سیلندرهای ام گاز دارای آزمون هیدرواستاتیک ۳۰ بار هستند؟',
      aFa: 'بله، ۱۰۰٪ سیلندرهای تولیدی در کارخانه ام گاز تحت آزمون فشار هیدرواستاتیک ۳۰ بار و تست نشت حباب زیر آب قرار می‌گیرند.',
      qEn: 'Are all M Gas cylinders tested with 30-bar hydrostatic proof pressure?',
      aEn: 'Yes, 100% of manufactured cylinders undergo 30-bar hydrostatic proof testing and underwater leak tests.',
    },
    {
      qFa: 'حداقل سفارش برای صادرات سیلندر گاز چقدر است؟',
      aFa: 'حداقل سفارش برای کانتینرهای صادراتی بسته به حجم سیلندر بین ۲۰۰ تا ۱۰۰۰ عدد متغیر است.',
      qEn: 'What is the minimum order quantity (MOQ) for cylinder export?',
      aEn: 'MOQ for export containers ranges between 200 and 1,000 units depending on cylinder volume.',
    },
    {
      qFa: 'آیا امکان سفارشی‌سازی رنگ کپسول با کدهای رال (RAL) وجود دارد؟',
      aFa: 'بله، خط رنگ الکترواستاتیک پودری کارخانه قابلیت اعمال تمامی ۲۰۰+ رنگ استاندارد رال را داراست.',
      qEn: 'Is custom RAL color powder coating available for cylinders?',
      aEn: 'Yes, our automated electrostatic coating line supports all 200+ RAL standard colors.',
    },
  ];

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: lang === 'fa' ? f.qFa : f.qEn,
      acceptedAnswer: {
        '@type': 'Answer',
        text: lang === 'fa' ? f.aFa : f.aEn,
      },
    })),
  };
}

export function generateArticleSchema(article: Article, lang: LanguageCode) {
  const baseUrl = getBaseUrlForLanguage(lang);
  const title = article.title[lang] || article.title.en || article.title.fa;
  const description = article.abstract[lang] || article.abstract.en || article.abstract.fa;

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
      '@type': 'Organization',
      name: SEO_CONFIG.organization.name,
      logo: {
        '@type': 'ImageObject',
        url: SEO_CONFIG.organization.logo,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}/#article=${article.slug}`,
    },
  };
}

export function generateAllArticlesSchema(lang: LanguageCode) {
  return TECHNICAL_ARTICLES.map((art) => generateArticleSchema(art, lang));
}
