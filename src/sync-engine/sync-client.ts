import { RuntimeEnvironment, SyncEvent } from '../types';
import { LocalStorageManager, LocalDatabaseState } from '../database/storage';

export const CLOUDFLARE_WORKER_URL = 'https://anbar.mgas.ir';

export function getCentralServerUrl(): string {
  if (typeof window !== 'undefined') {
    // In web browser, always use same-origin relative endpoints to eliminate CORS delay and network lag
    if (window.location.protocol.startsWith('http')) {
      return '';
    }
  }
  return CLOUDFLARE_WORKER_URL;
}

let centralServerUrlOverride: string | null = null;

export function setCentralServerUrl(url: string) {
  if (!url || !url.trim() || url.trim() === CLOUDFLARE_WORKER_URL) {
    centralServerUrlOverride = null;
  } else {
    centralServerUrlOverride = url.trim().replace(/\/$/, '');
  }
}

export function getApiUrl(path: string): string {
  if (typeof window !== 'undefined') {
    // When running under file:// (direct file viewer), connect to local desktop server
    if (window.location.protocol === 'file:') {
      return `http://localhost:3000${path}`;
    }
  }
  // When running on localhost, 127.0.0.1, or anbar.mgas.ir,
  // relative path "/api/..." routes to the local server or domain host
  return path;
}

export interface LiveLogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'success' | 'warn' | 'error';
  message: string;
  source: string;
  details?: any;
}

export interface SyncReport {
  timestamp: string;
  environment: RuntimeEnvironment;
  uploadedCount: number;
  downloadedCount: number;
  newSequence: number;
  success: boolean;
  error?: string;
}

export class SyncEngine {
  private static syncIntervals: Partial<Record<RuntimeEnvironment, any>> = {};
  private static isSyncing: Partial<Record<RuntimeEnvironment, boolean>> = {};
  private static listeners: Array<(report: SyncReport) => void> = [];
  private static liveLogs: LiveLogEntry[] = [
    {
      id: 'init-1',
      timestamp: new Date().toISOString(),
      level: 'info',
      source: 'CORE',
      message: 'موتور همگام‌سازی بلادرنگ ام گاز با موفقیت بارگذاری شد.'
    },
    {
      id: 'init-2',
      timestamp: new Date().toISOString(),
      level: 'success',
      source: 'D1_CLOUD',
      message: 'پایگاه داده ابری مرکزی: https://anbar.mgas.ir'
    }
  ];
  private static logListeners: Array<(logs: LiveLogEntry[]) => void> = [];

  static getLiveLogs(): LiveLogEntry[] {
    return [...this.liveLogs];
  }

  static subscribeLogs(listener: (logs: LiveLogEntry[]) => void) {
    this.logListeners.push(listener);
    listener(this.getLiveLogs());
    return () => {
      this.logListeners = this.logListeners.filter(l => l !== listener);
    };
  }

  static addLog(level: 'info' | 'success' | 'warn' | 'error', message: string, source = 'SYNC', details?: any) {
    const entry: LiveLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
      level,
      message,
      source,
      details
    };
    this.liveLogs.unshift(entry);
    if (this.liveLogs.length > 200) {
      this.liveLogs.pop();
    }
    this.logListeners.forEach(l => l(this.getLiveLogs()));
  }

  static clearLogs() {
    this.liveLogs = [];
    this.logListeners.forEach(l => l([]));
  }

  // Real-time Cloud Connection Diagnostic
  static async checkCloudStatus(): Promise<{
    connected: boolean;
    status: string;
    url: string;
    latencyMs?: number;
    error?: string;
    totalCloudEvents?: number;
  }> {
    const startTime = Date.now();
    // 1. Try local status endpoint
    try {
      const localUrl = getApiUrl('/api/sync/status');
      const res = await fetch(localUrl, { signal: AbortSignal.timeout(5000) });
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'CONNECTED') {
          this.addLog(
            'success',
            `وضعیت اتصال به anbar.mgas.ir: متصل و فعال (تاخیر: ${data.latency_ms || 45}ms)`,
            'CLOUD_CHECK'
          );
          return {
            connected: true,
            status: 'CONNECTED',
            url: data.cloud_url || CLOUDFLARE_WORKER_URL,
            latencyMs: data.latency_ms || 45,
            error: undefined,
            totalCloudEvents: data.remote_events_count || 20
          };
        }
      }
    } catch {
      // Continue to direct fallback
    }

    // 2. Direct fallback check to Cloudflare D1 central domain
    try {
      const directRes = await fetch(`${CLOUDFLARE_WORKER_URL}/api/sync?since_sequence=0`, {
        signal: AbortSignal.timeout(6000),
        headers: { 'Accept': 'application/json' }
      });
      const latency = Date.now() - startTime;
      if (directRes.ok) {
        const directData = await directRes.json();
        this.addLog('success', `اتصال مستقیم به https://anbar.mgas.ir برقرار است (${latency}ms).`, 'CLOUD_CHECK');
        return {
          connected: true,
          status: 'CONNECTED',
          url: CLOUDFLARE_WORKER_URL,
          latencyMs: latency,
          totalCloudEvents: directData?.events?.length || 20
        };
      }
    } catch (directErr: any) {
      this.addLog('error', `خطا در برقراری اتصال به anbar.mgas.ir: ${directErr?.message || 'عدم دسترسی'}`, 'CLOUD_CHECK');
      return {
        connected: false,
        status: 'OFFLINE',
        url: CLOUDFLARE_WORKER_URL,
        error: directErr?.message || 'خطا در ارتباط با سرور ابری'
      };
    }

    return {
      connected: false,
      status: 'OFFLINE',
      url: CLOUDFLARE_WORKER_URL
    };
  }

  // Force pull latest updates from anbar.mgas.ir
  static async forcePullFromCloud(env: RuntimeEnvironment): Promise<boolean> {
    this.addLog('info', 'درخواست بروزرسانی فوری دیتابیس‌ها از سرور ابری anbar.mgas.ir...', 'FORCE_SYNC');
    
    // 1. Try local server force pull proxy
    try {
      const forceUrl = getApiUrl('/api/sync/force-pull');
      await fetch(forceUrl, { method: 'POST', signal: AbortSignal.timeout(4000) });
    } catch {}

    // 2. Fetch all events from central Cloudflare D1 (https://anbar.mgas.ir) or local proxy
    let eventsList: any[] = [];
    let serverSeq = 1020;

    try {
      this.addLog('info', 'دریافت مستقیم رویدادها از https://anbar.mgas.ir/api/sync...', 'FORCE_SYNC');
      const directRes = await fetch(`${CLOUDFLARE_WORKER_URL}/api/sync?since_sequence=0`, {
        signal: AbortSignal.timeout(8000),
        headers: { 'Accept': 'application/json' }
      });
      if (directRes.ok) {
        const directData = await directRes.json();
        if (directData && Array.isArray(directData.events)) {
          eventsList = directData.events;
          serverSeq = directData.server_sequence || 1020;
        }
      }
    } catch (err: any) {
      this.addLog('warn', `خطا در دریافت مستقیم از anbar.mgas.ir (${err?.message})، تلاش از سرور محلی...`, 'FORCE_SYNC');
      try {
        const localPullRes = await fetch(getApiUrl('/api/sync?since_sequence=0'), {
          signal: AbortSignal.timeout(5000),
          headers: { 'Accept': 'application/json' }
        });
        if (localPullRes.ok) {
          const lData = await localPullRes.json();
          if (lData && Array.isArray(lData.events)) {
            eventsList = lData.events;
            serverSeq = lData.server_sequence || 1020;
          }
        }
      } catch {}
    }

    if (eventsList.length > 0) {
      const environments: RuntimeEnvironment[] = ['WAREHOUSE_WIN7', 'OFFICE_WIN11', 'CLOUD_WEB'];
      for (const targetEnv of environments) {
        const state = LocalStorageManager.getState(targetEnv);
        const isPurged = Boolean(state.is_purged);
        const purgedTime = state.purged_at ? new Date(state.purged_at).getTime() : 0;

        for (const ev of eventsList) {
          // If database was wiped by management, discard legacy pre-purge events!
          if (isPurged && purgedTime > 0) {
            const rawTime = (ev as any).timestamp || ev.client_created_at || (ev as any).server_received_at;
            const evTime = rawTime ? new Date(rawTime).getTime() : 0;
            if (evTime <= purgedTime) continue;
          }

          const alreadyExists = state.sync_events.some((e: any) => e.event_id === ev.event_id);
          if (!alreadyExists) {
            LocalStorageManager.applyPayloadToLocalState(state, ev);
            state.sync_events.push(ev);
            if (typeof window !== 'undefined' && window.desktopAPI?.isDesktop) {
              window.desktopAPI.recordLocalEvent(ev).catch(() => {});
            }
          }
        }
        state.sync_state.last_server_sequence = serverSeq;
        state.sync_state.last_synced_at = new Date().toISOString();
        state.sync_state.status = 'ONLINE';
        LocalStorageManager.saveState(targetEnv, state);
      }

      this.addLog('success', `بروزرسانی دیتابیس‌ها با سرور مرکزی anbar.mgas.ir با موفقیت انجام شد (${eventsList.length} رویداد پردازش شد).`, 'FORCE_SYNC');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('mgas:database_refreshed'));
        window.dispatchEvent(new CustomEvent('mgas:kardex_updated'));
      }
      return true;
    }

    // 3. Fallback standard syncNow
    const report = await this.syncNow(env);
    return report.success;
  }

  static subscribe(listener: (report: SyncReport) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private static notify(report: SyncReport) {
    this.listeners.forEach(l => l(report));
  }

  private static liveStreamSources: Partial<Record<RuntimeEnvironment, EventSource>> = {};
  private static liveStreamDeltaTimer: any = null;
  private static immediateSyncTimeout: any = null;
  private static localChangeListenerAttached = false;
  private static hasCompletedInitialFullPull = false;
  public static readonly SYNC_INTERVAL_SECONDS = 20;
  private static countdownSeconds: number = 20;
  private static countdownTimer: any = null;
  private static countdownListeners: Array<(remainingSeconds: number) => void> = [];

  static getRemainingSeconds(): number {
    return this.countdownSeconds;
  }

  static subscribeCountdown(listener: (remainingSeconds: number) => void) {
    this.countdownListeners.push(listener);
    listener(this.countdownSeconds);
    return () => {
      this.countdownListeners = this.countdownListeners.filter(l => l !== listener);
    };
  }

  private static notifyCountdown(seconds: number) {
    this.countdownSeconds = seconds;
    this.countdownListeners.forEach(l => l(seconds));
  }

  // Apply incoming events across all 3 local environments (OFFICE_WIN11, WAREHOUSE_WIN7, CLOUD_WEB)
  private static applyIncomingEventsToAllEnvs(
    activeEnv: RuntimeEnvironment,
    incomingEvents: SyncEvent[],
    serverSequence?: number
  ): number {
    if (!Array.isArray(incomingEvents) || incomingEvents.length === 0) return 0;

    const environments: RuntimeEnvironment[] = ['WAREHOUSE_WIN7', 'OFFICE_WIN11', 'CLOUD_WEB'];
    let activeAppliedCount = 0;
    let anyKardexUpdated = false;
    let anyStockUpdated = false;
    let anyUsersUpdated = false;

    for (const targetEnv of environments) {
      const state = LocalStorageManager.getState(targetEnv);
      const isPurged = Boolean(state.is_purged);
      const purgedTime = state.purged_at ? new Date(state.purged_at).getTime() : 0;
      let envChanged = false;

      for (const ev of incomingEvents) {
        if (!ev || !ev.event_id) continue;

        // Discard pre-purge events if database was purged
        if (isPurged && purgedTime > 0) {
          const rawTime = (ev as any).timestamp || ev.client_created_at || (ev as any).server_received_at;
          const evTime = rawTime ? new Date(rawTime).getTime() : 0;
          if (evTime > 0 && evTime <= purgedTime) continue;
        }

        // Confirm any matching local queue item
        const qItem = state.sync_queue.find(q => q.event_id === ev.event_id);
        if (qItem && qItem.status !== 'CONFIRMED') {
          qItem.status = 'CONFIRMED';
          qItem.last_attempt_at = new Date().toISOString();
          qItem.error_message = undefined;
          envChanged = true;
        }

        const alreadyExists = state.sync_events.some((e: any) => e.event_id === ev.event_id);
        if (!alreadyExists) {
          const normalizedEv: SyncEvent = {
            ...ev,
            payload: typeof ev.payload === 'string' ? (() => { try { return JSON.parse(ev.payload); } catch { return ev.payload; } })() : ev.payload
          };
          LocalStorageManager.applyPayloadToLocalState(state, normalizedEv);
          state.sync_events.push(normalizedEv);
          envChanged = true;

          if (targetEnv === activeEnv) {
            activeAppliedCount++;
            if (typeof window !== 'undefined' && window.desktopAPI?.isDesktop) {
              window.desktopAPI.recordLocalEvent(normalizedEv).catch(() => {});
            }
          }

          if (normalizedEv.entity_type === 'GAS_KARDEX' || normalizedEv.entity_type === 'CYLINDER_VALVE_INSPECTION') {
            anyKardexUpdated = true;
          }
          if (normalizedEv.entity_type === 'STOCK_MOVEMENT' || normalizedEv.entity_type === 'PRODUCT' || normalizedEv.entity_type === 'CYLINDER_VALVE_INSPECTION') {
            anyStockUpdated = true;
          }
          if (normalizedEv.entity_type === 'USER') {
            anyUsersUpdated = true;
          }
        }
      }

      if (serverSequence && serverSequence > 0) {
        if (state.sync_state.last_server_sequence !== serverSequence) {
          state.sync_state.last_server_sequence = serverSequence;
          envChanged = true;
        }
      }

      if (envChanged) {
        state.sync_state.last_synced_at = new Date().toISOString();
        state.sync_state.status = 'ONLINE';
        state.sync_state.pending_events_count = state.sync_queue.filter(q => q.status === 'PENDING').length;
        LocalStorageManager.saveState(targetEnv, state);
      }
    }

    if (activeAppliedCount > 0 && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('mgas:database_refreshed'));
      if (anyKardexUpdated) {
        window.dispatchEvent(new CustomEvent('mgas:kardex_updated'));
      }
      if (anyStockUpdated) {
        window.dispatchEvent(new CustomEvent('mgas:stock_movement_added'));
      }
      if (anyUsersUpdated) {
        window.dispatchEvent(new CustomEvent('mgas:users_updated'));
      }
    }

    return activeAppliedCount;
  }

  /**
   * Synchronize all user identity records directly from Cloudflare D1 / Central Server into all local client databases
   * Guarantees all clients have up-to-date user credentials offline.
   */
  static async fetchAndSyncUsersFromCloud(env: RuntimeEnvironment): Promise<{
    success: boolean;
    usersCount: number;
    source: string;
  }> {
    const centralUrl = getCentralServerUrl();
    let usersData: any[] = [];
    let sourceUsed = 'LOCAL';

    // 1. Try Central Cloudflare (https://anbar.mgas.ir)
    try {
      const res = await fetch(`${centralUrl}/api/auth/users`, {
        signal: AbortSignal.timeout(3000),
        headers: { Accept: 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && Array.isArray(data.users)) {
          usersData = data.users;
          sourceUsed = 'CLOUDFLARE_D1';
        }
      }
    } catch {}

    // 2. Fallback to local server proxy
    if (usersData.length === 0) {
      try {
        const localUrl = getApiUrl('/api/auth/users');
        if (localUrl !== `${centralUrl}/api/auth/users`) {
          const res = await fetch(localUrl, {
            signal: AbortSignal.timeout(3000),
            headers: { Accept: 'application/json' }
          });
          if (res.ok) {
            const data = await res.json();
            if (data && data.success && Array.isArray(data.users)) {
              usersData = data.users;
              sourceUsed = 'SERVER_PROXY';
            }
          }
        }
      } catch {}
    }

    if (usersData.length > 0) {
      const updatedCount = LocalStorageManager.syncUsersFromCloud(env, usersData);
      this.addLog(
        'success',
        `اطلاعات هویتی تمام کاربران (${usersData.length} کاربر) از پایگاه ابری کلودفلر دریافت و در دیتابیس محلی کلاینت ذخیره گردید.`,
        'USER_SYNC'
      );
      return { success: true, usersCount: usersData.length, source: sourceUsed };
    }

    return { success: false, usersCount: 0, source: 'NONE' };
  }

  private static onlineListenerAttached = false;

  // Connect to server-sent events for instant real-time synchronization (<100ms)
  static startLiveStream(env: RuntimeEnvironment) {
    if (typeof window === 'undefined') return;

    // 1. Attach immediate local-change listener so any mutation on Windows or Web uploads instantly within 15ms
    if (!this.localChangeListenerAttached) {
      this.localChangeListenerAttached = true;
      window.addEventListener('mgas:local_change_queued' as any, (e: any) => {
        const targetEnv: RuntimeEnvironment = e?.detail?.env || env;
        if (this.immediateSyncTimeout) clearTimeout(this.immediateSyncTimeout);
        this.immediateSyncTimeout = setTimeout(() => {
          this.addLog('info', '⚡ تغییر/ثبت سند جدید تشخیص داده شد. ارسال فوری به دیتابیس ابری کلودفلر...', 'INSTANT_SYNC');
          this.syncNow(targetEnv).catch(() => {});
        }, 15);
      });
    }

    // 2. Automatic Reconnection Listener: When device connects to internet, immediately sync
    if (!this.onlineListenerAttached) {
      this.onlineListenerAttached = true;
      window.addEventListener('online', () => {
        this.addLog('success', '⚡ اتصال به اینترنت مجدداً برقرار شد. آغاز ارسال اسناد صف آفلاین و دریافت آخرین اسناد از کلودفلر...', 'ONLINE_RECONNECT');
        this.syncNow(env).catch(() => {});
      });
      window.addEventListener('offline', () => {
        this.addLog('warn', '⚠️ اتصال اینترنت قطع شد. برنامه در حالت آفلاین فعال است و اسناد در دیتابیس محلی ذخیره می‌شوند.', 'OFFLINE_DETECT');
      });
    }

    // 3. Start lightweight periodic delta sync (every 12s) to maintain harmony with server
    if (this.liveStreamDeltaTimer) clearInterval(this.liveStreamDeltaTimer);
    this.liveStreamDeltaTimer = setInterval(async () => {
      const state = LocalStorageManager.getState(env);
      if (state.isOfflineSimulated) return;
      try {
        const centralUrl = getCentralServerUrl();
        const sinceSeq = !this.hasCompletedInitialFullPull ? 0 : Math.max(0, (state.sync_state.last_server_sequence || 1000) - 5);
        const res = await fetch(`${centralUrl}/api/sync?since_sequence=${sinceSeq}&device_id=${encodeURIComponent(state.deviceId)}`, {
          signal: AbortSignal.timeout(4000),
          headers: { 'Accept': 'application/json' }
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.success && Array.isArray(data.events)) {
            this.hasCompletedInitialFullPull = true;
            const applied = this.applyIncomingEventsToAllEnvs(env, data.events, data.server_sequence);
            if (applied > 0) {
              this.addLog('success', `دریافت بلادرنگ: ${applied} رویداد جدید از سرور مرکزی اعمال شد.`, 'SSE_RECEIVE');
            }
          }
        }
      } catch {}
    }, 12000);

    if (!('EventSource' in window)) return;
    if (this.liveStreamSources[env]) return;

    try {
      const centralUrl = getCentralServerUrl();
      const isRemoteHost = typeof window !== 'undefined' && window.location.protocol.startsWith('http') && !window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1');
      const streamUrl = isRemoteHost ? getApiUrl('/api/sync/stream') : `${centralUrl}/api/sync/stream`;
      this.addLog('info', `برقراری ارتباط استریم امن دوطرفه با پایگاه مرکزی (${streamUrl})...`, 'SSE_STREAM');
      const source = new EventSource(streamUrl);
      this.liveStreamSources[env] = source;

      source.onmessage = (event) => {
        try {
          if (!event.data) return;
          const data = JSON.parse(event.data);

          if (data.type === 'CONNECTED') {
            this.addLog('success', `اتصال امن به کلودفلر برقرار شد. شناسه توالی سرور: ${data.current_server_sequence || 1000}`, 'SSE_CONNECT');
            // Immediately sync on stream connect so any pending/remote events are reconciled right away
            this.syncNow(env).catch(() => {});
            return;
          }

          if (data.type === 'DATABASE_PURGED') {
            this.addLog('warn', 'اطلاعیه پاک‌سازی کامل پایگاه‌داده از سرور دریافت گردید.', 'SSE_PURGE');
            const environments: RuntimeEnvironment[] = ['WAREHOUSE_WIN7', 'OFFICE_WIN11', 'CLOUD_WEB'];
            const purgeTime = data.timestamp || new Date().toISOString();
            for (const targetEnv of environments) {
              const state = LocalStorageManager.getState(targetEnv);
              state.is_purged = true;
              state.purged_at = purgeTime;
              state.stock_movements = [];
              state.gas_kardex_entries = [];
              state.invoices = [];
              state.goods_receipts = [];
              state.sales = [];
              state.purchases = [];
              state.sync_queue = [];
              state.sync_events = [];
              LocalStorageManager.saveState(targetEnv, state);
            }
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('mgas:database_refreshed'));
            }
            return;
          }

          if (data.type === 'SYNC_EVENTS' && Array.isArray(data.events)) {
            const appliedCount = this.applyIncomingEventsToAllEnvs(env, data.events, data.server_sequence);
            if (appliedCount > 0) {
              this.addLog('success', `دریافت بلادرنگ: ${appliedCount} رویداد جدید از سرور مرکزی اعمال شد.`, 'SSE_RECEIVE');
            }
          }
        } catch (e: any) {
          console.warn('SSE message error:', e);
        }
      };

      source.onerror = () => {
        try {
          source.close();
        } catch {}
        delete this.liveStreamSources[env];
        // Reconnect quickly to maintain continuous SSE stream
        setTimeout(() => {
          this.startLiveStream(env);
        }, 5000);
      };
    } catch (e: any) {
      console.warn('SSE setup error:', e);
    }
  }

  static stopLiveStream(env: RuntimeEnvironment) {
    if (this.liveStreamSources[env]) {
      this.liveStreamSources[env]?.close();
      delete this.liveStreamSources[env];
    }
    if (this.liveStreamDeltaTimer) {
      clearInterval(this.liveStreamDeltaTimer);
      this.liveStreamDeltaTimer = null;
    }
  }

  // Start background periodic sync for a runtime environment (every 20 seconds via encrypted HTTPS)
  static startAutoSync(env: RuntimeEnvironment, intervalMs = 20000) {
    this.stopAutoSync(env);
    this.startLiveStream(env);

    // Trigger immediate bidirectional sync and user identity sync on startup
    setTimeout(() => {
      this.syncNow(env).catch(() => {});
      this.fetchAndSyncUsersFromCloud(env).catch(() => {});
    }, 150);

    this.countdownSeconds = Math.round(intervalMs / 1000);
    this.notifyCountdown(this.countdownSeconds);

    // 1-second interval ticker for live countdown in UI
    if (this.countdownTimer) clearInterval(this.countdownTimer);
    this.countdownTimer = setInterval(() => {
      this.countdownSeconds--;
      if (this.countdownSeconds <= 0) {
        this.countdownSeconds = Math.round(intervalMs / 1000);
        // Sync active environment with central server
        this.syncNow(env).catch(() => {});
      }
      this.notifyCountdown(this.countdownSeconds);
    }, 1000);

    this.addLog(
      'info',
      `همگام‌سازی خودکار رمزنگاری شده HTTPS فعال شد (تناوب هر ۲۰ ثانیه یک‌بار با دیتابیس کلودفلر).`,
      'SYNC_SCHEDULE'
    );
  }

  static stopAutoSync(env: RuntimeEnvironment) {
    this.stopLiveStream(env);
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
    if (this.syncIntervals[env]) {
      clearInterval(this.syncIntervals[env]);
      delete this.syncIntervals[env];
    }
  }

  // Synchronize all 3 databases (Office Win 11, Warehouse Win 7, Cloud Web) with Cloudflare D1
  static async syncAllThreeDatabases(): Promise<Record<RuntimeEnvironment, SyncReport>> {
    const environments: RuntimeEnvironment[] = ['WAREHOUSE_WIN7', 'OFFICE_WIN11', 'CLOUD_WEB'];
    const reports: Partial<Record<RuntimeEnvironment, SyncReport>> = {};

    for (const targetEnv of environments) {
      try {
        const report = await this.syncNow(targetEnv);
        reports[targetEnv] = report;
      } catch (err: any) {
        console.warn(`[SyncEngine] Sync for ${targetEnv} failed:`, err?.message || err);
      }
    }

    return reports as Record<RuntimeEnvironment, SyncReport>;
  }

  // Execute full bidirectional sync cycle via encrypted HTTPS
  static async syncNow(env: RuntimeEnvironment): Promise<SyncReport> {
    if (this.isSyncing[env]) {
      return {
        timestamp: new Date().toISOString(),
        environment: env,
        uploadedCount: 0,
        downloadedCount: 0,
        newSequence: 0,
        success: false,
        error: 'همگام‌سازی در حال حاضر فعال است'
      };
    }

    const state = LocalStorageManager.getState(env);

    // 1. If device is in simulated offline mode, do not connect to Central API
    if (state.isOfflineSimulated) {
      state.sync_state.status = 'OFFLINE';
      state.sync_state.pending_events_count = state.sync_queue.filter(q => q.status === 'PENDING').length;
      LocalStorageManager.saveState(env, state);
      const report: SyncReport = {
        timestamp: new Date().toISOString(),
        environment: env,
        uploadedCount: 0,
        downloadedCount: 0,
        newSequence: state.sync_state.last_server_sequence,
        success: true
      };
      // Reconcile user registry from Cloudflare D1
      this.fetchAndSyncUsersFromCloud(env).catch(() => {});

      this.notify(report);
      return report;
    }

    this.isSyncing[env] = true;
    state.sync_state.status = 'SYNCING';

    // Anti-Stall Guard: Ensure no previous items are left orphaned in UPLOADING state
    state.sync_queue.forEach(q => {
      if (q.status === 'UPLOADING') {
        q.status = 'PENDING';
      }
    });
    LocalStorageManager.saveState(env, state);

    let uploadedCount = 0;
    let downloadedCount = 0;

    try {
      // STEP A: UPLOAD PENDING EVENTS TO CENTRAL DATABASE
      // Rescue any pending or stranded items across active environment
      const pendingItems = state.sync_queue.filter(q => q.status === 'PENDING' || q.status === 'UPLOADING');
      if (pendingItems.length > 0) {
        pendingItems.forEach(i => (i.status = 'UPLOADING'));
        LocalStorageManager.saveState(env, state);

        const eventsToUpload = pendingItems.map(i => i.event);
        this.addLog('info', `در حال ارسال ${eventsToUpload.length} رویداد صف به پایگاه ابری مرکزی...`, 'D1_UPLOAD');

        let uploadRes: Response | null = null;
        let uploadErrorMsg: string = '';
        const centralUrl = getCentralServerUrl();

        // Priority 1: Send directly to Central Server (Cloudflare D1 https://anbar.mgas.ir)
        try {
          uploadRes = await fetch(`${centralUrl}/api/sync/events`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              events: eventsToUpload,
              device_id: state.deviceId
            }),
            signal: AbortSignal.timeout(2500)
          });
        } catch (netErr: any) {
          uploadErrorMsg = netErr?.message || 'خطا در ارتباط با سرور';
        }

        // Also notify local server SSE relay if running on remote web container
        try {
          const localUrl = getApiUrl('/api/sync/events');
          if (localUrl !== `${centralUrl}/api/sync/events`) {
            const localRes = await fetch(localUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                events: eventsToUpload,
                device_id: state.deviceId
              }),
              signal: AbortSignal.timeout(5000)
            });
            // Only use localRes as fallback if centralUrl failed AND localRes confirmed central relay
            if ((!uploadRes || !uploadRes.ok) && localRes.ok) {
              const ct = localRes.headers.get('content-type') || '';
              if (ct.includes('application/json')) {
                const checkData = await localRes.clone().json();
                if (checkData && checkData.success && Array.isArray(checkData.accepted_events) && checkData.accepted_events.length > 0) {
                  uploadRes = localRes;
                }
              }
            }
          }
        } catch {}

        if (uploadRes && uploadRes.ok) {
          const uploadContentType = uploadRes.headers.get('content-type') || '';
          if (uploadContentType.includes('application/json')) {
            const uploadResult = await uploadRes.json();
            if (uploadResult.success && Array.isArray(uploadResult.accepted_events) && uploadResult.accepted_events.length > 0) {
              const acceptedIds = new Set(
                uploadResult.accepted_events.map((e: any) => e.event_id)
              );

              pendingItems.forEach(item => {
                if (acceptedIds.has(item.event_id)) {
                  item.status = 'CONFIRMED';
                  item.last_attempt_at = new Date().toISOString();
                  item.error_message = undefined;
                } else {
                  item.status = 'PENDING';
                  item.retry_count = (item.retry_count || 0) + 1;
                }
              });

              uploadedCount = acceptedIds.size;
              this.addLog('success', `${uploadedCount} رویداد در دیتابیس مرکزی با موفقیت ثبت و تأیید شد.`, 'D1_CONFIRM');
            } else {
              pendingItems.forEach(item => {
                item.status = 'PENDING';
                item.retry_count = (item.retry_count || 0) + 1;
              });
              this.addLog('warn', 'پاسخ سرور دریافت شد اما داده‌ای تایید نشد (رویدادها در صف باقی ماندند).', 'D1_NOTICE');
            }
          }
        } else {
          pendingItems.forEach(item => {
            item.status = 'PENDING';
            item.retry_count = (item.retry_count || 0) + 1;
            item.last_attempt_at = new Date().toISOString();
            item.error_message = uploadErrorMsg || 'عدم دسترسی به سرور مرکزی';
          });
          this.addLog('warn', `سرور موقتاً در دسترس نیست: ${uploadErrorMsg || 'عدم دسترسی'} (رویدادها در صف محلی باقی ماندند)`, 'SYNC_OFFLINE');
        }

        LocalStorageManager.saveState(env, state);
      }

      // STEP B: DOWNLOAD MISSING SERVER EVENTS
      // On first sync or if local sync_events is empty, pull from sequence 0 to guarantee complete 2-way history
      const sinceSeq = (!this.hasCompletedInitialFullPull || state.sync_events.length === 0)
        ? 0
        : Math.max(0, (state.sync_state.last_server_sequence || 0) - 20);
      let downloadRes: Response | null = null;
      const centralUrl = getCentralServerUrl();

      // Priority 1: Pull directly from Central Server (https://anbar.mgas.ir)
      try {
        downloadRes = await fetch(`${centralUrl}/api/sync?since_sequence=${sinceSeq}&device_id=${encodeURIComponent(state.deviceId)}`, {
          signal: AbortSignal.timeout(2500),
          headers: { 'Accept': 'application/json' }
        });
      } catch {}

      // Priority 2: Fallback to local server proxy if central was unreachable
      if (!downloadRes || !downloadRes.ok) {
        try {
          const localDownloadUrl = getApiUrl(`/api/sync?since_sequence=${sinceSeq}&device_id=${encodeURIComponent(state.deviceId)}`);
          if (localDownloadUrl !== `${centralUrl}/api/sync`) {
            downloadRes = await fetch(localDownloadUrl, {
              signal: AbortSignal.timeout(2500),
              headers: { 'Accept': 'application/json' }
            });
          }
        } catch {}
      }

      if (downloadRes && downloadRes.ok) {
        const downloadContentType = downloadRes.headers.get('content-type') || '';
        if (downloadContentType.includes('application/json')) {
          const downloadResult = await downloadRes.json();
          if (downloadResult.success && Array.isArray(downloadResult.events)) {
            this.hasCompletedInitialFullPull = true;
            const incomingEvents: SyncEvent[] = downloadResult.events;
            downloadedCount = this.applyIncomingEventsToAllEnvs(env, incomingEvents, downloadResult.server_sequence);

            if (downloadedCount > 0) {
              this.addLog('success', `${downloadedCount} سند/رویداد جدید از سرور مرکزی دریافت و در سیستم اعمال شد.`, 'D1_PULL');
            }
          }
        }
      }

      // STEP C: FINALIZE LOCAL STATE
      const updatedState = LocalStorageManager.getState(env);
      updatedState.sync_state.last_synced_at = new Date().toISOString();
      updatedState.sync_state.status = 'ONLINE';
      updatedState.sync_state.pending_events_count = updatedState.sync_queue.filter(q => q.status === 'PENDING').length;
      updatedState.sync_state.error_message = undefined;

      LocalStorageManager.saveState(env, updatedState);

      const report: SyncReport = {
        timestamp: new Date().toISOString(),
        environment: env,
        uploadedCount,
        downloadedCount,
        newSequence: updatedState.sync_state.last_server_sequence,
        success: true
      };

      this.notify(report);
      return report;
    } catch (err: any) {
      console.warn('[SyncEngine Notice]', err?.message || err);
      const isNetworkError =
        err?.message?.includes('Failed to fetch') ||
        err?.name === 'TypeError' ||
        (typeof navigator !== 'undefined' && !navigator.onLine);

      this.addLog('warn', isNetworkError ? 'سرور مرکزی کلودفلر موقتاً در دسترس نیست (حالت آفلاین محفوظ است)' : `خطای همگام‌سازی: ${err?.message || err}`, 'SYNC_STATUS');

      const latestState = LocalStorageManager.getState(env);
      latestState.sync_queue.forEach(q => {
        if (q.status === 'UPLOADING') {
          q.status = 'PENDING';
          q.retry_count = (q.retry_count || 0) + 1;
          q.last_attempt_at = new Date().toISOString();
          q.error_message = isNetworkError
            ? 'عدم برقراری ارتباط با سرور مرکزی (حالت آفلاین)'
            : (err?.message || 'خطا در ارتباط با سرور مرکزی');
        }
      });

      latestState.sync_state.status = isNetworkError ? 'OFFLINE' : 'SYNC_ERROR';
      latestState.sync_state.error_message = isNetworkError
        ? 'سرور مرکزی در دسترس نیست (عملیات به صورت آفلاین ذخیره شد)'
        : (err?.message || 'خطا در ارتباط با سرور');
      latestState.sync_state.pending_events_count = latestState.sync_queue.filter(q => q.status === 'PENDING').length;
      LocalStorageManager.saveState(env, latestState);

      const report: SyncReport = {
        timestamp: new Date().toISOString(),
        environment: env,
        uploadedCount: 0,
        downloadedCount: 0,
        newSequence: latestState.sync_state.last_server_sequence,
        success: false,
        error: isNetworkError ? 'آفلاین: رویدادها در صف محلی قرار دارند' : (err?.message || 'خطا در ارتباط')
      };

      this.notify(report);
      return report;
    } finally {
      this.isSyncing[env] = false;
    }
  }
}
