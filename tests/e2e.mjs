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
       Silbenfaerbung steht und der Weg ohne Mikrofon sauber weitergeht.
       Modus "Allein" erzwungen, damit dieser allgemeine Durchlauf nicht bei
       jeder Leseaufgabe die (langsamere) Echo-/Takt-Vorphase durchläuft -
       Echo und Takt haben eigene, gezielte Prüfungen weiter unten. */
    const allein = await p.$('[data-modus="allein"]');
    if (allein) await allein.click();
    const silben = await p.$$eval('#leseText .sil', els => els.length);
    if (silben < 10) throw new Error(`Lesetext kaum in Silben zerlegt: ${silben} Silben`);
    const gefaerbt = await p.$$eval('#leseText .sil.s1', els => els.length);
    if (gefaerbt < 3) throw new Error(`Silbenfärbung fehlt: nur ${gefaerbt} eingefärbte Silben`);
    await p.click('#leseOhne');
    return;
  }
  if (await p.$('.teil[data-e]')) { let n=0; while (await p.$('.teil[data-e]') && n++<12) await p.click('.teil[data-e]'); return; }
  if (await p.$('#blitzFlash')) {
    /* Blitzlesen: erst verschwindet die Anzeige, dann kommen die Optionen -
       bis dahin warten statt sofort zu klicken. */
    await p.waitForSelector('#blitzOptionen:not([hidden])', { timeout: 6000 });
    await p.click('#blitzOptionen .choice');
    return;
  }
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

// Lesehilfe bei Legasthenie/LRS: im Eltern-Bereich einschalten, Live-Vorschau
// und Silbenfärbung in einer echten Aufgabe prüfen.
{
  // Erst die Schriftgröße OHNE Lesehilfe messen - Vergleichswert für unten.
  await p.click('.nav-btn[data-route="lernen"]');
  await p.waitForSelector('#mission');
  await p.click('[data-fach="deutsch"]');
  await p.waitForSelector('.task');
  const taskGroesseOhne = await p.$eval('.task', el => parseFloat(getComputedStyle(el).fontSize));
  await p.click('#raus');
  await p.waitForSelector('#mission');

  await p.click('.nav-btn[data-route="eltern"]');
  await p.waitForSelector('#lhSchalter');
  await p.click('#lhSchalter');                          // schaltet die LRS-Voreinstellung ein
  await p.waitForSelector('body.lh-an');
  await p.waitForSelector('#lhBoegen');
  const vorschauSilben = await p.$$eval('.card:has(#lhSchalter) .lesetext .sil', els => els.length);
  if (vorschauSilben < 3) throw new Error('Live-Vorschau der Lesehilfe zeigt keine Silben');
  await p.screenshot({ path: `${S}/lh-1-eltern.png`, fullPage: true });
  /* Ausschnitt NUR der Vorschau (nicht die ganze Eltern-Seite) - der Chef
     wollte gezielt sehen, wie die Vorschau selbst aussieht. */
  const vorschauKasten = await p.$('.card:has(#lhSchalter) .lesetext');
  await vorschauKasten.screenshot({ path: `${S}/lh-4-vorschau.png` });
  console.log(`Lesehilfe: Live-Vorschau zeigt ${vorschauSilben} eingefärbte Silben ✅`);

  await p.click('.nav-btn[data-route="lernen"]');
  await p.waitForSelector('#mission');
  await p.click('[data-fach="deutsch"]');
  await p.waitForSelector('.task');
  const aufgabenSilben = await p.$$eval('.task .sil', els => els.length);
  if (aufgabenSilben < 1) throw new Error('Aufgabentext ist trotz eingeschalteter Lesehilfe nicht in Silben gefärbt');
  const angezeigterText = (await p.textContent('.task')).trim();
  await p.screenshot({ path: `${S}/lh-2-aufgabe.png`, fullPage: true });
  console.log(`Lesehilfe: Aufgabentext in ${aufgabenSilben} Silben gefärbt, Text erhalten: "${angezeigterText.slice(0, 40)}…" ✅`);

  /* Schriftgröße "groß" (LRS-Voreinstellung: groesse:2) muss GRÖSSER sein
     als vorher, nicht kleiner - jede Fläche hat ihre eigene Grundgröße
     (siehe app.css), --lese-groesse multipliziert darauf statt auf 1em. */
  const taskGroesseMit = await p.$eval('.task', el => parseFloat(getComputedStyle(el).fontSize));
  if (!(taskGroesseMit > taskGroesseOhne))
    throw new Error(`Schrift wird mit Lesehilfe "groß" nicht größer: ${taskGroesseOhne}px -> ${taskGroesseMit}px`);
  console.log(`Lesehilfe: .task-Schrift wächst mit "groß" (${taskGroesseOhne}px -> ${taskGroesseMit}px) ✅`);

  await p.click('#raus');
  await p.waitForSelector('#mission');
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
  /* Lesehilfe ist seit dem Block oben eingeschaltet (aufgabenSilben: true) -
     der Aufgabentext wird also über silbenHtml() gerendert. Manche Fragen
     dieses Ziels enthalten einen echten Zeilenumbruch ("…Schule\nWie viele
     Silben…"); silbenHtml() darf den nicht zu einem Leerzeichen verschmelzen
     (siehe .task{white-space:pre-wrap}). Exakter, NICHT normalisierter
     Vergleich mit dem tatsächlichen Aufgabentext. */
  const rohesFrage = await p.evaluate(() => window.__aufgabe?.frage || null);
  if (rohesFrage?.includes('\n')) {
    const genauerText = await p.$eval('.task', el => el.textContent);
    if (genauerText !== rohesFrage)
      throw new Error(`Zeilenumbruch geht bei der Silbenfärbung verloren: "${JSON.stringify(rohesFrage)}" -> "${JSON.stringify(genauerText)}"`);
    console.log('Lesehilfe: Zeilenumbruch im Aufgabentext bleibt exakt erhalten ✅');
  }
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
  /* Lesehilfe ist von oben noch eingeschaltet: Lesefenster-Knöpfe da,
     Silben blau/rot mit Bögen (siehe .lh-fenster/.lh-blaurot/.lh-boegen). */
  if (!(await p.$('#leseZeileZurueck')) || !(await p.$('#leseZeileVor')))
    throw new Error('Lesefenster-Knöpfe fehlen trotz eingeschalteter Lesehilfe');
  await p.click('#leseZeileVor');
  await p.screenshot({ path: `${S}/lh-3-lesepult.png`, fullPage: true });
  console.log('Lesehilfe: Lesefenster-Knöpfe im Lesepult vorhanden ✅');

  /* Lesemodi: Echo/Takt/Allein - die drei Knöpfe müssen sichtbar und
     wechselbar sein. Danach bleibt "Im Takt" ausgewählt: Der spätere Klick
     auf "Ohne Mikrofon lesen" (unten) prüft dann, dass der Takt-Ball über
     mehrere Silben wandert und auch ohne Mikrofon zu Ende (Fertig) kommt. */
  const modiSichtbar = await p.$$eval('[data-modus]', els => els.map(e => e.dataset.modus));
  if (!['echo', 'takt', 'allein'].every(m => modiSichtbar.includes(m)))
    throw new Error('Modus-Knöpfe (Echo/Takt/Allein) fehlen im Lesepult: ' + modiSichtbar.join(','));
  await p.screenshot({ path: `${S}/lm-1-modus-wahl.png`, fullPage: true });
  /* Ein paar schnelle Takt-Messungen "vorspielen", damit die Vorgabe nicht
     beim sehr ruhigen Start-Tempo (60 Silben/Minute ohne jede Erfahrung)
     bleibt - sonst dauert die folgende Mitklatsch-Übung bei einem ganzen
     Lesetext unnötig lange. Die Logik selbst (taktVorgabe) wird bereits in
     tests/lesemodi.mjs geprüft; hier geht es nur um eine zügige Demo. */
  await p.evaluate(() => import('./js/store.js').then(S => {
    const p = S.aktiv();
    for (let i = 0; i < 5; i++) S.merkeTakt(p, { silbenProMin: 260, gleichmass: 90, modus: 'takt' });
  }));
  await p.click('[data-modus="takt"]');
  await p.screenshot({ path: `${S}/lm-2-takt.png`, fullPage: true });
  console.log('Lesemodi: Echo/Takt/Allein-Knöpfe sichtbar und wechselbar ✅');

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

  /* "Im Takt" ohne Mikrofon: reine Mitklatsch-Übung. Zuerst zählt die App
     sichtbar ein ("1 - 2 - 3 - los"), danach hüpft der Ball über mehrere
     Silben, bevor die Aufgabe von selbst zu Ende geht ("Fertig" ist hier
     also der Klick auf "Ohne Mikrofon lesen" selbst gewesen). */
  await p.click('#leseOhne');
  /* Start-Knöpfe dürfen während "Im Takt" nicht mehr sichtbar sein - die
     Übung läuft von selbst durch, es gibt nichts mehr anzutippen. */
  const startReiheImTakt = await p.$eval('#leseStartReihe', el => !el.hidden).catch(() => false);
  if (startReiheImTakt) throw new Error('Start-Knöpfe ("Los"/"Ohne Mikrofon") bleiben während "Im Takt" sichtbar');
  console.log('Im Takt: Start-Knöpfe während der Übung ausgeblendet ✅');
  await p.waitForSelector('#einzaehlAnzeige:not([hidden])', { timeout: 3000 });
  await p.screenshot({ path: `${S}/lm-3-takt-einzaehlen.png`, fullPage: true });
  await p.waitForSelector('#einzaehlAnzeige', { state: 'hidden', timeout: 5000 });
  const ballPos1 = await p.$eval('#taktBall', el => el.style.left);
  /* Lesehilfe/Lesefenster ist hier noch eingeschaltet (siehe oben) - die
     aktive Zeile muss der Ballposition folgen, nicht irgendeiner anderen
     Zeile (gemeldeter Fehler: Ball in Zeile 1, hell aber Zeile 2). Die
     Ballposition kommt exakt vom offsetTop/offsetLeft EINER Silbe
     (ballZuSilbeBewegen in js/ui.js) - also erst genau diese Silbe wieder
     finden (ein Vergleich mit dem offsetTop des .wort selbst wäre falsch:
     Silbe und umschließendes Wort haben aus Zeilenhöhe/Feinsatz-Gründen
     leicht unterschiedliche offsetTop-Werte, auch auf derselben Zeile). */
  const zeileFolgtBall = await p.evaluate(() => {
    const ball = document.querySelector('#taktBall');
    const left = parseFloat(ball.style.left), top = parseFloat(ball.style.top);
    if (Number.isNaN(left) || Number.isNaN(top)) return false;
    const treffer = [...document.querySelectorAll('#leseText [data-sil]')].find(f =>
      Math.abs(f.offsetTop - top) < 1 && Math.abs((f.offsetLeft + f.offsetWidth / 2) - left) < 1);
    const wort = treffer?.closest('.wort');
    return !!wort && wort.classList.contains('zeile-aktiv');
  });
  if (!zeileFolgtBall) throw new Error('Lesefenster folgt dem Takt-Ball nicht (aktive Zeile passt nicht zur Ballposition)');
  console.log('Im Takt: das Lesefenster folgt der Ballposition ✅');
  await p.screenshot({ path: `${S}/lm-4-takt-ball.png`, fullPage: true });
  await p.waitForTimeout(500);
  const ballPos2 = await p.$eval('#taktBall', el => el.style.left).catch(() => ballPos1);
  if (ballPos1 === '' && ballPos2 === '')
    throw new Error('Takt-Ball hat sich nie bewegt (kein style.left gesetzt)');
  if (ballPos1 !== '' && ballPos2 !== '' && ballPos1 === ballPos2)
    console.log('Hinweis: Takt-Ball-Position nach 500ms unverändert (kann bei kurzem Text vorkommen)');
  console.log(`Takt-Lesen: Ball bewegt sich über die Silben (${ballPos1} -> ${ballPos2}) ✅`);
  /* Die Start-Taktvorgabe ist bewusst sehr ruhig (60 Silben/Minute ohne
     jede vorherige Messung) - bei einem ganzen Lesetext dauert die reine
     Mitklatsch-Übung deshalb regulär eine ganze Weile. */
  await p.waitForSelector('#weiter', { timeout: 90000 });
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

// Eltern-Bereich: Echo-Stufe und Takt-Vorgabe bei der Leseflüssigkeit.
// Ein paar Messwerte vorgespielt, weil im Test nie ein echtes Mikrofon
// zur Verfügung steht (siehe Kommentare weiter oben) - taktMessen()/
// echoAnpassen() selbst sind bereits in tests/lesemodi.mjs geprüft.
{
  await p.evaluate(() => import('./js/store.js').then(S => {
    const p = S.aktiv();
    for (let i = 0; i < 4; i++) S.merkeTakt(p, { silbenProMin: 90 + i * 5, gleichmass: 70, modus: 'takt' });
    S.echoNachLesungAnpassen(p, { stufe: 4, stockungen: 0, tempo: 150 });
    S.echoNachLesungAnpassen(p, { stufe: 4, stockungen: 0, tempo: 150 });
  }));
  await p.click('.nav-btn[data-route="eltern"]');
  await p.waitForSelector('text=Echo-Lesen, Takt-Lesen und Blitzlesen', { timeout: 5000 });
  await p.screenshot({ path: `${S}/lm-6-eltern.png`, fullPage: true });
  console.log('Eltern-Bereich: Echo-Stufe und Takt-Vorgabe bei der Leseflüssigkeit sichtbar ✅');
  await p.click('.nav-btn[data-route="lernen"]');
  await p.waitForSelector('#mission');
}

// Eigene Texte (Text einfügen, ohne OCR): Eltern-Bereich -> prüfen -> speichern,
// danach beim Kind unter "Meine Texte" lesen.
{
  await bannerWeg(p);
  await p.click('.nav-btn[data-route="eltern"]');
  await p.waitForSelector('#zuEigenerText');
  await p.click('#zuEigenerText');
  await p.waitForSelector('#neuerText');
  await p.click('#neuerText');
  await p.waitForSelector('#eingabeText');
  await p.click('#eingabeText');
  await p.waitForSelector('#textEinfuegen');
  const EINFUEGE_TEXT = 'Die Katze schläft auf dem warmen Sofa. Draußen regnet es leise.';
  await p.fill('#textEinfuegen', EINFUEGE_TEXT);
  await p.click('#textUebernehmen');
  await p.waitForSelector('#pruefText');
  await p.screenshot({ path: `${S}/et-3-pruefen.png`, fullPage: true });
  const pruefWert = await p.inputValue('#pruefText');
  if (!pruefWert.includes('Katze')) throw new Error('Eingefügter Text landet nicht im Prüffeld: ' + pruefWert);
  const abschnitte = await p.$$eval('#abschnittVorschau .lesetext', els => els.length);
  if (abschnitte < 1) throw new Error('Keine Abschnittsvorschau nach dem Einfügen');
  await p.click('#textSpeichern');
  await p.waitForSelector('[data-loeschen]');
  console.log('Eigene Texte: Text eingefügt, geprüft und gespeichert ✅');

  // Beim Kind: "Meine Texte" auf der Lernen-Seite, Text auswählen, ersten
  // Abschnitt ohne Mikrofon lesen, weiter zum nächsten Abschnitt.
  await p.click('.nav-btn[data-route="lernen"]');
  await p.waitForSelector('#meineTexte');
  await p.click('#meineTexte');
  await p.waitForSelector('[data-text]');
  await p.click('[data-text]');
  await p.waitForSelector('#leseStart');
  const kindSilben = await p.$$eval('#leseText .sil', els => els.length);
  if (kindSilben < 3) throw new Error('Eigener Text ist im Lesepult kaum in Silben zerlegt');
  await p.screenshot({ path: `${S}/et-4-lesepult.png`, fullPage: true });
  await p.click('#ersAnhoeren');           // darf nicht abstürzen, auch ohne Sprachausgabe im Test

  /* Echo-Lesen: "Ohne Mikrofon" muss die App trotzdem erst Satz für Satz
     vorlesen/mitlaufen lassen (Zeitplan-Fallback ohne Stimme im Headless-
     Chromium) - geprüft wird, dass ".sil.jetzt" während dieser Vorphase
     wirklich wandert, bevor die Aufgabe zu Ende geht. */
  await p.click('[data-modus="echo"]');
  await p.click('#leseOhne');
  /* Engmaschig abfragen statt an zwei festen Zeitpunkten zu schauen - der
     eigene Text ist kurz, die Vorphase kann daher schnell durchlaufen.
     Beobachtet werden ALLE Positionen, an denen ".sil.jetzt" gesehen wurde;
     ohne mindestens eine gesehene Position (und ohne echte Bewegung, falls
     mehr als eine gesehen wurde) ist der Zeitplan-Fallback nicht bewiesen. */
  const gesehen = [];
  for (let i = 0; i < 20; i++) {
    const pos = await p.$eval('#leseText', el =>
      [...el.querySelectorAll('.sil')].findIndex(s => s.classList.contains('jetzt'))).catch(() => -1);
    if (pos >= 0) gesehen.push(pos);
    if (i === 2) await p.screenshot({ path: `${S}/lm-5-echo.png`, fullPage: true });
    await p.waitForTimeout(120);
  }
  if (!gesehen.length)
    throw new Error('Echo-Lesen: die Silbenmarkierung (.sil.jetzt) war während der Vorphase nie sichtbar');
  const bewegtSich = gesehen.some(pos => pos !== gesehen[0]);
  if (gesehen.length > 3 && !bewegtSich)
    throw new Error('Echo-Lesen: die Silbenmarkierung blieb die ganze Zeit an derselben Stelle stehen: ' + gesehen.join(','));
  console.log(`Echo-Lesen: Silbenmarkierung wandert im Zeitplan-Fallback (${gesehen.join(' -> ')}) ✅`);
  await p.waitForSelector('#mtWeiter', { timeout: 15000 });
  await p.click('#mtWeiter');              // Durchgang 2 von 3
  await p.waitForSelector('#leseStart');
  await p.click('[data-modus="allein"]');  // Echo schon oben geprüft - hier zügig weiter
  await p.click('#leseOhne');
  await p.waitForSelector('#mtWeiter');
  await p.click('#mtWeiter');              // Durchgang 3 von 3
  await p.waitForSelector('#leseStart');
  await p.click('[data-modus="allein"]');
  await p.click('#leseOhne');
  await p.waitForSelector('#mtWeiter');
  const weiterText = await p.textContent('#mtWeiter');
  await p.click('#mtWeiter');              // weiter zum nächsten Abschnitt oder fertig
  console.log(`Meine Texte: drei Durchgänge gelesen, danach "${weiterText.trim()}" ✅`);
  await p.waitForSelector('#leseStart, [data-text]', { timeout: 6000 });
  await p.click('.nav-btn[data-route="lernen"]').catch(() => {});
  await p.waitForSelector('#mission');
}

// Eigene Texte mit echter Texterkennung (OCR): ein im Test erzeugtes Bild mit
// einem deutschen Satz in großer Schrift hochladen, zuschneiden, erkennen
// lassen und prüfen, dass (a) der Satz bis auf höchstens 2 Zeichen erkannt
// wurde und (b) dabei ausschließlich localhost angefragt wurde - die
// Texterkennung läuft vollständig auf dem Gerät (siehe js/texterkennung.js).
{
  const OCR_SATZ = 'Der Hund spielt froh im Garten';
  const bildBase64 = await p.evaluate(satz => {
    const c = document.createElement('canvas');
    c.width = 900; c.height = 220;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, c.width, c.height);
    ctx.fillStyle = '#000000'; ctx.font = 'bold 54px sans-serif';
    ctx.textBaseline = 'middle';
    ctx.fillText(satz, 20, c.height / 2);
    return c.toDataURL('image/png').split(',')[1];
  }, OCR_SATZ);

  await p.click('.nav-btn[data-route="eltern"]');
  await p.waitForSelector('#zuEigenerText');
  await p.click('#zuEigenerText');
  await p.waitForSelector('#neuerText');
  await p.click('#neuerText');
  await p.waitForSelector('#eingabeDatei', { state: 'attached' });
  await p.setInputFiles('#eingabeDatei', {
    name: 'testsatz.png', mimeType: 'image/png', buffer: Buffer.from(bildBase64, 'base64')
  });
  await p.waitForSelector('#zuschnittWeiter', { timeout: 8000 });
  await p.screenshot({ path: `${S}/et-1-zuschnitt.png`, fullPage: true });

  // Nur externe Netzwerkanfragen zählen als Verstoß - localhost (der eigene
  // Testserver) liefert die Vendor-Dateien der Texterkennung.
  const fremdeAnfragen = [];
  const beobachten = req => {
    try {
      const url = new URL(req.url());
      if (url.hostname !== 'localhost' && url.hostname !== '127.0.0.1') fremdeAnfragen.push(req.url());
    } catch {}
  };
  p.on('request', beobachten);
  await p.click('#zuschnittWeiter');       // ganzes Bild übernehmen (Standard-Zuschnitt)
  await p.waitForSelector('#pruefText', { timeout: 90000 });
  p.off('request', beobachten);
  await p.screenshot({ path: `${S}/et-2-erkennung.png`, fullPage: true });

  if (fremdeAnfragen.length)
    throw new Error('Texterkennung hat externe Adressen angefragt: ' + fremdeAnfragen.join(', '));
  console.log('Texterkennung: ausschließlich localhost angefragt (Bild verlässt das Gerät nicht) ✅');

  const erkannterText = (await p.inputValue('#pruefText')).replace(/\s+/g, ' ').trim();
  const levenshtein = (a, b) => {
    const m = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
    for (let j = 0; j <= b.length; j++) m[0][j] = j;
    for (let i = 1; i <= a.length; i++)
      for (let j = 1; j <= b.length; j++)
        m[i][j] = a[i-1] === b[j-1] ? m[i-1][j-1]
          : 1 + Math.min(m[i-1][j], m[i][j-1], m[i-1][j-1]);
    return m[a.length][b.length];
  };
  const abstand = levenshtein(erkannterText.toLowerCase(), OCR_SATZ.toLowerCase());
  console.log(`Texterkennung: erwartet "${OCR_SATZ}", erkannt "${erkannterText}" (Abstand ${abstand})`);
  if (abstand > 2) throw new Error(`OCR-Ergebnis weicht zu stark ab (Abstand ${abstand}): "${erkannterText}"`);
  console.log('Texterkennung: Satz bis auf höchstens 2 Zeichen erkannt ✅');

  await p.click('#pruefenAbbrechen');
  await p.waitForSelector('#neuerText');
  await p.click('.nav-btn[data-route="lernen"]');
  await p.waitForSelector('#mission');
}

// Lesespiele: gezielt starten und mindestens einmal jeden Spieltyp lösen.
// Vier statt fünf Wege (siehe js/data.js), damit engine.js (waehleWeg wählt
// bei fünf Wegen nur aus den beiden staerksten ODER den beiden schwaechsten -
// der mittlere käme nie dran) auf Dauer wirklich alle vier anbietet. "knobeln"
// mischt zusätzlich zwischen Quatschwörtern, Spiegelbuchstaben und Blitzlesen -
// dafür wird über genug Runden gespielt, bis alle sechs Spielarten dran waren.
{
  await bannerWeg(p);
  await p.click('[data-ziel="lesespiele"]');
  const gesehen = new Set();
  const erkenneSpiel = async () => {
    const a = await p.evaluate(() => window.__aufgabe);
    if (!a) return null;
    if (a.typ === 'blitz') return 'blitz';
    if (a.typ === 'ordnen') return 'silbenbaukasten';
    if (a.bild) return 'wortdetektiv';
    if (a.typ === 'choice' && a.hoertext && /🕵️/.test(a.frage || '')) return 'satzdetektiv';
    if (a.typ === 'choice' && a.hoertext) return 'spiegel';
    if (a.typ === 'choice') return 'quatsch';
    return null;
  };
  const ALLE_SPIELE = ['wortdetektiv', 'silbenbaukasten', 'satzdetektiv', 'spiegel', 'quatsch', 'blitz'];
  /* Satz-Detektiv hat vier Fehlerarten (fehlt/zusatz/vertauscht/ersetzt) -
     "fehlt" bekommt zusätzlich einen eigenen Screenshot, weil genau dort die
     Lücken-Position gezielt geprüft werden soll (Chef-Review). Best-effort:
     blockiert die Runde nicht, falls sie in den gespielten Runden nicht dran war. */
  let fehltGesehen = false;
  let runden = 0;
  while ((gesehen.size < ALLE_SPIELE.length || !fehltGesehen) && runden < 16) {
    runden++;
    for (let i = 0; i < 8; i++) {
      await p.waitForSelector('.task');
      const spiel = await erkenneSpiel();
      if (spiel && !gesehen.has(spiel)) {
        console.log(`Lesespiele: „${spiel}" erscheint, wird gelöst …`);
        await p.screenshot({ path: `${S}/ls-${spiel}.png`, fullPage: true });
      }
      if (spiel === 'satzdetektiv' && !fehltGesehen) {
        const frage = await p.textContent('.task').catch(() => '');
        if (/Welches Wort fehlt/.test(frage || '')) {
          fehltGesehen = true;
          console.log('Lesespiele: Satz-Detektiv „fehlt" erscheint, wird gelöst …');
          await p.screenshot({ path: `${S}/ls-satzdetektiv-fehlt.png`, fullPage: true });
        }
      }
      if (spiel) gesehen.add(spiel);
      await loeseAufgabe(p);
      await p.waitForSelector('#weiter');
      await p.click('#weiter');
    }
    await p.waitForSelector('#nochmal', { timeout: 8000 });
    const wirdWeitergespielt = (gesehen.size < ALLE_SPIELE.length || !fehltGesehen) && runden < 16;
    if (wirdWeitergespielt) await p.click('#nochmal'); else await p.click('#heim');
  }
  if (!fehltGesehen) console.log('Lesespiele: Hinweis - Satz-Detektiv "fehlt" kam in den gespielten Runden nicht vor (kein Fehler, nur kein Extra-Screenshot).');
  const fehlend = ALLE_SPIELE.filter(s => !gesehen.has(s));
  if (fehlend.length) throw new Error(`Lesespiele: nach ${runden} Runden fehlen noch: ${fehlend.join(', ')}`);
  console.log(`Lesespiele: alle sechs Spielarten mindestens einmal gelöst (${runden} Runden) ✅`);
  await p.waitForSelector('#mission');
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

// Echo-Lesen, Stufe 1, WIRKLICH mit Mikrofon: die Phasen "hören" -> "Jetzt
// du" müssen wechseln, und "Weiter ➜" muss zum nächsten Satz führen. Das
// braucht eine echte (wenn auch simulierte) Mikrofon-Freigabe - dafür ein
// EIGENER, zweiter Browser mit Fake-Gerät. Der Hauptbrowser oben bleibt
// bei "kein Mikrofon" (das ist der realistischere Regelfall im Test) und
// prüft alle übrigen ~30 Lese-Aufgaben schnell und unverändert.
{
  const fehler2 = [];
  const b2 = await chromium.launch({
    executablePath: process.env.CHROME_PATH || undefined,
    args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream']
  });
  const ctx2 = await b2.newContext({ viewport: { width: 390, height: 844 }, permissions: ['microphone'] });
  const p2 = await ctx2.newPage();
  p2.on('pageerror', e => fehler2.push('pageerror: ' + e.message));
  p2.on('console', m => { if (m.type() === 'error') fehler2.push('console: ' + m.text()); });
  p2.on('dialog', d => d.accept().catch(() => {}));

  await p2.goto(`${BASIS}/index.html`);
  await p2.waitForSelector('#nName');
  await p2.fill('#nName', 'Timo');
  await p2.selectOption('#nEtappe', '1');
  await p2.click('[data-av="🐢"]');
  await p2.click('#nAnlegen');
  // Talent-Test überspringen: das Profil ist schon angelegt und aktiv,
  // ein Neuladen zeigt direkt die Lernen-Seite (siehe js/app.js).
  await p2.reload();
  await p2.waitForSelector('#zeichnenStart');   // generisches Zeichen fuer "Lernen-Seite da" -
                                                 // "Meine Texte" gibt es erst NACH dem Seeden unten

  // Einen ganz kurzen eigenen Text mit genau zwei Sätzen seeden - direkt
  // über den Speicher, ohne Umweg über Foto/OCR (die sind schon anderswo
  // geprüft). Zwei kurze Sätze reichen, um Hören -> Jetzt du -> Weiter
  // zweimal durchzuspielen, ohne den Test unnötig zu verlängern.
  await p2.evaluate(async () => {
    const S = await import('./js/store.js');
    S.eigenenTextSpeichern(S.aktiv(), { titel: 'Echo-Test', abschnitte: ['Die Katze schläft. Der Hund spielt.'] });
  });
  await p2.click('.nav-btn[data-route="lernen"]');
  await p2.waitForSelector('#meineTexte');
  await p2.click('#meineTexte');
  await p2.waitForSelector('[data-text]');
  await p2.click('[data-text]');
  await p2.waitForSelector('#leseStart');
  await p2.click('[data-modus="echo"]');

  await p2.click('#leseStart');
  // Phase 1: "hören" - danach muss "Jetzt du!" erscheinen (Zeitplan-
  // Fallback sorgt notfalls auch ohne Stimme für ein Ende, siehe
  // hoereSatz/js/ui.js - großzügiges Zeitbudget für Sprachausgabe + Fallback).
  await p2.waitForSelector('#echoJetztDu:not([hidden])', { timeout: 10000 });
  const hinweis1 = (await p2.textContent('#leseHinweis')) || '';
  if (!/Jetzt du/.test(await p2.textContent('#echoJetztDu')))
    throw new Error('Echo Stufe 1: "Jetzt du"-Hinweis fehlt nach der ersten Hör-Phase');
  const gedimmtVorher = await p2.$$eval('#leseText .wort.satz-dim', els => els.length);
  if (gedimmtVorher === 0) throw new Error('Echo Stufe 1: kein Satz wird gedimmt - "Jetzt du" hebt sich nicht ab');
  /* Start-Knöpfe ("Los"/"Ohne Mikrofon") dürfen während der ganzen Satz-für-
     Satz-Übung nicht sichtbar sein - gemeldeter Fehler: beide blieben neben
     "Jetzt du!" stehen und antippbar. */
  const startReiheBeiJetztDu = await p2.$eval('#leseStartReihe', el => !el.hidden).catch(() => false);
  if (startReiheBeiJetztDu) throw new Error('Start-Knöpfe bleiben während Echo Stufe 1 ("Jetzt du!") sichtbar');
  console.log('Echo Stufe 1: Start-Knöpfe während der Übung ausgeblendet ✅');
  /* "Weiter ➜" muss tatsächlich im sichtbaren Bereich stehen - nicht unter
     der unteren Navigationsleiste (die liegt als fixe Leiste über dem
     unteren Rand, "im Fenster" reicht als Prüfung deshalb nicht) - siehe
     scrollIntoView in echoSatzFuerSatz/js/ui.js. */
  const weiterSichtbar = await p2.evaluate(() => {
    const r = document.querySelector('#echoWeiter').getBoundingClientRect();
    const nav = document.getElementById('nav');
    const navTop = (nav && !nav.hidden) ? nav.getBoundingClientRect().top : window.innerHeight;
    return r.height > 0 && r.top >= 0 && r.bottom <= Math.min(window.innerHeight, navTop);
  });
  if (!weiterSichtbar) throw new Error('"Weiter ➜" liegt außerhalb des sichtbaren Bereichs (z. B. unter der Navigationsleiste)');
  console.log('Echo Stufe 1: "Weiter ➜" ist vollständig sichtbar ✅');
  await p2.screenshot({ path: `${S}/lm-7-echo-jetztdu.png`, fullPage: true });
  console.log(`Echo Stufe 1 (mit Mikrofon): Phase "hören" -> "Jetzt du!" erreicht (Hinweis zuvor: "${hinweis1.trim()}") ✅`);

  // "Weiter ➜" führt zum nächsten Satz - wieder erst "hören", dann wieder
  // "Jetzt du!" (der zweite und letzte Satz des Testtexts).
  await p2.click('#echoWeiter');
  await p2.waitForSelector('#echoJetztDu:not([hidden])', { timeout: 10000 });
  console.log('Echo Stufe 1: "Weiter ➜" hat zum nächsten Satz geführt ("hören" -> "Jetzt du!" ein zweites Mal) ✅');

  // Letzter Satz fertig: "Weiter ➜" muss jetzt die ganze Übung beenden und
  // zur Rückmeldung (Meine Texte: "Weiter") führen.
  await p2.click('#echoWeiter');
  await p2.waitForSelector('#mtWeiter', { timeout: 10000 });
  console.log('Echo Stufe 1: letztes "Weiter ➜" beendet die Satz-für-Satz-Übung ✅');

  if (fehler2.length) throw new Error('Echo Stufe 1 (mit Mikrofon): JS-Fehler:\n' + fehler2.join('\n'));
  console.log('Echo Stufe 1 (mit Mikrofon): keine JS-Fehler ✅');
  await b2.close();
}

// Lernmotor (js/lernmotor.js): Tagesziel-Ring, Lese-Album, Eltern-Karte
// "Was gerade geübt wird" und eigene Texte im Lautlesen - eigener, frischer
// Browser, damit die zufällige "50 % eigener Text"-Entscheidung in engine.js
// (einmal je Sitzung gewürfelt) mehrfach neu gezogen werden kann, ohne den
// übrigen Testlauf oben zu verändern.
{
  const fehler3 = [];
  const b3 = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
  const p3 = await b3.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  p3.on('pageerror', e => fehler3.push('pageerror: ' + e.message));
  p3.on('console', m => { if (m.type() === 'error') fehler3.push('console: ' + m.text()); });
  p3.on('dialog', d => d.accept().catch(() => {}));

  await p3.goto(`${BASIS}/index.html`);
  await p3.waitForSelector('#nName');
  await p3.fill('#nName', 'Ben');
  await p3.selectOption('#nEtappe', '1');
  await p3.click('[data-av="🐧"]');
  await p3.click('#nAnlegen');
  await p3.reload();                       // Talent-Test überspringen, direkt zur Lernen-Seite
  await p3.waitForSelector('#mission');

  // Tagesziel-Ring: muss von Anfang an sichtbar sein (0 von x Minuten).
  await p3.waitForSelector('#zumAlbum');
  const ringKarte = p3.locator('.card', { has: p3.locator('#zumAlbum') });
  const ringText = await ringKarte.textContent();
  if (!/Heute:\s*\d+([.,]\d+)?\s*von\s*\d+\s*Minuten/.test(ringText || ''))
    throw new Error('Tagesziel-Ring fehlt auf der Lernen-Seite: ' + ringText);
  console.log('Tagesziel-Ring auf der Lernen-Seite sichtbar ✅');
  await ringKarte.screenshot({ path: `${S}/lm-8-tagesziel.png` });

  // Lese-Album öffnen
  await p3.click('#zumAlbum');
  await p3.waitForSelector('#albumZurueck');
  await p3.screenshot({ path: `${S}/lm-9-album.png`, fullPage: true });
  console.log('Lese-Album öffnet sich ✅');
  await p3.click('#albumZurueck');
  await p3.waitForSelector('#mission');

  // Eltern-Karte "🧠 Was gerade geübt wird"
  await p3.click('.nav-btn[data-route="eltern"]');
  await p3.waitForSelector('#tageszielWahl');
  const elternKarte = p3.locator('.card', { has: p3.locator('h3', { hasText: 'Was gerade geübt wird' }) });
  if (await elternKarte.count() === 0) throw new Error('Eltern-Karte "Was gerade geübt wird" fehlt');
  console.log('Eltern-Karte "Was gerade geübt wird" sichtbar ✅');
  await elternKarte.screenshot({ path: `${S}/lm-10-eltern.png` });

  // Eigene Texte in normalen Lautlese-Aufgaben: direkt über den Speicher
  // geseedet (Foto/OCR ist bereits anderswo geprüft), danach so lange
  // Lautlese-Sitzungen neu gestartet, bis eine Aufgabe mit dem eigenen
  // Text ("📸 …") erscheint - die Auswahl ist bewusst zufällig (≈ jede
  // zweite Sitzung), 12 Versuche machen ein Verfehlen praktisch unmöglich.
  await p3.evaluate(async () => {
    const S = await import('./js/store.js');
    S.eigenenTextSpeichern(S.aktiv(), { titel: 'Mein Ausflug', abschnitte: ['Wir waren heute im Wald und haben Pilze gesucht.'] });
  });
  await p3.click('.nav-btn[data-route="lernen"]');
  await p3.waitForSelector('[data-ziel="lautlesen"]');
  let eigenerTextGefunden = false;
  for (let versuch = 0; versuch < 12 && !eigenerTextGefunden; versuch++) {
    await p3.click('[data-ziel="lautlesen"]');
    await p3.waitForSelector('.task');
    const frage = await p3.textContent('.task');
    if ((frage || '').includes('📸')) {
      eigenerTextGefunden = true;
      await p3.screenshot({ path: `${S}/lm-11-eigener-text-lautlesen.png`, fullPage: true });
    }
    await p3.click('#raus');
    await p3.waitForSelector('#mission');
  }
  if (!eigenerTextGefunden) throw new Error('In 12 Versuchen erschien keine Lautlese-Aufgabe aus dem eigenen Text');
  console.log('Lautlese-Aufgabe aus eigenem Text erscheint ✅');

  if (fehler3.length) throw new Error('Lernmotor-Block: JS-Fehler:\n' + fehler3.join('\n'));
  console.log('Lernmotor-Block: keine JS-Fehler ✅');
  await b3.close();
}

// Lesetest: adaptives Leseprofil, Eltern und Kind gemeinsam (js/lesetest.js,
// Route "lesetest"). Eigener Browser mit eigenem Profil, damit die Dauer der
// Teile 1 und 2 (normal 60s) über window.__testDauerMs verkürzt werden kann -
// NUR für den Test, siehe js/ui.js: screenLesetest. Teil 4 (Mikrofon) wird
// bewusst übersprungen (dafür gibt es die Echo-Lesen-Prüfung mit Fake-Gerät
// weiter oben); Teil 3 und 5 werden gelöst.
{
  const fehler4 = [];
  const b4 = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
  const p4 = await b4.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  p4.on('pageerror', e => fehler4.push('pageerror: ' + e.message));
  p4.on('console', m => { if (m.type() === 'error') fehler4.push('console: ' + m.text()); });
  const P6 = '/tmp/claude-0/-home-user-Kidzootopia/4c253d49-4629-5ae6-8844-1db3f157bb52/scratchpad/p6';
  await p4.addInitScript(() => { window.__testDauerMs = 2500; });

  await p4.goto(BASIS + '/index.html');
  await p4.waitForSelector('#nName');
  await p4.fill('#nName', 'Ben');
  await p4.selectOption('#nEtappe', '1');
  await p4.click('[data-av="🦊"]');
  await p4.click('#nAnlegen');

  // Talent-Test schnell durchklicken, dann direkt zum Ergebnis springen.
  await p4.waitForSelector('#testStart');
  await p4.click('#testStart');
  for (let n = 0; n < 40 && !(await p4.$('#fertigJetzt')); n++) {
    if (await p4.$('.scale [data-v]')) { await p4.click('.scale [data-v="3"]'); continue; }
    if (await p4.$('.choice')) { await p4.click('.choice'); continue; }
    break;
  }
  await p4.click('#fertigJetzt');
  await p4.waitForSelector('#losgehts');
  await p4.click('#losgehts');
  await p4.waitForSelector('#mission');

  // In den Eltern-Bereich, Lesetest-Karte, Test starten.
  await p4.click('.nav-btn[data-route="eltern"]');
  await p4.waitForSelector('#zumLesetest');
  await p4.click('#zumLesetest');
  await p4.waitForSelector('#los');
  await p4.screenshot({ path: `${P6}/einleitung.png`, fullPage: true });
  await p4.screenshot({ path: `${S}/lt-1-einleitung.png`, fullPage: true });
  await p4.click('#los');

  // Teil 1: Wörter lesen – ein paar Tipps setzen, einmal ✗ mit Fehlerart,
  // einmal ⏭, den Rest ✓, bis die (verkürzte) Zeit abläuft.
  await p4.waitForSelector('#tippRichtig');
  await p4.screenshot({ path: `${P6}/teil1-eltern-tippleiste.png`, fullPage: true });
  await p4.screenshot({ path: `${S}/lt-2-teil1.png`, fullPage: true });
  await p4.click('#tippFalsch');
  await p4.waitForSelector('[data-f]');
  await p4.screenshot({ path: `${P6}/fehlerart-auswahl.png`, fullPage: true });
  await p4.screenshot({ path: `${S}/lt-3-fehlerart.png`, fullPage: true });
  await p4.click('[data-f="aehnlich_aussehend"]');
  await p4.waitForSelector('#tippAus');
  await p4.click('#tippAus');
  // Eigenes ElementHandle statt Selektor-String: bei jedem Tipp rendert die
  // App den Bildschirm komplett neu (neues Wort) - ein Selektor-String würde
  // versuchen, ein bereits verschwundenes Element erneut zu finden, sobald
  // die (verkürzte) Zeit mitten in einem Klick ablief und Teil 2/3 beginnt.
  const solangeDa = async (id, max) => {
    for (let n = 0; n < max; n++) {
      const btn = await p4.$(id);
      if (!btn) break;
      await btn.click().catch(() => {});
    }
  };
  await solangeDa('#tippRichtig', 60);
  console.log('Lesetest Teil 1 (Wörter) durchlaufen ✅');

  // Teil 2: Quatschwörter lesen – derselbe Mechanismus, hier reicht ✓.
  await p4.waitForSelector('#tippRichtig', { timeout: 8000 });
  await solangeDa('#tippRichtig', 60);
  console.log('Lesetest Teil 2 (Quatschwörter) durchlaufen ✅');

  // Teil 3: ähnliche Wörter unterscheiden – 12 Aufgaben lösen (immer die
  // erste Option, das Treppenverfahren selbst prüft tests/lesetest.mjs).
  await p4.waitForSelector('.choices .choice', { timeout: 8000 });
  for (let n = 0; n < 12; n++) {
    await p4.waitForSelector('.choices .choice');
    await p4.click('.choices .choice');
  }
  console.log('Lesetest Teil 3 (Unterscheiden) durchlaufen ✅');

  // Teil 4: Tempo & Takt (Mikrofon) – bewusst übersprungen.
  await p4.waitForSelector('#ueberspringen', { timeout: 8000 });
  await p4.click('#ueberspringen');
  console.log('Lesetest Teil 4 (Tempo & Takt) übersprungen ✅');

  // Teil 5: selbst gelesen, dann vorgelesen – je 3 Fragen beantworten.
  await p4.waitForSelector('#weiterFragen', { timeout: 8000 });
  await p4.screenshot({ path: `${P6}/teil5.png`, fullPage: true });
  await p4.screenshot({ path: `${S}/lt-4-teil5.png`, fullPage: true });
  await p4.click('#weiterFragen');
  for (let n = 0; n < 3; n++) {
    await p4.waitForSelector('.choices .choice');
    await p4.click('.choices .choice');
  }
  await p4.waitForSelector('#vorlesenStart', { timeout: 8000 });
  await p4.click('#vorlesenStart');
  await p4.waitForSelector('.choices .choice', { timeout: 15000 });
  for (let n = 0; n < 3; n++) {
    await p4.waitForSelector('.choices .choice');
    await p4.click('.choices .choice');
  }
  console.log('Lesetest Teil 5 (Verstehen) durchlaufen ✅');

  // Kind-Abschluss: nur Ermutigung, KEINE Zahlen.
  await p4.waitForSelector('#fuerEltern', { timeout: 8000 });
  const kindText = await p4.evaluate(() => document.getElementById('view').textContent);
  if (/\d/.test(kindText.replace(/🌟|🎉/g, '')))
    throw new Error('Kind-Abschluss enthält eine Ziffer, sollte aber zahlenfrei sein: ' + kindText);
  await p4.screenshot({ path: `${P6}/kind-abschluss.png`, fullPage: true });
  await p4.screenshot({ path: `${S}/lt-5-kind-abschluss.png`, fullPage: true });
  console.log('Kind-Abschluss zeigt keine Zahlen ✅');

  // Eltern-Ergebnis: Kennzahlen, "keine Diagnose"-Hinweis.
  await p4.click('#fuerEltern');
  await p4.waitForSelector('#lesetestFertig');
  const elternText = await p4.evaluate(() => document.getElementById('view').textContent);
  if (!/keine Diagnose/i.test(elternText)) throw new Error('Eltern-Ergebnis nennt nicht ausdrücklich "keine Diagnose"');
  await p4.screenshot({ path: `${P6}/eltern-ergebnis.png`, fullPage: true });
  await p4.screenshot({ path: `${S}/lt-6-eltern-ergebnis.png`, fullPage: true });
  await p4.click('#lesetestFertig');
  await p4.waitForSelector('#zumLesetest');
  console.log('Lesetest-Ergebnis für Eltern zeigt Kennzahlen und "keine Diagnose" ✅');

  if (fehler4.length) throw new Error('Lesetest-Block: JS-Fehler:\n' + fehler4.join('\n'));
  console.log('Lesetest-Block: keine JS-Fehler ✅');
  await b4.close();
}

await b.close();
