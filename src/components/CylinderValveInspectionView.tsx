import React, { useState, useMemo } from 'react';
import {
  RuntimeEnvironment,
  User,
  Customer,
  CylinderValveInspection,
  CylinderValveItemType,
  GoodsReceiptItem,
  CustomCylinderItemType,
  GasKardexEntry
} from '../types';
import { GoodsEntryReceiptModal } from './GoodsEntryReceiptModal';
import {
  PackageCheck,
  Plus,
  Search,
  Filter,
  FileText,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Building2,
  Truck,
  Hash,
  Eye,
  X,
  Layers,
  Flame,
  Wrench,
  AlertOctagon,
  Download,
  Database,
  Tag,
  Boxes,
  Pencil,
  Trash2
} from 'lucide-react';
import { toPersianDigits, toEnglishDigits, formatPersianDateTime, getPersianDate, generateUUID, parseDecimalNumber } from '../utils/persian';
import { numberToPersianWords } from '../utils/numberToPersianWords';
import { MGasOfficialLogo } from './MGasOfficialLogo';
import { printReceiptSheet } from '../utils/receiptPrint';
import { exportElementToPdf } from '../utils/pdfExport';
import { LocalStorageManager, DEFAULT_CYLINDER_ITEM_TYPES } from '../database/storage';
import { SEED_USERS } from '../database/seed-data';
import { PersianDatePicker } from './PersianDatePicker';
import { ValveEntryModal } from './ValveEntryModal';

interface CylinderValveInspectionViewProps {
  currentEnv: RuntimeEnvironment;
  currentUser: User | null;
  customers: Customer[];
  inspections: CylinderValveInspection[];
  onRefresh: () => void;
  onOpenKardexWithInspection: (inspection: CylinderValveInspection) => void;
}

export const CylinderValveInspectionView: React.FC<CylinderValveInspectionViewProps> = ({
  currentEnv,
  currentUser,
  customers,
  inspections,
  onRefresh,
  onOpenKardexWithInspection
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'COUNTED_READY_FOR_KARDEX' | 'KARDEX_REGISTERED'>('ALL');
  const [itemTypeFilter, setItemTypeFilter] = useState<string>('ALL');

  // Reactive inspections state for instant 0ms optimistic updates without page refresh
  const [localInspections, setLocalInspections] = useState<CylinderValveInspection[]>(() => {
    const fromStorage = LocalStorageManager.getCylinderValveInspections(currentEnv);
    return fromStorage && fromStorage.length > 0 ? fromStorage : (inspections || []);
  });

  // Keep synchronized whenever parent passes fresh inspections
  React.useEffect(() => {
    if (inspections) {
      setLocalInspections([...inspections]);
    }
  }, [inspections]);

  // Subscribe to instant local storage events
  React.useEffect(() => {
    const updateFromStorage = () => {
      const fresh = LocalStorageManager.getCylinderValveInspections(currentEnv);
      setLocalInspections([...(fresh || [])]);
    };

    const unsub = LocalStorageManager.subscribe(updateFromStorage);
    window.addEventListener('mgas:inspection_updated', updateFromStorage);
    window.addEventListener('mgas:inspection_added', updateFromStorage);
    window.addEventListener('mgas:db_refreshed', updateFromStorage);
    window.addEventListener('mgas:database_refreshed', updateFromStorage);

    return () => {
      unsub();
      window.removeEventListener('mgas:inspection_updated', updateFromStorage);
      window.removeEventListener('mgas:inspection_added', updateFromStorage);
      window.removeEventListener('mgas:db_refreshed', updateFromStorage);
      window.removeEventListener('mgas:database_refreshed', updateFromStorage);
    };
  }, [currentEnv]);

  // Dynamic Custom Item Types (Saved permanently across app)
  const [customItemTypes, setCustomItemTypes] = useState<CustomCylinderItemType[]>(() => {
    return LocalStorageManager.getCustomItemTypes(currentEnv);
  });
  const [showAddCustomItemModal, setShowAddCustomItemModal] = useState(false);
  const [newCustomItemName, setNewCustomItemName] = useState('');
  const [newCustomItemCategory, setNewCustomItemCategory] = useState<'VALVE' | 'CYLINDER' | 'SCRAP' | 'OTHER'>('VALVE');
  const [newCustomItemUnit, setNewCustomItemUnit] = useState('عدد');
  const [newCustomItemDesc, setNewCustomItemDesc] = useState('');

  // Editing Custom Item Type State
  const [editingCustomItem, setEditingCustomItem] = useState<CustomCylinderItemType | null>(null);
  const [editCustomItemName, setEditCustomItemName] = useState('');
  const [editCustomItemCategory, setEditCustomItemCategory] = useState<'VALVE' | 'CYLINDER' | 'SCRAP' | 'OTHER'>('VALVE');
  const [editCustomItemUnit, setEditCustomItemUnit] = useState('عدد');
  const [editCustomItemDesc, setEditCustomItemDesc] = useState('');

  // Modals state
  const [showNewModal, setShowNewModal] = useState(false);
  const [showValveIntakeModal, setShowValveIntakeModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [selectedInspectionForReceipt, setSelectedInspectionForReceipt] = useState<CylinderValveInspection | null>(null);

  // Editing Inspection State
  const [editingInspection, setEditingInspection] = useState<CylinderValveInspection | null>(null);
  // Deleting Inspection Confirmation State
  const [deletingInspection, setDeletingInspection] = useState<CylinderValveInspection | null>(null);

  const [editInspectionForm, setEditInspectionForm] = useState({
    customerId: '',
    customerName: '',
    itemType: 'VALVE_NEW' as CylinderValveItemType,
    itemName: '',
    formNumber: '',
    waybillNumber: '',
    driverName: '',
    plateNumber: '',
    declaredQty: '300',
    healthyQty: '290',
    defectiveQty: '2',
    date: getPersianDate(new Date()),
    notes: ''
  });

  // Delete Inspection Record Handler
  const handleDeleteInspection = (insp: CylinderValveInspection) => {
    // Optimistically remove immediately from local state
    setLocalInspections(prev => prev.filter(i => i.inspection_id !== insp.inspection_id));
    LocalStorageManager.deleteCylinderValveInspection(
      currentEnv,
      insp.inspection_id,
      currentUser?.user_id || 'USR-003'
    );
    setDeletingInspection(null);
    if (editingInspection?.inspection_id === insp.inspection_id) {
      setEditingInspection(null);
    }
    if (selectedInspectionForReceipt?.inspection_id === insp.inspection_id) {
      setSelectedInspectionForReceipt(null);
    }
    onRefresh();
  };

  // Close modals on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (deletingInspection) setDeletingInspection(null);
        else if (selectedInspectionForReceipt) setSelectedInspectionForReceipt(null);
        else if (editingInspection) setEditingInspection(null);
        else if (editingCustomItem) setEditingCustomItem(null);
        else if (showAddCustomItemModal) setShowAddCustomItemModal(false);
        else if (showValveIntakeModal) setShowValveIntakeModal(false);
        else if (showNewModal) setShowNewModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deletingInspection, selectedInspectionForReceipt, editingInspection, editingCustomItem, showAddCustomItemModal, showValveIntakeModal, showNewModal]);

  // Open Edit Custom Item modal
  const handleOpenEditCustomItem = (it: CustomCylinderItemType) => {
    setEditingCustomItem(it);
    setEditCustomItemName(it.name);
    setEditCustomItemCategory(it.category);
    setEditCustomItemUnit(it.unit || 'عدد');
    setEditCustomItemDesc(it.description || '');
  };

  // Save Edit Custom Item
  const handleSaveEditCustomItem = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editingCustomItem || !editCustomItemName.trim()) return;

    const updated: CustomCylinderItemType = {
      ...editingCustomItem,
      name: editCustomItemName.trim(),
      category: editCustomItemCategory,
      unit: editCustomItemUnit.trim() || 'عدد',
      description: editCustomItemDesc.trim() || undefined
    };

    LocalStorageManager.updateCustomItemType(currentEnv, updated, currentUser?.user_id || 'USR-003');
    setCustomItemTypes(LocalStorageManager.getCustomItemTypes(currentEnv));
    setEditingCustomItem(null);
    onRefresh();
  };

  // Delete Custom Item
  const handleDeleteCustomItem = () => {
    if (!editingCustomItem) return;
    LocalStorageManager.deleteCustomItemType(currentEnv, editingCustomItem.id, currentUser?.user_id || 'USR-003');
    setCustomItemTypes(LocalStorageManager.getCustomItemTypes(currentEnv));
    setEditingCustomItem(null);
    onRefresh();
  };

  // Open Edit Inspection Modal
  const handleOpenEditInspection = (insp: CylinderValveInspection) => {
    setEditingInspection(insp);
    setEditInspectionForm({
      customerId: insp.customer_id,
      customerName: insp.customer_name,
      itemType: insp.item_type,
      itemName: insp.item_name,
      formNumber: insp.form_number,
      waybillNumber: insp.waybill_number || '',
      driverName: insp.driver_name || '',
      plateNumber: insp.plate_number || '',
      declaredQty: String(insp.declared_quantity),
      healthyQty: String(insp.actual_healthy_quantity),
      defectiveQty: String(insp.defective_quantity),
      date: insp.date,
      notes: insp.notes || ''
    });
  };

  // Save Edited Inspection
  const handleSaveEditInspection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInspection) return;

    const declared = parseDecimalNumber(editInspectionForm.declaredQty, 0);
    const healthy = parseDecimalNumber(editInspectionForm.healthyQty, 0);
    const defective = parseDecimalNumber(editInspectionForm.defectiveQty, 0);
    const disc = declared - healthy - defective;

    const customer = customers.find(c => c.customer_id === editInspectionForm.customerId) || customers[0];

    const receiptItems: GoodsReceiptItem[] = [
      {
        rowNum: 1,
        description: `${editInspectionForm.itemName} (شمارش سالم)`,
        quantity: healthy,
        quantityInWords: numberToPersianWords(healthy),
        remarks: 'شمارش شده فیزیکی و تحویل انبار'
      }
    ];

    if (defective > 0) {
      receiptItems.push({
        rowNum: 2,
        description: `${editInspectionForm.itemName} (معیوب / خارج از استاندارد)`,
        quantity: defective,
        quantityInWords: numberToPersianWords(defective),
        remarks: 'معیوب فیزیکی یا دنده‌خراب'
      });
    }

    const updatedRecord: CylinderValveInspection = {
      ...editingInspection,
      form_number: editInspectionForm.formNumber,
      date: editInspectionForm.date,
      customer_id: customer ? customer.customer_id : editInspectionForm.customerId,
      customer_name: customer ? customer.name : editInspectionForm.customerName,
      item_type: editInspectionForm.itemType,
      item_name: editInspectionForm.itemName,
      declared_quantity: declared,
      actual_healthy_quantity: healthy,
      defective_quantity: defective,
      discrepancy_quantity: disc,
      driver_name: editInspectionForm.driverName,
      plate_number: editInspectionForm.plateNumber,
      waybill_number: editInspectionForm.waybillNumber,
      notes: editInspectionForm.notes,
      receipt_items: receiptItems,
      updated_at: new Date().toISOString()
    };

    setLocalInspections(prev => prev.map(i => i.inspection_id === updatedRecord.inspection_id ? updatedRecord : i));
    LocalStorageManager.saveCylinderValveInspection(
      currentEnv,
      updatedRecord,
      currentUser?.user_id || 'USR-003'
    );

    setEditingInspection(null);
    onRefresh();
  };

  // New Inspection Form state
  const [newForm, setNewForm] = useState<{
    customerId: string;
    itemType: CylinderValveItemType;
    itemName: string;
    formNumber: string;
    waybillNumber: string;
    driverName: string;
    plateNumber: string;
    declaredQty: number | string;
    healthyQty: number | string;
    defectiveQty: number | string;
    date: string;
    notes: string;
  }>({
    customerId: 'CUST-GAS-011',
    itemType: 'VALVE_NEW' as CylinderValveItemType,
    itemName: 'شیر نو سیلندر گاز ۱۱ کیلوگرمی',
    formNumber: `05260${inspections.length + 3}`,
    waybillNumber: `BAR-${Math.floor(10000 + Math.random() * 90000)}`,
    driverName: 'آقای اکبری (راننده توزیع)',
    plateNumber: 'ایران ۲۲ - ۳۴۵ ع ۷۸',
    declaredQty: 300,
    healthyQty: 290,
    defectiveQty: 2,
    date: getPersianDate(new Date()),
    notes: 'بررسی دقیق فیزیکی توسط مهندس حاجی‌وند - ثبت مغایرت بین بارنامه و اقلام سالم دریافتی'
  });

  // Handle saving a new custom item type permanently
  const handleSaveCustomItemType = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newCustomItemName.trim()) return;

    const trimmed = newCustomItemName.trim();
    const itemId = `ITEM_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const newItem: CustomCylinderItemType = {
      id: itemId,
      name: trimmed,
      category: newCustomItemCategory,
      unit: newCustomItemUnit.trim() || 'عدد',
      description: newCustomItemDesc.trim() || undefined,
      created_at: new Date().toISOString()
    };

    const saved = LocalStorageManager.addCustomItemType(
      currentEnv,
      newItem,
      currentUser?.user_id || 'USR-003'
    );

    setCustomItemTypes(LocalStorageManager.getCustomItemTypes(currentEnv));
    setNewForm(prev => ({
      ...prev,
      itemType: saved.id,
      itemName: saved.name
    }));

    setNewCustomItemName('');
    setNewCustomItemDesc('');
    setShowAddCustomItemModal(false);
  };

  const discrepancy = useMemo(() => {
    return Number(newForm.declaredQty || 0) - Number(newForm.healthyQty || 0) - Number(newForm.defectiveQty || 0);
  }, [newForm.declaredQty, newForm.healthyQty, newForm.defectiveQty]);

  // Filtered Inspections computed from reactive local state for 0ms updates
  const filteredInspections = useMemo(() => {
    return localInspections.filter(insp => {
      if (statusFilter !== 'ALL' && insp.status !== statusFilter) return false;
      if (itemTypeFilter !== 'ALL' && insp.item_type !== itemTypeFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = insp.customer_name?.toLowerCase().includes(q);
        const matchForm = insp.form_number?.toLowerCase().includes(q);
        const matchWaybill = insp.waybill_number?.toLowerCase().includes(q);
        const matchItem = insp.item_name?.toLowerCase().includes(q);
        const matchDriver = insp.driver_name?.toLowerCase().includes(q);
        if (!matchName && !matchForm && !matchWaybill && !matchItem && !matchDriver) return false;
      }
      return true;
    });
  }, [localInspections, statusFilter, itemTypeFilter, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = localInspections.length;
    const readyForKardex = localInspections.filter(i => i.status === 'COUNTED_READY_FOR_KARDEX').length;
    const kardexRegistered = localInspections.filter(i => i.status === 'KARDEX_REGISTERED').length;
    const totalHealthy = localInspections.reduce((sum, i) => sum + (i.actual_healthy_quantity || 0), 0);
    const totalDefective = localInspections.reduce((sum, i) => sum + (i.defective_quantity || 0), 0);
    const totalDiscrepancy = localInspections.reduce((sum, i) => sum + (i.discrepancy_quantity || 0), 0);
    return { total, readyForKardex, kardexRegistered, totalHealthy, totalDefective, totalDiscrepancy };
  }, [localInspections]);

  // Submit New Inspection
  const handleCreateInspection = (e: React.FormEvent) => {
    e.preventDefault();
    const customer = customers.find(c => c.customer_id === newForm.customerId) || customers[0];

    const declared = parseDecimalNumber(newForm.declaredQty, 0);
    const healthy = parseDecimalNumber(newForm.healthyQty, 0);
    const defective = parseDecimalNumber(newForm.defectiveQty, 0);
    const disc = declared - healthy - defective;

    const healthyWords = numberToPersianWords(healthy);
    const defectiveWords = numberToPersianWords(defective);

    const receiptItems: GoodsReceiptItem[] = [
      {
        rowNum: 1,
        description: `${newForm.itemName} (شمارش سالم تایید شده)`,
        quantity: healthy,
        quantityInWords: healthyWords,
        remarks: 'شمارش شده فیزیکی و تحویل انبار'
      }
    ];

    if (defective > 0) {
      receiptItems.push({
        rowNum: 2,
        description: `${newForm.itemName} (معیوب / خارج از استاندارد)`,
        quantity: defective,
        quantityInWords: defectiveWords,
        remarks: 'معیوب فیزیکی یا دنده‌خراب'
      });
    }

    const newRecord: CylinderValveInspection = {
      inspection_id: `INSP-${Date.now()}`,
      form_number: newForm.formNumber,
      receipt_type: 'ENTRY',
      date: newForm.date,
      customer_id: customer ? customer.customer_id : newForm.customerId,
      customer_name: customer ? customer.name : 'البرز گاز',
      item_type: newForm.itemType,
      item_name: newForm.itemName,
      declared_quantity: declared,
      actual_healthy_quantity: healthy,
      defective_quantity: defective,
      discrepancy_quantity: disc,
      driver_name: newForm.driverName,
      plate_number: newForm.plateNumber,
      waybill_number: newForm.waybillNumber,
      inspector_user_id: currentUser?.user_id || 'USR-003',
      inspector_name: currentUser?.full_name || 'مهندس حاجی وند',
      status: 'COUNTED_READY_FOR_KARDEX',
      notes: newForm.notes,
      receipt_items: receiptItems,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Optimistically prepend immediately to local state for 0ms visual update
    setLocalInspections(prev => [newRecord, ...prev.filter(i => i.inspection_id !== newRecord.inspection_id)]);

    LocalStorageManager.saveCylinderValveInspection(
      currentEnv,
      newRecord,
      currentUser?.user_id || 'USR-003'
    );

    setShowNewModal(false);
    onRefresh();
  };

  // Print official receipt
  const handlePrintOfficialReceipt = () => {
    printReceiptSheet({
      elementId: 'cylinder-inspection-official-sheet',
      paperSize: 'A5',
      orientation: 'portrait'
    });
  };

  const handleDownloadPdf = async () => {
    await exportElementToPdf('cylinder-inspection-official-sheet', {
      filename: `برگ_ورود_کالا_${selectedInspectionForReceipt?.form_number || '052602'}.pdf`,
      format: 'a5',
      orientation: 'portrait'
    });
  };

  const isHajivand = currentUser?.username === 'hajivand' || currentUser?.username === 'gholizadeh' || currentUser?.role === 'WAREHOUSE_KEEPER';
  const isKarami = currentUser?.username === 'karami' || currentUser?.role === 'INTERNAL_MANAGER';
  const isAmouei = currentUser?.username === 'amouei' || currentUser?.role === 'ADMIN';

  return (
    <div className="space-y-6">
      {/* Top Header & Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-800/80 flex items-center justify-center text-emerald-400">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-100 flex items-center gap-2">
                <span>ورودی شیر و سیلندر</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/70 font-normal">
                  کنترل کیفیت و شمارش فیزیکی
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                ثبت واقعی اقلام ورودی توسط مهندس حاجی‌وند و ایجاد پیش‌نیاز ثبت کاردکس برای خانم کرمی
              </p>
              {/* Automatic synchronization indicator */}
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-700/80 text-emerald-300 text-[11px] font-bold shadow-2xs">
                  <Boxes className="w-3.5 h-3.5 text-emerald-400" />
                  <span>ثبت و همگام‌سازی خودکار در «ورود و خروج انبار» و «موجودی کالاها»: فعال</span>
                </span>
                <span className="text-[11px] text-slate-400 hidden sm:inline">
                  (اقلام تاییدشده فیزیکی مستقیماً به موجودی انبار افزوده و رسید ورود صادر می‌شود)
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Dedicated button to define a new item type permanently */}
          <button
            onClick={() => setShowAddCustomItemModal(true)}
            className="px-3.5 py-2.5 text-xs font-bold text-emerald-300 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/80 rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            title="تعریف نوع قلم وارده جدید جهت استفاده همیشگی در انبار و کاردکس"
          >
            <Tag className="w-4 h-4 text-emerald-400" />
            <span>تعریف نوع قلم وارده جدید</span>
          </button>

          {/* Action button: Hajivand or Amouei can register */}
          <button
            onClick={() => setShowNewModal(true)}
            className="px-4 py-2.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            title="ورود سیلندر تعمییری (شمارش فیزیکی و بازرسی)"
          >
            <Plus className="w-4 h-4" />
            <span>ورود سیلندر تعمییری</span>
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
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Role-based Guidance & Notification Banner */}
      {isHajivand && (
        <div className="bg-emerald-950/40 border border-emerald-800/70 rounded-xl p-4 flex items-start gap-3 text-xs text-emerald-200">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-emerald-300">مسئولیت انبار مرکزی (مهندس حاجی‌وند): </span>
            <span>
              طبق معماری کارخانه، شما مقدار بارنامه اعلامی را با بار فیزیکی تخلیه‌شده مطابقت داده و تعداد سالم و معیوب را شمارش و تایید می‌نمایید. با تایید شما، اعلان فوری برای خانم کرمی جهت ثبت سطر کاردکس ارسال می‌شود (شما مستقیماً کاردکس ثبت نمی‌کنید).
            </span>
          </div>
        </div>
      )}

      {(isKarami || isAmouei) && stats.readyForKardex > 0 && (
        <div className="bg-amber-950/40 border border-amber-800/80 rounded-xl p-4 flex items-center justify-between gap-3 text-xs text-amber-200 animate-pulse">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <span className="font-bold text-amber-300">اعلان اقدام فوری ثبت کاردکس: </span>
              <span>
                تعداد <strong className="text-white font-mono">{toPersianDigits(stats.readyForKardex)}</strong> ورودی شیر و سیلندر توسط مهندس حاجی‌وند شمارش و تایید شده و منتظر ثبت نهایی در کاردکس گاز هستند.
              </span>
            </div>
          </div>
          <span className="text-[11px] font-mono text-amber-300 bg-amber-900/60 px-3 py-1 rounded-lg border border-amber-700/60 whitespace-nowrap">
            آماده ثبت در کاردکس
          </span>
        </div>
      )}

      {/* Metric Cards - Responsive on Mobile & Tablet */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <span className="text-xs text-slate-400 font-medium">کل اسناد بازرسی ورودی</span>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-100">
            {toPersianDigits(stats.total)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">برگه‌های ثبت‌شده انبار</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-amber-400 font-medium">در انتظار ثبت کاردکس</span>
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-amber-300">
            {toPersianDigits(stats.readyForKardex)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">تایید شده توسط حاجی‌وند</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <span className="text-xs text-emerald-400 font-medium">ثبت‌شده در کاردکس</span>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-300">
            {toPersianDigits(stats.kardexRegistered)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">نهایی‌شده توسط کرمی/عمویی</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <span className="text-xs text-rose-400 font-medium">معیوب / ضایعات بازرسی</span>
          <div className="mt-2 text-2xl font-bold font-mono text-rose-300">
            {toPersianDigits(stats.totalDefective)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">کسری کل بارنامه‌ها: {toPersianDigits(stats.totalDiscrepancy)}</span>
        </div>
      </div>

      {/* Dynamic Item Types Strip (Permanent Items) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-slate-300 font-bold flex items-center gap-1.5 shrink-0">
            <Tag className="w-3.5 h-3.5 text-emerald-400" />
            <span>انواع اقلام وارده تعریف‌شده (در دسترس همیشگی):</span>
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {customItemTypes.map(it => (
              <span
                key={it.id}
                onClick={() => handleOpenEditCustomItem(it)}
                className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 flex items-center gap-1.5 text-[11px] hover:border-emerald-500 hover:bg-slate-900 transition-all cursor-pointer group shadow-2xs"
                title={`جهت ویرایش «${it.name}» کلیک کنید`}
              >
                <span className="font-medium text-slate-100 group-hover:text-emerald-300 transition-colors">{it.name}</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-mono">
                  {it.unit || 'عدد'}
                </span>
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenEditCustomItem(it);
                  }}
                  className="p-0.5 rounded text-slate-400 group-hover:text-emerald-400 hover:bg-emerald-950/80 transition-colors"
                  title="ویرایش"
                >
                  <Pencil className="w-3 h-3" />
                </span>
              </span>
            ))}
          </div>
        </div>

        <button
          onClick={() => setShowAddCustomItemModal(true)}
          className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-bold text-xs shrink-0 cursor-pointer bg-emerald-950/60 px-3 py-1.5 rounded-lg border border-emerald-800/60 hover:bg-emerald-900 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>افزودن قلم وارده جدید...</span>
        </button>
      </div>

      {/* Filter and Search Bar - Responsive on Mobile & Tablet */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto">
          {/* Status Tabs */}
          <div className="inline-flex rounded-lg p-0.5 bg-slate-950 border border-slate-800 text-xs">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                statusFilter === 'ALL' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              همه ورودی‌ها ({toPersianDigits(stats.total)})
            </button>
            <button
              onClick={() => setStatusFilter('COUNTED_READY_FOR_KARDEX')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                statusFilter === 'COUNTED_READY_FOR_KARDEX' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-amber-400 hover:text-amber-300'
              }`}
            >
              در انتظار کاردکس ({toPersianDigits(stats.readyForKardex)})
            </button>
            <button
              onClick={() => setStatusFilter('KARDEX_REGISTERED')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                statusFilter === 'KARDEX_REGISTERED' ? 'bg-emerald-600 text-white font-bold' : 'text-emerald-400 hover:text-emerald-300'
              }`}
            >
              کاردکس شده ({toPersianDigits(stats.kardexRegistered)})
            </button>
          </div>

          {/* Item Type filter */}
          <select
            value={itemTypeFilter}
            onChange={e => setItemTypeFilter(e.target.value)}
            className="text-xs bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-300 focus:outline-hidden"
          >
            <option value="ALL">همه انواع کالا</option>
            {customItemTypes.map(it => (
              <option key={it.id} value={it.id}>{it.name}</option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="جستجوی طرف حساب، برگه، راننده..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Main Inspections Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs inspection-table">
            <thead className="bg-slate-950/90 text-slate-400 border-b border-slate-800 text-[11px]">
              <tr>
                <th className="col-vertical-insp text-slate-400 font-bold border-b border-slate-800 text-center" title="شماره برگه ورودی">
                  <span className="vertical-text-insp">شماره برگه</span>
                </th>
                <th className="col-vertical-insp text-slate-400 font-bold border-b border-slate-800 text-center" title="تاریخ ورود به کارخانه">
                  <span className="vertical-text-insp">تاریخ ورود</span>
                </th>
                <th className="col-vertical-insp text-slate-400 font-bold border-b border-slate-800 text-center" title="طرف حساب (مشتری/نمایندگی)">
                  <span className="vertical-text-insp">طرف حساب</span>
                </th>
                <th className="col-vertical-insp text-slate-400 font-bold border-b border-slate-800 text-center" title="شرح قلم و قطعات">
                  <span className="vertical-text-insp">شرح قلم</span>
                </th>
                <th className="px-2 py-2 text-center text-[10.5px] w-[50px]">اعلامی</th>
                <th className="px-2 py-2 text-center bg-emerald-950/20 text-emerald-400 text-[10.5px] w-[55px]">شمارش واقعی</th>
                <th className="px-2 py-2 text-center bg-rose-950/20 text-rose-400 text-[10.5px] w-[45px]">معیوب</th>
                <th className="px-2 py-2 text-center text-[10.5px] w-[45px]">کسری</th>
                <th className="px-2 py-2 text-right text-[10.5px] min-w-[110px] max-w-[130px]">بازرس و راننده</th>
                <th className="px-2 py-2 text-center text-[10.5px] w-[90px] print:hidden" data-no-print="true">کاربر سیستم</th>
                <th className="px-2 py-2 text-center text-[10.5px] w-[65px]">وضعیت</th>
                <th className="p-1.5 text-center sticky left-0 z-20 bg-slate-950/95 backdrop-blur-md shadow-[-4px_0_12px_rgba(0,0,0,0.5)] border-r border-slate-800 w-[60px] text-[10px]">
                  عملیات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {filteredInspections.length === 0 ? (
                <tr key="empty-inspections-state">
                  <td colSpan={12} className="p-8 text-center text-slate-400">
                    هیچ رکوردی با فیلترهای انتخابی یافت نشد.
                  </td>
                </tr>
              ) : (
                filteredInspections.map(insp => {
                  const isReady = insp.status === 'COUNTED_READY_FOR_KARDEX';
                  return (
                    <tr key={insp.inspection_id} className="hover:bg-slate-800/40 transition-colors">
                      {/* 1. شماره برگه (عمودی با حداقل فضا) */}
                      <td className="col-vertical-insp font-mono text-center" title={`شماره برگه: ${insp.form_number}${insp.waybill_number ? ` | بارنامه: ${insp.waybill_number}` : ''}`}>
                        <div className="vertical-text-insp font-mono font-bold text-amber-400" dir="ltr">
                          <span>{toEnglishDigits(insp.form_number)}</span>
                        </div>
                        {insp.waybill_number && (
                          <div className="vertical-text-insp text-[9px] text-slate-400 font-mono mt-0.5" dir="ltr" title={`بارنامه: ${insp.waybill_number}`}>
                            <span>{toEnglishDigits(insp.waybill_number)}</span>
                          </div>
                        )}
                      </td>

                      {/* 2. تاریخ ورود (عمودی با حداقل فضا) */}
                      <td className="col-vertical-insp font-mono text-slate-300 text-center" title={`تاریخ ورود: ${insp.date}`}>
                        <div className="vertical-text-insp font-mono text-slate-300">
                          <span>{toPersianDigits(insp.date)}</span>
                        </div>
                      </td>

                      {/* 3. طرف حساب (عمودی با حداقل فضا) */}
                      <td className="col-vertical-insp text-center" title={`طرف حساب: ${insp.customer_name} (${insp.customer_id})`}>
                        <div className="vertical-text-insp font-bold text-slate-100">
                          <span className="truncate max-w-[95px]">{insp.customer_name}</span>
                        </div>
                        <div className="vertical-text-insp text-[9px] text-slate-400 font-mono mt-0.5">
                          <span>{insp.customer_id}</span>
                        </div>
                      </td>

                      {/* 4. شرح قلم (عمودی با حداقل فضا) */}
                      <td className="col-vertical-insp text-center" title={`شرح قلم: ${insp.item_name}${insp.notes ? ` - ${insp.notes}` : ''} | ورودی موجودی: +${toPersianDigits(insp.actual_healthy_quantity)}`}>
                        <div className="vertical-text-insp font-medium text-slate-200">
                          <span className="truncate max-w-[95px]">{insp.item_name}</span>
                        </div>
                        {insp.notes && (
                          <div className="vertical-text-insp text-[9px] text-slate-400 mt-0.5">
                            <span className="truncate max-w-[80px]">{insp.notes}</span>
                          </div>
                        )}
                      </td>

                      {/* 5. تعداد اعلامی بارنامه */}
                      <td className="px-2 py-2 text-center font-mono font-bold text-xs sm:text-sm text-slate-200">
                        {toPersianDigits(insp.declared_quantity)}
                      </td>

                      {/* 6. شمارش سالم */}
                      <td className="px-2 py-2 text-center font-mono font-black text-sm sm:text-base text-emerald-400 bg-emerald-950/10">
                        {toPersianDigits(insp.actual_healthy_quantity)}
                      </td>

                      {/* 7. معیوب */}
                      <td className="px-2 py-2 text-center font-mono font-bold text-xs sm:text-sm text-rose-400 bg-rose-950/10">
                        {toPersianDigits(insp.defective_quantity)}
                      </td>

                      {/* 8. کسری */}
                      <td className="px-2 py-2 text-center font-mono font-bold text-xs sm:text-sm text-amber-400">
                        {insp.discrepancy_quantity !== 0 ? `-${toPersianDigits(Math.abs(insp.discrepancy_quantity))}` : '۰'}
                      </td>

                      {/* 9. بازرس و راننده */}
                      <td className="px-2 py-2 text-slate-300 text-[10.5px] max-w-[130px] leading-tight">
                        <div className="truncate" title={`بازرس: ${insp.inspector_name}`}>بازرس: <strong className="text-slate-100">{insp.inspector_name}</strong></div>
                        <div className="text-slate-400 text-[9.5px] truncate mt-0.5" title={`راننده: ${insp.driver_name || '-'}`}>راننده: {insp.driver_name || '-'}</div>
                      </td>

                      {/* 10. کاربر سیستم */}
                      <td className="px-2 py-2 text-center print:hidden" data-no-print="true" data-user-badge="true">
                        <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-950 border border-slate-700/60 text-[10px]">
                          <span className="font-mono font-bold text-indigo-300">
                            @{SEED_USERS.find(u => u.user_id === insp.inspector_user_id)?.username || 'hajivand'}
                          </span>
                        </div>
                      </td>

                      {/* 11. وضعیت */}
                      <td className="px-2 py-2 text-center">
                        {isReady ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-amber-950 text-amber-300 border border-amber-800" title="در انتظار تایید کاردکس">
                            <Clock className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                            <span>انتظار</span>
                          </span>
                        ) : (
                          <div className="flex flex-col items-center">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800" title="در کاردکس ثبت شد">
                              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                              <span>ثبت شد</span>
                            </span>
                            {insp.kardex_registered_by && (
                              <span className="text-[8.5px] font-mono text-slate-400 mt-0.5 print:hidden" data-no-print="true">
                                @{insp.kardex_registered_by}
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* 12. عملیات با حداقل فضا: فقط آیکون دکمه‌ها بدون نوشته */}
                      <td className="p-1 text-center align-middle sticky left-0 z-10 bg-slate-900 group-hover:bg-slate-850 backdrop-blur-md shadow-[-4px_0_12px_rgba(0,0,0,0.5)] border-r border-slate-800 transition-colors whitespace-nowrap w-[60px]">
                        <div className="grid grid-cols-2 gap-1 w-max mx-auto py-0.5">
                          {/* Kardex Entry Icon Button (for Karami / Amouei) */}
                          {isReady && !isHajivand ? (
                            <button
                              onClick={() => onOpenKardexWithInspection(insp)}
                              className="w-6.5 h-6.5 text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-md flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-xs"
                              title="ثبت سطر کاردکس بر اساس این ورودی تاییدشده"
                              aria-label="ثبت در کاردکس"
                            >
                              <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                            </button>
                          ) : (
                            <div className="w-6.5 h-6.5 flex items-center justify-center text-emerald-400/80" title="سطر کاردکس ثبت شده است">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </div>
                          )}

                          {/* Edit Inspection Record Icon Button */}
                          <button
                            onClick={() => handleOpenEditInspection(insp)}
                            className="w-6.5 h-6.5 text-emerald-300 bg-emerald-950/70 hover:bg-emerald-900 hover:text-white border border-emerald-700/60 rounded-md flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
                            title="ویرایش مقادیر، شماره برگه و اطلاعات این بازرسی"
                            aria-label="ویرایش"
                          >
                            <Pencil className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          </button>

                          {/* Official Receipt Icon Button */}
                          <button
                            onClick={() => setSelectedInspectionForReceipt(insp)}
                            className="w-6.5 h-6.5 text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 rounded-md flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
                            title="مشاهده و چاپ رسمی برگ ورود کالا"
                            aria-label="برگ ورود"
                          >
                            <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          </button>

                          {/* Delete Inspection Icon Button */}
                          <button
                            onClick={() => setDeletingInspection(insp)}
                            className="w-6.5 h-6.5 text-rose-300 bg-rose-950/70 hover:bg-rose-900 hover:text-white border border-rose-800/60 rounded-md flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
                            title="حذف این برگه ورودی شیر و سیلندر"
                            aria-label="حذف"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                          </button>
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

      {/* MODAL: Register New Inspection by Hajivand */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <PackageCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-100">
                  ورود سیلندر تعمییری (شمارش فیزیکی و بازرسی)
                </h3>
              </div>
              <button
                onClick={() => setShowNewModal(false)}
                className="text-slate-400 hover:text-slate-100 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInspection} className="p-5 space-y-4 text-xs">
              {/* Top Banner info */}
              <div className="bg-indigo-950/40 border border-indigo-800/60 rounded-xl p-3 text-indigo-200 text-xs space-y-1.5">
                <div className="flex items-center gap-2 font-medium">
                  <PackageCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    این فرم جهت شمارش دقیق فیزیکی بار وارده به کارخانه است. پس از ذخیره، رکورد با وضعیت «آماده برای ثبت کاردکس» به خانم کرمی اعلام می‌گردد.
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-300 bg-emerald-950/60 border border-emerald-800/50 rounded-lg px-2.5 py-1">
                  <Boxes className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>
                    همگام‌سازی اتوماتیک: اقلام سالم شمارش‌شده به طور خودکار به «موجودی کالاها» در انبار افزوده شده و رسید «ورود به انبار» صادر می‌گردد.
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Customer */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">طرف حساب / کارخانه مبدأ</label>
                  <select
                    value={newForm.customerId}
                    onChange={e => setNewForm({ ...newForm, customerId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-hidden focus:border-emerald-500"
                    required
                  >
                    {customers.map(c => (
                      <option key={c.customer_id} value={c.customer_id}>
                        {c.name} {c.company_name ? `(${c.company_name})` : ''} - {c.province}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Item Type with define new item button */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-300 font-semibold">نوع قلم وارده</label>
                    <button
                      type="button"
                      onClick={() => setShowAddCustomItemModal(true)}
                      className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-bold px-2 py-0.5 rounded-lg bg-emerald-950/80 border border-emerald-800/80 hover:bg-emerald-900 transition-colors cursor-pointer shadow-xs"
                      title="تعریف قلم جدید وارده برای استفاده همیشگی در انبار و کاردکس"
                    >
                      <Plus className="w-3 h-3" />
                      <span>تعریف قلم جدید...</span>
                    </button>
                  </div>
                  <select
                    value={newForm.itemType}
                    onChange={e => {
                      const type = e.target.value;
                      if (type === '__NEW__') {
                        setShowAddCustomItemModal(true);
                        return;
                      }
                      const matched = customItemTypes.find(t => t.id === type);
                      const name = matched ? matched.name : type;
                      setNewForm({ ...newForm, itemType: type, itemName: name });
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-hidden focus:border-emerald-500 font-medium"
                  >
                    {customItemTypes.map(it => (
                      <option key={it.id} value={it.id}>
                        {it.name} {it.category ? `(${it.category === 'VALVE' ? 'شیرآلات' : it.category === 'CYLINDER' ? 'سیلندر' : it.category === 'SCRAP' ? 'ضایعات' : 'سایر'})` : ''}
                      </option>
                    ))}
                    <option value="__NEW__" className="text-emerald-400 font-bold bg-slate-900">
                      ➕ تعریف نوع قلم جدید...
                    </option>
                  </select>
                </div>

                {/* Form Number */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">شماره برگه ورود کالا</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={newForm.formNumber}
                    onChange={e => setNewForm({ ...newForm, formNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 font-mono focus:outline-hidden focus:border-emerald-500"
                    required
                  />
                </div>

                {/* Waybill Number */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">شماره بارنامه / حواله ورود</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={newForm.waybillNumber}
                    onChange={e => setNewForm({ ...newForm, waybillNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 font-mono focus:outline-hidden focus:border-emerald-500"
                    required
                  />
                </div>

                {/* Entry Date */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-300 font-semibold">تاریخ ورود به کارخانه (شمسی) *</label>
                    <span className="text-[10px] text-amber-400 font-mono">(پرش خودکار به تاریخ امروز)</span>
                  </div>
                  <PersianDatePicker
                    value={newForm.date}
                    onChange={val => setNewForm({ ...newForm, date: val })}
                    required
                  />
                </div>

                {/* Driver */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">نام راننده / تحویل‌دهنده</label>
                  <input
                    type="text"
                    value={newForm.driverName}
                    onChange={e => setNewForm({ ...newForm, driverName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-hidden focus:border-emerald-500"
                    required
                  />
                </div>

                {/* Plate */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">شماره پلاک خودرو</label>
                  <input
                    type="text"
                    value={newForm.plateNumber}
                    onChange={e => setNewForm({ ...newForm, plateNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Physical Counts Section (The Core Logic of User Brief) */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="font-bold text-slate-200 flex items-center justify-between">
                  <span>نتیجه شمارش و بازرسی فیزیکی</span>
                  <span className="text-[11px] text-emerald-400 font-normal">
                    (مثال: ۳۰۰ عدد بارنامه، ۲۹۰ واقعی، ۲ معیوب، ۸ کسری)
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">مقدار بارنامه (اظهاری)</label>
                    <input
                      type="number"
                      step="any"
                      dir="ltr"
                      min="0"
                      value={newForm.declaredQty}
                      onChange={e => setNewForm({ ...newForm, declaredQty: e.target.value === '' ? '' : Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono font-bold text-center"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-emerald-400 font-bold mb-1">شمارش واقعی</label>
                    <input
                      type="number"
                      step="any"
                      dir="ltr"
                      min="0"
                      value={newForm.healthyQty}
                      onChange={e => setNewForm({ ...newForm, healthyQty: e.target.value === '' ? '' : Number(e.target.value) })}
                      className="w-full bg-emerald-950/40 border border-emerald-600 rounded-lg p-2 text-emerald-300 font-mono font-black text-center text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-rose-400 font-bold mb-1">تعداد معیوب</label>
                    <input
                      type="number"
                      step="any"
                      dir="ltr"
                      min="0"
                      value={newForm.defectiveQty}
                      onChange={e => setNewForm({ ...newForm, defectiveQty: e.target.value === '' ? '' : Number(e.target.value) })}
                      className="w-full bg-rose-950/40 border border-rose-600 rounded-lg p-2 text-rose-300 font-mono font-black text-center text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-amber-400 font-bold mb-1">کسری بارنامه</label>
                    <div className="w-full bg-slate-900 border border-amber-600/60 rounded-lg p-2 text-amber-300 font-mono font-black text-center text-sm">
                      {discrepancy !== 0 ? `-${toPersianDigits(Math.abs(discrepancy))}` : '۰'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">توضیحات و یادداشت بازرسی کیفیت</label>
                <textarea
                  rows={2}
                  value={newForm.notes}
                  onChange={e => setNewForm({ ...newForm, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-hidden"
                  placeholder="علت معایب، شماره پلمپ، وضعیت ظاهری بار و..."
                />
              </div>

              {/* Inspector info footer */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-emerald-400" />
                  <span>کاربر متصدی ثبت در سیستم: </span>
                  <span className="font-mono font-bold text-indigo-300">
                    @{currentUser?.username || 'hajivand'} ({currentUser?.full_name || 'مهندس حاجی وند'})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowNewModal(false)}
                    className="px-3 py-2 text-slate-400 hover:text-slate-200"
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-all cursor-pointer shadow-md"
                  >
                    تایید شمارش و ارسال به کاردکس
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Official Goods Entry Receipt Paper Replica (A5 Format) */}
      {selectedInspectionForReceipt && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-slate-100">
                  برگ رسمی ورود کالا به کارخانه (شماره {selectedInspectionForReceipt.form_number})
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadPdf}
                  className="px-3 py-1.5 text-xs font-bold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>دانلود PDF</span>
                </button>

                <button
                  onClick={handlePrintOfficialReceipt}
                  className="px-3 py-1.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>چاپ فیزیکی (A5)</span>
                </button>

                <button
                  onClick={() => setSelectedInspectionForReceipt(null)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* System Info Banner - NOT PRINTED */}
            <div
              className="bg-slate-950 border-b border-slate-800 px-6 py-2 text-xs text-slate-400 flex items-center justify-between gap-2 print:hidden"
              data-no-print="true"
              data-user-badge="true"
            >
              <div className="flex items-center gap-2 flex-wrap">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>کاربر ثبت‌کننده در سیستم:</span>
                <span className="font-mono font-bold text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/60">
                  @{LocalStorageManager.getUsers(currentEnv).find(u => u.user_id === selectedInspectionForReceipt.inspector_user_id)?.username || selectedInspectionForReceipt.inspector_user_id}
                </span>
                <span className="text-slate-400">({LocalStorageManager.getUsers(currentEnv).find(u => u.user_id === selectedInspectionForReceipt.inspector_user_id)?.full_name || selectedInspectionForReceipt.inspector_name})</span>
              </div>
              <span className="text-[11px] text-slate-400 italic">
                نام کاربری صرفاً در سیستم ثبت و نمایش داده می‌شود و در نسخه چاپی درج نمی‌شود
              </span>
            </div>

            {/* Physical Paper Body (Exact Replica of Physical Form) */}
            <div className="p-6 overflow-y-auto bg-slate-950/70 flex justify-center">
              <div
                id="cylinder-inspection-official-sheet"
                className="w-full max-w-[780px] bg-[#fdfbe8] text-slate-900 border-2 border-dashed border-amber-700/60 p-6 md:p-8 rounded-lg shadow-xl font-sans relative select-text"
                style={{ minHeight: '600px' }}
              >
                {/* Header */}
                <div className="flex items-start justify-between pb-3 border-b-2 border-slate-900">
                  <div className="flex flex-col items-start gap-1 w-1/3">
                    <MGasOfficialLogo />
                    <div className="text-xs font-bold text-red-600 pt-1">
                      <span className="text-slate-800">شماره : </span>
                      <span className="text-sm font-mono font-black" dir="ltr">{toEnglishDigits(selectedInspectionForReceipt.form_number)}</span>
                    </div>
                    <div className="text-xs pt-0.5">
                      <span className="font-bold text-slate-800">وسیله شماره : </span>
                      <span className="font-semibold">{selectedInspectionForReceipt.plate_number || 'ایران ۲۲ - ۳۴۵ ع ۷۸'}</span>
                    </div>
                  </div>

                  <div className="text-center w-1/3 pt-1">
                    <h1 className="text-xl md:text-2xl font-black text-slate-950 border-b-2 border-slate-900 pb-1 inline-block px-4">
                      برگ ورود کالا
                    </h1>
                    <div className="text-[11px] font-bold text-slate-700 mt-1">
                      (رسید انبار و کارخانه گاز مایع)
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 w-1/3 text-left">
                    <div className="text-xs pt-1">
                      <span className="font-bold text-slate-800">تاریخ : </span>
                      <span className="font-mono font-bold">{toPersianDigits(selectedInspectionForReceipt.date)}</span>
                    </div>
                    <div className="text-xs pt-0.5">
                      <span className="font-bold text-slate-800">بارنامه : </span>
                      <span className="font-mono font-bold" dir="ltr">{selectedInspectionForReceipt.waybill_number}</span>
                    </div>
                  </div>
                </div>

                {/* Sender/Party Info */}
                <div className="mt-3 p-3 bg-amber-50/70 border border-slate-300 rounded text-xs flex justify-between">
                  <div>
                    <span className="font-bold text-slate-700">تحویل‌دهنده / طرف حساب: </span>
                    <strong className="text-slate-950 font-black">{selectedInspectionForReceipt.customer_name}</strong>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700">راننده: </span>
                    <span className="font-semibold">{selectedInspectionForReceipt.driver_name}</span>
                  </div>
                </div>

                {/* Items Table */}
                <div className="mt-4">
                  <table className="w-full text-right text-xs border border-slate-900 border-collapse">
                    <thead>
                      <tr className="bg-amber-100/90 text-slate-950 font-bold border-b border-slate-900">
                        <th className="border border-slate-900 p-2 text-center w-12">ردیف</th>
                        <th className="border border-slate-900 p-2">شرح جنس / قلم کالا</th>
                        <th className="border border-slate-900 p-2 text-center w-24">تعداد به عدد</th>
                        <th className="border border-slate-900 p-2 w-48">تعداد به حروف</th>
                        <th className="border border-slate-900 p-2">ملاحظات و وضعیت کنترل کیفیت</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-slate-900 p-2 text-center font-mono">۱</td>
                        <td className="border border-slate-900 p-2 font-bold">{selectedInspectionForReceipt.item_name} (سالم)</td>
                        <td className="border border-slate-900 p-2 text-center font-mono font-black">{toPersianDigits(selectedInspectionForReceipt.actual_healthy_quantity)}</td>
                        <td className="border border-slate-900 p-2 font-semibold">{numberToPersianWords(selectedInspectionForReceipt.actual_healthy_quantity)}</td>
                        <td className="border border-slate-900 p-2 text-[11px]">شمارش سالم فیزیکی در انبار</td>
                      </tr>
                      {selectedInspectionForReceipt.defective_quantity > 0 && (
                        <tr>
                          <td className="border border-slate-900 p-2 text-center font-mono">۲</td>
                          <td className="border border-slate-900 p-2 font-bold text-red-700">{selectedInspectionForReceipt.item_name} (معیوب / فاقد استاندارد)</td>
                          <td className="border border-slate-900 p-2 text-center font-mono font-black text-red-700">{toPersianDigits(selectedInspectionForReceipt.defective_quantity)}</td>
                          <td className="border border-slate-900 p-2 font-semibold text-red-700">{numberToPersianWords(selectedInspectionForReceipt.defective_quantity)}</td>
                          <td className="border border-slate-900 p-2 text-[11px] text-red-700">معیوب / خارج از چرخه شارژ</td>
                        </tr>
                      )}
                      {/* Blank rows to complete physical form look */}
                      {[3, 4].map(idx => (
                        <tr key={idx} className="h-8">
                          <td className="border border-slate-900 p-2 text-center font-mono text-slate-400">{toPersianDigits(idx)}</td>
                          <td className="border border-slate-900 p-2"></td>
                          <td className="border border-slate-900 p-2"></td>
                          <td className="border border-slate-900 p-2"></td>
                          <td className="border border-slate-900 p-2"></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Discrepancy Note */}
                <div className="mt-3 p-2 border border-slate-400 bg-white/70 rounded text-[11px]">
                  <strong>گزارش انباردار: </strong>
                  <span>
                    مقدار {toPersianDigits(selectedInspectionForReceipt.declared_quantity)} عدد طبق بارنامه اظهار شده بود که پس از شمارش دقیق، {toPersianDigits(selectedInspectionForReceipt.actual_healthy_quantity)} عدد سالم و {toPersianDigits(selectedInspectionForReceipt.defective_quantity)} عدد معیوب تحویل گرفته شد (کسری: {toPersianDigits(Math.abs(selectedInspectionForReceipt.discrepancy_quantity))} عدد).
                  </span>
                </div>

                {/* Signatures Footer - CLEAN FOR PHYSICAL SIGNING WITHOUT USERNAME */}
                <div className="mt-8 pt-4 border-t-2 border-slate-900 grid grid-cols-3 text-center text-xs text-slate-900">
                  <div>
                    <div className="font-bold">تحویل‌دهنده (راننده):</div>
                    <div className="text-[10px] text-slate-600 mt-1">{selectedInspectionForReceipt.driver_name}</div>
                    <div className="h-12 mt-2"></div>
                  </div>
                  <div>
                    <div className="font-bold">تحویل‌گیرنده انبار:</div>
                    <div className="text-[10px] text-slate-600 mt-1">نام، امضا و اثر انگشت</div>
                    <div className="h-12 mt-2"></div>
                  </div>
                  <div>
                    <div className="font-bold">مسئول انبار و بازرسی:</div>
                    <div className="text-[10px] text-slate-600 mt-1">مهر و امضای کارخانه</div>
                    <div className="h-12 mt-2"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Define New Custom Item Type */}
      {showAddCustomItemModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-xs z-60 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-emerald-400" />
                <h4 className="text-sm font-bold text-slate-100">
                  تعریف نوع قلم وارده جدید (دسترسی همیشگی)
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowAddCustomItemModal(false)}
                className="text-slate-400 hover:text-slate-100 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomItemType} className="p-5 space-y-4 text-xs">
              <div className="bg-emerald-950/30 border border-emerald-800/50 rounded-xl p-3 text-emerald-200 text-[11px] leading-relaxed">
                قلم جدیدی که در این بخش تعریف می‌گردد به صورت یک‌بار برای همیشه در پایگاه‌داده و سامانه‌های ویندوز ذخیره خواهد شد و پس از تایید توسط مهندس حاجی‌وند در کاردکس گاز درج می‌گردد.
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  نام یا عنوان نوع قلم وارده *
                </label>
                <input
                  type="text"
                  placeholder="مثال: شیر کپسول ۵۰ لیتری، سیلندر کامپوزیت ۲۷ لیتری..."
                  value={newCustomItemName}
                  onChange={e => setNewCustomItemName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-hidden focus:border-emerald-500 font-medium"
                  autoFocus
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    دسته‌بندی اصلی
                  </label>
                  <select
                    value={newCustomItemCategory}
                    onChange={e => setNewCustomItemCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-hidden focus:border-emerald-500"
                  >
                    <option value="VALVE">شیرآلات</option>
                    <option value="CYLINDER">سیلندر و کپسول</option>
                    <option value="SCRAP">ضایعات و اسقاط</option>
                    <option value="OTHER">سایر اقلام</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    واحد شمارش
                  </label>
                  <input
                    type="text"
                    value={newCustomItemUnit}
                    onChange={e => setNewCustomItemUnit(e.target.value)}
                    placeholder="عدد / کیلوگرم"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-hidden focus:border-emerald-500 font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  توضیحات یا مشخصات فنی (اختیاری)
                </label>
                <input
                  type="text"
                  placeholder="مشخصات استاندارد، ظرفیت یا نوع آلیاژ..."
                  value={newCustomItemDesc}
                  onChange={e => setNewCustomItemDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddCustomItemModal(false)}
                  className="px-3.5 py-2 text-slate-400 hover:text-slate-200 bg-slate-800 rounded-xl font-medium cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={!newCustomItemName.trim()}
                  className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 text-slate-950 font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>ثبت همیشگی قلم</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit Custom Item Type / ویرایش نوع قلم وارده */}
      {editingCustomItem && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-xs z-60 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
              <div className="flex items-center gap-2">
                <Pencil className="w-4 h-4 text-emerald-400" />
                <h4 className="text-sm font-bold text-slate-100">
                  ویرایش مشخصات نوع قلم وارده
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setEditingCustomItem(null)}
                className="text-slate-400 hover:text-slate-100 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditCustomItem} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  نام یا عنوان قلم وارده *
                </label>
                <input
                  type="text"
                  value={editCustomItemName}
                  onChange={e => setEditCustomItemName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-hidden focus:border-emerald-500 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    دسته‌بندی اصلی
                  </label>
                  <select
                    value={editCustomItemCategory}
                    onChange={e => setEditCustomItemCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-hidden focus:border-emerald-500"
                  >
                    <option value="VALVE">شیرآلات</option>
                    <option value="CYLINDER">سیلندر و کپسول</option>
                    <option value="SCRAP">ضایعات و اسقاط</option>
                    <option value="OTHER">سایر اقلام</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    واحد شمارش
                  </label>
                  <input
                    type="text"
                    value={editCustomItemUnit}
                    onChange={e => setEditCustomItemUnit(e.target.value)}
                    placeholder="عدد / کیلوگرم"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-hidden focus:border-emerald-500 font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  توضیحات یا مشخصات فنی (اختیاری)
                </label>
                <input
                  type="text"
                  value={editCustomItemDesc}
                  onChange={e => setEditCustomItemDesc(e.target.value)}
                  placeholder="مشخصات استاندارد، ظرفیت یا نوع آلیاژ..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-between gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleDeleteCustomItem}
                  className="px-3 py-2 text-rose-400 hover:text-white bg-rose-950/60 hover:bg-rose-900 border border-rose-800/60 rounded-xl font-medium flex items-center gap-1 transition-colors cursor-pointer"
                  title="حذف این قلم از فهرست"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>حذف قلم</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingCustomItem(null)}
                    className="px-3.5 py-2 text-slate-400 hover:text-slate-200 bg-slate-800 rounded-xl font-medium cursor-pointer"
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    disabled={!editCustomItemName.trim()}
                    className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 text-slate-950 font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>ذخیره تغییرات</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit Inspection Record / ویرایش برگه بازرسی و ورود */}
      {editingInspection && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <Pencil className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-100">
                  ویرایش برگه بازرسی و ورود فیزیکی شیر و سیلندر
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingInspection(null)}
                className="text-slate-400 hover:text-slate-100 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditInspection} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">شماره برگه ورود کالا *</label>
                  <input
                    type="text"
                    value={editInspectionForm.formNumber}
                    onChange={e => setEditInspectionForm({ ...editInspectionForm, formNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 font-mono text-center font-bold focus:outline-hidden focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">تاریخ ورود (شمسی) *</label>
                  <PersianDatePicker
                    value={editInspectionForm.date}
                    onChange={val => setEditInspectionForm({ ...editInspectionForm, date: val })}
                    placeholder="1405/06/25"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">طرف حساب (مشتری/نمایندگی) *</label>
                  <select
                    value={editInspectionForm.customerId}
                    onChange={e => {
                      const c = customers.find(x => x.customer_id === e.target.value);
                      setEditInspectionForm({
                        ...editInspectionForm,
                        customerId: e.target.value,
                        customerName: c ? c.name : editInspectionForm.customerName
                      });
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-hidden focus:border-emerald-500"
                  >
                    {customers.map(c => (
                      <option key={c.customer_id} value={c.customer_id}>{c.name} ({c.city})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">نوع قلم وارده *</label>
                  <select
                    value={editInspectionForm.itemType}
                    onChange={e => {
                      const selectedVal = e.target.value;
                      const custom = customItemTypes.find(it => it.id === selectedVal);
                      let name = custom ? custom.name : 'شیر نو سیلندر گاز ۱۱ کیلوگرمی';
                      if (selectedVal === 'VALVE_NEW') name = 'شیر نو سیلندر گاز ۱۱ کیلوگرمی';
                      else if (selectedVal === 'VALVE_USED') name = 'شیر کهنه و مستعمل سیلندر گاز';
                      else if (selectedVal === 'CYLINDER_11KG') name = 'سیلندر گاز مایع ۱۱ کیلوگرم (کپسول خالی)';
                      else if (selectedVal === 'SCRAP') name = 'ضایعات بدنه کپسول و شیرآلات اسقاطی';
                      setEditInspectionForm({
                        ...editInspectionForm,
                        itemType: selectedVal,
                        itemName: name
                      });
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-hidden focus:border-emerald-500"
                  >
                    {customItemTypes.map(it => (
                      <option key={it.id} value={it.id}>{it.name} ({it.unit || 'عدد'})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">شماره بارنامه *</label>
                  <input
                    type="text"
                    value={editInspectionForm.waybillNumber}
                    onChange={e => setEditInspectionForm({ ...editInspectionForm, waybillNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 font-mono focus:outline-hidden focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">نام راننده / تحویل‌دهنده</label>
                  <input
                    type="text"
                    value={editInspectionForm.driverName}
                    onChange={e => setEditInspectionForm({ ...editInspectionForm, driverName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-hidden focus:border-emerald-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-slate-300 font-medium mb-1">پلاک خودرو حامل بار</label>
                  <input
                    type="text"
                    value={editInspectionForm.plateNumber}
                    onChange={e => setEditInspectionForm({ ...editInspectionForm, plateNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 font-mono focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Physical Counts Section with decimal support */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="font-bold text-slate-200 flex items-center justify-between">
                  <span>نتیجه شمارش و بازرسی فیزیکی (پشتیبانی از اعداد اعشاری و صحیح)</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">مقدار بارنامه (اظهاری)</label>
                    <input
                      type="number"
                      step="any"
                      dir="ltr"
                      min="0"
                      value={editInspectionForm.declaredQty}
                      onChange={e => setEditInspectionForm({ ...editInspectionForm, declaredQty: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono font-bold text-center"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-emerald-400 font-bold mb-1">شمارش واقعی</label>
                    <input
                      type="number"
                      step="any"
                      dir="ltr"
                      min="0"
                      value={editInspectionForm.healthyQty}
                      onChange={e => setEditInspectionForm({ ...editInspectionForm, healthyQty: e.target.value })}
                      className="w-full bg-emerald-950/40 border border-emerald-600 rounded-lg p-2 text-emerald-300 font-mono font-black text-center text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-rose-400 font-bold mb-1">تعداد معیوب</label>
                    <input
                      type="number"
                      step="any"
                      dir="ltr"
                      min="0"
                      value={editInspectionForm.defectiveQty}
                      onChange={e => setEditInspectionForm({ ...editInspectionForm, defectiveQty: e.target.value })}
                      className="w-full bg-rose-950/40 border border-rose-600 rounded-lg p-2 text-rose-300 font-mono font-black text-center text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-amber-400 font-bold mb-1">کسری بارنامه</label>
                    <div className="w-full bg-slate-900 border border-amber-600/60 rounded-lg p-2 text-amber-300 font-mono font-black text-center text-sm">
                      {(() => {
                        const d = parseDecimalNumber(editInspectionForm.declaredQty, 0);
                        const h = parseDecimalNumber(editInspectionForm.healthyQty, 0);
                        const def = parseDecimalNumber(editInspectionForm.defectiveQty, 0);
                        const disc = d - h - def;
                        return disc !== 0 ? `-${toPersianDigits(Math.abs(disc))}` : '۰';
                      })()}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">توضیحات و گزارش بازرس</label>
                <textarea
                  rows={2}
                  value={editInspectionForm.notes}
                  onChange={e => setEditInspectionForm({ ...editInspectionForm, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex items-center justify-between gap-2.5 -mx-5 -mb-5 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    const toDelete = editingInspection;
                    setEditingInspection(null);
                    setDeletingInspection(toDelete);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-rose-950/70 hover:bg-rose-900 text-rose-300 hover:text-white border border-rose-800/60 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="حذف این برگه ورودی"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>حذف برگه</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingInspection(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-lg transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>ذخیره تغییرات برگه بازرسی</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Delete Inspection Confirmation Modal */}
      {deletingInspection && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-xs z-60 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-800/80 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-rose-950/40">
              <div className="flex items-center gap-2.5 text-rose-400">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <h3 className="text-sm font-bold text-white">
                  تایید حذف برگه ورودی شیر و سیلندر
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDeletingInspection(null)}
                className="text-slate-400 hover:text-slate-100 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <p className="text-slate-200 leading-relaxed">
                آیا از حذف برگه ورود و بازرسی به شماره{' '}
                <strong className="text-amber-400 font-mono text-sm px-1.5 py-0.5 bg-slate-950 rounded border border-slate-700" dir="ltr">
                  {toEnglishDigits(deletingInspection.form_number)}
                </strong>{' '}
                اطمینان دارید؟
              </p>

              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2 text-slate-300">
                <div className="flex justify-between items-center pb-1.5 border-b border-slate-800/80">
                  <span className="text-slate-400">طرف حساب:</span>
                  <span className="font-bold text-slate-100">{deletingInspection.customer_name}</span>
                </div>
                <div className="flex justify-between items-center pb-1.5 border-b border-slate-800/80">
                  <span className="text-slate-400">قلم وارده:</span>
                  <span className="font-semibold text-slate-200">{deletingInspection.item_name}</span>
                </div>
                <div className="flex justify-between items-center pb-1.5 border-b border-slate-800/80">
                  <span className="text-slate-400">تعداد سالم تاییدشده:</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {toPersianDigits(deletingInspection.actual_healthy_quantity)} عدد
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">تاریخ ثبت:</span>
                  <span className="font-mono text-slate-300">{toPersianDigits(deletingInspection.date)}</span>
                </div>
              </div>

              <div className="bg-amber-950/30 border border-amber-800/40 rounded-xl p-3 text-amber-200/90 text-[11px] leading-relaxed flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  توجه: با حذف این برگه، ورود ثبت‌شده مرتبط در گردش انبار نیز لغو گردیده و موجودی کالاها به حالت قبل بازمی‌گردد.
                </span>
              </div>

              {/* Action Buttons in vertical stack */}
              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => handleDeleteInspection(deletingInspection)}
                  className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>تایید و حذف نهایی برگه</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDeletingInspection(null)}
                  className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl transition-colors cursor-pointer text-center"
                >
                  انصراف و بازگشت
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Goods Entry Receipt for Inspection */}
      {selectedInspectionForReceipt && (
        <GoodsEntryReceiptModal
          isOpen={Boolean(selectedInspectionForReceipt)}
          onClose={() => setSelectedInspectionForReceipt(null)}
          entry={{
            entry_id: selectedInspectionForReceipt.kardex_entry_id || `INSP-${selectedInspectionForReceipt.inspection_id}`,
            customer_id: selectedInspectionForReceipt.customer_id,
            customer_name: selectedInspectionForReceipt.customer_name,
            date: selectedInspectionForReceipt.date,
            description: `ورودی تاییدشده [${selectedInspectionForReceipt.item_name}] (بارنامه ${selectedInspectionForReceipt.waybill_number || '-'})`,
            transfer_sheet_number: selectedInspectionForReceipt.form_number,
            cylinder_in: selectedInspectionForReceipt.item_type?.includes('CYLINDER') ? selectedInspectionForReceipt.actual_healthy_quantity : 0,
            cylinder_out: 0,
            scrap_out: selectedInspectionForReceipt.item_type?.includes('SCRAP') ? selectedInspectionForReceipt.defective_quantity : 0,
            cylinder_balance: 0,
            scrap_balance: 0,
            new_valve_in: selectedInspectionForReceipt.item_type?.includes('VALVE') ? selectedInspectionForReceipt.actual_healthy_quantity : 0,
            new_valve_out: 0,
            new_valve_balance: 0,
            dispatched: '',
            used_valve_in: 0,
            used_valve_out: 0,
            used_valve_balance: 0,
            defective: selectedInspectionForReceipt.defective_quantity,
            user_id: selectedInspectionForReceipt.inspector_user_id || 'USR-003',
            created_by_username: selectedInspectionForReceipt.inspector_name || 'hajivand',
            device_id: 'WIN7-ANBAR1',
            event_id: 'EVT-INSP',
            created_at: selectedInspectionForReceipt.created_at,
            updated_at: selectedInspectionForReceipt.updated_at
          }}
          customer={customers.find(c => c.customer_id === selectedInspectionForReceipt.customer_id) || {
            customer_id: selectedInspectionForReceipt.customer_id,
            name: selectedInspectionForReceipt.customer_name,
            phone: '',
            province: 'تهران',
            city: 'تهران',
            credit_limit: 0,
            current_balance: 0,
            customer_type: 'عمده',
            created_at: '',
            updated_at: ''
          }}
          currentEnv={currentEnv}
          currentUser={currentUser || undefined}
          onSaved={() => {
            onRefresh();
          }}
        />
      )}

      {/* Modal: Dedicated Valve Intake (ورودی شیرآلات به انبار و ارسال اعلان به خانم کرمی) */}
      {showValveIntakeModal && (
        <ValveEntryModal
          isOpen={showValveIntakeModal}
          onClose={() => setShowValveIntakeModal(false)}
          currentEnv={currentEnv}
          currentUser={currentUser}
          currentCustomerId={customers[0]?.customer_id || ''}
          customers={customers}
          onSuccess={(result) => {
            setShowValveIntakeModal(false);
            if (result.inspection) {
              setLocalInspections(prev => [result.inspection, ...prev.filter(i => i.inspection_id !== result.inspection.inspection_id)]);
            } else {
              const fresh = LocalStorageManager.getCylinderValveInspections(currentEnv);
              setLocalInspections([...fresh]);
            }
            onRefresh();
            setToastMessage({
              text: `ورودی شیرآلات برگه «${result.sheetNumber}» (${toPersianDigits(result.totalAllValves)} عدد) توسط انباردار تایید و در انبار ثبت گردید. اعلان جهت تایید نهایی و ایجاد کاردکس برای مدیر داخلی خانم کرمی ارسال شد.`,
              type: 'success'
            });
            setTimeout(() => setToastMessage(null), 8000);
          }}
        />
      )}
    </div>
  );
};
