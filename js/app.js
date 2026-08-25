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
    zeigeSobaldEsPasst();
  });

  /* Nicht mitten in einer Aufgabenrunde melden. Zwei Gründe: Der Streifen liegt
     über der Bedienleiste und fängt dort Tipper ab, und ein Neustart mitten in
     der Runde wirft den angefangenen Fortschritt weg. Also warten, bis das Kind
     wieder auf einem ruhigen Bildschirm ist. */
  const inEinerRunde = () => !!document.querySelector('#raus');

  function zeigeSobaldEsPasst() {
    if (inEinerRunde()) { setTimeout(zeigeSobaldEsPasst, 3000); return; }
    if (document.querySelector('.update-hinweis')) return;

    const streifen = document.createElement('div');
    streifen.className = 'update-hinweis';
    streifen.innerHTML = `
      <button type="button" class="update-text">✨ Neue Fassung bereit – tippen zum Neustart</button>
      <button type="button" class="update-weg" aria-label="Hinweis ausblenden">✕</button>`;
    streifen.querySelector('.update-text').onclick = () => location.reload();
    streifen.querySelector('.update-weg').onclick = () => streifen.remove();
    document.body.appendChild(streifen);

    /* Nach 20 Sekunden von selbst weg. Ein Balken, der dauerhaft über dem
       unteren Bildschirmrand liegt, verdeckt Knöpfe und fängt Tipper ab –
       wer die neue Fassung will, findet sie im Eltern-Bereich unter
       "Nach Aktualisierung suchen". */
    setTimeout(() => streifen.remove(), 20000);
  }
}
