#!/usr/bin/env python3
import os
import sqlite3
import shutil

SCHEMA_FILE = os.path.join(os.path.dirname(__file__), '..', 'src', 'database', 'canonical-schema.sql')
OUTPUT_DIRS = [
    os.path.join(os.path.dirname(__file__), '..'),
    os.path.join(os.path.dirname(__file__), '..', 'public'),
    os.path.join(os.path.dirname(__file__), '..', 'public', 'downloads'),
    os.path.join(os.path.dirname(__file__), '..', 'release-dist'),
    os.path.join(os.path.dirname(__file__), '..', 'dist')
]

DATABASES = [
    {
        'id': 'db-anbar1',
        'name': 'انبار مرکزی شماره ۱ (سوله اصلی)',
        'warehouse_id': 'WH-MAIN',
        'device_id': 'WAREHOUSE-PC-001'
    },
    {
        'id': 'db-anbar2',
        'name': 'انبار توزیع و پخش مویرگی',
        'warehouse_id': 'WH-DIST',
        'device_id': 'OFFICE-PC-001'
    },
    {
        'id': 'db-anbar3',
        'name': 'انبار قطعات و تجهیزات فنی',
        'warehouse_id': 'WH-SPARE',
        'device_id': 'WEB-001'
    }
]

with open(SCHEMA_FILE, 'r', encoding='utf-8') as f:
    schema_sql = f.read()

for db_info in DATABASES:
    db_id = db_info['id']
    tmp_path = f"/tmp/{db_id}.db"
    if os.path.exists(tmp_path):
        os.remove(tmp_path)
    
    conn = sqlite3.connect(tmp_path)
    cursor = conn.cursor()
    cursor.executescript(schema_sql)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS anbar_meta (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        );
    """)
    cursor.execute("""
        INSERT OR REPLACE INTO anbar_meta (key, value) VALUES 
        ('db_name', ?),
        ('title', ?),
        ('warehouse_id', ?),
        ('device_id', ?),
        ('version', '1.0.0');
    """, (db_info['id'], db_info['name'], db_info['warehouse_id'], db_info['device_id']))
    
    conn.commit()
    conn.close()
    
    for out_dir in OUTPUT_DIRS:
        if os.path.exists(out_dir):
            target_with_ext = os.path.join(out_dir, f"{db_id}.db")
            target_no_ext = os.path.join(out_dir, db_id)
            shutil.copy2(tmp_path, target_with_ext)
            shutil.copy2(tmp_path, target_no_ext)
            print(f"Generated {target_with_ext} ({os.path.getsize(target_with_ext)} bytes)")

print("All databases generated successfully!")
