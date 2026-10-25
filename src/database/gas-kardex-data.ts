import { Customer, GasKardexEntry } from '../types';
import * as XLSX from 'xlsx';
import { generateUUID, getPersianDate } from '../utils/persian';
import { generateSheetNumber } from '../utils/sheetNumber';

export const RAW_GAS_NAMES: string[] = [
  'ک 50 باکستان',
  'ارسا',
  'ارمنستان آقای رایی',
  'ازاد ممتاز',
  'اسفند یاری مخزن ترکیه',
  'افشان',
  'افغانستان بهادری',
  'افغانستان',
  'افغانستان شجاع',
  'افغانستان هاشم مخزن',
  'البرز گاز',
  'الیاس گاز',
  'امیر برهان اتحاد',
  'امیر علی عمویی',
  'آتش نشانی',
  'آذر کوج',
  'بحر گاز',
  'بوتان نهاوند',
  'بوتان',
  'بوکان گاز',
  'پارس گاز',
  'پارسا گاز میامی',
  'پاسار',
  'پترو گاز',
  'بگاه گاز',
  'پیروز',
  'تعاون گاز',
  'تهرانی (2)',
  'جنوب گاز',
  'فرگاز',
  'فدا',
  'فتحلیان',
  'غفران',
  'عفیف گاز',
  'صحرا',
  'سید',
  'سنندجی نماینده نیک گاز',
  'سامان گاز',
  'ساحل گاز',
  'رویال گاز',
  'رسان گاز',
  'خانم منصوری',
  'خانم منصوری عراق',
  'قطعات فولادی',
  'کامل پیوند',
  'گرام مهر',
  'مزین',
  'مقدم سال 1405',
  'مکران گاز',
  'ملاح عبدالله',
  'ممتاز',
  'مهاباد',
  'مهرگاز',
  'نیرو گاز پسر صالحی',
  'نیک آذربایجان',
  'نیک سنندج',
  'وفاداری'
];

export const SEED_GAS_CUSTOMERS: Customer[] = RAW_GAS_NAMES.map((name, index) => {
  const id = `CUST-GAS-${String(index + 1).padStart(3, '0')}`;
  let province = 'تهران';
  let city = 'تهران';
  let customerType: 'سازمانی' | 'عمده' | 'خرده' | 'پیمانکاری' = 'عمده';

  if (
    name.includes('افغانستان') ||
    name.includes('ارمنستان') ||
    name.includes('عراق') ||
    name.includes('ترکیه') ||
    name.includes('باکستان')
  ) {
    province = 'صادراتی / مرزی';
    city = name.split(' ')[0] || 'مرز';
    customerType = 'سازمانی';
  } else if (name.includes('سنندج')) {
    province = 'کردستان';
    city = 'سنندج';
  } else if (name.includes('آذربایجان')) {
    province = 'آذربایجان شرقی';
    city = 'تبریز';
  } else if (name.includes('نهاوند')) {
    province = 'همدان';
    city = 'نهاوند';
  } else if (name.includes('بوکان')) {
    province = 'آذربایجان غربی';
    city = 'بوکان';
  } else if (name.includes('مهاباد')) {
    province = 'آذربایجان غربی';
    city = 'مهاباد';
  } else if (name.includes('مکران') || name.includes('جنوب')) {
    province = 'سیستان و بلوچستان';
    city = 'چابهار';
  } else if (name.includes('میامی')) {
    province = 'سمنان';
    city = 'میامی';
  } else if (name.includes('البرز')) {
    province = 'البرز';
    city = 'کرج';
  }

  return {
    customer_id: id,
    name: name,
    company_name: name.includes('گاز') ? `شرکت توزیع ${name}` : `مجموعه بازرگانی ${name}`,
    phone: `0912${String(1000000 + index * 12345).slice(0, 7)}`,
    national_id: `00${String(70000000 + index * 11111).slice(0, 8)}`,
    economic_code: `411${String(50000000 + index * 22222).slice(0, 8)}`,
    province,
    city,
    address: `${province}، ایستگاه شارژ و پایانه پخش سیلندر گاز ${name}`,
    credit_limit: 800000000,
    current_balance: index % 4 === 0 ? 45000000 : index % 4 === 1 ? -22000000 : 0,
    customer_type: customerType,
    notes: 'طرف حساب کاردکس گاز مایع و شیرآلات کپسول',
    created_at: '2026-09-01T08:00:00.000Z',
    updated_at: '2026-09-01T08:00:00.000Z'
  };
});

// Exact Kardex formulas specified by the user:
// 1. ("مانده سیلندر" در هر سطر از کاردکس) = (مانده سطر قبل) + ("ورودی سیلندر" همان سطر) – ("خروج سیلندر" واقعی همان سطر) – ("خروج ضایعات سوری" همان سطر)
//    به عبارتی اگر تمام آیتم ها صفر بود ورودی سیلندر دقیقا برابر میشود با مانده سیلندر.
// 2. ("مانده ضایعات" در هر سطر) = ("مانده ضایعات" از سطر قبل) + ("خروج ضایعات سوری" در همان سطر) – ("خروج واقعی" در همان سطر) - ("خروج ضایعات ذخیره / نهایی")
//    به عبارتی اگر تمام سلول ها صفر بود ولی خروج ضایعات سوری مثلا 10 بود باید مانده ضایعات عدد 10 بشود.
// 3. فرمول شیر نو:
//    - ورودی شیر نو: میتواند هر عددی را بپذیرد.
//    - خروج شیر نو: همیشه برابر با خروج سیلندر است و از مانده سطر قبل کم می‌شود.
//    - مانده شیر نو = (مانده سطر قبل) + (ورودی شیر نو) - (خروج شیر نو). مقدار منفی می‌پذیرد (کسر از موجودی خود ام‌گاز).
// 4. فرمول شیر کهنه:
//    - ورودی شیر کهنه: بلافاصله برابر است با ورودی سیلندر اما قابل تغییر نیز است.
//    - خروج شیر کهنه: مانند شیر نو عمل می‌کند (همگام با خروج سیلندر یا مقدار ثبت‌شده).
//    - مانده شیر کهنه = (مانده سطر قبل) + (ورودی شیر کهنه) - (خروج شیر کهنه). مقدار منفی می‌پذیرد (کسر از موجودی خود ام‌گاز).
// 5. هیچ سطری نباید خالی بماند حتی اگر با صفر پر شود.
export function recalculateKardexBalances(entries: GasKardexEntry[]): GasKardexEntry[] {
  let prevCylBal = 0;
  let prevScrapBal = 0;
  let prevNewValveBal = 0;
  let prevUsedValveBal = 0;

  return entries.map((item) => {
    const cylIn = Number(item.cylinder_in) || 0;
    const cylOut = Number(item.cylinder_out) || 0;
    const scrapOut = Number(item.scrap_out) || 0;
    const scrapStockIn = Number(item.scrap_stock_in) || 0;
    const finalScrapOut = Number(item.final_scrap_out) || 0;

    // Formula 1: Cylinder Balance
    const cylBal = prevCylBal + cylIn - cylOut - scrapStockIn;

    // Formula 2: Scrap Balance
    const scrapBal = prevScrapBal + scrapStockIn - scrapOut - finalScrapOut;

    // Formula 3: New Valve (شیر نو)
    const newValveIn = Number(item.new_valve_in) || 0;
    // خروج شیر نو همیشه برابر است با مقدار خروج سیلندر
    const newValveOut = cylOut > 0 ? cylOut : (Number(item.new_valve_out) || 0);
    // مانده شیر نو = مانده قبل + ورود شیر نو - خروج شیر نو (مقدار منفی می‌پذیرد)
    const newValveBal = prevNewValveBal + newValveIn - newValveOut;

    // Formula 4: Used Valve (شیر کهنه)
    // مقدار ورودی شیر کهنه به صورت دستی ثبت می‌شود و مستقیماً با ورودی سیلندر پر نمی‌شود
    const usedValveIn = item.used_valve_in !== undefined && item.used_valve_in !== null
      ? Number(item.used_valve_in)
      : 0;
    // خروج شیر کهنه سلول مستقل است و وابسته به خروج سیلندر نیست
    const usedValveOut = Number(item.used_valve_out) > 0 ? Number(item.used_valve_out) : 0;
    // مانده شیر کهنه = مانده قبل + ورود شیر کهنه - خروج شیر کهنه (نمی‌تواند منفی شود و نهایتاً می‌تواند صفر شود)
    const usedValveBal = Math.max(0, prevUsedValveBal + usedValveIn - usedValveOut);

    prevCylBal = cylBal;
    prevScrapBal = scrapBal;
    prevNewValveBal = newValveBal;
    prevUsedValveBal = usedValveBal;

    return {
      ...item,
      cylinder_in: cylIn,
      cylinder_out: cylOut,
      scrap_out: scrapOut,
      scrap_stock_in: scrapStockIn,
      cylinder_balance: cylBal,
      final_scrap_out: finalScrapOut,
      scrap_balance: scrapBal,
      new_valve_in: newValveIn,
      new_valve_out: newValveOut,
      new_valve_balance: newValveBal,
      dispatched: item.dispatched !== undefined && item.dispatched !== null && String(item.dispatched).trim() !== '' && String(item.dispatched).trim() !== '0' && String(item.dispatched).trim() !== '۰'
        ? String(item.dispatched)
        : '',
      used_valve_in: usedValveIn,
      used_valve_out: usedValveOut,
      used_valve_balance: usedValveBal,
      defective: Number(item.defective) || 0
    };
  });
}

// Initial Kardex entries: Completely wiped and empty (0 records)
export const SEED_GAS_KARDEX_ENTRIES: GasKardexEntry[] = [];

// Exact columns matching user specification:
// ورودی سیلندر= ورودی سیلندر
// خروجی سیلندر=خروجی سیلندر
// خروجی ضایعات=خروج ضایعات واقعی
// ذخیره انبار ضایعات= خروج ضایعات سوری
// مانده سیلندر= مانده سیلندر
// خروج ضایعات نهایی= خروج ضایعات ذخیره
// مانده ذخیره ضایعات=مانده ضایعات
export const KARDEX_EXCEL_COLUMNS = [
  'تاریخ',
  'شرح',
  'شماره برگه انتقال',
  'ورودی سیلندر',
  'خروجی سیلندر',
  'خروج ضایعات واقعی',
  'خروج ضایعات سوری',
  'مانده سیلندر',
  'خروج ضایعات ذخیره',
  'مانده ضایعات',
  'ورود شیرنو',
  'خروج شیرنو',
  'مانده شیرنو',
  'ارسالی',
  'ورود شیرکهنه',
  'خروج شیرکهنه',
  'مانده شیرکهنه',
  'معیوب'
];

export function exportKardexToXLSX(customerName: string, entries: GasKardexEntry[], cylinderType?: string) {
  const sorted = recalculateKardexBalances(
    [...entries].sort((a, b) => a.date.localeCompare(b.date))
  );

  const rows: (string | number)[][] = [
    KARDEX_EXCEL_COLUMNS,
    ...sorted.map(item => [
      item.date || '',
      item.description || '',
      item.transfer_sheet_number || '',
      item.cylinder_in || 0,
      item.cylinder_out || 0,
      item.scrap_out || 0,
      item.scrap_stock_in || 0,
      item.cylinder_balance || 0,
      item.final_scrap_out || 0,
      item.scrap_balance || 0,
      item.new_valve_in || 0,
      item.new_valve_out || 0,
      item.new_valve_balance || 0,
      item.dispatched !== undefined ? String(item.dispatched) : '',
      item.used_valve_in || 0,
      item.used_valve_out || 0,
      item.used_valve_balance || 0,
      item.defective || 0
    ])
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(rows);

  // Set column widths
  ws['!cols'] = [
    { wch: 14 }, // تاریخ
    { wch: 32 }, // شرح
    { wch: 18 }, // شماره برگه انتقال
    { wch: 14 }, // ورودی سیلندر
    { wch: 14 }, // خروجی سیلندر
    { wch: 16 }, // خروج ضایعات واقعی
    { wch: 16 }, // خروج ضایعات سوری
    { wch: 14 }, // مانده سیلندر
    { wch: 16 }, // خروج ضایعات ذخیره
    { wch: 16 }, // مانده ضایعات
    { wch: 12 }, // ورود شیرنو
    { wch: 12 }, // خروج شیرنو
    { wch: 14 }, // مانده شیرنو
    { wch: 12 }, // ارسالی
    { wch: 13 }, // ورود شیرکهنه
    { wch: 13 }, // خروج شیرکهنه
    { wch: 14 }, // مانده شیرکهنه
    { wch: 12 }  // معیوب
  ];

  // Enforce Right-to-Left (RTL) for Persian/Arabic Excel rendering
  ws['!views'] = [{ rightToLeft: true }];
  (wb as any).Workbook = {
    Views: [{ RTL: true }]
  };

  const sheetTitle = (cylinderType ? `کاردکس ${cylinderType}` : 'کاردکس گاز').slice(0, 31);
  XLSX.utils.book_append_sheet(wb, ws, sheetTitle);

  const safeCustomerName = (customerName || 'عمومی').replace(/[\/\\?%*:|"<>]/g, '_');
  const safeCylinder = (cylinderType || 'سیلندر_11_کیلویی').replace(/[\s\/\\?%*:|"<>]/g, '_');
  const fileName = `کاردکس_${safeCustomerName}_${safeCylinder}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

// Parse uploaded Excel file formatted like kardex_gas_blank.xlsx (supports both 16 and 17 columns)
export async function parseKardexFromXLSX(
  file: File,
  customerId: string,
  customerName: string,
  userId: string,
  deviceId: string,
  cylinderType?: string
): Promise<GasKardexEntry[]> {
  const data = await file.arrayBuffer();
  const wb = XLSX.read(data, { type: 'array' });
  const firstSheetName = wb.SheetNames[0];
  const ws = wb.Sheets[firstSheetName];

  const rawRows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });
  if (rawRows.length < 2) {
    throw new Error('فایل اکسل حاوی سطر داده نیست.');
  }

  // Check headers for dynamic column detection (16, 17, or 18 columns)
  const headerRow = (rawRows[0] || []).map(c => String(c || '').trim());
  const hasStorageScrapCol = headerRow.some(h => h.includes('ذخیره') && h.includes('ضایعات')) || headerRow.length >= 17;
  const hasTotalCylCol = headerRow.some(h => h.includes('مانده کل')) || headerRow.length >= 18;

  const dataRows = rawRows.slice(1);
  const parsedEntries: GasKardexEntry[] = [];
  const dailyCountTracker: Record<string, number> = {};

  for (const row of dataRows) {
    if (!row || row.length === 0 || (!row[0] && !row[1])) {
      continue;
    }

    const dateVal = String(row[0] || '').trim();
    const descVal = String(row[1] || '').trim();
    let sheetNo = String(row[2] || '').trim();

    if (!dateVal && !descVal) continue;

    const cylIn = Number(row[3]) || 0;
    const cylOut = Number(row[4]) || 0;
    const scrapOut = Number(row[5]) || 0;
    const scrapStockIn = hasStorageScrapCol ? (Number(row[6]) || 0) : 0;
    const cylBal = Number(row[7]) || 0;
    const finalScrapOut = Number(row[8]) || 0;
    const scrapBal = Number(row[9]) || Number(row[7 + (hasStorageScrapCol ? 1 : 0)]) || 0;
    const valveOffset = hasStorageScrapCol ? 2 : 0;

    const newValveIn = Number(row[10 + valveOffset]) || Number(row[8]) || 0;
    const newValveOut = Number(row[11 + valveOffset]) || Number(row[9]) || 0;
    const newValveBal = Number(row[12 + valveOffset]) || 0;
    const dispatched = row[13 + valveOffset] !== undefined && row[13 + valveOffset] !== null ? String(row[13 + valveOffset]).trim() : '';
    const usedValveIn = Number(row[14 + valveOffset]) || 0;
    const usedValveOut = Number(row[15 + valveOffset]) || 0;
    const defective = Number(row[17 + valveOffset]) || 0;

    if (!sheetNo) {
      const isIncoming = (cylIn > 0 || scrapStockIn > 0 || newValveIn > 0 || usedValveIn > 0);
      const effectiveDate = dateVal || getPersianDate();
      const seq = (dailyCountTracker[effectiveDate] || 0) + 1;
      dailyCountTracker[effectiveDate] = seq;
      sheetNo = generateSheetNumber(customerName, effectiveDate, isIncoming ? 'i' : 'e', seq);
    }

    parsedEntries.push({
      entry_id: generateUUID('GK'),
      customer_id: customerId,
      customer_name: customerName,
      cylinder_type: cylinderType || 'سیلندر 11 کیلویی',
      date: dateVal || getPersianDate(),
      description: descVal || 'ورود از فایل اکسل',
      transfer_sheet_number: sheetNo,
      cylinder_in: cylIn,
      cylinder_out: cylOut,
      scrap_out: scrapOut,
      scrap_stock_in: scrapStockIn,
      cylinder_balance: cylBal,
      final_scrap_out: finalScrapOut,
      scrap_balance: scrapBal,
      new_valve_in: newValveIn,
      new_valve_out: newValveOut,
      new_valve_balance: newValveBal,
      dispatched: dispatched,
      used_valve_in: usedValveIn,
      used_valve_out: usedValveOut,
      used_valve_balance: 0,
      defective: defective,
      user_id: userId,
      device_id: deviceId,
      event_id: generateUUID('EVT-XLS'),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }

  return recalculateKardexBalances(parsedEntries);
}
