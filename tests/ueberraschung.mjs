/* Prueft das Ueberraschungsraetsel des Tages.

   Das Wichtigste hier ist NICHT die Mathematik (die ist trivial), sondern
   dass das Raetsel wirklich fuer alle Kinder am selben Kalendertag GLEICH
   ist - sonst waere "das heutige Raetsel" nur eine huebsche Umschreibung
   fuer irgendein zufaelliges Raetsel, und Geschwister koennten sich nicht
   mehr darueber austauschen. Und dass jedes erzeugte Raetsel wirklich mit
   reiner Rechnung loesbar ist, ohne versteckte Zusatzannahme. */

import { raetselFuer, pruefeAntwort, BONUS } from '../js/ueberraschung.js';

let fehler = 0;
const pruefe = (bedingung, text) => {
  console.log(`${bedingung ? '✅' : '❌'} ${text}`);
  if (!bedingung) fehler++;
};

/* ------------------------------------------------------- Determinismus */

const heute = '2026-08-29';
const a1 = raetselFuer(heute), a2 = raetselFuer(heute);
pruefe(JSON.stringify(a1) === JSON.stringify(a2),
  'dasselbe Datum ergibt IMMER dasselbe Rätsel – sonst wäre es kein "Rätsel des Tages"');

const morgen = raetselFuer('2026-08-30');
pruefe(JSON.stringify(a1) !== JSON.stringify(morgen),
  'ein anderer Tag ergibt (praktisch immer) ein anderes Rätsel');

/* Über viele Tage müssen beide Rätselarten vorkommen - sonst wäre die
   "Überraschung" gelogen, weil immer dieselbe Art käme. */
const arten = new Set();
for (let i = 0; i < 60; i++) {
  const d = new Date(2026, 0, 1 + i).toISOString().slice(0, 10);
  arten.add(raetselFuer(d).typ);
}
pruefe(arten.size >= 2, `über 60 Tage kommen mehrere Rätselarten vor (${[...arten].join(', ')})`);

/* ------------------------------------------------------------ Pyramide */

const pyramiden = [];
for (let i = 0; i < 200; i++) {
  const d = new Date(2020, 0, 1 + i).toISOString().slice(0, 10);
  const r = raetselFuer(d);
  if (r.typ === 'pyramide') pyramiden.push(r);
}
pruefe(pyramiden.length > 0, `mindestens eine Pyramide unter den ersten 200 Tagen erzeugt (${pyramiden.length})`);

pruefe(pyramiden.every(r => r.reihen[0].length === 4), 'die Basis hat immer 4 Steine');
pruefe(pyramiden.every(r => r.reihen.every((reihe, i) =>
  i === 0 || reihe.every((v, j) => v === r.reihen[i-1][j] + r.reihen[i-1][j+1]))),
  'jeder Stein ist wirklich die Summe der zwei Steine direkt darunter – in JEDER erzeugten Pyramide');
pruefe(pyramiden.every(r => r.versteckt.reihe >= 1),
  'die Basis (Reihe 0) wird nie versteckt – sonst wäre nichts zum Rechnen mehr sichtbar');
pruefe(pyramiden.every(r => r.antwort === String(r.reihen[r.versteckt.reihe][r.versteckt.spalte])),
  'die hinterlegte Antwort stimmt mit der wirklich versteckten Zahl überein');

/* Gegenprobe: würde man auch Reihe 0 verstecken dürfen, gäbe es Pyramiden
   ohne durchgehend sichtbare Basis - das müsste der obige Test dann auch
   melden. Hier wird das absichtlich simuliert statt am Code sabotiert. */
const kaputtesBeispiel = { ...pyramiden[0], versteckt: { reihe: 0, spalte: 0 } };
pruefe(!(kaputtesBeispiel.versteckt.reihe >= 1),
  'Gegenprobe: eine versteckte Basis würde von derselben Prüfung erkannt (zeigt, dass die Prüfung nicht leer durchläuft)');

/* --------------------------------------------------------------- Waage */

const waagen = [];
for (let i = 0; i < 200; i++) {
  const d = new Date(2021, 0, 1 + i).toISOString().slice(0, 10);
  const r = raetselFuer(d);
  if (r.typ === 'waage') waagen.push(r);
}
pruefe(waagen.length > 0, `mindestens ein Waage-Rätsel unter den ersten 200 Tagen erzeugt (${waagen.length})`);

pruefe(waagen.every(r => {
  const [z1, z2] = r.zeilen;
  const a = z1.rechts / 2;                 // aus "s1 + s1 = 2a"
  const b = z2.rechts - a;                 // aus "s1 + s2 = a+b", a bekannt
  return Number.isInteger(a) && a > 0 && b > 0 && r.antwort === String(b + b);
}), 'jedes Waage-Rätsel lässt sich rein durch Halbieren und Abziehen lösen, und die Antwort stimmt');

pruefe(waagen.every(r => r.zeilen[0].links[0] === r.zeilen[0].links[1]),
  'die erste Zeile zeigt immer dasselbe Symbol doppelt – Grundlage zum Halbieren');
pruefe(waagen.every(r => r.zeilen[1].links[0] !== r.zeilen[1].links[1]),
  'die zweite Zeile zeigt zwei VERSCHIEDENE Symbole – sonst gäbe es nichts Neues zu erschließen');

/* ------------------------------------------------------------ pruefeAntwort */

const beispiel = raetselFuer(heute);
pruefe(pruefeAntwort(beispiel, beispiel.antwort) === true, 'die richtige Antwort wird als richtig erkannt');
pruefe(pruefeAntwort(beispiel, '  ' + beispiel.antwort + '  ') === true,
  'Leerzeichen um die Antwort herum stören nicht');
pruefe(pruefeAntwort(beispiel, String(Number(beispiel.antwort) + 1)) === false,
  'eine falsche Antwort wird auch als falsch erkannt');
pruefe(pruefeAntwort(beispiel, '') === false, 'eine leere Eingabe gilt nicht als richtig');

/* --------------------------------------------------------------- Bonus */

pruefe(typeof BONUS === 'number' && BONUS > 0, `es gibt einen positiven Bonus fürs Lösen (${BONUS})`);

console.log(fehler === 0
  ? '\nÜberraschungsrätsel ist für alle gleich, immer rechnerisch lösbar ✅'
  : `\n${fehler} Problem(e) ❌`);
process.exit(fehler === 0 ? 0 : 1);
