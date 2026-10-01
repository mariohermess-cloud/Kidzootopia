/* Lernziele nach dem luxemburgischen Lehrplan (École fondamentale, Plan d'études 2026).

   QUELLE: docs/plan-detudes-enseignement-fondamental-2026.pdf
           (© MENJE/SCRIPT, Luxemburg) – liegt im Repo.

   ZUSCHNITT: Pro Fach und Zyklus ein Lernziel.
     Zyklus 2 = Klasse 1–2, Zyklus 3 = Klasse 3–4, Zyklus 4 = Klasse 5–6.
     Ziele: lu_mathe_z2/z3/z4, lu_deutsch_z2/z3/z4, lu_franzoesisch_z2/z3/z4,
            lu_sach_z2/z3/z4 (Fach „Allgemeinwissen“).

   WAS IST WOHER – bitte beim Prüfen beachten:
     * MATHE: DIREKT aus dem Plan d'études 2026 (Druckseite 30 = Zyklus 2,
       Seite 31 = Zyklus 3, Seite 32 = Zyklus 4, jeweils „Mathématiques“,
       Niveau socle und niveau avancé). Die Aufgaben werden berechnet, nie
       abgeschrieben; Unterrichtssprache Mathe in Luxemburg ist Deutsch.
       Auch die Bereiche „Daten“, „Symmetrie“ und „Problemlösen / Algorithmen“
       sind abgedeckt (ohne Grafik, als Text, Kästchen-Zeilen oder Tabelle):
         Z2 (S. 30): Muster fortsetzen, Symmetrie, Weg beschreiben (links/rechts),
            Strichliste, Größen mit gleicher Einheit, Einheit schätzen (1 m, 1 kg, 1 l).
         Z3 (S. 31): Flächeneinheiten (mm², cm², m², km²), Tonne, Dezimaldarstellung
            („2 km 500 m = 2,5 km“), Säulendiagramm mit Skala lesen und Skala wählen,
            Spiegelachsen, Roboter-Befehle auf dem Gitter, Kombinatorik mit 3 Elementen.
         Z4 (S. 32): Zahlengerade mit Dezimalzahlen und Brüchen, Brüche addieren und
            subtrahieren, Algorithmen mit Bedingung und Wiederholung, Maßstab und
            Verhältnis, Verschieben und Spiegeln im Koordinatengitter, Häufigkeit und
            Prozent aus Diagrammen, cm³ und Liter, zusammengesetzte Flächen, Oberfläche.
     * DEUTSCH und FRANZÖSISCH: ABGELEITET. Der Plan nennt dafür nur
       Kompetenzen (Druckseite 20–27), keine Themenlisten. Die Fragen sind
       eine Auslegung dieser Kompetenzen und müssen von einer Fachperson
       (Lehrkraft) geprüft werden, bevor sie als „lehrplangetreu“ gelten.
       Zyklus 2 Französisch ist laut Plan nur mündlich/Alltag (Seite 22);
       die Fragen hier sind trotzdem Lesefragen mit kurzen Wörtern, weil die
       App nichts anderes kann – das ist eine Vereinfachung.
     * SACHUNTERRICHT („Éveil aux sciences, sciences humaines et naturelles“):
       ABGELEITET aus den Kompetenzen des Plans (Druckseite 34–38; vier Bereiche
       je Zyklus: Nature et homme, Technologie et objets techniques, Terre et
       espace, Temps et évolution). Der Plan nennt keine Themenlisten; die
       Fragen sind eine Auslegung und müssen von einer Fachperson geprüft
       werden. Bewusst allgemein gehalten, ohne luxemburg-spezifische Fakten.

   Aufbau: luGen(h) bekommt die Helfer aus generators.js (r, pick, shuffle,
   wahl, zahlText, zahlChoice) und liefert die Generatoren GEN[id][weg](level).
   So gibt es keinen Kreisimport. Feste Fragen: [Frage, richtig, [3 falsche],
   Erklärung] wie bei „Allgemeinwissen“; die Erklärung landet in `hilfe`. */

/* Darstellung großer Zahlen wie im Plan („1 000 000“): Leerzeichen ab 5 Stellen. */
const gross = n => n >= 10000 ? String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : String(n);

/* Dezimalzahl aus Hundertsteln, mit Komma und ohne überflüssige Nullen.
   Gerechnet wird immer in ganzen Hundertsteln – so gibt es keine Rundungsfehler. */
const dez = h100 => {
  const s = (Math.abs(h100) / 100).toFixed(2).replace(/0+$/, '').replace(/\.$/, '').replace('.', ',');
  return (h100 < 0 ? '-' : '') + s;
};

const WOCHE = ['Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag','Sonntag'];
const MONATE = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
const NAMEN = ['Lina','Ben','Mia','Jonas','Emma','Noah','Zoe','Ali','Marie','Luca','Ida','Elias'];
const ggT = (a, b) => b ? ggT(b, a % b) : a;

/* ======================== FESTE FRAGEN: Mathe (Zyklus 2) ======================== */

/* Formen und Körper (Plan Z2: Quadrat, Rechteck, Dreieck, Kreis; Würfel, Quader, Kugel) */
const Z2_FORMEN = [
  ['Wie viele Ecken hat ein Dreieck?','3',['2','4','0'],'Ein Dreieck hat drei Ecken und drei Seiten – daher der Name.'],
  ['Wie viele Ecken hat ein Rechteck?','4',['3','2','6'],'Ein Rechteck hat vier Ecken, alle sind rechte Winkel.'],
  ['Welche Form hat vier gleich lange Seiten und vier rechte Winkel?','Quadrat',['Dreieck','Kreis','Rechteck mit zwei langen und zwei kurzen Seiten'],
    'Beim Quadrat sind alle vier Seiten gleich lang. Beim Rechteck sind nur die gegenüberliegenden Seiten gleich lang.'],
  ['Welche Form hat keine Ecken?','Kreis',['Quadrat','Dreieck','Rechteck'],'Ein Kreis ist rund, er hat weder Ecken noch gerade Seiten.'],
  ['Welcher Körper sieht aus wie ein Spielwürfel?','Würfel',['Kugel','Quader','Kreis'],'Ein Würfel hat sechs gleich große Quadrate als Flächen.'],
  ['Welcher Körper kann rollen, egal wie du ihn hinlegst?','Kugel',['Würfel','Quader','Dreieck'],'Eine Kugel ist überall rund, sie hat keine ebene Fläche, auf der sie liegen bleibt.'],
  ['Welcher Körper sieht aus wie ein Schuhkarton?','Quader',['Kugel','Würfel','Kreis'],'Ein Quader hat sechs rechteckige Flächen, ein Schuhkarton ist ein Beispiel. Ein Würfel wäre in allen Richtungen gleich lang.'],
  ['Wie viele Flächen hat ein Würfel?','6',['4','8','12'],'Oben, unten und vier Seiten: zusammen sechs Quadrate.']
];

/* sicher / wahrscheinlich / unmöglich (Plan Z2: « certain », « probable », « impossible ») */
const Z2_WAHRSCH = [
  ['Nach dem Montag kommt der Dienstag.','sicher'],
  ['Du wirfst einen normalen Spielwürfel und er zeigt die Zahl 7.','unmöglich'],
  ['Du wirfst einen normalen Spielwürfel und er zeigt eine Zahl von 1 bis 6.','sicher'],
  ['In einem Beutel sind nur rote Kugeln. Du ziehst eine blaue Kugel.','unmöglich'],
  ['In einem Beutel sind nur rote Kugeln. Du ziehst eine rote Kugel.','sicher'],
  ['In einem Beutel sind 9 rote Kugeln und 1 blaue Kugel. Du ziehst eine rote Kugel.','wahrscheinlich'],
  ['Ein Hund fliegt ohne Hilfsmittel wie ein Vogel.','unmöglich'],
  ['Im Sommer sind einige Tage warm.','wahrscheinlich']
];

/* Einheit schätzen (Plan Z2: « 1 m, 1 kg, 1 l » ; dazu Stunden). Keine Zahl in den Optionen. */
const Z2_EINHEIT = [
  ['Welche Einheit passt? Ein Tisch ist ungefähr 1 ___ lang.','m',['kg','l','h'],'Ein Meter ist etwa so lang wie ein Tisch breit ist. Kilogramm misst Gewicht, Liter misst Flüssigkeit, Stunden messen Zeit.'],
  ['Welche Einheit passt? Ein Brot wiegt ungefähr 1 ___.','kg',['m','l','h'],'Das Gewicht misst man in Kilogramm.'],
  ['Welche Einheit passt? In eine große Wasserflasche passt 1 ___.','l',['m','kg','h'],'Wie viel in ein Gefäß passt, misst man in Litern.'],
  ['Welche Einheit passt? Ein Film dauert ungefähr 2 ___.','h',['m','kg','l'],'Zeit misst man in Stunden und Minuten.'],
  ['Welche Einheit passt? Die Tür im Klassenzimmer ist ungefähr 2 ___ hoch.','m',['kg','l','h'],'Eine Tür ist etwa zwei Meter hoch – das ist die Länge von zwei Tischen.'],
  ['Welche Einheit passt? Ein Eimer Wasser fasst ungefähr 10 ___.','l',['m','kg','h'],'Wie viel in einen Eimer passt, misst man in Litern.']
];

/* ======================== FESTE FRAGEN: Mathe (Zyklus 3) ======================== */

/* Einheit wählen (Plan Z3: g, kg, t; mm, cm, m, km; s, min, h; €, Cent) */
const Z3_EINHEIT = [
  ['Welche Einheit passt zur Länge eines Bleistifts?','cm',['mm','m','km'],'Ein Bleistift ist etwa 15 bis 20 Zentimeter lang.'],
  ['Welche Einheit passt zur Entfernung zwischen zwei Städten?','km',['mm','cm','kg'],'Städte liegen viele Kilometer auseinander; Meter wären schon sehr kleinteilig.'],
  ['Welche Einheit passt zum Gewicht eines Schulkindes?','kg',['g','mm','min'],'Ein Kind wiegt etwa 25 bis 40 Kilogramm.'],
  ['Welche Einheit passt zum Gewicht einer Tafel Schokolade?','g',['kg','cm','h'],'Eine Tafel Schokolade wiegt etwa 100 Gramm. Kilogramm wäre viel zu groß.'],
  ['Welche Einheit passt zur Dauer eines Kinofilms?','h',['s','mm','g'],'Ein Film dauert etwa ein bis zwei Stunden.'],
  ['Welche Einheit passt zur Dicke einer Münze?','mm',['m','km','kg'],'Eine Münze ist nur ein paar Millimeter dick.'],
  ['Welche Einheit passt zum Gewicht eines voll beladenen Lastwagens?','t',['g','mm','min'],'Ein Lastwagen wiegt viele tausend Kilogramm. Dafür nimmt man die Tonne: 1 t = 1000 kg.'],
  ['Welche Einheit passt zur Länge eines Klassenzimmers?','m',['mm','km','g'],'Ein Klassenzimmer ist etwa 8 Meter lang. Zentimeter wären eine sehr große Zahl.']
];

/* Flächeneinheit wählen (Plan Z3: mm², cm², m², km²). Immer alle vier Einheiten als Optionen, keine Zahl. */
const Z3_FLAECHE = [
  ['Welche Einheit passt zur Fläche eines Klassenzimmers?','m²','Ein Klassenzimmer ist etwa 60 Quadratmeter groß. Quadratzentimeter wären eine riesige Zahl.'],
  ['Welche Einheit passt zur Fläche eines ganzen Landes?','km²','Länder messen viele Quadratkilometer, Quadratmeter wären riesige Zahlen.'],
  ['Welche Einheit passt zur Fläche einer Heftseite?','cm²','Eine Heftseite hat einige hundert Quadratzentimeter.'],
  ['Welche Einheit passt zur Fläche eines Stecknadelkopfs?','mm²','Ein Stecknadelkopf ist nur ein paar Quadratmillimeter groß.'],
  ['Welche Einheit passt zur Fläche eines Fußballfelds?','m²','Ein Fußballfeld hat etwa 7000 Quadratmeter. Quadratkilometer wären viel zu groß.']
];

/* Körper und Netze (Plan Z3: Würfel, Quader, Pyramide, Zylinder, Kegel und ihre Netze) */
const Z3_KOERPER = [
  ['Das Netz besteht aus 6 gleich großen Quadraten. Zu welchem Körper lässt es sich falten?','Würfel',['Kugel','Zylinder','Kegel'],
    'Ein Würfel hat sechs gleich große quadratische Flächen. Das Netz ist die ausgeklappte Hülle.'],
  ['Wie viele Flächen hat ein Quader?','6',['4','8','12'],'Ein Quader hat oben und unten je ein Rechteck und vier Seitenflächen, zusammen sechs.'],
  ['Wie viele Kanten hat ein Würfel?','12',['6','8','10'],'4 Kanten oben, 4 unten und 4 senkrechte dazwischen: 4 + 4 + 4 = 12.'],
  ['Wie viele Ecken hat ein Quader?','8',['6','12','4'],'4 Ecken oben und 4 unten: zusammen 8.'],
  ['Eine Pyramide hat ein Quadrat als Grundfläche. Wie viele Dreiecke hat ihre Hülle?','4',['2','3','6'],
    'Auf jeder der vier Seiten des Quadrats steht ein Dreieck. Dazu kommt die quadratische Grundfläche.'],
  ['Welcher Körper hat als Grundfläche und als Deckfläche je einen Kreis?','Zylinder',['Kegel','Würfel','Pyramide'],
    'Eine Konservendose ist ein Zylinder: unten und oben ein Kreis. Beim Kegel gibt es nur unten einen Kreis und oben eine Spitze.'],
  ['Welcher Körper hat einen Kreis als Grundfläche und oben eine Spitze?','Kegel',['Zylinder','Quader','Würfel'],
    'Eine Eistüte ist ein Kegel. Unten ein Kreis, nach oben läuft sie spitz zu.']
];

/* ======================== FESTE FRAGEN: Deutsch ======================== */

/* Zyklus 2: Buchstaben/Laute, Abschreiben, Silben, einfache Rechtschreibung, kurze Sätze lesen,
   Informationen im Text finden. ABGELEITET aus „Alphabétisation“ (Seite 21). */
const D2_KNOBELN = [
  ['Wie viele Silben hat das Wort „Banane“?','3',['2','4','1'],'Ba-na-ne: beim Klatschen kommen drei Klatscher.'],
  ['Wie viele Silben hat das Wort „Schmetterling“?','3',['2','4','5'],'Schmet-ter-ling: drei Silben, auch wenn das Wort lang ist.'],
  ['Welcher Buchstabe ist ein Selbstlaut (Vokal)?','o',['b','k','t'],'Die Selbstlaute sind a, e, i, o, u. Alle anderen Buchstaben sind Mitlaute.'],
  ['Welcher Buchstabe ist ein Umlaut?','ä',['a','e','o'],'Die Umlaute sind ä, ö und ü – es sind Selbstlaute mit zwei Pünktchen.'],
  ['Welches Wort beginnt mit demselben Laut wie „Mama“?','Maus',['Tasse','Hase','Nase'],'„Mama“ und „Maus“ beginnen beide mit M. „Nase“ beginnt mit N.'],
  ['Welches Wort ist richtig abgeschrieben? Vorlage: „Schule“','Schule',['Schuhle','Sule','Schulle'],'„Schule“ schreibt man mit sch am Anfang und ohne h und ohne Doppel-l.'],
  ['Du schreibst das Wort „Apfel“ ab. Welche Abschrift ist richtig?','Apfel',['Afel','Apfell','Appfel'],'Das Wort hat die Buchstaben A-p-f-e-l. Vergleiche Buchstabe für Buchstabe mit der Vorlage.'],
  ['Welches Wort im Satz „der Hund bellt laut“ ist ein Namenwort (Nomen)?','Hund',['bellt','laut','der'],
    'Ein Namenwort benennt ein Lebewesen oder ein Ding, hier den Hund. Namenwörter schreibt man groß. „bellt“ ist ein Tunwort.'],
  ['Wie viele Wörter hat der Satz „Die Katze schläft.“?','3',['2','4','1'],'Die – Katze – schläft: drei Wörter, der Punkt zählt nicht mit.'],
  ['Welches Wort ergibt sich aus den Silben „Ha“ und „se“?','Hase',['Seha','Hasen','Haas'],'Ha + se zusammen gelesen ergibt „Hase“.']
];
const D2_ERZAEHLEN = [
  ['Tom hat einen kleinen Hund. Der Hund heißt Bello und ist braun. Wie heißt der Hund?','Bello',['Tom','Max','Braun'],'Im Text steht: „Der Hund heißt Bello.“'],
  ['Mia packt ein Buch, ein Heft und einen Stift in ihre Schultasche. Was packt Mia NICHT ein?','einen Ball',['ein Buch','ein Heft','einen Stift'],'Gefragt ist, was nicht im Text steht: ein Ball wird nicht genannt.'],
  ['Am Montag regnet es. Am Dienstag scheint die Sonne. An welchem Tag scheint die Sonne?','Dienstag',['Montag','Mittwoch','Sonntag'],'Im Text steht: „Am Dienstag scheint die Sonne.“'],
  ['Lena hat zwei Katzen und einen Hund. Wie viele Tiere hat Lena?','3',['2','1','4'],'Zwei Katzen und ein Hund: 2 + 1 = 3 Tiere.'],
  ['Der Hahn kräht am Morgen. Wann kräht der Hahn?','am Morgen',['am Abend','am Mittag','in der Pause'],'Das Wort „Morgen“ steht im ersten Satz.'],
  ['Der Bus kommt um acht Uhr. Wann kommt der Bus?','um acht Uhr',['um sieben Uhr','um neun Uhr','um zehn Uhr'],'Lies die Uhrzeit im Satz genau: „acht Uhr“.'],
  ['Sara füttert die Fische und gießt die Blumen. Was gießt Sara?','die Blumen',['die Fische','den Hund','den Baum'],'Im Satz heißt es: „gießt die Blumen“. Die Fische werden gefüttert.'],
  ['Was reimt sich auf „Haus“?','Maus',['Hund','Baum','Hand'],'Reimwörter klingen am Ende gleich: Haus – Maus.'],
  ['Der Ball ist rot. Welche Farbe hat der Ball?','rot',['blau','grün','gelb'],'Im Satz steht die Farbe direkt: „Der Ball ist rot.“'],
  ['Welches Wort ist das Gegenteil von „groß“?','klein',['breit','dick','laut'],'Groß und klein sind Gegenteile.']
];

/* Zyklus 3: Rechtschreibregeln, Wortarten, Satzzeichen, Wortschatz, Leseverstehen.
   ABGELEITET aus Seite 23 („Langue allemande“, Zyklus 3). */
const D3_KNOBELN = [
  ['Welches Wort ist ein Nomen (Namenwort)?','Freundschaft',['laufen','schnell','und'],
    'Nomen benennen Dinge, Lebewesen oder Gefühle. Du kannst „die“ davorsetzen: die Freundschaft.'],
  ['Welches Wort ist ein Verb (Tunwort)?','springen',['Sprung','hoch','Wiese'],'Ein Verb sagt, was jemand tut: springen. „Sprung“ ist ein Nomen.'],
  ['Welches Wort ist ein Adjektiv (Wiewort)?','freundlich',['Freund','freuen','Freundin'],'Ein Adjektiv beschreibt, wie etwas ist: ein freundlicher Mensch.'],
  ['Welches Wort ist richtig geschrieben?','Sonne',['Sone','Sohne','Sonnne'],
    'Nach dem kurzen o folgen zwei Konsonanten: Son-ne. Beim kurzen Selbstlaut verdoppelt man oft den Mitlaut.'],
  ['Welches Wort ist richtig geschrieben?','Bohne',['Bonne','Boone','Bone'],
    'Das o in „Bohne“ klingt lang, hier steht ein Dehnungs-h dahinter. Das muss man sich merken.'],
  ['Welches Satzzeichen steht am Ende von „Wohin gehst du“?','das Fragezeichen',['der Punkt','das Ausrufezeichen','das Komma'],'Eine Frage endet mit einem Fragezeichen.'],
  ['Was ist das Gegenteil von „mutig“?','ängstlich',['stark','schlau','laut'],'Wer mutig ist, traut sich etwas. Das Gegenteil ist ängstlich.'],
  ['Welcher Oberbegriff passt zu Apfel, Birne und Kirsche?','Obst',['Gemüse','Getränke','Süßigkeiten'],'Alle drei wachsen an Bäumen und sind Obst.'],
  ['Welche zwei Wörter im Satz „wir spielen im garten fußball“ schreibt man (außer dem ersten Wort) groß?','Garten und Fußball',
    ['spielen und Garten','im und Fußball','spielen und im'],
    '„Garten“ und „Fußball“ sind Nomen und werden großgeschrieben. „spielen“ ist ein Verb, „im“ ein kleines Wort.']
];
const D3_ERZAEHLEN = [
  ['Der Fuchs lebt in einem Bau unter der Erde. Nachts geht er auf Jagd. Er frisst Mäuse, Vögel und manchmal Beeren.\n\nWas ist die Hauptidee des Textes?',
    'Er erzählt, wie der Fuchs lebt und was er frisst',
    ['Er erzählt von einem Haustier','Er erklärt, wie man einen Bau baut','Er beschreibt den Wald im Winter'],
    'Die Hauptidee ist das, wovon fast alle Sätze handeln: Wohnort, Jagdzeit und Futter des Fuchses.'],
  ['Der Fuchs lebt in einem Bau unter der Erde. Nachts geht er auf Jagd. Er frisst Mäuse, Vögel und manchmal Beeren.\n\nWann geht der Fuchs auf Jagd?',
    'nachts',['am Mittag','am Morgen','nur im Winter'],'Im zweiten Satz steht: „Nachts geht er auf Jagd.“'],
  ['Anna fährt meistens mit dem Fahrrad zur Schule, weil der Weg nur zwei Kilometer lang ist. Bei Regen nimmt sie den Bus.\n\nWann nimmt Anna den Bus?',
    'bei Regen',['jeden Tag','bei Sonne','wenn sie müde ist'],'Im letzten Satz steht: „Bei Regen nimmt sie den Bus.“'],
  ['Anna fährt meistens mit dem Fahrrad zur Schule, weil der Weg nur zwei Kilometer lang ist. Bei Regen nimmt sie den Bus.\n\nWarum fährt Anna meistens mit dem Fahrrad?',
    'Der Schulweg ist nur zwei Kilometer lang',['Sie hat keinen Bus','Sie mag Regen','Die Schule ist sehr weit weg'],
    'Das Wort „weil“ im Text nennt den Grund: der kurze Weg.'],
  ['In der Pause spielen Kinder Fangen, Seilspringen oder Fußball. Mia liebt Seilspringen. Ben spielt lieber Fußball.\n\nWer spielt am liebsten Fußball?',
    'Ben',['Mia','Ben und Mia','niemand'],'Der letzte Satz sagt: „Ben spielt lieber Fußball.“ Mia mag Seilspringen.'],
  ['Wie setzt man die Kommas richtig? „Wir kaufen Äpfel Birnen und Bananen.“','Wir kaufen Äpfel, Birnen und Bananen.',
    ['Wir kaufen, Äpfel, Birnen, und Bananen.','Wir kaufen Äpfel Birnen, und Bananen.','Wir kaufen Äpfel, Birnen, und, Bananen.'],
    'Bei einer Aufzählung trennt das Komma die Wörter. Vor „und“ steht kein Komma.'],
  ['Welches Wort ist das Gegenteil von „früh“?','spät',['gestern','morgen','schnell'],'Früh und spät sind Gegenteile bei der Uhrzeit.'],
  ['Welches Wort passt nicht in die Reihe: Hammer, Säge, Zange, Banane?','Banane',['Hammer','Säge','Zange'],'Hammer, Säge und Zange sind Werkzeuge. Eine Banane ist Obst.'],
  ['Warum schreibt man „Lesen“ in „Das Lesen macht mir Spaß“ groß?','Nach „das“ ist das Verb zum Nomen geworden',
    ['Es steht am Satzanfang','Es ist ein Eigenname','Es ist ein Adjektiv'],
    'Ein Verb mit „das“ davor wird zum Nomen („das Lesen“) und wird großgeschrieben. Am Satzanfang steht hier „Das“.'],
  ['Im Satz „Der kleine Hund bellt.“: Welches Wort ist ein Adjektiv?','kleine',['Hund','bellt','Der'],'Das Adjektiv „kleine“ beschreibt, wie der Hund ist.']
];

/* Zyklus 4: Zeitformen, Satzglieder, Wortfamilien, Satzzeichen, Textarten, Zusammenfassen,
   Schlussfolgerungen. ABGELEITET aus Seite 24 („Langue allemande“, Zyklus 4). */
const D4_KNOBELN = [
  ['In welcher Zeitform steht der Satz „Gestern spielte ich Fußball.“?','Präteritum',['Präsens','Perfekt','Futur'],
    '„spielte“ ist die einfache Vergangenheit, das Präteritum. Im Perfekt hieße es: „Ich habe gespielt.“'],
  ['Welcher Satz steht im Perfekt?','Ich habe das Buch gelesen.',['Ich las das Buch.','Ich lese das Buch.','Ich werde das Buch lesen.'],
    'Das Perfekt wird aus „haben“ oder „sein“ und dem Partizip gebildet: habe gelesen.'],
  ['Wie lautet das Futur I von „ich spiele“?','ich werde spielen',['ich habe gespielt','ich spielte','ich spiele gerade'],
    'Das Futur wird mit „werden“ und dem Grundwort gebildet: ich werde spielen.'],
  ['Wie lautet das Partizip II von „schreiben“?','geschrieben',['geschreibt','schrieb','schreibend'],
    'Schreiben ist ein starkes Verb: schreiben – schrieb – geschrieben.'],
  ['Setze ins Präteritum: „Wir gehen ins Kino.“','Wir gingen ins Kino.',['Wir gehen ins Kino.','Wir sind ins Kino gegangen.','Wir werden ins Kino gehen.'],
    '„gingen“ ist das Präteritum von „gehen“. „sind gegangen“ wäre das Perfekt.'],
  ['Im Satz „Der Hund frisst den Knochen.“: Was ist das Subjekt?','Der Hund',['frisst','den Knochen','Der'],
    'Frage: Wer oder was frisst? – Der Hund. Das ist das Subjekt.'],
  ['Im Satz „Lena schenkt ihrer Oma Blumen.“: Welches Satzglied ist das Dativobjekt?','ihrer Oma',['Lena','Blumen','schenkt'],
    'Frage: Wem schenkt Lena Blumen? – Ihrer Oma. Das ist das Dativobjekt.'],
  ['Im Satz „Die Kinder lachen laut.“: Welches Wort ist das Prädikat?','lachen',['Die Kinder','laut','Die'],'Das Prädikat ist die Satzaussage, also das Verb: lachen.'],
  ['Welches Wort gehört zur Wortfamilie von „fahren“?','Fahrzeug',['Farbe','Fenster','Flasche'],'In „Fahrzeug“ steckt der Wortstamm „fahr“. Die anderen Wörter haben ihn nicht.'],
  ['Welches Wort gehört NICHT zur Wortfamilie von „spielen“?','spülen',['Spieler','Spielzeug','Gegenspieler'],
    'Spieler, Spielzeug und Gegenspieler enthalten den Stamm „spiel“. „spülen“ hat einen anderen Stamm.']
];
const D4_ERZAEHLEN = [
  ['Zutaten: 200 g Mehl, 2 Eier. Rühre alles glatt und backe es 20 Minuten.\n\nWelche Textart ist das?','Anleitung (Rezept)',
    ['Märchen','Gedicht','Zeitungsbericht'],'Zutatenliste und Befehle (rühre, backe) sind typisch für eine Anleitung.'],
  ['„Es war einmal ein König, der hatte drei Töchter …“\n\nWelche Textart beginnt so?','Märchen',['Nachricht','Gebrauchsanweisung','Steckbrief'],
    '„Es war einmal“ ist der klassische Märchenanfang.'],
  ['Der Wald brannte nach einer langen Trockenheit. Die Feuerwehr kämpfte zwei Tage lang gegen die Flammen. Am Ende wurde niemand verletzt, aber viele Bäume verbrannten.\n\nWelcher Satz fasst den Text am besten zusammen?',
    'Nach langer Trockenheit brannte ein Wald; die Feuerwehr kämpfte zwei Tage gegen das Feuer, verletzt wurde niemand.',
    ['Die Feuerwehr hatte zwei Tage frei.','Im Wald wurden viele neue Bäume gepflanzt.','Bei dem Feuer wurden viele Menschen verletzt.'],
    'Eine Zusammenfassung nennt in der richtigen Reihenfolge das Wichtigste: Ursache, Geschehen, Ergebnis.'],
  ['Die Straße ist nass, auf den Gehwegen stehen große Pfützen, und alle tragen Gummistiefel.\n\nWas kann man daraus schließen?',
    'Es hat vorher stark geregnet.',['Es ist sehr heiß und trocken.','Die Straße wurde gerade gebaut.','Alle gehen zum Schwimmen.'],
    'Das steht nicht wörtlich da, lässt sich aber aus den Hinweisen (nass, Pfützen, Gummistiefel) erschließen.'],
  ['Tom ist größer als Ben. Ben ist größer als Ida. Wer ist am kleinsten?','Ida',['Tom','Ben','Das kann man nicht wissen'],
    'Reihenfolge: Tom, dann Ben, dann Ida – Ida ist die Kleinste.'],
  ['Welcher Satz ist richtig gesetzt?','Ich bleibe zu Hause, weil ich krank bin.',
    ['Ich bleibe, zu Hause weil ich krank bin.','Ich bleibe zu Hause weil, ich krank bin.','Ich bleibe zu Hause weil ich krank bin.'],
    'Vor „weil“ steht ein Komma: Es trennt den Nebensatz vom Hauptsatz.'],
  ['Wie setzt man die wörtliche Rede richtig?','Lina fragt: „Kommst du mit?“',
    ['Lina fragt „Kommst du mit.“','Lina fragt: Kommst du mit?','Lina fragt, „Kommst du mit“?'],
    'Vor der wörtlichen Rede steht ein Doppelpunkt, die Rede steht in Anführungszeichen, das Fragezeichen gehört hinein.'],
  ['Delfine sind Säugetiere, keine Fische. Sie atmen Luft durch ein Blasloch und müssen darum regelmäßig auftauchen. Ihre Jungen trinken Milch.\n\nWelche Aussage steht im Text?',
    'Delfine müssen zum Atmen auftauchen.',['Delfine atmen mit Kiemen.','Delfine legen Eier.','Delfine sind Fische.'],
    'Der Text sagt: Sie atmen Luft und müssen deshalb auftauchen.'],
  ['Delfine sind Säugetiere, keine Fische. Sie atmen Luft durch ein Blasloch und müssen darum regelmäßig auftauchen. Ihre Jungen trinken Milch.\n\nWarum ist ein Delfin kein Fisch?',
    'Er atmet Luft und seine Jungen trinken Milch.',['Er lebt im Wasser.','Er hat eine Flosse.','Er ist sehr groß.'],
    'Ein Fisch atmet mit Kiemen; ein Säugetier atmet Luft und säugt seine Jungen. Im Wasser leben und Flossen haben auch Fische.'],
  ['Zu welcher Wortfamilie gehört „Gesang“?','singen',['sinken','sagen','Sand'],'In „Gesang“ steckt der Stamm von „singen“ (sing/sang).']
];

/* ======================== FESTE FRAGEN: Französisch ======================== */

/* Zyklus 2: Begrüßung, Vorstellen, Farben, Zahlen, Familie, Alltag.
   ABGELEITET aus Seite 22 (zweite Sprache, Zyklus 2: nur mündlich/Alltag). */
const F2_KNOBELN = [
  ['Wie sagt man „Hallo / Guten Tag“ auf Französisch?','Bonjour',['Merci','Au revoir','Pardon'],'„Bonjour“ sagt man zur Begrüßung tagsüber. „Au revoir“ heißt Auf Wiedersehen.'],
  ['Was bedeutet „Au revoir“?','Auf Wiedersehen',['Guten Morgen','Danke','Bitte'],'„Au revoir“ sagt man zum Abschied.'],
  ['Wie sagt man „Danke“ auf Französisch?','Merci',['Bonjour','Pardon','Salut'],'„Merci“ heißt Danke.'],
  ['Du möchtest sagen: „Ich heiße Léa.“ Was sagst du?','Je m\'appelle Léa.',['Tu t\'appelles Léa.','Il s\'appelle Léa.','Nous nous appelons Léa.'],
    '„Je m\'appelle“ heißt wörtlich „ich nenne mich“. „Tu t\'appelles“ wäre „du heißt“.'],
  ['Wie sagt man „Ich bin 7 Jahre alt“?','J\'ai sept ans.',['Je suis sept ans.','J\'ai sept années.','Je m\'appelle sept ans.'],
    'Auf Französisch „hat“ man Jahre: „j\'ai … ans“, nicht „ich bin“.'],
  ['Welche Farbe ist „rouge“?','rot',['blau','grün','gelb'],'„Rouge“ ist rot – wie ein Rouge auf den Wangen.'],
  ['Wie sagt man „blau“ auf Französisch?','bleu',['vert','jaune','rouge'],'„Bleu“ ist blau, „vert“ ist grün, „jaune“ ist gelb.'],
  ['Wie sagt man „fünf“ auf Französisch?','cinq',['six','sept','quatre'],'Eins bis fünf: un, deux, trois, quatre, cinq.'],
  ['Welche Zahl ist „trois“?','3',['2','5','13'],'Eins bis fünf: un, deux, trois, quatre, cinq – „trois“ ist die Drei.'],
  ['Du gehst abends ins Bett. Was sagst du zu deinen Eltern?','Bonne nuit',['Bonjour','Merci','Salut'],'„Bonne nuit“ heißt Gute Nacht.']
];
const F2_ERZAEHLEN = [
  ['Wie sagt man „Mutter“ auf Französisch?','la mère',['le père','la sœur','le frère'],'„La mère“ ist die Mutter, „le père“ der Vater.'],
  ['Was bedeutet „le frère“?','der Bruder',['die Schwester','der Vater','der Onkel'],'„Le frère“ ist der Bruder, „la sœur“ die Schwester.'],
  ['Wie sagt man „Oma“ auf Französisch (förmlich)?','la grand-mère',['le grand-père','la tante','la mère'],'„Grand-mère“ ist die Großmutter, „grand-père“ der Großvater.'],
  ['Was bedeutet „un livre“?','ein Buch',['ein Stift','eine Tasche','ein Tisch'],'„Un livre“ ist ein Buch.'],
  ['Was bedeutet „le crayon“?','der Bleistift',['das Lineal','die Schere','der Radiergummi'],'„Le crayon“ ist der Bleistift.'],
  ['Wie sagt man „zehn“ auf Französisch?','dix',['deux','neuf','vingt'],'Zehn heißt „dix“, neun „neuf“, zwanzig „vingt“.'],
  ['Was heißt „un chat“?','eine Katze (männlich: ein Kater)',['ein Hund','ein Pferd','ein Vogel'],'„Un chat“ ist die Katze, „un chien“ der Hund.'],
  ['Wie sagt man „Entschuldigung“ auf Französisch?','Pardon',['Merci','Bonjour','Salut'],'„Pardon“ sagt man, wenn man sich entschuldigt oder jemanden anstößt.'],
  ['Wie fragt man „Wie geht’s?“ auf Französisch?','Ça va ?',['Comment tu t\'appelles ?','Quel âge as-tu ?','Où est la porte ?'],
    '„Ça va ?“ ist die Frage nach dem Befinden. Die anderen fragen nach Name, Alter und Ort.'],
  ['Wie fragt man nach dem Namen?','Comment tu t\'appelles ?',['Quel âge as-tu ?','Ça va ?','Tu as faim ?'],'„Comment tu t\'appelles ?“ heißt „Wie heißt du?“.']
];

/* Zyklus 3: Wortschatz Schule/Familie/Essen/Zeit, Artikel, einfache Sätze, être/avoir im Präsens.
   ABGELEITET aus Seite 23 („Langue française“, Zyklus 3). */
const F3_KNOBELN = [
  ['Welcher Artikel passt? ___ livre (das Buch)','le',['la','les','une'],'„Livre“ ist männlich, deshalb „le livre“.'],
  ['Welcher Artikel passt? ___ table (der Tisch)','la',['le','les','un'],'„Table“ ist weiblich, deshalb „la table“.'],
  ['Welcher Artikel passt? ___ élèves (die Schüler)','les',['le','la','une'],'Bei mehreren Dingen oder Personen steht „les“.'],
  ['Welcher Artikel passt? ___ maison (ein Haus)','une',['un','le','les'],'„Maison“ ist weiblich. „Ein“ heißt bei weiblichen Wörtern „une“.'],
  ['Welcher Artikel passt? ___ stylo (ein Stift)','un',['une','la','les'],'„Stylo“ ist männlich. „Ein“ heißt bei männlichen Wörtern „un“.'],
  ['Ergänze mit „être“: Je ___ content.','suis',['es','est','êtes'],'Je suis, tu es, il/elle est, nous sommes, vous êtes, ils/elles sont.'],
  ['Ergänze mit „être“: Nous ___ à l\'école.','sommes',['sont','êtes','suis'],'Zu „nous“ gehört „nous sommes“.'],
  ['Ergänze mit „avoir“: Tu ___ un chien.','as',['a','ai','avons'],'J\'ai, tu as, il/elle a, nous avons, vous avez, ils/elles ont.'],
  ['Ergänze mit „avoir“: Elle ___ deux frères.','a',['as','ont','avez'],'Zu „il / elle“ gehört „a“.']
];
const F3_ERZAEHLEN = [
  ['Was bedeutet „la classe“?','die Klasse',['die Pause','die Tafel','der Lehrer'],'„La classe“ ist die Klasse.'],
  ['Wie sagt man „die Tafel“ auf Französisch?','le tableau',['le cahier','la porte','le stylo'],'„Le tableau“ ist die Tafel – auch ein Gemälde heißt so.'],
  ['Was bedeutet „le cahier“?','das Heft',['das Buch','der Stift','die Tasche'],'„Le cahier“ ist das Heft, „le livre“ das Buch.'],
  ['Was bedeutet „le pain“?','das Brot',['der Käse','die Milch','der Apfel'],'„Le pain“ ist das Brot.'],
  ['Wie sagt man „Milch“ auf Französisch?','le lait',['le pain','l\'eau','la pomme'],'„Le lait“ ist die Milch, „l\'eau“ das Wasser.'],
  ['Wie sagt man „Apfel“ auf Französisch?','la pomme',['la poire','le gâteau','la fraise'],'„La pomme“ ist der Apfel, „la poire“ die Birne.'],
  ['Was bedeutet „lundi“?','Montag',['Dienstag','Sonntag','Samstag'],'Montag = lundi, Dienstag = mardi.'],
  ['Wie sagt man „Samstag“ auf Französisch?','samedi',['dimanche','mardi','vendredi'],'Samstag = samedi, Sonntag = dimanche.'],
  ['Welcher Satz bedeutet „Ich habe einen Bruder“?','J\'ai un frère.',['Je suis un frère.','Tu as un frère.','Il a un frère.'],
    '„J\'ai“ kommt von „avoir“ (haben). „Tu as“ wäre „du hast“.'],
  ['Wie sagt man „meine Schwester“?','ma sœur',['mon sœur','ma frère','mon père'],'„Sœur“ ist weiblich, deshalb „ma“. Bei männlichen Wörtern heißt es „mon“.'],
  ['Ergänze: Il ___ sept heures.','est',['a','as','sont'],'Bei der Uhrzeit sagt man „il est … heures“.'],
  ['Welche Mahlzeit ist „le petit-déjeuner“?','das Frühstück',['das Mittagessen','das Abendessen','der Nachtisch'],
    '„Petit-déjeuner“ ist das Frühstück, „déjeuner“ das Mittagessen und „dîner“ das Abendessen.']
];

/* Zyklus 4: Präsens häufiger Verben, Verneinung, passé composé (einfach), Wortschatz, kurze Lesetexte.
   ABGELEITET aus Seite 24 („Langue française“, Zyklus 4). */
const F4_KNOBELN = [
  ['Ergänze: Nous ___ français. (parler)','parlons',['parlez','parlent','parle'],'Verben auf -er: je parle, tu parles, il parle, nous parlons, vous parlez, ils parlent.'],
  ['Ergänze: Ils ___ le chocolat. (aimer)','aiment',['aimons','aimez','aimes'],'Zu „ils / elles“ gehört die Endung -ent: ils aiment.'],
  ['Ergänze: Je ___ à l\'école. (aller)','vais',['vas','va','allons'],'Aller: je vais, tu vas, il va, nous allons, vous allez, ils vont.'],
  ['Ergänze: Tu ___ tes devoirs. (faire)','fais',['fait','faisons','faites'],'Faire: je fais, tu fais, il fait, nous faisons, vous faites, ils font.'],
  ['Wie sagt man „Ich habe keinen Hund“?','Je n\'ai pas de chien.',['Je pas ai de chien.','Je ne ai pas de chien.','Je n\'ai de chien pas.'],
    'Die Verneinung umklammert das Verb: ne … pas. Vor einem Vokal wird „ne“ zu „n\'“. Nach „pas“ steht „de“, nicht „un“.'],
  ['Verneine: „Elle mange.“','Elle ne mange pas.',['Elle mange ne pas.','Elle pas mange.','Ne elle mange pas.'],'„ne“ steht vor dem Verb, „pas“ danach.'],
  ['Verneine: „Tu es content.“','Tu n\'es pas content.',['Tu ne es pas content.','Tu pas es content.','Tu es ne pas content.'],'Vor „es“ (Vokal) wird „ne“ zu „n\'“: tu n\'es pas.'],
  ['Ergänze im passé composé: J\'ai ___ un gâteau. (manger)','mangé',['manger','mange','mangeons'],'Passé composé = „avoir“ + Partizip. Bei -er-Verben endet es auf -é: mangé.'],
  ['Wie heißt „wir haben gesprochen“ im passé composé?','nous avons parlé',['nous parlons','nous avons parler','nous sommes parlé'],
    '„Avoir“ im Präsens plus Partizip „parlé“: nous avons parlé.']
];
const F4_ERZAEHLEN = [
  ['Lucas wohnt in Luxemburg. Er hat eine Katze, die Minou heißt. Samstags spielt Lucas mit seinen Freunden Fußball. Sonntags isst er bei seiner Großmutter.\n\nWie heißt die Katze?','Minou',['Lucas','Luxembourg','Football'],
    'Im zweiten Satz steht der Name der Katze: Minou.'],
  ['Lucas wohnt in Luxemburg. Er hat eine Katze, die Minou heißt. Samstags spielt Lucas mit seinen Freunden Fußball. Sonntags isst er bei seiner Großmutter.\n\nWas macht Lucas am Samstag?',
    'Er spielt Fußball mit seinen Freunden.',['Er isst bei seiner Oma.','Er geht in die Schule.','Er fährt nach Paris.'],'„Samstags“ steht direkt vor dem Fußballspielen.'],
  ['Was bedeutet „la fenêtre“?','das Fenster',['die Tür','der Tisch','die Wand'],'„La fenêtre“ ist das Fenster, „la porte“ die Tür.'],
  ['Wie sagt man „Es ist kalt“ (Wetter)?','Il fait froid.',['Il est froid.','Il fait chaud.','Il pleut.'],'Beim Wetter sagt man „il fait …“: il fait froid, il fait chaud.'],
  ['Was bedeutet „Il pleut.“?','Es regnet.',['Es schneit.','Es ist windig.','Die Sonne scheint.'],'„Pleuvoir“ ist regnen. Schneien heißt „neiger“: il neige.'],
  ['Wie fragt man „Wie spät ist es?“','Quelle heure est-il ?',['Quel âge as-tu ?','Où habites-tu ?','Quel jour sommes-nous ?'],
    '„Quelle heure“ heißt „welche Uhrzeit“.'],
  ['Was bedeutet „Où habites-tu ?“','Wo wohnst du?',['Wie alt bist du?','Wie heißt du?','Was machst du?'],'„Où“ heißt wo, „habiter“ wohnen.'],
  ['Wie sagt man „Ich habe Hunger“?','J\'ai faim.',['Je suis faim.','Je fais faim.','Je veux faim.'],'Auf Französisch „hat“ man Hunger: „avoir faim“.']
];

/* ======================== FESTE FRAGEN: Sachunterricht ======================== */

/* ABGELEITET aus „Éveil aux sciences, sciences humaines et naturelles“ (Plan Seite 34–38):
   vier Bereiche je Zyklus – Nature et homme, Technologie et objets techniques, Terre et espace,
   Temps et évolution. Der Plan nennt Kompetenzen, keine Themenlisten; die Fragen sind eine
   Auslegung und müssen von einer Fachperson geprüft werden. Bewusst allgemein gehalten:
   keine luxemburg-spezifischen Orts- oder Geschichtsfakten. */

/* Zyklus 2 (Seite 36): Lebensbedürfnisse, Sinne, Jahreszeiten, Werkzeuge und Teile von Gegenständen,
   Orte und Regeln, Plan/Schulweg, Zeitkreisläufe, früher und heute. */
const S2_KNOBELN = [
  ['Was braucht ein Mensch unbedingt, um zu leben?','Luft zum Atmen',['einen Fernseher','Spielzeug','Süßigkeiten'],
    'Zu den Lebensbedürfnissen gehören atmen, essen, trinken und schlafen. Fernseher, Spielzeug und Süßigkeiten sind schön, aber nicht lebensnotwendig.'],
  ['Was passiert, wenn ein Mensch lange nichts trinkt?','Er bekommt Durst und wird schwach',['Er wird immer stärker','Er braucht dann weniger Luft','Er bekommt neue Haare'],
    'Der Körper braucht regelmäßig Wasser. Fehlt es, bekommt man Durst und fühlt sich schlapp.'],
  ['Nach dem Rennen atmest du ganz schnell. Warum?','Dein Körper braucht jetzt mehr Luft',['Die Luft ist plötzlich dünner geworden','Du hast Hunger','Du willst singen'],
    'Bei Anstrengung braucht der Körper mehr Luft, darum atmest du schneller. Danach hilft es, sich auszuruhen.'],
  ['Womit riechst du den Duft einer Blume?','mit der Nase',['mit den Ohren','mit den Augen','mit den Fingern'],'Zum Riechen hat der Mensch die Nase.'],
  ['Womit hörst du Musik?','mit den Ohren',['mit der Nase','mit den Augen','mit der Zunge'],'Die Ohren fangen den Schall auf. Das ist der Hörsinn.'],
  ['Womit spürst du, ob etwas weich oder rau ist?','mit der Haut',['mit den Ohren','mit der Nase','mit den Zähnen'],
    'Der Tastsinn sitzt in der Haut, besonders an den Fingerspitzen.'],
  ['Wie viele Jahreszeiten gibt es?','4',['3','5','6'],'Frühling, Sommer, Herbst und Winter.'],
  ['Welche Jahreszeit kommt nach dem Winter?','Frühling',['Sommer','Herbst','Winter'],'Die Reihenfolge ist Frühling, Sommer, Herbst, Winter – und dann wieder Frühling.'],
  ['In welcher Jahreszeit verlieren viele Bäume ihre Blätter?','im Herbst',['im Frühling','im Sommer','in der Nacht'],
    'Im Herbst werden die Blätter bunt und fallen ab.'],
  ['Welches Tier hält bei uns im Winter Winterschlaf?','der Igel',['der Hase','die Kuh','der Fuchs'],
    'Der Igel schläft den Winter in einem Versteck. Hase und Fuchs bleiben auch im Winter wach.'],
  ['Welche zwei Tage bilden das Wochenende?','Samstag und Sonntag',['Freitag und Samstag','Sonntag und Montag','Montag und Dienstag'],
    'Das Wochenende besteht aus Samstag und Sonntag.']
];
const S2_ERZAEHLEN = [
  ['Wozu ist der Schulhof da?','zum Spielen und Ausruhen in der Pause',['zum Schlafen','zum Kochen','zum Rechnen mit dem Heft'],
    'Orte haben Aufgaben: Im Klassenzimmer lernt man, auf dem Schulhof spielt man und ruht sich aus.'],
  ['Im Flur rennen viele Kinder. Jemand stolpert fast. Welche Regel hilft?','Im Flur langsam gehen',
    ['Im Flur noch schneller rennen','Im Flur laut singen','Im Flur Bälle werfen'],
    'Regeln sorgen dafür, dass sich im gemeinsamen Raum niemand wehtut. Im Flur geht man ruhig und langsam.'],
  ['Nach dem Basteln liegen überall Papierschnipsel. Was ist richtig?','Alles aufräumen, damit der Platz sauber ist',
    ['Liegen lassen, die anderen machen das schon','Alles in die Ecke kicken','Zum Spielplatz mitnehmen'],
    'Wer einen Raum zusammen nutzt, räumt hinterher auf, damit der nächste ihn gut benutzen kann.'],
  ['Die Klasse ist sehr laut, und Ben kann sich nicht konzentrieren. Was hilft?','Leiser sprechen',
    ['Noch lauter sprechen','Ben soll rausgehen','Die Musik lauter machen'],'In einem gemeinsamen Raum nimmt man Rücksicht: Zum Lernen braucht man Ruhe.'],
  ['Auf dem Schulweg-Plan siehst du: Haus – Bäckerei – Ampel – Schule. Was kommt direkt vor der Schule?','die Ampel',
    ['das Haus','die Bäckerei','der Spielplatz'],'Man liest den Plan in der Reihenfolge des Weges: erst Haus, dann Bäckerei, dann Ampel, dann Schule.'],
  ['Wann gehst du über eine Fußgängerampel?','wenn sie grün zeigt',['wenn sie rot zeigt','wenn sie gelb leuchtet','wenn ein Auto hupt'],
    'Bei Grün dürfen Fußgänger gehen. Bei Rot bleibt man stehen und schaut sich trotzdem noch um.'],
  ['Womit waren Menschen vor sehr langer Zeit unterwegs, als es noch keine Motoren gab?','zu Fuß, mit Pferden und Kutschen',
    ['mit Flugzeugen','mit Autos','mit Elektrorollern'],'Motoren wurden erst vor etwa 150 Jahren erfunden. Davor ging man zu Fuß oder nutzte Tiere und Wagen.'],
  ['Was gab es in der Schule von Oma und Opa als Kinder noch nicht?','Tablets',['Tafeln','Hefte','Bleistifte'],
    'Tafeln, Hefte und Bleistifte gab es schon lange. Tablets sind erst viel später erfunden worden.'],
  ['Früher wuschen die Menschen Wäsche oft von Hand. Was erledigt das heute meist?','die Waschmaschine',
    ['der Kühlschrank','der Staubsauger','der Toaster'],'Technik verändert den Alltag: Die Waschmaschine nimmt uns viel Handarbeit ab.'],
  ['Welcher Satz erzählt von früher?','Als ich klein war, konnte ich noch nicht lesen.',
    ['Ich lese gerade ein Buch.','Morgen gehe ich zum Zahnarzt.','Ich habe jetzt Hunger.'],
    'Was früher war, steht in der Vergangenheit: „war“, „konnte“. Die anderen Sätze handeln von jetzt oder von morgen.']
];
const S2_ENTDECKEN = [
  ['Wofür benutzt du eine Schere?','zum Schneiden von Papier',['zum Kleben','zum Messen','zum Malen'],'Eine Schere hat zwei scharfe Klingen, mit denen man schneidet.'],
  ['Was kannst du mit einer Lupe tun?','kleine Dinge größer sehen',['Dinge leiser hören','Dinge schneller machen','Dinge schwerer machen'],
    'Eine Lupe vergrößert, zum Beispiel einen Käfer oder die Ader eines Blattes.'],
  ['Welcher Teil sorgt dafür, dass ein Fahrrad rollt?','die Räder',['der Sattel','die Klingel','der Lenker'],'Räder drehen sich und rollen über den Boden. Der Lenker steuert nur.'],
  ['Wie heißt der Teil eines Regenschirms, an dem du ihn festhältst?','der Griff',['der Stoff','die Spitze','die Feder'],
    'Gegenstände haben Teile mit Aufgaben: Am Griff hält man fest, der Stoff schützt vor Regen.'],
  ['Du willst Saft in eine enge Flasche füllen, ohne zu kleckern. Was nimmst du?','einen Trichter',['eine Schere','einen Besen','eine Lupe'],
    'Ein Trichter leitet die Flüssigkeit durch die enge Öffnung.'],
  ['Was ziehst du an, wenn es regnet?','Regenjacke und Gummistiefel',['eine Badehose','eine Sonnenbrille','Skistiefel'],
    'Bei Regen schützt man sich vor Nässe mit wasserdichter Kleidung.'],
  ['Der Himmel ist voller dunkler, grauer Wolken. Was kommt wahrscheinlich?','Regen',
    ['ein heißer, wolkenloser Tag','Sonnenschein den ganzen Tag','ein Sternenhimmel'],'Dicke dunkle Wolken sind oft ein Zeichen für Regen.'],
  ['Was ist KEIN Lebewesen?','ein Stein',['ein Baum','eine Schnecke','eine Blume'],
    'Lebewesen wachsen, brauchen Nahrung oder Licht und können sich vermehren. Ein Stein tut das nicht.'],
  ['Was braucht eine Pflanze zum Wachsen?','Wasser und Licht',['Süßigkeiten und Musik','nur Dunkelheit','Fernsehen'],
    'Pflanzen nehmen Wasser auf und brauchen Licht, um zu wachsen.'],
  ['Wie findest du heraus, ob eine Pflanze Durst hat?','Die Erde anfassen: Ist sie ganz trocken, braucht sie Wasser',
    ['Sie fragen','Ihre Blätter zählen','Das Fenster schließen'],'Durch Fühlen und Beobachten kann man prüfen, ob die Erde trocken ist.']
];

/* Zyklus 3 (Seite 37): Lebenszyklus, Lebensfunktionen, Vergleich Frosch/Schmetterling, Hypothese,
   einfache Maschinen, Fehlersuche, Orte und Orientierung, Karten, Zeitleiste, Veränderungen. */
const S3_KNOBELN = [
  ['Welche Reihenfolge stimmt für das Leben vieler Lebewesen?','Geburt, Wachstum, Fortpflanzung, Tod',
    ['Wachstum, Geburt, Tod, Fortpflanzung','Tod, Geburt, Wachstum, Fortpflanzung','Fortpflanzung, Geburt, Tod, Wachstum'],
    'Ein Lebewesen wird geboren, wächst, bekommt Nachkommen und stirbt irgendwann. Das nennt man Lebenszyklus.'],
  ['Wie nennt man es, wenn Lebewesen Nachkommen bekommen?','Fortpflanzung',['Verdauung','Atmung','Ernährung'],
    'Durch Fortpflanzung entstehen neue Lebewesen derselben Art.'],
  ['Welches Organ nimmt beim Atmen Sauerstoff aus der Luft auf?','die Lunge',['der Magen','das Herz','die Leber'],
    'In der Lunge geht der Sauerstoff aus der Atemluft ins Blut. Das Herz pumpt das Blut weiter.'],
  ['Wo beginnt die Verdauung der Nahrung?','im Mund',['in der Lunge','im Herzen','in der Nase'],
    'Schon beim Kauen zerkleinern die Zähne die Nahrung, und der Speichel beginnt sie aufzuspalten.'],
  ['Welche Teile des Körpers lassen dich bewegen?','Muskeln',['Haare','Fingernägel','Zähne'],
    'Muskeln ziehen sich zusammen und bewegen so die Knochen.'],
  ['Was haben Frosch und Schmetterling gemeinsam?','Beide verwandeln sich nach dem Schlüpfen stark',
    ['Beide legen keine Eier','Beide leben immer im Wasser','Beide haben ein Fell'],
    'Der Frosch wird aus dem Ei zur Kaulquappe, dann zum Frosch. Der Schmetterling wird aus dem Ei zur Raupe, zur Puppe und dann zum Falter.'],
  ['Wie atmet eine kleine Kaulquappe?','mit Kiemen',['mit einem Fell','durch ein Blasloch wie ein Wal','mit Federn'],
    'Kaulquappen leben im Wasser und atmen mit Kiemen. Erst der erwachsene Frosch atmet mit Lungen Luft.'],
  ['Wie heißt das Stadium zwischen Raupe und Schmetterling?','Puppe',['Kaulquappe','Ei','Falter'],
    'In der Puppe verwandelt sich die Raupe zum Schmetterling.'],
  ['Was ist eine Hypothese?','eine begründete Vermutung, die man prüfen kann',
    ['ein sicheres Ergebnis','ein Messgerät','ein Tagebuch'],'Man vermutet etwas und prüft dann mit einem Versuch, ob es stimmt.'],
  ['Du vermutest, dass Pflanzen ohne Licht schlechter wachsen. Wie prüfst du das?','Eine Pflanze ins Licht und eine ins Dunkle stellen und vergleichen',
    ['Alle Pflanzen ins Licht stellen','Eine Pflanze anschauen und raten','Die Pflanze umtopfen'],
    'Für einen Vergleich braucht man zwei gleiche Pflanzen, die sich nur in einer Sache unterscheiden: dem Licht.'],
  ['Welches ist ein Beispiel für einen Hebel?','eine Wippe',['ein Spiegel','ein Ball','ein Kissen'],
    'Eine Wippe dreht sich um einen Punkt in der Mitte. Das ist das Prinzip des Hebels.'],
  ['Wozu dient ein Flaschenzug?','um schwere Lasten leichter zu heben',['um Wasser zu erhitzen','um Töne lauter zu machen','um Licht zu bündeln'],
    'Mit Seil und Rollen verteilt der Flaschenzug die Kraft, sodass man weniger Kraft braucht (dafür zieht man ein längeres Seil).']
];
const S3_ERZAEHLEN = [
  ['Du stehst morgens mit dem Gesicht zur aufgehenden Sonne. In welche Himmelsrichtung schaust du?','nach Osten',
    ['nach Westen','nach Norden','nach Süden'],'Die Sonne geht im Osten auf und im Westen unter.'],
  ['Wohin zeigt die Nadel eines Kompasses?','nach Norden',['nach Süden','zur Sonne','nach oben'],
    'Die Kompassnadel richtet sich nach dem Magnetfeld der Erde und zeigt nach Norden.'],
  ['Welche Himmelsrichtung liegt dem Norden gegenüber?','Süden',['Osten','Westen','Nordosten'],'Norden und Süden liegen sich gegenüber, ebenso Osten und Westen.'],
  ['Wozu dient die Legende auf einer Karte?','Sie erklärt die Zeichen und Farben',
    ['Sie erzählt eine Sage','Sie zeigt das Wetter von morgen','Sie nennt den Namen des Zeichners'],
    'In der Legende steht, was zum Beispiel ein blaues Band oder ein kleines Kreuz bedeutet.'],
  ['Aus welcher Sicht zeichnet man einen Plan?','von oben',['von vorne','von der Seite','von unten'],
    'Ein Plan zeigt alles wie ein Foto aus der Luft von oben.'],
  ['Wo leben die meisten Menschen eng zusammen, mit vielen Häusern, Geschäften und Straßen?','in einer Stadt',
    ['im Wald','auf dem Feld','am Flussufer'],'Eine Stadt ist ein großer Ort mit vielen Einwohnern. Ein Dorf ist kleiner.'],
  ['Welcher Ort ist ein Lebensraum für Rehe und Füchse?','der Wald',['die Innenstadt','der Parkplatz','der Bahnhof'],
    'Im Wald finden Wildtiere Nahrung und Verstecke.'],
  ['Wie viele Jahre hat ein Jahrhundert?','100',['10','50','1000'],'„Hundert Jahre“ sind ein Jahrhundert.'],
  ['Was zeigt eine Zeitleiste?','Ereignisse in der Reihenfolge, in der sie geschehen sind',
    ['Orte auf einer Karte','das Wetter der letzten Woche','nur Geburtstage von Tieren'],
    'Auf einer Zeitleiste stehen ältere Ereignisse links und jüngere rechts.'],
  ['Wie viele Tage hat ein normales Jahr (kein Schaltjahr)?','365',['360','364','400'],'Ein Jahr hat 365 Tage. Alle vier Jahre gibt es ein Schaltjahr mit 366 Tagen.'],
  ['Woher wissen wir etwas über früher?','aus Quellen wie Fotos, Briefen, Gebäuden und Erzählungen',
    ['nur durch Raten','aus dem Wetterbericht','aus der Speisekarte von heute'],
    'Historiker sammeln Hinweise aus alten Dingen und Berichten, so wie Detektive Spuren.'],
  ['Wie hat die Erfindung des Autos das Leben verändert?','Menschen konnten schneller und weiter reisen',
    ['Es gab keine Straßen mehr','Menschen brauchten nie mehr zu schlafen','Alle zogen in Höhlen'],
    'Veränderungen wirken sich auf das Leben aus: Mit dem Auto wurden Wege kürzer, aber es entstanden auch neue Straßen und Abgase.']
];
const S3_ENTDECKEN = [
  ['Welcher Teil lässt eine Tür aufschwingen?','das Scharnier',['das Schloss','der Türspion','die Fußmatte'],
    'Ein Scharnier ist ein drehbares Gelenk an Tür oder Deckel.'],
  ['Wie hilft ein Rad bei einem schweren Karren?','Er rollt, statt zu schleifen',
    ['Er macht die Last leichter','Er erzeugt Strom','Er macht Geräusche'],
    'Rollen reibt viel weniger als Schleifen. Die Last bleibt aber gleich schwer.'],
  ['Wie hält eine Schraube zwei Holzteile zusammen?','Ihr Gewinde greift ins Holz und zieht die Teile zusammen',
    ['Sie klebt die Teile','Sie schmilzt das Holz','Sie zieht die Teile magnetisch an'],
    'Das schraubenförmige Gewinde dreht sich ins Holz und hält fest.'],
  ['Wo musst du bei einem langen Hebel drücken, damit es leichter geht?','weit weg vom Drehpunkt',
    ['direkt am Drehpunkt','nah am Drehpunkt','Es ist immer gleich leicht'],'Je weiter vom Drehpunkt entfernt, desto weniger Kraft brauchst du.'],
  ['Welcher Teil einer Taschenlampe liefert die Energie?','die Batterie',['der Schalter','das Gehäuse','der Griff'],
    'Die Batterie speichert die elektrische Energie, die das Licht zum Leuchten bringt.'],
  ['Welche Aufgabe hat der Schalter an einer Lampe?','Er schließt oder unterbricht den Stromkreis',
    ['Er erzeugt den Strom','Er macht das Licht heller','Er kühlt die Lampe'],
    'Nur im geschlossenen Stromkreis fließt Strom. Der Schalter öffnet oder schließt ihn.'],
  ['Eine Taschenlampe leuchtet nicht. Was prüfst du zuerst?','Batterien und Schalter',
    ['ob sie die richtige Farbe hat','ob es draußen regnet','ob ein Name darauf steht'],
    'Bei einer Panne prüft man nacheinander die Teile, die die Funktion ermöglichen: Energie und Schalter zuerst.'],
  ['Die Kette eines Fahrrads quietscht. Was hilft vermutlich?','die Kette ölen',
    ['mehr Luft in den Sattel pumpen','die Klingel putzen','die Reifen anmalen'],'Quietschen kommt oft von Reibung. Etwas Öl macht die Kette geschmeidig.'],
  ['Frosch und Schmetterling: Welcher Unterschied hängt mit dem Lebensraum zusammen?','Die Kaulquappe lebt im Wasser, die Raupe an Pflanzen an Land',
    ['Die Raupe lebt im Wasser, die Kaulquappe an Land','Beide leben unter der Erde','Beide leben im Meer'],
    'Das Jungtier des Frosches lebt im Wasser, das des Schmetterlings an Land und frisst Blätter.'],
  ['Welche Aussage über Vögel stimmt?','Alle Vögel legen Eier',['Vögel bringen lebende Junge zur Welt','Vögel haben kein Skelett','Alle Vögel können fliegen'],
    'Alle Vögel legen Eier. Nicht alle fliegen: Pinguine und Strauße zum Beispiel nicht.'],
  ['Beim Rennen schlägt dein Herz schneller. Warum?','Die Muskeln brauchen mehr Sauerstoff, den das Blut bringt',
    ['Das Herz will nur schneller sein','Die Haut wird heiß','Der Magen verdaut gerade'],
    'Bei Anstrengung arbeiten Atmung, Herz und Muskeln zusammen: Mehr Sauerstoff muss schneller zu den Muskeln.'],
  ['Wozu braucht der Körper Schlaf?','zum Ausruhen und Erholen',['um Wasser zu sparen','um die Knochen zu verkürzen','um die Augenfarbe zu ändern'],
    'Im Schlaf erholt sich der Körper, und das Gehirn verarbeitet, was am Tag passiert ist.']
];

/* Zyklus 4 (Seite 38): Vielfalt und Lebensräume, Körpersysteme, Ökosystem, Experimente mit Protokoll,
   Werkzeugwahl, Algorithmen, Landschaften, Karten und Maßstab, menschliche Aktivität, Epochen, Quellen. */
const S4_KNOBELN = [
  ['Welcher Lebensraum passt zu einem Kamel?','die Wüste',['das Polargebiet','das Meer','der Regenwald'],
    'Kamele sind an Hitze und Trockenheit angepasst und speichern Fett im Höcker.'],
  ['Welche Anpassung hilft Eisbären in der Kälte?','dichtes Fell und eine dicke Fettschicht',
    ['ein dünnes Fell ohne Unterwolle','große Ohren wie beim Wüstenfuchs','ein Panzer wie bei der Schildkröte'],
    'Fell und Fettschicht halten die Wärme im Körper. Jedes Lebewesen ist an seinen Lebensraum angepasst.'],
  ['Wohin gelangt der Sauerstoff aus der Lunge?','ins Blut',['in den Magen','in die Knochen','in den Mund'],
    'In der Lunge geht der Sauerstoff ins Blut. Das Blut bringt ihn zu allen Teilen des Körpers.'],
  ['Welche Aufgabe hat das Blut im Kreislauf?','Es transportiert Sauerstoff und Nährstoffe zu den Körperteilen',
    ['Es verdaut die Nahrung','Es bildet die Haut','Es erzeugt Töne'],'Das Herz pumpt das Blut durch die Adern, damit Sauerstoff und Nährstoffe überall ankommen.'],
  ['In welcher Reihenfolge wandert die Nahrung durch den Körper?','Mund, Speiseröhre, Magen, Darm',
    ['Mund, Magen, Speiseröhre, Darm','Magen, Mund, Darm, Speiseröhre','Speiseröhre, Mund, Darm, Magen'],
    'Beim Schlucken rutscht der Bissen durch die Speiseröhre in den Magen und dann in den Darm.'],
  ['In welchem Teil des Verdauungssystems gehen die meisten Nährstoffe ins Blut über?','im Dünndarm',['im Magen','in der Speiseröhre','im Mund'],
    'Der Dünndarm ist lang und hat eine große Oberfläche, über die die Nährstoffe ins Blut gelangen.'],
  ['Welches Gas aus der Luft braucht der Körper zum Leben?','Sauerstoff',['Helium','Methan','Neon'],
    'Aus der Atemluft nimmt der Körper nur den Sauerstoff auf, den er für die Energiegewinnung braucht.'],
  ['Ein Roboter soll ein Quadrat laufen: „Wiederhole 4-mal: gehe 3 Schritte vor, drehe dich um 90° nach rechts.“ Wie viele Schritte geht er insgesamt?','12',
    ['7','4','16'],'Die Wiederholung gilt für den ganzen Block: 4 · 3 = 12 Schritte.'],
  ['Programm: „Wenn die Ampel rot ist, bleibe stehen, sonst gehe weiter.“ Die Ampel ist grün. Was tut der Roboter?','Er geht weiter',
    ['Er bleibt stehen','Er dreht sich um','Er schaltet sich aus'],'Die Bedingung „rot“ stimmt nicht, also gilt der Teil nach „sonst“.'],
  ['Was ist ein Algorithmus?','eine Schritt-für-Schritt-Anleitung, um eine Aufgabe zu lösen',
    ['ein Rechenfehler','ein Teil eines Computers','ein Lied'],'Ein Algorithmus legt genau fest, welche Schritte in welcher Reihenfolge folgen, zum Beispiel ein Rezept.'],
  ['Du testest, wie Dünger das Wachstum von Bohnen beeinflusst. Was lässt du bei allen Pflanzen gleich?','Licht, Wassermenge und Topfgröße',
    ['den Dünger','nichts, alles darf sich ändern','nur die Farbe des Topfes'],
    'Man verändert nur eine Sache, hier den Dünger. Alles andere bleibt gleich, damit der Unterschied sicher vom Dünger kommt.'],
  ['Du änderst in einem Experiment nur eine Sache auf einmal. Warum?','Damit man weiß, was die Wirkung verursacht hat',
    ['Damit es schneller geht','Damit der Versuch billiger wird','Damit man nicht aufschreiben muss'],
    'Ändert man mehrere Dinge zugleich, weiß man nicht, welche davon das Ergebnis bewirkt hat.'],
  ['Was gehört in ein Versuchsprotokoll?','Frage, Vermutung, Durchführung, Beobachtung und Ergebnis',
    ['nur das erwartete Ergebnis','nur die Namen der Beteiligten','nur Zeichnungen ohne Text'],
    'Ein Protokoll hält fest, was man gefragt, getan und beobachtet hat, damit andere den Versuch nachvollziehen können.']
];
const S4_ERZAEHLEN = [
  ['Auf einer Karte gilt: 1 cm entspricht 1 km in Wirklichkeit. Zwei Orte sind auf der Karte 5 cm voneinander entfernt (Luftlinie). Wie weit sind sie in Wirklichkeit?','5 km',
    ['2 km','10 km','50 km'],'Jeder Zentimeter auf der Karte sind 1 km: 5 · 1 km = 5 km.'],
  ['Der Maßstab einer Karte ist 1 : 100 000. Was bedeutet 1 cm auf der Karte in Wirklichkeit?','1 km',['100 m','10 km','10 m'],
    '100 000 cm sind 1000 m, also 1 km.'],
  ['Welche Karte zeigt mehr Einzelheiten: eine mit dem Maßstab 1 : 10 000 oder eine mit 1 : 1 000 000?','die mit 1 : 10 000',
    ['die mit 1 : 1 000 000','beide gleich viele','Das hängt nur von der Farbe ab'],
    'Je kleiner die Zahl nach dem Doppelpunkt, desto größer ist die Darstellung und desto mehr Einzelheiten passen hinein.'],
  ['Welches Beispiel zeigt, wie ein natürlicher Faktor eine Landschaft prägt?','Ein Fluss formt ein Tal',
    ['Eine neue Autobahn wird gebaut','Ein Acker wird angelegt','Ein Windpark wird errichtet'],
    'Fließendes Wasser trägt über sehr lange Zeit Boden ab und formt Täler. Straßen, Äcker und Windparks stammen von Menschen.'],
  ['Welches Beispiel zeigt, wie Menschen eine Landschaft verändern?','Ein Wald wird für ein Neubaugebiet gerodet',
    ['Regen formt ein Tal','Eine Düne wandert im Wind','Ein Fluss ändert nach Hochwasser seinen Lauf'],
    'Landschaften werden von der Natur und von Menschen geformt. Rodung und Bauen sind menschliche Eingriffe.'],
  ['Was kann passieren, wenn viel Boden mit Asphalt und Beton bedeckt wird?','Regenwasser kann schlechter im Boden versickern',
    ['Der Boden speichert mehr Wasser','Es regnet weniger','Es wachsen mehr Pflanzen'],
    'Auf versiegeltem Boden fließt das Wasser ab, statt zu versickern. Das kann bei Starkregen zu Überschwemmungen führen.'],
  ['Welche Epoche liegt zeitlich am weitesten zurück?','die Steinzeit',['das Mittelalter','die Antike','die Neuzeit'],
    'Die Reihenfolge von früh nach spät ist Steinzeit, Antike, Mittelalter, Neuzeit.'],
  ['Welche Reihenfolge der Epochen ist richtig (vom ältesten zum jüngsten)?','Steinzeit, Antike, Mittelalter, Neuzeit',
    ['Antike, Steinzeit, Neuzeit, Mittelalter','Mittelalter, Steinzeit, Antike, Neuzeit','Neuzeit, Mittelalter, Antike, Steinzeit'],
    'Auf einer Zeitleiste stehen die frühesten Zeiten links: Steinzeit, Antike, Mittelalter, Neuzeit.'],
  ['Was wurde um 1450 erfunden und machte es viel leichter, Bücher zu vervielfältigen?','der Buchdruck mit beweglichen Lettern',
    ['der Telegraf','die Dampfmaschine','das Radio'],'Johannes Gutenberg entwickelte den Buchdruck mit beweglichen Metallbuchstaben. Bücher wurden dadurch billiger.'],
  ['Welche Erfindung veränderte im 18. und 19. Jahrhundert Fabriken und Verkehr stark?','die Dampfmaschine',
    ['das Smartphone','das Internet','der Fernseher'],'Dampfmaschinen trieben Fabriken, Lokomotiven und Schiffe an.'],
  ['Eine Webseite behauptet etwas Erstaunliches, nennt aber weder Autor noch Belege. Was tust du?','Weitere zuverlässige Quellen suchen und vergleichen',
    ['Es glauben, weil es im Internet steht','Es sofort weitererzählen','Nur die Überschrift lesen'],
    'Quellen prüft man kritisch: Wer hat es geschrieben, gibt es Belege, sagen andere verlässliche Quellen dasselbe?'],
  ['Welche Quelle stammt aus der Zeit selbst, über die man etwas wissen will?','ein Brief, der damals geschrieben wurde',
    ['ein Schulbuch von heute über diese Zeit','ein Film von heute über diese Zeit','ein Roman von heute über diese Zeit'],
    'Briefe, Tagebücher und Gegenstände aus der Zeit sind Originalquellen. Bücher und Filme von heute beruhen darauf.'],
  ['Welches ist eine gesellschaftliche Veränderung der letzten 200 Jahre in Europa?','Kinder gehen heute zur Schule, statt zu arbeiten',
    ['Menschen leben wieder wie in der Steinzeit','Es gibt keine Gesetze mehr','Fast alle arbeiten wieder auf dem Feld'],
    'Schulpflicht und das Verbot von Kinderarbeit haben das Leben von Kindern stark verändert.']
];
const S4_ENTDECKEN = [
  ['In der Nahrungskette Gras → Hase → Fuchs: Wer ist der Produzent, der selbst Nahrung herstellt?','das Gras',
    ['der Hase','der Fuchs','der Boden'],'Pflanzen stellen mit Licht ihre Nahrung selbst her. Hase und Fuchs fressen andere Lebewesen.'],
  ['Was passiert wahrscheinlich, wenn in einem Wald fast alle Füchse verschwinden?','Die Zahl der Mäuse und Hasen steigt zunächst',
    ['Die Zahl der Hasen sinkt sofort','Das Gras hört auf zu wachsen','Alle anderen Tiere verschwinden auch'],
    'Im Ökosystem hängen alle Lebewesen zusammen. Fehlt der Jäger, vermehren sich seine Beutetiere erst einmal stärker.'],
  ['Wer zersetzt in der Natur tote Pflanzen zu Humus?','Pilze und Bodentiere wie Regenwürmer',['Hasen und Rehe','Sonne und Wind','Fische im Meer'],
    'Pilze, Bakterien und Bodentiere verwandeln Laub und Holz in Humus. Daraus nehmen Pflanzen wieder Nährstoffe.'],
  ['Welches Gas geben Pflanzen bei der Fotosynthese ab?','Sauerstoff',['Kohlenstoffdioxid','Stickstoff','Methan'],
    'Pflanzen nehmen Kohlenstoffdioxid auf und geben Sauerstoff ab.'],
  ['Was brauchen Pflanzen für die Fotosynthese?','Licht, Wasser und Kohlenstoffdioxid',
    ['Dunkelheit, Sand und Sauerstoff','Salz, Öl und Wärme','Fleisch, Wasser und Licht'],
    'Aus Licht, Wasser und Kohlenstoffdioxid bauen Pflanzen Zucker auf.'],
  ['Du willst die Länge deines Tisches genau messen. Welches Werkzeug wählst du?','ein Maßband',['eine Waage','ein Thermometer','eine Stoppuhr'],
    'Zum Werkzeug gehört die Aufgabe: Länge misst man mit Maßband oder Lineal.'],
  ['Du willst eine Schraube mit Kreuzschlitz festdrehen. Was brauchst du?','einen Kreuzschlitz-Schraubendreher',['einen Hammer','eine Säge','eine Schere'],
    'Der Kopf des Schraubendrehers muss zur Form der Schraube passen.'],
  ['Du untersuchst in zwei gleichen Gläsern, ob Wasser in der Sonne schneller verdunstet als im Schatten. Was misst du?','wie viel Wasser nach gleicher Zeit noch im Glas ist',
    ['wie schön das Glas aussieht','wie schwer das leere Glas ist','wie viele Wolken am Himmel sind'],
    'Gemessen wird das, was sich durch die untersuchte Bedingung ändert: die Wassermenge nach gleicher Zeit.'],
  ['Du vermutest: Eine höhere Rampe lässt ein Spielzeugauto weiter rollen. Wie prüfst du das fair?','Nur die Höhe ändern, Auto und Rampe sonst gleich lassen',
    ['Höhe, Auto und Rampe gleichzeitig ändern','Nur einmal fahren und raten','Jedes Mal ein anderes Auto nehmen'],
    'Nur eine Bedingung wird verändert. Alles andere muss gleich bleiben, sonst ist das Ergebnis nicht aussagekräftig.'],
  ['Ein Roboter soll sich bewegen: „Wiederhole, bis eine Wand kommt: gehe einen Schritt.“ Wann hört er auf?','Wenn er vor einer Wand steht',
    ['nach genau einem Schritt','nie','wenn er müde ist'],'Eine solche Schleife läuft weiter, bis die Bedingung (Wand) erfüllt ist.'],
  ['Der Roboter soll um eine Ecke fahren, dreht sich aber zu früh. Was tust du?','Den Ablauf Schritt für Schritt prüfen und die Schrittzahl vor der Drehung anpassen',
    ['Den Roboter wegwerfen','Nichts ändern und hoffen','Ihn schneller laufen lassen'],
    'Fehler in einem Algorithmus sucht man, indem man die Schritte nacheinander durchgeht und verbessert.'],
  ['Du bist in einer fremden Stadt und hast einen Stadtplan. Wie gehst du vor?','Standort und Ziel suchen und der Route entlang der Straßennamen folgen',
    ['Immer nach Norden gehen','Einfach der Menge folgen','Die Karte falten und wegstecken'],
    'Mit einem Plan sucht man zuerst, wo man ist und wohin man will, und verfolgt dann den Weg.'],
  ['Wo liegt Norden auf den meisten Karten?','oben',['unten','links','rechts'],'Die meisten Karten sind „genordet“: Norden ist oben, Süden unten, Osten rechts und Westen links.']
];

/* ======================== GENERATOREN ======================== */

export function luGen(h) {
  const { r, pick, shuffle, wahl, zahlText: zT, zahlChoice: zC } = h;
  const name = () => pick(NAMEN);
  const lvlWahl = (lvl, a, b, c, d, e) => [0, a, b, c, d, e][lvl] ?? c;

  /* Emoji des Weges vor die Frage setzen (wie bei den übrigen Zielen). */
  const prefix = (emoji, a) => ({ ...a, frage: emoji + ' ' + a.frage });

  /* Auswahlaufgabe mit genau 3 Ablenkern aus einer Kandidatenliste (gleiche Werte wie die Lösung fallen weg). */
  const opt3 = (frage, richtig, kand, hilfe) =>
    wahl(frage, richtig, [...new Set(kand.map(String))].filter(k => k !== String(richtig)).slice(0, 3), hilfe);
  /* Zahl-Auswahl: Ablenker aus Kandidaten, bei Bedarf mit Nachbarzahlen aufgefüllt (nie negativ, nie die Lösung). */
  const zahlOpt = (frage, loesung, kand, hilfe) => {
    const m = new Set();
    for (const k of kand) if (k !== loesung && k >= 0 && m.size < 3) m.add(k);
    for (let d = 1; m.size < 3; d++) for (const v of [loesung + d, loesung - d]) if (v >= 0 && v !== loesung && m.size < 3) m.add(v);
    return wahl(frage, String(loesung), [...m].map(String), hilfe);
  };
  const schritte = k => `${k} Schritt${k === 1 ? '' : 'e'}`;

  /* Feste Fragen: eine zufällige aus der Liste ziehen. */
  const fest = (liste, emoji = '') => () => {
    const [frage, richtig, falsche, erklaerung] = pick(liste);
    return wahl(emoji ? emoji + ' ' + frage : frage, richtig, falsche, erklaerung);
  };

  /* ---------------- Mathe, Zyklus 2 (Plan Seite 30) ---------------- */

  /* Zahlen mit Übergang über die Zehner: a + b, Ergebnis höchstens max */
  const ueberZehner = (max) => {
    for (let i = 0; i < 80; i++) {
      const a = r(6, max - 6), b = r(4, max - a);
      if (a % 10 + b % 10 > 10 && a + b <= max) return [a, b];
    }
    return [8, 5];
  };
  const minusUeberZehner = (max) => {
    for (let i = 0; i < 80; i++) {
      const a = r(12, max), b = r(3, a - 1);
      if (a % 10 > 0 && a % 10 < b % 10 && a - b >= 1) return [a, b];
    }
    return [13, 5];
  };
  const maxZ2 = lvl => lvlWahl(lvl, 20, 40, 60, 80, 100);

  const z2Zehner = lvl => {
    let n;
    do { n = r(11, maxZ2(lvl)); } while (Math.floor(n / 10) === n % 10 || n === 100);
    const z = Math.floor(n / 10), e = n % 10;
    return wahl(`Wie viele Zehner und wie viele Einer hat die Zahl ${n}?`, `${z} Zehner und ${e} Einer`,
      [`${e} Zehner und ${z} Einer`, `${z + 1} Zehner und ${e} Einer`, `${z} Zehner und ${(e + 1) % 10} Einer`],
      `${n} = ${z} · 10 + ${e}. Die Zehnerstelle steht links, die Einerstelle rechts.`);
  };
  const z2VorNach = lvl => {
    const n = r(3, maxZ2(lvl) - 1), vor = Math.random() < .5;
    return zT(`Welche Zahl ist der ${vor ? 'Vorgänger' : 'Nachfolger'} von ${n}?`, vor ? n - 1 : n + 1,
      vor ? 'Der Vorgänger ist die Zahl direkt davor: eins weniger.' : 'Der Nachfolger ist die Zahl direkt danach: eins mehr.');
  };
  const z2Plus = lvl => { const [a, b] = ueberZehner(maxZ2(lvl) < 30 ? 20 : maxZ2(lvl));
    return zT(`${a} + ${b} = ?`, a + b, `Erst auf den nächsten Zehner auffüllen: ${a} + ${10 - a % 10} = ${a + 10 - a % 10}, dann noch ${b - (10 - a % 10)} dazu.`); };
  const z2Minus = lvl => { const [a, b] = minusUeberZehner(maxZ2(lvl) < 30 ? 20 : maxZ2(lvl));
    return zT(`${a} − ${b} = ?`, a - b, `Erst bis zum vollen Zehner zurück: ${a} − ${a % 10} = ${a - a % 10}, dann noch ${b - a % 10} weg.`); };
  const z2Mal = lvl => { const f = pick([2, 5, 10]), n = r(1, lvl === 1 ? 5 : 10);
    return zT(`${n} · ${f} = ?`, n * f, `Zähle in ${f}er-Schritten: ${f}, ${2 * f}, ${3 * f} …`); };
  const z2Uhr = () => {
    const std = r(1, 12), nach = std % 12 + 1;
    const typ = r(1, 3);
    if (typ === 1)
      return wahl(`Der kleine Zeiger zeigt auf die ${std}, der große Zeiger auf die 12. Wie spät ist es?`, `${std} Uhr`,
        [`${nach} Uhr`, `${std}:30 Uhr`, `halb ${std}`], 'Zeigt der große Zeiger auf die 12, ist es eine ganze Stunde. Der kleine Zeiger nennt die Stunde.');
    if (typ === 2)
      return wahl(`Der große Zeiger zeigt auf die 6, der kleine steht zwischen der ${std} und der ${nach}. Wie spät ist es?`, `${std}:30 Uhr`,
        [`${nach}:30 Uhr`, `${std} Uhr`, `${nach} Uhr`], 'Der große Zeiger auf der 6 bedeutet „halb“: eine halbe Stunde nach der vollen Stunde, die der kleine Zeiger schon überschritten hat (hier die ' + std + ').');
    return wahl(`Die Digitaluhr zeigt ${std}:30 Uhr. Wohin zeigt der große Zeiger auf der normalen Uhr?`, 'auf die 6',
      ['auf die 12', 'auf die 3', 'auf die 9'], 'Bei 30 Minuten (halbe Stunde) steht der große Zeiger unten auf der 6.');
  };
  const z2Kalender = lvl => {
    const typ = r(1, lvl >= 3 ? 4 : 2);
    if (typ === 1) { const i = r(0, 6), vor = Math.random() < .5;
      const ziel = WOCHE[(i + (vor ? 6 : 1)) % 7];
      return wahl(`Welcher Wochentag kommt ${vor ? 'vor' : 'nach'} ${WOCHE[i]}?`, ziel,
        shuffle(WOCHE.filter(w => w !== ziel && w !== WOCHE[i])).slice(0, 3), 'Die Woche: Montag, Dienstag, Mittwoch, Donnerstag, Freitag, Samstag, Sonntag – und dann beginnt sie wieder.'); }
    if (typ === 2) { const i = r(0, 11), ziel = MONATE[(i + 1) % 12];
      return wahl(`Welcher Monat kommt nach ${MONATE[i]}?`, ziel,
        shuffle(MONATE.filter(m => m !== ziel && m !== MONATE[i])).slice(0, 3), 'Zwölf Monate: Januar bis Dezember – nach dem Dezember kommt wieder der Januar.'); }
    if (typ === 3) { const i = r(0, 6), plus = r(2, 3), ziel = WOCHE[(i + plus) % 7];
      return wahl(`Heute ist ${WOCHE[i]}. Welcher Tag ist in ${plus} Tagen?`, ziel,
        shuffle(WOCHE.filter(w => w !== ziel)).slice(0, 3), `Zähle ${plus} Tage weiter ab ${WOCHE[i]}.`); }
    const J = [['Januar', 'Winter'], ['April', 'Frühling'], ['Juli', 'Sommer'], ['Oktober', 'Herbst']];
    const [m, s] = pick(J);
    return wahl(`In welcher Jahreszeit liegt der ${m}?`, s, ['Winter', 'Frühling', 'Sommer', 'Herbst'].filter(x => x !== s),
      'Winter: Dezember bis Februar, Frühling: März bis Mai, Sommer: Juni bis August, Herbst: September bis November.');
  };
  const z2Zehnerstangen = lvl => {
    const z = r(1, Math.max(1, Math.floor((maxZ2(lvl) - 1) / 10))), e = r(0, 9);
    return zC(`Du legst ${z} ${z === 1 ? 'Zehnerstange' : 'Zehnerstangen'} und ${e} Einerwürfel. Welche Zahl liegt da?`, z * 10 + e, 10,
      `${z} Zehner sind ${z * 10}, dazu ${e} Einer: ${z * 10 + e}.`);
  };
  const z2Luecke = lvl => { const z = r(1, 9), e = r(1, 9), n = z * 10 + e;
    return zT(`${z * 10} + __ = ${n}`, e, `Die Einer fehlen: ${n} − ${z * 10} = ${e}.`); };
  const z2Formen = fest(Z2_FORMEN);
  const z2Wahrsch = () => {
    const [satz, loesung] = pick(Z2_WAHRSCH);
    return wahl(`Ist das sicher, wahrscheinlich oder unmöglich?\n„${satz}“`, loesung,
      ['sicher', 'wahrscheinlich', 'unmöglich'].filter(x => x !== loesung),
      loesung === 'sicher' ? 'Sicher heißt: es passiert immer.' : loesung === 'unmöglich'
        ? 'Unmöglich heißt: es kann nie passieren.' : 'Wahrscheinlich heißt: es passiert meistens, aber nicht immer.');
  };
  /* Säulendiagramm / Tabelle: Wert aus Kästchen ablesen */
  const diagramm = max => {
    const THEMEN = [['Lieblingsobst', ['Äpfel', 'Bananen', 'Birnen', 'Erdbeeren']],
      ['Haustiere', ['Hunde', 'Katzen', 'Fische', 'Hasen']], ['Lieblingsfarbe', ['rot', 'blau', 'grün', 'gelb']]];
    const [thema, kat] = pick(THEMEN);
    const werte = shuffle(Array.from({ length: max }, (_, i) => i + 1)).slice(0, 4);
    const zeilen = kat.map((k, i) => `${k}: ${'█'.repeat(werte[i])}`).join('\n');
    const i = r(0, 3);
    const typ = r(1, 3);
    const kopf = `${thema} der Klasse (jedes Kästchen ist 1 Kind):\n${zeilen}\n\n`;
    if (typ === 1) return zT(kopf + `Wie viele Kinder haben „${kat[i]}“ gewählt?`, werte[i], 'Zähle die Kästchen in der Zeile.');
    if (typ === 2) { const iMax = werte.indexOf(Math.max(...werte));
      return wahl(kopf + 'Was haben die meisten Kinder gewählt?', kat[iMax], kat.filter((_, j) => j !== iMax),
        'Die längste Säule hat die meisten Kästchen.'); }
    const j = (i + 1) % 4;
    return zT(kopf + `Wie viele Kinder haben „${kat[i]}“ und „${kat[j]}“ zusammen gewählt?`, werte[i] + werte[j], 'Beide Zeilen zählen und zusammenzählen.');
  };

  /* ---- Zyklus 2, weitere Aufgabentypen (Plan Seite 30): Muster, Symmetrie, Weg, Strichliste, Größen ---- */
  const SYMBOLE = ['🔴', '🔵', '🟢', '🟡', '🟣', '🟠'];
  const z2Muster = lvl => {
    const typ = r(1, lvl >= 3 ? 3 : 2);
    if (typ === 1) {
      const d = pick([1, 2, 5, 10, 3, 4].filter(x => 5 * x <= maxZ2(lvl))), runter = Math.random() < .35;
      const start = r(0, Math.max(0, maxZ2(lvl) - 5 * d));
      const f = Array.from({ length: 5 }, (_, i) => runter ? start + (4 - i) * d : start + i * d);
      return zT(`Setze das Muster fort: ${f.slice(0, 4).join(', ')}, __`, f[4],
        runter ? `Die Zahlen werden immer um ${d} kleiner. Also ${f[3]} − ${d} = ${f[4]}.` : `Die Zahlen werden immer um ${d} größer. Also ${f[3]} + ${d} = ${f[4]}.`);
    }
    if (typ === 2) {
      const len = r(2, lvl <= 2 ? 2 : 3), bausteine = shuffle(SYMBOLE).slice(0, len), n = 2 * len + r(1, len - 1);
      const gezeigt = Array.from({ length: n }, (_, i) => bausteine[i % len]).join(' ');
      const loes = bausteine[n % len];
      return wahl(`Welches Zeichen kommt als nächstes?\n${gezeigt} __`, loes, shuffle(SYMBOLE.filter(x => x !== loes)).slice(0, 3),
        `Das Muster ${bausteine.join(' ')} wiederholt sich immer wieder. Nach ${gezeigt.split(' ').pop()} geht es mit ${loes} weiter.`);
    }
    const s0 = r(1, 5), f = [s0, s0 + 1, s0 + 3, s0 + 6];
    return zT(`Der Abstand zwischen den Zahlen wird immer um 1 größer. Setze fort: ${f.join(', ')}, __`, s0 + 10,
      `Die Abstände sind 1, 2, 3 – als nächstes 4. Also ${f[3]} + 4 = ${s0 + 10}.`);
  };
  const SYM_JA = ['A', 'H', 'I', 'M', 'O', 'T', 'U', 'V', 'W', 'X'], SYM_NEIN = ['F', 'G', 'J', 'L', 'P', 'R', 'S', 'Z'];
  const z2Symmetrie = lvl => {
    const typ = r(1, 3);
    if (typ === 1) {
      const ja = Math.random() < .5, loes = pick(ja ? SYM_JA : SYM_NEIN);
      return wahl(`Welcher Buchstabe ist ${ja ? '' : 'NICHT '}symmetrisch? Symmetrisch heißt: Man kann ihn in der Mitte an einer senkrechten Linie falten und beide Hälften liegen genau aufeinander.`,
        loes, shuffle(ja ? SYM_NEIN : SYM_JA).slice(0, 3),
        `${ja ? loes + ' sieht links und rechts von der Mittellinie gleich aus.' : loes + ' sieht links und rechts von der Mittellinie verschieden aus, die Hälften passen nicht aufeinander.'}`);
    }
    if (typ === 2) {
      const a = r(1, 3 + lvl);
      return opt3(`Du faltest ein Blatt an einer senkrechten Linie. Ein Punkt liegt ${a} Kästchen links von der Linie. Wo liegt der Punkt, der beim Falten genau auf ihm landet (sein Spiegelpunkt)?`,
        `${a} Kästchen rechts von der Linie`,
        [`${a} Kästchen links von der Linie`, `${2 * a} Kästchen rechts von der Linie`, `${a + 1} Kästchen rechts von der Linie`, `${a} Kästchen unter der Linie`],
        'Das Spiegelbild liegt genauso weit von der Faltlinie entfernt, aber auf der anderen Seite.');
    }
    const a = r(2, 4 + lvl * 2);
    return zT(`Ein Schmetterling ist symmetrisch. Auf dem linken Flügel sind ${a} Punkte. Wie viele Punkte hat er insgesamt auf beiden Flügeln?`, 2 * a,
      `Der rechte Flügel ist das Spiegelbild und hat auch ${a} Punkte: ${a} + ${a} = ${2 * a}.`);
  };
  const z2Weg = lvl => {
    const n = name();
    if (r(1, 2) === 1) {
      const a = r(2, 3 + lvl), b = r(2, 3 + lvl), c = r(1, a - 1), d = lvl >= 3 ? r(1, b - 1) : 0;
      const befehle = [`${schritte(a)} nach rechts`, `${schritte(b)} nach oben`, `${schritte(c)} nach links`];
      if (d) befehle.push(`${schritte(d)} nach unten`);
      const rechts = Math.random() < .5;
      return zT(`📖 ${n} spielt Roboter auf einem Gitter. ${n} geht: ${befehle.join(', dann ')}. Wie viele Schritte ist ${n} am Ende vom Start aus nach ${rechts ? 'rechts' : 'oben'} entfernt?`,
        rechts ? a - c : b - d,
        rechts ? `Nach rechts ${a} Schritte, dann ${c} zurück nach links: ${a} − ${c} = ${a - c}.`
          : `Nach oben ${b} Schritte${d ? `, dann ${d} nach unten: ${b} − ${d}` : ''} = ${b - d}.`);
    }
    const t = r(2, lvl <= 2 ? 3 : 5), folge = Array.from({ length: t }, () => pick(['links', 'rechts']));
    const q = folge.reduce((x, f) => (x + (f === 'rechts' ? 1 : 3)) % 4, 0);
    const ANTW = ['geradeaus, wie am Anfang', 'nach rechts', 'zurück, in die Gegenrichtung', 'nach links'];
    return wahl(`📖 ${n} steht und schaut geradeaus. Dann macht ${n} nacheinander diese Vierteldrehungen (eine Vierteldrehung ist wie eine Ecke): ${folge.join(', ')}. Wohin schaut ${n} jetzt, vom Anfang aus gesehen?`,
      ANTW[q], ANTW.filter((_, i) => i !== q), 'Rechts und links heben sich auf. Zwei gleiche Drehungen hintereinander drehen einen ganz um (zurück). Drehe Schritt für Schritt nach.');
  };
  const strich = k => [...Array(Math.floor(k / 5)).fill('||||/'), k % 5 ? '|'.repeat(k % 5) : ''].filter(Boolean).join(' ');
  const z2Strichliste = lvl => {
    const THEMEN = [['Haustiere der Klasse', ['Hunde', 'Katzen', 'Fische', 'Hasen']], ['Lieblingsspiel', ['Fußball', 'Verstecken', 'Fangen', 'Seilspringen']],
      ['Lieblingsfarbe', ['rot', 'blau', 'grün', 'gelb']]];
    const [thema, kat] = pick(THEMEN), max = lvl <= 2 ? 12 : lvl <= 4 ? 20 : 25;
    const w = shuffle(Array.from({ length: max }, (_, i) => i + 1)).slice(0, 4);
    const kopf = `Strichliste „${thema}“ (ein Bündel ||||/ sind 5 Striche):\n${kat.map((k, i) => `${k}: ${strich(w[i])}`).join('\n')}\n\n`;
    const typ = r(1, 3);
    if (typ === 1) { const i = r(0, 3);
      return zT(kopf + `Wie viele Striche stehen bei „${kat[i]}“?`, w[i], 'Zähle die Bündel in Fünferschritten (5, 10, 15 …) und die einzelnen Striche dazu.'); }
    if (typ === 2) { const iMax = w.indexOf(Math.max(...w));
      return wahl(kopf + 'Was wurde am häufigsten genannt?', kat[iMax], kat.filter((_, j) => j !== iMax), 'Die meisten Striche hat die längste Zeile.'); }
    let [i, j] = shuffle([0, 1, 2, 3]).slice(0, 2); if (w[i] < w[j]) [i, j] = [j, i];
    return zT(kopf + `Wie viele Striche hat „${kat[i]}“ mehr als „${kat[j]}“?`, w[i] - w[j], `Beide Zeilen zählen (${w[i]} und ${w[j]}) und den Unterschied rechnen.`);
  };
  const z2Groessen = lvl => {
    const n = name(), m = Math.min(50, maxZ2(lvl)), plus = Math.random() < .5;
    const [u, tp, tm, mx] = pick([
      ['€', (a, b) => `${n} kauft ein Eis für ${a} € und eine Brezel für ${b} €. Wie viele € kostet das zusammen?`, (a, b) => `${n} hat ${a} € und kauft ein Buch für ${b} €. Wie viele € bleiben übrig?`, m],
      ['kg', (a, b) => `${n} trägt einen Sack mit ${a} kg und einen mit ${b} kg. Wie viele kg sind das zusammen?`, (a, b) => `Ein Korb Äpfel wiegt ${a} kg. ${n} nimmt ${b} kg heraus. Wie viele kg bleiben im Korb?`, m],
      ['l', (a, b) => `In einem Eimer sind ${a} l Wasser, in einem zweiten ${b} l. Wie viele l sind das zusammen?`, (a, b) => `Ein Kanister fasst ${a} l. ${b} l sind schon herausgeflossen. Wie viele l sind noch drin?`, m],
      ['m', (a, b) => `Ein Seil ist ${a} m lang, ein zweites ${b} m. Wie viele m sind beide Seile zusammen?`, (a, b) => `${n} hat ein Band mit ${a} m und schneidet ${b} m ab. Wie viele m bleiben?`, m],
      ['h', (a, b) => `${n} spielt ${a} h am Samstag und ${b} h am Sonntag. Wie viele h sind das zusammen?`, (a, b) => `Ein Ausflug dauert ${a} h. Schon ${b} h sind vorbei. Wie viele h dauert er noch?`, Math.min(m, 12)]
    ]);
    if (plus) { const a = r(3, mx - 3), b = r(2, mx - a);
      return zT('📖 ' + tp(a, b), a + b, `Gleiche Einheit (${u}) – du darfst einfach rechnen: ${a} + ${b} = ${a + b}.`); }
    const a = r(5, mx), b = r(2, a - 1);
    return zT('📖 ' + tm(a, b), a - b, `Gleiche Einheit (${u}) – du darfst einfach rechnen: ${a} − ${b} = ${a - b}.`);
  };
  const z2Einheit = fest(Z2_EINHEIT);

  const z2Erz = {
    plus: lvl => { const [a, b] = ueberZehner(maxZ2(lvl) < 30 ? 20 : maxZ2(lvl)), n = name();
      return zT(`📖 ${n} hat ${a} Murmeln. Dann bekommt ${n} noch ${b} dazu. Wie viele Murmeln sind es jetzt?`, a + b,
        `${a} + ${b}: erst auf den vollen Zehner, dann den Rest.`); },
    minus: lvl => { const [a, b] = minusUeberZehner(maxZ2(lvl) < 30 ? 20 : maxZ2(lvl)), n = name();
      return zT(`📖 ${n} hat ${a} Sticker und verschenkt ${b}. Wie viele Sticker bleiben?`, a - b,
        `${a} − ${b}: erst bis zum vollen Zehner zurück, dann den Rest abziehen.`); },
    mal: lvl => { const f = pick([2, 5, 10]), n = r(2, lvl === 1 ? 5 : 10), p = name();
      return zT(`📖 ${p} packt ${n} Tüten. In jeder Tüte sind ${f} Bonbons. Wie viele Bonbons sind es zusammen?`, n * f,
        `${n} Tüten mit je ${f}: ${n} · ${f}.`); },
    tag: () => { const i = r(0, 6), gestern = Math.random() < .5;
      return wahl(`📖 ${gestern ? 'Gestern war' : 'Heute ist'} ${WOCHE[i]}. Welcher Tag ist ${gestern ? 'heute' : 'morgen'}?`, WOCHE[(i + 1) % 7],
        shuffle(WOCHE.filter(w => w !== WOCHE[(i + 1) % 7])).slice(0, 3), 'Die Wochentage folgen immer in derselben Reihenfolge.'); },
    kommutativ: () => { const a = r(11, 39), b = r(11, 39), x = name();
      let y = name(); while (y === x) y = name();
      return wahl(`📖 ${x} rechnet ${a} + ${b}. ${y} rechnet ${b} + ${a}. Wer hat das größere Ergebnis?`, 'Beide gleich',
        [x, y, 'Das kann man nicht wissen'], 'Beim Addieren darf man die Zahlen vertauschen: das Ergebnis bleibt gleich.'); }
  };

  /* ---------------- Mathe, Zyklus 3 (Plan Seite 31) ---------------- */

  const stellen = lvl => lvlWahl(lvl, 4, 4, 5, 6, 6);   // Ziffernzahl der großen Zahlen
  const grosseZahl = lvl => {
    const s = stellen(lvl);
    const lo = Math.pow(10, s - 1), hi = Math.pow(10, s) - 1;
    return r(lo, lvl === 5 ? Math.min(hi, 999999) : hi);
  };
  const STELLEN = ['Einer', 'Zehner', 'Hunderter', 'Tausender', 'Zehntausender', 'Hunderttausender'];

  const z3Zahlen = lvl => {
    const typ = r(1, 3);
    if (typ === 1) {
      const n = grosseZahl(lvl), ziffern = String(n);
      const s = r(0, ziffern.length - 1);                 // Position von links
      const stelle = ziffern.length - 1 - s;
      const loesung = ziffern[s];
      return wahl(`Welche Ziffer steht in der Zahl ${gross(n)} an der ${STELLEN[stelle]}-Stelle?`, loesung,
        shuffle(['0','1','2','3','4','5','6','7','8','9'].filter(d => d !== loesung)).slice(0, 3),
        `Von rechts: Einer, Zehner, Hunderter, Tausender, Zehntausender, Hunderttausender. Hier ist es die ${ziffern.length - stelle}. Ziffer von links.`);
    }
    if (typ === 2) {
      const n = grosseZahl(lvl), k = r(0, stellen(lvl) - 2), d = r(1, 9) * Math.pow(10, k);
      const m = n + d <= 999999 && String(n + d).length === String(n).length ? n + d : n - d;
      return wahl('Welche Zahl ist größer?', gross(Math.max(n, m)), [gross(Math.min(n, m)), 'beide gleich groß'],
        'Vergleiche zuerst die Ziffern ganz links, dann Stelle für Stelle nach rechts.');
    }
    const n = r(1000, 999999);
    const vor = Math.random() < .5;
    return zT(`Welche Zahl ist der ${vor ? 'Vorgänger' : 'Nachfolger'} von ${gross(n)}?`, vor ? n - 1 : n + 1,
      vor ? 'Der Vorgänger ist eins weniger.' : 'Der Nachfolger ist eins mehr.');
  };
  const z3Rechnen = lvl => {
    const typ = lvlWahl(lvl, r(1, 2), r(1, 2), r(1, 3), r(1, 4), r(1, 5));
    if (typ === 1) { const a = r(100, lvl <= 2 ? 999 : 49999), b = r(100, lvl <= 2 ? 999 : 49999);
      return zT(`${gross(a)} + ${gross(b)} = ?`, a + b, 'Schriftlich addieren: Stelle für Stelle von rechts, Übertrag nicht vergessen.'); }
    if (typ === 2) { const a = r(1000, lvl <= 2 ? 9999 : 99999), b = r(100, a - 1);
      return zT(`${gross(a)} − ${gross(b)} = ?`, a - b, 'Schriftlich subtrahieren: Stelle für Stelle von rechts, bei Bedarf entbündeln.'); }
    if (typ === 3) { const a = r(100, 9999), b = r(2, 9);
      return zT(`${gross(a)} · ${b} = ?`, a * b, `Zerlege: Tausender, Hunderter, Zehner und Einer einzeln mit ${b} malnehmen und zusammenzählen.`); }
    if (typ === 4) { const a = r(11, 99), b = r(11, 99);
      return zT(`${a} · ${b} = ?`, a * b, `Zerlege ${b} in Zehner und Einer: ${a} · ${Math.floor(b / 10) * 10} + ${a} · ${b % 10}.`); }
    const q = r(100, 1999), d = r(2, 9);
    return zT(`${gross(q * d)} : ${d} = ?`, q, `Probe mit der Umkehrung: ${q} · ${d} = ${q * d}.`);
  };
  const z3Einmaleins = lvl => {
    const a = r(0, 10), b = r(lvl === 1 ? 2 : 1, 10), typ = r(1, 3);
    if (typ === 1) return zT(`${a} · ${b} = ?`, a * b, 'Aus dem kleinen Einmaleins: denk in Reihen.');
    if (typ === 2) { const x = r(1, 10); return zT(`__ · ${b} = ${x * b}`, x, `Umkehraufgabe: ${x * b} : ${b} = ${x}.`); }
    return zT(`${a * b} : ${b} = ?`, a, `Umkehraufgabe zu ${a} · ${b} = ${a * b}.`);
  };
  const z3Luecke = lvl => {
    const max = lvlWahl(lvl, 50, 100, 500, 1000, 5000);
    const typ = r(1, 3);
    if (typ === 1) { const k = r(5, Math.floor(max / 2)), x = r(5, max - k);
      return zT(`__ + ${k} = ${x + k}`, x, `Umkehren: ${x + k} − ${k} = ${x}.`); }
    if (typ === 2) { const k = r(5, Math.floor(max / 2)), x = r(k + 1, max);
      return zT(`__ − ${k} = ${x - k}`, x, `Umkehren: ${x - k} + ${k} = ${x}.`); }
    const a = r(20, max), b = r(5, a - 1);
    return zT(`${a} − __ = ${a - b}`, b, `Die fehlende Zahl ist der Unterschied: ${a} − ${a - b} = ${b}.`);
  };
  const z3Einheit = fest(Z3_EINHEIT);
  const z3Umrechnen = lvl => {
    const typ = r(1, 7), n = r(2, lvl <= 2 ? 9 : 25);
    if (typ === 1) return zT(`${n} m = __ cm`, n * 100, '1 Meter hat 100 Zentimeter.');
    if (typ === 2) return zT(`${n} km = __ m`, n * 1000, '1 Kilometer hat 1000 Meter.');
    if (typ === 3) return zT(`${n} kg = __ g`, n * 1000, '1 Kilogramm hat 1000 Gramm.');
    if (typ === 4) return zT(`${n} h = __ min`, n * 60, '1 Stunde hat 60 Minuten.');
    if (typ === 5) return zT(`${n} € = __ Cent`, n * 100, '1 Euro hat 100 Cent.');
    if (typ === 6) return zT(`${n} cm = __ mm`, n * 10, '1 Zentimeter hat 10 Millimeter.');
    const km = r(1, 9), m = r(1, 9) * 100;
    return zT(`${km} km ${m} m = __ m`, km * 1000 + m, `${km} km sind ${km * 1000} m, dazu ${m} m.`);
  };
  const z3Brueche = lvl => {
    const typ = r(1, 2);
    if (typ === 1) {
      const B = [['½', 2], ['⅓', 3], ['¼', 4]], [sym, n] = pick(B), teil = n * r(2, lvl <= 2 ? 5 : 12);
      return zT(`Wie viel ist ${sym} von ${teil}?`, teil / n, `Durch ${n} teilen: ${teil} : ${n}.`);
    }
    const g = 4 * r(2, lvl <= 2 ? 5 : 12);
    return zT(`Wie viel ist ¾ von ${g}?`, g / 4 * 3, `Erst ¼ ausrechnen: ${g} : 4 = ${g / 4}, dann mal 3.`);
  };
  const z3Pizza = () => {
    const [n, teile, ein] = pick([[2, 1, '½'], [3, 1, '⅓'], [4, 1, '¼'], [4, 3, '¾']]);
    return wahl(`Eine Pizza ist in ${n} gleich große Stücke geschnitten. Du isst ${teile} ${teile === 1 ? 'Stück' : 'Stücke'}. Welcher Bruchteil ist das?`,
      ein, ['½', '⅓', '¼', '¾'].filter(x => x !== ein), 'Der Nenner sagt, in wie viele gleiche Teile das Ganze geteilt ist; der Zähler, wie viele du hast.');
  };
  const z3BruecheText = () => {
    const [sym, n] = pick([['½', 2], ['⅓', 3], ['¼', 4]]), teil = n * r(2, 8), p = name();
    return zT(`📖 In der Dose sind ${teil} Gummibärchen. ${p} isst ${sym} davon. Wie viele Gummibärchen sind das?`, teil / n, `${teil} durch ${n} teilen.`);
  };
  const z3Rechteck = lvl => {
    const typ = r(1, 5), a = r(2, 8 + lvl * 3), b = r(2, 8 + lvl * 3);
    if (typ === 1) return zT(`Ein Rechteck ist ${a} cm lang und ${b} cm breit. Wie groß ist der Umfang (in cm)?`, 2 * (a + b), 'Umfang = alle vier Seiten zusammen: 2 · (Länge + Breite).');
    if (typ === 2) return zT(`Ein Rechteck ist ${a} cm lang und ${b} cm breit. Wie groß ist die Fläche (in cm²)?`, a * b, 'Fläche = Länge · Breite: so viele Einheitsquadrate passen hinein.');
    if (typ === 3) return zT(`Ein Quadrat hat die Seitenlänge ${a} cm. Wie groß ist der Umfang (in cm)?`, 4 * a, 'Ein Quadrat hat vier gleich lange Seiten.');
    if (typ === 4) return zT(`Ein Quadrat hat die Seitenlänge ${a} cm. Wie groß ist die Fläche (in cm²)?`, a * a, 'Fläche = Seite · Seite.');
    return zT(`Ein Rechteck hat den Umfang ${2 * (a + b)} cm und ist ${a} cm lang. Wie breit ist es (in cm)?`, b,
      `Länge plus Breite sind der halbe Umfang: ${a + b} cm. Davon die Länge abziehen.`);
  };
  const z3Koerper = fest(Z3_KOERPER);
  const z3Fliesen = lvl => { const a = r(3, 6 + lvl * 2), b = r(3, 6 + lvl * 2);
    return zT(`Ein Rechteck ist aus Einheitsquadraten gelegt: ${a} Reihen mit je ${b} Quadraten. Wie viele Quadrate sind es (Fläche)?`, a * b, 'Reihen mal Quadrate pro Reihe.'); };
  const z3Tabelle = lvl => {
    const ORTE = ['Schule A', 'Schule B', 'Schule C', 'Schule D'];
    const f = lvl >= 4 ? 10000 : 1000;
    const w = shuffle(Array.from({ length: 9 }, (_, i) => i + 2)).slice(0, 4).map(x => x * f);
    const tab = ORTE.map((o, i) => `${o}: ${gross(w[i])} Bücher`).join('\n');
    const i = r(0, 3);
    let j = (i + r(1, 3)) % 4;
    return zT(`Eine Tabelle zeigt, wie viele Bücher vier Schulen haben:\n${tab}\n\nWie viele Bücher hat ${ORTE[i]} mehr oder weniger als ${ORTE[j]}? Gib den Unterschied an.`,
      Math.abs(w[i] - w[j]), 'Den kleineren Wert vom größeren abziehen.');
  };
  const z3Text = lvl => {
    const typ = r(1, 4), n = name(), s = lvl <= 2 ? 1 : 10;
    if (typ === 1) { const a = r(80, 200) * s, b = r(10, 40) * s, c = r(10, 40) * s, d = r(10, 40) * s;
      return zT(`📖 In der Kiste sind ${a} Äpfel. Am Vormittag werden ${b} verkauft, am Nachmittag ${c}. Dann kommen ${d} neue dazu. Wie viele Äpfel sind jetzt in der Kiste?`, a - b - c + d,
        `Schritt für Schritt: ${a} − ${b} − ${c} + ${d}.`); }
    if (typ === 2) { const p = r(80, 250), q = r(10, 40), t = r(8, 30), g = r(1, 40);
      const sum = p + q + t, gespart = sum - g;
      return zT(`📖 ${n} möchte ein Fahrrad für ${p} €, einen Helm für ${q} € und ein Schloss für ${t} € kaufen. ${n} hat ${gespart} € gespart. Wie viel Geld fehlt noch?`, g,
        `Erst alles zusammenzählen: ${p} + ${q} + ${t} = ${sum}. Dann ${sum} − ${gespart}.`); }
    if (typ === 3) { const k = r(3, 8), m = r(18, 30), l = r(2, 5);
      return zT(`📖 ${k} Klassen fahren auf Klassenfahrt, in jeder Klasse sind ${m} Kinder. Außerdem fahren ${l} Lehrerinnen und Lehrer mit. Wie viele Personen fahren insgesamt?`, k * m + l,
        `Erst die Kinder: ${k} · ${m} = ${k * m}. Dann die Erwachsenen dazuzählen.`); }
    const a = r(1, 3) * 1000 + r(1, 9) * 100, b = r(2, 9) * 100 + 50, c = r(1, 3) * 100;
    return zT(`📖 ${n} läuft ${gross(a)} m zur Schule, dann ${b} m weiter zum Park und ${c} m zurück Richtung Schule. Wie viele Meter ist ${n} insgesamt gelaufen?`, a + b + c,
      `Alle Strecken zusammenzählen: ${a} + ${b} + ${c}.`);
  };
  const z3ErzEinheit = () => {
    const typ = r(1, 3);
    if (typ === 1) { const l = pick([[1, '½', 500], [3, '¾', 750], [1, '¼', 250]]);
      return zT(`📖 Im Rezept steht ${l[1]} Liter Milch. Wie viele Milliliter sind das? (1 Liter = 1000 ml)`, l[2], `Ein Liter sind 1000 ml; ${l[1]} davon sind ${l[2]} ml.`); }
    if (typ === 2) { const m = r(2, 9) * 50; return zT(`📖 Ein Brot wiegt ${m} g, ein Kilogramm hat 1000 g. Wie viele Gramm fehlen bis zu einem Kilogramm?`, 1000 - m, `1000 − ${m}.`); }
    const e = r(2, 9);
    return zT(`📖 Ein Eis kostet ${e} €. Du bezahlst mit einem 10-€-Schein. Wie viel Rückgeld bekommst du in Cent?`, (10 - e) * 100, `Rückgeld: ${10 - e} €, und 1 € sind 100 Cent.`);
  };

  /* ---- Zyklus 3, weitere Aufgabentypen (Plan Seite 31): Flächeneinheiten, Tonne, Diagramm mit Skala,
         Symmetrie, Gitter-Befehle, Kombinatorik ---- */
  const z3Flaeche = lvl => {
    const typ = pick(lvl <= 1 ? [1, 4, 6] : lvl === 2 ? [1, 2, 4, 6] : [1, 2, 3, 4, 5, 6]), n = r(2, lvl <= 2 ? 9 : 25);
    if (typ === 1) return zT(`${n} cm² = __ mm²`, n * 100, '1 cm² ist ein Quadrat mit 1 cm Seitenlänge, also 10 mm · 10 mm = 100 mm².');
    if (typ === 2) return zT(`${n} m² = __ cm²`, n * 10000, '1 m² ist ein Quadrat mit 100 cm Seitenlänge: 100 · 100 = 10 000 cm².');
    if (typ === 3) return zT(`${n} km² = __ m²`, n * 1000000, '1 km² ist ein Quadrat mit 1000 m Seitenlänge: 1000 · 1000 = 1 000 000 m².');
    if (typ === 4) return zT(`${gross(n * 100)} mm² = __ cm²`, n, '100 mm² sind 1 cm². Darum durch 100 teilen.');
    if (typ === 5) return zT(`${gross(n * 10000)} cm² = __ m²`, n, '10 000 cm² sind 1 m². Darum durch 10 000 teilen.');
    const [frage, richtig, hilfe] = pick(Z3_FLAECHE);
    return wahl(frage, richtig, ['mm²', 'cm²', 'm²', 'km²'].filter(x => x !== richtig), hilfe);
  };
  const z3Masse = lvl => {
    const typ = r(1, 6), n = r(2, lvl <= 2 ? 9 : 25);
    if (typ === 1) return zT(`${n} t = __ kg`, n * 1000, '1 Tonne hat 1000 Kilogramm.');
    if (typ === 2) return zT(`${gross(n * 1000)} kg = __ t`, n, '1000 kg sind 1 Tonne. Darum durch 1000 teilen.');
    if (typ === 3) { const k = r(1, 9) * 100;
      return zT(`${n} t ${k} kg = __ kg`, n * 1000 + k, `${n} t sind ${gross(n * 1000)} kg, dazu ${k} kg.`); }
    if (typ === 4) { const km = r(1, 9), m = r(1, 9) * 100;
      return zT(`${km} km ${m} m = __ km`, dez(km * 100 + m / 10), `${km} km ${m} m = ${km * 1000 + m} m = ${dez(km * 100 + m / 10)} km. Dieselbe Länge, nur anders geschrieben.`); }
    if (typ === 5) { const a = r(1, 9), c = r(1, 9) * 10;
      return zT(`${a} m ${c} cm = __ m`, dez(a * 100 + c), `${a} m ${c} cm = ${a * 100 + c} cm = ${dez(a * 100 + c)} m.`); }
    const a = r(1, 9), g = r(1, 9) * 100;
    return zT(`${a} kg ${g} g = __ kg`, dez(a * 100 + g / 10), `${a} kg ${g} g = ${a * 1000 + g} g = ${dez(a * 100 + g / 10)} kg.`);
  };
  const skala = lvl => pick(lvlWahl(lvl, [2, 5, 10], [5, 10, 20], [10, 20, 50], [100, 200, 500], [1000, 5000, 10000]));
  const z3Saeulen = lvl => {
    const s = skala(lvl);
    const [thema, kat] = pick([['Besucher im Zoo', ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag']], ['verkaufte Eiskugeln', ['Mai', 'Juni', 'Juli', 'August']],
      ['Bücher in der Bibliothek', ['Regal A', 'Regal B', 'Regal C', 'Regal D']]]);
    const k = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 4);
    const kopf = `Säulendiagramm „${thema}“ – ein Kästchen steht für ${gross(s)}:\n${kat.map((x, i) => `${x}: ${'█'.repeat(k[i])}`).join('\n')}\n\n`;
    const typ = r(1, 4);
    let [i, j] = shuffle([0, 1, 2, 3]).slice(0, 2);
    if (typ === 1) return zT(kopf + `Wie groß ist der Wert bei „${kat[i]}“?`, k[i] * s, `${k[i]} Kästchen · ${gross(s)} = ${gross(k[i] * s)}. Immer erst die Skala beachten.`);
    if (typ === 2) { if (k[i] < k[j]) [i, j] = [j, i];
      return zT(kopf + `Wie groß ist der Unterschied zwischen „${kat[i]}“ und „${kat[j]}“?`, (k[i] - k[j]) * s, `Die Säulen unterscheiden sich um ${k[i] - k[j]} Kästchen: ${k[i] - k[j]} · ${gross(s)}.`); }
    if (typ === 3) return zT(kopf + `Wie groß ist der Wert von „${kat[i]}“ und „${kat[j]}“ zusammen?`, (k[i] + k[j]) * s, `${k[i]} + ${k[j]} = ${k[i] + k[j]} Kästchen, mal ${gross(s)}.`);
    return zT(kopf + 'Wie groß ist der höchste Wert?', Math.max(...k) * s, `Die längste Säule hat ${Math.max(...k)} Kästchen: ${Math.max(...k)} · ${gross(s)}.`);
  };
  const SKALEN = [1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 25, 30, 40, 50, 60, 100, 200, 250, 300, 500, 1000, 2000, 2500, 5000, 10000, 20000, 50000];
  const z3Skala = lvl => {
    for (let t = 0; t < 100; t++) {
      const s0 = skala(lvl), ks = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 4), w = ks.map(x => x * s0);
      const hoechst = Math.max(...w), gueltig = x => w.every(v => v % x === 0) && hoechst / x <= 10;
      const falsch = SKALEN.filter(x => !gueltig(x)), nah = falsch.filter(x => x >= s0 / 5 && x <= s0 * 5);
      if (falsch.length < 3) continue;
      const tab = w.map((v, i) => `Wert ${i + 1}: ${gross(v)}`).join('\n');
      return wahl(`Ein Säulendiagramm soll diese Werte zeigen:\n${tab}\n\nWelche Skala („ein Kästchen steht für …“) passt? Alle Werte sollen genau auf ganze Kästchen passen, und die höchste Säule soll höchstens 10 Kästchen hoch sein.`,
        String(s0), shuffle(nah.length >= 3 ? nah : falsch).slice(0, 3).map(String),
        `Jeder Wert muss durch die Skala teilbar sein, und der höchste Wert geteilt durch die Skala darf höchstens 10 sein. Bei ${gross(s0)}: ${gross(hoechst)} : ${gross(s0)} = ${hoechst / s0} Kästchen.`);
    }
    return wahl('Ein Säulendiagramm soll die Werte 20, 40, 60 und 100 zeigen. Welche Skala („ein Kästchen steht für …“) passt? Alle Werte sollen genau auf ganze Kästchen passen, und die höchste Säule soll höchstens 10 Kästchen hoch sein.',
      '10', ['3', '4', '1'], 'Bei 10 sind es 2, 4, 6 und 10 Kästchen. Bei 1 wäre die Säule viel zu hoch, bei 3 und 4 passt nicht jeder Wert genau.');
  };
  const FIG = [
    ['ein Quadrat', 4, 'Zwei Achsen durch die Mitten gegenüberliegender Seiten und zwei durch die Ecken: 4.'],
    ['ein Rechteck, das kein Quadrat ist', 2, 'Zwei Achsen durch die Mitten gegenüberliegender Seiten. Die Diagonalen sind keine Achsen.'],
    ['ein gleichseitiges Dreieck', 3, 'Von jeder Ecke eine Achse zur Mitte der gegenüberliegenden Seite: 3.'],
    ['eine Raute, die kein Quadrat ist', 2, 'Die beiden Diagonalen sind die Achsen: 2.'],
    ['ein Parallelogramm, das weder Rechteck noch Raute ist', 0, 'Man kann es nirgends so falten, dass beide Hälften genau aufeinander liegen: 0 Achsen.'],
    ['ein gleichschenkliges Dreieck, das nicht gleichseitig ist', 1, 'Nur die Achse durch die Spitze und die Mitte der Grundseite: 1.']
  ];
  const z3Symmetrie = lvl => {
    const typ = r(1, 3);
    if (typ === 1) { const [f, k, h] = pick(FIG);
      return wahl(`Eine Spiegelachse ist eine Faltlinie, bei der beide Hälften genau aufeinander liegen. Wie viele Spiegelachsen hat ${f}?`, String(k),
        shuffle([0, 1, 2, 3, 4, 5].filter(x => x !== k)).slice(0, 3).map(String), h); }
    if (typ === 2) { const u = lvl <= 2 ? 1 : lvl <= 4 ? 10 : 100, a = r(6, 20) * u, d = r(1, 5) * u;
      return zT(`Auf der Zahlengeraden liegt die Spiegelachse bei ${gross(a)}. Die Zahl ${gross(a - d)} wird an dieser Achse gespiegelt. Bei welcher Zahl liegt das Spiegelbild?`, a + d,
        `Das Spiegelbild liegt genauso weit auf der anderen Seite: ${gross(a)} − ${gross(a - d)} = ${gross(d)}, also ${gross(a)} + ${gross(d)} = ${gross(a + d)}.`); }
    const reihen = [r(1, 5), r(1, 5), r(1, 5)];
    const summe = reihen.reduce((x, y) => x + y, 0);
    return zT(`Ein Muster aus Kästchen ist symmetrisch zu einer senkrechten Achse, die zwischen den Kästchen verläuft (kein Kästchen liegt auf der Achse). Links der Achse sind in der oberen Reihe ${reihen[0]}, in der mittleren ${reihen[1]} und in der unteren ${reihen[2]} Kästchen schwarz. Wie viele schwarze Kästchen hat die ganze Figur?`,
      2 * summe, `Links sind ${reihen.join(' + ')} = ${summe} Kästchen schwarz. Rechts spiegelt sich dasselbe: ${summe} + ${summe} = ${2 * summe}.`);
  };
  const RICHT = [['nach rechts', 1, 0], ['nach links', -1, 0], ['nach oben', 0, 1], ['nach unten', 0, -1]];
  const z3Roboter = lvl => {
    const typ = lvl <= 1 ? r(1, 2) : r(1, 3);
    const kopf = 'Ein Roboter startet auf einem Gitter bei (0|0). Die erste Zahl zählt die Schritte nach rechts, die zweite die Schritte nach oben.\n';
    if (typ === 1) {
      const n = lvl <= 2 ? 3 : lvl <= 4 ? 4 : 5, cmds = []; let x = 0, y = 0;
      while (cmds.length < n) {
        const [wort, dx, dy] = pick(RICHT), k = r(1, 4), nx = x + dx * k, ny = y + dy * k;
        if (nx < 0 || ny < 0 || nx > 12 || ny > 12) continue;
        cmds.push(`${schritte(k)} ${wort}`); x = nx; y = ny;
      }
      return opt3(kopf + `Befehle: ${cmds.join(', ')}.\nWo steht der Roboter am Ende?`, `(${x}|${y})`,
        [`(${y}|${x})`, `(${x + 1}|${y})`, `(${x}|${y + 1})`, `(${x + 2}|${y})`], 'Rechne links/rechts und oben/unten getrennt: nach rechts zählt plus, nach links minus, nach oben plus, nach unten minus.');
    }
    if (typ === 2) { const a = r(3, 7), c = r(1, a - 1), k = r(2, 8);
      return zT(kopf + `Befehle: ${schritte(a)} nach rechts, __ Schritte nach oben, ${schritte(c)} nach links. Er soll bei (${a - c}|${k}) ankommen. Welche Zahl gehört in die Lücke?`, k,
        `Nach rechts und links ergibt sich ${a} − ${c} = ${a - c} (passt). Die zweite Zahl des Ziels ist ${k}, also muss der Roboter ${k} Schritte nach oben gehen.`); }
    const t = r(2, 4), a = r(1, 3), b = r(1, 3), c = lvl >= 4 ? r(1, t * a) : 0;
    return opt3(kopf + `Befehle: Wiederhole ${t}-mal: ${schritte(a)} nach rechts, ${schritte(b)} nach oben.${c ? ` Danach: ${schritte(c)} nach links.` : ''}\nWo steht der Roboter am Ende?`,
      `(${t * a - c}|${t * b})`, [`(${t * b}|${t * a - c})`, `(${a - c}|${b})`, `(${t * a}|${t * b})`, `(${t * a - c + 1}|${t * b})`],
      `Jede Runde bringt ${a} nach rechts und ${b} nach oben, ${t} Runden: ${t * a} und ${t * b}${c ? `. Dann ${c} nach links: ${t * a} − ${c} = ${t * a - c}` : ''}.`);
  };
  const z3Kombi = lvl => {
    const g = lvl <= 2 ? 4 : 5, a = r(2, g), b = r(2, g), n = name(), typ = r(1, lvl <= 2 ? 4 : 5);
    const hilfeMal = (x, y) => `Jede der ${x} Möglichkeiten lässt sich mit jeder der ${y} anderen verbinden: ${x} · ${y} = ${x * y}. Eine Tabelle oder ein Baum macht das sichtbar.`;
    if (typ === 1) return zahlOpt(`📖 ${n} hat ${a} verschiedene Hosen und ${b} verschiedene Shirts. Wie viele verschiedene Outfits (eine Hose und ein Shirt) sind möglich?`, a * b,
      [a + b, a * b + a, a * b - 1, a * b + b], hilfeMal(a, b));
    if (typ === 2) return zahlOpt(`📖 In der Eisdiele gibt es ${a} Eissorten und ${b} Soßen. ${n} nimmt eine Eissorte und eine Soße. Wie viele verschiedene Möglichkeiten gibt es?`, a * b,
      [a + b, a * b + 1, a * b - 1, a * b + a], hilfeMal(a, b));
    if (typ === 3) { const [x, y, z] = shuffle(NAMEN).slice(0, 3);
      return zahlOpt(`📖 ${x}, ${y} und ${z} stellen sich in eine Reihe. Wie viele verschiedene Reihenfolgen gibt es?`, 6, [3, 9, 12, 8],
        'Für den ersten Platz gibt es 3 Kinder, für den zweiten noch 2, für den dritten 1: 3 · 2 · 1 = 6. Probiere es mit einem Baumdiagramm.'); }
    if (typ === 4) { const gleich = Math.random() < .5;
      return zahlOpt(`📖 Eine Flagge hat zwei Streifen übereinander. Es gibt die Farben rot, blau und grün. ${gleich ? 'Beide Streifen dürfen dieselbe Farbe haben.' : 'Die beiden Streifen müssen verschiedene Farben haben.'} Wie viele verschiedene Flaggen gibt es?`,
        gleich ? 9 : 6, gleich ? [6, 3, 12, 8] : [9, 3, 5, 12],
        gleich ? 'Oben 3 Farben, unten wieder 3 Farben: 3 · 3 = 9.' : 'Oben 3 Farben, unten nur noch die 2 anderen: 3 · 2 = 6.'); }
    const c = r(2, 3);
    return zahlOpt(`📖 Beim Mittagessen kann ${n} zwischen ${a} Vorspeisen, ${b} Hauptspeisen und ${c} Nachspeisen wählen (je eine). Wie viele verschiedene Menüs gibt es?`, a * b * c,
      [a + b + c, a * b + c, a * b * c + a, a * b * c - 1], `Erst Vorspeise und Hauptspeise: ${a} · ${b} = ${a * b}. Dazu jeweils ${c} Nachspeisen: ${a * b} · ${c} = ${a * b * c}.`);
  };

  /* ---------------- Mathe, Zyklus 4 (Plan Seite 32) ---------------- */

  const z4WahrschText = () => prefix('📖', z4Wahrsch());
  const dezStellen = lvl => lvl <= 2 ? 10 : 1;   // Schrittweite in Hundertsteln: 10 = Zehntel, 1 = Hundertstel
  const z4Dezimal = lvl => {
    const typ = r(1, 3);
    if (typ === 1) {                                   // Vergleichen
      const t1 = r(2, 9), t2 = r(0, t1 - 1), d = r(1, 9);
      const gross10 = t1 * 10, klein = t2 * 10 + d;
      const [x, y] = Math.random() < .5 ? [gross10, klein] : [klein, gross10];
      return wahl(`Welche Zahl ist größer: ${dez(x)} oder ${dez(y)}?`, dez(gross10), [dez(klein), 'beide gleich groß'],
        'Vergleiche Stelle für Stelle: erst die Zehntel, dann die Hundertstel. Mehr Ziffern heißt nicht, dass die Zahl größer ist.');
    }
    if (typ === 2) {                                   // Rechnen
      const op = r(1, 4), s = dezStellen(lvl);
      const x = r(11, 99) * s, y = r(11, 99) * s;
      if (op === 1) return zT(`${dez(x)} + ${dez(y)} = ?`, dez(x + y), 'Komma unter Komma schreiben und wie ganze Zahlen addieren.');
      if (op === 2) { const [g, k] = x > y ? [x, y] : [y, x];
        return zT(`${dez(g)} − ${dez(k)} = ?`, dez(g - k), 'Komma unter Komma schreiben und wie ganze Zahlen subtrahieren.'); }
      if (op === 3) { const k = r(2, 9);
        return zT(`${dez(x)} · ${k} = ?`, dez(x * k), 'Rechne ohne Komma und setze es dann wieder: so viele Stellen hinter dem Komma wie vorher.'); }
      const k = r(2, 9), q = r(11, 99) * s;
      return zT(`${dez(q * k)} : ${k} = ?`, dez(q), `Probe: ${dez(q)} · ${k} = ${dez(q * k)}.`);
    }
    const E = [['1/2', '0,5'], ['1/4', '0,25'], ['3/4', '0,75'], ['1/5', '0,2'], ['1/10', '0,1'], ['3/10', '0,3'], ['2/5', '0,4'], ['3/5', '0,6']];
    const [b, d] = pick(E);
    if (Math.random() < .5)
      return wahl(`Welche Dezimalzahl ist gleich ${b}?`, d, shuffle(E.map(e => e[1]).filter(x => x !== d)).slice(0, 3), `Zähler durch Nenner teilen: ${b} = ${d}.`);
    return wahl(`Welcher Bruch ist gleich ${d}?`, b, shuffle(E.map(e => e[0]).filter(x => x !== b)).slice(0, 3), `${d} sind ${b}: Bruch und Dezimalzahl nennen dieselbe Größe.`);
  };
  const z4Aequivalenz = () => {
    const [k, n] = pick([[1, 2], [1, 3], [2, 3], [3, 4], [1, 4], [2, 5], [3, 5]]), m = r(2, 5);
    return wahl(`Welcher Bruch ist gleich ${k}/${n}?`, `${k * m}/${n * m}`,
      [`${k + m}/${n + m}`, `${k * m}/${n}`, `${k}/${n * m}`], `Erweitern: Zähler und Nenner mit derselben Zahl malnehmen (hier ${m}). Addieren verändert den Wert.`);
  };
  const z4Winkel = () => {
    const klasse = r(1, 4);
    const w = klasse === 1 ? r(10, 80) : klasse === 2 ? 90 : klasse === 3 ? r(100, 170) : 180;
    const loesung = klasse === 1 ? 'spitzer Winkel' : klasse === 2 ? 'rechter Winkel' : klasse === 3 ? 'stumpfer Winkel' : 'gestreckter Winkel';
    return wahl(`Wie heißt ein Winkel mit ${w}°?`, loesung,
      ['spitzer Winkel', 'rechter Winkel', 'stumpfer Winkel', 'gestreckter Winkel'].filter(x => x !== loesung),
      'Spitz: kleiner als 90°. Recht: genau 90°. Stumpf: zwischen 90° und 180°. Gestreckt: genau 180°.');
  };
  const z4Mittelwert = lvl => {
    const n = r(3, 5), m = r(3, 8 + lvl * 3);
    let w;
    for (let i = 0; i < 100; i++) {
      const dev = Array.from({ length: n - 1 }, () => r(-3, 3));
      const letzter = -dev.reduce((a, b) => a + b, 0);
      w = [...dev, letzter].map(x => m + x);
      if (w.every(x => x > 0)) break;
      w = null;
    }
    if (!w) w = Array(n).fill(m);
    return zT(`Wie groß ist der Mittelwert (Durchschnitt) dieser Zahlen?\n${w.join(', ')}`, m, `Alle Zahlen addieren (${w.reduce((a, b) => a + b, 0)}) und durch die Anzahl (${n}) teilen.`);
  };
  const z4Prozent = lvl => {
    const P = [[50, 2], [25, 4], [10, 10], [20, 5], [75, 4], [1, 100]], [p, s] = pick(lvl <= 2 ? P.slice(0, 3) : P);
    const g = s * r(1, 25);
    return zT(`Wie viel sind ${p} % von ${g}?`, g * p / 100, `${p} % bedeuten ${p} von 100 Teilen: ${g} · ${p} : 100.`);
  };
  const z4Umrechnen = () => {
    const typ = r(1, 6);
    if (typ === 1) { const x = r(1, 9) * 10 + r(1, 9); return zT(`${dez(x * 10)} kg = __ g`, x * 100, '1 kg hat 1000 g. Komma um drei Stellen nach rechts.'); }
    if (typ === 2) { const h = r(2, 5), m = pick([15, 30, 45]); return zT(`${h} h ${m} min = __ min`, h * 60 + m, `${h} h sind ${h * 60} min, dazu ${m} min.`); }
    if (typ === 3) { const e = r(1, 9) * 100 + r(1, 19) * 5; return zT(`${dez(e)} € = __ Cent`, e, '1 Euro hat 100 Cent.'); }
    if (typ === 4) { const l = pick([[1, '¾', 750], [1, '¼', 250], [1, '½', 500]]); return zT(`${l[1]} Liter = __ ml`, l[2], `1 Liter sind 1000 ml; ${l[1]} davon sind ${l[2]} ml.`); }
    if (typ === 5) { const km = r(1, 9) * 10 + r(1, 9); return zT(`${dez(km * 10)} km = __ m`, km * 100, '1 km hat 1000 m.'); }
    const q = pick([[1.5, 90], [2.25, 135], [3.5, 210], [0.75, 45]]);
    return zT(`${String(q[0]).replace('.', ',')} Stunden = __ Minuten`, q[1], `1 Stunde hat 60 Minuten: ${String(q[0]).replace('.', ',')} · 60.`);
  };
  const z4Flaeche = lvl => {
    const typ = r(1, 6), a = r(3, 8 + lvl * 3), b = r(3, 8 + lvl * 3);
    if (typ === 1) return zT(`Ein Rechteck ist ${a} cm lang und ${b} cm breit. Wie groß ist die Fläche (in cm²)?`, a * b, 'Fläche = Länge · Breite.');
    if (typ === 2) return zT(`Ein Quadrat hat die Seitenlänge ${a} cm. Wie groß ist die Fläche (in cm²)?`, a * a, 'Fläche = Seite · Seite.');
    if (typ === 3) { const g = 2 * r(2, 6 + lvl * 2), hh = r(2, 9);
      return zT(`Ein Dreieck hat die Grundseite ${g} cm und die Höhe ${hh} cm. Wie groß ist die Fläche (in cm²)?`, g * hh / 2, 'Fläche eines Dreiecks = Grundseite · Höhe : 2.'); }
    if (typ === 4) { const g = r(4, 12), hh = r(2, 9);
      return zT(`Ein Parallelogramm hat die Grundseite ${g} cm und die Höhe ${hh} cm. Wie groß ist die Fläche (in cm²)?`, g * hh, 'Fläche eines Parallelogramms = Grundseite · Höhe (nicht die schräge Seite).'); }
    if (typ === 5) { const s1 = r(3, 9), s2 = r(3, 9), s3 = r(3, 9);
      return zT(`Ein Dreieck hat die Seiten ${s1} cm, ${s2} cm und ${s3} cm. Wie groß ist der Umfang (in cm)?`, s1 + s2 + s3, 'Umfang = alle Seiten zusammen.'); }
    const s1 = r(4, 12), s2 = r(3, 9);
    return zT(`Ein Parallelogramm hat die Seiten ${s1} cm und ${s2} cm. Wie groß ist der Umfang (in cm)?`, 2 * (s1 + s2), 'Gegenüberliegende Seiten sind gleich lang: 2 · (a + b).');
  };
  const z4Volumen = lvl => {
    if (Math.random() < .35) { const a = r(2, lvl <= 2 ? 5 : 9);
      return zT(`Ein Würfel hat die Kantenlänge ${a} cm. Wie groß ist das Volumen (in cm³)?`, a * a * a, 'Volumen Würfel = Kante · Kante · Kante.'); }
    const a = r(2, 6 + lvl), b = r(2, 6 + lvl), c = r(2, 6 + lvl);
    return zT(`Ein Quader ist ${a} cm lang, ${b} cm breit und ${c} cm hoch. Wie groß ist das Volumen (in cm³)?`, a * b * c, 'Volumen Quader = Länge · Breite · Höhe.');
  };
  const z4Koordinaten = () => {
    const typ = r(1, 3);
    if (typ === 1) { const x = r(1, 9), y = r(1, 9);
      return wahl(`Der Punkt P hat die Koordinaten (${x}|${y}). Wie weit geht man vom Nullpunkt aus nach oben?`, String(y),
        [String(x), String(x + y), String(Math.abs(x - y) || x + 1)], 'Der erste Wert gibt an, wie weit nach rechts, der zweite, wie weit nach oben. Hier ist es der zweite.'); }
    if (typ === 2) { const x = r(1, 9), y = r(1, 9);
      const falsch = [`(${y}|${x})`, `(${x}|${x})`, `(${y}|${y})`];
      return wahl(`Welcher Punkt liegt ${x} Kästchen rechts und ${y} Kästchen oben vom Nullpunkt?`, `(${x}|${y})`, x === y ? [`(${x + 1}|${y})`, `(${x}|${y + 1})`, `(${x + 1}|${y + 1})`] : falsch,
        'Zuerst nach rechts (x), dann nach oben (y): (x|y).'); }
    const x1 = r(1, 4), x2 = r(6, 9), y1 = r(1, 4), y2 = r(6, 9);
    return wahl(`Ein Rechteck hat die Ecken (${x1}|${y1}), (${x2}|${y1}) und (${x2}|${y2}). Wie lauten die Koordinaten der vierten Ecke?`, `(${x1}|${y2})`,
      [`(${x2}|${y1})`, `(${y2}|${x1})`, `(${x1}|${y1})`], 'Beim Rechteck liegen gegenüberliegende Ecken so, dass je zwei dieselbe x- und dieselbe y-Zahl teilen: die fehlende Ecke hat x = ' + x1 + ' und y = ' + y2 + '.');
  };
  const z4Wahrsch = () => {
    for (let i = 0; i < 100; i++) {
      const rot = r(1, 7), blau = r(1, 6), grun = r(0, 4), ges = rot + blau + grun;
      if (ges < 4 || ggT(rot, ges) !== 1) continue;
      const farben = `${rot} rote, ${blau} blaue${grun ? ` und ${grun} grüne` : ''}`;
      return wahl(`In einem Beutel liegen diese Kugeln: ${farben}. Du ziehst ohne Hinschauen eine Kugel. Wie groß ist die Wahrscheinlichkeit für „rot“ (als Bruch)?`, `${rot}/${ges}`,
        [`${ges - rot}/${ges}`, `${rot}/${ges - rot}`, `${ges}/${rot}`],
        `Wahrscheinlichkeit = günstige Fälle (${rot} rote) durch alle Fälle (${ges} Kugeln).`);
    }
    return wahl('In einem Beutel liegen diese Kugeln: 3 rote, 2 blaue. Wie groß ist die Wahrscheinlichkeit für „rot“ (als Bruch)?', '3/5', ['2/5', '3/2', '5/3'],
      'Wahrscheinlichkeit = günstige Fälle (3 rote) durch alle Fälle (5 Kugeln).');
  };
  const z4Text = lvl => {
    const typ = r(1, 4), n = name();
    if (typ === 1) {
      const h = pick([120, 150, 180, 200, 250]), s = pick([60, 80, 90, 120]), k = r(2, 5), m = r(2, 6);
      const summe = k * h + m * s;
      if (summe >= 2000) return z4Text(lvl);
      return zT(`📖 Ein Heft kostet ${dez(h)} €, ein Stift ${dez(s)} €. ${n} kauft ${k} Hefte und ${m} Stifte und bezahlt mit einem 20-€-Schein. Wie viel Rückgeld bekommt ${n} (in €)?`,
        dez(2000 - summe), `Vier Schritte: ${k} · ${dez(h)} €, ${m} · ${dez(s)} €, beides addieren (${dez(summe)} €), von 20 € abziehen.`);
    }
    if (typ === 2) { const kinder = r(18, 26), p = r(3, 9), bus = r(40, 90);
      const einnahmen = kinder * p;
      if (einnahmen <= bus) return z4Text(lvl);
      return zT(`📖 ${kinder} Kinder zahlen für einen Ausflug je ${p} €. Die Busfahrt kostet ${bus} €. Wie viel Geld bleibt in der Klassenkasse übrig (in €)?`,
        einnahmen - bus, `Erst die Einnahmen: ${kinder} · ${p} = ${einnahmen} €. Dann die Busfahrt abziehen.`); }
    if (typ === 3) {
      const start = r(8, 16) * 60 + pick([0, 15, 30, 45]), dauer = r(1, 2) * 60 + pick([15, 30, 45]), weg = pick([10, 15, 20]);
      const ende = start + dauer + weg, f = x => `${String(Math.floor(x / 60)).padStart(2, '0')}:${String(x % 60).padStart(2, '0')} Uhr`;
      const loesung = f(ende);
      return wahl(`📖 Ein Film beginnt um ${f(start)} und dauert ${Math.floor(dauer / 60)} h ${dauer % 60} min. Danach braucht ${n} noch ${weg} Minuten nach Hause. Um wie viel Uhr ist ${n} zu Hause?`, loesung,
        [f(ende + 60), f(ende - 15), f(ende + 30)].filter(x => x !== loesung), 'Erst die Stunden und Minuten des Films addieren, dann den Heimweg dazurechnen. Achtung: 60 Minuten sind eine Stunde.'); }
    const k = r(2, 5), g = pick([250, 400, 500, 750, 1200]);
    const gesamt = k * g + 400;
    return zT(`📖 Ein Paket wiegt ${dez(g / 10)} kg. ${n} stellt ${k} gleiche Pakete in einen Karton, der leer ${dez(40)} kg wiegt. Wie viel wiegt der volle Karton (in kg)?`,
      dez(gesamt / 10), `Erst die Pakete: ${k} · ${dez(g / 10)} kg. Dann das Gewicht des Kartons addieren.`);
  };
  const z4Lueck = () => { const x = r(11, 99) * 10, y = r(11, 99) * 10;
    return zT(`__ + ${dez(y)} = ${dez(x + y)}`, dez(x), `Umkehren: ${dez(x + y)} − ${dez(y)} = ${dez(x)}.`); };

  /* ---- Zyklus 4, weitere Aufgabentypen (Plan Seite 32): Zahlengerade, Brüche addieren, Algorithmen, Maßstab,
         Verschieben/Spiegeln, Häufigkeit und Prozent, cm³ und Liter, zusammengesetzte Flächen ---- */
  const FR = [[1, 2], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [1, 10], [3, 10], [7, 10], [9, 10]];
  const z4Zahlengerade = lvl => {
    const typ = pick(lvl <= 2 ? [1, 2, 4] : [1, 2, 3, 4]);
    if (typ === 1) {
      const u = lvl <= 2 ? 10 : 1, a = lvl <= 2 ? r(0, 7) * 10 : r(10, 80), d = 2 * u * r(1, lvl <= 2 ? 1 : 5) * (lvl <= 2 ? 1 : 1), mid = a + d / 2;
      return opt3(`Welche Zahl liegt genau in der Mitte zwischen ${dez(a)} und ${dez(a + d)}?`, dez(mid), [dez(mid + u), dez(mid - u), dez(mid + 2 * u), dez(a + d + u)],
        `Die Mitte ist der Mittelwert: (${dez(a)} + ${dez(a + d)}) : 2 = ${dez(mid)}. Du kannst auch den Abstand halbieren: ${dez(d)} : 2 = ${dez(d / 2)}.`);
    }
    if (typ === 2) {
      if (lvl <= 2) { const p = r(1, 8) * 10;
        return opt3(`Welche Zahl liegt zwischen ${dez(p)} und ${dez(p + 10)}?`, dez(p + 5), [dez(p - 5), dez(p + 15), dez(p + 20), dez(p - 15)],
          `Zwischen ${dez(p)} und ${dez(p + 10)} liegen die Hundertstel, zum Beispiel ${dez(p + 5)}.`); }
      const p = r(10, 80);
      return opt3(`Welche Zahl liegt zwischen ${dez(p)} und ${dez(p + 2)}?`, dez(p + 1), [dez(p - 1), dez(p + 3), dez(p + 4), dez(p - 2)],
        `Von ${dez(p)} aus ein Hundertstel weiter: ${dez(p + 1)}. Das ist größer als ${dez(p)} und kleiner als ${dez(p + 2)}.`);
    }
    if (typ === 3) {
      const [k, n] = pick(FR), fh = 100 * k / n;
      let dh = fh + pick([-20, -10, -5, 5, 10, 20]); if (dh <= 0 || dh === fh) dh = fh + 10;
      const bruch = `${k}/${n}`, dz = dez(dh), loes = fh > dh ? bruch : dz;
      return wahl(`Welche Zahl ist größer: ${bruch} oder ${dz}?`, loes, [fh > dh ? dz : bruch, 'beide gleich groß'],
        `${bruch} = ${dez(fh)} (Zähler durch Nenner). Vergleiche ${dez(fh)} und ${dz} Stelle für Stelle.`);
    }
    const R = pick([1, 2]), P = pick(R === 1 ? [4, 5, 10] : [4, 5, 8, 10]), k = r(1, P - 1);
    return zT(`Eine Zahlengerade von 0 bis ${R} ist in ${P} gleich große Abschnitte geteilt. Welche Zahl steht beim ${k}. Strich? (Der Anfang bei 0 ist der Strich Nummer 0.)`,
      dez(k * R * 100 / P), `Ein Abschnitt ist ${R} : ${P} = ${dez(R * 100 / P)} lang. Beim ${k}. Strich: ${k} · ${dez(R * 100 / P)} = ${dez(k * R * 100 / P)}.`);
  };
  const z4Brueche = lvl => {
    const typ = pick(lvl <= 2 ? [1, 2] : [1, 2, 3, 4]);
    if (typ <= 2) {
      const n = r(4, lvl <= 2 ? 8 : 12), plus = typ === 1;
      if (plus) { const a = r(1, n - 2), b = r(1, n - 1 - a);
        return opt3(`${a}/${n} + ${b}/${n} = ?`, `${a + b}/${n}`, [`${a + b}/${2 * n}`, `${a + b + 1}/${n}`, `${Math.max(1, a + b - 1)}/${n}`, `${a * b}/${n}`],
          `Gleiche Nenner: nur die Zähler addieren (${a} + ${b} = ${a + b}), der Nenner bleibt ${n}. Man darf noch kürzen, wenn es geht.`); }
      const a = r(3, n - 1), b = r(1, a - 1);
      return opt3(`${a}/${n} − ${b}/${n} = ?`, `${a - b}/${n}`, [`${a - b}/${2 * n}`, `${a - b + 1}/${n}`, `${a - b}/${n - 1}`, `${a + b}/${n}`],
        `Gleiche Nenner: nur die Zähler subtrahieren (${a} − ${b} = ${a - b}), der Nenner bleibt ${n}.`);
    }
    if (typ === 3) {
      const n = r(2, 5), kmax = 2 * n - 3, k = r(1, kmax), num = 2 + k;
      return opt3(`1/${n} + ${k}/${2 * n} = ?`, `${num}/${2 * n}`, [`${1 + k}/${3 * n}`, `${1 + k}/${2 * n}`, `${num}/${n}`, `${num + 1}/${2 * n}`],
        `Erst gleichnamig machen: 1/${n} = 2/${2 * n}. Dann addieren: 2/${2 * n} + ${k}/${2 * n} = ${num}/${2 * n}.`);
    }
    const [k, n] = pick(FR), fh = 100 * k / n, dh = r(1, 9) * 5 + (Math.random() < .5 ? 0 : 10);
    if (Math.random() < .5) return zT(`${k}/${n} + ${dez(dh)} = ? (als Dezimalzahl)`, dez(fh + dh), `${k}/${n} = ${dez(fh)}. Dann ${dez(fh)} + ${dez(dh)} = ${dez(fh + dh)}.`);
    const gr = fh + dh;
    return zT(`${dez(gr)} − ${k}/${n} = ? (als Dezimalzahl)`, dez(dh), `${k}/${n} = ${dez(fh)}. Dann ${dez(gr)} − ${dez(fh)} = ${dez(dh)}.`);
  };
  const z4Algorithmus = lvl => {
    const typ = pick(lvl <= 2 ? [1, 2] : [1, 2, 3, 4]);
    if (typ === 1) { const t = r(3, 5 + lvl), a = r(2, 9), s0 = r(1, 20);
      return zT(`Ein Programm startet mit x = ${s0}. Es wiederholt ${t}-mal: „x wird um ${a} größer“. Wie groß ist x am Ende?`, s0 + t * a, `${t} Wiederholungen mit je +${a}: ${s0} + ${t} · ${a} = ${s0 + t * a}.`); }
    if (typ === 2) { const t = r(3, 5), a = r(1, 4), s0 = r(1, 20); let x = s0;
      for (let i = 0; i < t; i++) x = x % 2 === 0 ? x / 2 : x + a;
      return zT(`Ein Programm startet mit x = ${s0}. Es wiederholt ${t}-mal: „Wenn x gerade ist, wird x halbiert. Sonst wird x um ${a} größer.“ Wie groß ist x am Ende?`, x,
        `Rechne Schritt für Schritt und prüfe jedes Mal die Bedingung (gerade oder ungerade), bis alle ${t} Wiederholungen durch sind.`); }
    if (typ === 3) { const s0 = pick([1, 2, 3]), k = pick([2, 3]), g = pick([20, 50, 100]); let x = s0;
      while (x < g) x *= k;
      return zT(`Ein Programm startet mit x = ${s0}. „Solange x kleiner als ${g} ist: x wird mit ${k} malgenommen.“ Wie groß ist x am Ende?`, x,
        `Rechne weiter, solange x noch kleiner als ${g} ist. Sobald x mindestens ${g} ist, hört das Programm auf.`); }
    const t = r(4, 8), a = r(1, 5), b = r(2, 9); let x = 0;
    for (let i = 1; i <= t; i++) x += i % 2 === 0 ? a : b;
    return zT(`Ein Programm startet mit x = 0. Für jede Zahl i von 1 bis ${t} gilt: „Ist i gerade, wird x um ${a} größer. Sonst wird x um ${b} größer.“ Wie groß ist x am Ende?`, x,
      `Unter den Zahlen von 1 bis ${t} sind ${Math.floor(t / 2)} gerade und ${Math.ceil(t / 2)} ungerade: ${Math.floor(t / 2)} · ${a} + ${Math.ceil(t / 2)} · ${b} = ${x}.`);
  };
  const z4Massstab = lvl => {
    const n = name(), typ = r(1, lvl <= 2 ? 2 : 3);
    if (typ === 1) {
      const [sc, einheit, cmPro] = pick([[10, 'cm', 1], [50, 'cm', 1], [100, 'm', 100], [200, 'm', 100], [1000, 'm', 100], [50000, 'km', 100000], [100000, 'km', 100000]]);
      let len = r(2, 12); while ((len * sc) % cmPro !== 0) len++;
      return zT(`📖 ${n} misst auf einer Zeichnung oder Karte im Maßstab 1 : ${gross(sc)} eine Strecke von ${len} cm. Wie lang ist die Strecke in Wirklichkeit (in ${einheit})?`, len * sc / cmPro,
        `Maßstab 1 : ${gross(sc)} heißt: 1 cm auf dem Plan sind ${gross(sc)} cm in Wirklichkeit. ${len} · ${gross(sc)} = ${gross(len * sc)} cm${einheit === 'cm' ? '' : ` = ${gross(len * sc / cmPro)} ${einheit}`}.`);
    }
    if (typ === 2) { const sc = pick([20, 50, 100]), m = r(2, 9);
      return zT(`📖 ${n} zeichnet ein Zimmer, das in Wirklichkeit ${m} m lang ist, im Maßstab 1 : ${sc}. Wie lang ist die Zeichnung (in cm)?`, m * 100 / sc,
        `${m} m sind ${m * 100} cm. Im Maßstab 1 : ${sc} wird durch ${sc} geteilt: ${m * 100} : ${sc} = ${m * 100 / sc}.`); }
    const a = r(1, 3), b = r(a + 1, 5), t = r(2, 6);
    return zT(`📖 ${n} mischt Saft und Wasser im Verhältnis ${a} : ${b}. Es sind ${a * t} Gläser Saft. Wie viele Gläser Wasser gehören dazu?`, b * t,
      `${a * t} Gläser Saft sind ${t}-mal so viel wie ${a}. Dann braucht man auch ${t}-mal so viel Wasser: ${b} · ${t} = ${b * t}.`);
  };
  const z4Verschieben = lvl => {
    const typ = r(1, lvl <= 2 ? 2 : 4), x = r(1, 6), y = r(1, 6), P = (a, b) => `(${a}|${b})`;
    if (typ === 1) { const dx = r(1, 5), dy = r(1, 5);
      return opt3(`Der Punkt A liegt bei ${P(x, y)}. Er wird um ${dx} Kästchen nach rechts und ${dy} Kästchen nach oben verschoben. Wo liegt er danach?`, P(x + dx, y + dy),
        [P(y + dy, x + dx), P(x + dx, y), P(x, y + dy), P(x + dy, y + dx)], 'Nach rechts verändert nur die erste Zahl (x), nach oben nur die zweite (y).'); }
    if (typ === 2) { const a = x + r(1, 4);
      return opt3(`Der Punkt A liegt bei ${P(x, y)}. Er wird an der senkrechten Geraden x = ${a} gespiegelt. Wo liegt das Spiegelbild?`, P(2 * a - x, y),
        [P(a, y), P(a + x, y), P(x, y + (a - x)), P(2 * a - x + 1, y)], `Der Punkt ist ${a - x} Kästchen von der Geraden entfernt. Das Spiegelbild liegt ${a - x} Kästchen auf der anderen Seite, die Höhe y bleibt gleich: x = ${a} + ${a - x} = ${2 * a - x}.`); }
    if (typ === 3) { const b = r(2, 5), c = r(0, b), h = r(2, 4), dx = r(1, 5), dy = r(1, 5);
      return opt3(`Ein Dreieck hat die Ecken A${P(x, y)}, B${P(x + b, y)} und C${P(x + c, y + h)}. Es wird um ${dx} Kästchen nach rechts und ${dy} Kästchen nach oben verschoben. Wie lauten die Koordinaten von C′?`,
        P(x + c + dx, y + h + dy), [P(x + b + dx, y + dy), P(x + dx, y + dy), P(x + c + dx, y + h), P(x + c, y + h + dy)],
        `Jede Ecke wird gleich verschoben: C ${P(x + c, y + h)} ergibt x = ${x + c} + ${dx} und y = ${y + h} + ${dy}.`); }
    const dx = r(1, 6), dy = r(1, 6), nach = Math.random() < .5;
    return zT(`Der Punkt A liegt bei ${P(x, y)}. Nach einer Verschiebung liegt er bei A′${P(x + dx, y + dy)}. Um wie viele Kästchen wurde er ${nach ? 'nach rechts' : 'nach oben'} verschoben?`, nach ? dx : dy,
      nach ? `Die erste Zahl ist von ${x} auf ${x + dx} gewachsen: ${dx} Kästchen nach rechts.` : `Die zweite Zahl ist von ${y} auf ${y + dy} gewachsen: ${dy} Kästchen nach oben.`);
  };
  const z4Raum = lvl => {
    const typ = pick(lvl <= 2 ? [1, 2, 4, 6] : [1, 2, 3, 4, 5, 6, 7]), n = r(2, 9);
    if (typ === 1) return zT(`${n} l = __ cm³`, n * 1000, '1 Liter ist genauso viel wie 1000 cm³ (ein Würfel mit 10 cm Kantenlänge).');
    if (typ === 2) return zT(`${gross(n * 1000)} cm³ = __ l`, n, '1000 cm³ sind 1 Liter. Darum durch 1000 teilen.');
    if (typ === 3) {
      let d = [40, 25, 20];
      for (let i = 0; i < 200; i++) { const c = [pick([2, 4, 5, 10, 20, 25, 40, 50]), pick([2, 4, 5, 10, 20, 25, 40, 50]), pick([2, 4, 5, 10, 20, 25, 40, 50])];
        if (c[0] * c[1] * c[2] % 1000 === 0 && c[0] * c[1] * c[2] <= 100000) { d = c; break; } }
      const v = d[0] * d[1] * d[2];
      return zT(`Ein Aquarium ist ${d[0]} cm lang, ${d[1]} cm breit und ${d[2]} cm hoch. Wie viele Liter Wasser passen hinein, wenn es bis zum Rand voll ist?`, v / 1000,
        `Volumen = ${d[0]} · ${d[1]} · ${d[2]} = ${gross(v)} cm³. 1000 cm³ sind 1 Liter: ${gross(v)} : 1000 = ${v / 1000}.`); }
    if (typ === 4) { const a = r(3, 9), b = r(3, 9), c = r(2, 6), d = r(2, 6);
      return zT(`Ein Teppich besteht aus zwei Rechtecken, die sich nicht überlappen: ${a} cm × ${b} cm und ${c} cm × ${d} cm. Wie groß ist seine Fläche (in cm²)?`, a * b + c * d,
        `Beide Flächen einzeln rechnen und addieren: ${a} · ${b} + ${c} · ${d} = ${a * b} + ${c * d}.`); }
    if (typ === 5) { const c = r(2, 4), a = r(c + 2, 10), b = r(c + 2, 10);
      return zT(`Ein Rechteck ist ${a} cm lang und ${b} cm breit. Aus einer Ecke wird ein Quadrat mit ${c} cm Seitenlänge herausgeschnitten. Wie groß ist die Fläche der übrigen Figur (in cm²)?`, a * b - c * c,
        `Ganzes Rechteck minus Ausschnitt: ${a} · ${b} − ${c} · ${c} = ${a * b} − ${c * c}.`); }
    if (typ === 6) { const a = r(2, 9);
      return zT(`Ein Würfel hat die Kantenlänge ${a} cm. Wie groß ist seine Oberfläche (in cm²)?`, 6 * a * a, `Ein Würfel hat 6 gleich große Quadrate als Flächen: 6 · ${a} · ${a} = ${6 * a * a}.`); }
    const a = r(2, 6), b = r(2, 6), c = r(2, 6);
    return zT(`Ein Quader ist ${a} cm lang, ${b} cm breit und ${c} cm hoch. Wie groß ist seine Oberfläche (in cm²)?`, 2 * (a * b + b * c + a * c),
      `Drei Paare gleicher Rechtecke: 2 · (${a} · ${b} + ${b} · ${c} + ${a} · ${c}) = 2 · ${a * b + b * c + a * c}.`);
  };
  const z4Chart = lvl => {
    const typ = r(1, 3);
    if (typ === 3) { const p = [r(2, 6) * 5, r(2, 5) * 5, r(1, 4) * 5], rest = 100 - p[0] - p[1] - p[2];
      return zT(`Ein Kreisdiagramm zeigt die Lieblingsfrüchte: Äpfel ${p[0]} %, Bananen ${p[1]} %, Birnen ${p[2]} %, der Rest sind Erdbeeren. Wie viel Prozent sind Erdbeeren?`, rest,
        `Das ganze Diagramm sind 100 %: 100 − ${p[0]} − ${p[1]} − ${p[2]} = ${rest}.`); }
    const T = pick(lvl <= 2 ? [10, 20] : [10, 20, 25]), schnitt = shuffle(Array.from({ length: T - 1 }, (_, i) => i + 1)).slice(0, 3).sort((a, b) => a - b);
    const c = [schnitt[0], schnitt[1] - schnitt[0], schnitt[2] - schnitt[1], T - schnitt[2]];
    const [thema, kat] = pick([['Haustiere', ['Hunde', 'Katzen', 'Fische', 'Hasen']], ['Lieblingsfach', ['Mathe', 'Sport', 'Kunst', 'Musik']], ['Lieblingsfarbe', ['rot', 'blau', 'grün', 'gelb']]]);
    const i = r(0, 3), h = c[i] * 100 / T;
    const kopf = `Säulendiagramm „${thema}“ – ein Kästchen steht für 1 Kind, insgesamt ${T} Kinder:\n${kat.map((k, j) => `${k}: ${'█'.repeat(c[j])}`).join('\n')}\n\n`;
    if (typ === 1) return zT(kopf + `Wie viel Prozent der Kinder haben „${kat[i]}“ gewählt?`, h, `${c[i]} von ${T} Kindern: ${c[i]} : ${T} = ${dez(h)}, das sind ${h} von 100, also ${h} %.`);
    return zT(kopf + `Wie groß ist der Anteil von „${kat[i]}“ als Dezimalzahl?`, dez(h), `${c[i]} von ${T}: ${c[i]} : ${T} = ${dez(h)}.`);
  };
  const z4HText = () => {
    const T = pick([4, 5, 10, 20, 25, 50]), c = r(1, T - 1), n = name(), w = pick([['eine Münze', 'Kopf', 'Kopf'], ['einen Würfel', 'die 6', 'die 6']]);
    const h = c * 100 / T;
    if (Math.random() < .5) return zT(`📖 ${n} wirft ${T}-mal ${w[0]}. ${c}-mal kommt ${w[1]}. Wie groß ist die relative Häufigkeit für ${w[2]} in Prozent?`, h,
      `Relative Häufigkeit = ${c} von ${T} = ${c} : ${T} = ${dez(h)}, das sind ${h} %.`);
    return zT(`📖 ${n} wirft ${T}-mal ${w[0]}. ${c}-mal kommt ${w[1]}. Wie viel Prozent der Würfe waren NICHT ${w[2]}?`, 100 - h,
      `${T - c} von ${T} Würfen waren anders: ${T - c} : ${T} = ${dez(100 - h)}, das sind ${100 - h} %. Oder: 100 % − ${h} %.`);
  };

  /* Gesamtauswahl pro Weg: eine Aufgabe aus den passenden Bausteinen ziehen. */
  const aus = (...fns) => lvl => pick(fns)(lvl);

  return {
    lu_mathe_z2: {
      knobeln: lvl => prefix('🧠', aus(z2Zehner, z2VorNach, z2Plus, z2Minus, z2Mal, z2Uhr, z2Kalender, z2Luecke, z2Muster, z2Einheit)(lvl)),
      erzaehlen: lvl => aus(z2Erz.plus, z2Erz.minus, z2Erz.mal, z2Erz.tag, z2Erz.kommutativ, z2Groessen, z2Weg)(lvl),
      bauen: lvl => prefix('🧱', aus(z2Zehnerstangen, z2Formen, z2Wahrsch, () => diagramm(lvl <= 2 ? 6 : 9), z2Symmetrie, z2Strichliste)(lvl))
    },
    lu_mathe_z3: {
      knobeln: lvl => prefix('🧠', aus(z3Zahlen, z3Rechnen, z3Einmaleins, z3Luecke, z3Einheit, z3Umrechnen, z3Flaeche, z3Masse)(lvl)),
      erzaehlen: lvl => aus(z3Text, z3ErzEinheit, z3BruecheText, z3Kombi)(lvl),
      bauen: lvl => prefix('🧱', aus(z3Brueche, z3Pizza, z3Rechteck, z3Koerper, z3Fliesen, z3Tabelle, z3Saeulen, z3Skala, z3Symmetrie, z3Roboter)(lvl))
    },
    lu_mathe_z4: {
      knobeln: lvl => prefix('🧠', aus(z4Dezimal, z4Aequivalenz, z4Mittelwert, z4Prozent, z4Umrechnen, z4Lueck, z4Zahlengerade, z4Brueche, z4Algorithmus)(lvl)),
      erzaehlen: lvl => aus(z4Text, z4WahrschText, z4Massstab, z4HText)(lvl),
      bauen: lvl => prefix('🧱', aus(z4Flaeche, z4Volumen, z4Koordinaten, z4Winkel, z4Wahrsch, z4Verschieben, z4Raum, z4Chart)(lvl))
    },
    lu_deutsch_z2: { knobeln: fest(D2_KNOBELN, '🧠'), erzaehlen: fest(D2_ERZAEHLEN, '📖') },
    lu_deutsch_z3: { knobeln: fest(D3_KNOBELN, '🧠'), erzaehlen: fest(D3_ERZAEHLEN, '📖') },
    lu_deutsch_z4: { knobeln: fest(D4_KNOBELN, '🧠'), erzaehlen: fest(D4_ERZAEHLEN, '📖') },
    lu_franzoesisch_z2: { knobeln: fest(F2_KNOBELN, '🧠'), erzaehlen: fest(F2_ERZAEHLEN, '📖') },
    lu_franzoesisch_z3: { knobeln: fest(F3_KNOBELN, '🧠'), erzaehlen: fest(F3_ERZAEHLEN, '📖') },
    lu_franzoesisch_z4: { knobeln: fest(F4_KNOBELN, '🧠'), erzaehlen: fest(F4_ERZAEHLEN, '📖') },
    lu_sach_z2: { knobeln: fest(S2_KNOBELN, '🧠'), erzaehlen: fest(S2_ERZAEHLEN, '📖'), entdecken: fest(S2_ENTDECKEN, '🔎') },
    lu_sach_z3: { knobeln: fest(S3_KNOBELN, '🧠'), erzaehlen: fest(S3_ERZAEHLEN, '📖'), entdecken: fest(S3_ENTDECKEN, '🔎') },
    lu_sach_z4: { knobeln: fest(S4_KNOBELN, '🧠'), erzaehlen: fest(S4_ERZAEHLEN, '📖'), entdecken: fest(S4_ENTDECKEN, '🔎') }
  };
}

/* Anzahl fester Fragen je Ziel (für Prüfung/Bericht). */
export const LU_FESTE_FRAGEN = {
  lu_deutsch_z2: [...D2_KNOBELN, ...D2_ERZAEHLEN],
  lu_deutsch_z3: [...D3_KNOBELN, ...D3_ERZAEHLEN],
  lu_deutsch_z4: [...D4_KNOBELN, ...D4_ERZAEHLEN],
  lu_franzoesisch_z2: [...F2_KNOBELN, ...F2_ERZAEHLEN],
  lu_franzoesisch_z3: [...F3_KNOBELN, ...F3_ERZAEHLEN],
  lu_franzoesisch_z4: [...F4_KNOBELN, ...F4_ERZAEHLEN],
  lu_sach_z2: [...S2_KNOBELN, ...S2_ERZAEHLEN, ...S2_ENTDECKEN],
  lu_sach_z3: [...S3_KNOBELN, ...S3_ERZAEHLEN, ...S3_ENTDECKEN],
  lu_sach_z4: [...S4_KNOBELN, ...S4_ERZAEHLEN, ...S4_ENTDECKEN]
};
