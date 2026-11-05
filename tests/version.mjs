/* Prueft, dass die angezeigte Fassung mit der wirklich ausgelieferten uebereinstimmt.

   Der haeufigste Fehler bei einer PWA: Man aendert etwas, vergisst aber den
   Cache-Namen im Service Worker. Dann laedt kein Geraet die Aenderung – und der
   Eltern-Bereich behauptet trotzdem, alles sei aktuell. Genau das faengt dieser
   Test ab, bevor es auf die Geraete geht. */

import { readFileSync, readdirSync } from 'node:fs';
import { NUMMER, STAND, VERLAUF, AKTUELL } from '../js/version.js';

let fehler = 0;
const pruefe = (bedingung, text) => {
  console.log(`${bedingung ? '✅' : '❌'} ${text}`);
  if (!bedingung) fehler++;
};

const sw = readFileSync(new URL('../sw.js', import.meta.url), 'utf8');
const cache = sw.match(/const CACHE = '([^']+)'/)?.[1];

pruefe(cache === `kidzootopia-v${NUMMER}`,
  `Service-Worker-Cache (${cache}) passt zu js/version.js (Version ${NUMMER})`);

/* Jede Datei, die die App laedt, muss auch offline verfuegbar sein. */
const dateien = sw.match(/const DATEIEN = \[([\s\S]*?)\]/)[1];
const module = readFileSync(new URL('../js/ui.js', import.meta.url), 'utf8')
  .match(/from '\.\/([a-z_]+\.js)'/g).map(z => z.match(/'\.\/(.+)'/)[1]);
const fehlend = module.filter(m => !dateien.includes(`./js/${m}`));
pruefe(fehlend.length === 0,
  `alle von ui.js geladenen Module sind im Offline-Speicher${fehlend.length ? ': fehlt ' + fehlend.join(', ') : ''}`);

/* Veroeffentlicht wird nur, was der Kopierschritt in pages.yml nach _site legt.
   Jede Offline-Datei aus sw.js muss darin enthalten sein, sonst scheitert addAll. */
const workflow = readFileSync(new URL('../.github/workflows/pages.yml', import.meta.url), 'utf8');
const kopie = workflow.match(/cp -r (.+) _site\//)?.[1].trim().split(/\s+/) || [];
const offline = [...dateien.matchAll(/'\.\/([^']*)'/g)].map(z => z[1]).filter(Boolean);
/* Zur Laufzeit nachgeladene Ordner (z. B. ../vendor/tesseract/ in js/texterkennung.js) */
const laufzeit = [...new Set(readdirSync(new URL('../js/', import.meta.url))
  .filter(f => f.endsWith('.js'))
  .flatMap(f => [...readFileSync(new URL(`../js/${f}`, import.meta.url), 'utf8').matchAll(/['`]\.\.\/([a-z_-]+)\//g)].map(z => z[1])))];
const nichtKopiert = [...offline, ...laufzeit].filter(f => !kopie.includes(f.split('/')[0]));
pruefe(kopie.length > 0 && nichtKopiert.length === 0,
  `alle Offline-Dateien werden auf Pages veroeffentlicht (pages.yml)${nichtKopiert.length ? ': fehlt ' + nichtKopiert.join(', ') : ''}`);

pruefe(/^\d{2}\.\d{2}\.\d{4}$/.test(STAND), `Stand ist ein Datum (${STAND})`);
pruefe(AKTUELL.nr === NUMMER, 'der Verlauf beginnt mit der aktuellen Fassung');
pruefe(AKTUELL.stand === STAND, 'Stand oben und im Verlauf sind gleich');

const nummern = VERLAUF.map(v => v.nr);
pruefe(nummern.every((n, i) => i === 0 || n < nummern[i - 1]),
  `der Verlauf ist absteigend sortiert (${nummern.join(', ')})`);
pruefe(new Set(nummern).size === nummern.length, 'keine Fassung doppelt im Verlauf');
pruefe(VERLAUF.every(v => v.was.length > 0 && v.was.every(w => w.length > 10)),
  'jede Fassung nennt, was sich geaendert hat');

/* Die Anzeige muss aus version.js kommen, nicht fest im Text stehen. */
const ui = readFileSync(new URL('../js/ui.js', import.meta.url), 'utf8');
pruefe(ui.includes("from './version.js'"), 'die Oberflaeche liest die Fassung aus version.js');
pruefe(!/Version 1[0-9](?![$}])/.test(ui.replace(/Version \$\{[^}]+\}/g, '')),
  'keine fest eingetippte Versionsnummer in der Oberflaeche');

console.log(fehler === 0
  ? '\nAngezeigte und ausgelieferte Fassung stimmen ueberein ✅'
  : `\n${fehler} Problem(e) ❌`);
process.exit(fehler === 0 ? 0 : 1);
