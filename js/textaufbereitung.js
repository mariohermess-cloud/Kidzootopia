/* Textaufbereitung: aus OCR-Rohtext einen Silben-Lesetext machen.

   Reine Textverarbeitung, ohne DOM und ohne Tesseract - deshalb in einer
   eigenen Datei und mit node lauffaehig (tests/texterkennung.mjs prueft
   genau das). Die Kette ist: js/texterkennung.js liefert Rohtext + eine
   Sicherheit je Wort -> ein Erwachsener prueft/korrigiert die unsicheren
   Stellen -> dieses Modul macht aus dem geprueften Text handliche Haeppchen
   fuer die Vorlesen-Uebung (js/lesen.js), 1-3 Saetze pro Abschnitt.

   WAS HIER NICHT PASSIERT: Es wird nichts geraten. Ein OCR-Fehler wie ein
   "|" statt "I" oder "l" wird MARKIERT, nicht automatisch korrigiert - das
   Raten uebernimmt der Mensch, der den Text vor der Uebernahme sieht. */

/* --------------------------------------------------------------------------
   bereinigen: rohen Scan-Text in einen sauberen, gut lesbaren Text ueberfuehren.
   -------------------------------------------------------------------------- */

/* Typografische Anfuehrungszeichen und Apostrophe, wie sie in gedruckten
   Buechern stehen, auf die einfachen Zeichen der Tastatur vereinheitlicht -
   sonst faerbt/vergleicht spaeterer Code (z. B. Silbentrennung) sie nicht
   gleich wie ein normales Anfuehrungszeichen. */
const ANFUEHRUNG_DOPPELT = /[„“”«»]/g;
const ANFUEHRUNG_EINFACH = /[‚‘’‹›]/g;

/* Ligaturen, die beim Scannen von Druckwerken haeufig als ein einzelnes
   Zeichen erkannt werden. */
const LIGATUREN = { 'ﬁ': 'fi', 'ﬂ': 'fl', 'ﬀ': 'ff', 'ﬃ': 'ffi', 'ﬄ': 'ffl' };

/* Ein Erkennungsfehler, bei dem Tesseract "I" oder "l" (kleines L) als
   Pipe-Zeichen liest, ist haeufig und laesst sich nicht zuverlaessig aufloesen -
   "|ch" koennte "Ich" oder "lch" sein, je nach Schriftart praktisch nicht zu
   unterscheiden. Deshalb wird das Zeichen sichtbar markiert statt geraten. */
const PIPE_MARKIERUNG = '[?]';

export function bereinigen(rohtext) {
  let text = String(rohtext ?? '');
  if (!text) return '';

  // Zeilenenden vereinheitlichen
  text = text.replace(/\r\n?/g, '\n');

  // Ligaturen auflösen
  for (const [lig, aufgeloest] of Object.entries(LIGATUREN)) {
    text = text.split(lig).join(aufgeloest);
  }

  // Anführungszeichen und Apostrophe vereinheitlichen
  text = text.replace(ANFUEHRUNG_DOPPELT, '"').replace(ANFUEHRUNG_EINFACH, "'");

  // OCR-Verwechslung "|" statt I/l: markieren, nicht raten
  text = text.split('|').join(PIPE_MARKIERUNG);

  // Trennstriche am Zeilenende: "Son-\nne" -> "Sonne" (Silbentrennung),
  // aber "Nord-\nSüd" bleibt ein Bindestrich-Wort (Großbuchstabe danach).
  text = text.replace(/(\p{L})-\n(\p{Ll})/gu, '$1$2');
  text = text.replace(/(\p{L})-\n(\p{Lu})/gu, '$1-$2');

  // Allein stehende Seitenzahlen (eine Zeile nur aus Ziffern) entfernen -
  // zusammen mit EINER der beiden umgebenden Zeilenumbrüche, damit daraus
  // nicht versehentlich eine neue Absatzgrenze entsteht. Stand die Seitenzahl
  // bereits zwischen zwei echten Leerzeilen, bleibt die Absatzgrenze erhalten
  // (dort bleiben genug Zeilenumbrüche übrig).
  text = text.replace(/^[ \t]*\d+[ \t]*\n/, '');
  text = text.replace(/\n[ \t]*\d+[ \t]*$/, '');
  text = text.replace(/\n[ \t]*\d+[ \t]*\n/g, '\n');

  // Leerzeilen sind Absatzgrenzen und bleiben erhalten; einzelne
  // Zeilenumbrüche innerhalb eines Absatzes werden zu Leerzeichen.
  const ABSATZ_MARKE = '\u0000ABSATZ\u0000';
  text = text.replace(/\n{2,}/g, ABSATZ_MARKE);
  text = text.replace(/\n/g, ' ');
  text = text.split(ABSATZ_MARKE).join('\n\n');

  // Mehrfache Leerzeichen zusammenfassen, Leerzeichen vor Satzzeichen entfernen.
  text = text.replace(/[ \t]{2,}/g, ' ');
  text = text.replace(/[ \t]+([.,;:!?…])/g, '$1');

  // Absätze einzeln trimmen, damit keine führenden/folgenden Leerzeichen
  // an einer Absatzgrenze übrig bleiben.
  text = text.split('\n\n').map(a => a.trim()).filter(a => a.length).join('\n\n');

  return text.trim();
}

/* --------------------------------------------------------------------------
   unsichereWoerter: welche Worttreffer sollte ein Erwachsener sich ansehen?
   -------------------------------------------------------------------------- */

export function unsichereWoerter(woerter, schwelle = 70) {
  return (woerter || []).filter(w => w && typeof w.sicherheit === 'number' && w.sicherheit < schwelle);
}

/* --------------------------------------------------------------------------
   inAbschnitte: einen Text in mundgerechte Häppchen für die Vorlesen-Übung
   zerlegen - 1 bis 3 Sätze, ohne Abkürzungen und Ordnungszahlen als
   Satzende misszuverstehen, ohne Absatzgrenzen zu überspringen und ohne
   Abschnitte länger als etwa 40 Wörter werden zu lassen.
   -------------------------------------------------------------------------- */

/* Häufige Abkürzungen, nach denen ein Punkt KEIN Satzende ist. Kleingeschrieben
   und ohne Punkte gespeichert, damit "z. B." (zwei Wörter) genauso greift wie
   "usw." (ein Wort). */
const ABKUERZUNGEN = new Set([
  'z', 'b', 'd', 'h', 'u', 'a', 'usw', 'bzw', 'ca', 'dr', 'prof', 'nr', 'str',
  'etc', 'vgl', 'ggf', 'inkl', 'exkl', 'mio', 'mrd', 'jh', 'bd', 'kap', 'abs',
  'art', 'abb', 'anm', 'bzgl', 'fr', 'hr', 'frl', 'geb', 'gest', 'jr', 'mr',
  'mrs', 'ms', 'st', 'bsp', 'sog', 'oä', 'ev', 'chr', 'jhd', 'sog', 'ing', 'dipl'
]);

const woerterZahl = s => (s.match(/\S+/g) || []).length;

/* Prüft, ob ein gefundenes Satzzeichen an `index` (Beginn) wirklich ein
   Satzende ist - oder ob davor eine Abkürzung oder eine Ordnungszahl steht. */
function istSatzende(absatz, index) {
  const davor = absatz.slice(0, index);
  const wortMatch = davor.match(/(\S+)\s*$/);
  const wortDavor = wortMatch ? wortMatch[1] : '';
  // Ordnungszahl: "3. Klasse" - eine reine Zahl direkt vor dem Punkt.
  if (/^\d+$/.test(wortDavor)) return false;
  const reinesWort = wortDavor.replace(/[^\p{L}]/gu, '').toLowerCase();
  if (reinesWort && ABKUERZUNGEN.has(reinesWort)) return false;
  return true;
}

/* Zerlegt EINEN Absatz (keine Leerzeilen mehr enthalten) in Sätze - unter
   Berücksichtigung von Abkürzungen ("z. B.", "Dr.") und Ordnungszahlen
   ("3. Klasse"), die keinen Satzschluss bedeuten. Exportiert, weil js/
   lesemodi.js (Echo-Lesen, Satz für Satz) dieselbe Zerlegung braucht wie
   die Abschnittsbildung hier - eine zweite, einfachere Regel würde bei
   genau diesen Sonderfällen aus dem Ruder laufen. */
export function absatzInSaetze(absatz) {
  const saetze = [];
  const regex = /[.!?]+|…/g;
  let letzterSchnitt = 0;
  let treffer;
  while ((treffer = regex.exec(absatz))) {
    if (!istSatzende(absatz, treffer.index)) continue;
    const ende = treffer.index + treffer[0].length;
    const satz = absatz.slice(letzterSchnitt, ende).trim();
    if (satz) saetze.push(satz);
    letzterSchnitt = ende;
  }
  const rest = absatz.slice(letzterSchnitt).trim();
  if (rest) saetze.push(rest);
  return saetze;
}

/* Ein Abschnitt darf nicht beliebig lang werden - lange, kommareiche Sätze
   (Fabeln, Sachtexte) werden dafür an Kommas weiter zerlegt. Ohne Komma
   bleibt der Abschnitt so lang, wie er ist - es wird nichts erraten. */
const MAX_WOERTER = 40;
function anLaengeAufteilen(abschnitt) {
  if (woerterZahl(abschnitt) <= MAX_WOERTER) return [abschnitt];
  const teile = abschnitt.split(/(?<=,)\s+/);
  const stuecke = [];
  let aktuell = '';
  for (const teil of teile) {
    const kandidat = aktuell ? `${aktuell} ${teil}` : teil;
    if (aktuell && woerterZahl(kandidat) > MAX_WOERTER) {
      stuecke.push(aktuell.trim());
      aktuell = teil;
    } else {
      aktuell = kandidat;
    }
  }
  if (aktuell) stuecke.push(aktuell.trim());
  return stuecke;
}

export function inAbschnitte(text, { saetze = 2 } = {}) {
  const proAbschnitt = Math.max(1, Math.min(3, saetze || 2));
  const absaetze = String(text ?? '')
    .split(/\n\s*\n/)
    .map(a => a.replace(/\s+/g, ' ').trim())
    .filter(Boolean);

  const ergebnis = [];
  for (const absatz of absaetze) {
    const saetzeListe = absatzInSaetze(absatz);
    if (!saetzeListe.length) continue;
    let gruppe = [];
    const abschliessen = () => {
      if (!gruppe.length) return;
      ergebnis.push(...anLaengeAufteilen(gruppe.join(' ')));
      gruppe = [];
    };
    for (const satz of saetzeListe) {
      gruppe.push(satz);
      if (gruppe.length >= proAbschnitt) abschliessen();
    }
    abschliessen();
  }
  return ergebnis;
}

/* --------------------------------------------------------------------------
   titelVorschlag: die ersten paar Wörter als Vorschlag für einen Titel.
   -------------------------------------------------------------------------- */

export function titelVorschlag(text) {
  const bereinigt = String(text ?? '').replace(/\s+/g, ' ').trim();
  if (!bereinigt) return '';
  const woerter = bereinigt.split(' ').filter(Boolean);
  let titel = woerter.slice(0, 6).join(' ');
  if (titel.length > 40) titel = titel.slice(0, 40).trim();
  return titel.replace(/[.,;:!?…]+$/, '');
}
