/* Prueft das Schmierblatt - die Logik, nicht die Optik.

   Der Grund fuer diesen Test: "Zurueck" ist der Knopf, den ein Kind am
   haeufigsten druecken wird, und er ist der einzige Teil mit einer echten
   Entscheidung darin (Strich oder Marke - was war zuletzt dran?). Wenn der
   falsch liegt, verschwindet die Arbeit von vor fuenf Minuten statt des
   Versehens von eben. */

import { leeresBlatt, neuerStrich, marke, zurueck, leeren, istLeer, benutzt,
         MARKE_NAH, WERKZEUGE } from '../js/skizze.js';

let fehler = 0;
const pruefe = (bedingung, text) => {
  console.log(`${bedingung ? '✅' : '❌'} ${text}`);
  if (!bedingung) fehler++;
};

/* ------------------------------------------------------------ Grundzustand */

const b = leeresBlatt();
pruefe(istLeer(b), 'ein neues Blatt ist leer');
pruefe(!benutzt(b), 'ein leeres Blatt gilt nicht als benutzt');
pruefe(zurueck(b) === null, 'zurück auf einem leeren Blatt tut nichts');
pruefe(WERKZEUGE.length === 2, `zwei Werkzeuge: ${WERKZEUGE.join(', ')}`);

/* ----------------------------------------------------------------- Zaehlen */

const z = leeresBlatt();
for (let i = 0; i < 7; i++) marke(z, { x: 0.1 + i * 0.1, y: 0.5, t: i });
pruefe(z.marken.length === 7, `sieben Tipps ergeben sieben Punkte (${z.marken.length})`);

/* Nochmal auf denselben Punkt: der Punkt verschwindet wieder. */
const raus = marke(z, { x: 0.1, y: 0.5, t: 8 });
pruefe(raus.entfernt === true && z.marken.length === 6,
  `ein Tipp auf einen gesetzten Punkt nimmt ihn zurück (${z.marken.length} übrig)`);

/* Weit weg von allen bisherigen ist ein neuer Punkt, nicht dasselbe.
   (Die sieben Punkte oben liegen auf y = 0,5 - deshalb hier eine andere Zeile.) */
const daneben = marke(z, { x: 0.5, y: 0.9, t: 9 });
pruefe(daneben.entfernt === false && z.marken.length === 7,
  'ein Tipp deutlich daneben setzt einen neuen Punkt');

/* ----------------------------------------------------------------- Zurueck */

/* Der Kern: Zuletzt Getanes zuerst - über beide Werkzeuge hinweg. */
const g = leeresBlatt();
neuerStrich(g, { x: .1, y: .1, t: 100 });
marke(g, { x: .5, y: .5, t: 200 });
pruefe(zurueck(g) === 'marke', 'zuletzt eine Marke gesetzt → die Marke geht zurück');
pruefe(zurueck(g) === 'strich', 'davor ein Strich → dann geht der Strich zurück');
pruefe(istLeer(g), 'danach ist das Blatt wieder leer');

const g2 = leeresBlatt();
marke(g2, { x: .5, y: .5, t: 100 });
neuerStrich(g2, { x: .1, y: .1, t: 200 });
pruefe(zurueck(g2) === 'strich', 'umgekehrte Reihenfolge: zuletzt ein Strich → der Strich geht zurück');
pruefe(g2.marken.length === 1, 'die ältere Marke bleibt dabei stehen');

/* Nur Striche, nur Marken - beides muss auch allein funktionieren. */
const nurS = leeresBlatt();
neuerStrich(nurS, { x: .1, y: .1, t: 1 }); neuerStrich(nurS, { x: .2, y: .2, t: 2 });
pruefe(zurueck(nurS) === 'strich' && nurS.striche.length === 1, 'nur Striche: zurück nimmt den letzten');
const nurM = leeresBlatt();
marke(nurM, { x: .1, y: .1, t: 1 }); marke(nurM, { x: .9, y: .9, t: 2 });
pruefe(zurueck(nurM) === 'marke' && nurM.marken.length === 1, 'nur Marken: zurück nimmt die letzte');

/* ------------------------------------------------------------------ Leeren */

const l = leeresBlatt();
neuerStrich(l, { x: .1, y: .1, t: 1 });
marke(l, { x: .5, y: .5, t: 2 });
leeren(l);
pruefe(istLeer(l), 'leeren räumt Striche und Marken ab');

/* -------------------------------------------------- Wurde wirklich gemalt? */

/* Ein einzelner Fehltipp darf nicht als "hat eine Skizze gemacht" zaehlen -
   sonst steht im Eltern-Bereich Unsinn. */
const tipp = leeresBlatt();
marke(tipp, { x: .5, y: .5, t: 1 });
pruefe(!benutzt(tipp), 'ein einzelner Tipp gilt noch nicht als Skizze');
marke(tipp, { x: .7, y: .5, t: 2 });
pruefe(benutzt(tipp), 'zwei gesetzte Punkte sind eine Zählskizze');

const kritzel = leeresBlatt();
const s = neuerStrich(kritzel, { x: .1, y: .1, t: 1 });
pruefe(!benutzt(kritzel), 'ein einzelner Berührpunkt gilt noch nicht als Skizze');
s.push({ x: .2, y: .2, t: 2 }, { x: .3, y: .3, t: 3 });
pruefe(benutzt(kritzel), 'eine gezogene Linie ist eine Skizze');

console.log(fehler === 0
  ? '\nSchmierblatt arbeitet wie beschrieben ✅'
  : `\n${fehler} Problem(e) ❌`);
process.exit(fehler === 0 ? 0 : 1);
