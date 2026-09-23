/* Prueft die Textaufbereitung fuer die Texterkennung (OCR) - ohne Kamera,
   ohne Tesseract. Das ist bewusst: js/texterkennung.js selbst braucht einen
   Browser (Worker, Canvas, WebAssembly) und laesst sich nicht in node
   pruefen. Was sich aber sehr wohl pruefen laesst - und wo die meisten
   Fehler passieren wuerden - ist js/textaufbereitung.js: das, was aus dem
   rohen Erkennungstext einen brauchbaren Lesetext macht.

   Fuer eine einmalige Qualitaetsmessung der Erkennung selbst (Zeichen-
   Fehlerrate an echten Testbildern) siehe tests/ocr-qualitaet.mjs - das ist
   kein Pflichttest, weil er Playwright und Tesseract in node braucht. */

import { bereinigen, unsichereWoerter, inAbschnitte, titelVorschlag } from '../js/textaufbereitung.js';
import { silben, textInSilben } from '../js/silben.js';
import { TEXTE } from '../js/lesen.js';

let fehler = 0;
const pruefe = (bedingung, text) => {
  console.log(`${bedingung ? '✅' : '❌'} ${text}`);
  if (!bedingung) fehler++;
};

/* --------------------------------------------------------------- bereinigen */

const FAELLE = [
  // Trennstriche am Zeilenende: Silbentrennung wird zusammengefuegt
  ['Die Son-\nne scheint.', 'Die Sonne scheint.'],
  ['Ein wun-\nderschöner Tag.', 'Ein wunderschöner Tag.'],
  // ... aber ein Bindestrich vor einem Großbuchstaben ist ein echtes
  // Bindestrich-Wort und bleibt einer, nur der Zeilenumbruch verschwindet.
  ['Die Nord-\nSüd-Richtung.', 'Die Nord-Süd-Richtung.'],
  ['Der Baden-\nWürttemberger.', 'Der Baden-Württemberger.'],
  // Zeilenumbrüche innerhalb eines Absatzes werden zu Leerzeichen
  ['Die Katze\nschläft auf\ndem Sofa.', 'Die Katze schläft auf dem Sofa.'],
  // Leerzeilen markieren einen Absatz und bleiben erhalten
  ['Erster Absatz.\n\nZweiter Absatz.', 'Erster Absatz.\n\nZweiter Absatz.'],
  ['Erster Absatz.\n\n\n\nZweiter Absatz.', 'Erster Absatz.\n\nZweiter Absatz.'],
  // Allein stehende Seitenzahlen verschwinden
  ['Text davor.\n12\nText danach.', 'Text davor. Text danach.'],
  ['Kapitel eins.\n\n7\n\nKapitel zwei.', 'Kapitel eins.\n\nKapitel zwei.'],
  // Zahlen, die Teil eines Satzes sind, bleiben stehen
  ['Sie hat 12 Äpfel.', 'Sie hat 12 Äpfel.'],
  // Typografische Anführungszeichen und Apostrophe
  ['„Hallo", sagte sie.', '"Hallo", sagte sie.'],
  ['Er sagte: »Nein.«', 'Er sagte: "Nein."'],
  ["Das ist Peters Buch, oder ‚seins'.", "Das ist Peters Buch, oder 'seins'."],
  // Ligaturen
  ['Das ist ﬁn und ﬂott.', 'Das ist fin und flott.'],
  // Pipe als Fehlerkennung für I/l - nur markieren
  ['I|nfarkt und Fal|le.', 'I[?]nfarkt und Fal[?]le.'],
  // Mehrfache Leerzeichen und Leerzeichen vor Satzzeichen
  ['Das   ist   viel   Platz .', 'Das ist viel Platz.'],
  ['Ein Komma , und ein Punkt .', 'Ein Komma, und ein Punkt.'],
  // Leerer und randvoller Text stürzt nicht ab
  ['', ''],
  ['   \n\n   ', '']
];

for (const [roh, soll] of FAELLE) {
  const ist = bereinigen(roh);
  pruefe(ist === soll, `bereinigen(${JSON.stringify(roh)}) = ${JSON.stringify(ist)} (soll: ${JSON.stringify(soll)})`);
}

pruefe(bereinigen(null) === '', 'bereinigen(null) stürzt nicht ab');
pruefe(bereinigen(undefined) === '', 'bereinigen(undefined) stürzt nicht ab');

/* ------------------------------------------------------------ unsichereWoerter */

const woerter = [
  { text: 'Hallo', sicherheit: 95 },
  { text: 'Welt', sicherheit: 40 },
  { text: 'xyzq', sicherheit: 69 },
  { text: 'genau', sicherheit: 70 }
];
const unsicher = unsichereWoerter(woerter);
pruefe(unsicher.length === 2, `Standardschwelle 70 findet die richtigen unsicheren Wörter (${unsicher.length})`);
pruefe(unsicher.every(w => w.sicherheit < 70), 'jedes gefundene Wort liegt wirklich unter der Schwelle');
pruefe(unsichereWoerter(woerter, 100).length === 4, 'eine hohe Schwelle markiert fast alles als unsicher');
pruefe(unsichereWoerter(woerter, 0).length === 0, 'eine Schwelle von 0 markiert nichts');
pruefe(unsichereWoerter([]).length === 0, 'leere Wortliste ergibt keine Treffer');
pruefe(unsichereWoerter(undefined).length === 0, 'fehlende Wortliste stürzt nicht ab');

/* ------------------------------------------------------------- inAbschnitte */

/* Abkürzungen und Ordnungszahlen dürfen keinen Abschnitt zerreißen. */
const mitAbkuerzung = 'Wir kauften Obst, z. B. Äpfel und Birnen. Das war lecker.';
const abschnitteAbkuerzung = inAbschnitte(mitAbkuerzung, { saetze: 2 });
pruefe(abschnitteAbkuerzung.length === 1,
  `"z. B." wird nicht als Satzende missverstanden (${abschnitteAbkuerzung.length} Abschnitt(e): ${JSON.stringify(abschnitteAbkuerzung)})`);

const mitDr = 'Wir besuchten Dr. Müller. Er untersuchte uns gründlich.';
pruefe(inAbschnitte(mitDr, { saetze: 2 }).length === 1, '"Dr." wird nicht als Satzende missverstanden');

const mitOrdinalzahl = 'Sie ging in die 3. Klasse. Dort lernte sie lesen.';
pruefe(inAbschnitte(mitOrdinalzahl, { saetze: 2 }).length === 1,
  '"3. Klasse" (Ordnungszahl) wird nicht als Satzende missverstanden');

const mitUsw = 'Er hatte Stifte, Hefte usw. dabei. Die Tasche war schwer.';
pruefe(inAbschnitte(mitUsw, { saetze: 2 }).length === 1, '"usw." wird nicht als Satzende missverstanden');

const dreiSaetze = 'Erster Satz hier. Zweiter Satz hier. Dritter Satz hier.';
pruefe(inAbschnitte(dreiSaetze, { saetze: 1 }).length === 3,
  `mit saetze:1 wird jeder Satz ein eigener Abschnitt (${inAbschnitte(dreiSaetze, { saetze: 1 }).length})`);

/* Absatzgrenzen werden respektiert - ein Abschnitt reicht nie über eine
   Leerzeile hinweg, auch wenn dort weniger als `saetze` Sätze stehen. */
const zweiAbsaetze = 'Nur ein Satz hier.\n\nUnd noch einer, ganz allein.';
const ergAbsaetze = inAbschnitte(zweiAbsaetze, { saetze: 3 });
pruefe(ergAbsaetze.length === 2, `Absatzgrenzen werden respektiert (${ergAbsaetze.length} Abschnitte)`);

/* Lange, kommareiche Sätze werden an Kommas aufgeteilt, nicht einfach durchgereicht. */
const langerSatz = Array.from({ length: 50 }, (_, i) => `Wort${i}`).join(', ') + '.';
const langeAbschnitte = inAbschnitte(langerSatz, { saetze: 3 });
pruefe(langeAbschnitte.length > 1, `ein sehr langer Satz wird an Kommas aufgeteilt (${langeAbschnitte.length} Stücke)`);
pruefe(langeAbschnitte.every(a => a.split(/\s+/).filter(Boolean).length <= 41),
  'kein Stück eines aufgeteilten langen Satzes ist wesentlich länger als 40 Wörter');

/* Randfälle */
pruefe(inAbschnitte('').length === 0, 'leerer Text ergibt keine Abschnitte');
pruefe(inAbschnitte(null).length === 0, 'inAbschnitte(null) stürzt nicht ab');
pruefe(inAbschnitte('Kein Satzzeichen am Ende').length === 1,
  'ein Text ohne Satzzeichen am Ende geht nicht verloren');

/* Invariante: alle NICHT-Leerraum-Zeichen des Eingabetexts stecken, in
   derselben Reihenfolge, in den Abschnitten - nichts wird erfunden oder
   verloren, nur Wei6ßraum darf sich ändern (Zeilenumbrüche -> Leerzeichen). */
function ohneLeerraum(s) { return String(s).replace(/\s+/g, ''); }
function invarianteHaelt(t, opts) {
  const abschnitte = inAbschnitte(t, opts);
  return ohneLeerraum(abschnitte.join(' ')) === ohneLeerraum(t);
}

const testTexte = [
  mitAbkuerzung, mitDr, mitOrdinalzahl, mitUsw, dreiSaetze, zweiAbsaetze, langerSatz,
  'Ein einzelnes Wort.', 'Mehrere. Kurze. Sätze. Hintereinander.',
  'Text mit\nZeilenumbruch und\n\nAbsatz.',
  ...TEXTE.map(t => t.text)
];
const kaputt = testTexte.filter(t => !invarianteHaelt(t, { saetze: 2 }));
pruefe(kaputt.length === 0,
  `alle ${testTexte.length} Testtexte (inkl. aller Lesetexte aus js/lesen.js) bleiben beim Zerlegen vollständig` +
  (kaputt.length ? ': ' + JSON.stringify(kaputt[0]) : ''));

/* Jeder Abschnitt muss sich weiterhin fehlerfrei in Silben zerlegen lassen -
   genau dafür sind die Abschnitte ja gedacht (Vorlesen-Übung). */
let silbenKaputt = [];
for (const t of TEXTE) {
  for (const abschnitt of inAbschnitte(t.text, { saetze: 2 })) {
    for (const roh of abschnitt.split(/\s+/)) {
      const w = roh.replace(/[^\p{L}]/gu, '');
      if (!w) continue;
      const s = silben(w);
      if (s.join('') !== w) silbenKaputt.push(`${w} -> ${s.join('-')}`);
    }
  }
  const stuecke = textInSilben(inAbschnitte(t.text, { saetze: 2 }).join(' '));
  if (!stuecke.length && t.text.trim()) silbenKaputt.push(`kein Silbenstück für "${t.titel}"`);
}
pruefe(silbenKaputt.length === 0,
  `jeder Abschnitt jedes Lesetexts lässt sich verlustfrei in Silben zerlegen` +
  (silbenKaputt.length ? ': ' + silbenKaputt.slice(0, 5).join('; ') : ''));

/* ------------------------------------------------------------- titelVorschlag */

pruefe(titelVorschlag('Der kleine Fuchs lief schnell durch den dunklen Wald.') === 'Der kleine Fuchs lief schnell durch',
  `Titelvorschlag nimmt die ersten Wörter: "${titelVorschlag('Der kleine Fuchs lief schnell durch den dunklen Wald.')}"`);
pruefe(titelVorschlag('Ein Satz.') === 'Ein Satz', `Satzzeichen am Ende wird abgeschnitten: "${titelVorschlag('Ein Satz.')}"`);
pruefe(titelVorschlag('') === '', 'leerer Text ergibt leeren Titelvorschlag');
pruefe(titelVorschlag(null) === '', 'titelVorschlag(null) stürzt nicht ab');
pruefe(titelVorschlag('   ') === '', 'nur Leerraum ergibt leeren Titelvorschlag');

console.log(fehler === 0
  ? '\nTextaufbereitung für die Texterkennung arbeitet wie beschrieben ✅'
  : `\n${fehler} Problem(e) ❌`);
process.exit(fehler === 0 ? 0 : 1);
