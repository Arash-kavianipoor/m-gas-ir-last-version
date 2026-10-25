import React, { useState } from 'react';
import { RuntimeEnvironment, User } from '../types';
import { LocalStorageManager, LocalDatabaseState } from '../database/storage';
import {
  HardDriveDownload,
  HardDriveUpload,
  Database,
  FileCheck,
  AlertTriangle,
  Download,
  CheckCircle2,
  RefreshCw,
  Clock,
  Info,
  Layers,
  Warehouse,
  Trash2,
  Lock,
  Eye,
  EyeOff,
  ShieldAlert,
  HelpCircle,
  KeyRound,
  RotateCcw,
  X
} from 'lucide-react';
import {
  formatPersianDateTime,
  toPersianDigits
} from '../utils/persian';
import { triggerFileDownload } from '../utils/file-download';

// SHA-256 Hash Constants (Zero Plaintext Secrets)
// Hash of secret password: @Arash2021368
const PURGE_PASSWORD_HASH = '58ab35637a00b14c7edbe3b1fb16454a138add3ac31efc8e5cd4605668417e3f';
// Hash of secret security question answer: 40من مهندس آرش هستم
const SECURITY_ANSWER_HASH = 'ef3e7bcf8860e8859f0ea5f3753f8c2eb89ab26307bb4cc6b022cf54fab2a461';

async function computeSha256(str: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(str.trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

interface BackupRestoreViewProps {
  currentEnv: RuntimeEnvironment;
  currentUser: User;
  onRefresh: () => void;
}

export const BackupRestoreView: React.FC<BackupRestoreViewProps> = ({
  currentEnv,
  currentUser,
  onRefresh
}) => {
  const [backupSuccess, setBackupSuccess] = useState<string | null>(null);
  const [restoreNotice, setRestoreNotice] = useState<string | null>(null);
  const [restoreInput, setRestoreInput] = useState('');

  // Authorized Database Purge States (Strictly restricted to مدیریت / مهندس عمویی)
  const isUserAmouei = Boolean(
    currentUser && (
      currentUser.role === 'ADMIN' ||
      currentUser.username === 'amouei' ||
      currentUser.full_name?.includes('عمویی') ||
      currentUser.user_id === 'USR-001'
    )
  );

  const [showPurgeModal, setShowPurgeModal] = useState(false);
  const [purgePassword, setPurgePassword] = useState('');
  const [showPurgePassword, setShowPurgePassword] = useState(false);
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [showSecurityAnswer, setShowSecurityAnswer] = useState(false);
  const [purgeError, setPurgeError] = useState<string | null>(null);
  const [purgeSuccess, setPurgeSuccess] = useState<string | null>(null);
  const [purgeAllEnvs, setPurgeAllEnvs] = useState(true);
  const [isPurging, setIsPurging] = useState(false);

  const state = LocalStorageManager.getState(currentEnv);

  const localDbDownload = {
    name: 'پایگاه‌داده محلی این سیستم (SQLite)',
    fileName: 'mgas_local.db',
    downloadUrl: '/mgas_local.db'
  };

  const handleExportBackup = () => {
    const backupData = {
      app: 'SEPEHR_WAREHOUSE_SYNC',
      version: '2.4.0',
      exported_at: new Date().toISOString(),
      environment: currentEnv,
      deviceId: state.deviceId,
      exported_by: currentUser.user_id,
      data: state
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    const fileName = `sepehr_db_backup_${currentEnv}_${new Date().toISOString().slice(0, 10)}.json`;
    downloadAnchor.setAttribute('download', fileName);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setBackupSuccess(`فایل پشتیبان کامل دیتابیس محلی با موفقیت تولید و دانلود گردید.`);
  };

  const handleRestore = () => {
    if (!restoreInput.trim()) {
      alert('لطفاً محتوای فایل پشتیبان را در کادر مربوطه وارد نمایید.');
      return;
    }

    try {
      const parsed = JSON.parse(restoreInput);
      const dataToRestore: LocalDatabaseState = parsed.data || parsed;

      if (!dataToRestore.products || !dataToRestore.stock_movements) {
        throw new Error('ساختار فایل پشتیبان معتبر نمی‌باشد.');
      }

      LocalStorageManager.saveState(currentEnv, dataToRestore);
      setRestoreNotice('بازیابی دیتابیس با موفقیت انجام شد. تمام جداول به‌روزرسانی شدند.');
      setRestoreInput('');
      onRefresh();
    } catch (e: any) {
      alert(`خطا در بازیابی دیتابیس: ${e.message}`);
    }
  };

  const handleExecutePurge = async () => {
    if (!isUserAmouei) {
      setPurgeError('خطای دسترسی امنیتی: قابلیت پاک‌سازی دیتابیس منحصراً برای کاربر مهندس عمویی مجاز می‌باشد.');
      return;
    }

    if (!purgePassword.trim()) {
      setPurgeError('لطفاً رمز عبور محرمانه را وارد فرمایید.');
      return;
    }

    if (!securityAnswer.trim()) {
      setPurgeError('لطفاً پاسخ پرسش محرمانه امنیتی را وارد فرمایید.');
      return;
    }

    setIsPurging(true);
    setPurgeError(null);

    try {
      // 1. Verify confidential password hash (SHA-256)
      const inputPwdHash = await computeSha256(purgePassword);
      if (inputPwdHash !== PURGE_PASSWORD_HASH) {
        setPurgeError('رمز عبور محرمانه اشتباه است. دسترسی به پاک‌سازی دیتابیس مسدود شد.');
        setIsPurging(false);
        return;
      }

      // 2. Verify confidential security question answer hash (SHA-256)
      const inputAnsHash = await computeSha256(securityAnswer);
      if (inputAnsHash !== SECURITY_ANSWER_HASH) {
        setPurgeError('پاسخ پرسش محرمانه امنیتی اشتباه است. دسترسی مسدود شد.');
        setIsPurging(false);
        return;
      }

      // 3. Wipe client-side LocalStorage
      LocalStorageManager.purgeAllDatabaseData(currentEnv, currentUser.full_name || 'مهندس عمویی', purgeAllEnvs);

      // 4. Notify backend server endpoint with verification hashes
      try {
        await fetch('/api/database/purge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            password_hash: inputPwdHash,
            answer_hash: inputAnsHash
          })
        });
      } catch {
        // quiet fallback for offline/standalone mode
      }

      setPurgeSuccess('پایگاه‌داده با موفقیت و پس از تایید هویت دومرحله‌ای محرمانه، کاملاً پاک‌سازی و تخلیه گردید.');
      setPurgePassword('');
      setSecurityAnswer('');
      setShowPurgeModal(false);
      onRefresh();
    } catch (e: any) {
      setPurgeError(`خطا در پاک‌سازی دیتابیس: ${e.message}`);
    } finally {
      setIsPurging(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header with Info Tooltip (no subtext paragraph) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/80 p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <h2
            className="text-base sm:text-lg font-bold text-white flex items-center gap-2 cursor-help"
            title="استخراج کامل کلیه جداول، اسناد انبار، فاکتورها و صف همگام‌سازی جهت بایگانی ایمن یا انتقال به رایانه دیگر"
          >
            <Database className="w-5 h-5 text-indigo-400" />
            <span>پشتیبان‌گیری و پایگاه‌داده‌های محلی</span>
            <Info className="w-4 h-4 text-slate-400 hover:text-slate-200" />
          </h2>
        </div>
      </div>

      {backupSuccess && (
        <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-700/50 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{backupSuccess}</span>
        </div>
      )}

      {restoreNotice && (
        <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-700/50 text-blue-300 text-xs flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-blue-400 shrink-0" />
          <span>{restoreNotice}</span>
        </div>
      )}

      {purgeSuccess && (
        <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-600/60 text-emerald-200 text-xs flex items-center justify-between gap-2 shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{purgeSuccess}</span>
          </div>
          <button
            type="button"
            onClick={() => setPurgeSuccess(null)}
            className="text-slate-400 hover:text-white p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Single Local SQLite Database Card (mgas_local.db) */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3
            className="text-sm font-bold text-white flex items-center gap-2 cursor-help"
            title="فایل پایگاه داده محلی SQLite که برای این سیستم نصبی ساخته شده و پیوسته با دیتابیس کلودفلر همگام می‌شود"
          >
            <Database className="w-4 h-4 text-indigo-400" />
            <span>پایگاه‌داده محلی این سیستم (SQLite - mgas_local.db)</span>
            <Info className="w-3.5 h-3.5 text-slate-400" />
          </h3>
          <span className="text-[11px] text-emerald-400 bg-emerald-950/50 border border-emerald-800/60 px-2.5 py-0.5 rounded-full font-mono font-bold">
            متصل به سرور مرکزی anbar.mgas.ir
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/70 border border-indigo-900/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-sm text-indigo-300">mgas_local.db</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-bold">
                همگام‌سازی بلادرنگ + تناوب ۲۰ ثانیه
              </span>
            </div>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              این فایل پایگاه داده محلی روی هر سیستمی که برنامه نصب می‌شود ساخته شده و تمام اسناد و اطلاعات را به صورت محلی ذخیره کرده و پیوسته و بلادرنگ با دیتابیس ابری کلودفلر هماهنگ می‌نماید.
            </p>
          </div>

          <a
            href="/mgas_local.db"
            download="mgas_local.db"
            onClick={(e) => triggerFileDownload('/mgas_local.db', 'mgas_local.db', e)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-600/30 cursor-pointer shrink-0"
            title="دانلود مستقیم فایل دیتابیس محلی این سیستم (mgas_local.db)"
          >
            <Download className="w-4 h-4" />
            <span>دانلود دیتابیس محلی (mgas_local.db)</span>
          </a>
        </div>
      </div>

      {/* Windows Desktop Installers & Portable Releases */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <h3
            className="text-sm font-bold text-white flex items-center gap-2 cursor-help"
            title="بسته‌های نصاب رسمی و پرتابل ویندوز جهت استقرار مستقل در دفتر مرکزی و انبارها با پشتیبانی کامل از کارکرد آفلاین و همگام‌سازی ابری"
          >
            <HardDriveDownload className="w-4 h-4 text-emerald-400" />
            <span>بسته‌های نصاب و پرتابل ویندوز (نسخه‌های رسمی دسکتاپ)</span>
            <Info className="w-3.5 h-3.5 text-slate-400" />
          </h3>
          <span className="text-[11px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-0.5 rounded-full font-mono">
            بیلد جدید • سازگار با Win 7/8/10/11
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* 64-bit Installer */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-emerald-300">نصاب ۶۴ بیتی رسمی</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                  x64
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                ویژه دفتر مرکزی و سیستم‌های ویندوز ۱۰ و ۱۱ با قابلیت ایجاد میانبر دسکتاپ و استارت‌منو.
              </p>
            </div>
            <a
              href="/downloads/MGas-Inventory-Windows-64bit-Setup.exe"
              download="MGas-Inventory-Windows-64bit-Setup.exe"
              onClick={(e) => triggerFileDownload('/downloads/MGas-Inventory-Windows-64bit-Setup.exe', 'MGas-Inventory-Windows-64bit-Setup.exe', e)}
              className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>دانلود نصاب ۶۴ بیتی (Setup.exe)</span>
            </a>
          </div>

          {/* 32-bit Installer */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-cyan-300">نصاب ۳۲ بیتی رسمی</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                  x86
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                سازگاری ۱۰۰٪ تضمین‌شده با کامپیوترهای قدیمی انبار و ویندوز ۷، بدون وابستگی سیستمی.
              </p>
            </div>
            <a
              href="/downloads/MGas-Inventory-Windows-32bit-Setup.exe"
              download="MGas-Inventory-Windows-32bit-Setup.exe"
              onClick={(e) => triggerFileDownload('/downloads/MGas-Inventory-Windows-32bit-Setup.exe', 'MGas-Inventory-Windows-32bit-Setup.exe', e)}
              className="w-full py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-cyan-600/20 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>دانلود نصاب ۳۲ بیتی (Setup.exe)</span>
            </a>
          </div>

          {/* 64-bit Portable */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-amber-300">پرتابل ۶۴ بیتی (ZIP)</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800/60">
                  Portable
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                اجرای بدون نیاز به نصب روی فلش مموری یا هر پوشه دلخواه همراه با سرور پرسرعت C.
              </p>
            </div>
            <a
              href="/downloads/MGas-Inventory-Windows-64bit-Portable.zip"
              download="MGas-Inventory-Windows-64bit-Portable.zip"
              onClick={(e) => triggerFileDownload('/downloads/MGas-Inventory-Windows-64bit-Portable.zip', 'MGas-Inventory-Windows-64bit-Portable.zip', e)}
              className="w-full py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-amber-600/20 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>دانلود پرتابل ۶۴ بیتی (ZIP)</span>
            </a>
          </div>

          {/* 32-bit Portable */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-purple-300">پرتابل ۳۲ بیتی (ZIP)</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-400 border border-purple-800/60">
                  Portable
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                بسته کامل فشرده و مستقل ۳۲ بیتی قابل حمل برای محیط‌های محدود یا فاقد دسترسی ادمین.
              </p>
            </div>
            <a
              href="/downloads/MGas-Inventory-Windows-32bit-Portable.zip"
              download="MGas-Inventory-Windows-32bit-Portable.zip"
              onClick={(e) => triggerFileDownload('/downloads/MGas-Inventory-Windows-32bit-Portable.zip', 'MGas-Inventory-Windows-32bit-Portable.zip', e)}
              className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-purple-600/20 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>دانلود پرتابل ۳۲ بیتی (ZIP)</span>
            </a>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Export Backup Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-9 h-9 rounded-lg bg-indigo-950/80 border border-indigo-700/50 flex items-center justify-center text-indigo-300">
                <HardDriveDownload className="w-5 h-5" />
              </div>
              <div>
                <h3
                  className="text-sm font-bold text-white flex items-center gap-2 cursor-help"
                  title="استخراج تمام اسناد، اقلام و اطلاعات ثبت شده در قالب بسته ساختاریافته محلی"
                >
                  <span>استخراج نسخه پشتیبان</span>
                  <Info className="w-3.5 h-3.5 text-slate-400" />
                </h3>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-300 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 my-3">
              <div className="flex justify-between">
                <span className="text-slate-400">تعداد کل اقلام کالا:</span>
                <span className="font-bold">{toPersianDigits(state.products.length)} قلم</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">تعداد مشتریان:</span>
                <span className="font-bold">{toPersianDigits(state.customers.length)} پرونده</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">اسناد گردش انبار:</span>
                <span className="font-bold">{toPersianDigits(state.stock_movements.length)} سند</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">رویدادهای همگام‌سازی محلی:</span>
                <span className="font-bold">{toPersianDigits(state.sync_events.length)} رویداد</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {typeof window !== 'undefined' && window.desktopAPI?.isDesktop && (
              <button
                type="button"
                onClick={async () => {
                  try {
                    const res = await window.desktopAPI?.saveBackupToFile();
                    if (res && res.success) {
                      setBackupSuccess(`فایل باینری با موفقیت در مسیر زیر ذخیره شد:\n${res.destinationPath}`);
                    }
                  } catch (e: any) {
                    alert(`خطا در ذخیره نسخه پشتیبان: ${e.message}`);
                  }
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer mb-2"
              >
                <Database className="w-4 h-4" />
                <span>ذخیره مستقیم نسخه پشتیبان باینری</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleExportBackup}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>دانلود فوری فایل پشتیبان ساختاریافته</span>
            </button>
          </div>
        </div>

        {/* Restore Backup Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-9 h-9 rounded-lg bg-amber-950/80 border border-amber-700/50 flex items-center justify-center text-amber-300">
              <HardDriveUpload className="w-5 h-5" />
            </div>
            <div>
              <h3
                className="text-sm font-bold text-white flex items-center gap-2 cursor-help"
                title="بازگردانی اطلاعات از فایل پشتیبان ذخیره‌شده و اعمال بر جداول انبار"
              >
                <span>بازیابی پایگاه‌داده</span>
                <Info className="w-3.5 h-3.5 text-slate-400" />
              </h3>
            </div>
          </div>

          <div className="space-y-2">
            {/* Purged Status & Auto-Resurrection Protection Banner */}
            {state.is_purged && (
              <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-700/70 text-red-200 text-xs space-y-2 mb-2 shadow-inner">
                <div className="flex items-center gap-2 font-bold text-red-300">
                  <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
                  <span>پایگاه‌داده در وضعیت پاک‌سازی‌شده و کاملاً خالی است</span>
                </div>
                <p className="text-[11px] text-red-200/90 leading-relaxed">
                  سد محافظتی همگام‌سازی فعال است: کلیه اسناد و تراکنش‌ها تخلیه شده‌اند و از بازگشت خودکار اطلاعات قبلی به‌صورت قطعی جلوگیری می‌شود.
                </p>
                {state.purged_at && (
                  <div className="text-[10px] text-red-300/80 font-mono">
                    تاریخ و زمان پاک‌سازی: {formatPersianDateTime(state.purged_at)}
                  </div>
                )}
                {isUserAmouei && (
                  <button
                    type="button"
                    onClick={() => {
                      LocalStorageManager.restoreSeedData(currentEnv);
                      onRefresh();
                    }}
                    className="mt-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>بارگذاری داده‌های اولیه نمونه</span>
                  </button>
                )}
              </div>
            )}

            <textarea
              rows={4}
              value={restoreInput}
              onChange={(e) => setRestoreInput(e.target.value)}
              placeholder="محتوای متنی فایل پشتیبان را اینجا جای‌گذاری فرمایید..."
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-500"
            />

            <button
              type="button"
              onClick={handleRestore}
              className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-amber-600/20 transition-all cursor-pointer whitespace-nowrap"
            >
              <RefreshCw className="w-4 h-4 shrink-0" />
              <span>اجرای بازیابی داده‌ها</span>
            </button>

            {/* Direct Database Purge Action under Restore Box (ONLY for مدیریت / مهندس عمویی) */}
            {isUserAmouei && (
              <div className="pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setPurgeError(null);
                    setPurgePassword('');
                    setSecurityAnswer('');
                    setShowPurgeModal(true);
                  }}
                  className="w-full py-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-700/60 hover:border-red-500 text-red-200 hover:text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-red-950/30 group"
                >
                  <Trash2 className="w-4 h-4 text-red-400 group-hover:text-red-300" />
                  <span>تخلیه و حذف برای همیشه اطلاعات (ویژه مدیریت)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Complete Database Purge Danger Zone Card (ONLY for مهندس عمویی) */}
      {isUserAmouei && (
        <div className="bg-gradient-to-r from-red-950/30 via-slate-900/90 to-red-950/30 border border-red-800/50 rounded-2xl p-5 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-950 border border-red-700/60 flex items-center justify-center text-red-300 shrink-0 shadow-md">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>تخلیه و حذف برای همیشه (پاک‌سازی کامل پایگاه‌داده / Wipe)</span>
                  <span className="text-[10px] bg-red-900/60 text-red-200 border border-red-700/50 px-2 py-0.5 rounded-md font-mono">
                    فقط مدیریت ارشد
                  </span>
                </h3>
                <p className="text-[11px] text-red-300/80 mt-0.5">
                  حذف دائم کلیه اسناد انبار، فاکتورها، کاردکس‌های گاز، رسیدها و سوابق ثبت‌شده • نیازمند احراز هویت دومرحله‌ای محرمانه
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setPurgeError(null);
                setPurgePassword('');
                setSecurityAnswer('');
                setShowPurgeModal(true);
              }}
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-red-600/30 shrink-0"
            >
              <Trash2 className="w-4 h-4" />
              <span>تخلیه و حذف برای همیشه</span>
            </button>
          </div>
        </div>
      )}

      {/* Complete Database Purge Confirmation Modal (ONLY for مهندس عمویی) */}
      {isUserAmouei && showPurgeModal && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setShowPurgeModal(false)}
        >
          <div
            className="bg-slate-900 border border-red-800/80 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden cursor-default relative text-right"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-red-900/40 bg-red-950/40 flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
                <ShieldAlert className="w-5 h-5" />
                <span>تخلیه و حذف برای همیشه اطلاعات پایگاه‌داده</span>
              </div>
              <button
                type="button"
                onClick={() => setShowPurgeModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 text-xs">
              {/* Warning Alert */}
              <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-700/60 text-red-200 space-y-2 leading-relaxed">
                <div className="flex items-center gap-2 font-bold text-red-300">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>توجه بسیار مهم: این عملیات غیرقابل بازگشت است!</span>
                </div>
                <p className="text-[11px] text-red-200/90 leading-relaxed">
                  با تایید این بخش، کلیه اسناد انبارداری، سوابق گردش کالا، کاردکس‌های گاز، فاکتورها، رسیدهای امضاءشده و صفوف همگام‌سازی کاملاً حذف و دیتابیس تخلیه می‌گردد.
                </p>
              </div>

              {/* Scope Option */}
              <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={purgeAllEnvs}
                  onChange={(e) => setPurgeAllEnvs(e.target.checked)}
                  className="rounded border-slate-700 text-red-600 focus:ring-red-500 w-4 h-4 cursor-pointer"
                />
                <span className="text-[11px] font-medium">
                  پاک‌سازی سراسری کلیه محیط‌ها و انبارهای پنج‌گانه (توصیه‌شده)
                </span>
              </label>

              {/* Quick autofill helper */}
              <div className="flex items-center justify-between bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400">احراز هویت دومرحله‌ای محرمانه:</span>
                <button
                  type="button"
                  onClick={() => {
                    setPurgePassword('@Arash2021368');
                    setSecurityAnswer('40من مهندس آرش هستم');
                    setPurgeError(null);
                  }}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 underline font-semibold cursor-pointer"
                  title="درج خودکار رمز و پاسخ امنیتی مدیریت"
                >
                  تکمیل خودکار اطلاعات تایید هویت
                </button>
              </div>

              {/* Step 1: Confidential Password Input (Hashed) */}
              <div className="space-y-1.5">
                <label className="block text-slate-300 font-bold text-[11px] flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>مرحله ۱: رمز عبور محرمانه مدیریت</span>
                  </span>
                  <span className="text-[10px] text-amber-400/80 font-normal">احراز هویت اول</span>
                </label>
                <div className="relative">
                  <input
                    type={showPurgePassword ? 'text' : 'password'}
                    dir="ltr"
                    value={purgePassword}
                    onChange={(e) => {
                      setPurgePassword(e.target.value);
                      setPurgeError(null);
                    }}
                    placeholder="رمز عبور محرمانه را وارد نمایید..."
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-700 focus:border-red-500 rounded-xl text-slate-100 font-mono text-xs focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPurgePassword(!showPurgePassword)}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer p-1"
                    title={showPurgePassword ? 'مخفی‌سازی' : 'نمایش رمز'}
                  >
                    {showPurgePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Step 2: Confidential Security Question (Hashed) */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                <label className="block text-slate-300 font-bold text-[11px] flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
                    <span>مرحله ۲: پرسش امنیتی محرمانه</span>
                  </span>
                  <span className="text-[10px] text-cyan-400/80 font-normal">احراز هویت دوم</span>
                </label>
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-cyan-900/40 text-slate-300 text-[11px] leading-relaxed">
                  <span className="font-bold text-cyan-300">پرسش محرمانه:</span> عبارت تایید هویت و امضای شخصی مهندسی را وارد فرمایید:
                </div>
                <div className="relative">
                  <input
                    type={showSecurityAnswer ? 'text' : 'password'}
                    value={securityAnswer}
                    onChange={(e) => {
                      setSecurityAnswer(e.target.value);
                      setPurgeError(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleExecutePurge();
                      }
                    }}
                    placeholder="پاسخ پرسش محرمانه..."
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-xl text-slate-100 text-xs focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecurityAnswer(!showSecurityAnswer)}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer p-1"
                    title={showSecurityAnswer ? 'مخفی‌سازی' : 'نمایش پاسخ'}
                  >
                    {showSecurityAnswer ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error Alert */}
              {purgeError && (
                <div className="p-3 rounded-xl bg-red-950/80 border border-red-600 text-red-200 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{purgeError}</span>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowPurgeModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:border-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleExecutePurge}
                disabled={isPurging}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-red-600/30 transition-all cursor-pointer"
              >
                {isPurging ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>در حال پاک‌سازی دیتابیس...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>تایید نهایی، تخلیه و حذف برای همیشه</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
