import React, { useState, useMemo, useEffect } from 'react';
import {
  Product,
  Category,
  Warehouse,
  MovementType,
  RuntimeEnvironment,
  User,
  StockMovement
} from '../types';
import { LocalStorageManager } from '../database/storage';
import { SyncEngine } from '../sync-engine/sync-client';
import {
  Boxes,
  Plus,
  ArrowLeftRight,
  Search,
  Filter,
  AlertTriangle,
  Barcode,
  Tag,
  ArrowDownLeft,
  ArrowUpRight,
  X,
  Save,
  FolderKanban,
  Edit3,
  Trash2,
  Check,
  FolderPlus,
  Layers,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  LayoutGrid,
  List,
  Warehouse as WarehouseIcon,
  Printer,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import {
  formatCurrencyToman,
  formatNumberFa,
  toPersianDigits,
  toEnglishDigits,
  generateUUID
} from '../utils/persian';
import { generateAutoSku } from '../utils/skuGenerator';
import { SkuPrintModal } from './SkuPrintModal';
import { isSafeInput, sanitizeInput, sanitizeNumber, validateFieldSecurity } from '../utils/security';

const SHELF_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
const SHELF_NUMBERS = Array.from({ length: 99 }, (_, i) => i + 1);

interface InventoryViewProps {
  products: Product[];
  categories: Category[];
  warehouses: Warehouse[];
  stockQuantities: Record<string, Record<string, number>>;
  currentEnv: RuntimeEnvironment;
  currentUser: User;
  initialStatusFilter?: 'ALL' | 'OUT_OF_STOCK' | 'CRITICAL' | 'WARN' | 'GOOD';
  openSkuPrintDirectly?: boolean;
  onCloseSkuPrintDirectly?: () => void;
  onOpenNewMovement: () => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  products,
  categories,
  warehouses,
  stockQuantities,
  currentEnv,
  currentUser,
  initialStatusFilter = 'ALL',
  openSkuPrintDirectly = false,
  onCloseSkuPrintDirectly,
  onOpenNewMovement
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OUT_OF_STOCK' | 'CRITICAL' | 'WARN' | 'GOOD'>(initialStatusFilter);
  const [sortBy, setSortBy] = useState<'DEFAULT' | 'STOCK_DESC' | 'STOCK_ASC' | 'VALUE_DESC' | 'PRICE_DESC' | 'NAME_ASC'>('DEFAULT');
  const [pageSize, setPageSize] = useState<number>(25);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>(() => 
    typeof window !== 'undefined' && window.innerWidth < 768 ? 'cards' : 'table'
  );
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editProductForm, setEditProductForm] = useState<Partial<Product>>({});
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [movementTargetProduct, setMovementTargetProduct] = useState<Product | null>(null);
  const [deleteProductConfirm, setDeleteProductConfirm] = useState<Product | null>(null);
  const [showSkuPrintModal, setShowSkuPrintModal] = useState(openSkuPrintDirectly);

  // Sync external openSkuPrintDirectly trigger
  useEffect(() => {
    if (openSkuPrintDirectly) {
      setShowSkuPrintModal(true);
    }
  }, [openSkuPrintDirectly]);

  // Auto purge test items on view load
  useEffect(() => {
    LocalStorageManager.purgeTestProductsFromWarehouse(currentEnv, currentUser.user_id);
  }, [currentEnv, currentUser.user_id]);

  // Global Escape key listener to close modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowCategoryModal(false);
        setCatErrorMsg(null);
        setCatSuccessMsg(null);
        setEditingCategory(null);
        setShowAddProductModal(false);
        setShowEditProductModal(false);
        setEditingProduct(null);
        setShowSkuPrintModal(false);
        if (onCloseSkuPrintDirectly) onCloseSkuPrintDirectly();
        setShowMovementModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Helper to determine product warehouse and shelf code (A1-99 to Z1-99)
  const getProductWarehouseAndShelf = (p: Product) => {
    let whId = p.warehouse_id;

    if (!whId) {
      const whStockMap = stockQuantities[p.product_id] || {};
      let maxQty = 0;
      let maxWhId = '';
      for (const w of warehouses) {
        const q = whStockMap[w.warehouse_id] || 0;
        if (q > maxQty) {
          maxQty = q;
          maxWhId = w.warehouse_id;
        }
      }
      if (maxWhId) {
        whId = maxWhId;
      }
    }

    if (!whId) {
      const nameLower = (p.name + ' ' + (p.description || '')).toLowerCase();
      const cat = categories.find(c => c.category_id === p.category_id);
      const catName = cat ? cat.name.toLowerCase() : '';
      const combined = nameLower + ' ' + catName;

      if (combined.includes('شیر') || combined.includes('اتصال') || combined.includes('valve')) {
        whId = 'WH-VALVES';
      } else if (combined.includes('ضایعات') || combined.includes('اسقاط') || combined.includes('waste')) {
        whId = 'WH-WASTE';
      } else if (combined.includes('تولید') || combined.includes('مونتاژ') || combined.includes('production')) {
        whId = 'WH-PRODUCTION';
      } else if (combined.includes('مواد') || combined.includes('شمش') || combined.includes('raw')) {
        whId = 'WH-RAW-MATERIALS';
      } else {
        whId = 'WH-SUPPLIES';
      }
    }

    const matchingWh = warehouses.find(w => w.warehouse_id === whId) || warehouses[0];

    // Format clean warehouse display name: شیرآلات / ملزومات / ضایعات / خط تولید / مواد اولیه
    let displayName = matchingWh?.name || 'شیرآلات';
    displayName = displayName.replace(/^انبار\s+/, '').trim();
    if (displayName.includes('شیر')) displayName = 'شیرآلات';
    else if (displayName.includes('ملزومات')) displayName = 'ملزومات';
    else if (displayName.includes('ضایعات')) displayName = 'ضایعات';
    else if (displayName.includes('تولید')) displayName = 'خط تولید';
    else if (displayName.includes('مواد')) displayName = 'مواد اولیه';

    // Format shelf code: A1-99 to Z1-99
    let shelfCode = p.shelf_location;
    if (!shelfCode && p.shelf_letter && p.shelf_number) {
      shelfCode = `${p.shelf_letter}${p.shelf_number}`;
    }
    if (!shelfCode) {
      shelfCode = matchingWh?.shelf_location || `${matchingWh?.shelf_letter || 'A'}${matchingWh?.shelf_number || 1}`;
    }

    return {
      warehouseId: matchingWh?.warehouse_id || 'WH-VALVES',
      warehouseName: displayName,
      shelfCode: shelfCode || 'A1'
    };
  };

  const getWarehouseColorClass = (name: string) => {
    switch (name) {
      case 'شیرآلات':
        return 'bg-sky-500/15 text-sky-300 border-sky-500/40';
      case 'ملزومات':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40';
      case 'ضایعات':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/40';
      case 'خط تولید':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/40';
      case 'مواد اولیه':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/40';
      default:
        return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/40';
    }
  };

  // New product form with auto-generated alphanumeric SKU (combining English letters and numbers)
  const [newProduct, setNewProduct] = useState<Partial<Product>>(() => {
    const initCatId = categories[0]?.category_id || '';
    const initialSku = generateAutoSku(initCatId, categories, products);
    return {
      sku: initialSku,
      name: '',
      category_id: initCatId,
      warehouse_id: warehouses[0]?.warehouse_id || 'WH-VALVES',
      shelf_letter: 'A',
      shelf_number: 1,
      unit: 'عدد',
      min_stock: 10,
      purchase_price: 0,
      sale_price: 0,
      barcode: '',
      description: ''
    };
  });

  // Handler to open Add Product modal with freshly auto-generated alphanumeric SKU
  const handleOpenAddProduct = () => {
    const chosenCatId = newProduct.category_id || categories[0]?.category_id || '';
    const autoSku = generateAutoSku(chosenCatId, categories, products);
    setNewProduct({
      sku: autoSku,
      name: '',
      category_id: chosenCatId,
      warehouse_id: warehouses[0]?.warehouse_id || 'WH-VALVES',
      shelf_letter: 'A',
      shelf_number: 1,
      unit: 'عدد',
      min_stock: 10,
      purchase_price: 0,
      sale_price: 0,
      barcode: '',
      description: ''
    });
    setShowAddProductModal(true);
  };

  // One-click regenerate auto alphanumeric SKU for new product
  const handleRegenerateNewSku = () => {
    const catId = newProduct.category_id || categories[0]?.category_id;
    const freshSku = generateAutoSku(catId, categories, products);
    setNewProduct(prev => ({ ...prev, sku: freshSku }));
  };

  // One-click regenerate auto alphanumeric SKU for edit product
  const handleRegenerateEditSku = () => {
    const catId = editProductForm.category_id || categories[0]?.category_id;
    const freshSku = generateAutoSku(catId, categories, products);
    setEditProductForm(prev => ({ ...prev, sku: freshSku }));
  };

  // New movement form
  const [movForm, setMovForm] = useState<{
    warehouse_id: string;
    to_warehouse_id: string;
    quantity: number | string;
    movement_type: MovementType;
    reference_id: string;
    notes: string;
    valve_condition: 'HEALTHY' | 'DEFECTIVE';
  }>({
    warehouse_id: warehouses[0]?.warehouse_id || '',
    to_warehouse_id: warehouses[1]?.warehouse_id || '',
    quantity: 10,
    movement_type: 'STOCK_IN' as MovementType,
    reference_id: '',
    notes: '',
    valve_condition: 'HEALTHY'
  });
  const [movShelfLetter, setMovShelfLetter] = useState('A');
  const [movShelfNumber, setMovShelfNumber] = useState(1);
  const [movDestShelfLetter, setMovDestShelfLetter] = useState('B');
  const [movDestShelfNumber, setMovDestShelfNumber] = useState(1);

  // Warehouse management modal
  const [showWarehouseModal, setShowWarehouseModal] = useState(false);
  const [warehouseShelfSavedMsg, setWarehouseShelfSavedMsg] = useState<string | null>(null);

  // Category management modal and inline quick-add states
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryFormMode, setCategoryFormMode] = useState<'ADD' | 'EDIT'>('ADD');
  const [categoryForm, setCategoryForm] = useState<{ name: string; code: string; description: string }>({
    name: '',
    code: '',
    description: ''
  });
  const [catSuccessMsg, setCatSuccessMsg] = useState<string | null>(null);
  const [catErrorMsg, setCatErrorMsg] = useState<string | null>(null);

  // Quick inline add state inside product modal
  const [showInlineAddCategory, setShowInlineAddCategory] = useState(false);
  const [inlineCatName, setInlineCatName] = useState('');

  const getSuggestedNextCategoryCode = () => {
    const numbers = categories
      .map(c => {
        const m = c.code.match(/\d+/);
        return m ? parseInt(m[0], 10) : 0;
      })
      .filter(n => !isNaN(n));
    const maxNum = numbers.length > 0 ? Math.max(...numbers) : 0;
    const nextNum = maxNum + 1;
    return `CAT-${String(nextNum).padStart(2, '0')}`;
  };

  const handleOpenAddCategory = () => {
    setCategoryFormMode('ADD');
    setEditingCategory(null);
    setCategoryForm({
      name: '',
      code: getSuggestedNextCategoryCode(),
      description: ''
    });
    setCatSuccessMsg(null);
    setCatErrorMsg(null);
    setShowCategoryModal(true);
  };

  const handleOpenEditCategory = (cat: Category) => {
    setCategoryFormMode('EDIT');
    setEditingCategory(cat);
    setCategoryForm({
      name: cat.name,
      code: cat.code,
      description: cat.description || ''
    });
    setCatSuccessMsg(null);
    setCatErrorMsg(null);
    setShowCategoryModal(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    setCatErrorMsg(null);
    setCatSuccessMsg(null);

    // Anti-Injection & Security Inspections
    const nameCheck = validateFieldSecurity(categoryForm.name, 'نام دسته‌بندی', { required: true, maxLength: 100 });
    if (!nameCheck.isValid) {
      setCatErrorMsg(nameCheck.error || 'خطای امنیتی در نام دسته‌بندی.');
      return;
    }
    const codeCheck = validateFieldSecurity(categoryForm.code, 'کد اختصاری دسته‌بندی', { required: true, maxLength: 50 });
    if (!codeCheck.isValid) {
      setCatErrorMsg(codeCheck.error || 'خطای امنیتی در کد دسته‌بندی.');
      return;
    }
    const descCheck = validateFieldSecurity(categoryForm.description, 'شرح دسته‌بندی', { maxLength: 300 });
    if (!descCheck.isValid) {
      setCatErrorMsg(descCheck.error || 'خطای امنیتی در شرح دسته‌بندی.');
      return;
    }

    const trimmedName = nameCheck.cleanValue;
    const trimmedCode = codeCheck.cleanValue;

    if (categoryFormMode === 'ADD') {
      const duplicate = categories.some(
        c => c.code.toLowerCase() === trimmedCode.toLowerCase()
      );
      if (duplicate) {
        setCatErrorMsg('دسته‌بندی دیگری با این کد قبلاً ثبت شده است.');
        return;
      }

      const newId = generateUUID('CAT');
      const now = new Date().toISOString();
      const newCat: Category = {
        category_id: newId,
        name: trimmedName,
        code: trimmedCode,
        description: descCheck.cleanValue,
        created_at: now,
        updated_at: now
      };

      LocalStorageManager.recordLocalChange(
        currentEnv,
        currentUser.user_id,
        'CATEGORY',
        'CREATE',
        newId,
        newCat,
        'CREATE_CATEGORY',
        { name: newCat.name, code: newCat.code }
      );

      // Select new category in product form automatically
      setNewProduct(prev => ({ ...prev, category_id: newId }));
      setEditProductForm(prev => ({ ...prev, category_id: newId }));
      setCatSuccessMsg(`دسته‌بندی «${trimmedName}» با موفقیت اضافه شد.`);
      setCategoryForm({
        name: '',
        code: getSuggestedNextCategoryCode(),
        description: ''
      });
    } else if (categoryFormMode === 'EDIT' && editingCategory) {
      const duplicate = categories.some(
        c =>
          c.category_id !== editingCategory.category_id &&
          c.code.toLowerCase() === trimmedCode.toLowerCase()
      );
      if (duplicate) {
        setCatErrorMsg('دسته‌بندی دیگری با این کد وجود دارد.');
        return;
      }

      const now = new Date().toISOString();
      const updatedCat: Category = {
        ...editingCategory,
        name: trimmedName,
        code: trimmedCode,
        description: descCheck.cleanValue,
        updated_at: now
      };

      LocalStorageManager.recordLocalChange(
        currentEnv,
        currentUser.user_id,
        'CATEGORY',
        'UPDATE',
        editingCategory.category_id,
        updatedCat,
        'UPDATE_CATEGORY',
        { name: updatedCat.name, code: updatedCat.code }
      );

      setCatSuccessMsg(`دسته‌بندی «${trimmedName}» با موفقیت به‌روزرسانی شد.`);
      setCategoryFormMode('ADD');
      setEditingCategory(null);
      setCategoryForm({
        name: '',
        code: getSuggestedNextCategoryCode(),
        description: ''
      });
    }
  };

  const handleDeleteCategory = (cat: Category) => {
    const associatedCount = products.filter(p => p.category_id === cat.category_id).length;
    if (associatedCount > 0) {
      setCatSuccessMsg(`امکان حذف دسته‌بندی «${cat.name}» وجود ندارد؛ ${toPersianDigits(associatedCount)} کالا در انبار به این دسته‌بندی تخصیص داده شده است.`);
      return;
    }

    LocalStorageManager.recordLocalChange(
      currentEnv,
      currentUser.user_id,
      'CATEGORY',
      'DELETE',
      cat.category_id,
      cat,
      'DELETE_CATEGORY',
      { name: cat.name, code: cat.code }
    );

    if (newProduct.category_id === cat.category_id) {
      const remaining = categories.filter(c => c.category_id !== cat.category_id);
      setNewProduct(prev => ({ ...prev, category_id: remaining[0]?.category_id || '' }));
    }
    setCatSuccessMsg(`دسته‌بندی «${cat.name}» حذف گردید.`);
  };

  const handleQuickAddInline = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inlineCatName.trim();
    if (!trimmed) return;

    const newId = generateUUID('CAT');
    const newCode = getSuggestedNextCategoryCode();
    const now = new Date().toISOString();
    const newCat: Category = {
      category_id: newId,
      name: trimmed,
      code: newCode,
      description: 'ایجاد شده از فرم سریع کالا',
      created_at: now,
      updated_at: now
    };

    LocalStorageManager.recordLocalChange(
      currentEnv,
      currentUser.user_id,
      'CATEGORY',
      'CREATE',
      newId,
      newCat,
      'CREATE_CATEGORY',
      { name: newCat.name, code: newCat.code }
    );

    setNewProduct(prev => ({ ...prev, category_id: newId }));
    setInlineCatName('');
    setShowInlineAddCategory(false);
  };

  // Total stocks per product lookup for fast filtering and sorting
  const productStockTotals = useMemo(() => {
    const map: Record<string, number> = {};
    products.forEach(p => {
      const whMap = stockQuantities[p.product_id] || {};
      let total = 0;
      Object.values(whMap).forEach(q => (total += Number(q) || 0));
      map[p.product_id] = total;
    });
    return map;
  }, [products, stockQuantities]);

  // Statistics for status pills
  const statusStats = useMemo(() => {
    let outOfStock = 0;
    let critical = 0;
    let warn = 0;
    let good = 0;

    products.forEach(p => {
      const stock = productStockTotals[p.product_id] || 0;
      if (stock <= 0) {
        outOfStock++;
      } else if (stock <= p.min_stock) {
        critical++;
      } else if (stock <= p.min_stock * 1.5) {
        warn++;
      } else {
        good++;
      }
    });

    return { outOfStock, critical, warn, good };
  }, [products, productStockTotals]);

  // Filtered and sorted products
  const filteredAndSorted = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    const result = products.filter(p => {
      const matchSearch =
        !query ||
        p.name.toLowerCase().includes(query) ||
        p.sku.toLowerCase().includes(query) ||
        (p.barcode && p.barcode.toLowerCase().includes(query));

      const matchCat = selectedCategory === 'ALL' || p.category_id === selectedCategory;
      const whInfo = getProductWarehouseAndShelf(p);
      const matchWh = selectedWarehouse === 'ALL' || whInfo.warehouseId === selectedWarehouse;

      const stock = productStockTotals[p.product_id] || 0;
      let matchStatus = true;
      if (statusFilter === 'OUT_OF_STOCK') {
        matchStatus = stock <= 0;
      } else if (statusFilter === 'CRITICAL') {
        matchStatus = stock > 0 && stock <= p.min_stock;
      } else if (statusFilter === 'WARN') {
        matchStatus = stock > p.min_stock && stock <= p.min_stock * 1.5;
      } else if (statusFilter === 'GOOD') {
        matchStatus = stock > p.min_stock * 1.5;
      }

      return matchSearch && matchCat && matchWh && matchStatus;
    });

    // Sorting
    result.sort((a, b) => {
      const aStock = productStockTotals[a.product_id] || 0;
      const bStock = productStockTotals[b.product_id] || 0;
      if (sortBy === 'STOCK_DESC') return bStock - aStock;
      if (sortBy === 'STOCK_ASC') return aStock - bStock;
      if (sortBy === 'VALUE_DESC') return (bStock * (b.purchase_price || 0)) - (aStock * (a.purchase_price || 0));
      if (sortBy === 'PRICE_DESC') return (b.purchase_price || 0) - (a.purchase_price || 0);
      if (sortBy === 'NAME_ASC') return a.name.localeCompare(b.name);
      return 0; // Default creation order
    });

    return result;
  }, [products, searchTerm, selectedCategory, selectedWarehouse, statusFilter, sortBy, productStockTotals]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedProducts = useMemo(() => {
    if (pageSize >= 1000) return filteredAndSorted;
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredAndSorted.slice(start, start + pageSize);
  }, [filteredAndSorted, safeCurrentPage, pageSize]);

  // Keep compatibility with existing code
  const filtered = paginatedProducts;

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();

    // Anti-Injection & Security Guards
    const nameCheck = validateFieldSecurity(newProduct.name, 'نام کالا', { required: true, maxLength: 200 });
    if (!nameCheck.isValid) {
      alert(nameCheck.error);
      return;
    }

    // Auto-generate alphanumeric SKU if missing, empty, or whitespace
    let candidateSku = newProduct.sku?.trim() || '';
    if (!candidateSku) {
      candidateSku = generateAutoSku(newProduct.category_id, categories, products);
    }

    const skuCheck = validateFieldSecurity(candidateSku, 'کد کالا (SKU)', { required: true, maxLength: 100 });
    if (!skuCheck.isValid) {
      alert(skuCheck.error);
      return;
    }
    const unitCheck = validateFieldSecurity(newProduct.unit, 'واحد سنجش', { maxLength: 50 });
    if (!unitCheck.isValid) {
      alert(unitCheck.error);
      return;
    }
    const barcodeCheck = validateFieldSecurity(newProduct.barcode, 'بارکد کالا', { maxLength: 100 });
    if (!barcodeCheck.isValid) {
      alert(barcodeCheck.error);
      return;
    }
    const descCheck = validateFieldSecurity(newProduct.description, 'توضیحات کالا', { maxLength: 500 });
    if (!descCheck.isValid) {
      alert(descCheck.error);
      return;
    }

    const prodId = generateUUID('PRD');
    const shelfLoc = `${newProduct.shelf_letter || 'A'}${newProduct.shelf_number || 1}`;
    const fullProduct: Product = {
      product_id: prodId,
      sku: skuCheck.cleanValue.toUpperCase(),
      name: nameCheck.cleanValue,
      category_id: newProduct.category_id || categories[0]?.category_id || 'CAT-01',
      warehouse_id: newProduct.warehouse_id || warehouses[0]?.warehouse_id || 'WH-VALVES',
      shelf_letter: newProduct.shelf_letter || 'A',
      shelf_number: Number(newProduct.shelf_number) || 1,
      shelf_location: shelfLoc,
      unit: unitCheck.cleanValue || 'عدد',
      min_stock: sanitizeNumber(newProduct.min_stock, 10, 0, 1000000),
      purchase_price: sanitizeNumber(newProduct.purchase_price, 0, 0, 1000000000000),
      sale_price: sanitizeNumber(newProduct.sale_price, 0, 0, 1000000000000),
      barcode: barcodeCheck.cleanValue,
      description: descCheck.cleanValue,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    LocalStorageManager.recordLocalChange(
      currentEnv,
      currentUser.user_id,
      'PRODUCT',
      'CREATE',
      prodId,
      fullProduct,
      'CREATE_PRODUCT',
      { sku: fullProduct.sku, name: fullProduct.name }
    );

    setShowAddProductModal(false);
    SyncEngine.syncNow(currentEnv).catch(() => {});

    // Automatically prepare a brand new unique alphanumeric SKU for subsequent product registration
    const nextCatId = newProduct.category_id || categories[0]?.category_id || '';
    const nextSku = generateAutoSku(nextCatId, categories, [...products, fullProduct]);
    setNewProduct({
      sku: nextSku,
      name: '',
      category_id: nextCatId,
      warehouse_id: warehouses[0]?.warehouse_id || 'WH-VALVES',
      shelf_letter: 'A',
      shelf_number: 1,
      unit: 'عدد',
      min_stock: 10,
      purchase_price: 0,
      sale_price: 0,
      barcode: '',
      description: ''
    });
  };

  const handleOpenEditProduct = (prod: Product) => {
    const whInfo = getProductWarehouseAndShelf(prod);
    const parsedLetter = whInfo.shelfCode.match(/[A-Z]/i)?.[0]?.toUpperCase() || 'A';
    const parsedNum = parseInt(whInfo.shelfCode.replace(/[^0-9]/g, '') || '1', 10) || 1;

    setEditingProduct(prod);
    setEditProductForm({
      sku: prod.sku,
      name: prod.name,
      category_id: prod.category_id,
      warehouse_id: prod.warehouse_id || whInfo.warehouseId,
      shelf_letter: prod.shelf_letter || parsedLetter,
      shelf_number: prod.shelf_number || parsedNum,
      shelf_location: prod.shelf_location || `${parsedLetter}${parsedNum}`,
      unit: prod.unit || 'عدد',
      min_stock: prod.min_stock ?? 10,
      purchase_price: prod.purchase_price ?? 0,
      sale_price: prod.sale_price ?? 0,
      barcode: prod.barcode || '',
      description: prod.description || ''
    });
    setShowEditProductModal(true);
  };

  const handleSaveEditProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const nameCheck = validateFieldSecurity(editProductForm.name, 'نام کالا', { required: true, maxLength: 200 });
    if (!nameCheck.isValid) {
      alert(nameCheck.error);
      return;
    }
    const skuCheck = validateFieldSecurity(editProductForm.sku, 'کد کالا (SKU)', { required: true, maxLength: 100 });
    if (!skuCheck.isValid) {
      alert(skuCheck.error);
      return;
    }
    const unitCheck = validateFieldSecurity(editProductForm.unit, 'واحد سنجش', { maxLength: 50 });
    if (!unitCheck.isValid) {
      alert(unitCheck.error);
      return;
    }
    const barcodeCheck = validateFieldSecurity(editProductForm.barcode, 'بارکد کالا', { maxLength: 100 });
    if (!barcodeCheck.isValid) {
      alert(barcodeCheck.error);
      return;
    }
    const descCheck = validateFieldSecurity(editProductForm.description, 'توضیحات کالا', { maxLength: 500 });
    if (!descCheck.isValid) {
      alert(descCheck.error);
      return;
    }

    const shelfLoc = `${editProductForm.shelf_letter || 'A'}${editProductForm.shelf_number || 1}`;
    const updatedProduct: Product = {
      ...editingProduct,
      sku: skuCheck.cleanValue,
      name: nameCheck.cleanValue,
      category_id: editProductForm.category_id || editingProduct.category_id,
      warehouse_id: editProductForm.warehouse_id || editingProduct.warehouse_id || warehouses[0]?.warehouse_id,
      shelf_letter: editProductForm.shelf_letter || 'A',
      shelf_number: Number(editProductForm.shelf_number) || 1,
      shelf_location: shelfLoc,
      unit: unitCheck.cleanValue || 'عدد',
      min_stock: sanitizeNumber(editProductForm.min_stock, 10, 0, 1000000),
      purchase_price: sanitizeNumber(editProductForm.purchase_price, 0, 0, 1000000000000),
      sale_price: sanitizeNumber(editProductForm.sale_price, 0, 0, 1000000000000),
      barcode: barcodeCheck.cleanValue,
      description: descCheck.cleanValue,
      user_edited: true,
      updated_at: new Date().toISOString()
    };

    try {
      LocalStorageManager.recordLocalChange(
        currentEnv,
        currentUser.user_id,
        'PRODUCT',
        'UPDATE',
        editingProduct.product_id,
        updatedProduct,
        'UPDATE_PRODUCT',
        { sku: updatedProduct.sku, name: updatedProduct.name }
      );

      setShowEditProductModal(false);
      setEditingProduct(null);
      SyncEngine.syncNow(currentEnv).catch(() => {});
    } catch (err: any) {
      alert(err?.message || 'خطا در ذخیره تغییرات کالا');
    }
  };

  const handleOpenMovementForProduct = (prod: Product, type: MovementType) => {
    setMovementTargetProduct(prod);
    const initialWhId = warehouses[0]?.warehouse_id || '';
    const initialWh = warehouses.find(w => w.warehouse_id === initialWhId) || warehouses[0];
    const letter = initialWh?.shelf_letter || initialWh?.shelf_location?.match(/[A-Z]/i)?.[0]?.toUpperCase() || 'A';
    const num = initialWh?.shelf_number || parseInt(initialWh?.shelf_location?.replace(/[^0-9]/g, '') || '1', 10) || 1;
    setMovShelfLetter(letter);
    setMovShelfNumber(num);

    setMovForm({
      warehouse_id: initialWhId,
      to_warehouse_id: warehouses[1]?.warehouse_id || '',
      quantity: 1,
      movement_type: type,
      reference_id: type === 'STOCK_IN' ? `REC-${Date.now().toString().slice(-5)}` : `ISS-${Date.now().toString().slice(-5)}`,
      notes: '',
      valve_condition: 'HEALTHY'
    });
    setShowMovementModal(true);
  };

  const handleSaveMovement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!movementTargetProduct) return;

    const shelf_location = `${movShelfLetter}${movShelfNumber}`;
    const movId = generateUUID('MOV');
    const eventId = generateUUID('EVT');

    const cleanQtyStr = toEnglishDigits(String(movForm.quantity))
      .replace(/,/g, '.')
      .replace(/\//g, '.')
      .replace(/٫/g, '.')
      .trim();
    const parsedQty = parseFloat(cleanQtyStr);
    if (isNaN(parsedQty) || parsedQty <= 0) {
      alert('لطفاً تعداد / مقدار معتبر و بزرگتر از صفر (صحیح یا اعشاری) وارد نمایید.');
      return;
    }

    if (movForm.movement_type === 'TRANSFER_OUT') {
      const sourceWhId = movForm.warehouse_id || warehouses[0]?.warehouse_id;
      const destWhId = movForm.to_warehouse_id || warehouses.find(w => w.warehouse_id !== sourceWhId)?.warehouse_id;

      if (!destWhId) {
        alert('لطفاً انبار مقصد را انتخاب نمایید.');
        return;
      }
      if (sourceWhId === destWhId) {
        alert('انبار مبدأ و انبار مقصد نمی‌توانند یکسان باشند. لطفاً انبار مقصد متفاوتی را انتخاب نمایید.');
        return;
      }

      try {
        LocalStorageManager.executeWarehouseTransfer(currentEnv, currentUser, {
          productId: movementTargetProduct.product_id,
          sourceWarehouseId: sourceWhId,
          destWarehouseId: destWhId,
          quantity: parsedQty,
          referenceId: movForm.reference_id || `TRF-${Date.now().toString().slice(-5)}`,
          notes: movForm.notes,
          valveCondition: movForm.valve_condition || 'HEALTHY',
          sourceShelfLetter: movShelfLetter,
          sourceShelfNumber: movShelfNumber,
          destShelfLetter: movDestShelfLetter,
          destShelfNumber: movDestShelfNumber
        });

        alert('جابجایی بین انبارها با موفقیت ثبت شد و موجودی هر دو انبار مبدأ و مقصد به‌روزرسانی گردید.');
      } catch (err: any) {
        alert(err.message || 'خطا در ثبت جابجایی بین انبارها');
        return;
      }

      setShowMovementModal(false);
      return;
    }

    const movObj: StockMovement = {
      movement_id: movId,
      product_id: movementTargetProduct.product_id,
      warehouse_id: movForm.warehouse_id,
      to_warehouse_id: movForm.movement_type === 'TRANSFER_IN' ? movForm.to_warehouse_id : undefined,
      quantity: parsedQty,
      movement_type: movForm.movement_type,
      reference_id: movForm.reference_id || `DOC-${Date.now().toString().slice(-5)}`,
      unit_price: movementTargetProduct.purchase_price,
      user_id: currentUser.user_id,
      created_by_username: currentUser.username,
      device_id: currentUser.allowed_device_id,
      event_id: eventId,
      shelf_location,
      notes: movForm.notes,
      created_at: new Date().toISOString()
    };

    LocalStorageManager.updateWarehouseShelf(currentEnv, movForm.warehouse_id, movShelfLetter, movShelfNumber);

    LocalStorageManager.recordLocalChange(
      currentEnv,
      currentUser.user_id,
      'STOCK_MOVEMENT',
      'CREATE',
      movId,
      movObj,
      `STOCK_MOVEMENT_${movForm.movement_type}`,
      { product_name: movementTargetProduct.name, quantity: movObj.quantity, warehouse_id: movObj.warehouse_id, shelf_location }
    );

    setShowMovementModal(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Boxes className="w-5 h-5 text-indigo-400" />
            <span>کاتالوگ کالاها و موجودی لحظه‌ای انبارها</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            محاسبه قطعی موجودی از تراکنش‌های لجر غیرقابل تغییر با پشتیبانی از چند انبار
          </p>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {/* New prominent Print SKU Menu Button */}
          <button
            onClick={() => setShowSkuPrintModal(true)}
            title="منوی پرینت و چاپ رسمی کدهای کالا (SKU) به همراه نام محصولات"
            className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-indigo-950/90 hover:bg-indigo-900 text-indigo-300 border border-indigo-700/60 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all whitespace-nowrap cursor-pointer hover:text-white group"
          >
            <Printer className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-indigo-400 group-hover:scale-110 transition-transform" />
            <span>چاپ SKU و نام کالاها</span>
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-indigo-900/80 text-indigo-200 border border-indigo-700/50">
              {toPersianDigits(products.length)}
            </span>
          </button>

          <button
            onClick={() => {
              if (window.confirm('آیا از حذف کلیه اقلام تست در انبار اطمینان دارید؟')) {
                LocalStorageManager.purgeTestProductsFromWarehouse(currentEnv, currentUser.user_id);
              }
            }}
            title="حذف کلیه اقلام تست و آزمایشی از انبار"
            className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800/60 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all whitespace-nowrap cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-red-400" />
            <span>حذف اقلام تست</span>
          </button>

          <button
            onClick={() => setShowWarehouseModal(true)}
            title="مدیریت انبارهای پنج‌گانه و تعیین محل استقرار قفسه‌ها"
            className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all whitespace-nowrap cursor-pointer"
          >
            <WarehouseIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-indigo-400" />
            <span>مدیریت انبارها و قفسه‌ها</span>
          </button>

          <button
            onClick={handleOpenAddProduct}
            title="تعریف و ثبت کالای جدید با کد SKU خودکار"
            className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span>کالای جدید</span>
          </button>
        </div>
      </div>

      {/* Quick Status Filter Pills for 500+ Items - Horizontally scrollable on mobile */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 -webkit-overflow-scrolling-touch flex-nowrap sm:flex-wrap text-xs">
        <button
          type="button"
          onClick={() => {
            setStatusFilter('ALL');
            setCurrentPage(1);
          }}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 ${
            statusFilter === 'ALL'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 border-2 border-indigo-700 dark:border-indigo-500'
              : 'bg-white text-slate-900 border-2 border-slate-300 hover:bg-slate-100 hover:border-slate-400 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800 dark:hover:bg-slate-800 dark:hover:text-white'
          }`}
        >
          <span className={`font-bold ${statusFilter === 'ALL' ? 'text-white' : 'text-slate-900 dark:text-slate-200'}`}>همه کالاها</span>
          <span
            className={`font-mono text-[11px] px-2 py-0.5 rounded-lg font-black border transition-colors ${
              statusFilter === 'ALL'
                ? 'bg-indigo-950 text-white border-indigo-400/50 dark:bg-black/60 dark:text-indigo-200'
                : 'bg-slate-200 text-slate-900 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700'
            }`}
          >
            {toPersianDigits(products.length)}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setStatusFilter('OUT_OF_STOCK');
            setCurrentPage(1);
          }}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 ${
            statusFilter === 'OUT_OF_STOCK'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 border-2 border-rose-700 dark:border-rose-500'
              : 'bg-rose-50 text-rose-950 border-2 border-rose-300 hover:bg-rose-100 hover:border-rose-400 dark:bg-slate-900 dark:text-rose-300 dark:border-rose-900/60 dark:hover:bg-rose-950/40'
          }`}
        >
          <span className={`font-extrabold ${statusFilter === 'OUT_OF_STOCK' ? 'text-white' : 'text-rose-950 dark:text-rose-300'}`}>🔴 موجودی صفر</span>
          <span
            className={`font-mono text-[11px] px-2 py-0.5 rounded-lg font-black border transition-colors ${
              statusFilter === 'OUT_OF_STOCK'
                ? 'bg-rose-950 text-white border-rose-400/50 dark:bg-black/60 dark:text-rose-200'
                : 'bg-rose-200 text-rose-950 border-rose-300 dark:bg-rose-950/80 dark:text-rose-200 dark:border-rose-800'
            }`}
          >
            {toPersianDigits(statusStats.outOfStock)}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setStatusFilter('CRITICAL');
            setCurrentPage(1);
          }}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 ${
            statusFilter === 'CRITICAL'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30 border-2 border-amber-700 dark:border-amber-500'
              : 'bg-amber-50 text-amber-950 border-2 border-amber-300 hover:bg-amber-100 hover:border-amber-400 dark:bg-slate-900 dark:text-amber-300 dark:border-amber-900/60 dark:hover:bg-amber-950/40'
          }`}
        >
          <span className={`font-extrabold ${statusFilter === 'CRITICAL' ? 'text-white' : 'text-amber-950 dark:text-amber-300'}`}>🟠 زیر نقطه سفارش</span>
          <span
            className={`font-mono text-[11px] px-2 py-0.5 rounded-lg font-black border transition-colors ${
              statusFilter === 'CRITICAL'
                ? 'bg-amber-950 text-white border-amber-400/50 dark:bg-black/60 dark:text-amber-200'
                : 'bg-amber-200 text-amber-950 border-amber-300 dark:bg-amber-950/80 dark:text-amber-200 dark:border-amber-800'
            }`}
          >
            {toPersianDigits(statusStats.critical)}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setStatusFilter('WARN');
            setCurrentPage(1);
          }}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 ${
            statusFilter === 'WARN'
              ? 'bg-yellow-500 text-slate-950 shadow-md shadow-yellow-500/30 border-2 border-yellow-600 font-black'
              : 'bg-yellow-50 text-yellow-950 border-2 border-yellow-300 hover:bg-yellow-100 hover:border-yellow-400 dark:bg-slate-900 dark:text-yellow-300 dark:border-yellow-900/60 dark:hover:bg-yellow-950/40'
          }`}
        >
          <span className={`font-extrabold ${statusFilter === 'WARN' ? 'text-slate-950' : 'text-yellow-950 dark:text-yellow-300'}`}>🟡 نزدیک به سفارش</span>
          <span
            className={`font-mono text-[11px] px-2 py-0.5 rounded-lg font-black border transition-colors ${
              statusFilter === 'WARN'
                ? 'bg-yellow-900 text-white border-yellow-700'
                : 'bg-yellow-200 text-yellow-950 border-yellow-300 dark:bg-yellow-950/80 dark:text-yellow-200 dark:border-yellow-800'
            }`}
          >
            {toPersianDigits(statusStats.warn)}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setStatusFilter('GOOD');
            setCurrentPage(1);
          }}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 ${
            statusFilter === 'GOOD'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 border-2 border-emerald-700 dark:border-emerald-500'
              : 'bg-emerald-50 text-emerald-950 border-2 border-emerald-300 hover:bg-emerald-100 hover:border-emerald-400 dark:bg-slate-900 dark:text-emerald-300 dark:border-emerald-900/60 dark:hover:bg-emerald-950/40'
          }`}
        >
          <span className={`font-extrabold ${statusFilter === 'GOOD' ? 'text-white' : 'text-emerald-950 dark:text-emerald-300'}`}>🟢 مطلوب</span>
          <span
            className={`font-mono text-[11px] px-2 py-0.5 rounded-lg font-black border transition-colors ${
              statusFilter === 'GOOD'
                ? 'bg-emerald-950 text-white border-emerald-400/50 dark:bg-black/60 dark:text-emerald-200'
                : 'bg-emerald-200 text-emerald-950 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-200 dark:border-emerald-800'
            }`}
          >
            {toPersianDigits(statusStats.good)}
          </span>
        </button>
      </div>

      {/* Filters and search - Fully Responsive on Mobile & Tablet */}
      <div className="bg-slate-900/60 p-3 sm:p-4 rounded-xl border border-slate-800 space-y-3">
        {/* Row 1: Full-width responsive search input */}
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="جستجوی سریع میان ۵۰۰+ قلم کالا (نام، کد SKU، بارکد)..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-8 pr-9 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 font-sans shadow-inner"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setCurrentPage(1);
              }}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5 cursor-pointer"
              title="پاک کردن جستجو"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Row 2: Responsive Filter Dropdowns and Actions (wraps gracefully on tablet and mobile) */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          {/* Dropdown Filters Group */}
          <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[260px]">
            {/* Category */}
            <div className="flex items-center gap-1.5 flex-1 sm:flex-initial min-w-[130px]">
              <span className="text-[11px] text-slate-400 whitespace-nowrap">دسته‌بندی:</span>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full sm:w-auto bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 px-2.5 py-1.5 focus:outline-hidden focus:border-indigo-500 cursor-pointer shadow-xs"
              >
                <option value="ALL">همه دسته‌ها ({toPersianDigits(products.length)})</option>
                {categories.map(c => {
                  const count = products.filter(p => p.category_id === c.category_id).length;
                  return (
                    <option key={c.category_id} value={c.category_id}>
                      {c.name} ({toPersianDigits(count)})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Warehouse */}
            <div className="flex items-center gap-1.5 flex-1 sm:flex-initial min-w-[120px]">
              <span className="text-[11px] text-slate-400 whitespace-nowrap">انبار:</span>
              <select
                value={selectedWarehouse}
                onChange={(e) => {
                  setSelectedWarehouse(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full sm:w-auto bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 px-2.5 py-1.5 focus:outline-hidden focus:border-indigo-500 cursor-pointer shadow-xs"
              >
                <option value="ALL">همه انبارها ({toPersianDigits(products.length)})</option>
                {warehouses.map(w => {
                  let cleanName = w.name.replace(/^انبار\s+/, '').trim();
                  if (cleanName.includes('شیر')) cleanName = 'شیرآلات';
                  else if (cleanName.includes('ملزومات')) cleanName = 'ملزومات';
                  else if (cleanName.includes('ضایعات')) cleanName = 'ضایعات';
                  else if (cleanName.includes('تولید')) cleanName = 'خط تولید';
                  else if (cleanName.includes('مواد')) cleanName = 'مواد اولیه';
                  return (
                    <option key={w.warehouse_id} value={w.warehouse_id}>
                      {cleanName}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Sort By */}
            <div className="flex items-center gap-1.5 flex-1 sm:flex-initial min-w-[130px]">
              <span className="text-[11px] text-slate-400 whitespace-nowrap">مرتب‌سازی:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full sm:w-auto bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 px-2.5 py-1.5 focus:outline-hidden focus:border-indigo-500 cursor-pointer shadow-xs"
              >
                <option value="DEFAULT">پیش‌فرض</option>
                <option value="STOCK_DESC">بیشترین موجودی</option>
                <option value="STOCK_ASC">کمترین موجودی (کسری)</option>
                <option value="VALUE_DESC">بیشترین ارزش سرمایه</option>
                <option value="PRICE_DESC">گران‌ترین قیمت خرید</option>
                <option value="NAME_ASC">حروف الفبا (نام کالا)</option>
              </select>
            </div>
          </div>

          {/* Action Buttons and View Mode Switcher */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                setCatSuccessMsg(null);
                setCatErrorMsg(null);
                setCategoryFormMode('ADD');
                setEditingCategory(null);
                setCategoryForm({
                  name: '',
                  code: getSuggestedNextCategoryCode(),
                  description: ''
                });
                setShowCategoryModal(true);
              }}
              className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap shadow-xs hover:border-slate-600 cursor-pointer"
              title="مدیریت، افزودن و ویرایش دسته‌بندی‌ها"
            >
              <FolderKanban className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>دسته‌ها</span>
            </button>

            <button
              type="button"
              onClick={() => setShowSkuPrintModal(true)}
              className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap shadow-xs hover:border-slate-600 cursor-pointer"
              title="پرینت فهرست کدهای کالا (SKU) و نام محصولات"
            >
              <Printer className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>پرینت SKU</span>
            </button>

            {/* View Mode Toggle: Cards vs Table */}
            <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 p-0.5 rounded-xl shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
                title="نمایش جدولی کالاها"
              >
                <List className="w-3.5 h-3.5" />
                <span>جدول</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                  viewMode === 'cards'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
                title="نمایش کارتی کالاها (بهینه برای موبایل و تبلت)"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>کارتی</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Products Table or Responsive Cards */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filtered.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-400 bg-slate-900/80 border border-slate-800 rounded-2xl">
              <Boxes className="w-12 h-12 mx-auto mb-2 text-slate-600 opacity-50" />
              <div className="font-bold text-slate-300 text-sm">هیچ کالایی در انبار یافت نشد</div>
            </div>
          ) : (
            filtered.map((p, pIndex) => {
              const cat = categories.find(c => c.category_id === p.category_id);
              const whInfo = getProductWarehouseAndShelf(p);
              let totalQty = 0;
              warehouses.forEach(w => {
                const q = stockQuantities[p.product_id]?.[w.warehouse_id] || 0;
                totalQty += q;
              });
              const isLow = totalQty <= p.min_stock;
              const isZero = totalQty <= 0;
              const rowKey = p.product_id || `prd-card-${p.sku || ''}-${pIndex}`;

              return (
                <div
                  key={rowKey}
                  className="bg-slate-900/90 border border-slate-800 hover:border-indigo-500/60 rounded-2xl p-4 transition-all shadow-md flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap mb-1">
                          <span className="font-mono text-[10px] text-indigo-300 font-bold px-1.5 py-0.5 rounded bg-indigo-950/90 border border-indigo-800/60 shrink-0">
                            {p.sku}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300">
                            {cat?.name || 'کالای انبار'}
                          </span>
                        </div>
                        <h3 className="font-bold text-slate-100 text-sm group-hover:text-indigo-300 transition-colors" title={p.name}>
                          {p.name}
                        </h3>
                        {p.description && (
                          <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                            {p.description}
                          </p>
                        )}
                      </div>

                      <div className="text-left shrink-0">
                        <div className={`font-mono font-black text-lg ${
                          isZero ? 'text-rose-400' : isLow ? 'text-amber-400' : 'text-emerald-400'
                        }`}>
                          {toPersianDigits(totalQty)}
                        </div>
                        <div className="text-[10px] text-slate-400">{p.unit}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-800/80 pt-2.5 mt-2 bg-slate-950/40 p-2 rounded-xl">
                      <div>
                        <span className="text-[10px] text-slate-500 block">انبار و محل:</span>
                        <span className="font-bold text-slate-200 text-[11px]">{whInfo.warehouseName}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">قفسه:</span>
                        <span className="font-mono font-bold text-indigo-300 text-[11px]">{whInfo.shelfCode}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">نقطه سفارش:</span>
                        <span className="font-mono text-slate-300 text-[11px]">{toPersianDigits(p.min_stock)} {p.unit}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">بهای خرید:</span>
                        <span className="font-mono text-slate-200 text-[11px] font-bold">
                          {p.purchase_price ? formatCurrencyToman(p.purchase_price) : '---'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 pt-3 border-t border-slate-800/90 mt-3 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleOpenMovementForProduct(p, 'STOCK_IN')}
                      className="flex-1 min-w-[70px] py-1.5 px-2 rounded-lg bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/60 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                      title="رسید ورود به انبار"
                    >
                      <ArrowDownLeft className="w-3.5 h-3.5" />
                      <span>ورود</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenMovementForProduct(p, 'STOCK_OUT')}
                      className="flex-1 min-w-[70px] py-1.5 px-2 rounded-lg bg-rose-950/70 hover:bg-rose-900 text-rose-300 border border-rose-800/60 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                      title="حواله خروج از انبار"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <span>خروج</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEditProduct(p)}
                      className="py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                      title="ویرایش کالا"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>ویرایش</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteProductConfirm(p)}
                      className="p-1.5 rounded-lg bg-red-950/70 hover:bg-red-900 text-red-300 border border-red-800/50 cursor-pointer transition-colors"
                      title="حذف کالا از انبار"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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
              <span>جدول کالاها را به چپ یا راست بکشید (اسکرول لمسی)</span>
            </span>
            <span className="text-slate-500 font-mono text-[10px]">موجودی و قفسه‌ها ⇄</span>
          </div>

          <div className="overflow-x-auto -webkit-overflow-scrolling-touch overscroll-x-contain relative">
            <table className="w-full text-right text-xs min-w-[760px] sm:min-w-[850px] border-collapse">
              <thead className="bg-slate-950/95 text-slate-400 border-b border-slate-800 text-[10.5px] select-none">
                <tr>
                  <th className="py-2.5 px-3 font-bold text-slate-300 sticky right-0 z-20 bg-slate-950 border-b border-slate-800 shadow-[-2px_0_4px_rgba(0,0,0,0.4)] min-w-[180px]">کد و شرح کالا</th>
                  <th className="py-2.5 px-1.5 text-center font-bold text-slate-300 whitespace-nowrap">دسته</th>
                  <th className="py-2.5 px-1.5 text-center font-bold text-slate-300 whitespace-nowrap">کل موجودی</th>
                  <th className="py-2.5 px-2 text-center font-bold text-slate-300 whitespace-nowrap">انبار</th>
                  <th className="py-2.5 px-2 text-center font-bold text-slate-300 whitespace-nowrap">کد قفسه</th>
                  <th className="py-2.5 px-1.5 text-center font-bold text-slate-300 whitespace-nowrap">خرید / فروش</th>
                  <th className="py-2.5 px-2 text-center font-bold text-slate-300 whitespace-nowrap sticky left-0 z-20 bg-slate-950 border-b border-slate-800 shadow-[4px_0_8px_rgba(0,0,0,0.5)] w-24">عملیات</th>
                </tr>
              </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {filtered.length === 0 ? (
                <tr key="empty-inventory-state">
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Boxes className="w-12 h-12 mx-auto mb-2 text-slate-600 opacity-50" />
                    <div className="font-bold text-slate-300 text-sm">هیچ کالایی در انبار یافت نشد</div>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      کلیه اقلام تست از انبار حذف گردیدند. برای ثبت قلم کالای واقعی از دکمه «کالای جدید» در بالای صفحه استفاده نمایید.
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((p, pIndex) => {
                  const cat = categories.find(c => c.category_id === p.category_id);
                  const whInfo = getProductWarehouseAndShelf(p);
                  let totalQty = 0;
                  warehouses.forEach(w => {
                    const q = stockQuantities[p.product_id]?.[w.warehouse_id] || 0;
                    totalQty += q;
                  });

                  const isLow = totalQty <= p.min_stock;
                  const rowKey = p.product_id || `prd-${p.sku || ''}-${pIndex}`;

                  return (
                    <tr key={rowKey} className="hover:bg-slate-800/40 transition-colors group">
                      <td className="py-2.5 px-3 sticky right-0 z-10 bg-slate-900 group-hover:bg-slate-850 shadow-[-2px_0_4px_rgba(0,0,0,0.4)] transition-colors min-w-[180px]">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono text-[9.5px] text-indigo-300 font-bold px-1 py-0.2 rounded bg-indigo-950/80 border border-indigo-800/50 shrink-0">
                            {p.sku}
                          </span>
                          <span className="font-bold text-slate-100 text-xs truncate max-w-[150px] sm:max-w-[200px]" title={p.name}>
                            {p.name}
                          </span>
                        </div>
                        {p.description && (
                          <div className="text-[10px] text-slate-400 truncate max-w-[200px] mt-0.5 leading-tight">
                            {p.description}
                          </div>
                        )}
                      </td>

                      <td className="py-2 px-1 text-center whitespace-nowrap">
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                          {cat?.name ? cat.name.split(' ')[0] : '---'}
                        </span>
                      </td>

                      <td className="py-2 px-1 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <span className={`font-mono font-black text-xs sm:text-sm ${isLow ? 'text-amber-400' : 'text-slate-100'}`}>
                            {toPersianDigits(totalQty)}
                          </span>
                          <span className="text-[10px] text-slate-400">{p.unit}</span>
                          {isLow && (
                            <span title="زیر نقطه سفارش" className="text-amber-400 text-xs">
                              <AlertTriangle className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                      </td>

                      {/* انبار: شیرآلات/ملزومات/ضایعات/خط تولید/مواداولیه */}
                      <td className="py-2 px-2 text-center whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border shadow-xs ${getWarehouseColorClass(whInfo.warehouseName)}`}>
                          {whInfo.warehouseName}
                        </span>
                      </td>

                      {/* کد قفسه: A1-99/.../Z1-99 */}
                      <td className="py-2 px-2 text-center whitespace-nowrap">
                        <span className="inline-block font-mono font-black text-xs sm:text-sm text-indigo-300 bg-indigo-950/80 px-2.5 py-0.5 rounded-lg border border-indigo-700/60 tracking-wider shadow-sm" dir="ltr">
                          {whInfo.shelfCode}
                        </span>
                      </td>

                      <td className="py-2 px-1.5 text-center font-mono whitespace-nowrap">
                        <div className="text-[10px] text-slate-400">{formatCurrencyToman(p.purchase_price)}</div>
                        <div className="text-xs font-bold text-emerald-400">{formatCurrencyToman(p.sale_price)}</div>
                      </td>

                      <td className="py-2 px-2 text-center align-middle whitespace-nowrap sticky left-0 z-10 bg-slate-900 group-hover:bg-slate-850 shadow-[4px_0_8px_rgba(0,0,0,0.5)] transition-colors w-24">
                        <div className="flex items-center justify-center gap-1 mx-auto flex-wrap">
                          <button
                            onClick={() => handleOpenMovementForProduct(p, 'STOCK_IN')}
                            className="p-1.5 rounded-lg bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/50 transition-colors cursor-pointer shadow-xs"
                            title="رسید ورود به انبار"
                          >
                            <ArrowDownLeft className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenMovementForProduct(p, 'STOCK_OUT')}
                            className="p-1.5 rounded-lg bg-rose-950/70 hover:bg-rose-900 text-rose-300 border border-rose-800/50 transition-colors cursor-pointer shadow-xs"
                            title="حواله خروج از انبار"
                          >
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEditProduct(p)}
                            className="p-1.5 rounded-lg bg-amber-950/70 hover:bg-amber-900 text-amber-300 border border-amber-800/50 transition-colors cursor-pointer shadow-xs"
                            title="ویرایش کالا"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteProductConfirm(p)}
                            className="p-1.5 rounded-lg bg-red-950/70 hover:bg-red-900 text-red-300 border border-red-800/50 transition-colors cursor-pointer shadow-xs"
                            title="حذف کالا از انبار"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
      )}

      {/* Enterprise Pagination Controls for 500+ Items (Shared between Cards & Table) */}
      <div className="p-3 border border-slate-800 rounded-2xl bg-slate-900/90 shadow-md flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2 flex-wrap">
          <span>
            نمایش{' '}
            <strong className="text-white font-mono">
              {filteredAndSorted.length > 0 ? toPersianDigits((safeCurrentPage - 1) * pageSize + 1) : 0}
            </strong>{' '}
            تا{' '}
            <strong className="text-white font-mono">
              {toPersianDigits(Math.min(safeCurrentPage * pageSize, filteredAndSorted.length))}
            </strong>{' '}
            از{' '}
            <strong className="text-indigo-400 font-mono">
              {toPersianDigits(filteredAndSorted.length)}
            </strong>{' '}
            قلم کالا
          </span>

          <div className="flex items-center gap-1 mr-3 border-r border-slate-800 pr-3">
            <span className="text-[11px]">تعداد در صفحه:</span>
            {[25, 50, 100].map(sz => (
              <button
                key={sz}
                type="button"
                onClick={() => {
                  setPageSize(sz);
                  setCurrentPage(1);
                }}
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-colors cursor-pointer ${
                  pageSize === sz
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {toPersianDigits(sz)}
              </button>
            ))}
          </div>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={safeCurrentPage <= 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-200 dark:border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center gap-1"
            >
              <ChevronRight className="w-3.5 h-3.5" />
              <span>صفحه قبل</span>
            </button>

            <span className="px-2 font-mono text-xs text-slate-700 dark:text-slate-300 font-bold">
              صفحه {toPersianDigits(safeCurrentPage)} از {toPersianDigits(totalPages)}
            </span>

            <button
              type="button"
              disabled={safeCurrentPage >= totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-200 dark:border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>صفحه بعد</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* ====================================================================== */}
      {/* CATEGORY MANAGEMENT & EDIT MODAL                                      */}
      {/* ====================================================================== */}
      {showCategoryModal && (
        <div
          className="fixed inset-0 bg-black/85 backdrop-blur-md z-[80] flex items-center justify-center p-3 sm:p-4 overflow-y-auto cursor-pointer"
          onClick={() => {
            setShowCategoryModal(false);
            setCatErrorMsg(null);
            setCatSuccessMsg(null);
            setEditingCategory(null);
          }}
        >
          <div
            className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl shadow-2xl shadow-black/90 overflow-hidden my-auto cursor-default relative z-[81]"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <FolderKanban className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    مدیریت و ویرایش دسته‌بندی‌های کالا
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    تعریف، ویرایش و سازمان‌دهی دسته‌بندی‌ها با ثبت رویدادهای همگام‌سازی (Tri-Sync)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowCategoryModal(false);
                  setCatErrorMsg(null);
                  setCatSuccessMsg(null);
                  setEditingCategory(null);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-5 max-h-[80vh] overflow-y-auto">
              {/* Alert Messages */}
              {catSuccessMsg && (
                <div className="p-3 bg-emerald-950/70 border border-emerald-800/80 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{catSuccessMsg}</span>
                </div>
              )}

              {catErrorMsg && (
                <div className="p-3 bg-rose-950/70 border border-rose-800/80 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span>{catErrorMsg}</span>
                </div>
              )}

              {/* Category Add / Edit Form */}
              <div className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3 border-b border-slate-800/80 pb-2">
                  <div className="text-xs font-bold text-slate-200 flex items-center gap-2">
                    {categoryFormMode === 'EDIT' ? (
                      <>
                        <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                        <span>ویرایش دسته‌بندی: {editingCategory?.name}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/50">
                          {editingCategory?.code}
                        </span>
                      </>
                    ) : (
                      <>
                        <FolderPlus className="w-3.5 h-3.5 text-indigo-400" />
                        <span>افزودن دسته‌بندی جدید</span>
                      </>
                    )}
                  </div>

                  {categoryFormMode === 'EDIT' && (
                    <button
                      type="button"
                      onClick={() => {
                        setCategoryFormMode('ADD');
                        setEditingCategory(null);
                        setCategoryForm({
                          name: '',
                          code: getSuggestedNextCategoryCode(),
                          description: ''
                        });
                        setCatErrorMsg(null);
                      }}
                      className="text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      انصراف از ویرایش (دسته جدید)
                    </button>
                  )}
                </div>

                <form onSubmit={handleSaveCategory} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        نام دسته‌بندی *
                      </label>
                      <input
                        type="text"
                        required
                        value={categoryForm.name}
                        onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                        placeholder="مثال: قطعات و شیرآلات گاز"
                        className="w-full p-2 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        کد اختصاری دسته‌بندی *
                      </label>
                      <input
                        type="text"
                        required
                        value={categoryForm.code}
                        onChange={(e) => setCategoryForm({ ...categoryForm, code: e.target.value })}
                        placeholder="مثال: CAT-05 یا VALVE"
                        className="w-full p-2 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      شرح و توضیحات دسته‌بندی
                    </label>
                    <input
                      type="text"
                      value={categoryForm.description}
                      onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                      placeholder="توضیح مختصر درباره اقلام و کالاهای مشمول این دسته..."
                      className="w-full p-2 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    {categoryFormMode === 'EDIT' && (
                      <button
                        type="button"
                        onClick={() => {
                          setCategoryFormMode('ADD');
                          setEditingCategory(null);
                          setCategoryForm({
                            name: '',
                            code: getSuggestedNextCategoryCode(),
                            description: ''
                          });
                        }}
                        className="h-8 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors whitespace-nowrap flex items-center justify-center cursor-pointer"
                      >
                        انصراف
                      </button>
                    )}
                    <button
                      type="submit"
                      className={`h-8 px-4 rounded-lg text-white text-xs font-bold shadow flex items-center justify-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                        categoryFormMode === 'EDIT'
                          ? 'bg-amber-600 hover:bg-amber-500'
                          : 'bg-indigo-600 hover:bg-indigo-500'
                      }`}
                    >
                      <Save className="w-3.5 h-3.5 shrink-0" />
                      <span>{categoryFormMode === 'EDIT' ? 'ذخیره دسته' : 'ثبت دسته'}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Categories Table / List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-bold text-slate-200 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-indigo-400" />
                    <span>فهرست دسته‌بندی‌های فعال ({toPersianDigits(categories.length)})</span>
                  </span>
                  <span>برای ویرایش یا حذف روی عملیات مربوطه کلیک کنید</span>
                </div>

                <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[11px]">
                      <tr>
                        <th className="p-2.5">کد</th>
                        <th className="p-2.5">نام دسته‌بندی</th>
                        <th className="p-2.5">توضیحات</th>
                        <th className="p-2.5 text-center">تعداد کالا</th>
                        <th className="p-2.5 text-center">عملیات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {categories.map((c, cIdx) => {
                        const count = products.filter(p => p.category_id === c.category_id).length;
                        const isBeingEdited = editingCategory?.category_id === c.category_id;
                        const catKey = c.category_id || `cat-${c.code || ''}-${cIdx}`;

                        return (
                          <tr
                            key={catKey}
                            className={`hover:bg-slate-800/40 transition-colors ${
                              isBeingEdited ? 'bg-amber-950/30' : ''
                            }`}
                          >
                            <td className="p-2.5 font-mono text-indigo-300 font-bold">
                              {c.code}
                            </td>
                            <td className="p-2.5 font-medium text-slate-100">
                              {c.name}
                            </td>
                            <td className="p-2.5 text-slate-400 text-[11px] max-w-[180px] truncate">
                              {c.description || '---'}
                            </td>
                            <td className="p-2.5 text-center font-mono">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  count > 0
                                    ? 'bg-slate-800 text-slate-200'
                                    : 'bg-slate-900 text-slate-500'
                                }`}
                              >
                                {toPersianDigits(count)}
                              </span>
                            </td>
                            <td className="p-2.5 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditCategory(c)}
                                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 text-[11px] font-medium flex items-center gap-1 transition-colors"
                                  title="ویرایش این دسته‌بندی"
                                >
                                  <Edit3 className="w-3 h-3" />
                                  <span>ویرایش</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteCategory(c)}
                                  disabled={count > 0}
                                  className="px-2 py-1 rounded bg-rose-950/60 hover:bg-rose-900/80 disabled:opacity-40 disabled:hover:bg-rose-950/60 text-rose-300 text-[11px] font-medium flex items-center gap-1 transition-colors"
                                  title={
                                    count > 0
                                      ? 'امکان حذف دسته با کالا وجود ندارد'
                                      : 'حذف دسته‌بندی'
                                  }
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>حذف</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 border-t border-slate-800 flex justify-between items-center bg-slate-950/50">
              <span className="text-[11px] text-slate-400">
                تغییرات در تمام نسخه‌های آفلاین و کلادفلر D1 همگام‌سازی می‌شود.
              </span>
              <button
                type="button"
                onClick={() => {
                  setShowCategoryModal(false);
                  setCatErrorMsg(null);
                  setCatSuccessMsg(null);
                  setEditingCategory(null);
                }}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}
      {showAddProductModal && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setShowAddProductModal(false)}
        >
          <div
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden cursor-default"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Boxes className="w-4 h-4 text-indigo-400" />
                <span>تعریف کالای جدید در کاتالوگ انبار</span>
              </h3>
              <button onClick={() => setShowAddProductModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-slate-300">
                      کد کالا (SKU) *
                    </label>
                    <span className="text-[10px] text-indigo-400 font-medium flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                      <span>تولید خودکار حروف و اعداد</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      required
                      dir="ltr"
                      value={newProduct.sku || ''}
                      onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value.toUpperCase() })}
                      className="flex-1 p-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono font-bold text-indigo-200 tracking-wider focus:outline-none focus:border-indigo-500"
                      placeholder="MG-XXXX-XXXX"
                    />
                    <button
                      type="button"
                      onClick={handleRegenerateNewSku}
                      className="h-[34px] px-2.5 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/60 rounded-lg text-indigo-300 hover:text-white transition-all text-[11px] font-semibold flex items-center gap-1 shadow-sm active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
                      title="تولید مجدد کد شناسه SKU خودکار متشکل از ترکیب حروف و اعداد انگلیسی"
                    >
                      <RefreshCw className="w-3 h-3 text-indigo-400" />
                      <span>تولید مجدد</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    ترکیب یکتا از حروف انگلیسی و اعداد جهت تفکیک دقیق انبار و بارکد
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">نام کالا *</label>
                  <input
                    type="text"
                    required
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    placeholder="نام کامل تجاری کالا"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    دسته‌بندی کالا *
                  </label>
                  <select
                    value={newProduct.category_id}
                    onChange={(e) => {
                      const newCatId = e.target.value;
                      const freshSku = generateAutoSku(newCatId, categories, products);
                      setNewProduct({ ...newProduct, category_id: newCatId, sku: freshSku });
                    }}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    {categories.map(c => (
                      <option key={c.category_id} value={c.category_id}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>

                  {/* دکمه‌های مرتب و منظم با ارتفاع برابر و بدون شکست خط */}
                  <div className="mt-1.5 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleOpenAddCategory}
                      className="flex-1 h-8 px-2 bg-indigo-950/70 hover:bg-indigo-900 border border-indigo-800/60 rounded-lg text-indigo-300 hover:text-white transition-all text-xs font-medium flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
                      title="افزودن دسته‌بندی جدید در پنجره مدیریت"
                    >
                      <FolderPlus className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span className="whitespace-nowrap truncate">+ دسته جدید</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const currentCat = categories.find(c => c.category_id === newProduct.category_id);
                        if (currentCat) {
                          handleOpenEditCategory(currentCat);
                        } else {
                          handleOpenAddCategory();
                        }
                      }}
                      className="flex-1 h-8 px-2 bg-slate-800/90 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 hover:text-white transition-all text-xs font-medium flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
                      title="ویرایش دسته‌بندی انتخاب‌شده یا سایر دسته‌ها"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="whitespace-nowrap truncate">ویرایش دسته‌ها</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    انبار محل استقرار *
                  </label>
                  <select
                    value={newProduct.warehouse_id}
                    onChange={(e) => setNewProduct({ ...newProduct, warehouse_id: e.target.value })}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    {warehouses.map(w => {
                      let cleanName = w.name.replace(/^انبار\s+/, '').trim();
                      if (cleanName.includes('شیر')) cleanName = 'شیرآلات';
                      else if (cleanName.includes('ملزومات')) cleanName = 'ملزومات';
                      else if (cleanName.includes('ضایعات')) cleanName = 'ضایعات';
                      else if (cleanName.includes('تولید')) cleanName = 'خط تولید';
                      else if (cleanName.includes('مواد')) cleanName = 'مواد اولیه';
                      return (
                        <option key={w.warehouse_id} value={w.warehouse_id}>
                          {cleanName}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    کد قفسه (A1-99 تا Z1-99)
                  </label>
                  <div className="flex items-center gap-2">
                    <select
                      value={newProduct.shelf_letter || 'A'}
                      onChange={(e) => setNewProduct({ ...newProduct, shelf_letter: e.target.value })}
                      className="w-1/2 p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 font-mono font-bold focus:outline-none focus:border-indigo-500"
                    >
                      {SHELF_LETTERS.map(letter => (
                        <option key={letter} value={letter}>ردیف {letter}</option>
                      ))}
                    </select>

                    <select
                      value={newProduct.shelf_number || 1}
                      onChange={(e) => setNewProduct({ ...newProduct, shelf_number: Number(e.target.value) })}
                      className="w-1/2 p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 font-mono font-bold focus:outline-none focus:border-indigo-500"
                    >
                      {SHELF_NUMBERS.map(num => (
                        <option key={num} value={num}>شماره {num}</option>
                      ))}
                    </select>

                    <div className="font-mono text-xs font-black px-2.5 py-1.5 rounded-lg bg-indigo-950 text-indigo-300 border border-indigo-700/60 shrink-0" dir="ltr">
                      {`${newProduct.shelf_letter || 'A'}${newProduct.shelf_number || 1}`}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">واحد شمارش</label>
                  <input
                    type="text"
                    value={newProduct.unit}
                    onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    placeholder="عدد، دستگاه، کیلو، بسته..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">حداقل موجودی (نقطه سفارش)</label>
                  <input
                    type="number"
                    value={newProduct.min_stock}
                    onChange={(e) => setNewProduct({ ...newProduct, min_stock: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">بارکد کالا</label>
                  <input
                    type="text"
                    value={newProduct.barcode}
                    onChange={(e) => setNewProduct({ ...newProduct, barcode: e.target.value })}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                    placeholder="62600..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">قیمت خرید تومان</label>
                  <input
                    type="number"
                    value={newProduct.purchase_price}
                    onChange={(e) => setNewProduct({ ...newProduct, purchase_price: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">قیمت فروش تومان</label>
                  <input
                    type="number"
                    value={newProduct.sale_price}
                    onChange={(e) => setNewProduct({ ...newProduct, sale_price: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">توضیحات و مشخصات فنی</label>
                <textarea
                  rows={2}
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="p-3 border-t border-slate-800 flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="h-9 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors whitespace-nowrap flex items-center justify-center cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="h-9 px-5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 whitespace-nowrap flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4 shrink-0" />
                  <span>ثبت کالای جدید</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* EDIT PRODUCT MODAL (آپدیت اقلام با دیتابیس مرکزی)                     */}
      {/* ====================================================================== */}
      {showEditProductModal && editingProduct && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto cursor-pointer"
          onClick={() => {
            setShowEditProductModal(false);
            setEditingProduct(null);
          }}
        >
          <div
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden my-auto cursor-default"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>ویرایش مشخصات کالا:</span>
                    <span className="text-amber-300 font-mono text-xs">{editingProduct.sku}</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    به‌روزرسانی قیمت، موجودی، کد و نام کالا با همگام‌سازی فوری دیتابیس مرکزی
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowEditProductModal(false);
                  setEditingProduct(null);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditProduct} className="p-4 sm:p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-slate-300">کد کالا (SKU) *</label>
                    <button
                      type="button"
                      onClick={handleRegenerateEditSku}
                      className="text-[10px] text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 cursor-pointer"
                      title="تولید کد SKU جدید با ترکیب حروف و اعداد انگلیسی"
                    >
                      <RefreshCw className="w-3 h-3 text-amber-400" />
                      <span>تولید خودکار SKU</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    dir="ltr"
                    value={editProductForm.sku || ''}
                    onChange={(e) => setEditProductForm({ ...editProductForm, sku: e.target.value.toUpperCase() })}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-indigo-200 font-mono font-bold tracking-wider focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">نام و شرح کالا *</label>
                  <input
                    type="text"
                    required
                    value={editProductForm.name || ''}
                    onChange={(e) => setEditProductForm({ ...editProductForm, name: e.target.value })}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">دسته‌بندی</label>
                  <select
                    value={editProductForm.category_id || categories[0]?.category_id || ''}
                    onChange={(e) => setEditProductForm({ ...editProductForm, category_id: e.target.value })}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    {categories.map(c => (
                      <option key={c.category_id} value={c.category_id}>{c.name}</option>
                    ))}
                  </select>

                  {/* دکمه‌های مرتب و منظم با ارتفاع برابر و بدون شکست خط */}
                  <div className="mt-1.5 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleOpenAddCategory}
                      className="flex-1 h-8 px-2 bg-indigo-950/70 hover:bg-indigo-900 border border-indigo-800/60 rounded-lg text-indigo-300 hover:text-white transition-all text-xs font-medium flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
                      title="افزودن دسته‌بندی جدید در پنجره مدیریت"
                    >
                      <FolderPlus className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span className="whitespace-nowrap truncate">+ دسته جدید</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const currentCat = categories.find(c => c.category_id === editProductForm.category_id);
                        if (currentCat) {
                          handleOpenEditCategory(currentCat);
                        } else {
                          handleOpenAddCategory();
                        }
                      }}
                      className="flex-1 h-8 px-2 bg-slate-800/90 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 hover:text-white transition-all text-xs font-medium flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
                      title="ویرایش دسته‌بندی انتخاب‌شده یا سایر دسته‌ها"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="whitespace-nowrap truncate">ویرایش دسته‌ها</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    انبار محل استقرار
                  </label>
                  <select
                    value={editProductForm.warehouse_id || warehouses[0]?.warehouse_id}
                    onChange={(e) => setEditProductForm({ ...editProductForm, warehouse_id: e.target.value })}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    {warehouses.map(w => {
                      let cleanName = w.name.replace(/^انبار\s+/, '').trim();
                      if (cleanName.includes('شیر')) cleanName = 'شیرآلات';
                      else if (cleanName.includes('ملزومات')) cleanName = 'ملزومات';
                      else if (cleanName.includes('ضایعات')) cleanName = 'ضایعات';
                      else if (cleanName.includes('تولید')) cleanName = 'خط تولید';
                      else if (cleanName.includes('مواد')) cleanName = 'مواد اولیه';
                      return (
                        <option key={w.warehouse_id} value={w.warehouse_id}>
                          {cleanName}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    کد قفسه (A1-99 تا Z1-99)
                  </label>
                  <div className="flex items-center gap-2">
                    <select
                      value={editProductForm.shelf_letter || 'A'}
                      onChange={(e) => setEditProductForm({ ...editProductForm, shelf_letter: e.target.value })}
                      className="w-1/2 p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 font-mono font-bold focus:outline-none focus:border-amber-500"
                    >
                      {SHELF_LETTERS.map(letter => (
                        <option key={letter} value={letter}>ردیف {letter}</option>
                      ))}
                    </select>

                    <select
                      value={editProductForm.shelf_number || 1}
                      onChange={(e) => setEditProductForm({ ...editProductForm, shelf_number: Number(e.target.value) })}
                      className="w-1/2 p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 font-mono font-bold focus:outline-none focus:border-amber-500"
                    >
                      {SHELF_NUMBERS.map(num => (
                        <option key={num} value={num}>شماره {num}</option>
                      ))}
                    </select>

                    <div className="font-mono text-xs font-black px-2.5 py-1.5 rounded-lg bg-amber-950/60 text-amber-300 border border-amber-700/60 shrink-0" dir="ltr">
                      {`${editProductForm.shelf_letter || 'A'}${editProductForm.shelf_number || 1}`}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">واحد شمارش</label>
                  <input
                    type="text"
                    value={editProductForm.unit || 'عدد'}
                    onChange={(e) => setEditProductForm({ ...editProductForm, unit: e.target.value })}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">حداقل موجودی (نقطه سفارش)</label>
                  <input
                    type="number"
                    min={0}
                    value={editProductForm.min_stock ?? 10}
                    onChange={(e) => setEditProductForm({ ...editProductForm, min_stock: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">بارکد کالا</label>
                  <input
                    type="text"
                    value={editProductForm.barcode || ''}
                    onChange={(e) => setEditProductForm({ ...editProductForm, barcode: e.target.value })}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">قیمت خرید (تومان)</label>
                  <input
                    type="number"
                    min={0}
                    value={editProductForm.purchase_price ?? 0}
                    onChange={(e) => setEditProductForm({ ...editProductForm, purchase_price: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">قیمت فروش (تومان)</label>
                  <input
                    type="number"
                    min={0}
                    value={editProductForm.sale_price ?? 0}
                    onChange={(e) => setEditProductForm({ ...editProductForm, sale_price: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">توضیحات و مشخصات فنی</label>
                <textarea
                  rows={2}
                  value={editProductForm.description || ''}
                  onChange={(e) => setEditProductForm({ ...editProductForm, description: e.target.value })}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="p-3 border-t border-slate-800 flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditProductModal(false);
                    setEditingProduct(null);
                  }}
                  className="h-9 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors whitespace-nowrap flex items-center justify-center cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="h-9 px-5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md shadow-amber-600/20 flex items-center justify-center gap-1.5 transition-all whitespace-nowrap cursor-pointer"
                >
                  <Save className="w-4 h-4 shrink-0" />
                  <span>ذخیره تغییرات</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* QUICK STOCK MOVEMENT MODAL                                             */}
      {/* ====================================================================== */}
      {showMovementModal && movementTargetProduct && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto cursor-pointer"
          onClick={() => setShowMovementModal(false)}
        >
          <div
            className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl lg:max-w-4xl shadow-2xl overflow-hidden cursor-default h-[88vh] max-h-[88vh] flex flex-col my-auto"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:px-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/90 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                  <ArrowLeftRight className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>ثبت سند گردش انبار برای: {movementTargetProduct.name}</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">ثبت در لجر غیرقابل تغییر با توالی انحصاری و بروزرسانی لحظه‌ای موجودی</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowMovementModal(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                title="بستن پنجره"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form with Scrollable Content and Sticky Footer */}
            <form onSubmit={handleSaveMovement} className="flex flex-col flex-1 min-h-0 overflow-hidden text-xs">
              <div className="p-4 sm:p-6 space-y-4 flex-1 overflow-y-auto min-h-0 overscroll-contain">
                {/* Segmented Movement Type Selector Buttons */}
                <div className="space-y-1.5">
                  <label className="block font-semibold text-slate-200">
                    نوع عملیات و گردش انبار:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => setMovForm({ ...movForm, movement_type: 'STOCK_IN' })}
                      className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 ${
                        movForm.movement_type === 'STOCK_IN'
                          ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-950/50 ring-2 ring-emerald-500/30'
                          : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                      <span>رسید ورود (+)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMovForm({ ...movForm, movement_type: 'STOCK_OUT' })}
                      className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 ${
                        movForm.movement_type === 'STOCK_OUT'
                          ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-950/50 ring-2 ring-rose-500/30'
                          : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0" />
                      <span>حواله خروج (-)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const currentSource = movForm.warehouse_id || warehouses[0]?.warehouse_id || 'WH-VALVES';
                        const currentDest = movForm.to_warehouse_id === currentSource
                          ? (warehouses.find(w => w.warehouse_id !== currentSource)?.warehouse_id || 'WH-SUPPLIES')
                          : (movForm.to_warehouse_id || warehouses.find(w => w.warehouse_id !== currentSource)?.warehouse_id || 'WH-SUPPLIES');
                        setMovForm({
                          ...movForm,
                          movement_type: 'TRANSFER_OUT',
                          warehouse_id: currentSource,
                          to_warehouse_id: currentDest
                        });
                      }}
                      className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 ${
                        movForm.movement_type === 'TRANSFER_OUT'
                          ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-950/50 ring-2 ring-indigo-500/40'
                          : 'bg-slate-950/80 border-slate-800 text-indigo-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <ArrowLeftRight className="w-3.5 h-3.5 shrink-0 text-indigo-200" />
                      <span>جابجایی بین انبارها</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMovForm({ ...movForm, movement_type: 'ADJUSTMENT' })}
                      className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 ${
                        movForm.movement_type === 'ADJUSTMENT'
                          ? 'bg-amber-600 text-white border-amber-500 shadow-md shadow-amber-950/50 ring-2 ring-amber-500/30'
                          : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                      <span>تعدیل انبارگردانی</span>
                    </button>
                  </div>
                </div>

                {/* TRANSFER MODE: 2-Column Comparative Warehouse & Condition Layout */}
                {movForm.movement_type === 'TRANSFER_OUT' ? (
                  <div className="bg-gradient-to-b from-indigo-950/40 to-slate-900 border border-indigo-700/60 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
                    <div className="flex items-center justify-between border-b border-indigo-800/60 pb-2.5">
                      <div className="flex items-center gap-2 text-indigo-200 font-bold text-xs">
                        <ArrowLeftRight className="w-4 h-4 text-indigo-400 animate-pulse" />
                        <span>تنظیمات انبار مبدأ و مقصد برای جابجایی کالا: {movementTargetProduct.name}</span>
                      </div>
                      <span className="text-[10px] bg-indigo-900/90 text-indigo-200 px-2 py-0.5 rounded-md border border-indigo-700/60 font-mono">
                        Inter-Warehouse Transfer
                      </span>
                    </div>

                    {/* Source & Destination Side-by-Side Columns */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Column 1: Source Warehouse & Shelf */}
                      <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                          <label className="font-bold text-xs text-rose-300 flex items-center gap-1.5">
                            <span>📤 انبار مبدأ (ارسال‌کننده کالا) *</span>
                          </label>
                          <span className="text-[10px] text-slate-400">کسر موجودی</span>
                        </div>

                        {/* Interactive Warehouse Buttons for Source */}
                        <div className="space-y-1.5">
                          <span className="text-[11px] text-slate-400 block font-medium">انتخاب انبار ارسال‌کننده:</span>
                          <div className="grid grid-cols-1 gap-1.5">
                            {warehouses.map(w => {
                              const isSelected = movForm.warehouse_id === w.warehouse_id;
                              return (
                                <button
                                  key={w.warehouse_id}
                                  type="button"
                                  onClick={() => {
                                    const nextToWh = movForm.to_warehouse_id === w.warehouse_id
                                      ? warehouses.find(other => other.warehouse_id !== w.warehouse_id)?.warehouse_id || ''
                                      : movForm.to_warehouse_id;
                                    setMovForm({ ...movForm, warehouse_id: w.warehouse_id, to_warehouse_id: nextToWh });
                                    const letter = w.shelf_letter || w.shelf_location?.match(/[A-Z]/i)?.[0]?.toUpperCase() || 'A';
                                    const num = w.shelf_number || parseInt(w.shelf_location?.replace(/[^0-9]/g, '') || '1', 10) || 1;
                                    setMovShelfLetter(letter);
                                    setMovShelfNumber(num);
                                  }}
                                  className={`p-2 rounded-lg border text-right transition-all cursor-pointer flex items-center justify-between gap-2 ${
                                    isSelected
                                      ? 'bg-rose-950/80 border-rose-500 text-rose-100 ring-2 ring-rose-500/40 shadow-sm'
                                      : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${isSelected ? 'bg-rose-400' : 'bg-slate-600'}`} />
                                    <span className="font-bold text-xs">{w.name}</span>
                                  </div>
                                  <span className="font-mono text-[10px] text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                                    {w.code || w.warehouse_id}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Shelf Location for Source */}
                        <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-slate-300">محل قفسه در انبار مبدأ:</span>
                            <span className="font-mono font-bold text-xs bg-rose-950/80 text-rose-300 border border-rose-700/60 px-2 py-0.5 rounded">
                              {movShelfLetter}{movShelfNumber}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <select
                                value={movShelfLetter}
                                onChange={(e) => setMovShelfLetter(e.target.value)}
                                className="w-full p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 font-mono text-center font-bold text-xs cursor-pointer focus:border-rose-500"
                                title="ردیف قفسه مبدأ"
                              >
                                {SHELF_LETTERS.map(l => (
                                  <option key={l} value={l}>ردیف {l}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <select
                                value={movShelfNumber}
                                onChange={(e) => setMovShelfNumber(Number(e.target.value))}
                                className="w-full p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 font-mono text-center font-bold text-xs cursor-pointer focus:border-rose-500"
                                title="شماره قفسه مبدأ"
                              >
                                {SHELF_NUMBERS.map(n => (
                                  <option key={n} value={n}>شماره {n}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Column 2: Destination Warehouse & Shelf */}
                      <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                          <label className="font-bold text-xs text-emerald-300 flex items-center gap-1.5">
                            <span>📥 انبار مقصد (دریافت‌کننده کالا) *</span>
                          </label>
                          <span className="text-[10px] text-slate-400">افزایش موجودی</span>
                        </div>

                        {/* Interactive Warehouse Buttons for Destination */}
                        <div className="space-y-1.5">
                          <span className="text-[11px] text-slate-400 block font-medium">انتخاب انبار دریافت‌کننده:</span>
                          <div className="grid grid-cols-1 gap-1.5">
                            {warehouses.map(w => {
                              const isSource = w.warehouse_id === movForm.warehouse_id;
                              const currentDest = movForm.to_warehouse_id || warehouses.find(other => other.warehouse_id !== movForm.warehouse_id)?.warehouse_id;
                              const isSelected = currentDest === w.warehouse_id;

                              return (
                                <button
                                  key={w.warehouse_id}
                                  type="button"
                                  disabled={isSource}
                                  onClick={() => {
                                    if (isSource) return;
                                    setMovForm({ ...movForm, to_warehouse_id: w.warehouse_id });
                                    const letter = w.shelf_letter || w.shelf_location?.match(/[A-Z]/i)?.[0]?.toUpperCase() || 'B';
                                    const num = w.shelf_number || parseInt(w.shelf_location?.replace(/[^0-9]/g, '') || '1', 10) || 1;
                                    setMovDestShelfLetter(letter);
                                    setMovDestShelfNumber(num);
                                  }}
                                  className={`p-2 rounded-lg border text-right transition-all flex items-center justify-between gap-2 ${
                                    isSource
                                      ? 'opacity-40 bg-slate-950 border-slate-900 text-slate-500 cursor-not-allowed'
                                      : isSelected
                                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-100 ring-2 ring-emerald-500/40 shadow-sm cursor-pointer'
                                      : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white cursor-pointer'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${isSource ? 'bg-slate-700' : isSelected ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                                    <span className="font-bold text-xs">{w.name}</span>
                                  </div>
                                  {isSource ? (
                                    <span className="text-[10px] bg-slate-900 text-slate-500 px-1.5 py-0.5 rounded border border-slate-800">
                                      انبار مبدأ
                                    </span>
                                  ) : (
                                    <span className="font-mono text-[10px] text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                                      {w.code || w.warehouse_id}
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Shelf Location for Destination */}
                        <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-slate-300">محل قفسه در انبار مقصد:</span>
                            <span className="font-mono font-bold text-xs bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 px-2 py-0.5 rounded">
                              {movDestShelfLetter}{movDestShelfNumber}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <select
                                value={movDestShelfLetter}
                                onChange={(e) => setMovDestShelfLetter(e.target.value)}
                                className="w-full p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 font-mono text-center font-bold text-xs cursor-pointer focus:border-emerald-500"
                                title="ردیف قفسه مقصد"
                              >
                                {SHELF_LETTERS.map(l => (
                                  <option key={l} value={l}>ردیف {l}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <select
                                value={movDestShelfNumber}
                                onChange={(e) => setMovDestShelfNumber(Number(e.target.value))}
                                className="w-full p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 font-mono text-center font-bold text-xs cursor-pointer focus:border-emerald-500"
                                title="شماره قفسه مقصد"
                              >
                                {SHELF_NUMBERS.map(n => (
                                  <option key={n} value={n}>شماره {n}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Valve Condition Selection (سالم است یا معیوب شده؟) */}
                    <div className="pt-3 border-t border-indigo-900/60 space-y-2.5">
                      <div className="flex items-center justify-between flex-wrap gap-1">
                        <label className="font-extrabold text-xs text-white flex items-center gap-1.5">
                          <span>وضعیت شیر انتقالی / برگشتی (تعیین سالم یا معیوب بودن):</span>
                        </label>
                        <span className="text-[11px] text-amber-300 font-medium bg-amber-950/50 px-2 py-0.5 rounded border border-amber-800/40">
                          آیا شیر نو سالم مانده یا معیوب شده است؟
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Healthy Option Button Card */}
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={() => setMovForm(prev => ({ ...prev, valve_condition: 'HEALTHY' }))}
                          onKeyDown={(e) => {
                            if (e.key === ' ' || e.key === 'Enter') {
                              e.preventDefault();
                              setMovForm(prev => ({ ...prev, valve_condition: 'HEALTHY' }));
                            }
                          }}
                          className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 select-none active:scale-[0.99] ${
                            movForm.valve_condition === 'HEALTHY'
                              ? 'bg-emerald-950/90 border-emerald-500 text-emerald-100 shadow-md ring-2 ring-emerald-500/40'
                              : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-850'
                          }`}
                        >
                          <input
                            type="radio"
                            id="inv_valve_healthy"
                            name="inv_valve_cond"
                            value="HEALTHY"
                            checked={movForm.valve_condition === 'HEALTHY'}
                            onChange={() => setMovForm(prev => ({ ...prev, valve_condition: 'HEALTHY' }))}
                            className="mt-1 w-4 h-4 text-emerald-600 focus:ring-emerald-500 shrink-0 cursor-pointer"
                          />
                          <label htmlFor="inv_valve_healthy" className="space-y-1 cursor-pointer">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-extrabold text-xs text-emerald-300">🟢 شیر سالم است</span>
                              <span className="text-[10px] bg-emerald-900/90 text-emerald-200 px-1.5 py-0.5 rounded border border-emerald-700/60 font-sans font-bold">
                                نو و قابل استفاده
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-300 leading-relaxed">
                              شیر کاملاً سالم است. موجودی «قطعه شیر نو» در انبار مبدأ کسر و به انبار مقصد افزوده می‌شود.
                            </p>
                          </label>
                        </div>

                        {/* Defective Option Button Card */}
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={() => setMovForm(prev => ({ ...prev, valve_condition: 'DEFECTIVE' }))}
                          onKeyDown={(e) => {
                            if (e.key === ' ' || e.key === 'Enter') {
                              e.preventDefault();
                              setMovForm(prev => ({ ...prev, valve_condition: 'DEFECTIVE' }));
                            }
                          }}
                          className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 select-none active:scale-[0.99] ${
                            movForm.valve_condition === 'DEFECTIVE'
                              ? 'bg-rose-950/90 border-rose-500 text-rose-100 shadow-md ring-2 ring-rose-500/40'
                              : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-850'
                          }`}
                        >
                          <input
                            type="radio"
                            id="inv_valve_defective"
                            name="inv_valve_cond"
                            value="DEFECTIVE"
                            checked={movForm.valve_condition === 'DEFECTIVE'}
                            onChange={() => setMovForm(prev => ({ ...prev, valve_condition: 'DEFECTIVE' }))}
                            className="mt-1 w-4 h-4 text-rose-600 focus:ring-rose-500 shrink-0 cursor-pointer"
                          />
                          <label htmlFor="inv_valve_defective" className="space-y-1 cursor-pointer">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-extrabold text-xs text-rose-300">🔴 شیر معیوب شده است</span>
                              <span className="text-[10px] bg-rose-900/90 text-rose-200 px-1.5 py-0.5 rounded border border-rose-700/60 font-sans font-bold">
                                خراب / ضایعات / اسقاط
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-300 leading-relaxed">
                              شیر نو در انبار دیگر معیوب شده است. این مقدار از شیر نو انبار مبدأ کسر و به عنوان <strong className="text-rose-300 font-bold">«قطعه شیر معیوب و ضایعات»</strong> در انبار مقصد وارد می‌گردد.
                            </p>
                          </label>
                        </div>
                      </div>

                      {/* Live summary banner */}
                      <div className="bg-slate-950/90 p-3 rounded-xl border border-indigo-700/40 text-[11px] text-slate-200 flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 shrink-0 animate-pulse" />
                        <span>
                          گردش انتقال فعال: موجودی انبار مبدأ (<strong>{warehouses.find(w => w.warehouse_id === movForm.warehouse_id)?.name}</strong>) کاهش یافته و موجودی انبار مقصد (<strong>{warehouses.find(w => w.warehouse_id === (movForm.to_warehouse_id || warehouses.find(x => x.warehouse_id !== movForm.warehouse_id)?.warehouse_id))?.name}</strong>) همزمان بروزرسانی خواهد شد.
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Standard Mode for STOCK_IN, STOCK_OUT, ADJUSTMENT */
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">انبار انتخابی *</label>
                      <select
                        value={movForm.warehouse_id}
                        onChange={(e) => {
                          const whId = e.target.value;
                          setMovForm({ ...movForm, warehouse_id: whId });
                          const targetWh = warehouses.find(w => w.warehouse_id === whId);
                          if (targetWh) {
                            const letter = targetWh.shelf_letter || targetWh.shelf_location?.match(/[A-Z]/i)?.[0]?.toUpperCase() || 'A';
                            const num = targetWh.shelf_number || parseInt(targetWh.shelf_location?.replace(/[^0-9]/g, '') || '1', 10) || 1;
                            setMovShelfLetter(letter);
                            setMovShelfNumber(num);
                          }
                        }}
                        className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500 cursor-pointer"
                      >
                        {warehouses.map(w => (
                          <option key={w.warehouse_id} value={w.warehouse_id}>
                            {w.name} {w.shelf_location ? `(قفسه ${w.shelf_location})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-semibold text-slate-200">محل استقرار قفسه</label>
                        <span className="font-mono font-bold text-xs bg-indigo-950/80 text-indigo-300 border border-indigo-700/60 px-2 py-0.5 rounded shadow-sm">
                          {movShelfLetter}{movShelfNumber}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          value={movShelfLetter}
                          onChange={(e) => setMovShelfLetter(e.target.value)}
                          className="w-full p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 font-mono text-center font-bold focus:outline-none focus:border-indigo-500"
                          title="منوی حروف انگلیسی"
                        >
                          {SHELF_LETTERS.map(l => (
                            <option key={l} value={l}>ردیف {l}</option>
                          ))}
                        </select>
                        <select
                          value={movShelfNumber}
                          onChange={(e) => setMovShelfNumber(Number(e.target.value))}
                          className="w-full p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 font-mono text-center font-bold focus:outline-none focus:border-indigo-500"
                          title="منوی عدد"
                        >
                          {SHELF_NUMBERS.map(n => (
                            <option key={n} value={n}>شماره {n}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quantity & Reference ID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      تعداد / مقدار ({movementTargetProduct.unit}) *
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0.0001"
                      required
                      value={movForm.quantity}
                      onChange={(e) => setMovForm({ ...movForm, quantity: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === ',' || e.key === '/' || e.key === '٫') {
                          e.preventDefault();
                          const input = e.currentTarget;
                          const start = input.selectionStart || 0;
                          const end = input.selectionEnd || 0;
                          const val = input.value;
                          if (!val.includes('.')) {
                            const newVal = val.slice(0, start) + '.' + val.slice(end);
                            setMovForm({ ...movForm, quantity: newVal });
                          }
                        }
                      }}
                      placeholder="مثال: 1 یا 2.5"
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="col-span-1 sm:col-span-1">
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">شماره سند / بارنامه / فاکتور *</label>
                    <input
                      type="text"
                      required
                      value={movForm.reference_id}
                      onChange={(e) => setMovForm({ ...movForm, reference_id: e.target.value })}
                      placeholder="مثال: بارنامه شماره 98745"
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">شرح و علت گردش انبار</label>
                  <textarea
                    rows={2}
                    value={movForm.notes}
                    onChange={(e) => setMovForm({ ...movForm, notes: e.target.value })}
                    placeholder="مثال: بارگیری تحویل راننده آقای زمانی با پلاک..."
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Sticky action buttons footer */}
              <div className="p-3.5 sm:px-6 sm:py-4 border-t border-slate-800 bg-slate-950/95 flex items-center justify-end gap-3 shrink-0 z-20 shadow-lg">
                <button
                  type="button"
                  onClick={() => setShowMovementModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all whitespace-nowrap flex items-center justify-center cursor-pointer active:scale-95"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-lg shadow-indigo-600/30 whitespace-nowrap flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Save className="w-4 h-4 shrink-0" />
                  <span>ثبت سند انبار و بروزرسانی موجودی</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: مدیریت انبارهای رسمی و محل استقرار قفسه‌ها */}
      {showWarehouseModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm cursor-pointer"
          onClick={() => setShowWarehouseModal(false)}
        >
          <div
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden cursor-default"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
                  <WarehouseIcon className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-sm">
                    مدیریت انبارها و تنظیم محل استقرار قفسه‌ها
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    قفسه‌بندی براساس منوی حروف انگلیسی (A تا Z) و منوی شماره‌گذاری (۱ تا ۵۰)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowWarehouseModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Success message banner */}
            {warehouseShelfSavedMsg && (
              <div className="px-4 py-2.5 bg-emerald-950/60 border-b border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{warehouseShelfSavedMsg}</span>
              </div>
            )}

            {/* Warehouse List */}
            <div className="p-4 overflow-y-auto space-y-3.5 flex-1 text-xs">
              <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/80 text-[11px] text-slate-300 leading-relaxed">
                <span className="font-bold text-amber-400">توجه:</span> تنها ۵ انبار رسمی مورد تأیید سیستم می‌باشند (انبار شیر آلات، انبار ملزومات، انبار ضایعات، انبار خط تولید، انبار مواد اولیه). برای هر انبار می‌توانید محل استقرار قفسه را با حروف انگلیسی و شماره تنظیم کنید.
              </div>

              <div className="space-y-3">
                {warehouses.map((wh) => {
                  const currentLetter = wh.shelf_letter || wh.shelf_location?.match(/[A-Z]/i)?.[0]?.toUpperCase() || 'A';
                  const currentNum = wh.shelf_number || parseInt(wh.shelf_location?.replace(/[^0-9]/g, '') || '1', 10) || 1;

                  return (
                    <WarehouseShelfRow
                      key={wh.warehouse_id}
                      warehouse={wh}
                      currentLetter={currentLetter}
                      currentNum={currentNum}
                      onSave={(letter, num) => {
                        LocalStorageManager.updateWarehouseShelf(currentEnv, wh.warehouse_id, letter, num);
                        setWarehouseShelfSavedMsg(`محل استقرار قفسه «${wh.name}» با موفقیت به ${letter.toUpperCase()}${num} ذخیره شد.`);
                        setTimeout(() => setWarehouseShelfSavedMsg(null), 3500);
                      }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-slate-800 flex justify-end bg-slate-950/40">
              <button
                type="button"
                onClick={() => setShowWarehouseModal(false)}
                className="h-9 px-5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors whitespace-nowrap flex items-center justify-center cursor-pointer"
              >
                بستن پنجره
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Deletion Confirmation Modal */}
      {deleteProductConfirm && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-red-500/30 rounded-2xl p-5 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 text-red-400 mb-3">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-bold text-base text-slate-100">تایید حذف کالا از انبار</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              آیا از حذف کالای <strong className="text-white">«{deleteProductConfirm.name}»</strong> با کد <span className="font-mono text-indigo-300">({deleteProductConfirm.sku})</span> از فهرست کالاهای انبار اطمینان دارید؟
            </p>
            <div className="flex justify-end gap-2 mt-5">
              <button
                type="button"
                onClick={() => setDeleteProductConfirm(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={() => {
                  LocalStorageManager.deleteProduct(currentEnv, deleteProductConfirm.product_id, currentUser.user_id);
                  setDeleteProductConfirm(null);
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-lg shadow-red-600/30"
              >
                <Trash2 className="w-4 h-4" />
                <span>تایید و حذف کالا</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official SKU & Product Name Print Sheet / Labels Modal */}
      <SkuPrintModal
        isOpen={showSkuPrintModal}
        onClose={() => {
          setShowSkuPrintModal(false);
          if (onCloseSkuPrintDirectly) onCloseSkuPrintDirectly();
        }}
        products={products}
        categories={categories}
        warehouses={warehouses}
        currentUser={currentUser}
        productStockTotals={productStockTotals}
      />

    </div>
  );
};

function WarehouseShelfRow({
  warehouse,
  currentLetter,
  currentNum,
  onSave
}: {
  warehouse: Warehouse;
  currentLetter: string;
  currentNum: number;
  onSave: (letter: string, num: number) => void;
}) {
  const [letter, setLetter] = useState(currentLetter);
  const [num, setNum] = useState(currentNum);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setLetter(currentLetter);
    setNum(currentNum);
  }, [currentLetter, currentNum]);

  const handleSave = () => {
    onSave(letter, num);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const isChanged = letter !== currentLetter || num !== currentNum;

  return (
    <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3 hover:border-slate-700 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-slate-100">{warehouse.name}</span>
            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
              {warehouse.code}
            </span>
          </div>
          <div className="text-[11px] text-slate-400">{warehouse.address}</div>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-center">
          <span className="text-[11px] text-slate-400">قفسه کنونی:</span>
          <span className="font-mono font-bold text-xs bg-indigo-950 text-indigo-300 border border-indigo-700/60 px-2.5 py-0.5 rounded shadow-sm">
            {warehouse.shelf_location || `${currentLetter}${currentNum}`}
          </span>
        </div>
      </div>

      <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 flex-wrap">
          <span className="text-xs font-medium text-slate-300 whitespace-nowrap">
            محل استقرار قفسه:
          </span>
          <div className="flex items-center gap-2">
            {/* منوی حروف */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-slate-400">حرف:</span>
              <select
                value={letter}
                onChange={(e) => setLetter(e.target.value)}
                className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 font-mono text-center font-bold text-xs focus:outline-none focus:border-indigo-500"
                title="منوی حروف انگلیسی"
              >
                {SHELF_LETTERS.map(l => (
                  <option key={l} value={l}>ردیف {l}</option>
                ))}
              </select>
            </div>

            {/* منوی عدد */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-slate-400">عدد:</span>
              <select
                value={num}
                onChange={(e) => setNum(Number(e.target.value))}
                className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 font-mono text-center font-bold text-xs focus:outline-none focus:border-indigo-500"
                title="منوی عدد"
              >
                {SHELF_NUMBERS.map(n => (
                  <option key={n} value={n}>شماره {n}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1 px-2 py-1 rounded bg-slate-900 border border-slate-800 font-mono text-xs text-indigo-300 font-bold">
              <span>{letter}{num}</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={!isChanged && !isSaved}
          className={`h-8 px-3.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
            isSaved
              ? 'bg-emerald-600 text-white shadow-sm'
              : isChanged
              ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20'
              : 'bg-slate-200 text-slate-700 border border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 cursor-not-allowed opacity-80'
          }`}
        >
          {isSaved ? (
            <>
              <Check className="w-3.5 h-3.5 shrink-0" />
              <span>ذخیره شد</span>
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5 shrink-0" />
              <span>ذخیره قفسه</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
