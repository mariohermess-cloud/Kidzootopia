/* Prüft die Knacknüsse auf zwei Arten:
   1. Vielfalt – gibt jede Familie so viele verschiedene Aufgaben her wie angegeben?
   2. Richtigkeit – stimmt die Antwort? Dafür wird sie aus dem Aufgabentext heraus
      NOCH EINMAL berechnet, und zwar möglichst anders als im Generator:
      per vollständiger Simulation, Brute Force oder unabhängiger Formel. */

import { FAMILIEN, VARIANTEN_GESAMT, umfuellSchritte, bruecken } from '../js/knacknuss_familien.js';
import { KNACKNUESSE } from '../js/klassiker.js';
import { baueAufgabe } from '../js/generators.js';

const fehler = [];
const zahl = t => Number(String(t).replace(',', '.'));

/* ---------- 1. Vielfalt ---------- */
let gemessenGesamt = 0;
for (const f of FAMILIEN) {
  const gesehen = new Set();
  for (let i = 0; i < 40000; i++) gesehen.add(f.erzeuge().frage);
  gemessenGesamt += gesehen.size;
  if (gesehen.size < f.varianten)
    fehler.push(`${f.id}: nur ${gesehen.size} verschiedene statt ${f.varianten}`);
}
console.log(`Familien: ${FAMILIEN.length} · nachgezählte Varianten: ${gemessenGesamt} ` +
            `(gemeldet ${VARIANTEN_GESAMT}) · dazu ${KNACKNUESSE.length} handverlesene Klassiker`);
console.log(`Knacknuss-Vorrat insgesamt: ${gemessenGesamt + KNACKNUESSE.length} verschiedene Aufgaben`);

/* ---------- 2. Richtigkeit, unabhängig nachgerechnet ---------- */
const pruefer = {
  /* Schnecke: Tag für Tag simulieren */
  schnecke(f, a) {
    const [, tiefe, hoch, rutsch] = f.match(/(\d+) m tiefen.*?(\d+) m hoch.*?(\d+) m zurück/s).map(Number);
    let hoehe = 0, tag = 0;
    while (tag < 500) { tag++; hoehe += hoch; if (hoehe >= tiefe) return tag; hoehe -= rutsch; }
    return -1;
  },
  /* Hanoi: rekursiv zählen statt Formel */
  hanoi(f) {
    const n = Number(f.match(/mit (\d+) Scheiben/)[1]);
    const zuege = k => k === 0 ? 0 : 2 * zuege(k - 1) + 1;
    return zuege(n);
  },
  /* Handschläge: wirklich alle Paare durchzählen */
  handschlag(f) {
    const n = Number(f.match(/sind (\d+) Menschen/)[1]);
    let z = 0; for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) z++;
    return z;
  },
  /* Wiegen: kleinste Zahl k mit 3^k >= n, durch Hochzählen */
  wiegen(f) {
    const n = Number(f.match(/(\d+) gleich aussehende/)[1]);
    let k = 0, reicht = 1; while (reicht < n) { reicht *= 3; k++; } return k;
  },
  /* Umfüllen: Breitensuche über alle Zustände */
  umfuellen(f) {
    const [, a, b, ziel] = f.match(/(\d+)-Liter- und einen (\d+)-Liter.*?genau (\d+) Liter/s).map(Number);
    return umfuellSchritte(a, b, ziel);
  },
  /* Quadrate: einzeln abzählen statt Summenformel */
  quadrate(f) {
    const n = Number(f.match(/aus (\d+) ×/)[1]);
    let z = 0; for (let k = 1; k <= n; k++) z += (n - k + 1) ** 2; return z;
  },
  rechtecke(f) {
    const [, n, m] = f.match(/aus (\d+) × (\d+) Feldern/).map(Number);
    let z = 0;
    for (let x1 = 0; x1 <= n; x1++) for (let x2 = x1 + 1; x2 <= n; x2++)
      for (let y1 = 0; y1 <= m; y1++) for (let y2 = y1 + 1; y2 <= m; y2++) z++;
    return z;
  },
  socken(f) { return Number(f.match(/von (\d+) Farben/)[1]) + 1; },
  seerose(f) { return Number(f.match(/Nach (\d+) Tagen/)[1]) - 1; },
  /* Nim: Gewinnzug per vollständiger Spielanalyse */
  nim(f) {
    const [, n, k] = f.match(/(\d+) Streichhölzer.*?1 bis (\d+) Hölzer/s).map(Number);
    const gewinnt = new Array(n + 1).fill(false);
    for (let i = 1; i <= n; i++)
      for (let z = 1; z <= Math.min(k, i); z++) if (!gewinnt[i - z]) { gewinnt[i] = true; break; }
    if (!gewinnt[n]) return 0;
    for (let z = 1; z <= Math.min(k, n); z++) if (!gewinnt[n - z]) return z;
    return -1;
  },
  /* Josephus: den Kreis tatsächlich durchzählen */
  josephus(f) {
    const n = Number(f.match(/^🎯 (\d+) Kinder/m)[1]);
    const kreis = Array.from({ length: n }, (_, i) => i + 1);
    let i = 0;
    while (kreis.length > 1) { i = (i + 1) % kreis.length; kreis.splice(i, 1); i = i % kreis.length; }
    return kreis[0];
  },
  /* Gauß: wirklich aufsummieren */
  gauss(f) {
    const n = Number(f.match(/1 bis (\d+)/)[1]);
    let s = 0; for (let i = 1; i <= n; i++) s += i; return s;
  },
  zuege_fliege(f) {
    const [, v1, v2, abstand, vf] = f.match(/mit (\d+) km\/h, einer mit (\d+) km\/h, Abstand (\d+) km.*?mit (\d+) km\/h/s).map(Number);
    return vf * (abstand / (v1 + v2));
  },
  wasserhaehne(f) {
    const [, a, b] = f.match(/allein in (\d+) Stunden, der andere allein in (\d+)/).map(Number);
    return 1 / (1 / a + 1 / b);
  },
  flasche(f) {
    const g = f.match(/zusammen ([\d,]+) €/)[1].replace(',', '.') * 100;
    const d = f.match(/kostet ([\d,]+) € mehr/)[1].replace(',', '.') * 100;
    return Math.round((g - d) / 2);
  },
  maschinen(f) { return Number(f.match(/^🏭 (\d+) Maschinen/m)[1]); },
  bruecke_nacht(f) {
    const zeiten = f.match(/Sie brauchen ([\d, ]+) Minuten/)[1].split(',').map(x => Number(x.trim()));
    return bruecken(zeiten);
  },
  /* Altersrätsel: die Gleichung wirklich lösen */
  alter_doppelt(f) {
    const [, a, b] = f.match(/In (\d+) Jahr(?:en)? bin ich doppelt so alt wie vor (\d+) Jahr/).map(Number);
    for (let x = 1; x <= 200; x++) if (x + a === 2 * (x - b)) return x;
    return -1;
  },
  kerzen(f) { return Number(f.match(/löscht (\d+) davon/)[1]); },
  teilen_schnitte(f) { return Number(f.match(/in (\d+) gleich lange/)[1]) - 1; },
  kamele(f) {
    const [, tiere, a] = f.match(/vererbt (\d+) Kamele: 1\/(\d+)/).map(Number);
    return (tiere + 1) / a;
  },
  uhr_zeiger(f) { return Number(f.match(/in (\d+) Stunden/)[1]) === 12 ? 11 : 22; },
  schubfach(f) {
    const [, farben, je] = f.match(/in (\d+) Farben.*?sicher (\d+) gleichfarbige/s).map(Number);
    return farben * (je - 1) + 1;
  },
  ziegel(f) {
    const [, g, teil] = f.match(/wiegt (\d+) kg und dazu ein (?:halbes|1\/(\d+))/).map(v => Number(v));
    const t = Number.isNaN(teil) ? 2 : teil;
    return g * t / (t - 1);
  }
};

let geprueft = 0;
for (const f of FAMILIEN) {
  const pruef = pruefer[f.id];
  if (!pruef) { fehler.push(`${f.id}: kein unabhängiger Prüfer vorhanden`); continue; }
  for (let i = 0; i < 800; i++) {
    const a = f.erzeuge();
    let erwartet;
    try { erwartet = pruef(a.frage, a); } catch (e) { fehler.push(`${f.id}: Prüfer scheiterte – ${e.message}\n${a.frage}`); break; }
    if (Math.abs(zahl(a.antwort) - erwartet) > 1e-9) {
      fehler.push(`${f.id}: Antwort ${a.antwort}, nachgerechnet ${erwartet}\n${a.frage}`);
      break;
    }
    geprueft++;
  }
}
console.log(`${geprueft} erzeugte Knacknüsse unabhängig nachgerechnet.`);

/* ---------- 3. Vollständigkeit der handverlesenen Klassiker ---------- */
for (const k of KNACKNUESSE) {
  if (!k.quelle) fehler.push(`${k.id}: keine Herkunftsangabe`);
  if (!k.tipps?.length) fehler.push(`${k.id}: keine Tipps`);
  if (k.optionen && !k.optionen.includes(k.antwort)) fehler.push(`${k.id}: Antwort fehlt in den Optionen`);
}

/* ---------- 4. Über den Generator: alles vollständig? ---------- */
for (let stufe = 1; stufe <= 5; stufe++) {
  for (let i = 0; i < 2000; i++) {
    const a = baueAufgabe('knacknuss', 'knobeln', stufe);
    if (!a.quelle) { fehler.push(`Stufe ${stufe}: Knacknuss ohne Herkunft – ${a.frage}`); break; }
    if (!a.tipps?.length) { fehler.push(`Stufe ${stufe}: Knacknuss ohne Tipps – ${a.frage}`); break; }
  }
}

if (fehler.length) { console.error('\nFEHLER:\n' + [...new Set(fehler)].join('\n')); process.exit(1); }
console.log('Alle Knacknüsse stimmen ✅');
