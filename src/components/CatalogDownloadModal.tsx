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
import { useRouter } from '../router/RouterContext';
import { scrollToTop as smoothOrInstantScrollToTop } from '../utils/scrollHelper';
import { generateAndDownloadCatalogPdf } from '../utils/pdfGenerator';
import { COMPANY_INFO } from '../data/company';
import { PAGE_TRANSLATIONS } from '../i18n/pageTranslations';

interface CatalogDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CatalogDownloadModal: React.FC<CatalogDownloadModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { currentLanguage, isRTL, t } = useLanguage();
  const { navigate } = useRouter();
  const pt = PAGE_TRANSLATIONS[currentLanguage] || PAGE_TRANSLATIONS.fa;
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn cursor-pointer"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl bg-[#0C1520] border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden text-slate-200 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background decorative glows - desktop only */}
        <div className="hidden lg:block absolute -top-20 -right-20 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="hidden lg:block absolute -bottom-20 -left-20 w-48 h-48 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

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

        {/* Header Content with Exact Header Brand Logo */}
        <div className="flex items-start gap-3 sm:gap-4 mb-6">
          <div className="flex items-center justify-center p-1.5 sm:p-2 min-w-[95px] sm:min-w-[110px] h-12 sm:h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/40 shrink-0 shadow-sm">
            <img
              src="/logo/new-logo-mgas-2.svg"
              alt="M Gas Logo"
              width={110}
              height={48}
              decoding="async"
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.src.endsWith('.png')) {
                  target.src = '/logo/new-logo-mgas-2.png';
                }
              }}
              className="w-auto h-8 sm:h-10 max-w-[100px] object-contain filter drop-shadow-md"
            />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 text-[11px] font-semibold mb-1 border border-emerald-500/20">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>{pt.catalogEditionBadge}</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white leading-snug">
              {pt.catalogModalTitle}
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              {pt.catalogModalDesc}
            </p>
          </div>
        </div>

        {/* Download Action Buttons */}
        <div className="space-y-3">
          {/* Primary Action: Direct Download Technical PDF */}
          <button
            type="button"
            onClick={handleDownloadGeneratedPdf}
            disabled={downloading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
          >
            {downloading ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>{pt.catalogGeneratingPdf}</span>
              </>
            ) : downloadSuccess ? (
              <>
                <CheckCircle className="w-4 h-4 text-slate-950" />
                <span>{pt.catalogDownloadSuccess}</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-slate-950" />
                <span>{pt.catalogDownloadBtn}</span>
              </>
            )}
          </button>

          {/* Secondary Actions: Open Online 2D Drawings & WhatsApp Inquiry */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => {
                onClose();
                navigate('/catalog');
                smoothOrInstantScrollToTop();
              }}
              className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-medium text-slate-200 hover:text-white transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
              <span>{pt.catalogViewOnlineBtn}</span>
            </button>

            <a
              href={`https://wa.me/${COMPANY_INFO.contacts.internationalSalesManager.whatsapp.replace('+', '')}?text=${encodeURIComponent(
                'Hello M Gas, please send me your latest product catalog and price list via WhatsApp.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-800/60 text-xs font-medium text-emerald-300 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span className="truncate">{pt.catalogDirectInquiry}</span>
            </a>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span>{COMPANY_INFO.name}</span>
          <span className="font-mono text-emerald-400/90">{pt.catalogStandardProof}</span>
        </div>
      </div>
    </div>
  );
};
