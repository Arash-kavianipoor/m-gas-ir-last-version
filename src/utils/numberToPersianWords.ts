// Utility to convert numbers to Persian words (تعداد به حروف)

const ones = ['', 'یک', 'دو', 'سه', 'چهار', 'پنج', 'شش', 'هفت', 'هشت', 'نه'];
const teens = ['ده', 'یازده', 'دوازده', 'سیزده', 'چهارده', 'پانزده', 'شانزده', 'هفده', 'هجده', 'نوزده'];
const tens = ['', '', 'بیست', 'سی', 'چهل', 'پنجاه', 'شصت', 'هفتاد', 'هشتاد', 'نود'];
const hundreds = ['', 'یکصد', 'دویست', 'سیصد', 'چهارصد', 'پانصد', 'ششصد', 'هفتصد', 'هشتصد', 'نهصد'];

function convertLessThanThousand(num: number): string {
  if (num === 0) return '';
  const parts: string[] = [];

  const h = Math.floor(num / 100);
  const remainder = num % 100;

  if (h > 0) {
    parts.push(hundreds[h]);
  }

  if (remainder > 0) {
    if (remainder < 10) {
      parts.push(ones[remainder]);
    } else if (remainder < 20) {
      parts.push(teens[remainder - 10]);
    } else {
      const t = Math.floor(remainder / 10);
      const o = remainder % 10;
      parts.push(tens[t]);
      if (o > 0) {
        parts.push(ones[o]);
      }
    }
  }

  return parts.join(' و ');
}

export function numberToPersianWords(num: number | string | undefined | null): string {
  if (num === undefined || num === null) return '';
  const n = typeof num === 'string' ? parseInt(num, 10) : num;
  if (isNaN(n) || n === 0) return 'صفر';
  if (n < 0) return `منفی ${numberToPersianWords(Math.abs(n))}`;

  const billions = Math.floor(n / 1000000000);
  const millions = Math.floor((n % 1000000000) / 1000000);
  const thousands = Math.floor((n % 1000000) / 1000);
  const remainder = n % 1000;

  const result: string[] = [];

  if (billions > 0) {
    result.push(`${convertLessThanThousand(billions)} میلیارد`);
  }
  if (millions > 0) {
    result.push(`${convertLessThanThousand(millions)} میلیون`);
  }
  if (thousands > 0) {
    result.push(`${convertLessThanThousand(thousands)} هزار`);
  }
  if (remainder > 0) {
    result.push(convertLessThanThousand(remainder));
  }

  return result.join(' و ');
}
