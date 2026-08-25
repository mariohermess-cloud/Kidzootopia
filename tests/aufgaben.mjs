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
        if (a.typ === 'nachdenken') {
          if (!a.optionen?.length) fehler.push(`${ort}: Denk-Impuls ohne Auswahl`);
          if (!a.keineWertung) fehler.push(`${ort}: Denk-Impuls würde bewertet`);
          const fehlend = a.optionen.filter(o => !a.rueckmeldungen?.[o]);
          if (fehlend.length) fehler.push(`${ort}: Rückmeldung fehlt für "${fehlend[0]}"`);
          if (!a.quelle) fehler.push(`${ort}: Denk-Impuls ohne Herkunftsangabe`);
        }
        if (a.typ === 'ordnen') {
          const teile = a.antwort.split(' → ');
          if (a.elemente.length < 3) fehler.push(`${ort}: zu wenige Teile`);
          if (new Set(a.elemente).size !== a.elemente.length) fehler.push(`${ort}: doppelte Teile`);
          if ([...teile].sort().join('|') !== [...a.elemente].sort().join('|'))
            fehler.push(`${ort}: Lösung enthält andere Teile als angeboten`);
          if (!pruefe(a, teile.join(' → '))) fehler.push(`${ort}: richtige Reihenfolge wird abgelehnt`);
          const falsch = [teile[1], teile[0], ...teile.slice(2)].join(' → ');
          if (falsch !== a.antwort && pruefe(a, falsch))
            fehler.push(`${ort}: falsche Reihenfolge wird als richtig gewertet`);
        }
        if (a.typ === 'choice' && a.typ !== 'nachdenken') {
          if (!a.optionen.includes(a.antwort)) fehler.push(`${ort}: Antwort fehlt in den Optionen`);
          if (new Set(a.optionen).size < 2) fehler.push(`${ort}: zu wenige Optionen`);
          if (a.optionen.filter(o => pruefe(a, o)).length !== 1) fehler.push(`${ort}: Lösung nicht eindeutig`);
        }
        if (a.typ !== 'nachdenken' && !pruefe(a, a.antwort))
          fehler.push(`${ort}: eigene Lösung wird als falsch gewertet`);
      }
    }
  }
}
console.log(`${n} Aufgaben geprüft.`);
if (fehler.length) { console.error([...new Set(fehler)].join('\n')); process.exit(1); }
console.log('Alles in Ordnung ✅');
