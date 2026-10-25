import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Customer,
  GasKardexEntry,
  RuntimeEnvironment,
  User,
  CylinderValveInspection,
  CYLINDER_TYPES,
  CylinderType,
  DEFAULT_CYLINDER_TYPE
} from '../types';
import { LocalStorageManager } from '../database/storage';
import { SEED_USERS } from '../database/seed-data';
import { SyncEngine } from '../sync-engine/sync-client';
import {
  exportKardexToXLSX,
  parseKardexFromXLSX,
  recalculateKardexBalances
} from '../database/gas-kardex-data';
import {
  FileSpreadsheet,
  Download,
  Upload,
  Plus,
  Search,
  Users,
  Flame,
  Boxes,
  Wrench,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Calendar,
  Layers,
  FileDown,
  Printer,
  UserPlus,
  ArrowUpDown,
  Filter,
  RefreshCw,
  Phone,
  MapPin,
  Check,
  X,
  ArrowDownLeft,
  ArrowUpRight,
  Hash,
  Sparkles,
  Copy,
  Info,
  Eye,
  FileText,
  Truck,
  Edit3,
  Lock,
  Clock,
  Timer,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  LayoutGrid,
  List,
  RotateCcw,
  Calculator,
  ChevronDown
} from 'lucide-react';
import { formatPersianNumber, formatNumberEn, toEnglishDigits, toPersianDigits, generateUUID, getPersianDate } from '../utils/persian';
import { PersianDatePicker } from './PersianDatePicker';
import { printGasKardexDocument } from '../utils/gasKardexPrint';
import { exportElementToPdf } from '../utils/pdfExport';
import {
  generateSheetNumber,
  parseSheetNumber,
  getCustomerEnglishCode,
  extractMonthAndDay,
  calculateDailyRequestCount,
  formatPersianDateToSheetDateCode
} from '../utils/sheetNumber';
import { GoodsEntryReceiptModal } from './GoodsEntryReceiptModal';
import { GoodsExitReceiptModal } from './GoodsExitReceiptModal';
import { MGasOfficialLogo } from './MGasOfficialLogo';
import { isSafeInput, sanitizeInput, sanitizeNumber, validateFieldSecurity } from '../utils/security';

// Helper to summarize and shorten Kardex movement descriptions for ultra-compact table display
export const summarizeKardexDescription = (desc: string | undefined): string => {
  if (!desc || !desc.trim()) return 'گردش کالا';
  const clean = desc.trim();
  if (clean.includes('حاجی‌وند') || clean.includes('حاجی وند')) {
    if (clean.includes('شیر')) return 'ورود تاییدشده (شیر)';
    if (clean.includes('سیلندر')) return 'ورود تاییدشده (سیلندر)';
    return 'ورود تاییدشده';
  }
  if (clean.includes('دریافت و ورود محموله کپسول و شیرآلات') || (clean.includes('ورود') && clean.includes('شیر'))) {
    return 'ورود کپسول و شیر';
  }
  if (clean.includes('ارسال و خروج محموله کپسول و بارنامه') || (clean.includes('خروج') && clean.includes('بارنامه'))) {
    return 'خروج و ارسال بار';
  }
  if (clean.includes('موجودی اولیه') || clean.includes('تراز اول دوره')) {
    return 'موجودی اولیه';
  }
  if (clean.includes('ورود از اکسل') || clean.includes('اکسل')) {
    return 'ورود اکسل';
  }
  if (clean.includes('ضایعات')) {
    return clean.includes('ورود') ? 'ورود ضایعات' : 'خروج ضایعات';
  }
  if (clean.includes('ورود') || clean.includes('دریافت') || clean.includes('وارده')) {
    return 'ورود کالا';
  }
  if (clean.includes('خروج') || clean.includes('ارسال') || clean.includes('تحویل') || clean.includes('صادره')) {
    return 'خروج کالا';
  }
  if (clean.length > 18) return clean.slice(0, 16) + '…';
  return clean;
};

interface GasKardexViewProps {
  currentEnv: RuntimeEnvironment;
  currentUser: User;
  customers: Customer[];
  initialCustomerId?: string;
  onCustomerChange?: (id: string) => void;
  pendingInspectionToRegister?: CylinderValveInspection | null;
  onClearPendingInspection?: () => void;
  onNavigateToInspections?: () => void;
  onNavigateToProductionKardex?: () => void;
  onRefresh?: () => void;
}

export const GasKardexView: React.FC<GasKardexViewProps> = ({
  currentEnv,
  currentUser,
  customers,
  initialCustomerId,
  onCustomerChange,
  pendingInspectionToRegister,
  onClearPendingInspection,
  onNavigateToInspections,
  onNavigateToProductionKardex,
  onRefresh
}) => {
  // Active selected customer state - Default: initialCustomerId or البرز گاز (CUST-GAS-011) or first customer
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(
    initialCustomerId || 'CUST-GAS-011'
  );
  const [linkedInspectionId, setLinkedInspectionId] = useState<string | null>(null);

  React.useEffect(() => {
    if (initialCustomerId) {
      setSelectedCustomerId(initialCustomerId);
    }
  }, [initialCustomerId]);
  const [customerSearchQuery, setCustomerSearchQuery] = useState<string>('');
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState<boolean>(false);
  const customerSearchContainerRef = React.useRef<HTMLDivElement>(null);
  const [tableFilterQuery, setTableFilterQuery] = useState<string>('');
  
  // Sheet Number Specific Filters
  const [sheetNumberFilter, setSheetNumberFilter] = useState<string>('');
  const [sheetDirectionFilter, setSheetDirectionFilter] = useState<'all' | 'in' | 'out'>('all');
  
  // Modals
  const [showAddEntryModal, setShowAddEntryModal] = useState<boolean>(false);
  const [showEditKardexModal, setShowEditKardexModal] = useState<boolean>(false);
  const [showNewCustomerModal, setShowNewCustomerModal] = useState<boolean>(false);
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [showNamesListModal, setShowNamesListModal] = useState<boolean>(false);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  
  // Dedicated Goods Entry / برگ ورود کالا Modal (M.Gas cylinder)
  const [showReceiptModal, setShowReceiptModal] = useState<boolean>(false);
  const [selectedReceiptEntry, setSelectedReceiptEntry] = useState<GasKardexEntry | null>(null);

  // Dedicated Goods Exit / برگه خروج کالا Modal (M.Gas cylinder)
  const [showExitReceiptModal, setShowExitReceiptModal] = useState<boolean>(false);
  const [selectedExitReceiptEntry, setSelectedExitReceiptEntry] = useState<GasKardexEntry | null>(null);

  // Dedicated Order / Document Details Modal (نوشتن شماره برگه در جزئیات سفارش در بخش عملیات)
  const [selectedEntryForDetails, setSelectedEntryForDetails] = useState<GasKardexEntry | null>(null);

  // Trash / Recycle Bin & Deletion Modal States
  const [showTrashModal, setShowTrashModal] = useState<boolean>(false);
  const [deletingEntry, setDeletingEntry] = useState<GasKardexEntry | null>(null);
  const [deleteReasonInput, setDeleteReasonInput] = useState<string>('');
  const [trashCustomerFilter, setTrashCustomerFilter] = useState<'current' | 'all'>('all');
  const [trashSearchQuery, setTrashSearchQuery] = useState<string>('');
  const [showEmptyTrashConfirmModal, setShowEmptyTrashConfirmModal] = useState<boolean>(false);
  const [entryToPermanentlyDelete, setEntryToPermanentlyDelete] = useState<GasKardexEntry | null>(null);

  // Active Selected Cylinder Type for Kardex Partitioning
  const [selectedCylinderType, setSelectedCylinderType] = useState<CylinderType>('سیلندر 11 کیلویی');
  const [showCylinderDropdown, setShowCylinderDropdown] = useState<boolean>(false);
  const cylinderDropdownRef = React.useRef<HTMLDivElement>(null);

  // Cylinder Dropdown in Customer Header (Next to Edit Customer Button)
  const [showCustomerHeaderCylinderDropdown, setShowCustomerHeaderCylinderDropdown] = useState<boolean>(false);
  const customerHeaderCylinderDropdownRef = React.useRef<HTMLDivElement>(null);

  // Outside click listener for cylinder selection dropdowns and customer search suggestions
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (cylinderDropdownRef.current && !cylinderDropdownRef.current.contains(e.target as Node)) {
        setShowCylinderDropdown(false);
      }
      if (customerHeaderCylinderDropdownRef.current && !customerHeaderCylinderDropdownRef.current.contains(e.target as Node)) {
        setShowCustomerHeaderCylinderDropdown(false);
      }
      if (customerSearchContainerRef.current && !customerSearchContainerRef.current.contains(e.target as Node)) {
        setShowCustomerSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // KPI Metrics View Mode (Cards vs List)
  const [kpiViewMode, setKpiViewMode] = useState<'cards' | 'list'>('cards');

  // Global Escape key listener to close active modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowCylinderDropdown(false);
        setShowAddEntryModal(false);
        setShowNewCustomerModal(false);
        setShowImportModal(false);
        setShowNamesListModal(false);
        setShowPrintModal(false);
        setShowReceiptModal(false);
        setShowExitReceiptModal(false);
        setShowEditCustomerModal(false);
        setShowEditKardexModal(false);
        setEditingKardexEntry(null);
        setShowEmptyTrashConfirmModal(false);
        setEntryToPermanentlyDelete(null);
        setSelectedEntryForDetails(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Edit Customer Modal State
  const [showEditCustomerModal, setShowEditCustomerModal] = useState<boolean>(false);
  const [editCustomerForm, setEditCustomerForm] = useState({
    name: '',
    company_name: '',
    province: 'تهران',
    city: 'تهران',
    phone: '',
    national_id: '',
    economic_code: '',
    address: '',
    customer_type: 'عمده' as Customer['customer_type'],
    notes: ''
  });

  // Helper to determine if an entry is outgoing (خروج) or incoming (ورود)
  const isOutgoingEntry = (entry: GasKardexEntry): boolean => {
    if (entry.cylinder_out > 0 || entry.scrap_out > 0) return true;
    if (entry.transfer_sheet_number && entry.transfer_sheet_number.toLowerCase().includes('e')) return true;
    if (entry.description && (entry.description.includes('خروج') || entry.description.includes('ارسال') || entry.description.includes('تحویل') || entry.description.includes('توزیع'))) return true;
    return false;
  };
  
  // Tab inside Add Entry Modal: 'in' = ورودی (i) | 'out' = خروجی (e)
  const [entryTab, setEntryTab] = useState<'in' | 'out'>('in');
  const [copiedSheet, setCopiedSheet] = useState<boolean>(false);
  const [dailyLoadingCount, setDailyLoadingCount] = useState<number>(1);

  // Notification Toast
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Form State for new Kardex Entry
  const [newEntry, setNewEntry] = useState({
    date: getPersianDate(),
    description: '',
    transfer_sheet_number: '',
    cylinder_type: 'سیلندر 11 کیلویی' as CylinderType,
    cylinder_in: 0,
    cylinder_out: 0,
    scrap_out: 0,
    final_scrap_out: 0,
    scrap_stock_in: 0,
    cylinder_balance: 0,
    scrap_balance: 0,
    new_valve_in: 0,
    new_valve_out: 0,
    new_valve_balance: 0,
    dispatched: '',
    used_valve_in: 0,
    used_valve_out: 0,
    used_valve_balance: 0,
    defective: 0,
    notes: ''
  });

  // Form State for New Customer
  const [newCustomerForm, setNewCustomerForm] = useState({
    name: '',
    company_name: '',
    province: 'تهران',
    city: 'تهران',
    phone: '',
    national_id: '',
    economic_code: '',
    address: '',
    credit_limit: 100000000,
    current_balance: 0,
    customer_type: 'عمده' as const,
    notes: 'طرف حساب جدید ثبت‌شده در کاردکس گاز'
  });

  // Import File State
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState<boolean>(false);

  // Database State and Reactive Kardex Entries State (Instant AJAX / Optimistic UI)
  const dbState = LocalStorageManager.getState(currentEnv);
  const [allKardexEntries, setAllKardexEntries] = useState<GasKardexEntry[]>(() => {
    const state = LocalStorageManager.getState(currentEnv);
    return state.gas_kardex_entries || [];
  });

  // Track the most recently added entry for instant visual Ajax highlight
  const [recentlyAddedEntryId, setRecentlyAddedEntryId] = useState<string | null>(null);

  const isInternalManager = currentUser?.role === 'INTERNAL_MANAGER' || currentUser?.username === 'karami';

  // Live System Digital Clock state & Internal Manager (Mrs. Karami) 1-Hour Session Countdown
  const [currentSystemTime, setCurrentSystemTime] = useState<Date>(new Date());
  const [karamiSessionState, setKaramiSessionState] = useState(() => {
    return LocalStorageManager.getKaramiSessionRemaining(1);
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSystemTime(new Date());
      setKaramiSessionState(LocalStorageManager.getKaramiSessionRemaining(1));
    }, 1000);

    const handleRenewed = () => {
      setKaramiSessionState(LocalStorageManager.getKaramiSessionRemaining(1));
    };
    window.addEventListener('mgas:karami_session_renewed', handleRenewed);

    return () => {
      clearInterval(timer);
      window.removeEventListener('mgas:karami_session_renewed', handleRenewed);
    };
  }, []);

  const formattedSystemTime = useMemo(() => {
    const hours = String(currentSystemTime.getHours()).padStart(2, '0');
    const minutes = String(currentSystemTime.getMinutes()).padStart(2, '0');
    const seconds = String(currentSystemTime.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }, [currentSystemTime]);

  const handleRenewKaramiSession = () => {
    LocalStorageManager.renewKaramiSession();
    setKaramiSessionState(LocalStorageManager.getKaramiSessionRemaining(1));
    showToast('مهلت ۱ ساعته ویرایش اسناد برای مدیر داخلی (خانم کرمی) با موفقیت به مدت ۶۰ دقیقه کامل تمدید گردید.', 'success');
  };


  // Seamless and subtle refresh helper to keep React UI 100% synchronized with storage after all creates/deletes
  const triggerSeamlessRefresh = useCallback(() => {
    const updated = LocalStorageManager.getState(currentEnv);
    setAllKardexEntries([...(updated.gas_kardex_entries || []).map(e => ({ ...e }))]);
    onRefresh?.();
    try {
      window.dispatchEvent(new CustomEvent('mgas:db_refreshed', { detail: { env: currentEnv } }));
      window.dispatchEvent(new CustomEvent('mgas:kardex_updated', { detail: { env: currentEnv } }));
      window.dispatchEvent(new CustomEvent('mgas:kardex_trash_updated', { detail: { env: currentEnv } }));
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel('mgas_kardex_sync_channel');
        bc.postMessage({ type: 'KARDEX_REFRESHED' });
        bc.close();
      }
    } catch {}
  }, [currentEnv, onRefresh]);

  // Synchronize state instantaneously with storage, custom events, BroadcastChannel, and Windows desktop updates
  useEffect(() => {
    // 1. Initial sync
    const fresh = LocalStorageManager.getState(currentEnv);
    setAllKardexEntries([...(fresh.gas_kardex_entries || []).map(e => ({ ...e }))]);

    // 2. LocalStorageManager subscriber (fired whenever recordLocalChange/saveState runs anywhere)
    const unsubscribeStorage = LocalStorageManager.subscribe(() => {
      const updated = LocalStorageManager.getState(currentEnv);
      setAllKardexEntries([...(updated.gas_kardex_entries || []).map(e => ({ ...e }))]);
    });

    // 3. Database refreshed event handler (silent instant update)
    const handleDbRefreshed = () => {
      const updated = LocalStorageManager.getState(currentEnv);
      setAllKardexEntries([...(updated.gas_kardex_entries || []).map(e => ({ ...e }))]);
    };
    window.addEventListener('mgas:db_refreshed' as any, handleDbRefreshed);

    // 4. Trash updated event handler (instant row removal/restoration)
    const handleTrashUpdated = () => {
      const updated = LocalStorageManager.getState(currentEnv);
      setAllKardexEntries([...(updated.gas_kardex_entries || []).map(e => ({ ...e }))]);
    };
    window.addEventListener('mgas:kardex_trash_updated' as any, handleTrashUpdated);

    // 5. Window custom event for instant local ajax row insertion
    const handleKardexUpdated = (e: any) => {
      const entryDetail: GasKardexEntry | undefined = e?.detail;
      const updated = LocalStorageManager.getState(currentEnv);
      setAllKardexEntries([...(updated.gas_kardex_entries || []).map(item => ({ ...item }))]);
      if (entryDetail && entryDetail.customer_id === selectedCustomerId) {
        setRecentlyAddedEntryId(entryDetail.entry_id);
        setTimeout(() => setRecentlyAddedEntryId(null), 3500);
      }
    };
    window.addEventListener('mgas:kardex_updated' as any, handleKardexUpdated);

    // 6. Cross-tab & Multi-window BroadcastChannel (for multiple tabs and Windows Electron instances)
    let bc: BroadcastChannel | null = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        bc = new BroadcastChannel('mgas_kardex_sync_channel');
        bc.onmessage = (event) => {
          const updated = LocalStorageManager.getState(currentEnv);
          setAllKardexEntries([...(updated.gas_kardex_entries || []).map(item => ({ ...item }))]);
          if (event.data?.entry && event.data.entry.customer_id === selectedCustomerId) {
            setRecentlyAddedEntryId(event.data.entry.entry_id);
            setTimeout(() => setRecentlyAddedEntryId(null), 3500);
          }
        };
      }
    } catch {}

    // 7. Windows Desktop API / Electron Bridge event listener if running in Windows 11 / Windows 7
    let cleanupDesktop: (() => void) | undefined;
    if (typeof window !== 'undefined' && window.desktopAPI?.onDatabaseUpdated) {
      cleanupDesktop = window.desktopAPI.onDatabaseUpdated(() => {
        const updated = LocalStorageManager.getState(currentEnv);
        setAllKardexEntries([...(updated.gas_kardex_entries || []).map(item => ({ ...item }))]);
      });
    }

    return () => {
      unsubscribeStorage();
      window.removeEventListener('mgas:db_refreshed' as any, handleDbRefreshed);
      window.removeEventListener('mgas:kardex_trash_updated' as any, handleTrashUpdated);
      window.removeEventListener('mgas:kardex_updated' as any, handleKardexUpdated);
      if (bc) bc.close();
      if (cleanupDesktop) cleanupDesktop();
    };
  }, [currentEnv, selectedCustomerId]);

  // Active Customer Object
  const currentCustomer = useMemo(() => {
    return customers.find(c => c.customer_id === selectedCustomerId) || customers[0];
  }, [customers, selectedCustomerId]);

  // Exclusive party validation for incoming new and used valves (ورودی شیر فقط شعبه امگاز تولید شیر)
  const isMgasValveBranch = useMemo(() => {
    return Boolean(
      currentCustomer?.customer_id === 'CUST-MGAS-VALVE' ||
      currentCustomer?.name?.includes('تولید شیر') ||
      currentCustomer?.company_name?.includes('تولید و بازسازی شیرآلات')
    );
  }, [currentCustomer]);

  // Entries for selected customer and cylinder type sorted by date (Active only - excludes Trashed/Deleted entries)
  const customerEntries = useMemo(() => {
    if (!currentCustomer) return [];
    const filtered = allKardexEntries.filter(
      e => {
        if (e.customer_id !== currentCustomer.customer_id || e.is_deleted) return false;
        let cType = e.cylinder_type || 'سیلندر 11 کیلویی';
        if (cType === 'سیلندر 8 لیتری') cType = 'سیلندر 50 کیلویی';
        if (cType === 'سیلندر 10 کیلویی') cType = 'لیفتراکی 22 کیلویی';
        return cType === selectedCylinderType;
      }
    );
    return recalculateKardexBalances(
      [...filtered].sort((a, b) => (a.date || '').localeCompare(b.date || ''))
    );
  }, [allKardexEntries, currentCustomer, selectedCylinderType]);

  // Count of entries per cylinder type for current customer
  const cylinderTypeCounts = useMemo(() => {
    const counts: Record<string, number> = {
      'سیلندر 11 کیلویی': 0,
      'سیلندر 25 کیلویی': 0,
      'سیلندر 50 کیلویی': 0,
      'لیفتراکی 22 کیلویی': 0
    };
    if (!currentCustomer) return counts;
    allKardexEntries
      .filter(e => e.customer_id === currentCustomer.customer_id && !e.is_deleted)
      .forEach(e => {
        let type = e.cylinder_type || 'سیلندر 11 کیلویی';
        if (type === 'سیلندر 8 لیتری') type = 'سیلندر 50 کیلویی';
        if (type === 'سیلندر 10 کیلویی') type = 'لیفتراکی 22 کیلویی';
        if (counts[type] !== undefined) {
          counts[type]++;
        } else {
          counts['سیلندر 11 کیلویی']++;
        }
      });
    return counts;
  }, [allKardexEntries, currentCustomer]);

  // Trashed / Deleted entries across the system (Recycle Bin)
  const trashedEntries = useMemo(() => {
    return allKardexEntries.filter(e => e.is_deleted);
  }, [allKardexEntries]);

  // Trashed entries filtered for display in Recycle Bin modal
  const filteredTrashedEntries = useMemo(() => {
    let list = trashedEntries;
    if (trashCustomerFilter === 'current' && currentCustomer) {
      list = list.filter(e => e.customer_id === currentCustomer.customer_id);
    }
    if (trashSearchQuery.trim()) {
      const q = trashSearchQuery.toLowerCase().trim();
      list = list.filter(e =>
        (e.transfer_sheet_number && e.transfer_sheet_number.toLowerCase().includes(q)) ||
        (e.description && e.description.toLowerCase().includes(q)) ||
        (e.customer_name && e.customer_name.toLowerCase().includes(q)) ||
        (e.date && e.date.includes(q)) ||
        (e.delete_reason && e.delete_reason.toLowerCase().includes(q)) ||
        (e.deleted_by && e.deleted_by.toLowerCase().includes(q))
      );
    }
    return [...list].sort((a, b) => (b.deleted_at || b.updated_at || '').localeCompare(a.deleted_at || a.updated_at || ''));
  }, [trashedEntries, trashCustomerFilter, currentCustomer, trashSearchQuery]);

  // Filtered rows inside table based on search and sheet number
  const displayedEntries = useMemo(() => {
    let result = customerEntries;

    // Filter by Sheet Direction (all / in / out)
    if (sheetDirectionFilter === 'in') {
      result = result.filter(item => {
        const num = (item.transfer_sheet_number || '').trim().toLowerCase();
        return num.endsWith('i') || (item.cylinder_in > 0 || item.new_valve_in > 0 || item.used_valve_in > 0);
      });
    } else if (sheetDirectionFilter === 'out') {
      result = result.filter(item => {
        const num = (item.transfer_sheet_number || '').trim().toLowerCase();
        return num.endsWith('e') || (item.cylinder_out > 0 || item.new_valve_out > 0 || item.used_valve_out > 0 || item.scrap_out > 0);
      });
    }

    // Filter by Dedicated Sheet Number search
    if (sheetNumberFilter.trim()) {
      const snQ = sheetNumberFilter.toLowerCase().trim();
      result = result.filter(item =>
        item.transfer_sheet_number && item.transfer_sheet_number.toLowerCase().includes(snQ)
      );
    }

    // General text query (description, date, etc.)
    if (tableFilterQuery.trim()) {
      const q = tableFilterQuery.toLowerCase().trim();
      result = result.filter(
        item =>
          item.description.toLowerCase().includes(q) ||
          item.date.toLowerCase().includes(q) ||
          (item.transfer_sheet_number && item.transfer_sheet_number.toLowerCase().includes(q)) ||
          (item.custom_item_name && item.custom_item_name.toLowerCase().includes(q))
      );
    }

    return result;
  }, [customerEntries, sheetDirectionFilter, sheetNumberFilter, tableFilterQuery]);

  // Ledger summary metrics strictly for current customer
  const stats = useMemo(() => {
    const last = customerEntries[customerEntries.length - 1];
    const totalScrapStockIn = customerEntries.reduce((acc, cur) => acc + (cur.scrap_stock_in || 0), 0);
    const totalScrapOut = customerEntries.reduce((acc, cur) => acc + (cur.scrap_out || 0), 0);
    const totalFinalScrapOut = customerEntries.reduce((acc, cur) => acc + (cur.final_scrap_out || 0), 0);
    const netTempScrap = Math.max(0, totalScrapStockIn - totalScrapOut);

    return {
      currentCylinders: last ? last.cylinder_balance : 0,
      currentScrap: last ? last.scrap_balance : 0,
      netTempScrap, // خالص ذخیره انبار ضایعات (موقت ماهانه که خروج ضایعات از آن کم می‌کند)
      currentNewValves: last ? last.new_valve_balance : 0,
      currentUsedValves: last ? Math.max(0, last.used_valve_balance || 0) : 0,
      totalEntries: customerEntries.length,
      totalDispatched: customerEntries.filter(cur => Boolean(cur.dispatched && String(cur.dispatched).trim() !== '' && String(cur.dispatched).trim() !== '0' && String(cur.dispatched).trim() !== '۰')).length,
      totalDefective: customerEntries.reduce((acc, cur) => acc + (cur.defective || 0), 0),
      totalCylinderIn: customerEntries.reduce((acc, cur) => acc + (cur.cylinder_in || 0), 0),
      totalCylinderOut: customerEntries.reduce((acc, cur) => acc + (cur.cylinder_out || 0), 0),
      totalScrapOut,
      totalFinalScrapOut,
      totalScrapStockIn,
      totalNewValveIn: customerEntries.reduce((acc, cur) => acc + (cur.new_valve_in || 0), 0),
      totalNewValveOut: customerEntries.reduce((acc, cur) => acc + (cur.new_valve_out || 0), 0),
      totalUsedValveIn: customerEntries.reduce((acc, cur) => acc + (cur.used_valve_in || 0), 0),
      totalUsedValveOut: customerEntries.reduce((acc, cur) => acc + (cur.used_valve_out || 0), 0)
    };
  }, [customerEntries]);

  // Filtered customer list for instant suggestions (name, company, province, id)
  const filteredCustomers = useMemo(() => {
    const q = customerSearchQuery.toLowerCase().trim();
    if (!q) return [];
    return customers.filter(
      c =>
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.company_name && c.company_name.toLowerCase().includes(q)) ||
        (c.province && c.province.toLowerCase().includes(q)) ||
        (c.city && c.city.toLowerCase().includes(q)) ||
        (c.customer_id && c.customer_id.toLowerCase().includes(q))
    ).slice(0, 20);
  }, [customers, customerSearchQuery]);

  // All customers sorted alphabetically for full dropdown menu
  const allSortedCustomers = useMemo(() => {
    return [...customers].sort((a, b) => (a.name || '').localeCompare(b.name || '', 'fa'));
  }, [customers]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4500);
  };

  // Switch customer handler (syncing all parts of view)
  const handleSelectCustomer = (custId: string) => {
    setSelectedCustomerId(custId);
    onCustomerChange?.(custId);
    const target = customers.find(c => c.customer_id === custId);
    if (target) {
      showToast(`کاردکس گاز «${target.name}» فعال شد.`, 'info');
    }
  };

  // Live Warehouse Stock of "قطعه شیر نو" & reactive updates
  const [warehouseStockVersion, setWarehouseStockVersion] = useState(0);

  useEffect(() => {
    const handleStockChanged = () => {
      setWarehouseStockVersion(v => v + 1);
    };
    window.addEventListener('mgas:stock_movement_added', handleStockChanged);
    window.addEventListener('mgas:inspection_added', handleStockChanged);
    window.addEventListener('mgas:database_refreshed', handleStockChanged);
    return () => {
      window.removeEventListener('mgas:stock_movement_added', handleStockChanged);
      window.removeEventListener('mgas:inspection_added', handleStockChanged);
      window.removeEventListener('mgas:database_refreshed', handleStockChanged);
    };
  }, []);

  const newValveWarehouseStock = useMemo(() => {
    try {
      return LocalStorageManager.getNewValveWarehouseStock(currentEnv);
    } catch {
      return 0;
    }
  }, [currentEnv, showAddEntryModal, showEditKardexModal, allKardexEntries, warehouseStockVersion]);

  // Pending Inspections from Hajivand
  const pendingInspections = useMemo(() => {
    try {
      return LocalStorageManager.getCylinderValveInspections(currentEnv).filter(
        i => i.status === 'COUNTED_READY_FOR_KARDEX'
      );
    } catch {
      return [];
    }
  }, [currentEnv, allKardexEntries, warehouseStockVersion]);

  // If a pending inspection was passed from notification banner
  useEffect(() => {
    if (pendingInspectionToRegister) {
      const insp = pendingInspectionToRegister;
      if (insp.customer_id && insp.customer_id !== selectedCustomerId) {
        setSelectedCustomerId(insp.customer_id);
        onCustomerChange?.(insp.customer_id);
      }
      setEntryTab('in');
      setDailyLoadingCount(1);
      setLinkedInspectionId(insp.inspection_id);

      const isValve = insp.item_type?.includes('VALVE') || insp.item_name?.includes('شیر');
      const isCylinder = insp.item_type?.includes('CYLINDER') || insp.item_name?.includes('سیلندر');

      let calcNewValves = !isCylinder ? insp.actual_healthy_quantity : 0;
      let calcUsedValves = 0;
      if (insp.receipt_items && insp.receipt_items.length > 0) {
        const usedSum = insp.receipt_items
          .filter(i => (i.description || '').includes('کهنه'))
          .reduce((sum, i) => sum + (Number(i.quantity) || 0), 0);
        const newSum = insp.receipt_items
          .filter(i => !(i.description || '').includes('کهنه') && ((i.description || '').includes('شیر') || (i.remarks || '').includes('شیر')))
          .reduce((sum, i) => sum + (Number(i.quantity) || 0), 0);
        if (usedSum > 0 || newSum > 0) {
          calcNewValves = newSum;
          calcUsedValves = usedSum;
        }
      }

      setNewEntry({
        date: insp.date || getPersianDate(),
        description: `ورودی تاییدشده توسط مهندس حاجی‌وند [${insp.item_name}] (بارنامه ${insp.waybill_number} - اعلامی: ${toPersianDigits(insp.declared_quantity)}، سالم: ${toPersianDigits(insp.actual_healthy_quantity)}، معیوب: ${toPersianDigits(insp.defective_quantity)})`,
        transfer_sheet_number: insp.form_number || '',
        cylinder_type: selectedCylinderType,
        cylinder_in: isCylinder ? insp.actual_healthy_quantity : 0,
        cylinder_out: 0,
        scrap_out: 0,
        final_scrap_out: 0,
        scrap_stock_in: 0,
        cylinder_balance: stats.currentCylinders || 0,
        scrap_balance: stats.currentScrap || 0,
        new_valve_in: calcNewValves,
        new_valve_out: 0,
        new_valve_balance: (stats.currentNewValves || 0) + calcNewValves,
        dispatched: '',
        used_valve_in: calcUsedValves,
        used_valve_out: 0,
        used_valve_balance: Math.max(0, (stats.currentUsedValves || 0) + calcUsedValves),
        defective: insp.defective_quantity || 0,
        notes: `نوع قلم وارده: ${insp.item_name} ${insp.notes ? `| ${insp.notes}` : ''}`
      });
      setShowAddEntryModal(true);
      showToast(`اطلاعات برگه «${insp.form_number}» (${insp.item_name}) شمارش‌شده توسط مهندس حاجی‌وند بارگذاری شد. لطفاً تایید نهایی را ثبت فرمایید.`, 'info');
    }
  }, [pendingInspectionToRegister]);

  // Helper to open the add entry modal with incoming/outgoing preset
  const openAddEntryModal = (type: 'in' | 'out' = 'in') => {
    // 1. Role enforcement: Hajivand CANNOT register Kardex
    if (currentUser?.username === 'hajivand' || currentUser?.username === 'gholizadeh' || currentUser?.role === 'WAREHOUSE_KEEPER') {
      showToast('عدم دسترسی: کاربر محترم مهندس حاجی‌وند، ثبت کاردکس در حیطه مسئولیت مدیر داخلی (خانم کرمی) و مدیریت است. وظیفه شما شمارش فیزیکی در منوی «ورودی شیر و سیلندر» می‌باشد.', 'error');
      return;
    }

    // 2. Role enforcement: Karami can only register incoming kardex after Hajivand inspection
    if (currentUser?.username === 'karami' && type === 'in') {
      const readyInspections = LocalStorageManager.getCylinderValveInspections(currentEnv).filter(
        i => i.status === 'COUNTED_READY_FOR_KARDEX'
      );

      if (readyInspections.length === 0) {
        showToast('توجه: ثبت کاردکس ورودی شیر و سیلندر منوط به شمارش فیزیکی و تایید قبلی توسط مهندس حاجی‌وند در منوی «ورودی شیر و سیلندر» می‌باشد. در حال حاضر ورودی تاییدشده جدیدی وجود ندارد.', 'info');
        return;
      }

      // If there is an inspection for this customer or generally, link it
      const matchForCurrent = readyInspections.find(i => i.customer_id === selectedCustomerId) || readyInspections[0];
      if (matchForCurrent) {
        if (matchForCurrent.customer_id !== selectedCustomerId) {
          setSelectedCustomerId(matchForCurrent.customer_id);
          onCustomerChange?.(matchForCurrent.customer_id);
        }
        setLinkedInspectionId(matchForCurrent.inspection_id);
        setEntryTab('in');
        const isValve = matchForCurrent.item_type?.includes('VALVE') || matchForCurrent.item_name?.includes('شیر');
        const isCylinder = matchForCurrent.item_type?.includes('CYLINDER') || matchForCurrent.item_name?.includes('سیلندر');

        setNewEntry({
          date: matchForCurrent.date || getPersianDate(),
          description: `ورودی تاییدشده توسط مهندس حاجی‌وند [${matchForCurrent.item_name}] (بارنامه ${matchForCurrent.waybill_number} - اعلامی: ${toPersianDigits(matchForCurrent.declared_quantity)}، سالم: ${toPersianDigits(matchForCurrent.actual_healthy_quantity)}، معیوب: ${toPersianDigits(matchForCurrent.defective_quantity)})`,
          transfer_sheet_number: matchForCurrent.form_number || '',
          cylinder_type: selectedCylinderType,
          cylinder_in: isCylinder ? matchForCurrent.actual_healthy_quantity : 0,
          cylinder_out: 0,
          scrap_out: 0,
          final_scrap_out: 0,
          scrap_stock_in: 0,
          cylinder_balance: stats.currentCylinders || 0,
          scrap_balance: stats.currentScrap || 0,
          new_valve_in: !isCylinder ? matchForCurrent.actual_healthy_quantity : 0,
          new_valve_out: 0,
          new_valve_balance: (stats.currentNewValves || 0) + (!isCylinder ? matchForCurrent.actual_healthy_quantity : 0),
          dispatched: '',
          used_valve_in: isCylinder ? matchForCurrent.actual_healthy_quantity : 0,
          used_valve_out: 0,
          used_valve_balance: Math.max(0, (stats.currentUsedValves || 0) + (isCylinder ? matchForCurrent.actual_healthy_quantity : 0)),
          defective: matchForCurrent.defective_quantity || 0,
          notes: `نوع قلم وارده: ${matchForCurrent.item_name} ${matchForCurrent.notes ? `| ${matchForCurrent.notes}` : ''}`
        });
        setShowAddEntryModal(true);
        showToast(`ورودی تاییدشده توسط مهندس حاجی‌وند برای «${matchForCurrent.customer_name}» بارگذاری شد.`, 'success');
        return;
      }
    }

    // Default flow (for Outgoing entries or Admin Amouei)
    setLinkedInspectionId(null);
    setEntryTab(type);
    const currentDate = getPersianDate();
    const autoCount = calculateDailyRequestCount(
      allKardexEntries,
      currentCustomer?.name || currentCustomer?.customer_id || '',
      currentDate
    );
    setDailyLoadingCount(autoCount);
    const standardSheet = generateSheetNumber(
      currentCustomer?.name || 'البرز گاز',
      currentDate,
      type === 'in' ? 'i' : 'e',
      autoCount
    );
    setNewEntry({
      date: currentDate,
      description: type === 'in' ? 'دریافت و ورود محموله کپسول و شیرآلات' : 'ارسال و خروج محموله کپسول و بارنامه',
      transfer_sheet_number: standardSheet,
      cylinder_type: selectedCylinderType,
      cylinder_in: 0,
      cylinder_out: 0,
      scrap_out: 0,
      final_scrap_out: 0,
      scrap_stock_in: 0,
      cylinder_balance: stats.currentCylinders || 0,
      scrap_balance: stats.currentScrap || 0,
      new_valve_in: 0,
      new_valve_out: 0,
      new_valve_balance: stats.currentNewValves || 0,
      dispatched: '',
      used_valve_in: 0,
      used_valve_out: 0,
      used_valve_balance: Math.max(0, stats.currentUsedValves || 0),
      defective: 0,
      notes: ''
    });
    setShowAddEntryModal(true);
  };

  // Switch between incoming (i) and outgoing (e) tabs inside popup
  const handleTabChange = (newTab: 'in' | 'out') => {
    setEntryTab(newTab);
    const dateToUse = newEntry.date || getPersianDate();
    const calculatedCount = calculateDailyRequestCount(
      allKardexEntries,
      currentCustomer?.name || currentCustomer?.customer_id || '',
      dateToUse
    );
    setDailyLoadingCount(calculatedCount);
    const updatedSheet = generateSheetNumber(
      currentCustomer?.name || 'البرز گاز',
      dateToUse,
      newTab === 'in' ? 'i' : 'e',
      calculatedCount
    );

    const prevCyl = stats.currentCylinders || 0;
    const prevScrap = stats.currentScrap || 0;
    const prevNewValves = stats.currentNewValves || 0;
    const prevUsedValves = Math.max(0, stats.currentUsedValves || 0);

    const cylIn = newTab === 'in' ? (Number(newEntry.cylinder_in) || 0) : 0;
    const cylOut = newTab === 'out' ? (Number(newEntry.cylinder_out) || 0) : 0;
    const scrapOut = newTab === 'out' ? (Number(newEntry.scrap_out) || 0) : 0;
    const scrapStockIn = Number(newEntry.scrap_stock_in) || 0;
    const finalScrapOut = newTab === 'out' ? (Number(newEntry.final_scrap_out) || 0) : 0;

    const calculatedCylBal = prevCyl + cylIn - cylOut - scrapStockIn;
    const calculatedScrapBal = prevScrap + scrapStockIn - scrapOut - finalScrapOut;

    // New valve calculation on tab change:
    const newValveIn = newTab === 'in' ? (Number(newEntry.new_valve_in) || 0) : 0;
    const newValveOut = newTab === 'out' ? (cylOut > 0 ? cylOut : (Number(newEntry.new_valve_out) || 0)) : 0;
    const calculatedNewValveBal = prevNewValves + newValveIn - newValveOut;

    // Used valve calculation on tab change (ورودی شیر کهنه به صورت دستی وارد می‌شود و مستقیماً با ورودی سیلندر پر نمی‌شود):
    const usedValveIn = newTab === 'in' ? (Number(newEntry.used_valve_in) || 0) : 0;
    const usedValveOut = Number(newEntry.used_valve_out) || 0;
    const calculatedUsedValveBal = Math.max(0, prevUsedValves + usedValveIn - usedValveOut);

    setNewEntry(prev => ({
      ...prev,
      transfer_sheet_number: updatedSheet,
      description: newTab === 'in' ? 'دریافت و ورود محموله کپسول و شیرآلات' : 'ارسال و خروج محموله کپسول و بارنامه',
      cylinder_in: cylIn,
      cylinder_out: cylOut,
      scrap_out: scrapOut,
      final_scrap_out: finalScrapOut,
      scrap_stock_in: scrapStockIn,
      cylinder_balance: calculatedCylBal,
      scrap_balance: calculatedScrapBal,
      new_valve_in: newValveIn,
      new_valve_out: newValveOut,
      new_valve_balance: calculatedNewValveBal,
      used_valve_in: usedValveIn,
      used_valve_out: usedValveOut,
      used_valve_balance: calculatedUsedValveBal,
      dispatched: prev.dispatched,
      defective: newTab === 'in' ? prev.defective : 0
    }));
  };

  // Regenerate sheet number strictly on demand
  const handleRegenerateSheetNumber = (direction = entryTab, date = newEntry.date, count = dailyLoadingCount) => {
    const calculatedCount = count || calculateDailyRequestCount(
      allKardexEntries,
      currentCustomer?.name || currentCustomer?.customer_id || '',
      date || getPersianDate()
    );
    setDailyLoadingCount(calculatedCount);
    const generated = generateSheetNumber(
      currentCustomer?.name || 'البرز گاز',
      date || getPersianDate(),
      direction === 'in' ? 'i' : 'e',
      calculatedCount
    );
    setNewEntry(prev => ({ ...prev, transfer_sheet_number: generated }));
    showToast(`شماره برگه بر اساس فرمول استاندارد (${generated}) بازتولید شد.`, 'info');
  };

  // Adjust daily loading count (1 to 100) directly and update sheet number
  const handleDailyCountChange = (newCount: number) => {
    const clamped = Math.min(100, Math.max(1, Math.floor(newCount || 1)));
    setDailyLoadingCount(clamped);
    const generated = generateSheetNumber(
      currentCustomer?.name || 'البرز گاز',
      newEntry.date || getPersianDate(),
      entryTab === 'in' ? 'i' : 'e',
      clamped
    );
    setNewEntry(prev => ({ ...prev, transfer_sheet_number: generated }));
  };

  // Copy sheet number to clipboard
  const handleCopySheetNumber = () => {
    if (newEntry.transfer_sheet_number) {
      navigator.clipboard?.writeText(newEntry.transfer_sheet_number);
      setCopiedSheet(true);
      setTimeout(() => setCopiedSheet(false), 2000);
      showToast(`شماره برگه «${newEntry.transfer_sheet_number}» کپی شد.`, 'success');
    }
  };

  // User Formula Implementation for Add Modal & Edit Modal:
  // 1. ("مانده سیلندر" در هر سطر از کاردکس) = (مانده سطر قبل) + ("ورودی سیلندر" همان سطر) – ("خروج سیلندر" واقعی همان سطر) – ("خروج ضایعات سوری" همان سطر)
  // 2. ("مانده ضایعات" در هر سطر) = ("مانده ضایعات" از سطر قبل) + ("خروج ضایعات سوری" در همان سطر) – ("خروج واقعی" در همان سطر) - ("خروج ضایعات ذخیره")
  // 3. شیر نو: ورودی شیر نو هر عددی می‌پذیرد. خروج شیر نو همیشه برابر است با خروج سیلندر و از مانده قبل کم می‌شود.
  //    مانده شیر نو = مانده قبل + ورودی شیر نو - خروج شیر نو (مقدار منفی می‌پذیرد و غیرقابل ویرایش است، کسری از موجودی خود ام‌گاز)
  // 4. شیر کهنه: مقدار ورودی شیر کهنه نیازی نیست مستقیماً با ورودی سیلندر پر شود و به صورت دستی نوشته می‌شود.
  //    مانده شیر کهنه = مانده قبل + ورودی شیر کهنه - خروج شیر کهنه (نمی‌تواند منفی شود و حداقل صفر است)
  const updateNewEntryField = (field: string, value: any) => {
    setNewEntry(prev => {
      const next = { ...prev, [field]: value };
      if (
        field === 'cylinder_balance' ||
        field === 'scrap_balance' ||
        field === 'new_valve_balance' ||
        field === 'used_valve_balance'
      ) {
        return next;
      }
      const prevCyl = stats.currentCylinders || 0;
      const prevScrap = stats.currentScrap || 0;
      const prevNewValves = stats.currentNewValves || 0;
      const prevUsedValves = Math.max(0, stats.currentUsedValves || 0);

      const cylIn = field === 'cylinder_in' ? (Number(value) || 0) : (Number(next.cylinder_in) || 0);
      const cylOut = field === 'cylinder_out' ? (Number(value) || 0) : (Number(next.cylinder_out) || 0);
      const scrapOut = field === 'scrap_out' ? (Number(value) || 0) : (Number(next.scrap_out) || 0);
      const scrapStockIn = field === 'scrap_stock_in' ? (Number(value) || 0) : (Number(next.scrap_stock_in) || 0);
      const finalScrapOut = field === 'final_scrap_out' ? (Number(value) || 0) : (Number(next.final_scrap_out) || 0);

      // Rule: فیلد "خروج شیر نو" همیشه برابر است با مقدار "خروج سیلندر" است و از "مانده شیر نو" سطر قبل کم میشود.
      // سلول شیر کهنه وابسته به جایی نیست و با خروج سیلندر تغییر نمی‌کند
      if (field === 'cylinder_out') {
        next.new_valve_out = cylOut;
      }

      const calculatedCylBal = prevCyl + cylIn - cylOut - scrapStockIn;
      const calculatedScrapBal = prevScrap + scrapStockIn - scrapOut - finalScrapOut;

      const newValveIn = field === 'new_valve_in' ? (Number(value) || 0) : (Number(next.new_valve_in) || 0);
      const newValveOut = field === 'new_valve_out' ? (Number(value) || 0) : (field === 'cylinder_out' ? cylOut : (Number(next.new_valve_out) || 0));
      const calculatedNewValveBal = prevNewValves + newValveIn - newValveOut;

      // ورودی شیر کهنه به صورت دستی وارد می‌شود و مستقیماً با ورودی سیلندر پر نمی‌شود
      const usedValveIn = field === 'used_valve_in' ? (Number(value) || 0) : (Number(next.used_valve_in) || 0);
      // سلول خروج شیر کهنه مستقل است و وابسته به خروج سیلندر نیست
      const usedValveOut = field === 'used_valve_out' ? (Number(value) || 0) : (Number(next.used_valve_out) || 0);
      // مانده شیر کهنه = مانده قبل + ورودی شیر کهنه - خروج شیر کهنه (نمی‌تواند منفی شود و حداقل صفر است)
      const calculatedUsedValveBal = Math.max(0, prevUsedValves + usedValveIn - usedValveOut);

      return {
        ...next,
        cylinder_balance: calculatedCylBal,
        scrap_balance: calculatedScrapBal,
        new_valve_in: newValveIn,
        new_valve_out: newValveOut,
        new_valve_balance: calculatedNewValveBal,
        used_valve_in: usedValveIn,
        used_valve_out: usedValveOut,
        used_valve_balance: calculatedUsedValveBal
      };
    });
  };

  const updateEditFormField = (field: string, value: any) => {
    setEditKardexForm(prev => {
      const next = { ...prev, [field]: value };
      if (
        field === 'cylinder_balance' ||
        field === 'scrap_balance' ||
        field === 'new_valve_balance' ||
        field === 'used_valve_balance'
      ) {
        return next;
      }
      const editIdx = customerEntries.findIndex(e => e.entry_id === editingKardexEntry?.entry_id);
      const prevEntry = editIdx > 0 ? customerEntries[editIdx - 1] : null;
      const prevCyl = prevEntry ? (prevEntry.cylinder_balance || 0) : 0;
      const prevScrap = prevEntry ? (prevEntry.scrap_balance || 0) : 0;
      const prevNewValves = prevEntry ? (prevEntry.new_valve_balance || 0) : 0;
      const prevUsedValves = prevEntry ? Math.max(0, prevEntry.used_valve_balance || 0) : 0;

      const cylIn = field === 'cylinder_in' ? (Number(value) || 0) : (Number(next.cylinder_in) || 0);
      const cylOut = field === 'cylinder_out' ? (Number(value) || 0) : (Number(next.cylinder_out) || 0);
      const scrapOut = field === 'scrap_out' ? (Number(value) || 0) : (Number(next.scrap_out) || 0);
      const scrapStockIn = field === 'scrap_stock_in' ? (Number(value) || 0) : (Number(next.scrap_stock_in) || 0);
      const finalScrapOut = field === 'final_scrap_out' ? (Number(value) || 0) : (Number(next.final_scrap_out) || 0);

      // Rule: خروج شیر نو برابر خروج سیلندر؛ اما سلول شیر کهنه مستقل است و وابسته به جایی نیست
      if (field === 'cylinder_out') {
        next.new_valve_out = cylOut;
      }

      const calculatedCylBal = prevCyl + cylIn - cylOut - scrapStockIn;
      const calculatedScrapBal = prevScrap + scrapStockIn - scrapOut - finalScrapOut;

      const newValveIn = field === 'new_valve_in' ? (Number(value) || 0) : (Number(next.new_valve_in) || 0);
      const newValveOut = field === 'new_valve_out' ? (Number(value) || 0) : (field === 'cylinder_out' ? cylOut : (Number(next.new_valve_out) || 0));
      const calculatedNewValveBal = prevNewValves + newValveIn - newValveOut;

      // ورودی شیر کهنه به صورت دستی وارد می‌شود و مستقیماً با ورودی سیلندر پر نمی‌شود
      const usedValveIn = field === 'used_valve_in' ? (Number(value) || 0) : (Number(next.used_valve_in) || 0);
      // سلول خروج شیر کهنه مستقل است و وابسته به خروج سیلندر نیست
      const usedValveOut = field === 'used_valve_out' ? (Number(value) || 0) : (Number(next.used_valve_out) || 0);
      // مانده شیر کهنه = مانده قبل + ورودی شیر کهنه - خروج شیر کهنه (نمی‌تواند منفی شود و حداقل صفر است)
      const calculatedUsedValveBal = Math.max(0, prevUsedValves + usedValveIn - usedValveOut);

      return {
        ...next,
        cylinder_balance: calculatedCylBal,
        scrap_balance: calculatedScrapBal,
        new_valve_in: newValveIn,
        new_valve_out: newValveOut,
        new_valve_balance: calculatedNewValveBal,
        used_valve_in: usedValveIn,
        used_valve_out: usedValveOut,
        used_valve_balance: calculatedUsedValveBal
      };
    });
  };

  // Add new Kardex Entry with synchronization and optional immediate print
  const handleCreateEntry = (e?: React.FormEvent, andPrint: boolean = false) => {
    if (e) e.preventDefault();
    if (!currentCustomer) return;

    // Strict Anti-Injection & Input Security Guards
    const descCheck = validateFieldSecurity(newEntry.description, 'شرح سند', { maxLength: 500 });
    if (!descCheck.isValid) {
      showToast(descCheck.error!, 'error');
      return;
    }
    const notesCheck = validateFieldSecurity(newEntry.notes, 'یادداشت', { maxLength: 1000, allowMultiline: true });
    if (!notesCheck.isValid) {
      showToast(notesCheck.error!, 'error');
      return;
    }
    const sheetCheck = validateFieldSecurity(newEntry.transfer_sheet_number, 'شماره برگه حواله', { maxLength: 100 });
    if (!sheetCheck.isValid) {
      showToast(sheetCheck.error!, 'error');
      return;
    }
    const dateCheck = validateFieldSecurity(newEntry.date, 'تاریخ سند', { maxLength: 20 });
    if (!dateCheck.isValid) {
      showToast(dateCheck.error!, 'error');
      return;
    }

    const entryId = generateUUID('GK');
    const eventId = generateUUID('EVT-GK');

    // Canonical sheet number strictly conforming to: [CustomerCode] + [MMDDCC] + [i/e]
    const finalSheetNumber = sheetCheck.cleanValue
      ? sheetCheck.cleanValue
      : generateSheetNumber(
          currentCustomer.name,
          dateCheck.cleanValue || getPersianDate(),
          entryTab === 'in' ? 'i' : 'e',
          dailyLoadingCount
        );

    const isIncoming = entryTab === 'in';

    // Strict Validation: ستون ارسالی فقط متن می‌پذیرد و نباید عدد بپذیرد
    const rawDispatched = typeof newEntry.dispatched === 'string' ? newEntry.dispatched.trim() : (newEntry.dispatched ? String(newEntry.dispatched).trim() : '');
    if (rawDispatched !== '' && rawDispatched !== '0' && rawDispatched !== '۰') {
      const digitsOnlyCheck = rawDispatched.replace(/[0-9\u06F0-\u06F9\u0660-\u0669\s,.\-+]/g, '');
      if (digitsOnlyCheck.length === 0) {
        showToast('ستون ارسالی فقط متن می‌پذیرد و نباید عدد بپذیرد.', 'error');
        return;
      }
    }

      const prevCyl = stats.currentCylinders || 0;
      const prevScrap = stats.currentScrap || 0;
      const prevNewValves = stats.currentNewValves || 0;
      const prevUsedValves = Math.max(0, stats.currentUsedValves || 0);

      const cylInVal = sanitizeNumber(newEntry.cylinder_in, 0, 0, 1000000);
      const cylOutVal = sanitizeNumber(newEntry.cylinder_out, 0, 0, 1000000);
      const scrapOutVal = sanitizeNumber(newEntry.scrap_out, 0, 0, 1000000);
      const scrapStockInVal = sanitizeNumber(newEntry.scrap_stock_in, 0, 0, 1000000);
      const finalScrapOutVal = sanitizeNumber(newEntry.final_scrap_out, 0, 0, 1000000);

      // Exact Formula 1: ("مانده سیلندر" در هر سطر از کاردکس) = (مانده سطر قبل) + ("ورودی سیلندر" همان سطر) – ("خروج سیلندر" واقعی همان سطر) – ("خروج ضایعات سوری" همان سطر)
      const calculatedCylBal = prevCyl + cylInVal - cylOutVal - scrapStockInVal;
      // Exact Formula 2: ("مانده ضایعات" در هر سطر) = ("مانده ضایعات" از سطر قبل) + ("خروج ضایعات سوری" در همان سطر) – ("خروج واقعی" در همان سطر) - ("خروج ضایعات ذخیره / نهایی")
      const calculatedScrapBal = prevScrap + scrapStockInVal - scrapOutVal - finalScrapOutVal;

      // Exact Formula 3: شیر نو (ورودی هر عددی میپذیرد؛ خروج همیشه برابر با خروج سیلندر؛ مانده = مانده قبل + ورودی - خروج)
      const newValveInVal = sanitizeNumber(newEntry.new_valve_in, 0, 0, 1000000);
      const newValveOutVal = cylOutVal > 0 ? cylOutVal : sanitizeNumber(newEntry.new_valve_out, 0, 0, 1000000);
      const calculatedNewValveBal = prevNewValves + newValveInVal - newValveOutVal;

      // Exact Formula 4: شیر کهنه (سلول مستقل؛ ورودی = ورودی سیلندر با قابلیت ویرایش؛ مانده = مانده قبل + ورودی - خروجی با کف صفر)
      const usedValveInVal = sanitizeNumber(newEntry.used_valve_in, 0, 0, 1000000);
      const usedValveOutVal = sanitizeNumber(newEntry.used_valve_out, 0, 0, 1000000);
      const calculatedUsedValveBal = Math.max(0, prevUsedValves + usedValveInVal - usedValveOutVal);

      const entryData: GasKardexEntry = {
        entry_id: entryId,
        customer_id: currentCustomer.customer_id,
        customer_name: currentCustomer.name,
        cylinder_type: selectedCylinderType,
        date: dateCheck.cleanValue || getPersianDate(),
        description: descCheck.cleanValue || (isIncoming ? 'دریافت و ورود محموله کپسول و شیرآلات' : 'ارسال و خروج محموله کپسول و بارنامه'),
        transfer_sheet_number: finalSheetNumber,
        cylinder_in: cylInVal,
        cylinder_out: cylOutVal,
        scrap_out: scrapOutVal,
        final_scrap_out: finalScrapOutVal,
        scrap_stock_in: scrapStockInVal,
        cylinder_balance: calculatedCylBal,
        scrap_balance: calculatedScrapBal,
        new_valve_in: newValveInVal,
        new_valve_out: newValveOutVal,
        new_valve_balance: calculatedNewValveBal,
        dispatched: rawDispatched && rawDispatched !== '0' && rawDispatched !== '۰' ? sanitizeInput(rawDispatched) : '',
        used_valve_in: usedValveInVal,
        used_valve_out: usedValveOutVal,
        used_valve_balance: calculatedUsedValveBal,
        defective: sanitizeNumber(newEntry.defective, 0, 0, 1000000),
      user_id: currentUser.user_id,
      created_by_username: currentUser.username,
      inspection_id: linkedInspectionId || undefined,
      custom_item_name: linkedInspectionId
        ? (pendingInspections.find(i => i.inspection_id === linkedInspectionId)?.item_name ||
           LocalStorageManager.getCylinderValveInspections(currentEnv).find(i => i.inspection_id === linkedInspectionId)?.item_name)
        : undefined,
      device_id: dbState.deviceId,
      event_id: eventId,
      notes: notesCheck.cleanValue,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Auto-switch view to match the cylinder type of the newly added entry
    if (entryData.cylinder_type && entryData.cylinder_type !== selectedCylinderType) {
      setSelectedCylinderType(entryData.cylinder_type as CylinderType);
    }

    // 1. Record change locally and enqueue in SyncQueue (strictly performing sync behind the scenes)
    LocalStorageManager.recordLocalChange(
      currentEnv,
      currentUser.user_id,
      'GAS_KARDEX',
      'CREATE',
      entryId,
      entryData,
      `ثبت ردیف کاردکس گاز برای ${currentCustomer.name} (برگه ${entryData.transfer_sheet_number})`
    );

    // 2. INSTANT OPTIMISTIC & SEAMLESS REFRESH: Immediately push into React state and highlight the new row
    setAllKardexEntries(prev => [entryData, ...prev.filter(e => e.entry_id !== entryId)]);
    triggerSeamlessRefresh();
    setRecentlyAddedEntryId(entryId);
    setTimeout(() => setRecentlyAddedEntryId(null), 4000);

    // 3. Dispatch window custom event and BroadcastChannel for cross-window / Windows software
    try {
      window.dispatchEvent(new CustomEvent('mgas:kardex_updated', { detail: entryData }));
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel('mgas_kardex_sync_channel');
        bc.postMessage({ type: 'KARDEX_ENTRY_ADDED', entry: entryData });
        bc.close();
      }
    } catch (e) {
      console.warn('Broadcast notice:', e);
    }

    // 4. Windows Desktop Electron Bridge Notification (if running in Windows 11 / Windows 7 native app)
    if (typeof window !== 'undefined' && window.desktopAPI?.notifyKardexChange) {
      window.desktopAPI.notifyKardexChange(entryData).catch(() => {});
    }

    // 5. Trigger sync engine immediately to push to central server without waiting for background interval
    SyncEngine.syncNow(currentEnv).catch(() => {});

    // 6. Mark linked inspection registered if any
    if (linkedInspectionId) {
      LocalStorageManager.markInspectionAsKardexRegistered(
        currentEnv,
        linkedInspectionId,
        entryId,
        currentUser.username
      );
      setLinkedInspectionId(null);
      onClearPendingInspection?.();
    }

    setShowAddEntryModal(false);
    setNewEntry({
      date: getPersianDate(),
      description: '',
      transfer_sheet_number: '',
      cylinder_type: selectedCylinderType,
      cylinder_in: 0,
      cylinder_out: 0,
      scrap_out: 0,
      final_scrap_out: 0,
      scrap_stock_in: 0,
      cylinder_balance: 0,
      scrap_balance: 0,
      new_valve_in: 0,
      new_valve_out: 0,
      new_valve_balance: 0,
      dispatched: '',
      used_valve_in: 0,
      used_valve_out: 0,
      used_valve_balance: 0,
      defective: 0,
      notes: ''
    });

    if (calculatedNewValveBal < 0 || calculatedUsedValveBal < 0) {
      showToast(`ردیف در کاردکس «${currentCustomer.name}» ثبت شد. هشدار: به دلیل مانده منفی شیرآلات، کسری از موجودی خود ام‌گاز کسر گردید.`, 'info');
    } else {
      showToast(`ردیف جدید در کارتکس «${currentCustomer.name}» با شماره برگه ${entryData.transfer_sheet_number} ثبت شد.`);
    }

    if (andPrint) {
      if (entryTab === 'out' || isOutgoingEntry(entryData)) {
        setSelectedExitReceiptEntry(entryData);
        setShowExitReceiptModal(true);
      } else {
        setSelectedReceiptEntry(entryData);
        setShowReceiptModal(true);
      }
    }
  };

  // Create New Customer Handler
  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerForm.name.trim()) {
      showToast('لطفاً نام طرف حساب یا نمایندگی را وارد کنید.', 'error');
      return;
    }

    const newCustId = `CUST-GAS-${String(customers.length + 1).padStart(3, '0')}`;
    const newCust: Customer = {
      customer_id: newCustId,
      name: newCustomerForm.name.trim(),
      company_name: newCustomerForm.company_name.trim() || `مجموعه گاز ${newCustomerForm.name.trim()}`,
      province: newCustomerForm.province.trim() || 'تهران',
      city: newCustomerForm.city.trim() || 'تهران',
      phone: newCustomerForm.phone.trim() || `0912${Math.floor(1000000 + Math.random() * 9000000)}`,
      national_id: newCustomerForm.national_id.trim() || '',
      economic_code: newCustomerForm.economic_code.trim() || '',
      address: `${newCustomerForm.province}، ${newCustomerForm.city}، پایانه توزیع گاز`,
      credit_limit: Number(newCustomerForm.credit_limit) || 100000000,
      current_balance: Number(newCustomerForm.current_balance) || 0,
      customer_type: newCustomerForm.customer_type,
      notes: newCustomerForm.notes || 'طرف حساب ثبت‌شده در کاردکس',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Save to Local Database & enqueue sync
    LocalStorageManager.recordLocalChange(
      currentEnv,
      currentUser.user_id,
      'CUSTOMER',
      'CREATE',
      newCustId,
      newCust,
      `ایجاد طرف حساب جدید: ${newCust.name}`,
      { name: newCust.name, province: newCust.province }
    );

    // Trigger sync
    SyncEngine.syncNow(currentEnv).catch(() => {});

    // Automatically select the new customer so their Kardex is instantly displayed!
    triggerSeamlessRefresh();
    setSelectedCustomerId(newCustId);
    onCustomerChange?.(newCustId);
    setShowNewCustomerModal(false);

    // Reset Form
    setNewCustomerForm({
      name: '',
      company_name: '',
      province: 'تهران',
      city: 'تهران',
      phone: '',
      national_id: '',
      economic_code: '',
      address: '',
      credit_limit: 100000000,
      current_balance: 0,
      customer_type: 'عمده',
      notes: 'طرف حساب جدید ثبت‌شده در کاردکس گاز'
    });

    showToast(`طرف حساب «${newCust.name}» با موفقیت اضافه شد و کاردکس آن فعال گردید.`);
  };

  // Open Edit Customer Modal
  const handleOpenEditCustomer = () => {
    if (!currentCustomer) return;
    const perm = LocalStorageManager.checkDocumentEditPermission(currentEnv, currentUser, currentCustomer.created_at);
    if (!perm.allowed) {
      showToast(perm.reason || 'ویرایش مشخصات طرف حساب به دلیل انقضای مهلت ۱ ساعته مدیر داخلی مسدود است.', 'error');
      return;
    }
    setEditCustomerForm({
      name: currentCustomer.name || '',
      company_name: currentCustomer.company_name || '',
      province: currentCustomer.province || 'تهران',
      city: currentCustomer.city || 'تهران',
      phone: currentCustomer.phone || '',
      national_id: currentCustomer.national_id || '',
      economic_code: currentCustomer.economic_code || '',
      address: currentCustomer.address || '',
      customer_type: currentCustomer.customer_type || 'عمده',
      notes: currentCustomer.notes || ''
    });
    setShowEditCustomerModal(true);
  };

  // Update Customer Handler
  const handleUpdateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCustomer) return;
    if (!editCustomerForm.name.trim()) {
      showToast('نام طرف حساب نمی‌تواند خالی باشد.', 'error');
      return;
    }

    const updatedCust: Customer = {
      ...currentCustomer,
      name: editCustomerForm.name.trim(),
      company_name: editCustomerForm.company_name.trim(),
      province: editCustomerForm.province.trim() || currentCustomer.province,
      city: editCustomerForm.city.trim() || currentCustomer.city,
      phone: editCustomerForm.phone.trim() || currentCustomer.phone,
      national_id: editCustomerForm.national_id.trim(),
      economic_code: editCustomerForm.economic_code.trim(),
      customer_type: editCustomerForm.customer_type,
      notes: editCustomerForm.notes.trim(),
      updated_at: new Date().toISOString()
    };

    try {
      // Save update to LocalStorage & queue sync
      LocalStorageManager.recordLocalChange(
        currentEnv,
        currentUser.user_id,
        'CUSTOMER',
        'UPDATE',
        currentCustomer.customer_id,
        updatedCust,
        `ویرایش مشخصات طرف حساب: ${updatedCust.name}`,
        { name: updatedCust.name, province: updatedCust.province }
      );

      SyncEngine.syncNow(currentEnv).catch(() => {});
      setShowEditCustomerModal(false);
      triggerSeamlessRefresh();
      showToast(`اطلاعات طرف حساب «${updatedCust.name}» با موفقیت ویرایش شد.`);
    } catch (err: any) {
      showToast(err?.message || 'خطا در ویرایش طرف حساب', 'error');
    }
  };

  // State for Editing Kardex Entry (سطر کاردکس)
  const [editingKardexEntry, setEditingKardexEntry] = useState<GasKardexEntry | null>(null);
  const [editKardexForm, setEditKardexForm] = useState({
    date: '',
    transfer_sheet_number: '',
    cylinder_type: 'سیلندر 11 کیلویی' as CylinderType,
    description: '',
    cylinder_in: 0,
    cylinder_out: 0,
    scrap_out: 0,
    final_scrap_out: 0,
    scrap_stock_in: 0,
    cylinder_balance: 0,
    scrap_balance: 0,
    new_valve_in: 0,
    new_valve_out: 0,
    new_valve_balance: 0,
    used_valve_in: 0,
    used_valve_out: 0,
    used_valve_balance: 0,
    dispatched: '',
    defective: 0,
    notes: ''
  });

  const handleOpenEditKardex = (entry: GasKardexEntry) => {
    const perm = LocalStorageManager.checkDocumentEditPermission(currentEnv, currentUser, entry.created_at);
    if (!perm.allowed) {
      showToast(perm.reason || 'ویرایش این سند به دلیل محدودیت ۱ ساعته مدیر داخلی مسدود است.', 'error');
      return;
    }
    setEditingKardexEntry(entry);
    setEditKardexForm({
      date: entry.date || '',
      transfer_sheet_number: entry.transfer_sheet_number || '',
      cylinder_type: (entry.cylinder_type || 'سیلندر 11 کیلویی') as CylinderType,
      description: entry.description || '',
      cylinder_in: entry.cylinder_in || 0,
      cylinder_out: entry.cylinder_out || 0,
      scrap_out: entry.scrap_out || 0,
      final_scrap_out: entry.final_scrap_out || 0,
      scrap_stock_in: entry.scrap_stock_in || 0,
      cylinder_balance: entry.cylinder_balance ?? 0,
      scrap_balance: entry.scrap_balance ?? 0,
      new_valve_in: entry.new_valve_in || 0,
      new_valve_out: entry.new_valve_out || 0,
      new_valve_balance: entry.new_valve_balance ?? 0,
      used_valve_in: entry.used_valve_in || 0,
      used_valve_out: entry.used_valve_out || 0,
      used_valve_balance: Math.max(0, entry.used_valve_balance ?? 0),
      dispatched: entry.dispatched !== undefined && entry.dispatched !== null && String(entry.dispatched) !== '0' && String(entry.dispatched) !== '۰' ? String(entry.dispatched) : '',
      defective: entry.defective || 0,
      notes: entry.notes || ''
    });
    setShowEditKardexModal(true);
  };

  const handleSaveEditKardex = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingKardexEntry) return;

    // Strict Anti-Injection & Input Security Guards for Edit / Correction Form
    const descCheck = validateFieldSecurity(editKardexForm.description, 'شرح سند / راننده', { maxLength: 500 });
    if (!descCheck.isValid) {
      showToast(descCheck.error!, 'error');
      return;
    }
    const notesCheck = validateFieldSecurity(editKardexForm.notes, 'یادداشت و ملاحظات سند', { maxLength: 1000, allowMultiline: true });
    if (!notesCheck.isValid) {
      showToast(notesCheck.error!, 'error');
      return;
    }
    const sheetCheck = validateFieldSecurity(editKardexForm.transfer_sheet_number, 'شماره برگه حواله', { maxLength: 100 });
    if (!sheetCheck.isValid) {
      showToast(sheetCheck.error!, 'error');
      return;
    }
    const dateCheck = validateFieldSecurity(editKardexForm.date, 'تاریخ سند', { maxLength: 20 });
    if (!dateCheck.isValid) {
      showToast(dateCheck.error!, 'error');
      return;
    }

    // Strict Validation: ستون ارسالی فقط متن می‌پذیرد و نباید عدد بپذیرد
    const editDispatched = typeof editKardexForm.dispatched === 'string' ? editKardexForm.dispatched.trim() : (editKardexForm.dispatched ? String(editKardexForm.dispatched).trim() : '');
    if (editDispatched !== '' && editDispatched !== '0' && editDispatched !== '۰') {
      const editDigitsCheck = editDispatched.replace(/[0-9\u06F0-\u06F9\u0660-\u0669\s,.\-+]/g, '');
      if (editDigitsCheck.length === 0) {
        showToast('ستون ارسالی فقط متن می‌پذیرد و نباید عدد بپذیرد.', 'error');
        return;
      }
    }

    const res = LocalStorageManager.updateKardexEntry(
      currentEnv,
      editingKardexEntry.entry_id,
      {
        cylinder_type: editKardexForm.cylinder_type || editingKardexEntry.cylinder_type || 'سیلندر 11 کیلویی',
        date: dateCheck.cleanValue,
        transfer_sheet_number: sheetCheck.cleanValue,
        description: descCheck.cleanValue,
        cylinder_in: sanitizeNumber(editKardexForm.cylinder_in, 0, 0, 1000000),
        cylinder_out: sanitizeNumber(editKardexForm.cylinder_out, 0, 0, 1000000),
        scrap_out: sanitizeNumber(editKardexForm.scrap_out, 0, 0, 1000000),
        final_scrap_out: sanitizeNumber(editKardexForm.final_scrap_out, 0, 0, 1000000),
        scrap_stock_in: sanitizeNumber(editKardexForm.scrap_stock_in, 0, 0, 1000000),
        cylinder_balance: sanitizeNumber(editKardexForm.cylinder_balance, 0, -1000000, 1000000),
        scrap_balance: sanitizeNumber(editKardexForm.scrap_balance, 0, -1000000, 1000000),
        new_valve_in: sanitizeNumber(editKardexForm.new_valve_in, 0, 0, 1000000),
        new_valve_out: sanitizeNumber(editKardexForm.new_valve_out, 0, 0, 1000000),
        new_valve_balance: sanitizeNumber(editKardexForm.new_valve_balance, 0, -1000000, 1000000),
        used_valve_in: sanitizeNumber(editKardexForm.used_valve_in, 0, 0, 1000000),
        used_valve_out: sanitizeNumber(editKardexForm.used_valve_out, 0, 0, 1000000),
        used_valve_balance: Math.max(0, sanitizeNumber(editKardexForm.used_valve_balance, 0, 0, 1000000)),
        dispatched: editDispatched && editDispatched !== '0' && editDispatched !== '۰' ? sanitizeInput(editDispatched) : '',
        defective: sanitizeNumber(editKardexForm.defective, 0, 0, 1000000),
        notes: notesCheck.cleanValue
      },
      currentUser
    );

    if (!res.success) {
      showToast(res.error || 'خطا در ویرایش سند سطر کاردکس', 'error');
      return;
    }

    if (editKardexForm.cylinder_type && editKardexForm.cylinder_type !== selectedCylinderType) {
      setSelectedCylinderType(editKardexForm.cylinder_type as CylinderType);
    }

    setShowEditKardexModal(false);
    setEditingKardexEntry(null);
    if (res.entry) {
      setAllKardexEntries(prev => prev.map(e => e.entry_id === res.entry!.entry_id ? res.entry! : e));
    }
    triggerSeamlessRefresh();
    showToast('سند سطر کاردکس با موفقیت ویرایش و ذخیره شد.');
    SyncEngine.syncNow(currentEnv).catch(() => {});
  };

  // Open Delete / Move to Trash Modal (supports quick delete or confirmation modal)
  const handleOpenDeleteModal = (entry: GasKardexEntry, isQuick: boolean = false) => {
    const perm = LocalStorageManager.checkDocumentEditPermission(currentEnv, currentUser, entry.created_at);
    if (!perm.allowed) {
      showToast(perm.reason || 'حذف این سند به دلیل محدودیت ۱ ساعته مدیر داخلی مسدود است.', 'error');
      return;
    }

    if (isQuick) {
      const sheetNo = entry.transfer_sheet_number || entry.entry_id;
      // 1. Instant optimistic exclusion
      setAllKardexEntries(prev => prev.filter(e => e.entry_id !== entry.entry_id));
      const res = LocalStorageManager.moveKardexEntryToTrash(
        currentEnv,
        entry.entry_id,
        currentUser,
        'حذف سریع توسط کاربر'
      );
      if (!res.success) {
        triggerSeamlessRefresh();
        showToast(res.error || 'خطا در انتقال سند به سطل آشغال', 'error');
        return;
      }
      triggerSeamlessRefresh();
      showToast(`سند شماره برگه «${sheetNo}» با موفقیت به سطل آشغال منتقل شد و جدول به‌روزرسانی شد.`, 'success');
      SyncEngine.syncNow(currentEnv).catch(() => {});
      return;
    }

    setDeletingEntry(entry);
    setDeleteReasonInput('');
  };

  // Confirm moving Kardex entry to Trash
  const handleConfirmMoveToTrash = () => {
    if (!deletingEntry) return;
    const target = deletingEntry;
    const sheetNo = target.transfer_sheet_number || target.entry_id;

    // 1. Instant Optimistic UI Update: exclude from table in 0ms so the section refreshes visibly right away!
    setAllKardexEntries(prev => prev.filter(e => e.entry_id !== target.entry_id));
    setDeletingEntry(null);
    setDeleteReasonInput('');

    // 2. Persist soft-delete to storage
    const res = LocalStorageManager.moveKardexEntryToTrash(
      currentEnv,
      target.entry_id,
      currentUser,
      deleteReasonInput.trim() || undefined
    );

    if (!res.success) {
      triggerSeamlessRefresh();
      showToast(res.error || 'خطا در انتقال سند به سطل آشغال', 'error');
      return;
    }

    // 3. Fully seamless refresh
    triggerSeamlessRefresh();
    showToast(`سند شماره برگه «${sheetNo}» با موفقیت به سطل آشغال منتقل شد و مانده‌ها بازتراز شدند.`, 'success');
    SyncEngine.syncNow(currentEnv).catch(() => {});
  };

  // Restore entry from Trash (Recovery)
  const handleRestoreFromTrash = (entry: GasKardexEntry) => {
    // 1. Optimistic recovery in state
    setAllKardexEntries(prev => prev.map(e => e.entry_id === entry.entry_id ? { ...e, is_deleted: false } : e));

    const res = LocalStorageManager.restoreKardexEntry(currentEnv, entry.entry_id, currentUser);
    if (!res.success) {
      triggerSeamlessRefresh();
      showToast(res.error || 'خطا در بازیابی سند', 'error');
      return;
    }

    triggerSeamlessRefresh();
    showToast(`سند شماره برگه «${entry.transfer_sheet_number || entry.entry_id}» با موفقیت ریکاوری شد و به کاردکس بازگشت.`, 'success');
    SyncEngine.syncNow(currentEnv).catch(() => {});
  };

  // Permanently delete from Trash (Opens confirmation modal without window.confirm)
  const handleOpenPermanentDeleteModal = (entry: GasKardexEntry) => {
    setEntryToPermanentlyDelete(entry);
  };

  // Execute permanent delete after user confirmation in modal
  const handleExecutePermanentDelete = () => {
    if (!entryToPermanentlyDelete) return;
    const entry = entryToPermanentlyDelete;
    const sheetNo = entry.transfer_sheet_number || entry.entry_id;

    // 1. Optimistic removal
    setAllKardexEntries(prev => prev.filter(e => e.entry_id !== entry.entry_id));
    setEntryToPermanentlyDelete(null);

    const res = LocalStorageManager.permanentDeleteKardexEntry(currentEnv, entry.entry_id, currentUser);
    if (!res.success) {
      triggerSeamlessRefresh();
      showToast(res.error || 'خطا در حذف دائمی سند', 'error');
      return;
    }

    triggerSeamlessRefresh();
    showToast(`سند «${sheetNo}» به‌صورت دائمی و برای همیشه حذف گردید.`, 'success');
    SyncEngine.syncNow(currentEnv).catch(() => {});
  };

  // Empty Trash completely (Opens confirmation modal without window.confirm)
  const handleOpenEmptyTrashModal = () => {
    if (trashedEntries.length === 0) {
      showToast('سطل آشغال خالی است.', 'info');
      return;
    }
    setShowEmptyTrashConfirmModal(true);
  };

  // Execute emptying trash after user confirmation in modal
  const handleExecuteEmptyTrash = () => {
    if (trashedEntries.length === 0) return;

    const res = LocalStorageManager.emptyKardexTrash(currentEnv, undefined, currentUser);
    if (!res.success) {
      showToast(res.error || 'خطا در تخلیه سطل آشغال', 'error');
      setShowEmptyTrashConfirmModal(false);
      return;
    }

    setShowEmptyTrashConfirmModal(false);
    triggerSeamlessRefresh();
    showToast(`سطل آشغال با موفقیت تخلیه شد (${toPersianDigits(res.count)} سند برای همیشه حذف گردید).`);
    SyncEngine.syncNow(currentEnv).catch(() => {});
  };

  // Export current Kardex to Excel with Right-to-Left (RTL) format
  const handleExportExcel = () => {
    if (!currentCustomer) return;
    exportKardexToXLSX(currentCustomer.name, customerEntries, selectedCylinderType);
    showToast(`فایل اکسل راست‌به‌چپ (RTL) کاردکس گاز «${currentCustomer.name}» (${selectedCylinderType}) با موفقیت تولید شد.`);
  };

  // Download Blank template
  const handleDownloadBlank = () => {
    const link = document.createElement('a');
    link.href = '/kardex_gas_blank.xlsx';
    link.download = 'kardex_gas_blank.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('فایل نمونه خام اکسل (kardex_gas_blank.xlsx) دانلود شد.');
  };

  // Handle Excel file upload and parsing
  const handleImportFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importFile || !currentCustomer) return;

    try {
      setIsImporting(true);
      const importedEntries = await parseKardexFromXLSX(
        importFile,
        currentCustomer.customer_id,
        currentCustomer.name,
        currentUser.user_id,
        dbState.deviceId,
        selectedCylinderType
      );

      // Record each entry in local DB & sync queue
      for (const entry of importedEntries) {
        LocalStorageManager.recordLocalChange(
          currentEnv,
          currentUser.user_id,
          'GAS_KARDEX',
          'CREATE',
          entry.entry_id,
          entry,
          `ورود از اکسل کاردکس گاز (${selectedCylinderType}): ${entry.description}`
        );
      }

      // Trigger sync
      SyncEngine.syncNow(currentEnv).catch(() => {});

      setShowImportModal(false);
      setImportFile(null);
      showToast(`${formatPersianNumber(importedEntries.length)} ردیف کاردکس «${selectedCylinderType}» از فایل اکسل با موفقیت وارد سیستم شد.`);
    } catch (err: any) {
      console.warn('Import warning:', err?.message || err);
      showToast(`خطا در پردازش فایل اکسل: ${err.message || 'فرمت فایل نامعتبر است'}`, 'error');
    } finally {
      setIsImporting(false);
    }
  };

  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Direct print action: triggers browser native print dialog or Save as PDF
  const handleTriggerPrint = () => {
    printGasKardexDocument({
      customer: currentCustomer,
      entries: customerEntries,
      currentUser,
      stats,
      cylinderType: selectedCylinderType
    });
    setNotification({
      message: `سند رسمی کاردکس گاز (${selectedCylinderType}) به چاپگر ارسال گردید.`,
      type: 'success'
    });
    setTimeout(() => setNotification(null), 3500);
  };

  // Direct vector PDF export action
  const handleExportKardexPdf = async () => {
    setIsExportingPdf(true);
    try {
      const custName = currentCustomer?.name ? currentCustomer.name.replace(/\s+/g, '_') : 'customer';
      const ok = await exportElementToPdf('printable-gas-kardex', {
        filename: `kardex_gas_${custName}.pdf`,
        orientation: 'landscape',
        format: 'a4',
        marginMm: 4
      });
      if (ok) {
        setNotification({
          message: 'فایل PDF کاردکس با موفقیت دانلود شد.',
          type: 'success'
        });
        setTimeout(() => setNotification(null), 3500);
      }
    } catch (err) {
      console.error('Kardex PDF export error:', err);
      setNotification({
        message: 'خطا در تولید مستقیم PDF؛ می‌توانید از چاپگر (گزینه Save as PDF) استفاده کنید.',
        type: 'error'
      });
      setTimeout(() => setNotification(null), 4500);
    } finally {
      setIsExportingPdf(false);
    }
  };

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

  // Strictly block Hajivand from viewing or interacting with Gas Kardex
  if (isHajivand) {
    return (
      <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl space-y-4 max-w-lg mx-auto my-12" dir="rtl">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-950/60 border border-rose-800/80 flex items-center justify-center text-rose-400">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h2 className="text-base font-bold text-white">عدم دسترسی به کاردکس تعمیر سیلندر</h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          کاربر محترم مهندس حاجی‌وند، طبق معماری سامانه و فرآیندهای انبارداری، بخش کاردکس گاز منحصراً در اختیار مدیریت و مدیر داخلی (خانم کرمی) می‌باشد و برای انباردار مخفی و غیرقابل دسترسی است. وظیفه شما شمارش فیزیکی اقلام در بخش «ورودی شیر و سیلندر» می‌باشد.
        </p>
        {onNavigateToInspections && (
          <button
            type="button"
            onClick={onNavigateToInspections}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors shadow-md shadow-indigo-900/40"
          >
            انتقال به منوی ورودی شیر و سیلندر
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">

      {/* Notification Toast */}
      {notification && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between border shadow-lg transition-all animate-fade-in ${
            notification.type === 'error'
              ? 'bg-rose-950/80 border-rose-800/80 text-rose-200'
              : notification.type === 'info'
              ? 'bg-indigo-950/80 border-indigo-800/80 text-indigo-200'
              : 'bg-emerald-950/80 border-emerald-800/80 text-emerald-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {notification.type === 'error' ? (
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            )}
            <span className="text-sm font-medium">{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="p-1 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Synchronized Customer Selector & Active Details Banner (Dark Theme) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Compact Instant Search with Auto-Suggestions (triggers on 4 letters or typing) */}
          <div className="relative w-full sm:w-64 md:w-72" ref={customerSearchContainerRef}>
            <Search className="w-3.5 h-3.5 text-amber-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="جستجوی مشتری یا شرکت (۴+ حرف)..."
              value={customerSearchQuery}
              onChange={e => {
                setCustomerSearchQuery(e.target.value);
                setShowCustomerSuggestions(true);
              }}
              onFocus={() => {
                if (customerSearchQuery.trim().length > 0) {
                  setShowCustomerSuggestions(true);
                }
              }}
              className="w-full text-xs bg-slate-950 border border-slate-700/80 rounded-xl pr-8 pl-7 py-2 text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-all font-sans"
            />
            {customerSearchQuery && (
              <button
                type="button"
                onClick={() => {
                  setCustomerSearchQuery('');
                  setShowCustomerSuggestions(false);
                }}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5 cursor-pointer"
                title="پاک کردن جستجو"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Instant Suggestion Dropdown */}
            {showCustomerSuggestions && customerSearchQuery.trim().length > 0 && (
              <div className="absolute right-0 top-full mt-1.5 w-72 sm:w-80 max-h-72 overflow-y-auto bg-slate-950/95 backdrop-blur-md border border-slate-700 rounded-xl shadow-2xl z-50 divide-y divide-slate-800/80">
                {filteredCustomers.length === 0 ? (
                  <div className="p-3 text-xs text-slate-400 text-center">
                    مشتری یا شرکتی با عبارت «{customerSearchQuery}» یافت نشد.
                  </div>
                ) : (
                  filteredCustomers.map(c => {
                    const isSelected = c.customer_id === selectedCustomerId;
                    return (
                      <button
                        key={c.customer_id}
                        type="button"
                        onClick={() => {
                          handleSelectCustomer(c.customer_id);
                          setCustomerSearchQuery('');
                          setShowCustomerSuggestions(false);
                        }}
                        className={`w-full text-right p-2.5 hover:bg-slate-800/80 transition-colors flex items-center justify-between gap-2 cursor-pointer ${
                          isSelected ? 'bg-amber-950/50 text-amber-300' : 'text-slate-200'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-xs flex items-center gap-1.5 truncate">
                            <span className="text-white">{c.name}</span>
                            {c.company_name && (
                              <span className="text-slate-400 font-normal text-[11px] truncate">
                                ({c.company_name})
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-amber-400/90">{c.customer_id}</span>
                            {c.province && <span>استان: {c.province}</span>}
                          </div>
                        </div>
                        {isSelected && (
                          <Check className="w-4 h-4 text-amber-400 shrink-0" />
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Active Customer Indicator Badge */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 shadow-xs text-xs">
              <Building2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="font-bold text-white">
                {currentCustomer?.name || 'انتخاب نشده'}
              </span>
              {currentCustomer?.company_name && (
                <span className="text-slate-400 text-[11px] font-medium border-r border-slate-800 pr-2 mr-1 truncate max-w-[160px]">
                  {currentCustomer.company_name}
                </span>
              )}
              <span className="font-mono text-[10px] text-amber-400/90 px-1.5 py-0.2 rounded bg-amber-950/60 border border-amber-800/40 mr-1">
                {currentCustomer?.customer_id}
              </span>
            </div>
          </div>
        </div>

        {/* Dropdown Menu of All Customers (جایگزین دکمه‌ها طبق درخواست کاربر) */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-3 border-t border-slate-800/80">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 shrink-0">
            <Users className="w-4 h-4" />
            <span>انتخاب از فهرست تمام مشتری‌ها:</span>
          </div>

          <div className="flex-1 relative">
            <select
              id="all-customers-dropdown-menu"
              value={selectedCustomerId}
              onChange={e => handleSelectCustomer(e.target.value)}
              className="w-full text-xs sm:text-sm font-semibold bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all cursor-pointer shadow-xs"
            >
              {allSortedCustomers.map(c => (
                <option
                  key={c.customer_id}
                  value={c.customer_id}
                  className="bg-slate-900 text-slate-100 py-1.5"
                >
                  {c.name} {c.company_name ? `(${c.company_name})` : ''} {c.province ? `- استان ${c.province}` : ''} [{c.customer_id}]
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-slate-400 font-mono">
              تعداد: <strong className="text-amber-400 font-bold">{toPersianDigits(customers.length)}</strong> طرف حساب
            </span>
          </div>
        </div>

        {/* Active Customer Mini Profile Banner */}
        {currentCustomer && (
          <div className="bg-[#fbf7ee] border border-amber-300/90 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-900 shadow-sm">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-amber-950 text-sm">{currentCustomer.name}</span>
              <span className="text-amber-900/80 font-mono font-bold">({currentCustomer.customer_id})</span>
              {currentCustomer.company_name && (
                <span className="text-slate-700 font-medium border-r border-amber-300/90 pr-2 mr-1">
                  {currentCustomer.company_name}
                </span>
              )}
              {/* Minimal Edit Button for Current Customer */}
              <button
                type="button"
                id="edit-current-customer-btn"
                onClick={handleOpenEditCustomer}
                className="mr-2 px-2.5 py-1 text-[11px] font-bold text-amber-950 hover:text-amber-900 bg-white hover:bg-amber-100/80 border border-amber-300 rounded-lg flex items-center gap-1 transition-all cursor-pointer shadow-2xs group"
                title={`ویرایش اطلاعات و مشخصات «${currentCustomer.name}»`}
              >
                <Edit3 className="w-3 h-3 text-amber-800 group-hover:text-amber-900 transition-colors" />
                <span>ویرایش مشتری</span>
              </button>

              {/* Quick Jump to Production Kardex */}
              {onNavigateToProductionKardex && (
                <button
                  type="button"
                  id="go-to-production-kardex-btn"
                  onClick={onNavigateToProductionKardex}
                  className="mr-1.5 px-2.5 py-1 text-[11px] font-bold text-indigo-950 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 border border-indigo-300 rounded-lg flex items-center gap-1 transition-all cursor-pointer shadow-2xs group"
                  title="ورود به سامانه کاردکس تولید ام‌گاز (۱۰ رده محصول)"
                >
                  <Boxes className="w-3 h-3 text-indigo-600 group-hover:text-indigo-700 transition-colors" />
                  <span>کاردکس تولید ام گاز</span>
                </button>
              )}

              {/* Cylinder Type Dropdown (دقیقا در منوی کاردکس گاز و شیر در کنار دکمه ویرایش مشتری) */}
              <div className="relative mr-1.5" ref={customerHeaderCylinderDropdownRef}>
                <button
                  type="button"
                  id="customer-header-cylinder-dropdown-btn"
                  onClick={() => setShowCustomerHeaderCylinderDropdown(prev => !prev)}
                  className="px-2.5 py-1 text-[11px] font-bold text-amber-950 hover:text-amber-900 bg-white hover:bg-amber-100/80 border border-amber-300 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs group"
                  title="تفکیک و انتخاب کاردکس بر اساس نوع محصول و سیلندر (سیلندر ۱۱، ۲۵، ۵۰ کیلویی، لیفتراکی ۲۲ کیلویی)"
                >
                  <Flame className="w-3.5 h-3.5 text-amber-600 group-hover:text-amber-700 transition-colors shrink-0" />
                  <span className="font-extrabold">{selectedCylinderType}</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-amber-100 text-amber-900 font-bold border border-amber-200">
                    {toPersianDigits(customerEntries.length)}
                  </span>
                  <ChevronDown className={`w-3 h-3 text-amber-800 transition-transform duration-200 ${showCustomerHeaderCylinderDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showCustomerHeaderCylinderDropdown && (
                  <div className="absolute top-full right-0 mt-1.5 w-64 sm:w-72 bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-600/40 rounded-xl shadow-2xl p-1.5 z-50 text-slate-900 dark:text-slate-100 space-y-1">
                    <div className="px-2.5 py-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <span>تفکیک محصول و نوع سیلندر</span>
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">کاردکس مستقل</span>
                    </div>
                    {CYLINDER_TYPES.map((type) => {
                      const isSelected = selectedCylinderType === type;
                      const count = cylinderTypeCounts[type] || 0;
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => {
                            setSelectedCylinderType(type);
                            setShowCustomerHeaderCylinderDropdown(false);
                            showToast(`کاردکس گاز تغییر یافت به: ${type}`);
                          }}
                          className={`w-full px-3 py-2 rounded-lg text-right text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-500/50 font-bold'
                              : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Flame className={`w-4 h-4 ${isSelected ? 'text-amber-500' : 'text-slate-400'}`} />
                            <span>{type}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                              isSelected
                                ? 'bg-amber-500/30 text-amber-950 dark:text-amber-200'
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}>
                              {toPersianDigits(count)} سطر
                            </span>
                            {isSelected && <Check className="w-4 h-4 text-amber-500" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-700 font-medium">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-800" />
                استان: <strong className="text-slate-950 font-bold">{currentCustomer.province}</strong>
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-amber-800" />
                تماس: <span className="font-mono text-slate-950 font-bold">{currentCustomer.phone}</span>
              </span>
              <span>
                تعداد اسناد کاردکس: <strong className="text-amber-950 font-mono font-extrabold">{formatPersianNumber(customerEntries.length)}</strong>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Main Header & Top Toolbar (Dark Slate Theme) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1
                className="text-lg md:text-xl font-bold text-slate-100 flex items-center gap-2 cursor-help"
                title="مدیریت و تراز لحظه‌ای گردش کپسول گاز، شیر نو، شیر کهنه و ضایعات طرف‌های حساب"
              >
                <span>کاردکس تخصصی سیلندر و شیرآلات گاز</span>
                <Info className="w-4 h-4 text-slate-400" />
              </h1>
            </div>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* Add Incoming Entry Button */}
          <button
            onClick={() => openAddEntryModal('in')}
            className={`px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs font-black rounded-lg sm:rounded-xl flex items-center gap-1.5 transition-colors shadow-xs whitespace-nowrap cursor-pointer ${
              (currentUser?.username === 'hajivand' || currentUser?.username === 'gholizadeh' || currentUser?.role === 'WAREHOUSE_KEEPER')
                ? 'bg-slate-200 text-slate-400 border border-slate-300 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700 opacity-60 cursor-not-allowed'
                : 'text-white bg-emerald-600 hover:bg-emerald-500 border border-emerald-700 dark:text-emerald-950 dark:bg-emerald-400 dark:hover:bg-emerald-300 dark:border-transparent'
            }`}
            title={
              (currentUser?.username === 'hajivand' || currentUser?.username === 'gholizadeh' || currentUser?.role === 'WAREHOUSE_KEEPER')
                ? 'ثبت کاردکس در حیطه اختیارات مهندس حاجی‌وند نیست (ورودی را در منوی «ورودی شیر و سیلندر» ثبت فرمایید)'
                : 'ثبت سند ورود کپسول، شیرآلات و قطعات (کد i)'
            }
          >
            {(currentUser?.username === 'hajivand' || currentUser?.username === 'gholizadeh' || currentUser?.role === 'WAREHOUSE_KEEPER') ? (
              <Lock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            ) : (
              <ArrowDownLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white dark:text-emerald-950 shrink-0" />
            )}
            <span>ورودی (i)</span>
          </button>

          {/* Add Outgoing Entry Button */}
          <button
            onClick={() => openAddEntryModal('out')}
            className={`px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs font-black rounded-lg sm:rounded-xl flex items-center gap-1.5 transition-colors shadow-xs whitespace-nowrap cursor-pointer ${
              (currentUser?.username === 'hajivand' || currentUser?.username === 'gholizadeh' || currentUser?.role === 'WAREHOUSE_KEEPER')
                ? 'bg-slate-200 text-slate-400 border border-slate-300 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700 opacity-60 cursor-not-allowed'
                : 'text-white bg-amber-600 hover:bg-amber-500 border border-amber-700 dark:text-amber-950 dark:bg-amber-400 dark:hover:bg-amber-300 dark:border-transparent'
            }`}
            title={
              (currentUser?.username === 'hajivand' || currentUser?.username === 'gholizadeh' || currentUser?.role === 'WAREHOUSE_KEEPER')
                ? 'ثبت کاردکس در حیطه اختیارات مهندس حاجی‌وند نیست'
                : 'ثبت سند خروج و ارسال کپسول، بارنامه و قطعات (کد e)'
            }
          >
            {(currentUser?.username === 'hajivand' || currentUser?.username === 'gholizadeh' || currentUser?.role === 'WAREHOUSE_KEEPER') ? (
              <Lock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            ) : (
              <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white dark:text-amber-950 shrink-0" />
            )}
            <span>خروجی (e)</span>
          </button>

          {/* Print Kardex Button (Selected Toolbar Action) */}
          <button
            onClick={() => setShowPrintModal(true)}
            className="px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 dark:text-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700 rounded-lg sm:rounded-xl flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer shadow-xs active:scale-98"
            title="پیش‌نمایش، چاپ رسمی و دریافت فایل PDF کاردکس گاز"
          >
            <Printer className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>چاپ / PDF</span>
          </button>

          {/* Dedicated Goods Entry Form Button (مشاهده برگ ورود کالا) */}
          <button
            onClick={() => {
              // Open with first entry or incoming entry if available
              const incoming = customerEntries.find(e => !isOutgoingEntry(e)) || customerEntries[0] || null;
              setSelectedReceiptEntry(incoming);
              setShowReceiptModal(true);
            }}
            className="px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 border border-amber-700 dark:text-amber-950 dark:bg-amber-400 dark:hover:bg-amber-300 dark:border-amber-300 rounded-lg sm:rounded-xl flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer whitespace-nowrap"
            title="مشاهده و چاپ فرم فیزیکی برگ ورود کالا (M.Gas cylinder)"
          >
            <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white dark:text-amber-900 shrink-0" />
            <span>برگ ورود</span>
          </button>

          {/* Dedicated Goods Exit Form Button (مشاهده برگه خروج کالا) */}
          <button
            onClick={() => {
              // Open with first outgoing entry if available
              const outgoing = customerEntries.find(e => isOutgoingEntry(e)) || customerEntries[0] || null;
              setSelectedExitReceiptEntry(outgoing);
              setShowExitReceiptModal(true);
            }}
            className="px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 border border-sky-700 dark:text-sky-950 dark:bg-sky-400 dark:hover:bg-sky-300 dark:border-sky-300 rounded-lg sm:rounded-xl flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer whitespace-nowrap"
            title="مشاهده و چاپ فرم فیزیکی برگه خروج کالا و تعهدنامه راننده (M.Gas cylinder)"
          >
            <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white dark:text-sky-900 shrink-0" />
            <span>برگ خروج</span>
          </button>

          {/* Export Excel (.xlsx RTL) */}
          <button
            onClick={handleExportExcel}
            className="px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 dark:text-emerald-300 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/70 dark:border-emerald-800/70 rounded-lg sm:rounded-xl flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer shadow-xs"
            title={`خروجی اکسل کاردکس ${selectedCylinderType} با فرمت کامپوننت راست‌به‌چپ`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>اکسل</span>
          </button>

          {/* Import from Excel */}
          <button
            onClick={() => setShowImportModal(true)}
            title="ورود داده‌ها از فایل اکسل"
            className="px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 dark:text-slate-300 dark:bg-slate-800/80 dark:hover:bg-slate-700 dark:border-slate-700 rounded-lg sm:rounded-xl flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer shadow-xs"
          >
            <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600 dark:text-slate-400 shrink-0" />
            <span>ورود اکسل</span>
          </button>

          {/* Recycle Bin / Trash Section Button */}
          <button
            onClick={() => setShowTrashModal(true)}
            title="سطل آشغال و مرکز ریکاوری اسناد حذف‌شده کاردکس"
            className={`px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-bold border rounded-lg sm:rounded-xl flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer shadow-xs ${
              trashedEntries.length > 0
                ? 'text-white bg-rose-600 hover:bg-rose-500 border-rose-700 dark:text-rose-200 dark:bg-rose-950/70 dark:border-rose-800/80 shadow-xs'
                : 'text-slate-700 bg-slate-100 hover:bg-slate-200 border-slate-300 dark:text-slate-400 dark:bg-slate-800/80 dark:border-slate-700'
            }`}
          >
            <Trash2 className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${trashedEntries.length > 0 ? 'text-white dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'}`} />
            <span>سطل آشغال</span>
            {trashedEntries.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-white text-rose-700 dark:bg-rose-500 dark:text-white font-mono shadow-xs">
                {toPersianDigits(trashedEntries.length)}
              </span>
            )}
          </button>

          {/* Blank Template Download */}
          <button
            onClick={handleDownloadBlank}
            className="px-2 sm:px-2.5 py-1.5 sm:py-2 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 dark:text-slate-400 dark:hover:text-slate-200 dark:bg-slate-800/40 dark:hover:bg-slate-800 dark:border-slate-800 rounded-lg sm:rounded-xl transition-colors cursor-pointer shadow-xs"
            title="دانلود فایل نمونه خام اکسل (kardex_gas_blank.xlsx)"
          >
            <FileDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          </button>
        </div>
      </div>

      {/* Kardex Notices (Vertical Stack) */}
      {(currentUser?.role === 'INTERNAL_MANAGER' || (currentUser?.username === 'hajivand' || currentUser?.username === 'gholizadeh' || currentUser?.role === 'WAREHOUSE_KEEPER')) && (
        <div className="flex flex-col gap-3.5 w-full">
          {/* Internal Manager 1-Hour Edit Policy Banner (Vertical Alert Item) */}
        {currentUser?.role === 'INTERNAL_MANAGER' && (
          <div className="w-full bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/60 border border-amber-800/60 rounded-xl px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-200">
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong className="text-amber-300">سیاست امنیتی مدیر داخلی (خانم کرمی): </strong>
                امکان ویرایش تمامی اسناد ثبت‌شده حداکثر تا ۱ ساعت در نشست کاری مجاز می‌باشد.
              </span>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-center">
              <span className={`px-2.5 py-1 rounded-lg border text-[11px] font-mono font-bold font-mono-en shadow-xs ${
                karamiSessionState.isExpired
                  ? 'bg-rose-950/90 border-rose-700/80 text-rose-300 animate-pulse'
                  : karamiSessionState.remainingMinutes <= 15
                  ? 'bg-amber-950/90 border-amber-600/80 text-amber-300'
                  : 'bg-emerald-950/90 border-emerald-700/80 text-emerald-300'
              }`} dir="ltr">
                {karamiSessionState.isExpired
                  ? 'مهلت منقضی شده'
                  : `زمان باقیمانده: ${String(karamiSessionState.remainingMinutes).padStart(2, '0')}:${String(karamiSessionState.remainingSeconds).padStart(2, '0')}`}
              </span>
              <button
                type="button"
                onClick={handleRenewKaramiSession}
                className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg font-extrabold text-[11px] flex items-center gap-1.5 transition-all shadow-xs cursor-pointer hover:scale-105 active:scale-95 whitespace-nowrap"
                title="تمدید سقف ۱ ساعته ویرایش به ۶۰ دقیقه کامل"
              >
                <RotateCcw className="w-3 h-3 text-slate-950" />
                <span>تمدید ۱ ساعته</span>
              </button>
            </div>
          </div>
        )}

        {/* Warehouse Keeper Hajivand Notice (Vertical Alert Item) */}
        {(currentUser?.username === 'hajivand' || currentUser?.username === 'gholizadeh' || currentUser?.role === 'WAREHOUSE_KEEPER') && (
          <div className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-300">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0" />
              <div>
                <strong className="text-indigo-300">حالت مشاهده اختصاصی مهندس حاجی‌وند: </strong>
                <span>
                  ثبت مستقیم سطر کاردکس در حیطه مسئولیت مدیر داخلی (خانم کرمی) می‌باشد. لطفاً جهت ثبت بارهای ورودی به منوی «ورودی شیر و سیلندر» مراجعه فرمایید تا پس از شمارش و تایید شما، کاردکس متناظر ثبت گردد.
                </span>
              </div>
            </div>
            {onNavigateToInspections && (
              <button
                onClick={onNavigateToInspections}
                className="px-3 py-1.5 text-xs font-bold text-slate-950 bg-indigo-400 hover:bg-indigo-300 rounded-lg shrink-0 transition-colors cursor-pointer self-end sm:self-center"
              >
                رفتن به منوی ورودی شیر و سیلندر
              </button>
            )}
          </div>
        )}
      </div>
    )}

      {/* Ledger KPI Metrics (Dark Slate Theme with High-Contrast Badges) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs px-1">
          <span className="text-slate-400 font-semibold flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-amber-400" />
            <span>خلاصه تراز و مانده اقلام:</span>
          </span>
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 p-0.5 rounded-lg">
            <button
              type="button"
              onClick={() => setKpiViewMode('cards')}
              className={`px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                kpiViewMode === 'cards'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="نمایش کارتی شاخص‌ها"
            >
              <LayoutGrid className="w-3 h-3" />
              <span>کارتی</span>
            </button>
            <button
              type="button"
              onClick={() => setKpiViewMode('list')}
              className={`px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                kpiViewMode === 'list'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="نمایش لیستی شاخص‌ها"
            >
              <List className="w-3 h-3" />
              <span>لیستی</span>
            </button>
          </div>
        </div>

        {kpiViewMode === 'list' ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs min-w-[700px]">
                <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 text-[11px]">
                  <tr>
                    <th className="p-3">عنوان شاخص</th>
                    <th className="p-3 text-center">مانده فعلی (تراز)</th>
                    <th className="p-3 text-center">واحد</th>
                    <th className="p-3 text-center">مجموع ورود</th>
                    <th className="p-3 text-center">مجموع خروج</th>
                    <th className="p-3">توضیحات و وضعیت</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  <tr className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                          <Layers className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-bold text-slate-100">مانده فعلی سیلندر گاز</span>
                      </div>
                    </td>
                    <td className="p-3 text-center font-bold font-mono text-base text-emerald-300 tabular-nums font-mono-en" dir="ltr">
                      {formatNumberEn(stats.currentCylinders)}
                    </td>
                    <td className="p-3 text-center text-slate-400">کپسول</td>
                    <td className="p-3 text-center font-mono text-emerald-400">
                      {formatPersianNumber(stats.totalCylinderIn)}
                    </td>
                    <td className="p-3 text-center font-mono text-amber-400">
                      {formatPersianNumber(stats.totalCylinderOut)}
                    </td>
                    <td className="p-3 text-[11px] text-slate-400">
                      گردش فیزیکی کپسول‌های گاز مایع طرف حساب
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                          <Flame className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-bold text-slate-100">مانده شیر نو</span>
                      </div>
                    </td>
                    <td className={`p-3 text-center font-bold font-mono text-base tabular-nums font-mono-en ${stats.currentNewValves < 0 ? 'text-rose-400 font-black' : 'text-emerald-300'}`} dir="ltr">
                      {stats.currentNewValves < 0 ? `⚠️ ${formatNumberEn(stats.currentNewValves)}` : formatNumberEn(stats.currentNewValves)}
                    </td>
                    <td className="p-3 text-center text-slate-400">
                      {stats.currentNewValves < 0 ? (
                        <span className="text-rose-300 font-bold bg-rose-950/80 px-1.5 py-0.5 rounded border border-rose-800 text-[10px]">
                          کسر از ام‌گاز
                        </span>
                      ) : (
                        'عدد شیر نو'
                      )}
                    </td>
                    <td className="p-3 text-center font-mono text-emerald-400">
                      {formatPersianNumber(stats.totalNewValveIn)}
                    </td>
                    <td className="p-3 text-center font-mono text-amber-400">
                      {formatPersianNumber(stats.totalNewValveOut)}
                    </td>
                    <td className="p-3 text-[11px] text-slate-400">
                      {stats.currentNewValves < 0 ? (
                        <span className="text-rose-300 font-bold">
                          ⚠️ تراز منفی! این مقدار از موجودی خود شرکت ام‌گاز کسر خواهد شد.
                        </span>
                      ) : (
                        'شیرآلات استاندارد و نو نصب‌شده'
                      )}
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
                          stats.currentUsedValves < 0
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          <Wrench className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-bold text-slate-100">مانده شیر کهنه (برگشتی)</span>
                      </div>
                    </td>
                    <td className={`p-3 text-center font-bold font-mono text-base tabular-nums font-mono-en ${stats.currentUsedValves < 0 ? 'text-rose-400 font-black' : 'text-amber-300'}`} dir="ltr">
                      {stats.currentUsedValves < 0 ? `⚠️ ${formatNumberEn(stats.currentUsedValves)}` : formatNumberEn(stats.currentUsedValves)}
                    </td>
                    <td className="p-3 text-center text-slate-400">
                      {stats.currentUsedValves < 0 ? (
                        <span className="text-rose-300 font-bold bg-rose-950/80 px-1.5 py-0.5 rounded border border-rose-800 text-[10px]">
                          کسر از ام‌گاز
                        </span>
                      ) : (
                        'عدد شیر کهنه'
                      )}
                    </td>
                    <td className="p-3 text-center font-mono text-emerald-400">
                      {formatPersianNumber(stats.totalUsedValveIn)}
                    </td>
                    <td className="p-3 text-center font-mono text-amber-400">
                      {formatPersianNumber(stats.totalUsedValveOut)}
                    </td>
                    <td className="p-3 text-[11px] text-slate-400">
                      شیرآلات تعویضی و مستهلک ارسالی
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
                          <Trash2 className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-100 block">مانده ذخیره ضایعات (سالانه)</span>
                          <span className="text-[10px] text-amber-400">ذخیره موقت ماهانه انبار: {formatPersianNumber(stats.netTempScrap)} عدد</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-center font-bold font-mono text-base text-amber-300 tabular-nums font-mono-en" dir="ltr">
                      {formatNumberEn(stats.currentScrap)}
                    </td>
                    <td className="p-3 text-center text-slate-400">عدد (سالانه)</td>
                    <td className="p-3 text-center font-mono text-amber-400">
                      ذخیره موقت: {formatPersianNumber(stats.totalScrapStockIn)}
                    </td>
                    <td className="p-3 text-center font-mono text-rose-400">
                      خروج ضایعات: {formatPersianNumber(stats.totalScrapOut)}
                    </td>
                    <td className="p-3 text-[11px] text-slate-400 leading-relaxed">
                      ذخیره انبار ضایعات مقدار موقت ماهانه است که خروج ضایعات از آن کم می‌کند و تغییرات آن مستقیماً روی مانده سالانه اثر دارد.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2.5 sm:gap-3">
            {/* Metric 1: Current Cylinder Balance */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 sm:p-3 shadow-xs relative overflow-hidden transition-all hover:border-slate-700">
              <div className="flex items-center justify-between gap-1.5">
                <span className="text-[11px] sm:text-xs font-bold text-slate-300 truncate">مانده سیلندر گاز</span>
                <div className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <Layers className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-1.5 flex items-baseline gap-1.5">
                <span className="text-lg sm:text-xl font-black font-mono text-emerald-300 tabular-nums font-mono-en" dir="ltr">
                  {formatNumberEn(stats.currentCylinders)}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">کپسول سالم</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 truncate">
                ورود: <span className="font-mono text-emerald-400 font-bold">{formatPersianNumber(stats.totalCylinderIn)}</span> | خروج: <span className="font-mono text-amber-400 font-bold">{formatPersianNumber(stats.totalCylinderOut)}</span>
              </p>
            </div>

            {/* Metric 2: New Valves Balance */}
            <div className={`border rounded-xl p-2.5 sm:p-3 shadow-xs relative overflow-hidden transition-all ${
              stats.currentNewValves < 0
                ? 'bg-rose-950/30 border-rose-500/80 hover:border-rose-400'
                : 'bg-slate-900 border-slate-800 hover:border-slate-700'
            }`}>
              <div className="flex items-center justify-between gap-1.5">
                <span className="text-[11px] sm:text-xs font-bold text-slate-300 truncate">مانده شیر نو</span>
                <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 border ${
                  stats.currentNewValves < 0
                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                }`}>
                  <Flame className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-1.5 flex items-baseline gap-1.5">
                <span className={`text-lg sm:text-xl font-black font-mono tabular-nums font-mono-en ${
                  stats.currentNewValves < 0 ? 'text-rose-400' : 'text-emerald-300'
                }`} dir="ltr">
                  {stats.currentNewValves < 0 ? `⚠️ ${formatNumberEn(stats.currentNewValves)}` : formatNumberEn(stats.currentNewValves)}
                </span>
                <span className={`text-[10px] font-medium ${stats.currentNewValves < 0 ? 'text-rose-300 font-bold' : 'text-slate-400'}`}>
                  {stats.currentNewValves < 0 ? 'کسر از ام‌گاز' : 'عدد شیر نو'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 truncate">
                ورود: <span className="font-mono text-emerald-400 font-bold">{formatPersianNumber(stats.totalNewValveIn)}</span> | خروج: <span className="font-mono text-amber-400 font-bold">{formatPersianNumber(stats.totalNewValveOut)}</span>
              </p>
            </div>

            {/* Metric 3: Used Valves Balance */}
            <div className={`border rounded-xl p-2.5 sm:p-3 shadow-xs relative overflow-hidden transition-all ${
              stats.currentUsedValves < 0
                ? 'bg-rose-950/30 border-rose-500/80 hover:border-rose-400'
                : 'bg-slate-900 border-slate-800 hover:border-slate-700'
            }`}>
              <div className="flex items-center justify-between gap-1.5">
                <span className="text-[11px] sm:text-xs font-bold text-slate-300 truncate">مانده شیر کهنه</span>
                <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 border ${
                  stats.currentUsedValves < 0
                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }`}>
                  <Wrench className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-1.5 flex items-baseline gap-1.5">
                <span className={`text-lg sm:text-xl font-black font-mono tabular-nums font-mono-en ${
                  stats.currentUsedValves < 0 ? 'text-rose-400' : 'text-amber-300'
                }`} dir="ltr">
                  {stats.currentUsedValves < 0 ? `⚠️ ${formatNumberEn(stats.currentUsedValves)}` : formatNumberEn(stats.currentUsedValves)}
                </span>
                <span className={`text-[10px] font-medium ${stats.currentUsedValves < 0 ? 'text-rose-300 font-bold' : 'text-slate-400'}`}>
                  {stats.currentUsedValves < 0 ? 'کسر از ام‌گاز' : 'عدد مستعمل'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 truncate">
                ورود: <span className="font-mono text-emerald-400 font-bold">{formatPersianNumber(stats.totalUsedValveIn)}</span> | خروج: <span className="font-mono text-amber-400 font-bold">{formatPersianNumber(stats.totalUsedValveOut)}</span>
              </p>
            </div>

            {/* Metric 4: Scrap & Temporary Warehouse Reserve */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 sm:p-3 shadow-xs relative overflow-hidden transition-all hover:border-slate-700">
              <div className="flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1 min-w-0">
                  <span className="text-[11px] sm:text-xs font-bold text-amber-300 truncate">مانده ضایعات</span>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-amber-950/80 text-amber-400 border border-amber-800/60 font-semibold shrink-0">سالانه</span>
                </div>
                <div className="w-6 h-6 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
                  <Trash2 className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-1.5 flex items-baseline gap-1.5">
                <span className="text-lg sm:text-xl font-black font-mono text-amber-300 tabular-nums font-mono-en" dir="ltr">
                  {formatNumberEn(stats.currentScrap)}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">عدد</span>
                <span className="text-[10px] text-amber-400 font-mono mr-auto">
                  (موقت: {formatPersianNumber(stats.netTempScrap)})
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 truncate">
                ورود: <span className="font-mono text-amber-400 font-bold">{formatPersianNumber(stats.totalScrapStockIn)}</span> | خروج: <span className="font-mono text-rose-400 font-bold">{formatPersianNumber(stats.totalScrapOut)}</span>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* The 16-Column Kardex Table (Dark Theme Matching Entire App) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        {/* Table Top Toolbar */}
        <div className="p-4 border-b border-slate-800 flex flex-col gap-3 bg-slate-950/60">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 flex-wrap">
              <FileSpreadsheet className="w-5 h-5 text-amber-400 shrink-0" />
              <h2 className="text-sm font-bold text-slate-200">
                کاردکس جاری: <span className="text-amber-400 font-extrabold">{currentCustomer?.name}</span>
              </h2>
              <span className="text-xs text-slate-500 font-mono">
                ({formatPersianNumber(displayedEntries.length)} ردیف تراکنش)
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Quick Print / PDF Button - Strict Standard A4 Landscape */}
              <button
                type="button"
                onClick={handleTriggerPrint}
                className="px-3 py-1.5 text-xs font-bold text-amber-300 bg-slate-800 hover:bg-slate-700 hover:text-amber-200 border border-amber-500/40 hover:border-amber-400 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                title="چاپ رسمی کاردکس گاز در قطع استاندارد A4 به صورت افقی (Landscape)"
              >
                <Printer className="w-4 h-4 text-amber-400" />
                <span className="font-bold">پرینت کاردکس (A4 افقی)</span>
              </button>

              {/* Secondary Cylinder Selection Dropdown */}
              <div className="relative">
                <select
                  value={selectedCylinderType}
                  onChange={(e) => {
                    const val = e.target.value as CylinderType;
                    setSelectedCylinderType(val);
                    showToast(`کاردکس گاز تغییر یافت به: ${val}`);
                  }}
                  className="px-2.5 py-1.5 text-xs font-bold text-amber-900 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/70 hover:bg-amber-100 dark:hover:bg-amber-900/70 border border-amber-300 dark:border-amber-700/70 rounded-lg transition-colors cursor-pointer"
                  title="تغییر تفکیک کاردکس محصول و سیلندر"
                >
                  {CYLINDER_TYPES.map((type) => (
                    <option key={type} value={type} className="bg-slate-900 text-slate-100">
                      {type} ({toPersianDigits(cylinderTypeCounts[type] || 0)} سطر)
                    </option>
                  ))}
                </select>
              </div>

              {/* Quick Export Excel */}
              <button
                onClick={handleExportExcel}
                className="px-2.5 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-800/80 rounded-lg flex items-center gap-1 transition-colors"
                title={`خروجی اکسل کاردکس ${selectedCylinderType} با فرمت راست‌به‌چپ`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>اکسل (RTL)</span>
              </button>
            </div>
          </div>

          {/* Dedicated Filter Bar with Prominent Sheet Number Filter */}
          <div className="pt-2 border-t border-slate-800/70 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Filter Label */}
              <div className="flex items-center gap-1 text-xs font-semibold text-slate-300">
                <Filter className="w-3.5 h-3.5 text-amber-400" />
                <span>فیلتر کاردکس:</span>
              </div>

              {/* Direction Tabs Filter: All / Incoming (i) / Outgoing (e) */}
              <div className="inline-flex rounded-lg p-0.5 bg-slate-900 border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setSheetDirectionFilter('all')}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    sheetDirectionFilter === 'all'
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  همه اسناد
                </button>
                <button
                  type="button"
                  onClick={() => setSheetDirectionFilter('in')}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1 transition-colors ${
                    sheetDirectionFilter === 'in'
                      ? 'bg-emerald-500 text-emerald-950 font-bold'
                      : 'text-emerald-400 hover:text-emerald-300'
                  }`}
                  title="فقط اسناد و بارنامه‌های ورودی (i)"
                >
                  <ArrowDownLeft className="w-3 h-3" />
                  <span>ورودی (i)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSheetDirectionFilter('out')}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1 transition-colors ${
                    sheetDirectionFilter === 'out'
                      ? 'bg-amber-500 text-amber-950 font-bold'
                      : 'text-amber-400 hover:text-amber-300'
                  }`}
                  title="فقط اسناد و بارنامه‌های خروجی (e)"
                >
                  <ArrowUpRight className="w-3 h-3" />
                  <span>خروجی (e)</span>
                </button>
              </div>

              {/* Dedicated Sheet Number Search Input */}
              <div className="relative">
                <Hash className="w-3.5 h-3.5 text-amber-400 absolute right-2.5 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  dir="ltr"
                  placeholder="فیلتر شماره برگه (مثلاً Ab2306405e)..."
                  value={sheetNumberFilter}
                  onChange={e => setSheetNumberFilter(e.target.value)}
                  className="text-xs font-mono bg-slate-900 border border-slate-700 rounded-lg pr-8 pl-6 py-1.5 text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-amber-500 w-56 sm:w-64"
                />
                {sheetNumberFilter && (
                  <button
                    onClick={() => setSheetNumberFilter('')}
                    className="absolute left-2 top-2 text-slate-400 hover:text-slate-200"
                    title="پاک کردن فیلتر شماره برگه"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* General Description/Date Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  placeholder="جستجوی شرح یا تاریخ..."
                  value={tableFilterQuery}
                  onChange={e => setTableFilterQuery(e.target.value)}
                  className="text-xs bg-slate-900 border border-slate-700 rounded-lg pr-8 pl-6 py-1.5 text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-amber-500 w-44 sm:w-52"
                />
                {tableFilterQuery && (
                  <button
                    onClick={() => setTableFilterQuery('')}
                    className="absolute left-2 top-2 text-slate-400 hover:text-slate-200"
                    title="پاک کردن جستجو"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Clear all active filters if any */}
            {(sheetNumberFilter || tableFilterQuery || sheetDirectionFilter !== 'all') && (
              <button
                onClick={() => {
                  setSheetNumberFilter('');
                  setTableFilterQuery('');
                  setSheetDirectionFilter('all');
                }}
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 py-1 px-2 rounded-md hover:bg-slate-800 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                <span>حذف همه فیلترها</span>
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs border-collapse kardex-table">
            <thead>
              {/* Grouped Header */}
              <tr className="bg-slate-950 text-slate-300 font-semibold border-b border-slate-800 divide-x divide-slate-800/80">
                <th colSpan={2} className="px-0.5 py-1 text-center bg-slate-900/90 text-slate-300 text-[9.5px] leading-tight w-[50px] max-w-[54px]" title="مشخصات سند">
                  مشخصات سند
                </th>
                <th colSpan={7} className="kardex-th-wrap px-1 py-1 text-center bg-blue-950/40 text-blue-300 text-[11px] leading-tight whitespace-normal break-all [overflow-wrap:anywhere]">
                  سیلندر و ضایعات کپسول گاز
                </th>
                <th colSpan={3} className="kardex-th-wrap px-1 py-1 text-center bg-emerald-950/40 text-emerald-300 text-[11px] leading-tight whitespace-normal break-all [overflow-wrap:anywhere]">
                  شیر نو
                </th>
                <th className="kardex-th-wrap px-1 py-1 text-center bg-slate-900/90 text-slate-300 text-[11px] leading-tight whitespace-normal break-all [overflow-wrap:anywhere]">
                  توزیع
                </th>
                <th colSpan={3} className="kardex-th-wrap px-1 py-1 text-center bg-amber-950/40 text-amber-300 text-[11px] leading-tight whitespace-normal break-all [overflow-wrap:anywhere]">
                  شیر کهنه (برگشتی)
                </th>
                <th className="kardex-th-wrap px-1 py-1 text-center bg-rose-950/40 text-rose-300 text-[11px] leading-tight whitespace-normal break-all [overflow-wrap:anywhere]">
                  کنترل کیفی
                </th>
                <th className="sticky left-0 z-20 col-actions-vertical bg-slate-900 text-amber-400 border-r border-slate-700/90 shadow-[4px_0_12px_rgba(0,0,0,0.5)]" title="فرم و چاپ">
                  <span className="vertical-text-20 text-[9px] text-amber-400">فرم/چاپ</span>
                </th>
              </tr>

              {/* Exact 17 Columns with Divided Scrap & Total Cylinder Balance + 1 Column for Form/Print */}
              <tr className="bg-slate-950/90 text-slate-400 font-bold border-b border-slate-800 divide-x divide-slate-800/80 text-center">
                <th className="col-vertical-date text-slate-400 font-bold border-b border-slate-800" title="تاریخ سند">
                  <span className="vertical-text-20">تاریخ</span>
                </th>
                <th className="px-1 py-1 text-slate-400 font-bold border-b border-slate-800 min-w-[70px] max-w-[90px]" title="شرح رویداد / انتقال">
                  <span>شرح</span>
                </th>

                {/* Cylinder & Scrap Columns */}
                <th className="kardex-th-wrap px-0.5 py-1 text-blue-400 bg-blue-950/20" title="ورودی سیلندر">
                  <span>ورودی</span><br /><span>سیلندر</span>
                </th>
                <th className="kardex-th-wrap px-0.5 py-1 text-rose-400 bg-rose-950/20" title="خروجی سیلندر">
                  <span>خروجی</span><br /><span>سیلندر</span>
                </th>
                <th className="kardex-th-wrap px-0.5 py-1 text-rose-300 bg-rose-950/30 font-bold" title="خروجی ضایعات (خروج ضایعات واقعی)">
                  <span>خروج ضایعات</span><br /><span>واقعی</span>
                </th>
                <th className="kardex-th-wrap px-0.5 py-1 text-amber-300 bg-amber-950/30 font-bold" title="ذخیره انبار ضایعات (خروج ضایعات سوری)">
                  <span>خروج ضایعات</span><br /><span>سوری</span>
                </th>
                <th className="kardex-th-wrap px-0.5 py-1 bg-emerald-950/60 text-emerald-300 font-extrabold border-x border-emerald-800/80 shadow-xs" title="مانده سیلندر">
                  <span>مانده</span><br /><span>سیلندر</span>
                </th>
                <th
                  className="kardex-th-wrap px-0.5 py-1 bg-rose-950/40 text-rose-300 font-extrabold border-x border-rose-800/80 shadow-xs"
                  title="خروج ضایعات نهایی (خروج ضایعات ذخیره)"
                >
                  <div className="flex flex-col items-center justify-center gap-0.5">
                    <ArrowUpRight className="w-3 h-3 text-rose-400 shrink-0" />
                    <span>خروج ضایعات</span>
                    <span>ذخیره</span>
                  </div>
                </th>
                <th
                  className="kardex-th-wrap px-0.5 py-1 bg-amber-950/70 text-amber-200 font-extrabold border-x border-amber-800/80 shadow-xs"
                  title="مانده ذخیره ضایعات (مانده ضایعات)"
                >
                  <div className="flex flex-col items-center justify-center gap-0.5">
                    <Layers className="w-3 h-3 text-amber-400 shrink-0" />
                    <span>مانده</span>
                    <span>ضایعات</span>
                  </div>
                </th>

                {/* New Valve Columns */}
                <th className="kardex-th-wrap px-0.5 py-1 text-emerald-400 bg-emerald-950/20" title="ورود شیر نو">
                  <span>ورود</span><br /><span>شیر نو</span>
                </th>
                <th className="kardex-th-wrap px-0.5 py-1 text-rose-400 bg-rose-950/20" title="خروج شیر نو">
                  <span>خروج</span><br /><span>شیر نو</span>
                </th>
                <th className="kardex-th-wrap px-0.5 py-1 bg-emerald-950/60 text-emerald-300 font-extrabold border-x border-emerald-800/80 shadow-xs" title="مانده شیر نو">
                  <span>مانده</span><br /><span>شیر نو</span>
                </th>

                {/* Dispatched */}
                <th
                  className="kardex-th-wrap px-0.5 py-1 bg-blue-950/50 text-blue-300 font-bold border-x border-slate-800 shadow-xs"
                  title="ستون ارسالی (فقط متنی - فاقد عدد)"
                >
                  <div className="flex flex-col items-center justify-center gap-0.5">
                    <Truck className="w-3 h-3 text-blue-400 shrink-0" />
                    <span>ارسالی</span>
                    <span className="text-[8.5px] text-blue-400/80 font-normal">(متن)</span>
                  </div>
                </th>

                {/* Used Valve Columns */}
                <th className="kardex-th-wrap px-0.5 py-1 text-amber-400 bg-amber-950/20" title="ورود شیر کهنه">
                  <span>ورود</span><br /><span>شیر کهنه</span>
                </th>
                <th className="kardex-th-wrap px-0.5 py-1 text-rose-400 bg-rose-950/20" title="خروج شیر کهنه">
                  <span>خروج</span><br /><span>شیر کهنه</span>
                </th>
                <th className="kardex-th-wrap px-0.5 py-1 bg-amber-950/50 text-amber-200 font-extrabold" title="مانده شیر کهنه">
                  <span>مانده</span><br /><span>شیر کهنه</span>
                </th>

                {/* Defective */}
                <th className="kardex-th-wrap px-0.5 py-1 text-rose-400 bg-rose-950/30" title="معیوب">
                  <span>معیوب</span>
                </th>

                {/* Actions / Receipt Form: Vertical with minimal space */}
                <th className="sticky left-0 z-20 col-actions-vertical bg-slate-900 text-amber-400 border-r border-slate-700/90 shadow-[4px_0_12px_rgba(0,0,0,0.5)]" title="عملیات سند">
                  <span className="vertical-text-20 text-[9.5px] font-bold text-amber-400">عملیات سند</span>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {displayedEntries.length === 0 ? (
                <tr>
                  <td colSpan={18} className="py-14 text-center text-slate-500">
                    <Flame className="w-9 h-9 mx-auto mb-2 text-slate-700" />
                    <p className="text-sm text-slate-400 font-medium">
                      تراکنشی برای طرف حساب «{currentCustomer?.name}» یافت نشد.
                    </p>
                    <p className="text-xs text-slate-600 mt-1">
                      می‌توانید با دکمه «ثبت سطر کاردکس» یا «ورود از اکسل» اطلاعات را ثبت فرمایید.
                    </p>
                  </td>
                </tr>
              ) : (
                displayedEntries.map((item, idx) => (
                  <tr
                    key={item.entry_id || `kardex-${idx}`}
                    className={`group transition-all duration-500 divide-x divide-slate-800/60 text-center ${
                      item.entry_id === recentlyAddedEntryId
                        ? 'bg-emerald-950/80 ring-2 ring-emerald-400 shadow-lg'
                        : 'hover:bg-slate-800/50'
                    }`}
                  >
                    {/* 1. Date column: vertical ~22px */}
                    <td className="col-vertical-date font-mono text-slate-300 text-center" title={`تاریخ: ${item.date}`}>
                      <div className="vertical-date-text font-mono text-slate-300" dir="ltr">
                        {item.entry_id === recentlyAddedEntryId && (
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping mb-1" title="ثبت آنی Ajax" />
                        )}
                        <span>{item.date}</span>
                      </div>
                    </td>

                    {/* 2. Description column: summarized & concise */}
                    <td className="px-1 py-1.5 text-center min-w-[70px] max-w-[90px]" title={`${item.description}${item.custom_item_name ? ` (${item.custom_item_name})` : ''} - کاربر: @${item.created_by_username || (SEED_USERS.find(u => u.user_id === item.user_id)?.username) || 'amouei'}`}>
                      <span className="text-[10.5px] font-bold text-slate-200 block truncate leading-tight">
                        {summarizeKardexDescription(item.description)}
                      </span>
                    </td>

                    {/* Cylinder & Scrap */}
                    <td className="px-1 py-1.5 font-black font-mono text-xs sm:text-sm text-blue-400 bg-blue-950/15" title={`ورودی سیلندر: ${formatPersianNumber(item.cylinder_in || 0)}`}>
                      {formatPersianNumber(item.cylinder_in || 0)}
                    </td>
                    <td className="px-1 py-1.5 font-black font-mono text-xs sm:text-sm text-rose-400 bg-rose-950/15" title={`خروجی سیلندر: ${formatPersianNumber(item.cylinder_out || 0)}`}>
                      {formatPersianNumber(item.cylinder_out || 0)}
                    </td>
                    <td
                      className="px-1 py-1.5 font-black font-mono text-xs sm:text-sm text-rose-400 bg-rose-950/15"
                      title={`خروج ضایعات واقعی: ${formatPersianNumber(item.scrap_out || 0)}`}
                    >
                      {formatPersianNumber(item.scrap_out || 0)}
                    </td>
                    <td
                      className="px-1 py-1.5 font-black font-mono text-xs sm:text-sm text-amber-300 bg-amber-950/30"
                      title={`خروج ضایعات سوری: ${formatPersianNumber(item.scrap_stock_in || 0)}`}
                    >
                      {formatPersianNumber(item.scrap_stock_in || 0)}
                    </td>
                    <td
                      className="px-1 py-1.5 font-black font-mono text-sm sm:text-base text-emerald-300 bg-emerald-950/40 border-x border-emerald-900/40"
                      title={`مانده سیلندر: ${formatPersianNumber(item.cylinder_balance || 0)}`}
                    >
                      {formatPersianNumber(item.cylinder_balance || 0)}
                    </td>
                    {/* خروج ضایعات نهایی / خروج ضایعات ذخیره */}
                    <td className="px-1 py-1.5 font-black font-mono text-xs sm:text-sm text-rose-300 bg-rose-950/20" title={`خروج ضایعات ذخیره: ${formatPersianNumber(item.final_scrap_out || 0)}`}>
                      {formatPersianNumber(item.final_scrap_out || 0)}
                    </td>
                    <td
                      className={`px-1 py-1.5 font-black font-mono text-sm sm:text-base border-x border-slate-800 ${
                        item.scrap_balance === 0
                          ? 'text-emerald-400 bg-emerald-950/20'
                          : 'text-amber-300 bg-amber-950/40'
                      }`}
                      title={`مانده ضایعات: ${formatPersianNumber(item.scrap_balance || 0)}`}
                    >
                      {formatPersianNumber(item.scrap_balance || 0)}
                    </td>

                    {/* New Valve */}
                    <td className="px-1 py-1.5 font-black font-mono text-xs sm:text-sm text-emerald-400 bg-emerald-950/15" title={`ورود شیر نو: ${formatPersianNumber(item.new_valve_in || 0)}`}>
                      {formatPersianNumber(item.new_valve_in || 0)}
                    </td>
                    <td className="px-1 py-1.5 font-black font-mono text-xs sm:text-sm text-rose-400 bg-rose-950/15" title={`خروج شیر نو: ${formatPersianNumber(item.new_valve_out || 0)}`}>
                      {formatPersianNumber(item.new_valve_out || 0)}
                    </td>
                    <td
                      className={`px-1 py-1.5 font-black font-mono text-sm sm:text-base border-x transition-colors ${
                        (item.new_valve_balance || 0) < 0
                          ? 'text-rose-200 bg-rose-950/70 border-rose-600/80 shadow-inner'
                          : 'text-emerald-300 bg-emerald-950/40 border-emerald-900/40'
                      }`}
                      title={(item.new_valve_balance || 0) < 0
                        ? `مانده شیر نو: ${formatPersianNumber(item.new_valve_balance || 0)} (هشدار: تراز منفی - کسر از موجودی خود ام‌گاز)`
                        : `مانده شیر نو: ${formatPersianNumber(item.new_valve_balance || 0)}`}
                    >
                      <div className="flex items-center justify-center gap-1" dir="ltr">
                        {(item.new_valve_balance || 0) < 0 && (
                          <span className="text-[10px] text-rose-400" title="کسر از موجودی ام‌گاز">⚠️</span>
                        )}
                        <span className={(item.new_valve_balance || 0) < 0 ? 'text-rose-200 font-black' : ''}>
                          {formatPersianNumber(item.new_valve_balance || 0)}
                        </span>
                      </div>
                    </td>

                    {/* Dispatched - ستون ارسالی فقط متن می‌پذیرد و نباید عدد بپذیرد */}
                    <td
                      className="px-1 py-1.5 font-medium text-xs sm:text-sm text-slate-200 bg-slate-900/70 whitespace-normal text-center"
                      title={item.dispatched && String(item.dispatched).trim() !== '' && String(item.dispatched).trim() !== '0' && String(item.dispatched).trim() !== '۰' ? `ارسالی: ${item.dispatched}` : undefined}
                    >
                      {item.dispatched !== undefined && item.dispatched !== null && String(item.dispatched).trim() !== '' && String(item.dispatched).trim() !== '0' && String(item.dispatched).trim() !== '۰'
                        ? String(item.dispatched)
                        : <span className="text-slate-600 font-mono">-</span>}
                    </td>

                    {/* Used Valve */}
                    <td className="px-1 py-1.5 font-black font-mono text-xs sm:text-sm text-amber-400 bg-amber-950/15" title={`ورود شیر کهنه: ${formatPersianNumber(item.used_valve_in || 0)}`}>
                      {formatPersianNumber(item.used_valve_in || 0)}
                    </td>
                    <td className="px-1 py-1.5 font-black font-mono text-xs sm:text-sm text-rose-400 bg-rose-950/15" title={`خروج شیر کهنه: ${formatPersianNumber(item.used_valve_out || 0)}`}>
                      {formatPersianNumber(item.used_valve_out || 0)}
                    </td>
                    <td
                      className={`px-1 py-1.5 font-black font-mono text-sm sm:text-base transition-colors ${
                        (item.used_valve_balance || 0) < 0
                          ? 'text-rose-200 bg-rose-950/70 border-x border-rose-600/80 shadow-inner'
                          : 'text-amber-300 bg-amber-950/40'
                      }`}
                      title={(item.used_valve_balance || 0) < 0
                        ? `مانده شیر کهنه: ${formatPersianNumber(item.used_valve_balance || 0)} (هشدار: تراز منفی - کسر از موجودی خود ام‌گاز)`
                        : `مانده شیر کهنه: ${formatPersianNumber(item.used_valve_balance || 0)}`}
                    >
                      <div className="flex items-center justify-center gap-1" dir="ltr">
                        {(item.used_valve_balance || 0) < 0 && (
                          <span className="text-[10px] text-rose-400" title="کسر از موجودی ام‌گاز">⚠️</span>
                        )}
                        <span className={(item.used_valve_balance || 0) < 0 ? 'text-rose-200 font-black' : ''}>
                          {formatPersianNumber(item.used_valve_balance || 0)}
                        </span>
                      </div>
                    </td>

                    {/* Defective */}
                    <td className="px-1 py-1.5 font-black font-mono text-xs sm:text-sm text-rose-400 bg-rose-950/20" title={`معیوب: ${formatPersianNumber(item.defective || 0)}`}>
                      {formatPersianNumber(item.defective || 0)}
                    </td>

                    {/* Actions: Vertical Minimal Column (ستون عملیات سند عمودی با حداقل فضا) */}
                    <td className="sticky left-0 z-10 col-actions-vertical bg-slate-900 group-hover:bg-slate-800 border-r border-slate-700/80 shadow-[4px_0_12px_rgba(0,0,0,0.5)] transition-colors">
                      <div className="flex flex-col items-center justify-center gap-1 py-1 mx-auto">
                        {/* Order & Document Details with Sheet Number (نوشتن شماره برگه در جزئیات سفارش در بخش عملیات) */}
                        <button
                          type="button"
                          onClick={() => setSelectedEntryForDetails(item)}
                          className="w-5 h-5 p-0.5 text-indigo-300 bg-indigo-950/70 hover:bg-indigo-900/90 border border-indigo-800/80 rounded flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                          title={`مشاهده جزئیات سفارش و سند (شماره برگه: ${item.transfer_sheet_number || '-'})`}
                        >
                          <Info className="w-3 h-3 text-indigo-400" />
                        </button>

                        {isOutgoingEntry(item) ? (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedExitReceiptEntry(item);
                              setShowExitReceiptModal(true);
                            }}
                            className="w-5 h-5 p-0.5 text-sky-300 bg-sky-950/70 hover:bg-sky-900/90 border border-sky-800/80 rounded flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                            title="مشاهده و چاپ فرم برگه خروج کالا و تعهدنامه راننده"
                          >
                            <Truck className="w-3 h-3 text-sky-400" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedReceiptEntry(item);
                              setShowReceiptModal(true);
                            }}
                            className="w-5 h-5 p-0.5 text-amber-300 bg-amber-950/70 hover:bg-amber-900/90 border border-amber-800/80 rounded flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                            title="مشاهده فرم استاندارد برگ ورود کالا"
                          >
                            <FileText className="w-3 h-3 text-amber-400" />
                          </button>
                        )}

                        {/* Print Row Button */}
                        <button
                          type="button"
                          onClick={() => {
                            if (isOutgoingEntry(item)) {
                              setSelectedExitReceiptEntry(item);
                              setShowExitReceiptModal(true);
                            } else {
                              setSelectedReceiptEntry(item);
                              setShowReceiptModal(true);
                            }
                          }}
                          className="w-5 h-5 p-0.5 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded flex items-center justify-center transition-colors cursor-pointer"
                          title="چاپ و خروجی PDF برگه سند"
                        >
                          <Printer className="w-3 h-3 text-slate-300" />
                        </button>

                        {/* Edit Kardex Row Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenEditKardex(item)}
                          className="w-5 h-5 p-0.5 text-emerald-300 bg-emerald-950/70 hover:bg-emerald-900/90 border border-emerald-800/80 rounded flex items-center justify-center transition-colors cursor-pointer shadow-2xs active:scale-95"
                          title="ویرایش سند و اطلاعات ردیف کاردکس گاز"
                        >
                          <Edit3 className="w-3 h-3 text-emerald-400" />
                        </button>

                        {/* Move to Trash Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDeleteModal(item, e.shiftKey || e.altKey);
                          }}
                          className="w-5 h-5 p-0.5 text-rose-300 bg-rose-950/70 hover:bg-rose-900/90 border border-rose-800/80 rounded flex items-center justify-center transition-colors cursor-pointer shadow-2xs active:scale-95"
                          title="انتقال به سطل آشغال (قابل بازیابی)"
                        >
                          <Trash2 className="w-3 h-3 text-rose-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>

            {/* Table Footer: Totals and Final Balances */}
            {displayedEntries.length > 0 && (
              <tfoot>
                <tr className="bg-slate-950 text-slate-200 font-bold border-t-2 border-slate-700 divide-x divide-slate-800 text-center">
                  <td colSpan={2} className="w-[50px] max-w-[54px] px-0.5 py-1 text-center" title="تراز کل و مانده نهایی گردش طرف حساب">
                    <span className="vertical-text-20 text-[9px] font-bold text-amber-400">تراز کل:</span>
                  </td>
                  <td className="px-1 py-2 font-mono text-blue-400 font-black text-xs sm:text-sm" title={`مجموع ورودی سیلندر: ${formatPersianNumber(stats.totalCylinderIn)}`}>{formatPersianNumber(stats.totalCylinderIn)}</td>
                  <td className="px-1 py-2 font-mono text-rose-400 font-black text-xs sm:text-sm" title={`مجموع خروجی سیلندر: ${formatPersianNumber(stats.totalCylinderOut)}`}>{formatPersianNumber(stats.totalCylinderOut)}</td>
                  <td className="px-1 py-2 font-mono text-rose-400 font-black text-xs sm:text-sm" title={`مجموع خروج ضایعات واقعی: ${formatPersianNumber(stats.totalScrapOut)}`}>{formatPersianNumber(stats.totalScrapOut)}</td>
                  <td className="px-1 py-2 font-mono text-amber-300 font-black text-xs sm:text-sm bg-amber-950/30" title={`مجموع خروج ضایعات سوری: ${formatPersianNumber(stats.totalScrapStockIn)}`}>{formatPersianNumber(stats.totalScrapStockIn)}</td>
                  <td className="px-1 py-2 font-mono text-emerald-300 bg-emerald-950/60 font-black text-sm sm:text-base border-x border-emerald-800/80" title={`مانده سیلندر: ${formatPersianNumber(stats.currentCylinders)}`}>{formatPersianNumber(stats.currentCylinders)}</td>
                  <td className="px-1 py-2 font-mono text-rose-300 bg-rose-950/40 font-black text-xs sm:text-sm" title={`مجموع خروج ضایعات ذخیره: ${formatPersianNumber(stats.totalFinalScrapOut)}`}>{formatPersianNumber(stats.totalFinalScrapOut)}</td>
                  <td className="px-1 py-2 font-mono text-amber-300 bg-amber-950/60 font-black text-sm sm:text-base border-x border-amber-800/80" title={`مانده ضایعات: ${formatPersianNumber(stats.currentScrap)}`}>{formatPersianNumber(stats.currentScrap)}</td>

                  <td className="px-1 py-2 font-mono text-emerald-400 font-black text-xs sm:text-sm">{formatPersianNumber(stats.totalNewValveIn)}</td>
                  <td className="px-1 py-2 font-mono text-rose-400 font-black text-xs sm:text-sm">{formatPersianNumber(stats.totalNewValveOut)}</td>
                  <td className={`px-1 py-2 font-mono font-black text-sm sm:text-base border-x border-emerald-800/80 ${stats.currentNewValves < 0 ? 'text-rose-300 bg-rose-950/70' : 'text-emerald-300 bg-emerald-950/60'}`} dir="ltr" title={stats.currentNewValves < 0 ? 'مانده شیر نو: تراز منفی (کسر از موجودی خود ام‌گاز)' : undefined}>
                    {stats.currentNewValves < 0 && '⚠️ '}
                    {formatPersianNumber(stats.currentNewValves)}
                  </td>

                  <td className="px-1 py-2 font-mono text-slate-300 font-black text-xs sm:text-sm">{formatPersianNumber(stats.totalDispatched)}</td>

                  <td className="px-1 py-2 font-mono text-amber-400 font-black text-xs sm:text-sm">{formatPersianNumber(stats.totalUsedValveIn)}</td>
                  <td className="px-1 py-2 font-mono text-rose-400 font-black text-xs sm:text-sm">{formatPersianNumber(stats.totalUsedValveOut)}</td>
                  <td className={`px-1 py-2 font-mono font-black text-sm sm:text-base ${stats.currentUsedValves < 0 ? 'text-rose-300 bg-rose-950/70 border-x border-rose-800/80' : 'text-amber-300 bg-amber-950/60'}`} dir="ltr" title={stats.currentUsedValves < 0 ? 'مانده شیر کهنه: تراز منفی (کسر از موجودی خود ام‌گاز)' : undefined}>
                    {stats.currentUsedValves < 0 && '⚠️ '}
                    {formatPersianNumber(stats.currentUsedValves)}
                  </td>

                  <td className="px-1 py-2 font-mono text-rose-400 font-black text-xs sm:text-sm">{formatPersianNumber(stats.totalDefective)}</td>
                  <td className="sticky left-0 z-20 col-actions-vertical text-slate-400 font-bold bg-slate-950 border-r border-slate-700/90 shadow-[4px_0_12px_rgba(0,0,0,0.5)]" title="تکمیل">
                    <span className="vertical-text-20 text-[9px] text-slate-400 font-bold">تکمیل</span>
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Modal: Create New Customer (طرف حساب / نمایندگی جدید) */}
      {showNewCustomerModal && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 cursor-pointer"
          onClick={() => setShowNewCustomerModal(false)}
        >
          <div
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 text-slate-100 cursor-default"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-100">
                  تعریف طرف حساب / نمایندگی جدید گاز
                </h3>
              </div>
              <button
                onClick={() => setShowNewCustomerModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    نام طرف حساب / نمایندگی *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCustomerForm.name}
                    onChange={e => setNewCustomerForm({ ...newCustomerForm, name: e.target.value })}
                    placeholder="مثال: پارس ام گاز"
                    className="w-full text-xs bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    نام شرکت / برند تجاری
                  </label>
                  <input
                    type="text"
                    value={newCustomerForm.company_name}
                    onChange={e => setNewCustomerForm({ ...newCustomerForm, company_name: e.target.value })}
                    placeholder="شرکت توزیع گاز پارس"
                    className="w-full text-xs bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    استان
                  </label>
                  <input
                    type="text"
                    value={newCustomerForm.province}
                    onChange={e => setNewCustomerForm({ ...newCustomerForm, province: e.target.value })}
                    placeholder="تهران / آذربایجان / کردستان ..."
                    className="w-full text-xs bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    شهر / منطقه
                  </label>
                  <input
                    type="text"
                    value={newCustomerForm.city}
                    onChange={e => setNewCustomerForm({ ...newCustomerForm, city: e.target.value })}
                    placeholder="تهران"
                    className="w-full text-xs bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    شماره تلفن همراه *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCustomerForm.phone}
                    onChange={e => setNewCustomerForm({ ...newCustomerForm, phone: e.target.value })}
                    placeholder="09123456789"
                    className="w-full text-xs bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-500 font-mono focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    نوع طرف حساب
                  </label>
                  <select
                    value={newCustomerForm.customer_type}
                    onChange={e => setNewCustomerForm({ ...newCustomerForm, customer_type: e.target.value as any })}
                    className="w-full text-xs bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-indigo-500"
                  >
                    <option value="عمده">عمده (توزیع‌کننده)</option>
                    <option value="سازمانی">سازمانی / صادراتی</option>
                    <option value="خرده">خرده‌فروشی</option>
                    <option value="پیمانکاری">پیمانکاری و خدمات</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  توضیحات و مشخصات کپسول‌ها
                </label>
                <textarea
                  rows={2}
                  value={newCustomerForm.notes}
                  onChange={e => setNewCustomerForm({ ...newCustomerForm, notes: e.target.value })}
                  className="w-full text-xs bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-500 focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewCustomerModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>ثبت طرف حساب و فعال‌سازی کاردکس</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Current Customer (ویرایش اطلاعات طرف حساب جاری) */}
      {showEditCustomerModal && currentCustomer && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 cursor-pointer animate-fade-in"
          onClick={() => setShowEditCustomerModal(false)}
        >
          <div
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-5 shadow-2xl space-y-4 text-slate-100 cursor-default"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            dir="rtl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">
                    ویرایش اطلاعات طرف حساب جاری
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    کد سیستمی: <span className="font-mono text-amber-400">{currentCustomer.customer_id}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEditCustomerModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateCustomer} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    نام طرف حساب / نمایندگی *
                  </label>
                  <input
                    type="text"
                    required
                    value={editCustomerForm.name}
                    onChange={e => setEditCustomerForm({ ...editCustomerForm, name: e.target.value })}
                    placeholder="مثال: البرز گاز"
                    className="w-full text-xs bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    نام شرکت / برند تجاری
                  </label>
                  <input
                    type="text"
                    value={editCustomerForm.company_name}
                    onChange={e => setEditCustomerForm({ ...editCustomerForm, company_name: e.target.value })}
                    placeholder="شرکت توزیع گاز البرز"
                    className="w-full text-xs bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    استان
                  </label>
                  <input
                    type="text"
                    value={editCustomerForm.province}
                    onChange={e => setEditCustomerForm({ ...editCustomerForm, province: e.target.value })}
                    placeholder="تهران / کرج / ..."
                    className="w-full text-xs bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    شهر / منطقه
                  </label>
                  <input
                    type="text"
                    value={editCustomerForm.city}
                    onChange={e => setEditCustomerForm({ ...editCustomerForm, city: e.target.value })}
                    placeholder="تهران"
                    className="w-full text-xs bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    شماره تلفن تماس *
                  </label>
                  <input
                    type="text"
                    required
                    value={editCustomerForm.phone}
                    onChange={e => setEditCustomerForm({ ...editCustomerForm, phone: e.target.value })}
                    placeholder="0912..."
                    className="w-full text-xs bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-500 font-mono focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    نوع طرف حساب
                  </label>
                  <select
                    value={editCustomerForm.customer_type}
                    onChange={e => setEditCustomerForm({ ...editCustomerForm, customer_type: e.target.value as any })}
                    className="w-full text-xs bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-hidden focus:border-amber-500"
                  >
                    <option value="عمده">عمده</option>
                    <option value="سازمانی">سازمانی / صادراتی</option>
                    <option value="خرده">خرده‌فروشی</option>
                    <option value="پیمانکاری">پیمانکاری و خدمات</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    شناسه ملی / کد ملی
                  </label>
                  <input
                    type="text"
                    value={editCustomerForm.national_id}
                    onChange={e => setEditCustomerForm({ ...editCustomerForm, national_id: e.target.value })}
                    placeholder="کد ملی 10 رقمی"
                    className="w-full text-xs bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-500 font-mono focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    کد اقتصادی
                  </label>
                  <input
                    type="text"
                    value={editCustomerForm.economic_code}
                    onChange={e => setEditCustomerForm({ ...editCustomerForm, economic_code: e.target.value })}
                    placeholder="کد اقتصادی 12 رقمی"
                    className="w-full text-xs bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-500 font-mono focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  یادداشت و توضیحات کاردکس
                </label>
                <textarea
                  rows={2}
                  value={editCustomerForm.notes}
                  onChange={e => setEditCustomerForm({ ...editCustomerForm, notes: e.target.value })}
                  className="w-full text-xs bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEditCustomerModal(false)}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>ذخیره تغییرات طرف حساب</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add New Kardex Entry */}
      {showAddEntryModal && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 cursor-pointer"
          onClick={() => setShowAddEntryModal(false)}
        >
          <div
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-[96vw] 2xl:max-w-[1550px] xl:max-w-[1450px] p-4 sm:p-5 shadow-2xl space-y-3 max-h-[94vh] overflow-y-auto text-slate-100 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Flame className={`w-5 h-5 ${entryTab === 'in' ? 'text-emerald-400' : 'text-amber-500'}`} />
                <div>
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 flex-wrap">
                    <span>ثبت سطر در کاردکس گاز «{currentCustomer?.name}»</span>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full border bg-amber-950/80 text-amber-300 border-amber-600/60 flex items-center gap-1">
                      <Flame className="w-3 h-3 text-amber-400" />
                      <span>{selectedCylinderType}</span>
                    </span>
                    <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full border ${
                      entryTab === 'in'
                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/80'
                        : 'bg-amber-950/80 text-amber-300 border-amber-700/80'
                    }`}>
                      {entryTab === 'in' ? 'سند ورودی (i)' : 'سند خروجی (e)'}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {entryTab === 'in'
                      ? 'ثبت ورود کپسول گاز، شیرآلات دریافتی و افزایش مانده تحویلی به مشتری'
                      : 'ثبت خروج و توزیع کپسول گاز، حواله ارسالی، ضایعات و قطعات'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddEntryModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* In-Modal Tab Switcher: Incoming (i) vs Outgoing (e) */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950/90 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => handleTabChange('in')}
                className={`py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  entryTab === 'in'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/60 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                }`}
              >
                <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
                <span>فرم ثبت ورودی (i)</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 border border-emerald-800 text-emerald-300 font-mono font-bold">i</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('out')}
                className={`py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  entryTab === 'out'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/60 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                }`}
              >
                <ArrowUpRight className="w-4 h-4 text-amber-400" />
                <span>فرم ثبت خروجی (e)</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950 border border-amber-800 text-amber-300 font-mono font-bold">e</span>
              </button>
            </div>

            <form onSubmit={handleCreateEntry} className="space-y-4">
              {/* Active User Registrant Indicator */}
              <div className="flex items-center justify-between px-3.5 py-2 bg-indigo-950/40 border border-indigo-700/50 rounded-xl text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-slate-400">کاربر ثبت‌کننده سند کاردکس:</span>
                  <span className="font-bold text-white">{currentUser.full_name}</span>
                  <span className="font-mono text-indigo-300 text-[11px]">(@{currentUser.username})</span>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-indigo-900/60 text-indigo-300 text-[10px] font-bold border border-indigo-700/60">
                  {currentUser.role_title || (currentUser.role === 'ADMIN' ? 'مدیریت ارشد' : 'مدیر داخلی')}
                </span>
              </div>

              {/* Row 1: Date and Automatically Generated Sheet Number */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start bg-slate-950/40 p-3.5 rounded-2xl border border-slate-800/70">
                {/* Date Picker (5 cols) */}
                <div className="md:col-span-5">
                  <div className="flex items-center justify-between h-5 mb-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      تاریخ سند (شمسی) *
                    </label>
                  </div>
                  <PersianDatePicker
                    value={newEntry.date}
                    onChange={(val) => {
                      const autoCount = calculateDailyRequestCount(
                        allKardexEntries,
                        currentCustomer?.name || currentCustomer?.customer_id || '',
                        val
                      );
                      setDailyLoadingCount(autoCount);
                      const newSheet = generateSheetNumber(
                        currentCustomer?.name || 'البرز گاز',
                        val,
                        entryTab === 'in' ? 'i' : 'e',
                        autoCount
                      );
                      setNewEntry(prev => ({
                        ...prev,
                        date: val,
                        transfer_sheet_number: newSheet
                      }));
                    }}
                    required
                    placeholder={getPersianDate()}
                  />
                </div>

                {/* Sheet Number Input with Auto-Calculated Loading Sequence (7 cols) - Read Only */}
                <div className="md:col-span-7">
                  <div className="flex items-center justify-between h-5 mb-1.5">
                    <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <Hash className={`w-3.5 h-3.5 shrink-0 ${entryTab === 'in' ? 'text-emerald-400' : 'text-amber-400'}`} />
                      <span>شماره برگه انتقال (تولید خودکار سیستمی) *</span>
                    </label>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleRegenerateSheetNumber()}
                        className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1 px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800/60 transition-colors cursor-pointer"
                        title="محاسبه مجدد بر اساس تاریخ و نوبت بارگیری"
                      >
                        <RefreshCw className="w-2.5 h-2.5" />
                        <span>بازتولید</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleCopySheetNumber}
                        className="text-[10px] text-slate-400 hover:text-slate-200 flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 border border-slate-700 transition-colors cursor-pointer"
                        title="کپی در حافظه"
                      >
                        {copiedSheet ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
                        <span>{copiedSheet ? 'کپی شد' : 'کپی'}</span>
                      </button>
                    </div>
                  </div>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      dir="ltr"
                      readOnly
                      tabIndex={-1}
                      value={newEntry.transfer_sheet_number}
                      placeholder={generateSheetNumber(currentCustomer?.name || 'البرز گاز', newEntry.date || getPersianDate(), entryTab === 'in' ? 'i' : 'e', dailyLoadingCount)}
                      className={`w-full h-[38px] text-xs font-mono font-bold tracking-wider rounded-xl pr-3 pl-9 bg-slate-900/90 border cursor-not-allowed select-all focus:outline-hidden ${
                        entryTab === 'in'
                          ? 'border-emerald-500/50 text-emerald-300'
                          : 'border-amber-500/50 text-amber-300'
                      }`}
                      title="این شماره به‌صورت سیستمی و خودکار تولید می‌شود و امکان ویرایش دستی ندارد."
                    />
                    <div className="absolute left-3 text-slate-500 pointer-events-none" title="قفل‌شده">
                      <Lock className="w-3.5 h-3.5 text-slate-400/70" />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  شرح رویداد / اقلام بار *
                </label>
                <input
                  type="text"
                  value={newEntry.description}
                  onChange={e => setNewEntry({ ...newEntry, description: e.target.value })}
                  required
                  placeholder={
                    entryTab === 'in'
                      ? 'مثال: دریافت محموله کپسول 11 کیلویی پر/خالی از نمایندگی'
                      : 'مثال: ارسال و توزیع محموله کپسول و بارنامه خروجی'
                  }
                  className="w-full text-xs bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-amber-500"
                />
              </div>

              {/* Unified 15-Column Kardex Strip Layout: فیلدهای ورودی در یک ردیف جدول مطابق نمای کاردکس */}
              <div className="space-y-2">
                {/* Header Strip with Previous Balances */}
                <div className="flex items-center justify-between p-2 bg-slate-950/90 rounded-xl border border-slate-800 flex-wrap gap-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-lg font-bold flex items-center gap-1.5 ${
                      entryTab === 'in'
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/80'
                        : 'bg-amber-950/80 text-amber-300 border border-amber-700/80'
                    }`}>
                      {entryTab === 'in' ? <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" /> : <ArrowUpRight className="w-3.5 h-3.5 text-amber-400" />}
                      <span>{entryTab === 'in' ? 'سند ورودی (i)' : 'سند خروجی (e)'}</span>
                    </span>
                    <span className="text-[10.5px] text-slate-400 hidden sm:inline">
                      (تمامی ۱۵ ستون کاردکس به‌صورت مستقیم در یک ردیف افقی بدون نیاز به اسکرول)
                    </span>
                  </div>

                  {/* Previous Balances Pills */}
                  <div className="flex items-center gap-1.5 font-mono text-[10.5px] flex-wrap">
                    <span className="text-slate-400 font-sans text-[10px]">مانده‌های قبل:</span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-950/70 text-emerald-300 border border-emerald-800 font-bold" title="مانده کپسول سالم سطر قبل">
                      کپسول: {formatPersianNumber(stats.currentCylinders || 0)}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-amber-950/70 text-amber-300 border border-amber-800 font-bold" title="مانده ضایعات سطر قبل">
                      ضایعات: {formatPersianNumber(stats.currentScrap || 0)}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded border font-bold ${
                      (stats.currentNewValves || 0) < 0
                        ? 'bg-rose-950/80 text-rose-300 border-rose-600'
                        : 'bg-teal-950/70 text-teal-300 border-teal-800'
                    }`} title="مانده شیر نو سطر قبل">
                      شیر نو: {formatPersianNumber(stats.currentNewValves || 0)}
                    </span>
                    <span className="px-1.5 py-0.5 rounded border font-bold bg-cyan-950/70 text-cyan-300 border-cyan-800" title="مانده شیر کهنه سطر قبل (حداقل ۰)">
                      شیر کهنه: {formatPersianNumber(Math.max(0, stats.currentUsedValves || 0))}
                    </span>
                  </div>
                </div>

                {/* 15-Column Table Strip (نمای فشرده و کاردکس بدون اسکرول) */}
                <div className="rounded-xl border border-slate-700/80 bg-slate-950/90 shadow-xl overflow-x-auto">
                  <table className="w-full table-fixed border-collapse text-center">
                    <thead>
                      {/* Level 1: Category Groups matching Kardex */}
                      <tr className="text-[9.5px] font-bold border-b border-slate-700">
                        <th colSpan={7} className="py-1 px-1 bg-blue-950/40 text-blue-300 border-x border-slate-700">
                          <div className="flex items-center justify-center gap-1">
                            <Flame className="w-3 h-3 text-blue-400 shrink-0" />
                            <span className="truncate">کپسول و ضایعات (خانواده سیلندر - ۷ ستون)</span>
                          </div>
                        </th>
                        <th colSpan={3} className="py-1 px-1 bg-teal-950/40 text-teal-300 border-x border-slate-700">
                          <div className="flex items-center justify-center gap-1">
                            <Layers className="w-3 h-3 text-teal-400 shrink-0" />
                            <span className="truncate">شیر نو (۳ ستون)</span>
                          </div>
                        </th>
                        <th colSpan={1} className="py-1 px-0.5 bg-slate-900 text-sky-300 border-x border-slate-700">
                          <div className="flex items-center justify-center gap-0.5">
                            <Truck className="w-3 h-3 text-sky-400 shrink-0" />
                            <span className="truncate">ارسالی</span>
                          </div>
                        </th>
                        <th colSpan={3} className="py-1 px-1 bg-cyan-950/40 text-cyan-300 border-x border-slate-700">
                          <div className="flex items-center justify-center gap-1">
                            <Layers className="w-3 h-3 text-cyan-400 shrink-0" />
                            <span className="truncate">شیر کهنه (۳ ستون)</span>
                          </div>
                        </th>
                        <th colSpan={1} className="py-1 px-0.5 bg-rose-950/40 text-rose-300 border-x border-slate-700">
                          <div className="flex items-center justify-center gap-0.5">
                            <Trash2 className="w-3 h-3 text-rose-400 shrink-0" />
                            <span className="truncate">معیوب</span>
                          </div>
                        </th>
                      </tr>

                      {/* Level 2: Exact Column Headers matching Kardex Table (Total 100% width) */}
                      <tr className="text-[9.5px] font-bold border-b border-slate-800 bg-slate-900/80 leading-tight">
                        {/* 1. ورودی سیلندر */}
                        <th className={`py-1 px-0.5 border-x border-slate-800 w-[7%] ${entryTab === 'in' ? 'text-emerald-300 bg-emerald-950/40 font-black' : 'text-blue-300'}`} title="تعداد سیلندرهای ورودی">
                          ورودی سیلندر
                        </th>
                        {/* 2. خروجی سیلندر */}
                        <th className={`py-1 px-0.5 border-x border-slate-800 w-[7%] ${entryTab === 'out' ? 'text-rose-200 bg-rose-950/40 font-black' : 'text-rose-300'}`} title="تعداد سیلندرهای خروجی">
                          خروجی سیلندر
                        </th>
                        {/* 3. ضایعات واقعی */}
                        <th className="py-1 px-0.5 text-rose-300 border-x border-slate-800 w-[6%]" title="خروج واقعی ضایعات">
                          ضایعات واقعی
                        </th>
                        {/* 4. ضایعات سوری */}
                        <th className="py-1 px-0.5 text-amber-300 border-x border-slate-800 w-[6%]" title="خروج ضایعات سوری (کاهش سالم)">
                          ضایعات سوری
                        </th>
                        {/* 5. مانده سیلندر */}
                        <th className="py-1 px-0.5 text-emerald-300 bg-emerald-950/50 border-x border-emerald-800/80 w-[7.5%] font-black" title="محاسبه خودکار زنده مانده سیلندر">
                          مانده سیلندر
                        </th>
                        {/* 6. ضایعات ذخیره */}
                        <th className="py-1 px-0.5 text-rose-300 border-x border-slate-800 w-[6%]" title="خروج ضایعات ذخیره">
                          ضایعات ذخیره
                        </th>
                        {/* 7. مانده ضایعات */}
                        <th className="py-1 px-0.5 text-amber-300 bg-amber-950/50 border-x border-amber-800/80 w-[7.5%] font-black" title="محاسبه خودکار زنده مانده ضایعات">
                          مانده ضایعات
                        </th>

                        {/* 8. ورود شیر نو */}
                        <th className={`py-1 px-0.5 border-x border-slate-800 w-[6.5%] ${entryTab === 'in' ? 'text-emerald-300 bg-emerald-950/30' : 'text-teal-300'}`} title="ورود شیر نو (هر عددی مجاز است)">
                          ورود شیر نو
                        </th>
                        {/* 9. خروج شیر نو */}
                        <th className="py-1 px-0.5 text-rose-300 border-x border-slate-800 w-[6.5%]" title="خروج شیر نو (= خروج سیلندر)">
                          خروج شیر نو
                        </th>
                        {/* 10. مانده شیر نو */}
                        <th className={`py-1 px-0.5 border-x w-[7.5%] font-black ${
                          newEntry.new_valve_balance < 0
                            ? 'text-rose-200 bg-rose-950/80 border-rose-500'
                            : 'text-teal-300 bg-teal-950/50 border-teal-800'
                        }`} title="مانده سطر قبل + ورودی - خروجی">
                          مانده شیر نو
                        </th>

                        {/* 11. ستون ارسالی */}
                        <th className="py-1 px-0.5 text-sky-300 border-x border-slate-800 w-[9%]" title="ستون ارسالی فقط متنی فاقد عدد">
                          ارسالی (متن)
                        </th>

                        {/* 12. ورود شیر کهنه */}
                        <th className="py-1 px-0.5 text-cyan-300 border-x border-slate-800 w-[6.5%]" title="ورود شیر کهنه (= ورودی سیلندر، قابل تغییر)">
                          ورود شیر کهنه
                        </th>
                        {/* 13. خروج شیر کهنه */}
                        <th className="py-1 px-0.5 text-rose-300 border-x border-slate-800 w-[6.5%]" title="خروج شیر کهنه (= خروج سیلندر، قابل تغییر)">
                          خروج شیر کهنه
                        </th>
                        {/* 14. مانده شیر کهنه */}
                        <th className={`py-1 px-0.5 border-x w-[7.5%] font-black ${
                          newEntry.used_valve_balance < 0
                            ? 'text-rose-200 bg-rose-950/80 border-rose-500'
                            : 'text-cyan-300 bg-cyan-950/50 border-cyan-800'
                        }`} title="مانده سطر قبل + ورودی - خروجی">
                          مانده کهنه
                        </th>

                        {/* 15. معیوب */}
                        <th className="py-1 px-0.5 text-amber-300 border-x border-slate-800 w-[4.5%]" title="تعداد اقلام معیوب و داغی">
                          معیوب
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {/* Input Controls Row: تمام فیلدها کنار هم بدون اسکرول */}
                      <tr className="bg-slate-900/30">
                        {/* 1. ورودی سیلندر */}
                        <td className="p-0.5 border-x border-slate-800">
                          <input
                            type="number"
                            min="0"
                            value={newEntry.cylinder_in ?? 0}
                            onFocus={e => { if (e.target.value === '0') e.target.select(); }}
                            onChange={e => updateNewEntryField('cylinder_in', e.target.value === '' ? 0 : Number(e.target.value))}
                            placeholder="0"
                            className={`w-full text-center text-[11px] font-mono font-bold bg-slate-900 border rounded px-0.5 py-0.5 h-7 leading-none text-blue-100 placeholder-slate-600 focus:outline-hidden ${
                              entryTab === 'in'
                                ? 'border-emerald-500/80 ring-1 ring-emerald-500/50 focus:border-emerald-400'
                                : 'border-blue-600/70 focus:border-blue-400'
                            }`}
                          />
                        </td>

                        {/* 2. خروجی سیلندر */}
                        <td className="p-0.5 border-x border-slate-800">
                          <input
                            type="number"
                            min="0"
                            value={newEntry.cylinder_out ?? 0}
                            onFocus={e => { if (e.target.value === '0') e.target.select(); }}
                            onChange={e => updateNewEntryField('cylinder_out', e.target.value === '' ? 0 : Number(e.target.value))}
                            placeholder="0"
                            className={`w-full text-center text-[11px] font-mono font-bold bg-slate-900 border rounded px-0.5 py-0.5 h-7 leading-none text-rose-100 placeholder-slate-600 focus:outline-hidden ${
                              entryTab === 'out'
                                ? 'border-rose-500 ring-1 ring-rose-500/50 focus:border-rose-400'
                                : 'border-rose-600/60 focus:border-rose-400'
                            }`}
                          />
                        </td>

                        {/* 3. ضایعات واقعی */}
                        <td className="p-0.5 border-x border-slate-800">
                          <input
                            type="number"
                            min="0"
                            value={newEntry.scrap_out ?? 0}
                            onFocus={e => { if (e.target.value === '0') e.target.select(); }}
                            onChange={e => updateNewEntryField('scrap_out', e.target.value === '' ? 0 : Number(e.target.value))}
                            placeholder="0"
                            className="w-full text-center text-[11px] font-mono font-bold bg-slate-900 border border-slate-700 rounded px-0.5 py-0.5 h-7 leading-none text-slate-100 placeholder-slate-600 focus:outline-hidden focus:border-rose-400"
                          />
                        </td>

                        {/* 4. ضایعات سوری */}
                        <td className="p-0.5 border-x border-slate-800">
                          <input
                            type="number"
                            min="0"
                            value={newEntry.scrap_stock_in ?? 0}
                            onFocus={e => { if (e.target.value === '0') e.target.select(); }}
                            onChange={e => updateNewEntryField('scrap_stock_in', e.target.value === '' ? 0 : Number(e.target.value))}
                            placeholder="0"
                            className="w-full text-center text-[11px] font-mono font-bold bg-slate-900 border border-amber-600/60 rounded px-0.5 py-0.5 h-7 leading-none text-amber-100 placeholder-slate-600 focus:outline-hidden focus:border-amber-400"
                          />
                        </td>

                        {/* 5. مانده سیلندر (محاسبه خودکار زنده) */}
                        <td className="p-0.5 border-x border-emerald-800/80 bg-emerald-950/30">
                          <input
                            type="number"
                            readOnly
                            value={newEntry.cylinder_balance ?? 0}
                            className="w-full text-center text-[11px] font-mono font-bold bg-emerald-950/60 border border-emerald-500/70 rounded px-0.5 py-0.5 h-7 leading-none text-emerald-200 cursor-not-allowed select-all"
                            title="فرمول: مانده سطر قبل + ورودی سیلندر – خروج سیلندر – خروج ضایعات سوری"
                          />
                        </td>

                        {/* 6. ضایعات ذخیره */}
                        <td className="p-0.5 border-x border-slate-800">
                          <input
                            type="number"
                            min="0"
                            value={newEntry.final_scrap_out ?? 0}
                            onFocus={e => { if (e.target.value === '0') e.target.select(); }}
                            onChange={e => updateNewEntryField('final_scrap_out', e.target.value === '' ? 0 : Number(e.target.value))}
                            placeholder="0"
                            className="w-full text-center text-[11px] font-mono font-bold bg-slate-900 border border-rose-700/80 rounded px-0.5 py-0.5 h-7 leading-none text-rose-100 placeholder-slate-600 focus:outline-hidden focus:border-rose-400"
                          />
                        </td>

                        {/* 7. مانده ضایعات (محاسبه خودکار زنده) */}
                        <td className="p-0.5 border-x border-amber-800/80 bg-amber-950/30">
                          <input
                            type="number"
                            readOnly
                            value={newEntry.scrap_balance ?? 0}
                            className="w-full text-center text-[11px] font-mono font-bold bg-amber-950/60 border border-amber-500/70 rounded px-0.5 py-0.5 h-7 leading-none text-amber-200 cursor-not-allowed select-all"
                            title="فرمول: مانده ضایعات سطر قبل + خروج ضایعات سوری – خروج واقعی ضایعات – خروج ضایعات ذخیره"
                          />
                        </td>

                        {/* 8. ورود شیر نو */}
                        <td className="p-0.5 border-x border-slate-800">
                          <input
                            type="number"
                            min="0"
                            value={newEntry.new_valve_in ?? 0}
                            onFocus={e => { if (e.target.value === '0') e.target.select(); }}
                            onChange={e => updateNewEntryField('new_valve_in', e.target.value === '' ? 0 : Number(e.target.value))}
                            placeholder="0"
                            className="w-full text-center text-[11px] font-mono font-bold bg-slate-900 border border-teal-600/70 rounded px-0.5 py-0.5 h-7 leading-none text-teal-100 placeholder-slate-600 focus:outline-hidden focus:border-teal-400"
                          />
                        </td>

                        {/* 9. خروج شیر نو */}
                        <td className="p-0.5 border-x border-slate-800">
                          <input
                            type="number"
                            min="0"
                            value={newEntry.new_valve_out ?? 0}
                            onFocus={e => { if (e.target.value === '0') e.target.select(); }}
                            onChange={e => updateNewEntryField('new_valve_out', e.target.value === '' ? 0 : Number(e.target.value))}
                            placeholder="0"
                            className="w-full text-center text-[11px] font-mono font-bold bg-slate-900 border border-rose-600/60 rounded px-0.5 py-0.5 h-7 leading-none text-rose-100 placeholder-slate-600 focus:outline-hidden focus:border-rose-400"
                          />
                        </td>

                        {/* 10. مانده شیر نو (محاسبه زنده - پذیرش منفی) */}
                        <td className={`p-0.5 border-x ${
                          newEntry.new_valve_balance < 0 ? 'bg-rose-950/50 border-rose-600' : 'bg-teal-950/30 border-teal-800'
                        }`}>
                          <input
                            type="number"
                            readOnly
                            value={newEntry.new_valve_balance ?? 0}
                            className={`w-full text-center text-[11px] font-mono font-bold rounded px-0.5 py-0.5 h-7 leading-none cursor-not-allowed select-all border ${
                              newEntry.new_valve_balance < 0
                                ? 'bg-rose-950/90 border-rose-500 text-rose-200 ring-1 ring-rose-500'
                                : 'bg-teal-950/60 border-teal-500/70 text-teal-200'
                            }`}
                            title={`مانده قبل (${stats.currentNewValves || 0}) + ورودی (${newEntry.new_valve_in || 0}) - خروجی (${newEntry.new_valve_out || 0}) = ${newEntry.new_valve_balance || 0}`}
                          />
                        </td>

                        {/* 11. ستون ارسالی (فقط متنی) */}
                        <td className="p-0.5 border-x border-slate-800">
                          <input
                            type="text"
                            value={newEntry.dispatched !== undefined && newEntry.dispatched !== null && String(newEntry.dispatched) !== '0' && String(newEntry.dispatched) !== '۰' ? String(newEntry.dispatched) : ''}
                            onChange={e => updateNewEntryField('dispatched', e.target.value)}
                            placeholder="بارنامه/متن"
                            className="w-full text-center text-[10px] bg-slate-900 border border-blue-700/60 rounded px-0.5 py-0.5 h-7 leading-none text-blue-100 placeholder-slate-600 placeholder:text-[9px] focus:outline-hidden focus:border-blue-400 truncate"
                          />
                        </td>

                        {/* 12. ورود شیر کهنه */}
                        <td className="p-0.5 border-x border-slate-800">
                          <input
                            type="number"
                            min="0"
                            value={newEntry.used_valve_in ?? 0}
                            onFocus={e => { if (e.target.value === '0') e.target.select(); }}
                            onChange={e => updateNewEntryField('used_valve_in', e.target.value === '' ? 0 : Number(e.target.value))}
                            placeholder="0"
                            className="w-full text-center text-[11px] font-mono font-bold bg-slate-900 border border-cyan-600/70 rounded px-0.5 py-0.5 h-7 leading-none text-cyan-100 placeholder-slate-600 focus:outline-hidden focus:border-cyan-400"
                          />
                        </td>

                        {/* 13. خروج شیر کهنه */}
                        <td className="p-0.5 border-x border-slate-800">
                          <input
                            type="number"
                            min="0"
                            value={newEntry.used_valve_out ?? 0}
                            onFocus={e => { if (e.target.value === '0') e.target.select(); }}
                            onChange={e => updateNewEntryField('used_valve_out', e.target.value === '' ? 0 : Number(e.target.value))}
                            placeholder="0"
                            title="خروج شیر کهنه (سلول مستقل و بدون وابستگی)"
                            className="w-full text-center text-[11px] font-mono font-bold bg-slate-900 border border-rose-600/60 rounded px-0.5 py-0.5 h-7 leading-none text-rose-100 placeholder-slate-600 focus:outline-hidden focus:border-rose-400"
                          />
                        </td>

                        {/* 14. مانده شیر کهنه (حداقل صفر) */}
                        <td className="p-0.5 border-x bg-cyan-950/30 border-cyan-800">
                          <input
                            type="number"
                            readOnly
                            value={newEntry.used_valve_balance ?? 0}
                            className="w-full text-center text-[11px] font-mono font-bold rounded px-0.5 py-0.5 h-7 leading-none cursor-not-allowed select-all border bg-cyan-950/60 border-cyan-500/70 text-cyan-200"
                            title={`مانده سطر قبل (${stats.currentUsedValves || 0}) + ورودی (${newEntry.used_valve_in || 0})${newEntry.used_valve_out ? ` - خروجی (${newEntry.used_valve_out})` : ''} = حداقل صفر (${newEntry.used_valve_balance || 0})`}
                          />
                        </td>

                        {/* 15. معیوب */}
                        <td className="p-0.5 border-x border-slate-800">
                          <input
                            type="number"
                            min="0"
                            value={newEntry.defective ?? 0}
                            onFocus={e => { if (e.target.value === '0') e.target.select(); }}
                            onChange={e => updateNewEntryField('defective', e.target.value === '' ? 0 : Number(e.target.value))}
                            placeholder="0"
                            className="w-full text-center text-[11px] font-mono bg-slate-900 border border-slate-700 rounded px-0.5 py-0.5 h-7 leading-none text-slate-100 placeholder-slate-600 focus:outline-hidden focus:border-amber-400 font-bold"
                          />
                        </td>
                      </tr>

                      {/* Sub-hints Row: راهنمای فشرده فیلدها */}
                      <tr className="text-[8.5px] text-slate-700 dark:text-slate-400 bg-slate-100 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800/60 font-medium leading-tight">
                        <td className="py-0.5 px-0.5 border-x border-slate-200 dark:border-slate-800 truncate">
                          {entryTab === 'in' ? <span className="text-emerald-600 dark:text-emerald-400 font-bold">ورودی</span> : 'افزایش'}
                        </td>
                        <td className="py-0.5 px-0.5 border-x border-slate-200 dark:border-slate-800 truncate">
                          {entryTab === 'out' ? <span className="text-rose-600 dark:text-rose-400 font-bold">خروجی</span> : 'کاهش'}
                        </td>
                        <td className="py-0.5 px-0.5 border-x border-slate-200 dark:border-slate-800 truncate">قطعی</td>
                        <td className="py-0.5 px-0.5 border-x border-slate-200 dark:border-slate-800 truncate">کاهش سالم</td>
                        <td className="py-0.5 px-0.5 border-x border-emerald-300 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold truncate">خودکار</td>
                        <td className="py-0.5 px-0.5 border-x border-slate-200 dark:border-slate-800 truncate">ذخیره</td>
                        <td className="py-0.5 px-0.5 border-x border-amber-300 dark:border-amber-900/60 text-amber-700 dark:text-amber-300 font-bold truncate">خودکار</td>
                        <td className="py-0.5 px-0.5 border-x border-slate-200 dark:border-slate-800 truncate">هر عدد</td>
                        <td className="py-0.5 px-0.5 border-x border-slate-200 dark:border-slate-800 truncate">= خروج</td>
                        <td className={`py-0.5 px-0.5 border-x font-bold truncate ${newEntry.new_valve_balance < 0 ? 'text-rose-600 dark:text-rose-300' : 'text-teal-700 dark:text-teal-300'}`}>
                          {newEntry.new_valve_balance < 0 ? '⚠️ ام‌گاز' : 'خودکار'}
                        </td>
                        <td className="py-0.5 px-0.5 border-x border-slate-200 dark:border-slate-800 text-sky-600 dark:text-sky-400 truncate">فقط متن</td>
                        <td className="py-0.5 px-0.5 border-x border-slate-200 dark:border-slate-800 truncate" title="ورودی شیر کهنه همیشه برابر ورودی سیلندر است و قابل ویرایش">= ورود</td>
                        <td className="py-0.5 px-0.5 border-x border-slate-200 dark:border-slate-800 truncate" title="خروج شیر کهنه سلول مستقل است و وابسته به خروج سیلندر نیست">مستقل</td>
                        <td className="py-0.5 px-0.5 border-x font-bold truncate text-cyan-700 dark:text-cyan-300" title="مانده شیر کهنه = مانده قبل + ورودی">
                          مانده قبل + ورود
                        </td>
                        <td className="py-0.5 px-0.5 border-x border-slate-200 dark:border-slate-800 truncate">داغی</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Negative Warning Banner if new valve balance is negative */}
                {newEntry.new_valve_balance < 0 && (
                  <div className="p-2 bg-rose-950/60 border border-rose-500/70 rounded-xl flex items-start gap-2 text-rose-200 text-xs animate-pulse">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-rose-100 block text-[11px]">
                        هشدار کسر از موجودی خود ام‌گاز:
                      </strong>
                      <span className="text-[10px] text-rose-300 leading-relaxed block">
                        مانده شیر نو منفی شده است ({newEntry.new_valve_balance} عدد). این مقدار از موجودی خود ام‌گاز کسر خواهد شد.
                      </span>
                    </div>
                  </div>
                )}

                {/* Summary Strip (خلاصه تراز سطر ثبتی کاردکس) */}
                <div className="p-2 bg-slate-950/90 rounded-xl border border-slate-800 flex items-center justify-between text-xs flex-wrap gap-2">
                  <span className="text-slate-300 flex items-center gap-1.5 font-bold text-[11px]">
                    <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${entryTab === 'in' ? 'text-emerald-400' : 'text-amber-400'}`} />
                    <span>خلاصه تراز سطر کاردکس:</span>
                  </span>
                  <div className="flex items-center gap-2 font-mono font-bold text-slate-200 flex-wrap text-[11px]">
                    <span className="text-blue-300">
                      ورودی: {formatPersianNumber(newEntry.cylinder_in || 0)}
                    </span>
                    <span className="text-slate-600">|</span>
                    <span className="text-rose-300">
                      خروجی: {formatPersianNumber(newEntry.cylinder_out || 0)}
                    </span>
                    <span className="text-slate-600">|</span>
                    <span className="text-emerald-300 bg-emerald-950/70 px-1.5 py-0.5 rounded border border-emerald-800">
                      مانده کپسول: {formatPersianNumber(newEntry.cylinder_balance || 0)}
                    </span>
                    <span className="text-slate-600">|</span>
                    <span className="text-amber-300 bg-amber-950/70 px-1.5 py-0.5 rounded border border-amber-800">
                      مانده ضایعات: {formatPersianNumber(newEntry.scrap_balance || 0)}
                    </span>
                    <span className="text-slate-600">|</span>
                    <span className={`px-1.5 py-0.5 rounded border ${newEntry.new_valve_balance < 0 ? 'text-rose-300 bg-rose-950/80 border-rose-500' : 'text-teal-300 bg-teal-950/70 border-teal-800'}`}>
                      مانده شیر نو: {formatPersianNumber(newEntry.new_valve_balance || 0)}
                    </span>
                    <span className="text-slate-600">|</span>
                    <span className="px-1.5 py-0.5 rounded border text-cyan-300 bg-cyan-950/70 border-cyan-800">
                      مانده شیر کهنه: {formatPersianNumber(newEntry.used_valve_balance || 0)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-800 flex-wrap">
                <div className="text-xs text-slate-400 flex items-center gap-1.5">
                  <span className="font-medium">شماره برگه نهایی:</span>
                  <span className={`font-mono font-bold px-2 py-0.5 rounded border ${
                    entryTab === 'in'
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                      : 'bg-amber-950 text-amber-300 border-amber-800'
                  }`}>
                    {newEntry.transfer_sheet_number || generateSheetNumber(currentCustomer?.name || 'البرز گاز', newEntry.date || getPersianDate(), entryTab === 'in' ? 'i' : 'e')}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddEntryModal(false)}
                    className="px-4 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    onClick={(e) => {
                      e.preventDefault();
                      handleCreateEntry(undefined, false);
                    }}
                    className={`px-5 py-2 text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer ${
                      entryTab === 'in'
                        ? 'text-emerald-950 bg-emerald-400 hover:bg-emerald-300'
                        : 'text-amber-950 bg-amber-400 hover:bg-amber-300'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>ثبت سند {entryTab === 'in' ? 'ورودی (i)' : 'خروجی (e)'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCreateEntry(undefined, true)}
                    className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-4 h-4 text-indigo-200" />
                    <span>ثبت و پرینت</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Official Print & Print Preview (چاپ کارتکس جاری) */}
      {showPrintModal && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 cursor-pointer"
          onClick={() => setShowPrintModal(false)}
        >
          <div
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col text-slate-100 cursor-default"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 no-print">
              <div className="flex items-center gap-2.5">
                <Printer className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-slate-100">
                  پیش‌نمایش چاپ رسمی کاردکس گاز «{currentCustomer?.name}»
                </h3>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleExportKardexPdf}
                  disabled={isExportingPdf}
                  className="px-3.5 py-1.5 text-xs font-bold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 rounded-xl flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                  title="دانلود مستقیم سند کاردکس به صورت فایل PDF"
                >
                  <Download className={`w-4 h-4 ${isExportingPdf ? 'animate-bounce' : ''}`} />
                  <span>{isExportingPdf ? 'در حال تولید PDF...' : 'دانلود فایل PDF'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleTriggerPrint}
                  className="px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                  title="ارسال مستقیم به پرینتر یا ذخیره PDF مرورگر"
                >
                  <Printer className="w-4 h-4" />
                  <span>چاپ رسمی (Print)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowPrintModal(false)}
                  className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* The Printable Paper Sheet */}
            <div
              id="printable-gas-kardex"
              className="bg-white text-slate-900 rounded-xl p-6 border border-slate-300 overflow-y-auto flex-1 text-right text-xs"
            >
              {/* Official Header */}
              <div className="border-b-2 border-slate-900 pb-3 mb-4">
                <div className="flex justify-between items-center gap-3">
                  <div className="flex items-center gap-2">
                    <MGasOfficialLogo />
                  </div>
                  <div className="text-center">
                    <h2 className="text-base sm:text-lg font-black text-slate-950">
                      سامانه جامع انبار و توزیع گاز مایع ام گاز
                    </h2>
                    <h3 className="text-xs font-bold text-slate-800 mt-0.5">
                      کارتکس تخصصی گردش سیلندر، کپسول و شیرآلات گاز
                    </h3>
                  </div>
                  <div className="text-left text-[10px] text-slate-600 space-y-0.5">
                    <div>تاریخ چاپ: {toEnglishDigits(new Intl.DateTimeFormat('fa-IR-u-nu-latn', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()))}</div>
                    <div className="print:hidden">کاربر متصدی در سیستم: @{currentUser.username} ({currentUser.full_name})</div>
                    <div>کد طرف حساب: {toEnglishDigits(currentCustomer?.customer_id)}</div>
                  </div>
                </div>

                {/* Customer Details Box */}
                <div className="mt-4 bg-slate-100 p-3 rounded-lg border border-slate-300 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500">طرف حساب: </span>
                    <strong className="text-slate-900">{currentCustomer?.name}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">شرکت/برند: </span>
                    <strong className="text-slate-900">{currentCustomer?.company_name || '-'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">استان و شهر: </span>
                    <strong className="text-slate-900">{currentCustomer?.province} - {currentCustomer?.city}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">تلفن: </span>
                    <strong className="text-slate-900">{toEnglishDigits(currentCustomer?.phone)}</strong>
                  </div>
                </div>
              </div>

              {/* Printable Table */}
              <div className="overflow-x-auto w-full">
                <table className="w-full text-right text-[7.5px] sm:text-[8.5px] border border-slate-400 border-collapse kardex-table table-fixed">
                  <colgroup>
                    <col style={{ width: '3.0%' }} />
                    <col style={{ width: '6.8%' }} />
                    <col style={{ width: '14.2%' }} />
                    <col style={{ width: '6.2%' }} />
                    <col style={{ width: '5.0%' }} />
                    <col style={{ width: '5.0%' }} />
                    <col style={{ width: '5.2%' }} />
                    <col style={{ width: '5.2%' }} />
                    <col style={{ width: '5.8%' }} />
                    <col style={{ width: '5.2%' }} />
                    <col style={{ width: '5.4%' }} />
                    <col style={{ width: '4.6%' }} />
                    <col style={{ width: '4.6%' }} />
                    <col style={{ width: '5.0%' }} />
                    <col style={{ width: '4.2%' }} />
                    <col style={{ width: '4.6%' }} />
                    <col style={{ width: '4.6%' }} />
                    <col style={{ width: '5.2%' }} />
                    <col style={{ width: '4.8%' }} />
                  </colgroup>
                  <thead>
                    <tr className="bg-slate-200 border-b border-slate-400 text-center font-bold text-[7px] sm:text-[8px] leading-tight">
                      <th className="border border-slate-400 p-0.5 sm:p-1">ردیف</th>
                      <th className="border border-slate-400 p-0.5 sm:p-1">تاریخ</th>
                      <th className="border border-slate-400 p-0.5 sm:p-1 text-right">شرح عملیات</th>
                      <th className="border border-slate-400 p-0.5 sm:p-1">شماره<br/>برگه</th>
                      <th className="border border-slate-400 p-0.5 sm:p-1">ورودی<br/>سیلندر</th>
                      <th className="border border-slate-400 p-0.5 sm:p-1">خروجی<br/>سیلندر</th>
                      <th className="border border-slate-400 p-0.5 sm:p-1">ضایعات<br/>واقعی</th>
                      <th className="border border-slate-400 p-0.5 sm:p-1 bg-amber-50 text-amber-900">ضایعات<br/>سوری</th>
                      <th className="border border-slate-400 p-0.5 sm:p-1 bg-emerald-100 text-emerald-900 font-bold">مانده<br/>سیلندر</th>
                      <th className="border border-slate-400 p-0.5 sm:p-1 bg-rose-100 text-rose-800 font-bold" title="ضایعات نهایی">ضایعات<br/>نهایی</th>
                      <th className="border border-slate-400 p-0.5 sm:p-1 bg-amber-100 text-amber-900 font-bold">مانده<br/>ضایعات</th>
                      <th className="border border-slate-400 p-0.5 sm:p-1">شیر نو<br/>(+)</th>
                      <th className="border border-slate-400 p-0.5 sm:p-1">شیر نو<br/>(-)</th>
                      <th className="border border-slate-400 p-0.5 sm:p-1 bg-emerald-100 text-emerald-900 font-bold">مانده<br/>نو</th>
                      <th className="border border-slate-400 p-0.5 sm:p-1">ارسالی</th>
                      <th className="border border-slate-400 p-0.5 sm:p-1">داغی<br/>(+)</th>
                      <th className="border border-slate-400 p-0.5 sm:p-1">داغی<br/>(-)</th>
                      <th className="border border-slate-400 p-0.5 sm:p-1 bg-amber-100 text-amber-900 font-bold">مانده<br/>داغی</th>
                      <th className="border border-slate-400 p-0.5 sm:p-1">معیوب</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerEntries.map((row, idx) => (
                      <tr key={row.entry_id || idx} className="text-center divide-x divide-slate-300 text-[7.5px] sm:text-[8px]">
                        <td className="border border-slate-300 p-0.5 font-bold">{toEnglishDigits(idx + 1)}</td>
                        <td className="border border-slate-300 p-0.5">{toEnglishDigits(row.date)}</td>
                        <td className="border border-slate-300 p-0.5 text-right overflow-hidden text-ellipsis whitespace-nowrap leading-tight">{row.description}</td>
                        <td className="border border-slate-300 p-0.5 font-bold">{toEnglishDigits(row.transfer_sheet_number) || '-'}</td>
                        <td className="border border-slate-300 p-0.5">{row.cylinder_in > 0 ? toEnglishDigits(formatNumberEn(row.cylinder_in)) : '-'}</td>
                        <td className="border border-slate-300 p-0.5">{row.cylinder_out > 0 ? toEnglishDigits(formatNumberEn(row.cylinder_out)) : '-'}</td>
                        <td className="border border-slate-300 p-0.5">{row.scrap_out > 0 ? toEnglishDigits(formatNumberEn(row.scrap_out)) : '-'}</td>
                        <td className="border border-slate-300 p-0.5 bg-amber-50/50 text-amber-900 font-bold">{(row.scrap_stock_in || 0) > 0 ? toEnglishDigits(formatNumberEn(row.scrap_stock_in)) : '-'}</td>
                        <td className="border border-slate-300 p-0.5 font-bold bg-emerald-50 text-emerald-800">{toEnglishDigits(formatNumberEn(row.cylinder_balance))}</td>
                        <td className="border border-slate-300 p-0.5 font-bold bg-rose-50 text-rose-700">{(row.final_scrap_out || 0) > 0 ? toEnglishDigits(formatNumberEn(row.final_scrap_out!)) : '-'}</td>
                        <td className="border border-slate-300 p-0.5 font-bold bg-amber-50 text-amber-800">{toEnglishDigits(formatNumberEn(row.scrap_balance))}</td>
                        <td className="border border-slate-300 p-0.5">{row.new_valve_in > 0 ? toEnglishDigits(formatNumberEn(row.new_valve_in)) : '-'}</td>
                        <td className="border border-slate-300 p-0.5">{row.new_valve_out > 0 ? toEnglishDigits(formatNumberEn(row.new_valve_out)) : '-'}</td>
                        <td className="border border-slate-300 p-0.5 font-bold bg-emerald-50 text-emerald-800">{toEnglishDigits(formatNumberEn(row.new_valve_balance))}</td>
                        <td className="border border-slate-300 p-0.5 font-bold">{row.dispatched !== undefined && row.dispatched !== null && String(row.dispatched).trim() !== '' && String(row.dispatched).trim() !== '0' ? (isNaN(Number(row.dispatched)) ? String(row.dispatched) : toEnglishDigits(formatNumberEn(row.dispatched))) : '-'}</td>
                        <td className="border border-slate-300 p-0.5">{row.used_valve_in > 0 ? toEnglishDigits(formatNumberEn(row.used_valve_in)) : '-'}</td>
                        <td className="border border-slate-300 p-0.5">{row.used_valve_out > 0 ? toEnglishDigits(formatNumberEn(row.used_valve_out)) : '-'}</td>
                        <td className="border border-slate-300 p-0.5 font-bold bg-amber-50 text-amber-800">{toEnglishDigits(formatNumberEn(row.used_valve_balance))}</td>
                        <td className="border border-slate-300 p-0.5">{row.defective > 0 ? toEnglishDigits(formatNumberEn(row.defective)) : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-200 font-bold border-t-2 border-slate-500 text-center text-[7.5px] sm:text-[8px]">
                      <td colSpan={4} className="border border-slate-400 p-0.5 sm:p-1 text-right font-black">تراز نهایی:</td>
                      <td className="border border-slate-400 p-0.5 sm:p-1">{toEnglishDigits(formatNumberEn(stats.totalCylinderIn))}</td>
                      <td className="border border-slate-400 p-0.5 sm:p-1">{toEnglishDigits(formatNumberEn(stats.totalCylinderOut))}</td>
                      <td className="border border-slate-400 p-0.5 sm:p-1">{toEnglishDigits(formatNumberEn(stats.totalScrapOut))}</td>
                      <td className="border border-slate-400 p-0.5 sm:p-1 bg-amber-100 text-amber-900">{toEnglishDigits(formatNumberEn(stats.totalScrapStockIn))}</td>
                      <td className="border border-slate-400 p-0.5 sm:p-1 font-extrabold bg-emerald-100 text-emerald-900">{toEnglishDigits(formatNumberEn(stats.currentCylinders))}</td>
                      <td className="border border-slate-400 p-0.5 sm:p-1 font-extrabold bg-rose-100 text-rose-800">{toEnglishDigits(formatNumberEn(stats.totalFinalScrapOut))}</td>
                      <td className="border border-slate-400 p-0.5 sm:p-1 font-extrabold bg-amber-100 text-amber-900">{toEnglishDigits(formatNumberEn(stats.currentScrap))}</td>
                      <td className="border border-slate-400 p-0.5 sm:p-1">{toEnglishDigits(formatNumberEn(stats.totalNewValveIn))}</td>
                      <td className="border border-slate-400 p-0.5 sm:p-1">{toEnglishDigits(formatNumberEn(stats.totalNewValveOut))}</td>
                      <td className="border border-slate-400 p-0.5 sm:p-1 font-extrabold bg-emerald-100 text-emerald-900">{toEnglishDigits(formatNumberEn(stats.currentNewValves))}</td>
                      <td className="border border-slate-400 p-0.5 sm:p-1">{toEnglishDigits(formatNumberEn(stats.totalDispatched))}</td>
                      <td className="border border-slate-400 p-0.5 sm:p-1">{toEnglishDigits(formatNumberEn(stats.totalUsedValveIn))}</td>
                      <td className="border border-slate-400 p-0.5 sm:p-1">{toEnglishDigits(formatNumberEn(stats.totalUsedValveOut))}</td>
                      <td className="border border-slate-400 p-0.5 sm:p-1 font-extrabold bg-amber-100 text-amber-900">{toEnglishDigits(formatNumberEn(stats.currentUsedValves))}</td>
                      <td className="border border-slate-400 p-0.5 sm:p-1">{toEnglishDigits(formatNumberEn(stats.totalDefective))}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Signatures Footer */}
              <div className="kardex-signatures-block mt-6 pt-3 border-t border-slate-300 grid grid-cols-3 text-center text-xs text-slate-700">
                <div>
                  <p className="font-bold">تحویل‌دهنده (انباردار گاز)</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">نام، امضا و اثر انگشت</p>
                  <div className="h-8 mt-1"></div>
                </div>
                <div>
                  <p className="font-bold">تحویل‌گیرنده (نماینده / راننده)</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">نام، امضا و شماره تماس</p>
                  <div className="h-8 mt-1"></div>
                </div>
                <div>
                  <p className="font-bold">تاییدیه حسابداری و مدیریت</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">مهر و امضای شرکت</p>
                  <div className="h-8 mt-1"></div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center gap-2 pt-2 border-t border-slate-800 no-print">
              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>در صفحه پرینت مرورگر، برای خروجی پی‌دی‌اف گزینه <strong>Save as PDF</strong> یا <strong>ذخیره به عنوان PDF</strong> را انتخاب نمایید.</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setShowPrintModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
                >
                  بستن پنجره
                </button>
                <button
                  type="button"
                  onClick={handleExportKardexPdf}
                  disabled={isExportingPdf}
                  className="px-4 py-2 text-xs font-bold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 rounded-xl flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                >
                  <Download className={`w-4 h-4 ${isExportingPdf ? 'animate-bounce' : ''}`} />
                  <span>{isExportingPdf ? 'در حال تولید PDF...' : 'دانلود مستقیم PDF'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleTriggerPrint}
                  className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>ارسال به پرینتر (Print)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Import Excel File */}
      {showImportModal && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 cursor-pointer"
          onClick={() => setShowImportModal(false)}
        >
          <div
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-slate-100 cursor-default"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-slate-100">
                  ورود کاردکس از فایل اکسل (.xlsx)
                </h3>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              فایل اکسل پرشده مطابق الگوی <span className="font-bold text-amber-400">kardex_gas_blank.xlsx</span> را انتخاب کنید. ستون‌های 16 گانه به‌صورت خودکار خوانده شده و در کاردکس طرف حساب انتخابی درج و همگام‌سازی می‌شوند.
            </p>

            <form onSubmit={handleImportFile} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  طرف حساب مقصد برای بارگذاری:
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={e => handleSelectCustomer(e.target.value)}
                  className="w-full text-xs font-semibold bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                >
                  {customers.map(c => (
                    <option key={c.customer_id} value={c.customer_id}>
                      {c.name} - {c.province}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  نوع محصول و سیلندر کاردکس مقصد:
                </label>
                <select
                  value={selectedCylinderType}
                  onChange={e => setSelectedCylinderType(e.target.value as CylinderType)}
                  className="w-full text-xs font-semibold bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                >
                  {CYLINDER_TYPES.map(type => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* File Dropzone */}
              <div className="border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-xl p-6 text-center transition-colors bg-slate-950/40">
                <FileSpreadsheet className="w-10 h-10 text-slate-500 mx-auto mb-2" />
                <label className="cursor-pointer">
                  <span className="text-xs font-semibold text-emerald-400 hover:text-emerald-300">
                    انتخاب فایل اکسل کاردکس
                  </span>
                  <input
                    type="file"
                    accept=".xlsx, .xls"
                    className="hidden"
                    onChange={e => {
                      if (e.target.files && e.target.files[0]) {
                        setImportFile(e.target.files[0]);
                      }
                    }}
                  />
                </label>
                <p className="text-[11px] text-slate-500 mt-1">فرمت‌های مجاز: .xlsx یا .xls</p>

                {importFile && (
                  <div className="mt-3 p-2 bg-emerald-950/50 border border-emerald-800 rounded-lg text-xs text-emerald-300 flex items-center justify-between">
                    <span>فایل انتخاب‌شده: <strong>{importFile.name}</strong></span>
                    <span className="text-[10px] text-slate-400">
                      ({Math.round(importFile.size / 1024)} KB)
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={!importFile || isImporting}
                  className="px-5 py-2 text-xs font-bold text-slate-950 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isImporting ? 'در حال پردازش...' : 'شروع پردازش و ثبت'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Full 57 Names Explorer */}
      {showNamesListModal && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 cursor-pointer"
          onClick={() => setShowNamesListModal(false)}
        >
          <div
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col text-slate-100 cursor-default"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-slate-100">
                  فهرست 57 طرف حساب و نمایندگی گاز مایع
                </h3>
              </div>
              <button
                onClick={() => setShowNamesListModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              برای هرکدام از طرف حساب‌های زیر، یک کاردکس اختصاصی در هر سه پایگاه داده (Cloudflare D1 و دو دیتابیس لوکال SQLite) ایجاد شده است. با کلیک بر روی دکمه «مشاهده کاردکس»، صفحه جاری به کاردکس همان طرف حساب تغییر می‌یابد.
            </p>

            <div className="overflow-y-auto flex-1 border border-slate-800 rounded-xl">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 sticky top-0">
                  <tr>
                    <th className="px-3 py-2.5">ردیف</th>
                    <th className="px-3 py-2.5">نام طرف حساب / نمایندگی</th>
                    <th className="px-3 py-2.5 font-mono">کد شناسه</th>
                    <th className="px-3 py-2.5">حوزه / استان</th>
                    <th className="px-3 py-2.5 text-center">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {customers.map((c, idx) => {
                    const isCurrent = c.customer_id === selectedCustomerId;
                    return (
                      <tr
                        key={c.customer_id}
                        className={`transition-colors ${
                          isCurrent ? 'bg-amber-500/10' : 'hover:bg-slate-800/40'
                        }`}
                      >
                        <td className="px-3 py-2 font-mono text-slate-500" dir="ltr" style={{ unicodeBidi: 'isolate' }}>
                          {toEnglishDigits(idx + 1)}
                        </td>
                        <td className="px-3 py-2 font-bold text-slate-200">
                          {c.name}
                        </td>
                        <td className="px-3 py-2 font-mono text-slate-400">
                          {c.customer_id}
                        </td>
                        <td className="px-3 py-2 text-slate-400">
                          {c.province}
                        </td>
                        <td className="px-3 py-2 text-center">
                          <button
                            onClick={() => {
                              handleSelectCustomer(c.customer_id);
                              setShowNamesListModal(false);
                            }}
                            className={`px-3 py-1 text-[11px] font-medium rounded-lg transition-colors border ${
                              isCurrent
                                ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700'
                            }`}
                          >
                            {isCurrent ? 'کاردکس فعال' : 'مشاهده کاردکس'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowNamesListModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit Kardex Entry (ویرایش سطر کاردکس - کاملاً منطبق بر ساختار و ظاهر فرم ورود/خروج) */}
      {showEditKardexModal && editingKardexEntry && (() => {
        const editIdx = customerEntries.findIndex(e => e.entry_id === editingKardexEntry.entry_id);
        const prevEntry = editIdx > 0 ? customerEntries[editIdx - 1] : null;
        const prevCyl = prevEntry ? (prevEntry.cylinder_balance || 0) : 0;
        const prevScrap = prevEntry ? (prevEntry.scrap_balance || 0) : 0;
        const prevNewValves = prevEntry ? (prevEntry.new_valve_balance || 0) : 0;
        const prevUsedValves = prevEntry ? Math.max(0, prevEntry.used_valve_balance || 0) : 0;
        const isEntryIn = (editKardexForm.cylinder_in > 0 && editKardexForm.cylinder_out === 0) || editKardexForm.transfer_sheet_number?.endsWith('i');

        return (
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 cursor-pointer animate-fadeIn"
            onClick={() => {
              setShowEditKardexModal(false);
              setEditingKardexEntry(null);
            }}
          >
            <div
              className="bg-slate-900 border border-slate-800 rounded-3xl max-w-5xl w-full p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto text-slate-100 cursor-default"
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    <Edit3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                      <span>ویرایش سند سطر کاردکس:</span>
                      <span className="text-amber-400 font-extrabold">{currentCustomer?.name}</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2 flex-wrap">
                      <span>طرف حساب: <strong className="text-slate-200">{currentCustomer?.name}</strong></span>
                      <span>•</span>
                      <span>شماره برگه: <strong className="font-mono text-amber-400">{editKardexForm.transfer_sheet_number || '-'}</strong></span>
                      <span>•</span>
                      <span>کاربر ثبت‌کننده در سیستم:</span>
                      <span className="font-mono font-bold text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/60">
                        @{editingKardexEntry.created_by_username || (SEED_USERS.find(u => u.user_id === editingKardexEntry.user_id)?.username) || 'amouei'}
                      </span>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditKardexModal(false);
                    setEditingKardexEntry(null);
                  }}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Internal Manager 1-Hour Time Window Badge if applicable */}
              {(() => {
                const perm = LocalStorageManager.checkDocumentEditPermission(currentEnv, currentUser, editingKardexEntry.created_at);
                if (perm.isInternalManager) {
                  return (
                    <div className="bg-amber-950/80 border border-amber-800/80 rounded-xl px-4 py-2.5 text-xs text-amber-200 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>
                          <strong>مهلت ویرایش مدیر داخلی (خانم کرمی): </strong>
                          امکان ویرایش تمامی اسناد تا حداکثر ۱ ساعت پس از ثبت مجاز است.
                        </span>
                      </div>
                      <span className="text-[11px] font-mono font-bold text-amber-300 bg-amber-900/90 px-2 py-0.5 rounded border border-amber-600/70 whitespace-nowrap">
                        {perm.remainingMinutes} دقیقه باقی‌مانده
                      </span>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Tabs: Entry / Exit Switcher matching Add Modal */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    if (editKardexForm.cylinder_out > 0 && editKardexForm.cylinder_in === 0) {
                      updateEditFormField('cylinder_in', editKardexForm.cylinder_out);
                      updateEditFormField('cylinder_out', 0);
                    }
                    if (editKardexForm.transfer_sheet_number?.endsWith('e')) {
                      setEditKardexForm(p => ({
                        ...p,
                        transfer_sheet_number: p.transfer_sheet_number.slice(0, -1) + 'i'
                      }));
                    }
                  }}
                  className={`py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isEntryIn
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/60 shadow-xs'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                  }`}
                >
                  <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
                  <span>سند ورودی (i)</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 border border-emerald-800 text-emerald-300 font-mono font-bold">i</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (editKardexForm.cylinder_in > 0 && editKardexForm.cylinder_out === 0) {
                      updateEditFormField('cylinder_out', editKardexForm.cylinder_in);
                      updateEditFormField('cylinder_in', 0);
                    }
                    if (editKardexForm.transfer_sheet_number?.endsWith('i')) {
                      setEditKardexForm(p => ({
                        ...p,
                        transfer_sheet_number: p.transfer_sheet_number.slice(0, -1) + 'e'
                      }));
                    }
                  }}
                  className={`py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    !isEntryIn
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/60 shadow-xs'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4 text-amber-400" />
                  <span>سند خروجی (e)</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950 border border-amber-800 text-amber-300 font-mono font-bold">e</span>
                </button>
              </div>

              <form onSubmit={handleSaveEditKardex} className="space-y-4">
                {/* Row 1: Date and Transfer Sheet Number */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start bg-slate-950/40 p-3.5 rounded-2xl border border-slate-800/70">
                  {/* Date Picker (5 cols) */}
                  <div className="md:col-span-5">
                    <div className="flex items-center justify-between h-5 mb-1.5">
                      <label className="text-xs font-semibold text-slate-300">
                        تاریخ سند (شمسی) *
                      </label>
                    </div>
                    <PersianDatePicker
                      value={editKardexForm.date}
                      onChange={(d) => setEditKardexForm(prev => ({ ...prev, date: d }))}
                      required
                      placeholder={getPersianDate()}
                    />
                  </div>

                  {/* Transfer Sheet Number (7 cols) */}
                  <div className="md:col-span-7">
                    <div className="flex items-center justify-between h-5 mb-1.5">
                      <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                        <Hash className={`w-3.5 h-3.5 shrink-0 ${isEntryIn ? 'text-emerald-400' : 'text-amber-400'}`} />
                        <span>شماره برگه حواله و انتقال *</span>
                      </label>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            if (editKardexForm.transfer_sheet_number) {
                              navigator.clipboard?.writeText(editKardexForm.transfer_sheet_number);
                              showToast('شماره برگه در حافظه کپی شد', 'success');
                            }
                          }}
                          className="text-[10px] text-slate-400 hover:text-slate-200 flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 border border-slate-700 transition-colors cursor-pointer"
                          title="کپی در حافظه"
                        >
                          <Copy className="w-2.5 h-2.5" />
                          <span>کپی</span>
                        </button>
                      </div>
                    </div>
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        dir="ltr"
                        value={editKardexForm.transfer_sheet_number}
                        onChange={(e) => setEditKardexForm(prev => ({ ...prev, transfer_sheet_number: e.target.value }))}
                        className={`w-full h-[38px] text-xs font-mono font-bold tracking-wider rounded-xl px-3 bg-slate-900 border focus:outline-hidden ${
                          isEntryIn
                            ? 'border-emerald-500/60 text-emerald-300 focus:border-emerald-400'
                            : 'border-amber-500/60 text-amber-300 focus:border-amber-400'
                        }`}
                        title="شماره برگه انتقال سند"
                      />
                    </div>
                  </div>
                </div>

                {/* Cylinder Type Selection in Edit Modal */}
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <label className="block text-xs font-bold text-slate-300 mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-amber-400" />
                      <span>نوع محصول و سیلندر (کاردکس اختصاصی) *</span>
                    </span>
                    <span className="text-[11px] font-normal text-amber-400">
                      تغییر کاردکس اختصاصی این سطر
                    </span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {CYLINDER_TYPES.map((type) => {
                      const isSelected = (editKardexForm.cylinder_type || selectedCylinderType) === type;
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setEditKardexForm(prev => ({ ...prev, cylinder_type: type }))}
                          className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-amber-500/20 text-amber-300 border-2 border-amber-500 shadow-xs'
                              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                          }`}
                        >
                          <Flame className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-400' : 'text-slate-500'}`} />
                          <span>{type}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    شرح رویداد / اقلام بار *
                  </label>
                  <input
                    type="text"
                    value={editKardexForm.description}
                    onChange={(e) => setEditKardexForm(prev => ({ ...prev, description: e.target.value }))}
                    required
                    placeholder="شرح سند، راننده، ناوگان و مشخصات بارنامه..."
                    className="w-full text-xs bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-amber-500"
                  />
                </div>

                {/* Unified 15-Column Kardex Strip Layout: کاملاً منطبق بر فرم ورود و خروج */}
                <div className="space-y-2">
                  {/* Header Strip with Previous Balances */}
                  <div className="flex items-center justify-between p-2 bg-slate-950/90 rounded-xl border border-slate-800 flex-wrap gap-1.5 text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-lg font-bold flex items-center gap-1.5 ${
                        isEntryIn
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/80'
                          : 'bg-amber-950/80 text-amber-300 border border-amber-700/80'
                      }`}>
                        {isEntryIn ? <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" /> : <ArrowUpRight className="w-3.5 h-3.5 text-amber-400" />}
                        <span>{isEntryIn ? 'سند ورودی (i)' : 'سند خروجی (e)'}</span>
                      </span>
                      <span className="text-[10.5px] text-slate-400 hidden sm:inline">
                        (تمامی ۱۵ ستون کاردکس به‌صورت مستقیم در یک ردیف افقی بدون نیاز به اسکرول)
                      </span>
                    </div>

                    {/* Previous Balances Pills */}
                    <div className="flex items-center gap-1.5 font-mono text-[10.5px] flex-wrap">
                      <span className="text-slate-400 font-sans text-[10px]">مانده‌های سطر قبل:</span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-950/70 text-emerald-300 border border-emerald-800 font-bold" title="مانده کپسول سالم سطر قبل">
                        کپسول: {formatPersianNumber(prevCyl)}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-amber-950/70 text-amber-300 border border-amber-800 font-bold" title="مانده ضایعات سطر قبل">
                        ضایعات: {formatPersianNumber(prevScrap)}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded border font-bold ${
                        prevNewValves < 0
                          ? 'bg-rose-950/80 text-rose-300 border-rose-600'
                          : 'bg-teal-950/70 text-teal-300 border-teal-800'
                      }`} title="مانده شیر نو سطر قبل">
                        شیر نو: {formatPersianNumber(prevNewValves)}
                      </span>
                      <span className="px-1.5 py-0.5 rounded border font-bold bg-cyan-950/70 text-cyan-300 border-cyan-800" title="مانده شیر کهنه سطر قبل (حداقل ۰)">
                        شیر کهنه: {formatPersianNumber(Math.max(0, prevUsedValves))}
                      </span>
                    </div>
                  </div>

                  {/* 15-Column Table Strip (نمای فشرده و کاردکس بدون اسکرول) */}
                  <div className="rounded-xl border border-slate-700/80 bg-slate-950/90 shadow-xl overflow-x-auto">
                    <table className="w-full table-fixed border-collapse text-center">
                      <thead>
                        {/* Level 1: Category Groups matching Kardex */}
                        <tr className="text-[9.5px] font-bold border-b border-slate-700">
                          <th colSpan={7} className="py-1 px-1 bg-blue-950/40 text-blue-300 border-x border-slate-700">
                            <div className="flex items-center justify-center gap-1">
                              <Flame className="w-3 h-3 text-blue-400 shrink-0" />
                              <span className="truncate">کپسول و ضایعات (خانواده سیلندر - ۷ ستون)</span>
                            </div>
                          </th>
                          <th colSpan={3} className="py-1 px-1 bg-teal-950/40 text-teal-300 border-x border-slate-700">
                            <div className="flex items-center justify-center gap-1">
                              <Layers className="w-3 h-3 text-teal-400 shrink-0" />
                              <span className="truncate">شیر نو (۳ ستون)</span>
                            </div>
                          </th>
                          <th colSpan={1} className="py-1 px-0.5 bg-slate-900 text-sky-300 border-x border-slate-700">
                            <div className="flex items-center justify-center gap-0.5">
                              <Truck className="w-3 h-3 text-sky-400 shrink-0" />
                              <span className="truncate">ارسالی</span>
                            </div>
                          </th>
                          <th colSpan={3} className="py-1 px-1 bg-cyan-950/40 text-cyan-300 border-x border-slate-700">
                            <div className="flex items-center justify-center gap-1">
                              <Layers className="w-3 h-3 text-cyan-400 shrink-0" />
                              <span className="truncate">شیر کهنه (۳ ستون)</span>
                            </div>
                          </th>
                          <th colSpan={1} className="py-1 px-0.5 bg-rose-950/40 text-rose-300 border-x border-slate-700">
                            <div className="flex items-center justify-center gap-0.5">
                              <Trash2 className="w-3 h-3 text-rose-400 shrink-0" />
                              <span className="truncate">معیوب</span>
                            </div>
                          </th>
                        </tr>

                        {/* Level 2: Exact Column Headers matching Kardex Table (Total 100% width) */}
                        <tr className="text-[9.5px] font-bold border-b border-slate-800 bg-slate-900/80 leading-tight">
                          {/* 1. ورودی سیلندر */}
                          <th className={`py-1 px-0.5 border-x border-slate-800 w-[7%] ${isEntryIn ? 'text-emerald-300 bg-emerald-950/40 font-black' : 'text-blue-300'}`} title="تعداد سیلندرهای ورودی">
                            ورودی سیلندر
                          </th>
                          {/* 2. خروجی سیلندر */}
                          <th className={`py-1 px-0.5 border-x border-slate-800 w-[7%] ${!isEntryIn ? 'text-rose-200 bg-rose-950/40 font-black' : 'text-rose-300'}`} title="تعداد سیلندرهای خروجی">
                            خروجی سیلندر
                          </th>
                          {/* 3. ضایعات واقعی */}
                          <th className="py-1 px-0.5 text-rose-300 border-x border-slate-800 w-[6%]" title="خروج واقعی ضایعات">
                            ضایعات واقعی
                          </th>
                          {/* 4. ضایعات سوری */}
                          <th className="py-1 px-0.5 text-amber-300 border-x border-slate-800 w-[6%]" title="خروج ضایعات سوری (کاهش سالم)">
                            ضایعات سوری
                          </th>
                          {/* 5. مانده سیلندر */}
                          <th className="py-1 px-0.5 text-emerald-300 bg-emerald-950/50 border-x border-emerald-800/80 w-[7.5%] font-black" title="محاسبه خودکار زنده مانده سیلندر">
                            مانده سیلندر
                          </th>
                          {/* 6. ضایعات ذخیره */}
                          <th className="py-1 px-0.5 text-rose-300 border-x border-slate-800 w-[6%]" title="خروج ضایعات ذخیره">
                            ضایعات ذخیره
                          </th>
                          {/* 7. مانده ضایعات */}
                          <th className="py-1 px-0.5 text-amber-300 bg-amber-950/50 border-x border-amber-800/80 w-[7.5%] font-black" title="محاسبه خودکار زنده مانده ضایعات">
                            مانده ضایعات
                          </th>

                          {/* 8. ورود شیر نو */}
                          <th className={`py-1 px-0.5 border-x border-slate-800 w-[6.5%] ${isEntryIn ? 'text-emerald-300 bg-emerald-950/30' : 'text-teal-300'}`} title="ورود شیر نو (هر عددی مجاز است)">
                            ورود شیر نو
                          </th>
                          {/* 9. خروج شیر نو */}
                          <th className="py-1 px-0.5 text-rose-300 border-x border-slate-800 w-[6.5%]" title="خروج شیر نو (= خروج سیلندر)">
                            خروج شیر نو
                          </th>
                          {/* 10. مانده شیر نو */}
                          <th className={`py-1 px-0.5 border-x w-[7.5%] font-black ${
                            editKardexForm.new_valve_balance < 0
                              ? 'text-rose-200 bg-rose-950/80 border-rose-500'
                              : 'text-teal-300 bg-teal-950/50 border-teal-800'
                          }`} title="مانده سطر قبل + ورودی - خروجی">
                            مانده شیر نو
                          </th>

                          {/* 11. ستون ارسالی */}
                          <th className="py-1 px-0.5 text-sky-300 border-x border-slate-800 w-[9%]" title="ستون ارسالی فقط متنی فاقد عدد">
                            ارسالی (متن)
                          </th>

                          {/* 12. ورود شیر کهنه */}
                          <th className="py-1 px-0.5 text-cyan-300 border-x border-slate-800 w-[6.5%]" title="ورود شیر کهنه (= ورودی سیلندر، قابل تغییر)">
                            ورود شیر کهنه
                          </th>
                          {/* 13. خروج شیر کهنه */}
                          <th className="py-1 px-0.5 text-rose-300 border-x border-slate-800 w-[6.5%]" title="خروج شیر کهنه (= خروج سیلندر، قابل تغییر)">
                            خروج شیر کهنه
                          </th>
                          {/* 14. مانده شیر کهنه */}
                          <th className="py-1 px-0.5 border-x w-[7.5%] font-black text-cyan-300 bg-cyan-950/50 border-cyan-800" title="مانده سطر قبل + ورودی - خروجی (حداقل صفر)">
                            مانده کهنه
                          </th>

                          {/* 15. معیوب */}
                          <th className="py-1 px-0.5 text-amber-300 border-x border-slate-800 w-[4.5%]" title="تعداد اقلام معیوب و داغی">
                            معیوب
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {/* Input Controls Row: تمام فیلدها کنار هم بدون اسکرول */}
                        <tr className="bg-slate-900/30">
                          {/* 1. ورودی سیلندر */}
                          <td className="p-0.5 border-x border-slate-800">
                            <input
                              type="number"
                              min="0"
                              value={editKardexForm.cylinder_in ?? 0}
                              onFocus={e => { if (e.target.value === '0') e.target.select(); }}
                              onChange={e => updateEditFormField('cylinder_in', e.target.value === '' ? 0 : Number(e.target.value))}
                              placeholder="0"
                              className={`w-full text-center text-[11px] font-mono font-bold bg-slate-900 border rounded px-0.5 py-0.5 h-7 leading-none text-blue-100 placeholder-slate-600 focus:outline-hidden ${
                                isEntryIn
                                  ? 'border-emerald-500/80 ring-1 ring-emerald-500/50 focus:border-emerald-400'
                                  : 'border-blue-600/70 focus:border-blue-400'
                              }`}
                            />
                          </td>

                          {/* 2. خروجی سیلندر */}
                          <td className="p-0.5 border-x border-slate-800">
                            <input
                              type="number"
                              min="0"
                              value={editKardexForm.cylinder_out ?? 0}
                              onFocus={e => { if (e.target.value === '0') e.target.select(); }}
                              onChange={e => updateEditFormField('cylinder_out', e.target.value === '' ? 0 : Number(e.target.value))}
                              placeholder="0"
                              className={`w-full text-center text-[11px] font-mono font-bold bg-slate-900 border rounded px-0.5 py-0.5 h-7 leading-none text-rose-100 placeholder-slate-600 focus:outline-hidden ${
                                !isEntryIn
                                  ? 'border-rose-500 ring-1 ring-rose-500/50 focus:border-rose-400'
                                  : 'border-rose-600/60 focus:border-rose-400'
                              }`}
                            />
                          </td>

                          {/* 3. ضایعات واقعی */}
                          <td className="p-0.5 border-x border-slate-800">
                            <input
                              type="number"
                              min="0"
                              value={editKardexForm.scrap_out ?? 0}
                              onFocus={e => { if (e.target.value === '0') e.target.select(); }}
                              onChange={e => updateEditFormField('scrap_out', e.target.value === '' ? 0 : Number(e.target.value))}
                              placeholder="0"
                              className="w-full text-center text-[11px] font-mono font-bold bg-slate-900 border border-slate-700 rounded px-0.5 py-0.5 h-7 leading-none text-slate-100 placeholder-slate-600 focus:outline-hidden focus:border-rose-400"
                            />
                          </td>

                          {/* 4. ضایعات سوری */}
                          <td className="p-0.5 border-x border-slate-800">
                            <input
                              type="number"
                              min="0"
                              value={editKardexForm.scrap_stock_in ?? 0}
                              onFocus={e => { if (e.target.value === '0') e.target.select(); }}
                              onChange={e => updateEditFormField('scrap_stock_in', e.target.value === '' ? 0 : Number(e.target.value))}
                              placeholder="0"
                              className="w-full text-center text-[11px] font-mono font-bold bg-slate-900 border border-amber-600/60 rounded px-0.5 py-0.5 h-7 leading-none text-amber-100 placeholder-slate-600 focus:outline-hidden focus:border-amber-400"
                            />
                          </td>

                          {/* 5. مانده سیلندر (محاسبه خودکار زنده) */}
                          <td className="p-0.5 border-x border-emerald-800/80 bg-emerald-950/30">
                            <input
                              type="number"
                              readOnly
                              value={editKardexForm.cylinder_balance ?? 0}
                              className="w-full text-center text-[11px] font-mono font-bold bg-emerald-950/60 border border-emerald-500/70 rounded px-0.5 py-0.5 h-7 leading-none text-emerald-200 cursor-not-allowed select-all"
                              title="فرمول: مانده سطر قبل + ورودی سیلندر – خروج سیلندر – خروج ضایعات سوری"
                            />
                          </td>

                          {/* 6. ضایعات ذخیره */}
                          <td className="p-0.5 border-x border-slate-800">
                            <input
                              type="number"
                              min="0"
                              value={editKardexForm.final_scrap_out ?? 0}
                              onFocus={e => { if (e.target.value === '0') e.target.select(); }}
                              onChange={e => updateEditFormField('final_scrap_out', e.target.value === '' ? 0 : Number(e.target.value))}
                              placeholder="0"
                              className="w-full text-center text-[11px] font-mono font-bold bg-slate-900 border border-rose-700/80 rounded px-0.5 py-0.5 h-7 leading-none text-rose-100 placeholder-slate-600 focus:outline-hidden focus:border-rose-400"
                            />
                          </td>

                          {/* 7. مانده ضایعات (محاسبه خودکار زنده) */}
                          <td className="p-0.5 border-x border-amber-800/80 bg-amber-950/30">
                            <input
                              type="number"
                              readOnly
                              value={editKardexForm.scrap_balance ?? 0}
                              className="w-full text-center text-[11px] font-mono font-bold bg-amber-950/60 border border-amber-500/70 rounded px-0.5 py-0.5 h-7 leading-none text-amber-200 cursor-not-allowed select-all"
                              title="فرمول: مانده ضایعات سطر قبل + خروج ضایعات سوری – خروج واقعی ضایعات – خروج ضایعات ذخیره"
                            />
                          </td>

                          {/* 8. ورود شیر نو */}
                          <td className="p-0.5 border-x border-slate-800">
                            <input
                              type="number"
                              min="0"
                              value={editKardexForm.new_valve_in ?? 0}
                              onFocus={e => { if (e.target.value === '0') e.target.select(); }}
                              onChange={e => updateEditFormField('new_valve_in', e.target.value === '' ? 0 : Number(e.target.value))}
                              placeholder="0"
                              className="w-full text-center text-[11px] font-mono font-bold bg-slate-900 border border-teal-600/70 rounded px-0.5 py-0.5 h-7 leading-none text-teal-100 placeholder-slate-600 focus:outline-hidden focus:border-teal-400"
                            />
                          </td>

                          {/* 9. خروج شیر نو */}
                          <td className="p-0.5 border-x border-slate-800">
                            <input
                              type="number"
                              min="0"
                              value={editKardexForm.new_valve_out ?? 0}
                              onFocus={e => { if (e.target.value === '0') e.target.select(); }}
                              onChange={e => updateEditFormField('new_valve_out', e.target.value === '' ? 0 : Number(e.target.value))}
                              placeholder="0"
                              className="w-full text-center text-[11px] font-mono font-bold bg-slate-900 border border-rose-600/60 rounded px-0.5 py-0.5 h-7 leading-none text-rose-100 placeholder-slate-600 focus:outline-hidden focus:border-rose-400"
                            />
                          </td>

                          {/* 10. مانده شیر نو (محاسبه زنده - پذیرش منفی) */}
                          <td className={`p-0.5 border-x ${
                            editKardexForm.new_valve_balance < 0 ? 'bg-rose-950/50 border-rose-600' : 'bg-teal-950/30 border-teal-800'
                          }`}>
                            <input
                              type="number"
                              readOnly
                              value={editKardexForm.new_valve_balance ?? 0}
                              className={`w-full text-center text-[11px] font-mono font-bold rounded px-0.5 py-0.5 h-7 leading-none cursor-not-allowed select-all border ${
                                editKardexForm.new_valve_balance < 0
                                  ? 'bg-rose-950/90 border-rose-500 text-rose-200 ring-1 ring-rose-500'
                                  : 'bg-teal-950/60 border-teal-500/70 text-teal-200'
                              }`}
                              title={`مانده سطر قبل (${prevNewValves}) + ورودی (${editKardexForm.new_valve_in || 0}) - خروجی (${editKardexForm.new_valve_out || 0}) = ${editKardexForm.new_valve_balance || 0}`}
                            />
                          </td>

                          {/* 11. ستون ارسالی (فقط متنی) */}
                          <td className="p-0.5 border-x border-slate-800">
                            <input
                              type="text"
                              value={editKardexForm.dispatched !== undefined && editKardexForm.dispatched !== null && String(editKardexForm.dispatched) !== '0' && String(editKardexForm.dispatched) !== '۰' ? String(editKardexForm.dispatched) : ''}
                              onChange={e => updateEditFormField('dispatched', e.target.value)}
                              placeholder="بارنامه/متن"
                              className="w-full text-center text-[10px] bg-slate-900 border border-blue-700/60 rounded px-0.5 py-0.5 h-7 leading-none text-blue-100 placeholder-slate-600 placeholder:text-[9px] focus:outline-hidden focus:border-blue-400 truncate"
                            />
                          </td>

                          {/* 12. ورود شیر کهنه */}
                          <td className="p-0.5 border-x border-slate-800">
                            <input
                              type="number"
                              min="0"
                              value={editKardexForm.used_valve_in ?? 0}
                              onFocus={e => { if (e.target.value === '0') e.target.select(); }}
                              onChange={e => updateEditFormField('used_valve_in', e.target.value === '' ? 0 : Number(e.target.value))}
                              placeholder="0"
                              className="w-full text-center text-[11px] font-mono font-bold bg-slate-900 border border-cyan-600/70 rounded px-0.5 py-0.5 h-7 leading-none text-cyan-100 placeholder-slate-600 focus:outline-hidden focus:border-cyan-400"
                            />
                          </td>

                          {/* 13. خروج شیر کهنه */}
                          <td className="p-0.5 border-x border-slate-800">
                            <input
                              type="number"
                              min="0"
                              value={editKardexForm.used_valve_out ?? 0}
                              onFocus={e => { if (e.target.value === '0') e.target.select(); }}
                              onChange={e => updateEditFormField('used_valve_out', e.target.value === '' ? 0 : Number(e.target.value))}
                              placeholder="0"
                              title="خروج شیر کهنه (سلول مستقل و بدون وابستگی)"
                              className="w-full text-center text-[11px] font-mono font-bold bg-slate-900 border border-rose-600/60 rounded px-0.5 py-0.5 h-7 leading-none text-rose-100 placeholder-slate-600 focus:outline-hidden focus:border-rose-400"
                            />
                          </td>

                          {/* 14. مانده شیر کهنه (محاسبه زنده - حداقل صفر) */}
                          <td className="p-0.5 border-x bg-cyan-950/30 border-cyan-800">
                            <input
                              type="number"
                              readOnly
                              value={Math.max(0, editKardexForm.used_valve_balance ?? 0)}
                              className="w-full text-center text-[11px] font-mono font-bold rounded px-0.5 py-0.5 h-7 leading-none cursor-not-allowed select-all border bg-cyan-950/60 border-cyan-500/70 text-cyan-200"
                              title={`مانده سطر قبل (${prevUsedValves}) + ورودی (${editKardexForm.used_valve_in || 0})${editKardexForm.used_valve_out ? ` - خروجی (${editKardexForm.used_valve_out})` : ''} = حداقل صفر (${Math.max(0, editKardexForm.used_valve_balance || 0)})`}
                            />
                          </td>

                          {/* 15. معیوب */}
                          <td className="p-0.5 border-x border-slate-800">
                            <input
                              type="number"
                              min="0"
                              value={editKardexForm.defective ?? 0}
                              onFocus={e => { if (e.target.value === '0') e.target.select(); }}
                              onChange={e => updateEditFormField('defective', e.target.value === '' ? 0 : Number(e.target.value))}
                              placeholder="0"
                              className="w-full text-center text-[11px] font-mono bg-slate-900 border border-slate-700 rounded px-0.5 py-0.5 h-7 leading-none text-slate-100 placeholder-slate-600 focus:outline-hidden focus:border-amber-400 font-bold"
                            />
                          </td>
                        </tr>

                        {/* Sub-hints Row: راهنمای فشرده فیلدها */}
                        <tr className="text-[8.5px] text-slate-700 dark:text-slate-400 bg-slate-100 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800/60 font-medium leading-tight">
                          <td className="py-0.5 px-0.5 border-x border-slate-200 dark:border-slate-800 truncate">
                            {isEntryIn ? <span className="text-emerald-600 dark:text-emerald-400 font-bold">ورودی</span> : 'افزایش'}
                          </td>
                          <td className="py-0.5 px-0.5 border-x border-slate-200 dark:border-slate-800 truncate">
                            {!isEntryIn ? <span className="text-rose-600 dark:text-rose-400 font-bold">خروجی</span> : 'کاهش'}
                          </td>
                          <td className="py-0.5 px-0.5 border-x border-slate-200 dark:border-slate-800 truncate">قطعی</td>
                          <td className="py-0.5 px-0.5 border-x border-slate-200 dark:border-slate-800 truncate">کاهش سالم</td>
                          <td className="py-0.5 px-0.5 border-x border-emerald-300 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold truncate">خودکار</td>
                          <td className="py-0.5 px-0.5 border-x border-slate-200 dark:border-slate-800 truncate">ذخیره</td>
                          <td className="py-0.5 px-0.5 border-x border-amber-300 dark:border-amber-900/60 text-amber-700 dark:text-amber-300 font-bold truncate">خودکار</td>
                          <td className="py-0.5 px-0.5 border-x border-slate-200 dark:border-slate-800 truncate">هر عدد</td>
                          <td className="py-0.5 px-0.5 border-x border-slate-200 dark:border-slate-800 truncate">= خروج</td>
                          <td className={`py-0.5 px-0.5 border-x font-bold truncate ${editKardexForm.new_valve_balance < 0 ? 'text-rose-600 dark:text-rose-300' : 'text-teal-700 dark:text-teal-300'}`}>
                            {editKardexForm.new_valve_balance < 0 ? '⚠️ ام‌گاز' : 'خودکار'}
                          </td>
                          <td className="py-0.5 px-0.5 border-x border-slate-200 dark:border-slate-800 text-sky-600 dark:text-sky-400 truncate">فقط متن</td>
                          <td className="py-0.5 px-0.5 border-x border-slate-200 dark:border-slate-800 truncate" title="ورودی شیر کهنه همیشه برابر ورودی سیلندر است و قابل ویرایش">= ورود</td>
                          <td className="py-0.5 px-0.5 border-x border-slate-200 dark:border-slate-800 truncate" title="خروج شیر کهنه سلول مستقل است و وابسته به خروج سیلندر نیست">مستقل</td>
                          <td className="py-0.5 px-0.5 border-x font-bold truncate text-cyan-700 dark:text-cyan-300" title="مانده شیر کهنه = مانده قبل + ورودی">
                            مانده قبل + ورود
                          </td>
                          <td className="py-0.5 px-0.5 border-x border-slate-200 dark:border-slate-800 truncate">داغی</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Negative Warning Banner if new valve balance is negative */}
                  {editKardexForm.new_valve_balance < 0 && (
                    <div className="p-2 bg-rose-950/60 border border-rose-500/70 rounded-xl flex items-start gap-2 text-rose-200 text-xs animate-pulse">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-rose-100 block text-[11px]">
                          هشدار کسر از موجودی خود ام‌گاز:
                        </strong>
                        <span className="text-[10px] text-rose-300 leading-relaxed block">
                          مانده شیر نو منفی شده است ({editKardexForm.new_valve_balance} عدد). این مقدار از موجودی خود ام‌گاز کسر خواهد شد.
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Summary Strip (خلاصه تراز سطر ثبتی کاردکس) */}
                  <div className="p-2 bg-slate-950/90 rounded-xl border border-slate-800 flex items-center justify-between text-xs flex-wrap gap-2">
                    <span className="text-slate-300 flex items-center gap-1.5 font-bold text-[11px]">
                      <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${isEntryIn ? 'text-emerald-400' : 'text-amber-400'}`} />
                      <span>خلاصه تراز سطر کاردکس:</span>
                    </span>
                    <div className="flex items-center gap-2 font-mono font-bold text-slate-200 flex-wrap text-[11px]">
                      <span className="text-blue-300">
                        ورودی: {formatPersianNumber(editKardexForm.cylinder_in || 0)}
                      </span>
                      <span className="text-slate-600">|</span>
                      <span className="text-rose-300">
                        خروجی: {formatPersianNumber(editKardexForm.cylinder_out || 0)}
                      </span>
                      <span className="text-slate-600">|</span>
                      <span className="text-emerald-300 bg-emerald-950/70 px-1.5 py-0.5 rounded border border-emerald-800">
                        مانده کپسول: {formatPersianNumber(editKardexForm.cylinder_balance || 0)}
                      </span>
                      <span className="text-slate-600">|</span>
                      <span className="text-amber-300 bg-amber-950/70 px-1.5 py-0.5 rounded border border-amber-800">
                        مانده ضایعات: {formatPersianNumber(editKardexForm.scrap_balance || 0)}
                      </span>
                      <span className="text-slate-600">|</span>
                      <span className={`px-1.5 py-0.5 rounded border ${editKardexForm.new_valve_balance < 0 ? 'text-rose-300 bg-rose-950/80 border-rose-500' : 'text-teal-300 bg-teal-950/70 border-teal-800'}`}>
                        مانده شیر نو: {formatPersianNumber(editKardexForm.new_valve_balance || 0)}
                      </span>
                      <span className="text-slate-600">|</span>
                      <span className="px-1.5 py-0.5 rounded border text-cyan-300 bg-cyan-950/70 border-cyan-800">
                        مانده شیر کهنه: {formatPersianNumber(Math.max(0, editKardexForm.used_valve_balance || 0))}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    یادداشت و ملاحظات سند:
                  </label>
                  <textarea
                    rows={2}
                    value={editKardexForm.notes}
                    onChange={(e) => setEditKardexForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full text-xs bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-amber-500 focus:outline-hidden"
                    placeholder="توضیحات تکمیلی یا علت ویرایش..."
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-800 flex-wrap">
                  <div className="text-xs text-slate-400 flex items-center gap-1.5">
                    <span className="font-medium">شماره برگه ثبت‌شده:</span>
                    <span className={`font-mono font-bold px-2 py-0.5 rounded border ${
                      isEntryIn
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        : 'bg-amber-950 text-amber-300 border-amber-800'
                    }`}>
                      {editKardexForm.transfer_sheet_number || '-'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditKardexModal(false);
                        setEditingKardexEntry(null);
                      }}
                      className="px-4 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
                    >
                      انصراف
                    </button>
                    <button
                      type="submit"
                      className={`px-5 py-2 text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer ${
                        isEntryIn
                          ? 'text-emerald-950 bg-emerald-400 hover:bg-emerald-300'
                          : 'text-amber-950 bg-amber-400 hover:bg-amber-300'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>ذخیره تغییرات سند {isEntryIn ? 'ورودی (i)' : 'خروجی (e)'}</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {/* Modal: Move to Trash Confirmation (انتقال ردیف کاردکس به سطل آشغال) */}
      {deletingEntry && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs cursor-pointer animate-fadeIn"
          onClick={() => setDeletingEntry(null)}
        >
          <div
            className="bg-slate-900 border border-rose-900/60 rounded-2xl w-full max-w-lg overflow-hidden flex flex-col shadow-2xl cursor-default"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">
                    انتقال سند کاردکس به سطل آشغال
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    قابلیت بازیابی و ریکاوری در هر زمان از بخش «سطل آشغال»
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDeletingEntry(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4 text-xs">
              {/* Document Summary Card */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between text-slate-300">
                  <span>طرف حساب: <strong className="text-amber-400">{deletingEntry.customer_name}</strong></span>
                  <span className="font-mono text-slate-400">{deletingEntry.date}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>شماره برگه: <strong className="font-mono text-indigo-300">{deletingEntry.transfer_sheet_number || '-'}</strong></span>
                  <span>کاربر ثبت: <strong className="font-mono text-slate-400">@{deletingEntry.created_by_username || 'amouei'}</strong></span>
                </div>
                <div className="text-slate-200 border-t border-slate-800/80 pt-2 text-[11px]">
                  شرح: <span className="font-medium">{deletingEntry.description}</span>
                </div>
                {/* Quantities */}
                <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono text-[11px]">
                  <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">سیلندر:</span>
                    <span className="text-blue-400 font-bold">{toPersianDigits(deletingEntry.cylinder_in > 0 ? `+${deletingEntry.cylinder_in}` : deletingEntry.cylinder_out > 0 ? `-${deletingEntry.cylinder_out}` : 0)}</span>
                  </div>
                  <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">شیر نو:</span>
                    <span className="text-emerald-400 font-bold">{toPersianDigits(deletingEntry.new_valve_in > 0 ? `+${deletingEntry.new_valve_in}` : deletingEntry.new_valve_out > 0 ? `-${deletingEntry.new_valve_out}` : 0)}</span>
                  </div>
                  <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">شیر کهنه:</span>
                    <span className="text-amber-400 font-bold">{toPersianDigits(deletingEntry.used_valve_in > 0 ? `+${deletingEntry.used_valve_in}` : deletingEntry.used_valve_out > 0 ? `-${deletingEntry.used_valve_out}` : 0)}</span>
                  </div>
                </div>
              </div>

              {/* Informative Note */}
              <div className="bg-amber-950/40 border border-amber-800/50 rounded-xl p-3 flex items-start gap-2.5 text-amber-300 text-[11px]">
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                <p className="leading-relaxed">
                  با انتقال این سند به سطل آشغال، اثر این ردیف از کاردکس خارج و مانده‌های کپسول و شیرآلات طرف حساب به‌صورت خودکار بازتراز می‌شوند. این سند حذف دائمی نمی‌شود و در هر زمان می‌توانید آن را ریکاوری نمایید.
                </p>
              </div>

              {/* Reason Input */}
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">
                  علت حذف (اختیاری):
                </label>
                <input
                  type="text"
                  value={deleteReasonInput}
                  onChange={(e) => setDeleteReasonInput(e.target.value)}
                  placeholder="مثال: اشتباه در شماره برگه، کنسلی بارنامه، ثبت دوباره..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-500 focus:border-rose-500 focus:outline-hidden text-xs"
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="px-5 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeletingEntry(null)}
                className="px-4 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleConfirmMoveToTrash}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
              >
                <Trash2 className="w-4 h-4" />
                <span>انتقال به سطل آشغال</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Kardex Recycle Bin & Recovery Center (سطل آشغال و مرکز ریکاوری اسناد کاردکس) */}
      {showTrashModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-sm cursor-pointer animate-fadeIn"
          onClick={() => setShowTrashModal(false)}
        >
          <div
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl cursor-default"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-100">
                      سطل آشغال و مرکز ریکاوری اسناد کاردکس
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold font-mono bg-rose-950 text-rose-300 border border-rose-800/80">
                      {toPersianDigits(trashedEntries.length)} سند حذف‌شده
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    اسناد حذف‌شده به تفکیک نگهداری می‌شوند و با کلیک روی «بازیابی»، فوراً به کاردکس فعال بازمی‌گردند.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowTrashModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter & Search Bar inside Trash */}
            <div className="p-4 bg-slate-950/50 border-b border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Filter toggle: Current Customer vs All Customers */}
                <div className="inline-flex rounded-xl bg-slate-900 p-1 border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setTrashCustomerFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      trashCustomerFilter === 'all'
                        ? 'bg-rose-500 text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    همه طرف‌حساب‌ها ({toPersianDigits(trashedEntries.length)})
                  </button>
                  {currentCustomer && (
                    <button
                      type="button"
                      onClick={() => setTrashCustomerFilter('current')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        trashCustomerFilter === 'current'
                          ? 'bg-rose-500 text-white shadow-xs'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      فقط «{currentCustomer.name}»
                    </button>
                  )}
                </div>
              </div>

              {/* Search & Empty Trash */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1 sm:w-60">
                  <input
                    type="text"
                    value={trashSearchQuery}
                    onChange={(e) => setTrashSearchQuery(e.target.value)}
                    placeholder="جستجو در سطل آشغال..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pr-8 pl-3 py-1.5 text-slate-200 placeholder-slate-500 focus:border-rose-500 focus:outline-hidden text-xs"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-2.5" />
                </div>

                {trashedEntries.length > 0 && (
                  <button
                    type="button"
                    onClick={handleOpenEmptyTrashModal}
                    className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 shadow-md shadow-rose-950/40"
                    title="تخلیه کامل سطل آشغال و حذف برای همیشه کلیه اسناد"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>تخلیه و حذف برای همیشه</span>
                  </button>
                )}
              </div>
            </div>

            {/* List / Table of Trashed Entries */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {filteredTrashedEntries.length === 0 ? (
                <div className="py-16 text-center text-slate-500 space-y-3">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-800/50 border border-slate-800 flex items-center justify-center text-slate-600">
                    <Trash2 className="w-7 h-7" />
                  </div>
                  <p className="text-sm font-medium text-slate-400">
                    {trashedEntries.length === 0
                      ? 'سطل آشغال خالی است. هیچ سندی به سطل آشغال منتقل نشده است.'
                      : 'هیچ موردی مطابق فیلتر یا جستجوی شما یافت نشد.'}
                  </p>
                  <p className="text-xs text-slate-500">
                    در جدول کاردکس با فشردن آیکون سطل آشغال روی هر ردیف، می‌توانید سند را به این بخش منتقل نمایید.
                  </p>
                </div>
              ) : (
                filteredTrashedEntries.map((item) => (
                  <div
                    key={item.entry_id}
                    className="bg-slate-950/70 border border-slate-800 hover:border-slate-700/80 rounded-xl p-4 transition-colors space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/70 pb-2.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-100 text-sm">
                          {item.customer_name}
                        </span>
                        {item.transfer_sheet_number && (
                          <span className="font-mono text-xs px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-800/60 font-bold">
                            برگه {item.transfer_sheet_number}
                          </span>
                        )}
                        <span className="text-xs font-mono text-slate-400">
                          تاریخ سند: {item.date}
                        </span>
                        {item.custom_item_name && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/80">
                            {item.custom_item_name}
                          </span>
                        )}
                      </div>

                      {/* Action Buttons: Restore and Permanent Delete */}
                      <div className="flex items-center gap-2 shrink-0">
                        {/* Recover / Restore Button */}
                        <button
                          type="button"
                          onClick={() => handleRestoreFromTrash(item)}
                          className="px-3 py-1.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs active:scale-95"
                          title="بازیابی و ریکاوری سند به کاردکس جاری"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>ریکاوری و بازیابی سند</span>
                        </button>

                        {/* Permanent Delete */}
                        <button
                          type="button"
                          onClick={() => handleOpenPermanentDeleteModal(item)}
                          className="px-2.5 py-1.5 text-rose-300 hover:text-white bg-rose-950/60 hover:bg-rose-800 border border-rose-800/80 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-medium"
                          title="حذف برای همیشه (غیرقابل بازگشت)"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                          <span>حذف برای همیشه</span>
                        </button>
                      </div>
                    </div>

                    {/* Middle Details: Description, Quantities, Reason */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="space-y-1">
                        <div className="text-slate-300">
                          شرح: <span className="font-medium text-slate-200">{item.description}</span>
                        </div>
                        {item.delete_reason && (
                          <div className="text-rose-300 text-[11px] bg-rose-950/40 border border-rose-900/50 rounded-lg p-1.5">
                            علت حذف: <span className="font-medium">{item.delete_reason}</span>
                          </div>
                        )}
                      </div>

                      {/* Quantities summary badges */}
                      <div className="flex items-center gap-2 flex-wrap font-mono text-[11px] md:justify-end">
                        {(item.cylinder_in > 0 || item.cylinder_out > 0) && (
                          <span className={`px-2 py-1 rounded border ${
                            item.cylinder_in > 0
                              ? 'bg-blue-950/60 border-blue-800 text-blue-300'
                              : 'bg-rose-950/60 border-rose-800 text-rose-300'
                          }`}>
                            کپسول: {item.cylinder_in > 0 ? `+${toPersianDigits(item.cylinder_in)}` : `-${toPersianDigits(item.cylinder_out)}`}
                          </span>
                        )}
                        {(item.new_valve_in > 0 || item.new_valve_out > 0) && (
                          <span className="px-2 py-1 rounded bg-emerald-950/60 border border-emerald-800 text-emerald-300">
                            شیر نو: {item.new_valve_in > 0 ? `+${toPersianDigits(item.new_valve_in)}` : `-${toPersianDigits(item.new_valve_out)}`}
                          </span>
                        )}
                        {(item.used_valve_in > 0 || item.used_valve_out > 0) && (
                          <span className="px-2 py-1 rounded bg-amber-950/60 border border-amber-800 text-amber-300">
                            شیر کهنه: {item.used_valve_in > 0 ? `+${toPersianDigits(item.used_valve_in)}` : `-${toPersianDigits(item.used_valve_out)}`}
                          </span>
                        )}
                        {item.scrap_out > 0 && (
                          <span className="px-2 py-1 rounded bg-rose-950/60 border border-rose-800 text-rose-300">
                            خروج ضایعات: {toPersianDigits(item.scrap_out)}
                          </span>
                        )}
                        {(item.scrap_stock_in || 0) > 0 && (
                          <span className="px-2 py-1 rounded bg-amber-950/60 border border-amber-800 text-amber-300">
                            ذخیره ضایعات: {toPersianDigits(item.scrap_stock_in)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Metadata Footer: Deleted At & User */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-900">
                      <span>حذف شده توسط: <strong className="text-slate-400">@{item.deleted_by || 'system'}</strong></span>
                      {item.deleted_at && (
                        <span>زمان انتقال به سطل: <span className="font-mono">{new Date(item.deleted_at).toLocaleString('fa-IR')}</span></span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
              <span>
                تعداد کل اسناد سطل آشغال: <strong className="text-slate-200 font-mono">{toPersianDigits(trashedEntries.length)}</strong>
              </span>
              <div className="flex items-center gap-2">
                {trashedEntries.length > 0 && (
                  <button
                    type="button"
                    onClick={handleOpenEmptyTrashModal}
                    className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-md shadow-rose-950/40"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>تخلیه سطل و حذف برای همیشه</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowTrashModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
                >
                  بستن
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Empty Trash Completely / تخلیه کامل سطل آشغال و حذف برای همیشه */}
      {showEmptyTrashConfirmModal && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setShowEmptyTrashConfirmModal(false)}
        >
          <div
            className="bg-slate-900 border border-rose-600/80 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden relative text-right cursor-default"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-rose-900/50 bg-rose-950/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-rose-400 font-bold text-sm">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                <span>تخلیه کامل سطل آشغال و حذف برای همیشه</span>
              </div>
              <button
                type="button"
                onClick={() => setShowEmptyTrashConfirmModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-200 space-y-2 leading-relaxed">
                <p className="font-bold text-rose-300 text-sm">
                  آیا از تخلیه کامل سطل آشغال اطمینان دارید؟
                </p>
                <p className="text-xs text-rose-200/90 leading-relaxed">
                  تعداد <strong className="text-white font-mono">{toPersianDigits(trashedEntries.length)}</strong> سند موجود در سطل آشغال <strong className="text-rose-100">برای همیشه حذف خواهند شد</strong> و این عملیات به هیچ عنوان قابل بازگشت نخواهد بود.
                </p>
              </div>

              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                کلیه مانده‌های طرف‌حساب‌ها پیش از این بازتراز شده‌اند و با این اقدام صرفاً رکوردهای بایگانی‌شده برای همیشه از پایگاه‌داده حذف خواهند شد.
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowEmptyTrashConfirmModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleExecuteEmptyTrash}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-rose-900/50 transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>بله، تخلیه و حذف برای همیشه</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Single Item Permanent Delete / حذف برای همیشه سند */}
      {entryToPermanentlyDelete && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setEntryToPermanentlyDelete(null)}
        >
          <div
            className="bg-slate-900 border border-rose-700/80 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden relative text-right cursor-default"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-rose-900/50 bg-rose-950/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-rose-400 font-bold text-sm">
                <Trash2 className="w-5 h-5 text-rose-400 shrink-0" />
                <span>حذف برای همیشه سند کاردکس</span>
              </div>
              <button
                type="button"
                onClick={() => setEntryToPermanentlyDelete(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-200 space-y-2 leading-relaxed">
                <p className="font-bold text-rose-300 text-sm">
                  آیا از حذف قطعی و همیشگی این سند اطمینان دارید؟
                </p>
                <p className="text-xs text-rose-200/90 leading-relaxed">
                  سند شماره برگه: <strong className="font-mono text-white">«{entryToPermanentlyDelete.transfer_sheet_number || entryToPermanentlyDelete.entry_id}»</strong><br />
                  مربوط به طرف‌حساب: <strong className="text-white">«{entryToPermanentlyDelete.customer_name}»</strong><br />
                  تاریخ سند: <strong className="font-mono text-white">{entryToPermanentlyDelete.date}</strong>
                </p>
                <p className="text-[11px] text-rose-300/90 pt-1.5 border-t border-rose-800/50">
                  این سند به‌صورت قطعی از سطل آشغال و پایگاه‌داده حذف خواهد شد و دیگر قابل بازیابی یا ریکاوری نخواهد بود.
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setEntryToPermanentlyDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleExecutePermanentDelete}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-rose-900/50 transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>حذف برای همیشه</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Physical Goods Entry Receipt (برگ ورود کالا - M.Gas cylinder) */}
      {showReceiptModal && (
        <GoodsEntryReceiptModal
          isOpen={showReceiptModal}
          onClose={() => {
            setShowReceiptModal(false);
            setSelectedReceiptEntry(null);
          }}
          entry={selectedReceiptEntry}
          customer={currentCustomer}
          currentEnv={currentEnv}
          currentUser={currentUser}
          onSwitchToExitForm={() => {
            setSelectedExitReceiptEntry(selectedReceiptEntry);
            setShowReceiptModal(false);
            setShowExitReceiptModal(true);
          }}
          onSaved={(receipt) => {
            triggerSeamlessRefresh();
            showToast(`برگ ورود شماره ${receipt.form_number} و ستون ارسالی (${receipt.dispatched || 0} عدد) در جدول کاردکس به‌روزرسانی شد.`, 'success');
          }}
        />
      )}

      {/* Modal: Physical Goods Exit Receipt (برگه خروج کالا - M.Gas cylinder) */}
      {showExitReceiptModal && (
        <GoodsExitReceiptModal
          isOpen={showExitReceiptModal}
          onClose={() => {
            setShowExitReceiptModal(false);
            setSelectedExitReceiptEntry(null);
          }}
          entry={selectedExitReceiptEntry}
          customer={currentCustomer}
          currentEnv={currentEnv}
          currentUser={currentUser}
          onSwitchToEntryForm={() => {
            setSelectedReceiptEntry(selectedExitReceiptEntry);
            setShowExitReceiptModal(false);
            setShowReceiptModal(true);
          }}
          onSaved={(receipt) => {
            triggerSeamlessRefresh();
            showToast(`برگه خروج شماره ${receipt.form_number} و ستون ارسالی (${receipt.dispatched || 0} عدد) در جدول کاردکس به‌روزرسانی شد.`, 'success');
          }}
        />
      )}

      {/* ======================================================================
          MODAL: DOCUMENT / ORDER DETAILS MODAL (جزئیات سفارش و سند با نمایش برجسته شماره برگه)
          درخواست کاربر: «نوشتن شماره برگه در جزئیات سفارش که در بخش عملیات قرار میدهی»
          ====================================================================== */}
      {selectedEntryForDetails && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto cursor-pointer animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedEntryForDetails(null);
          }}
        >
          <div
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-6 cursor-default text-slate-100"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 border-b border-indigo-800/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-white">جزئیات سفارش و مشخصات سند</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">کاردکس گاز طرف حساب: {currentCustomer?.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEntryForDetails(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="بستن پنجره"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-4 text-xs">
              {/* Prominent Sheet Number Card */}
              <div className="bg-gradient-to-br from-indigo-950/70 to-slate-900 border border-indigo-700/60 rounded-xl p-3.5 flex items-center justify-between gap-3 shadow-inner">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-indigo-300 block">شماره برگه حواله / سفارش:</span>
                  <span className="font-mono text-base sm:text-lg font-black text-indigo-200 tracking-wider font-mono-en" dir="ltr">
                    {selectedEntryForDetails.transfer_sheet_number || 'فاقد شماره برگه'}
                  </span>
                </div>
                {selectedEntryForDetails.transfer_sheet_number && (
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(selectedEntryForDetails.transfer_sheet_number);
                      showToast(`شماره برگه «${selectedEntryForDetails.transfer_sheet_number}» کپی شد.`, 'success');
                    }}
                    className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[11px] font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    title="کپی شماره برگه در کلیپ‌بورد"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>کپی برگه</span>
                  </button>
                )}
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-2.5 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-400 text-[11px] block">تاریخ سند:</span>
                  <span className="font-mono font-bold text-slate-200">{selectedEntryForDetails.date}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">نوع سیلندر:</span>
                  <span className="font-bold text-indigo-400">{selectedEntryForDetails.cylinder_type || selectedCylinderType}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">ورودی سیلندر:</span>
                  <span className="font-mono font-bold text-blue-400">{formatPersianNumber(selectedEntryForDetails.cylinder_in || 0)}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">خروجی سیلندر:</span>
                  <span className="font-mono font-bold text-rose-400">{formatPersianNumber(selectedEntryForDetails.cylinder_out || 0)}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">مانده سیلندر:</span>
                  <span className="font-mono font-extrabold text-emerald-300">{formatPersianNumber(selectedEntryForDetails.cylinder_balance || 0)}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">مانده ضایعات:</span>
                  <span className="font-mono font-extrabold text-amber-300">{formatPersianNumber(selectedEntryForDetails.scrap_balance || 0)}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">شیر نو (ورود / خروج / مانده):</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {formatPersianNumber(selectedEntryForDetails.new_valve_in || 0)} / {formatPersianNumber(selectedEntryForDetails.new_valve_out || 0)} / {formatPersianNumber(selectedEntryForDetails.new_valve_balance || 0)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">شیر کهنه (ورود / خروج / مانده):</span>
                  <span className="font-mono font-bold text-amber-400">
                    {formatPersianNumber(selectedEntryForDetails.used_valve_in || 0)} / {formatPersianNumber(selectedEntryForDetails.used_valve_out || 0)} / {formatPersianNumber(selectedEntryForDetails.used_valve_balance || 0)}
                  </span>
                </div>
              </div>

              {/* Description & Notes */}
              <div className="space-y-1.5 bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
                <span className="text-slate-400 text-[11px] font-bold block">شرح کامل گردش:</span>
                <p className="text-slate-200 leading-relaxed text-[11.5px]">{selectedEntryForDetails.description || 'بدون شرح'}</p>
                {selectedEntryForDetails.notes && (
                  <p className="text-slate-400 text-[11px] mt-1 pt-1 border-t border-slate-800">
                    یادداشت و ملاحظات: {selectedEntryForDetails.notes}
                  </p>
                )}
              </div>

              {/* Actions Footer */}
              <div className="pt-2 flex items-center justify-end gap-2 flex-wrap">
                {isOutgoingEntry(selectedEntryForDetails) ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedExitReceiptEntry(selectedEntryForDetails);
                      setShowExitReceiptModal(true);
                      setSelectedEntryForDetails(null);
                    }}
                    className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>برگه خروج کالا</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedReceiptEntry(selectedEntryForDetails);
                      setShowReceiptModal(true);
                      setSelectedEntryForDetails(null);
                    }}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>برگ ورود کالا</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    handleOpenEditKardex(selectedEntryForDetails);
                    setSelectedEntryForDetails(null);
                  }}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>ویرایش سند</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedEntryForDetails(null)}
                  className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  بستن
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
