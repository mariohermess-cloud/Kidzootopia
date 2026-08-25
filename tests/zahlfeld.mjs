/* Prueft die Zahleneingabe.

   Der Anlass: Auf dem iPad liess sich weder ein Minus noch ein Komma tippen -
   Aufgaben mit der Antwort -1 oder 12,5 waren dort nicht loesbar. Dieser Test
   prueft nicht nur, DASS beides geht, sondern auch, dass kein Unsinn entsteht:
   zwei Kommas, drei Minus, fuehrende Nullen. */

import { taste, alsZahl, istFertig, brauchtZahlen, TASTEN } from '../js/zahlfeld.js';
import { baueAufgabe, pruefe as pruefeAntwort } from '../js/generators.js';
import { ZIELE } from '../js/data.js';

let fehler = 0;
const pruefe = (bedingung, text) => {
  console.log(`${bedingung ? '✅' : '❌'} ${text}`);
  if (!bedingung) fehler++;
};
/* Tippt eine ganze Folge und gibt das Ergebnis zurueck. */
const tippe = folge => [...folge].reduce((s, t) => taste(s, t), '');

/* ------------------------------------------------------------- Grundlagen */

pruefe(TASTEN.includes('-') && TASTEN.includes(',') && TASTEN.includes('⌫'),
  'das Tastenfeld hat Minus, Komma und Löschen');
pruefe(tippe('123') === '123', 'Ziffern hintereinander ergeben die Zahl');
pruefe(taste('12', '⌫') === '1', 'Löschen nimmt die letzte Ziffer weg');
pruefe(taste('', '⌫') === '', 'Löschen auf leerem Feld tut nichts');

/* ------------------------------------------------------------------ Minus */

pruefe(tippe('-1') === '-1', 'Minus vor der Zahl ergibt eine negative Zahl');
pruefe(tippe('1-') === '-1', 'Minus nach der Zahl macht sie auch negativ');
pruefe(tippe('1--') === '1', 'zweimal Minus macht die Zahl wieder positiv');
pruefe(tippe('1---') === '-1', 'dreimal Minus ist wieder negativ');
pruefe(!tippe('12-3').includes('--'), 'nie zwei Minuszeichen im Text');
pruefe(tippe('12-3') === '-123', 'Minus wandert immer nach vorn, nie in die Mitte');

/* ------------------------------------------------------------------ Komma */

pruefe(tippe('12,5') === '12,5', 'Komma zwischen den Ziffern');
pruefe(tippe('12,5,3') === '12,53', 'ein zweites Komma wird nicht angenommen');
pruefe(tippe(',5') === '0,5', 'Komma am Anfang ergibt 0,5 statt ",5"');
pruefe(tippe('-,5') === '-0,5', 'dasselbe bei negativen Zahlen');

/* ------------------------------------------------------------ Führende Null */

pruefe(tippe('05') === '5', 'aus 0 und 5 wird 5, nicht 05');
pruefe(tippe('-05') === '-5', 'dasselbe mit Minus');
pruefe(tippe('0,5') === '0,5', 'die Null vor dem Komma bleibt stehen');
pruefe(tippe('100') === '100', 'Nullen mitten in der Zahl bleiben');

/* ------------------------------------------------------------------ Länge */

pruefe(tippe('1234567890123456').replace('-','').length <= 12,
  'irgendwann ist Schluss – kein endloses Getippe');

/* ------------------------------------------------------- Umrechnung & Ende */

pruefe(alsZahl('12,5') === 12.5, 'Komma wird zu Punkt: 12,5 → 12.5');
pruefe(alsZahl('-3') === -3, 'negative Zahl wird erkannt');
pruefe(alsZahl('') === null && alsZahl('-') === null && alsZahl(',') === null,
  'unfertige Eingaben ergeben keine Zahl');
pruefe(istFertig('12,5') && !istFertig('12,') && !istFertig('-'),
  '"12," gilt noch nicht als fertige Antwort');

/* ------------------------------------------- Wann braucht es das Zahlenfeld? */

pruefe(brauchtZahlen('42') && brauchtZahlen('-1') && brauchtZahlen('12.5'),
  'Zahlantworten verlangen das Zahlenfeld');
pruefe(!brauchtZahlen('Metapher') && !brauchtZahlen('') && !brauchtZahlen('3 Äpfel'),
  'Wortantworten verlangen es nicht');

/* --------------------------------------------------------- Der ganze Weg

   Der eigentliche Beweis: Die Antworten, die es in der App wirklich gibt,
   muessen sich mit diesem Tastenfeld eintippen lassen UND danach als richtig
   erkannt werden. Genau daran scheiterte es vorher. */

const zuTasten = s => String(s).replace('.', ',');
let geprueft = 0, unloesbar = [];
for (const z of ZIELE) {
  for (const w of z.wege) {
    for (let i = 0; i < 60; i++) {
      const a = baueAufgabe(z.id, w, 1 + i % 5);
      if (a.typ !== 'text') continue;
      const soll = String(a.antwort).trim();
      if (!brauchtZahlen(soll)) continue;
      geprueft++;
      const getippt = tippe(zuTasten(soll));
      if (!pruefeAntwort(a, getippt)) unloesbar.push(`${z.id}: ${soll} → getippt "${getippt}"`);
    }
  }
}
console.log('');
pruefe(geprueft > 500, `genug Aufgaben durchgespielt (${geprueft})`);
pruefe(unloesbar.length === 0,
  `alle ${geprueft} Zahlantworten lassen sich eintippen und werden anerkannt` +
  (unloesbar.length ? ': ' + unloesbar.slice(0, 5).join('; ') : ''));

console.log(fehler === 0
  ? '\nZahleneingabe arbeitet wie beschrieben ✅'
  : `\n${fehler} Problem(e) ❌`);
process.exit(fehler === 0 ? 0 : 1);
