import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { useRouter, Link } from '../router/RouterContext';
import { CYLINDER_DRAWINGS } from '../data/cylinderDrawings';
import { COMPANY_INFO } from '../data/company';
import {
  Printer,
  Download,
  FileText,
  ChevronRight,
  ShieldCheck,
  Award,
  Sparkles,
  MessageCircle,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
} from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';
import { PAGE_TRANSLATIONS } from '../i18n/pageTranslations';
import { LanguageCode } from '../types';

const PRINT_LABELS: Record<LanguageCode, string> = {
  fa: 'چاپ / ذخیره در ۳ صفحه A4',
  en: 'Print / Save 3-Page A4',
  de: 'Drucken (3 A4-Seiten)',
  ar: 'طباعة / حفظ في ٣ صفحات A4',
  ur: 'پرنٹ کریں (3 صفحات A4)',
  hy: 'Տպել (3 էջ A4)',
  tr: 'Yazdır (3 Sayfa A4)',
  ru: 'Печать (3 страницы A4)',
};

export const CatalogPage: React.FC = () => {
  const { currentLanguage, isRTL, t } = useLanguage();
  const { navigate } = useRouter();
  const pt = PAGE_TRANSLATIONS[currentLanguage] || PAGE_TRANSLATIONS.fa;

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  const itemsPerPage = 6;
  const totalPages = Math.ceil(CYLINDER_DRAWINGS.length / itemsPerPage);
  const pages = Array.from({ length: totalPages }, (_, i) =>
    CYLINDER_DRAWINGS.slice(i * itemsPerPage, (i + 1) * itemsPerPage)
  );

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    const link = document.createElement('a');
    link.href = '/catalog/m-gas-official-catalog-2026.pdf';
    link.download = 'M-Gas-Official-Catalog-2026.pdf';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="pt-24 pb-20 min-h-screen bg-[#071018] text-slate-100">
      {/* Print-specific style rules to guarantee exact 3 A4 pages */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm 10mm;
          }
          body {
            background: #fff !important;
            color: #111 !important;
            padding: 0 !important;
            margin: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          header#main-header,
          footer#footer,
          .no-print,
          .catalog-screen-toolbar,
          .catalog-breadcrumb {
            display: none !important;
          }
          .catalog-a4-page {
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            padding: 0 0 4mm 0 !important;
            page-break-after: always !important;
            page-break-inside: avoid !important;
            break-after: page !important;
            break-inside: avoid !important;
            height: 280mm !important;
            max-height: 282mm !important;
            border-radius: 0 !important;
            background: #fff !important;
            color: #111 !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
          }
          .catalog-a4-page:last-child {
            page-break-after: auto !important;
            break-after: auto !important;
          }
          .catalog-cylinder-row {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
            padding: 4px 0 !important;
            border-bottom: 1px solid #cbd5e1 !important;
          }
          .catalog-info-box {
            background: #fafafa !important;
            border: 1px solid #222 !important;
          }
        }
      `}</style>

      {/* Screen Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 no-print">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6 catalog-breadcrumb">
          <Link to="/" className="hover:text-emerald-400 transition-colors">
            {t.navHome}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600 rtl:rotate-180" />
          <span className="text-amber-400 font-semibold">
            {pt.catalogModalTitle}
          </span>
        </nav>

        {/* Page Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900/95 via-[#0c1a24]/95 to-slate-900/95 border border-amber-500/30 shadow-2xl mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>{pt.catalogEditionBadge}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight">
                {pt.catalogModalTitle}
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-3xl">
                {pt.catalogModalDesc}
              </p>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={handlePrint}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs sm:text-sm shadow-xl shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>{PRINT_LABELS[currentLanguage as LanguageCode] || 'Print / Save 3-Page A4'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadPdf}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{pt.catalogDownloadBtn}</span>
              </button>

              <a
                href={`https://wa.me/${COMPANY_INFO.contacts.internationalSalesManager.whatsapp.replace('+', '')}?text=${encodeURIComponent(
                  'Hello M Gas, I am reviewing the 18-model cylinder catalog and would like to request price quote.'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 text-xs sm:text-sm font-semibold transition-colors"
              >
                <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
                <span className="hidden sm:inline">WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* The 3 A4 Pages Container */}
      <div className="max-w-4xl mx-auto px-2 sm:px-4 space-y-8">
        {pages.map((pageCylinders, pageIndex) => {
          const pageNumber = pageIndex + 1;
          return (
            <div
              key={pageNumber}
              className="catalog-a4-page bg-white text-slate-900 rounded-2xl p-6 sm:p-8 shadow-2xl border border-slate-300 overflow-hidden flex flex-col justify-between"
              style={{ minHeight: '1050px' }}
            >
              {/* Page Header with Exact Factory Logo */}
              <div className="border-b-2 border-slate-900 pb-3 mb-4">
                <div className="flex items-center justify-between gap-4 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center px-3 py-1.5 min-w-[115px] h-14 rounded-2xl bg-[#071922] border border-emerald-500/70 shadow-md shrink-0">
                      <img
                        src="/logo/new-logo-mgas-2.svg"
                        alt="M Gas Factory Logo"
                        width={110}
                        height={48}
                        decoding="async"
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (!target.src.endsWith('.png')) {
                            target.src = '/logo/new-logo-mgas-2.png';
                          }
                        }}
                        className="h-10 w-auto max-w-[100px] object-contain filter drop-shadow-sm"
                      />
                    </div>
                    <div>
                      <div className="text-[11px] font-black text-emerald-700 tracking-wider uppercase">
                        M-GAS INDUSTRIAL GROUP (EST. 1970)
                      </div>
                      <h2 className="text-lg sm:text-xl font-black text-slate-950 leading-tight">
                        Gas Cylinder Specifications
                      </h2>
                      <div className="text-xs text-slate-600 font-medium">
                        2D Orthographic Dimensional Drawings &amp; Technical Specifications
                      </div>
                    </div>
                  </div>

                  <div className="text-end">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Page {pageNumber} of {totalPages}
                    </span>
                  </div>
                </div>

                <div className="text-center text-[10px] text-slate-500 border-t border-dashed border-slate-300 pt-1.5 mt-1 font-mono">
                  Units: Length &amp; Diameter in centimetres (cm) &nbsp;|&nbsp; Weight in kilograms (kg) &nbsp;|&nbsp; Certified to ISIRI 841 &amp; EN 1442
                </div>
              </div>

              {/* 6 Cylinders Rows */}
              <div className="flex-1 flex flex-col justify-between divide-y divide-slate-200">
                {pageCylinders.map((cylinder) => (
                  <div
                    key={cylinder.id}
                    className="catalog-cylinder-row flex flex-col sm:flex-row items-center justify-between gap-4 py-2"
                  >
                    {/* Left: SVG Drawing */}
                    <div
                      className="flex-1 flex items-center justify-center overflow-x-auto w-full"
                      dangerouslySetInnerHTML={{ __html: cylinder.svg }}
                    />

                    {/* Right: Info Box */}
                    <div className="catalog-info-box w-full sm:w-56 shrink-0 border border-slate-900 rounded-lg p-2.5 bg-slate-50 shadow-xs">
                      <h3 className="text-xs font-black text-slate-950 text-center pb-1.5 mb-1.5 border-b border-slate-300">
                        {cylinder.title}
                      </h3>
                      <table className="w-full text-xs">
                        <tbody>
                          <tr className="border-b border-slate-200">
                            <td className="text-slate-600 py-0.5">Weight:</td>
                            <td className="text-end font-bold text-slate-950 py-0.5">{cylinder.weight}</td>
                          </tr>
                          <tr className="border-b border-slate-200">
                            <td className="text-slate-600 py-0.5">Length:</td>
                            <td className="text-end font-bold text-slate-950 py-0.5">{cylinder.length}</td>
                          </tr>
                          <tr>
                            <td className="text-slate-600 py-0.5">Diameter:</td>
                            <td className="text-end font-bold text-slate-950 py-0.5">{cylinder.diameter}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>

              {/* Page Footer */}
              <div className="border-t border-slate-300 pt-2.5 mt-3 text-center text-[10px] text-slate-500 flex items-center justify-between">
                <span>M-Gas Industrial Group © 1970–2026</span>
                <span>Karaj Factory, Terans-e-Barq, Alborz, Iran</span>
                <span>Page {pageNumber} of {totalPages}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
