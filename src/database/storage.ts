import {
  Product,
  Category,
  Customer,
  Supplier,
  Warehouse,
  StockMovement,
  SyncEvent,
  SyncQueueItem,
  SyncState,
  AuditLog,
  RuntimeEnvironment,
  EntityType,
  EventType,
  Sale,
  Purchase,
  GasKardexEntry,
  GasProductionKardexEntry,
  Invoice,
  GoodsReceiptRecord,
  GoodsReceiptType,
  GoodsReceiptItem,
  User,
  DocumentEditPermissionResult,
  CylinderValveInspection,
  InspectionStatus,
  CustomCylinderItemType
} from '../types';
import {
  SEED_PRODUCTS,
  SEED_CATEGORIES,
  SEED_CUSTOMERS,
  SEED_SUPPLIERS,
  SEED_WAREHOUSES,
  INITIAL_STOCK_MOVEMENTS,
  INITIAL_SYNC_EVENTS,
  INITIAL_AUDIT_LOGS,
  SEED_USERS,
  SEED_GAS_KARDEX_ENTRIES,
  SEED_CYLINDER_VALVE_INSPECTIONS
} from './seed-data';
import { EXCEL_CUSTOMERS_48 } from './excel-customers';
import { recalculateKardexBalances } from './gas-kardex-data';
import { SEED_GAS_PRODUCTION_KARDEX_ENTRIES, recalculateProductionKardexBalances } from './production-kardex-data';
import { generateUUID } from '../utils/persian';
import { purgeClientDataCache } from '../utils/cookieAuth';

export const DEFAULT_CYLINDER_ITEM_TYPES: CustomCylinderItemType[] = [
  { id: 'VALVE_NEW', name: 'شیر نو سیلندر گاز ۱۱ کیلوگرمی', category: 'VALVE', unit: 'عدد', created_at: '2026-09-01T00:00:00.000Z' },
  { id: 'VALVE_USED', name: 'شیر کهنه کپسول گاز', category: 'VALVE', unit: 'عدد', created_at: '2026-09-01T00:00:00.000Z' },
  { id: 'CYLINDER_11KG', name: 'سیلندر گاز مایع ۱۱ کیلوگرم', category: 'CYLINDER', unit: 'عدد', created_at: '2026-09-01T00:00:00.000Z' },
  { id: 'CYLINDER_OTHER', name: 'سایر سیلندرها / پیک‌نیک', category: 'CYLINDER', unit: 'عدد', created_at: '2026-09-01T00:00:00.000Z' },
  { id: 'SCRAP', name: 'ضایعات و اسقاط شیر/کپسول', category: 'SCRAP', unit: 'عدد', created_at: '2026-09-01T00:00:00.000Z' }
];

export interface ValveIntakeBreakdown11kg {
  parsi: number;
  butane: number;
  iranGazi: number;
  forklift: number;
  iraqi: number;
}

export interface ValveIntakeBreakdownPicnic {
  parsi: number;
  butane: number;
}

export interface ValveIntakeRecordParams {
  customerId: string;
  customerName: string;
  date: string;
  sheetNumber: string;
  driverName?: string;
  plateNumber?: string;
  notes?: string;
  valves11kgNew: ValveIntakeBreakdown11kg;
  valves11kgUsed: ValveIntakeBreakdown11kg;
  valvesPicnic5kg: ValveIntakeBreakdownPicnic;
  valvesPicnic2kg: ValveIntakeBreakdownPicnic;
}

export interface ValveIntakeResult {
  success: boolean;
  entryId: string;
  totalNewValves: number;
  totalUsedValves: number;
  totalAllValves: number;
  itemsCount: number;
  summaryText: string;
  entry: GasKardexEntry;
}

export interface SecurityPolicyState {
  strictDomainLock: boolean;
  allowedDomain: string;
  enforceDeviceBinding: boolean;
  requireStrongPassword: boolean;
  tamperProtectionEnabled: boolean;
  databaseWriteProtected: boolean;
  internalManagerMaxEditWindowHours: number; // default: 1 (Internal Manager Mrs. Karami max 1 hour document edit restriction)
  failedAttempts: Record<string, number>;
  lockedUntil: Record<string, number>;
}

export interface LocalDatabaseState {
  environment: RuntimeEnvironment;
  deviceId: string;
  dbName: string;
  users: User[];
  security_policy: SecurityPolicyState;
  products: Product[];
  categories: Category[];
  customers: Customer[];
  suppliers: Supplier[];
  warehouses: Warehouse[];
  stock_movements: StockMovement[];
  sales: Sale[];
  purchases: Purchase[];
  invoices: Invoice[];
  gas_kardex_entries: GasKardexEntry[];
  gas_production_kardex_entries?: GasProductionKardexEntry[];
  goods_receipts: GoodsReceiptRecord[];
  cylinder_valve_inspections: CylinderValveInspection[];
  custom_cylinder_item_types: CustomCylinderItemType[];
  sync_events: SyncEvent[];
  sync_queue: SyncQueueItem[];
  sync_state: SyncState;
  audit_logs: AuditLog[];
  isOfflineSimulated: boolean;
  is_purged?: boolean;
  purged_at?: string;
  deleted_entity_ids?: string[];
  is_stock_zeroed_v2?: boolean;
  stock_zeroed_at?: string;
  test_items_purged?: boolean;
  test_items_purged_at?: string;
  customers_purged_for_excel_v1?: boolean;
}

const STORAGE_KEYS: Record<RuntimeEnvironment, string> = {
  OFFICE_WIN11: 'mgas_db_office_sqlite_v6',
  WAREHOUSE_WIN7: 'mgas_db_warehouse_sqlite_v6',
  CLOUD_WEB: 'mgas_db_cloud_web_v6'
};

const TOMBSTONE_STORAGE_KEY = 'mgas_permanently_deleted_ids_v1';
const DELETED_CUSTOM_ITEMS_KEY = 'mgas_deleted_custom_item_types_v1';

function getInitialState(env: RuntimeEnvironment): LocalDatabaseState {
  const deviceId =
    env === 'OFFICE_WIN11'
      ? 'OFFICE-PC-001'
      : env === 'WAREHOUSE_WIN7'
      ? 'WAREHOUSE-PC-001'
      : 'WEB-001';

  const dbName =
    env === 'OFFICE_WIN11'
      ? 'Office SQLite (Win 11)'
      : env === 'WAREHOUSE_WIN7'
      ? 'Warehouse SQLite (Win 7)'
      : 'Cloud D1 (Direct)';

  return {
    environment: env,
    deviceId,
    dbName,
    products: JSON.parse(JSON.stringify(SEED_PRODUCTS)),
    categories: JSON.parse(JSON.stringify(SEED_CATEGORIES)),
    customers: JSON.parse(JSON.stringify(SEED_CUSTOMERS)),
    suppliers: JSON.parse(JSON.stringify(SEED_SUPPLIERS)),
    warehouses: JSON.parse(JSON.stringify(SEED_WAREHOUSES)),
    stock_movements: [],
    sales: [],
    purchases: [],
    invoices: [],
    gas_kardex_entries: [],
    gas_production_kardex_entries: JSON.parse(JSON.stringify(SEED_GAS_PRODUCTION_KARDEX_ENTRIES)),
    goods_receipts: [],
    cylinder_valve_inspections: [],
    custom_cylinder_item_types: JSON.parse(JSON.stringify(DEFAULT_CYLINDER_ITEM_TYPES)),
    sync_events: [],
    sync_queue: [],
    sync_state: {
      device_id: deviceId,
      last_server_sequence: 1000,
      last_synced_at: new Date().toISOString(),
      pending_events_count: 0,
      status: 'ONLINE'
    },
    audit_logs: JSON.parse(JSON.stringify(INITIAL_AUDIT_LOGS)),
    users: JSON.parse(JSON.stringify(SEED_USERS)),
    security_policy: {
      strictDomainLock: true,
      allowedDomain: 'anbar.mgas.ir',
      enforceDeviceBinding: true,
      requireStrongPassword: true,
      tamperProtectionEnabled: true,
      databaseWriteProtected: false,
      internalManagerMaxEditWindowHours: 1,
      failedAttempts: {},
      lockedUntil: {}
    },
    isOfflineSimulated: false,
    deleted_entity_ids: []
  };
}

export class LocalStorageManager {
  private static states: Partial<Record<RuntimeEnvironment, LocalDatabaseState>> = {};

  private static listeners: Array<() => void> = [];

  static subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private static notify() {
    this.listeners.forEach(l => {
      try {
        l();
      } catch (err) {
        console.warn('Listener notification error:', err);
      }
    });
    if (typeof window !== 'undefined') {
      try {
        window.dispatchEvent(new CustomEvent('mgas:db_refreshed'));
        window.dispatchEvent(new CustomEvent('mgas:database_refreshed'));
      } catch {}
    }
  }

  private static permanentlyDeletedIds = new Set<string>();

  /**
   * Permanent Tombstone Registry: In-memory registry ensuring items deleted forever never resurrect
   */
  static getPermanentlyDeletedIds(): Set<string> {
    return this.permanentlyDeletedIds;
  }

  static markEntityPermanentlyDeleted(entityId: string) {
    if (!entityId) return;
    const cleanId = String(entityId).trim();
    if (!cleanId) return;

    this.permanentlyDeletedIds.add(cleanId);

    // Synchronize tombstone and strip entity across ALL 3 database states
    const allEnvs: RuntimeEnvironment[] = ['OFFICE_WIN11', 'WAREHOUSE_WIN7', 'CLOUD_WEB'];
    for (const env of allEnvs) {
      try {
        const s = this.states[env] || this.getState(env);
        if (s) {
          if (!s.deleted_entity_ids) s.deleted_entity_ids = [];
          if (!s.deleted_entity_ids.includes(cleanId)) {
            s.deleted_entity_ids.push(cleanId);
          }
          if (s.gas_kardex_entries) {
            s.gas_kardex_entries = s.gas_kardex_entries.filter(e => e.entry_id !== cleanId);
          }
          if (s.cylinder_valve_inspections) {
            s.cylinder_valve_inspections = s.cylinder_valve_inspections.filter(i => i.inspection_id !== cleanId && i.form_number !== cleanId);
          }
          if (s.stock_movements) {
            s.stock_movements = s.stock_movements.filter(m => m.movement_id !== cleanId && m.movement_id !== `MOV-INSP-${cleanId}`);
          }
          if (s.goods_receipts) {
            s.goods_receipts = s.goods_receipts.filter(r => r.receipt_id !== cleanId && r.entry_id !== cleanId);
          }
          if (s.invoices) {
            s.invoices = s.invoices.filter(i => i.invoice_id !== cleanId);
          }
          if (s.custom_cylinder_item_types) {
            s.custom_cylinder_item_types = s.custom_cylinder_item_types.filter(c => c.id !== cleanId);
          }
          this.saveState(env, s);
        }
      } catch {}
    }
  }

  static isEntityPermanentlyDeleted(entityId: string): boolean {
    if (!entityId) return false;
    const cleanId = String(entityId).trim();
    if (!cleanId) return false;
    const ids = this.getPermanentlyDeletedIds();
    return ids.has(cleanId);
  }

  private static persistDebounceTimers: Partial<Record<RuntimeEnvironment, any>> = {};

  private static async openIndexedDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        return reject('IndexedDB unavailable');
      }
      const req = window.indexedDB.open('mgas_storage_v1', 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains('snapshots')) {
          db.createObjectStore('snapshots', { keyPath: 'env' });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  private static async saveStateToIndexedDB(env: string, state: LocalDatabaseState): Promise<void> {
    if (typeof window === 'undefined' || !window.indexedDB) return;
    try {
      const db = await this.openIndexedDB();
      const tx = db.transaction('snapshots', 'readwrite');
      const store = tx.objectStore('snapshots');
      store.put({ env, data: state, updated_at: Date.now() });
    } catch {}
  }

  private static async loadStateFromIndexedDB(env: string): Promise<LocalDatabaseState | null> {
    if (typeof window === 'undefined' || !window.indexedDB) return null;
    try {
      const db = await this.openIndexedDB();
      return new Promise((resolve) => {
        const tx = db.transaction('snapshots', 'readonly');
        const store = tx.objectStore('snapshots');
        const req = store.get(env);
        req.onsuccess = () => resolve(req.result?.data || null);
        req.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  }

  private static persistStateToClient(env: RuntimeEnvironment, state: LocalDatabaseState) {
    if (typeof window === 'undefined') return;

    // 1. Synchronously and immediately persist to localStorage (0ms delay prevents losing edits on page reload)
    try {
      const key = STORAGE_KEYS[env] || `mgas_db_${env}`;
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch (err) {
      console.warn('[LocalStorageManager] Storage quota or persistence warning:', err);
    }

    // 2. Debounced background write to IndexedDB
    if (this.persistDebounceTimers[env]) {
      clearTimeout(this.persistDebounceTimers[env]);
    }

    this.persistDebounceTimers[env] = setTimeout(() => {
      this.saveStateToIndexedDB(env, state).catch(() => {});
    }, 60);
  }

  /**
   * Load active environment state with immediate persistence restoration.
   * Guarantees 0ms local boot: restored instantly from localStorage / IndexedDB.
   */
  static loadState(env: RuntimeEnvironment): LocalDatabaseState {
    if (!this.states) {
      this.states = {};
    }

    if (this.states[env]) {
      return this.states[env]!;
    }

    let loadedState: LocalDatabaseState | null = null;

    // 1. Instant synchronous restore from localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const key = STORAGE_KEYS[env] || `mgas_db_${env}`;
        const raw = window.localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === 'object') {
            loadedState = parsed;
          }
        }
      } catch (e) {
        console.warn('[LocalStorageManager] Could not read local storage state:', e);
      }
    }

    // 2. Fallback to initial seed state
    if (!loadedState) {
      loadedState = getInitialState(env);
    }

    this.ensureSeedUsersExist(loadedState);
    this.ensureValveProductsExist(loadedState);
    this.ensureNutCategoryAndProductsExist(loadedState);
    this.ensureExcelCustomersLoaded(loadedState);
    this.ensureProductionKardexLoaded(loadedState);
    this.states[env] = loadedState;

    // 3. Background reconciliation with IndexedDB (Safe event merge that never overwrites user edits)
    if (typeof window !== 'undefined') {
      this.loadStateFromIndexedDB(env).then((idbState) => {
        if (!idbState) return;
        const current = this.states[env];
        if (!current) {
          this.ensureSeedUsersExist(idbState);
          this.ensureValveProductsExist(idbState);
          this.ensureNutCategoryAndProductsExist(idbState);
          this.states[env] = idbState;
          this.notify();
          return;
        }

        // Never blow away products or user-edited state!
        // Only merge sync events if IndexedDB had newer pending events
        const existingEventIds = new Set((current.sync_events || []).map(e => e.event_id));
        let hasNewEvents = false;
        for (const ev of idbState.sync_events || []) {
          if (ev?.event_id && !existingEventIds.has(ev.event_id)) {
            current.sync_events.push(ev);
            existingEventIds.add(ev.event_id);
            hasNewEvents = true;
          }
        }
        if (hasNewEvents) {
          this.persistStateToClient(env, current);
          this.notify();
        }
      }).catch(() => {});
    }

    return loadedState;
  }

  /**
   * Save active environment state in RAM with immutable array cloning and instant client persistence.
   * Guaranteed: Immediate UI reactivity across all React components and permanent storage.
   */
  static saveState(env: RuntimeEnvironment, state: LocalDatabaseState) {
    if (!this.states) {
      this.states = {};
    }

    // Defensive immutable collection cloning so React useMemo and component dependencies immediately detect mutations
    const immutableState: LocalDatabaseState = {
      ...state,
      gas_kardex_entries: state.gas_kardex_entries ? [...state.gas_kardex_entries] : [],
      gas_production_kardex_entries: state.gas_production_kardex_entries ? [...state.gas_production_kardex_entries] : [],
      cylinder_valve_inspections: state.cylinder_valve_inspections ? [...state.cylinder_valve_inspections] : [],
      stock_movements: state.stock_movements ? [...state.stock_movements] : [],
      products: state.products ? [...state.products] : [],
      categories: state.categories ? [...state.categories] : [],
      customers: state.customers ? [...state.customers] : [],
      warehouses: state.warehouses ? [...state.warehouses] : [],
      custom_cylinder_item_types: state.custom_cylinder_item_types ? [...state.custom_cylinder_item_types] : [],
      sync_queue: state.sync_queue ? [...state.sync_queue] : [],
      audit_logs: state.audit_logs ? [...state.audit_logs] : []
    };

    this.states[env] = immutableState;

    // Notify all reactive UI subscribers immediately (0ms)
    this.notify();

    // Persist to local client disk (localStorage + IndexedDB)
    this.persistStateToClient(env, immutableState);
  }

  static getState(env: RuntimeEnvironment): LocalDatabaseState {
    if (!this.states) {
      this.states = {};
    }
    const state = this.states[env] || this.loadState(env);
    this.ensureSeedUsersExist(state);
    this.ensureValveProductsExist(state);
    this.ensureNutCategoryAndProductsExist(state);
    this.ensureExcelCustomersLoaded(state);
    this.ensureProductionKardexLoaded(state);
    return state;
  }

  static resetDatabase(env: RuntimeEnvironment) {
    const fresh = getInitialState(env);
    this.saveState(env, fresh);
  }

  static updateWarehouseShelf(env: RuntimeEnvironment, warehouse_id: string, shelf_letter: string, shelf_number: number) {
    const s = this.getState(env);
    const shelf_location = `${shelf_letter.toUpperCase()}${shelf_number}`;
    s.warehouses = s.warehouses.map(w => {
      if (w.warehouse_id === warehouse_id) {
        return {
          ...w,
          shelf_location,
          shelf_letter: shelf_letter.toUpperCase(),
          shelf_number
        };
      }
      return w;
    });
    this.saveState(env, s);
  }

  /**
   * Complete Warehouse Stock Zeroing
   * Clears all stock movements and ensures inventory across all warehouses is zero for all products.
   */
  static zeroAllWarehouseStock(env: RuntimeEnvironment, authorName: string = 'مدیریت / انباردار', applyToAllEnvs: boolean = true) {
    const envsToZero: RuntimeEnvironment[] = applyToAllEnvs
      ? ['OFFICE_WIN11', 'WAREHOUSE_WIN7', 'CLOUD_WEB']
      : [env];

    const now = new Date().toISOString();

    envsToZero.forEach(targetEnv => {
      const state = this.getState(targetEnv);
      state.stock_movements = [];
      state.is_stock_zeroed_v2 = true;
      state.stock_zeroed_at = now;
      this.saveState(targetEnv, state);
    });

    this.notify();
  }

  /**
   * Purge all test / dummy products from warehouse across all environments
   */
  static purgeTestProductsFromWarehouse(env?: RuntimeEnvironment, userId: string = 'USR-001') {
    const envs: RuntimeEnvironment[] = ['OFFICE_WIN11', 'WAREHOUSE_WIN7', 'CLOUD_WEB'];
    const TEST_PRODUCT_IDS = ['PRD-1001', 'PRD-1002', 'PRD-1003', 'PRD-1004', 'PRD-1005'];
    const TEST_PRODUCT_SKUS = ['PRD-TL-01', 'PRD-VL-02', 'PRD-EL-03', 'PRD-LB-04', 'PRD-TL-05'];
    const isTestProduct = (p: any) => {
      if (!p) return false;
      if (TEST_PRODUCT_IDS.includes(p.product_id)) return true;
      if (p.sku && TEST_PRODUCT_SKUS.includes(p.sku)) return true;
      const name = p.name || '';
      return (
        name.includes('آچار بکس بادی') ||
        name.includes('شیر توپی فولادی 2 اینچ') ||
        name.includes('کنتاکتور 32 آمپر') ||
        name.includes('روغن هیدرولیک بهران') ||
        name.includes('فرز انگشتی گلو بلند')
      );
    };

    TEST_PRODUCT_IDS.forEach(id => this.markEntityPermanentlyDeleted(id));

    envs.forEach(targetEnv => {
      const state = this.getState(targetEnv);
      if (state.products && Array.isArray(state.products)) {
        state.products = state.products.filter(p => !isTestProduct(p));
      }
      if (state.stock_movements && Array.isArray(state.stock_movements)) {
        state.stock_movements = state.stock_movements.filter(
          m => !TEST_PRODUCT_IDS.includes(m.product_id)
        );
      }
      state.test_items_purged = true;
      state.test_items_purged_at = new Date().toISOString();
      this.saveState(targetEnv, state);
    });

    this.notify();
  }

  /**
   * Delete single product with tombstone & sync across environments
   */
  static deleteProduct(env: RuntimeEnvironment, productId: string, userId: string = 'USR-001') {
    const envs: RuntimeEnvironment[] = ['OFFICE_WIN11', 'WAREHOUSE_WIN7', 'CLOUD_WEB'];
    this.markEntityPermanentlyDeleted(productId);

    envs.forEach(targetEnv => {
      const state = this.getState(targetEnv);
      const prod = (state.products || []).find(p => p.product_id === productId);
      if (state.products) {
        state.products = state.products.filter(p => p.product_id !== productId);
      }
      if (state.stock_movements) {
        state.stock_movements = state.stock_movements.filter(m => m.product_id !== productId);
      }
      this.recordLocalChange(
        targetEnv,
        userId,
        'PRODUCT',
        'DELETE',
        productId,
        { product_id: productId, name: prod?.name || '' },
        'DELETE_PRODUCT',
        { productId, name: prod?.name || '' }
      );
      this.saveState(targetEnv, state);
    });

    this.notify();
  }

  /**
   * Complete Database Purge
   * Wipes all stock movements, kardex entries, invoices, goods receipts, sync queues, and events.
   * Can purge the active environment or all storage environments simultaneously.
   */
  static purgeAllDatabaseData(env: RuntimeEnvironment, authorName: string = 'مدیریت ارشد', purgeAllEnvs: boolean = true) {
    const envsToPurge: RuntimeEnvironment[] = purgeAllEnvs
      ? ['OFFICE_WIN11', 'WAREHOUSE_WIN7', 'CLOUD_WEB']
      : [env];

    const now = new Date().toISOString();

    envsToPurge.forEach(targetEnv => {
      const state = this.getState(targetEnv);

      // 1. Mark permanent Purge Tombstone flags
      state.is_purged = true;
      state.purged_at = now;

      // 2. Completely clear all transactional and ledger data
      state.stock_movements = [];
      state.gas_kardex_entries = [];
      state.invoices = [];
      state.goods_receipts = [];
      state.cylinder_valve_inspections = [];
      state.sales = [];
      state.purchases = [];
      state.sync_queue = [];
      state.sync_events = [];

      if (state.sync_state) {
        state.sync_state.last_synced_at = now;
        state.sync_state.pending_events_count = 0;
      }

      // 3. Record authorized audit entry
      const purgeAuditLog: AuditLog = {
        audit_id: `AUDIT-PURGE-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        action: 'DATABASE_PURGED',
        entity_type: 'SYSTEM',
        entity_id: 'GLOBAL_PURGE',
        user_id: 'ADMIN-ARASH',
        device_id: state.deviceId || 'DEVICE-ADMIN',
        timestamp: now,
        metadata: {
          author: authorName,
          reason: 'پاک‌سازی کامل و تخلیه دیتابیس توسط مدیریت با تایید رمز محرمانه شخصی',
          environment: targetEnv,
          wiped_at: now
        }
      };
      state.audit_logs = [purgeAuditLog];

      this.saveState(targetEnv, state);
    });

    try {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('mgas:database_purged', { detail: { purged_at: now } }));
      }
    } catch {}

    return true;
  }

  static restoreSeedData(env: RuntimeEnvironment) {
    const fresh = getInitialState(env);
    fresh.is_purged = false;
    fresh.purged_at = undefined;
    this.saveState(env, fresh);
    try {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('mgas:database_refreshed'));
      }
    } catch {}
    return fresh;
  }

  static toggleOffline(env: RuntimeEnvironment) {
    const s = this.getState(env);
    s.isOfflineSimulated = !s.isOfflineSimulated;
    s.sync_state.status = s.isOfflineSimulated ? 'OFFLINE' : 'ONLINE';
    this.saveState(env, s);
  }

  // Calculate live stock from immutable movements for this local database
  static getStockQuantities(env: RuntimeEnvironment): Record<string, Record<string, number>> {
    const state = this.getState(env);
    const stock: Record<string, Record<string, number>> = {};

    state.products.forEach(p => {
      stock[p.product_id] = {};
      state.warehouses.forEach(w => {
        stock[p.product_id][w.warehouse_id] = 0;
      });
    });

    for (const mov of state.stock_movements) {
      if (!stock[mov.product_id]) {
        stock[mov.product_id] = {};
      }
      if (stock[mov.product_id][mov.warehouse_id] === undefined) {
        stock[mov.product_id][mov.warehouse_id] = 0;
      }

      const qty = Number(mov.quantity) || 0;
      switch (mov.movement_type) {
        case 'STOCK_IN':
        case 'PURCHASE':
        case 'RETURN_IN':
          stock[mov.product_id][mov.warehouse_id] += qty;
          break;
        case 'STOCK_OUT':
        case 'SALE':
        case 'RETURN_OUT':
          stock[mov.product_id][mov.warehouse_id] -= qty;
          break;
        case 'TRANSFER_IN':
          stock[mov.product_id][mov.warehouse_id] += qty;
          break;
        case 'TRANSFER_OUT':
          stock[mov.product_id][mov.warehouse_id] -= qty;
          // Fallback: If transfer has to_warehouse_id and no paired TRANSFER_IN exists, update destination warehouse
          if (mov.to_warehouse_id) {
            const destWh = mov.to_warehouse_id;
            const hasPairedIn = state.stock_movements.some(other =>
              other.movement_type === 'TRANSFER_IN' &&
              other.warehouse_id === destWh &&
              (other.reference_id === mov.reference_id || (other as any).linked_transfer_id === mov.movement_id)
            );
            if (!hasPairedIn) {
              const destProd = (mov.item_condition === 'DEFECTIVE' && (mov.product_id === 'PRD-VALVE-NEW' || mov.product_id.includes('VALVE')))
                ? 'PRD-VALVE-DEFECTIVE'
                : mov.product_id;
              if (!stock[destProd]) stock[destProd] = {};
              if (stock[destProd][destWh] === undefined) stock[destProd][destWh] = 0;
              stock[destProd][destWh] += qty;
            }
          }
          break;
        case 'ADJUSTMENT':
          stock[mov.product_id][mov.warehouse_id] += qty;
          break;
      }
    }
    return stock;
  }

  /**
   * Ensures all seed users (Mr. Amouei, Mrs. Karami, Mr. Hajivand, Mrs. Safaei, Mrs. Hakimi) exist in state.users
   */
  static ensureSeedUsersExist(state: LocalDatabaseState) {
    if (!state.users || !Array.isArray(state.users) || state.users.length === 0) {
      state.users = JSON.parse(JSON.stringify(SEED_USERS));
      return;
    }

    for (const seedUser of SEED_USERS) {
      const existingIdx = state.users.findIndex(
        u => u.user_id === seedUser.user_id || u.username.toLowerCase() === seedUser.username.toLowerCase()
      );
      if (existingIdx === -1) {
        state.users.push(JSON.parse(JSON.stringify(seedUser)));
      } else {
        const existing = state.users[existingIdx];
        if (!existing.allowed_device_id && seedUser.allowed_device_id) {
          existing.allowed_device_id = seedUser.allowed_device_id;
        }
        if (!existing.system_id && seedUser.system_id) {
          existing.system_id = seedUser.system_id;
        }
        if (!existing.system_name && seedUser.system_name) {
          existing.system_name = seedUser.system_name;
        }
      }
    }
  }

  /**
   * Ensures standard valve products ("شیر 11/25/50 کیلویی", "شیر پیکنیک 1/1.5/3 لیتری", "شیر 5 و 6 کیلویی") exist in product catalog.
   * Respects user modifications: never forcefully resets names on reload/refresh!
   */
  static ensureValveProductsExist(state: LocalDatabaseState) {
    if (!state.products) state.products = [];

    // Migrate old unedited "قطعه شیر نو" to the new standard name "شیر 11/25/50 کیلویی"
    const legacyNew = state.products.find(p => (p.product_id === 'PRD-VALVE-NEW' || p.sku === 'VALVE-NEW') && p.name === 'قطعه شیر نو');
    if (legacyNew && !legacyNew.user_edited) {
      legacyNew.name = 'شیر 11/25/50 کیلویی';
      legacyNew.sku = 'VLV-11-25-50';
    }

    // Remove legacy unedited valves superseded by the 3 standard valves
    const legacyValveNames = [
      'قطعه شیر کهنه',
      'شیر توپی فولادی 2 اینچ',
      'قطعه شیر معیوب و ضایعات'
    ];
    state.products = state.products.filter(p => {
      if (p.category_id === 'CAT-02' && legacyValveNames.includes(p.name?.trim()) && !p.user_edited) {
        return false;
      }
      return true;
    });

    const defaultValves = [
      {
        id: 'PRD-VLV-11-25-50',
        sku: 'VLV-11-25-50',
        name: 'شیر 11/25/50 کیلویی',
        price: 1850000,
        desc: 'شیر استاندارد کپسول‌های ۱۱، ۲۵ و ۵۰ کیلویی ام‌گاز'
      },
      {
        id: 'PRD-VLV-PK-1-1.5-3',
        sku: 'VLV-PK-1-1.5-3',
        name: 'شیر پیکنیک 1/1.5/3 لیتری',
        price: 950000,
        desc: 'شیر برنجی سیلندرهای پیکنیکی کوچک ۱، ۱.۵ و ۳ لیتری'
      },
      {
        id: 'PRD-VLV-5-6',
        sku: 'VLV-5-6',
        name: 'شیر 5 و 6 کیلویی',
        price: 1200000,
        desc: 'شیر استاندارد سیلندرهای ۵ و ۶ کیلویی ام‌گاز'
      }
    ];

    for (const v of defaultValves) {
      const existing = state.products.find(
        p => p.product_id === v.id || p.sku === v.sku || p.name.trim() === v.name.trim()
      );
      if (!existing) {
        state.products.push({
          product_id: v.id,
          sku: v.sku,
          name: v.name,
          category_id: 'CAT-02',
          unit: 'عدد',
          min_stock: 30,
          purchase_price: v.price,
          sale_price: Math.round(v.price * 1.35),
          barcode: `6260881${Math.floor(100000 + Math.random() * 900000)}`,
          description: v.desc,
          created_at: '2026-09-01T08:00:00.000Z',
          updated_at: new Date().toISOString()
        });
      }
      // Never overwrite existing product name or details to guarantee user edits persist across refreshes!
    }
  }

  /**
   * Ensures "دسته مهره‌ها" (CAT-NUTS) and the 8 standard nut products exist in categories & product catalog.
   * Respects user modifications: never forcefully resets names on reload/refresh!
   */
  static ensureNutCategoryAndProductsExist(state: LocalDatabaseState) {
    if (!state.categories) state.categories = [];
    let nutCat = state.categories.find(
      c => c.category_id === 'CAT-NUTS' || c.name.includes('مهره') || c.code === 'NUT'
    );
    if (!nutCat) {
      nutCat = {
        category_id: 'CAT-NUTS',
        name: 'دسته مهره‌ها',
        code: 'NUT',
        description: 'انواع مهره‌های ۲ و ۵ و ۱۱/۲۵/۵۰ کیلویی، مخزن زاپاس و تمام مخازن',
        created_at: '2026-09-01T08:00:00.000Z',
        updated_at: new Date().toISOString()
      };
      state.categories.push(nutCat);
    } else {
      if (!nutCat.name.includes('مهره')) {
        nutCat.name = 'دسته مهره‌ها';
      }
    }

    if (!state.products) state.products = [];

    // The 8 nut items requested by the user
    const defaultNuts = [
      { id: 'PRD-NUT-2KG', sku: 'NUT-2KG', name: 'مهره 2 کیلویی', price: 180000, desc: 'مهره برنجی سیلندرهای ۲ کیلویی' },
      { id: 'PRD-NUT-5KG', sku: 'NUT-5KG', name: 'مهره 5 کیلویی', price: 220000, desc: 'مهره برنجی سیلندرهای ۵ کیلویی' },
      { id: 'PRD-NUT-11-25-50-BUT', sku: 'NUT-11-25-50-BUT', name: 'مهره 11/25/50 کیلویی بوتانی', price: 280000, desc: 'مهره برنجی استاندارد سیلندرهای ۱۱، ۲۵ و ۵۰ کیلویی بوتانی' },
      { id: 'PRD-NUT-11-25-50-PRC', sku: 'NUT-11-25-50-PRC', name: 'مهره 11/25/50 کیلویی پرسی', price: 280000, desc: 'مهره برنجی استاندارد سیلندرهای ۱۱، ۲۵ و ۵۰ کیلویی پرسی' },
      { id: 'PRD-NUT-11-25-50-PAS', sku: 'NUT-11-25-50-PAS', name: 'مهره 11/25/50 کیلویی پاساری', price: 280000, desc: 'مهره برنجی استاندارد سیلندرهای ۱۱، ۲۵ و ۵۰ کیلویی پاساری' },
      { id: 'PRD-NUT-11-25-50-IRG', sku: 'NUT-11-25-50-IRG', name: 'مهره 11/25/50 کیلویی ایرانگازی', price: 280000, desc: 'مهره برنجی استاندارد سیلندرهای ۱۱، ۲۵ و ۵۰ کیلویی ایرانگازی' },
      { id: 'PRD-NUT-TANK-SPARE', sku: 'NUT-TANK-SPARE', name: 'مهره مخزن زاپاس', price: 450000, desc: 'مهره و اتصالات یدکی و زاپاس مخازن گاز صنعتی' },
      { id: 'PRD-NUT-TANK-ALL', sku: 'NUT-TANK-ALL', name: 'مهره تمام مخزن ها', price: 520000, desc: 'مهره جامع و فراگیر استاندارد تمام مخازن ثابت و متحرک' }
    ];

    // Remove legacy unedited nuts that were superseded
    const legacyNutNames = [
      'مهره برنجی چپ‌گرد استاندارد',
      'مهره برنجی راست‌گرد استاندارد',
      'مهره کلاه‌دار',
      'مهره ریکشا',
      'مهره فولادی فشارقوی',
      'مهره پیکنیکی',
      'مهره و اتصالات مخزن'
    ];
    state.products = state.products.filter(p => {
      if (p.category_id === nutCat.category_id && legacyNutNames.includes(p.name?.trim()) && !p.user_edited) {
        return false;
      }
      return true;
    });

    for (const n of defaultNuts) {
      const existing = state.products.find(
        p => p.product_id === n.id || p.sku === n.sku || p.name.trim() === n.name.trim()
      );
      if (!existing) {
        state.products.push({
          product_id: n.id,
          sku: n.sku,
          name: n.name,
          category_id: nutCat.category_id,
          unit: 'عدد',
          min_stock: 50,
          purchase_price: n.price,
          sale_price: Math.round(n.price * 1.35),
          barcode: `6260882${Math.floor(100000 + Math.random() * 900000)}`,
          description: n.desc,
          created_at: '2026-09-01T08:00:00.000Z',
          updated_at: new Date().toISOString()
        });
      } else {
        if (existing.category_id !== nutCat.category_id) {
          existing.category_id = nutCat.category_id;
        }
      }
      // Never overwrite existing product name or details to guarantee user edits persist across refreshes!
    }
  }

  /**
   * Ensures all 48 customers from customers.xlsx are registered into the database alongside MGas
   * Fulfills user requirement: "همین حالا تمام 48 مشتری را وارد سیستم و ثبت کن"
   */
  static ensureExcelCustomersLoaded(state: LocalDatabaseState) {
    if (!state.customers) state.customers = [];

    // 1. Ensure MGas customer is present
    const hasMgas = state.customers.some(c =>
      c.customer_id === 'CUST-MGAS-VALVE' ||
      c.name?.includes('امگاز') ||
      c.company_name?.includes('ام‌گاز')
    );
    if (!hasMgas && SEED_CUSTOMERS[0]) {
      state.customers.unshift(SEED_CUSTOMERS[0]);
    }

    // 2. Ensure all 48 customers from customers.xlsx are present and registered
    for (const xlCust of EXCEL_CUSTOMERS_48) {
      const existingIdx = state.customers.findIndex(c =>
        c.customer_id === xlCust.customer_id ||
        (xlCust.national_id && c.national_id && c.national_id === xlCust.national_id) ||
        (xlCust.company_name && c.company_name && c.company_name.trim() === xlCust.company_name.trim()) ||
        (xlCust.name && c.name && c.name.trim() === xlCust.name.trim())
      );
      if (existingIdx === -1) {
        state.customers.push({ ...xlCust });
      } else {
        state.customers[existingIdx] = {
          ...xlCust,
          ...state.customers[existingIdx],
          row_index: xlCust.row_index,
          registration_number: xlCust.registration_number || state.customers[existingIdx].registration_number,
          fax: xlCust.fax || state.customers[existingIdx].fax,
          employer_phone: xlCust.employer_phone || state.customers[existingIdx].employer_phone,
          postal_code: xlCust.postal_code || state.customers[existingIdx].postal_code
        };
      }
    }
  }

  /**
   * Ensures production kardex entries exist in state
   */
  static ensureProductionKardexLoaded(state: LocalDatabaseState) {
    if (!state.gas_production_kardex_entries || state.gas_production_kardex_entries.length === 0) {
      state.gas_production_kardex_entries = JSON.parse(JSON.stringify(SEED_GAS_PRODUCTION_KARDEX_ENTRIES));
    }
  }

  /**
   * Returns all production kardex entries for the given environment
   */
  static getProductionKardexEntries(env: RuntimeEnvironment): GasProductionKardexEntry[] {
    const state = this.getState(env);
    this.ensureProductionKardexLoaded(state);
    return state.gas_production_kardex_entries || [];
  }

  /**
   * Saves a new production kardex entry and triggers event dispatch
   */
  static saveProductionKardexEntry(
    env: RuntimeEnvironment,
    entry: GasProductionKardexEntry,
    currentUser: User
  ): GasProductionKardexEntry {
    const state = this.getState(env);
    this.ensureProductionKardexLoaded(state);
    if (!state.gas_production_kardex_entries) state.gas_production_kardex_entries = [];

    const newEntry: GasProductionKardexEntry = {
      ...entry,
      entry_id: entry.entry_id || generateUUID('PRD'),
      user_id: currentUser.user_id,
      created_by_username: currentUser.username,
      device_id: currentUser.allowed_device_id,
      event_id: generateUUID('EVT'),
      created_at: entry.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    state.gas_production_kardex_entries.push(newEntry);
    this.saveState(env, state);

    this.recordLocalChange(
      env,
      currentUser.user_id,
      'GAS_PRODUCTION_KARDEX',
      'CREATE',
      newEntry.entry_id,
      newEntry,
      `ثبت ردیف کاردکس تولید ام‌گاز: ${newEntry.cylinder_type} (برگه ${newEntry.transfer_sheet_number})`
    );

    return newEntry;
  }

  /**
   * Updates an existing production kardex entry
   */
  static updateProductionKardexEntry(
    env: RuntimeEnvironment,
    entry: GasProductionKardexEntry,
    currentUser: User
  ): GasProductionKardexEntry {
    const state = this.getState(env);
    this.ensureProductionKardexLoaded(state);
    if (!state.gas_production_kardex_entries) state.gas_production_kardex_entries = [];

    const idx = state.gas_production_kardex_entries.findIndex(e => e.entry_id === entry.entry_id);
    if (idx === -1) {
      throw new Error('ردیف مورد نظر در کاردکس تولید یافت نشد.');
    }

    const updatedEntry: GasProductionKardexEntry = {
      ...state.gas_production_kardex_entries[idx],
      ...entry,
      updated_at: new Date().toISOString()
    };

    state.gas_production_kardex_entries[idx] = updatedEntry;
    this.saveState(env, state);

    this.recordLocalChange(
      env,
      currentUser.user_id,
      'GAS_PRODUCTION_KARDEX',
      'UPDATE',
      updatedEntry.entry_id,
      updatedEntry,
      `ویرایش ردیف کاردکس تولید ام‌گاز: ${updatedEntry.cylinder_type} (برگه ${updatedEntry.transfer_sheet_number})`
    );

    return updatedEntry;
  }

  /**
   * Trashes (soft deletes) a production kardex entry
   */
  static trashProductionKardexEntry(
    env: RuntimeEnvironment,
    entryId: string,
    currentUser: User,
    reason: string = 'حذف توسط کاربر'
  ): boolean {
    const state = this.getState(env);
    this.ensureProductionKardexLoaded(state);
    if (!state.gas_production_kardex_entries) return false;

    const idx = state.gas_production_kardex_entries.findIndex(e => e.entry_id === entryId);
    if (idx === -1) return false;

    const entry = state.gas_production_kardex_entries[idx];
    entry.is_deleted = true;
    entry.deleted_at = new Date().toISOString();
    entry.deleted_by = currentUser.full_name || currentUser.username;
    entry.delete_reason = reason;
    entry.updated_at = new Date().toISOString();

    this.saveState(env, state);

    this.recordLocalChange(
      env,
      currentUser.user_id,
      'GAS_PRODUCTION_KARDEX',
      'UPDATE',
      entry.entry_id,
      entry,
      `انتقال سند کاردکس تولید ${entry.cylinder_type} شماره برگه ${entry.transfer_sheet_number} به سطل آشغال`
    );

    return true;
  }

  /**
   * Restores a trashed production kardex entry
   */
  static restoreProductionKardexEntry(
    env: RuntimeEnvironment,
    entryId: string,
    currentUser: User
  ): boolean {
    const state = this.getState(env);
    this.ensureProductionKardexLoaded(state);
    if (!state.gas_production_kardex_entries) return false;

    const idx = state.gas_production_kardex_entries.findIndex(e => e.entry_id === entryId);
    if (idx === -1) return false;

    const entry = state.gas_production_kardex_entries[idx];
    entry.is_deleted = false;
    entry.deleted_at = undefined;
    entry.deleted_by = undefined;
    entry.delete_reason = undefined;
    entry.updated_at = new Date().toISOString();

    this.saveState(env, state);

    this.recordLocalChange(
      env,
      currentUser.user_id,
      'GAS_PRODUCTION_KARDEX',
      'UPDATE',
      entry.entry_id,
      entry,
      `بازیابی سند کاردکس تولید ${entry.cylinder_type} شماره برگه ${entry.transfer_sheet_number} از سطل آشغال`
    );

    return true;
  }

  /**
   * Permanently deletes a production kardex entry from database
   */
  static permanentlyDeleteProductionKardexEntry(
    env: RuntimeEnvironment,
    entryId: string,
    currentUser: User
  ): boolean {
    const state = this.getState(env);
    this.ensureProductionKardexLoaded(state);
    if (!state.gas_production_kardex_entries) return false;

    const entry = state.gas_production_kardex_entries.find(e => e.entry_id === entryId);
    state.gas_production_kardex_entries = state.gas_production_kardex_entries.filter(e => e.entry_id !== entryId);
    this.saveState(env, state);

    this.recordLocalChange(
      env,
      currentUser.user_id,
      'GAS_PRODUCTION_KARDEX',
      'DELETE',
      entryId,
      { entry_id: entryId },
      `حذف دائمی سند کاردکس تولید شماره برگه ${entry?.transfer_sheet_number || entryId}`
    );

    return true;
  }

  /**
   * Automatically deducts matched valves and nuts from production line warehouse (انبار خط تولید - WH-PRODUCTION)
   * Triggered when a manufacturing order is completed/delivered.
   */
  static deductProductionParts(
    env: RuntimeEnvironment,
    params: {
      valveType: string;
      valveType2?: string;
      nutType: string;
      nutType2?: string;
      quantity: number;
      orderSheetNumber: string;
      deliverySheetNumber: string;
      customerName: string;
      cylinderType: string;
      actorUser: User;
    }
  ): { success: boolean; valveMovement?: StockMovement; nutMovement?: StockMovement; valveMovements?: StockMovement[]; nutMovements?: StockMovement[] } {
    const state = this.getState(env);
    if (!state.stock_movements) state.stock_movements = [];
    if (!state.products) state.products = [];

    // 1. Locate Production Line Warehouse (WH-PRODUCTION / WH-04 / انبار خط تولید)
    let prodWarehouse = state.warehouses.find(
      w => w.warehouse_id === 'WH-PRODUCTION' || w.code === 'WH-04' || w.name.includes('خط تولید')
    );
    if (!prodWarehouse) {
      prodWarehouse = {
        warehouse_id: 'WH-PRODUCTION',
        name: 'انبار خط تولید',
        code: 'WH-04',
        address: 'سالن اصلی تولید و مونتاژ - انبار پای خط تولید',
        shelf_location: 'D1',
        shelf_letter: 'D',
        shelf_number: 1,
        is_active: true
      };
      state.warehouses.push(prodWarehouse);
    }

    const cleanQty = Math.max(1, Number(params.quantity) || 1);
    const nowIso = new Date().toISOString();
    const isForklift = params.cylinderType === 'سیلندر لیفتراکی' || params.cylinderType.includes('لیفتراک');

    // Collect valves to deduct (1 or 2)
    const valvesToDeduct: Array<{ type: string; label: string }> = [];
    const cleanValve1 = (params.valveType || '').trim();
    if (cleanValve1 !== '' && cleanValve1 !== 'بدون شیر' && !cleanValve1.startsWith('بدون')) {
      valvesToDeduct.push({ type: cleanValve1, label: isForklift ? 'شیر اول (مایع/اصلی)' : 'شیر' });
    }
    const cleanValve2 = (params.valveType2 || (isForklift ? params.valveType : '') || '').trim();
    if (isForklift || (params.valveType2 && params.valveType2.trim())) {
      if (cleanValve2 !== '' && cleanValve2 !== 'بدون شیر' && !cleanValve2.startsWith('بدون')) {
        valvesToDeduct.push({ type: cleanValve2, label: 'شیر دوم (بخار/کمکی)' });
      }
    }

    // Collect nuts to deduct (1 or 2)
    const nutsToDeduct: Array<{ type: string; label: string }> = [];
    const cleanNut1 = (params.nutType || '').trim();
    if (cleanNut1 !== '' && cleanNut1 !== 'بدون مهره' && !cleanNut1.startsWith('بدون')) {
      nutsToDeduct.push({ type: cleanNut1, label: isForklift ? 'مهره اول' : 'مهره' });
    }
    const cleanNut2 = (params.nutType2 || (isForklift ? params.nutType : '') || '').trim();
    if (isForklift || (params.nutType2 && params.nutType2.trim())) {
      if (cleanNut2 !== '' && cleanNut2 !== 'بدون مهره' && !cleanNut2.startsWith('بدون')) {
        nutsToDeduct.push({ type: cleanNut2, label: 'مهره دوم' });
      }
    }

    const valveMovements: StockMovement[] = [];
    const nutMovements: StockMovement[] = [];

    // 2. Deduct all valves from WH-PRODUCTION
    for (const vItem of valvesToDeduct) {
      const vName = vItem.type;
      let valveProduct = state.products.find(
        p => p.name.trim().toLowerCase() === `قطعه ${vName}`.toLowerCase() ||
             p.name.trim().toLowerCase() === vName.toLowerCase() ||
             (vName.includes('نو') && p.product_id === 'PRD-VALVE-NEW')
      );
      if (!valveProduct) {
        valveProduct = {
          product_id: `PRD-VLV-${Math.floor(1000 + Math.random() * 9000)}`,
          sku: `VLV-${Math.floor(100 + Math.random() * 900)}`,
          name: `قطعه شیر (${vName})`,
          category_id: 'CAT-02',
          unit: 'عدد',
          min_stock: 50,
          purchase_price: 1850000,
          sale_price: 2400000,
          barcode: `626088${Math.floor(1000000 + Math.random() * 9000000)}`,
          description: `قطعه شیر صنعتی مصرفی خط تولید: ${vName}`,
          created_at: nowIso,
          updated_at: nowIso
        };
        state.products.push(valveProduct);
      }

      const valveMovementId = generateUUID('MOV');
      const movement: StockMovement = {
        movement_id: valveMovementId,
        product_id: valveProduct.product_id,
        warehouse_id: prodWarehouse.warehouse_id,
        shelf_location: prodWarehouse.shelf_location || 'D1',
        quantity: cleanQty,
        movement_type: 'STOCK_OUT',
        reference_id: params.deliverySheetNumber,
        document_number: `حواله مصرف خط تولید ${params.deliverySheetNumber}`,
        description: `کسر اتوماتیک قطعه ${vItem.label} (${vName}) بابت تکمیل و تحویل ${cleanQty} عدد ${params.cylinderType} به ${params.customerName}`,
        notes: `کسر از ${prodWarehouse.name} | سفارش مبدأ: ${params.orderSheetNumber} | حواله تحویل: ${params.deliverySheetNumber}`,
        user_id: params.actorUser.user_id,
        created_by_username: params.actorUser.username,
        device_id: params.actorUser.allowed_device_id || state.deviceId,
        event_id: generateUUID('EVT'),
        created_at: nowIso
      };
      state.stock_movements.unshift(movement);
      valveMovements.push(movement);

      this.recordLocalChange(
        env,
        params.actorUser.user_id,
        'STOCK_MOVEMENT',
        'CREATE',
        valveMovementId,
        movement,
        `کسر ${cleanQty} عدد ${valveProduct.name} (${vItem.label}) از ${prodWarehouse.name} بابت حواله ${params.deliverySheetNumber}`,
        { warehouse: prodWarehouse.name, product: valveProduct.name, quantity: cleanQty, label: vItem.label }
      );
    }

    // 3. Deduct all nuts from WH-PRODUCTION (Strictly CAT-NUTS)
    for (const nItem of nutsToDeduct) {
      const nName = nItem.type;
      let nutProduct = state.products.find(
        p => (p.category_id === 'CAT-NUTS' || p.category_id?.includes('NUT')) &&
             (p.name.trim().toLowerCase() === nName.toLowerCase() ||
              p.name.trim().toLowerCase() === `قطعه ${nName}`.toLowerCase() ||
              p.name.includes(nName))
      ) || state.products.find(
        p => p.name.trim().toLowerCase() === `قطعه ${nName}`.toLowerCase() ||
             p.name.trim().toLowerCase() === nName.toLowerCase() ||
             p.name.includes(nName)
      );
      if (!nutProduct) {
        nutProduct = {
          product_id: `PRD-NUT-${Math.floor(1000 + Math.random() * 9000)}`,
          sku: `NUT-${Math.floor(100 + Math.random() * 900)}`,
          name: nName.startsWith('مهره') ? nName : `مهره ${nName}`,
          category_id: 'CAT-NUTS',
          unit: 'عدد',
          min_stock: 50,
          purchase_price: 280000,
          sale_price: 390000,
          barcode: `626089${Math.floor(1000000 + Math.random() * 9000000)}`,
          description: `قطعه مهره اتصال خط تولید مخزن و سیلندر: ${nName}`,
          created_at: nowIso,
          updated_at: nowIso
        };
        state.products.push(nutProduct);
      }

      const nutMovementId = generateUUID('MOV');
      const movement: StockMovement = {
        movement_id: nutMovementId,
        product_id: nutProduct.product_id,
        warehouse_id: prodWarehouse.warehouse_id,
        shelf_location: prodWarehouse.shelf_location || 'D1',
        quantity: cleanQty,
        movement_type: 'STOCK_OUT',
        reference_id: params.deliverySheetNumber,
        document_number: `حواله مصرف خط تولید ${params.deliverySheetNumber}`,
        description: `کسر اتوماتیک قطعه ${nItem.label} (${nName}) بابت تکمیل و تحویل ${cleanQty} عدد ${params.cylinderType} به ${params.customerName}`,
        notes: `کسر از ${prodWarehouse.name} | سفارش مبدأ: ${params.orderSheetNumber} | حواله تحویل: ${params.deliverySheetNumber}`,
        user_id: params.actorUser.user_id,
        created_by_username: params.actorUser.username,
        device_id: params.actorUser.allowed_device_id || state.deviceId,
        event_id: generateUUID('EVT'),
        created_at: nowIso
      };
      state.stock_movements.unshift(movement);
      nutMovements.push(movement);

      this.recordLocalChange(
        env,
        params.actorUser.user_id,
        'STOCK_MOVEMENT',
        'CREATE',
        nutMovementId,
        movement,
        `کسر ${cleanQty} عدد ${nutProduct.name} (${nItem.label}) از ${prodWarehouse.name} بابت حواله ${params.deliverySheetNumber}`,
        { warehouse: prodWarehouse.name, product: nutProduct.name, quantity: cleanQty, label: nItem.label }
      );
    }

    this.saveState(env, state);

    try {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('mgas:stock_movement_created', { detail: { valveMovements, nutMovements } }));
        window.dispatchEvent(new CustomEvent('mgas:db_refreshed', { detail: { env } }));
      }
    } catch {}

    return {
      success: true,
      valveMovement: valveMovements[0],
      nutMovement: nutMovements[0],
      valveMovements,
      nutMovements
    };
  }

  /**
   * Empties all trashed production kardex entries permanently
   */
  static emptyProductionKardexTrash(
    env: RuntimeEnvironment,
    currentUser: User
  ): boolean {
    const state = this.getState(env);
    this.ensureProductionKardexLoaded(state);
    if (!state.gas_production_kardex_entries) return false;

    state.gas_production_kardex_entries = state.gas_production_kardex_entries.filter(e => !e.is_deleted);
    this.saveState(env, state);

    this.recordLocalChange(
      env,
      currentUser.user_id,
      'GAS_PRODUCTION_KARDEX',
      'DELETE',
      'TRASH_ALL',
      {},
      'تخلیه کامل سطل آشغال کاردکس تولید ام‌گاز'
    );

    return true;
  }

  /**
   * Returns current warehouse stock of "قطعه شیر نو" across all warehouses
   */
  static getNewValveWarehouseStock(env: RuntimeEnvironment): number {
    const state = this.getState(env);
    this.ensureValveProductsExist(state);

    const newValveProductIds = new Set(
      state.products
        .filter(p => p.product_id === 'PRD-VALVE-NEW' || p.name.includes('شیر نو') || p.sku.includes('VALVE-NEW'))
        .map(p => p.product_id)
    );
    newValveProductIds.add('PRD-VALVE-NEW');

    let total = 0;
    for (const mov of state.stock_movements || []) {
      const isNewValve =
        newValveProductIds.has(mov.product_id) ||
        mov.product_id.includes('VALVE-NEW') ||
        mov.product_id.includes('VLV-11N') ||
        mov.product_id.includes('VLV-PK') ||
        (mov.description && mov.description.includes('شیر نو')) ||
        (mov.notes && mov.notes.includes('شیر نو'));

      if (isNewValve) {
        const qty = Number(mov.quantity) || 0;
        if (mov.movement_type === 'STOCK_IN' || mov.movement_type === 'PURCHASE' || mov.movement_type === 'RETURN_IN') {
          total += qty;
        } else if (mov.movement_type === 'STOCK_OUT' || mov.movement_type === 'SALE' || mov.movement_type === 'RETURN_OUT') {
          total -= qty;
        }
      }
    }
    return Math.max(0, total);
  }

  /**
   * Executes an atomic inter-warehouse transfer (جابجایی بین انبارها)
   * Updates both source and destination warehouses:
   * - Source warehouse loses the quantity of the product
   * - Destination warehouse receives the quantity
   * - If product is a new valve and marked DEFECTIVE (شیر نو که قبلا به انبار دیگر رفته و حالا برگشته معیوب شده):
   *   Destination warehouse receives it as "قطعه شیر معیوب و ضایعات" (PRD-VALVE-DEFECTIVE)
   * - If product is marked HEALTHY (شیر سالم است):
   *   Destination warehouse receives it as the original product (e.g. "قطعه شیر نو")
   */
  static executeWarehouseTransfer(
    env: RuntimeEnvironment,
    user: User,
    params: {
      productId: string;
      sourceWarehouseId: string;
      destWarehouseId: string;
      quantity: number;
      referenceId: string;
      notes?: string;
      valveCondition?: 'HEALTHY' | 'DEFECTIVE';
      sourceShelfLetter?: string;
      sourceShelfNumber?: number;
      destShelfLetter?: string;
      destShelfNumber?: number;
    }
  ): { outMovement: StockMovement; inMovement: StockMovement } {
    if (!params.sourceWarehouseId || !params.destWarehouseId) {
      throw new Error('لطفاً انبار مبدأ و انبار مقصد را مشخص نمایید.');
    }
    if (params.sourceWarehouseId === params.destWarehouseId) {
      throw new Error('انبار مبدأ و انبار مقصد نمی‌توانند یکسان باشند. لطفاً انبار مقصد متفاوتی را انتخاب نمایید.');
    }
    const cleanQty = Number(params.quantity);
    if (isNaN(cleanQty) || cleanQty <= 0) {
      throw new Error('مقدار جابجایی باید عددی معتبر و بزرگتر از صفر باشد.');
    }

    const state = this.getState(env);
    this.ensureValveProductsExist(state);

    const sourceProd = state.products.find(p => p.product_id === params.productId);
    if (!sourceProd) {
      throw new Error('کالای مورد نظر در کاتالوگ محصولات یافت نشد.');
    }

    const sourceWh = state.warehouses.find(w => w.warehouse_id === params.sourceWarehouseId);
    const destWh = state.warehouses.find(w => w.warehouse_id === params.destWarehouseId);

    const sourceWhName = sourceWh?.name || params.sourceWarehouseId;
    const destWhName = destWh?.name || params.destWarehouseId;

    const isValve =
      params.productId === 'PRD-VALVE-NEW' ||
      params.productId.includes('VALVE') ||
      sourceProd.name.includes('شیر') ||
      sourceProd.category_id === 'CAT-02';

    const condition = params.valveCondition || 'HEALTHY';
    const isDefectiveReturnedValve = isValve && condition === 'DEFECTIVE';

    // Target product in destination warehouse
    let destProductId = params.productId;
    let destProdName = sourceProd.name;

    if (isDefectiveReturnedValve) {
      let defProd = state.products.find(
        p => p.product_id === 'PRD-VALVE-DEFECTIVE' || p.sku === 'VALVE-DEFECTIVE' || p.name.includes('معیوب')
      );
      if (!defProd) {
        defProd = {
          product_id: 'PRD-VALVE-DEFECTIVE',
          sku: 'VALVE-DEFECTIVE',
          name: 'قطعه شیر معیوب و ضایعات',
          category_id: 'CAT-02',
          unit: 'عدد',
          min_stock: 0,
          purchase_price: 300000,
          sale_price: 450000,
          barcode: '6260881001003',
          description: 'قطعه شیر معیوب، خراب یا اسقاطی برگشتی از سایر انبارها',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        state.products.push(defProd);
      }
      destProductId = defProd.product_id;
      destProdName = defProd.name;
    }

    const sourceShelf = params.sourceShelfLetter && params.sourceShelfNumber
      ? `${params.sourceShelfLetter.toUpperCase()}${params.sourceShelfNumber}`
      : sourceWh?.shelf_location || 'A1';

    const destShelf = params.destShelfLetter && params.destShelfNumber
      ? `${params.destShelfLetter.toUpperCase()}${params.destShelfNumber}`
      : destWh?.shelf_location || 'B1';

    const cleanRef = (params.referenceId || '').trim() || `TRF-${Date.now().toString().slice(-6)}`;
    const nowIso = new Date().toISOString();

    const conditionLabel = condition === 'DEFECTIVE'
      ? 'معیوب شده (اسقاط/ضایعات)'
      : 'سالم و نو (قابل استفاده)';

    const outMovId = generateUUID('MOV');
    const outMovement: StockMovement = {
      movement_id: outMovId,
      product_id: params.productId,
      warehouse_id: params.sourceWarehouseId,
      to_warehouse_id: params.destWarehouseId,
      destination_warehouse_id: params.destWarehouseId,
      shelf_location: sourceShelf,
      quantity: cleanQty,
      movement_type: 'TRANSFER_OUT',
      item_condition: condition,
      reference_id: cleanRef,
      unit_price: sourceProd.purchase_price || 0,
      user_id: user.user_id,
      created_by_username: user.username,
      device_id: user.allowed_device_id || state.deviceId,
      event_id: generateUUID('EVT'),
      notes: `حواله خروج انتقال از [${sourceWhName}] به انبار [${destWhName}] - وضعیت شیر برگشتی: ${conditionLabel}${params.notes ? ` - ${params.notes}` : ''}`,
      created_at: nowIso
    };

    const inMovId = generateUUID('MOV');
    const inMovement: StockMovement = {
      movement_id: inMovId,
      product_id: destProductId,
      warehouse_id: params.destWarehouseId,
      to_warehouse_id: params.sourceWarehouseId,
      destination_warehouse_id: params.destWarehouseId,
      shelf_location: destShelf,
      quantity: cleanQty,
      movement_type: 'TRANSFER_IN',
      item_condition: condition,
      reference_id: cleanRef,
      unit_price: sourceProd.purchase_price || 0,
      user_id: user.user_id,
      created_by_username: user.username,
      device_id: user.allowed_device_id || state.deviceId,
      event_id: generateUUID('EVT'),
      notes: `رسید ورود انتقال در [${destWhName}] از مبدأ [${sourceWhName}] - وضعیت شیر: ${conditionLabel} (ثبت به عنوان: ${destProdName})${params.notes ? ` - ${params.notes}` : ''}`,
      created_at: nowIso
    };

    // Update shelves if custom selected
    if (params.sourceShelfLetter && params.sourceShelfNumber) {
      this.updateWarehouseShelf(env, params.sourceWarehouseId, params.sourceShelfLetter, params.sourceShelfNumber);
    }
    if (params.destShelfLetter && params.destShelfNumber) {
      this.updateWarehouseShelf(env, params.destWarehouseId, params.destShelfLetter, params.destShelfNumber);
    }

    // Record both sync events
    this.recordLocalChange(
      env,
      user.user_id,
      'STOCK_MOVEMENT',
      'CREATE',
      outMovId,
      outMovement,
      `حواله خروج انتقال بین انبارها: ${cleanQty} عدد ${sourceProd.name} از ${sourceWhName} به ${destWhName} (${conditionLabel})`,
      { source_warehouse: sourceWhName, dest_warehouse: destWhName, quantity: cleanQty, condition }
    );

    this.recordLocalChange(
      env,
      user.user_id,
      'STOCK_MOVEMENT',
      'CREATE',
      inMovId,
      inMovement,
      `رسید ورود انتقال بین انبارها: ${cleanQty} عدد ${destProdName} در ${destWhName} از ${sourceWhName} (${conditionLabel})`,
      { source_warehouse: sourceWhName, dest_warehouse: destWhName, quantity: cleanQty, condition }
    );

    try {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('mgas:stock_movement_created', { detail: { outMovement, inMovement } }));
      }
    } catch {}

    return { outMovement, inMovement };
  }

  // ATOMIC EVENT CREATION:
  // Creates a business record, immutable sync_event, and inserts into local sync_queue
  static recordLocalChange(
    env: RuntimeEnvironment,
    userId: string,
    entityType: EntityType,
    eventType: EventType,
    entityId: string,
    payload: any,
    auditAction: string,
    auditMetadata?: Record<string, any>
  ): SyncEvent {
    const state = this.getState(env);
    const eventId = generateUUID('EVT');
    const now = new Date().toISOString();

    // Strict Architectural Rule: Hajivand (Warehouse Keeper) is strictly forbidden from touching GAS_KARDEX!
    // "ثبت کاردکس برای کاربر حاجی وند در دسترس نباشد" - "کاربر حاجی وند خودش نمیتواند کاردکس را بزند"
    if (entityType === 'GAS_KARDEX') {
      const actor = this.getUserById(env, userId);
      if (actor && (actor.role === 'WAREHOUSE_KEEPER' || actor.username === 'hajivand' || actor.username === 'gholizadeh' || userId === 'USR-003')) {
        throw new Error('خطای عدم دسترسی: طبق معماری جدید سامانه، انباردار (مهندس حاجی‌وند) مجاز به ثبت کاردکس نمی‌باشد. لطفاً اقلام را در بخش «ورودی شیر و سیلندر» ثبت فرمایید.');
      }
    }

    // Strict Document Access Control for Internal Manager (Mrs. Karami):
    // Transactional documents (GOODS_RECEIPT, GAS_KARDEX, INVOICE) can ONLY be edited within 1 hour of creation!
    // Master catalog entities (PRODUCT, CATEGORY) are master data and permitted for active sessions.
    if (eventType === 'UPDATE' || eventType === 'DELETE') {
      const isTransactionalDocument =
        entityType === 'GOODS_RECEIPT' ||
        entityType === 'GAS_KARDEX' ||
        entityType === 'INVOICE' ||
        entityType === 'STOCK_MOVEMENT' ||
        entityType === 'CYLINDER_VALVE_INSPECTION' ||
        entityType === 'CUSTOMER' ||
        entityType === 'SUPPLIER';

      const actor = this.getUserById(env, userId);
      if (actor && (actor.role === 'INTERNAL_MANAGER' || actor.username === 'karami')) {
        let docCreatedAt: string | undefined;
        if (entityType === 'GOODS_RECEIPT') {
          docCreatedAt = state.goods_receipts?.find(r => r.receipt_id === entityId)?.created_at;
        } else if (entityType === 'GAS_KARDEX') {
          docCreatedAt = state.gas_kardex_entries?.find(k => k.entry_id === entityId)?.created_at;
        } else if (entityType === 'INVOICE') {
          docCreatedAt = state.invoices?.find(i => i.invoice_id === entityId)?.created_at;
        } else if (entityType === 'STOCK_MOVEMENT') {
          docCreatedAt = state.stock_movements?.find(m => m.movement_id === entityId)?.created_at;
        } else if (entityType === 'CYLINDER_VALVE_INSPECTION') {
          docCreatedAt = state.cylinder_valve_inspections?.find(c => c.inspection_id === entityId)?.created_at;
        } else if (entityType === 'CUSTOMER') {
          docCreatedAt = state.customers?.find(c => c.customer_id === entityId)?.created_at;
        } else if (entityType === 'SUPPLIER') {
          docCreatedAt = state.suppliers?.find(s => s.supplier_id === entityId)?.created_at;
        }

        const check = this.checkDocumentEditPermission(
          env,
          actor,
          isTransactionalDocument ? docCreatedAt : undefined
        );
        if (!check.allowed) {
          state.audit_logs.unshift({
            audit_id: generateUUID('AUD-SEC'),
            user_id: userId,
            device_id: state.deviceId,
            action: 'INTERNAL_MANAGER_EDIT_BLOCKED_POLICY',
            entity_type: entityType,
            entity_id: entityId,
            timestamp: now,
            metadata: {
              reason: check.reason,
              restrictionType: check.restrictionType,
              document_created_at: docCreatedAt,
              attempted_action: auditAction
            }
          });
          this.saveState(env, state);
          throw new Error(check.reason || 'ویرایش سند توسط مدیر داخلی به دلیل محدودیت ۱ ساعته مسدود شد.');
        }
      }
    }

    const syncEvent: SyncEvent = {
      event_id: eventId,
      user_id: userId,
      device_id: state.deviceId,
      event_type: eventType,
      entity_type: entityType,
      entity_id: entityId,
      payload,
      client_created_at: now,
      schema_version: 1
    };

    // Apply change to local tables
    this.applyPayloadToLocalState(state, syncEvent);

    // Add to local sync_events ledger
    state.sync_events.push(syncEvent);

    // Queue for sync to Central API
    const queueItem: SyncQueueItem = {
      event_id: eventId,
      status: 'PENDING',
      retry_count: 0,
      created_at: now,
      event: syncEvent
    };
    state.sync_queue.push(queueItem);
    state.sync_state.pending_events_count = state.sync_queue.filter(q => q.status === 'PENDING').length;

    // Audit log
    state.audit_logs.unshift({
      audit_id: generateUUID('AUD'),
      user_id: userId,
      device_id: state.deviceId,
      action: auditAction,
      entity_type: entityType,
      entity_id: entityId,
      event_id: eventId,
      timestamp: now,
      metadata: auditMetadata
    });

    this.saveState(env, state);

    // Synchronize the change across the other local environment states on this client
    const allEnvs: RuntimeEnvironment[] = ['OFFICE_WIN11', 'WAREHOUSE_WIN7', 'CLOUD_WEB'];
    for (const targetEnv of allEnvs) {
      if (targetEnv !== env) {
        try {
          const otherState = this.getState(targetEnv);
          const exists = otherState.sync_events.some(e => e.event_id === syncEvent.event_id);
          if (!exists) {
            this.applyPayloadToLocalState(otherState, syncEvent);
            otherState.sync_events.push(syncEvent);
            this.saveState(targetEnv, otherState);
          }
        } catch {}
      }
    }

    // If running in real desktop environment, persist to SQLite directly
    if (typeof window !== 'undefined' && window.desktopAPI?.isDesktop) {
      window.desktopAPI.recordLocalEvent(syncEvent).catch(err => {
        console.warn('[Desktop SQLite Bridge Warning]', err);
      });
    }

    // Trigger immediate real-time upload to central database (<100ms)
    try {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('mgas:local_change_queued', { detail: { env, event: syncEvent } }));
      }
    } catch {}

    return syncEvent;
  }

  // Internal helper to apply entity mutations locally
  static applyPayloadToLocalState(state: LocalDatabaseState, event: SyncEvent) {
    const payload = event.payload;
    if (!payload && event.event_type !== 'DELETE') return;

    // Tombstone Protection: If entity was deleted forever, reject any recreate/resurrection event
    const targetEntityId = event.entity_id || (payload as any)?.entry_id || (payload as any)?.inspection_id || (payload as any)?.receipt_id || (payload as any)?.invoice_id;
    if (event.event_type !== 'DELETE' && this.isEntityPermanentlyDeleted(targetEntityId)) {
      return;
    }

    switch (event.entity_type) {
      case 'STOCK_MOVEMENT': {
        const mov = payload as StockMovement;
        if (mov) mov.event_id = event.event_id;
        const targetId = mov?.movement_id || event.entity_id;
        const idx = state.stock_movements.findIndex(m => m.movement_id === targetId);
        if (event.event_type === 'DELETE') {
          if (idx >= 0) state.stock_movements.splice(idx, 1);
        } else if (idx >= 0) {
          state.stock_movements[idx] = { ...state.stock_movements[idx], ...mov };
        } else if (mov) {
          state.stock_movements.push(mov);
        }
        break;
      }
      case 'PRODUCT': {
        const prod = payload as Product;
        const targetId = prod?.product_id || event.entity_id;
        const idx = state.products.findIndex(p => p.product_id === targetId || (prod?.sku && p.sku === prod.sku));
        if (event.event_type === 'DELETE') {
          if (idx >= 0) state.products.splice(idx, 1);
        } else if (idx >= 0) {
          state.products[idx] = { ...state.products[idx], ...prod, user_edited: true, updated_at: new Date().toISOString() };
        } else if (prod) {
          state.products.push({ ...prod, user_edited: true });
        }
        break;
      }
      case 'CUSTOMER': {
        const cust = payload as Customer;
        const targetId = cust?.customer_id || event.entity_id;
        const idx = state.customers.findIndex(c => c.customer_id === targetId);
        if (event.event_type === 'DELETE') {
          if (idx >= 0) state.customers.splice(idx, 1);
        } else if (idx >= 0) {
          state.customers[idx] = { ...state.customers[idx], ...cust, updated_at: new Date().toISOString() };
        } else if (cust) {
          state.customers.push(cust);
        }
        break;
      }
      case 'CATEGORY': {
        const cat = payload as Category;
        if (!state.categories) state.categories = [];
        const targetId = cat?.category_id || event.entity_id;
        const idx = state.categories.findIndex(c => c.category_id === targetId);
        if (event.event_type === 'DELETE') {
          if (idx >= 0) state.categories.splice(idx, 1);
        } else if (idx >= 0) {
          state.categories[idx] = { ...state.categories[idx], ...cat, updated_at: new Date().toISOString() };
        } else if (cat) {
          state.categories.push(cat);
        }
        break;
      }
      case 'SUPPLIER': {
        const sup = payload as Supplier;
        const targetId = sup?.supplier_id || event.entity_id;
        const idx = state.suppliers.findIndex(s => s.supplier_id === targetId);
        if (event.event_type === 'DELETE') {
          if (idx >= 0) state.suppliers.splice(idx, 1);
        } else if (idx >= 0) {
          state.suppliers[idx] = { ...state.suppliers[idx], ...sup, updated_at: new Date().toISOString() };
        } else if (sup) {
          state.suppliers.push(sup);
        }
        break;
      }
      case 'SALE': {
        const sale = payload as Sale;
        const targetId = sale?.sale_id || event.entity_id;
        const idx = state.sales.findIndex(s => s.sale_id === targetId);
        if (event.event_type === 'DELETE') {
          if (idx >= 0) state.sales.splice(idx, 1);
        } else if (idx >= 0) {
          state.sales[idx] = { ...state.sales[idx], ...sale };
        } else if (sale) {
          state.sales.push(sale);
        }
        break;
      }
      case 'PURCHASE': {
        const pur = payload as Purchase;
        const targetId = pur?.purchase_id || event.entity_id;
        const idx = state.purchases.findIndex(p => p.purchase_id === targetId);
        if (event.event_type === 'DELETE') {
          if (idx >= 0) state.purchases.splice(idx, 1);
        } else if (idx >= 0) {
          state.purchases[idx] = { ...state.purchases[idx], ...pur };
        } else if (pur) {
          state.purchases.push(pur);
        }
        break;
      }
      case 'INVOICE': {
        const inv = payload as Invoice;
        if (!state.invoices) state.invoices = [];
        const targetId = inv?.invoice_id || event.entity_id;
        const idx = state.invoices.findIndex(i => i.invoice_id === targetId);
        if (event.event_type === 'DELETE') {
          if (idx >= 0) state.invoices.splice(idx, 1);
        } else if (idx >= 0) {
          state.invoices[idx] = { ...state.invoices[idx], ...inv, updated_at: new Date().toISOString() };
        } else if (inv) {
          state.invoices.push(inv);
        }
        break;
      }
      case 'USER': {
        const u = payload as User;
        if (!state.users) state.users = [];
        const targetId = u?.user_id || event.entity_id;
        const targetUsername = u?.username?.toLowerCase();
        const idx = state.users.findIndex(item =>
          item.user_id === targetId ||
          (targetUsername && item.username?.toLowerCase() === targetUsername)
        );
        if (event.event_type === 'DELETE') {
          if (idx >= 0) state.users.splice(idx, 1);
        } else if (idx >= 0) {
          state.users[idx] = { ...state.users[idx], ...u };
        } else if (u) {
          state.users.push(u);
        }
        try {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('mgas:users_updated', { detail: { targetUserId: targetId, updatedUser: u } }));
          }
        } catch {}
        break;
      }
      case 'GAS_KARDEX': {
        const gk = payload as GasKardexEntry;
        if (!state.gas_kardex_entries) state.gas_kardex_entries = [];
        const targetId = gk?.entry_id || event.entity_id;
        const idx = state.gas_kardex_entries.findIndex(k => k.entry_id === targetId);
        if (event.event_type === 'DELETE') {
          if (idx >= 0) state.gas_kardex_entries = state.gas_kardex_entries.filter(k => k.entry_id !== targetId);
        } else if (idx >= 0) {
          state.gas_kardex_entries = state.gas_kardex_entries.map(k => k.entry_id === targetId ? { ...k, ...gk, updated_at: new Date().toISOString() } : k);
        } else if (gk) {
          state.gas_kardex_entries = [gk, ...state.gas_kardex_entries];
        }
        // Recalculate running balances for this customer's entries partitioned by cylinder type
        const custId = gk?.customer_id || (idx >= 0 ? state.gas_kardex_entries[idx]?.customer_id : undefined);
        if (custId) {
          LocalStorageManager.recalculateCustomerKardex(state, custId);
        }
        break;
      }
      case 'GOODS_RECEIPT': {
        const rc = payload as GoodsReceiptRecord;
        if (!state.goods_receipts) state.goods_receipts = [];
        const targetId = rc?.receipt_id || event.entity_id;
        const idx = state.goods_receipts.findIndex(r => r.receipt_id === targetId);
        if (event.event_type === 'DELETE') {
          if (idx >= 0) state.goods_receipts = state.goods_receipts.filter(r => r.receipt_id !== targetId);
        } else if (idx >= 0) {
          state.goods_receipts = state.goods_receipts.map(r => r.receipt_id === targetId ? { ...r, ...rc, updated_at: new Date().toISOString() } : r);
        } else if (rc) {
          state.goods_receipts = [rc, ...state.goods_receipts];
        }
        break;
      }
      case 'CYLINDER_VALVE_INSPECTION': {
        const insp = payload as CylinderValveInspection;
        if (!state.cylinder_valve_inspections) state.cylinder_valve_inspections = [];
        const targetId = insp?.inspection_id || event.entity_id;
        const idx = state.cylinder_valve_inspections.findIndex(i => i.inspection_id === targetId);
        if (event.event_type === 'DELETE') {
          if (idx >= 0) state.cylinder_valve_inspections = state.cylinder_valve_inspections.filter(i => i.inspection_id !== targetId);
        } else if (idx >= 0) {
          const updatedInsp = { ...state.cylinder_valve_inspections[idx], ...insp, updated_at: new Date().toISOString() };
          state.cylinder_valve_inspections = state.cylinder_valve_inspections.map(i => i.inspection_id === targetId ? updatedInsp : i);
          this.syncInspectionToWarehouseAndInventory(state, updatedInsp, insp?.inspector_user_id || 'USR-003');
        } else if (insp) {
          state.cylinder_valve_inspections = [insp, ...state.cylinder_valve_inspections];
          this.syncInspectionToWarehouseAndInventory(state, insp, insp.inspector_user_id || 'USR-003');
        }
        break;
      }
      case 'GAS_PRODUCTION_KARDEX': {
        const pk = payload as GasProductionKardexEntry;
        if (!state.gas_production_kardex_entries) state.gas_production_kardex_entries = [];
        const targetId = pk?.entry_id || event.entity_id;
        const idx = state.gas_production_kardex_entries.findIndex(k => k.entry_id === targetId);
        if (event.event_type === 'DELETE') {
          if (idx >= 0) state.gas_production_kardex_entries = state.gas_production_kardex_entries.filter(k => k.entry_id !== targetId);
        } else if (idx >= 0) {
          state.gas_production_kardex_entries = state.gas_production_kardex_entries.map(k => k.entry_id === targetId ? { ...k, ...pk, updated_at: new Date().toISOString() } : k);
        } else if (pk) {
          state.gas_production_kardex_entries.push(pk);
        }
        break;
      }
    }
  }

  /**
   * Recalculates running balances for a customer partitioned by cylinder type
   * Ensures each cylinder type (11kg, 25kg, 50kg, 22kg forklift) maintains its own independent kardex balance
   */
  static recalculateCustomerKardex(state: LocalDatabaseState, custId: string) {
    if (!state.gas_kardex_entries || !custId) return;
    const custEntries = state.gas_kardex_entries.filter(k => k.customer_id === custId && !k.is_deleted);
    const groups = new Map<string, GasKardexEntry[]>();
    custEntries.forEach(k => {
      let type = k.cylinder_type || 'سیلندر 11 کیلویی';
      if (type === 'سیلندر 8 لیتری') type = 'سیلندر 50 کیلویی';
      if (type === 'سیلندر 10 کیلویی') type = 'لیفتراکی 22 کیلویی';
      if (!groups.has(type)) groups.set(type, []);
      groups.get(type)!.push(k);
    });
    groups.forEach(groupEntries => {
      const recalculated = recalculateKardexBalances(
        [...groupEntries].sort((a, b) => (a.date || '').localeCompare(b.date || ''))
      );
      recalculated.forEach(rec => {
        const targetIndex = state.gas_kardex_entries.findIndex(e => e.entry_id === rec.entry_id);
        if (targetIndex >= 0) state.gas_kardex_entries[targetIndex] = rec;
      });
    });
  }

  // Goods Receipt Specific Helpers
  static saveGoodsReceipt(
    env: RuntimeEnvironment,
    receiptData: Omit<GoodsReceiptRecord, 'receipt_id' | 'created_at' | 'updated_at'> & { receipt_id?: string },
    userId: string = 'USR-001'
  ): GoodsReceiptRecord {
    const state = this.getState(env);
    if (!state.goods_receipts) state.goods_receipts = [];

    const now = new Date().toISOString();
    const existing = receiptData.receipt_id
      ? state.goods_receipts.find(r => r.receipt_id === receiptData.receipt_id)
      : receiptData.entry_id
      ? state.goods_receipts.find(r => r.entry_id === receiptData.entry_id && r.receipt_type === receiptData.receipt_type)
      : undefined;

    const receipt_id = existing ? existing.receipt_id : (receiptData.receipt_id || generateUUID('RCP'));
    const isNew = !existing;

    if (existing) {
      const actor = this.getUserById(env, userId);
      if (actor && (actor.role === 'INTERNAL_MANAGER' || actor.username === 'karami')) {
        const check = this.checkDocumentEditPermission(env, actor, existing.created_at);
        if (!check.allowed) {
          throw new Error(check.reason || 'ویرایش سند برگه کالا به دلیل انقضای مهلت ۱ ساعته مدیر داخلی مسدود است.');
        }
      }
    }

    const actorUser = this.getUserById(env, userId);
    const creatorUsername =
      receiptData.created_by_username ||
      actorUser?.username ||
      (userId === 'USR-002' ? 'karami' : userId === 'USR-003' ? 'hajivand' : 'amouei');

    const fullRecord: GoodsReceiptRecord = {
      ...receiptData,
      receipt_id,
      user_id: userId,
      created_by_username: existing?.created_by_username || creatorUsername,
      created_at: existing ? existing.created_at : now,
      updated_at: now
    };

    this.recordLocalChange(
      env,
      userId,
      'GOODS_RECEIPT',
      isNew ? 'CREATE' : 'UPDATE',
      receipt_id,
      fullRecord,
      isNew
        ? `ثبت سند برگه ${receiptData.receipt_type === 'ENTRY' ? 'ورود' : 'خروج'} کالا شماره ${receiptData.form_number}`
        : `ویرایش سند برگه ${receiptData.receipt_type === 'ENTRY' ? 'ورود' : 'خروج'} کالا شماره ${receiptData.form_number}`,
      { form_number: receiptData.form_number, receipt_type: receiptData.receipt_type, entry_id: receiptData.entry_id }
    );

    // Sync dispatched quantity and scrap_balance back to linked GasKardexEntry if present
    if (fullRecord.entry_id && (fullRecord.dispatched !== undefined || fullRecord.scrap_balance !== undefined)) {
      const kardexEntry = state.gas_kardex_entries?.find(e => e.entry_id === fullRecord.entry_id);
      if (kardexEntry) {
        if (fullRecord.dispatched !== undefined) {
          kardexEntry.dispatched = String(fullRecord.dispatched || '').trim();
        }
        if (fullRecord.scrap_balance !== undefined) {
          kardexEntry.scrap_balance = Number(fullRecord.scrap_balance) || 0;
        }
        kardexEntry.updated_at = now;
        this.recordLocalChange(
          env,
          userId,
          'GAS_KARDEX',
          'UPDATE',
          kardexEntry.entry_id,
          kardexEntry,
          `به‌روزرسانی ستون ارسالی (${kardexEntry.dispatched || '-'}) و مانده ضایعات (${kardexEntry.scrap_balance || 0}) کاردکس از برگه ${receiptData.receipt_type === 'ENTRY' ? 'ورود' : 'خروج'}`
        );
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('mgas:kardex_updated', { detail: kardexEntry }));
        }
      }
    }

    return fullRecord;
  }

  static getGoodsReceiptByEntryId(
    env: RuntimeEnvironment,
    entryId: string,
    receiptType?: GoodsReceiptType
  ): GoodsReceiptRecord | undefined {
    const state = this.getState(env);
    if (!state.goods_receipts) return undefined;
    return state.goods_receipts.find(r => {
      if (r.entry_id !== entryId) return false;
      if (receiptType && r.receipt_type !== receiptType) return false;
      return true;
    });
  }

  static getGoodsReceiptByFormNumber(
    env: RuntimeEnvironment,
    formNumber: string,
    receiptType?: GoodsReceiptType
  ): GoodsReceiptRecord | undefined {
    const state = this.getState(env);
    if (!state.goods_receipts) return undefined;
    return state.goods_receipts.find(r => {
      if (r.form_number !== formNumber) return false;
      if (receiptType && r.receipt_type !== receiptType) return false;
      return true;
    });
  }

  static getAllGoodsReceipts(env: RuntimeEnvironment, receiptType?: GoodsReceiptType): GoodsReceiptRecord[] {
    const state = this.getState(env);
    if (!state.goods_receipts) return [];
    if (receiptType) {
      return state.goods_receipts.filter(r => r.receipt_type === receiptType);
    }
    return [...state.goods_receipts];
  }

  static deleteGoodsReceipt(env: RuntimeEnvironment, receiptId: string, userId: string = 'USR-001') {
    this.recordLocalChange(
      env,
      userId,
      'GOODS_RECEIPT',
      'DELETE',
      receiptId,
      { receipt_id: receiptId },
      `حذف سند برگه با شناسه ${receiptId}`,
      { receipt_id: receiptId }
    );
  }

  // Cylinder & Valve Inspections Helpers (Hajivand Entry & Karami Kardex Workflow)
  static getCylinderValveInspections(env: RuntimeEnvironment): CylinderValveInspection[] {
    const state = this.getState(env);
    return state.cylinder_valve_inspections || SEED_CYLINDER_VALVE_INSPECTIONS;
  }

  static ensureInspectionProductExists(
    state: LocalDatabaseState,
    inspection: CylinderValveInspection
  ): Product | null {
    if (!state.products) state.products = [];
    const rawName = (inspection.item_name || '').trim();
    if (!rawName) return null;

    if (inspection.item_type === 'VALVE_NEW' || (rawName.includes('شیر') && rawName.includes('نو'))) {
      this.ensureValveProductsExist(state);
      return state.products.find(p => p.product_id === 'PRD-VALVE-NEW' || p.name.trim() === 'قطعه شیر نو') || null;
    }

    if (inspection.item_type === 'VALVE_USED' || (rawName.includes('شیر') && rawName.includes('کهنه'))) {
      this.ensureValveProductsExist(state);
      return state.products.find(p => p.product_id === 'PRD-VALVE-USED' || p.name.trim() === 'قطعه شیر کهنه') || null;
    }

    let product = state.products.find(
      p => p.name.trim().toLowerCase() === rawName.toLowerCase() || p.product_id === inspection.item_type
    );

    if (!product) {
      let categoryId = 'CAT-02';
      const lower = rawName.toLowerCase();
      if (lower.includes('سیلندر') || lower.includes('کپسول')) {
        categoryId = 'CAT-01';
      } else if (lower.includes('ضایعات') || lower.includes('اسقاط')) {
        categoryId = 'CAT-04';
      }

      product = {
        product_id: `PRD-${inspection.item_type && inspection.item_type.startsWith('PRD-') ? inspection.item_type : inspection.item_type ? `ITEM-${inspection.item_type}` : `AUTO-${Date.now()}`}`,
        sku: `GAS-${Math.floor(1000 + Math.random() * 9000)}`,
        name: rawName,
        category_id: categoryId,
        unit: 'عدد',
        min_stock: 20,
        purchase_price: 2500000,
        sale_price: 3200000,
        barcode: `626099${Math.floor(1000000 + Math.random() * 9000000)}`,
        description: `کالای ثبت‌شده به صورت خودکار از ورودی شیر و سیلندر (برگه ${inspection.form_number}) - طرف حساب: ${inspection.customer_name}`,
        created_at: inspection.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      state.products.push(product);
    }
    return product;
  }

  static syncInspectionToWarehouseAndInventory(
    state: LocalDatabaseState,
    inspection: CylinderValveInspection,
    userId: string = 'USR-003'
  ): StockMovement | null {
    if (!state.products) state.products = [];
    if (!state.stock_movements) state.stock_movements = [];
    if (!state.warehouses || state.warehouses.length === 0) {
      state.warehouses = JSON.parse(JSON.stringify(SEED_WAREHOUSES));
    }

    const defaultWarehouse = state.warehouses[0] || {
      warehouse_id: 'WH-001',
      name: 'انبار شیرآلات و اتصالات',
      code: 'WH-VALVES',
      address: 'تهران، جاده مخصوص کرج، کارخانه ام گاز',
      shelf_location: 'A1',
      is_active: true
    };

    const healthyQty = Number(inspection.actual_healthy_quantity) || 0;
    const rawName = (inspection.item_name || '').trim();
    if (!rawName) return null;

    // 1. Ensure product exists in product catalog (Inventory)
    let product: Product | undefined;
    if (inspection.item_type === 'VALVE_NEW' || (rawName.includes('شیر') && rawName.includes('نو'))) {
      this.ensureValveProductsExist(state);
      product = state.products.find(p => p.product_id === 'PRD-VALVE-NEW' || p.name.trim() === 'قطعه شیر نو');
    } else if (inspection.item_type === 'VALVE_USED' || (rawName.includes('شیر') && rawName.includes('کهنه'))) {
      this.ensureValveProductsExist(state);
      product = state.products.find(p => p.product_id === 'PRD-VALVE-USED' || p.name.trim() === 'قطعه شیر کهنه');
    } else {
      product = state.products.find(
        p => p.name.trim().toLowerCase() === rawName.toLowerCase() || p.product_id === inspection.item_type
      );
    }

    if (!product) {
      let categoryId = 'CAT-02';
      const lower = rawName.toLowerCase();
      if (lower.includes('سیلندر') || lower.includes('کپسول')) {
        categoryId = 'CAT-01';
      } else if (lower.includes('ضایعات') || lower.includes('اسقاط')) {
        categoryId = 'CAT-04';
      }

      product = {
        product_id: `PRD-${inspection.item_type && inspection.item_type.startsWith('PRD-') ? inspection.item_type : inspection.item_type ? `ITEM-${inspection.item_type}` : `AUTO-${Date.now()}`}`,
        sku: `GAS-${Math.floor(1000 + Math.random() * 9000)}`,
        name: rawName,
        category_id: categoryId,
        unit: 'عدد',
        min_stock: 20,
        purchase_price: 2500000,
        sale_price: 3200000,
        barcode: `626099${Math.floor(1000000 + Math.random() * 9000000)}`,
        description: `کالای ثبت‌شده به صورت خودکار از ورودی شیر و سیلندر (برگه ${inspection.form_number}) - طرف حساب: ${inspection.customer_name}`,
        created_at: inspection.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      state.products.push(product);
    }

    // 2. Ensure StockMovement exists in warehouse movements (Stock In / Out)
    const movementRef = inspection.form_number;
    const movementId = `MOV-INSP-${inspection.inspection_id}`;

    const existingMovIdx = state.stock_movements.findIndex(
      m => m.movement_id === movementId || (m.reference_id === movementRef && m.product_id === product!.product_id)
    );

    const actorUser = this.getUserById(state.environment, userId) || SEED_USERS.find(u => u.user_id === userId);
    const username = actorUser?.username || 'hajivand';

    const movementData: StockMovement = {
      movement_id: movementId,
      product_id: product.product_id,
      warehouse_id: defaultWarehouse.warehouse_id,
      shelf_location: defaultWarehouse.shelf_location || 'A1',
      quantity: healthyQty,
      movement_type: 'STOCK_IN',
      reference_id: movementRef,
      document_number: `برگه ورود ${inspection.form_number}`,
      description: `ورود اتوماتیک انبار از ورودی شیر و سیلندر [${inspection.item_name}] (برگه ${inspection.form_number} - طرف حساب: ${inspection.customer_name})`,
      notes: `ثبت خودکار سیستمی با تایید مهندس حاجی‌وند - بارنامه: ${inspection.waybill_number} - راننده: ${inspection.driver_name}${inspection.defective_quantity > 0 ? ` (معیوب: ${inspection.defective_quantity} عدد)` : ''}`,
      user_id: actorUser ? actorUser.user_id : userId,
      created_by_username: username,
      device_id: state.deviceId,
      event_id: generateUUID(),
      created_at: inspection.created_at || new Date().toISOString()
    };

    if (existingMovIdx >= 0) {
      state.stock_movements[existingMovIdx] = {
        ...state.stock_movements[existingMovIdx],
        ...movementData,
        quantity: healthyQty
      };
      return state.stock_movements[existingMovIdx];
    } else {
      state.stock_movements.unshift(movementData);
      return movementData;
    }
  }

  static saveCylinderValveInspection(
    env: RuntimeEnvironment,
    inspection: CylinderValveInspection,
    userId: string = 'USR-003'
  ): CylinderValveInspection {
    const state = this.getState(env);
    if (!state.cylinder_valve_inspections) state.cylinder_valve_inspections = [];

    const existingIdx = state.cylinder_valve_inspections.findIndex(i => i.inspection_id === inspection.inspection_id);
    const eventType = existingIdx >= 0 ? 'UPDATE' : 'CREATE';

    // Strictly resolve actor user
    const actorUser = this.getUserById(env, userId) || SEED_USERS.find(u => u.user_id === userId);
    const inspectorName = actorUser ? actorUser.full_name : inspection.inspector_name || 'مهندس حاجی وند';
    const finalInspection: CylinderValveInspection = {
      ...inspection,
      inspector_user_id: actorUser ? actorUser.user_id : userId,
      inspector_name: inspectorName,
      updated_at: new Date().toISOString()
    };

    if (existingIdx >= 0) {
      state.cylinder_valve_inspections = state.cylinder_valve_inspections.map((item, idx) => idx === existingIdx ? finalInspection : item);
    } else {
      state.cylinder_valve_inspections = [finalInspection, ...state.cylinder_valve_inspections];
    }

    // Automatically enter into warehouse movements (STOCK_IN) and product catalog (Inventory)
    const createdMovement = this.syncInspectionToWarehouseAndInventory(state, finalInspection, userId);

    this.saveState(env, state);

    // Record sync event for inspection
    this.recordLocalChange(
      env,
      userId,
      'CYLINDER_VALVE_INSPECTION',
      eventType,
      finalInspection.inspection_id,
      finalInspection,
      `ثبت بازرسی و ورود فیزیکی شیر/سیلندر توسط ${inspectorName} (برگه ${finalInspection.form_number} - ${finalInspection.customer_name})`,
      {
        form_number: finalInspection.form_number,
        declared: finalInspection.declared_quantity,
        healthy: finalInspection.actual_healthy_quantity,
        defective: finalInspection.defective_quantity
      }
    );

    // Record sync event for stock movement
    if (createdMovement) {
      this.recordLocalChange(
        env,
        userId,
        'STOCK_MOVEMENT',
        eventType === 'CREATE' ? 'CREATE' : 'UPDATE',
        createdMovement.movement_id,
        createdMovement,
        `ورود اتوماتیک کالا به انبار مرکزی از برگه بازرسی ${finalInspection.form_number} (${finalInspection.item_name} - ${finalInspection.actual_healthy_quantity} عدد سالم)`
      );
    }

    // Dispatch custom events for live reactive UI updates across all tabs
    try {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('mgas:stock_movement_added', { detail: createdMovement }));
        window.dispatchEvent(new CustomEvent('mgas:kardex_updated', { detail: finalInspection }));
        window.dispatchEvent(new CustomEvent('mgas:inspection_updated', { detail: finalInspection }));
        window.dispatchEvent(new CustomEvent('mgas:db_refreshed', { detail: { env } }));
      }
    } catch {}

    return finalInspection;
  }

  static recordValveIntake(
    env: RuntimeEnvironment,
    params: ValveIntakeRecordParams,
    userId: string = 'USR-002'
  ): ValveIntakeResult {
    const state = this.getState(env);
    if (!state.products) state.products = [];
    if (!state.stock_movements) state.stock_movements = [];
    if (!state.gas_kardex_entries) state.gas_kardex_entries = [];

    // Calculate totals
    const sum11k = (b: ValveIntakeBreakdown11kg) =>
      (Number(b.parsi) || 0) + (Number(b.butane) || 0) + (Number(b.iranGazi) || 0) + (Number(b.forklift) || 0) + (Number(b.iraqi) || 0);
    const sumPicnic = (b: ValveIntakeBreakdownPicnic) =>
      (Number(b.parsi) || 0) + (Number(b.butane) || 0);

    const totalNew11kg = sum11k(params.valves11kgNew);
    const totalUsed11kg = sum11k(params.valves11kgUsed);
    const totalPicnic5kg = sumPicnic(params.valvesPicnic5kg);
    const totalPicnic2kg = sumPicnic(params.valvesPicnic2kg);

    const totalNewValves = totalNew11kg + totalPicnic5kg + totalPicnic2kg;
    const totalUsedValves = totalUsed11kg;
    const totalAllValves = totalNewValves + totalUsedValves;

    if (totalAllValves <= 0) {
      throw new Error('حداقل مقدار یکی از اقلام شیرآلات باید بزرگتر از صفر باشد.');
    }

    const actorUser = this.getUserById(env, userId) || SEED_USERS.find(u => u.user_id === userId) || {
      user_id: userId,
      username: 'karami',
      full_name: 'مدیر داخلی'
    };
    const username = actorUser.username;

    // Default warehouse for valves
    const valveWarehouse = state.warehouses?.find(w => w.warehouse_id === 'WH-VALVES' || w.warehouse_id === 'WH-01') || state.warehouses?.[0] || {
      warehouse_id: 'WH-VALVES',
      name: 'انبار شیر آلات',
      shelf_location: 'A1'
    };

    // Prepare catalog of items to register in inventory
    const itemsToRecord: Array<{ sku: string; name: string; qty: number; category: string; purchasePrice: number; salePrice: number }> = [
      // 11kg New
      { sku: 'VLV-11N-PARSI', name: 'شیر نو 11 کیلویی پرسی', qty: Number(params.valves11kgNew.parsi) || 0, category: 'CAT-02', purchasePrice: 1850000, salePrice: 2400000 },
      { sku: 'VLV-11N-BUTANE', name: 'شیر نو 11 کیلویی بوتان', qty: Number(params.valves11kgNew.butane) || 0, category: 'CAT-02', purchasePrice: 1850000, salePrice: 2400000 },
      { sku: 'VLV-11N-IRAN', name: 'شیر نو 11 کیلویی ایران گازی', qty: Number(params.valves11kgNew.iranGazi) || 0, category: 'CAT-02', purchasePrice: 1850000, salePrice: 2400000 },
      { sku: 'VLV-11N-LIFT', name: 'شیر نو 11 کیلویی لیفتراک', qty: Number(params.valves11kgNew.forklift) || 0, category: 'CAT-02', purchasePrice: 1950000, salePrice: 2600000 },
      { sku: 'VLV-11N-IRAQI', name: 'شیر نو 11 کیلویی عراقی', qty: Number(params.valves11kgNew.iraqi) || 0, category: 'CAT-02', purchasePrice: 1900000, salePrice: 2500000 },
      // 11kg Used
      { sku: 'VLV-11U-PARSI', name: 'شیر کهنه 11 کیلویی پرسی', qty: Number(params.valves11kgUsed.parsi) || 0, category: 'CAT-02', purchasePrice: 450000, salePrice: 700000 },
      { sku: 'VLV-11U-BUTANE', name: 'شیر کهنه 11 کیلویی بوتان', qty: Number(params.valves11kgUsed.butane) || 0, category: 'CAT-02', purchasePrice: 450000, salePrice: 700000 },
      { sku: 'VLV-11U-IRAN', name: 'شیر کهنه 11 کیلویی ایران گازی', qty: Number(params.valves11kgUsed.iranGazi) || 0, category: 'CAT-02', purchasePrice: 450000, salePrice: 700000 },
      { sku: 'VLV-11U-LIFT', name: 'شیر کهنه 11 کیلویی لیفتراک', qty: Number(params.valves11kgUsed.forklift) || 0, category: 'CAT-02', purchasePrice: 500000, salePrice: 750000 },
      { sku: 'VLV-11U-IRAQI', name: 'شیر کهنه 11 کیلویی عراقی', qty: Number(params.valves11kgUsed.iraqi) || 0, category: 'CAT-02', purchasePrice: 480000, salePrice: 720000 },
      // Picnic 5kg New
      { sku: 'VLV-PK5N-PARSI', name: 'شیر نو پیکنیک 5 کیلویی پرسی', qty: Number(params.valvesPicnic5kg.parsi) || 0, category: 'CAT-02', purchasePrice: 1200000, salePrice: 1600000 },
      { sku: 'VLV-PK5N-BUTANE', name: 'شیر نو پیکنیک 5 کیلویی بوتان', qty: Number(params.valvesPicnic5kg.butane) || 0, category: 'CAT-02', purchasePrice: 1200000, salePrice: 1600000 },
      // Picnic 2kg New
      { sku: 'VLV-PK2N-PARSI', name: 'شیر نو پیکنیک 2 کیلویی پرسی', qty: Number(params.valvesPicnic2kg.parsi) || 0, category: 'CAT-02', purchasePrice: 1100000, salePrice: 1500000 },
      { sku: 'VLV-PK2N-BUTANE', name: 'شیر نو پیکنیک 2 کیلویی بوتان', qty: Number(params.valvesPicnic2kg.butane) || 0, category: 'CAT-02', purchasePrice: 1100000, salePrice: 1500000 }
    ].filter(i => i.qty > 0);

    // Build human-readable breakdown text
    const parts11n: string[] = [];
    if (params.valves11kgNew.parsi > 0) parts11n.push(`پرسی: ${params.valves11kgNew.parsi}`);
    if (params.valves11kgNew.butane > 0) parts11n.push(`بوتان: ${params.valves11kgNew.butane}`);
    if (params.valves11kgNew.iranGazi > 0) parts11n.push(`ایران گازی: ${params.valves11kgNew.iranGazi}`);
    if (params.valves11kgNew.forklift > 0) parts11n.push(`لیفتراک: ${params.valves11kgNew.forklift}`);
    if (params.valves11kgNew.iraqi > 0) parts11n.push(`عراقی: ${params.valves11kgNew.iraqi}`);

    const parts11u: string[] = [];
    if (params.valves11kgUsed.parsi > 0) parts11u.push(`پرسی: ${params.valves11kgUsed.parsi}`);
    if (params.valves11kgUsed.butane > 0) parts11u.push(`بوتان: ${params.valves11kgUsed.butane}`);
    if (params.valves11kgUsed.iranGazi > 0) parts11u.push(`ایران گازی: ${params.valves11kgUsed.iranGazi}`);
    if (params.valves11kgUsed.forklift > 0) parts11u.push(`لیفتراک: ${params.valves11kgUsed.forklift}`);
    if (params.valves11kgUsed.iraqi > 0) parts11u.push(`عراقی: ${params.valves11kgUsed.iraqi}`);

    const partsPicnic5: string[] = [];
    if (params.valvesPicnic5kg.parsi > 0) partsPicnic5.push(`پرسی: ${params.valvesPicnic5kg.parsi}`);
    if (params.valvesPicnic5kg.butane > 0) partsPicnic5.push(`بوتان: ${params.valvesPicnic5kg.butane}`);

    const partsPicnic2: string[] = [];
    if (params.valvesPicnic2kg.parsi > 0) partsPicnic2.push(`پرسی: ${params.valvesPicnic2kg.parsi}`);
    if (params.valvesPicnic2kg.butane > 0) partsPicnic2.push(`بوتان: ${params.valvesPicnic2kg.butane}`);

    const descSections: string[] = [];
    if (parts11n.length > 0) descSections.push(`شیر نو ۱۱ک (${parts11n.join('، ')})`);
    if (parts11u.length > 0) descSections.push(`شیر کهنه ۱۱ک (${parts11u.join('، ')})`);
    if (partsPicnic5.length > 0) descSections.push(`پیک‌نیک ۵ک (${partsPicnic5.join('، ')})`);
    if (partsPicnic2.length > 0) descSections.push(`پیک‌نیک ۲ک (${partsPicnic2.join('، ')})`);

    const summaryText = descSections.join(' | ');
    const fullDescription = `ورودی شیرآلات انبار: ${summaryText}`;

    // Ensure standard valve products exist
    this.ensureValveProductsExist(state);

    // 1. Process as "قطعه شیر نو" and "قطعه شیر کهنه" in warehouse inventory
    if (totalNewValves > 0) {
      let productNew = state.products.find(p => p.product_id === 'PRD-VALVE-NEW' || p.name.trim() === 'قطعه شیر نو');
      if (!productNew) {
        this.ensureValveProductsExist(state);
        productNew = state.products.find(p => p.product_id === 'PRD-VALVE-NEW')!;
      }

      const movementId = `MOV-VLV-NEW-${generateUUID().substring(0, 8)}`;
      const movementNew: StockMovement = {
        movement_id: movementId,
        product_id: productNew.product_id,
        warehouse_id: valveWarehouse.warehouse_id,
        shelf_location: valveWarehouse.shelf_location || 'A1',
        quantity: totalNewValves,
        movement_type: 'STOCK_IN',
        reference_id: params.sheetNumber,
        document_number: `حواله ورود شیر ${params.sheetNumber}`,
        description: `ورود مستقیم به انبار: قطعه شیر نو (${totalNewValves} عدد) - طرف حساب: ${params.customerName}`,
        notes: `ورودی شیر نو انبار [${params.sheetNumber}] - تفکیک: ${parts11n.concat(partsPicnic5, partsPicnic2).join('، ')}${params.driverName ? ` - راننده: ${params.driverName}` : ''}${params.notes ? ` - توضیحات: ${params.notes}` : ''}`,
        user_id: actorUser.user_id,
        created_by_username: username,
        device_id: state.deviceId,
        event_id: generateUUID(),
        created_at: new Date().toISOString()
      };
      state.stock_movements.unshift(movementNew);

      this.recordLocalChange(
        env,
        actorUser.user_id,
        'STOCK_MOVEMENT',
        'CREATE',
        movementNew.movement_id,
        movementNew,
        `ورود کالا به انبار شیرآلات (قطعه شیر نو - ${totalNewValves} عدد) - حواله ${params.sheetNumber}`
      );
    }

    if (totalUsedValves > 0) {
      let productUsed = state.products.find(p => p.product_id === 'PRD-VALVE-USED' || p.name.trim() === 'قطعه شیر کهنه');
      if (!productUsed) {
        this.ensureValveProductsExist(state);
        productUsed = state.products.find(p => p.product_id === 'PRD-VALVE-USED')!;
      }

      const movementId = `MOV-VLV-USD-${generateUUID().substring(0, 8)}`;
      const movementUsed: StockMovement = {
        movement_id: movementId,
        product_id: productUsed.product_id,
        warehouse_id: valveWarehouse.warehouse_id,
        shelf_location: valveWarehouse.shelf_location || 'A1',
        quantity: totalUsedValves,
        movement_type: 'STOCK_IN',
        reference_id: params.sheetNumber,
        document_number: `حواله ورود شیر ${params.sheetNumber}`,
        description: `ورود مستقیم به انبار: قطعه شیر کهنه (${totalUsedValves} عدد) - طرف حساب: ${params.customerName}`,
        notes: `ورودی شیر کهنه انبار [${params.sheetNumber}] - تفکیک: ${parts11u.join('، ')}${params.driverName ? ` - راننده: ${params.driverName}` : ''}${params.notes ? ` - توضیحات: ${params.notes}` : ''}`,
        user_id: actorUser.user_id,
        created_by_username: username,
        device_id: state.deviceId,
        event_id: generateUUID(),
        created_at: new Date().toISOString()
      };
      state.stock_movements.unshift(movementUsed);

      this.recordLocalChange(
        env,
        actorUser.user_id,
        'STOCK_MOVEMENT',
        'CREATE',
        movementUsed.movement_id,
        movementUsed,
        `ورود کالا به انبار شیرآلات (قطعه شیر کهنه - ${totalUsedValves} عدد) - حواله ${params.sheetNumber}`
      );
    }

    // 2. Create GasKardexEntry
    const entryId = `KDX-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const kardexEntry: GasKardexEntry = {
      entry_id: entryId,
      customer_id: params.customerId,
      customer_name: params.customerName,
      date: params.date,
      description: fullDescription,
      transfer_sheet_number: params.sheetNumber,
      cylinder_in: 0,
      cylinder_out: 0,
      scrap_out: 0,
      scrap_stock_in: 0,
      cylinder_balance: 0,
      scrap_balance: 0,
      new_valve_in: totalNewValves,
      new_valve_out: 0,
      new_valve_balance: 0,
      dispatched: '',
      used_valve_in: totalUsedValves,
      used_valve_out: 0,
      used_valve_balance: 0,
      defective: 0,
      user_id: actorUser.user_id,
      created_by_username: username,
      device_id: state.deviceId,
      event_id: generateUUID(),
      notes: `${params.notes ? `${params.notes} | ` : ''}اقلام ورودی شیرآلات: ${summaryText}${params.driverName ? ` | راننده: ${params.driverName}` : ''}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    state.gas_kardex_entries.push(kardexEntry);

    // Recalculate balances for this customer partitioned by cylinder type
    LocalStorageManager.recalculateCustomerKardex(state, params.customerId);

    // 3. Save state
    this.saveState(env, state);

    // 4. Record sync event for Kardex entry
    this.recordLocalChange(
      env,
      actorUser.user_id,
      'GAS_KARDEX',
      'CREATE',
      kardexEntry.entry_id,
      kardexEntry,
      `ثبت ورودی شیرآلات در کاردکس گاز برای ${params.customerName} (برگه ${params.sheetNumber}) - شیر نو: ${totalNewValves} عدد`
    );

    // 5. Reactive broadcasts
    try {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('mgas:kardex_updated', { detail: kardexEntry }));
        window.dispatchEvent(new CustomEvent('mgas:stock_movement_added', { detail: itemsToRecord }));
        window.dispatchEvent(new CustomEvent('mgas:inventory_updated', { detail: itemsToRecord }));
        if ('BroadcastChannel' in window) {
          const bc = new BroadcastChannel('mgas_kardex_sync_channel');
          bc.postMessage({ type: 'KARDEX_ENTRY_ADDED', entry: kardexEntry });
          bc.close();
        }
      }
    } catch {}

      return {
        success: true,
        entryId,
        totalNewValves,
        totalUsedValves,
        totalAllValves,
        itemsCount: itemsToRecord.length,
        summaryText,
        entry: kardexEntry
      };
    }

  static recordValveInspection(
    env: RuntimeEnvironment,
    params: ValveIntakeRecordParams,
    userId: string = 'USR-003'
  ): {
    inspection: CylinderValveInspection;
    totalNewValves: number;
    totalUsedValves: number;
    totalAllValves: number;
    summaryText: string;
  } {
    const state = this.getState(env);
    if (!state.products) state.products = [];
    if (!state.stock_movements) state.stock_movements = [];
    if (!state.cylinder_valve_inspections) state.cylinder_valve_inspections = [];

    // Calculate totals
    const sum11k = (b: ValveIntakeBreakdown11kg) =>
      (Number(b.parsi) || 0) + (Number(b.butane) || 0) + (Number(b.iranGazi) || 0) + (Number(b.forklift) || 0) + (Number(b.iraqi) || 0);
    const sumPicnic = (b: ValveIntakeBreakdownPicnic) =>
      (Number(b.parsi) || 0) + (Number(b.butane) || 0);

    const totalNew11kg = sum11k(params.valves11kgNew);
    const totalUsed11kg = sum11k(params.valves11kgUsed);
    const totalPicnic5kg = sumPicnic(params.valvesPicnic5kg);
    const totalPicnic2kg = sumPicnic(params.valvesPicnic2kg);

    const totalNewValves = totalNew11kg + totalPicnic5kg + totalPicnic2kg;
    const totalUsedValves = totalUsed11kg;
    const totalAllValves = totalNewValves + totalUsedValves;

    if (totalAllValves <= 0) {
      throw new Error('حداقل مقدار یکی از اقلام شیرآلات باید بزرگتر از صفر باشد.');
    }

    const actorUser = this.getUserById(env, userId) || SEED_USERS.find(u => u.user_id === userId) || {
      user_id: userId,
      username: 'hajivand',
      full_name: 'مهندس حاجی وند'
    };
    const username = actorUser.username;
    const inspectorFullName = actorUser.full_name || 'مهندس حاجی وند';

    // Default warehouse for valves
    const valveWarehouse = state.warehouses?.find(w => w.warehouse_id === 'WH-VALVES' || w.warehouse_id === 'WH-01') || state.warehouses?.[0] || {
      warehouse_id: 'WH-VALVES',
      name: 'انبار شیر آلات',
      shelf_location: 'A1'
    };

    // Prepare catalog of items to register in inventory
    const itemsToRecord: Array<{ sku: string; name: string; qty: number; category: string; purchasePrice: number; salePrice: number }> = [
      // 11kg New
      { sku: 'VLV-11N-PARSI', name: 'شیر نو 11 کیلویی پرسی', qty: Number(params.valves11kgNew.parsi) || 0, category: 'CAT-02', purchasePrice: 1850000, salePrice: 2400000 },
      { sku: 'VLV-11N-BUTANE', name: 'شیر نو 11 کیلویی بوتان', qty: Number(params.valves11kgNew.butane) || 0, category: 'CAT-02', purchasePrice: 1850000, salePrice: 2400000 },
      { sku: 'VLV-11N-IRAN', name: 'شیر نو 11 کیلویی ایران گازی', qty: Number(params.valves11kgNew.iranGazi) || 0, category: 'CAT-02', purchasePrice: 1850000, salePrice: 2400000 },
      { sku: 'VLV-11N-LIFT', name: 'شیر نو 11 کیلویی لیفتراک', qty: Number(params.valves11kgNew.forklift) || 0, category: 'CAT-02', purchasePrice: 1950000, salePrice: 2600000 },
      { sku: 'VLV-11N-IRAQI', name: 'شیر نو 11 کیلویی عراقی', qty: Number(params.valves11kgNew.iraqi) || 0, category: 'CAT-02', purchasePrice: 1900000, salePrice: 2500000 },
      // 11kg Used
      { sku: 'VLV-11U-PARSI', name: 'شیر کهنه 11 کیلویی پرسی', qty: Number(params.valves11kgUsed.parsi) || 0, category: 'CAT-02', purchasePrice: 450000, salePrice: 700000 },
      { sku: 'VLV-11U-BUTANE', name: 'شیر کهنه 11 کیلویی بوتان', qty: Number(params.valves11kgUsed.butane) || 0, category: 'CAT-02', purchasePrice: 450000, salePrice: 700000 },
      { sku: 'VLV-11U-IRAN', name: 'شیر کهنه 11 کیلویی ایران گازی', qty: Number(params.valves11kgUsed.iranGazi) || 0, category: 'CAT-02', purchasePrice: 450000, salePrice: 700000 },
      { sku: 'VLV-11U-LIFT', name: 'شیر کهنه 11 کیلویی لیفتراک', qty: Number(params.valves11kgUsed.forklift) || 0, category: 'CAT-02', purchasePrice: 500000, salePrice: 750000 },
      { sku: 'VLV-11U-IRAQI', name: 'شیر کهنه 11 کیلویی عراقی', qty: Number(params.valves11kgUsed.iraqi) || 0, category: 'CAT-02', purchasePrice: 480000, salePrice: 720000 },
      // Picnic 5kg New
      { sku: 'VLV-PK5N-PARSI', name: 'شیر نو پیکنیک 5 کیلویی پرسی', qty: Number(params.valvesPicnic5kg.parsi) || 0, category: 'CAT-02', purchasePrice: 1200000, salePrice: 1600000 },
      { sku: 'VLV-PK5N-BUTANE', name: 'شیر نو پیکنیک 5 کیلویی بوتان', qty: Number(params.valvesPicnic5kg.butane) || 0, category: 'CAT-02', purchasePrice: 1200000, salePrice: 1600000 },
      // Picnic 2kg New
      { sku: 'VLV-PK2N-PARSI', name: 'شیر نو پیکنیک 2 کیلویی پرسی', qty: Number(params.valvesPicnic2kg.parsi) || 0, category: 'CAT-02', purchasePrice: 1100000, salePrice: 1500000 },
      { sku: 'VLV-PK2N-BUTANE', name: 'شیر نو پیکنیک 2 کیلویی بوتان', qty: Number(params.valvesPicnic2kg.butane) || 0, category: 'CAT-02', purchasePrice: 1100000, salePrice: 1500000 }
    ].filter(i => i.qty > 0);

    // Build human-readable breakdown text
    const parts11n: string[] = [];
    if (params.valves11kgNew.parsi > 0) parts11n.push(`پرسی: ${params.valves11kgNew.parsi}`);
    if (params.valves11kgNew.butane > 0) parts11n.push(`بوتان: ${params.valves11kgNew.butane}`);
    if (params.valves11kgNew.iranGazi > 0) parts11n.push(`ایران گازی: ${params.valves11kgNew.iranGazi}`);
    if (params.valves11kgNew.forklift > 0) parts11n.push(`لیفتراک: ${params.valves11kgNew.forklift}`);
    if (params.valves11kgNew.iraqi > 0) parts11n.push(`عراقی: ${params.valves11kgNew.iraqi}`);

    const parts11u: string[] = [];
    if (params.valves11kgUsed.parsi > 0) parts11u.push(`پرسی: ${params.valves11kgUsed.parsi}`);
    if (params.valves11kgUsed.butane > 0) parts11u.push(`بوتان: ${params.valves11kgUsed.butane}`);
    if (params.valves11kgUsed.iranGazi > 0) parts11u.push(`ایران گازی: ${params.valves11kgUsed.iranGazi}`);
    if (params.valves11kgUsed.forklift > 0) parts11u.push(`لیفتراک: ${params.valves11kgUsed.forklift}`);
    if (params.valves11kgUsed.iraqi > 0) parts11u.push(`عراقی: ${params.valves11kgUsed.iraqi}`);

    const partsPicnic5: string[] = [];
    if (params.valvesPicnic5kg.parsi > 0) partsPicnic5.push(`پرسی: ${params.valvesPicnic5kg.parsi}`);
    if (params.valvesPicnic5kg.butane > 0) partsPicnic5.push(`بوتان: ${params.valvesPicnic5kg.butane}`);

    const partsPicnic2: string[] = [];
    if (params.valvesPicnic2kg.parsi > 0) partsPicnic2.push(`پرسی: ${params.valvesPicnic2kg.parsi}`);
    if (params.valvesPicnic2kg.butane > 0) partsPicnic2.push(`بوتان: ${params.valvesPicnic2kg.butane}`);

    const descSections: string[] = [];
    if (parts11n.length > 0) descSections.push(`شیر نو ۱۱ک (${parts11n.join('، ')})`);
    if (parts11u.length > 0) descSections.push(`شیر کهنه ۱۱ک (${parts11u.join('، ')})`);
    if (partsPicnic5.length > 0) descSections.push(`پیک‌نیک ۵ک (${partsPicnic5.join('، ')})`);
    if (partsPicnic2.length > 0) descSections.push(`پیک‌نیک ۲ک (${partsPicnic2.join('، ')})`);

    const summaryText = descSections.join(' | ');

    // Ensure standard valve products exist
    this.ensureValveProductsExist(state);

    // 1. Enter into warehouse movements (STOCK_IN) & product catalog as "قطعه شیر نو" and "قطعه شیر کهنه"
    if (totalNewValves > 0) {
      let productNew = state.products.find(p => p.product_id === 'PRD-VALVE-NEW' || p.name.trim() === 'قطعه شیر نو');
      if (!productNew) {
        this.ensureValveProductsExist(state);
        productNew = state.products.find(p => p.product_id === 'PRD-VALVE-NEW')!;
      }

      const movementId = `MOV-VLV-NEW-${generateUUID().substring(0, 8)}`;
      const movementNew: StockMovement = {
        movement_id: movementId,
        product_id: productNew.product_id,
        warehouse_id: valveWarehouse.warehouse_id,
        shelf_location: valveWarehouse.shelf_location || 'A1',
        quantity: totalNewValves,
        movement_type: 'STOCK_IN',
        reference_id: params.sheetNumber,
        document_number: `حواله ورود شیر ${params.sheetNumber}`,
        description: `ورود مستقیم به انبار: قطعه شیر نو (${totalNewValves} عدد) - طرف حساب: ${params.customerName}`,
        notes: `ورودی شیرآلات انبار [${params.sheetNumber}] - تفکیک شیر نو: ${parts11n.concat(partsPicnic5, partsPicnic2).join('، ')}${params.driverName ? ` - راننده: ${params.driverName}` : ''}${params.notes ? ` - توضیحات: ${params.notes}` : ''}`,
        user_id: actorUser.user_id,
        created_by_username: username,
        device_id: state.deviceId,
        event_id: generateUUID(),
        created_at: new Date().toISOString()
      };
      state.stock_movements.unshift(movementNew);

      this.recordLocalChange(
        env,
        actorUser.user_id,
        'STOCK_MOVEMENT',
        'CREATE',
        movementNew.movement_id,
        movementNew,
        `ورود کالا به انبار شیرآلات (قطعه شیر نو - ${totalNewValves} عدد) - حواله ${params.sheetNumber}`
      );
    }

    if (totalUsedValves > 0) {
      let productUsed = state.products.find(p => p.product_id === 'PRD-VALVE-USED' || p.name.trim() === 'قطعه شیر کهنه');
      if (!productUsed) {
        this.ensureValveProductsExist(state);
        productUsed = state.products.find(p => p.product_id === 'PRD-VALVE-USED')!;
      }

      const movementId = `MOV-VLV-USD-${generateUUID().substring(0, 8)}`;
      const movementUsed: StockMovement = {
        movement_id: movementId,
        product_id: productUsed.product_id,
        warehouse_id: valveWarehouse.warehouse_id,
        shelf_location: valveWarehouse.shelf_location || 'A1',
        quantity: totalUsedValves,
        movement_type: 'STOCK_IN',
        reference_id: params.sheetNumber,
        document_number: `حواله ورود شیر ${params.sheetNumber}`,
        description: `ورود مستقیم به انبار: قطعه شیر کهنه (${totalUsedValves} عدد) - طرف حساب: ${params.customerName}`,
        notes: `ورودی شیرآلات کهنه [${params.sheetNumber}] - تفکیک شیر کهنه: ${parts11u.join('، ')}${params.driverName ? ` - راننده: ${params.driverName}` : ''}${params.notes ? ` - توضیحات: ${params.notes}` : ''}`,
        user_id: actorUser.user_id,
        created_by_username: username,
        device_id: state.deviceId,
        event_id: generateUUID(),
        created_at: new Date().toISOString()
      };
      state.stock_movements.unshift(movementUsed);

      this.recordLocalChange(
        env,
        actorUser.user_id,
        'STOCK_MOVEMENT',
        'CREATE',
        movementUsed.movement_id,
        movementUsed,
        `ورود کالا به انبار شیرآلات (قطعه شیر کهنه - ${totalUsedValves} عدد) - حواله ${params.sheetNumber}`
      );
    }

    // 2. Prepare receipt items for official receipt print & Kardex transfer
    const receiptItems: GoodsReceiptItem[] = [];
    if (totalNewValves > 0) {
      receiptItems.push({
        rowNum: 1,
        description: 'قطعه شیر نو (ورودی انبار شیرآلات)',
        quantity: totalNewValves,
        quantityInWords: `${totalNewValves} عدد`,
        remarks: `شیر نو: ${parts11n.concat(partsPicnic5, partsPicnic2).join('، ')}`
      });
    }
    if (totalUsedValves > 0) {
      receiptItems.push({
        rowNum: receiptItems.length + 1,
        description: 'قطعه شیر کهنه و داغی',
        quantity: totalUsedValves,
        quantityInWords: `${totalUsedValves} عدد`,
        remarks: `شیر کهنه: ${parts11u.join('، ')}`
      });
    }

    // 3. Create CylinderValveInspection with status COUNTED_READY_FOR_KARDEX
    const inspectionId = `INSP-VLV-${Date.now()}`;
    const inspection: CylinderValveInspection = {
      inspection_id: inspectionId,
      form_number: params.sheetNumber,
      receipt_type: 'ENTRY',
      date: params.date,
      customer_id: params.customerId,
      customer_name: params.customerName,
      item_type: 'VALVE_NEW',
      item_name: `ورودی شیرآلات: ${summaryText}`,
      declared_quantity: totalAllValves,
      actual_healthy_quantity: totalAllValves,
      defective_quantity: 0,
      discrepancy_quantity: 0,
      driver_name: params.driverName || 'تحویل با بارنامه',
      plate_number: params.plateNumber || '',
      waybill_number: `BAR-${params.sheetNumber.replace(/[^0-9]/g, '') || Date.now().toString().slice(-4)}`,
      inspector_user_id: actorUser.user_id,
      inspector_name: inspectorFullName,
      status: 'COUNTED_READY_FOR_KARDEX',
      notes: `شمارش فیزیکی و تایید انباردار ${inspectorFullName} (شیر نو: ${totalNewValves} عدد | شیر کهنه: ${totalUsedValves} عدد). ارسال اعلان جهت تایید نهایی و ایجاد کاردکس گاز برای مدیر داخلی خانم کرمی.${params.notes ? ` توضیحات: ${params.notes}` : ''}`,
      receipt_items: receiptItems,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    state.cylinder_valve_inspections = [inspection, ...state.cylinder_valve_inspections];

    // Save state
    this.saveState(env, state);

    // Record sync event for inspection
    this.recordLocalChange(
      env,
      actorUser.user_id,
      'CYLINDER_VALVE_INSPECTION',
      'CREATE',
      inspection.inspection_id,
      inspection,
      `ثبت و تایید فیزیکی ورودی شیرآلات توسط انباردار ${inspectorFullName} (برگه ${inspection.form_number})`
    );

    // Dispatch events & notify Karami
    try {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('mgas:inspection_added', { detail: inspection }));
        window.dispatchEvent(new CustomEvent('mgas:inspection_updated', { detail: inspection }));
        window.dispatchEvent(new CustomEvent('mgas:stock_movement_added', { detail: itemsToRecord }));
        window.dispatchEvent(new CustomEvent('mgas:db_refreshed', { detail: { env } }));
        window.dispatchEvent(new CustomEvent('mgas:karami_notification', {
          detail: {
            type: 'VALVE_INTAKE_READY',
            title: 'اعلان ورودی تاییدشده توسط انباردار',
            message: `ورودی شیرآلات برگه ${inspection.form_number} (${totalAllValves} عدد) توسط مهندس حاجی‌وند تایید شد و آماده ثبت نهایی در کاردکس است.`,
            inspection
          }
        }));
        if ('BroadcastChannel' in window) {
          const bc = new BroadcastChannel('mgas_kardex_sync_channel');
          bc.postMessage({ type: 'INSPECTION_READY_FOR_KARDEX', inspection });
          bc.close();
        }
      }
    } catch {}

    return {
      inspection,
      totalNewValves,
      totalUsedValves,
      totalAllValves,
      summaryText
    };
  }

  static markInspectionAsKardexRegistered(
    env: RuntimeEnvironment,
    inspectionId: string,
    kardexEntryId: string,
    registeredByUsername: string
  ): boolean {
    const state = this.getState(env);
    if (!state.cylinder_valve_inspections) return false;

    const target = state.cylinder_valve_inspections.find(i => i.inspection_id === inspectionId);
    if (!target) return false;

    target.status = 'KARDEX_REGISTERED';
    target.kardex_entry_id = kardexEntryId;
    target.kardex_registered_by = registeredByUsername;
    target.kardex_registered_at = new Date().toISOString();
    target.updated_at = new Date().toISOString();

    this.saveState(env, state);

    const user = (state.users || SEED_USERS).find(u => u.username === registeredByUsername);
    this.recordLocalChange(
      env,
      user?.user_id || 'USR-002',
      'CYLINDER_VALVE_INSPECTION',
      'UPDATE',
      target.inspection_id,
      target,
      `ثبت ردیف کاردکس متناظر برای بازرسی ${target.form_number} توسط @${registeredByUsername}`,
      { inspection_id: inspectionId, kardex_entry_id: kardexEntryId }
    );

    return true;
  }

  static deleteCylinderValveInspection(
    env: RuntimeEnvironment,
    inspectionId: string,
    userId: string = 'USR-003'
  ): boolean {
    this.markEntityPermanentlyDeleted(inspectionId);

    const allEnvs: RuntimeEnvironment[] = ['OFFICE_WIN11', 'WAREHOUSE_WIN7', 'CLOUD_WEB'];
    let removed: CylinderValveInspection | undefined;

    for (const targetEnv of allEnvs) {
      const s = this.getState(targetEnv);
      if (s.cylinder_valve_inspections) {
        const targetIdx = s.cylinder_valve_inspections.findIndex(i => i.inspection_id === inspectionId);
        if (targetIdx >= 0) {
          if (!removed) removed = s.cylinder_valve_inspections[targetIdx];
          s.cylinder_valve_inspections = s.cylinder_valve_inspections.filter(i => i.inspection_id !== inspectionId);
        }
      }
      if (removed) {
        this.markEntityPermanentlyDeleted(removed.form_number);
        // Also remove associated automatic stock movement if present
        if (s.stock_movements) {
          const movementId = `MOV-INSP-${removed.inspection_id}`;
          s.stock_movements = s.stock_movements.filter(
            m => m.movement_id !== movementId && !(m.reference_id === removed!.form_number && m.movement_type === 'STOCK_IN')
          );
        }
      }
      this.saveState(targetEnv, s);
    }

    if (!removed) return false;

    const actorUser = this.getUserById(env, userId) || SEED_USERS.find(u => u.user_id === userId);
    this.recordLocalChange(
      env,
      userId,
      'CYLINDER_VALVE_INSPECTION',
      'DELETE',
      removed.inspection_id,
      removed,
      `حذف برگه بازرسی و ورودی شیر و سیلندر شماره ${removed.form_number} (${removed.item_name})`,
      { form_number: removed.form_number }
    );

    try {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('mgas:inspection_updated', { detail: { deletedInspectionId: inspectionId } }));
        window.dispatchEvent(new CustomEvent('mgas:kardex_updated', { detail: { deletedInspectionId: inspectionId } }));
        window.dispatchEvent(new CustomEvent('mgas:db_refreshed', { detail: { env } }));
      }
    } catch {}

    return true;
  }

  static getCustomItemTypes(env: RuntimeEnvironment): CustomCylinderItemType[] {
    const state = this.getState(env);
    const tombstones = this.getPermanentlyDeletedIds();

    if (!state.custom_cylinder_item_types || state.custom_cylinder_item_types.length === 0) {
      state.custom_cylinder_item_types = JSON.parse(JSON.stringify(DEFAULT_CYLINDER_ITEM_TYPES));
      this.saveState(env, state);
    } else {
      // Filter out any items that were permanently deleted
      state.custom_cylinder_item_types = state.custom_cylinder_item_types.filter(
        item => !tombstones.has(item.id)
      );
    }

    return state.custom_cylinder_item_types;
  }

  static addCustomItemType(
    env: RuntimeEnvironment,
    item: CustomCylinderItemType,
    userId: string
  ): CustomCylinderItemType {
    const state = this.getState(env);
    if (!state.custom_cylinder_item_types) {
      state.custom_cylinder_item_types = JSON.parse(JSON.stringify(DEFAULT_CYLINDER_ITEM_TYPES));
    }
    const existing = state.custom_cylinder_item_types.find(
      i => i.id === item.id || i.name.trim() === item.name.trim()
    );
    if (existing) {
      existing.name = item.name;
      existing.category = item.category;
      existing.unit = item.unit;
      existing.description = item.description;
      this.saveState(env, state);
      return existing;
    }

    state.custom_cylinder_item_types.push(item);
    this.saveState(env, state);

    // Ensure all 3 in-memory database environments receive this item immediately
    const allEnvs: RuntimeEnvironment[] = ['OFFICE_WIN11', 'WAREHOUSE_WIN7', 'CLOUD_WEB'];
    for (const otherEnv of allEnvs) {
      if (otherEnv !== env) {
        const otherState = this.getState(otherEnv);
        if (otherState) {
          if (!otherState.custom_cylinder_item_types) {
            otherState.custom_cylinder_item_types = JSON.parse(JSON.stringify(DEFAULT_CYLINDER_ITEM_TYPES));
          }
          if (!otherState.custom_cylinder_item_types.some(x => x.id === item.id || x.name.trim() === item.name.trim())) {
            otherState.custom_cylinder_item_types.push(item);
            this.saveState(otherEnv, otherState);
          }
        }
      }
    }

    // Broadcast across windows / desktop tabs
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel('mgas_kardex_sync_channel');
        bc.postMessage({ type: 'CUSTOM_ITEM_TYPE_ADDED', item });
        bc.close();
      }
    } catch {}

    // Record sync event
    this.recordLocalChange(
      env,
      userId,
      'SETTING',
      'CREATE',
      `ITEM_TYPE_${item.id}`,
      item,
      `تعریف نوع قلم وارده جدید: ${item.name}`,
      { item_name: item.name, category: item.category }
    );

    return item;
  }

  static updateCustomItemType(
    env: RuntimeEnvironment,
    updatedItem: CustomCylinderItemType,
    userId: string
  ): CustomCylinderItemType {
    const state = this.getState(env);
    if (!state.custom_cylinder_item_types) {
      state.custom_cylinder_item_types = JSON.parse(JSON.stringify(DEFAULT_CYLINDER_ITEM_TYPES));
    }

    const idx = state.custom_cylinder_item_types.findIndex(i => i.id === updatedItem.id);
    if (idx !== -1) {
      state.custom_cylinder_item_types[idx] = { ...updatedItem };
    } else {
      state.custom_cylinder_item_types.push(updatedItem);
    }
    this.saveState(env, state);

    // Sync to other environments in memory
    const allEnvs: RuntimeEnvironment[] = ['OFFICE_WIN11', 'WAREHOUSE_WIN7', 'CLOUD_WEB'];
    for (const otherEnv of allEnvs) {
      if (otherEnv !== env) {
        const otherState = this.getState(otherEnv);
        if (otherState?.custom_cylinder_item_types) {
          const oIdx = otherState.custom_cylinder_item_types.findIndex(x => x.id === updatedItem.id);
          if (oIdx !== -1) {
            otherState.custom_cylinder_item_types[oIdx] = { ...updatedItem };
          } else {
            otherState.custom_cylinder_item_types.push(updatedItem);
          }
          this.saveState(otherEnv, otherState);
        }
      }
    }

    // Broadcast change
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel('mgas_kardex_sync_channel');
        bc.postMessage({ type: 'CUSTOM_ITEM_TYPE_UPDATED', item: updatedItem });
        bc.close();
      }
    } catch {}

    this.recordLocalChange(
      env,
      userId,
      'SETTING',
      'UPDATE',
      `ITEM_TYPE_${updatedItem.id}`,
      updatedItem,
      `ویرایش مشخصات نوع قلم وارده: ${updatedItem.name}`,
      { item_name: updatedItem.name, category: updatedItem.category }
    );

    return updatedItem;
  }

  static deleteCustomItemType(
    env: RuntimeEnvironment,
    itemId: string,
    userId: string
  ): boolean {
    this.markEntityPermanentlyDeleted(itemId);
    this.markEntityPermanentlyDeleted(`ITEM_TYPE_${itemId}`);

    const allEnvs: RuntimeEnvironment[] = ['OFFICE_WIN11', 'WAREHOUSE_WIN7', 'CLOUD_WEB'];
    let removed: CustomCylinderItemType | undefined;

    for (const targetEnv of allEnvs) {
      const s = this.getState(targetEnv);
      if (s.custom_cylinder_item_types) {
        if (!removed) removed = s.custom_cylinder_item_types.find(i => i.id === itemId);
        s.custom_cylinder_item_types = s.custom_cylinder_item_types.filter(i => i.id !== itemId);
        this.saveState(targetEnv, s);
      }
    }

    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel('mgas_kardex_sync_channel');
        bc.postMessage({ type: 'CUSTOM_ITEM_TYPE_DELETED', itemId });
        bc.close();
      }
    } catch {}

    if (removed) {
      this.recordLocalChange(
        env,
        userId,
        'SETTING',
        'DELETE',
        `ITEM_TYPE_${itemId}`,
        removed,
        `حذف نوع قلم وارده: ${removed.name}`,
        { item_name: removed.name }
      );
    }

    return true;
  }

  // User & Security Management
  static getUsers(env: RuntimeEnvironment): User[] {
    const state = this.getState(env);
    return state.users || SEED_USERS;
  }

  static getUserById(env: RuntimeEnvironment, userId: string): User | undefined {
    const state = this.getState(env);
    return (state.users || SEED_USERS).find(u => u.user_id === userId);
  }

  /**
   * Enforce that ONLY Mr. Eng. Amouei (Management / Admin) can edit user credentials and system IDs
   */
  static isManagerAmoueiAuthorized(actorUser?: User | null): boolean {
    if (!actorUser) return false;
    const isAmouei =
      actorUser.username === 'amouei' ||
      actorUser.user_id === 'USR-001' ||
      actorUser.role === 'ADMIN' ||
      actorUser.full_name?.includes('عمویی');
    return isAmouei;
  }

  private static karamiSessionStartedAt: string = new Date().toISOString();

  /**
   * Get Mrs. Karami's active 1-hour editing session remaining time with live countdown
   */
  static getKaramiSessionRemaining(maxHours: number = 1): {
    remainingMs: number;
    remainingMinutes: number;
    remainingSeconds: number;
    isExpired: boolean;
    startedAt: string;
  } {
    const maxMs = maxHours * 60 * 60 * 1000;
    const startedAt = this.karamiSessionStartedAt || new Date().toISOString();
    const startTs = new Date(startedAt).getTime();
    const now = Date.now();
    const elapsed = isNaN(startTs) ? 0 : now - startTs;
    const remainingMs = Math.max(0, maxMs - elapsed);
    const isExpired = remainingMs <= 0;
    const totalSecs = Math.floor(remainingMs / 1000);
    const remainingMinutes = Math.floor(totalSecs / 60);
    const remainingSeconds = totalSecs % 60;

    return {
      remainingMs,
      remainingMinutes,
      remainingSeconds,
      isExpired,
      startedAt
    };
  }

  /**
   * One-click renewal of Mrs. Karami's 1-hour session
   */
  static renewKaramiSession(): void {
    const nowIso = new Date().toISOString();
    this.karamiSessionStartedAt = nowIso;
    if (typeof window !== 'undefined') {
      try {
        window.dispatchEvent(new CustomEvent('mgas:karami_session_renewed', { detail: { renewedAt: nowIso } }));
      } catch (e) {
        console.warn('Could not dispatch renewed event:', e);
      }
    }
  }

  /**
   * Check document edit permission with strict 1-hour enforcement for Internal Manager Mrs. Karami.
   * "مدیر داخلی خانم کرمی فقط حداکثر تا یک ساعت امکان ویرایش تمامی اسناد را داشته باشد"
   * - Mrs. Karami can ONLY edit documents within 1 hour of active editing session.
   * - General Manager Mr. Eng. Amouei (Admin) has unrestricted master edit permission.
   */
  static checkDocumentEditPermission(
    env: RuntimeEnvironment,
    actorUser: User | null,
    documentCreatedAt?: string,
    sessionAuthenticatedAt?: string
  ): DocumentEditPermissionResult {
    if (!actorUser) {
      return {
        allowed: false,
        reason: 'جهت انجام عملیات ویرایش، ورود به حساب کاربری معتبر الزامی است.',
        isInternalManager: false,
        restrictionType: 'ROLE_DENIED'
      };
    }

    // 1. Master Admin / General Manager (Mr. Eng. Amouei)
    const isMasterAdmin = actorUser.username === 'amouei' || actorUser.user_id === 'USR-001' || actorUser.role === 'ADMIN';
    if (isMasterAdmin) {
      return {
        allowed: true,
        isInternalManager: false
      };
    }

    // 2. Internal Manager (Mrs. Karami) - strictly max 1 hour editing rule
    const isInternalManager = actorUser.role === 'INTERNAL_MANAGER' || actorUser.username === 'karami';
    if (isInternalManager) {
      const state = this.getState(env);
      const maxHours = state.security_policy?.internalManagerMaxEditWindowHours ?? 1;
      
      const sessionInfo = this.getKaramiSessionRemaining(maxHours);

      // If the 1-hour editing session has genuinely expired
      if (sessionInfo.isExpired) {
        return {
          allowed: false,
          isInternalManager: true,
          maxHoursAllowed: maxHours,
          remainingMinutes: 0,
          remainingSeconds: 0,
          restrictionType: 'SESSION_EXPIRED',
          reason: `مهلت ۱ ساعته ویرایش اسناد برای مدیر داخلی (خانم کرمی) به پایان رسیده است. لطفاً جهت ادامه با یک کلیک روی ساعت دیجیتال، نشست را تمدید فرمایید یا با آقای مهندس عمویی هماهنگ فرمایید.`
        };
      }

      return {
        allowed: true,
        isInternalManager: true,
        maxHoursAllowed: maxHours,
        remainingMinutes: Math.max(1, sessionInfo.remainingMinutes),
        remainingSeconds: sessionInfo.remainingSeconds
      };
    }

    // 3. Warehouse Keeper (مهندس حاجی‌وند در انبار مرکزی / ویندوز 7)
    // Full operational editing permissions on desktop and warehouse environments
    if (actorUser.role === 'WAREHOUSE_KEEPER') {
      return {
        allowed: true,
        isInternalManager: false
      };
    }

    return {
      allowed: true,
      isInternalManager: false
    };
  }

  /**
   * Update an existing Gas Kardex entry with audit trail and 1-hour policy validation.
   */
  static updateKardexEntry(
    env: RuntimeEnvironment,
    entryId: string,
    updatedData: Partial<GasKardexEntry>,
    actorUser: User | null
  ): { success: boolean; entry?: GasKardexEntry; error?: string } {
    const state = this.getState(env);
    if (!state.gas_kardex_entries) state.gas_kardex_entries = [];

    const existing = state.gas_kardex_entries.find(e => e.entry_id === entryId);
    if (!existing) {
      return { success: false, error: 'سند کاردکس مورد نظر در پایگاه داده یافت نشد.' };
    }

    const check = this.checkDocumentEditPermission(env, actorUser, existing.created_at);
    if (!check.allowed) {
      return { success: false, error: check.reason };
    }

    const fullEntry: GasKardexEntry = {
      ...existing,
      ...updatedData,
      entry_id: existing.entry_id,
      customer_id: updatedData.customer_id || existing.customer_id,
      customer_name: updatedData.customer_name || existing.customer_name,
      updated_at: new Date().toISOString()
    };

    try {
      this.recordLocalChange(
        env,
        actorUser?.user_id || 'USR-001',
        'GAS_KARDEX',
        'UPDATE',
        entryId,
        fullEntry,
        `ویرایش سند ردیف کاردکس گاز شماره برگه ${fullEntry.transfer_sheet_number || fullEntry.entry_id}`,
        { entry_id: entryId, sheet_number: fullEntry.transfer_sheet_number }
      );
      return { success: true, entry: fullEntry };
    } catch (e: any) {
      return { success: false, error: e?.message || 'خطا در ویرایش سند کاردکس' };
    }
  }

  /**
   * Move Kardex entry to Trash (Soft Delete with Recovery capability)
   */
  static moveKardexEntryToTrash(
    env: RuntimeEnvironment,
    entryId: string,
    actorUser: User | null,
    reason?: string
  ): { success: boolean; entry?: GasKardexEntry; error?: string } {
    const state = this.getState(env);
    if (!state.gas_kardex_entries) state.gas_kardex_entries = [];

    const existingIndex = state.gas_kardex_entries.findIndex(e => e.entry_id === entryId);
    if (existingIndex === -1) {
      return { success: false, error: 'سند کاردکس مورد نظر در پایگاه داده یافت نشد.' };
    }
    const existing = state.gas_kardex_entries[existingIndex];

    const check = this.checkDocumentEditPermission(env, actorUser, existing.created_at);
    if (!check.allowed) {
      return { success: false, error: check.reason };
    }

    const trashedEntry: GasKardexEntry = {
      ...existing,
      is_deleted: true,
      deleted_at: new Date().toISOString(),
      deleted_by: actorUser?.username || actorUser?.full_name || 'کاربر سیستم',
      delete_reason: reason || 'انتقال به سطل آشغال توسط کاربر',
      updated_at: new Date().toISOString()
    };

    // Immediately reflect the soft deletion in memory state
    state.gas_kardex_entries[existingIndex] = trashedEntry;

    try {
      this.recordLocalChange(
        env,
        actorUser?.user_id || 'USR-001',
        'GAS_KARDEX',
        'UPDATE',
        entryId,
        trashedEntry,
        `انتقال سند کاردکس گاز شماره برگه ${trashedEntry.transfer_sheet_number || trashedEntry.entry_id} به سطل آشغال`,
        { entry_id: entryId, sheet_number: trashedEntry.transfer_sheet_number, reason }
      );

      // Recalculate remaining active entries for this customer partitioned by cylinder type
      const custId = existing.customer_id;
      LocalStorageManager.recalculateCustomerKardex(state, custId);
      this.saveState(env, state);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('mgas:kardex_trash_updated', { detail: trashedEntry }));
        window.dispatchEvent(new CustomEvent('mgas:db_refreshed', { detail: { env } }));
        window.dispatchEvent(new CustomEvent('mgas:kardex_updated', { detail: trashedEntry }));
      }
      return { success: true, entry: trashedEntry };
    } catch (e: any) {
      return { success: false, error: e?.message || 'خطا در انتقال سند کاردکس به سطل آشغال' };
    }
  }

  /**
   * Restore Kardex entry from Trash (Recovery)
   */
  static restoreKardexEntry(
    env: RuntimeEnvironment,
    entryId: string,
    actorUser: User | null
  ): { success: boolean; entry?: GasKardexEntry; error?: string } {
    const state = this.getState(env);
    if (!state.gas_kardex_entries) state.gas_kardex_entries = [];

    const existingIndex = state.gas_kardex_entries.findIndex(e => e.entry_id === entryId);
    if (existingIndex === -1) {
      return { success: false, error: 'سند کاردکس مورد نظر در سطل آشغال یافت نشد.' };
    }
    const existing = state.gas_kardex_entries[existingIndex];

    const restoredEntry: GasKardexEntry = {
      ...existing,
      is_deleted: false,
      deleted_at: undefined,
      deleted_by: undefined,
      delete_reason: undefined,
      updated_at: new Date().toISOString()
    };

    // Immediately reflect the recovery in memory state
    state.gas_kardex_entries[existingIndex] = restoredEntry;

    try {
      this.recordLocalChange(
        env,
        actorUser?.user_id || 'USR-001',
        'GAS_KARDEX',
        'UPDATE',
        entryId,
        restoredEntry,
        `بازیابی و ریکاوری سند کاردکس گاز شماره برگه ${restoredEntry.transfer_sheet_number || restoredEntry.entry_id} از سطل آشغال`,
        { entry_id: entryId, sheet_number: restoredEntry.transfer_sheet_number }
      );

      // Recalculate balances including the restored entry partitioned by cylinder type
      const custId = existing.customer_id;
      LocalStorageManager.recalculateCustomerKardex(state, custId);
      this.saveState(env, state);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('mgas:kardex_trash_updated', { detail: restoredEntry }));
        window.dispatchEvent(new CustomEvent('mgas:db_refreshed', { detail: { env } }));
        window.dispatchEvent(new CustomEvent('mgas:kardex_updated', { detail: restoredEntry }));
      }
      return { success: true, entry: restoredEntry };
    } catch (e: any) {
      return { success: false, error: e?.message || 'خطا در بازیابی و ریکاوری سند کاردکس' };
    }
  }

  /**
   * Permanently delete a single entry from trash (Never resurrects)
   */
  static permanentDeleteKardexEntry(
    env: RuntimeEnvironment,
    entryId: string,
    actorUser: User | null
  ): { success: boolean; error?: string } {
    // 1. Mark permanently deleted in tombstone registry
    this.markEntityPermanentlyDeleted(entryId);

    const allEnvs: RuntimeEnvironment[] = ['OFFICE_WIN11', 'WAREHOUSE_WIN7', 'CLOUD_WEB'];
    let deletedItem: GasKardexEntry | undefined;

    for (const targetEnv of allEnvs) {
      const s = this.getState(targetEnv);
      if (s.gas_kardex_entries) {
        const idx = s.gas_kardex_entries.findIndex(e => e.entry_id === entryId);
        if (idx >= 0) {
          if (!deletedItem) deletedItem = s.gas_kardex_entries[idx];
          s.gas_kardex_entries.splice(idx, 1);
          const custId = deletedItem?.customer_id;
          if (custId) {
            LocalStorageManager.recalculateCustomerKardex(s, custId);
          }
          this.saveState(targetEnv, s);
        }
      }
    }

    if (!deletedItem) {
      return { success: false, error: 'سند کاردکس مورد نظر یافت نشد.' };
    }

    try {
      this.recordLocalChange(
        env,
        actorUser?.user_id || 'USR-001',
        'GAS_KARDEX',
        'DELETE',
        entryId,
        null,
        `حذف دائمی سند کاردکس گاز شماره برگه ${deletedItem.transfer_sheet_number || entryId} از سطل آشغال`,
        { entry_id: entryId }
      );

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('mgas:kardex_trash_updated', { detail: { entry_id: entryId, permanent: true } }));
        window.dispatchEvent(new CustomEvent('mgas:db_refreshed', { detail: { env } }));
        window.dispatchEvent(new CustomEvent('mgas:kardex_updated', { detail: { entry_id: entryId, deleted: true } }));
      }
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || 'خطا در حذف دائمی سند' };
    }
  }

  /**
   * Empty all items in trash (Permanently deletes and never resurrects)
   */
  static emptyKardexTrash(
    env: RuntimeEnvironment,
    customerId?: string,
    actorUser?: User | null
  ): { success: boolean; count: number; error?: string } {
    if (actorUser && (actorUser.role === 'WAREHOUSE_KEEPER' || actorUser.username === 'hajivand' || actorUser.username === 'gholizadeh' || actorUser.user_id === 'USR-003')) {
      return { success: false, count: 0, error: 'خطای عدم دسترسی: انباردار مجاز به تغییر یا تخلیه کاردکس نمی‌باشد.' };
    }
    const state = this.getState(env);
    if (!state.gas_kardex_entries) return { success: true, count: 0 };

    const toRemove = state.gas_kardex_entries.filter(e => {
      if (!e.is_deleted) return false;
      if (customerId && e.customer_id !== customerId) return false;
      return true;
    });

    if (toRemove.length === 0) return { success: true, count: 0 };

    // 1. Mark each entry permanently deleted in tombstone registry
    toRemove.forEach(item => {
      this.markEntityPermanentlyDeleted(item.entry_id);
    });

    // 2. Remove from ALL 3 local environments and recalculate balances
    const allEnvs: RuntimeEnvironment[] = ['OFFICE_WIN11', 'WAREHOUSE_WIN7', 'CLOUD_WEB'];
    const affectedCustomerIds = Array.from(new Set(toRemove.map(r => r.customer_id)));

    for (const targetEnv of allEnvs) {
      const s = this.getState(targetEnv);
      if (s.gas_kardex_entries) {
        s.gas_kardex_entries = s.gas_kardex_entries.filter(e => {
          if (!e.is_deleted) return true;
          if (customerId && e.customer_id !== customerId) return true;
          return false;
        });
        affectedCustomerIds.forEach(cId => {
          LocalStorageManager.recalculateCustomerKardex(s, cId);
        });
        this.saveState(targetEnv, s);
      }
    }

    // 3. Record individual DELETE sync events so server and other nodes know each entry was purged
    for (const item of toRemove) {
      try {
        this.recordLocalChange(
          env,
          actorUser?.user_id || 'USR-001',
          'GAS_KARDEX',
          'DELETE',
          item.entry_id,
          null,
          `حذف دائمی سند کاردکس گاز شماره برگه ${item.transfer_sheet_number || item.entry_id} در تخلیه کامل سطل آشغال`,
          { entry_id: item.entry_id }
        );
      } catch {}
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('mgas:kardex_trash_updated', { detail: { count: toRemove.length } }));
      window.dispatchEvent(new CustomEvent('mgas:db_refreshed', { detail: { env } }));
      window.dispatchEvent(new CustomEvent('mgas:kardex_updated', { detail: { count: toRemove.length, emptied: true } }));
    }
    return { success: true, count: toRemove.length };
  }

  /**
   * Update an existing Invoice with audit trail and 1-hour policy validation.
   */
  static updateInvoice(
    env: RuntimeEnvironment,
    invoiceId: string,
    updatedData: Partial<Invoice>,
    actorUser: User | null
  ): { success: boolean; invoice?: Invoice; error?: string } {
    const state = this.getState(env);
    if (!state.invoices) state.invoices = [];

    const existing = state.invoices.find(i => i.invoice_id === invoiceId);
    if (!existing) {
      return { success: false, error: 'فاکتور مورد نظر یافت نشد.' };
    }

    const check = this.checkDocumentEditPermission(env, actorUser, existing.created_at);
    if (!check.allowed) {
      return { success: false, error: check.reason };
    }

    const fullInvoice: Invoice = {
      ...existing,
      ...updatedData,
      invoice_id: existing.invoice_id,
      updated_at: new Date().toISOString()
    };

    try {
      this.recordLocalChange(
        env,
        actorUser?.user_id || 'USR-001',
        'INVOICE',
        'UPDATE',
        invoiceId,
        fullInvoice,
        `ویرایش سند فاکتور شماره ${fullInvoice.invoice_number}`,
        { invoice_number: fullInvoice.invoice_number, status: fullInvoice.status }
      );
      return { success: true, invoice: fullInvoice };
    } catch (e: any) {
      return { success: false, error: e?.message || 'خطا در ویرایش سند فاکتور' };
    }
  }

  /**
   * Delete an existing Invoice with audit trail and 1-hour policy validation.
   */
  static deleteInvoice(
    env: RuntimeEnvironment,
    invoiceId: string,
    actorUser: User | null
  ): { success: boolean; error?: string } {
    const state = this.getState(env);
    if (!state.invoices) state.invoices = [];
    const existing = state.invoices.find(i => i.invoice_id === invoiceId);
    if (!existing) {
      return { success: false, error: 'فاکتور مورد نظر یافت نشد.' };
    }

    const check = this.checkDocumentEditPermission(env, actorUser, existing.created_at);
    if (!check.allowed) {
      return { success: false, error: check.reason };
    }

    try {
      this.recordLocalChange(
        env,
        actorUser?.user_id || 'USR-001',
        'INVOICE',
        'DELETE',
        invoiceId,
        { invoice_id: invoiceId },
        `حذف فاکتور شماره ${existing.invoice_number}`,
        { invoice_number: existing.invoice_number }
      );
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || 'خطا در حذف فاکتور' };
    }
  }

  /**
   * Update credentials & system ID for a user.
   * Strictly gated: ONLY Manager Mr. Eng. Amouei can perform this action!
   */
  static updateUserCredentials(
    env: RuntimeEnvironment,
    actorUser: User | null,
    targetUserId: string,
    params: {
      password_hash?: string;
      password_salt?: string;
      system_id?: string;
      system_name?: string;
      full_name?: string;
      role_title?: string;
    }
  ): { success: boolean; error?: string } {
    if (!this.isManagerAmoueiAuthorized(actorUser)) {
      const state = this.getState(env);
      state.audit_logs.unshift({
        audit_id: `AUD-SEC-VIOLATION-${Date.now()}`,
        user_id: actorUser?.user_id || 'UNAUTHORIZED',
        device_id: state.deviceId,
        action: 'UNAUTHORIZED_CREDENTIALS_EDIT_BLOCKED',
        entity_type: 'USER',
        entity_id: targetUserId,
        timestamp: new Date().toISOString(),
        metadata: {
          attempted_by: actorUser?.username || 'anonymous',
          reason: 'Only Manager Mr. Eng. Amouei can edit credentials and system IDs'
        }
      });
      this.saveState(env, state);
      return {
        success: false,
        error: 'خطای عدم دسترسی: تنها کاربر آقای مهندس عمویی (مدیریت ارشد) مجاز به ویرایش نام کاربران و پسوردها می‌باشد.'
      };
    }

    const state = this.getState(env);
    const users = state.users || [...SEED_USERS];
    const idx = users.findIndex(u => u.user_id === targetUserId);
    if (idx === -1) {
      return { success: false, error: 'کاربر مورد نظر در پایگاه داده یافت نشد.' };
    }

    const target = users[idx];
    const updatedUser: User = {
      ...target,
      is_password_changed: true,
      password: undefined // NEVER store plain text
    };

    if (params.password_hash && params.password_salt) {
      updatedUser.password_hash = params.password_hash;
      updatedUser.password_salt = params.password_salt;
    }
    if (params.system_id) {
      updatedUser.system_id = params.system_id;
      updatedUser.allowed_device_id = params.system_id;
    }
    if (params.system_name) {
      updatedUser.system_name = params.system_name;
    }
    if (params.full_name && params.full_name.trim()) {
      updatedUser.full_name = params.full_name.trim();
    }
    if (params.role_title && params.role_title.trim()) {
      updatedUser.role_title = params.role_title.trim();
    }

    users[idx] = updatedUser;
    state.users = users;

    // Reset failed login attempts
    if (state.security_policy?.failedAttempts) {
      delete state.security_policy.failedAttempts[targetUserId];
    }
    if (state.security_policy?.lockedUntil) {
      delete state.security_policy.lockedUntil[targetUserId];
    }

    // Immutable audit log
    state.audit_logs.unshift({
      audit_id: `AUD-SEC-CRED-${Date.now()}`,
      user_id: actorUser!.user_id,
      device_id: state.deviceId,
      action: 'UPDATE_CREDENTIALS_AND_SYSTEM_ID',
      entity_type: 'USER',
      entity_id: targetUserId,
      timestamp: new Date().toISOString(),
      metadata: {
        updated_username: target.username,
        updated_full_name: updatedUser.full_name,
        new_system_id: updatedUser.system_id,
        password_updated: !!params.password_hash,
        authorized_by: 'مدیر عامل آقای مهندس عمویی'
      }
    });

    this.saveState(env, state);

    // Record authoritative SyncEvent so change is immediately propagated to Cloudflare D1 and all clients
    try {
      this.recordLocalChange(
        env,
        actorUser!.user_id,
        'USER',
        'UPDATE',
        targetUserId,
        updatedUser,
        `به‌روزرسانی اطلاعات هویتی و کلمه عبور کاربر ${updatedUser.full_name} (@${updatedUser.username}) توسط مدیریت ارشد`,
        {
          target_username: updatedUser.username,
          target_user_id: targetUserId,
          system_id: updatedUser.system_id,
          has_new_password: !!params.password_hash
        }
      );
    } catch (syncErr) {
      console.warn('[LocalStorageManager] User update sync recording notice:', syncErr);
    }

    // Synchronize user update across ALL 3 database environments
    const allEnvs: RuntimeEnvironment[] = ['OFFICE_WIN11', 'WAREHOUSE_WIN7', 'CLOUD_WEB'];
    for (const targetEnv of allEnvs) {
      if (targetEnv !== env) {
        try {
          const otherState = this.getState(targetEnv);
          if (otherState && otherState.users) {
            const oIdx = otherState.users.findIndex(u => u.user_id === targetUserId);
            if (oIdx >= 0) {
              otherState.users[oIdx] = { ...updatedUser };
              this.saveState(targetEnv, otherState);
            }
          }
        } catch {}
      }
    }

    if (typeof window !== 'undefined') {
      try {
        window.dispatchEvent(new CustomEvent('mgas:users_updated', { detail: { targetUserId, updatedUser } }));
        window.dispatchEvent(new CustomEvent('mgas:db_refreshed', { detail: { env } }));
      } catch {}
    }

    return { success: true };
  }

  /**
   * Save or Update a User and synchronize immediately across all client databases
   */
  static saveOrUpdateUser(
    env: RuntimeEnvironment,
    actorUser: User | null,
    targetUser: User,
    isNew: boolean = false
  ): { success: boolean; user?: User; error?: string } {
    if (!this.isManagerAmoueiAuthorized(actorUser)) {
      return {
        success: false,
        error: 'خطای عدم دسترسی: تنها کاربر آقای مهندس عمویی (مدیریت ارشد) مجاز به تعریف یا ویرایش کاربران می‌باشد.'
      };
    }

    const state = this.getState(env);
    if (!state.users) state.users = [];

    const existingIdx = state.users.findIndex(
      u => u.user_id === targetUser.user_id || u.username.toLowerCase() === targetUser.username.toLowerCase()
    );

    const sanitizedUser: User = {
      ...targetUser,
      username: targetUser.username.trim().toLowerCase(),
      full_name: targetUser.full_name.trim(),
      password: undefined
    };

    if (existingIdx >= 0) {
      state.users[existingIdx] = sanitizedUser;
    } else {
      state.users.push(sanitizedUser);
    }

    this.saveState(env, state);

    // Sync to all local environments
    const allEnvs: RuntimeEnvironment[] = ['OFFICE_WIN11', 'WAREHOUSE_WIN7', 'CLOUD_WEB'];
    for (const otherEnv of allEnvs) {
      if (otherEnv !== env) {
        const otherState = this.getState(otherEnv);
        if (otherState && otherState.users) {
          const oIdx = otherState.users.findIndex(
            u => u.user_id === sanitizedUser.user_id || u.username.toLowerCase() === sanitizedUser.username.toLowerCase()
          );
          if (oIdx >= 0) {
            otherState.users[oIdx] = { ...sanitizedUser };
          } else {
            otherState.users.push({ ...sanitizedUser });
          }
          this.saveState(otherEnv, otherState);
        }
      }
    }

    // Record SyncEvent for propagation to Cloudflare D1 and other stations
    try {
      this.recordLocalChange(
        env,
        actorUser!.user_id,
        'USER',
        isNew ? 'CREATE' : 'UPDATE',
        sanitizedUser.user_id,
        sanitizedUser,
        `${isNew ? 'ثبت کاربر جدید' : 'ویرایش مشخصات کاربر'} ${sanitizedUser.full_name} (@${sanitizedUser.username})`,
        { username: sanitizedUser.username, role: sanitizedUser.role, system_id: sanitizedUser.system_id }
      );
    } catch {}

    if (typeof window !== 'undefined') {
      try {
        window.dispatchEvent(new CustomEvent('mgas:users_updated', { detail: { targetUserId: sanitizedUser.user_id, updatedUser: sanitizedUser } }));
        window.dispatchEvent(new CustomEvent('mgas:db_refreshed', { detail: { env } }));
      } catch {}
    }

    return { success: true, user: sanitizedUser };
  }

  /**
   * Delete a User and broadcast deletion across all client databases
   */
  static deleteUser(
    env: RuntimeEnvironment,
    actorUser: User | null,
    targetUserId: string
  ): { success: boolean; error?: string } {
    if (!this.isManagerAmoueiAuthorized(actorUser)) {
      return {
        success: false,
        error: 'خطای عدم دسترسی: تنها کاربر آقای مهندس عمویی مجاز به حذف کاربران می‌باشد.'
      };
    }

    // Prevent deleting primary admin Amouei
    if (targetUserId === 'USR-001') {
      return {
        success: false,
        error: 'امکان حذف کاربر اصلی مدیریت عامل (مهندس موسی عمویی) وجود ندارد.'
      };
    }

    const state = this.getState(env);
    const existing = state.users.find(u => u.user_id === targetUserId);
    if (!existing) {
      return { success: false, error: 'کاربر مورد نظر یافت نشد.' };
    }

    // Mark permanently deleted in tombstone
    this.markEntityPermanentlyDeleted(targetUserId);

    // Delete from all local database states
    const allEnvs: RuntimeEnvironment[] = ['OFFICE_WIN11', 'WAREHOUSE_WIN7', 'CLOUD_WEB'];
    for (const targetEnv of allEnvs) {
      const s = this.getState(targetEnv);
      if (s.users) {
        s.users = s.users.filter(u => u.user_id !== targetUserId && u.username.toLowerCase() !== existing.username.toLowerCase());
        this.saveState(targetEnv, s);
      }
    }

    // Record SyncEvent for Cloudflare and client network
    try {
      this.recordLocalChange(
        env,
        actorUser!.user_id,
        'USER',
        'DELETE',
        targetUserId,
        { user_id: targetUserId, username: existing.username },
        `حذف کاربر ${existing.full_name} (@${existing.username}) توسط مدیریت ارشد`,
        { user_id: targetUserId, username: existing.username }
      );
    } catch {}

    if (typeof window !== 'undefined') {
      try {
        window.dispatchEvent(new CustomEvent('mgas:users_updated', { detail: { targetUserId, deleted: true } }));
        window.dispatchEvent(new CustomEvent('mgas:db_refreshed', { detail: { env } }));
      } catch {}
    }

    return { success: true };
  }

  /**
   * Reconcile users received from Cloudflare D1 into all local client database states
   * Guarantees all clients have up-to-date user credentials offline.
   */
  static syncUsersFromCloud(env: RuntimeEnvironment, cloudUsers: User[]): number {
    if (!Array.isArray(cloudUsers) || cloudUsers.length === 0) return 0;

    const allEnvs: RuntimeEnvironment[] = ['OFFICE_WIN11', 'WAREHOUSE_WIN7', 'CLOUD_WEB'];
    let updatedCount = 0;

    for (const targetEnv of allEnvs) {
      const state = this.getState(targetEnv);
      if (!state.users) state.users = [];

      for (const cu of cloudUsers) {
        if (!cu || !cu.user_id) continue;
        const cleanUser: User = {
          ...cu,
          username: cu.username.toLowerCase().trim(),
          password: undefined
        };

        const existingIdx = state.users.findIndex(
          u => u.user_id === cleanUser.user_id || u.username.toLowerCase() === cleanUser.username
        );

        if (existingIdx >= 0) {
          const current = state.users[existingIdx];
          // Check if changed
          const isChanged =
            current.full_name !== cleanUser.full_name ||
            current.password_hash !== cleanUser.password_hash ||
            current.password_salt !== cleanUser.password_salt ||
            current.role !== cleanUser.role ||
            current.role_title !== cleanUser.role_title ||
            current.system_id !== cleanUser.system_id;

          if (isChanged) {
            state.users[existingIdx] = {
              ...current,
              ...cleanUser
            };
            if (targetEnv === env) updatedCount++;
          }
        } else {
          state.users.push(cleanUser);
          if (targetEnv === env) updatedCount++;
        }
      }

      this.saveState(targetEnv, state);
    }

    if (updatedCount > 0 && typeof window !== 'undefined') {
      try {
        window.dispatchEvent(new CustomEvent('mgas:users_updated', { detail: { count: updatedCount } }));
        window.dispatchEvent(new CustomEvent('mgas:db_refreshed', { detail: { env } }));
      } catch {}
    }

    return updatedCount;
  }

  static updateUserPassword(
    env: RuntimeEnvironment,
    userId: string,
    newPasswordHash: string,
    saltHex: string,
    plainPasswordForAudit?: string
  ): boolean {
    const state = this.getState(env);
    const users = state.users || [...SEED_USERS];
    const idx = users.findIndex(u => u.user_id === userId);
    if (idx === -1) return false;

    const updated = {
      ...users[idx],
      password_hash: newPasswordHash,
      password_salt: saltHex,
      is_password_changed: true
    };
    delete (updated as any).password;
    users[idx] = updated;

    state.users = users;

    // Reset failed attempts upon successful password change
    if (state.security_policy?.failedAttempts) {
      delete state.security_policy.failedAttempts[userId];
    }
    if (state.security_policy?.lockedUntil) {
      delete state.security_policy.lockedUntil[userId];
    }

    // Synchronize to all local database environments (Office Win11, Warehouse Win7, Cloud Web)
    const allEnvs: RuntimeEnvironment[] = ['OFFICE_WIN11', 'WAREHOUSE_WIN7', 'CLOUD_WEB'];
    for (const otherEnv of allEnvs) {
      if (otherEnv !== env) {
        const otherState = this.getState(otherEnv);
        if (otherState && otherState.users) {
          const oIdx = otherState.users.findIndex(u => u.user_id === userId);
          if (oIdx >= 0) {
            otherState.users[oIdx] = {
              ...otherState.users[oIdx],
              password_hash: newPasswordHash,
              password_salt: saltHex,
              is_password_changed: true
            };
            this.saveState(otherEnv, otherState);
          }
        }
      }
    }

    // Add immutable audit log
    state.audit_logs.unshift({
      audit_id: `AUD-SEC-PASS-${Date.now()}`,
      user_id: userId,
      device_id: state.deviceId,
      action: 'UPDATE_PASSWORD_PBKDF2',
      entity_type: 'USER',
      entity_id: userId,
      timestamp: new Date().toISOString(),
      metadata: {
        algorithm: 'PBKDF2-SHA512',
        salt_prefix: saltHex.substring(0, 8),
        ip_lock: 'anbar.mgas.ir'
      }
    });

    this.saveState(env, state);

    try {
      this.recordLocalChange(
        env,
        userId,
        'USER',
        'UPDATE',
        userId,
        updated,
        `تغییر رمز عبور کاربر ${updated.full_name} (@${updated.username}) با الگوریتم PBKDF2-SHA512`,
        { username: updated.username, password_updated: true }
      );
    } catch {}

    return true;
  }

  static recordFailedLogin(env: RuntimeEnvironment, userIdOrName: string): { attempts: number; isLocked: boolean; lockMinutes: number } {
    const state = this.getState(env);
    if (!state.security_policy) {
      state.security_policy = {
        strictDomainLock: true,
        allowedDomain: 'anbar.mgas.ir',
        enforceDeviceBinding: true,
        requireStrongPassword: true,
        tamperProtectionEnabled: true,
        databaseWriteProtected: false,
        internalManagerMaxEditWindowHours: 1,
        failedAttempts: {},
        lockedUntil: {}
      };
    }

    const currentAttempts = (state.security_policy.failedAttempts[userIdOrName] || 0) + 1;
    state.security_policy.failedAttempts[userIdOrName] = currentAttempts;

    let isLocked = false;
    let lockMinutes = 0;

    // Brute force threshold: 5 failed attempts locks for 15 minutes
    if (currentAttempts >= 5) {
      isLocked = true;
      lockMinutes = 15;
      state.security_policy.lockedUntil[userIdOrName] = Date.now() + 15 * 60 * 1000;

      state.audit_logs.unshift({
        audit_id: `AUD-BRUTE-FORCE-${Date.now()}`,
        user_id: userIdOrName,
        device_id: state.deviceId,
        action: 'ACCOUNT_TEMPORARILY_LOCKED',
        entity_type: 'AUTH',
        entity_id: userIdOrName,
        timestamp: new Date().toISOString(),
        metadata: {
          failed_attempts: currentAttempts,
          locked_for_minutes: lockMinutes
        }
      });
    }

    this.saveState(env, state);
    return { attempts: currentAttempts, isLocked, lockMinutes };
  }

  static checkAccountLock(env: RuntimeEnvironment, userIdOrName: string): { isLocked: boolean; remainingSeconds: number } {
    const state = this.getState(env);
    const lockExpiry = state.security_policy?.lockedUntil?.[userIdOrName];
    if (!lockExpiry) return { isLocked: false, remainingSeconds: 0 };

    const remainingMs = lockExpiry - Date.now();
    if (remainingMs > 0) {
      return { isLocked: true, remainingSeconds: Math.ceil(remainingMs / 1000) };
    }

    // Expired lock, clear it
    if (state.security_policy?.lockedUntil) {
      delete state.security_policy.lockedUntil[userIdOrName];
      delete state.security_policy.failedAttempts[userIdOrName];
      this.saveState(env, state);
    }
    return { isLocked: false, remainingSeconds: 0 };
  }

  static resetFailedLogin(env: RuntimeEnvironment, userIdOrName: string) {
    const state = this.getState(env);
    if (state.security_policy?.failedAttempts?.[userIdOrName]) {
      delete state.security_policy.failedAttempts[userIdOrName];
    }
    if (state.security_policy?.lockedUntil?.[userIdOrName]) {
      delete state.security_policy.lockedUntil[userIdOrName];
    }
    this.saveState(env, state);
  }

  static setSecurityPolicy(env: RuntimeEnvironment, policy: Partial<SecurityPolicyState>) {
    const state = this.getState(env);
    state.security_policy = {
      ...state.security_policy,
      ...policy
    };
    this.saveState(env, state);
  }

  // Backup & Restore
  static exportBackupJSON(env: RuntimeEnvironment): string {
    const state = this.getState(env);
    return JSON.stringify(state, null, 2);
  }

  static importBackupJSON(env: RuntimeEnvironment, jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && parsed.products && parsed.customers && parsed.stock_movements) {
        this.saveState(env, parsed);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
}
