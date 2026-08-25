/* Lern-Motor: waehlt Ziel und Weg.
   Regel: 4 von 5 Aufgaben laufen ueber einen Weg, der zur Staerke des Kindes passt
   (dort lernt es schnell). Jede 5. Aufgabe ist bewusst ein "Bruecken-Weg" –
   so waechst das Kind ueber die eigene Staerke hinaus, ohne den Spass zu verlieren. */

import { ZIEL_MAP, WEGE, ZIELE, TALENTE } from './data.js';
import { baueAufgabe } from './generators.js';
import { talentWerte, zielStand, zieleFuerEtappe as zieleFuerKlasse, zielWegWirksamkeit,
         wegWirksamkeit, kennung, schonGehabt, merkeAufgabe } from './store.js';

const BRUECKEN_ANTEIL = 0.2;

/* Bewertung eines Weges fuer ein Kind und ein Ziel.
   Zwei Quellen: das Talent-Profil (was der Test sagt) und die Wirksamkeit
   (was die Uebungen tatsaechlich zeigen). Je mehr Daten vorliegen, desto
   staerker zaehlt das Gemessene – so korrigiert die Praxis den Test. */
export function wegBewertung(profil, ziel, weg) {
  const werte = talentWerte(profil);
  const passung = werte[WEGE[weg].talent] ?? 50;
  const gemessen = zielWegWirksamkeit(profil, ziel.id, weg);
  const anteil = 0.25 + 0.45 * gemessen.konfidenz;         // 0,25 bis 0,70
  return {
    punkte: Math.round(passung * (1 - anteil) + gemessen.wert * anteil),
    passung, gemessen
  };
}

export function wegRanking(profil, ziel) {
  return [...ziel.wege]
    .map(w => ({ w, b: wegBewertung(profil, ziel, w) }))
    .sort((x, y) => y.b.punkte - x.b.punkte)
    .map(x => x.w);
}

export function waehleWeg(profil, ziel, erzwingeBruecke = null) {
  const rang = wegRanking(profil, ziel);
  const bruecke = erzwingeBruecke ?? (Math.random() < BRUECKEN_ANTEIL && rang.length > 2);
  // Brueckenaufgaben gehen bewusst ueber die hinteren Wege – dort waechst,
  // was noch schwerfaellt. Sonst bleibt das Kind auf seiner Staerke stehen.
  const auswahl = bruecke ? rang.slice(-2) : rang.slice(0, 2);
  const weg = auswahl[Math.floor(Math.random()*auswahl.length)];
  return { weg, bruecke: !!bruecke };
}

/* Welche Wege wirken bei diesem Kind am besten? (fuer den Eltern-Bereich) */
export function wegeNachWirkung(profil) {
  return Object.keys(WEGE)
    .map(w => ({ weg: w, ...wegWirksamkeit(profil, w) }))
    .filter(x => x.n > 0)
    .sort((a,b) => b.wert - a.wert);
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
      // Hauptwerke richten sich nach der Etappe, nicht nach dem Übungsstand
      const stufe = ziel.id === 'hauptwerke' ? (profil.etappe || 1) : stand.level;
      // jede 5. Aufgabe bewusst ueber einen anderen Weg
      const erzwinge = (this.index + 1) % 5 === 0 ? true : (this.index === 0 ? false : null);
      const { weg, bruecke } = waehleWeg(profil, ziel, erzwinge);
      // Keine Wiederholungen: bis zu 25 Versuche für eine noch ungestellte Aufgabe.
      // Danach greift die Alterung im Speicher – sonst gäbe es bei festen
      // Rätselsammlungen irgendwann gar keine Aufgabe mehr.
      let aufgabe = null, k = null;
      for (let versuch = 0; versuch < 25; versuch++) {
        aufgabe = baueAufgabe(ziel.id, weg, stufe);
        k = kennung(aufgabe);
        if (!schonGehabt(profil, ziel.id, k)) break;
        aufgabe = null;
      }
      if (!aufgabe) {                       // Vorrat erschöpft: ältestes vergessen
        (profil.gesehen[ziel.id] || []).splice(0, 10);
        aufgabe = baueAufgabe(ziel.id, weg, stufe);
        k = kennung(aufgabe);
      }
      merkeAufgabe(profil, ziel.id, k);
      this.aktuell = { ...aufgabe, ziel, bruecke, wegInfo: WEGE[weg] };
      return this.aktuell;
    }
  };
  return session;
}

/* Klartext-Empfehlungen fuer Eltern.
   Getrennt nach: was der Test sagt, was die Uebungen zeigen, und wo es hakt. */
export function empfehlungen(profil) {
  const werte = talentWerte(profil);
  const sortiert = Object.entries(werte).sort((a,b) => b[1]-a[1]);
  const top = sortiert.slice(0,2).map(e => e[0]);
  const schwach = sortiert.at(-1)[0];
  const tipps = [];

  top.forEach(t => {
    const weg = Object.entries(WEGE).find(([,w]) => w.talent === t)?.[0];
    const ziele = ZIELE.filter(z => z.wege.includes(weg)).slice(0,3);
    if (weg && ziele.length) {
      tipps.push(`Stärke **${TALENTE[t].name}**: Der **${WEGE[weg].name}** passt dazu – er kommt u. a. bei „${ziele.map(z=>z.titel).join('“, „')}“ zum Einsatz.`);
    }
  });

  /* Was die Praxis zeigt – und wo sie dem Test widerspricht */
  const gemessen = wegeNachWirkung(profil).filter(x => x.n >= 6);
  if (gemessen.length >= 2) {
    const bester = gemessen[0], schwaechster = gemessen.at(-1);
    tipps.push(`Gemessen über ${gemessen.reduce((a,x)=>a+x.n,0)} Aufgaben wirkt der **${WEGE[bester.weg].name}** am besten (${bester.wert} % Trefferquote), am zähesten läuft der ${WEGE[schwaechster.weg].name} (${schwaechster.wert} %). Die App bietet den wirksamen Weg jetzt häufiger an.`);
    const testRang = Object.entries(WEGE).map(([k,w]) => [k, werte[w.talent]||0]).sort((a,b)=>b[1]-a[1]);
    if (testRang[0][0] !== bester.weg && bester.n >= 10) {
      tipps.push(`Bemerkenswert: Im Test lag der ${WEGE[testRang[0][0]].name} vorn, in den Aufgaben läuft der **${WEGE[bester.weg].name}** aber besser. Die App richtet sich nach dem, was tatsächlich funktioniert.`);
    }
  } else {
    tipps.push('Für belastbare Aussagen über die wirksamsten Wege braucht die App noch etwas mehr Übung – ab etwa 50 Aufgaben wird dieser Abschnitt genauer.');
  }

  const zieleStand = zieleFuerKlasse(profil)
    .map(z => ({ z, s: zielStand(profil, z.id) }))
    .filter(x => x.s.gesamt >= 5)
    .map(x => ({ ...x, quote: x.s.richtig / x.s.gesamt }));
  if (zieleStand.length) {
    const schlecht = zieleStand.slice().sort((a,b) => a.quote - b.quote)[0];
    const gut = zieleStand.slice().sort((a,b) => b.quote - a.quote)[0];
    tipps.push(`Aktuell am schwersten: **${schlecht.z.titel}** (${Math.round(schlecht.quote*100)} % richtig). Dieses Ziel kommt automatisch häufiger – und die App probiert dafür andere Wege aus.`);
    if (gut.quote >= .8) tipps.push(`Sicher unterwegs bei **${gut.z.titel}** (${Math.round(gut.quote*100)} % richtig) – hier lohnt das nächste Level.`);
  }

  tipps.push(`Weniger ausgeprägt zeigt sich gerade „${TALENTE[schwach].kurz}“. Das ist kein Mangel: Jede 5. Aufgabe ist eine Brücke über genau solche Bereiche, damit sie behutsam mitwachsen.`);
  return tipps;
}
