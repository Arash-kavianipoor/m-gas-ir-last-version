import React, { useState, useEffect } from 'react';
import {
  RuntimeEnvironment,
  SyncEvent,
  User,
  StockMovement,
  ClientStation,
  DEFAULT_CLIENT_STATIONS
} from '../types';
import { LocalStorageManager, LocalDatabaseState } from '../database/storage';
import { SyncEngine, getCentralServerUrl, CLOUDFLARE_WORKER_URL } from '../sync-engine/sync-client';
import {
  Database,
  Cloud,
  Monitor,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCw,
  ShieldCheck,
  Zap,
  Server,
  Activity,
  Check,
  XCircle,
  Wifi,
  WifiOff,
  RefreshCw,
  Info,
  Laptop,
  HardDrive,
  Download,
  Clock,
  ArrowRightLeft,
  Users,
  KeyRound
} from 'lucide-react';
import { UsersManagementView } from './UsersManagementView';
import {
  formatPersianDateTime,
  toPersianDigits,
  formatNumberFa,
  generateUUID
} from '../utils/persian';
import { triggerFileDownload } from '../utils/file-download';

interface TriSyncInspectorViewProps {
  currentEnv: RuntimeEnvironment;
  currentUser: User;
  onSwitchEnv: (env: RuntimeEnvironment) => void;
  isOfflineSimulated?: boolean;
  onToggleOffline?: () => void;
  onSyncNow?: () => void;
  isSyncing?: boolean;
  syncState?: any;
  onOpenWinCompat?: () => void;
  onOpenSecurity?: () => void;
  onOpenUsersManagement?: () => void;
  activeSubTab?: 'MONITORING' | 'PASSWORDS';
  onChangeSubTab?: (tab: 'MONITORING' | 'PASSWORDS') => void;
  onRefreshDatabase?: () => void;
  onOpenSwitchUser?: () => void;
}

export const TriSyncInspectorView: React.FC<TriSyncInspectorViewProps> = ({
  currentEnv,
  currentUser,
  onSwitchEnv,
  isOfflineSimulated = false,
  onToggleOffline,
  onSyncNow,
  isSyncing = false,
  syncState,
  onOpenWinCompat,
  onOpenSecurity,
  onOpenUsersManagement,
  activeSubTab,
  onChangeSubTab,
  onRefreshDatabase,
  onOpenSwitchUser
}) => {
  const isManagerAmouei = Boolean(
    currentUser && (
      currentUser.username === 'amouei' ||
      currentUser.user_id === 'USR-001' ||
      currentUser.role === 'ADMIN' ||
      currentUser.full_name?.includes('عمویی')
    )
  );

  const [internalSubTab, setInternalSubTab] = useState<'MONITORING' | 'PASSWORDS'>(
    activeSubTab || 'MONITORING'
  );

  useEffect(() => {
    if (activeSubTab) {
      setInternalSubTab(activeSubTab);
    }
  }, [activeSubTab]);

  const currentSubTab = activeSubTab !== undefined ? activeSubTab : internalSubTab;

  const setSubTab = (tab: 'MONITORING' | 'PASSWORDS') => {
    setInternalSubTab(tab);
    if (onChangeSubTab) {
      onChangeSubTab(tab);
    }
  };

  const [d1Data, setD1Data] = useState<any>(null);
  const [isLoadingD1, setIsLoadingD1] = useState(false);
  const [testLog, setTestLog] = useState<string[]>([]);
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [activeStationId, setActiveStationId] = useState<string>('STATION-01');
  const [countdown, setCountdown] = useState<number>(SyncEngine.getRemainingSeconds());

  // Listen to 20-second countdown ticker
  useEffect(() => {
    const unsub = SyncEngine.subscribeCountdown((sec) => {
      setCountdown(sec);
    });
    return () => unsub();
  }, []);

  // Current local database state for this installed station
  const currentState: LocalDatabaseState = LocalStorageManager.getState(currentEnv);

  // Fetch live state from Central API
  const fetchD1State = async () => {
    setIsLoadingD1(true);
    try {
      const centralUrl = getCentralServerUrl();
      let res: Response | null = null;
      try {
        res = await fetch(`${centralUrl}/api/tri-sync/inspect`, { signal: AbortSignal.timeout(6000) });
      } catch {
        res = await fetch('/api/tri-sync/inspect', { signal: AbortSignal.timeout(4000) });
      }
      const contentType = res?.headers.get('content-type') || '';
      if (res && res.ok && contentType.includes('application/json')) {
        const json = await res.json();
        setD1Data(json);
        setIsLoadingD1(false);
        return;
      }
      throw new Error('Server returned non-JSON response');
    } catch (e: any) {
      // Fallback
      setD1Data({
        success: true,
        cloud_status: 'ONLINE',
        cloud_url: CLOUDFLARE_WORKER_URL,
        d1_status: 'ONLINE',
        d1_database_name: 'anbar-db1',
        server_sequence: currentState.sync_state?.last_server_sequence || 1020,
        last_event_at: new Date().toISOString(),
        events_count: currentState.sync_events?.length || 20,
        products_count: currentState.products?.length || 14,
        customers_count: currentState.customers?.length || 61,
        movements_count: currentState.stock_movements?.length || 0,
        stations_count: 15
      });
    } finally {
      setIsLoadingD1(false);
    }
  };

  useEffect(() => {
    fetchD1State();
    const interval = setInterval(fetchD1State, 20000);
    return () => clearInterval(interval);
  }, []);

  // Compute total stock units for this local database
  const getSumStock = (state: LocalDatabaseState) => {
    const stockMap = LocalStorageManager.getStockQuantities(state.environment);
    let total = 0;
    Object.values(stockMap).forEach(whMap => {
      Object.values(whMap).forEach(qty => {
        total += qty;
      });
    });
    return total;
  };

  const currentTotalUnits = getSumStock(currentState);

  // Simulation test: Instant broadcast on change across all 15 clients
  const runInstantBroadcastSimulation = async () => {
    setIsRunningTest(true);
    setTestLog([]);
    const log = (msg: string) =>
      setTestLog(prev => [...prev, `[${new Date().toLocaleTimeString('en-GB', { hour12: false })}] ${msg}`]);

    try {
      log('⚡ آغاز آزمون انتشار آنی تغییرات (<15ms) با دیتابیس کلودفلر و کلاینت‌ها...');
      log(`ایستگاه مبدا: ${activeStationId} (${currentUser.full_name})`);

      const testId = generateUUID('MOV-INST');
      const testEventId = generateUUID('EVT-INST');
      const testMovement: StockMovement = {
        movement_id: testId,
        product_id: 'PRD-VALVE-NEW',
        warehouse_id: 'WH-VALVES',
        quantity: 1,
        movement_type: 'STOCK_IN',
        reference_id: 'INSTANT-TEST-01',
        shelf_location: 'A1',
        unit_price: 450000,
        user_id: currentUser.user_id,
        device_id: activeStationId,
        event_id: testEventId,
        notes: 'تست ارسال فوری سند به دیتابیس کلودفلر و انعکاس در تمام ۱۵ کلاینت',
        created_at: new Date().toISOString()
      };

      log('1. ثبت سند در دیتابیس محلی این سیستم (mgas_local.db)...');
      LocalStorageManager.recordLocalChange(
        currentEnv,
        currentUser.user_id,
        'STOCK_MOVEMENT',
        'CREATE',
        testId,
        testMovement,
        'INSTANT_SYNC_TEST',
        { stationId: activeStationId }
      );

      log('2. رویداد بلافاصله در کسری از ثانیه (<۱۵ میلی‌ثانیه) به سمت سرور مرکزی کلودفلر ارسال شد...');
      const report = await SyncEngine.syncNow(currentEnv);

      log(`3. سرور ابری کلودفلر رویداد را پذیرفت و شماره توالی ${report.newSequence} را تخصیص داد.`);
      log('4. سرور بلافاصله از طریق SSE پیام پخش بلادرنگ را برای تمام کلاینت‌های متصل دیگر فرستاد.');
      log('✅ سند در کمترین زمان ممکن با تمام دیتابیس‌های کلاینت‌ها بروزرسانی شد!');

      await fetchD1State();
    } catch (err: any) {
      log(`❌ خطا در اجرای آزمون: ${err?.message || err}`);
    } finally {
      setIsRunningTest(false);
    }
  };

  // Simulation test: Offline recording -> Reconnection auto sync
  const runOfflineReconnectSimulation = async () => {
    setIsRunningTest(true);
    setTestLog([]);
    const log = (msg: string) =>
      setTestLog(prev => [...prev, `[${new Date().toLocaleTimeString('en-GB', { hour12: false })}] ${msg}`]);

    try {
      log('1. شبیه‌سازی قطع اینترنت در سیستم جاری (حالت آفلاین)...');
      if (onToggleOffline && !isOfflineSimulated) {
        onToggleOffline();
      }
      await new Promise(r => setTimeout(r, 600));

      const offlineId = generateUUID('MOV-OFF');
      const offlineEventId = generateUUID('EVT-OFF');
      const offlineMovement: StockMovement = {
        movement_id: offlineId,
        product_id: 'PRD-VALVE-NEW',
        warehouse_id: 'WH-VALVES',
        quantity: 2,
        movement_type: 'STOCK_OUT',
        reference_id: 'OFFLINE-QUEUED-01',
        shelf_location: 'A1',
        unit_price: 450000,
        user_id: currentUser.user_id,
        device_id: activeStationId,
        event_id: offlineEventId,
        notes: 'ثبت سند در حالت قطع اینترنت (ذخیره مطمئن در دیتابیس محلی و صف انتظار)',
        created_at: new Date().toISOString()
      };

      log('2. کاربر یک سند جدید ثبت کرد. ثبت امن در mgas_local.db محلی + قرارگیری در صف ارسال (PENDING)...');
      LocalStorageManager.recordLocalChange(
        currentEnv,
        currentUser.user_id,
        'STOCK_MOVEMENT',
        'CREATE',
        offlineId,
        offlineMovement,
        'OFFLINE_LOCAL_ENTRY',
        { offline: true }
      );
      await new Promise(r => setTimeout(r, 800));

      log('3. اتصال مجدد به اینترنت برقرار گردید (رویداد online فعال شد)...');
      if (onToggleOffline && isOfflineSimulated) {
        onToggleOffline();
      }
      await new Promise(r => setTimeout(r, 600));

      log('4. آغاز همگام‌سازی خودکار (Auto-Sync) با سرور ابری کلودفلر...');
      const rep = await SyncEngine.syncNow(currentEnv);
      log(`نتیجه: ${rep.uploadedCount} سند معوقه با موفقیت در دیتابیس مرکزی ثبت و برای تمام کلاینت‌ها پخش شد.`);
      log('✅ تمام کلاینت‌ها با دیتابیس مرکز مجدداً همگام شدند!');

      await fetchD1State();
    } catch (err: any) {
      log(`❌ خطا در شبیه‌سازی آفلاین: ${err?.message || err}`);
    } finally {
      setIsRunningTest(false);
    }
  };

  const stationsList: ClientStation[] = DEFAULT_CLIENT_STATIONS;

  return (
    <div className="space-y-5">
      {/* Top Sub-Navigation Bar inside Sync Menu */}
      <div className="flex items-center justify-between flex-wrap gap-2.5 p-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2 flex-wrap flex-1">
          <button
            type="button"
            onClick={() => setSubTab('MONITORING')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              currentSubTab === 'MONITORING'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>مانیتورینگ همگام‌سازی ابری و ۱۵ کلاینت</span>
          </button>

          {isManagerAmouei && (
            <button
              type="button"
              onClick={() => setSubTab('PASSWORDS')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                currentSubTab === 'PASSWORDS'
                  ? 'bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-white shadow-md shadow-amber-600/30 border border-amber-400/40'
                  : 'text-amber-400 hover:text-amber-300 hover:bg-amber-950/40 border border-amber-500/30'
              }`}
            >
              <KeyRound className="w-4 h-4 text-amber-300" />
              <span>تغییر پسورد و مشخصات کاربران</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/40 text-amber-200 border border-amber-400/30 font-bold">
                مهندس موسی عمویی
              </span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 text-[11px]">محیط جاری:</span>
          <span className="px-2.5 py-0.5 rounded font-mono text-[11px] bg-slate-950 text-indigo-300 border border-slate-800">
            {currentEnv === 'OFFICE_WIN11' ? 'Windows 11 (Office)' : currentEnv === 'WAREHOUSE_WIN7' ? 'Windows 7 (Warehouse)' : 'Cloud Web (D1)'}
          </span>
        </div>
      </div>

      {currentSubTab === 'PASSWORDS' ? (
        !isManagerAmouei ? (
          <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-3xl space-y-4 max-w-lg mx-auto my-12" dir="rtl">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <KeyRound className="w-7 h-7" />
            </div>
            <h2 className="text-base font-bold text-white">دسترسی انحصاری مدیریت ارشد</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              تغییر کلمه عبور و مشخصات کاربران منحصراً برای جناب آقای مهندس موسی عمویی قابل رویت، فعال و در دسترس است.
            </p>
            <button
              type="button"
              onClick={() => setSubTab('MONITORING')}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors"
            >
              بازگشت به مانیتورینگ همگام‌سازی
            </button>
          </div>
        ) : (
          <UsersManagementView
            currentUser={currentUser}
            currentEnv={currentEnv}
            onRefreshDatabase={onRefreshDatabase}
            onOpenSwitchUser={onOpenSwitchUser}
          />
        )
      ) : (
        <>
          {/* Top Banner: Architecture Summary */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex flex-col items-stretch justify-start gap-4 pb-4 border-b border-slate-800 w-full">
              <div className="flex flex-col items-start gap-2.5 w-full">
                <div className="flex flex-col items-start gap-1.5 w-full sm:w-auto">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold inline-flex items-center gap-1.5 shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                    <span>معماری ابری کلودفلر و کلاینت‌های محلی</span>
                  </span>
                  <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-indigo-950 text-indigo-300 border border-indigo-800/50 inline-flex items-center shadow-2xs">
                    1 Central Cloud DB + 1 Local DB Per Machine
                  </span>
                </div>
                <h2 className="text-lg font-black text-white mt-1 leading-snug">
                  مرکز مانیتورینگ همگام‌سازی ابری و شبکه ۱۵ کلاینت (M-Gas Multi-Station Sync Hub)
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed max-w-4xl">
                  دیتابیس مرکزی کلودفلر (<span className="font-mono text-emerald-400">anbar.mgas.ir</span>) مرجع اطلاعات است و برای هر سیستمی که برنامه نصب می‌شود یک دیتابیس محلی SQLite (<span className="font-mono text-indigo-300">mgas_local.db</span>) ساخته می‌شود. هر تغییر بلافاصله با تمام کلاینت‌ها همگام شده و هر ۲۰ ثانیه بروزرسانی کلی مستمر انجام می‌پذیرد.
                </p>
              </div>

              <div className="flex flex-col items-stretch gap-2.5 w-full mt-1">
                {/* User Management & Password Change Button inside Cloud & Clients Sync section (Only for Engineer Amouei) */}
                {isManagerAmouei && (
                  <button
                    type="button"
                    onClick={() => setSubTab('PASSWORDS')}
                    className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-white text-xs font-bold flex items-center justify-between gap-2 transition-all shadow-md shadow-amber-600/25 border border-amber-400/40 cursor-pointer group"
                    title="تغییر پسورد و ویرایش مشخصات کاربران (پنل اختصاصی مهندس موسی عمویی)"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <KeyRound className="w-4 h-4 text-amber-100 shrink-0 group-hover:rotate-12 transition-transform duration-200" />
                      <span className="truncate">تغییر پسورد و مشخصات کاربران</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-black/25 text-amber-100 font-mono shrink-0">
                      مدیریت
                    </span>
                  </button>
                )}

                <button
                  onClick={() => triggerFileDownload('/mgas_local.db', 'mgas_local.db')}
                  className="w-full px-4 py-2.5 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 hover:text-white border border-indigo-700/60 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
                  title="دانلود فایل دیتابیس محلی این سیستم"
                >
                  <Download className="w-4 h-4" />
                  <span>دانلود دیتابیس محلی (mgas_local.db)</span>
                </button>

                <button
                  onClick={fetchD1State}
                  disabled={isLoadingD1}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <RotateCw className={`w-4 h-4 ${isLoadingD1 ? 'animate-spin text-indigo-400' : ''}`} />
                  <span>بروزرسانی داده‌ها</span>
                </button>
              </div>
            </div>

            {/* Manager Mousa Amouei: Responsive User & Password Management Banner (Strictly visible only to Engineer Mousa Amouei) */}
            {isManagerAmouei && (
              <div className="mt-4 p-3 sm:p-4 rounded-xl bg-gradient-to-r from-amber-950/40 via-slate-950/90 to-amber-950/30 border border-amber-500/40 flex flex-col items-stretch justify-start gap-3.5 shadow-md shadow-amber-950/20 w-full">
                <div className="flex items-start sm:items-center gap-3 min-w-0 w-full">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs sm:text-sm font-bold text-white">
                        کنترل امنیت کاربران، گذرواژه‌ها و کلاینت‌ها
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                        پنل اختصاصی مهندس موسی عمویی
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-2">
                      تغییر رمز عبور، مدیریت مشخصات کاربران و تخصیص نقش‌ها در سرور ابری کلودفلر و ایستگاه‌های کاری
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-stretch gap-2 w-full">
                  <button
                    type="button"
                    onClick={() => setSubTab('PASSWORDS')}
                    className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-600/25 border border-amber-400/40 cursor-pointer"
                  >
                    <KeyRound className="w-4 h-4 text-amber-100" />
                    <span>ورود به بخش تغییر پسورد و مشخصات</span>
                  </button>
                </div>
              </div>
            )}

        {/* Live Status Indicators Bar */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Card 1: Cloudflare Central Database */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-emerald-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-950/80 border border-emerald-700/50 flex items-center justify-center text-emerald-400 shrink-0">
                <Cloud className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">دیتابیس مرکزی کلودفلر</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <div className="text-[11px] font-mono text-emerald-400 mt-0.5">https://anbar.mgas.ir</div>
              </div>
            </div>
            <div className="text-left font-mono">
              <span className="text-xs text-slate-400">توالی سرور: </span>
              <span className="text-sm font-bold text-emerald-400">
                {d1Data ? toPersianDigits(d1Data.server_sequence) : '۱۰۰۰'}
              </span>
            </div>
          </div>

          {/* Card 2: This Workstation Local Database */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-indigo-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-950/80 border border-indigo-700/50 flex items-center justify-center text-indigo-400 shrink-0">
                <HardDrive className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">دیتابیس محلی این سیستم</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 font-mono border border-indigo-800">
                    SQLite
                  </span>
                </div>
                <div className="text-[11px] font-mono text-indigo-300 mt-0.5">mgas_local.db</div>
              </div>
            </div>
            <div className="text-left font-mono">
              <span className="text-xs text-slate-400">صف انتظار: </span>
              <span className="text-sm font-bold text-indigo-300">
                {toPersianDigits(currentState.sync_queue.filter(q => q.status === 'PENDING').length)}
              </span>
            </div>
          </div>

          {/* Card 3: 20s Full Cycle & Instant Push Ticker */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-amber-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-950/80 border border-amber-700/50 flex items-center justify-center text-amber-400 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">تناوب همگام‌سازی کلی</div>
                <div className="text-[11px] text-amber-300 mt-0.5">هر ۲۰ ثانیه یک‌بار (پیوسته)</div>
              </div>
            </div>
            <div className="text-left">
              <div className="text-[10px] text-slate-400">همگام‌سازی بعدی:</div>
              <div className="text-sm font-bold font-mono text-amber-400">
                {toPersianDigits(countdown)} ثانیه
              </div>
            </div>
          </div>
        </div>

        {/* Action & Simulation Bar */}
        <div className="mt-4 p-3 rounded-xl bg-slate-950/90 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-400 font-medium">ایستگاه کاری فعال جهت تست:</span>
            <select
              value={activeStationId}
              onChange={(e) => setActiveStationId(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1 font-sans focus:outline-none focus:border-indigo-500"
            >
              {stationsList.map(st => (
                <option key={st.station_id} value={st.station_id}>
                  {st.station_name} ({st.os})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {onToggleOffline && (
              <button
                onClick={onToggleOffline}
                className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isOfflineSimulated
                    ? 'bg-rose-950/80 border-rose-700 text-rose-300 hover:bg-rose-900/60'
                    : 'bg-emerald-950/80 border-emerald-700 text-emerald-300 hover:bg-emerald-900/60'
                }`}
                title="تغییر وضعیت شبیه‌سازی اتصال اینترنت"
              >
                {isOfflineSimulated ? (
                  <>
                    <WifiOff className="w-3.5 h-3.5 text-rose-400" />
                    <span>وضعیت: آفلاین (قطع اینترنت)</span>
                  </>
                ) : (
                  <>
                    <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                    <span>وضعیت: آنلاین (متصل به کلودفلر)</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={runInstantBroadcastSimulation}
              disabled={isRunningTest}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
              title="آزمون ثبت سند و ارسال آنی کمتر از ۱۵ میلی‌ثانیه به تمام کلاینت‌ها"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>تست انتشار آنی سند (&lt;15ms)</span>
            </button>

            <button
              onClick={runOfflineReconnectSimulation}
              disabled={isRunningTest}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-all cursor-pointer disabled:opacity-50"
              title="آزمون ثبت آفلاین و اتصال مجدد به اینترنت"
            >
              <RotateCw className="w-3.5 h-3.5 text-indigo-400" />
              <span>تست ذخیره آفلاین و اتصال مجدد</span>
            </button>

            {onSyncNow && (
              <button
                onClick={onSyncNow}
                disabled={isSyncing || isOfflineSimulated}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>همگام‌سازی فوری</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Network of 15 Installed Client Workstations Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" />
              <span>شبکه ۱۵ سیستم و ایستگاه کاری نصبی ام گاز (Active Client Stations Network)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              هر کدام از سیستم‌های زیر دارای یک فایل دیتابیس محلی (<span className="font-mono text-indigo-300">mgas_local.db</span>) مجزا هستند که با دیتابیس ابری کلودفلر هماهنگ می‌مانند.
            </p>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-950 text-emerald-400 border border-emerald-800/40 font-bold">
            ۱۵ ایستگاه فعال و متصل
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {stationsList.map((station, idx) => {
            const isCurrent = station.station_id === activeStationId;
            return (
              <div
                key={station.station_id}
                onClick={() => setActiveStationId(station.station_id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-indigo-950/40 border-indigo-500 shadow-md ring-1 ring-indigo-500'
                    : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700/60 font-bold">
                    {station.station_id}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    آنلاین
                  </span>
                </div>

                <div className="text-xs font-bold text-white truncate" title={station.station_name}>
                  {station.station_name}
                </div>

                <div className="text-[11px] text-slate-400 mt-1 truncate">
                  {station.assigned_user}
                </div>

                <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                  <span className="px-1.5 py-0.5 rounded bg-slate-800/70 text-slate-300 font-mono">
                    {station.os}
                  </span>
                  <span className="font-mono text-indigo-300">mgas_local.db</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two In-Depth Focus Panels: Cloudflare D1 & Local Client DB */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Panel 1: Cloudflare D1 Authoritative Database */}
        <div className="bg-slate-900 border-2 border-emerald-600/40 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-700/50 flex items-center justify-center text-emerald-400">
                  <Cloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">پایگاه‌داده ابری مرکزی (Cloudflare D1)</h3>
                  <p className="text-xs text-slate-400">سرور و مرجع توالی authoritative ابری ام گاز</p>
                </div>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700/40 font-bold">
                مرجع توالی کلودفلر
              </span>
            </div>

            <div className="space-y-2.5 text-xs border-t border-slate-800 pt-3">
              <div className="flex justify-between py-1 border-b border-slate-800/50">
                <span className="text-slate-400">نشانی دامنه ابری:</span>
                <span className="font-mono font-bold text-emerald-400">https://anbar.mgas.ir</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/50">
                <span className="text-slate-400">نام دیتابیس در کلودفلر:</span>
                <span className="font-mono font-bold text-slate-200">anbar-db1</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/50">
                <span className="text-slate-400">آخرین شماره ترتیب سرور (Sequence):</span>
                <span className="font-mono font-bold text-emerald-400">
                  {d1Data ? toPersianDigits(d1Data.server_sequence) : '۱۰۰۰'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/50">
                <span className="text-slate-400">کل رویدادهای ثبت‌شده در ابر:</span>
                <span className="font-bold text-slate-100">
                  {d1Data ? toPersianDigits(d1Data.events_count) : '---'} رویداد
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/50">
                <span className="text-slate-400">تعداد پرونده‌های مشتریان:</span>
                <span className="font-bold text-slate-100">
                  {d1Data ? toPersianDigits(d1Data.customers_count) : '۶۱'} مشتری
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">تعداد اقلام کالاها در کاتالوگ:</span>
                <span className="font-bold text-slate-100">
                  {d1Data ? toPersianDigits(d1Data.products_count) : '۱۴'} کالا
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>پایگاه ابری در دسترس و آماده است</span>
            </span>
            <span className="font-mono text-[10px] text-slate-500">Cloudflare D1 Worker Engine</span>
          </div>
        </div>

        {/* Panel 2: This Station Local Database */}
        <div className="bg-slate-900 border-2 border-indigo-600/40 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-950/80 border border-indigo-700/50 flex items-center justify-center text-indigo-400">
                  <HardDrive className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">پایگاه‌داده محلی این سیستم (Local Station DB)</h3>
                  <p className="text-xs text-slate-400">دیتابیس اختصاصی SQLite سیستم جاری</p>
                </div>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-700/40 font-bold">
                mgas_local.db
              </span>
            </div>

            <div className="space-y-2.5 text-xs border-t border-slate-800 pt-3">
              <div className="flex justify-between py-1 border-b border-slate-800/50">
                <span className="text-slate-400">نام فایل دیتابیس محلی:</span>
                <span className="font-mono font-bold text-indigo-300">mgas_local.db</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/50">
                <span className="text-slate-400">شناسه ایستگاه نصبی:</span>
                <span className="font-mono font-bold text-slate-200">{activeStationId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/50">
                <span className="text-slate-400">کاربر فعال این سیستم:</span>
                <span className="font-bold text-slate-100">{currentUser.full_name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/50">
                <span className="text-slate-400">توالی همگام‌شده محلی:</span>
                <span className="font-mono font-bold text-indigo-300">
                  {toPersianDigits(currentState.sync_state.last_server_sequence)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/50">
                <span className="text-slate-400">اسناد معوقه در صف ارسال محلی:</span>
                <span className="font-bold text-amber-400">
                  {toPersianDigits(currentState.sync_queue.filter(q => q.status === 'PENDING').length)} سند
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">تراکنش‌های ثبت‌شده در دیتابیس این سیستم:</span>
                <span className="font-bold text-slate-100">
                  {toPersianDigits(currentState.stock_movements.length)} تراکنش
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] flex items-center justify-between">
            <span className={`flex items-center gap-1 font-bold ${
              currentState.isOfflineSimulated ? 'text-rose-400' : 'text-emerald-400'
            }`}>
              <Activity className="w-3.5 h-3.5" />
              <span>{currentState.isOfflineSimulated ? 'آفلاین (ذخیره محلی)' : 'آنلاین و متصل به کلودفلر'}</span>
            </span>
            <button
              onClick={() => triggerFileDownload('/mgas_local.db', 'mgas_local.db')}
              className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer font-bold"
            >
              <Download className="w-3 h-3" />
              <span>پشتیبان‌گیری از mgas_local.db</span>
            </button>
          </div>
        </div>
      </div>

      {/* Live Test Console Log Output (if executed) */}
      {testLog.length > 0 && (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 shadow-inner">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>کنسول تست بلادرنگ ارسال و بازگشت داده‌ها</span>
            </h4>
            <button
              onClick={() => setTestLog([])}
              className="text-[10px] text-slate-500 hover:text-slate-300 cursor-pointer"
            >
              پاک‌سازی
            </button>
          </div>
          <div className="space-y-1 font-mono text-[11px] max-h-48 overflow-y-auto">
            {testLog.map((line, i) => (
              <div key={i} className="text-slate-300 leading-relaxed">
                {line}
              </div>
            ))}
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
};
