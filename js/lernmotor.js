/* Lernmotor: was einem Kind gerade schwerfaellt, kommt in wachsenden
   Abstaenden wieder – statt zufaellig oder gar nicht. Reine Logik, kein
   Speicherzugriff (das macht js/store.js), kein DOM (das macht js/ui.js).

   Drei Bausteine:
   1. Leitner-Kaesten je "Lernelement" (ein einzelnes Wort, ein Buchstaben-
      paar, ein Satz, …): richtig -> naechster Kasten, falsch -> zurueck auf
      Kasten 1. Je hoeher der Kasten, desto spaeter kommt das Element wieder.
   2. Lernzonen-Regel: die Trefferquote je Lernziel soll sich bei ~75-85 %
      einpendeln – zu leicht langweilt, zu schwer entmutigt.
   3. Tagesminuten und Sammelalbum: Motivation ohne Druck, ohne Zufall
      (keine Lootbox), ohne je Punkte abzuziehen.

   Alles hier ist rein rechnerisch und mit einer festen Uhr (Parameter
   "jetzt") testbar – siehe tests/lernmotor.mjs. */

const TAG_MS = 86400000;
const heuteISO = jetzt => new Date(jetzt).toISOString().slice(0, 10);

/* ============================================================================
   1. Leitner-Kaesten
   ============================================================================ */

/* Index = Kasten-1. Kasten 1 kommt sofort wieder (noch nicht gekonnt), Kasten 5
   erst nach zwei Wochen (praktisch gemeistert, nur noch zur Auffrischung). */
export const INTERVALLE_TAGE = [0, 1, 3, 7, 14];
export const KASTEN_MAX = 5;
export const KAESTEN_OBERGRENZE = 400;

/* Ein Element nach einer Antwort einsortieren. Gibt den neuen Eintrag zurueck. */
export function kastenVerbuchen(kaesten, schluessel, richtig, jetzt = Date.now()) {
  const alt = kaesten[schluessel];
  const kasten = richtig ? Math.min(KASTEN_MAX, (alt?.kasten || 0) + 1) : 1;
  const faelligAm = jetzt + INTERVALLE_TAGE[kasten - 1] * TAG_MS;
  kaesten[schluessel] = { kasten, faelligAm, zuletzt: jetzt };
  kaestenDeckel(kaesten);
  return kaesten[schluessel];
}

/* Hoechstens KAESTEN_OBERGRENZE Elemente merken. Werden es mehr, fliegen
   zuerst die am weitesten gemeisterten (hoher Kasten) heraus, die zugleich am
   laengsten nicht mehr drankamen – ungelernte (niedriger Kasten) bleiben
   erhalten, denn genau die braucht die App noch am dringendsten. */
function kaestenDeckel(kaesten) {
  const schluessel = Object.keys(kaesten);
  if (schluessel.length <= KAESTEN_OBERGRENZE) return;
  const sortiert = schluessel
    .map(k => ({ k, ...kaesten[k] }))
    .sort((a, b) => (b.kasten - a.kasten) || (a.zuletzt - b.zuletzt));
  sortiert.slice(0, schluessel.length - KAESTEN_OBERGRENZE)
    .forEach(x => delete kaesten[x.k]);
}

/* Welche Elemente sind heute (oder frueher) faellig? Am wenigsten Gekonntes
   (niedrigster Kasten) zuerst. */
export function faelligeSchluessel(kaesten, jetzt = Date.now()) {
  return Object.entries(kaesten || {})
    .filter(([, k]) => k.faelligAm <= jetzt)
    .sort((a, b) => a[1].kasten - b[1].kasten)
    .map(([k]) => k);
}

/* Anzahl Elemente je Kasten (1..5) – die kleinen Balken im Eltern-Bereich. */
export function kaestenVerteilung(kaesten) {
  const v = [0, 0, 0, 0, 0];
  Object.values(kaesten || {}).forEach(k => {
    if (k.kasten >= 1 && k.kasten <= KASTEN_MAX) v[k.kasten - 1]++;
  });
  return v;
}

/* Die N schwierigsten Elemente (niedrigster Kasten zuerst) – roh als
   Schluessel, damit ui.js daraus einen lesbaren Text macht. */
export function schwierigsteSchluessel(kaesten, n = 8) {
  return Object.entries(kaesten || {})
    .filter(([, k]) => k.kasten < KASTEN_MAX)
    .sort((a, b) => (a[1].kasten - b[1].kasten) || (b[1].zuletzt - a[1].zuletzt))
    .slice(0, n)
    .map(([schluessel, k]) => ({ schluessel, kasten: k.kasten }));
}

/* ============================================================================
   2. Lernzonen-Regel: Trefferquote je Ziel bei ~75-85 % halten.
   Ergaenzt die bestehende "4 richtig in Folge -> Level hoch"-Regel (die bleibt
   als schneller Aufstieg bestehen), korrigiert aber zusaetzlich ueber ein
   gleitendes Fenster der letzten Antworten – so pendelt sich die Quote ein,
   statt nach oben oder unten auszureissen.
   ============================================================================ */

export const FENSTER_LAENGE = 10;
export const FENSTER_MINDESTENS = 6;   // vorher ist ein Ausschlag zu zufaellig
const HOCH_AB = 0.90;
const RUNTER_UNTER = 0.65;

/* Neuer Fensterstand nach einer Antwort (aeltere Eintraege fallen heraus). */
export function fensterAktualisieren(fenster, richtig) {
  const f = [...(fenster || []), !!richtig];
  if (f.length > FENSTER_LAENGE) f.splice(0, f.length - FENSTER_LAENGE);
  return f;
}

/* -1 (Level runter), 0 (bleiben) oder +1 (Level hoch) je nach Trefferquote
   im Fenster. Ohne genug Daten wird nichts veraendert. */
export function lernzonenSchritt(fenster) {
  if (!fenster || fenster.length < FENSTER_MINDESTENS) return 0;
  const quote = fenster.filter(Boolean).length / fenster.length;
  if (quote > HOCH_AB) return 1;
  if (quote < RUNTER_UNTER) return -1;
  return 0;
}

/* ============================================================================
   3a. Tagesminuten: echte Uebungszeit in Lese-Aufgaben.

   Wichtig: gespeichert wird intern in SEKUNDEN, nicht in (gerundeten)
   Minuten. Wuerde jede einzelne Aufgabe schon beim Addieren auf 0,1 Minuten
   gerundet, gingen kurze Aufgaben unter 3 Sekunden komplett verloren (sie
   runden auf 0,0) und alle anderen wuerden systematisch leicht verfaelscht.
   Gerundet wird ausschliesslich fuer die ANZEIGE (minutenAn/minutenVerlauf).

   Zwei weitere Sicherungen gegen falsche Werte:
   - MAX_MS_JE_AUFGABE deckelt, was EINE Aufgabe zum Tagesziel beitragen darf -
     bleibt das Geraet 40 Minuten auf einer Aufgabe liegen (z. B. am Nachttisch
     vergessen), zaehlt das nicht als 40 Minuten Lesen.
   - Eintraege aelter als MINUTEN_AUFBEWAHRUNG_TAGE werden bei jeder Buchung
     aufgeraeumt, sonst waechst tagesminuten auf Dauer unbegrenzt.
   ============================================================================ */

export const TAGESZIEL_STANDARD = 10;
export const TAGESZIEL_OPTIONEN = [5, 10, 15];
export const MAX_MS_JE_AUFGABE = 3 * 60000;      // hoechstens 3 Minuten je einzelner Aufgabe
const MINUTEN_AUFBEWAHRUNG_TAGE = 60;

/* Rohwert in Sekunden fuer einen Tag - intern, nicht gerundet. */
function sekundenAn(tagesminuten, jetzt = Date.now()) {
  return tagesminuten[heuteISO(jetzt)] || 0;
}

/* Eintraege aelter als MINUTEN_AUFBEWAHRUNG_TAGE entfernen, damit das Objekt
   nicht ueber Jahre hinweg unbegrenzt waechst. */
function tagesminutenAufraeumen(tagesminuten, jetzt = Date.now()) {
  const grenze = heuteISO(jetzt - MINUTEN_AUFBEWAHRUNG_TAGE * TAG_MS);
  for (const tag of Object.keys(tagesminuten)) {
    if (tag < grenze) delete tagesminuten[tag];
  }
}

/* "ms" ist die Dauer EINER Aufgabe (schon vor dem Aufruf sinnvoll gewaehlt -
   siehe js/store.js: bevorzugt die tatsaechlich gemessene Lesedauer, sonst
   die verstrichene Zeit) und wird hier zusaetzlich je Aufgabe gedeckelt. */
export function minutenHinzufuegen(tagesminuten, ms, jetzt = Date.now()) {
  const gedeckelt = Math.min(Math.max(0, ms || 0), MAX_MS_JE_AUFGABE);
  const tag = heuteISO(jetzt);
  tagesminuten[tag] = sekundenAn(tagesminuten, jetzt) + gedeckelt / 1000;
  tagesminutenAufraeumen(tagesminuten, jetzt);
  return tagesminuten;
}

/* Fuer die Anzeige gerundet auf 0,1 Minuten - die Rundung passiert also erst
   hier, nicht schon beim Speichern (siehe Kommentar oben). */
export function minutenAn(tagesminuten, jetzt = Date.now()) {
  return Math.round(sekundenAn(tagesminuten, jetzt) / 60 * 10) / 10;
}

/* Die letzten n Tage (Standard 7), aelteste zuerst – fuer den Verlauf im
   Eltern-Bereich. Tage ohne Uebung erscheinen mit 0 Minuten, nicht als Luecke. */
export function minutenVerlauf(tagesminuten, jetzt = Date.now(), n = 7) {
  const raus = [];
  for (let i = n - 1; i >= 0; i--) {
    const zeitpunkt = jetzt - i * TAG_MS;
    raus.push({ tag: heuteISO(zeitpunkt), minuten: minutenAn(tagesminuten, zeitpunkt) });
  }
  return raus;
}

/* Exakter Vergleich in Sekunden statt ueber den (gerundeten) Anzeigewert -
   sonst koennte das Tagesziel durch Rundung minimal zu frueh oder zu spaet
   als erreicht gelten. */
export function tageszielErreicht(tagesminuten, ziel, jetzt = Date.now()) {
  return sekundenAn(tagesminuten, jetzt) >= ziel * 60;
}

/* ============================================================================
   3b. Lese-Serie: an wie vielen Tagen in Folge wurde geuebt? Dieselbe Idee wie
   die allgemeine Lern-Serie in store.js, aber unabhaengig davon gefuehrt, weil
   sie an das TAGESZIEL LESEN geknuepft ist, nicht an irgendeine Aufgabe.
   ============================================================================ */

export function leseSerieAktualisieren(leseSerie, jetzt = Date.now()) {
  const heute = heuteISO(jetzt);
  if (leseSerie.letzterTag === heute) return leseSerie;
  const gestern = heuteISO(jetzt - TAG_MS);
  leseSerie.serie = leseSerie.letzterTag === gestern ? (leseSerie.serie || 0) + 1 : 1;
  leseSerie.letzterTag = heute;
  return leseSerie;
}

/* ============================================================================
   3c. Sammelalbum: feste Reihenfolge, keine Zufallsbelohnung (keine Lootbox).
   Jeder Sticker hat einen festen Platz; freigeschaltet wird der jeweils
   naechste in der Reihe, nie ein zufaelliger.
   ============================================================================ */

export const ALBUM_STICKER = [
  '🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮',
  '🐷','🐸','🐵','🐔','🐧','🐦','🦆','🦉','🦇','🐺',
  '🐗','🐴','🦄','🐝','🐛','🦋','🐌','🐞','🐢','🐍',
  '🦎','🐙','🦑','🦀','🐡','🐠','🐟','🐬','🐳','🐊',
  '🐘','🦒','🦓','🦍'
];

/* Der Sticker, der als naechstes an der Reihe waere (fuer die Anzeige, bevor
   er ausgeloest wird). null, wenn das Album schon voll ist. */
export function naechsterSticker(album) {
  const i = (album?.eintraege || []).length;
  return i < ALBUM_STICKER.length ? ALBUM_STICKER[i] : null;
}

/* Naechsten freien Sticker vergeben. "grund" ist ein kurzer, fester
   Kennzeichner ('tagesziel', 'kasten5', 'leseserie3', …), damit ui.js dazu
   einen freundlichen Text zeigen kann. Gibt den neuen Eintrag zurueck, oder
   null, wenn das Album schon voll ist. */
export function stickerFreischalten(album, grund, jetzt = Date.now()) {
  album.eintraege ||= [];
  const sticker = naechsterSticker(album);
  if (!sticker) return null;
  const eintrag = { sticker, grund, wann: jetzt };
  album.eintraege.push(eintrag);
  return eintrag;
}

/* ============================================================================
   Migration: alte Profile bekommen die neuen Felder additiv dazu.
   ============================================================================ */

export function migriereLernZustand(p) {
  p.kaesten ||= {};                 // je Lernelement: { kasten, faelligAm, zuletzt }
  p.tagesziel ??= TAGESZIEL_STANDARD;   // Minuten Lesen pro Tag (Elternwunsch)
  p.tagesminuten ||= {};             // je Datum (YYYY-MM-DD): geuebte Lesezeit in SEKUNDEN
  /* Einmalige Migration: eine frueher ausgelieferte Fassung speicherte hier
     bereits auf 0,1 Minuten gerundete Minutenwerte statt Sekunden. Ohne diese
     Umrechnung wuerden bestehende Werte ploetzlich als Sekunden gelesen und
     wirkten 60-mal kleiner. Der Schalter sorgt dafuer, dass das nur EINMAL
     je Profil passiert. */
  if (!p._tagesminutenInSekunden) {
    for (const tag of Object.keys(p.tagesminuten)) p.tagesminuten[tag] = (p.tagesminuten[tag] || 0) * 60;
    p._tagesminutenInSekunden = true;
  }
  p.album ||= { eintraege: [] };     // Sammelalbum: feste Reihenfolge
  p.album.meilensteine ||= {};       // welche Einmal-Meilensteine schon Sticker gaben
  p.leseSerie ||= { letzterTag: null, serie: 0 };
  p.zielFenster ||= {};              // je Ziel: gleitendes Fenster der letzten Antworten
  return p;
}

/* Meilenstein-Sticker: anders als das Tagesziel (das jeden Tag neu erreicht
   werden kann) darf ein Meilenstein wie "10 Elemente in Kasten 5" nur EIN
   einziges Mal einen Sticker geben, auch wenn die Bedingung danach dauerhaft
   erfuellt bleibt. album.meilensteine merkt, welche schon abgegolten sind. */
export function meilensteinFreischalten(album, id, jetzt = Date.now()) {
  album.meilensteine ||= {};
  if (album.meilensteine[id]) return null;
  const eintrag = stickerFreischalten(album, id, jetzt);
  if (eintrag) album.meilensteine[id] = true;
  return eintrag;
}
