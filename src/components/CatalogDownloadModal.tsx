import React, { useState } from 'react';
import {
  FileText,
  Download,
  X,
  ShieldCheck,
  Award,
  Layers,
  ExternalLink,
  CheckCircle,
  Sparkles,
  Phone,
  MessageCircle,
  FileDown,
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { generateAndDownloadCatalogPdf } from '../utils/pdfGenerator';
import { COMPANY_INFO } from '../data/company';

interface CatalogDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CatalogDownloadModal: React.FC<CatalogDownloadModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { currentLanguage, isRTL, t } = useLanguage();
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const handleDownloadGeneratedPdf = () => {
    setDownloading(true);
    try {
      generateAndDownloadCatalogPdf({ language: currentLanguage });
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to generate PDF catalog:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl bg-[#0C1520] border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background decorative glows */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className={`absolute top-5 ${
            isRTL ? 'left-5' : 'right-5'
          } p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700/80 transition-colors z-20`}
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Content */}
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 shadow-lg shadow-emerald-950">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 text-[11px] font-semibold mb-1 border border-emerald-500/20">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>{currentLanguage === 'fa' ? 'نسخه رسمی ۲۰۲۶' : 'Official 2026 Edition'}</span>
            </div>
            <h3 className="text-xl font-bold text-white">
              {currentLanguage === 'fa'
                ? 'دریافت کاتالوگ جامع محصولات و مشخصات فنی'
                : 'Download Official LPG Cylinders Catalog'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {currentLanguage === 'fa'
                ? 'شامل مشخصات مهندسی تمام ۱۳ مدل کپسول، گواهینامه‌های ISO و EN 1442، کدهای رنگ RAL و شرایط ارسال صادراتی'
                : 'Comprehensive guide covering 13 cylinder models, ISO/EN certifications, RAL color charts, and container logistics'}
            </p>
          </div>
        </div>

        {/* Features Checklist inside Catalog */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 mb-6 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{currentLanguage === 'fa' ? '۱۳ مدل کپسول (خانگی، صنعتی، خودرویی)' : '13 Cylinder Models (Home, Industry, Auto)'}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{currentLanguage === 'fa' ? 'آزمون فشار ۳۰ بار و متالورژی ورق' : '30-Bar Hydrostatic Test Specs'}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{currentLanguage === 'fa' ? 'استاندارد EN 1442 و ISO 9001' : 'EN 1442 & ISO 9001 Compliance'}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{currentLanguage === 'fa' ? 'ظرفیت بارگیری کانتینرهای ۲۰ و ۴۰ فوت' : '20ft & 40ft HQ Container Capacities'}</span>
          </div>
        </div>

        {/* Download Action Buttons */}
        <div className="space-y-3">
          {/* Primary Action: Direct Download Generated Technical PDF */}
          <button
            type="button"
            onClick={handleDownloadGeneratedPdf}
            disabled={downloading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
          >
            {downloading ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>{currentLanguage === 'fa' ? 'در حال آماده‌سازی کاتالوگ...' : 'Generating PDF Catalog...'}</span>
              </>
            ) : downloadSuccess ? (
              <>
                <CheckCircle className="w-4 h-4 text-slate-950" />
                <span>{currentLanguage === 'fa' ? 'کاتالوگ با موفقیت دانلود شد!' : 'Catalog Downloaded Successfully!'}</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-slate-950" />
                <span>
                  {currentLanguage === 'fa'
                    ? 'دانلود مستقیم فایل PDF کاتالوگ (رایگان)'
                    : 'Download Official PDF Catalog (Free)'}
                </span>
              </>
            )}
          </button>

          {/* Secondary Action: Open / Direct Link to Static PDF Document */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <a
              href="/catalog/m-gas-official-catalog-2026.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-medium text-slate-300 hover:text-white transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
              <span>{currentLanguage === 'fa' ? 'مشاهده آنلاین فایل PDF' : 'View PDF in Browser'}</span>
            </a>

            <a
              href={`https://wa.me/${COMPANY_INFO.contacts.internationalSalesManager.whatsapp.replace('+', '')}?text=${encodeURIComponent(
                'Hello M Gas, please send me your latest product catalog and price list via WhatsApp.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-800/60 text-xs font-medium text-emerald-300 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>{currentLanguage === 'fa' ? 'دریافت در واتس‌اپ' : 'Request on WhatsApp'}</span>
            </a>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
          <span>{COMPANY_INFO.name}</span>
          <span className="font-mono">PDF • ISO 9001:2015</span>
        </div>
      </div>
    </div>
  );
};
