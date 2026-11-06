import { jsPDF } from 'jspdf';
import { CYLINDER_DRAWINGS } from '../data/cylinderDrawings';
import { LanguageCode } from '../types';

export interface CatalogDownloadOptions {
  language?: LanguageCode;
  includeSpecs?: boolean;
}

/**
 * Downloads the official M-Gas Technical Product Catalog PDF (3-Page A4 with 2D drawings & factory logo)
 */
export const generateAndDownloadCatalogPdf = (options: CatalogDownloadOptions = {}) => {
  // Method 1: Instant direct download of the official pre-built 3-page PDF asset
  try {
    const link = document.createElement('a');
    link.href = '/catalog/m-gas-official-catalog-2026.pdf';
    link.download = 'M-Gas-Official-Catalog-2026.pdf';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  } catch (err) {
    console.warn('Direct static PDF download failed, falling back to dynamic generation:', err);
  }

  // Fallback Method 2: Dynamic client-side jsPDF 3-page generation
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const itemsPerPage = 6;
  const totalPages = Math.ceil(CYLINDER_DRAWINGS.length / itemsPerPage);

  for (let page = 0; page < totalPages; page++) {
    if (page > 0) doc.addPage();
    const pageItems = CYLINDER_DRAWINGS.slice(page * itemsPerPage, (page + 1) * itemsPerPage);

    // Exact Header Framed Badge Card
    doc.setFillColor(7, 25, 34); // #071922 dark navy-emerald
    doc.setDrawColor(16, 185, 129); // #10B981 emerald
    doc.setLineWidth(0.4);
    doc.roundedRect(14, 8, 42, 18.66, 3, 3, 'FD');

    // M-Gas Text & Flame inside badge
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(253, 253, 253);
    doc.text('M GAS', 35, 18.5, { align: 'center' });
    doc.setFontSize(5);
    doc.setTextColor(52, 211, 153);
    doc.text('EST. 1970', 35, 23.5, { align: 'center' });

    // Header Title & Branding next to framed badge
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(5, 150, 105);
    doc.text('M-GAS INDUSTRIAL GROUP (EST. 1970)', 60, 13);

    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text('Gas Cylinder Specifications', 60, 19);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('2D Orthographic Dimensional Drawings & Technical Specifications', 60, 24);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(16, 185, 129);
    doc.text(`Page ${page + 1} of ${totalPages}`, pageWidth - 14, 13, { align: 'right' });

    // Header divider
    doc.setDrawColor(34, 34, 34);
    doc.setLineWidth(0.4);
    doc.line(14, 25, pageWidth - 14, 25);

    // Render 6 rows per page
    const rowStartY = 28;
    const rowHeight = 41;

    pageItems.forEach((item, idx) => {
      const rowY = rowStartY + idx * rowHeight;
      const scale = 110 / 340;
      const offsetY = rowY + (38 - item.height * scale) / 2;

      // Draw vector lines
      item.lines.forEach((line) => {
        const isDim = line.stroke === '#333' || line.strokeWidth < 1;
        doc.setDrawColor(isDim ? 80 : 17);
        doc.setLineWidth(isDim ? 0.18 : 0.32);
        const x1 = 14 + line.x1 * scale;
        const y1 = offsetY + line.y1 * scale;
        const x2 = 14 + line.x2 * scale;
        const y2 = offsetY + line.y2 * scale;
        doc.line(x1, y1, x2, y2);
      });

      // Draw hemispherical caps
      item.circles.forEach((circ) => {
        doc.setDrawColor(17);
        doc.setLineWidth(0.32);
        const cx = 14 + circ.cx * scale;
        const cy = offsetY + circ.cy * scale;
        const r = circ.r * scale;
        doc.circle(cx, cy, r, 'S');
      });

      // Draw dimension labels
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(20);
      item.texts.forEach((txt) => {
        const tx = 14 + txt.x * scale;
        const ty = offsetY + txt.y * scale - 0.3;
        doc.text(txt.val, tx, ty, { align: 'center' });
      });

      // Right-side Info Box
      const boxX = 132;
      const boxY = rowY + 2.5;
      const boxW = 64;
      const boxH = 34;

      doc.setDrawColor(50, 50, 50);
      doc.setLineWidth(0.25);
      doc.setFillColor(252, 252, 252);
      doc.roundedRect(boxX, boxY, boxW, boxH, 1, 1, 'FD');

      // Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(17);
      doc.text(item.title, boxX + boxW / 2, boxY + 6.5, { align: 'center' });

      // Inner divider
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.2);
      doc.line(boxX + 4, boxY + 9, boxX + boxW - 4, boxY + 9);

      // Table specs
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(60);
      doc.text('Weight:', boxX + 5, boxY + 15.5);
      doc.text('Length:', boxX + 5, boxY + 21.5);
      doc.text('Diameter:', boxX + 5, boxY + 27.5);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(17);
      doc.text(item.weight, boxX + boxW - 5, boxY + 15.5, { align: 'right' });
      doc.text(item.length, boxX + boxW - 5, boxY + 21.5, { align: 'right' });
      doc.text(item.diameter, boxX + boxW - 5, boxY + 27.5, { align: 'right' });

      // Row separator
      if (idx < pageItems.length - 1) {
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.18);
        doc.line(14, rowY + rowHeight - 2, pageWidth - 14, rowY + rowHeight - 2);
      }
    });

    // Footer
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.2);
    doc.line(14, pageHeight - 14, pageWidth - 14, pageHeight - 14);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(110);
    doc.text('Technical reference only – simple orthographic views, not to manufacturing scale | M-Gas Factory (Karaj, Iran)', pageWidth / 2, pageHeight - 9, { align: 'center' });
  }

  doc.save('M-Gas-Official-Catalog-2026.pdf');
};

