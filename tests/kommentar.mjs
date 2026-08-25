/* Prueft die gesprochene Rueckmeldung.

   Das Entscheidende ist nicht, dass ueberhaupt ein Satz herauskommt, sondern
   dass er STIMMT. Ein Kommentar, der bei 63 statt 36 "Ziffern vertauscht"
   sagt, ist hilfreich; derselbe Satz bei 63 statt 40 waere schlicht falsch -
   und ein Kind glaubt ihn. Deshalb wird hier jede Aussage gegen einen Fall
   geprueft, in dem sie NICHT gelten darf. */

import { kommentar, vorlesbar } from '../js/kommentar.js';

let fehler = 0;
const pruefe = (bedingung, text) => {
  console.log(`${bedingung ? '✅' : '❌'} ${text}`);
  if (!bedingung) fehler++;
};

/* ------------------------------------------------- Konkrete Fehleranalysen */

const zifferndreher = kommentar({ richtig: false, antwort: '36', eingabe: '63' });
pruefe(/vertauscht/i.test(zifferndreher), `Ziffernsturz erkannt: "${zifferndreher}"`);
pruefe(!/vertauscht/i.test(kommentar({ richtig: false, antwort: '36', eingabe: '40' })),
  'bei 40 statt 36 wird KEIN Ziffernsturz behauptet');
pruefe(!/vertauscht/i.test(kommentar({ richtig: false, antwort: '5', eingabe: '8' })),
  'einstellige Zahlen ergeben keinen Ziffernsturz');

const knapp = kommentar({ richtig: false, antwort: '48', eingabe: '47' });
pruefe(/nah|fast|1|eins/i.test(knapp), `knapp daneben wird benannt: "${knapp}"`);
pruefe(!/nah dran|fast/i.test(kommentar({ richtig: false, antwort: '48', eingabe: '12' })),
  'weit daneben wird NICHT als "fast" schöngeredet');
pruefe(!/nah dran|fast/i.test(kommentar({ richtig: false, antwort: '3', eingabe: '2' })),
  'bei kleinen Zahlen ist 1 daneben nicht "fast" – da ist es ein anderer Fehler');

const null_zuviel = kommentar({ richtig: false, antwort: '24', eingabe: '240' });
pruefe(/zehnmal zu groß|Null zu viel/i.test(null_zuviel), `Zehnerfehler erkannt: "${null_zuviel}"`);
const null_fehlt = kommentar({ richtig: false, antwort: '240', eingabe: '24' });
pruefe(/zehnmal zu klein|fehlt eine Null/i.test(null_fehlt), `fehlende Null erkannt: "${null_fehlt}"`);

const vorzeichen = kommentar({ richtig: false, antwort: '-7', eingabe: '7' });
pruefe(/Vorzeichen/i.test(vorzeichen), `Vorzeichenfehler erkannt: "${vorzeichen}"`);

/* Wortantworten dürfen NIE eine Zahlenanalyse bekommen. */
const wort = kommentar({ richtig: false, antwort: 'Metapher', eingabe: 'Metonymie' });
pruefe(!/Ziffern|Null|Vorzeichen|daneben/i.test(wort),
  `bei Wortantworten keine Zahlenaussagen: "${wort}"`);

/* ------------------------------------------------------- Richtige Antworten */

const stufe = kommentar({ richtig: true, levelHoch: true, zielTitel: 'Das kleine Einmaleins' });
pruefe(/Stufe|Aufgestiegen|schwerer|an/i.test(stufe), `Levelaufstieg wird gemeldet: "${stufe}"`);

const mitSkizze = kommentar({ richtig: true, skizze: true });
pruefe(/gemalt|gezeichnet|Skizze|Blatt/i.test(mitSkizze),
  `Skizze wird gewürdigt: "${mitSkizze}"`);

const langeGerungen = kommentar({ richtig: true, ms: 40000 });
pruefe(/lange|Zeit|gedauert|drangeblieben/i.test(langeGerungen),
  `Ausdauer wird benannt: "${langeGerungen}"`);

const mitTipps = kommentar({ richtig: true, tipps: 3 });
pruefe(/Hilfe|Tipp/i.test(mitTipps), `Tipps werden nicht verschwiegen: "${mitTipps}"`);

/* Alle Formulierungen prüfen, nicht eine zufällig gezogene: Sonst ist der
   Test von der Zufallsauswahl abhängig und schlägt in etwa jedem vierten Lauf
   grundlos fehl - genau das ist hier passiert. */
const serienSaetze = new Set();
for (let i = 0; i < 60; i++) serienSaetze.add(kommentar({ richtig: true, serie: 7 }));
pruefe(serienSaetze.size >= 2, `mehrere Formulierungen für die Serie (${serienSaetze.size})`);
pruefe([...serienSaetze].every(s => /Folge|Läuft|Stück|hintereinander|7\./i.test(s)),
  `JEDE Serien-Formulierung nimmt Bezug auf die Serie: ${[...serienSaetze].join(' | ')}`);

/* ------------------------------------------------ Kein Lob für die Person */

/* Hattie & Timperley: Lob für die Person wirkt schlechter als Rückmeldung
   zur Sache. Also darf nirgends "du bist klug/schlau/ein Genie" stehen. */
const alle = [];
for (let i = 0; i < 400; i++) {
  alle.push(kommentar({ richtig: i % 2 === 0, antwort: '12', eingabe: String(i % 30),
    ms: (i * 137) % 50000, tipps: i % 4, serie: i % 9, skizze: i % 3 === 0,
    levelHoch: i % 17 === 0, knacknuss: i % 5 === 0, zielTitel: 'Brüche', wegName: 'Knobel-Weg' }));
}
const person = alle.filter(s => /du bist|so klug|schlau|Genie|Talent|begabt/i.test(s));
pruefe(person.length === 0,
  `nie Lob für die Person, immer für die Sache${person.length ? ': ' + person[0] : ''}`);

pruefe(alle.every(s => s && s.length > 0), 'es kommt immer ein Satz heraus');
pruefe(alle.every(s => s.length <= 140), 'kein Kommentar ist länger als 140 Zeichen');

/* Abwechslung: Immer derselbe Satz wäre schlimmer als keiner. */
const richtigeSaetze = new Set();
for (let i = 0; i < 200; i++) richtigeSaetze.add(kommentar({ richtig: true }));
pruefe(richtigeSaetze.size >= 3,
  `auch die einfachste Lage hat mehrere Formulierungen (${richtigeSaetze.size})`);

/* Nie zweimal hintereinander derselbe Satz in derselben Lage. */
let doppelt = 0, vorher = null;
for (let i = 0; i < 100; i++) {
  const s = kommentar({ richtig: true });
  if (s === vorher) doppelt++;
  vorher = s;
}
pruefe(doppelt === 0, `nie zweimal hintereinander derselbe Satz (${doppelt} Wiederholungen)`);

/* ------------------------------------------------------------- Vorlesbarkeit */

pruefe(alle.every(s => vorlesbar(s)), 'jeder Kommentar ist kurz genug zum Vorlesen');
pruefe(!vorlesbar('x'.repeat(200)), 'sehr lange Sätze gelten als nicht vorlesbar');
pruefe(!vorlesbar(''), 'ein leerer Satz wird nicht vorgelesen');

/* ------------------------------------------------------------- Randfälle */

pruefe(typeof kommentar({}) === 'string', 'ohne jede Angabe stürzt nichts ab');
pruefe(typeof kommentar({ richtig: false, antwort: null, eingabe: undefined }) === 'string',
  'fehlende Antwort stürzt nicht ab');

console.log(fehler === 0
  ? '\nRückmeldungen sind richtig und abwechslungsreich ✅'
  : `\n${fehler} Problem(e) ❌`);
process.exit(fehler === 0 ? 0 : 1);
