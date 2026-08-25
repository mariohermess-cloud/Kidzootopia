/* Sichtbare Fassung der App.

   Wozu das gut ist: Die App läuft offline aus dem Zwischenspeicher des
   Service Workers. Nach einer Änderung kann auf dem Gerät deshalb noch tagelang
   die alte Fassung liegen, ohne dass man es merkt. Diese Datei liegt selbst im
   Zwischenspeicher – was der Eltern-Bereich anzeigt, ist also wirklich das,
   was auf dem Gerät läuft, nicht das, was auf dem Server steht.

   Bei jeder Änderung: NUMMER hier hochzählen UND in sw.js (CACHE) gleichziehen.
   tests/version.mjs prüft, dass beide übereinstimmen. */

export const NUMMER = 16;
export const STAND = '25.08.2026';

/* Neueste zuerst. Kurz und in Alltagssprache – das lesen Eltern, nicht Entwickler. */
export const VERLAUF = [
  { nr: 16, stand: '25.08.2026', was: [
    'Wiederholungen endgültig behoben: ist ein Weg leergeübt, wechselt die App den Weg',
    'Derselbe Fragewortlaut kommt in einer Runde nur noch einmal vor'
  ]},
  { nr: 15, stand: '25.08.2026', was: [
    'Diese Anzeige: welche Fassung auf diesem Gerät läuft, was neu ist und ob es eine neuere gibt',
    'Hinweis-Streifen, wenn im Hintergrund eine neue Fassung angekommen ist'
  ]},
  { nr: 14, stand: '25.08.2026', was: [
    'Zeichnen auf dem Tablet: nachfahren, Ein-Strich-Figuren, Symmetrie, aus dem Gedächtnis',
    'Fachliche Auswertung der Zeichnungen im Eltern-Bereich (Feinmotorik, Entwicklungsstufe, Kreativität)',
    'Der Begleiter lebt in der Bildschirmecke und reagiert auf Erfolg, Fehler und Leerlauf'
  ]},
  { nr: 13, stand: '25.08.2026', was: [
    'Knacknüsse auf 1.394 verschiedene Aufgaben erweitert',
    'Keine Wiederholungen mehr: jedes Kind bekommt nur Aufgaben, die es noch nicht hatte',
    'Fehlerhafte Altersaufgabe („Elias“) behoben – Geschichte und Rechnung passen jetzt zusammen'
  ]},
  { nr: 12, stand: '24.08.2026', was: [
    'Fünf Etappen bis ins Erwachsenenalter, jede mit eigenen Hauptwerken',
    'Stoische Lebenskunst: Seneca, Epiktet, Marc Aurel – mit Denk-Impulsen ohne Bewertung'
  ]},
  { nr: 11, stand: '24.08.2026', was: [
    'Hörgeschichten, Vorlesen über die Gerätestimme, Bilderrätsel und Puzzle',
    'Umzugs-Code, um den Fortschritt zwischen Browser und App zu übertragen'
  ]}
];

export const AKTUELL = VERLAUF[0];
