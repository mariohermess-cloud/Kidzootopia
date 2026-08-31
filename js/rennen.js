/* Renn-Modus: aus einer gespielten Runde wird ein kleines Rennen im Stil
   eines Kart-Rennens - der eigene Avatar gegen das eigene Geisterrennen.

   Kein Netzwerk, kein fremder Gegner: Die App hat keinen Server, also kann
   der einzige faire Gegner nur die eigene bisher schnellste Runde sein. Der
   "Geist" ist keine Animation eines echten Kindes, sondern die genau
   nachgefahrene Zeit-Punkte-Kurve der eigenen Bestleistung.

   Die Strecke geht dabei niemals rückwärts - nicht durch eine Extra-Regel,
   sondern weil punkteFuer() nie negativ ist: jede Antwort bringt 0 oder mehr
   Punkte, also kann die Summe nur wachsen oder gleich bleiben. */

/* Baut aus dem Rundenverlauf eine Strecke: Stützpunkte aus vergangener Zeit
   und den bis dahin gesammelten Punkten. verlauf ist sess.verlauf aus ui.js,
   jeder Eintrag mit ms (Zeit für DIESE Aufgabe) und punkte (für DIESE Aufgabe). */
export function spurFuer(verlauf = []) {
  let ms = 0, punkte = 0;
  const spur = [{ ms: 0, punkte: 0 }];
  for (const v of verlauf) {
    ms += Math.max(0, v.ms || 0);
    punkte += Math.max(0, v.punkte || 0);
    spur.push({ ms, punkte });
  }
  return spur;
}

/* Wie viele Punkte der Geist zu einem gegebenen Zeitpunkt hatte - Interpolation
   zwischen den beiden Stützpunkten davor und danach. Nach dem Ende der
   Geister-Strecke bleibt er auf seinem Endstand stehen, er läuft nicht weiter. */
export function geistBei(spur, ms) {
  if (!spur || !spur.length) return 0;
  if (ms <= spur[0].ms) return spur[0].punkte;
  for (let i = 1; i < spur.length; i++) {
    if (ms <= spur[i].ms) {
      const a = spur[i - 1], b = spur[i];
      const anteil = b.ms === a.ms ? 1 : (ms - a.ms) / (b.ms - a.ms);
      return a.punkte + (b.punkte - a.punkte) * anteil;
    }
  }
  return spur[spur.length - 1].punkte;
}

/* Position auf der Strecke in Prozent (0..100), fuer die Anzeige. ziel ist die
   groessere der beiden Endsummen - wer zuerst dort ankommt, "gewinnt" optisch. */
export function prozentAuf(punkte, ziel) {
  if (ziel <= 0) return punkte > 0 ? 100 : 0;
  return Math.max(0, Math.min(100, Math.round((punkte / ziel) * 100)));
}

/* Ergebnis am Ende: hat man das eigene Geisterrennen eingeholt oder geschlagen?
   Absichtlich ohne "leider" oder "verloren" - unter dem Geist zu bleiben ist
   der Normalfall und kein Versagen, siehe punkte.js / rundenBlick().

   Die reine Aussage "schneller" oder "langsamer" reichte nicht - ohne Zahlen
   sieht man nicht, WIE viel besser oder schlechter man war. Deshalb stehen
   jetzt die Punktestände selbst mit da, nicht nur das Urteil darüber. Beim
   allerersten Rennen gibt es noch keinen Geist zum Vergleichen - dann zählt
   nur, was erspielt wurde, ohne einen erfundenen Vergleich gegen 0. */
export function rennErgebnis(eigenePunkte, geistPunkteAmEnde, istErstesRennen = false) {
  if (istErstesRennen)
    return { gewonnen: false, gleich: false,
      text: `${eigenePunkte} Punkte erspielt – das ist ab jetzt dein Geisterrennen zum Messen! 🏁` };
  const differenz = eigenePunkte - geistPunkteAmEnde;
  if (eigenePunkte > geistPunkteAmEnde)
    return { gewonnen: true, differenz,
      text: `Du warst schneller als dein bisheriges bestes Rennen! 🏁 (${eigenePunkte} statt ${geistPunkteAmEnde} Punkte, +${differenz})` };
  if (eigenePunkte === geistPunkteAmEnde && geistPunkteAmEnde > 0)
    return { gewonnen: false, gleich: true, differenz: 0,
      text: `Genau gleichauf mit deinem besten Rennen. (${eigenePunkte} Punkte, wie beim letzten Mal)` };
  return { gewonnen: false, gleich: false, differenz,
    text: `Diesmal knapp hinter deinem besten Rennen – nächstes Mal! (${eigenePunkte} statt ${geistPunkteAmEnde} Punkte)` };
}
