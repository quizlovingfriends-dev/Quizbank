const CACHE_NAME = 'quizvault-v1';
const ASSETS = [
  './',
  './index.html',
  './questionbank.html',
  './css/styles.css',
  './js/state.js',
  './js/home.js',
  './js/questionbank.js',
  './js/utils.js',
  './data/questions.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
