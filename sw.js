/* Service Worker: App laeuft auch offline (z. B. im Auto oder im Zug).
   Die Nummer in CACHE muss zu NUMMER in js/version.js passen – sonst zeigt der
   Eltern-Bereich eine andere Fassung an als die, die ausgeliefert wird.
   tests/version.mjs prueft das. */
const CACHE = 'kidzootopia-v16';
const DATEIEN = [
  './', './index.html', './app.css', './manifest.webmanifest',
  './icons/icon.svg', './icons/icon-maskable.svg',
  './js/app.js', './js/ui.js', './js/store.js', './js/engine.js',
  './js/generators.js', './js/data.js', './js/chart.js', './js/talenttest.js',
  './js/sprache.js', './js/geschichten.js', './js/klassiker.js', './js/philosophie.js', './js/hauptwerke.js', './js/fortgeschritten.js', './js/installhilfe.js', './js/knacknuss_familien.js', './js/zeichnen.js', './js/avatar.js', './js/kunstanalyse.js', './js/version.js'
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
