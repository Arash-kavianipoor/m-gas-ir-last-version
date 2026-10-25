import React, { useState, useMemo } from 'react';
import {
  Product,
  Customer,
  Supplier,
  Warehouse,
  StockMovement,
  SyncState,
  RuntimeEnvironment,
  User,
  Category,
  GasKardexEntry
} from '../types';
import {
  TrendingUp,
  Boxes,
  PlusCircle,
  FileSpreadsheet,
  RefreshCw,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  Warehouse as WarehouseIcon,
  Layers,
  Info,
  Database,
  Clock,
  Coins,
  AlertOctagon,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Flame,
  Wrench,
  Search,
  ArrowUpDown,
  Download,
  Filter,
  Users,
  ExternalLink,
  ShieldCheck,
  Disc,
  X,
  KeyRound,
  UserCheck
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { LocalStorageManager } from '../database/storage';
import {
  formatCurrencyToman,
  formatNumberFa,
  formatPersianDateTime,
  toPersianDigits
} from '../utils/persian';
import { triggerFileDownload } from '../utils/file-download';
import { TopTurnoverStockChart } from './TopTurnoverStockChart';
import { AbcAnalysisModal } from './AbcAnalysisModal';

interface DashboardViewProps {
  products: Product[];
  customers: Customer[];
  suppliers: Supplier[];
  warehouses: Warehouse[];
  stockMovements: StockMovement[];
  stockQuantities: Record<string, Record<string, number>>;
  syncState: SyncState;
  currentEnv: RuntimeEnvironment;
  currentUser: User;
  categories?: Category[];
  gasKardexEntries?: GasKardexEntry[];
  onSelectGasCustomer?: (customerId: string) => void;
  onNavigate: (tab: any, filter?: any) => void;
  onOpenNewMovement: () => void;
  onOpenBatchCustomer: () => void;
  onSyncNow: () => void;
  isSyncing: boolean;
  onOpenSecurity?: () => void;
  onOpenUsersManagement?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  products,
  customers,
  suppliers,
  warehouses,
  stockMovements,
  stockQuantities,
  syncState,
  currentEnv,
  currentUser,
  categories = [],
  gasKardexEntries,
  onSelectGasCustomer,
  onNavigate,
  onOpenNewMovement,
  onOpenBatchCustomer,
  onSyncNow,
  isSyncing,
  onOpenSecurity,
  onOpenUsersManagement
}) => {
  const [showAbcModal, setShowAbcModal] = useState(false);
  const [abcModalInitialTab, setAbcModalInitialTab] = useState<'ABC' | 'DEAD_STOCK'>('ABC');

  // Gas customer breakdown filter & search state
  const [gasSearchTerm, setGasSearchTerm] = useState('');
  const [gasBalanceFilter, setGasBalanceFilter] = useState<'ALL' | 'WITH_BALANCE' | 'CYLINDER_ONLY' | 'VALVE_ONLY' | 'WITH_ACTIVITY'>('ALL');
  const [gasSortField, setGasSortField] = useState<'CYLINDER_BALANCE' | 'VALVES_BALANCE' | 'NAME' | 'LAST_DATE'>('CYLINDER_BALANCE');
  const [gasSortAsc, setGasSortAsc] = useState(false);
  const [gasPage, setGasPage] = useState(1);
  const [gasItemsPerPage, setGasItemsPerPage] = useState<number>(10);

  // Strict check to hide Gas Kardex from warehouse keeper Hajivand
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

  // Enterprise Calculations for 500+ Items
  const metrics = useMemo(() => {
    let totalUnits = 0;
    let totalValue = 0;

    const outOfStockList: Product[] = [];
    const criticalList: Product[] = [];
    const warningList: Product[] = [];

    // Movement history lookup for Dead Stock analysis (items with no movement in last 60 days)
    const now = Date.now();
    const movementsByProduct = new Map<string, StockMovement[]>();
    stockMovements.forEach(m => {
      if (!movementsByProduct.has(m.product_id)) {
        movementsByProduct.set(m.product_id, []);
      }
      movementsByProduct.get(m.product_id)!.push(m);
    });

    const deadStockList: Array<{ product: Product; stock: number; value: number; days: number }> = [];

    // Valuation list for ABC
    const productValuations: Array<{ product: Product; stock: number; value: number }> = [];

    products.forEach(p => {
      let productQty = 0;
      const whMap = stockQuantities[p.product_id] || {};
      Object.values(whMap).forEach(q => {
        productQty += (q as number) || 0;
      });

      totalUnits += productQty;
      const pValue = productQty * (p.purchase_price || 0);
      totalValue += pValue;

      productValuations.push({ product: p, stock: productQty, value: pValue });

      // Multi-tier Triage Stock Levels
      if (productQty <= 0) {
        outOfStockList.push(p);
      } else if (productQty <= p.min_stock) {
        criticalList.push(p);
      } else if (productQty <= p.min_stock * 1.5) {
        warningList.push(p);
      }

      // Dead Stock Check
      const pMovs = movementsByProduct.get(p.product_id) || [];
      if (productQty > 0) {
        if (pMovs.length === 0) {
          deadStockList.push({ product: p, stock: productQty, value: pValue, days: 999 });
        } else {
          pMovs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          const lastDate = new Date(pMovs[0].created_at).getTime();
          const daysDiff = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));
          if (daysDiff >= 60) {
            deadStockList.push({ product: p, stock: productQty, value: pValue, days: daysDiff });
          }
        }
      }
    });

    // ABC Classification
    productValuations.sort((a, b) => b.value - a.value);
    let cumVal = 0;
    let countA = 0;
    let valueA = 0;
    let countB = 0;
    let valueB = 0;
    let countC = 0;
    let valueC = 0;

    productValuations.forEach((item, idx) => {
      cumVal += item.value;
      const pct = totalValue > 0 ? (cumVal / totalValue) * 100 : 0;
      if (pct <= 80 || idx < Math.max(1, Math.floor(productValuations.length * 0.2))) {
        countA++;
        valueA += item.value;
      } else if (pct <= 95 || idx < Math.max(2, Math.floor(productValuations.length * 0.5))) {
        countB++;
        valueB += item.value;
      } else {
        countC++;
        valueC += item.value;
      }
    });

    const deadStockCapital = deadStockList.reduce((acc, curr) => acc + curr.value, 0);

    // Category breakdown counts
    const categoryCounts: Record<string, number> = {};
    products.forEach(p => {
      categoryCounts[p.category_id] = (categoryCounts[p.category_id] || 0) + 1;
    });

    return {
      totalUnits,
      totalValue,
      outOfStockList,
      criticalList,
      warningList,
      deadStockList,
      deadStockCapital,
      countA,
      valueA,
      pctA: totalValue > 0 ? (valueA / totalValue) * 100 : 0,
      countB,
      valueB,
      pctB: totalValue > 0 ? (valueB / totalValue) * 100 : 0,
      countC,
      valueC,
      pctC: totalValue > 0 ? (valueC / totalValue) * 100 : 0,
      categoryCounts
    };
  }, [products, stockQuantities, stockMovements]);

  const recentMovements = useMemo(() => {
    return [...stockMovements]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 6);
  }, [stockMovements]);

  // Gas Kardex: Cumulative Per-Customer Calculations + Grand Totals Across All Customers
  const gasStats = useMemo(() => {
    const rawEntries = gasKardexEntries || LocalStorageManager.getState(currentEnv).gas_kardex_entries || [];

    // Map each customer's cumulative totals
    const customerMap = new Map<string, {
      customer_id: string;
      customer_name: string;
      customer_type?: string;
      city?: string;
      province?: string;
      cylinder_in: number;
      cylinder_out: number;
      cylinder_balance: number;
      new_valve_in: number;
      new_valve_out: number;
      new_valve_balance: number;
      used_valve_in: number;
      used_valve_out: number;
      used_valve_balance: number;
      total_valves_balance: number;
      scrap_balance: number;
      defective_total: number;
      dispatched_total: number;
      transaction_count: number;
      last_date: string;
    }>();

    // 1. Initialize with all registered customers
    customers.forEach(c => {
      customerMap.set(c.customer_id, {
        customer_id: c.customer_id,
        customer_name: c.name,
        customer_type: c.customer_type,
        city: c.city,
        province: c.province,
        cylinder_in: 0,
        cylinder_out: 0,
        cylinder_balance: 0,
        new_valve_in: 0,
        new_valve_out: 0,
        new_valve_balance: 0,
        used_valve_in: 0,
        used_valve_out: 0,
        used_valve_balance: 0,
        total_valves_balance: 0,
        scrap_balance: 0,
        defective_total: 0,
        dispatched_total: 0,
        transaction_count: 0,
        last_date: ''
      });
    });

    // 2. Accumulate entries from kardex ledger
    rawEntries.forEach(entry => {
      let cust = customerMap.get(entry.customer_id);
      if (!cust) {
        cust = {
          customer_id: entry.customer_id,
          customer_name: entry.customer_name || entry.customer_id,
          cylinder_in: 0,
          cylinder_out: 0,
          cylinder_balance: 0,
          new_valve_in: 0,
          new_valve_out: 0,
          new_valve_balance: 0,
          used_valve_in: 0,
          used_valve_out: 0,
          used_valve_balance: 0,
          total_valves_balance: 0,
          scrap_balance: 0,
          defective_total: 0,
          dispatched_total: 0,
          transaction_count: 0,
          last_date: ''
        };
        customerMap.set(entry.customer_id, cust);
      }

      const cIn = Number(entry.cylinder_in) || 0;
      const cOut = Number(entry.cylinder_out) || 0;
      const nvIn = Number(entry.new_valve_in) || 0;
      const nvOut = Number(entry.new_valve_out) || 0;
      const uvIn = Number(entry.used_valve_in) || 0;
      const uvOut = Number(entry.used_valve_out) || 0;
      const scrap = Number(entry.scrap_out) || 0;
      const scrapStock = Number(entry.scrap_stock_in) || 0;
      const def = Number(entry.defective) || 0;
      const disp = typeof entry.dispatched === 'number' ? entry.dispatched : (parseFloat(String(entry.dispatched || '')) || (entry.dispatched ? 1 : 0));

      cust.cylinder_in += cIn;
      cust.cylinder_out += cOut;
      const totalCylinderExit = cOut + scrap;
      const cylinderScrapDeduction = scrapStock > 0 ? scrapStock : 0;
      cust.cylinder_balance += (cIn - totalCylinderExit - cylinderScrapDeduction);

      cust.new_valve_in += nvIn;
      cust.new_valve_out += nvOut;
      const valveScrap = (cIn === 0 && cOut === 0) ? (scrapStock > 0 ? scrapStock : scrap) : 0;
      cust.new_valve_balance += (nvIn - nvOut - def - valveScrap);

      cust.used_valve_in += uvIn;
      cust.used_valve_out += uvOut;
      cust.used_valve_balance = Math.max(0, cust.used_valve_balance + (uvIn - uvOut));

      cust.total_valves_balance = cust.new_valve_balance + cust.used_valve_balance;

      // افزایش اتوماتیک ذخیره انبار ضایعات به مانده ذخیره ضایعات
      if (scrapStock > 0 || scrap > 0) {
        cust.scrap_balance = Math.max(0, cust.scrap_balance + scrapStock - scrap);
      } else if (entry.scrap_balance !== undefined && Number(entry.scrap_balance) > 0 && cust.scrap_balance === 0) {
        cust.scrap_balance = Number(entry.scrap_balance);
      }
      cust.defective_total += def;
      cust.dispatched_total += disp;
      cust.transaction_count += 1;

      if (!cust.last_date || (entry.date && entry.date > cust.last_date)) {
        cust.last_date = entry.date;
      }
    });

    const allCustomersList = Array.from(customerMap.values());

    // 3. Compute Grand Totals across ALL customers
    let grandCylinderIn = 0;
    let grandCylinderOut = 0;
    let grandCylinderBalance = 0;

    let grandNewValveIn = 0;
    let grandNewValveOut = 0;
    let grandNewValveBalance = 0;

    let grandUsedValveIn = 0;
    let grandUsedValveOut = 0;
    let grandUsedValveBalance = 0;

    let grandScrapBalance = 0;
    let grandDefectiveTotal = 0;
    let grandDispatchedTotal = 0;

    let countWithCylinderBalance = 0;
    let countWithValveBalance = 0;
    let countWithAnyBalance = 0;
    let countWithActivity = 0;

    allCustomersList.forEach(c => {
      grandCylinderIn += c.cylinder_in;
      grandCylinderOut += c.cylinder_out;
      grandCylinderBalance += c.cylinder_balance;

      grandNewValveIn += c.new_valve_in;
      grandNewValveOut += c.new_valve_out;
      grandNewValveBalance += c.new_valve_balance;

      grandUsedValveIn += c.used_valve_in;
      grandUsedValveOut += c.used_valve_out;
      grandUsedValveBalance += c.used_valve_balance;

      grandScrapBalance += c.scrap_balance;
      grandDefectiveTotal += c.defective_total;
      grandDispatchedTotal += c.dispatched_total;

      if (c.cylinder_balance !== 0) countWithCylinderBalance++;
      if (c.total_valves_balance !== 0) countWithValveBalance++;
      if (c.cylinder_balance !== 0 || c.total_valves_balance !== 0) countWithAnyBalance++;
      if (c.transaction_count > 0) countWithActivity++;
    });

    const grandTotalValvesBalance = grandNewValveBalance + grandUsedValveBalance;

    return {
      allCustomersList,
      grandCylinderIn,
      grandCylinderOut,
      grandCylinderBalance,
      grandNewValveIn,
      grandNewValveOut,
      grandNewValveBalance,
      grandUsedValveIn,
      grandUsedValveOut,
      grandUsedValveBalance,
      grandTotalValvesBalance,
      grandScrapBalance,
      grandDefectiveTotal,
      grandDispatchedTotal,
      countWithCylinderBalance,
      countWithValveBalance,
      countWithAnyBalance,
      countWithActivity,
      totalEntries: rawEntries.length
    };
  }, [gasKardexEntries, customers, currentEnv]);

  // Filtered and sorted gas customers
  const filteredGasCustomers = useMemo(() => {
    let list = gasStats.allCustomersList;

    if (gasSearchTerm.trim()) {
      const q = gasSearchTerm.trim().toLowerCase();
      list = list.filter(
        c =>
          c.customer_name.toLowerCase().includes(q) ||
          c.customer_id.toLowerCase().includes(q) ||
          (c.city && c.city.toLowerCase().includes(q))
      );
    }

    if (gasBalanceFilter === 'WITH_BALANCE') {
      list = list.filter(c => c.cylinder_balance !== 0 || c.total_valves_balance !== 0);
    } else if (gasBalanceFilter === 'CYLINDER_ONLY') {
      list = list.filter(c => c.cylinder_balance !== 0);
    } else if (gasBalanceFilter === 'VALVE_ONLY') {
      list = list.filter(c => c.total_valves_balance !== 0);
    } else if (gasBalanceFilter === 'WITH_ACTIVITY') {
      list = list.filter(c => c.transaction_count > 0);
    }

    return [...list].sort((a, b) => {
      let cmp = 0;
      if (gasSortField === 'CYLINDER_BALANCE') {
        cmp = b.cylinder_balance - a.cylinder_balance;
      } else if (gasSortField === 'VALVES_BALANCE') {
        cmp = b.total_valves_balance - a.total_valves_balance;
      } else if (gasSortField === 'LAST_DATE') {
        cmp = (b.last_date || '').localeCompare(a.last_date || '');
      } else if (gasSortField === 'NAME') {
        cmp = a.customer_name.localeCompare(b.customer_name, 'fa');
      }
      return gasSortAsc ? -cmp : cmp;
    });
  }, [gasStats.allCustomersList, gasSearchTerm, gasBalanceFilter, gasSortField, gasSortAsc]);

  const totalGasPages = Math.max(1, Math.ceil(filteredGasCustomers.length / gasItemsPerPage));
  const paginatedGasCustomers = useMemo(() => {
    const start = (gasPage - 1) * gasItemsPerPage;
    return filteredGasCustomers.slice(start, start + gasItemsPerPage);
  }, [filteredGasCustomers, gasPage, gasItemsPerPage]);

  const handleExportGasBalancesExcel = () => {
    const headers = [
      'ردیف',
      'کد مشتری',
      'نام طرف حساب',
      'نوع مشتری',
      'شهر / استان',
      'ورود سیلندر',
      'خروج سیلندر',
      'مانده سیلندر',
      'ورود شیرنو',
      'خروج شیرنو',
      'مانده شیرنو',
      'ورود شیرکهنه',
      'خروج شیرکهنه',
      'مانده شیرکهنه',
      'جمع کل مانده شیرآلات',
      'مانده ضایعات',
      'تعداد اسناد',
      'آخرین تاریخ ثبت'
    ];

    const dataRows = filteredGasCustomers.map((c, index) => [
      index + 1,
      c.customer_id,
      c.customer_name,
      c.customer_type || 'عمده',
      c.city || 'تهران',
      c.cylinder_in,
      c.cylinder_out,
      c.cylinder_balance,
      c.new_valve_in,
      c.new_valve_out,
      c.new_valve_balance,
      c.used_valve_in,
      c.used_valve_out,
      c.used_valve_balance,
      c.total_valves_balance,
      c.scrap_balance,
      c.transaction_count,
      c.last_date || '-'
    ]);

    const footerRow = [
      '',
      'جمع کل',
      'جمع کل تمام مشتریان',
      '-',
      '-',
      gasStats.grandCylinderIn,
      gasStats.grandCylinderOut,
      gasStats.grandCylinderBalance,
      gasStats.grandNewValveIn,
      gasStats.grandNewValveOut,
      gasStats.grandNewValveBalance,
      gasStats.grandUsedValveIn,
      gasStats.grandUsedValveOut,
      gasStats.grandUsedValveBalance,
      gasStats.grandTotalValvesBalance,
      gasStats.grandScrapBalance,
      gasStats.totalEntries,
      '-'
    ];

    const ws = XLSX.utils.aoa_to_sheet([headers, ...dataRows, footerRow]);
    ws['!views'] = [{ rightToLeft: true }];
    const wb = XLSX.utils.book_new();
    (wb as any).Workbook = { Views: [{ RTL: true }] };
    XLSX.utils.book_append_sheet(wb, ws, 'تراز شیر و سیلندر مشتریان');
    const fileName = `تراز_کل_شیر_و_سیلندر_مشتریان_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const isManagerAmouei = Boolean(
    currentUser && (
      currentUser.username === 'amouei' ||
      currentUser.user_id === 'USR-001' ||
      currentUser.role === 'ADMIN' ||
      currentUser.full_name?.includes('عمویی')
    )
  );

  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      {/* Welcome & Quick Action Bar - Responsive on Tablet & Mobile */}
      <div className="bg-white dark:bg-gradient-to-r dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/70 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm dark:shadow-xl flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 transition-colors">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-900 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 font-mono">
            {currentEnv === 'OFFICE_WIN11'
              ? 'OFFICE-PC-001'
              : currentEnv === 'WAREHOUSE_WIN7'
              ? 'WAREHOUSE-PC-001'
              : 'WEB-001'}
          </span>
          <h2
            className="text-base font-bold text-black dark:text-white flex items-center gap-1.5 cursor-help"
            title="سامانه مدیریت انبار و زنجیره توزیع ام گاز - معماری بهینه‌شده برای مدیریت بیش از ۵۰۰ قلم کالا با پشتیبانی کامل از کاردکس و همگام‌سازی"
          >
            <span>خوش آمدید، {currentUser.full_name}</span>
            <Info className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200" />
          </h2>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap w-full xl:w-auto">
          {/* Download Database of Current System */}
          <button
            onClick={(e) => triggerFileDownload('/mgas_local.db', 'mgas_local.db', e)}
            title="دانلود فایل پایگاه داده محلی این سیستم (mgas_local.db)"
            className="flex-1 sm:flex-initial px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-950 dark:bg-indigo-950/80 dark:hover:bg-indigo-900 dark:text-indigo-300 dark:hover:text-white border border-indigo-200 dark:border-indigo-700/60 text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm dark:shadow-md transition-all cursor-pointer whitespace-nowrap"
          >
            <Database className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span>دانلود دیتابیس همین سیستم (SQLite)</span>
          </button>

          {/* Quick ABC & Dead Stock Matrix Button */}
          <button
            type="button"
            onClick={() => {
              setAbcModalInitialTab('ABC');
              setShowAbcModal(true);
            }}
            title="تحلیل سه‌گانه ABC پارتو ۸۰/۲۰ و کالاهای راکد"
            className="flex-1 sm:flex-initial px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700 hover:border-indigo-500 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
          >
            <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
            <span>تحلیل ABC و راکد</span>
          </button>

          <button
            onClick={onOpenNewMovement}
            title="ثبت سند ورود و خروج انبار"
            className="flex-1 sm:flex-initial px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all cursor-pointer whitespace-nowrap"
          >
            <PlusCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span>ثبت سند</span>
          </button>

          <button
            onClick={onOpenBatchCustomer}
            title="ورود دسته‌ای اسامی مشتریان از فایل اکسل یا متن"
            className="flex-1 sm:flex-initial px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer whitespace-nowrap"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span>ورود دسته‌ای</span>
          </button>

          <button
            onClick={onSyncNow}
            disabled={isSyncing || syncState.status === 'OFFLINE'}
            title="همگام‌سازی فوری سه دیتابیس"
            className="flex-1 sm:flex-initial px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
          >
            <RefreshCw className={`w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 ${isSyncing ? 'animate-spin text-indigo-500' : ''}`} />
            <span>همگام‌سازی</span>
          </button>
        </div>
      </div>

      {/* ====================================================================== */}
      {/* MANAGER MOUSA AMOUEI: User Management & Password Change Section        */}
      {/* Strictly visible, active and accessible ONLY for Engineer Mousa Amouei */}
      {/* ====================================================================== */}
      {isManagerAmouei && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-600/15 to-amber-700/10 dark:from-amber-950/40 dark:via-slate-900 dark:to-amber-950/30 border-2 border-amber-400/80 dark:border-amber-500/50 rounded-2xl p-4 sm:p-5 shadow-md space-y-3.5 transition-all">
          <div className="flex flex-col items-stretch justify-start gap-3.5 border-b border-amber-300 dark:border-amber-600/30 pb-3.5 w-full">
            <div className="flex items-center gap-3 w-full">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <KeyRound className="w-5 h-5 animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-400/50">
                    پنل اختصاصی مهندس موسی عمویی
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    مدیریت حساب‌ها و رمز عبور
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-extrabold text-black dark:text-white mt-0.5">
                  بخش تغییر پسورد و مشخصات کاربران
                </h3>
              </div>
            </div>

            <div className="flex flex-col items-stretch gap-2 w-full">
              {onOpenUsersManagement && (
                <button
                  type="button"
                  onClick={onOpenUsersManagement}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-amber-600/30 transition-all cursor-pointer"
                >
                  <Users className="w-4 h-4" />
                  <span>ورود به بخش تغییر پسورد (منوی همگام‌سازی)</span>
                </button>
              )}
              {onOpenSecurity && (
                <button
                  type="button"
                  onClick={onOpenSecurity}
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-slate-700 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-600/60 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <KeyRound className="w-4 h-4 text-amber-600" />
                  <span>پنجره سریع تغییر پسورد</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick User Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {LocalStorageManager.getUsers(currentEnv).slice(0, 5).map((u) => (
              <div
                key={u.user_id}
                onClick={() => {
                  if (onOpenUsersManagement) onOpenUsersManagement();
                  else if (onOpenSecurity) onOpenSecurity();
                }}
                className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-amber-200 dark:border-amber-800/60 hover:border-amber-500 transition-all cursor-pointer flex flex-col justify-between gap-1.5 shadow-2xs group"
                title={`کلیک برای ویرایش مشخصات و تغییر رمز ${u.full_name}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-amber-700 dark:text-amber-400 font-bold">
                    @{u.username}
                  </span>
                  <span className="text-[9px] px-1 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold">
                    {u.role_title || u.role}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  {u.full_name}
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <span className="font-mono">{u.system_id || 'SYS-DEFAULT'}</span>
                  <span className="text-amber-600 dark:text-amber-400 font-bold group-hover:underline">تغییر پسورد ←</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* GAS KARDEX GRAND TOTALS: All Customers Cylinders & Valves Aggregate    */}
      {/* Strictly hidden from warehouse keeper Hajivand                        */}
      {/* ====================================================================== */}
      {!isHajivand && (
        <div className="bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-900/90 dark:to-cyan-950/40 border border-slate-200 dark:border-cyan-900/50 rounded-2xl p-4 sm:p-5 shadow-sm dark:shadow-xl space-y-4 transition-colors">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-100 dark:bg-cyan-950/90 border border-cyan-300 dark:border-cyan-700/60 flex items-center justify-center text-cyan-700 dark:text-cyan-400 shrink-0 shadow-sm">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-bold text-black dark:text-white flex items-center gap-1.5">
                  <span>تراز کلان کاردکس و جمع کلی شیر و سیلندرهای مانده از تمام مشتریان</span>
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950/90 text-cyan-900 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800/60 font-medium">
                  آمار تجمیعی کل
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                مجموع کپسول‌های گاز و انواع شیرآلات امانی نزد تمامی طرف‌های حساب با تفکیک ورود، خروج، شیر نو و شیر کهنه
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleExportGasBalancesExcel}
              className="w-full sm:w-auto px-2.5 sm:px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer whitespace-nowrap"
              title="دانلود فایل اکسل تراز کلان تمام مشتریان"
            >
              <Download className="w-3.5 h-3.5 text-white shrink-0" />
              <span>خروجی اکسل تراز کل</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('gas_kardex')}
              className="w-full sm:w-auto px-2.5 sm:px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-cyan-600/20 transition-all cursor-pointer whitespace-nowrap"
              title="ورود به سامانه کاردکس تعمیر سیلندر"
            >
              <Flame className="w-3.5 h-3.5 shrink-0" />
              <span>کاردکس تعمیر سیلندر ➔</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('gas_production_kardex')}
              className="w-full sm:w-auto px-2.5 sm:px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all cursor-pointer whitespace-nowrap"
              title="ورود به سامانه کاردکس تولید ام‌گاز (۱۰ رده محصول)"
            >
              <Boxes className="w-3.5 h-3.5 shrink-0" />
              <span>کاردکس تولید ام گاز ➔</span>
            </button>
          </div>
        </div>

        {/* 4 Grand Gas Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 sm:gap-4">
          
          {/* Card 1: Grand Total Cylinders Balance */}
          <div className="relative overflow-hidden bg-white dark:bg-gradient-to-b dark:from-slate-900/90 dark:via-slate-900/70 dark:to-slate-950 border border-slate-200 dark:border-cyan-900/50 hover:border-cyan-400 dark:hover:border-cyan-500/60 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-3.5 transition-all shadow-sm dark:shadow-md hover:shadow-md dark:hover:shadow-cyan-950/30 hover:-translate-y-0.5">
            <div className="absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-l from-cyan-400 via-cyan-500/80 to-transparent" />
            <div>
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-2">
                <span className="font-bold text-cyan-700 dark:text-cyan-300 flex items-center gap-1.5 tracking-tight">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 dark:bg-cyan-400 shrink-0" />
                  <span>جمع کل سیلندرهای مانده تمام مشتری‌ها</span>
                </span>
                <div className="w-8 h-8 rounded-xl bg-cyan-100 dark:bg-cyan-950/80 border border-cyan-300 dark:border-cyan-700/60 flex items-center justify-center text-cyan-700 dark:text-cyan-400 shrink-0 shadow-inner">
                  <Flame className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-black dark:text-white mb-1 flex items-baseline gap-2">
                <span className="font-mono text-cyan-600 dark:text-cyan-400 text-3xl sm:text-4xl font-black tracking-tight drop-shadow-sm font-mono-en" dir="ltr">
                  {formatNumberFa(gasStats.grandCylinderBalance)}
                </span>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">کپسول / سیلندر</span>
              </div>
              <div className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                مانده قطعی امانی نزد کلیه مشتریان فعال
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800/90 space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                  <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>کل ورود سیلندر:</span>
                </span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold font-mono-en" dir="ltr">
                  +{toPersianDigits(gasStats.grandCylinderIn)}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                  <ArrowUpRight className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                  <span>کل خروج سیلندر:</span>
                </span>
                <span className="font-mono text-rose-600 dark:text-rose-400 font-bold font-mono-en" dir="ltr">
                  -{toPersianDigits(gasStats.grandCylinderOut)}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-800/50 text-[11px]">
                <span>مشتریان دارای مانده سیلندر:</span>
                <span className="font-mono text-cyan-700 dark:text-cyan-300 font-bold font-mono-en" dir="ltr">
                  {toPersianDigits(gasStats.countWithCylinderBalance)} مشتری
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Grand Total Valves Balance (All Valves) */}
          <div className="relative overflow-hidden bg-white dark:bg-gradient-to-b dark:from-slate-900/90 dark:via-slate-900/70 dark:to-slate-950 border border-slate-200 dark:border-emerald-900/50 hover:border-emerald-400 dark:hover:border-emerald-500/60 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-3.5 transition-all shadow-sm dark:shadow-md hover:shadow-md dark:hover:shadow-emerald-950/30 hover:-translate-y-0.5">
            <div className="absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-l from-emerald-400 via-emerald-500/80 to-transparent" />
            <div>
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-2">
                <span className="font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5 tracking-tight">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 shrink-0" />
                  <span>جمع کل شیرآلات مانده تمام مشتری‌ها</span>
                </span>
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700/60 flex items-center justify-center text-emerald-700 dark:text-emerald-400 shrink-0 shadow-inner">
                  <Wrench className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-black dark:text-white mb-1 flex items-baseline gap-2">
                <span className="font-mono text-emerald-600 dark:text-emerald-400 text-3xl sm:text-4xl font-black tracking-tight drop-shadow-sm font-mono-en" dir="ltr">
                  {formatNumberFa(gasStats.grandTotalValvesBalance)}
                </span>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">عدد شیر (نو + کهنه)</span>
              </div>
              <div className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                مجموع کل شیر نو و کهنه مانده نزد مشتریان
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800/90 space-y-2">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/40 text-center">
                  <div className="text-[10px] text-emerald-700 dark:text-emerald-300 font-medium">شیر نو مانده</div>
                  <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm mt-0.5 font-mono-en" dir="ltr">
                    {formatNumberFa(gasStats.grandNewValveBalance)}
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/40 text-center">
                  <div className="text-[10px] text-amber-700 dark:text-amber-300 font-medium">شیر کهنه مانده</div>
                  <div className="font-mono font-bold text-amber-600 dark:text-amber-400 text-sm mt-0.5 font-mono-en" dir="ltr">
                    {formatNumberFa(gasStats.grandUsedValveBalance)}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-800/50 text-[11px]">
                <span>مشتریان دارای مانده شیرآلات:</span>
                <span className="font-mono text-emerald-700 dark:text-emerald-300 font-bold font-mono-en" dir="ltr">
                  {toPersianDigits(gasStats.countWithValveBalance)} مشتری
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Valve Flow & Scrap Monitor */}
          <div className="relative overflow-hidden bg-white dark:bg-gradient-to-b dark:from-slate-900/90 dark:via-slate-900/70 dark:to-slate-950 border border-slate-200 dark:border-amber-900/50 hover:border-amber-400 dark:hover:border-amber-500/60 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-3.5 transition-all shadow-sm dark:shadow-md hover:shadow-md dark:hover:shadow-amber-950/30 hover:-translate-y-0.5">
            <div className="absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-l from-amber-400 via-amber-500/80 to-transparent" />
            <div>
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-2">
                <span className="font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5 tracking-tight">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400 shrink-0" />
                  <span>گردش ورود/خروج و ضایعات شیرآلات</span>
                </span>
                <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700/60 flex items-center justify-center text-amber-700 dark:text-amber-400 shrink-0 shadow-inner">
                  <Layers className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-amber-700 dark:text-amber-300 mb-1 flex items-baseline gap-2">
                <span className="font-mono text-amber-600 dark:text-amber-400 text-3xl font-black tracking-tight font-mono-en" dir="ltr">
                  {formatNumberFa(gasStats.grandNewValveIn + gasStats.grandUsedValveIn)}
                </span>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">کل ورودی شیر</span>
              </div>
              <div className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                در برابر {formatNumberFa(gasStats.grandNewValveOut + gasStats.grandUsedValveOut)} عدد کل خروجی
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800/90 space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                <span className="text-slate-600 dark:text-slate-400">ورود شیر نو / خروج:</span>
                <span className="font-mono text-slate-900 dark:text-slate-200 font-bold font-mono-en" dir="ltr">
                  +{toPersianDigits(gasStats.grandNewValveIn)} / -{toPersianDigits(gasStats.grandNewValveOut)}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                <span className="text-slate-600 dark:text-slate-400">ورود کهنه / خروج:</span>
                <span className="font-mono text-slate-900 dark:text-slate-200 font-bold font-mono-en" dir="ltr">
                  +{toPersianDigits(gasStats.grandUsedValveIn)} / -{toPersianDigits(gasStats.grandUsedValveOut)}
                </span>
              </div>
              <div className="flex items-center justify-between text-rose-600 dark:text-rose-400 font-bold pt-1 border-t border-slate-200 dark:border-slate-800/50 text-[11px]">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 dark:bg-rose-400" />
                  <span>ضایعات اسقاطی ثبت شده:</span>
                </span>
                <span className="font-mono text-rose-600 dark:text-rose-300 font-bold font-mono-en" dir="ltr">
                  {formatNumberFa(gasStats.grandScrapBalance)} عدد
                </span>
              </div>
            </div>
          </div>

          {/* Card 4: Customer Coverage & Direct Kardex Action */}
          <div className="relative overflow-hidden bg-white dark:bg-gradient-to-b dark:from-slate-900/90 dark:via-slate-900/70 dark:to-slate-950 border border-slate-200 dark:border-indigo-900/50 hover:border-indigo-400 dark:hover:border-indigo-500/60 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-3.5 transition-all shadow-sm dark:shadow-md hover:shadow-md dark:hover:shadow-indigo-950/30 hover:-translate-y-0.5">
            <div className="absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-l from-indigo-400 via-indigo-500/80 to-transparent" />
            <div>
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-2">
                <span className="font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5 tracking-tight">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 shrink-0" />
                  <span>پوشش طرف‌های حساب و اسناد</span>
                </span>
                <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 border border-indigo-300 dark:border-indigo-700/60 flex items-center justify-center text-indigo-700 dark:text-indigo-400 shrink-0 shadow-inner">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-black dark:text-white mb-1 flex items-baseline gap-2">
                <span className="font-mono text-indigo-600 dark:text-indigo-400 text-3xl font-black tracking-tight font-mono-en" dir="ltr">
                  {toPersianDigits(gasStats.countWithAnyBalance)}
                </span>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">از {toPersianDigits(gasStats.allCustomersList.length)} مشتری دارای مانده</span>
              </div>
              <div className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                {toPersianDigits(gasStats.totalEntries)} سطر گردش کاردکس ثبت‌شده در سیستم
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800/90">
              <button
                type="button"
                onClick={() => onNavigate('gas_kardex')}
                className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer whitespace-nowrap"
              >
                <span>مشاهده دفتر کل کاردکس</span>
                <ChevronLeft className="w-4 h-4 mr-auto text-white" />
              </button>
            </div>
          </div>

        </div>
      </div>
      )}

      {/* Enterprise KPI Cards Grid (4 Advanced Metrics for 500+ Items) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        
        {/* KPI 1: Total Stock Units & Category Mix */}
        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between space-y-3 transition-colors">
          <div>
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-2">
              <span className="font-medium">کل موجودی فیزیکی انبارها</span>
              <Boxes className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="text-xl font-bold text-black dark:text-slate-100 mb-1">
              {formatNumberFa(metrics.totalUnits)} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">واحد کالا</span>
            </div>
            <div className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center justify-between">
              <span>تنوع کل اقلام:</span>
              <span className="font-bold text-indigo-700 dark:text-indigo-300 font-mono">
                {toPersianDigits(products.length)} قلم کالا
              </span>
            </div>
          </div>

          {/* Category distribution mini bar */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
              <span>توزیع در دسته‌ها:</span>
              <button
                type="button"
                onClick={() => onNavigate('inventory')}
                className="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer flex items-center gap-0.5"
              >
                <span>مشاهده کاتالوگ</span>
                <ChevronLeft className="w-3 h-3" />
              </button>
            </div>
            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
              {categories.map((c, i) => {
                const count = metrics.categoryCounts[c.category_id] || 0;
                const pct = products.length > 0 ? (count / products.length) * 100 : 0;
                const colors = ['bg-indigo-500', 'bg-cyan-500', 'bg-emerald-500', 'bg-amber-500', 'bg-pink-500'];
                return (
                  <div
                    key={c.category_id || `cat-bar-${i}`}
                    style={{ width: `${pct}%` }}
                    className={`${colors[i % colors.length]}`}
                    title={`${c.name}: ${toPersianDigits(count)} قلم (${toPersianDigits(pct.toFixed(0))}%)`}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* KPI 2: Total Valuation & ABC Pareto Breakdown */}
        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between space-y-3 transition-colors">
          <div>
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-2">
              <span title="بر اساس بهای تمام شده آخرین خرید" className="cursor-help flex items-center gap-1 font-medium">
                <span>ارزش ریالی موجودی (ABC)</span>
                <Info className="w-3 h-3 text-slate-400 dark:text-slate-500" />
              </span>
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">
              {formatCurrencyToman(metrics.totalValue)}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              ارزیابی بر مبنای آخرین بهای خرید
            </div>
          </div>

          {/* ABC Class breakdown badges */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 space-y-1.5">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-slate-500 dark:text-slate-400">تحلیل پارتو:</span>
              <button
                type="button"
                onClick={() => {
                  setAbcModalInitialTab('ABC');
                  setShowAbcModal(true);
                }}
                className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold cursor-pointer flex items-center gap-0.5"
              >
                <span>ماتریس ABC</span>
                <ChevronLeft className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-1 text-[10px] text-center">
              <div
                onClick={() => {
                  setAbcModalInitialTab('ABC');
                  setShowAbcModal(true);
                }}
                className="p-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-300 cursor-pointer hover:bg-emerald-100 transition-colors"
                title={`کلاس A: ${toPersianDigits(metrics.countA)} قلم کالا (${toPersianDigits(metrics.pctA.toFixed(0))}% از کل ارزش)`}
              >
                <div className="font-bold">A ({toPersianDigits(metrics.pctA.toFixed(0))}%)</div>
                <div className="text-[9px] text-slate-500 dark:text-slate-400">{toPersianDigits(metrics.countA)} قلم</div>
              </div>
              <div
                onClick={() => {
                  setAbcModalInitialTab('ABC');
                  setShowAbcModal(true);
                }}
                className="p-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/50 text-indigo-800 dark:text-indigo-300 cursor-pointer hover:bg-indigo-100 transition-colors"
                title={`کلاس B: ${toPersianDigits(metrics.countB)} قلم کالا (${toPersianDigits(metrics.pctB.toFixed(0))}% از کل ارزش)`}
              >
                <div className="font-bold">B ({toPersianDigits(metrics.pctB.toFixed(0))}%)</div>
                <div className="text-[9px] text-slate-500 dark:text-slate-400">{toPersianDigits(metrics.countB)} قلم</div>
              </div>
              <div
                onClick={() => {
                  setAbcModalInitialTab('ABC');
                  setShowAbcModal(true);
                }}
                className="p-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/50 text-amber-800 dark:text-amber-300 cursor-pointer hover:bg-amber-100 transition-colors"
                title={`کلاس C: ${toPersianDigits(metrics.countC)} قلم کالا (${toPersianDigits(metrics.pctC.toFixed(0))}% از کل ارزش)`}
              >
                <div className="font-bold">C ({toPersianDigits(metrics.pctC.toFixed(0))}%)</div>
                <div className="text-[9px] text-slate-500 dark:text-slate-400">{toPersianDigits(metrics.countC)} قلم</div>
              </div>
            </div>
          </div>
        </div>

        {/* KPI 3: Multi-Level Triage Alert (Zero Stock & Deficit) */}
        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between space-y-3 transition-colors">
          <div>
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-2">
              <span
                title="سامانه تریاژ فوری اقلام در مرز بحران با قابلیت فیلتر مستقیم"
                className="cursor-help flex items-center gap-1 font-medium"
              >
                <span>تریاژ هشدار نقطه سفارش</span>
                <Info className="w-3 h-3 text-slate-400 dark:text-slate-500" />
              </span>
              <AlertTriangle
                className={`w-4 h-4 ${
                  metrics.outOfStockList.length > 0
                    ? 'text-rose-500 animate-bounce'
                    : metrics.criticalList.length > 0
                    ? 'text-amber-500'
                    : 'text-slate-400'
                }`}
              />
            </div>
            <div className="text-xl font-bold mb-1 flex items-center gap-2">
              <span className={metrics.outOfStockList.length > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'}>
                {toPersianDigits(metrics.outOfStockList.length + metrics.criticalList.length)}
              </span>
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400">کالای در وضعیت کسری</span>
            </div>
            <div className="text-[11px] text-slate-600 dark:text-slate-400">
              {metrics.outOfStockList.length > 0
                ? `${toPersianDigits(metrics.outOfStockList.length)} کالا بدون موجودی (صفر)`
                : 'تمامی اقلام موجودی حداقلی دارند'}
            </div>
          </div>

          {/* Clickable Triage Pills */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 flex items-center gap-1.5 text-[10px]">
            <button
              type="button"
              onClick={() => onNavigate('inventory', 'OUT_OF_STOCK')}
              className={`flex-1 p-1 rounded-lg border text-center transition-all cursor-pointer font-bold ${
                metrics.outOfStockList.length > 0
                  ? 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800/80 hover:bg-rose-100'
                  : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-950 dark:text-slate-500 dark:border-slate-800'
              }`}
              title="مشاهده کالاهای با موجودی صفر"
            >
              <div>🔴 صفر</div>
              <div className="font-mono">{toPersianDigits(metrics.outOfStockList.length)}</div>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('inventory', 'CRITICAL')}
              className={`flex-1 p-1 rounded-lg border text-center transition-all cursor-pointer font-bold ${
                metrics.criticalList.length > 0
                  ? 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800/80 hover:bg-amber-100'
                  : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-950 dark:text-slate-500 dark:border-slate-800'
              }`}
              title="مشاهده کالاهای زیر حداقل نقطه سفارش"
            >
              <div>🟠 بحرانی</div>
              <div className="font-mono">{toPersianDigits(metrics.criticalList.length)}</div>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('inventory', 'WARN')}
              className="flex-1 p-1 rounded-lg border text-center bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300 cursor-pointer"
              title="مشاهده کالاهای نزدیک به نقطه سفارش"
            >
              <div>🟡 هشدار</div>
              <div className="font-mono text-slate-500 dark:text-slate-400">{toPersianDigits(metrics.warningList.length)}</div>
            </button>
          </div>
        </div>

        {/* KPI 4: Dead Stock & Idle Capital Monitor */}
        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between space-y-3 transition-colors">
          <div>
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-2">
              <span
                title="پایش اقلامی که موجودی دارند اما در ۶۰ روز گذشته هیچ سندی برای آن‌ها ثبت نشده است"
                className="cursor-help flex items-center gap-1 font-medium"
              >
                <span>کالاهای راکد (بدون گردش)</span>
                <Info className="w-3 h-3 text-slate-400 dark:text-slate-500" />
              </span>
              <Clock className="w-4 h-4 text-rose-500 dark:text-rose-400" />
            </div>
            <div className="text-xl font-bold text-rose-600 dark:text-rose-400 mb-1">
              {toPersianDigits(metrics.deadStockList.length)} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">قلم بدون گردش</span>
            </div>
            <div className="text-[11px] text-slate-600 dark:text-slate-400">
              سرمایه راکد خوابیده:{' '}
              <strong className="text-black dark:text-white font-mono">{formatCurrencyToman(metrics.deadStockCapital)}</strong>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80">
            <button
              type="button"
              onClick={() => {
                setAbcModalInitialTab('DEAD_STOCK');
                setShowAbcModal(true);
              }}
              className="w-full py-1.5 px-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 dark:bg-slate-950 dark:hover:bg-slate-800 dark:text-slate-300 dark:hover:text-white dark:border-slate-800 text-[10px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400 shrink-0" />
              <span>بررسی اقلام راکد و حبس سرمایه</span>
              <ChevronLeft className="w-3 h-3 text-slate-400 dark:text-slate-500 mr-auto" />
            </button>
          </div>
        </div>

      </div>

      {/* Recharts Bar Chart: Multi-Mode Turnover / Value / Deficit Analysis */}
      <TopTurnoverStockChart
        products={products}
        stockMovements={stockMovements}
        stockQuantities={stockQuantities}
        onProductClick={() => onNavigate('inventory')}
      />

      {/* ====================================================================== */}
      {/* ALL CUSTOMERS DETAILED BREAKDOWN & GRAND TOTALS LEDGER TABLE           */}
      {/* Strictly hidden from warehouse keeper Hajivand                        */}
      {/* ====================================================================== */}
      {!isHajivand && (
        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm dark:shadow-xl space-y-4 transition-colors">
        
        {/* Table Header & Controls Bar */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3
                className="text-sm sm:text-base font-bold text-black dark:text-white flex items-center gap-2 cursor-help"
                title="نمای کلی و تفکیکی ورود، خروج و مانده شیر و سیلندر تمامی طرف‌های حساب به همراه سطر جمع کل نهایی"
              >
                <Flame className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                <span>نمای کلی ورود و خروج و مانده شیر و سیلندر هر مشتری</span>
                <Info className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
              </h3>

              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-900 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/60 font-mono font-bold">
                مانده کل سیلندر: {formatNumberFa(gasStats.grandCylinderBalance)}
              </span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 font-mono font-bold">
                مانده کل شیرآلات: {formatNumberFa(gasStats.grandTotalValvesBalance)}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              جدول تراز اختصاصی کاردکس: با کلیک روی نام هر مشتری، کاردکس کامل و اسناد ورود و خروج همان مشتری باز می‌شود.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto">
            <button
              type="button"
              onClick={handleExportGasBalancesExcel}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer whitespace-nowrap"
              title="خروجی کامل اکسل با سطر جمع کل"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-white shrink-0" />
              <span>خروجی اکسل تراز</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('gas_kardex')}
              className="px-3 py-1.5 rounded-lg bg-cyan-700 hover:bg-cyan-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-cyan-700/20 transition-all cursor-pointer whitespace-nowrap"
            >
              <ExternalLink className="w-3.5 h-3.5 text-white shrink-0" />
              <span>کاردکس تعمیر سیلندر</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('gas_production_kardex')}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all cursor-pointer whitespace-nowrap"
            >
              <Boxes className="w-3.5 h-3.5 text-white shrink-0" />
              <span>کاردکس تولید ام گاز</span>
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
          
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="جستجوی نام طرف حساب، شهر، یا کد مشتری..."
              value={gasSearchTerm}
              onChange={(e) => {
                setGasSearchTerm(e.target.value);
                setGasPage(1);
              }}
              className="w-full pl-8 pr-9 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
            {gasSearchTerm && (
              <button
                type="button"
                onClick={() => {
                  setGasSearchTerm('');
                  setGasPage(1);
                }}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => {
                setGasBalanceFilter('ALL');
                setGasPage(1);
              }}
              className={`px-2.5 py-1.5 rounded-lg border font-bold transition-all cursor-pointer ${
                gasBalanceFilter === 'ALL'
                  ? 'bg-cyan-600 text-white border-cyan-600 shadow-sm shadow-cyan-600/20'
                  : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100 hover:text-black dark:bg-slate-950 dark:text-slate-400 dark:border-slate-800 dark:hover:text-slate-200'
              }`}
            >
              همه ({toPersianDigits(gasStats.allCustomersList.length)})
            </button>

            <button
              type="button"
              onClick={() => {
                setGasBalanceFilter('WITH_BALANCE');
                setGasPage(1);
              }}
              className={`px-2.5 py-1.5 rounded-lg border font-bold transition-all cursor-pointer ${
                gasBalanceFilter === 'WITH_BALANCE'
                  ? 'bg-cyan-600 text-white border-cyan-600 shadow-sm shadow-cyan-600/20'
                  : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100 hover:text-black dark:bg-slate-950 dark:text-slate-400 dark:border-slate-800 dark:hover:text-slate-200'
              }`}
            >
              دارای مانده ({toPersianDigits(gasStats.countWithAnyBalance)})
            </button>

            <button
              type="button"
              onClick={() => {
                setGasBalanceFilter('CYLINDER_ONLY');
                setGasPage(1);
              }}
              className={`px-2.5 py-1.5 rounded-lg border font-bold transition-all cursor-pointer ${
                gasBalanceFilter === 'CYLINDER_ONLY'
                  ? 'bg-cyan-600 text-white border-cyan-600 shadow-sm shadow-cyan-600/20'
                  : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100 hover:text-black dark:bg-slate-950 dark:text-slate-400 dark:border-slate-800 dark:hover:text-slate-200'
              }`}
            >
              مانده سیلندر ({toPersianDigits(gasStats.countWithCylinderBalance)})
            </button>

            <button
              type="button"
              onClick={() => {
                setGasBalanceFilter('VALVE_ONLY');
                setGasPage(1);
              }}
              className={`px-2.5 py-1.5 rounded-lg border font-bold transition-all cursor-pointer ${
                gasBalanceFilter === 'VALVE_ONLY'
                  ? 'bg-cyan-600 text-white border-cyan-600 shadow-sm shadow-cyan-600/20'
                  : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100 hover:text-black dark:bg-slate-950 dark:text-slate-400 dark:border-slate-800 dark:hover:text-slate-200'
              }`}
            >
              مانده شیرآلات ({toPersianDigits(gasStats.countWithValveBalance)})
            </button>

            <button
              type="button"
              onClick={() => {
                setGasBalanceFilter('WITH_ACTIVITY');
                setGasPage(1);
              }}
              className={`px-2.5 py-1.5 rounded-lg border font-bold transition-all cursor-pointer ${
                gasBalanceFilter === 'WITH_ACTIVITY'
                  ? 'bg-cyan-600 text-white border-cyan-600 shadow-sm shadow-cyan-600/20'
                  : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100 hover:text-black dark:bg-slate-950 dark:text-slate-400 dark:border-slate-800 dark:hover:text-slate-200'
              }`}
            >
              دارای گردش ({toPersianDigits(gasStats.countWithActivity)})
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 shrink-0">مرتب‌سازی:</span>
            <select
              value={gasSortField}
              onChange={(e) => setGasSortField(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 rounded-lg text-slate-200 px-2.5 py-1.5 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="CYLINDER_BALANCE">بیشترین مانده سیلندر</option>
              <option value="VALVES_BALANCE">بیشترین مانده شیرآلات</option>
              <option value="NAME">نام طرف حساب (الفبا)</option>
              <option value="LAST_DATE">آخرین تاریخ گردش</option>
            </select>
          </div>
        </div>

        {/* The Comprehensive Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-right text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/90 text-slate-300 border-b border-slate-800 select-none">
                <th className="py-2.5 px-3 font-semibold text-center w-12">#</th>
                <th className="py-2.5 px-3 font-semibold min-w-[160px]">نام طرف حساب / مشتری</th>
                <th className="py-2.5 px-2.5 font-semibold text-center text-slate-400">شهر</th>
                <th className="py-2.5 px-2.5 font-semibold text-center text-emerald-400 bg-emerald-950/20">ورود سیلندر</th>
                <th className="py-2.5 px-2.5 font-semibold text-center text-rose-400 bg-rose-950/20">خروج سیلندر</th>
                <th className="py-2.5 px-3 font-bold text-center text-cyan-300 bg-cyan-950/40 border-x border-cyan-900/40">مانده سیلندر</th>
                <th className="py-2.5 px-2 font-semibold text-center text-emerald-400 bg-emerald-950/20">ورود شیرنو</th>
                <th className="py-2.5 px-2 font-semibold text-center text-rose-400 bg-rose-950/20">خروج شیرنو</th>
                <th className="py-2.5 px-2.5 font-bold text-center text-emerald-300 bg-emerald-950/40">مانده شیرنو</th>
                <th className="py-2.5 px-2 font-semibold text-center text-amber-400 bg-amber-950/20">ورود کهنه</th>
                <th className="py-2.5 px-2 font-semibold text-center text-rose-400 bg-rose-950/20">خروج کهنه</th>
                <th className="py-2.5 px-2.5 font-bold text-center text-amber-300 bg-amber-950/40">مانده کهنه</th>
                <th className="py-2.5 px-3 font-bold text-center text-white bg-indigo-950/50 border-x border-indigo-900/40">جمع مانده شیرآلات</th>
                <th className="py-2.5 px-2 font-semibold text-center text-rose-300">ضایعات</th>
                <th className="py-2.5 px-2 font-semibold text-center text-slate-400">آخرین گردش</th>
                <th className="py-2.5 px-3 font-semibold text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {paginatedGasCustomers.length === 0 ? (
                <tr key="empty-gas-customers-state">
                  <td colSpan={16} className="py-8 text-center text-slate-400">
                    موردی مطابق با جستجو یا فیلترهای اعمال‌شده یافت نشد.
                  </td>
                </tr>
              ) : (
                paginatedGasCustomers.map((c, idx) => {
                  const rowNumber = (gasPage - 1) * gasItemsPerPage + idx + 1;
                  const hasCylinderBal = c.cylinder_balance !== 0;
                  const hasValveBal = c.total_valves_balance !== 0;

                  return (
                    <tr
                      key={c.customer_id}
                      className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                      onClick={() => {
                        if (onSelectGasCustomer) {
                          onSelectGasCustomer(c.customer_id);
                        } else {
                          onNavigate('gas_kardex');
                        }
                      }}
                    >
                      {/* Row index */}
                      <td className="py-2.5 px-3 text-center text-slate-500 dark:text-slate-400 font-mono font-bold text-sm">
                        {toPersianDigits(rowNumber)}
                      </td>

                      {/* Customer Name */}
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors text-sm">
                          {c.customer_name}
                        </div>
                        <div className="text-xs text-slate-500 font-mono font-semibold">
                          {c.customer_id}
                        </div>
                      </td>

                      {/* City */}
                      <td className="py-2.5 px-2.5 text-center text-slate-600 dark:text-slate-400 text-xs">
                        {c.city || 'تهران'}
                      </td>

                      {/* Cylinder In */}
                      <td className="py-2.5 px-2.5 text-center font-mono font-black text-sm sm:text-base text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/10">
                        {c.cylinder_in > 0 ? `+${toPersianDigits(c.cylinder_in)}` : '-'}
                      </td>

                      {/* Cylinder Out */}
                      <td className="py-2.5 px-2.5 text-center font-mono font-black text-sm sm:text-base text-rose-600 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-950/10">
                        {c.cylinder_out > 0 ? `-${toPersianDigits(c.cylinder_out)}` : '-'}
                      </td>

                      {/* Cylinder Balance */}
                      <td className={`py-2.5 px-3 text-center font-mono font-black text-base sm:text-lg border-x border-cyan-900/30 ${
                        c.cylinder_balance > 0
                          ? 'text-cyan-700 dark:text-cyan-300 bg-cyan-100/60 dark:bg-cyan-950/50 font-black text-base sm:text-lg'
                          : c.cylinder_balance < 0
                          ? 'text-rose-700 dark:text-rose-400 bg-rose-100/60 dark:bg-rose-950/40 font-black text-base sm:text-lg'
                          : 'text-slate-500 bg-slate-100/40 dark:bg-slate-950/20'
                      }`}>
                        {formatNumberFa(c.cylinder_balance)}
                      </td>

                      {/* New Valve In */}
                      <td className="py-2.5 px-2 text-center font-mono font-black text-sm sm:text-base text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/10">
                        {c.new_valve_in > 0 ? `+${toPersianDigits(c.new_valve_in)}` : '-'}
                      </td>

                      {/* New Valve Out */}
                      <td className="py-2.5 px-2 text-center font-mono font-black text-sm sm:text-base text-rose-600 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-950/10">
                        {c.new_valve_out > 0 ? `-${toPersianDigits(c.new_valve_out)}` : '-'}
                      </td>

                      {/* New Valve Balance */}
                      <td className={`py-2.5 px-2.5 text-center font-mono font-black text-base sm:text-lg ${
                        c.new_valve_balance > 0
                          ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-100/60 dark:bg-emerald-950/40'
                          : c.new_valve_balance < 0
                          ? 'text-rose-700 dark:text-rose-400 bg-rose-100/60 dark:bg-rose-950/30'
                          : 'text-slate-500'
                      }`}>
                        {formatNumberFa(c.new_valve_balance)}
                      </td>

                      {/* Used Valve In */}
                      <td className="py-2.5 px-2 text-center font-mono font-black text-sm sm:text-base text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/10">
                        {c.used_valve_in > 0 ? `+${toPersianDigits(c.used_valve_in)}` : '-'}
                      </td>

                      {/* Used Valve Out */}
                      <td className="py-2.5 px-2 text-center font-mono font-black text-sm sm:text-base text-rose-600 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-950/10">
                        {c.used_valve_out > 0 ? `-${toPersianDigits(c.used_valve_out)}` : '-'}
                      </td>

                      {/* Used Valve Balance */}
                      <td className={`py-2.5 px-2.5 text-center font-mono font-black text-base sm:text-lg ${
                        c.used_valve_balance > 0
                          ? 'text-amber-700 dark:text-amber-300 bg-amber-100/60 dark:bg-amber-950/40'
                          : c.used_valve_balance < 0
                          ? 'text-rose-700 dark:text-rose-400 bg-rose-100/60 dark:bg-rose-950/30'
                          : 'text-slate-500'
                      }`}>
                        {formatNumberFa(c.used_valve_balance)}
                      </td>

                      {/* Total Valves Balance (New + Used) */}
                      <td className={`py-2.5 px-3 text-center font-mono font-black text-base sm:text-lg border-x border-indigo-900/30 ${
                        c.total_valves_balance > 0
                          ? 'text-indigo-700 dark:text-indigo-200 bg-indigo-100/70 dark:bg-indigo-950/60 font-black'
                          : c.total_valves_balance < 0
                          ? 'text-rose-700 dark:text-rose-400 bg-rose-100/60 dark:bg-rose-950/40 font-black'
                          : 'text-slate-500'
                      }`}>
                        {formatNumberFa(c.total_valves_balance)}
                      </td>

                      {/* Scrap */}
                      <td className="py-2.5 px-2 text-center font-mono font-black text-sm sm:text-base text-rose-600 dark:text-rose-300">
                        {c.scrap_balance > 0 ? toPersianDigits(c.scrap_balance) : '-'}
                      </td>

                      {/* Last Date */}
                      <td className="py-2.5 px-2 text-center text-slate-500 dark:text-slate-400 font-mono font-bold text-xs sm:text-sm">
                        {c.last_date ? toPersianDigits(c.last_date) : '-'}
                      </td>

                      {/* Action */}
                      <td className="py-2.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => {
                            if (onSelectGasCustomer) {
                              onSelectGasCustomer(c.customer_id);
                            } else {
                              onNavigate('gas_kardex');
                            }
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-cyan-600 text-slate-300 hover:text-white text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1 shadow-xs"
                          title="مشاهده پرونده کاردکس این مشتری"
                        >
                          <span>کاردکس</span>
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* GRAND TOTAL FOOTER ROW (جمــع کـــل تمــام مشتــریان) */}
            <tfoot>
              <tr className="bg-slate-950 text-slate-100 font-bold border-t-2 border-cyan-500/60 shadow-inner">
                <td className="py-3.5 px-3 text-center text-cyan-400 font-black text-base font-mono">
                  Σ
                </td>
                <td className="py-3.5 px-3 font-black text-cyan-300 text-base">
                  جمع کل تمام مشتریان ({toPersianDigits(gasStats.allCustomersList.length)} طرف حساب)
                </td>
                <td className="py-3.5 px-2.5 text-center text-slate-400 text-xs font-bold">
                  سراسری
                </td>

                {/* Grand Cylinder In */}
                <td className="py-3.5 px-2.5 text-center font-mono font-black text-sm sm:text-base text-emerald-400 bg-emerald-950/30">
                  +{formatNumberFa(gasStats.grandCylinderIn)}
                </td>

                {/* Grand Cylinder Out */}
                <td className="py-3.5 px-2.5 text-center font-mono font-black text-sm sm:text-base text-rose-400 bg-rose-950/30">
                  -{formatNumberFa(gasStats.grandCylinderOut)}
                </td>

                {/* GRAND TOTAL REMAINING CYLINDERS */}
                <td className="py-3.5 px-3 text-center font-mono font-black text-lg sm:text-xl text-cyan-300 bg-cyan-950/80 border-x border-cyan-700/60 shadow-sm">
                  {formatNumberFa(gasStats.grandCylinderBalance)}
                </td>

                {/* Grand New Valve In */}
                <td className="py-3.5 px-2 text-center font-mono font-black text-sm sm:text-base text-emerald-400 bg-emerald-950/30">
                  +{formatNumberFa(gasStats.grandNewValveIn)}
                </td>

                {/* Grand New Valve Out */}
                <td className="py-3.5 px-2 text-center font-mono font-black text-sm sm:text-base text-rose-400 bg-rose-950/30">
                  -{formatNumberFa(gasStats.grandNewValveOut)}
                </td>

                {/* GRAND TOTAL NEW VALVES */}
                <td className="py-3.5 px-2.5 text-center font-mono font-black text-base sm:text-lg text-emerald-300 bg-emerald-950/60">
                  {formatNumberFa(gasStats.grandNewValveBalance)}
                </td>

                {/* Grand Used Valve In */}
                <td className="py-3.5 px-2 text-center font-mono font-black text-sm sm:text-base text-amber-400 bg-amber-950/30">
                  +{formatNumberFa(gasStats.grandUsedValveIn)}
                </td>

                {/* Grand Used Valve Out */}
                <td className="py-3.5 px-2 text-center font-mono font-black text-sm sm:text-base text-rose-400 bg-rose-950/30">
                  -{formatNumberFa(gasStats.grandUsedValveOut)}
                </td>

                {/* GRAND TOTAL USED VALVES */}
                <td className="py-3.5 px-2.5 text-center font-mono font-black text-base sm:text-lg text-amber-300 bg-amber-950/60">
                  {formatNumberFa(gasStats.grandUsedValveBalance)}
                </td>

                {/* GRAND TOTAL ALL VALVES */}
                <td className="py-3.5 px-3 text-center font-mono font-black text-lg sm:text-xl text-white bg-indigo-950/80 border-x border-indigo-700/60 shadow-sm">
                  {formatNumberFa(gasStats.grandTotalValvesBalance)}
                </td>

                {/* Grand Scrap */}
                <td className="py-3.5 px-2 text-center font-mono text-rose-400 font-black text-sm sm:text-base">
                  {formatNumberFa(gasStats.grandScrapBalance)}
                </td>

                {/* Total Entries Count */}
                <td className="py-3 px-2 text-center text-slate-400 font-mono text-[11px]">
                  {toPersianDigits(gasStats.totalEntries)} سند
                </td>

                {/* Action Column for Footer */}
                <td className="py-3 px-3 text-center">
                  <button
                    type="button"
                    onClick={handleExportGasBalancesExcel}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 transition-colors"
                    title="دانلود فایل اکسل تراز کامل"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Pagination & Display Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 pt-1">
          <div className="flex items-center gap-2">
            <span>نمایش:</span>
            <select
              value={gasItemsPerPage}
              onChange={(e) => {
                setGasItemsPerPage(Number(e.target.value));
                setGasPage(1);
              }}
              className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value={10}>۱۰ مشتری در صفحه</option>
              <option value={25}>۲۵ مشتری در صفحه</option>
              <option value={50}>۵۰ مشتری در صفحه</option>
              <option value={1000}>همه مشتریان یکجا</option>
            </select>

            <span className="text-[11px] text-slate-500">
              (نمایش {toPersianDigits(Math.min(filteredGasCustomers.length, (gasPage - 1) * gasItemsPerPage + 1))} تا{' '}
              {toPersianDigits(Math.min(filteredGasCustomers.length, gasPage * gasItemsPerPage))} از{' '}
              {toPersianDigits(filteredGasCustomers.length)} طرف حساب)
            </span>
          </div>

          {totalGasPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={gasPage <= 1}
                onClick={() => setGasPage(prev => Math.max(1, prev - 1))}
                className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 dark:bg-slate-950 dark:hover:bg-slate-800 dark:text-slate-300 dark:border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer font-medium"
              >
                صفحه قبل
              </button>

              <span className="px-2 font-mono text-cyan-700 dark:text-cyan-400 font-bold">
                {toPersianDigits(gasPage)} از {toPersianDigits(totalGasPages)}
              </span>

              <button
                type="button"
                disabled={gasPage >= totalGasPages}
                onClick={() => setGasPage(prev => Math.min(totalGasPages, prev + 1))}
                className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 dark:bg-slate-950 dark:hover:bg-slate-800 dark:text-slate-300 dark:border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer font-medium"
              >
                صفحه بعد
              </button>
            </div>
          )}
          </div>
        </div>
      )}

      {/* Warehouses breakdown & Low stock warnings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        
        {/* Warehouses Stock breakdown */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3
              className="text-sm font-bold text-white flex items-center gap-2 cursor-help"
              title="تفکیک آماری کالاهای موجود در هر یک از انبارها و سوله‌های فیزیکی"
            >
              <WarehouseIcon className="w-4 h-4 text-indigo-400" />
              <span>موجودی به تفکیک انبارها و سوله‌ها</span>
              <Info className="w-3.5 h-3.5 text-slate-400 hover:text-slate-200" />
            </h3>
            <button
              onClick={() => onNavigate('inventory')}
              className="text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer"
            >
              مشاهده تمام کالاها ➔
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            {warehouses.map(wh => {
              let whTotal = 0;
              products.forEach(p => {
                whTotal += (stockQuantities[p.product_id]?.[wh.warehouse_id] || 0);
              });

              return (
                <div key={wh.warehouse_id} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-slate-200 truncate" title={wh.name}>{wh.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-800/50 font-bold shrink-0">
                        {wh.shelf_location ? `قفسه ${wh.shelf_location}` : wh.code}
                      </span>
                    </div>
                  </div>
                  <div className="text-lg font-bold text-indigo-300">
                    {formatNumberFa(whTotal)} <span className="text-xs text-slate-400 font-normal">عدد کالا</span>
                  </div>
                  <div className="text-[10px] text-slate-500 truncate" title={wh.address}>
                    {wh.address}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Low stock alerts table with direct action */}
          {(metrics.outOfStockList.length > 0 || metrics.criticalList.length > 0) && (
            <div className="border border-rose-900/50 bg-rose-950/20 rounded-xl p-3 space-y-2">
              <div
                className="text-xs font-bold text-rose-300 flex items-center justify-between cursor-help"
                title="اقلامی که موجودی فیزیکی آن‌ها به مرز حداقل سفارش رسیده یا صفر شده است"
              >
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>فهرست بحرانی‌ترین اقلام جهت صدور فوری سفارش خرید:</span>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('inventory', 'CRITICAL')}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 font-bold"
                >
                  فیلتر در جدول کالاها ➔
                </button>
              </div>

              <div className="divide-y divide-rose-900/30 text-xs max-h-48 overflow-y-auto pr-1">
                {(() => {
                  const combinedItems = [...metrics.outOfStockList, ...metrics.criticalList];
                  // Deduplicate products in case a product falls into both lists
                  const seenIds = new Set<string>();
                  const uniqueItems: Product[] = [];
                  for (const prod of combinedItems) {
                    if (!seenIds.has(prod.product_id)) {
                      seenIds.add(prod.product_id);
                      uniqueItems.push(prod);
                    }
                  }

                  return uniqueItems.slice(0, 6).map((p, idx) => {
                    let qty = 0;
                    const whMap = stockQuantities[p.product_id] || {};
                    Object.values(whMap).forEach(q => (qty += Number(q) || 0));
                    const isZero = qty <= 0;

                    return (
                      <div
                        key={`low-stock-${p.product_id || idx}`}
                        onClick={() => onNavigate('inventory')}
                        className="py-1.5 flex flex-col sm:flex-row sm:items-center justify-between text-slate-200 gap-1 hover:bg-slate-900/40 cursor-pointer rounded px-1 transition-colors"
                      >
                        <div>
                          <span className="font-bold">{p.name}</span>
                          <span className="text-slate-400 font-mono text-[11px] mr-2">{p.sku}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-bold ${
                              isZero ? 'text-rose-400 bg-rose-950 px-1.5 py-0.2 rounded border border-rose-800' : 'text-amber-400'
                            }`}
                          >
                            موجودی فعلی: {toPersianDigits(qty)} {p.unit}
                          </span>
                          <span className="text-slate-400 text-[11px]">حداقل: {toPersianDigits(p.min_stock)}</span>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          )}
        </div>

        {/* Recent stock movements ledger */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <h3
                className="text-sm font-bold text-white flex items-center gap-1.5 cursor-help"
                title="فهرست آخرین اسناد ثبت شده ورود و خروج کالا در کل سامانه"
              >
                <span>آخرین اسناد گردش انبار</span>
                <Info className="w-3.5 h-3.5 text-slate-400 hover:text-slate-200" />
              </h3>
              <button
                onClick={() => onNavigate('movements')}
                className="text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer"
              >
                دفتر کل گردش ➔
              </button>
            </div>

            <div className="space-y-2.5">
              {recentMovements.map((mov, mIdx) => {
                const prod = products.find(p => p.product_id === mov.product_id);
                const isIncoming =
                  mov.movement_type === 'STOCK_IN' ||
                  mov.movement_type === 'PURCHASE' ||
                  mov.movement_type === 'RETURN_IN';

                return (
                  <div key={mov.movement_id || `mov-${mIdx}`} className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center ${
                        isIncoming ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50' : 'bg-rose-950 text-rose-400 border border-rose-800/50'
                      }`}>
                        {isIncoming ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-200 truncate">
                          {prod?.name || mov.product_id}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono truncate">
                          {mov.reference_id}
                        </div>
                      </div>
                    </div>

                    <div className="text-left shrink-0">
                      <div className={`font-bold font-mono ${isIncoming ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isIncoming ? '+' : '-'}{toPersianDigits(mov.quantity)} {prod?.unit || 'عدد'}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {formatPersianDateTime(mov.created_at)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 mt-3">
            <button
              onClick={onOpenNewMovement}
              className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 dark:bg-indigo-600/20 dark:hover:bg-indigo-600/30 dark:text-indigo-300 dark:border-indigo-500/30 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              + ثبت سند گردش جدید
            </button>
          </div>
        </div>

      </div>

      {/* ABC Analysis & Dead Stock Modal */}
      <AbcAnalysisModal
        isOpen={showAbcModal}
        onClose={() => setShowAbcModal(false)}
        products={products}
        categories={categories}
        stockQuantities={stockQuantities}
        stockMovements={stockMovements}
        onSelectProduct={(id) => {
          setShowAbcModal(false);
          onNavigate('inventory');
        }}
      />
    </div>
  );
};
