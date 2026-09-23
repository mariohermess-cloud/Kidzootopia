/* Prueft die Speicher-Funktionen fuer "Eigene Texte" (js/store.js):
   Speichern, Loeschen, Obergrenze, Migration alter Profile ohne das Feld,
   und die Umzugs-Code-Rundreise (alsCode/ausCode) - eigene Texte duerfen
   dabei nicht verloren gehen. Kein DOM, keine Texterkennung: Kamera und
   Tesseract laufen nur im Browser (siehe tests/e2e.mjs). */

/* localStorage fuer Node nachbilden, wie in tests/lernen.mjs */
const speicher = new Map();
globalThis.localStorage = {
  getItem: k => speicher.get(k) ?? null,
  setItem: (k, v) => speicher.set(k, v),
  removeItem: k => speicher.delete(k)
};

const S = await import('../js/store.js');

let fehler = 0;
const pruefe = (bedingung, text) => {
  console.log(`${bedingung ? '✅' : '❌'} ${text}`);
  if (!bedingung) fehler++;
};

S.laden();
const kind = S.neuesProfil({ name: 'Lena', avatar: '🦊', klasse: 3 });

/* --------------------------------------------------------------- Migration */
pruefe(Array.isArray(kind.eigeneTexte) && kind.eigeneTexte.length === 0,
  'ein neues Profil bekommt ein leeres eigeneTexte-Feld');

/* Ein "altes" Profil ohne das Feld simulieren (vor dieser Fassung angelegt)
   und pruefen, dass laden() es nachtraeglich ergaenzt. */
delete kind.eigeneTexte;
S.speichern();
S.laden();
const nachLaden = S.alleProfile()[0];
pruefe(Array.isArray(nachLaden.eigeneTexte), 'laden() ergänzt das Feld bei alten Profilen (Migration)');

/* --------------------------------------------------------------- Speichern */
const eintrag = S.eigenenTextSpeichern(nachLaden, {
  titel: 'Der Fuchs im Wald',
  abschnitte: ['Der Fuchs lief durch den Wald.', 'Dort traf er einen Hasen.']
});
pruefe(!!eintrag.id, 'eigenenTextSpeichern gibt einen Eintrag mit eigener ID zurück');
pruefe(eintrag.titel === 'Der Fuchs im Wald', 'Titel wird übernommen');
pruefe(eintrag.abschnitte.length === 2, 'beide Abschnitte werden gespeichert');
pruefe(eintrag.gelesen === 0, 'ein neuer Text startet mit gelesen:0');
pruefe(S.eigeneTexte(nachLaden).length === 1, 'eigeneTexte(profil) liefert den gespeicherten Text');

/* Leere/nur-Leerraum-Abschnitte werden verworfen, kein Titel ergibt einen Platzhalter */
const eintrag2 = S.eigenenTextSpeichern(nachLaden, { titel: '   ', abschnitte: ['Ein Satz.', '   ', ''] });
pruefe(eintrag2.abschnitte.length === 1, 'leere Abschnitte werden beim Speichern verworfen');
pruefe(eintrag2.titel === 'Eigener Text', 'ein leerer Titel bekommt einen Platzhalter');

/* Ganz ohne brauchbaren Abschnitt wird ein Fehler geworfen, nicht ein leerer
   Eintrag gespeichert - sonst stünde in "Meine Texte" ein Text ohne Inhalt. */
let warfFehler = false;
try { S.eigenenTextSpeichern(nachLaden, { titel: 'Leer', abschnitte: ['', '   '] }); }
catch { warfFehler = true; }
pruefe(warfFehler, 'ein Text ganz ohne Abschnitt wirft einen Fehler statt einen leeren Eintrag zu speichern');

/* -------------------------------------------------------------- Obergrenze */
for (let i = 0; i < 60; i++)
  S.eigenenTextSpeichern(nachLaden, { titel: `Text ${i}`, abschnitte: [`Satz ${i}.`] });
pruefe(S.eigeneTexte(nachLaden).length === 50, `die Obergrenze von 50 Texten wird eingehalten (${S.eigeneTexte(nachLaden).length})`);
pruefe(S.eigeneTexte(nachLaden).at(-1).titel === 'Text 59', 'der neueste Text bleibt erhalten');
pruefe(!S.eigeneTexte(nachLaden).some(t => t.titel === 'Der Fuchs im Wald'),
  'die ältesten Texte fallen heraus, sobald die Obergrenze überschritten wird');

/* --------------------------------------------------------------- Löschen */
const vorher = S.eigeneTexte(nachLaden).length;
const zielId = S.eigeneTexte(nachLaden)[0].id;
S.eigenenTextLoeschen(nachLaden, zielId);
pruefe(S.eigeneTexte(nachLaden).length === vorher - 1, 'eigenenTextLoeschen entfernt genau einen Text');
pruefe(!S.eigeneTexte(nachLaden).some(t => t.id === zielId), 'der gelöschte Text ist wirklich weg');

/* --------------------------------------------------------- Gelesen-Zähler */
const beispiel = S.eigeneTexte(nachLaden)[0];
S.eigenenTextGelesenVermerken(nachLaden, beispiel.id);
S.eigenenTextGelesenVermerken(nachLaden, beispiel.id);
pruefe(S.eigeneTexte(nachLaden).find(t => t.id === beispiel.id).gelesen === 2,
  'eigenenTextGelesenVermerken zählt hoch');
S.eigenenTextGelesenVermerken(nachLaden, 'gibt-es-nicht');
pruefe(true, 'eine unbekannte ID stürzt beim Vermerken nicht ab');

/* -------------------------------------------------- Umzugs-Code-Rundreise */
const codeVorher = S.alsCode();
const texteVorher = JSON.stringify(S.eigeneTexte(S.aktiv()));
speicher.clear();
S.laden();                              // frischer, leerer Zustand
pruefe(S.eigeneTexte(S.aktiv() || {}).length === undefined || !S.aktiv(),
  'nach dem Leeren des Speichers gibt es zunächst kein aktives Profil');
const ergebnis = S.ausCode(codeVorher);
pruefe(ergebnis.gesamt >= 1, 'der Umzugs-Code stellt mindestens ein Profil wieder her');
const wiederhergestellt = S.alleProfile().find(p => p.name === 'Lena');
pruefe(!!wiederhergestellt, 'das Profil "Lena" ist nach dem Umzugs-Code wieder da');
pruefe(JSON.stringify(S.eigeneTexte(wiederhergestellt)) === texteVorher,
  'die eigenen Texte überstehen die Umzugs-Code-Rundreise unverändert');

console.log(fehler === 0
  ? '\nEigene Texte: Speicher-Funktionen arbeiten wie beschrieben ✅'
  : `\n${fehler} Problem(e) ❌`);
process.exit(fehler === 0 ? 0 : 1);
