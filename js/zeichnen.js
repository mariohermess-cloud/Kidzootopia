/* Zeichnerische Rätsel – gedacht fürs Tablet, funktioniert aber auch mit Maus.

   Grundsatz der Bewertung: Schönheit wird NICHT bewertet. Gemessen wird nur,
   was sich messen lässt – wie genau eine Vorlage nachgezeichnet wurde, ob eine
   Spiegelachse eingehalten ist, ob eine Figur ohne Absetzen gelingt.
   Freies Zeichnen wird gar nicht benotet, sondern gesammelt (Galerie).

   Alle Koordinaten liegen im Einheitsquadrat 0…1, damit jede Bildschirmgröße
   passt. */

const P = (x, y) => ({ x, y });

/* Punkte auf einer Strecke verdichten, damit Bewertung gleichmäßig misst */
function verdichten(punkte, schritt = 0.02) {
  const dicht = [];
  for (let i = 0; i < punkte.length - 1; i++) {
    const a = punkte[i], b = punkte[i + 1];
    const laenge = Math.hypot(b.x - a.x, b.y - a.y);
    const n = Math.max(1, Math.ceil(laenge / schritt));
    for (let k = 0; k < n; k++)
      dicht.push(P(a.x + (b.x - a.x) * k / n, a.y + (b.y - a.y) * k / n));
  }
  dicht.push(punkte.at(-1));
  return dicht;
}

const kreis = (cx, cy, r, n = 48) =>
  Array.from({ length: n + 1 }, (_, i) => P(cx + r * Math.cos(i / n * 2 * Math.PI),
                                            cy + r * Math.sin(i / n * 2 * Math.PI)));

/* ---------------- Vorlagen zum Nachzeichnen ---------------- */
export const VORLAGEN = [
  { id:'dreieck', name:'Dreieck', stufe:1,
    linien:[[P(.5,.15), P(.85,.8), P(.15,.8), P(.5,.15)]] },
  { id:'quadrat', name:'Quadrat', stufe:1,
    linien:[[P(.2,.2), P(.8,.2), P(.8,.8), P(.2,.8), P(.2,.2)]] },
  { id:'kreis', name:'Kreis', stufe:1, linien:[kreis(.5,.5,.32)] },
  { id:'zickzack', name:'Zickzack', stufe:1,
    linien:[[P(.1,.7), P(.25,.3), P(.4,.7), P(.55,.3), P(.7,.7), P(.85,.3)]] },
  { id:'welle', name:'Welle', stufe:2,
    linien:[Array.from({length:41},(_,i)=>P(.1 + i*.02, .5 + .22*Math.sin(i/40*4*Math.PI)))] },
  { id:'spirale', name:'Spirale', stufe:3,
    linien:[Array.from({length:120},(_,i)=>{ const t=i/120*4.5*Math.PI, r=.03+t*.023;
      return P(.5+r*Math.cos(t), .5+r*Math.sin(t)); })] },
  { id:'stern', name:'Stern', stufe:2,
    linien:[Array.from({length:11},(_,i)=>{ const t=i*4*Math.PI/5 - Math.PI/2;
      return P(.5+.35*Math.cos(t), .5+.35*Math.sin(t)); })] },
  { id:'haus', name:'Haus', stufe:2,
    linien:[[P(.2,.85), P(.2,.45), P(.5,.2), P(.8,.45), P(.8,.85), P(.2,.85)]] },
  { id:'herz', name:'Herz', stufe:3,
    linien:[Array.from({length:80},(_,i)=>{ const t=i/79*2*Math.PI;
      return P(.5 + .028*16*Math.sin(t)**3,
               .48 - .022*(13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t))); })] },
  { id:'blume', name:'Blume', stufe:4,
    linien:[Array.from({length:160},(_,i)=>{ const t=i/159*2*Math.PI, r=.12+.2*Math.abs(Math.sin(3*t));
      return P(.5+r*Math.cos(t), .5+r*Math.sin(t)); })] },
  { id:'schleife', name:'Schleife', stufe:4,
    linien:[Array.from({length:120},(_,i)=>{ const t=i/119*2*Math.PI;
      return P(.5+.3*Math.sin(2*t), .5+.28*Math.sin(t)); })] },
  { id:'mond', name:'Mond', stufe:3,
    linien:[[...kreis(.45,.5,.3,32).slice(6,28), ...kreis(.58,.5,.3,32).slice(24,32).reverse(),
             ...kreis(.58,.5,.3,32).slice(0,7).reverse()]] }
];

/* ---------------- Ein-Strich-Figuren (ohne Absetzen) ---------------- */
export const EINSTRICH = [
  { id:'nikolaus', name:'Haus vom Nikolaus',
    quelle:'Deutsches Zeichenrätsel, seit dem 19. Jahrhundert überliefert. Mathematisch ist es ein Eulerweg – lösbar, weil genau zwei Ecken ungerade sind.',
    linien:[[P(.2,.85), P(.8,.85), P(.8,.45), P(.2,.45), P(.2,.85), P(.8,.45),
             P(.5,.15), P(.2,.45), P(.8,.85)]] },
  { id:'umschlag', name:'Der offene Briefumschlag',
    quelle:'Klassisches Gegenstück zum Haus vom Nikolaus – hier ohne den Dachfirst.',
    linien:[[P(.15,.75), P(.85,.75), P(.85,.35), P(.15,.35), P(.15,.75),
             P(.85,.35), P(.5,.15), P(.15,.35), P(.85,.75)]] },
  { id:'doppelkreuz', name:'Das Gitter',
    quelle:'Eulerweg-Aufgabe: Man muss beim richtigen Punkt anfangen, sonst geht es nicht auf.',
    linien:[[P(.2,.3), P(.8,.3), P(.8,.7), P(.2,.7), P(.2,.3), P(.8,.7), P(.2,.7), P(.8,.3)]] }
];

/* ---------------- Symmetrie: linke Hälfte gegeben ---------------- */
export const SYMMETRIE = [
  { id:'schmetterling', name:'Schmetterling',
    haelfte:[[P(.5,.2), P(.2,.1), P(.12,.4), P(.35,.5), P(.15,.7), P(.28,.88), P(.5,.75)]] },
  { id:'tanne', name:'Tannenbaum',
    haelfte:[[P(.5,.12), P(.32,.4), P(.42,.4), P(.24,.62), P(.38,.62), P(.18,.82), P(.5,.82)]] },
  { id:'vase', name:'Vase',
    haelfte:[[P(.5,.15), P(.34,.24), P(.3,.45), P(.42,.6), P(.36,.82), P(.5,.87)]] },
  { id:'blatt', name:'Blatt',
    haelfte:[[P(.5,.12), P(.28,.3), P(.22,.55), P(.34,.78), P(.5,.88)]] },
  { id:'krone', name:'Krone',
    haelfte:[[P(.5,.35), P(.38,.2), P(.3,.42), P(.16,.28), P(.16,.75), P(.5,.75)]] }
];

/* ---------------- Freie Aufträge (werden NICHT bewertet) ---------------- */
export const AUFTRAEGE = [
  'Zeichne ein Tier, das es nicht gibt – und gib ihm einen Namen.',
  'Zeichne ein Haus, in dem du gern wohnen würdest.',
  'Zeichne, wie sich Musik anfühlt.',
  'Zeichne eine Maschine, die etwas Unnützes tut.',
  'Zeichne dein Lieblingsessen als Gesicht.',
  'Zeichne, was hinter der nächsten Tür sein könnte.',
  'Verwandle einen Kreis in etwas ganz anderes.',
  'Zeichne ein Fahrzeug für den Weg zur Schule im Jahr 2100.',
  'Zeichne einen Baum, an dem etwas Verrücktes wächst.',
  'Zeichne dein Gefühl von heute – ohne Gesicht.',
  'Zeichne eine Brücke zwischen zwei Inseln.',
  'Zeichne, wie ein Traum aussieht, an den du dich erinnerst.'
];

/* ---------------- Bewertung ------------------------------------------------
   Zwei Größen, beide messbar:
   · Abdeckung – wie viel der Vorlage wurde überhaupt getroffen?
   · Genauigkeit – wie viel des Gezeichneten liegt auf der Vorlage?
   Ein Kind, das sorgfältig, aber zittrig zeichnet, soll bestehen; wer quer
   über das Blatt kritzelt, nicht. Die Toleranz ist entsprechend großzügig. */

export function bewerte(vorlageLinien, striche, toleranz = 0.05) {
  const ziel = vorlageLinien.flatMap(l => verdichten(l));
  const gemalt = striche.flat();
  if (!gemalt.length) return { abdeckung: 0, genauigkeit: 0, punkte: 0 };

  const nah = (p, menge) => {
    let min = Infinity;
    for (const q of menge) {
      const d = (p.x - q.x) ** 2 + (p.y - q.y) ** 2;
      if (d < min) min = d;
      if (min < 1e-6) break;
    }
    return Math.sqrt(min);
  };

  const getroffen = ziel.filter(p => nah(p, gemalt) <= toleranz).length;
  const sauber = gemalt.filter(p => nah(p, ziel) <= toleranz).length;
  const abdeckung = getroffen / ziel.length;
  const genauigkeit = sauber / gemalt.length;
  /* Beide Größen müssen stimmen – deshalb multipliziert statt addiert.
     Wer quer über das Blatt kritzelt, trifft zwar viel von der Vorlage
     (hohe Abdeckung), malt aber überwiegend daneben (niedrige Genauigkeit)
     und besteht dadurch nicht. Die Abdeckung geht abgeschwächt ein, damit
     eine fast fertige Zeichnung nicht hart abstürzt. */
  return {
    abdeckung, genauigkeit,
    punkte: Math.round(100 * Math.pow(abdeckung, 0.7) * genauigkeit)
  };
}

/* Spiegelbild einer Linie an der senkrechten Mittelachse */
export const spiegeln = linien => linien.map(l => l.map(p => P(1 - p.x, p.y)));

export const BESTANDEN = 65;      // ab hier gilt eine Zeichnung als gelungen
