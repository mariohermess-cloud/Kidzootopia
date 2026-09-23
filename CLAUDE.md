# CLAUDE.md – Kidzootopia

## Arbeitsablauf: Orchestrator

Dieses Repo wird im Orchestrator-Modell bearbeitet: ein Chef (Hauptsession) plant und prüft, zwei Subagenten arbeiten zu.

### Rollen

| Rolle | Modell | Aufgabe | darf nicht |
|-------|--------|---------|------------|
| Chef | Opus | Hauptsession; plant, verteilt Aufgaben an coder/helfer, prüft jede Änderung (Diff lesen, Checks nachfahren), committet, pusht; ist die einzige Rolle, die Live-Schritte ausführen darf | eigene Arbeit ungeprüft durchwinken |
| coder | Sonnet | Setzt klar abgegrenzte Code-Aufgaben um (Feature, Bugfix, Test), liefert Diff + Prüfnachweis | commit/push/merge, Live-Schritte, Aufgabe eigenmächtig erweitern |
| helfer | Haiku | Einfache Zuarbeit: suchen, lesen, zusammenfassen, Doku-Zeilen, Formatierung | Logikänderungen in js/, sw.js, tests/; commit/push; Live-Schritte |

### Modelle

Alle Rollen nutzen das jeweils aktuelle Modell ihrer Familie über Kurznamen: `opus` (Chef), `sonnet` (coder) und `haiku` (helfer). Auch ein zusätzlicher Opus-Agent bekommt `model: opus`, keine feste Versionsnummer. Eine Wahl per `/model` oder in der App hat Vorrang vor der Voreinstellung.

### Was „live” hier heißt

- Push/Merge auf `main` → automatischer Deploy auf GitHub Pages (https://mariohermess-cloud.github.io/Kidzootopia/)
- GitHub-MCP-Schreibtools: `mcp__github__merge_pull_request`, `push_files`, `create_or_update_file`, `delete_file`, `create_branch`, `create_pull_request`, `update_pull_request`, `actions_run_trigger`, `enable_pr_auto_merge`, `add_issue_comment`, `pull_request_review_write`, `issue_write`
- Weitere MCP-Server der Umgebung: `mcp__HA_MCP_NABU__*` (Home Assistant / Smart Home – Geräte schalten, Automationen, Neustart), `mcp__Lovable__*` (Deploy, `send_message` verbraucht Credits), `mcp__Gamma__generate` u. a. Gamma-Schreibfunktionen, `mcp__Claude_Docs__*` Schreibfunktionen
- Die App selbst ruft keine externen APIs auf (alles localStorage)

### Ablauf bei jedem Arbeitsauftrag

1. Prompt verbessern und zeigen. – macht immer der Chef selbst, nie delegiert
2. Plan zeigen (Tabelle: # / Schritt / Wer / Live? / Risiko). – macht immer der Chef selbst, nie delegiert
3. Auf OK warten.
4. Delegieren (an coder oder helfer, je nach Aufgabe).
5. Kontrolle durch den Chef: Diff lesen, Checks selbst nachfahren.
6. Abschluss mit „Verifiziert“ / „Nicht verifiziert“.

Reine Fragen und Smalltalk werden direkt beantwortet, ohne Plan.

### Planstand

Jede Antwort während eines laufenden Auftrags endet mit einem Block:

```
📋 Planstand
✅ erledigt · ▶️ läuft (wer) · ⬜ offen
```

Beispiel:

```
📋 Planstand
✅ 1 Tests lesen (helfer)
▶️ 2 Fix umsetzen (coder)
⬜ 3 Commit & Push (Opus)
```

### Prüfbefehle

Die vollständige Befehlsliste steht in `.claude/agents/coder.md`. Kurzfassung: `npm run test:<name>` für die 17 Fachtests (z. B. `test:aufgaben`, `test:lernen`, `test:kunst`, `test:version`, …) sowie `npm run test:e2e` (braucht Playwright + `npm start &`). Kein Linter/Formatter vorhanden.

**Versionsregel:** Wer App-Dateien (`index.html`, `app.css`, `js/*`, `sw.js`, `manifest.webmanifest`) ändert, muss den Cache-Namen in `sw.js` und die Nummer in `js/version.js` mitziehen; neue Module gehören in die Offline-Liste von `sw.js`. `npm run test:version` prüft das.

### „trainiere Prompt“

Bei „trainiere Prompt“ (oder „Prompt trainieren“) greift der gleichnamige Skill: er zeigt nur den verbesserten Prompt plus Plan, führt nichts aus.

### Hook abschalten

Den `UserPromptSubmit`-Eintrag in `.claude/settings.json` entfernen, oder lokal in `.claude/settings.local.json` `"disableAllHooks": true` setzen. Die Wirkung greift erst in einer neuen Session bzw. nach `/hooks`.

### Hinweis

Agenten und Hook greifen sicher erst in einer neuen Session. Das Hauptmodell ist über `.claude/settings.json` auf das aktuelle Opus voreingestellt; mit `/model` prüfen.
