// Persian date, text, currency and formatting utilities with ENGLISH digits (0-9) as requested

export function toEnglishDigits(str: string | number | undefined | null): string {
  if (str === undefined || str === null) return '';
  const s = String(str);
  return s
    .replace(/[\u200E\u200F\u202A-\u202E\u061C]/g, '') // remove bidi control marks that cause Windows Uniscribe to flip or shape the first digit
    .replace(/[۰-۹]/g, d => String(d.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, d => String(d.charCodeAt(0) - 1632));
}

// Ensure numbers are formatted with standard English digits and thousand separators
export function formatNumberFa(num: number | string | undefined | null): string {
  if (num === undefined || num === null || num === '') return '0';
  const clean = typeof num === 'string' ? toEnglishDigits(num).replace(/,/g, '').trim() : num;
  const val = typeof clean === 'string' ? parseFloat(clean) : clean;
  if (isNaN(val)) return '0';
  return new Intl.NumberFormat('en-US').format(val);
}

// Aliases as requested: all numbers displayed with English digits (0-9)
export const formatNumberEn = formatNumberFa;
export const formatPersianNumber = formatNumberFa;

export function toPersianDigits(str: string | number | undefined | null): string {
  // All numbers in UI use standard English digits 0-9
  if (str === undefined || str === null) return '';
  return toEnglishDigits(str);
}

export function formatCurrencyToman(amount: number | string | undefined | null): string {
  if (amount === undefined || amount === null || amount === '') return '0 تومان';
  const formatted = formatNumberFa(amount);
  return `${formatted} تومان`;
}

// Convert Gregorian date or ISO/Persian string to Persian Shamsi string (YYYY/MM/DD) with English digits
export function getPersianDate(input?: Date | string | null): string {
  try {
    let dateObj: Date;
    if (!input) {
      dateObj = new Date();
    } else if (typeof input === 'string') {
      if (input.includes('/') && input.length >= 8) {
        // Already a formatted Persian date e.g. 1405/05/26
        return toEnglishDigits(input);
      }
      dateObj = new Date(input);
      if (isNaN(dateObj.getTime())) {
        return '1405/01/01';
      }
    } else {
      dateObj = input;
    }

    const formatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian-nu-latn', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    const parts = formatter.formatToParts(dateObj);
    const year = parts.find(p => p.type === 'year')?.value || '1405';
    const month = parts.find(p => p.type === 'month')?.value || '01';
    const day = parts.find(p => p.type === 'day')?.value || '01';
    return `${toEnglishDigits(year)}/${toEnglishDigits(month)}/${toEnglishDigits(day)}`;
  } catch {
    return '1405/01/01';
  }
}

export function formatPersianDateTime(isoString: string): string {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    const dStr = getPersianDate(date);
    const h = String(date.getHours()).padStart(2, '0');
    const m = String(date.getMinutes()).padStart(2, '0');
    const s = String(date.getSeconds()).padStart(2, '0');
    return `${dStr} ${h}:${m}:${s}`;
  } catch {
    return isoString;
  }
}

export function generateUUID(prefix?: string): string {
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
  return prefix ? `${prefix}-${uuid}` : uuid;
}

/**
 * Parses decimal numbers supporting Persian digits, English digits,
 * Persian decimal mark (٫), slash (/), and comma (,).
 */
export function parseDecimalNumber(val: string | number | undefined | null, defaultValue = 0): number {
  if (val === undefined || val === null || val === '') return defaultValue;
  if (typeof val === 'number') return isNaN(val) ? defaultValue : val;
  const clean = toEnglishDigits(val)
    .replace(/٫/g, '.')
    .replace(/\//g, '.')
    .replace(/,/g, '.')
    .replace(/[^\d.-]/g, '')
    .trim();
  const parsed = parseFloat(clean);
  return isNaN(parsed) ? defaultValue : parsed;
}
