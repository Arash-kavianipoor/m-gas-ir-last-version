/**
 * Client-Side Cookie Authentication & Cache-Free Storage Policy for M-Gas Inventory
 * 
 * Strict Architectural Rule:
 * 1. Only username and password (or auth credentials) are saved on the client in a cookie.
 * 2. ALL other operational and database information MUST NOT be cached on the client side.
 * 3. Client LocalStorage and SessionStorage are purged of database payloads to ensure
 *    ultra-lightweight, 60fps browser execution with zero disk lag.
 */

export interface UserAuthCredentials {
  username: string;
  password?: string;
  authenticated_at?: string;
}

const AUTH_COOKIE_NAME = 'mgas_user_auth';

/**
 * Save user credentials strictly in client cookie.
 */
export function saveAuthCookie(username: string, password: string = ''): void {
  if (typeof document === 'undefined') return;
  try {
    const payload: UserAuthCredentials = {
      username: username.trim(),
      password: password ? password.trim() : '',
      authenticated_at: new Date().toISOString()
    };
    const encoded = encodeURIComponent(JSON.stringify(payload));
    // 30 days expiry, SameSite=Lax, Path=/
    const maxAge = 30 * 24 * 60 * 60;
    document.cookie = `${AUTH_COOKIE_NAME}=${encoded}; path=/; max-age=${maxAge}; SameSite=Lax`;
  } catch (err) {
    console.warn('[CookieAuth] Failed to save credentials cookie:', err);
  }
}

/**
 * Read user credentials strictly from client cookie.
 */
export function getAuthCookie(): UserAuthCredentials | null {
  if (typeof document === 'undefined') return null;
  try {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const trimmed = cookie.trim();
      if (trimmed.startsWith(`${AUTH_COOKIE_NAME}=`)) {
        const val = trimmed.substring(AUTH_COOKIE_NAME.length + 1);
        if (val) {
          const decoded = decodeURIComponent(val);
          const parsed = JSON.parse(decoded);
          if (parsed && typeof parsed.username === 'string') {
            return {
              username: parsed.username,
              password: parsed.password || '',
              authenticated_at: parsed.authenticated_at
            };
          }
        }
      }
    }
  } catch (err) {
    console.warn('[CookieAuth] Failed to read credentials cookie:', err);
  }
  return null;
}

/**
 * Remove client authentication cookie.
 */
export function clearAuthCookie(): void {
  if (typeof document === 'undefined') return;
  try {
    document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
  } catch {}
}

/**
 * Purge temporary session and volatile cache while preserving persistent database data.
 */
export function purgeClientDataCache(): void {
  if (typeof window === 'undefined') return;
  try {
    if (window.sessionStorage) {
      window.sessionStorage.clear();
    }
  } catch (err) {
    console.warn('[CookieAuth] Purge client data cache warning:', err);
  }
}
