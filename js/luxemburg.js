/* Lernziele nach dem luxemburgischen Lehrplan (École fondamentale, Plan d'études 2026).

   QUELLE: docs/plan-detudes-enseignement-fondamental-2026.pdf
           (© MENJE/SCRIPT, Luxemburg) – liegt im Repo.

   ZUSCHNITT: Pro Fach und Zyklus ein Lernziel.
     Zyklus 2 = Klasse 1–2, Zyklus 3 = Klasse 3–4, Zyklus 4 = Klasse 5–6.
     Ziele: lu_mathe_z2/z3/z4, lu_deutsch_z2/z3/z4, lu_franzoesisch_z2/z3/z4.

   WAS IST WOHER – bitte beim Prüfen beachten:
     * MATHE: DIREKT aus dem Plan d'études 2026 (Druckseite 30 = Zyklus 2,
       Seite 31 = Zyklus 3, Seite 32 = Zyklus 4, jeweils „Mathématiques“,
       Niveau socle und niveau avancé). Die Aufgaben werden berechnet, nie
       abgeschrieben; Unterrichtssprache Mathe in Luxemburg ist Deutsch.
     * DEUTSCH und FRANZÖSISCH: ABGELEITET. Der Plan nennt dafür nur
       Kompetenzen (Druckseite 20–27), keine Themenlisten. Die Fragen sind
       eine Auslegung dieser Kompetenzen und müssen von einer Fachperson
       (Lehrkraft) geprüft werden, bevor sie als „lehrplangetreu“ gelten.
       Zyklus 2 Französisch ist laut Plan nur mündlich/Alltag (Seite 22);
       die Fragen hier sind trotzdem Lesefragen mit kurzen Wörtern, weil die
       App nichts anderes kann – das ist eine Vereinfachung.

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

/* ======================== FESTE FRAGEN: Mathe (Zyklus 3) ======================== */

/* Einheit wählen (Plan Z3: g, kg, t; mm, cm, m, km; s, min, h; €, Cent) */
const Z3_EINHEIT = [
  ['Welche Einheit passt zur Länge eines Bleistifts?','cm',['mm','m','km'],'Ein Bleistift ist etwa 15 bis 20 Zentimeter lang.'],
  ['Welche Einheit passt zur Entfernung zwischen zwei Städten?','km',['mm','cm','kg'],'Städte liegen viele Kilometer auseinander; Meter wären schon sehr kleinteilig.'],
  ['Welche Einheit passt zum Gewicht eines Schulkindes?','kg',['g','mm','min'],'Ein Kind wiegt etwa 25 bis 40 Kilogramm.'],
  ['Welche Einheit passt zum Gewicht einer Tafel Schokolade?','g',['kg','cm','h'],'Eine Tafel Schokolade wiegt etwa 100 Gramm. Kilogramm wäre viel zu groß.'],
  ['Welche Einheit passt zur Dauer eines Kinofilms?','h',['s','mm','g'],'Ein Film dauert etwa ein bis zwei Stunden.'],
  ['Welche Einheit passt zur Dicke einer Münze?','mm',['m','km','kg'],'Eine Münze ist nur ein paar Millimeter dick.'],
  ['Welche Einheit passt zur Länge eines Klassenzimmers?','m',['mm','km','g'],'Ein Klassenzimmer ist etwa 8 Meter lang. Zentimeter wären eine sehr große Zahl.']
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

/* ======================== GENERATOREN ======================== */

export function luGen(h) {
  const { r, pick, shuffle, wahl, zahlText: zT, zahlChoice: zC } = h;
  const name = () => pick(NAMEN);
  const lvlWahl = (lvl, a, b, c, d, e) => [0, a, b, c, d, e][lvl] ?? c;

  /* Emoji des Weges vor die Frage setzen (wie bei den übrigen Zielen). */
  const prefix = (emoji, a) => ({ ...a, frage: emoji + ' ' + a.frage });

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

  /* Gesamtauswahl pro Weg: eine Aufgabe aus den passenden Bausteinen ziehen. */
  const aus = (...fns) => lvl => pick(fns)(lvl);

  return {
    lu_mathe_z2: {
      knobeln: lvl => prefix('🧠', aus(z2Zehner, z2VorNach, z2Plus, z2Minus, z2Mal, z2Uhr, z2Kalender, z2Luecke)(lvl)),
      erzaehlen: lvl => aus(z2Erz.plus, z2Erz.minus, z2Erz.mal, z2Erz.tag, z2Erz.kommutativ)(lvl),
      bauen: lvl => prefix('🧱', aus(z2Zehnerstangen, z2Formen, z2Wahrsch, () => diagramm(lvl <= 2 ? 6 : 9))(lvl))
    },
    lu_mathe_z3: {
      knobeln: lvl => prefix('🧠', aus(z3Zahlen, z3Rechnen, z3Einmaleins, z3Luecke, z3Einheit, z3Umrechnen)(lvl)),
      erzaehlen: lvl => aus(z3Text, z3ErzEinheit, z3BruecheText)(lvl),
      bauen: lvl => prefix('🧱', aus(z3Brueche, z3Pizza, z3Rechteck, z3Koerper, z3Fliesen, z3Tabelle)(lvl))
    },
    lu_mathe_z4: {
      knobeln: lvl => prefix('🧠', aus(z4Dezimal, z4Aequivalenz, z4Mittelwert, z4Prozent, z4Umrechnen, z4Lueck)(lvl)),
      erzaehlen: lvl => aus(z4Text, z4WahrschText)(lvl),
      bauen: lvl => prefix('🧱', aus(z4Flaeche, z4Volumen, z4Koordinaten, z4Winkel, z4Wahrsch)(lvl))
    },
    lu_deutsch_z2: { knobeln: fest(D2_KNOBELN, '🧠'), erzaehlen: fest(D2_ERZAEHLEN, '📖') },
    lu_deutsch_z3: { knobeln: fest(D3_KNOBELN, '🧠'), erzaehlen: fest(D3_ERZAEHLEN, '📖') },
    lu_deutsch_z4: { knobeln: fest(D4_KNOBELN, '🧠'), erzaehlen: fest(D4_ERZAEHLEN, '📖') },
    lu_franzoesisch_z2: { knobeln: fest(F2_KNOBELN, '🧠'), erzaehlen: fest(F2_ERZAEHLEN, '📖') },
    lu_franzoesisch_z3: { knobeln: fest(F3_KNOBELN, '🧠'), erzaehlen: fest(F3_ERZAEHLEN, '📖') },
    lu_franzoesisch_z4: { knobeln: fest(F4_KNOBELN, '🧠'), erzaehlen: fest(F4_ERZAEHLEN, '📖') }
  };
}

/* Anzahl fester Fragen je Ziel (für Prüfung/Bericht). */
export const LU_FESTE_FRAGEN = {
  lu_deutsch_z2: [...D2_KNOBELN, ...D2_ERZAEHLEN],
  lu_deutsch_z3: [...D3_KNOBELN, ...D3_ERZAEHLEN],
  lu_deutsch_z4: [...D4_KNOBELN, ...D4_ERZAEHLEN],
  lu_franzoesisch_z2: [...F2_KNOBELN, ...F2_ERZAEHLEN],
  lu_franzoesisch_z3: [...F3_KNOBELN, ...F3_ERZAEHLEN],
  lu_franzoesisch_z4: [...F4_KNOBELN, ...F4_ERZAEHLEN]
};
