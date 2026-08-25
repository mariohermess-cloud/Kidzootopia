/* Prüft die fachliche Zeichenauswertung: Reagieren die Maße auf das, was sie
   messen sollen – und nur darauf? Jede Größe wird gegen ihr Gegenteil geprüft. */
import * as K from '../js/kunstanalyse.js';

const fehler = [];
const pruefe = (name, bedingung, zusatz='') => {
  console.log(`${bedingung ? '✅' : '❌'} ${name}${zusatz ? ' – ' + zusatz : ''}`);
  if (!bedingung) fehler.push(name);
};

const linie = (n, stoerung = 0, takt = 16) =>
  [Array.from({length:n},(_,i)=>({ x:.1+i*.008, y:.5+(Math.random()-.5)*stoerung,
                                   t:i*takt, d:.5 }))];
const kreisbogen = (anteil = 1) => [Array.from({length:Math.round(60*anteil)},(_,i)=>{
  const t = i/59*2*Math.PI; return { x:.5+.2*Math.cos(t), y:.5+.2*Math.sin(t), t:i*16, d:.5 }; })];

/* 1. Linienruhe unterscheidet geführte von zittriger Linie */
const ruhig = K.linienruhe(linie(90, 0)).wert;
const zittrig = K.linienruhe(linie(90, .03)).wert;
pruefe('Linienruhe trennt ruhig von zittrig', ruhig > 80 && zittrig < 40, `${ruhig} vs ${zittrig}`);

/* 2. Fluss reagiert auf Stocken, nicht auf Tempo an sich */
const gleich = K.fluss(linie(90, 0, 16)).wert;
const schnell = K.fluss(linie(90, 0, 8)).wert;
const stockend = K.fluss([linie(90,0,16)[0].map((p,i)=>({...p, t: p.t + (i%8===0 ? 180 : 0)}))]).wert;
pruefe('Fluss ist tempounabhängig', Math.abs(gleich - schnell) <= 5, `${gleich} vs ${schnell}`);
pruefe('Fluss erkennt Stocken', stockend < gleich, `${stockend} < ${gleich}`);

/* 3. Geschlossenheit erkennt offene Formen */
const zu = K.geschlossenheit(kreisbogen(1)).wert;
const offen = K.geschlossenheit(kreisbogen(.6)).wert;
pruefe('Geschlossenheit trennt zu von offen', zu > 85 && offen < 40, `${zu} vs ${offen}`);

/* 4. Proportion erkennt Verzerrung, nicht Größe */
const vorlage = [[{x:.2,y:.2},{x:.8,y:.2},{x:.8,y:.8},{x:.2,y:.8},{x:.2,y:.2}]];
const kleiner = [vorlage[0].map(p=>({x:.35+(p.x-.2)*.5, y:.35+(p.y-.2)*.5}))];
const verzerrt = [vorlage[0].map(p=>({x:p.x, y:.35+(p.y-.2)*.4}))];
const pKlein = K.proportion(vorlage, kleiner).wert, pVerzerrt = K.proportion(vorlage, verzerrt).wert;
pruefe('Proportion ist größenunabhängig', pKlein > 90, String(pKlein));
pruefe('Proportion erkennt Verzerrung', pVerzerrt < 60, String(pVerzerrt));

/* 5. Ökonomie zählt überzählige Ansätze */
const oek1 = K.oekonomie(vorlage, [vorlage[0]]).wert;
const oek5 = K.oekonomie(vorlage, Array.from({length:6},()=>vorlage[0])).wert;
pruefe('Ökonomie bestraft viele Ansätze', oek1 === 100 && oek5 < 60, `${oek1} vs ${oek5}`);

/* 6. Entwicklungsstufen folgen Kellogg/Luquet */
const stufen = [
  ['nur Striche', K.entwicklungsstufe([[{x:.1,y:.1},{x:.9,y:.9}]], {titel:''}).name, 'Kritzelstufe'],
  ['eine Form',   K.entwicklungsstufe(kreisbogen(1), {titel:''}).name, 'Formstufe'],
  ['zwei Formen', K.entwicklungsstufe([...kreisbogen(1), ...kreisbogen(1)], {titel:''}).name, 'Kombinationsstufe'],
  ['benannt',     K.entwicklungsstufe(kreisbogen(1), {titel:'Mein Roboter'}).name, 'Vorschematische Stufe']
];
for (const [was, ist, soll] of stufen) pruefe(`Entwicklungsstufe: ${was}`, ist === soll, `${ist}`);

/* 7. Originalität nach Häufigkeit, nicht nach Geschmack */
const auftrag = 'Verwandle einen Kreis in etwas ganz anderes.';
pruefe('Originalität: häufige Idee', K.originalitaet(auftrag,'Sonne').urteil === 'naheliegend');
pruefe('Originalität: seltene Idee', K.originalitaet(auftrag,'Zeitmaschine').urteil === 'selten');

/* 8. Torrance-Profil zählt Ideen und Bereiche */
const kp = K.kreativProfil([{titel:'Hund'},{titel:'Rakete'},{titel:'Traum'},{titel:'Katze'}]);
pruefe('Flüssigkeit zählt Einfälle', kp.fluessigkeit === 4, String(kp.fluessigkeit));
pruefe('Flexibilität zählt Bereiche', kp.flexibilitaet === 3, kp.bereiche.join(','));

/* 9. Menschzeichnung: Einordnung, keine Note */
const m = K.menschAuswertung(12, 1);
pruefe('Menschzeichnung ordnet ein', m.lage === 'im erwarteten Bereich', `${m.anzahl} Merkmale`);
pruefe('Menschzeichnung warnt vor Überdeutung', /keine Aussage über Begabung/i.test(m.warnung));
pruefe('Merkmalsliste vollständig', K.MENSCH_MERKMALE.length === 20);

/* 10. Gesamtprofil liefert bei Vorlage und bei freier Arbeit das Passende */
const mitVorlage = K.analysiere(kreisbogen(1), { vorlage: kreisbogen(1) });
const frei = K.analysiere(kreisbogen(1), { titel:'Ball', auftrag });
pruefe('Vorlagen-Analyse enthält Formtreue', !!mitVorlage.proportion && !mitVorlage.entwicklung);
pruefe('Freie Analyse enthält Entwicklungsstufe', !!frei.entwicklung && !frei.proportion);

if (fehler.length) { console.error('\nFEHLER:\n' + fehler.join('\n')); process.exit(1); }
console.log('\nZeichenauswertung arbeitet wie beschrieben ✅');
