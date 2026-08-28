import React, { useState, useMemo } from 'react';
import {
  Calculator,
  Plus,
  Trash2,
  Send,
  Truck,
  Ship,
  Scale,
  Box,
  CheckCircle2,
  Sparkles,
  Info,
  Layers,
  Building2,
  AlertCircle,
} from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';
import confetti from 'canvas-confetti';
import { useLanguage } from '../i18n/LanguageContext';
import { PRODUCTS } from '../data/products';
import { Product, RfqItem } from '../types';
import { COMPANY_INFO } from '../data/company';

interface RfqCalculatorProps {
  initialItems?: RfqItem[];
  onClearItems?: () => void;
}

export const RfqCalculator: React.FC<RfqCalculatorProps> = ({
  initialItems = [],
  onClearItems,
}) => {
  const { currentLanguage, t, formatNumber, isRTL } = useLanguage();
  
  const [selectedProductId, setSelectedProductId] = useState<string>(PRODUCTS[0].id);
  const [quantity, setQuantity] = useState<number>(PRODUCTS[0].minOrder);
  const [destinationCountry, setDestinationCountry] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const [rfqList, setRfqList] = useState<RfqItem[]>(() => {
    if (initialItems && initialItems.length > 0) {
      return initialItems;
    }
    return [{ productId: PRODUCTS[0].id, quantity: PRODUCTS[0].minOrder }];
  });

  const handleProductSelectChange = (id: string) => {
    setSelectedProductId(id);
    const prod = PRODUCTS.find((p) => p.id === id);
    if (prod) {
      setQuantity(prod.minOrder);
    }
  };

  const handleAddItem = () => {
    const prod = PRODUCTS.find((p) => p.id === selectedProductId);
    if (!prod) return;

    setRfqList((prev) => {
      const existing = prev.find((item) => item.productId === selectedProductId);
      if (existing) {
        return prev.map((item) =>
          item.productId === selectedProductId
            ? { ...item, quantity: item.quantity + Math.max(quantity, prod.minOrder) }
            : item
        );
      }
      return [...prev, { productId: selectedProductId, quantity: Math.max(quantity, prod.minOrder) }];
    });
  };

  const handleRemoveItem = (id: string) => {
    setRfqList((prev) => prev.filter((item) => item.productId !== id));
  };

  // Calculations
  const calculatedTotals = useMemo(() => {
    let totalWeightKg = 0;
    let totalVolumeCbm = 0;
    let totalUnits = 0;

    rfqList.forEach((item) => {
      const prod = PRODUCTS.find((p) => p.id === item.productId);
      if (prod) {
        totalWeightKg += prod.emptyWeightKg * item.quantity;
        // Approximation: cylindrical packing volume = (dia/100)^2 * (height/100) * quantity
        const unitCbm = Math.pow(prod.circleDiameterCm / 100, 2) * (prod.heightCm / 100);
        totalVolumeCbm += unitCbm * item.quantity;
        totalUnits += item.quantity;
      }
    });

    // 20ft container: ~28 CBM / 21,500 kg payload limit
    // 40ft HQ container: ~68 CBM / 26,500 kg payload limit
    const containers20ft = Math.max(
      Math.ceil(totalVolumeCbm / 28),
      Math.ceil(totalWeightKg / 21500)
    );
    const containers40ftHQ = Math.max(
      Math.ceil(totalVolumeCbm / 68),
      Math.ceil(totalWeightKg / 26500)
    );

    return {
      totalWeightKg: Math.round(totalWeightKg),
      totalVolumeCbm: Number(totalVolumeCbm.toFixed(1)),
      totalUnits,
      containers20ft: totalUnits > 0 ? containers20ft : 0,
      containers40ftHQ: totalUnits > 0 ? containers40ftHQ : 0,
    };
  }, [rfqList]);

  const handleSendToWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();

    if (rfqList.length === 0) return;

    // Trigger celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#059669', '#38bdf8'],
      });
    } catch {
      // ignore
    }

    const itemsSummary = rfqList
      .map((item) => {
        const prod = PRODUCTS.find((p) => p.id === item.productId);
        const loc = prod?.locales[currentLanguage] || prod?.locales.en;
        const colorInfo = item.selectedRalColor ? ` [Color: ${item.selectedRalColor}]` : '';
        return `• ${loc?.name} (${prod?.volume} ${prod?.volumeUnit}): ${item.quantity} units${colorInfo} (Weight: ${
          (prod?.emptyWeightKg || 0) * item.quantity
        } kg)`;
      })
      .join('\n');

    const messageText = `*M Gas Official Quotation Request (RFQ)*\n-------------------------\n*Client Name:* ${
      customerName || 'Direct Inquiry'
    }\n*Phone / WhatsApp:* ${customerPhone || 'N/A'}\n*Destination:* ${
      destinationCountry || 'Not Specified'
    }\n\n*Requested Cylinder List:*\n${itemsSummary}\n\n*Total Estimated Weight:* ${
      calculatedTotals.totalWeightKg
    } kg\n*Estimated Volume:* ${calculatedTotals.totalVolumeCbm} CBM\n*Estimated 40ft HQ Containers:* ${
      calculatedTotals.containers40ftHQ
    }\n*Delivery Terms:* EXW (Factory Gate delivery; freight cost is buyer responsibility)\n*Notes:* ${notes || 'Standard manufacturing'}\n-------------------------\n_Generated via mgas.ir smart RFQ calculator_`;

    const targetWhatsApp = COMPANY_INFO.contacts.internationalSalesManager.whatsapp.replace('+', '');
    const url = `https://wa.me/${targetWhatsApp}?text=${encodeURIComponent(messageText)}`;

    window.open(url, '_blank');
  };

  return (
    <section id="calculator" className="py-20 bg-[#08151D] relative">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
            <Calculator className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t.calculatorBadge}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {t.calculatorTitle}
          </h2>

          <p className="text-sm sm:text-base text-slate-300">
            {t.calculatorSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Form: Add Items & Customer Details */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Add Cylinder Selector Card */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-4 shadow-xl">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>{t.selectProduct}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Cylinder Dropdown */}
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-medium block">
                    {t.navProducts}
                  </label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => handleProductSelectChange(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  >
                    {PRODUCTS.map((prod) => {
                      const loc = prod.locales[currentLanguage] || prod.locales.en;
                      return (
                        <option key={prod.id} value={prod.id}>
                          {loc.name} ({prod.volume} {prod.volumeUnit} - MOQ: {prod.minOrder})
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Quantity Input */}
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-medium block">
                    {t.enterQuantity}
                  </label>
                  <input
                    type="number"
                    min={PRODUCTS.find((p) => p.id === selectedProductId)?.minOrder || 100}
                    step={100}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddItem}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 font-bold text-xs border border-emerald-500/30 flex items-center justify-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>{t.addToRfq}</span>
              </button>
            </div>

            {/* List of Added Cylinders in RFQ */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span>{t.quoteSummaryTitle}</span>
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  {rfqList.length} items
                </span>
              </div>

              {rfqList.length > 0 ? (
                <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                  {rfqList.map((item) => {
                    const prod = PRODUCTS.find((p) => p.id === item.productId);
                    const loc = prod?.locales[currentLanguage] || prod?.locales.en;
                    const itemWeight = (prod?.emptyWeightKg || 0) * item.quantity;

                    return (
                      <div
                        key={`${item.productId}-${item.selectedRalColor || 'def'}`}
                        className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white block">
                              {loc?.name}
                            </span>
                            {item.selectedRalColor && (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/50">
                                {item.selectedRalColor}
                              </span>
                            )}
                          </div>
                          <span className="text-slate-400 text-[11px]">
                            {item.quantity} units • {formatNumber(itemWeight)} kg
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.productId)}
                          className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-800/30 transition-colors"
                          title="Remove"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 text-slate-500 text-xs">
                  {t.noProductsFound}
                </div>
              )}
            </div>

            {/* Destination & Contact form inputs */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-4 shadow-xl">
              <h3 className="text-base font-bold text-white">
                {t.contactTitle}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-medium block">
                    {t.formName}
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Your Full Name"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-medium block">
                    {t.formPhone}
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+44 7000 000000"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500 isolate"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-medium block">
                  {t.destinationCountry}
                </label>
                <input
                  type="text"
                  value={destinationCountry}
                  onChange={(e) => setDestinationCountry(e.target.value)}
                  placeholder="e.g. Dubai, Baghdad, Istanbul, Baku, Hamburg"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-medium block">
                  {t.formMessage}
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Custom paint color, specific valve standard, embossing requirements..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>
            </div>

          </div>

          {/* Right Summary & Container Visualizer */}
          <div className="lg:col-span-5 space-y-6 sticky top-24">
            
            <div className="p-6 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-[#0B1B22] border border-emerald-500/30 backdrop-blur-xl shadow-2xl space-y-6">
              
              <div className="border-b border-slate-800 pb-4">
                <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider block mb-1">
                  Logistics & Cargo Metrics
                </span>
                <h3 className="text-xl font-black text-white">
                  {t.quoteSummaryTitle}
                </h3>
              </div>

              {/* Metric Callouts */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Scale className="w-4 h-4 text-emerald-400" />
                    <span>{t.calculatedGrossWeight}</span>
                  </div>
                  <span className="text-xl font-black text-white font-mono block">
                    {formatNumber(calculatedTotals.totalWeightKg)} <span className="text-xs text-slate-400 font-normal">{t.unitKg}</span>
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Box className="w-4 h-4 text-emerald-400" />
                    <span>{t.calculatedTotalVolume}</span>
                  </div>
                  <span className="text-xl font-black text-white font-mono block">
                    {calculatedTotals.totalVolumeCbm} <span className="text-xs text-slate-400 font-normal">m³</span>
                  </span>
                </div>
              </div>

              {/* Container Fit Indicators */}
              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-800/40 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 text-emerald-300">
                    <Ship className="w-5 h-5 text-emerald-400" />
                    <span>{t.containerEstimate40ft}</span>
                  </div>
                  <span className="font-mono text-sm font-bold text-white bg-emerald-900/60 px-3 py-1 rounded-xl">
                    ~ {calculatedTotals.containers40ftHQ} Container(s)
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs text-slate-300">
                  <div className="flex items-center gap-2.5">
                    <Truck className="w-5 h-5 text-teal-400" />
                    <span>{t.containerEstimate20ft}</span>
                  </div>
                  <span className="font-mono text-sm font-bold text-slate-200 bg-slate-900 px-3 py-1 rounded-xl">
                    ~ {calculatedTotals.containers20ft} Container(s)
                  </span>
                </div>
              </div>

              {/* Delivery & Transportation Terms Notice (EXW) */}
              <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-2.5">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                  <Building2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{t.shippingTermsTitle}</span>
                </div>
                <div className="space-y-1.5 text-[11px] leading-relaxed text-amber-200/90">
                  <div className="flex items-start gap-1.5">
                    <span className="text-amber-400 font-bold mt-0.5">•</span>
                    <span>{t.shippingTermsFactoryGate}</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="text-amber-400 font-bold mt-0.5">•</span>
                    <span>{t.shippingTermsArrangement}</span>
                  </div>
                </div>
              </div>

              {/* Submit to WhatsApp Button */}
              <button
                type="button"
                onClick={handleSendToWhatsApp}
                disabled={rfqList.length === 0}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-bold text-sm shadow-xl shadow-emerald-950/50 flex items-center justify-center gap-3 transition-all transform hover:-translate-y-0.5"
              >
                <WhatsAppIcon className="w-5 h-5 text-white" />
                <span>{t.generateWhatsAppQuote}</span>
              </button>

              <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                {t.formRedirectNotice}
              </p>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
