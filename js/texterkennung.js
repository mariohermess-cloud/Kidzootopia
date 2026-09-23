/* Texterkennung (OCR) AUF DEM GERAET.

   Datenschutz ist hier keine Nebensache, sondern der Grund, warum dieses
   Modul so aussieht, wie es aussieht: Ein Foto einer Schulbuchseite darf das
   Geraet nie verlassen. Deshalb laeuft die komplette Texterkennung mit
   Tesseract.js (Apache-2.0) und laedt Worker, Rechenkern (WASM) und das
   deutsche Sprachmodell ausschliesslich aus ./vendor/tesseract/ - nie von
   einem CDN, nie ueber einen Server. Kein Bild, kein erkannter Text wird
   irgendwohin geschickt.

   WARUM NICHT die von Tesseract.js empfohlene Standard-Einrichtung: Die
   Dokumentation raet, `corePath` auf ein VERZEICHNIS zu setzen, das ALLE
   sechs Kern-Varianten enthaelt (legacy + lstm, je mit/ohne SIMD), damit die
   Bibliothek selbst waehlt. Das kostet mehrere zusaetzliche Megabyte fuer
   Faelle, die diese App nicht braucht: den Legacy-Modus (kein neuronales
   Netz, deutlich schlechtere Trefferquote) gibt es hier gar nicht, und
   "relaxed SIMD" bringt gegenueber normalem SIMD kaum etwas. Es werden daher
   nur zwei LSTM-Varianten mitgeliefert - mit und ohne SIMD - und die
   Auswahl uebernimmt eine eigene, sehr kleine SIMD-Erkennung (derselbe
   Test, den auch das Paket "wasm-feature-detect" verwendet, das in
   Tesseract.js selbst mitgebaut ist). Ein voller Verzeichnispfad wuerde
   Tesseract.js dagegen veranlassen, selbst nach allen sechs Dateien zu
   schauen - und beim Fehlen einer davon in einen Netzwerk-Fallback (CDN)
   zu laufen. Ein konkreter Dateiname umgeht das zuverlaessig.

   WAS HIER NICHT PASSIERT: Es wird keine Rechtschreibkorrektur, kein
   Raten und keine Woerterbuchpruefung vorgenommen. Tesseract liefert Text
   plus eine Sicherheit pro Wort (0-100); was damit geschieht (markieren,
   einem Erwachsenen zur Pruefung vorlegen), ist Sache der Anzeige. */

/* Pfade werden bewusst relativ zu DIESER Datei aufgeloest (import.meta.url),
   nicht relativ zur Seite. So funktioniert das Modul unveraendert, egal ob
   die App im Wurzelverzeichnis oder - wie auf GitHub Pages - unter einem
   Unterpfad ausgeliefert wird. */
const vendorURL = datei => new URL(`../vendor/tesseract/${datei}`, import.meta.url).href;

/* Exakt der SIMD-Test aus dem Paket "wasm-feature-detect" (MIT-Lizenz), das
   Tesseract.js selbst verwendet - hier nachgebaut, damit keine zusaetzliche
   Datei geladen werden muss, nur um zu entscheiden, WELCHE Datei geladen wird. */
const SIMD_TESTMODUL = new Uint8Array([
  0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0,
  10, 10, 1, 8, 0, 65, 0, 253, 15, 253, 98, 11
]);

async function hatSimd() {
  try { return typeof WebAssembly !== 'undefined' && WebAssembly.validate(SIMD_TESTMODUL); }
  catch { return false; }
}

let worker = null;
let ladenLaeuft = null;

/* Baut den (einen) Worker auf und haelt ihn fuer weitere Aufrufe vor - ein
   neuer Tesseract-Worker ist teuer (laedt WASM + Sprachmodell), ein Foto
   nach dem anderen erkennen soll das nicht jedes Mal wiederholen. */
async function worker_holen(beiFortschritt) {
  if (worker) return worker;
  if (!ladenLaeuft) {
    ladenLaeuft = (async () => {
      const { default: Tesseract } = await import(vendorURL('tesseract.esm.min.js'));
      const simd = await hatSimd();
      const w = await Tesseract.createWorker('deu', undefined, {
        workerPath: vendorURL('worker.min.js'),
        corePath: vendorURL(simd ? 'tesseract-core-simd-lstm.wasm.js' : 'tesseract-core-lstm.wasm.js'),
        langPath: new URL('../vendor/tesseract', import.meta.url).href,
        gzip: true,
        workerBlobURL: false,
        logger: m => { if (typeof beiFortschritt === 'function') beiFortschritt(m); }
      });
      worker = w;
      return w;
    })();
  }
  try { return await ladenLaeuft; }
  finally { ladenLaeuft = null; }
}

/* --------------------------------------------------------------------------
   Bildvorverarbeitung. Ein Handyfoto einer Buchseite ist meist zu groß (mehr
   Pixel bringen Tesseract nichts, kosten aber Zeit), farbig (Tesseract
   rechnet ohnehin in Graustufen) und kontrastarm (Schatten, leicht
   ueberbelichtetes Papier). Alle drei werden hier einmal vorab behoben.
   -------------------------------------------------------------------------- */

const MAX_KANTE = 2000;
const KONTRAST = 1.35; // fester, moderater Faktor statt Histogramm-Analyse - robust auch bei einfarbigen Testbildern

async function vorverarbeiten(bild) {
  /* imageOrientation: 'from-image' liest das EXIF-Drehflag des Fotos aus und
     dreht das Bild schon beim Erzeugen der Bitmap richtig herum - ohne das
     wuerde ein hochkant fotografiertes Blatt quer erkannt. */
  const bitmap = await createImageBitmap(bild, { imageOrientation: 'from-image' });
  try {
    const skala = Math.min(1, MAX_KANTE / Math.max(bitmap.width, bitmap.height));
    const breite = Math.max(1, Math.round(bitmap.width * skala));
    const hoehe = Math.max(1, Math.round(bitmap.height * skala));

    const canvas = document.createElement('canvas');
    canvas.width = breite;
    canvas.height = hoehe;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(bitmap, 0, 0, breite, hoehe);

    const bilddaten = ctx.getImageData(0, 0, breite, hoehe);
    const px = bilddaten.data;
    for (let i = 0; i < px.length; i += 4) {
      const grau = 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2];
      const angehoben = Math.max(0, Math.min(255, (grau - 128) * KONTRAST + 128));
      px[i] = px[i + 1] = px[i + 2] = angehoben;
    }
    ctx.putImageData(bilddaten, 0, 0);
    return canvas;
  } finally {
    bitmap.close?.();
  }
}

/* Blocks -> Absaetze -> Zeilen -> Woerter zu einer flachen Liste einebnen. */
function alleWoerter(blocks) {
  const woerter = [];
  for (const b of blocks || [])
    for (const p of b.paragraphs || [])
      for (const l of p.lines || [])
        for (const w of l.words || [])
          woerter.push(w);
  return woerter;
}

/* Die eigentliche Erkennung. `bild` ist alles, was createImageBitmap
   versteht: File, Blob oder ein bereits vorhandenes Canvas. */
export async function erkenneText(bild, { beiFortschritt } = {}) {
  const start = Date.now();
  const canvas = await vorverarbeiten(bild);
  const w = await worker_holen(beiFortschritt);
  const { data } = await w.recognize(canvas, {}, { blocks: true });
  const woerter = alleWoerter(data.blocks).map(wort => ({
    text: wort.text,
    sicherheit: Math.round(wort.confidence)
  }));
  return { text: data.text, woerter, dauerMs: Date.now() - start };
}

/* Gibt den Worker frei - z. B. wenn die Pruefansicht verlassen wird und
   laengere Zeit keine weitere Erkennung ansteht. Ein neuer Aufruf von
   erkenneText() baut danach einfach wieder einen neuen Worker auf. */
export function beenden() {
  const laufend = worker;
  worker = null;
  ladenLaeuft = null;
  if (laufend) laufend.terminate().catch(() => {});
}
