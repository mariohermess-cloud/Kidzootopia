/* Speicher: Profile, Fortschritt, Talent-Werte. Alles lokal im Geraet (localStorage).
   Keine Konten, keine Server, keine Daten von Kindern nach draussen. */

import { TALENTE, WEGE, ZIELE, ABZEICHEN } from './data.js';
import { auswerten } from './talenttest.js';

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
  p.wegStats    ||= {};   // je Weg: wie gut und wie schnell laeuft es damit?
  p.zielWeg     ||= {};   // je Lernziel und Weg dasselbe – dort zeigt sich der Unterschied
  p.testTeile   ||= null; // Ergebnis der einzelnen Testteile
  p.vorlesen    ??= false; // Aufgaben automatisch vorlesen (für Leseanfänger)
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

/* --- Talent-Test auswerten (siehe talenttest.js) --- */
export function testAuswerten(profil, antworten) {
  const ergebnis = auswerten(antworten);
  Object.assign(profil.talente, ergebnis.werte);
  profil.testTeile = ergebnis.teile;
  profil.testGemacht = true;
  profil.testTeileGenutzt = ergebnis.verwendet;
  profil.testDatum = heute();
  speichern();
  return ergebnis;
}

/* Wie gut laeuft es bei diesem Kind ueber einen bestimmten Weg?
   Erfolgsquote, gedaempft in Richtung des eigenen Durchschnitts (wenige Aufgaben
   sollen kein Urteil ergeben), plus ein kleiner Bonus fuer zuegiges Loesen. */
export function wegWirksamkeit(profil, weg) {
  const w = profil.wegStats[weg];
  const gesamtQuote = profil.stats.aufgabenGesamt
    ? profil.stats.richtigGesamt / profil.stats.aufgabenGesamt : 0.6;
  if (!w || !w.gesamt) return { wert: Math.round(gesamtQuote*100), n: 0, konfidenz: 0 };

  const K = 6;                                   // Daempfung: erst ab ~6 Aufgaben zaehlt es richtig
  const quote = (w.richtig + K * gesamtQuote) / (w.gesamt + K);
  let wert = quote * 100;

  const eigeneSek = w.msSumme / w.gesamt / 1000;
  const alleMs = Object.values(profil.wegStats).reduce((a,x) => a + x.msSumme, 0);
  const alleN  = Object.values(profil.wegStats).reduce((a,x) => a + x.gesamt, 0);
  if (alleN >= 12 && eigeneSek > 0) {
    const schnittSek = alleMs / alleN / 1000;
    const tempo = (schnittSek - eigeneSek) / Math.max(4, schnittSek);  // schneller als sonst = +
    wert += Math.max(-8, Math.min(8, tempo * 16));
  }
  return {
    wert: Math.max(0, Math.min(100, Math.round(wert))),
    n: w.gesamt,
    konfidenz: Math.min(1, w.gesamt / 20)
  };
}

/* Wirksamkeit eines Weges fuer ein bestimmtes Lernziel – dort zeigt sich,
   ob ein Kind Brueche wirklich besser ueber Bilder als ueber Geschichten versteht. */
export function zielWegWirksamkeit(profil, zielId, weg) {
  const z = profil.zielWeg[zielId]?.[weg];
  const basis = wegWirksamkeit(profil, weg);
  if (!z || z.gesamt < 3) return basis;
  const K = 4;
  const quote = (z.richtig + K * (basis.wert/100)) / (z.gesamt + K);
  return { wert: Math.round(quote*100), n: z.gesamt, konfidenz: Math.min(1, z.gesamt/12) };
}

/* Talent-Profil = Selbsteinschaetzung + gezeigte Leistung.
   So korrigiert sich der Test mit der Zeit selbst. */
export function talentWerte(profil) {
  const out = {};
  for (const t of Object.keys(TALENTE)) {
    const test = profil.talente[t] ?? 50;
    // alle Wege, die zu diesem Talent gehoeren
    const wege = Object.entries(WEGE).filter(([,w]) => w.talent === t).map(([k]) => k);
    let summe = 0, n = 0;
    wege.forEach(w => {
      const s = profil.wegStats[w];
      if (s?.gesamt) { const e = wegWirksamkeit(profil, w); summe += e.wert * s.gesamt; n += s.gesamt; }
    });
    if (!n) { out[t] = test; continue; }
    const gemessen = summe / n;
    const gewicht = Math.min(0.45, n / 120);      // waechst mit der Datenmenge
    out[t] = Math.round(test * (1 - gewicht) + gemessen * gewicht);
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
export function verbuche(profil, { zielId, weg, level, richtig, bruecke, ms = 0 }) {
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

  // Hier lernt die App: Wie gut und wie schnell laeuft dieses Kind ueber diesen Weg?
  const ws = profil.wegStats[weg] ||= { gesamt:0, richtig:0, msSumme:0 };
  ws.gesamt++; if (richtig) ws.richtig++;
  ws.msSumme += Math.min(ms || 0, 120000);        // Ausreisser (Pause, Handy weggelegt) kappen

  const zw = (profil.zielWeg[zielId] ||= {});
  const e = zw[weg] ||= { gesamt:0, richtig:0 };
  e.gesamt++; if (richtig) e.richtig++;

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
