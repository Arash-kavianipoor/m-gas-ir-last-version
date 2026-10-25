import React, { useState } from 'react';
import {
  StockMovement,
  Product,
  Warehouse,
  MovementType,
  RuntimeEnvironment,
  User,
  Customer,
  Supplier
} from '../types';
import {
  ArrowLeftRight,
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  Filter,
  FileSpreadsheet,
  Download,
  Calendar,
  Layers,
  LayoutGrid,
  List,
  X,
  Flame,
  CheckCircle2
} from 'lucide-react';
import {
  formatPersianDateTime,
  toPersianDigits,
  formatCurrencyToman
} from '../utils/persian';
import { SEED_USERS } from '../database/seed-data';
import { ValveEntryModal } from './ValveEntryModal';

interface MovementsViewProps {
  stockMovements: StockMovement[];
  products: Product[];
  warehouses: Warehouse[];
  users?: User[];
  currentEnv: RuntimeEnvironment;
  currentUser: User;
  onOpenNewMovement: () => void;
  customers?: Customer[];
  suppliers?: Supplier[];
  onRefresh?: () => void;
}

export const MovementsView: React.FC<MovementsViewProps> = ({
  stockMovements,
  products,
  warehouses,
  users,
  currentEnv,
  currentUser,
  onOpenNewMovement,
  customers = [],
  suppliers = [],
  onRefresh
}) => {
  const allUsers = users && users.length > 0 ? users : SEED_USERS;
  const [showValveIntakeModal, setShowValveIntakeModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [whFilter, setWhFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>(() => 
    typeof window !== 'undefined' && window.innerWidth < 768 ? 'cards' : 'table'
  );

  const filtered = stockMovements.filter(m => {
    const prod = products.find(p => p.product_id === m.product_id);
    const matchSearch =
      m.reference_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.movement_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (prod && prod.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (prod && prod.sku.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchType =
      typeFilter === 'ALL' ||
      (typeFilter === 'TRANSFER'
        ? m.movement_type === 'TRANSFER_IN' || m.movement_type === 'TRANSFER_OUT'
        : m.movement_type === typeFilter);
    const matchWh =
      whFilter === 'ALL' ||
      m.warehouse_id === whFilter ||
      m.to_warehouse_id === whFilter ||
      m.destination_warehouse_id === whFilter;

    return matchSearch && matchType && matchWh;
  });

  const getMovementBadge = (type: MovementType) => {
    switch (type) {
      case 'STOCK_IN':
      case 'PURCHASE':
      case 'RETURN_IN':
        return {
          label: 'ورود به انبار (رسید)',
          className: 'bg-emerald-950 text-emerald-300 border-emerald-700/50',
          icon: ArrowDownLeft
        };
      case 'STOCK_OUT':
      case 'SALE':
      case 'RETURN_OUT':
        return {
          label: 'خروج از انبار (حواله)',
          className: 'bg-rose-950 text-rose-300 border-rose-700/50',
          icon: ArrowUpRight
        };
      case 'TRANSFER_IN':
        return {
          label: 'انتقال (ورود به مقصد)',
          className: 'bg-cyan-950 text-cyan-300 border-cyan-700/50',
          icon: ArrowLeftRight
        };
      case 'TRANSFER_OUT':
        return {
          label: 'انتقال (خروج از مبدأ)',
          className: 'bg-indigo-950 text-indigo-300 border-indigo-700/50',
          icon: ArrowLeftRight
        };
      case 'ADJUSTMENT':
        return {
          label: 'تعدیل انبارگردانی',
          className: 'bg-amber-950 text-amber-300 border-amber-700/50',
          icon: Layers
        };
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-indigo-400" />
            <span>دفتر کل گردش کالا و اسناد انبار (Stock Movements Ledger)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            لجر غیرقابل بازگشت (Immutable Ledger) - هیچ سطری ویرایش یا حذف مستقیم نمی‌شود؛ اصلاحات با سند عکس ثبت می‌گردند.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Action button: Dedicated Valve Intake */}
          <button
            type="button"
            onClick={() => setShowValveIntakeModal(true)}
            className="px-4 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 rounded-lg flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            title="ورودی شیرآلات (شیر نو و کهنه ۱۱ کیلویی، پرسی، بوتان، ایران‌گازی، لیفتراک، عراقی و پیک‌نیک) و ارسال اعلان به خانم کرمی"
          >
            <Flame className="w-4 h-4 text-teal-950" />
            <span>ورودی شیرآلات</span>
          </button>

          <button
            type="button"
            onClick={onOpenNewMovement}
            className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>ثبت سند گردش جدید</span>
          </button>
        </div>
      </div>

      {/* Action Toast Banner */}
      {toastMessage && (
        <div className={`rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs border shadow-md ${
          toastMessage.type === 'success'
            ? 'bg-teal-950/90 border-teal-700/80 text-teal-200'
            : 'bg-amber-950/90 border-amber-700/80 text-amber-200'
        }`}>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />
            <span className="font-medium">{toastMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filters - Fully Responsive on Mobile & Tablet */}
      <div className="bg-slate-900/60 p-3 sm:p-4 rounded-xl border border-slate-800 space-y-3">
        {/* Search */}
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="جستجو در شماره سند، بارنامه، نام کالا یا کد SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-9 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 shadow-inner font-sans"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter controls row */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[260px]">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="flex-1 sm:flex-initial bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 px-3 py-1.5 focus:outline-hidden focus:border-indigo-500 cursor-pointer shadow-xs min-w-[130px]"
            >
              <option value="ALL">همه انواع گردش</option>
              <option value="STOCK_IN">رسید ورود</option>
              <option value="STOCK_OUT">حواله خروج</option>
              <option value="TRANSFER">انتقال بین انبارها</option>
              <option value="ADJUSTMENT">تعدیل موجودی</option>
            </select>

            <select
              value={whFilter}
              onChange={(e) => setWhFilter(e.target.value)}
              className="flex-1 sm:flex-initial bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 px-3 py-1.5 focus:outline-hidden focus:border-indigo-500 cursor-pointer shadow-xs min-w-[130px]"
            >
              <option value="ALL">همه انبارها</option>
              {warehouses.map(w => (
                <option key={w.warehouse_id} value={w.warehouse_id}>
                  {w.name} {w.shelf_location ? `(قفسه ${w.shelf_location})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* View Mode Toggle: Cards vs Table */}
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 p-0.5 rounded-xl shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
              title="نمایش جدولی اسناد گردش"
            >
              <List className="w-3.5 h-3.5" />
              <span>جدول</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
              title="نمایش کارتی اسناد گردش (بهینه برای موبایل و تبلت)"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>کارتی</span>
            </button>
          </div>
        </div>
      </div>

      {/* Movements View: Table or Responsive Cards */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filtered.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-400 bg-slate-900/80 border border-slate-800 rounded-2xl">
              <Layers className="w-12 h-12 mx-auto mb-2 text-slate-600 opacity-50" />
              <div className="font-bold text-slate-300 text-sm">هیچ سندی با فیلترهای انتخابی یافت نشد</div>
            </div>
          ) : (
            filtered.map(m => {
              const prod = products.find(p => p.product_id === m.product_id);
              const wh = warehouses.find(w => w.warehouse_id === m.warehouse_id);
              const badge = getMovementBadge(m.movement_type);
              const BadgeIcon = badge.icon;
              const isPositive =
                m.movement_type === 'STOCK_IN' ||
                m.movement_type === 'PURCHASE' ||
                m.movement_type === 'RETURN_IN';

              return (
                <div
                  key={m.movement_id}
                  className="bg-slate-900/90 border border-slate-800 hover:border-indigo-500/60 rounded-2xl p-4 transition-all shadow-md flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2.5">
                      <div>
                        <span className="font-mono font-bold text-indigo-300 text-sm block">
                          {m.reference_id}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {m.movement_id}
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium border inline-flex items-center gap-1 ${badge.className}`}>
                        <BadgeIcon className="w-3 h-3" />
                        <span>{badge.label}</span>
                      </span>
                    </div>

                    <div className="space-y-1.5 border-t border-slate-800/80 pt-2.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">کالا:</span>
                        <span className="font-bold text-slate-100">{prod?.name || m.product_id}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">کد SKU:</span>
                        <span className="font-mono text-indigo-400">{prod?.sku || '---'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">انبار:</span>
                        <div className="text-left font-medium text-slate-200">
                          {m.movement_type === 'TRANSFER_OUT' && m.to_warehouse_id ? (
                            <span className="text-[11px] text-indigo-300 font-semibold">
                              از {wh?.name || m.warehouse_id} ➔ {warehouses.find(w => w.warehouse_id === m.to_warehouse_id)?.name || m.to_warehouse_id}
                            </span>
                          ) : m.movement_type === 'TRANSFER_IN' && m.to_warehouse_id ? (
                            <span className="text-[11px] text-cyan-300 font-semibold">
                              در {wh?.name || m.warehouse_id} ⬅ از {warehouses.find(w => w.warehouse_id === m.to_warehouse_id)?.name || m.to_warehouse_id}
                            </span>
                          ) : (
                            wh?.name || m.warehouse_id
                          )}
                        </div>
                      </div>
                      {m.item_condition && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">وضعیت کالا:</span>
                          {m.item_condition === 'DEFECTIVE' ? (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800">
                              معیوب شده (ضایعات/اسقاط)
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                              سالم (نو و قابل استفاده)
                            </span>
                          )}
                        </div>
                      )}
                      {(m.shelf_location || wh?.shelf_location) && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">قفسه:</span>
                          <span className="font-mono text-indigo-300 font-bold">{m.shelf_location || wh?.shelf_location}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">کاربر ثبت:</span>
                        <div className="text-left">
                          <span className="font-mono text-xs text-indigo-300 font-bold block">
                            @{m.created_by_username || (allUsers.find(u => u.user_id === m.user_id)?.username) || 'amouei'}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {allUsers.find(u => u.user_id === m.user_id)?.full_name || m.user_id}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                        <span>زمان ثبت:</span>
                        <span>{formatPersianDateTime(m.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800/90 mt-3 flex items-center justify-between">
                    <span className="text-xs text-slate-400">مقدار تغییر:</span>
                    <span className={`font-mono text-base font-black ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isPositive ? '+' : '-'}{toPersianDigits(m.quantity)} {prod?.unit || 'عدد'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          {/* Mobile Horizontal Scroll Indicator Banner */}
          <div className="lg:hidden flex items-center justify-between px-3 py-1.5 bg-slate-950/80 border-b border-slate-800 text-[11px] text-indigo-300 select-none">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse inline-block" />
              <span>جدول گردش اسناد را به چپ یا راست بکشید (اسکرول لمسی)</span>
            </span>
            <span className="text-slate-500 font-mono text-[10px]">۸ ستون گردش ⇄</span>
          </div>

          <div className="overflow-x-auto -webkit-overflow-scrolling-touch overscroll-x-contain relative">
            <table className="w-full text-right text-xs min-w-[760px] sm:min-w-[850px] border-collapse">
              <thead className="bg-slate-950/95 text-slate-400 border-b border-slate-800 text-[11px] select-none">
                <tr>
                  <th className="p-3 sticky right-0 z-20 bg-slate-950 border-b border-slate-800 shadow-[-2px_0_4px_rgba(0,0,0,0.4)] min-w-[150px]">شماره سند / پیگیری</th>
                  <th className="p-3">نام و کد کالا</th>
                  <th className="p-3">نوع گردش</th>
                  <th className="p-3">انبار</th>
                  <th className="p-3">مقدار / تغییر</th>
                  <th className="p-3 print:hidden" data-no-print="true">کاربر و دستگاه</th>
                  <th className="p-3">شناسه رویداد همگام‌سازی</th>
                  <th className="p-3">زمان ثبت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {filtered.map(m => {
                  const prod = products.find(p => p.product_id === m.product_id);
                  const wh = warehouses.find(w => w.warehouse_id === m.warehouse_id);
                  const badge = getMovementBadge(m.movement_type);
                  const BadgeIcon = badge.icon;
                  const isPositive =
                    m.movement_type === 'STOCK_IN' ||
                    m.movement_type === 'PURCHASE' ||
                    m.movement_type === 'RETURN_IN';

                  return (
                    <tr key={m.movement_id} className="hover:bg-slate-800/40 transition-colors group">
                      <td className="p-3 sticky right-0 z-10 bg-slate-900 group-hover:bg-slate-850 shadow-[-2px_0_4px_rgba(0,0,0,0.4)] transition-colors">
                        <div className="font-mono font-bold text-slate-100">{m.reference_id}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{m.movement_id}</div>
                      </td>

                      <td className="p-3">
                        <div className="font-bold text-slate-200">{prod?.name || m.product_id}</div>
                        <div className="text-[10px] font-mono text-indigo-400">{prod?.sku}</div>
                      </td>

                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium border inline-flex items-center gap-1 ${badge.className}`}>
                          <BadgeIcon className="w-3 h-3" />
                          <span>{badge.label}</span>
                        </span>
                      </td>

                      <td className="p-3 text-slate-300">
                        <div className="font-medium text-slate-200">
                          {m.movement_type === 'TRANSFER_OUT' && m.to_warehouse_id ? (
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-slate-300">{wh?.name || m.warehouse_id}</span>
                              <span className="text-indigo-400 font-black">➔</span>
                              <span className="text-indigo-300 font-semibold">{warehouses.find(w => w.warehouse_id === m.to_warehouse_id)?.name || m.to_warehouse_id}</span>
                            </div>
                          ) : m.movement_type === 'TRANSFER_IN' && m.to_warehouse_id ? (
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-slate-300">{wh?.name || m.warehouse_id}</span>
                              <span className="text-cyan-400 font-black">⬅</span>
                              <span className="text-cyan-300 text-[11px] font-semibold">(از {warehouses.find(w => w.warehouse_id === m.to_warehouse_id)?.name || m.to_warehouse_id})</span>
                            </div>
                          ) : (
                            wh?.name || m.warehouse_id
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          {(m.shelf_location || wh?.shelf_location) && (
                            <span className="text-[10px] font-mono text-indigo-400">
                              قفسه: {m.shelf_location || wh?.shelf_location}
                            </span>
                          )}
                          {m.item_condition === 'DEFECTIVE' && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-950 text-rose-300 border border-rose-800">
                              معیوب شده (ضایعات)
                            </span>
                          )}
                          {m.item_condition === 'HEALTHY' && (m.movement_type === 'TRANSFER_IN' || m.movement_type === 'TRANSFER_OUT') && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                              سالم
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-3">
                        <span className={`font-mono text-sm font-black ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isPositive ? '+' : '-'}{toPersianDigits(m.quantity)} {prod?.unit || 'عدد'}
                        </span>
                      </td>

                      <td className="p-3 print:hidden" data-no-print="true" data-user-badge="true">
                        <div className="font-mono font-bold text-xs text-indigo-300">
                          @{m.created_by_username || (allUsers.find(u => u.user_id === m.user_id)?.username) || 'amouei'}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {allUsers.find(u => u.user_id === m.user_id)?.full_name || m.user_id}
                        </div>
                      </td>

                      <td className="p-3 font-mono text-[10px] text-slate-400 truncate max-w-[120px]" title={m.event_id}>
                        {m.event_id}
                      </td>

                      <td className="p-3 text-[11px] text-slate-400">
                        {formatPersianDateTime(m.created_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Dedicated Valve Intake (ورودی شیرآلات به انبار و گردش کالا) */}
      {showValveIntakeModal && (
        <ValveEntryModal
          isOpen={showValveIntakeModal}
          onClose={() => setShowValveIntakeModal(false)}
          currentEnv={currentEnv}
          currentUser={currentUser}
          currentCustomerId={customers && customers[0]?.customer_id ? customers[0].customer_id : ''}
          customers={customers || []}
          suppliers={suppliers}
          onSuccess={(result) => {
            setShowValveIntakeModal(false);
            if (onRefresh) onRefresh();
            setToastMessage({
              text: `ورودی شیرآلات برگه «${result.sheetNumber}» (${toPersianDigits(result.totalAllValves)} عدد) با موفقیت در گردش و موجودی انبار ثبت گردید.`,
              type: 'success'
            });
            setTimeout(() => setToastMessage(null), 8000);
          }}
        />
      )}

    </div>
  );
};
