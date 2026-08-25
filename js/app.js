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
  window.addEventListener('load', () =>
    navigator.serviceWorker.register(new URL('../sw.js', import.meta.url)).catch(()=>{}));

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
