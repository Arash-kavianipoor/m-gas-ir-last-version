import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  RuntimeEnvironment,
  User,
  GasProductionKardexEntry,
  ProductionCylinderType,
  PRODUCTION_CYLINDER_TYPES,
  DEFAULT_PRODUCTION_CYLINDER_TYPE,
  STANDARD_VALVE_TYPES,
  STANDARD_NUT_TYPES
} from '../types';
import { LocalStorageManager } from '../database/storage';
import {
  exportProductionKardexToXLSX,
  recalculateProductionKardexBalances,
  getSubVariantsForProduct,
  calculateSubVariantStockMap
} from '../database/production-kardex-data';
import {
  Boxes,
  Flame,
  Plus,
  Search,
  Printer,
  Trash2,
  Edit3,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Layers,
  ArrowDownLeft,
  ArrowUpRight,
  X,
  Wrench,
  ChevronDown,
  Truck,
  PackageCheck,
  FileText,
  Clock,
  UserCheck,
  ShieldAlert,
  ArrowLeft,
  Copy
} from 'lucide-react';
import { toPersianDigits, getPersianDate, formatNumberEn, generateUUID } from '../utils/persian';
import { PersianDatePicker } from './PersianDatePicker';
import { MGasOfficialLogo } from './MGasOfficialLogo';
import { GoodsExitReceiptModal } from './GoodsExitReceiptModal';

export const FACTORY_VALVE_OPTIONS = [
  'شیر 11/25/50 کیلویی',
  'شیر پیکنیک 1/1.5/3 لیتری',
  'شیر 5 و 6 کیلویی',
  'شیر نو استاندارد ام‌گاز',
  'شیر نو ۱۱ کیلویی پرسی',
  'شیر نو ۱۱ کیلویی بوتان',
  'شیر نو ۱۱ کیلویی ایران گازی',
  'شیر نو ۱۱ کیلویی لیفتراک',
  'شیر نو ۱۱ کیلویی عراقی',
  'شیر نو پیکنیک ۵ کیلویی',
  'شیر نو پیکنیک ۲ کیلویی',
  'شیر استاندارد مخزن ۲ تن',
  'شیر استاندارد مخزن ۱ تن',
  'شیر ریکشا',
  'شیر بدون سوپاپ / سوپاپ‌دار',
  'بدون شیر'
];

export const FACTORY_NUT_OPTIONS = [
  'مهره 2 کیلویی',
  'مهره 5 کیلویی',
  'مهره 11/25/50 کیلویی بوتانی',
  'مهره 11/25/50 کیلویی پرسی',
  'مهره 11/25/50 کیلویی پاساری',
  'مهره 11/25/50 کیلویی ایرانگازی',
  'مهره مخزن زاپاس',
  'مهره تمام مخزن ها',
  'مهره لیفتراکی',
  'بدون مهره'
];

interface GasProductionKardexViewProps {
  currentEnv: RuntimeEnvironment;
  currentUser: User;
  onNavigateToRepairKardex?: () => void;
  onRefresh?: () => void;
}

export const GasProductionKardexView: React.FC<GasProductionKardexViewProps> = ({
  currentEnv,
  currentUser,
  onNavigateToRepairKardex,
  onRefresh
}) => {
  // 1. Selected Product category
  const [selectedProductType, setSelectedProductType] = useState<ProductionCylinderType>(
    DEFAULT_PRODUCTION_CYLINDER_TYPE
  );

  // 2. Active sub-variant filter ('ALL' or specific sub-item like 'تپل', 'دراز', 'ریکشا', 'ساده', '1 لیتری'...)
  const [selectedSubVariant, setSelectedSubVariant] = useState<string>('استاندارد');

  // Track the chosen sub-variant for each of the products
  const [selectedSubVariantsByProduct, setSelectedSubVariantsByProduct] = useState<Record<string, string>>({
    'سیلندر 11 کیلویی': 'استاندارد',
    'سیلندر 25 کیلویی': 'استاندارد',
    'سیلندر 50 کیلویی': 'استاندارد',
    'سیلندر لیفتراکی': 'استاندارد',
    'مخزن 20 کیلویی(تپل/دراز)': 'تپل',
    'مخزن 25 کیلویی (تپل/دراز)': 'تپل',
    'مخزن 30 کیلویی(ریکشا/ساده)': 'ریکشا',
    'مخزن 35 کیلویی (ریکشا/ساده/تپل)': 'ریکشا',
    'مخزن 60 لیتری': 'استاندارد',
    'مخزن 80 لیتری': 'استاندارد',
    'مخزن 105 لیتری': 'استاندارد',
    'مخزن 125 لیتری': 'استاندارد',
    'پیکنیک 1/1.5 لیتری': '1 لیتری',
    'پیکنیک 3/5/8 کیلویی': '3 کیلویی'
  });

  // 3. Entries State
  const [allEntries, setAllEntries] = useState<GasProductionKardexEntry[]>(() => {
    return LocalStorageManager.getProductionKardexEntries(currentEnv);
  });

  // 4. Customers List for quick selection in Order registration
  const customerList = useMemo(() => {
    try {
      return LocalStorageManager.getState(currentEnv).customers || [];
    } catch {
      return [];
    }
  }, [currentEnv]);

  // 5. Search and Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [directionFilter, setDirectionFilter] = useState<'all' | 'orders' | 'completed'>('all');
  const [shiftFilter, setShiftFilter] = useState<string>('all');

  // Toggle for showing/hiding product selector and order action form (hidden by default)
  const [isFormExpanded, setIsFormExpanded] = useState<boolean>(false);

  // 6. Modals
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'NEW_ORDER' | 'COMPLETE_DELIVERY'>('NEW_ORDER');
  const [selectedOrderIdForDelivery, setSelectedOrderIdForDelivery] = useState<string>('');

  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editingEntry, setEditingEntry] = useState<GasProductionKardexEntry | null>(null);
  const [showTrashModal, setShowTrashModal] = useState<boolean>(false);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [deletingEntry, setDeletingEntry] = useState<GasProductionKardexEntry | null>(null);
  const [deleteReason, setDeleteReason] = useState<string>('');

  // Factory Exit Receipt Modal (برگه فقط خروج از کارخانه مطابق کاردکس تعمیر)
  const [showExitReceiptModal, setShowExitReceiptModal] = useState<boolean>(false);
  const [selectedProductionEntryForExitReceipt, setSelectedProductionEntryForExitReceipt] = useState<GasProductionKardexEntry | null>(null);

  // Dedicated Order Details Modal (نوشتن شماره برگه در جزئیات سفارش در بخش عملیات)
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<GasProductionKardexEntry | null>(null);

  // Helper to summarize & shorten movement descriptions for ultra-compact table display
  const summarizeProductionDescription = (desc: string | undefined, isOrder: boolean, isDelivery: boolean) => {
    if (!desc || !desc.trim()) {
      return isOrder ? 'سفارش ساخت' : (isDelivery ? 'تحویل سفارش' : 'گردش تولید');
    }
    const clean = desc.trim();
    if (clean.includes('اتمام کار و تحویل')) return 'تحویل سفارش';
    if (clean.includes('سفارش ساخت') || clean.includes('ثبت سفارش')) return 'سفارش ساخت';
    if (clean.includes('موجودی اولیه') || clean.includes('تراز اول دوره')) return 'موجودی اولیه';
    if (clean.includes('تولید')) return 'تولید محصول';
    if (clean.includes('تحویل')) return 'تحویل محصول';
    if (clean.length > 22) return clean.slice(0, 20) + '…';
    return clean;
  };

  const handleOpenExitReceipt = (entry: GasProductionKardexEntry) => {
    setSelectedProductionEntryForExitReceipt(entry);
    setShowExitReceiptModal(true);
  };

  // Notification toast
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Sync state when environment updates
  const refreshLocalState = useCallback(() => {
    const fresh = LocalStorageManager.getProductionKardexEntries(currentEnv);
    setAllEntries([...fresh]);
    onRefresh?.();
  }, [currentEnv, onRefresh]);

  useEffect(() => {
    refreshLocalState();
    const handleUpdated = () => refreshLocalState();
    window.addEventListener('mgas:db_refreshed', handleUpdated);
    return () => window.removeEventListener('mgas:db_refreshed', handleUpdated);
  }, [refreshLocalState]);

  // Real-time stock map for each product and its sub-variants
  const subVariantStockMap = useMemo(() => {
    return calculateSubVariantStockMap(allEntries);
  }, [allEntries]);

  // All active open orders that have not been fully completed/delivered yet
  const openOrders = useMemo(() => {
    return allEntries.filter(e => {
      if (e.is_deleted) return false;
      const isCompleted = e.order_status === 'COMPLETED' || (e.dispatch_out > 0 && !e.order_status);
      const isOrder =
        e.order_status === 'IN_PROGRESS' ||
        e.order_status === 'ORDER_PENDING' ||
        e.transfer_sheet_number?.startsWith('ORD-') ||
        (e.production_in > 0 && e.dispatch_out === 0 && !e.completed_at);
      return isOrder && !isCompleted;
    });
  }, [allEntries]);

  // Open orders specifically for the current active product and sub-variant
  const openOrdersForSelectedProduct = useMemo(() => {
    return openOrders.filter(e => {
      if (e.cylinder_type !== selectedProductType) return false;
      if (selectedSubVariant && selectedSubVariant !== 'ALL') {
        return (e.sub_variant || 'استاندارد') === selectedSubVariant;
      }
      return true;
    });
  }, [openOrders, selectedProductType, selectedSubVariant]);

  // 1. Form State for "ثبت سفارش جدید"
  const [orderForm, setOrderForm] = useState({
    date: getPersianDate(),
    cylinder_type: DEFAULT_PRODUCTION_CYLINDER_TYPE as ProductionCylinderType,
    sub_variant: 'استاندارد',
    order_sheet_number: `ORD-${getPersianDate().replace(/\//g, '')}-${Date.now().toString().slice(-3)}`,
    batch_number: '',
    order_quantity: 50,
    customer_name: '',
    valve_type: 'شیر نو استاندارد ام‌گاز',
    valve_type_2: 'شیر نو ۱۱ کیلویی لیفتراک',
    nut_type: 'مهره برنجی چپ‌گرد استاندارد',
    nut_type_2: 'مهره لیفتراکی',
    shift_name: 'صبح',
    supervisor: currentUser.full_name || 'مهندس عمویی',
    delivery_deadline: '',
    notes: ''
  });

  // 2. Form State for "اتمام کار و تحویل"
  const [deliveryForm, setDeliveryForm] = useState({
    date: getPersianDate(),
    delivery_sheet_number: `DSP-${getPersianDate().replace(/\//g, '')}-${Date.now().toString().slice(-3)}`,
    delivered_quantity: 50,
    defect_reject: 0,
    driver_name: '',
    plate_number: '',
    waybill_number: '',
    supervisor: currentUser.full_name || 'مهندس عمویی',
    shift_name: 'صبح',
    notes: ''
  });

  // Available sub-variants for current selected category
  const currentCategorySubVariants = useMemo(() => {
    return getSubVariantsForProduct(selectedProductType);
  }, [selectedProductType]);

  // Dynamic Nut list retrieved EXCLUSIVELY from "دسته مهره‌ها" category in warehouse catalog
  const availableNutOptions = useMemo(() => {
    const state = LocalStorageManager.getState(currentEnv);
    const nutCat = (state.categories || []).find(
      c => c.category_id === 'CAT-NUTS' || c.name.includes('مهره') || c.code === 'NUT'
    );
    const catId = nutCat ? nutCat.category_id : 'CAT-NUTS';

    // Get all products assigned to the Nuts category
    const nutProducts = (state.products || []).filter(
      p => p.category_id === catId || p.category_id === 'CAT-NUTS'
    );

    const names = nutProducts.map(p => p.name.trim()).filter(Boolean);

    // Fallback if none found
    if (names.length === 0) {
      names.push(
        'مهره 2 کیلویی',
        'مهره 5 کیلویی',
        'مهره 11/25/50 کیلویی بوتانی',
        'مهره 11/25/50 کیلویی پرسی',
        'مهره 11/25/50 کیلویی پاساری',
        'مهره 11/25/50 کیلویی ایرانگازی',
        'مهره مخزن زاپاس',
        'مهره تمام مخزن ها',
        'مهره لیفتراکی'
      );
    }

    // Always include "بدون مهره" as an option
    if (!names.includes('بدون مهره')) {
      names.push('بدون مهره');
    }

    return names;
  }, [currentEnv, allEntries]);

  // Synchronize orderForm nut_type and nut_type_2 if current values are not in availableNutOptions
  useEffect(() => {
    if (showAddModal) return; // Do not overwrite values while user is actively filling the modal
    if (availableNutOptions.length > 0) {
      setOrderForm(prev => {
        let changed = false;
        let newNut = prev.nut_type;
        let newNut2 = prev.nut_type_2;
        if (!availableNutOptions.includes(prev.nut_type)) {
          newNut = availableNutOptions[0];
          changed = true;
        }
        if (!availableNutOptions.includes(prev.nut_type_2)) {
          newNut2 = availableNutOptions.find(n => n.includes('لیفتراک')) || availableNutOptions[0];
          changed = true;
        }
        return changed ? { ...prev, nut_type: newNut, nut_type_2: newNut2 } : prev;
      });
    }
  }, [availableNutOptions, showAddModal]);

  // Synchronize orderForm defaults when product or sub-variant changes
  useEffect(() => {
    if (showAddModal) return; // CRITICAL: Never overwrite orderForm while the modal is open!
    const currentSub = selectedSubVariantsByProduct[selectedProductType] || getSubVariantsForProduct(selectedProductType)[0] || 'استاندارد';
    const isForklift = selectedProductType === 'سیلندر لیفتراکی';
    const forkliftNut = availableNutOptions.find(n => n.includes('لیفتراک')) || 'مهره لیفتراکی';
    setOrderForm(prev => ({
      ...prev,
      cylinder_type: selectedProductType,
      sub_variant: currentSub,
      valve_type: isForklift ? 'شیر نو ۱۱ کیلویی لیفتراک' : (prev.valve_type.includes('لیفتراک') ? 'شیر نو استاندارد ام‌گاز' : prev.valve_type),
      valve_type_2: isForklift ? 'شیر نو ۱۱ کیلویی لیفتراک' : prev.valve_type_2,
      nut_type: isForklift ? forkliftNut : prev.nut_type,
      nut_type_2: isForklift ? forkliftNut : prev.nut_type_2,
      order_sheet_number: `ORD-${getPersianDate().replace(/\//g, '')}-${Date.now().toString().slice(-3)}`
    }));
  }, [selectedProductType, selectedSubVariantsByProduct, showAddModal]);

  // When opening "اتمام کار و تحویل" or selecting an order, load its data into deliveryForm
  const activeOrderToDeliver = useMemo(() => {
    if (!selectedOrderIdForDelivery) {
      return openOrdersForSelectedProduct[0] || openOrders[0] || null;
    }
    return allEntries.find(e => e.entry_id === selectedOrderIdForDelivery) || null;
  }, [selectedOrderIdForDelivery, openOrdersForSelectedProduct, openOrders, allEntries]);

  useEffect(() => {
    if (activeOrderToDeliver) {
      setDeliveryForm(prev => ({
        ...prev,
        delivered_quantity: activeOrderToDeliver.order_quantity || activeOrderToDeliver.production_in || 1,
        delivery_sheet_number: `DSP-${getPersianDate().replace(/\//g, '')}-${Date.now().toString().slice(-3)}`
      }));
    }
  }, [activeOrderToDeliver]);

  // Active entries filtered by selected product (Active only, excluding trashed)
  const productEntries = useMemo(() => {
    const filtered = allEntries.filter(
      e => e.cylinder_type === selectedProductType && !e.is_deleted
    );
    const sorted = [...filtered].sort((a, b) => (a.date || '').localeCompare(b.date || ''));
    const calculated = recalculateProductionKardexBalances(sorted);

    // If a specific sub-variant is chosen, filter down to it
    if (selectedSubVariant && selectedSubVariant !== 'ALL') {
      return calculated.filter(e => (e.sub_variant || 'استاندارد') === selectedSubVariant);
    }
    return calculated;
  }, [allEntries, selectedProductType, selectedSubVariant]);

  // Trashed entries
  const trashedEntries = useMemo(() => {
    return allEntries.filter(e => e.is_deleted);
  }, [allEntries]);

  // KPI Statistics for current selected product & sub-variant
  const stats = useMemo(() => {
    const subs = getSubVariantsForProduct(selectedProductType);
    let curBal = 0;

    if (selectedSubVariant && selectedSubVariant !== 'ALL') {
      curBal = subVariantStockMap[selectedProductType]?.[selectedSubVariant] || 0;
    } else {
      curBal = subs.reduce((sum, s) => sum + (subVariantStockMap[selectedProductType]?.[s] || 0), 0);
    }

    const totalProdIn = productEntries.reduce((acc, cur) => acc + (Number(cur.production_in) || 0), 0);
    const totalDispOut = productEntries.reduce((acc, cur) => acc + (Number(cur.dispatch_out) || 0), 0);
    const totalRejects = productEntries.reduce((acc, cur) => acc + (Number(cur.defect_reject) || 0), 0);
    const pendingOrdersCount = productEntries.filter(e => e.order_status === 'IN_PROGRESS' || (e.production_in > 0 && e.dispatch_out === 0 && !e.completed_at)).length;

    return {
      currentBalance: curBal,
      totalProductionIn: totalProdIn,
      totalDispatchOut: totalDispOut,
      totalRejects,
      pendingOrdersCount,
      totalRecords: productEntries.length
    };
  }, [productEntries, selectedProductType, selectedSubVariant, subVariantStockMap]);

  // Filtered entries for table view (Search & Dropdown filters)
  const displayedEntries = useMemo(() => {
    let result = productEntries;

    if (directionFilter === 'orders') {
      result = result.filter(e => Number(e.production_in) > 0 || e.transfer_sheet_number.startsWith('ORD-'));
    } else if (directionFilter === 'completed') {
      result = result.filter(e => Number(e.dispatch_out) > 0 || e.transfer_sheet_number.startsWith('DSP-') || e.order_status === 'COMPLETED');
    }

    if (shiftFilter !== 'all') {
      result = result.filter(e => e.shift_name === shiftFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(e =>
        (e.description && e.description.toLowerCase().includes(q)) ||
        (e.customer_name && e.customer_name.toLowerCase().includes(q)) ||
        (e.sub_variant && e.sub_variant.toLowerCase().includes(q)) ||
        (e.transfer_sheet_number && e.transfer_sheet_number.toLowerCase().includes(q)) ||
        (e.reference_order_id && e.reference_order_id.toLowerCase().includes(q)) ||
        (e.batch_number && e.batch_number.toLowerCase().includes(q)) ||
        (e.supervisor && e.supervisor.toLowerCase().includes(q)) ||
        (e.destination_or_source && e.destination_or_source.toLowerCase().includes(q)) ||
        (e.notes && e.notes.toLowerCase().includes(q)) ||
        (e.date && e.date.includes(q))
      );
    }

    return result;
  }, [productEntries, directionFilter, shiftFilter, searchQuery]);

  // Handle Switch Product & Sub-Variant
  const handleSelectProduct = (type: ProductionCylinderType, subVar?: string) => {
    setSelectedProductType(type);
    const targetSub = subVar || selectedSubVariantsByProduct[type] || getSubVariantsForProduct(type)[0] || 'استاندارد';
    setSelectedSubVariant(targetSub);
    setSelectedSubVariantsByProduct(prev => ({ ...prev, [type]: targetSub }));
    showToast(`کاردکس تولید: «${type}» ${targetSub !== 'ALL' && targetSub !== 'استاندارد' ? `(مدل ${targetSub})` : ''}`);
  };

  // Open "ثبت سفارش جدید" Modal
  const handleOpenNewOrderModal = () => {
    const currentSub = selectedSubVariantsByProduct[selectedProductType] || getSubVariantsForProduct(selectedProductType)[0] || 'استاندارد';
    const isForklift = selectedProductType === 'سیلندر لیفتراکی';
    const forkliftNut = availableNutOptions.find(n => n.includes('لیفتراک')) || 'مهره لیفتراکی';
    const standardNut = availableNutOptions.find(n => n.includes('چپ‌گرد') || n.includes('استاندارد')) || availableNutOptions[0] || 'مهره برنجی چپ‌گرد استاندارد';
    setOrderForm(prev => ({
      ...prev,
      cylinder_type: selectedProductType,
      sub_variant: currentSub,
      valve_type: isForklift ? 'شیر نو ۱۱ کیلویی لیفتراک' : (prev.valve_type && !prev.valve_type.includes('لیفتراک') ? prev.valve_type : 'شیر نو استاندارد ام‌گاز'),
      valve_type_2: isForklift ? 'شیر نو ۱۱ کیلویی لیفتراک' : 'شیر نو ۱۱ کیلویی لیفتراک',
      nut_type: isForklift ? forkliftNut : (prev.nut_type && !prev.nut_type.includes('لیفتراک') ? prev.nut_type : standardNut),
      nut_type_2: isForklift ? forkliftNut : 'مهره لیفتراکی',
      order_sheet_number: `ORD-${getPersianDate().replace(/\//g, '')}-${Date.now().toString().slice(-3)}`
    }));
    setModalMode('NEW_ORDER');
    setShowAddModal(true);
  };

  // Open "اتمام کار و تحویل" Modal with strict direct validation
  const handleOpenCompleteDeliveryModal = (targetOrderId?: string) => {
    if (targetOrderId) {
      setSelectedOrderIdForDelivery(targetOrderId);
    } else {
      const bestOrder = openOrdersForSelectedProduct[0] || openOrders[0];
      setSelectedOrderIdForDelivery(bestOrder ? bestOrder.entry_id : '');
    }
    setDeliveryForm(prev => ({
      ...prev,
      delivery_sheet_number: `DSP-${getPersianDate().replace(/\//g, '')}-${Date.now().toString().slice(-3)}`
    }));
    setModalMode('COMPLETE_DELIVERY');
    setShowAddModal(true);
  };

  // 1. Submit "ثبت سفارش جدید"
  const handleSubmitNewOrder = (e: React.FormEvent) => {
    e.preventDefault();

    const orderQty = Math.max(1, Number(orderForm.order_quantity) || 1);
    const subVar = orderForm.sub_variant || 'استاندارد';
    const customer = orderForm.customer_name.trim() || 'سفارش متفرقه / نمایندگی';
    const sheetNo = orderForm.order_sheet_number.trim() || `ORD-${Date.now().toString().slice(-5)}`;
    const isForklift = orderForm.cylinder_type === 'سیلندر لیفتراکی';
    const valveType = orderForm.valve_type?.trim() || (isForklift ? 'شیر نو ۱۱ کیلویی لیفتراک' : 'شیر نو استاندارد ام‌گاز');
    const valveType2 = isForklift ? (orderForm.valve_type_2?.trim() || valveType) : undefined;
    const nutType = orderForm.nut_type?.trim() || (isForklift ? 'مهره لیفتراکی' : 'مهره برنجی چپ‌گرد استاندارد');
    const nutType2 = isForklift ? (orderForm.nut_type_2?.trim() || nutType) : undefined;

    const partsDesc = isForklift
      ? `شیرها: [۱: ${valveType}، ۲: ${valveType2}] | مهره‌ها: [۱: ${nutType}، ۲: ${nutType2}]`
      : `شیر: ${valveType} | مهره: ${nutType}`;

    const newOrderEntry: GasProductionKardexEntry = {
      entry_id: generateUUID('ORD'),
      cylinder_type: orderForm.cylinder_type,
      sub_variant: subVar,
      valve_type: valveType,
      valve_type_2: valveType2,
      nut_type: nutType,
      nut_type_2: nutType2,
      date: orderForm.date || getPersianDate(),
      description: `سفارش جدید: ساخت و تولید ${formatNumberEn(orderQty)} عدد ${orderForm.cylinder_type} (${subVar}) - ${partsDesc} - سفارش‌دهنده: ${customer}`,
      transfer_sheet_number: sheetNo,
      batch_number: orderForm.batch_number.trim(),
      order_id: sheetNo,
      order_status: 'IN_PROGRESS', // در حال ساخت و انجام
      order_quantity: orderQty,
      customer_name: customer,
      production_in: orderQty, // ورودی تیراژ سفارش به خط تولید و کاردکس
      dispatch_out: 0,
      defect_reject: 0,
      stock_balance: 0, // Recalculated
      shift_name: orderForm.shift_name,
      supervisor: orderForm.supervisor.trim() || currentUser.full_name,
      destination_or_source: customer,
      notes: [
        orderForm.notes.trim(),
        isForklift ? 'سیلندر لیفتراکی مجهز به ۲ عدد شیر و ۲ عدد مهره' : '',
        orderForm.delivery_deadline ? `مهلت تحویل: ${orderForm.delivery_deadline}` : ''
      ].filter(Boolean).join(' | '),
      user_id: currentUser.user_id,
      created_by_username: currentUser.username,
      device_id: currentUser.allowed_device_id,
      event_id: generateUUID('EVT'),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    LocalStorageManager.saveProductionKardexEntry(currentEnv, newOrderEntry, currentUser);
    setSelectedProductType(orderForm.cylinder_type);
    setSelectedSubVariant(subVar);
    setSelectedSubVariantsByProduct(prev => ({ ...prev, [orderForm.cylinder_type]: subVar }));
    setShowAddModal(false);
    refreshLocalState();
    showToast(`سفارش جدید شماره «${sheetNo}» با تیراژ ${orderQty} عدد و مشخصات ${isForklift ? '۲ شیر و ۲ مهره' : 'شیر و مهره'} با موفقیت ثبت شد.`, 'success');
  };

  // 2. Submit "اتمام کار و تحویل"
  const handleSubmitCompleteDelivery = (e: React.FormEvent) => {
    e.preventDefault();

    if (!activeOrderToDeliver) {
      alert('خطا: هیچ سفارشی جهت اتمام کار و تحویل انتخاب نشده است.');
      return;
    }

    const deliveredQty = Math.max(1, Number(deliveryForm.delivered_quantity) || 1);
    const defectQty = Math.max(0, Number(deliveryForm.defect_reject) || 0);
    const dspSheetNo = deliveryForm.delivery_sheet_number.trim() || `DSP-${Date.now().toString().slice(-5)}`;
    const customer = activeOrderToDeliver.customer_name || activeOrderToDeliver.destination_or_source || 'نمایندگی / مشتری';
    const subVar = activeOrderToDeliver.sub_variant || 'استاندارد';
    const isForklift = activeOrderToDeliver.cylinder_type === 'سیلندر لیفتراکی' || activeOrderToDeliver.cylinder_type?.includes('لیفتراک');
    const valveType = activeOrderToDeliver.valve_type || (isForklift ? 'شیر نو ۱۱ کیلویی لیفتراک' : 'شیر نو استاندارد ام‌گاز');
    const valveType2 = activeOrderToDeliver.valve_type_2 || (isForklift ? valveType : undefined);
    const nutType = activeOrderToDeliver.nut_type || (isForklift ? 'مهره لیفتراکی' : 'مهره برنجی چپ‌گرد استاندارد');
    const nutType2 = activeOrderToDeliver.nut_type_2 || (isForklift ? nutType : undefined);

    // 1. Mark the original order as COMPLETED
    const updatedOrder: GasProductionKardexEntry = {
      ...activeOrderToDeliver,
      order_status: 'COMPLETED',
      completed_at: new Date().toISOString(),
      completed_by: currentUser.full_name || currentUser.username,
      delivery_sheet_number: dspSheetNo,
      updated_at: new Date().toISOString()
    };
    LocalStorageManager.updateProductionKardexEntry(currentEnv, updatedOrder, currentUser);

    // 2. Deduct the corresponding valve and nut parts from Production Warehouse (انبار خط تولید)
    const deductionResult = LocalStorageManager.deductProductionParts(
      currentEnv,
      {
        valveType,
        valveType2,
        nutType,
        nutType2,
        quantity: deliveredQty,
        orderSheetNumber: activeOrderToDeliver.transfer_sheet_number || dspSheetNo,
        deliverySheetNumber: dspSheetNo,
        customerName: customer,
        cylinderType: activeOrderToDeliver.cylinder_type,
        actorUser: currentUser
      }
    );

    // 3. Register the Delivery & Dispatch Entry in Kardex
    const partsDescSummary = isForklift
      ? `۲ شیر (${valveType}${valveType2 && valveType2 !== valveType ? ` + ${valveType2}` : ''}) و ۲ مهره (${nutType}${nutType2 && nutType2 !== nutType ? ` + ${nutType2}` : ''})`
      : `شیر: ${valveType}، مهره: ${nutType}`;

    const deliveryEntry: GasProductionKardexEntry = {
      entry_id: generateUUID('DSP'),
      cylinder_type: activeOrderToDeliver.cylinder_type,
      sub_variant: subVar,
      valve_type: valveType,
      valve_type_2: valveType2,
      nut_type: nutType,
      nut_type_2: nutType2,
      date: deliveryForm.date || getPersianDate(),
      description: `اتمام کار و تحویل سفارش ${activeOrderToDeliver.transfer_sheet_number} به ${customer} (${partsDescSummary})`,
      transfer_sheet_number: dspSheetNo,
      batch_number: activeOrderToDeliver.batch_number || '',
      production_in: 0,
      dispatch_out: deliveredQty,
      defect_reject: defectQty,
      stock_balance: 0,
      order_id: activeOrderToDeliver.transfer_sheet_number,
      reference_order_id: activeOrderToDeliver.transfer_sheet_number,
      order_status: 'COMPLETED',
      customer_name: customer,
      shift_name: deliveryForm.shift_name,
      supervisor: deliveryForm.supervisor.trim() || currentUser.full_name,
      destination_or_source: customer,
      driver_name: deliveryForm.driver_name.trim(),
      plate_number: deliveryForm.plate_number.trim(),
      waybill_number: deliveryForm.waybill_number.trim(),
      notes: [
        deliveryForm.notes.trim(),
        deliveryForm.driver_name ? `راننده: ${deliveryForm.driver_name}` : '',
        deliveryForm.plate_number ? `پلاک: ${deliveryForm.plate_number}` : '',
        deliveryForm.waybill_number ? `بارنامه: ${deliveryForm.waybill_number}` : '',
        deductionResult.success ? `کسر قطعات انبار: ${formatNumberEn(deliveredQty * (isForklift ? 2 : 1))} شیر و ${formatNumberEn(deliveredQty * (isForklift ? 2 : 1))} مهره خط تولید` : ''
      ].filter(Boolean).join(' | '),
      user_id: currentUser.user_id,
      created_by_username: currentUser.username,
      device_id: currentUser.allowed_device_id,
      event_id: generateUUID('EVT'),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    LocalStorageManager.saveProductionKardexEntry(currentEnv, deliveryEntry, currentUser);
    setShowAddModal(false);
    refreshLocalState();
    setSelectedProductionEntryForExitReceipt(deliveryEntry);
    setShowExitReceiptModal(true);
    showToast(
      isForklift
        ? `اتمام کار سفارش «${activeOrderToDeliver.transfer_sheet_number}» ثبت شد. ${formatNumberEn(deliveredQty * 2)} عدد شیر (۲ عدد به ازای هر سیلندر) و ${formatNumberEn(deliveredQty * 2)} عدد مهره از انبار خط تولید کسر گردید.`
        : `اتمام کار سفارش «${activeOrderToDeliver.transfer_sheet_number}» ثبت شد. ${formatNumberEn(deliveredQty)} عدد شیر (${valveType}) و ${formatNumberEn(deliveredQty)} عدد مهره (${nutType}) از انبار خط تولید کسر گردید.`,
      'success'
    );
  };

  // Handle Edit Entry
  const handleSaveEditEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEntry) return;

    LocalStorageManager.updateProductionKardexEntry(currentEnv, editingEntry, currentUser);
    setShowEditModal(false);
    setEditingEntry(null);
    refreshLocalState();
    showToast('ردیف کاردکس تولید با موفقیت ویرایش گردید.', 'success');
  };

  // Handle Trash Entry
  const handleConfirmTrash = () => {
    if (!deletingEntry) return;
    LocalStorageManager.trashProductionKardexEntry(currentEnv, deletingEntry.entry_id, currentUser, deleteReason || 'حذف سطر کاردکس');
    setDeletingEntry(null);
    setDeleteReason('');
    refreshLocalState();
    showToast('سند به سطل آشغال منتقل شد.', 'info');
  };

  // Handle Restore Entry
  const handleRestore = (entryId: string) => {
    LocalStorageManager.restoreProductionKardexEntry(currentEnv, entryId, currentUser);
    refreshLocalState();
    showToast('سند از سطل آشغال بازیابی شد.', 'success');
  };

  // Handle Permanently Delete Entry
  const handlePermanentDelete = (entryId: string) => {
    if (confirm('آیا از حذف دائمی این سند اطمینان دارید؟ این عمل غیرقابل بازگشت است.')) {
      LocalStorageManager.permanentlyDeleteProductionKardexEntry(currentEnv, entryId, currentUser);
      refreshLocalState();
      showToast('سند به طور دائم حذف شد.', 'info');
    }
  };

  // Excel Export Handler
  const handleExportExcel = () => {
    const exportName = selectedSubVariant && selectedSubVariant !== 'ALL'
      ? `${selectedProductType} (${selectedSubVariant})`
      : selectedProductType;
    exportProductionKardexToXLSX(exportName, productEntries);
    showToast(`فایل اکسل کاردکس تولید «${exportName}» دانلود شد.`, 'success');
  };

  return (
    <div className="space-y-4 sm:space-y-6 antialiased" dir="rtl">
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border-2 border-indigo-500 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification.message}</span>
        </div>
      )}

      {/* ======================================================================
          THE SELECTOR BOX (باکس انتخاب گر کالا با منوی دراپ‌داون زیردسته و دکمه‌های سفارش و تحویل)
          ====================================================================== */}
      <div className={`bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm transition-all duration-200 ${isFormExpanded ? 'space-y-4' : ''}`}>
        
        {/* Header of Box with Title, Active Product, Arrow Toggle and Kardex Tools */}
        <div 
          onClick={() => setIsFormExpanded(prev => !prev)}
          className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none transition-colors rounded-xl ${
            isFormExpanded 
              ? 'pb-3 border-b border-slate-200 dark:border-slate-800' 
              : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm shrink-0">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  کاردکس تولید ام گاز
                </h1>
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-extrabold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80">
                  {selectedProductType}
                </span>
                {selectedSubVariant && selectedSubVariant !== 'استاندارد' && (
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-extrabold bg-cyan-100 text-cyan-800 dark:bg-cyan-950/80 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800">
                    مدل: {selectedSubVariant === 'ALL' ? 'همه زیردسته‌ها' : selectedSubVariant}
                  </span>
                )}
                {openOrdersForSelectedProduct.length > 0 && (
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-500" />
                    <span>{toPersianDigits(openOrdersForSelectedProduct.length)} سفارش در حال انجام</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {isFormExpanded 
                  ? 'ثبت مستقیم سفارش جدید، پیگیری وضعیت ساخت و ثبت اتمام کار و تحویل نهایی' 
                  : 'فرم ثبت سفارش و انتخاب کالا در حالت عادی مخفی است. جهت باز کردن روی فلش کلیک کنید.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
            {/* Arrow Toggle Button */}
            <button
              type="button"
              onClick={() => setIsFormExpanded(prev => !prev)}
              className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/70 dark:hover:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center justify-center gap-2 border border-indigo-200 dark:border-indigo-800 transition-all shadow-xs cursor-pointer active:scale-95"
              title={isFormExpanded ? 'مخفی‌سازی فرم ثبت و انتخاب' : 'نمایش فرم ثبت و انتخاب'}
            >
              <span>{isFormExpanded ? 'مخفی‌سازی فرم' : 'نمایش فرم'}</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-300 ${
                  isFormExpanded ? 'rotate-180 text-indigo-600 dark:text-indigo-400' : 'text-indigo-600 dark:text-indigo-400'
                }`}
              />
            </button>

            <button
              type="button"
              onClick={() => setShowTrashModal(true)}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium flex items-center justify-center gap-1.5 border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
              title="سطل زباله اسناد حذف‌شده کاردکس تولید"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
              <span>سطل آشغال ({toPersianDigits(trashedEntries.length)})</span>
            </button>
          </div>
        </div>

        {/* Responsive Content: Vertical Action Buttons on one side, 10 Product Options on the other side */}
        {isFormExpanded && (
        <div className="flex flex-col xl:flex-row items-stretch gap-3 sm:gap-4 pt-1">
          
          {/* Vertical Action Buttons: ۱. ثبت سفارش جدید  ۲. اتمام کار و تحویل (با رابطه کاملاً مستقیم) */}
          <div className="w-full xl:w-56 flex flex-col gap-2.5 justify-center shrink-0">
            {/* BUTTON 1: ثبت سفارش جدید */}
            <button
              type="button"
              onClick={handleOpenNewOrderModal}
              className="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm border border-emerald-500/60 transition-colors cursor-pointer"
              title="ایجاد و ثبت سفارش ساخت و تولید جدید برای این کالا"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span>ثبت سفارش جدید</span>
            </button>

            {/* BUTTON 2: اتمام کار و تحویل */}
            <button
              type="button"
              onClick={() => handleOpenCompleteDeliveryModal()}
              className="w-full px-4 py-3 bg-amber-600 hover:bg-amber-500 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm border border-amber-500/60 transition-colors cursor-pointer relative"
              title="اتمام کار و تحویل سفارش‌های باز به مشتری یا نمایندگی"
            >
              <PackageCheck className="w-4 h-4 shrink-0" />
              <span>اتمام کار و تحویل</span>
              {openOrdersForSelectedProduct.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-white text-amber-700 text-[10px] font-black font-mono flex items-center justify-center shadow-xs">
                  {openOrdersForSelectedProduct.length}
                </span>
              )}
            </button>
          </div>

          {/* Selectable Product Cards Grid (Fully Responsive with Dropdown instead of word موجودی) */}
          <div className="flex-1 min-w-0">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-2.5">
              {PRODUCTION_CYLINDER_TYPES.map((type, idx) => {
                const isSelected = selectedProductType === type;
                const subVariants = getSubVariantsForProduct(type);
                const hasMultipleSubs = subVariants.length > 1;
                const isTank = type.includes('مخزن');
                const isPicnic = type.includes('پیکنیک');
                const cardChosenSubVariant = selectedSubVariantsByProduct[type] || subVariants[0] || 'استاندارد';

                const totalBalance = subVariants.reduce(
                  (sum, s) => sum + (subVariantStockMap[type]?.[s] || 0),
                  0
                );

                return (
                  <div
                    key={type}
                    onClick={() => handleSelectProduct(type, cardChosenSubVariant)}
                    className={`p-2.5 rounded-xl border text-right transition-all flex flex-col justify-between gap-2 cursor-pointer text-xs ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-400 shadow-md ring-2 ring-indigo-500/30'
                        : 'bg-slate-50 dark:bg-slate-950/70 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    {/* Top Row: # Index & Icon */}
                    <div className="flex items-center justify-between gap-1">
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        isSelected ? 'bg-black/30 text-indigo-100 font-bold' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}>
                        #{toPersianDigits(idx + 1)}
                      </span>
                      {isPicnic ? (
                        <Flame className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-200' : 'text-amber-500'}`} />
                      ) : isTank ? (
                        <Layers className={`w-3.5 h-3.5 ${isSelected ? 'text-cyan-200' : 'text-cyan-400'}`} />
                      ) : (
                        <Boxes className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-indigo-400'}`} />
                      )}
                    </div>

                    {/* Product Name */}
                    <div className="min-w-0">
                      <div className={`text-[11px] sm:text-xs font-bold leading-tight line-clamp-2 ${isSelected ? 'text-white font-extrabold' : 'text-slate-900 dark:text-slate-200'}`}>
                        {type}
                      </div>
                    </div>

                    {/* Dropdown Menu for Sub-Category Items (بجای کلمه موجودی) */}
                    <div
                      className="pt-1.5 border-t border-slate-200/60 dark:border-white/10"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <label className="sr-only">زیردسته کالا</label>
                      <div className="relative">
                        <select
                          value={cardChosenSubVariant}
                          onChange={(e) => {
                            e.stopPropagation();
                            const val = e.target.value;
                            setSelectedProductType(type);
                            setSelectedSubVariant(val);
                            setSelectedSubVariantsByProduct(prev => ({ ...prev, [type]: val }));
                            showToast(`کاردکس ${type}: ${val === 'ALL' ? 'همه زیردسته‌ها' : `مدل ${val}`}`);
                          }}
                          className={`w-full text-[11px] font-bold py-1 px-2 pr-2 pl-6 rounded-lg border appearance-none cursor-pointer outline-none transition-colors ${
                            isSelected
                              ? 'bg-indigo-700/90 text-white border-indigo-400 focus:ring-1 focus:ring-white'
                              : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:border-indigo-400'
                          }`}
                        >
                          {subVariants.map(sub => {
                            const subBal = subVariantStockMap[type]?.[sub] || 0;
                            return (
                              <option
                                key={sub}
                                value={sub}
                                className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-bold"
                              >
                                {sub} ({toPersianDigits(subBal)} عدد)
                              </option>
                            );
                          })}
                          {hasMultipleSubs && (
                            <option
                              value="ALL"
                              className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-bold"
                            >
                              همه مدل‌ها ({toPersianDigits(totalBalance)} عدد)
                            </option>
                          )}
                        </select>
                        <ChevronDown className={`w-3 h-3 absolute left-1.5 top-1/2 -translate-y-1/2 pointer-events-none ${
                          isSelected ? 'text-white' : 'text-slate-400'
                        }`} />
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

        </div>
        )}

      </div>

      {/* KPI Cards for the Selected Product and Sub-variant */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* Card 1: Stock Balance */}
        <div className="bg-white dark:bg-slate-900/90 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>موجودی آماده تحویل انبار</span>
            <Boxes className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-cyan-600 dark:text-cyan-400 font-mono tracking-tight">
            {formatNumberEn(stats.currentBalance)}
            <span className="text-xs font-normal text-slate-500 mr-1.5">عدد</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 truncate">
            {selectedProductType} {selectedSubVariant !== 'ALL' && `(${selectedSubVariant})`}
          </div>
        </div>

        {/* Card 2: Total Production In */}
        <div className="bg-white dark:bg-slate-900/90 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>کل سفارش‌های ورودی تولید</span>
            <ArrowDownLeft className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">
            {formatNumberEn(stats.totalProductionIn)}
            <span className="text-xs font-normal text-slate-500 mr-1.5">عدد</span>
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400/80 mt-1 flex items-center justify-between">
            <span>سفارش‌های در حال انجام:</span>
            <span className="font-mono font-bold text-amber-500">{toPersianDigits(stats.pendingOrdersCount)}</span>
          </div>
        </div>

        {/* Card 3: Total Dispatch Out */}
        <div className="bg-white dark:bg-slate-900/90 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>کل کارهای اتمام‌شده و تحویلی</span>
            <ArrowUpRight className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 font-mono tracking-tight">
            {formatNumberEn(stats.totalDispatchOut)}
            <span className="text-xs font-normal text-slate-500 mr-1.5">عدد</span>
          </div>
          <div className="text-[11px] text-amber-600 dark:text-amber-400/80 mt-1">
            تحویل قطعی با بارنامه به مشتری
          </div>
        </div>

        {/* Card 4: Defect / Scrap Rejects */}
        <div className="bg-white dark:bg-slate-900/90 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>ضایعات و رد آزمون QC</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 font-mono tracking-tight">
            {formatNumberEn(stats.totalRejects)}
            <span className="text-xs font-normal text-slate-500 mr-1.5">عدد</span>
          </div>
          <div className="text-[11px] text-rose-600 dark:text-rose-400/80 mt-1">
            اقلام معیوب یا نیازمند بازکاری
          </div>
        </div>

      </div>

      {/* Action Bar & Search / Filters */}
      <div className="bg-white dark:bg-slate-900/90 p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3 w-full">
        
        {/* Search */}
        <div className="relative flex-1 min-w-0 w-full xl:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="جستجو در سفارش‌ها، مشتری، شماره برگه، شماره بچ یا سرپرست..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl pr-9 pl-8 py-2 text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:border-indigo-500 transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white p-0.5 rounded cursor-pointer"
              title="پاک کردن جستجو"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Direction Filter & Action Buttons */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5 w-full xl:w-auto shrink-0">
          
          {/* Direction Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setDirectionFilter('all')}
              className={`w-full sm:w-auto px-2.5 sm:px-3 py-1.5 rounded-lg font-bold text-center transition-all cursor-pointer whitespace-nowrap text-xs ${
                directionFilter === 'all'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              همه گردش‌ها
            </button>
            <button
              type="button"
              onClick={() => setDirectionFilter('orders')}
              className={`w-full sm:w-auto px-2.5 sm:px-3 py-1.5 rounded-lg font-bold text-center transition-all cursor-pointer whitespace-nowrap text-xs ${
                directionFilter === 'orders'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              سفارش‌های جدید
            </button>
            <button
              type="button"
              onClick={() => setDirectionFilter('completed')}
              className={`w-full sm:w-auto px-2.5 sm:px-3 py-1.5 rounded-lg font-bold text-center transition-all cursor-pointer whitespace-nowrap text-xs ${
                directionFilter === 'completed'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              اتمام کار و تحویلی‌ها
            </button>
          </div>

          {/* Actions: Excel & Print */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleExportExcel}
              className="w-full sm:w-auto px-3 sm:px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer whitespace-nowrap active:scale-95"
              title="دانلود فایل اکسل راست به چپ کاردکس تولید"
            >
              <FileSpreadsheet className="w-4 h-4 shrink-0" />
              <span>خروجی اکسل</span>
            </button>

            <button
              type="button"
              onClick={() => setShowPrintModal(true)}
              className="w-full sm:w-auto px-3 sm:px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all cursor-pointer whitespace-nowrap active:scale-95"
              title="چاپ رسمی کاردکس تولید در قطع A4 افقی"
            >
              <Printer className="w-4 h-4 shrink-0" />
              <span>چاپ رسمی کاردکس</span>
            </button>
          </div>

        </div>

      </div>

      {/* Production Kardex Ledger Table */}
      <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        
        {/* Table Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
              دفتر کاردکس تولید: {selectedProductType}
              {selectedSubVariant && selectedSubVariant !== 'ALL' && (
                <span className="text-cyan-600 dark:text-cyan-400 mr-1.5">
                  ({selectedSubVariant})
                </span>
              )}
            </h3>
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-right border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-950/80 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 font-bold text-[11px]">
                <th className="px-1.5 py-2.5 w-8 sm:w-9 text-center">ردیف</th>
                <th className="col-vertical-date text-center font-bold" title="تاریخ سند">
                  <span className="vertical-text-20">تاریخ</span>
                </th>
                <th className="px-2 py-2.5 min-w-[95px]">شرح سفارش</th>
                <th className="px-1.5 py-2.5 w-24 sm:w-28 text-center bg-amber-950/10 text-amber-700 dark:text-amber-300 font-bold">
                  نوع شیر
                </th>
                <th className="px-1.5 py-2.5 w-24 sm:w-28 text-center bg-cyan-950/10 text-cyan-700 dark:text-cyan-300 font-bold" title="نوع مهره (انتخاب انحصاری از دسته مهره‌های انبار)">
                  نوع مهره
                </th>
                <th className="px-1.5 py-2.5 w-24 sm:w-28 text-center">سفارش دهنده</th>
                <th className="px-1.5 py-2.5 w-12 sm:w-14 text-center bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 font-black">
                  تیراژ
                </th>
                <th className="px-1.5 py-2.5 w-12 sm:w-14 text-center bg-amber-950/20 text-amber-700 dark:text-amber-400 font-black">
                  تحویل
                </th>
                <th className="px-1 py-2.5 w-10 sm:w-12 text-center bg-rose-950/20 text-rose-700 dark:text-rose-400 font-black">
                  رد QC
                </th>
                <th className="px-1.5 py-2.5 w-12 sm:w-14 text-center bg-cyan-950/30 text-cyan-700 dark:text-cyan-300 font-black">
                  مانده
                </th>
                <th className="px-1 py-2.5 w-9 sm:w-10 text-center bg-amber-950/20 text-amber-600 dark:text-amber-400 font-bold" title="برگه خروج کارخانه">
                  <div className="flex items-center justify-center" title="برگه خروج کارخانه">
                    <Truck className="w-4 h-4" />
                  </div>
                </th>
                <th className="px-1.5 py-2.5 w-14 sm:w-16 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
              {displayedEntries.length === 0 ? (
                <tr>
                  <td colSpan={12} className="p-8 text-center text-slate-500">
                    هیچ ردیفی برای «{selectedProductType} {selectedSubVariant !== 'ALL' ? `(${selectedSubVariant})` : ''}» یافت نشد. با دکمه «ثبت سفارش جدید» سفارش را ایجاد نمایید.
                  </td>
                </tr>
              ) : (
                displayedEntries.map((row, index) => {
                  const subLabel = row.sub_variant || 'استاندارد';
                  const isOrder = row.transfer_sheet_number?.startsWith('ORD-') || (row.production_in > 0 && row.dispatch_out === 0);
                  const isDelivery = row.transfer_sheet_number?.startsWith('DSP-') || row.dispatch_out > 0;
                  const isOrderCompleted = row.order_status === 'COMPLETED';
                  const isOrderInProgress = isOrder && !isOrderCompleted;

                  return (
                    <tr
                      key={row.entry_id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group text-[11px] sm:text-xs"
                    >
                      {/* 1. ردیف */}
                      <td className="px-1.5 py-2 text-center text-slate-500 font-mono text-[11px]">
                        {toPersianDigits(index + 1)}
                      </td>

                      {/* 2. تاریخ (عمودی برای حداقل اشغال فضا) */}
                      <td className="col-vertical-date text-center" title={`تاریخ: ${row.date}`}>
                        <div className="vertical-date-text font-mono text-slate-800 dark:text-slate-200" dir="ltr">
                          {row.date}
                        </div>
                      </td>

                      {/* 3. شرح (خلاصه و کوتاه شده - بدون شماره برگه در جدول) */}
                      <td className="px-2 py-2" title={`${row.description}${row.notes ? ` | ${row.notes}` : ''}`}>
                        <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 flex-wrap">
                          <span className="leading-snug">{summarizeProductionDescription(row.description, isOrder, isDelivery)}</span>
                          {isOrder && (
                            isOrderCompleted ? (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
                                <span>تکمیل</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                                <Clock className="w-2.5 h-2.5 text-amber-500 animate-pulse" />
                                <span>در ساخت</span>
                              </span>
                            )
                          )}
                          {isDelivery && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                              <Truck className="w-2.5 h-2.5 text-emerald-500" />
                              <span>تحویل</span>
                            </span>
                          )}
                        </div>
                        {subLabel && subLabel !== 'استاندارد' && (
                          <div className="text-[10px] text-slate-400 mt-0.5 font-sans">
                            مدل: {subLabel}
                          </div>
                        )}
                        {row.notes && (
                          <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1 font-sans">
                            {row.notes}
                          </div>
                        )}
                      </td>

                      {/* 4. نوع شیر (بدون ستون اضافه - برای لیفتراکی ۲ شیر در همان سلول مشخص می‌شود) */}
                      <td className="px-1.5 py-2 text-center">
                        {(row.cylinder_type === 'سیلندر لیفتراکی' || row.valve_type_2) ? (
                          <div className="flex flex-col gap-1 items-center justify-center">
                            <span
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/15 text-amber-900 dark:text-amber-200 border border-amber-500/30 leading-tight max-w-[105px]"
                              title={`شیر اول: ${row.valve_type || 'شیر مایع'}`}
                            >
                              <span className="text-[8px] bg-amber-600/30 text-amber-900 dark:text-amber-200 px-1 py-0.2 rounded font-black shrink-0">۱:</span>
                              <span className="truncate">{row.valve_type || 'شیر اول'}</span>
                            </span>
                            <span
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/15 text-amber-900 dark:text-amber-200 border border-amber-500/30 leading-tight max-w-[105px]"
                              title={`شیر دوم: ${row.valve_type_2 || row.valve_type || 'شیر بخار'}`}
                            >
                              <span className="text-[8px] bg-amber-600/30 text-amber-900 dark:text-amber-200 px-1 py-0.2 rounded font-black shrink-0">۲:</span>
                              <span className="truncate">{row.valve_type_2 || row.valve_type || 'شیر دوم'}</span>
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center justify-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20 leading-tight">
                            <Wrench className="w-3 h-3 text-amber-500 shrink-0" />
                            <span className="line-clamp-2 max-w-[90px]">{row.valve_type || 'شیر نو استاندارد'}</span>
                          </span>
                        )}
                      </td>

                      {/* 5. نوع مهره (بدون ستون اضافه - برای لیفتراکی ۲ مهره در همان سلول مشخص می‌شود) */}
                      <td className="px-1.5 py-2 text-center">
                        {(row.cylinder_type === 'سیلندر لیفتراکی' || row.nut_type_2) ? (
                          <div className="flex flex-col gap-1 items-center justify-center">
                            <span
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-cyan-500/15 text-cyan-900 dark:text-cyan-200 border border-cyan-500/30 leading-tight max-w-[105px]"
                              title={`مهره اول: ${row.nut_type || 'مهره لیفتراکی'}`}
                            >
                              <span className="text-[8px] bg-cyan-600/30 text-cyan-900 dark:text-cyan-200 px-1 py-0.2 rounded font-black shrink-0">۱:</span>
                              <span className="truncate">{row.nut_type || 'مهره اول'}</span>
                            </span>
                            <span
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-cyan-500/15 text-cyan-900 dark:text-cyan-200 border border-cyan-500/30 leading-tight max-w-[105px]"
                              title={`مهره دوم: ${row.nut_type_2 || row.nut_type || 'مهره لیفتراکی'}`}
                            >
                              <span className="text-[8px] bg-cyan-600/30 text-cyan-900 dark:text-cyan-200 px-1 py-0.2 rounded font-black shrink-0">۲:</span>
                              <span className="truncate">{row.nut_type_2 || row.nut_type || 'مهره دوم'}</span>
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center justify-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-800 dark:text-cyan-300 border border-cyan-500/20 leading-tight">
                            <Layers className="w-3 h-3 text-cyan-500 shrink-0" />
                            <span className="line-clamp-2 max-w-[90px]">{row.nut_type || 'مهره برنجی چپ‌گرد'}</span>
                          </span>
                        )}
                      </td>

                      {/* 6. سفارش دهنده */}
                      <td className="px-1.5 py-2 text-center">
                        <div className="font-bold text-slate-800 dark:text-slate-100 flex items-center justify-center gap-1 text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                          <span className="truncate max-w-[100px]">{row.customer_name || row.destination_or_source || 'نمایندگی / مشتری'}</span>
                        </div>
                        {row.supervisor && (
                          <div className="text-[9px] text-slate-400 mt-0.5 truncate max-w-[100px]">
                            {row.supervisor}
                          </div>
                        )}
                      </td>

                      {/* 7. تیراژ سفارش (ورودی) */}
                      <td className="px-1.5 py-2 text-center font-mono font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/10">
                        {row.production_in > 0 ? formatNumberEn(row.production_in) : '-'}
                      </td>

                      {/* 8. تحویل نهایی (خروجی) */}
                      <td className="px-1.5 py-2 text-center font-mono font-extrabold text-amber-600 dark:text-amber-400 bg-amber-50/40 dark:bg-amber-950/10">
                        {row.dispatch_out > 0 ? formatNumberEn(row.dispatch_out) : '-'}
                      </td>

                      {/* 9. رد QC */}
                      <td className="px-1 py-2 text-center font-mono font-extrabold text-rose-600 dark:text-rose-400 bg-rose-50/40 dark:bg-rose-950/10 text-[11px]">
                        {row.defect_reject > 0 ? formatNumberEn(row.defect_reject) : '-'}
                      </td>

                      {/* 10. مانده موجودی */}
                      <td className="px-1.5 py-2 text-center font-mono font-black text-cyan-700 dark:text-cyan-300 bg-cyan-50/60 dark:bg-cyan-950/20 text-xs">
                        {formatNumberEn(row.stock_balance)}
                      </td>

                      {/* 11. برگه فقط خروج از کارخانه (فقط آیکون بدون نوشته متنی) */}
                      <td className="px-1 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleOpenExitReceipt(row)}
                          className="w-7 h-7 mx-auto rounded-lg bg-amber-600 hover:bg-amber-500 text-white flex items-center justify-center shadow-xs shadow-amber-600/30 transition-all cursor-pointer active:scale-95"
                          title="صدور و چاپ برگه خروج کالا از کارخانه"
                          aria-label="صدور و چاپ برگه خروج کالا از کارخانه"
                        >
                          <Truck className="w-3.5 h-3.5 shrink-0" />
                        </button>
                      </td>

                      {/* 12. عملیات (نوشتن شماره برگه در جزئیات سفارش در بخش عملیات) */}
                      <td className="px-1.5 py-2 text-center">
                        <div className="flex flex-col items-center justify-center gap-1 opacity-90 group-hover:opacity-100">
                          {/* جزئیات سفارش با شماره برگه در بخش عملیات */}
                          <button
                            type="button"
                            onClick={() => setSelectedOrderForDetails(row)}
                            className="w-full max-w-[76px] px-1 py-0.5 rounded text-[9.5px] font-mono font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/80 dark:text-indigo-300 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-800/80 flex items-center justify-center gap-0.5 shadow-2xs transition-colors cursor-pointer"
                            title={`مشاهده جزئیات سفارش (شماره برگه: ${row.transfer_sheet_number})`}
                          >
                            <FileText className="w-2.5 h-2.5 shrink-0 text-indigo-500 dark:text-indigo-400" />
                            <span className="truncate">{row.transfer_sheet_number}</span>
                          </button>

                          {isOrderInProgress && (
                            <button
                              type="button"
                              onClick={() => handleOpenCompleteDeliveryModal(row.entry_id)}
                              className="w-full max-w-[76px] px-1 py-0.5 rounded text-[10px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-0.5 shadow-xs cursor-pointer active:scale-95"
                              title="اتمام کار و تحویل این سفارش"
                            >
                              <PackageCheck className="w-3 h-3 shrink-0" />
                              <span>تحویل</span>
                            </button>
                          )}

                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingEntry({ ...row });
                                setShowEditModal(true);
                              }}
                              className="p-1 rounded text-slate-400 hover:text-indigo-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                              title="ویرایش ردیف"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setDeletingEntry(row);
                                setDeleteReason('');
                              }}
                              className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                              title="انتقال به سطل آشغال"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================================
          MODAL: POPUP FOR 1. ثبت سفارش جدید  OR  2. اتمام کار و تحویل
          (بسته شدن حتمی با کلیک روی فضای خالی / بک‌دراپ + ارتباط کاملاً مستقیم)
          ====================================================================== */}
      {showAddModal && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto cursor-pointer"
          onClick={(e) => {
            // Close when clicking directly on the empty backdrop
            if (e.target === e.currentTarget) {
              setShowAddModal(false);
            }
          }}
        >
          <div
            className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-2xl w-full max-w-6xl shadow-2xl overflow-hidden my-6 cursor-default transition-all duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className={`p-4 text-white flex items-center justify-between border-b ${
              modalMode === 'NEW_ORDER'
                ? 'bg-gradient-to-r from-emerald-900 via-slate-900 to-indigo-950 border-emerald-700/40'
                : 'bg-gradient-to-r from-amber-900 via-slate-900 to-indigo-950 border-amber-700/40'
            }`}>
              <div className="flex items-center gap-2.5">
                {modalMode === 'NEW_ORDER' ? (
                  <Plus className="w-5 h-5 text-emerald-400" />
                ) : (
                  <PackageCheck className="w-5 h-5 text-amber-400" />
                )}
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base">
                    {modalMode === 'NEW_ORDER' ? 'ثبت سفارش جدید ساخت و تولید (درج مستقیم ردیف در کاردکس)' : 'اتمام کار و تحویل سفارش'}
                  </h3>
                  <div className="text-[11px] text-slate-300 mt-0.5">
                    کاردکس تولید ام‌گاز - نمایش ردیفی و ستونی فیلدها منطبق بر جدول کاردکس
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
                title="بستن فرم"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mode Switch Tabs (ثبت سفارش جدید / اتمام کار و تحویل) */}
            <div className="p-3 bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setModalMode('NEW_ORDER')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  modalMode === 'NEW_ORDER'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>مرحله ۱: ثبت سفارش جدید (قالب جدولی کاردکس)</span>
              </button>

              <button
                type="button"
                onClick={() => setModalMode('COMPLETE_DELIVERY')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  modalMode === 'COMPLETE_DELIVERY'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                }`}
              >
                <PackageCheck className="w-4 h-4" />
                <span>مرحله ۲: اتمام کار و تحویل</span>
              </button>
            </div>

            {/* FORM 1: ثبت سفارش جدید - کاملاً مشابه جدول کاردکس با فیلدهای کنار هم */}
            {modalMode === 'NEW_ORDER' && (
              <form onSubmit={handleSubmitNewOrder} className="p-4 sm:p-5 space-y-4 text-xs">
                {/* Kardex-Style Main Input Table */}
                <div className="bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800 p-3 sm:p-4 shadow-inner space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="font-extrabold text-sm text-slate-800 dark:text-slate-200">
                        ردیف کاردکس سفارش جدید (فیلدهای ثبت سفارش در ستون‌های کاردکس کنار هم)
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-lg border border-emerald-300 dark:border-emerald-800">
                      قالب نمایش دفتری کاردکس
                    </span>
                  </div>

                  <div className="w-full overflow-x-auto pb-1">
                    <table className="w-full text-right border-collapse text-xs min-w-[920px]">
                      <thead>
                        <tr className="bg-slate-100 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 border-b border-slate-300 dark:border-slate-700 font-bold text-[11px]">
                          <th className="px-2 py-2.5 w-12 text-center">ردیف</th>
                          <th className="px-2 py-2.5 w-20 sm:w-24 text-center">تاریخ ثبت</th>
                          <th className="px-2.5 py-2.5 min-w-[210px]">نوع و مدل محصول</th>
                          <th className="px-2 py-2.5 min-w-[170px] text-center bg-amber-950/10 text-amber-700 dark:text-amber-300 font-bold">
                            نوع شیر
                          </th>
                          <th className="px-2 py-2.5 min-w-[170px] text-center bg-cyan-950/10 text-cyan-700 dark:text-cyan-300 font-bold">
                            نوع مهره
                          </th>
                          <th className="px-2 py-2.5 min-w-[160px] text-center">سفارش‌دهنده</th>
                          <th className="px-2 py-2.5 w-24 text-center bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 font-black">
                            تیراژ سفارش
                          </th>
                          <th className="px-2 py-2.5 w-32 text-center">شماره سفارش</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-white dark:bg-slate-900/70 border-b border-slate-200 dark:border-slate-800">
                          {/* 1. ردیف */}
                          <td className="px-2 py-2.5 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                            جدید
                          </td>

                          {/* 2. تاریخ ثبت (فقط نمایش آیکون تقویم و انتخاب مودال) */}
                          <td className="px-2 py-2.5 text-center">
                            <PersianDatePicker
                              value={orderForm.date}
                              onChange={(d) => setOrderForm({ ...orderForm, date: d })}
                              iconOnly
                              asModal
                            />
                          </td>

                          {/* 3. نوع و مدل محصول */}
                          <td className="px-2.5 py-2.5">
                            <div className="space-y-1.5">
                              <select
                                value={orderForm.cylinder_type}
                                onChange={(e) => {
                                  const newType = e.target.value as ProductionCylinderType;
                                  const subs = getSubVariantsForProduct(newType);
                                  const isForklift = newType === 'سیلندر لیفتراکی';
                                  const targetSub = subs[0] || 'استاندارد';

                                  // Synchronize parent active product tab
                                  setSelectedProductType(newType);
                                  setSelectedSubVariant(targetSub);
                                  setSelectedSubVariantsByProduct(prev => ({
                                    ...prev,
                                    [newType]: targetSub
                                  }));

                                  const forkliftNut = availableNutOptions.find(n => n.includes('لیفتراک')) || 'مهره لیفتراکی';
                                  const standardNut = availableNutOptions.find(n => n.includes('چپ‌گرد') || n.includes('استاندارد')) || availableNutOptions[0] || 'مهره برنجی چپ‌گرد استاندارد';

                                  setOrderForm(prev => ({
                                    ...prev,
                                    cylinder_type: newType,
                                    sub_variant: targetSub,
                                    valve_type: isForklift
                                      ? 'شیر نو ۱۱ کیلویی لیفتراک'
                                      : (prev.valve_type && prev.valve_type.includes('لیفتراک') ? 'شیر نو استاندارد ام‌گاز' : prev.valve_type),
                                    valve_type_2: isForklift
                                      ? 'شیر نو ۱۱ کیلویی لیفتراک'
                                      : prev.valve_type_2,
                                    nut_type: isForklift
                                      ? forkliftNut
                                      : (prev.nut_type && prev.nut_type.includes('لیفتراک') ? standardNut : prev.nut_type),
                                    nut_type_2: isForklift
                                      ? forkliftNut
                                      : prev.nut_type_2
                                  }));
                                }}
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1.5 font-bold text-slate-900 dark:text-white text-xs"
                              >
                                {PRODUCTION_CYLINDER_TYPES.map(t => (
                                  <option key={t} value={t}>{t}</option>
                                ))}
                              </select>

                              <select
                                value={orderForm.sub_variant}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setSelectedSubVariant(val);
                                  setSelectedSubVariantsByProduct(prev => ({ ...prev, [orderForm.cylinder_type]: val }));
                                  setOrderForm(prev => ({ ...prev, sub_variant: val }));
                                }}
                                className="w-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-400 dark:border-indigo-800 rounded-lg px-2.5 py-1 font-bold text-indigo-900 dark:text-indigo-200 text-xs"
                              >
                                {getSubVariantsForProduct(orderForm.cylinder_type).map(sub => {
                                  const stock = subVariantStockMap[orderForm.cylinder_type]?.[sub] || 0;
                                  return (
                                    <option key={sub} value={sub}>
                                      مدل {sub} (موجودی: {toPersianDigits(stock)})
                                    </option>
                                  );
                                })}
                              </select>
                            </div>
                          </td>

                          {/* 4. نوع شیر */}
                          <td className="px-2 py-2.5 bg-amber-950/5">
                            {orderForm.cylinder_type === 'سیلندر لیفتراکی' ? (
                              <div className="space-y-1.5 text-right">
                                <div>
                                  <span className="text-[10px] text-amber-800 dark:text-amber-300 font-bold block mb-0.5">
                                    شیر ۱ (مایع):
                                  </span>
                                  <select
                                    value={orderForm.valve_type}
                                    onChange={(e) => setOrderForm({ ...orderForm, valve_type: e.target.value })}
                                    className="w-full bg-white dark:bg-slate-950 border border-amber-300 dark:border-amber-800 rounded-lg px-2 py-1 text-xs font-bold text-amber-950 dark:text-amber-200"
                                  >
                                    {FACTORY_VALVE_OPTIONS.map(v => (
                                      <option key={v} value={v}>{v}</option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <span className="text-[10px] text-amber-800 dark:text-amber-300 font-bold block mb-0.5">
                                    شیر ۲ (بخار):
                                  </span>
                                  <select
                                    value={orderForm.valve_type_2}
                                    onChange={(e) => setOrderForm({ ...orderForm, valve_type_2: e.target.value })}
                                    className="w-full bg-white dark:bg-slate-950 border border-amber-300 dark:border-amber-800 rounded-lg px-2 py-1 text-xs font-bold text-amber-950 dark:text-amber-200"
                                  >
                                    {FACTORY_VALVE_OPTIONS.map(v => (
                                      <option key={v} value={v}>{v}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                            ) : (
                              <select
                                value={orderForm.valve_type}
                                onChange={(e) => setOrderForm({ ...orderForm, valve_type: e.target.value })}
                                className="w-full bg-white dark:bg-slate-950 border border-amber-300 dark:border-amber-800 rounded-lg px-2 py-1.5 font-bold text-xs text-amber-950 dark:text-amber-200"
                              >
                                {FACTORY_VALVE_OPTIONS.map(v => (
                                  <option key={v} value={v}>{v}</option>
                                ))}
                              </select>
                            )}
                          </td>

                          {/* 5. نوع مهره */}
                          <td className="px-2 py-2.5 bg-cyan-950/5">
                            {orderForm.cylinder_type === 'سیلندر لیفتراکی' ? (
                              <div className="space-y-1.5 text-right">
                                <div>
                                  <span className="text-[10px] text-cyan-800 dark:text-cyan-300 font-bold block mb-0.5">
                                    مهره ۱:
                                  </span>
                                  <select
                                    value={orderForm.nut_type}
                                    onChange={(e) => setOrderForm({ ...orderForm, nut_type: e.target.value })}
                                    className="w-full bg-white dark:bg-slate-950 border border-cyan-300 dark:border-cyan-800 rounded-lg px-2 py-1 text-xs font-bold text-cyan-950 dark:text-cyan-200"
                                  >
                                    {availableNutOptions.map(n => (
                                      <option key={n} value={n}>{n}</option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <span className="text-[10px] text-cyan-800 dark:text-cyan-300 font-bold block mb-0.5">
                                    مهره ۲:
                                  </span>
                                  <select
                                    value={orderForm.nut_type_2}
                                    onChange={(e) => setOrderForm({ ...orderForm, nut_type_2: e.target.value })}
                                    className="w-full bg-white dark:bg-slate-950 border border-cyan-300 dark:border-cyan-800 rounded-lg px-2 py-1 text-xs font-bold text-cyan-950 dark:text-cyan-200"
                                  >
                                    {availableNutOptions.map(n => (
                                      <option key={n} value={n}>{n}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                            ) : (
                              <select
                                value={orderForm.nut_type}
                                onChange={(e) => setOrderForm({ ...orderForm, nut_type: e.target.value })}
                                className="w-full bg-white dark:bg-slate-950 border border-cyan-300 dark:border-cyan-800 rounded-lg px-2 py-1.5 font-bold text-xs text-cyan-950 dark:text-cyan-200"
                              >
                                {availableNutOptions.map(n => (
                                  <option key={n} value={n}>{n}</option>
                                ))}
                              </select>
                            )}
                          </td>

                          {/* 6. سفارش‌دهنده */}
                          <td className="px-2 py-2.5">
                            <input
                              type="text"
                              list="customers_list"
                              placeholder="نام مشتری یا سازمان..."
                              value={orderForm.customer_name}
                              onChange={(e) => setOrderForm({ ...orderForm, customer_name: e.target.value })}
                              required
                              className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 dark:text-white"
                            />
                            <datalist id="customers_list">
                              {customerList.map(c => (
                                <option key={c.customer_id} value={c.name} />
                              ))}
                            </datalist>
                          </td>

                          {/* 7. تیراژ سفارش */}
                          <td className="px-2 py-2.5 bg-emerald-950/10">
                            <input
                              type="number"
                              min="1"
                              value={orderForm.order_quantity}
                              onChange={(e) => setOrderForm({ ...orderForm, order_quantity: Number(e.target.value) || 1 })}
                              required
                              className="w-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-400 rounded-lg px-2 py-1.5 font-mono font-black text-xs text-center text-emerald-800 dark:text-emerald-300"
                            />
                          </td>

                          {/* 8. شماره سفارش */}
                          <td className="px-2 py-2.5">
                            <input
                              type="text"
                              value={orderForm.order_sheet_number}
                              onChange={(e) => setOrderForm({ ...orderForm, order_sheet_number: e.target.value })}
                              required
                              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-2 py-1.5 font-mono font-bold text-xs text-center text-indigo-600 dark:text-indigo-400"
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Complementary Kardex Attributes Strip - All Side-by-Side */}
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] text-slate-600 dark:text-slate-400 font-bold mb-1">
                        شیفت کاری:
                      </label>
                      <select
                        value={orderForm.shift_name}
                        onChange={(e) => setOrderForm({ ...orderForm, shift_name: e.target.value })}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1.5 font-bold text-xs text-slate-900 dark:text-white"
                      >
                        <option value="صبح">شیفت صبح</option>
                        <option value="عصر">شیفت عصر</option>
                        <option value="شب">شیفت شب</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] text-slate-600 dark:text-slate-400 font-bold mb-1">
                        شماره بچ خط:
                      </label>
                      <input
                        type="text"
                        placeholder="مثال: BAT-2604"
                        value={orderForm.batch_number}
                        onChange={(e) => setOrderForm({ ...orderForm, batch_number: e.target.value })}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1.5 font-mono font-bold text-xs text-slate-900 dark:text-white"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-[11px] text-slate-600 dark:text-slate-400 font-bold mb-1">
                        سرپرست سفارش:
                      </label>
                      <input
                        type="text"
                        value={orderForm.supervisor}
                        onChange={(e) => setOrderForm({ ...orderForm, supervisor: e.target.value })}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1.5 font-bold text-xs text-slate-900 dark:text-white"
                      />
                    </div>

                    <div className="sm:col-span-5">
                      <label className="block text-[11px] text-slate-600 dark:text-slate-400 font-bold mb-1">
                        توضیحات و مشخصات فنی سفارش:
                      </label>
                      <input
                        type="text"
                        placeholder="مثال: الزام تست هیدرواستاتیک ۳۰ بار، رنگ‌آمیزی استاندارد..."
                        value={orderForm.notes}
                        onChange={(e) => setOrderForm({ ...orderForm, notes: e.target.value })}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit / Cancel Buttons */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black shadow-md shadow-emerald-600/30 cursor-pointer flex items-center gap-1.5 active:scale-95 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>تایید و درج در کاردکس تولید</span>
                  </button>
                </div>
              </form>
            )}

            {/* FORM 2: اتمام کار و تحویل (رابطه مستقیم با سفارش‌های باز) */}
            {modalMode === 'COMPLETE_DELIVERY' && (
              <div className="p-4 sm:p-5 text-xs">
                
                {/* CASE A: No Open Orders Found */}
                {openOrders.length === 0 ? (
                  <div className="py-8 text-center space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 flex items-center justify-center mx-auto text-amber-600 dark:text-amber-400">
                      <Clock className="w-7 h-7" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-black text-sm text-slate-900 dark:text-white">
                        هیچ سفارش بازی برای اتمام کار و تحویل وجود ندارد!
                      </h4>
                      <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                        طبق چرخه رسمی سیستم ام‌گاز، <strong>حتماً باید ابتدا سفارش جدید ثبت شود</strong> تا بتوانید پس از ساخت، اتمام کار و تحویل آن را ثبت فرمایید.
                      </p>
                    </div>
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => setModalMode('NEW_ORDER')}
                        className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md flex items-center gap-2 mx-auto cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>ثبت سفارش جدید برای این محصول</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* CASE B: Open Orders Exist - Select Order & Complete Delivery */
                  <form onSubmit={handleSubmitCompleteDelivery} className="space-y-4">
                    
                    {/* DIRECT RELATIONSHIP: Select which pending order is being completed */}
                    <div>
                      <label className="block text-amber-700 dark:text-amber-400 font-black mb-1.5 flex items-center justify-between">
                        <span>انتخاب سفارش باز جهت اتمام کار و تحویل:</span>
                        <span className="text-[11px] font-normal text-slate-500">
                          ({toPersianDigits(openOrders.length)} سفارش در نوبت تحویل)
                        </span>
                      </label>
                      <select
                        value={selectedOrderIdForDelivery || (activeOrderToDeliver ? activeOrderToDeliver.entry_id : '')}
                        onChange={(e) => setSelectedOrderIdForDelivery(e.target.value)}
                        className="w-full bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-500 rounded-xl px-3 py-2.5 font-bold text-amber-950 dark:text-amber-200"
                        required
                      >
                        {openOrders.map(order => (
                          <option key={order.entry_id} value={order.entry_id}>
                            سفارش {order.transfer_sheet_number} | {order.cylinder_type} ({order.sub_variant || 'استاندارد'}) | {order.customer_name || order.destination_or_source} | تیراژ: {toPersianDigits(order.order_quantity || order.production_in)} عدد
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Order Information Banner */}
                    {activeOrderToDeliver && (
                      <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {activeOrderToDeliver.cylinder_type} - مدل {activeOrderToDeliver.sub_variant || 'استاندارد'}
                          </span>
                          <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                            {activeOrderToDeliver.transfer_sheet_number}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 text-xs">
                          <span>سفارش‌دهنده: <strong className="text-slate-900 dark:text-white">{activeOrderToDeliver.customer_name || activeOrderToDeliver.destination_or_source}</strong></span>
                          <span>تیراژ سفارشی: <strong className="font-mono text-emerald-600">{formatNumberEn(activeOrderToDeliver.order_quantity || activeOrderToDeliver.production_in)} عدد</strong></span>
                        </div>
                        <div className="flex items-center gap-3 pt-1.5 border-t border-slate-200 dark:border-slate-800 text-[11px] flex-wrap">
                          <span className="flex items-center gap-1 text-amber-700 dark:text-amber-300">
                            <Wrench className="w-3.5 h-3.5 text-amber-500" />
                            <span>شیر: <strong>{activeOrderToDeliver.valve_type || 'شیر نو استاندارد ام‌گاز'}</strong></span>
                          </span>
                          <span className="flex items-center gap-1 text-cyan-700 dark:text-cyan-300">
                            <Layers className="w-3.5 h-3.5 text-cyan-500" />
                            <span>مهره: <strong>{activeOrderToDeliver.nut_type || 'مهره برنجی چپ‌گرد استاندارد'}</strong></span>
                          </span>
                        </div>
                        <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-[11px] text-amber-800 dark:text-amber-300">
                          با ثبت این تحویل، تعداد {formatNumberEn(deliveryForm.delivered_quantity)} عدد شیر و {formatNumberEn(deliveryForm.delivered_quantity)} عدد مهره به صورت اتوماتیک از انبار خط تولید کسر و برگه رسمی خروج کالا از کارخانه صادر می‌گردد.
                        </div>
                      </div>
                    )}

                    {/* Delivery Details In Horizontal Kardex Grid - Side by Side */}
                    <div className="bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800 p-3.5 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-center">
                        <div>
                          <label className="block text-emerald-700 dark:text-emerald-400 font-black mb-1 text-[11px]">
                            تعداد تحویل قطعی:
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={deliveryForm.delivered_quantity}
                            onChange={(e) => setDeliveryForm({ ...deliveryForm, delivered_quantity: Number(e.target.value) || 1 })}
                            required
                            className="w-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-400 rounded-xl px-3 py-1.5 font-mono font-black text-xs text-emerald-800 dark:text-emerald-300 text-center"
                          />
                        </div>

                        <div>
                          <label className="block text-rose-700 dark:text-rose-400 font-bold mb-1 text-[11px]">
                            ضایعات / رد QC:
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={deliveryForm.defect_reject}
                            onChange={(e) => setDeliveryForm({ ...deliveryForm, defect_reject: Number(e.target.value) || 0 })}
                            className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-1.5 font-mono font-bold text-xs text-center text-slate-900 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 text-[11px]">
                            تاریخ تحویل نهایی:
                          </label>
                          <PersianDatePicker
                            value={deliveryForm.date}
                            onChange={(d) => setDeliveryForm({ ...deliveryForm, date: d })}
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 text-[11px]">
                            شماره حواله تحویل:
                          </label>
                          <input
                            type="text"
                            value={deliveryForm.delivery_sheet_number}
                            onChange={(e) => setDeliveryForm({ ...deliveryForm, delivery_sheet_number: e.target.value })}
                            required
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-1.5 font-mono font-bold text-xs text-center text-amber-600 dark:text-amber-400"
                          />
                        </div>
                      </div>

                      {/* Transport Strip - Side by Side */}
                      <div className="pt-2.5 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-5 gap-2.5 items-center">
                        <div>
                          <label className="block text-amber-900 dark:text-amber-300 font-bold mb-1 text-[10px]">
                            راننده حامل کالا:
                          </label>
                          <input
                            type="text"
                            placeholder="نام راننده"
                            value={deliveryForm.driver_name}
                            onChange={(e) => setDeliveryForm({ ...deliveryForm, driver_name: e.target.value })}
                            className="w-full bg-white dark:bg-slate-950 border border-amber-300 dark:border-amber-800 rounded-lg px-2 py-1 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-amber-900 dark:text-amber-300 font-bold mb-1 text-[10px]">
                            پلاک خودرو باربری:
                          </label>
                          <input
                            type="text"
                            placeholder="۱۲ب۴۴۵ ایران ۶۸"
                            value={deliveryForm.plate_number}
                            onChange={(e) => setDeliveryForm({ ...deliveryForm, plate_number: e.target.value })}
                            className="w-full bg-white dark:bg-slate-950 border border-amber-300 dark:border-amber-800 rounded-lg px-2 py-1 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-amber-900 dark:text-amber-300 font-bold mb-1 text-[10px]">
                            شماره بارنامه:
                          </label>
                          <input
                            type="text"
                            placeholder="BR-98442"
                            value={deliveryForm.waybill_number}
                            onChange={(e) => setDeliveryForm({ ...deliveryForm, waybill_number: e.target.value })}
                            className="w-full bg-white dark:bg-slate-950 border border-amber-300 dark:border-amber-800 rounded-lg px-2 py-1 text-xs font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 text-[10px]">
                            سرپرست بارگیری:
                          </label>
                          <input
                            type="text"
                            value={deliveryForm.supervisor}
                            onChange={(e) => setDeliveryForm({ ...deliveryForm, supervisor: e.target.value })}
                            className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-2 py-1 text-xs font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 text-[10px]">
                            شیفت کاری:
                          </label>
                          <select
                            value={deliveryForm.shift_name}
                            onChange={(e) => setDeliveryForm({ ...deliveryForm, shift_name: e.target.value })}
                            className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-2 py-1 text-xs font-bold"
                          >
                            <option value="صبح">شیفت صبح</option>
                            <option value="عصر">شیفت عصر</option>
                            <option value="شب">شیفت شب</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
                      <button
                        type="button"
                        onClick={() => setShowAddModal(false)}
                        className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold cursor-pointer"
                      >
                        انصراف
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-black shadow-md shadow-amber-600/30 cursor-pointer flex items-center gap-1.5"
                      >
                        <PackageCheck className="w-4 h-4" />
                        <span>تایید اتمام کار و ثبت تحویل کالا</span>
                      </button>
                    </div>

                  </form>
                )}

              </div>
            )}

          </div>
        </div>
      )}

      {/* ======================================================================
          MODAL: EDIT ENTRY (بسته شدن با کلیک روی فضای خالی)
          ====================================================================== */}
      {showEditModal && editingEntry && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto cursor-pointer"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowEditModal(false);
              setEditingEntry(null);
            }
          }}
        >
          <div
            className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-6 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <h3 className="font-extrabold text-sm sm:text-base flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-indigo-400" />
                <span>ویرایش ردیف کاردکس تولید</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingEntry(null);
                }}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditEntry} className="p-4 sm:p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    نوع محصول:
                  </label>
                  <input
                    type="text"
                    value={editingEntry.cylinder_type}
                    disabled
                    className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 font-bold text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-indigo-600 dark:text-indigo-400 font-bold mb-1">
                    زیردسته / مدل:
                  </label>
                  <select
                    value={editingEntry.sub_variant || 'استاندارد'}
                    onChange={(e) => setEditingEntry({ ...editingEntry, sub_variant: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 font-bold"
                  >
                    {getSubVariantsForProduct(editingEntry.cylinder_type as ProductionCylinderType).map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    تاریخ شمسی:
                  </label>
                  <PersianDatePicker
                    value={editingEntry.date}
                    onChange={(d) => setEditingEntry({ ...editingEntry, date: d })}
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    شماره برگه:
                  </label>
                  <input
                    type="text"
                    value={editingEntry.transfer_sheet_number}
                    onChange={(e) => setEditingEntry({ ...editingEntry, transfer_sheet_number: e.target.value })}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-emerald-600 dark:text-emerald-400 font-bold mb-1">
                    تیراژ سفارش:
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editingEntry.production_in}
                    onChange={(e) => setEditingEntry({ ...editingEntry, production_in: Number(e.target.value) || 0 })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 font-mono font-bold text-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-amber-600 dark:text-amber-400 font-bold mb-1">
                    تحویل قطعی:
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editingEntry.dispatch_out}
                    onChange={(e) => setEditingEntry({ ...editingEntry, dispatch_out: Number(e.target.value) || 0 })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 font-mono font-bold text-amber-600"
                  />
                </div>
                <div>
                  <label className="block text-rose-600 dark:text-rose-400 font-bold mb-1">
                    رد QC:
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editingEntry.defect_reject}
                    onChange={(e) => setEditingEntry({ ...editingEntry, defect_reject: Number(e.target.value) || 0 })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 font-mono font-bold text-rose-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  شرح عملیات / سفارش:
                </label>
                <input
                  type="text"
                  value={editingEntry.description}
                  onChange={(e) => setEditingEntry({ ...editingEntry, description: e.target.value })}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  نام مشتری / مقصد:
                </label>
                <input
                  type="text"
                  value={editingEntry.destination_or_source || editingEntry.customer_name || ''}
                  onChange={(e) => setEditingEntry({ ...editingEntry, destination_or_source: e.target.value, customer_name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 font-medium"
                />
              </div>

              {/* Valve & Nut Selection in Edit Modal */}
              {(editingEntry.cylinder_type === 'سیلندر لیفتراکی' || editingEntry.valve_type_2) ? (
                <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-800 rounded-xl space-y-3">
                  <div className="font-bold text-xs text-amber-900 dark:text-amber-300 flex items-center justify-between">
                    <span>مشخصات ۲ عدد شیر و ۲ عدد مهره لیفتراک:</span>
                    <span className="text-[10px] bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-200 px-2 py-0.5 rounded">
                      سیلندر لیفتراکی
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-amber-800 dark:text-amber-300 font-bold mb-1 text-[11px]">
                        شیر اول (مایع):
                      </label>
                      <select
                        value={editingEntry.valve_type || 'شیر نو ۱۱ کیلویی لیفتراک'}
                        onChange={(e) => setEditingEntry({ ...editingEntry, valve_type: e.target.value })}
                        className="w-full bg-white dark:bg-slate-950 border border-amber-300 dark:border-amber-800 rounded-lg px-2 py-1.5 font-bold text-xs"
                      >
                        {FACTORY_VALVE_OPTIONS.map(v => (
                          <option key={v} value={v}>{v}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-amber-800 dark:text-amber-300 font-bold mb-1 text-[11px]">
                        شیر دوم (بخار):
                      </label>
                      <select
                        value={editingEntry.valve_type_2 || editingEntry.valve_type || 'شیر نو ۱۱ کیلویی لیفتراک'}
                        onChange={(e) => setEditingEntry({ ...editingEntry, valve_type_2: e.target.value })}
                        className="w-full bg-white dark:bg-slate-950 border border-amber-300 dark:border-amber-800 rounded-lg px-2 py-1.5 font-bold text-xs"
                      >
                        {FACTORY_VALVE_OPTIONS.map(v => (
                          <option key={v} value={v}>{v}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-cyan-800 dark:text-cyan-300 font-bold mb-1 text-[11px] flex items-center justify-between">
                        <span>مهره اول:</span>
                        <span className="text-[9px] text-cyan-600 font-normal">(دسته مهره‌ها)</span>
                      </label>
                      <select
                        value={editingEntry.nut_type || availableNutOptions[0]}
                        onChange={(e) => setEditingEntry({ ...editingEntry, nut_type: e.target.value })}
                        className="w-full bg-white dark:bg-slate-950 border border-cyan-300 dark:border-cyan-800 rounded-lg px-2 py-1.5 font-bold text-xs"
                      >
                        {availableNutOptions.map(n => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-cyan-800 dark:text-cyan-300 font-bold mb-1 text-[11px] flex items-center justify-between">
                        <span>مهره دوم:</span>
                        <span className="text-[9px] text-cyan-600 font-normal">(دسته مهره‌ها)</span>
                      </label>
                      <select
                        value={editingEntry.nut_type_2 || editingEntry.nut_type || availableNutOptions[0]}
                        onChange={(e) => setEditingEntry({ ...editingEntry, nut_type_2: e.target.value })}
                        className="w-full bg-white dark:bg-slate-950 border border-cyan-300 dark:border-cyan-800 rounded-lg px-2 py-1.5 font-bold text-xs"
                      >
                        {availableNutOptions.map(n => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-amber-700 dark:text-amber-300 font-bold mb-1">
                      نوع شیر:
                    </label>
                    <select
                      value={editingEntry.valve_type || 'شیر نو استاندارد ام‌گاز'}
                      onChange={(e) => setEditingEntry({ ...editingEntry, valve_type: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 font-bold"
                    >
                      {FACTORY_VALVE_OPTIONS.map(v => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-cyan-700 dark:text-cyan-300 font-bold mb-1 flex items-center justify-between">
                      <span>نوع مهره:</span>
                      <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-normal">
                        (فقط از دسته مهره‌ها)
                      </span>
                    </label>
                    <select
                      value={editingEntry.nut_type || availableNutOptions[0]}
                      onChange={(e) => setEditingEntry({ ...editingEntry, nut_type: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 font-bold"
                    >
                      {availableNutOptions.map(n => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingEntry(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black shadow-md cursor-pointer"
                >
                  ذخیره تغییرات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================================
          MODAL: TRASH CONFIRMATION (بسته شدن با کلیک روی فضای خالی)
          ====================================================================== */}
      {deletingEntry && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-4 cursor-pointer"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setDeletingEntry(null);
            }
          }}
        >
          <div
            className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-rose-500">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                انتقال به سطل آشغال کاردکس تولید
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              آیا از انتقال برگه <strong>{deletingEntry.transfer_sheet_number}</strong> ({deletingEntry.description}) به سطل آشغال اطمینان دارید؟
            </p>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                علت حذف (جهت لاگ ممیزی):
              </label>
              <input
                type="text"
                placeholder="مثال: سند تکراری، اشتباه در ثبت..."
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-medium"
              />
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeletingEntry(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleConfirmTrash}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black shadow-md cursor-pointer"
              >
                انتقال به سطل آشغال
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================
          MODAL: RECYCLE BIN (بسته شدن با کلیک روی فضای خالی)
          ====================================================================== */}
      {showTrashModal && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto cursor-pointer"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowTrashModal(false);
            }
          }}
        >
          <div
            className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden my-6 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-rose-400" />
                <h3 className="font-extrabold text-sm sm:text-base">
                  سطل آشغال اسناد کاردکس تولید ام‌گاز ({toPersianDigits(trashedEntries.length)})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowTrashModal(false)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 max-h-[60vh] overflow-y-auto space-y-2.5">
              {trashedEntries.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  سطل آشغال خالی است و هیچ سند کاردکس تولید حذف‌شده‌ای وجود ندارد.
                </div>
              ) : (
                trashedEntries.map((row) => (
                  <div
                    key={row.entry_id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{row.transfer_sheet_number}</span>
                        <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px]">
                          {row.cylinder_type} {row.sub_variant && `(${row.sub_variant})`}
                        </span>
                        <span className="text-slate-400 font-mono text-[11px]">{row.date}</span>
                      </div>
                      <div className="text-slate-500 mt-1">{row.description}</div>
                      {row.delete_reason && (
                        <div className="text-[11px] text-rose-500 mt-0.5">علت حذف: {row.delete_reason}</div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleRestore(row.entry_id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1 cursor-pointer"
                        title="بازیابی و بازگردانی سند به جدول کاردکس"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>بازیابی</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handlePermanentDelete(row.entry_id)}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center gap-1 cursor-pointer"
                        title="حذف دائمی از پایگاه داده"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>حذف دائم</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                اسناد بازیابی‌شده بلافاصله در محاسبات مانده موجودی شرکت داده می‌شوند.
              </span>
              <button
                type="button"
                onClick={() => setShowTrashModal(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold cursor-pointer"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================
          MODAL: OFFICIAL PRINT SHEET (بسته شدن با کلیک روی فضای خالی)
          ====================================================================== */}
      {showPrintModal && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto cursor-pointer"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowPrintModal(false);
            }
          }}
        >
          <div
            className="bg-white text-slate-900 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden my-6 p-6 sm:p-8 space-y-6 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Action Bar */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 print:hidden">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-indigo-600" />
                <h3 className="font-extrabold text-base">
                  پیش‌نمایش چاپ رسمی کاردکس تولید: {selectedProductType} {selectedSubVariant !== 'ALL' && `(مدل ${selectedSubVariant})`}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Printer className="w-4 h-4" />
                  <span>ارسال به چاپگر (Print)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowPrintModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                >
                  بستن
                </button>
              </div>
            </div>

            {/* Official Print Document Content */}
            <div className="space-y-4">
              
              {/* Header Box */}
              <div className="border-2 border-slate-800 rounded-xl p-4 flex items-center justify-between">
                <div className="w-24 flex items-center justify-center">
                  <MGasOfficialLogo className="w-16 h-16" />
                </div>
                <div className="text-center space-y-1">
                  <div className="text-xs font-bold text-slate-600">شرکت صنعتی و بازرگانی ام‌گاز (سهامی خاص)</div>
                  <h2 className="text-lg font-black text-slate-900">
                    دفتر رسمی کاردکس و گردش تولید: {selectedProductType} {selectedSubVariant !== 'ALL' && `(مدل ${selectedSubVariant})`}
                  </h2>
                  <div className="text-[11px] text-slate-500">واحد کنترل سفارشات، خط تولید و تحویل به مشتریان</div>
                </div>
                <div className="w-32 text-[10px] space-y-1 text-left font-mono">
                  <div>تاریخ چاپ: {getPersianDate()}</div>
                  <div>سیستم: M-GAS WIN</div>
                  <div>صفحه: ۱ از ۱</div>
                </div>
              </div>

              {/* KPI Strip */}
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="border border-slate-300 rounded-lg p-2 bg-slate-50">
                  <div className="text-[10px] text-slate-500">کل تیراژ سفارشات</div>
                  <div className="font-mono font-black text-emerald-700 text-base">{formatNumberEn(stats.totalProductionIn)}</div>
                </div>
                <div className="border border-slate-300 rounded-lg p-2 bg-slate-50">
                  <div className="text-[10px] text-slate-500">کل تحویل قطعی</div>
                  <div className="font-mono font-black text-amber-700 text-base">{formatNumberEn(stats.totalDispatchOut)}</div>
                </div>
                <div className="border border-slate-300 rounded-lg p-2 bg-slate-50">
                  <div className="text-[10px] text-slate-500">ضایعات / رد آزمون</div>
                  <div className="font-mono font-black text-rose-700 text-base">{formatNumberEn(stats.totalRejects)}</div>
                </div>
                <div className="border-2 border-indigo-600 rounded-lg p-2 bg-indigo-50">
                  <div className="text-[10px] text-indigo-900 font-bold">مانده موجودی انبار</div>
                  <div className="font-mono font-black text-indigo-800 text-base">{formatNumberEn(stats.currentBalance)}</div>
                </div>
              </div>

              {/* Print Table */}
              <table className="w-full text-right border-collapse text-[11px] border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 font-bold">
                    <th className="p-2 border-l border-slate-300 text-center w-10">ردیف</th>
                    <th className="p-2 border-l border-slate-300 w-24 text-center">تاریخ</th>
                    <th className="p-2 border-l border-slate-300">شرح سفارش / گردش</th>
                    <th className="p-2 border-l border-slate-300 text-center w-28">نوع شیر</th>
                    <th className="p-2 border-l border-slate-300 text-center w-28">نوع مهره</th>
                    <th className="p-2 border-l border-slate-300 text-center w-32">سفارش دهنده</th>
                    <th className="p-2 border-l border-slate-300 text-center w-20">تیراژ سفارش</th>
                    <th className="p-2 border-l border-slate-300 text-center w-20">تحویل نهایی</th>
                    <th className="p-2 border-l border-slate-300 text-center w-16">رد QC</th>
                    <th className="p-2 border-l border-slate-300 text-center w-24 font-black">مانده انبار</th>
                    <th className="p-2 text-center w-20">سرپرست</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300">
                  {productEntries.map((item, idx) => (
                    <tr key={item.entry_id}>
                      <td className="p-1.5 border-l border-slate-300 text-center font-mono">{idx + 1}</td>
                      <td className="p-1.5 border-l border-slate-300 text-center font-mono">{item.date}</td>
                      <td className="p-1.5 border-l border-slate-300">{item.description}</td>
                      <td className="p-1.5 border-l border-slate-300 text-center text-[10px]">
                        {(item.cylinder_type === 'سیلندر لیفتراکی' || item.valve_type_2) ? (
                          <div className="flex flex-col leading-tight">
                            <span>۱: {item.valve_type || 'شیر مایع'}</span>
                            <span className="text-slate-500">۲: {item.valve_type_2 || item.valve_type || 'شیر بخار'}</span>
                          </div>
                        ) : (
                          item.valve_type || 'شیر نو استاندارد ام‌گاز'
                        )}
                      </td>
                      <td className="p-1.5 border-l border-slate-300 text-center text-[10px]">
                        {(item.cylinder_type === 'سیلندر لیفتراکی' || item.nut_type_2) ? (
                          <div className="flex flex-col leading-tight">
                            <span>۱: {item.nut_type || 'مهره اول'}</span>
                            <span className="text-slate-500">۲: {item.nut_type_2 || item.nut_type || 'مهره دوم'}</span>
                          </div>
                        ) : (
                          item.nut_type || 'مهره برنجی چپ‌گرد استاندارد'
                        )}
                      </td>
                      <td className="p-1.5 border-l border-slate-300 text-center font-bold">{item.customer_name || item.destination_or_source || '-'}</td>
                      <td className="p-1.5 border-l border-slate-300 text-center font-mono font-bold">{item.production_in || '-'}</td>
                      <td className="p-1.5 border-l border-slate-300 text-center font-mono font-bold">{item.dispatch_out || '-'}</td>
                      <td className="p-1.5 border-l border-slate-300 text-center font-mono font-bold">{item.defect_reject || '-'}</td>
                      <td className="p-1.5 border-l border-slate-300 text-center font-mono font-black text-indigo-900">{item.stock_balance}</td>
                      <td className="p-1.5 text-center">{item.supervisor || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Signatures */}
              <div className="grid grid-cols-4 gap-4 pt-6 text-center text-xs">
                <div className="border border-slate-300 rounded-lg p-3 h-24 flex flex-col justify-between">
                  <span className="font-bold">سرپرست خط تولید</span>
                  <span className="text-[10px] text-slate-400">امضاء و اثر انگشت</span>
                </div>
                <div className="border border-slate-300 rounded-lg p-3 h-24 flex flex-col justify-between">
                  <span className="font-bold">مسئول کنترل کیفی (QC)</span>
                  <span className="text-[10px] text-slate-400">امضاء و تایید آزمون</span>
                </div>
                <div className="border border-slate-300 rounded-lg p-3 h-24 flex flex-col justify-between">
                  <span className="font-bold">تحویل‌گیرنده / مشتری</span>
                  <span className="text-[10px] text-slate-400">امضاء و تحویل قطعی</span>
                </div>
                <div className="border border-slate-300 rounded-lg p-3 h-24 flex flex-col justify-between">
                  <span className="font-bold">مدیریت ارشد کارخانه</span>
                  <span className="text-[10px] text-slate-400">مهندس موسی عمویی</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ======================================================================
          MODAL: PHYSICAL GOODS EXIT RECEIPT (برگه فقط خروج از کارخانه - M.Gas cylinder)
          دقیقاً مطابق برگه خروج موجود با تمام تنظیمات مشابه در منو کاردکس تعمیر سیلندر
          ====================================================================== */}
      {showExitReceiptModal && selectedProductionEntryForExitReceipt && (
        <GoodsExitReceiptModal
          isOpen={showExitReceiptModal}
          onClose={() => {
            setShowExitReceiptModal(false);
            setSelectedProductionEntryForExitReceipt(null);
          }}
          productionEntry={selectedProductionEntryForExitReceipt}
          customer={customerList.find(c => c.name === (selectedProductionEntryForExitReceipt.customer_name || selectedProductionEntryForExitReceipt.destination_or_source)) || null}
          currentEnv={currentEnv}
          currentUser={currentUser}
          isExitOnly={true}
          onSaved={(receipt) => {
            refreshLocalState();
            showToast(`برگه خروج از کارخانه شماره ${receipt.form_number} با موفقیت در سیستم ثبت گردید.`, 'success');
          }}
        />
      )}

      {/* ======================================================================
          MODAL: ORDER DETAILS MODAL (جزئیات کامل سفارش با نمایش برجسته شماره برگه)
          درخواست کاربر: «نوشتن شماره برگه در جزئیات سفارش که در بخش عملیات قرار میدهی»
          ====================================================================== */}
      {selectedOrderForDetails && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto cursor-pointer"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedOrderForDetails(null);
          }}
        >
          <div
            className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-6 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 border-b border-indigo-800/60 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base">جزئیات سفارش و مشخصات سند</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">کاردکس ساخت و تولید ام‌گاز</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderForDetails(null)}
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
                  <span className="text-[11px] font-bold text-indigo-300 block">شماره برگه سفارش / حواله:</span>
                  <span className="font-mono text-base sm:text-lg font-black text-indigo-200 tracking-wider font-mono-en" dir="ltr">
                    {selectedOrderForDetails.transfer_sheet_number}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(selectedOrderForDetails.transfer_sheet_number);
                    showToast(`شماره برگه «${selectedOrderForDetails.transfer_sheet_number}» با موفقیت کپی شد.`, 'success');
                  }}
                  className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[11px] font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  title="کپی شماره برگه در کلیپ‌بورد"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>کپی برگه</span>
                </button>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-2.5 bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px] block">تاریخ ثبت:</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{selectedOrderForDetails.date}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px] block">سفارش‌دهنده:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">{selectedOrderForDetails.customer_name || selectedOrderForDetails.destination_or_source || 'نامشخص'}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px] block">نوع محصول:</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">{selectedOrderForDetails.cylinder_type}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px] block">مدل / زیردسته:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedOrderForDetails.sub_variant || 'استاندارد'}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px] block">نوع شیر:</span>
                  <span className="font-bold text-amber-700 dark:text-amber-400">{selectedOrderForDetails.valve_type || 'استاندارد'}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px] block">نوع مهره:</span>
                  <span className="font-bold text-cyan-700 dark:text-cyan-400">{selectedOrderForDetails.nut_type || 'استاندارد'}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px] block">تیراژ سفارش (ورودی):</span>
                  <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">{selectedOrderForDetails.production_in ? formatNumberEn(selectedOrderForDetails.production_in) : '-'}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px] block">تحویل نهایی (خروجی):</span>
                  <span className="font-mono font-black text-amber-600 dark:text-amber-400">{selectedOrderForDetails.dispatch_out ? formatNumberEn(selectedOrderForDetails.dispatch_out) : '-'}</span>
                </div>
              </div>

              {/* Full Description & Notes */}
              <div className="space-y-1.5 bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800/80">
                <span className="text-slate-500 dark:text-slate-400 text-[11px] font-bold block">شرح کامل گردش:</span>
                <p className="text-slate-800 dark:text-slate-200 leading-relaxed text-[11.5px]">{selectedOrderForDetails.description || 'بدون شرح'}</p>
                {selectedOrderForDetails.notes && (
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-1 pt-1 border-t border-slate-200 dark:border-slate-800">
                    یادداشت: {selectedOrderForDetails.notes}
                  </p>
                )}
              </div>

              {/* Actions Footer */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleOpenExitReceipt(selectedOrderForDetails);
                    setSelectedOrderForDetails(null);
                  }}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>برگه خروج کارخانه</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedOrderForDetails(null)}
                  className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
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
