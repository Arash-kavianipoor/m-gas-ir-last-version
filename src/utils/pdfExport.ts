import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { printReceiptSheet } from './receiptPrint';
import { toEnglishDigits } from './persian';

export interface PdfExportOptions {
  filename?: string;
  orientation?: 'portrait' | 'landscape';
  format?: 'a4' | 'a5';
  marginMm?: number;
}

/**
 * High-Fidelity Client-Side PDF Exporter
 * Converts any DOM element (receipts, kardex, reports) to a crisp vector-aligned PDF.
 * Eliminates canvas taint errors, handles input field value serialization,
 * and supports multi-page slicing for large tables.
 */
export async function exportElementToPdf(
  elementIdOrElement: string | HTMLElement,
  options: PdfExportOptions = {}
): Promise<boolean> {
  const {
    filename = 'document.pdf',
    orientation = 'portrait',
    format = 'a4',
    marginMm = 4
  } = options;

  let targetElement: HTMLElement | null = null;
  if (typeof elementIdOrElement === 'string') {
    targetElement = document.getElementById(elementIdOrElement);
  } else {
    targetElement = elementIdOrElement;
  }

  if (!targetElement) {
    console.error(`[PdfExport] Target element "${elementIdOrElement}" not found.`);
    return false;
  }

  // 1. Create a clean, off-screen rendered container attached to document.body
  // This avoids modal scroll constraints and clipping bugs
  const renderWidthPx = format === 'a5'
    ? (orientation === 'landscape' ? 820 : 600)
    : (orientation === 'landscape' ? 1160 : 840);

  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-99999px';
  container.style.top = '0';
  container.style.width = `${renderWidthPx}px`;
  container.style.minHeight = 'auto';
  container.style.background = '#ffffff';
  container.style.color = '#020617';
  container.style.fontFamily = "'EnglishDigits', 'Vazirmatn', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, Tahoma, sans-serif";
  container.style.zIndex = '-99999';
  container.style.direction = 'rtl';
  container.style.boxSizing = 'border-box';
  container.style.padding = '8px';

  // 2. Clone the target element
  const clone = targetElement.cloneNode(true) as HTMLElement;

  // 3. Serialize all live input, textarea, and select values into clean static text spans
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

      const textSpan = document.createElement('span');
      textSpan.textContent = toEnglishDigits(val) || '—';
      textSpan.className = 'font-bold text-slate-950 px-1 inline-block text-xs';
      textSpan.style.display = 'inline-block';
      textSpan.style.color = '#020617';
      textSpan.style.fontWeight = 'bold';
      textSpan.style.fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, Tahoma, sans-serif";

      cloned.parentNode.replaceChild(textSpan, cloned);
    }
  });

  // 4. Remove all screen buttons, toolbars, user badges, and no-print helpers from clone
  clone.querySelectorAll('button, .print-hidden, [data-no-print], .no-print, [class*="print:hidden"], [data-user-badge], .system-user-badge').forEach(el => el.remove());

  // 5. Ensure clone has full visible layout and correct paper background
  clone.style.margin = '0 auto';
  clone.style.maxHeight = 'none';
  clone.style.overflow = 'visible';
  clone.style.boxShadow = 'none';
  clone.style.width = '100%';
  clone.style.maxWidth = '100%';
  clone.style.boxSizing = 'border-box';

  // Ensure any scrollable table container inside clone expands to full width with zero clipping
  clone.querySelectorAll<HTMLElement>('.overflow-x-auto, .overflow-y-auto').forEach(el => {
    el.style.overflow = 'visible';
    el.style.width = '100%';
    el.style.maxWidth = '100%';
    el.style.boxSizing = 'border-box';
  });
  clone.querySelectorAll<HTMLElement>('table').forEach(tbl => {
    tbl.style.width = '100%';
    tbl.style.maxWidth = '100%';
    tbl.style.tableLayout = 'fixed';
    tbl.style.boxSizing = 'border-box';
  });

  container.appendChild(clone);
  document.body.appendChild(container);

  // 6. Inline images as base64 Data URLs so canvas is NEVER tainted by external/local SVGs
  const imgElements = Array.from(clone.querySelectorAll('img'));
  await Promise.all(imgElements.map(async (img) => {
    try {
      if (img.src && !img.src.startsWith('data:')) {
        const response = await fetch(img.src);
        const blob = await response.blob();
        await new Promise<void>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            if (typeof reader.result === 'string') {
              img.src = reader.result;
            }
            resolve();
          };
          reader.onerror = () => resolve();
          reader.readAsDataURL(blob);
        });
      }
    } catch {
      // Continue even if an image cannot be inlined
    }
  }));

  try {
    // 7. Render with html2canvas with bulletproof parameters
    const receiptPages = Array.from(clone.querySelectorAll<HTMLElement>('.amgas-receipt-page'));
    if (receiptPages.length > 1) {
      // 8b. Dedicated Multi-Page Receipt Rendering: Each page cleanly rendered onto its own PDF sheet
      const pdf = new jsPDF({
        orientation,
        unit: 'mm',
        format,
        compress: true
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const printableWidth = pageWidth - (marginMm * 2);
      const printableHeight = pageHeight - (marginMm * 2);

      const isEntryReceipt = clone.id === 'goods-entry-print-sheet' || clone.querySelector('#goods-entry-print-sheet') !== null || clone.classList.contains('amgas-entry-page') || clone.querySelector('.amgas-entry-page') !== null;
      const isExitReceipt = clone.id === 'goods-exit-print-sheet' || clone.querySelector('#goods-exit-print-sheet') !== null || clone.classList.contains('amgas-exit-page') || clone.querySelector('.amgas-exit-page') !== null;
      const pageBgColor = isEntryReceipt ? '#fdfbe8' : isExitReceipt ? '#fcfbf7' : '#ffffff';
      const pageBorder = isEntryReceipt ? '2px dashed #b45309' : isExitReceipt ? '2px dashed #0284c7' : 'none';

      for (let pIdx = 0; pIdx < receiptPages.length; pIdx++) {
        if (pIdx > 0) {
          pdf.addPage(format, orientation);
        }

        const pageEl = receiptPages[pIdx];
        pageEl.style.backgroundColor = pageBgColor;
        pageEl.style.border = pageBorder;
        pageEl.style.borderRadius = '6px';
        pageEl.style.padding = '12px 16px';
        pageEl.style.boxSizing = 'border-box';
        pageEl.style.boxShadow = 'none';

        const pCanvas = await html2canvas(pageEl, {
          scale: 2,
          useCORS: true,
          allowTaint: false,
          backgroundColor: pageBgColor,
          logging: false
        });

        const pImgData = pCanvas.toDataURL('image/png', 1.0);
        const pAspect = pCanvas.width / pCanvas.height;
        let rWidth = printableWidth;
        let rHeight = printableWidth / pAspect;

        if (rHeight > printableHeight) {
          rHeight = printableHeight;
          rWidth = printableHeight * pAspect;
        }

        const posX = marginMm + (printableWidth - rWidth) / 2;
        const posY = marginMm + (printableHeight - rHeight) / 2;

        pdf.addImage(pImgData, 'PNG', posX, posY, rWidth, rHeight, undefined, 'FAST');
      }

      const cleanFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
      pdf.save(cleanFilename);
      return true;
    }

    const isEntryReceipt = clone.id === 'goods-entry-print-sheet' || clone.querySelector('#goods-entry-print-sheet') !== null || clone.classList.contains('amgas-entry-page') || clone.querySelector('.amgas-entry-page') !== null;
    const isExitReceipt = clone.id === 'goods-exit-print-sheet' || clone.querySelector('#goods-exit-print-sheet') !== null || clone.classList.contains('amgas-exit-page') || clone.querySelector('.amgas-exit-page') !== null;
    const defaultBg = isEntryReceipt ? '#fdfbe8' : isExitReceipt ? '#fcfbf7' : '#ffffff';

    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      allowTaint: false, // Critical: allowTaint must be false so canvas.toDataURL() never throws
      backgroundColor: defaultBg,
      logging: false,
      windowWidth: renderWidthPx,
      windowHeight: container.scrollHeight
    });

    const imgData = canvas.toDataURL('image/png', 1.0);

    // 8. Initialize jsPDF
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format,
      compress: true
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const printableWidth = pageWidth - (marginMm * 2);
    const printableHeight = pageHeight - (marginMm * 2);

    const imgWidthPx = canvas.width;
    const imgHeightPx = canvas.height;
    const imgAspectRatio = imgWidthPx / imgHeightPx;

    const scaledHeightMm = printableWidth / imgAspectRatio;

    // 9. Single-page fitting (for A5 receipts or content fitting on 1 page)
    if (format === 'a5' || scaledHeightMm <= printableHeight + 4) {
      let renderWidth = printableWidth;
      let renderHeight = scaledHeightMm;

      if (renderHeight > printableHeight) {
        renderHeight = printableHeight;
        renderWidth = renderHeight * imgAspectRatio;
      }

      const posX = marginMm + (printableWidth - renderWidth) / 2;
      const posY = marginMm;

      pdf.addImage(imgData, 'PNG', posX, posY, renderWidth, renderHeight, undefined, 'FAST');
    } else {
      // 10. Multi-page slicing for large reports or long gas kardex tables
      let heightLeft = scaledHeightMm;
      let positionY = marginMm;
      let pageNum = 0;

      while (heightLeft > 0) {
        if (pageNum > 0) {
          pdf.addPage(format, orientation);
        }

        pdf.addImage(
          imgData,
          'PNG',
          marginMm,
          positionY,
          printableWidth,
          scaledHeightMm,
          undefined,
          'FAST'
        );

        heightLeft -= printableHeight;
        positionY -= printableHeight;
        pageNum++;
      }
    }

    // 11. Save and trigger download
    const cleanFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    pdf.save(cleanFilename);
    return true;
  } catch (err) {
    console.warn('[PdfExport] Direct canvas PDF generation failed, triggering browser print fallback:', err);
    
    // Fail-safe Fallback: Open print dialog in isolated mode where user can choose "Save as PDF"
    printReceiptSheet({
      elementId: typeof elementIdOrElement === 'string' ? elementIdOrElement : targetElement.id || 'am-gas-fallback-print',
      title: filename.replace('.pdf', ''),
      paperSize: format.toUpperCase() as 'A4' | 'A5',
      orientation
    });
    return false;
  } finally {
    // Clean up container
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}
