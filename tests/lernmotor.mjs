/* Prueft den Lernmotor (js/lernmotor.js): Leitner-Uebergaenge und Intervalle
   mit einer festen Uhr, die Obergrenze der Kaesten, die Lernzonen-Regel, das
   Zaehlen der Tagesminuten, das Freischalten des Sammelalbums (deterministisch,
   keine Zufallsbelohnung), die Migration alter Profile und die Umzugs-Code-
   Rundreise mit den neuen Feldern. */
import * as L from '../js/lernmotor.js';

let fehler = 0;
const pruefe = (bedingung, text) => {
  console.log(`${bedingung ? '✅' : '❌'} ${text}`);
  if (!bedingung) fehler++;
};

const TAG = 86400000;
const T0 = new Date('2026-01-01T00:00:00Z').getTime();

/* --- 1. Leitner-Kaesten: Uebergaenge und Intervalle mit fester Uhr --- */
{
  const kaesten = {};
  L.kastenVerbuchen(kaesten, 'wort:Haus', true, T0);
  pruefe(kaesten['wort:Haus'].kasten === 1, 'erstmalig richtig -> Kasten 1 (Start bei 0)');

  L.kastenVerbuchen(kaesten, 'wort:Haus', true, T0);
  pruefe(kaesten['wort:Haus'].kasten === 2, 'wieder richtig -> Kasten 2');
  pruefe(kaesten['wort:Haus'].faelligAm === T0 + 1 * TAG, 'Kasten 2 wird nach 1 Tag wieder faellig');

  L.kastenVerbuchen(kaesten, 'wort:Haus', true, T0);
  L.kastenVerbuchen(kaesten, 'wort:Haus', true, T0);
  pruefe(kaesten['wort:Haus'].kasten === 4, 'vier Treffer in Folge -> Kasten 4');
  pruefe(kaesten['wort:Haus'].faelligAm === T0 + 7 * TAG, 'Kasten 4 wird nach 7 Tagen wieder faellig');

  L.kastenVerbuchen(kaesten, 'wort:Haus', false, T0);
  pruefe(kaesten['wort:Haus'].kasten === 1, 'ein Fehler wirft zurueck auf Kasten 1');
  pruefe(kaesten['wort:Haus'].faelligAm === T0, 'Kasten 1 ist sofort wieder faellig');

  for (let i = 0; i < 10; i++) L.kastenVerbuchen(kaesten, 'wort:Haus', true, T0);
  pruefe(kaesten['wort:Haus'].kasten === L.KASTEN_MAX, `Kasten steigt nie ueber ${L.KASTEN_MAX}`);
}

/* --- 2. Faelligkeit --- */
{
  const kaesten = {};
  L.kastenVerbuchen(kaesten, 'a', true, T0);   // Kasten 1, faellig sofort
  L.kastenVerbuchen(kaesten, 'b', true, T0);
  L.kastenVerbuchen(kaesten, 'b', true, T0);   // Kasten 2, faellig T0+1 Tag
  pruefe(L.faelligeSchluessel(kaesten, T0).includes('a') && !L.faelligeSchluessel(kaesten, T0).includes('b'),
    'nur wirklich faellige Elemente erscheinen (Kasten 2 erst am naechsten Tag)');
  pruefe(L.faelligeSchluessel(kaesten, T0 + TAG).includes('b'),
    'einen Tag spaeter ist auch Kasten 2 faellig');
  pruefe(L.faelligeSchluessel(kaesten, T0)[0] === 'a',
    'am wenigsten Gekonntes (niedrigster Kasten) kommt zuerst');
}

/* --- 3. Obergrenze: aeltestes Gemeistertes fliegt zuerst raus --- */
{
  const kaesten = {};
  for (let i = 0; i < L.KAESTEN_OBERGRENZE; i++) {
    kaesten['alt' + i] = { kasten: 5, faelligAm: T0, zuletzt: T0 - 1000 };
  }
  kaesten['neu-ungelernt'] = { kasten: 1, faelligAm: T0, zuletzt: T0 };
  L.kastenVerbuchen(kaesten, 'wirklich-neu', true, T0 + 1);
  pruefe(Object.keys(kaesten).length <= L.KAESTEN_OBERGRENZE,
    `Obergrenze von ${L.KAESTEN_OBERGRENZE} Elementen wird eingehalten`);
  pruefe(!!kaesten['neu-ungelernt'], 'ungelerntes Element (Kasten 1) bleibt erhalten');
  pruefe(!!kaesten['wirklich-neu'], 'das gerade neu verbuchte Element bleibt erhalten');
}

/* --- 4. Lernzonen-Regel --- */
{
  pruefe(L.lernzonenSchritt([true, false]) === 0, 'zu wenig Daten -> kein Schritt');
  const fastImmerRichtig = Array(10).fill(true);
  pruefe(L.lernzonenSchritt(fastImmerRichtig) === 1, 'ueber 90 % richtig -> Level hoch');
  const fastImmerFalsch = [true, false, false, false, false, false, false, false, false, false];
  pruefe(L.lernzonenSchritt(fastImmerFalsch) === -1, 'unter 65 % richtig -> Level runter');
  const lernzone = [true, true, true, false, true, true, false, true, true, true]; // 8/10 = 80 %
  pruefe(L.lernzonenSchritt(lernzone) === 0, '~80 % richtig (Lernzone) -> Level bleibt');

  let fenster = [];
  for (let i = 0; i < 12; i++) fenster = L.fensterAktualisieren(fenster, true);
  pruefe(fenster.length === L.FENSTER_LAENGE, `Fenster waechst nicht ueber ${L.FENSTER_LAENGE} hinaus`);
}

/* --- 5. Tagesminuten --- */
{
  const tagesminuten = {};
  L.minutenHinzufuegen(tagesminuten, 90000, T0);      // 1,5 Minuten
  L.minutenHinzufuegen(tagesminuten, 30000, T0);       // + 0,5 Minuten
  pruefe(L.minutenAn(tagesminuten, T0) === 2, `1,5 + 0,5 Minuten ergeben 2 (war: ${L.minutenAn(tagesminuten, T0)})`);
  pruefe(!L.tageszielErreicht(tagesminuten, 10, T0), 'Tagesziel von 10 Minuten noch nicht erreicht');
  for (let i = 0; i < 3; i++) L.minutenHinzufuegen(tagesminuten, 3 * 60000, T0);   // 3x3 Minuten (unter dem Deckel je Aufgabe)
  pruefe(L.tageszielErreicht(tagesminuten, 10, T0), 'Tagesziel nach genug Minuten erreicht');

  const verlauf = L.minutenVerlauf(tagesminuten, T0, 7);
  pruefe(verlauf.length === 7, 'Verlauf liefert genau 7 Tage');
  pruefe(verlauf.at(-1).tag === new Date(T0).toISOString().slice(0, 10), 'letzter Verlaufstag ist "heute"');
  pruefe(verlauf[0].minuten === 0, 'Tage ohne Uebung erscheinen mit 0 Minuten, nicht als Luecke');
}

/* --- 5b. Deckel je Aufgabe: eine liegen gelassene Aufgabe darf das Tagesziel
   nicht im Alleingang "erreichen" (Chef-Review: 40 Minuten auf einer Aufgabe
   liegen gelassen zählten vorher voll als Lesezeit). --- */
{
  const tagesminuten = {};
  L.minutenHinzufuegen(tagesminuten, 40 * 60000, T0);       // 40 Minuten "liegen gelassen"
  pruefe(L.minutenAn(tagesminuten, T0) === L.MAX_MS_JE_AUFGABE / 60000,
    `eine einzelne Aufgabe zählt höchstens ${L.MAX_MS_JE_AUFGABE / 60000} Minuten (war: ${L.minutenAn(tagesminuten, T0)})`);
  pruefe(!L.tageszielErreicht(tagesminuten, 10, T0),
    'eine einzelne liegen gelassene Aufgabe erreicht das Tagesziel nicht im Alleingang');
}

/* --- 5c. Kurze Aufgaben dürfen sich nicht wegrunden: intern wird in Sekunden
   gerechnet, gerundet wird erst für die Anzeige (Chef-Review: vorher rundete
   jede Addition einzeln auf 0,1 Minuten, Aufgaben unter 3 Sekunden gingen
   dadurch komplett verloren). --- */
{
  const tagesminuten = {};
  for (let i = 0; i < 30; i++) L.minutenHinzufuegen(tagesminuten, 2500, T0);   // 30 × 2,5 s = 75 s
  pruefe(L.minutenAn(tagesminuten, T0) === 1.3,
    `30 kurze Aufgaben (2,5 s) summieren sich auf 1,3 Minuten statt zu verschwinden (war: ${L.minutenAn(tagesminuten, T0)})`);
}

/* --- 5d. Alte Tage werden aufgeräumt, statt tagesminuten unbegrenzt wachsen
   zu lassen. --- */
{
  const tagesminuten = {};
  L.minutenHinzufuegen(tagesminuten, 60000, T0 - 90 * TAG);   // 90 Tage alt
  L.minutenHinzufuegen(tagesminuten, 60000, T0 - 10 * TAG);   // 10 Tage alt - bleibt
  L.minutenHinzufuegen(tagesminuten, 60000, T0);
  const tage = Object.keys(tagesminuten);
  pruefe(tage.length === 2, `Einträge älter als 60 Tage werden entfernt (übrig: ${tage.join(', ')})`);
  pruefe(!tage.includes(new Date(T0 - 90 * TAG).toISOString().slice(0, 10)), 'der 90 Tage alte Eintrag ist weg');
}

/* --- 6. Album: deterministisch, feste Reihenfolge, keine Lootbox --- */
{
  const album = { eintraege: [] };
  pruefe(L.naechsterSticker(album) === L.ALBUM_STICKER[0], 'erster freier Sticker ist immer der erste der Liste');
  const e1 = L.stickerFreischalten(album, 'tagesziel', T0);
  pruefe(e1.sticker === L.ALBUM_STICKER[0], 'freigeschalteter Sticker ist der erste, nicht zufaellig');
  const e2 = L.stickerFreischalten(album, 'tagesziel', T0 + TAG);
  pruefe(e2.sticker === L.ALBUM_STICKER[1], 'zweiter Sticker ist der zweite der festen Reihe');
  pruefe(new Set(L.ALBUM_STICKER).size === L.ALBUM_STICKER.length, 'keine doppelten Sticker in der Liste');
  pruefe(L.ALBUM_STICKER.length >= 40, `mindestens 40 Sticker (${L.ALBUM_STICKER.length})`);

  const volles = { eintraege: L.ALBUM_STICKER.map(s => ({ sticker: s })) };
  pruefe(L.stickerFreischalten(volles, 'tagesziel') === null, 'volles Album gibt keinen Fehler, nur null');

  /* Meilenstein darf nur einmal einen Sticker geben, auch wenn die
     Bedingung danach dauerhaft weiter erfuellt ist. */
  const album2 = { eintraege: [] };
  const m1 = L.meilensteinFreischalten(album2, 'kasten5', T0);
  const m2 = L.meilensteinFreischalten(album2, 'kasten5', T0 + TAG);
  pruefe(!!m1 && m2 === null, 'Meilenstein "kasten5" gibt nur einmal einen Sticker');
}

/* --- 7. Lese-Serie --- */
{
  let serie = { letzterTag: null, serie: 0 };
  serie = L.leseSerieAktualisieren(serie, T0);
  pruefe(serie.serie === 1, 'erster Lesetag startet die Serie bei 1');
  serie = L.leseSerieAktualisieren(serie, T0 + TAG);
  pruefe(serie.serie === 2, 'Folgetag zaehlt die Serie hoch');
  serie = L.leseSerieAktualisieren(serie, T0 + TAG);   // derselbe Tag nochmal
  pruefe(serie.serie === 2, 'zweimal am selben Tag zaehlt nicht doppelt');
  serie = L.leseSerieAktualisieren(serie, T0 + 5 * TAG);   // Luecke
  pruefe(serie.serie === 1, 'eine Luecke setzt die Serie zurueck auf 1');
}

/* --- 8. Migration alter Profile --- */
{
  const altesProfil = {};
  L.migriereLernZustand(altesProfil);
  pruefe(typeof altesProfil.kaesten === 'object', 'kaesten wird ergaenzt');
  pruefe(altesProfil.tagesziel === L.TAGESZIEL_STANDARD, `Tagesziel-Standard ist ${L.TAGESZIEL_STANDARD} Minuten`);
  pruefe(Array.isArray(altesProfil.album.eintraege), 'Album wird ergaenzt');
  pruefe(altesProfil.leseSerie.serie === 0, 'Lese-Serie startet bei 0');

  /* Additiv: bestehende Werte bleiben unangetastet. */
  const schonDa = { tagesziel: 15, kaesten: { x: { kasten: 3, faelligAm: 1, zuletzt: 1 } } };
  L.migriereLernZustand(schonDa);
  pruefe(schonDa.tagesziel === 15, 'vorhandenes Tagesziel bleibt erhalten');
  pruefe(schonDa.kaesten.x.kasten === 3, 'vorhandene Kaesten bleiben erhalten');
}

/* --- 9. Level-Kaskade (Chef-Review): höchstens EIN Levelschritt je Antwort,
   egal ob durch die schnelle "4 in Folge"-Regel oder die Lernzonen-Regel -
   und nach jeder Leveländerung wird das Fenster geleert, damit die
   Lernzonen-Regel erst wieder nach FENSTER_MINDESTENS frischen Antworten
   greifen kann (sonst hob ein einmal volles "> 90 %"-Fenster das Level bei
   JEDER weiteren richtigen Antwort erneut an). Geprüft über js/store.js,
   weil die Kaskade dort zusammenläuft, nicht in der reinen Funktion. --- */
{
  const speicher9 = new Map();
  globalThis.localStorage = {
    getItem: k => speicher9.get(k) ?? null,
    setItem: (k, v) => speicher9.set(k, v),
    removeItem: k => speicher9.delete(k)
  };
  const S9 = await import('../js/store.js');
  S9.laden();
  const kind9 = S9.neuesProfil({ name: 'Kaskade', avatar: '🦊', klasse: 3 });

  // 20 richtige Antworten in Folge: das Level darf nie um mehr als 1 je
  // Antwort springen, und es muss überhaupt vorwärtsgehen.
  let vorLevel = S9.zielStand(kind9, 'einmaleins').level;
  let maxSprungHoch = 0;
  for (let i = 0; i < 20; i++) {
    S9.verbuche(kind9, { zielId: 'einmaleins', weg: 'rhythmus', level: vorLevel, richtig: true, ms: 500 });
    const nachLevel = S9.zielStand(kind9, 'einmaleins').level;
    maxSprungHoch = Math.max(maxSprungHoch, nachLevel - vorLevel);
    vorLevel = nachLevel;
  }
  pruefe(maxSprungHoch <= 1, `bei 20 richtigen Antworten in Folge springt das Level nie um mehr als 1 je Antwort (größter Sprung: ${maxSprungHoch})`);
  pruefe(vorLevel > 1, 'nach 20 richtigen Antworten in Folge ist das Level gestiegen');

  // Analog nach unten, mit derselben Prüfung.
  const kind9b = S9.neuesProfil({ name: 'Kaskade-runter', avatar: '🦊', klasse: 3 });
  const zRunter = S9.zielStand(kind9b, 'einmaleins');
  zRunter.level = 5;
  let vorLevelRunter = zRunter.level;
  let maxSprungRunter = 0;
  for (let i = 0; i < 20; i++) {
    S9.verbuche(kind9b, { zielId: 'einmaleins', weg: 'rhythmus', level: vorLevelRunter, richtig: false, ms: 500 });
    const nachLevel = S9.zielStand(kind9b, 'einmaleins').level;
    maxSprungRunter = Math.max(maxSprungRunter, vorLevelRunter - nachLevel);
    vorLevelRunter = nachLevel;
  }
  pruefe(maxSprungRunter <= 1, `bei 20 falschen Antworten in Folge sinkt das Level nie um mehr als 1 je Antwort (größter Sprung: ${maxSprungRunter})`);
  pruefe(vorLevelRunter < 5, 'nach 20 falschen Antworten in Folge ist das Level gesunken');

  // Reine Lernzonen-Schritte isoliert (die schnelle "4 in Folge"-Regel wird
  // durch Zurücksetzen der Serie vor jeder Antwort ausgeschaltet): zwischen
  // zwei Lernzonen-bedingten Levelschritten müssen mindestens
  // FENSTER_MINDESTENS Antworten liegen.
  const kind9c = S9.neuesProfil({ name: 'Lernzone-isoliert', avatar: '🦊', klasse: 3 });
  const zZone = S9.zielStand(kind9c, 'plusminus');
  let vorLevelZone = zZone.level;
  let letzterSprungIndex = null, minAbstand = Infinity, sprungAnzahl = 0;
  for (let i = 0; i < 40; i++) {
    zZone.serie = 0;   // "4 in Folge" bewusst ausgeschaltet - nur die Lernzonen-Regel soll wirken
    S9.verbuche(kind9c, { zielId: 'plusminus', weg: 'knobeln', level: vorLevelZone, richtig: true, ms: 500 });
    const nachLevel = S9.zielStand(kind9c, 'plusminus').level;
    if (nachLevel !== vorLevelZone) {
      sprungAnzahl++;
      if (letzterSprungIndex !== null) minAbstand = Math.min(minAbstand, i - letzterSprungIndex);
      letzterSprungIndex = i;
    }
    vorLevelZone = nachLevel;
  }
  pruefe(sprungAnzahl >= 1, 'die Lernzonen-Regel allein hebt das Level bei durchgehend richtigen Antworten irgendwann an');
  pruefe(minAbstand === Infinity || minAbstand >= L.FENSTER_MINDESTENS,
    `zwischen zwei Lernzonen-Schritten liegen mindestens ${L.FENSTER_MINDESTENS} Antworten (kleinster Abstand: ${minAbstand})`);
}

/* --- 10. Umzugs-Code-Rundreise mit den neuen Feldern (ueber js/store.js) --- */
{
  const speicher = new Map();
  globalThis.localStorage = {
    getItem: k => speicher.get(k) ?? null,
    setItem: (k, v) => speicher.set(k, v),
    removeItem: k => speicher.delete(k)
  };
  const S = await import('../js/store.js');
  S.laden();
  const kind = S.neuesProfil({ name: 'Umzugskind', avatar: '🦊', klasse: 3 });
  S.tagesZielSetzen(kind, 15);
  S.verbuche(kind, { zielId: 'lesespiele', weg: 'erzaehlen', level: 1, richtig: true, ms: 1000, element: 'wort:Haus' });
  S.verbuche(kind, { zielId: 'lautlesen', weg: 'erzaehlen', level: 1, richtig: true, ms: 11 * 60000 });
  const vorher = { tagesziel: kind.tagesziel, kaesten: JSON.stringify(kind.kaesten), album: JSON.stringify(kind.album) };
  const code = S.alsCode();

  speicher.clear();
  S.laden();
  S.ausCode(code);
  const zurueck = S.alleProfile().find(p => p.name === 'Umzugskind');
  pruefe(!!zurueck, 'Profil kommt nach dem Umzugs-Code zurueck');
  pruefe(zurueck.tagesziel === vorher.tagesziel, 'Tagesziel uebersteht den Umzugs-Code');
  pruefe(JSON.stringify(zurueck.kaesten) === vorher.kaesten, 'Leitner-Kaesten ueberstehen den Umzugs-Code');
  pruefe(JSON.stringify(zurueck.album) === vorher.album, 'Sammelalbum uebersteht den Umzugs-Code');
}

console.log(fehler === 0 ? '\nLernmotor funktioniert ✅' : `\n${fehler} Problem(e) ❌`);
process.exit(fehler === 0 ? 0 : 1);
