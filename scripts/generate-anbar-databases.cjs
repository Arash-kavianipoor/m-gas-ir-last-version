/**
 * Generates initial SQLite binary databases for desktop versions:
 * db-anbar1.db, db-anbar2.db, db-anbar3.db
 * and extensionless copies: db-anbar1, db-anbar2, db-anbar3
 */

const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

async function generateDatabases() {
  console.log('[Anbar DB Generator] Initializing sql.js engine...');
  const SQL = await initSqlJs();

  // Try fetching live events from anbar.mgas.ir
  let cloudEvents = [];
  try {
    const fetchResp = await fetch('https://anbar.mgas.ir/api/sync?since_sequence=0', {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(6000)
    });
    if (fetchResp.ok) {
      const data = await fetchResp.json();
      if (data && Array.isArray(data.events)) {
        cloudEvents = data.events;
        console.log(`[Anbar DB Generator] Successfully fetched ${cloudEvents.length} events from anbar.mgas.ir.`);
      }
    }
  } catch (err) {
    console.log('[Anbar DB Generator] Note: Central cloud offline or unreachable, using local base schema.');
  }

  const schemaPath = path.join(__dirname, '../src/database/canonical-schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  const outputDirs = [
    path.join(__dirname, '../release-dist'),
    path.join(__dirname, '../public'),
    path.join(__dirname, '../')
  ];

  for (const dir of outputDirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  const anbarConfigs = [
    {
      id: 'db-anbar1',
      name: 'انبار مرکزی شماره ۱ (سوله اصلی)',
      warehouse_id: 'WH-MAIN',
      device_id: 'WAREHOUSE-PC-001'
    },
    {
      id: 'db-anbar2',
      name: 'انبار توزیع و پخش مویرگی',
      warehouse_id: 'WH-DIST',
      device_id: 'OFFICE-PC-001'
    },
    {
      id: 'db-anbar3',
      name: 'انبار قطعات و تجهیزات فنی',
      warehouse_id: 'WH-SPARE',
      device_id: 'WEB-001'
    }
  ];

  for (const anbar of anbarConfigs) {
    console.log(`[Anbar DB Generator] Generating ${anbar.id} (${anbar.name})...`);
    const db = new SQL.Database();
    
    // Execute canonical schema
    db.run(schemaSql);

    // Insert anbar metadata table
    db.run(`
      CREATE TABLE IF NOT EXISTS anbar_meta (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
      INSERT OR REPLACE INTO anbar_meta (key, value) VALUES 
        ('db_name', '${anbar.id}'),
        ('title', '${anbar.name}'),
        ('warehouse_id', '${anbar.warehouse_id}'),
        ('device_id', '${anbar.device_id}'),
        ('cloud_server', 'https://anbar.mgas.ir'),
        ('cloud_events_count', '${cloudEvents.length}'),
        ('created_at', '${new Date().toISOString()}'),
        ('version', '1.0.0');
    `);

    // Insert live events from anbar.mgas.ir if available
    if (cloudEvents.length > 0) {
      for (const ev of cloudEvents) {
        if (!ev || !ev.event_id) continue;
        try {
          db.run(`
            INSERT OR IGNORE INTO sync_events (
              event_id, user_id, device_id, event_type, entity_type, entity_id, payload_json, client_created_at, server_received_at, server_sequence, schema_version
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
          `, [
            ev.event_id,
            ev.user_id || 'USR-001',
            ev.device_id || anbar.device_id,
            ev.event_type || 'CREATE',
            ev.entity_type || 'GAS_KARDEX',
            ev.entity_id || '',
            JSON.stringify(ev.payload || {}),
            ev.client_created_at || new Date().toISOString(),
            ev.server_received_at || new Date().toISOString(),
            ev.server_sequence || 1000,
            ev.schema_version || 1
          ]);

          if (ev.entity_type === 'GAS_KARDEX' && ev.payload) {
            const p = ev.payload;
            db.run(`
              INSERT OR REPLACE INTO gas_kardex (
                entry_id, customer_id, customer_name, date, description, transfer_sheet_number,
                cylinder_in, cylinder_out, scrap_out, cylinder_balance, scrap_balance,
                new_valve_in, new_valve_out, new_valve_balance, dispatched,
                used_valve_in, used_valve_out, used_valve_balance, defective,
                user_id, device_id, event_id, notes, created_at, updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
            `, [
              p.entry_id || ev.entity_id,
              p.customer_id || 'CUST-GAS-011',
              p.customer_name || 'البرز گاز',
              p.date || '1405/06/23',
              p.description || '',
              p.transfer_sheet_number || '',
              p.cylinder_in || 0,
              p.cylinder_out || 0,
              p.scrap_out || 0,
              p.cylinder_balance || 0,
              p.scrap_balance || 0,
              p.new_valve_in || 0,
              p.new_valve_out || 0,
              p.new_valve_balance || 0,
              p.dispatched || '',
              p.used_valve_in || 0,
              p.used_valve_out || 0,
              p.used_valve_balance || 0,
              p.defective || 0,
              p.user_id || ev.user_id || 'USR-001',
              p.device_id || ev.device_id || anbar.device_id,
              p.event_id || ev.event_id,
              p.notes || '',
              p.created_at || new Date().toISOString(),
              p.updated_at || new Date().toISOString()
            ]);
          }
        } catch (e) {
          // ignore single event insert collision
        }
      }
    }

    const binaryData = Buffer.from(db.export());

    for (const dir of outputDirs) {
      const withExt = path.join(dir, `${anbar.id}.db`);
      const withoutExt = path.join(dir, anbar.id);
      fs.writeFileSync(withExt, binaryData);
      fs.writeFileSync(withoutExt, binaryData);
      console.log(`  -> Wrote ${withExt} (${binaryData.length} bytes)`);
    }

    db.close();
  }

  console.log('[Anbar DB Generator] All 3 databases successfully generated!');
}

generateDatabases().catch(err => {
  console.error('[Anbar DB Generator] Error:', err);
  process.exit(1);
});
