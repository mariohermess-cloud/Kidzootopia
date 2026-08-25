/* Der Begleiter: das gewählte Lieblingstier lebt in der Ecke des Bildschirms.
   Es jubelt bei Erfolg, tröstet bei Fehlern, langweilt sich, wenn nichts
   passiert, und schläft irgendwann ein. Für kleine Kinder ist das kein
   Beiwerk – es macht aus einer Aufgabenliste ein Gegenüber. */

const SPRUECHE = {
  richtig:  ['Jaaa!', 'Genau so!', 'Stark!', 'Das sitzt!', 'Weiter so!', 'Wow!', 'Perfekt!'],
  falsch:   ['Fast!', 'Nochmal!', 'Kein Problem.', 'Weiter geht’s!', 'Das üben wir.', 'Kopf hoch!'],
  serie:    ['Drei am Stück!', 'Du bist im Lauf!', 'Nicht zu stoppen!'],
  start:    ['Los geht’s!', 'Bereit?', 'Auf geht’s!'],
  fertig:   ['Geschafft!', 'Feierabend!', 'Gut gemacht heute!'],
  langeweile:['Hallo? Noch da?', 'Mir ist langweilig …', 'Machen wir weiter?', '*gähn*'],
  schlaf:   ['Zzz …'],
  denken:   ['Ich warte …', 'Nimm dir Zeit.', 'Denk in Ruhe nach.'],
  zeichnen: ['Mal los!', 'Zeig, was du kannst!', 'Ich schau zu!']
};

const GESTEN = ['huepfen', 'wackeln', 'drehen', 'winken', 'schauen', 'gaehnen'];

let wurzel = null, blase = null, figur = null;
let leerlaufUhr = null, gestenUhr = null, schlaeft = false;

const zufall = a => a[Math.floor(Math.random() * a.length)];

export function aufbauen(emoji) {
  if (!wurzel) {
    wurzel = document.createElement('div');
    wurzel.className = 'begleiter';
    wurzel.innerHTML = `<div class="blase" hidden></div><button class="figur" aria-label="Begleiter"></button>`;
    document.body.appendChild(wurzel);
    blase = wurzel.querySelector('.blase');
    figur = wurzel.querySelector('.figur');
    figur.addEventListener('click', () => { wecken(); gestik(zufall(GESTEN)); sagen(zufall(SPRUECHE.langeweile), 1600); });
  }
  figur.textContent = emoji || '🦊';
  wurzel.hidden = false;
  leerlaufStarten();
}

export function verstecken() { if (wurzel) wurzel.hidden = true; leerlaufStoppen(); }

/* Beim Vorlesen zieht sich der Begleiter zurueck: Er sitzt in derselben Ecke
   wie der Text und verdeckte im Bildschirmfoto mitten im Satz zwei Woerter.
   Wer laut liest, soll auf die Zeile schauen und nicht auf ein huepfendes Tier. */
export function beiseite(ja = true) {
  if (!wurzel) return;
  wurzel.classList.toggle('beiseite', !!ja);
  if (ja) leerlaufStoppen(); else leerlaufStarten();
}

function gestik(name, dauer = 900) {
  if (!figur) return;
  figur.classList.remove(...GESTEN, 'schlafen');
  void figur.offsetWidth;                     // Animation neu starten
  figur.classList.add(name);
  if (name !== 'schlafen') setTimeout(() => figur.classList.remove(name), dauer);
}

function sagen(text, dauer = 1800) {
  if (!blase) return;
  blase.textContent = text;
  blase.hidden = false;
  clearTimeout(blase._uhr);
  blase._uhr = setTimeout(() => { blase.hidden = true; }, dauer);
}

/* Reaktion auf das Geschehen */
export function reagiere(was, zusatz = {}) {
  if (!wurzel || wurzel.hidden) return;
  wecken();
  switch (was) {
    case 'richtig':
      gestik('huepfen', 1000);
      sagen(zusatz.serie >= 3 ? zufall(SPRUECHE.serie) : zufall(SPRUECHE.richtig));
      funken();
      break;
    case 'falsch':   gestik('wackeln', 800);  sagen(zufall(SPRUECHE.falsch)); break;
    case 'start':    gestik('winken', 1200);  sagen(zufall(SPRUECHE.start)); break;
    case 'fertig':   gestik('drehen', 1200);  sagen(zufall(SPRUECHE.fertig), 2600); break;
    case 'denken':   gestik('schauen', 1200); break;
    case 'zeichnen': gestik('schauen', 1200); sagen(zufall(SPRUECHE.zeichnen)); break;
  }
}

/* Kleine Funken bei Erfolg */
function funken() {
  if (!wurzel) return;
  for (let i = 0; i < 6; i++) {
    const f = document.createElement('i');
    f.className = 'funke';
    f.style.setProperty('--dx', (Math.random() * 80 - 40) + 'px');
    f.style.setProperty('--dy', (-30 - Math.random() * 50) + 'px');
    f.textContent = zufall(['✨', '⭐', '🎉', '💫']);
    wurzel.appendChild(f);
    setTimeout(() => f.remove(), 900);
  }
}

/* --- Leerlauf: Langeweile, dann Schlaf ------------------------------------ */
function leerlaufStarten() {
  leerlaufStoppen();
  leerlaufUhr = setTimeout(() => {
    gestenUhr = setInterval(() => {
      if (schlaeft) return;
      const seit = Date.now() - letzteAktion;
      if (seit > 75000) { einschlafen(); return; }
      gestik(zufall(GESTEN));
      if (Math.random() < .5) sagen(zufall(SPRUECHE.langeweile), 1500);
    }, 9000);
  }, 12000);
}
function leerlaufStoppen() { clearTimeout(leerlaufUhr); clearInterval(gestenUhr); }

let letzteAktion = Date.now();
function einschlafen() {
  schlaeft = true;
  figur?.classList.add('schlafen');
  sagen(SPRUECHE.schlaf[0], 4000);
}
export function wecken() {
  letzteAktion = Date.now();
  if (schlaeft) { schlaeft = false; figur?.classList.remove('schlafen'); }
  leerlaufStarten();
}

/* Beim Wechsel des Bildschirms: kurz aufmerksam werden */
export function umschauen() { wecken(); if (Math.random() < .35) gestik('schauen', 900); }
