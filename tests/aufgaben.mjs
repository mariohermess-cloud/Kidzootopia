/* Prueft jeden Generator auf jedem Level: Aufgabe vollstaendig, Loesung eindeutig,
   Antwort in den Auswahlmoeglichkeiten enthalten. */
import { GEN, baueAufgabe, pruefe } from '../js/generators.js';

let n = 0, fehler = [];
for (const zielId of Object.keys(GEN)) {
  for (const weg of Object.keys(GEN[zielId])) {
    for (let level = 1; level <= 5; level++) {
      for (let i = 0; i < 60; i++) {
        const a = baueAufgabe(zielId, weg, level); n++;
        const ort = `${zielId}/${weg}/L${level}`;
        if (!a.frage || String(a.antwort).trim() === '') fehler.push(`${ort}: leere Aufgabe`);
        if (a.typ === 'choice') {
          if (!a.optionen.includes(a.antwort)) fehler.push(`${ort}: Antwort fehlt in den Optionen`);
          if (new Set(a.optionen).size < 2) fehler.push(`${ort}: zu wenige Optionen`);
          if (a.optionen.filter(o => pruefe(a, o)).length !== 1) fehler.push(`${ort}: Lösung nicht eindeutig`);
        }
        if (!pruefe(a, a.antwort)) fehler.push(`${ort}: eigene Lösung wird als falsch gewertet`);
      }
    }
  }
}
console.log(`${n} Aufgaben geprüft.`);
if (fehler.length) { console.error([...new Set(fehler)].join('\n')); process.exit(1); }
console.log('Alles in Ordnung ✅');
