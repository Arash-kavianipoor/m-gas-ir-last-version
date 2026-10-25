import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Calendar as CalendarIcon, ChevronRight, ChevronLeft, ChevronsRight, ChevronsLeft, Check, X, RotateCcw, Sparkles } from 'lucide-react';
import { toPersianDigits, toEnglishDigits, getPersianDate } from '../utils/persian';

export interface PersianDatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  id?: string;
  name?: string;
  showJumpButton?: boolean;
  defaultToToday?: boolean;
  iconOnly?: boolean;
  asModal?: boolean;
}

const PERSIAN_MONTHS = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند'
];

const WEEK_DAYS = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

function isJalaliLeapYear(jy: number): boolean {
  return (((((jy - (jy > 0 ? 474 : 473)) % 2820) + 474) + 38) * 682) % 2816 < 682;
}

function getJalaliMonthDays(jy: number, jm: number): number {
  if (jm <= 6) return 31;
  if (jm <= 11) return 30;
  return isJalaliLeapYear(jy) ? 30 : 29;
}

function jalaliToGregorian(jy: number, jm: number, jd: number): [number, number, number] {
  let gy = jy <= 979 ? 621 : 1600;
  let jyear = jy - (jy <= 979 ? 0 : 979);
  let days =
    365 * jyear +
    Math.floor(jyear / 33) * 8 +
    Math.floor(((jyear % 33) + 3) / 4) +
    78 +
    jd +
    (jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186);

  gy += 400 * Math.floor(days / 146097);
  days %= 146097;

  if (days >= 36525) {
    days--;
    gy += 100 * Math.floor(days / 36524);
    days %= 36524;
    if (days >= 365) days++;
  }

  gy += 4 * Math.floor(days / 1461);
  days %= 1461;

  gy += Math.floor((days - 1) / 365);
  if (days > 0) days = (days - 1) % 365;

  let gd = days + 1;
  const sal_a = [
    0,
    31,
    (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0 ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31
  ];

  let gm = 0;
  for (gm = 0; gm < 13; gm++) {
    const v = sal_a[gm];
    if (gd <= v) break;
    gd -= v;
  }
  return [gy, gm, gd];
}

// Get day of week for 1st day of Shamsi month (0: شنبه, 1: یکشنبه, ..., 6: جمعه)
function getFirstDayOfWeekOfMonth(jy: number, jm: number): number {
  const [gy, gm, gd] = jalaliToGregorian(jy, jm, 1);
  const date = new Date(gy, gm - 1, gd);
  return (date.getDay() + 1) % 7;
}

// Get today's Shamsi date as [year, month, day]
export function getTodayJalali(): [number, number, number] {
  try {
    const parts = new Intl.DateTimeFormat('fa-IR-u-ca-persian-nu-latn', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    }).formatToParts(new Date());

    const year = Number(parts.find(p => p.type === 'year')?.value || 1405);
    const month = Number(parts.find(p => p.type === 'month')?.value || 7);
    const day = Number(parts.find(p => p.type === 'day')?.value || 19);
    return [year, month, day];
  } catch {
    return [1405, 7, 19];
  }
}

export function getTodayJalaliString(): string {
  const [y, m, d] = getTodayJalali();
  const formattedMonth = String(m).padStart(2, '0');
  const formattedDay = String(d).padStart(2, '0');
  return `${y}/${formattedMonth}/${formattedDay}`;
}

export const PersianDatePicker: React.FC<PersianDatePickerProps> = ({
  value,
  onChange,
  placeholder = '1405/07/19',
  required = false,
  className = '',
  id,
  name,
  showJumpButton = false,
  defaultToToday = false,
  iconOnly = false,
  asModal = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectorMode, setSelectorMode] = useState<'days' | 'months' | 'years'>('days');
  const containerRef = useRef<HTMLDivElement>(null);
  const yearsContainerRef = useRef<HTMLDivElement>(null);

  // Parse current value or fallback to today
  const today = getTodayJalali();
  const todayString = `${today[0]}/${String(today[1]).padStart(2, '0')}/${String(today[2]).padStart(2, '0')}`;

  // If value is empty on mount and defaultToToday is true, auto jump to today's date
  useEffect(() => {
    if (defaultToToday && (!value || value.trim() === '')) {
      onChange(todayString);
    }
  }, [defaultToToday]);

  const parsedValue = useMemo(() => {
    if (!value) return null;
    const cleanStr = toEnglishDigits(value.trim());
    const parts = cleanStr.split(/[\/\-]/);
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      const d = parseInt(parts[2], 10);
      if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
        return { year: y, month: m, day: d };
      }
    }
    return null;
  }, [value]);

  const [viewYear, setViewYear] = useState<number>(parsedValue?.year || today[0]);
  const [viewMonth, setViewMonth] = useState<number>(parsedValue?.month || today[1]);

  // Synchronize view with value when opened
  useEffect(() => {
    if (parsedValue) {
      setViewYear(parsedValue.year);
      setViewMonth(parsedValue.month);
    }
    if (isOpen) {
      setSelectorMode('days');
    }
  }, [isOpen]);

  // Auto-scroll to selected year when switching to 'years' mode
  useEffect(() => {
    if (selectorMode === 'years' && yearsContainerRef.current) {
      const activeYearBtn = yearsContainerRef.current.querySelector('[data-selected="true"]');
      if (activeYearBtn) {
        activeYearBtn.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    }
  }, [selectorMode]);

  // Click outside listener that does not intercept select interactions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectorMode('days');
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setSelectorMode('days');
      }
    };
    if (isOpen) {
      document.addEventListener('pointerdown', handleClickOutside, true);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('pointerdown', handleClickOutside, true);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Month navigation
  const handlePrevMonth = () => {
    if (viewMonth === 1) {
      setViewMonth(12);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 12) {
      setViewMonth(1);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handlePrevYear = () => {
    setViewYear(prev => prev - 1);
  };

  const handleNextYear = () => {
    setViewYear(prev => prev + 1);
  };

  const handleSelectDay = (day: number) => {
    const formattedMonth = String(viewMonth).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    onChange(`${viewYear}/${formattedMonth}/${formattedDay}`);
    setIsOpen(false);
    setSelectorMode('days');
  };

  const handleSelectToday = () => {
    const [y, m, d] = getTodayJalali();
    const formattedMonth = String(m).padStart(2, '0');
    const formattedDay = String(d).padStart(2, '0');
    onChange(`${y}/${formattedMonth}/${formattedDay}`);
    setViewYear(y);
    setViewMonth(m);
    setIsOpen(false);
    setSelectorMode('days');
  };

  const handleClear = () => {
    onChange('');
    setIsOpen(false);
    setSelectorMode('days');
  };

  const daysInMonth = getJalaliMonthDays(viewYear, viewMonth);
  const firstDayOffset = getFirstDayOfWeekOfMonth(viewYear, viewMonth);

  // Generate Year options from 1390 to 1415
  const yearOptions = useMemo(() => {
    const list: number[] = [];
    for (let y = 1390; y <= 1415; y++) {
      list.push(y);
    }
    return list;
  }, []);

  return (
    <div className={`relative ${iconOnly ? 'inline-flex items-center justify-center' : 'w-full'}`} ref={containerRef} dir="rtl">
      {/* Input or Icon-Only Trigger */}
      {iconOnly ? (
        <div className="flex flex-col items-center justify-center gap-1">
          <button
            type="button"
            id={id}
            name={name}
            onClick={() => setIsOpen(true)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-emerald-600 dark:text-emerald-400 border border-slate-300 dark:border-slate-700 hover:border-emerald-500 shadow-xs transition-all cursor-pointer flex items-center justify-center group active:scale-95 mx-auto"
            title={`انتخاب تاریخ شمسی (تاریخ انتخابی: ${toPersianDigits(value) || 'ثبت نشده'})`}
          >
            <CalendarIcon className="w-5 h-5 transition-transform group-hover:scale-110 text-emerald-600 dark:text-emerald-400" />
          </button>
          {value && (
            <span className="text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300 text-center select-none block" dir="ltr">
              {toPersianDigits(value)}
            </span>
          )}
        </div>
      ) : (
        <div className="relative flex items-center gap-1">
          <div className="relative flex-1 flex items-center">
            <input
              type="text"
              id={id}
              name={name}
              value={value}
              onChange={e => onChange(e.target.value)}
              onClick={() => setIsOpen(true)}
              required={required}
              placeholder={placeholder}
              className={
                className ||
                'w-full text-xs bg-slate-950 border border-slate-700 rounded-xl pr-3 pl-16 py-2 text-slate-100 font-mono focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all'
              }
            />
            <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {value && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClear();
                  }}
                  className="p-1 text-slate-400 hover:text-rose-400 rounded-md transition-colors cursor-pointer"
                  title="پاک کردن تاریخ"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(prev => !prev)}
                className="p-1 text-slate-400 hover:text-amber-400 rounded-md transition-colors cursor-pointer"
                title="باز کردن تقویم شمسی و انتخاب سال، ماه و روز"
              >
                <CalendarIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Dialog - Rendered as a Fixed Modal (never clipped by table overflow or modal borders) */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs cursor-pointer"
          onClick={() => {
            setIsOpen(false);
            setSelectorMode('days');
          }}
        >
          <div
            className="w-80 max-w-[calc(100vw-2rem)] bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl p-4 space-y-3.5 text-slate-100 backdrop-blur-md cursor-default animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* Modal Title Bar */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-emerald-400" />
                <span className="font-extrabold text-xs text-white">انتخاب تاریخ شمسی</span>
                {value && (
                  <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-500/30">
                    {toPersianDigits(value)}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setSelectorMode('days');
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="بستن تقویم"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Header with Navigation and Mode Switchers */}
            <div className="flex items-center justify-between gap-1 pb-1 border-b border-slate-800/80">
            {/* Quick Previous Buttons (Year & Month) */}
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={handlePrevYear}
                className="p-1 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition-colors cursor-pointer"
                title="سال قبل"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="ماه قبل"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Interactive Month & Year Buttons (Click to open grid selector) */}
            <div className="flex items-center gap-1.5 text-xs font-bold">
              {/* Month Toggle Button */}
              <button
                type="button"
                onClick={() => setSelectorMode(prev => prev === 'months' ? 'days' : 'months')}
                className={`px-2.5 py-1 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                  selectorMode === 'months'
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-xs'
                    : 'bg-slate-950/80 hover:bg-slate-800 text-slate-200 border-slate-700 hover:border-amber-500/50'
                }`}
                title="کلیک برای انتخاب سریع ماه از لیست ۱۲ تایی"
              >
                <span>{PERSIAN_MONTHS[viewMonth - 1]}</span>
              </button>

              {/* Year Toggle Button */}
              <button
                type="button"
                onClick={() => setSelectorMode(prev => prev === 'years' ? 'days' : 'years')}
                className={`px-2.5 py-1 rounded-lg border text-xs font-bold font-mono transition-all cursor-pointer ${
                  selectorMode === 'years'
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-xs'
                    : 'bg-slate-950/80 hover:bg-slate-800 text-slate-200 border-slate-700 hover:border-amber-500/50'
                }`}
                title="کلیک برای انتخاب سریع سال"
              >
                <span>{toPersianDigits(viewYear)}</span>
              </button>
            </div>

            {/* Quick Next Buttons (Month & Year) */}
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="ماه بعد"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextYear}
                className="p-1 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition-colors cursor-pointer"
                title="سال بعد"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* VIEW MODE 1: Fast 12-Months Selection Grid */}
          {selectorMode === 'months' && (
            <div className="space-y-2 py-1">
              <div className="text-center text-[11px] font-bold text-amber-400 pb-1">
                انتخاب ماه در سال {toPersianDigits(viewYear)}:
              </div>
              <div className="grid grid-cols-3 gap-2">
                {PERSIAN_MONTHS.map((m, idx) => {
                  const mNum = idx + 1;
                  const isCurrent = viewMonth === mNum;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        setViewMonth(mNum);
                        setSelectorMode('days');
                      }}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                          : 'bg-slate-950/70 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {m}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW MODE 2: Fast Years Selection Grid */}
          {selectorMode === 'years' && (
            <div className="space-y-2 py-1">
              <div className="text-center text-[11px] font-bold text-amber-400 pb-1">
                انتخاب سال (۱۳۹۰ تا ۱۴۱۵):
              </div>
              <div
                ref={yearsContainerRef}
                className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1 border border-slate-800 rounded-xl bg-slate-950/60"
              >
                {yearOptions.map(y => {
                  const isCurrent = viewYear === y;
                  return (
                    <button
                      key={y}
                      type="button"
                      data-selected={isCurrent}
                      onClick={() => {
                        setViewYear(y);
                        setSelectorMode('days');
                      }}
                      className={`py-2 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                          : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {toPersianDigits(y)}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW MODE 3: Standard Days View */}
          {selectorMode === 'days' && (
            <>
              {/* Weekday Names Header */}
              <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-400">
                {WEEK_DAYS.map((w, idx) => (
                  <div
                    key={w}
                    className={`py-1 ${idx === 6 ? 'text-rose-400 font-black' : 'text-slate-400'}`}
                  >
                    {w}
                  </div>
                ))}
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {/* Blank leading slots */}
                {Array.from({ length: firstDayOffset }).map((_, i) => (
                  <div key={`empty-${i}`} className="w-8 h-8" />
                ))}

                {/* Days 1 to N */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNumber = i + 1;
                  const isSelected =
                    parsedValue?.year === viewYear &&
                    parsedValue?.month === viewMonth &&
                    parsedValue?.day === dayNumber;

                  const isToday =
                    today[0] === viewYear &&
                    today[1] === viewMonth &&
                    today[2] === dayNumber;

                  const dayOfWeek = (firstDayOffset + i) % 7;
                  const isFriday = dayOfWeek === 6;

                  return (
                    <button
                      key={`day-${dayNumber}`}
                      type="button"
                      onClick={() => handleSelectDay(dayNumber)}
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono transition-all text-xs cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/30 ring-2 ring-amber-400'
                          : isToday
                          ? 'border border-amber-500/80 text-amber-400 hover:bg-slate-800 font-bold'
                          : isFriday
                          ? 'text-rose-400 hover:bg-slate-800 font-bold'
                          : 'text-slate-200 hover:bg-slate-800 font-medium'
                      }`}
                    >
                      {toPersianDigits(dayNumber)}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* Footer Controls: Today, Clear, and Close */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={handleSelectToday}
              className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold text-[11px] transition-colors flex items-center gap-1 cursor-pointer"
              title="انتخاب سریع تاریخ امروز"
            >
              <Sparkles className="w-3 h-3" />
              <span>امروز ({toPersianDigits(today[0])}/{toPersianDigits(today[1])}/{toPersianDigits(today[2])})</span>
            </button>

            <div className="flex items-center gap-1.5">
              {value && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-2 py-1 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 text-[11px] font-bold transition-colors cursor-pointer"
                >
                  پاک کردن
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setSelectorMode('days');
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] transition-colors cursor-pointer font-medium"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
  );
};
