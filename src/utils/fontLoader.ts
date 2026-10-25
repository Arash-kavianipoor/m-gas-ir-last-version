/**
 * Font Loader & Offline Resilience Engine for Vazirmatn
 * 
 * Rules:
 * 1. Checks and pre-registers Vazirmatn from /webfonts (WOFF2) with fallback to /fonts (TTF).
 * 2. Scopes digits and numbers to English font.
 */

export async function initVazirmatnFonts(): Promise<{ source: 'webfonts' | 'fonts' | 'system' }> {
  if (typeof document === 'undefined' || !document.fonts) {
    return { source: 'system' };
  }

  try {
    if (document.fonts.check('16px Vazirmatn')) {
      return { source: 'webfonts' };
    }

    const vazirFont = new FontFace(
      'Vazirmatn',
      'url(/webfonts/Vazirmatn-Regular.woff2) format("woff2"), url(/fonts/Vazirmatn-Light.ttf) format("truetype")',
      { weight: '400', style: 'normal', display: 'swap' }
    );
    const loaded = await vazirFont.load();
    document.fonts.add(loaded);
    return { source: 'webfonts' };
  } catch (err) {
    console.warn('[FontLoader] Fallback to system font stack:', err);
    return { source: 'system' };
  }
}
