import React, { useState, useEffect } from 'react';
import { triggerFileDownload } from '../utils/file-download';
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileText,
  HelpCircle,
  HardDrive,
  ShieldCheck,
  Terminal,
  X,
  ExternalLink,
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';

interface Windows7TroubleshootingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Windows7TroubleshootingModal: React.FC<Windows7TroubleshootingModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'checklist' | 'sudden_exit' | 'logs'>('checklist');
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
    sha2: false,
    vcredist: false,
    dotnet: false,
    admin: false,
    unblock: false,
    taskmgr: false,
    sp1: false
  });
  const [bootLogs, setBootLogs] = useState<string[]>([]);
  const [logPaths, setLogPaths] = useState<string[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [copiedLog, setCopiedLog] = useState(false);

  const isDesktop = typeof window !== 'undefined' && !!window.desktopAPI?.isDesktop;

  useEffect(() => {
    if (isOpen && isDesktop && activeTab === 'logs') {
      fetchDesktopLogs();
    }
  }, [isOpen, isDesktop, activeTab]);

  const fetchDesktopLogs = async () => {
    if (!window.desktopAPI?.getBootLogs) return;
    setIsLoadingLogs(true);
    try {
      const logs = await window.desktopAPI.getBootLogs();
      const paths = (await window.desktopAPI.getLogPaths?.()) || [];
      setBootLogs(logs || []);
      setLogPaths(paths || []);
    } catch (e) {
      console.error('Failed to get boot logs', e);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const handleOpenInNotepad = async () => {
    if (window.desktopAPI?.openLogInNotepad) {
      try {
        await window.desktopAPI.openLogInNotepad();
      } catch (e) {
        console.error('Failed to open notepad', e);
      }
    }
  };

  const toggleCheck = (id: string) => {
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyLogs = () => {
    if (bootLogs.length > 0) {
      navigator.clipboard.writeText(bootLogs.join('\n'));
      setCopiedLog(true);
      setTimeout(() => setCopiedLog(false), 2000);
    }
  };

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
      className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 cursor-pointer"
      onClick={() => onClose()}
    >
      <div
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] cursor-default text-slate-200"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">راهنمای عیب‌یابی، رفع خطای اجرا و چک‌لیست پیش‌نیازهای ویندوز 7</h3>
              <p className="text-[11px] text-slate-400">حل مشکل بسته شدن ناگهانی نصاب پس از تأیید هشدار ویندوز و بررسی لاگ‌های بوت</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="بستن"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-4 pt-2 gap-2 text-xs">
          <button
            onClick={() => setActiveTab('checklist')}
            className={`pb-2.5 px-3 font-medium transition flex items-center gap-1.5 border-b-2 ${
              activeTab === 'checklist'
                ? 'border-amber-400 text-amber-300 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>چک‌لیست پیش‌نیازها و گواهی‌ها</span>
          </button>
          <button
            onClick={() => setActiveTab('sudden_exit')}
            className={`pb-2.5 px-3 font-medium transition flex items-center gap-1.5 border-b-2 ${
              activeTab === 'sudden_exit'
                ? 'border-amber-400 text-amber-300 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>علت بسته شدن ناگهانی بعد از هشدار</span>
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`pb-2.5 px-3 font-medium transition flex items-center gap-1.5 border-b-2 ${
              activeTab === 'logs'
                ? 'border-amber-400 text-amber-300 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>گزارش خطای محیط اجرا (Boot Logger)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs leading-relaxed max-h-[calc(92vh-130px)]">

          {/* TAB 1: PREREQUISITES CHECKLIST */}
          {activeTab === 'checklist' && (
            <div className="space-y-3.5">
              <div className="p-3 bg-amber-950/20 border border-amber-800/40 rounded-xl flex items-start gap-2.5 text-amber-200/90 text-[11px]">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  ویندوز 7 به صورت پیش‌فرض فاقد پشتیبانی از امضای امنیتی مدرن SHA-2 است. اگر فایل نصبی بلافاصله پس از تأیید بسته می‌شود، 90% مواقع به دلیل عدم نصب پچ KB4474419 یا فقدان کتابخانه‌های Visual C++ است.
                </span>
              </div>

              <div className="space-y-2.5">
                {/* Item 1 */}
                <div
                  onClick={() => toggleCheck('sha2')}
                  className={`p-3.5 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
                    checkedItems.sha2
                      ? 'bg-emerald-950/20 border-emerald-800/60'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center shrink-0 border ${
                    checkedItems.sha2 ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-bold' : 'border-slate-600 bg-slate-900'
                  }`}>
                    {checkedItems.sha2 && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <div className="space-y-1">
                    <div className="font-bold text-white flex items-center gap-2">
                      <span>1. پچ رسمی مایکروسافت KB4474419 (پشتیبانی از امضای کدهای SHA-2)</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-800/60">بسیار حیاتی</span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      ویندوز 7 بدون این آپدیت قادر به باز کردن و اعتبارسنجی پکیج‌های فشرده مدرن نیست و پردازش نصاب را متوقف می‌کند.
                    </p>
                    <div className="text-[10px] text-amber-300/80 font-mono">
                      نام فایل رسمی: Windows6.1-KB4474419-v4-x64.msu (سپس ریستارت رایانه)
                    </div>
                  </div>
                </div>

                {/* Item 2 */}
                <div
                  onClick={() => toggleCheck('vcredist')}
                  className={`p-3.5 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
                    checkedItems.vcredist
                      ? 'bg-emerald-950/20 border-emerald-800/60'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center shrink-0 border ${
                    checkedItems.vcredist ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-bold' : 'border-slate-600 bg-slate-900'
                  }`}>
                    {checkedItems.vcredist && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <div className="space-y-1">
                    <div className="font-bold text-white flex items-center gap-2">
                      <span>2. بسته Microsoft Visual C++ Redistributable 2015-2022</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800/60">ضروری برای SQLite</span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      موتور Node.js و کتابخانه‌های باینری برای اجرا نیازمند Universal C Runtime (مانند vcruntime140.dll و api-ms-win-crt-runtime) هستند.
                    </p>
                    <div className="text-[10px] text-amber-300/80 font-mono">
                      فایل رسمی: vc_redist.x64.exe (نسخه 64 بیت) یا vc_redist.x86.exe
                    </div>
                  </div>
                </div>

                {/* Item 3 */}
                <div
                  onClick={() => toggleCheck('dotnet')}
                  className={`p-3.5 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
                    checkedItems.dotnet
                      ? 'bg-emerald-950/20 border-emerald-800/60'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center shrink-0 border ${
                    checkedItems.dotnet ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-bold' : 'border-slate-600 bg-slate-900'
                  }`}>
                    {checkedItems.dotnet && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <div className="space-y-1">
                    <div className="font-bold text-white">3. نصب بودن مایکروسافت دات‌نت فریم‌ورک (.NET Framework 4.5.2 یا 4.8)</div>
                    <p className="text-[11px] text-slate-300">
                      جهت عملکرد صحیح مدیریت سرویس‌ها و ابزارهای فرعی سیستم‌عامل ویندوز 7.
                    </p>
                  </div>
                </div>

                {/* Item 4 */}
                <div
                  onClick={() => toggleCheck('admin')}
                  className={`p-3.5 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
                    checkedItems.admin
                      ? 'bg-emerald-950/20 border-emerald-800/60'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center shrink-0 border ${
                    checkedItems.admin ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-bold' : 'border-slate-600 bg-slate-900'
                  }`}>
                    {checkedItems.admin && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <div className="space-y-1">
                    <div className="font-bold text-white">4. اجرای نصاب با کلیک راست و «Run as Administrator»</div>
                    <p className="text-[11px] text-slate-300">
                      دابل کلیک معمولی در اکانت‌های استاندارد ویندوز 7 ممکن است بدون نمایش خطا متوقف شود. همواره روی فایل Setup کلیک راست کرده و Run as administrator را انتخاب کنید.
                    </p>
                  </div>
                </div>

                {/* Item 5 */}
                <div
                  onClick={() => toggleCheck('unblock')}
                  className={`p-3.5 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
                    checkedItems.unblock
                      ? 'bg-emerald-950/20 border-emerald-800/60'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center shrink-0 border ${
                    checkedItems.unblock ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-bold' : 'border-slate-600 bg-slate-900'
                  }`}>
                    {checkedItems.unblock && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <div className="space-y-1">
                    <div className="font-bold text-white">5. برداشتن تیک قفل امنیتی فایل (Unblock File)</div>
                    <p className="text-[11px] text-slate-300">
                      روی فایل Warehouse-Windows7-Setup.exe کلیک راست کنید، Properties را بزنید و در پایین زبانه General، در صورت وجود گزینه Unblock، تیک آن را بزنید و دکمه OK را فشار دهید.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SUDDEN EXIT RESOLUTION */}
          {activeTab === 'sudden_exit' && (
            <div className="space-y-4">
              <div className="p-3 bg-rose-950/20 border border-rose-800/40 rounded-xl space-y-1 text-rose-200 text-[11px]">
                <div className="font-bold text-rose-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  <span>بررسی علل 4 گانه بسته شدن آنی پس از تأیید هشدار ویندوز (SmartScreen / UAC):</span>
                </div>
                <p className="text-slate-300">
                  اگر کاربر در پنجره هشدار ویندوز روی Yes یا Run anyway کلیک می‌کند اما هیچ پنجره‌ای باز نمی‌شود، یکی از 4 سناریوی زیر رخ داده است:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Case 1: Zombie process */}
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="font-bold text-amber-400 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-[10px]">1</span>
                    <span>پروسه قبلی در تسک منیجر قفل شده</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    برای حفاظت از فایل SQLite و جلوگیری از خرابی اطلاعات، سیستم مجهز به قفل تک‌نسخه‌ای است. اگر پروسه قبلی باز مانده باشد، پنجره جدید باز نمی‌شود.
                  </p>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400">
                    <strong>راه‌حل:</strong> فشردن کلیدهای <kbd className="bg-slate-800 px-1 py-0.5 rounded text-amber-300">Ctrl+Shift+Esc</kbd>، پیدا کردن پروسه <code className="text-cyan-300">Warehouse.exe</code> و زدن دکمه <strong>End Process</strong>.
                  </div>
                </div>

                {/* Case 2: GPU Crash */}
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="font-bold text-cyan-400 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-[10px]">2</span>
                    <span>کرش شتاب‌دهنده گرافیکی (GPU)</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    درایور کارت گرافیک ویندوز 7 در رندرینگ سخت‌افزاری کرومیوم دچار خطا می‌شود و پروسه رندر را خاتمه می‌دهد.
                  </p>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400">
                    <strong>راه‌حل تعبیه شده:</strong> در نسخه جدید، سوئیچ‌های خودکار <code className="text-cyan-300">--disable-gpu</code> و غیرفعال‌سازی رندرینگ سخت‌افزاری در هسته اضافه شده است.
                  </div>
                </div>

                {/* Case 3: Missing CRT */}
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="font-bold text-purple-400 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center text-[10px]">3</span>
                    <span>خطای خاموش فقدان DLL های سیستمی</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    اگر Visual C++ نصب نباشد، ویندوز بدون نمایش هیچ پیامی، به صورت سایلنت پروسه نصاب را Terminate می‌کند.
                  </p>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400">
                    <strong>راه‌حل:</strong> نصب بسته ویژوال سی پلاس‌پلاس 2015-2022 (فایل vc_redist.x64.exe).
                  </div>
                </div>

                {/* Case 4: Antivirus Scan Delay */}
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-[10px]">4</span>
                    <span>اسکن عمیق آنتی‌ویروس یا Windows Defender</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    آنتی‌ویروس‌ها آرشیوهای فشرده با پسوند 7z درون NSIS را اسکن می‌کنند و تا زمان اتمام آن پروسه را در حالت تعلیق نگه می‌دارند.
                  </p>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400">
                    <strong>راه‌حل:</strong> افزودن فایل نصبی و مسیر <code className="text-cyan-300">C:\WarehouseManagement</code> به لیست مجاز (Exclusions) آنتی‌ویروس.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: RUNTIME ERROR LOGGER */}
          {activeTab === 'logs' && (
            <div className="space-y-3.5">
              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-cyan-400 text-xs flex items-center gap-1.5">
                    <Terminal className="w-4 h-4" />
                    ابزار گزارش‌دهی خطای محیط اجرا (Runtime Boot Logger)
                  </span>
                  <div className="flex items-center gap-2">
                    {isDesktop && (
                      <button
                        onClick={handleOpenInNotepad}
                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700 text-[11px] flex items-center gap-1 transition cursor-pointer font-bold"
                      >
                        <FileText className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        <span>باز کردن در Notepad ویندوز</span>
                      </button>
                    )}
                    {isDesktop && (
                      <button
                        onClick={fetchDesktopLogs}
                        disabled={isLoadingLogs}
                        className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:border-slate-700 text-[11px] disabled:opacity-50 cursor-pointer"
                        title="بروزرسانی لاگ‌ها"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLogs ? 'animate-spin' : ''}`} />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">
                  این ابزار قبل از بارگذاری رابط گرافیکی فعال شده و رخدادها، فلگ‌های GPU، دسترسی‌های دایرکتوری و خطاهای احتمالی را به طور همزمان در چندین فایل متنی ذخیره می‌کند.
                </p>
              </div>

              {/* Log File Locations */}
              <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 space-y-1.5 text-[11px]">
                <span className="font-bold text-slate-300">محل فایل‌های لاگ روی رایانه مقصد (ویندوز 7 و 10/11):</span>
                <ul className="space-y-1 font-mono text-[10px] text-amber-300/90 list-disc list-inside">
                  <li>مسیر اصلی: C:\WarehouseManagement\runtime-boot.log</li>
                  <li>پوشه موقت ویندوز: %TEMP%\mgas-inventory-boot.log (با زدن Win+R و نوشتن %temp%)</li>
                  <li>پوشه داده‌های برنامه: %APPDATA%\MGAS-Inventory\runtime-boot.log</li>
                </ul>
              </div>

              {/* Live Logs Viewer or Sample */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>{isDesktop ? 'لاگ‌های زنده دریافت شده از هسته دسکتاپ:' : 'نمونه ساختار لاگ‌های ثبت شونده در فایل runtime-boot.log:'}</span>
                  <button
                    onClick={handleCopyLogs}
                    className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    {copiedLog ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedLog ? 'کپی شد' : 'کپی کردن لاگ‌ها'}</span>
                  </button>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-[10.5px] text-slate-300 overflow-x-auto max-h-52 overflow-y-auto space-y-1 dir-ltr text-left">
                  {bootLogs.length > 0 ? (
                    bootLogs.map((line, idx) => (
                      <div
                        key={idx}
                        className={
                          line.includes('[ERROR]') || line.includes('[FATAL]')
                            ? 'text-rose-400 font-bold'
                            : line.includes('[WARN]')
                            ? 'text-amber-300'
                            : line.includes('[INIT]') || line.includes('[BOOT]')
                            ? 'text-cyan-300'
                            : 'text-slate-300'
                        }
                      >
                        {line}
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="text-slate-500">=== BOOT SESSION: 2026-09-19T12:30:00.000Z ===</div>
                      <div className="text-cyan-300">[INFO] [BOOT] electron-main.cjs loaded. Commencing early initialization.</div>
                      <div className="text-cyan-300">[INFO] [SYSTEM] OS: Windows_NT 6.1.7601 (x64) | Platform: win32</div>
                      <div className="text-amber-300">[WARN] [COMPATIBILITY] WINDOWS 7 DETECTED (NT 6.1)! Applying special legacy flags.</div>
                      <div className="text-amber-300">[WARN] [GPU_CONFIG] Disabling hardware GPU acceleration for crash prevention.</div>
                      <div className="text-slate-300">[INFO] [SQLITE_MODULE] sqlite-manager.cjs loaded successfully</div>
                      <div className="text-slate-300">[INFO] [ROLE_CONFIG] App Role: WAREHOUSE_WIN7 | Device: WAREHOUSE-PC-001</div>
                      <div className="text-slate-300">[INFO] [PERMISSIONS] Root directory verified as writable: C:\WarehouseManagement</div>
                      <div className="text-emerald-400">[INFO] [SQLITE_INIT] SQLite database initialized successfully at: C:\WarehouseManagement\warehouse.db</div>
                      <div className="text-emerald-400">[INFO] [APP_READY] app.whenReady resolved. Launching window.</div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-950/70">
          <a
            href="/troubleshooting_win7.txt"
            download="M-Gas-Troubleshooting-Win7.txt"
            onClick={(e) => triggerFileDownload('/troubleshooting_win7.txt', 'M-Gas-Troubleshooting-Win7.txt', e)}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>دانلود فایل متنی راهنمای جامع عیب‌یابی (.txt)</span>
          </a>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:border-slate-700 font-bold text-xs transition cursor-pointer"
            >
              متوجه شدم و بستن
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
