// Official sheet number generator for M-Gas Goods Receipts & Kardex
// Canonical sheet number conforms to: [CustomerCode][MMDD][Count][i/e] (e.g. AG052601i)

export function getCustomerEnglishCode(name?: string): string {
  if (!name) return 'CU';
  const clean = name.trim();
  if (clean.includes('البرز')) return 'AG';
  if (clean.includes('پارس')) return 'PG';
  if (clean.includes('بوتان')) return 'BT';
  if (clean.includes('پرسی')) return 'PC';
  if (clean.includes('ایران')) return 'IG';
  if (clean.includes('سپهر')) return 'SG';
  if (clean.includes('سبلان')) return 'SB';
  if (clean.includes('آریا')) return 'AR';
  if (clean.includes('دنا')) return 'DN';
  if (clean.includes('زاگرس')) return 'ZG';
  if (clean.includes('تهران')) return 'TH';
  if (clean.includes('اصفهان')) return 'ES';
  if (clean.includes('فارس')) return 'FR';

  // Fallback: extract Latin letters or generate a simple short hash
  const latinMatch = clean.match(/[a-zA-Z]{2}/);
  if (latinMatch) return latinMatch[0].toUpperCase();

  // Simple 2-char code based on unicode char codes
  const c1 = clean.charCodeAt(0) % 26;
  const c2 = (clean.charCodeAt(clean.length - 1) || 65) % 26;
  return `${String.fromCharCode(65 + c1)}${String.fromCharCode(65 + c2)}`;
}

export function extractMonthAndDay(dateStr?: string): string {
  if (!dateStr) return '0526';
  const parts = dateStr.replace(/[^0-9/]/g, '').split('/');
  if (parts.length >= 3) {
    const month = parts[1].padStart(2, '0');
    const day = parts[2].padStart(2, '0');
    return `${month}${day}`;
  }
  return '0526';
}

export function formatPersianDateToSheetDateCode(dateStr?: string): string {
  if (!dateStr) return '0526';
  const parts = dateStr.replace(/[^0-9/]/g, '').split('/');
  if (parts.length >= 3) {
    const year = parts[0].slice(-2);
    const month = parts[1].padStart(2, '0');
    const day = parts[2].padStart(2, '0');
    return `${year}${month}${day}`;
  }
  return extractMonthAndDay(dateStr);
}

export function calculateDailyRequestCount(
  entries: any[] = [],
  customerIdOrName?: string,
  dateStr?: string
): number {
  if (!entries || !Array.isArray(entries)) return 1;
  const targetDate = dateStr?.trim();
  const targetCust = customerIdOrName?.trim();

  const matching = entries.filter(e => {
    const matchDate = !targetDate || (e.date && e.date.trim() === targetDate);
    const matchCust =
      !targetCust ||
      e.customer_id === targetCust ||
      e.customer_name === targetCust;
    return matchDate && matchCust;
  });

  return matching.length + 1;
}

export function generateSheetNumber(
  customerNameOrCode?: string,
  dateStr?: string,
  direction: 'i' | 'e' | string = 'i',
  count: number = 1
): string {
  const code = getCustomerEnglishCode(customerNameOrCode);
  const mmdd = extractMonthAndDay(dateStr);
  const dirChar = direction === 'e' || direction === 'out' ? 'e' : 'i';
  const countStr = String(Math.max(1, count)).padStart(2, '0');
  return `${code}${mmdd}${countStr}${dirChar}`;
}

export function parseSheetNumber(sheetNumber: string): {
  customerCode: string;
  dateCode: string;
  direction: string;
  count: number;
  raw: string;
} {
  const raw = String(sheetNumber || '').trim();
  const match = raw.match(/^([A-Z]{2})([0-9]{4})([0-9]{2})([ieIE])$/);
  if (match) {
    return {
      customerCode: match[1],
      dateCode: match[2],
      count: parseInt(match[3], 10),
      direction: match[4].toLowerCase(),
      raw
    };
  }
  return {
    customerCode: raw.slice(0, 2),
    dateCode: '',
    count: 1,
    direction: 'i',
    raw
  };
}

export function generateNextSheetNumber(existingCount: number, prefixYear = '1405'): string {
  const nextNum = existingCount + 1;
  const padded = String(nextNum).padStart(5, '0');
  return `${prefixYear}-${padded}`;
}
