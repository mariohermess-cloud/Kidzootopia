/* Prueft das Punktesystem - vor allem darauf, dass es nicht zurueckschlaegt.

   Ein Punktesystem kann Lernen befoerdern oder zerstoeren. Es zerstoert es,
   wenn sich das Leichte mehr lohnt als das Schwere, wenn Fehler bestrafen,
   oder wenn unbewertete Aufgaben gar nichts geben - dann fasst sie niemand
   mehr an. Genau diese drei Faelle stehen hier im Mittelpunkt. */

import { punkteFuer, rang, rundenBlick, rangliste, etwaAufgaben,
         RAENGE, BODEN, FUERS_MACHEN } from '../js/punkte.js';

let fehler = 0;
const pruefe = (bedingung, text) => {
  console.log(`${bedingung ? '✅' : '❌'} ${text}`);
  if (!bedingung) fehler++;
};

/* ------------------------------------------------- Nie Abzug, nie Minuspunkte */

pruefe(punkteFuer({ richtig: false }) === 0, 'eine falsche Antwort gibt null Punkte');
pruefe(punkteFuer({ richtig: false, level: 5, tipps: 3 }) === 0,
  'auch mit vielen Tipps und hoher Stufe: null, nie negativ');

const alleFaelle = [];
for (let lvl = 1; lvl <= 5; lvl++)
  for (let t = 0; t <= 5; t++)
    for (let s = 0; s <= 10; s++)
      for (const r of [true, false])
        alleFaelle.push(punkteFuer({ richtig: r, level: lvl, tipps: t, serie: s }));
pruefe(alleFaelle.every(p => p >= 0), 'in keinem einzigen Fall gibt es Minuspunkte');

/* ---------------------------------------------- Schweres lohnt sich mehr */

const stufen = [1,2,3,4,5].map(l => punkteFuer({ richtig: true, level: l }));
pruefe(stufen.every((p, i) => i === 0 || p > stufen[i-1]),
  `höhere Stufe gibt mehr Punkte (${stufen.join(' → ')})`);
pruefe(stufen[4] > stufen[0] * 1.5,
  `Stufe 5 lohnt sich deutlich mehr als Stufe 1 (${stufen[0]} gegen ${stufen[4]})`);

/* ------------------------------------------- Tipps kosten, aber nicht alles */

const mitTipps = [0,1,2,3,4,5].map(t => punkteFuer({ richtig: true, level: 3, tipps: t }));
pruefe(mitTipps.every((p, i) => i === 0 || p <= mitTipps[i-1]),
  `mehr Tipps geben nicht mehr Punkte (${mitTipps.join(' → ')})`);
pruefe(mitTipps.every(p => p >= BODEN),
  `auch mit allen Tipps bleibt ein Boden von ${BODEN} – Hilfe holen ist besser als aufgeben`);
pruefe(mitTipps[0] > mitTipps[5],
  'ohne Tipps gibt es mehr als mit allen');

/* ------------------------------------ Unbewertetes ist kein totes Gleis */

const denkImpuls = punkteFuer({ keineWertung: true });
pruefe(denkImpuls === FUERS_MACHEN && denkImpuls > 0,
  `unbewertete Aufgaben geben Punkte fürs Machen (${denkImpuls})`);
pruefe(denkImpuls < punkteFuer({ richtig: true, level: 1 }),
  'aber weniger als eine gelöste Aufgabe – sonst wäre Nachdenken der billigste Weg');
pruefe(punkteFuer({ keineWertung: true, richtig: false }) === FUERS_MACHEN,
  'bei unbewerteten Aufgaben spielt richtig/falsch keine Rolle');

/* -------------------------------------------------------------- Serienbonus */

const serien = [0,1,3,5,8,20].map(s => punkteFuer({ richtig: true, level: 2, serie: s }));
pruefe(serien[0] < serien[3], 'eine Serie bringt mehr Punkte');
pruefe(serien[4] === serien[5] && serien[3] === serien[4],
  `der Serienbonus ist gedeckelt – 20 richtige geben nicht endlos mehr (${serien.join(', ')})`);

/* Knacknüsse sind schwerer und geben mehr. */
pruefe(punkteFuer({ richtig: true, level: 2, knacknuss: true })
     > punkteFuer({ richtig: true, level: 2 }), 'Knacknüsse bringen einen Bonus');

/* ------------------------------------------------------------------- Ränge */

pruefe(rang(0).name === RAENGE[0].name, 'bei null Punkten der erste Rang');
pruefe(rang(1000000).naechster === null, 'am obersten Rang gibt es keinen nächsten');
const folge = [0, 300, 1000, 2000, 4000, 7000, 12000, 20000].map(p => rang(p).stelle);
pruefe(folge.every((s, i) => i === 0 || s >= folge[i-1]),
  `der Rang steigt monoton mit den Punkten (${folge.join(', ')})`);
pruefe(RAENGE.every((r, i) => i === 0 || r.ab > RAENGE[i-1].ab),
  'die Rangschwellen steigen sauber an');

const r = rang(500);
pruefe(r.anteil > 0 && r.anteil < 1, `Fortschritt zum nächsten Rang: ${Math.round(r.anteil*100)} %`);
pruefe(r.bisZumNaechsten === RAENGE[2].ab - 500,
  `es fehlen ${r.bisZumNaechsten} Punkte bis „${r.naechster.name}"`);
pruefe([0, 1, 249, 250, 251, 99999].every(p => rang(p).anteil >= 0 && rang(p).anteil <= 1),
  'der Anteil bleibt immer zwischen 0 und 1');

/* ------------------------------------------------------- Runde und Rekord */

const rekord = rundenBlick(120, 100);
pruefe(rekord.rekord && /Bestleistung/.test(rekord.text), `neue Bestleistung erkannt: "${rekord.text}"`);
const drunter = rundenBlick(80, 100);
pruefe(!drunter.rekord && /100/.test(drunter.text),
  `unter der Bestleistung wird die Bestleistung genannt: "${drunter.text}"`);
pruefe(rundenBlick(50, 0).rekord, 'die allererste Runde ist immer ein Rekord');
pruefe(!/schlecht|leider|nur/i.test(drunter.text),
  'unter der Bestleistung wird nichts abgewertet');

/* ----------------------------------------------------------- Vergleich */

const liste = rangliste([
  { id:'a', name:'Mia',  stats:{ punkte: 300, aufgabenGesamt: 20 }, etappe:2 },
  { id:'b', name:'Ben',  stats:{ punkte: 900, aufgabenGesamt: 60 }, etappe:3 },
  { id:'c', name:'Lina', stats:{ punkte: 0 },                        etappe:1 }
]);
pruefe(liste[0].name === 'Ben' && liste[2].name === 'Lina',
  `die Rangliste sortiert nach Punkten (${liste.map(x => x.name).join(' > ')})`);
pruefe(liste.every(x => x.rang && x.rang.name), 'jeder bekommt seinen Rang mitgeliefert');
pruefe(liste[2].punkte === 0, 'ein Profil ohne Punkte stürzt nicht ab');
pruefe(rangliste([]).length === 0, 'keine Profile: leere Liste');

pruefe(etwaAufgaben(180, 18) === 10, 'Differenz in Aufgaben umgerechnet: 180 Punkte ≈ 10 Aufgaben');
pruefe(etwaAufgaben(3, 18) >= 1, 'auch ein kleiner Abstand ist mindestens eine Aufgabe');

/* --------------------------------------------------------------- Randfälle */

pruefe(typeof punkteFuer({}) === 'number', 'ohne Angaben stürzt nichts ab');
pruefe(punkteFuer({ richtig: true, level: 99 }) === punkteFuer({ richtig: true, level: 5 }),
  'eine unsinnig hohe Stufe wird gedeckelt');
pruefe(punkteFuer({ richtig: true, level: 0 }) === punkteFuer({ richtig: true, level: 1 }),
  'Stufe 0 wird wie Stufe 1 behandelt');

console.log(fehler === 0
  ? '\nPunktesystem belohnt das Richtige ✅'
  : `\n${fehler} Problem(e) ❌`);
process.exit(fehler === 0 ? 0 : 1);
