/* Einstiegspunkt: Daten laden, Navigation verdrahten, App-Installation vorbereiten. */
import * as S from './store.js';
import { zeige } from './ui.js';

S.laden();

document.querySelectorAll('.nav-btn').forEach(b =>
  b.addEventListener('click', () => zeige(b.dataset.route)));
document.getElementById('avatarBtn').addEventListener('click', () => zeige('profile'));

zeige(S.aktiv() ? 'lernen' : 'start');

/* Installations-Angebot merken – der Eltern-Bereich bietet es an. */
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); window.installPrompt = e; });

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () =>
    navigator.serviceWorker.register(new URL('../sw.js', import.meta.url)).catch(()=>{}));
}
