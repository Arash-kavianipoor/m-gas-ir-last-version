import { GasKardexEntry, Customer, User } from '../types';
import { formatNumberEn, toEnglishDigits, getPersianDate } from './persian';

interface PrintKardexParams {
  customer: Customer | null;
  entries: GasKardexEntry[];
  currentUser: User;
  stats: {
    totalCylinderIn: number;
    totalCylinderOut: number;
    currentCylinders: number;
    totalNewValveIn: number;
    totalNewValveOut: number;
    currentNewValves: number;
    totalDispatched: number;
    totalUsedValveIn: number;
    totalUsedValveOut: number;
    currentScrap: number;
    currentUsedValves: number;
    netTempScrap?: number;
    totalScrapStockIn?: number;
    totalScrapOut?: number;
    totalFinalScrapOut?: number;
    totalDefective: number;
  };
  cylinderType?: string;
}

export function printGasKardexDocument({
  customer,
  entries,
  currentUser,
  stats,
  cylinderType
}: PrintKardexParams) {
  const currentDateFa = getPersianDate(new Date());

  const customerName = customer?.name || 'طرف حساب نامشخص';
  const customerId = customer?.customer_id || '-';
  const companyName = customer?.company_name || '-';
  const provinceCity = `${customer?.province || ''} - ${customer?.city || ''}`;

  const numCellStyle = "border: 1px solid #475569; padding: 1px; direction: ltr; unicode-bidi: isolate; font-family: 'Segoe UI', Arial, Roboto, sans-serif; font-weight: 700; font-size: 7.5px; box-sizing: border-box; text-align: center; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;";

  const rowsHtml = entries.map((row, idx) => `
    <tr class="text-center" style="font-size: 7.5px; height: 22px; box-sizing: border-box;">
      <td style="${numCellStyle} font-weight: 800;">${toEnglishDigits(idx + 1)}</td>
      <td style="${numCellStyle} font-size: 7.5px;">${toEnglishDigits(row.date) || ''}</td>
      <td style="border: 1px solid #475569; padding: 1px 2px; text-align: right; font-family: 'Vazirmatn', Arial, Tahoma, sans-serif; font-size: 7.5px; line-height: 1.15; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; box-sizing: border-box;">${row.description || ''}</td>
      <td style="${numCellStyle} font-weight: 800; font-size: 7.5px;">${toEnglishDigits(row.transfer_sheet_number) || '-'}</td>
      <td style="${numCellStyle}">${row.cylinder_in > 0 ? toEnglishDigits(formatNumberEn(row.cylinder_in)) : '-'}</td>
      <td style="${numCellStyle}">${row.cylinder_out > 0 ? toEnglishDigits(formatNumberEn(row.cylinder_out)) : '-'}</td>
      <td style="${numCellStyle}">${row.scrap_out > 0 ? toEnglishDigits(formatNumberEn(row.scrap_out)) : '-'}</td>
      <td style="${numCellStyle} font-weight: 800; background: #fff7ed; color: #c2410c;">${(row.scrap_stock_in || 0) > 0 ? toEnglishDigits(formatNumberEn(row.scrap_stock_in)) : '-'}</td>
      <td style="${numCellStyle} font-weight: 900; background: #ecfdf5; color: #065f46;">${toEnglishDigits(formatNumberEn(row.cylinder_balance || 0))}</td>
      <td style="${numCellStyle} font-weight: 800; background: #ffe4e6; color: #be123c;">${(row.final_scrap_out || 0) > 0 ? toEnglishDigits(formatNumberEn(row.final_scrap_out)) : '-'}</td>
      <td style="${numCellStyle} font-weight: 900; background: #fffbeb; color: #92400e;">${toEnglishDigits(formatNumberEn(row.scrap_balance || 0))}</td>
      <td style="${numCellStyle}">${row.new_valve_in > 0 ? toEnglishDigits(formatNumberEn(row.new_valve_in)) : '-'}</td>
      <td style="${numCellStyle}">${row.new_valve_out > 0 ? toEnglishDigits(formatNumberEn(row.new_valve_out)) : '-'}</td>
      <td style="${numCellStyle} font-weight: 900; background: #ecfdf5; color: #065f46;">${toEnglishDigits(formatNumberEn(row.new_valve_balance || 0))}</td>
      <td style="border: 1px solid #475569; padding: 1px; text-align: center; font-family: 'Segoe UI', Arial, sans-serif; font-weight: 800; font-size: 7.5px; box-sizing: border-box; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${row.dispatched && String(row.dispatched) !== '0' && String(row.dispatched) !== '۰' ? String(row.dispatched) : '-'}</td>
      <td style="${numCellStyle}">${row.used_valve_in > 0 ? toEnglishDigits(formatNumberEn(row.used_valve_in)) : '-'}</td>
      <td style="${numCellStyle}">${row.used_valve_out > 0 ? toEnglishDigits(formatNumberEn(row.used_valve_out)) : '-'}</td>
      <td style="${numCellStyle} font-weight: 900; background: #fffbeb; color: #92400e;">${toEnglishDigits(formatNumberEn(row.used_valve_balance || 0))}</td>
      <td style="${numCellStyle}">${row.defective > 0 ? toEnglishDigits(formatNumberEn(row.defective)) : '-'}</td>
    </tr>
  `).join('');

  // 1. Remove previous isolated print mount or style if existing
  const existingMount = document.getElementById('am-gas-isolated-print-mount');
  if (existingMount) existingMount.remove();

  const existingStyle = document.getElementById('am-gas-dynamic-print-rules');
  if (existingStyle) existingStyle.remove();

  // 2. Create isolated mount with guaranteed Landscape dimensions that fit 100% of printable area
  const mount = document.createElement('div');
  mount.id = 'am-gas-isolated-print-mount';
  mount.className = 'amgas-isolated-mount amgas-kardex-landscape';
  mount.setAttribute('dir', 'rtl');

  mount.innerHTML = `
    <div class="kardex-print-sheet" style="width: 100%; max-width: 100%; margin: 0; padding: 0 2px; font-family: 'Vazirmatn', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, Tahoma, sans-serif; direction: rtl; color: #020617; background: #ffffff; box-sizing: border-box;">
      
      <!-- Header Area with Official Logo -->
      <div style="border-bottom: 2px solid #020617; padding-bottom: 4px; margin-bottom: 4px;">
        <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px;">
          
          <!-- Official Logo Right (in RTL) -->
          <div style="display: flex; align-items: center; gap: 6px;">
            <div style="height: 32px; padding: 2px 6px; border-radius: 6px; background-color: #020617; border: 1px solid #1e293b; display: flex; align-items: center; justify-content: center; box-shadow: 0 1px 2px rgba(0,0,0,0.2);">
              <img src="/new-logo-mgas-2(1)_fixed.svg" alt="ام گاز - MGAS" style="height: 22px; width: auto; object-fit: contain;" />
            </div>
          </div>

          <!-- Main Title Center -->
          <div style="text-align: center; flex: 1;">
            <div style="font-size: 13px; font-weight: 900; color: #020617; letter-spacing: -0.02em;">سامانه جامع انبار و توزیع گاز مایع ام گاز</div>
            <div style="font-size: 10.5px; font-weight: bold; color: #334155; margin-top: 1px;">
              کارتکس تخصصی گردش سیلندر، کپسول و شیرآلات گاز (<span style="color: #b45309; font-weight: 900;">${cylinderType || 'سیلندر 11 کیلویی'}</span>)
            </div>
          </div>

          <!-- Meta Left (in RTL) with safe left padding -->
          <div style="text-align: left; font-size: 8px; color: #475569; line-height: 1.3; padding-left: 10px; box-sizing: border-box; min-width: 130px;">
            <div>تاریخ چاپ: <strong style="color: #0f172a;">${toEnglishDigits(currentDateFa)}</strong></div>
            <div style="font-size: 7.5px;">نسخه کاردکس استاندارد A4</div>
          </div>
        </div>
        
        <!-- Customer Info Strip -->
        <div style="margin-top: 4px; padding: 3px 6px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 4px; display: grid; grid-template-columns: 2fr 1.8fr 1.8fr 1.4fr; gap: 4px; font-size: 9px; box-sizing: border-box;">
          <div><strong style="color: #475569;">طرف حساب:</strong> <strong style="color: #0f172a; font-size: 9.5px;">${customerName}</strong></div>
          <div><strong style="color: #475569;">عنوان / شرکت:</strong> <span style="color: #0f172a;">${companyName}</span></div>
          <div><strong style="color: #475569;">استان / شهر:</strong> <span style="color: #0f172a;">${provinceCity}</span></div>
          <div style="text-align: left; padding-left: 8px;"><strong style="color: #475569;">کد طرف حساب:</strong> <strong style="color: #0f172a; font-family: 'Segoe UI', Arial, sans-serif;">${toEnglishDigits(customerId)}</strong></div>
        </div>

        <!-- Inventory Stats Balance Strip -->
        <div style="margin-top: 3px; padding: 3px 4px; background: #f1f5f9; border: 1px solid #94a3b8; border-radius: 4px; display: grid; grid-template-columns: repeat(6, 1fr); gap: 3px; font-size: 8.5px; font-weight: bold; text-align: center; box-sizing: border-box;">
          <div style="background: #ffffff; padding: 2px 3px; border-radius: 3px; border: 1px solid #cbd5e1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">موجودی کپسول: <span style="color: #059669; font-family: 'Segoe UI', Arial, sans-serif; font-size: 9.5px;">${toEnglishDigits(formatNumberEn(stats.currentCylinders))}</span></div>
          <div style="background: #ffffff; padding: 2px 3px; border-radius: 3px; border: 1px solid #cbd5e1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">ذخیره موقت: <span style="color: #c2410c; font-family: 'Segoe UI', Arial, sans-serif; font-size: 9.5px;">${toEnglishDigits(formatNumberEn(stats.netTempScrap ?? Math.max(0, (stats.totalScrapStockIn || 0) - (stats.totalScrapOut || 0))))}</span></div>
          <div style="background: #ffffff; padding: 2px 3px; border-radius: 3px; border: 1px solid #cbd5e1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">مانده ضایعات: <span style="color: #dc2626; font-family: 'Segoe UI', Arial, sans-serif; font-size: 9.5px;">${toEnglishDigits(formatNumberEn(stats.currentScrap))}</span></div>
          <div style="background: #ffffff; padding: 2px 3px; border-radius: 3px; border: 1px solid #cbd5e1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">خروج نهایی: <span style="color: #be123c; font-family: 'Segoe UI', Arial, sans-serif; font-size: 9.5px;">${toEnglishDigits(formatNumberEn(stats.totalFinalScrapOut || 0))}</span></div>
          <div style="background: #ffffff; padding: 2px 3px; border-radius: 3px; border: 1px solid #cbd5e1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">موجودی شیر نو: <span style="color: #059669; font-family: 'Segoe UI', Arial, sans-serif; font-size: 9.5px;">${toEnglishDigits(formatNumberEn(stats.currentNewValves))}</span></div>
          <div style="background: #ffffff; padding: 2px 3px; border-radius: 3px; border: 1px solid #cbd5e1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">موجودی شیر داغی: <span style="color: #d97706; font-family: 'Segoe UI', Arial, sans-serif; font-size: 9.5px;">${toEnglishDigits(formatNumberEn(stats.currentUsedValves))}</span></div>
        </div>
      </div>

      <!-- Kardex Table - Exact 19 Columns Locked at 100% Total Width -->
      <table class="kardex-print-table" style="width: 100%; max-width: 100%; border-collapse: collapse; text-align: center; font-size: 7.5px; table-layout: fixed; direction: rtl; box-sizing: border-box;">
        <colgroup>
          <col style="width: 3.0%;" />
          <col style="width: 6.8%;" />
          <col style="width: 14.2%;" />
          <col style="width: 6.2%;" />
          <col style="width: 5.0%;" />
          <col style="width: 5.0%;" />
          <col style="width: 5.2%;" />
          <col style="width: 5.2%;" />
          <col style="width: 5.8%;" />
          <col style="width: 5.2%;" />
          <col style="width: 5.4%;" />
          <col style="width: 4.6%;" />
          <col style="width: 4.6%;" />
          <col style="width: 5.0%;" />
          <col style="width: 4.2%;" />
          <col style="width: 4.6%;" />
          <col style="width: 4.6%;" />
          <col style="width: 5.2%;" />
          <col style="width: 4.8%;" />
        </colgroup>
        <thead>
          <tr style="background: #e2e8f0; font-weight: 800; font-size: 7px; height: 26px; color: #0f172a; line-height: 1.1; box-sizing: border-box;">
            <th style="border: 1px solid #475569; padding: 1px;">ردیف</th>
            <th style="border: 1px solid #475569; padding: 1px;">تاریخ</th>
            <th style="border: 1px solid #475569; padding: 1px 2px; text-align: right;">شرح عملیات</th>
            <th style="border: 1px solid #475569; padding: 1px;">شماره<br/>برگه</th>
            <th style="border: 1px solid #475569; padding: 1px;">ورودی<br/>سیلندر</th>
            <th style="border: 1px solid #475569; padding: 1px;">خروجی<br/>سیلندر</th>
            <th style="border: 1px solid #475569; padding: 1px;">ضایعات<br/>واقعی</th>
            <th style="border: 1px solid #475569; padding: 1px; background: #ffedd5; color: #c2410c;">ضایعات<br/>سوری</th>
            <th style="border: 1px solid #475569; padding: 1px; background: #d1fae5; color: #065f46;">مانده<br/>سیلندر</th>
            <th style="border: 1px solid #475569; padding: 1px; background: #ffe4e6; color: #be123c;">ضایعات<br/>نهایی</th>
            <th style="border: 1px solid #475569; padding: 1px; background: #fef3c7; color: #92400e;">مانده<br/>ضایعات</th>
            <th style="border: 1px solid #475569; padding: 1px;">شیر نو<br/>(+)</th>
            <th style="border: 1px solid #475569; padding: 1px;">شیر نو<br/>(-)</th>
            <th style="border: 1px solid #475569; padding: 1px; background: #d1fae5; color: #065f46;">مانده<br/>نو</th>
            <th style="border: 1px solid #475569; padding: 1px;">ارسالی</th>
            <th style="border: 1px solid #475569; padding: 1px;">داغی<br/>(+)</th>
            <th style="border: 1px solid #475569; padding: 1px;">داغی<br/>(-)</th>
            <th style="border: 1px solid #475569; padding: 1px; background: #fef3c7; color: #92400e;">مانده<br/>داغی</th>
            <th style="border: 1px solid #475569; padding: 1px;">معیوب</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml || '<tr><td colspan="19" style="padding: 10px; border: 1px solid #cbd5e1; text-align: center; color: #64748b; font-size: 10px;">گردشی برای این طرف حساب ثبت نشده است.</td></tr>'}
        </tbody>
        <tfoot>
          <tr style="background: #e2e8f0; font-weight: 800; font-size: 7.5px; text-align: center; height: 24px; box-sizing: border-box;">
            <td colspan="4" style="border: 1px solid #475569; padding: 1px 3px; text-align: right; font-weight: 900; color: #0f172a;">تراز نهایی:</td>
            <td style="${numCellStyle} font-weight: 800;">${toEnglishDigits(formatNumberEn(stats.totalCylinderIn))}</td>
            <td style="${numCellStyle} font-weight: 800;">${toEnglishDigits(formatNumberEn(stats.totalCylinderOut))}</td>
            <td style="${numCellStyle} font-weight: 800;">${toEnglishDigits(formatNumberEn(stats.totalScrapOut || 0))}</td>
            <td style="${numCellStyle} font-weight: 800; background: #ffedd5; color: #c2410c;">${toEnglishDigits(formatNumberEn(stats.totalScrapStockIn || 0))}</td>
            <td style="${numCellStyle} font-weight: 900; background: #d1fae5; color: #065f46;">${toEnglishDigits(formatNumberEn(stats.currentCylinders))}</td>
            <td style="${numCellStyle} font-weight: 800; background: #ffe4e6; color: #be123c;">${toEnglishDigits(formatNumberEn(stats.totalFinalScrapOut || 0))}</td>
            <td style="${numCellStyle} font-weight: 900; background: #fef3c7; color: #92400e;">${toEnglishDigits(formatNumberEn(stats.currentScrap))}</td>
            <td style="${numCellStyle} font-weight: 800;">${toEnglishDigits(formatNumberEn(stats.totalNewValveIn))}</td>
            <td style="${numCellStyle} font-weight: 800;">${toEnglishDigits(formatNumberEn(stats.totalNewValveOut))}</td>
            <td style="${numCellStyle} font-weight: 900; background: #d1fae5; color: #065f46;">${toEnglishDigits(formatNumberEn(stats.currentNewValves))}</td>
            <td style="border: 1px solid #475569; padding: 1px; text-align: center; font-weight: 800; font-family: 'Segoe UI', Arial, sans-serif; font-size: 7.5px; box-sizing: border-box; overflow: hidden; text-overflow: ellipsis;">${toEnglishDigits(formatNumberEn(stats.totalDispatched))}</td>
            <td style="${numCellStyle} font-weight: 800;">${toEnglishDigits(formatNumberEn(stats.totalUsedValveIn))}</td>
            <td style="${numCellStyle} font-weight: 800;">${toEnglishDigits(formatNumberEn(stats.totalUsedValveOut))}</td>
            <td style="${numCellStyle} font-weight: 900; background: #fef3c7; color: #92400e;">${toEnglishDigits(formatNumberEn(stats.currentUsedValves))}</td>
            <td style="${numCellStyle} font-weight: 800;">${toEnglishDigits(formatNumberEn(stats.totalDefective))}</td>
          </tr>
        </tfoot>
      </table>

      <!-- Signatures Footer -->
      <div class="kardex-signatures-block" style="margin-top: 6px; padding-top: 4px; border-top: 1px dashed #64748b; display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; text-align: center; font-size: 8px; box-sizing: border-box; page-break-inside: avoid; break-inside: avoid; page-break-after: avoid; break-after: avoid;">
        <div style="border: 1px solid #cbd5e1; border-radius: 4px; padding: 3px; min-height: 38px; box-sizing: border-box;">
          <div>تنظیم‌کننده کاردکس:</div>
          <div style="margin-top: 12px; border-bottom: 1px dotted #94a3b8; width: 70%; margin-left: auto; margin-right: auto;"></div>
        </div>
        <div style="border: 1px solid #cbd5e1; border-radius: 4px; padding: 3px; min-height: 38px; box-sizing: border-box;">
          <div>مسئول انبار / توزیع:</div>
          <div style="margin-top: 12px; border-bottom: 1px dotted #94a3b8; width: 70%; margin-left: auto; margin-right: auto;"></div>
        </div>
        <div style="border: 1px solid #cbd5e1; border-radius: 4px; padding: 3px; min-height: 38px; box-sizing: border-box;">
          <div>مدیریت عملیات:</div>
          <div style="margin-top: 12px; border-bottom: 1px dotted #94a3b8; width: 70%; margin-left: auto; margin-right: auto;"></div>
        </div>
        <div style="border: 1px solid #cbd5e1; border-radius: 4px; padding: 3px; min-height: 38px; box-sizing: border-box;">
          <div>مهر و امضای طرف حساب:</div>
          <div style="font-weight: bold; margin-top: 1px; color: #0f172a; font-size: 7.5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${customerName}</div>
          <div style="margin-top: 3px; border-bottom: 1px dotted #94a3b8; width: 70%; margin-left: auto; margin-right: auto;"></div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(mount);

  // 3. Inject strict landscape print stylesheet that prevents any horizontal overflow or left-side cutoff
  const styleEl = document.createElement('style');
  styleEl.id = 'am-gas-dynamic-print-rules';
  styleEl.textContent = `
    @page {
      size: landscape;
      margin: 4mm 6mm;
    }
    @media screen {
      #am-gas-isolated-print-mount {
        display: none !important;
        visibility: hidden !important;
        height: 0 !important;
        overflow: hidden !important;
      }
    }
    @media print {
      body.amgas-isolated-printing > *:not(#am-gas-isolated-print-mount) {
        display: none !important;
        visibility: hidden !important;
        height: 0 !important;
        min-height: 0 !important;
        max-height: 0 !important;
        overflow: hidden !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      *, *::before, *::after {
        box-sizing: border-box !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      *, html, body, #am-gas-isolated-print-mount, #am-gas-isolated-print-mount * {
        font-family: 'EnglishDigits', 'Vazirmatn', Arial, 'Segoe UI', Roboto, Helvetica, Tahoma, sans-serif !important;
        font-feature-settings: "latn" 1, "tnum" 1, "numr" 0, "onum" 0 !important;
        font-variant-numeric: tabular-nums !important;
      }
      html, body {
        background: #ffffff !important;
        background-color: #ffffff !important;
        color: #020617 !important;
        margin: 0 !important;
        padding: 0 !important;
        width: 100% !important;
        min-width: 0 !important;
        max-width: 100% !important;
        height: auto !important;
        min-height: 0 !important;
        max-height: none !important;
        overflow: visible !important;
        direction: rtl !important;
      }
      #am-gas-isolated-print-mount {
        display: block !important;
        visibility: visible !important;
        position: static !important;
        width: 100% !important;
        max-width: 100% !important;
        min-width: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
        background: #ffffff !important;
        color: #020617 !important;
        overflow: visible !important;
        float: none !important;
        clear: both !important;
        box-sizing: border-box !important;
        page-break-after: avoid !important;
        break-after: avoid !important;
      }
      .kardex-print-sheet {
        width: 100% !important;
        max-width: 100% !important;
        min-width: 0 !important;
        margin: 0 !important;
        padding: 0 2px !important;
        box-sizing: border-box !important;
        overflow: visible !important;
        page-break-after: avoid !important;
        break-after: avoid !important;
      }
      table.kardex-print-table {
        width: 100% !important;
        max-width: 100% !important;
        min-width: 0 !important;
        table-layout: fixed !important;
        border-collapse: collapse !important;
        box-sizing: border-box !important;
      }
      table.kardex-print-table th,
      table.kardex-print-table td {
        word-break: normal !important;
        overflow-wrap: normal !important;
        font-size: 7.5px !important;
        padding: 1px !important;
        line-height: 1.15 !important;
        box-sizing: border-box !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
      }
      table.kardex-print-table th {
        font-size: 7px !important;
        line-height: 1.1 !important;
        font-weight: 800 !important;
      }
      table.kardex-print-table td.numeric,
      table.kardex-print-table td[dir="ltr"],
      table.kardex-print-table td.font-mono,
      table.kardex-print-table td .font-mono,
      #am-gas-isolated-print-mount td[dir="ltr"],
      #am-gas-isolated-print-mount td.font-mono {
        font-family: Arial, 'Segoe UI', Roboto, sans-serif !important;
        font-feature-settings: "latn" 1, "tnum" 1 !important;
        font-variant-numeric: tabular-nums !important;
        font-size: 7.5px !important;
        font-weight: 700 !important;
        direction: ltr !important;
        unicode-bidi: isolate !important;
        letter-spacing: normal !important;
      }
      tr {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      thead {
        display: table-header-group !important;
      }
      tfoot {
        display: table-footer-group !important;
      }
      .kardex-signatures-block {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
        page-break-after: avoid !important;
        break-after: avoid !important;
      }
    }
  `;
  document.head.appendChild(styleEl);

  // 4. Update title & set body class
  const prevTitle = document.title;
  document.title = `کاردکس گاز - ${customerName}`;
  document.body.classList.add('amgas-isolated-printing');
  document.body.classList.add('amgas-kardex-landscape');

  // 5. Safe Cleanup only on true afterprint (no timeout destruction)
  let isCleanedUp = false;
  const cleanup = () => {
    if (isCleanedUp) return;
    isCleanedUp = true;
    document.body.classList.remove('amgas-isolated-printing');
    document.body.classList.remove('amgas-kardex-landscape');
    document.title = prevTitle;
    const m = document.getElementById('am-gas-isolated-print-mount');
    if (m) m.remove();
    const s = document.getElementById('am-gas-dynamic-print-rules');
    if (s) s.remove();
  };

  window.addEventListener('afterprint', cleanup, { once: true });

  // 6. Trigger print after 350ms settle delay
  setTimeout(() => {
    try {
      window.focus();
      window.print();
    } catch (err) {
      console.warn('[GasKardexPrint] print error:', err);
      cleanup();
    }
  }, 350);
}
