# CLAUDE.md – Kidzootopia

Lern-App für Kinder: statische PWA, Vanilla-JS, kein Build, kein Linter, keine externen APIs
(alles localStorage). Nur Grundregeln; Änderungsberichte gehören in Commits, nie hierher (ein
Hook blockiert Wachstum dieser Datei über 8 KB).

## Rollen

Die Hauptsession ist der **Chef** (Opus, in `.claude/settings.json` gesetzt; `/model` hat Vorrang).

| Rolle | Modell | Aufgabe | Darf nicht (Hook = technisch gesperrt, Schutz vor Versehen) |
|---|---|---|---|
| Chef | Opus | planen, delegieren, jeden Diff prüfen, Checks nachfahren, committen, pushen, Live-Schritte | eigene Arbeit ungeprüft durchwinken |
| `coder` | Sonnet | abgegrenzte Umsetzung (Feature, Bugfix, Test), liefert Diff + Prüfnachweis | Git-Schreibbefehle, `gh` (Hook `kein-git-schreiben.sh`); Live, Auftrag erweitern |
| `helfer` | Haiku | suchen, lesen, zusammenfassen; Doku-Zeilen nur auf ausdrücklichen Auftrag | kein Bash; schreibt nur `*.md` außer CLAUDE.md (Hook `helfer-nur-doku.sh`) |

- ≤ 1 Datei, ≤ 10 Zeilen, keine Logik: macht der Chef selbst.
- Unabhängige Aufträge in **einer** Nachricht parallel starten; keine parallelen Schreibaufträge
  für dieselben Dateien. Scheitert derselbe Auftrag dreimal an derselben Rolle: nicht weiter
  delegieren, Mario fragen.
- Modelle über Kurznamen (`opus`, `sonnet`, `haiku`), keine festen Versionsnummern.

## Live (nur der Chef, nur nach ausdrücklichem OK für genau diesen Schritt)

- **Push oder Merge auf `main` = Deploy auf GitHub Pages**
  (https://mariohermess-cloud.github.io/Kidzootopia/). Merge macht Mario selbst.
- Jeder schreibende Zugriff über ein MCP-Tool, gleich welcher Dienst; Artifact-Veröffentlichung.
- Ein OK zur lokalen Umsetzung erlaubt keinen Push, PR oder Merge.

## Ablauf bei jedem Arbeitsauftrag

1. Auftrag klären: nur unklare, mehrdeutige oder diktierte Aufträge umformulieren und die
   Deutung offenlegen (bei Bedarf Skill `trainiere-prompt`), klare nicht.
2. Plan zeigen: `# | Schritt | Wer | Live? | Risiko`, offene Entscheidungen mit Vorschlag.
3. Auf OK warten.
4. Delegieren (Rollen oben).
5. Kontrolle durch den Chef: Diff lesen, Checks selbst nachfahren.
6. Abschluss getrennt nach **Verifiziert** und **Nicht verifiziert**.

Reine Fragen und Smalltalk direkt beantworten, ohne Plan. Jede Antwort während eines Auftrags
endet mit `📋 Planstand ✅ erledigt · ▶️ läuft (wer) · ⬜ offen`.

## Prüfungen

- `npm test` führt alle Fachtests aus (jedes `test:*` aus `package.json` außer `test:e2e`); die CI
  (`.github/workflows/pages.yml`) ruft genau das vor jedem Deploy auf. Einzeln:
  `npm run test:<name>`. Neue Tests als `test:<name>` in `package.json` eintragen, dann laufen
  sie überall mit.
- `npm run test:e2e` braucht Playwright und einen laufenden Server (`npm start &`).
- `tests/ocr-qualitaet.mjs` ist eine einmalige Qualitätsmessung, kein Pflichttest.
- Bei Änderungen an `.claude/`: `sh .claude/hooks/agenten-hooks.test.sh` und
  `sh .claude/hooks/claude-md-groesse.test.sh`.

**Versionsregel:** Wer App-Dateien (`index.html`, `app.css`, `js/*`, `sw.js`,
`manifest.webmanifest`) ändert, zieht den Cache-Namen in `sw.js` und die Nummer in
`js/version.js` mit; neue Module gehören in die Offline-Liste von `sw.js`
(`npm run test:version` prüft das). Neue Dateien oder Ordner der App zusätzlich in den Schritt
„App-Dateien nach _site kopieren“ in `pages.yml` eintragen; veröffentlicht wird nur, was dort steht
(`test:version` prüft auch das).

## Große Dateien

`vendor/**` und `docs/*.pdf` sind fürs Lesen (und damit Schreiben) gesperrt (`permissions.deny`; zwei Tesseract-Dateien
haben je eine Zeile von 3,9 MB). Große JS-Dateien (`js/ui.js`, `js/luxemburg.js`,
`js/generators.js`) und `README.md` nur gezielt lesen: erst Grep, dann Read mit `offset`/`limit`.

## Hooks und Skills

- Hooks (`.claude/settings.json`): `ablauf-erinnerung.sh` (eine Zeile je Prompt),
  `claude-md-groesse.sh` (Größensperre); Agenten-Hooks im Frontmatter von coder und helfer.
  Abschalten nur auf Auftrag: Eintrag entfernen oder lokal `"disableAllHooks": true` in
  `.claude/settings.local.json`.
- Skill `trainiere-prompt`: auf Zuruf verbesserter Prompt plus Plan, führt nichts aus.
- Hooks, Agenten und Skills greifen erst in einer neuen Session.
