import { LanguageCode } from '../types';

export const ROOT_DOMAIN = 'mgas.ir';
export const ROOT_URL = 'https://mgas.ir';

export const SUBDOMAIN_MAP: Record<LanguageCode, string | null> = {
  en: null,
  fa: 'fa',
  ar: 'ar',
  de: 'de',
  ur: 'ur',
  hy: 'hy',
  tr: 'tr',
  ru: 'ru',
};

/**
 * Get domain name for a specific language (e.g., 'mgas.ir' for en, 'fa.mgas.ir' for fa)
 */
export function getDomainForLanguage(lang: LanguageCode): string {
  const sub = SUBDOMAIN_MAP[lang];
  return sub ? `${sub}.${ROOT_DOMAIN}` : ROOT_DOMAIN;
}

/**
 * Get full base URL for a specific language (e.g., 'https://mgas.ir' or 'https://fa.mgas.ir')
 */
export function getBaseUrlForLanguage(lang: LanguageCode): string {
  return `https://${getDomainForLanguage(lang)}`;
}

/**
 * Parses language code from hostname (e.g., 'fa.mgas.ir' -> 'fa', 'de.mgas.ir' -> 'de', 'mgas.ir' -> 'en')
 */
export function getLanguageFromHostname(hostname: string): LanguageCode | null {
  if (!hostname) return null;

  const cleanHost = hostname.toLowerCase().split(':')[0]; // Remove port if present

  // Direct match with main domain or localhost
  if (cleanHost === ROOT_DOMAIN || cleanHost === `www.${ROOT_DOMAIN}` || cleanHost === 'localhost') {
    return 'en';
  }

  // Check language subdomains like fa.mgas.ir or www.fa.mgas.ir
  const parts = cleanHost.split('.');
  if (parts.length >= 2) {
    // If starts with 'www.', check the second part (e.g. www.fa.mgas.ir -> fa)
    const sub = (parts[0] === 'www' && parts.length >= 3 ? parts[1] : parts[0]) as LanguageCode;
    if (Object.keys(SUBDOMAIN_MAP).includes(sub) && sub !== 'en') {
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
 * Builds the URL to switch to a different language via its dedicated subdomain.
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
  const targetUrl = `https://${domain}${path}${hash}`;

  if (isProd) {
    const currentHost = window.location.hostname.toLowerCase();
    const shouldNavigate = currentHost !== domain;
    return { url: targetUrl, shouldNavigate };
  }

  return { url: targetUrl, shouldNavigate: false };
}
