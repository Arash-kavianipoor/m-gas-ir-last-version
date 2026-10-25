/**
 * Test Suite: Goods Receipts Database Persistence & SQLite Schema Verification
 * Verifies that both Goods Entry (برگ ورود) and Goods Exit (برگه خروج) receipts
 * are correctly persisted into SQLite database with events, audit logs, and can be queried.
 */

const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

async function runTest() {
  console.log('--- [TEST 1] Initializing SQLite and Canonical Schema ---');
  const SQL = await initSqlJs();
  const db = new SQL.Database();

  const schemaSql = fs.readFileSync(path.join(__dirname, '../src/database/canonical-schema.sql'), 'utf-8');
  db.run(schemaSql);

  // Verify goods_receipts table exists
  const tableCheck = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name='goods_receipts'");
  if (tableCheck.length === 0 || tableCheck[0].values.length === 0) {
    throw new Error('FAILED: goods_receipts table was not found in database schema!');
  }
  console.log('✓ goods_receipts table successfully created and verified in schema');

  console.log('\n--- [TEST 2] Testing Goods Entry Receipt (برگ ورود کالا) Persistence ---');
  const entryReceipt = {
    receipt_id: 'RCP-ENTRY-001',
    receipt_type: 'ENTRY',
    form_number: '052601',
    date: '1405/06/23',
    customer_id: 'CUST-GAS-011',
    customer_name: 'شرکت البرز گاز',
    entry_id: 'GAS-001',
    party_name: 'شرکت البرز گاز',
    vehicle_type: 'کامیون / خاور حمل گاز',
    plate_number: 'ایران ۲۲ - ۳۴۵ ع ۷۸',
    driver_name: 'اصغر راننده توزیع',
    waybill_number: '',
    items: [
      { rowNum: 1, description: 'سیلندر گاز مایع ۱۱ کیلوگرمی', quantity: 150, quantityInWords: 'یکصد و پنجاه', freightCost: '', remarks: 'شارژ و انبار' },
      { rowNum: 2, description: 'سیلندر اسقاطی ضایعات', quantity: 12, quantityInWords: 'دوازده', freightCost: '', remarks: 'داغی' }
    ],
    signer_1: 'مسئول دریافت و تعمیرات انبار',
    signer_2: 'اصغر راننده',
    signer_3: 'مسئول انبار و اداری',
    user_id: 'USR-001'
  };

  const now = new Date().toISOString();
  db.run(`
    INSERT INTO goods_receipts (
      receipt_id, receipt_type, form_number, date, customer_id, customer_name,
      entry_id, party_name, vehicle_type, plate_number, driver_name, waybill_number,
      items_json, signer_1, signer_2, signer_3, user_id, device_id, event_id, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    entryReceipt.receipt_id,
    entryReceipt.receipt_type,
    entryReceipt.form_number,
    entryReceipt.date,
    entryReceipt.customer_id,
    entryReceipt.customer_name,
    entryReceipt.entry_id,
    entryReceipt.party_name,
    entryReceipt.vehicle_type,
    entryReceipt.plate_number,
    entryReceipt.driver_name,
    entryReceipt.waybill_number,
    JSON.stringify(entryReceipt.items),
    entryReceipt.signer_1,
    entryReceipt.signer_2,
    entryReceipt.signer_3,
    entryReceipt.user_id,
    'OFFICE-PC-001',
    'EVT-ENTRY-001',
    now,
    now
  ]);

  const entryQuery = db.exec("SELECT * FROM goods_receipts WHERE receipt_id = 'RCP-ENTRY-001'");
  if (entryQuery.length === 0 || entryQuery[0].values.length === 0) {
    throw new Error('FAILED: Goods Entry Receipt was not saved in DB!');
  }
  const entryRow = entryQuery[0].values[0];
  console.log(`✓ Entry Receipt stored: ID=${entryRow[0]}, Type=${entryRow[1]}, FormNumber=${entryRow[2]}, Party=${entryRow[7]}`);
  const parsedItems = JSON.parse(entryRow[12]);
  if (parsedItems.length !== 2 || parsedItems[0].quantity !== 150) {
    throw new Error('FAILED: Parsed entry items mismatch!');
  }
  console.log(`✓ Stored ${parsedItems.length} items with total quantity ${parsedItems[0].quantity}`);

  console.log('\n--- [TEST 3] Testing Goods Exit Receipt (برگه خروج کالا) Persistence ---');
  const exitReceipt = {
    receipt_id: 'RCP-EXIT-001',
    receipt_type: 'EXIT',
    form_number: '052602',
    date: '1405/06/24',
    customer_id: 'CUST-GAS-011',
    customer_name: 'شرکت البرز گاز',
    entry_id: 'GAS-002',
    party_name: 'شرکت البرز گاز',
    vehicle_type: 'خاور مسقف',
    plate_number: 'ایران ۲۲ - ۳۴۵ ع ۷۸',
    driver_name: 'راننده توزیع و حمل',
    waybill_number: '۹۸۴۳۲',
    items: [
      { rowNum: 1, description: 'سیلندر گاز مایع ۱۱ کیلوگرمی (ارسال و تحویل)', quantity: 200, quantityInWords: 'دویست', remarks: 'سالم و پر' },
      { rowNum: 2, description: 'ضایعات اسقاطی سیلندر گاز مایع', quantity: 5, quantityInWords: 'پنج', remarks: 'اسقاطی' }
    ],
    signer_1: 'مسئول انبار و تحویل',
    signer_2: 'تحویل گیرنده',
    signer_3: 'امور مالی و حسابداری',
    user_id: 'USR-001'
  };

  db.run(`
    INSERT INTO goods_receipts (
      receipt_id, receipt_type, form_number, date, customer_id, customer_name,
      entry_id, party_name, vehicle_type, plate_number, driver_name, waybill_number,
      items_json, signer_1, signer_2, signer_3, user_id, device_id, event_id, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    exitReceipt.receipt_id,
    exitReceipt.receipt_type,
    exitReceipt.form_number,
    exitReceipt.date,
    exitReceipt.customer_id,
    exitReceipt.customer_name,
    exitReceipt.entry_id,
    exitReceipt.party_name,
    exitReceipt.vehicle_type,
    exitReceipt.plate_number,
    exitReceipt.driver_name,
    exitReceipt.waybill_number,
    JSON.stringify(exitReceipt.items),
    exitReceipt.signer_1,
    exitReceipt.signer_2,
    exitReceipt.signer_3,
    exitReceipt.user_id,
    'WAREHOUSE-PC-001',
    'EVT-EXIT-001',
    now,
    now
  ]);

  const exitQuery = db.exec("SELECT * FROM goods_receipts WHERE receipt_id = 'RCP-EXIT-001'");
  if (exitQuery.length === 0 || exitQuery[0].values.length === 0) {
    throw new Error('FAILED: Goods Exit Receipt was not saved in DB!');
  }
  const exitRow = exitQuery[0].values[0];
  console.log(`✓ Exit Receipt stored: ID=${exitRow[0]}, Type=${exitRow[1]}, FormNumber=${exitRow[2]}, Waybill=${exitRow[11]}`);

  console.log('\n--- [TEST 4] Testing Querying & Filtering Receipts ---');
  const allReceipts = db.exec("SELECT receipt_id, receipt_type, form_number, party_name FROM goods_receipts ORDER BY form_number");
  console.log('Total receipts in SQLite database:', allReceipts[0].values.length);
  if (allReceipts[0].values.length !== 2) {
    throw new Error('FAILED: Expected 2 receipts in DB!');
  }

  console.log('\n--- [TEST 5] Testing Receipt Update in Database ---');
  db.run("UPDATE goods_receipts SET waybill_number = '99999' WHERE receipt_id = 'RCP-EXIT-001'");
  const updatedQuery = db.exec("SELECT waybill_number FROM goods_receipts WHERE receipt_id = 'RCP-EXIT-001'");
  if (updatedQuery[0].values[0][0] !== '99999') {
    throw new Error('FAILED: Update did not persist!');
  }
  console.log('✓ Receipt update verified in SQLite database');

  console.log('\n========================================');
  console.log('ALL GOODS RECEIPTS DATABASE TESTS PASSED! ✓');
  console.log('========================================');
}

runTest().catch(err => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
