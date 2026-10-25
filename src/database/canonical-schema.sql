-- ==============================================================================
-- CANONICAL SQLITE & CLOUDFLARE D1 SCHEMA
-- THREE-DATABASE SYNCHRONIZATION ARCHITECTURE
-- Database 1: Cloudflare D1 (Central Cloud)
-- Database 2: Office PC SQLite (Windows 11)
-- Database 3: Warehouse PC SQLite (Windows 7)
-- ==============================================================================

PRAGMA foreign_keys = ON;

-- 1. USERS
CREATE TABLE IF NOT EXISTS users (
    user_id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    password_salt TEXT,
    is_password_changed INTEGER NOT NULL DEFAULT 1,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('ADMIN', 'WAREHOUSE_KEEPER', 'GENERAL_MANAGER', 'INTERNAL_MANAGER')),
    role_title TEXT,
    allowed_device_id TEXT NOT NULL,
    system_id TEXT,
    system_name TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 2. DEVICES
CREATE TABLE IF NOT EXISTS devices (
    device_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    os TEXT NOT NULL,
    location TEXT NOT NULL,
    last_seen_at TEXT NOT NULL,
    created_at TEXT NOT NULL
);

-- 3. CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
    category_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- 4. PRODUCTS
CREATE TABLE IF NOT EXISTS products (
    product_id TEXT PRIMARY KEY,
    sku TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    category_id TEXT NOT NULL,
    unit TEXT NOT NULL DEFAULT 'عدد',
    min_stock INTEGER NOT NULL DEFAULT 10,
    purchase_price REAL NOT NULL DEFAULT 0,
    sale_price REAL NOT NULL DEFAULT 0,
    barcode TEXT,
    description TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (category_id) REFERENCES categories(category_id)
);

CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);

-- 5. SUPPLIERS
CREATE TABLE IF NOT EXISTS suppliers (
    supplier_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    company_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT,
    credit_limit REAL NOT NULL DEFAULT 0,
    current_balance REAL NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- 6. CUSTOMERS (Includes rich profile fields for Excel / Text import)
CREATE TABLE IF NOT EXISTS customers (
    customer_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    company_name TEXT,
    phone TEXT NOT NULL,
    national_id TEXT,
    economic_code TEXT,
    province TEXT NOT NULL DEFAULT 'تهران',
    city TEXT NOT NULL DEFAULT 'تهران',
    address TEXT,
    credit_limit REAL NOT NULL DEFAULT 0,
    current_balance REAL NOT NULL DEFAULT 0,
    customer_type TEXT NOT NULL DEFAULT 'عمده',
    notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);

-- 7. WAREHOUSES
CREATE TABLE IF NOT EXISTS warehouses (
    warehouse_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    address TEXT NOT NULL,
    shelf_location TEXT DEFAULT 'A1',
    is_active INTEGER NOT NULL DEFAULT 1
);

-- 8. STOCK (Materialized current stock per warehouse, derived from stock_movements)
CREATE TABLE IF NOT EXISTS stock (
    product_id TEXT NOT NULL,
    warehouse_id TEXT NOT NULL,
    quantity REAL NOT NULL DEFAULT 0,
    last_updated_at TEXT NOT NULL,
    PRIMARY KEY (product_id, warehouse_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id),
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(warehouse_id)
);

-- 9. STOCK MOVEMENTS (IMMUTABLE TRANSACTIONAL LEDGER)
CREATE TABLE IF NOT EXISTS stock_movements (
    movement_id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    warehouse_id TEXT NOT NULL,
    to_warehouse_id TEXT,
    shelf_location TEXT,
    quantity REAL NOT NULL,
    movement_type TEXT NOT NULL CHECK (
        movement_type IN (
            'STOCK_IN', 'STOCK_OUT', 'TRANSFER_IN', 'TRANSFER_OUT',
            'PURCHASE', 'SALE', 'RETURN_IN', 'RETURN_OUT', 'ADJUSTMENT'
        )
    ),
    reference_id TEXT NOT NULL,
    unit_price REAL DEFAULT 0,
    user_id TEXT NOT NULL,
    device_id TEXT NOT NULL,
    event_id TEXT NOT NULL UNIQUE,
    notes TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(product_id),
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(warehouse_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created ON stock_movements(created_at);

-- 10. PURCHASES
CREATE TABLE IF NOT EXISTS purchases (
    purchase_id TEXT PRIMARY KEY,
    supplier_id TEXT NOT NULL,
    warehouse_id TEXT NOT NULL,
    invoice_number TEXT NOT NULL UNIQUE,
    total_amount REAL NOT NULL,
    paid_amount REAL NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'RECEIVED',
    user_id TEXT NOT NULL,
    device_id TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id),
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(warehouse_id)
);

CREATE TABLE IF NOT EXISTS purchase_items (
    item_id TEXT PRIMARY KEY,
    purchase_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    quantity REAL NOT NULL,
    unit_price REAL NOT NULL,
    total_price REAL NOT NULL,
    FOREIGN KEY (purchase_id) REFERENCES purchases(purchase_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

-- 11. SALES
CREATE TABLE IF NOT EXISTS sales (
    sale_id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    warehouse_id TEXT NOT NULL,
    invoice_number TEXT NOT NULL UNIQUE,
    total_amount REAL NOT NULL,
    paid_amount REAL NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'COMPLETED',
    user_id TEXT NOT NULL,
    device_id TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(warehouse_id)
);

CREATE TABLE IF NOT EXISTS sale_items (
    item_id TEXT PRIMARY KEY,
    sale_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    quantity REAL NOT NULL,
    unit_price REAL NOT NULL,
    total_price REAL NOT NULL,
    FOREIGN KEY (sale_id) REFERENCES sales(sale_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

-- 12. PAYMENTS
CREATE TABLE IF NOT EXISTS payments (
    payment_id TEXT PRIMARY KEY,
    reference_type TEXT NOT NULL CHECK (reference_type IN ('SALE', 'PURCHASE', 'GENERAL')),
    reference_id TEXT NOT NULL,
    amount REAL NOT NULL,
    payment_method TEXT NOT NULL DEFAULT 'CASH',
    user_id TEXT NOT NULL,
    device_id TEXT NOT NULL,
    created_at TEXT NOT NULL
);

-- 13. SYNC EVENTS (THE CORE OF EVENT-BASED REPLICATION)
CREATE TABLE IF NOT EXISTS sync_events (
    event_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    device_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    payload TEXT NOT NULL,
    client_created_at TEXT NOT NULL,
    server_received_at TEXT,
    server_sequence INTEGER UNIQUE,
    schema_version INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_sync_events_sequence ON sync_events(server_sequence);
CREATE INDEX IF NOT EXISTS idx_sync_events_entity ON sync_events(entity_type, entity_id);

-- 14. SYNC QUEUE (LOCAL CLIENT OUTBOX FOR OFFLINE RESILIENCE)
CREATE TABLE IF NOT EXISTS sync_queue (
    event_id TEXT PRIMARY KEY,
    status TEXT NOT NULL CHECK (status IN ('PENDING', 'UPLOADING', 'CONFIRMED', 'FAILED')),
    retry_count INTEGER NOT NULL DEFAULT 0,
    last_attempt_at TEXT,
    next_retry_at TEXT,
    error_message TEXT,
    created_at TEXT NOT NULL,
    payload TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sync_queue_status ON sync_queue(status);

-- 15. SYNC STATE (LOCAL CLIENT CHECKPOINT)
CREATE TABLE IF NOT EXISTS sync_state (
    device_id TEXT PRIMARY KEY,
    last_server_sequence INTEGER NOT NULL DEFAULT 0,
    last_synced_at TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'ONLINE'
);

-- 16. AUDIT LOGS (IMMUTABLE SECURITY & COMPLIANCE LOG)
CREATE TABLE IF NOT EXISTS audit_logs (
    audit_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    device_id TEXT NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    event_id TEXT,
    timestamp TEXT NOT NULL,
    metadata TEXT
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);

-- 17. SYSTEM SETTINGS
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- 18. GOODS RECEIPTS (PHYSICAL ENTRY & EXIT RECEIPTS - M-GAS CYLINDERS)
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

-- 19. GAS KARDEX (ام گاز - کاردکس سیلندر و شیرآلات)
CREATE TABLE IF NOT EXISTS gas_kardex (
    entry_id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    date TEXT NOT NULL,
    description TEXT,
    transfer_sheet_number TEXT,
    cylinder_in REAL DEFAULT 0,
    cylinder_out REAL DEFAULT 0,
    scrap_out REAL DEFAULT 0,
    scrap_stock_in REAL DEFAULT 0,
    cylinder_balance REAL DEFAULT 0,
    scrap_balance REAL DEFAULT 0,
    new_valve_in REAL DEFAULT 0,
    new_valve_out REAL DEFAULT 0,
    new_valve_balance REAL DEFAULT 0,
    dispatched TEXT DEFAULT '',
    used_valve_in REAL DEFAULT 0,
    used_valve_out REAL DEFAULT 0,
    used_valve_balance REAL DEFAULT 0,
    defective REAL DEFAULT 0,
    user_id TEXT,
    device_id TEXT,
    event_id TEXT,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

CREATE INDEX IF NOT EXISTS idx_gas_kardex_customer ON gas_kardex(customer_id);
CREATE INDEX IF NOT EXISTS idx_gas_kardex_date ON gas_kardex(date);


