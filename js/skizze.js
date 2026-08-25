/* Schmierblatt: die Nebenrechnung zum Mitmalen.

   Warum das keine Spielerei ist: "Zeichne eine Skizze" ist die aelteste und
   robusteste Problemloese-Strategie ueberhaupt - bei Polya steht sie als eigener
   Schritt ("Draw a figure"), und im Mathematikunterricht der Grundschule ist das
   Zeichnen von Mengen, Streifen und Balken der uebliche Weg von der Sprache zur
   Rechnung. Ein Kind, das bei "Anna hat 3 Tueten mit je 4 Aepfeln" nicht
   weiterkommt, kommt fast immer weiter, sobald es drei Tueten malen darf.

   Bisher hatte die App nur beim Fach Zeichnen eine Flaeche. Bei genau den
   Aufgaben, wo eine Skizze am meisten hilft - Sachaufgaben, Bruchteile,
   Knacknuesse - gab es nur Kopfrechnen oder gar nichts.

   Zwei Werkzeuge, mehr nicht:
     STIFT  - frei zeichnen, Balken, Pfeile, Tuetchen
     ZAEHLEN- jeder Tipp setzt einen nummerierten Punkt und zaehlt mit.
              Genau dafuer, wozu Kinder sonst Striche machen und sich verzaehlen.

   Das Blatt wird NIE bewertet und nie in die Galerie gelegt. Es ist Schmierpapier.
   Gespeichert wird nur, DASS es benutzt wurde - das ist fuer die Eltern ein
   nuetzlicher Hinweis darauf, wie ihr Kind denkt. */

export const WERKZEUGE = ['stift', 'zaehlen'];

/* Ein Blatt ist ein reines Datenobjekt. So laesst sich die Logik pruefen,
   ohne einen Browser zu starten. */
export const leeresBlatt = () => ({ striche: [], marken: [] });

export function neuerStrich(blatt, punkt) {
  const strich = [punkt];
  blatt.striche.push(strich);
  return strich;
}

/* Setzt eine Zaehlmarke. Sitzt sie fast genau auf einer vorhandenen, wird die
   alte entfernt statt einer zweiten daneben - so kann ein Kind sich korrigieren,
   ohne das ganze Blatt zu leeren. */
export const MARKE_NAH = 0.045;

export function marke(blatt, punkt) {
  const treffer = blatt.marken.findIndex(m =>
    Math.hypot(m.x - punkt.x, m.y - punkt.y) < MARKE_NAH);
  if (treffer >= 0) { blatt.marken.splice(treffer, 1); return { entfernt: true }; }
  /* Die Zeit muss mit: Ohne sie kann "zurueck" nicht entscheiden, ob zuletzt
     ein Strich oder eine Marke dran war. */
  blatt.marken.push({ x: punkt.x, y: punkt.y, t: punkt.t ?? 0 });
  return { entfernt: false };
}

/* Rueckgaengig macht das zuletzt Getane - egal ob Strich oder Marke.
   Ohne Reihenfolge waere es verwirrend: Wer eben einen Punkt gesetzt hat und
   auf "zurueck" tippt, erwartet, dass der Punkt verschwindet, nicht ein Strich
   von vorhin. */
export function zurueck(blatt) {
  const letzterStrich = blatt.striche.at(-1);
  const letzteMarke = blatt.marken.at(-1);
  if (!letzterStrich && !letzteMarke) return null;
  if (!letzteMarke) { blatt.striche.pop(); return 'strich'; }
  if (!letzterStrich) { blatt.marken.pop(); return 'marke'; }
  /* Beides da: das Juengere gewinnt. Striche tragen die Zeit ihres ersten
     Punktes, Marken die ihres Setzens. */
  const zeitStrich = letzterStrich[0]?.t ?? 0;
  const zeitMarke = letzteMarke.t ?? 0;
  if (zeitMarke >= zeitStrich) { blatt.marken.pop(); return 'marke'; }
  blatt.striche.pop(); return 'strich';
}

export const leeren = blatt => { blatt.striche = []; blatt.marken = []; };

export const istLeer = blatt =>
  !blatt || (!blatt.marken.length && !blatt.striche.some(s => s.length));

/* Wurde wirklich etwas gemalt oder nur einmal danebengetippt? Ein einzelner
   Punkt ohne Bewegung zaehlt nicht als Skizze. */
export function benutzt(blatt) {
  if (!blatt) return false;
  if (blatt.marken.length >= 2) return true;
  return blatt.striche.some(s => s.length >= 3);
}
