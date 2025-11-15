/**
 * Service Worker - Unregister
 * This file exists to cleanly unregister any previously registered service workers
 */

// Unregister this service worker immediately
self.addEventListener('install', function(event) {
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    self.registration.unregister().then(function() {
      console.log('Service worker unregistered');
      return self.clients.matchAll();
    }).then(function(clients) {
      clients.forEach(client => client.navigate(client.url));
    })
  );
});
