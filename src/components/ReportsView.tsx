import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Product,
  Category,
  Warehouse,
  StockMovement,
  RuntimeEnvironment,
  User,
  Customer,
  Supplier,
  Invoice,
  CylinderValveInspection
} from '../types';
import {
  Printer,
  FileSpreadsheet,
  Calendar,
  Warehouse as WarehouseIcon,
  Layers,
  Filter,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Boxes,
  ArrowLeftRight,
  TrendingUp,
  Download,
  Info,
  ChevronDown,
  X,
  Code,
  Wifi,
  RefreshCw,
  Copy,
  Terminal,
  Check,
  Activity,
  Building2,
  Users,
  Truck,
  Hash,
  RotateCcw
} from 'lucide-react';
import {
  formatCurrencyToman,
  formatNumberFa,
  formatPersianDateTime,
  toPersianDigits,
  toEnglishDigits,
  getPersianDate
} from '../utils/persian';
import { exportElementToPdf } from '../utils/pdfExport';
import { printReceiptSheet } from '../utils/receiptPrint';
import { MGasOfficialLogo } from './MGasOfficialLogo';
import { SyncEngine, LiveLogEntry, CLOUDFLARE_WORKER_URL } from '../sync-engine/sync-client';
import { PersianDatePicker } from './PersianDatePicker';
import { LocalStorageManager } from '../database/storage';
import * as XLSX from 'xlsx';

interface ReportsViewProps {
  products: Product[];
  categories: Category[];
  warehouses: Warehouse[];
  stockMovements: StockMovement[];
  stockQuantities: Record<string, Record<string, number>>;
  currentEnv: RuntimeEnvironment;
  currentUser: User;
  customers?: Customer[];
  suppliers?: Supplier[];
}

type ReportType = 'inventory' | 'kardex' | 'live_logs';
type TimeFilterPreset = 'all' | 'today' | 'last_7_days' | 'last_30_days' | 'last_90_days' | 'current_year';
type StockStatusFilter = 'all' | 'in_stock' | 'low_stock' | 'out_of_stock';

export const ReportsView: React.FC<ReportsViewProps> = ({
  products,
  categories,
  warehouses,
  stockMovements,
  stockQuantities,
  currentEnv,
  currentUser,
  customers,
  suppliers
}) => {
  // Report Tab Selection
  const [reportType, setReportType] = useState<ReportType>('kardex');

  // Resolved Customers and Suppliers
  const allCustomers = useMemo(() => {
    if (customers && customers.length > 0) return customers;
    return LocalStorageManager.getState(currentEnv)?.customers || [];
  }, [customers, currentEnv]);

  const allSuppliers = useMemo(() => {
    if (suppliers && suppliers.length > 0) return suppliers;
    return LocalStorageManager.getState(currentEnv)?.suppliers || [];
  }, [suppliers, currentEnv]);

  // Enhanced Shamsi Date Range Filter (X تا X با تقویم شمسی)
  const [startDate, setStartDate] = useState<string>(''); // YYYY/MM/DD
  const [endDate, setEndDate] = useState<string>('');     // YYYY/MM/DD
  const [timePreset, setTimePreset] = useState<'all' | 'today' | 'last_7_days' | 'last_30_days' | 'last_90_days' | 'current_year' | 'custom'>('all');

  // Supplier / Customer / Waybill Filters
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('all');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('all');
  const [waybillFilter, setWaybillFilter] = useState<string>('');

  // Standard Filter States
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('all');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [selectedStockStatus, setSelectedStockStatus] = useState<StockStatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProductId, setSelectedProductId] = useState<string>('all');
  const [movementTypeFilter, setMovementTypeFilter] = useState<string>('all');

  // Print Mode state
  const [isPrintPreviewActive, setIsPrintPreviewActive] = useState<boolean>(false);
  const printAreaRef = useRef<HTMLDivElement>(null);

  // Time preset selector
  const handleSelectTimePreset = (preset: 'all' | 'today' | 'last_7_days' | 'last_30_days' | 'last_90_days' | 'current_year') => {
    setTimePreset(preset);
    if (preset === 'all') {
      setStartDate('');
      setEndDate('');
      return;
    }
    const todayShamsi = getPersianDate(new Date());
    if (preset === 'today') {
      setStartDate(todayShamsi);
      setEndDate(todayShamsi);
      return;
    }
    if (preset === 'last_7_days') {
      const past = new Date(Date.now() - 7 * 86400000);
      setStartDate(getPersianDate(past));
      setEndDate(todayShamsi);
      return;
    }
    if (preset === 'last_30_days') {
      const past = new Date(Date.now() - 30 * 86400000);
      setStartDate(getPersianDate(past));
      setEndDate(todayShamsi);
      return;
    }
    if (preset === 'last_90_days') {
      const past = new Date(Date.now() - 90 * 86400000);
      setStartDate(getPersianDate(past));
      setEndDate(todayShamsi);
      return;
    }
    if (preset === 'current_year') {
      const [year] = todayShamsi.split('/');
      setStartDate(`${year}/01/01`);
      setEndDate(`${year}/12/29`);
      return;
    }
  };

  const handleStartDateChange = (val: string) => {
    setStartDate(val);
    setTimePreset('custom');
  };

  const handleEndDateChange = (val: string) => {
    setEndDate(val);
    setTimePreset('custom');
  };

  const handleResetAllFilters = () => {
    setSelectedWarehouseId('all');
    setSelectedCategoryId('all');
    setSelectedStockStatus('all');
    setStartDate('');
    setEndDate('');
    setTimePreset('all');
    setSelectedSupplierId('all');
    setSelectedCustomerId('all');
    setWaybillFilter('');
    setSearchQuery('');
    setSelectedProductId('all');
    setMovementTypeFilter('all');
  };

  const isAnyFilterActive = useMemo(() => {
    return (
      selectedWarehouseId !== 'all' ||
      selectedCategoryId !== 'all' ||
      selectedStockStatus !== 'all' ||
      startDate !== '' ||
      endDate !== '' ||
      selectedSupplierId !== 'all' ||
      selectedCustomerId !== 'all' ||
      waybillFilter.trim() !== '' ||
      searchQuery.trim() !== '' ||
      selectedProductId !== 'all' ||
      movementTypeFilter !== 'all'
    );
  }, [
    selectedWarehouseId,
    selectedCategoryId,
    selectedStockStatus,
    startDate,
    endDate,
    selectedSupplierId,
    selectedCustomerId,
    waybillFilter,
    searchQuery,
    selectedProductId,
    movementTypeFilter
  ]);

  // Pre-index invoices and inspections to resolve customer/supplier and waybill for every movement
  const { invoiceMap, inspectionMap } = useMemo(() => {
    const dbState = LocalStorageManager.getState(currentEnv);
    const invoices = dbState?.invoices || [];
    const inspections = dbState?.cylinder_valve_inspections || [];
    const invMap = new Map<string, Invoice>();
    invoices.forEach(inv => {
      if (inv.invoice_number) invMap.set(inv.invoice_number.toLowerCase().trim(), inv);
      if (inv.invoice_id) invMap.set(inv.invoice_id.toLowerCase().trim(), inv);
    });
    const inspMap = new Map<string, CylinderValveInspection>();
    inspections.forEach(insp => {
      if (insp.form_number) inspMap.set(insp.form_number.toLowerCase().trim(), insp);
      if (insp.waybill_number) inspMap.set(insp.waybill_number.toLowerCase().trim(), insp);
      if (insp.inspection_id) inspMap.set(insp.inspection_id.toLowerCase().trim(), insp);
    });
    return { invoiceMap: invMap, inspectionMap: inspMap };
  }, [currentEnv]);

  // ============================================================================
  // 1. FILTERED INVENTORY STOCK REPORT DATA
  // ============================================================================
  const filteredInventoryData = useMemo(() => {
    return products
      .map((p) => {
        const cat = categories.find((c) => c.category_id === p.category_id);
        const whMap = stockQuantities[p.product_id] || {};

        let currentQty = 0;
        if (selectedWarehouseId === 'all') {
          Object.values(whMap).forEach((val) => {
            currentQty += Number(val) || 0;
          });
        } else {
          currentQty = Number(whMap[selectedWarehouseId]) || 0;
        }

        const isLow = currentQty > 0 && currentQty <= p.min_stock;
        const isOut = currentQty <= 0;
        const totalPurchaseValuation = currentQty * (p.purchase_price || 0);
        const totalSaleValuation = currentQty * (p.sale_price || 0);

        return {
          product: p,
          categoryName: cat?.name || 'دسته‌بندی متفرقه',
          currentQty,
          isLow,
          isOut,
          totalPurchaseValuation,
          totalSaleValuation
        };
      })
      .filter((item) => {
        // Warehouse filter (handled above in qty calculation)
        // Category filter
        if (selectedCategoryId !== 'all' && item.product.category_id !== selectedCategoryId) {
          return false;
        }

        // Stock status filter
        if (selectedStockStatus === 'in_stock' && item.currentQty <= 0) return false;
        if (selectedStockStatus === 'low_stock' && !item.isLow) return false;
        if (selectedStockStatus === 'out_of_stock' && item.currentQty > 0) return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = item.product.name.toLowerCase().includes(q);
          const matchSku = item.product.sku.toLowerCase().includes(q);
          const matchBarcode = item.product.barcode?.toLowerCase().includes(q);
          if (!matchName && !matchSku && !matchBarcode) return false;
        }

        return true;
      });
  }, [products, categories, stockQuantities, selectedWarehouseId, selectedCategoryId, selectedStockStatus, searchQuery]);

  // Inventory Totals
  const inventoryTotals = useMemo(() => {
    let totalItems = filteredInventoryData.length;
    let totalPhysicalQty = 0;
    let totalPurchaseVal = 0;
    let totalSaleVal = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    filteredInventoryData.forEach((item) => {
      totalPhysicalQty += item.currentQty;
      totalPurchaseVal += item.totalPurchaseValuation;
      totalSaleVal += item.totalSaleValuation;
      if (item.isLow) lowStockCount++;
      if (item.isOut) outOfStockCount++;
    });

    return {
      totalItems,
      totalPhysicalQty,
      totalPurchaseVal,
      totalSaleVal,
      lowStockCount,
      outOfStockCount
    };
  }, [filteredInventoryData]);

  // ============================================================================
  // 2. FILTERED KARDEX / STOCK MOVEMENTS REPORT DATA
  // ============================================================================
  const filteredKardexData = useMemo(() => {
    return stockMovements
      .filter((m) => {
        const refClean = (m.reference_id || '').toLowerCase().trim();
        const linkedInv = invoiceMap.get(refClean);
        const linkedInsp = inspectionMap.get(refClean);

        // Resolve Customer ID & Name
        const resolvedCustomerId =
          (m as any).customer_id ||
          linkedInv?.customer_id ||
          linkedInsp?.customer_id ||
          '';
        const resolvedCustomerName =
          (m as any).customer_name ||
          (linkedInv?.invoice_type === 'SALE' ? (linkedInv as any).party_name : '') ||
          linkedInsp?.customer_name ||
          (allCustomers.find(c => c.customer_id === resolvedCustomerId)?.name) ||
          '';

        // Resolve Supplier ID & Name
        const resolvedSupplierId =
          (m as any).supplier_id ||
          linkedInv?.supplier_id ||
          '';
        const resolvedSupplierName =
          (m as any).supplier_name ||
          (linkedInv?.invoice_type === 'PURCHASE' ? (linkedInv as any).party_name : '') ||
          (allSuppliers.find(s => s.supplier_id === resolvedSupplierId)?.name) ||
          '';

        const partyDisplayName =
          resolvedCustomerName ||
          resolvedSupplierName ||
          (linkedInv as any)?.party_name ||
          (m.notes?.includes('البرز') ? 'البرز گاز' : '') ||
          '---';

        const resolvedWaybillNumber =
          (m as any).waybill_number ||
          linkedInsp?.waybill_number ||
          (m.reference_id?.startsWith('BL-') || m.reference_id?.includes('بارنامه') ? m.reference_id : '') ||
          m.reference_id ||
          '---';

        // 1. Time filter via Shamsi Date Range (X تا X)
        const recordPersian = getPersianDate(m.created_at || (m as any).date);
        if (startDate && recordPersian < startDate) return false;
        if (endDate && recordPersian > endDate) return false;

        // 2. Supplier filter
        if (selectedSupplierId !== 'all') {
          const targetSup = allSuppliers.find(s => s.supplier_id === selectedSupplierId);
          const sName = targetSup?.name.toLowerCase().trim() || '';
          const matchSupplier =
            resolvedSupplierId === selectedSupplierId ||
            (sName && resolvedSupplierName.toLowerCase().includes(sName)) ||
            (sName && (m.notes || '').toLowerCase().includes(sName)) ||
            (sName && (m.reference_id || '').toLowerCase().includes(sName));
          if (!matchSupplier) return false;
        }

        // 3. Customer filter
        if (selectedCustomerId !== 'all') {
          const targetCust = allCustomers.find(c => c.customer_id === selectedCustomerId);
          const cName = targetCust?.name.toLowerCase().trim() || '';
          const matchCustomer =
            resolvedCustomerId === selectedCustomerId ||
            (cName && resolvedCustomerName.toLowerCase().includes(cName)) ||
            (cName && (m.notes || '').toLowerCase().includes(cName)) ||
            (cName && (m.reference_id || '').toLowerCase().includes(cName));
          if (!matchCustomer) return false;
        }

        // 4. Waybill filter
        if (waybillFilter.trim()) {
          const q = toEnglishDigits(waybillFilter.toLowerCase().trim());
          const matchWaybill =
            toEnglishDigits(m.reference_id || '').toLowerCase().includes(q) ||
            toEnglishDigits(resolvedWaybillNumber || '').toLowerCase().includes(q) ||
            toEnglishDigits(m.document_number || '').toLowerCase().includes(q) ||
            toEnglishDigits(m.notes || '').toLowerCase().includes(q);
          if (!matchWaybill) return false;
        }

        // 5. Warehouse filter
        if (selectedWarehouseId !== 'all') {
          if (m.warehouse_id !== selectedWarehouseId && m.destination_warehouse_id !== selectedWarehouseId) {
            return false;
          }
        }

        // 6. Product filter
        if (selectedProductId !== 'all' && m.product_id !== selectedProductId) {
          return false;
        }

        // 7. Category filter if product selected is all
        if (selectedCategoryId !== 'all') {
          const prod = products.find((p) => p.product_id === m.product_id);
          if (prod && prod.category_id !== selectedCategoryId) {
            return false;
          }
        }

        // 8. Movement type filter
        if (movementTypeFilter === 'TRANSFER') {
          if (m.movement_type !== 'TRANSFER_IN' && m.movement_type !== 'TRANSFER_OUT') {
            return false;
          }
        } else if (movementTypeFilter !== 'all' && m.movement_type !== movementTypeFilter) {
          return false;
        }

        // 9. Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const prod = products.find((p) => p.product_id === m.product_id);
          const matchDoc = m.document_number?.toLowerCase().includes(q);
          const matchRef = m.reference_id?.toLowerCase().includes(q);
          const matchName = prod?.name.toLowerCase().includes(q);
          const matchDesc = m.description?.toLowerCase().includes(q);
          const matchParty = partyDisplayName.toLowerCase().includes(q);
          const matchNotes = m.notes?.toLowerCase().includes(q);
          if (!matchDoc && !matchRef && !matchName && !matchDesc && !matchParty && !matchNotes) return false;
        }

        return true;
      })
      .map((m) => {
        const prod = products.find((p) => p.product_id === m.product_id);
        const wh = warehouses.find((w) => w.warehouse_id === m.warehouse_id);
        const destWh = warehouses.find((w) => w.warehouse_id === m.destination_warehouse_id);

        const refClean = (m.reference_id || '').toLowerCase().trim();
        const linkedInv = invoiceMap.get(refClean);
        const linkedInsp = inspectionMap.get(refClean);

        const resolvedCustomerId =
          (m as any).customer_id ||
          linkedInv?.customer_id ||
          linkedInsp?.customer_id ||
          '';
        const resolvedCustomerName =
          (m as any).customer_name ||
          (linkedInv?.invoice_type === 'SALE' ? (linkedInv as any).party_name : '') ||
          linkedInsp?.customer_name ||
          (allCustomers.find(c => c.customer_id === resolvedCustomerId)?.name) ||
          '';

        const resolvedSupplierId =
          (m as any).supplier_id ||
          linkedInv?.supplier_id ||
          '';
        const resolvedSupplierName =
          (m as any).supplier_name ||
          (linkedInv?.invoice_type === 'PURCHASE' ? (linkedInv as any).party_name : '') ||
          (allSuppliers.find(s => s.supplier_id === resolvedSupplierId)?.name) ||
          '';

        const partyDisplayName =
          resolvedCustomerName ||
          resolvedSupplierName ||
          (linkedInv as any)?.party_name ||
          (m.notes?.includes('البرز') ? 'البرز گاز' : '') ||
          '---';

        const waybillNo =
          (m as any).waybill_number ||
          linkedInsp?.waybill_number ||
          (m.reference_id?.startsWith('BL-') || m.reference_id?.includes('بارنامه') ? m.reference_id : '') ||
          m.reference_id ||
          '---';

        const isInput =
          m.movement_type === 'STOCK_IN' ||
          m.movement_type === 'PURCHASE' ||
          m.movement_type === 'RETURN_IN';

        return {
          movement: m,
          productName: prod?.name || 'کالای نامشخص',
          productSku: prod?.sku || '---',
          unit: prod?.unit || 'عدد',
          warehouseName: wh?.name || 'انبار نامشخص',
          destWarehouseName: destWh?.name,
          isInput,
          qtyIn: isInput ? Math.abs(m.quantity) : 0,
          qtyOut: !isInput ? Math.abs(m.quantity) : 0,
          unitPrice: m.unit_price || 0,
          totalPrice: m.total_price || Math.abs(m.quantity) * (m.unit_price || 0),
          partyDisplayName,
          waybillNo,
          persianDate: getPersianDate(m.created_at || (m as any).date)
        };
      });
  }, [
    stockMovements,
    products,
    warehouses,
    startDate,
    endDate,
    selectedSupplierId,
    selectedCustomerId,
    waybillFilter,
    selectedWarehouseId,
    selectedProductId,
    selectedCategoryId,
    movementTypeFilter,
    searchQuery,
    invoiceMap,
    inspectionMap,
    allCustomers,
    allSuppliers
  ]);

  // Kardex Totals
  const kardexTotals = useMemo(() => {
    let totalIn = 0;
    let totalOut = 0;
    let totalValuation = 0;

    filteredKardexData.forEach((row) => {
      totalIn += row.qtyIn;
      totalOut += row.qtyOut;
      totalValuation += row.totalPrice;
    });

    return {
      recordCount: filteredKardexData.length,
      totalIn,
      totalOut,
      netTurnover: totalIn - totalOut,
      totalValuation
    };
  }, [filteredKardexData]);

  // ============================================================================
  // EXPORT EXCEL FUNCTION
  // ============================================================================
  const handleExportExcel = () => {
    if (reportType === 'inventory') {
      const rows = filteredInventoryData.map((item, idx) => ({
        'ردیف': idx + 1,
        'کد کالا': item.product.sku,
        'نام کالا': item.product.name,
        'دسته‌بندی': item.categoryName,
        'انبار هدف': selectedWarehouseId === 'all' ? 'همه انبارها' : warehouses.find(w => w.warehouse_id === selectedWarehouseId)?.name,
        'موجودی فیزیکی': item.currentQty,
        'واحد سنجش': item.product.unit || 'عدد',
        'حداقل سفارش': item.product.min_stock,
        'وضعیت موجودی': item.isOut ? 'ناموجود' : item.isLow ? 'نقطه سفارش' : 'موجود',
        'قیمت خرید تومان': item.product.purchase_price,
        'ارزش کل موجودی تومان': item.totalPurchaseValuation,
        'قیمت فروش تومان': item.product.sale_price
      }));

      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'موجودی انبار');
      XLSX.writeFile(wb, `گزارش_موجودی_انبار_ام_گاز_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } else {
      const rows = filteredKardexData.map((row, idx) => ({
        'ردیف': idx + 1,
        'شماره سند': row.movement.document_number || '---',
        'شماره بارنامه': row.waybillNo || '---',
        'طرف حساب': row.partyDisplayName || '---',
        'تاریخ و زمان': formatPersianDateTime(row.movement.created_at),
        'تاریخ شمسی': row.persianDate,
        'نوع عملیات': row.isInput ? 'ورود به انبار' : 'خروج از انبار',
        'کد کالا': row.productSku,
        'نام کالا': row.productName,
        'انبار': row.warehouseName,
        'مقدار ورود': row.qtyIn,
        'مقدار خروج': row.qtyOut,
        'واحد': row.unit,
        'قیمت واحد تومان': row.unitPrice,
        'ارزش کل سند تومان': row.totalPrice,
        'شماره ارجاع': row.movement.reference_id || '---',
        'شرح عملیات': row.movement.description || row.movement.notes || '---'
      }));

      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'کاردکس کالا');
      XLSX.writeFile(wb, `گزارش_کاردکس_انبار_ام_گاز_${new Date().toISOString().slice(0, 10)}.xlsx`);
    }
  };

  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [copiedLogs, setCopiedLogs] = useState(false);
  const [logFilter, setLogFilter] = useState<'all' | 'error' | 'warn' | 'info' | 'success'>('all');
  const [logSearchQuery, setLogSearchQuery] = useState<string>('');
  const [liveLogs, setLiveLogs] = useState<LiveLogEntry[]>([]);

  const filteredLiveLogs = useMemo(() => {
    return liveLogs.filter((log) => {
      if (logFilter !== 'all' && log.level !== logFilter) return false;
      if (logSearchQuery.trim()) {
        const q = logSearchQuery.toLowerCase();
        const matchMsg = (log.message || '').toLowerCase().includes(q);
        const matchSrc = (log.source || '').toLowerCase().includes(q);
        return matchMsg || matchSrc;
      }
      return true;
    });
  }, [liveLogs, logFilter, logSearchQuery]);
  const [cloudStatusInfo, setCloudStatusInfo] = useState<{
    connected: boolean;
    status: string;
    url: string;
    latencyMs?: number;
    error?: string;
    totalCloudEvents?: number;
  } | null>(null);
  const [isCheckingCloud, setIsCheckingCloud] = useState(false);
  const [isForceSyncing, setIsForceSyncing] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNoticeMessage(msg);
    setTimeout(() => setNoticeMessage(null), 3500);
  };

  // Subscribe to live sync logs
  useEffect(() => {
    const unsub = SyncEngine.subscribeLogs((logs) => {
      setLiveLogs(logs);
    });
    // Check initial cloud status
    SyncEngine.checkCloudStatus().then(info => setCloudStatusInfo(info)).catch(() => {});
    return () => unsub();
  }, []);

  const handleCheckCloud = async () => {
    setIsCheckingCloud(true);
    try {
      const res = await SyncEngine.checkCloudStatus();
      setCloudStatusInfo(res);
      showNotification(res.connected ? `اتصال با دامنه ${res.url} فعال و پایدار است (${res.latencyMs || 0}ms)` : `عدم برقراری ارتباط: ${res.error || res.status}`);
    } finally {
      setIsCheckingCloud(false);
    }
  };

  const handleForceSync = async () => {
    setIsForceSyncing(true);
    try {
      const ok = await SyncEngine.forcePullFromCloud(currentEnv);
      const res = await SyncEngine.checkCloudStatus();
      setCloudStatusInfo(res);
      showNotification(ok ? 'دیتابیس‌ها با سرور مرکزی anbar.mgas.ir با موفقیت بروزرسانی شدند.' : 'خطا در همگام‌سازی، لطفا لاگ‌ها را بررسی نمایید.');
    } finally {
      setIsForceSyncing(false);
    }
  };

  const handleCopyLiveLogs = () => {
    const text = liveLogs.map(l => `[${l.timestamp}] [${l.level.toUpperCase()}] [${l.source}]: ${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopiedLogs(true);
    showNotification('لاگ‌های ارتباطی با موفقیت در حافظه کپی شدند.');
    setTimeout(() => setCopiedLogs(false), 2000);
  };

  // ============================================================================
  // EXPORT JSON REPORT (100% Reliable on Windows Desktop and Web)
  // ============================================================================
  const handleExportJson = async () => {
    try {
      let exportPayload: any = {};
      if (reportType === 'live_logs') {
        exportPayload = {
          report_title: 'گزارش زنده وضعیت اتصال و لاگ‌های همگام‌سازی ابری anbar.mgas.ir',
          domain: CLOUDFLARE_WORKER_URL,
          generated_at_persian: formatPersianDateTime(new Date().toISOString()),
          generated_at_iso: new Date().toISOString(),
          operator: currentUser.full_name,
          cloud_status: cloudStatusInfo,
          total_logs: liveLogs.length,
          logs: liveLogs
        };
      } else {
        exportPayload = {
          report_title: reportType === 'inventory' ? 'گزارش رسمی موجودی و ارزش‌گذاری انبارها' : 'کاردکس رسمی گردش اسناد ورود و خروج انبار',
          company: 'شرکت صنایع گاز و لوازم خانگی ام گاز (M.Gas)',
          domain: 'https://anbar.mgas.ir',
          report_type: reportType,
          export_date_persian: formatPersianDateTime(new Date().toISOString()),
          export_date_iso: new Date().toISOString(),
          target_warehouse: selectedWarehouseId === 'all' ? 'تمام انبارها' : warehouses.find(w => w.warehouse_id === selectedWarehouseId)?.name,
          operator: currentUser.full_name,
          summary_totals: reportType === 'inventory' ? inventoryTotals : kardexTotals,
          data: reportType === 'inventory' ? filteredInventoryData.map((item, idx) => ({
            row: idx + 1,
            sku: item.product.sku,
            name: item.product.name,
            category: item.categoryName,
            warehouse: selectedWarehouseId === 'all' ? 'همه انبارها' : warehouses.find(w => w.warehouse_id === selectedWarehouseId)?.name,
            current_stock: item.currentQty,
            unit: item.product.unit || 'عدد',
            min_stock: item.product.min_stock,
            status: item.isOut ? 'ناموجود' : item.isLow ? 'نقطه سفارش' : 'موجود',
            purchase_price: item.product.purchase_price,
            total_valuation: item.totalPurchaseValuation,
            sale_price: item.product.sale_price
          })) : filteredKardexData.map((row, idx) => ({
            row: idx + 1,
            document_number: row.movement.document_number,
            date: formatPersianDateTime(row.movement.created_at),
            operation: row.isInput ? 'ورود به انبار' : 'خروج از انبار',
            sku: row.productSku,
            product_name: row.productName,
            warehouse: row.warehouseName,
            quantity_in: row.qtyIn,
            quantity_out: row.qtyOut,
            unit: row.unit,
            unit_price: row.unitPrice,
            total_price: row.totalPrice,
            reference_id: row.movement.reference_id || '---',
            description: row.movement.description || '---'
          }))
        };
      }

      const jsonString = JSON.stringify(exportPayload, null, 2);
      const defaultFileName = `report_mgas_${reportType}_${new Date().toISOString().slice(0, 10)}.json`;

      // 1. Windows Desktop Direct Save via Electron Dialog
      if (typeof window !== 'undefined' && window.desktopAPI?.saveJsonFile) {
        const deskRes = await window.desktopAPI.saveJsonFile(defaultFileName, jsonString);
        if (deskRes.success) {
          showNotification(`فایل گزارش JSON با موفقیت در ویندوز ذخیره شد: ${deskRes.filePath || defaultFileName}`);
          return;
        } else if (deskRes.canceled) {
          return;
        }
      }

      // 2. Browser standard Blob download
      const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = defaultFileName;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        if (document.body.contains(a)) document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 500);

      // 3. Fallback Clipboard copy for bulletproof access
      try {
        await navigator.clipboard.writeText(jsonString);
        showNotification('فایل گزارش JSON دانلود شد (یک نسخه نیز در حافظه کپی شد).');
      } catch {
        showNotification('فایل گزارش JSON با موفقیت تولید و دانلود شد.');
      }
    } catch (err: any) {
      console.error('JSON export error:', err);
      showNotification('خطا در تولید خروجی JSON: ' + (err?.message || 'نامشخص'));
    }
  };

  // ============================================================================
  // PRINT & PDF ACTIONS
  // ============================================================================
  const handlePrint = () => {
    setIsPrinting(true);
    setIsPrintPreviewActive(true);
    printReceiptSheet({
      elementId: 'printable-report-section',
      title: `گزارش انبار ام گاز - ${reportType === 'inventory' ? 'موجودی کالاها' : reportType === 'kardex' ? 'گردش و کاردکس کالا' : 'لاگ‌های ارتباطی anbar.mgas.ir'}`,
      paperSize: 'A4',
      orientation: 'landscape',
      onComplete: () => {
        setIsPrinting(false);
      }
    });
    setTimeout(() => {
      setIsPrinting(false);
    }, 2500);
  };

  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    try {
      await exportElementToPdf('printable-report-section', {
        filename: `gozaresh_${reportType === 'inventory' ? 'mojoodi' : reportType === 'kardex' ? 'gardesh' : 'loghaye_ertebat'}.pdf`,
        orientation: 'landscape',
        format: 'a4',
        marginMm: 4
      });
    } catch (err) {
      console.error('Report PDF export error:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="space-y-4">
      {noticeMessage && (
        <div className="bg-emerald-950/80 border border-emerald-600/60 text-emerald-200 text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{noticeMessage}</span>
        </div>
      )}

      {/* Filters Bar: Responsive Grid */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
        {reportType === 'live_logs' ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Wifi className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-slate-100">کنترل‌ها و فیلترهای گزارش زنده ارتباط anbar.mgas.ir</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                  cloudStatusInfo?.connected 
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700' 
                    : 'bg-rose-950/80 text-rose-300 border-rose-700'
                }`}>
                  {cloudStatusInfo?.connected ? 'ارتباط برقرار است' : 'قطع ارتباط'}
                </span>
                {cloudStatusInfo?.latencyMs !== undefined && (
                  <span className="text-[10px] font-mono text-slate-400">
                    تاخیر: {cloudStatusInfo.latencyMs}ms
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleCheckCloud}
                  disabled={isCheckingCloud}
                  className="px-3 py-1.5 rounded-xl bg-cyan-600/80 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 active:scale-95"
                  title="تست بلادرنگ پینگ و وضعیت سلامت ارتباط با دامنه anbar.mgas.ir"
                >
                  <Activity className={`w-3.5 h-3.5 ${isCheckingCloud ? 'animate-spin' : ''}`} />
                  <span>{isCheckingCloud ? 'در حال تست...' : 'تست اتصال (Ping)'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleForceSync}
                  disabled={isForceSyncing}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50 active:scale-95"
                  title="دریافت فوری تمام رویدادها از anbar.mgas.ir و اعمال در دیتابیس‌های محلی"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isForceSyncing ? 'animate-spin' : ''}`} />
                  <span>{isForceSyncing ? 'در حال بروزرسانی...' : 'بروزرسانی فوری دیتابیس‌ها'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyLiveLogs}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition-all cursor-pointer active:scale-95"
                  title="کپی متن تمام لاگ‌ها در حافظه کلیپ‌بورد"
                >
                  {copiedLogs ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                  <span>{copiedLogs ? 'کپی شد!' : 'کپی لاگ‌ها'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    SyncEngine.clearLogs();
                    setLiveLogs([]);
                    showNotification('تمام لاگ‌های ارتباطی پاک شدند.');
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 text-xs font-medium flex items-center gap-1 border border-rose-800/60 transition-all cursor-pointer active:scale-95"
                  title="پاکسازی فهرست لاگ‌های نشست فعلی"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>پاکسازی</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-400 block font-medium">سطح لاگ:</label>
                <select
                  value={logFilter}
                  onChange={(e) => setLogFilter(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="all">همه سطوح (موفق، خطا، هشدار، اطلاعات)</option>
                  <option value="error">فقط خطاهای ارتباطی (Error)</option>
                  <option value="warn">هشدارها (Warning)</option>
                  <option value="success">عملیات‌های موفق (Success)</option>
                  <option value="info">پیام‌های اطلاعاتی (Info)</option>
                </select>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-slate-400 block font-medium">جستجو در لاگ‌ها:</label>
                <div className="relative">
                  <input
                    type="text"
                    value={logSearchQuery}
                    onChange={(e) => setLogSearchQuery(e.target.value)}
                    placeholder="جستجو در پیام، منبع رویداد، آدرس URL یا جزییات لاگ..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-8 pl-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-2.5" />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Filter Header & Quick Reset */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                  <Filter className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-100 flex items-center gap-2">
                    <span>فیلتر پیشرفته گزارش و استخراج داده‌ها</span>
                    {isAnyFilterActive && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        فیلتر فعال است
                      </span>
                    )}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    فیلتر همزمان بر اساس بازه تاریخ شمسی، تامین‌کننده، نام مشتری، شماره بارنامه و انبار با قابلیت چاپ، PDF و اکسل
                  </p>
                </div>
              </div>

              {isAnyFilterActive && (
                <button
                  type="button"
                  onClick={handleResetAllFilters}
                  className="px-2.5 py-1.5 rounded-xl bg-rose-950/70 hover:bg-rose-900/80 text-rose-300 text-xs font-bold border border-rose-800/60 flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                  title="پاکسازی تمام فیلترها و بازنشانی به حالت اولیه"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>حذف همه فیلترها</span>
                </button>
              )}
            </div>

            {/* 1. DATE RANGE SECTION: بازه زمانی X تا X با انتخاب تقویم شمسی */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 sm:p-3.5 space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/60 pb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300">
                  <Calendar className="w-4 h-4 text-indigo-400" />
                  <span>بازه زمانی ثبت اسناد (از تاریخ تا تاریخ با تقویم شمسی):</span>
                </div>

                {/* Quick Date Presets */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 flex-nowrap sm:flex-wrap">
                  {[
                    { id: 'all', label: 'همه تاریخ‌ها' },
                    { id: 'today', label: 'امروز' },
                    { id: 'last_7_days', label: '۷ روز اخیر' },
                    { id: 'last_30_days', label: '۳۰ روز اخیر' },
                    { id: 'last_90_days', label: '۳ ماه اخیر' },
                    { id: 'current_year', label: 'سال جاری' }
                  ].map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectTimePreset(p.id as any)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap cursor-pointer ${
                        timePreset === p.id
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                  {timePreset === 'custom' && (
                    <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 whitespace-nowrap">
                      بازه دلخواه
                    </span>
                  )}
                </div>
              </div>

              {/* Two Persian Date Pickers: از تاریخ ... تا تاریخ ... */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 items-center">
                <div className="space-y-1 relative z-30">
                  <label className="text-[11px] text-slate-400 flex items-center justify-between">
                    <span className="font-bold text-slate-300">از تاریخ (شروع بازه شمسی):</span>
                    {startDate && (
                      <button
                        type="button"
                        onClick={() => {
                          setStartDate('');
                          setTimePreset('custom');
                        }}
                        className="text-[10px] text-rose-400 hover:underline font-bold"
                      >
                        پاک کردن
                      </button>
                    )}
                  </label>
                  <PersianDatePicker
                    value={startDate}
                    onChange={handleStartDateChange}
                    defaultToToday={false}
                    placeholder="مثال: 1403/01/01"
                    className="w-full bg-slate-950 border border-slate-700 hover:border-slate-600 rounded-xl px-3 py-2 text-slate-100 text-xs font-mono font-bold focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-inner transition-all"
                  />
                </div>

                <div className="space-y-1 relative z-20">
                  <label className="text-[11px] text-slate-400 flex items-center justify-between">
                    <span className="font-bold text-slate-300">تا تاریخ (پایان بازه شمسی):</span>
                    {endDate && (
                      <button
                        type="button"
                        onClick={() => {
                          setEndDate('');
                          setTimePreset('custom');
                        }}
                        className="text-[10px] text-rose-400 hover:underline font-bold"
                      >
                        پاک کردن
                      </button>
                    )}
                  </label>
                  <PersianDatePicker
                    value={endDate}
                    onChange={handleEndDateChange}
                    defaultToToday={false}
                    placeholder="مثال: 1403/12/29"
                    className="w-full bg-slate-950 border border-slate-700 hover:border-slate-600 rounded-xl px-3 py-2 text-slate-100 text-xs font-mono font-bold focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-inner transition-all"
                  />
                </div>

                <div className="hidden lg:flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 self-end">
                  <Info className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span className="text-[11px]">
                    فیلتر بر اساس تقویم شمسی جلالی عمل نموده و اسناد خارج از این بازه حذف می‌گردند.
                  </span>
                </div>
              </div>
            </div>

            {/* 2. PARTIES & WAYBILL ROW: تامین‌کننده / نام مشتری / شماره بارنامه / انبار */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              {/* Supplier Filter */}
              <div className="space-y-1">
                <label className="text-slate-300 font-bold flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>تامین‌کننده کالا:</span>
                </label>
                <select
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-hidden focus:border-emerald-500 font-medium cursor-pointer shadow-xs"
                >
                  <option value="all">همه تامین‌کنندگان ({toPersianDigits(allSuppliers.length)})</option>
                  {allSuppliers.map((s) => (
                    <option key={s.supplier_id} value={s.supplier_id}>
                      {s.name} {s.company_name ? `(${s.company_name})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Customer Filter */}
              <div className="space-y-1">
                <label className="text-slate-300 font-bold flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-amber-400" />
                  <span>نام مشتری / طرف حساب:</span>
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-hidden focus:border-amber-500 font-medium cursor-pointer shadow-xs"
                >
                  <option value="all">همه طرف‌های حساب ({toPersianDigits(allCustomers.length)})</option>
                  {allCustomers.map((c) => (
                    <option key={c.customer_id} value={c.customer_id}>
                      {c.name} {c.province ? `- ${c.province}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Waybill / Reference Number Filter */}
              <div className="space-y-1">
                <label className="text-slate-300 font-bold flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-cyan-400" />
                  <span>شماره بارنامه / شماره سند:</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={waybillFilter}
                    onChange={(e) => setWaybillFilter(e.target.value)}
                    placeholder="شماره بارنامه، حواله یا ارجاع..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pr-8 pl-7 py-2 text-slate-100 text-xs font-mono font-bold focus:outline-hidden focus:border-cyan-500 shadow-xs"
                  />
                  <Hash className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  {waybillFilter && (
                    <button
                      type="button"
                      onClick={() => setWaybillFilter('')}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5 cursor-pointer"
                      title="پاک کردن شماره بارنامه"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Warehouse Filter */}
              <div className="space-y-1">
                <label className="text-slate-300 font-bold flex items-center gap-1.5">
                  <WarehouseIcon className="w-3.5 h-3.5 text-indigo-400" />
                  <span>انتخاب انبار مبنا:</span>
                </label>
                <select
                  value={selectedWarehouseId}
                  onChange={(e) => setSelectedWarehouseId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-hidden focus:border-indigo-500 cursor-pointer shadow-xs"
                >
                  <option value="all">همه انبارها ({toPersianDigits(warehouses.length)})</option>
                  {warehouses.map((wh) => (
                    <option key={wh.warehouse_id} value={wh.warehouse_id}>
                      {wh.name} {wh.shelf_location ? `(قفسه ${wh.shelf_location})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 3. PRODUCT & SEARCH ROW */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              {/* Category Filter */}
              <div className="space-y-1">
                <label className="text-slate-400 block font-medium">نوع و دسته کالا:</label>
                <select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-hidden focus:border-indigo-500 cursor-pointer"
                >
                  <option value="all">همه دسته‌ها ({toPersianDigits(categories.length)})</option>
                  {categories.map((c) => (
                    <option key={c.category_id} value={c.category_id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Conditional Filters depending on tab */}
              {reportType === 'inventory' ? (
                <div className="space-y-1">
                  <label className="text-slate-400 block font-medium">وضعیت موجودی اقلام:</label>
                  <select
                    value={selectedStockStatus}
                    onChange={(e) => setSelectedStockStatus(e.target.value as StockStatusFilter)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-hidden focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="all">همه وضعیت‌ها</option>
                    <option value="in_stock">کالاهای موجود در انبار</option>
                    <option value="low_stock">کالاهای نقطه سفارش و کسری</option>
                    <option value="out_of_stock">کالاهای ناموجود</option>
                  </select>
                </div>
              ) : (
                <>
                  {/* Product selector for kardex */}
                  <div className="space-y-1">
                    <label className="text-slate-400 block font-medium">کالای مدنظر کاردکس:</label>
                    <select
                      value={selectedProductId}
                      onChange={(e) => setSelectedProductId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-hidden focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="all">همه کالاها ({toPersianDigits(products.length)})</option>
                      {products.map((p) => (
                        <option key={p.product_id} value={p.product_id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Movement Type */}
                  <div className="space-y-1">
                    <label className="text-slate-400 block font-medium">نوع گردش سند:</label>
                    <select
                      value={movementTypeFilter}
                      onChange={(e) => setMovementTypeFilter(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-hidden focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="all">تمام اسناد گردش</option>
                      <option value="STOCK_IN">ورود به انبار (رسید)</option>
                      <option value="STOCK_OUT">خروج از انبار (حواله)</option>
                      <option value="PURCHASE">رسید خرید</option>
                      <option value="SALE">حواله فروش</option>
                      <option value="TRANSFER">انتقال بین انبارها</option>
                      <option value="RETURN_IN">برگشت از مشتری</option>
                    </select>
                  </div>
                </>
              )}

              {/* Search query input */}
              <div className="space-y-1 sm:col-span-2 md:col-span-1">
                <label className="text-slate-400 block font-medium">جستجوی آزاد در نام کالا، کد یا متن:</label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="کد SKU، نام کالا، توضیحات..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-8 pl-7 py-2 text-slate-200 text-xs focus:outline-hidden focus:border-indigo-500 shadow-xs"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5 cursor-pointer"
                      title="پاک کردن جستجو"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* 4. DEDICATED ACTION TOOLBAR: خروجی فیلتر باید قابل چاپ و PDF و ذخیره اکسل باشد */}
            <div className="pt-3 border-t border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-950/40 -mx-4 -mb-4 p-4 rounded-b-2xl">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Print Button */}
                <button
                  type="button"
                  onClick={handlePrint}
                  disabled={isPrinting}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-black flex items-center gap-2 shadow-md shadow-indigo-600/30 transition-all cursor-pointer active:scale-95"
                  title="ارسال مستقیم جدول فیلترشده به چاپگر رسمی یا ذخیره در قالب سند چاپی"
                >
                  <Printer className="w-4 h-4" />
                  <span>{isPrinting ? 'در حال ارسال به چاپگر...' : 'چاپ رسمی جدول (Print)'}</span>
                </button>

                {/* PDF Export Button */}
                <button
                  type="button"
                  onClick={handleExportPdf}
                  disabled={isExportingPdf}
                  className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white text-xs font-black flex items-center gap-2 shadow-md shadow-teal-600/30 transition-all cursor-pointer active:scale-95"
                  title="دانلود مستقیم جدول فیلترشده با قالب استاندارد PDF A4 افقی"
                >
                  <Download className={`w-4 h-4 ${isExportingPdf ? 'animate-bounce' : ''}`} />
                  <span>{isExportingPdf ? 'در حال تولید...' : 'خروجی PDF'}</span>
                </button>

                {/* Excel Export Button */}
                <button
                  type="button"
                  onClick={handleExportExcel}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-2 shadow-md shadow-emerald-600/30 transition-all cursor-pointer active:scale-95"
                  title="ذخیره جدول فیلترشده در قالب فایل اکسل مایکروسافت (XLSX راست‌به‌چپ)"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>ذخیره در اکسل (Excel)</span>
                </button>
              </div>

              {/* Filter Statistics Badge */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">نتایج فیلتر:</span>
                <span className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-700/80 text-xs font-extrabold text-slate-100 flex items-center gap-1.5 shadow-inner">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <strong className="text-amber-400 font-mono text-sm tabular-nums" dir="ltr">
                    {toPersianDigits(reportType === 'inventory' ? filteredInventoryData.length : filteredKardexData.length)}
                  </strong>
                  <span>ردیف رکورد معتبر</span>
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Printable / Viewable Report Area */}
      <div
        id="printable-report-section"
        ref={printAreaRef}
        className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4 print:p-0 print:border-none print:shadow-none print:bg-white print:text-black"
      >
        {/* Formal Report Header for PDF / Print with Official M.Gas Logo */}
        <div className="border-b-2 border-slate-200 dark:border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:border-black print:pb-4">
          <div className="flex items-center gap-3">
            <MGasOfficialLogo />
            <div>
              <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white print:text-black transition-colors">
                شرکت صنایع گاز و لوازم خانگی ام گاز
              </div>
              <div className="text-xs text-indigo-700 dark:text-indigo-400 font-bold mt-0.5 print:text-black transition-colors">
                {reportType === 'inventory' ? 'کاربرگ رسمی موجودی و ارزش‌گذاری انبارها' : reportType === 'kardex' ? 'کاردکس رسمی گردش اسناد ورود و خروج انبار' : 'گزارش رسمی اتصال پایگاه داده ابری'}
              </div>
            </div>
          </div>

          <div className="text-right sm:text-left text-[11px] text-slate-600 dark:text-slate-300 print:text-black font-mono space-y-0.5">
            <div>تاریخ گزارش: {formatPersianDateTime(new Date().toISOString())}</div>
            <div>انبار مبنا: {selectedWarehouseId === 'all' ? 'تمام انبارها' : warehouses.find(w => w.warehouse_id === selectedWarehouseId)?.name}</div>
            <div className="print:hidden">تنظیم‌کننده در سیستم: @{currentUser.username} ({currentUser.full_name})</div>
          </div>
        </div>

        {/* Active Filter Criteria Summary Bar for Prints and PDF */}
        {(startDate || endDate || selectedSupplierId !== 'all' || selectedCustomerId !== 'all' || waybillFilter.trim() || selectedWarehouseId !== 'all') && (
          <div className="bg-slate-950/70 print:bg-slate-100 border border-slate-800 print:border-slate-300 rounded-xl p-2.5 text-[11px] text-slate-300 print:text-black flex flex-wrap items-center gap-x-4 gap-y-1.5 shadow-inner">
            <span className="font-black text-amber-400 print:text-black">فیلترهای اعمال‌شده روی این گزارش:</span>
            {(startDate || endDate) && (
              <span className="flex items-center gap-1">
                <span className="text-slate-400 print:text-slate-600">بازه زمانی:</span>
                <span className="font-bold text-slate-100 print:text-black font-mono">
                  از {toPersianDigits(startDate || 'ابتدا')} تا {toPersianDigits(endDate || 'اکنون')}
                </span>
              </span>
            )}
            {selectedSupplierId !== 'all' && (
              <span className="flex items-center gap-1">
                <span className="text-slate-400 print:text-slate-600">تامین‌کننده:</span>
                <span className="font-bold text-indigo-300 print:text-black">
                  {allSuppliers.find(s => s.supplier_id === selectedSupplierId)?.name}
                </span>
              </span>
            )}
            {selectedCustomerId !== 'all' && (
              <span className="flex items-center gap-1">
                <span className="text-slate-400 print:text-slate-600">مشتری:</span>
                <span className="font-bold text-indigo-300 print:text-black">
                  {allCustomers.find(c => c.customer_id === selectedCustomerId)?.name}
                </span>
              </span>
            )}
            {waybillFilter.trim() && (
              <span className="flex items-center gap-1">
                <span className="text-slate-400 print:text-slate-600">شماره بارنامه:</span>
                <span className="font-bold text-amber-300 print:text-black font-mono" dir="ltr">
                  {toPersianDigits(waybillFilter)}
                </span>
              </span>
            )}
            {selectedWarehouseId !== 'all' && (
              <span className="flex items-center gap-1">
                <span className="text-slate-400 print:text-slate-600">انبار:</span>
                <span className="font-bold text-slate-200 print:text-black">
                  {warehouses.find(w => w.warehouse_id === selectedWarehouseId)?.name}
                </span>
              </span>
            )}
          </div>
        )}

        {/* 1. Inventory Report Table */}
        {reportType === 'inventory' && (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs divide-y divide-slate-800 print:divide-black print:text-[11px]">
              <thead className="bg-slate-950/60 print:bg-slate-100 text-slate-400 print:text-black font-bold">
                <tr>
                  <th className="p-2.5">ردیف</th>
                  <th className="p-2.5">کد کالا</th>
                  <th className="p-2.5">نام و مشخصات کالا</th>
                  <th className="p-2.5">دسته‌بندی</th>
                  <th className="p-2.5 text-center">موجودی</th>
                  <th className="p-2.5">واحد</th>
                  <th className="p-2.5 text-center">نقطه سفارش</th>
                  <th className="p-2.5">وضعیت</th>
                  <th className="p-2.5 text-left">قیمت خرید</th>
                  <th className="p-2.5 text-left">ارزش کل موجودی</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 print:divide-slate-300">
                {filteredInventoryData.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-6 text-center text-slate-400">
                      هیچ کالایی با فیلترهای انتخابی یافت نشد.
                    </td>
                  </tr>
                ) : (
                  filteredInventoryData.map((item, idx) => (
                    <tr
                      key={`inv-row-${item.product.product_id || 'prod'}-${idx}`}
                      className="hover:bg-slate-800/40 print:hover:bg-transparent transition-colors"
                    >
                      <td className="p-2.5 font-mono text-slate-400 print:text-black">{toPersianDigits(idx + 1)}</td>
                      <td className="p-2.5 font-mono text-indigo-300 print:text-black font-bold">{item.product.sku}</td>
                      <td className="p-2.5 font-bold text-slate-100 print:text-black">{item.product.name}</td>
                      <td className="p-2.5 text-slate-400 print:text-black">{item.categoryName}</td>
                      <td className="p-2.5 text-center font-mono font-bold text-slate-100 print:text-black">
                        {toPersianDigits(item.currentQty)}
                      </td>
                      <td className="p-2.5 text-slate-400 print:text-black">{item.product.unit || 'عدد'}</td>
                      <td className="p-2.5 text-center font-mono text-slate-400 print:text-black">
                        {toPersianDigits(item.product.min_stock)}
                      </td>
                      <td className="p-2.5">
                        {item.isOut ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-950/80 text-rose-300 border border-rose-800 print:text-black">
                            ناموجود
                          </span>
                        ) : item.isLow ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-800 print:text-black">
                            نقطه سفارش
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800 print:text-black">
                            مطلوب
                          </span>
                        )}
                      </td>
                      <td className="p-2.5 text-left font-mono text-slate-300 print:text-black">
                        {formatCurrencyToman(item.product.purchase_price)}
                      </td>
                      <td className="p-2.5 text-left font-mono font-bold text-emerald-400 print:text-black">
                        {formatCurrencyToman(item.totalPurchaseValuation)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {filteredInventoryData.length > 0 && (
                <tfoot className="bg-slate-950/90 print:bg-slate-200 font-bold border-t-2 border-slate-700 print:border-black">
                  <tr>
                    <td colSpan={4} className="p-3 text-slate-200 print:text-black">
                      مجموع کل اقلام گزارش:
                    </td>
                    <td className="p-3 text-center font-mono text-indigo-300 print:text-black">
                      {formatNumberFa(inventoryTotals.totalPhysicalQty)}
                    </td>
                    <td colSpan={4}></td>
                    <td className="p-3 text-left font-mono text-emerald-400 print:text-black">
                      {formatCurrencyToman(inventoryTotals.totalPurchaseVal)}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}

        {/* 2. Kardex Report Table */}
        {reportType === 'kardex' && (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs divide-y divide-slate-800 print:divide-black print:text-[11px]">
              <thead className="bg-slate-950/60 print:bg-slate-100 text-slate-400 print:text-black font-bold">
                <tr>
                  <th className="p-2.5">ردیف</th>
                  <th className="p-2.5">شماره سند</th>
                  <th className="p-2.5">شماره بارنامه</th>
                  <th className="p-2.5">تاریخ ثبت</th>
                  <th className="p-2.5">طرف حساب (مشتری / تامین‌کننده)</th>
                  <th className="p-2.5">نوع سند</th>
                  <th className="p-2.5">کد کالا</th>
                  <th className="p-2.5">نام کالا</th>
                  <th className="p-2.5">انبار</th>
                  <th className="p-2.5 text-center">ورود</th>
                  <th className="p-2.5 text-center">خروج</th>
                  <th className="p-2.5 text-left">مبلغ کل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 print:divide-slate-300">
                {filteredKardexData.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="p-6 text-center text-slate-400">
                      هیچ سند گردشی با فیلترهای انتخابی یافت نشد.
                    </td>
                  </tr>
                ) : (
                  filteredKardexData.map((row, idx) => (
                    <tr
                      key={`kardex-row-${row.movement.movement_id || 'mov'}-${idx}`}
                      className="hover:bg-slate-800/40 print:hover:bg-transparent transition-colors"
                    >
                      <td className="p-2.5 font-mono text-slate-400 print:text-black">{toPersianDigits(idx + 1)}</td>
                      <td className="p-2.5 font-mono text-indigo-300 print:text-black font-bold">{row.movement.document_number}</td>
                      <td className="p-2.5 font-mono text-amber-400 print:text-black font-bold" dir="ltr">
                        {row.waybillNo !== '---' ? toPersianDigits(row.waybillNo) : '---'}
                      </td>
                      <td className="p-2.5 font-mono text-slate-300 print:text-black">{formatPersianDateTime(row.movement.created_at)}</td>
                      <td className="p-2.5 font-bold text-slate-100 print:text-black">
                        {row.partyDisplayName !== '---' ? row.partyDisplayName : <span className="text-slate-600 print:text-slate-400">---</span>}
                      </td>
                      <td className="p-2.5">
                        {row.isInput ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800 print:text-black font-medium">
                            ورود به انبار
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-950/80 text-rose-300 border border-rose-800 print:text-black font-medium">
                            خروج از انبار
                          </span>
                        )}
                      </td>
                      <td className="p-2.5 font-mono text-slate-400 print:text-black">{row.productSku}</td>
                      <td className="p-2.5 font-bold text-slate-100 print:text-black">{row.productName}</td>
                      <td className="p-2.5 text-slate-400 print:text-black">{row.warehouseName}</td>
                      <td className="p-2.5 text-center font-mono font-bold text-emerald-400 print:text-black">
                        {row.qtyIn > 0 ? toPersianDigits(row.qtyIn) : '-'}
                      </td>
                      <td className="p-2.5 text-center font-mono font-bold text-rose-400 print:text-black">
                        {row.qtyOut > 0 ? toPersianDigits(row.qtyOut) : '-'}
                      </td>
                      <td className="p-2.5 text-left font-mono font-bold text-slate-200 print:text-black">
                        {formatCurrencyToman(row.totalPrice)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {filteredKardexData.length > 0 && (
                <tfoot className="bg-slate-950/90 print:bg-slate-200 font-bold border-t-2 border-slate-700 print:border-black">
                  <tr>
                    <td colSpan={9} className="p-3 text-slate-200 print:text-black">
                      مجموع ورودی و خروجی اسناد:
                    </td>
                    <td className="p-3 text-center font-mono text-emerald-400 print:text-black">
                      {formatNumberFa(kardexTotals.totalIn)}
                    </td>
                    <td className="p-3 text-center font-mono text-rose-400 print:text-black">
                      {formatNumberFa(kardexTotals.totalOut)}
                    </td>
                    <td className="p-3 text-left font-mono text-cyan-300 print:text-black">
                      {formatCurrencyToman(kardexTotals.totalValuation)}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}

        {/* 3. Live Connection Logs Report Table & Terminal */}
        {reportType === 'live_logs' && (
          <div className="space-y-4">
            {/* Console Screen Header */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between flex-wrap gap-2 text-xs print:hidden">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-slate-100">کنسول زنده ثبت رویدادها و عیب‌یابی اتصال سرور ابری</span>
                <span className="text-[10px] text-cyan-400 font-mono">https://anbar.mgas.ir</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-[11px]">لاگ‌های نمایش‌داده‌شده:</span>
                <span className="font-mono font-bold text-indigo-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  {toPersianDigits(filteredLiveLogs.length)} از {toPersianDigits(liveLogs.length)}
                </span>
              </div>
            </div>

            {/* Official Report Table (Clean for PDF & Printouts, Interactive on Screen) */}
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs divide-y divide-slate-800 print:divide-black print:text-[11px]">
                <thead className="bg-slate-950/60 print:bg-slate-100 text-slate-400 print:text-black font-bold">
                  <tr>
                    <th className="p-2.5 w-12 text-center">ردیف</th>
                    <th className="p-2.5 w-36 whitespace-nowrap">زمان ثبت رویداد</th>
                    <th className="p-2.5 w-24 text-center">سطح</th>
                    <th className="p-2.5 w-32 whitespace-nowrap">منبع رویداد</th>
                    <th className="p-2.5">شرح و جزییات عملیات همگام‌سازی anbar.mgas.ir</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 print:divide-slate-300 text-xs">
                  {filteredLiveLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500 font-medium">
                        هیچ لاگ ارتباطی با معیارهای جستجو یافت نشد. می‌توانید با دکمه «تست اتصال» یا «بروزرسانی فوری» ارتباط با anbar.mgas.ir را آزمایش فرمایید.
                      </td>
                    </tr>
                  ) : (
                    filteredLiveLogs.map((log, idx) => (
                      <tr
                        key={`livelog-row-${log.id || 'log'}-${idx}`}
                        className="hover:bg-slate-800/40 print:hover:bg-transparent transition-colors"
                      >
                        <td className="p-2.5 text-center text-slate-400 print:text-black font-mono">
                          {toPersianDigits(idx + 1)}
                        </td>
                        <td className="p-2.5 text-slate-300 print:text-black whitespace-nowrap font-mono text-[11px]">
                          {formatPersianDateTime(log.timestamp)}
                        </td>
                        <td className="p-2.5 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border print:text-black ${
                              log.level === 'success'
                                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                                : log.level === 'error'
                                ? 'bg-rose-950/80 text-rose-300 border-rose-800'
                                : log.level === 'warn'
                                ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                                : 'bg-cyan-950/80 text-cyan-300 border-cyan-800'
                            }`}
                          >
                            {log.level === 'success'
                              ? 'موفق'
                              : log.level === 'error'
                              ? 'خطا'
                              : log.level === 'warn'
                              ? 'هشدار'
                              : 'اطلاعات'}
                          </span>
                        </td>
                        <td className="p-2.5 text-indigo-300 print:text-black font-mono font-semibold whitespace-nowrap">
                          {log.source}
                        </td>
                        <td className="p-2.5 text-slate-200 print:text-black font-sans leading-relaxed">
                          <div className="flex flex-col gap-1">
                            <span className="font-medium text-slate-100 print:text-black">{log.message}</span>
                            {log.details && (
                              <pre className="text-[10px] text-slate-400 bg-slate-950 p-2 rounded-lg border border-slate-800 overflow-x-auto print:hidden font-mono text-left" dir="ltr">
                                {typeof log.details === 'object' ? JSON.stringify(log.details, null, 2) : String(log.details)}
                              </pre>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Formal Signatures for Printed Reports - Clean without user names */}
        <div className="pt-6 border-t border-slate-800 print:border-black grid grid-cols-3 gap-4 text-center text-xs text-slate-400 print:text-black">
          <div className="space-y-4">
            <div>تنظیم‌کننده گزارش</div>
            <div className="text-[10px] text-slate-400 print:hidden">@{currentUser.username} ({currentUser.full_name})</div>
            <div className="border-b border-dotted border-slate-600 print:border-black w-32 mx-auto pt-6"></div>
          </div>
          <div className="space-y-4">
            <div>تأیید انباردار مسئول</div>
            <div className="border-b border-dotted border-slate-600 print:border-black w-32 mx-auto pt-10"></div>
          </div>
          <div className="space-y-4">
            <div>مدیریت بازرگانی و مالی</div>
            <div className="border-b border-dotted border-slate-600 print:border-black w-32 mx-auto pt-10"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
