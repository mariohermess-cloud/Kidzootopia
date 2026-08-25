/* Prueft die Silbentrennung an handgeprueften Woertern.

   Warum so ausfuehrlich: Die Silbenfaerbung ist nur dann eine Hilfe, wenn sie
   stimmt. Faerbt die App "Son-ne-nbl-ume", verwirrt sie das Kind mehr, als sie
   ihm hilft - schlimmer als gar keine Faerbung. Regelbasierte Trennung trifft
   nie 100 %; deshalb wird die Quote hier ausgewiesen und nicht geschoent, und
   jeder Fehlschlag steht mit Soll und Ist im Protokoll.

   Die Sollwerte sind SPRECHSILBEN (Silbenboegen), nicht Worttrennung am
   Zeilenende. Beides faellt meistens, aber nicht immer zusammen. */

import { silben, textInSilben, silbenZahl, wortZahl } from '../js/silben.js';

const PROBEN = [
  // einfache Zweisilber: ein Konsonant geht nach hinten
  ['lesen', 'le-sen'], ['Nase', 'Na-se'], ['Blume', 'Blu-me'], ['Kater', 'Ka-ter'],
  ['Vogel', 'Vo-gel'], ['Regen', 'Re-gen'], ['Wagen', 'Wa-gen'], ['malen', 'ma-len'],
  ['Hase', 'Ha-se'], ['Besen', 'Be-sen'], ['Ofen', 'O-fen'], ['Wiese', 'Wie-se'],
  // zwei Konsonanten: der letzte geht nach hinten
  ['Kinder', 'Kin-der'], ['Winter', 'Win-ter'], ['Sonne', 'Son-ne'], ['Mutter', 'Mut-ter'],
  ['Butter', 'But-ter'], ['Wasser', 'Was-ser'], ['Zimmer', 'Zim-mer'], ['Hammer', 'Ham-mer'],
  ['Garten', 'Gar-ten'], ['Wolke', 'Wol-ke'], ['Karte', 'Kar-te'], ['Ampel', 'Am-pel'],
  ['Finger', 'Fin-ger'], ['Onkel', 'On-kel'], ['Mantel', 'Man-tel'], ['Nadel', 'Na-del'],
  // st und sp bleiben am Silbenanfang zusammen
  ['Fenster', 'Fens-ter'], ['Meister', 'Meis-ter'], ['Muster', 'Mus-ter'],
  ['Schwester', 'Schwes-ter'], ['Kloster', 'Klos-ter'],
  // Digrafen bleiben ganz
  ['Bücher', 'Bü-cher'], ['lachen', 'la-chen'], ['Kuchen', 'Ku-chen'], ['Sachen', 'Sa-chen'],
  ['Zucker', 'Zu-cker'], ['Decke', 'De-cke'], ['Brücke', 'Brü-cke'], ['Jacke', 'Ja-cke'],
  ['waschen', 'wa-schen'], ['Flasche', 'Fla-sche'], ['Tasche', 'Ta-sche'],
  ['Finger', 'Fin-ger'], ['singen', 'sin-gen'], ['Junge', 'Jun-ge'],
  // Diphthonge sind ein Kern
  ['Auge', 'Au-ge'], ['Eule', 'Eu-le'], ['Baum', 'Baum'], ['Haus', 'Haus'],
  ['Eimer', 'Ei-mer'], ['Bauer', 'Bau-er'], ['Feuer', 'Feu-er'], ['Mauer', 'Mau-er'],
  ['heute', 'heu-te'], ['Leute', 'Leu-te'], ['Beute', 'Beu-te'],
  // ie ist ein Kern, io nicht
  ['Biene', 'Bie-ne'], ['Wiese', 'Wie-se'], ['spielen', 'spie-len'], ['Ziege', 'Zie-ge'],
  ['Radio', 'Ra-di-o'], ['Violine', 'Vi-o-li-ne'],
  // Vorsilben
  ['verstehen', 'ver-ste-hen'], ['bekommen', 'be-kom-men'], ['gelesen', 'ge-le-sen'],
  ['erzählen', 'er-zäh-len'], ['besuchen', 'be-su-chen'], ['gefunden', 'ge-fun-den'],
  ['vergessen', 'ver-ges-sen'], ['entdecken', 'ent-de-cken'], ['zerbrechen', 'zer-bre-chen'],
  ['ankommen', 'an-kom-men'], ['aufstehen', 'auf-ste-hen'], ['ausgehen', 'aus-ge-hen'],
  ['mitnehmen', 'mit-neh-men'], ['nachdenken', 'nach-den-ken'],
  ['unterwegs', 'un-ter-wegs'], ['zusammen', 'zu-sam-men'],
  // Zusammensetzungen
  ['Sonnenblume', 'Son-nen-blu-me'], ['Haustür', 'Haus-tür'], ['Schulhaus', 'Schul-haus'],
  ['Kinderzimmer', 'Kin-der-zim-mer'], ['Klassenzimmer', 'Klas-sen-zim-mer'],
  ['Sommerferien', 'Som-mer-fe-ri-en'], ['Apfelbaum', 'Ap-fel-baum'],
  ['Regenbogen', 'Re-gen-bo-gen'], ['Taschenlampe', 'Ta-schen-lam-pe'],
  ['Feuerwehr', 'Feu-er-wehr'], ['Bilderbuch', 'Bil-der-buch'],
  // Verkleinerung und Endungen
  ['Mädchen', 'Mäd-chen'], ['Häuschen', 'Häus-chen'], ['Bächlein', 'Bäch-lein'],
  ['freundlich', 'freund-lich'], ['glücklich', 'glück-lich'], ['Frühling', 'Früh-ling'],
  ['Zeugnis', 'Zeug-nis'], ['langsam', 'lang-sam'], ['essbar', 'ess-bar'],
  // Einsilber bleiben ganz
  ['Baum', 'Baum'], ['Hund', 'Hund'], ['schwarz', 'schwarz'], ['Strumpf', 'Strumpf'],
  ['Herbst', 'Herbst'], ['Pferd', 'Pferd'], ['Buch', 'Buch'], ['Stuhl', 'Stuhl'],
  ['und', 'und'], ['ist', 'ist'], ['der', 'der'], ['ein', 'ein'],
  // laengere Woerter aus dem Schulalltag
  ['Schmetterling', 'Schmet-ter-ling'], ['Marienkäfer', 'Ma-ri-en-kä-fer'],
  ['Erdbeere', 'Erd-bee-re'], ['Kartoffel', 'Kar-tof-fel'], ['Schokolade', 'Scho-ko-la-de'],
  ['Banane', 'Ba-na-ne'], ['Tomate', 'To-ma-te'], ['Zitrone', 'Zi-tro-ne'],
  ['Elefant', 'E-le-fant'], ['Krokodil', 'Kro-ko-dil'], ['Giraffe', 'Gi-raf-fe'],
  ['Kamera', 'Ka-me-ra'], ['Telefon', 'Te-le-fon'], ['Computer', 'Com-pu-ter'],
  ['Kalender', 'Ka-len-der'], ['Papier', 'Pa-pier'], ['Musik', 'Mu-sik'],
  ['Familie', 'Fa-mi-lie'], ['Ferien', 'Fe-ri-en'], ['Melone', 'Me-lo-ne'],
  // Umlaute und Mehrzahl
  ['Bäume', 'Bäu-me'], ['Häuser', 'Häu-ser'], ['Vögel', 'Vö-gel'], ['Bücher', 'Bü-cher'],
  ['Mäuse', 'Mäu-se'], ['Kühe', 'Kü-he'], ['Städte', 'Städ-te'], ['Wörter', 'Wör-ter'],
  // Verben in Grundform
  ['schreiben', 'schrei-ben'], ['laufen', 'lau-fen'], ['springen', 'sprin-gen'],
  ['schwimmen', 'schwim-men'], ['klettern', 'klet-tern'], ['zeichnen', 'zeich-nen'],
  ['rechnen', 'rech-nen'], ['denken', 'den-ken'], ['fragen', 'fra-gen'],
  ['antworten', 'ant-wor-ten'], ['arbeiten', 'ar-bei-ten'], ['warten', 'war-ten']
];

let treffer = 0;
const daneben = [];
for (const [wort, soll] of PROBEN) {
  const ist = silben(wort).join('-');
  if (ist === soll) treffer++;
  else daneben.push(`   ${wort.padEnd(16)} soll: ${soll.padEnd(20)} ist: ${ist}`);
}

const quote = treffer / PROBEN.length;
console.log(`Silbentrennung: ${treffer} von ${PROBEN.length} richtig (${Math.round(quote * 100)} %)`);
if (daneben.length) {
  console.log('\nNicht getroffen:');
  daneben.forEach(z => console.log(z));
}

let fehler = 0;
const pruefe = (bedingung, text) => {
  console.log(`${bedingung ? '✅' : '❌'} ${text}`);
  if (!bedingung) fehler++;
};

console.log('');
/* Die Schwelle ist bewusst hoch: Unter 90 % faerbt die App zu oft falsch,
   und eine falsche Silbenfaerbung ist schlechter als gar keine. */
pruefe(quote >= 0.90, `Trefferquote mindestens 90 % (ist ${Math.round(quote * 100)} %)`);

/* Zusicherungen, die IMMER gelten muessen - unabhaengig von der Quote. */
const woerter = PROBEN.map(p => p[0]);
pruefe(woerter.every(w => silben(w).join('') === w),
  'keine Silbentrennung verliert oder erfindet Buchstaben');
pruefe(woerter.every(w => silben(w).every(s => s.length > 0)),
  'keine leeren Silben');
pruefe(woerter.every(w => silben(w).every(s => /[aeiouäöüy]/i.test(s))),
  'jede Silbe enthält einen Vokal');

const text = 'Die Sonne scheint. Der Vogel singt!';
const stuecke = textInSilben(text);
pruefe(stuecke.filter(s => s.typ === 'silbe').map(s => s.text).join('') === text.replace(/[\s.!]/g, ''),
  'Text in Silben zerlegt ergibt wieder den Text');
pruefe(stuecke.some(s => s.typ === 'zeichen' && s.text.includes('.')),
  'Satzzeichen bleiben erhalten und werden nicht gefärbt');
pruefe(wortZahl(text) === 6, `Wörter gezählt: ${wortZahl(text)} (erwartet 6)`);
pruefe(silbenZahl(text) === 8, `Silben gezählt: ${silbenZahl(text)} (erwartet 8)`);

/* Ein leeres oder seltsames Wort darf nicht abstuerzen. */
pruefe(silben('').length === 0, 'leeres Wort ergibt nichts');
pruefe(silben('a').join('') === 'a', 'ein Buchstabe bleibt ein Buchstabe');
pruefe(silben('xyz').join('') === 'xyz', 'Wort ohne Vokal bleibt ganz');

console.log(fehler === 0 ? '\nSilbentrennung ist brauchbar ✅' : `\n${fehler} Problem(e) ❌`);
process.exit(fehler === 0 ? 0 : 1);
