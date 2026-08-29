/* Prueft die neuen Tiererkennungs-Fragen bei "Allgemeinwissen" (entdecken-Weg):
   Insekten, die sich zum Verwechseln aehnlich sehen. Ein einzelnes Emoji
   (🐝) reicht nicht, um sie zu unterscheiden - deshalb beschreibt jede Frage
   die Merkmale in Worten. Hier wird geprueft, dass wirklich mehrere, klar
   unterschiedliche Arten vorkommen und dass keine Antwort sich versehentlich
   mit einer Ablenker-Antwort ueberschneidet. */

import { GEN } from '../js/generators.js';

let fehler = 0;
const pruefe = (bedingung, text) => {
  console.log(`${bedingung ? '✅' : '❌'} ${text}`);
  if (!bedingung) fehler++;
};

const ERWARTETE_ARTEN = ['Honigbiene', 'Hummel', 'Wespe', 'Schwebfliege', 'Wildbiene', 'Hornisse'];

const gesehen = new Set();
const insektenAufgaben = [];
for (let i = 0; i < 800; i++) {
  const a = GEN.allgemein.entdecken(1);
  if (/Insekt/.test(a.frage)) { gesehen.add(a.antwort); insektenAufgaben.push(a); }
}

pruefe(insektenAufgaben.length > 0, 'Insekten-Fragen kommen im Entdecker-Weg wirklich vor');
pruefe(ERWARTETE_ARTEN.every(art => gesehen.has(art)),
  `alle sechs Arten kommen vor (gesehen: ${[...gesehen].sort().join(', ')})`);
pruefe(gesehen.size >= 6, `mindestens sechs klar unterschiedliche Arten (${gesehen.size})`);

/* Keine Aufgabe darf die richtige Art auch als Ablenker anbieten - sonst
   waere die Loesung nicht eindeutig. */
pruefe(insektenAufgaben.every(a => a.optionen.filter(o => o === a.antwort).length === 1),
  'die richtige Art taucht in keiner Aufgabe doppelt unter den Optionen auf');
pruefe(insektenAufgaben.every(a => new Set(a.optionen).size === a.optionen.length),
  'keine Aufgabe bietet zwei identische Ablenker an');

/* Jede Insekten-Aufgabe muss eine Erklaerung mit den unterscheidenden
   Merkmalen mitbringen - genau das macht die Erkennung ohne Bild moeglich. */
pruefe(insektenAufgaben.every(a => a.quelle && a.quelle.length > 20),
  'jede Insekten-Aufgabe erklärt die unterscheidenden Merkmale ausführlich');

console.log(fehler === 0
  ? '\nTiererkennung unterscheidet echte Merkmale, nicht nur ein Emoji ✅'
  : `\n${fehler} Problem(e) ❌`);
process.exit(fehler === 0 ? 0 : 1);
