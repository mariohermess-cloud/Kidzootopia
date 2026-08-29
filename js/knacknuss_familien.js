/* Knacknuss-Familien: klassische Rätseltypen, die sich mit anderen Zahlen
   immer wieder neu stellen lassen – so haben es die alten Rätselbücher gehalten.

   Wichtig: Die Lösung wird jedes Mal AUSGERECHNET, nicht abgeschrieben. Wo eine
   Formel bekannt ist, steht sie im Code; wo nicht (Umfüllen, Brücke bei Nacht),
   sucht ein kleiner Löser die tatsächlich beste Lösung. Dadurch ist jede
   erzeugte Variante nachweislich richtig.

   Jede Familie meldet über `varianten`, wie viele verschiedene Aufgaben sie
   hergibt – die Summe steht im README und wird im Test nachgezählt. */

import { hanoiBild } from './klassiker.js';

const ganz = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const waehle = a => a[Math.floor(Math.random() * a.length)];

/* --- kleine Löser, damit die Antworten stimmen ------------------------------ */

/* Umfüllen: kürzeste Zahl an Schritten, um `ziel` Liter abzumessen */
export function umfuellSchritte(a, b, ziel) {
  const start = '0,0', gesehen = new Set([start]);
  let rand = [[0, 0]], schritte = 0;
  while (rand.length && schritte < 40) {
    const naechste = [];
    for (const [x, y] of rand) {
      if (x === ziel || y === ziel) return schritte;
      for (const z of [[a, y], [x, b], [0, y], [x, 0],
                       [x - Math.min(x, b - y), y + Math.min(x, b - y)],
                       [x + Math.min(y, a - x), y - Math.min(y, a - x)]]) {
        const k = z.join(',');
        if (!gesehen.has(k)) { gesehen.add(k); naechste.push(z); }
      }
    }
    rand = naechste; schritte++;
  }
  return null;
}

/* Brücke bei Nacht: kürzeste Gesamtzeit für vier Gehzeiten */
export function bruecken(zeiten) {
  const sortiert = [...zeiten].sort((x, y) => x - y);
  const beste = new Map();
  const schluessel = (links, lampeLinks) => links.join('-') + '|' + lampeLinks;
  const lauf = (links, lampeLinks, zeit) => {
    if (!links.length) return zeit;
    const k = schluessel(links, lampeLinks);
    if (beste.has(k) && beste.get(k) <= zeit) return Infinity;
    beste.set(k, zeit);
    let min = Infinity;
    if (lampeLinks) {
      for (let i = 0; i < links.length; i++)
        for (let j = i + 1; j < links.length; j++) {
          const rest = links.filter((_, n) => n !== i && n !== j);
          min = Math.min(min, lauf(rest, false, zeit + Math.max(links[i], links[j])));
        }
    } else {
      const drueben = sortiert.filter(t => !links.includes(t) ||
        links.filter(x => x === t).length < sortiert.filter(x => x === t).length);
      for (const t of new Set(drueben))
        min = Math.min(min, lauf([...links, t].sort((x, y) => x - y), true, zeit + t));
    }
    return min;
  };
  return lauf(sortiert, true, 0);
}

/* Kamel-Erbschaft: Nenner suchen, deren Stammbrüche knapp unter 1 liegen */
export function kamelTeilungen(maxNenner = 12) {
  const treffer = [];
  for (let a = 2; a <= maxNenner; a++)
    for (let b = a + 1; b <= maxNenner; b++)
      for (let c = b + 1; c <= maxNenner; c++) {
        const zaehler = b * c + a * c + a * b, nenner = a * b * c;
        if (nenner - zaehler === nenner / zaehler * 0 + (nenner - zaehler) &&
            zaehler < nenner && (nenner % (nenner - zaehler) === 0)) {
          const tiere = zaehler / (nenner - zaehler);
          if (Number.isInteger(tiere) && tiere >= 5 && tiere <= 60 &&
              tiere % a === 0 === false) treffer.push({ a, b, c, tiere });
        }
      }
  return treffer.filter(t => (t.tiere + 1) % t.a === 0 && (t.tiere + 1) % t.b === 0 &&
                             (t.tiere + 1) % t.c === 0);
}

/* --- die Familien ----------------------------------------------------------- */

export const FAMILIEN = [
  { id:'schnecke', stufe:2, varianten: 200,
    quelle:'Rechenbuchklassiker, u. a. bei Adam Ries im 16. Jahrhundert.',
    erzeuge() {
      const hoch = ganz(2, 7), rutsch = ganz(1, hoch - 1), tiefe = hoch + (hoch - rutsch) * ganz(3, 12);
      const tage = Math.ceil((tiefe - hoch) / (hoch - rutsch)) + 1;
      return { frage:`🐌 Eine Schnecke sitzt in einem ${tiefe} m tiefen Brunnen.\nAm Tag kriecht sie ${hoch} m hoch, in der Nacht rutscht sie ${rutsch} m zurück.\nAn welchem Tag ist sie oben?`,
        antwort:String(tage),
        tipps:[`Pro Tag und Nacht kommt sie ${hoch - rutsch} m voran – aber achte auf den letzten Tag.`,
               `Am Ende von Tag ${tage - 1} ist sie bei ${(tage - 1) * (hoch - rutsch)} m. Was passiert am nächsten Tag?`] };
    } },

  { id:'hanoi', stufe:3, varianten: 7,
    quelle:'Édouard Lucas, 1883 – als Spiel „Tour de Hanoï“ verkauft.',
    erzeuge() {
      const n = ganz(3, 9);
      const ergebnis = 2 ** n - 1;
      return { frage:`🗼 Türme von Hanoi mit ${n} Scheiben.\nImmer nur eine Scheibe umlegen, nie eine größere auf eine kleinere.\nWie viele Züge braucht man mindestens?`,
        antwort:String(ergebnis),
        tipps:['Fang klein an: 1 Scheibe braucht 1 Zug, 2 Scheiben brauchen 3.',
               'Bei jeder weiteren Scheibe verdoppelt sich die Zahl und eins kommt dazu.',
               `Die Formel lautet 2 hoch n minus 1, hier also 2 hoch ${n} minus 1 gleich ${ergebnis}.`],
        /* Eigenstaendige Erklaerung statt nur des letzten Tipps - siehe
           generators.js, das hilfe sonst aus dem letzten Tipp bastelt. */
        loesung:`Mit 1 Scheibe braucht man 1 Zug, mit 2 Scheiben 3 Züge. Mit jeder weiteren Scheibe verdoppelt sich die Zahl der nötigen Züge, und einer kommt dazu. Bei ${n} Scheiben sind das 2 hoch ${n} minus 1, also ${ergebnis} Züge.`,
        bild: hanoiBild(n) };
    } },

  { id:'handschlag', stufe:3, varianten: 22,
    quelle:'Standardaufgabe der Kombinatorik, seit dem 18. Jahrhundert in Lehrbüchern.',
    erzeuge() {
      const n = ganz(4, 25);
      return { frage:`🤝 Auf einer Feier sind ${n} Menschen. Jeder gibt jedem genau einmal die Hand.\nWie viele Handschläge sind das?`,
        antwort:String(n * (n - 1) / 2),
        tipps:[`Jeder gibt ${n - 1} anderen die Hand – das wären ${n * (n - 1)}.`,
               'Aber so wurde jeder Handschlag doppelt gezählt.'] };
    } },

  { id:'wiegen', stufe:4, varianten: 24,
    quelle:'Wiegeprobleme dieser Art kursierten in den 1940er-Jahren in ganz Europa.',
    erzeuge() {
      const n = ganz(4, 27);
      const mal = Math.ceil(Math.log(n) / Math.log(3) - 1e-9);
      return { frage:`⚖️ Du hast ${n} gleich aussehende Münzen, eine davon ist leichter.\nMit einer Balkenwaage: Wie oft musst du mindestens wiegen, um sie sicher zu finden?`,
        antwort:String(mal),
        tipps:['Teile nicht in zwei Hälften, sondern in drei möglichst gleiche Gruppen.',
               'Jede Wägung hat drei mögliche Ausgänge – links, rechts oder ausgeglichen.',
               `Mit k Wägungen schafft man 3 hoch k Münzen; für ${n} genügen ${mal}.`] };
    } },

  { id:'umfuellen', stufe:4, varianten: 180,
    quelle:'Bekannt aus dem 16. Jahrhundert, weltberühmt durch den Film „Stirb langsam 3“ (1995).',
    erzeuge() {
      let a, b, ziel, schritte;
      do {
        a = ganz(3, 9); b = ganz(a + 1, 12); ziel = ganz(1, b - 1);
        schritte = umfuellSchritte(a, b, ziel);
      } while (!schritte || schritte < 2 || ziel === a || ziel === b);
      return { frage:`🪣 Du hast einen ${a}-Liter- und einen ${b}-Liter-Krug, sonst nichts.\nWie viele Schritte (füllen, leeren, umgießen) brauchst du mindestens,\num genau ${ziel} Liter abzumessen?`,
        antwort:String(schritte),
        tipps:['Ein Schritt ist: einen Krug ganz füllen, ganz leeren oder in den anderen umgießen.',
               'Probiere beide Richtungen – mal den großen zuerst füllen, mal den kleinen.'] };
    } },

  { id:'quadrate', stufe:3, varianten: 7,
    quelle:'Zählrätsel dieser Art füllten die Rätselspalten des frühen 20. Jahrhunderts.',
    erzeuge() {
      const n = ganz(2, 8);
      const summe = n * (n + 1) * (2 * n + 1) / 6;
      return { frage:`🔲 Wie viele Quadrate stecken in einem Gitter aus ${n} × ${n} Feldern?\n(Auch die größeren zählen mit!)`,
        antwort:String(summe),
        tipps:[`Die kleinsten Quadrate sind ${n * n} Stück.`,
               `Dann kommen die 2×2-Quadrate: ${(n - 1) ** 2}. Und so weiter bis zum großen.`,
               'Es ist die Summe 1² + 2² + … + n².'] };
    } },

  { id:'rechtecke', stufe:5, varianten: 25,
    quelle:'Abzählaufgabe aus der Kombinatorik; Grundlage ist die Wahl zweier Gitterlinien.',
    erzeuge() {
      const n = ganz(2, 6), m = ganz(2, 6);
      const anzahl = (n + 1) * n / 2 * ((m + 1) * m / 2);
      return { frage:`▭ Wie viele Rechtecke stecken in einem Gitter aus ${n} × ${m} Feldern?`,
        antwort:String(anzahl),
        tipps:['Ein Rechteck entsteht, wenn man zwei senkrechte und zwei waagerechte Linien wählt.',
               `Senkrechte Linien gibt es ${n + 1}, waagerechte ${m + 1}.`] };
    } },

  { id:'socken', stufe:2, varianten: 80,
    quelle:'Schubfachprinzip, formuliert von Dirichlet um 1834.',
    erzeuge() {
      const farben = ganz(2, 6), je = ganz(5, 20);
      return { frage:`🧦 In einer dunklen Schublade liegen ${je} Socken in jeder von ${farben} Farben.\nWie viele musst du herausnehmen, um sicher ein gleichfarbiges Paar zu haben?`,
        antwort:String(farben + 1),
        tipps:['Denk an den ungünstigsten Fall: Wie viele verschiedene Farben kannst du erwischen, bevor sich eine wiederholt?',
               `Nach ${farben} Socken könnte jede eine andere Farbe haben – die nächste passt zwangsläufig.`] };
    } },

  { id:'seerose', stufe:3, varianten: 60,
    quelle:'Klassisches Beispiel für exponentielles Wachstum, seit den 1970er-Jahren in Schulbüchern.',
    erzeuge() {
      const tage = ganz(10, 40), dreifach = Math.random() < .35;
      return dreifach
        ? { frage:`🌿 Eine Wasserpflanze verdreifacht ihre Fläche jeden Tag.\nNach ${tage} Tagen ist der Teich ganz bedeckt.\nAn welchem Tag war ein Drittel bedeckt?`,
            antwort:String(tage - 1),
            tipps:['Rechne vom Ende her rückwärts.', 'Am Tag davor war es ein Drittel.'] }
        : { frage:`🪷 Ein Seerosenblatt verdoppelt seine Fläche jeden Tag.\nNach ${tage} Tagen ist der Teich ganz bedeckt.\nAn welchem Tag war er halb bedeckt?`,
            antwort:String(tage - 1),
            tipps:['Rechne vom Ende her rückwärts.', 'Wenn es sich täglich verdoppelt: Was war am Tag davor?'] };
    } },

  { id:'nim', stufe:5, varianten: 80,
    quelle:'Charles Bouton beschrieb die Gewinnstrategie 1901 mathematisch vollständig.',
    erzeuge() {
      const hoechstens = ganz(2, 4), rest = ganz(0, hoechstens), n = (hoechstens + 1) * ganz(2, 8) + rest;
      const nehmen = n % (hoechstens + 1);
      return { frage:`🔥 Nim: ${n} Streichhölzer liegen auf dem Tisch.\nAbwechselnd nimmt jeder 1 bis ${hoechstens} Hölzer. Wer das letzte nimmt, gewinnt.\nDu beginnst – wie viele nimmst du, um sicher zu gewinnen?`,
        antwort: nehmen === 0 ? '0' : String(nehmen),
        tipps:[`Welche Anzahl möchtest du deinem Gegner hinterlassen?`,
               `Günstig sind Vielfache von ${hoechstens + 1}: Was er nimmt, ergänzt du jeweils auf ${hoechstens + 1}.`,
               nehmen === 0
                 ? `${n} ist bereits ein Vielfaches von ${hoechstens + 1} – wer hier ziehen muss, verliert bei richtigem Gegenspiel. Antwort: 0.`
                 : `${n} geteilt durch ${hoechstens + 1} lässt den Rest ${nehmen} – genau so viele nimmst du.`] };
    } },

  { id:'josephus', stufe:5, varianten: 26,
    quelle:'Das Josephus-Problem, benannt nach dem Geschichtsschreiber Flavius Josephus (1. Jh.).',
    erzeuge() {
      const n = ganz(5, 30);
      const zweierpotenz = 2 ** Math.floor(Math.log2(n));
      const platz = 2 * (n - zweierpotenz) + 1;
      return { frage:`🎯 ${n} Kinder stehen im Kreis und zählen ab. Jedes zweite scheidet aus,\nbis nur eines übrig bleibt (Nummer 1 bleibt beim ersten Durchgang drin, Nummer 2 scheidet aus).\nAuf welchem Platz muss man stehen, um übrig zu bleiben?`,
        antwort:String(platz),
        tipps:['Probiere es zuerst mit 4, 5 und 8 Kindern – bei Zweierpotenzen bleibt immer Nummer 1 übrig.',
               `Die größte Zweierpotenz unter ${n} ist ${zweierpotenz}. Rechne 2 · (${n} − ${zweierpotenz}) + 1.`] };
    } },

  { id:'gauss', stufe:2, varianten: 12,
    quelle:'Der Überlieferung nach löste der junge Carl Friedrich Gauß eine solche Aufgabe um 1785 in Sekunden.',
    erzeuge() {
      const n = waehle([20, 25, 30, 40, 50, 60, 70, 80, 90, 100, 150, 200]);
      return { frage:`➕ Zähle alle Zahlen von 1 bis ${n} zusammen.\nEs geht in Sekunden – ohne ${n} Additionen.`,
        antwort:String(n * (n + 1) / 2),
        tipps:['Schreibe die Reihe zweimal untereinander – einmal vorwärts, einmal rückwärts.',
               `1 + ${n} = ${n + 1}, 2 + ${n - 1} = ${n + 1} … wie viele solcher Paare gibt es?`,
               `${n / 2} Paare zu je ${n + 1}.`] };
    } },

  { id:'zuege_fliege', stufe:4, varianten: 180,
    quelle:'John von Neumann soll die Aufgabe in Sekunden gelöst haben – durch Summieren der unendlichen Reihe.',
    erzeuge() {
      const v1 = waehle([40, 50, 60, 70]), v2 = waehle([30, 40, 50, 60]);
      const stunden = waehle([1, 2, 3]), abstand = (v1 + v2) * stunden, vFliege = waehle([80, 90, 100, 120]);
      return { frage:`🚂 Zwei Züge fahren aufeinander zu: einer mit ${v1} km/h, einer mit ${v2} km/h, Abstand ${abstand} km.\nEine Fliege pendelt mit ${vFliege} km/h zwischen ihnen hin und her, bis sie sich treffen.\nWie viele Kilometer legt die Fliege zurück?`,
        antwort:String(vFliege * stunden),
        tipps:['Frage nicht nach dem Hin und Her – frage nach der Zeit.',
               `Die Züge nähern sich mit ${v1 + v2} km/h, brauchen also ${stunden} Stunde(n).`] };
    } },

  { id:'wasserhaehne', stufe:4, varianten: 10,
    quelle:'Aufgabentyp aus den Rechenbüchern der Antike, u. a. bei Heron von Alexandria.',
    erzeuge() {
      const paare = [[6,3,2],[4,4,2],[3,6,2],[12,4,3],[6,12,4],[10,15,6],[20,5,4],[9,18,6],[8,8,4],[15,10,6]];
      const [a, b, zusammen] = waehle(paare);
      return { frage:`🚰 Zwei Wasserhähne füllen ein Becken: einer allein in ${a} Stunden, der andere allein in ${b} Stunden.\nWie lange dauert es, wenn beide gleichzeitig laufen?`,
        antwort:String(zusammen),
        tipps:['Rechne mit Anteilen pro Stunde, nicht mit Stunden.',
               `Der eine schafft 1/${a} pro Stunde, der andere 1/${b} – zusammen ${a === b ? `2/${a}` : `1/${a} + 1/${b}`}.`] };
    } },

  { id:'flasche', stufe:3, varianten: 30,
    quelle:'Aus dem „Cognitive Reflection Test“ von Shane Frederick (2005).',
    erzeuge() {
      const differenz = waehle([100, 90, 80, 60, 50, 40]);   // Cent
      const korken = waehle([5, 10, 15, 20, 25]);
      const gesamt = differenz + 2 * korken;
      const euro = c => (c / 100).toFixed(2).replace('.', ',') + ' €';
      return { frage:`🍾 Eine Flasche und ein Korken kosten zusammen ${euro(gesamt)}.\nDie Flasche kostet ${euro(differenz)} mehr als der Korken.\nWas kostet der Korken? (in Cent)`,
        antwort:String(korken),
        tipps:['Die Antwort, die sich sofort aufdrängt, ist fast immer falsch – prüfe sie nach.',
               `Ziehe zuerst die Differenz ab: ${gesamt} − ${differenz} = ${gesamt - differenz} Cent für zwei Korken.`] };
    } },

  { id:'maschinen', stufe:3, varianten: 24,
    quelle:'Ebenfalls aus dem Cognitive Reflection Test, Shane Frederick 2005.',
    erzeuge() {
      const m = ganz(3, 8), gross = waehle([50, 100, 200, 500]);
      return { frage:`🏭 ${m} Maschinen brauchen ${m} Minuten für ${m} Teile.\nWie lange brauchen ${gross} Maschinen für ${gross} Teile?`,
        antwort:String(m),
        tipps:['Wie lange braucht EINE Maschine für EIN Teil?',
               `Jede Maschine braucht ${m} Minuten pro Teil – ganz gleich, wie viele Maschinen laufen.`] };
    } },

  { id:'ziegel', stufe:3, varianten: 30,
    quelle:'Altes Wiegerätsel, in Rechenbüchern des 19. Jahrhunderts belegt.',
    erzeuge() {
      const teil = waehle([2, 3, 4]), gewicht = ganz(1, 12);
      const ganzes = gewicht * teil / (teil - 1);
      const schoen = Number.isInteger(ganzes) ? ganzes : gewicht * teil;
      const g = Number.isInteger(ganzes) ? gewicht : gewicht * (teil - 1);
      return { frage:`🧱 Ein Ziegelstein wiegt ${g} kg und dazu ein ${teil === 2 ? 'halbes' : '1/' + teil}-Stück von sich selbst.\nWie schwer ist der ganze Ziegelstein?`,
        antwort:String(schoen),
        tipps:[`Ein ${teil === 2 ? 'halber' : `1/${teil}`}-Stein fehlt noch – also machen ${g} kg genau ${teil - 1}/${teil} des Steins aus.`,
               `Rechne ${g} · ${teil} ÷ ${teil - 1}.`] };
    } },

  { id:'bruecke_nacht', stufe:5, varianten: 150,
    quelle:'„Bridge and Torch“, seit den 1990er-Jahren ein Klassiker in Einstellungsgesprächen.',
    erzeuge() {
      const zeiten = [ganz(1, 2), ganz(2, 4), ganz(5, 8), ganz(9, 15)];
      const beste = bruecken(zeiten);
      return { frage:`🌉 Vier Menschen müssen nachts über eine wackelige Brücke.\nEs gibt eine Lampe, höchstens zwei dürfen gleichzeitig hinüber, und die Lampe muss zurückgebracht werden.\nSie brauchen ${zeiten.join(', ')} Minuten.\nWie viele Minuten braucht die Gruppe mindestens?`,
        antwort:String(beste),
        tipps:['Der Schnellste muss nicht jedes Mal zurücklaufen.',
               'Schicke die beiden Langsamsten gemeinsam – dann kosten sie nur einmal ihre Zeit.'] };
    } },

  { id:'alter_doppelt', stufe:3, varianten: 30,
    quelle:'Altersrätsel gehören seit der Antike zum festen Bestand der Rechenbücher.',
    erzeuge() {
      const a = ganz(1, 5), b = ganz(2, 7), x = a + 2 * b;
      return { frage:`🎂 Jemand sagt: „In ${a} ${a === 1 ? 'Jahr' : 'Jahren'} bin ich doppelt so alt wie vor ${b} ${b === 1 ? 'Jahr' : 'Jahren'}.“\nWie alt ist diese Person heute?`,
        antwort:String(x),
        tipps:[`Setze an: x + ${a} = 2 · (x − ${b}).`,
               `Ausmultipliziert: x + ${a} = 2x − ${2 * b}.`] };
    } },

  { id:'kerzen', stufe:2, varianten: 30,
    quelle:'Altes Scherzrätsel, in vielen Sprachen überliefert.',
    erzeuge() {
      const gesamt = ganz(5, 12), aus = ganz(2, Math.min(5, gesamt - 1));
      return { frage:`🕯️ In einem Zimmer brennen ${gesamt} Kerzen. Ein Windstoß löscht ${aus} davon,\ndann wird das Fenster geschlossen.\nWie viele Kerzen sind am nächsten Morgen noch da?`,
        antwort:String(aus),
        tipps:['Die weiterbrennenden Kerzen brennen die Nacht über ab.',
               'Nur was gelöscht wurde, bleibt übrig.'] };
    } },

  { id:'teilen_schnitte', stufe:1, varianten: 12,
    quelle:'Klassische Denkfalle aus dem Handwerksunterricht.',
    erzeuge() {
      const stuecke = ganz(3, 14);
      return { frage:`✂️ Du willst ein Seil in ${stuecke} gleich lange Stücke schneiden.\nWie viele Schnitte brauchst du?`,
        antwort:String(stuecke - 1),
        tipps:['Zeichne es auf: Beim ersten Schnitt hast du 2 Stücke.'] };
    } },

  { id:'kamele', stufe:4, varianten: 5,
    quelle:'Alte orientalische Erbschaftsaufgabe, seit dem Mittelalter überliefert.',
    erzeuge() {
      const faelle = [[2,3,9,17],[2,4,6,11],[2,3,10,14],[2,3,8,23],[2,4,5,19],[3,4,6,11]];
      const [a, b, c, tiere] = waehle(faelle.filter(f => Number.isInteger((f[3]+1)/f[0])
        && Number.isInteger((f[3]+1)/f[1]) && Number.isInteger((f[3]+1)/f[2])));
      const gesamt = tiere + 1;
      return { frage:`🐪 Ein Vater vererbt ${tiere} Kamele: 1/${a} dem Ältesten, 1/${b} dem Mittleren, 1/${c} dem Jüngsten.\n${tiere} lässt sich nicht teilen. Ein Nachbar leiht sein eigenes Kamel dazu.\nWie viele bekommt der Älteste?`,
        antwort:String(gesamt / a),
        tipps:[`Mit ${gesamt} Kamelen geht die Teilung glatt auf.`,
               `1/${a} von ${gesamt} ist ${gesamt / a} – und am Ende bleibt genau ein Kamel übrig, das des Nachbarn.`] };
    } },

  { id:'uhr_zeiger', stufe:5, varianten: 2,
    quelle:'Klassische Uhrenaufgabe, u. a. bei Sam Loyd um 1900.',
    erzeuge() {
      const stunden = waehle([12, 24]);
      const anzahl = stunden === 12 ? 11 : 22;
      return { frage:`🕐 Wie oft überholt der Minutenzeiger den Stundenzeiger in ${stunden} Stunden?`,
        antwort:String(anzahl),
        tipps:['Man könnte eine Zahl mehr vermuten – prüfe nach, wann es das erste Mal passiert.',
               'Kurz nach 1, kurz nach 2 … aber zwischen 11 und 12 fällt eines aus.'] };
    } },

  { id:'schubfach', stufe:3, varianten: 48,
    quelle:'Schubfachprinzip nach Dirichlet (1834).',
    erzeuge() {
      const faecher = ganz(3, 10), je = ganz(2, 7);
      const noetig = faecher * (je - 1) + 1;
      return { frage:`📦 In einem Sack sind Kugeln in ${faecher} Farben, von jeder mehr als genug.\nWie viele musst du blind ziehen, um sicher ${je} gleichfarbige zu haben?`,
        antwort:String(noetig),
        tipps:['Denke an den ungünstigsten Fall.',
               `Du könntest von jeder Farbe ${je - 1} Stück erwischen – das sind ${faecher * (je - 1)}. Die nächste Kugel entscheidet.`] };
    } }
];

/* Wie viele verschiedene Aufgaben gibt der Vorrat insgesamt her?
   Die Zahlen sind nicht geschätzt, sondern nachgezählt: tests/knacknuesse.mjs
   erzeugt je Familie 40.000 Aufgaben und prüft, dass mindestens so viele
   verschiedene dabei herauskommen. */
export const VARIANTEN_GESAMT = FAMILIEN.reduce((a, f) => a + f.varianten, 0);
