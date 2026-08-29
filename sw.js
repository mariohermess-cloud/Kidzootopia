/* Service Worker: App laeuft auch offline (z. B. im Auto oder im Zug).
   Die Nummer in CACHE muss zu NUMMER in js/version.js passen – sonst zeigt der
   Eltern-Bereich eine andere Fassung an als die, die ausgeliefert wird.
   tests/version.mjs prueft das. */
const CACHE = 'kidzootopia-v30';
const DATEIEN = [
  './', './index.html', './app.css', './manifest.webmanifest',
  './icons/icon.svg', './icons/icon-maskable.svg',
  './js/app.js', './js/ui.js', './js/store.js', './js/engine.js',
  './js/generators.js', './js/data.js', './js/chart.js', './js/talenttest.js',
  './js/sprache.js', './js/geschichten.js', './js/klassiker.js', './js/philosophie.js', './js/hauptwerke.js', './js/fortgeschritten.js', './js/installhilfe.js', './js/knacknuss_familien.js', './js/zeichnen.js', './js/avatar.js', './js/kunstanalyse.js', './js/version.js', './js/silben.js', './js/lesen.js', './js/skizze.js', './js/zahlfeld.js', './js/kommentar.js', './js/aussprache.js', './js/punkte.js', './js/rennen.js', './js/ueberraschung.js'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(DATEIEN)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(k => Promise.all(k.filter(n => n !== CACHE).map(n => caches.delete(n))))
    .then(() => self.clients.claim()));
});
/* Beim Aufruf der Seite selbst zuerst das Netz fragen, sonst den Zwischenspeicher.
   Grund: Lag die Seite nur im Zwischenspeicher, startete die App auch mit Verbindung
   immer die alte Fassung – besonders hartnaeckig auf dem iPhone, wo die App vom
   Startbildschirm sehr lange am Gespeicherten festhaelt. Das Netz bekommt 2,5
   Sekunden; danach zaehlt der Zwischenspeicher, damit die App offline sofort da ist.
   Alles andere (Bilder, Skripte, Stile) kommt weiter zuerst aus dem Zwischenspeicher –
   das haelt die App schnell, und neue Fassungen kommen ueber den Cache-Namen. */
const AUS_DEM_NETZ = req => fetch(req).then(res => {
  const kopie = res.clone();
  caches.open(CACHE).then(c => c.put(req, kopie)).catch(()=>{});
  return res;
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  if (e.request.mode === 'navigate') {
    e.respondWith(new Promise(fertig => {
      const notbremse = setTimeout(
        () => caches.match('./index.html').then(t => t && fertig(t)), 2500);
      AUS_DEM_NETZ(e.request)
        .then(res => { clearTimeout(notbremse); fertig(res); })
        .catch(() => { clearTimeout(notbremse);
          caches.match(e.request).then(t => fertig(t || caches.match('./index.html'))); });
    }));
    return;
  }

  e.respondWith(
    caches.match(e.request).then(treffer => treffer
      || AUS_DEM_NETZ(e.request).catch(() => caches.match('./index.html')))
  );
});
