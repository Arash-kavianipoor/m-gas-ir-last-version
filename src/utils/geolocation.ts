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

  // Urdu (ur) - South Asia (Pakistan prioritized)
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
  source: 'cloudflare' | 'country_is' | 'ipwhois' | 'ipapi' | 'timezone' | 'navigator' | 'default';
  isAutoApplied?: boolean;
  isNewIpDetected?: boolean;
}

const LAST_DETECTED_IP_KEY = 'mgas_last_detected_ip';
const LAST_DETECTED_COUNTRY_KEY = 'mgas_last_detected_country';

/**
 * Multi-layer, ultra-fast GeoIP Detection:
 * Layer 1: Cloudflare trace (fastest, universally accessible, SSL, works behind any VPN)
 * Layer 2: api.country.is
 * Layer 3: ipwho.is
 * Layer 4: ipapi.co
 * Layer 5: Timezone inference
 * Layer 6: Browser navigator.language
 * Layer 7: Default (fa)
 */
export async function detectVisitorLanguage(forceRefresh = false): Promise<GeolocationResult> {
  const previousIp = typeof window !== 'undefined' ? localStorage.getItem(LAST_DETECTED_IP_KEY) : null;
  const previousCountry = typeof window !== 'undefined' ? localStorage.getItem(LAST_DETECTED_COUNTRY_KEY) : null;

  // Layer 1: Cloudflare Trace (extremely fast, zero rate limit, returns accurate edge IP and loc=XX)
  try {
    const cfController = new AbortController();
    const cfTimeout = setTimeout(() => cfController.abort(), 2500);
    const cfRes = await fetch('https://www.cloudflare.com/cdn-cgi/trace', {
      signal: cfController.signal,
      cache: 'no-store',
    });
    clearTimeout(cfTimeout);
    
    if (cfRes.ok) {
      const text = await cfRes.text();
      const lines = text.split('\n');
      const data: Record<string, string> = {};
      lines.forEach((line) => {
        const [k, v] = line.split('=');
        if (k && v) data[k.trim()] = v.trim();
      });

      const countryCode = (data.loc || '').toUpperCase();
      const currentIp = data.ip || '';

      if (countryCode && countryCode !== 'XX') {
        const matchedLang = COUNTRY_TO_LANGUAGE[countryCode] || 'en';
        const isNewIp = Boolean(previousIp && previousIp !== currentIp) || Boolean(previousCountry && previousCountry !== countryCode);

        if (typeof window !== 'undefined') {
          localStorage.setItem(LAST_DETECTED_IP_KEY, currentIp);
          localStorage.setItem(LAST_DETECTED_COUNTRY_KEY, countryCode);
        }

        return {
          ip: currentIp,
          countryCode,
          countryName: countryCode,
          detectedLanguage: matchedLang,
          source: 'cloudflare',
          isAutoApplied: true,
          isNewIpDetected: isNewIp,
        };
      }
    }
  } catch {}

  // Layer 2: api.country.is
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch('https://api.country.is', {
      signal: controller.signal,
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      const countryCode = (data.country || '').toUpperCase();
      const currentIp = data.ip || '';
      if (countryCode) {
        const matchedLang = COUNTRY_TO_LANGUAGE[countryCode] || 'en';
        const isNewIp = Boolean(previousIp && previousIp !== currentIp) || Boolean(previousCountry && previousCountry !== countryCode);

        if (typeof window !== 'undefined') {
          localStorage.setItem(LAST_DETECTED_IP_KEY, currentIp);
          localStorage.setItem(LAST_DETECTED_COUNTRY_KEY, countryCode);
        }

        return {
          ip: currentIp,
          countryCode,
          countryName: countryCode,
          detectedLanguage: matchedLang,
          source: 'country_is',
          isAutoApplied: true,
          isNewIpDetected: isNewIp,
        };
      }
    }
  } catch {}

  // Layer 3: ipwho.is
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch('https://ipwho.is/', {
      signal: controller.signal,
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      const countryCode = (data.country_code || '').toUpperCase();
      const currentIp = data.ip || '';
      const countryName = data.country || countryCode;
      if (countryCode) {
        const matchedLang = COUNTRY_TO_LANGUAGE[countryCode] || 'en';
        const isNewIp = Boolean(previousIp && previousIp !== currentIp) || Boolean(previousCountry && previousCountry !== countryCode);

        if (typeof window !== 'undefined') {
          localStorage.setItem(LAST_DETECTED_IP_KEY, currentIp);
          localStorage.setItem(LAST_DETECTED_COUNTRY_KEY, countryCode);
        }

        return {
          ip: currentIp,
          countryCode,
          countryName,
          detectedLanguage: matchedLang,
          source: 'ipwhois',
          isAutoApplied: true,
          isNewIpDetected: isNewIp,
        };
      }
    }
  } catch {}

  // Layer 4: ipapi.co
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch('https://ipapi.co/json/', {
      signal: controller.signal,
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      const countryCode = (data.country_code || '').toUpperCase();
      const currentIp = data.ip || '';
      const countryName = data.country_name || countryCode;
      if (countryCode) {
        const matchedLang = COUNTRY_TO_LANGUAGE[countryCode] || 'en';
        const isNewIp = Boolean(previousIp && previousIp !== currentIp) || Boolean(previousCountry && previousCountry !== countryCode);

        if (typeof window !== 'undefined') {
          localStorage.setItem(LAST_DETECTED_IP_KEY, currentIp);
          localStorage.setItem(LAST_DETECTED_COUNTRY_KEY, countryCode);
        }

        return {
          ip: currentIp,
          countryCode,
          countryName,
          detectedLanguage: matchedLang,
          source: 'ipapi',
          isAutoApplied: true,
          isNewIpDetected: isNewIp,
        };
      }
    }
  } catch {}

  // Layer 5: Timezone inference fallback
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz && TIMEZONE_TO_LANGUAGE[tz]) {
      return {
        countryCode: null,
        countryName: tz,
        detectedLanguage: TIMEZONE_TO_LANGUAGE[tz],
        source: 'timezone',
        isAutoApplied: true,
        isNewIpDetected: false,
      };
    }
  } catch {}

  // Layer 6: Browser navigator.language fallback
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
          isNewIpDetected: false,
        };
      }
    }
  } catch {}

  // Default: Persian ('fa')
  return {
    countryCode: 'IR',
    countryName: 'Iran',
    detectedLanguage: DEFAULT_LANGUAGE,
    source: 'default',
    isAutoApplied: false,
    isNewIpDetected: false,
  };
}
