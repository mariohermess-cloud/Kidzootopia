/* Führt alle Fachtests aus: jedes Skript "test:*" aus package.json außer
   test:e2e (braucht Playwright und laufenden Server). Neue Tests werden
   automatisch mitgenommen, sobald sie als "test:<name>" in package.json stehen.
   Aufruf: npm test   (Exit 0 = alle bestanden) */
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const skripte = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')).scripts;
const namen = Object.keys(skripte).filter((n) => n.startsWith('test:') && n !== 'test:e2e').sort();
const fehler = [];
for (const n of namen) {
  const teile = skripte[n].split(/\s+/);
  if (teile[0] !== 'node') { fehler.push(`${n}: kein node-Skript (${skripte[n]})`); continue; }
  const r = spawnSync(process.execPath, teile.slice(1), { stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8' });
  if (r.status === 0) console.log(`ok   ${n}`);
  else { fehler.push(n); console.log(`FEHL ${n} (Exit ${r.status})\n${(r.stdout + r.stderr).trim().split('\n').slice(-15).join('\n')}`); }
}
console.log(`\n${namen.length - fehler.length} von ${namen.length} Fachtests bestanden.`);
if (fehler.length) { console.log(`Fehlgeschlagen: ${fehler.join(', ')}`); process.exit(1); }
