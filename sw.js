const CACHE_NAME = 'sth-static-v9';
const ASSETS = [
  './',
  './index.html',
  './timer.html',
  './stopwatch.html',
  './pomodoro.html',
  './gpa-calculator.html',
  './percentage-calculator.html',
  './age-calculator.html',
  './date-difference-calculator.html',
  './unit-converter.html',
  './tip-discount-calculator.html',
  './about.html',
  './assets/css/styles.css',
  './assets/js/common.js',
  './assets/js/timer.js',
  './assets/js/stopwatch.js',
  './assets/js/pomodoro.js',
  './assets/js/gpa.js',
  './assets/js/percentage.js',
  './assets/js/age.js',
  './assets/js/date-diff.js',
  './assets/js/unit-converter.js',
  './assets/js/tip-discount.js',
  './assets/icons/favicon.svg',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (event.request.destination === 'document') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request, { ignoreSearch: true }))
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => new Response(''));
    })
  );
});
