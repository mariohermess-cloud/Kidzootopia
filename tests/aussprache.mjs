/* Prueft die Silben-Zuordnung: findet sie die richtigen Silben im Ton?

   Der Test baut kuenstliche Aufnahmen, deren Silbenstruktur er selbst
   festlegt: "fuenf Silben, die dritte doppelt so lang, davor eine Pause von
   600 ms". Findet die Zuordnung etwas anderes, ist sie falsch - das laesst
   sich nicht wegdiskutieren.

   Das Wichtigste dabei ist nicht, dass ueberhaupt Farben herauskommen, sondern
   dass eine ruhig gelesene Silbe NICHT rot wird und eine gestockte NICHT
   gruen. Eine Faerbung, die daneben liegt, waere schlimmer als gar keine:
   Ein Kind, das fluessig liest und rot sieht, hoert auf zu lesen. */

import { gipfel, zuordnen, betonteSilbe, hervorgehoben, betonungPruefen,
         zusammenfassung, glaetten, inDezibel, MINDEST_TAL_DB } from '../js/aussprache.js';
import { silben } from '../js/silben.js';

const SCHRITT = 25;
let fehler = 0;
const pruefe = (bedingung, text) => {
  console.log(`${bedingung ? '✅' : '❌'} ${text}`);
  if (!bedingung) fehler++;
};

/* Baut eine Aufnahme aus Silben. Jede Silbe ist ein Lautstaerke-Berg;
   dazwischen faellt es ab. So sieht echte Sprache in der Huellkurve aus. */
function sprich(silbenPlan, { rauschen = 0.01 } = {}) {
  const kurve = [];
  const dazu = (ms, wert) => {
    for (let i = 0; i < Math.round(ms / SCHRITT); i++) kurve.push(wert);
  };
  dazu(200, rauschen);                                  // Stille am Anfang
  silbenPlan.forEach((s, i) => {
    if (i > 0) dazu(s.pauseMs ?? 40, rauschen + 0.004); // Tal zwischen den Silben
    const n = Math.max(3, Math.round((s.dauerMs ?? 200) / SCHRITT));
    /* Ein Berg: leise - laut - leise. Der Gipfel liegt in der Mitte. */
    for (let k = 0; k < n; k++) {
      const anteil = Math.sin((k + 0.5) / n * Math.PI);   // 0 → 1 → 0
      kurve.push(rauschen + (s.laut ?? 0.5) * Math.max(0.12, anteil));
    }
  });
  dazu(200, rauschen);
  return kurve;
}

/* ------------------------------------------------------- Silbenkerne finden */

const fuenf = sprich([{}, {}, {}, {}, {}]);
pruefe(gipfel(fuenf, SCHRITT).length === 5,
  `fünf gesprochene Silben ergeben fünf Gipfel (${gipfel(fuenf, SCHRITT).length})`);

const drei = sprich([{}, {}, {}]);
pruefe(gipfel(drei, SCHRITT).length === 3,
  `drei Silben ergeben drei Gipfel (${gipfel(drei, SCHRITT).length})`);

/* Ein langgezogener Vokal ist EINE Silbe, auch wenn er zwischendurch
   schwankt. Das ist der haeufigste Fehler dieses Verfahrens. */
const langgezogen = [];
for (let i = 0; i < 8; i++) langgezogen.push(0.01);
for (let i = 0; i < 40; i++) langgezogen.push(0.5 + Math.sin(i / 2) * 0.03);
for (let i = 0; i < 8; i++) langgezogen.push(0.01);
pruefe(gipfel(langgezogen, SCHRITT).length === 1,
  `ein langgezogener Laut bleibt EINE Silbe (${gipfel(langgezogen, SCHRITT).length})`);

/* Stille ist keine Silbe. */
const still = new Array(200).fill(0.01);
pruefe(gipfel(still, SCHRITT).length === 0, 'Stille ergibt keine Silben');

/* Unabhaengig von der Aufnahmelautstaerke: leise und laut gleich viele. */
const leise = sprich([{ laut: 0.08 }, { laut: 0.08 }, { laut: 0.08 }], { rauschen: 0.004 });
const laut  = sprich([{ laut: 0.9 },  { laut: 0.9 },  { laut: 0.9 }],  { rauschen: 0.05 });
pruefe(gipfel(leise, SCHRITT).length === 3, `leise gesprochen: 3 Silben (${gipfel(leise,SCHRITT).length})`);
pruefe(gipfel(laut, SCHRITT).length === 3,  `laut gesprochen: 3 Silben (${gipfel(laut,SCHRITT).length})`);

/* --------------------------------------------------------------- Zuordnung */

const wort = (w) => silben(w).map((text, i, alle) => ({ text, wort: w, imWort: i, vonWort: alle.length }));
const liste = [...wort('Sonnenblume')];       // Son-nen-blu-me = 4 Silben
pruefe(liste.length === 4, `"Sonnenblume" hat 4 Silben (${liste.length})`);

const fluessig = sprich(liste.map(() => ({ dauerMs: 220, pauseMs: 40 })));
const zFluessig = zuordnen(liste, fluessig, { schrittMs: SCHRITT });
pruefe(zFluessig.sicher, 'flüssig gelesen: die Zuordnung gilt als sicher');
pruefe(zFluessig.silben.every(s => s.gefunden), 'jede Silbe wurde im Ton wiedergefunden');
pruefe(zFluessig.silben.every(s => s.farbe === 'gruen'),
  `flüssig gelesen ist durchgehend grün (${zFluessig.silben.map(s => s.farbe).join(', ')})`);

/* Gestockt: vor der dritten Silbe eine lange Pause. Nur DIESE darf auffallen. */
const gestockt = sprich(liste.map((s, i) => ({ dauerMs: 220, pauseMs: i === 2 ? 900 : 40 })));
const zGestockt = zuordnen(liste, gestockt, { schrittMs: SCHRITT });
const farben = zGestockt.silben.map(s => s.farbe);
pruefe(farben[2] === 'rot', `die Stelle mit der langen Pause wird rot (${farben.join(', ')})`);
pruefe(farben.filter(f => f === 'rot').length === 1,
  'nur die gestockte Silbe wird rot, nicht der ganze Rest');
pruefe(farben[0] === 'gruen' && farben[1] === 'gruen',
  'die flüssig gelesenen Silben davor bleiben grün');

/* Gedehnt statt gestockt: mittlere Warnstufe, nicht gleich rot. */
const gedehnt = sprich(liste.map((s, i) => ({ dauerMs: i === 1 ? 500 : 200, pauseMs: 40 })));
const zGedehnt = zuordnen(liste, gedehnt, { schrittMs: SCHRITT });
pruefe(['gelb','orange'].includes(zGedehnt.silben[1].farbe),
  `eine gedehnte Silbe wird gelb oder orange, nicht rot (${zGedehnt.silben[1].farbe})`);

/* Verschluckte Silbe: die Zuordnung muss das MERKEN und nicht so tun, als
   wäre alles in Ordnung. */
const zuWenig = sprich([{}, {}]);                     // nur 2 statt 4
const zLuecke = zuordnen(liste, zuWenig, { schrittMs: SCHRITT });
pruefe(!zLuecke.sicher, 'zwei statt vier Silben: die Zuordnung gilt als UNSICHER');
pruefe(zLuecke.silben.filter(s => !s.gefunden).length === 2,
  'die beiden fehlenden Silben werden als nicht gefunden gemeldet');

/* ---------------------------------------------------------------- Betonung */

pruefe(betonteSilbe(['Son','nen','blu','me']) === 0, 'Sonnenblume: Akzent auf der ersten Silbe');
pruefe(betonteSilbe(['ver','ste','hen']) === 1, 'verstehen: Akzent NICHT auf der Vorsilbe „ver"');
pruefe(betonteSilbe(['be','kom','men']) === 1, 'bekommen: Akzent auf „kom"');
pruefe(betonteSilbe(['ge','le','sen']) === 1, 'gelesen: Akzent auf „le"');
pruefe(betonteSilbe(['Baum']) === 0, 'einsilbige Wörter: Akzent auf der einzigen Silbe');

/* Wer die zweite Silbe lauter und länger spricht, hat sie betont. */
const vst = wort('verstehen');
const richtigBetont = sprich([
  { dauerMs: 150, laut: 0.35 }, { dauerMs: 320, laut: 0.75 }, { dauerMs: 200, laut: 0.4 }]);
const zBet = zuordnen(vst, richtigBetont, { schrittMs: SCHRITT });
pruefe(hervorgehoben(zBet.silben) === 1,
  `die lauteste und längste Silbe wird als betont erkannt (${hervorgehoben(zBet.silben)})`);

const pruefungen = betonungPruefen([{ wort: 'verstehen', silben: zBet.silben }]);
pruefe(pruefungen.length === 1 && pruefungen[0].stimmt,
  'Betonung auf „ste" wird als richtig gewertet');

const falschBetont = sprich([
  { dauerMs: 340, laut: 0.8 }, { dauerMs: 150, laut: 0.35 }, { dauerMs: 180, laut: 0.35 }]);
const zFalsch = zuordnen(vst, falschBetont, { schrittMs: SCHRITT });
const p2 = betonungPruefen([{ wort: 'verstehen', silben: zFalsch.silben }]);
pruefe(p2.length === 1 && !p2[0].stimmt,
  'Betonung auf der Vorsilbe „ver" wird als abweichend erkannt');

/* Bei einsilbigen Wörtern wird gar nichts behauptet. */
pruefe(betonungPruefen([{ wort: 'Baum', silben: [{ gefunden: true, text: 'Baum' }] }]).length === 0,
  'über einsilbige Wörter wird keine Betonungsaussage gemacht');

/* ---------------------------------------------------------- Zusammenfassung */

const zus = zusammenfassung(zGestockt, pruefungen);
pruefe(zus.rot === 1 && zus.holprig >= 1, `Zusammenfassung zählt richtig (rot: ${zus.rot})`);
pruefe(zus.stolpersteine.includes('Sonnenblume'),
  `das Wort mit der Stockung landet bei den Stolpersteinen (${zus.stolpersteine.join(', ')})`);
pruefe(zusammenfassung(zFluessig, []).holprig === 0,
  'flüssig gelesen ergibt keine Stolpersteine');

/* ---------------------------------------------------------------- Randfälle */

pruefe(zuordnen([], [], {}).silben.length === 0, 'leere Eingabe stürzt nicht ab');
pruefe(zuordnen(liste, [], {}).sicher === false, 'ohne Aufnahme ist nichts sicher');
pruefe(gipfel([], SCHRITT).length === 0, 'leere Kurve ergibt keine Gipfel');
pruefe(glaetten([1,2,3], 0).length === 3, 'Glätten ohne Fenster gibt die Werte zurück');
pruefe(inDezibel([0]).every(v => Number.isFinite(v)), 'Stille ergibt keine unendlichen Werte');
pruefe(MINDEST_TAL_DB > 0, 'es gibt eine Mindesttiefe für das Tal zwischen zwei Silben');

/* ------------------------------------------------- Lernen aus Erfahrung */

/* Der Speicher der Stolperwoerter muss zweierlei koennen: haengenbleiben, was
   wirklich haengt - und vergessen, was fluessig geworden ist. Ohne das Zweite
   waere es kein Lernen, sondern nur eine Sammlung alter Fehler. */
const S = await import('../js/store.js');
const kind = { stolper: {} };
S.merkeStolper(kind, ['Schmetterling', 'Biene']);
S.merkeStolper(kind, ['Schmetterling']);
S.merkeStolper(kind, ['Schmetterling']);
const hakt = S.stolperWoerter(kind);
pruefe(hakt.some(x => x.wort === 'Schmetterling'),
  `mehrfaches Stocken merkt sich die App: ${hakt.map(x => x.wort).join(', ')}`);
pruefe(!hakt.some(x => x.wort === 'Biene'),
  'einmaliges Verhaspeln landet NICHT auf der Liste');

for (let i = 0; i < 6; i++) S.merkeStolper(kind, []);
pruefe(S.stolperWoerter(kind).length === 0,
  'wird ein Wort flüssig, verschwindet es von selbst wieder');

/* Der Speicher darf nicht endlos wachsen. */
const viel = { stolper: {} };
for (let i = 0; i < 200; i++) S.merkeStolper(viel, ['Wort' + i, 'Wort' + (i+1)]);
pruefe(Object.keys(viel.stolper).length <= 40,
  `der Speicher bleibt gedeckelt (${Object.keys(viel.stolper).length} Wörter)`);

console.log(fehler === 0
  ? '\nSilben-Zuordnung arbeitet wie beschrieben ✅'
  : `\n${fehler} Problem(e) ❌`);
process.exit(fehler === 0 ? 0 : 1);
