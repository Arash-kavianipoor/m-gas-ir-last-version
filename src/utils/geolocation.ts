import { LanguageCode } from '../types';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from '../i18n/languages';

// Comprehensive Country ISO2 code to LanguageCode mapping
export const COUNTRY_TO_LANGUAGE: Record<string, LanguageCode> = {
  // Persian / Farsi (fa)
  IR: 'fa', // Iran
  AF: 'fa', // Afghanistan
  TJ: 'fa', // Tajikistan

  // Arabic (ar) - Middle East & North Africa
  SA: 'ar', // Saudi Arabia
  AE: 'ar', // United Arab Emirates
  IQ: 'ar', // Iraq
  KW: 'ar', // Kuwait
  QA: 'ar', // Qatar
  OM: 'ar', // Oman
  BH: 'ar', // Bahrain
  EG: 'ar', // Egypt
  JO: 'ar', // Jordan
  LB: 'ar', // Lebanon
  SY: 'ar', // Syria
  YE: 'ar', // Yemen
  DZ: 'ar', // Algeria
  MA: 'ar', // Morocco
  TN: 'ar', // Tunisia
  LY: 'ar', // Libya
  SD: 'ar', // Sudan
  PS: 'ar', // Palestine
  SO: 'ar', // Somalia
  MR: 'ar', // Mauritania

  // Turkish (tr) - Turkey & Turkic regions
  TR: 'tr', // Turkey
  AZ: 'tr', // Azerbaijan (Turkic)
  CY: 'tr', // Cyprus
  TM: 'tr', // Turkmenistan

  // Russian / CIS region (ru)
  RU: 'ru', // Russia
  BY: 'ru', // Belarus
  KZ: 'ru', // Kazakhstan
  KG: 'ru', // Kyrgyzstan
  UZ: 'ru', // Uzbekistan
  UA: 'ru', // Ukraine
  MD: 'ru', // Moldova

  // German (de) - DACH region
  DE: 'de', // Germany
  AT: 'de', // Austria
  CH: 'de', // Switzerland
  LI: 'de', // Liechtenstein
  LU: 'de', // Luxembourg

  // Urdu (ur) - South Asia
  PK: 'ur', // Pakistan
  IN: 'ur', // India

  // Armenian (hy) - Caucasus
  AM: 'hy', // Armenia
  GE: 'hy', // Georgia

  // English (en) - Western & International default
  US: 'en', // United States
  GB: 'en', // United Kingdom
  CA: 'en', // Canada
  AU: 'en', // Australia
  NZ: 'en', // New Zealand
  IE: 'en', // Ireland
  ZA: 'en', // South Africa
  SG: 'en', // Singapore
  MY: 'en', // Malaysia
  NL: 'en', // Netherlands
  SE: 'en', // Sweden
  NO: 'en', // Norway
  DK: 'en', // Denmark
  FI: 'en', // Finland
  BE: 'en', // Belgium
  FR: 'en', // France
  ES: 'en', // Spain
  IT: 'en', // Italy
  PT: 'en', // Portugal
  BR: 'en', // Brazil
  MX: 'en', // Mexico
  JP: 'en', // Japan
  KR: 'en', // South Korea
  CN: 'en', // China
};

// Fallback Timezone to Language mapping
export const TIMEZONE_TO_LANGUAGE: Record<string, LanguageCode> = {
  'Asia/Tehran': 'fa',
  'Asia/Kabul': 'fa',
  'Asia/Dushanbe': 'fa',
  'Asia/Riyadh': 'ar',
  'Asia/Dubai': 'ar',
  'Asia/Baghdad': 'ar',
  'Asia/Kuwait': 'ar',
  'Asia/Qatar': 'ar',
  'Asia/Muscat': 'ar',
  'Asia/Bahrain': 'ar',
  'Asia/Amman': 'ar',
  'Asia/Beirut': 'ar',
  'Asia/Damascus': 'ar',
  'Africa/Cairo': 'ar',
  'Africa/Casablanca': 'ar',
  'Africa/Algiers': 'ar',
  'Africa/Tunis': 'ar',
  'Africa/Tripoli': 'ar',
  'Africa/Khartoum': 'ar',
  'Europe/Istanbul': 'tr',
  'Asia/Baku': 'tr',
  'Europe/Moscow': 'ru',
  'Europe/Minsk': 'ru',
  'Asia/Almaty': 'ru',
  'Asia/Tashkent': 'ru',
  'Asia/Bishkek': 'ru',
  'Asia/Ashgabat': 'ru',
  'Europe/Berlin': 'de',
  'Europe/Vienna': 'de',
  'Europe/Zurich': 'de',
  'Asia/Karachi': 'ur',
  'Asia/Kolkata': 'ur',
  'Asia/Yerevan': 'hy',
  'Asia/Tbilisi': 'hy',
  'America/New_York': 'en',
  'America/Chicago': 'en',
  'America/Los_Angeles': 'en',
  'America/Toronto': 'en',
  'Europe/London': 'en',
  'Australia/Sydney': 'en',
};

export interface GeolocationResult {
  ip?: string;
  countryCode: string | null;
  countryName: string | null;
  detectedLanguage: LanguageCode;
  source: 'ip_api' | 'timezone' | 'navigator' | 'default';
  isAutoApplied?: boolean;
}

const CACHE_KEY = 'mgas_geo_cache';

/**
 * Multi-layer GeoIP Detection:
 * Layer 1: Fast IP Lookup service 1 (api.country.is)
 * Layer 2: Secondary IP Lookup fallback (ipapi.co or ip-api / ipwho.is)
 * Layer 3: System Timezone mapping
 * Layer 4: Browser navigator.language
 * Layer 5: Default (fa)
 */
export async function detectVisitorLanguage(): Promise<GeolocationResult> {
  // Check session cache first
  if (typeof window !== 'undefined') {
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as GeolocationResult;
        if (parsed.detectedLanguage && SUPPORTED_LANGUAGES[parsed.detectedLanguage]) {
          return parsed;
        }
      }
    } catch {}
  }

  // 1. Primary: Fast IP Geolocation with Promise.race & timeout
  try {
    const fetchCountryIs = async (): Promise<string | null> => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      try {
        const res = await fetch('https://api.country.is', {
          signal: controller.signal,
          headers: { Accept: 'application/json' },
        });
        clearTimeout(timeoutId);
        if (res.ok) {
          const data = await res.json();
          return (data.country || '').toUpperCase() || null;
        }
      } catch {
        clearTimeout(timeoutId);
      }
      return null;
    };

    const fetchIpWhoIs = async (): Promise<string | null> => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      try {
        const res = await fetch('https://ipwho.is/?fields=country_code', {
          signal: controller.signal,
          headers: { Accept: 'application/json' },
        });
        clearTimeout(timeoutId);
        if (res.ok) {
          const data = await res.json();
          return (data.country_code || '').toUpperCase() || null;
        }
      } catch {
        clearTimeout(timeoutId);
      }
      return null;
    };

    // Try primary, then secondary
    let countryCode = await fetchCountryIs();
    if (!countryCode) {
      countryCode = await fetchIpWhoIs();
    }

    if (countryCode) {
      const matchedLang = COUNTRY_TO_LANGUAGE[countryCode] || 'en';
      const result: GeolocationResult = {
        countryCode,
        countryName: countryCode,
        detectedLanguage: matchedLang,
        source: 'ip_api',
        isAutoApplied: true,
      };

      try {
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(result));
      } catch {}
      return result;
    }
  } catch {}

  // 2. Secondary Fallback: System Timezone inference
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz && TIMEZONE_TO_LANGUAGE[tz]) {
      const result: GeolocationResult = {
        countryCode: null,
        countryName: tz,
        detectedLanguage: TIMEZONE_TO_LANGUAGE[tz],
        source: 'timezone',
        isAutoApplied: true,
      };
      return result;
    }
  } catch {}

  // 3. Fallback: Browser navigator.language
  try {
    if (typeof navigator !== 'undefined' && navigator.language) {
      const navLang = navigator.language.split('-')[0].toLowerCase() as LanguageCode;
      if (SUPPORTED_LANGUAGES[navLang]) {
        return {
          countryCode: null,
          countryName: navigator.language,
          detectedLanguage: navLang,
          source: 'navigator',
          isAutoApplied: true,
        };
      }
    }
  } catch {}

  // 4. Default: Persian ('fa')
  return {
    countryCode: 'IR',
    countryName: 'Iran',
    detectedLanguage: DEFAULT_LANGUAGE,
    source: 'default',
    isAutoApplied: false,
  };
}
