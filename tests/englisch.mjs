/* Prueft "English Basics" (vokabeln) fuers Vorschulalter: das Bild traegt
   die Bedeutung, nicht der Text - ein Kind, das noch nicht liest, muss die
   Aufgabe trotzdem loesen koennen. Deshalb hier gezielt geprueft, was
   tests/aufgaben.mjs generisch nicht sieht: dass wirklich JEDE Aufgabe ein
   Bild hat, dass das Bild-Puzzle (bauen) wirklich mit Bildern statt Woertern
   antwortet, und dass der 🔊-Knopf (zweisprachig) wirklich zwei echte Woerter
   traegt statt leer zu sein. */

import { GEN } from '../js/generators.js';

let fehler = 0;
const pruefe = (bedingung, text) => {
  console.log(`${bedingung ? '✅' : '❌'} ${text}`);
  if (!bedingung) fehler++;
};

const V = GEN.vokabeln;
const N = 200;

/* -------------------------------------------------------------- Bilder */

/* "bauen" trägt sein Bild anders: nicht als einzelnes Vorschau-Bild, sondern
   als die vier Antwortmöglichkeiten selbst (siehe Bild-Puzzle weiter unten) -
   dort wird also gezielt DAS geprüft, nicht dieselbe Bedingung noch einmal. */
for (const weg of Object.keys(V).filter(w => w !== 'bauen')) {
  const aufgaben = Array.from({ length: N }, () => V[weg](1));
  pruefe(aufgaben.every(a => typeof a.bild === 'string' && a.bild.length > 0),
    `${weg}: JEDE Aufgabe zeigt ein Bild – auch ohne Lesen zu können lösbar`);
}

/* -------------------------------------------------- Zweisprachiges Hören */

for (const weg of ['erzaehlen', 'bauen', 'bewegen']) {
  const aufgaben = Array.from({ length: N }, () => V[weg](1));
  pruefe(aufgaben.every(a => a.zweisprachig?.de && a.zweisprachig?.en),
    `${weg}: jede Aufgabe hat ein deutsches UND ein englisches Wort zum Hören (🔊 „de → en")`);
  pruefe(aufgaben.every(a => a.zweisprachig.de.toLowerCase() !== a.zweisprachig.en.toLowerCase()),
    `${weg}: das deutsche und das englische Wort sind wirklich unterschiedlich – sonst gäbe es beim Hören nichts zu lernen`);
}

/* Das Lied-Rätsel (rhythmus) übersetzt nichts – dafür braucht es keinen
   Zweisprachig-Knopf, das wäre irreführend. */
const lieder = Array.from({ length: N }, () => V.rhythmus(1));
pruefe(lieder.every(a => !a.zweisprachig), 'rhythmus: kein Zweisprachig-Knopf, wo nichts übersetzt wird');

/* --------------------------------------------------- Bild-Puzzle (bauen) */

const bildRaetsel = Array.from({ length: N }, () => V.bauen(1));
pruefe(bildRaetsel.every(a => a.bildwahl === true),
  'bauen: als Bild-Puzzle markiert, damit die Oberfläche große Bild-Knöpfe statt Wort-Knöpfe zeigt');
/* Die Antwortmöglichkeiten müssen wirklich Bilder sein, keine englischen
   Wörter - sonst wäre es kein Bild-Puzzle, sondern dieselbe Textaufgabe wie
   bei "erzaehlen" noch einmal. Emoji bestehen nicht aus lateinischen
   Buchstaben - genau das wird hier als Gegenprobe genutzt. */
const lateinisch = /[a-zA-Z]/;
pruefe(bildRaetsel.every(a => a.optionen.every(o => !lateinisch.test(o))),
  'bauen: die vier Antwortmöglichkeiten sind Bilder, keine englischen Wörter zum Lesen');
pruefe(bildRaetsel.every(a => !lateinisch.test(a.antwort)),
  'bauen: auch die hinterlegte Lösung ist ein Bild, kein Wort');

/* Gegenprobe: erzaehlen antwortet dagegen ganz bewusst mit dem englischen
   WORT (das ist dort der Lernerfolg) - die beiden Rätselrichtungen sind also
   wirklich verschieden, nicht aus Versehen identisch aufgebaut. */
const bildErraten = Array.from({ length: N }, () => V.erzaehlen(1));
pruefe(bildErraten.every(a => lateinisch.test(a.antwort)),
  'erzaehlen (Gegenprobe): antwortet mit dem englischen WORT, nicht mit einem Bild – die andere Rätselrichtung');

/* ------------------------------------------------------- Genug Vielfalt */

const bilder = new Set();
for (let i = 0; i < 400; i++) bilder.add(V.erzaehlen(1).bild);
pruefe(bilder.size >= 15, `genug verschiedene Bilder für Abwechslung (${bilder.size} verschiedene gesehen)`);

console.log(fehler === 0
  ? '\nEnglish Basics ist bild- und hörbasiert, für Kinder, die noch nicht lesen ✅'
  : `\n${fehler} Problem(e) ❌`);
process.exit(fehler === 0 ? 0 : 1);
