import React, { useState, useMemo } from 'react';
import {
  Product,
  Category,
  Warehouse,
  User
} from '../types';
import {
  Printer,
  FileSpreadsheet,
  Search,
  Filter,
  X,
  Copy,
  Check,
  Tag,
  Boxes,
  Barcode,
  Layers,
  Warehouse as WarehouseIcon,
  CheckSquare,
  Square,
  FileText
} from 'lucide-react';
import {
  formatNumberFa,
  formatPersianDateTime,
  toPersianDigits
} from '../utils/persian';
import { printReceiptSheet } from '../utils/receiptPrint';
import { MGasOfficialLogo } from './MGasOfficialLogo';
import * as XLSX from 'xlsx';

interface SkuPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  categories: Category[];
  warehouses: Warehouse[];
  currentUser: User;
  productStockTotals: Record<string, number>;
}

export const SkuPrintModal: React.FC<SkuPrintModalProps> = ({
  isOpen,
  onClose,
  products,
  categories,
  warehouses,
  currentUser,
  productStockTotals
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('ALL');
  const [viewFormat, setViewFormat] = useState<'table' | 'labels'>('table');
  const [includeStock, setIncludeStock] = useState(true);
  const [includeBarcode, setIncludeBarcode] = useState(true);
  const [includeShelf, setIncludeShelf] = useState(true);
  const [copied, setCopied] = useState(false);

  // Filter products based on active filters
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch =
        !searchTerm.trim() ||
        (p.name && p.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.barcode && p.barcode.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchCat = selectedCategory === 'ALL' || p.category_id === selectedCategory;

      let matchWh = true;
      if (selectedWarehouse !== 'ALL') {
        const whId = p.warehouse_id || (p.shelf_location?.startsWith('A') ? 'WH-VALVES' : 'WH-VALVES');
        matchWh = whId === selectedWarehouse;
      }

      return matchSearch && matchCat && matchWh;
    });
  }, [products, searchTerm, selectedCategory, selectedWarehouse]);

  if (!isOpen) return null;

  // Print Action using universal receipt printing engine
  const handlePrint = () => {
    printReceiptSheet({
      elementId: 'sku-printable-sheet',
      title: 'فهرست کدهای کالا SKU و نام محصولات - شرکت ام گاز',
      paperSize: 'A4',
      orientation: 'portrait'
    });
  };

  // Export to Excel file
  const handleExportExcel = () => {
    const dataRows = filteredProducts.map((p, idx) => {
      const cat = categories.find(c => c.category_id === p.category_id);
      const wh = warehouses.find(w => w.warehouse_id === p.warehouse_id);
      const stock = productStockTotals[p.product_id] || 0;
      const shelf = p.shelf_location || `${p.shelf_letter || 'A'}${p.shelf_number || 1}`;

      return {
        'ردیف': idx + 1,
        'کد کالا (SKU)': p.sku || '---',
        'نام محصول': p.name || '---',
        'دسته‌بندی': cat?.name || '---',
        'انبار استقرار': wh?.name || 'انبار شیرآلات',
        'محل قفسه': shelf,
        'واحد سنجش': p.unit || 'عدد',
        'موجودی کل': stock,
        'بارکد': p.barcode || '---'
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(dataRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'لیست SKU کالاها');
    XLSX.writeFile(workbook, `MGas-SKU-Products-List-${Date.now().toString().slice(-6)}.xlsx`);
  };

  // Copy list to clipboard
  const handleCopyText = () => {
    const lines = filteredProducts.map((p, idx) => {
      const cat = categories.find(c => c.category_id === p.category_id);
      return `${idx + 1}. [${p.sku}] - ${p.name} (${cat?.name || 'عمومی'})`;
    });
    const header = `=== فهرست کدهای کالا (SKU) و نام محصولات ام گاز ===\nتعداد کل اقلام: ${filteredProducts.length}\nتاریخ: ${new Date().toLocaleDateString('fa-IR')}\n\n`;
    navigator.clipboard.writeText(header + lines.join('\n')).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto cursor-pointer"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden cursor-default my-auto max-h-[96vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-950/80 border border-indigo-700/60 flex items-center justify-center text-indigo-300 shadow-md">
              <Printer className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>چاپ و پرینت فهرست شناسه‌های کالا (SKU) و نام محصولات</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-900/60 text-indigo-200 border border-indigo-700/50 font-mono">
                  {toPersianDigits(filteredProducts.length)} قلم
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                نسخه چاپی رسمی استاندارد A4 شرکت ام گاز به همراه بارکد، دسته‌بندی و کد قفسه
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="بستن پنجره"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Controls & Filters Bar */}
        <div className="p-4 bg-slate-950/50 border-b border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="جستجو در کد کالا (SKU)، نام محصول یا بارکد..."
                className="w-full pl-3 pr-9 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-sans"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 px-3 py-2 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="ALL">همه دسته‌بندی‌ها ({toPersianDigits(products.length)})</option>
              {categories.map(c => {
                const count = products.filter(p => p.category_id === c.category_id).length;
                return (
                  <option key={c.category_id} value={c.category_id}>
                    {c.name} ({toPersianDigits(count)})
                  </option>
                );
              })}
            </select>

            {/* Warehouse Filter */}
            <select
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 px-3 py-2 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="ALL">همه انبارها ({toPersianDigits(products.length)})</option>
              {warehouses.map(w => (
                <option key={w.warehouse_id} value={w.warehouse_id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>

          {/* Options & Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
            {/* Display format toggle */}
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setViewFormat('table')}
                className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewFormat === 'table'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>جدول رسمی چاپی</span>
              </button>
              <button
                type="button"
                onClick={() => setViewFormat('labels')}
                className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewFormat === 'labels'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                <span>برچسب و لیبل‌های SKU</span>
              </button>
            </div>

            {/* Optional columns */}
            <div className="flex items-center gap-3 text-[11px] text-slate-300">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeStock}
                  onChange={(e) => setIncludeStock(e.target.checked)}
                  className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                />
                <span>نمایش موجودی</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeShelf}
                  onChange={(e) => setIncludeShelf(e.target.checked)}
                  className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                />
                <span>محل قفسه</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeBarcode}
                  onChange={(e) => setIncludeBarcode(e.target.checked)}
                  className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                />
                <span>بارکد</span>
              </label>
            </div>

            {/* Actions: Print / Export / Copy */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyText}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                title="کپی متنی کدهای SKU و نام کالاها"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                <span>{copied ? 'کپی شد' : 'کپی فهرست'}</span>
              </button>

              <button
                type="button"
                onClick={handleExportExcel}
                className="px-3 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                title="دانلود خروجی فایل اکسل از فهرست SKU"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>خروجی اکسل</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-indigo-600/30 cursor-pointer"
                title="ارسال مستقیم به پرینتر یا ذخیره PDF"
              >
                <Printer className="w-4 h-4" />
                <span>چاپ برگه رسمی (Print)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Printable Preview Container */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-950/30">
          <div
            id="sku-printable-sheet"
            className="bg-white text-slate-900 p-6 sm:p-8 rounded-xl shadow-xl max-w-4xl mx-auto border border-slate-300 font-sans print:shadow-none print:border-none print:p-0 print:m-0"
            dir="rtl"
          >
            {/* Company Official Header */}
            <div className="border-b-2 border-slate-800 pb-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MGasOfficialLogo height={48} className="print:block" />
                  <div>
                    <h1 className="text-base sm:text-lg font-black text-slate-950 tracking-tight">
                      شرکت ام گاز (سهامی خاص)
                    </h1>
                    <div className="text-[11px] font-bold text-slate-700">
                      سامانه مدیریت کاتالوگ، انبارداری و کنترل موجودی
                    </div>
                  </div>
                </div>

                <div className="text-left text-[11px] text-slate-700 space-y-0.5 font-sans">
                  <div>
                    <span className="text-slate-500">تاریخ صدور: </span>
                    <span className="font-bold">{new Date().toLocaleDateString('fa-IR')}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">ساعت گزارش: </span>
                    <span className="font-mono font-bold">{new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">کاربر صادرکننده: </span>
                    <span className="font-bold">{currentUser.full_name}</span>
                  </div>
                </div>
              </div>

              {/* Title & Filter badge */}
              <div className="mt-3 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-slate-900">
                    فهرست رسمی کدهای کالا (SKU) و مشخصات محصولات
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 border border-slate-300 font-bold text-slate-800">
                    {toPersianDigits(filteredProducts.length)} قلم کالا
                  </span>
                </div>

                <div className="text-[10px] text-slate-600 font-medium">
                  {selectedCategory !== 'ALL' && (
                    <span className="ml-2">
                      دسته: {categories.find(c => c.category_id === selectedCategory)?.name}
                    </span>
                  )}
                  {selectedWarehouse !== 'ALL' && (
                    <span>
                      انبار: {warehouses.find(w => w.warehouse_id === selectedWarehouse)?.name}
                    </span>
                  )}
                  {selectedCategory === 'ALL' && selectedWarehouse === 'ALL' && (
                    <span>دامنه گزارش: کلیه اقلام کاتالوگ و انبارهای فعال</span>
                  )}
                </div>
              </div>
            </div>

            {/* Format 1: Official Table View */}
            {viewFormat === 'table' ? (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-900 border-y-2 border-slate-800 text-[11px]">
                      <th className="p-2 text-center w-10 border border-slate-300">ردیف</th>
                      <th className="p-2 border border-slate-300 text-left font-bold" dir="ltr">کد کالا (SKU)</th>
                      <th className="p-2 border border-slate-300 font-bold">نام محصول و مشخصات</th>
                      <th className="p-2 border border-slate-300">دسته‌بندی</th>
                      {includeShelf && <th className="p-2 border border-slate-300 text-center">انبار و قفسه</th>}
                      <th className="p-2 border border-slate-300 text-center w-16">واحد</th>
                      {includeStock && <th className="p-2 border border-slate-300 text-center w-20">موجودی</th>}
                      {includeBarcode && <th className="p-2 border border-slate-300 text-center w-28">بارکد</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((p, idx) => {
                      const cat = categories.find(c => c.category_id === p.category_id);
                      const wh = warehouses.find(w => w.warehouse_id === p.warehouse_id);
                      const stock = productStockTotals[p.product_id] || 0;
                      const shelf = p.shelf_location || `${p.shelf_letter || 'A'}${p.shelf_number || 1}`;

                      return (
                        <tr
                          key={p.product_id}
                          className={`border-b border-slate-300 ${idx % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'}`}
                        >
                          <td className="p-2 text-center font-mono text-[11px] text-slate-600 border border-slate-300">
                            {toPersianDigits(idx + 1)}
                          </td>
                          <td className="p-2 border border-slate-300 font-mono text-left" dir="ltr">
                            <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-300 text-slate-950 font-black text-xs sm:text-sm tracking-wider inline-block">
                              {p.sku}
                            </span>
                          </td>
                          <td className="p-2 border border-slate-300 font-black text-slate-950 text-xs sm:text-sm">
                            {p.name}
                          </td>
                          <td className="p-2 border border-slate-300 text-[11px] text-slate-700">
                            {cat?.name || '---'}
                          </td>
                          {includeShelf && (
                            <td className="p-2 border border-slate-300 text-center text-[11px] text-slate-700">
                              <span className="font-semibold">{wh?.name?.replace(/^انبار\s+/, '') || 'شیرآلات'}</span>
                              <span className="font-mono font-bold text-slate-900 mx-1">({shelf})</span>
                            </td>
                          )}
                          <td className="p-2 border border-slate-300 text-center text-[11px] text-slate-700">
                            {p.unit || 'عدد'}
                          </td>
                          {includeStock && (
                            <td className="p-2 border border-slate-300 text-center font-mono font-bold text-slate-950 text-xs">
                              {formatNumberFa(stock)}
                            </td>
                          )}
                          {includeBarcode && (
                            <td className="p-2 border border-slate-300 text-center font-mono text-[11px] text-slate-700" dir="ltr">
                              {p.barcode || '---'}
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              /* Format 2: Labels / Sticker Grid View */
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {filteredProducts.map((p, idx) => {
                  const cat = categories.find(c => c.category_id === p.category_id);
                  const wh = warehouses.find(w => w.warehouse_id === p.warehouse_id);
                  const shelf = p.shelf_location || `${p.shelf_letter || 'A'}${p.shelf_number || 1}`;

                  return (
                    <div
                      key={p.product_id}
                      className="border-2 border-slate-800 rounded-lg p-3 bg-white flex flex-col justify-between space-y-2 text-slate-950"
                    >
                      <div>
                        <div className="flex items-center justify-between border-b border-slate-300 pb-1 mb-1.5">
                          <span className="text-[10px] font-bold text-slate-600">شرکت ام گاز</span>
                          <span className="text-[10px] font-mono text-slate-500">#{toPersianDigits(idx + 1)}</span>
                        </div>
                        <div className="text-xs font-black text-slate-950 leading-tight mb-1">
                          {p.name}
                        </div>
                        <div className="text-[10px] text-slate-600">
                          دسته: {cat?.name || 'عمومی'}
                        </div>
                      </div>

                      <div className="pt-1.5 border-t border-slate-200">
                        <div className="flex items-center justify-between bg-slate-100 p-1.5 rounded font-mono border border-slate-300">
                          <span className="text-[10px] text-slate-600 font-sans">کد SKU:</span>
                          <span className="text-xs font-black text-slate-950 tracking-wider" dir="ltr">
                            {p.sku}
                          </span>
                        </div>

                        {includeShelf && (
                          <div className="flex items-center justify-between text-[10px] text-slate-600 mt-1">
                            <span>محل استقرار:</span>
                            <span className="font-bold text-slate-900">{wh?.name?.replace(/^انبار\s+/, '')} - قفسه {shelf}</span>
                          </div>
                        )}
                        {includeBarcode && p.barcode && (
                          <div className="text-[9px] font-mono text-center text-slate-600 mt-1 tracking-widest border-t border-dashed border-slate-200 pt-1">
                            ||| {p.barcode} |||
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Official Signatures Footer */}
            <div className="mt-8 pt-4 border-t-2 border-slate-800 grid grid-cols-3 gap-4 text-center text-xs text-slate-800">
              <div className="space-y-8">
                <div className="font-bold">انباردار مرکزی:</div>
                <div className="text-[11px] text-slate-500 border-t border-dotted border-slate-400 pt-1">
                  امضاء و اثر انگشت
                </div>
              </div>

              <div className="space-y-8">
                <div className="font-bold">مدیر داخلی (خانم کرمی):</div>
                <div className="text-[11px] text-slate-500 border-t border-dotted border-slate-400 pt-1">
                  امضاء و تأیید کنترل انبار
                </div>
              </div>

              <div className="space-y-8">
                <div className="font-bold">مدیریت عامل (مهندس عمویی):</div>
                <div className="text-[11px] text-slate-500 border-t border-dotted border-slate-400 pt-1">
                  مهر و امضای نهایی
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 border-t border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="text-[11px] text-slate-400">
            برای چاپ، دکمه پرینت را فشرده یا از کلید میانبر <kbd className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-slate-200">Ctrl + P</kbd> استفاده فرمایید.
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};
