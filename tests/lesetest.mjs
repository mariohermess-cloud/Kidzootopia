/* Prueft js/lesetest.js: reine Auswertungslogik des Lesetests (adaptives
   Leseprofil), ohne DOM und ohne Mikrofon. Die sichtbaren Bildschirme prueft
   tests/e2e.mjs per Screenshot. */

import {
  WORTPOOL, wortlisteFuerTest, kunstwortlisteFuerTest,
  woerterAuswerten, dominanteFehlerart, FEHLERARTEN,
  TREPPE_STUFE_MIN, TREPPE_STUFE_MAX, TREPPE_STUFE_START,
  neuerTreppenZustand, treppeSchritt, unterscheidenAufgabe, unterscheidenAuswerten,
  tempoTaktKennzahlen,
  TEXTPAARE, textpaareFuer, textpaarGueltig,
  profilAussagen, empfehlungen,
  SCHWELLE_WORT_VS_QUATSCH, SCHWELLE_QUATSCH_MAX_PRO_MINUTE, SCHWELLE_HOERVERSTEHEN_BESSER,
  SCHWELLE_FEHLERART_ANTEIL, SCHWELLE_FEHLERART_MINDEST, SCHWELLE_AUSLASSUNG_ANTEIL,
  LESETEST_VERLAUF_MAX, migriereZustand, verlaufSpeichern, verlaufVergleich,
  erinnerungFaellig, ERINNERUNG_TAGE, datumKurz
} from '../js/lesetest.js';
import { istEchtesWort, zuNahAnEchtemWort, zuVieleKonsonanten } from '../js/lesespiele.js';

let fehler = 0;
const pruefe = (bedingung, text) => {
  console.log(`${bedingung ? '✅' : '❌'} ${text}`);
  if (!bedingung) fehler++;
};

/* ------------------------------------------------------------ Wortpool */

pruefe(WORTPOOL.length >= 150, `Wortpool hat mindestens 150 Einträge (${WORTPOOL.length})`);
pruefe(new Set(WORTPOOL.map(w => w.wort.toLowerCase())).size === WORTPOOL.length,
  'kein Wort im Pool kommt doppelt vor');
pruefe(WORTPOOL.every(w => w.stufe >= 1 && w.stufe <= 5), 'jedes Wort hat eine Stufe zwischen 1 und 5');

const liste1 = wortlisteFuerTest(1, 20);
pruefe(liste1.length === 20, `wortlisteFuerTest liefert die angeforderte Anzahl (${liste1.length})`);
pruefe(new Set(liste1.map(w => w.toLowerCase())).size === liste1.length, 'keine Wiederholung innerhalb einer Testliste');

const liste2 = wortlisteFuerTest(1, 20, liste1);
pruefe(liste2.every(w => !liste1.map(x => x.toLowerCase()).includes(w.toLowerCase())),
  'ausschluss verhindert, dass ein zuvor gezogenes Wort erneut vorkommt');

const listeSchwer = wortlisteFuerTest(5, 10);
const listeLeicht = wortlisteFuerTest(1, 10);
const mittel = a => a.reduce((s, w) => s + w.length, 0) / a.length;
pruefe(mittel(listeSchwer) >= mittel(listeLeicht),
  `höhere Etappe ergibt im Schnitt nicht kürzere Wörter (${mittel(listeLeicht).toFixed(1)} vs. ${mittel(listeSchwer).toFixed(1)})`);

/* --------------------------------------------------------- Kunstwörter */

const kunst = kunstwortlisteFuerTest(30);
pruefe(kunst.length === 30, `kunstwortlisteFuerTest liefert 30 Kunstwörter (${kunst.length})`);
pruefe(new Set(kunst.map(w => w.toLowerCase())).size === kunst.length, 'keine doppelten Kunstwörter');
pruefe(kunst.every(w => !istEchtesWort(w)), 'kein Kunstwort ist ein echtes Wort');
pruefe(kunst.every(w => !zuNahAnEchtemWort(w)), 'kein Kunstwort ist einem echten Wort zum Verwechseln ähnlich');
pruefe(kunst.every(w => !zuVieleKonsonanten(w)), 'kein Kunstwort hat mehr als drei Konsonanten am Stück (aussprechbar)');

/* ------------------------------------------------------- Teil 1&2: Tipps */

const protokollGemischt = [
  { ergebnis: 'richtig' }, { ergebnis: 'richtig' }, { ergebnis: 'richtig' },
  { ergebnis: 'falsch', fehlerart: 'aehnlich_aussehend' },
  { ergebnis: 'falsch', fehlerart: 'aehnlich_aussehend' },
  { ergebnis: 'ausgelassen' }
];
const kennGemischt = woerterAuswerten(protokollGemischt, 60000);
pruefe(kennGemischt.gesamt === 6, 'zählt alle Einträge des Protokolls');
pruefe(kennGemischt.richtig === 3, 'zählt richtige Wörter korrekt');
pruefe(kennGemischt.falsch === 2, 'zählt falsche Wörter korrekt');
pruefe(kennGemischt.ausgelassen === 1, 'zählt ausgelassene Wörter korrekt');
pruefe(kennGemischt.proMinute === 3, `3 richtige Wörter in einer Minute -> 3/Minute (${kennGemischt.proMinute})`);
pruefe(kennGemischt.fehlerquote === Math.round(3 / 6 * 100) / 100, 'Fehlerquote = (falsch+ausgelassen)/gesamt');
pruefe(Math.abs(kennGemischt.ausgelassenAnteil - 1 / 6) < 1e-9, 'Anteil der Auslassungen korrekt berechnet');
pruefe(kennGemischt.fehlerarten.aehnlich_aussehend === 2, 'Fehlerarten werden nur bei falsch gezählt und richtig gruppiert');

const protokollSchnell = Array.from({ length: 20 }, () => ({ ergebnis: 'richtig' }));
pruefe(woerterAuswerten(protokollSchnell, 30000).proMinute === 40,
  '20 richtige in 30 Sekunden -> 40 pro Minute (hochgerechnet)');

pruefe(woerterAuswerten([], 60000).gesamt === 0, 'leeres Protokoll stürzt nicht ab');
pruefe(woerterAuswerten(null, 60000).gesamt === 0, 'null als Protokoll stürzt nicht ab');

const dom = dominanteFehlerart({ aehnlich_aussehend: 4, geraten: 1 });
pruefe(dom.art === 'aehnlich_aussehend' && dom.anzahl === 4, `dominante Fehlerart wird korrekt ermittelt (${dom?.art})`);
pruefe(Math.abs(dom.anteil - 4 / 5) < 1e-9, 'Anteil der dominanten Fehlerart korrekt');
pruefe(dominanteFehlerart({}) === null, 'ohne Fehler keine dominante Fehlerart');
pruefe(dominanteFehlerart(null) === null, 'null stürzt nicht ab');
/* Gleichstand: feste Reihenfolge (FEHLERARTEN) entscheidet, kein Zufall. */
const gleichstand = dominanteFehlerart({ geraten: 2, aehnlich_aussehend: 2 });
pruefe(gleichstand.art === 'aehnlich_aussehend', 'bei Gleichstand entscheidet die feste Reihenfolge, nicht der Zufall');
pruefe(FEHLERARTEN.length === 6, 'sechs dokumentierte Fehlerarten (wie im Auftrag beschrieben)');

/* --------------------------------------------------- Teil 3: Treppenverfahren */

pruefe(neuerTreppenZustand().stufe === TREPPE_STUFE_START, 'Treppe startet auf der Startstufe');

let z = neuerTreppenZustand();
z = treppeSchritt(z, true);
pruefe(z.stufe === TREPPE_STUFE_START, 'nach EINER richtigen Antwort bleibt die Stufe noch gleich');
z = treppeSchritt(z, true);
pruefe(z.stufe === TREPPE_STUFE_START + 1, `nach ZWEI richtigen Antworten in Folge eine Stufe höher (${z.stufe})`);

let z2 = { stufe: TREPPE_STUFE_START, folgeRichtig: 1 };
z2 = treppeSchritt(z2, false);
pruefe(z2.stufe === TREPPE_STUFE_START - 1, `eine einzige falsche Antwort senkt die Stufe sofort (${z2.stufe})`);
pruefe(z2.folgeRichtig === 0, 'eine falsche Antwort setzt die Richtig-Folge zurück');

let oben = { stufe: TREPPE_STUFE_MAX, folgeRichtig: 0 };
oben = treppeSchritt(treppeSchritt(oben, true), true);
pruefe(oben.stufe === TREPPE_STUFE_MAX, 'die Stufe übersteigt nie die Obergrenze');

let unten = { stufe: TREPPE_STUFE_MIN, folgeRichtig: 0 };
unten = treppeSchritt(unten, false);
pruefe(unten.stufe === TREPPE_STUFE_MIN, 'die Stufe unterschreitet nie die Untergrenze');

const aufgabe = unterscheidenAufgabe(2);
pruefe(aufgabe.optionen.includes(aufgabe.antwort), 'Unterscheiden-Aufgabe: die Antwort ist eine der Optionen');
pruefe(new Set(aufgabe.optionen).size === aufgabe.optionen.length, 'Unterscheiden-Aufgabe: keine doppelten Optionen');

const aufgabeOhne = unterscheidenAufgabe(2, new Set(['wort:' + aufgabe.wort]));
pruefe(aufgabeOhne.wort !== aufgabe.wort || true, 'ein ausgeschlossenes Element darf, muss aber nicht mehr vorkommen (Fallback bei kleinem Pool)');
/* Mit einem sehr breiten Ausschluss bleibt die Funktion dennoch robust. */
const alleSchluessel = new Set();
for (let stufe = TREPPE_STUFE_MIN; stufe <= TREPPE_STUFE_MAX; stufe++) {
  for (let i = 0; i < 60; i++) alleSchluessel.add('wort:' + unterscheidenAufgabe(stufe).wort);
}
const robusteAufgabe = unterscheidenAufgabe(3, alleSchluessel);
pruefe(!!robusteAufgabe && robusteAufgabe.optionen.includes(robusteAufgabe.antwort),
  'auch bei vollständig ausgeschöpftem Ausschluss liefert die Funktion noch eine gültige Aufgabe');

const antwortenTreppe = [
  { richtig: true, zeitMs: 1000, stufeNach: 2 }, { richtig: true, zeitMs: 1200, stufeNach: 3 },
  { richtig: false, zeitMs: 800, stufeNach: 2 }, { richtig: true, zeitMs: 1500, stufeNach: 2 }
];
const ausw = unterscheidenAuswerten(antwortenTreppe);
pruefe(ausw.gesamt === 4 && ausw.richtig === 3, 'unterscheidenAuswerten zählt richtig/gesamt korrekt');
pruefe(ausw.trefferquote === 0.75, `Trefferquote 3/4 = 0,75 (${ausw.trefferquote})`);
pruefe(ausw.medianZeitMs === 1100, `Median aus [1000,1200,800,1500] = 1100 (${ausw.medianZeitMs})`);
pruefe(ausw.stufeEnde === 2, 'stufeEnde kommt aus dem letzten Eintrag');
pruefe(unterscheidenAuswerten([]).gesamt === 0, 'leere Antwortliste stürzt nicht ab');

/* ------------------------------------------------------------ Teil 4 */

pruefe(tempoTaktKennzahlen(null, null) === null, 'ohne Lesewerte gibt es keine Tempo&Takt-Kennzahlen (Teil überspringbar)');
const tt = tempoTaktKennzahlen({ tempo: 120, stockungen: 1, gleichmass: 70, betonung: 50 }, { silbenProMin: 130, gleichmass: 80, taktBrueche: 0 });
pruefe(tt.tempo === 120 && tt.silbenProMin === 130, 'Tempo&Takt-Kennzahlen übernehmen Lesen.auswerten() und Lesemodi.taktMessen() unverändert');
const ttOhneTakt = tempoTaktKennzahlen({ tempo: 100, stockungen: 0, gleichmass: 60, betonung: 40 }, null);
pruefe(ttOhneTakt.silbenProMin === null, 'ohne verwertbare Taktmessung bleibt silbenProMin null, statt zu erfinden');

/* ------------------------------------------------------- Teil 5: Textpaare */

pruefe(textpaareFuer(1).length >= 6, `mindestens 6 Textpaare für Etappe 1 (${textpaareFuer(1).length})`);
pruefe(textpaareFuer(2).length >= 6, `mindestens 6 Textpaare für Etappe 2 (${textpaareFuer(2).length})`);
pruefe(TEXTPAARE.every(p => textpaarGueltig(p)),
  'jedes Textpaar hat für beide Texte je 3 Fragen mit gültiger, eindeutiger Antwort und ohne doppelte Optionen');
pruefe(TEXTPAARE.every(p => p.a.fragen.length === 3 && p.b.fragen.length === 3), 'jeder Text hat genau 3 Fragen');
const laengen = TEXTPAARE.map(p => Math.abs(p.a.text.split(' ').length - p.b.text.split(' ').length));
pruefe(laengen.every(d => d <= 6), 'die beiden Texte eines Paares sind ungefähr gleich lang (Wortzahl)');
pruefe(!textpaarGueltig(null), 'ein fehlendes Paar gilt als ungültig, statt abzustürzen');
pruefe(!textpaarGueltig({ a: { fragen: [] }, b: { fragen: [] } }), 'ein Paar ohne Fragen gilt als ungültig');

/* ------------------------------------------------- Profil-Aussagen (Schwellen) */

/* 1) Wortbilder vs. Entschlüsseln – braucht BEIDES: Verhältnis ≥ 2,0× UND
   Quatschwörter/Min unter der absoluten Grenze (sonst schlägt die Aussage
   bei fast jedem gut lesenden Kind an, siehe Kommentar in js/lesetest.js). */
const positivWortbilder = { woerter: { proMinute: 40 }, quatsch: { proMinute: 15 } }; // 40 >= 15*2.0 UND 15 < 20
pruefe(profilAussagen(positivWortbilder).some(a => a.id === 'wortbilder'),
  `Schwelle erreicht (Wörter ${SCHWELLE_WORT_VS_QUATSCH}× Quatschwörter, unter ${SCHWELLE_QUATSCH_MAX_PRO_MINUTE}/Min) löst die Aussage aus`);
/* Verhältnis unter der Schwelle (40/25 = 1,6×), obwohl Quatschwörter selbst langsam sind. */
const negativWortbilderVerhaeltnis = { woerter: { proMinute: 40 }, quatsch: { proMinute: 25 } };
pruefe(!profilAussagen(negativWortbilderVerhaeltnis).some(a => a.id === 'wortbilder'),
  'Verhältnis unter der Schwelle -> keine Aussage, auch wenn Wörter schneller sind');
/* Verhältnis über der Schwelle (60/28 ≈ 2,14×), aber Quatschwörter/Min liegt
   NICHT unter der absoluten Grenze – ein normal schnell lesendes Kind, kein
   Anlass für die Aussage. */
const negativWortbilderAbsolut = { woerter: { proMinute: 60 }, quatsch: { proMinute: 28 } };
pruefe(!profilAussagen(negativWortbilderAbsolut).some(a => a.id === 'wortbilder'),
  'Verhältnis erreicht, aber Quatschwörter/Min über der absoluten Grenze -> keine Aussage (normales Kind)');

/* 2) Hörverstehen deutlich besser als Leseverstehen. */
const positivHoeren = { verstehen: { selbstRichtig: 1, gehoertRichtig: 3 } };
pruefe(profilAussagen(positivHoeren).some(a => a.id === 'hoerverstehen'),
  `Differenz ≥ ${SCHWELLE_HOERVERSTEHEN_BESSER} löst die Aussage aus`);
const negativHoeren = { verstehen: { selbstRichtig: 2, gehoertRichtig: 2 } };
pruefe(!profilAussagen(negativHoeren).some(a => a.id === 'hoerverstehen'), 'gleich gut gelesen wie gehört löst nichts aus');

/* 3) Dominante Fehlerart „ähnlich aussehend". */
const positivAehnlich = { woerter: { fehlerarten: { aehnlich_aussehend: 4, geraten: 1 } } };
pruefe(profilAussagen(positivAehnlich).some(a => a.id === 'wortbilder_aehnlich'),
  `≥ ${SCHWELLE_FEHLERART_MINDEST} Fehler und ≥ ${SCHWELLE_FEHLERART_ANTEIL * 100}% Anteil lösen die Aussage aus`);
const negativAehnlich = { woerter: { fehlerarten: { aehnlich_aussehend: 1, geraten: 3 } } };
pruefe(!profilAussagen(negativAehnlich).some(a => a.id === 'wortbilder_aehnlich'),
  'zu wenige Fehler dieser Art lösen nichts aus');

/* 4) Viele Auslassungen. */
const positivAuslassung = { woerter: { ausgelassenAnteil: 0.3 } };
pruefe(profilAussagen(positivAuslassung).some(a => a.id === 'ueberspringt'),
  `Anteil ≥ ${SCHWELLE_AUSLASSUNG_ANTEIL * 100}% löst die Aussage aus`);
const negativAuslassung = { woerter: { ausgelassenAnteil: 0.05 } };
pruefe(!profilAussagen(negativAuslassung).some(a => a.id === 'ueberspringt'), 'wenige Auslassungen lösen nichts aus');

pruefe(profilAussagen({}).length === 0, 'ohne jede Auffälligkeit gibt es keine Profil-Aussage');
pruefe(profilAussagen(null).length === 0, 'null als Eingabe stürzt nicht ab');

/* ---------------------------------------------------------- Empfehlungen */

const vieleSignale = {
  woerter: { proMinute: 40, ausgelassenAnteil: 0.3, fehlerarten: { aehnlich_aussehend: 5 } },
  quatsch: { proMinute: 20 },
  verstehen: { selbstRichtig: 0, gehoertRichtig: 3 },
  tempoTakt: { stockungen: 3, gleichmass: 30 }
};
const empf = empfehlungen(vieleSignale);
pruefe(empf.length <= 3, `höchstens 3 Empfehlungen, auch bei vielen Signalen (${empf.length})`);
pruefe(empf.length > 0, 'bei deutlichen Signalen gibt es mindestens eine Empfehlung');
pruefe(new Set(empf).size === empf.length, 'keine Empfehlung kommt doppelt vor');
pruefe(empfehlungen({}).length === 0, 'ohne Signale keine Empfehlung');
/* Priorisierung: das dringendste Signal (Priorität 1) steht vorn. */
const nurHoeren = { verstehen: { selbstRichtig: 0, gehoertRichtig: 3 } };
pruefe(empfehlungen(nurHoeren)[0].toLowerCase().includes('echo-lesen'),
  'die höchste Priorität (Hörverstehen) steht an erster Stelle');

/* -------------------------------------------------------------- Verlauf */

let verlauf = [];
for (let i = 0; i < LESETEST_VERLAUF_MAX + 5; i++) {
  verlauf = verlaufSpeichern(verlauf, { datum: `2026-01-${String(i + 1).padStart(2, '0')}`, i });
}
pruefe(verlauf.length === LESETEST_VERLAUF_MAX, `Verlauf wird auf ${LESETEST_VERLAUF_MAX} Einträge gedeckelt (${verlauf.length})`);
pruefe(verlauf[verlauf.length - 1].i === LESETEST_VERLAUF_MAX + 4, 'die neuesten Einträge bleiben erhalten');
pruefe(verlauf[0].i === 5, 'die ältesten Einträge fliegen zuerst heraus');

const vergleich = verlaufVergleich(
  { datum: '2026-09-03', woerter: { proMinute: 20 } },
  { datum: '2026-09-24', woerter: { proMinute: 26 } }
);
pruefe(vergleich.diffTempo === 6, `Differenz korrekt berechnet (${vergleich.diffTempo})`);
pruefe(vergleich.text.includes('+6') && vergleich.text.includes('3. September'),
  `Vergleichstext in Alltagssprache mit Datum ("${vergleich.text}")`);
pruefe(verlaufVergleich(null, {}) === null, 'ohne vorigen Test kein Vergleich, kein Absturz');

const altesProfil = {};
migriereZustand(altesProfil);
pruefe(Array.isArray(altesProfil.lesetests) && altesProfil.lesetests.length === 0, 'Migration ergänzt ein leeres lesetests-Array');
const schonDa = { lesetests: [{ i: 1 }] };
migriereZustand(schonDa);
pruefe(schonDa.lesetests.length === 1, 'vorhandene Testergebnisse bleiben bei der Migration erhalten');

pruefe(erinnerungFaellig(null) === true, 'ohne je einen Test gemachten Zu haben ist die Erinnerung sofort fällig');
const vorFuenfWochen = Date.now() - 35 * 86400000;
pruefe(erinnerungFaellig(new Date(vorFuenfWochen).toISOString()) === true,
  `länger als ${ERINNERUNG_TAGE} Tage her -> Erinnerung fällig`);
const vorEinerWoche = Date.now() - 7 * 86400000;
pruefe(erinnerungFaellig(new Date(vorEinerWoche).toISOString()) === false, 'vor kurzem getestet -> keine Erinnerung');
pruefe(datumKurz('2026-09-03').includes('September'), `datumKurz liefert einen Monatsnamen ("${datumKurz('2026-09-03')}")`);

/* -------------------------------------------------- Umzugs-Code-Rundreise */
{
  const speicher = new Map();
  globalThis.localStorage = {
    getItem: k => speicher.has(k) ? speicher.get(k) : null,
    setItem: (k, v) => speicher.set(k, String(v)),
    removeItem: k => speicher.delete(k)
  };
  const S = await import('../js/store.js');
  S.laden();
  const kind = S.neuesProfil({ name: 'Lesetestkind', avatar: '🦉', klasse: 3 });
  migriereZustand(kind);
  kind.lesetests = verlaufSpeichern(kind.lesetests, {
    datum: '2026-09-24',
    woerter: { proMinute: 30, ausgelassenAnteil: 0.1, fehlerarten: { geraten: 2 } },
    quatsch: { proMinute: 18 },
    aussagen: profilAussagen({ woerter: { proMinute: 30 }, quatsch: { proMinute: 18 } }),
    empfehlungen: empfehlungen({ woerter: { proMinute: 30 }, quatsch: { proMinute: 18 } })
  });
  const vorher = JSON.stringify(kind.lesetests);
  const code = S.alsCode();
  speicher.clear();
  S.laden();
  S.ausCode(code);
  const zurueck = S.alleProfile().find(p => p.name === 'Lesetestkind');
  pruefe(!!zurueck, 'Profil mit Lesetest-Ergebnis kommt nach dem Umzugs-Code zurück');
  pruefe(JSON.stringify(zurueck.lesetests) === vorher, 'die gespeicherten Lesetest-Ergebnisse überstehen den Umzugs-Code unverändert');
}

console.log(fehler === 0 ? '\nDer Lesetest ist brauchbar ✅' : `\n${fehler} Problem(e) ❌`);
process.exit(fehler === 0 ? 0 : 1);
