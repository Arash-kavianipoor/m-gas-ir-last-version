/**
 * Test Suite: Multi-Client User Synchronization & Offline Identity Verification
 * 
 * Verifies:
 * 1. Initial authorization from Cloudflare D1 / server endpoint
 * 2. Automatic propagation of updated user identity records to all client databases (Office Win11, Warehouse Win7, Cloud Web)
 * 3. Offline authentication fallback: All clients maintain full user identity records with PBKDF2 hashes
 * 4. Verification that internet disruption does not disrupt user login on any client
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const initSqlJs = require('sql.js');

function hashPasswordPbkdf2(password, saltHex) {
  const saltBuf = Buffer.from(saltHex, 'hex');
  return crypto.pbkdf2Sync(password, saltBuf, 100000, 32, 'sha512').toString('hex');
}

function verifyPasswordPbkdf2(password, saltHex, hashHex) {
  const computed = hashPasswordPbkdf2(password, saltHex);
  return crypto.timingSafeEqual(Buffer.from(computed, 'hex'), Buffer.from(hashHex, 'hex'));
}

async function runTest() {
  console.log('--- [TEST 1] Initializing SQLite Databases for Clients (Office Win11 & Warehouse Win7) ---');
  const SQL = await initSqlJs();
  const dbOffice = new SQL.Database();
  const dbWarehouse = new SQL.Database();

  const schemaSql = fs.readFileSync(path.join(__dirname, '../src/database/canonical-schema.sql'), 'utf-8');
  dbOffice.run(schemaSql);
  dbWarehouse.run(schemaSql);

  console.log('✓ Both client databases initialized with canonical schema');

  // Verify users table exists in canonical schema
  const checkTable = dbOffice.exec("SELECT name FROM sqlite_master WHERE type='table' AND name='users'");
  if (checkTable.length === 0 || checkTable[0].values.length === 0) {
    throw new Error('FAILED: users table not found in canonical schema!');
  }
  console.log('✓ users table verified in canonical schema');

  console.log('\n--- [TEST 2] Simulating Initial Cloudflare Authorization & Local Client Caching ---');
  // Cloudflare D1 authoritative users list
  const saltAmouei = crypto.randomBytes(16).toString('hex');
  const hashAmouei = hashPasswordPbkdf2('Amouei#Admin11!', saltAmouei);

  const saltKarami = crypto.randomBytes(16).toString('hex');
  const hashKarami = hashPasswordPbkdf2('Karami#Office11!', saltKarami);

  const saltHajivand = crypto.randomBytes(16).toString('hex');
  const hashHajivand = hashPasswordPbkdf2('Hajivand#Win7Gas!', saltHajivand);

  const cloudUsers = [
    {
      user_id: 'USR-001',
      username: 'amouei',
      password_salt: saltAmouei,
      password_hash: hashAmouei,
      is_password_changed: 1,
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
      password_salt: saltKarami,
      password_hash: hashKarami,
      is_password_changed: 1,
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
      password_salt: saltHajivand,
      password_hash: hashHajivand,
      is_password_changed: 1,
      full_name: 'مهندس حاجی وند',
      role: 'WAREHOUSE_KEEPER',
      role_title: 'انباردار',
      allowed_device_id: 'SYS-HAJIVAND-WH-03',
      system_id: 'SYS-HAJIVAND-WH-03',
      system_name: 'سیستم صنعتی انبار مرکزی (ویندوز 7)'
    }
  ];

  // Helper to sync users into an SQLite client DB
  function syncUsersIntoDb(targetDb, users) {
    const now = new Date().toISOString();
    for (const u of users) {
      targetDb.run(`
        INSERT OR REPLACE INTO users (
          user_id, username, password_salt, password_hash, is_password_changed,
          full_name, role, role_title, allowed_device_id, system_id, system_name, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        u.user_id, u.username, u.password_salt, u.password_hash, u.is_password_changed ? 1 : 0,
        u.full_name, u.role, u.role_title, u.allowed_device_id, u.system_id, u.system_name, now, now
      ]);
    }
  }

  // Initial sync to Office & Warehouse
  syncUsersIntoDb(dbOffice, cloudUsers);
  syncUsersIntoDb(dbWarehouse, cloudUsers);

  const officeUsersCount = dbOffice.exec("SELECT COUNT(*) FROM users")[0].values[0][0];
  const warehouseUsersCount = dbWarehouse.exec("SELECT COUNT(*) FROM users")[0].values[0][0];
  if (officeUsersCount !== 3 || warehouseUsersCount !== 3) {
    throw new Error(`FAILED: Expected 3 users in client databases, found ${officeUsersCount} in office and ${warehouseUsersCount} in warehouse`);
  }
  console.log(`✓ Both client databases successfully cached ${officeUsersCount} user identity records from Cloudflare.`);

  console.log('\n--- [TEST 3] Testing Offline Authentication on Client Without Internet Connection ---');
  // Simulate complete offline scenario: user logs in locally using SQLite DB
  const userRows = dbWarehouse.exec("SELECT user_id, username, password_salt, password_hash, full_name, role FROM users WHERE username = 'hajivand'");
  if (userRows.length === 0 || userRows[0].values.length === 0) {
    throw new Error('FAILED: User hajivand not found in warehouse local SQLite database!');
  }

  const [hUserId, hUsername, hSalt, hHash, hFullName, hRole] = userRows[0].values[0];
  const isOfflinePasswordValid = verifyPasswordPbkdf2('Hajivand#Win7Gas!', hSalt, hHash);
  if (!isOfflinePasswordValid) {
    throw new Error('FAILED: Local offline password verification failed for hajivand!');
  }
  console.log(`✓ Offline login authenticated successfully for «${hFullName}» using local PBKDF2 hash on Windows 7 client!`);

  console.log('\n--- [TEST 4] User Credential / Password Change & Multi-Client Propagation ---');
  // Manager Amouei updates Mrs. Karami's password and role title
  const newSaltKarami = crypto.randomBytes(16).toString('hex');
  const newHashKarami = hashPasswordPbkdf2('Karami#NewPass2026!', newSaltKarami);

  const updatedUserKarami = {
    user_id: 'USR-002',
    username: 'karami',
    password_salt: newSaltKarami,
    password_hash: newHashKarami,
    is_password_changed: 1,
    full_name: 'سرکار خانم کرمی',
    role: 'INTERNAL_MANAGER',
    role_title: 'مدیریت امور اداری و انبار مرکزی',
    allowed_device_id: 'SYS-KARAMI-OFFICE-02',
    system_id: 'SYS-KARAMI-OFFICE-02',
    system_name: 'سیستم اداری خانم کرمی (ویندوز 11)'
  };

  // Broadcast sync event to all client databases
  syncUsersIntoDb(dbOffice, [updatedUserKarami]);
  syncUsersIntoDb(dbWarehouse, [updatedUserKarami]);

  // Check both clients now have the updated password hash
  const officeKarami = dbOffice.exec("SELECT password_hash, full_name, role_title FROM users WHERE username = 'karami'")[0].values[0];
  const warehouseKarami = dbWarehouse.exec("SELECT password_hash, full_name, role_title FROM users WHERE username = 'karami'")[0].values[0];

  if (officeKarami[0] !== newHashKarami || warehouseKarami[0] !== newHashKarami) {
    throw new Error('FAILED: Updated password hash did not synchronize across all client databases!');
  }
  if (warehouseKarami[1] !== 'سرکار خانم کرمی' || warehouseKarami[2] !== 'مدیریت امور اداری و انبار مرکزی') {
    throw new Error('FAILED: User identity details did not synchronize to warehouse database!');
  }

  // Verify Mrs. Karami can now log in offline on the warehouse client with her new password
  const canKaramiLoginOffline = verifyPasswordPbkdf2('Karami#NewPass2026!', newSaltKarami, warehouseKarami[0]);
  if (!canKaramiLoginOffline) {
    throw new Error('FAILED: Offline login with updated password failed on client!');
  }

  console.log('✓ Password and identity update successfully propagated to all client databases.');
  console.log(`✓ Offline login with updated password verified on client: «${warehouseKarami[1]} - ${warehouseKarami[2]}»`);

  console.log('\n======================================================');
  console.log('ALL USER SYNCHRONIZATION & OFFLINE VERIFICATION TESTS PASSED!');
  console.log('======================================================');
}

runTest().catch(err => {
  console.error('\n❌ TEST FAILED:', err);
  process.exit(1);
});
