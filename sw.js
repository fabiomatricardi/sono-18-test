/* CUCCIAFLIX — service worker
   Tiene l'interfaccia disponibile anche senza rete.
   I video, ovviamente, hanno bisogno di connessione. */

const CACHE = 'cucciaflix-v3';

const ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/app.js',
  './manifest.webmanifest',
  './robots.txt',
  './assets/family-1280.webp',
  './assets/family-2048.webp',
  './assets/thumb-storia.webp',
  './assets/thumb-avventure.webp',
  './assets/fonts/cormorant-var.woff2',
  './assets/fonts/cormorant-italic.woff2',
  './assets/fonts/bebas.woff2',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/icon-maskable-512.png',
  './assets/icons/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;

  if (request.method !== 'GET') return;
  if (new URL(request.url).origin !== self.location.origin) return;

  // Rete prima, cache come rete di sicurezza: così non si vede mai
  // un HTML nuovo con un CSS vecchio (o viceversa).
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request, { ignoreSearch: true });
        if (cached) return cached;
        if (request.mode === 'navigate') return caches.match('./index.html');
        return Response.error();
      })
  );
});
