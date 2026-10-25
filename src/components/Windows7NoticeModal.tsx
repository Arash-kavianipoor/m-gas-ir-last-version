import React, { useEffect } from 'react';
import { triggerFileDownload } from '../utils/file-download';
import {
  Monitor,
  CheckCircle2,
  X,
  Download,
  HardDrive,
  Cpu,
  FileText,
  HelpCircle,
  Terminal,
  Info
} from 'lucide-react';

interface Windows7NoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTroubleshooting?: () => void;
}

export const Windows7NoticeModal: React.FC<Windows7NoticeModalProps> = ({
  isOpen,
  onClose,
  onOpenTroubleshooting
}) => {
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
      className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 cursor-pointer"
      onClick={() => onClose()}
    >
      <div
        className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh] cursor-default"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <Monitor className="w-5 h-5 text-cyan-400" />
            <div>
              <h3
                className="text-sm font-bold text-white flex items-center gap-2 cursor-help"
                title="راهبرد پشتیبانی از سخت‌افزارهای صنعتی قدیمی انبار بدون افت امنیت"
              >
                <span>معماری سازگاری دسکتاپ: ویندوز 7 انبار و ویندوز 11 آفیس</span>
                <Info className="w-3.5 h-3.5 text-slate-400" />
              </h3>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-300 leading-relaxed">
          
          {/* Action banner: Troubleshooting Guide */}
          <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="font-bold text-amber-300 flex items-center gap-1.5 text-xs">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                <span>مشکل بسته شدن ناگهانی نصاب در ویندوز 7 یا چک‌لیست پیش‌نیازها؟</span>
              </div>
              <p className="text-[11px] text-slate-300">
                بررسی پچ KB4474419، دات‌نت، بسته‌های Visual C++ و لاگ‌های خطا.
              </p>
            </div>
            {onOpenTroubleshooting && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenTroubleshooting();
                }}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow whitespace-nowrap cursor-pointer transition"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>چک‌لیست و راهنمای عیب‌یابی</span>
              </button>
            )}
          </div>

          <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-800/50 space-y-1.5">
            <div className="text-cyan-300 font-bold flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>قفل نسخه دسکتاپ بر روی Electron 22.3.27</span>
            </div>
            <p className="text-[11px] text-slate-300">
              از نسخه 23 به بعد، موتور کرومیوم پشتیبانی از ویندوز 7 را متوقف کرد. نسخه 22.3.27 با Chromium 108 و Node.js 16.20.2 آخرین نسخه پایدار جهانی است که هم در ویندوز 7 سرویس پک 1 و هم در ویندوز 11 با کارایی کامل اجرا می‌شود.
            </p>
          </div>

          {/* Architecture comparison */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="font-bold text-amber-400 flex items-center gap-1.5">
                <HardDrive className="w-4 h-4" />
                <span>رایانه انبار Warehouse PC - Win 7</span>
              </div>
              <ul className="space-y-1 text-[11px] text-slate-400 list-disc list-inside">
                <li>سیستم‌عامل: Windows 7 SP1 64-bit</li>
                <li>ران‌تایم: Electron 22.3.27</li>
                <li>دیتابیس محلی: SQLite3 فشرده با WAL</li>
                <li>حالت آفلاین: کارکرد مستقل تا چند روز</li>
                <li>شناسه دستگاه: <span className="font-mono text-slate-200">WAREHOUSE-PC-001</span></li>
              </ul>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="font-bold text-blue-400 flex items-center gap-1.5">
                <Cpu className="w-4 h-4" />
                <span>رایانه دفتر مرکزی Office PC - Win 11</span>
              </div>
              <ul className="space-y-1 text-[11px] text-slate-400 list-disc list-inside">
                <li>سیستم‌عامل: Windows 11 Pro 64-bit</li>
                <li>ران‌تایم: Electron سازگار با دو پلتفرم</li>
                <li>دیتابیس محلی: SQLite3 محلی سریع</li>
                <li>همگام‌سازی: خودکار پس از هر ثبت</li>
                <li>شناسه دستگاه: <span className="font-mono text-slate-200">OFFICE-PC-001</span></li>
              </ul>
            </div>
          </div>

          {/* Desktop App Files & Logging */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="font-bold text-slate-200 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>فایل لاگ ذخیره‌شده در پوشه نصب سامانه:</span>
              </span>
              <span className="text-[10px] text-amber-300 font-mono">%LOCALAPPDATA%\Programs\MGasInventory</span>
            </div>
            <div className="font-mono text-[11px] text-emerald-300 bg-slate-900 p-2 rounded border border-slate-800 select-all dir-ltr text-left">
              %LOCALAPPDATA%\Programs\MGasInventory\MGas_Execution_Log.txt
            </div>
            <p className="text-[10px] text-slate-400">
              با زدن کلیدهای Win+R و وارد کردن <span className="font-mono text-cyan-300">notepad %LOCALAPPDATA%\Programs\MGasInventory\MGas_Execution_Log.txt</span> می‌توانید گزارش دقیق بررسی پورت 3000 و اتصال سرور را مشاهده فرمایید.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-800/60 text-slate-400 text-[11px]">
            نکته کلیدی معماری: فرانت‌اند React و کاتالوگ کالاها و مشتریان در هر دو نسخه دسکتاپ به صورت کامپوننت مشترک رندر می‌شوند و داده‌ها از طریق دیتابیس D1 کلادفلر تضمین تطابق 100% دارند.
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950/60">
          <div className="flex flex-wrap items-center gap-2">
            <a
              href="/downloads/Warehouse-Windows7-Setup.exe"
              download="Warehouse-Windows7-Setup.exe"
              onClick={(e) => triggerFileDownload('/downloads/Warehouse-Windows7-Setup.exe', 'Warehouse-Windows7-Setup.exe', e)}
              className="px-3 py-1.5 rounded-lg bg-cyan-900/50 hover:bg-cyan-800 text-cyan-200 border border-cyan-700/60 text-xs font-bold flex items-center gap-1.5 shadow transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>نصاب ویندوز 7</span>
            </a>

            <a
              href="/downloads/Office-Windows11-Setup.exe"
              download="Office-Windows11-Setup.exe"
              onClick={(e) => triggerFileDownload('/downloads/Office-Windows11-Setup.exe', 'Office-Windows11-Setup.exe', e)}
              className="px-3 py-1.5 rounded-lg bg-emerald-900/50 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/60 text-xs font-bold flex items-center gap-1.5 shadow transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>نصاب ویندوز 11</span>
            </a>

            <a
              href="/troubleshooting_win7.txt"
              download="M-Gas-Troubleshooting-Win7.txt"
              onClick={(e) => triggerFileDownload('/troubleshooting_win7.txt', 'M-Gas-Troubleshooting-Win7.txt', e)}
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 hover:underline mr-1 cursor-pointer"
            >
              <span>راهنما</span>
            </a>
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:border-slate-700 rounded-lg transition cursor-pointer"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};
