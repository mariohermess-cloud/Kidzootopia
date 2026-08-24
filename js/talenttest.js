/* Auswertung des Talent-Tests.
   Jeder Teil wird getrennt zu Werten von 0-100 je Talent umgerechnet und danach
   gewichtet zusammengefuehrt. Fehlende Teile (das Kind hat frueher aufgehoert)
   werden einfach weggelassen und die Gewichte neu normiert – das Ergebnis bleibt
   gueltig, nur etwas grober. */

import { TALENTE, TEST_LIKERT, TEST_PAARE, TEST_SZENARIEN, TEST_GEWICHTE } from './data.js';

const KEYS = () => Object.keys(TALENTE);
const clamp = (v, a=0, b=100) => Math.max(a, Math.min(b, v));
const leer = () => Object.fromEntries(KEYS().map(k => [k, null]));

/* Teil 1: Skala 1-4 -> 0-100 */
function ausLikert(antworten) {
  if (!antworten?.length) return null;
  const summe = {}, n = {};
  antworten.forEach(({ t, v }) => { summe[t] = (summe[t]||0) + v; n[t] = (n[t]||0) + 1; });
  const out = leer();
  // Untergrenze 10 statt 0: Kein Kind soll im Radar bei null stehen.
  KEYS().forEach(t => { if (n[t]) out[t] = clamp(10 + (summe[t]/n[t] - 1) / 3 * 90); });
  return out;
}

/* Teil 2: Anteil gewonnener Vergleiche. Wer alles mag, muss sich hier entscheiden. */
function ausPaaren(antworten) {
  if (!antworten?.length) return null;
  const siege = {}, auftritte = {};
  antworten.forEach(({ gewinner, verlierer }) => {
    siege[gewinner] = (siege[gewinner]||0) + 1;
    auftritte[gewinner] = (auftritte[gewinner]||0) + 1;
    auftritte[verlierer] = (auftritte[verlierer]||0) + 1;
  });
  // Wenige Vergleiche duerfen kein Extremurteil ergeben: leichte Daempfung zur Mitte.
  const K = 2;
  const out = leer();
  KEYS().forEach(t => {
    if (auftritte[t]) out[t] = clamp(((siege[t]||0) + K*0.5) / (auftritte[t] + K) * 100);
  });
  return out;
}

/* Teil 3: Anteil der Male, in denen dieses Talent gewaehlt wurde,
   gemessen daran, wie oft es ueberhaupt zur Wahl stand. */
function ausSzenarien(antworten) {
  if (!antworten?.length) return null;
  const gewaehlt = {}, angeboten = {};
  antworten.forEach(({ gewaehlt: g, angeboten: a }) => {
    gewaehlt[g] = (gewaehlt[g]||0) + 1;
    a.forEach(t => { angeboten[t] = (angeboten[t]||0) + 1; });
  });
  const K = 2;
  const out = leer();
  KEYS().forEach(t => {
    if (angeboten[t]) out[t] = clamp(((gewaehlt[t]||0) + K*0.25) / (angeboten[t] + K) * 100 * 1.6);
  });
  return out;
}

/* Teil 4: gezeigtes Koennen. Richtig zaehlt, schnell und richtig zaehlt mehr.
   Weil je Talent nur eine Probe vorliegt, wird das Ergebnis zur Mitte hin
   abgemildert – eine einzelne Aufgabe soll niemanden festlegen. */
function ausProben(antworten) {
  if (!antworten?.length) return null;
  const out = leer();
  antworten.forEach(({ t, richtig, ms }) => {
    const sek = (ms || 0) / 1000;
    const roh = richtig ? clamp(100 - Math.max(0, sek - 8) * 3, 60, 100)
                        : clamp(35 - Math.max(0, 6 - sek) * 3, 15, 35);
    out[t] = Math.round(roh * 0.7 + 50 * 0.3);
  });
  return out;
}

export function auswerten(antworten = {}) {
  const teile = {
    likert:    ausLikert(antworten.likert),
    paare:     ausPaaren(antworten.paare),
    szenarien: ausSzenarien(antworten.szenarien),
    proben:    ausProben(antworten.proben)
  };
  const werte = {};
  KEYS().forEach(t => {
    let summe = 0, gewicht = 0;
    for (const [id, block] of Object.entries(teile)) {
      if (block && block[t] !== null && block[t] !== undefined) {
        summe += block[t] * TEST_GEWICHTE[id];
        gewicht += TEST_GEWICHTE[id];
      }
    }
    werte[t] = gewicht ? Math.round(summe / gewicht) : 50;
  });

  /* Teil 5: Stichfragen verschieben nur noch fein. */
  (antworten.stich || []).forEach(({ gewinner, verlierer }) => {
    werte[gewinner] = clamp(werte[gewinner] + 5);
    werte[verlierer] = clamp(werte[verlierer] - 5);
  });

  return { werte, teile, verwendet: Object.entries(teile).filter(([,b]) => b).map(([id]) => id) };
}

/* Welche Talente liegen so dicht beieinander, dass sich Nachfragen lohnt? */
export function engeTalente(werte, spanne = 10, maxAnzahl = 4) {
  const sortiert = Object.entries(werte).sort((a,b) => b[1]-a[1]);
  const spitze = sortiert[0][1];
  return sortiert.filter(([,v]) => spitze - v <= spanne).slice(0, maxAnzahl).map(([t]) => t);
}

/* Stichfragen erzeugen: nur Paare zwischen den dicht beieinander liegenden Talenten. */
export function stichPaare(werte, anzahl = 4) {
  const eng = engeTalente(werte);
  if (eng.length < 2) return [];
  const passend = TEST_PAARE.filter(p => eng.includes(p.a) && eng.includes(p.b));
  const fehlend = [];
  for (let i = 0; i < eng.length && passend.length + fehlend.length < anzahl; i++) {
    for (let j = i+1; j < eng.length && passend.length + fehlend.length < anzahl; j++) {
      const da = passend.some(p => (p.a===eng[i]&&p.b===eng[j]) || (p.a===eng[j]&&p.b===eng[i]));
      if (!da) {
        const ersatz = TEST_PAARE.find(p => (p.a===eng[i]||p.b===eng[i]) && !passend.includes(p));
        if (ersatz) fehlend.push(ersatz);
      }
    }
  }
  return [...passend, ...fehlend].slice(0, anzahl);
}
