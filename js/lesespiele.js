/* Lesespiele – kurze, farbige Übungen gegen stockendes Lesen, Auslassen,
   Vertauschen und Ersetzen von Wörtern durch optisch oder akustisch ähnliche
   Wörter. Zielgruppe: ein Grundschulkind mit Legasthenie, das gut HÖRT und
   lautgetreu schreiben kann, aber beim Lesen selbst stockt.

   Reine Daten und Rechenlogik – DOM-frei, ohne Audio, ohne Speicher. Die
   Anzeige (Bild groß, Silbenfärbung, Blitz-Anzeige) macht js/ui.js, das
   Vorlesen js/sprache.js, die Anpassung des Blitz-Tempos js/store.js.

   Kein Zeitdruck, keine Punktabzüge: Blitzlesen hat ein "Nochmal zeigen"
   ohne Kosten, alle Aufgaben laufen über die normale Punktelogik der App
   (0 oder volle Punkte, nie ein Abzug). */

import { silben, uebwoerterBis, UEBWOERTER } from './silben.js';
import { TEXTE as LESETEXTE } from './lesen.js';

const r = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = a => a[r(0, a.length - 1)];
const shuffle = a => a.map(v => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map(v => v[1]);
const uniq = a => [...new Set(a)];
/* Wie uniq(), aber Gross-/Kleinschreibung zaehlt nicht als Unterschied -
   wichtig fuer Auswahlmoeglichkeiten: "Der" und "der" duerfen nicht beide
   als eigene Option auftauchen. */
const uniqCI = a => { const gesehen = new Set(), raus = []; for (const w of a) {
  const k = String(w).toLowerCase(); if (gesehen.has(k)) continue; gesehen.add(k); raus.push(w); } return raus; };
const gross = w => w.charAt(0).toUpperCase() + w.slice(1);

/* --------------------------------------------------------------------------
   Wortschatz: alles, was im Repo als "echtes Wort" gelten soll. Grundlage für
   die Quatschwörter-Prüfung – ein Kunstwort darf NIE mit einem dieser Wörter
   zusammenfallen. Quelle: die Übungswörter aus js/silben.js (alle Etappen),
   die Wörter aus den Lesetexten (js/lesen.js) sowie die eigenen kuratierten
   Listen unten (siehe ganz unten: WORTSCHATZ_ERGAENZUNG wird dort ergänzt).
   -------------------------------------------------------------------------- */
const ausText = text => String(text).match(/\p{L}+/gu) || [];

const WORTSCHATZ = new Set([
  ...Object.values(UEBWOERTER).flat(),
  ...LESETEXTE.flatMap(t => ausText(t.text)),
  ...LESETEXTE.flatMap(t => ausText(t.titel || ''))
].map(w => w.toLowerCase()));

const registriere = (...listen) => {
  for (const l of listen) for (const w of l) WORTSCHATZ.add(String(w).toLowerCase());
};
export const istEchtesWort = w => WORTSCHATZ.has(String(w).trim().toLowerCase());

/* Nach Länge gestaffelt: leichtere (kürzere) Wörter/Sätze zuerst, ab Level 5
   steht der ganze Vorrat offen. Dasselbe Prinzip wie uebwoerterBis(), nur
   allgemein für beliebige Listen mit einer Längen-Funktion. */
function nachLevel(liste, laenge, lvl) {
  const sortiert = [...liste].sort((a, b) => laenge(a) - laenge(b));
  const stufe = Math.max(1, Math.min(5, lvl || 1));
  const bis = Math.max(4, Math.ceil(sortiert.length * stufe / 5));
  return sortiert.slice(0, bis);
}

/* --------------------------------------------------------------------------
   Fälligkeits-Bias (Lernmotor, siehe js/store.js: lesespieleKontext und
   js/lernmotor.js: faelligeSchluessel). Statt jede Aufgabe komplett zufällig
   zu ziehen, kommt - wenn fällige Elemente vorliegen - mit ~40 % Chance eines
   davon dran; sonst bleibt die Auswahl wie zuvor rein zufällig. So bleiben
   die Übungen weiterhin abwechslungsreich, aber das, was gerade wieder fällig
   ist, kommt spürbar häufiger vor als durch reinen Zufall. */
const FAELLIG_ANTEIL = 0.4;
function bevorzugtFaellig(menge, schluessel, faellige) {
  if (faellige && faellige.size && Math.random() < FAELLIG_ANTEIL) {
    const treffer = menge.filter(x => faellige.has(schluessel(x)));
    if (treffer.length) return pick(treffer);
  }
  return pick(menge);
}

/* ============================================================================
   1. WORT-DETEKTIV: Bild <-> Wort
   Großes Emoji, vier Wörter zur Auswahl - drei davon optisch/akustisch
   ähnlich, aber ein anderes Ding. Keines der Ablenker-Wörter benennt das
   gezeigte Bild mit.
   ============================================================================ */
/* Jedes Bild muss das Zielwort EINDEUTIG zeigen (kein Sammelbegriff, keine
   Verwechslung mit einem Nachbar-Emoji) - Bilder, bei denen das nicht klar
   genug war (z. B. 💰 für "Kasse", 🚧 für "Zaun", 🌲 für "Wald" neben 🌳
   "Baum", 👨/👴 für "Onkel"/"Enkel", 🧣 für "Tuch", 💅 für "Nagel") wurden
   ENTFERNT statt geraten zu lassen - ein Kind mit Legasthenie darf hier
   nichts Falsches lernen. Alle Ablenker sind echte, korrekt geschriebene,
   kindgerechte Nomen (keine Adjektive, keine Erwachsenen-/Fachbegriffe). */
export const WORT_DETEKTIV = [
  { bild: '🏠', wort: 'Haus',   ablenker: ['Maus', 'Laus', 'Hose'] },
  { bild: '🐭', wort: 'Maus',   ablenker: ['Haus', 'Laus', 'Moos'] },
  { bild: '🐱', wort: 'Katze',  ablenker: ['Tasse', 'Kasse', 'Ratte'] },
  { bild: '☕', wort: 'Tasse',  ablenker: ['Tasche', 'Kasse', 'Nase'] },
  { bild: '🌹', wort: 'Rose',   ablenker: ['Hose', 'Dose', 'Nase'] },
  { bild: '👖', wort: 'Hose',   ablenker: ['Rose', 'Dose', 'Nase'] },
  { bild: '🥫', wort: 'Dose',   ablenker: ['Rose', 'Hose', 'Nase'] },
  { bild: '🐻', wort: 'Bär',    ablenker: ['Beere', 'Meer', 'Ohr'] },
  { bild: '🫐', wort: 'Beere',  ablenker: ['Bär', 'Meer', 'Beet'] },
  { bild: '☀️', wort: 'Sonne',  ablenker: ['Wonne', 'Tonne', 'Bohne'] },
  { bild: '🗑️', wort: 'Tonne',  ablenker: ['Sonne', 'Wonne', 'Bohne'] },
  { bild: '🫘', wort: 'Bohne',  ablenker: ['Sonne', 'Tonne', 'Wonne'] },
  { bild: '🦆', wort: 'Ente',   ablenker: ['Tante', 'Wende', 'Ende'] },
  { bild: '🦷', wort: 'Zahn',   ablenker: ['Bahn', 'Hahn', 'Kahn'] },
  { bild: '🚋', wort: 'Bahn',   ablenker: ['Zahn', 'Hahn', 'Kahn'] },
  { bild: '🐓', wort: 'Hahn',   ablenker: ['Bahn', 'Zahn', 'Kahn'] },
  { bild: '👃', wort: 'Nase',   ablenker: ['Vase', 'Hase', 'Tasse'] },
  { bild: '🐰', wort: 'Hase',   ablenker: ['Nase', 'Vase', 'Tasse'] },
  { bild: '🏺', wort: 'Vase',   ablenker: ['Nase', 'Hase', 'Tasse'] },
  { bild: '🍎', wort: 'Apfel',  ablenker: ['Ampel', 'Angel', 'Onkel'] },
  { bild: '🚦', wort: 'Ampel',  ablenker: ['Apfel', 'Angel', 'Onkel'] },
  { bild: '🎣', wort: 'Angel',  ablenker: ['Apfel', 'Ampel', 'Engel'] },
  { bild: '👼', wort: 'Engel',  ablenker: ['Angel', 'Enkel', 'Onkel'] },
  { bild: '⛵', wort: 'Segel',  ablenker: ['Nagel', 'Kegel', 'Regen'] },
  { bild: '🎳', wort: 'Kegel',  ablenker: ['Segel', 'Nagel', 'Regen'] },
  { bild: '🦔', wort: 'Igel',   ablenker: ['Segel', 'Kegel', 'Nagel'] },
  { bild: '⚽', wort: 'Ball',   ablenker: ['Wald', 'Fall', 'Halle'] },
  { bild: '🐟', wort: 'Fisch',  ablenker: ['Tisch', 'Busch', 'Fuchs'] },
  { bild: '🦊', wort: 'Fuchs',  ablenker: ['Fisch', 'Luchs', 'Strauch'] },
  { bild: '🌳', wort: 'Baum',   ablenker: ['Zaun', 'Raum', 'Traum'] },
  { bild: '🍞', wort: 'Brot',   ablenker: ['Boot', 'Not', 'Draht'] },
  { bild: '🚤', wort: 'Boot',   ablenker: ['Brot', 'Not', 'Draht'] },
  { bild: '📖', wort: 'Buch',   ablenker: ['Tuch', 'Strauch', 'Bach'] },
  { bild: '☁️', wort: 'Wolke',  ablenker: ['Wolle', 'Woge', 'Locke'] },
  { bild: '🧶', wort: 'Wolle',  ablenker: ['Wolke', 'Woge', 'Locke'] },
  { bild: '🌙', wort: 'Mond',   ablenker: ['Mund', 'Hund', 'Rand'] },
  { bild: '👑', wort: 'Krone',  ablenker: ['Bohne', 'Tonne', 'Wonne'] },
  { bild: '🐝', wort: 'Biene',  ablenker: ['Wiese', 'Bühne', 'Kiste'] },
  { bild: '🧀', wort: 'Käse',   ablenker: ['Hase', 'Nase', 'Vase'] },
  { bild: '🦁', wort: 'Löwe',   ablenker: ['Möwe', 'Höhle', 'Löffel'] },
  { bild: '🐸', wort: 'Frosch', ablenker: ['Busch', 'Tisch', 'Fisch'] },
  { bild: '🍐', wort: 'Birne',  ablenker: ['Birke', 'Kirsche', 'Kiste'] },
  { bild: '🧤', wort: 'Handschuh', ablenker: ['Handtuch', 'Rucksack', 'Schuh'] },
  { bild: '🐷', wort: 'Schwein', ablenker: ['Bein', 'Wein', 'Stein'] }
];
registriere(WORT_DETEKTIV.map(e => e.wort), WORT_DETEKTIV.flatMap(e => e.ablenker));

export function wortDetektivAufgabe(lvl, kontext = null) {
  const menge = nachLevel(WORT_DETEKTIV, e => e.wort.length, lvl);
  const pool = menge.length ? menge : WORT_DETEKTIV;
  const e = bevorzugtFaellig(pool, x => 'wort:' + x.wort, kontext?.faellige);
  return {
    typ: 'choice', bild: e.bild,
    frage: `🔍 Welches Wort passt zum Bild?`,
    optionen: shuffle([e.wort, ...e.ablenker]),
    antwort: e.wort, element: 'wort:' + e.wort,
    hilfe: 'Schau erst genau aufs Bild, dann sprich jedes Wort einmal laut aus.',
    quelle: 'Wort-Detektiv übt, ein Wortbild wirklich zu Ende zu lesen, statt am Anfang zu raten.'
  };
}

/* ============================================================================
   2. b/d/p/q & Spiegelbuchstaben
   Das Wort wird gehört (a.hoertext), gewählt wird unter Spiegel-Varianten -
   Buchstaben vertauscht oder gespiegelt. Ablenker dürfen Kunstwörter sein,
   müssen aber klar erkennbar "falsch geschrieben" aussehen.
   ============================================================================ */
export const SPIEGEL_WOERTER = [
  'Dach', 'Ball', 'Bett', 'Baum', 'Buch', 'Brot', 'Boot', 'Bild', 'Puppe', 'Papa',
  'Papier', 'Pilz', 'Post', 'Pony', 'Dose', 'Dorf', 'Decke', 'Dame', 'Bad', 'Brief',
  'Bruder', 'Blume', 'Birne', 'Banane', 'Drache', 'Delfin', 'Lampe', 'Suppe', 'Treppe',
  'Apfel', 'Adler', 'Kinder', 'Hund', 'Wald', 'Feld', 'Kleid', 'Pferd', 'Qualle', 'Quark'
];
registriere(SPIEGEL_WOERTER);

/* Jeder Buchstabe darf zu jedem seiner Spiegelbilder werden: b<->d und p<->q
   sind die klassische Verwechslung (auf dem Kopf gespiegelt), b<->p und d<->q
   die zweite (seitlich gespiegelt). Eine "Spiegelung" aendert dabei IMMER nur
   EINEN einzigen Buchstaben - "Papa" darf zu "Qapa" oder "Paqa" werden, aber
   nie zu "Qaqa" (das waeren zwei Aenderungen auf einmal). */
const SPIEGEL_ZIEL = { b: ['d', 'p'], d: ['b', 'q'], p: ['q', 'b'], q: ['p', 'd'] };

/* Erzeugt Kandidaten ausschliesslich in Kleinschreibung - die Grossschreibung
   des ersten Buchstabens kommt erst ganz am Schluss ueber gross() dazu. So
   kann NIE ein Grossbuchstabe mitten im Wort entstehen (das waere kein
   Spiegelfehler mehr, sondern reiner Buchstabensalat). */
function substitutionsKandidaten(kleinwort) {
  const raus = [];
  for (let i = 0; i < kleinwort.length; i++) {
    const ziel = SPIEGEL_ZIEL[kleinwort[i]];
    if (!ziel) continue;
    for (const ersatz of ziel) raus.push(kleinwort.slice(0, i) + ersatz + kleinwort.slice(i + 1));
  }
  return uniq(raus);
}

/* Vertauschung zweier NACHBAR-Kleinbuchstaben, aber nur IM WORTINNEREN (der
   erste Buchstabe wird nie einbezogen) - ein typischer Verdreher beim Lesen,
   aber kein Ersatz für die b/d/p/q-Spiegelung selbst. */
function transpositionsKandidaten(kleinwort) {
  const raus = [];
  for (let i = 1; i < kleinwort.length - 1; i++) {
    if (kleinwort[i] === kleinwort[i + 1]) continue;
    raus.push(kleinwort.slice(0, i) + kleinwort[i + 1] + kleinwort[i] + kleinwort.slice(i + 2));
  }
  return uniq(raus);
}

/* Baut bis zu 3 Ablenker: zuerst echte b/d/p/q-Spiegelungen (Vorrang), und
   HÖCHSTENS EINE Nachbar-Vertauschung als Ergänzung, falls zu wenige
   Spiegelungen möglich sind (sehr kurze Wörter mit nur einem b/d/p/q). */
function spiegelKandidaten(wort) {
  const klein = wort.toLowerCase();
  const subst = shuffle(substitutionsKandidaten(klein)).filter(k => k !== klein);
  const transp = shuffle(transpositionsKandidaten(klein)).filter(k => k !== klein);
  let ausgewaehlt = uniq(subst).slice(0, 3);
  if (ausgewaehlt.length < 3 && transp.length) ausgewaehlt.push(transp[0]);
  /* Aeusserst seltener Notfall (sehr kurzes Wort, kaum Kandidaten): noch ein
     zweiter, weiterer Spiegel-Kandidat, falls vorhanden - niemals eine
     zweite Vertauschung (die "höchstens eine von drei"-Regel bleibt so). */
  if (ausgewaehlt.length < 3) for (const s of subst) {
    if (ausgewaehlt.length >= 3) break;
    if (!ausgewaehlt.includes(s)) ausgewaehlt.push(s);
  }
  return uniq(ausgewaehlt).filter(k => k !== klein).map(gross);
}

export function spiegelAufgabe(lvl, kontext = null) {
  const menge = nachLevel(SPIEGEL_WOERTER, w => w.length, lvl);
  const pool = menge.length ? menge : SPIEGEL_WOERTER;
  const wort = bevorzugtFaellig(pool, w => 'spiegel:' + w, kontext?.faellige);
  const ablenker = uniqCI(spiegelKandidaten(wort)).filter(a => a.toLowerCase() !== wort.toLowerCase()).slice(0, 3);
  return {
    typ: 'choice', hoertext: wort, titel: '🔊 Hör genau hin',
    frage: '👂 Welches Wort hast du gehört? Achte auf b, d, p und q.',
    optionen: shuffle([wort, ...ablenker]),
    antwort: wort, element: 'spiegel:' + wort,
    hilfe: 'b, d, p und q sehen gespiegelt fast gleich aus - sprich das Wort erst laut nach, dann schau genau hin.',
    quelle: 'b/d/p/q-Verwechslungen sind bei Legasthenie besonders häufig; genaues Hinsehen nach dem Hören trainiert das gezielt.'
  };
}

/* ============================================================================
   3. Silben-Baukasten: hören, dann bauen (typ 'ordnen')
   Das Wort wird nur GEHÖRT, nicht gezeigt. Wörter mit zwei gleichen Silben
   scheiden aus - sonst gäbe es zwei richtige Reihenfolgen.
   ============================================================================ */
const eindeutig = w => {
  const s = silben(w).map(x => x.toLowerCase());
  return new Set(s).size === s.length;
};

export function silbenBaukastenAufgabe(lvl, kontext = null) {
  const basis = uebwoerterBis(lvl).filter(w => silben(w).length >= 3 && eindeutig(w));
  const ersatz = uebwoerterBis(5).filter(w => silben(w).length >= 3 && eindeutig(w));
  const pool = basis.length ? basis : ersatz;
  const wort = bevorzugtFaellig(pool, w => 'silbe:' + w, kontext?.faellige);
  const teile = silben(wort);
  return {
    typ: 'ordnen', hoertext: wort, titel: '🔊 Hör genau hin',
    frage: '🧩 Hör dir das Wort an und lege die Silben in der richtigen Reihenfolge.',
    elemente: shuffle([...teile]), antwort: teile.join(' → '), element: 'silbe:' + wort,
    hilfe: 'Hör dir das Wort noch einmal an und sprich es dabei leise mit - dann hörst du die Silben einzeln.',
    quelle: `${wort} = ${teile.join('-')}. Silben aus dem Gehör zu bauen trainiert genau die Zerlegung, die auch das Lesen leichter macht.`
  };
}

/* ============================================================================
   4. Quatschwörter: welches ist ein echtes Wort?
   Ein echtes Wort + drei aussprechbare Kunstwörter, gebaut aus Silben echter
   Wörter, aber neu gemischt. Kunstwörter werden gegen WORTSCHATZ geprüft.
   ============================================================================ */
const QUATSCH_BASIS = uniq([
  ...WORT_DETEKTIV.map(e => e.wort),
  ...SPIEGEL_WOERTER,
  ...uebwoerterBis(2)
]).filter(w => silben(w).length >= 2 && silben(w).length <= 3);

/* Silben, die im Deutschen NIE ein Wort (und damit auch keine neue Silbe
   NACH dem Zusammensetzen an erster Stelle) beginnen: doppelte Konsonanten
   und "ck" stehen immer nach einem kurzen Vokal, nie am Anfang - "Zu-cker"
   ist richtig, ein Kunstwort, das mit "cker" ANFÄNGT, wäre unlesbar. Solche
   Silben werden komplett aus dem Topf genommen statt nur an Position 0
   verboten - so kann nie versehentlich doch ein Wort damit beginnen. */
const VERBOTENE_SILBENANFAENGE = ['ck', 'tt', 'ss', 'ff', 'll', 'mm', 'nn', 'pp', 'tz'];
export const gueltigeSilbe = s => !VERBOTENE_SILBENANFAENGE.some(a => s.toLowerCase().startsWith(a));

const SILBENTOPF = uniq(QUATSCH_BASIS.flatMap(w => silben(w))).filter(gueltigeSilbe);

/* Levenshtein-Abstand (Editierdistanz) - klein und schnell genug für kurze
   Wörter. Genutzt, um Kunstwörter zu verwerfen, die einem echten Wort zum
   Verwechseln ähnlich sind (Abstand ≤ 1), statt nur auf Gleichheit zu prüfen. */
export function levenshtein(a, b) {
  const m = a.length, n = b.length;
  if (Math.abs(m - n) > 1) return 99;               // fürs Filtern reicht "zu weit weg"
  const zeile = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    let diag = zeile[0]; zeile[0] = i;
    for (let j = 1; j <= n; j++) {
      const oben = zeile[j], kosten = a[i - 1] === b[j - 1] ? 0 : 1;
      zeile[j] = Math.min(zeile[j] + 1, zeile[j - 1] + 1, diag + kosten);
      diag = oben;
    }
  }
  return zeile[n];
}

/* Ein Kunstwort ist zu gefährlich, wenn es a) einem echten Wort auf höchstens
   einen Buchstaben genau gleicht (Levenshtein ≤ 1 - das wäre kaum als
   "falsch" erkennbar), oder b) Präfix oder Suffix eines echten, mindestens
   fünf Buchstaben langen Wortes ist ("Fahrschul" sieht aus wie ein
   abgeschnittenes "Fahrschule"). */
export function zuNahAnEchtemWort(kandidat) {
  const k = kandidat.toLowerCase();
  for (const w of WORTSCHATZ) {
    if (Math.abs(w.length - k.length) <= 1 && levenshtein(k, w) <= 1) return true;
    if (w.length >= 5 && k.length < w.length && (w.startsWith(k) || w.endsWith(k))) return true;
  }
  return false;
}

/* Mehr als drei Konsonanten hintereinander sind im Deutschen praktisch nicht
   aussprechbar (y zählt hier als Konsonant - kommt in der Wortliste ohnehin
   nicht vor). */
export const zuVieleKonsonanten = wort => /[^aeiouäöü]{4,}/i.test(wort);

function bautKunstwort(anzahlSilben) {
  for (let versuch = 0; versuch < 150; versuch++) {
    const teile = Array.from({ length: anzahlSilben }, () => pick(SILBENTOPF).toLowerCase());
    const wort = gross(teile.join(''));
    if (zuVieleKonsonanten(wort)) continue;
    if (istEchtesWort(wort)) continue;
    if (zuNahAnEchtemWort(wort)) continue;
    return wort;
  }
  return null;
}

export function quatschAufgabe(lvl, kontext = null) {
  const menge = nachLevel(QUATSCH_BASIS, w => w.length, lvl);
  const pool = menge.length ? menge : QUATSCH_BASIS;
  /* Teilt sich den Namensraum "wort:" mit dem Wort-Detektiv - beides sind
     einzelne Wörter, die genau gelesen werden müssen; ein fälliges Wort darf
     hier genauso wiederkommen wie dort. */
  const echtesWort = bevorzugtFaellig(pool, w => 'wort:' + w, kontext?.faellige);
  const nSilben = silben(echtesWort).length;
  const kunst = new Set();
  let guard = 0;
  while (kunst.size < 3 && guard++ < 600) {
    const w = bautKunstwort(nSilben);
    if (w && w.toLowerCase() !== echtesWort.toLowerCase() && !istEchtesWort(w) && !zuNahAnEchtemWort(w)) kunst.add(w);
  }
  return {
    typ: 'choice',
    frage: '🔎 Welches ist ein echtes Wort? Lies alle vier laut.',
    optionen: shuffle([echtesWort, ...kunst]),
    antwort: echtesWort, element: 'wort:' + echtesWort,
    hilfe: 'Lies jedes Wort laut vor - nur eines ergibt wirklich einen Sinn.',
    quelle: 'Kunstwörter zu erkennen trainiert das genaue Lesen der Buchstabenfolge, statt am Wortbild zu raten.'
  };
}

/* ============================================================================
   5. Satz-Detektiv: genau EIN Fehler im angezeigten Satz
   Der Satz wird korrekt VORGELESEN (a.hoertext), angezeigt wird er mit einem
   Fehler: ein Wort fehlt, eines ist zu viel, zwei sind vertauscht, oder eines
   wurde durch ein ähnlich aussehendes Wort ersetzt.
   ============================================================================ */
export const SAETZE = [
  { woerter: ['Der', 'Hund', 'läuft', 'schnell', 'über', 'die', 'Wiese'], ersatz: { index: 1, wort: 'Hand' } },
  { woerter: ['Die', 'Katze', 'schläft', 'auf', 'dem', 'weichen', 'Kissen'], ersatz: { index: 1, wort: 'Kasse' } },
  { woerter: ['Mama', 'kauft', 'frisches', 'Brot', 'beim', 'Bäcker'], ersatz: { index: 3, wort: 'Boot' } },
  { woerter: ['Wir', 'spielen', 'heute', 'Nachmittag', 'im', 'Garten'], ersatz: { index: 5, wort: 'Karten' } },
  { woerter: ['Der', 'Vogel', 'baut', 'sein', 'Nest', 'in', 'dem', 'Baum'], ersatz: { index: 7, wort: 'Raum' } },
  { woerter: ['Papa', 'liest', 'mir', 'jeden', 'Abend', 'eine', 'Geschichte', 'vor'], ersatz: { index: 4, wort: 'Abends' } },
  { woerter: ['Die', 'Sonne', 'scheint', 'warm', 'am', 'blauen', 'Himmel'], ersatz: { index: 1, wort: 'Tonne' } },
  { woerter: ['Ein', 'Fisch', 'schwimmt', 'still', 'im', 'klaren', 'Wasser'], ersatz: { index: 1, wort: 'Tisch' } },
  { woerter: ['Das', 'Kind', 'malt', 'ein', 'buntes', 'Bild', 'für', 'Oma'], ersatz: { index: 5, wort: 'Bad' } },
  { woerter: ['Die', 'Kinder', 'bauen', 'im', 'Sand', 'eine', 'hohe', 'Burg'], ersatz: { index: 7, wort: 'Berg' } },
  { woerter: ['Der', 'Bäcker', 'backt', 'jeden', 'Morgen', 'frische', 'Brötchen'] },
  { woerter: ['Meine', 'Schwester', 'übt', 'jeden', 'Tag', 'Klavier'] },
  { woerter: ['Am', 'Wochenende', 'fahren', 'wir', 'zu', 'den', 'Großeltern'] },
  { woerter: ['Der', 'Bus', 'hält', 'genau', 'vor', 'unserer', 'Schule'] },
  { woerter: ['Im', 'Winter', 'bauen', 'wir', 'gerne', 'einen', 'Schneemann'] },
  { woerter: ['Der', 'Lehrer', 'erklärt', 'die', 'neue', 'Rechenaufgabe'] },
  { woerter: ['Am', 'Strand', 'sammeln', 'wir', 'bunte', 'Muscheln'] },
  { woerter: ['Der', 'Regen', 'trommelt', 'laut', 'gegen', 'das', 'Fenster'] },
  { woerter: ['Die', 'Blumen', 'blühen', 'bunt', 'im', 'ganzen', 'Garten'] },
  { woerter: ['Opa', 'erzählt', 'gerne', 'Geschichten', 'von', 'früher'] },
  { woerter: ['Wir', 'füttern', 'jeden', 'Morgen', 'die', 'kleinen', 'Hühner'] },
  { woerter: ['Das', 'Baby', 'schläft', 'ruhig', 'in', 'seinem', 'Bett'] },
  { woerter: ['Die', 'Feuerwehr', 'kommt', 'mit', 'lautem', 'Martinshorn'] },
  { woerter: ['Nach', 'der', 'Schule', 'treffen', 'wir', 'uns', 'zum', 'Spielen'] },
  { woerter: ['Der', 'Gärtner', 'gießt', 'jeden', 'Abend', 'die', 'Tomaten'] },
  { woerter: ['Im', 'Zoo', 'sehen', 'wir', 'einen', 'schlafenden', 'Löwen'] },
  { woerter: ['Die', 'Ente', 'schwimmt', 'ruhig', 'über', 'den', 'Teich'] },
  { woerter: ['Am', 'Abend', 'putzen', 'wir', 'uns', 'die', 'Zähne'] },
  { woerter: ['Der', 'Zug', 'fährt', 'pünktlich', 'in', 'den', 'Bahnhof', 'ein'] },
  { woerter: ['Meine', 'Freundin', 'wohnt', 'gleich', 'neben', 'der', 'Turnhalle'] }
];

/* Wörter für "zusätzliches Wort" (kommen in keinem Satz vor, sind aber
   selbst harmlose, echte Wörter - genau wie beim Auslassen von Wörtern beim
   Lesen entsteht so ein Satz, der beim Lesen leicht "durchrutscht"). */
const FUELLWOERTER = ['auch', 'sehr', 'dann', 'noch', 'schon', 'einfach', 'gerade', 'wieder', 'ganz', 'immer'];
/* Wörter für "fehlendes Wort" als falsche Auswahlmöglichkeiten - eigenständige
   Wörter, die in keinem Satz vorkommen sollen (siehe Prüfung unten). */
const NEUTRALWOERTER = ['Blume', 'Wolke', 'Kissen', 'Fenster', 'Lampe', 'Insel', 'Truhe', 'Regal', 'Kerze', 'Feder', 'Zettel', 'Krone'];
registriere(SAETZE.flatMap(s => s.woerter), FUELLWOERTER, NEUTRALWOERTER, SAETZE.filter(s => s.ersatz).map(s => s.ersatz.wort));

const FEHLERARTEN_ALLE = ['fehlt', 'zusatz', 'vertauscht', 'ersetzt'];
export const fehlerartenFuer = satz => FEHLERARTEN_ALLE.filter(f => f !== 'ersetzt' || satz.ersatz);

/* Baut aus einem korrekten Satz genau EINEN Fehler der gegebenen Art und die
   dazu passende Aufgabe. Exportiert, damit der Test jede Kombination aus
   Satz und Fehlerart gezielt prüfen kann, nicht nur zufällig getroffene. */
export function satzMitFehler(satz, art, erzwingeIndex = null) {
  const original = satz.woerter;
  if (art === 'fehlt') {
    /* Die Luecke steht GENAU an der Stelle des fehlenden Wortes - nicht immer
       am Satzende. Die Gross-/Kleinschreibung der uebrigen Woerter bleibt
       unveraendert (das "___" selbst uebernimmt optisch die Satzanfangs-
       Stelle, wenn das erste Wort fehlt: "___ Sonne scheint …"). */
    const i = erzwingeIndex ?? r(0, original.length - 1);
    const fehlend = original[i];
    const angezeigt = original.map((w, k) => k === i ? '___' : w).join(' ');
    const pool = NEUTRALWOERTER.filter(w => w.toLowerCase() !== fehlend.toLowerCase()
      && !original.some(o => o.toLowerCase() === w.toLowerCase()));
    const falsche = shuffle(pool).slice(0, 3);
    return {
      typ: 'choice', hoertext: original.join(' ') + '.', angezeigt,
      titel: '🔊 Hör genau hin',
      frage: `🕵️ Genau ein Wort fehlt in diesem Satz. Welches Wort fehlt?\n„${angezeigt}.“`,
      optionen: shuffle([fehlend, ...falsche]), antwort: fehlend, element: 'satz:' + original.join('_'),
      hilfe: 'Hör dir den Satz noch einmal an und achte darauf, welches Wort dabei nicht dasteht.',
      quelle: 'Wörter zu überlesen oder auszulassen ist ein typischer Lesefehler - genaues Lesen bis zum Satzende beugt vor.'
    };
  }
  if (art === 'zusatz') {
    const zusatz = pick(FUELLWOERTER.filter(w => !original.some(o => o.toLowerCase() === w.toLowerCase())));
    const pos = r(0, original.length);
    const gezeigt = [...original.slice(0, pos), zusatz, ...original.slice(pos)];
    const andere = shuffle(uniqCI(original)).slice(0, 3);
    return {
      typ: 'choice', hoertext: original.join(' ') + '.', angezeigt: gezeigt.join(' '),
      titel: '🔊 Hör genau hin',
      frage: `🕵️ In diesem Satz ist ein Wort zu viel. Welches Wort gehört hier NICHT hinein?\n„${gezeigt.join(' ')}.“`,
      optionen: shuffle([zusatz, ...andere]), antwort: zusatz, element: 'satz:' + original.join('_'),
      hilfe: 'Vergleiche den gezeigten Satz mit dem, was du gehört hast - ein Wort ist zusätzlich dazugekommen.',
      quelle: 'Ein zusätzliches Wort zu bemerken trainiert genaues, nicht nur sinngemäßes Lesen.'
    };
  }
  if (art === 'vertauscht') {
    let i = r(0, original.length - 2);
    let guard = 0;
    while (original[i].toLowerCase() === original[i + 1].toLowerCase() && guard++ < 10) i = r(0, original.length - 2);
    const gezeigt = [...original];
    [gezeigt[i], gezeigt[i + 1]] = [gezeigt[i + 1], gezeigt[i]];
    const rest = uniqCI(original.filter((_, k) => k !== i && k !== i + 1));
    const andere = shuffle(rest).slice(0, 2);
    return {
      typ: 'choice', hoertext: original.join(' ') + '.', angezeigt: gezeigt.join(' '),
      titel: '🔊 Hör genau hin',
      frage: `🕵️ Zwei Wörter haben in diesem Satz die Plätze getauscht. Welches Wort stand ursprünglich weiter vorne?\n„${gezeigt.join(' ')}.“`,
      optionen: shuffle([original[i], original[i + 1], ...andere]), antwort: original[i], element: 'satz:' + original.join('_'),
      hilfe: 'Sprich den Satz einmal so, wie er dasteht, und einmal so, wie du ihn gehört hast - wo klingt es anders?',
      quelle: 'Vertauschte Wörter zu erkennen trainiert die Reihenfolge im Satz, nicht nur einzelne Wörter.'
    };
  }
  // art === 'ersetzt'
  const { index, wort } = satz.ersatz;
  const gezeigt = original.map((w, k) => k === index ? wort : w);
  const rest = uniqCI(original.filter((_, k) => k !== index));
  const andere = shuffle(rest).slice(0, 3);
  return {
    typ: 'choice', hoertext: original.join(' ') + '.', angezeigt: gezeigt.join(' '),
    titel: '🔊 Hör genau hin',
    frage: `🕵️ Ein Wort wurde durch ein ähnlich aussehendes Wort ersetzt. Welches Wort stimmt hier nicht?\n„${gezeigt.join(' ')}.“`,
    optionen: shuffle([wort, ...andere]), antwort: wort, element: 'satz:' + original.join('_'),
    hilfe: 'Vergleiche jedes Wort im Satz mit dem, was du gehört hast.',
    quelle: 'Genau solche Verwechslungen (ähnlich aussehendes statt gehörtes Wort) sind typisch - genaues Nachlesen deckt sie auf.'
  };
}

export function satzDetektivAufgabe(lvl, kontext = null) {
  const menge = nachLevel(SAETZE, s => s.woerter.length, lvl);
  const pool = menge.length ? menge : SAETZE;
  const satz = bevorzugtFaellig(pool, s => 'satz:' + s.woerter.join('_'), kontext?.faellige);
  const art = pick(fehlerartenFuer(satz));
  return satzMitFehler(satz, art);
}

/* ============================================================================
   6. Blitzlesen (typ 'blitz'): kurz zeigen, dann aus 4 Optionen wählen.
   Die Anzeigedauer wird adaptiv gesteuert (siehe blitzAnpassen, gespeichert
   in p.blitzMs) - hier nur die reine Rechenregel.
   ============================================================================ */
export const BLITZ_MS_START = 1500;
export const BLITZ_MS_MIN = 300;
export const BLITZ_MS_MAX = 3000;

export function blitzAnpassen(ms, richtig) {
  const basis = Number.isFinite(ms) ? ms : BLITZ_MS_START;
  const neu = richtig ? basis * 0.9 : basis * 1.15;
  return Math.round(Math.min(BLITZ_MS_MAX, Math.max(BLITZ_MS_MIN, neu)));
}

const BLITZ_SILBEN = ['ma', 'ta', 'na', 'la', 'ra', 'sa', 'ka', 'da', 'ba', 'pa',
  'me', 'te', 'ne', 'le', 're', 'se', 'ke', 'de', 'be', 'pe', 'mi', 'ti', 'ni', 'li', 'bi'];
/* Kurze, sehr häufige Wörter (Sichtwortschatz) - genau die Art Wort, die
   nicht mehr erlesen, sondern auf einen Blick erkannt werden soll. */
const BLITZ_WOERTER_KURZ = ['ist', 'und', 'der', 'die', 'das', 'ein', 'war', 'hat',
  'wir', 'ihr', 'man', 'wie', 'was', 'nur', 'auch', 'noch', 'schon', 'dann', 'doch', 'sehr'];
const BLITZ_WOERTER_LANG = uniq(uebwoerterBis(3)).filter(w => w.length >= 5 && w.length <= 10);
registriere(BLITZ_SILBEN, BLITZ_WOERTER_KURZ, BLITZ_WOERTER_LANG);

function aehnlichkeit(a, b) {
  a = a.toLowerCase(); b = b.toLowerCase();
  let score = 0;
  if (a.length === b.length) score += 2;
  if (a[0] === b[0]) score += 1;
  if (a.slice(-1) === b.slice(-1)) score += 1;
  const vokale = s => (s.match(/[aeiouäöü]/g) || []).join('');
  if (vokale(a) === vokale(b)) score += 2;
  return score;
}
function aehnlicheAblenker(pool, ziel, n) {
  const kandidaten = pool.filter(w => w.toLowerCase() !== ziel.toLowerCase());
  const bewertet = kandidaten.map(w => ({ w, s: aehnlichkeit(w, ziel) + Math.random() * 0.5 }))
    .sort((a, b) => b.s - a.s);
  return uniq(bewertet.map(x => x.w)).slice(0, n);
}

export function blitzAufgabe(lvl, kontext = null) {
  const pool = lvl <= 2 ? BLITZ_SILBEN : lvl === 3 ? BLITZ_WOERTER_KURZ
    : (BLITZ_WOERTER_LANG.length ? BLITZ_WOERTER_LANG : BLITZ_WOERTER_KURZ);
  /* Ein Stolperwort aus dem Vorlesen (js/store.js: merkeStolper) wird selbst
     zum Blitzwort, mit ähnlichen Ablenkern aus dem normalen Pool - genau das
     Wort, an dem es beim Lesen hakt, kommt so auch hier wieder. */
  const stolperZiel = (kontext?.stolperWoerter?.length && Math.random() < FAELLIG_ANTEIL)
    ? pick(kontext.stolperWoerter) : null;
  const ziel = stolperZiel || pick(pool);
  const ablenkerPool = stolperZiel ? uniq([...pool, stolperZiel]) : pool;
  const ablenker = aehnlicheAblenker(ablenkerPool, ziel, 3);
  while (ablenker.length < 3) {
    const ersatz = pick(pool.filter(w => w !== ziel && !ablenker.includes(w)));
    if (ersatz) ablenker.push(ersatz); else break;
  }
  return {
    typ: 'blitz', blitzText: ziel,
    frage: '⚡ Schau genau hin - gleich verschwindet es wieder! Was hast du gesehen?',
    optionen: shuffle([ziel, ...ablenker]),
    antwort: ziel, element: (stolperZiel ? 'stolper:' : 'blitz:') + ziel,
    hilfe: 'Wenn du unsicher bist, tippe auf „Nochmal zeigen" - das kostet nichts.',
    quelle: 'Blitzlesen trainiert den Sichtwortschatz: häufige Wörter auf einen Blick erkennen, statt sie jedes Mal neu zu erlesen.'
  };
}
