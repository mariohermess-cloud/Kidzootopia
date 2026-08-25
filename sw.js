/* Service Worker: App laeuft auch offline (z. B. im Auto oder im Zug). */
const CACHE = 'kidzootopia-v11';
const DATEIEN = [
  './', './index.html', './app.css', './manifest.webmanifest',
  './icons/icon.svg', './icons/icon-maskable.svg',
  './js/app.js', './js/ui.js', './js/store.js', './js/engine.js',
  './js/generators.js', './js/data.js', './js/chart.js', './js/talenttest.js',
  './js/sprache.js', './js/geschichten.js', './js/klassiker.js', './js/philosophie.js', './js/hauptwerke.js', './js/fortgeschritten.js', './js/installhilfe.js'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(DATEIEN)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(k => Promise.all(k.filter(n => n !== CACHE).map(n => caches.delete(n))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(treffer => treffer || fetch(e.request).then(res => {
      const kopie = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, kopie)).catch(()=>{});
      return res;
    }).catch(() => caches.match('./index.html')))
  );
});
