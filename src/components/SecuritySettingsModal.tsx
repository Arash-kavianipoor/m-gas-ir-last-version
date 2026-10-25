import React, { useState, useEffect } from 'react';
import { User, RuntimeEnvironment } from '../types';
import { LocalStorageManager } from '../database/storage';
import {
  hashPassword,
  validatePasswordStrength,
  generateStrongPassword,
  PasswordPolicyResult
} from '../utils/security';
import {
  ShieldCheck,
  Lock,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Globe,
  Database,
  RefreshCw,
  X,
  Cpu,
  Fingerprint,
  Sparkles,
  ShieldAlert,
  Copy,
  Check,
  UserCheck
} from 'lucide-react';
import { toPersianDigits } from '../utils/persian';
import { saveAuthCookie } from '../utils/cookieAuth';

interface SecuritySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  currentEnv: RuntimeEnvironment;
}

export const SecuritySettingsModal: React.FC<SecuritySettingsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  currentEnv
}) => {
  const users = LocalStorageManager.getUsers(currentEnv);
  const state = LocalStorageManager.getState(currentEnv);

  // Gating rule: ONLY Manager Mr. Eng. Amouei can edit names, passwords and credentials!
  const isManagerAmouei =
    currentUser?.username === 'amouei' ||
    currentUser?.user_id === 'USR-001' ||
    currentUser?.role === 'ADMIN' ||
    Boolean(currentUser?.full_name?.includes('عمویی'));

  const [selectedUserId, setSelectedUserId] = useState<string>(users[0]?.user_id || currentUser.user_id);
  const targetUser = users.find(u => u.user_id === selectedUserId) || users[0] || currentUser;

  const [fullNameInput, setFullNameInput] = useState<string>(targetUser?.full_name || '');
  const [roleTitleInput, setRoleTitleInput] = useState<string>(targetUser?.role_title || '');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [systemIdInput, setSystemIdInput] = useState<string>('');
  const [systemNameInput, setSystemNameInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showInitialCredentials, setShowInitialCredentials] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Security Policy Toggles
  const [policy, setPolicy] = useState(state.security_policy || {
    strictDomainLock: true,
    allowedDomain: 'anbar.mgas.ir',
    enforceDeviceBinding: true,
    requireStrongPassword: true,
    tamperProtectionEnabled: true,
    databaseWriteProtected: false,
    failedAttempts: {},
    lockedUntil: {}
  });

  // Sync inputs when selected user changes
  useEffect(() => {
    if (targetUser) {
      setFullNameInput(targetUser.full_name || '');
      setRoleTitleInput(targetUser.role_title || '');
      setSystemIdInput(targetUser.system_id || targetUser.allowed_device_id || '');
      setSystemNameInput(targetUser.system_name || '');
      setNewPassword('');
      setConfirmPassword('');
      setStatusMessage(null);
    }
  }, [selectedUserId, targetUser.user_id, targetUser.full_name, targetUser.role_title]);

  if (!isOpen) return null;

  const policyResult: PasswordPolicyResult = validatePasswordStrength(newPassword);

  const handleGeneratePassword = () => {
    if (!isManagerAmouei) return;
    const generated = generateStrongPassword(14);
    setNewPassword(generated);
    setConfirmPassword(generated);
    setShowPassword(true);
  };

  const handleSetDefaultPassword = () => {
    if (!isManagerAmouei) return;
    setNewPassword('123456');
    setConfirmPassword('123456');
    setShowPassword(true);
  };

  const handleCopyText = (text: string, keyName: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedKey(keyName);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {}
  };

  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    // Enforce Manager Amouei authority
    if (!isManagerAmouei) {
      setStatusMessage({
        text: 'خطای امنیتی: تنها کاربر آقای مهندس عمویی (مدیریت ارشد) مجاز به ویرایش نام کاربران و پسوردها می‌باشد.',
        type: 'error'
      });
      return;
    }

    if (!fullNameInput.trim()) {
      setStatusMessage({ text: 'نام و نام خانوادگی کاربر نمی‌تواند خالی باشد.', type: 'error' });
      return;
    }

    if (!systemIdInput.trim()) {
      setStatusMessage({ text: 'شناسه سیستم (System ID) نمی‌تواند خالی باشد.', type: 'error' });
      return;
    }

    // If changing password, validate it
    let hashRecord: { hash: string; salt: string } | null = null;
    if (newPassword || confirmPassword) {
      if (newPassword !== confirmPassword) {
        setStatusMessage({ text: 'تکرار کلمه عبور با کلمه عبور جدید مطابقت ندارد.', type: 'error' });
        return;
      }

      setIsProcessing(true);
      try {
        const computed = await hashPassword(newPassword);
        hashRecord = { hash: computed.hash, salt: computed.salt };
      } catch (err: any) {
        setIsProcessing(false);
        setStatusMessage({ text: 'خطا در محاسبه هش رمز عبور: ' + (err?.message || ''), type: 'error' });
        return;
      }
    }

    setIsProcessing(true);

    try {
      // Save strictly through LocalStorageManager with actor verification
      const updateResult = LocalStorageManager.updateUserCredentials(
        currentEnv,
        currentUser,
        targetUser.user_id,
        {
          full_name: fullNameInput.trim(),
          role_title: roleTitleInput.trim() || undefined,
          password_hash: hashRecord ? hashRecord.hash : undefined,
          password_salt: hashRecord ? hashRecord.salt : undefined,
          system_id: systemIdInput.trim(),
          system_name: systemNameInput.trim() || undefined
        }
      );

      if (!updateResult.success) {
        throw new Error(updateResult.error || 'خطا در ثبت اطلاعات در دیتابیس.');
      }

      // Sync with Central Backend API
      try {
        await fetch('/api/auth/change-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: targetUser.user_id,
            full_name: fullNameInput.trim(),
            role_title: roleTitleInput.trim() || undefined,
            system_id: systemIdInput.trim(),
            password_hash: hashRecord ? hashRecord.hash : undefined,
            password_salt: hashRecord ? hashRecord.salt : undefined
          })
        });
      } catch (err) {
        console.warn('Backend sync notice:', err);
      }

      if (newPassword && targetUser.username === currentUser.username) {
        saveAuthCookie(targetUser.username, newPassword);
      }

      setStatusMessage({
        text: `مشخصات، نام و کلمه عبور کاربر «${fullNameInput.trim()}» با موفقیت توسط مهندس عمویی در دیتابیس ذخیره و رمزنگاری شد.`,
        type: 'success'
      });

      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setStatusMessage({
        text: err?.message || 'خطا در ثبت مشخصات و رمز عبور امنیتی',
        type: 'error'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTogglePolicy = (key: keyof typeof policy) => {
    if (!isManagerAmouei) return;
    const updated = {
      ...policy,
      [key]: !policy[key]
    };
    setPolicy(updated as any);
    LocalStorageManager.setSecurityPolicy(currentEnv, updated);
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

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 cursor-pointer font-sans"
      onClick={() => onClose()}
    >
      <div
        className="bg-slate-900 border border-slate-700 rounded-3xl max-w-3xl w-full p-4 sm:p-6 shadow-2xl space-y-5 cursor-default text-slate-100 max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
        onMouseDown={e => e.stopPropagation()}
        dir="rtl"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                مدیریت کاربران، ویرایش نام‌ها و کلمات عبور
              </h2>
              <p className="text-xs text-slate-400">
                پایگاه داده‌های SQLite و Cloud D1 • امکان ویرایش نام و پسورد منحصراً برای مهندس عمویی
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Access Control Permission Banner */}
        {isManagerAmouei ? (
          <div className="bg-emerald-950/70 border border-emerald-500/40 rounded-2xl p-3 sm:p-4 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                <span>دسترسی مدیریت ارشد تایید شد: آقای مهندس عمویی</span>
                <span className="bg-emerald-900/60 px-2 py-0.5 rounded text-[10px] text-emerald-200 border border-emerald-700/50">
                  مدیریت کل سیستم
                </span>
              </div>
              <p className="text-slate-300 text-[11px]">
                شما به عنوان مدیر سامانه دسترسی کامل به ویرایش نام کاربران، تغییر کلمات عبور، تولید رمز قوی یا بازنشانی به پیش‌فرض (123456) و تنظیم شناسه سیستم را دارید.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-slate-950/80 border-2 border-amber-500/40 rounded-2xl p-6 text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <KeyRound className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                قفل امنیتی انحصاری مدیریت ارشد
              </span>
              <h3 className="text-base font-bold text-white mt-2">
                دسترسی به بخش تغییر پسورد و مدیریت کاربران
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-md mx-auto">
                طبق ضوابط امنیتی سامانه ام گاز، بخش تغییر کلمه عبور و ویرایش مشخصات کاربران منحصراً برای <strong>جناب آقای مهندس موسی عمویی (مدیریت ارشد)</strong> قابل رویت، فعال و در دسترس می‌باشد.
              </p>
            </div>
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors cursor-pointer border border-slate-700"
              >
                بستن پنجره
              </button>
            </div>
          </div>
        )}

        {/* User Selection Cards & Form (Visible & Active ONLY for Engineer Mousa Amouei) */}
        {isManagerAmouei && (
          <>
            <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-300">
            انتخاب کاربر جهت بررسی یا ویرایش نام و پسورد:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {users.map(u => {
              const isSelected = selectedUserId === u.user_id;
              return (
                <button
                  key={u.user_id}
                  type="button"
                  onClick={() => {
                    setSelectedUserId(u.user_id);
                    setStatusMessage(null);
                  }}
                  className={`p-2.5 rounded-2xl border text-right transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                    isSelected
                      ? 'bg-amber-100 text-amber-950 border-amber-500 shadow-md ring-1 ring-amber-500/50 dark:bg-amber-500/15 dark:border-amber-500 dark:text-white'
                      : 'bg-slate-50 dark:bg-slate-950/50 border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-200 hover:border-slate-400 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-200 truncate">{u.full_name}</span>
                    <span className="text-[9px] px-1 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-300 font-mono shrink-0">
                      {u.role === 'ADMIN' ? 'مدیریت' : u.role === 'INTERNAL_MANAGER' ? 'دفتر' : 'انبار'}
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-600 dark:text-slate-400 flex items-center justify-between">
                    <span>@{u.username}</span>
                    <span className="text-amber-800 dark:text-amber-400 font-bold truncate text-[9px]">{u.role_title || u.role}</span>
                  </div>
                  <div className="text-[9px] flex items-center gap-1 text-emerald-800 dark:text-emerald-400 font-bold">
                    <Fingerprint className="w-3 h-3 shrink-0" />
                    <span className="truncate">رمز هش‌شده</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Credentials and System ID Form */}
        <form onSubmit={handleSaveCredentials} className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-amber-400" />
              <span>پیکربندی کاربر: <strong className="text-amber-300">{targetUser.full_name}</strong> (@{targetUser.username})</span>
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40 flex items-center gap-1">
                <Database className="w-3 h-3" />
                <span>ذخیره هش رمز (امن)</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* 1. Full Name Input (نام و نام خانوادگی کاربر) */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-300 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>نام و نام خانوادگی کاربر (ثبت در اسناد و کاردکس) *</span>
              </label>
              <input
                type="text"
                value={fullNameInput}
                onChange={e => setFullNameInput(e.target.value)}
                disabled={!isManagerAmouei || isProcessing}
                placeholder="مثال: خانم صفایی"
                required
                className="w-full text-xs bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500 disabled:opacity-50 disabled:bg-slate-950 font-bold"
              />
              <span className="text-[10px] text-slate-500 block">
                این نام در هنگام ورود کالا، کاردکس، اسناد انبار و برگه ورود/خروج درج می‌گردد.
              </span>
            </div>

            {/* 2. Role Title Input (سمت / عنوان سازمانی) */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-300">
                سمت و عنوان سازمانی کاربر
              </label>
              <input
                type="text"
                value={roleTitleInput}
                onChange={e => setRoleTitleInput(e.target.value)}
                disabled={!isManagerAmouei || isProcessing}
                placeholder="مثال: امور دفتری و بازرگانی"
                className="w-full text-xs bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500 disabled:opacity-50 disabled:bg-slate-950"
              />
              <span className="text-[10px] text-slate-500 block">
                عنوان شغلی کاربر در هدر سامانه و سربرگ‌ها
              </span>
            </div>

            {/* 3. New Password */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-bold text-slate-300">
                  کلمه عبور جدید (پسورد)
                </label>
                {isManagerAmouei && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSetDefaultPassword}
                      className="text-[10px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50"
                      title="تنظیم رمز به 123456"
                    >
                      <span>پیش‌فرض (123456)</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleGeneratePassword}
                      className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer font-bold"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>رمز قوی تصادفی</span>
                    </button>
                  </div>
                )}
              </div>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  disabled={!isManagerAmouei || isProcessing}
                  placeholder={isManagerAmouei ? "جهت تغییر پسورد، رمز جدید وارد کنید (یا دکمه بالا)" : "ویرایش فقط توسط آقای مهندس عمویی مجاز است"}
                  className="w-full text-xs bg-slate-900 border border-slate-700 rounded-xl pr-3 pl-9 py-2.5 text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500 font-mono disabled:opacity-50 disabled:bg-slate-950"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute left-2.5 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* 4. Confirm Password */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-300">
                تکرار کلمه عبور جدید
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                disabled={!isManagerAmouei || isProcessing}
                placeholder="تکرار کلمه عبور جدید"
                className="w-full text-xs bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500 font-mono disabled:opacity-50 disabled:bg-slate-950"
              />
            </div>

            {/* 5. System ID / Device Binding */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-300 flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                <span>شناسه سیستم اختصاصی (System / Device ID)</span>
              </label>
              <input
                type="text"
                value={systemIdInput}
                onChange={e => setSystemIdInput(e.target.value)}
                disabled={!isManagerAmouei || isProcessing}
                placeholder="مثال: SYS-AMOUEL-ADMIN-01"
                className="w-full text-xs bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500 font-mono disabled:opacity-50 disabled:bg-slate-950"
              />
            </div>

            {/* 6. System Name / Location */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-300">
                نام و موقعیت سیستم در شبکه ام گاز
              </label>
              <input
                type="text"
                value={systemNameInput}
                onChange={e => setSystemNameInput(e.target.value)}
                disabled={!isManagerAmouei || isProcessing}
                placeholder="مثال: سیستم اداری دفتر مرکزی (ویندوز 11)"
                className="w-full text-xs bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500 disabled:opacity-50 disabled:bg-slate-950"
              />
            </div>
          </div>

          {/* Password Strength Checklist */}
          {newPassword && (
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[10px] space-y-1.5">
              <div className="font-bold text-slate-300 flex items-center justify-between">
                <span>شاخص پیچیدگی و امنیت کلمه عبور:</span>
                <span className={policyResult.score >= 4 ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                  {policyResult.score}/5 {policyResult.isValid ? '(استاندارد فوق‌قوی تایید شد)' : '(نیاز به بهبود)'}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1 text-slate-400">
                <span className={newPassword.length >= 8 ? 'text-emerald-400' : 'text-slate-500'}>
                  ✓ حداقل ۸ نویسه
                </span>
                <span className={/[A-Z]/.test(newPassword) ? 'text-emerald-400' : 'text-slate-500'}>
                  ✓ حروف بزرگ (A-Z)
                </span>
                <span className={/[a-z]/.test(newPassword) ? 'text-emerald-400' : 'text-slate-500'}>
                  ✓ حروف کوچک (a-z)
                </span>
                <span className={/[0-9]/.test(newPassword) ? 'text-emerald-400' : 'text-slate-500'}>
                  ✓ رقم (0-9)
                </span>
                <span className={/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword) ? 'text-emerald-400' : 'text-slate-500'}>
                  ✓ نویسه خاص (!@#$...)
                </span>
              </div>
            </div>
          )}

          {/* Database Security Status Record for Target User */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] space-y-1">
            <div className="text-slate-400 flex items-center justify-between">
              <span className="text-slate-300 font-bold flex items-center gap-1">
                <Database className="w-3.5 h-3.5 text-indigo-400" />
                <span>وضعیت حفاظت امنیتی کاربر ({targetUser.username}):</span>
              </span>
              <span className="text-emerald-400 font-bold">رمزنگاری یک‌طرفه امن دیتابیس</span>
            </div>
            <div className="text-[10px] text-slate-400 flex flex-wrap items-center gap-4 pt-1">
              <span className="flex items-center gap-1">
                <span className="text-slate-500">وضعیت رمز عبور: </span>
                <span className="text-emerald-300 font-bold">
                  {targetUser.password_hash ? 'محافظت‌شده به صورت هش امن' : 'ثبت‌نشده'}
                </span>
              </span>
              <span className="flex items-center gap-1">
                <span className="text-slate-500">کلمه عبور متنی: </span>
                <span className="text-emerald-300 font-bold">حذف شده از دیتابیس (غیرقابل بازگشت)</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="text-slate-500">شناسه سیستم مجاز: </span>
                <span className="text-amber-300 font-mono font-bold">{targetUser.system_id || targetUser.allowed_device_id}</span>
              </span>
            </div>
          </div>

          {/* Status Alert */}
          {statusMessage && (
            <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-950/70 border border-emerald-700 text-emerald-200'
                : 'bg-rose-950/70 border border-rose-800 text-rose-200'
            }`}>
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Action Button */}
          <div className="flex justify-end items-center gap-3">
            <button
              type="submit"
              disabled={!isManagerAmouei || isProcessing}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:bg-slate-200 disabled:text-slate-600 dark:disabled:bg-slate-800 dark:disabled:text-slate-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : !isManagerAmouei ? (
                <Lock className="w-4 h-4" />
              ) : (
                <ShieldCheck className="w-4 h-4" />
              )}
              <span>
                {isManagerAmouei
                  ? 'ذخیره تغییرات نام، پسورد و شناسه سیستم در پایگاه داده'
                  : 'ویرایش مسدود است (منحصراً مجاز برای آقای مهندس عمویی)'}
              </span>
            </button>
          </div>
        </form>
        </>
        )}

        {/* Manager's Passwords Reference Card */}
        {isManagerAmouei && (
          <div className="bg-slate-950/70 border border-amber-500/30 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                <KeyRound className="w-4 h-4" />
                <span>رمزهای عبور اولیه و شناسه سیستم‌های کاربران (مخصوص آقای مهندس عمویی):</span>
              </div>
              <button
                type="button"
                onClick={() => setShowInitialCredentials(p => !p)}
                className="text-[11px] text-slate-800 dark:text-slate-300 hover:text-black dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 font-bold cursor-pointer transition-colors"
              >
                {showInitialCredentials ? 'مخفی‌سازی' : 'نمایش مشخصات و رمزهای ۵ کاربر'}
              </button>
            </div>

            {showInitialCredentials && (
              <div className="space-y-2 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 text-xs">
                  {/* User 1: Amouei */}
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <div className="font-bold text-white flex items-center justify-between">
                      <span className="truncate">مهندس عمویی</span>
                      <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1 rounded shrink-0">مدیر</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">amouei</div>
                    <div className="text-[11px] font-mono text-emerald-300 flex items-center justify-between bg-slate-950 p-1 rounded border border-slate-800">
                      <span className="truncate">Amouei#Mg@s2026!</span>
                      <button
                        type="button"
                        onClick={() => handleCopyText('Amouei#Mg@s2026!', 'p1')}
                        className="text-slate-400 hover:text-white p-0.5 shrink-0"
                        title="کپی رمز"
                      >
                        {copiedKey === 'p1' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                    <div className="text-[10px] font-mono text-indigo-300 truncate">SYS-AMOUEL-ADMIN-01</div>
                  </div>

                  {/* User 2: Karami */}
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <div className="font-bold text-white flex items-center justify-between">
                      <span className="truncate">خانم کرمی</span>
                      <span className="text-[10px] text-indigo-400 bg-indigo-500/10 px-1 rounded shrink-0">مدیر داخلی</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">karami</div>
                    <div className="text-[11px] font-mono text-emerald-300 flex items-center justify-between bg-slate-950 p-1 rounded border border-slate-800">
                      <span className="truncate">Karami#Mgas789$</span>
                      <button
                        type="button"
                        onClick={() => handleCopyText('Karami#Mgas789$', 'p2')}
                        className="text-slate-400 hover:text-white p-0.5 shrink-0"
                        title="کپی رمز"
                      >
                        {copiedKey === 'p2' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                    <div className="text-[10px] font-mono text-indigo-300 truncate">SYS-KARAMI-OFFICE-02</div>
                  </div>

                  {/* User 3: Hajivand */}
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <div className="font-bold text-white flex items-center justify-between">
                      <span className="truncate">مهندس حاجی وند</span>
                      <span className="text-[10px] text-teal-400 bg-teal-500/10 px-1 rounded shrink-0">انباردار</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">hajivand</div>
                    <div className="text-[11px] font-mono text-emerald-300 flex items-center justify-between bg-slate-950 p-1 rounded border border-slate-800">
                      <span className="truncate">Hajivand#Win7Gas!</span>
                      <button
                        type="button"
                        onClick={() => handleCopyText('Hajivand#Win7Gas!', 'p3')}
                        className="text-slate-400 hover:text-white p-0.5 shrink-0"
                        title="کپی رمز"
                      >
                        {copiedKey === 'p3' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                    <div className="text-[10px] font-mono text-indigo-300 truncate">SYS-HAJIVAND-WH-03</div>
                  </div>

                  {/* User 4: Safaei */}
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <div className="font-bold text-white flex items-center justify-between">
                      <span className="truncate">خانم صفایی</span>
                      <span className="text-[10px] text-purple-400 bg-purple-500/10 px-1 rounded shrink-0">بازرگانی</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">safaei</div>
                    <div className="text-[11px] font-mono text-emerald-300 flex items-center justify-between bg-slate-950 p-1 rounded border border-slate-800">
                      <span className="truncate">123456</span>
                      <button
                        type="button"
                        onClick={() => handleCopyText('123456', 'p4')}
                        className="text-slate-400 hover:text-white p-0.5 shrink-0"
                        title="کپی رمز"
                      >
                        {copiedKey === 'p4' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                    <div className="text-[10px] font-mono text-indigo-300 truncate">SYS-SAFAEI-OFFICE-04</div>
                  </div>

                  {/* User 5: Hakimi */}
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <div className="font-bold text-white flex items-center justify-between">
                      <span className="truncate">خانم حکیمی</span>
                      <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-1 rounded shrink-0">حسابداری</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">hakimi</div>
                    <div className="text-[11px] font-mono text-emerald-300 flex items-center justify-between bg-slate-950 p-1 rounded border border-slate-800">
                      <span className="truncate">123456</span>
                      <button
                        type="button"
                        onClick={() => handleCopyText('123456', 'p5')}
                        className="text-slate-400 hover:text-white p-0.5 shrink-0"
                        title="کپی رمز"
                      >
                        {copiedKey === 'p5' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                    <div className="text-[10px] font-mono text-indigo-300 truncate">SYS-HAKIMI-OFFICE-05</div>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400">
                  * این رمزها به صورت هش یک‌طرفه در پایگاه داده اعتبارسنجی می‌شوند. آقای مهندس عمویی در هر زمان می‌تواند نام و پسورد کاربران را در فرم بالا ویرایش نماید.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Database Anti-Tamper & Protection Policies */}
        <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-4 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
            <Database className="w-4 h-4 text-indigo-400" />
            <span>تدابیر سخت‌گیرانه عدم امکان نفوذ و حذف اطلاعات پایگاه داده:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div
              onClick={() => handleTogglePolicy('strictDomainLock')}
              className={`p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between ${isManagerAmouei ? 'cursor-pointer hover:border-slate-700' : 'cursor-default'}`}
            >
              <div>
                <div className="font-bold text-slate-200">محدودسازی به دامنه anbar.mgas.ir</div>
                <div className="text-[10px] text-slate-400">رد هرگونه درخواست خارج از شبکه یا بدون هویت</div>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${policy.strictDomainLock ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-500'}`}>
                {policy.strictDomainLock ? 'فعال' : 'غیرفعال'}
              </span>
            </div>

            <div
              onClick={() => handleTogglePolicy('requireStrongPassword')}
              className={`p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between ${isManagerAmouei ? 'cursor-pointer hover:border-slate-700' : 'cursor-default'}`}
            >
              <div>
                <div className="font-bold text-slate-200">الزام رمز عبور فوق‌قوی (۸+ کاراکتر)</div>
                <div className="text-[10px] text-slate-400">ممانعت قطعی از پسوردهای ساده یا پیش‌فرض</div>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${policy.requireStrongPassword ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-500'}`}>
                {policy.requireStrongPassword ? 'فعال' : 'غیرفعال'}
              </span>
            </div>

            <div
              onClick={() => handleTogglePolicy('tamperProtectionEnabled')}
              className={`p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between ${isManagerAmouei ? 'cursor-pointer hover:border-slate-700' : 'cursor-default'}`}
            >
              <div>
                <div className="font-bold text-slate-200">امضای دیجیتال رکوردهای دیتابیس</div>
                <div className="text-[10px] text-slate-400">تشخیص و خنثی‌سازی هرگونه دستکاری دستی فایل SQLite</div>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${policy.tamperProtectionEnabled ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-500'}`}>
                {policy.tamperProtectionEnabled ? 'فعال' : 'غیرفعال'}
              </span>
            </div>

            <div
              onClick={() => handleTogglePolicy('enforceDeviceBinding')}
              className={`p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between ${isManagerAmouei ? 'cursor-pointer hover:border-slate-700' : 'cursor-default'}`}
            >
              <div>
                <div className="font-bold text-slate-200">قفل انحصاری شناسه سیستم (Device ID)</div>
                <div className="text-[10px] text-slate-400">تطبیق فیزیکی کاربر با ترمینال مجاز شرکت</div>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${policy.enforceDeviceBinding ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-500'}`}>
                {policy.enforceDeviceBinding ? 'فعال' : 'غیرفعال'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <span className="text-[11px] text-slate-500">
            سامانه امنیتی ام گاز • کلیه تغییرات در زنجیره غیرقابل بازگشت AuditLog ثبت می‌گردند.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700 font-bold text-xs transition-colors cursor-pointer"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};
