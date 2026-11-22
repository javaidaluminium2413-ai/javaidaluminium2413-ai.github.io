const CACHE = 'ja-app-v2';
const CORE = ['./', './index.html', './manifest.json', './icon.svg'];
self.addEventListener('install', function(e){ e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(CORE); }).then(function(){ return self.skipWaiting(); })); });
self.addEventListener('activate', function(e){ e.waitUntil(caches.keys().then(function(names){ return Promise.all(names.map(function(n){ if (n !== CACHE) return caches.delete(n); })); }).then(function(){ return self.clients.claim(); })); });
self.addEventListener('fetch', function(e){
  if (e.request.method !== 'GET') return;
  var isDoc = e.request.mode === 'navigate' || /\/app\/?$/.test(e.request.url) || /index\.html/.test(e.request.url);
  if (isDoc) {
    e.respondWith(fetch(e.request).then(function(res){
      var copy = res.clone();
      caches.open(CACHE).then(function(c){ c.put('./index.html', copy); });
      return res;
    }).catch(function(){ return caches.match('./index.html'); }));
    return;
  }
  e.respondWith(caches.match(e.request, {ignoreSearch: true}).then(function(hit){
    if (hit) return hit;
    return fetch(e.request).then(function(res){
      var copy = res.clone();
      caches.open(CACHE).then(function(c){ c.put(e.request, copy); });
      return res;
    }).catch(function(){ return caches.match('./index.html'); });
  }));
});
