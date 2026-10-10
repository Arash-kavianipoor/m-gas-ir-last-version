import React, { useState } from 'react';
import { Palette, ChevronDown, Check } from 'lucide-react';
import { RalColor, RAL_POPULAR_COLORS, getRalColorByCode } from '../data/ralColors';
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
  const [modalOpen, setModalOpen] = useState(false);

  const currentColor = selectedColor || getRalColorByCode(defaultRalCode) || RAL_POPULAR_COLORS[0];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <label className="text-slate-300 font-semibold flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5 text-emerald-400" />
          <span>{currentLanguage === 'fa' ? 'پوشش رنگ الکترواستاتیک (RAL):' : 'Electrostatic Powder Coating (RAL):'}</span>
        </label>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="text-emerald-400 hover:text-emerald-300 font-medium text-[11px] underline underline-offset-2"
        >
          {currentLanguage === 'fa' ? 'مشاهده کاتالوگ ۲۰۰+ رنگ' : 'View all 200+ RAL colors'}
        </button>
      </div>

      {/* Selected Color Trigger Button */}
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-700/80 hover:border-emerald-500/60 transition-all group text-start"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-6 h-6 rounded-lg border border-white/20 shadow-md shrink-0 ring-1 ring-slate-700"
            style={{ backgroundColor: currentColor.hex }}
          />
          <div className="min-w-0">
            <span className="text-xs font-bold text-white block truncate">{currentColor.code}</span>
            <span className="text-[11px] text-slate-400 block truncate">
              {currentLanguage === 'fa' ? currentColor.nameFa : currentColor.nameEn}
            </span>
          </div>
        </div>
        <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-white shrink-0 ml-2" />
      </button>

      {/* Quick Color Swatches */}
      <div className="flex items-center gap-1.5 pt-1 overflow-x-auto pb-1">
        {RAL_POPULAR_COLORS.slice(0, 6).map((color) => {
          const isSelected = currentColor.code === color.code;
          return (
            <button
              key={color.code}
              type="button"
              onClick={() => onSelectColor(color)}
              title={`${color.code} - ${color.nameEn}`}
              className={`w-7 h-7 rounded-lg shrink-0 border transition-all flex items-center justify-center ${
                isSelected
                  ? 'border-emerald-400 ring-2 ring-emerald-500/40 scale-110 shadow-lg'
                  : 'border-slate-700 hover:scale-105 opacity-80 hover:opacity-100'
              }`}
              style={{ backgroundColor: color.hex }}
            >
              {isSelected && <Check className="w-3.5 h-3.5 text-white drop-shadow-md stroke-[3]" />}
            </button>
          );
        })}
      </div>

      {/* Full Modal */}
      <RalColorModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        selectedColor={currentColor}
        onSelectColor={(col) => {
          onSelectColor(col);
          setModalOpen(false);
        }}
      />
    </div>
  );
};
