import React, { useState, useEffect, useMemo } from 'react';
import { RfqItem, Product } from '../types';
import { PRODUCTS, getProductById } from '../data/products';
import { useLanguage } from '../i18n/LanguageContext';
import { COMPANY_INFO } from '../data/company';
import {
  Calculator,
  Plus,
  Trash2,
  Send,
  Truck,
  Box,
  Scale,
  Sparkles,
  ShieldCheck,
  MessageCircle,
  FileSpreadsheet,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface RfqCalculatorProps {
  initialItems: RfqItem[];
  onClearItems: () => void;
}

export const RfqCalculator: React.FC<RfqCalculatorProps> = ({
  initialItems,
  onClearItems,
}) => {
  const { currentLanguage, t, formatNumber } = useLanguage();
  const [items, setItems] = useState<RfqItem[]>(initialItems);
  const [selectedProductId, setSelectedProductId] = useState<string>(PRODUCTS[0].id);
  const [selectedQuantity, setSelectedQuantity] = useState<number>(PRODUCTS[0].minOrder);
  const [destinationCountry, setDestinationCountry] = useState<string>('');
  const [clientCompany, setClientCompany] = useState<string>('');
  const [clientName, setClientName] = useState<string>('');

  useEffect(() => {
    if (initialItems.length > 0) {
      setItems(initialItems);
    }
  }, [initialItems]);

  const selectedProduct = useMemo(() => {
    return getProductById(selectedProductId) || PRODUCTS[0];
  }, [selectedProductId]);

  const handleAddItem = () => {
    const qty = Math.max(selectedQuantity, selectedProduct.minOrder);
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.productId === selectedProductId);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + qty };
        return next;
      }
      return [...prev, { productId: selectedProductId, quantity: qty }];
    });
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const totals = useMemo(() => {
    let totalUnits = 0;
    let totalWeightKg = 0;
    let estimatedCostUsd = 0;

    items.forEach((item) => {
      const p = getProductById(item.productId);
      if (p) {
        totalUnits += item.quantity;
        totalWeightKg += item.quantity * p.emptyWeightKg;
        estimatedCostUsd += item.quantity * p.unitPriceUsd;
      }
    });

    const fcl20ftContainers = (totalWeightKg / 18000).toFixed(1);
    const fcl40ftContainers = (totalWeightKg / 26000).toFixed(1);

    return {
      totalUnits,
      totalWeightKg,
      estimatedCostUsd,
      fcl20ftContainers,
      fcl40ftContainers,
    };
  }, [items]);

  const handleSendRfqWhatsApp = () => {
    if (items.length === 0) return;

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.7 },
      });
    } catch (e) {
      // Ignore confetti errors
    }

    let msg = `*M Gas Official Export RFQ Inquiry*\n`;
    msg += `------------------------------------\n`;
    if (clientName) msg += `*Contact:* ${clientName}\n`;
    if (clientCompany) msg += `*Company:* ${clientCompany}\n`;
    if (destinationCountry) msg += `*Destination:* ${destinationCountry}\n`;
    msg += `\n*Selected Cylinders & Specifications:*\n`;

    items.forEach((item, idx) => {
      const p = getProductById(item.productId);
      if (p) {
        const name = p.locales[currentLanguage]?.name || p.slug;
        const color = item.selectedRalColor || p.defaultRalCode || 'Standard RAL 6018';
        msg += `${idx + 1}. *${name}*\n   - Quantity: ${item.quantity} units\n   - Finish: ${color}\n   - Weight: ${p.emptyWeightKg * item.quantity} kg\n`;
      }
    });

    msg += `\n------------------------------------\n`;
    msg += `*Total Units:* ${totals.totalUnits} pcs\n`;
    msg += `*Total Weight:* ${totals.totalWeightKg.toLocaleString()} kg\n`;
    msg += `*Est. 20ft Containers:* ~${totals.fcl20ftContainers} FCL\n`;
    msg += `*Est. 40ft Containers:* ~${totals.fcl40ftContainers} FCL\n`;

    const phone = COMPANY_INFO.contacts.internationalSalesManager.whatsapp.replace('+', '');
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  return (
    <section id="calculator" className="relative py-24 bg-[#050D12] border-t border-slate-800 overflow-hidden">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <Calculator className="w-4 h-4" />
            <span>{currentLanguage === 'fa' ? 'استعلام قیمت آنلاین و بارگیری کانتینری' : 'Interactive RFQ & Logistics Estimator'}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
            {currentLanguage === 'fa' ? 'محاسبه‌گر تیراژ، وزن و ارسال استعلام به کارخانه' : 'Instant Bulk RFQ & Container Loadout Calculator'}
          </h2>

          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            {currentLanguage === 'fa'
              ? 'محصولات و تیراژ مورد نظر را انتخاب نمایید تا تناژ بار و ظرفیت کانتینری به طور خودکار محاسبه و پیش‌فاکتور برای واحد فروش ارسال گردد.'
              : 'Select your required gas cylinder models, capacities and volumes to estimate total tonnage, container loads and directly request official factory pricing.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Selector Form */}
          <div className="lg:col-span-6 space-y-5">
            
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-5">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Box className="w-5 h-5 text-emerald-400" />
                <span>{currentLanguage === 'fa' ? 'انتخاب مدل سیلندر و تعداد' : 'Add Cylinder to RFQ'}</span>
              </h3>

              {/* Product Selector */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium block">
                  {currentLanguage === 'fa' ? 'نوع کپسول گاز / مخزن:' : 'Cylinder Model & Capacity:'}
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => {
                    setSelectedProductId(e.target.value);
                    const prod = getProductById(e.target.value);
                    if (prod) setSelectedQuantity(prod.minOrder);
                  }}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  {PRODUCTS.map((prod) => {
                    const loc = prod.locales[currentLanguage] || prod.locales.en;
                    return (
                      <option key={prod.id} value={prod.id}>
                        {loc.name} ({prod.volume} {prod.volumeUnit}) - MOQ: {prod.minOrder}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Quantity Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{currentLanguage === 'fa' ? 'تیراژ مورد نظر (عدد):' : 'Required Quantity (pcs):'}</span>
                  <span className="text-emerald-400 font-mono font-bold">
                    MOQ: {selectedProduct.minOrder}
                  </span>
                </div>
                <input
                  type="number"
                  min={selectedProduct.minOrder}
                  step={50}
                  value={selectedQuantity}
                  onChange={(e) => setSelectedQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 font-mono text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Add Button */}
              <button
                type="button"
                onClick={handleAddItem}
                className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-xs sm:text-sm border border-emerald-500/30 transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
              >
                <Plus className="w-4 h-4" />
                <span>{currentLanguage === 'fa' ? 'افزودن به لیست استعلام' : 'Add to Order List'}</span>
              </button>
            </div>

            {/* Optional Client Info */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {currentLanguage === 'fa' ? 'اطلاعات اختیاری خریدار (جهت صدور پیش‌فاکتور)' : 'Optional Buyer Details for Proforma'}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder={currentLanguage === 'fa' ? 'نام و نام خانوادگی' : 'Full Name'}
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="p-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <input
                  type="text"
                  placeholder={currentLanguage === 'fa' ? 'نام شرکت یا بازرگانی' : 'Company Name'}
                  value={clientCompany}
                  onChange={(e) => setClientCompany(e.target.value)}
                  className="p-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <input
                type="text"
                placeholder={currentLanguage === 'fa' ? 'کشور و شهر مقصد تخلیه بار' : 'Destination Port / Country'}
                value={destinationCountry}
                onChange={(e) => setDestinationCountry(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

          </div>

          {/* Right Column: Order Summary & Logistics */}
          <div className="lg:col-span-6 space-y-5">
            
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-5">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                  <span>{currentLanguage === 'fa' ? 'اقلام انتخابی پیش‌فاکتور' : 'RFQ Items & Logistics Summary'}</span>
                </h3>

                {items.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setItems([]);
                      onClearItems();
                    }}
                    className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{currentLanguage === 'fa' ? 'پاک‌کردن' : 'Clear'}</span>
                  </button>
                )}
              </div>

              {/* Items List */}
              {items.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  {currentLanguage === 'fa' ? 'هنوز آیتمی به لیست اضافه نشده است.' : 'No cylinders added yet. Select a model above to begin.'}
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {items.map((item, idx) => {
                    const p = getProductById(item.productId);
                    if (!p) return null;
                    const loc = p.locales[currentLanguage] || p.locales.en;
                    return (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-white truncate">{loc.name}</h4>
                          <span className="text-[11px] text-slate-400 block font-mono">
                            {formatNumber(item.quantity)} pcs • {(item.quantity * p.emptyWeightKg).toLocaleString()} kg
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-900 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Logistics & Metrics Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800">
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 block uppercase">{currentLanguage === 'fa' ? 'مجموع تیراژ' : 'Total Units'}</span>
                  <span className="font-mono text-base font-black text-white">{totals.totalUnits.toLocaleString()}</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 block uppercase">{currentLanguage === 'fa' ? 'وزن کل بار' : 'Total Weight'}</span>
                  <span className="font-mono text-base font-black text-emerald-400">
                    {(totals.totalWeightKg / 1000).toFixed(1)} {currentLanguage === 'fa' ? 'تن' : 'tons'}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-slate-500 block uppercase">{currentLanguage === 'fa' ? 'تخمین کانتینر ۴۰HQ' : '40HQ Load'}</span>
                  <span className="font-mono text-base font-black text-amber-400">~{totals.fcl40ftContainers} FCL</span>
                </div>
              </div>

              {/* WhatsApp Direct Submission Action */}
              <button
                type="button"
                onClick={handleSendRfqWhatsApp}
                disabled={items.length === 0}
                className={`w-full py-4 px-6 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-3 shadow-xl ${
                  items.length > 0
                    ? 'bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 shadow-[#25D366]/25 hover:scale-[1.01] active:scale-95 cursor-pointer'
                    : 'bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed'
                }`}
              >
                <MessageCircle className="w-5 h-5 fill-slate-950 stroke-none" />
                <span>{currentLanguage === 'fa' ? 'ارسال رسمی استعلام به مدیر صادرات (واتس‌اپ)' : 'Submit Official RFQ via WhatsApp'}</span>
              </button>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
