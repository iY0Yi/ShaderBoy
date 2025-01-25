self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing and skipping waiting...');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating and claiming clients...');
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
    console.log(`[Service Worker] Fetching: ${event.request.url}`);
    event.respondWith(fetch(event.request));
});
