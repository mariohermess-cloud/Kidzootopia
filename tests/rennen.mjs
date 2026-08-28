/* Prueft den Renn-Modus: die Runde als Rennen gegen das eigene Geisterrennen.

   Das Wichtigste ist nicht die Grafik, sondern dass die Strecke NIE
   rueckwaerts geht (die Grundlage jedes fairen Rennens) und dass das
   Ergebnis nicht mehr behauptet, als da ist - "gewonnen" nur bei wirklich
   mehr Punkten, nie bei gleich vielen oder weniger. */

import { spurFuer, geistBei, prozentAuf, rennErgebnis } from '../js/rennen.js';

let fehler = 0;
const pruefe = (bedingung, text) => {
  console.log(`${bedingung ? '✅' : '❌'} ${text}`);
  if (!bedingung) fehler++;
};

/* ------------------------------------------------------------- spurFuer() */

const verlauf = [
  { ms: 1000, punkte: 10 },
  { ms: 2000, punkte: 0 },     // falsch beantwortet: 0 Punkte, aber Zeit vergeht trotzdem
  { ms: 500,  punkte: 18 },
  { ms: 1500, punkte: 12 }
];
const spur = spurFuer(verlauf);

pruefe(spur.length === verlauf.length + 1, 'die Strecke hat einen Startpunkt plus einen je Aufgabe');
pruefe(spur[0].ms === 0 && spur[0].punkte === 0, 'die Strecke beginnt bei 0/0');
pruefe(spur.every((s, i) => i === 0 || s.ms >= spur[i-1].ms),
  'die Zeit auf der Strecke geht nie rückwärts');
pruefe(spur.every((s, i) => i === 0 || s.punkte >= spur[i-1].punkte),
  'die Punktesumme auf der Strecke geht nie rückwärts – auch nicht nach einer falschen Antwort');
pruefe(spur[spur.length-1].punkte === 40, `die Endsumme stimmt (${spur[spur.length-1].punkte} statt 40)`);
pruefe(spur[spur.length-1].ms === 5000, `die Endzeit stimmt (${spur[spur.length-1].ms} statt 5000)`);

/* Gegenprobe: negative Werte in der Eingabe duerfen die Strecke nicht
   zurueckwerfen - punkteFuer() liefert das zwar nie, aber die Funktion
   selbst muss sich auch gegen einen kaputten Aufrufer wehren. */
const kaputterVerlauf = [{ ms: -500, punkte: -30 }, { ms: 1000, punkte: 10 }];
const kaputteSpur = spurFuer(kaputterVerlauf);
pruefe(kaputteSpur.every(s => s.ms >= 0 && s.punkte >= 0),
  'auch bei unsinnigen negativen Werten bleibt die Strecke bei 0 stehen, statt rückwärts zu gehen');

pruefe(spurFuer([]).length === 1 && spurFuer([])[0].punkte === 0,
  'eine leere Runde ergibt nur den Startpunkt, kein Absturz');
pruefe(spurFuer().length === 1, 'ganz ohne Argument stürzt nichts ab');

/* --------------------------------------------------------------- geistBei() */

pruefe(geistBei(spur, 0) === 0, 'ganz am Anfang steht der Geist bei 0');
pruefe(geistBei(spur, 1000) === 10, 'genau an einem Stützpunkt trifft der Geist den echten Wert');
pruefe(geistBei(spur, 500) === 5, `auf halbem Weg zwischen 0 und 1000ms wird interpoliert (${geistBei(spur, 500)} statt 5)`);
pruefe(geistBei(spur, 999999) === 40, 'nach dem Ende bleibt der Geist auf seinem Endstand stehen, er läuft nicht weiter');
pruefe(geistBei([], 500) === 0, 'ohne Strecke steht der Geist bei 0, kein Absturz');
pruefe(geistBei(null, 500) === 0, 'eine fehlende Strecke stürzt nicht ab');

/* Gegenprobe: interpoliert wird nur zwischen den ECHTEN Nachbarpunkten, nicht
   quer über die ganze Strecke - sonst waere ein Wert mittendrin falsch. */
const zweiterAbschnitt = geistBei(spur, 1250); // zwischen ms=1000 (10 Pkt) und ms=3000 (weiterhin 10 Pkt, da die falsche Antwort 0 brachte)
pruefe(zweiterAbschnitt === 10, `im flachen Abschnitt (falsche Antwort) bleibt der Wert flach (${zweiterAbschnitt} statt 10)`);

/* ------------------------------------------------------------- prozentAuf() */

pruefe(prozentAuf(0, 100) === 0, '0 von 100 Punkten sind 0 %');
pruefe(prozentAuf(50, 100) === 50, '50 von 100 Punkten sind 50 %');
pruefe(prozentAuf(100, 100) === 100, '100 von 100 Punkten sind 100 %');
pruefe(prozentAuf(150, 100) === 100, 'mehr als das Ziel wird auf 100 % gedeckelt, nicht 150 %');
pruefe(prozentAuf(-10, 100) === 0, 'negative Punkte werden nicht als negativer Balken angezeigt');
pruefe(prozentAuf(5, 0) === 100, 'ein Ziel von 0 mit vorhandenen Punkten zählt als komplett (kein Teilen durch 0)');
pruefe(prozentAuf(0, 0) === 0, 'ganz ohne Punkte und ohne Ziel: 0 %, kein Absturz');

/* ------------------------------------------------------------ rennErgebnis() */

pruefe(rennErgebnis(50, 30).gewonnen === true, 'mehr Punkte als der Geist: gewonnen');
pruefe(rennErgebnis(30, 30).gewonnen === false && rennErgebnis(30, 30).gleich === true,
  'genau gleich viele Punkte: gleichauf, aber NICHT als Sieg ausgegeben');
pruefe(rennErgebnis(20, 30).gewonnen === false && !rennErgebnis(20, 30).gleich,
  'weniger Punkte als der Geist: weder gewonnen noch gleichauf');
pruefe(!/verloren|schlecht|leider/i.test(rennErgebnis(20, 30).text),
  'unter dem Geisterrennen wird nichts als Niederlage schöngeredet oder abgewertet');
pruefe(typeof rennErgebnis(0, 0).text === 'string', 'auch 0 gegen 0 stürzt nicht ab');

console.log(fehler === 0
  ? '\nRenn-Modus fährt nur vorwärts und behauptet nichts Falsches ✅'
  : `\n${fehler} Problem(e) ❌`);
process.exit(fehler === 0 ? 0 : 1);
