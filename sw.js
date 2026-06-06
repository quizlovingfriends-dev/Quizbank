const CACHE_NAME = 'quizvault-v1';
const ASSETS = [
  '/', '/index.html', '/questionbank.html', '/wiki.html', '/analytics.html', '/404.html',
  '/css/styles.css',
  '/data/questions.js',
  '/js/state.js', '/js/store.js', '/js/home.js', '/js/qb.js', '/js/practice.js',
  '/js/cloud-sync.js', '/js/sm2.js', '/js/animations.js', '/js/theme.js',
  '/js/sanitizer.js', '/js/error-boundary.js', '/js/components/quiz-card.js'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))));
});

self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});