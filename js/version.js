/* Sichtbare Fassung der App.

   Wozu das gut ist: Die App läuft offline aus dem Zwischenspeicher des
   Service Workers. Nach einer Änderung kann auf dem Gerät deshalb noch tagelang
   die alte Fassung liegen, ohne dass man es merkt. Diese Datei liegt selbst im
   Zwischenspeicher – was der Eltern-Bereich anzeigt, ist also wirklich das,
   was auf dem Gerät läuft, nicht das, was auf dem Server steht.

   Bei jeder Änderung: NUMMER hier hochzählen UND in sw.js (CACHE) gleichziehen.
   tests/version.mjs prüft, dass beide übereinstimmen. */

export const NUMMER = 20;
export const STAND = '25.08.2026';

/* Neueste zuerst. Kurz und in Alltagssprache – das lesen Eltern, nicht Entwickler. */
export const VERLAUF = [
  { nr: 20, stand: '25.08.2026', was: [
    'Beim Vorlesen wandert eine Markierung mit – die App weiß, wo im Text du gerade bist',
    'Danach ist der Text Silbe für Silbe eingefärbt: grün flüssig, rot langer Halt',
    'Betonung wird geprüft: liegt der Ton auf der richtigen Silbe?',
    'Wörter, an denen es regelmäßig hakt, merkt sich die App – und vergisst sie wieder, sobald sie flüssig werden'
  ]},
  { nr: 19, stand: '25.08.2026', was: [
    'Eigenes Zahlenfeld mit Minus und Komma – Aufgaben mit −1 oder 12,5 waren vorher nicht lösbar',
    'Neues Lernziel „Silben hören & bauen": zählen, finden, zusammensetzen, Lücken füllen',
    'Rückmeldungen, die zur Antwort passen („Die Ziffern sind vertauscht", „nur 1 daneben") – auf Wunsch vorgelesen',
    'Antwortprüfung berichtigt: „Bau" galt als richtige Antwort auf „Baum"'
  ]},
  { nr: 18, stand: '25.08.2026', was: [
    'Schmierblatt an jeder Aufgabe: aufmalen, statt alles im Kopf zu behalten',
    'Zähl-Werkzeug – jeder Tipp setzt einen nummerierten Punkt, kein Verzählen mehr',
    'Im Eltern-Bereich: bei welchen Zielen der Weg über ein Bild führt'
  ]},
  { nr: 17, stand: '25.08.2026', was: [
    'Vorlesen üben: der Text steht in Silben eingefärbt da, das Mikrofon misst die Leseflüssigkeit',
    'Derselbe Text kommt dreimal – das ist die Methode, die bei stockendem Lesen wirkt',
    'Der Ton bleibt auf dem Gerät: keine Worterkennung, keine Aufnahme, nichts wird verschickt',
    'Im Eltern-Bereich: Tempo, Stockungen und Betonung über die Zeit'
  ]},
  { nr: 16, stand: '25.08.2026', was: [
    'Wiederholungen endgültig behoben: ist ein Weg leergeübt, wechselt die App den Weg',
    'Derselbe Fragewortlaut kommt in einer Runde nur noch einmal vor',
    'Die App holt sich neue Fassungen jetzt selbst – auch, wenn sie nur wieder eingeblendet wird',
    'Notausgang im Eltern-Bereich, falls doch einmal die alte Fassung hängen bleibt'
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
