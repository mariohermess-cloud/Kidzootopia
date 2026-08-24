/* Speicher: Profile, Fortschritt, Talent-Werte. Alles lokal im Geraet (localStorage).
   Keine Konten, keine Server, keine Daten von Kindern nach draussen. */

import { TALENTE, WEGE, ZIELE, ABZEICHEN } from './data.js';

const KEY = 'kidzootopia.v1';
const heute = () => new Date().toISOString().slice(0,10);

const leer = () => ({ profile: [], aktiv: null, version: 1 });

let db = leer();

export function laden() {
  try {
    const roh = localStorage.getItem(KEY);
    if (roh) db = { ...leer(), ...JSON.parse(roh) };
  } catch { db = leer(); }
  db.profile.forEach(p => migriere(p));
  return db;
}
export function speichern() {
  try { localStorage.setItem(KEY, JSON.stringify(db)); } catch {}
}
export const alleProfile = () => db.profile;
export const aktiv = () => db.profile.find(p => p.id === db.aktiv) || null;
export function setzeAktiv(id) { db.aktiv = id; speichern(); }

function migriere(p) {
  p.talente     ||= {};
  p.leistung    ||= {};
  p.ziele       ||= {};
  p.wegeGenutzt ||= {};
  p.abzeichen   ||= [];
  p.stats ||= {};
  p.stats.aufgabenGesamt  ??= 0;
  p.stats.richtigGesamt   ??= 0;
  p.stats.brueckenRichtig ??= 0;
  p.stats.streak          ??= 0;
  p.stats.streakBest      ??= 0;
  p.stats.letzterTag      ??= null;
  p.stats.tage            ??= {};
  return p;
}

export function neuesProfil({ name, avatar, klasse }) {
  const p = migriere({
    id: 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2,6),
    name: name.trim() || 'Kind', avatar, klasse: Number(klasse) || 3,
    erstellt: heute(), testGemacht: false, testDatum: null
  });
  db.profile.push(p);
  db.aktiv = p.id;
  speichern();
  return p;
}

export function loescheProfil(id) {
  db.profile = db.profile.filter(p => p.id !== id);
  if (db.aktiv === id) db.aktiv = db.profile[0]?.id || null;
  speichern();
}

/* --- Talent-Test auswerten: Werte 0..100 je Talent --- */
export function testAuswerten(profil, antworten /* [{t, v}] */) {
  const summe = {}, anzahl = {};
  antworten.forEach(({ t, v }) => { summe[t] = (summe[t]||0) + v; anzahl[t] = (anzahl[t]||0) + 1; });
  Object.keys(TALENTE).forEach(t => {
    const mittel = anzahl[t] ? summe[t]/anzahl[t] : 2.5;   // 1..4
    profil.talente[t] = Math.round((mittel - 1) / 3 * 100);
  });
  profil.testGemacht = true;
  profil.testDatum = heute();
  speichern();
}

/* Talent-Profil = Selbsteinschaetzung + gezeigte Leistung.
   So korrigiert sich der Test mit der Zeit selbst. */
export function talentWerte(profil) {
  const out = {};
  for (const t of Object.keys(TALENTE)) {
    const test = profil.talente[t] ?? 50;
    const l = profil.leistung[t];
    if (!l || l.gesamt < 6) { out[t] = test; continue; }
    const quote = Math.round(l.richtig / l.gesamt * 100);
    const gewicht = Math.min(0.45, l.gesamt / 120);        // waechst mit Datenmenge
    out[t] = Math.round(test * (1 - gewicht) + quote * gewicht);
  }
  return out;
}

export function topTalente(profil, n = 3) {
  return Object.entries(talentWerte(profil)).sort((a,b) => b[1]-a[1]).slice(0, n).map(e => e[0]);
}

/* --- Ziele --- */
export function zielStand(profil, zielId) {
  return profil.ziele[zielId] ||= { level:1, xp:0, richtig:0, gesamt:0, serie:0, gemeistert:false };
}

export function zieleFuerKlasse(profil) {
  return ZIELE.filter(z => profil.klasse >= z.klasse[0] - 1 && profil.klasse <= z.klasse[1] + 1);
}

/* Ergebnis einer Aufgabe verbuchen */
export function verbuche(profil, { zielId, weg, level, richtig, bruecke }) {
  const z = zielStand(profil, zielId);
  z.gesamt++; if (richtig) { z.richtig++; z.xp += 10 + level * 2; }
  z.serie = richtig ? z.serie + 1 : 0;

  if (richtig && z.serie >= 4 && z.level < 5) { z.level++; z.serie = 0; }
  if (!richtig && z.level > 1 && z.gesamt % 3 === 0 && z.richtig / z.gesamt < .5) z.level--;
  if (z.level >= 5 && z.richtig >= 25 && z.richtig / z.gesamt >= .8) z.gemeistert = true;

  const talent = WEGE[weg]?.talent;
  if (talent) {
    const l = profil.leistung[talent] ||= { richtig:0, gesamt:0 };
    l.gesamt++; if (richtig) l.richtig++;
    profil.wegeGenutzt[weg] = (profil.wegeGenutzt[weg]||0) + 1;
  }

  const s = profil.stats;
  s.aufgabenGesamt++; if (richtig) s.richtigGesamt++;
  if (richtig && bruecke) s.brueckenRichtig++;
  s.tage[heute()] = (s.tage[heute()]||0) + 1;
  tagesSerie(profil);
  pruefeAbzeichen(profil);
  speichern();
  return z;
}

function tagesSerie(profil) {
  const s = profil.stats, h = heute();
  if (s.letzterTag === h) return;
  const gestern = new Date(Date.now() - 864e5).toISOString().slice(0,10);
  s.streak = s.letzterTag === gestern ? s.streak + 1 : 1;
  s.letzterTag = h;
  s.streakBest = Math.max(s.streakBest, s.streak);
}

export function serieAktuell(profil) {
  const s = profil.stats, h = heute();
  const gestern = new Date(Date.now() - 864e5).toISOString().slice(0,10);
  if (s.letzterTag === h || s.letzterTag === gestern) return s.streak;
  return 0;
}

export function statsFuerAbzeichen(profil) {
  return {
    aufgabenGesamt: profil.stats.aufgabenGesamt,
    streakBest: profil.stats.streakBest,
    zieleGemeistert: Object.values(profil.ziele).filter(z => z.gemeistert).length,
    wegeGenutzt: Object.keys(profil.wegeGenutzt).length,
    brueckenRichtig: profil.stats.brueckenRichtig
  };
}

export function pruefeAbzeichen(profil) {
  const s = statsFuerAbzeichen(profil), neu = [];
  ABZEICHEN.forEach(a => {
    if (!profil.abzeichen.includes(a.id) && a.test(s)) { profil.abzeichen.push(a.id); neu.push(a); }
  });
  return neu;
}

/* Export / Import fuer Eltern (Backup, Geraetewechsel) */
export const exportieren = () => JSON.stringify(db, null, 2);
export function importieren(text) {
  const eingelesen = JSON.parse(text);
  if (!Array.isArray(eingelesen.profile)) throw new Error('Datei passt nicht.');
  db = { ...leer(), ...eingelesen };
  db.profile.forEach(migriere);
  speichern();
}
export function allesLoeschen() { db = leer(); speichern(); }
