/* Durchklick-Test: Profil anlegen -> Talent-Test -> Mission -> alle Tabs -> Neustart.
   Start: python3 -m http.server 8765 &  dann  node tests/e2e.mjs ./screens */
import { chromium } from 'playwright';
const b = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
const p = await b.newPage({ viewport:{width:390,height:844}, deviceScaleFactor:2 });
const fehler = [];
p.on('pageerror', e => fehler.push('pageerror: '+e.message));
p.on('console', m => { if (m.type()==='error') fehler.push('console: '+m.text()); });
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
    } else {                                   // freies Blatt
      p.once('dialog', d => d.accept('Testbild'));
      await p.mouse.move(k.x + k.w*.3, k.y + k.h*.3);
      await p.mouse.down();
      for (let i=0;i<20;i++) await p.mouse.move(k.x + k.w*(.3+i*.02), k.y + k.h*(.3+Math.sin(i/3)*.1));
      await p.mouse.up();
    }
    await p.click('#brettFertig');
    return;
  }
  if (await p.$('.teil[data-e]')) { let n=0; while (await p.$('.teil[data-e]') && n++<12) await p.click('.teil[data-e]'); return; }
  if (await p.$('#eingabe')) { await p.fill('#eingabe','42'); await p.click('#pruefen'); return; }
  await p.click('.choice');
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
  const kasten = await p.$eval('#brett', el => {
    const r = el.getBoundingClientRect(); return { x:r.x, y:r.y, w:r.width, h:r.height };
  });
  // die Vorlage direkt aus der Aufgabe holen und exakt nachfahren
  const linien = await p.evaluate(() => window.__vorlage || null);
  if (!linien) throw new Error('Vorlage nicht zugänglich (Testhaken fehlt)');
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
// Wiederherstellung aus der Zweitkopie prüfen
p.once('dialog', d => d.accept());
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
console.log(fehler.length ? 'FEHLER:\n'+fehler.join('\n') : 'keine JS-Fehler ✅');
await b.close();
