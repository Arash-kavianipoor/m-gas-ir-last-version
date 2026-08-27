import React, { useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { SEO_CONFIG } from './config';
import { SUPPORTED_LANGUAGES } from '../i18n/languages';
import {
  generateOrganizationSchema,
  generateWebSiteSchema,
  generateBreadcrumbSchema,
  generateVideosSchema,
  generateProductsSchema,
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

    const langConfig = SEO_CONFIG.languages[currentLanguage] || SEO_CONFIG.languages.fa;
    const baseSiteUrl = SEO_CONFIG.siteUrl;

    const currentUrl = activeArticle
      ? `${baseSiteUrl}/?lang=${currentLanguage}#article=${activeArticle.slug}`
      : `${baseSiteUrl}/?lang=${currentLanguage}`;

    const pageTitle = activeArticle
      ? `${activeArticle.title[currentLanguage] || activeArticle.title.fa} | ${SEO_CONFIG.siteName}`
      : langConfig.title;

    const pageDescription = activeArticle
      ? activeArticle.abstract[currentLanguage] || activeArticle.abstract.fa
      : langConfig.description;

    const pageKeywords = activeArticle
      ? (activeArticle.tags[currentLanguage] || activeArticle.tags.fa || []).join(', ')
      : langConfig.keywords;

    const pageOgImage = activeArticle?.coverImage
      ? `${baseSiteUrl}${activeArticle.coverImage}`
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
    setMetaTag('name', 'publisher', 'https://mgas.ir');

    // Canonical Link
    setLinkTag('canonical', currentUrl);

    // Hreflang Multi-language Alternate Links
    Object.keys(SUPPORTED_LANGUAGES).forEach((langKey) => {
      const code = langKey as LanguageCode;
      const targetUrl = activeArticle
        ? `${baseSiteUrl}/?lang=${code}#article=${activeArticle.slug}`
        : `${baseSiteUrl}/?lang=${code}`;
      setLinkTag('alternate', targetUrl, code);
    });
    // x-default hreflang pointing to canonical site origin
    setLinkTag(
      'alternate',
      activeArticle ? `${baseSiteUrl}/#article=${activeArticle.slug}` : `${baseSiteUrl}/`,
      'x-default'
    );

    // Open Graph Metadata
    setMetaTag('property', 'og:title', pageTitle);
    setMetaTag('property', 'og:description', pageDescription);
    setMetaTag('property', 'og:url', currentUrl);
    setMetaTag('property', 'og:type', activeArticle ? 'article' : 'website');
    setMetaTag('property', 'og:locale', langConfig.locale);
    setMetaTag('property', 'og:site_name', SEO_CONFIG.siteName);
    setMetaTag('property', 'og:image', pageOgImage);
    setMetaTag('property', 'og:image:width', String(SEO_CONFIG.defaultOgImageWidth));
    setMetaTag('property', 'og:image:height', String(SEO_CONFIG.defaultOgImageHeight));
    setMetaTag('property', 'og:image:alt', pageTitle);

    if (activeArticle) {
      setMetaTag('property', 'article:published_time', activeArticle.publishDate);
      setMetaTag('property', 'article:modified_time', activeArticle.modifyDate);
      setMetaTag('property', 'article:author', 'Mousa Amooie & M Gas Technical Directorate');
      setMetaTag('property', 'article:section', activeArticle.category[currentLanguage] || activeArticle.category.fa);
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
      { id: 'schema-website', data: generateWebSiteSchema(currentLanguage) },
      { id: 'schema-breadcrumbs', data: generateBreadcrumbSchema(currentLanguage, activeArticle || undefined) },
      { id: 'schema-videos', data: generateVideosSchema(currentLanguage) },
      { id: 'schema-products', data: generateProductsSchema(currentLanguage) },
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

