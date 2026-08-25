/* Kleine Hörgeschichten: kurz genug zum Zuhören, mit Fragen zum Verstehen.
   Bewusst ohne Bilder – hier trainiert das Kind Zuhören und Merken.
   Jede Geschichte hat drei Fragen: was passiert (Inhalt), warum (Zusammenhang),
   und eine Frage zum Detail. */

export const GESCHICHTEN = [
  { id:'pfannkuchen', titel:'Der Pfannkuchen-Plan', emoji:'🥞', stufe:[1,3],
    text:`Emma will ihrer Oma zum Geburtstag Pfannkuchen backen. Im Schrank findet sie Mehl und Zucker, aber die Milch ist leer. Ihr Bruder Tim schlägt vor, beim Nachbarn zu klingeln. Herr Weber gibt ihnen eine ganze Flasche Milch und sagt: „Bringt mir einen Pfannkuchen zurück, dann sind wir quitt.“ Am Abend stehen zwölf Pfannkuchen auf dem Tisch – und einer davon wandert zu Herrn Weber.`,
    fragen:[
      { q:'Was fehlt Emma zum Backen?', ok:'Milch', bad:['Mehl','Zucker','Eier'] },
      { q:'Warum bekommt Herr Weber einen Pfannkuchen?', ok:'Weil er die Milch geliehen hat',
        bad:['Weil er Geburtstag hat','Weil er nebenan wohnt','Weil er gebacken hat'] },
      { q:'Wie viele Pfannkuchen stehen am Abend auf dem Tisch?', ok:'12', bad:['10','20','2'] }
    ] },

  { id:'schluessel', titel:'Der verschwundene Schlüssel', emoji:'🔑', stufe:[2,4],
    text:`Jonas kommt aus der Schule und findet den Haustürschlüssel nicht. Er denkt nach: In der Pause hat er noch damit gespielt. Danach war er auf dem Fußballplatz, dann im Bus. Er läuft zurück zum Fußballplatz – nichts. Im Bus fragt er den Fahrer. Der zieht eine Kiste hervor: „Fundsachen.“ Ganz oben liegt ein Schlüssel mit einem blauen Bären daran. Jonas atmet auf.`,
    fragen:[
      { q:'Wo findet Jonas seinen Schlüssel wieder?', ok:'im Bus bei den Fundsachen',
        bad:['auf dem Fußballplatz','in der Schule','zu Hause'] },
      { q:'Woran erkennt Jonas den Schlüssel?', ok:'an dem blauen Bären',
        bad:['an der Farbe des Schlüssels','an seinem Namen','an einer Schnur'] },
      { q:'Was macht Jonas zuerst, als er den Verlust merkt?', ok:'Er überlegt, wo er überall war',
        bad:['Er weint','Er ruft die Polizei','Er geht nach Hause'] }
    ] },

  { id:'wolke', titel:'Die Wolke, die nicht regnen wollte', emoji:'☁️', stufe:[1,3],
    text:`Eine kleine Wolke zog über das Land und war schwer vom vielen Wasser. Aber sie wollte nicht regnen, denn regnen bedeutete: kleiner werden. Unter ihr wurde das Gras braun, die Blumen ließen die Köpfe hängen. Ein Bauer schaute nach oben und seufzte. Da wurde der Wolke ganz komisch zumute. Sie schüttelte sich – und ließ alles Wasser fallen. Am nächsten Morgen war das Feld grün, und die Wolke war klein und leicht und flog höher als je zuvor.`,
    fragen:[
      { q:'Warum wollte die Wolke nicht regnen?', ok:'Weil sie dann kleiner wird',
        bad:['Weil sie müde war','Weil es kalt war','Weil der Bauer es verbot'] },
      { q:'Was passiert, nachdem die Wolke geregnet hat?', ok:'Sie wird leicht und fliegt höher',
        bad:['Sie verschwindet','Sie wird traurig','Sie fällt zu Boden'] },
      { q:'Wie sah das Gras vor dem Regen aus?', ok:'braun', bad:['grün','weiß','nass'] }
    ] },

  { id:'roboter', titel:'Robby lernt zählen', emoji:'🤖', stufe:[2,5],
    text:`Robby ist ein Roboter, der Äpfel pflücken soll. Sein Programm sagt: „Nimm drei Äpfel und lege sie in den Korb. Wiederhole das vier Mal.“ Robby arbeitet ohne Pause. Als er fertig ist, zählt der Bauer nach und lacht: Es sind genau zwölf Äpfel. Doch dann sagt Robby: „Ich habe noch einen gefunden, der auf dem Boden lag. Darf ich ihn auch nehmen?“ Der Bauer nickt – und Robby lernt an diesem Tag etwas, das nicht in seinem Programm stand.`,
    fragen:[
      { q:'Wie viele Äpfel legt Robby nach seinem Programm in den Korb?', ok:'12', bad:['3','4','7'] },
      { q:'Was tut Robby, das nicht in seinem Programm stand?', ok:'Er fragt nach dem Apfel vom Boden',
        bad:['Er zählt falsch','Er macht eine Pause','Er geht nach Hause'] },
      { q:'Wie oft soll Robby die Anweisung wiederholen?', ok:'vier Mal', bad:['drei Mal','zwölf Mal','ein Mal'] }
    ] },

  { id:'igel', titel:'Ein Igel im Laubhaufen', emoji:'🦔', stufe:[1,4],
    text:`Im Herbst harkt Familie Bauer das Laub im Garten zu einem großen Haufen. Am nächsten Morgen ist der Haufen zerwühlt. Lena entdeckt zwischen den Blättern eine kleine Nase. Ein Igel hat sich ein Winterbett gebaut. Die Familie beschließt, den Haufen stehen zu lassen. Erst im Frühling, als der Igel längst weg ist, wird das Laub weggeräumt.`,
    fragen:[
      { q:'Wozu braucht der Igel den Laubhaufen?', ok:'als Winterbett',
        bad:['zum Fressen','zum Spielen','als Versteck vor Lena'] },
      { q:'Wann wird das Laub weggeräumt?', ok:'im Frühling', bad:['am nächsten Tag','im Winter','gar nicht'] },
      { q:'Wer entdeckt den Igel?', ok:'Lena', bad:['der Vater','der Nachbar','niemand'] }
    ] },

  { id:'flasche', titel:'Die Flaschenpost', emoji:'🍾', stufe:[3,6],
    text:`Am Strand findet Nele eine Flasche mit einem Zettel darin. Darauf steht: „Wer das hier findet, soll etwas Gutes tun und dann selbst eine Flasche ins Meer werfen.“ Nele überlegt lange. Dann hilft sie einem älteren Mann, seinen Sonnenschirm zu tragen. Am Abend schreibt sie den gleichen Satz auf einen neuen Zettel. Sie weiß nicht, wer ihn finden wird – aber sie stellt sich vor, wie die Kette immer weitergeht.`,
    fragen:[
      { q:'Was soll der Finder laut Zettel tun?', ok:'etwas Gutes tun und die Flasche weiterschicken',
        bad:['die Flasche behalten','antworten und zurückschicken','zur Polizei gehen'] },
      { q:'Was tut Nele Gutes?', ok:'Sie hilft einem Mann mit dem Sonnenschirm',
        bad:['Sie sammelt Müll','Sie schenkt Geld','Sie rettet ein Tier'] },
      { q:'Was stellt Nele sich am Ende vor?', ok:'dass die Kette weitergeht',
        bad:['dass sie berühmt wird','dass die Flasche zurückkommt','dass niemand sie findet'] }
    ] },

  { id:'brueder', titel:'Zwei Brüder, ein Fahrrad', emoji:'🚲', stufe:[2,5],
    text:`Ali und Sami haben zusammen nur ein Fahrrad. Jeden Morgen streiten sie, wer fahren darf. Eines Tages schlägt ihre Mutter etwas vor: Der eine fährt bis zum großen Baum und stellt das Rad dort ab und läuft weiter. Der andere läuft bis zum Baum, steigt auf und fährt den Rest. So kommen beide schneller an als zu Fuß – und keiner muss den ganzen Weg schieben.`,
    fragen:[
      { q:'Wie lösen die Brüder das Problem?', ok:'Sie wechseln sich am Baum ab',
        bad:['Sie kaufen ein zweites Rad','Sie fahren zusammen','Sie gehen zu Fuß'] },
      { q:'Was ist der Vorteil der Lösung?', ok:'Beide sind schneller da',
        bad:['Einer darf immer fahren','Das Rad hält länger','Sie streiten mehr'] },
      { q:'Wer hat die Idee?', ok:'die Mutter', bad:['Ali','Sami','der Nachbar'] }
    ] },

  { id:'konzert', titel:'Das leiseste Konzert', emoji:'🎻', stufe:[3,6],
    text:`Die Schulklasse übt wochenlang für ein Konzert. Am Tag der Aufführung fällt der Strom aus, die Verstärker bleiben stumm. Die Lehrerin überlegt kurz und bittet alle, ganz nach vorn zu kommen und ohne Technik zu spielen. Das Publikum wird still, so still wie nie. Später sagen viele Eltern, es sei das schönste Konzert gewesen, das sie je gehört hätten.`,
    fragen:[
      { q:'Warum bleiben die Verstärker stumm?', ok:'Der Strom fällt aus',
        bad:['Sie sind kaputt','Die Lehrerin verbietet sie','Es fehlt ein Kabel'] },
      { q:'Was macht das Konzert für das Publikum besonders?', ok:'Alle hören ganz still zu',
        bad:['Es war lauter als sonst','Es dauerte länger','Es gab neue Lieder'] },
      { q:'Was schlägt die Lehrerin vor?', ok:'ohne Technik weiterzuspielen',
        bad:['das Konzert abzusagen','auf den Strom zu warten','draußen zu spielen'] }
    ] }
];
