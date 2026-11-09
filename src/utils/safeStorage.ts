/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Resilient cross-browser Storage helper designed specifically for Chrome Incognito,
 * partitioned iframes, Safari Private Browsing, and restricted WebViews where
 * window.localStorage throws DOMException: Access is denied.
 */

const memoryStore = new Map<string, string>();

function isStorageAvailable(): boolean {
  try {
    if (typeof window === 'undefined') return false;
    const testKey = '__mgas_storage_probe__';
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

let storageAvailable: boolean | null = null;

function hasStorage(): boolean {
  if (storageAvailable === null) {
    storageAvailable = isStorageAvailable();
  }
  return storageAvailable;
}

export const safeStorage = {
  getItem(key: string): string | null {
    try {
      if (hasStorage()) {
        const val = window.localStorage.getItem(key);
        if (val !== null) return val;
      }
    } catch {
      storageAvailable = false;
    }
    return memoryStore.get(key) ?? null;
  },

  setItem(key: string, value: string): void {
    const stringVal = String(value);
    try {
      if (hasStorage()) {
        window.localStorage.setItem(key, stringVal);
      }
    } catch {
      storageAvailable = false;
    }
    memoryStore.set(key, stringVal);
  },

  removeItem(key: string): void {
    try {
      if (hasStorage()) {
        window.localStorage.removeItem(key);
      }
    } catch {
      storageAvailable = false;
    }
    memoryStore.delete(key);
  },

  clear(): void {
    try {
      if (hasStorage()) {
        window.localStorage.clear();
      }
    } catch {
      storageAvailable = false;
    }
    memoryStore.clear();
  },
};
