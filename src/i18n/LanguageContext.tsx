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
      // 1. Highest Priority: Hostname-based subdomain in production (e.g. fa.mgas.ir, de.mgas.ir)
      const hostLang = getLanguageFromHostname(window.location.hostname);
      if (hostLang && SUPPORTED_LANGUAGES[hostLang]) {
        return hostLang;
      }

      // 2. Priority 2: Check localStorage user-selected language if manually locked
      const isManual = localStorage.getItem(MANUAL_LOCK_KEY) === 'true';
      const saved = localStorage.getItem(STORAGE_KEY) as LanguageCode | null;
      if (isManual && saved && SUPPORTED_LANGUAGES[saved]) {
        return saved;
      }

      // 3. Fallback: Check if URL had a legacy ?lang parameter, clean it up immediately
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const urlLang = urlParams.get('lang') as LanguageCode | null;
        if (urlLang && SUPPORTED_LANGUAGES[urlLang]) {
          localStorage.setItem(STORAGE_KEY, urlLang);
          // Strip ?lang query param from address bar so URL remains clean
          const cleanSearch = stripLangQueryParam(window.location.search);
          const cleanUrl = `${window.location.pathname}${cleanSearch}${window.location.hash}`;
          window.history.replaceState({}, '', cleanUrl);
          return urlLang;
        }
      } catch {}
    }
    return DEFAULT_LANGUAGE; // 'en' (Main domain: mgas.ir)
  });

  // Clean any legacy '?lang=' query parameter on initial mount to keep URLs pure
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('lang=')) {
      try {
        const cleanSearch = stripLangQueryParam(window.location.search);
        const cleanUrl = `${window.location.pathname}${cleanSearch}${window.location.hash}`;
        window.history.replaceState({}, '', cleanUrl);
      } catch {}
    }
  }, []);

  // Geolocation auto-detection on load & IP changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hostname = window.location.hostname;
    const isProd = isProductionMgas(hostname);
    const hostLang = getLanguageFromHostname(hostname);
    const isManualLocked = localStorage.getItem(MANUAL_LOCK_KEY) === 'true';

    // If user is already on an explicit language subdomain (e.g., fa.mgas.ir, de.mgas.ir, ur.mgas.ir),
    // they are specifically visiting that language portal. Do not redirect them elsewhere!
    if (isProd && hostLang && hostLang !== DEFAULT_LANGUAGE) {
      detectVisitorLanguage().then((res) => setGeoInfo(res));
      return;
    }

    // Run rapid multi-layer geolocation detection
    detectVisitorLanguage().then((result) => {
      setGeoInfo(result);

      if (result.detectedLanguage && SUPPORTED_LANGUAGES[result.detectedLanguage]) {
        // In dev, preview, or production:
        // Automatically switch language state if not manually locked by the user
        if (result.isNewIpDetected || (!isManualLocked && !hostLang)) {
          setCurrentLanguageState(result.detectedLanguage);
          localStorage.setItem(STORAGE_KEY, result.detectedLanguage);
        }
      }
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

        // 2. Clean URL: strip any '?lang=' query parameters
        const cleanSearch = stripLangQueryParam(window.location.search);

        // 3. Navigate to the dedicated language subdomain on production (e.g. fa.mgas.ir, de.mgas.ir, mgas.ir)
        const { url, shouldNavigate } = buildSwitchLanguageUrl(lang);
        if (shouldNavigate) {
          window.location.href = url;
          return;
        }

        // On preview/dev environments or same-subdomain, keep URL pure without query strings
        try {
          const cleanUrl = `${window.location.pathname}${cleanSearch}${window.location.hash}`;
          window.history.replaceState({}, '', cleanUrl);
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
