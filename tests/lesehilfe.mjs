/* Prueft die Lesehilfe bei Legasthenie/LRS (js/lesehilfe.js): reine Logik,
   ohne DOM. Die Anzeige selbst (CSS-Klassen am Body, CSS-Variablen an
   documentElement) prueft tests/e2e.mjs per Screenshot. */

import { normalisiere, cssVariablen, klassen, zeilenGruppieren,
         LRS_VOREINSTELLUNG, STANDARD } from '../js/lesehilfe.js';
import { textInSilben } from '../js/silben.js';
import { GEN, baueAufgabe } from '../js/generators.js';
import { silbenHtml } from '../js/ui.js';

let fehler = 0;
const pruefe = (bedingung, text) => {
  console.log(`${bedingung ? '✅' : '❌'} ${text}`);
  if (!bedingung) fehler++;
};

/* --------------------------------------------------------- normalisiere() */

pruefe(JSON.stringify(normalisiere(undefined)) === JSON.stringify(STANDARD),
  'ohne jede Angabe ergibt sich der Standard (heutiges Aussehen)');
pruefe(JSON.stringify(normalisiere({})) === JSON.stringify(STANDARD),
  'ein leeres Objekt ergibt ebenfalls den Standard');
pruefe(normalisiere({ an: true }).an === true, 'an wird übernommen');
pruefe(normalisiere({ groesse: 99 }).groesse === STANDARD.groesse,
  'ein ungültiger Wert für groesse fällt auf den Standard zurück');
pruefe(normalisiere({ abstand: -1 }).abstand === STANDARD.abstand,
  'ein ungültiger Wert für abstand fällt auf den Standard zurück');
pruefe(normalisiere({ zeile: 5 }).zeile === STANDARD.zeile,
  'ein ungültiger Wert für zeile fällt auf den Standard zurück');
pruefe(normalisiere({ farben: 'lila' }).farben === STANDARD.farben,
  'ein ungültiger Wert für farben fällt auf den Standard zurück');
pruefe(normalisiere({ groesse: 3, abstand: 2, zeile: 2, farben: 'blaurot' }).groesse === 3,
  'gültige Werte bleiben erhalten (groesse)');
pruefe(normalisiere({ boegen: 'ja' }).boegen === false,
  'boegen wird nur bei genau true wahr (kein truthy-String)');
/* Fehlende Einzelfelder ergänzen – wichtig für ältere, teilweise gespeicherte
   Profile (siehe migriere() in js/store.js). */
pruefe(normalisiere({ an: true, groesse: 2 }).zeile === STANDARD.zeile,
  'fehlende Einzelfelder werden ergänzt, nicht das ganze Objekt verworfen');

/* --------------------------------------------------------- cssVariablen() */

const ausVars = cssVariablen({ an: false, groesse: 3, abstand: 2, zeile: 2 });
pruefe(ausVars['--lese-groesse'] === '1' && ausVars['--lese-buchstabe'] === '0.01em'
  && ausVars['--lese-wort'] === '0.15em' && ausVars['--lese-zeile'] === '1',
  'ausgeschaltet ergibt neutrale Werte – exakt das heutige Aussehen, egal was sonst gesetzt ist');

const anVars = cssVariablen({ an: true, groesse: 2, abstand: 1, zeile: 2 });
pruefe(Number(anVars['--lese-groesse']) > 1, 'eingeschaltet: Schrift wird größer');
pruefe(anVars['--lese-buchstabe'] !== '0.01em', 'eingeschaltet: Buchstabenabstand wächst');
pruefe(anVars['--lese-wort'] !== '0.15em', 'eingeschaltet: Wortabstand wächst');
pruefe(Number(anVars['--lese-zeile']) > 1, 'eingeschaltet: Zeilenabstand wächst');

const lrsVars = cssVariablen(LRS_VOREINSTELLUNG);
pruefe(Number(lrsVars['--lese-groesse']) > 1, 'LRS-Voreinstellung: größere Schrift');

/* --------------------------------------------------------------- klassen() */

pruefe(klassen({ an: false }).length === 0, 'ausgeschaltet: keine Body-Klassen');
pruefe(klassen(undefined).length === 0, 'kein Profil/keine Angabe: keine Body-Klassen');
const kl = klassen({ an: true, farben: 'blaurot', boegen: true, fenster: true });
pruefe(kl.includes('lh-an'), 'eingeschaltet: lh-an ist dabei');
pruefe(kl.includes('lh-blaurot'), 'Blau/Rot-Silben ergeben lh-blaurot');
pruefe(kl.includes('lh-boegen'), 'Silbenbögen ergeben lh-boegen');
pruefe(kl.includes('lh-fenster'), 'Lesefenster ergibt lh-fenster');
const klWechsel = klassen({ an: true, farben: 'wechsel', boegen: false, fenster: false });
pruefe(klWechsel.includes('lh-an') && !klWechsel.some(k => k !== 'lh-an'),
  'mit den Standard-Einzeleinstellungen gibt es außer lh-an keine weitere Klasse');

/* ---------------------------------------------------- LRS-Voreinstellung */

pruefe(LRS_VOREINSTELLUNG.an === true, 'LRS-Voreinstellung schaltet die Lesehilfe ein');
pruefe(LRS_VOREINSTELLUNG.groesse >= 2, 'LRS-Voreinstellung: größere Schrift');
pruefe(LRS_VOREINSTELLUNG.farben === 'blaurot', 'LRS-Voreinstellung: Blau/Rot-Silben');
pruefe(LRS_VOREINSTELLUNG.boegen === true, 'LRS-Voreinstellung: Silbenbögen an');
pruefe(LRS_VOREINSTELLUNG.fenster === true, 'LRS-Voreinstellung: Lesefenster an');
pruefe(LRS_VOREINSTELLUNG.aufgabenSilben === true, 'LRS-Voreinstellung: auch Aufgabentexte in Silben');
pruefe(JSON.stringify(normalisiere(LRS_VOREINSTELLUNG)) === JSON.stringify(LRS_VOREINSTELLUNG),
  'die LRS-Voreinstellung besteht selbst die Normalisierung unverändert');

/* --------------------------------------------------- zeilenGruppieren() */

pruefe(JSON.stringify(zeilenGruppieren([])) === '[]', 'keine Wörter ergeben keine Zeilen');
pruefe(JSON.stringify(zeilenGruppieren([0, 0, 0])) === JSON.stringify([0, 0, 0]),
  'gleiche Höhe bleibt eine Zeile');
pruefe(JSON.stringify(zeilenGruppieren([0, 1, 2, 40, 41, 80])) === JSON.stringify([0, 0, 0, 1, 1, 2]),
  'deutlich unterschiedliche Höhen ergeben neue Zeilen, kleine Rundungsunterschiede nicht');
pruefe(JSON.stringify(zeilenGruppieren([100, 101, 99])) === JSON.stringify([0, 0, 0]),
  'Reihenfolge ohne großen Sprung bleibt in derselben Zeile, auch bei kleinem Auf und Ab');
const vieleZeilen = zeilenGruppieren([0, 40, 80, 120]);
pruefe(new Set(vieleZeilen).size === 4, 'vier klar unterschiedliche Höhen ergeben vier Zeilen');

/* ------------------------- Migration alter Profile (ohne lesehilfe-Feld) */

/* Simuliert genau das, was migriere() in js/store.js mit einem alten Profil
   macht: p.lesehilfe = normalisiere(p.lesehilfe) – bei einem Profil, das das
   Feld noch nie kannte, muss exakt der heutige Zustand herauskommen. */
const altesProfil = { name: 'Altes Kind', stats: {} };
altesProfil.lesehilfe = normalisiere(altesProfil.lesehilfe);
pruefe(JSON.stringify(altesProfil.lesehilfe) === JSON.stringify(STANDARD),
  'ein Profil ohne lesehilfe-Feld bekommt bei der Migration genau den Standard');

const teilweiseAltesProfil = { lesehilfe: { an: true, groesse: 2 } };
teilweiseAltesProfil.lesehilfe = normalisiere(teilweiseAltesProfil.lesehilfe);
pruefe(teilweiseAltesProfil.lesehilfe.an === true && teilweiseAltesProfil.lesehilfe.groesse === 2
  && teilweiseAltesProfil.lesehilfe.zeile === STANDARD.zeile,
  'ein Profil mit nur teilweise gespeicherter Lesehilfe bekommt die fehlenden Felder ergänzt');

/* --------------------- Textgleichheit der Silbierung an echten Aufgaben --
   Der sichtbare Text darf sich durch die Silbenfärbung nicht verändern -
   kein Zeichen darf verloren gehen oder dazukommen. Geprüft an echten,
   generierten Aufgabentexten (Zahlen, Rechenzeichen, Satzzeichen, Emoji in
   a.bild sind hier nicht Teil von a.frage, aber Sonderzeichen wie %, °, ×
   kommen in Sachaufgaben durchaus vor). */
const aufgabenTexte = [];
for (const zielId of Object.keys(GEN)) {
  for (const weg of Object.keys(GEN[zielId])) {
    for (let level = 1; level <= 5 && aufgabenTexte.length < 220; level++) {
      const a = baueAufgabe(zielId, weg, level);
      if (a.frage) aufgabenTexte.push(a.frage);
      if (Array.isArray(a.optionen)) a.optionen.forEach(o => aufgabenTexte.push(String(o)));
    }
  }
  if (aufgabenTexte.length >= 220) break;
}
pruefe(aufgabenTexte.length >= 100, `genug echte Aufgabentexte zum Prüfen gesammelt (${aufgabenTexte.length})`);

let textAbweichung = 0;
for (const text of aufgabenTexte) {
  const stuecke = textInSilben(text);
  const wiederhergestellt = stuecke
    .filter(s => s.typ !== 'wortende')
    .map(s => s.text).join('');
  if (wiederhergestellt !== text) {
    textAbweichung++;
    if (textAbweichung <= 3) console.log(`   Abweichung: "${text}" -> "${wiederhergestellt}"`);
  }
}
pruefe(textAbweichung === 0,
  `Silbierung verändert den sichtbaren Text bei keinem der ${aufgabenTexte.length} Aufgabentexte`);

/* --------------------------------------------- ui.js: silbenHtml() direkt --
   Prüft die tatsächlich gerenderte HTML-Zeichenkette (nicht nur textInSilben
   darunter) - genau hier saß der Fehler: Leerraum (auch Zeilenumbrüche!)
   wurde beim Bauen des HTML zu einem einzelnen Leerzeichen verschmolzen.
   Ein Browser gibt bei .textContent trotzdem den ECHTEN Text der Textknoten
   zurück - "html_ohneTags" hier simuliert genau das per Regex, ohne DOM. */
const htmlOhneTags = html => html.replace(/<[^>]+>/g, '');

const mitZeilenumbruch = '🥁 Klatsche die Silben: Schu · le\nWie viele Silben hat das Wort?';
pruefe(htmlOhneTags(silbenHtml(mitZeilenumbruch)) === mitZeilenumbruch,
  'silbenHtml() erhält einen echten Zeilenumbruch (\\n) unverändert');

const mehrfacherLeerraum = 'Erste Zeile\n\nDritte Zeile   mit vielen Leerzeichen';
pruefe(htmlOhneTags(silbenHtml(mehrfacherLeerraum)) === mehrfacherLeerraum,
  'silbenHtml() erhält auch mehrere Zeilenumbrüche und mehrfache Leerzeichen unverändert');

/* Bögen (Klasse "sil", ohne "nobogen") nur dort, wo wirklich ein Buchstabe
   steckt - eine einzelne Ziffer oder ein Satzzeichen als "Silbe" darf keinen
   Silbenbogen bekommen (siehe .lh-boegen .sil:not(.nobogen) in app.css). */
const mitZiffernUndEmoji = silbenHtml('🥁 Lies: 3 Häuser');
const buchstabenSilben = [...mitZiffernUndEmoji.matchAll(/<span class="sil s\d( nobogen)?"[^>]*>([^<]*)<\/span>/g)];
pruefe(buchstabenSilben.length > 0, 'silbenHtml() erzeugt überhaupt Silben-Spans für diesen Beispieltext');
for (const [, nobogen, inhalt] of buchstabenSilben) {
  const hatBuchstabe = /\p{L}/u.test(inhalt);
  pruefe(hatBuchstabe ? !nobogen : !!nobogen,
    `Silbe "${inhalt}" bekommt genau dann "nobogen", wenn sie keinen Buchstaben enthält`);
}

console.log(fehler === 0 ? '\nLesehilfe ist brauchbar ✅' : `\n${fehler} Problem(e) ❌`);
process.exit(fehler === 0 ? 0 : 1);
