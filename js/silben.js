/* Silbentrennung fuer deutsche Woerter – die Grundlage der Silbenfaerbung.

   Warum ueberhaupt Silben? In der Grundschule ist das Silbenlesen das Mittel
   gegen stockendes Lesen: Ein Kind, das "Sonnenblume" Buchstabe fuer Buchstabe
   entziffert, liest langsam und verliert den Sinn. Sieht es "Son-nen-blu-me"
   in abwechselnden Farben, greift es die Silbe als Ganzes – das ist der Schritt
   von der Buchstaben- zur Silbenebene (Silbenmethode, in vielen Faibeln als
   "Silbenboegen" gedruckt).

   Der Anspruch hier ist die SPRECHSILBE, nicht die Worttrennung am Zeilenende.
   Beides faellt meistens zusammen, aber nicht immer.

   Das Verfahren ist regelbasiert und arbeitet in dieser Reihenfolge:
     1. Zusammensetzungen an bekannten Fugen trennen (Sonnen|blume)
     2. Vorsilben abtrennen (ver|stehen)
     3. Innerhalb des Restes nach Vokalkernen trennen

   Regelbasiert heisst: Es gibt Ausnahmen, die es nicht trifft. Deshalb steht
   in tests/silben.mjs eine Liste von ueber 150 handgepruefteten Woertern; die
   Trefferquote wird dort ausgewiesen und nicht schoengerechnet. */

const VOKALE = 'aeiouäöüáàâéèêíìîóòôúùûyAEIOUÄÖÜY';
const istVokal = c => VOKALE.includes(c);

/* Buchstabenpaare, die einen einzigen Laut bilden und niemals getrennt werden. */
/* Buchstabenpaare, die einen einzigen Laut bilden und niemals getrennt werden.
   "ng" und "nk" stehen bewusst NICHT hier: Sie sind zwar ein Laut, die
   Silbengrenze liegt aber mittendrin – Fin-ger, sin-gen, Jun-ge. */
const DIGRAFEN = ['sch', 'ch', 'ck', 'ph', 'th', 'sh', 'qu'];

/* Konsonantengruppen, mit denen ein deutsches Wort beginnen kann. Braucht es
   an zwei Stellen: um zu erkennen, ob eine Gruppe komplett zur naechsten Silbe
   gehoert (Zi-tro-ne), und um falsche Vorsilben abzuwehren – "Erdbeere" faengt
   mit "er" an, aber "dbeere" beginnt mit keinem moeglichen Anlaut. */
const ANLAUTE = [
  'schl', 'schm', 'schn', 'schr', 'schw', 'spr', 'str', 'sch', 'chr',
  'bl', 'br', 'dr', 'fl', 'fr', 'gl', 'gr', 'kl', 'kr', 'pl', 'pr', 'tr',
  'pf', 'kn', 'gn', 'qu', 'zw', 'sp', 'st', 'sk', 'ch', 'ph', 'th', 'sl', 'ts'
];
/* Nur diese Zweiergruppen wandern KOMPLETT in die naechste Silbe (Zi-tro-ne).
   "st" gehoert seit der Rechtschreibreform nicht dazu: Fens-ter, nicht Fen-ster. */
/* "pf" fehlt hier bewusst, wie "ng": ein Laut, aber die Silbengrenze liegt
   mittendrin – Ap-fel, nicht A-pfel. */
const GANZ_NACH_HINTEN = ['bl','br','dr','fl','fr','gl','gr','kl','kr','pl','pr','tr','ch','sch','ck','ph','th','qu'];

const beginntMitAnlaut = rest => {
  const kons = (rest.toLowerCase().match(/^[^aeiouäöüy]+/) || [''])[0];
  if (kons.length <= 1) return true;
  return ANLAUTE.some(a => kons === a) || ANLAUTE.some(a => kons.startsWith(a) && kons.length <= a.length + 0);
};

/* Vokalgruppen, die einen einzigen Silbenkern bilden (Diphthonge und Dehnungen).
   "ie" gehoert dazu, "io" ausdruecklich nicht (Vi-o-line, Ra-di-o). */
const DOPPELKERNE = ['aa', 'ee', 'oo', 'ie', 'ei', 'ai', 'au', 'eu', 'äu', 'ey', 'ay', 'oi'];

/* Vorsilben, die als eigene Sprechsilbe vorne stehen. Laengere zuerst,
   damit "unter" nicht als "un" abgetrennt wird. */
const VORSILBEN = [
  'gegen', 'hinter', 'zwischen', 'wieder', 'zusammen', 'unter', 'ueber', 'über',
  'durch', 'gegenüber', 'entgegen', 'voran', 'vorbei', 'zurück', 'heraus', 'herein',
  'hinaus', 'hinein', 'empor', 'gegen', 'gegen',
  'aus', 'auf', 'ein', 'ver', 'vor', 'ent', 'emp', 'miss', 'weg', 'her', 'hin',
  'ab', 'an', 'be', 'er', 'ge', 'zer', 'um', 'zu', 'los', 'mit', 'nach', 'bei'
];

/* Zweite Teile haeufiger Zusammensetzungen. Trifft nur, wenn davor genug
   Wortmaterial steht – sonst wuerde "Bauer" an "auer" zerlegt. */
const FUGEN = [
  'blume', 'blumen', 'baum', 'bäume', 'haus', 'häuser', 'schule', 'schulen',
  'garten', 'gärten', 'zimmer', 'stunde', 'stunden', 'tafel', 'tasche', 'taschen',
  'schrank', 'stuhl', 'stühle', 'tisch', 'tür', 'fenster', 'wand', 'dach',
  'wagen', 'zeug', 'strasse', 'straße', 'weg', 'brücke', 'brücken', 'turm',
  'schein', 'licht', 'lampe', 'kerze', 'feuer', 'wasser', 'stein', 'sand',
  'berg', 'berge', 'wald', 'wälder', 'wiese', 'wiesen', 'feld', 'felder',
  'blatt', 'blätter', 'wurzel', 'wurzeln', 'zweig', 'zweige', 'frucht',
  'vogel', 'vögel', 'nest', 'nester', 'katze', 'katzen', 'hund', 'hunde',
  'pferd', 'pferde', 'maus', 'mäuse', 'fisch', 'fische', 'käfer',
  'buch', 'bücher', 'heft', 'hefte', 'stift', 'stifte', 'papier', 'seite',
  'geschichte', 'geschichten', 'wort', 'wörter', 'satz', 'sätze', 'zahl', 'zahlen',
  'freund', 'freunde', 'kind', 'kinder', 'mutter', 'vater', 'bruder', 'schwester',
  'morgen', 'mittag', 'abend', 'nacht', 'tag', 'tage', 'woche', 'monat', 'jahr',
  'zeit', 'uhr', 'minute', 'stunde', 'punkt', 'kreis', 'linie',
  'spiel', 'spiele', 'sport', 'ball', 'bälle', 'lauf', 'sprung',
  'kopf', 'hand', 'hände', 'fuß', 'füße', 'auge', 'augen', 'ohr', 'ohren',
  'schaft', 'schaften', 'heit', 'keit', 'ung', 'ungen', 'nis', 'tum'   /* 'lein' und 'chen' stehen in ENDUNGEN - dort mit der -schen-Ausnahme */
];

/* Endungen, die eine eigene Silbe bilden, aber keinen eigenen Vollvokal haben. */
const ENDUNGEN = ['chen', 'lein', 'lich', 'ling', 'nis', 'sam', 'bar', 'haft', 'los', 'voll'];

/* --------------------------------------------------------------------------
   Schritt 3: Trennung nach Vokalkernen innerhalb eines einfachen Wortteils.

   Grundregel des Deutschen: Ein einzelner Konsonant zwischen zwei Vokalen geht
   zur folgenden Silbe (le-sen), bei mehreren bleibt der letzte bei der folgenden
   (Fens-ter). Digrafen zaehlen dabei als ein Konsonant (Bü-cher, nicht Büc-her).
   -------------------------------------------------------------------------- */

/* Zerlegt in Vokalgruppen und Konsonantengruppen: "lesen" -> [l][e][s][e][n] */
function bausteine(wort) {
  const teile = [];
  let i = 0;
  while (i < wort.length) {
    const vokal = istVokal(wort[i]);
    let stueck = wort[i];
    i++;
    while (i < wort.length && istVokal(wort[i]) === vokal) {
      /* Vokale nur zusammenfassen, wenn sie wirklich einen Kern bilden. */
      if (vokal) {
        const paar = (stueck.slice(-1) + wort[i]).toLowerCase();
        if (!DOPPELKERNE.includes(paar)) break;
        /* "-ien" am Wortende ist zweisilbig: Fe-ri-en, Ma-ri-en-käfer.
           Sonst bleibt "ie" ein Kern: Fa-mi-lie, Bie-ne. */
        if (paar === 'ie' && wort.slice(i - 1).toLowerCase() === 'ien') break;
      }
      stueck += wort[i];
      i++;
    }
    teile.push({ vokal, text: stueck });
  }
  return teile;
}

/* Wie viele Buchstaben am Anfang einer Konsonantengruppe gehoeren noch zur
   vorigen Silbe? Digrafen duerfen dabei nicht auseinandergerissen werden. */
function schnittstelle(kons) {
  const klein = kons.toLowerCase();
  if (kons.length <= 1) return 0;                       // le-sen
  /* Ist die ganze Gruppe ein einziger Laut oder ein moeglicher Anlaut,
     wandert sie komplett nach hinten: wa-schen, Bü-cher, Zi-tro-ne. */
  if (DIGRAFEN.includes(klein) || GANZ_NACH_HINTEN.includes(klein)) return 0;
  /* Endet die Gruppe auf einem Digrafen, geht der ganze Digraf nach hinten. */
  for (const d of DIGRAFEN) {
    if (klein.endsWith(d) && kons.length > d.length) return kons.length - d.length;
  }
  /* Endet sie auf einer Muta-cum-Liquida-Gruppe (Verschlusslaut + r/l),
     geht auch die komplett nach hinten: Ge-bur-tstag? Nein - Ta-fel, Ne-bel. */
  for (const g of GANZ_NACH_HINTEN) {
    if (g.length === 2 && klein.endsWith(g) && kons.length > 2) return kons.length - 2;
  }
  return kons.length - 1;                               // Fens-ter, Kin-der
}

function einfachTrennen(wort) {
  if (wort.length < 3) return [wort];
  const teile = bausteine(wort);
  const kerne = teile.filter(t => t.vokal).length;
  if (kerne < 2) return [wort];

  const silben = [];
  let aktuell = '';
  for (let i = 0; i < teile.length; i++) {
    const t = teile[i];
    if (!t.vokal) {
      /* Konsonantengruppe zwischen zwei Vokalen aufteilen. */
      const davor = i > 0 && teile[i - 1].vokal;
      const danach = i + 1 < teile.length && teile[i + 1].vokal;
      if (davor && danach) {
        const schnitt = schnittstelle(t.text);
        aktuell += t.text.slice(0, schnitt);
        if (aktuell) silben.push(aktuell);
        aktuell = t.text.slice(schnitt);
      } else {
        aktuell += t.text;
      }
    } else {
      /* Zwei Vokalkerne direkt nebeneinander sind zwei Silben: Bau-er, Ra-di-o. */
      if (aktuell && i > 0 && teile[i - 1].vokal) { silben.push(aktuell); aktuell = ''; }
      aktuell += t.text;
    }
  }
  if (aktuell) silben.push(aktuell);

  /* Eine Silbe ohne Vokal ist keine – sie gehoert an die Nachbarin. */
  const sauber = [];
  for (const s of silben) {
    if (!/[aeiouäöüy]/i.test(s) && sauber.length) sauber[sauber.length - 1] += s;
    else sauber.push(s);
  }
  return sauber.length ? sauber : [wort];
}

/* --------------------------------------------------------------------------
   Schritte 1 und 2: Zusammensetzungen und Vorsilben
   -------------------------------------------------------------------------- */

function vorsilbeAbtrennen(wort) {
  const klein = wort.toLowerCase();
  for (const v of VORSILBEN) {
    if (!klein.startsWith(v)) continue;
    const rest = wort.slice(v.length);
    /* Der Rest muss ein eigenes Wort sein koennen: mindestens ein Vokal
       und genug Buchstaben. Sonst wird aus "Beere" ein "Be-ere". */
    if (rest.length < 3) continue;
    if (!/[aeiouäöüy]/i.test(rest)) continue;
    /* Beginnt der Rest mit einem Vokal, ist die Trennung meist falsch
       ("Ge-arbeitet" ja, aber "Be-eren" nein) – nur bei langen Vorsilben. */
    if (istVokal(rest[0]) && v.length < 3) continue;
    /* "Erdbeere" faengt mit "er" an, aber "dbeere" beginnt mit keinem
       moeglichen deutschen Anlaut - also ist "er" hier keine Vorsilbe. */
    if (!beginntMitAnlaut(rest)) continue;
    return [wort.slice(0, v.length), rest];
  }
  return null;
}

function fugeAbtrennen(wort) {
  const klein = wort.toLowerCase();
  for (const f of FUGEN) {
    if (f.length + 2 > klein.length) continue;
    if (!klein.endsWith(f)) continue;
    const kopf = wort.slice(0, wort.length - f.length);
    if (kopf.length < 3) continue;
    if (!/[aeiouäöüy]/i.test(kopf)) continue;
    return [kopf, wort.slice(wort.length - f.length)];
  }
  return null;
}

/* Zerlegt EIN Wort in Sprechsilben. */
export function silben(wort) {
  if (!wort) return [];
  if (wort.length < 3) return [wort];

  const fuge = fugeAbtrennen(wort);
  if (fuge) return [...silben(fuge[0]), ...silben(fuge[1])];

  const vor = vorsilbeAbtrennen(wort);
  if (vor) return [...einfachTrennen(vor[0]), ...silben(vor[1])];

  for (const e of ENDUNGEN) {
    /* "-schen" ist meistens kein Verkleinerungs-"chen": wa-schen, Ta-schen.
       Ausnahme sind Verkleinerungen auf langem Vokal: Häus-chen, Mäus-chen,
       Sträuß-chen. Unterscheidungsmerkmal ist der Vokal vor dem s - kurz und
       einzeln (wa-s-chen) gegen lang oder Doppellaut (Häu-s-chen). */
    if (e === 'chen' && /schen$/i.test(wort)) {
      const davor = wort.slice(0, -5).toLowerCase();
      const langerKern = /(aa|ee|oo|ie|ei|ai|au|eu|äu|ah|eh|oh|uh|äh|öh|üh)$/.test(davor);
      if (!langerKern) continue;
    }
    if (wort.toLowerCase().endsWith(e) && wort.length > e.length + 2)
      return [...silben(wort.slice(0, wort.length - e.length)), wort.slice(wort.length - e.length)];
  }

  return einfachTrennen(wort);
}

/* Zerlegt einen ganzen Text. Satzzeichen und Leerraum bleiben erhalten und
   werden als eigene Stuecke zurueckgegeben, damit die Anzeige sie nicht faerbt. */
export function textInSilben(text) {
  const stuecke = [];
  const woerter = String(text).split(/(\s+|[.,;:!?»«„“"'()\-–—]+)/);
  for (const w of woerter) {
    if (!w) continue;
    if (/^[\s.,;:!?»«„“"'()\-–—]+$/.test(w)) { stuecke.push({ typ: 'zeichen', text: w }); continue; }
    for (const s of silben(w)) stuecke.push({ typ: 'silbe', text: s });
    stuecke.push({ typ: 'wortende', text: '' });
  }
  return stuecke;
}

export const silbenZahl = text =>
  String(text).split(/\s+/).filter(Boolean).reduce((n, w) =>
    n + silben(w.replace(/[^\p{L}]/gu, '')).length, 0);

export const wortZahl = text =>
  String(text).split(/\s+/).filter(w => /\p{L}/u.test(w)).length;

/* --------------------------------------------------------------------------
   Woerter zum Ueben, nach Etappen geordnet.

   Ausgewaehlt nach zwei Regeln: Sie muessen im Kinderalltag vorkommen, und
   die Silbentrennung muss eindeutig sein - Zweifelsfaelle gehoeren nicht in
   eine Uebung, bei der das Kind eine Zahl nennen soll.
   -------------------------------------------------------------------------- */
export const UEBWOERTER = {
  1: ['Nase','Blume','Hase','Vogel','Sonne','Katze','Baum','Haus','Hund','Ball',
      'Kinder','Wolke','Garten','Regen','Wagen','Fenster','Mutter','Bruder',
      'Apfel','Banane','Tomate','Melone','Schule','Tafel','Stuhl','Tisch'],
  2: ['Schmetterling','Sonnenblume','Regenbogen','Taschenlampe','Kinderzimmer',
      'Marienkäfer','Erdbeere','Kartoffel','Schokolade','Krokodil','Elefant',
      'Giraffe','Feuerwehr','Bilderbuch','Apfelbaum','Klassenzimmer','Frühling',
      'Schwester','Geschichte','Fahrrad','Turnhalle','Winterjacke'],
  3: ['Verabredung','Überraschung','Freundschaft','Zusammenhang','Aufmerksamkeit',
      'Beobachtung','Entscheidung','Werkzeugkasten','Naturkatastrophe',
      'Jahreszeiten','Mannschaftssport','Gerechtigkeit','Verantwortung'],
  4: ['Wahrscheinlichkeit','Voraussetzung','Beobachtungsgabe','Widerspruch',
      'Gegenargument','Schlussfolgerung','Zusammenfassung','Selbstverständlich',
      'Wissenschaftler','Untersuchung','Behauptung','Begründung'],
  5: ['Unmündigkeit','Selbstverschuldet','Entschlossenheit','Gelassenheit',
      'Widerstandsfähigkeit','Verhältnismäßigkeit','Nachvollziehbarkeit',
      'Voraussetzungslos','Erkenntnistheorie','Wahrnehmungstäuschung']
};

/* Alle Uebungswoerter bis zu einer Etappe - so bleiben leichtere Woerter
   auch spaeter dabei und die Aufgaben werden nicht ploetzlich alle schwer. */
export const uebwoerterBis = etappe => {
  const bis = Math.max(1, Math.min(5, etappe || 1));
  const raus = [];
  for (let e = Math.max(1, bis - 1); e <= bis; e++) raus.push(...(UEBWOERTER[e] || []));
  return raus;
};
