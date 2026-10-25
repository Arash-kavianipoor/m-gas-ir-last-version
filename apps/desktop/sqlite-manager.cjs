// ==============================================================================
// SQLITE DATABASE ENGINE & TRANSACTION MANAGER (For Windows 7 & Windows 11)
// Direct SQLite binary file management in the application installation root directory
// ==============================================================================

const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

let SQL = null;
let activeDb = null;
let activeDbPath = null;
let activeEnv = 'OFFICE_WIN11';
let activeDeviceId = 'OFFICE-PC-001';
let isInitializing = false;

// Secure Password Hashing (Requirement 16)
function hashPassword(password, salt = 'am_gas_secure_salt_2026') {
  return crypto.pbkdf2Sync(String(password), salt, 1000, 32, 'sha256').toString('hex');
}

// 1. Dynamic Root Directory Resolution (Requirement 5)
// Resolves to installation root directory (e.g. C:\WarehouseManagement or C:\OfficeManagement)
function getAppRootDirectory(electronApp) {
  if (electronApp && electronApp.isPackaged) {
    // In packaged app, process.execPath is:
    // C:\WarehouseManagement\Warehouse.exe or C:\OfficeManagement\Office.exe
    return path.dirname(process.execPath);
  }
  // In development / local testing:
  return path.resolve(__dirname, '../../');
}

// 2. Single Local Database File for this Installation (Requirement: 1 Cloudflare DB + 1 Local DB per machine)
function getDatabaseFilePath(electronApp, env) {
  const rootDir = getAppRootDirectory(electronApp);
  const localDb = 'mgas_local.db';
  const targetPath = path.join(rootDir, localDb);

  // Smooth backward migration: If mgas_local.db doesn't exist yet, but legacy db-anbar1.db or db-anbar2.db exists, copy it
  if (!fs.existsSync(targetPath)) {
    const isWarehouse = env === 'WAREHOUSE_WIN7' || process.argv.includes('--warehouse');
    const legacyDb = isWarehouse ? 'db-anbar1.db' : 'db-anbar2.db';
    const legacyPath = path.join(rootDir, legacyDb);
    if (fs.existsSync(legacyPath)) {
      try {
        fs.copyFileSync(legacyPath, targetPath);
        console.log(`[SQLite Manager] Migrated legacy ${legacyDb} to ${localDb}`);
      } catch (e) {
        console.warn(`[SQLite Manager] Could not copy legacy DB:`, e);
      }
    }
  }

  return targetPath;
}

// Ensure the single local database (mgas_local.db) exists and is initialized
function ensureLocalDatabase(rootDir, SQL, schemaSql) {
  const dbPath = path.join(rootDir, 'mgas_local.db');
  if (!fs.existsSync(dbPath)) {
    console.log(`[SQLite Manager] Creating single local database: ${dbPath}`);
    const db = new SQL.Database();
    if (schemaSql) db.exec(schemaSql);
    const data = Buffer.from(db.export());
    fs.writeFileSync(dbPath, data);
    db.close();
  }
}

// 3. Writable Directory Check (Requirement 6)
function verifyDirectoryWritePermission(dirPath) {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    const testFile = path.join(dirPath, `.write_perm_test_${Date.now()}.tmp`);
    fs.writeFileSync(testFile, 'write_perm_ok', 'utf8');
    fs.unlinkSync(testFile);
    return { writable: true, path: dirPath };
  } catch (err) {
    return {
      writable: false,
      path: dirPath,
      error: `عدم وجود دسترسی نوشتن در پوشه نصب برنامه: ${err.message}`
    };
  }
}

// 4. Atomically persist memory SQLite to disk (Crash Recovery - Requirement 19)
function flushDatabaseToDisk() {
  if (!activeDb || !activeDbPath) return;
  try {
    const data = activeDb.export();
    const tempPath = `${activeDbPath}.tmp_${Date.now()}`;
    fs.writeFileSync(tempPath, Buffer.from(data));
    fs.renameSync(tempPath, activeDbPath);
  } catch (err) {
    console.error('[SQLite Flush Error]', err);
    throw err;
  }
}

// 5. Automatic Database Initialization (Requirement 7)
async function initDatabase(electronApp, targetEnv = 'OFFICE_WIN11') {
  if (isInitializing) {
    while (isInitializing) {
      await new Promise(r => setTimeout(r, 100));
    }
    return getDatabaseInfo(electronApp);
  }

  isInitializing = true;
  activeEnv = targetEnv;
  activeDeviceId = targetEnv === 'WAREHOUSE_WIN7' ? 'WAREHOUSE-PC-001' : 'OFFICE-PC-001';

  try {
    const rootDir = getAppRootDirectory(electronApp);
    const permCheck = verifyDirectoryWritePermission(rootDir);
    if (!permCheck.writable) {
      throw new Error(`خطای سطح دسترسی: برنامه اجازه نوشتن فایل در مسیر ${rootDir} را ندارد.`);
    }

    activeDbPath = getDatabaseFilePath(electronApp, targetEnv);
    console.log(`[SQLite Manager] Resolving database in application root: ${activeDbPath}`);

    // Load sql.js
    if (!SQL) {
      const initSqlJs = require('sql.js');
      SQL = await initSqlJs();
    }

    const fileExists = fs.existsSync(activeDbPath);
    let isNew = false;

    if (!fileExists) {
      // Create fresh SQLite database
      isNew = true;
      console.log(`[SQLite Manager] Database not found. Creating new database at: ${activeDbPath}`);
      activeDb = new SQL.Database();

      // Read canonical schema SQL
      let schemaPath = path.join(rootDir, 'canonical-schema.sql');
      if (!fs.existsSync(schemaPath)) {
        schemaPath = path.join(__dirname, '../../src/database/canonical-schema.sql');
      }
      if (!fs.existsSync(schemaPath)) {
        schemaPath = path.join(process.resourcesPath || '', 'canonical-schema.sql');
      }

      if (fs.existsSync(schemaPath)) {
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        activeDb.exec(schemaSql);
      } else {
        // Fallback core schema if file is somehow missing
        activeDb.exec(`
          PRAGMA foreign_keys = ON;
          CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT NOT NULL);
          CREATE TABLE IF NOT EXISTS sync_state (device_id TEXT PRIMARY KEY, last_server_sequence INTEGER NOT NULL DEFAULT 0, last_synced_at TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'ONLINE');
          CREATE TABLE IF NOT EXISTS sync_queue (event_id TEXT PRIMARY KEY, status TEXT NOT NULL, retry_count INTEGER NOT NULL DEFAULT 0, last_attempt_at TEXT, next_retry_at TEXT, error_message TEXT, created_at TEXT NOT NULL, payload TEXT NOT NULL);
          CREATE TABLE IF NOT EXISTS sync_events (event_id TEXT PRIMARY KEY, user_id TEXT NOT NULL, device_id TEXT NOT NULL, event_type TEXT NOT NULL, entity_type TEXT NOT NULL, entity_id TEXT NOT NULL, payload TEXT NOT NULL, client_created_at TEXT NOT NULL, server_received_at TEXT, server_sequence INTEGER UNIQUE, schema_version INTEGER NOT NULL DEFAULT 1);
          CREATE TABLE IF NOT EXISTS audit_logs (audit_id TEXT PRIMARY KEY, user_id TEXT NOT NULL, device_id TEXT NOT NULL, action TEXT NOT NULL, entity_type TEXT NOT NULL, entity_id TEXT NOT NULL, event_id TEXT, timestamp TEXT NOT NULL, metadata TEXT);
        `);
      }

      // Initial settings and metadata
      const now = new Date().toISOString();
      activeDb.run(
        "INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES ('schema_version', '1', ?), ('app_role', ?, ?), ('device_id', ?, ?), ('created_at', ?, ?)",
        [now, targetEnv, now, activeDeviceId, now, now, now]
      );

      // Seed Users with secure password hashing (Enterprise PBKDF2)
      const usersStmt = activeDb.prepare(`
        INSERT OR IGNORE INTO users (user_id, username, password_hash, full_name, role, allowed_device_id, is_active, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)
      `);

      const seedUsers = [
        ['USR-001', 'amouei', '866ab120f94c788b13b98383b7cd799eb7d90abce6ccf84902672dd15fef10cc', 'آقای مهندس عمویی', 'ADMIN', 'SYS-AMOUEL-ADMIN-01', now, now],
        ['USR-002', 'karami', '5d0e1bf5fcde3e15776e55dc299d0c969fd4cd6c219faa5ec1ff03df36d4f74c', 'خانم کرمی', 'INTERNAL_MANAGER', 'SYS-KARAMI-OFFICE-02', now, now],
        ['USR-003', 'hajivand', '29b462651ae04eead9b9e89b9ba453b6cd8c845f69413fb19bd9a1258919ecb1', 'مهندس حاجی وند', 'WAREHOUSE_KEEPER', 'SYS-HAJIVAND-WH-03', now, now]
      ];

      for (const u of seedUsers) {
        try {
          usersStmt.run(u);
        } catch (e) {
          console.warn('Seed user insert warning:', e.message);
        }
      }
      usersStmt.free();

      // Seed Devices
      activeDb.run(
        `INSERT OR IGNORE INTO devices (device_id, name, os, location, last_seen_at, created_at)
         VALUES 
         ('SYS-AMOUEL-ADMIN-01', 'سیستم اداری مدیر آقای مهندس عمویی (ویندوز 11)', 'Windows 11', 'دفتر مدیریت ارشد - واحد مرکزی', ?, ?),
         ('SYS-KARAMI-OFFICE-02', 'سیستم اداری خانم کرمی (ویندوز 11)', 'Windows 11', 'دفتر مرکزی - واحد بازرگانی', ?, ?),
         ('SYS-HAJIVAND-WH-03', 'سیستم صنعتی انبار مرکزی مهندس حاجی‌وند (ویندوز 7)', 'Windows 7', 'سوله انبار مرکزی', ?, ?),
         ('OFFICE-PC-001', 'سیستم اداری دفتر مرکزی (ویندوز 11)', 'Windows 11', 'دفتر مرکزی - واحد بازرگانی', ?, ?),
         ('WAREHOUSE-PC-001', 'سیستم صنعتی انبار مرکزی (ویندوز 7)', 'Windows 7', 'سوله انبار مرکزی', ?, ?)`,
        [now, now, now, now, now, now, now, now, now, now]
      );

      // Seed Warehouses
      activeDb.run(
        `INSERT OR IGNORE INTO warehouses (warehouse_id, name, code, address, is_active)
         VALUES 
         ('WH-MAIN', 'انبار مرکزی ام گاز', 'WH-01', 'تهران، جاده مخصوص کرج، کیلومتر 14', 1),
         ('WH-OFFICE', 'انبار نمونه دفتر مرکزی', 'WH-02', 'تهران، خیابان آزادی، برج تجارت', 1)`
      );

      // Seed Initial Sync State
      activeDb.run(
        "INSERT OR REPLACE INTO sync_state (device_id, last_server_sequence, last_synced_at, status) VALUES (?, 1006, ?, 'ONLINE')",
        [activeDeviceId, now]
      );

      // Initial flush to disk
      flushDatabaseToDisk();
      ensureLocalDatabase(rootDir, SQL, schemaSql);
      console.log(`[SQLite Manager] Successfully initialized and flushed fresh database to: ${activeDbPath}`);
    } else {
      // Existing SQLite database: open, verify schema, execute safe idempotent migrations
      console.log(`[SQLite Manager] Loading existing SQLite database from: ${activeDbPath}`);
      const fileBuffer = fs.readFileSync(activeDbPath);
      activeDb = new SQL.Database(fileBuffer);

      // Idempotent migration verification
      try {
        activeDb.exec(`
          CREATE TABLE IF NOT EXISTS goods_receipts (
            receipt_id TEXT PRIMARY KEY,
            receipt_type TEXT NOT NULL CHECK (receipt_type IN ('ENTRY', 'EXIT')),
            form_number TEXT NOT NULL,
            date TEXT NOT NULL,
            customer_id TEXT,
            customer_name TEXT,
            entry_id TEXT,
            party_name TEXT NOT NULL,
            vehicle_type TEXT,
            plate_number TEXT,
            driver_name TEXT,
            waybill_number TEXT,
            items_json TEXT NOT NULL,
            signer_1 TEXT,
            signer_2 TEXT,
            signer_3 TEXT,
            user_id TEXT,
            device_id TEXT,
            event_id TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
          );
          CREATE INDEX IF NOT EXISTS idx_goods_receipts_type ON goods_receipts(receipt_type);
          CREATE INDEX IF NOT EXISTS idx_goods_receipts_form_number ON goods_receipts(form_number);
          CREATE INDEX IF NOT EXISTS idx_goods_receipts_entry ON goods_receipts(entry_id);
        `);
        const res = activeDb.exec("SELECT value FROM settings WHERE key = 'schema_version'");
        const version = res.length > 0 && res[0].values.length > 0 ? res[0].values[0][0] : '1';
        console.log(`[SQLite Manager] Verified database schema version: ${version}`);
      } catch {
        activeDb.exec("CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT NOT NULL)");
        activeDb.run("INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES ('schema_version', '1', ?)", [new Date().toISOString()]);
        flushDatabaseToDisk();
      }
    }

    return getDatabaseInfo(electronApp);
  } finally {
    isInitializing = false;
  }
}

// 6. Database Info Query
function getDatabaseInfo(electronApp) {
  const rootDir = getAppRootDirectory(electronApp);
  const exists = activeDbPath ? fs.existsSync(activeDbPath) : false;
  const stats = exists ? fs.statSync(activeDbPath) : null;

  let tablesCount = 0;
  let serverSequence = 1006;
  let pendingEvents = 0;

  if (activeDb) {
    try {
      const tRes = activeDb.exec("SELECT count(*) FROM sqlite_master WHERE type='table'");
      if (tRes.length > 0) tablesCount = tRes[0].values[0][0];
      const sRes = activeDb.exec("SELECT last_server_sequence FROM sync_state LIMIT 1");
      if (sRes.length > 0) serverSequence = sRes[0].values[0][0];
      const qRes = activeDb.exec("SELECT count(*) FROM sync_queue WHERE status = 'PENDING'");
      if (qRes.length > 0) pendingEvents = qRes[0].values[0][0];
    } catch (e) {
      console.warn('Could not read stats from activeDb:', e.message);
    }
  }

  return {
    success: true,
    dbPath: activeDbPath,
    rootDir,
    exists,
    sizeBytes: stats ? stats.size : 0,
    sizeFormatted: stats ? `${(stats.size / 1024).toFixed(1)} KB` : '0 KB',
    environment: activeEnv,
    deviceId: activeDeviceId,
    tablesCount,
    serverSequence,
    pendingEvents,
    writable: verifyDirectoryWritePermission(rootDir).writable
  };
}

// 7. General SQL Query (SELECT)
function query(sql, params = []) {
  if (!activeDb) throw new Error('پایگاه داده هنوز مقداردهی اولیه نشده است');
  const stmt = activeDb.prepare(sql);
  stmt.bind(params);
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

// 8. General SQL Execute (INSERT / UPDATE / DELETE inside transaction)
function execute(sql, params = []) {
  if (!activeDb) throw new Error('پایگاه داده هنوز مقداردهی اولیه نشده است');
  activeDb.run(sql, params);
  flushDatabaseToDisk();
  return { success: true };
}

// 9. Atomic Event Creation & Outbox Insertion (Requirement 11, 12, 19)
function recordLocalEvent(event, extraUpdates = null) {
  if (!activeDb) throw new Error('پایگاه داده باز نیست');

  activeDb.exec('BEGIN TRANSACTION;');
  try {
    const now = new Date().toISOString();

    // 1. Insert into sync_events
    activeDb.run(
      `INSERT INTO sync_events (event_id, user_id, device_id, event_type, entity_type, entity_id, payload, client_created_at, schema_version)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        event.event_id,
        event.user_id,
        event.device_id || activeDeviceId,
        event.event_type,
        event.entity_type,
        event.entity_id,
        JSON.stringify(event.payload),
        event.client_created_at || now,
        event.schema_version || 1
      ]
    );

    // 2. Insert into local sync_queue (Outbox)
    activeDb.run(
      `INSERT INTO sync_queue (event_id, status, retry_count, created_at, payload)
       VALUES (?, 'PENDING', 0, ?, ?)`,
      [event.event_id, now, JSON.stringify(event)]
    );

    // 3. Insert Audit Log (Requirement 15)
    activeDb.run(
      `INSERT INTO audit_logs (audit_id, user_id, device_id, action, entity_type, entity_id, event_id, timestamp, metadata)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        event.user_id,
        event.device_id || activeDeviceId,
        `${event.event_type}_${event.entity_type}`,
        event.entity_type,
        event.entity_id,
        event.event_id,
        now,
        JSON.stringify({ offline: true })
      ]
    );

    // 4. Materialize directly into local tables
    if (event.entity_type === 'GOODS_RECEIPT' && event.payload) {
      const p = event.payload;
      if (event.event_type === 'DELETE') {
        activeDb.run(`DELETE FROM goods_receipts WHERE receipt_id = ?`, [p.receipt_id || event.entity_id]);
      } else {
        activeDb.run(`
          INSERT OR REPLACE INTO goods_receipts (
            receipt_id, receipt_type, form_number, date, customer_id, customer_name,
            entry_id, party_name, vehicle_type, plate_number, driver_name, waybill_number,
            items_json, signer_1, signer_2, signer_3, user_id, device_id, event_id, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          p.receipt_id || event.entity_id,
          p.receipt_type || 'EXIT',
          p.form_number || '',
          p.date || '',
          p.customer_id || '',
          p.customer_name || '',
          p.entry_id || '',
          p.party_name || '',
          p.vehicle_type || '',
          p.plate_number || '',
          p.driver_name || '',
          p.waybill_number || '',
          JSON.stringify(p.items || []),
          p.signer_1 || '',
          p.signer_2 || '',
          p.signer_3 || '',
          p.user_id || event.user_id || 'USR-001',
          event.device_id || activeDeviceId,
          event.event_id,
          p.created_at || now,
          p.updated_at || now
        ]);
      }
    } else if (event.entity_type === 'CUSTOMER' && event.payload) {
      const p = event.payload;
      if (event.event_type === 'DELETE') {
        activeDb.run(`DELETE FROM customers WHERE customer_id = ?`, [p.customer_id || event.entity_id]);
      } else {
        activeDb.run(`
          INSERT OR REPLACE INTO customers (customer_id, name, code, phone, national_id, economic_code, province, city, address, credit_limit, current_balance, customer_type, notes, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          p.customer_id || event.entity_id, p.name || '', p.code || '', p.phone || '', p.national_id || '',
          p.economic_code || '', p.province || 'تهران', p.city || 'تهران', p.address || '',
          p.credit_limit || 0, p.current_balance || 0, p.customer_type || 'عمده', p.notes || '',
          p.created_at || now, p.updated_at || now
        ]);
      }
    } else if (event.entity_type === 'PRODUCT' && event.payload) {
      const p = event.payload;
      if (event.event_type === 'DELETE') {
        activeDb.run(`DELETE FROM products WHERE product_id = ?`, [p.product_id || event.entity_id]);
      } else {
        activeDb.run(`
          INSERT OR REPLACE INTO products (product_id, category_id, name, sku, barcode, description, unit, purchase_price, sale_price, min_stock, max_stock, is_active, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          p.product_id || event.entity_id, p.category_id || 'CAT-01', p.name || '', p.sku || '', p.barcode || '',
          p.description || '', p.unit || 'عدد', p.purchase_price || 0, p.sale_price || 0,
          p.min_stock || 0, p.max_stock || 1000, p.is_active ? 1 : 0, p.created_at || now, p.updated_at || now
        ]);
      }
    } else if (event.entity_type === 'STOCK_MOVEMENT' && event.payload) {
      const p = event.payload;
      if (event.event_type === 'DELETE') {
        activeDb.run(`DELETE FROM stock_movements WHERE movement_id = ?`, [p.movement_id || event.entity_id]);
      } else {
        activeDb.run(`
          INSERT OR REPLACE INTO stock_movements (movement_id, product_id, warehouse_id, to_warehouse_id, quantity, movement_type, reference_id, unit_price, user_id, device_id, event_id, notes, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          p.movement_id || event.entity_id, p.product_id || '', p.warehouse_id || '', p.to_warehouse_id || null,
          p.quantity || 0, p.movement_type || 'ADJUSTMENT', p.reference_id || '', p.unit_price || 0,
          p.user_id || event.user_id || 'USR-001', event.device_id || activeDeviceId, event.event_id,
          p.notes || '', p.created_at || now
        ]);
      }
    }

    activeDb.exec('COMMIT;');
    flushDatabaseToDisk();
    return { success: true, event_id: event.event_id };
  } catch (err) {
    activeDb.exec('ROLLBACK;');
    console.error('[SQLite recordLocalEvent Error]', err);
    throw err;
  }
}

// 10. Transactional Safe Backup (Requirement 20)
function backupDatabase(destinationPath) {
  if (!activeDb) throw new Error('پایگاه داده مقداردهی نشده است');
  try {
    // Consistent in-memory SQLite snapshot
    const data = activeDb.export();
    const tempFile = `${destinationPath}.tmp_${Date.now()}`;
    fs.writeFileSync(tempFile, Buffer.from(data));
    fs.renameSync(tempFile, destinationPath);

    // Audit backup creation
    const now = new Date().toISOString();
    activeDb.run(
      `INSERT INTO audit_logs (audit_id, user_id, device_id, action, entity_type, entity_id, timestamp, metadata)
       VALUES (?, 'SYSTEM', ?, 'BACKUP_CREATED', 'DATABASE', 'SQLITE', ?, ?)`,
      [`AUD-BAK-${Date.now()}`, activeDeviceId, now, JSON.stringify({ destinationPath })]
    );
    flushDatabaseToDisk();

    return { success: true, destinationPath, sizeBytes: data.length };
  } catch (err) {
    console.error('[SQLite Backup Error]', err);
    throw err;
  }
}

module.exports = {
  getAppRootDirectory,
  getDatabaseFilePath,
  verifyDirectoryWritePermission,
  initDatabase,
  getDatabaseInfo,
  query,
  execute,
  recordLocalEvent,
  backupDatabase,
  hashPassword,
  flushDatabaseToDisk
};
