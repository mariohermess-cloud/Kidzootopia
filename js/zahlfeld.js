/* Zahleneingabe: Ziffern, Minus und Komma.

   Der Anlass war ein handfester Fehler. Das Antwortfeld stand auf
   inputmode="numeric" - damit zeigt ein iPad einen Ziffernblock OHNE Minus
   und OHNE Komma. In der App gibt es aber Aufgaben, deren Antwort -1 lautet
   (Kurvendiskussion) oder 12,5 (Prozentrechnen). Diese Aufgaben waren auf dem
   Tablet schlicht nicht loesbar.

   Statt nur den inputmode zu aendern, bekommt die App ein eigenes Tastenfeld:
     - Es sieht auf jedem Geraet gleich aus, statt der Laune des Betriebssystems
       zu folgen.
     - Die Tasten sind gross genug fuer Kinderfinger.
     - Die Systemtastatur schiebt auf dem Handy die halbe Aufgabe aus dem Bild.
       Ein eigenes Feld tut das nicht.

   Hier steht nur die Logik - was eine Taste mit dem bisherigen Text macht.
   Genau das laesst sich pruefen, ohne einen Browser zu starten. */

export const TASTEN = ['7','8','9','4','5','6','1','2','3','-','0',',','⌫'];

/* Eine Taste auf einen Text anwenden. Gibt den neuen Text zurueck.
   Ungueltige Eingaben werden nicht verhindert, sondern gar nicht erst
   zugelassen - ein Kind soll nicht "3--,,5" tippen koennen und sich dann
   fragen, warum die Antwort falsch ist. */
export function taste(text, t) {
  const s = String(text ?? '');

  if (t === '⌫') return s.slice(0, -1);

  if (t === '-') {
    /* Minus schaltet um: einmal tippen macht die Zahl negativ, nochmal tippen
       wieder positiv. Das ist verstaendlicher, als das Minus irgendwo in der
       Mitte einfuegen zu koennen. */
    return s.startsWith('-') ? s.slice(1) : '-' + s;
  }

  if (t === ',') {
    if (s.includes(',')) return s;             // nur ein Komma
    if (s === '' || s === '-') return s + '0,';// aus nichts wird 0, statt ",5"
    return s + ',';
  }

  if (/^[0-9]$/.test(t)) {
    /* Fuehrende Nullen wegnehmen: aus "0" plus "5" wird "5", nicht "05".
       Nach dem Komma und bei "0," bleibt die Null natuerlich stehen. */
    if (s === '0') return t;
    if (s === '-0') return '-' + t;
    if (s.replace('-', '').length >= 12) return s;   // irgendwo ist Schluss
    return s + t;
  }

  return s;
}

/* Was das Kind tippt, ist deutsche Schreibweise mit Komma. Gerechnet und
   verglichen wird mit Punkt. */
export const alsZahl = text => {
  const s = String(text ?? '').replace(',', '.').trim();
  if (!/^-?\d*\.?\d*$/.test(s) || s === '' || s === '-' || s === '.') return null;
  return Number(s);
};

/* Sieht der Text nach einer fertigen Zahl aus? "3," ist noch nicht fertig. */
export const istFertig = text => alsZahl(text) !== null && !String(text).endsWith(',');

/* Braucht diese Aufgabe ein Zahlenfeld oder eine Buchstaben-Tastatur?
   Entschieden wird an der erwarteten Antwort, nicht am Aufgabentyp - so
   funktioniert es auch fuer Aufgaben, die es noch gar nicht gibt. */
export const brauchtZahlen = antwort =>
  /^-?\d+([.,]\d+)?$/.test(String(antwort ?? '').trim());
