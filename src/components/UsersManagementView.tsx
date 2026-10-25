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
  KeyRound,
  UserCheck,
  ShieldCheck,
  ShieldAlert,
  Users,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Building2,
  Monitor,
  RefreshCw,
  PlusCircle,
  Info,
  Save,
  Clock,
  Shield,
  Activity,
  Trash2
} from 'lucide-react';
import { toPersianDigits, formatPersianDateTime } from '../utils/persian';

interface UsersManagementViewProps {
  currentUser: User;
  currentEnv: RuntimeEnvironment;
  onRefreshDatabase?: () => void;
  onOpenSwitchUser?: () => void;
}

export const UsersManagementView: React.FC<UsersManagementViewProps> = ({
  currentUser,
  currentEnv,
  onRefreshDatabase,
  onOpenSwitchUser
}) => {
  const [users, setUsers] = useState<User[]>(() => LocalStorageManager.getUsers(currentEnv));
  const state = LocalStorageManager.getState(currentEnv);

  // Gating rule: ONLY Manager Mr. Eng. Mousa Amouei (or ADMIN) has editing permissions
  const isManagerAmouei =
    currentUser?.username === 'amouei' ||
    currentUser?.user_id === 'USR-001' ||
    currentUser?.role === 'ADMIN' ||
    Boolean(currentUser?.full_name?.includes('عمویی'));

  const [selectedUserId, setSelectedUserId] = useState<string>(
    users.find(u => u.username === 'amouei')?.user_id || users[0]?.user_id || currentUser.user_id
  );

  const selectedUser = users.find(u => u.user_id === selectedUserId) || users[0] || currentUser;

  // Form Fields
  const [fullNameInput, setFullNameInput] = useState<string>(selectedUser?.full_name || '');
  const [roleTitleInput, setRoleTitleInput] = useState<string>(selectedUser?.role_title || '');
  const [systemIdInput, setSystemIdInput] = useState<string>(selectedUser?.system_id || selectedUser?.allowed_device_id || '');
  const [systemNameInput, setSystemNameInput] = useState<string>(selectedUser?.system_name || '');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Status message
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Add New User Modal State
  const [showAddUserModal, setShowAddUserModal] = useState<boolean>(false);
  const [newUserData, setNewUserData] = useState<{
    username: string;
    full_name: string;
    role: 'ADMIN' | 'INTERNAL_MANAGER' | 'WAREHOUSE_KEEPER';
    role_title: string;
    system_id: string;
    system_name: string;
    password: string;
  }>({
    username: '',
    full_name: '',
    role: 'INTERNAL_MANAGER',
    role_title: 'کارشناس اداری و انبار',
    system_id: 'SYS-STATION-NEW',
    system_name: 'سیستم جدید',
    password: '123456'
  });

  const refreshUserList = () => {
    const fresh = LocalStorageManager.getUsers(currentEnv);
    setUsers(fresh);
  };

  useEffect(() => {
    refreshUserList();
    const handleUpdate = () => refreshUserList();
    window.addEventListener('mgas:users_updated', handleUpdate);
    window.addEventListener('mgas:db_refreshed', handleUpdate);
    return () => {
      window.removeEventListener('mgas:users_updated', handleUpdate);
      window.removeEventListener('mgas:db_refreshed', handleUpdate);
    };
  }, [currentEnv]);

  // Sync inputs when selected user changes
  useEffect(() => {
    if (selectedUser) {
      setFullNameInput(selectedUser.full_name || '');
      setRoleTitleInput(selectedUser.role_title || '');
      setSystemIdInput(selectedUser.system_id || selectedUser.allowed_device_id || '');
      setSystemNameInput(selectedUser.system_name || '');
      setNewPassword('');
      setConfirmPassword('');
      setStatusMessage(null);
    }
  }, [selectedUserId, selectedUser?.user_id]);

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

    if (!isManagerAmouei) {
      setStatusMessage({
        text: 'خطای امنیتی: تنها آقای مهندس موسی عمویی (مدیریت ارشد) مجاز به ویرایش مشخصات کاربران و پسوردها می‌باشد.',
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

    let hashRecord: { hash: string; salt: string } | null = null;
    if (newPassword || confirmPassword) {
      if (newPassword !== confirmPassword) {
        setStatusMessage({ text: 'تکرار کلمه عبور با کلمه عبور جدید یکسان نیست.', type: 'error' });
        return;
      }

      setIsProcessing(true);
      try {
        const computed = await hashPassword(newPassword);
        hashRecord = { hash: computed.hash, salt: computed.salt };
      } catch (err: any) {
        setIsProcessing(false);
        setStatusMessage({ text: 'خطا در رمزنگاری پسورد: ' + (err?.message || ''), type: 'error' });
        return;
      }
    }

    setIsProcessing(true);

    try {
      const updateResult = LocalStorageManager.updateUserCredentials(
        currentEnv,
        currentUser,
        selectedUser.user_id,
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

      // Notify Central API
      try {
        await fetch('/api/auth/change-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: selectedUser.user_id,
            full_name: fullNameInput.trim(),
            role_title: roleTitleInput.trim() || undefined,
            system_id: systemIdInput.trim(),
            password_hash: hashRecord ? hashRecord.hash : undefined,
            password_salt: hashRecord ? hashRecord.salt : undefined
          })
        });
      } catch {}

      refreshUserList();
      if (onRefreshDatabase) onRefreshDatabase();

      setStatusMessage({
        text: `مشخصات و کلمه عبور کاربر «${fullNameInput.trim()}» با موفقیت به‌روزرسانی و در تمامی دیتابیس‌های کلاینت‌ها همگام‌سازی شد.`,
        type: 'success'
      });
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setStatusMessage({
        text: err?.message || 'خطایی در به‌روزرسانی رخ داد.',
        type: 'error'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateNewUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isManagerAmouei) return;

    if (!newUserData.username.trim() || !newUserData.full_name.trim()) {
      alert('لطفاً نام کاربری و نام کامل را وارد نمایید.');
      return;
    }

    try {
      const computed = await hashPassword(newUserData.password || '123456');
      const newUserId = `USR-${Date.now().toString().slice(-4)}`;

      const newUser: User = {
        user_id: newUserId,
        username: newUserData.username.trim().toLowerCase(),
        password_salt: computed.salt,
        password_hash: computed.hash,
        is_password_changed: true,
        full_name: newUserData.full_name.trim(),
        role: newUserData.role,
        role_title: newUserData.role_title.trim(),
        allowed_device_id: newUserData.system_id.trim(),
        system_id: newUserData.system_id.trim(),
        system_name: newUserData.system_name.trim()
      };

      // Save to all local client databases and broadcast USER CREATE SyncEvent
      const saveRes = LocalStorageManager.saveOrUpdateUser(currentEnv, currentUser, newUser, true);
      if (!saveRes.success) {
        throw new Error(saveRes.error || 'خطا در ثبت کاربر');
      }

      refreshUserList();
      setSelectedUserId(newUserId);
      setShowAddUserModal(false);
      setStatusMessage({
        text: `کاربر جدید «${newUser.full_name}» با موفقیت افزوده و در تمام پایگاه‌های محلی و ابری همگام‌سازی گردید.`,
        type: 'success'
      });
    } catch (err: any) {
      alert('خطا در ایجاد کاربر جدید: ' + err?.message);
    }
  };

  const handleDeleteSelectedUser = () => {
    if (!isManagerAmouei) return;
    if (selectedUser.user_id === 'USR-001') {
      alert('امکان حذف کاربر اصلی مدیریت عامل وجود ندارد.');
      return;
    }

    const conf = window.confirm(`آیا از حذف کامل حساب کاربری «${selectedUser.full_name} (@${selectedUser.username})» از تمام دیتابیس‌های کلاینت‌ها و کلودفلر اطمینان دارید؟`);
    if (!conf) return;

    const delRes = LocalStorageManager.deleteUser(currentEnv, currentUser, selectedUser.user_id);
    if (delRes.success) {
      refreshUserList();
      setSelectedUserId('USR-001');
      setStatusMessage({
        text: `حساب کاربری «${selectedUser.full_name}» با موفقیت از تمامی دیتابیس‌ها حذف شد.`,
        type: 'success'
      });
    } else {
      alert(delRes.error || 'خطا در حذف کاربر');
    }
  };

  if (!isManagerAmouei) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto w-full py-12 px-4" dir="rtl">
        <div className="bg-slate-900 border-2 border-amber-500/40 rounded-3xl p-8 shadow-2xl text-center space-y-5 text-white">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner">
            <KeyRound className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
              قفل امنیتی انحصاری مدیریت ارشد
            </span>
            <h2 className="text-xl font-black mt-3">
              دسترسی به بخش تغییر پسورد و مشخصات کاربران
            </h2>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed max-w-lg mx-auto">
              طبق ضوابط امنیتی سامانه انبارداری ام گاز، بخش تغییر پسورد و مدیریت کاربران <strong>فقط و منحصراً برای جناب آقای مهندس موسی عمویی (مدیریت ارشد)</strong> قابل رویت، فعال و در دسترس می‌باشد.
            </p>
          </div>
          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl text-xs text-slate-400">
            کاربر جاری: <strong className="text-white">{currentUser?.full_name}</strong> ({currentUser?.role_title || currentUser?.role}) • شناسه: {currentUser?.user_id}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full pb-10">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-900 border border-amber-500/50 rounded-3xl p-5 sm:p-7 shadow-xl text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 -ml-10 -mt-10 w-44 h-44 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center text-amber-200 shrink-0 shadow-inner">
              <KeyRound className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold bg-black/30 text-amber-200 px-2.5 py-0.5 rounded-full border border-amber-300/30">
                  پنل اختصاصی مدیریت ارشد ام گاز
                </span>
                <span className="text-xs text-amber-100 font-medium">
                  مهندس موسی عمویی
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold mt-1">
                بخش تغییر پسورد و مشخصات کاربران
              </h1>
              <p className="text-xs sm:text-sm text-amber-100/90 mt-1">
                مدیریت جامع حساب‌های کاربری، تعیین سطح دسترسی، شناسه سیستم و تغییر امن کلمات عبور
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch md:self-auto">
            {isManagerAmouei && (
              <button
                type="button"
                onClick={() => setShowAddUserModal(true)}
                className="flex-1 md:flex-initial px-3.5 py-2.5 rounded-xl bg-white text-amber-950 hover:bg-amber-100 font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-amber-800" />
                <span>افزودن کاربر جدید</span>
              </button>
            )}
            {onOpenSwitchUser && (
              <button
                type="button"
                onClick={onOpenSwitchUser}
                className="px-3.5 py-2.5 rounded-xl bg-black/25 hover:bg-black/35 text-white border border-white/20 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Users className="w-4 h-4 text-amber-200" />
                <span>تغییر کاربر فعال</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick KPI stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-amber-400/30 text-xs">
          <div className="bg-black/20 p-2.5 rounded-xl">
            <span className="text-amber-200 block text-[11px]">تعداد کل کاربران فعال</span>
            <span className="text-base font-bold font-mono">{toPersianDigits(users.length)} کاربر</span>
          </div>
          <div className="bg-black/20 p-2.5 rounded-xl">
            <span className="text-amber-200 block text-[11px]">سطح دسترسی شما</span>
            <span className="text-base font-bold">
              {isManagerAmouei ? 'مدیریت ارشد (مجاز)' : 'کاربر عادی (فقط مشاهده)'}
            </span>
          </div>
          <div className="bg-black/20 p-2.5 rounded-xl">
            <span className="text-amber-200 block text-[11px]">الگوریتم امنیتی رمز</span>
            <span className="text-base font-bold font-mono">PBKDF2-SHA256</span>
          </div>
          <div className="bg-black/20 p-2.5 rounded-xl">
            <span className="text-amber-200 block text-[11px]">سیستم مرکزی</span>
            <span className="text-base font-bold font-mono">anbar.mgas.ir</span>
          </div>
        </div>
      </div>

      {/* Security Warning if not Manager Amouei */}
      {!isManagerAmouei && (
        <div className="bg-rose-950/60 border border-rose-600/60 rounded-2xl p-4 flex items-center gap-3 text-rose-200">
          <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0" />
          <div className="text-xs">
            <div className="font-bold text-sm text-white">دسترسی محدود شده است</div>
            <p className="mt-0.5">
              تنها کاربر <strong>جناب آقای مهندس موسی عمویی (مدیریت ارشد)</strong> صلاحیت تغییر کلمه عبور و مشخصات کاربران را دارد. شما در حال حاضر فقط می‌توانید مشخصات را مشاهده کنید.
            </p>
          </div>
        </div>
      )}

      {/* Main Layout: User Selector (Right) + Editor (Left) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* User List Sidebar */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-500" />
              <span>انتخاب کاربر جهت ویرایش</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              {toPersianDigits(users.length)} نفر
            </span>
          </div>

          <div className="space-y-2">
            {users.map(u => {
              const isSelected = u.user_id === selectedUserId;
              const isAmouei = u.username === 'amouei';
              const isHajivand = u.username === 'hajivand' || u.role === 'WAREHOUSE_KEEPER';
              const isKarami = u.username === 'karami';

              return (
                <button
                  key={u.user_id}
                  type="button"
                  onClick={() => setSelectedUserId(u.user_id)}
                  className={`w-full p-3.5 rounded-2xl border text-right transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500 text-slate-900 dark:text-white shadow-md'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-400 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                        isAmouei
                          ? 'bg-amber-500/20 text-amber-500 border border-amber-500/40'
                          : isHajivand
                          ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40'
                          : isKarami
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-slate-500/20 text-slate-400 border border-slate-500/40'
                      }`}
                    >
                      {u.full_name?.charAt(0) || 'ک'}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-bold truncate">
                        {u.full_name}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono text-amber-600 dark:text-amber-400">@{u.username}</span>
                        <span>•</span>
                        <span>{u.role_title || (u.role === 'ADMIN' ? 'مدیر ارشد' : 'کاربر')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {isAmouei && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                        مدیر ارشد
                      </span>
                    )}
                    {u.system_id && (
                      <span className="text-[9px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                        {u.system_id}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="bg-amber-50/70 dark:bg-amber-950/20 border border-amber-300/60 dark:border-amber-900/40 rounded-2xl p-3.5 text-xs text-amber-900 dark:text-amber-200">
            <div className="flex items-center gap-1.5 font-bold mb-1">
              <Info className="w-4 h-4 text-amber-600 shrink-0" />
              <span>نکته مهم امنیتی:</span>
            </div>
            <p className="leading-relaxed text-[11px] text-slate-600 dark:text-slate-300">
              هر تغییری در نام یا پسورد کاربران فوراً در دیتابیس محلی این سیستم ذخیره شده و از طریق وب‌سوکت و پروتکل همگام‌سازی ابری به تمامی سیستم‌های کلاینت دیگر (تا ۱۵ ایستگاه کاری) مخابره می‌شود.
            </p>
          </div>
        </div>

        {/* User Details & Password Form */}
        <div className="lg:col-span-8">
          <form
            onSubmit={handleSaveCredentials}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-sm space-y-6"
          >
            {/* Header info of selected user */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-500 font-extrabold text-lg">
                  {selectedUser.full_name?.charAt(0) || 'ک'}
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>ویرایش مشخصات: {selectedUser.full_name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-mono text-slate-500 dark:text-slate-400">
                      ID: {selectedUser.user_id}
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    نام کاربری ورود: <strong className="font-mono text-amber-600 dark:text-amber-400">@{selectedUser.username}</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300">
                  {selectedUser.role_title || selectedUser.role}
                </span>
              </div>
            </div>

            {/* Status Feedback */}
            {statusMessage && (
              <div
                className={`p-3.5 rounded-2xl text-xs flex items-center gap-2.5 animate-fade-in ${
                  statusMessage.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200'
                    : 'bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-700 text-rose-800 dark:text-rose-200'
                }`}
              >
                {statusMessage.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                )}
                <span className="font-medium">{statusMessage.text}</span>
              </div>
            )}

            {/* Section 1: User Specifications */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-amber-500" />
                <span>۱. مشخصات فردی و عنوان سازمانی</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    نام و نام خانوادگی کاربر *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!isManagerAmouei}
                    value={fullNameInput}
                    onChange={(e) => setFullNameInput(e.target.value)}
                    placeholder="مثال: آقای مهندس موسی عمویی"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-bold focus:outline-none focus:border-amber-500 disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    عنوان سمت و نقش سازمانی
                  </label>
                  <input
                    type="text"
                    disabled={!isManagerAmouei}
                    value={roleTitleInput}
                    onChange={(e) => setRoleTitleInput(e.target.value)}
                    placeholder="مثال: مدیریت ارشد / انباردار / مدیر داخلی"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-amber-500 disabled:opacity-60"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Hardware & Station Device Binding */}
            <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Monitor className="w-4 h-4 text-cyan-500" />
                <span>۲. اتصال به سیستم و ایستگاه کاری مجاز (Device Binding)</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    شناسه سخت‌افزاری سیستم (System ID) *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!isManagerAmouei}
                    value={systemIdInput}
                    onChange={(e) => setSystemIdInput(e.target.value)}
                    placeholder="مثال: SYS-AMOUEL-ADMIN-01"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-mono focus:outline-none focus:border-cyan-500 disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    نام سیستم / ایستگاه کاری
                  </label>
                  <input
                    type="text"
                    disabled={!isManagerAmouei}
                    value={systemNameInput}
                    onChange={(e) => setSystemNameInput(e.target.value)}
                    placeholder="مثال: سیستم اداری مدیر عامل (ویندوز 11)"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-cyan-500 disabled:opacity-60"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Password Change */}
            <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800 bg-amber-50/40 dark:bg-amber-950/10 p-4 rounded-2xl border border-amber-200 dark:border-amber-900/40">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h4 className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-600" />
                  <span>۳. تغییر کلمه عبور (پسورد)</span>
                </h4>

                {isManagerAmouei && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleGeneratePassword}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-700 dark:text-amber-300 font-bold border border-amber-500/40 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>تولید رمز تصادفی قوی</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleSetDefaultPassword}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono font-bold border border-slate-300 dark:border-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
                      title="تنظیم رمز ساده ۱۲۳۴۵۶"
                    >
                      <span>123456</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      کلمه عبور جدید
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(prev => !prev)}
                      className="text-[11px] text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{showPassword ? 'مخفی‌سازی' : 'نمایش'}</span>
                    </button>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    disabled={!isManagerAmouei}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="در صورت تمایل به تغییر، رمز جدید را وارد کنید"
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-mono focus:outline-none focus:border-amber-500 disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    تکرار کلمه عبور جدید
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    disabled={!isManagerAmouei}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="تکرار رمز عبور جدید را وارد کنید"
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-mono focus:outline-none focus:border-amber-500 disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Password strength indicator */}
              {newPassword && (
                <div className="p-2.5 rounded-xl bg-white/70 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">قدرت رمز عبور:</span>
                    <span
                      className={`font-bold ${
                        policyResult.isValid ? 'text-emerald-500' : 'text-amber-500'
                      }`}
                    >
                      {policyResult.score >= 4
                        ? 'بسیار قوی'
                        : policyResult.score >= 3
                        ? 'مناسب'
                        : policyResult.score >= 2
                        ? 'متوسط'
                        : 'ضعیف'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyText(newPassword, 'pwd')}
                    className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'pwd' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>کپی رمز</span>
                  </button>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>همگام‌سازی بلافاصله با تمام دیتابیس‌های نصب شده</span>
              </div>

              {isManagerAmouei && (
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-600/30 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Save className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
                  <span>{isProcessing ? 'در حال ذخیره‌سازی...' : 'ذخیره تغییرات و همگام‌سازی'}</span>
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Add New User Modal */}
      {showAddUserModal && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setShowAddUserModal(false)}
        >
          <div
            className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  افزودن کاربر جدید به سامانه
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddUserModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewUser} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  نام کاربری (جهت لاگین به انگلیسی) *
                </label>
                <input
                  type="text"
                  required
                  value={newUserData.username}
                  onChange={(e) => setNewUserData({ ...newUserData, username: e.target.value.toLowerCase() })}
                  placeholder="مثال: ahmadi"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  نام و نام خانوادگی کامل *
                </label>
                <input
                  type="text"
                  required
                  value={newUserData.full_name}
                  onChange={(e) => setNewUserData({ ...newUserData, full_name: e.target.value })}
                  placeholder="مثال: آقای مهندس احمدی"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    نقش کاربری
                  </label>
                  <select
                    value={newUserData.role}
                    onChange={(e: any) => setNewUserData({ ...newUserData, role: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="INTERNAL_MANAGER">مدیر داخلی / اداری</option>
                    <option value="WAREHOUSE_KEEPER">انباردار</option>
                    <option value="ADMIN">مدیریت کل سیستم</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    عنوان سمت
                  </label>
                  <input
                    type="text"
                    value={newUserData.role_title}
                    onChange={(e) => setNewUserData({ ...newUserData, role_title: e.target.value })}
                    placeholder="مثال: کارشناس اسناد انبار"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    شناسه سیستم (System ID)
                  </label>
                  <input
                    type="text"
                    value={newUserData.system_id}
                    onChange={(e) => setNewUserData({ ...newUserData, system_id: e.target.value })}
                    placeholder="SYS-STATION-XX"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    رمز عبور اولیه
                  </label>
                  <input
                    type="text"
                    value={newUserData.password}
                    onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                    placeholder="123456"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold cursor-pointer"
                >
                  ایجاد کاربر
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
