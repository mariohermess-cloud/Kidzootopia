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
  technik:  { name:'Technik & Code',  emoji:'💡' }
};

/* --- Talent-Test: 24 Aussagen, 3 pro Talent, Skala 1-4 --- */
export const TEST_FRAGEN = [
  { t:'sprache',  q:'Ich erfinde oder erzähle gern Geschichten.' },
  { t:'sprache',  q:'Ich lese oder höre gern Bücher und merke mir viel davon.' },
  { t:'sprache',  q:'Ich erkläre anderen Dinge gern mit Worten.' },
  { t:'logik',    q:'Ich löse gern Rätsel und Knobelaufgaben.' },
  { t:'logik',    q:'Ich rechne gern im Kopf.' },
  { t:'logik',    q:'Ich finde schnell heraus, wie ein Muster weitergeht.' },
  { t:'raum',     q:'Ich baue gern mit Bausteinen, Lego oder Papier.' },
  { t:'raum',     q:'Ich male oder zeichne gern.' },
  { t:'raum',     q:'Ich kann mir Wege und Räume gut im Kopf vorstellen.' },
  { t:'technik',  q:'Ich will wissen, wie Geräte innen funktionieren.' },
  { t:'technik',  q:'Ich probiere gern am Computer oder Tablet Neues aus.' },
  { t:'technik',  q:'Ich repariere oder verbessere gern Sachen.' },
  { t:'musik',    q:'Ich singe, summe oder trommle oft.' },
  { t:'musik',    q:'Ich merke mir Lieder und Melodien schnell.' },
  { t:'musik',    q:'Ich lerne Dinge leichter, wenn sie einen Rhythmus haben.' },
  { t:'bewegung', q:'Ich bewege mich gern und kann schlecht lange still sitzen.' },
  { t:'bewegung', q:'Ich lerne gut, wenn ich dabei laufe oder etwas mit den Händen tue.' },
  { t:'bewegung', q:'Sport und Bewegungsspiele machen mir viel Spaß.' },
  { t:'natur',    q:'Ich beobachte gern Tiere, Pflanzen oder das Wetter.' },
  { t:'natur',    q:'Ich stelle viele Fragen über die Welt.' },
  { t:'natur',    q:'Ich sammle oder untersuche gern Dinge aus der Natur.' },
  { t:'sozial',   q:'Ich lerne lieber zusammen mit anderen als allein.' },
  { t:'sozial',   q:'Ich merke schnell, wie es anderen geht.' },
  { t:'sozial',   q:'Ich helfe anderen gern beim Verstehen.' }
];

export const SKALA = [
  { v:1, em:'🙁', label:'gar nicht' },
  { v:2, em:'😐', label:'ein wenig' },
  { v:3, em:'🙂', label:'oft' },
  { v:4, em:'🤩', label:'total' }
];

/* --- Lernziele: was gekonnt werden soll, unabhaengig vom Weg --- */
export const ZIELE = [
  { id:'einmaleins', fach:'mathe',    titel:'Das kleine Einmaleins',
    kompetenz:'Malaufgaben bis 10×10 sicher und schnell lösen.',
    klasse:[2,5], wege:['rhythmus','bauen','erzaehlen','code','knobeln'] },
  { id:'plusminus',  fach:'mathe',    titel:'Plus & Minus im Kopf',
    kompetenz:'Im Zahlenraum bis 1000 sicher addieren und subtrahieren.',
    klasse:[1,5], wege:['knobeln','erzaehlen','bewegen','bauen','team'] },
  { id:'bruch',      fach:'mathe',    titel:'Brüche verstehen',
    kompetenz:'Teile eines Ganzen benennen, vergleichen und berechnen.',
    klasse:[3,6], wege:['bauen','rhythmus','knobeln','erzaehlen'] },
  { id:'geometrie',  fach:'mathe',    titel:'Umfang & Fläche',
    kompetenz:'Umfang und Flächeninhalt von Rechtecken berechnen.',
    klasse:[3,6], wege:['bauen','knobeln','bewegen','erzaehlen'] },
  { id:'recht',      fach:'deutsch',  titel:'Richtig schreiben',
    kompetenz:'Häufige Wörter korrekt schreiben, Groß-/Kleinschreibung anwenden.',
    klasse:[1,6], wege:['knobeln','rhythmus','bauen','erzaehlen'] },
  { id:'wortschatz', fach:'deutsch',  titel:'Wortschatz & Wortarten',
    kompetenz:'Wörter genau verstehen, Ober-/Gegenbegriffe finden.',
    klasse:[1,6], wege:['knobeln','entdecken','erzaehlen','rhythmus'] },
  { id:'lesen',      fach:'deutsch',  titel:'Lesen & Verstehen',
    kompetenz:'Aus einem kurzen Text die richtige Information entnehmen.',
    klasse:[2,6], wege:['erzaehlen','entdecken','knobeln'] },
  { id:'vokabeln',   fach:'englisch', titel:'English Basics',
    kompetenz:'Grundwortschatz verstehen und zuordnen.',
    klasse:[1,6], wege:['erzaehlen','rhythmus','bauen','bewegen'] },
  { id:'allgemein',  fach:'sach',     titel:'Allgemeinwissen',
    kompetenz:'Wissen über Welt, Körper, Zeit und Alltag anwenden.',
    klasse:[1,6], wege:['entdecken','erzaehlen','knobeln','team'] },
  { id:'logik',      fach:'technik',  titel:'Muster & Logik',
    kompetenz:'Regeln in Reihen und Mustern erkennen und fortsetzen.',
    klasse:[1,6], wege:['knobeln','bauen','rhythmus'] },
  { id:'code',       fach:'technik',  titel:'Erste Programmier-Ideen',
    kompetenz:'Befehlsfolgen lesen, Ergebnis vorhersagen, Fehler finden.',
    klasse:[2,6], wege:['code','bauen','bewegen','knobeln'] }
];

export const ZIEL_MAP = Object.fromEntries(ZIELE.map(z => [z.id, z]));

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
  { id:'brueck',   em:'🌉', name:'Brückenbauer:in',        test:s => s.brueckenRichtig >= 20 }
];
