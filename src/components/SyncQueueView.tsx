import React, { useState, useEffect, useRef } from 'react';
import { SyncQueueItem, RuntimeEnvironment, User } from '../types';
import { LocalStorageManager } from '../database/storage';
import { SyncEngine, LiveLogEntry, CLOUDFLARE_WORKER_URL } from '../sync-engine/sync-client';
import {
  Send,
  RefreshCw,
  Trash2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Code,
  Layers,
  Activity,
  Terminal,
  Copy,
  Check,
  Radio,
  ExternalLink,
  Wifi
} from 'lucide-react';
import {
  formatPersianDateTime,
  toPersianDigits
} from '../utils/persian';

interface SyncQueueViewProps {
  syncQueue: SyncQueueItem[];
  currentEnv: RuntimeEnvironment;
  currentUser: User;
  onRefresh: () => void;
}

export const SyncQueueView: React.FC<SyncQueueViewProps> = ({
  syncQueue,
  currentEnv,
  currentUser,
  onRefresh
}) => {
  const [selectedPayload, setSelectedPayload] = useState<any | null>(null);

  // Global Escape key listener to close modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedPayload(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [logs, setLogs] = useState<LiveLogEntry[]>([]);
  const [logFilter, setLogFilter] = useState<'all' | 'error' | 'd1' | 'sse'>('all');
  const [copiedLogs, setCopiedLogs] = useState(false);
  const [isTestingPing, setIsTestingPing] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = SyncEngine.subscribeLogs((newLogs) => {
      setLogs(newLogs);
    });
    return () => unsubscribe();
  }, []);

  const pendingItems = syncQueue.filter(q => q.status === 'PENDING');
  const confirmedItems = syncQueue.filter(q => q.status === 'CONFIRMED');
  const failedItems = syncQueue.filter(q => q.status === 'FAILED');

  const handleRetryAll = async () => {
    setIsRetrying(true);
    SyncEngine.addLog('info', 'آغاز همگام‌سازی دستی و ارسال فوری رویدادهای صف...', 'USER_ACTION');
    try {
      await SyncEngine.syncNow(currentEnv);
      onRefresh();
    } catch (e: any) {
      console.warn('Sync retry notice:', e?.message || e);
    } finally {
      setIsRetrying(false);
    }
  };

  const handleClearConfirmed = () => {
    const state = LocalStorageManager.getState(currentEnv);
    state.sync_queue = state.sync_queue.filter(q => q.status !== 'CONFIRMED');
    LocalStorageManager.saveState(currentEnv, state);
    SyncEngine.addLog('info', 'رویدادهای تأییدشده از صف محلی پاک شدند.', 'QUEUE_CLEANUP');
    onRefresh();
  };

  const handleTestCloudflarePing = async () => {
    setIsTestingPing(true);
    SyncEngine.addLog('info', `تست ارتباط مستقیم با سرور ابری ${CLOUDFLARE_WORKER_URL}/api/health...`, 'PING_TEST');
    try {
      const start = Date.now();
      const res = await fetch(`${CLOUDFLARE_WORKER_URL}/api/health`, { method: 'GET' });
      const elapsed = Date.now() - start;
      if (res.ok) {
        const data = await res.json();
        SyncEngine.addLog(
          'success',
          `پاسخ موفق از کلودفلر دریافت شد (زمان پینگ: ${elapsed}ms). دیتابیس D1 متصل: ${data.d1_connected ? 'بله' : 'خیر'}`,
          'PING_SUCCESS',
          data
        );
      } else {
        SyncEngine.addLog('warn', `پاسخ ناموفق از کلودفلر: وضعیت HTTP ${res.status}`, 'PING_FAIL');
      }
    } catch (err: any) {
      SyncEngine.addLog('error', `عدم برقراری ارتباط با کلودفلر: ${err?.message || err}`, 'PING_ERROR');
    } finally {
      setIsTestingPing(false);
    }
  };

  const handleCopyLogs = () => {
    try {
      const text = logs
        .map(l => `[${l.timestamp}] [${l.level.toUpperCase()}] [${l.source}]: ${l.message}`)
        .join('\n');
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopiedLogs(true);
      setTimeout(() => setCopiedLogs(false), 2000);
    } catch {}
  };

  const handleCopyPayload = () => {
    try {
      const text = typeof selectedPayload === 'string'
        ? selectedPayload
        : JSON.stringify(selectedPayload, null, 2);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopiedPayload(true);
      setTimeout(() => setCopiedPayload(false), 2000);
    } catch {}
  };

  const formatLogTime = (iso: string) => {
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return iso;
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      const ss = String(d.getSeconds()).padStart(2, '0');
      return `${toPersianDigits(hh)}:${toPersianDigits(mm)}:${toPersianDigits(ss)}`;
    } catch {
      return iso;
    }
  };

  const filteredLogs = logs.filter(l => {
    if (logFilter === 'error') return l.level === 'error' || l.level === 'warn';
    if (logFilter === 'd1') return l.source.includes('D1') || l.source.includes('SYNC');
    if (logFilter === 'sse') return l.source.includes('SSE');
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Send className="w-5 h-5 text-indigo-400" />
            <span>صف ارسال رویدادهای محلی (Local Sync Queue)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            پایش بلادرنگ صف رویدادها، وضعیت همگام‌سازی آفلاین/آنلاین و لاگ‌های زنده سیستم
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleRetryAll}
            disabled={isRetrying || pendingItems.length === 0}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer shadow-md shadow-indigo-600/20"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
            <span>ارسال فوری به سرور مرکزی</span>
          </button>

          {confirmedItems.length > 0 && (
            <button
              onClick={handleClearConfirmed}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors border border-slate-700 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>پاک‌سازی تأییدشده‌ها</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400">در انتظار ارسال</div>
            <div className="text-lg font-bold text-amber-300 font-mono">
              {toPersianDigits(pendingItems.length)} رویداد
            </div>
          </div>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400">تأیید شده توسط سرور</div>
            <div className="text-lg font-bold text-emerald-300 font-mono">
              {toPersianDigits(confirmedItems.length)} رویداد
            </div>
          </div>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400">تلاش ناموفق (نیازمند بررسی)</div>
            <div className="text-lg font-bold text-rose-300 font-mono">
              {toPersianDigits(failedItems.length)} رویداد
            </div>
          </div>
        </div>
      </div>

      {/* Sync Queue Table Card */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>فهرست رویدادهای صف جاری ({toPersianDigits(syncQueue.length)} بسته)</span>
          </h3>
          <span className="text-xs text-slate-400">
            توالی محلی دستگاه: <span className="font-mono text-cyan-300 font-bold">{toPersianDigits(syncQueue.length)}</span>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800 font-medium">
              <tr>
                <th className="p-3">شناسه صف</th>
                <th className="p-3">شناسه رویداد</th>
                <th className="p-3">وضعیت</th>
                <th className="p-3">دفعات ارسال</th>
                <th className="p-3">پیام خطا</th>
                <th className="p-3">زمان ایجاد</th>
                <th className="p-3 text-center">جزئیات بسته</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {syncQueue.map(item => (
                <tr key={item.queue_id || item.event_id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 font-mono text-slate-500">{item.queue_id || '---'}</td>
                  <td className="p-3 font-mono font-bold text-indigo-300">{item.event_id}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      item.status === 'CONFIRMED'
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-800/60'
                        : item.status === 'PENDING'
                        ? 'bg-amber-950 text-amber-300 border-amber-800/60'
                        : item.status === 'UPLOADING'
                        ? 'bg-sky-950 text-sky-300 border-sky-800/60 animate-pulse'
                        : 'bg-rose-950 text-rose-300 border-rose-800/60'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="p-3 font-mono">{toPersianDigits(item.retry_count || 0)} بار</td>
                  <td className="p-3 text-rose-400 text-[11px]">
                    {item.error_message || '---'}
                  </td>
                  <td className="p-3 text-[11px] text-slate-400">
                    {formatPersianDateTime(item.created_at)}
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => {
                        const payload = item.event?.payload !== undefined ? item.event.payload : (item.event || item.payload || item);
                        setSelectedPayload({
                          event_id: item.event_id,
                          status: item.status,
                          entity_type: item.event?.entity_type || 'STOCK_EVENT',
                          created_at: item.created_at,
                          payload
                        });
                      }}
                      className="px-2.5 py-1 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-300 hover:text-white border border-indigo-800/60 text-[11px] font-medium flex items-center gap-1.5 mx-auto transition-colors cursor-pointer shadow-xs"
                      title="مشاهده ساختار کامل داده و جیسون رویداد"
                    >
                      <Code className="w-3.5 h-3.5 text-indigo-400" />
                      <span>مشاهده JSON</span>
                    </button>
                  </td>
                </tr>
              ))}

              {syncQueue.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-500">
                    صف ارسال همگام‌سازی خالی است. تمامی تغییرات محلی با سرور مرکزی تطبیق یافته‌اند.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* LIVE APP & SYNC LOG CONSOLE (باکس لاگ زنده برنامه و همگام‌سازی) */}
      <div className="bg-slate-950/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl space-y-0">
        
        {/* Console Header Bar */}
        <div className="bg-slate-900/90 px-4 py-3 border-b border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-950 border border-emerald-800/80 text-emerald-400 flex items-center justify-center">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs sm:text-sm font-bold text-white">باکس لاگ زنده برنامه و پایگاه داده ابری (Live Sync Console)</h3>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 text-[10px] font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>متصل به کلودفلر D1</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                ثبت بلادرنگ تبادل داده بین دیتابیس محلی کلاینت و پایگاه داده ابری مرکزی Cloudflare
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap self-end md:self-auto">
            {/* Ping Test Button */}
            <button
              onClick={handleTestCloudflarePing}
              disabled={isTestingPing}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              title="بررسی اتصال مستقیم به نقطه پایانی کلودفلر D1"
            >
              <Wifi className={`w-3.5 h-3.5 text-cyan-400 ${isTestingPing ? 'animate-pulse' : ''}`} />
              <span>{isTestingPing ? 'در حال پینگ...' : 'تست اتصال D1'}</span>
            </button>

            {/* Copy Logs Button */}
            <button
              onClick={handleCopyLogs}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              title="کپی متن تمامی لاگ‌ها در حافظه کلیپ‌بورد"
            >
              {copiedLogs ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-300" />}
              <span>{copiedLogs ? 'کپی شد' : 'کپی لاگ‌ها'}</span>
            </button>

            {/* Clear Logs Button */}
            <button
              onClick={() => SyncEngine.clearLogs()}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-950/50 hover:text-rose-300 text-slate-400 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              title="پاک‌سازی صفحه لاگ‌ها"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>پاک‌سازی</span>
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="bg-slate-900/40 px-4 py-2 border-b border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 flex-wrap gap-2">
          <div className="flex items-center gap-1.5">
            <span>فیلتر نمایش:</span>
            <button
              onClick={() => setLogFilter('all')}
              className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${logFilter === 'all' ? 'bg-indigo-600 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'}`}
            >
              همه ({toPersianDigits(logs.length)})
            </button>
            <button
              onClick={() => setLogFilter('d1')}
              className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${logFilter === 'd1' ? 'bg-indigo-600 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'}`}
            >
              رویدادهای D1
            </button>
            <button
              onClick={() => setLogFilter('sse')}
              className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${logFilter === 'sse' ? 'bg-indigo-600 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'}`}
            >
              جریان زنده SSE
            </button>
            <button
              onClick={() => setLogFilter('error')}
              className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${logFilter === 'error' ? 'bg-rose-600 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'}`}
            >
              هشدارها و خطاها
            </button>
          </div>

          <div className="text-slate-500 font-mono text-[10px]">
            آدرس پایگاه داده: <span className="text-slate-400">anbar.mgas.ir</span>
          </div>
        </div>

        {/* Terminal Screen Body */}
        <div className="p-3 sm:p-4 bg-slate-950 font-mono text-xs overflow-y-auto max-h-80 min-h-[160px] space-y-1.5 select-text">
          {filteredLogs.length === 0 ? (
            <div className="text-slate-600 text-center py-8">
              هیچ لاگی با فیلتر انتخابی یافت نشد. لاگ‌ها به صورت خودکار با وقوع رویدادها در این قسمت نمایش داده می‌شوند.
            </div>
          ) : (
            filteredLogs.map(log => (
              <div
                key={log.id}
                className="flex items-start gap-2 py-0.5 hover:bg-slate-900/60 px-1.5 rounded transition-colors text-right"
              >
                <span className="text-slate-500 shrink-0 text-[10px] select-none font-mono">
                  {formatLogTime(log.timestamp)}
                </span>

                <span className={`px-1.5 py-0.2 rounded text-[10px] shrink-0 font-bold ${
                  log.level === 'success'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                    : log.level === 'warn'
                    ? 'bg-amber-950 text-amber-400 border border-amber-800/60'
                    : log.level === 'error'
                    ? 'bg-rose-950 text-rose-400 border border-rose-800/60'
                    : 'bg-cyan-950 text-cyan-400 border border-cyan-800/60'
                }`}>
                  [{log.source}]
                </span>

                <span className={`flex-1 break-words leading-relaxed ${
                  log.level === 'success'
                    ? 'text-emerald-300'
                    : log.level === 'warn'
                    ? 'text-amber-300'
                    : log.level === 'error'
                    ? 'text-rose-400 font-bold'
                    : 'text-slate-300'
                }`}>
                  {log.message}
                </span>

                {log.details && (
                  <button
                    onClick={() => setSelectedPayload(log.details)}
                    className="text-[10px] text-indigo-400 hover:text-indigo-200 underline cursor-pointer shrink-0"
                  >
                    جزییات
                  </button>
                )}
              </div>
            ))
          )}
          <div ref={logsEndRef} />
        </div>
      </div>

      {/* PAYLOAD MODAL */}
      {selectedPayload !== null && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setSelectedPayload(null)}
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl shadow-2xl p-4 sm:p-5 space-y-3 cursor-default"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-indigo-400" />
                <h4 className="text-xs sm:text-sm font-bold text-white">
                  محتوای بسته رویداد همگام‌سازی (JSON Payload)
                </h4>
                {selectedPayload?.event_id && (
                  <span className="font-mono text-[10px] text-cyan-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    {selectedPayload.event_id}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelectedPayload(null)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              >
                ✕ بستن
              </button>
            </div>

            <pre className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-80 leading-relaxed select-all">
              {typeof selectedPayload === 'string'
                ? selectedPayload
                : JSON.stringify(selectedPayload, null, 2)}
            </pre>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
              <button
                type="button"
                onClick={handleCopyPayload}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                {copiedPayload ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">کپی شد!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>کپی ساختار JSON</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setSelectedPayload(null)}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer transition-colors shadow-md shadow-indigo-600/20"
              >
                تأیید و بستن
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
