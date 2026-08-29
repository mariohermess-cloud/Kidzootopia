/* Prueft "Strandfunde": Dinge, die man am Strand oder im Watt findet, ihrem
   Ursprung zuordnen. Der Kern der Aufgabe ist das BILD - ein Kind soll den
   Fund wirklich vor Augen haben, nicht nur den Namen lesen. Deshalb wird
   hier vor allem geprueft, dass jede Bild-Aufgabe (entdecken-Weg) wirklich
   ein Bild mitbringt, dass genuegend verschiedene Funde vorkommen, und dass
   ein einzelnes Emoji nicht durch zwei Funde doppelt belegt ist (sonst waere
   dasselbe Bild fuer zwei verschiedene Loesungen ohne die Beschreibung nicht
   zu unterscheiden). */

import { GEN } from '../js/generators.js';

let fehler = 0;
const pruefe = (bedingung, text) => {
  console.log(`${bedingung ? '✅' : '❌'} ${text}`);
  if (!bedingung) fehler++;
};

const S = GEN.strandfunde;
const N = 300;

/* -------------------------------------------------------------- Bilder */

const funde = Array.from({ length: N }, () => S.entdecken(1));
pruefe(funde.every(a => typeof a.bild === 'string' && a.bild.length > 0),
  'entdecken: JEDE Aufgabe zeigt ein Bild – auch ohne Lesen erkennbar');

const arten = new Set(funde.map(a => a.antwort));
pruefe(arten.size >= 6, `mindestens sechs verschiedene Funde kommen vor (${arten.size}: ${[...arten].join(', ')})`);

/* Kein Bild darf für zwei unterschiedliche Lösungen stehen - sonst wäre
   dasselbe Emoji ohne den Beschreibungstext nicht eindeutig zuzuordnen. */
const bildZuAntwort = new Map();
let widerspruch = null;
for (const a of funde) {
  const vorher = bildZuAntwort.get(a.bild);
  if (vorher && vorher !== a.antwort) { widerspruch = `${a.bild}: "${vorher}" vs. "${a.antwort}"`; break; }
  bildZuAntwort.set(a.bild, a.antwort);
}
pruefe(!widerspruch, `jedes Bild steht für genau einen Fund${widerspruch ? ' – Widerspruch: ' + widerspruch : ''}`);

/* Jede Bild-Aufgabe muss erklären, woran man den Fund erkennt - genau das
   macht die Erkennung ohne echtes Foto möglich. */
pruefe(funde.every(a => a.quelle && a.quelle.length > 20),
  'jede Bild-Aufgabe erklärt ausführlich, was der Fund wirklich ist');

/* -------------------------------------------------- Erzählen, Knobeln, Team */

for (const weg of ['erzaehlen', 'knobeln', 'team']) {
  const aufgaben = Array.from({ length: 100 }, () => S[weg](1));
  pruefe(aufgaben.every(a => a.optionen.includes(a.antwort)),
    `${weg}: die richtige Antwort steht immer unter den Optionen`);
  pruefe(aufgaben.every(a => a.quelle),
    `${weg}: jede Aufgabe hat eine Erklärung`);
}

console.log(fehler === 0
  ? '\nStrandfunde sind bildbasiert und eindeutig zuzuordnen ✅'
  : `\n${fehler} Problem(e) ❌`);
process.exit(fehler === 0 ? 0 : 1);
