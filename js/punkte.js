/* Punkte, Ränge und der Vergleich.

   Die App war bewusst ohne Noten gebaut. Punkte sind trotzdem richtig – aber
   nur, wenn sie nicht dasselbe tun wie Noten. Der Unterschied liegt in vier
   Entscheidungen:

   1. PUNKTE GEHEN NIE VERLOREN. Eine falsche Antwort gibt null, niemals Abzug.
      Wer Angst vor Punktverlust hat, wählt die leichte Aufgabe – und lernt
      weniger. Der Punktestand kann nur steigen.

   2. SCHWERER GIBT MEHR. Die Stufe zählt kräftig mit. Damit lohnt sich das
      Schwierige, statt sich das Leichte zu lohnen.

   3. AUCH DAS UNBEWERTETE ZÄHLT. Ein Denk-Impuls, ein freies Bild, ein
      vorgelesener Text bekommen Punkte fürs Machen – sonst wären sie im
      Punktesystem tote Aufgaben, und genau die wären dann die, die niemand
      mehr anfasst. Sie geben weniger, aber sie geben.

   4. VERGLICHEN WIRD MIT SICH SELBST UND MIT DER FAMILIE. Es gibt keine
      Bestenliste im Netz – es gibt keinen Server. Verglichen wird die eigene
      beste Runde und, wer will, die Geschwister auf demselben Gerät. Das ist
      der Vergleich, der Kinder wirklich interessiert.

   Tipps kosten etwas, aber nie alles: Wer sich durchbeißt, bekommt mehr als
   wer sich durchhelfen lässt – aber Hilfe zu holen bleibt besser, als
   aufzugeben. Deshalb gibt es einen Boden. */

export const GRUNDWERT = 10;
export const JE_STUFE = 4;
export const SERIE_MAX = 5;      // ab hier wächst der Serienbonus nicht weiter
export const JE_SERIE = 2;
export const KNACKNUSS_BONUS = 10;
export const TIPP_KOSTET = 3;
export const BODEN = 5;          // so viel bleibt immer, egal wie viele Tipps
export const FUERS_MACHEN = 5;   // unbewertete Aufgaben: Punkte fürs Tun

/* Punkte für EINE Aufgabe. */
export function punkteFuer({ richtig, level = 1, serie = 0, tipps = 0,
                             knacknuss = false, keineWertung = false } = {}) {
  if (keineWertung) return FUERS_MACHEN;
  if (!richtig) return 0;                     // nie Abzug, nur nichts

  let p = GRUNDWERT + JE_STUFE * Math.max(1, Math.min(5, level));
  p += Math.min(serie, SERIE_MAX) * JE_SERIE;
  if (knacknuss) p += KNACKNUSS_BONUS;
  p -= tipps * TIPP_KOSTET;
  return Math.max(BODEN, Math.round(p));
}

/* Ränge. Die Abstände wachsen, damit der Anfang schnell geht und später
   etwas dranhängt – aber nie so steil, dass es aussichtslos wirkt. */
export const RAENGE = [
  { ab: 0,     name: 'Neugierig',    emoji: '🌱' },
  { ab: 250,   name: 'Entdecker:in', emoji: '🔍' },
  { ab: 750,   name: 'Übende:r',     emoji: '🧩' },
  { ab: 1800,  name: 'Kenner:in',    emoji: '📘' },
  { ab: 3500,  name: 'Könner:in',    emoji: '⚙️' },
  { ab: 6500,  name: 'Meister:in',   emoji: '🏛️' },
  { ab: 11000, name: 'Denker:in',    emoji: '🦉' },
  { ab: 18000, name: 'Gelehrte:r',   emoji: '🌟' }
];

export function rang(punkte = 0) {
  let jetzt = RAENGE[0], stelle = 0;
  RAENGE.forEach((r, i) => { if (punkte >= r.ab) { jetzt = r; stelle = i; } });
  const naechster = RAENGE[stelle + 1] || null;
  return {
    ...jetzt, stelle,
    naechster,
    bisZumNaechsten: naechster ? naechster.ab - punkte : 0,
    /* Anteil auf dem Weg zum nächsten Rang, für den Balken. */
    anteil: naechster
      ? Math.max(0, Math.min(1, (punkte - jetzt.ab) / (naechster.ab - jetzt.ab)))
      : 1
  };
}

/* Was eine Runde eingebracht hat, im Vergleich zur bisher besten. */
export function rundenBlick(punkteDieserRunde, besteBisher = 0) {
  if (punkteDieserRunde > besteBisher)
    return { rekord: true, text: `Neue Bestleistung: ${punkteDieserRunde} Punkte!`,
             vorher: besteBisher };
  const fehlt = besteBisher - punkteDieserRunde;
  return {
    rekord: false, vorher: besteBisher,
    text: fehlt === 0
      ? `Genau so viel wie deine beste Runde: ${besteBisher} Punkte.`
      : `${punkteDieserRunde} Punkte. Deine beste Runde: ${besteBisher}.`
  };
}

/* Die Reihenfolge für den Vergleich auf dem Gerät. Bewusst mit dem Hinweis,
   dass Kinder verschiedenen Alters nicht dasselbe Spiel spielen. */
export function rangliste(profile = []) {
  return profile
    .map(p => ({
      id: p.id, name: p.name, avatar: p.avatar,
      punkte: p.stats?.punkte || 0,
      etappe: p.etappe || 1,
      aufgaben: p.stats?.aufgabenGesamt || 0,
      rang: rang(p.stats?.punkte || 0)
    }))
    .sort((a, b) => b.punkte - a.punkte);
}

/* Wie viele Aufgaben trennen zwei Punktestände ungefähr? Verständlicher als
   die nackte Differenz - "noch etwa 12 Aufgaben" kann sich ein Kind vorstellen. */
export const etwaAufgaben = (differenz, schnitt = 18) =>
  Math.max(1, Math.round(differenz / Math.max(1, schnitt)));
