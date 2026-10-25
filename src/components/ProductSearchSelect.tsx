import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Product, Category } from '../types';
import { Search, Barcode, Check, ChevronDown, X, Boxes, AlertTriangle, Layers } from 'lucide-react';
import { toPersianDigits, formatCurrencyToman, formatNumberFa } from '../utils/persian';

interface ProductSearchSelectProps {
  products: Product[];
  selectedProductId: string;
  onChange: (productId: string, product?: Product) => void;
  categories?: Category[];
  stockQuantities?: Record<string, Record<string, number>>;
  selectedWarehouseId?: string;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
}

export const ProductSearchSelect: React.FC<ProductSearchSelectProps> = ({
  products,
  selectedProductId,
  onChange,
  categories = [],
  stockQuantities = {},
  selectedWarehouseId,
  placeholder = 'جستجو با نام کالا، کد SKU یا اسکن بارکد...',
  label,
  required = false,
  disabled = false,
  autoFocus = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Selected product object
  const selectedProduct = useMemo(() => {
    return products.find(p => p.product_id === selectedProductId) || null;
  }, [products, selectedProductId]);

  // Categories lookup map for fast O(1) display
  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach(c => map.set(c.category_id, c.name));
    return map;
  }, [categories]);

  // Calculate stock for a given product
  const getProductStock = (productId: string) => {
    const whMap = stockQuantities[productId] || {};
    if (selectedWarehouseId) {
      return whMap[selectedWarehouseId] || 0;
    }
    let total = 0;
    Object.values(whMap).forEach(q => {
      total += Number(q) || 0;
    });
    return total;
  };

  // Filtered products list optimized for fast typing
  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return products.slice(0, 40); // Initial 40 items for speed
    }

    const matches: Product[] = [];
    const exactBarcodeMatches: Product[] = [];

    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      const pName = p.name.toLowerCase();
      const pSku = p.sku.toLowerCase();
      const pBarcode = (p.barcode || '').toLowerCase();
      const catName = (categoryMap.get(p.category_id) || '').toLowerCase();

      // Check exact barcode match first (for barcode scanner)
      if (pBarcode && pBarcode === query) {
        exactBarcodeMatches.push(p);
        continue;
      }

      if (
        pName.includes(query) ||
        pSku.includes(query) ||
        pBarcode.includes(query) ||
        catName.includes(query)
      ) {
        matches.push(p);
        if (matches.length >= 60) break; // Maximum 60 items in view for snappy UI
      }
    }

    return [...exactBarcodeMatches, ...matches];
  }, [products, searchQuery, categoryMap]);

  // If barcode reader scanned an exact barcode, auto-select it
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (trimmed.length >= 4) {
      const exactMatch = products.find(
        p => (p.barcode && p.barcode === trimmed) || p.sku.toLowerCase() === trimmed.toLowerCase()
      );
      if (exactMatch && exactMatch.product_id !== selectedProductId) {
        onChange(exactMatch.product_id, exactMatch);
        setIsOpen(false);
        setSearchQuery('');
      }
    }
  }, [searchQuery, products, selectedProductId, onChange]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation (Arrow keys, Enter, Escape)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev + 1 < filteredProducts.length ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev - 1 >= 0 ? prev - 1 : filteredProducts.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredProducts[highlightedIndex]) {
        const item = filteredProducts[highlightedIndex];
        onChange(item.product_id, item);
        setIsOpen(false);
        setSearchQuery('');
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (isOpen && listRef.current) {
      const activeEl = listRef.current.children[highlightedIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, isOpen]);

  const handleSelect = (prod: Product) => {
    onChange(prod.product_id, prod);
    setIsOpen(false);
    setSearchQuery('');
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('', undefined);
    setSearchQuery('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div ref={containerRef} className="relative w-full text-xs">
      {label && (
        <label className="block font-medium text-slate-300 mb-1 flex items-center justify-between">
          <span>{label} {required && <span className="text-rose-400">*</span>}</span>
          <span className="text-[10px] text-slate-400 font-normal">
            تنوع کل: {toPersianDigits(products.length)} قلم
          </span>
        </label>
      )}

      {/* Trigger / Input box */}
      <div
        onClick={() => {
          if (!disabled) {
            setIsOpen(true);
            setTimeout(() => inputRef.current?.focus(), 50);
          }
        }}
        className={`w-full p-2 bg-slate-950 border rounded-xl flex items-center justify-between gap-2 transition-all cursor-pointer ${
          isOpen
            ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-md shadow-indigo-900/10'
            : 'border-slate-800 hover:border-slate-700'
        } ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Boxes className={`w-4 h-4 shrink-0 ${selectedProduct ? 'text-indigo-400' : 'text-slate-500'}`} />
          {selectedProduct ? (
            <div className="min-w-0 flex-1 flex items-center gap-2">
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700/60 shrink-0">
                {selectedProduct.sku}
              </span>
              <span className="font-bold text-slate-100 truncate">{selectedProduct.name}</span>
              <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                ({toPersianDigits(getProductStock(selectedProduct.product_id))} {selectedProduct.unit})
              </span>
            </div>
          ) : (
            <span className="text-slate-500 truncate">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0 pl-[3px]">
          {selectedProduct && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="پاک کردن انتخاب"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-indigo-400' : ''}`} />
        </div>
      </div>

      {/* Dropdown Popup */}
      {isOpen && (
        <div className="absolute top-full mt-1.5 inset-x-0 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-80 animate-in fade-in zoom-in-95 duration-100">
          {/* Search box inside dropdown */}
          <div className="p-2 border-b border-slate-800/80 bg-slate-950/60 sticky top-0 z-10 flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-indigo-400 shrink-0 mr-1" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setHighlightedIndex(0);
              }}
              onKeyDown={handleKeyDown}
              autoFocus={autoFocus}
              placeholder="تایپ نام، کد SKU، بارکد یا دسته..."
              className="w-full bg-transparent text-xs text-slate-100 placeholder-slate-500 focus:outline-none font-sans"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="p-1 text-slate-500 hover:text-slate-300"
              >
                <X className="w-3 h-3" />
              </button>
            )}
            <div className="shrink-0 flex items-center gap-1 text-[10px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md font-mono border border-slate-700/50">
              <Barcode className="w-3 h-3 text-cyan-400" />
              <span>بارکدخوان فعال</span>
            </div>
          </div>

          {/* Results count bar */}
          <div className="px-3 py-1 bg-slate-950/40 text-[10px] text-slate-400 flex items-center justify-between border-b border-slate-800/40">
            <span>
              نمایش {toPersianDigits(filteredProducts.length)} از {toPersianDigits(products.length)} کالا
            </span>
            <span className="text-slate-400">
              کلیدهای ↑ و ↓ برای پیمایش • Enter برای انتخاب
            </span>
          </div>

          {/* Items list */}
          <div ref={listRef} className="overflow-y-auto divide-y divide-slate-800/40 flex-1 p-1">
            {filteredProducts.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs space-y-1">
                <AlertTriangle className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                <p>هیچ کالایی با مشخصات وارد شده یافت نشد.</p>
                <p className="text-[10px] text-slate-400">بارکد یا حروف دیگری را جستجو کنید.</p>
              </div>
            ) : (
              filteredProducts.map((p, idx) => {
                const isSelected = p.product_id === selectedProductId;
                const isHighlighted = idx === highlightedIndex;
                const stock = getProductStock(p.product_id);
                const isLow = stock <= p.min_stock;
                const isZero = stock <= 0;
                const catName = categoryMap.get(p.category_id);

                return (
                  <div
                    key={p.product_id}
                    onClick={() => handleSelect(p)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={`p-2.5 rounded-xl cursor-pointer transition-colors flex items-center justify-between gap-2.5 ${
                      isSelected
                        ? 'bg-indigo-600/20 text-white border border-indigo-500/40'
                        : isHighlighted
                        ? 'bg-slate-800/90 text-slate-100'
                        : 'hover:bg-slate-800/50 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div
                        className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center font-mono text-[10px] ${
                          isZero
                            ? 'bg-rose-950/80 text-rose-400 border border-rose-800/40'
                            : isLow
                            ? 'bg-amber-950/80 text-amber-400 border border-amber-800/40'
                            : 'bg-indigo-950/80 text-indigo-400 border border-indigo-800/40'
                        }`}
                      >
                        {isZero ? '0' : toPersianDigits(stock)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-xs text-white truncate">
                            {p.name}
                          </span>
                          <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-950 text-slate-400 border border-slate-800">
                            {p.sku}
                          </span>
                          {catName && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-800/40">
                              {catName}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                          {p.barcode && (
                            <span className="font-mono flex items-center gap-0.5">
                              <Barcode className="w-2.5 h-2.5 text-cyan-400" />
                              {p.barcode}
                            </span>
                          )}
                          <span>قیمت خرید: {formatCurrencyToman(p.purchase_price)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-left shrink-0">
                      <div className="flex items-center gap-1 justify-end">
                        <span
                          className={`font-bold text-xs ${
                            isZero
                              ? 'text-rose-400'
                              : isLow
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                          }`}
                        >
                          {toPersianDigits(stock)}
                        </span>
                        <span className="text-[10px] text-slate-400">{p.unit}</span>
                      </div>
                      <div className="text-[9px] text-slate-400">
                        {isZero ? 'موجودی صفر' : isLow ? 'زیر نقطه سفارش' : 'مطلوب'}
                      </div>
                    </div>

                    {isSelected && (
                      <Check className="w-4 h-4 text-indigo-400 shrink-0 mr-1" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
