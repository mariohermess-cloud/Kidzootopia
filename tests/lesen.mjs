/* Prueft die Auswertung einer Leseaufnahme - ohne Mikrofon.

   Der Trick: Die Auswertung bekommt nur eine Folge von Lautstaerkewerten.
   Solche Folgen lassen sich bauen, und zwar so, dass man die richtige Antwort
   vorher kennt: "vier Sprechbögen von je 2 Sekunden, dazwischen drei Pausen
   von 600 ms". Findet die Auswertung etwas anderes, ist sie falsch - das
   laesst sich nicht wegdiskutieren.

   Zusaetzlich wird jede Kennzahl gegen ihren Gegenfall geprueft: fluessig
   gegen stockend, betont gegen monoton, schnell gegen langsam. Eine Zahl,
   die in beiden Faellen gleich herauskommt, misst nichts. */

import { auswerten, abschnitte, betonung, schwelleFuer, einordnung, fortschritt,
         textMasse, TEXTE, texteFuer, PAUSE_MS } from '../js/lesen.js';
import { silben } from '../js/silben.js';

const SCHRITT = 25;   // ms pro Messwert, wie in der App

/* Baut eine Huellkurve aus abwechselnd Sprechen und Stille.
   muster: [{ms, laut}], laut = 0 fuer Stille, sonst Lautstaerke 0..1. */
function kurveAus(muster, { rauschen = 0.02, schwankung = 0 } = {}) {
  const werte = [];
  let phase = 0;
  for (const { ms, laut } of muster) {
    const n = Math.round(ms / SCHRITT);
    for (let i = 0; i < n; i++) {
      phase++;
      const wellig = schwankung ? Math.sin(phase / 3) * schwankung : 0;
      werte.push(laut ? Math.max(0.05, laut + wellig) : rauschen);
    }
  }
  return werte;
}

let fehler = 0;
const pruefe = (bedingung, text) => {
  console.log(`${bedingung ? '✅' : '❌'} ${text}`);
  if (!bedingung) fehler++;
};

/* ---------------------------------------------------------------- Zerlegung */

const vierBoegen = kurveAus([
  { ms: 2000, laut: 0.5 }, { ms: 600, laut: 0 },
  { ms: 2000, laut: 0.5 }, { ms: 600, laut: 0 },
  { ms: 2000, laut: 0.5 }, { ms: 600, laut: 0 },
  { ms: 2000, laut: 0.5 }
]);
const teile = abschnitte(vierBoegen, SCHRITT);
pruefe(teile.filter(t => t.sprechen).length === 4,
  `vier Sprechbögen gefunden (${teile.filter(t => t.sprechen).length})`);
pruefe(teile.filter(t => !t.sprechen).length === 3,
  `drei Pausen gefunden (${teile.filter(t => !t.sprechen).length})`);
pruefe(teile.filter(t => t.sprechen).every(t => t.dauerMs === 2000),
  'jeder Sprechbogen genau 2000 ms lang');
pruefe(teile.filter(t => !t.sprechen).every(t => t.dauerMs === 600),
  'jede Pause genau 600 ms lang');

/* Stille am Anfang und Ende darf nicht als Lesezeit zaehlen. */
const mitRand = kurveAus([
  { ms: 3000, laut: 0 }, { ms: 2000, laut: 0.5 }, { ms: 4000, laut: 0 }
]);
const randTeile = abschnitte(mitRand, SCHRITT);
pruefe(randTeile.length === 1 && randTeile[0].dauerMs === 2000,
  `Stille vor und nach dem Lesen wird abgeschnitten (${randTeile.length} Abschnitt(e))`);

/* Ein kurzer Einbruch mitten im Wort ist keine Pause, sondern ein
   Verschlusslaut - "Kat-ze" hat mitten drin eine Stille von etwa 60 ms. */
const mitVerschluss = kurveAus([
  { ms: 1000, laut: 0.5 }, { ms: 60, laut: 0 }, { ms: 1000, laut: 0.5 }
]);
pruefe(abschnitte(mitVerschluss, SCHRITT).filter(t => t.sprechen).length === 1,
  'kurzer Verschlusslaut zerreißt den Sprechbogen nicht');

/* Die Schwelle muss sich an die Aufnahme anpassen. */
const leise = kurveAus([{ ms: 1000, laut: 0.12 }, { ms: 500, laut: 0 }, { ms: 1000, laut: 0.12 }], { rauschen: 0.01 });
const laut = kurveAus([{ ms: 1000, laut: 0.85 }, { ms: 500, laut: 0 }, { ms: 1000, laut: 0.85 }], { rauschen: 0.20 });
pruefe(abschnitte(leise, SCHRITT).filter(t => t.sprechen).length === 2,
  'leises Kind im stillen Zimmer wird erkannt');
pruefe(abschnitte(laut, SCHRITT).filter(t => t.sprechen).length === 2,
  'lautes Kind mit Störgeräusch wird erkannt');
pruefe(schwelleFuer(laut) > schwelleFuer(leise),
  'die Schwelle passt sich der Aufnahme an, sie ist nicht fest');

/* ------------------------------------------------------------------- Tempo */

const TEXT = 'Die Sonne geht auf. Ein Vogel singt im Baum. Lena macht das Fenster auf.';
const masse = textMasse(TEXT);
console.log(`\nProbetext: ${masse.woerter} Wörter, ${masse.silben} Silben, ${masse.pausenStellen} Pausenstellen`);

/* Derselbe Text in 30 Sekunden gelesen muss halb so schnell sein wie in 15. */
const langsam = auswerten(kurveAus([{ ms: 30000, laut: 0.5 }]), { text: TEXT, schrittMs: SCHRITT });
const schnell = auswerten(kurveAus([{ ms: 15000, laut: 0.5 }]), { text: TEXT, schrittMs: SCHRITT });
pruefe(Math.abs(schnell.tempo - 2 * langsam.tempo) <= 1,
  `halbe Zeit = doppeltes Tempo (${langsam.tempo} → ${schnell.tempo} Silben/Minute)`);
pruefe(langsam.tempo === Math.round(masse.silben / 0.5),
  `Tempo stimmt rechnerisch (${langsam.tempo} = ${masse.silben} Silben in einer halben Minute)`);

/* -------------------------------------------------------------- Stockungen */

/* Zwei Aufnahmen gleicher Laenge: einmal in langen Boegen an den Satzzeichen,
   einmal Wort fuer Wort mit vielen langen Pausen. */
const fluessig = kurveAus([
  { ms: 3000, laut: 0.5 }, { ms: 500, laut: 0 },
  { ms: 3000, laut: 0.5 }, { ms: 500, laut: 0 },
  { ms: 3000, laut: 0.5 }
]);
const stockend = kurveAus([
  { ms: 700, laut: 0.5 }, { ms: 700, laut: 0 }, { ms: 500, laut: 0.5 }, { ms: 800, laut: 0 },
  { ms: 900, laut: 0.5 }, { ms: 600, laut: 0 }, { ms: 400, laut: 0.5 }, { ms: 900, laut: 0 },
  { ms: 800, laut: 0.5 }, { ms: 700, laut: 0 }, { ms: 600, laut: 0.5 }, { ms: 800, laut: 0 },
  { ms: 500, laut: 0.5 }, { ms: 900, laut: 0 }, { ms: 400, laut: 0.5 }
]);
const aF = auswerten(fluessig, { text: TEXT, schrittMs: SCHRITT });
const aS = auswerten(stockend, { text: TEXT, schrittMs: SCHRITT });
console.log(`Flüssig: ${aF.boegen} Bögen, ${aF.pausen} Pausen, ${aF.stockungen} Stockungen, Gleichmaß ${aF.gleichmass}`);
console.log(`Stockend: ${aS.boegen} Bögen, ${aS.pausen} Pausen, ${aS.stockungen} Stockungen, Gleichmaß ${aS.gleichmass}`);

pruefe(aS.stockungen > aF.stockungen,
  `stockendes Lesen ergibt mehr Stockungen (${aF.stockungen} gegen ${aS.stockungen})`);
pruefe(aF.stockungen === 0,
  'Pausen an Satzzeichen zählen NICHT als Stockung');
pruefe(aS.boegen > aF.boegen,
  `stockendes Lesen zerfällt in mehr Bögen (${aF.boegen} gegen ${aS.boegen})`);
pruefe(aF.gleichmass > aS.gleichmass,
  `gleichmäßige Bögen ergeben höheres Gleichmaß (${aF.gleichmass} gegen ${aS.gleichmass})`);

/* ---------------------------------------------------------------- Betonung */

const monoton = kurveAus([{ ms: 6000, laut: 0.5 }], { schwankung: 0 });
const betont  = kurveAus([{ ms: 6000, laut: 0.5 }], { schwankung: 0.28 });
pruefe(betonung(monoton) < 20, `monotone Stimme: niedrige Betonung (${betonung(monoton)})`);
pruefe(betonung(betont) > 50, `schwingende Stimme: hohe Betonung (${betonung(betont)})`);

/* ------------------------------------------------------------- Einordnung */

console.log('');
const gut = einordnung(aF, 1);
const schwach = einordnung(aS, 1);
console.log(`Flüssige Aufnahme → Stufe ${gut.stufe}: ${gut.name}`);
console.log(`Stockende Aufnahme → Stufe ${schwach.stufe}: ${schwach.name}`);
pruefe(gut.stufe > schwach.stufe,
  `flüssiges Lesen wird höher eingeordnet (${gut.stufe} gegen ${schwach.stufe})`);
pruefe(schwach.hinweise.length > 0, 'zur schwächeren Aufnahme gibt es konkrete Hinweise');
pruefe(gut.stufe >= 1 && gut.stufe <= 4, 'die Stufe liegt immer zwischen 1 und 4');

/* --------------------------------------------------------- Wiederholtes Lesen */

const besser = fortschritt(aS, aF);
pruefe(besser.besser === true, `der zweite Durchgang wird als Verbesserung erkannt: ${besser.text}`);
const schlechter = fortschritt(aF, aS);
pruefe(schlechter.besser === false, 'eine Verschlechterung wird nicht schöngeredet');
pruefe(fortschritt(aF, aF).text.includes('gleich'),
  'zweimal dieselbe Aufnahme ergibt keinen Fortschritt');

/* ------------------------------------------------------------------ Texte */

console.log('');
pruefe(TEXTE.length >= 25, `genug Texte vorhanden (${TEXTE.length})`);
for (let e = 1; e <= 5; e++) {
  const n = texteFuer(e).length;
  if (n < 5) { pruefe(false, `Etappe ${e} hat nur ${n} Texte`); }
}
pruefe([1,2,3,4,5].every(e => texteFuer(e).length >= 5), 'jede Etappe hat mindestens 5 Texte');
pruefe(TEXTE.every(t => t.titel && t.text && t.etappe),
  'jeder Text hat Titel, Inhalt und Etappe');
pruefe(TEXTE.every(t => /[.!?]$/.test(t.text.trim())),
  'jeder Text endet mit einem Satzzeichen');

/* Die Texte werden mit Silbenfaerbung angezeigt - also muss die Trennung
   auf JEDEM Wort der Texte sauber durchlaufen, nicht nur auf der Testliste. */
let woerterGesamt = 0, kaputt = [];
for (const t of TEXTE) {
  for (const roh of t.text.split(/\s+/)) {
    const w = roh.replace(/[^\p{L}]/gu, '');
    if (!w) continue;
    woerterGesamt++;
    const s = silben(w);
    if (s.join('') !== w) kaputt.push(`${w} → ${s.join('-')} (Buchstaben verändert)`);
    else if (s.some(x => !/[aeiouäöüy]/i.test(x))) kaputt.push(`${w} → ${s.join('-')} (Silbe ohne Vokal)`);
  }
}
pruefe(kaputt.length === 0,
  `alle ${woerterGesamt} Wörter der Lesetexte lassen sich sauber in Silben zerlegen` +
  (kaputt.length ? ': ' + kaputt.slice(0, 5).join('; ') : ''));

/* Die Texte muessen zur Etappe passen: laenger und dichter mit der Stufe. */
const schnitt = e => {
  const t = texteFuer(e);
  return t.reduce((s, x) => s + textMasse(x.text).silben / textMasse(x.text).woerter, 0) / t.length;
};
pruefe(schnitt(5) > schnitt(1),
  `höhere Etappen haben längere Wörter (${schnitt(1).toFixed(2)} gegen ${schnitt(5).toFixed(2)} Silben pro Wort)`);

/* --------------------------------------------------------------- Randfaelle */

console.log('');
const still = auswerten(kurveAus([{ ms: 5000, laut: 0 }]), { text: TEXT, schrittMs: SCHRITT });
pruefe(still.tempo === 0 && still.boegen === 0,
  'gar nicht gelesen ergibt Tempo 0 und stürzt nicht ab');
pruefe(einordnung(still, 1).stufe >= 1, 'auch eine leere Aufnahme bekommt eine gültige Stufe');
pruefe(auswerten([], { text: TEXT }).dauerMs === 0, 'leere Aufnahme stürzt nicht ab');
pruefe(auswerten(kurveAus([{ ms: 3000, laut: 0.5 }]), {}).silben === 0,
  'Auswertung ohne Text stürzt nicht ab');

console.log(fehler === 0
  ? '\nLeseauswertung arbeitet wie beschrieben ✅'
  : `\n${fehler} Problem(e) ❌`);
process.exit(fehler === 0 ? 0 : 1);
