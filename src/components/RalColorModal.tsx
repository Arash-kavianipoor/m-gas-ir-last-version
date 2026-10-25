import React, { useState, useMemo } from 'react';
import { X, Search, Check, Sparkles, Paintbrush, Filter, Layers } from 'lucide-react';
import { RAL_COLORS, RAL_POPULAR_COLORS, RalColor, RalCategory, getRalColorsByCategory, searchRalColors } from '../data/ralColors';
import { useLanguage } from '../i18n/LanguageContext';
import { PAGE_TRANSLATIONS } from '../i18n/pageTranslations';

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
  const pt = PAGE_TRANSLATIONS[currentLanguage] || PAGE_TRANSLATIONS.fa;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<RalCategory | 'all' | 'popular'>('popular');

  const categoryLabels: Record<RalCategory | 'all' | 'popular', Record<string, string>> = {
    popular: {
      fa: 'پرکاربردترین‌ها (صنعتی)',
      en: 'Popular Industrial',
      de: 'Industrie-Bestseller',
      ar: 'الأكثر استخداماً (صناعي)',
      ur: 'سب سے زیادہ استعمال شدہ',
      tr: 'En Popüler Endüstriyel',
      ru: 'Популярные промышленные',
      hy: 'Հանրաճանաչ արդյունաբերական',
    },
    all: {
      fa: 'همه ۲۰۰+ رنگ',
      en: 'All 200+ Colors',
      de: 'Alle 200+ Farben',
      ar: 'جميع الألوان (+200)',
      ur: 'تمام ۲۰۰+ رنگ',
      tr: 'Tüm 200+ Renk',
      ru: 'Все 200+ цветов',
      hy: 'Բոլոր 200+ գույները',
    },
    green: {
      fa: 'سبز و زیتونی',
      en: 'Greens',
      de: 'Grüntöne',
      ar: 'أخضر وزيتوني',
      ur: 'سبز اور زیتونی',
      tr: 'Yeşil Tonları',
      ru: 'Зеленые',
      hy: 'Կանաչ երանգներ',
    },
    blue: {
      fa: 'آبی و لاجوردی',
      en: 'Blues',
      de: 'Blautöne',
      ar: 'أزرق ولازوردي',
      ur: 'نیلا اور فیروزی',
      tr: 'Mavi Tonları',
      ru: 'Синие',
      hy: 'Կապույտ երանգներ',
    },
    red: {
      fa: 'قرمز و شرابی',
      en: 'Reds',
      de: 'Rottöne',
      ar: 'أحمر وعنابي',
      ur: 'سرخ اور عنابی',
      tr: 'Kırmızı Tonları',
      ru: 'Красные',
      hy: 'Կարմիր երանգներ',
    },
    orange: {
      fa: 'نارنجی و آجری',
      en: 'Oranges',
      de: 'Orangetöne',
      ar: 'برتقالي وآجوري',
      ur: 'نارنجی اور اینٹ جیسا',
      tr: 'Turuncu Tonları',
      ru: 'Оранжевые',
      hy: 'Նարնջագույն երանգներ',
    },
    yellow: {
      fa: 'زرد و اخرایی',
      en: 'Yellows',
      de: 'Gelbtöne',
      ar: 'أصفر ومغرة',
      ur: 'پیلا اور گہرا پیلا',
      tr: 'Sarı Tonları',
      ru: 'Желтые',
      hy: 'Դեղին երանգներ',
    },
    grey: {
      fa: 'طوسی و دودی',
      en: 'Greys',
      de: 'Grautöne',
      ar: 'رمادي ودخاني',
      ur: 'سرمئی اور دھواں دار',
      tr: 'Gri Tonları',
      ru: 'Серые',
      hy: 'Մոխրագույն երանգներ',
    },
    white_black: {
      fa: 'سفید و مشکی',
      en: 'White & Black',
      de: 'Weiß & Schwarz',
      ar: 'أبيض وأسود',
      ur: 'سفید اور سیاہ',
      tr: 'Beyaz & Siyah',
      ru: 'Белые и черные',
      hy: 'Սպիտակ և սև',
    },
    brown: {
      fa: 'قهوه‌ای',
      en: 'Browns',
      de: 'Brauntöne',
      ar: 'بني',
      ur: 'بھورا',
      tr: 'Kahverengi Tonları',
      ru: 'Коричневые',
      hy: 'Շագանակագույն երանգներ',
    },
    violet: {
      fa: 'بنفش',
      en: 'Violets',
      de: 'Violetttöne',
      ar: 'بنفسجي',
      ur: 'جامنی',
      tr: 'Mor Tonları',
      ru: 'Фиолетовые',
      hy: 'Մանուշակագույն երանգներ',
    },
  };

  const categoryKeys: (RalCategory | 'all' | 'popular')[] = [
    'popular',
    'all',
    'green',
    'blue',
    'red',
    'orange',
    'yellow',
    'grey',
    'white_black',
    'brown',
    'violet',
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 cursor-pointer"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden cursor-default"
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
                {pt.ralModalTitle}
              </h3>
              <p className="text-xs text-slate-400">
                {pt.ralModalDesc}
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
              placeholder={pt.ralSearchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full ps-10 pe-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white bg-slate-800 px-2 py-0.5 rounded-md"
              >
                {pt.ralClear}
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {categoryKeys.map((catKey) => {
              const label = (categoryLabels[catKey] && (categoryLabels[catKey][currentLanguage] || categoryLabels[catKey].fa)) || catKey;
              return (
                <button
                  key={catKey}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(catKey);
                    setSearchTerm('');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
                    selectedCategory === catKey && !searchTerm
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/50'
                      : 'bg-slate-800/70 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  {label}
                </button>
              );
            })}
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
                    {currentLanguage === 'fa'
                      ? color.nameFa
                      : currentLanguage === 'de' && color.nameDe
                      ? color.nameDe
                      : color.nameEn}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {currentLanguage === 'fa'
                      ? color.nameEn
                      : currentLanguage === 'de'
                      ? color.nameEn
                      : color.nameDe || color.nameFa}
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
            <span>{pt.specsColorCoatingNote}</span>
          </div>

          <div className="text-slate-300 font-mono">
            {filteredColors.length} {pt.specsColorsFound}
          </div>
        </div>
      </div>
    </div>
  );
};
