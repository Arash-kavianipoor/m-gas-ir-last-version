import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { LanguageCode, LanguageInfo } from '../types';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from './languages';
import { TRANSLATIONS, TranslationDictionary } from './translations';
import { detectVisitorLanguage, GeolocationResult } from '../utils/geolocation';

interface LanguageContextType {
  currentLanguage: LanguageCode;
  languageInfo: LanguageInfo;
  isRTL: boolean;
  t: TranslationDictionary;
  geoInfo: GeolocationResult | null;
  setLanguage: (lang: LanguageCode) => void;
  formatNumber: (num: number) => string;
  formatDimension: (val: number, unit?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'mgas_selected_lang';

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [geoInfo, setGeoInfo] = useState<GeolocationResult | null>(null);

  const [currentLanguage, setCurrentLanguageState] = useState<LanguageCode>(() => {
    if (typeof window !== 'undefined') {
      // 1. Priority 1: Check URL query parameter '?lang=...'
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const urlLang = urlParams.get('lang') as LanguageCode | null;
        if (urlLang && SUPPORTED_LANGUAGES[urlLang]) {
          localStorage.setItem(STORAGE_KEY, urlLang);
          return urlLang;
        }
      } catch {}

      // 2. Priority 2: Check localStorage user-selected language
      const saved = localStorage.getItem(STORAGE_KEY) as LanguageCode | null;
      if (saved && SUPPORTED_LANGUAGES[saved]) {
        return saved;
      }
    }
    return DEFAULT_LANGUAGE;
  });

  // Geolocation auto-detection for first-time visitors (if no manual choice in localStorage and no URL param)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const saved = localStorage.getItem(STORAGE_KEY);
    const urlParams = new URLSearchParams(window.location.search);
    const hasUrlLang = urlParams.has('lang');

    // Run geolocation detection
    detectVisitorLanguage().then((result) => {
      setGeoInfo(result);

      // If user hasn't explicitly chosen a language yet and no url parameter exists
      if (!saved && !hasUrlLang && result.detectedLanguage) {
        setCurrentLanguageState(result.detectedLanguage);
        
        // Auto-sync query parameter or state
        try {
          const url = new URL(window.location.href);
          url.searchParams.set('lang', result.detectedLanguage);
          window.history.replaceState({}, '', url.toString());
        } catch {}
      }
    });
  }, []);

  const languageInfo = useMemo(() => {
    return SUPPORTED_LANGUAGES[currentLanguage] || SUPPORTED_LANGUAGES[DEFAULT_LANGUAGE];
  }, [currentLanguage]);

  const isRTL = languageInfo.dir === 'rtl';

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
      setCurrentLanguageState(lang);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, lang);
        
        // Optionally update URL query param without refreshing
        try {
          const url = new URL(window.location.href);
          url.searchParams.set('lang', lang);
          window.history.replaceState({}, '', url.toString());
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
