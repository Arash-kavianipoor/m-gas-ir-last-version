import { Category, Product } from '../types';

/**
 * Automatically generates a unique, structured SKU code combining English letters and numbers.
 * Guaranteed format:
 * Prefix (e.g. MG-VALV, MG-TOOL, MG-ELEC, or MG) + '-' + alphanumeric string containing BOTH English letters and numbers.
 * Example outputs: MG-VALV-7A8K, MG-TOOL-4K9E, MG-ELEC-3M8R, MG-9B2X4
 */
export function generateAutoSku(
  categoryId: string | undefined,
  categories: Category[],
  existingProductsOrSkus: (Product | string)[]
): string {
  const cat = categories.find(c => c.category_id === categoryId);
  let prefix = 'MG';

  if (cat && cat.code) {
    const cleanCode = cat.code.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 4);
    if (cleanCode.length >= 2) {
      prefix = `MG-${cleanCode}`;
    }
  }

  // English letters excluding ambiguous O and I to prevent mistyping
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  // Digits excluding ambiguous 0 and 1
  const digits = '23456789';

  const existingSet = new Set(
    existingProductsOrSkus.map(item =>
      typeof item === 'string' ? item.trim().toUpperCase() : (item.sku || '').trim().toUpperCase()
    )
  );

  for (let attempt = 0; attempt < 300; attempt++) {
    // Strictly guarantee at least 2 uppercase English letters and at least 2 digits
    let pLetters = '';
    for (let i = 0; i < 2; i++) {
      pLetters += letters.charAt(Math.floor(Math.random() * letters.length));
    }

    let pDigits = '';
    for (let i = 0; i < 2; i++) {
      pDigits += digits.charAt(Math.floor(Math.random() * digits.length));
    }

    // Add 1 extra character (50% letter, 50% digit)
    const isExtraLetter = Math.random() > 0.5;
    const extraChar = isExtraLetter
      ? letters.charAt(Math.floor(Math.random() * letters.length))
      : digits.charAt(Math.floor(Math.random() * digits.length));

    // Shuffle characters randomly
    const chars = (pLetters + pDigits + extraChar).split('');
    for (let i = chars.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [chars[i], chars[j]] = [chars[j], chars[i]];
    }

    const suffix = chars.join('');
    const candidate = `${prefix}-${suffix}`;

    if (!existingSet.has(candidate)) {
      return candidate;
    }
  }

  // Fallback timestamp-based alphanumeric combination
  const randomNum = Math.floor(10 + Math.random() * 90);
  const randomLetter = letters.charAt(Math.floor(Math.random() * letters.length));
  return `${prefix}-${Date.now().toString(36).toUpperCase()}${randomLetter}${randomNum}`;
}

/**
 * Checks if a string contains both English letters and numbers.
 */
export function hasLettersAndNumbers(str: string): boolean {
  if (!str) return false;
  const hasLetter = /[A-Za-z]/.test(str);
  const hasNumber = /[0-9]/.test(str);
  return hasLetter && hasNumber;
}
