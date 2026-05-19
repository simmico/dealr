const CACHE_NAME = 'dealr-v1';

const CACHE_URLS = [
  '/',
  '/index.html',
  '/deals.html',
  '/banking.html',
  '/subscriptions.html',
  '/subscriptions-streaming.html',
  '/subscriptions-data.html',
  '/subscriptions-apps.html',
  '/birthdays.html',
  '/about.html',
  '/restaurants.html',
  '/restaurants-fastfood.html',
  '/restaurants-casual.html',
  '/restaurants-datenight.html',
  '/data/dealr.json',
  '/data/banking.json',
  '/data/restaurants-fastfood.json',
  '/data/restaurants-casual.json',
  '/data/restaurants-datenight.json',
  '/css/base.css',
  '/css/layout.css',
  '/css/components.css',
  '/css/animations.css',
  '/css/pages.css',
  '/js/main.js',
  '/js/banking.js',
  '/js/scroll.js',
  '/js/bot.js',
  '/manifest.json',
  '/icons/icon-192.svg',
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(CACHE_URLS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (key) { return key !== CACHE_NAME; })
            .map(function (key) { return caches.delete(key); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.match(event.request).then(function (cached) {
      return cached || fetch(event.request);
    })
  );
});
