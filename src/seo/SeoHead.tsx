import React, { useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { SEO_CONFIG } from './config';
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
  generateFaqSchema,
  generateArticleSchema,
  generateAllArticlesSchema,
} from './schemas';
import { LanguageCode } from '../types';
import { Article } from '../data/articles';

interface SeoHeadProps {
  activeArticle?: Article | null;
}

export const SeoHead: React.FC<SeoHeadProps> = ({ activeArticle }) => {
  const { currentLanguage, languageInfo } = useLanguage();

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const langConfig = SEO_CONFIG.languages[currentLanguage] || SEO_CONFIG.languages.en;
    const currentBaseUrl = getBaseUrlForLanguage(currentLanguage);

    const currentUrl = activeArticle
      ? `${currentBaseUrl}/#article=${activeArticle.slug}`
      : `${currentBaseUrl}/`;

    const pageTitle = activeArticle
      ? `${activeArticle.title[currentLanguage] || activeArticle.title.en || activeArticle.title.fa} | ${SEO_CONFIG.siteName}`
      : langConfig.title;

    const pageDescription = activeArticle
      ? activeArticle.abstract[currentLanguage] || activeArticle.abstract.en || activeArticle.abstract.fa
      : langConfig.description;

    const pageKeywords = activeArticle
      ? (activeArticle.tags[currentLanguage] || activeArticle.tags.en || activeArticle.tags.fa || []).join(', ')
      : langConfig.keywords;

    const pageOgImage = activeArticle?.coverImage
      ? `${SEO_CONFIG.siteUrl}${activeArticle.coverImage}`
      : SEO_CONFIG.defaultImage;

    // 1. Title & Primary Meta
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
    setMetaTag('name', 'keywords', pageKeywords);
    setMetaTag('name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    setMetaTag('name', 'author', 'M Gas Cylinder Manufacturing Co. (Mousa Amooie)');
    setMetaTag('name', 'publisher', currentBaseUrl);

    // Canonical Link for this specific subdomain
    setLinkTag('canonical', currentUrl);

    // Hreflang Multi-language Alternate Links with Subdomains
    Object.keys(SUPPORTED_LANGUAGES).forEach((langKey) => {
      const code = langKey as LanguageCode;
      const info = SUPPORTED_LANGUAGES[code];
      const targetBase = getBaseUrlForLanguage(code);
      const targetUrl = activeArticle
        ? `${targetBase}/#article=${activeArticle.slug}`
        : `${targetBase}/`;
      
      // Generic language code (e.g., "ur", "fa", "en")
      setLinkTag('alternate', targetUrl, code);

      // Regional locale variant (e.g., "ur-PK", "fa-IR", "en-US")
      if (info && info.locale && info.locale !== code) {
        setLinkTag('alternate', targetUrl, info.locale);
      }
    });

    // x-default hreflang pointing to the root English domain (mgas.ir)
    setLinkTag(
      'alternate',
      activeArticle ? `${ROOT_URL}/#article=${activeArticle.slug}` : `${ROOT_URL}/`,
      'x-default'
    );

    // Open Graph Metadata
    setMetaTag('property', 'og:title', pageTitle);
    setMetaTag('property', 'og:description', pageDescription);
    setMetaTag('property', 'og:url', currentUrl);
    setMetaTag('property', 'og:type', activeArticle ? 'article' : 'website');
    setMetaTag('property', 'og:locale', langConfig.locale);
    setMetaTag('property', 'og:site_name', `${SEO_CONFIG.siteName} (${getDomainForLanguage(currentLanguage)})`);
    setMetaTag('property', 'og:image', pageOgImage);
    setMetaTag('property', 'og:image:width', String(SEO_CONFIG.defaultOgImageWidth));
    setMetaTag('property', 'og:image:height', String(SEO_CONFIG.defaultOgImageHeight));
    setMetaTag('property', 'og:image:alt', pageTitle);

    // og:locale:alternate for other languages
    Object.keys(SUPPORTED_LANGUAGES).forEach((langKey) => {
      const code = langKey as LanguageCode;
      if (code !== currentLanguage) {
        const otherCfg = SEO_CONFIG.languages[code];
        if (otherCfg) {
          setMetaTag('property', `og:locale:alternate:${code}`, otherCfg.locale);
        }
      }
    });

    if (activeArticle) {
      setMetaTag('property', 'article:published_time', activeArticle.publishDate);
      setMetaTag('property', 'article:modified_time', activeArticle.modifyDate);
      setMetaTag('property', 'article:author', 'Mousa Amooie & M Gas Technical Directorate');
      setMetaTag('property', 'article:section', activeArticle.category[currentLanguage] || activeArticle.category.en || activeArticle.category.fa);
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
      { id: 'schema-org', data: generateOrganizationSchema() },
      { id: 'schema-localbusiness', data: generateLocalBusinessSchema(currentLanguage) },
      { id: 'schema-website', data: generateWebSiteSchema(currentLanguage) },
      { id: 'schema-breadcrumbs', data: generateBreadcrumbSchema(currentLanguage, activeArticle || undefined) },
      { id: 'schema-videos', data: generateVideosSchema(currentLanguage) },
      { id: 'schema-products', data: generateProductsSchema(currentLanguage) },
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

  }, [currentLanguage, languageInfo, activeArticle]);

  return null;
};
