/* Lebenskunst: Philosophie der Stoa für Kinder.
   Seneca, Epiktet und Marc Aurel schreiben über das, was Kinder täglich erleben –
   Ärger, Angst vor etwas, das vielleicht nie eintritt, Neid, Ungeduld.
   Ihre Antworten sind knapp, überprüfbar und seit zweitausend Jahren brauchbar.

   Alle Zitate sind sinngemäß ins Deutsche übertragen und mit Fundstelle versehen.
   Wo die Zuschreibung unsicher ist, steht es dabei – auch das gehört zur Bildung. */

export const DENKER = {
  seneca:    { name:'Seneca', lebte:'etwa 4 v. Chr. – 65 n. Chr.',
    wer:'Römischer Philosoph, Anwalt und Lehrer des Kaisers Nero. Schrieb Briefe an seinen Freund Lucilius, in denen er erklärt, wie man ruhig und anständig lebt.' },
  epiktet:   { name:'Epiktet', lebte:'etwa 50 – 138 n. Chr.',
    wer:'Wurde als Sklave geboren und später freigelassen. Er lehrte, dass niemand die Seele eines Menschen beherrschen kann – auch kein Herr.' },
  marcaurel: { name:'Marc Aurel', lebte:'121 – 180 n. Chr.',
    wer:'Römischer Kaiser. Schrieb nachts im Feldlager Notizen an sich selbst – nicht für Leser, sondern zur eigenen Ermahnung.' },
  sokrates:  { name:'Sokrates', lebte:'etwa 469 – 399 v. Chr.',
    wer:'Griechischer Philosoph, der nie ein Buch schrieb. Er stellte Fragen, bis seine Gesprächspartner selbst merkten, was sie wirklich dachten.' }
};

/* ------------------------- Zitate und ihre Bedeutung ------------------------- */
export const ZITATE = [
  { text:'„Nicht weil es schwer ist, wagen wir es nicht – sondern weil wir es nicht wagen, ist es schwer.“',
    denker:'seneca', quelle:'Seneca, Briefe an Lucilius 104,26',
    ok:'Vieles wirkt nur deshalb unmöglich, weil man es noch nie versucht hat',
    bad:['Schwere Dinge soll man lieber lassen','Mutige Menschen haben es leichter im Leben','Man soll nur tun, was man schon kann'] },

  { text:'„Wir leiden öfter in der Vorstellung als in Wirklichkeit.“',
    denker:'seneca', quelle:'Seneca, Briefe an Lucilius 13,4',
    ok:'Die meisten Dinge, vor denen wir Angst haben, treten nie ein',
    bad:['Man soll sich nichts vorstellen','Wirkliche Schmerzen sind nicht schlimm','Wer träumt, leidet weniger'] },

  { text:'„Alles gehört anderen – allein die Zeit gehört uns.“',
    denker:'seneca', quelle:'Seneca, Briefe an Lucilius 1,3',
    ok:'Zeit ist das Einzige, was man nie zurückbekommt – darum soll man sie nicht verschwenden',
    bad:['Man soll nichts besitzen','Uhren sind wichtiger als Geld','Andere Menschen nehmen uns alles weg'] },

  { text:'„Lang ist der Weg durch Belehrung, kurz und wirksam durch Beispiele.“',
    denker:'seneca', quelle:'Seneca, Briefe an Lucilius 6,5',
    ok:'Vormachen wirkt stärker als Erklären',
    bad:['Lehrer werden nicht gebraucht','Kurze Texte sind besser als lange','Beispiele sind schwer zu finden'] },

  { text:'„Leben muss man das ganze Leben lang lernen.“',
    denker:'seneca', quelle:'Seneca, Über die Kürze des Lebens 7',
    ok:'Man ist nie fertig – auch Erwachsene lernen weiter',
    bad:['Schule dauert zu lange','Kinder lernen schneller als Erwachsene','Wer alt ist, weiß alles'] },

  { text:'„Behandle den, der unter dir steht, so, wie du möchtest, dass der über dir dich behandelt.“',
    denker:'seneca', quelle:'Seneca, Briefe an Lucilius 47,11 – geschrieben über den Umgang mit Sklaven',
    ok:'Wie man mit Schwächeren umgeht, zeigt den eigenen Charakter',
    bad:['Man soll seinen Chef besonders gut behandeln','Es gibt Menschen, die weniger wert sind','Höfliche Menschen haben mehr Erfolg'] },

  { text:'„Wer nicht weiß, welchen Hafen er ansteuert, für den ist kein Wind der richtige.“',
    denker:'seneca', quelle:'Seneca, Briefe an Lucilius 71,3',
    ok:'Ohne Ziel nützt auch die beste Gelegenheit nichts',
    bad:['Segeln ist gefährlich','Man braucht immer Rückenwind','Häfen sind schwer zu finden'] },

  { text:'„Manches liegt in unserer Macht, manches nicht.“',
    denker:'epiktet', quelle:'Epiktet, Handbüchlein der Moral 1 – der erste Satz des Buches',
    ok:'Kraft gehört auf das, was man ändern kann – der Rest wird ertragen',
    bad:['Man kann gar nichts ändern','Starke Menschen können alles bestimmen','Man soll sich nie anstrengen'] },

  { text:'„Nicht die Dinge selbst beunruhigen die Menschen, sondern ihre Meinungen über die Dinge.“',
    denker:'epiktet', quelle:'Epiktet, Handbüchlein der Moral 5',
    ok:'Wie schlimm etwas ist, hängt auch davon ab, wie ich es ansehe',
    bad:['Es gibt nichts wirklich Schlimmes','Meinungen sind unwichtig','Man soll keine Meinung haben'] },

  { text:'„Wir haben zwei Ohren und nur einen Mund, damit wir mehr zuhören als reden.“',
    denker:'epiktet', quelle:'Diesen Satz überliefert Diogenes Laertios über Zenon von Kition; er wird auch Epiktet zugeschrieben – sicher belegt ist er für keinen von beiden',
    ok:'Zuhören bringt mehr als reden',
    bad:['Ohren sind wichtiger als der Mund','Man soll überhaupt nicht sprechen','Zwei Dinge sind besser als eines'] },

  { text:'„Die Seele färbt sich mit der Farbe ihrer Gedanken.“',
    denker:'marcaurel', quelle:'Marc Aurel, Selbstbetrachtungen V,16 (sinngemäß)',
    ok:'Woran man ständig denkt, das prägt einen mit der Zeit',
    bad:['Gedanken sind bunt','Man kann seine Gedanken nicht wählen','Farben beeinflussen die Stimmung'] },

  { text:'„Was dem Handeln im Weg steht, wird zum Weg.“',
    denker:'marcaurel', quelle:'Marc Aurel, Selbstbetrachtungen V,20 (sinngemäß)',
    ok:'Ein Hindernis kann zur Gelegenheit werden, etwas Neues zu lernen',
    bad:['Man soll Hindernisse übersehen','Wege sind immer gerade','Wer stehen bleibt, kommt weiter'] },

  { text:'„Ich weiß, dass ich nichts weiß.“',
    denker:'sokrates', quelle:'Überliefert durch Platon, verkürzt aus der „Apologie“ – wörtlich sagte Sokrates es so nie',
    ok:'Wer weiß, dass er wenig weiß, kann noch dazulernen',
    bad:['Wissen ist unwichtig','Sokrates war nicht klug','Man soll nichts lernen'] },

  { text:'„Eile mit Weile.“',
    denker:'augustus',   // steht bewusst nicht in DENKER: kein Philosoph, daher kein Autoren-Rätsel quelle:'Lateinisch „festina lente“ – Sueton überliefert es als Lieblingsspruch des Kaisers Augustus',
    ok:'Zügig arbeiten, aber ohne Hast – dann muss man nichts zweimal machen',
    bad:['Langsam ist immer besser','Wer eilt, gewinnt','Pausen sind verboten'] }
];

/* --------- Dichotomie der Kontrolle: Was liegt in meiner Hand? --------- */
export const KONTROLLE = [
  { sache:'wie sehr ich mich anstrenge',                  meins:true },
  { sache:'ob es morgen regnet',                          meins:false },
  { sache:'wie ich reagiere, wenn mich jemand ärgert',    meins:true },
  { sache:'was andere über mich denken',                  meins:false },
  { sache:'ob ich ehrlich bin',                           meins:true },
  { sache:'wer bei einem Spiel gewinnt',                  meins:false },
  { sache:'wie oft ich übe',                              meins:true },
  { sache:'ob mein Freund heute schlechte Laune hat',     meins:false },
  { sache:'ob ich jemandem helfe',                        meins:true },
  { sache:'wie groß ich werde',                           meins:false },
  { sache:'ob ich zuhöre, wenn jemand redet',             meins:true },
  { sache:'welche Note der Lehrer gibt',                  meins:false },
  { sache:'ob ich es nochmal versuche',                   meins:true },
  { sache:'ob der Bus pünktlich kommt',                   meins:false },
  { sache:'wie ich mit einem Fehler umgehe',              meins:true },
  { sache:'was gestern passiert ist',                     meins:false }
];

/* ----------------- Alltagslagen: Was würde ein Stoiker tun? ----------------- */
export const SITUATIONEN = [
  { q:'Du hast lange für einen Test geübt und trotzdem eine schlechte Note bekommen.',
    ok:'Ich schaue mir an, was ich nicht verstanden habe – geübt zu haben war trotzdem richtig',
    bad:['Ich übe nie wieder, es bringt ja nichts','Ich sage, der Lehrer ist ungerecht','Ich erzähle niemandem davon'],
    prinzip:'Das Bemühen liegt bei mir, das Ergebnis nicht ganz.',
    quelle:'Epiktet, Handbüchlein 1' },

  { q:'Ein Kind in der Klasse hat ein Fahrrad, das viel schöner ist als deines.',
    ok:'Ich freue mich über mein Rad – es bringt mich genauso gut ans Ziel',
    bad:['Ich bettle so lange, bis ich auch eines bekomme','Ich rede schlecht über sein Rad','Ich fahre gar nicht mehr Rad'],
    prinzip:'Wer hat, was er braucht, ist reich. Wer immer mehr will, bleibt arm.',
    quelle:'Seneca, Briefe an Lucilius 2,6' },

  { q:'Jemand hat dich vor anderen ausgelacht. Du bist wütend.',
    ok:'Ich warte, bis die erste Wut vorbei ist, und rede dann in Ruhe darüber',
    bad:['Ich lache ihn sofort auch aus','Ich schreie zurück','Ich tue so, als wäre nichts – für immer'],
    prinzip:'Der beste Schutz gegen den Zorn ist Aufschub. Wut wird kleiner, wenn man ihr Zeit gibt.',
    quelle:'Seneca, Über den Zorn III,12' },

  { q:'Morgen ist der erste Tag im neuen Verein. Du hast Bauchweh vor Aufregung.',
    ok:'Ich überlege, was wirklich passieren kann – meistens ist es weniger schlimm als gedacht',
    bad:['Ich sage ab, dann ist die Angst weg','Ich rede mir ein, dass es toll wird','Ich denke gar nicht mehr daran'],
    prinzip:'Wir leiden öfter in der Vorstellung als in Wirklichkeit.',
    quelle:'Seneca, Briefe an Lucilius 13,4' },

  { q:'Dein Turm aus Bausteinen fällt kurz vor der Fertigstellung um.',
    ok:'Ich schaue, an welcher Stelle er nachgab – beim nächsten Mal baue ich dort fester',
    bad:['Ich trete den Rest auch noch um','Ich baue nie wieder einen Turm','Ich sage, jemand hat gewackelt'],
    prinzip:'Was im Weg steht, wird zum Weg.',
    quelle:'Marc Aurel, Selbstbetrachtungen V,20' },

  { q:'Ein neues Kind in der Klasse spricht deine Sprache noch nicht gut.',
    ok:'Ich rede langsam und deutlich mit ihm und zeige ihm, wo alles ist',
    bad:['Ich warte, bis es besser sprechen kann','Ich lache über seine Fehler','Ich lasse die Lehrerin das machen'],
    prinzip:'Behandle den, der es schwerer hat, so, wie du behandelt werden möchtest.',
    quelle:'Seneca, Briefe an Lucilius 47,11' },

  { q:'Du wolltest zum Schwimmen, aber es regnet den ganzen Tag.',
    ok:'Ich ärgere mich kurz und suche mir dann etwas anderes',
    bad:['Ich bin den ganzen Tag schlecht gelaunt','Ich gehe trotzdem und werde krank','Ich schimpfe über das Wetter'],
    prinzip:'Verlange nicht, dass die Dinge geschehen, wie du willst.',
    quelle:'Epiktet, Handbüchlein 8' },

  { q:'Du hast aus Versehen etwas kaputtgemacht. Niemand hat es gesehen.',
    ok:'Ich sage es selbst – das ist unangenehm, aber danach ist es vorbei',
    bad:['Ich schweige, es merkt ja keiner','Ich schiebe es jemand anderem zu','Ich lege es zurück und hoffe'],
    prinzip:'Tue nichts, was du nicht auch vor Zeugen tun würdest.',
    quelle:'Seneca, Briefe an Lucilius 43,5' },

  { q:'Ein Freund hat dich nicht zu seinem Geburtstag eingeladen.',
    ok:'Ich frage ihn ruhig, warum – vielleicht gibt es einen Grund, den ich nicht kenne',
    bad:['Ich lade ihn auch nicht ein','Ich erzähle den anderen, wie gemein er ist','Ich rede nie wieder mit ihm'],
    prinzip:'Nicht die Sache selbst beunruhigt uns, sondern unsere Meinung darüber.',
    quelle:'Epiktet, Handbüchlein 5' },

  { q:'Du hast versprochen, dein Zimmer aufzuräumen, hast es aber vergessen.',
    ok:'Ich hole es sofort nach und entschuldige mich',
    bad:['Ich sage, ich hatte keine Zeit','Ich mache nur das Nötigste','Ich verspreche es für morgen'],
    prinzip:'Ein Versprechen wiegt schwerer als eine Erklärung.',
    quelle:'Seneca, Über die Wohltaten IV' }
];

/* -------- Denk-Impulse: Fragen ohne richtige Antwort (Seneca'sche Abendschau) -------- */
export const IMPULSE = [
  { frage:'Seneca prüfte jeden Abend seinen Tag: „Was hast du heute besser gemacht?“\nWas fällt dir für heute ein?',
    quelle:'Seneca, Über den Zorn III,36 – er beschreibt dort seine abendliche Selbstprüfung',
    optionen:[
      { text:'Ich war zu jemandem freundlich', antwort:'Freundlichkeit kostet nichts und wirkt am längsten. Seneca hätte das gelten lassen.' },
      { text:'Ich habe etwas zu Ende gebracht', antwort:'Etwas fertig zu machen ist schwerer als anzufangen – genau darum zählt es.' },
      { text:'Ich habe zugehört, ohne zu unterbrechen', antwort:'Zuhören ist eine Übung. Die Stoiker hielten sie für eine der schwersten.' },
      { text:'Mir fällt gerade nichts ein', antwort:'Auch das ist eine ehrliche Antwort – und ehrlich zu sich zu sein war Senecas eigentliches Ziel. Morgen gibt es einen neuen Versuch.' }
    ] },

  { frage:'Marc Aurel schrieb sich jeden Morgen auf, was ihn an diesem Tag erwarten könnte –\nauch das Unangenehme. Warum wohl?',
    quelle:'Marc Aurel, Selbstbetrachtungen II,1 – er beginnt den Tag mit dem Gedanken an schwierige Menschen',
    optionen:[
      { text:'Damit ihn nichts überrascht', antwort:'Genau so meinte er es. Was man erwartet, wirft einen nicht mehr um.' },
      { text:'Damit er sich darauf vorbereiten kann', antwort:'Richtig gedacht. Vorbereitung nimmt der Schwierigkeit die Hälfte ihrer Kraft.' },
      { text:'Damit er sich über den Rest mehr freut', antwort:'Ein schöner Gedanke – und tatsächlich schrieb er auch über Dankbarkeit für das Gewöhnliche.' },
      { text:'Das finde ich eigentlich zu düster', antwort:'Ein berechtigter Einwand. Viele Menschen sehen das so – Widerspruch ist erlaubt und in der Philosophie sogar erwünscht.' }
    ] },

  { frage:'„Was würdest du tun, wenn du wüsstest, dass niemand es je erfährt?“\nDiese Frage stellten schon die alten Philosophen.',
    quelle:'Die Frage geht auf Platons Erzählung vom Ring des Gyges zurück (Politeia II)',
    optionen:[
      { text:'Genau dasselbe wie sonst', antwort:'Das ist die Antwort, auf die Platon hinauswollte: Wer nur beobachtet anständig ist, ist es gar nicht.' },
      { text:'Ehrlich gesagt vielleicht etwas anderes', antwort:'Eine sehr ehrliche Antwort. Platon hielt genau diese Ehrlichkeit für den Anfang jeder Besserung.' },
      { text:'Das kommt darauf an, worum es geht', antwort:'Auch das ist bedacht. Die Stoiker hätten gefragt: Worauf käme es denn an?' }
    ] },

  { frage:'Epiktet war als Sklave geboren und wurde später ein berühmter Lehrer.\nEr sagte, seinen Körper könne man fesseln, seine Gedanken nicht.\nWas denkst du darüber?',
    quelle:'Epiktet, Handbüchlein 9 – „Krankheit ist ein Hindernis für den Körper, nicht für den Willen“',
    optionen:[
      { text:'Da hat er recht – Denken kann niemand verbieten', antwort:'So sah er es. Diese Überzeugung machte ihn im wörtlichen Sinn unbesiegbar.' },
      { text:'Leicht gesagt, wenn man wirklich gefangen ist', antwort:'Ein starker Einwand – und einer, den Epiktet selbst kannte, denn er hinkte zeitlebens von einer Misshandlung.' },
      { text:'Ich muss darüber noch nachdenken', antwort:'Gut. Manche Sätze braucht man Jahre, um sie zu verstehen – das ist keine Schwäche.' }
    ] },

  { frage:'Seneca riet, ab und zu freiwillig auf etwas zu verzichten,\num zu merken, dass man es aushält.\nWorauf könntest du eine Woche verzichten?',
    quelle:'Seneca, Briefe an Lucilius 18,5 – er empfahl Tage mit einfachster Kost und grober Kleidung',
    optionen:[
      { text:'Auf Süßigkeiten', antwort:'Ein klassischer Anfang. Es geht nicht ums Leiden, sondern um die Erfahrung: Es geht auch so.' },
      { text:'Auf Handy oder Fernsehen', antwort:'Das dürfte heute die schwerste Übung sein – und damit die lehrreichste.' },
      { text:'Auf mein Lieblingsspielzeug', antwort:'Mutig gewählt. Seneca ging es genau darum: zu spüren, dass man nicht abhängig ist.' },
      { text:'Auf gar nichts, das finde ich unnötig', antwort:'Auch eine Haltung. Seneca selbst lebte übrigens sehr wohlhabend – schon damals warfen ihm das viele vor.' }
    ] }
];
