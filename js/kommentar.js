/* Ein Begleiter, der etwas zu sagen hat - und zwar zur Sache.

   Der Wunsch war "eine kleine Intelligenz", die einen Kommentar spricht.
   Was hier steht, ist KEIN Sprachmodell (warum nicht, steht unten). Es ist
   etwas, das in diesem Fall besser funktioniert: Die App weiss ueber jede
   Antwort mehr, als ein Sprachmodell aus dem Text erraten koennte -

     - richtig oder falsch, und WIE knapp daneben bei Zahlen
     - wie lange gebraucht (schnell geraten oder lange gerungen?)
     - wie viele Tipps geholt
     - wie lang die Serie ist, ob gerade ein Level gestiegen ist
     - ob das Schmierblatt benutzt wurde
     - welcher Weg gerade dran war und wie gut der bisher trug

   Daraus laesst sich etwas sagen, das WIRKLICH passt, statt allgemein zu
   loben. "Fast - du warst nur um 1 daneben" ist mehr wert als "Gut gemacht!",
   und es ist garantiert wahr. Ein kleines Sprachmodell wuerde hier gelegentlich
   Unsinn erzaehlen, und zwar einem Kind, das ihm glaubt.

   Die Rueckmeldungen folgen dabei einer Regel aus der Lernforschung (Hattie &
   Timperley 2007): Lob fuer die PERSON ("du bist so klug") wirkt schlechter als
   Rueckmeldung zur SACHE und zum WEG ("du hast den Umweg über die Skizze
   genommen - der hat funktioniert"). Deshalb steht hier fast nie "du bist",
   sondern fast immer "das war" oder "du hast". */

/* Zufaellig, aber nicht zweimal hintereinander dasselbe. */
const zuletzt = new Map();
function waehle(schluessel, liste) {
  if (!liste.length) return '';
  const vorher = zuletzt.get(schluessel);
  const moeglich = liste.length > 1 ? liste.filter(s => s !== vorher) : liste;
  const s = moeglich[Math.floor(Math.random() * moeglich.length)];
  zuletzt.set(schluessel, s);
  return s;
}

const SCHNELL_MS = 4000;      // darunter kaum gelesen
const LANGE_MS   = 25000;     // darüber wirklich gerungen

/* Wie knapp war eine Zahlantwort daneben? Nur dann sinnvoll, wenn beides
   Zahlen sind - "fast richtig" bei einer Vokabel waere Unsinn. */
function abstand(antwort, eingabe) {
  const z = s => {
    const x = String(s ?? '').replace(',', '.').trim();
    return /^-?\d+(\.\d+)?$/.test(x) ? Number(x) : null;
  };
  const a = z(antwort), e = z(eingabe);
  if (a === null || e === null) return null;
  return { diff: Math.abs(a - e), a, e };
}

/* Ziffernsturz erkennen: 63 statt 36. Ein haeufiger Fehler, der nichts mit
   Rechnen zu tun hat - und den ein Kind sofort versteht, wenn man ihn benennt. */
const vertauscht = (a, e) => {
  const x = String(a), y = String(e);
  return x.length === y.length && x.length >= 2 && x !== y &&
         [...x].sort().join('') === [...y].sort().join('');
};

/* Der Kern. Bekommt alles, was die App ohnehin weiss, und gibt einen Satz
   zurueck - oder nichts, wenn es nichts Sinnvolles zu sagen gibt. Lieber
   schweigen als etwas Beliebiges sagen. */
export function kommentar({ richtig, antwort, eingabe, ms = 0, tipps = 0,
                            serie = 0, levelHoch = false, skizze = false,
                            zielTitel = '', wegName = '', knacknuss = false } = {}) {
  const d = abstand(antwort, eingabe);

  if (richtig) {
    /* Reihenfolge nach Aussagekraft: Das Seltenste zuerst, das Allgemeine
       zuletzt. Sonst geht der interessante Fall im Standardlob unter. */
    if (levelHoch)
      return waehle('level', [
        `Stufe geschafft – ${zielTitel} wird ab jetzt schwerer.`,
        `Das war die vierte richtige in Folge. Nächste Stufe.`,
        `Aufgestiegen. Die nächsten Aufgaben ziehen an.`]);

    if (skizze)
      return waehle('skizze', [
        'Du hast es aufgemalt – und dann ging es. Genau dafür ist das Blatt da.',
        'Erst gezeichnet, dann gelöst. Das ist kein Umweg, das ist die Methode.',
        'Die Skizze hat es sichtbar gemacht. Merk dir den Griff.']);

    if (tipps === 0 && ms > 0 && ms < SCHNELL_MS)
      return waehle('flott', [
        'Ohne Zögern und ohne Tipp – das sitzt.',
        'Das kam wie aus der Pistole. Sitzt.',
        'Kein Nachdenken nötig gewesen – gut eingeübt.']);

    if (ms > LANGE_MS)
      return waehle('ausdauer', [
        'Lange drangeblieben und es geschafft. Das zählt mehr als schnell.',
        'Du hast dir Zeit genommen und bist drangeblieben. Genau richtig.',
        'Das hat gedauert – und du hast es trotzdem gelöst.']);

    if (tipps >= 2)
      return waehle('tipps', [
        'Mit Hilfe gelöst – und beim nächsten Mal brauchst du weniger davon.',
        'Du hast dir Hilfe geholt und sie benutzt. So geht Lernen.',
        'Tipps sind kein Schummeln. Gelöst hast du es.']);

    if (knacknuss)
      return waehle('knack', [
        'Eine Knacknuss geknackt. Die sind mit Absicht schwer.',
        'Diese Aufgabe stellen sich Leute seit Generationen. Du hast sie.',
        'Geknackt.']);

    if (serie >= 5)
      return waehle('serie', [
        `${serie} richtige hintereinander. Läuft.`,
        `Die ${serie}. richtige in Folge.`,
        `Fünf und mehr am Stück – da stimmt der Weg.`]);

    return waehle('ok', [
      'Richtig.', 'Stimmt.', 'Genau so.', 'Passt.',
      wegName ? `Über den ${wegName} hat es geklappt.` : 'Richtig.']);
  }

  /* Falsch: NIE die Person abwerten, immer die Sache benennen. Und wenn es
     etwas Konkretes zu sagen gibt, dann das - nicht ein allgemeines "schade". */
  if (d && vertauscht(d.a, d.e))
    return `Die Ziffern sind vertauscht: ${d.e} statt ${d.a}. Schau die Zahl noch einmal an.`;

  if (d && d.diff > 0 && d.diff <= 2 && Math.abs(d.a) > 3)
    return waehle('knapp', [
      `So nah dran – nur ${d.diff === 1 ? 'eins' : d.diff} daneben.`,
      `Fast. Der Abstand war ${d.diff}.`,
      `Um ${d.diff} verfehlt. Rechne die letzte Stelle nochmal.`]);

  if (d && d.a !== 0 && Math.abs(d.e / d.a - 10) < 0.001)
    return 'Zehnmal zu groß – da ist eine Null zu viel hineingerutscht.';
  if (d && d.e !== 0 && Math.abs(d.a / d.e - 10) < 0.001)
    return 'Zehnmal zu klein – da fehlt eine Null.';
  if (d && d.a !== 0 && Math.abs(d.e + d.a) < 0.001)
    return 'Der Betrag stimmt, nur das Vorzeichen nicht.';

  if (ms > 0 && ms < SCHNELL_MS)
    return waehle('schnell_falsch', [
      'Das ging sehr schnell. Lies die Aufgabe nochmal in Ruhe.',
      'Zu flott getippt. Nochmal langsam lesen hilft fast immer.',
      'Kurz durchatmen und die Frage nochmal lesen.']);

  if (tipps === 0)
    return waehle('ohne_tipp', [
      'Diesmal nicht – beim nächsten Mal lohnt sich der Tipp-Knopf.',
      'Nicht getroffen. Es gibt Tipps, die darf man holen.',
      'Falsch – und völlig in Ordnung. Nimm beim nächsten Mal einen Tipp dazu.']);

  if (!skizze)
    return waehle('ohne_skizze', [
      'Versuch es beim nächsten Mal aufzumalen – das Schmierblatt ist dafür da.',
      'Solche Aufgaben werden leichter, wenn man sie zeichnet.',
      'Nächstes Mal erst aufmalen, dann rechnen.']);

  return waehle('normal_falsch', [
    'Nicht getroffen. Weiter geht es.',
    'Falsch – das gehört dazu.',
    'Daneben. Die nächste kommt gleich.']);
}

/* Kurz genug zum Vorlesen? Sehr lange Saetze bremsen die Runde aus. */
export const vorlesbar = satz => !!satz && satz.length <= 120;
