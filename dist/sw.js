const CACHE_NAME = 'beasiswa-tracker-v5';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.png',
  '/uoft-logo.png',
  '/uoft-crest-clean.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const isNavigation = event.request.mode === 'navigate' || event.request.headers.get('accept')?.includes('text/html');

  // SPA Navigation handling (Network First -> Fallback to cached index.html for ALL routes offline)
  if (isNavigation) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const cloned = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cloned));
          return response;
        })
        .catch(async () => {
          const cachedHtml = (await caches.match('/index.html')) || (await caches.match('/'));
          return cachedHtml || new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/html' } });
        })
    );
    return;
  }

  // API calls handling
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const cloned = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cloned));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Static assets & scripts handling (Network First -> Fallback to Cache)
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.status === 200) {
          const cloned = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cloned));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { title: 'Beasiswa Tracker', body: 'New notification!' };
  const options = {
    body: data.body,
    icon: '/uoft-logo.png',
    badge: '/uoft-logo.png',
    vibrate: [100, 50, 100],
    data: { dateOfArrival: Date.now(), primaryKey: '1' }
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
});
