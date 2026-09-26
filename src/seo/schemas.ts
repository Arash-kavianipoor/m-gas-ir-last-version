import { SEO_CONFIG } from './config';
import { LanguageCode } from '../types';
import { PRODUCTS } from '../data/products';
import { FACTORY_VIDEOS } from '../data/factoryVideos';
import { TECHNICAL_ARTICLES, Article } from '../data/articles';
import { COMPANY_INFO } from '../data/company';

export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    ...SEO_CONFIG.organization,
  };
}

export function generateLocalBusinessSchema(currentLang: LanguageCode) {
  const isFa = currentLang === 'fa';
  const langConfig = SEO_CONFIG.languages[currentLang] || SEO_CONFIG.languages.fa;

  return {
    '@context': 'https://schema.org',
    '@type': 'AutomotiveBusiness',
    additionalType: ['https://schema.org/Manufacturer', 'https://schema.org/Factory'],
    name: SEO_CONFIG.siteName,
    alternateName: ['ام گاز', 'M Gas', 'M Gas Cylinder Factory', 'کارخانه ام گاز'],
    description: langConfig.description,
    url: SEO_CONFIG.siteUrl,
    logo: SEO_CONFIG.organization.logo,
    image: [
      `${SEO_CONFIG.siteUrl}/founder/mousa-amooie-inspection.png`,
      `${SEO_CONFIG.siteUrl}/factory/tour-1.png`,
      `${SEO_CONFIG.siteUrl}/logo/new-logo-mgas-2.png`,
    ],
    telephone: COMPANY_INFO.contacts.domesticDirector.landlineDisplay,
    email: COMPANY_INFO.emails.sales,
    priceRange: '$$$',
    currenciesAccepted: 'USD, EUR, IRR, AED',
    paymentAccepted: 'Cash, Credit Card, Wire Transfer, LC',
    foundingDate: '1970-03-21',
    founder: {
      '@type': 'Person',
      name: 'Mousa Amooie',
      alternateName: 'موسی عمویی',
      jobTitle: 'Managing Director & Founder',
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: COMPANY_INFO.address.fullPersian,
      addressLocality: 'Karaj',
      addressRegion: 'Alborz Province',
      postalCode: '31686',
      addressCountry: 'IR',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: COMPANY_INFO.address.coordinates.lat,
      longitude: COMPANY_INFO.address.coordinates.lng,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
        opens: '07:30',
        closes: '18:00',
      },
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '128',
      bestRating: '5',
      worstRating: '1',
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: isFa ? 'کاتالوگ سیلندرها و کپسول‌های گاز مایع' : 'LPG Gas Cylinders & Tanks Catalog',
      itemListElement: PRODUCTS.map((p, idx) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Product',
          name: p.locales[currentLang]?.name || p.locales.fa.name,
          sku: p.id,
        },
        position: idx + 1,
      })),
    },
  };
}

export function generateWebSiteSchema(currentLang: LanguageCode) {
  const langConfig = SEO_CONFIG.languages[currentLang] || SEO_CONFIG.languages.fa;

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SEO_CONFIG.siteName,
    alternateName: ['M Gas Cylinders', 'ام گاز', 'کارخانه کپسول گاز ام گاز'],
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
        urlTemplate: `${SEO_CONFIG.siteUrl}/?search={search_term_string}&lang=${currentLang}`,
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
    {
      '@type': 'ListItem',
      position: 5,
      name: isFa ? 'پرسش‌های متداول و آزمون ۳۰ بار' : 'Knowledge Base & FAQ',
      item: `${SEO_CONFIG.siteUrl}/?lang=${currentLang}#faq`,
    },
  ];

  if (activeArticle) {
    baseItems.push({
      '@type': 'ListItem',
      position: 6,
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
      manufacturer: {
        '@type': 'Organization',
        name: SEO_CONFIG.organization.name,
      },
      category: product.category,
      material: product.material,
      height: `${product.heightCm} cm`,
      weight: `${product.emptyWeightKg} kg`,
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        reviewCount: '45',
      },
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

export function generateFaqSchema(currentLang: LanguageCode) {
  const isFa = currentLang === 'fa';

  const faqs = [
    {
      q: isFa
        ? 'فرآیند تولید و استانداردهای متالورژی کپسول‌های گاز ام گاز چگونه است؟'
        : 'What is the manufacturing process and metallurgical standard of M-Gas LPG cylinders?',
      a: isFa
        ? 'کپسول‌های ام گاز از ورق‌های فولادی میکروآلیاژی با استحکام کششی بالا (استاندارد HP295 / SG295) با ضخامت مهندسی‌شده تولید می‌شوند. خط تولید شامل پرس‌های کشش عمیق خودکار، جوشکاری رباتیک زیرپودری، کوره عملیات حرارتی نرمالایزینگ در دمای ۹۰۰+ درجه سانتی‌گراد، و شات‌بلاست تمام‌اتوماتیک است.'
        : 'M-Gas cylinders are manufactured from specialized high-tensile micro-alloyed steel sheets (HP295 / SG295 standard). The production line utilizes automated multi-stage deep drawing presses, robotic submerged-arc seam welding, continuous normalizing heat-treatment furnaces (at 900°C+), and automated shot blasting.',
    },
    {
      q: isFa
        ? 'آزمون‌های کنترل کیفیت و تست فشار هیدرواستاتیک در چه مراحلی انجام می‌شود؟'
        : 'What quality control and hydrostatic pressure testing procedures are conducted?',
      a: isFa
        ? '۱۰۰٪ سیلندرهای تولیدی پیش از خروج از خط تولید تحت آزمون فشار هیدرواستاتیک ۳۰ الی ۳۴ بار در حمام تست ویژه قرار می‌گیرند. علاوه بر این، تست رادیوگرافی X-Ray درز جوش و آزمون متلاشی‌شدن Burst Test با مقاومت بیش از ۸۵ بار به صورت تصادفی انجام می‌شود.'
        : '100% of manufactured cylinders undergo strict hydrostatic pressure testing at 30 to 34 Bar (over 2x the standard working pressure). Additionally, radiographic X-ray weld inspection and hydraulic burst testing (>85 Bar limit) are systematically performed.',
    },
    {
      q: isFa
        ? 'مجتمع کارخانجات ام گاز دارای چه سرتیفیکیت‌ها و استانداردهای بین‌المللی است؟'
        : 'Which international certifications and regulatory standards does M-Gas hold?',
      a: isFa
        ? 'کارخانه ام گاز دارنده گواهینامه رسمی مدیریت کیفیت ISO 9001:2015، تاییدیه استاندارد ملی ایران (ISIRI 841 و ISIRI 6734)، و انطباق کامل با استاندارد اروپایی EN 1442 و الزامات DOT-4BA/4BW است.'
        : 'M-Gas holds ISO 9001:2015 Quality Management certification, compliance with European Standard EN 1442, and alignment with DOT-4BA/4BW specifications.',
    },
    {
      q: isFa
        ? 'ظرفیت بارگیری در کانتینرهای ۲۰ و ۴۰ فوت صادراتی و شرایط حمل چگونه است؟'
        : 'What are the container loading capacities (20ft & 40ft HQ) and international shipping terms?',
      a: isFa
        ? 'سیلندرها بر روی پالت‌های چوبی ضدعفونی‌شده یا به صورت چیدمان بار فله با توری‌های محافظ پلی‌اتیلنی بسته‌بندی می‌شوند. کانتینر ۲۰ فوت بین ۹۰۰ تا ۱۲۰۰ عدد و کانتینر ۴۰ فوت های‌کیوب تا بیش از ۲۴۰۰ عدد کپسول بارگیری می‌کند. تحویل به صورت FOB یا CIF بنادر مقصد انجام می‌شود.'
        : 'Cylinders are packed on fumigated pallets or bulk-stowed with protective netting. A 20ft container holds approx. 900-1,200 units, while a 40ft HQ container accommodates up to 2,400+ units. Shipments available under FOB or CIF terms.',
    },
  ];

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.a,
      },
    })),
  };
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


