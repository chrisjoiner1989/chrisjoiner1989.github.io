// Simple service worker for offline caching
const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `mount-builder-${CACHE_VERSION}`;

// Core assets to pre-cache (others will be cached at runtime)
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/library.html',
  '/bible.html',
  '/calendar.html',
  '/css/style.css',
  '/js/app.js',
  '/js/api.js',
  '/js/storage.js',
  '/js/validation.js',
  '/assets/mount-builder.png',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key.startsWith('mount-builder-') && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

// Utility: determine if URL is same-origin
function isSameOrigin(requestUrl) {
  const url = new URL(requestUrl, self.location.href);
  return url.origin === self.location.origin;
}

// Runtime caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return; // ignore non-GET

  const requestUrl = new URL(request.url);

  // Network-first for Bible APIs with cache fallback
  const isBibleApi = requestUrl.hostname.includes('bible-api.com') || requestUrl.hostname.includes('bolls.life');
  if (isBibleApi) {
    event.respondWith(
      (async () => {
        try {
          const networkResponse = await fetch(request);
          const cache = await caches.open(CACHE_NAME);
          cache.put(request, networkResponse.clone());
          return networkResponse;
        } catch (err) {
          const cached = await caches.match(request);
          if (cached) return cached;
          throw err;
        }
      })()
    );
    return;
  }

  // Cache-first for same-origin static assets
  if (isSameOrigin(request.url)) {
    event.respondWith(
      (async () => {
        const cached = await caches.match(request, { ignoreSearch: true });
        if (cached) return cached;
        const response = await fetch(request);
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, response.clone());
        return response;
      })()
    );
  }
});

