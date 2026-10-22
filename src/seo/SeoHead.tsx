import React, { useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { SEO_CONFIG, TARGET_SEO_PHRASES } from './config';
import { SUPPORTED_LANGUAGES } from '../i18n/languages';
import {
  getBaseUrlForLanguage,
  getDomainForLanguage,
  ROOT_URL,
} from '../utils/subdomains';
import {
  generateOrganizationSchema,
  generateLocalBusinessSchema,
  generateWebSiteSchema,
  generateBreadcrumbSchema,
  generateVideosSchema,
  generateProductsSchema,
  generateSingleProductSchema,
  generateFaqSchema,
  generateArticleSchema,
  generateAllArticlesSchema,
  generateCoreCompetenciesSchema,
} from './schemas';
import { LanguageCode, Product } from '../types';
import { Article } from '../data/articles';

interface SectionSeoItem {
  title: Record<string, string>;
  description: Record<string, string>;
}

const MENU_SECTIONS_SEO: Record<string, SectionSeoItem> = {
  products: {
    title: {
      fa: 'کاتالوگ و مشخصات فنی کپسول و سیلندر گاز مایع LPG | ام گاز',
      en: 'LPG Gas Cylinders Catalog & Technical Specifications | M Gas',
      ar: 'كتالوج ومواصفات أسطوانات غاز البترول المسال LPG | إم غاز',
      de: 'LPG Gasflaschen Katalog & Technische Daten | M Gas',
      ur: 'ایل پی جی گیس سلنڈرز کیٹلاگ اور تکنیکی خصوصیات | ایم گیس',
      tr: 'LPG Gaz Tüpleri Kataloğu ve Teknik Özellikleri | M Gas',
      ru: 'Каталог и характеристики баллонов для сжиженного газа LPG | M Gas',
      hy: 'LPG Գազի բալոնների կատալոգ և տեխնիկական բնութագրեր | M Gas',
    },
    description: {
      fa: 'مشاهده و بررسی کاتالوگ جامع ۱۳ مدل کپسول گاز مایع از ۰.۵ تا ۶۰ لیتری و مخازن اتوگاز خودرو با آزمون فشار ۳۰ بار در کارخانه ام گاز کرج.',
      en: 'Explore technical specifications for 13 LPG cylinder models (0.5L to 60L) and automotive auto tanks manufactured under strict 30-bar pressure tests at M Gas.',
      ar: 'استكشف مواصفات ۱۳ طرازاً من أسطوانات الغاز المسال من ۰.۵ لتر إلى ۶۰ لتراً وخزانات السيارات بموجب اختبار ضغط ۳۰ بار.',
    },
  },
  quality: {
    title: {
      fa: 'فرآیند کنترل کیفیت، استانداردها و تست هیدرواستاتیک ۳۰ بار | ام گاز',
      en: 'Quality Assurance, Standards & 30-Bar Hydrostatic Testing | M Gas',
      ar: 'ضمان الجودة والمعايير واختبار الضغط ۳۰ بار | إم غاز',
      de: 'Qualitätssicherung, Normen & 30-Bar hydrostatischer Drucktest | M Gas',
      ur: 'کوالٹی کنٹرول، معیارات اور ۳۰ بار ہائیڈروسٹیٹک ٹیسٹنگ | ایم گیس',
      tr: 'Kalite Güvencesi, Standartlar ve 30 Bar Hidrostatik Test | M Gas',
      ru: 'Контроль качества, стандарты и гидростатические испытания 30 бар | M Gas',
      hy: 'Որակի վերահսկողություն, ստանդարտներ և 30 բար հիդրոստատիկ փորձարկում | M Gas',
    },
    description: {
      fa: 'فرآیند تضمین کیفیت سیلندرهای LPG ام گاز: کشش عمیق هیدرولیک، جوشکاری اتوماتیک زیرپودری SAW، تنش‌زدایی کوره و تست هیدرواستاتیک ۱۰۰٪ با ۳۰ بار فشار.',
      en: 'Comprehensive M Gas quality control: deep drawing hydraulic press, automated SAW submerged arc welding, heat treatment, 100% 30-bar hydrostatic proof test.',
      ar: 'إجراءات مراقبة الجودة الشاملة في مصنع إم غاز: اللحام القوسي المغمور الآلي، والمعالجة الحرارية، واختبار الضغط الهيدروستاتيكي بنسبة ۱۰۰٪ عند ۳۰ بار.',
    },
  },
  'factory-tour': {
    title: {
      fa: 'مستند ویدئویی و تور خطوط تولید کارخانه ام گاز | مدیریت موسی عمویی',
      en: 'Factory Video Tour & Production Lines Documentary | M Gas',
      ar: 'جولة فيديو وثائقية لخطوط الإنتاج في مصنع إم غاز',
      de: 'Fabrik-Videorundgang & Dokumentation der Produktionslinien | M Gas',
      ur: 'فیکٹری ویڈیو ٹور اور پروڈکشن لائنز | ایم گیس',
      tr: 'Fabrika Video Turu ve Üretim Hatları | M Gas',
      ru: 'Видеоэкскурсия по заводу и производственным линиям | M Gas',
      hy: 'Գործարանի վիդեո շրջայց և արտադրական գծեր | M Gas',
    },
    description: {
      fa: 'مشاهده مستند ویدئویی خطوط تولید کپسول گاز مایع و نظارت مستقیم آقای موسی عمویی مدیر و بنیانگذار کارخانه ام گاز.',
      en: 'Watch authentic high-definition video footage of LPG cylinder manufacturing lines and automated testing led by Managing Director Mousa Amooie.',
      ar: 'شاهد لقطات فيديو أصلية لخطوط تصنيع أسطوانات غاز البترول المسال والاختبارات الآلية بقيادة المدير موسى عموئي.',
    },
  },
  articles: {
    title: {
      fa: 'مقالات مهندسی، متالورژی و استانداردهای کپسول گاز مایع | ام گاز',
      en: 'Engineering Articles & LPG Safety Standards Knowledge Base | M Gas',
      ar: 'مقالات هندسية ومعايير سلامة غاز البترول المسال | إم غاز',
      de: 'Fachartikel zu Ingenieurwesen & LPG-Sicherheitsnormen | M Gas',
      ur: 'انجینئرنگ مضامین اور ایل پی جی حفاظتی معیارات | ایم گیس',
      tr: 'Mühendislik Makaleleri ve LPG Güvenlik Standartları | M Gas',
      ru: 'Технические статьи по стандартам и безопасности баллонов LPG | M Gas',
      hy: 'Ինժեներական հոդվածներ և LPG անվտանգության ստանդարտներ | M Gas',
    },
    description: {
      fa: 'پایگاه مقالات تخصصی مهندسی ام گاز: متالورژی ورق‌های فولادی، استانداردهای بازرسی جوشکاری، NFPA 58 و ایمنی انبارش و حمل سیلندرهای گاز.',
      en: 'Technical engineering publications covering LPG metallurgy, weld inspection protocols, NFPA 58, ISO standards, and pressurized storage safety.',
      ar: 'منشورات هندسية متخصصة تغطي متالورجيا غاز البترول المسال وفحص اللحام ومعايير NFPA 58 وإرشادات تخزين الأسطوانات.',
    },
  },
  history: {
    title: {
      fa: 'تاریخچه و سوابق ۵۰ ساله کارخانه ام گاز (تأسیس ۱۳۴۹) | مدیریت موسی عمویی',
      en: '50+ Years Heritage & Vision (Est. 1970) | M Gas Cylinder Co.',
      ar: 'أكثر من ۵۰ عاماً من الخبرة والريادة (تأسس ۱۹۷۰) | إم غاز',
      de: 'Über 50 Jahre Tradition & Vision (Gegr. 1970) | M Gas',
      ur: '۵۰ سال سے زائد تاریخ اور وژن (قیام ۱۹۷۰) | ایم گیس',
      tr: '50 Yılı Aşkın Köklü Geçmiş ve Vizyon (Kuruluş 1970) | M Gas',
      ru: 'Более 50 лет истории и традиций (Основан в 1970 г.) | M Gas',
      hy: 'Ավելի քան 50 տարվա փորձ և պատմություն (հիմնադրված 1970 թ.) | M Gas',
    },
    description: {
      fa: 'بیش از نیم قرن نوآوری در تولید کپسول گاز مایع از سال ۱۳۴۹ با مدیریت آقای موسی عمویی و صادرات گسترده به ۱۲+ کشور منطقه و خاورمیانه.',
      en: 'Half a century of manufacturing excellence since 1970 led by founder Mousa Amooie, exporting high-grade LPG cylinders to over 12 countries.',
      ar: 'نصف قرن من التميز في التصنيع منذ عام ۱۹۷۰ بقيادة المؤسس موسى عموئي والتصدير إلى أكثر من ۱۲ دولة حول العالم.',
    },
  },
  faq: {
    title: {
      fa: 'پرسش‌های متداول مشتریان کپسول و سیلندر گاز مایع | ام گاز',
      en: 'Frequently Asked Questions (FAQ) - LPG Cylinders & Export | M Gas',
      ar: 'الأسئلة الشائعة حول أسطوانات الغاز والتصدير | إم غاز',
      de: 'Häufig gestellte Fragen (FAQ) zu LPG-Gasflaschen & Export | M Gas',
      ur: 'اکثر پوچھے جانے والے سوالات (FAQ) - ایل پی جی سلنڈرز اور برآمدات | ایم گیس',
      tr: 'Sıkça Sorulan Sorular (SSS) - LPG Tüpleri ve İhracat | M Gas',
      ru: 'Часто задаваемые вопросы (FAQ) о баллонах LPG и экспорте | M Gas',
      hy: 'Հաճախակի տրվող հարցեր (FAQ) - LPG գազի բալոններ և արտահանում | M Gas',
    },
    description: {
      fa: 'پاسخ به تمام پرسش‌های متداول درباره ضخامت ورق سیلندر گاز، آزمون فشار ۳۰ بار، حداقل تعداد سفارش MOQ، ظرفیت کانتینر و رنگ سفارشی RAL.',
      en: 'Answers to frequently asked questions regarding cylinder steel grades, 30-bar pressure proofing, MOQ, shipping container capacity, and RAL color customization.',
      ar: 'إجابات على الأسئلة الشائعة حول درجات الفولاذ، واختبار الضغط ۳۰ بار، والحد الأدنى للطلب، وتخصيص ألوان RAL.',
    },
  },
  calculator: {
    title: {
      fa: 'محاسبه‌گر آنلاین استعلام قیمت و کانتینربندی صادراتی کپسول گاز | ام گاز',
      en: 'Online RFQ & Container Shipping Capacity Calculator | M Gas',
      ar: 'حاسبة عروض الأسعار وحمولة الحاويات للتصدير | إم غاز',
      de: 'Online-Preisanfrage & Containerkapazitätsrechner | M Gas',
      ur: 'آن لائن قیمت کیلکولیٹر اور کنٹینر شپنگ گنجائش | ایم گیس',
      tr: 'Online Fiyat Teklifi ve Konteyner Yükleme Hesaplayıcı | M Gas',
      ru: 'Онлайн калькулятор запроса цен и вместимости контейнеров | M Gas',
      hy: 'Առցանց գնառաջարկի և կոնտեյների բեռնման հաշվիչ | M Gas',
    },
    description: {
      fa: 'استعلام آنلاین و محاسبه تعداد کپسول در کانتینر ۲۰ و ۴۰ فوت، محاسبه وزن ناخالص و ارسال مستقیم پیش‌فاکتور به کارخانه ام گاز از طریق واتس‌اپ.',
      en: 'Interactive calculation tool for LPG cylinder wholesale volumes, 20ft & 40ft HQ container loading capacities, gross shipping weights, and instant RFQ dispatch.',
      ar: 'أداة تفاعلية لحساب أحجام الطلبات بالجملة وحمولة حاويات ۲۰ و ۴۰ قدماً وإرسال طلبات الأسعار الفورية مباشرة عبر واتساب.',
    },
  },
  contact: {
    title: {
      fa: 'تماس با کارخانه ام گاز، نشانی کرج و واحد فروش صادراتی',
      en: 'Contact Us, Karaj Factory Location & Export Directorate | M Gas',
      ar: 'اتصل بنا، موقع مصنع كرج وإدارة المبيعات والتصدير | إم غاز',
      de: 'Kontakt, Standort der Fabrik Karadsch & Exportabteilung | M Gas',
      ur: 'رابطہ، کرج فیکٹری کا پتہ اور برآمدی سیلز | ایم گیس',
      tr: 'İletişim, Kerec Fabrika Konumu ve İhracat Departmanı | M Gas',
      ru: 'Контакты, расположение завода в Карадже и отдел экспорта | M Gas',
      hy: 'Կապ, Քարաջի գործարանի հասցե և արտահանման բաժին | M Gas',
    },
    description: {
      fa: 'راه‌های ارتباط با کارخانه ام گاز در کرج: شماره تلفن‌های مستقیم، ساعات کاری، شماره واتس‌اپ مدیر فروش بین‌الملل و لوکیشن دقیق کارخانه.',
      en: 'Direct contact with M Gas factory management in Karaj, working hours, phone numbers, WhatsApp export desk, and Google Maps directions.',
      ar: 'تواصل مباشر مع إدارة مصنع إم غاز في كرج، وساعات العمل، وأرقام الهواتف، ومكتب التصدير عبر واتساب، وخريطة الموقع.',
    },
  },
  specifications: {
    title: {
      fa: 'مشخصات فنی و استانداردهای مهندسی انواع کپسول گاز مایع | ام گاز',
      en: 'Technical Specifications & Engineering Standards | M Gas Cylinders',
      ar: 'المواصفات الفنية والمخططات الهندسية لأسطوانات الغاز | إم غاز',
      de: 'Technische Spezifikationen & Konstruktionszeichnungen | M Gas',
      ur: 'تکنیکی خصوصیات اور انجینئرنگ نقشے | ایم گیس',
      tr: 'Teknik Özellikler ve Mühendislik Çizimleri | M Gas',
      ru: 'Технические характеристики и инженерные чертежи | M Gas',
      hy: 'Տեխնիկական բնութագրեր և ինժեներական գծագրեր | M Gas',
    },
    description: {
      fa: 'جدول کامل مشخصات فنی سیلندرهای گاز مایع ام گاز شامل ضخامت ورق، وزن، فشار کاری، فشار تست ۳۰ بار و نوع شیرآلات استاندارد.',
      en: 'Comprehensive technical specifications table including wall thickness, height, water capacity, test pressure limits, and valve standards for all LPG models.',
      ar: 'جدول المواصفات الفنية الشاملة لأسطوانات غاز البترول المسال بما في ذلك سمك الجدار والسعة وضغط الاختبار.',
    },
  },
};

interface SeoHeadProps {
  activeArticle?: Article | null;
  activeProduct?: Product | null;
  activeSection?: string | null;
}

export const SeoHead: React.FC<SeoHeadProps> = ({ activeArticle, activeProduct, activeSection }) => {
  const { currentLanguage, languageInfo } = useLanguage();

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const langConfig = SEO_CONFIG.languages[currentLanguage] || SEO_CONFIG.languages.fa;
    const targetPhrases = TARGET_SEO_PHRASES[currentLanguage] || TARGET_SEO_PHRASES.fa;
    const currentBaseUrl = getBaseUrlForLanguage(currentLanguage);

    let currentUrl = `${currentBaseUrl}/`;
    let pageTitle = langConfig.title;
    let pageDescription = langConfig.description;
    let pageOgImage = SEO_CONFIG.defaultImage;
    let ogType = 'website';

    if (activeProduct) {
      const loc = activeProduct.locales[currentLanguage] || activeProduct.locales.fa || activeProduct.locales.en;
      currentUrl = `${currentBaseUrl}/#product=${activeProduct.slug}`;
      pageTitle = `${loc.name} | ${currentLanguage === 'fa' ? 'ام گاز' : 'M Gas'}`;
      pageDescription = loc.seoDescription || loc.shortDescription;
      pageOgImage = `${SEO_CONFIG.siteUrl}${activeProduct.image}`;
      ogType = 'product';
    } else if (activeArticle) {
      currentUrl = `${currentBaseUrl}/#article=${activeArticle.slug}`;
      pageTitle = `${activeArticle.title[currentLanguage] || activeArticle.title.fa || activeArticle.title.en} | ${SEO_CONFIG.siteName}`;
      pageDescription = activeArticle.abstract[currentLanguage] || activeArticle.abstract.fa || activeArticle.abstract.en;
      pageOgImage = activeArticle.coverImage
        ? `${SEO_CONFIG.siteUrl}${activeArticle.coverImage}`
        : SEO_CONFIG.defaultImage;
      ogType = 'article';
    } else if (activeSection && activeSection !== 'hero' && MENU_SECTIONS_SEO[activeSection]) {
      const secMeta = MENU_SECTIONS_SEO[activeSection];
      currentUrl = `${currentBaseUrl}/#${activeSection}`;
      pageTitle = secMeta.title[currentLanguage] || secMeta.title.fa || secMeta.title.en || langConfig.title;
      pageDescription = secMeta.description[currentLanguage] || secMeta.description.fa || secMeta.description.en || langConfig.description;
      ogType = 'website';
    }

    // 1. Page Title
    document.title = pageTitle;

    // Helper to set or create meta tag
    const setMetaTag = (attrName: 'name' | 'property', attrValue: string, content: string) => {
      let meta = document.querySelector(`meta[${attrName}="${attrValue}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attrName, attrValue);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Helper to set or create link tag
    const setLinkTag = (rel: string, href: string, hreflang?: string) => {
      let selector = `link[rel="${rel}"]`;
      if (hreflang) {
        selector += `[hreflang="${hreflang}"]`;
      }
      let link = document.querySelector(selector);
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', rel);
        if (hreflang) {
          link.setAttribute('hreflang', hreflang);
        }
        document.head.appendChild(link);
      }
      link.setAttribute('href', href);
    };

    // Standard SEO Tags
    setMetaTag('name', 'description', pageDescription);
    setMetaTag('name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    setMetaTag('name', 'author', 'M Gas Cylinder Manufacturing Co. (Mousa Amooie)');

    // Ensure stale meta keywords tags are eliminated per Google SEO guidelines
    const existingKeywords = document.querySelector('meta[name="keywords"]');
    if (existingKeywords) {
      existingKeywords.remove();
    }

    // Canonical Link for this specific page state
    setLinkTag('canonical', currentUrl);

    // Hreflang Multi-language Alternate Links
    Object.keys(SUPPORTED_LANGUAGES).forEach((langKey) => {
      const code = langKey as LanguageCode;
      const info = SUPPORTED_LANGUAGES[code];
      const targetBase = getBaseUrlForLanguage(code);

      let targetUrl = `${targetBase}/`;
      if (activeProduct) {
        targetUrl = `${targetBase}/#product=${activeProduct.slug}`;
      } else if (activeArticle) {
        targetUrl = `${targetBase}/#article=${activeArticle.slug}`;
      } else if (activeSection && activeSection !== 'hero') {
        targetUrl = `${targetBase}/#${activeSection}`;
      }
      
      setLinkTag('alternate', targetUrl, code);

      if (info && info.locale && info.locale !== code) {
        setLinkTag('alternate', targetUrl, info.locale);
      }
    });

    // x-default hreflang pointing to canonical Persian root
    const xDefaultTarget = activeProduct
      ? `${ROOT_URL}/#product=${activeProduct.slug}`
      : activeArticle
      ? `${ROOT_URL}/#article=${activeArticle.slug}`
      : activeSection && activeSection !== 'hero'
      ? `${ROOT_URL}/#${activeSection}`
      : `${ROOT_URL}/`;
    setLinkTag('alternate', xDefaultTarget, 'x-default');

    // Open Graph Metadata
    setMetaTag('property', 'og:title', pageTitle);
    setMetaTag('property', 'og:description', pageDescription);
    setMetaTag('property', 'og:url', currentUrl);
    setMetaTag('property', 'og:type', ogType);
    setMetaTag('property', 'og:locale', langConfig.locale);
    setMetaTag('property', 'og:site_name', `${SEO_CONFIG.siteName}`);
    setMetaTag('property', 'og:image', pageOgImage);
    setMetaTag('property', 'og:image:width', String(SEO_CONFIG.defaultOgImageWidth));
    setMetaTag('property', 'og:image:height', String(SEO_CONFIG.defaultOgImageHeight));
    setMetaTag('property', 'og:image:alt', pageTitle);

    if (activeArticle) {
      setMetaTag('property', 'article:published_time', activeArticle.publishDate);
      setMetaTag('property', 'article:modified_time', activeArticle.modifyDate);
      setMetaTag('property', 'article:author', 'Mousa Amooie & M Gas Technical Directorate');
      setMetaTag('property', 'article:section', activeArticle.category[currentLanguage] || activeArticle.category.fa || activeArticle.category.en);
    }

    // Twitter Card Metadata
    setMetaTag('name', 'twitter:card', SEO_CONFIG.twitterCard);
    setMetaTag('name', 'twitter:site', SEO_CONFIG.twitterHandle);
    setMetaTag('name', 'twitter:title', pageTitle);
    setMetaTag('name', 'twitter:description', pageDescription);
    setMetaTag('name', 'twitter:image', pageOgImage);

    // HTML Lang & Dir
    document.documentElement.lang = languageInfo.code;
    document.documentElement.dir = languageInfo.dir;

    // Structured Data (JSON-LD) Injections
    const structuredDataScripts = [
      { id: 'schema-org', data: generateOrganizationSchema(currentLanguage) },
      { id: 'schema-localbusiness', data: generateLocalBusinessSchema(currentLanguage) },
      { id: 'schema-website', data: generateWebSiteSchema(currentLanguage) },
      { id: 'schema-core-competencies', data: generateCoreCompetenciesSchema(currentLanguage) },
      { id: 'schema-breadcrumbs', data: generateBreadcrumbSchema(currentLanguage, activeArticle, activeProduct, activeSection) },
      { id: 'schema-videos', data: generateVideosSchema(currentLanguage) },
      {
        id: 'schema-products',
        data: activeProduct
          ? generateSingleProductSchema(activeProduct, currentLanguage)
          : generateProductsSchema(currentLanguage),
      },
      { id: 'schema-faq', data: generateFaqSchema(currentLanguage) },
      {
        id: 'schema-articles',
        data: activeArticle
          ? generateArticleSchema(activeArticle, currentLanguage)
          : generateAllArticlesSchema(currentLanguage),
      },
    ];

    structuredDataScripts.forEach(({ id, data }) => {
      let script = document.getElementById(id) as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement('script');
        script.id = id;
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(data);
    });

  }, [currentLanguage, languageInfo, activeArticle, activeProduct, activeSection]);

  return null;
};
