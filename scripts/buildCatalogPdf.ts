import fs from 'fs';
import path from 'path';
import { jsPDF } from 'jspdf';
import { CYLINDER_DRAWINGS } from '../src/data/cylinderDrawings.js';

async function generatePdf() {
  const badgePath = path.resolve(process.cwd(), 'public/logo/mgas-header-badge.png');
  const badgeBuffer = fs.readFileSync(badgePath);
  const badgeBase64 = `data:image/png;base64,${badgeBuffer.toString('base64')}`;

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

    // Exact Header Framed Badge Logo (aspect ratio 540x240 = 2.25)
    doc.addImage(badgeBase64, 'PNG', 14, 8, 42, 18.66);

    // Brand and Titles next to framed logo badge
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(5, 150, 105); // emerald-600
    doc.text('M-GAS INDUSTRIAL GROUP (EST. 1970)', 60, 13);

    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text('Gas Cylinder Specifications', 60, 19);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text('2D Orthographic Dimensional Drawings & Technical Specifications', 60, 24);

    // Page number badge on top-right
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(5, 150, 105);
    doc.setDrawColor(167, 243, 208); // emerald-200
    doc.setFillColor(236, 253, 245); // emerald-50
    doc.roundedRect(pageWidth - 42, 10, 28, 8, 2, 2, 'FD');
    doc.text(`Page ${page + 1} of ${totalPages}`, pageWidth - 28, 15.5, { align: 'center' });

    // Technical units subtitle bar
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(100, 116, 139);
    doc.text('Units: Length & Diameter in centimetres (cm)  |  Weight in kilograms (kg)  |  Certified to ISIRI 841 & EN 1442', pageWidth / 2, 29.5, { align: 'center' });

    // Header divider line
    doc.setDrawColor(30, 41, 59);
    doc.setLineWidth(0.4);
    doc.line(14, 32, pageWidth - 14, 32);

    // 6 Cylinders rows
    const rowStartY = 34;
    const rowHeight = 40;

    pageItems.forEach((item, idx) => {
      const rowY = rowStartY + idx * rowHeight;
      const scale = 110 / 340;
      const offsetY = rowY + (36 - item.height * scale) / 2;

      // Draw vector lines
      item.lines.forEach((line) => {
        const isDim = line.stroke === '#333' || line.strokeWidth < 1;
        doc.setDrawColor(isDim ? 90 : 17);
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
      const boxH = 33;

      doc.setDrawColor(30, 41, 59);
      doc.setLineWidth(0.3);
      doc.setFillColor(248, 250, 252); // slate-50
      doc.roundedRect(boxX, boxY, boxW, boxH, 1.5, 1.5, 'FD');

      // Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text(item.title, boxX + boxW / 2, boxY + 6.5, { align: 'center' });

      // Inner divider
      doc.setDrawColor(203, 213, 225); // slate-300
      doc.setLineWidth(0.2);
      doc.line(boxX + 4, boxY + 9, boxX + boxW - 4, boxY + 9);

      // Table specs
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105); // slate-600
      doc.text('Weight:', boxX + 5, boxY + 15.5);
      doc.text('Length:', boxX + 5, boxY + 21.5);
      doc.text('Diameter:', boxX + 5, boxY + 27.5);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(item.weight, boxX + boxW - 5, boxY + 15.5, { align: 'right' });
      doc.text(item.length, boxX + boxW - 5, boxY + 21.5, { align: 'right' });
      doc.text(item.diameter, boxX + boxW - 5, boxY + 27.5, { align: 'right' });

      // Row separator
      if (idx < pageItems.length - 1) {
        doc.setDrawColor(226, 232, 240); // slate-200
        doc.setLineWidth(0.18);
        doc.line(14, rowY + rowHeight - 1, pageWidth - 14, rowY + rowHeight - 1);
      }
    });

    // Page Footer
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.25);
    doc.line(14, pageHeight - 14, pageWidth - 14, pageHeight - 14);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text('M-Gas Industrial Group © 1970–2026 | Karaj Factory, Terans-e-Barq, Alborz, Iran | Tel: +98 26 3630 6351', pageWidth / 2, pageHeight - 9.5, { align: 'center' });
    doc.text(`Official Catalog 2026 — Page ${page + 1} of ${totalPages}`, pageWidth - 14, pageHeight - 9.5, { align: 'right' });
  }

  const outPath = path.resolve(process.cwd(), 'public/catalog/m-gas-official-catalog-2026.pdf');
  const pdfBytes = doc.output('arraybuffer');
  fs.writeFileSync(outPath, Buffer.from(pdfBytes));
  console.log(`Generated official catalog PDF successfully at ${outPath} (${pdfBytes.byteLength} bytes)`);
}

generatePdf().catch(console.error);
