/* Hilfe beim Ablegen auf dem Startbildschirm.
   Der häufigste Grund fürs Scheitern: Die Seite wurde aus einer anderen App
   heraus geöffnet (WhatsApp, Mail, Instagram). Deren eingebauter Mini-Browser
   kann keine App ablegen – der Punkt fehlt dort einfach. Zweithäufigster Grund:
   Der Eintrag steht weit unten in der Teilen-Liste und wird übersehen. */

export function umgebung() {
  const ua = navigator.userAgent || '';
  const ios = /iPad|iPhone|iPod/.test(ua) ||
              (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const android = /Android/.test(ua);
  const standalone = window.matchMedia?.('(display-mode: standalone)')?.matches
                     || window.navigator.standalone === true;
  // Eingebaute Browser bekannter Apps
  const inApp = /FBAN|FBAV|FB_IAB|Instagram|Line\/|Twitter|MicroMessenger|WhatsApp|Snapchat|LinkedInApp|Pinterest|TikTok/i.test(ua);
  // Auf iOS können nur Safari und (seit iOS 16.4) einige Browser ablegen
  const iosSafari = ios && /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS|mercury/i.test(ua);
  const iosAndererBrowser = ios && /CriOS|FxiOS|EdgiOS|OPiOS/i.test(ua);
  return { ios, android, standalone, inApp, iosSafari, iosAndererBrowser, ua };
}

/* Liefert Titel und Schritte, passend zur erkannten Lage. */
export function anleitung(u = umgebung()) {
  if (u.standalone) return null;      // läuft bereits als App

  if (u.inApp) return {
    titel: '⚠️ Diese Seite läuft in einer anderen App',
    warnung: true,
    text: 'Sie haben den Link aus einer App heraus geöffnet (z. B. WhatsApp, Mail oder Instagram). '
        + 'Deren eingebauter Mini-Browser kann keine App ablegen – deshalb fehlt der Punkt.',
    schritte: [
      'Unten oder oben in dieser Ansicht auf das Symbol mit den drei Punkten bzw. das Kompass-Symbol tippen.',
      '„In Safari öffnen“ wählen (Android: „In Chrome öffnen“).',
      'Dort erscheint dann diese Anleitung mit den passenden Schritten.'
    ],
    adresse: true
  };

  if (u.ios && u.iosAndererBrowser) return {
    titel: '📲 Bitte in Safari öffnen',
    warnung: true,
    text: 'Auf dem iPhone legt zuverlässig nur Safari eine App auf dem Startbildschirm ab.',
    schritte: [
      'Safari öffnen.',
      'Diese Adresse eintippen oder einfügen (siehe unten).',
      'Dann dem Weg über das Teilen-Symbol folgen.'
    ],
    adresse: true
  };

  if (u.ios) return {
    titel: '📲 Auf den Home-Bildschirm legen',
    schritte: [
      'Unten in der Mitte auf das <b>Teilen-Symbol</b> tippen (Viereck mit Pfeil nach oben).',
      'In der Liste <b>nach unten scrollen</b> – „Zum Home-Bildschirm“ steht weit unten.',
      'Antippen, dann oben rechts auf <b>„Hinzufügen“</b>.'
    ],
    hinweise: [
      'Fehlt der Eintrag? Ganz nach unten scrollen → „Aktionen bearbeiten“ → bei „Zum Home-Bildschirm“ auf das grüne Plus.',
      'Im privaten Modus geht es nicht – auf einen normalen Tab wechseln.'
    ]
  };

  if (u.android) return {
    titel: '📲 Auf den Startbildschirm legen',
    schritte: [
      'Oben rechts auf das <b>Menü ⋮</b> tippen.',
      '<b>„App installieren“</b> oder „Zum Startbildschirm hinzufügen“ wählen.',
      'Bestätigen.'
    ],
    hinweise: ['Erscheint der Punkt nicht, die Seite einmal neu laden und erneut versuchen.']
  };

  return {
    titel: '📲 Als App ablegen',
    schritte: [
      'Am Rechner: in der Adresszeile auf das Installieren-Symbol klicken (Chrome, Edge).',
      'Auf dem Handy: Safari (iPhone) bzw. Chrome (Android) verwenden.'
    ]
  };
}
