/* Sichtbare Fassung der App.

   Wozu das gut ist: Die App läuft offline aus dem Zwischenspeicher des
   Service Workers. Nach einer Änderung kann auf dem Gerät deshalb noch tagelang
   die alte Fassung liegen, ohne dass man es merkt. Diese Datei liegt selbst im
   Zwischenspeicher – was der Eltern-Bereich anzeigt, ist also wirklich das,
   was auf dem Gerät läuft, nicht das, was auf dem Server steht.

   Bei jeder Änderung: NUMMER hier hochzählen UND in sw.js (CACHE) gleichziehen.
   tests/version.mjs prüft, dass beide übereinstimmen. */

export const NUMMER = 30;
export const STAND = '29.08.2026';

/* Neueste zuerst. Kurz und in Alltagssprache – das lesen Eltern, nicht Entwickler. */
export const VERLAUF = [
  { nr: 30, stand: '29.08.2026', was: [
    'Neu: Strandfunde – Muschel, Schneckenhaus, Hai-Zahn, Sepiaschulp und mehr, jeweils als großes Bild',
    'Jeder Fund erklärt, woran man ihn wirklich erkennt: Form, Gewicht, Farbe, Herkunft',
    'Dazu Geschichten, Schätzfragen und Sicherheitsfragen rund um Strand und Watt (Quallen, Gezeiten)'
  ]},
  { nr: 29, stand: '29.08.2026', was: [
    'Neue Tiererkennung bei Allgemeinwissen: Insekten, die sich zum Verwechseln ähnlich sehen',
    'Honigbiene, Hummel, Wespe, Schwebfliege, Wildbiene und Hornisse – anhand echter Merkmale unterschieden, nicht nur an einem Bild',
    'Jede Frage erklärt, woran man die Art draußen wirklich erkennt – Körperform, Fell, Flugverhalten, Lebensweise'
  ]},
  { nr: 28, stand: '29.08.2026', was: [
    'Renn-Modus: ein Kreisel treibt das Rennen jetzt an, statt nur zuzusehen',
    'Mit dem Daumen andrehen – wie ein echter Kreisel läuft er nach und wird ohne Nachdrehen langsamer',
    'Wer schneller und öfter dreht, spult schneller durchs Rennen – das Ergebnis selbst bleibt unverändert das wirklich Erspielte'
  ]},
  { nr: 27, stand: '28.08.2026', was: [
    'Englisch komplett neu gedacht: für Kinder, die noch nicht lesen können – das Bild trägt die Bedeutung',
    'Jede Vokabel als großes Bild, mit einem 🔊-Knopf: erst das deutsche Wort, dann – mit echter englischer Stimme – das englische',
    'Neues Bild-Puzzle: das englische Wort steht da, gesucht wird das passende Bild unter vier großen Symbolen',
    'Über 50 kindgerechte Wörter: Tiere, Farben, Zahlen, Familie, Essen und mehr'
  ]},
  { nr: 26, stand: '28.08.2026', was: [
    'Neu: Überraschungsrätsel des Tages – eine Zahlenpyramide oder ein Waage-Rätsel, für alle Kinder an diesem Tag dasselbe',
    'Ein Bonus fürs Lösen, und morgen wartet ein neues – ein kleiner, ehrlicher Grund, öfter vorbeizuschauen',
    'Kein Netz nötig: das Rätsel wird aus dem Kalendertag berechnet, nicht von einem Server geholt'
  ]},
  { nr: 25, stand: '28.08.2026', was: [
    'Neu: Renn-Modus am Rundenende – der Avatar tritt gegen das eigene bisher beste Rennen an',
    'Kein Netz-Gegner: der „Geist" ist genau die Zeit-Punkte-Kurve der eigenen besten Runde',
    'Neues Lernziel „Gesund essen" – warum Wasser, Frühstück, Vielfalt und Zähneputzen wichtig sind, ohne Diätregeln oder verbotene Speisen'
  ]},
  { nr: 24, stand: '26.08.2026', was: [
    'Knacknüsse: das Schmierblatt steht von Anfang an offen da, statt erst entdeckt werden zu müssen',
    'Der Hinweis zu jeder Knacknuss sagt jetzt immer, dass man sich die Aufgabe aufmalen kann'
  ]},
  { nr: 23, stand: '26.08.2026', was: [
    'Rückblick am Rundenende: jede Frage mit gegebener und richtiger Antwort, und wo möglich einer Erklärung',
    'Allgemeinwissen erklärt jetzt jede Antwort – vorher stand dort nur „richtig wäre X", nie warum'
  ]},
  { nr: 22, stand: '25.08.2026', was: [
    'Sicherheitsfrage, bevor Arbeit weggeworfen wird: Zeichnung leeren, Schmierblatt leeren, neu legen, Talent-Test wiederholen',
    'Gefragt wird nur, wenn es etwas zu verlieren gibt – ein leeres Blatt zu leeren fragt nicht nach'
  ]},
  { nr: 21, stand: '25.08.2026', was: [
    'Zurück-Knopf im Talent-Test an JEDER Frage – vorher gab es ihn nur im ersten Teil',
    'Punkte für jede Aufgabe, mit Rang und bester Runde',
    'Vergleich auf dem Gerät: Geschwister nebeneinander',
    'Punkte können nur steigen – eine falsche Antwort gibt null, nie Abzug'
  ]},
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
