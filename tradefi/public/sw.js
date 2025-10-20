// Empty service worker file to suppress browser warnings
// This prevents "No match found for location with path '/sw.js'" errors
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  self.clients.claim();
});

