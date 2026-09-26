import React, { useState } from 'react';
import {
  ShieldCheck,
  Gauge,
  Sparkles,
  SearchCheck,
  Award,
  Layers,
  Flame,
  CheckCircle2,
  Cpu,
  Activity,
  FileCheck,
  Maximize2,
  X,
  ExternalLink,
  Download,
  FileText,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../i18n/LanguageContext';
import { GlowCard } from './ui/GlowCard';
import { FACTORY_CERTIFICATES, FactoryCertificate } from '../data/certificates';

export const QualityProcess: React.FC = () => {
  const { t, isRTL, currentLanguage } = useLanguage();
  const [selectedCert, setSelectedCert] = useState<FactoryCertificate | null>(null);

  const getCertLoc = (record: Record<string, string>) => {
    return record[currentLanguage] || record['fa'] || record['en'] || '';
  };

  const testingSteps = [
    {
      id: 'step-1',
      title: t.step1Title,
      desc: t.step1Desc,
      icon: Gauge,
      badge: '30 Bar / 435 PSI',
      glow: 'emerald' as const,
    },
    {
      id: 'step-2',
      title: t.step2Title,
      desc: t.step2Desc,
      icon: SearchCheck,
      badge: '100% Non-Destructive',
      glow: 'blue' as const,
    },
    {
      id: 'step-3',
      title: t.step3Title,
      desc: t.step3Desc,
      icon: Sparkles,
      badge: 'Sa 2.5 / 120µm',
      glow: 'purple' as const,
    },
    {
      id: 'step-4',
      title: t.step4Title,
      desc: t.step4Desc,
      icon: ShieldCheck,
      badge: 'ISO / EN 1442',
      glow: 'green' as const,
    },
  ];

  return (
    <section id="quality" className="py-20 bg-[#060F14] relative">
      
      {/* Background soft ambient glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-10 w-[500px] h-[500px] bg-emerald-600/5 rounded-full blur-[140px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t.qualityBadge}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {t.qualityTitle}
          </h2>

          <p className="text-sm sm:text-base text-slate-300">
            {t.qualitySubtitle}
          </p>
        </div>

        {/* 4 Process Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testingSteps.map((step) => {
            const Icon = step.icon;
            return (
              <GlowCard
                key={step.id}
                glowColor={step.glow}
                className="flex flex-col justify-between p-6 bg-slate-900/90 space-y-4 h-full"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-950/80 border border-emerald-700/40 flex items-center justify-center text-emerald-400 shadow-md">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/30">
                      {step.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white tracking-wide">
                    {step.title}
                  </h3>

                  <p className="text-xs text-slate-400 leading-relaxed text-justify">
                    {step.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Quality Assured</span>
                </div>
              </GlowCard>
            );
          })}
        </div>

        {/* Metallurgical & Engineering Quality Highlights Banner */}
        <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-950/60 via-slate-900/80 to-teal-950/60 border border-emerald-500/20 backdrop-blur-xl shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-start">
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-900/50 border border-emerald-700/40 flex items-center justify-center text-emerald-300 shrink-0">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Robotic Seam Welding</h4>
                <p className="text-xs text-slate-400 mt-0.5">{t.step2Title} - {t.step2Desc}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-900/50 border border-emerald-700/40 flex items-center justify-center text-emerald-300 shrink-0">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">X-Ray & Radiography</h4>
                <p className="text-xs text-slate-400 mt-0.5">{t.step5Title} - {t.step5Desc}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-900/50 border border-emerald-700/40 flex items-center justify-center text-emerald-300 shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">30 Bar Test Margin</h4>
                <p className="text-xs text-slate-400 mt-0.5">{t.step4Title} - {t.step4Desc}</p>
              </div>
            </div>

          </div>
        </div>

        {/* OFFICIAL FACTORY CERTIFICATES & ACCREDITATIONS SECTION (From about us.zip) */}
        <div className="mt-16 pt-12 border-t border-slate-800/80">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-2">
                <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  {currentLanguage === 'fa' ? 'اسناد رسمی و پروانه‌ها' : 'Official Accreditations'}
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {currentLanguage === 'fa'
                  ? 'گواهینامه‌ها و پروانه‌های استاندارد کارخانه م گاز'
                  : 'M Gas Factory Official Standard Certificates & Approvals'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
                {currentLanguage === 'fa'
                  ? 'تمامی محصولات تولیدی م گاز دارای تاییدیه صلاحیت فنی، پروانه استاندارد ملی ایران و انطباق با استانداردهای مدیریت کیفیت می‌باشند.'
                  : 'All M Gas cylinders and pressure vessels are certified under national standards and international quality management frameworks.'}
              </p>
            </div>

            <span className="text-xs font-mono text-emerald-400 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-emerald-500/30 self-start sm:self-auto">
              3 Verified Certificates
            </span>
          </div>

          {/* Certificates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FACTORY_CERTIFICATES.map((cert, cIdx) => (
              <div
                key={cert.id}
                className="group relative rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-emerald-500/50 p-4 transition-all duration-300 flex flex-col justify-between shadow-lg hover:shadow-emerald-950/40"
              >
                {/* Certificate Scan Preview */}
                <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-slate-950 border border-white/10 mb-4 flex items-center justify-center group-hover:border-emerald-500/30 transition-colors">
                  <img
                    src={cert.image}
                    alt={getCertLoc(cert.title)}
                    width={300}
                    height={400}
                    loading="lazy"
                    decoding="async"
                    style={{ aspectRatio: '3/4' }}
                    className="w-full h-full object-cover object-top filter group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />

                  {/* Gradient & Hover Actions */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                  {/* Standard Tag Badge */}
                  <div className="absolute top-2.5 start-2.5 px-2 py-1 rounded-md bg-slate-950/85 border border-emerald-500/40 text-[11px] font-mono font-bold text-emerald-300 backdrop-blur-sm">
                    {cert.standardCode}
                  </div>

                  {/* Inspect HD Button */}
                  <button
                    type="button"
                    onClick={() => setSelectedCert(cert)}
                    className="absolute inset-0 m-auto w-12 h-12 rounded-2xl bg-emerald-500/90 hover:bg-emerald-400 text-slate-950 flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100 transition-all duration-200 shadow-xl"
                    title={currentLanguage === 'fa' ? 'مشاهده سند با کیفیت اصلی' : 'Inspect HD Certificate'}
                  >
                    <Maximize2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Certificate Details */}
                <div className="space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                      {getCertLoc(cert.issuer)}
                    </span>
                    <h4 className="text-sm font-bold text-white leading-snug mt-0.5">
                      {getCertLoc(cert.title)}
                    </h4>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                      {getCertLoc(cert.scope)}
                    </p>
                  </div>

                  {/* Card Footer */}
                  <div className="pt-3 mt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {currentLanguage === 'fa' ? 'سند معتبر و تاییدشده' : 'Verified Document'}
                    </span>

                    <button
                      type="button"
                      onClick={() => setSelectedCert(cert)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                    >
                      <Maximize2 className="w-3 h-3 text-emerald-400" />
                      <span>{currentLanguage === 'fa' ? 'مشاهده سند' : 'View HD'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>

      {/* FULLSCREEN HD CERTIFICATE VIEWER MODAL */}
      <AnimatePresence>
        {selectedCert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-lg p-4"
            onClick={() => setSelectedCert(null)}
          >
            <div
              className="relative max-w-4xl w-full max-h-[92vh] bg-slate-900 rounded-3xl border border-emerald-500/40 shadow-2xl overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white">
                      {getCertLoc(selectedCert.title)}
                    </h3>
                    <p className="text-xs text-emerald-400 font-mono">
                      {selectedCert.standardCode} — {getCertLoc(selectedCert.issuer)}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedCert(null)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  title="بستن"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Certificate Image Stage */}
              <div className="relative flex-1 bg-black/80 flex items-center justify-center p-3 sm:p-6 overflow-auto aspect-[3/4]">
                <img
                  src={selectedCert.image}
                  alt={getCertLoc(selectedCert.title)}
                  width={800}
                  height={1067}
                  loading="lazy"
                  decoding="async"
                  style={{ aspectRatio: '3/4' }}
                  className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-2xl border border-white/10"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <p className="text-slate-400 text-center sm:text-start">
                  {getCertLoc(selectedCert.scope)}
                </p>

                <a
                  href={selectedCert.image}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors shrink-0"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{currentLanguage === 'fa' ? 'مشاهده در تب جدید' : 'Open Full Image'}</span>
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </section>
  );
};

