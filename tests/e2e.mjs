/* Durchklick-Test: Profil anlegen -> Talent-Test -> Mission -> alle Tabs -> Neustart.
   Start: python3 -m http.server 8765 &  dann  node tests/e2e.mjs ./screens */
import { chromium } from 'playwright';
const b = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
const p = await b.newPage({ viewport:{width:390,height:844}, deviceScaleFactor:2 });
const fehler = [];
p.on('pageerror', e => fehler.push('pageerror: '+e.message));
p.on('console', m => { if (m.type()==='error') fehler.push('console: '+m.text()); });
const S = process.argv[2] || '.';
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

const teilDurchspielen = async () => {
  for (let n = 0; n < 60; n++) {
    if (await p.$('#weiterTeil')) return 'pause';
    if (await p.$('#losgehts')) return 'fertig';
    if (await p.$('.scale [data-v]')) { await p.click(`.scale [data-v="${[4,3,2,1][n%4]}"]`); continue; }
    if (await p.$('.choice')) { await p.click('.choice'); continue; }
    return 'unbekannt';
  }
  return 'zu-lang';
};

let zustand = await teilDurchspielen();
let teile = 1;
while (zustand === 'pause') {
  if (teile === 1) await p.screenshot({path:S+'/2-teil-pause.png', fullPage:true});
  await p.click('#weiterTeil');
  zustand = await teilDurchspielen();
  teile++;
}
if (zustand !== 'fertig') throw new Error('Talent-Test endete unerwartet: ' + zustand);
console.log('Testteile durchgespielt:', teile);
await p.waitForSelector('#losgehts');
await p.screenshot({path:S+'/3-radar.png', fullPage:true});
await p.click('#losgehts');
await p.waitForSelector('#mission');
await p.screenshot({path:S+'/4-home.png', fullPage:true});

// Mission spielen: 8 Aufgaben
await p.click('#mission');
for (let i=0;i<8;i++){
  await p.waitForSelector('.task');
  const frage = await p.textContent('.task');
  if (await p.$('.teil[data-e]')) {                 // Puzzle: alle Teile der Reihe nach antippen
    let sicherung = 0;
    while (await p.$('.teil[data-e]') && sicherung++ < 12) await p.click('.teil[data-e]');
  }
  else if (await p.$('#eingabe')) { await p.fill('#eingabe','42'); await p.click('#pruefen'); }
  else { await p.click('.choice'); }
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
  if (await p.$('.teil[data-e]')) { let k=0; while (await p.$('.teil[data-e]') && k++<12) await p.click('.teil[data-e]'); }
  else if (await p.$('#eingabe')) { await p.fill('#eingabe','1'); await p.click('#pruefen'); }
  else await p.click('.choice');
  await p.waitForSelector('#weiter');
  if (ziel === 'knacknuss' && !await p.$('.quelle')) throw new Error('Herkunftsangabe fehlt');
  await p.click('#raus');
  await p.waitForSelector('#mission');
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
await p.click('[data-fach="deutsch"]');
await p.waitForSelector('.task');
if (await p.$('#eingabe')) { await p.fill('#eingabe','1'); await p.click('#pruefen'); } else await p.click('.choice');
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
  if (await p.$('#eingabe')) { await p.fill('#eingabe','1'); await p.click('#pruefen'); }
  else await p.click('.choice');
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
await p.waitForSelector('#holen');                                   // Startbildschirm mit Hilfe
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
console.log(fehler.length ? 'FEHLER:\n'+fehler.join('\n') : 'keine JS-Fehler ✅');
await b.close();
