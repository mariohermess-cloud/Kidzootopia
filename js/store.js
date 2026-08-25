/* Speicher: Profile, Fortschritt, Talent-Werte. Alles lokal im Geraet (localStorage).
   Keine Konten, keine Server, keine Daten von Kindern nach draussen. */

import { TALENTE, WEGE, ZIELE, ABZEICHEN, ETAPPEN } from './data.js';
import { auswerten } from './talenttest.js';

const KEY = 'kidzootopia.v1';
const heute = () => new Date().toISOString().slice(0,10);

const leer = () => ({ profile: [], aktiv: null, version: 1 });

let db = leer();

export function laden() {
  try {
    const roh = localStorage.getItem(KEY);
    db = roh ? { ...leer(), ...JSON.parse(roh) } : leer();
  } catch { db = leer(); }
  db.profile.forEach(p => migriere(p));
  return db;
}
const SICHERUNG = 'kidzootopia.sicherung';

export function speichern() {
  const text = JSON.stringify(db);
  try { localStorage.setItem(KEY, text); } catch {}
  // Zweitkopie: schützt gegen einen beschädigten Haupteintrag, nicht gegen Löschen
  try { if (db.profile.length) localStorage.setItem(SICHERUNG, text); } catch {}
}

/* Was liegt auf diesem Gerät wirklich? Zeigt statt zu vermuten. */
export function diagnose() {
  const bericht = {
    modus: alsAppGestartet() ? 'App vom Startbildschirm' : 'Browser',
    adresse: location.origin + location.pathname,
    speicherLesbar: true,
    eintraege: [],
    profile: [],
    sicherungVorhanden: false,
    sicherungProfile: 0
  };
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      const wert = localStorage.getItem(k) || '';
      bericht.eintraege.push({ name: k, groesse: wert.length });
    }
  } catch { bericht.speicherLesbar = false; }

  try {
    const roh = localStorage.getItem(KEY);
    if (roh) {
      const daten = JSON.parse(roh);
      bericht.profile = (daten.profile || []).map(p => ({
        name: p.name, aufgaben: p.stats?.aufgabenGesamt ?? 0,
        letzterTag: p.stats?.letzterTag || '–', angelegt: p.erstellt || '–'
      }));
    }
  } catch {}

  try {
    const sich = localStorage.getItem(SICHERUNG);
    if (sich) {
      bericht.sicherungVorhanden = true;
      bericht.sicherungProfile = (JSON.parse(sich).profile || []).length;
    }
  } catch {}
  return bericht;
}

/* Aus der Zweitkopie wiederherstellen, falls der Haupteintrag leer oder kaputt ist. */
export function ausSicherung() {
  const sich = localStorage.getItem(SICHERUNG);
  if (!sich) throw new Error('Auf diesem Gerät gibt es keine Zweitkopie.');
  return zusammenfuehren(sich);
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
  // Etappe: 1 Grundschule … 5 Erwachsene. Ältere Profile kannten nur die Klasse.
  p.etappe      ??= (p.klasse >= 8 ? 3 : p.klasse >= 5 ? 2 : 1);
  p.gesehen     ||= {};   // je Ziel die zuletzt gestellten Aufgaben (Kurzkennung)
  p.lesungen    ||= [];   // Leseflüssigkeit je Durchgang (nur Zahlen, nie Ton)
  p.skizzen     ||= {};   // je Ziel: wie oft half eine Skizze beim Denken
  p.galerie     ||= [];   // freie Zeichnungen (werden nicht bewertet)
  p.kunst       ||= { messungen: [], mensch: null };  // fachliches Zeichenprofil
  p.stats ||= {};
  p.stats.aufgabenGesamt  ??= 0;
  p.stats.richtigGesamt   ??= 0;
  p.stats.brueckenRichtig ??= 0;
  p.stats.ohneTipp        ??= 0;   // Knacknüsse ohne Tipp gelöst
  p.stats.streak          ??= 0;
  p.stats.streakBest      ??= 0;
  p.stats.letzterTag      ??= null;
  p.stats.tage            ??= {};
  return p;
}

export function neuesProfil({ name, avatar, klasse, etappe }) {
  const stufe = Number(etappe) || 1;
  const p = migriere({
    id: 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2,6),
    name: name.trim() || 'Kind', avatar,
    etappe: stufe,
    klasse: Number(klasse) || [3, 6, 9, 12, 13][stufe - 1],
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

/* Fachliche Messwerte einer Zeichnung ablegen (siehe kunstanalyse.js).
   Gespeichert werden nur Zahlen, keine Bilder – das bleibt klein und sparsam. */
const KUNST_MAX = 30;

export function merkeKunst(profil, eintrag) {
  profil.kunst.messungen.unshift({ datum: heute(), ...eintrag });
  if (profil.kunst.messungen.length > KUNST_MAX) profil.kunst.messungen.length = KUNST_MAX;
  speichern();
}

export function merkeMensch(profil, ergebnis) {
  profil.kunst.mensch = { ...ergebnis, datum: heute() };
  speichern();
}

/* Mittelwert einer Größe über die letzten Messungen – null, wenn zu wenig da. */
export function kunstMittel(profil, feld, mindestens = 3) {
  const werte = (profil.kunst?.messungen || []).map(m => m[feld])
    .filter(v => typeof v === 'number');
  if (werte.length < mindestens) return null;
  return Math.round(werte.reduce((a,b) => a+b, 0) / werte.length);
}

/* Freie Zeichnungen sammeln. Striche werden grob gerundet gespeichert –
   das reicht zum Wiederanzeigen und hält den Speicher klein. */
const GALERIE_MAX = 16;

export function inGalerie(profil, { titel, auftrag, striche }) {
  const sparsam = striche.map(l => l.filter((_, i) => i % 2 === 0)
    .map(p => [Math.round(p.x * 200) / 200, Math.round(p.y * 200) / 200]));
  profil.galerie.unshift({ titel: String(titel || '').slice(0, 40), auftrag,
                           striche: sparsam, datum: heute() });
  if (profil.galerie.length > GALERIE_MAX) profil.galerie.length = GALERIE_MAX;
  speichern();
}

/* --- Gedächtnis gegen Wiederholungen ---------------------------------------
   Jede gestellte Aufgabe hinterlässt eine kurze Kennung. Der Motor zieht so
   lange neu, bis eine Aufgabe kommt, die dieses Kind noch nicht hatte.
   Der Vorrat ist begrenzt (feste Rätsel!), deshalb altert die Liste: Ist
   nahezu alles gesehen, fallen die ältesten Einträge wieder heraus. */
const GESEHEN_MAX = 60;

export function kennung(aufgabe) {
  const roh = String(aufgabe.frage || '') + '|' + String(aufgabe.antwort || '');
  let h = 5381;
  for (let i = 0; i < roh.length; i++) h = ((h * 33) ^ roh.charCodeAt(i)) >>> 0;
  return h.toString(36);
}

export const schonGehabt = (profil, zielId, k) => (profil.gesehen[zielId] || []).includes(k);

export function merkeAufgabe(profil, zielId, k) {
  const liste = profil.gesehen[zielId] ||= [];
  liste.push(k);
  if (liste.length > GESEHEN_MAX) liste.splice(0, liste.length - GESEHEN_MAX);
}

/* --- Ziele --- */
export function zielStand(profil, zielId) {
  return profil.ziele[zielId] ||= { level:1, xp:0, richtig:0, gesamt:0, serie:0, gemeistert:false };
}

/* Welche Lernziele passen zur Etappe? Eine Etappe darüber und darunter ist
   erlaubt – Wiederholen schadet nie, und Vorgreifen fordert. */
export function zieleFuerEtappe(profil) {
  const e = profil.etappe || 1;
  return ZIELE.filter(z => e >= z.etappe[0] && e <= z.etappe[1]);
}
export const zieleFuerKlasse = zieleFuerEtappe;   // alter Name, weiterhin gültig

export const etappeVon = profil => ETAPPEN.find(x => x.id === (profil.etappe || 1)) || ETAPPEN[0];

/* Ergebnis einer Aufgabe verbuchen */
export function verbuche(profil, { zielId, weg, level, richtig, bruecke, ms = 0,
                                   tippsGenutzt = 0, knacknuss = false, keineWertung = false,
                                   skizze = false }) {
  /* Wurde das Schmierblatt benutzt? Das ist keine Bewertung, sondern ein
     Hinweis darauf, WIE das Kind denkt - und bei welchen Zielen es den
     Umweg über ein Bild braucht. Zählt auch bei unbewerteten Aufgaben. */
  if (skizze) {
    profil.skizzen ||= {};
    profil.skizzen[zielId] = (profil.skizzen[zielId] || 0) + 1;
  }
  /* Denk-Impulse haben keine richtige Antwort. Sie zählen als getane Arbeit,
     fließen aber in keine Erfolgsquote ein – sonst wäre es eine Prüfung. */
  if (keineWertung) {
    const s = profil.stats;
    s.aufgabenGesamt++;
    s.tage[heute()] = (s.tage[heute()]||0) + 1;
    profil.wegeGenutzt[weg] = (profil.wegeGenutzt[weg]||0) + 1;
    tagesSerie(profil);
    pruefeAbzeichen(profil);
    speichern();
    return zielStand(profil, zielId);
  }

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
  if (richtig && knacknuss && tippsGenutzt === 0) s.ohneTipp++;
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
    brueckenRichtig: profil.stats.brueckenRichtig,
    ohneTipp: profil.stats.ohneTipp
  };
}

export function pruefeAbzeichen(profil) {
  const s = statsFuerAbzeichen(profil), neu = [];
  ABZEICHEN.forEach(a => {
    if (!profil.abzeichen.includes(a.id) && a.test(s)) { profil.abzeichen.push(a.id); neu.push(a); }
  });
  return neu;
}

/* ---------------------------------------------------------------------------
   Sicherung und Umzug.

   Zwei Fallen, die Fortschritt scheinbar verschwinden lassen:
   1. Eine zum Startbildschirm hinzugefuegte App und der Browser haben auf iOS
      GETRENNTE Speicher. Im Browser angelegte Profile sind in der App nicht da.
   2. Safari loescht Daten von Webseiten nach 7 Tagen ohne Benutzung (Tracking-
      Schutz). Auch das trifft eine Lern-App.
   Dagegen: dauerhaften Speicher anfordern und einen einfachen Umzugsweg
   anbieten, der ohne Dateien auskommt.
   --------------------------------------------------------------------------- */

export const exportieren = () => JSON.stringify(db, null, 2);

export function importieren(text) {
  const eingelesen = JSON.parse(text);
  if (!Array.isArray(eingelesen.profile)) throw new Error('Datei passt nicht.');
  db = { ...leer(), ...eingelesen };
  db.profile.forEach(migriere);
  speichern();
}

/* Fortschritt zusammenfuehren statt ersetzen: Profile mit gleicher Kennung
   werden nach Anzahl geloester Aufgaben behalten (der weitere Stand gewinnt). */
export function zusammenfuehren(text) {
  const fremd = JSON.parse(text);
  if (!Array.isArray(fremd.profile)) throw new Error('Diese Daten passen nicht.');
  let neu = 0, ersetzt = 0;
  fremd.profile.forEach(f => {
    migriere(f);
    const i = db.profile.findIndex(p => p.id === f.id);
    if (i < 0) { db.profile.push(f); neu++; return; }
    if ((f.stats?.aufgabenGesamt || 0) > (db.profile[i].stats?.aufgabenGesamt || 0)) {
      db.profile[i] = f; ersetzt++;
    }
  });
  if (!db.aktiv && db.profile.length) db.aktiv = db.profile[0].id;
  speichern();
  return { neu, ersetzt, gesamt: db.profile.length };
}

/* Umzugs-Code: der ganze Fortschritt als Text, den man kopieren und
   in der anderen Fassung wieder einfuegen kann. Keine Datei noetig. */
export function alsCode() {
  const roh = new TextEncoder().encode(JSON.stringify(db));
  let binaer = '';
  roh.forEach(b => { binaer += String.fromCharCode(b); });
  return btoa(binaer).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}

export function ausCode(code) {
  const sauber = String(code).trim().replace(/\s+/g,'').replace(/-/g,'+').replace(/_/g,'/');
  const binaer = atob(sauber + '==='.slice((sauber.length + 3) % 4));
  const bytes = Uint8Array.from(binaer, c => c.charCodeAt(0));
  return zusammenfuehren(new TextDecoder().decode(bytes));
}

/* Dauerhaften Speicher anfordern – verhindert das automatische Aufraeumen. */
export async function speicherSichern() {
  try {
    if (!navigator.storage?.persist) return { moeglich:false, dauerhaft:false };
    const schon = await navigator.storage.persisted?.();
    const dauerhaft = schon || await navigator.storage.persist();
    return { moeglich:true, dauerhaft };
  } catch { return { moeglich:false, dauerhaft:false }; }
}

export async function speicherStatus() {
  try {
    const dauerhaft = await navigator.storage?.persisted?.() ?? false;
    const platz = await navigator.storage?.estimate?.() ?? null;
    return { dauerhaft, belegt: platz?.usage ?? null };
  } catch { return { dauerhaft:false, belegt:null }; }
}

/* Laeuft die App vom Startbildschirm (eigener Speicher) oder im Browser? */
export function alsAppGestartet() {
  return window.matchMedia?.('(display-mode: standalone)')?.matches
      || window.navigator.standalone === true;
}

export function allesLoeschen() { db = leer(); speichern(); }

/* --------------------------- Lautlesen ---------------------------
   Gespeichert werden ausschliesslich Kennzahlen - nie eine Aufnahme, nie
   Ton, nie Text. Auch diese Zahlen bleiben auf dem Geraet. */
const LESUNGEN_MAX = 120;

export function merkeLesung(profil, werte) {
  profil.lesungen ||= [];
  profil.lesungen.push({ ...werte, wann: Date.now() });
  if (profil.lesungen.length > LESUNGEN_MAX)
    profil.lesungen.splice(0, profil.lesungen.length - LESUNGEN_MAX);
  speichern();
}

/* Der vorige Durchgang DESSELBEN Textes. Nur das ist vergleichbar - zwei
   verschiedene Texte unterscheiden sich staerker als zwei Leseversuche. */
export function letzteLesung(profil, titel, durchgang) {
  if (!durchgang || durchgang < 1) return null;
  const passend = (profil.lesungen || [])
    .filter(l => l.titel === titel && l.durchgang === durchgang);
  return passend.length ? passend[passend.length - 1] : null;
}

/* Entwicklung der Leseflüssigkeit fuer den Eltern-Bereich. Verglichen werden
   nur ERSTE Durchgaenge: Der dritte Durchgang eines geuebten Textes ist immer
   besser und wuerde einen Fortschritt vortaeuschen, den es nicht gibt. */
export function leseVerlauf(profil) {
  const erste = (profil.lesungen || []).filter(l => l.durchgang === 1);
  if (!erste.length) return null;
  const schnitt = (liste, feld) => liste.length
    ? Math.round(liste.reduce((s, l) => s + (l[feld] || 0), 0) / liste.length) : 0;
  const haelfte = Math.floor(erste.length / 2);
  const alt = erste.slice(0, haelfte), neu = erste.slice(haelfte);
  return {
    anzahl: erste.length,
    gesamt: (profil.lesungen || []).length,
    tempo: schnitt(erste, 'tempo'),
    tempoFrueher: haelfte ? schnitt(alt, 'tempo') : null,
    tempoZuletzt: schnitt(neu, 'tempo'),
    stockungen: schnitt(erste, 'stockungen'),
    stockungenFrueher: haelfte ? schnitt(alt, 'stockungen') : null,
    stockungenZuletzt: schnitt(neu, 'stockungen'),
    gleichmass: schnitt(erste, 'gleichmass'),
    betonung: schnitt(erste, 'betonung'),
    stufe: schnitt(erste, 'stufe'),
    /* Der ehrlichste Wert: Wie viel bringt das Wiederholen im selben Text? */
    wiederholung: (() => {
      const paare = [];
      for (const l of (profil.lesungen || []).filter(x => x.durchgang === 1)) {
        const spaeter = (profil.lesungen || []).find(x =>
          x.titel === l.titel && x.durchgang === 3 && x.wann > l.wann);
        if (spaeter) paare.push(spaeter.tempo - l.tempo);
      }
      return paare.length ? Math.round(paare.reduce((a, b) => a + b, 0) / paare.length) : null;
    })()
  };
}

/* Wo hilft eine Skizze? Fuer den Eltern-Bereich. Es geht nicht darum, ob viel
   oder wenig gemalt wird, sondern WO - das zeigt, welcher Zugang traegt. */
export function skizzenBild(profil) {
  const eintraege = Object.entries(profil.skizzen || {})
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1]);
  if (!eintraege.length) return null;
  const gesamt = eintraege.reduce((s, [, n]) => s + n, 0);
  return { gesamt, ziele: eintraege.slice(0, 5) };
}
