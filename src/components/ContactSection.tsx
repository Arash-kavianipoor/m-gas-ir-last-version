import React, { useState } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  ExternalLink,
  ShieldCheck,
  Building,
  CheckCircle2,
} from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';
import { useLanguage } from '../i18n/LanguageContext';
import { COMPANY_INFO } from '../data/company';

export const ContactSection: React.FC = () => {
  const { currentLanguage, t, isRTL } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    const fullMsg = `*M Gas Contact Inquiry*\n--------------------\n*Name:* ${name}\n*Company:* ${
      company || 'N/A'
    }\n*Email:* ${email || 'N/A'}\n*Phone:* ${phone}\n*Message:* ${message}`;

    const url = `https://wa.me/${COMPANY_INFO.contacts.internationalSalesManager.whatsapp.replace('+', '')}?text=${encodeURIComponent(
      fullMsg
    )}`;

    window.open(url, '_blank');
  };

  return (
    <section id="contact" className="py-20 bg-[#060E13] relative">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
            <Phone className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t.contactBadge}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {t.contactTitle}
          </h2>

          <p className="text-sm sm:text-base text-slate-300">
            {t.contactSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Cards: Contact Info, Phones, Emails & Hours */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* International WhatsApp Sales Hotlines */}
            <div className="p-6 rounded-3xl bg-slate-900/70 border border-emerald-500/30 backdrop-blur-xl space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <WhatsAppIcon className="w-5 h-5 text-[#25D366]" />
                  <span>{t.contactInternationalSales}</span>
                </h3>
                <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                  Online
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-sm font-bold text-white block">
                  {currentLanguage === 'fa'
                    ? COMPANY_INFO.contacts.internationalSalesManager.persianName
                    : COMPANY_INFO.contacts.internationalSalesManager.name}
                </span>
                <span className="text-xs text-slate-400 block">
                  {currentLanguage === 'fa'
                    ? COMPANY_INFO.contacts.internationalSalesManager.roleFa
                    : COMPANY_INFO.contacts.internationalSalesManager.roleEn}
                </span>
              </div>

              <a
                href={`https://wa.me/${COMPANY_INFO.contacts.internationalSalesManager.whatsapp.replace('+', '')}?text=Hello%20M%20Gas%20Sales`}
                target="_blank"
                rel="noopener noreferrer"
                dir="ltr"
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-700/40 text-emerald-300 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
                  <span className="font-mono text-xs font-bold isolate">
                    {COMPANY_INFO.contacts.internationalSalesManager.whatsappDisplay}
                  </span>
                </div>
                <span className="text-[10px] bg-emerald-500 text-slate-950 font-bold px-2 py-0.5 rounded">
                  Chat WhatsApp
                </span>
              </a>
            </div>

            {/* Factory Management & Domestic Hotline */}
            <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-xl space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Building className="w-5 h-5 text-teal-400" />
                  <span>{t.contactDomesticManagement}</span>
                </h3>
              </div>

              <div className="space-y-1">
                <span className="text-sm font-bold text-white block">
                  {currentLanguage === 'fa'
                    ? COMPANY_INFO.contacts.domesticDirector.persianName
                    : COMPANY_INFO.contacts.domesticDirector.name}
                </span>
                <span className="text-xs text-slate-400 block">
                  {currentLanguage === 'fa'
                    ? COMPANY_INFO.contacts.domesticDirector.roleFa
                    : COMPANY_INFO.contacts.domesticDirector.roleEn}
                </span>
              </div>

              <div className="space-y-2">
                <a
                  href={`tel:${COMPANY_INFO.contacts.domesticDirector.mobile}`}
                  dir="ltr"
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 hover:text-emerald-400 transition-colors text-xs font-mono isolate"
                >
                  <span className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{COMPANY_INFO.contacts.domesticDirector.mobileDisplay}</span>
                  </span>
                  <span className="text-[10px] text-slate-400">Mobile Hotline</span>
                </a>

                <a
                  href={`tel:${COMPANY_INFO.contacts.domesticDirector.landline}`}
                  dir="ltr"
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-emerald-400 transition-colors text-xs font-mono isolate"
                >
                  <span className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>{COMPANY_INFO.contacts.domesticDirector.landlineDisplay}</span>
                  </span>
                  <span className="text-[10px] text-slate-400">Factory Landline</span>
                </a>
              </div>
            </div>

            {/* Shift Work Hours & Location details */}
            <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-xl space-y-4 shadow-xl">
              <div className="flex items-center gap-2 text-white font-bold text-base border-b border-slate-800 pb-3">
                <Clock className="w-5 h-5 text-emerald-400" />
                <span>{t.contactShiftHours}</span>
              </div>

              <div className="space-y-1 text-xs text-slate-300">
                <p className="font-semibold text-slate-200">{t.contactShiftHoursValue}</p>
                <p className="text-emerald-400">{t.contactFridayStatus}</p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{t.addressTitle}</span>
                  </span>
                  <span className="font-mono text-[10px] text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/50">
                    QX6W+RX6
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {currentLanguage === 'fa' ? COMPANY_INFO.address.fullPersian : COMPANY_INFO.address.fullEnglish}
                </p>

                {/* Live Rectangular Google Map Container */}
                <div className="relative rounded-2xl overflow-hidden border border-emerald-500/30 bg-slate-950 shadow-xl group">
                  <iframe
                    title="M Gas Factory Live Google Map"
                    src={COMPANY_INFO.address.googleMapEmbedUrl}
                    width="100%"
                    height="190"
                    style={{ border: 0 }}
                    allowFullScreen={false}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="w-full h-48 filter contrast-[1.05] grayscale-[15%] group-hover:grayscale-0 transition-all duration-300"
                  />
                  <div className="p-2.5 bg-slate-900/95 border-t border-slate-800 flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-300 text-[11px]">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">{COMPANY_INFO.address.locationCode}</span>
                    </div>
                    <a
                      href={COMPANY_INFO.address.googleMapDirectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow transition-all shrink-0"
                    >
                      <span>{t.getDirections}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Form: Interactive Inquiry Dispatcher */}
          <div className="lg:col-span-7">
            <div className="p-8 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-xl shadow-2xl space-y-6">
              
              <div className="space-y-1 border-b border-slate-800 pb-4">
                <h3 className="text-xl font-bold text-white">
                  {t.formSubmitWhatsApp}
                </h3>
                <p className="text-xs text-slate-400">
                  {t.formRedirectNotice}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 font-medium block">
                      {t.formName} *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Ali Rezaei / John Smith"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 font-medium block">
                      {t.formPhone} *
                    </label>
                    <input
                      type="text"
                      dir="ltr"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+98 912... / +44 783..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-emerald-500 transition-colors isolate"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 font-medium block">
                      {t.formEmail}
                    </label>
                    <input
                      type="email"
                      dir="ltr"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-emerald-500 transition-colors isolate"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 font-medium block">
                      {t.formCompany}
                    </label>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Company / Organization Name"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-medium block">
                    {t.formMessage} *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Specify cylinder capacities, quantity requirements, destination port, or specific standard requirements..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-xl shadow-emerald-950/50 flex items-center justify-center gap-2.5 transition-all transform hover:-translate-y-0.5"
                >
                  <WhatsAppIcon className="w-4 h-4 text-white" />
                  <span>{t.formSubmitWhatsApp}</span>
                </button>

                {submitted && (
                  <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Inquiry opened in WhatsApp. Our engineering sales team will review promptly.</span>
                  </div>
                )}
              </form>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
