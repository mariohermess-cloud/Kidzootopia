/* Prueft die Lernschleife: Ein simuliertes Kind loest Aufgaben ueber den
   Rhythmus-Weg zuverlaessig und ueber den Knobel-Weg schlecht – obwohl der
   Talent-Test das Gegenteil nahelegte. Die App muss das erkennen und ihre
   Wegwahl umstellen. */
import { ZIEL_MAP } from '../js/data.js';
import { auswerten } from '../js/talenttest.js';

/* localStorage fuer Node nachbilden */
const speicher = new Map();
globalThis.localStorage = {
  getItem: k => speicher.get(k) ?? null,
  setItem: (k,v) => speicher.set(k,v),
  removeItem: k => speicher.delete(k)
};

const S = await import('../js/store.js');
const E = await import('../js/engine.js');

S.laden();
const kind = S.neuesProfil({ name:'Testkind', avatar:'🦊', klasse:3 });

/* Test sagt: Logik stark, Musik schwach */
S.testAuswerten(kind, {
  likert: [
    { t:'logik', v:4 }, { t:'logik', v:4 },
    { t:'musik', v:1 }, { t:'musik', v:1 },
    { t:'sprache', v:2 }, { t:'raum', v:2 }, { t:'technik', v:2 },
    { t:'bewegung', v:2 }, { t:'natur', v:2 }, { t:'sozial', v:2 }
  ]
});
const vorher = S.talentWerte(kind);
const rangVorher = E.wegRanking(kind, ZIEL_MAP.einmaleins);
console.log('Nach dem Test  – Logik:', vorher.logik, '| Musik:', vorher.musik);
console.log('Bevorzugter Weg laut Test:', rangVorher[0]);

/* Die Praxis widerspricht: Rhythmus laeuft gut und schnell, Knobeln schlecht und langsam */
for (let i = 0; i < 40; i++) {
  S.verbuche(kind, { zielId:'einmaleins', weg:'rhythmus', level:2, richtig: i % 10 !== 0, ms: 6000 });
  S.verbuche(kind, { zielId:'einmaleins', weg:'knobeln',  level:2, richtig: i % 3 === 0, ms: 20000 });
}

const nachher = S.talentWerte(kind);
const rhythmus = S.wegWirksamkeit(kind, 'rhythmus');
const knobeln  = S.wegWirksamkeit(kind, 'knobeln');
const rangNachher = E.wegRanking(kind, ZIEL_MAP.einmaleins);

console.log('Gemessen – Rhythmus-Weg:', rhythmus.wert + ' %', '| Knobel-Weg:', knobeln.wert + ' %');
console.log('Talentwerte danach – Logik:', nachher.logik, '| Musik:', nachher.musik);
console.log('Bevorzugter Weg jetzt:', rangNachher[0]);

const fehler = [];
if (rhythmus.wert <= knobeln.wert) fehler.push('Wirksamkeit unterscheidet die Wege nicht');
if (rangNachher[0] !== 'rhythmus') fehler.push('Wegwahl folgt nicht der gemessenen Wirksamkeit');
if (nachher.musik <= vorher.musik) fehler.push('Talentwert Musik steigt nicht durch gezeigte Leistung');
if (nachher.logik >= vorher.logik) fehler.push('Talentwert Logik sinkt nicht trotz schwacher Leistung');

/* Brueckenaufgaben muessen trotzdem vorkommen */
let bruecken = 0;
for (let i = 0; i < 200; i++) if (E.waehleWeg(kind, ZIEL_MAP.einmaleins).bruecke) bruecken++;
console.log('Brückenanteil bei 200 Auswahlen:', Math.round(bruecken/2) + ' %');
if (bruecken < 20 || bruecken > 60) fehler.push('Brückenanteil außerhalb des erwarteten Bereichs');

/* Auswertung ohne alle Teile muss trotzdem funktionieren */
const nurProben = auswerten({ proben:[{ t:'raum', richtig:true, ms:3000 }] });
if (Object.keys(nurProben.werte).length !== 8) fehler.push('Auswertung mit nur einem Teil unvollständig');

if (fehler.length) { console.error('\nFEHLER:\n' + fehler.join('\n')); process.exit(1); }
console.log('\nLernschleife funktioniert ✅');
