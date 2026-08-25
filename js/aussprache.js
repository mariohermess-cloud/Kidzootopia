/* Silbe für Silbe mitlesen – und färben, wo es gehakt hat.

   DIE ENTSCHEIDENDE EINSICHT

   Sprache zu ERKENNEN ist schwer. Aber die App muss gar nichts erkennen: Sie
   kennt den Text ja schon. Sie muss nur ZUORDNEN, welcher Abschnitt der
   Aufnahme zu welcher Silbe gehört. Das nennt sich in der Sprachforschung
   "forced alignment" und ist um Größenordnungen einfacher als Spracherkennung –
   einfach genug, dass es ohne Modell, ohne Server und ohne Bibliothek geht.

   In zwei Schritten:

   1. SILBENKERNE FINDEN. Jede Silbe hat einen Vokal, und Vokale sind laut.
      In der Lautstärkekurve ist eine Silbe deshalb ein Berg. Man sucht die
      Gipfel und verlangt, dass zwischen zwei Gipfeln ein deutliches Tal liegt.
      Das Verfahren stammt von de Jong & Wempe (2009), die damit die Sprechrate
      automatisch messen; es zählt Silben mit brauchbarer Genauigkeit, ohne ein
      einziges Wort zu verstehen.

   2. ZUORDNEN. Wir wissen, wie viele Silben der Text hat und in welcher
      Reihenfolge. Die gefundenen Gipfel werden der Reihe nach darauf verteilt.
      Stimmen die Anzahlen nicht überein, wird das ehrlich vermerkt statt
      krummgebogen – dann ist die Zuordnung unsicher und die Färbung wird
      zurückhaltender.

   WAS DIE FARBEN BEDEUTEN – UND WAS NICHT

   Grün, gelb, orange, rot stehen für FLUSS und BETONUNG:
     grün   – zügig und ohne Stocken gesprochen
     gelb   – etwas gedehnt
     orange – davor gestockt oder stark gedehnt
     rot    – langer Halt davor, oder die Silbe ist im Ton nicht wiederzufinden

   Sie stehen AUSDRÜCKLICH NICHT dafür, ob ein Laut richtig ausgesprochen
   wurde. Ob ein Kind "Schmetterling" mit einem sauberen "Sch" beginnt, hört
   man nur mit echter Lauterkennung – die hätte ein Modell gebraucht, das die
   App bewusst nicht mitbringt. Ein rotes Feld heißt "hier hast du gestockt",
   niemals "das war falsch gesprochen". Genau so steht es auch in der App.

   Die Betonung ist der zweite Teil und wird getrennt ausgewiesen: Im Deutschen
   liegt der Wortakzent bei einfachen Wörtern auf der Stammsilbe, und
   Vorsilben wie ver-, be-, ge- sind unbetont. Welche Silbe ein Kind wirklich
   hervorgehoben hat, verrät die Lautstärke. Beides zu vergleichen ist erlaubt
   und aussagekräftig – "du betonst Ver-STE-hen richtig" ist eine echte
   Rückmeldung. */

const SCHRITT_STANDARD = 25;   // ms je Messwert, wie im Lesepult

/* ---------------------------------------------------------------------------
   Schritt 1: Silbenkerne (Gipfel) in der Lautstärkekurve finden
   --------------------------------------------------------------------------- */

/* In Dezibel rechnen, nicht in Rohwerten. Das Ohr hört logarithmisch, und ein
   Tal von "4 dB" bedeutet unabhängig von der Aufnahmelautstärke dasselbe. */
export const inDezibel = kurve => {
  const boden = 1e-5;
  return kurve.map(v => 20 * Math.log10(Math.max(v, boden)));
};

/* Glätten über ein kurzes Fenster: Einzelne Zacken sind Knackser, keine Silben. */
export function glaetten(werte, fenster = 3) {
  if (fenster < 2) return [...werte];
  const raus = [];
  for (let i = 0; i < werte.length; i++) {
    let summe = 0, n = 0;
    for (let k = -fenster; k <= fenster; k++) {
      const j = i + k;
      if (j < 0 || j >= werte.length) continue;
      summe += werte[j]; n++;
    }
    raus.push(summe / n);
  }
  return raus;
}

export const MINDEST_TAL_DB = 3.5;   // so tief muss es zwischen zwei Silben fallen
export const MINDEST_ABSTAND_MS = 90; // schneller spricht niemand zwei Silben

/* Lautstärkekurve in dB, dazu die Grenze, ab der etwas als Sprache gilt.
   Die Grenze kommt aus der Aufnahme selbst – ein leises Kind im stillen Zimmer
   soll genauso erkannt werden wie ein lautes an der Straße.
   Beides wird an mehreren Stellen gebraucht, deshalb an einer Stelle berechnet. */
export function tonlage(kurve) {
  const db = glaetten(inDezibel(kurve), 2);
  const sortiert = [...db].sort((a, b) => a - b);
  const leise = sortiert[Math.floor(sortiert.length * 0.10)] ?? 0;
  const laut = sortiert[Math.floor(sortiert.length * 0.95)] ?? 0;
  /* Kaum Unterschied zwischen leise und laut heißt: Es wurde gar nicht
     gesprochen. Ohne diese Prüfung findet das Verfahren im Rauschen Silben. */
  const spanne = laut - leise;
  return { db, leise, laut, spanne, grenze: leise + spanne * 0.35, still: spanne < 6 };
}

/* Findet die Silbengipfel. Rückgabe: Liste von {index, ms, db}. */
export function gipfel(kurve, schrittMs = SCHRITT_STANDARD) {
  if (!kurve || kurve.length < 3) return [];
  const { db, grenze, still } = tonlage(kurve);
  if (still) return [];

  const roh = [];
  for (let i = 1; i < db.length - 1; i++) {
    if (db[i] < grenze) continue;
    if (db[i] < db[i - 1] || db[i] < db[i + 1]) continue;   // kein Gipfel
    /* Plateaus: nur den ersten Punkt nehmen. */
    if (db[i] === db[i - 1] && roh.length && roh.at(-1).index === i - 1) continue;
    roh.push({ index: i, ms: i * schrittMs, db: db[i] });
  }

  /* Gipfel verschmelzen, zwischen denen kein richtiges Tal liegt. Ohne diesen
     Schritt zählt jede Schwankung innerhalb eines langen Vokals als eigene
     Silbe – der häufigste Fehler bei diesem Verfahren. */
  const echt = [];
  for (const g of roh) {
    const vorher = echt.at(-1);
    if (!vorher) { echt.push(g); continue; }
    let tal = Infinity;
    for (let i = vorher.index; i <= g.index; i++) tal = Math.min(tal, db[i]);
    const tiefGenug = Math.min(vorher.db, g.db) - tal >= MINDEST_TAL_DB;
    const weitGenug = (g.ms - vorher.ms) >= MINDEST_ABSTAND_MS;
    if (tiefGenug && weitGenug) { echt.push(g); continue; }
    /* Zu dicht beieinander: der lautere gewinnt. */
    if (g.db > vorher.db) echt[echt.length - 1] = g;
  }
  return echt;
}

/* ---------------------------------------------------------------------------
   Schritt 2: Gipfel den bekannten Silben zuordnen
   --------------------------------------------------------------------------- */

/* Zerlegt die Aufnahme in Silbenabschnitte und die Pausen dazwischen.

   Wichtig ist, WO gemessen wird. Der erste Entwurf setzte die Silbengrenze in
   die Talsohle zwischen zwei Gipfeln – dann verschwindet aber eine Sprechpause
   in den Nachbarsilben: Aus "kurze Silbe, lange Pause, kurze Silbe" wurden
   zwei lange Silben ohne Pause. Deshalb wird jetzt an der Stille gemessen:
   Eine Silbe dauert so lange, wie durchgehend gesprochen wurde, und die Pause
   ist genau die Stille davor. */
function abschnitteFinden(kurve, gipfelListe, schrittMs) {
  if (!gipfelListe.length) return [];
  const { db, grenze } = tonlage(kurve);
  const laut = db.map(v => v >= grenze);

  return gipfelListe.map((g, i) => {
    /* Von diesem Gipfel nach links und rechts laufen, bis es still wird –
       oder bis die Talsohle zum Nachbargipfel erreicht ist. */
    const linkeGrenze = i === 0 ? 0 : talSohle(db, gipfelListe[i-1].index, g.index);
    const rechteGrenze = i === gipfelListe.length - 1
      ? db.length - 1 : talSohle(db, g.index, gipfelListe[i+1].index);

    let von = g.index;
    while (von > linkeGrenze && laut[von - 1]) von--;
    let bis = g.index;
    while (bis < rechteGrenze && laut[bis + 1]) bis++;

    return { vonMs: von * schrittMs, bisMs: (bis + 1) * schrittMs,
             dauerMs: (bis + 1 - von) * schrittMs, db: g.db, gipfelMs: g.ms,
             vonIndex: von, bisIndex: bis };
  });
}

function talSohle(db, a, b) {
  let tief = Infinity, wo = a;
  for (let i = a; i <= b; i++) if (db[i] < tief) { tief = db[i]; wo = i; }
  return wo;
}

export const FARBEN = ['gruen', 'gelb', 'orange', 'rot'];

/* Ordnet die Silben des Textes den gefundenen Abschnitten zu.

   silbenListe: [{ text, wortIndex, betontErwartet }]
   Rückgabe je Silbe: Dauer, Pause davor, Stärke, Farbe – und ob die Zuordnung
   überhaupt vertrauenswürdig ist. */
export function zuordnen(silbenListe, kurve, { schrittMs = SCHRITT_STANDARD } = {}) {
  const g = gipfel(kurve, schrittMs);
  const abschnitte = abschnitteFinden(kurve, g, schrittMs);
  const erwartet = silbenListe.length;
  const gefunden = abschnitte.length;

  /* Ehrlichkeit zuerst: Weichen die Anzahlen stark ab, ist die Zuordnung
     geraten. Dann wird zwar noch gezeigt, wo ungefähr gelesen wurde, aber
     nicht mehr Silbe für Silbe eingefärbt. */
  const abweichung = erwartet ? Math.abs(gefunden - erwartet) / erwartet : 1;
  const sicher = gefunden > 0 && abweichung <= 0.25;

  const dauern = abschnitte.map(a => a.dauerMs).sort((a, b) => a - b);
  const mittlereDauer = dauern.length ? dauern[Math.floor(dauern.length / 2)] : 0;
  const staerken = abschnitte.map(a => a.db);
  const mittlereStaerke = staerken.length
    ? staerken.reduce((x, y) => x + y, 0) / staerken.length : 0;

  const raus = silbenListe.map((s, i) => {
    const a = abschnitte[i];
    if (!a) return { ...s, gefunden: false, farbe: 'rot', dauerMs: 0, pauseMs: 0, staerke: 0 };
    const vorher = abschnitte[i - 1];
    const pauseMs = vorher ? Math.max(0, a.vonMs - vorher.bisMs) : 0;
    const relativ = mittlereDauer ? a.dauerMs / mittlereDauer : 1;

    let farbe = 'gruen';
    if (pauseMs > 800 || relativ > 3) farbe = 'rot';
    else if (pauseMs > 400 || relativ > 2.2) farbe = 'orange';
    else if (pauseMs > 250 || relativ > 1.6) farbe = 'gelb';

    return {
      ...s, gefunden: true, farbe,
      dauerMs: a.dauerMs, pauseMs, relativ: Math.round(relativ * 100) / 100,
      staerke: Math.round((a.db - mittlereStaerke) * 10) / 10,
      vonMs: a.vonMs, bisMs: a.bisMs
    };
  });

  return { silben: raus, sicher, gefunden, erwartet, mittlereDauer };
}

/* ---------------------------------------------------------------------------
   Betonung: Wo liegt der Wortakzent - und wo hat das Kind ihn gesetzt?

   Deutsche Regel für einfache Wörter: Der Akzent liegt auf der Stammsilbe,
   also auf der ersten Silbe, die keine unbetonte Vorsilbe ist. Das trifft
   nicht alles (Fremdwörter folgen anderen Regeln), deshalb wird bei
   Unsicherheit lieber nichts behauptet.
   --------------------------------------------------------------------------- */

const UNBETONTE_VORSILBEN = ['be', 'ge', 'er', 'ver', 'zer', 'ent', 'emp', 'miss'];

export function betonteSilbe(silbenEinesWortes) {
  if (!silbenEinesWortes.length) return -1;
  for (let i = 0; i < silbenEinesWortes.length; i++) {
    const s = String(silbenEinesWortes[i]).toLowerCase();
    if (i === 0 && UNBETONTE_VORSILBEN.includes(s)) continue;
    return i;
  }
  return 0;
}

/* Welche Silbe eines Wortes wurde tatsaechlich hervorgehoben? Hervorhebung
   heisst im Deutschen lauter UND laenger - beides zusammen, nicht eines allein. */
export function hervorgehoben(silbenMitMessung) {
  if (silbenMitMessung.length < 2) return -1;
  let besterWert = -Infinity, bester = -1;
  silbenMitMessung.forEach((s, i) => {
    if (!s.gefunden) return;
    const wert = (s.staerke || 0) + (s.relativ || 1) * 3;
    if (wert > besterWert) { besterWert = wert; bester = i; }
  });
  return bester;
}

/* Vergleicht beides je Wort. Gibt nur dann etwas zurueck, wenn die Aussage
   belastbar ist: mindestens zwei Silben und eine sichere Zuordnung. */
export function betonungPruefen(woerter) {
  const raus = [];
  for (const w of woerter) {
    if (w.silben.length < 2) continue;
    if (!w.silben.every(s => s.gefunden)) continue;
    const soll = betonteSilbe(w.silben.map(s => s.text));
    const ist = hervorgehoben(w.silben);
    if (ist < 0) continue;
    raus.push({ wort: w.wort, soll, ist, stimmt: soll === ist });
  }
  return raus;
}

/* ---------------------------------------------------------------------------
   Was daraus für das Kind folgt
   --------------------------------------------------------------------------- */

export function zusammenfassung(ergebnis, betonungen = []) {
  const s = ergebnis.silben.filter(x => x.gefunden);
  const zaehle = f => s.filter(x => x.farbe === f).length;
  const holprig = zaehle('orange') + zaehle('rot');
  const gutBetont = betonungen.filter(b => b.stimmt).length;

  return {
    gruen: zaehle('gruen'), gelb: zaehle('gelb'),
    orange: zaehle('orange'), rot: zaehle('rot'),
    holprig,
    betonungGeprueft: betonungen.length,
    betonungRichtig: gutBetont,
    /* Die holprigsten Stellen - das sind die, die sich zu üben lohnen. */
    stolpersteine: ergebnis.silben
      .filter(x => x.farbe === 'rot' || x.farbe === 'orange')
      .map(x => x.wort || x.text)
      .filter((w, i, alle) => alle.indexOf(w) === i)
      .slice(0, 5)
  };
}
