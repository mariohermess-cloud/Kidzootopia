/* Prueft Echo-Lesen und Takt-Lesen (js/lesemodi.js): reine Logik, ohne DOM
   und ohne Audio. Die sichtbare Markierung (Ball, Silbenfaerbung) prueft
   tests/e2e.mjs per Screenshot. */

import {
  neuerLesemodusZustand, modusEmpfehlung, echoStufeName, echoAnpassen,
  taktMessen, taktVorgabe, taktAnpassen, taktRueckmeldung,
  silbenPlan, silbeBeiZeichen, wortBeiZeichen, silbenDesWorts,
  zeitplanErstellen, silbeBeiZeit, einzaehlPlan, taktSchlagfolge,
  messungVerwertbar, saetzeTeilen, huellkurvenVerketten, stilleEndeErkannt,
  wortSilbenZeitplan, ECHO_STILLE_MS, ECHO_STILLE_IST_KEINE_STOCKUNG,
  TAKT_MIN, TAKT_MAX, TAKT_START_SILBEN_PRO_MIN
} from '../js/lesemodi.js';
import { auswerten as leseAuswerten, STOCKUNG_MS } from '../js/lesen.js';

let fehler = 0;
const pruefe = (bedingung, text) => {
  console.log(`${bedingung ? '✅' : '❌'} ${text}`);
  if (!bedingung) fehler++;
};

/* ------------------------------------------------------------ taktMessen */

/* Gleichmässige Gipfel alle 300ms -> Median 300ms -> 200 Silben/Minute,
   perfektes Gleichmass, keine Brueche. */
const gleichmaessig = Array.from({ length: 10 }, (_, i) => ({ ms: i * 300 }));
const g1 = taktMessen(gleichmaessig);
pruefe(g1 !== null, 'gleichmässige Gipfel ergeben ein Ergebnis');
pruefe(g1.silbenProMin === 200, `200 Silben/Minute bei 300ms Abstand (${g1?.silbenProMin})`);
pruefe(g1.gleichmass === 100, `perfektes Gleichmass bei exakt gleichen Abständen (${g1?.gleichmass})`);
pruefe(g1.taktBrueche === 0, `keine Taktbrüche ohne Ausreißer (${g1?.taktBrueche})`);

/* Zahlen statt {ms:...} werden ebenso akzeptiert. */
const alsZahlen = Array.from({ length: 6 }, (_, i) => i * 250);
pruefe(taktMessen(alsZahlen)?.silbenProMin === 240, 'akzeptiert auch reine Zahlen statt {ms}-Objekte');

/* Eine echte Satzpause (> 600ms) darf den gemessenen Takt nicht verfälschen -
   sie wird herausgenommen, der Rest bleibt gleichmässig. */
const mitSatzpause = [0, 300, 600, 900, 1800, 2100, 2400, 2700].map(ms => ({ ms }));
const g2 = taktMessen(mitSatzpause);
pruefe(g2 !== null, 'mit einer Satzpause weiterhin ein Ergebnis');
pruefe(g2.silbenProMin === 200, `Satzpause verfälscht das Tempo nicht (${g2?.silbenProMin})`);
pruefe(g2.taktBrueche === 0, 'eine herausgerechnete Satzpause zählt nicht als Taktbruch');

/* Ein echter Stolperer MITTEN im Sprechen (unter der Pausengrenze, aber
   deutlich länger als der Median) zählt dagegen als Taktbruch. */
const mitStolperer = [0, 250, 500, 750, 1300, 1550, 1800, 2050].map(ms => ({ ms }));
const g3 = taktMessen(mitStolperer);
pruefe(g3 !== null && g3.taktBrueche >= 1, `ein Stolperer unter der Pausengrenze wird als Taktbruch gezählt (${g3?.taktBrueche})`);

/* Zu wenige Gipfel: robust null statt eines geratenen Werts. */
pruefe(taktMessen([]) === null, 'keine Gipfel -> null');
pruefe(taktMessen([{ ms: 0 }, { ms: 300 }]) === null, 'zwei Gipfel (ein Abstand) -> null, zu wenig für einen Median');
pruefe(taktMessen(null) === null, 'ungültige Eingabe -> null, kein Absturz');
pruefe(taktMessen([{ ms: 0 }, { ms: 900 }, { ms: 1800 }]) === null,
  'nur Abstände über der Pausengrenze -> null, kein erfundener Wert');

/* ----------------------------------------------------------- taktVorgabe */

pruefe(taktVorgabe(neuerLesemodusZustand()) === TAKT_START_SILBEN_PRO_MIN,
  'ohne jede Messung: ruhiges Start-Tempo (60 Silben/Minute)');

const zustandMitVerlauf = { verlauf: [
  { silbenProMin: 100 }, { silbenProMin: 120 }, { silbenProMin: 110 },
  { silbenProMin: 130 }, { silbenProMin: 90 }
]};
// Median von [100,120,110,130,90] = 110, davon 90% = 99
pruefe(taktVorgabe(zustandMitVerlauf) === 99,
  `90% des Medians der letzten 5 Messungen (${taktVorgabe(zustandMitVerlauf)})`);

const nurLetzte5 = { verlauf: [
  { silbenProMin: 400 }, // soll nicht mehr zählen (älter als die letzten 5)
  { silbenProMin: 100 }, { silbenProMin: 120 }, { silbenProMin: 110 },
  { silbenProMin: 130 }, { silbenProMin: 90 }
]};
pruefe(taktVorgabe(nurLetzte5) === 99, 'nur die letzten fünf Messungen zählen, ältere nicht');

pruefe(taktVorgabe({ verlauf: [{ silbenProMin: 1000 }] }) <= TAKT_MAX,
  'die Vorgabe bleibt innerhalb der Obergrenze');
pruefe(taktVorgabe({ verlauf: [{ silbenProMin: 1 }] }) >= TAKT_MIN,
  'die Vorgabe bleibt innerhalb der Untergrenze');

/* ---------------------------------------------------------- taktAnpassen */

/* Takt gehalten -> ein kleiner Schritt schneller, nie mehr als +5%. */
const gehalten = { silbenProMin: 100, gleichmass: 80, taktBrueche: 0 };
pruefe(taktAnpassen(100, gehalten) === 105, `Takt gehalten -> +5% (${taktAnpassen(100, gehalten)})`);
pruefe(taktAnpassen(100, { silbenProMin: 200, gleichmass: 100, taktBrueche: 0 }) === 105,
  'nie mehr als +5% pro Runde, auch wenn viel schneller gelesen wurde');

/* Deutlich zu langsam oder viele Brüche -> ein Schritt langsamer. */
const zuLangsam = { silbenProMin: 70, gleichmass: 80, taktBrueche: 0 };
pruefe(taktAnpassen(100, zuLangsam) === 95, `deutlich unter der Vorgabe -> -5% (${taktAnpassen(100, zuLangsam)})`);
const vieleBrueche = { silbenProMin: 100, gleichmass: 80, taktBrueche: 6 };
pruefe(taktAnpassen(100, vieleBrueche) === 95, 'viele Taktbrüche -> -5%, auch bei passendem Tempo');

/* Dazwischen: unveraendert. */
const mittendrin = { silbenProMin: 90, gleichmass: 50, taktBrueche: 1 };
pruefe(taktAnpassen(100, mittendrin) === 100, 'weder besonders gut noch besonders schwach -> unverändert');

/* Grenzen werden nie überschritten. */
pruefe(taktAnpassen(TAKT_MAX, { silbenProMin: TAKT_MAX, gleichmass: 80, taktBrueche: 0 }) === TAKT_MAX,
  'die Obergrenze wird nie überschritten');
pruefe(taktAnpassen(TAKT_MIN, { silbenProMin: TAKT_MIN * 0.5, gleichmass: 80, taktBrueche: 0 }) === TAKT_MIN,
  'die Untergrenze wird nie unterschritten');
pruefe(taktAnpassen(100, null) === 100, 'ohne Messung bleibt die Vorgabe unverändert');

pruefe(taktRueckmeldung(100, gehalten).includes('Takt gehalten'), 'Rückmeldung bei gehaltenem Takt ohne Tadel');
pruefe(!taktRueckmeldung(100, zuLangsam).includes('Takt gehalten'), 'andere Rückmeldung, wenn es nicht ganz reichte');
pruefe(!/falsch|schlecht|Fehler/i.test(taktRueckmeldung(100, zuLangsam)), 'auch die schwächere Rückmeldung enthält keinen Tadel');

/* ----------------------------------------------------------- echoAnpassen */

const start = neuerLesemodusZustand();
pruefe(start.echoStufe === 1, 'neuer Zustand beginnt bei Stufe 1 (meiste Hilfe)');

let z = start;
z = echoAnpassen(z, { stufe: 4, stockungen: 0, tempo: 150, medianTempo: 140 }); // 1. gute Lesung
pruefe(z.echoStufe === 1, 'nach EINER guten Lesung bleibt die Stufe noch gleich');
z = echoAnpassen(z, { stufe: 4, stockungen: 0, tempo: 150, medianTempo: 140 }); // 2. gute Lesung in Folge
pruefe(z.echoStufe === 2, `nach ZWEI guten Lesungen in Folge sinkt die Hilfe (${z.echoStufe})`);

/* Auch "nur wenig gestockt bei ordentlichem Tempo" zählt als gute Lesung,
   selbst ohne beste Einordnungsstufe. */
let z2 = neuerLesemodusZustand();
z2 = echoAnpassen(z2, { stufe: 2, stockungen: 1, tempo: 130, medianTempo: 140 });
z2 = echoAnpassen(z2, { stufe: 2, stockungen: 1, tempo: 130, medianTempo: 140 });
pruefe(z2.echoStufe === 2, 'wenig Stockungen bei ausreichendem Tempo zählt ebenfalls als gute Lesung');

/* Zwei schwache Lesungen heben die Hilfe wieder an (= echoStufe sinkt, denn
   Stufe 1 ist die Stufe mit der meisten Hilfe). */
let z3 = { ...neuerLesemodusZustand(), echoStufe: 2 };
z3 = echoAnpassen(z3, { stufe: 1, stockungen: 5, tempo: 40, medianTempo: 140 });
pruefe(z3.echoStufe === 2, 'nach EINER schwachen Lesung bleibt die Stufe noch gleich');
z3 = echoAnpassen(z3, { stufe: 1, stockungen: 5, tempo: 40, medianTempo: 140 });
pruefe(z3.echoStufe === 1, `nach ZWEI schwachen Lesungen in Folge steigt die Hilfe wieder (${z3.echoStufe})`);

/* Eine mittlere Lesung unterbricht die Zählung, ohne selbst etwas zu ändern. */
let z4 = neuerLesemodusZustand();
z4 = echoAnpassen(z4, { stufe: 4, stockungen: 0, tempo: 150, medianTempo: 140 });
z4 = echoAnpassen(z4, { stufe: 2, stockungen: 3, tempo: 80, medianTempo: 140 }); // mittel
z4 = echoAnpassen(z4, { stufe: 4, stockungen: 0, tempo: 150, medianTempo: 140 });
pruefe(z4.echoStufe === 1, 'eine mittlere Lesung dazwischen unterbricht die Zählfolge (keine Stufensenkung nach nur 2 von 3)');

/* Grenzen 1..3 werden nie verlassen. */
let z5 = { ...neuerLesemodusZustand(), echoStufe: 3 };
for (let i = 0; i < 6; i++) z5 = echoAnpassen(z5, { stufe: 4, stockungen: 0, tempo: 150, medianTempo: 140 });
pruefe(z5.echoStufe === 3, 'Stufe steigt nie über 3, auch bei dauerhaft guten Lesungen');

let z6 = { ...neuerLesemodusZustand(), echoStufe: 1 };
for (let i = 0; i < 6; i++) z6 = echoAnpassen(z6, { stufe: 1, stockungen: 6, tempo: 30, medianTempo: 140 });
pruefe(z6.echoStufe === 1, 'Stufe sinkt nie unter 1, auch bei dauerhaft schwachen Lesungen');

pruefe(echoStufeName(1).length > 0 && echoStufeName(2).length > 0 && echoStufeName(3).length > 0,
  'jede Stufe hat einen verständlichen Namen für den Eltern-Bereich');
pruefe(modusEmpfehlung({ echoStufe: 1 }) === 'echo', 'Stufe 1 empfiehlt Echo-Lesen');
pruefe(modusEmpfehlung({ echoStufe: 2 }) === 'echo', 'Stufe 2 empfiehlt weiterhin Echo-Lesen');
pruefe(modusEmpfehlung({ echoStufe: 3 }) === 'takt', 'Stufe 3 empfiehlt Takt-Lesen statt Echo');

/* ------------------------------------------------------------ silbenPlan */

const text = 'Die Sonne, sie scheint. Ein Vogel singt.';
const plan = silbenPlan(text);
pruefe(plan.length > 0, 'silbenPlan liefert Silben für einen echten Text');
pruefe(plan.every((s, i) => s.index === i), 'jede Silbe hat eine fortlaufende, eindeutige Nummer');
pruefe(plan.some(s => s.komma), 'ein Komma im Text wird als solches erkannt');
pruefe(plan.some(s => s.satzEnde), 'ein Satzende im Text wird als solches erkannt');
pruefe(plan[plan.length - 1].satzEnde === true, 'die letzte Silbe vor dem Schlusspunkt trägt satzEnde');

/* Wort/Silben-Zuordnung aus charIndex - genau das, was onboundary liefert. */
const ersteWortStart = plan[0].vonZeichen;
pruefe(silbeBeiZeichen(plan, ersteWortStart) === 0, 'charIndex am Textanfang trifft die erste Silbe');
const zweitesWort = plan.find(s => s.wortIndex === 1 && s.imWort === 0);
pruefe(silbeBeiZeichen(plan, zweitesWort.vonZeichen) === zweitesWort.index,
  'charIndex am Wortanfang trifft genau die erste Silbe dieses Wortes');
pruefe(silbeBeiZeichen(plan, zweitesWort.vonZeichen + 1) === zweitesWort.index,
  'ein charIndex mitten im Wort trifft weiterhin die zuletzt begonnene Silbe (keine Silbe übersprungen)');
pruefe(wortBeiZeichen(plan, zweitesWort.vonZeichen) === 1, 'wortBeiZeichen liefert den richtigen Wortindex');
pruefe(silbeBeiZeichen(plan, -1) === -1 || silbeBeiZeichen(plan, -1) === 0,
  'ein charIndex vor dem Text stürzt nicht ab');
pruefe(silbeBeiZeichen([], 0) === -1, 'ein leerer Plan liefert -1, keinen Fantasiewert');

const woSilben = silbenDesWorts(plan, 0);
pruefe(woSilben.length > 0 && woSilben.every(s => s.wortIndex === 0),
  'silbenDesWorts liefert nur Silben des angefragten Wortes');

/* ------------------------------------------------------- zeitplanErstellen */

const zeitplan = zeitplanErstellen(text, { tempo: 0.85 });
pruefe(zeitplan.silben.length === plan.length, 'der Zeitplan enthält jede Silbe genau einmal');
pruefe(new Set(zeitplan.silben.map(s => s.index)).size === zeitplan.silben.length,
  'keine Silbe kommt im Zeitplan doppelt vor');
pruefe(zeitplan.silben.every((s, i) => i === 0 || s.startMs >= zeitplan.silben[i - 1].startMs),
  'die Startzeiten der Silben laufen der Reihe nach vorwärts');
pruefe(zeitplan.gesamtMs > 0, 'der Zeitplan hat eine plausible Gesamtdauer über Null');

/* Ein Satz ohne jedes Satzzeichen dazwischen als Vergleich: der Zeitplan mit
   Komma und Satzende MUSS länger dauern als einer ohne, weil Pausen
   dazukommen - das ist der Beleg, dass Satzzeichen-Pausen wirklich wirken. */
const ohneZeichen = 'Die Sonne sie scheint Ein Vogel singt';
const zeitplanOhne = zeitplanErstellen(ohneZeichen, { tempo: 0.85 });
pruefe(zeitplan.gesamtMs > zeitplanOhne.gesamtMs,
  `Satzzeichen-Pausen verlängern den Zeitplan spürbar (${zeitplan.gesamtMs} vs. ${zeitplanOhne.gesamtMs})`);

const langsamer = zeitplanErstellen(text, { tempo: 0.5 });
const schneller = zeitplanErstellen(text, { tempo: 1.2 });
pruefe(langsamer.gesamtMs > schneller.gesamtMs, 'ein kleineres Tempo ergibt einen längeren Zeitplan');

pruefe(silbeBeiZeit(zeitplan, 0) === 0, 'zur Startzeit ist die erste Silbe dran');
pruefe(silbeBeiZeit(zeitplan, zeitplan.gesamtMs + 1000) === zeitplan.silben.length - 1,
  'nach Ende des Zeitplans bleibt die letzte Silbe dran, statt abzustürzen');
pruefe(silbeBeiZeit(zeitplan, -1) === -1, 'eine negative Zeit liefert -1, keinen Fantasiewert');
pruefe(silbeBeiZeit({ silben: [] }, 0) === -1, 'ein leerer Zeitplan liefert -1');

/* Über den gesamten Zeitplan hinweg muss die per silbeBeiZeit gefundene
   Silbe monoton weiterlaufen (nie rückwärts springen). */
let letzte = -1, rueckwaerts = false;
for (let ms = 0; ms <= zeitplan.gesamtMs; ms += 25) {
  const i = silbeBeiZeit(zeitplan, ms);
  if (i < letzte) rueckwaerts = true;
  letzte = i;
}
pruefe(!rueckwaerts, 'die Markierung läuft über die Zeit nur vorwärts, nie zurück');

/* ------------------------------------------------------------ Einzähltakt */

const einzaehl = einzaehlPlan(120);
pruefe(einzaehl.length === 4 && einzaehl[3].wort === 'los', 'der Einzähltakt endet mit "los"');
pruefe(einzaehl.every((e, i) => i === 0 || e.startMs > einzaehl[i - 1].startMs),
  'die Einzähl-Schläge folgen der Reihe nach');

/* ---------------------------------------------------------- Schlagfolge */

const schlagfolge = taktSchlagfolge(text, 120);
pruefe(schlagfolge.silben.length === plan.length, 'die Schlagfolge enthält jede Silbe genau einmal');
pruefe(schlagfolge.gesamtMs > plan.length * schlagfolge.schlagMs,
  'Satzzeichen verlängern auch die Schlagfolge (zusätzliche Schläge Pause)');

/* ------------------------------------------------------- messungVerwertbar */

pruefe(messungVerwertbar({ modus: 'allein' }) === true, 'Allein-Lesen ist immer verwertbar');
pruefe(messungVerwertbar({ modus: 'echo', echoStufe: 1 }) === true,
  'Echo Stufe 1 (hören, dann eigenständig lesen) ist verwertbar - die App spricht dabei nicht gleichzeitig');
pruefe(messungVerwertbar({ modus: 'echo', echoStufe: 2 }) === false,
  'Echo Stufe 2 (Chorlesen) ist NICHT verwertbar - die eigene Stimme läuft mit');
pruefe(messungVerwertbar({ modus: 'echo', echoStufe: 3 }) === true,
  'Echo Stufe 3 (allein) ist verwertbar');
pruefe(messungVerwertbar({ modus: 'takt', klick: false }) === true,
  'Takt ohne Klick ist verwertbar');
pruefe(messungVerwertbar({ modus: 'takt', klick: true }) === false,
  'Takt MIT Klick ist NICHT verwertbar - der Klickton landet im Mikrofon');
pruefe(messungVerwertbar({}) === true, 'ohne Angaben (z. B. alter Datensatz) gilt als verwertbar');

/* ------------------------------------------------------------ saetzeTeilen */

pruefe(saetzeTeilen('') .length === 0, 'leerer Text ergibt keine Sätze');
const dreiSaetze = saetzeTeilen('Die Sonne scheint. Ein Vogel singt. Lena lacht.');
pruefe(dreiSaetze.length === 3, `drei Sätze werden auch als drei erkannt (${dreiSaetze.length})`);
pruefe(dreiSaetze[0] === 'Die Sonne scheint.', `erster Satz korrekt geschnitten ("${dreiSaetze[0]}")`);
const mitAbkuerzung = saetzeTeilen('Dr. Müller kommt. Er hat z. B. einen Hund.');
pruefe(mitAbkuerzung.length === 2,
  `Abkürzungen ("Dr.", "z. B.") zählen nicht als Satzende (${mitAbkuerzung.length} Sätze: ${JSON.stringify(mitAbkuerzung)})`);
const mitOrdnungszahl = saetzeTeilen('Er geht in die 3. Klasse. Das freut ihn.');
pruefe(mitOrdnungszahl.length === 2,
  `eine Ordnungszahl ("3.") zählt nicht als Satzende (${mitOrdnungszahl.length} Sätze)`);

/* -------------------------------------------------------- huellkurvenVerketten */

pruefe(JSON.stringify(huellkurvenVerketten([])) === '[]', 'keine Segmente ergeben eine leere Hüllkurve');
const verkettet = huellkurvenVerketten([[1, 1], [2, 2]], { stilleMs: 40, schrittMs: 20 });
pruefe(verkettet.length === 2 + 2 + 2, `Stille zwischen den Segmenten wird eingefügt (${verkettet.length} Werte)`);
pruefe(JSON.stringify(verkettet) === JSON.stringify([1, 1, 0, 0, 2, 2]),
  `genau in der richtigen Reihenfolge verkettet (${JSON.stringify(verkettet)})`);
pruefe(JSON.stringify(huellkurvenVerketten([[5, 5]], { stilleMs: 40, schrittMs: 20 })) === JSON.stringify([5, 5]),
  'ein einzelnes Segment bekommt keine Stille davor');

/* ------------------------------------------------------- stilleEndeErkannt */

const schrittTest = 25;
const kurveAusMuster = muster => {
  const werte = [];
  for (const { ms, laut } of muster) {
    const n = Math.round(ms / schrittTest);
    for (let i = 0; i < n; i++) werte.push(laut ? 0.6 : 0.01);
  }
  return werte;
};

const gesprochenDannStill = kurveAusMuster([{ ms: 500, laut: 1 }, { ms: 1400, laut: 0 }]);
pruefe(stilleEndeErkannt(gesprochenDannStill, schrittTest) === true,
  'nach echtem Sprechen und langer Stille wird das Ende erkannt');

const nochAmSprechen = kurveAusMuster([{ ms: 500, laut: 1 }, { ms: 300, laut: 0 }]);
pruefe(stilleEndeErkannt(nochAmSprechen, schrittTest) === false,
  'eine kurze Pause (300ms) reicht nicht als Ende - das Kind macht evtl. nur eine Sprechpause');

const nieGesprochen = kurveAusMuster([{ ms: 2000, laut: 0 }]);
pruefe(stilleEndeErkannt(nieGesprochen, schrittTest) === false,
  'Stille von Anfang an ohne jemals gesprochen zu haben ist KEIN erkanntes Ende (sonst bräche die Aufnahme sofort ab)');

pruefe(stilleEndeErkannt([], schrittTest) === false, 'leere Hüllkurve stürzt nicht ab und erkennt kein Ende');
pruefe(stilleEndeErkannt(null, schrittTest) === false, 'null stürzt nicht ab');

/* --------------------------------------------------- Satzpause ist keine Stockung */

pruefe(ECHO_STILLE_IST_KEINE_STOCKUNG === true,
  `die eingefügte Stille (${ECHO_STILLE_MS}ms) bleibt unter STOCKUNG_MS (${STOCKUNG_MS}ms)`);

/* Zwei "Kind-Segmente" (durchgehend gesprochen, keine interne Pause) werden
   mit der echten huellkurvenVerketten()-Stille verbunden und wie EIN
   Lesetext ausgewertet - die künstliche Pause an der Satzgrenze darf nicht
   als "Stockung" (mehr Pausen als Satzzeichen) durchschlagen. */
const satzSchritt = 10; // wie SCHRITT_STANDARD in js/aussprache.js
const segment = ms => Array.from({ length: Math.round(ms / satzSchritt) }, () => 0.6);
const kindSegmente = [segment(1200), segment(1400)];
const verketteteAufnahme = huellkurvenVerketten(kindSegmente, { stilleMs: ECHO_STILLE_MS, schrittMs: satzSchritt });
const satzText = 'Die Katze schläft. Der Hund spielt.';
const echoWerte = leseAuswerten(verketteteAufnahme, { text: satzText, schrittMs: satzSchritt });
pruefe(echoWerte.stockungen === 0,
  `eine an der Satzgrenze eingefügte Stille (${ECHO_STILLE_MS}ms) zählt nicht als Stockung (${echoWerte.stockungen})`);

/* -------------------------------------------------------- wortSilbenZeitplan */

const wortSilben = silbenDesWorts(silbenPlan('Sonnenblume blüht.'), 0);
pruefe(wortSilben.length >= 2, 'Testwort hat mehrere Silben (Voraussetzung für den Test)');
const wortZeitplan = wortSilbenZeitplan(wortSilben, 0.85);
pruefe(wortZeitplan.length === wortSilben.length, 'jede Silbe des Wortes bekommt einen Zeitpunkt');
pruefe(wortZeitplan[0].startMs === 0, 'die erste Silbe des Wortes beginnt bei 0');
pruefe(wortZeitplan.every((s, i) => i === 0 || s.startMs > wortZeitplan[i - 1].startMs),
  'die Silben des Wortes folgen der Reihe nach, jede später als die vorige');
pruefe(wortSilbenZeitplan([]).length === 0, 'ein Wort ohne Silben ergibt einen leeren Zeitplan');

console.log(fehler === 0 ? '\nEcho-Lesen und Takt-Lesen sind brauchbar ✅' : `\n${fehler} Problem(e) ❌`);
process.exit(fehler === 0 ? 0 : 1);
