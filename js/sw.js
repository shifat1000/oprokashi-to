const CACHE_NAME = 'oprokashi-library-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/story.html',
  '/admin.html',
  '/css/style.css',
  '/js/app.js',
  '/js/librarian.js',
  '/js/pageflip.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => res || fetch(e.request))
  );
});