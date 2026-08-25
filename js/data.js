/* Stammdaten: Talente, Lernwege, Talent-Test, Lernziele.
   Grundgedanke: Ein Lernziel (Kompetenz) – viele Wege dorthin.
   Der Weg wird nach dem Talent des Kindes gewaehlt, das Ziel bleibt gleich. */

export const TALENTE = {
  sprache:  { name:'Wortkünstler:in',  emoji:'📚', kurz:'Sprache & Erzählen',
              staerke:'Du merkst dir Wörter, Geschichten und Erklärungen richtig gut.' },
  logik:    { name:'Zahlenforscher:in',emoji:'🔢', kurz:'Logik & Zahlen',
              staerke:'Du liebst Rätsel, Muster und knifflige Aufgaben.' },
  raum:     { name:'Raumdenker:in',    emoji:'🧩', kurz:'Bilder & Raum',
              staerke:'Du siehst Dinge vor deinem inneren Auge und baust gern.' },
  technik:  { name:'Tüftler:in',       emoji:'🛠️', kurz:'Technik & Code',
              staerke:'Du willst wissen, wie etwas funktioniert – und es besser machen.' },
  musik:    { name:'Rhythmusheld:in',  emoji:'🎵', kurz:'Musik & Rhythmus',
              staerke:'Du lernst über Klang, Takt und Wiederholung blitzschnell.' },
  bewegung: { name:'Bewegungstalent',  emoji:'🤸', kurz:'Bewegung & Handeln',
              staerke:'Dein Kopf arbeitet am besten, wenn dein Körper mitmacht.' },
  natur:    { name:'Naturforscher:in', emoji:'🔬', kurz:'Natur & Entdecken',
              staerke:'Du beobachtest genau und stellst richtig gute Fragen.' },
  sozial:   { name:'Teamgeist',        emoji:'🤝', kurz:'Menschen & Miteinander',
              staerke:'Du erklärst anderen Dinge und lernst gemeinsam am besten.' }
};

/* Jeder Lernweg gehoert zu einem Talent – so wird aus Staerke eine Lernmethode. */
export const WEGE = {
  erzaehlen: { talent:'sprache',  name:'Geschichten-Weg', emoji:'📖', hinweis:'Die Aufgabe steckt in einer Geschichte.' },
  knobeln:   { talent:'logik',    name:'Knobel-Weg',      emoji:'🧠', hinweis:'Reine Denksport-Variante.' },
  bauen:     { talent:'raum',     name:'Bau-Weg',         emoji:'🧱', hinweis:'Stell es dir als Bild oder Bauwerk vor.' },
  code:      { talent:'technik',  name:'Code-Weg',        emoji:'🤖', hinweis:'Wie ein Befehl an einen Roboter.' },
  rhythmus:  { talent:'musik',    name:'Rhythmus-Weg',    emoji:'🥁', hinweis:'Im Takt, in Reihen, mit Klang.' },
  bewegen:   { talent:'bewegung', name:'Bewegungs-Weg',   emoji:'👟', hinweis:'Mit Schritten, Sprüngen, Handeln.' },
  entdecken: { talent:'natur',    name:'Entdecker-Weg',   emoji:'🔎', hinweis:'Beobachten und herausfinden.' },
  team:      { talent:'sozial',   name:'Team-Weg',        emoji:'👫', hinweis:'Aufgaben aus dem Miteinander.' }
};

export const FAECHER = {
  mathe:    { name:'Mathe',           emoji:'🔢' },
  deutsch:  { name:'Deutsch',         emoji:'✏️' },
  englisch: { name:'Englisch',        emoji:'🇬🇧' },
  sach:     { name:'Allgemeinwissen', emoji:'🌍' },
  technik:  { name:'Technik & Code',  emoji:'💡' },
  raetsel:  { name:'Rätsel & Puzzle',  emoji:'🧩' },
  klassiker:{ name:'Klassiker',        emoji:'🏛️' },
  kunst:    { name:'Zeichnen',         emoji:'🎨' }
};

/* ---------------------------------------------------------------------------
   Talent-Test in fuenf Teilen.
   Eine einzige Frageform reicht nicht: Kinder neigen bei "Magst du X?" zum
   Ja-Sagen, und alles wirkt gleich stark. Darum mischen wir vier Blickwinkel:
     1. Vorlieben  – Selbsteinschaetzung (Skala)
     2. Entweder-oder – erzwungene Wahl, deckt echte Rangfolgen auf
     3. Szenarien  – Verhalten statt Meinung
     4. Kleine Proben – tatsaechlich gezeigtes Koennen (mit Zeitmessung)
     5. Feinschliff – Stichfragen zwischen den Talenten, die dicht beieinander liegen
   Jeder Teil ist freiwillig: Nach jedem Teil gibt es schon ein Ergebnis,
   jeder weitere Teil macht es genauer.
   --------------------------------------------------------------------------- */

/* Teil 1: Vorlieben – 16 Aussagen, 2 je Talent */
export const TEST_LIKERT = [
  { t:'sprache',  q:'Ich erfinde oder erzähle gern Geschichten.' },
  { t:'sprache',  q:'Neue Wörter merke ich mir schnell.' },
  { t:'logik',    q:'Ich löse gern Rätsel und Knobelaufgaben.' },
  { t:'logik',    q:'Ich finde schnell heraus, wie ein Muster weitergeht.' },
  { t:'raum',     q:'Ich baue oder bastle gern etwas, das halten muss.' },
  { t:'raum',     q:'Ich kann mir Wege und Räume gut im Kopf vorstellen.' },
  { t:'technik',  q:'Ich will wissen, wie Geräte innen funktionieren.' },
  { t:'technik',  q:'Wenn etwas kaputt ist, will ich es selbst reparieren.' },
  { t:'musik',    q:'Ich singe, summe oder trommle oft.' },
  { t:'musik',    q:'Melodien und Lieder merke ich mir sehr schnell.' },
  { t:'bewegung', q:'Beim Lernen bewege ich mich gern oder laufe herum.' },
  { t:'bewegung', q:'Bewegungen kann ich mir nach einmal Zeigen gut merken.' },
  { t:'natur',    q:'Ich beobachte gern Tiere, Pflanzen oder das Wetter.' },
  { t:'natur',    q:'Ich stelle sehr viele Fragen über die Welt.' },
  { t:'sozial',   q:'Ich erkläre anderen gern etwas, bis sie es verstehen.' },
  { t:'sozial',   q:'Ich merke schnell, wie es jemandem gerade geht.' }
];

export const SKALA = [
  { v:1, em:'🙁', label:'gar nicht' },
  { v:2, em:'😐', label:'ein wenig' },
  { v:3, em:'🙂', label:'oft' },
  { v:4, em:'🤩', label:'total' }
];

/* Teil 2: Entweder-oder – 12 Paare. Wer alles mag, muss sich hier entscheiden. */
export const TEST_PAARE = [
  { a:'sprache',  b:'logik',    fa:'Eine Geschichte schreiben',        fb:'Ein Zahlenrätsel knacken' },
  { a:'raum',     b:'sprache',  fa:'Ein Modell bauen',                 fb:'Ein Buch lesen' },
  { a:'technik',  b:'natur',    fa:'Einen Roboter programmieren',      fb:'Käfer im Garten beobachten' },
  { a:'musik',    b:'bewegung', fa:'Ein Lied auf Instrumenten spielen',fb:'Ein Wettrennen laufen' },
  { a:'sozial',   b:'logik',    fa:'Einem Kind Mathe erklären',        fb:'Allein eine harte Aufgabe lösen' },
  { a:'bewegung', b:'sprache',  fa:'Ein Theaterstück vorspielen',      fb:'Ein Gedicht auswendig lernen' },
  { a:'natur',    b:'raum',     fa:'Blätter sammeln und bestimmen',    fb:'Ein Labyrinth zeichnen' },
  { a:'technik',  b:'musik',    fa:'Eine Taschenlampe auseinanderbauen', fb:'Ein Schlagzeug ausprobieren' },
  { a:'logik',    b:'natur',    fa:'Ein Sudoku lösen',                 fb:'Ein Vogelnest untersuchen' },
  { a:'sozial',   b:'technik',  fa:'Eine Gruppe anleiten',             fb:'Allein am Computer tüfteln' },
  { a:'musik',    b:'sozial',   fa:'Ein Lied auswendig singen',        fb:'Einem Freund Mut machen' },
  { a:'raum',     b:'bewegung', fa:'Mit Lego eine Brücke bauen',       fb:'Auf Bäume klettern' }
];

/* Teil 3: Szenarien – was tut das Kind wirklich? */
export const TEST_SZENARIEN = [
  { q:'Ihr sollt in der Gruppe ein Projekt über Wale machen. Was übernimmst du am liebsten?',
    opt:[ { text:'Den Text schreiben und vortragen', t:'sprache' },
          { text:'Das Plakat gestalten und ein Wal-Modell bauen', t:'raum' },
          { text:'Zahlen sammeln: Wie groß, wie schwer, wie tief?', t:'logik' },
          { text:'Dafür sorgen, dass alle etwas zu tun haben', t:'sozial' } ] },
  { q:'Du bekommst einen Karton voller alter Sachen. Was machst du damit?',
    opt:[ { text:'Ich baue etwas Neues daraus', t:'raum' },
          { text:'Ich nehme die Geräte auseinander und schaue hinein', t:'technik' },
          { text:'Ich denke mir eine Geschichte zu jedem Ding aus', t:'sprache' },
          { text:'Ich sortiere alles nach Regeln in Gruppen', t:'logik' } ] },
  { q:'Ein Ausflug! Wohin würdest du am liebsten?',
    opt:[ { text:'In den Wald, Tiere und Pflanzen entdecken', t:'natur' },
          { text:'Ins Technikmuseum zum Ausprobieren', t:'technik' },
          { text:'Ins Konzert oder in eine Musikwerkstatt', t:'musik' },
          { text:'In den Kletterpark', t:'bewegung' } ] },
  { q:'Eine Aufgabe ist richtig schwer. Was hilft dir am meisten?',
    opt:[ { text:'Wenn sie mir jemand erklärt und wir sie zusammen machen', t:'sozial' },
          { text:'Wenn ich sie aufzeichnen oder mit Dingen nachlegen kann', t:'raum' },
          { text:'Wenn ich dabei herumlaufen darf', t:'bewegung' },
          { text:'Wenn ich in Ruhe allein nachdenken darf', t:'logik' } ] },
  { q:'Wie lernst du ein neues Gedicht am schnellsten?',
    opt:[ { text:'Ich singe es oder klopfe den Takt dazu', t:'musik' },
          { text:'Ich lese es mehrmals laut vor', t:'sprache' },
          { text:'Ich laufe dabei durchs Zimmer', t:'bewegung' },
          { text:'Ich male mir zu jeder Zeile ein Bild', t:'raum' } ] },
  { q:'Was findest du an einem Regentag am spannendsten?',
    opt:[ { text:'Zu beobachten, wohin das Wasser läuft', t:'natur' },
          { text:'Ein Boot zu bauen, das schwimmt', t:'technik' },
          { text:'Regentropfen als Rhythmus zu hören', t:'musik' },
          { text:'Jemandem Gesellschaft zu leisten, der traurig ist', t:'sozial' } ] }
];

/* Teil 4: Kleine Proben – gezeigtes Koennen statt Selbsteinschaetzung.
   Zeit wird mitgemessen: sicheres, schnelles Loesen zaehlt staerker. */
export const TEST_PROBEN = [
  { t:'sprache',  q:'Welches Wort reimt sich auf „Blume“?',
    optionen:['Krume','Blatt','Bloß','Bild'], a:'Krume' },
  { t:'logik',    q:'Wie geht die Reihe weiter?\n2, 4, 8, 16, ?',
    optionen:['32','24','20','18'], a:'32' },
  { t:'raum',     q:'Der Pfeil ▲ wird eine Vierteldrehung nach rechts gedreht.\nWohin zeigt er dann?',
    optionen:['▶','◀','▼','▲'], a:'▶' },
  { t:'technik',  q:'Der Roboter startet oben links und führt aus:\n➡️ ➡️ ⬇️ ⬅️\nWie weit ist er von seinem Start entfernt?',
    optionen:['1 nach rechts und 1 nach unten','2 nach rechts','1 nach unten','wieder am Start'],
    a:'1 nach rechts und 1 nach unten' },
  { t:'musik',    q:'Der Takt geht: 👏 👏 🥁 | 👏 👏 🥁 | 👏 ?\nWas kommt jetzt?',
    optionen:['👏','🥁','Pause','🎵'], a:'👏' },
  { t:'bewegung', q:'Du machst 3 Schritte vorwärts, drehst dich um und machst 3 Schritte vorwärts.\nWo stehst du?',
    optionen:['wieder am Start','3 Schritte weiter','6 Schritte weiter','3 Schritte zurück'], a:'wieder am Start' },
  { t:'natur',    q:'Was kommt bei einer Pflanze direkt nach dem Samen?',
    optionen:['der Keimling','die Frucht','die Blüte','das Blatt'], a:'der Keimling' },
  { t:'sozial',   q:'In der Pause sitzt ein Kind allein und schaut traurig.\nWas hilft ihm am ehesten?',
    optionen:['Hingehen und fragen, ob es mitspielen will','Es in Ruhe lassen',
              'Der Lehrerin sagen, dass es stört','Über es lachen'],
    a:'Hingehen und fragen, ob es mitspielen will' }
];

/* Gewichte der Teile am Endergebnis. Fehlende Teile werden neu normiert. */
export const TEST_GEWICHTE = { likert:0.30, paare:0.25, szenarien:0.20, proben:0.25 };

export const TEST_TEILE = [
  { id:'likert',    titel:'Was magst du?',        emoji:'💚', info:'16 kurze Fragen. Es gibt kein Richtig oder Falsch.' },
  { id:'paare',     titel:'Lieber … oder …?',     emoji:'⚖️', info:'Immer zwei Dinge – such dir eines aus.' },
  { id:'szenarien', titel:'Was würdest du tun?',  emoji:'🎭', info:'Sechs Situationen aus dem Alltag.' },
  { id:'proben',    titel:'Kleine Proben',        emoji:'🎯', info:'Acht Mini-Aufgaben. Nimm dir Zeit – aber trödle nicht.' },
  { id:'stich',     titel:'Feinschliff',          emoji:'🔍', info:'Ein paar Stichfragen dort, wo es noch eng ist.' }
];

/* --- Lernziele: was gekonnt werden soll, unabhaengig vom Weg --- */
export const ZIELE = [
  { id:'einmaleins', fach:'mathe',    titel:'Das kleine Einmaleins',
    kompetenz:'Malaufgaben bis 10×10 sicher und schnell lösen.',
    klasse:[2,5], etappe:[1,2], wege:['rhythmus','bauen','erzaehlen','code','knobeln'] },
  { id:'plusminus',  fach:'mathe',    titel:'Plus & Minus im Kopf',
    kompetenz:'Im Zahlenraum bis 1000 sicher addieren und subtrahieren.',
    klasse:[1,5], etappe:[1,2], wege:['knobeln','erzaehlen','bewegen','bauen','team'] },
  { id:'bruch',      fach:'mathe',    titel:'Brüche verstehen',
    kompetenz:'Teile eines Ganzen benennen, vergleichen und berechnen.',
    klasse:[3,6], etappe:[1,3], wege:['bauen','rhythmus','knobeln','erzaehlen'] },
  { id:'geometrie',  fach:'mathe',    titel:'Umfang & Fläche',
    kompetenz:'Umfang und Flächeninhalt von Rechtecken berechnen.',
    klasse:[3,6], etappe:[1,3], wege:['bauen','knobeln','bewegen','erzaehlen'] },
  { id:'recht',      fach:'deutsch',  titel:'Richtig schreiben',
    kompetenz:'Häufige Wörter korrekt schreiben, Groß-/Kleinschreibung anwenden.',
    klasse:[1,6], etappe:[1,3], wege:['knobeln','rhythmus','bauen','erzaehlen'] },
  { id:'wortschatz', fach:'deutsch',  titel:'Wortschatz & Wortarten',
    kompetenz:'Wörter genau verstehen, Ober-/Gegenbegriffe finden.',
    klasse:[1,6], etappe:[1,3], wege:['knobeln','entdecken','erzaehlen','rhythmus'] },
  { id:'lautlesen',  fach:'deutsch',  titel:'Vorlesen & Leseflüssigkeit',
    kompetenz:'Einen Text flüssig, in Sinnabschnitten und betont vorlesen.',
    klasse:[1,13], etappe:[1,5], wege:['rhythmus','erzaehlen','bewegen'] },
  { id:'lesen',      fach:'deutsch',  titel:'Lesen & Verstehen',
    kompetenz:'Aus einem kurzen Text die richtige Information entnehmen.',
    klasse:[2,6], etappe:[1,4], wege:['erzaehlen','entdecken','knobeln'] },
  { id:'vokabeln',   fach:'englisch', titel:'English Basics',
    kompetenz:'Grundwortschatz verstehen und zuordnen.',
    klasse:[1,6], etappe:[1,4], wege:['erzaehlen','rhythmus','bauen','bewegen'] },
  { id:'allgemein',  fach:'sach',     titel:'Allgemeinwissen',
    kompetenz:'Wissen über Welt, Körper, Zeit und Alltag anwenden.',
    klasse:[1,6], etappe:[1,5], wege:['entdecken','erzaehlen','knobeln','team'] },
  { id:'logik',      fach:'technik',  titel:'Muster & Logik',
    kompetenz:'Regeln in Reihen und Mustern erkennen und fortsetzen.',
    klasse:[1,6], etappe:[1,5], wege:['knobeln','bauen','rhythmus'] },
  { id:'zuhoeren',   fach:'deutsch',  titel:'Zuhören & Verstehen',
    kompetenz:'Einer vorgelesenen Geschichte folgen und Fragen dazu beantworten.',
    klasse:[1,6], etappe:[1,3], wege:['erzaehlen','entdecken','knobeln'], vorlesen:true },
  { id:'bildraetsel',fach:'raetsel',  titel:'Bilderrätsel',
    kompetenz:'Bilder deuten, verknüpfen und daraus die Lösung erschließen.',
    klasse:[1,6], etappe:[1,3], wege:['bauen','erzaehlen','knobeln','entdecken'] },
  { id:'puzzle',     fach:'raetsel',  titel:'Puzzle & Reihenfolge',
    kompetenz:'Teile und Ereignisse in die richtige Ordnung bringen.',
    klasse:[1,6], etappe:[1,3], wege:['bauen','erzaehlen','knobeln','bewegen'] },
  { id:'zeichnen',   fach:'kunst',    titel:'Zeichnen & Nachfahren',
    kompetenz:'Formen genau nachzeichnen, Symmetrie halten, in einem Strich durchkommen.',
    klasse:[1,13], etappe:[1,5], wege:['bauen','knobeln','entdecken','bewegen'] },
  { id:'kunstwerk',  fach:'kunst',    titel:'Freies Kunstwerk',
    kompetenz:'Eigene Einfälle zeichnerisch umsetzen – ohne Bewertung.',
    klasse:[1,13], etappe:[1,5], wege:['erzaehlen','bauen','entdecken'] },
  { id:'knacknuss',  fach:'klassiker',titel:'Knacknüsse',
    kompetenz:'Berühmte Denkaufgaben aus mehreren Jahrhunderten selbstständig knacken.',
    klasse:[2,6], etappe:[1,5], wege:['knobeln','erzaehlen','bauen','team'], anspruch:'hoch' },
  { id:'kopfrechnen',fach:'klassiker',titel:'Rechenkunststücke',
    kompetenz:'Alte Kopfrechen-Kniffe verstehen und anwenden – schneller als jeder Rechner am Handy.',
    klasse:[2,6], etappe:[1,5], wege:['knobeln','rhythmus','bauen','code'] },
  { id:'lebenskunst',fach:'klassiker',titel:'Lebenskunst',
    kompetenz:'Mit Ärger, Angst und Enttäuschung umgehen – nach den Stoikern Seneca, Epiktet und Marc Aurel.',
    klasse:[2,6], etappe:[1,5], wege:['erzaehlen','knobeln','team','entdecken'] },
  { id:'kanon',      fach:'klassiker',titel:'Wissen, das bleibt',
    kompetenz:'Die großen Entdeckungen, Werke und Wendepunkte kennen und einordnen.',
    klasse:[2,6], etappe:[1,5], wege:['entdecken','erzaehlen','knobeln','team'] },
  { id:'redewendung',fach:'deutsch',  titel:'Redewendungen & Herkunft',
    kompetenz:'Bildhafte Wendungen verstehen und wissen, woher sie kommen.',
    klasse:[2,6], etappe:[1,5], wege:['erzaehlen','entdecken','knobeln'] },
  { id:'gleichungen',fach:'mathe',    titel:'Gleichungen lösen',
    kompetenz:'Nach einer Unbekannten auflösen – linear, mit Klammern, quadratisch.',
    klasse:[7,13], etappe:[3,5], wege:['knobeln','bauen','erzaehlen','code'] },
  { id:'zinsen',     fach:'mathe',    titel:'Prozent, Zins & Zinseszins',
    kompetenz:'Prozentwerte, Rabatte, Zinsen und Wachstum über Jahre berechnen.',
    klasse:[7,13], etappe:[3,5], wege:['knobeln','erzaehlen','bauen','team'] },
  { id:'stochastik', fach:'mathe',    titel:'Wahrscheinlichkeit',
    kompetenz:'Chancen berechnen, Kombinationen zählen, bedingte Wahrscheinlichkeit verstehen.',
    klasse:[8,13], etappe:[3,5], wege:['knobeln','bauen','erzaehlen','entdecken'] },
  { id:'analysis',   fach:'mathe',    titel:'Analysis: Ableitungen',
    kompetenz:'Ableiten von Polynomen, Steigung und Extremstellen bestimmen.',
    klasse:[11,13], etappe:[4,5], wege:['knobeln','bauen','code'] },
  { id:'stilmittel', fach:'deutsch',  titel:'Rhetorische Stilmittel',
    kompetenz:'Metapher, Ironie, Anapher und die übrigen Mittel erkennen und benennen.',
    klasse:[7,13], etappe:[3,5], wege:['erzaehlen','knobeln','entdecken'] },
  { id:'wortwurzel', fach:'deutsch',  titel:'Wortwurzeln aus Latein & Griechisch',
    kompetenz:'Fremdwörter aus ihren Bausteinen erschließen, statt sie auswendig zu lernen.',
    klasse:[6,13], etappe:[3,5], wege:['entdecken','knobeln','erzaehlen','bauen'] },
  { id:'logikformal',fach:'technik',  titel:'Formale Logik',
    kompetenz:'Gültige von ungültigen Schlüssen unterscheiden – Modus ponens, tollens und die Fallen.',
    klasse:[9,13], etappe:[4,5], wege:['knobeln','bauen','erzaehlen'] },
  { id:'denkfehler', fach:'sach',     titel:'Denkfehler erkennen',
    kompetenz:'Die geprüften Verzerrungen des eigenen Urteils kennen – und im Alltag bemerken.',
    klasse:[9,13], etappe:[4,5], wege:['knobeln','entdecken','team','erzaehlen'] },
  { id:'argumente',  fach:'sach',     titel:'Argumente prüfen',
    kompetenz:'Fehlschlüsse in Behauptungen aufdecken: Strohmann, falsches Dilemma, Zirkelschluss.',
    klasse:[8,13], etappe:[3,5], wege:['knobeln','team','erzaehlen'] },
  { id:'hauptwerke', fach:'klassiker',titel:'Hauptwerke',
    kompetenz:'Die Werke kennen, auf die sich alles Weitere bezieht – wer sie schrieb, wann und worum es geht.',
    klasse:[3,13], etappe:[1,5], wege:['erzaehlen','entdecken','knobeln','team'] },
  { id:'code',       fach:'technik',  titel:'Erste Programmier-Ideen',
    kompetenz:'Befehlsfolgen lesen, Ergebnis vorhersagen, Fehler finden.',
    klasse:[2,6], etappe:[1,4], wege:['code','bauen','bewegen','knobeln'] }
];

export const ZIEL_MAP = Object.fromEntries(ZIELE.map(z => [z.id, z]));

/* Etappen: Die App wächst mit. Jede Etappe hat eigene Ziele, eigene
   Hauptwerke und eigene Härte – vom Schulanfang bis ins Erwachsenenalter. */
export const ETAPPEN = [
  { id:1, name:'Grundschule',  kurz:'1.–4. Klasse',  emoji:'🌱' },
  { id:2, name:'Unterstufe',   kurz:'5.–7. Klasse',  emoji:'🌿' },
  { id:3, name:'Mittelstufe',  kurz:'8.–10. Klasse', emoji:'🌳' },
  { id:4, name:'Oberstufe',    kurz:'11.–13. Klasse', emoji:'🎓' },
  { id:5, name:'Erwachsene',   kurz:'lebenslang',    emoji:'🏛️' }
];

export const AVATARE = ['🦊','🐼','🦁','🐨','🦄','🐙','🦉','🐢','🐝','🦖','🐧','🐬'];

/* Abzeichen: erreichbar auf jedem Weg. */
export const ABZEICHEN = [
  { id:'start',    em:'🌱', name:'Erster Schritt',   test:s => s.aufgabenGesamt >= 1 },
  { id:'zehn',     em:'⭐', name:'10 Aufgaben',      test:s => s.aufgabenGesamt >= 10 },
  { id:'hundert',  em:'🏆', name:'100 Aufgaben',     test:s => s.aufgabenGesamt >= 100 },
  { id:'serie',    em:'🔥', name:'3 Tage am Stück',  test:s => s.streakBest >= 3 },
  { id:'woche',    em:'🚀', name:'7 Tage am Stück',  test:s => s.streakBest >= 7 },
  { id:'meister',  em:'🎓', name:'Erstes Ziel gemeistert', test:s => s.zieleGemeistert >= 1 },
  { id:'entdecker',em:'🧭', name:'4 Wege ausprobiert',     test:s => s.wegeGenutzt >= 4 },
  { id:'brueck',   em:'🌉', name:'Brückenbauer:in',        test:s => s.brueckenRichtig >= 20 },
  { id:'denker',   em:'🧠', name:'5 Knacknüsse ohne Tipp',  test:s => s.ohneTipp >= 5 },
  { id:'meister',  em:'🏛️', name:'20 Knacknüsse ohne Tipp', test:s => s.ohneTipp >= 20 }
];
