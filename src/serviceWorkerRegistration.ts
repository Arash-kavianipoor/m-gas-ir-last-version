// Active cleanup of any legacy Service Workers to prevent Chrome caching freezes
// Safe against Chrome Incognito and storage-restricted contexts

export function unregisterServiceWorker() {
  if (typeof window === 'undefined') return;

  try {
    if ('serviceWorker' in navigator && navigator.serviceWorker && typeof navigator.serviceWorker.getRegistrations === 'function') {
      const promise = navigator.serviceWorker.getRegistrations();
      if (promise && typeof promise.then === 'function') {
        promise.then((registrations) => {
          if (Array.isArray(registrations)) {
            for (const registration of registrations) {
              try {
                registration.unregister().catch(() => {});
              } catch {}
            }
          }
        }).catch(() => {});
      }
    }
  } catch {
    // Storage access is blocked in Chrome Incognito or restricted iframes
  }

  try {
    if ('caches' in window && window.caches && typeof window.caches.keys === 'function') {
      const promise = window.caches.keys();
      if (promise && typeof promise.then === 'function') {
        promise.then((keys) => {
          if (Array.isArray(keys)) {
            for (const key of keys) {
              try {
                window.caches.delete(key).catch(() => {});
              } catch {}
            }
          }
        }).catch(() => {});
      }
    }
  } catch {
    // CacheStorage access is blocked in Chrome Incognito
  }
}

export function registerServiceWorker() {
  unregisterServiceWorker();
}
