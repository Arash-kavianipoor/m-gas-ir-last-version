import React from 'react';
import {
  RuntimeEnvironment,
  User,
  Device,
  SyncState
} from '../types';
import {
  UserCheck,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Globe,
  Sun,
  Moon,
  KeyRound
} from 'lucide-react';
import { MGasOfficialLogo } from './MGasOfficialLogo';

interface HeaderProps {
  currentEnv: RuntimeEnvironment;
  onSelectEnv: (env: RuntimeEnvironment) => void;
  currentUser: User;
  onSelectUser: (user: User) => void;
  users: User[];
  devices: Device[];
  syncState: SyncState;
  isOfflineSimulated: boolean;
  onToggleOffline: () => void;
  onSyncNow: () => void;
  isSyncing: boolean;
  onOpenTriSync: () => void;
  onOpenWinCompat: () => void;
  onLogout?: () => void;
  onSwitchUser?: () => void;
  onOpenSecurity?: () => void;
  onOpenUsersManagement?: () => void;
  isMobileMenuOpen?: boolean;
  onToggleMobileMenu?: () => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentEnv,
  onSelectEnv,
  currentUser,
  syncState,
  isOfflineSimulated,
  onToggleOffline,
  onSyncNow,
  isSyncing,
  onOpenTriSync,
  onOpenWinCompat,
  onLogout,
  onSwitchUser,
  onOpenSecurity,
  onOpenUsersManagement,
  isMobileMenuOpen,
  onToggleMobileMenu,
  theme = 'dark',
  onToggleTheme
}) => {
  return (
    <header className="w-full bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-40 px-2 sm:px-4 py-1.5 sm:py-2.5 shadow-md transition-colors duration-200">
      <div className="w-full flex flex-col">
        
        {/* Main Bar: Top Row */}
        <div className="w-full flex items-center justify-between gap-1.5 sm:gap-2">
          
          {/* Right Side: Hamburger (Mobile) + Logo + Title - Sticks completely to right in RTL */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {onToggleMobileMenu && (
              <button
                type="button"
                onClick={onToggleMobileMenu}
                aria-label={isMobileMenuOpen ? 'بستن منو' : 'باز کردن منو'}
                className="md:hidden p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer shrink-0"
              >
                {isMobileMenuOpen ? <X className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" /> : <Menu className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>
            )}

            <div className="flex items-center gap-1.5 sm:gap-2.5">
              <MGasOfficialLogo />
              <div title="ساخته شده توسط مهندس آرش کاویانی پور" className="cursor-default">
                <div className="flex items-center gap-1">
                  <h1 className="text-xs sm:text-base font-bold tracking-tight text-white whitespace-nowrap">انبارداری ام گاز</h1>
                </div>
              </div>
            </div>
          </div>

          {/* Left Side: User Profile & Session Controls */}
          <div className="flex items-center gap-1 sm:gap-2 justify-end shrink-0 min-w-0">
            <div className="flex items-center gap-1 sm:gap-2 bg-[#fbf7ee] border border-amber-300/90 px-1.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl shadow-sm min-w-0 text-slate-900">
              <UserCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-800 shrink-0" />
              <div className="flex flex-col text-right min-w-0">
                <span className="text-[11px] sm:text-sm font-bold text-slate-950 truncate max-w-[65px] xs:max-w-[100px] sm:max-w-none">
                  {currentUser.full_name}
                </span>
                <div className="flex items-center gap-1 min-w-0">
                  <span className="text-[9px] sm:text-[10px] text-amber-900 font-bold truncate max-w-[65px] xs:max-w-[100px] sm:max-w-none">
                    {currentUser.role_title || (currentUser.role === 'ADMIN' ? 'مدیریت سامانه' : 'انباردار')}
                  </span>
                  {(currentUser.system_id || currentUser.allowed_device_id) && (
                    <span className="hidden md:inline-block text-[9px] font-mono font-bold text-amber-950 bg-amber-100/90 px-1 rounded border border-amber-300/90">
                      {currentUser.system_id || currentUser.allowed_device_id}
                    </span>
                  )}
                </div>
              </div>

              {/* User Management & Password Change Button (Strictly visible, active and accessible ONLY to Engineer Mousa Amouei) */}
              {Boolean(
                (currentUser?.username === 'amouei' ||
                  currentUser?.user_id === 'USR-001' ||
                  currentUser?.role === 'ADMIN' ||
                  currentUser?.full_name?.includes('عمویی')) &&
                (onOpenUsersManagement || onOpenSecurity)
              ) && (
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenUsersManagement) onOpenUsersManagement();
                    else if (onOpenSecurity) onOpenSecurity();
                  }}
                  title="تغییر پسورد، نام و مشخصات کاربران توسط مدیریت (آقای مهندس موسی عمویی)"
                  className="flex text-xs px-2 sm:px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white transition-colors border border-amber-700 items-center gap-1 cursor-pointer mr-1 shrink-0 font-bold shadow-sm"
                >
                  <KeyRound className="w-3.5 h-3.5 text-amber-100" />
                  <span className="hidden md:inline">تغییر پسورد و مشخصات کاربران</span>
                  <span className="md:hidden">تغییر پسورد</span>
                </button>
              )}

              {/* Switch User Button */}
              {onSwitchUser && (
                <button
                  type="button"
                  onClick={onSwitchUser}
                  title="تغییر کاربر سامانه با رمز عبور"
                  className="hidden sm:flex text-xs px-2.5 py-1 rounded-lg bg-amber-100/90 hover:bg-amber-200/90 text-amber-950 transition-colors border border-amber-300 cursor-pointer mr-1 shrink-0 whitespace-nowrap font-bold shadow-2xs"
                >
                  تغییر کاربر
                </button>
              )}

              {/* Theme Mode Toggle (Dark Mode / Light Mode) */}
              {onToggleTheme && (
                <button
                  type="button"
                  onClick={onToggleTheme}
                  title={theme === 'light' ? 'تغییر به تم تاریک (دارک مد)' : 'تغییر به تم روشن با فونت مشکی (لایت مد)'}
                  className={`text-xs p-1 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg transition-all border flex items-center gap-1.5 cursor-pointer shrink-0 ${
                    theme === 'light'
                      ? 'bg-amber-200/90 hover:bg-amber-300/90 text-amber-950 border-amber-400 font-bold shadow-2xs'
                      : 'bg-amber-100/80 hover:bg-amber-200/90 text-amber-900 border-amber-300 font-bold shadow-2xs'
                  }`}
                  aria-label={theme === 'light' ? 'فعال‌سازی حالت شب' : 'فعال‌سازی حالت روز'}
                >
                  {theme === 'light' ? (
                    <>
                      <Moon className="w-3.5 h-3.5 text-indigo-800" />
                      <span className="hidden md:inline text-[11px] font-bold text-slate-900">تم شب</span>
                    </>
                  ) : (
                    <>
                      <Sun className="w-3.5 h-3.5 text-amber-700" />
                      <span className="hidden md:inline text-[11px] font-bold text-slate-900">تم روز</span>
                    </>
                  )}
                </button>
              )}

              {/* Logout Button */}
              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  title="خروج از حساب کاربری"
                  className="text-[10px] sm:text-xs p-1 sm:px-2 sm:py-1 rounded-md sm:rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-900 hover:text-rose-950 transition-colors border border-rose-300 flex items-center gap-1 cursor-pointer shrink-0 font-bold shadow-2xs"
                >
                  <LogOut className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-800" />
                  <span className="hidden sm:inline">خروج</span>
                </button>
              )}
            </div>
          </div>

        </div>

      </div>
    </header>
  );
};

