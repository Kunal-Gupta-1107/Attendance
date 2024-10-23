const CACHE_NAME = 'attendance-app-cache-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/index2.html',
  '/styles.css',
  '/scripts.js',
  '/icon.png',
  '/wall.jpg',
  '/madepng.png',
  '/offline.html'
];

// Install event: Cache important resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache');
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting(); // Activate the new service worker immediately
});

// Fetch event: Serve cached content or fallback to network
self.addEventListener('fetch', (event) => {
  // Only cache GET requests to avoid caching sensitive data sent via POST/PUT/DELETE
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached response if available, else fetch from network
      return response || fetch(event.request).then((networkResponse) => {
        // Optionally, you can cache the new response if necessary:
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      });
    }).catch(() => {
      // If both cache and network fail, show an offline fallback
      return caches.match('/offline.html');
    })
  );
});

// Activate event: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim(); // Immediately take control of open pages
});
