const CACHE_NAME = 'ipad-db-cache-v0.0.7.2'; 
const urlsToCache = [
  './',
  './borrow.html',
  './admin.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// インストール時にファイルをキャッシュ
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(urlsToCache);
    }).then(() => self.skipWaiting())
  );
});

// 新バージョンが出たら古いキャッシュを自動削除
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('古いキャッシュを削除:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// まずネットを確認し、ダメならキャッシュを返す（Network First）
self.addEventListener('fetch', function(event) {
  event.respondWith(
    fetch(event.request)
      .then(function(response) {
        return caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, response.clone());
          return response;
        });
      })
      .catch(function() {
        return caches.match(event.request);
      })
  );
});
