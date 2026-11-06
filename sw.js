const CACHE_NAME = 'football-v1';
const ASSETS = [
  './index.html',
  './style.css',
  './data.js',
  './logic.js',
  './scenes_core.js',
  './scenes_club.js',
  './scenes_squad.js',
  './scenes_inventory.js',
  './scenes_match.js',
  './main.js',
  './manifest.json'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});