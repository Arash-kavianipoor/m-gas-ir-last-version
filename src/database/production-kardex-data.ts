import {
  GasProductionKardexEntry,
  ProductionCylinderType,
  PRODUCTION_CYLINDER_TYPES,
  PRODUCTION_SUB_VARIANTS_MAP,
  DEFAULT_PRODUCTION_CYLINDER_TYPE
} from '../types';
import * as XLSX from 'xlsx';

/**
 * Recalculates progressive stock balances for production kardex entries of a given product and sub-variant
 * Each sub-variant operates as an independent product with its own stock balance:
 * Formula: balance = prevBalance + production_in - dispatch_out - defect_reject
 */
export function recalculateProductionKardexBalances(
  entries: GasProductionKardexEntry[]
): GasProductionKardexEntry[] {
  const balancesByKey: Record<string, number> = {};
  return entries.map((entry) => {
    const key = `${entry.cylinder_type}__${entry.sub_variant || 'استاندارد'}`;
    const prev = balancesByKey[key] || 0;
    const prodIn = Number(entry.production_in) || 0;
    const dispOut = Number(entry.dispatch_out) || 0;
    const rej = Number(entry.defect_reject) || 0;
    const runningBalance = Math.max(0, prev + prodIn - dispOut - rej);
    balancesByKey[key] = runningBalance;
    return {
      ...entry,
      stock_balance: runningBalance
    };
  });
}

/**
 * Returns available sub-variants for a given production cylinder type
 */
export function getSubVariantsForProduct(type: ProductionCylinderType | string): string[] {
  if (type in PRODUCTION_SUB_VARIANTS_MAP) {
    return PRODUCTION_SUB_VARIANTS_MAP[type as ProductionCylinderType];
  }
  return ['استاندارد'];
}

/**
 * Calculates current stock balances for each sub-variant of each production product
 */
export function calculateSubVariantStockMap(
  entries: GasProductionKardexEntry[]
): Record<string, Record<string, number>> {
  const activeEntries = entries.filter(e => !e.is_deleted);
  const sorted = [...activeEntries].sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  const calculated = recalculateProductionKardexBalances(sorted);

  const map: Record<string, Record<string, number>> = {};

  PRODUCTION_CYLINDER_TYPES.forEach(t => {
    map[t] = {};
    const subs = getSubVariantsForProduct(t);
    subs.forEach(s => {
      map[t][s] = 0;
    });
  });

  calculated.forEach(item => {
    const cType = item.cylinder_type;
    const sVar = item.sub_variant || 'استاندارد';
    if (!map[cType]) map[cType] = {};
    map[cType][sVar] = item.stock_balance;
  });

  return map;
}

/**
 * Initial comprehensive Seed Data for all 10 M-Gas Production Cylinder Types
 */
export const SEED_GAS_PRODUCTION_KARDEX_ENTRIES: GasProductionKardexEntry[] = [
  // 1. سیلندر 11 کیلویی
  {
    entry_id: 'PRD-11KG-001',
    cylinder_type: 'سیلندر 11 کیلویی',
    sub_variant: 'استاندارد',
    date: '1405/06/10',
    description: 'تولید شیفت صبح - خط شماره ۱ مونتاژ و تست هیدرواستاتیک',
    transfer_sheet_number: 'PRD-14050610-01',
    batch_number: 'BAT-11-2601',
    production_in: 200,
    dispatch_out: 0,
    defect_reject: 2,
    stock_balance: 198,
    shift_name: 'صبح',
    supervisor: 'آقای مهندس موسی عمویی',
    destination_or_source: 'خط تولید کارخانه ام‌گاز',
    notes: 'شیرنو استاندارد نصب و تست نشتی انجام شد',
    user_id: 'USR-001',
    created_by_username: 'amouei',
    device_id: 'SYS-AMOUEL-ADMIN-01',
    event_id: 'EVT-PRD-001',
    created_at: '2026-09-01T08:00:00.000Z',
    updated_at: '2026-09-01T08:00:00.000Z'
  },
  {
    entry_id: 'PRD-11KG-002',
    cylinder_type: 'سیلندر 11 کیلویی',
    sub_variant: 'استاندارد',
    date: '1405/06/12',
    description: 'بارگیری و تحویل به ناوگان پخش نمایندگی البرز گاز',
    transfer_sheet_number: 'DSP-14050612-01',
    batch_number: 'BAT-11-2601',
    production_in: 0,
    dispatch_out: 120,
    defect_reject: 0,
    stock_balance: 78,
    shift_name: 'عصر',
    supervisor: 'خانم کرمی',
    destination_or_source: 'نمایندگی البرز گاز',
    notes: 'بارنامه شماره BR-98442 راننده آقای بیاتی',
    user_id: 'USR-002',
    created_by_username: 'karami',
    device_id: 'SYS-KARAMI-OFFICE-02',
    event_id: 'EVT-PRD-002',
    created_at: '2026-09-03T14:30:00.000Z',
    updated_at: '2026-09-03T14:30:00.000Z'
  },
  {
    entry_id: 'PRD-11KG-003',
    cylinder_type: 'سیلندر 11 کیلویی',
    sub_variant: 'استاندارد',
    date: '1405/06/15',
    description: 'تولید تکمیلی شیفت عصر - بچ ۲۶۰۲ همراه با رنگ‌آمیزی صنعتی',
    transfer_sheet_number: 'PRD-14050615-02',
    batch_number: 'BAT-11-2602',
    production_in: 150,
    dispatch_out: 0,
    defect_reject: 1,
    stock_balance: 227,
    shift_name: 'عصر',
    supervisor: 'مهندس حاجی وند',
    destination_or_source: 'انبار مرکزی محصول',
    notes: 'کنترل ضخامت بدنه و رنگ آبی ام‌گاز',
    user_id: 'USR-003',
    created_by_username: 'hajivand',
    device_id: 'SYS-HAJIVAND-WH-03',
    event_id: 'EVT-PRD-003',
    created_at: '2026-09-06T16:00:00.000Z',
    updated_at: '2026-09-06T16:00:00.000Z'
  },

  // 2. سیلندر 25 کیلویی
  {
    entry_id: 'PRD-25KG-001',
    cylinder_type: 'سیلندر 25 کیلویی',
    sub_variant: 'استاندارد',
    date: '1405/06/08',
    description: 'تولید سیلندرهای تجاری ۲۵ کیلوگرمی جهت مصارف رستوران و هتل‌ها',
    transfer_sheet_number: 'PRD-14050608-25',
    batch_number: 'BAT-25-104',
    production_in: 80,
    dispatch_out: 0,
    defect_reject: 0,
    stock_balance: 80,
    shift_name: 'صبح',
    supervisor: 'آقای مهندس موسی عمویی',
    destination_or_source: 'خط شماره ۲',
    notes: 'پایان تست فشار ۳۰ بار',
    user_id: 'USR-001',
    created_by_username: 'amouei',
    device_id: 'SYS-AMOUEL-ADMIN-01',
    event_id: 'EVT-PRD-25-01',
    created_at: '2026-08-30T09:00:00.000Z',
    updated_at: '2026-08-30T09:00:00.000Z'
  },
  {
    entry_id: 'PRD-25KG-002',
    cylinder_type: 'سیلندر 25 کیلویی',
    sub_variant: 'استاندارد',
    date: '1405/06/14',
    description: 'ارسال حواله به نمایندگی پارس گاز جنوب',
    transfer_sheet_number: 'DSP-14050614-25',
    batch_number: 'BAT-25-104',
    production_in: 0,
    dispatch_out: 35,
    defect_reject: 0,
    stock_balance: 45,
    shift_name: 'صبح',
    supervisor: 'خانم کرمی',
    destination_or_source: 'پارس گاز جنوب',
    notes: 'تحویل باربری ترابری البرز',
    user_id: 'USR-002',
    created_by_username: 'karami',
    device_id: 'SYS-KARAMI-OFFICE-02',
    event_id: 'EVT-PRD-25-02',
    created_at: '2026-09-05T10:15:00.000Z',
    updated_at: '2026-09-05T10:15:00.000Z'
  },

  // 3. سیلندر 50 کیلویی
  {
    entry_id: 'PRD-50KG-001',
    cylinder_type: 'سیلندر 50 کیلویی',
    sub_variant: 'استاندارد',
    date: '1405/06/05',
    description: 'تولید سیلندرهای صنعتی سنگین ۵۰ کیلوگرمی برای مصارف کارخانجات',
    transfer_sheet_number: 'PRD-14050605-50',
    batch_number: 'BAT-50-88',
    production_in: 50,
    dispatch_out: 0,
    defect_reject: 1,
    stock_balance: 49,
    shift_name: 'صبح',
    supervisor: 'آقای مهندس موسی عمویی',
    destination_or_source: 'ایستگاه تست هیدرواستاتیک',
    notes: 'شیرهای برنجی صنعتی سنگین',
    user_id: 'USR-001',
    created_by_username: 'amouei',
    device_id: 'SYS-AMOUEL-ADMIN-01',
    event_id: 'EVT-PRD-50-01',
    created_at: '2026-08-27T11:00:00.000Z',
    updated_at: '2026-08-27T11:00:00.000Z'
  },
  {
    entry_id: 'PRD-50KG-002',
    cylinder_type: 'سیلندر 50 کیلویی',
    sub_variant: 'استاندارد',
    date: '1405/06/18',
    description: 'ارسال محموله به شرکت صنعتی سیمان خوزستان',
    transfer_sheet_number: 'DSP-14050618-50',
    batch_number: 'BAT-50-88',
    production_in: 0,
    dispatch_out: 20,
    defect_reject: 0,
    stock_balance: 29,
    shift_name: 'عصر',
    supervisor: 'خانم صفایی',
    destination_or_source: 'سیمان خوزستان',
    notes: 'پلاک کامیون ۱۲ب۴۴۵ ایران ۶۸',
    user_id: 'USR-004',
    created_by_username: 'safaei',
    device_id: 'SYS-SAFAEI-OFFICE-04',
    event_id: 'EVT-PRD-50-02',
    created_at: '2026-09-09T15:20:00.000Z',
    updated_at: '2026-09-09T15:20:00.000Z'
  },

  // 4. سیلندر لیفتراکی (دارای ۲ عدد شیر و ۲ عدد مهره)
  {
    entry_id: 'PRD-LFTR-001',
    cylinder_type: 'سیلندر لیفتراکی',
    sub_variant: 'استاندارد',
    valve_type: 'شیر نو ۱۱ کیلویی لیفتراک',
    valve_type_2: 'شیر نو ۱۱ کیلویی لیفتراک',
    nut_type: 'مهره لیفتراکی',
    nut_type_2: 'مهره لیفتراکی',
    date: '1405/06/07',
    description: 'تولید کپسول لیفتراکی ۲ شیره مجهز به شیر مایع، شیر بخار و ۲ مهره لیفتراکی',
    transfer_sheet_number: 'PRD-14050607-LF',
    batch_number: 'BAT-LF-12',
    production_in: 90,
    dispatch_out: 0,
    defect_reject: 0,
    stock_balance: 90,
    shift_name: 'صبح',
    supervisor: 'آقای مهندس موسی عمویی',
    destination_or_source: 'خط سیلندر لیفتراک',
    notes: 'تست سوپاپ تخلیه سریع گاز مایع (۲ شیر و ۲ مهره نصب شد)',
    user_id: 'USR-001',
    created_by_username: 'amouei',
    device_id: 'SYS-AMOUEL-ADMIN-01',
    event_id: 'EVT-PRD-LF-01',
    created_at: '2026-08-29T10:00:00.000Z',
    updated_at: '2026-08-29T10:00:00.000Z'
  },
  {
    entry_id: 'PRD-LFTR-002',
    cylinder_type: 'سیلندر لیفتراکی',
    sub_variant: 'استاندارد',
    valve_type: 'شیر نو ۱۱ کیلویی لیفتراک',
    valve_type_2: 'شیر نو ۱۱ کیلویی لیفتراک',
    nut_type: 'مهره لیفتراکی',
    nut_type_2: 'مهره لیفتراکی',
    date: '1405/06/16',
    description: 'تحویل سیلندر لیفتراکی به انبارهای شرکت دیجی‌کالا و لجستیک (۲ شیر و ۲ مهره)',
    transfer_sheet_number: 'DSP-14050616-LF',
    batch_number: 'BAT-LF-12',
    production_in: 0,
    dispatch_out: 40,
    defect_reject: 0,
    stock_balance: 50,
    shift_name: 'صبح',
    supervisor: 'خانم کرمی',
    destination_or_source: 'مرکز لجستیک بادپا',
    notes: 'حواله خروج رسمی با بارنامه ترابری (کسر ۴۰×۲ شیر و ۴۰×۲ مهره لیفتراکی)',
    user_id: 'USR-002',
    created_by_username: 'karami',
    device_id: 'SYS-KARAMI-OFFICE-02',
    event_id: 'EVT-PRD-LF-02',
    created_at: '2026-09-07T11:45:00.000Z',
    updated_at: '2026-09-07T11:45:00.000Z'
  },

  // 5. مخزن 20 کیلویی(تپل/دراز)
  {
    entry_id: 'PRD-TK20-001',
    cylinder_type: 'مخزن 20 کیلویی(تپل/دراز)',
    sub_variant: 'تپل',
    date: '1405/06/06',
    description: 'تولید مخازن ۲۰ کیلوگرمی مدل تپل با اتصالات استاندارد',
    transfer_sheet_number: 'PRD-14050606-T20-1',
    batch_number: 'BAT-T20-03',
    production_in: 60,
    dispatch_out: 15,
    defect_reject: 1,
    stock_balance: 44,
    shift_name: 'صبح',
    supervisor: 'آقای مهندس موسی عمویی',
    destination_or_source: 'سالن مخزن‌سازی ام‌گاز',
    notes: 'تست پرچ پایه‌ها و مدل تپل',
    user_id: 'USR-001',
    created_by_username: 'amouei',
    device_id: 'SYS-AMOUEL-ADMIN-01',
    event_id: 'EVT-PRD-T20-01',
    created_at: '2026-08-28T09:30:00.000Z',
    updated_at: '2026-08-28T09:30:00.000Z'
  },
  {
    entry_id: 'PRD-TK20-002',
    cylinder_type: 'مخزن 20 کیلویی(تپل/دراز)',
    sub_variant: 'دراز',
    date: '1405/06/07',
    description: 'تولید مخازن ۲۰ کیلوگرمی مدل دراز صنعتی',
    transfer_sheet_number: 'PRD-14050607-T20-2',
    batch_number: 'BAT-T20-04',
    production_in: 50,
    dispatch_out: 10,
    defect_reject: 0,
    stock_balance: 40,
    shift_name: 'عصر',
    supervisor: 'خانم حکیمی',
    destination_or_source: 'سالن مخزن‌سازی ام‌گاز',
    notes: 'تست جوش طولی بدنه مخزن دراز',
    user_id: 'USR-005',
    created_by_username: 'hakimi',
    device_id: 'SYS-HAKIMI-OFFICE-05',
    event_id: 'EVT-PRD-T20-02',
    created_at: '2026-08-29T15:10:00.000Z',
    updated_at: '2026-08-29T15:10:00.000Z'
  },

  // 6. مخزن 25 کیلویی (تپل/دراز)
  {
    entry_id: 'PRD-TK25-001',
    cylinder_type: 'مخزن 25 کیلویی (تپل/دراز)',
    sub_variant: 'تپل',
    date: '1405/06/09',
    description: 'تولید مخازن ۲۵ کیلوگرمی مدل تپل',
    transfer_sheet_number: 'PRD-14050609-T25-1',
    batch_number: 'BAT-T25-07',
    production_in: 75,
    dispatch_out: 20,
    defect_reject: 0,
    stock_balance: 55,
    shift_name: 'صبح',
    supervisor: 'آقای مهندس موسی عمویی',
    destination_or_source: 'خط ساخت مخازن کامپوزیت و فولادی',
    notes: 'پوشش رنگ الکترواستاتیک ضدزنگ مدل تپل',
    user_id: 'USR-001',
    created_by_username: 'amouei',
    device_id: 'SYS-AMOUEL-ADMIN-01',
    event_id: 'EVT-PRD-T25-01',
    created_at: '2026-08-31T08:45:00.000Z',
    updated_at: '2026-08-31T08:45:00.000Z'
  },
  {
    entry_id: 'PRD-TK25-002',
    cylinder_type: 'مخزن 25 کیلویی (تپل/دراز)',
    sub_variant: 'دراز',
    date: '1405/06/10',
    description: 'تولید مخازن ۲۵ کیلوگرمی مدل دراز',
    transfer_sheet_number: 'PRD-14050610-T25-2',
    batch_number: 'BAT-T25-08',
    production_in: 60,
    dispatch_out: 15,
    defect_reject: 1,
    stock_balance: 44,
    shift_name: 'صبح',
    supervisor: 'خانم کرمی',
    destination_or_source: 'خط ساخت مخازن ۲۵ دراز',
    notes: 'تست فشار هیدرواستاتیک مخزن ۲۵ دراز',
    user_id: 'USR-002',
    created_by_username: 'karami',
    device_id: 'SYS-KARAMI-OFFICE-02',
    event_id: 'EVT-PRD-T25-02',
    created_at: '2026-09-01T11:00:00.000Z',
    updated_at: '2026-09-01T11:00:00.000Z'
  },

  // 7. مخزن 30 کیلویی(ریکشا/ساده)
  {
    entry_id: 'PRD-TK30-001',
    cylinder_type: 'مخزن 30 کیلویی(ریکشا/ساده)',
    sub_variant: 'ریکشا',
    date: '1405/06/11',
    description: 'تولید مخازن ۳۰ کیلویی طرح ریکشا با پایه و براکت مخصوص',
    transfer_sheet_number: 'PRD-14050611-T30-1',
    batch_number: 'BAT-T30-02',
    production_in: 45,
    dispatch_out: 12,
    defect_reject: 0,
    stock_balance: 33,
    shift_name: 'صبح',
    supervisor: 'آقای مهندس موسی عمویی',
    destination_or_source: 'کارگاه جوشکاری اتوماتیک',
    notes: 'براکت ریکشا تایید و تست شد',
    user_id: 'USR-001',
    created_by_username: 'amouei',
    device_id: 'SYS-AMOUEL-ADMIN-01',
    event_id: 'EVT-PRD-T30-01',
    created_at: '2026-09-02T10:20:00.000Z',
    updated_at: '2026-09-02T10:20:00.000Z'
  },
  {
    entry_id: 'PRD-TK30-002',
    cylinder_type: 'مخزن 30 کیلویی(ریکشا/ساده)',
    sub_variant: 'ساده',
    date: '1405/06/12',
    description: 'تولید مخازن ۳۰ کیلویی طرح ساده استاندارد',
    transfer_sheet_number: 'PRD-14050612-T30-2',
    batch_number: 'BAT-T30-03',
    production_in: 55,
    dispatch_out: 18,
    defect_reject: 0,
    stock_balance: 37,
    shift_name: 'عصر',
    supervisor: 'مهندس حاجی وند',
    destination_or_source: 'سالن تولید مخازن ساده',
    notes: 'تست نهایی نشتی پاس شد',
    user_id: 'USR-003',
    created_by_username: 'hajivand',
    device_id: 'SYS-HAJIVAND-WH-03',
    event_id: 'EVT-PRD-T30-02',
    created_at: '2026-09-03T16:30:00.000Z',
    updated_at: '2026-09-03T16:30:00.000Z'
  },

  // 8. مخزن 35 کیلویی (ریکشا/ساده/تپل)
  {
    entry_id: 'PRD-TK35-001',
    cylinder_type: 'مخزن 35 کیلویی (ریکشا/ساده/تپل)',
    sub_variant: 'ریکشا',
    date: '1405/06/04',
    description: 'تولید مخازن ۳۵ کیلوگرمی مدل ریکشا با پایه‌های تقویت‌شده',
    transfer_sheet_number: 'PRD-14050604-T35-1',
    batch_number: 'BAT-T35-05',
    production_in: 55,
    dispatch_out: 15,
    defect_reject: 1,
    stock_balance: 39,
    shift_name: 'صبح',
    supervisor: 'آقای مهندس موسی عمویی',
    destination_or_source: 'خط مونتاژ مخازن سنگین',
    notes: 'مدل ریکشا ۳۵ کیلوگرمی با براکت ایمنی',
    user_id: 'USR-001',
    created_by_username: 'amouei',
    device_id: 'SYS-AMOUEL-ADMIN-01',
    event_id: 'EVT-PRD-T35-01',
    created_at: '2026-08-26T09:15:00.000Z',
    updated_at: '2026-08-26T09:15:00.000Z'
  },
  {
    entry_id: 'PRD-TK35-002',
    cylinder_type: 'مخزن 35 کیلویی (ریکشا/ساده/تپل)',
    sub_variant: 'ساده',
    date: '1405/06/05',
    description: 'تولید مخازن ۳۵ کیلوگرمی مدل ساده صنعتی',
    transfer_sheet_number: 'PRD-14050605-T35-2',
    batch_number: 'BAT-T35-06',
    production_in: 45,
    dispatch_out: 10,
    defect_reject: 0,
    stock_balance: 35,
    shift_name: 'صبح',
    supervisor: 'خانم کرمی',
    destination_or_source: 'سالن مخزن‌سازی',
    notes: 'مدل ۳۵ ساده با شیر تخلیه سریع',
    user_id: 'USR-002',
    created_by_username: 'karami',
    device_id: 'SYS-KARAMI-OFFICE-02',
    event_id: 'EVT-PRD-T35-02',
    created_at: '2026-08-27T11:30:00.000Z',
    updated_at: '2026-08-27T11:30:00.000Z'
  },
  {
    entry_id: 'PRD-TK35-003',
    cylinder_type: 'مخزن 35 کیلویی (ریکشا/ساده/تپل)',
    sub_variant: 'تپل',
    date: '1405/06/06',
    description: 'تولید مخازن ۳۵ کیلوگرمی مدل تپل حجیم',
    transfer_sheet_number: 'PRD-14050606-T35-3',
    batch_number: 'BAT-T35-07',
    production_in: 40,
    dispatch_out: 8,
    defect_reject: 0,
    stock_balance: 32,
    shift_name: 'عصر',
    supervisor: 'مهندس حاجی وند',
    destination_or_source: 'خط ۳۵ تپل ام‌گاز',
    notes: 'بدنه تقویت‌شده و تست اشعه ایکس',
    user_id: 'USR-003',
    created_by_username: 'hajivand',
    device_id: 'SYS-HAJIVAND-WH-03',
    event_id: 'EVT-PRD-T35-03',
    created_at: '2026-08-28T14:00:00.000Z',
    updated_at: '2026-08-28T14:00:00.000Z'
  },

  // مخزن 60 لیتری
  {
    entry_id: 'PRD-T60L-001',
    cylinder_type: 'مخزن 60 لیتری',
    sub_variant: 'استاندارد',
    date: '1405/06/02',
    description: 'تولید و آزمون هیدرواستاتیک مخزن ۶۰ لیتری گاز مایع ام‌گاز',
    transfer_sheet_number: 'PRD-14050602-T60',
    batch_number: 'BAT-T60-01',
    production_in: 75,
    dispatch_out: 25,
    defect_reject: 0,
    stock_balance: 50,
    shift_name: 'صبح',
    supervisor: 'آقای مهندس موسی عمویی',
    destination_or_source: 'خط ساخت مخازن تحت فشار ۶۰ لیتری',
    notes: 'تست التراسونیک جوش و آزمون هیدرولیک ۳۰ بار',
    user_id: 'USR-001',
    created_by_username: 'amouei',
    device_id: 'SYS-AMOUEL-ADMIN-01',
    event_id: 'EVT-PRD-T60-01',
    created_at: '2026-08-25T08:00:00.000Z',
    updated_at: '2026-08-25T08:00:00.000Z'
  },

  // مخزن 80 لیتری
  {
    entry_id: 'PRD-T80L-001',
    cylinder_type: 'مخزن 80 لیتری',
    sub_variant: 'استاندارد',
    date: '1405/06/04',
    description: 'تولید مخزن ۸۰ لیتری صنعتی و خودرویی با شیر چندراهه',
    transfer_sheet_number: 'PRD-14050604-T80',
    batch_number: 'BAT-T80-01',
    production_in: 60,
    dispatch_out: 20,
    defect_reject: 1,
    stock_balance: 39,
    shift_name: 'عصر',
    supervisor: 'خانم کرمی',
    destination_or_source: 'خط تولید مخازن ۸۰ لیتری',
    notes: 'پوشش رنگ پودری الکترواستاتیک کوره‌ای',
    user_id: 'USR-002',
    created_by_username: 'karami',
    device_id: 'SYS-KARAMI-OFFICE-02',
    event_id: 'EVT-PRD-T80-01',
    created_at: '2026-08-26T14:00:00.000Z',
    updated_at: '2026-08-26T14:00:00.000Z'
  },

  // مخزن 105 لیتری
  {
    entry_id: 'PRD-T105L-001',
    cylinder_type: 'مخزن 105 لیتری',
    sub_variant: 'استاندارد',
    date: '1405/06/06',
    description: 'ساخت و مونتاژ مخزن ۱۰۵ لیتری فشارقوی ظرفیت بالا',
    transfer_sheet_number: 'PRD-14050606-T105',
    batch_number: 'BAT-T105-01',
    production_in: 45,
    dispatch_out: 15,
    defect_reject: 0,
    stock_balance: 30,
    shift_name: 'صبح',
    supervisor: 'مهندس حاجی وند',
    destination_or_source: 'خط ساخت مخازن سنگین ۱۰۵ لیتری',
    notes: 'تست اشعه ایکس جوش‌های محیطی و طولی',
    user_id: 'USR-003',
    created_by_username: 'hajivand',
    device_id: 'SYS-HAJIVAND-WH-03',
    event_id: 'EVT-PRD-T105-01',
    created_at: '2026-08-27T09:30:00.000Z',
    updated_at: '2026-08-27T09:30:00.000Z'
  },

  // مخزن 125 لیتری
  {
    entry_id: 'PRD-T125L-001',
    cylinder_type: 'مخزن 125 لیتری',
    sub_variant: 'استاندارد',
    date: '1405/06/08',
    description: 'تولید مخزن ۱۲۵ لیتری صنعتی ماکزیمم ظرفیت استاندارد',
    transfer_sheet_number: 'PRD-14050608-T125',
    batch_number: 'BAT-T125-01',
    production_in: 40,
    dispatch_out: 10,
    defect_reject: 0,
    stock_balance: 30,
    shift_name: 'صبح',
    supervisor: 'آقای مهندس موسی عمویی',
    destination_or_source: 'خط تولید مخازن بزرگ صنعتی ۱۲۵ لیتری',
    notes: 'شیرآلات فشارقوی و سوپاپ استاندارد ملی نصب گردید',
    user_id: 'USR-001',
    created_by_username: 'amouei',
    device_id: 'SYS-AMOUEL-ADMIN-01',
    event_id: 'EVT-PRD-T125-01',
    created_at: '2026-08-28T10:00:00.000Z',
    updated_at: '2026-08-28T10:00:00.000Z'
  },

  // 9. پیکنیک 1/1.5 لیتری
  {
    entry_id: 'PRD-PIC1-001',
    cylinder_type: 'پیکنیک 1/1.5 لیتری',
    sub_variant: '1 لیتری',
    date: '1405/06/03',
    description: 'تولید پیکنیک مسافرتی ۱ لیتری با دسته استیل و نازل برنجی',
    transfer_sheet_number: 'PRD-14050603-P1',
    batch_number: 'BAT-P1-90',
    production_in: 300,
    dispatch_out: 120,
    defect_reject: 3,
    stock_balance: 177,
    shift_name: 'صبح',
    supervisor: 'مهندس حاجی وند',
    destination_or_source: 'خط اتوماتیک پرسکاری پیکنیک ۱ لیتری',
    notes: 'تست سوپاپ اطمینان ۱۶ بار و آب‌بندی اورینگ',
    user_id: 'USR-003',
    created_by_username: 'hajivand',
    device_id: 'SYS-HAJIVAND-WH-03',
    event_id: 'EVT-PRD-P1-01',
    created_at: '2026-08-25T08:30:00.000Z',
    updated_at: '2026-08-25T08:30:00.000Z'
  },
  {
    entry_id: 'PRD-PIC1-002',
    cylinder_type: 'پیکنیک 1/1.5 لیتری',
    sub_variant: '1.5 لیتری',
    date: '1405/06/04',
    description: 'تولید پیکنیک مسافرتی ۱.۵ لیتری استاندارد ام‌گاز',
    transfer_sheet_number: 'PRD-14050604-P15',
    batch_number: 'BAT-P15-91',
    production_in: 220,
    dispatch_out: 90,
    defect_reject: 2,
    stock_balance: 128,
    shift_name: 'عصر',
    supervisor: 'خانم صفایی',
    destination_or_source: 'خط تولید پیکنیک ۱.۵ لیتری',
    notes: 'کارتن‌های ۵ تایی با بسته‌بندی شیرینگ',
    user_id: 'USR-004',
    created_by_username: 'safaei',
    device_id: 'SYS-SAFAEI-OFFICE-04',
    event_id: 'EVT-PRD-P1-02',
    created_at: '2026-08-26T14:40:00.000Z',
    updated_at: '2026-08-26T14:40:00.000Z'
  },

  // 10. پیکنیک 3/5/8 کیلویی
  {
    entry_id: 'PRD-PIC358-001',
    cylinder_type: 'پیکنیک 3/5/8 کیلویی',
    sub_variant: '3 کیلویی',
    date: '1405/06/02',
    description: 'تولید کپسول پیکنیک ۳ کیلویی خانگی و کمپینگ ام‌گاز',
    transfer_sheet_number: 'PRD-14050602-P3',
    batch_number: 'BAT-P3-44',
    production_in: 180,
    dispatch_out: 70,
    defect_reject: 1,
    stock_balance: 109,
    shift_name: 'صبح',
    supervisor: 'آقای مهندس موسی عمویی',
    destination_or_source: 'خط پیکنیک‌های ۳ کیلویی',
    notes: 'رنگ‌آمیزی کوره‌ای قرمز ام‌گاز',
    user_id: 'USR-001',
    created_by_username: 'amouei',
    device_id: 'SYS-AMOUEL-ADMIN-01',
    event_id: 'EVT-PRD-P3-01',
    created_at: '2026-08-24T09:00:00.000Z',
    updated_at: '2026-08-24T09:00:00.000Z'
  },
  {
    entry_id: 'PRD-PIC358-002',
    cylinder_type: 'پیکنیک 3/5/8 کیلویی',
    sub_variant: '5 کیلویی',
    date: '1405/06/05',
    description: 'تولید کپسول پیکنیک ۵ کیلویی سایز متوسط',
    transfer_sheet_number: 'PRD-14050605-P5',
    batch_number: 'BAT-P5-12',
    production_in: 150,
    dispatch_out: 60,
    defect_reject: 0,
    stock_balance: 90,
    shift_name: 'عصر',
    supervisor: 'خانم کرمی',
    destination_or_source: 'خط پیکنیک‌های ۵ کیلویی',
    notes: 'تست تست هیدرواستاتیک و نصب والو استاندارد',
    user_id: 'USR-002',
    created_by_username: 'karami',
    device_id: 'SYS-KARAMI-OFFICE-02',
    event_id: 'EVT-PRD-P3-02',
    created_at: '2026-08-27T10:15:00.000Z',
    updated_at: '2026-08-27T10:15:00.000Z'
  },
  {
    entry_id: 'PRD-PIC358-003',
    cylinder_type: 'پیکنیک 3/5/8 کیلویی',
    sub_variant: '8 کیلویی',
    date: '1405/06/07',
    description: 'تولید کپسول پیکنیک ۸ کیلویی بزرگ ام‌گاز',
    transfer_sheet_number: 'PRD-14050607-P8',
    batch_number: 'BAT-P8-09',
    production_in: 120,
    dispatch_out: 40,
    defect_reject: 1,
    stock_balance: 79,
    shift_name: 'صبح',
    supervisor: 'مهندس حاجی وند',
    destination_or_source: 'خط پیکنیک‌های ۸ کیلویی سنگین',
    notes: 'پایه‌های مستحکم و تاییدیه کنترل کیفی نهایی',
    user_id: 'USR-003',
    created_by_username: 'hajivand',
    device_id: 'SYS-HAJIVAND-WH-03',
    event_id: 'EVT-PRD-P3-03',
    created_at: '2026-08-29T11:20:00.000Z',
    updated_at: '2026-08-29T11:20:00.000Z'
  }
];

/**
 * Export production kardex entries to Excel (.xlsx) with RTL layout
 */
export function exportProductionKardexToXLSX(
  cylinderType: string,
  entries: GasProductionKardexEntry[]
) {
  const sorted = [...entries].sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  const calculated = recalculateProductionKardexBalances(sorted);

  const dataRows = calculated.map((item, index) => ({
    'ردیف': index + 1,
    'تاریخ': item.date,
    'شرح': item.description,
    'نوع شیر': item.valve_type_2
      ? `${item.valve_type || 'شیر اول'} | ${item.valve_type_2}`
      : (item.valve_type || 'شیر نو استاندارد ام‌گاز'),
    'نوع مهره': item.nut_type_2
      ? `${item.nut_type || 'مهره اول'} | ${item.nut_type_2}`
      : (item.nut_type || 'مهره برنجی چپ‌گرد استاندارد'),
    'سفارش دهنده': item.customer_name || item.destination_or_source || '-',
    'نوع محصول': item.cylinder_type,
    'مدل / زیردسته': item.sub_variant || 'استاندارد',
    'شماره برگه / حواله': item.transfer_sheet_number,
    'شماره بچ / سریال': item.batch_number || '-',
    'تیراژ سفارش': item.production_in || 0,
    'تحویل نهایی': item.dispatch_out || 0,
    'ضایعات / رد QC': item.defect_reject || 0,
    'مانده موجودی انبار': item.stock_balance || 0,
    'وضعیت سفارش': item.order_status === 'COMPLETED' ? 'تکمیل‌شده' : (item.order_status === 'IN_PROGRESS' ? 'در حال انجام' : 'عادی'),
    'شیفت کاری': item.shift_name || 'صبح',
    'سرپرست خط': item.supervisor || '-',
    'کاربر ثبت‌کننده': item.created_by_username || item.user_id,
    'توضیحات': item.notes || ''
  }));

  const worksheet = XLSX.utils.json_to_sheet(dataRows);
  // Ensure right-to-left orientation in Excel
  if (!worksheet['!views']) worksheet['!views'] = [];
  worksheet['!views'].push({ rightToLeft: true });

  const workbook = XLSX.utils.book_new();
  const safeSheetName = (cylinderType || 'کاردکس تولید').slice(0, 31).replace(/[\\/?*[\]]/g, '_');
  XLSX.utils.book_append_sheet(workbook, worksheet, safeSheetName);

  const cleanFileName = `کاردکس_تولید_ام_گاز_${cylinderType.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(workbook, cleanFileName);
}
