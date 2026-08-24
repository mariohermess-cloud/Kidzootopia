/* Lern-Motor: waehlt Ziel und Weg.
   Regel: 4 von 5 Aufgaben laufen ueber einen Weg, der zur Staerke des Kindes passt
   (dort lernt es schnell). Jede 5. Aufgabe ist bewusst ein "Bruecken-Weg" –
   so waechst das Kind ueber die eigene Staerke hinaus, ohne den Spass zu verlieren. */

import { ZIEL_MAP, WEGE, ZIELE, TALENTE } from './data.js';
import { baueAufgabe } from './generators.js';
import { talentWerte, zielStand, zieleFuerKlasse } from './store.js';

const BRUECKEN_ANTEIL = 0.2;

export function wegRanking(profil, ziel) {
  const werte = talentWerte(profil);
  return [...ziel.wege].sort((a,b) => (werte[WEGE[b].talent]||0) - (werte[WEGE[a].talent]||0));
}

export function waehleWeg(profil, ziel, erzwingeBruecke = null) {
  const rang = wegRanking(profil, ziel);
  const bruecke = erzwingeBruecke ?? (Math.random() < BRUECKEN_ANTEIL && rang.length > 2);
  const auswahl = bruecke ? rang.slice(-2) : rang.slice(0, 2);
  const weg = auswahl[Math.floor(Math.random()*auswahl.length)];
  return { weg, bruecke: !!bruecke };
}

/* Ziel-Auswahl fuer den Tagesmix: schwache und wenig geuebte Ziele zuerst. */
export function naechstesZiel(profil, fach = null) {
  let kandidaten = zieleFuerKlasse(profil);
  if (fach) kandidaten = kandidaten.filter(z => z.fach === fach);
  if (!kandidaten.length) kandidaten = ZIELE;
  const bewertet = kandidaten.map(z => {
    const s = zielStand(profil, z.id);
    const quote = s.gesamt ? s.richtig / s.gesamt : .5;
    const uebung = Math.min(1, s.gesamt / 30);
    const prio = (1 - quote) * 2 + (1 - uebung) * 1.5 + Math.random() * .8 - (s.gemeistert ? 1.5 : 0);
    return { z, prio };
  }).sort((a,b) => b.prio - a.prio);
  return bewertet[0].z;
}

export function starteSession(profil, { zielId = null, fach = null, laenge = 8 } = {}) {
  const session = {
    laenge, index: 0, richtig: 0, verlauf: [], aktuell: null,
    zielId, fach,
    naechste() {
      if (this.index >= this.laenge) return null;
      const ziel = zielId ? ZIEL_MAP[zielId] : naechstesZiel(profil, fach);
      const stand = zielStand(profil, ziel.id);
      // jede 5. Aufgabe bewusst ueber einen anderen Weg
      const erzwinge = (this.index + 1) % 5 === 0 ? true : (this.index === 0 ? false : null);
      const { weg, bruecke } = waehleWeg(profil, ziel, erzwinge);
      const aufgabe = baueAufgabe(ziel.id, weg, stand.level);
      this.aktuell = { ...aufgabe, ziel, bruecke, wegInfo: WEGE[weg] };
      return this.aktuell;
    }
  };
  return session;
}

/* Klartext-Empfehlungen fuer Eltern */
export function empfehlungen(profil) {
  const werte = talentWerte(profil);
  const sortiert = Object.entries(werte).sort((a,b) => b[1]-a[1]);
  const top = sortiert.slice(0,2).map(e => e[0]);
  const schwach = sortiert.slice(-1)[0][0];

  const zieleStand = zieleFuerKlasse(profil).map(z => {
    const s = zielStand(profil, z.id);
    return { z, s, quote: s.gesamt ? s.richtig / s.gesamt : null };
  });
  const geuebt = zieleStand.filter(x => x.s.gesamt >= 5);
  const schwaechstesZiel = geuebt.slice().sort((a,b) => a.quote - b.quote)[0];
  const staerkstesZiel  = geuebt.slice().sort((a,b) => b.quote - a.quote)[0];

  const tipps = [];
  top.forEach(t => {
    const passendeWege = Object.entries(WEGE).filter(([,w]) => w.talent === t).map(([k]) => k);
    const ziele = ZIELE.filter(z => z.wege.some(w => passendeWege.includes(w))).slice(0,3);
    tipps.push(`Über den **${WEGE[passendeWege[0]].name}** lernt ${profil.name} besonders leicht – er wird u. a. bei „${ziele.map(z=>z.titel).join('“, „')}“ eingesetzt.`);
  });
  if (schwaechstesZiel) tipps.push(`Aktuell am schwersten: **${schwaechstesZiel.z.titel}** (${Math.round(schwaechstesZiel.quote*100)} % richtig). Die App bietet dieses Ziel automatisch häufiger an – und probiert dabei andere Wege aus.`);
  if (staerkstesZiel && staerkstesZiel.quote >= .8) tipps.push(`Sicher unterwegs bei **${staerkstesZiel.z.titel}** (${Math.round(staerkstesZiel.quote*100)} % richtig). Hier lohnt sich das nächste Level.`);
  tipps.push(`Weniger ausgeprägt zeigt sich gerade „${TALENTE[schwach].kurz}“. Das ist kein Mangel: Über die Brücken-Aufgaben (jede 5. Aufgabe) wird genau dieser Bereich behutsam mittrainiert.`);
  return tipps;
}
