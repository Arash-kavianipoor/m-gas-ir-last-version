import { LanguageCode } from '../types';

export const ROOT_DOMAIN = 'mgas.ir';
export const ROOT_URL = 'https://mgas.ir';

export const SUBDOMAIN_MAP: Record<LanguageCode, string | null> = {
  fa: null, // Persian is the canonical root domain (https://mgas.ir)
  en: 'en',
  ar: 'ar',
  de: 'de',
  ur: 'ur',
  hy: 'hy',
  tr: 'tr',
  ru: 'ru',
};

/**
 * Get domain name for a specific language (e.g., 'mgas.ir' for fa, 'en.mgas.ir' for en)
 */
export function getDomainForLanguage(lang: LanguageCode): string {
  const sub = SUBDOMAIN_MAP[lang];
  return sub ? `${sub}.${ROOT_DOMAIN}` : ROOT_DOMAIN;
}

/**
 * Get full base URL for a specific language (e.g., 'https://mgas.ir' for fa)
 */
export function getBaseUrlForLanguage(lang: LanguageCode): string {
  if (lang === 'fa') {
    return ROOT_URL;
  }
  const sub = SUBDOMAIN_MAP[lang];
  return sub ? `https://${sub}.${ROOT_DOMAIN}` : ROOT_URL;
}

/**
 * Parses language code from hostname (e.g., 'mgas.ir' -> 'fa', 'en.mgas.ir' -> 'en')
 */
export function getLanguageFromHostname(hostname: string): LanguageCode | null {
  if (!hostname) return null;

  const cleanHost = hostname.toLowerCase().split(':')[0]; // Remove port if present

  // Direct match with main domain: returns Persian (primary language)
  if (cleanHost === ROOT_DOMAIN || cleanHost === `www.${ROOT_DOMAIN}`) {
    return 'fa';
  }

  // Local development / preview
  if (cleanHost === 'localhost' || cleanHost.includes('127.0.0.1') || cleanHost.includes('run.app')) {
    return null; // Will defer to query parameter or stored preference, falling back to 'fa'
  }

  // Check language subdomains like en.mgas.ir or ar.mgas.ir
  const parts = cleanHost.split('.');
  if (parts.length >= 2) {
    const sub = (parts[0] === 'www' && parts.length >= 3 ? parts[1] : parts[0]) as LanguageCode;
    if (Object.keys(SUBDOMAIN_MAP).includes(sub)) {
      return sub;
    }
  }

  return null;
}

/**
 * Checks if current environment is the production mgas.ir domain
 */
export function isProductionMgas(hostname?: string): boolean {
  if (typeof window === 'undefined' && !hostname) return false;
  const host = (hostname || window.location.hostname).toLowerCase();
  return host.includes(ROOT_DOMAIN);
}

/**
 * Removes ?lang= query param from search string
 */
export function stripLangQueryParam(search: string): string {
  if (!search) return '';
  const params = new URLSearchParams(search);
  params.delete('lang');
  const res = params.toString();
  return res ? `?${res}` : '';
}

/**
 * Builds the URL to switch to a different language via its dedicated subdomain or query.
 * Returns { url, shouldNavigate }
 */
export function buildSwitchLanguageUrl(
  targetLang: LanguageCode,
  currentPath: string = '/',
  currentHash: string = ''
): { url: string; shouldNavigate: boolean } {
  const isProd = typeof window !== 'undefined' ? isProductionMgas(window.location.hostname) : false;
  const domain = getDomainForLanguage(targetLang);
  const path = typeof window !== 'undefined' ? window.location.pathname : currentPath;
  const hash = typeof window !== 'undefined' ? window.location.hash : currentHash;

  // On production, route to subdomain if available
  const targetUrl = targetLang === 'fa'
    ? `${ROOT_URL}${path}${hash}`
    : `https://${domain}${path}${hash}`;

  if (isProd) {
    const currentHost = window.location.hostname.toLowerCase();
    const shouldNavigate = currentHost !== domain;
    return { url: targetUrl, shouldNavigate };
  }

  return { url: targetUrl, shouldNavigate: false };
}
