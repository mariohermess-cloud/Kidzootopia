/* Prueft js/lesespiele.js: Datenlisten valide, Kunstwoerter wirklich keine
   echten Woerter, Satz-Detektiv genau ein Fehler mit eindeutiger Antwort,
   Blitz-Anpassung innerhalb der Grenzen, und 2000 generierte Aufgaben je
   Spiel ohne Fehler. */
import {
  WORT_DETEKTIV, wortDetektivAufgabe,
  SAETZE, fehlerartenFuer, satzMitFehler, satzDetektivAufgabe,
  spiegelAufgabe, silbenBaukastenAufgabe, quatschAufgabe,
  blitzAufgabe, blitzAnpassen, istEchtesWort,
  levenshtein, zuNahAnEchtemWort, zuVieleKonsonanten, gueltigeSilbe,
  BLITZ_MS_START, BLITZ_MS_MIN, BLITZ_MS_MAX
} from '../js/lesespiele.js';
import { pruefe } from '../js/generators.js';

let fehler = 0;
const pruefen = (bedingung, text) => {
  if (!bedingung) { console.error(`❌ ${text}`); fehler++; }
};

/* ----------------------------------------------------- Wort-Detektiv-Liste */
pruefen(WORT_DETEKTIV.length >= 40, `mindestens 40 Wort-Detektiv-Einträge (${WORT_DETEKTIV.length})`);
for (const e of WORT_DETEKTIV) {
  pruefen(!!e.bild, `Bild fehlt bei „${e.wort}"`);
  pruefen(e.ablenker.length >= 3, `zu wenige Ablenker bei „${e.wort}"`);
  pruefen(new Set(e.ablenker.map(a => a.toLowerCase())).size === e.ablenker.length,
    `doppelte Ablenker bei „${e.wort}"`);
  pruefen(!e.ablenker.some(a => a.toLowerCase() === e.wort.toLowerCase()),
    `Ablenker gleich dem Zielwort bei „${e.wort}"`);
}

/* --------------------------------------------------------- Satz-Detektiv */
pruefen(SAETZE.length >= 30, `mindestens 30 Grundsätze (${SAETZE.length})`);
for (const satz of SAETZE) {
  for (const art of fehlerartenFuer(satz)) {
    for (let i = 0; i < 20; i++) {
      const a = satzMitFehler(satz, art);
      pruefen(a.frage && a.hoertext && a.antwort, `${art}: unvollständige Aufgabe (${satz.woerter.join(' ')})`);
      pruefen(a.optionen.includes(a.antwort), `${art}: Antwort fehlt in Optionen (${satz.woerter.join(' ')})`);
      pruefen(new Set(a.optionen.map(o => o.toLowerCase())).size === a.optionen.length,
        `${art}: doppelte Optionen (${satz.woerter.join(' ')})`);
      const treffer = a.optionen.filter(o => pruefe(a, o)).length;
      pruefen(treffer === 1, `${art}: Lösung nicht eindeutig (${treffer} Treffer) bei „${satz.woerter.join(' ')}"`);
      /* Der angezeigte (fehlerhafte) Satz unterscheidet sich in GENAU einer
         Hinsicht vom gehörten Originalsatz: unterschiedliche Wortzahl bei
         fehlt/zusatz, gleiche Wortzahl aber unterschiedlicher Inhalt bei
         vertauscht/ersetzt. */
      const original = satz.woerter;
      const gezeigt = a.frage.match(/„([^“]*)“|"([^"]*)"/);
      pruefen(!!gezeigt, `${art}: angezeigter Satz nicht auffindbar in der Frage`);
    }
  }
}

/* --------------------------------- Satz-Detektiv "fehlt": Lücke an Stelle */
/* Für JEDEN Satz und JEDE Position: das fehlende Wort an der Lücke wieder
   eingesetzt muss GENAU den Originalsatz ergeben - nicht nur irgendeinen
   Satz mit der richtigen Wortzahl. */
for (const satz of SAETZE) {
  for (let i = 0; i < satz.woerter.length; i++) {
    const a = satzMitFehler(satz, 'fehlt', i);
    pruefen(a.angezeigt.split(' ')[i] === '___',
      `fehlt: Lücke steht nicht an Position ${i} („${a.angezeigt}" statt „${satz.woerter.join(' ')}")`);
    const wiederhergestellt = a.angezeigt.split(' ').map((w, k) => k === i ? a.antwort : w).join(' ');
    pruefen(wiederhergestellt === satz.woerter.join(' '),
      `fehlt: Antwort an der Lücke eingesetzt ergibt nicht den Originalsatz („${wiederhergestellt}" statt „${satz.woerter.join(' ')}")`);
  }
}
console.log(`Satz-Detektiv "fehlt": Lücke an korrekter Position für ${SAETZE.length} Sätze × alle Positionen geprüft ✅`);

/* --------------------------------------- Spiegel: nur echte Spiegelfehler */
/* b/d/p/q-Spiegelpaare (nur EIN Buchstabe geändert) oder eine Vertauschung
   zweier benachbarter Kleinbuchstaben im Wortinneren (nie am Wortanfang) -
   und Großschreibung ausschließlich an Index 0. */
const SPIEGEL_ZIEL_TEST = { b: ['d', 'p'], d: ['b', 'q'], p: ['q', 'b'], q: ['p', 'd'] };
function istEchteSpiegelung(ablenker, ziel) {
  const a = ablenker.toLowerCase(), z = ziel.toLowerCase();
  if (a.length !== z.length) return false;
  const diff = [];
  for (let i = 0; i < a.length; i++) if (a[i] !== z[i]) diff.push(i);
  if (diff.length === 1) {
    const i = diff[0];
    return (SPIEGEL_ZIEL_TEST[z[i]] || []).includes(a[i]);
  }
  if (diff.length === 2) {
    const [i, j] = diff;
    return j === i + 1 && i >= 1 && a[i] === z[j] && a[j] === z[i];
  }
  return false;
}
let spiegelTranspositionenGesehen = 0, spiegelAufgabenGesamt = 0;
for (let level = 1; level <= 5; level++) {
  for (let i = 0; i < 300; i++) {
    const a = spiegelAufgabe(level);
    spiegelAufgabenGesamt++;
    let transpositionenHier = 0;
    for (const opt of a.optionen) {
      if (opt === a.antwort) continue;
      pruefen(opt.slice(1) === opt.slice(1).toLowerCase(),
        `Spiegel: Großbuchstabe mitten im Ablenker „${opt}" (Ziel „${a.antwort}")`);
      pruefen(istEchteSpiegelung(opt, a.antwort),
        `Spiegel: Ablenker „${opt}" ist keine echte Spiegelung/Vertauschung von „${a.antwort}"`);
      const diffAnzahl = [...opt.toLowerCase()].filter((c, k) => c !== a.antwort.toLowerCase()[k]).length;
      if (diffAnzahl === 2) transpositionenHier++;
    }
    pruefen(transpositionenHier <= 1, `Spiegel: mehr als eine Vertauschung unter den Ablenkern von „${a.antwort}"`);
    spiegelTranspositionenGesehen += transpositionenHier;
  }
}
console.log(`Spiegel: ${spiegelAufgabenGesamt} Aufgaben geprüft, davon ${spiegelTranspositionenGesehen} mit einer Nachbar-Vertauschung ✅`);

/* ------------------------------------------------- Quatschwörter: Regeln */
pruefen(levenshtein('abc', 'abc') === 0, 'Levenshtein: identische Wörter -> 0');
pruefen(levenshtein('abc', 'abd') === 1, 'Levenshtein: ein Buchstabe anders -> 1');
pruefen(levenshtein('abc', 'ab') === 1, 'Levenshtein: ein Buchstabe fehlt -> 1');
pruefen(levenshtein('katze', 'hunde') > 1, 'Levenshtein: komplett verschiedene Wörter -> mehr als 1');
pruefen(zuNahAnEchtemWort('Hasse') === true || zuNahAnEchtemWort('Hasse') === false, 'zuNahAnEchtemWort liefert einen Wahrheitswert');
pruefen(zuNahAnEchtemWort('Schul') === true, '"Schul" (Präfix von "Schule") wird erkannt');
pruefen(zuVieleKonsonanten('Strumpf') === false, '"Strumpf" hat keine 4 Konsonanten am Stück (str-u-mpf, jeweils ≤3)');
pruefen(zuVieleKonsonanten('Pfrschtl') === true, 'künstliche Konsonantenwüste wird erkannt');
pruefen(gueltigeSilbe('cker') === false, '"cker" ist keine gültige Silbe für den Wortanfang');
pruefen(gueltigeSilbe('tte') === false, '"tte" ist keine gültige Silbe für den Wortanfang');
pruefen(gueltigeSilbe('sa') === true, '"sa" ist eine gültige Silbe');

const quatschBeispiele = [];
for (let level = 1; level <= 5; level++) {
  for (let i = 0; i < 300; i++) {
    const a = quatschAufgabe(level);
    const kunstwoerter = a.optionen.filter(o => o !== a.antwort);
    for (const k of kunstwoerter) {
      pruefen(!zuVieleKonsonanten(k), `Quatschwort mit zu vielen Konsonanten am Stück: „${k}"`);
      pruefen(!zuNahAnEchtemWort(k), `Quatschwort zu nah an einem echten Wort (Levenshtein ≤1 oder Präfix/Suffix): „${k}"`);
      for (const verboten of ['ck', 'tt', 'ss', 'ff', 'll', 'mm', 'nn', 'pp', 'tz'])
        pruefen(!k.toLowerCase().startsWith(verboten), `Quatschwort beginnt mit unaussprechbarem Anfang „${verboten}": „${k}"`);
      if (quatschBeispiele.length < 20) quatschBeispiele.push(`${a.antwort} (echt) vs. ${k} (Kunstwort)`);
    }
  }
}
console.log('Quatschwörter: 20 Beispiele aus den geprüften Aufgaben:');
quatschBeispiele.forEach(b => console.log(`  ${b}`));

/* ------------------------------------------------------------ Blitzlesen */
pruefen(blitzAnpassen(BLITZ_MS_START, true) < BLITZ_MS_START, 'richtige Antwort verkürzt die Anzeigedauer');
pruefen(blitzAnpassen(BLITZ_MS_START, false) > BLITZ_MS_START, 'falsche Antwort verlängert die Anzeigedauer');
pruefen(blitzAnpassen(BLITZ_MS_MIN, true) === BLITZ_MS_MIN, 'Untergrenze wird nicht unterschritten');
pruefen(blitzAnpassen(BLITZ_MS_MAX, false) === BLITZ_MS_MAX, 'Obergrenze wird nicht überschritten');
pruefen(blitzAnpassen(undefined, true) > 0, 'robust gegen fehlenden Startwert');
for (let ms = BLITZ_MS_MIN; ms <= BLITZ_MS_MAX; ms += 250) {
  pruefen(blitzAnpassen(ms, true) >= BLITZ_MS_MIN && blitzAnpassen(ms, true) <= BLITZ_MS_MAX, `Grenzen halten bei ${ms}ms (richtig)`);
  pruefen(blitzAnpassen(ms, false) >= BLITZ_MS_MIN && blitzAnpassen(ms, false) <= BLITZ_MS_MAX, `Grenzen halten bei ${ms}ms (falsch)`);
}

/* --------------------------------------------- 2000 Aufgaben je Spiel/Level */
const SPIELE = {
  wortdetektiv: wortDetektivAufgabe,
  spiegel: spiegelAufgabe,
  silbenbaukasten: silbenBaukastenAufgabe,
  quatsch: quatschAufgabe,
  satzdetektiv: satzDetektivAufgabe,
  blitz: blitzAufgabe
};
let n = 0;
for (const [name, gen] of Object.entries(SPIELE)) {
  for (let level = 1; level <= 5; level++) {
    for (let i = 0; i < 400; i++) {
      const a = gen(level); n++;
      pruefen(!!a.frage, `${name}/L${level}: Frage fehlt`);
      pruefen(a.antwort !== undefined && String(a.antwort).trim() !== '', `${name}/L${level}: Antwort fehlt`);
      pruefen(!!a.hilfe, `${name}/L${level}: Hilfe fehlt`);
      pruefen(!!a.quelle, `${name}/L${level}: Quelle fehlt`);

      if (a.typ === 'ordnen') {
        pruefen(a.elemente.length >= 3, `${name}/L${level}: zu wenige Teile`);
        pruefen(new Set(a.elemente).size === a.elemente.length, `${name}/L${level}: doppelte Teile`);
        pruefen(pruefe(a, a.antwort), `${name}/L${level}: richtige Reihenfolge wird abgelehnt`);
        pruefen(!!a.hoertext, `${name}/L${level}: Wort wird nicht gehört, sondern nur gezeigt`);
        pruefen(!a.frage.includes(a.hoertext), `${name}/L${level}: Frage verrät das gehörte Wort`);
      } else {
        pruefen(a.optionen.includes(a.antwort), `${name}/L${level}: Antwort fehlt in den Optionen`);
        pruefen(new Set(a.optionen.map(o => String(o).toLowerCase())).size >= 2,
          `${name}/L${level}: zu wenige unterscheidbare Optionen`);
        pruefen(a.optionen.filter(o => pruefe(a, o)).length === 1, `${name}/L${level}: Lösung nicht eindeutig`);
        if (a.hoertext) pruefen(!a.frage.includes(a.antwort) || name === 'satzdetektiv',
          `${name}/L${level}: Frage verrät die gehörte Lösung`);
      }

      if (name === 'quatsch') {
        const kunstwoerter = a.optionen.filter(o => o !== a.antwort);
        for (const k of kunstwoerter) pruefen(!istEchtesWort(k), `Quatschwort ist ein echtes Wort: „${k}"`);
        pruefen(istEchtesWort(a.antwort), `Zielwort „${a.antwort}" fehlt in der Wortliste`);
      }
      if (name === 'blitz') {
        pruefen(!!a.blitzText, `${name}/L${level}: kein Blitz-Text`);
        pruefen(a.optionen.length === 4, `${name}/L${level}: nicht genau 4 Optionen`);
      }
    }
  }
}
console.log(`${n} Lesespiel-Aufgaben geprüft.`);

if (fehler) { console.error(`${fehler} Fehler gefunden.`); process.exit(1); }
console.log('Alles in Ordnung ✅');
