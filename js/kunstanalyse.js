/* Fachliche Auswertung von Zeichnungen.

   Kunstpädagogik und Entwicklungspsychologie bewerten Kinderzeichnungen seit
   hundert Jahren – nur nicht nach Schönheit, sondern nach überprüfbaren
   Merkmalen. Vier Verfahren stehen hier Pate:

   · Rhoda Kellogg (1969) und Viktor Lowenfeld (1947) beschrieben die
     Entwicklungsstufen: Kritzeln → Formen → Kombinationen → Gegenständliches.
   · Georges-Henri Luquet (1927) unterschied, OB ein Kind überhaupt etwas
     darstellen will – erkennbar daran, ob es sein Bild benennen kann.
   · Florence Goodenough (1926), erweitert von Dale Harris (1963): Die
     Menschzeichnung wird nach VORHANDENEN MERKMALEN gezählt, nicht bewertet.
   · Ellis Paul Torrance (1966) maß bildnerische Kreativität in vier Größen:
     Flüssigkeit, Ausarbeitung, Originalität, Flexibilität.

   Ausdrücklich KEIN Test für Begabung, Intelligenz oder Diagnose. Was hier
   entsteht, ist ein Profil aus mehreren unabhängigen Größen – nie eine Note. */

const abstand = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

/* Länge eines Strichs im Einheitsquadrat */
const laengeVon = strich => strich.reduce((s, p, i) =>
  i ? s + abstand(strich[i-1], p) : 0, 0);

/* ---------------------------------------------------------------------------
   1. Feinmotorik – aus der Linienführung selbst ablesbar
   --------------------------------------------------------------------------- */

/* Linienruhe: Wie stark zittert die Linie im Kleinen?
   Gemessen als mittlere Richtungsänderung zwischen kurzen Abschnitten.
   Eine geführte Linie ändert die Richtung stetig, eine zittrige sprunghaft. */
export function linienruhe(striche) {
  let summe = 0, anzahl = 0;
  for (const s of striche) {
    const punkte = s.filter((_, i) => i % 2 === 0);
    for (let i = 2; i < punkte.length; i++) {
      const a = punkte[i-2], b = punkte[i-1], c = punkte[i];
      const w1 = Math.atan2(b.y - a.y, b.x - a.x);
      const w2 = Math.atan2(c.y - b.y, c.x - b.x);
      let d = Math.abs(w2 - w1);
      if (d > Math.PI) d = 2 * Math.PI - d;
      if (abstand(a,b) > 0.004 && abstand(b,c) > 0.004) { summe += d; anzahl++; }
    }
  }
  if (!anzahl) return { wert: null, zittern: null };
  const mittel = summe / anzahl;                       // 0 = schnurgerade
  return { wert: Math.max(0, Math.round(100 - mittel * 130)), zittern: mittel };
}

/* Fluss: gleichmäßige Bewegung oder stockendes Nachziehen?
   Braucht Zeitstempel an den Punkten. */
export function fluss(striche) {
  const tempi = [];
  let pausen = 0;
  for (const s of striche) {
    for (let i = 1; i < s.length; i++) {
      const dt = (s[i].t ?? 0) - (s[i-1].t ?? 0);
      if (dt <= 0) continue;
      if (dt > 300) { pausen++; continue; }
      tempi.push(abstand(s[i-1], s[i]) / (dt / 1000));
    }
  }
  if (!tempi.length) return { wert: null, tempo: null, pausen };
  const mittel = tempi.reduce((a,b) => a+b, 0) / tempi.length;
  const streuung = Math.sqrt(tempi.reduce((a,x) => a + (x-mittel)**2, 0) / tempi.length);
  const gleichmaessig = mittel > 0 ? Math.max(0, 100 - (streuung / mittel) * 45) : 0;
  return { wert: Math.round(gleichmaessig), tempo: Math.round(mittel * 100) / 100, pausen };
}

/* Stiftdruck – nur mit Stift (Apple Pencil o. Ä.); Finger liefert konstant 0,5. */
export function druck(striche) {
  const werte = striche.flat().map(p => p.d).filter(d => typeof d === 'number' && d > 0 && d !== 0.5);
  if (werte.length < 20) return { vorhanden: false };
  const mittel = werte.reduce((a,b) => a+b, 0) / werte.length;
  const streuung = Math.sqrt(werte.reduce((a,x) => a + (x-mittel)**2, 0) / werte.length);
  return { vorhanden: true, mittel: Math.round(mittel*100), schwankung: Math.round(streuung*100) };
}

/* ---------------------------------------------------------------------------
   2. Formtreue – nur bei Aufgaben mit Vorlage
   --------------------------------------------------------------------------- */

const rahmen = punkte => {
  const xs = punkte.map(p => p.x), ys = punkte.map(p => p.y);
  return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
};

/* Proportion: Stimmt das Seitenverhältnis mit der Vorlage überein?
   Ein Kind kann sehr genau treffen und trotzdem alles zu breit zeichnen. */
export function proportion(vorlage, striche) {
  const g = striche.flat();
  if (g.length < 5) return { wert: null };
  const v = rahmen(vorlage.flat()), z = rahmen(g);
  const vv = (v.x1 - v.x0) / Math.max(1e-6, v.y1 - v.y0);
  const zz = (z.x1 - z.x0) / Math.max(1e-6, z.y1 - z.y0);
  const abweichung = Math.abs(Math.log(zz / vv));       // symmetrisch in beide Richtungen
  return { wert: Math.max(0, Math.round(100 - abweichung * 120)),
           seitenverhaeltnis: Math.round(zz * 100) / 100 };
}

/* Geschlossenheit: Trifft das Ende einer geschlossenen Form ihren Anfang? */
export function geschlossenheit(striche) {
  const lang = striche.filter(s => laengeVon(s) > 0.3);
  if (!lang.length) return { wert: null };
  const luecken = lang.map(s => abstand(s[0], s.at(-1)) / Math.max(0.01, laengeVon(s)));
  const mittel = luecken.reduce((a,b)=>a+b,0) / luecken.length;
  return { wert: Math.max(0, Math.round(100 - mittel * 260)) };
}

/* Ökonomie: Wie viele Ansätze wurden gebraucht? */
export function oekonomie(vorlage, striche) {
  const noetig = Math.max(1, vorlage.length);
  return { wert: Math.max(0, Math.round(100 - Math.max(0, striche.length - noetig) * 12)),
           striche: striche.length, noetig };
}

/* ---------------------------------------------------------------------------
   3. Entwicklungsstufe – nach Kellogg, Lowenfeld und Luquet
   --------------------------------------------------------------------------- */

/* Zählt geschlossene Formen: Strich, dessen Ende nahe am Anfang liegt. */
function geschlosseneFormen(striche) {
  return striche.filter(s => laengeVon(s) > 0.15 && abstand(s[0], s.at(-1)) < 0.09).length;
}

export function entwicklungsstufe(striche, { titel = '', alterEtappe = 1 } = {}) {
  const formen = geschlosseneFormen(striche);
  const gesamtlaenge = striche.reduce((a,s) => a + laengeVon(s), 0);
  const benannt = titel.trim().length > 2 && !/^(ohne titel|nichts|x+)$/i.test(titel.trim());

  let stufe, name, erklaerung;
  if (!striche.length || gesamtlaenge < 0.4) {
    stufe = 0; name = 'Erste Spuren';
    erklaerung = 'Noch wenig auf dem Blatt – die Bewegung selbst steht im Vordergrund.';
  } else if (formen === 0) {
    stufe = 1; name = 'Kritzelstufe';
    erklaerung = 'Linien ohne geschlossene Formen. Bei Kellogg die Grundstufe: Das Kind erkundet die Bewegung, nicht die Abbildung.';
  } else if (formen === 1 && !benannt) {
    stufe = 2; name = 'Formstufe';
    erklaerung = 'Eine geschlossene Form ist da – nach Kellogg der Übergang vom Kritzeln zum Diagramm.';
  } else if (formen >= 2 && !benannt) {
    stufe = 3; name = 'Kombinationsstufe';
    erklaerung = 'Mehrere Formen werden zusammengesetzt (Kellogg: „combines“ und „aggregates“).';
  } else if (benannt && formen <= 2) {
    stufe = 4; name = 'Vorschematische Stufe';
    erklaerung = 'Das Bild wird benannt – nach Luquet der entscheidende Schritt: Die Absicht zu zeigen ist da, die Umsetzung folgt ihr noch nicht ganz (Lowenfeld: 4–7 Jahre).';
  } else {
    stufe = 5; name = 'Schematische Stufe';
    erklaerung = 'Benanntes Bild aus mehreren zusammenhängenden Formen – Lowenfeld beschreibt hier feste Schemata für Mensch, Haus, Baum (etwa 7–9 Jahre).';
  }
  return { stufe, name, erklaerung, formen, benannt,
           hinweis:'Entwicklungsstufen sind keine Noten. Kinder springen, fallen zurück und bleiben stehen – alles davon ist normal.' };
}

/* ---------------------------------------------------------------------------
   4. Kreativität nach Torrance – nur für freie Aufgaben
   --------------------------------------------------------------------------- */

/* Ausarbeitung: Wie viel Aufwand steckt über das Nötigste hinaus im Bild? */
export function ausarbeitung(striche) {
  const laenge = striche.reduce((a,s) => a + laengeVon(s), 0);
  const punkte = Math.min(100, Math.round(laenge * 14 + striche.length * 4));
  return { wert: punkte, striche: striche.length, laenge: Math.round(laenge * 100) / 100 };
}

/* Blattnutzung: Wird die Fläche genutzt oder klebt alles in einer Ecke? */
export function blattnutzung(striche) {
  const g = striche.flat();
  if (g.length < 5) return { wert: null };
  const r = rahmen(g);
  const flaeche = (r.x1 - r.x0) * (r.y1 - r.y0);
  return { wert: Math.min(100, Math.round(flaeche * 165)), flaeche: Math.round(flaeche*100)/100 };
}

/* Originalität: Wie häufig ist die genannte Idee? Verglichen wird mit einer
   Liste naheliegender Antworten je Auftrag – genau so arbeitet auch Torrance,
   dort allerdings mit Häufigkeiten aus großen Stichproben. */
export const NAHELIEGEND = {
  'Verwandle einen Kreis in etwas ganz anderes.':
    ['sonne','gesicht','ball','smiley','mond','blume','rad','uhr','apfel','auge'],
  'Zeichne ein Tier, das es nicht gibt – und gib ihm einen Namen.':
    ['drache','einhorn','monster','dino','katzenhund'],
  'Zeichne ein Haus, in dem du gern wohnen würdest.':
    ['schloss','villa','baumhaus','hochhaus'],
  'Zeichne dein Lieblingsessen als Gesicht.':
    ['pizza','pommes','burger','spaghetti','eis'],
  'Zeichne ein Fahrzeug für den Weg zur Schule im Jahr 2100.':
    ['rakete','fliegendes auto','ufo','hoverboard']
};

export function originalitaet(auftrag, titel) {
  const liste = NAHELIEGEND[auftrag];
  const wort = String(titel || '').toLowerCase().trim();
  if (!wort) return { wert: null };
  if (!liste) return { wert: 60, urteil:'nicht vergleichbar',
    erklaerung:'Für diesen Auftrag liegt keine Vergleichsliste vor.' };
  const naheliegend = liste.some(w => wort.includes(w));
  return naheliegend
    ? { wert: 35, urteil:'naheliegend',
        erklaerung:`„${titel}“ ist eine der häufigsten Antworten auf diesen Auftrag. Das ist kein Fehler – Torrance zählt einfach, wie oft eine Idee vorkommt.` }
    : { wert: 85, urteil:'selten',
        erklaerung:`„${titel}“ steht nicht auf der Liste der naheliegenden Antworten. Genau das misst Torrance als Originalität.` };
}

/* Flüssigkeit und Flexibilität über mehrere Bilder hinweg */
const KATEGORIEN = {
  tier:['tier','hund','katze','vogel','fisch','drache','pferd','maus','bär','löwe','wurm','käfer'],
  mensch:['mensch','kind','mann','frau','gesicht','ich','mama','papa','freund'],
  pflanze:['baum','blume','wald','busch','gras','pilz'],
  bauwerk:['haus','turm','burg','brücke','schloss','stadt','zimmer'],
  fahrzeug:['auto','schiff','rakete','zug','flugzeug','fahrrad','bus'],
  natur:['sonne','mond','stern','wolke','berg','meer','regen','see','fluss'],
  technik:['roboter','maschine','computer','handy'],
  fantasie:['traum','geist','zauber','monster','gefühl','musik']
};

export function kategorieVon(titel) {
  const wort = String(titel || '').toLowerCase();
  for (const [kat, woerter] of Object.entries(KATEGORIEN))
    if (woerter.some(w => wort.includes(w))) return kat;
  return 'sonstiges';
}

export function kreativProfil(bilder) {
  const mit = bilder.filter(b => b.titel);
  const kategorien = new Set(mit.map(b => kategorieVon(b.titel)));
  return {
    fluessigkeit: mit.length,                       // Zahl der Einfälle
    flexibilitaet: kategorien.size,                 // Zahl verschiedener Bereiche
    bereiche: [...kategorien]
  };
}

/* ---------------------------------------------------------------------------
   Gesamtprofil einer einzelnen Zeichnung
   --------------------------------------------------------------------------- */
export function analysiere(striche, { vorlage = null, titel = '', auftrag = null, alterEtappe = 1 } = {}) {
  const p = {
    linienruhe: linienruhe(striche),
    fluss: fluss(striche),
    druck: druck(striche),
    geschlossenheit: geschlossenheit(striche),
    ausarbeitung: ausarbeitung(striche),
    blattnutzung: blattnutzung(striche)
  };
  if (vorlage) {
    p.proportion = proportion(vorlage, striche);
    p.oekonomie = oekonomie(vorlage, striche);
  } else {
    p.entwicklung = entwicklungsstufe(striche, { titel, alterEtappe });
    if (auftrag) p.originalitaet = originalitaet(auftrag, titel);
  }
  return p;
}

/* Merkmale für die Menschzeichnung nach Goodenough (1926) / Harris (1963).
   Im Original zählt eine geschulte Person die Merkmale aus. Hier hakt das Kind
   selbst ab, was es gezeichnet hat – das ist keine standardisierte Durchführung,
   sondern eine kindgerechte Übertragung. Sie schult nebenbei das Hinsehen. */
export const MENSCH_MERKMALE = [
  'Kopf', 'Augen', 'Nase', 'Mund', 'Ohren', 'Haare',
  'Hals', 'Rumpf', 'Arme', 'Arme sitzen am Rumpf', 'Hände', 'Finger',
  'Beine', 'Füße', 'Kleidung', 'Zwei Kleidungsstücke',
  'Arme und Beine in zwei Teilen (Gelenk)', 'Daumen erkennbar',
  'Kopf ist kleiner als der Rumpf', 'Profil oder Bewegung'
];

export function menschAuswertung(anzahl, etappe = 1) {
  /* Grobe Orientierung nach Harris: etwa ein Merkmal je Lebensjahr über drei
     hinaus. Das ist bewusst als Spanne formuliert – für eine echte
     Alterseinschätzung braucht es die standardisierte Testdurchführung. */
  const erwartet = { 1:[8,14], 2:[13,18], 3:[15,20], 4:[16,20], 5:[16,20] }[etappe] || [8,14];
  const lage = anzahl < erwartet[0] ? 'darunter' : anzahl > erwartet[1] ? 'darüber' : 'im erwarteten Bereich';
  return {
    anzahl, erwartet, lage,
    erklaerung: `Gezählt werden vorhandene Merkmale, nicht die Ausführung. ${anzahl} von ${MENSCH_MERKMALE.length} Merkmalen liegt ${lage} (typisch für diese Etappe: ${erwartet[0]}–${erwartet[1]}).`,
    warnung: 'Nach Goodenough/Harris – hier als Selbstauskunft, nicht als standardisierter Test. Keine Aussage über Begabung oder Intelligenz.'
  };
}
