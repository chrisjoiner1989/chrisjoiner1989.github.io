// Service Worker for Mount Builder PWA
const CACHE_NAME = "mount-builder-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/library.html",
  "/bible.html",
  "/calendar.html",
  "/css/style.css",
  "/js/app.js",
  "/js/storage.js",
  "/js/validation.js",
  "/js/api.js",
  "/js/toast.js",
  "/js/powerpoint.js",
  "/js/touch-interactions.js",
  "/js/theme-manager.js",
  "/manifest.json",
  "/assets/mount-builder.png",
  "https://fonts.googleapis.com/css2?family=Anton&family=Cormorant+Garamond:ital,wght@0,300..700;1,300..700&display=swap",
  "https://cdn.jsdelivr.net/npm/jszip@3/dist/jszip.min.js",
  "https://cdn.jsdelivr.net/npm/pptxgenjs@latest/dist/pptxgen.min.js",
];

// Install event - cache resources
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Opened cache");
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.log("Cache install failed:", error);
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version or fetch from network
      if (response) {
        return response;
      }

      // Clone the request because it's a stream
      const fetchRequest = event.request.clone();

      return fetch(fetchRequest)
        .then((response) => {
          // Check if we received a valid response
          if (
            !response ||
            response.status !== 200 ||
            response.type !== "basic"
          ) {
            return response;
          }

          // Clone the response because it's a stream
          const responseToCache = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          // If both cache and network fail, show offline page
          if (event.request.destination === "document") {
            return caches.match("/index.html");
          }
        });
    })
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Handle background sync for offline data
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync") {
    event.waitUntil(doBackgroundSync());
  }
});

function doBackgroundSync() {
  // Handle any pending data synchronization
  return Promise.resolve();
}

// Handle push notifications (for future use)
self.addEventListener("push", (event) => {
  const options = {
    body: event.data ? event.data.text() : "New sermon reminder",
    icon: "/assets/mount-builder.png",
    badge: "/assets/mount-builder.png",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: "explore",
        title: "View Sermon",
        icon: "/assets/mount-builder.png",
      },
      {
        action: "close",
        title: "Close",
        icon: "/assets/mount-builder.png",
      },
    ],
  };

  event.waitUntil(self.registration.showNotification("Mount Builder", options));
});

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "explore") {
    event.waitUntil(clients.openWindow("/"));
  }
});
