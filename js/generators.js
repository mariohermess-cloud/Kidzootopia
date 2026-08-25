/* Aufgaben-Generatoren.
   GEN[zielId][weg](level) -> Aufgabe
   Wichtig: Fuer ein Ziel pruefen ALLE Wege dieselbe Kompetenz.
   Nur die Verpackung unterscheidet sich – das ist die Idee der App. */

import { GESCHICHTEN } from './geschichten.js';
import { KNACKNUESSE, KANON, REDEWENDUNGEN, RECHENTRICKS } from './klassiker.js';

const r = (a,b) => a + Math.floor(Math.random()*(b-a+1));
const pick = a => a[r(0,a.length-1)];
const shuffle = a => a.map(v=>[Math.random(),v]).sort((x,y)=>x[0]-y[0]).map(v=>v[1]);
const uniq = a => [...new Set(a)];

/* Aufgabe mit Zahl-Antwort: Auswahl mit plausiblen Ablenkern */
function zahlChoice(frage, loesung, spanne = 6, hilfe = '') {
  const opts = new Set([loesung]);
  let guard = 0;
  while (opts.size < 4 && guard++ < 60) {
    const d = loesung + r(-spanne, spanne);
    if (d >= 0 && d !== loesung) opts.add(d);
  }
  while (opts.size < 4) opts.add(loesung + opts.size);
  return { frage, typ:'choice', optionen: shuffle([...opts]).map(String), antwort:String(loesung), hilfe };
}
const zahlText = (frage, loesung, hilfe='') =>
  ({ frage, typ:'text', antwort:String(loesung), hilfe, einheit:'' });
const wahl = (frage, richtig, falsche, hilfe='') => {
  // Ablenker duerfen nie zufaellig mit der Loesung uebereinstimmen
  const norm = x => String(x).trim().toLowerCase();
  const sauber = uniq(falsche.map(String)).filter(f => norm(f) !== norm(richtig));
  return { frage, typ:'choice', optionen: shuffle([String(richtig), ...sauber]), antwort: String(richtig), hilfe };
};

/* Schwierigkeit: level 1..5 */
const faktor = lvl => [0,5,7,9,10,12][lvl] || 10;
const zr = lvl => [0,20,50,100,500,1000][lvl] || 100;

const NAMEN = ['Lina','Ben','Mia','Jonas','Emma','Noah','Zoe','Ali','Marie','Luca','Ida','Elias'];
const DINGE = [['Bonbon','Bonbons','🍬'],['Sticker','Sticker','⭐'],['Apfel','Äpfel','🍎'],
  ['Murmel','Murmeln','🔵'],['Karte','Karten','🃏'],['Keks','Kekse','🍪']];

export const GEN = {

/* ---------------- Einmaleins: a × b ---------------- */
einmaleins: {
  rhythmus(lvl){
    const b = r(2, faktor(lvl)), start = r(1,4), n = 4;
    const reihe = Array.from({length:n}, (_,i)=> b*(start+i));
    const fehlt = r(1,n-1);
    const anzeige = reihe.map((v,i)=> i===fehlt ? '__' : v).join(' – ');
    return { ...zahlText(`🥁 Klatsch die ${b}er-Reihe im Takt:\n${anzeige}`, reihe[fehlt],
      `Von einem Takt zum nächsten kommen immer ${b} dazu.`) };
  },
  bauen(lvl){
    const a = r(2, faktor(lvl)), b = r(2, faktor(lvl));
    return zahlChoice(`🧱 Ein Punktefeld hat ${a} Reihen mit je ${b} Punkten.\nWie viele Punkte sind es?`,
      a*b, Math.max(4, b+2), `${a} Reihen × ${b} Punkte = ${a} · ${b}`);
  },
  erzaehlen(lvl){
    const [ez,mz,em] = pick(DINGE), n = NAMEN[r(0,NAMEN.length-1)];
    const a = r(2, faktor(lvl)), b = r(2, faktor(lvl));
    return zahlText(`📖 ${n} packt ${a} Tüten. In jeder Tüte sind ${b} ${mz} ${em}.\nWie viele ${mz} sind das zusammen?`,
      a*b, `${a} Tüten mal ${b} ${mz}.`);
  },
  code(lvl){
    const a = r(2, faktor(lvl)), b = r(2, faktor(lvl));
    return zahlText(`🤖 Der Roboter führt aus:\nwiederhole ${a} mal { sammle ${b} Münzen }\nWie viele Münzen hat er am Ende?`,
      a*b, `${a} Durchläufe mit je ${b} Münzen.`);
  },
  knobeln(lvl){
    const a = r(2, faktor(lvl)), b = r(2, faktor(lvl));
    return lvl >= 3 && Math.random() < .5
      ? zahlText(`🧠 __ × ${b} = ${a*b}\nWelche Zahl fehlt?`, a, `Teile ${a*b} durch ${b}.`)
      : zahlText(`🧠 ${a} × ${b} = ?`, a*b, `Denk in Reihen: ${b}, ${2*b}, ${3*b} …`);
  }
},

/* ---------------- Plus & Minus ---------------- */
plusminus: {
  knobeln(lvl){
    const max = zr(lvl), a = r(2,max), b = r(2, Math.max(2, max-a));
    return Math.random() < .5
      ? zahlText(`🧠 ${a} + ${b} = ?`, a+b, 'Erst die Zehner, dann die Einer.')
      : zahlText(`🧠 ${a+b} − ${b} = ?`, a, 'Rückwärts denken hilft.');
  },
  erzaehlen(lvl){
    const max = Math.min(zr(lvl), 200), n = pick(NAMEN);
    const preis = r(3, max), geld = preis + r(1, 40);
    return zahlText(`📖 ${n} hat ${geld} € gespart und kauft ein Geschenk für ${preis} €.\nWie viel Geld bleibt übrig?`,
      geld-preis, `${geld} minus ${preis}.`);
  },
  bewegen(lvl){
    const start = r(3, Math.min(zr(lvl), 300)), schritt = pick([2,5,10,10,20]), n = r(2,5);
    return zahlText(`👟 Du stehst auf dem Zahlenstrahl bei ${start}.\nDu springst ${n} mal ${schritt} nach vorne.\nWo landest du?`,
      start + schritt*n, `${n} Sprünge × ${schritt} = ${n*schritt} dazu.`);
  },
  bauen(lvl){
    const z1 = r(1,9), e1 = r(0,9), z2 = r(1, lvl>=3?9:4), e2 = r(0,9);
    const a = z1*10+e1, b = z2*10+e2;
    return zahlChoice(`🧱 Du legst ${z1} Zehner-Stangen und ${e1} Einer-Würfel.\nDann kommen ${z2} Zehner und ${e2} Einer dazu.\nWelche Zahl liegt da?`,
      a+b, 12, 'Zehner zu Zehnern, Einer zu Einern.');
  },
  team(lvl){
    const kinder = r(2, lvl>=3 ? 6 : 4), proKind = r(2, faktor(lvl));
    const [ez,mz,em] = pick(DINGE);
    return zahlText(`👫 ${kinder} Kinder teilen ${kinder*proKind} ${mz} ${em} gerecht auf.\nWie viele bekommt jedes Kind?`,
      proKind, `Gerecht teilen heißt: durch ${kinder} teilen.`);
  }
},

/* ---------------- Brüche ---------------- */
bruch: {
  bauen(lvl){
    const teile = pick([4,6,8,8,10,12]);
    let gegessen = r(1, teile-1);
    if (gegessen * 2 === teile) gegessen += pick([-1,1]);   // sonst waere Rest = gegessen
    return wahl(`🧱 Eine Pizza ist in ${teile} gleiche Stücke geschnitten.\nDu isst ${gegessen} Stücke. Wie viel bleibt übrig?`,
      `${teile-gegessen}/${teile}`,
      [`${gegessen}/${teile}`, `${teile-gegessen}/${gegessen}`, `${teile}/${teile-gegessen}`],
      'Übrig = alle Stücke minus die gegessenen.');
  },
  rhythmus(lvl){
    const f = pick([['halbe Note (1/2)', 2], ['Viertelnote (1/4)', 1], ['ganze Note (1/1)', 4], ['punktierte halbe Note (3/4)', 3]]);
    return zahlText(`🥁 Ein Takt hat 4 Schläge.\nWie viele Schläge dauert eine ${f[0]}?`, f[1],
      'Ganze Note = 4 Schläge. Ein Viertel davon = 1 Schlag.');
  },
  knobeln(lvl){
    const n = pick([2,3,4,5,6,8]);
    const a = `1/${n}`, b = `1/${n+r(1,3)}`;
    return wahl(`🧠 Welcher Bruch ist größer?\n${a} oder ${b}?`, a, [b, 'gleich groß'],
      'Je mehr Teile, desto kleiner ist ein einzelnes Teil.');
  },
  erzaehlen(lvl){
    const nenner = pick([2,3,4,5,6]), stueck = nenner * r(2, lvl>=3?6:3);
    return zahlText(`📖 In der Dose sind ${stueck} Gummibärchen.\nDu isst 1/${nenner} davon. Wie viele sind das?`,
      stueck/nenner, `${stueck} durch ${nenner} teilen.`);
  }
},

/* ---------------- Geometrie ---------------- */
geometrie: {
  bauen(lvl){
    const a = r(2, 6+lvl*2), b = r(2, 6+lvl*2);
    return zahlText(`🧱 Du legst ein Rechteck aus Fliesen: ${a} Fliesen lang, ${b} Fliesen breit.\nWie viele Fliesen brauchst du?`,
      a*b, 'Fläche = Länge × Breite.');
  },
  knobeln(lvl){
    const a = r(2, 10+lvl*3), b = r(2, 10+lvl*3);
    return zahlText(`🧠 Ein Rechteck ist ${a} cm lang und ${b} cm breit.\nWie groß ist der Umfang?`,
      2*(a+b), 'Umfang = alle vier Seiten zusammen.');
  },
  bewegen(lvl){
    const a = pick([20,25,30,40,50]), b = pick([10,15,20]), runden = r(1,3);
    return zahlText(`👟 Der Sportplatz ist ${a} m lang und ${b} m breit.\nDu läufst ${runden} Runde(n) außen herum. Wie viele Meter sind das?`,
      runden*2*(a+b), `Eine Runde = ${2*(a+b)} m.`);
  },
  erzaehlen(lvl){
    const a = r(3, 12), b = r(2, 9);
    return zahlText(`📖 Opa baut einen Gemüsegarten: ${a} m lang, ${b} m breit.\nEr will einen Zaun rundherum. Wie viele Meter Zaun braucht er?`,
      2*(a+b), 'Rundherum = Umfang.');
  }
},

/* ---------------- Rechtschreibung ---------------- */
recht: (() => {
  const PAARE = [
    ['Fahrrad','Farrad'],['Spaß','Spass'],['Stühle','Stüle'],['Vater','Fater'],
    ['vielleicht','villeicht'],['Kirche','Kirsche'],['Wald','Vald'],['Käse','Käsä'],
    ['Straße','Strasse'],['Zimmer','Zimer'],['schwimmen','schwimen'],['Freund','Freunt'],
    ['plötzlich','plözlich'],['nämlich','nähmlich'],['ziemlich','zimlich'],['Rhythmus','Ritmus']
  ];
  const SILBEN = [['Ba-na-ne',3],['Schu-le',2],['Kin-der-gar-ten',4],['Haus',1],
    ['Fahr-rad',2],['El-e-fant',3],['Com-pu-ter',3],['Baum',1],['Schmet-ter-ling',3],['Ru-cksack',2]];
  const BAUSTEINE = [['Haus','Tür','Haustür'],['Sonne','Blume','Sonnenblume'],['Feuer','Wehr','Feuerwehr'],
    ['Fußball','Platz','Fußballplatz'],['Schul','Hof','Schulhof'],['Regen','Bogen','Regenbogen'],
    ['Hand','Schuh','Handschuh'],['Zahn','Bürste','Zahnbürste']];
  const SAETZE = [
    ['der hund läuft schnell.','Hund'],['ich esse einen apfel.','Apfel'],
    ['mein bruder spielt gitarre.','Bruder'],['wir fahren nach berlin.','Berlin'],
    ['die katze schläft im garten.','Katze'],['am montag gehen wir schwimmen.','Montag']
  ];
  return {
    knobeln(){ const [ok,bad] = pick(PAARE);
      return wahl('🧠 Welches Wort ist richtig geschrieben?', ok, [bad], 'Sprich das Wort langsam mit.'); },
    rhythmus(){ const [w,n] = pick(SILBEN);
      return zahlChoice(`🥁 Klatsche die Silben: ${w.replace(/-/g,' · ')}\nWie viele Silben hat das Wort?`, n, 3,
        'Jeder Klatscher ist eine Silbe.'); },
    bauen(){ const [a,b,ganz] = pick(BAUSTEINE);
      return Math.random()<.5
        ? wahl(`🧱 Setze zusammen: ${a} + ${b} = ?`, ganz, [a+b.toLowerCase(), b+a.toLowerCase()], 'Zusammengesetzte Nomen schreibt man in einem Wort.')
        : wahl(`🧱 Aus welchen zwei Wörtern besteht "${ganz}"?`, `${a} + ${b}`, [`${b} + ${a}`, `${a} + ${a}`], 'Zerlege das lange Wort.'); },
    erzaehlen(){ const [satz, gross] = pick(SAETZE);
      const woerter = satz.replace('.','').split(' ');
      const falsche = shuffle(woerter.filter(w => w.toLowerCase() !== gross.toLowerCase())).slice(0,2)
        .map(w => w.charAt(0).toUpperCase()+w.slice(1));
      return wahl(`📖 In diesem Satz fehlt ein großer Buchstabe (außer am Anfang):\n„${satz}“\nWelches Wort muss groß geschrieben werden?`,
        gross, falsche, 'Nomen (Dinge, Namen, Lebewesen) schreibt man groß.'); }
  };
})(),

/* ---------------- Wortschatz ---------------- */
wortschatz: (() => {
  const SYN = [['schnell','flink',['langsam','müde','laut']],['schön','hübsch',['hässlich','kalt','leer']],
    ['reden','sprechen',['schweigen','rennen','essen']],['froh','fröhlich',['traurig','böse','krank']],
    ['groß','riesig',['winzig','dünn','nass']],['Angst','Furcht',['Mut','Freude','Ruhe']]];
  const GRUPPEN = [['Tiere',['Hund','Katze','Pferd'],'Tisch'],['Obst',['Apfel','Banane','Birne'],'Karotte'],
    ['Fahrzeuge',['Auto','Bus','Zug'],'Wolke'],['Farben',['rot','blau','grün'],'schnell'],
    ['Körperteile',['Arm','Bein','Nase'],'Stuhl'],['Wetter',['Regen','Schnee','Nebel'],'Löffel']];
  const LUECKEN = [['Der Vogel ______ hoch am Himmel.','fliegt',['schwimmt','kocht']],
    ['Im Winter ist es sehr ______.','kalt',['heiß','laut']],
    ['Die Sonne ______ am Morgen auf.','geht',['isst','schläft']],
    ['Ich ______ mir die Zähne.','putze',['male','werfe']]];
  const REIME = [['Haus','Maus',['Hund','Blume']],['Baum','Traum',['Stein','Wasser']],
    ['Katze','Tatze',['Hund','Vogel']],['Licht','Gedicht',['Lampe','Dunkel']],['Hand','Sand',['Fuß','Meer']]];
  return {
    knobeln(){ const [w,ok,bad] = pick(SYN);
      return wahl(`🧠 Welches Wort bedeutet fast dasselbe wie „${w}“?`, ok, bad.slice(0,3), 'Suche das Wort mit gleicher Bedeutung.'); },
    entdecken(){ const [name, drin, raus] = pick(GRUPPEN);
      return wahl(`🔎 Was passt NICHT zu den anderen?\n${shuffle([...drin, raus]).join(' · ')}`, raus,
        shuffle(drin).slice(0,3), `Drei Wörter gehören zur Gruppe „${name}“.`); },
    erzaehlen(){ const [satz, ok, bad] = pick(LUECKEN);
      return wahl(`📖 Welches Wort passt in die Lücke?\n„${satz}“`, ok, bad, 'Lies den Satz laut mit jedem Wort.'); },
    rhythmus(){ const [w, ok, bad] = pick(REIME);
      return wahl(`🥁 Was reimt sich auf „${w}“?`, ok, bad, 'Reimwörter klingen am Ende gleich.'); }
  };
})(),

/* ---------------- Leseverstehen ---------------- */
lesen: (() => {
  const TEXTE = [
    { weg:'erzaehlen', t:`Mia geht am Samstag mit ihrem Opa zum Markt. Sie kauft drei Äpfel, eine Melone und eine Tüte Nüsse. Auf dem Rückweg regnet es, deshalb spannt Opa den blauen Schirm auf.`,
      f:'Was kauft Mia auf dem Markt NICHT?', ok:'Bananen', bad:['Äpfel','eine Melone','Nüsse'] },
    { weg:'erzaehlen', t:`Ben hat seinen Turnbeutel vergessen. Zum Glück leiht ihm Jonas ein Paar Turnschuhe. Nach dem Sport bringt Ben die Schuhe sauber zurück und schenkt Jonas seinen Lieblings-Sticker.`,
      f:'Warum schenkt Ben seinem Freund einen Sticker?', ok:'Weil Jonas ihm geholfen hat', bad:['Weil Ben Geburtstag hat','Weil Jonas traurig war','Weil der Sticker kaputt ist'] },
    { weg:'entdecken', t:`Der Igel ist nachtaktiv. Am Tag schläft er in einem Versteck aus Laub. Im Winter hält er Winterschlaf und wacht erst im Frühling wieder auf. Igel fressen vor allem Käfer, Würmer und Schnecken.`,
      f:'Wann ist der Igel wach?', ok:'in der Nacht', bad:['am Vormittag','im Winter','nur im Regen'] },
    { weg:'entdecken', t:`Wasser gibt es in drei Zuständen: fest als Eis, flüssig als Wasser und gasförmig als Wasserdampf. Wenn Wasser auf 100 Grad erhitzt wird, verdampft es. Bei 0 Grad gefriert es zu Eis.`,
      f:'Was passiert mit Wasser bei 0 Grad?', ok:'Es gefriert zu Eis', bad:['Es verdampft','Es wird warm','Es verschwindet'] },
    { weg:'knobeln', t:`Drei Kinder stehen in einer Reihe. Lina steht vor Ben. Ben steht vor Zoe.`,
      f:'Wer steht ganz hinten?', ok:'Zoe', bad:['Lina','Ben','niemand'] },
    { weg:'knobeln', t:`Ein Zug fährt um 14:20 Uhr ab und braucht 40 Minuten bis zum Ziel.`,
      f:'Wann kommt der Zug an?', ok:'15:00 Uhr', bad:['14:40 Uhr','15:20 Uhr','16:00 Uhr'] }
  ];
  const bauFrage = weg => { const c = pick(TEXTE.filter(x=>x.weg===weg));
    return wahl(`${weg==='entdecken'?'🔎':weg==='knobeln'?'🧠':'📖'} ${c.t}\n\n${c.f}`, c.ok, c.bad, 'Lies den Text noch einmal genau.'); };
  return { erzaehlen:()=>bauFrage('erzaehlen'), entdecken:()=>bauFrage('entdecken'), knobeln:()=>bauFrage('knobeln') };
})(),

/* ---------------- Englisch ---------------- */
vokabeln: (() => {
  const V = [['Hund','dog','animals'],['Katze','cat','animals'],['Pferd','horse','animals'],['Vogel','bird','animals'],
    ['rot','red','colours'],['blau','blue','colours'],['grün','green','colours'],['gelb','yellow','colours'],
    ['Haus','house','home'],['Tisch','table','home'],['Fenster','window','home'],['Tür','door','home'],
    ['Apfel','apple','food'],['Brot','bread','food'],['Milch','milk','food'],['Wasser','water','food'],
    ['Montag','Monday','time'],['Sommer','summer','time'],['heute','today','time'],['Jahr','year','time']];
  const VERBEN = [['springen','jump'],['laufen','run'],['klatschen','clap'],['tanzen','dance'],
    ['sitzen','sit'],['stehen','stand'],['winken','wave'],['schwimmen','swim']];
  const LIEDER = [['Twinkle, twinkle, little ___','star',['moon','sun','tree']],
    ['Head, shoulders, knees and ___','toes',['nose','hands','ears']],
    ['Happy birthday to ___','you',['me','we','she']],
    ['Old MacDonald had a ___','farm',['car','house','cat']]];
  return {
    erzaehlen(){ const [de,en] = pick(V);
      return wahl(`📖 Wie heißt „${de}“ auf Englisch?`, en, shuffle(V.filter(x=>x[1]!==en)).slice(0,3).map(x=>x[1]), 'Sag es laut.'); },
    rhythmus(){ const [zeile, ok, bad] = pick(LIEDER);
      return wahl(`🥁 Singe weiter:\n„${zeile}“`, ok, bad, 'Der Reim verrät es.'); },
    bauen(){ const cat = pick(uniq(V.map(v=>v[2])));
      const drin = pick(V.filter(v=>v[2]===cat)), raus = shuffle(V.filter(v=>v[2]!==cat)).slice(0,3);
      return wahl(`🧱 Welches Wort gehört zur Gruppe „${cat}“?`, drin[1], raus.map(x=>x[1]), `${cat} = ${cat==='animals'?'Tiere':cat==='colours'?'Farben':cat==='food'?'Essen':cat==='home'?'Zuhause':'Zeit'}`); },
    bewegen(){ const [de,en] = pick(VERBEN);
      return wahl(`👟 Mach es vor! Was bedeutet „${en}“?`, de, shuffle(VERBEN.filter(v=>v[1]!==en)).slice(0,3).map(v=>v[0]), 'Probier die Bewegung aus.'); }
  };
})(),

/* ---------------- Allgemeinwissen ---------------- */
allgemein: (() => {
  const FAKT = [
    ['Welcher Planet ist der Erde am nächsten zur Sonne hin?','Venus',['Mars','Jupiter','Saturn']],
    ['Wie viele Beine hat eine Spinne?','8',['6','10','4']],
    ['Welches Organ pumpt das Blut durch den Körper?','das Herz',['die Lunge','der Magen','die Leber']],
    ['Wie viele Kontinente gibt es?','7',['5','6','9']],
    ['Was ist die Hauptstadt von Deutschland?','Berlin',['Hamburg','München','Köln']],
    ['Welches ist das größte Tier der Erde?','Blauwal',['Elefant','Giraffe','Hai']],
    ['Wie viele Minuten hat eine Stunde?','60',['100','30','24']],
    ['Wie viele Knochen hat ein erwachsener Mensch ungefähr?','206',['150','320','80']]
  ];
  const STORY = [
    ['📖 Ein Bäcker steht um 3 Uhr nachts auf. Warum?','Damit die Brötchen morgens frisch sind',['Weil er nicht schlafen kann','Weil nachts Ferien sind','Weil der Laden nachts offen ist']],
    ['📖 Im Herbst verlieren viele Bäume ihre Blätter. Warum?','Um im Winter Wasser zu sparen',['Weil die Blätter schwer sind','Weil Vögel sie fressen','Weil es dunkel wird']],
    ['📖 Auf einer Landkarte ist Wasser meist blau. Was ist dann grün?','flaches Land',['Städte','Berge über 3000 m','Straßen']]
  ];
  const SCHAETZ = [
    ['🧠 Was ist schwerer: 1 kg Federn oder 1 kg Steine?','Beides gleich schwer',['1 kg Steine','1 kg Federn']],
    ['🧠 Was dauert länger: ein Jahr auf der Erde oder ein Tag?','ein Jahr',['ein Tag','gleich lang']],
    ['🧠 Welche Strecke ist länger: 1000 m oder 1 km?','Beide gleich lang',['1000 m','1 km']],
    ['🧠 Was ist heißer: kochendes Wasser oder ein Eiswürfel?','kochendes Wasser',['der Eiswürfel','gleich']]
  ];
  const ALLTAG = [
    ['🤝 Welche Nummer wählst du im Notfall (Feuerwehr/Rettung) in Europa?','112',['110 für Feuer','911','119']],
    ['🤝 Die Ampel für Fußgänger zeigt Rot. Was tust du?','Warten, bis sie grün ist',['Schnell laufen','Winken und gehen','Auf die Straße treten']],
    ['🤝 Ein Kind auf dem Schulhof ist gestürzt und weint. Was hilft zuerst?','Fragen, ob es Hilfe braucht, und Hilfe holen',['Weglaufen','Lachen','Nichts sagen']],
    ['🤝 Jemand im Netz fragt dich nach deiner Adresse. Was tust du?','Nichts verraten und Erwachsene fragen',['Adresse schicken','Foto schicken','Telefonnummer geben']]
  ];
  const q = arr => { const [f,ok,bad] = pick(arr); return wahl(f, ok, bad, ''); };
  return {
    entdecken(){ return q(FAKT.map(([f,o,b])=>['🔎 '+f,o,b])); },
    erzaehlen(){ return q(STORY); },
    knobeln(){ return q(SCHAETZ); },
    team(){ return q(ALLTAG); }
  };
})(),

/* ---------------- Muster & Logik ---------------- */
logik: {
  knobeln(lvl){
    const start = r(1,9), typ = lvl>=3 ? pick(['add','mul','fib']) : 'add';
    let reihe = [], step = r(2, 5+lvl);
    if (typ === 'add') { for (let i=0;i<5;i++) reihe.push(start + i*step); }
    else if (typ === 'mul') { const f = pick([2,2,3]); reihe=[start]; for (let i=1;i<5;i++) reihe.push(reihe[i-1]*f); }
    else { reihe=[1,1]; for (let i=2;i<6;i++) reihe.push(reihe[i-1]+reihe[i-2]); }
    const naechste = reihe.pop();
    return zahlText(`🧠 Wie geht die Reihe weiter?\n${reihe.join(', ')}, ?`, naechste, 'Schau, was von Zahl zu Zahl passiert.');
  },
  bauen(){
    const formen = shuffle(['🔺','🟦','🟡','🟣','🟩','⬛']).slice(0,3);
    const muster = [], laenge = 8;
    for (let i=0;i<laenge;i++) muster.push(formen[i % formen.length]);
    const loesung = muster.pop();
    return wahl(`🧱 Welche Form kommt als nächstes?\n${muster.join(' ')} ❓`, loesung,
      formen.filter(f=>f!==loesung), `Das Muster wiederholt sich alle ${formen.length} Formen.`);
  },
  rhythmus(){
    const [a,b,c] = shuffle(['👏','🥁','🎵','✋','🦶','🔔']).slice(0,3);
    const [na,nb] = pick([[2,1],[1,2],[2,2],[3,1]]);
    const takt = [...Array(na).fill(a), ...Array(nb).fill(b)];
    const folge = [takt, takt, takt].map(t => t.join(' ')).join(' | ');
    return wahl(`🥁 Der Takt wiederholt sich. Wie beginnt der nächste Takt?\n${folge} | ❓`,
      a, [b, c], 'Jeder Takt beginnt gleich.');
  }
},

/* ---------------- Zuhören: vorgelesene Geschichten ---------------- */
zuhoeren: (() => {
  const bauen = (weg, lvl) => {
    const passend = GESCHICHTEN.filter(g => lvl <= 2 ? g.stufe[0] <= 3 : true);
    const g = pick(passend.length ? passend : GESCHICHTEN);
    // Weg bestimmt, welche Art Frage gestellt wird
    const index = { erzaehlen:0, knobeln:1, entdecken:2 }[weg] ?? 0;
    const f = g.fragen[Math.min(index, g.fragen.length-1)];
    return {
      ...wahl(f.q, f.ok, f.bad, 'Du darfst die Geschichte noch einmal anhören.'),
      hoertext: g.text,
      titel: `${g.emoji} ${g.titel}`,
      vorlesen: true
    };
  };
  return {
    erzaehlen: lvl => bauen('erzaehlen', lvl),
    knobeln:   lvl => bauen('knobeln', lvl),
    entdecken: lvl => bauen('entdecken', lvl)
  };
})(),

/* ---------------- Bilderrätsel ---------------- */
bildraetsel: (() => {
  /* Rebus: zwei Bilder ergeben zusammen ein Wort */
  const REBUS = [
    { bilder:'🔥 + 🚗', ok:'Feuerwehrauto', bad:['Feuerzeug','Rennauto','Feuerstein'] },
    { bilder:'☀️ + 🌸', ok:'Sonnenblume',   bad:['Sonnenschirm','Blumentopf','Sonnenbrille'] },
    { bilder:'🌧️ + 🌈', ok:'Regenbogen',    bad:['Regenschirm','Wolkenbruch','Regenwurm'] },
    { bilder:'🦷 + 🪥', ok:'Zahnbürste',    bad:['Zahnarzt','Haarbürste','Zahnpasta'] },
    { bilder:'🍎 + 🧃', ok:'Apfelsaft',     bad:['Apfelbaum','Orangensaft','Apfelkuchen'] },
    { bilder:'🐴 + 🍎', ok:'Pferdeapfel',   bad:['Apfelpferd','Reitstall','Obstwiese'] },
    { bilder:'🔑 + 🕳️', ok:'Schlüsselloch', bad:['Schlüsselbund','Mauseloch','Türschloss'] },
    { bilder:'📚 + 🏬', ok:'Buchladen',     bad:['Bücherregal','Kaufhaus','Bibliothek'] }
  ];
  /* Was gehört zusammen? */
  const PAARE = [
    { a:'🧦', ok:'👟', bad:['🍕','📚','🎸'], hilfe:'Was zieht man zusammen an?' },
    { a:'🐝', ok:'🌼', bad:['🚂','🧊','📱'], hilfe:'Wer besucht wen?' },
    { a:'🔨', ok:'🪵', bad:['🍦','🐠','☂️'], hilfe:'Womit arbeitet man?' },
    { a:'🖌️', ok:'🎨', bad:['🍞','⚽','🔌'], hilfe:'Was gehört zum Malen?' },
    { a:'🌧️', ok:'☂️', bad:['🕶️','🎧','🥁'], hilfe:'Was hilft bei Regen?' },
    { a:'🐓', ok:'🥚', bad:['🚙','🎈','🧱'], hilfe:'Was gehört zum Huhn?' }
  ];
  /* Bild-Logik: Was passt nicht in die Reihe? */
  const REIHEN = [
    { drin:['🐕','🐈','🐇'], raus:'🌳', warum:'Drei Tiere und ein Baum.' },
    { drin:['🍏','🍌','🍇'], raus:'🥕', warum:'Drei Obstsorten und ein Gemüse.' },
    { drin:['🚗','🚌','🚲'], raus:'🏠', warum:'Drei Fahrzeuge und ein Haus.' },
    { drin:['☀️','🌧️','❄️'], raus:'📖', warum:'Dreimal Wetter und ein Buch.' },
    { drin:['🎺','🥁','🎻'], raus:'🍽️', warum:'Drei Instrumente und ein Teller.' }
  ];
  /* Zählrätsel im Bild */
  const zaehlen = lvl => {
    const em = pick(['🐟','⭐','🍒','🐞','🎈']);
    const zeilen = r(2, 2+lvl), proZeile = r(2, 3+lvl);
    const bild = Array.from({length:zeilen}, () => em.repeat(proZeile)).join('\n');
    return zahlChoice(`🔎 Wie viele ${em} siehst du?\n${bild}`, zeilen*proZeile, 4,
      `${zeilen} Reihen mit je ${proZeile} Stück.`);
  };
  return {
    erzaehlen(){ const x = pick(REBUS);
      return wahl(`🖼️ Welches Wort ergeben die beiden Bilder zusammen?\n\n${x.bilder}`,
        x.ok, x.bad, 'Sprich beide Bilder laut hintereinander aus.'); },
    bauen(){ const x = pick(PAARE);
      return wahl(`🧱 Was gehört zu ${x.a} ?`, x.ok, x.bad, x.hilfe); },
    knobeln(){ const x = pick(REIHEN);
      return wahl(`🧠 Was passt nicht dazu?\n${shuffle([...x.drin, x.raus]).join('   ')}`,
        x.raus, x.drin, x.warum); },
    entdecken: zaehlen
  };
})(),

/* ---------------- Puzzle & Reihenfolge (zum Legen) ---------------- */
puzzle: (() => {
  const ordnen = (frage, richtige, hilfe) =>
    ({ frage, typ:'ordnen', elemente: shuffle([...richtige]), antwort: richtige.join(' → '), hilfe });

  const ABLAEUFE = [
    { t:'Wie wächst eine Pflanze?', s:['🌰 Samen','🌱 Keimling','🌿 Pflanze','🌻 Blüte'] },
    { t:'Wie wird aus einer Raupe ein Schmetterling?', s:['🥚 Ei','🐛 Raupe','🛡️ Puppe','🦋 Schmetterling'] },
    { t:'Wie backst du einen Kuchen?', s:['🛒 einkaufen','🥣 rühren','🔥 backen','🍰 essen'] },
    { t:'Wie kommst du morgens in die Schule?', s:['⏰ aufwachen','🥣 frühstücken','🎒 Ranzen packen','🏫 losgehen'] },
    { t:'Wie wird aus Wasser Eis und wieder Wasser?', s:['💧 Wasser','🧊 Eis','☀️ Sonne scheint','💦 geschmolzen'] },
    { t:'Wie schickst du einen Brief?', s:['✍️ schreiben','✉️ eintüten','📮 einwerfen','📬 kommt an'] }
  ];
  const GROESSE = [
    { t:'Ordne von klein nach groß', s:['🐜 Ameise','🐭 Maus','🐕 Hund','🐘 Elefant'] },
    { t:'Ordne von leicht nach schwer', s:['🪶 Feder','🍎 Apfel','🎒 Ranzen','🚗 Auto'] },
    { t:'Ordne von kurz nach lang', s:['📎 Büroklammer','✏️ Bleistift','🚪 Tür','🚌 Bus'] },
    { t:'Ordne von kalt nach heiß', s:['🧊 Eis','💧 Wasser','☕ Tee','🔥 Feuer'] }
  ];

  return {
    erzaehlen(){ const a = pick(ABLAEUFE);
      return ordnen(`📖 ${a.t}\nTippe die Bilder in der richtigen Reihenfolge an.`, a.s,
        'Denk daran, was zuerst passiert.'); },
    bauen(){ const g = pick(GROESSE);
      return ordnen(`🧱 ${g.t}.\nTippe sie in der richtigen Reihenfolge an.`, g.s,
        'Fang beim Kleinsten an.'); },
    knobeln(lvl){
      // Zahlenfolge legen
      const start = r(1,9), schritt = r(2, 3+lvl);
      const zahlen = Array.from({length:4}, (_,i) => String(start + i*schritt));
      return ordnen(`🧠 Bringe die Zahlen in die richtige Reihenfolge – von klein nach groß.`,
        zahlen, 'Die kleinste Zahl kommt zuerst.'); },
    bewegen(){ const a = pick(ABLAEUFE.slice(2));
      return ordnen(`👟 Mach es in Gedanken mit: ${a.t}\nTippe die Schritte der Reihe nach an.`, a.s,
        'Stell dir vor, du machst es gerade wirklich.'); }
  };
})(),

/* ---------------- Klassiker: Knacknüsse ---------------- */
knacknuss: (() => {
  const RAHMEN = {
    knobeln:   'Knacknuss – nimm dir Zeit.',
    erzaehlen: 'Diese Aufgabe wird seit Generationen weitererzählt.',
    bauen:     'Zeichne es auf oder leg es mit Gegenständen nach.',
    team:      'Erkläre die Aufgabe jemandem – beim Erklären fällt die Lösung oft von selbst.'
  };
  const bauen = (weg, lvl) => {
    const passend = KNACKNUESSE.filter(k => k.stufe <= lvl + 1);
    const k = pick(passend.length ? passend : KNACKNUESSE.filter(x => x.stufe <= 2));
    const basis = k.optionen
      ? { typ:'choice', optionen: shuffle([...k.optionen]) }
      : { typ:'text' };
    return {
      ...basis,
      frage: `🏛️ ${RAHMEN[weg]}\n\n${k.frage}`,
      antwort: k.antwort,
      tipps: k.tipps || [],
      quelle: k.quelle,
      hilfe: (k.tipps || []).at(-1) || '',
      knacknuss: true
    };
  };
  return {
    knobeln:   lvl => bauen('knobeln', lvl),
    erzaehlen: lvl => bauen('erzaehlen', lvl),
    bauen:     lvl => bauen('bauen', lvl),
    team:      lvl => bauen('team', lvl)
  };
})(),

/* ---------------- Klassiker: Rechenkunststücke ---------------- */
kopfrechnen: (() => {
  const trick = id => RECHENTRICKS.find(t => t.id === id);
  const mit = (aufgabe, t) => ({ ...aufgabe, hilfe: t.erklaerung, quelle: t.quelle });

  const malElf = lvl => { const n = r(12, lvl >= 3 ? 98 : 49);
    return mit(zahlText(`✖️ Mal 11 im Kopf: ${n} × 11 = ?`, n*11), trick('elf')); };

  const quadratAufFuenf = lvl => { const z = r(1, lvl >= 3 ? 9 : 4), n = z*10 + 5;
    return mit(zahlText(`✖️ Quadrat einer Zahl auf 5: ${n} × ${n} = ?`, n*n), trick('fuenf')); };

  const gaussSumme = lvl => { const n = pick(lvl >= 3 ? [20,25,30,40,50,100] : [5,6,10,12,15]);
    return mit(zahlText(`➕ Zähle alle Zahlen von 1 bis ${n} zusammen.\nNicht einzeln – nutze den Kniff!`,
      n*(n+1)/2), trick('gauss')); };

  const bauernRechnen = lvl => { const a = r(3, 6+lvl*2), b = r(11, 20+lvl*10);
    return mit(zahlText(`🧱 Halbieren und verdoppeln: ${a} × ${b} = ?`, a*b), trick('bauern')); };

  const neunerprobe = lvl => {
    const a = r(12, 40+lvl*10), b = r(3, 9), echt = a*b;
    const falsch = Math.random() < .5;
    const gezeigt = falsch ? echt + pick([1,2,-1,-2]) : echt;
    const quer = n => String(n).split('').reduce((x,y)=>x+Number(y),0);
    return mit(wahl(`🔍 Neunerprobe: Stimmt diese Rechnung?\n${a} × ${b} = ${gezeigt}\n(Quersumme von ${a} ist ${quer(a)}, von ${b} ist ${quer(b)})`,
      falsch ? 'Nein, da stimmt etwas nicht' : 'Ja, die Rechnung stimmt',
      [falsch ? 'Ja, die Rechnung stimmt' : 'Nein, da stimmt etwas nicht']), trick('neuner'));
  };

  const prozente = lvl => { const n = pick([40,60,80,120,200,250,300]).valueOf(),
        p = pick(lvl >= 3 ? [5,10,15,20,25] : [10,20,50]);
    return mit(zahlText(`💯 ${p} % von ${n} = ?`, n*p/100), trick('prozent')); };

  return {
    knobeln:  lvl => (Math.random() < .5 ? malElf(lvl) : quadratAufFuenf(lvl)),
    rhythmus: lvl => gaussSumme(lvl),
    bauen:    lvl => bauernRechnen(lvl),
    code:     lvl => (Math.random() < .5 ? neunerprobe(lvl) : prozente(lvl))
  };
})(),

/* ---------------- Klassiker: Wissen, das bleibt ---------------- */
kanon: (() => {
  const ausBereichen = (bereiche) => {
    const menge = KANON.filter(k => bereiche.includes(k.bereich));
    const k = pick(menge.length ? menge : KANON);
    return { ...wahl(k.q, k.ok, k.bad, ''), quelle: k.notiz };
  };
  return {
    entdecken: () => ausBereichen(['Entdeckungen','Natur']),
    erzaehlen: () => ausBereichen(['Kunst','Geschichte']),
    knobeln:   () => ausBereichen(['Zahlen','Sprache']),
    team:      () => ausBereichen(['Geschichte','Erde'])
  };
})(),

/* ---------------- Redewendungen ---------------- */
redewendung: (() => {
  const eine = () => { const w = pick(REDEWENDUNGEN);
    return { ...wahl(w.q, w.ok, w.bad, 'Stell dir das Bild wörtlich vor.'), quelle: w.herkunft }; };
  const herkunft = () => { const w = pick(REDEWENDUNGEN);
    const falsche = shuffle(REDEWENDUNGEN.filter(x => x !== w)).slice(0,2).map(x => x.herkunft);
    return { ...wahl(`🔎 Woher kommt die Redewendung ${w.q.split('“')[0]}“?`, w.herkunft, falsche,
      'Denk an das Leben früher.'), quelle: w.ok };
  };
  return { erzaehlen: eine, knobeln: eine, entdecken: herkunft };
})(),

/* ---------------- Code ---------------- */
code: {
  code(lvl){
    const start = r(0, 5), n = r(2, 3 + lvl);
    const schritt = r(2, 4);
    const befehle = [`setze zaehler = ${start}`, `wiederhole ${n} mal { zaehler = zaehler + ${schritt} }`, `zeige zaehler`];
    return zahlText(`🤖 Was zeigt das Programm an?\n\n${befehle.join('\n')}`,
      start + n*schritt, `${n} mal ${schritt} dazu, plus Startwert ${start}.`);
  },
  bauen(lvl){
    const dirs = { '⬆️':[0,-1], '⬇️':[0,1], '➡️':[1,0], '⬅️':[-1,0] };
    const keys = Object.keys(dirs);
    let x=2, y=2; const prog=[];
    for (let i=0;i<2+lvl;i++){ const k = pick(keys); const [dx,dy]=dirs[k];
      const nx=Math.min(4,Math.max(0,x+dx)), ny=Math.min(4,Math.max(0,y+dy));
      if (nx===x && ny===y) { i--; continue; } x=nx; y=ny; prog.push(k); }
    const feld = `${'ABCDE'[x]}${y+1}`;
    const falsche = uniq([`${'ABCDE'[Math.min(4,x+1)]}${y+1}`, `${'ABCDE'[x]}${Math.min(5,y+2)}`,
      `${'ABCDE'[Math.max(0,x-1)]}${Math.max(1,y)}`]).filter(f=>f!==feld).slice(0,3);
    return wahl(`🧱 Der Roboter startet auf Feld C3 (Gitter A–E, 1–5).\nProgramm: ${prog.join(' ')}\nAuf welchem Feld steht er danach?`,
      feld, falsche, 'Zeichne das Gitter und geh Schritt für Schritt mit.');
  },
  bewegen(lvl){
    const schritte = r(3, 4+lvl), zurueck = r(1, schritte-1);
    return zahlText(`👟 Führe das Programm mit deinen Füßen aus:\ngehe ${schritte} Schritte vor\ngehe ${zurueck} Schritte zurück\nWie viele Schritte bist du am Ende vom Start entfernt?`,
      schritte - zurueck, 'Vor minus zurück.');
  },
  knobeln(lvl){
    const zutaten = pick([
      ['Zähne putzen', ['Zahnbürste nehmen','Zahnpasta drauf','putzen','Mund ausspülen'],'Zahnpasta drauf'],
      ['Brot schmieren',['Brot nehmen','Butter draufstreichen','Belag drauflegen','essen'],'Butter draufstreichen'],
      ['Nachricht senden',['App öffnen','Chat auswählen','Text schreiben','senden'],'Text schreiben']
    ]);
    const [titel, schritte, fehlend] = zutaten;
    const gezeigt = schritte.filter(s => s !== fehlend);
    return wahl(`🧠 Debugging! Im Programm „${titel}“ fehlt ein Schritt:\n${gezeigt.map((s,i)=>`${i+1}. ${s}`).join('\n')}\nWelcher Befehl fehlt?`,
      fehlend, ['Fernseher anschalten','Schuhe anziehen','Fenster öffnen'],
      'Geh die Reihenfolge im Kopf durch.');
  }
}
};

/* Aufgabe erzeugen; faellt auf einen vorhandenen Weg zurueck. */
export function baueAufgabe(zielId, weg, level = 1) {
  const ziel = GEN[zielId];
  if (!ziel) throw new Error('Unbekanntes Ziel: ' + zielId);
  const fn = ziel[weg] || ziel[Object.keys(ziel)[0]];
  const a = fn(Math.max(1, Math.min(5, level)));
  return { ...a, zielId, weg, level };
}

export function pruefe(aufgabe, eingabe) {
  const norm = s => String(s ?? '').trim().toLowerCase()
    .replace(/\s+/g,' ').replace(',', '.').replace(/[.!?]$/,'').replace(/\s*€|\s*cm|\s*m$/,'');
  return norm(eingabe) === norm(aufgabe.antwort);
}
