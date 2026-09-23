# vendor/tesseract – Herkunft, Versionen, Lizenzen

Alle Dateien in diesem Verzeichnis wurden aus der offiziellen npm-Registry
bezogen (`npm pack <paket>@<version>`), kein CDN, keine sonstige Quelle.
Sie werden von `js/texterkennung.js` ausschließlich lokal geladen
(`workerPath`, `corePath`, `langPath` zeigen immer hierher) - die Texterkennung
läuft vollständig auf dem Gerät, kein Bild und kein erkannter Text verlässt es.

## Enthaltene Dateien

| Datei | Herkunft (npm-Paket@Version) | Zweck | Größe |
|---|---|---|---|
| `tesseract.esm.min.js` | `tesseract.js@7.0.0` (dist/) | öffentliche API, per `import()` geladen | 62 KB |
| `worker.min.js` | `tesseract.js@7.0.0` (dist/) | Code, der im Web Worker läuft | 109 KB |
| `worker.min.js.LICENSE.txt` | `tesseract.js@7.0.0` (dist/) | Lizenzhinweise für im Worker mitgebündelte Fremdcode-Schnipsel (buffer, ieee754, regenerator-runtime, zlib.js) | 0.5 KB |
| `tesseract-core-lstm.wasm.js` | `tesseract.js-core@7.0.0` | Rechenkern (WASM, LSTM/neuronales Netz, Base64-eingebettet), Nicht-SIMD-Fallback | 3,7 MB |
| `tesseract-core-simd-lstm.wasm.js` | `tesseract.js-core@7.0.0` | wie oben, mit SIMD (schneller auf Geräten, die es unterstützen) | 3,7 MB |
| `deu.traineddata.gz` | `@tesseract.js-data/deu@1.0.0`, Variante `4.0.0_best_int` | deutsches Sprachmodell (komprimiert) | 1,3 MB |
| `LICENSE-tesseract.js.md` | `tesseract.js@7.0.0` (LICENSE.md) | Volltext Apache-2.0 | 11 KB |
| `LICENSE-tesseract.js-core.txt` | `tesseract.js-core@7.0.0` (LICENSE) | Volltext Apache-2.0 | 11 KB |

**Gesamtgröße: ca. 9,0 MB.**

## Warum nur diese Dateien - und keine weiteren aus dem npm-Paket

`tesseract.js-core` liefert sechs Kern-Varianten (mit/ohne SIMD, mit/ohne
"relaxed SIMD", jeweils Legacy+LSTM oder nur LSTM) - macht ausgepackt 45 MB.
Diese App braucht:

- **keinen Legacy-Modus** (`tesseract-core.*`, `tesseract-core-simd.*`,
  `tesseract-core-relaxedsimd*.*`) - das ist der alte, nicht-neuronale
  Erkennungsweg mit deutlich schlechterer Trefferquote, für Fließtext aus
  Schulbüchern nicht sinnvoll.
- **kein "relaxed SIMD"** - bringt gegenüber normalem SIMD auf den hier
  relevanten Geräten (Tablets/Handys von Eltern) praktisch keinen Vorteil,
  kostet aber eine weitere ~3,7 MB große Datei.
- **keine `.wasm.js`-Variante ohne LSTM** (`tesseract-core.wasm.js`,
  `tesseract-core-simd.wasm.js`) - aus demselben Grund wie Legacy oben.

Übrig bleiben genau die zwei mitgelieferten Dateien: LSTM mit und ohne SIMD.
`js/texterkennung.js` misst SIMD-Unterstützung selbst (derselbe Bytecode-Test
wie im Paket `wasm-feature-detect`, das Tesseract.js intern nutzt) und lädt
gezielt die passende Datei über einen konkreten Dateipfad. Das weicht von der
offiziellen Tesseract.js-Empfehlung ab, `corePath` auf ein Verzeichnis mit
**allen** Varianten zu setzen - das würde aber entweder die anderen vier
großen Dateien ebenfalls erfordern oder (bei deren Fehlen) in einen
CDN-Fallback laufen, und genau das soll hier nie passieren.

Bei `deu.traineddata.gz` wurde bewusst die `4.0.0_best_int`-Variante gewählt
(1,3 MB) statt der älteren `4.0.0`-Variante (7,1 MB) - laut Tesseract-Projekt
die für den LSTM-Modus vorgesehene, kleinere und für Fließtext ausreichend
genaue Modellvariante.

## Lizenzen

- **tesseract.js** und **tesseract.js-core**: Apache License 2.0 (Volltexte
  liegen bei, `LICENSE-tesseract.js.md` / `LICENSE-tesseract.js-core.txt`).
- **@tesseract.js-data/deu**: laut npm-Registry-Metadaten (`license: "MIT"`,
  siehe `https://www.npmjs.com/package/@tesseract.js-data/deu`) MIT-lizenziert;
  das Paket selbst legt keine gesonderte LIZENZ-Datei bei, deshalb hier nur der
  Verweis auf die Registry-Angabe statt eines erfundenen Volltexts.
- In `worker.min.js` sind kleine Fremdcode-Anteile (buffer, ieee754,
  regenerator-runtime, zlib.js) unter MIT bzw. BSD-3-Clause mitgebündelt -
  Hinweise dazu stehen in `worker.min.js.LICENSE.txt`.

## Wie diese Dateien nachgezogen werden können

```
npm pack tesseract.js@7.0.0 tesseract.js-core@7.0.0 @tesseract.js-data/deu@1.0.0
```
Danach aus den Tarballs `dist/tesseract.esm.min.js`, `dist/worker.min.js`,
`dist/worker.min.js.LICENSE.txt` (aus `tesseract.js`), `tesseract-core-lstm.wasm.js`
und `tesseract-core-simd-lstm.wasm.js` (aus `tesseract.js-core`) sowie
`4.0.0_best_int/deu.traineddata.gz` (aus `@tesseract.js-data/deu`) entnehmen.
