// Self-unregistering cleanup worker to clear any stale cache in Chrome and browsers
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
      .then(() => self.registration.unregister())
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Pass through all requests directly to network without caching or interference
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
