import React, { useState, useMemo, useEffect } from 'react';
import { Product, StockMovement, Category } from '../types';
import {
  X,
  TrendingUp,
  AlertTriangle,
  Clock,
  Layers,
  Search,
  CheckCircle2,
  FileSpreadsheet,
  HelpCircle,
  Boxes,
  ArrowDownLeft,
  ArrowUpRight
} from 'lucide-react';
import {
  formatCurrencyToman,
  formatNumberFa,
  toPersianDigits,
  formatPersianDateTime
} from '../utils/persian';

interface AbcAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  categories: Category[];
  stockQuantities: Record<string, Record<string, number>>;
  stockMovements: StockMovement[];
  onSelectProduct?: (productId: string) => void;
}

export const AbcAnalysisModal: React.FC<AbcAnalysisModalProps> = ({
  isOpen,
  onClose,
  products,
  categories,
  stockQuantities,
  stockMovements,
  onSelectProduct
}) => {
  const [activeTab, setActiveTab] = useState<'ABC' | 'DEAD_STOCK'>('ABC');
  const [filterClass, setFilterClass] = useState<'ALL' | 'A' | 'B' | 'C'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Calculate stock and valuation per product
  const productValuations = useMemo(() => {
    let grandTotalValue = 0;
    const items = products.map(p => {
      const whMap = stockQuantities[p.product_id] || {};
      let totalStock = 0;
      Object.values(whMap).forEach(q => {
        totalStock += Number(q) || 0;
      });
      const totalValue = totalStock * (p.purchase_price || 0);
      grandTotalValue += totalValue;

      // Find last movement
      const movementsForProd = stockMovements.filter(m => m.product_id === p.product_id);
      movementsForProd.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      const lastMovement = movementsForProd[0] || null;

      let daysSinceLastMovement = 999;
      if (lastMovement) {
        const diffMs = Date.now() - new Date(lastMovement.created_at).getTime();
        daysSinceLastMovement = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      }

      return {
        product: p,
        totalStock,
        totalValue,
        lastMovement,
        daysSinceLastMovement
      };
    });

    // Sort descending by total valuation
    items.sort((a, b) => b.totalValue - a.totalValue);

    // Cumulative calculation for ABC
    let cumulative = 0;
    const categorized = items.map((item, idx) => {
      cumulative += item.totalValue;
      const cumulativePct = grandTotalValue > 0 ? (cumulative / grandTotalValue) * 100 : 0;
      let abcClass: 'A' | 'B' | 'C' = 'C';
      if (cumulativePct <= 80 || idx < Math.max(1, Math.floor(items.length * 0.2))) {
        abcClass = 'A';
      } else if (cumulativePct <= 95 || idx < Math.max(2, Math.floor(items.length * 0.5))) {
        abcClass = 'B';
      } else {
        abcClass = 'C';
      }

      return {
        ...item,
        cumulativePct,
        abcClass,
        rank: idx + 1
      };
    });

    return {
      grandTotalValue,
      items: categorized
    };
  }, [products, stockQuantities, stockMovements]);

  // Statistics for ABC Classes
  const stats = useMemo(() => {
    const list = productValuations.items;
    const classA = list.filter(i => i.abcClass === 'A');
    const classB = list.filter(i => i.abcClass === 'B');
    const classC = list.filter(i => i.abcClass === 'C');

    const sumA = classA.reduce((acc, curr) => acc + curr.totalValue, 0);
    const sumB = classB.reduce((acc, curr) => acc + curr.totalValue, 0);
    const sumC = classC.reduce((acc, curr) => acc + curr.totalValue, 0);

    const deadStockItems = list.filter(
      i => i.totalStock > 0 && (i.daysSinceLastMovement >= 60 || !i.lastMovement)
    );
    const deadStockCapital = deadStockItems.reduce((acc, curr) => acc + curr.totalValue, 0);

    return {
      classA,
      classB,
      classC,
      sumA,
      sumB,
      sumC,
      pctA: productValuations.grandTotalValue > 0 ? (sumA / productValuations.grandTotalValue) * 100 : 0,
      pctB: productValuations.grandTotalValue > 0 ? (sumB / productValuations.grandTotalValue) * 100 : 0,
      pctC: productValuations.grandTotalValue > 0 ? (sumC / productValuations.grandTotalValue) * 100 : 0,
      deadStockItems,
      deadStockCapital
    };
  }, [productValuations]);

  // Filtered items based on active search & class
  const filteredList = useMemo(() => {
    if (activeTab === 'DEAD_STOCK') {
      return stats.deadStockItems.filter(
        i =>
          i.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          i.product.sku.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return productValuations.items.filter(i => {
      const matchClass = filterClass === 'ALL' || i.abcClass === filterClass;
      const matchSearch =
        i.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.product.sku.toLowerCase().includes(searchTerm.toLowerCase());
      return matchClass && matchSearch;
    });
  }, [productValuations, stats, activeTab, filterClass, searchTerm]);

  // Global Escape key listener to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 cursor-pointer"
      onClick={() => onClose()}
    >
      <div
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden cursor-default"
        onClick={e => e.stopPropagation()}
        onMouseDown={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800/80 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-950/80 border border-indigo-700/50 flex items-center justify-center text-indigo-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>ماتریس تحلیل ABC و پایش سرمایه راکد انبار</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800 font-mono">
                  پارتو ۸۰/۲۰
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                مدیریت طبقه‌بندی ارزش ریالی اقلام، سرعت گردش و کالاهای بدون خروج جهت جلوگیری از خواب سرمایه
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher & Summary Cards */}
        <div className="p-4 sm:p-5 border-b border-slate-800/60 bg-slate-950/30 space-y-4">
          <div className="flex items-center gap-2 flex-wrap justify-between">
            <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('ABC')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'ABC'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-700 dark:text-slate-400 hover:text-black dark:hover:text-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>تحلیل سه‌گانه ABC ({toPersianDigits(products.length)} قلم)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('DEAD_STOCK')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'DEAD_STOCK'
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                    : 'text-slate-700 dark:text-slate-400 hover:text-black dark:hover:text-slate-200'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>کالاهای راکد ({toPersianDigits(stats.deadStockItems.length)} قلم)</span>
              </button>
            </div>

            <div className="text-xs text-slate-400 flex items-center gap-2">
              <span>ارزش کل ارزیابی موجودی:</span>
              <strong className="text-emerald-400 font-bold font-mono">
                {formatCurrencyToman(productValuations.grandTotalValue)}
              </strong>
            </div>
          </div>

          {activeTab === 'ABC' ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Class A */}
              <div
                onClick={() => setFilterClass(filterClass === 'A' ? 'ALL' : 'A')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  filterClass === 'A'
                    ? 'bg-emerald-950/50 border-emerald-500 ring-2 ring-emerald-500/20'
                    : 'bg-slate-900/80 border-slate-800 hover:border-emerald-600/50'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-emerald-400 flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span>کلاس A (حیاتی و پرارزش)</span>
                  </span>
                  <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800/60">
                    {toPersianDigits(stats.pctA.toFixed(1))}% ارزش
                  </span>
                </div>
                <div className="text-lg font-bold text-white mb-1">
                  {formatCurrencyToman(stats.sumA)}
                </div>
                <div className="text-[11px] text-slate-400 flex items-center justify-between">
                  <span>تعداد اقلام: {toPersianDigits(stats.classA.length)} قلم</span>
                  <span className="text-[10px] text-emerald-300/80">پایش روزانه / هفتگی</span>
                </div>
              </div>

              {/* Class B */}
              <div
                onClick={() => setFilterClass(filterClass === 'B' ? 'ALL' : 'B')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  filterClass === 'B'
                    ? 'bg-indigo-950/50 border-indigo-500 ring-2 ring-indigo-500/20'
                    : 'bg-slate-900/80 border-slate-800 hover:border-indigo-600/50'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-indigo-400 flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                    <span>کلاس B (متوسط)</span>
                  </span>
                  <span className="text-[10px] font-mono text-indigo-300 bg-indigo-950 px-1.5 py-0.5 rounded border border-indigo-800/60">
                    {toPersianDigits(stats.pctB.toFixed(1))}% ارزش
                  </span>
                </div>
                <div className="text-lg font-bold text-white mb-1">
                  {formatCurrencyToman(stats.sumB)}
                </div>
                <div className="text-[11px] text-slate-400 flex items-center justify-between">
                  <span>تعداد اقلام: {toPersianDigits(stats.classB.length)} قلم</span>
                  <span className="text-[10px] text-indigo-300/80">پایش ماهانه</span>
                </div>
              </div>

              {/* Class C */}
              <div
                onClick={() => setFilterClass(filterClass === 'C' ? 'ALL' : 'C')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  filterClass === 'C'
                    ? 'bg-amber-950/50 border-amber-500 ring-2 ring-amber-500/20'
                    : 'bg-slate-900/80 border-slate-800 hover:border-amber-600/50'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-amber-400 flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span>کلاس C (اقلام ریز و اتصالات)</span>
                  </span>
                  <span className="text-[10px] font-mono text-amber-300 bg-amber-950 px-1.5 py-0.5 rounded border border-amber-800/60">
                    {toPersianDigits(stats.pctC.toFixed(1))}% ارزش
                  </span>
                </div>
                <div className="text-lg font-bold text-white mb-1">
                  {formatCurrencyToman(stats.sumC)}
                </div>
                <div className="text-[11px] text-slate-400 flex items-center justify-between">
                  <span>تعداد اقلام: {toPersianDigits(stats.classC.length)} قلم</span>
                  <span className="text-[10px] text-amber-300/80">سفارش عمده / فصلی</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-rose-950/30 border border-rose-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="text-xs font-bold text-rose-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>هشدار حبس سرمایه در کالاهای راکد (بدون خروج بیش از ۶۰ روز):</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  اقلامی که موجودی دارند اما در ۲ ماه گذشته هیچ سند فروش یا خروجی برای آن‌ها صادر نشده است.
                </p>
              </div>
              <div className="text-left shrink-0">
                <div className="text-xs text-slate-400">مجموع سرمایه راکد:</div>
                <div className="text-lg font-bold text-rose-400">
                  {formatCurrencyToman(stats.deadStockCapital)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Filter & Search Bar */}
        <div className="p-3 border-b border-slate-800/80 bg-slate-950/40 flex items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="جستجو در اقلام جدول (نام کالا یا کد SKU)..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pr-9 pl-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {activeTab === 'ABC' && (
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-slate-400 ml-1">فیلتر کلاس:</span>
              {(['ALL', 'A', 'B', 'C'] as const).map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setFilterClass(c)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    filterClass === c
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {c === 'ALL' ? 'همه' : `کلاس ${c}`}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Table Content */}
        <div className="overflow-y-auto flex-1 p-2 sm:p-4">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 text-[11px] sticky top-0 z-10">
              <tr>
                <th className="p-2.5">رتبه</th>
                <th className="p-2.5">کد کالا</th>
                <th className="p-2.5">شرح کالا</th>
                <th className="p-2.5">موجودی</th>
                <th className="p-2.5">بهای خرید</th>
                <th className="p-2.5">ارزش کل موجودی</th>
                {activeTab === 'ABC' ? (
                  <>
                    <th className="p-2.5">سهم تجمعی</th>
                    <th className="p-2.5 text-center">طبقه‌بندی</th>
                  </>
                ) : (
                  <>
                    <th className="p-2.5">آخرین گردش</th>
                    <th className="p-2.5 text-center">وضعیت راکد</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    موردی مطابق با فیلترها یافت نشد.
                  </td>
                </tr>
              ) : (
                filteredList.map(item => {
                  const isA = item.abcClass === 'A';
                  const isB = item.abcClass === 'B';

                  return (
                    <tr
                      key={item.product.product_id}
                      onClick={() => onSelectProduct?.(item.product.product_id)}
                      className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                    >
                      <td className="p-2.5 font-mono text-slate-400">
                        {toPersianDigits(item.rank)}
                      </td>
                      <td className="p-2.5 font-mono text-indigo-300">
                        {item.product.sku}
                      </td>
                      <td className="p-2.5">
                        <div className="font-bold text-white">{item.product.name}</div>
                        <div className="text-[10px] text-slate-400">{item.product.unit}</div>
                      </td>
                      <td className="p-2.5 font-bold font-mono">
                        {formatNumberFa(item.totalStock)}
                      </td>
                      <td className="p-2.5 text-slate-400 font-mono">
                        {formatCurrencyToman(item.product.purchase_price)}
                      </td>
                      <td className="p-2.5 font-bold text-emerald-400 font-mono">
                        {formatCurrencyToman(item.totalValue)}
                      </td>

                      {activeTab === 'ABC' ? (
                        <>
                          <td className="p-2.5 font-mono text-slate-400">
                            {toPersianDigits(item.cumulativePct.toFixed(1))}%
                          </td>
                          <td className="p-2.5 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isA
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60'
                                  : isB
                                  ? 'bg-indigo-950 text-indigo-300 border border-indigo-700/60'
                                  : 'bg-amber-950 text-amber-300 border border-amber-700/60'
                              }`}
                            >
                              کلاس {item.abcClass}
                            </span>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="p-2.5 text-[11px] text-slate-400">
                            {item.lastMovement
                              ? `${formatPersianDateTime(item.lastMovement.created_at)} (${toPersianDigits(item.daysSinceLastMovement)} روز قبل)`
                              : 'بدون گردش ثبتی'}
                          </td>
                          <td className="p-2.5 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800">
                              {toPersianDigits(item.daysSinceLastMovement)} روز بدون حرکت
                            </span>
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
            <span>نکته: با تمرکز روی اقلام کلاس A، تا ۸۰٪ سرمایه انبار به شکل بهینه کنترل می‌شود.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700 font-bold transition-colors cursor-pointer"
          >
            بستن پنجره
          </button>
        </div>
      </div>
    </div>
  );
};
