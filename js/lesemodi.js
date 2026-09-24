/* Echo-Lesen und Takt-Lesen – reine Rechenlogik, DOM- und Audio-frei.

   AUSGANGSPUNKT: Ein Kind mit Legasthenie liest oft stockend, lässt Wörter
   aus oder vertauscht sie – versteht aber Vorgelesenes gut. Die Stärke ist
   das HÖREN. Beide Modi bauen genau darauf auf:

   ECHO-LESEN (assisted reading / repeated reading nach Rasinski, hier mit
   drei Hilfestufen): Erst hört das Kind den Satz mit der Gerätestimme und
   sieht die Silbenmarkierung mitlaufen, dann liest es selbst nach ("Hören &
   mitschauen"). Wird das sicherer, liest die App nur noch LEISE mit
   ("Zusammen lesen", Chorlesen). Zuletzt liest das Kind allein. Die
   Hilfestufe wird automatisch angepasst (echoAnpassen), nie nach unten
   erzwungen.

   TAKT-LESEN (rhythmische Gliederung, wie sie aus der Silbenmethode bekannt
   ist): ein gleichmäßiger Schlag gibt dem Lesen Struktur, ohne Zeitdruck zu
   erzeugen – das Tempo wird aus dem, was das Kind selbst schon geschafft
   hat, abgeleitet (taktVorgabe) und nur in kleinen Schritten erhöht
   (taktAnpassen). Gemessen wird der tatsächliche Takt aus den Silbengipfeln
   der Aufnahme (taktMessen, baut auf Aussprache.gipfel auf).

   Nichts hier fasst DOM, Audio oder Speicher an – das erledigt js/ui.js bzw.
   js/store.js. So bleibt die Logik ohne Browser testbar. */

import { textInSilben } from './silben.js';
import { absatzInSaetze } from './textaufbereitung.js';
import { schwelleFuer, STOCKUNG_MS } from './lesen.js';

/* --------------------------------------------------------------------------
   Grundzustand je Profil (siehe store.js: p.lesemodus)
   -------------------------------------------------------------------------- */

/* echoStufe 1 = "Hören & mitschauen" (meiste Hilfe), 2 = "Zusammen lesen",
   3 = "Allein" (keine Hilfe mehr nötig). takt: zuletzt benutzte Takt-Vorgabe
   in Silben/Minute, null solange noch nichts gemessen wurde. verlauf: die
   letzten gemessenen Takt-Werte, siehe taktMessen. */
export function neuerLesemodusZustand() {
  return { echoStufe: 1, takt: null, guteFolge: 0, schwacheFolge: 0, verlauf: [] };
}

export const LESEMODUS_VERLAUF_MAX = 60;

/* Welcher Modus wird vorausgewählt? Solange die Echo-Hilfe noch gebraucht
   wird (Stufe 1 oder 2), ist "Echo" die Empfehlung. Braucht das Kind sie
   nicht mehr, gibt "Im Takt" dem freien Lesen weiterhin eine Struktur.
   "Allein" ist immer wählbar, wird aber nie von selbst vorgeschlagen –
   das Kind darf jederzeit wechseln. */
export function modusEmpfehlung(zustand) {
  const z = zustand || {};
  return (z.echoStufe ?? 1) < 3 ? 'echo' : 'takt';
}

const ECHO_STUFE_NAMEN = {
  1: 'braucht noch Vorlesen vorab',
  2: 'liest mit (Chorlesen)',
  3: 'liest allein'
};
export const echoStufeName = stufe => ECHO_STUFE_NAMEN[stufe] || ECHO_STUFE_NAMEN[1];

/* --------------------------------------------------------------------------
   Echo-Lesen: Hilfestufe anpassen

   Zwei gute Lesungen IN FOLGE (Einordnung mindestens "Meistens flüssig" ODER
   höchstens eine Stockung bei einem Tempo von mindestens 90% des eigenen
   bisherigen Medians) senken die Hilfe um eine Stufe. Zwei schwache
   Lesungen IN FOLGE (Einordnung "Wort für Wort") heben sie wieder an. Eine
   mittlere Lesung unterbricht beide Zählungen, ohne selbst etwas zu ändern
   – ein einzelner schwacher Tag soll nicht sofort die Stufe kippen.
   -------------------------------------------------------------------------- */
export function echoAnpassen(zustand, ergebnis) {
  const z = { ...neuerLesemodusZustand(), ...zustand };
  const stufe = ergebnis?.stufe ?? 0;
  const stockungen = ergebnis?.stockungen ?? Infinity;
  const tempo = ergebnis?.tempo ?? 0;
  const medianTempo = ergebnis?.medianTempo ?? 0;

  const gut = stufe >= 3 || (stockungen <= 1 && medianTempo > 0 && tempo >= medianTempo * 0.9);
  const schwach = stufe === 1;

  let { guteFolge, schwacheFolge, echoStufe } = z;
  if (gut) { guteFolge += 1; schwacheFolge = 0; }
  else if (schwach) { schwacheFolge += 1; guteFolge = 0; }
  else { guteFolge = 0; schwacheFolge = 0; }

  /* echoStufe 1 = meiste Hilfe, 3 = allein. Gute Lesungen -> WENIGER Hilfe,
     also eine Stufe HOCH; schwache Lesungen -> MEHR Hilfe, also eine Stufe
     RUNTER. */
  if (guteFolge >= 2) { echoStufe = Math.min(3, echoStufe + 1); guteFolge = 0; }
  if (schwacheFolge >= 2) { echoStufe = Math.max(1, echoStufe - 1); schwacheFolge = 0; }

  return { ...z, echoStufe, guteFolge, schwacheFolge };
}

/* --------------------------------------------------------------------------
   Ist eine Lesung mit Mikrofon überhaupt verwertbar?

   Die Aufnahme läuft mit echoCancellation:false (siehe js/ui.js, aufnahme()) -
   bewusst, weil eine Sprach-Erkennung hier nicht drin ist und die reine
   Lautstärke gebraucht wird. Genau deshalb landet aber auch jeder Ton, den
   die APP SELBST ausgibt, im Mikrofon: die Gerätestimme beim Chorlesen
   (Echo-Stufe 2) und der Metronom-Klick beim Takt-Lesen. taktMessen() würde
   dann den Klick statt das Kind messen, Lesen.auswerten() eine Computer-
   stimme statt das Kind - und alles, was daraus lernt (taktAnpassen,
   echoAnpassen, das Leseprofil, die Stolperwörter, das Silbenbild), würde
   aus falschen Daten lernen. Deshalb: In diesen zwei Fällen zählt die Lesung
   fürs Kind als geübt (Punkte wie immer), aber NICHT für Messung, Anpassung,
   Leseprofil, Stolperwörter oder Silbenbild - dafür lieber eine Runde ohne
   Zahlen als eine mit falschen. */
export function messungVerwertbar({ modus, echoStufe, klick } = {}) {
  if (modus === 'echo' && echoStufe === 2) return false;   // Chorlesen: eigene Stimme im Mikrofon
  if (modus === 'takt' && klick) return false;             // Klick-Ton im Mikrofon
  return true;
}

/* --------------------------------------------------------------------------
   Takt-Lesen: den tatsächlich gelesenen Takt messen

   Eingabe sind die Silbengipfel-Zeitpunkte, wie sie Aussprache.gipfel liefert
   (Liste von {ms, ...} ODER einfach Zahlen in ms). Gemessen wird:
     - silbenProMin: aus dem MEDIAN-Abstand zwischen zwei Silben (robust
       gegen einzelne sehr lange oder sehr kurze Abstände)
     - gleichmass: 100 minus Variationskoeffizient der Abstände in Prozent
     - taktBrueche: wie oft der Abstand mehr als doppelt so lang war wie der
       Median – das sind hörbare Stolperer, keine Satzpausen

   Pausen über 600 ms (Satzende, Komma, echtes Stocken) zählen nicht als
   "Taktabstand" mit, sonst würde eine richtige Lesepause fälschlich als
   "aus dem Takt gefallen" gewertet. Bei zu wenigen Gipfeln – zu wenig
   Material für einen ehrlichen Median – wird nichts behauptet: null. */
const TAKT_PAUSE_GRENZE_MS = 600;
const TAKT_MINDEST_GIPFEL = 4;

export function taktMessen(gipfelListe) {
  if (!Array.isArray(gipfelListe)) return null;
  const zeiten = gipfelListe
    .map(g => (typeof g === 'number' ? g : g?.ms))
    .filter(Number.isFinite)
    .sort((a, b) => a - b);
  if (zeiten.length < TAKT_MINDEST_GIPFEL) return null;

  const alleAbstaende = [];
  for (let i = 1; i < zeiten.length; i++) alleAbstaende.push(zeiten[i] - zeiten[i - 1]);

  const abstaende = alleAbstaende.filter(a => a <= TAKT_PAUSE_GRENZE_MS);
  if (abstaende.length < 3) return null;

  const sortiert = [...abstaende].sort((a, b) => a - b);
  const mitte = sortiert.length / 2;
  const median = Number.isInteger(mitte)
    ? (sortiert[mitte - 1] + sortiert[mitte]) / 2
    : sortiert[Math.floor(mitte)];
  if (!(median > 0)) return null;

  const mittel = abstaende.reduce((a, b) => a + b, 0) / abstaende.length;
  const streuung = Math.sqrt(abstaende.reduce((s, v) => s + (v - mittel) ** 2, 0) / abstaende.length);
  const variationskoeffizient = mittel > 0 ? streuung / mittel : 0;
  const gleichmass = Math.max(0, Math.min(100, Math.round(100 - variationskoeffizient * 100)));

  /* Nur unter den TATSAECHLICH gezaehlten Abstaenden (also ohne die schon
     herausgenommenen langen Pausen) - eine Pause am Satzende ist richtig
     und gut, kein Taktbruch. Ein Taktbruch ist ein Stolperer WAEHREND des
     Lesens: deutlich laenger als der eigene Median, aber noch keine echte
     Pause. */
  const taktBrueche = abstaende.filter(a => a > median * 2).length;

  return {
    silbenProMin: Math.round(60000 / median),
    gleichmass,
    taktBrueche,
    medianAbstandMs: Math.round(median)
  };
}

/* --------------------------------------------------------------------------
   Takt-Lesen: die nächste Vorgabe

   Startpunkt ohne jede Messung: 60 Silben/Minute – bewusst langsam, das ist
   ein ruhiges Mitklatsch-Tempo, keine Prüfung. Mit Messungen: 90% des
   Medians der letzten fünf gemessenen Tempi, damit die Vorgabe leicht unter
   dem liegt, was das Kind schon selbst geschafft hat – kein Wettlauf.
   -------------------------------------------------------------------------- */
export const TAKT_START_SILBEN_PRO_MIN = 60;
export const TAKT_MIN = 40;
export const TAKT_MAX = 220;

const median = werte => {
  const s = [...werte].sort((a, b) => a - b);
  const m = s.length / 2;
  return Number.isInteger(m) ? (s[m - 1] + s[m]) / 2 : s[Math.floor(m)];
};

export function taktVorgabe(zustand) {
  const verlauf = zustand?.verlauf || [];
  const letzte5 = verlauf.slice(-5).map(v => v.silbenProMin).filter(Number.isFinite);
  if (!letzte5.length) return TAKT_START_SILBEN_PRO_MIN;
  return Math.round(Math.max(TAKT_MIN, Math.min(TAKT_MAX, median(letzte5) * 0.9)));
}

/* --------------------------------------------------------------------------
   Takt-Lesen: die Vorgabe nach einer Runde anpassen

   Takt gehalten (mindestens 95% der Vorgabe, gleichmäßig genug, kaum
   Brüche) -> ein kleiner Schritt schneller (+5%, gedeckelt). Deutlich
   darunter geblieben oder viele Brüche -> ein kleiner Schritt langsamer
   (-5%). Dazwischen bleibt die Vorgabe unverändert – kein Grund, etwas zu
   ändern, was gerade passt. */
export function taktAnpassen(vorgabe, messung) {
  const v = Number.isFinite(vorgabe) ? vorgabe : TAKT_START_SILBEN_PRO_MIN;
  if (!messung || !Number.isFinite(messung.silbenProMin)) return v;
  const anteil = v > 0 ? messung.silbenProMin / v : 0;
  const gleichmass = messung.gleichmass ?? 0;
  const brueche = messung.taktBrueche ?? 0;

  let neu = v;
  if (anteil >= 0.95 && gleichmass >= 60 && brueche <= 2) neu = v * 1.05;
  else if (anteil < 0.80 || brueche > 4) neu = v * 0.95;

  return Math.round(Math.max(TAKT_MIN, Math.min(TAKT_MAX, neu)));
}

/* Kindgerechte Rückmeldung nach einer Takt-Runde, ohne Tadel. */
export function taktRueckmeldung(vorgabe, messung) {
  if (!messung) return 'Gut mitgemacht!';
  const anteil = vorgabe > 0 ? messung.silbenProMin / vorgabe : 0;
  if (anteil >= 0.95 && (messung.gleichmass ?? 0) >= 60 && (messung.taktBrueche ?? 0) <= 2)
    return 'Du hast den Takt gehalten 🥁';
  return 'Wir machen es beim nächsten Mal etwas ruhiger 🥁';
}

/* --------------------------------------------------------------------------
   Ein Plan aus dem Text: jede Silbe mit ihrer Zeichenposition im Text, dazu
   Wortzugehörigkeit und ob danach ein Satzende oder Komma folgt. Das ist die
   Brücke zwischen dem, was im Text steht, und zwei ganz unterschiedlichen
   Dingen, die beide einen charIndex kennen: die SpeechSynthesis-onboundary-
   Ereignisse (echte Stimme) und – als Fallback ohne solche Ereignisse – ein
   reiner Zeitplan aus der geschätzten Sprechrate.
   -------------------------------------------------------------------------- */
export function silbenPlan(text) {
  const stuecke = textInSilben(text);
  const plan = [];
  let pos = 0, wortIndex = -1, imWort = 0;
  for (const s of stuecke) {
    const von = pos;
    pos += s.text.length;
    if (s.typ === 'silbe') {
      if (imWort === 0) wortIndex += 1;
      plan.push({ index: plan.length, text: s.text, wortIndex, imWort,
        vonZeichen: von, bisZeichen: pos, satzEnde: false, komma: false });
      imWort += 1;
      continue;
    }
    if (s.typ === 'wortende') { imWort = 0; continue; }
    // Satzzeichen/Leerraum: markiert die zuletzt gelesene Silbe, falls vorhanden.
    if (plan.length) {
      if (/[.!?]/.test(s.text)) plan[plan.length - 1].satzEnde = true;
      else if (/,/.test(s.text)) plan[plan.length - 1].komma = true;
    }
  }
  return plan;
}

/* Welche Silbe (Index in silbenPlan) gehört zu einer Zeichenposition im
   Text? SpeechSynthesis liefert charIndex am WORTANFANG - gesucht ist also
   die letzte Silbe, deren Start nicht nach charIndex liegt. */
export function silbeBeiZeichen(plan, charIndex) {
  if (!Array.isArray(plan) || !plan.length || !Number.isFinite(charIndex)) return -1;
  let treffer = 0;
  for (let i = 0; i < plan.length; i++) {
    if (plan[i].vonZeichen <= charIndex) treffer = i;
    else break;
  }
  return treffer;
}

export function wortBeiZeichen(plan, charIndex) {
  const i = silbeBeiZeichen(plan, charIndex);
  return i >= 0 ? plan[i].wortIndex : -1;
}

export const silbenDesWorts = (plan, wortIndex) => plan.filter(s => s.wortIndex === wortIndex);

/* --------------------------------------------------------------------------
   Zeitplan-Fallback: Manche Geräte liefern keine onboundary-Ereignisse. Dann
   bewegt sich die Markierung nach einem errechneten Zeitplan mit, aus der
   geschätzten Sprechrate (Silben pro Sekunde, abhängig vom vorlesen()-Tempo)
   und mit Pausen an Satzzeichen - eine kurze an Kommas, eine längere am
   Satzende. Kein Anspruch auf Millisekunden-Genauigkeit; es geht nur darum,
   dass die Markierung plausibel mitwandert, statt stillzustehen. */
export const BASIS_SILBEN_PRO_SEK = 3.2;    // bei Sprache-Tempo 1 (Normaltempo)
export const SATZPAUSE_MS = 450;
export const KOMMAPAUSE_MS = 200;

export function zeitplanErstellen(text, { tempo = 0.85 } = {}) {
  const plan = silbenPlan(text);
  const rate = Math.max(0.5, BASIS_SILBEN_PRO_SEK * tempo);
  const proSilbeMs = 1000 / rate;
  let t = 0;
  const silben = plan.map(s => {
    /* Etwas laengere Silben (mehr Buchstaben) bekommen etwas mehr Zeit -
       grob, aber besser als jede Silbe exakt gleich lang zu behaupten. */
    const laengenFaktor = Math.max(0.6, Math.min(1.6, s.text.length / 3));
    const dauerMs = Math.round(proSilbeMs * laengenFaktor);
    const eintrag = { ...s, startMs: Math.round(t), dauerMs };
    t += dauerMs;
    if (s.satzEnde) t += SATZPAUSE_MS;
    else if (s.komma) t += KOMMAPAUSE_MS;
    return eintrag;
  });
  return { silben, gesamtMs: Math.round(t) };
}

/* Welche Silbe ist laut Zeitplan zu einem gegebenen Zeitpunkt (ms seit
   Beginn) dran? Für den Fallback ohne onboundary. */
export function silbeBeiZeit(zeitplan, ms) {
  const silben = zeitplan?.silben || [];
  if (!silben.length || !Number.isFinite(ms)) return -1;
  if (ms < 0) return -1;
  for (let i = silben.length - 1; i >= 0; i--) {
    if (silben[i].startMs <= ms) return i;
  }
  return 0;
}

/* --------------------------------------------------------------------------
   Einzähl-Takt vor "Im Takt": vier sichtbare (und optional hörbare) Schläge
   "1 - 2 - 3 - los", im selben Schlagabstand wie die Vorgabe. Rein rechnerisch
   - Ton/Anzeige macht js/ui.js. */
export function einzaehlPlan(vorgabeSilbenProMin) {
  const schlagMs = Math.max(200, 60000 / Math.max(TAKT_MIN, vorgabeSilbenProMin || TAKT_START_SILBEN_PRO_MIN));
  return ['1', '2', '3', 'los'].map((wort, i) => ({ wort, startMs: Math.round(i * schlagMs) }));
}

/* Schlagfolge für den Ball im Takt-Modus: ein Schlag je Silbe, mit einem
   zusätzlichen Schlag Pause an Satzenden und einem halben Schlag an Kommas -
   genau wie beim echten Lautlesen darf man an Satzzeichen Luft holen. */
export function taktSchlagfolge(text, vorgabeSilbenProMin) {
  const schlagMs = Math.max(200, 60000 / Math.max(TAKT_MIN, vorgabeSilbenProMin || TAKT_START_SILBEN_PRO_MIN));
  const plan = silbenPlan(text);
  let t = 0;
  const silben = plan.map(s => {
    const eintrag = { ...s, startMs: Math.round(t) };
    t += schlagMs;
    if (s.satzEnde) t += schlagMs;
    else if (s.komma) t += schlagMs / 2;
    return eintrag;
  });
  return { silben, schlagMs, gesamtMs: Math.round(t) };
}

/* --------------------------------------------------------------------------
   Echo-Lesen, Stufe 1, WIRKLICH Satz für Satz.

   Damit "Echo" wirkt, muss das Kind unmittelbar nach dem Hören GENAU
   DENSELBEN kurzen Abschnitt lesen (Rasinski) - nicht erst den ganzen Text
   hören und danach den ganzen Text lesen. Dafür wird der Text in Sätze
   geteilt (dieselbe Abkürzungs-/Ordnungszahlen-Erkennung wie bei den
   Lese-Abschnitten aus eigenen Texten, siehe js/textaufbereitung.js), und
   die Mikrofon-Aufnahme läuft nur während der "Jetzt du"-Phase je Satz -
   die Werte aus der Hör-Phase werden verworfen. Die einzelnen Kind-Segmente
   werden am Ende mit einer kurzen künstlichen Stille aneinandergehängt und
   wie ein normaler Lesetext EINMAL ausgewertet. -------------------------- */

/* Reine Satzteilung - Wrapper um dieselbe Abkürzungs-/Ordnungszahlen-Logik
   wie bei "Meine Texte" (js/textaufbereitung.js), damit "Dr. Müller" oder
   "3. Klasse" nicht fälschlich als Satzende gilt. */
export function saetzeTeilen(text) {
  const normalisiert = String(text ?? '').replace(/\s+/g, ' ').trim();
  if (!normalisiert) return [];
  return absatzInSaetze(normalisiert);
}

/* Künstliche Stille zwischen zwei Kind-Segmenten. Bewusst UNTER STOCKUNG_MS
   (siehe js/lesen.js) gewählt: eine eingefügte Satzpause soll beim
   Auswerten als Pause zählen dürfen (das ist sie ja, an einem Satzende),
   aber NICHT als Stockung - eine Stockung ist eine Pause, die es MEHR gibt,
   als der Text Satzzeichen hat, und die künstliche Pause steht genau an
   einer Satzgrenze. */
export const ECHO_STILLE_MS = 300;
/* Selbstprüfung, kein Zufall: solange diese Konstante wahr ist, kann die
   eingefügte Satzpause nicht fälschlich als Stockung gezählt werden. */
export const ECHO_STILLE_IST_KEINE_STOCKUNG = ECHO_STILLE_MS < STOCKUNG_MS;

/* Mehrere Hüllkurven-Segmente (z. B. je Satz eine, aus der "Jetzt du"-Phase)
   zu einer Aufnahme verketten - mit kurzer Stille dazwischen statt der
   echten Zeit, die für Vorlesen/Hinweise verstrichen ist. */
export function huellkurvenVerketten(segmente, { stilleMs = ECHO_STILLE_MS, schrittMs = 10 } = {}) {
  const stilleSchritte = Math.max(0, Math.round(stilleMs / schrittMs));
  const raus = [];
  (segmente || []).forEach((segment, i) => {
    if (i > 0) for (let k = 0; k < stilleSchritte; k++) raus.push(0);
    for (const wert of (segment || [])) raus.push(wert);
  });
  return raus;
}

/* Automatisches Ende der "Jetzt du"-Aufnahme: Es muss WIRKLICH gesprochen
   worden sein (sonst würde die Aufnahme sofort "fertig" sein, bevor das
   Kind angefangen hat), und danach für STILLE_ENDE_MS am Stück Ruhe
   herrschen. Reine Funktion auf einem Ausschnitt der Hüllkurve - ob dieser
   Ausschnitt "gerade eben aufgenommen wurde", weiß js/ui.js. */
export const STILLE_ENDE_MS = 1200;
const MINDEST_SPRECH_MS = 250;

export function stilleEndeErkannt(huellkurve, schrittMs = 10, { stilleMs = STILLE_ENDE_MS, mindestSprechMs = MINDEST_SPRECH_MS } = {}) {
  if (!huellkurve || huellkurve.length < 2) return false;
  const schwelle = schwelleFuer(huellkurve);
  const laut = huellkurve.map(v => v > schwelle);

  const sprechSchritte = Math.max(1, Math.round(mindestSprechMs / schrittMs));
  let lauffolge = 0, hatGesprochen = false;
  for (const l of laut) {
    lauffolge = l ? lauffolge + 1 : 0;
    if (lauffolge >= sprechSchritte) { hatGesprochen = true; break; }
  }
  if (!hatGesprochen) return false;

  const stilleSchritte = Math.max(1, Math.round(stilleMs / schrittMs));
  if (laut.length < stilleSchritte) return false;
  return laut.slice(-stilleSchritte).every(v => !v);
}

/* --------------------------------------------------------------------------
   Boundary-Ereignisse innerhalb eines Wortes: Punkt 3 der Chef-Korrektur.

   SpeechSynthesis liefert "boundary" nur am WORTANFANG - innerhalb eines
   mehrsilbigen Wortes bliebe die Markierung sonst auf der ersten Silbe
   stehen, bis das nächste Wort beginnt. Stattdessen: einen Zeitplan NUR für
   die Silben dieses einen Wortes bauen (Silbenzahl × geschätzte Silbendauer
   aus dem Sprech-Tempo) - js/ui.js schaltet danach mit eigenen Timern durch
   diese Liste, bis das nächste boundary-Ereignis dazwischenfunkt. */
export function wortSilbenZeitplan(silbenDesWorts, tempo = 0.85) {
  const rate = Math.max(0.5, BASIS_SILBEN_PRO_SEK * tempo);
  const proSilbeMs = 1000 / rate;
  let t = 0;
  return (silbenDesWorts || []).map(s => {
    const eintrag = { ...s, startMs: Math.round(t) };
    t += proSilbeMs;
    return eintrag;
  });
}
