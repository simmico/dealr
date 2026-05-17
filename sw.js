const CACHE_NAME = 'dealr-v1';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/deals.html',
  '/birthdays.html',
  '/subscriptions.html',
  '/banking.html',
  '/about.html',
  '/css/base.css',
  '/css/layout.css',
  '/css/components.css',
  '/css/animations.css',
  '/css/pages.css',
  '/js/utils.js',
  '/js/main.js',
  '/js/scroll.js',
  '/js/vitality.js',
  '/js/banking.js',
  '/js/bot.js',
  '/manifest.json',
];

const DATA_URLS = ['/data/dealr.json', '/data/banking.json'];

/* ── Install: pre-cache shell assets ───────────────────────────────────────── */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
  self.skipWaiting();
});

/* ── Activate: purge old caches ─────────────────────────────────────────────── */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

/* ── Fetch ───────────────────────────────────────────────────────────────────── */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Network-first for data files
  if (DATA_URLS.some((path) => url.pathname === path)) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Cache-first for everything else
  event.respondWith(cacheFirst(request));
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await cache.match(request);
    return cached ?? offlinePage();
  }
}

async function cacheFirst(request) {
  const cache  = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    if (request.mode === 'navigate') return offlinePage();
    return new Response('Offline', { status: 503 });
  }
}

function offlinePage() {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Offline — Dealr</title>
  <style>
    body {
      margin: 0;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: #081B1B;
      color: #EEE8B2;
      font-family: 'DM Sans', sans-serif;
      text-align: center;
      padding: 24px;
    }
    h1 {
      font-family: Georgia, serif;
      font-size: 2rem;
      color: #C18D52;
      margin-bottom: 16px;
    }
    p { color: #7A9A7A; font-size: 1rem; line-height: 1.7; }
  </style>
</head>
<body>
  <h1>Dealr</h1>
  <p>You are offline. Please check your connection and try again.</p>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
