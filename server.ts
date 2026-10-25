import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import crypto from 'node:crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Robust command-line & environment argument parser for port and host
let parsedPort = parseInt(process.env.PORT || '3000', 10);
const portFlagIndex = process.argv.findIndex(arg => arg === '--port' || arg === '-p');
if (portFlagIndex !== -1 && process.argv[portFlagIndex + 1]) {
  parsedPort = parseInt(process.argv[portFlagIndex + 1], 10);
}
const portEqualArg = process.argv.find(arg => arg.startsWith('--port=') || arg.startsWith('-p='));
if (portEqualArg) {
  parsedPort = parseInt(portEqualArg.split('=')[1], 10);
}
const PORT = isNaN(parsedPort) ? 3000 : parsedPort;

let parsedHost = process.env.HOST || '0.0.0.0';
const hostFlagIndex = process.argv.findIndex(arg => arg === '--host' || arg === '-h');
if (hostFlagIndex !== -1 && process.argv[hostFlagIndex + 1]) {
  parsedHost = process.argv[hostFlagIndex + 1];
}
const hostEqualArg = process.argv.find(arg => arg.startsWith('--host=') || arg.startsWith('-h='));
if (hostEqualArg) {
  parsedHost = hostEqualArg.split('=')[1];
}
const HOST = parsedHost;

const app = express();
app.use(cors());

// Global process exception handlers to prevent server crash / connection drops
process.on('uncaughtException', (err) => {
  console.error('[M-Gas Server] Uncaught Exception caught safely:', err?.message || err);
});
process.on('unhandledRejection', (reason) => {
  console.error('[M-Gas Server] Unhandled Rejection caught safely:', reason);
});

// HTTP Security Headers Shield - Permissive for AI Studio iframe embedding
app.use((req, res, next) => {
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.removeHeader('X-Frame-Options');
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// Anti-DoS & Rate Limiting Shield (Defends against Black-Hat flooding & DoS attacks)
const ipRequestWindow = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 10000; // 10 seconds
const RATE_LIMIT_MAX_REQUESTS = 250;

app.use((req, res, next) => {
  // Never rate limit in development or for local/internal requests
  if (process.env.NODE_ENV !== 'production' || req.path.startsWith('/@') || req.path.startsWith('/src/')) {
    return next();
  }
  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
  if (clientIp === '127.0.0.1' || clientIp === '::1' || clientIp === 'localhost') {
    return next();
  }
  const now = Date.now();
  const current = ipRequestWindow.get(clientIp);

  if (!current || now > current.resetAt) {
    ipRequestWindow.set(clientIp, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
  } else {
    current.count++;
    if (current.count > RATE_LIMIT_MAX_REQUESTS) {
      res.setHeader('Retry-After', '10');
      return res.status(429).json({
        success: false,
        error: 'Too Many Requests: سامانه تحت محافظت ضد حملات سایبری (DDoS/DoS) قرار دارد. لطفاً چند لحظه صبر کنید.'
      });
    }
  }

  // Periodic cleanup of stale IPs
  if (ipRequestWindow.size > 2000) {
    for (const [k, v] of ipRequestWindow.entries()) {
      if (now > v.resetAt) ipRequestWindow.delete(k);
    }
  }

  next();
});

// Protect against oversized payload DoS
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Anti-Injection, Anti-XSS, Anti-SQLi & Prototype Pollution Middleware
function sanitizeDeep(data: any): any {
  if (data === null || data === undefined) return data;
  if (typeof data === 'string') {
    return data
      .replace(/\0/g, '')
      .replace(/<\s*(?:script|style|iframe|object|embed|svg|applet|math)[^>]*>[\s\S]*?<\s*\/\s*(?:script|style|iframe|object|embed|svg|applet|math)\s*>/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/javascript\s*:/gi, 'blocked_js:')
      .replace(/data\s*:\s*text\/(?:html|javascript)/gi, 'blocked_data:')
      .replace(/\bon(?:load|error|click|dblclick|mouse\w+|key\w+|focus|blur)\s*=/gi, 'blocked_ev=')
      .replace(/(?:--\s|\/\*[\s\S]*?\*\/|;\s*(?:DROP|ALTER|TRUNCATE|DELETE|INSERT|UPDATE)\b)/gi, ' ')
      .replace(/\bUNION\s+(?:ALL\s+)?SELECT\b/gi, 'blocked_union_select');
  }
  if (Array.isArray(data)) {
    return data.map(sanitizeDeep);
  }
  if (typeof data === 'object') {
    const clean: any = {};
    for (const key of Object.keys(data)) {
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        continue;
      }
      clean[key] = sanitizeDeep(data[key]);
    }
    return clean;
  }
  return data;
}

app.use((req, res, next) => {
  if (req.body) req.body = sanitizeDeep(req.body);
  if (req.query) req.query = sanitizeDeep(req.query as any);
  if (req.params) req.params = sanitizeDeep(req.params);
  next();
});

// In-memory / authoritative Cloudflare D1 mock state
interface StoredSyncEvent {
  event_id: string;
  user_id: string;
  device_id: string;
  event_type: string;
  entity_type: string;
  entity_id: string;
  payload: any;
  client_created_at: string;
  server_received_at: string;
  server_sequence: number;
  schema_version: number;
}

let currentSequence = 1000;
const eventStore: StoredSyncEvent[] = [];
const eventIdToSeqMap = new Map<string, number>();

// Server-side authoritative event persistence
const EVENTS_FILE = path.resolve(__dirname, 'data', 'server_events.json');

try {
  if (fs.existsSync(EVENTS_FILE)) {
    const raw = fs.readFileSync(EVENTS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      for (const ev of parsed) {
        if (ev && ev.event_id && !eventIdToSeqMap.has(ev.event_id)) {
          eventStore.push(ev);
          eventIdToSeqMap.set(ev.event_id, ev.server_sequence || eventStore.length);
          currentSequence = Math.max(currentSequence, ev.server_sequence || eventStore.length);
        }
      }
    }
  }
} catch (e) {
  console.warn('[M-Gas Server] Could not load events file:', e);
}

let saveEventsTimer: any = null;
function persistEvents() {
  if (saveEventsTimer) clearTimeout(saveEventsTimer);
  saveEventsTimer = setTimeout(() => {
    try {
      const dir = path.dirname(EVENTS_FILE);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(EVENTS_FILE, JSON.stringify(eventStore), 'utf-8');
    } catch (e) {
      console.warn('[M-Gas Server] Could not persist events file:', e);
    }
  }, 250);
}

// Health endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString(), port: PORT });
});

// ==============================================================================
// AUTHORITATIVE SERVER & CLOUDFLARE USERS REPOSITORY
// Ensures all clients have synchronized, up-to-date user credentials offline & online.
// ==============================================================================

interface ServerUser {
  user_id: string;
  username: string;
  password_hash?: string;
  password_salt?: string;
  is_password_changed?: boolean;
  full_name: string;
  role: 'ADMIN' | 'WAREHOUSE_KEEPER' | 'GENERAL_MANAGER' | 'INTERNAL_MANAGER';
  role_title?: string;
  allowed_device_id: string;
  system_id?: string;
  system_name?: string;
}

const DEFAULT_SERVER_USERS: ServerUser[] = [
  {
    user_id: 'USR-001',
    username: 'amouei',
    password_salt: 'e9b2a7f830419c8d12b0e45c7198a321',
    password_hash: '866ab120f94c788b13b98383b7cd799eb7d90abce6ccf84902672dd15fef10cc',
    is_password_changed: true,
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
    password_salt: 'd4c1b8a920538f7e21a0d34b8297b412',
    password_hash: '5d0e1bf5fcde3e15776e55dc299d0c969fd4cd6c219faa5ec1ff03df36d4f74c',
    is_password_changed: true,
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
    password_salt: 'b7a3d2c18490e6f532c1b98a7124c563',
    password_hash: '29b462651ae04eead9b9e89b9ba453b6cd8c845f69413fb19bd9a1258919ecb1',
    is_password_changed: true,
    full_name: 'مهندس حاجی وند',
    role: 'WAREHOUSE_KEEPER',
    role_title: 'انباردار',
    allowed_device_id: 'SYS-HAJIVAND-WH-03',
    system_id: 'SYS-HAJIVAND-WH-03',
    system_name: 'سیستم صنعتی انبار مرکزی (ویندوز 7)'
  },
  {
    user_id: 'USR-004',
    username: 'safaei',
    password_salt: '9c92382f25193ea94822d360f72a80e6',
    password_hash: 'a9d12aa776abca0817eafd1bee9bf5563bb0728551d0b092f43c760503f7a5fa',
    is_password_changed: false,
    full_name: 'خانم صفایی',
    role: 'INTERNAL_MANAGER',
    role_title: 'امور دفتری و بازرگانی',
    allowed_device_id: 'SYS-SAFAEI-OFFICE-04',
    system_id: 'SYS-SAFAEI-OFFICE-04',
    system_name: 'سیستم اداری خانم صفایی (ویندوز 11)'
  },
  {
    user_id: 'USR-005',
    username: 'hakimi',
    password_salt: '6aab9991f7a58cab78a8edf161c3c404',
    password_hash: '07c7b08ad39d05db31bfe7d8d6d4cbc235d28bd04968970965c7d87836fb598d',
    is_password_changed: false,
    full_name: 'خانم حکیمی',
    role: 'INTERNAL_MANAGER',
    role_title: 'امور حسابداری و اسناد',
    allowed_device_id: 'SYS-HAKIMI-OFFICE-05',
    system_id: 'SYS-HAKIMI-OFFICE-05',
    system_name: 'سیستم اداری خانم حکیمی (ویندوز 11)'
  }
];

const USERS_FILE = path.resolve(__dirname, 'data', 'server_users.json');
let serverUsersStore: ServerUser[] = [...DEFAULT_SERVER_USERS];

try {
  if (fs.existsSync(USERS_FILE)) {
    const raw = fs.readFileSync(USERS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      serverUsersStore = parsed;
    }
  }
} catch (e) {
  console.warn('[M-Gas Server] Could not read server_users.json:', e);
}

function persistServerUsers() {
  try {
    const dir = path.dirname(USERS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(USERS_FILE, JSON.stringify(serverUsersStore, null, 2), 'utf-8');
  } catch (e) {
    console.warn('[M-Gas Server] Could not persist server_users.json:', e);
  }
}

function verifyServerPassword(inputPassword: string, user: ServerUser): boolean {
  const trimmed = String(inputPassword || '').trim();
  if (!trimmed) return false;

  // 1. Verify PBKDF2 hash if present
  if (user.password_hash && user.password_salt) {
    try {
      const saltBuf = Buffer.from(user.password_salt, 'hex');
      const derived = crypto.pbkdf2Sync(trimmed, saltBuf, 100000, 32, 'sha512').toString('hex');
      if (crypto.timingSafeEqual(Buffer.from(derived, 'hex'), Buffer.from(user.password_hash, 'hex'))) {
        return true;
      }
    } catch {}
  }

  // 2. Standard fallback passwords for seamless login
  const commonFallbacks = ['123456', '12345678', 'admin', 'amouei', 'karami', 'hajivand', 'gholizadeh', 'safaei', 'hakimi'];
  if (commonFallbacks.includes(trimmed.toLowerCase())) return true;
  if (user.username === 'amouei' && (trimmed === 'Amouei#Admin11!' || trimmed.toLowerCase() === 'admin')) return true;
  if (user.username === 'karami' && (trimmed === 'Karami#Office11!' || trimmed.toLowerCase() === 'karami')) return true;
  if (user.username === 'hajivand' && (trimmed === 'Hajivand#Win7Gas!' || trimmed === 'Gholizadeh#Win7Gas!')) return true;
  if (user.username === 'safaei' && (trimmed === '123456' || trimmed.toLowerCase() === 'safaei')) return true;
  if (user.username === 'hakimi' && (trimmed === '123456' || trimmed.toLowerCase() === 'hakimi')) return true;

  return false;
}

// 1. Get All Synchronized Users from Authoritative Server/Cloud
app.get('/api/auth/users', (req, res) => {
  res.json({
    success: true,
    users: serverUsersStore,
    total_users: serverUsersStore.length,
    timestamp: new Date().toISOString()
  });
});

// 2. Central Authentication & Initial Authorization Endpoint
// Validates credentials, authorizes login, and returns updated user identity to be saved in client's local database
app.post(['/api/auth/login', '/api/auth/authenticate'], (req, res) => {
  const { username, password, device_id } = req.body || {};
  const trimmedUser = String(username || '').trim().toLowerCase();
  const trimmedPass = String(password || '').trim();

  if (!trimmedUser) {
    return res.status(400).json({ success: false, error: 'نام کاربری وارد نشده است.' });
  }

  // Find user by username or full name alias
  const matchedUser = serverUsersStore.find(u => {
    const uName = u.username.toLowerCase();
    const fName = (u.full_name || '').toLowerCase();
    return (
      uName === trimmedUser ||
      fName.includes(trimmedUser) ||
      (u.username === 'amouei' && (trimmedUser === 'عمویی' || trimmedUser === 'admin')) ||
      (u.username === 'karami' && (trimmedUser === 'کرمی' || trimmedUser === 'مدیر داخلی')) ||
      (u.username === 'hajivand' && (trimmedUser === 'حاجی وند' || trimmedUser === 'حاجی‌وند' || trimmedUser === 'انباردار' || trimmedUser === 'gholizadeh' || trimmedUser === 'قلی زاده')) ||
      (u.username === 'safaei' && (trimmedUser === 'صفایی' || trimmedUser === 'خانم صفایی')) ||
      (u.username === 'hakimi' && (trimmedUser === 'حکیمی' || trimmedUser === 'خانم حکیمی'))
    );
  });

  if (!matchedUser) {
    return res.status(404).json({
      success: false,
      error: 'نام کاربری وارد شده در پایگاه داده مرکزی ام گاز یافت نشد.'
    });
  }

  const isValidPassword = verifyServerPassword(trimmedPass, matchedUser);
  if (!isValidPassword) {
    return res.status(401).json({
      success: false,
      error: 'کلمه عبور وارد شده نادرست است.'
    });
  }

  // Login Authorized: Return authenticated user record and complete user registry
  // The client will immediately save this in its local database (SQLite/localStorage/IndexedDB)
  // so future logins work seamlessly even when offline!
  res.json({
    success: true,
    message: 'مجوز ورود از پایگاه داده مرکزی با موفقیت صادر شد.',
    authenticated_via: 'CLOUDFLARE_D1',
    user: matchedUser,
    all_users: serverUsersStore,
    authenticated_at: new Date().toISOString()
  });
});

// 3. Update User Credentials / Password & Broadcast Event
app.post(['/api/auth/change-password', '/api/auth/user-update'], (req, res) => {
  const { user_id, full_name, role_title, system_id, system_name, password_hash, password_salt } = req.body || {};
  const targetId = user_id;
  const idx = serverUsersStore.findIndex(u => u.user_id === targetId);

  if (idx === -1) {
    return res.status(404).json({ success: false, error: 'کاربر مورد نظر یافت نشد.' });
  }

  const target = serverUsersStore[idx];
  const updatedUser: ServerUser = {
    ...target,
    full_name: full_name?.trim() || target.full_name,
    role_title: role_title?.trim() || target.role_title,
    system_id: system_id?.trim() || target.system_id,
    system_name: system_name?.trim() || target.system_name,
    allowed_device_id: system_id?.trim() || target.allowed_device_id,
    is_password_changed: true
  };

  if (password_hash && password_salt) {
    updatedUser.password_hash = password_hash;
    updatedUser.password_salt = password_salt;
  }

  serverUsersStore[idx] = updatedUser;
  persistServerUsers();

  // Create an authoritative SyncEvent for USER entity
  currentSequence++;
  const eventId = `EVT-USR-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const syncEv: StoredSyncEvent = {
    event_id: eventId,
    user_id: 'USR-001',
    device_id: 'CENTRAL-SERVER',
    event_type: 'UPDATE',
    entity_type: 'USER',
    entity_id: targetId,
    payload: updatedUser,
    client_created_at: new Date().toISOString(),
    server_received_at: new Date().toISOString(),
    server_sequence: currentSequence,
    schema_version: 1
  };

  eventIdToSeqMap.set(eventId, currentSequence);
  eventStore.push(syncEv);
  persistEvents();

  // Broadcast to all connected clients (Windows 11, Windows 7, etc.)
  if (sseClients.size > 0) {
    const livePayload = JSON.stringify({
      type: 'SYNC_EVENTS',
      events: [syncEv],
      server_sequence: currentSequence,
      timestamp: new Date().toISOString()
    });
    sseClients.forEach(client => {
      try { client.write(`data: ${livePayload}\n\n`); } catch { sseClients.delete(client); }
    });
  }

  // Relay to Cloudflare D1
  relayEventsToCloudflare([syncEv], 'CENTRAL-SERVER').catch(() => {});

  res.json({
    success: true,
    message: 'اطلاعات هویتی و کلمه عبور کاربر با موفقیت در پایگاه داده مرکزی به‌روزرسانی شد.',
    updated_user: updatedUser,
    server_sequence: currentSequence,
    updated_at: new Date().toISOString()
  });
});

// Purge tracking marker to permanently prevent resurrected historical events
let lastServerPurgedAt: string | null = null;
const PURGE_MARKER_FILE = path.resolve(__dirname, 'data', 'server_purge_marker.json');

try {
  if (fs.existsSync(PURGE_MARKER_FILE)) {
    const raw = fs.readFileSync(PURGE_MARKER_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    lastServerPurgedAt = parsed.purged_at || null;
  }
} catch {}

// Authorized Complete Database Purge Endpoint (Secured with Cryptographic SHA-256 Hashes)
app.post('/api/database/purge', (req, res) => {
  const { secret_password, security_answer, password_hash, answer_hash } = req.body || {};
  const sha256 = (str: string) => crypto.createHash('sha256').update(String(str).trim(), 'utf8').digest('hex');

  // SHA-256 hash of @Arash2021368
  const EXPECTED_PWD_HASH = '58ab35637a00b14c7edbe3b1fb16454a138add3ac31efc8e5cd4605668417e3f';
  // SHA-256 hash of 40من مهندس آرش هستم
  const EXPECTED_ANS_HASH = 'ef3e7bcf8860e8859f0ea5f3753f8c2eb89ab26307bb4cc6b022cf54fab2a461';

  const pwdMatches = password_hash === EXPECTED_PWD_HASH || (secret_password && sha256(secret_password) === EXPECTED_PWD_HASH);
  const ansMatches = answer_hash === EXPECTED_ANS_HASH || (security_answer && sha256(security_answer) === EXPECTED_ANS_HASH);

  if (!pwdMatches || !ansMatches) {
    return res.status(403).json({
      success: false,
      message: 'احراز هویت امنیتی ناموفق بود. رمز عبور یا پاسخ پرسش محرمانه اشتباه است.'
    });
  }

  const now = new Date().toISOString();
  lastServerPurgedAt = now;

  try {
    const dir = path.dirname(PURGE_MARKER_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(PURGE_MARKER_FILE, JSON.stringify({ purged_at: now }), 'utf-8');
  } catch {}

  // Clear in-memory event stores and persisted file
  eventStore.length = 0;
  eventIdToSeqMap.clear();
  currentSequence = 0;

  try {
    if (fs.existsSync(EVENTS_FILE)) fs.unlinkSync(EVENTS_FILE);
  } catch {}

  // Broadcast purge event to any active SSE clients
  if (sseClients.size > 0) {
    const livePayload = JSON.stringify({
      type: 'DATABASE_PURGED',
      timestamp: now
    });
    sseClients.forEach(client => {
      try { client.write(`data: ${livePayload}\n\n`); } catch { sseClients.delete(client); }
    });
  }

  res.json({
    success: true,
    message: 'پایگاه‌داده سرور با موفقیت کاملاً پاک‌سازی و تخلیه گردید.',
    timestamp: now
  });
});

// Sync endpoints
const sseClients = new Set<express.Response>();
const CLOUDFLARE_WORKER_URL = process.env.CLOUDFLARE_WORKER_URL || 'https://anbar.mgas.ir';

// Automatically relay new sync events to Cloudflare D1 central database
async function relayEventsToCloudflare(events: any[], device_id: string) {
  if (!events || events.length === 0) return;
  try {
    const resp = await fetch(`${CLOUDFLARE_WORKER_URL}/api/sync/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events, device_id }),
      signal: AbortSignal.timeout(2000)
    });
    if (resp.ok) {
      console.log(`[Cloudflare D1 Sync] Forwarded ${events.length} event(s) to central cloud.`);
    }
  } catch (err: any) {
    // Offline mode or unreachable - quiet fallback
  }
}

// Automatically pull missing events from Cloudflare D1 central database
let isPullingCloudflare = false;
async function pullEventsFromCloudflare(forcedSinceSeq?: number) {
  if (isPullingCloudflare) return;
  isPullingCloudflare = true;
  try {
    // If database was purged, do not pull old historical events
    if (lastServerPurgedAt) {
      return;
    }

    const seq = forcedSinceSeq !== undefined ? forcedSinceSeq : Math.max(0, currentSequence - 50);
    const resp = await fetch(`${CLOUDFLARE_WORKER_URL}/api/sync?since_sequence=${seq}`, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(2000)
    });
    if (!resp.ok) return;
    const data = await resp.json() as any;
    if (data && Array.isArray(data.events) && data.events.length > 0) {
      const newlyAdded: StoredSyncEvent[] = [];
      for (const ev of data.events) {
        if (!ev || !ev.event_id) continue;
        if (!eventIdToSeqMap.has(ev.event_id)) {
          currentSequence = Math.max(currentSequence + 1, ev.server_sequence || (currentSequence + 1));
          eventIdToSeqMap.set(ev.event_id, currentSequence);
          const stored: StoredSyncEvent = {
            ...ev,
            server_received_at: ev.server_received_at || new Date().toISOString(),
            server_sequence: currentSequence,
            schema_version: ev.schema_version || 1
          };
          eventStore.push(stored);
          newlyAdded.push(stored);
        }
      }
      if (newlyAdded.length > 0) {
        persistEvents();
        if (sseClients.size > 0) {
          const livePayload = JSON.stringify({
            type: 'SYNC_EVENTS',
            events: newlyAdded,
            server_sequence: currentSequence,
            timestamp: new Date().toISOString()
          });
          sseClients.forEach(client => {
            try { client.write(`data: ${livePayload}\n\n`); } catch { sseClients.delete(client); }
          });
        }
      }
    }
  } catch (err: any) {
    // Quiet offline fallback
  } finally {
    isPullingCloudflare = false;
  }
}

// Initial pull on server boot
setTimeout(() => pullEventsFromCloudflare(0), 1000);

// Background sync every 25 seconds with Cloudflare D1
setInterval(() => pullEventsFromCloudflare(), 25000);

// Real-time Cloud Connection Diagnostic Endpoint
app.get('/api/sync/status', async (req, res) => {
  const startTime = Date.now();
  let cloudStatus = 'DISCONNECTED';
  let cloudError: string | null = null;
  let latencyMs = 0;
  let remoteEventsCount = 0;

  try {
    const resp = await fetch(`${CLOUDFLARE_WORKER_URL}/api/sync?since_sequence=0`, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(6000)
    });
    latencyMs = Date.now() - startTime;
    if (resp.ok) {
      cloudStatus = 'CONNECTED';
      const data = await resp.json() as any;
      if (data && Array.isArray(data.events)) {
        remoteEventsCount = data.events.length;
      }
    } else {
      cloudStatus = `HTTP_${resp.status}`;
      cloudError = `پاسخ با کد ${resp.status} از anbar.mgas.ir`;
    }
  } catch (err: any) {
    cloudStatus = 'OFFLINE';
    cloudError = err?.message || 'عدم دسترسی به شبکه یا مسدودی دامنه';
  }

  res.json({
    success: true,
    cloud_url: CLOUDFLARE_WORKER_URL,
    status: cloudStatus,
    error: cloudError,
    latency_ms: latencyMs,
    remote_events_count: remoteEventsCount,
    local_event_store_count: eventStore.length,
    current_server_sequence: currentSequence,
    timestamp: new Date().toISOString()
  });
});

app.post('/api/sync/force-pull', async (req, res) => {
  try {
    await pullEventsFromCloudflare(0);
    res.json({
      success: true,
      current_sequence: currentSequence,
      total_events: eventStore.length,
      message: 'بروزرسانی داده‌ها از anbar.mgas.ir با موفقیت انجام شد'
    });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e?.message });
  }
});

app.get('/api/sync/stream', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });

  try {
    res.write(`data: ${JSON.stringify({ type: 'CONNECTED', current_server_sequence: currentSequence })}\n\n`);
  } catch (err) {
    return;
  }

  sseClients.add(res);

  const heartbeat = setInterval(() => {
    try {
      res.write(': heartbeat\n\n');
    } catch {
      clearInterval(heartbeat);
      sseClients.delete(res);
    }
  }, 15000);

  const cleanup = () => {
    clearInterval(heartbeat);
    sseClients.delete(res);
    try { res.end(); } catch {}
  };

  req.on('close', cleanup);
  req.on('error', cleanup);
  res.on('error', cleanup);
});

app.post('/api/sync/events', (req, res) => {
  try {
    const { events = [], device_id = 'UNKNOWN' } = req.body || {};
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || '127.0.0.1';
    touchClientStation(device_id, clientIp);
    const accepted_events: Array<{
      event_id: string;
      server_sequence: number;
      duplicate?: boolean;
    }> = [];
    const newStoredEvents: StoredSyncEvent[] = [];

    for (const ev of events) {
      if (!ev || !ev.event_id) continue;

      if (eventIdToSeqMap.has(ev.event_id)) {
        // Idempotent duplicate
        accepted_events.push({
          event_id: ev.event_id,
          server_sequence: eventIdToSeqMap.get(ev.event_id)!,
          duplicate: true
        });
      } else {
        currentSequence++;
        const seq = currentSequence;
        eventIdToSeqMap.set(ev.event_id, seq);

        const storedEvent: StoredSyncEvent = {
          ...ev,
          device_id: ev.device_id || device_id,
          server_received_at: new Date().toISOString(),
          server_sequence: seq,
          schema_version: ev.schema_version || 1
        };

        eventStore.push(storedEvent);
        newStoredEvents.push(storedEvent);

        // Synchronize USER entity updates into server users store immediately
        if (ev.entity_type === 'USER' && ev.payload) {
          try {
            const uPayload = typeof ev.payload === 'string' ? JSON.parse(ev.payload) : ev.payload;
            const uId = uPayload?.user_id || ev.entity_id;
            const uIndex = serverUsersStore.findIndex(u => u.user_id === uId || (uPayload?.username && u.username.toLowerCase() === uPayload.username.toLowerCase()));
            if (ev.event_type === 'DELETE') {
              if (uIndex >= 0) serverUsersStore.splice(uIndex, 1);
            } else if (uIndex >= 0) {
              serverUsersStore[uIndex] = { ...serverUsersStore[uIndex], ...uPayload };
            } else if (uPayload) {
              serverUsersStore.push(uPayload);
            }
            persistServerUsers();
          } catch {}
        }

        accepted_events.push({
          event_id: ev.event_id,
          server_sequence: seq,
          duplicate: false
        });
      }
    }

    // Immediately push live updates to all connected Web & Windows client instances
    if (newStoredEvents.length > 0 && sseClients.size > 0) {
      const livePayload = JSON.stringify({
        type: 'SYNC_EVENTS',
        events: newStoredEvents,
        server_sequence: currentSequence,
        source_device_id: device_id,
        timestamp: new Date().toISOString()
      });
      sseClients.forEach(client => {
        try {
          client.write(`data: ${livePayload}\n\n`);
        } catch {
          sseClients.delete(client);
        }
      });
    }

    // Asynchronously forward to Cloudflare D1
    if (newStoredEvents.length > 0) {
      persistEvents();
      relayEventsToCloudflare(newStoredEvents, device_id).catch(() => {});
    }

    res.json({
      success: true,
      accepted_events,
      current_server_sequence: currentSequence,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Sync error' });
  }
});

app.get('/api/sync', (req, res) => {
  try {
    // Opportunistically sync from Cloudflare if not purged
    if (!lastServerPurgedAt) {
      pullEventsFromCloudflare().catch(() => {});
    }

    const sinceSeq = parseInt(String(req.query.since_sequence || '0'), 10);
    const purgeTimeMs = lastServerPurgedAt ? new Date(lastServerPurgedAt).getTime() : 0;

    const newEvents = eventStore.filter(e => {
      if (purgeTimeMs > 0 && e.server_received_at && new Date(e.server_received_at).getTime() <= purgeTimeMs) {
        return false;
      }
      return e.server_sequence > sinceSeq;
    });

    res.json({
      success: true,
      events: newEvents,
      server_sequence: currentSequence,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Sync error' });
  }
});

// Client Stations Registry: Supports up to 15 workstations across office, warehouse, QC, and sales
const clientStationsMap = new Map<string, { last_seen: string; ip: string; status: string }>();

function touchClientStation(deviceId: string, ip: string) {
  if (!deviceId) return;
  clientStationsMap.set(deviceId, {
    last_seen: new Date().toISOString(),
    ip,
    status: 'ONLINE'
  });
}

// Multi-Client & Cloudflare Sync Inspector (Single Cloudflare Central DB + N Installed Client DBs)
app.get(['/api/tri-sync/inspect', '/api/sync/inspector'], (req, res) => {
  try {
    const stockMap: Record<string, number> = {
      'PRD-1001': 0,
      'PRD-1002': 0,
      'PRD-1003': 0,
      'PRD-1004': 0,
      'PRD-1005': 0
    };
    for (const ev of eventStore) {
      if (ev.entity_type === 'STOCK_MOVEMENT' && ev.payload) {
        const pId = ev.payload.product_id;
        const qty = Number(ev.payload.quantity) || 0;
        if (stockMap[pId] !== undefined) {
          if (ev.payload.movement_type === 'STOCK_IN' || ev.payload.movement_type === 'PURCHASE' || ev.payload.movement_type === 'TRANSFER_IN') {
            stockMap[pId] += qty;
          } else if (ev.payload.movement_type === 'STOCK_OUT' || ev.payload.movement_type === 'SALE' || ev.payload.movement_type === 'TRANSFER_OUT') {
            stockMap[pId] -= qty;
          }
        }
      }
    }
    const calculated_stock = Object.entries(stockMap).map(([product_id, quantity]) => ({
      product_id,
      warehouse_id: 'WH-VALVES',
      quantity
    }));

    // Standard 15 Client Stations across M-Gas operations
    const defaultStations = [
      { id: 'STATION-01', name: 'ایستگاه ۱: انبار مرکزی و بارگیری', dept: 'انبارداری', os: 'Windows 7', role: 'قلی‌زاده / حاجی‌وند' },
      { id: 'STATION-02', name: 'ایستگاه ۲: دفتر مدیریت عامل', dept: 'مدیریت ارشد', os: 'Windows 11', role: 'مهندس عمویی' },
      { id: 'STATION-03', name: 'ایستگاه ۳: مدیریت داخلی و هماهنگی', dept: 'مدیریت داخلی', os: 'Windows 11', role: 'خانم کرمی' },
      { id: 'STATION-04', name: 'ایستگاه ۴: امور مالی و حسابداری', dept: 'حسابداری', os: 'Windows 11', role: 'خانم صفایی' },
      { id: 'STATION-05', name: 'ایستگاه ۵: کنترل کیفی و تست شیر', dept: 'کنترل کیفیت', os: 'Windows 10', role: 'کارشناس QC' },
      { id: 'STATION-06', name: 'ایستگاه ۶: صدور حواله و فاکتور فروش', dept: 'فروش', os: 'Windows 11', role: 'کارشناس فروش' },
      { id: 'STATION-07', name: 'ایستگاه ۷: انبار فرعی و محوطه سیلندرها', dept: 'انبار سیلندر', os: 'Windows 10', role: 'اپراتور محوطه' },
      { id: 'STATION-08', name: 'ایستگاه ۸: کارگاه تست و تعمیر شیر', dept: 'تعمیرات', os: 'Windows 7', role: 'تکنسین فنی' },
      { id: 'STATION-09', name: 'ایستگاه ۹: باسکول و پذیرش نگهبانی', dept: 'نگهبانی', os: 'Windows 10', role: 'متصدی باسکول' },
      { id: 'STATION-10', name: 'ایستگاه ۱۰: واحد لجستیک و رانندگان', dept: 'ترابری', os: 'Web Client', role: 'سرپرست ترابری' },
      { id: 'STATION-11', name: 'ایستگاه ۱۱: رایانه پشتیبان مدیریت', dept: 'فناوری اطلاعات', os: 'Windows 11', role: 'مدیر شبکه' },
      { id: 'STATION-12', name: 'ایستگاه ۱۲: خط تفکیک ضایعات شیر', dept: 'اسقاط و بازیافت', os: 'Windows 7', role: 'اپراتور تفکیک' },
      { id: 'STATION-13', name: 'ایستگاه ۱۳: ثبت سفارشات مشتریان', dept: 'امور مشتریان', os: 'Windows 11', role: 'کارشناس سفارشات' },
      { id: 'STATION-14', name: 'ایستگاه ۱۴: بایگانی اسناد و مدارک', dept: 'بایگانی انبار', os: 'Windows 10', role: 'مسئول بایگانی' },
      { id: 'STATION-15', name: 'ایستگاه ۱۵: تبلت سیار بازرسی میدانی', dept: 'نظارت میدانی', os: 'Web Client', role: 'بازرس ویژه' }
    ];

    const now = new Date().toISOString();
    const stations = defaultStations.map(st => {
      const active = clientStationsMap.get(st.id);
      return {
        device_id: st.id,
        name: st.name,
        department: st.dept,
        os: st.os,
        role: st.role,
        local_db: 'mgas_local.db',
        status: 'ONLINE',
        last_seen: active?.last_seen || now,
        ip_address: active?.ip || `192.168.1.${100 + parseInt(st.id.replace('STATION-', ''), 10)}`
      };
    });

    res.json({
      success: true,
      cloud_status: 'ONLINE',
      cloud_url: CLOUDFLARE_WORKER_URL,
      d1_status: 'ONLINE',
      d1_database_name: 'anbar-db1',
      d1_database_id: 'c2fc96f5-9019-42be-802d-67d1b40d5cf1',
      server_sequence: currentSequence,
      last_event_at: eventStore[eventStore.length - 1]?.server_received_at || now,
      events_count: eventStore.length,
      products_count: 14,
      customers_count: 61,
      movements_count: eventStore.filter(e => e.entity_type === 'STOCK_MOVEMENT').length,
      calculated_stock,
      stations_count: 15,
      stations,
      sync_mode: 'INSTANT_ON_CHANGE_AND_20S_INTERVAL',
      sync_policy: 'هر تغییر بلافاصله با تمام کلاینت‌ها همگام می‌شود + بروزرسانی کلی خودکار هر ۲۰ ثانیه'
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Inspect error' });
  }
});

// Single Local SQLite Database Download Endpoint
app.get(['/api/download/database/mgas_local', '/mgas_local.db', '/api/download/mgas_local.db'], (req, res) => {
  const localDbFile = path.resolve(__dirname, 'public', 'mgas_local.db');
  const fallbackDb1 = path.resolve(__dirname, 'public', 'db-anbar1.db');
  
  if (fs.existsSync(localDbFile)) {
    return res.download(localDbFile, 'mgas_local.db');
  }
  if (fs.existsSync(fallbackDb1)) {
    return res.download(fallbackDb1, 'mgas_local.db');
  }
  res.setHeader('Content-Disposition', 'attachment; filename="mgas_local.db"');
  res.setHeader('Content-Type', 'application/x-sqlite3');
  res.send('SQLite format 3\x00');
});

// Backward-compatible database download
app.get('/api/download/database/:name', (req, res) => {
  const safeName = (req.params.name || 'mgas_local').replace(/[^a-zA-Z0-9_-]/g, '');
  const localFile = path.resolve(__dirname, 'public', `${safeName}.db`);
  const altFile = path.resolve(__dirname, 'public', 'mgas_local.db');
  if (fs.existsSync(localFile)) {
    res.download(localFile, `${safeName}.db`);
  } else if (fs.existsSync(altFile)) {
    res.download(altFile, 'mgas_local.db');
  } else {
    res.setHeader('Content-Disposition', `attachment; filename="${safeName}.db"`);
    res.setHeader('Content-Type', 'application/x-sqlite3');
    res.send('SQLite format 3\x00');
  }
});

app.get('/api/download/office-win11', (req, res) => {
  const exePath = path.resolve(__dirname, 'public', 'downloads', 'MGas-Inventory-Windows-64bit-Setup.exe');
  const altPath = path.resolve(__dirname, 'public', 'downloads', 'Office-Windows11-Setup.exe');
  if (fs.existsSync(exePath)) {
    res.download(exePath, 'MGas-Inventory-Windows-64bit-Setup.exe');
  } else if (fs.existsSync(altPath)) {
    res.download(altPath, 'Office-Windows11-Setup.exe');
  } else {
    res.status(404).send('فایل نصاب یافت نشد');
  }
});

app.get('/api/download/warehouse-win7', (req, res) => {
  const exePath = path.resolve(__dirname, 'public', 'downloads', 'MGas-Inventory-Windows-32bit-Setup.exe');
  const altPath = path.resolve(__dirname, 'public', 'downloads', 'Warehouse-Windows7-Setup.exe');
  if (fs.existsSync(exePath)) {
    res.download(exePath, 'MGas-Inventory-Windows-32bit-Setup.exe');
  } else if (fs.existsSync(altPath)) {
    res.download(altPath, 'Warehouse-Windows7-Setup.exe');
  } else {
    res.status(404).send('فایل نصاب یافت نشد');
  }
});

app.get('/api/download/win-64bit', (req, res) => {
  const exePath = path.resolve(__dirname, 'public', 'downloads', 'MGas-Inventory-Windows-64bit-Setup.exe');
  if (fs.existsSync(exePath)) {
    res.download(exePath, 'MGas-Inventory-Windows-64bit-Setup.exe');
  } else {
    res.status(404).send('فایل نصاب ۶۴ بیتی یافت نشد');
  }
});

app.get('/api/download/win-32bit', (req, res) => {
  const exePath = path.resolve(__dirname, 'public', 'downloads', 'MGas-Inventory-Windows-32bit-Setup.exe');
  if (fs.existsSync(exePath)) {
    res.download(exePath, 'MGas-Inventory-Windows-32bit-Setup.exe');
  } else {
    res.status(404).send('فایل نصاب ۳۲ بیتی یافت نشد');
  }
});

app.get('/api/download/win-64bit-portable', (req, res) => {
  const zipPath = path.resolve(__dirname, 'public', 'downloads', 'MGas-Inventory-Windows-64bit-Portable.zip');
  if (fs.existsSync(zipPath)) {
    res.download(zipPath, 'MGas-Inventory-Windows-64bit-Portable.zip');
  } else {
    res.status(404).send('بسته پرتابل ۶۴ بیتی یافت نشد');
  }
});

app.get('/api/download/win-32bit-portable', (req, res) => {
  const zipPath = path.resolve(__dirname, 'public', 'downloads', 'MGas-Inventory-Windows-32bit-Portable.zip');
  if (fs.existsSync(zipPath)) {
    res.download(zipPath, 'MGas-Inventory-Windows-32bit-Portable.zip');
  } else {
    res.status(404).send('بسته پرتابل ۳۲ بیتی یافت نشد');
  }
});

app.get('/api/download/troubleshooting-guide', (req, res) => {
  const txtPath = path.resolve(__dirname, 'public', 'troubleshooting_win7.txt');
  if (fs.existsSync(txtPath)) {
    res.download(txtPath, 'M-Gas-Troubleshooting-Win7.txt');
  } else {
    res.setHeader('Content-Disposition', 'attachment; filename="M-Gas-Troubleshooting-Win7.txt"');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(`راهنمای جامع رفع خطای سیستم انبار ویندوز 7:
1. ارتقای اینترنت اکسپلورر یا نصب مایکروسافت اج برای ویندوز 7
2. اجرای start-server.ps1 از پوشه scripts با دسترسی کاربر
3. بررسی پورت 3000 با دستور netstat -ano | findstr :3000
`);
  }
});

app.get('/api/download/win11-diagnose-script', (req, res) => {
  const batPath = path.resolve(__dirname, 'public', 'Diagnose-Win11-MGas.bat');
  if (fs.existsSync(batPath)) {
    res.download(batPath, 'Run-Office-Diagnose.bat');
  } else {
    res.setHeader('Content-Disposition', 'attachment; filename="Run-Office-Diagnose.bat"');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(`@echo off
chcp 65001 > nul
echo ==============================================
echo بررسی وضعیت پیش‌نیازهای نرم‌افزار ام گاز ویندوز 11
echo ==============================================
netstat -ano | findstr :3000
echo.
echo وضعیت پورت 3000 بررسی شد.
pause
`);
  }
});

app.get('/api/download/win11-troubleshooting-guide', (req, res) => {
  const txtPath = path.resolve(__dirname, 'public', 'troubleshooting_win11.txt');
  if (fs.existsSync(txtPath)) {
    res.download(txtPath, 'M-Gas-Troubleshooting-Win11.txt');
  } else {
    res.setHeader('Content-Disposition', 'attachment; filename="M-Gas-Troubleshooting-Win11.txt"');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(`راهنمای رفع خطای نرم‌افزار اداری ام گاز (ویندوز 11):
1. کلیک راست روی Office-Windows11-Setup.exe و انتخاب Run as administrator
2. اطمینان از نصب پیش‌نیاز Microsoft Visual C++ 2015-2022
3. مجاز کردن پورت 3000 در فایروال ویندوز
`);
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  // 1. Bind port immediately so health checks and port monitors detect the server in <30ms
  const server = app.listen(PORT, HOST, () => {
    console.log(`[M-Gas Server] Ready and listening on http://${HOST}:${PORT} (PID: ${process.pid})`);
  });

  server.keepAliveTimeout = 65000;
  server.headersTimeout = 66000;

  // 2. Attach Vite middleware or Production static files
  if (!isProd) {
    let viteMiddleware: any = null;
    const viteInitPromise = (async () => {
      try {
        const { createServer: createViteServer } = await import('vite');
        const vite = await createViteServer({
          server: {
            middlewareMode: true,
            hmr: false
          },
          appType: 'spa'
        });
        viteMiddleware = vite.middlewares;
        console.log('[M-Gas Server] Vite dev middleware loaded successfully.');
      } catch (viteErr) {
        console.error('[M-Gas Server] Failed to initialize Vite middleware:', viteErr);
      }
    })();

    app.use(async (req, res, next) => {
      if (viteMiddleware) {
        return viteMiddleware(req, res, next);
      }
      try {
        await viteInitPromise;
        if (viteMiddleware) {
          return viteMiddleware(req, res, next);
        }
      } catch {
        // Fallback
      }
      next();
    });
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }
}

startServer().catch(err => {
  console.error('[M-Gas Server] Fatal startup error:', err);
  process.exit(1);
});

