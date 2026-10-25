import {
  User,
  Device,
  Category,
  Product,
  Warehouse,
  Customer,
  Supplier,
  StockMovement,
  SyncEvent,
  AuditLog,
  CylinderValveInspection
} from '../types';
import { SEED_GAS_CUSTOMERS, SEED_GAS_KARDEX_ENTRIES } from './gas-kardex-data';
import { EXCEL_CUSTOMERS_48 } from './excel-customers';
export { SEED_GAS_KARDEX_ENTRIES };

export const SEED_USERS: User[] = [
  {
    user_id: 'USR-001',
    username: 'amouei',
    password_salt: 'e9b2a7f830419c8d12b0e45c7198a321',
    password_hash: '866ab120f94c788b13b98383b7cd799eb7d90abce6ccf84902672dd15fef10cc',
    is_password_changed: true,
    full_name: 'آقای مهندس موسی عمویی',
    role: 'ADMIN',
    role_title: 'مدیریت ارشد',
    allowed_device_id: 'SYS-AMOUEL-ADMIN-01',
    system_id: 'SYS-AMOUEL-ADMIN-01',
    system_name: 'سیستم اداری مدیر عامل (ویندوز 11)'
  },
  {
    user_id: 'USR-002',
    username: 'karami',
    password_salt: 'd4c1b8a920538f7e21a0d34b8297b412',
    password_hash: '5d0e1bf5fcde3e15776e55dc299d0c969fd4cd6c219faa5ec1ff03df36d4f74c',
    is_password_changed: true,
    full_name: 'خانم کرمی',
    role: 'INTERNAL_MANAGER',
    role_title: 'مدیر داخلی',
    allowed_device_id: 'SYS-KARAMI-OFFICE-02',
    system_id: 'SYS-KARAMI-OFFICE-02',
    system_name: 'سیستم مدیریت داخلی (ویندوز 11)'
  },
  {
    user_id: 'USR-003',
    username: 'hajivand',
    password_salt: 'b7a3d2c18490e6f532c1b98a7124c563',
    password_hash: '29b462651ae04eead9b9e89b9ba453b6cd8c845f69413fb19bd9a1258919ecb1',
    is_password_changed: true,
    full_name: 'مهندس حاجی وند',
    role: 'WAREHOUSE_KEEPER',
    role_title: 'انباردار',
    allowed_device_id: 'SYS-HAJIVAND-WH-03',
    system_id: 'SYS-HAJIVAND-WH-03',
    system_name: 'سیستم صنعتی انبار مرکزی (ویندوز 7)'
  },
  {
    user_id: 'USR-004',
    username: 'safaei',
    password_salt: '9c92382f25193ea94822d360f72a80e6',
    password_hash: 'a9d12aa776abca0817eafd1bee9bf5563bb0728551d0b092f43c760503f7a5fa',
    is_password_changed: false,
    full_name: 'خانم صفایی',
    role: 'INTERNAL_MANAGER',
    role_title: 'امور دفتری و بازرگانی',
    allowed_device_id: 'SYS-SAFAEI-OFFICE-04',
    system_id: 'SYS-SAFAEI-OFFICE-04',
    system_name: 'سیستم اداری خانم صفایی (ویندوز 11)'
  },
  {
    user_id: 'USR-005',
    username: 'hakimi',
    password_salt: '6aab9991f7a58cab78a8edf161c3c404',
    password_hash: '07c7b08ad39d05db31bfe7d8d6d4cbc235d28bd04968970965c7d87836fb598d',
    is_password_changed: false,
    full_name: 'خانم حکیمی',
    role: 'INTERNAL_MANAGER',
    role_title: 'امور حسابداری و اسناد',
    allowed_device_id: 'SYS-HAKIMI-OFFICE-05',
    system_id: 'SYS-HAKIMI-OFFICE-05',
    system_name: 'سیستم اداری خانم حکیمی (ویندوز 11)'
  }
];

export const SEED_DEVICES: Device[] = [
  {
    device_id: 'SYS-AMOUEL-ADMIN-01',
    name: 'سیستم اداری مدیر آقای مهندس عمویی (ویندوز 11)',
    os: 'Windows 11',
    location: 'دفتر مدیریت ارشد - واحد مرکزی',
    last_seen_at: new Date().toISOString()
  },
  {
    device_id: 'SYS-KARAMI-OFFICE-02',
    name: 'سیستم اداری خانم کرمی (ویندوز 11)',
    os: 'Windows 11',
    location: 'دفتر مرکزی - واحد اداری و بازرگانی',
    last_seen_at: new Date().toISOString()
  },
  {
    device_id: 'SYS-HAJIVAND-WH-03',
    name: 'سیستم صنعتی انبار مرکزی مهندس حاجی‌وند (ویندوز 7)',
    os: 'Windows 7',
    location: 'سوله انبار مرکزی - ترمینال ورود و خروج سیلندر',
    last_seen_at: new Date().toISOString()
  },
  {
    device_id: 'SYS-SAFAEI-OFFICE-04',
    name: 'سیستم اداری خانم صفایی (ویندوز 11)',
    os: 'Windows 11',
    location: 'دفتر مرکزی - واحد امور دفتری و بازرگانی',
    last_seen_at: new Date().toISOString()
  },
  {
    device_id: 'SYS-HAKIMI-OFFICE-05',
    name: 'سیستم اداری خانم حکیمی (ویندوز 11)',
    os: 'Windows 11',
    location: 'دفتر مرکزی - واحد امور حسابداری و اسناد',
    last_seen_at: new Date().toISOString()
  },
  {
    device_id: 'OFFICE-PC-001',
    name: 'ترمینال دفتر مرکزی ویندوز 11',
    os: 'Windows 11',
    location: 'دفتر مرکزی - شبکه محلی',
    last_seen_at: new Date().toISOString()
  },
  {
    device_id: 'WAREHOUSE-PC-001',
    name: 'ترمینال انبارداری ویندوز 7',
    os: 'Windows 7',
    location: 'سوله انبار مرکزی',
    last_seen_at: new Date().toISOString()
  },
  {
    device_id: 'WEB-001',
    name: 'کنسول کلاد وب Cloudflare Worker',
    os: 'Cloudflare Worker Web',
    location: 'زیرساخت ابری کلادفلر D1',
    last_seen_at: new Date().toISOString()
  }
];

export const SEED_WAREHOUSES: Warehouse[] = [
  {
    warehouse_id: 'WH-VALVES',
    name: 'انبار شیر آلات',
    code: 'WH-01',
    address: 'سوله شماره ۱ - بخش شیرآلات و اتصالات فشار قوی صنعتی',
    shelf_location: 'A1',
    shelf_letter: 'A',
    shelf_number: 1,
    is_active: true
  },
  {
    warehouse_id: 'WH-SUPPLIES',
    name: 'انبار ملزومات',
    code: 'WH-02',
    address: 'سوله شماره ۲ - بخش قطعات مصرفی و ملزومات',
    shelf_location: 'B1',
    shelf_letter: 'B',
    shelf_number: 1,
    is_active: true
  },
  {
    warehouse_id: 'WH-WASTE',
    name: 'انبار ضایعات',
    code: 'WH-03',
    address: 'محوطه بازیافت صنعتی - بخش ضایعات و اقلام اسقاطی',
    shelf_location: 'C1',
    shelf_letter: 'C',
    shelf_number: 1,
    is_active: true
  },
  {
    warehouse_id: 'WH-PRODUCTION',
    name: 'انبار خط تولید',
    code: 'WH-04',
    address: 'سالن اصلی تولید و مونتاژ - انبار پای خط تولید',
    shelf_location: 'D1',
    shelf_letter: 'D',
    shelf_number: 1,
    is_active: true
  },
  {
    warehouse_id: 'WH-RAW-MATERIALS',
    name: 'انبار مواد اولیه',
    code: 'WH-05',
    address: 'سوله شماره ۳ - دپوی مواد اولیه و شمش‌های آلیاژی',
    shelf_location: 'E1',
    shelf_letter: 'E',
    shelf_number: 1,
    is_active: true
  }
];

export const SEED_CATEGORIES: Category[] = [
  {
    category_id: 'CAT-01',
    name: 'ابزارآلات صنعتی و پنوماتیک',
    code: 'TOOL',
    description: 'انواع تجهیزات، آچارها و دریل‌های پنوماتیک صنعتی',
    created_at: '2026-09-01T08:00:00.000Z',
    updated_at: '2026-09-01T08:00:00.000Z'
  },
  {
    category_id: 'CAT-02',
    name: 'شیرآلات و اتصالات فشارقوی',
    code: 'VALVE',
    description: 'شیرآلات فولادی، برنجی و اتصالات صنعتی خطوط انتقال',
    created_at: '2026-09-01T08:00:00.000Z',
    updated_at: '2026-09-01T08:00:00.000Z'
  },
  {
    category_id: 'CAT-03',
    name: 'تجهیزات الکتریکی و تابلو برق',
    code: 'ELEC',
    description: 'کلیدهای مینیاتوری، کنتاکتورها و اینورترهای صنعتی',
    created_at: '2026-09-01T08:00:00.000Z',
    updated_at: '2026-09-01T08:00:00.000Z'
  },
  {
    category_id: 'CAT-04',
    name: 'روانکارها و روغن‌های صنعتی',
    code: 'LUB',
    description: 'روغن‌های هیدرولیک و گریس‌های نسوز صنعتی',
    created_at: '2026-09-01T08:00:00.000Z',
    updated_at: '2026-09-01T08:00:00.000Z'
  },
  {
    category_id: 'CAT-NUTS',
    name: 'دسته مهره‌ها',
    code: 'NUT',
    description: 'انواع مهره‌های برنجی، فولادی، چپ‌گرد و راست‌گرد سیلندر و اتصالات صنعتی خط تولید',
    created_at: '2026-09-01T08:00:00.000Z',
    updated_at: '2026-09-01T08:00:00.000Z'
  }
];

export const SEED_PRODUCTS: Product[] = [
  // 1. شیرآلات اصلاح‌شده طبق دستور کاربر
  {
    product_id: 'PRD-VLV-11-25-50',
    sku: 'VLV-11-25-50',
    name: 'شیر 11/25/50 کیلویی',
    category_id: 'CAT-02',
    unit: 'عدد',
    min_stock: 50,
    purchase_price: 1850000,
    sale_price: 2400000,
    barcode: '6260881001001',
    description: 'شیر استاندارد کپسول‌های ۱۱، ۲۵ و ۵۰ کیلویی ام‌گاز',
    created_at: '2026-09-01T08:00:00.000Z',
    updated_at: '2026-09-01T08:00:00.000Z'
  },
  {
    product_id: 'PRD-VLV-PK-1-1.5-3',
    sku: 'VLV-PK-1-1.5-3',
    name: 'شیر پیکنیک 1/1.5/3 لیتری',
    category_id: 'CAT-02',
    unit: 'عدد',
    min_stock: 30,
    purchase_price: 950000,
    sale_price: 1350000,
    barcode: '6260881001002',
    description: 'شیر برنجی سیلندرهای پیکنیکی کوچک ۱، ۱.۵ و ۳ لیتری',
    created_at: '2026-09-01T08:00:00.000Z',
    updated_at: '2026-09-01T08:00:00.000Z'
  },
  {
    product_id: 'PRD-VLV-5-6',
    sku: 'VLV-5-6',
    name: 'شیر 5 و 6 کیلویی',
    category_id: 'CAT-02',
    unit: 'عدد',
    min_stock: 30,
    purchase_price: 1200000,
    sale_price: 1650000,
    barcode: '6260881001003',
    description: 'شیر استاندارد سیلندرهای ۵ و ۶ کیلویی ام‌گاز',
    created_at: '2026-09-01T08:00:00.000Z',
    updated_at: '2026-09-01T08:00:00.000Z'
  },

  // 2. مهره‌ها اصلاح‌شده طبق دستور کاربر (۸ قلم)
  {
    product_id: 'PRD-NUT-2KG',
    sku: 'NUT-2KG',
    name: 'مهره 2 کیلویی',
    category_id: 'CAT-NUTS',
    unit: 'عدد',
    min_stock: 50,
    purchase_price: 180000,
    sale_price: 250000,
    barcode: '6260882001001',
    description: 'مهره برنجی سیلندرهای ۲ کیلویی',
    created_at: '2026-09-01T08:00:00.000Z',
    updated_at: '2026-09-01T08:00:00.000Z'
  },
  {
    product_id: 'PRD-NUT-5KG',
    sku: 'NUT-5KG',
    name: 'مهره 5 کیلویی',
    category_id: 'CAT-NUTS',
    unit: 'عدد',
    min_stock: 50,
    purchase_price: 220000,
    sale_price: 300000,
    barcode: '6260882001002',
    description: 'مهره برنجی سیلندرهای ۵ کیلویی',
    created_at: '2026-09-01T08:00:00.000Z',
    updated_at: '2026-09-01T08:00:00.000Z'
  },
  {
    product_id: 'PRD-NUT-11-25-50-BUT',
    sku: 'NUT-11-25-50-BUT',
    name: 'مهره 11/25/50 کیلویی بوتانی',
    category_id: 'CAT-NUTS',
    unit: 'عدد',
    min_stock: 100,
    purchase_price: 280000,
    sale_price: 390000,
    barcode: '6260882001003',
    description: 'مهره برنجی استاندارد سیلندرهای ۱۱، ۲۵ و ۵۰ کیلویی بوتانی',
    created_at: '2026-09-01T08:00:00.000Z',
    updated_at: '2026-09-01T08:00:00.000Z'
  },
  {
    product_id: 'PRD-NUT-11-25-50-PRC',
    sku: 'NUT-11-25-50-PRC',
    name: 'مهره 11/25/50 کیلویی پرسی',
    category_id: 'CAT-NUTS',
    unit: 'عدد',
    min_stock: 100,
    purchase_price: 280000,
    sale_price: 390000,
    barcode: '6260882001004',
    description: 'مهره برنجی استاندارد سیلندرهای ۱۱، ۲۵ و ۵۰ کیلویی پرسی',
    created_at: '2026-09-01T08:00:00.000Z',
    updated_at: '2026-09-01T08:00:00.000Z'
  },
  {
    product_id: 'PRD-NUT-11-25-50-PAS',
    sku: 'NUT-11-25-50-PAS',
    name: 'مهره 11/25/50 کیلویی پاساری',
    category_id: 'CAT-NUTS',
    unit: 'عدد',
    min_stock: 80,
    purchase_price: 280000,
    sale_price: 390000,
    barcode: '6260882001005',
    description: 'مهره برنجی استاندارد سیلندرهای ۱۱، ۲۵ و ۵۰ کیلویی پاساری',
    created_at: '2026-09-01T08:00:00.000Z',
    updated_at: '2026-09-01T08:00:00.000Z'
  },
  {
    product_id: 'PRD-NUT-11-25-50-IRG',
    sku: 'NUT-11-25-50-IRG',
    name: 'مهره 11/25/50 کیلویی ایرانگازی',
    category_id: 'CAT-NUTS',
    unit: 'عدد',
    min_stock: 80,
    purchase_price: 280000,
    sale_price: 390000,
    barcode: '6260882001006',
    description: 'مهره برنجی استاندارد سیلندرهای ۱۱، ۲۵ و ۵۰ کیلویی ایرانگازی',
    created_at: '2026-09-01T08:00:00.000Z',
    updated_at: '2026-09-01T08:00:00.000Z'
  },
  {
    product_id: 'PRD-NUT-TANK-SPARE',
    sku: 'NUT-TANK-SPARE',
    name: 'مهره مخزن زاپاس',
    category_id: 'CAT-NUTS',
    unit: 'عدد',
    min_stock: 40,
    purchase_price: 450000,
    sale_price: 620000,
    barcode: '6260882001007',
    description: 'مهره و اتصالات یدکی و زاپاس مخازن گاز صنعتی',
    created_at: '2026-09-01T08:00:00.000Z',
    updated_at: '2026-09-01T08:00:00.000Z'
  },
  {
    product_id: 'PRD-NUT-TANK-ALL',
    sku: 'NUT-TANK-ALL',
    name: 'مهره تمام مخزن ها',
    category_id: 'CAT-NUTS',
    unit: 'عدد',
    min_stock: 50,
    purchase_price: 520000,
    sale_price: 720000,
    barcode: '6260882001008',
    description: 'مهره جامع و فراگیر استاندارد تمام مخازن ثابت و متحرک',
    created_at: '2026-09-01T08:00:00.000Z',
    updated_at: '2026-09-01T08:00:00.000Z'
  }
];

export const SEED_SUPPLIERS: Supplier[] = [
  {
    supplier_id: 'SUP-101',
    name: 'حاج رضا ابراهیمی',
    company_name: 'بازرگانی صنعتی ابزار صنعت پارس',
    phone: '021-66789012',
    address: 'تهران، میدان حسن‌آباد، کوچه شجاعی، پلاک 18',
    credit_limit: 500000000,
    current_balance: -85000000,
    created_at: '2026-09-01T07:00:00.000Z',
    updated_at: '2026-09-01T07:00:00.000Z'
  },
  {
    supplier_id: 'SUP-102',
    name: 'مهندس سهرابی',
    company_name: 'شرکت مهندسی پترو تجهیز دماوند',
    phone: '021-88992233',
    address: 'تهران، خیابان ولیعصر، نرسیده به توانیر، برج افق',
    credit_limit: 800000000,
    current_balance: 0,
    created_at: '2026-09-01T07:15:00.000Z',
    updated_at: '2026-09-01T07:15:00.000Z'
  }
];

// Rich customer profiles: Preserves MGas itself and all 48 customers imported from customers.xlsx
export const SEED_CUSTOMERS: Customer[] = [
  {
    customer_id: 'CUST-MGAS-VALVE',
    name: 'شعبه امگاز تولید شیر',
    company_name: 'شعبه ام‌گاز واحد تولید و بازسازی شیرآلات',
    manager_name: 'مدیریت واحد تولید شیرآلات ام‌گاز',
    phone: '021-44556677',
    province: 'تهران',
    city: 'تهران',
    address: 'کارخانه ام‌گاز - خط اختصاصی تولید و بازسازی شیرآلات',
    credit_limit: 10000000000,
    current_balance: 0,
    customer_type: 'سازمانی',
    notes: 'طرف حساب اختصاصی و انحصاری ورودی شیر نو و کهنه به انبار مرکزی ام گاز',
    created_at: '2026-09-01T08:00:00.000Z',
    updated_at: '2026-09-01T08:00:00.000Z'
  },
  // All 48 customers imported from customers.xlsx
  ...EXCEL_CUSTOMERS_48
];

export const INITIAL_STOCK_MOVEMENTS: StockMovement[] = [];

export const INITIAL_SYNC_EVENTS: SyncEvent[] = [];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    audit_id: 'AUD-001',
    user_id: 'USR-001',
    device_id: 'OFFICE-PC-001',
    action: 'INITIALIZE_DATABASE',
    entity_type: 'SYSTEM',
    entity_id: 'SYS-INIT',
    timestamp: '2026-09-01T06:00:00.000Z',
    metadata: { note: 'راه‌اندازی معماری سه دیتابیس و ایجاد جداول استاندارد D1 و SQLite (بانک داده کاملاً تخلیه و آماده ثبت)' }
  }
];

export const SEED_CYLINDER_VALVE_INSPECTIONS: CylinderValveInspection[] = [];

