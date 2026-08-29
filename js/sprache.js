/* Sprachausgabe ("Vorlesen").
   Nutzt die im Gerät eingebaute Stimme (Web Speech API) – kein fremder Dienst,
   keine Kosten, nichts verlässt das Handy. Für Leseanfänger, Kinder mit
   Leseschwäche und für alle, die lieber zuhören. */

let stimmen = [];
let bevorzugt = null;
let bevorzugtEN = null;

const imBrowser = typeof window !== 'undefined' && 'speechSynthesis' in window;

function stimmenLaden() {
  if (!imBrowser) return;
  stimmen = speechSynthesis.getVoices() || [];
  bevorzugt =
    stimmen.find(s => /^de[-_]DE/i.test(s.lang) && /female|weiblich|Anna|Petra|Marlene/i.test(s.name)) ||
    stimmen.find(s => /^de[-_]/i.test(s.lang)) || null;
  bevorzugtEN =
    stimmen.find(s => /^en[-_](US|GB)/i.test(s.lang) && /female|Samantha|Zira|Karen|Google US English/i.test(s.name)) ||
    stimmen.find(s => /^en[-_]/i.test(s.lang)) || null;
}
if (imBrowser) {
  stimmenLaden();
  speechSynthesis.addEventListener?.('voiceschanged', stimmenLaden);
}

export const kannVorlesen = () => imBrowser;

/* Emojis, Rechenzeichen und Zeilenumbrüche in gesprochene Sprache übersetzen. */
export function sprechbar(text) {
  return String(text)
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{2190}-\u{21FF}]/gu, ' ')
    .replace(/·/g, ' ')
    .replace(/\s*×\s*/g, ' mal ')
    .replace(/\s*÷\s*/g, ' geteilt durch ')
    .replace(/\s*\+\s*/g, ' plus ')
    .replace(/(\d)\s*−\s*(\d)/g, '$1 minus $2')
    .replace(/(\d)\s*-\s*(\d)/g, '$1 minus $2')
    .replace(/=\s*\?/g, 'gleich wie viel?')
    .replace(/\s*=\s*/g, ' gleich ')
    .replace(/(\d+)\/(\d+)/g, '$1 von $2')
    .replace(/__/g, ' wie viel ')
    .replace(/[{}]/g, ' ')
    .replace(/\?\s*$/g, '?')
    .replace(/\n+/g, '. ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export function stopp() {
  if (kannVorlesen()) { try { speechSynthesis.cancel(); } catch {} }
}

/* Gemeinsamer Kern: eine Sprachausgabe in genau EINER Sprache, ohne die
   Warteschlange anzufassen - das erledigen die Funktionen darunter, je
   nachdem ob eine einzelne Ansage oder eine Kette (deutsch, dann englisch)
   gebraucht wird. */
function sprich(text, { lang, stimme, tempo, beiEnde }) {
  if (!kannVorlesen()) { beiEnde?.(); return null; }
  const inhalt = sprechbar(text);
  if (!inhalt) { beiEnde?.(); return null; }
  const u = new SpeechSynthesisUtterance(inhalt);
  u.lang = lang;
  u.rate = tempo;
  u.pitch = 1.05;
  if (!stimmen.length) stimmenLaden();
  if (stimme) u.voice = stimme;
  u.onend = () => beiEnde?.();
  u.onerror = () => beiEnde?.();
  try { speechSynthesis.speak(u); } catch { beiEnde?.(); }
  return u;
}

/* Liest vor. tempo: 1 = normal, kleiner = langsamer (für jüngere Kinder). */
export function vorlesen(text, { tempo = 0.95, beiEnde = null } = {}) {
  stopp();
  return sprich(text, { lang: 'de-DE', stimme: bevorzugt, tempo, beiEnde });
}

/* Liest englischen Text mit einer englischen Stimme vor - eine deutsche
   Stimme spricht englische Wörter erkennbar falsch aus, und genau darauf
   kommt es beim Sprachenlernen an. */
export function vorlesenEnglisch(text, { tempo = 0.85, beiEnde = null } = {}) {
  stopp();
  return sprich(text, { lang: 'en-US', stimme: bevorzugtEN, tempo, beiEnde });
}

/* Erst das deutsche Wort, dann - nach kurzem Innehalten - dasselbe auf
   Englisch. Genau das Prinzip für den Vokabel-Einstieg: erst hören, was man
   schon kennt, dann hören, wie es auf Englisch heißt. */
export function vorlesenZweisprachig(de, en, { beiEnde = null } = {}) {
  if (!kannVorlesen()) { beiEnde?.(); return; }
  stopp();
  sprich(de, { lang: 'de-DE', stimme: bevorzugt, tempo: 0.9, beiEnde: () => {
    setTimeout(() => sprich(en, { lang: 'en-US', stimme: bevorzugtEN, tempo: 0.8, beiEnde }), 350);
  }});
}

/* Liest mehrere Teile nacheinander (z. B. Geschichte, dann Frage). */
export function vorlesenReihe(teile, opt = {}) {
  const liste = teile.filter(Boolean);
  const naechster = i => {
    if (i >= liste.length) return opt.beiEnde?.();
    vorlesen(liste[i], { ...opt, beiEnde: () => naechster(i+1) });
  };
  naechster(0);
}
