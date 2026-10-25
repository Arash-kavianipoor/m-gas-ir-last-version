import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Boxes,
  ArrowLeftRight,
  Users,
  Truck,
  FileText,
  Layers,
  Send,
  ShieldCheck,
  HardDriveDownload,
  Building2,
  Flame,
  X,
  UserCheck,
  LogOut,
  Monitor,
  Database,
  Cloud,
  Wifi,
  WifiOff,
  Server,
  Activity,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  PanelRightClose,
  PanelRightOpen,
  Printer,
  Lock,
  PackageCheck,
  Sun,
  Moon,
  KeyRound
} from 'lucide-react';
import { RuntimeEnvironment, User, SyncState } from '../types';
import { toPersianDigits } from '../utils/persian';
import { triggerFileDownload } from '../utils/file-download';
import { SyncEngine } from '../sync-engine/sync-client';

export type NavTab =
  | 'dashboard'
  | 'users_management'
  | 'tri_sync'
  | 'cylinder_inspections'
  | 'gas_kardex'
  | 'gas_production_kardex'
  | 'inventory'
  | 'movements'
  | 'reports'
  | 'customers'
  | 'suppliers'
  | 'invoices'
  | 'sync_queue'
  | 'audit'
  | 'backup';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenSkuPrint?: () => void;
  currentEnv: RuntimeEnvironment;
  pendingCount: number;
  pendingInspectionsCount?: number;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  currentUser?: User | null;
  onSelectEnv?: (env: RuntimeEnvironment) => void;
  onLogout?: () => void;
  onSwitchUser?: () => void;
  onOpenSecurity?: () => void;
  onOpenUsersManagement?: () => void;
  onOpenWinCompat?: () => void;
  onOpenTroubleshooting?: () => void;
  onOpenWin11Troubleshooting?: () => void;
  isOfflineSimulated?: boolean;
  onToggleOffline?: () => void;
  isSyncing?: boolean;
  onSyncNow?: () => void;
  syncState?: SyncState;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  onOpenSkuPrint,
  currentEnv,
  pendingCount,
  pendingInspectionsCount = 0,
  isMobileOpen,
  onCloseMobile,
  currentUser,
  onSelectEnv,
  onLogout,
  onSwitchUser,
  onOpenSecurity,
  onOpenUsersManagement,
  onOpenWinCompat,
  onOpenTroubleshooting,
  onOpenWin11Troubleshooting,
  isOfflineSimulated = false,
  onToggleOffline,
  isSyncing = false,
  onSyncNow,
  syncState,
  theme = 'dark',
  onToggleTheme
}) => {
  const [isStatusMenuExpanded, setIsStatusMenuExpanded] = useState(false);
  const [countdown, setCountdown] = useState<number>(SyncEngine.getRemainingSeconds());

  useEffect(() => {
    if (activeTab === 'tri_sync') {
      setIsStatusMenuExpanded(true);
    }
  }, [activeTab]);

  useEffect(() => {
    const unsub = SyncEngine.subscribeCountdown((sec) => {
      setCountdown(sec);
    });
    return () => unsub();
  }, []);

  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  const toggleCollapse = () => {
    setIsCollapsed(prev => !prev);
  };

  const menuItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'داشبورد مدیریتی',
      icon: LayoutDashboard
    },
    {
      id: 'movements' as NavTab,
      label: 'ورود و خروج انبار و سیلندر',
      badge: pendingInspectionsCount > 0 ? `${toPersianDigits(pendingInspectionsCount)} در انتظار` : 'شمارش و گردش',
      highlight: true,
      icon: ArrowLeftRight
    },
    {
      id: 'gas_kardex' as NavTab,
      label: 'کاردکس تعمیر سیلندر',
      highlight: false,
      icon: Flame
    },
    {
      id: 'gas_production_kardex' as NavTab,
      label: 'کاردکس تولید ام گاز',
      highlight: true,
      icon: Boxes
    },
    {
      id: 'inventory' as NavTab,
      label: 'موجودی و کالاها',
      icon: Boxes
    },
    {
      id: 'reports' as NavTab,
      label: 'گزارش‌گیری و چاپ',
      icon: Printer
    },
    {
      id: 'customers' as NavTab,
      label: 'مشتریان و پرونده‌ها',
      icon: Users
    },
    {
      id: 'suppliers' as NavTab,
      label: 'تأمین‌کنندگان',
      icon: Truck
    },
    {
      id: 'invoices' as NavTab,
      label: 'فاکتور خرید و فروش',
      icon: FileText
    },
    {
      id: 'sync_queue' as NavTab,
      label: 'صف ارسال آفلاین',
      count: pendingCount,
      icon: Send
    },
    {
      id: 'audit' as NavTab,
      label: 'لاگ امنیت و ممیزی',
      icon: ShieldCheck
    },
    {
      id: 'backup' as NavTab,
      label: 'پشتیبان‌گیری SQLite',
      icon: HardDriveDownload
    },
    {
      id: 'tri_sync' as NavTab,
      label: 'همگام‌سازی ابری و کلاینت‌ها',
      highlight: true,
      icon: Activity,
      isStatusControl: true
    }
  ];

  const isHajivand = Boolean(
    (currentEnv === 'WAREHOUSE_WIN7' && (!currentUser || currentUser.role === 'WAREHOUSE_KEEPER')) ||
    (currentUser && (
      currentUser.username === 'hajivand' ||
      currentUser.username?.toLowerCase().includes('haji') ||
      currentUser.username === 'gholizadeh' ||
      currentUser.user_id === 'USR-003' ||
      currentUser.role === 'WAREHOUSE_KEEPER' ||
      currentUser.full_name?.includes('حاجی') ||
      currentUser.full_name?.includes('قلی زاده') ||
      currentUser.full_name?.includes('انباردار')
    ))
  );

  const isManagerAmouei = Boolean(
    currentUser && (
      currentUser.username === 'amouei' ||
      currentUser.user_id === 'USR-001' ||
      currentUser.role === 'ADMIN' ||
      currentUser.full_name?.includes('عمویی')
    )
  );

  const visibleMenuItems = menuItems.filter(item => {
    // Strictly hide Gas Kardex and Production Kardex from warehouse keeper Hajivand (no access, no view, no edit)
    if (isHajivand && (item.id === 'gas_kardex' || item.id === 'gas_production_kardex')) {
      return false;
    }
    return true;
  });

  const renderNavContent = (isMobile = false) => (
    <>
      {!isMobile && isCollapsed ? (
        <div className="p-2 border-b border-slate-800/80 bg-slate-950/40 flex flex-col items-center gap-2">
          <button
            onClick={toggleCollapse}
            className="w-10 h-10 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer bg-slate-900 border border-slate-700/60 shadow-sm"
            title="باز کردن پنل سایدبار"
          >
            <PanelRightOpen className="w-5 h-5 text-indigo-400" />
          </button>
        </div>
      ) : (
        <div className="p-2.5 px-3 border-b border-slate-800/80 bg-slate-950/40 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300">
            {currentEnv === 'OFFICE_WIN11'
              ? 'آفیس (ویندوز 11)'
              : currentEnv === 'WAREHOUSE_WIN7'
              ? 'انبار مرکزی (ویندوز 7)'
              : 'وب اپ ابری'}
          </span>
          <div className="flex items-center gap-1">
            {!isMobile && (
              <button
                onClick={toggleCollapse}
                className="px-2 py-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1 text-[11px] border border-slate-800 hover:border-slate-700"
                title="جمع کردن پنل سایدبار"
              >
                <PanelRightClose className="w-3.5 h-3.5 text-slate-300" />
                <span className="text-[10px] text-slate-300">جمع کردن</span>
              </button>
            )}
            {isMobile && onCloseMobile && (
              <button
                onClick={onCloseMobile}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                title="بستن منو"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}


      {/* Mobile-Only: User Profile Card & Actions */}
      {isMobile && currentUser && (
        <div className="p-3 border-b border-slate-800/80 bg-slate-950/60">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
              <UserCheck className="w-4 h-4 text-amber-400" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-slate-100 truncate">{currentUser.full_name}</div>
              <div className="text-[10px] text-amber-300/80 font-medium">
                {currentUser.role_title || (currentUser.role === 'ADMIN' ? 'مدیریت سامانه' : 'انباردار')}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5 pt-1">
            {onOpenSecurity && (
              <button
                onClick={() => {
                  if (onCloseMobile) onCloseMobile();
                  onOpenSecurity();
                }}
                className="col-span-2 px-2 py-1.5 rounded-lg bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-700/60 text-[11px] font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-center"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>تنظیمات امنیت دیتابیس و رمزها</span>
              </button>
            )}
            {onSwitchUser && (
              <button
                onClick={() => {
                  if (onCloseMobile) onCloseMobile();
                  onSwitchUser();
                }}
                className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-medium transition-colors cursor-pointer text-center"
              >
                تغییر کاربر
              </button>
            )}
            {onLogout && (
              <button
                onClick={() => {
                  if (onCloseMobile) onCloseMobile();
                  onLogout();
                }}
                className="px-2 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/60 text-[11px] font-medium transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>خروج</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Nav links */}
      <nav className={`flex-1 overflow-y-auto space-y-1 ${!isMobile && isCollapsed ? 'p-1.5' : 'p-2'}`}>
        {visibleMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id || (item.id === 'movements' && activeTab === 'cylinder_inspections');
          const isStatusItem = item.id === 'tri_sync';

          if (!isMobile && isCollapsed) {
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                title={item.label + (item.badge ? ` (${item.badge})` : '')}
                className={`w-full flex items-center justify-center p-2.5 rounded-xl text-xs font-medium transition-all relative cursor-pointer group ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : item.highlight
                    ? theme === 'light'
                      ? 'text-indigo-900 hover:bg-slate-100 bg-indigo-50 border border-indigo-200'
                      : 'text-indigo-300 hover:bg-slate-800 hover:text-white bg-indigo-950/20'
                    : theme === 'light'
                    ? 'text-slate-700 hover:bg-slate-100 hover:text-black'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${
                  isActive
                    ? 'text-white'
                    : item.highlight
                    ? (theme === 'light' ? 'text-indigo-600' : 'text-indigo-400')
                    : (theme === 'light' ? 'text-slate-600' : 'text-slate-400')
                }`} />

                {item.count !== undefined && item.count > 0 ? (
                  <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-amber-500 text-slate-950 font-bold text-[9px] flex items-center justify-center border-2 border-slate-900">
                    {toPersianDigits(item.count)}
                  </span>
                ) : item.badge ? (
                  <span className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ${
                    theme === 'light' ? 'bg-amber-400 ring-2 ring-white' : 'bg-amber-400 ring-2 ring-slate-900'
                  }`} />
                ) : null}
              </button>
            );
          }

          return (
            <div key={item.id} className="space-y-1">
              <button
                onClick={() => {
                  onSelectTab(item.id);
                  if (isStatusItem) {
                    setIsStatusMenuExpanded(prev => !prev);
                  }
                  if (isMobile && onCloseMobile && !isStatusItem) {
                    onCloseMobile();
                  }
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : item.highlight
                    ? theme === 'light'
                      ? 'text-indigo-900 hover:bg-slate-100 hover:text-black bg-indigo-50/80 border border-indigo-200'
                      : 'text-indigo-300 hover:bg-slate-800/80 hover:text-white bg-indigo-950/20'
                    : theme === 'light'
                    ? 'text-slate-800 hover:bg-slate-100 hover:text-black'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${
                    isActive
                      ? 'text-white'
                      : item.highlight
                      ? (theme === 'light' ? 'text-indigo-600' : 'text-indigo-400')
                      : (theme === 'light' ? 'text-slate-600' : 'text-slate-400')
                  }`} />
                  <span className={`font-semibold ${
                    isActive
                      ? 'text-white'
                      : theme === 'light'
                      ? 'text-slate-900'
                      : 'text-slate-200'
                  }`}>{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.badge && (
                    <span
                      style={
                        !isActive
                          ? { color: '#facc15' }
                          : undefined
                      }
                      className={`text-[9px] px-1.5 py-0.5 rounded font-bold transition-all shadow-xs ${
                        isActive
                          ? (theme === 'light' ? 'bg-amber-400 text-slate-950 font-black border border-amber-300' : 'bg-white/20 text-white')
                          : theme === 'light'
                          ? 'bg-slate-900 !text-yellow-400 border border-amber-400 font-extrabold shadow-sm'
                          : 'bg-slate-900/90 !text-yellow-400 border border-amber-500/50 font-extrabold shadow-xs'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}

                  {item.count !== undefined && item.count > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-bold">
                      {toPersianDigits(item.count)}
                    </span>
                  )}

                  {isStatusItem && (
                    <span className="text-slate-400 mr-0.5">
                      {isStatusMenuExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </span>
                  )}
                </div>
              </button>



              {/* Status Display Sub-menu: Groups all status and control items inside 'همگام‌سازی ابری و کلاینت‌ها' */}
              {isStatusItem && isStatusMenuExpanded && (
                <div className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800/90 space-y-2.5 my-1 shadow-inner">
                  {/* Responsive User Management & Password Change Button inside Cloud & Clients Sync section (Only for Engineer Mousa Amouei) */}
                  {(onOpenUsersManagement || onOpenSecurity) && isManagerAmouei && (
                    <div className="p-1 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-600/15 to-transparent border border-amber-500/30">
                      <button
                        type="button"
                        onClick={() => {
                          if (isMobile && onCloseMobile) onCloseMobile();
                          if (onOpenUsersManagement) {
                            onOpenUsersManagement();
                          } else if (onOpenSecurity) {
                            onOpenSecurity();
                          }
                        }}
                        className="w-full p-2 sm:p-2.5 rounded-lg bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-white flex items-center justify-between gap-2 text-xs font-bold transition-all shadow-md shadow-amber-600/20 border border-amber-400/40 cursor-pointer group text-right"
                        title="تغییر پسورد و ویرایش مشخصات کاربران (پنل اختصاصی مهندس موسی عمویی)"
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-md bg-black/25 flex items-center justify-center shrink-0 border border-white/20">
                            <KeyRound className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-100 group-hover:rotate-12 transition-transform duration-200" />
                          </div>
                          <div className="flex flex-col text-right min-w-0 flex-1">
                            <span className="text-[11px] sm:text-xs font-bold text-white truncate leading-tight">
                              تغییر پسورد و مشخصات کاربران
                            </span>
                            <span className="text-[9px] text-amber-100/90 truncate leading-tight mt-0.5">
                              پنل اختصاصی مهندس موسی عمویی
                            </span>
                          </div>
                        </div>
                        <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded bg-black/30 text-amber-200 border border-amber-300/30 font-mono shrink-0">
                          مدیریت
                        </span>
                      </button>
                    </div>
                  )}

                  {/* Item 1: Environment Switcher (Office Win11 / Warehouse Win7 / Cloud D1) */}
                  {onSelectEnv && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span className="font-medium">سوییچ محیط کاری (3 دیتابیس):</span>
                        <span className="text-[9px] text-indigo-400 font-mono">
                          {currentEnv === 'OFFICE_WIN11' ? 'Win 11' : currentEnv === 'WAREHOUSE_WIN7' ? 'Win 7' : 'Cloud D1'}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1.5 bg-slate-900/90 p-1.5 rounded-lg border border-slate-800 text-[11px]">
                        <button
                          onClick={() => onSelectEnv('OFFICE_WIN11')}
                          className={`w-full py-2 px-2.5 rounded-lg font-medium flex items-center justify-between transition-all cursor-pointer ${
                            currentEnv === 'OFFICE_WIN11'
                              ? 'bg-blue-600 text-white shadow'
                              : 'text-slate-300 hover:text-white hover:bg-slate-800'
                          }`}
                          title="ترمینال آفیس دفتر مرکزی (ویندوز 11 - SQLite)"
                        >
                          <div className="flex items-center gap-2">
                            <Monitor className="w-3.5 h-3.5 text-blue-400" />
                            <span className="font-semibold text-xs">ترمینال آفیس دفتر مرکزی</span>
                          </div>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/30 text-blue-200">Win 11</span>
                        </button>

                        <button
                          onClick={() => onSelectEnv('WAREHOUSE_WIN7')}
                          className={`w-full py-2 px-2.5 rounded-lg font-medium flex items-center justify-between transition-all cursor-pointer ${
                            currentEnv === 'WAREHOUSE_WIN7'
                              ? 'bg-amber-600 text-white shadow'
                              : 'text-slate-300 hover:text-white hover:bg-slate-800'
                          }`}
                          title="ترمینال انبار مرکزی (ویندوز 7 - SQLite)"
                        >
                          <div className="flex items-center gap-2">
                            <Database className="w-3.5 h-3.5 text-amber-400" />
                            <span className="font-semibold text-xs">ترمینال انبار مرکزی</span>
                          </div>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/30 text-amber-200">Win 7</span>
                        </button>

                        <button
                          onClick={() => onSelectEnv('CLOUD_WEB')}
                          className={`w-full py-2 px-2.5 rounded-lg font-medium flex items-center justify-between transition-all cursor-pointer ${
                            currentEnv === 'CLOUD_WEB'
                              ? 'bg-emerald-600 text-white shadow'
                              : 'text-slate-300 hover:text-white hover:bg-slate-800'
                          }`}
                          title="وب اپ سرور مرکزی (Cloudflare D1)"
                        >
                          <div className="flex items-center gap-2">
                            <Cloud className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="font-semibold text-xs">سرور ابری کلودفلر</span>
                          </div>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/30 text-emerald-200">Cloud D1</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Item 2: Offline / Online Simulation Toggle */}
                  {onToggleOffline && (
                    <button
                      onClick={onToggleOffline}
                      className={`w-full py-1.5 px-2 rounded-lg border text-[11px] font-medium flex items-center justify-between transition-all cursor-pointer ${
                        isOfflineSimulated
                          ? 'bg-rose-950/70 border-rose-700/60 text-rose-300 hover:bg-rose-900/60'
                          : 'bg-emerald-950/60 border-emerald-700/50 text-emerald-300 hover:bg-emerald-900/50'
                      }`}
                      title="شبیه‌سازی قطع اینترنت و کارکرد آفلاین انبار"
                    >
                      <div className="flex items-center gap-1.5">
                        {isOfflineSimulated ? (
                          <WifiOff className="w-3.5 h-3.5 text-rose-400" />
                        ) : (
                          <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                        <span>{isOfflineSimulated ? 'اتصال شبکه: آفلاین' : 'اتصال شبکه: آنلاین'}</span>
                      </div>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                        isOfflineSimulated ? 'bg-rose-900/80 text-rose-200' : 'bg-emerald-900/80 text-emerald-200'
                      }`}>
                        {isOfflineSimulated ? 'تست قطعی' : 'متصل'}
                      </span>
                    </button>
                  )}

                  {/* Items 3 & 4: Sync Status Badge + Manual Sync Now Button */}
                  <div className="flex items-center justify-between gap-1.5 bg-slate-900/90 border border-slate-800 p-2 rounded-lg text-xs">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {isSyncing ? (
                        <span className="flex items-center gap-1 text-amber-400 text-[11px]">
                          <RefreshCw className="w-3 h-3 animate-spin shrink-0" />
                          <span className="truncate">در حال تبادل...</span>
                        </span>
                      ) : syncState?.status === 'OFFLINE' || isOfflineSimulated ? (
                        <span className="flex items-center gap-1 text-rose-400 text-[11px]">
                          <WifiOff className="w-3 h-3 shrink-0" />
                          <span className="truncate">آفلاین</span>
                        </span>
                      ) : syncState?.status === 'SYNC_ERROR' ? (
                        <span className="flex items-center gap-1 text-rose-400 text-[11px]">
                          <AlertTriangle className="w-3 h-3 shrink-0" />
                          <span className="truncate">خطا در سینک</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-emerald-400 text-[11px]">
                          <CheckCircle2 className="w-3 h-3 shrink-0" />
                          <span className="truncate">همگام با کلودفلر</span>
                        </span>
                      )}

                      {pendingCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-bold text-[9px] shrink-0">
                          {toPersianDigits(pendingCount)} صف
                        </span>
                      )}
                    </div>

                    {onSyncNow && (
                      <button
                        onClick={onSyncNow}
                        disabled={isSyncing || isOfflineSimulated}
                        className={`py-1 px-2 rounded-md border text-[10px] font-medium flex items-center gap-1 transition-all ${
                          isSyncing || isOfflineSimulated
                            ? 'cursor-not-allowed bg-slate-200 border-slate-300 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 opacity-80'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500 shadow-sm cursor-pointer'
                        }`}
                        title="همگام‌سازی دستی فوری با سرور مرکزی"
                      >
                        <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                        <span>سینک دستی</span>
                      </button>
                    )}
                  </div>

                  {/* 20-Second HTTPS Sync Countdown Indicator */}
                  <div className="flex items-center justify-between px-2 py-1 bg-slate-950/70 border border-slate-800/80 rounded-md text-[10px] text-slate-400">
                    <div className="flex items-center gap-1">
                      <Lock className="w-3 h-3 text-cyan-400" />
                      <span className="text-slate-300">HTTPS رمزنگاری (۲۰s):</span>
                    </div>
                    <span className="font-mono text-cyan-300 font-bold">
                      {isSyncing ? 'ارسال...' : `${toPersianDigits(countdown)} ثانیه`}
                    </span>
                  </div>

                  {/* Item 5: Tri-Sync 3-Database Inspector & Win 7 Compatibility Buttons */}
                  <div className="grid grid-cols-2 gap-1 pt-0.5">
                    <button
                      onClick={() => {
                        onSelectTab('tri_sync');
                        if (isMobile && onCloseMobile) onCloseMobile();
                      }}
                      className="py-1 px-2 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-800/60 text-[10px] font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer text-center"
                      title="مشاهده وضعیت اتصال دیتابیس کلودفلر و ۱۵ کلاینت"
                    >
                      <Layers className="w-3 h-3" />
                      <span>شبکه ۱۵ کلاینت</span>
                    </button>

                    {onOpenWinCompat && (
                      <button
                        onClick={() => {
                          if (isMobile && onCloseMobile) onCloseMobile();
                          onOpenWinCompat();
                        }}
                        className="py-1 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700 text-[10px] font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer text-center"
                        title="راهنما و ابزار سازگاری ویندوز 7"
                      >
                        <Server className="w-3 h-3" />
                        <span>سازگاری Win 7</span>
                      </button>
                    )}

                    {onOpenTroubleshooting && (
                      <button
                        onClick={() => {
                          if (isMobile && onCloseMobile) onCloseMobile();
                          onOpenTroubleshooting();
                        }}
                        className="py-1 px-2 rounded-lg bg-amber-950/50 hover:bg-amber-900/60 text-amber-300 border border-amber-800/60 text-[10px] font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer text-center"
                        title="چک‌لیست پیش‌نیازها و راهنمای عیب‌یابی نصب در ویندوز 7"
                      >
                        <AlertTriangle className="w-3 h-3 text-amber-400" />
                        <span>عیب‌یابی Win 7</span>
                      </button>
                    )}

                    {onOpenWin11Troubleshooting && (
                      <button
                        onClick={() => {
                          if (isMobile && onCloseMobile) onCloseMobile();
                          onOpenWin11Troubleshooting();
                        }}
                        className="py-1 px-2 rounded-lg bg-blue-950/50 hover:bg-blue-900/60 text-blue-300 border border-blue-800/60 text-[10px] font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer text-center col-span-2"
                        title="راهنمای عیب‌یابی نصب، سیستم ثبت لاگ در همان پوشه و مجوزهای ویندوز 11"
                      >
                        <FileText className="w-3 h-3 text-blue-400" />
                        <span>راهنمای لاگ و اجرا (MGas Log)</span>
                      </button>
                    )}

                    {/* Direct Native Installers & Current System Database Download */}
                    <div className="col-span-2 pt-1.5 space-y-1">
                      {/* Download Database of Current System */}
                      <a
                        href="/mgas_local.db"
                        download="mgas_local.db"
                        onClick={(e) => triggerFileDownload('/mgas_local.db', 'mgas_local.db', e)}
                        className="w-full py-1.5 px-2 rounded-lg bg-indigo-950/70 hover:bg-indigo-900/80 text-indigo-300 hover:text-white border border-indigo-700/60 text-[10px] font-bold flex items-center justify-center gap-1.5 transition-colors text-center shadow-sm cursor-pointer"
                        title="دانلود مستقیم فایل SQLite دیتابیس سیستم فعال (mgas_local.db)"
                      >
                        <Database className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span>دانلود دیتابیس محلی این سیستم (mgas_local.db)</span>
                      </a>

                      <a
                        href="/downloads/MGas-Inventory-Windows-64bit-Setup.exe"
                        download="MGas-Inventory-Windows-64bit-Setup.exe"
                        onClick={(e) => triggerFileDownload('/downloads/MGas-Inventory-Windows-64bit-Setup.exe', 'MGas-Inventory-Windows-64bit-Setup.exe', e)}
                        className="w-full py-1.5 px-2 rounded-lg bg-emerald-900/40 hover:bg-emerald-800/60 text-emerald-300 hover:text-emerald-100 border border-emerald-700/60 text-[10px] font-bold flex items-center justify-between gap-1 transition-colors shadow-sm cursor-pointer"
                        title="دانلود نصاب رسمی نسخه ۶۴ بیتی ویندوز ۱۰ و ۱۱ با همگام‌سازی زنده دیتابیس مرکزی"
                      >
                        <span className="flex items-center gap-1.5">
                          <HardDriveDownload className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>نصاب ویندوز ۶۴ بیتی (۱۰ و ۱۱)</span>
                        </span>
                        <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">x64</span>
                      </a>

                      <a
                        href="/downloads/MGas-Inventory-Windows-32bit-Setup.exe"
                        download="MGas-Inventory-Windows-32bit-Setup.exe"
                        onClick={(e) => triggerFileDownload('/downloads/MGas-Inventory-Windows-32bit-Setup.exe', 'MGas-Inventory-Windows-32bit-Setup.exe', e)}
                        className="w-full py-1.5 px-2 rounded-lg bg-cyan-950/50 hover:bg-cyan-900/60 text-cyan-300 hover:text-cyan-100 border border-cyan-700/60 text-[10px] font-bold flex items-center justify-between gap-1 transition-colors shadow-sm cursor-pointer"
                        title="دانلود نصاب رسمی نسخه ۳۲ بیتی ویندوز ۷، ۸، ۱۰ و ۱۱ با همگام‌سازی زنده دیتابیس مرکزی"
                      >
                        <span className="flex items-center gap-1.5">
                          <HardDriveDownload className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span>نصاب ویندوز ۳۲ بیتی (ویندوز ۷)</span>
                        </span>
                        <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">x86</span>
                      </a>

                      <div className="pt-1 border-t border-slate-800/80 flex items-center gap-1 text-[9px] text-slate-400">
                        <span>نسخه‌های پرتابل (بدون نیاز به نصب):</span>
                        <a
                          href="/downloads/MGas-Inventory-Windows-64bit-Portable.zip"
                          download="MGas-Inventory-Windows-64bit-Portable.zip"
                          onClick={(e) => triggerFileDownload('/downloads/MGas-Inventory-Windows-64bit-Portable.zip', 'MGas-Inventory-Windows-64bit-Portable.zip', e)}
                          className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono hover:text-white"
                          title="دانلود بسته پرتابل ۶۴ بیتی"
                        >
                          ZIP 64
                        </a>
                        <a
                          href="/downloads/MGas-Inventory-Windows-32bit-Portable.zip"
                          download="MGas-Inventory-Windows-32bit-Portable.zip"
                          onClick={(e) => triggerFileDownload('/downloads/MGas-Inventory-Windows-32bit-Portable.zip', 'MGas-Inventory-Windows-32bit-Portable.zip', e)}
                          className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono hover:text-white"
                          title="دانلود بسته پرتابل ۳۲ بیتی"
                        >
                          ZIP 32
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer info */}
      {!isMobile && isCollapsed ? (
        <div className="p-2 border-t border-slate-800/80 bg-slate-950/60 flex flex-col items-center gap-1.5 justify-center">
          {onToggleTheme && (
            <button
              type="button"
              onClick={onToggleTheme}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                theme === 'light' ? 'text-amber-700 hover:bg-slate-200' : 'text-amber-400 hover:text-white hover:bg-slate-800'
              }`}
              title={theme === 'light' ? 'تغییر به تم تاریک' : 'تغییر به تم روشن'}
            >
              {theme === 'light' ? <Moon className="w-4 h-4 text-indigo-700" /> : <Sun className="w-4 h-4 text-amber-400" />}
            </button>
          )}
          <button
            onClick={toggleCollapse}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="گسترش و باز کردن پنل سایدبار"
          >
            <PanelRightOpen className="w-4 h-4 text-slate-400 hover:text-indigo-400" />
          </button>
        </div>
      ) : (
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/60 text-[11px] text-slate-400 space-y-2">
          {onToggleTheme && (
            <button
              type="button"
              onClick={onToggleTheme}
              className={`w-full py-1.5 px-2.5 rounded-lg flex items-center justify-between text-xs font-semibold transition-all border cursor-pointer ${
                theme === 'light'
                  ? 'bg-amber-100 hover:bg-amber-200 text-amber-950 border-amber-300 shadow-2xs'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-800'
              }`}
              title={theme === 'light' ? 'فعال‌سازی تم تاریک (دارک مد)' : 'فعال‌سازی تم روشن با فونت مشکی (لایت مد)'}
            >
              <div className="flex items-center gap-1.5">
                {theme === 'light' ? (
                  <Moon className="w-4 h-4 text-indigo-700" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-400" />
                )}
                <span>{theme === 'light' ? 'تم روشن (لایت مد)' : 'تم تاریک (دارک مد)'}</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                theme === 'light' ? 'bg-amber-200/80 text-amber-950' : 'bg-slate-800 text-slate-300'
              }`}>
                {theme === 'light' ? 'روز' : 'شب'}
              </span>
            </button>
          )}

          <div className="flex items-center justify-between text-slate-500 text-[10px]">
            <span>معماری همگام‌سازی D1</span>
            {!isMobile ? (
              <button
                onClick={toggleCollapse}
                className="px-2 py-0.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer flex items-center gap-1 transition-colors border border-transparent hover:border-slate-700"
                title="جمع کردن پنل سایدبار"
              >
                <PanelRightClose className="w-3 h-3 text-slate-400" />
                <span>جمع کردن</span>
              </button>
            ) : (
              <span className="font-mono">v2.4.0</span>
            )}
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col bg-slate-900/95 border-l border-slate-800 text-slate-300 shrink-0 min-h-[calc(100vh-65px)] select-none transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {renderNavContent(false)}
      </aside>

      {/* Mobile Drawer Backdrop & Drawer */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 md:hidden cursor-pointer"
          onClick={onCloseMobile}
        >
          <aside
            className="fixed inset-y-0 right-0 z-50 w-72 max-w-[85vw] bg-slate-900 border-l border-slate-800 text-slate-300 flex flex-col shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {renderNavContent(true)}
          </aside>
        </div>
      )}
    </>
  );
};
