import React, { useState, useEffect } from 'react';
import { Supplier, RuntimeEnvironment, User } from '../types';
import { LocalStorageManager } from '../database/storage';
import {
  Truck,
  Plus,
  Search,
  Building,
  Phone,
  CreditCard,
  MapPin,
  X
} from 'lucide-react';
import {
  formatCurrencyToman,
  toPersianDigits,
  generateUUID
} from '../utils/persian';
import { isSafeInput, sanitizeInput, sanitizeNumber, validateFieldSecurity } from '../utils/security';

interface SuppliersViewProps {
  suppliers: Supplier[];
  currentEnv: RuntimeEnvironment;
  currentUser: User;
}

export const SuppliersView: React.FC<SuppliersViewProps> = ({
  suppliers,
  currentEnv,
  currentUser
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Global Escape key listener to close modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowAddModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  const [newSup, setNewSup] = useState<Partial<Supplier>>({
    name: '',
    contact_person: '',
    phone: '',
    economic_code: '',
    province: 'تهران',
    city: 'تهران',
    address: '',
    current_balance: 0,
    notes: ''
  });

  const filtered = suppliers.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.contact_person && s.contact_person.toLowerCase().includes(searchTerm.toLowerCase())) ||
    s.phone.includes(searchTerm)
  );

  const handleSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault();

    // Anti-Injection & Security Guards
    const nameCheck = validateFieldSecurity(newSup.name, 'نام شرکت تأمین‌کننده', { required: true, maxLength: 200 });
    if (!nameCheck.isValid) {
      alert(nameCheck.error);
      return;
    }
    const phoneCheck = validateFieldSecurity(newSup.phone, 'شماره تلفن', { required: true, maxLength: 50 });
    if (!phoneCheck.isValid) {
      alert(phoneCheck.error);
      return;
    }
    const contactCheck = validateFieldSecurity(newSup.contact_person, 'شخص رابط', { maxLength: 100 });
    if (!contactCheck.isValid) {
      alert(contactCheck.error);
      return;
    }
    const economicCheck = validateFieldSecurity(newSup.economic_code, 'کد اقتصادی', { maxLength: 50 });
    if (!economicCheck.isValid) {
      alert(economicCheck.error);
      return;
    }
    const addressCheck = validateFieldSecurity(newSup.address, 'آدرس تأمین‌کننده', { maxLength: 300 });
    if (!addressCheck.isValid) {
      alert(addressCheck.error);
      return;
    }
    const notesCheck = validateFieldSecurity(newSup.notes, 'یادداشت', { maxLength: 500, allowMultiline: true });
    if (!notesCheck.isValid) {
      alert(notesCheck.error);
      return;
    }

    const supId = generateUUID('SUP');
    const fullSup: Supplier = {
      supplier_id: supId,
      name: nameCheck.cleanValue,
      company_name: nameCheck.cleanValue,
      contact_person: contactCheck.cleanValue,
      phone: phoneCheck.cleanValue,
      economic_code: economicCheck.cleanValue,
      province: sanitizeInput(newSup.province || 'تهران', { maxLength: 50 }),
      city: sanitizeInput(newSup.city || 'تهران', { maxLength: 50 }),
      address: addressCheck.cleanValue,
      credit_limit: 500000000,
      current_balance: sanitizeNumber(newSup.current_balance, 0, 0, 1000000000000),
      notes: notesCheck.cleanValue,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    LocalStorageManager.recordLocalChange(
      currentEnv,
      currentUser.user_id,
      'SUPPLIER',
      'CREATE',
      supId,
      fullSup,
      'CREATE_SUPPLIER',
      { name: fullSup.name }
    );

    setShowAddModal(false);
    setNewSup({
      name: '',
      contact_person: '',
      phone: '',
      economic_code: '',
      province: 'تهران',
      city: 'تهران',
      address: '',
      current_balance: 0,
      notes: ''
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Truck className="w-5 h-5 text-indigo-400" />
            <span>مدیریت تأمین‌کنندگان و کارخانجات طرف قرارداد</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            ثبت پرونده‌های تأمین کالا، شماره حساب‌ها و صورت‌وضعیت مالی با همگام‌سازی D1
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          title="افزودن و تعریف پرونده تأمین‌کننده جدید"
          className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all whitespace-nowrap cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span>تأمین‌کننده جدید</span>
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="جستجو در نام شرکت، شخص رابط یا شماره تماس..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-3 pr-9 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(s => (
          <div key={s.supplier_id} className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-indigo-950/70 border border-indigo-700/40 flex items-center justify-center text-indigo-300 font-bold">
                  <Building className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{s.name}</h3>
                  <div className="text-xs text-slate-400">رابط: {s.contact_person || 'مدیریت بازرگانی'}</div>
                </div>
              </div>
              <span className="text-[10px] font-mono text-slate-500">{s.supplier_id}</span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-300 border-t border-slate-800/80 pt-2.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">شماره تماس:</span>
                <span className="font-mono text-slate-200">{toPersianDigits(s.phone)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">شناسه اقتصادی:</span>
                <span className="font-mono text-slate-200">{toPersianDigits(s.economic_code) || 'ثبت نشده'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">مانده حساب:</span>
                <span className={`font-bold ${
                  s.current_balance > 0 ? 'text-rose-400' : s.current_balance < 0 ? 'text-emerald-400' : 'text-slate-400'
                }`}>
                  {s.current_balance === 0 ? 'تسویه کامل' : formatCurrencyToman(Math.abs(s.current_balance))}
                  {s.current_balance > 0 ? ' (طلبکار)' : s.current_balance < 0 ? ' (بدهکار)' : ''}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-slate-500 pt-1">
                <MapPin className="w-3 h-3 text-slate-600" />
                <span>{s.province}، {s.city}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ADD SUPPLIER MODAL */}
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
                <Truck className="w-4 h-4 text-indigo-400" />
                <span>ثبت تأمین‌کننده جدید</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSupplier} className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">نام شرکت / کارخانه *</label>
                <input
                  type="text"
                  required
                  value={newSup.name}
                  onChange={(e) => setNewSup({ ...newSup, name: e.target.value })}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  placeholder="مثال: شرکت صنایع فولاد نطنز"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">نام شخص رابط</label>
                  <input
                    type="text"
                    value={newSup.contact_person}
                    onChange={(e) => setNewSup({ ...newSup, contact_person: e.target.value })}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">شماره تماس *</label>
                  <input
                    type="text"
                    required
                    value={newSup.phone}
                    onChange={(e) => setNewSup({ ...newSup, phone: e.target.value })}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                    placeholder="021-889900..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">استان</label>
                  <input
                    type="text"
                    value={newSup.province}
                    onChange={(e) => setNewSup({ ...newSup, province: e.target.value })}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">شهر</label>
                  <input
                    type="text"
                    value={newSup.city}
                    onChange={(e) => setNewSup({ ...newSup, city: e.target.value })}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
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
                  ذخیره تأمین‌کننده
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
