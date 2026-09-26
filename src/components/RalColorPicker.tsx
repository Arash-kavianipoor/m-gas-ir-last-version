import React, { useState } from 'react';
import { Palette, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { RAL_POPULAR_COLORS, RalColor } from '../data/ralColors';
import { RalColorModal } from './RalColorModal';
import { useLanguage } from '../i18n/LanguageContext';

interface RalColorPickerProps {
  selectedColor?: RalColor | null;
  onSelectColor: (color: RalColor) => void;
  defaultRalCode?: string;
}

export const RalColorPicker: React.FC<RalColorPickerProps> = ({
  selectedColor,
  onSelectColor,
  defaultRalCode = 'RAL 6018',
}) => {
  const { currentLanguage } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Quick favorite swatches
  const quickColors = RAL_POPULAR_COLORS.slice(0, 7);

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5 text-emerald-400" />
          <span>{currentLanguage === 'fa' ? 'انتخاب رنگ پوشش کوره‌ای (RAL):' : 'Coating Color (RAL Chart):'}</span>
        </label>

        {/* Selected badge */}
        <span className="text-[11px] font-mono text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-500/30">
          {selectedColor ? `${selectedColor.code} - ${currentLanguage === 'fa' ? selectedColor.nameFa : selectedColor.nameEn}` : defaultRalCode}
        </span>
      </div>

      {/* Quick Swatches Row */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 flex-1 overflow-x-auto py-1 scrollbar-none">
          {quickColors.map((color) => {
            const isSelected = (selectedColor?.code || defaultRalCode) === color.code;
            return (
              <button
                key={color.code}
                type="button"
                onClick={() => onSelectColor(color)}
                title={`${color.code} - ${currentLanguage === 'fa' ? color.nameFa : color.nameEn}`}
                className={`relative w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 transition-all shrink-0 flex items-center justify-center ${
                  isSelected
                    ? 'border-emerald-400 scale-110 shadow-lg ring-2 ring-emerald-500/50'
                    : 'border-slate-700/80 hover:scale-105 hover:border-slate-400'
                }`}
                style={{ backgroundColor: color.hex }}
              >
                {isSelected && (
                  <Check
                    className={`w-3.5 h-3.5 stroke-[3] ${
                      color.code === 'RAL 9010' || color.code === 'RAL 1021' ? 'text-black' : 'text-white'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Open Full RAL Catalog Button */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 shadow-sm"
        >
          <Palette className="w-3.5 h-3.5 text-emerald-400" />
          <span>{currentLanguage === 'fa' ? 'کاتالوگ ۲۰۰+ رنگ' : 'All 200+ Colors'}</span>
        </button>
      </div>

      {/* Modal for 200+ RAL Colors */}
      <RalColorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedColor={selectedColor}
        onSelectColor={onSelectColor}
      />
    </div>
  );
};
