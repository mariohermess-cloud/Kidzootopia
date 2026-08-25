/* Einstiegspunkt: Daten laden, Navigation verdrahten, App-Installation vorbereiten. */
import * as S from './store.js';
import { zeige } from './ui.js';

S.laden();

/* Dauerhaften Speicher anfordern: verhindert, dass der Browser den Fortschritt
   nach einigen Tagen ohne Nutzung selbsttätig aufräumt. */
S.speicherSichern();

document.querySelectorAll('.nav-btn').forEach(b =>
  b.addEventListener('click', () => zeige(b.dataset.route)));
document.getElementById('avatarBtn').addEventListener('click', () => zeige('profile'));

zeige(S.aktiv() ? 'lernen' : 'start');

/* Installations-Angebot merken – der Eltern-Bereich bietet es an. */
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); window.installPrompt = e; });

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register(new URL('../sw.js', import.meta.url));
      /* Bei jedem Start nachsehen, ob es etwas Neues gibt – und immer dann, wenn die
         App nach längerer Pause wieder in den Vordergrund kommt. Auf dem iPhone wird
         eine App vom Startbildschirm oft tagelang nicht wirklich neu gestartet,
         sondern nur wieder eingeblendet; ohne das hier bliebe sie auf ihrer Fassung
         sitzen, obwohl längst eine neue bereitliegt. */
      let zuletzt = Date.now();
      reg.update().catch(()=>{});
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState !== 'visible') return;
        if (Date.now() - zuletzt < 60_000) return;   // nicht bei jedem Wischen
        zuletzt = Date.now();
        reg.update().catch(()=>{});
      });
    } catch {}
  });

  /* Kommt im Hintergrund eine neue Fassung an, wird nicht einfach neu geladen –
     das würde ein Kind mitten in einer Aufgabe herausreißen. Stattdessen ein
     Hinweis, den man antippen kann, wenn es gerade passt. */
  let schonGemeldet = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (schonGemeldet) return;
    schonGemeldet = true;
    const hinweis = document.createElement('button');
    hinweis.className = 'update-hinweis';
    hinweis.textContent = '✨ Neue Fassung bereit – tippen zum Neustart';
    hinweis.onclick = () => location.reload();
    document.body.appendChild(hinweis);
  });
}
