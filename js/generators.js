/* Aufgaben-Generatoren.
   GEN[zielId][weg](level) -> Aufgabe
   Wichtig: Fuer ein Ziel pruefen ALLE Wege dieselbe Kompetenz.
   Nur die Verpackung unterscheidet sich – das ist die Idee der App. */

import { GESCHICHTEN } from './geschichten.js';
import { KNACKNUESSE, KANON, REDEWENDUNGEN, RECHENTRICKS } from './klassiker.js';
import { FAMILIEN } from './knacknuss_familien.js';
import { VORLAGEN, EINSTRICH, SYMMETRIE, AUFTRAEGE, spiegeln } from './zeichnen.js';
import { ZITATE, KONTROLLE, SITUATIONEN, IMPULSE, DENKER } from './philosophie.js';
import { HAUPTWERKE } from './hauptwerke.js';
import { DENKFEHLER, FEHLSCHLUESSE, STILMITTEL, WORTWURZELN, SYLLOGISMEN } from './fortgeschritten.js';

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

/* ---------------- Zeichnen: messbare Aufgaben ---------------- */
zeichnen: (() => {
  const nachfahren = lvl => {
    const menge = VORLAGEN.filter(v => v.stufe <= Math.min(4, lvl + 1));
    const v = pick(menge.length ? menge : VORLAGEN);
    return { typ:'zeichnen', modus:'nachfahren', vorlage:v.linien, titel:v.name,
      frage:`✏️ Fahre die Form mit dem Finger nach: ${v.name}\nNimm dir Zeit – Genauigkeit zählt, nicht Tempo.`,
      antwort:'nachgezeichnet', hilfe:'Setze ruhig ab und mach weiter – wichtig ist, dass die Linie getroffen wird.' };
  };
  const einStrich = () => {
    const f = pick(EINSTRICH);
    return { typ:'zeichnen', modus:'einstrich', vorlage:f.linien, titel:f.name,
      frage:`🖊️ ${f.name}: Zeichne die Figur in EINEM Strich, ohne abzusetzen –\nund ohne eine Linie zweimal zu fahren.`,
      antwort:'in einem Strich', quelle:f.quelle,
      hilfe:'Fang an der richtigen Ecke an – bei den meisten Figuren geht es nur von unten.' };
  };
  const symmetrie = () => {
    const f = pick(SYMMETRIE);
    return { typ:'zeichnen', modus:'symmetrie', vorlage:f.haelfte, zielLinien:spiegeln(f.haelfte), titel:f.name,
      frage:`🪞 Die linke Hälfte ist vorgegeben.\nZeichne die rechte Hälfte spiegelbildlich dazu: ${f.name}`,
      antwort:'gespiegelt', hilfe:'Miss mit dem Auge: Gleich weit von der Mittellinie entfernt, gleiche Höhe.' };
  };
  const gedaechtnis = lvl => {
    const menge = VORLAGEN.filter(v => v.stufe <= 2);
    const v = pick(menge);
    return { typ:'zeichnen', modus:'gedaechtnis', vorlage:v.linien, titel:v.name,
      frage:`🧠 Merk dir die Form – sie verschwindet gleich!\nZeichne sie danach aus dem Gedächtnis: ${v.name}`,
      antwort:'aus dem Gedächtnis', hilfe:'Präg dir zuerst die Umrisse ein, dann die Einzelheiten.' };
  };
  return {
    bauen:     lvl => nachfahren(lvl),
    knobeln:   () => einStrich(),
    entdecken: () => symmetrie(),
    bewegen:   lvl => gedaechtnis(lvl)
  };
})(),

/* ---------------- Freies Kunstwerk: bewusst ohne Bewertung ---------------- */
kunstwerk: (() => {
  const auftrag = () => { const a = pick(AUFTRAEGE); return {
    typ:'zeichnen', modus:'frei', auftrag: a,
    frage:`🎨 ${a}`, antwort:'gezeichnet', keineWertung:true,
    quelle:'Freie Arbeiten werden nicht benotet. Sie wandern in deine Galerie – dort kannst du sie später wiedersehen.',
    hilfe:'Es gibt kein Richtig. Zeichne los.'
  }; };
  return { erzaehlen: auftrag, bauen: auftrag, entdecken: auftrag };
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
    // Fenster um die eigene Stufe herum – groß genug, damit sich nichts
    // ständig wiederholt, aber nicht so groß, dass es überfordert.
    let passend = KNACKNUESSE.filter(k => k.stufe <= lvl + 1);
    if (passend.length < 12) passend = KNACKNUESSE.filter(k => k.stufe <= lvl + 2);

    // Rätsel-Familien: klassische Typen mit wechselnden Zahlen. Sie stellen den
    // weitaus größten Teil des Vorrats und werden entsprechend oft gezogen.
    let familien = FAMILIEN.filter(f => f.stufe <= lvl + 1);
    if (familien.length < 6) familien = FAMILIEN.filter(f => f.stufe <= lvl + 2);
    if (familien.length && Math.random() < 0.72) {
      const f = pick(familien);
      const a = f.erzeuge();
      return {
        typ: 'text',
        frage: `🏛️ ${RAHMEN[weg]}\n\n${a.frage}`,
        antwort: a.antwort,
        tipps: a.tipps,
        quelle: f.quelle,
        hilfe: a.tipps.at(-1) || '',
        knacknuss: true
      };
    }

    const k = pick(passend.length ? passend : KNACKNUESSE);
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

/* ---------------- Klassiker: Lebenskunst (Stoa) ---------------- */
lebenskunst: (() => {
  /* Ein Denk-Impuls hat keine richtige Antwort. Er wird auch nicht bewertet –
     sonst wäre es keine Frage mehr, sondern eine Prüfung. */
  const impuls = () => {
    const i = pick(IMPULSE);
    return {
      frage: `🏛️ ${i.frage}`,
      typ: 'nachdenken',
      optionen: shuffle(i.optionen.map(o => o.text)),
      rueckmeldungen: Object.fromEntries(i.optionen.map(o => [o.text, o.antwort])),
      antwort: i.optionen[0].text,
      quelle: i.quelle,
      keineWertung: true
    };
  };

  const zitatVerstehen = () => { const z = pick(ZITATE);
    return { ...wahl(`🏛️ ${z.text}\n\nWas ist damit gemeint?`, z.ok, z.bad,
      'Lies das Zitat noch einmal langsam – Wort für Wort.'), quelle: z.quelle }; };

  const inMeinerHand = () => {
    const meins = pick(KONTROLLE.filter(k => k.meins));
    const fremd = shuffle(KONTROLLE.filter(k => !k.meins)).slice(0,3);
    return { ...wahl('🧠 Epiktet fragt: Was davon liegt wirklich in deiner Hand?',
      meins.sache, fremd.map(f => f.sache),
      'Alles, was andere oder das Wetter entscheiden, liegt nicht bei dir.'),
      quelle:'Epiktet, Handbüchlein der Moral 1 – die berühmte Unterscheidung zwischen dem, was uns gehört, und dem, was nicht.' };
  };

  const nichtInMeinerHand = () => {
    const fremd = pick(KONTROLLE.filter(k => !k.meins));
    const meine = shuffle(KONTROLLE.filter(k => k.meins)).slice(0,3);
    return { ...wahl('🧠 Und umgekehrt: Was davon liegt NICHT in deiner Hand?',
      fremd.sache, meine.map(m => m.sache),
      'Was du selbst tust oder lässt, liegt bei dir.'),
      quelle:'Epiktet, Handbüchlein der Moral 1' };
  };

  const alltag = () => { const s = pick(SITUATIONEN);
    return { ...wahl(`🤝 ${s.q}\n\nWas ist die klügste Antwort darauf?`, s.ok, s.bad, s.prinzip),
      quelle: `${s.prinzip} — ${s.quelle}` }; };

  const werSagts = () => {
    const menge = ZITATE.filter(z => DENKER[z.denker]);
    const z = pick(menge);
    const andere = shuffle(Object.keys(DENKER).filter(k => k !== z.denker)).slice(0,3);
    return { ...wahl(`🔎 Wer sagte das?\n\n${z.text}`, DENKER[z.denker].name,
      andere.map(k => DENKER[k].name), 'Achte auf den Ton: Kaiser, Sklave oder Lehrer?'),
      quelle: `${z.quelle}. ${DENKER[z.denker].name} lebte ${DENKER[z.denker].lebte}. ${DENKER[z.denker].wer}` };
  };

  /* Jede vierte Aufgabe ist ein Impuls ohne richtige Antwort. */
  const vielleichtImpuls = fn => () => (Math.random() < 0.25 ? impuls() : fn());

  return {
    erzaehlen: vielleichtImpuls(zitatVerstehen),
    knobeln:   vielleichtImpuls(() => (Math.random() < .5 ? inMeinerHand() : nichtInMeinerHand())),
    team:      vielleichtImpuls(alltag),
    entdecken: vielleichtImpuls(werSagts)
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

/* ================= Höhere Etappen: Mittelstufe bis Erwachsene ================= */

/* ---------------- Gleichungen ---------------- */
gleichungen: (() => {
  const linear = lvl => { const x = r(2, 6+lvl*3), a = r(2, 4+lvl), b = r(1, 10+lvl*5);
    return zahlText(`🧠 Löse nach x auf:\n${a}x + ${b} = ${a*x+b}`, x, `Erst ${b} abziehen, dann durch ${a} teilen.`); };
  const mitKlammer = lvl => { const x = r(2, 5+lvl*2), a = r(2,5), b = r(1,8);
    return zahlText(`🧠 Löse nach x auf:\n${a}(x + ${b}) = ${a*(x+b)}`, x,
      `Durch ${a} teilen, dann ${b} abziehen – oder zuerst ausmultiplizieren.`); };
  const beidseitig = lvl => {
    // a·x + b = c·x + d  mit derselben Lösung x auf beiden Seiten
    const x = r(2, 8+lvl*2), a = r(3,9), c = r(1, a-1), b = r(1,12);
    const d = (a - c) * x + b;          // aus a·x + b = c·x + d folgt d = (a−c)·x + b
    return zahlText(`🧠 Löse nach x auf:\n${a}x + ${b} = ${c}x + ${d}`, x,
      `Alle x auf eine Seite: ${a-c}x = ${d - b}.`);
  };
  const quadratisch = lvl => { const x1 = r(1,7), x2 = r(1,7);
    const p = -(x1 + x2), q = x1 * x2;
    return { ...wahl(`🧠 Löse die Gleichung:\nx² ${p >= 0 ? '+ '+p : '- '+Math.abs(p)}x ${q >= 0 ? '+ '+q : '- '+Math.abs(q)} = 0`,
      x1 === x2 ? `x = ${x1}` : `x = ${Math.min(x1,x2)} und x = ${Math.max(x1,x2)}`,
      [`x = ${x1+1} und x = ${x2+2}`, `x = ${-x1} und x = ${-x2}`, 'keine Lösung'],
      'p-q-Formel oder Satz von Vieta: Die Lösungen ergeben addiert −p und multipliziert q.') };
  };
  const alsCode = lvl => { const x = r(2, 9+lvl*2), a = r(2,6), b = r(1,12);
    return zahlText(`🤖 Ein Programm rechnet:\n  eingabe x\n  ergebnis = x * ${a} + ${b}\n  zeige ergebnis   →  ${a*x+b}\nWelche Zahl wurde eingegeben?`,
      x, 'Rückwärts rechnen: Zahl abziehen, dann teilen.'); };
  /* Echte Sachaufgaben: Text und Lösung stammen aus derselben Rechnung.
     (Der frühere Generator würfelte Geschichte und Gleichung getrennt –
     dabei entstanden Aufgaben, die keine richtige Antwort hatten.) */
  const SACHAUFGABEN = [
    // Alter: x + a = 2·(x − b)  ⇒  x = a + 2b
    lvl => { const a = r(1,5), b = r(2,6), x = a + 2*b, n = pick(NAMEN);
      return zahlText(
        `📖 ${n} sagt: „In ${a} ${a===1?'Jahr':'Jahren'} bin ich doppelt so alt wie vor ${b} ${b===1?'Jahr':'Jahren'}.“\nWie alt ist ${n} heute?`,
        x, `x + ${a} = 2 · (x − ${b}).  Ausmultipliziert: x + ${a} = 2x − ${2*b}.`); },

    // Geschwister: x + k·x = summe
    lvl => { const k = pick([2,3,4]), klein = r(3,12), summe = klein + k*klein, n = pick(NAMEN);
      return zahlText(
        `📖 ${n} ist ${k}-mal so alt wie die kleine Schwester.\nZusammen sind sie ${summe} Jahre alt.\nWie alt ist die Schwester?`,
        klein, `x + ${k}x = ${summe}, also ${k+1}x = ${summe}.`); },

    // Einkauf: n·preis + rest = gesamt
    lvl => { const stueck = r(3,7), preis = r(2,9), rest = r(1,15), n = pick(NAMEN);
      return zahlText(
        `📖 ${n} kauft ${stueck} Hefte und außerdem einen Stift für ${rest} €.\nZusammen bezahlt ${n} ${stueck*preis + rest} €.\nWas kostet ein Heft?`,
        preis, `${stueck}x + ${rest} = ${stueck*preis + rest}.`); },

    // Ungleiche Verteilung: zwei Teile, einer um d größer
    lvl => { const kleiner = r(4,20), d = r(2,10), gesamt = 2*kleiner + d;
      return zahlText(
        `📖 Zwei Kinder teilen ${gesamt} Murmeln.\nDas eine bekommt ${d} Murmeln mehr als das andere.\nWie viele bekommt das Kind mit den wenigeren?`,
        kleiner, `x + (x + ${d}) = ${gesamt}, also 2x = ${gesamt - d}.`); },

    // Rechteck: Länge doppelt so lang wie Breite, Umfang gegeben
    lvl => { const breite = r(3,15), umfang = 2*(breite + 2*breite);
      return zahlText(
        `📖 Ein Rechteck ist doppelt so lang wie breit.\nSein Umfang beträgt ${umfang} cm.\nWie breit ist es?`,
        breite, `2·(x + 2x) = ${umfang}, also 6x = ${umfang}.`); },

    // Sparen: Startbetrag plus Wochen mal Rate
    lvl => { const start = r(5,40), rate = r(2,10), wochen = r(3,9), n = pick(NAMEN);
      return zahlText(
        `📖 ${n} hat ${start} € gespart und legt jede Woche ${rate} € dazu.\nNach wie vielen Wochen sind es ${start + rate*wochen} €?`,
        wochen, `${start} + ${rate}x = ${start + rate*wochen}.`); },

    // Zahlenrätsel: das Doppelte einer Zahl, vermindert um c
    lvl => { const x = r(4,30), c = r(3,15);
      return zahlText(
        `📖 Ich denke mir eine Zahl. Ihr Doppeltes, vermindert um ${c}, ergibt ${2*x - c}.\nWelche Zahl ist es?`,
        x, `2x − ${c} = ${2*x - c}.`); }
  ];
  const geschichte = lvl => pick(SACHAUFGABEN)(lvl);

  return {
    knobeln:   lvl => (lvl >= 4 ? pick([quadratisch, beidseitig])(lvl) : pick([linear, mitKlammer])(lvl)),
    bauen:     lvl => mitKlammer(lvl),
    erzaehlen: lvl => geschichte(lvl),
    code:      lvl => alsCode(lvl)
  };
})(),

/* ---------------- Prozent, Zins und Zinseszins ---------------- */
zinsen: (() => {
  const prozentwert = lvl => { const g = pick([80,120,240,350,480,750,1200]), p = pick([5,10,12,15,20,25]);
    return zahlText(`💯 ${p} % von ${g} € sind wie viel?`, g*p/100, `${g} ÷ 100 × ${p}`); };
  const rabatt = lvl => { const preis = pick([40,60,80,120,150,200]), p = pick([10,15,20,25,30]);
    return zahlText(`🛒 Ein Artikel kostet ${preis} € und wird um ${p} % reduziert.\nWas kostet er jetzt?`,
      preis*(100-p)/100, `Neuer Preis = ${100-p} % des alten Preises.`); };
  const grundwert = lvl => { const g = pick([200,400,500,800,1500]), p = pick([5,10,20,25]);
    return zahlText(`🧠 ${g*p/100} € sind ${p} % von welchem Betrag?`, g,
      'Prozentwert ÷ Prozentsatz × 100.'); };
  const zinseszins = lvl => { const k = pick([1000,2000,5000]), p = pick([2,3,5]), jahre = pick([2,3]);
    const end = Math.round(k * Math.pow(1 + p/100, jahre) * 100) / 100;
    return zahlChoice(`📈 ${k} € liegen ${jahre} Jahre lang zu ${p} % Zinsen – die Zinsen bleiben auf dem Konto.\nWie viel ist am Ende da? (auf Euro gerundet)`,
      Math.round(end), Math.max(20, Math.round(k*0.02)),
      `Jedes Jahr wird mit ${1 + p/100} multipliziert: ${k} × ${(1+p/100)}^${jahre}`); };
  const verdopplung = lvl => { const p = pick([2,3,4,6,8]);
    const jahre = Math.round(72/p);
    return zahlChoice(`📈 Faustregel der Kaufleute: Bei ${p} % Zinsen – nach wie vielen Jahren hat sich das Geld ungefähr verdoppelt?`,
      jahre, 6, 'Die 72er-Regel: 72 geteilt durch den Zinssatz.'); };
  const aufteilen = lvl => { const gesamt = pick([120,240,360,600]), teile = pick([3,4,5,6]);
    return zahlText(`🤝 ${gesamt} € werden auf ${teile} Personen gleich verteilt.\nWie viel Prozent bekommt jede Person?`,
      Math.round(100/teile*100)/100, `100 % ÷ ${teile}`); };
  return {
    knobeln:   lvl => (lvl >= 3 ? pick([grundwert, zinseszins, verdopplung])(lvl) : pick([prozentwert, rabatt])(lvl)),
    erzaehlen: lvl => rabatt(lvl),
    bauen:     lvl => prozentwert(lvl),
    team:      lvl => aufteilen(lvl)
  };
})(),

/* ---------------- Wahrscheinlichkeit ---------------- */
stochastik: (() => {
  const wuerfel = lvl => { const ziel = r(2,6);
    return wahl(`🎲 Wie groß ist die Wahrscheinlichkeit, mit einem Würfel eine ${ziel} zu würfeln?`,
      '1/6', ['1/3','1/2','6/6'], 'Ein günstiger Fall von sechs möglichen.'); };
  const zweiWuerfel = lvl => {
    const summe = pick([2,7,12]);
    const anzahl = { 2:1, 7:6, 12:1 }[summe];
    return wahl(`🎲 Zwei Würfel werden geworfen. Wie wahrscheinlich ist die Augensumme ${summe}?`,
      `${anzahl}/36`, ['1/12','1/6','1/2'].filter(x => x !== `${anzahl}/36`).slice(0,3),
      'Es gibt 36 mögliche Kombinationen. Zähle die günstigen.'); };
  const kombinatorik = lvl => { const n = r(4, 4+lvl);
    const f = x => x <= 1 ? 1 : x * f(x-1);
    return zahlChoice(`🧮 Auf wie viele Arten können sich ${n} Personen in einer Reihe aufstellen?`,
      f(n), Math.max(10, f(n)/3), `${n}! = ${Array.from({length:n},(_,i)=>n-i).join(' × ')}`); };
  const ziehen = lvl => { const rot = r(3,6), blau = r(2,5);
    return wahl(`🧱 In einem Beutel liegen ${rot} rote und ${blau} blaue Kugeln.\nWie wahrscheinlich ist es, eine rote zu ziehen?`,
      `${rot}/${rot+blau}`, [`${blau}/${rot+blau}`, `${rot}/${blau}`, '1/2'],
      'Günstige Fälle geteilt durch alle Fälle.'); };
  const geburtstag = () =>
    wahl('🔎 Wie viele Personen braucht es, damit die Wahrscheinlichkeit über 50 % liegt,\ndass zwei am selben Tag Geburtstag haben?',
      '23', ['183','100','60'],
      'Das Geburtstagsparadox: Nicht die Zahl der Personen zählt, sondern die Zahl der Paare – bei 23 Personen sind das schon 253.');
  const gegenwahrscheinlich = lvl =>
    wahl('🧠 Eine Münze wird dreimal geworfen. Wie wahrscheinlich ist mindestens einmal Kopf?',
      '7/8', ['1/2','3/4','1/8'],
      'Über das Gegenteil rechnen: dreimal Zahl hat die Wahrscheinlichkeit 1/8, also bleibt 7/8.');
  return {
    knobeln:   lvl => (lvl >= 3 ? pick([zweiWuerfel, gegenwahrscheinlich, kombinatorik])(lvl) : pick([wuerfel, ziehen])(lvl)),
    bauen:     lvl => ziehen(lvl),
    erzaehlen: lvl => wuerfel(lvl),
    entdecken: () => geburtstag()
  };
})(),

/* ---------------- Analysis ---------------- */
analysis: (() => {
  const vor = n => (n === 1 ? '' : n === -1 ? '-' : String(n));
  const term = (a,b,c) => `f(x) = ${vor(a)}x³ ${b>=0?'+ '+vor(b):'- '+vor(Math.abs(b))}x² ${c>=0?'+ '+c:'- '+Math.abs(c)}x`;
  const ableitung = lvl => { const a = r(1,4), b = r(-5,5), c = r(-6,6);
    const abl = `${vor(3*a)}x² ${2*b>=0?'+ '+vor(2*b):'- '+vor(Math.abs(2*b))}x ${c>=0?'+ '+c:'- '+Math.abs(c)}`;
    const falsch = [`${a}x² ${b>=0?'+ '+b:'- '+Math.abs(b)}x + ${c}`,
                    `${3*a}x² ${b>=0?'+ '+b:'- '+Math.abs(b)}x + ${c}`,
                    `${3*a}x³ ${2*b>=0?'+ '+2*b:'- '+Math.abs(2*b)}x² + ${c}x`];
    return wahl(`📐 Bilde die erste Ableitung:\n${term(a,b,c)}`, `f'(x) = ${abl}`,
      falsch.map(f => `f'(x) = ${f}`),
      'Potenzregel: Der Exponent kommt nach vorn, dann wird er um eins kleiner.'); };
  const steigung = lvl => { const a = r(1,3), b = r(-4,4), x0 = r(1,4);
    const wert = 2*a*x0 + b;   // f(x)=a x^2 + b x -> f'(x)=2ax+b
    return zahlText(`📐 f(x) = ${a}x² ${b>=0?'+ '+b:'- '+Math.abs(b)}x\nWelche Steigung hat der Graph an der Stelle x = ${x0}?`,
      wert, `Zuerst ableiten: f'(x) = ${2*a}x ${b>=0?'+ '+b:'- '+Math.abs(b)}, dann x = ${x0} einsetzen.`); };
  const extremstelle = lvl => { const s = r(1,6), a = r(1,3);
    // f(x) = a(x-s)^2  -> Minimum bei x = s
    return zahlText(`📐 Eine nach oben geöffnete Parabel hat die Gleichung f(x) = ${a}(x − ${s})².\nAn welcher Stelle liegt ihr Tiefpunkt?`,
      s, 'Der Scheitel liegt dort, wo die Klammer null wird.'); };
  const alsCode = lvl => {
    const a = r(2, 9), c = r(2, 12);
    return Math.random() < .5
      ? zahlText(`🤖 Ein Programm leitet f(x) = ${c}·x^${a} nach der Potenzregel ab.\nWelchen Vorfaktor gibt es aus?`,
          c*a, `Aus ${c}·x^${a} wird ${c*a}·x^${a-1}.`)
      : zahlText(`🤖 Ein Programm leitet f(x) = x^${a} ab und setzt danach x = 1 ein.\nWelchen Wert gibt es aus?`,
          a, `f'(x) = ${a}·x^${a-1}, für x = 1 bleibt ${a}.`);
  };
  return {
    knobeln: lvl => (lvl >= 3 ? pick([ableitung, steigung])(lvl) : steigung(lvl)),
    bauen:   lvl => extremstelle(lvl),
    code:    lvl => alsCode(lvl)
  };
})(),

/* ---------------- Stilmittel ---------------- */
stilmittel: (() => {
  const eins = () => { const st = pick(STILMITTEL);
    return { ...wahl(`✒️ Welches Stilmittel steckt darin?\n\n${st.q}`, st.ok, st.bad, st.erklaerung),
      quelle: st.erklaerung }; };
  const umgekehrt = () => { const st = pick(STILMITTEL);
    const andere = shuffle(STILMITTEL.filter(x => x.ok !== st.ok)).slice(0,3);
    return { ...wahl(`🔎 Welches Beispiel ist eine ${st.ok}?`, st.q, andere.map(a => a.q), st.erklaerung),
      quelle: st.erklaerung }; };
  return { erzaehlen: eins, knobeln: eins, entdecken: umgekehrt };
})(),

/* ---------------- Wortwurzeln ---------------- */
wortwurzel: (() => {
  const bedeutung = () => { const w = pick(WORTWURZELN);
    return { ...wahl(`🔎 ${w.frage}`, w.ok, w.bad, `Wie in „${w.beispiel}“.`), quelle:`${w.wurzel} – ${w.herkunft}` }; };
  const zusammensetzen = () => {
    const a = pick(WORTWURZELN.filter(w => !w.wurzel.startsWith('-')));
    const b = pick(WORTWURZELN.filter(w => w.wurzel.startsWith('-')));
    return { ...wahl(`🧱 Was würde ein Wort aus „${a.wurzel}“ und „${b.wurzel}“ ungefähr bedeuten?`,
      `${a.ok} + ${b.ok}`, [`${b.ok} + Zahl`, `Gegenteil von ${a.ok}`, `${a.ok} ohne Bedeutung`],
      'Setze die beiden Bedeutungen einfach hintereinander.'),
      quelle:`${a.wurzel}: ${a.herkunft} · ${b.wurzel}: ${b.herkunft}` }; };
  const herkunft = () => { const w = pick(WORTWURZELN);
    const andere = shuffle(WORTWURZELN.filter(x => x.wurzel !== w.wurzel)).slice(0,3);
    return { ...wahl(`📖 In welchem Wort steckt „${w.wurzel}“?`, w.beispiel, andere.map(a => a.beispiel),
      w.herkunft), quelle:`${w.wurzel} – ${w.herkunft}` }; };
  return { entdecken: bedeutung, knobeln: bedeutung, bauen: zusammensetzen, erzaehlen: herkunft };
})(),

/* ---------------- Formale Logik ---------------- */
logikformal: (() => {
  const pruefen = () => { const sy = pick(SYLLOGISMEN);
    return { ...wahl(`🧠 Ist dieser Schluss gültig?\n\n${sy.praemissen}\nAlso: ${sy.schluss}`,
      sy.gueltig ? 'Ja, der Schluss ist gültig' : 'Nein, der Schluss ist ungültig',
      [sy.gueltig ? 'Nein, der Schluss ist ungültig' : 'Ja, der Schluss ist gültig'],
      'Gültig heißt: Wenn die Voraussetzungen wahr sind, MUSS der Schluss wahr sein.'),
      quelle: sy.erklaerung }; };
  const negation = () => {
    const paare = [
      ['Alle Schwäne sind weiß.', 'Mindestens ein Schwan ist nicht weiß.',
       ['Kein Schwan ist weiß.','Alle Schwäne sind schwarz.','Einige Schwäne sind weiß.']],
      ['Es regnet und es ist kalt.', 'Es regnet nicht oder es ist nicht kalt.',
       ['Es regnet nicht und es ist nicht kalt.','Es ist warm und trocken.','Es regnet immer.']],
      ['Kein Kind mag Spinat.', 'Mindestens ein Kind mag Spinat.',
       ['Alle Kinder mögen Spinat.','Einige Kinder mögen keinen Spinat.','Spinat mag keiner.']],
      ['Jeder Schüler hat ein Buch dabei.', 'Mindestens ein Schüler hat kein Buch dabei.',
       ['Kein Schüler hat ein Buch dabei.','Alle haben mehrere Bücher.','Einige haben ein Buch.']],
      ['Es ist warm oder es ist trocken.', 'Es ist nicht warm und nicht trocken.',
       ['Es ist kalt oder nass.','Es ist warm und trocken.','Es ist nicht warm oder nicht trocken.']],
      ['Wenn es klingelt, ist die Pause vorbei.', 'Es klingelt, und die Pause ist nicht vorbei.',
       ['Wenn es nicht klingelt, ist die Pause nicht vorbei.','Die Pause ist vorbei, ohne dass es klingelt.','Es klingelt nie.']],
      ['Einige Vögel können nicht fliegen.', 'Alle Vögel können fliegen.',
       ['Kein Vogel kann fliegen.','Einige Vögel können fliegen.','Alle Vögel sind Pinguine.']],
      ['Alle Zahlen in der Liste sind gerade.', 'Mindestens eine Zahl in der Liste ist ungerade.',
       ['Alle Zahlen sind ungerade.','Keine Zahl ist gerade.','Einige Zahlen sind gerade.']],
      ['Niemand hat den Raum verlassen.', 'Mindestens eine Person hat den Raum verlassen.',
       ['Alle haben den Raum verlassen.','Einige sind geblieben.','Der Raum war leer.']]
    ];
    const [satz, ok, bad] = pick(paare);
    return { ...wahl(`🧠 Wie lautet die logische Verneinung von:\n„${satz}“`, ok, bad,
      'Die Verneinung von „alle“ ist nicht „keiner“, sondern „mindestens einer nicht“.'),
      quelle:'De Morgansche Regeln und die Verneinung von Quantoren.' }; };
  const wenn_dann = () => {
    const f = [
      ['Wenn A, dann B. A ist wahr.', 'B ist wahr', 'Modus ponens – gültig.'],
      ['Wenn A, dann B. B ist falsch.', 'A ist falsch', 'Modus tollens – gültig.'],
      ['Wenn A, dann B. B ist wahr.', 'Daraus folgt nichts über A', 'Bejahung des Nachsatzes – ungültiger Schluss.'],
      ['Wenn A, dann B. A ist falsch.', 'Daraus folgt nichts über B', 'Verneinung des Vordersatzes – ungültiger Schluss.']
    ];
    const [pr, ok, erkl] = pick(f);
    const alle = ['B ist wahr','A ist falsch','Daraus folgt nichts über A','Daraus folgt nichts über B'];
    return { ...wahl(`🧱 ${pr}\nWas folgt daraus zwingend?`, ok,
      alle.filter(x => x !== ok).slice(0,3), 'Prüfe, ob es einen Gegenfall geben kann.'), quelle: erkl }; };
  return { knobeln: pruefen, bauen: wenn_dann, erzaehlen: negation };
})(),

/* ---------------- Denkfehler ---------------- */
denkfehler: (() => {
  const eins = () => { const d = pick(DENKFEHLER);
    return { ...wahl(`🧠 ${d.q}`, d.ok, d.bad, d.erklaerung), quelle: d.erklaerung }; };
  const benennen = () => { const d = pick(DENKFEHLER);
    const andere = shuffle(DENKFEHLER.filter(x => x.name !== d.name)).slice(0,3);
    return { ...wahl(`🔎 Welcher Denkfehler wird hier beschrieben?\n\n${d.erklaerung.split('.')[0]}.`,
      d.name, andere.map(a => a.name), 'Achte darauf, wo genau das Urteil kippt.'), quelle: d.erklaerung }; };
  return { knobeln: eins, entdecken: benennen, team: eins, erzaehlen: benennen };
})(),

/* ---------------- Argumente prüfen ---------------- */
argumente: (() => {
  const eins = () => { const f = pick(FEHLSCHLUESSE);
    return { ...wahl(`⚖️ ${f.q}`, f.ok, f.bad, f.erklaerung), quelle: f.erklaerung }; };
  return { knobeln: eins, team: eins, erzaehlen: eins };
})(),

/* ---------------- Hauptwerke ---------------- */
hauptwerke: (() => {
  const fuerEtappe = lvl => {
    // Level 1-5 der Aufgabe entspricht grob der Etappe des Kindes
    const menge = HAUPTWERKE.filter(w => Math.abs(w.etappe - lvl) <= 1);
    return menge.length >= 4 ? menge : HAUPTWERKE;
  };
  const werSchrieb = lvl => { const menge = fuerEtappe(lvl), w = pick(menge);
    const andere = shuffle(menge.filter(x => x.autor !== w.autor)).slice(0,3);
    return { ...wahl(`📚 Wer schuf „${w.werk}“?`, w.autor, andere.map(a => a.autor),
      w.worum), quelle:`${w.autor}, „${w.werk}“ (${w.jahr < 0 ? Math.abs(w.jahr)+' v. Chr.' : w.jahr}). ${w.worum}` }; };
  const worumGehtEs = lvl => { const menge = fuerEtappe(lvl), w = pick(menge);
    const andere = shuffle(menge.filter(x => x.werk !== w.werk)).slice(0,3);
    return { ...wahl(`📖 Worum geht es in „${w.werk}“?`, w.worum, andere.map(a => a.worum),
      `Verfasst von ${w.autor}.`), quelle:`${w.autor}, ${w.jahr < 0 ? Math.abs(w.jahr)+' v. Chr.' : w.jahr}` }; };
  const welchesWerk = lvl => { const menge = fuerEtappe(lvl), w = pick(menge);
    const andere = shuffle(menge.filter(x => x.autor !== w.autor)).slice(0,3);
    return { ...wahl(`🔎 Welches Werk stammt von ${w.autor}?`, w.werk, andere.map(a => a.werk),
      w.worum), quelle:`${w.werk} (${w.jahr < 0 ? Math.abs(w.jahr)+' v. Chr.' : w.jahr}), Gebiet: ${w.gebiet}` }; };
  const wannEntstanden = lvl => { const menge = fuerEtappe(lvl).filter(w => w.jahr > 1400), w = pick(menge.length ? menge : HAUPTWERKE.filter(x=>x.jahr>1400));
    const jh = Math.floor(w.jahr/100) + 1;
    const falsche = [jh-1, jh+1, jh-2].filter(x => x > 0 && x !== jh).slice(0,3);
    return { ...wahl(`🤝 Aus welchem Jahrhundert stammt „${w.werk}“ von ${w.autor}?`,
      `${jh}. Jahrhundert`, falsche.map(x => `${x}. Jahrhundert`),
      'Rechne: Jahreszahl durch 100, dann eins dazu.'), quelle:`Erschienen ${w.jahr}. ${w.worum}` }; };
  return {
    erzaehlen: worumGehtEs, entdecken: welchesWerk, knobeln: werSchrieb, team: wannEntstanden
  };
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
