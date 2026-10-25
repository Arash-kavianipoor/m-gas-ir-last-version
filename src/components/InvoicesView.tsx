import React, { useState, useEffect } from 'react';
import {
  Invoice,
  Customer,
  Supplier,
  Product,
  Warehouse,
  RuntimeEnvironment,
  User,
  StockMovement
} from '../types';
import { LocalStorageManager } from '../database/storage';
import { SEED_USERS } from '../database/seed-data';
import {
  FileText,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  ShoppingCart,
  Calendar,
  X,
  Save,
  Check,
  Edit2,
  Trash2,
  ArrowLeftRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import {
  formatCurrencyToman,
  formatPersianDateTime,
  toPersianDigits,
  generateUUID
} from '../utils/persian';
import { isSafeInput, sanitizeInput, sanitizeNumber, validateFieldSecurity } from '../utils/security';

interface InvoicesViewProps {
  invoices: Invoice[];
  customers: Customer[];
  suppliers: Supplier[];
  products: Product[];
  warehouses: Warehouse[];
  users?: User[];
  currentEnv: RuntimeEnvironment;
  currentUser: User;
}

export const InvoicesView: React.FC<InvoicesViewProps> = ({
  invoices,
  customers,
  suppliers,
  products,
  warehouses,
  users,
  currentEnv,
  currentUser
}) => {
  const allUsers = users && users.length > 0 ? users : SEED_USERS;
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'SALE' | 'PURCHASE'>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // Global Escape key listener to close modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowAddModal(false);
        setEditingInvoice(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Edit Invoice State
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [deletingInvoice, setDeletingInvoice] = useState<Invoice | null>(null);
  const [editStatus, setEditStatus] = useState<string>('ISSUED');
  const [editNotes, setEditNotes] = useState('');
  const [editError, setEditError] = useState<string | null>(null);

  // New Invoice Form
  const [invType, setInvType] = useState<'SALE' | 'PURCHASE'>('SALE');
  const [partyId, setPartyId] = useState('');
  const [warehouseId, setWarehouseId] = useState(warehouses[0]?.warehouse_id || '');
  const [selectedProduct, setSelectedProduct] = useState(products[0]?.product_id || '');
  const [itemQuantity, setItemQuantity] = useState(1);
  const [itemUnitPrice, setItemUnitPrice] = useState(products[0]?.sale_price || 100000);
  const [invoiceNotes, setInvoiceNotes] = useState('');

  const filtered = invoices.filter(i => {
    const matchSearch =
      i.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.invoice_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = typeFilter === 'ALL' || i.invoice_type === typeFilter;
    return matchSearch && matchType;
  });

  const handleOpenEdit = (inv: Invoice) => {
    setEditingInvoice(inv);
    setEditStatus(inv.status || 'ISSUED');
    setEditNotes(inv.notes || '');
    setEditError(null);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInvoice) return;

    // Anti-Injection & Security Check on Edit Notes
    const notesCheck = validateFieldSecurity(editNotes, 'یادداشت فاکتور', { maxLength: 500, allowMultiline: true });
    if (!notesCheck.isValid) {
      setEditError(notesCheck.error || 'خطای امنیتی در یادداشت فاکتور.');
      return;
    }

    const res = LocalStorageManager.updateInvoice(
      currentEnv,
      editingInvoice.invoice_id,
      {
        status: editStatus as any,
        notes: notesCheck.cleanValue
      },
      currentUser
    );

    if (res.success) {
      setEditingInvoice(null);
      setEditError(null);
    } else {
      setEditError(res.error || 'خطا در ویرایش فاکتور');
    }
  };

  const handleDeleteInvoice = (inv: Invoice) => {
    setDeletingInvoice(inv);
  };

  const handleConfirmDeleteInvoice = () => {
    if (!deletingInvoice) return;
    const res = LocalStorageManager.deleteInvoice(currentEnv, deletingInvoice.invoice_id, currentUser);
    if (!res.success) {
      alert(res.error || 'خطا در حذف فاکتور');
    }
    setDeletingInvoice(null);
  };

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const prod = products.find(p => p.product_id === selectedProduct);
    if (!prod) return;

    // Anti-Injection & Security Check
    const notesCheck = validateFieldSecurity(invoiceNotes, 'توضیحات فاکتور', { maxLength: 500, allowMultiline: true });
    if (!notesCheck.isValid) {
      alert(notesCheck.error);
      return;
    }

    const invoiceId = generateUUID('INV');
    const invoiceNumber = `${invType === 'SALE' ? 'FA' : 'PUR'}-${Date.now().toString().slice(-6)}`;
    const totalAmount = sanitizeNumber(itemQuantity * itemUnitPrice, 0, 0, 1000000000000);

    const newInvoice: Invoice = {
      invoice_id: invoiceId,
      invoice_number: invoiceNumber,
      invoice_type: invType,
      customer_id: invType === 'SALE' ? partyId || customers[0]?.customer_id : undefined,
      supplier_id: invType === 'PURCHASE' ? partyId || suppliers[0]?.supplier_id : undefined,
      warehouse_id: warehouseId,
      total_amount: totalAmount,
      tax_amount: 0,
      discount_amount: 0,
      final_amount: totalAmount,
      status: 'ISSUED',
      due_date: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
      user_id: currentUser.user_id,
      created_by_username: currentUser.username,
      notes: notesCheck.cleanValue,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // 1. Record Invoice in Local Database & Sync Queue
    LocalStorageManager.recordLocalChange(
      currentEnv,
      currentUser.user_id,
      'INVOICE',
      'CREATE',
      invoiceId,
      newInvoice,
      `CREATE_${invType}_INVOICE`,
      { invoice_number: invoiceNumber, total_amount: totalAmount }
    );

    // 2. Automatically generate corresponding Stock Movement
    const movId = generateUUID('MOV');
    const stockMov: StockMovement = {
      movement_id: movId,
      product_id: prod.product_id,
      warehouse_id: warehouseId,
      quantity: itemQuantity,
      movement_type: invType === 'SALE' ? 'STOCK_OUT' : 'STOCK_IN',
      reference_id: invoiceNumber,
      unit_price: itemUnitPrice,
      user_id: currentUser.user_id,
      created_by_username: currentUser.username,
      device_id: currentUser.allowed_device_id,
      event_id: generateUUID('EVT'),
      notes: `صدور خودکار حواله/رسید ناشی از فاکتور ${invoiceNumber}`,
      created_at: new Date().toISOString()
    };

    LocalStorageManager.recordLocalChange(
      currentEnv,
      currentUser.user_id,
      'STOCK_MOVEMENT',
      'CREATE',
      movId,
      stockMov,
      `AUTO_STOCK_MOVEMENT_${invType}`,
      { invoice_id: invoiceId, quantity: itemQuantity }
    );

    setShowAddModal(false);
    setInvoiceNotes('');
  };

  return (
    <div className="space-y-6">
      
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            <span>مدیریت فاکتورهای فروش و اسناد خرید</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            صدور و ویرایش فاکتور با تأثیر آنی بر موجودی انبار، تولید حواله خروج/رسید ورود و همگام‌سازی خودکار دوطرفه
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/60 border border-emerald-800/60 rounded-lg text-emerald-300 text-xs">
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>همگام‌سازی دوطرفه فعال (مدیریت ⇄ کلودفلر ⇄ انبار)</span>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>صدور فاکتور جدید</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="جستجو در شماره فاکتور..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-3 pr-9 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 px-3 py-2 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">همه فاکتورها</option>
            <option value="SALE">فاکتور فروش مشتری</option>
            <option value="PURCHASE">فاکتور خرید از تأمین‌کننده</option>
          </select>
        </div>
      </div>

      {/* Invoices List / Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            هیچ فاکتوری با فیلترهای انتخابی یافت نشد.
          </div>
        ) : (
          <>
            {/* Mobile Card View (md:hidden) */}
            <div className="md:hidden divide-y divide-slate-800/60">
              {filtered.map(inv => {
                const isSale = inv.invoice_type === 'SALE';
                const party = isSale
                  ? customers.find(c => c.customer_id === inv.customer_id)?.name || inv.customer_id
                  : suppliers.find(s => s.supplier_id === inv.supplier_id)?.name || inv.supplier_id;
                const wh = warehouses.find(w => w.warehouse_id === inv.warehouse_id);

                return (
                  <div key={inv.invoice_id} className="p-4 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-indigo-300">
                          {inv.invoice_number}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium border inline-flex items-center gap-1 ${
                          isSale ? 'bg-emerald-950 text-emerald-300 border-emerald-800/60' : 'bg-blue-950 text-blue-300 border-blue-800/60'
                        }`}>
                          {isSale ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownLeft className="w-3 h-3" />}
                          <span>{isSale ? 'فروش' : 'خرید'}</span>
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                        inv.status === 'PAID'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/50'
                          : inv.status === 'CANCELLED'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800/50'
                          : 'bg-slate-800 text-slate-300'
                      }`}>
                        {inv.status === 'ISSUED' ? 'صادر شده' : inv.status === 'PAID' ? 'تسویه شده' : inv.status === 'CANCELLED' ? 'لغو شده' : inv.status}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-slate-100 flex items-center justify-between">
                      <span className="text-slate-400 font-normal">طرف حساب:</span>
                      <span>{party}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">انبار:</span>
                      <span className="text-slate-300 font-medium">{wh?.name || inv.warehouse_id}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">مبلغ نهایی:</span>
                      <span className="font-bold text-amber-400 font-mono text-sm">
                        {formatCurrencyToman(inv.final_amount)} تومان
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
                      <span>{formatPersianDateTime(inv.created_at)}</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(inv)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-indigo-600/30 text-indigo-300 flex items-center gap-1 text-xs cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>ویرایش</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteInvoice(inv)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-rose-600/30 text-rose-300 flex items-center gap-1 text-xs cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>حذف</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table View (hidden md:block) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-right text-xs min-w-[750px]">
                <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 text-[11px]">
                  <tr>
                    <th className="p-3">شماره فاکتور</th>
                    <th className="p-3">نوع سند</th>
                    <th className="p-3">طرف حساب (مشتری / تأمین‌کننده)</th>
                    <th className="p-3">انبار درگیر</th>
                    <th className="p-3">مبلغ نهایی (تومان)</th>
                    <th className="p-3">وضعیت</th>
                    <th className="p-3">تاریخ صدور</th>
                    <th className="p-3 print:hidden">کاربر ثبت‌کننده</th>
                    <th className="p-3 text-center">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {filtered.map(inv => {
                    const isSale = inv.invoice_type === 'SALE';
                    const party = isSale
                      ? customers.find(c => c.customer_id === inv.customer_id)?.name || inv.customer_id
                      : suppliers.find(s => s.supplier_id === inv.supplier_id)?.name || inv.supplier_id;
                    const wh = warehouses.find(w => w.warehouse_id === inv.warehouse_id);

                    return (
                      <tr key={inv.invoice_id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3 font-mono font-bold text-indigo-300">
                          {inv.invoice_number}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-medium border inline-flex items-center gap-1 ${
                            isSale ? 'bg-emerald-950 text-emerald-300 border-emerald-800/60' : 'bg-blue-950 text-blue-300 border-blue-800/60'
                          }`}>
                            {isSale ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownLeft className="w-3 h-3" />}
                            <span>{isSale ? 'فاکتور فروش' : 'خرید مواد/کالا'}</span>
                          </span>
                        </td>
                        <td className="p-3 font-bold text-slate-100">{party}</td>
                        <td className="p-3 text-slate-400">{wh?.name || inv.warehouse_id}</td>
                        <td className="p-3 font-bold text-slate-100">{formatCurrencyToman(inv.final_amount)}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                            inv.status === 'PAID'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/50'
                              : inv.status === 'CANCELLED'
                              ? 'bg-rose-950 text-rose-300 border border-rose-800/50'
                              : 'bg-slate-800 text-slate-300'
                          }`}>
                            {inv.status === 'ISSUED' ? 'صادر شده' : inv.status === 'PAID' ? 'تسویه شده' : inv.status === 'CANCELLED' ? 'لغو شده' : inv.status}
                          </span>
                        </td>
                        <td className="p-3 text-[11px] text-slate-400">
                          {formatPersianDateTime(inv.created_at)}
                        </td>
                        <td className="p-3 print:hidden" data-user-badge="true">
                          <div className="font-mono font-bold text-xs text-indigo-300">
                            @{inv.created_by_username || (allUsers.find(u => u.user_id === inv.user_id)?.username) || 'amouei'}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {allUsers.find(u => u.user_id === inv.user_id)?.full_name || inv.user_id}
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleOpenEdit(inv)}
                              title="ویرایش وضعیت و توضیحات فاکتور"
                              className="p-1 rounded bg-slate-800 hover:bg-indigo-600/30 text-slate-300 hover:text-indigo-300 transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteInvoice(inv)}
                              title="حذف فاکتور"
                              className="p-1 rounded bg-slate-800 hover:bg-rose-600/30 text-slate-300 hover:text-rose-300 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* CREATE INVOICE MODAL */}
      {showAddModal && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden cursor-default"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                <span>صدور فاکتور جدید و اعمال خودکار بر انبار</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">نوع فاکتور</label>
                  <select
                    value={invType}
                    onChange={(e) => setInvType(e.target.value as any)}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="SALE">فاکتور فروش به مشتری (کسر از انبار)</option>
                    <option value="PURCHASE">فاکتور خرید از تأمین‌کننده (ورود به انبار)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {invType === 'SALE' ? 'انتخاب مشتری' : 'انتخاب تأمین‌کننده'}
                  </label>
                  <select
                    value={partyId}
                    onChange={(e) => setPartyId(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    {invType === 'SALE'
                      ? customers.map(c => (
                          <option key={c.customer_id} value={c.customer_id}>
                            {c.name} {c.company_name ? `(${c.company_name})` : ''}
                          </option>
                        ))
                      : suppliers.map(s => (
                          <option key={s.supplier_id} value={s.supplier_id}>
                            {s.name}
                          </option>
                        ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">انبار تحویل‌دهنده / گیرنده</label>
                  <select
                    value={warehouseId}
                    onChange={(e) => setWarehouseId(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    {warehouses.map(w => (
                      <option key={w.warehouse_id} value={w.warehouse_id}>
                        {w.name} {w.shelf_location ? `(قفسه ${w.shelf_location})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">کالای انتخابی</label>
                  <select
                    value={selectedProduct}
                    onChange={(e) => {
                      setSelectedProduct(e.target.value);
                      const prod = products.find(p => p.product_id === e.target.value);
                      if (prod) {
                        setItemUnitPrice(invType === 'SALE' ? prod.sale_price : prod.purchase_price);
                      }
                    }}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    {products.map(p => (
                      <option key={p.product_id} value={p.product_id}>
                        {p.name} ({p.sku})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">تعداد / مقدار</label>
                  <input
                    type="number"
                    min={1}
                    value={itemQuantity}
                    onChange={(e) => setItemQuantity(Number(e.target.value))}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">قیمت واحد (تومان)</label>
                  <input
                    type="number"
                    value={itemUnitPrice}
                    onChange={(e) => setItemUnitPrice(Number(e.target.value))}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">جمع کل فاکتور:</span>
                <span className="text-sm font-bold text-emerald-400 font-mono">
                  {formatCurrencyToman(itemQuantity * itemUnitPrice)}
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">توضیحات و شرایط پرداخت</label>
                <textarea
                  rows={2}
                  value={invoiceNotes}
                  onChange={(e) => setInvoiceNotes(e.target.value)}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  placeholder="نحوه تسویه، چک، مدت اعتبار..."
                />
              </div>

              <div className="p-3 border-t border-slate-800 flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow"
                >
                  تأیید و صدور فاکتور
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT INVOICE MODAL */}
      {editingInvoice && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setEditingInvoice(null)}
        >
          <div
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden cursor-default"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">
                  ویرایش سند فاکتور: {editingInvoice.invoice_number}
                </h3>
              </div>
              <button
                onClick={() => setEditingInvoice(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-4 space-y-4">
              {editError && (
                <div className="p-2.5 rounded-lg bg-rose-950/80 border border-rose-800/80 text-rose-300 text-xs">
                  {editError}
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">وضعیت پرداخت فاکتور</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="ISSUED">صادر شده (در انتظار تسویه)</option>
                    <option value="PAID">تسویه شده (پرداخت کامل)</option>
                    <option value="CANCELLED">لغو شده / ابطال</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">مبلغ نهایی (تومان - فقط خواندنی)</label>
                  <input
                    type="text"
                    disabled
                    value={formatCurrencyToman(editingInvoice.final_amount)}
                    className="w-full p-2 bg-slate-950/50 border border-slate-800 rounded-lg text-xs text-slate-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">توضیحات و شرایط تسویه</label>
                  <textarea
                    rows={3}
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    placeholder="توضیحات تکمیلی..."
                  />
                </div>

                <div className="p-2.5 rounded-lg bg-indigo-950/30 border border-indigo-800/40 text-[11px] text-indigo-300 flex items-center gap-1.5">
                  <ArrowLeftRight className="w-3.5 h-3.5 shrink-0" />
                  <span>این ویرایش به صورت رمزنگاری شده پس از حداکثر ۲۰ ثانیه در سایر کامپیوترها منعکس می‌شود.</span>
                </div>
              </div>

              <div className="p-3 border-t border-slate-800 flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingInvoice(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>ذخیره و همگام‌سازی</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Deleting Invoice */}
      {deletingInvoice && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          onClick={() => setDeletingInvoice(null)}
        >
          <div
            className="bg-slate-900 border border-rose-800/80 rounded-2xl w-full max-w-md shadow-2xl p-5 text-right space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
              <Trash2 className="w-5 h-5" />
              <span>حذف فاکتور</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              آیا از حذف فاکتور شماره <strong className="text-white font-mono">{deletingInvoice.invoice_number}</strong> اطمینان دارید؟ این تغییر پس از ۲۰ ثانیه در سایر سیستم‌ها نیز اعمال خواهد شد.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setDeletingInvoice(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteInvoice}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-900/40"
              >
                حذف فاکتور
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
