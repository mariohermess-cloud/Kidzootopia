/* Lesetest: ein adaptives Leseprofil, das Eltern und Kind gemeinsam in etwa
   15 Minuten durchlaufen (siehe js/ui.js: screenLesetest, Route "lesetest").

   AUSDRÜCKLICH KEINE DIAGNOSE. Dieser Test ersetzt keine standardisierten
   Verfahren (z. B. SLRT-II, ELFE II, WLLP-R), die Fachleute einsetzen, und
   er sagt nichts über "LRS ja/nein" aus. Er zeigt beschreibend, WO das Lesen
   gerade hakt, und schlägt dazu passende Übungen aus der App vor. Es gibt
   bewusst keine Normwerte und keinen Prozentrang – nur den Vergleich mit
   sich selbst (schneller/langsamer als beim letzten Mal) und innere
   Vergleiche (z. B. Wörter vs. Quatschwörter). Über einen möglichen
   Nachteilsausgleich berät die Schule, nicht diese App.

   Reine Rechen- und Datenlogik, DOM- und Audio-frei – testbar ohne Browser
   (siehe tests/lesetest.mjs). Die Anzeige macht js/ui.js; Mikrofonmessung
   und Aufnahme laufen über die vorhandenen Bausteine js/lesen.js (Auswerten
   der Lautstärke-Hüllkurve) und js/lesemodi.js (Takt messen). */

import { silben, uebwoerterBis, UEBWOERTER } from './silben.js';
import {
  WORT_DETEKTIV, SPIEGEL_WOERTER, istEchtesWort, zuNahAnEchtemWort,
  zuVieleKonsonanten, gueltigeSilbe
} from './lesespiele.js';

const r = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const shuffle = a => a.map(v => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map(v => v[1]);
const uniq = a => [...new Set(a)];

/* ============================================================================
   TEIL 1: Wörter lesen – Wortpool, nach Schwierigkeit gestaffelt.

   Grundlage: die vorhandenen Übungswortlisten (js/silben.js: UEBWOERTER) und
   die Wortschätze aus den Lesespielen (js/lesespiele.js), dazu einige neue,
   sehr häufige Wörter (Sichtwortschatz) – zusammen deutlich über 150 Wörter,
   damit an keinem Testtag zweimal dieselben Wörter drankommen (siehe
   wortlisteFuerTest, das pro Aufruf eine zufällige, aber gestaffelte Auswahl
   zieht und sich Wörter aus vorigen Durchgängen merkt).
   ============================================================================ */
const NEUE_SICHTWOERTER = [
  'ist', 'und', 'der', 'die', 'das', 'ein', 'war', 'hat', 'wir', 'ihr',
  'man', 'wie', 'was', 'nur', 'auch', 'noch', 'schon', 'dann', 'doch', 'sehr'
];

const BASISWOERTER = uniq([
  ...UEBWOERTER[1], ...UEBWOERTER[2], ...UEBWOERTER[3], ...UEBWOERTER[4], ...UEBWOERTER[5],
  ...WORT_DETEKTIV.map(e => e.wort), ...WORT_DETEKTIV.flatMap(e => e.ablenker),
  ...SPIEGEL_WOERTER, ...NEUE_SICHTWOERTER
]);

/* Schwierigkeit 1 (kurz, lautgetreu) bis 5 (mehrsilbig, konsonantenreich) –
   aus Silbenzahl UND Wortlänge, weil Silbenzahl allein sehr kurze und sehr
   lange einsilbige Wörter nicht unterscheiden würde. */
function stufeVonWort(wort) {
  const nSilben = silben(wort).length;
  if (nSilben <= 1) return wort.length <= 4 ? 1 : 2;
  if (nSilben === 2) return wort.length <= 6 ? 2 : 3;
  if (nSilben === 3) return 4;
  return 5;
}

export const WORTPOOL = BASISWOERTER.map(wort => ({ wort, stufe: stufeVonWort(wort) }));

/* Adaptiver Einstieg nach Etappe: Etappe 1/2 startet mit den leichteren
   Stufen, Etappe 3+ mischt von Anfang an breiter. "ausschluss" verhindert,
   dass im selben Durchgang zweimal dasselbe Wort kommt. */
export function wortlisteFuerTest(etappe, anzahl, ausschluss = []) {
  const ausSet = new Set(ausschluss.map(w => String(w).toLowerCase()));
  const maxStufe = Math.max(2, Math.min(5, (etappe || 1) + 1));
  let pool = WORTPOOL.filter(e => e.stufe <= maxStufe && !ausSet.has(e.wort.toLowerCase()));
  if (pool.length < anzahl) pool = WORTPOOL.filter(e => !ausSet.has(e.wort.toLowerCase()));
  return shuffle(pool).slice(0, anzahl).sort((a, b) => a.stufe - b.stufe).map(e => e.wort);
}

/* ============================================================================
   TEIL 2: Quatschwörter – dieselben Regeln wie in js/lesespiele.js:
   aussprechbar (≤ 3 Konsonanten am Stück), nicht echt, nicht fast-echt.
   ============================================================================ */
const SILBENTOPF = uniq(BASISWOERTER.flatMap(w => silben(w))).filter(gueltigeSilbe);

function bautKunstwortFuerTest(anzahlSilben) {
  const n = Math.max(1, Math.min(4, anzahlSilben || 2));
  for (let versuch = 0; versuch < 150; versuch++) {
    const teile = Array.from({ length: n }, () => SILBENTOPF[r(0, SILBENTOPF.length - 1)].toLowerCase());
    const wort = teile.join('').charAt(0).toUpperCase() + teile.join('').slice(1);
    if (zuVieleKonsonanten(wort)) continue;
    if (istEchtesWort(wort)) continue;
    if (zuNahAnEchtemWort(wort)) continue;
    return wort;
  }
  return null;
}

/* Erzeugt eine Liste aussprechbarer, garantiert ungültiger Kunstwörter –
   die Silbenzahl wechselt zwischen 2 und 3, damit nicht jedes Wort gleich
   lang wirkt. */
export function kunstwortlisteFuerTest(anzahl) {
  const raus = new Set();
  let guard = 0;
  while (raus.size < anzahl && guard++ < anzahl * 200 + 200) {
    const w = bautKunstwortFuerTest(r(0, 1) === 0 ? 2 : 3);
    if (w) raus.add(w);
  }
  return [...raus];
}

/* ============================================================================
   Kennzahlen aus einem Tipp-Protokoll (Teil 1 und Teil 2): der Erwachsene
   tippt je Wort ✓ richtig, ✗ falsch (optional mit Fehlerart) oder ⏭
   ausgelassen. Reine Auswertung, unabhängig davon, ob es Wörter oder
   Quatschwörter waren.
   ============================================================================ */
export const FEHLERARTEN = [
  { id: 'aehnlich_aussehend', label: 'ähnlich aussehend' },
  { id: 'aehnlich_klingend', label: 'ähnlich klingend' },
  { id: 'vertauscht', label: 'Buchstaben vertauscht' },
  { id: 'silbe', label: 'Silbe verschluckt/dazu' },
  { id: 'geraten', label: 'geraten (anderes Wort)' },
  { id: 'buchstabiert', label: 'stockend buchstabiert' }
];
const FEHLERART_IDS = FEHLERARTEN.map(f => f.id);

export function woerterAuswerten(protokoll, dauerMs = 60000) {
  const liste = Array.isArray(protokoll) ? protokoll : [];
  const gesamt = liste.length;
  const richtig = liste.filter(e => e?.ergebnis === 'richtig').length;
  const falsch = liste.filter(e => e?.ergebnis === 'falsch').length;
  const ausgelassen = liste.filter(e => e?.ergebnis === 'ausgelassen').length;
  const minuten = Math.max(1, dauerMs) / 60000;
  const proMinute = Math.round(richtig / minuten);
  const fehlerquote = gesamt ? Math.round((falsch + ausgelassen) / gesamt * 100) / 100 : 0;
  const ausgelassenAnteil = gesamt ? ausgelassen / gesamt : 0;
  const fehlerarten = {};
  liste.forEach(e => {
    if (e?.ergebnis === 'falsch' && e.fehlerart && FEHLERART_IDS.includes(e.fehlerart)) {
      fehlerarten[e.fehlerart] = (fehlerarten[e.fehlerart] || 0) + 1;
    }
  });
  return { gesamt, richtig, falsch, ausgelassen, proMinute, fehlerquote, ausgelassenAnteil, fehlerarten };
}

/* Die häufigste Fehlerart – bei Gleichstand entscheidet eine feste
   Reihenfolge (FEHLERARTEN), damit das Ergebnis nicht vom Zufall abhängt. */
export function dominanteFehlerart(fehlerarten) {
  const f = fehlerarten || {};
  const gesamt = Object.values(f).reduce((s, n) => s + n, 0);
  if (!gesamt) return null;
  let bester = null;
  for (const art of FEHLERART_IDS) {
    const n = f[art] || 0;
    if (n > 0 && (!bester || n > bester.anzahl)) bester = { art, anzahl: n };
  }
  return bester ? { ...bester, anteil: bester.anzahl / gesamt } : null;
}

/* ============================================================================
   TEIL 3: Ähnliche Wörter unterscheiden – Treppenverfahren (Staircase).
   2 richtig hintereinander auf einer Stufe -> eine Stufe schwerer.
   1 falsch -> sofort eine Stufe leichter. So pendelt sich der Test in der
   Nähe der eigenen Leistungsgrenze ein, ohne Prozentränge zu brauchen.
   ============================================================================ */
export const TREPPE_STUFE_MIN = 1;
export const TREPPE_STUFE_MAX = 5;
export const TREPPE_STUFE_START = 2;

export function neuerTreppenZustand() {
  return { stufe: TREPPE_STUFE_START, folgeRichtig: 0 };
}

export function treppeSchritt(zustand, richtig) {
  const z = { ...neuerTreppenZustand(), ...zustand };
  if (richtig) {
    z.folgeRichtig += 1;
    if (z.folgeRichtig >= 2) { z.stufe = Math.min(TREPPE_STUFE_MAX, z.stufe + 1); z.folgeRichtig = 0; }
  } else {
    z.stufe = Math.max(TREPPE_STUFE_MIN, z.stufe - 1);
    z.folgeRichtig = 0;
  }
  return z;
}

/* Aufgaben-Pool: dieselben Bild<->Wort-Items wie im Wort-Detektiv-Lesespiel
   (js/lesespiele.js), nach Silbenzahl in Stufen eingeteilt. "ausschluss" ist
   eine Menge von Schlüsseln ("wort:Haus") – so lassen sich Elemente
   vermeiden, die im Lernmotor schon aktiv geübt werden (siehe
   js/lernmotor.js: schwierigsteSchluessel/kaesten), damit der Test nicht
   nur bereits Geübtes abfragt. */
const UNTERSCHEIDEN_POOL = WORT_DETEKTIV.map(e => ({
  ...e, stufe: Math.max(TREPPE_STUFE_MIN, Math.min(TREPPE_STUFE_MAX, silben(e.wort).length + 1))
}));

export function unterscheidenAufgabe(stufe, ausschluss = new Set()) {
  const ziel = Math.max(TREPPE_STUFE_MIN, Math.min(TREPPE_STUFE_MAX, stufe || TREPPE_STUFE_START));
  const ausSet = ausschluss instanceof Set ? ausschluss : new Set(ausschluss || []);
  let kandidaten = UNTERSCHEIDEN_POOL.filter(e => e.stufe === ziel && !ausSet.has('wort:' + e.wort));
  if (!kandidaten.length) kandidaten = UNTERSCHEIDEN_POOL.filter(e => !ausSet.has('wort:' + e.wort));
  if (!kandidaten.length) kandidaten = UNTERSCHEIDEN_POOL;
  const e = kandidaten[r(0, kandidaten.length - 1)];
  return {
    bild: e.bild, wort: e.wort,
    optionen: shuffle([e.wort, ...e.ablenker]),
    antwort: e.wort, element: 'wort:' + e.wort
  };
}

/* Auswertung: antworten = [{ richtig, zeitMs, stufeNach }], eine je Aufgabe. */
export function unterscheidenAuswerten(antworten) {
  const liste = Array.isArray(antworten) ? antworten : [];
  const gesamt = liste.length;
  const richtig = liste.filter(a => a?.richtig).length;
  const trefferquote = gesamt ? Math.round(richtig / gesamt * 100) / 100 : 0;
  const zeiten = liste.map(a => a?.zeitMs).filter(Number.isFinite).sort((a, b) => a - b);
  let medianZeitMs = null;
  if (zeiten.length) {
    const mitte = zeiten.length / 2;
    medianZeitMs = Number.isInteger(mitte)
      ? Math.round((zeiten[mitte - 1] + zeiten[mitte]) / 2) : zeiten[Math.floor(mitte)];
  }
  const stufeEnde = liste.length ? (liste[liste.length - 1].stufeNach ?? TREPPE_STUFE_START) : TREPPE_STUFE_START;
  return { gesamt, richtig, trefferquote, medianZeitMs, stufeEnde };
}

/* ============================================================================
   TEIL 4: Tempo & Takt – reine Weiterleitung an die vorhandene Auswertung
   (js/lesen.js: auswerten; js/lesemodi.js: taktMessen), damit dieselbe,
   bereits geprüfte Logik verwendet wird. Optional: ohne Mikrofon wird
   dieser Teil einfach übersprungen (tempoTakt bleibt null).
   ============================================================================ */
export function tempoTaktKennzahlen(leseWerte, taktMessung) {
  if (!leseWerte) return null;
  return {
    tempo: leseWerte.tempo,
    stockungen: leseWerte.stockungen,
    gleichmass: leseWerte.gleichmass,
    betonung: leseWerte.betonung,
    silbenProMin: taktMessung?.silbenProMin ?? null,
    taktGleichmass: taktMessung?.gleichmass ?? null,
    taktBrueche: taktMessung?.taktBrueche ?? null
  };
}

/* ============================================================================
   TEIL 5: Verstehen – selbst gelesen vs. gehört.
   Textpaare gleicher Schwierigkeit (Länge/Wortschatz), je 3 eindeutige
   Fragen. Reihenfolge (wer liest, wer hört) und welcher Text von beiden A
   oder B ist, entscheidet der Aufruf in js/ui.js, nicht diese Liste.
   ============================================================================ */
const paar = (etappe, a, b) => ({ etappe, a, b });
const text = (titel, inhalt, fragen) => ({ titel, text: inhalt, fragen });
const frage = (frage, optionen, antwort) => ({ frage, optionen, antwort });

export const TEXTPAARE = [
  // ---- Etappe 1 ----
  paar(1,
    text('Der Ball', 'Tim hat einen roten Ball. Er spielt damit im Garten. Der Ball rollt unter den Baum. Tim holt ihn schnell zurück.', [
      frage('Welche Farbe hat der Ball?', ['rot', 'blau', 'gelb'], 'rot'),
      frage('Wo spielt Tim?', ['im Garten', 'im Haus', 'in der Schule'], 'im Garten'),
      frage('Wohin rollt der Ball?', ['unter den Baum', 'ins Wasser', 'auf die Straße'], 'unter den Baum')
    ]),
    text('Die Puppe', 'Lena hat eine blaue Puppe. Sie spielt damit im Zimmer. Die Puppe fällt vom Bett. Lena hebt sie wieder auf.', [
      frage('Welche Farbe hat die Puppe?', ['blau', 'rot', 'grün'], 'blau'),
      frage('Wo spielt Lena?', ['im Zimmer', 'im Garten', 'im Auto'], 'im Zimmer'),
      frage('Wovon fällt die Puppe?', ['vom Bett', 'vom Stuhl', 'vom Tisch'], 'vom Bett')
    ])),
  paar(1,
    text('Der Hund', 'Max hat einen braunen Hund. Der Hund heißt Bruno. Bruno läuft gerne im Park. Max wirft ihm einen Stock.', [
      frage('Welche Farbe hat der Hund?', ['braun', 'schwarz', 'weiß'], 'braun'),
      frage('Wie heißt der Hund?', ['Bruno', 'Rex', 'Fido'], 'Bruno'),
      frage('Wo läuft Bruno gerne?', ['im Park', 'im Wald', 'am Strand'], 'im Park')
    ]),
    text('Die Katze', 'Mia hat eine schwarze Katze. Die Katze heißt Minka. Minka schläft gerne auf dem Sofa. Mia streichelt sie sanft.', [
      frage('Welche Farbe hat die Katze?', ['schwarz', 'weiß', 'braun'], 'schwarz'),
      frage('Wie heißt die Katze?', ['Minka', 'Mimi', 'Luna'], 'Minka'),
      frage('Wo schläft Minka gerne?', ['auf dem Sofa', 'im Korb', 'unterm Bett'], 'auf dem Sofa')
    ])),
  paar(1,
    text('Der Kuchen', 'Oma backt einen Apfelkuchen. Der Kuchen duftet im ganzen Haus. Papa schneidet ein Stück ab. Alle essen zusammen.', [
      frage('Was backt Oma?', ['Apfelkuchen', 'Schokokuchen', 'Brot'], 'Apfelkuchen'),
      frage('Wer schneidet ein Stück ab?', ['Papa', 'Mama', 'Opa'], 'Papa'),
      frage('Wo duftet der Kuchen?', ['im ganzen Haus', 'nur in der Küche', 'draußen'], 'im ganzen Haus')
    ]),
    text('Die Suppe', 'Opa kocht eine Gemüsesuppe. Die Suppe dampft auf dem Herd. Mama probiert einen Löffel. Alle setzen sich an den Tisch.', [
      frage('Was kocht Opa?', ['Gemüsesuppe', 'Nudelsuppe', 'Tomatensuppe'], 'Gemüsesuppe'),
      frage('Wer probiert einen Löffel?', ['Mama', 'Papa', 'Oma'], 'Mama'),
      frage('Wo dampft die Suppe?', ['auf dem Herd', 'im Kühlschrank', 'im Ofen'], 'auf dem Herd')
    ])),
  paar(1,
    text('Der Drachen', 'Tom lässt einen gelben Drachen steigen. Der Wind ist heute stark. Der Drachen fliegt hoch in den Himmel. Tom freut sich sehr.', [
      frage('Welche Farbe hat der Drachen?', ['gelb', 'rot', 'blau'], 'gelb'),
      frage('Wie ist der Wind?', ['stark', 'schwach', 'es gibt keinen'], 'stark'),
      frage('Wohin fliegt der Drachen?', ['hoch in den Himmel', 'ins Wasser', 'auf das Dach'], 'hoch in den Himmel')
    ]),
    text('Das Boot', 'Nina baut ein kleines Papierboot. Sie setzt es auf den Bach. Das Wasser trägt es weit fort. Nina läuft hinterher.', [
      frage('Woraus ist das Boot?', ['Papier', 'Holz', 'Plastik'], 'Papier'),
      frage('Wohin setzt Nina das Boot?', ['auf den Bach', 'in die Badewanne', 'in den Teich'], 'auf den Bach'),
      frage('Was macht Nina danach?', ['sie läuft hinterher', 'sie geht nach Hause', 'sie weint'], 'sie läuft hinterher')
    ])),
  paar(1,
    text('Der Schneemann', 'Die Kinder bauen einen Schneemann. Sie geben ihm eine Karotte als Nase. Ein Hut kommt auf den Kopf. Der Schneemann steht im Garten.', [
      frage('Was ist die Nase?', ['eine Karotte', 'ein Stein', 'eine Kartoffel'], 'eine Karotte'),
      frage('Was kommt auf den Kopf?', ['ein Hut', 'eine Mütze', 'nichts'], 'ein Hut'),
      frage('Wo steht der Schneemann?', ['im Garten', 'im Wald', 'auf der Straße'], 'im Garten')
    ]),
    text('Die Sandburg', 'Die Kinder bauen eine Sandburg. Sie stecken eine Fahne oben drauf. Muscheln schmücken den Turm. Die Sandburg steht am Strand.', [
      frage('Was steckt oben drauf?', ['eine Fahne', 'ein Ast', 'ein Stein'], 'eine Fahne'),
      frage('Was schmückt den Turm?', ['Muscheln', 'Blumen', 'Steine'], 'Muscheln'),
      frage('Wo steht die Sandburg?', ['am Strand', 'im Garten', 'im Wald'], 'am Strand')
    ])),
  paar(1,
    text('Der Vogel', 'Ein kleiner Vogel sitzt auf dem Ast. Er singt ein fröhliches Lied. Dann fliegt er zu seinem Nest. Im Nest warten drei Eier.', [
      frage('Wo sitzt der Vogel?', ['auf dem Ast', 'auf dem Dach', 'auf dem Zaun'], 'auf dem Ast'),
      frage('Wohin fliegt er?', ['zu seinem Nest', 'zum Baum', 'zum Fluss'], 'zu seinem Nest'),
      frage('Wie viele Eier warten im Nest?', ['drei', 'zwei', 'vier'], 'drei')
    ]),
    text('Die Biene', 'Eine kleine Biene sitzt auf der Blume. Sie sammelt süßen Nektar. Dann fliegt sie zu ihrem Bienenstock. Im Stock warten viele Bienen.', [
      frage('Wo sitzt die Biene?', ['auf der Blume', 'auf dem Blatt', 'auf dem Baum'], 'auf der Blume'),
      frage('Wohin fliegt sie?', ['zu ihrem Bienenstock', 'zum Nest', 'zum Garten'], 'zu ihrem Bienenstock'),
      frage('Wer wartet im Stock?', ['viele Bienen', 'ein Vogel', 'eine Katze'], 'viele Bienen')
    ])),

  // ---- Etappe 2 ----
  paar(2,
    text('Der Schmetterling', 'Zuerst war es ein winziges Ei, dann eine hungrige Raupe. Die Raupe fraß viele grüne Blätter. Danach spann sie sich in einen Kokon ein. Nach einigen Wochen schlüpfte ein bunter Schmetterling.', [
      frage('Was war zuerst da?', ['ein Ei', 'eine Raupe', 'ein Kokon'], 'ein Ei'),
      frage('Was fraß die Raupe?', ['grüne Blätter', 'rote Blüten', 'braune Rinde'], 'grüne Blätter'),
      frage('Was schlüpfte am Ende?', ['ein bunter Schmetterling', 'ein Vogel', 'eine Biene'], 'ein bunter Schmetterling')
    ]),
    text('Der Frosch', 'Zuerst war es ein kleines Ei, dann eine schwarze Kaulquappe. Die Kaulquappe schwamm munter im klaren Teich. Nach einiger Zeit wuchsen ihr vier kleine Beine. Am Ende hüpfte ein grüner Frosch davon.', [
      frage('Was war zuerst da?', ['ein Ei', 'eine Kaulquappe', 'ein Frosch'], 'ein Ei'),
      frage('Wo schwamm die Kaulquappe?', ['im klaren Teich', 'im Meer', 'im Fluss'], 'im klaren Teich'),
      frage('Was hüpfte am Ende davon?', ['ein grüner Frosch', 'eine Kröte', 'ein Fisch'], 'ein grüner Frosch')
    ])),
  paar(2,
    text('Die Brücke', 'Über den Fluss führt eine alte Brücke aus Stein. Sie steht dort schon seit hundert Jahren. Jeden Tag fahren viele Wagen über sie hinweg. Unten am Ufer hört man das Wasser rauschen.', [
      frage('Woraus ist die Brücke?', ['Stein', 'Holz', 'Eisen'], 'Stein'),
      frage('Wie alt ist die Brücke ungefähr?', ['hundert Jahre', 'zehn Jahre', 'tausend Jahre'], 'hundert Jahre'),
      frage('Was hört man am Ufer?', ['das Wasser rauschen', 'Vögel singen', 'Autos hupen'], 'das Wasser rauschen')
    ]),
    text('Der Turm', 'Mitten in der Stadt steht ein alter Turm aus Ziegeln. Er steht dort schon seit zweihundert Jahren. Jeden Mittag läutet oben eine große Glocke. Von der Spitze sieht man die ganze Stadt.', [
      frage('Woraus ist der Turm?', ['Ziegeln', 'Holz', 'Glas'], 'Ziegeln'),
      frage('Was läutet jeden Mittag?', ['eine große Glocke', 'eine Sirene', 'eine Trommel'], 'eine große Glocke'),
      frage('Was sieht man von der Spitze?', ['die ganze Stadt', 'das Meer', 'den Wald'], 'die ganze Stadt')
    ])),
  paar(2,
    text('Der Leuchtturm', 'Nachts, wenn der Sturm über das Meer fährt, dreht sich oben das helle Licht. Es wandert über die dunklen Wellen und findet die Schiffe. Der Wärter sitzt in der warmen Stube. Er schreibt auf, wie hoch die Wellen heute gehen.', [
      frage('Wann dreht sich das Licht besonders?', ['nachts im Sturm', 'am hellen Mittag', 'im Sommer'], 'nachts im Sturm'),
      frage('Was findet das Licht?', ['die Schiffe', 'die Fische', 'die Vögel'], 'die Schiffe'),
      frage('Was schreibt der Wärter auf?', ['wie hoch die Wellen gehen', 'wie viele Fische es gibt', 'wie spät es ist'], 'wie hoch die Wellen gehen')
    ]),
    text('Die Wetterstation', 'Oben auf dem Berg, wenn der Wind über die Gipfel fährt, drehen sich die kleinen Messgeräte. Sie zeigen an, wie stark und woher der Wind kommt. Die Forscherin sitzt in der warmen Hütte. Sie schreibt auf, wie kalt es heute draußen ist.', [
      frage('Wo stehen die Messgeräte?', ['auf dem Berg', 'im Tal', 'am Meer'], 'auf dem Berg'),
      frage('Was zeigen die Messgeräte an?', ['wie stark der Wind ist', 'wie viel Regen fällt', 'wie hell die Sonne scheint'], 'wie stark der Wind ist'),
      frage('Was schreibt die Forscherin auf?', ['wie kalt es ist', 'wie laut es ist', 'wie spät es ist'], 'wie kalt es ist')
    ])),
  paar(2,
    text('Das Gewitter', 'Erst wurde es ganz still, dann wurde der Himmel dunkel. Die Vögel verschwanden, kein Blatt bewegte sich mehr. Plötzlich riss ein greller Blitz den Himmel auf. Danach roch die ganze Wiese nach frischem Regen.', [
      frage('Was geschah zuerst?', ['es wurde still', 'es donnerte', 'es regnete'], 'es wurde still'),
      frage('Was verschwand?', ['die Vögel', 'die Kinder', 'die Wolken'], 'die Vögel'),
      frage('Wonach roch die Wiese danach?', ['nach frischem Regen', 'nach Rauch', 'nach Blumen'], 'nach frischem Regen')
    ]),
    text('Der Sturm', 'Erst wurde es ganz warm, dann zogen dunkle Wolken auf. Die Blätter wirbelten, und die Fenster klapperten laut. Plötzlich riss ein starker Windstoß einen Ast vom Baum. Danach lag überall nasses Laub auf der Straße.', [
      frage('Was geschah zuerst?', ['es wurde warm', 'es blitzte', 'es schneite'], 'es wurde warm'),
      frage('Was klapperte laut?', ['die Fenster', 'die Türen', 'die Blätter'], 'die Fenster'),
      frage('Was lag danach auf der Straße?', ['nasses Laub', 'Schnee', 'Sand'], 'nasses Laub')
    ])),
  paar(2,
    text('Der alte Baum', 'Mitten auf dem Hof steht ein Apfelbaum, den schon der Urgroßvater gepflanzt hat. Sein Stamm ist rissig, einige Äste sind schon abgestorben. Trotzdem trägt er jedes Jahr wieder Früchte. Aus den kleinen, sauren Äpfeln wird die beste Marmelade.', [
      frage('Wer hat den Baum gepflanzt?', ['der Urgroßvater', 'der Vater', 'die Oma'], 'der Urgroßvater'),
      frage('Wie ist der Stamm?', ['rissig', 'glatt', 'dünn'], 'rissig'),
      frage('Was wird aus den Äpfeln gemacht?', ['Marmelade', 'Saft', 'Kuchen'], 'Marmelade')
    ]),
    text('Der alte Brunnen', 'Mitten im Dorf steht ein Brunnen, den schon der Urgroßvater gebaut hat. Sein Stein ist bemoost, einige Steine sind schon lose. Trotzdem liefert er noch immer klares Wasser. Aus dem kühlen Wasser macht die Bäckerin ihr bestes Brot.', [
      frage('Wer hat den Brunnen gebaut?', ['der Urgroßvater', 'der Vater', 'der Opa'], 'der Urgroßvater'),
      frage('Wie ist der Stein?', ['bemoost', 'glatt', 'neu'], 'bemoost'),
      frage('Was macht die Bäckerin aus dem Wasser?', ['ihr bestes Brot', 'Kuchen', 'Suppe'], 'ihr bestes Brot')
    ])),
  paar(2,
    text('Die Fahrradtour', 'Am Samstag fahren Lisa und ihr Vater mit dem Fahrrad zum See. Unterwegs machen sie eine kurze Pause am Waldrand. Dort essen sie belegte Brote und trinken Tee. Am See angekommen, springen beide sofort ins kühle Wasser.', [
      frage('Wohin fahren sie?', ['zum See', 'zum Wald', 'zur Stadt'], 'zum See'),
      frage('Wo machen sie Pause?', ['am Waldrand', 'auf der Wiese', 'am Fluss'], 'am Waldrand'),
      frage('Was machen sie am See?', ['sie springen ins Wasser', 'sie angeln', 'sie schlafen'], 'sie springen ins Wasser')
    ]),
    text('Die Wanderung', 'Am Sonntag wandern Jonas und seine Mutter zum Aussichtsturm. Unterwegs machen sie eine kurze Rast an einer Quelle. Dort essen sie Äpfel und trinken frisches Wasser. Oben am Turm angekommen, schauen beide über das ganze Tal.', [
      frage('Wohin wandern sie?', ['zum Aussichtsturm', 'zum See', 'zum Dorf'], 'zum Aussichtsturm'),
      frage('Wo machen sie Rast?', ['an einer Quelle', 'im Wald', 'am Bach'], 'an einer Quelle'),
      frage('Was machen sie oben am Turm?', ['sie schauen über das Tal', 'sie essen zu Mittag', 'sie schlafen'], 'sie schauen über das Tal')
    ]))
];

export function textpaareFuer(etappe) {
  const e = Math.max(1, Math.min(2, etappe || 1));
  return TEXTPAARE.filter(t => t.etappe === e);
}

/* Prüft die Form eines Textpaars: je Text genau 3 Fragen, die Antwort ist
   immer eine der Optionen, und keine zwei Optionen sind gleich (auch nicht
   nur in Groß-/Kleinschreibung). */
function textPruefen(t) {
  return Array.isArray(t?.fragen) && t.fragen.length === 3 && t.fragen.every(f =>
    Array.isArray(f.optionen) && f.optionen.includes(f.antwort) &&
    new Set(f.optionen.map(o => String(o).toLowerCase())).size === f.optionen.length);
}
export function textpaarGueltig(paar) {
  return !!paar && textPruefen(paar.a) && textPruefen(paar.b);
}

/* ============================================================================
   Profil-Aussagen: rein beschreibend, aus inneren Vergleichen – NIE aus
   einer Norm oder einem Prozentrang. Schwellen sind hier dokumentiert und
   in tests/lesetest.mjs für je einen positiven und einen negativen Fall
   geprüft.

   werte = {
     woerter:   { proMinute, ausgelassenAnteil, fehlerarten },
     quatsch:   { proMinute },
     verstehen: { selbstRichtig, gehoertRichtig } | null,   // je 0..3
     tempoTakt: { stockungen, gleichmass } | null
   }
   ============================================================================ */
/* Wörter vs. Quatschwörter: Auch gut lesende Grundschulkinder lesen echte
   Wörter ganz normal deutlich schneller als Pseudowörter (Faktor ~1,5–2 ist
   üblich, weil echte Wörter über den Sichtwortschatz gelesen werden, nicht
   Buchstabe für Buchstabe). Eine reine Verhältnis-Schwelle würde deshalb bei
   fast jedem Kind anschlagen – irreführend. Erst wenn ZUSÄTZLICH die
   Quatschwörter-Geschwindigkeit selbst niedrig ist (echtes Entschlüsseln
   fällt schwer, nicht nur "Wörter sind schneller als Pseudowörter"), wird
   daraus eine Aussage. Beide Bedingungen müssen gelten. */
export const SCHWELLE_WORT_VS_QUATSCH = 2.0;           // Wörter/Min ≥ 2,0 × Quatschwörter/Min
export const SCHWELLE_QUATSCH_MAX_PRO_MINUTE = 20;     // UND Quatschwörter/Min unter dieser Grenze
export const SCHWELLE_HOERVERSTEHEN_BESSER = 2;  // gehört ≥ 2 Fragen besser als selbst gelesen
export const SCHWELLE_FEHLERART_ANTEIL = 0.4;    // eine Fehlerart macht ≥ 40 % aller Fehler aus
export const SCHWELLE_FEHLERART_MINDEST = 3;     // und kommt mindestens 3-mal vor
export const SCHWELLE_AUSLASSUNG_ANTEIL = 0.2;   // ≥ 20 % der Wörter wurden ausgelassen

const PROFIL_TEXTE = {
  wortbilder: 'Neue, unbekannte Wörter zu erlesen fällt noch deutlich schwerer als bekannte – Silbenübungen helfen genau dabei.',
  hoerverstehen: 'Versteht deutlich mehr, wenn vorgelesen wird, als beim eigenen Lesen – das Entschlüsseln bremst gerade das Verstehen aus, nicht die Sprache selbst.',
  wortbilder_aehnlich: 'Verwechselt öfter ähnlich aussehende Wörter – das genaue Hinsehen bis zum Wortende lohnt sich.',
  buchstaben_vertauscht: 'Vertauscht öfter einzelne Buchstaben (z. B. b/d/p/q) – das kommt bei Legasthenie häufig vor und lässt sich gezielt üben.',
  silbe_schwierig: 'Lässt beim Lesen öfter eine Silbe aus oder fügt eine hinzu – das Zerlegen in Silben hilft dabei, keine zu verlieren.',
  buchstabiert: 'Erliest längere Wörter noch oft Buchstabe für Buchstabe – der Sichtwortschatz für häufige Wörter kann das abkürzen.',
  geraten: 'Rät bei unbekannten Wörtern öfter, statt sie zu Ende zu lesen – genaues Lesen bis zum letzten Buchstaben beugt vor.',
  ueberspringt: 'Lässt öfter ganze Wörter aus – das deutet auf zügiges, aber zu wenig genaues Lesen hin.'
};

export function profilAussagen(werte) {
  const w = werte || {};
  const aussagen = [];
  const woerter = w.woerter || {};
  const quatsch = w.quatsch || {};
  const verstehen = w.verstehen;
  const tempoTakt = w.tempoTakt;

  if (Number.isFinite(woerter.proMinute) && Number.isFinite(quatsch.proMinute) && quatsch.proMinute > 0
    && woerter.proMinute >= quatsch.proMinute * SCHWELLE_WORT_VS_QUATSCH
    && quatsch.proMinute < SCHWELLE_QUATSCH_MAX_PRO_MINUTE) {
    aussagen.push({ id: 'wortbilder', text: PROFIL_TEXTE.wortbilder });
  }

  if (verstehen && Number.isFinite(verstehen.selbstRichtig) && Number.isFinite(verstehen.gehoertRichtig)
    && (verstehen.gehoertRichtig - verstehen.selbstRichtig) >= SCHWELLE_HOERVERSTEHEN_BESSER) {
    aussagen.push({ id: 'hoerverstehen', text: PROFIL_TEXTE.hoerverstehen });
  }

  const dominant = dominanteFehlerart(woerter.fehlerarten);
  if (dominant && dominant.anzahl >= SCHWELLE_FEHLERART_MINDEST && dominant.anteil >= SCHWELLE_FEHLERART_ANTEIL) {
    const zuordnung = {
      aehnlich_aussehend: 'wortbilder_aehnlich', vertauscht: 'buchstaben_vertauscht',
      silbe: 'silbe_schwierig', buchstabiert: 'buchstabiert', geraten: 'geraten'
    };
    const id = zuordnung[dominant.art];
    if (id) aussagen.push({ id, text: PROFIL_TEXTE[id] });
  }

  if (Number.isFinite(woerter.ausgelassenAnteil) && woerter.ausgelassenAnteil >= SCHWELLE_AUSLASSUNG_ANTEIL) {
    aussagen.push({ id: 'ueberspringt', text: PROFIL_TEXTE.ueberspringt });
  }

  return aussagen;
}

/* ============================================================================
   Empfehlungen: höchstens 3, priorisiert (niedrigere Zahl = dringender),
   in Alltagssprache, mit direktem Bezug auf vorhandene Übungen der App.

   | Auslöser (Profil-Aussage)                | Priorität | Empfehlung                          |
   |-------------------------------------------|-----------|--------------------------------------|
   | hoerverstehen                              | 1         | Echo-Lesen & wiederholtes Lautlesen  |
   | wortbilder_aehnlich                        | 1         | Wort-Detektiv                        |
   | buchstaben_vertauscht                      | 1         | b/d/p/q-Übung                        |
   | geraten                                    | 1         | Wort-Detektiv & Satz-Detektiv        |
   | ueberspringt                               | 2         | Satz-Detektiv                        |
   | silbe_schwierig                            | 2         | Silben-Baukasten                     |
   | buchstabiert                               | 2         | Blitzlesen                           |
   | Tempo&Takt: stockungen ≥ 2                 | 2         | Im Takt lesen                        |
   | wortbilder                                 | 3         | Silben-Baukasten & Blitzlesen        |
   | Tempo&Takt: gleichmass < 50                | 3         | Echo-Lesen                           |
   | eigener Text vorhanden (immer als Fallback)| 4         | Meine Texte weiterhin regelmäßig üben|
   ============================================================================ */
const EMPFEHLUNGS_REGELN = {
  hoerverstehen: { prioritaet: 1, text: 'Echo-Lesen üben – die App liest vor, danach liest das Kind denselben Satz nach.' },
  wortbilder_aehnlich: { prioritaet: 1, text: 'Wort-Detektiv spielen – trainiert genaues Erkennen ähnlicher Wortbilder.' },
  buchstaben_vertauscht: { prioritaet: 1, text: 'b/d/p/q-Übung spielen – genau gegen diese Verwechslung gemacht.' },
  geraten: { prioritaet: 1, text: 'Wort-Detektiv und Satz-Detektiv spielen – trainiert, ein Wort zu Ende zu lesen statt zu raten.' },
  ueberspringt: { prioritaet: 2, text: 'Satz-Detektiv spielen – schärft den Blick fürs genaue Lesen jedes Wortes.' },
  silbe_schwierig: { prioritaet: 2, text: 'Silben hören & bauen üben – trainiert das Zerlegen in Silben.' },
  buchstabiert: { prioritaet: 2, text: 'Blitzlesen üben – baut Sicherheit im Sichtwortschatz auf.' },
  wortbilder: { prioritaet: 3, text: 'Silben-Baukasten und Blitzlesen üben – hilft beim Entschlüsseln neuer Wörter.' },
  takt_stockungen: { prioritaet: 2, text: 'Im Takt lesen üben – gibt dem Lesen einen gleichmäßigen Rhythmus.' },
  takt_gleichmass: { prioritaet: 3, text: 'Echo-Lesen üben – hilft, den eigenen Lesefluss an einem Vorbild auszurichten.' },
  fallback: { prioritaet: 4, text: 'Weiter regelmäßig unter „Meine Texte" oder mit Vorlesen üben üben – kurze, häufige Übung wirkt am meisten.' }
};

export function empfehlungen(werte, max = 3) {
  const aussagen = profilAussagen(werte);
  const ausgeloest = new Set(aussagen.map(a => a.id));
  const tempoTakt = werte?.tempoTakt;
  if (tempoTakt?.stockungen >= 2) ausgeloest.add('takt_stockungen');
  if (Number.isFinite(tempoTakt?.gleichmass) && tempoTakt.gleichmass < 50) ausgeloest.add('takt_gleichmass');

  const liste = [...ausgeloest].map(id => EMPFEHLUNGS_REGELN[id]).filter(Boolean);
  liste.sort((a, b) => a.prioritaet - b.prioritaet);
  const gekuerzt = [];
  const gesehen = new Set();
  for (const e of liste) {
    if (gesehen.has(e.text)) continue;
    gesehen.add(e.text);
    gekuerzt.push(e.text);
    if (gekuerzt.length >= max) break;
  }
  return gekuerzt;
}

/* ============================================================================
   Verlauf: die letzten Testergebnisse eines Kindes (p.lesetests), höchstens
   LESETEST_VERLAUF_MAX Einträge, älteste fliegen zuerst heraus. Migration
   ist rein additiv wie beim Lernmotor (js/lernmotor.js).
   ============================================================================ */
export const LESETEST_VERLAUF_MAX = 24;

export function migriereZustand(p) {
  p.lesetests ||= [];
  return p;
}

export function verlaufSpeichern(liste, eintrag) {
  const neu = [...(Array.isArray(liste) ? liste : []), eintrag];
  if (neu.length > LESETEST_VERLAUF_MAX) neu.splice(0, neu.length - LESETEST_VERLAUF_MAX);
  return neu;
}

const MONATE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli',
  'August', 'September', 'Oktober', 'November', 'Dezember'];
export function datumKurz(datumISO) {
  const d = new Date(datumISO);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getDate()}. ${MONATE[d.getMonth()]}`;
}

/* Vergleich mit dem letzten Test – nur Wörter/Minute und Fehlerquote, weil
   das die zwei Zahlen sind, die Eltern am ehesten im Alltag wiedererkennen. */
export function verlaufVergleich(voriger, aktueller) {
  if (!voriger || !aktueller) return null;
  const diffTempo = (aktueller.woerter?.proMinute || 0) - (voriger.woerter?.proMinute || 0);
  const teile = [];
  if (diffTempo !== 0) {
    teile.push(`${diffTempo > 0 ? '+' : ''}${diffTempo} Wörter pro Minute seit dem ${datumKurz(voriger.datum)}`);
  } else {
    teile.push(`etwa gleich schnell wie am ${datumKurz(voriger.datum)}`);
  }
  return { diffTempo, text: teile.join(', ') };
}

/* Freundliche Erinnerung, kein Druck: der letzte Test liegt mehr als vier
   Wochen zurück (oder es gab noch nie einen). */
export const ERINNERUNG_TAGE = 28;
export function erinnerungFaellig(letzterTestISO, jetzt = Date.now()) {
  if (!letzterTestISO) return true;
  const alterMs = jetzt - new Date(letzterTestISO).getTime();
  return alterMs >= ERINNERUNG_TAGE * 86400000;
}
