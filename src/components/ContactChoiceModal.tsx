import React, { useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { Phone, MessageCircle, X, ExternalLink } from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';
import { LanguageCode } from '../types';
import { COMPANY_INFO } from '../data/company';

interface ContactChoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  phoneNumber?: string;
  whatsappMessage?: string;
}

export const ContactChoiceModal: React.FC<ContactChoiceModalProps> = ({
  isOpen,
  onClose,
  phoneNumber = COMPANY_INFO.contacts.internationalSalesManager.whatsapp,
  whatsappMessage = 'Hello M Gas Sales',
}) => {
  const { currentLanguage, isRTL } = useLanguage();
  const lang = (currentLanguage as LanguageCode) || 'fa';

  const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const labels = {
    title: {
      fa: 'نحوه ارتباط با مسئول فروش',
      en: 'Choose Contact Method',
      ar: 'اختر طريقة التواصل',
      de: 'Kontaktmethode wählen',
      ur: 'رابطے کا طریقہ منتخب کریں',
      hy: 'Ընտրեք կապի եղանակը',
      tr: 'İletişim Yöntemini Seçin',
      ru: 'Выберите способ связи',
    },
    subtitle: {
      fa: 'تمایل دارید از طریق پیام‌رسان واتس‌اپ گفتگو کنید یا تماس مستقیم تلفنی برقرار نمایید؟',
      en: 'Would you like to chat on WhatsApp or place a direct phone call?',
      ar: 'هل تفضل المحادثة عبر واتساب أو إجراء مكالمة هاتفية مباشرة؟',
      de: 'Möchten Sie über WhatsApp schreiben oder direkt anrufen?',
      ur: 'کیا آپ واٹس ایپ پر رابطہ کرنا چاہتے ہیں یا براہ راست فون کال؟',
      hy: 'Ցանկանո՞ւմ եք գրել WhatsApp-ով, թե՞ կատարել ուղիղ հեռախոսազանգ:',
      tr: 'WhatsApp üzerinden mesaj mı göndermek yoksa doğrudan aramak mı istersiniz?',
      ru: 'Вы хотите написать в WhatsApp или совершить прямой телефонный звонок?',
    },
    personName: {
      fa: 'آرش کاویانی‌پور',
      en: 'Arash Kavianipoor',
      ar: 'آرش كاویانی‌بور',
      de: 'Arash Kavianipoor',
      ur: 'آرش کاویانی پور',
      hy: 'Արաշ Կավիանիպուր',
      tr: 'Arash Kavianipoor',
      ru: 'Араш Кавианипур',
    },
    roleTitle: {
      fa: 'مسئول فروش بین‌المللی و صادرات',
      en: 'International Sales & Export Officer',
      ar: 'مسؤول المبيعات والتصدير الدولي',
      de: 'Internationaler Vertriebsleiter & Export',
      ur: 'بین الاقوامی سیلز آفیسر و برآمدات',
      hy: 'Միջազգային վաճառքի պատասխանատու',
      tr: 'Uluslararası Satış Sorumlusu',
      ru: 'Ответственный за международные продажи и экспорт',
    },
    whatsappAction: {
      fa: 'پیام در واتس‌اپ',
      en: 'Chat on WhatsApp',
      ar: 'مراسلة عبر واتساب',
      de: 'Über WhatsApp schreiben',
      ur: 'واٹس ایپ پر میسج',
      hy: 'Գրել WhatsApp-ով',
      tr: 'WhatsApp ile Mesaj',
      ru: 'Написать в WhatsApp',
    },
    whatsappSub: {
      fa: 'پاسخگویی سریع آنلاین و ارسال پیش‌فاکتور',
      en: 'Fast online response & quote dispatch',
      ar: 'رد سريع وإرسال عروض الأسعار',
      de: 'Schnelle Online-Antwort & Angebot',
      ur: 'تیز آن لائن جواب اور کوٹیشن',
      hy: 'Արագ առցանց պատասխան',
      tr: 'Hızlı çevrimiçi yanıt ve teklif',
      ru: 'Быстрый онлайн-ответ и расчет',
    },
    callAction: {
      fa: 'تماس مستقیم تلفنی',
      en: 'Direct Phone Call',
      ar: 'اتصال هاتفي مباشر',
      de: 'Direkt anrufen',
      ur: 'براہ راست فون کال',
      hy: 'Ուղիղ հեռախոսազանգ',
      tr: 'Doğrudan Telefonla Ara',
      ru: 'Прямой телефонный звонок',
    },
    callSub: {
      fa: 'مکالمه صوتی مستقیم با خط موبایل',
      en: 'Direct cellular voice call',
      ar: 'مكالمة صوتية مباشرة',
      de: 'Direkter Sprachanruf',
      ur: 'موبائل پر براہ راست صوتی رابطہ',
      hy: 'Ուղիղ ձայնային զանգ',
      tr: 'Doğrudan sesli arama',
      ru: 'Прямой голосовой звонок',
    },
    cancel: {
      fa: 'انصراف',
      en: 'Cancel',
      ar: 'إلغاء',
      de: 'Abbrechen',
      ur: 'منسوخ کریں',
      hy: 'Չեղարկել',
      tr: 'İptal',
      ru: 'Отмена',
    },
  };

  const handleWhatsApp = () => {
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    onClose();
  };

  const handlePhoneCall = () => {
    window.location.href = `tel:+${cleanPhone}`;
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[120] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-gradient-to-b from-slate-900 to-[#08151e] border border-emerald-500/30 rounded-3xl p-6 sm:p-7 shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 end-4 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          aria-label={labels.cancel[lang] || labels.cancel.fa}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header with Phone Display */}
        <div className="text-center pt-1 pb-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 mb-3 shadow-inner">
            <Phone className="w-5 h-5 text-emerald-400" />
          </div>

          <h3 className="text-lg font-black text-white mb-1">
            {labels.title[lang] || labels.title.fa}
          </h3>

          {/* Number Display Pill */}
          <div className="mt-2 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950 border border-emerald-500/40 text-emerald-300 font-mono text-sm font-bold shadow-inner">
            <span dir="ltr">{COMPANY_INFO.contacts.internationalSalesManager.whatsappDisplay}</span>
          </div>

          {/* Officer Info */}
          <div className="mt-2 text-xs text-slate-300 font-medium">
            <span>{labels.personName[lang] || labels.personName.fa}</span>
            <span className="mx-1.5 text-slate-600">·</span>
            <span className="text-emerald-400/90">{labels.roleTitle[lang] || labels.roleTitle.fa}</span>
          </div>

          <p className="mt-3 text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
            {labels.subtitle[lang] || labels.subtitle.fa}
          </p>
        </div>

        {/* Choice Buttons */}
        <div className="space-y-3 mt-2">
          {/* Option 1: WhatsApp */}
          <button
            type="button"
            onClick={handleWhatsApp}
            className="w-full group flex items-center justify-between p-3.5 rounded-2xl bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/40 hover:border-[#25D366]/70 transition-all cursor-pointer shadow-lg shadow-[#25D366]/5"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#25D366] text-slate-950 flex items-center justify-center shadow-md shrink-0 group-hover:scale-105 transition-transform">
                <WhatsAppIcon className="w-5 h-5 text-slate-950" />
              </div>
              <div className="text-start">
                <span className="text-sm font-bold text-white block group-hover:text-[#25D366] transition-colors">
                  {labels.whatsappAction[lang] || labels.whatsappAction.fa}
                </span>
                <span className="text-[11px] text-slate-400 block">
                  {labels.whatsappSub[lang] || labels.whatsappSub.fa}
                </span>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-[#25D366] opacity-80 group-hover:opacity-100 transition-opacity shrink-0" />
          </button>

          {/* Option 2: Direct Phone Call */}
          <button
            type="button"
            onClick={handlePhoneCall}
            className="w-full group flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-700/80 hover:border-emerald-500/50 transition-all cursor-pointer shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center shadow-md shrink-0 group-hover:scale-105 transition-transform">
                <Phone className="w-5 h-5 text-slate-950" />
              </div>
              <div className="text-start">
                <span className="text-sm font-bold text-white block group-hover:text-emerald-300 transition-colors">
                  {labels.callAction[lang] || labels.callAction.fa}
                </span>
                <span className="text-[11px] text-slate-400 block">
                  {labels.callSub[lang] || labels.callSub.fa}
                </span>
              </div>
            </div>
            <Phone className="w-4 h-4 text-emerald-400 opacity-80 group-hover:opacity-100 transition-opacity shrink-0" />
          </button>
        </div>

        {/* Bottom Cancel */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-slate-500 hover:text-slate-300 py-1 px-3 transition-colors cursor-pointer"
          >
            {labels.cancel[lang] || labels.cancel.fa}
          </button>
        </div>
      </div>
    </div>
  );
};
