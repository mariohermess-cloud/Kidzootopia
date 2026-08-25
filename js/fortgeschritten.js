/* Stoff für die höheren Etappen: Mittelstufe, Oberstufe, Erwachsene.
   Hier wird nicht mehr abgefragt, was man auswendig weiß, sondern ob man
   sauber schließen kann – und ob man die eigenen Denkfehler kennt. */

/* -------- Denkfehler: die geprüften Klassiker der Urteilsforschung -------- */
export const DENKFEHLER = [
  { name:'Bestätigungsfehler', jahr:1960,
    q:'Sie glauben, ein bestimmtes Hausmittel hilft gegen Erkältung. Sie erinnern sich lebhaft an die Male, in denen es wirkte, und kaum an die anderen. Wie heißt dieser Fehler?',
    ok:'Bestätigungsfehler', bad:['Ankereffekt','Rückschaufehler','Verfügbarkeitsfehler'],
    erklaerung:'Wir suchen und behalten bevorzugt, was unsere Meinung stützt. Peter Wason wies das 1960 im Kartenexperiment nach.' },
  { name:'Basisratenfehler', jahr:1973,
    q:'Ein Test auf eine seltene Krankheit ist zu 99 % zuverlässig. Ihr Ergebnis ist positiv. Wie hoch ist die Wahrscheinlichkeit, dass Sie tatsächlich krank sind?',
    ok:'Das lässt sich ohne die Häufigkeit der Krankheit gar nicht sagen',
    bad:['99 %','98 %','50 %'],
    erklaerung:'Ohne die Grundhäufigkeit ist die Frage unbeantwortbar. Bei einer Krankheit, die einen von 10.000 trifft, liegt die Wahrscheinlichkeit trotz positivem Test unter 1 %. Kahneman und Tversky, 1973.' },
  { name:'Überlebendenauswahl', jahr:1943,
    q:'Im Krieg untersuchte man zurückgekehrte Flugzeuge und wollte dort panzern, wo die meisten Einschüsse saßen. Der Statistiker Abraham Wald widersprach. Warum?',
    ok:'Die Flugzeuge mit Treffern an anderen Stellen kamen gar nicht zurück',
    bad:['Panzerung macht Flugzeuge zu schwer','Die Einschüsse waren harmlos','Die Zählung war fehlerhaft'],
    erklaerung:'Man sah nur die Überlebenden. Gepanzert werden musste dort, wo die zurückgekehrten Maschinen KEINE Löcher hatten.' },
  { name:'Versunkene Kosten', jahr:1985,
    q:'Sie haben eine teure Karte fürs Konzert gekauft, sind aber krank und müssten bei Regen zwei Stunden fahren. Was ist die vernünftige Überlegung?',
    ok:'Das ausgegebene Geld ist ohnehin weg – es zählt nur, was ab jetzt besser ist',
    bad:['Ich muss hin, sonst war das Geld umsonst','Je teurer die Karte, desto eher sollte ich hin','Ich verkaufe die Karte unter Wert'],
    erklaerung:'Bereits ausgegebene Kosten dürfen keine Entscheidung mehr beeinflussen. Arkes und Blumer beschrieben den Effekt 1985.' },
  { name:'Ankereffekt', jahr:1974,
    q:'Vor einer Preisverhandlung nennt der Verkäufer eine sehr hohe Zahl. Ihr Gegenangebot fällt dadurch höher aus, als Sie geplant hatten. Wie heißt der Effekt?',
    ok:'Ankereffekt', bad:['Halo-Effekt','Rückschaufehler','Gruppendenken'],
    erklaerung:'Die erste genannte Zahl zieht alle folgenden Schätzungen zu sich – auch wenn sie erkennbar willkürlich ist.' },
  { name:'Rückschaufehler', jahr:1975,
    q:'Nach einem überraschenden Wahlausgang sagen viele: „Das war doch abzusehen.“ Wie heißt dieser Fehler?',
    ok:'Rückschaufehler', bad:['Bestätigungsfehler','Ankereffekt','Basisratenfehler'],
    erklaerung:'Im Nachhinein erscheint das Eingetretene zwingend. Baruch Fischhoff wies 1975 nach, dass Menschen ihre früheren Prognosen falsch erinnern.' },
  { name:'Verfügbarkeitsfehler', jahr:1973,
    q:'Nach Berichten über einen Flugzeugabsturz halten viele das Fliegen für gefährlicher als Autofahren. Warum ist das ein Fehler?',
    ok:'Was leicht erinnerbar ist, halten wir für häufiger, als es ist',
    bad:['Fliegen ist tatsächlich gefährlicher','Statistiken über Flüge sind unzuverlässig','Autofahren wird unterschätzt, weil es billiger ist'],
    erklaerung:'Je leichter Beispiele in den Sinn kommen, desto häufiger schätzen wir ein Ereignis – Medienberichte verzerren das massiv.' },
  { name:'Korrelation und Ursache', jahr:0,
    q:'In Monaten mit hohem Speiseeisverkauf ertrinken mehr Menschen. Was folgt daraus?',
    ok:'Nichts – beides steigt im Sommer, ohne einander zu verursachen',
    bad:['Speiseeis macht das Schwimmen gefährlich','Ertrinkende hatten vorher Eis gegessen','Man sollte im Sommer weniger Eis verkaufen'],
    erklaerung:'Ein gemeinsamer dritter Faktor – die Jahreszeit – erzeugt den Zusammenhang. Aus Gleichlauf folgt keine Ursache.' }
];

/* ---------------- Fehlschlüsse in Argumenten ---------------- */
export const FEHLSCHLUESSE = [
  { q:'„Meine Kritik am Vorschlag ist unbegründet, weil ich mich mit dem Thema nicht auskenne.“\nWelcher Fehlschluss liegt vor, wenn jemand so argumentiert?',
    ok:'Angriff auf die Person statt auf das Argument (ad hominem)',
    bad:['Falsches Dilemma','Zirkelschluss','Autoritätsargument'],
    erklaerung:'Ob ein Argument stimmt, hängt nicht davon ab, wer es vorbringt.' },
  { q:'„Entweder wir verbieten Autos ganz oder uns ist das Klima egal.“',
    ok:'Falsches Dilemma', bad:['Strohmann','Zirkelschluss','Ad hominem'],
    erklaerung:'Zwei Möglichkeiten werden dargestellt, als gäbe es keine dritte.' },
  { q:'„Du willst weniger Hausaufgaben? Du willst also, dass niemand mehr etwas lernt.“',
    ok:'Strohmann-Argument', bad:['Falsches Dilemma','Autoritätsargument','Zirkelschluss'],
    erklaerung:'Die Gegenposition wird übertrieben, damit sie leichter zu widerlegen ist.' },
  { q:'„Das steht so im Buch, also stimmt es.“',
    ok:'Autoritätsargument', bad:['Strohmann','Ad hominem','Falsches Dilemma'],
    erklaerung:'Eine Quelle kann ein Hinweis sein, aber kein Beweis. Auch Fachleute irren.' },
  { q:'„Der Vorschlag ist gut, weil er richtig ist – und er ist richtig, weil er gut ist.“',
    ok:'Zirkelschluss', bad:['Strohmann','Ankereffekt','Falsches Dilemma'],
    erklaerung:'Die Behauptung wird mit sich selbst begründet.' },
  { q:'„Wenn wir das erlauben, wird als Nächstes alles erlaubt.“',
    ok:'Dammbruch-Argument', bad:['Zirkelschluss','Ad hominem','Autoritätsargument'],
    erklaerung:'Eine Kette unbelegter Folgen wird behauptet, ohne dass ein Glied begründet wird.' },
  { q:'„Millionen Menschen machen das so, also ist es richtig.“',
    ok:'Argument der Mehrheit', bad:['Autoritätsargument','Strohmann','Zirkelschluss'],
    erklaerung:'Verbreitung sagt nichts über Wahrheit. Jahrhundertelang hielten alle die Erde für flach.' },
  { q:'„Danach, also deswegen“: Nach der Einnahme eines Mittels ging die Erkältung weg.',
    ok:'Zeitliche Abfolge wird mit Ursache verwechselt',
    bad:['Falsches Dilemma','Strohmann','Argument der Mehrheit'],
    erklaerung:'Eine Erkältung endet nach etwa einer Woche – mit oder ohne Mittel. Lateinisch: post hoc ergo propter hoc.' }
];

/* ---------------- Stilmittel ---------------- */
export const STILMITTEL = [
  { q:'„Das Leben ist ein Fluss.“', ok:'Metapher', bad:['Vergleich','Ironie','Alliteration'],
    erklaerung:'Ein Bild wird ohne „wie“ direkt gesetzt.' },
  { q:'„Sie war schnell wie der Wind.“', ok:'Vergleich', bad:['Metapher','Personifikation','Hyperbel'],
    erklaerung:'Erkennbar am Vergleichswort „wie“.' },
  { q:'„Der Wind flüstert in den Blättern.“', ok:'Personifikation', bad:['Metapher','Ironie','Anapher'],
    erklaerung:'Etwas Unbelebtes handelt wie ein Mensch.' },
  { q:'„Ich habe dir das schon tausendmal gesagt.“', ok:'Hyperbel', bad:['Ironie','Metapher','Litotes'],
    erklaerung:'Bewusste Übertreibung.' },
  { q:'„Toll, schon wieder Regen“, sagte sie beim verregneten Ausflug.', ok:'Ironie',
    bad:['Hyperbel','Metapher','Personifikation'], erklaerung:'Gesagt wird das Gegenteil des Gemeinten.' },
  { q:'„Nicht schlecht“ als Lob für eine hervorragende Leistung.', ok:'Litotes',
    bad:['Ironie','Hyperbel','Euphemismus'], erklaerung:'Verneinung des Gegenteils – untertreibende Bejahung.' },
  { q:'„Wir kämpfen. Wir hoffen. Wir gewinnen.“ – jeder Satz beginnt gleich.', ok:'Anapher',
    bad:['Alliteration','Parallelismus','Klimax'], erklaerung:'Wiederholung am Satzanfang.' },
  { q:'„Milch macht müde Männer munter.“', ok:'Alliteration', bad:['Anapher','Assonanz','Metapher'],
    erklaerung:'Gleicher Anfangslaut in aufeinanderfolgenden Wörtern.' },
  { q:'„Er verstarb“ statt „er ist tot“.', ok:'Euphemismus', bad:['Litotes','Ironie','Metapher'],
    erklaerung:'Beschönigende Umschreibung für etwas Unangenehmes.' },
  { q:'„Ich kam, sah, siegte.“ – Steigerung in drei Schritten.', ok:'Klimax',
    bad:['Anapher','Parallelismus','Antithese'], erklaerung:'Cäsars berühmter Dreischritt, lateinisch „veni, vidi, vici“.' },
  { q:'„Heiß ist das Feuer, kalt ist das Eis.“ – Gegensätze nebeneinander.', ok:'Antithese',
    bad:['Klimax','Alliteration','Metapher'], erklaerung:'Zwei Gegensätze werden bewusst gegenübergestellt.' },
  { q:'„Ganz Berlin spricht darüber.“ – gemeint sind die Menschen der Stadt.', ok:'Metonymie',
    bad:['Metapher','Personifikation','Hyperbel'], erklaerung:'Ein Begriff steht für einen eng verwandten anderen.' }
];

/* ---------------- Wortwurzeln aus Latein und Griechisch ---------------- */
export const WORTWURZELN = [
  { wurzel:'bio-',    herkunft:'griechisch bios = Leben',        beispiel:'Biologie', frage:'Was bedeutet die Wortwurzel „bio-“?', ok:'Leben', bad:['Erde','Licht','Zahl'] },
  { wurzel:'geo-',    herkunft:'griechisch ge = Erde',           beispiel:'Geografie', frage:'Was bedeutet „geo-“?', ok:'Erde', bad:['Leben','Wasser','Mensch'] },
  { wurzel:'chrono-', herkunft:'griechisch chronos = Zeit',      beispiel:'Chronologie', frage:'Was bedeutet „chrono-“?', ok:'Zeit', bad:['Farbe','Ordnung','Ton'] },
  { wurzel:'-logie',  herkunft:'griechisch logos = Wort, Lehre', beispiel:'Psychologie', frage:'Was bedeutet die Endung „-logie“?', ok:'Lehre von etwas', bad:['Messung','Krankheit','Sammlung'] },
  { wurzel:'-skop',   herkunft:'griechisch skopein = betrachten', beispiel:'Mikroskop', frage:'Was bedeutet „-skop“?', ok:'ein Gerät zum Betrachten', bad:['ein Gerät zum Messen','ein Gerät zum Schreiben','ein Gerät zum Hören'] },
  { wurzel:'aqua-',   herkunft:'lateinisch aqua = Wasser',       beispiel:'Aquarium', frage:'Was bedeutet „aqua-“?', ok:'Wasser', bad:['Luft','Stein','Feuer'] },
  { wurzel:'terra-',  herkunft:'lateinisch terra = Erde, Land',  beispiel:'Terrasse', frage:'Was bedeutet „terra-“?', ok:'Erde oder Land', bad:['Turm','Ende','Weite'] },
  { wurzel:'audio-',  herkunft:'lateinisch audire = hören',      beispiel:'Auditorium', frage:'Was bedeutet „audio-“?', ok:'hören', bad:['sehen','sprechen','sammeln'] },
  { wurzel:'trans-',  herkunft:'lateinisch trans = hinüber',     beispiel:'Transport', frage:'Was bedeutet die Vorsilbe „trans-“?', ok:'hinüber, über etwas hinweg', bad:['gegen','unter','wieder'] },
  { wurzel:'contra-', herkunft:'lateinisch contra = gegen',      beispiel:'Kontrast', frage:'Was bedeutet „contra-“?', ok:'gegen', bad:['mit','vor','durch'] },
  { wurzel:'demo-',   herkunft:'griechisch demos = Volk',        beispiel:'Demokratie', frage:'Was bedeutet „demo-“?', ok:'Volk', bad:['Herrschaft','Ordnung','Recht'] },
  { wurzel:'-kratie', herkunft:'griechisch kratein = herrschen', beispiel:'Demokratie', frage:'Was bedeutet die Endung „-kratie“?', ok:'Herrschaft', bad:['Volk','Gesetz','Freiheit'] },
  { wurzel:'philo-',  herkunft:'griechisch philein = lieben',    beispiel:'Philosophie', frage:'Was bedeutet „philo-“?', ok:'lieben', bad:['denken','wissen','fragen'] },
  { wurzel:'-sophie', herkunft:'griechisch sophia = Weisheit',   beispiel:'Philosophie', frage:'Was bedeutet „-sophie“?', ok:'Weisheit', bad:['Rede','Schule','Streit'] },
  { wurzel:'tele-',   herkunft:'griechisch tele = fern',         beispiel:'Telefon', frage:'Was bedeutet „tele-“?', ok:'fern', bad:['Klang','schnell','klein'] },
  { wurzel:'mikro-',  herkunft:'griechisch mikros = klein',      beispiel:'Mikrofon', frage:'Was bedeutet „mikro-“?', ok:'klein', bad:['groß','viel','fein'] }
];

/* ---------------- Syllogismen: gültig oder ungültig? ---------------- */
export const SYLLOGISMEN = [
  { praemissen:'Alle Menschen sind sterblich.\nSokrates ist ein Mensch.', schluss:'Sokrates ist sterblich.',
    gueltig:true, erklaerung:'Der klassische gültige Schluss (Modus Barbara) – seit Aristoteles das Musterbeispiel.' },
  { praemissen:'Alle Hunde sind Tiere.\nAlle Katzen sind Tiere.', schluss:'Alle Hunde sind Katzen.',
    gueltig:false, erklaerung:'Beide gehören zur selben Obergruppe – das verbindet sie nicht miteinander.' },
  { praemissen:'Wenn es regnet, ist die Straße nass.\nDie Straße ist nass.', schluss:'Es hat geregnet.',
    gueltig:false, erklaerung:'Fehlschluss der Bejahung des Nachsatzes: Die Straße kann auch gewaschen worden sein.' },
  { praemissen:'Wenn es regnet, ist die Straße nass.\nEs regnet.', schluss:'Die Straße ist nass.',
    gueltig:true, erklaerung:'Gültig – das ist der Modus ponens.' },
  { praemissen:'Wenn es regnet, ist die Straße nass.\nDie Straße ist nicht nass.', schluss:'Es regnet nicht.',
    gueltig:true, erklaerung:'Gültig – das ist der Modus tollens, der Rückschluss aus dem verneinten Nachsatz.' },
  { praemissen:'Kein Vogel ist ein Fisch.\nAlle Amseln sind Vögel.', schluss:'Keine Amsel ist ein Fisch.',
    gueltig:true, erklaerung:'Gültig: Was für alle Vögel gilt, gilt auch für jede Untergruppe.' },
  { praemissen:'Einige Sportler sind Schwimmer.\nEinige Schwimmer sind Kinder.', schluss:'Einige Sportler sind Kinder.',
    gueltig:false, erklaerung:'Aus zwei „einige“-Sätzen folgt nie zwingend etwas – die Gruppen müssen sich nicht überschneiden.' },
  { praemissen:'Alle Quadrate sind Rechtecke.\nDiese Figur ist kein Rechteck.', schluss:'Diese Figur ist kein Quadrat.',
    gueltig:true, erklaerung:'Gültig – die Umkehrung durch Verneinung (Kontraposition).' }
];
