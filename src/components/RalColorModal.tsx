import React, { useState, useMemo } from 'react';
import { X, Search, Check, Sparkles, Paintbrush, Filter, Layers } from 'lucide-react';
import { RAL_COLORS, RAL_POPULAR_COLORS, RalColor, RalCategory, getRalColorsByCategory, searchRalColors } from '../data/ralColors';
import { useLanguage } from '../i18n/LanguageContext';

interface RalColorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedColor?: RalColor | null;
  onSelectColor: (color: RalColor) => void;
}

export const RalColorModal: React.FC<RalColorModalProps> = ({
  isOpen,
  onClose,
  selectedColor,
  onSelectColor,
}) => {
  const { currentLanguage } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<RalCategory | 'all' | 'popular'>('popular');

  const categories: { key: RalCategory | 'all' | 'popular'; nameFa: string; nameEn: string }[] = [
    { key: 'popular', nameFa: 'پرکاربردترین‌ها (صنعتی)', nameEn: 'Popular Industrial' },
    { key: 'all', nameFa: 'همه ۲۰۰+ رنگ', nameEn: 'All 200+ Colors' },
    { key: 'green', nameFa: 'سبز و زیتونی', nameEn: 'Greens' },
    { key: 'blue', nameFa: 'آبی و لاجوردی', nameEn: 'Blues' },
    { key: 'red', nameFa: 'قرمز و شرابی', nameEn: 'Reds' },
    { key: 'orange', nameFa: 'نارنجی و آجری', nameEn: 'Oranges' },
    { key: 'yellow', nameFa: 'زرد و اخرایی', nameEn: 'Yellows' },
    { key: 'grey', nameFa: 'طوسی و دودی', nameEn: 'Greys' },
    { key: 'white_black', nameFa: 'سفید و مشکی', nameEn: 'White & Black' },
    { key: 'brown', nameFa: 'قهوه‌ای', nameEn: 'Browns' },
    { key: 'violet', nameFa: 'بنفش', nameEn: 'Violets' },
  ];

  const filteredColors = useMemo(() => {
    if (searchTerm.trim()) {
      return searchRalColors(searchTerm);
    }
    if (selectedCategory === 'popular') {
      return RAL_POPULAR_COLORS;
    }
    if (selectedCategory === 'all') {
      return RAL_COLORS;
    }
    return getRalColorsByCategory(selectedCategory);
  }, [searchTerm, selectedCategory]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Paintbrush className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                {currentLanguage === 'fa' ? 'کاتالوگ رنگ‌های پودری الکترواستاتیک RAL' : 'RAL Electrostatic Powder Color Chart'}
              </h3>
              <p className="text-xs text-slate-400">
                {currentLanguage === 'fa'
                  ? 'انتخاب رنگ سفارشی کوره‌ای طبق استاندارد بین‌المللی رال'
                  : 'Select certified electrostatic oven-cured coating according to international RAL standards'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter bar */}
        <div className="p-4 bg-slate-900/90 border-b border-slate-800 space-y-3">
          {/* Search input */}
          <div className="relative">
            <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={
                currentLanguage === 'fa'
                  ? 'جستجو بر اساس کد (مثلاً 6018 یا RAL 5015) یا نام رنگ...'
                  : 'Search by RAL code (e.g. 6018 or RAL 5015) or color name...'
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full ps-10 pe-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white bg-slate-800 px-2 py-0.5 rounded-md"
              >
                {currentLanguage === 'fa' ? 'پاک کردن' : 'Clear'}
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {categories.map((cat) => (
              <button
                key={cat.key}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat.key);
                  setSearchTerm('');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
                  selectedCategory === cat.key && !searchTerm
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/50'
                    : 'bg-slate-800/70 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                {currentLanguage === 'fa' ? cat.nameFa : cat.nameEn}
              </button>
            ))}
          </div>
        </div>

        {/* Color Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filteredColors.map((color) => {
            const isSelected = selectedColor?.code === color.code;
            return (
              <button
                key={color.code}
                type="button"
                onClick={() => {
                  onSelectColor(color);
                  onClose();
                }}
                className={`group relative p-3 rounded-2xl border text-start transition-all flex flex-col items-start gap-2.5 overflow-hidden ${
                  isSelected
                    ? 'bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/40 shadow-xl'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-600 hover:bg-slate-800/50'
                }`}
              >
                {/* Color Swatch Circle / Pill */}
                <div className="relative w-full h-16 rounded-xl border border-white/20 shadow-inner overflow-hidden flex items-end p-2 transition-transform group-hover:scale-[1.02]">
                  <div
                    className="absolute inset-0"
                    style={{ backgroundColor: color.hex }}
                  />
                  {/* Metallic Gloss Highlight */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/30 via-transparent to-white/30 pointer-events-none" />

                  {/* Checked Badge if Selected */}
                  {isSelected && (
                    <div className="relative z-10 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>

                {/* Color Details */}
                <div className="w-full">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-white group-hover:text-emerald-400 transition-colors">
                      {color.code}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">{color.hex}</span>
                  </div>
                  <div className="text-xs text-slate-200 font-medium truncate mt-0.5">
                    {currentLanguage === 'fa' ? color.nameFa : color.nameEn}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {currentLanguage === 'fa' ? color.nameEn : color.nameDe}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer Info */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>
              {currentLanguage === 'fa'
                ? 'پوشش رنگ کلیه سیلندرها با ضخامت ۸۰ الی ۱۲۰ میکرون در کوره ۱۸۰ درجه پخت می‌شود.'
                : 'All cylinders are coated with 80-120μm electrostatic powder, baked at 180°C.'}
            </span>
          </div>

          <div className="text-slate-300 font-mono">
            {filteredColors.length} {currentLanguage === 'fa' ? 'رنگ یافت شد' : 'colors found'}
          </div>
        </div>
      </div>
    </div>
  );
};
