/* Increment VERSION whenever any cached portfolio file changes. */
'use strict';
const VERSION = 'v1';
const CACHE_PREFIX = 'shawaiz-portfolio-';
const CACHE_NAME = CACHE_PREFIX + VERSION;
const PRECACHE = [
  '/', '/index.html', '/offline.html', '/site.webmanifest',
  '/assets/css/style.css', '/assets/css/pwa.css', '/assets/js/app.js', '/assets/js/pwa.js',
  '/assets/img/profile.jpg',
  '/assets/img/projects/smartmine.jpg', '/assets/img/projects/agrismart.jpg',
  '/assets/img/projects/arcline-pos.jpg', '/assets/img/projects/ai-detector.jpg',
  '/assets/img/projects/evershine.jpg', '/assets/img/research/topolite-kd.jpg',
  '/assets/img/icons/favicon.ico', '/assets/img/icons/favicon-16x16.png',
  '/assets/img/icons/favicon-32x32.png', '/assets/img/icons/apple-touch-icon.png',
  '/assets/img/icons/android-chrome-192x192.png', '/assets/img/icons/android-chrome-512x512.png'
];
self.addEventListener('install', event => {
  // Fail installation atomically if an essential asset is unavailable.
  event.waitUntil(caches.open(CACHE_NAME).then(cache =>
    cache.addAll(PRECACHE.map(url => new Request(url, { cache: 'reload' })))
  ));
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME)
      .map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    // Serve one coherent offline release until the user accepts an update.
    // Ignore query strings only for this site's known static files.
    if (PRECACHE.includes(url.pathname)) {
      const cached = await cache.match(url.pathname);
      if (cached) return cached;
    }
    try {
      return await fetch(request);
    } catch (error) {
      if (request.mode === 'navigate') return await cache.match('/offline.html');
      return Response.error();
    }
  })());
});
