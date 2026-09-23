/* Lesehilfe bei Legasthenie/LRS – reine Rechenlogik, DOM-frei und testbar.

   Hintergrund: Kinder mit Lese-Rechtschreib-Schwäche lesen oft stockend,
   lassen Wörter aus oder vertauschen sie mit ähnlich aussehenden/klingenden
   Wörtern. Belegte Gegenmaßnahmen (siehe README): größere Schrift, mehr
   Buchstaben- und Wortabstand (Zorzi u. a. 2012, PNAS – extra Buchstabenabstand
   verbessert Lesetempo und -genauigkeit bei Legasthenie), mehr Zeilenabstand,
   die Silbenmethode (abwechselnd gefärbte Silben, wie in Grundschulfibeln)
   und ein Lesefenster (nur die aktuelle Zeile hervorgehoben).

   Bewusst NICHT enthalten: eine eigene "Legasthenie-Schrift" (z. B.
   OpenDyslexic) – Studien zeigen dafür keinen Vorteil gegenüber gewöhnlichen
   gut lesbaren Schriften, und es müsste zusätzlich etwas nachgeladen werden. */

/* Voreinstellung, wenn beim Anlegen eines Profils "LRS" angehakt wird. */
export const LRS_VOREINSTELLUNG = Object.freeze({
  an: true, groesse: 2, abstand: 1, zeile: 2,
  farben: 'blaurot', boegen: true, fenster: true, aufgabenSilben: true
});

/* Heutiges Aussehen, unverändert: Lesehilfe aus, alles auf Normalmaß. */
export const STANDARD = Object.freeze({
  an: false, groesse: 1, abstand: 0, zeile: 1,
  farben: 'wechsel', boegen: false, fenster: false, aufgabenSilben: false
});

const GUELTIG = {
  groesse: [1, 2, 3],
  abstand: [0, 1, 2],
  zeile: [1, 2],
  farben: ['wechsel', 'blaurot']
};

/* Ungültige oder fehlende Werte fallen auf den Standard zurück – ein
   beschädigtes oder ganz altes Profil sieht dann aus wie heute, nie kaputt. */
export function normalisiere(obj) {
  const o = obj && typeof obj === 'object' ? obj : {};
  return {
    an: o.an === true,
    groesse: GUELTIG.groesse.includes(o.groesse) ? o.groesse : STANDARD.groesse,
    abstand: GUELTIG.abstand.includes(o.abstand) ? o.abstand : STANDARD.abstand,
    zeile: GUELTIG.zeile.includes(o.zeile) ? o.zeile : STANDARD.zeile,
    farben: GUELTIG.farben.includes(o.farben) ? o.farben : STANDARD.farben,
    boegen: o.boegen === true,
    fenster: o.fenster === true,
    aufgabenSilben: o.aufgabenSilben === true
  };
}

/* CSS-Variablen fürs Wurzelelement. Ist die Lesehilfe aus, sind es exakt die
   Werte von heute (Faktor 1, kein Zusatzabstand) – das Aussehen ändert sich
   dann nirgendwo, auch nicht durch versehentlich gesetzte Einzelwerte. */
const GROESSE_FAKTOR = { 1: 1, 2: 1.2, 3: 1.45 };
const BUCHSTABE_ABSTAND = { 0: '0.01em', 1: '0.12em', 2: '0.2em' };
const WORT_ABSTAND = { 0: '0.15em', 1: '0.35em', 2: '0.55em' };
const ZEILE_FAKTOR = { 1: 1, 2: 1.35 };

export function cssVariablen(lesehilfeRoh) {
  const l = normalisiere(lesehilfeRoh);
  if (!l.an) {
    return {
      '--lese-groesse': String(GROESSE_FAKTOR[1]),
      '--lese-buchstabe': BUCHSTABE_ABSTAND[0],
      '--lese-wort': WORT_ABSTAND[0],
      '--lese-zeile': String(ZEILE_FAKTOR[1])
    };
  }
  return {
    '--lese-groesse': String(GROESSE_FAKTOR[l.groesse]),
    '--lese-buchstabe': BUCHSTABE_ABSTAND[l.abstand],
    '--lese-wort': WORT_ABSTAND[l.abstand],
    '--lese-zeile': String(ZEILE_FAKTOR[l.zeile])
  };
}

/* Body-Klassen, über die app.css die Lesehilfe an- und ausschaltet. */
export function klassen(lesehilfeRoh) {
  const l = normalisiere(lesehilfeRoh);
  if (!l.an) return [];
  const raus = ['lh-an'];
  if (l.farben === 'blaurot') raus.push('lh-blaurot');
  if (l.boegen) raus.push('lh-boegen');
  if (l.fenster) raus.push('lh-fenster');
  return raus;
}

/* Aus den offsetTop-Werten einzelner Wörter Zeilennummern bilden – für das
   Lesefenster im Lesepult. Rein rechnerisch, damit es ohne DOM testbar ist:
   Werte, die nur wenige Pixel auseinanderliegen (Rundung, Zeilenhöhe von
   Satzzeichen), gehören zur selben Zeile. */
export function zeilenGruppieren(tops, toleranz = 4) {
  const raus = [];
  let aktuelleZeile = -1, letzterTop = null;
  for (const t of tops) {
    if (letzterTop === null || Math.abs(t - letzterTop) > toleranz) {
      aktuelleZeile++;
      letzterTop = t;
    }
    raus.push(aktuelleZeile);
  }
  return raus;
}
