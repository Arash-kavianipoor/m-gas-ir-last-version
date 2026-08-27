import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { DOMESTIC_CUSTOMERS } from '../data/customers';
import { Building2, CheckCircle2 } from 'lucide-react';

export const CustomerBrandsStrip: React.FC = () => {
  const { currentLanguage, isRTL } = useLanguage();

  const isFa = currentLanguage === 'fa';

  return (
    <div className="w-full bg-[#050D12]/95 border-y border-emerald-950/60 py-4 sm:py-5 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Minimal Label */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Building2 className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-200">
                {isFa ? 'مشتریان و شرکای تجاری در ایران' : 'Trusted Domestic Clients & OEM Partners'}
              </span>
              <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-medium bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                <CheckCircle2 className="w-2.5 h-2.5 inline me-0.5 text-emerald-400" />
                OEM
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              {isFa
                ? 'تامین سیلندرهای گاز مایع و مخازن اتوگاز برای صنایع برتر کشور'
                : 'Supplying certified LPG tanks & cylinders to leading national industries'}
            </p>
          </div>
        </div>

        {/* 5 Minimal Small Customer Logos */}
        <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 sm:gap-3 lg:gap-4 flex-1">
          {DOMESTIC_CUSTOMERS.map((cust) => (
            <div
              key={cust.id}
              className="group relative flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-emerald-500/40 transition-all duration-200 shadow-sm"
              title={`${isFa ? cust.nameFa : cust.nameEn} - ${isFa ? cust.roleFa : cust.roleEn}`}
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white p-1 flex items-center justify-center overflow-hidden shrink-0 shadow-inner aspect-square">
                <img
                  src={cust.logo}
                  alt={isFa ? cust.nameFa : cust.nameEn}
                  width={32}
                  height={32}
                  loading="lazy"
                  decoding="async"
                  style={{ aspectRatio: '1/1' }}
                  className="max-w-full max-h-full object-contain filter group-hover:scale-110 transition-transform duration-200"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="text-start">
                <span className="text-[11px] sm:text-xs font-semibold text-slate-300 group-hover:text-white transition-colors block leading-tight">
                  {isFa ? cust.nameFa : cust.nameEn}
                </span>
                <span className="text-[9px] text-slate-400 group-hover:text-emerald-400 transition-colors block">
                  {isFa ? cust.categoryFa : cust.categoryEn}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
