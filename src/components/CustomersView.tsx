import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Customer, RuntimeEnvironment, User } from '../types';
import { LocalStorageManager } from '../database/storage';
import {
  Users,
  UserPlus,
  FileSpreadsheet,
  FileText,
  Search,
  Check,
  Download,
  Copy,
  AlertCircle,
  Building,
  Phone,
  CreditCard,
  MapPin,
  ExternalLink,
  Trash2,
  Edit3,
  Save,
  X,
  Flame,
  Info,
  LayoutGrid,
  List,
  UserCheck,
  Hash,
  FileCheck2,
  PhoneCall,
  ShieldAlert,
  Lock,
  ShieldCheck,
  UploadCloud,
  RefreshCw,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import {
  formatCurrencyToman,
  formatPersianDateTime,
  toPersianDigits,
  generateUUID
} from '../utils/persian';
import {
  isSafeInput,
  sanitizeInput,
  sanitizeNumber,
  validateFieldSecurity
} from '../utils/security';

interface CustomersViewProps {
  customers: Customer[];
  currentEnv: RuntimeEnvironment;
  currentUser: User;
  onOpenGasKardex?: (customerId: string) => void;
  onRefresh?: () => void;
}

const IRAN_PROVINCES = [
  'تهران', 'اصفهان', 'خراسان رضوی', 'فارس', 'آذربایجان شرقی', 'مازندران',
  'خوزستان', 'گیلان', 'البرز', 'کرمان', 'آذربایجان غربی', 'کرمانشاه',
  'همدان', 'یزد', 'قم', 'مرکزی', 'قزوین', 'سمنان', 'زنجان', 'بوشهر',
  'هرمزگان', 'لرستان', 'کردستان', 'گلستان', 'اردبیل', 'چهارمحال و بختیاری',
  'خراسان جنوبی', 'خراسان شمالی', 'کهگیلویه و بویراحمد', 'ایلام', 'سیستان و بلوچستان'
];

interface CustomerFormData {
  name: string;
  company_name: string;
  manager_name: string;
  phone: string;
  phone_secondary: string;
  national_id: string;
  economic_code: string;
  registration_number: string;
  postal_code: string;
  fax: string;
  province: string;
  city: string;
  address: string;
  credit_limit: number;
  balance_type: 'ZERO' | 'DEBTOR' | 'CREDITOR';
  balance_amount: number;
  customer_type: 'عمده' | 'خرده' | 'سازمانی' | 'پیمانکاری';
  notes: string;
}

const INITIAL_FORM_DATA: CustomerFormData = {
  name: '',
  company_name: '',
  manager_name: '',
  phone: '',
  phone_secondary: '',
  national_id: '',
  economic_code: '',
  registration_number: '',
  postal_code: '',
  fax: '',
  province: 'تهران',
  city: 'تهران',
  address: '',
  credit_limit: 100000000,
  balance_type: 'ZERO',
  balance_amount: 0,
  customer_type: 'عمده',
  notes: ''
};

// 9 Standard columns of customers.xlsx
export const STANDARD_EXCEL_COLUMNS = [
  { key: 'row_index', label: 'ردیف', width: 'w-14' },
  { key: 'company_name', label: 'نام شرکت', width: 'w-48' },
  { key: 'national_id', label: 'شناسه ملی', width: 'w-32' },
  { key: 'registration_number', label: 'شماره ثبت', width: 'w-24' },
  { key: 'postal_code', label: 'کدپستی', width: 'w-28' },
  { key: 'address', label: 'آدرس', width: 'w-72' },
  { key: 'phone_secondary', label: 'تلفن ثابت', width: 'w-36' },
  { key: 'fax', label: 'فکس', width: 'w-32' },
  { key: 'phone', label: 'تلفن کارفرما', width: 'w-48' }
];

export interface ExcelSyncItem {
  status: 'ADD' | 'UPDATE' | 'UNCHANGED' | 'DELETE';
  customer: Customer;
  existingCustomer?: Customer;
  changes?: string[];
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers,
  currentEnv,
  currentUser,
  onOpenGasKardex,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() =>
    typeof window !== 'undefined' && window.innerWidth < 768 ? 'grid' : 'list'
  );

  // Modals state
  const [showImporter, setShowImporter] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Form states for Add and Edit
  const [addFormData, setAddFormData] = useState<CustomerFormData>(INITIAL_FORM_DATA);
  const [editFormData, setEditFormData] = useState<CustomerFormData>(INITIAL_FORM_DATA);

  // Batch Importer / Excel Synchronization State
  const [importTab, setImportTab] = useState<'EXCEL' | 'TEMPLATE' | 'TEXT'>('EXCEL');
  const [rawTextInput, setRawTextInput] = useState('');
  const [syncItems, setSyncItems] = useState<ExcelSyncItem[]>([]);
  const [importNotice, setImportNotice] = useState<string | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [excelFileName, setExcelFileName] = useState<string | null>(null);
  const [showDeleteWarningModal, setShowDeleteWarningModal] = useState(false);
  const [deleteConfirmChecked, setDeleteConfirmChecked] = useState(false);
  const [syncFilter, setSyncFilter] = useState<'ALL' | 'ADD' | 'UPDATE' | 'DELETE' | 'UNCHANGED'>('ALL');

  // Permission check: Exclusively Mousa Amouei
  const isAmouei = Boolean(
    currentUser && (
      currentUser.username?.toLowerCase() === 'amouei' ||
      currentUser.user_id === 'USR-001' ||
      currentUser.full_name?.includes('عمویی') ||
      currentUser.role === 'ADMIN' ||
      currentUser.role === 'GENERAL_MANAGER'
    )
  );

  // Global Escape key listener to close modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowImporter(false);
        setShowDeleteWarningModal(false);
        setSyncItems([]);
        setImportNotice(null);
        setShowAddModal(false);
        setEditingCustomer(null);
        setSelectedCustomer(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter customers
  const filtered = customers.filter(c => {
    const term = searchTerm.toLowerCase();
    const matchSearch =
      c.name.toLowerCase().includes(term) ||
      (c.company_name && c.company_name.toLowerCase().includes(term)) ||
      (c.manager_name && c.manager_name.toLowerCase().includes(term)) ||
      (c.phone && c.phone.includes(searchTerm)) ||
      (c.phone_secondary && c.phone_secondary.includes(searchTerm)) ||
      (c.national_id && c.national_id.includes(searchTerm)) ||
      (c.economic_code && c.economic_code.includes(searchTerm)) ||
      (c.registration_number && c.registration_number.includes(searchTerm)) ||
      (c.postal_code && c.postal_code.includes(searchTerm)) ||
      (c.address && c.address.toLowerCase().includes(term)) ||
      c.customer_id.toLowerCase().includes(term);
    const matchType = typeFilter === 'ALL' || c.customer_type === typeFilter;
    return matchSearch && matchType;
  }).sort((a, b) => {
    if (a.customer_id === 'CUST-MGAS-VALVE') return -1;
    if (b.customer_id === 'CUST-MGAS-VALVE') return 1;
    if (a.row_index && b.row_index) return a.row_index - b.row_index;
    if (a.row_index) return -1;
    if (b.row_index) return 1;
    return 0;
  });

  // Open Edit Customer Modal
  const handleOpenEdit = (cust: Customer) => {
    let bType: 'ZERO' | 'DEBTOR' | 'CREDITOR' = 'ZERO';
    let bAmount = 0;
    if (cust.current_balance < 0) {
      bType = 'DEBTOR';
      bAmount = Math.abs(cust.current_balance);
    } else if (cust.current_balance > 0) {
      bType = 'CREDITOR';
      bAmount = Math.abs(cust.current_balance);
    }

    setEditFormData({
      name: cust.name || '',
      company_name: cust.company_name || '',
      manager_name: cust.manager_name || '',
      phone: cust.phone || '',
      phone_secondary: cust.phone_secondary || '',
      national_id: cust.national_id || '',
      economic_code: cust.economic_code || '',
      registration_number: cust.registration_number || cust.economic_code || '',
      postal_code: cust.postal_code || '',
      fax: cust.fax || '',
      province: cust.province || 'تهران',
      city: cust.city || 'تهران',
      address: cust.address || '',
      credit_limit: cust.credit_limit || 0,
      balance_type: bType,
      balance_amount: bAmount,
      customer_type: cust.customer_type || 'عمده',
      notes: cust.notes || ''
    });
    setEditingCustomer(cust);
  };

  // Open Add Customer Modal
  const handleOpenAdd = () => {
    setAddFormData(INITIAL_FORM_DATA);
    setShowAddModal(true);
  };

  // Validate form data helper
  const validateCustomerForm = (formData: CustomerFormData) => {
    const nameCheck = validateFieldSecurity(formData.name, 'نام طرف حساب / شخص', { required: true, maxLength: 200 });
    if (!nameCheck.isValid) return { isValid: false, error: nameCheck.error };

    const phoneCheck = validateFieldSecurity(formData.phone, 'شماره تلفن همراه / کارفرما', { required: true, maxLength: 60 });
    if (!phoneCheck.isValid) return { isValid: false, error: phoneCheck.error };

    const companyCheck = validateFieldSecurity(formData.company_name, 'نام شرکت یا واحد صنعتی', { maxLength: 200 });
    if (!companyCheck.isValid) return { isValid: false, error: companyCheck.error };

    const managerCheck = validateFieldSecurity(formData.manager_name, 'نام مدیرعامل یا نماینده', { maxLength: 200 });
    if (!managerCheck.isValid) return { isValid: false, error: managerCheck.error };

    const phoneSecCheck = validateFieldSecurity(formData.phone_secondary, 'شماره تلفن ثابت', { maxLength: 60 });
    if (!phoneSecCheck.isValid) return { isValid: false, error: phoneSecCheck.error };

    const nationalCheck = validateFieldSecurity(formData.national_id, 'کد ملی یا شناسه ملی', { maxLength: 50 });
    if (!nationalCheck.isValid) return { isValid: false, error: nationalCheck.error };

    const regCheck = validateFieldSecurity(formData.registration_number, 'شماره ثبت شرکت', { maxLength: 50 });
    if (!regCheck.isValid) return { isValid: false, error: regCheck.error };

    const postalCheck = validateFieldSecurity(formData.postal_code, 'کد پستی ۱۰ رقمی', { maxLength: 20 });
    if (!postalCheck.isValid) return { isValid: false, error: postalCheck.error };

    const faxCheck = validateFieldSecurity(formData.fax, 'شماره فکس', { maxLength: 50 });
    if (!faxCheck.isValid) return { isValid: false, error: faxCheck.error };

    const addressCheck = validateFieldSecurity(formData.address, 'نشانی کامل کارخانه / دفتر', { maxLength: 500 });
    if (!addressCheck.isValid) return { isValid: false, error: addressCheck.error };

    const notesCheck = validateFieldSecurity(formData.notes, 'یادداشت و شروط قرارداد', { maxLength: 1000, allowMultiline: true });
    if (!notesCheck.isValid) return { isValid: false, error: notesCheck.error };

    return {
      isValid: true,
      clean: {
        name: nameCheck.cleanValue,
        company_name: companyCheck.cleanValue,
        manager_name: managerCheck.cleanValue,
        phone: phoneCheck.cleanValue,
        phone_secondary: phoneSecCheck.cleanValue,
        national_id: nationalCheck.cleanValue,
        registration_number: regCheck.cleanValue,
        economic_code: regCheck.cleanValue,
        postal_code: postalCheck.cleanValue,
        fax: faxCheck.cleanValue,
        address: addressCheck.cleanValue,
        notes: notesCheck.cleanValue
      }
    };
  };

  const calculateBalance = (type: 'ZERO' | 'DEBTOR' | 'CREDITOR', amount: number): number => {
    const cleanAmount = sanitizeNumber(amount, 0, 0, 1000000000000);
    if (type === 'DEBTOR') return -cleanAmount;
    if (type === 'CREDITOR') return cleanAmount;
    return 0;
  };

  // Save new single customer
  const handleSaveAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateCustomerForm(addFormData);
    if (!result.isValid || !result.clean) {
      alert(result.error);
      return;
    }

    const custId = generateUUID('CUST');
    const fullCustomer: Customer = {
      customer_id: custId,
      name: result.clean.name,
      company_name: result.clean.company_name || result.clean.name,
      manager_name: result.clean.manager_name,
      phone: result.clean.phone,
      phone_secondary: result.clean.phone_secondary,
      national_id: result.clean.national_id,
      economic_code: result.clean.economic_code,
      registration_number: result.clean.registration_number,
      postal_code: result.clean.postal_code,
      fax: result.clean.fax,
      province: sanitizeInput(addFormData.province || 'تهران', { maxLength: 50 }),
      city: sanitizeInput(addFormData.city || 'تهران', { maxLength: 50 }),
      address: result.clean.address,
      credit_limit: sanitizeNumber(addFormData.credit_limit, 0, 0, 1000000000000),
      current_balance: calculateBalance(addFormData.balance_type, addFormData.balance_amount),
      customer_type: addFormData.customer_type || 'عمده',
      notes: result.clean.notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    LocalStorageManager.recordLocalChange(
      currentEnv,
      currentUser.user_id,
      'CUSTOMER',
      'CREATE',
      custId,
      fullCustomer,
      'CREATE_CUSTOMER',
      { name: fullCustomer.name, company: fullCustomer.company_name, national_id: fullCustomer.national_id }
    );

    setShowAddModal(false);
    setAddFormData(INITIAL_FORM_DATA);
    onRefresh?.();
    try {
      window.dispatchEvent(new CustomEvent('mgas:db_refreshed'));
    } catch {}
  };

  // Save edited customer
  const handleSaveEditCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;

    const result = validateCustomerForm(editFormData);
    if (!result.isValid || !result.clean) {
      alert(result.error);
      return;
    }

    const fullCustomer: Customer = {
      ...editingCustomer,
      name: result.clean.name,
      company_name: result.clean.company_name || result.clean.name,
      manager_name: result.clean.manager_name,
      phone: result.clean.phone,
      phone_secondary: result.clean.phone_secondary,
      national_id: result.clean.national_id,
      economic_code: result.clean.economic_code,
      registration_number: result.clean.registration_number,
      postal_code: result.clean.postal_code,
      fax: result.clean.fax,
      province: sanitizeInput(editFormData.province || 'تهران', { maxLength: 50 }),
      city: sanitizeInput(editFormData.city || 'تهران', { maxLength: 50 }),
      address: result.clean.address,
      credit_limit: sanitizeNumber(editFormData.credit_limit, 0, 0, 1000000000000),
      current_balance: calculateBalance(editFormData.balance_type, editFormData.balance_amount),
      customer_type: editFormData.customer_type || 'عمده',
      notes: result.clean.notes,
      updated_at: new Date().toISOString()
    };

    LocalStorageManager.recordLocalChange(
      currentEnv,
      currentUser.user_id,
      'CUSTOMER',
      'UPDATE',
      fullCustomer.customer_id,
      fullCustomer,
      'UPDATE_CUSTOMER',
      { name: fullCustomer.name, company: fullCustomer.company_name, national_id: fullCustomer.national_id }
    );

    setEditingCustomer(null);
    if (selectedCustomer?.customer_id === fullCustomer.customer_id) {
      setSelectedCustomer(fullCustomer);
    }
    onRefresh?.();
    try {
      window.dispatchEvent(new CustomEvent('mgas:db_refreshed'));
    } catch {}
  };

  // Delete single customer
  const handleDeleteCustomer = (cust: Customer) => {
    if (cust.customer_id === 'CUST-MGAS-VALVE' || cust.name?.includes('امگاز') || cust.company_name?.includes('ام‌گاز')) {
      alert('خطای امنیتی: مشتری اختصاصی خود شرکت ام‌گاز غیرقابل حذف است.');
      return;
    }
    if (window.confirm(`⚠️ هشدار حذف مشتری:\nآیا از حذف دائم پرونده مشتری «${cust.name}» (${cust.company_name || cust.customer_id}) اطمینان دارید؟`)) {
      LocalStorageManager.recordLocalChange(
        currentEnv,
        currentUser.user_id,
        'CUSTOMER',
        'DELETE',
        cust.customer_id,
        null,
        'DELETE_CUSTOMER',
        { name: cust.name, company: cust.company_name }
      );
      if (selectedCustomer?.customer_id === cust.customer_id) {
        setSelectedCustomer(null);
      }
      if (editingCustomer?.customer_id === cust.customer_id) {
        setEditingCustomer(null);
      }
      onRefresh?.();
      try {
        window.dispatchEvent(new CustomEvent('mgas:db_refreshed'));
      } catch {}
    }
  };

  // =========================================================================
  // EXCEL PARSER & DIFF SYNCHRONIZATION ENGINE (customers.xlsx)
  // =========================================================================
  const parseExcelBuffer = (data: ArrayBuffer, fileName: string = 'customers.xlsx') => {
    try {
      setIsProcessingFile(true);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      if (!sheetName) throw new Error('فایل اکسل فاقد شیت معتبر است.');
      const sheet = workbook.Sheets[sheetName];
      const rawRows = XLSX.utils.sheet_to_json<any>(sheet);

      if (!rawRows || rawRows.length === 0) {
        setImportNotice('فایل اکسل خالی است یا ردیفی یافت نشد.');
        setIsProcessingFile(false);
        return;
      }

      const parsedCustomers: Customer[] = [];

      rawRows.forEach((row: any, idx: number) => {
        const keys = Object.keys(row);
        const findVal = (terms: string[]) => {
          for (const t of terms) {
            const matchedKey = keys.find(k => k.trim().replace(/\s+/g, '').includes(t));
            if (matchedKey && row[matchedKey] !== undefined && row[matchedKey] !== null) {
              return String(row[matchedKey]).trim();
            }
          }
          return '';
        };

        const rowIndex = Number(findVal(['ردیف', 'radif', 'row', 'no'])) || idx + 1;
        const companyName = findVal(['نامشرکت', 'نام شرکت', 'شرکت', 'مشتری', 'طرفحساب', 'company', 'name']) || `مشتری ردیف ${rowIndex}`;
        const nationalId = findVal(['شناسهملی', 'شناسه ملی', 'کدملی', 'کد ملی', 'national_id', 'melli']);
        const regNumber = findVal(['شمارهثبت', 'شماره ثبت', 'ثبت', 'reg_no', 'registration']);
        const postalCode = findVal(['کدپستی', 'کد پستی', 'postal_code', 'zip']);
        const address = findVal(['آدرس', 'ادرس', 'نشانی', 'address']);
        const phoneLandline = findVal(['تلفنثابت', 'تلفن ثابت', 'ثابت', 'phone_sabet', 'tel']);
        const fax = findVal(['فکس', 'نمابر', 'fax']);
        const employerPhoneRaw = findVal(['تلفنکارفرما', 'تلفن کارفرما', 'کارفرما', 'همراه', 'موبایل', 'mobile']);

        // Parse manager name if employer phone contains a person name
        let managerName = '';
        let cleanEmployerPhone = employerPhoneRaw;
        if (employerPhoneRaw) {
          const parts = employerPhoneRaw.split(/\s{2,}|\//).map(s => s.trim());
          const namePart = parts.find(p => /[\u0600-\u06FF]{3,}/.test(p));
          if (namePart) {
            managerName = namePart;
          }
        }

        // Auto-detect province from address
        let detectedProvince = 'تهران';
        let detectedCity = 'تهران';
        if (address) {
          for (const prov of IRAN_PROVINCES) {
            if (address.includes(prov)) {
              detectedProvince = prov;
              detectedCity = prov;
              break;
            }
          }
        }

        const cust: Customer = {
          customer_id: '',
          name: companyName,
          company_name: companyName,
          manager_name: managerName,
          phone: cleanEmployerPhone || phoneLandline || '09120000000',
          phone_secondary: phoneLandline,
          national_id: nationalId,
          economic_code: regNumber,
          registration_number: regNumber,
          postal_code: postalCode,
          province: detectedProvince,
          city: detectedCity,
          address: address,
          fax: fax,
          employer_phone: cleanEmployerPhone,
          row_index: rowIndex,
          credit_limit: 200000000,
          current_balance: 0,
          customer_type: 'عمده',
          notes: `وارد شده از فایل اکسل استاندارد (${fileName}) - ردیف ${rowIndex}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        parsedCustomers.push(cust);
      });

      // Diff against active database customers (strictly preserving CUST-MGAS-VALVE)
      const existingNonMgas = customers.filter(c =>
        c.customer_id !== 'CUST-MGAS-VALVE' &&
        !c.name?.includes('امگاز') &&
        !c.company_name?.includes('ام‌گاز')
      );
      const matchedExistingIds = new Set<string>();
      const items: ExcelSyncItem[] = [];

      parsedCustomers.forEach(newCust => {
        const match = existingNonMgas.find(ex => {
          if (newCust.national_id && ex.national_id && newCust.national_id === ex.national_id) return true;
          if (newCust.registration_number && ex.registration_number && newCust.registration_number === ex.registration_number) return true;
          if (ex.company_name && newCust.company_name && ex.company_name.trim().toLowerCase() === newCust.company_name.trim().toLowerCase()) return true;
          if (ex.name && newCust.name && ex.name.trim().toLowerCase() === newCust.name.trim().toLowerCase()) return true;
          return false;
        });

        if (match) {
          matchedExistingIds.add(match.customer_id);
          const changes: string[] = [];
          if (newCust.address && newCust.address !== match.address) changes.push('آدرس');
          if (newCust.phone && newCust.phone !== match.phone) changes.push('تلفن');
          if (newCust.phone_secondary && newCust.phone_secondary !== match.phone_secondary) changes.push('تلفن ثابت');
          if (newCust.fax && newCust.fax !== match.fax) changes.push('فکس');
          if (newCust.postal_code && newCust.postal_code !== match.postal_code) changes.push('کدپستی');
          if (newCust.national_id && newCust.national_id !== match.national_id) changes.push('شناسه ملی');
          if (newCust.registration_number && newCust.registration_number !== match.registration_number) changes.push('شماره ثبت');

          if (changes.length > 0) {
            items.push({
              status: 'UPDATE',
              customer: {
                ...match,
                ...newCust,
                customer_id: match.customer_id,
                credit_limit: match.credit_limit,
                current_balance: match.current_balance,
                updated_at: new Date().toISOString()
              },
              existingCustomer: match,
              changes
            });
          } else {
            items.push({
              status: 'UNCHANGED',
              customer: match,
              existingCustomer: match
            });
          }
        } else {
          const newId = `CUST-XL-${Date.now().toString().slice(-4)}-${newCust.row_index || Math.floor(Math.random() * 1000)}`;
          items.push({
            status: 'ADD',
            customer: {
              ...newCust,
              customer_id: newId
            }
          });
        }
      });

      // Find DELETED customers (existed in DB but missing in the newly uploaded Excel)
      existingNonMgas.forEach(ex => {
        if (!matchedExistingIds.has(ex.customer_id)) {
          items.push({
            status: 'DELETE',
            customer: ex,
            existingCustomer: ex
          });
        }
      });

      setSyncItems(items);
      setExcelFileName(fileName);
      setDeleteConfirmChecked(false);
      setImportNotice(`فایل «${fileName}» با موفقیت خوانده و آنالیز شد: تعداد ${parsedCustomers.length} ردیف استخراج گردید.`);
      setImportTab('EXCEL');
    } catch (err: any) {
      console.error('Excel parse error:', err);
      setImportNotice(`خطا در پردازش فایل اکسل: ${err?.message || 'قالب نامعتبر است'}`);
    } finally {
      setIsProcessingFile(false);
    }
  };

  // Load standard customers.xlsx from server
  const handleLoadDefaultServerExcel = async () => {
    try {
      setIsProcessingFile(true);
      const resp = await fetch('/customers.xlsx');
      if (!resp.ok) throw new Error('فایل customers.xlsx در سرور یافت نشد');
      const buffer = await resp.arrayBuffer();
      parseExcelBuffer(buffer, 'customers.xlsx (سرور)');
    } catch (err: any) {
      alert(`خطا در بارگزاری فایل اکسل سرور: ${err.message}`);
      setIsProcessingFile(false);
    }
  };

  // Download official customers.xlsx template
  const handleDownloadSampleExcel = () => {
    const link = document.createElement('a');
    link.href = '/customers.xlsx';
    link.download = 'customers.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // File upload input change
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target?.result;
      if (data instanceof ArrayBuffer) {
        parseExcelBuffer(data, file.name);
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  // Drag & drop file upload
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target?.result;
      if (data instanceof ArrayBuffer) {
        parseExcelBuffer(data, file.name);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Quick plain text parse
  const handleParseText = () => {
    if (!rawTextInput.trim()) {
      setImportNotice('لطفاً حداقل یک نام وارد کنید.');
      return;
    }
    const lines = rawTextInput
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0);

    const generated: ExcelSyncItem[] = lines.map((line, idx) => {
      const newCust: Customer = {
        customer_id: `CUST-TXT-${Date.now().toString().slice(-4)}-${idx + 1}`,
        name: line,
        company_name: `شرکت ${line}`,
        phone: '09120000000',
        province: 'تهران',
        city: 'تهران',
        address: 'نشانی پیش‌فرض',
        credit_limit: 100000000,
        current_balance: 0,
        customer_type: 'عمده',
        notes: 'ایجاد شده از لیست اسامی متنی',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      return {
        status: 'ADD',
        customer: newCust
      };
    });

    setSyncItems(generated);
    setExcelFileName('ورودی متنی دستی');
    setImportNotice(`تعداد ${generated.length} پرونده مشتری با موفقیت شناسایی شد.`);
    setImportTab('EXCEL');
  };

  // Execute Synchronization (Restricted strictly to Mousa Amouei)
  const handleExecuteSync = () => {
    if (!isAmouei) {
      alert('⛔ عدم دسترسی: طبق قوانین سامانه، عملیات همگام‌سازی، ویرایش، حذف و اضافه کردن مشتریان از روی فایل اکسل منحصراً برای کاربر جناب آقای مهندس موسی عمویی (مدیر ارشد) مجاز می‌باشد.');
      return;
    }

    const toDelete = syncItems.filter(i => i.status === 'DELETE');
    if (toDelete.length > 0 && !deleteConfirmChecked) {
      setShowDeleteWarningModal(true);
      return;
    }

    const toAdd = syncItems.filter(i => i.status === 'ADD');
    const toUpdate = syncItems.filter(i => i.status === 'UPDATE');

    // 1. Record DELETE events
    toDelete.forEach(item => {
      LocalStorageManager.recordLocalChange(
        currentEnv,
        currentUser.user_id,
        'CUSTOMER',
        'DELETE',
        item.customer.customer_id,
        null,
        'DELETE_CUSTOMER_EXCEL_SYNC',
        {
          name: item.customer.name,
          company: item.customer.company_name,
          sourceFile: excelFileName,
          approved_by: currentUser.full_name || currentUser.username
        }
      );
    });

    // 2. Record UPDATE events
    toUpdate.forEach(item => {
      LocalStorageManager.recordLocalChange(
        currentEnv,
        currentUser.user_id,
        'CUSTOMER',
        'UPDATE',
        item.customer.customer_id,
        item.customer,
        'UPDATE_CUSTOMER_EXCEL_SYNC',
        {
          name: item.customer.name,
          changes: item.changes,
          sourceFile: excelFileName
        }
      );
    });

    // 3. Record CREATE events
    toAdd.forEach(item => {
      LocalStorageManager.recordLocalChange(
        currentEnv,
        currentUser.user_id,
        'CUSTOMER',
        'CREATE',
        item.customer.customer_id,
        item.customer,
        'CREATE_CUSTOMER_EXCEL_SYNC',
        {
          name: item.customer.name,
          company: item.customer.company_name,
          sourceFile: excelFileName
        }
      );
    });

    setShowDeleteWarningModal(false);
    setDeleteConfirmChecked(false);
    setShowImporter(false);
    setSyncItems([]);
    setExcelFileName(null);
    onRefresh?.();
    try {
      window.dispatchEvent(new CustomEvent('mgas:db_refreshed'));
    } catch {}
    alert(`همگام‌سازی دیتابیس مشتریان با موفقیت نهایی شد:\n• ${toAdd.length} مشتری جدید افزوده شد\n• ${toUpdate.length} مشتری ویرایش گردید\n• ${toDelete.length} مشتری غایب در اکسل حذف گردید.`);
  };

  // Diff counts
  const toAddCount = syncItems.filter(i => i.status === 'ADD').length;
  const toUpdateCount = syncItems.filter(i => i.status === 'UPDATE').length;
  const toDeleteCount = syncItems.filter(i => i.status === 'DELETE').length;
  const unchangedCount = syncItems.filter(i => i.status === 'UNCHANGED').length;

  const filteredSyncItems = syncItems.filter(item => {
    if (syncFilter === 'ALL') return true;
    return item.status === syncFilter;
  });

  // Render Form Fields for Add/Edit
  const renderCustomerFormFields = (
    data: CustomerFormData,
    setData: React.Dispatch<React.SetStateAction<CustomerFormData>>,
    isEdit: boolean,
    customerId?: string
  ) => {
    return (
      <div className="space-y-4 text-xs text-slate-200">
        {isEdit && customerId && (
          <div className="flex flex-wrap items-center justify-between p-3 rounded-xl bg-indigo-950/40 border border-indigo-700/50">
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-indigo-400" />
              <span className="text-slate-400">شناسه اختصاصی دیتابیس:</span>
              <span className="font-mono font-bold text-indigo-200">{customerId}</span>
            </div>
            <span className="text-[11px] text-indigo-300/80">همگام‌سازی سه‌گانه آنلاین/آفلاین</span>
          </div>
        )}

        {/* SECTION 1: Standard Company & Identity */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800/80 text-indigo-400 font-bold">
            <UserCheck className="w-4 h-4" />
            <span>بخش اول: نام شرکت، طرف حساب و طبقه‌بندی (فرمت استاندارد)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                نام شرکت / مؤسسه <span className="text-rose-400 font-bold">*</span>
              </label>
              <input
                type="text"
                required
                value={data.company_name}
                onChange={(e) => setData({ ...data, company_name: e.target.value, name: data.name || e.target.value })}
                placeholder="مثال: شرکت اتحاد گاز ساحل بندر"
                className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                نام طرف حساب / شخص حقیقی <span className="text-rose-400 font-bold">*</span>
              </label>
              <input
                type="text"
                required
                value={data.name}
                onChange={(e) => setData({ ...data, name: e.target.value })}
                placeholder="مثال: مهندس احمدزاده"
                className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                نام مدیرعامل یا نماینده
              </label>
              <input
                type="text"
                value={data.manager_name}
                onChange={(e) => setData({ ...data, manager_name: e.target.value })}
                placeholder="مثال: دکتر رضوانی"
                className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: National ID, Registration & Postal Code (Exact customers.xlsx standard) */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800/80 text-emerald-400 font-bold">
            <FileCheck2 className="w-4 h-4" />
            <span>بخش دوم: شناسه ملی، شماره ثبت و کد پستی (مطابق اکسل)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                شناسه ملی / کد ملی
              </label>
              <input
                type="text"
                value={data.national_id}
                onChange={(e) => setData({ ...data, national_id: e.target.value })}
                placeholder="10860018980"
                className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 font-mono text-left focus:outline-none focus:border-emerald-500"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                شماره ثبت شرکت
              </label>
              <input
                type="text"
                value={data.registration_number}
                onChange={(e) => setData({ ...data, registration_number: e.target.value, economic_code: e.target.value })}
                placeholder="61"
                className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 font-mono text-left focus:outline-none focus:border-emerald-500"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                کد پستی ۱۰ رقمی
              </label>
              <input
                type="text"
                value={data.postal_code}
                onChange={(e) => setData({ ...data, postal_code: e.target.value })}
                placeholder="7961943187"
                className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 font-mono text-left focus:outline-none focus:border-emerald-500"
                dir="ltr"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: Phones & Address (Exact customers.xlsx standard) */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800/80 text-amber-400 font-bold">
            <PhoneCall className="w-4 h-4" />
            <span>بخش سوم: تلفن کارفرما، تلفن ثابت، فکس و نشانی دقیق</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                تلفن کارفرما / همراه <span className="text-rose-400 font-bold">*</span>
              </label>
              <input
                type="text"
                required
                value={data.phone}
                onChange={(e) => setData({ ...data, phone: e.target.value })}
                placeholder="0917-1987468 / احمدزاده"
                className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 font-mono text-left focus:outline-none focus:border-amber-500"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                تلفن ثابت
              </label>
              <input
                type="text"
                value={data.phone_secondary}
                onChange={(e) => setData({ ...data, phone_secondary: e.target.value })}
                placeholder="076-44323707"
                className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 font-mono text-left focus:outline-none focus:border-amber-500"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                فکس
              </label>
              <input
                type="text"
                value={data.fax}
                onChange={(e) => setData({ ...data, fax: e.target.value })}
                placeholder="076-44323707"
                className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 font-mono text-left focus:outline-none focus:border-amber-500"
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">
              آدرس دقیق کارخانه / دفتر
            </label>
            <input
              type="text"
              value={data.address}
              onChange={(e) => setData({ ...data, address: e.target.value })}
              placeholder="استان، شهرستان، شهرک صنعتی، پلاک..."
              className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* SECTION 4: Credit Limit & Balance */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800/80 text-cyan-400 font-bold">
            <CreditCard className="w-4 h-4" />
            <span>بخش چهارم: سقف اعتبار و مانده حساب</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                سقف اعتبار تجاری (تومان)
              </label>
              <input
                type="number"
                min="0"
                step="10000000"
                value={data.credit_limit}
                onChange={(e) => setData({ ...data, credit_limit: Number(e.target.value) || 0 })}
                className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 font-mono text-left focus:outline-none focus:border-cyan-500"
                dir="ltr"
              />
              <span className="text-[11px] text-slate-400 block mt-1">
                معادل: {formatCurrencyToman(data.credit_limit)}
              </span>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                وضعیت مانده حساب
              </label>
              <select
                value={data.balance_type}
                onChange={(e) => setData({ ...data, balance_type: e.target.value as any })}
                className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500"
              >
                <option value="ZERO">تسویه کامل (صفر)</option>
                <option value="DEBTOR">بدهکار به ام‌گاز</option>
                <option value="CREDITOR">بستانکار از ام‌گاز</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      {/* Top Action Header - Responsive */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 bg-slate-900/60 p-3 sm:p-4 rounded-xl border border-slate-800">
        <div className="min-w-0 w-full sm:w-auto">
          <h2
            className="text-base sm:text-lg font-bold text-white flex items-center gap-2 cursor-help"
            title="مدیریت پرونده‌های مشتریان مطابق با فایل استاندارد customers.xlsx"
          >
            <Users className="w-5 h-5 text-indigo-400 shrink-0" />
            <span className="truncate">مدیریت مشتریان و پرونده‌های بازرگانی</span>
            <Info className="w-4 h-4 text-slate-400 hover:text-slate-200 shrink-0" />
          </h2>
          <p className="text-xs text-slate-400 mt-1 line-clamp-2 sm:line-clamp-none">
            سامانه یکپارچه مشتریان بر پایه فرمت ۹ ستونی استاندارد اکسل (customers.xlsx) با قابلیت همگام‌سازی، ویرایش، حذف و اضافه
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full sm:w-auto">
          {/* Batch Importer / Excel Synchronization Trigger */}
          <button
            onClick={() => {
              setShowImporter(true);
              setImportTab('EXCEL');
            }}
            title="ورود و همگام‌سازی دسته‌ای مشتریان از فایل استاندارد customers.xlsx"
            className="flex-1 sm:flex-initial px-3 sm:px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all whitespace-nowrap cursor-pointer group"
          >
            <FileSpreadsheet className="w-4 h-4 shrink-0 text-white group-hover:scale-110 transition-transform" />
            <span>ورود و همگام‌سازی اکسل</span>
          </button>

          <button
            onClick={handleOpenAdd}
            title="ثبت مشتری جدید با ساختار کامل ۹ ستونی"
            className="flex-1 sm:flex-initial px-3 sm:px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all whitespace-nowrap cursor-pointer"
          >
            <UserPlus className="w-4 h-4 shrink-0" />
            <span>ثبت مشتری جدید</span>
          </button>
        </div>
      </div>

      {/* Filters and search - Responsive */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
        <div className="relative flex-1 min-w-0">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="جستجو در تمام ۹ ستون (نام شرکت، شناسه ملی، شماره ثبت، کدپستی، تلفن، آدرس...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-3 pr-9 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-sans"
          />
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-1.5 flex-1 sm:flex-initial min-w-0">
            <span className="text-xs text-slate-400 whitespace-nowrap">گروه:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full sm:w-auto bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 px-2.5 py-2 focus:outline-none focus:border-indigo-500 truncate"
            >
              <option value="ALL">همه مشتریان ({toPersianDigits(customers.length)})</option>
              <option value="عمده">عمده‌فروشی</option>
              <option value="سازمانی">سازمانی / پالایشگاه</option>
              <option value="پیمانکاری">پیمانکاری و پروژه‌ای</option>
              <option value="خرده">خرده‌فروشی</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 p-1 rounded-xl shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
              title="نمایش کارتی"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>کارتی</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
              title="نمایش لیستی جدول کامل ۹ ستونی"
            >
              <List className="w-3.5 h-3.5" />
              <span>جدول</span>
            </button>
          </div>
        </div>
      </div>

      {/* Customers List View: Arranged according to customers.xlsx */}
      {viewMode === 'list' ? (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          {/* Mobile Horizontal Scroll Indicator Banner */}
          <div className="lg:hidden flex items-center justify-between px-3 py-1.5 bg-slate-950/80 border-b border-slate-800 text-[11px] text-indigo-300 select-none">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse inline-block" />
              <span>جدول را به چپ یا راست بکشید (اسکرول لمسی)</span>
            </span>
            <span className="text-slate-500 font-mono text-[10px]">۹ ستون اکسل ⇄</span>
          </div>

          <div className="overflow-x-auto -webkit-overflow-scrolling-touch overscroll-x-contain relative">
            <table className="w-full text-right text-xs min-w-[950px] sm:min-w-[1100px] border-collapse">
              <thead className="bg-slate-950/95 text-slate-400 border-b border-slate-800 text-[11px] select-none">
                <tr>
                  <th className="p-3 w-12 text-center sticky right-0 z-20 bg-slate-950 border-b border-slate-800 shadow-[-2px_0_4px_rgba(0,0,0,0.4)]">ردیف</th>
                  <th className="p-3 min-w-[180px] sm:min-w-[200px] sticky right-12 z-20 bg-slate-950 border-b border-slate-800 shadow-[-4px_0_8px_rgba(0,0,0,0.5)]">نام شرکت / طرف حساب</th>
                  <th className="p-3">شناسه ملی</th>
                  <th className="p-3">شماره ثبت</th>
                  <th className="p-3">کد پستی</th>
                  <th className="p-3">تلفن کارفرما / همراه</th>
                  <th className="p-3">تلفن ثابت</th>
                  <th className="p-3">فکس</th>
                  <th className="p-3 min-w-[220px]">آدرس</th>
                  <th className="p-3">مانده حساب</th>
                  <th className="p-3 text-center sticky left-0 z-20 bg-slate-950 border-b border-slate-800 shadow-[4px_0_8px_rgba(0,0,0,0.5)]">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {filtered.map((c, idx) => (
                  <tr
                    key={c.customer_id}
                    onClick={() => setSelectedCustomer(c)}
                    className="hover:bg-slate-800/50 transition-colors cursor-pointer group"
                  >
                    <td className="p-3 text-center font-mono text-slate-400 font-bold sticky right-0 z-10 bg-slate-900 group-hover:bg-slate-850 shadow-[-2px_0_4px_rgba(0,0,0,0.4)] transition-colors">
                      {toPersianDigits(c.row_index || idx + 1)}
                    </td>
                    <td className="p-3 sticky right-12 z-10 bg-slate-900 group-hover:bg-slate-850 shadow-[-4px_0_8px_rgba(0,0,0,0.5)] transition-colors">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-indigo-950/80 border border-indigo-700/50 flex items-center justify-center text-indigo-300 font-bold text-xs shrink-0">
                          {c.company_name?.slice(0, 1) || c.name.slice(0, 1)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-slate-100 group-hover:text-indigo-300 transition-colors truncate max-w-[190px] sm:max-w-[240px]" title={c.company_name || c.name}>
                            {c.company_name || c.name}
                          </div>
                          {c.name && c.name !== c.company_name && (
                            <span className="block text-[10px] text-slate-400 truncate max-w-[180px]">
                              طرف حساب: {c.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-300" dir="ltr">
                      {c.national_id ? toPersianDigits(c.national_id) : <span className="text-slate-600 font-normal">--</span>}
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-300" dir="ltr">
                      {c.registration_number || c.economic_code ? toPersianDigits(c.registration_number || c.economic_code) : <span className="text-slate-600 font-normal">--</span>}
                    </td>
                    <td className="p-3 font-mono text-slate-300" dir="ltr">
                      {c.postal_code ? toPersianDigits(c.postal_code) : <span className="text-slate-600 font-normal">--</span>}
                    </td>
                    <td className="p-3 font-mono text-amber-300 font-bold text-[11px] truncate max-w-[160px]" dir="ltr" title={c.phone}>
                      {c.phone ? toPersianDigits(c.phone) : <span className="text-slate-600 font-normal">--</span>}
                    </td>
                    <td className="p-3 font-mono text-slate-300 text-[11px] truncate max-w-[140px]" dir="ltr" title={c.phone_secondary}>
                      {c.phone_secondary ? toPersianDigits(c.phone_secondary) : <span className="text-slate-600 font-normal">--</span>}
                    </td>
                    <td className="p-3 font-mono text-slate-400 text-[11px] truncate max-w-[120px]" dir="ltr">
                      {c.fax ? toPersianDigits(c.fax) : <span className="text-slate-600 font-normal">--</span>}
                    </td>
                    <td className="p-3 text-[11px] text-slate-300 max-w-xs truncate" title={c.address}>
                      {c.address || <span className="text-slate-600">--</span>}
                    </td>
                    <td className="p-3">
                      <span className={`font-mono font-bold text-xs whitespace-nowrap ${
                        c.current_balance > 0
                          ? 'text-emerald-400'
                          : c.current_balance < 0
                          ? 'text-rose-400'
                          : 'text-slate-400'
                      }`}>
                        {c.current_balance === 0 ? 'تسویه' : formatCurrencyToman(Math.abs(c.current_balance))}
                      </span>
                    </td>
                    <td className="p-3 text-center sticky left-0 z-10 bg-slate-900 group-hover:bg-slate-850 shadow-[4px_0_8px_rgba(0,0,0,0.5)] transition-colors" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(c)}
                          className="px-2.5 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          title="ویرایش پرونده"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>ویرایش</span>
                        </button>
                        {onOpenGasKardex && (
                          <button
                            type="button"
                            onClick={() => onOpenGasKardex(c.customer_id)}
                            className="px-2 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                            title="کاردکس تعمیر سیلندر"
                          >
                            <Flame className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setSelectedCustomer(c)}
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                          title="مشاهده پرونده کامل"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Cards View - Fully Responsive on Mobile & Tablet */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filtered.map((c) => (
            <div
              key={c.customer_id}
              onClick={() => setSelectedCustomer(c)}
              className="bg-slate-900/90 border border-slate-800 hover:border-indigo-500/60 rounded-2xl p-3.5 sm:p-4 transition-all cursor-pointer group hover:shadow-lg hover:shadow-indigo-950/20 relative flex flex-col justify-between min-w-0"
            >
              <div className="min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2.5 sm:mb-3 min-w-0">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-indigo-950/80 border border-indigo-700/50 flex items-center justify-center text-indigo-300 font-bold text-xs sm:text-sm shrink-0 shadow-inner">
                      {c.company_name?.slice(0, 1) || c.name.slice(0, 1)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-xs sm:text-sm font-bold text-slate-100 group-hover:text-indigo-300 transition-colors truncate" title={c.company_name || c.name}>
                        {c.company_name || c.name}
                      </h3>
                      {c.name && c.name !== c.company_name ? (
                        <span className="text-[10px] sm:text-[11px] text-slate-400 block truncate">
                          طرف حساب: {c.name}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 block truncate">
                          {c.province ? `${c.province}` : 'ام‌گاز'}
                        </span>
                      )}
                    </div>
                  </div>
                  {c.row_index && (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-950 text-indigo-300 border border-indigo-900/50 shrink-0">
                      #{toPersianDigits(c.row_index)}
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 text-xs text-slate-400 border-t border-slate-800/80 pt-2.5 min-w-0">
                  <div className="flex items-center justify-between gap-2 min-w-0">
                    <span className="text-slate-500 shrink-0 text-[11px]">شناسه ملی:</span>
                    <span className="font-mono text-slate-200 font-bold text-[11px] truncate max-w-[65%]" dir="ltr">
                      {c.national_id ? toPersianDigits(c.national_id) : '--'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 min-w-0">
                    <span className="text-slate-500 shrink-0 text-[11px]">شماره ثبت:</span>
                    <span className="font-mono text-slate-200 text-[11px] truncate max-w-[65%]" dir="ltr">
                      {c.registration_number || c.economic_code || '--'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 min-w-0">
                    <span className="text-slate-500 shrink-0 text-[11px]">کد پستی:</span>
                    <span className="font-mono text-slate-300 text-[11px] truncate max-w-[65%]" dir="ltr">
                      {c.postal_code ? toPersianDigits(c.postal_code) : '--'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 min-w-0">
                    <span className="text-slate-500 shrink-0 text-[11px]">تلفن کارفرما:</span>
                    <span className="font-mono text-amber-300 font-bold text-[11px] truncate max-w-[65%] text-left" dir="ltr" title={c.phone}>
                      {c.phone || '--'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 min-w-0">
                    <span className="text-slate-500 shrink-0 text-[11px]">تلفن ثابت:</span>
                    <span className="font-mono text-slate-300 text-[11px] truncate max-w-[65%] text-left" dir="ltr" title={c.phone_secondary}>
                      {c.phone_secondary || '--'}
                    </span>
                  </div>
                  {c.fax ? (
                    <div className="flex items-center justify-between gap-2 min-w-0">
                      <span className="text-slate-500 shrink-0 text-[11px]">فکس:</span>
                      <span className="font-mono text-slate-400 text-[11px] truncate max-w-[65%] text-left" dir="ltr">
                        {toPersianDigits(c.fax)}
                      </span>
                    </div>
                  ) : null}
                  {c.address ? (
                    <div className="text-[11px] text-slate-400 pt-1 line-clamp-2 break-words leading-relaxed border-t border-slate-800/40" title={c.address}>
                      <span className="text-slate-500">نشانی:</span> {c.address}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="pt-2.5 sm:pt-3 border-t border-slate-800/90 mt-2.5 sm:mt-3 flex items-center gap-1.5 flex-wrap sm:flex-nowrap" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => handleOpenEdit(c)}
                  className="flex-1 min-w-[70px] py-1.5 px-2 rounded-lg text-xs font-bold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  title="ویرایش کامل پرونده"
                >
                  <Edit3 className="w-3.5 h-3.5 shrink-0" />
                  <span>ویرایش</span>
                </button>
                {onOpenGasKardex && (
                  <button
                    type="button"
                    onClick={() => onOpenGasKardex(c.customer_id)}
                    className="flex-1 min-w-[70px] py-1.5 px-2 rounded-lg text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    title="کاردکس تعمیر سیلندر"
                  >
                    <Flame className="w-3.5 h-3.5 shrink-0" />
                    <span>کاردکس</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedCustomer(c)}
                  className="py-1.5 px-2.5 rounded-lg text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors shrink-0 flex items-center justify-center"
                  title="مشاهده جزئیات کامل پرونده"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {filtered.length === 0 && (
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-8 text-center text-slate-400">
          <Users className="w-10 h-10 mx-auto mb-2 text-slate-600" />
          <p className="text-sm font-medium">هیچ پرونده مشتری با این جستجو یافت نشد</p>
          <p className="text-xs text-slate-500 mt-1">
            جهت ورود مشتریان از فایل رسمی <span className="text-emerald-400 font-mono">customers.xlsx</span>، از دکمه «ورود و همگام‌سازی اکسل» استفاده نمایید.
          </p>
        </div>
      )}

      {/* ====================================================================== */}
      {/* BATCH IMPORTER & EXCEL SYNCHRONIZER MODAL (Based on customers.xlsx)    */}
      {/* ====================================================================== */}
      {showImporter && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-5 cursor-pointer"
          onClick={() => {
            setShowImporter(false);
            setSyncItems([]);
            setImportNotice(null);
          }}
        >
          <div
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden cursor-default"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-white">
                      ورود و همگام‌سازی هوشمند مشتریان از فایل اکسل (customers.xlsx)
                    </h3>
                    {isAmouei ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/60 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                        مجوز کاربر موسی عمویی (فعال)
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-700/60 flex items-center gap-1">
                        <Lock className="w-3 h-3 text-rose-400" />
                        منحصراً برای کاربر موسی عمویی
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    سیستم پردازش ۹ ستونی، تشخیص خودکار تغییرات، ویرایش، حذف و افزودن مشتریان با حفاظت دائم از حساب اختصاصی ام‌گاز
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowImporter(false);
                  setSyncItems([]);
                  setImportNotice(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs: Exactly CSS selector 2 and 3 match */}
            <div className="flex items-center gap-2 px-4 pt-3 border-b border-slate-800/80 bg-slate-950/40 text-xs shrink-0">
              <button
                onClick={() => setImportTab('EXCEL')}
                className={`pb-2.5 px-3 font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                  importTab === 'EXCEL'
                    ? 'border-emerald-500 text-emerald-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>بارگزاری و همگام‌سازی اکسل (customers.xlsx)</span>
                {syncItems.length > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 text-[10px] font-mono font-bold">
                    {toPersianDigits(syncItems.length)}
                  </span>
                )}
              </button>

              <button
                onClick={() => setImportTab('TEMPLATE')}
                className={`pb-2.5 px-3 font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                  importTab === 'TEMPLATE'
                    ? 'border-emerald-500 text-emerald-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Download className="w-4 h-4" />
                <span>قالب اکسل استاندارد نمونه (۹ ستونی)</span>
              </button>

              <button
                onClick={() => setImportTab('TEXT')}
                className={`pb-2.5 px-3 font-medium border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                  importTab === 'TEXT'
                    ? 'border-emerald-500 text-emerald-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>ورود متنی سریع</span>
              </button>
            </div>

            {/* Modal Body: Matches CSS selector 1 */}
            <div className="p-4 flex-1 overflow-y-auto space-y-4">
              {/* Permission Banner if not Mousa Amouei */}
              {!isAmouei && (
                <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-600/50 text-amber-200 text-xs flex items-center gap-3">
                  <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
                  <div>
                    <span className="font-bold block">محدودیت دسترسی مدیریتی:</span>
                    <span>
                      شما هم‌اکنون با حساب کاربری «{currentUser.full_name || currentUser.username}» وارد شده‌اید. قابلیت بارگزاری اکسل، اعمال ویرایش گروهی، حذف و همگام‌سازی مشتریان طبق دستورالعمل فقط و فقط توسط کاربر **موسی عمویی** قابل اجراست.
                    </span>
                  </div>
                </div>
              )}

              {importNotice && (
                <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-700/50 text-emerald-300 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{importNotice}</span>
                </div>
              )}

              {/* TAB 1: EXCEL SYNC WORKSPACE */}
              {importTab === 'EXCEL' && (
                <div className="space-y-4">
                  {/* Upload Drop Zone & Direct Actions */}
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    className="p-5 rounded-2xl border-2 border-dashed border-slate-700 hover:border-emerald-500/80 bg-slate-950/60 transition-all text-center flex flex-col items-center justify-center gap-3"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <UploadCloud className="w-6 h-6 animate-pulse" />
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-100">
                        فایل اکسل مشتریان (customers.xlsx یا هر فایل آپدیت‌شده) را اینجا رها کنید
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">
                        فرمت استاندارد شامل ستون‌های ردیف، نام شرکت، شناسه ملی، شماره ثبت، کدپستی، آدرس، تلفن ثابت، فکس و تلفن کارفرما
                      </p>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap justify-center pt-1">
                      <label className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-md flex items-center gap-2">
                        <UploadCloud className="w-4 h-4" />
                        <span>انتخاب فایل از سیستم...</span>
                        <input
                          type="file"
                          accept=".xlsx,.xls,.csv"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>

                      <button
                        type="button"
                        onClick={handleLoadDefaultServerExcel}
                        disabled={isProcessingFile}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
                        title="بارگزاری مستقیم فایل customers.xlsx قرار داده شده در ریشه پروژه"
                      >
                        <RefreshCw className={`w-4 h-4 ${isProcessingFile ? 'animate-spin' : ''}`} />
                        <span>⚡ بارگزاری مستقیم فایل اکسل ریشه (customers.xlsx)</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleDownloadSampleExcel}
                        className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5 text-indigo-400" />
                        <span>دانلود فایل اکسل نمونه</span>
                      </button>
                    </div>
                  </div>

                  {/* Synchronization Diff Summary Chips */}
                  {syncItems.length > 0 && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
                        <button
                          type="button"
                          onClick={() => setSyncFilter('ALL')}
                          className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer ${
                            syncFilter === 'ALL'
                              ? 'bg-slate-800 border-indigo-500 text-white'
                              : 'bg-slate-950/60 border-slate-800 text-slate-300'
                          }`}
                        >
                          <span className="block text-[10px] text-slate-400">کل پرونده‌ها</span>
                          <span className="font-mono font-black text-sm">{toPersianDigits(syncItems.length)}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSyncFilter('ADD')}
                          className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer ${
                            syncFilter === 'ADD'
                              ? 'bg-emerald-950/70 border-emerald-500 text-emerald-200'
                              : 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300'
                          }`}
                        >
                          <span className="block text-[10px] text-emerald-400/80">مشتریان جدید (افزودن)</span>
                          <span className="font-mono font-black text-sm">+{toPersianDigits(toAddCount)}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSyncFilter('UPDATE')}
                          className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer ${
                            syncFilter === 'UPDATE'
                              ? 'bg-amber-950/70 border-amber-500 text-amber-200'
                              : 'bg-amber-950/30 border-amber-800/40 text-amber-300'
                          }`}
                        >
                          <span className="block text-[10px] text-amber-400/80">دارای تغییر (ویرایش)</span>
                          <span className="font-mono font-black text-sm">~{toPersianDigits(toUpdateCount)}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSyncFilter('DELETE')}
                          className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer ${
                            syncFilter === 'DELETE'
                              ? 'bg-rose-950/80 border-rose-500 text-rose-200 ring-2 ring-rose-500/30'
                              : 'bg-rose-950/40 border-rose-800/50 text-rose-300'
                          }`}
                        >
                          <span className="block text-[10px] text-rose-400/80 flex items-center gap-1">
                            {toDeleteCount > 0 && <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />}
                            غایب در اکسل (حذف دائم)
                          </span>
                          <span className="font-mono font-black text-sm">-{toPersianDigits(toDeleteCount)}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSyncFilter('UNCHANGED')}
                          className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer ${
                            syncFilter === 'UNCHANGED'
                              ? 'bg-slate-800 border-slate-600 text-white'
                              : 'bg-slate-950/60 border-slate-800 text-slate-400'
                          }`}
                        >
                          <span className="block text-[10px] text-slate-500">بدون تغییر</span>
                          <span className="font-mono font-black text-sm">{toPersianDigits(unchangedCount)}</span>
                        </button>
                      </div>

                      {/* Prominent Deletion Warning Alert Box */}
                      {toDeleteCount > 0 && (
                        <div className="p-3.5 rounded-xl bg-rose-950/50 border-2 border-rose-600/80 text-rose-200 text-xs space-y-2 animate-fade-in shadow-lg shadow-rose-950/30">
                          <div className="flex items-center gap-2 font-bold text-rose-300 text-sm">
                            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                            <span>هشدار بحرانی: حذف خودکار {toPersianDigits(toDeleteCount)} مشتری از سیستم</span>
                          </div>
                          <p className="text-[11px] text-rose-200/90 leading-relaxed">
                            این مشتریان در دیتابیس فعلی موجود هستند اما در فایل اکسل آپلود شده وجود ندارند. در صورت اعمال همگام‌سازی، این پرونده‌ها از دیتابیس‌های سه‌گانه حذف خواهند شد. (مشتری اختصاصی ام‌گاز محافظت‌شده بوده و هرگز حذف نمی‌شود).
                          </p>
                          <div className="flex items-center gap-2 pt-1">
                            <input
                              type="checkbox"
                              id="confirmDeleteCheckInline"
                              checked={deleteConfirmChecked}
                              onChange={(e) => setDeleteConfirmChecked(e.target.checked)}
                              className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-rose-700 bg-rose-950 cursor-pointer"
                            />
                            <label htmlFor="confirmDeleteCheckInline" className="text-xs font-bold text-white cursor-pointer select-none">
                              اینجانب موسی عمویی، حذف دائمی مشتریان غایب در این فایل را تایید و مسئولیت آن را می‌پذیرم.
                            </label>
                          </div>
                        </div>
                      )}

                      {/* Diff Details Table Arranged with Exact 9 Columns */}
                      <div className="border border-slate-800 rounded-xl overflow-hidden">
                        <div className="overflow-x-auto max-h-72">
                          <table className="w-full text-right text-xs min-w-[950px]">
                            <thead className="bg-slate-950 sticky top-0 text-slate-400 border-b border-slate-800 text-[11px]">
                              <tr>
                                <th className="p-2.5 text-center w-12">ردیف</th>
                                <th className="p-2.5">نام شرکت</th>
                                <th className="p-2.5">شناسه ملی</th>
                                <th className="p-2.5">شماره ثبت</th>
                                <th className="p-2.5">کدپستی</th>
                                <th className="p-2.5">تلفن کارفرما</th>
                                <th className="p-2.5">تلفن ثابت</th>
                                <th className="p-2.5 min-w-[200px]">آدرس</th>
                                <th className="p-2.5 text-center w-28">وضعیت</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60 text-slate-200">
                              {filteredSyncItems.map((item, idx) => {
                                const c = item.customer;
                                return (
                                  <tr
                                    key={c.customer_id || idx}
                                    className={`transition-colors ${
                                      item.status === 'ADD'
                                        ? 'bg-emerald-950/20 hover:bg-emerald-950/30'
                                        : item.status === 'UPDATE'
                                        ? 'bg-amber-950/20 hover:bg-amber-950/30'
                                        : item.status === 'DELETE'
                                        ? 'bg-rose-950/30 hover:bg-rose-950/40 text-rose-200'
                                        : 'hover:bg-slate-850'
                                    }`}
                                  >
                                    <td className="p-2.5 text-center font-mono text-slate-400 font-bold">
                                      {toPersianDigits(c.row_index || idx + 1)}
                                    </td>
                                    <td className="p-2.5 font-bold">
                                      {c.company_name || c.name}
                                    </td>
                                    <td className="p-2.5 font-mono" dir="ltr">
                                      {c.national_id ? toPersianDigits(c.national_id) : '--'}
                                    </td>
                                    <td className="p-2.5 font-mono" dir="ltr">
                                      {c.registration_number || c.economic_code || '--'}
                                    </td>
                                    <td className="p-2.5 font-mono" dir="ltr">
                                      {c.postal_code ? toPersianDigits(c.postal_code) : '--'}
                                    </td>
                                    <td className="p-2.5 font-mono text-amber-300 font-bold" dir="ltr">
                                      {c.phone || '--'}
                                    </td>
                                    <td className="p-2.5 font-mono" dir="ltr">
                                      {c.phone_secondary || '--'}
                                    </td>
                                    <td className="p-2.5 text-[11px] max-w-xs truncate" title={c.address}>
                                      {c.address || '--'}
                                    </td>
                                    <td className="p-2.5 text-center">
                                      {item.status === 'ADD' && (
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700/60">
                                          افزودن جدید
                                        </span>
                                      )}
                                      {item.status === 'UPDATE' && (
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-700/60" title={`تغییرات: ${item.changes?.join('، ')}`}>
                                          ویرایش
                                        </span>
                                      )}
                                      {item.status === 'DELETE' && (
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-700/60">
                                          حذف دائم
                                        </span>
                                      )}
                                      {item.status === 'UNCHANGED' && (
                                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400">
                                          یکسان
                                        </span>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Main Execution Button */}
                      <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-800">
                        <div className="text-[11px] text-slate-400">
                          فایل مبدا: <span className="font-mono text-slate-200">{excelFileName}</span>
                        </div>

                        <button
                          type="button"
                          onClick={handleExecuteSync}
                          disabled={!isAmouei || (toDeleteCount > 0 && !deleteConfirmChecked)}
                          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-black shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2 cursor-pointer"
                        >
                          <Save className="w-4 h-4" />
                          <span>اعمال همگام‌سازی و بروزرسانی نهایی مشتریان</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: TEMPLATE REFERENCE (Exact 9-column sample of customers.xlsx) */}
              {importTab === 'TEMPLATE' && (
                <div className="space-y-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                        <span>فرمت رسمی و استاندارد فایل اکسل مشتریان (customers.xlsx)</span>
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        فایل اکسل ارسالی باید دارای دقیقاً ۹ ستون زیر باشد تا برنامه به صورت خودکار تمام مشتریان را اضافه، ویرایش یا حذف کند.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleDownloadSampleExcel}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-md cursor-pointer whitespace-nowrap"
                    >
                      <Download className="w-4 h-4" />
                      <span>دانلود فایل اصلی customers.xlsx</span>
                    </button>
                  </div>

                  {/* 9 Columns Reference Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 text-xs">
                    {STANDARD_EXCEL_COLUMNS.map((col, i) => (
                      <div key={col.key} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="font-mono text-[10px] text-indigo-400 block">ستون {toPersianDigits(i + 1)}</span>
                        <span className="font-bold text-slate-200">{col.label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Sample Data Table (Exact matching customers.xlsx) */}
                  <div className="border border-slate-800 rounded-xl overflow-hidden mt-3">
                    <div className="overflow-x-auto">
                      <table className="w-full text-right text-xs min-w-[950px]">
                        <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[11px]">
                          <tr>
                            <th className="p-2.5 text-center w-12">ردیف</th>
                            <th className="p-2.5">نام شرکت</th>
                            <th className="p-2.5">شناسه ملی</th>
                            <th className="p-2.5">شماره ثبت</th>
                            <th className="p-2.5">کدپستی</th>
                            <th className="p-2.5 min-w-[200px]">آدرس</th>
                            <th className="p-2.5">تلفن ثابت</th>
                            <th className="p-2.5">فکس</th>
                            <th className="p-2.5">تلفن کارفرما</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 text-slate-200 text-[11px]">
                          <tr>
                            <td className="p-2.5 text-center font-mono">۱</td>
                            <td className="p-2.5 font-bold">اتحاد گاز ساحل بندر</td>
                            <td className="p-2.5 font-mono" dir="ltr">10860018980</td>
                            <td className="p-2.5 font-mono" dir="ltr">61</td>
                            <td className="p-2.5 font-mono" dir="ltr">7961943187</td>
                            <td className="p-2.5">استان هرمزگان شهرستان بستک شهرک صنعتی</td>
                            <td className="p-2.5 font-mono" dir="ltr">076-44323707</td>
                            <td className="p-2.5 font-mono" dir="ltr">076-44323707</td>
                            <td className="p-2.5 font-mono text-amber-300 font-bold" dir="ltr">0917-1987468 احمدزاده</td>
                          </tr>
                          <tr>
                            <td className="p-2.5 text-center font-mono">۲</td>
                            <td className="p-2.5 font-bold">ارسا گاز</td>
                            <td className="p-2.5 font-mono" dir="ltr">10100288820</td>
                            <td className="p-2.5 font-mono" dir="ltr">5918</td>
                            <td className="p-2.5 font-mono" dir="ltr">1553616915</td>
                            <td className="p-2.5">تهران سهروردی بین خرم و هویزه طبقه چهارم</td>
                            <td className="p-2.5 font-mono" dir="ltr">021-88502672</td>
                            <td className="p-2.5 font-mono" dir="ltr">021-88520748</td>
                            <td className="p-2.5 font-mono text-amber-300 font-bold" dir="ltr">0922-7675993 اسلامی</td>
                          </tr>
                          <tr>
                            <td className="p-2.5 text-center font-mono">۳</td>
                            <td className="p-2.5 font-bold">افشان گاز قائم</td>
                            <td className="p-2.5 font-mono" dir="ltr">10760181125</td>
                            <td className="p-2.5 font-mono" dir="ltr">1351</td>
                            <td className="p-2.5 font-mono" dir="ltr">4783188511</td>
                            <td className="p-2.5">سوادکوه شیرگاه شهرک صنعتی بشل فاز۲</td>
                            <td className="p-2.5 font-mono" dir="ltr">011-42433958</td>
                            <td className="p-2.5 font-mono" dir="ltr">011-42433957</td>
                            <td className="p-2.5 font-mono text-amber-300 font-bold" dir="ltr">0911-3235235 احمدی</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: PLAIN TEXT FALLBACK */}
              {importTab === 'TEXT' && (
                <div className="space-y-3">
                  <label className="block text-xs font-medium text-slate-300">
                    ورود نام یا ردیف متنی (هر مشتری در یک خط):
                  </label>
                  <textarea
                    rows={6}
                    value={rawTextInput}
                    onChange={(e) => setRawTextInput(e.target.value)}
                    placeholder={`نام شرکت یا شخص در هر سطر:\nاتحاد گاز ساحل بندر\nارسا گاز\nافشان گاز قائم`}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono leading-relaxed"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">
                      تبدیل خودکار به پرونده‌های آماده همگام‌سازی
                    </span>
                    <button
                      type="button"
                      onClick={handleParseText}
                      className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow cursor-pointer"
                    >
                      استخراج و ایجاد ردیف‌ها
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* EXPLICIT DELETION WARNING MODAL (Requirement: هشدار و اعلان های لازم)  */}
      {/* ====================================================================== */}
      {showDeleteWarningModal && (
        <div
          className="fixed inset-0 bg-black/85 backdrop-blur-md z-[60] flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setShowDeleteWarningModal(false)}
        >
          <div
            className="bg-slate-900 border-2 border-rose-600 rounded-2xl w-full max-w-xl p-5 space-y-4 shadow-2xl shadow-rose-950/50 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 pb-3 border-b border-rose-800/60">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">
                  هشدار بحرانی: تایید نهایی حذف مشتریان غایب در اکسل
                </h3>
                <p className="text-xs text-rose-300/80">
                  فقط توسط کاربر مدیریت ارشد (موسی عمویی) قابل تایید است
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <p className="leading-relaxed">
                تعداد <span className="font-mono font-bold text-rose-400 text-sm">{toPersianDigits(toDeleteCount)}</span> مشتری در دیتابیس فعلی وجود دارد که در فایل اکسل جدید آپلود شده وجود ندارند. با تایید این مرحله، پرونده‌های زیر برای همیشه از سیستم حذف خواهند شد:
              </p>

              <div className="max-h-48 overflow-y-auto border border-rose-800/40 rounded-xl bg-slate-950/80 p-2 divide-y divide-slate-800 text-[11px]">
                {syncItems.filter(i => i.status === 'DELETE').map((item, idx) => (
                  <div key={item.customer.customer_id} className="py-1.5 flex items-center justify-between">
                    <span className="font-bold text-slate-200">
                      {idx + 1}. {item.customer.company_name || item.customer.name}
                    </span>
                    <span className="font-mono text-slate-400 text-[10px]">
                      {item.customer.national_id || item.customer.customer_id}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 bg-rose-950/40 rounded-xl border border-rose-700/60 flex items-center gap-2">
              <input
                type="checkbox"
                id="modalDeleteCheckbox"
                checked={deleteConfirmChecked}
                onChange={(e) => setDeleteConfirmChecked(e.target.checked)}
                className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-rose-700 bg-rose-950 cursor-pointer"
              />
              <label htmlFor="modalDeleteCheckbox" className="text-xs font-bold text-white cursor-pointer select-none">
                اینجانب موسی عمویی، حذف دائمی مشتریان فوق را تایید می‌نمایم.
              </label>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteWarningModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
              >
                انصراف و لغو عملیات
              </button>

              <button
                type="button"
                onClick={handleExecuteSync}
                disabled={!deleteConfirmChecked || !isAmouei}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-rose-600/30 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>تایید قطعی و اجرای حذف و همگام‌سازی</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* ADD SINGLE CUSTOMER MODAL                                              */}
      {/* ====================================================================== */}
      {showAddModal && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-5 cursor-pointer overflow-y-auto"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl my-auto shadow-2xl overflow-hidden cursor-default flex flex-col max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">تعریف و ثبت پرونده مشتری جدید</h3>
                  <p className="text-[11px] text-slate-400">
                    ثبت مشخصات مطابق با فرمت ۹ ستونی استاندارد customers.xlsx
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAddCustomer} className="flex-1 overflow-y-auto p-4 sm:p-5">
              {renderCustomerFormFields(addFormData, setAddFormData, false)}

              <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-all"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>ثبت نهایی پرونده</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* EDIT CUSTOMER MODAL                                                    */}
      {/* ====================================================================== */}
      {editingCustomer && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-5 cursor-pointer overflow-y-auto"
          onClick={() => setEditingCustomer(null)}
        >
          <div
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl my-auto shadow-2xl overflow-hidden cursor-default flex flex-col max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>ویرایش پرونده مشتری: {editingCustomer.company_name || editingCustomer.name}</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    بروزرسانی مشخصات هویتی و کدهای قانونی با صدور رویداد اتمیک UPDATE
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingCustomer(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditCustomer} className="flex-1 overflow-y-auto p-4 sm:p-5">
              {renderCustomerFormFields(editFormData, setEditFormData, true, editingCustomer.customer_id)}

              <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleDeleteCustomer(editingCustomer)}
                    className="px-3 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="حذف دائمی این مشتری"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>حذف پرونده</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingCustomer(null)}
                    className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-all"
                  >
                    انصراف
                  </button>
                </div>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>ذخیره تغییرات پرونده</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* CUSTOMER DETAILS DRAWER / VIEW MODAL                                   */}
      {/* ====================================================================== */}
      {selectedCustomer && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-5 cursor-pointer overflow-y-auto"
          onClick={() => setSelectedCustomer(null)}
        >
          <div
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl my-auto shadow-2xl p-5 space-y-4 cursor-default max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 font-bold text-base shrink-0">
                  {selectedCustomer.company_name?.slice(0, 1) || selectedCustomer.name.slice(0, 1)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {selectedCustomer.company_name || selectedCustomer.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    طرف حساب: {selectedCustomer.name}
                    {selectedCustomer.manager_name && ` — نماینده: ${selectedCustomer.manager_name}`}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 9 Standard Fields View */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <div className="text-slate-500 text-[11px] mb-1">شناسه یکتا دیتابیس (UUID):</div>
                <div className="font-mono text-indigo-300 font-bold">{selectedCustomer.customer_id}</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <div className="text-slate-500 text-[11px] mb-1">شناسه ملی / شماره ثبت:</div>
                <div className="font-mono text-slate-200" dir="ltr">
                  <span>ملی: {selectedCustomer.national_id ? toPersianDigits(selectedCustomer.national_id) : '--'}</span>
                  <span className="mx-2">|</span>
                  <span>ثبت: {selectedCustomer.registration_number || selectedCustomer.economic_code || '--'}</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <div className="text-slate-500 text-[11px] mb-1">تلفن کارفرما / همراه:</div>
                <div className="font-mono text-amber-300 font-bold" dir="ltr">
                  {selectedCustomer.phone ? toPersianDigits(selectedCustomer.phone) : '--'}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <div className="text-slate-500 text-[11px] mb-1">تلفن ثابت و فکس:</div>
                <div className="font-mono text-slate-200" dir="ltr">
                  <span>ثابت: {selectedCustomer.phone_secondary ? toPersianDigits(selectedCustomer.phone_secondary) : '--'}</span>
                  <span className="mx-2">|</span>
                  <span>فکس: {selectedCustomer.fax ? toPersianDigits(selectedCustomer.fax) : '--'}</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 sm:col-span-2">
                <div className="text-slate-500 text-[11px] mb-1">کدپستی و آدرس دقیق:</div>
                <div className="text-slate-200 leading-relaxed">
                  {selectedCustomer.postal_code && (
                    <span className="font-mono text-indigo-300 font-bold ml-2">کدپستی: {toPersianDigits(selectedCustomer.postal_code)} - </span>
                  )}
                  {selectedCustomer.address || 'نشانی ثبت نشده است'}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  handleOpenEdit(selectedCustomer);
                  setSelectedCustomer(null);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>ویرایش پرونده</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer"
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
