const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";

const FILES_TO_CACHE = [
    '/',
    '/index.html',
    '/db.js',
    '/style.css',
    '/index.js',
    '/assets/icons/icon-192x192.png',
    '/assets/icons/icon-512x512.png'
];

self.addEventListener("install", (evt) => {
    evt.waitUntil(
        caches.open(DATA_CACHE_NAME).then((cache) => cache.add("./api/transaction"))
    );
    self.skipWaiting();
});

self.addEventListener("activate", (evt) => {
    evt.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(
                keyList.map(key => {
                    if(key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener("fetch", (evt) => {
    if (evt.request.url.includes("/api/")) {
        evt.respondWith(
            caches.open(DATA_CACHE_NAME).then(cache => {
               return fetch(evt.request).then(response => {
                   if (response.status === 200) {
                    cache.put(evt.request.url, response.clone());
                   }
                   return response;
               }).catch(err => console.log(err))
            })
        );
        return;
    }
    evt.respondWith(
        caches.match(evt.request).then((response) => {
            return response || fetch(evt.request)
        })
    )
})