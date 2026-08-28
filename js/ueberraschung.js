/* Überraschungsrätsel des Tages.

   Der Reiz ist nicht die Schwierigkeit, sondern die Überraschung: man weiß
   nie im Voraus, welche Art Rätsel heute wartet, und morgen gibt es ein
   neues - ein kleiner, ehrlicher Grund, öfter vorbeizuschauen. "Ehrlich"
   heißt hier vor allem: für ALLE Kinder an diesem Kalendertag dasselbe
   Rätsel, so wie beim Wordle-Prinzip - sonst wäre "das heutige Rätsel"
   nur eine hübsche Umschreibung für "irgendein zufälliges Rätsel", und
   Geschwister könnten sich nicht mehr darüber austauschen, wer es zuerst
   hatte.

   Deshalb KEIN Math.random() hier: alles hängt am Kalendertag (siehe
   seedVonDatum) und ist damit auf jedem Gerät identisch, ohne dass
   irgendetwas übers Netz geholt werden müsste. */

/* Kleiner seedbarer Zufallsgenerator (mulberry32) - Math.random() lässt
   sich nicht auf einen Startwert festlegen, das hier schon. */
function mulberry32(seed) {
  let t = seed >>> 0;
  return function () {
    t = (t + 0x6D2B79F5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function seedVonDatum(datumStr) {
  let h = 0;
  for (let i = 0; i < datumStr.length; i++) h = (h * 31 + datumStr.charCodeAt(i)) | 0;
  return h >>> 0;
}

function shuffleSeeded(arr, rnd) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const heutigesDatum = () => new Date().toISOString().slice(0, 10);

/* -------------------------------------------------------- Zahlenpyramide
   Jeder Stein ist die Summe der zwei Steine direkt darunter - die Basis
   steht immer vollständig da, genau EIN Stein darüber fehlt. Weil nur
   dieser eine fehlt, sind seine beiden Kinder immer sichtbar: reine
   Addition reicht zum Lösen, keine Umkehrrechnung nötig. */
function pyramide(rnd) {
  const basis = Array.from({ length: 4 }, () => 1 + Math.floor(rnd() * 9));
  const reihen = [basis];
  for (let r = 0; r < 3; r++) {
    const vorher = reihen[reihen.length - 1];
    reihen.push(vorher.slice(0, -1).map((v, i) => v + vorher[i + 1]));
  }
  const versteckteReihe = 1 + Math.floor(rnd() * 3);     // nie die Basis (Reihe 0)
  const versteckteSpalte = Math.floor(rnd() * reihen[versteckteReihe].length);
  return {
    typ: 'pyramide',
    titel: '🔺 Die Zahlenpyramide',
    hinweis: 'Jeder Stein ist die Summe der zwei Steine direkt darunter. Welche Zahl fehlt?',
    reihen,
    versteckt: { reihe: versteckteReihe, spalte: versteckteSpalte },
    antwort: String(reihen[versteckteReihe][versteckteSpalte])
  };
}

/* ---------------------------------------------------------- Waage-Rätsel
   Zwei Bild-Gleichungen, aus denen sich der Wert jedes Symbols ableiten
   lässt - erst halbieren, dann abziehen. Bewusst ohne negative Zahlen: das
   Rätsel soll überraschen und Lust machen, nicht mit einer ungewohnten
   Rechenart zusätzlich bremsen. */
const SYMBOLE = ['🍎', '🍌', '🍇', '🥕', '⭐', '🎈', '🐚', '🍪'];
function waage(rnd) {
  const [s1, s2] = shuffleSeeded(SYMBOLE, rnd);
  const a = 1 + Math.floor(rnd() * 8);           // Wert von s1
  let b = 1 + Math.floor(rnd() * 8);             // Wert von s2
  if (b === a) b = (b % 8) + 1;
  return {
    typ: 'waage',
    titel: '⚖️ Das Waage-Rätsel',
    hinweis: 'Finde heraus, wie viel jedes Symbol wert ist.',
    zeilen: [
      { links: [s1, s1], rechts: a + a },
      { links: [s1, s2], rechts: a + b }
    ],
    frage: `${s2} + ${s2} = ?`,
    antwort: String(b + b)
  };
}

const ARTEN = [pyramide, waage];

/* Das Rätsel für einen gegebenen Kalendertag - immer dasselbe für denselben
   Tag, unabhängig vom Gerät. */
export function raetselFuer(datumStr = heutigesDatum()) {
  const rnd = mulberry32(seedVonDatum(datumStr));
  const art = ARTEN[Math.floor(rnd() * ARTEN.length)];
  return { ...art(rnd), datum: datumStr };
}

export function pruefeAntwort(raetsel, eingabe) {
  return String(eingabe).trim() === raetsel.antwort;
}

/* Bonus fürs Lösen: deutlich mehr als eine einzelne Aufgabe normalerweise
   bringt (siehe punkte.js) - es ist schließlich nur einmal am Tag zu haben. */
export const BONUS = 25;
