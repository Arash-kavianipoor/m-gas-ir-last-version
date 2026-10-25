/**
 * Universal & Bulletproof Receipt Printing Utility for A5 / A4 slips and documents
 * Designed for 100% reliability in modern web browsers, iframes, Electron (Win 7 / Win 11),
 * sandboxed environments, and offline desktop setups.
 * 
 * Fixes for Windows Desktop Blank Page & Missing Logo Bugs:
 * 1. REMOVED premature 3.5s timeout cleanup that destroyed the DOM while Windows print dialog was open!
 * 2. REMOVED `left: -99999px` in screen styles which caused Windows print drivers to print offscreen blank sheets.
 * 3. Extended DOM settle delay to 350ms for Windows print spoolers to complete font & vector rasterization.
 * 4. Preserves all form inputs as crisp static text.
 * 5. Guarantees 100% visibility of official M.Gas logo on paper.
 */

import { toEnglishDigits } from './persian';

export interface PrintReceiptOptions {
  elementId: string;
  title?: string;
  paperSize?: 'A5' | 'A4';
  orientation?: 'portrait' | 'landscape';
  onComplete?: () => void;
}

export function printReceiptSheet({
  elementId,
  title = 'برگه رسمی ام گاز',
  paperSize = 'A5',
  orientation = 'landscape',
  onComplete
}: PrintReceiptOptions) {
  const targetElement = document.getElementById(elementId);
  if (!targetElement) {
    console.error(`[PrintEngine] Target element with ID "${elementId}" not found in DOM.`);
    window.print();
    if (onComplete) onComplete();
    return;
  }

  // 1. Deep clone the element to prepare for isolated printing
  const clone = targetElement.cloneNode(true) as HTMLElement;

  // 2. Map all live <input>, <textarea>, and <select> values into clean static text spans
  const originalInputs = targetElement.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>('input, textarea, select');
  const clonedInputs = clone.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>('input, textarea, select');

  originalInputs.forEach((orig, idx) => {
    const cloned = clonedInputs[idx];
    if (cloned && cloned.parentNode) {
      let val = '';
      if (orig instanceof HTMLSelectElement) {
        val = orig.options[orig.selectedIndex]?.text || orig.value || '';
      } else {
        val = orig.value || '';
      }

      const isNumericVal = /^[0-9\s/.,\-–—]+$/.test(val.trim());
      const textSpan = document.createElement('span');
      textSpan.textContent = toEnglishDigits(val) || '—';
      textSpan.className = `font-bold text-slate-950 px-1 inline-block text-xs ${isNumericVal ? 'font-mono' : ''}`;
      textSpan.style.display = 'inline-block';
      textSpan.style.color = '#020617';
      textSpan.style.fontWeight = 'bold';
      textSpan.style.fontFamily = "Arial, 'Segoe UI', Roboto, Helvetica, Tahoma, sans-serif";
      textSpan.style.fontFeatureSettings = '"latn" 1, "tnum" 1, "numr" 0, "onum" 0';
      if (isNumericVal) {
        textSpan.style.direction = 'ltr';
        textSpan.style.unicodeBidi = 'isolate';
      }
      
      cloned.parentNode.replaceChild(textSpan, cloned);
    }
  });

  // 3. Remove all screen-only buttons, close icons, hints, user badges, and no-print elements from clone
  clone.querySelectorAll('button, .print-hidden, [data-no-print], .no-print, [class*="print:hidden"], [data-user-badge], .system-user-badge').forEach(el => el.remove());

  // 4. Reset layout constraints on clone to ensure full, unclipped printing
  clone.style.margin = '0 auto';
  clone.style.maxHeight = 'none';
  clone.style.overflow = 'visible';
  clone.style.boxShadow = 'none';
  clone.style.width = '100%';

  // Guarantee background inheritance for every receipt page (multi-page entry/exit slips)
  const isEntryReceipt = clone.id === 'goods-entry-print-sheet' || clone.querySelector('#goods-entry-print-sheet') !== null || clone.classList.contains('amgas-entry-page') || clone.querySelector('.amgas-entry-page') !== null;
  const isExitReceipt = clone.id === 'goods-exit-print-sheet' || clone.querySelector('#goods-exit-print-sheet') !== null || clone.classList.contains('amgas-exit-page') || clone.querySelector('.amgas-exit-page') !== null;

  if (isEntryReceipt || isExitReceipt) {
    const receiptPages = clone.querySelectorAll<HTMLElement>('.amgas-receipt-page');
    const targetBg = isEntryReceipt ? '#fdfbe8' : '#fcfbf7';
    const targetBorder = isEntryReceipt ? '2px dashed #b45309' : '2px dashed #0284c7';
    receiptPages.forEach((p) => {
      p.style.backgroundColor = targetBg;
      p.style.border = targetBorder;
      p.style.borderRadius = '6px';
      p.style.padding = '12px 16px';
      p.style.boxSizing = 'border-box';
      (p.style as any).webkitPrintColorAdjust = 'exact';
      (p.style as any).printColorAdjust = 'exact';
    });
  }

  // 5. Remove any previous isolated print mount or dynamic style tags
  const existingMount = document.getElementById('am-gas-isolated-print-mount');
  if (existingMount) existingMount.remove();

  const existingStyle = document.getElementById('am-gas-dynamic-print-rules');
  if (existingStyle) existingStyle.remove();

  // 6. Create the isolated print mount attached cleanly to document.body
  const mount = document.createElement('div');
  mount.id = 'am-gas-isolated-print-mount';
  mount.className = 'amgas-isolated-mount';
  mount.setAttribute('dir', 'rtl');

  const pageWrapper = document.createElement('div');
  pageWrapper.className = `amgas-page-wrapper amgas-${paperSize.toLowerCase()} amgas-${orientation}`;
  pageWrapper.appendChild(clone);
  mount.appendChild(pageWrapper);

  document.body.appendChild(mount);

  // 7. Inject isolated @media print rules directly into document <head>
  // Crucial: NO negative offsets (like left: -99999px) which cause blank pages in Windows!
  const styleEl = document.createElement('style');
  styleEl.id = 'am-gas-dynamic-print-rules';
  styleEl.textContent = `
    @page {
      size: ${paperSize} ${orientation};
      margin: 4mm;
    }
    @media screen {
      #am-gas-isolated-print-mount {
        display: none !important;
        visibility: hidden !important;
        height: 0 !important;
        overflow: hidden !important;
      }
    }
    @media print {
      body.amgas-isolated-printing > *:not(#am-gas-isolated-print-mount) {
        display: none !important;
        visibility: hidden !important;
      }
      *, *::before, *::after, html, body, #am-gas-isolated-print-mount, #am-gas-isolated-print-mount *, table, th, td, tr, div, span, p, input, select, textarea {
        font-family: 'EnglishDigits', 'Vazirmatn', Arial, 'Segoe UI', Roboto, Helvetica, Tahoma, sans-serif !important;
        font-feature-settings: "latn" 1, "tnum" 1, "numr" 0, "onum" 0 !important;
        font-variant-numeric: tabular-nums !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      td:first-child, td:nth-child(3), td:nth-child(5), .font-mono, [dir="ltr"], [data-numeric] {
        font-family: Arial, 'Segoe UI', Roboto, sans-serif !important;
        font-feature-settings: "latn" 1, "tnum" 1 !important;
        font-variant-numeric: tabular-nums !important;
        direction: ltr !important;
        unicode-bidi: isolate !important;
      }
      html, body {
        background-color: #ffffff !important;
        background: #ffffff !important;
        color: #020617 !important;
        margin: 0 !important;
        padding: 0 !important;
        width: 100% !important;
        height: auto !important;
        min-height: 100% !important;
        overflow: visible !important;
        direction: rtl !important;
      }
      #am-gas-isolated-print-mount {
        display: block !important;
        visibility: visible !important;
        position: relative !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        max-width: 100% !important;
        margin: 0 auto !important;
        padding: 0 !important;
        background: #ffffff !important;
        color: #020617 !important;
        overflow: visible !important;
        float: none !important;
        clear: both !important;
        transform: none !important;
      }
      #am-gas-isolated-print-mount * {
        visibility: visible !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .amgas-page-wrapper {
        width: 100% !important;
        max-width: 100% !important;
        margin: 0 auto !important;
        padding: 0 !important;
        page-break-inside: auto !important;
        break-inside: auto !important;
      }
      /* Multi-page Receipt Containers */
      #goods-entry-print-sheet,
      #goods-exit-print-sheet {
        background-color: transparent !important;
        border: none !important;
        box-shadow: none !important;
        padding: 0 !important;
        margin: 0 auto !important;
        width: 100% !important;
        max-width: 100% !important;
      }
      /* Each receipt page inherits full background color, dashed border, and paging */
      .amgas-receipt-page {
        page-break-after: always !important;
        break-after: page !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
        margin: 0 auto !important;
        box-shadow: none !important;
        box-sizing: border-box !important;
        width: 100% !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .amgas-receipt-page:last-child {
        page-break-after: auto !important;
        break-after: auto !important;
      }
      /* Goods Entry Receipt: Every single page inherits the authentic physical yellow paper background */
      #goods-entry-print-sheet .amgas-receipt-page,
      .amgas-receipt-page.amgas-entry-page {
        background-color: #fdfbe8 !important;
        color: #0f172a !important;
        border: 2px dashed #b45309 !important;
        border-radius: 6px !important;
        padding: 12px 16px !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      /* Goods Exit Receipt: Every single page inherits the authentic physical paper background */
      #goods-exit-print-sheet .amgas-receipt-page,
      .amgas-receipt-page.amgas-exit-page {
        background-color: #fcfbf7 !important;
        color: #0f172a !important;
        border: 2px dashed #0284c7 !important;
        border-radius: 6px !important;
        padding: 12px 16px !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      #printable-gas-kardex,
      #printable-report-section {
        background-color: #ffffff !important;
        border: none !important;
        box-shadow: none !important;
        padding: 0 !important;
        width: 100% !important;
      }
      table {
        page-break-inside: auto;
      }
      tr {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      button, .print-hidden, [data-no-print], .no-print {
        display: none !important;
      }
    }
  `;
  document.head.appendChild(styleEl);

  // 8. Set up document state
  const prevTitle = document.title;
  document.title = title;
  document.body.classList.add('amgas-isolated-printing');

  // 9. Safe cleanup function - NEVER destroy the DOM on a short timer!
  let isCleanedUp = false;
  const cleanup = () => {
    if (isCleanedUp) return;
    isCleanedUp = true;
    document.body.classList.remove('amgas-isolated-printing');
    document.title = prevTitle;
    const m = document.getElementById('am-gas-isolated-print-mount');
    if (m) m.remove();
    const s = document.getElementById('am-gas-dynamic-print-rules');
    if (s) s.remove();
    if (onComplete) onComplete();
  };

  // Only clean up on true afterprint event (when user completes or cancels print dialog)
  window.addEventListener('afterprint', cleanup, { once: true });

  // 10. Allow Windows layout engine 350ms to settle, render inline SVGs, and prepare spooler
  setTimeout(() => {
    try {
      window.focus();
      window.print();
    } catch (err) {
      console.warn('[PrintEngine] window.print error:', err);
      cleanup();
    }
  }, 350);
}
