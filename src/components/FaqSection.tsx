import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { HelpCircle, ChevronDown, MessageCircle } from 'lucide-react';
import { COMPANY_INFO } from '../data/company';
import { FAQS_DATA } from '../data/faqs';
import { PAGE_TRANSLATIONS } from '../i18n/pageTranslations';

interface FaqSectionProps {
  onOpenRfq?: () => void;
}

export const FaqSection: React.FC<FaqSectionProps> = ({ onOpenRfq }) => {
  const { currentLanguage } = useLanguage();
  const pt = PAGE_TRANSLATIONS[currentLanguage] || PAGE_TRANSLATIONS.fa;
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="relative py-24 bg-slate-950 border-t border-slate-800 overflow-hidden">
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <HelpCircle className="w-4 h-4" />
            <span>{pt.faqBadge}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {pt.faqTitle}
          </h2>
        </div>

        {/* Accordion */}
        <div className="space-y-4">
          {FAQS_DATA.map((faq, idx) => {
            const isOpen = openIndex === idx;
            const loc = faq.locales[currentLanguage] || faq.locales.fa;
            return (
              <div
                key={faq.id}
                className="rounded-2xl bg-slate-900/60 border border-slate-800/80 overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-5 flex items-center justify-between text-start gap-4 hover:bg-slate-900/90 transition-colors"
                >
                  <span className="text-sm sm:text-base font-bold text-slate-100">
                    {loc.question}
                  </span>
                  <div
                    className={`p-1.5 rounded-lg bg-slate-800 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-emerald-400 bg-emerald-500/10' : ''
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/40">
                    {loc.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Callout */}
        <div className="mt-12 p-6 rounded-2xl bg-emerald-950/30 border border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-start">
          <div>
            <h4 className="text-sm font-bold text-white">
              {pt.faqUnlistedTitle}
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              {pt.faqUnlistedDesc}
            </p>
          </div>

          <a
            href={`https://wa.me/${COMPANY_INFO.contacts.internationalSalesManager.whatsapp.replace('+', '')}?text=Hello%20M%20Gas%20Sales`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 text-xs font-bold transition-all flex items-center gap-2 shrink-0 shadow-lg shadow-[#25D366]/20"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{pt.faqChatWhatsApp}</span>
          </a>
        </div>

      </div>
    </section>
  );
};
