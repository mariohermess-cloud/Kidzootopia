/* Einmalige Qualitätsmessung der Texterkennung (OCR) - KEIN Pflichttest.

   Anders als tests/texterkennung.mjs (rein, node-tauglich, gehört zur
   Pflichtliste) braucht dieses Skript zwei schwere Werkzeuge, die nicht bei
   jedem `npm test` laufen sollen:
     1. Playwright + einen echten Browser, um drei typische Schultext-Seiten
        (und eine "Handyfoto"-Näherung davon) als Bild zu rendern.
     2. Tesseract.js in node, um dieselbe Erkennung zu messen, die im
        Browser laeuft - mit derselben Sprachdatei aus vendor/tesseract/.

   WICHTIGE EINSCHRÄNKUNG, ehrlich benannt: In Node laedt Tesseract.js den
   Rechenkern (WASM) IMMER ueber das npm-Paket "tesseract.js-core", nicht
   ueber corePath - das ist in der Bibliothek selbst so fest verdrahtet
   (worker-script/node/getCore.js ignoriert corePath). Nur die Sprachdatei
   (deu.traineddata.gz) laesst sich hier wirklich aus vendor/tesseract/
   nachweisen - das reicht aber, um zu pruefen: FUNKTIONIERT die exakte
   Datei, die die App auch im Browser laedt? Die Rechengenauigkeit (WASM-
   Kern) ist zwischen node und Browser identisch (derselbe Tesseract-Code),
   nur die Ladeart unterscheidet sich.

   Aufruf:  npm install tesseract.js tesseract.js-core @tesseract.js-data/deu --no-save
            node tests/ocr-qualitaet.mjs
   (Die drei Pakete sind bewusst NICHT in package.json - sie werden nur für
   diese einmalige Messung gebraucht, nicht für die App selbst.) */

import { chromium } from 'playwright';
import { writeFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { bereinigen } from '../js/textaufbereitung.js';

const VENDOR_LANGPATH = path.resolve('vendor/tesseract');

/* -------------------------------------------------------------- Testseiten */

const GRUNDSTIL = `
  <meta charset="utf-8">
  <style>
    html,body{margin:0;padding:0;background:#fff}
    body{padding:40px;box-sizing:border-box}
    .seite{width:820px;color:#111}
  </style>`;

const SEITEN = [
  {
    name: 'Fibel groß (Klasse 1)',
    soll: 'Der Hund läuft schnell. Er sieht eine Katze. Beide sind Freunde.',
    html: `${GRUNDSTIL}
      <div class="seite" style="font-family:Verdana,Arial,sans-serif;font-size:38px;line-height:1.5;letter-spacing:1px">
        Der Hund läuft schnell. Er sieht eine Katze. Beide sind Freunde.
      </div>`
  },
  {
    name: 'Schulbuch normal (Fließtext, mit Silbentrennung am Zeilenende)',
    soll: 'Zuerst war es ein winziges Ei, dann eine hungrige Raupe. Die Raupe fraß Blätter, bis sie dick und rund war. Danach spann sie sich ein und wartete. Eines Morgens brach die Hülle auf, und ein Schmetterling faltete seine Flügel in die Sonne.',
    html: `${GRUNDSTIL}
      <div class="seite" lang="de" style="font-family:Georgia,'Times New Roman',serif;font-size:20px;line-height:1.5;width:520px;text-align:justify;hyphens:auto;-webkit-hyphens:auto">
        Zuerst war es ein winziges Ei, dann eine hungrige Raupe. Die Raupe fraß Blätter, bis sie dick und rund war. Danach spann sie sich ein und wartete. Eines Morgens brach die Hülle auf, und ein Schmetterling faltete seine Flügel in die Sonne.
      </div>`
  },
  {
    name: 'Arbeitsblatt, zwei Spalten',
    soll: 'Eins heißt eins. Zwei heißt zwei. Drei heißt drei. Vier heißt vier. Fünf heißt fünf. Sechs heißt sechs. Sieben heißt sieben. Acht heißt acht. Neun heißt neun. Zehn heißt zehn.',
    html: `${GRUNDSTIL}
      <div class="seite" style="font-family:Arial,sans-serif;font-size:22px;line-height:1.6;column-count:2;column-gap:60px;width:760px">
        Eins heißt eins.<br>Zwei heißt zwei.<br>Drei heißt drei.<br>Vier heißt vier.<br>Fünf heißt fünf.<br>
        Sechs heißt sechs.<br>Sieben heißt sieben.<br>Acht heißt acht.<br>Neun heißt neun.<br>Zehn heißt zehn.
      </div>`
  }
];

/* Vierte Variante: dieselbe Schulbuch-Seite wie oben, aber leicht gedreht
   und unscharf - eine grobe Näherung an ein Handyfoto (kein perfekter
   Scan, kein Stativ, kein Blitz). */
const HANDYFOTO = {
  name: 'Schulbuch normal, als "Handyfoto" (gedreht + unscharf)',
  soll: SEITEN[1].soll,
  html: `${GRUNDSTIL}
    <div class="seite" lang="de" style="font-family:Georgia,'Times New Roman',serif;font-size:20px;line-height:1.5;width:520px;text-align:justify;hyphens:auto;-webkit-hyphens:auto;transform:rotate(2.5deg);filter:blur(0.6px);transform-origin:center">
      Zuerst war es ein winziges Ei, dann eine hungrige Raupe. Die Raupe fraß Blätter, bis sie dick und rund war. Danach spann sie sich ein und wartete. Eines Morgens brach die Hülle auf, und ein Schmetterling faltete seine Flügel in die Sonne.
    </div>`
};

/* --------------------------------------------------------- Levenshtein-CER */

/* Zeichen-Fehlerrate: Editierdistanz geteilt durch die Länge des Solltexts.
   Standard-Metrik für OCR-Qualität (z. B. ICDAR-Wettbewerbe). */
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const zeile = new Array(n + 1);
  for (let j = 0; j <= n; j++) zeile[j] = j;
  for (let i = 1; i <= m; i++) {
    let vorherige = zeile[0];
    zeile[0] = i;
    for (let j = 1; j <= n; j++) {
      const temp = zeile[j];
      zeile[j] = a[i - 1] === b[j - 1]
        ? vorherige
        : 1 + Math.min(vorherige, zeile[j], zeile[j - 1]);
      vorherige = temp;
    }
  }
  return zeile[n];
}

const cer = (erkannt, soll) => soll.length ? levenshtein(erkannt.trim(), soll) / soll.length : 0;

/* -------------------------------------------------------------------- Lauf */

async function screenshot(page, html, datei) {
  await page.setContent(html, { waitUntil: 'load' });
  await page.locator('.seite').screenshot({ path: datei });
}

async function main() {
  const chromePath = process.env.CHROME_PATH;
  const browser = await chromium.launch(chromePath ? { executablePath: chromePath } : {});
  const page = await browser.newPage({ viewport: { width: 900, height: 700 } });
  const tempdir = await mkdtemp(path.join(tmpdir(), 'ocr-qualitaet-'));

  const { default: Tesseract } = await import('tesseract.js');
  const worker = await Tesseract.createWorker('deu', undefined, {
    langPath: VENDOR_LANGPATH,
    gzip: true,
    /* Ohne das würde node "./deu.traineddata" mitten ins Repo schreiben
       (Standard-cachePath ist das aktuelle Arbeitsverzeichnis). */
    cacheMethod: 'none'
  });

  const faelle = [...SEITEN, HANDYFOTO];
  const ergebnisse = [];

  for (let i = 0; i < faelle.length; i++) {
    const fall = faelle[i];
    const datei = path.join(tempdir, `seite${i}.png`);
    await screenshot(page, fall.html, datei);

    const start = Date.now();
    const { data } = await worker.recognize(datei);
    const dauerMs = Date.now() - start;

    const roh = data.text.replace(/\s+/g, ' ').trim();
    const nachBereinigen = bereinigen(data.text).replace(/\n\n/g, ' ').replace(/\s+/g, ' ').trim();

    const cerVor = cer(roh, fall.soll);
    const cerNach = cer(nachBereinigen, fall.soll);
    ergebnisse.push({ name: fall.name, soll: fall.soll, roh, nachBereinigen, cerVor, cerNach, dauerMs });
  }

  await worker.terminate();
  await browser.close();
  await rm(tempdir, { recursive: true, force: true });

  console.log('OCR-Qualitätsmessung (Zeichen-Fehlerrate, CER = Editierdistanz / Länge Solltext)\n');
  for (const e of ergebnisse) {
    console.log(`── ${e.name} (${e.dauerMs} ms) ──`);
    console.log(`  Soll:            ${e.soll}`);
    console.log(`  Erkannt (roh):   ${e.roh}`);
    console.log(`  Nach bereinigen: ${e.nachBereinigen}`);
    console.log(`  CER vorher:  ${(e.cerVor * 100).toFixed(1)} %`);
    console.log(`  CER nachher: ${(e.cerNach * 100).toFixed(1)} %`);
    console.log('');
  }

  const schnitt = arr => arr.reduce((a, b) => a + b, 0) / arr.length;
  console.log(`Durchschnitt CER vorher:  ${(schnitt(ergebnisse.map(e => e.cerVor)) * 100).toFixed(1)} %`);
  console.log(`Durchschnitt CER nachher: ${(schnitt(ergebnisse.map(e => e.cerNach)) * 100).toFixed(1)} %`);
}

main().catch(e => { console.error(e); process.exit(1); });
