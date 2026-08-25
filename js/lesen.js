/* Lautlesetraining: Texte und die Auswertung einer Leseaufnahme.

   WAS HIER GEMESSEN WIRD - UND WAS NICHT

   Die App hoert NICHT zu, was gelesen wird. Sie erkennt keine Woerter, schickt
   nichts an einen Server und speichert keinen Ton. Gemessen wird ausschliesslich
   die Lautstaerke-Huellkurve: wann wurde gesprochen, wann war Stille. Aus dieser
   einen Spur laesst sich erstaunlich viel ueber Leseflüssigkeit ablesen - und
   genau das, was beim stockenden Lesen das Problem ist.

   Leseflüssigkeit hat in der Forschung drei Bestandteile (Rasinski; NAEP Oral
   Reading Fluency Scale 1995):
     1. TEMPO      - Silben pro Minute. In Silben statt Woertern, weil "Ei" und
                     "Sonnenblume" sonst gleich zaehlen wuerden.
     2. PHRASIERUNG- Wo wird Luft geholt? An Satzzeichen ist eine Pause richtig
                     und gut. Mitten im Satz ist sie eine Stockung - das, was
                     man als "Leseluecke" hoert.
     3. BETONUNG   - Bleibt die Stimme monoton oder schwingt sie? Messbar als
                     Schwankung der Lautstaerke ueber den Text.

   Das WIRKSAME Training dazu heisst wiederholtes Lautlesen (Samuels 1979,
   "method of repeated readings"): denselben kurzen Text zwei- bis dreimal
   lesen. Nicht immer neue Texte - derselbe Text. Deshalb fuehrt die App durch
   drei Durchgaenge und zeigt die Verbesserung.

   AUSDRUECKLICH KEINE DIAGNOSE. Eine Lese-Rechtschreib-Schwaeche erkennt man
   nicht an einer Tonaufnahme, und diese App darf und will das nicht. Sie ist
   ein Uebungsgeraet, kein Test. */

import { silbenZahl, wortZahl } from './silben.js';

/* --------------------------------------------------------------------------
   Texte. Kurz gehalten: 20-60 Woerter, damit drei Durchgaenge zumutbar sind.
   Die Satzzeichen sind wichtig - an ihnen wird die Phrasierung gemessen.
   -------------------------------------------------------------------------- */
export const TEXTE = [
  /* Etappe 1: kurze Saetze, haeufige Woerter, viel Punkt */
  { etappe: 1, titel: 'Der Morgen', text:
    'Die Sonne geht auf. Ein Vogel singt im Baum. Lena macht das Fenster auf. Die Luft ist kühl und frisch. Heute wird ein guter Tag.' },
  { etappe: 1, titel: 'Im Garten', text:
    'Im Garten blüht die Sonnenblume. Sie ist größer als Papa. Eine Biene sitzt auf dem Blatt. Sie sammelt Nektar. Dann fliegt sie wieder fort.' },
  { etappe: 1, titel: 'Der Regen', text:
    'Es regnet seit dem Morgen. Die Straße ist nass. Tim springt in eine Pfütze. Das Wasser spritzt hoch. Mama lacht und schüttelt den Kopf.' },
  { etappe: 1, titel: 'Die Katze', text:
    'Unsere Katze heißt Mia. Am liebsten schläft sie auf dem Stuhl. Wenn sie Hunger hat, ruft sie laut. Dann bekommt sie ihr Futter. Danach schläft sie weiter.' },
  { etappe: 1, titel: 'Am Abend', text:
    'Der Tag ist zu Ende. Draußen wird es dunkel. Der Mond steht über dem Dach. Papa liest eine Geschichte vor. Bald schlafen alle ein.' },

  /* Etappe 2: laengere Saetze, Kommas, mehrsilbige Woerter */
  { etappe: 2, titel: 'Der Schmetterling', text:
    'Zuerst war es ein winziges Ei, dann eine hungrige Raupe. Die Raupe fraß Blätter, bis sie dick und rund war. Danach spann sie sich ein und wartete. Eines Morgens brach die Hülle auf, und ein Schmetterling faltete seine Flügel in die Sonne.' },
  { etappe: 2, titel: 'Die Brücke', text:
    'Über den Fluss führt eine alte Brücke aus Stein. Sie steht dort seit hundert Jahren, und noch immer trägt sie jeden Wagen. Wer unten am Ufer steht, hört das Wasser rauschen. Manchmal springt ein Fisch, und die Ringe wandern langsam nach außen.' },
  { etappe: 2, titel: 'Der Leuchtturm', text:
    'Nachts, wenn der Sturm über das Meer fährt, dreht sich oben das Licht. Es wandert über die Wellen und findet die Schiffe. Der Wärter sitzt in der warmen Stube und schreibt in sein Buch, wie hoch die Wellen gehen und woher der Wind kommt.' },
  { etappe: 2, titel: 'Das Gewitter', text:
    'Erst wurde es still, dann wurde es dunkel. Die Vögel verschwanden, und kein Blatt bewegte sich mehr. Plötzlich riss ein Blitz den Himmel auf, und der Donner rollte über die Felder. Danach roch die ganze Wiese nach Regen.' },
  { etappe: 2, titel: 'Der alte Baum', text:
    'Mitten auf dem Hof steht ein Apfelbaum, den schon der Urgroßvater gepflanzt hat. Sein Stamm ist rissig, und einige Äste sind abgestorben. Trotzdem trägt er jedes Jahr Früchte, kleine, saure Äpfel, aus denen die beste Marmelade wird.' },

  /* Etappe 3: Fabeln und Klassisches, verschachtelte Saetze */
  { etappe: 3, titel: 'Der Fuchs und die Trauben', text:
    'Ein hungriger Fuchs sah an einem hohen Weinstock prächtige Trauben hängen. Er sprang, so hoch er konnte, und sprang noch einmal, doch er erreichte sie nicht. Als er endlich einsah, dass alle Mühe vergeblich war, ging er davon und sagte: Sie sind ja noch gar nicht reif.' },
  { etappe: 3, titel: 'Der Nordwind und die Sonne', text:
    'Der Nordwind und die Sonne stritten, wer von ihnen beiden wohl der Stärkere wäre. Da kam ein Wanderer des Weges, der in einen warmen Mantel gehüllt war. Sie wurden einig, dass derjenige für den Stärkeren gelten sollte, der den Wanderer zwingen würde, seinen Mantel abzunehmen.' },
  { etappe: 3, titel: 'Die Stadtmusikanten', text:
    'Ein Esel, der viele Jahre die Säcke zur Mühle getragen hatte, merkte, dass seine Kräfte zu Ende gingen. Da dachte er: Ich will nach Bremen gehen und dort Stadtmusikant werden. Unterwegs traf er einen Hund, der am Weg lag und schwer atmete, als wäre er weit gelaufen.' },
  { etappe: 3, titel: 'Die Uhr', text:
    'Eine Uhr misst nicht die Zeit, sie teilt sie nur ein. Vor dreihundert Jahren schlugen die Glocken für ein ganzes Dorf, und niemand fragte nach Minuten. Erst als die Eisenbahn kam, mussten alle Uhren gleich gehen, denn ein Zug, der zu früh abfährt, wartet nicht.' },
  { etappe: 3, titel: 'Der Kompass', text:
    'Lange bevor jemand die Ursache kannte, wusste man, dass eine bestimmte Nadel sich immer nach Norden dreht. Seefahrer vertrauten ihr auf offener See, wo weder Küste noch Stern zu sehen war. Dass die ganze Erde ein Magnet ist, ahnte damals niemand.' },

  /* Etappe 4: Sachtexte und Argumentation */
  { etappe: 4, titel: 'Warum der Himmel blau ist', text:
    'Sonnenlicht ist nicht weiß, sondern eine Mischung aller Farben. Trifft es auf die Luft, so werden die kurzwelligen Anteile, also Blau und Violett, viel stärker in alle Richtungen gestreut als die langwelligen. Deshalb erreicht uns aus jeder Richtung des Himmels vor allem blaues Licht, während die Sonne selbst gelblich erscheint.' },
  { etappe: 4, titel: 'Das Argument', text:
    'Ein Argument besteht aus Voraussetzungen und einer Behauptung, die daraus folgen soll. Wer widerspricht, hat drei Möglichkeiten: Er kann eine Voraussetzung bestreiten, er kann bestreiten, dass die Behauptung wirklich folgt, oder er kann beides zugeben und trotzdem zeigen, dass die Behauptung schädlich wäre. Nur die ersten beiden greifen das Argument selbst an.' },
  { etappe: 4, titel: 'Die Druckerpresse', text:
    'Vor Gutenberg wurde jedes Buch einzeln abgeschrieben, und ein einziger Band kostete so viel wie ein kleines Haus. Der bewegliche Letternsatz änderte nicht den Inhalt der Bücher, sondern ihren Preis. Innerhalb von fünfzig Jahren entstanden in Europa mehr Bücher als in den tausend Jahren zuvor.' },
  { etappe: 4, titel: 'Wahrscheinlichkeit', text:
    'Wer eine Münze zehnmal wirft und zehnmal Kopf erhält, neigt zu der Annahme, beim elften Mal müsse endlich Zahl kommen. Die Münze aber hat kein Gedächtnis. Jeder einzelne Wurf steht für sich, und die Wahrscheinlichkeit bleibt bei der Hälfte. Der Irrtum ist so verbreitet, dass er einen eigenen Namen trägt.' },
  { etappe: 4, titel: 'Das Experiment', text:
    'Eine Beobachtung allein beweist wenig, denn sie könnte auch andere Ursachen haben. Erst der Vergleich mit einer Gruppe, die genauso behandelt wurde, nur ohne den einen entscheidenden Unterschied, macht aus der Beobachtung ein Ergebnis. Wer diese Vergleichsgruppe weglässt, kann alles behaupten und nichts zeigen.' },

  /* Etappe 5: anspruchsvolle Prosa, lange Perioden */
  { etappe: 5, titel: 'Seneca an Lucilius', text:
    'Es ist nicht so, dass wir wenig Zeit hätten, sondern wir verschwenden viel davon. Das Leben ist lang genug und in ausreichendem Maße gegeben, um die höchsten Dinge zu vollenden, wenn es nur zur Gänze gut angelegt wäre. Aber wo es in Aufwand und Nachlässigkeit zerfließt, da merken wir erst, dass es vergangen ist, wenn wir sehen, dass es vorbei ist.' },
  { etappe: 5, titel: 'Kant über Aufklärung', text:
    'Aufklärung ist der Ausgang des Menschen aus seiner selbstverschuldeten Unmündigkeit. Unmündigkeit ist das Unvermögen, sich seines Verstandes ohne Leitung eines anderen zu bedienen. Selbstverschuldet ist diese Unmündigkeit, wenn die Ursache derselben nicht am Mangel des Verstandes, sondern der Entschließung und des Mutes liegt.' },
  { etappe: 5, titel: 'Die Methode des Zweifels', text:
    'Wer einmal in seinem Leben alles von Grund auf umstoßen will, muss nicht jede einzelne Meinung prüfen, denn das wäre unendliche Arbeit. Es genügt, die Grundlagen anzugreifen, auf denen alles Übrige ruht, so wie beim Einsturz des Fundaments von selbst zusammenfällt, was darauf gebaut war.' },
  { etappe: 5, titel: 'Über das Beobachten', text:
    'Der geübte Beobachter unterscheidet sich vom ungeübten nicht durch schärfere Augen, sondern dadurch, dass er weiß, worauf er zu achten hat. Wer nichts erwartet, sieht alles gleich wichtig und damit nichts. Wer zu viel erwartet, sieht nur noch das, was seine Erwartung bestätigt. Zwischen diesen beiden Fehlern liegt die ganze Kunst.' },
  { etappe: 5, titel: 'Vom Lesen', text:
    'Beim Lesen denkt ein fremder Kopf für uns, und solange wir lesen, sind wir sein Gast. Erst wenn wir das Buch weglegen und uns fragen, was wir davon behalten wollen, beginnt das eigene Denken. Wer unaufhörlich liest und niemals zwischendurch nachdenkt, verliert allmählich die Fähigkeit, selbst zu denken.' }
];

export const texteFuer = etappe =>
  TEXTE.filter(t => t.etappe === Math.max(1, Math.min(5, etappe || 1)));

/* Kennzahlen eines Textes, einmal berechnet. */
export function textMasse(text) {
  const woerter = wortZahl(text);
  const silbenAnzahl = silbenZahl(text);
  /* Stellen, an denen eine Pause richtig ist: Satzzeichen. Der Schlusspunkt
     zaehlt nicht mit - danach ist der Text zu Ende. */
  const zeichen = (text.match(/[.,;:!?]/g) || []).length;
  return { woerter, silben: silbenAnzahl, pausenStellen: Math.max(0, zeichen - 1) };
}

/* --------------------------------------------------------------------------
   Auswertung der Huellkurve

   Eingabe ist eine Folge von Lautstaerkewerten (0..1) in festem Abstand.
   Wie die entstehen, ist Sache der Oberflaeche - hier wird nur gerechnet,
   und genau deshalb ist das ohne Mikrofon pruefbar.
   -------------------------------------------------------------------------- */

/* Ab welcher Lautstaerke gilt es als Sprechen? Feste Schwellen scheitern:
   ein leises Kind in einem stillen Zimmer und ein lautes an der Straße
   brauchen verschiedene Grenzen. Deshalb wird die Grenze aus der Aufnahme
   selbst gewonnen - Grundrauschen plus ein Teil des Abstands zur Spitze. */
export function schwelleFuer(huellkurve) {
  const sortiert = [...huellkurve].sort((a, b) => a - b);
  if (!sortiert.length) return 0;
  const rauschen = sortiert[Math.floor(sortiert.length * 0.05)];
  const spitze = sortiert[Math.floor(sortiert.length * 0.95)];

  /* Sonderfall, an dem eine naive Schwelle scheitert: eine Aufnahme fast ohne
     Stille. Dann liegen Grundrauschen und Spitze dicht beieinander, und eine
     Schwelle dazwischen wuerde das Sprechen selbst wegschneiden - die App
     haette "nichts gehoert", obwohl durchgehend gelesen wurde.
     Unterschieden wird dann ueber den Pegel: durchgehend leise ist Stille,
     durchgehend laut ist ununterbrochenes Sprechen. */
  if (spitze - rauschen < spitze * 0.15) {
    return spitze < 0.10 ? Infinity : spitze * 0.5;
  }
  return rauschen + (spitze - rauschen) * 0.25;
}

/* Zerlegt die Huellkurve in Sprech- und Stilleabschnitte.
   Kurzes Flackern wird geglaettet: Ein einzelner leiser Messpunkt mitten im
   Sprechen ist keine Pause, sondern ein Verschlusslaut wie in "Kat-ze". */
export function abschnitte(huellkurve, schrittMs = 25) {
  const schwelle = schwelleFuer(huellkurve);
  const laut = huellkurve.map(v => v > schwelle);

  /* Luecken unter 120 ms sind Sprechpausen innerhalb eines Wortes. */
  const mindestLuecke = Math.max(1, Math.round(120 / schrittMs));
  for (let i = 0; i < laut.length; i++) {
    if (laut[i]) continue;
    let j = i;
    while (j < laut.length && !laut[j]) j++;
    const laenge = j - i;
    if (laenge < mindestLuecke && i > 0 && j < laut.length) {
      for (let k = i; k < j; k++) laut[k] = true;
    }
    i = j - 1;
  }

  const teile = [];
  let start = 0;
  for (let i = 1; i <= laut.length; i++) {
    if (i === laut.length || laut[i] !== laut[start]) {
      teile.push({ sprechen: laut[start], vonMs: start * schrittMs, dauerMs: (i - start) * schrittMs });
      start = i;
    }
  }
  /* Stille am Anfang und am Ende gehoert nicht zum Lesen. */
  while (teile.length && !teile[0].sprechen) teile.shift();
  while (teile.length && !teile[teile.length - 1].sprechen) teile.pop();
  return teile;
}

/* Wie stark schwankt die Lautstaerke waehrend des Sprechens? Eine monotone
   Stimme haelt einen Pegel, eine betonte hebt und senkt ihn. */
export function betonung(huellkurve) {
  const schwelle = schwelleFuer(huellkurve);
  const laute = huellkurve.filter(v => v > schwelle);
  if (laute.length < 8) return 0;
  const mittel = laute.reduce((a, b) => a + b, 0) / laute.length;
  if (mittel <= 0) return 0;
  const streuung = Math.sqrt(laute.reduce((s, v) => s + (v - mittel) ** 2, 0) / laute.length);
  /* Variationskoeffizient: unabhaengig davon, wie laut jemand grundsaetzlich
     spricht. 0,30 und mehr ist deutlich betont, unter 0,10 klingt monoton. */
  return Math.max(0, Math.min(100, Math.round((streuung / mittel) / 0.30 * 100)));
}

export const PAUSE_MS = 250;      // ab hier hoert man eine Pause
export const STOCKUNG_MS = 400;   // eine lange Pause mitten im Satz faellt auf

/* Die eigentliche Auswertung. */
export function auswerten(huellkurve, { text, schrittMs = 25, durchgang = 1 } = {}) {
  const masse = textMasse(text || '');
  const teile = abschnitte(huellkurve, schrittMs);
  const gesamtMs = teile.reduce((s, t) => s + t.dauerMs, 0);
  const sprechMs = teile.filter(t => t.sprechen).reduce((s, t) => s + t.dauerMs, 0);
  const pausen = teile.filter(t => !t.sprechen && t.dauerMs >= PAUSE_MS);

  /* Tempo in Silben pro Minute. Gerechnet wird auf die GESAMTE Lesezeit
     einschliesslich Pausen - eine Pause kostet Lesezeit, das ist der Punkt. */
  const minuten = gesamtMs / 60000;
  const tempo = minuten > 0 ? Math.round(masse.silben / minuten) : 0;
  const woerterProMinute = minuten > 0 ? Math.round(masse.woerter / minuten) : 0;

  /* Stockungen: Pausen, die es mehr gibt, als der Text Satzzeichen hat.
     An einem Komma innezuhalten ist gute Phrasierung; die Pausen darueber
     hinaus sind die "Leseluecken". Es wird nicht behauptet, dass die App
     weiss, WO im Text die Pause lag - nur, wie viele es zu viel waren. */
  const lange = pausen.filter(p => p.dauerMs >= STOCKUNG_MS);
  const stockungen = Math.max(0, lange.length - masse.pausenStellen);

  /* Gleichmass: Wie aehnlich lang sind die Sprechabschnitte? Fluessiges Lesen
     ergibt lange, aehnliche Boegen; stockendes Lesen viele kurze Stuecke. */
  const boegen = teile.filter(t => t.sprechen).map(t => t.dauerMs);
  let gleichmass = 0;
  if (boegen.length >= 2) {
    const m = boegen.reduce((a, b) => a + b, 0) / boegen.length;
    const s = Math.sqrt(boegen.reduce((x, v) => x + (v - m) ** 2, 0) / boegen.length);
    gleichmass = Math.max(0, Math.min(100, Math.round(100 - (s / m) * 100)));
  } else if (boegen.length === 1) {
    gleichmass = 100;              // in einem Zug gelesen
  }

  const anteilSprechen = gesamtMs > 0 ? sprechMs / gesamtMs : 0;

  return {
    dauerMs: gesamtMs,
    sprechMs,
    tempo,                          // Silben pro Minute
    woerterProMinute,
    pausen: pausen.length,
    stockungen,
    pausenStellen: masse.pausenStellen,
    laengstePauseMs: pausen.reduce((m, p) => Math.max(m, p.dauerMs), 0),
    gleichmass,
    betonung: betonung(huellkurve),
    anteilSprechen: Math.round(anteilSprechen * 100),
    boegen: boegen.length,
    silben: masse.silben,
    woerter: masse.woerter,
    durchgang
  };
}

/* --------------------------------------------------------------------------
   Einordnung. Bewusst grob und in vier Stufen, angelehnt an die NAEP-Skala
   fuer lautes Lesen (1995). Keine Prozentzahl, keine Note.
   -------------------------------------------------------------------------- */

/* Erwartetes Tempo in Silben pro Minute je Etappe. Bewusst weite Spannen:
   Lesetempo schwankt stark mit Textart, Tagesform und Uebung. Die Werte
   entsprechen ungefaehr 60-90 Woertern pro Minute in Klasse 2 bis
   150-200 bei geuebten Erwachsenen. */
export const TEMPO_ERWARTET = { 1: [80, 150], 2: [130, 200], 3: [170, 250], 4: [200, 290], 5: [220, 320] };

export function einordnung(werte, etappe = 1) {
  const [unten, oben] = TEMPO_ERWARTET[Math.max(1, Math.min(5, etappe))] || TEMPO_ERWARTET[1];

  let stufe, name, text;
  const flott = werte.tempo >= unten;
  const wenigStockungen = werte.stockungen <= 1;
  const langeBoegen = werte.gleichmass >= 55;

  if (flott && wenigStockungen && langeBoegen) {
    stufe = 4; name = 'Fließend';
    text = 'In ganzen Sinnabschnitten gelesen, mit Pausen an den richtigen Stellen.';
  } else if ((flott && wenigStockungen) || (wenigStockungen && langeBoegen)) {
    stufe = 3; name = 'Meistens flüssig';
    text = 'Größere Abschnitte am Stück, einzelne Stellen unterbrechen noch.';
  } else if (wenigStockungen || langeBoegen || flott) {
    stufe = 2; name = 'In Stücken';
    text = 'Wortgruppen statt einzelner Wörter – die Bögen dürfen noch länger werden.';
  } else {
    stufe = 1; name = 'Wort für Wort';
    text = 'Noch viele Unterbrechungen. Derselbe Text ein zweites Mal gelesen hilft am meisten.';
  }

  const hinweise = [];
  if (werte.stockungen > 1)
    hinweise.push(`${werte.stockungen} Pausen mehr als der Text Satzzeichen hat – dort hakt das Lesen.`);
  if (werte.tempo > 0 && werte.tempo < unten)
    hinweise.push(`Tempo ${werte.tempo} Silben/Minute, erwartbar wären ${unten}–${oben}.`);
  if (werte.tempo > oben * 1.15)
    hinweise.push('Sehr schnell gelesen – prüfen Sie, ob der Inhalt noch ankommt.');
  if (werte.betonung < 25)
    hinweise.push('Die Stimme bleibt recht gleichmäßig – Betonung lässt sich üben, indem man die Stelle vorspricht.');
  if (werte.anteilSprechen > 92 && werte.pausen === 0 && werte.pausenStellen > 0)
    hinweise.push('Ohne jede Pause gelesen – auch an einem Punkt darf man Luft holen.');

  return { stufe, name, text, hinweise, erwartet: [unten, oben] };
}

/* Vergleich zweier Durchgaenge desselben Textes - das Herz des wiederholten
   Lautlesens. Verglichen wird nur, was vergleichbar ist: derselbe Text. */
export function fortschritt(vorher, nachher) {
  if (!vorher || !nachher) return null;
  const tempoPlus = nachher.tempo - vorher.tempo;
  const stockungenWeniger = vorher.stockungen - nachher.stockungen;
  const teile = [];
  if (tempoPlus >= 10) teile.push(`${tempoPlus} Silben pro Minute schneller`);
  else if (tempoPlus <= -10) teile.push(`${-tempoPlus} Silben pro Minute langsamer`);
  if (stockungenWeniger > 0) teile.push(`${stockungenWeniger} Stockung(en) weniger`);
  else if (stockungenWeniger < 0) teile.push(`${-stockungenWeniger} Stockung(en) mehr`);
  const besser = tempoPlus >= 10 || stockungenWeniger > 0;
  return {
    besser,
    tempoPlus,
    stockungenWeniger,
    text: teile.length ? teile.join(', ') : 'fast genau gleich gelesen'
  };
}
