---
name: trainiere-prompt
description: Auslösen bei „trainiere Prompt“ oder „Prompt trainieren“. Zeigt einen verbesserten Prompt plus Plan zur letzten Nutzeranfrage – führt nichts aus, ändert nichts, startet keine Agenten.
---

## Regel

Nur zeigen, nichts ausführen. Keine Dateien ändern, keine Agenten starten, keine Befehle ausführen, die etwas verändern. Lesen des Repos zum Verstehen der Anfrage ist erlaubt (z. B. Grep/Read, um zu prüfen, ob genannte Dateien/Funktionen existieren).

## Ausgabe

Antworte in genau diesen 4 Teilen:

**(1) Verbesserter Prompt**

Formuliere den Nutzerwunsch neu, mit Ziel, Kontext, Randbedingungen und Erfolgskriterium. Danach ein kurzer Abschnitt „Meine Interpretation deines Wortlauts“: Der Nutzer diktiert oft per Spracheingabe – lege offen, welche Füllwörter (z. B. „äh“, „ähm“) du ignoriert hast und welche Wörter vermutlich Verhörer der Spracherkennung waren (z. B. ein unpassend erkanntes Wort, das im Kontext keinen Sinn ergibt) und wie du sie interpretiert hast.

**(2) Plan**

Tabelle mit genau diesen Spalten:

| # | Schritt | Wer (Opus/coder/helfer) | Live? | Risiko |
|---|---------|--------------------------|-------|--------|

**(3) Offene Entscheidungen**

Liste jede offene Entscheidung mit einem konkreten Vorschlag dahinter.

**(4) Abschlusszeile**

Exakt diese Zeile, wortwörtlich, als letzte Zeile der Antwort:

Mit OK starte ich, oder schreib, was ich ändern soll.

## Beispiel

Nutzer (Sprachaufnahme): „äh trainiere prompt ich möchte äh dass die knacknüsse aufgabe äh im knacknüsse nein Kunst modul auch bilder speichert“

Ausgabe:

**(1) Verbesserter Prompt**
Ziel: Im Kunst-Modul sollen erstellte Bilder gespeichert werden (aktuell vermutlich nicht der Fall).
Kontext: Kidzootopia-PWA, Modul „Kunst“ (`js/kunst.js` o. ä., zu verifizieren).
Randbedingungen: Kein Build/Linter, Vanilla-JS, Versionsregel (sw.js/js/version.js) bei App-Datei-Änderung beachten.
Erfolgskriterium: Test `npm run test:kunst` läuft grün, Speicherfunktion nachvollziehbar im Diff.

Meine Interpretation deines Wortlauts: „äh“ als Füllwort ignoriert. „Knacknüsse“ wurde von dir selbst korrigiert zu „Kunst“ – ich habe „Kunst“ übernommen.

**(2) Plan**

| # | Schritt | Wer (Opus/coder/helfer) | Live? | Risiko |
|---|---------|--------------------------|-------|--------|
| 1 | Ist-Zustand Kunst-Modul lesen | helfer | nein | niedrig |
| 2 | Speicherfunktion umsetzen + Version/sw.js nachziehen | coder | nein | mittel |
| 3 | test:kunst und test:version laufen lassen | coder | nein | niedrig |
| 4 | Diff prüfen, committen, auf Feature-Branch pushen, Draft-PR | Opus | nein (live erst mit Merge auf `main`) | niedrig |

**(3) Offene Entscheidungen**
- Speicherort: localStorage vs. IndexedDB? Vorschlag: localStorage, konsistent mit Rest der App.

Mit OK starte ich, oder schreib, was ich ändern soll.
