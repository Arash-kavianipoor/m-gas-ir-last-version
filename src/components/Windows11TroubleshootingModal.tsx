import React, { useState, useEffect } from 'react';
import { triggerFileDownload } from '../utils/file-download';
import {
  Monitor,
  CheckCircle2,
  AlertTriangle,
  FolderCog,
  FileText,
  Terminal,
  Download,
  HardDriveDownload,
  Copy,
  Check,
  X,
  ExternalLink,
  ShieldAlert,
  HardDrive,
  Cpu,
  HelpCircle,
  Play
} from 'lucide-react';

interface Windows11TroubleshootingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Windows11TroubleshootingModal: React.FC<Windows11TroubleshootingModalProps> = ({
  isOpen,
  onClose
}) => {
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(id);
    setTimeout(() => setCopiedItem(null), 2500);
  };

  // Global Escape key listener to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 cursor-pointer"
      onClick={() => onClose()}
    >
      <div
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] cursor-default"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
              <Cpu className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>راهنمای عیب‌یابی نصب و سیستم ثبت لاگ ویندوز 11 (نسخه آفیس)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-900/60 border border-blue-700 text-blue-300 font-mono">
                  Windows 11 / 10 x64
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                بررسی دلایل باز نشدن نصاب، پایش فایل‌های لاگ در همان پوشه و رفع خطاهای دسترسی ویندوز
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-300 leading-relaxed">
          {/* Official Installer Download Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-blue-950/70 border border-emerald-500/50 shadow-lg space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="text-emerald-300 font-bold flex items-center gap-2 text-sm">
                  <HardDriveDownload className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>دانلود فایل نصبی رسمی سامانه انبارداری ام گاز (ویندوز 11 و 10)</span>
                </div>
                <p className="text-[11px] text-slate-200">
                  این نصاب رسمی، برنامه را به‌صورت استاندارد و سریع نصب کرده و آیکون <strong className="text-amber-300">«انبارداری ام گاز»</strong> را در <strong className="text-white">لیست برنامه‌های منوی استارت (Start Menu)</strong> و روی <strong className="text-white">دسکتاپ</strong> قرار می‌دهد.
                </p>
                <p className="text-[10px] text-slate-300">
                  ⚡ با کلیک روی آیکون نصب‌شده، سامانه مستقیماً با آدرس <span className="font-mono text-cyan-300">http://localhost:3000/</span> در مرورگر اجرا می‌شود.
                </p>
              </div>

              <a
                href="/downloads/Office-Windows11-Setup.exe"
                download="Office-Windows11-Setup.exe"
                onClick={(e) => triggerFileDownload('/downloads/Office-Windows11-Setup.exe', 'Office-Windows11-Setup.exe', e)}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md transition whitespace-nowrap cursor-pointer shrink-0"
              >
                <Download className="w-4 h-4 text-slate-950" />
                <span>دانلود نصاب (.exe)</span>
              </a>
            </div>
          </div>

          {/* Critical Feature Banner: In-Folder Logging */}
          <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-800/60 space-y-3">
            <div className="text-blue-300 font-bold flex items-center gap-2 text-sm">
              <FileText className="w-4 h-4 text-blue-400" />
              <span>فایل لاگ ذخیره‌شده در همان پوشه برنامه (MGas_Execution_Log.txt)</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-normal">
              سیستم به صورت خودکار تمامی اتفاقات، بررسی پورت 3000، اتصال وب‌سرور داخلی ویندوز و فرآیند اجرای مرورگر را در یک فایل متنی اختصاصی (<span className="text-amber-300 font-mono">MGas_Execution_Log.txt</span>) در همان پوشه نصب ثبت می‌کند.
            </p>

            <div className="p-3 rounded-lg bg-slate-950/90 border border-blue-900/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>آدرس مستقیم فایل لاگ در ویندوز:</span>
                </span>
                <button
                  onClick={() => copyToClipboard('%LOCALAPPDATA%\\Programs\\MGasInventory\\MGas_Execution_Log.txt', 'log-path')}
                  className="px-2 py-1 rounded bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 text-[10px] font-mono flex items-center gap-1 transition cursor-pointer"
                >
                  {copiedItem === 'log-path' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedItem === 'log-path' ? 'کپی شد' : 'کپی آدرس فایل لاگ'}</span>
                </button>
              </div>

              <div className="font-mono text-[11px] text-cyan-300 bg-slate-900/90 p-2 rounded border border-slate-800 break-all select-all dir-ltr text-left">
                %LOCALAPPDATA%\Programs\MGasInventory\MGas_Execution_Log.txt
              </div>

              <div className="text-[10px] text-slate-400">
                (مسیر کامل: <span className="font-mono text-slate-300">C:\Users\&lt;نام_کاربر&gt;\AppData\Local\Programs\MGasInventory\MGas_Execution_Log.txt</span>)
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1.5 text-[11px]">
              <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Play className="w-3.5 h-3.5 text-emerald-400" />
                <span>دستورالعمل نحوه باز کردن سریع لاگ با نوت‌پد:</span>
              </div>
              <div className="space-y-1 text-slate-300 text-[11px]">
                <div>1. کلیدهای <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-mono text-[10px]">Windows + R</kbd> را فشار دهید تا کادر Run باز شود.</div>
                <div className="flex items-center gap-2">
                  <span>2. دستور روبرو را وارد کرده و اینتر بزنید:</span>
                  <code className="bg-black/50 px-2 py-0.5 rounded text-cyan-300 font-mono text-[10px]">notepad %LOCALAPPDATA%\Programs\MGasInventory\MGas_Execution_Log.txt</code>
                  <button
                    onClick={() => copyToClipboard('notepad %LOCALAPPDATA%\\Programs\\MGasInventory\\MGas_Execution_Log.txt', 'notepad-cmd')}
                    className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition"
                    title="کپی دستور"
                  >
                    {copiedItem === 'notepad-cmd' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
                <div>3. یا روی میانبر <span className="text-white font-bold">«مشاهده لاگ انبارداری ام گاز»</span> که پس از نصب روی دسکتاپ ایجاد شده دوبار کلیک نمایید.</div>
              </div>
            </div>
          </div>

          {/* 4 Main Causes of Win11 Setup Failures */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>4 دلیل اصلی عدم نصب یا باز نشدن نصاب در ویندوز 11 و راه‌حل تضمینی</span>
            </h4>

            {/* Item 1: SmartScreen */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-400 flex items-center gap-1.5 text-xs">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>علت 1: مسدود شدن توسط Windows Defender SmartScreen</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800 text-amber-300">
                  رایج‌ترین علت
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                ویندوز 11 برنامه‌های جدیدی که گواهی دیجیتال گران‌قیمت شرکتی ندارند را موقتاً با پیام آبی رنگ "Windows protected your PC" متوقف می‌کند.
              </p>
              <div className="p-2 rounded-lg bg-slate-900/80 text-[11px] text-slate-300 space-y-1 border border-slate-800">
                <div className="font-semibold text-slate-200">روش رفع مسدودی (Unblock):</div>
                <div>1. روی فایل <span className="font-mono text-cyan-300">Office-Windows11-Setup.exe</span> کلیک راست کرده و <b>Properties</b> را بزنید.</div>
                <div>2. در پایین زبانه General، تیک گزینه <b>Unblock</b> را فعال کرده و <b>OK</b> را بزنید.</div>
                <div>3. یا در صورت نمایش پیام آبی رنگ، روی <b>More info</b> کلیک کرده و سپس دکمه <b>Run anyway</b> را بزنید.</div>
              </div>
            </div>

            {/* Item 2: Run as Administrator */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-400 flex items-center gap-1.5 text-xs">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>علت 2: نیاز به دسترسی ادمین جهت ساخت پوشه ریشه C:\OfficeManagement</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950/60 border border-blue-800 text-blue-300">
                  مجوزهای درایو C
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                ویندوز 11 به کاربران عادی اجازه ایجاد فایل در ریشه درایو C را نمی‌دهد. نصاب باید حتماً با دسترسی مدیر اجرا شود.
              </p>
              <div className="p-2 rounded-lg bg-slate-900/80 text-[11px] text-slate-300 border border-slate-800">
                روی فایل نصاب کلیک راست کرده و گزینه <b className="text-cyan-300">Run as administrator</b> را انتخاب نمایید. نصاب به طور خودکار با دستور <code className="text-amber-300">icacls</code> دسترسی کامل نوشتن را برای کاربران عادی نیز فعال می‌کند تا در زمان اجرا مشکلی پیش نیاید.
              </div>
            </div>

            {/* Item 3: VC++ Redistributable */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-purple-400 flex items-center gap-1.5 text-xs">
                  <FolderCog className="w-3.5 h-3.5" />
                  <span>علت 3: عدم وجود پیش‌نیاز ران‌تایم Microsoft Visual C++ 2015-2022</span>
                </span>
                <a
                  href="https://aka.ms/vs/17/release/vc_redist.x64.exe"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-purple-300 hover:text-purple-200 flex items-center gap-1 hover:underline"
                >
                  <span>دانلود پکیج رسمی مایکروسافت</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-[11px] text-slate-300">
                موتور SQLite و کتابخانه‌های دسکتاپ نیازمند فایل‌های VCRUNTIME140.dll هستند. در صورت عدم وجود، برنامه به محض باز شدن بسته می‌شود.
              </p>
            </div>

            {/* Item 4: Background process lock */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="font-bold text-rose-400 flex items-center gap-1.5 text-xs">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>علت 4: باز ماندن پروسه قبلی در پس‌زمینه (Single Instance Lock)</span>
              </span>
              <p className="text-[11px] text-slate-300">
                جهت جلوگیری از آسیب به پایگاه داده آفلاین، فقط یک نسخه هم‌زمان اجازه اجرا دارد. اگر پروسه‌ای گیر کرده باشد:
              </p>
              <div className="p-2 rounded-lg bg-slate-900/80 text-[11px] text-slate-300 border border-slate-800">
                کلیدهای <b className="text-cyan-300">Ctrl + Shift + Esc</b> را فشار داده، در تب Processes پروسه <b>Office</b> یا <b>Electron</b> را پیدا و <b>End Task</b> کنید.
              </div>
            </div>
          </div>

          {/* Diagnostic Runner Script */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-400 flex items-center gap-1.5 text-xs">
                <Play className="w-3.5 h-3.5" />
                <span>ابزار اجرای تشخیصی با گزارش زنده (Run-Office-Diagnose.bat)</span>
              </span>
              <a
                href="/Diagnose-Win11-MGas.bat"
                download="Run-Office-Diagnose.bat"
                onClick={(e) => triggerFileDownload('/Diagnose-Win11-MGas.bat', 'Run-Office-Diagnose.bat', e)}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 hover:underline font-bold cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>دانلود اسکریپت تشخیصی (.bat)</span>
              </a>
            </div>
            <p className="text-[11px] text-slate-300">
              این فایل در پوشه نصب برنامه قرار دارد. با دابل کلیک روی آن، لاگ کامل بوت‌آپ در فایل متنی ذخیره شده و پنجره کنسول باز می‌ماند تا خطای دقیق را به شما نشان دهد.
            </p>
          </div>

          {/* Useful PowerShell / CMD Commands */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="font-bold text-slate-200 flex items-center gap-1.5 text-xs">
              <Terminal className="w-3.5 h-3.5 text-blue-400" />
              <span>دستورات سریع PowerShell برای عیب‌یابی:</span>
            </div>

            <div className="space-y-2 text-[11px] font-mono">
              <div className="flex items-center justify-between bg-slate-900 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-300 select-all overflow-x-auto">
                  icacls "C:\OfficeManagement" /grant Users:(OI)(CI)F /T
                </span>
                <button
                  onClick={() => copyToClipboard('icacls "C:\\OfficeManagement" /grant Users:(OI)(CI)F /T', 'icacls')}
                  className="p-1 rounded text-slate-400 hover:text-white transition cursor-pointer ml-2"
                  title="کپی دستور"
                >
                  {copiedItem === 'icacls' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex items-center justify-between bg-slate-900 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-300 select-all overflow-x-auto">
                  Get-Content "C:\OfficeManagement\Office-Execution-Log.txt" -Tail 30
                </span>
                <button
                  onClick={() => copyToClipboard('Get-Content "C:\\OfficeManagement\\Office-Execution-Log.txt" -Tail 30', 'getcontent')}
                  className="p-1 rounded text-slate-400 hover:text-white transition cursor-pointer ml-2"
                  title="کپی دستور"
                >
                  {copiedItem === 'getcontent' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <a
              href="/troubleshooting_win11.txt"
              download="M-Gas-Troubleshooting-Win11.txt"
              onClick={(e) => triggerFileDownload('/troubleshooting_win11.txt', 'M-Gas-Troubleshooting-Win11.txt', e)}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1.5 hover:underline font-bold cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>دانلود راهنمای متنی (.txt)</span>
            </a>

            <a
              href="/Diagnose-Win11-MGas.bat"
              download="Run-Office-Diagnose.bat"
              onClick={(e) => triggerFileDownload('/Diagnose-Win11-MGas.bat', 'Run-Office-Diagnose.bat', e)}
              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 hover:underline font-bold cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>اسکریپت عیب‌یاب (.bat)</span>
            </a>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow transition cursor-pointer"
          >
            متوجه شدم
          </button>
        </div>
      </div>
    </div>
  );
};
