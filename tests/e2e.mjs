/* Durchklick-Test: Profil anlegen -> Talent-Test -> Mission -> alle Tabs -> Neustart.
   Start: python3 -m http.server 8765 &  dann  node tests/e2e.mjs ./screens */
import { chromium } from 'playwright';
const b = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
const p = await b.newPage({ viewport:{width:390,height:844}, deviceScaleFactor:2 });
const fehler = [];
p.on('pageerror', e => fehler.push('pageerror: '+e.message));
p.on('console', m => { if (m.type()==='error') fehler.push('console: '+m.text()); });
/* EIN dauerhafter Dialog-Handler statt vieler p.once(): Zwei once()-Handler
   koennen sich ueberschneiden, wenn ein fruehes Freies-Blatt-Bild seinen
   Namens-Dialog aus irgendeinem Grund erst spaeter feuert - dann greifen
   zwei Handler nach demselben Dialog und Playwright wirft "already handled".
   Ein einzelner dauerhafter Handler kann das nicht. */
p.on('dialog', d => d.accept(d.type() === 'prompt' ? 'Testbild' : undefined).catch(() => {}));
const S = process.argv[2] || '.';

/* Löst die gerade gezeigte Aufgabe – egal welcher Art.
   Zeichenaufgaben werden mit der Maus nachgefahren wie mit dem Finger. */
async function loeseAufgabe(p) {
  if (await p.$('#brett')) {
    const hinweis = await p.textContent('#brettHinweis').catch(() => '');
    if (/Einprägen/.test(hinweis || '')) await p.waitForTimeout(5600);
    const k = await p.$eval('#brett', el => {
      const r = el.getBoundingClientRect(); return { x:r.x, y:r.y, w:r.width, h:r.height };
    });
    const linien = await p.evaluate(() => window.__vorlage);
    if (linien && linien.length) {
      for (const l of linien) {
        await p.mouse.move(k.x + l[0].x*k.w, k.y + l[0].y*k.h);
        await p.mouse.down();
        for (const q of l) await p.mouse.move(k.x + q.x*k.w, k.y + q.y*k.h);
        await p.mouse.up();
      }
    } else {                                   // freies Blatt - der Dialog-Handler oben fängt den Namen ab
      await p.mouse.move(k.x + k.w*.3, k.y + k.h*.3);
      await p.mouse.down();
      for (let i=0;i<20;i++) await p.mouse.move(k.x + k.w*(.3+i*.02), k.y + k.h*(.3+Math.sin(i/3)*.1));
      await p.mouse.up();
    }
    await p.click('#brettFertig');
    /* Beim Modus "Mensch zeichnen" folgt der Merkmalsbogen. */
    if (await p.$('#merkmaleFertig')) {
      const kaesten = await p.$$('[data-m]');
      for (let i = 0; i < Math.min(6, kaesten.length); i++) await kaesten[i].click();
      await p.click('#merkmaleFertig');
    }
    return;
  }
  if (await p.$('#leseStart')) {
    /* Lesepult: Im Test gibt es kein Mikrofon. Geprueft wird, dass die
       Silbenfaerbung steht und der Weg ohne Mikrofon sauber weitergeht. */
    const silben = await p.$$eval('#leseText .sil', els => els.length);
    if (silben < 10) throw new Error(`Lesetext kaum in Silben zerlegt: ${silben} Silben`);
    const gefaerbt = await p.$$eval('#leseText .sil.s1', els => els.length);
    if (gefaerbt < 3) throw new Error(`Silbenfärbung fehlt: nur ${gefaerbt} eingefärbte Silben`);
    await p.click('#leseOhne');
    return;
  }
  if (await p.$('.teil[data-e]')) { let n=0; while (await p.$('.teil[data-e]') && n++<12) await p.click('.teil[data-e]'); return; }
  if (await p.$('#eingabe')) {
    if (await p.$('#zahlfeld')) {                 // eigenes Tastenfeld statt Systemtastatur
      await p.click('[data-k="4"]'); await p.click('[data-k="2"]');
    } else {
      await p.fill('#eingabe', '42');
    }
    await p.click('#pruefen');
    return;
  }
  await p.click('.choice');
}
/* Der Hinweisstreifen "Neue Fassung bereit" liegt über dem unteren Rand und
   fängt dort Tipper ab. Im Test taucht er auf, weil der Service Worker beim
   ersten Lauf neu ist – also wegräumen, bevor geklickt wird. */
async function bannerWeg(p) {
  const weg = await p.$('.update-weg');
  if (weg) await weg.click().catch(() => {});
}
const BASIS = process.env.BASIS || 'http://localhost:8765';

await p.goto(`${BASIS}/index.html`);
await p.waitForSelector('#nName');
await p.fill('#nName','Mia');
await p.selectOption('#nEtappe','1');
await p.click('[data-av="🦄"]');
await p.click('#nAnlegen');
// Talent-Test: fünf Teile durchspielen
await p.waitForSelector('#testStart');
await p.screenshot({path:S+'/1-test-start.png', fullPage:true});
await p.click('#testStart');

/* Gemeldeter Fehler: Der Zurueck-Knopf gab es nur im ersten Testteil. Also
   wird ab jetzt bei JEDER Frage geprueft, ob er da ist - ausser bei der
   allerersten, wo es nichts gibt, wohin man zurueck koennte. */
const zurueckFehlt = [];
let frageNr = 0;

const teilDurchspielen = async (teilNr) => {
  for (let n = 0; n < 60; n++) {
    if (await p.$('#weiterTeil')) return 'pause';
    if (await p.$('#losgehts')) return 'fertig';
    frageNr++;
    if (frageNr > 1 && !(await p.$('#zurueck'))) zurueckFehlt.push('Teil ' + teilNr);
    if (await p.$('.scale [data-v]')) { await p.click(`.scale [data-v="${[4,3,2,1][n%4]}"]`); continue; }
    if (await p.$('.choice')) { await p.click('.choice'); continue; }
    return 'unbekannt';
  }
  return 'zu-lang';
};

let zustand = await teilDurchspielen(1);
let teile = 1;
while (zustand === 'pause') {
  if (teile === 1) await p.screenshot({path:S+'/2-teil-pause.png', fullPage:true});
  await p.click('#weiterTeil');
  teile++;
  zustand = await teilDurchspielen(teile);
}
if (zustand !== 'fertig') throw new Error('Talent-Test endete unerwartet: ' + zustand);
console.log('Testteile durchgespielt:', teile);
if (zurueckFehlt.length)
  throw new Error('Zurück-Knopf fehlt in Testteil(en): ' + [...new Set(zurueckFehlt)].join(', '));
console.log('Zurück-Knopf in jedem Testteil vorhanden ✅');
await p.waitForSelector('#losgehts');
await p.screenshot({path:S+'/3-radar.png', fullPage:true});
await p.click('#losgehts');
await p.waitForSelector('#mission');
await p.screenshot({path:S+'/4-home.png', fullPage:true});

// Mission spielen, bis das Ergebnis erscheint.
// (Denk-Impulse verkürzen die Runde, deshalb keine feste Zahl.)
await p.click('#mission');
for (let i=0;i<12;i++){
  if (await p.$('#nochmal')) break;                 // Runde ist zu Ende
  await p.waitForSelector('.task');
  const frage = await p.textContent('.task');
  await loeseAufgabe(p);
  await p.waitForSelector('#weiter');
  if (i===0) await p.screenshot({path:S+'/5-aufgabe.png', fullPage:true});
  await p.click('#weiter');
}
await p.waitForSelector('#nochmal');
await p.screenshot({path:S+'/6-ergebnis.png', fullPage:true});
await p.click('#heim');

// Neue Bereiche: Puzzle/Bilderrätsel und Hörgeschichten gezielt prüfen
for (const [ziel, name] of [['puzzle','puzzle'],['bildraetsel','bildraetsel'],['zuhoeren','hoergeschichte'],
                            ['knacknuss','knacknuss'],['kopfrechnen','kopfrechnen'],['kanon','kanon'],
                            ['lebenskunst','lebenskunst']]) {
  await p.click(`[data-ziel="${ziel}"]`);
  await p.waitForSelector('.task');
  if (ziel === 'zuhoeren') {
    if (!await p.$('#playHoer')) throw new Error('Hörgeschichte ohne Abspiel-Knopf');
    await p.click('#zeigeText');
    if (await p.$eval('#hoertext', el => el.hidden)) throw new Error('Text lässt sich nicht einblenden');
  }
  if (ziel === 'knacknuss') {                        // Tippleiter prüfen
    if (!await p.$('#tippHolen')) throw new Error('Knacknuss ohne Tipp-Knopf');
    await p.click('#tippHolen');
    if (!await p.$('.tipp')) throw new Error('Tipp wird nicht angezeigt');
  }
  await p.screenshot({path:`${S}/x-${name}.png`, fullPage:true});
  await loeseAufgabe(p);
  await p.waitForSelector('#weiter');
  if (ziel === 'knacknuss' && !await p.$('.quelle')) throw new Error('Herkunftsangabe fehlt');
  await p.click('#raus');
  await p.waitForSelector('#mission');
}

// Zeichnen: Vorlage mit dem "Finger" nachfahren und bewerten lassen
{
  await p.click('[data-ziel="zeichnen"]');
  await p.waitForSelector('#brett');
  /* Nicht jede Zeichenaufgabe hat eine Vorlage - "Mensch zeichnen" hat keine.
     Also so lange weiterspielen, bis eine Aufgabe mit Vorlage kommt. */
  let linien = await p.evaluate(() => window.__vorlage || null);
  for (let versuch = 0; !linien && versuch < 6; versuch++) {
    await loeseAufgabe(p);
    await p.waitForSelector('#weiter');
    await p.click('#weiter');
    if (await p.$('#nochmal')) { await p.click('#heim'); await p.click('[data-ziel="zeichnen"]'); }
    await p.waitForSelector('#brett');
    linien = await p.evaluate(() => window.__vorlage || null);
  }
  if (!linien) throw new Error('Keine Zeichenaufgabe mit Vorlage gefunden');
  const kasten = await p.$eval('#brett', el => {
    const r = el.getBoundingClientRect(); return { x:r.x, y:r.y, w:r.width, h:r.height };
  });
  for (const linie of linien) {
    await p.mouse.move(kasten.x + linie[0].x * kasten.w, kasten.y + linie[0].y * kasten.h);
    await p.mouse.down();
    for (const punkt of linie) {
      await p.mouse.move(kasten.x + punkt.x * kasten.w, kasten.y + punkt.y * kasten.h);
    }
    await p.mouse.up();
  }
  await p.screenshot({path:S+'/m-zeichnen.png', fullPage:true});
  await p.click('#brettFertig');
  await p.waitForSelector('.feedback');
  const rueck = await p.textContent('.feedback');
  if (!/Getroffen/.test(rueck)) throw new Error('Genaues Nachfahren wurde nicht anerkannt: ' + rueck.slice(0,120));
  console.log('Nachgefahrene Vorlage anerkannt:', rueck.trim().split('\n')[0].slice(0, 60));
  await p.screenshot({path:S+'/m-zeichnen-ergebnis.png', fullPage:true});
  await p.click('#raus');
  await p.waitForSelector('#mission');
}

// Begleiter (Avatar) muss sichtbar sein und reagieren
{
  if (!await p.$('.begleiter .figur')) throw new Error('Begleiter fehlt');
  await p.click('.begleiter .figur');
  await p.waitForSelector('.begleiter .blase:not([hidden])', { timeout: 3000 });
  console.log('Begleiter reagiert auf Antippen ✅');
}

// Denk-Impulse: müssen erscheinen und dürfen die Quote nicht verändern
{
  let impulsGesehen = false, versuche = 0;
  const quoteVorher = await p.evaluate(() => {
    const d = JSON.parse(localStorage.getItem('kidzootopia.v1')).profile[0];
    return d.ziele?.lebenskunst ? {r:d.ziele.lebenskunst.richtig, g:d.ziele.lebenskunst.gesamt} : {r:0,g:0};
  });
  let impulsQuote = null;
  while (!impulsGesehen && versuche++ < 25) {
    await p.click('[data-ziel="lebenskunst"]');
    await p.waitForSelector('.task');
    if (await p.$('.choice.denk')) {
      impulsGesehen = true;
      await p.click('.choice.denk');
      await p.waitForSelector('.feedback.denk');
      if (!await p.$('.quelle')) throw new Error('Denk-Impuls ohne Herkunftsangabe');
      impulsQuote = await p.evaluate(() => {
        const d = JSON.parse(localStorage.getItem('kidzootopia.v1')).profile[0];
        return {r:d.ziele.lebenskunst.richtig, g:d.ziele.lebenskunst.gesamt};
      });
    }
    await p.click('#raus');
    await p.waitForSelector('#mission');
  }
  if (!impulsGesehen) throw new Error('In 25 Versuchen kein Denk-Impuls erschienen');
  if (impulsQuote.g !== quoteVorher.g || impulsQuote.r !== quoteVorher.r)
    throw new Error(`Denk-Impuls wurde bewertet: ${JSON.stringify(quoteVorher)} -> ${JSON.stringify(impulsQuote)}`);
  console.log('Denk-Impuls erscheint und bleibt unbewertet ✅');
}

// Knacknuss vom Startbildschirm aus
await p.click('#knacknuss');
await p.waitForSelector('.task');
await p.click('#raus');
await p.waitForSelector('#mission');

// Fach-Runde + Ziel-Runde
// Das Fach "Deutsch" kann inzwischen auch auf "Vorlesen" oder "Silben" fallen -
// beide hat die einfache #eingabe/.choice-Unterscheidung von frueher nicht
// gekannt. loeseAufgabe() kennt alle Aufgabentypen, also die gemeinsame
// Loesung benutzen statt sie hier ein zweites Mal unvollstaendig nachzubauen.
await p.click('[data-fach="deutsch"]');
await p.waitForSelector('.task');
await loeseAufgabe(p);
await p.waitForSelector('#weiter'); await p.click('#raus');
await p.waitForSelector('#mission');
await p.click('[data-ziel="einmaleins"]');
await p.waitForSelector('.task'); await p.click('#raus');

// Tabs
for (const [r,f] of [['talente','7-talente'],['wege','8-wege'],['eltern','9-eltern']]) {
  await p.click(`.nav-btn[data-route="${r}"]`);
  await p.waitForTimeout(180);
  await p.screenshot({path:`${S}/${f}.png`, fullPage:true});
}
// Die laufende Fassung muss im Eltern-Bereich sichtbar sein – und mit version.js übereinstimmen
{
  const { NUMMER } = await import('../js/version.js');
  await p.click('.nav-btn[data-route="eltern"]');
  await p.waitForSelector('#updatePruefen');
  const gezeigt = await p.textContent('.card:has(#updatePruefen)');
  if (!gezeigt.includes(`Version ${NUMMER}`))
    throw new Error(`Eltern-Bereich zeigt nicht Version ${NUMMER}: ${gezeigt.slice(0,120)}`);
  await p.click('#updatePruefen');
  await p.waitForFunction(() => !document.querySelector('#updateStatus').textContent.includes('Suche'),
    null, { timeout: 9000 });
  console.log('Fassung im Eltern-Bereich sichtbar: Version ' + NUMMER + ' ✅');
}

// Erwachsenen-Etappe: höhere Ziele müssen erscheinen und lösbar sein
await p.click('.nav-btn[data-route="eltern"]');
await p.waitForSelector('#etappeWahl');
await p.selectOption('#etappeWahl','5');
await p.waitForSelector('#etappeWahl');
await p.click('.nav-btn[data-route="lernen"]');
await p.waitForSelector('#mission');
for (const ziel of ['analysis','denkfehler','logikformal','hauptwerke','zinsen']) {
  const knopf = await p.$(`[data-ziel="${ziel}"]`);
  if (!knopf) throw new Error(`Ziel ${ziel} fehlt in der Erwachsenen-Etappe`);
  await knopf.click();
  await p.waitForSelector('.task');
  if (ziel === 'analysis') await p.screenshot({path:S+'/z-erwachsen.png', fullPage:true});
  await loeseAufgabe(p);
  await p.waitForSelector('#weiter');
  await p.click('#raus');
  await p.waitForSelector('#mission');
}
console.log('Erwachsenen-Etappe: alle geprüften Ziele vorhanden und lösbar ✅');
// zurück auf Grundschule für den Rest des Tests
await p.click('.nav-btn[data-route="eltern"]');
await p.waitForSelector('#etappeWahl');
await p.selectOption('#etappeWahl','1');
await p.waitForSelector('#etappeWahl');

// Umzugs-Code: Fortschritt sichern, Speicher leeren, wiederherstellen
await p.click('.nav-btn[data-route="eltern"]');
await p.waitForSelector('#codeZeigen');
await p.click('#codeZeigen');
await p.waitForSelector('#codeFeld');
const umzugsCode = await p.$eval('#codeFeld', el => el.value);
const aufgabenVorher = await p.evaluate(() =>
  JSON.parse(localStorage.getItem('kidzootopia.v1')).profile[0].stats.aufgabenGesamt);
await p.screenshot({path:S+'/y-umzug.png', fullPage:true});

await p.evaluate(() => localStorage.removeItem('kidzootopia.v1'));   // "anderer Speicher"
await p.reload();
await p.waitForSelector('#nAnlegen');        // Profil anlegen ist der Hauptweg
await p.click('details.card > summary');     // Umzug ist bewusst nur optional aufklappbar

// Diagnose muss den leeren Speicher ehrlich melden und die Zweitkopie anbieten
await p.click('#diagnose');
await p.waitForSelector('#sicherungHolen');
const bericht = await p.textContent('#holBereich');
if (!/Profile hier:\s*keine/.test(bericht.replace(/\s+/g,' ')))
  throw new Error('Diagnose meldet nicht, dass keine Profile da sind');
if (!/Zweitkopie:\s*vorhanden/.test(bericht.replace(/\s+/g,' ')))
  throw new Error('Diagnose findet die Zweitkopie nicht');
await p.screenshot({path:S+'/w-diagnose.png', fullPage:true});
// Wiederherstellung aus der Zweitkopie prüfen - der dauerhafte Handler oben bestätigt
await p.click('#sicherungHolen');
await p.waitForSelector('#mission', { timeout: 5000 });
const nachSicherung = await p.evaluate(() =>
  JSON.parse(localStorage.getItem('kidzootopia.v1')).profile[0].stats.aufgabenGesamt);
if (nachSicherung !== aufgabenVorher)
  throw new Error(`Zweitkopie stellte nicht her: ${aufgabenVorher} -> ${nachSicherung}`);
console.log('Zweitkopie rettet den Fortschritt:', nachSicherung, 'Aufgaben');

// jetzt den Umzugs-Code prüfen: Haupteintrag UND Zweitkopie löschen
await p.evaluate(() => { localStorage.removeItem('kidzootopia.v1'); localStorage.removeItem('kidzootopia.sicherung'); });
await p.reload();
await p.waitForSelector('#nAnlegen');
await p.click('details.card > summary');
await p.click('#holen');
await p.fill('#holFeld', umzugsCode);
await p.click('#holUebernehmen');
await p.waitForSelector('#mission', { timeout: 5000 });
const aufgabenNachher = await p.evaluate(() =>
  JSON.parse(localStorage.getItem('kidzootopia.v1')).profile[0].stats.aufgabenGesamt);
if (aufgabenNachher !== aufgabenVorher)
  throw new Error(`Umzug verlor Fortschritt: ${aufgabenVorher} -> ${aufgabenNachher}`);
console.log('Umzugs-Code stellt Fortschritt wieder her:', aufgabenNachher, 'Aufgaben');

// Reload -> Fortschritt bleibt?
await p.reload();
await p.waitForSelector('#mission');
const kopf = await p.textContent('#topName');
const sw = await p.evaluate(async () => (await navigator.serviceWorker.getRegistrations()).length);
console.log('Profil nach Reload:', kopf, '| ServiceWorker registriert:', sw);
// Punkte: Kopfzeile zaehlt mit, Zuwachs erscheint, Rundenbilanz steht am Ende.
{
  await bannerWeg(p);
  const vorher = Number((await p.textContent('#punkteZahl')).replace(',', '.').replace('k', '000'));
  await p.click('#mission');
  await p.waitForSelector('.task');
  await loeseAufgabe(p);
  await p.waitForSelector('#weiter');
  const stand = async () =>
    Number((await p.textContent('#punkteZahl')).replace(',', '.').replace('k', '000'));
  let letzter = await stand();
  if (letzter < vorher) throw new Error(`Punktestand sinkt: ${vorher} → ${letzter}`);
  await p.click('#weiter');
  /* Über die ganze Runde: Der Stand darf NIE fallen (falsch gibt null, nie
     Abzug) und muss am Ende gestiegen sein. */
  for (let i = 0; i < 14 && !(await p.$('#nochmal')); i++) {
    await p.waitForSelector('.task'); await loeseAufgabe(p);
    await p.waitForSelector('#weiter');
    const jetzt = await stand();
    if (jetzt < letzter) throw new Error(`Punkte wurden abgezogen: ${letzter} → ${jetzt}`);
    letzter = jetzt;
    await p.click('#weiter');
  }
  /* KEINE Forderung nach einem Zuwachs: loeseAufgabe raet bei Auswahlaufgaben
     nur die erste Option, ohne die Frage zu lesen - bei genug Pech in einer
     Runde ist alles falsch und es gibt ueberall 0 Punkte. Das waere kein
     Fehler im Punktesystem, nur Pech beim Raten. Die eigentliche Garantie
     ("nie weniger als 0 Punkte fuer eine falsche Antwort") ist oben bei jeder
     einzelnen Aufgabe geprueft und ausserdem in tests/punkte.mjs an 660
     Faellen abgesichert - hier zaehlt nur, dass es ueber die ganze Runde
     niemals SINKT. */
  console.log(`Punktestand über die Runde: ${vorher} → ${letzter}, nie gefallen ✅`);
  await p.waitForSelector('#nochmal', { timeout: 8000 });
  const bilanz = await p.textContent('.card');
  if (!/Diese Runde/.test(bilanz)) throw new Error('Keine Punktebilanz am Rundenende');
  console.log('Punktebilanz am Rundenende ✅');
  await p.screenshot({ path: `${S}/13-punkte.png`, fullPage: true });
  await p.click('#heim'); await p.waitForSelector('#mission');
}

// Silbenaufgaben und der gesprochene Kommentar: beides im echten Browser.
{
  await bannerWeg(p);
  await p.click('[data-ziel="silbenwissen"]');
  await p.waitForSelector('.task');
  const frage = await p.textContent('.task');
  if (!/Silbe/i.test(frage)) throw new Error('Silbenaufgabe sieht falsch aus: ' + frage);
  console.log('Silbenaufgabe erscheint ✅');
  await loeseAufgabe(p);
  await p.waitForSelector('#weiter');
  /* Zu jeder bewerteten Antwort muss ein Kommentar erscheinen. */
  const komm = await p.textContent('.kommentar').catch(() => '');
  if (!komm || komm.trim().length < 4)
    throw new Error('Kein Kommentar zur Antwort: "' + komm + '"');
  console.log(`Rückmeldung zur Antwort: „${komm.trim()}" ✅`);
  await p.click('#weiter');
  for (let i = 0; i < 14 && !(await p.$('#nochmal')); i++) {
    await p.waitForSelector('.task'); await loeseAufgabe(p);
    await p.waitForSelector('#weiter'); await p.click('#weiter');
  }
  await p.waitForSelector('#nochmal', { timeout: 8000 });
  await p.click('#heim'); await p.waitForSelector('#mission');
}

// Rückblick am Rundenende: jede Antwort mit Erklärung, wenn eine da ist.
{
  await bannerWeg(p);
  await p.click('[data-ziel="allgemein"]');
  for (let i = 0; i < 14 && !(await p.$('#nochmal')); i++) {
    await p.waitForSelector('.task'); await loeseAufgabe(p);
    await p.waitForSelector('#weiter'); await p.click('#weiter');
  }
  await p.waitForSelector('#nochmal', { timeout: 8000 });
  const rueckblick = await p.$('.rueckblick');
  if (!rueckblick) throw new Error('Rückblick-Karte fehlt am Rundenende');
  await rueckblick.click();     // aufklappen
  const eintraege = await p.$$('.rueckblick-item');
  if (eintraege.length < 1) throw new Error('Rückblick ist leer');
  const text = await p.textContent('.rueckblick');
  if (!/💡/.test(text)) throw new Error('Kein einziger Rückblick-Eintrag hat eine Erklärung: ' + text.slice(0,200));
  console.log(`Rückblick: ${eintraege.length} Antworten aufgelistet, mit Erklärungen ✅`);
  await p.screenshot({ path: `${S}/15-rueckblick.png`, fullPage: true });

  // Renn-Modus: der Kreisel muss das Rennen wirklich antreiben - ohne Drehen
  // passiert nichts, das war genau der gemeldete Fehler ("langweilig, es
  // passiert ja gar nix"). Hier wird der Kreisel wie mit dem Daumen gedreht:
  // per Maus im Kreis, in vielen kleinen Schritten.
  const rennKarte = await p.$('.renn-karte');
  if (!rennKarte) throw new Error('Renn-Karte fehlt am Rundenende');
  const startVorher = await p.getAttribute('#rennIch', 'style');
  if (!/left:\s*0%/.test(startVorher || '')) throw new Error('Avatar startet nicht bei 0%: ' + startVorher);
  const box = await p.$eval('#rennKreisel', el => {
    const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height };
  });
  const cx = box.x + box.w / 2, cy = box.y + box.h / 2, radius = box.w / 2 - 8;
  const fertigGeworden = () => p.$eval('#rennErgebnis', el => el.textContent.trim().length > 0).catch(() => false);
  await p.mouse.move(cx + radius, cy);
  await p.mouse.down();
  /* Zeitbudget statt fester Rundenzahl: der Kreisel hat Reibung, also darf
     die Maus erst losgelassen werden, wenn das Rennen WIRKLICH fertig ist -
     sonst dreht sich nichts mehr weiter und ein Timeout danach wartet ewig. */
  const spielEnde = Date.now() + 45000;
  while (!(await fertigGeworden()) && Date.now() < spielEnde) {
    const schritte = 16;
    for (let i = 1; i <= schritte; i++) {
      const a = (i / schritte) * 2 * Math.PI;
      await p.mouse.move(cx + radius * Math.cos(a), cy + radius * Math.sin(a), { steps: 2 });
    }
  }
  await p.mouse.up();
  if (!(await fertigGeworden()))
    throw new Error('Renn-Modus: der Kreisel hat das Rennen auch nach 45 Sekunden Drehen nicht beendet');
  const rennText = await p.textContent('#rennErgebnis');
  console.log(`Renn-Modus: Kreisel angetrieben, Ergebnis gezeigt: „${rennText.trim()}" ✅`);
  await p.screenshot({ path: `${S}/16-rennen.png`, fullPage: true });
  await p.click('#heim'); await p.waitForSelector('#mission');
}

// Neues Lernziel "Gesund essen": Fragen erscheinen, keine Diätregeln nötig
// zum Funktionieren zu pruefen - nur, dass die Aufgaben normal ablaufen.
{
  await bannerWeg(p);
  await p.click('[data-ziel="ernaehrung"]');
  await p.waitForSelector('.task');
  await loeseAufgabe(p);
  await p.waitForSelector('#weiter');
  console.log('Aufgabe zu „Gesund essen" gelöst ✅');
  await p.click('#weiter');
  for (let i = 0; i < 14 && !(await p.$('#nochmal')); i++) {
    await p.waitForSelector('.task'); await loeseAufgabe(p);
    await p.waitForSelector('#weiter'); await p.click('#weiter');
  }
  await p.waitForSelector('#nochmal', { timeout: 8000 });
  await p.click('#heim'); await p.waitForSelector('#mission');
}

// English Basics: bildbasiert genug, dass ein Kind, das noch nicht liest,
// die Aufgabe trotzdem loesen kann - Bild und Hoer-Knopf muessen wirklich da sein.
{
  await bannerWeg(p);
  await p.click('[data-fach="englisch"]');
  let sahBild = false, sahBildwahl = false, sahHoerKnopf = false;
  for (let i = 0; i < 14 && !(await p.$('#nochmal')); i++) {
    await p.waitForSelector('.task');
    if (await p.$('.aufgabenbild')) sahBild = true;
    if (await p.$('.choices.bildwahl')) sahBildwahl = true;
    if (await p.$('#hoerZweisprachig')) sahHoerKnopf = true;
    await loeseAufgabe(p);
    await p.waitForSelector('#weiter');
    await p.click('#weiter');
  }
  if (!sahBild) throw new Error('English Basics: keine einzige Aufgabe zeigte ein Bild');
  if (!sahBildwahl) throw new Error('English Basics: das Bild-Puzzle (Wort -> passendes Bild) kam nicht vor');
  if (!sahHoerKnopf) throw new Error('English Basics: der zweisprachige Hoer-Knopf kam nicht vor');
  console.log('English Basics: Bild, Bild-Puzzle und zweisprachiger Hoer-Knopf gesehen ✅');
  await p.screenshot({ path: `${S}/18-englisch.png`, fullPage: true });
  await p.waitForSelector('#nochmal', { timeout: 8000 });
  await p.click('#heim'); await p.waitForSelector('#mission');
}

// Strandfunde: Muschel, Hai-Zahn, Sepiaschulp und Co. muessen wirklich als
// Bild zu sehen sein, nicht nur als Name.
{
  await bannerWeg(p);
  await p.click('[data-ziel="strandfunde"]');
  let sahBild = false;
  for (let i = 0; i < 14 && !(await p.$('#nochmal')); i++) {
    await p.waitForSelector('.task');
    if (await p.$('.aufgabenbild')) sahBild = true;
    await loeseAufgabe(p);
    await p.waitForSelector('#weiter');
    await p.click('#weiter');
  }
  if (!sahBild) throw new Error('Strandfunde: keine einzige Aufgabe zeigte ein Bild');
  console.log('Strandfunde: Fund als Bild gesehen ✅');
  await p.screenshot({ path: `${S}/19-strandfunde.png`, fullPage: true });
  await p.waitForSelector('#nochmal', { timeout: 8000 });
  await p.click('#heim'); await p.waitForSelector('#mission');
}

// Knacknuesse: das Schmierblatt muss von Anfang an offen sein, nicht erst
// entdeckt werden - genau hier hilft eine Skizze am meisten.
{
  await bannerWeg(p);
  await p.click('[data-ziel="knacknuss"]');
  await p.waitForSelector('.task');
  const offen = await p.$eval('.schmier', el => el.open).catch(() => false);
  if (!offen) throw new Error('Schmierblatt bei einer Knacknuss ist nicht von vornherein offen');
  console.log('Schmierblatt bei Knacknüssen von Anfang an offen ✅');
  for (let i = 0; i < 14 && !(await p.$('#nochmal')); i++) {
    await p.waitForSelector('.task'); await loeseAufgabe(p);
    await p.waitForSelector('#weiter'); await p.click('#weiter');
  }
  await p.waitForSelector('#nochmal', { timeout: 8000 });
  await p.click('#heim'); await p.waitForSelector('#mission');
}

// Zahlenfeld: Minus und Komma muessen tippbar sein. Genau daran scheiterte
// die Eingabe auf dem iPad - dort gab es beides nicht.
{
  await bannerWeg(p);
  await p.click('[data-ziel="kopfrechnen"]');
  await p.waitForSelector('.task');
  /* Bis eine Aufgabe kommt, die eine Zahl erwartet. */
  for (let i = 0; i < 8 && !(await p.$('#zahlfeld')); i++) {
    await loeseAufgabe(p);
    await p.waitForSelector('#weiter'); await p.click('#weiter');
    if (await p.$('#nochmal')) { await p.click('#heim'); await p.click('[data-ziel="kopfrechnen"]'); }
    await p.waitForSelector('.task');
  }
  if (!await p.$('#zahlfeld')) throw new Error('Keine Aufgabe mit Zahlenfeld gefunden');

  for (const k of ['1','2',',','5']) await p.click(`[data-k="${k}"]`);
  let wert = await p.inputValue('#eingabe');
  if (wert !== '12,5') throw new Error(`Komma lässt sich nicht tippen: "${wert}"`);
  await p.click('[data-k="-"]');
  wert = await p.inputValue('#eingabe');
  if (wert !== '-12,5') throw new Error(`Minus lässt sich nicht tippen: "${wert}"`);
  await p.click('[data-k="-"]');
  if (await p.inputValue('#eingabe') !== '12,5') throw new Error('Minus schaltet nicht zurück');
  await p.click('[data-k="⌫"]');
  if (await p.inputValue('#eingabe') !== '12,') throw new Error('Löschen geht nicht');
  console.log('Zahlenfeld: Minus, Komma und Löschen funktionieren ✅');
  await p.screenshot({ path: `${S}/12-zahlenfeld.png`, fullPage: true });

  /* Die Systemtastatur darf nicht aufgehen - das Feld ist nur lesbar. */
  const nurLesen = await p.$eval('#eingabe', el => el.readOnly);
  if (!nurLesen) throw new Error('Eingabefeld ist nicht readonly – die Systemtastatur geht auf');

  await p.click('#pruefen');
  await p.waitForSelector('#weiter'); await p.click('#weiter');
  for (let i = 0; i < 14 && !(await p.$('#nochmal')); i++) {
    await p.waitForSelector('.task'); await loeseAufgabe(p);
    await p.waitForSelector('#weiter'); await p.click('#weiter');
  }
  await p.waitForSelector('#nochmal', { timeout: 8000 });
  await p.click('#heim'); await p.waitForSelector('#mission');
}

// Schmierblatt: an einer normalen Aufgabe aufklappen, zeichnen, zaehlen, zurueck.
{
  await bannerWeg(p);
  await p.click('[data-ziel="einmaleins"]');
  await p.waitForSelector('.task');
  const blatt = await p.$('.schmier');
  if (!blatt) throw new Error('Schmierblatt fehlt an einer Rechenaufgabe');
  await p.click('.schmier > summary');
  await p.waitForSelector('#schmierBrett', { state: 'visible' });
  /* Die Lage des Blattes JEDES MAL frisch holen: Das Aufklappen und das
     Zahlenfeld verschieben die Seite, eine einmal gemerkte Position wird
     dadurch falsch. */
  const lage = async () => {
    const el = await p.$('#schmierBrett');
    /* Erst ins Bild scrollen: Mit dem Zahlenfeld darueber rutscht das Blatt
       sonst unter den unteren Rand, und die Klicks kommen gar nicht an. */
    await el.scrollIntoViewIfNeeded();
    return el.boundingBox();
  };

  /* Zeichnen: ein Strich quer ueber das Blatt. */
  let k = await lage();
  await p.mouse.move(k.x + k.width*.2, k.y + k.height*.3);
  await p.mouse.down();
  for (let i = 0; i <= 10; i++)
    await p.mouse.move(k.x + k.width*(.2 + i*.05), k.y + k.height*(.3 + i*.03));
  await p.mouse.up();

  /* Zaehlen: vier Punkte setzen. Die Anzeige muss mitzaehlen. */
  await p.click('[data-wz="zaehlen"]');
  k = await lage();
  for (const [dx, dy] of [[.2,.7],[.4,.7],[.6,.7],[.8,.7]])
    await p.mouse.click(k.x + k.width*dx, k.y + k.height*dy);
  let stand = await p.textContent('#zaehlStand');
  if (!/4 Punkte/.test(stand)) throw new Error('Zählwerk zählt falsch: ' + stand);

  /* Nochmal auf denselben Punkt: er verschwindet. */
  /* Bewusst dieselbe gemerkte Lage wie eben: Ein erneutes Ausmessen koennte
     zwischendurch scrollen, dann traefe der Klick eine andere Stelle des
     Blattes und der Punkt wuerde nicht zurueckgenommen, sondern verdoppelt. */
  await p.mouse.click(k.x + k.width*.8, k.y + k.height*.7);
  stand = await p.textContent('#zaehlStand');
  if (!/3 Punkte/.test(stand)) throw new Error('Punkt lässt sich nicht zurücknehmen: ' + stand);

  /* Zurueck nimmt die zuletzt gesetzte Marke, nicht den alten Strich. */
  await p.click('#schmierZurueck');
  stand = await p.textContent('#zaehlStand');
  if (!/2 Punkte/.test(stand)) throw new Error('Zurück nahm das Falsche: ' + stand);
  console.log('Schmierblatt: zeichnen, zählen und zurück funktionieren ✅');
  await p.screenshot({ path: `${S}/11-schmierblatt.png`, fullPage: true });

  /* Sicherheitsfrage: "Leeren" darf die Arbeit nicht ohne Rueckfrage wegwerfen -
     aber bei einem LEEREN Blatt darf es auch nicht nerven. */
  await p.click('#schmierLeeren');
  if (!(await p.$('.nachfrage'))) throw new Error('Leeren fragt nicht nach, obwohl etwas gemalt ist');
  await p.click('[data-nein]');
  if (await p.$('.nachfrage')) throw new Error('Abbrechen schließt die Rückfrage nicht');
  let nochDa = await p.textContent('#zaehlStand');
  if (!/2 Punkte/.test(nochDa)) throw new Error('Abbrechen hat trotzdem gelöscht: ' + nochDa);
  console.log('Rückfrage vor dem Leeren, Abbrechen behält die Skizze ✅');

  await p.click('#schmierLeeren');
  await p.click('[data-ja]');
  const leer = await p.$eval('#zaehlStand', el => el.hidden).catch(() => true);
  if (leer === false) throw new Error('Nach dem Bestätigen ist das Blatt nicht leer');
  /* Jetzt ist es leer - eine zweite Rueckfrage waere nur noch laestig. */
  await p.click('#schmierLeeren');
  if (await p.$('.nachfrage'))
    throw new Error('Ein leeres Blatt zu leeren fragt nach – das nervt und macht die Rückfrage wertlos');
  console.log('Leeres Blatt fragt NICHT nach ✅');

  /* Fuer die naechste Pruefung wieder etwas malen. */
  await p.click('[data-wz="zaehlen"]');
  const k2 = await lage();
  for (const [dx, dy] of [[.3,.5],[.6,.5]]) await p.mouse.click(k2.x + k2.width*dx, k2.y + k2.height*dy);

  /* Nach dem Antworten muss die Skizze stehen bleiben - wer falsch lag, will
     sie neben der Loesung sehen. */
  await loeseAufgabe(p);
  await p.waitForSelector('#weiter');
  const nachher = await p.textContent('#zaehlStand').catch(() => '');
  if (!/2 Punkte/.test(nachher)) throw new Error('Skizze ging beim Antworten verloren: ' + nachher);
  console.log('Skizze bleibt nach der Antwort stehen ✅');
  await p.click('#weiter');

  /* Die naechste Aufgabe muss ein FRISCHES Blatt haben. */
  await p.waitForSelector('.task');
  const frisch = await p.$eval('#zaehlStand', el => el.hidden).catch(() => true);
  if (frisch === false) throw new Error('Das Schmierblatt der vorigen Aufgabe steht noch da');
  console.log('Jede Aufgabe bekommt ein frisches Blatt ✅');
  for (let i = 0; i < 14 && !(await p.$('#nochmal')); i++) {
    await p.waitForSelector('.task');
    await loeseAufgabe(p);
    await p.waitForSelector('#weiter');
    await p.click('#weiter');
  }
  await p.waitForSelector('#nochmal', { timeout: 8000 });
  await p.click('#heim');
  await p.waitForSelector('#mission');
}

// Lautlesen: Silbenfaerbung im Browser und Auswertung im echten Code pruefen.
{
  const knopf = await p.$('[data-ziel="lautlesen"]');
  if (!knopf) throw new Error('Lernziel Vorlesen fehlt in der Mission');
  await knopf.click();
  await p.waitForSelector('#leseStart', { timeout: 6000 });
  const silbenGesamt = await p.$$eval('#leseText .sil', els => els.length);
  const angezeigt = (await p.textContent('#leseText')).replace(/\s+/g, '');
  console.log(`Lesepult: Text in ${silbenGesamt} Silben eingefärbt`);
  /* Der Begleiter muss beim Lesen zur Seite treten - er sass in derselben Ecke
     wie der Text und verdeckte mitten im Satz zwei Woerter. */
  const beiseite = await p.$eval('.begleiter', el => el.classList.contains('beiseite')).catch(() => false);
  if (!beiseite) throw new Error('Begleiter tritt beim Vorlesen nicht zur Seite');
  await p.screenshot({ path: `${S}/10-lesepult.png`, fullPage: true });
  if (silbenGesamt < 20) throw new Error('Lesetext zu wenig zerlegt');
  /* Die Faerbung darf keinen Buchstaben verlieren. */
  const originale = await p.evaluate(async () => {
    const L = await import('./js/lesen.js');
    return L.TEXTE.map(t => t.text.replace(/\s+/g, ''));
  });
  if (!originale.includes(angezeigt))
    throw new Error('Angezeigter Lesetext weicht vom Original ab: ' + angezeigt.slice(0, 80));
  console.log('Silbenfärbung verliert keinen Buchstaben ✅');

  /* Die Auswertung im Browser mit einer kuenstlichen Aufnahme durchspielen. */
  const urteil = await p.evaluate(async () => {
    const L = await import('./js/lesen.js');
    const kurve = [];
    const an = n => { for (let i=0;i<n;i++) kurve.push(0.5); };
    const aus = n => { for (let i=0;i<n;i++) kurve.push(0.02); };
    an(120); aus(20); an(120); aus(20); an(120);      // 25 ms je Schritt
    const w = L.auswerten(kurve, { text: 'Die Sonne geht auf. Ein Vogel singt im Baum.', schrittMs: 25 });
    return { tempo: w.tempo, boegen: w.boegen, stufe: L.einordnung(w, 1).stufe };
  });
  if (!(urteil.tempo > 0 && urteil.boegen === 3 && urteil.stufe >= 1 && urteil.stufe <= 4))
    throw new Error('Leseauswertung im Browser falsch: ' + JSON.stringify(urteil));
  console.log(`Leseauswertung im Browser: ${urteil.boegen} Bögen, ${urteil.tempo} Silben/Min, Stufe ${urteil.stufe} ✅`);

  /* Silbe-fuer-Silbe-Zuordnung im echten Code: eine kuenstliche Aufnahme mit
     vier Silben, bei der die dritte gestockt ist. */
  const bild = await p.evaluate(async () => {
    const A = await import('./js/aussprache.js');
    const Si = await import('./js/silben.js');
    const liste = Si.silben('Sonnenblume').map((text, i) => ({ text, wort:'Sonnenblume', imWort:i }));
    const kurve = [];
    const berg = (n, laut) => { for (let k=0;k<n;k++)
      kurve.push(0.01 + laut * Math.max(0.12, Math.sin((k+0.5)/n*Math.PI))); };
    const still = n => { for (let k=0;k<n;k++) kurve.push(0.01); };
    still(8);
    liste.forEach((s, i) => { if (i) still(i === 2 ? 36 : 2); berg(9, 0.5); });
    still(8);
    const z = A.zuordnen(liste, kurve, { schrittMs: 25 });
    return { sicher: z.sicher, farben: z.silben.map(s => s.farbe) };
  });
  if (!bild.sicher) throw new Error('Zuordnung im Browser unsicher: ' + JSON.stringify(bild));
  if (bild.farben[2] !== 'rot')
    throw new Error('gestockte Silbe wird nicht rot: ' + bild.farben.join(', '));
  if (bild.farben[0] !== 'gruen')
    throw new Error('flüssige Silbe wird nicht grün: ' + bild.farben.join(', '));
  console.log(`Silben eingefärbt: ${bild.farben.join(' · ')} ✅`);
  await p.click('#leseOhne');
  await p.waitForSelector('#weiter', { timeout: 5000 });
  await p.click('#weiter');
  /* Die angefangene Runde zu Ende spielen - waehrend einer Runde ist die
     untere Navigationsleiste ausgeblendet. */
  for (let i = 0; i < 14 && !(await p.$('#nochmal')); i++) {
    await p.waitForSelector('.task');
    await loeseAufgabe(p);
    await p.waitForSelector('#weiter');
    await p.click('#weiter');
  }
  await p.waitForSelector('#nochmal', { timeout: 8000 });
  await p.click('#heim');
  await p.waitForSelector('#mission');
}

// Überraschungsrätsel des Tages: Teaser sichtbar, lösbar, Zustand bleibt
// für den Rest des Tages "schon gelöst".
{
  await bannerWeg(p);
  await p.click('.nav-btn[data-route="lernen"]');
  await p.waitForSelector('.ueberraschungs-karte');
  const teaserVorher = await p.textContent('.ueberraschungs-karte');
  if (!/Überraschungsrätsel/.test(teaserVorher)) throw new Error('Teaser-Karte fehlt auf der Lernen-Seite');
  await p.click('#zurUeberraschung');
  await p.waitForSelector('#raetselEingabe, .small');
  const antwort = await p.evaluate(async () => {
    const mod = await import('/js/ueberraschung.js');
    return mod.raetselFuer().antwort;
  });
  // Erst absichtlich falsch tippen: das alte Feld darf danach nicht stehen
  // bleiben, sonst haengt sich die richtige Antwort nur hinten an.
  await p.fill('#raetselEingabe', '999999');
  await p.click('#raetselPruefen');
  await p.waitForFunction(() => /Noch nicht ganz/.test(
    document.querySelector('#raetselRueckmeldung')?.textContent || ''), { timeout: 5000 });
  const nachFalsch = await p.inputValue('#raetselEingabe');
  if (nachFalsch !== '') throw new Error(`Feld nach falscher Antwort nicht geleert (steht noch: "${nachFalsch}")`);
  console.log('Überraschungsrätsel: falsche Antwort leert das Feld für den nächsten Versuch ✅');
  await p.fill('#raetselEingabe', antwort);
  await p.click('#raetselPruefen');
  await p.waitForFunction(() => {
    const el = document.querySelector('#raetselRueckmeldung');
    return el && /Richtig/.test(el.textContent);
  }, { timeout: 5000 });
  console.log('Überraschungsrätsel gelöst ✅');
  await p.screenshot({ path: `${S}/17-ueberraschung.png`, fullPage: true });
  await p.click('#raetselZurueck');
  await p.waitForSelector('.ueberraschungs-karte');
  const teaserNachher = await p.textContent('.ueberraschungs-karte');
  if (!/schon gelöst/.test(teaserNachher)) throw new Error('Teaser zeigt nach dem Lösen nicht "schon gelöst": ' + teaserNachher);
  console.log('Teaser zeigt danach korrekt "heute schon gelöst" ✅');
}

// Notausgang gegen die festgebissene alte Fassung: Offline-Speicher leeren.
// Entscheidend ist die Zusicherung im Text daneben – der Fortschritt muss das ueberleben.
await p.click('.nav-btn[data-route="eltern"]');
await p.waitForSelector('#hartNeuladen', { state: 'attached' });
await p.evaluate(() => document.querySelector('#hartNeuladen').closest('details').open = true);
const vorHartemLaden = await p.evaluate(() =>
  JSON.parse(localStorage.getItem('kidzootopia.v1')).profile[0].stats.aufgabenGesamt);
await p.click('#hartNeuladen');
await p.waitForSelector('#mission', { timeout: 8000 });
const nachHartemLaden = await p.evaluate(() =>
  JSON.parse(localStorage.getItem('kidzootopia.v1')).profile[0].stats.aufgabenGesamt);
if (nachHartemLaden !== vorHartemLaden)
  throw new Error(`Offline-Speicher leeren kostete Fortschritt: ${vorHartemLaden} -> ${nachHartemLaden}`);
const restCaches = await p.evaluate(async () => (await caches.keys()).length);
console.log(`Offline-Speicher geleert: Fortschritt erhalten (${nachHartemLaden} Aufgaben), Speicher danach: ${restCaches}`);

console.log(fehler.length ? 'FEHLER:\n'+fehler.join('\n') : 'keine JS-Fehler ✅');
await b.close();
