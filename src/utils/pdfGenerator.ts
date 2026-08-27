import { jsPDF } from 'jspdf';
import { PRODUCTS } from '../data/products';
import { COMPANY_INFO } from '../data/company';
import { LanguageCode } from '../types';

export interface CatalogDownloadOptions {
  language?: LanguageCode;
  includeSpecs?: boolean;
}

/**
 * Generates and downloads an official M-Gas Technical Product Catalog PDF
 */
export const generateAndDownloadCatalogPdf = (options: CatalogDownloadOptions = {}) => {
  const { language = 'en' } = options;
  const isPersian = language === 'fa';

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Color Palette
  const darkNavy = [11, 19, 30];
  const emeraldGreen = [16, 185, 129];
  const goldAccent = [245, 158, 11];
  const slateText = [148, 163, 184];
  const cardBg = [248, 250, 252];

  // PAGE 1: COVER & COMPANY PROFILE
  // Top Banner
  doc.setFillColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.rect(0, 0, pageWidth, 75, 'F');

  // Accent Line
  doc.setFillColor(emeraldGreen[0], emeraldGreen[1], emeraldGreen[2]);
  doc.rect(0, 75, pageWidth, 3, 'F');

  // Header Titles
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.text('M-GAS INDUSTRIAL GROUP', 14, 28);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(emeraldGreen[0], emeraldGreen[1], emeraldGreen[2]);
  doc.text('ESTABLISHED 1970 (50+ YEARS OF EXCELLENCE)', 14, 38);

  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('OFFICIAL LPG CYLINDERS PRODUCT CATALOG & SPECIFICATIONS', 14, 52);

  doc.setFontSize(9);
  doc.setTextColor(slateText[0], slateText[1], slateText[2]);
  doc.text('High-Pressure Liquefied Petroleum Gas Cylinders | ISO 9001:2015 | EN 1442 | DOT-4BA/4BW Compliance', 14, 62);

  // Body content: Overview & Factory Info
  let currentY = 90;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text('MANUFACTURING CAPABILITIES & QUALITY ASSURANCE', 14, currentY);

  currentY += 8;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);

  const introText = 
    'M Gas is a premier manufacturer of high-precision LPG cylinders engineered with high-tensile steel (HP295 / SG295). ' +
    'Our manufacturing line integrates automated deep drawing, robotic submerged-arc welding, normalized heat treatment furnace, ' +
    '100% 30-34 Bar hydrostatic pressure testing, and electrostatic powder coating according to RAL standards. ' +
    'We export to 12+ international hubs with flexible container logistics (20ft & 40ft High Cube).';

  const splitIntro = doc.splitTextToSize(introText, pageWidth - 28);
  doc.text(splitIntro, 14, currentY);
  currentY += 22;

  // Key Specifications Highlights Table
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text('PRODUCT PORTFOLIO OVERVIEW (13 MODELS)', 14, currentY);
  currentY += 6;

  // Table Headers
  const tableHeaders = ['Model / Vol', 'Category', 'Empty Wt', 'Diameter', 'Height', 'Test Press', 'MOQ'];
  const colX = [14, 48, 80, 106, 130, 156, 182];

  doc.setFillColor(235, 243, 240);
  doc.rect(14, currentY, pageWidth - 28, 7, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);

  tableHeaders.forEach((header, idx) => {
    doc.text(header, colX[idx], currentY + 4.8);
  });

  currentY += 8;

  // Render Product Rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);

  PRODUCTS.forEach((product, index) => {
    if (index % 2 === 0) {
      doc.setFillColor(cardBg[0], cardBg[1], cardBg[2]);
      doc.rect(14, currentY - 1, pageWidth - 28, 6.5, 'F');
    }

    doc.setTextColor(30, 41, 59);
    doc.text(`${product.volume} ${product.volumeUnit}`, colX[0], currentY + 3.5);
    doc.text(product.category.toUpperCase(), colX[1], currentY + 3.5);
    doc.text(`${product.emptyWeightKg} Kg`, colX[2], currentY + 3.5);
    doc.text(`${product.circleDiameterCm} cm`, colX[3], currentY + 3.5);
    doc.text(`${product.heightCm} cm`, colX[4], currentY + 3.5);
    doc.text(`${product.testPressureBar} Bar`, colX[5], currentY + 3.5);
    doc.text(`${product.minOrder} pcs`, colX[6], currentY + 3.5);

    currentY += 6.5;
  });

  // Standards & Certifications Box
  currentY += 4;
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(16, 185, 129);
  doc.roundedRect(14, currentY, pageWidth - 28, 26, 2, 2, 'FD');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(5, 150, 105);
  doc.text('CERTIFICATIONS & MANUFACTURING STANDARDS', 18, currentY + 6);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  doc.text('• Quality Management System: ISO 9001:2015 Certified', 18, currentY + 12);
  doc.text('• European Standard: EN 1442 Transportable Refillable Welded Steel Cylinders for LPG', 18, currentY + 17);
  doc.text('• Testing Protocols: 100% 30-34 Bar Hydraulic Test, Radiographic X-Ray Weld Inspection, Burst Test > 85 Bar', 18, currentY + 22);

  // Footer Contacts
  currentY += 32;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text('GLOBAL SALES & FACTORY HEADQUARTERS:', 14, currentY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(70, 70, 70);
  doc.text(`International Sales: ${COMPANY_INFO.contacts.internationalSalesManager.whatsappDisplay} (WhatsApp)`, 14, currentY + 4.5);
  doc.text(`Official Sales Email: ${COMPANY_INFO.emails.sales} | Website: https://mgas.ir`, 14, currentY + 8.5);
  doc.text(`Factory Address: Karaj, Alborz Province, Iran (M-Gas Industrial Complex)`, 14, currentY + 12.5);

  // Page 2: DETAILED TECHNICAL SPECIFICATIONS
  doc.addPage();

  // Page 2 Header
  doc.setFillColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.rect(0, 0, pageWidth, 28, 'F');
  doc.setFillColor(emeraldGreen[0], emeraldGreen[1], emeraldGreen[2]);
  doc.rect(0, 28, pageWidth, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('M-GAS TECHNICAL SPECIFICATIONS & LOGISTICS GUIDE', 14, 18);

  currentY = 40;

  // Logistics & Container Capacity Section
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text('1. CONTAINER LOADING & PACKAGING LOGISTICS', 14, currentY);
  currentY += 6;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(50, 50, 50);
  const logisticsDesc = 
    'Cylinders are packed on heat-treated fumigated wooden pallets or bulk loaded with protective plastic netting and strapping. ' +
    '20ft standard containers hold approximately 900 to 1,200 units (depending on volume), while 40ft High Cube (HQ) containers ' +
    'accommodate up to 2,400+ units. International shipping available on FOB Bandar Abbas or CIF destination port terms.';
  doc.text(doc.splitTextToSize(logisticsDesc, pageWidth - 28), 14, currentY);
  currentY += 20;

  // Customization & Powder Coating
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text('2. RAL POWDER COATING & CUSTOM EMBOSSING', 14, currentY);
  currentY += 6;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  const coatingDesc = 
    'All cylinders undergo automated grit/shot blasting followed by high-adhesion electrostatic thermosetting polyester powder coating ' +
    '(thickness 60-80 microns). Color options include standard RAL Classic shades (e.g., RAL 6018 Yellow Green, RAL 5015 Sky Blue, ' +
    'RAL 2004 Pure Orange, RAL 3020 Traffic Red, RAL 1021 Rape Yellow). Custom logo embossing and serial number stamping available.';
  doc.text(doc.splitTextToSize(coatingDesc, pageWidth - 28), 14, currentY);
  currentY += 22;

  // Valve Standards
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text('3. VALVE THREADS & SAFETY RELIEF MECHANISMS', 14, currentY);
  currentY += 6;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  const valveDesc = 
    'Compatible with universal valve configurations including POL (CGA 510), G.4 / G.8 European threads, 20mm/22mm Quick-On compact valves, ' +
    'and BS 341 No. 4 fittings with integrated pressure relief valves (PRV) rated at 25-28 Bar for fail-safe thermal protection.';
  doc.text(doc.splitTextToSize(valveDesc, pageWidth - 28), 14, currentY);
  currentY += 20;

  // Verification & RFQ Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, currentY, pageWidth - 28, 48, 2, 2, 'FD');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text('HOW TO REQUEST A FORMAL RFQ & COMMERCIAL INVOICE', 18, currentY + 8);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  doc.text('1. Visit https://mgas.ir and use the interactive RFQ Container Estimator.', 18, currentY + 16);
  doc.text('2. Select required cylinder models, capacities, quantity, and RAL coating color.', 18, currentY + 22);
  doc.text('3. Dispatch your quote directly via WhatsApp to our International Sales Director (+44 7833 783825).', 18, currentY + 28);
  doc.text('4. Receive a comprehensive Proforma Invoice (PI) with shipping schedule within 24 hours.', 18, currentY + 34);

  // Footer on Page 2
  doc.setFontSize(7.5);
  doc.setTextColor(140, 140, 140);
  doc.text('M Gas Cylinders Industrial Group © 1970-2026. All technical parameters are subject to continuous engineering enhancement.', 14, pageHeight - 10);

  // Save the PDF file
  const fileName = `M-Gas-Industrial-LPG-Cylinders-Catalog-2026.pdf`;
  doc.save(fileName);
};
