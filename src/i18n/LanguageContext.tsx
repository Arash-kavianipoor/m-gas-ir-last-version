import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { LanguageCode, LanguageInfo } from '../types';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from './languages';
import { TRANSLATIONS, TranslationDictionary } from './translations';
import { detectVisitorLanguage, GeolocationResult } from '../utils/geolocation';
import {
  getLanguageFromHostname,
  isProductionMgas,
  buildSwitchLanguageUrl,
  getBaseUrlForLanguage,
  stripLangQueryParam,
} from '../utils/subdomains';

interface LanguageContextType {
  currentLanguage: LanguageCode;
  languageInfo: LanguageInfo;
  isRTL: boolean;
  t: TranslationDictionary;
  geoInfo: GeolocationResult | null;
  setLanguage: (lang: LanguageCode) => void;
  formatNumber: (num: number) => string;
  formatDimension: (val: number, unit?: string) => string;
  subdomainUrl: string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'mgas_selected_lang';
const MANUAL_LOCK_KEY = 'mgas_manual_lang_locked';

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [geoInfo, setGeoInfo] = useState<GeolocationResult | null>(null);

  const [currentLanguage, setCurrentLanguageState] = useState<LanguageCode>(() => {
    if (typeof window !== 'undefined') {
      // 1. Check if URL has an explicit ?lang query parameter
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const urlLang = urlParams.get('lang') as LanguageCode | null;
        if (urlLang && SUPPORTED_LANGUAGES[urlLang]) {
          localStorage.setItem(STORAGE_KEY, urlLang);
          localStorage.setItem(MANUAL_LOCK_KEY, 'true');
          // If lang is Persian (the default), clean the URL query to preserve canonical https://mgas.ir/
          if (urlLang === DEFAULT_LANGUAGE) {
            const cleanSearch = stripLangQueryParam(window.location.search);
            const cleanUrl = `${window.location.pathname}${cleanSearch}${window.location.hash}`;
            window.history.replaceState({}, '', cleanUrl);
          }
          return urlLang;
        }
      } catch {}

      // 2. Subdomain check in production (e.g. en.mgas.ir, ar.mgas.ir)
      const hostLang = getLanguageFromHostname(window.location.hostname);
      if (hostLang && SUPPORTED_LANGUAGES[hostLang]) {
        return hostLang;
      }

      // 3. User manual preference in localStorage if previously selected
      const isManual = localStorage.getItem(MANUAL_LOCK_KEY) === 'true';
      const saved = localStorage.getItem(STORAGE_KEY) as LanguageCode | null;
      if (isManual && saved && SUPPORTED_LANGUAGES[saved]) {
        return saved;
      }
    }
    return DEFAULT_LANGUAGE; // 'fa' (Canonical Persian on mgas.ir)
  });

  // Clean redundant '?lang=fa' query parameter on initial mount while preserving other languages
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('lang=fa')) {
      try {
        const cleanSearch = stripLangQueryParam(window.location.search);
        const cleanUrl = `${window.location.pathname}${cleanSearch}${window.location.hash}`;
        window.history.replaceState({}, '', cleanUrl);
      } catch {}
    }
  }, []);

  // Geolocation detection for informational badges (Strictly NO forced redirects or automatic content hijacking)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Detect visitor country for logistics estimation, but do NOT force-change language without user consent
    detectVisitorLanguage().then((result) => {
      setGeoInfo(result);
    });
  }, []);

  const languageInfo = useMemo(() => {
    return SUPPORTED_LANGUAGES[currentLanguage] || SUPPORTED_LANGUAGES[DEFAULT_LANGUAGE];
  }, [currentLanguage]);

  const isRTL = languageInfo.dir === 'rtl';

  const subdomainUrl = useMemo(() => {
    return getBaseUrlForLanguage(currentLanguage);
  }, [currentLanguage]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = languageInfo.code;
      document.documentElement.dir = languageInfo.dir;
      
      // Update language specific class names
      Object.keys(SUPPORTED_LANGUAGES).forEach((key) => {
        document.documentElement.classList.remove(`lang-${key}`);
      });
      document.documentElement.classList.add(`lang-${languageInfo.code}`);

      // Add or remove RTL class for CSS targeting
      if (isRTL) {
        document.documentElement.classList.add('rtl-layout');
        document.documentElement.classList.remove('ltr-layout');
      } else {
        document.documentElement.classList.add('ltr-layout');
        document.documentElement.classList.remove('rtl-layout');
      }
    }
  }, [languageInfo, isRTL]);

  const setLanguage = (lang: LanguageCode) => {
    if (SUPPORTED_LANGUAGES[lang]) {
      // 1. Update state immediately
      setCurrentLanguageState(lang);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, lang);
        localStorage.setItem(MANUAL_LOCK_KEY, 'true');

        // 2. In production, navigate to the dedicated language subdomain if configured
        const { url, shouldNavigate } = buildSwitchLanguageUrl(lang);
        if (shouldNavigate) {
          window.location.href = url;
          return;
        }

        // 3. For single-domain / preview / non-subdomain environments:
        // If switching to default Persian (fa), clean query parameter to keep pure canonical https://mgas.ir/
        // If switching to another language, set ?lang= parameter cleanly so refresh and direct access works!
        try {
          const params = new URLSearchParams(window.location.search);
          if (lang === DEFAULT_LANGUAGE) {
            params.delete('lang');
          } else {
            params.set('lang', lang);
          }
          const queryStr = params.toString() ? `?${params.toString()}` : '';
          const newUrl = `${window.location.pathname}${queryStr}${window.location.hash}`;
          window.history.pushState({}, '', newUrl);
        } catch {}
      }
    }
  };

  const t = useMemo(() => {
    return TRANSLATIONS[currentLanguage] || TRANSLATIONS[DEFAULT_LANGUAGE];
  }, [currentLanguage]);

  const formatNumber = (num: number): string => {
    try {
      return new Intl.NumberFormat(languageInfo.locale).format(num);
    } catch {
      return num.toString();
    }
  };

  const formatDimension = (val: number, unit?: string): string => {
    const formatted = formatNumber(val);
    return unit ? `${formatted} ${unit}` : formatted;
  };

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        languageInfo,
        isRTL,
        t,
        geoInfo,
        setLanguage,
        formatNumber,
        formatDimension,
        subdomainUrl,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
