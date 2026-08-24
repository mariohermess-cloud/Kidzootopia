# Kidzootopia 🌈

**Ein Ziel – viele Wege.**
Eine Lern-App für Kinder (Klasse 1–6), die zuerst die *Stärken* eines Kindes herausfindet
und dann jedes Schul-Lernziel über genau den Weg vermittelt, der zu diesem Kind passt.

Am Ende können alle Kinder dasselbe – nur der Weg dorthin ist ein anderer.

---

## Die Idee in einem Bild

Lernziel: **Das kleine Einmaleins** (4 × 6)

| Talent des Kindes | Weg | So sieht dieselbe Aufgabe aus |
|---|---|---|
| Musik 🎵 | Rhythmus-Weg 🥁 | „6 – 12 – 18 – __“ im Takt weiterklatschen |
| Raum 🧩 | Bau-Weg 🧱 | 4 Reihen mit je 6 Punkten – wie viele Punkte? |
| Sprache 📚 | Geschichten-Weg 📖 | Lina packt 4 Tüten mit je 6 Bonbons |
| Technik 🛠️ | Code-Weg 🤖 | `wiederhole 4 mal { sammle 6 Münzen }` |
| Bewegung 🤸 | Bewegungs-Weg 👟 | Sprünge auf dem Zahlenstrahl |

Vier Kinder, vier Wege, ein Ergebnis: Sie können 4 × 6.

---

## Was die App macht

1. **Talent-Test in fünf Teilen** – 8 Talentbereiche (Sprache, Logik, Raum, Technik,
   Musik, Bewegung, Natur, Miteinander), erfasst aus vier verschiedenen Blickwinkeln.
   Eine einzige Frageform genügt nicht: Kinder neigen bei „Magst du X?“ zum Ja-Sagen,
   und am Ende sieht alles gleich stark aus.

   | Teil | Form | Warum |
   |---|---|---|
   | 1 · Was magst du? | 16 Aussagen, Skala 🙁😐🙂🤩 | Selbstbild |
   | 2 · Lieber … oder …? | 12 Paarvergleiche | erzwingt eine Rangfolge, entlarvt Ja-Sager |
   | 3 · Was würdest du tun? | 6 Alltagsszenarien | Verhalten statt Meinung |
   | 4 · Kleine Proben | 8 Mini-Aufgaben mit Zeitmessung | tatsächlich gezeigtes Können |
   | 5 · Feinschliff | bis zu 4 Stichfragen | nur dort, wo Talente dicht beieinander liegen |

   Jeder Teil ist freiwillig: Nach jedem Teil steht schon ein Ergebnis, jeder weitere
   Teil macht es genauer. Wenige Datenpunkte werden gedämpft, damit eine einzelne
   Antwort niemanden festlegt.

2. **Die App lernt aus den Ergebnissen weiter** – das Testergebnis ist kein Etikett:
   * Zu jeder Aufgabe werden Treffer **und Bearbeitungszeit** je Lernweg mitgeschrieben.
   * Daraus entsteht eine **Wirksamkeit** je Weg (geglättete Trefferquote + Tempobonus) –
     auch getrennt je Lernziel, denn ein Kind kann Brüche über Bilder verstehen und
     Einmaleins über Rhythmus.
   * Die Wegwahl richtet sich nach Talent **und** Wirksamkeit; je mehr Daten vorliegen,
     desto stärker zählt das Gemessene (25 % → 70 %).
   * Widerspricht die Praxis dem Test, sagt der Eltern-Bereich das ausdrücklich:
     *„Im Test lag der Knobel-Weg vorn, in den Aufgaben läuft der Rhythmus-Weg besser.“*
   * Der Test darf jederzeit wiederholt werden – Kinder verändern sich.
3. **Lernziele statt Aufgabenlisten** – 11 Ziele aus dem Schulstoff
   (Mathe, Deutsch, Englisch, Allgemeinwissen, Technik & Code). Jedes Ziel beschreibt eine
   Kompetenz, nicht eine Aufgabenform.
4. **Weg-Auswahl** – 4 von 5 Aufgaben laufen über einen Weg, der zur Stärke des Kindes passt.
5. **Brücken-Aufgaben 🌉** – jede 5. Aufgabe kommt bewusst über einen *anderen* Weg.
   So wächst auch das, was noch schwerfällt – ohne dass der Spaß verloren geht.
6. **Adaptive Level (1–5)** – vier richtige Antworten in Folge heben das Niveau,
   eine Schwächephase senkt es wieder. Kein Kind rennt gegen eine Wand.
7. **Eltern-Bereich** – Fortschritt je Lernziel, Aktivität der letzten 7 Tage,
   Klartext-Empfehlungen („So lernt Ihr Kind am leichtesten – und daran arbeiten wir gerade“),
   Export/Import der Daten.

Aufgaben werden **generiert**, nicht aus einer Liste gezogen – der Vorrat geht nie aus.
Aktuell: 11 Lernziele × bis zu 5 Wege = 44 Aufgabentypen auf je 5 Schwierigkeitsstufen.

---

## Auf dem Handy nutzen

Kidzootopia ist eine **PWA**: eine Web-App, die sich wie eine echte App auf den
Startbildschirm legen lässt, im Vollbild startet und **offline** funktioniert.
Kein App-Store, keine Installation, keine Konten.

* **Android / Chrome:** Seite öffnen → Menü ⋮ → *App installieren*
* **iPhone / Safari:** Seite öffnen → Teilen-Symbol → *Zum Home-Bildschirm*

**Einmalig nötig:** GitHub Pages im Repository einschalten unter
*Settings → Pages → Build and deployment → Source:* **GitHub Actions**.
Das lässt sich nicht automatisieren – ein Workflow-Token darf die Pages-Seite nicht
selbst anlegen (`Resource not accessible by integration`), dafür wären
Administrator-Rechte nötig.

Danach wird die App bei jedem Push auf `main` automatisch veröffentlicht
(Workflow `.github/workflows/pages.yml`; der Generator-Test läuft als Gate davor).
Der fehlgeschlagene Lauf lässt sich unter *Actions → Deploy zu GitHub Pages →
Re-run all jobs* einfach wiederholen. Die Adresse lautet:

```
https://mariohermess-cloud.github.io/Kidzootopia/
```

Diese Adresse auf dem Handy öffnen – fertig.

### Lokal ausprobieren

```bash
npm start            # startet einen Webserver auf http://localhost:8765
```

---

## Datenschutz

Alles bleibt auf dem Gerät (`localStorage`). Keine Server, keine Konten, keine Werbung,
keine Tracker, kein Netzwerkverkehr. Ein Backup erzeugen Eltern selbst über
*Eltern → Fortschritt exportieren*. Mehrere Kinder können eigene Profile haben.

---

## Tests

```bash
npm run test:aufgaben   # prüft alle Generatoren: 13.200 Aufgaben auf Vollständigkeit & Eindeutigkeit
npm run test:lernen     # prüft die Lernschleife: erkennt die App den wirksamen Weg?
npm start &             # Server für den Durchklick-Test
npm run test:e2e        # Profil anlegen → 5-teiliger Talent-Test → Mission → alle Bereiche → Neustart
```

---

## Aufbau

```
index.html            Gerüst (Kopfzeile, Ansicht, Navigation)
app.css               Gestaltung, hell & dunkel, Handy zuerst
manifest.webmanifest  App-Installation
sw.js                 Offline-Betrieb
js/data.js            Talente, Lernwege, Lernziele, Talent-Test (5 Teile), Abzeichen
js/talenttest.js      Auswertung des Talent-Tests: Blöcke, Gewichte, Feinschliff
js/generators.js      Aufgaben-Generatoren – ein Ziel, viele Wege
js/engine.js          Auswahl von Ziel & Weg, Brücken-Regel, Elternhinweise
js/store.js           Profile, Fortschritt, Talentwerte, gemessene Wirksamkeit (lokal)
js/ui.js              Bildschirme
js/chart.js           Talent-Radar (SVG)
tests/                Generator-Test & Durchklick-Test
```

## Nächste Ideen

* Vorlesen der Aufgaben (Sprachausgabe) für Leseanfänger und Kinder mit Leseschwäche
* Foto-/Zeichen-Aufgaben für den Bau-Weg
* Eltern-Wochenbericht als PDF
* Weitere Lernziele: Uhrzeit, Sachrechnen mit Geld, Grammatik, Musiknoten
