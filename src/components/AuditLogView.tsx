import React, { useState, useEffect } from 'react';
import { AuditLog, RuntimeEnvironment, User } from '../types';
import {
  ShieldCheck,
  Search,
  User as UserIcon,
  Laptop,
  Calendar,
  Layers,
  Code
} from 'lucide-react';
import {
  formatPersianDateTime,
  toPersianDigits
} from '../utils/persian';

interface AuditLogViewProps {
  auditLogs: AuditLog[];
  currentEnv: RuntimeEnvironment;
  currentUser: User;
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({
  auditLogs,
  currentEnv,
  currentUser
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDetails, setSelectedDetails] = useState<any | null>(null);

  // Global Escape key listener to close modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedDetails(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filtered = [...auditLogs]
    .reverse()
    .filter(log =>
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entity_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entity_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.device_id.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <span>دفتر ثبت ممیزی امنیتی و ردیابی رویدادها (Immutable Audit Trail)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            ثبت غیرقابل تغییر اینکه چه کسی (Who)، در چه دستگاهی (Where)، در چه زمانی (When)، چه تغییری (What) اعمال کرده است.
          </p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="جستجو در نام کاربر، شناسه دستگاه یا نوع عملیات..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-3 pr-9 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
      </div>

      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs min-w-[760px]">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 text-[11px]">
              <tr>
                <th className="p-3">ردیف</th>
                <th className="p-3">عملیات (Action)</th>
                <th className="p-3">نوع موجودیت</th>
                <th className="p-3">شناسه موجودیت</th>
                <th className="p-3">کاربر عامل</th>
                <th className="p-3">دستگاه ثبت</th>
                <th className="p-3">شناسه رویداد</th>
                <th className="p-3">زمان ثبت دقیق</th>
                <th className="p-3 text-center">جزئیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {filtered.map((log, idx) => (
                <tr key={log.audit_id || log.event_id || `audit-${idx}`} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 font-mono text-slate-500">{toPersianDigits(idx + 1)}</td>
                  <td className="p-3 font-bold text-slate-100">
                    <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/50 text-[10px]">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-slate-300">{log.entity_type}</td>
                  <td className="p-3 font-mono text-[11px] text-slate-400">{log.entity_id}</td>
                  <td className="p-3 font-mono text-slate-200">{log.user_id}</td>
                  <td className="p-3 font-mono text-[11px] text-slate-400">{log.device_id}</td>
                  <td className="p-3 font-mono text-[10px] text-slate-500 truncate max-w-[100px]" title={log.event_id}>
                    {log.event_id || '-'}
                  </td>
                  <td className="p-3 text-[11px] text-slate-400">{formatPersianDateTime(log.timestamp)}</td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => setSelectedDetails(log.metadata || (log as any).details || { action: log.action, entity: log.entity_type })}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] transition-colors"
                    >
                      مشاهده
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedDetails && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setSelectedDetails(null)}
        >
          <div
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-4 space-y-3 cursor-default"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Code className="w-4 h-4 text-indigo-400" />
                <span>جزئیات رویداد ممیزی (Audit Details)</span>
              </h4>
              <button onClick={() => setSelectedDetails(null)} className="text-slate-400 hover:text-white text-xs">
                بستن
              </button>
            </div>
            <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-cyan-300 overflow-x-auto max-h-60 leading-relaxed">
              {JSON.stringify(selectedDetails, null, 2)}
            </pre>
            <div className="text-right">
              <button
                onClick={() => setSelectedDetails(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
