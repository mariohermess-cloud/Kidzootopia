/* Oberflaeche: alle Bildschirme. Bewusst gross, ruhig und antippbar (Handy zuerst). */

import { TALENTE, WEGE, FAECHER, ZIELE, ZIEL_MAP, SKALA, AVATARE, ABZEICHEN, ETAPPEN,
         TEST_LIKERT, TEST_PAARE, TEST_SZENARIEN, TEST_PROBEN, TEST_TEILE } from './data.js';
import * as S from './store.js';
import { starteSession, empfehlungen, wegRanking, wegeNachWirkung, wegBewertung } from './engine.js';
import { auswerten, stichPaare, engeTalente } from './talenttest.js';
import { vorlesen, stopp, kannVorlesen } from './sprache.js';
import { pruefe } from './generators.js';
import { radar } from './chart.js';

const view = () => document.getElementById('view');
export const esc = s => String(s).replace(/[&<>"']/g, c =>
  ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
const fett = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
const proz = (a,b) => b ? Math.round(a/b*100) : 0;
const tage = n => `${n} ${n === 1 ? 'Tag' : 'Tage'}`;

let route = 'lernen';
export const aktuelleRoute = () => route;

export function zeige(neu, daten) {
  route = neu;
  const p = S.aktiv();
  document.querySelectorAll('.nav-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.route === neu));
  const nav = document.getElementById('nav'), top = document.getElementById('topbar');
  const chrome = !!p && !['start','test','session'].includes(neu);
  nav.hidden = !chrome; top.hidden = !p || neu === 'start';
  if (p) kopfzeile(p);
  window.scrollTo(0,0);
  ({ start:screenStart, lernen:screenLernen, talente:screenTalente, wege:screenWege,
     eltern:screenEltern, test:screenTest, session:screenSession, profile:screenProfile }[neu] || screenLernen)(p, daten);
}

function kopfzeile(p) {
  document.getElementById('avatarEmoji').textContent = p.avatar;
  document.getElementById('topName').textContent = p.name;
  const t = S.topTalente(p,1)[0];
  document.getElementById('topSub').textContent =
    p.testGemacht ? `${TALENTE[t].emoji} ${TALENTE[t].name} · ${S.etappeVon(p).name}`
                  : `${S.etappeVon(p).name} · Talent-Test offen`;
  document.getElementById('streakCount').textContent = S.serieAktuell(p);
}

/* ------------------------------ Start / Profil ------------------------------ */
function screenStart() {
  const profile = S.alleProfile();
  view().innerHTML = `
    <div class="hero">
      <h1>Kidzootopia 🌈</h1>
      <p>Jedes Kind hat ein eigenes Talent – und darf über seinen eigenen Weg zum gleichen Ziel kommen.</p>
    </div>
    ${profile.length ? `<div class="card"><h2>Wer lernt gerade?</h2>
      <div class="grid">${profile.map(p => `
        <button class="choice" data-open="${p.id}">
          <span style="font-size:26px;margin-right:10px">${p.avatar}</span>${esc(p.name)}
          <span class="muted small"> · ${S.etappeVon(p).name}</span>
        </button>`).join('')}</div></div>` : ''}
    <div class="card">
      <h2>${profile.length ? 'Neues Kind hinzufügen' : 'Los geht’s'}</h2>
      <p class="muted small">Kein Konto, kein Passwort, keine Anmeldung – Name eintragen und loslegen.</p>
      <label class="field"><span>Name</span><input type="text" id="nName" placeholder="z. B. Mia" maxlength="20"></label>
      <label class="field"><span>Etappe</span>
        <select id="nEtappe">${ETAPPEN.map(e =>
          `<option value="${e.id}" ${e.id===1?'selected':''}>${e.emoji} ${e.name} (${e.kurz})</option>`).join('')}</select></label>
      <p class="muted small" style="margin-top:-6px">Die App wächst mit: Jede Etappe hat eigene Ziele,
        eigene Hauptwerke und eigene Härte – bis hinauf zu Erwachsenen.</p>
      <label class="field"><span>Lieblingstier</span></label>
      <div class="row wrap" id="avatarWahl" style="margin-bottom:14px">
        ${AVATARE.map((a,i)=>`<button class="avatar-btn ${i===0?'sel':''}" data-av="${a}"
          style="${i===0?'border-color:var(--brand)':''}">${a}</button>`).join('')}
      </div>
      <button class="btn" id="nAnlegen">Profil anlegen</button>
    </div>
    <details class="card">
      <summary style="cursor:pointer;font-weight:700">
        Alten Fortschritt übernehmen (optional)</summary>
      <p class="muted small" style="margin-top:10px">
        <b>Nur nötig, wenn Sie die App schon einmal benutzt haben</b> und die Profile hier fehlen.
        Zum Starten brauchen Sie das nicht – legen Sie einfach oben ein Profil an.</p>
      <p class="muted small">Grund für fehlende Profile: Die App vom Startbildschirm und der Browser
        haben auf dem iPhone getrennte Speicher. Der Fortschritt liegt dann noch in der anderen
        Fassung. So holen Sie ihn:</p>
      <ol class="small" style="padding-left:20px;line-height:1.7">
        <li>Dieselbe Adresse dort öffnen, wo die Profile noch da sind (meist <b>Safari</b>).</li>
        <li>Dort unten auf <b>Eltern</b> tippen → <b>Fortschritt sichern &amp; umziehen</b>
            → <b>🔑 Umzugs-Code anzeigen</b> → <b>📋 Code kopieren</b>.</li>
        <li>Hierher zurückkommen und den Code unten einfügen.</li>
      </ol>
      <p class="muted small">Sind die Profile auch dort weg, hilft der Code nicht mehr –
        dann legen Sie oben einfach ein neues an. Ärgerlich, aber schnell wieder aufgeholt.</p>
      <button class="btn quiet" id="holen">🔑 Umzugs-Code einfügen</button>
      <div id="holBereich"></div>
    </details>`;

  view().querySelector('#holen').onclick = () => {
    const b = view().querySelector('#holBereich');
    b.innerHTML = `
      <textarea id="holFeld" rows="4" placeholder="Code hier einfügen …"
        style="width:100%;margin-top:10px;font-family:ui-monospace,monospace;font-size:.72rem;
               padding:10px;border-radius:12px;border:2px solid var(--line);
               background:var(--bg);color:var(--ink)"></textarea>
      <button class="btn small" id="holUebernehmen">Übernehmen</button>
      <div id="holErgebnis" class="small" style="margin-top:8px"></div>`;
    b.querySelector('#holUebernehmen').onclick = () => {
      try {
        const r = S.ausCode(b.querySelector('#holFeld').value);
        b.querySelector('#holErgebnis').textContent = `✅ ${r.gesamt} Profil(e) wiederhergestellt.`;
        setTimeout(() => zeige('lernen'), 900);
      } catch (e) {
        b.querySelector('#holErgebnis').textContent = '❌ Der Code passt nicht: ' + e.message;
      }
    };
  };

  let gewaehlt = AVATARE[0];
  view().querySelectorAll('[data-av]').forEach(b => b.onclick = () => {
    gewaehlt = b.dataset.av;
    view().querySelectorAll('[data-av]').forEach(x => x.style.borderColor = 'var(--line)');
    b.style.borderColor = 'var(--brand)';
  });
  view().querySelectorAll('[data-open]').forEach(b => b.onclick = () => {
    S.setzeAktiv(b.dataset.open); zeige('lernen');
  });
  view().querySelector('#nAnlegen').onclick = () => {
    const name = view().querySelector('#nName').value;
    if (!name.trim()) { view().querySelector('#nName').focus(); return; }
    S.neuesProfil({ name, avatar: gewaehlt, etappe: view().querySelector('#nEtappe').value });
    zeige('test');
  };
}

function screenProfile() {
  view().innerHTML = `<h1>Profile</h1>
    <div class="card">
      ${S.alleProfile().map(p => `<div class="row spread" style="padding:10px 0;border-bottom:1px solid var(--line)">
        <div class="row"><span style="font-size:26px">${p.avatar}</span>
          <div><b>${esc(p.name)}</b><div class="muted small">${S.etappeVon(p).emoji} ${S.etappeVon(p).name} · ${p.stats.aufgabenGesamt} Aufgaben</div></div></div>
        <div class="row">
          <button class="btn small ghost" data-use="${p.id}">wählen</button>
          <button class="btn small danger" data-del="${p.id}">löschen</button>
        </div></div>`).join('')}
    </div>
    <button class="btn ghost" id="neu">➕ Neues Kind</button>`;
  view().querySelectorAll('[data-use]').forEach(b => b.onclick = () => { S.setzeAktiv(b.dataset.use); zeige('lernen'); });
  view().querySelectorAll('[data-del]').forEach(b => b.onclick = () => {
    if (confirm('Dieses Profil mit allem Fortschritt löschen?')) {
      S.loescheProfil(b.dataset.del); zeige(S.aktiv() ? 'profile' : 'start');
    }});
  view().querySelector('#neu').onclick = () => zeige('start');
}

/* ------------------------------ Talent-Test ------------------------------ */
/* Fünf Teile mit unterschiedlichen Frageformen. Nach jedem Teil kann das Kind
   aufhören – das Ergebnis steht dann schon, jeder weitere Teil verfeinert es. */
function screenTest(p) {
  const antworten = { likert:[], paare:[], szenarien:[], proben:[], stich:[] };
  const mischen = a => a.map(v=>[Math.random(),v]).sort((x,y)=>x[0]-y[0]).map(v=>v[1]);
  const likert = mischen([...TEST_LIKERT]);
  const paare = mischen([...TEST_PAARE]);
  const szenarien = mischen([...TEST_SZENARIEN]);
  const proben = mischen([...TEST_PROBEN]);
  let stich = [];

  const kopf = (teilNr, i, n) => {
    const teil = TEST_TEILE[teilNr];
    return `<div class="row spread"><span class="pill">${teil.emoji} Teil ${teilNr+1}/5 · ${teil.titel}</span>
        <span class="muted small">${i+1} / ${n}</span></div>
      <div class="bar" style="margin:12px 0 18px"><i style="width:${i/n*100}%"></i></div>`;
  };

  /* Zwischenstand: weitermachen oder Ergebnis ansehen */
  const pause = (naechsterTeil) => {
    const teil = TEST_TEILE[naechsterTeil];
    const zwischen = auswerten(antworten);
    const top = Object.entries(zwischen.werte).sort((a,b)=>b[1]-a[1])[0];
    view().innerHTML = `
      <div class="hero"><h2>Geschafft! 🎉</h2>
        <p>Bis hierhin sieht es nach <b>${TALENTE[top[0]].emoji} ${TALENTE[top[0]].name}</b> aus.</p></div>
      <div class="card">
        <h3>${teil.emoji} Weiter mit: ${teil.titel}</h3>
        <p class="muted small">${teil.info}</p>
        <p class="small">Jeder weitere Teil macht dein Talent-Radar genauer. Du kannst aber auch
          jetzt schon aufhören und später weitermachen.</p>
        <button class="btn" id="weiterTeil">Weiter zu Teil ${naechsterTeil+1} ${teil.emoji}</button>
        <button class="btn quiet" id="fertigJetzt" style="margin-top:10px">Ergebnis jetzt ansehen</button>
      </div>`;
    view().querySelector('#weiterTeil').onclick = () => starts[naechsterTeil]();
    view().querySelector('#fertigJetzt').onclick = fertig;
  };

  /* Teil 1: Vorlieben (Skala) */
  const teil1 = (i = 0) => {
    if (i >= likert.length) return pause(1);
    const f = likert[i];
    view().innerHTML = `<div class="card">${kopf(0, i, likert.length)}
        <p class="task pop">${esc(f.q)}</p>
        <div class="scale">${SKALA.map(sk =>
          `<button data-v="${sk.v}"><b>${sk.em}</b><small>${sk.label}</small></button>`).join('')}</div>
        ${i>0?'<button class="btn quiet small" id="zurueck" style="margin-top:14px">← zurück</button>':''}
      </div>
      <p class="muted small center">Es gibt kein Richtig oder Falsch. Antworte einfach ehrlich.</p>`;
    view().querySelectorAll('[data-v]').forEach(b => b.onclick = () => {
      antworten.likert[i] = { t: f.t, v: Number(b.dataset.v) }; teil1(i+1);
    });
    view().querySelector('#zurueck')?.addEventListener('click', () => teil1(i-1));
  };

  /* Teil 2: Entweder-oder */
  const teil2 = (i = 0) => {
    if (i >= paare.length) return pause(2);
    const f = paare[i];
    const links = Math.random() < .5;
    const [ea, eb] = links ? [f.a, f.b] : [f.b, f.a];
    const [ta, tb] = links ? [f.fa, f.fb] : [f.fb, f.fa];
    view().innerHTML = `<div class="card">${kopf(1, i, paare.length)}
        <p class="task pop">Was machst du lieber?</p>
        <div class="choices">
          <button class="choice" data-w="${ea}" data-l="${eb}">${esc(ta)}</button>
          <button class="choice" data-w="${eb}" data-l="${ea}">${esc(tb)}</button>
        </div>
      </div>
      <p class="muted small center">Auch wenn du beides magst: Wähl das, was dir zuerst Spaß macht.</p>`;
    view().querySelectorAll('[data-w]').forEach(b => b.onclick = () => {
      antworten.paare[i] = { gewinner: b.dataset.w, verlierer: b.dataset.l }; teil2(i+1);
    });
  };

  /* Teil 3: Szenarien */
  const teil3 = (i = 0) => {
    if (i >= szenarien.length) return pause(3);
    const f = szenarien[i];
    const opts = mischen([...f.opt]);
    view().innerHTML = `<div class="card">${kopf(2, i, szenarien.length)}
        <p class="task pop">${esc(f.q)}</p>
        <div class="choices">${opts.map(o =>
          `<button class="choice" data-t="${o.t}">${esc(o.text)}</button>`).join('')}</div>
      </div>`;
    view().querySelectorAll('[data-t]').forEach(b => b.onclick = () => {
      antworten.szenarien[i] = { gewaehlt: b.dataset.t, angeboten: f.opt.map(o => o.t) }; teil3(i+1);
    });
  };

  /* Teil 4: Kleine Proben – mit Zeitmessung */
  const teil4 = (i = 0) => {
    if (i >= proben.length) return pause(4);
    const f = proben[i];
    const start = performance.now();
    view().innerHTML = `<div class="card">${kopf(3, i, proben.length)}
        <p class="task pop">${esc(f.q)}</p>
        <div class="choices">${mischen([...f.optionen]).map(o =>
          `<button class="choice" data-o="${esc(o)}">${esc(o)}</button>`).join('')}</div>
      </div>
      <p class="muted small center">Denk nach – aber trödle nicht. Beides zählt.</p>`;
    view().querySelectorAll('[data-o]').forEach(b => b.onclick = () => {
      antworten.proben[i] = { t: f.t, richtig: b.dataset.o === f.a, ms: performance.now() - start };
      teil4(i+1);
    });
  };

  /* Teil 5: Feinschliff – nur dort, wo Talente dicht beieinander liegen */
  const teil5 = (i = 0) => {
    if (i === 0) {
      stich = stichPaare(auswerten(antworten).werte, 4);
      if (!stich.length) return fertig();
    }
    if (i >= stich.length) return fertig();
    const f = stich[i];
    view().innerHTML = `<div class="card">${kopf(4, i, stich.length)}
        <p class="task pop">Hier ist es noch eng – was zieht dich mehr?</p>
        <div class="choices">
          <button class="choice" data-w="${f.a}" data-l="${f.b}">${esc(f.fa)}</button>
          <button class="choice" data-w="${f.b}" data-l="${f.a}">${esc(f.fb)}</button>
        </div>
      </div>`;
    view().querySelectorAll('[data-w]').forEach(b => b.onclick = () => {
      antworten.stich[i] = { gewinner: b.dataset.w, verlierer: b.dataset.l }; teil5(i+1);
    });
  };

  const starts = [teil1, teil2, teil3, teil4, teil5];

  const fertig = () => {
    const ergebnis = S.testAuswerten(p, antworten);
    kopfzeile(p);
    const werte = S.talentWerte(p);
    const top = S.topTalente(p, 3);
    const teileAnzahl = ergebnis.verwendet.length + (antworten.stich.length ? 1 : 0);
    view().innerHTML = `
      <div class="hero"><h1>Dein Talent-Radar ist fertig! 🎉</h1>
        <p>${esc(p.name)}, so lernst du am liebsten:</p></div>
      <div class="card">${radar(werte)}</div>
      <div class="card">
        ${top.map((t,idx) => `<div class="talent-row">
          <span class="em">${TALENTE[t].emoji}</span>
          <div class="tx"><b>${idx===0?'⭐ ':''}${TALENTE[t].name}</b>
            <span class="muted small">${TALENTE[t].staerke}</span></div>
          <span class="val">${werte[t]}</span></div>`).join('')}
        <p class="muted small" style="margin-top:10px">
          Grundlage: ${teileAnzahl} von 5 Testteilen.
          ${teileAnzahl < 4 ? 'Mit den übrigen Teilen wird das Radar noch genauer.' : ''}
          Und es lernt weiter mit: Je mehr du übst, desto besser kennt dich die App.</p>
      </div>
      <button class="btn" id="losgehts">Jetzt lernen 🚀</button>`;
    view().querySelector('#losgehts').onclick = () => zeige('lernen');
  };

  /* Startbildschirm des Tests */
  view().innerHTML = `
    <div class="hero"><h1>Talent-Test 🧭</h1>
      <p>Fünf kurze Teile. Danach weiß die App, auf welchem Weg du am leichtesten lernst.</p></div>
    <div class="card">
      <ul class="clean">${TEST_TEILE.map((t,i) => `<li>
        <b>${t.emoji} Teil ${i+1}: ${t.titel}</b>
        <div class="muted small">${t.info}</div></li>`).join('')}</ul>
      <p class="small muted">Du kannst nach jedem Teil aufhören – das Ergebnis steht dann schon,
        es wird mit jedem Teil nur genauer.</p>
      <button class="btn" id="testStart">Los geht’s</button>
    </div>`;
  view().querySelector('#testStart').onclick = () => teil1();
}

/* ------------------------------ Lernen (Start) ------------------------------ */
function screenLernen(p) {
  const ziele = S.zieleFuerKlasse(p);
  const heuteAufgaben = p.stats.tage[new Date().toISOString().slice(0,10)] || 0;
  const tagesziel = 10;
  view().innerHTML = `
    ${p.testGemacht ? '' : `<div class="card" style="border-color:var(--brand)">
      <h3>🧭 Talent-Test machen</h3>
      <p class="muted small">24 kurze Fragen – danach passt die App jede Aufgabe an ${esc(p.name)} an.</p>
      <button class="btn" id="zumTest">Test starten</button></div>`}
    <div class="hero">
      <h2>Heutige Mission</h2>
      <p>8 Aufgaben – auf deinem Weg zusammengestellt.</p>
      <button class="btn" id="mission">Mission starten 🚀</button>
    </div>
    <div class="card" style="border:2px solid var(--brand)">
      <div class="row spread">
        <div style="flex:1">
          <b>🏛️ Knacknuss</b>
          <div class="muted small">Ein berühmtes Rätsel – zum Festbeißen.
            Tipps gibt es nur, wenn du sie holst.</div>
        </div>
        <button class="btn small" id="knacknuss">Los</button>
      </div>
    </div>
    <div class="card">
      <div class="row spread"><b>Heute geschafft</b><span class="muted small">${heuteAufgaben} / ${tagesziel}</span></div>
      <div class="bar ${heuteAufgaben>=tagesziel?'ok':''}" style="margin-top:8px">
        <i style="width:${Math.min(100, heuteAufgaben/tagesziel*100)}%"></i></div>
    </div>
    <h2>Fächer</h2>
    <div class="tiles" style="margin-bottom:16px">
      ${Object.entries(FAECHER).map(([k,f]) => {
        const zs = ziele.filter(z => z.fach===k).map(z => S.zielStand(p, z.id));
        const g = zs.reduce((a,z)=>a+z.gesamt,0), r = zs.reduce((a,z)=>a+z.richtig,0);
        return `<button class="tile" data-fach="${k}"><span class="em">${f.emoji}</span>
          <b>${f.name}</b><div class="bar"><i style="width:${proz(r,g)}%"></i></div>
          <span class="muted small">${g ? proz(r,g)+' % richtig' : 'noch nicht geübt'}</span></button>`;
      }).join('')}
    </div>
    <h2>Lernziele</h2>
    <div class="card flat">
      <ul class="clean">${ziele.map(z => {
        const s = S.zielStand(p, z.id);
        const weg = WEGE[wegRanking(p,z)[0]];
        return `<li><button class="row spread" data-ziel="${z.id}"
            style="width:100%;background:none;border:0;color:inherit;text-align:left;cursor:pointer;padding:4px 0">
          <span style="flex:1">
            <b>${FAECHER[z.fach].emoji} ${esc(z.titel)}</b>
            <span class="muted small" style="display:block">Dein Weg: ${weg.emoji} ${weg.name} · Level ${s.level}/5 ${s.gemeistert?'· 🎓 gemeistert':''}</span>
            <span class="bar" style="display:block;margin-top:6px"><i style="width:${Math.min(100, s.level/5*100)}%"></i></span>
          </span><span class="pill grey">▶</span></button></li>`;
      }).join('')}</ul>
    </div>`;
  view().querySelector('#zumTest')?.addEventListener('click', () => zeige('test'));
  view().querySelector('#mission').onclick = () => zeige('session', { laenge:8 });
  view().querySelector('#knacknuss').onclick = () => zeige('session', { zielId:'knacknuss', laenge:3 });
  view().querySelectorAll('[data-fach]').forEach(b => b.onclick = () => zeige('session', { fach:b.dataset.fach, laenge:8 }));
  view().querySelectorAll('[data-ziel]').forEach(b => b.onclick = () => zeige('session', { zielId:b.dataset.ziel, laenge:8 }));
}

/* ------------------------------ Übungs-Session ------------------------------ */
function screenSession(p, opts = {}) {
  const sess = starteSession(p, opts);
  const status = [];

  let startZeit = 0, tippsGenutzt = 0;
  const naechste = () => {
    tippsGenutzt = 0;
    const a = sess.naechste();
    if (!a) return ende();
    startZeit = performance.now();
    render(a, null);
  };

  const render = (a, ergebnis, eingabe = '') => {
    const punkte = Array.from({length: sess.laenge}, (_,i) =>
      `<i class="${status[i] || (i===sess.index?'now':'')}"></i>`).join('');
    const hatHoertext = !!a.hoertext;
    view().innerHTML = `
      <div class="row spread" style="margin-bottom:10px">
        <button class="btn quiet small" id="raus">✕ Beenden</button>
        <span class="pill grey">${FAECHER[a.ziel.fach].emoji} ${esc(a.ziel.titel)} · Level ${a.level}</span>
      </div>
      <div class="progress-dots">${punkte}</div>
      ${hatHoertext ? `<div class="card hoer">
        <h3>${esc(a.titel || 'Hör gut zu')}</h3>
        <button class="btn" id="playHoer">▶️ Geschichte anhören</button>
        <button class="btn quiet" id="zeigeText" style="margin-top:10px">📖 Text zeigen</button>
        <p id="hoertext" class="small" hidden style="margin-top:12px;white-space:pre-wrap">${esc(a.hoertext)}</p>
      </div>` : ''}
      <div class="card">
        <div class="row spread">
          <span class="wegtag">${a.wegInfo.emoji} ${a.wegInfo.name}${a.bruecke ? ' · Brücke 🌉' : ''}</span>
          ${kannVorlesen() ? '<button class="btn small ghost" id="lies" title="Vorlesen">🔊</button>' : ''}
        </div>
        <p class="task pop">${esc(a.frage)}</p>
        <div id="antwortbereich"></div>
        <div id="tippBereich"></div>
        <div id="fb"></div>
      </div>
      <p class="muted small center">${esc(a.wegInfo.hinweis)}</p>`;
    view().querySelector('#raus').onclick = () => { stopp(); zeige('lernen'); };

    /* Vorlesen */
    const vorleseText = () => [a.hoertext, a.frage,
      a.typ === 'choice' ? 'Antworten: ' + a.optionen.join(', ') : ''].filter(Boolean).join('. ');
    view().querySelector('#lies')?.addEventListener('click', () =>
      vorlesen(hatHoertext ? a.frage : vorleseText()));
    view().querySelector('#playHoer')?.addEventListener('click', e => {
      e.target.textContent = '🔊 Wird vorgelesen …';
      vorlesen(a.hoertext, { tempo: 0.9, beiEnde: () => { e.target.textContent = '🔁 Nochmal anhören'; } });
    });
    view().querySelector('#zeigeText')?.addEventListener('click', e => {
      const t = view().querySelector('#hoertext');
      t.hidden = !t.hidden;
      e.target.textContent = t.hidden ? '📖 Text zeigen' : '🙈 Text verbergen';
    });
    if (ergebnis === null && p.vorlesen && kannVorlesen()) {
      // Vorlesen ist eingeschaltet: Aufgabe direkt ansagen
      vorlesen(hatHoertext ? a.hoertext : vorleseText(), { tempo: 0.9 });
    }

    const bereich = view().querySelector('#antwortbereich');

    if (a.typ === 'choice') {
      bereich.innerHTML = `<div class="choices">${a.optionen.map(o =>
        `<button class="choice" data-o="${esc(o)}">${esc(o)}</button>`).join('')}</div>`;
      if (ergebnis === null) bereich.querySelectorAll('[data-o]').forEach(b =>
        b.onclick = () => auswerten(a, b.dataset.o));
      else bereich.querySelectorAll('[data-o]').forEach(b => {
        const ok = pruefe(a, b.dataset.o);
        b.classList.add(ok ? 'correct' : (b.dataset.o === eingabe ? 'wrong' : 'dim'));
        b.disabled = true;
      });

    } else if (a.typ === 'nachdenken') {
      /* Keine richtige Antwort: Jede Wahl bekommt eine eigene Rückmeldung. */
      bereich.innerHTML = `<div class="choices">${a.optionen.map(o =>
        `<button class="choice denk" data-o="${esc(o)}" ${ergebnis!==null?'disabled':''}
          >${esc(o)}</button>`).join('')}</div>`;
      if (ergebnis === null) bereich.querySelectorAll('[data-o]').forEach(b =>
        b.onclick = () => auswerten(a, b.dataset.o));
      else bereich.querySelectorAll('[data-o]').forEach(b =>
        b.classList.toggle('gewaehlt', b.dataset.o === eingabe));

    } else if (a.typ === 'ordnen') {
      /* Zum Legen: Teile nacheinander antippen, Reihenfolge entsteht oben. */
      let gelegt = ergebnis !== null ? String(eingabe).split(' ~ ') : [];
      const zeichnen = () => {
        const offen = a.elemente.filter(e => !gelegt.includes(e));
        bereich.innerHTML = `
          <div class="ordnen-reihe" id="reihe">
            ${gelegt.length ? gelegt.map((e,i) =>
              `<span class="teil gelegt"><b>${i+1}</b> ${esc(e)}</span>`).join('')
              : '<span class="muted small">Tippe unten in der richtigen Reihenfolge …</span>'}
          </div>
          <div class="ordnen-teile">${offen.map(e =>
            `<button class="teil" data-e="${esc(e)}">${esc(e)}</button>`).join('')}</div>
          ${gelegt.length && ergebnis === null
            ? '<button class="btn quiet small" id="reset" style="margin-top:10px">↺ Nochmal legen</button>' : ''}`;
        if (ergebnis !== null) return;
        bereich.querySelectorAll('[data-e]').forEach(b => b.onclick = () => {
          gelegt.push(b.dataset.e);
          if (gelegt.length === a.elemente.length) auswerten(a, gelegt.join(' → '));
          else zeichnen();
        });
        bereich.querySelector('#reset')?.addEventListener('click', () => { gelegt = []; zeichnen(); });
      };
      zeichnen();

    } else {
      bereich.innerHTML = `
        <label class="field" style="margin-top:14px"><span class="sr">Antwort</span>
          <input type="text" inputmode="numeric" id="eingabe" autocomplete="off"
            placeholder="Deine Antwort" ${ergebnis!==null?'disabled':''} value="${esc(eingabe)}"></label>
        ${ergebnis===null?'<button class="btn" id="pruefen">Prüfen</button>':''}`;
      const feld = bereich.querySelector('#eingabe');
      if (ergebnis === null) {
        feld.focus();
        bereich.querySelector('#pruefen').onclick = () => auswerten(a, feld.value);
        feld.addEventListener('keydown', e => { if (e.key === 'Enter') auswerten(a, feld.value); });
      }
    }

    /* Tippleiter: Wer allein draufkommt, bekommt mehr Anerkennung –
       wer feststeckt, bekommt einen Anstoß statt der Lösung. */
    const tippBereich = view().querySelector('#tippBereich');
    const tippsZeichnen = () => {
      if (!a.tipps?.length || ergebnis !== null) { tippBereich.innerHTML = ''; return; }
      tippBereich.innerHTML = `
        ${a.tipps.slice(0, tippsGenutzt).map((t,i) =>
          `<div class="tipp">💡 <b>Tipp ${i+1}:</b> ${esc(t)}</div>`).join('')}
        ${tippsGenutzt < a.tipps.length
          ? `<button class="btn quiet small" id="tippHolen" style="margin-top:10px">
               🔎 ${tippsGenutzt ? 'Noch ein Tipp' : 'Ich brauche einen Tipp'}
               (${a.tipps.length - tippsGenutzt} übrig)</button>`
          : '<p class="small muted">Mehr Tipps gibt es nicht – jetzt hilft nur Nachdenken.</p>'}`;
      tippBereich.querySelector('#tippHolen')?.addEventListener('click', () => {
        tippsGenutzt++; tippsZeichnen();
      });
    };
    tippsZeichnen();

    if (ergebnis !== null) {
      const denkAufgabe = a.typ === 'nachdenken';
      view().querySelector('#fb').innerHTML = denkAufgabe ? `
        <div class="feedback denk pop">
          <div style="font-weight:700;margin-bottom:6px">🏛️ Danke fürs Nachdenken.</div>
          ${esc(a.rueckmeldungen?.[eingabe] || '')}
          <div class="small" style="margin-top:8px;font-weight:500">
            Hier gibt es kein Richtig und kein Falsch – deshalb zählt diese Aufgabe
            auch in keiner Quote mit.</div>
        </div>
        ${a.quelle ? `<div class="quelle">📜 ${esc(a.quelle)}</div>` : ''}
        <button class="btn" id="weiter" style="margin-top:12px">
          ${sess.index >= sess.laenge ? 'Ergebnis ansehen' : 'Weiter →'}</button>` : `
        <div class="feedback ${ergebnis?'ok':'bad'} pop">
          ${ergebnis ? '✅ Richtig! Super gemacht.'
            : `❌ Nicht ganz. Richtig wäre: <u>${esc(a.antwort)}</u>`}
          ${a.hilfe ? `<div class="small" style="margin-top:6px;font-weight:500">💡 ${esc(a.hilfe)}</div>` : ''}
          ${ergebnis && a.knacknuss && tippsGenutzt === 0
            ? '<div class="small" style="margin-top:6px">🧠 Ohne Tipp geknackt – stark.</div>' : ''}
        </div>
        ${a.quelle ? `<div class="quelle">📜 ${esc(a.quelle)}</div>` : ''}
        <button class="btn" id="weiter" style="margin-top:12px">
          ${sess.index >= sess.laenge ? 'Ergebnis ansehen' : 'Weiter →'}</button>`;
      view().querySelector('#weiter').onclick = () => { stopp(); naechste(); };
    }
  };

  const auswerten = (a, eingabe) => {
    if (a.typ === 'text' && !String(eingabe).trim()) return;
    const ms = startZeit ? performance.now() - startZeit : 0;
    const ok = a.keineWertung ? true : pruefe(a, eingabe);
    status[sess.index] = a.keineWertung ? 'denk' : (ok ? 'done' : 'miss');
    sess.index++;
    if (a.keineWertung) sess.laenge--;          // zählt nicht in die Quote der Runde
    else if (ok) sess.richtig++;
    if (!a.keineWertung) sess.verlauf.push({ ziel:a.ziel.id, weg:a.weg, ok, bruecke:a.bruecke, ms });
    // Zeit fliesst in die Wirksamkeit eines Weges ein – schnell und sicher zaehlt mehr.
    S.verbuche(p, { zielId:a.ziel.id, weg:a.weg, level:a.level, richtig:ok, bruecke:a.bruecke, ms,
                    tippsGenutzt, knacknuss: !!a.knacknuss, keineWertung: !!a.keineWertung });
    if (ok && navigator.vibrate) navigator.vibrate(20);
    render(a, ok, String(eingabe));
  };

  const ende = () => {
    const quote = proz(sess.richtig, sess.laenge);
    const neueAbzeichen = S.pruefeAbzeichen(p);
    const perWeg = {};
    sess.verlauf.forEach(v => { (perWeg[v.weg] ||= {ok:0,n:0}); perWeg[v.weg].n++; if (v.ok) perWeg[v.weg].ok++; });
    view().innerHTML = `
      <div class="hero"><h1>${quote>=80?'Stark! 🌟':quote>=50?'Gut gemacht! 👏':'Weiter so! 💪'}</h1>
        <p>${sess.richtig} von ${sess.laenge} richtig · ${quote} %</p></div>
      <div class="card">
        <h3>Deine Wege in dieser Runde</h3>
        ${Object.entries(perWeg).map(([w,v]) => `<div class="talent-row">
          <span class="em">${WEGE[w].emoji}</span>
          <div class="tx"><b>${WEGE[w].name}</b><span class="bar" style="display:block;margin-top:4px"><i style="width:${proz(v.ok,v.n)}%"></i></span></div>
          <span class="val">${v.ok}/${v.n}</span></div>`).join('')}
      </div>
      ${neueAbzeichen.length ? `<div class="card center"><h3>Neues Abzeichen!</h3>
        ${neueAbzeichen.map(a=>`<div class="badge-emoji">${a.em}</div><b>${a.name}</b>`).join('')}</div>` : ''}
      <button class="btn" id="nochmal">Noch eine Runde 🔁</button>
      <button class="btn quiet" id="heim" style="margin-top:10px">Zur Übersicht</button>`;
    view().querySelector('#nochmal').onclick = () => zeige('session', opts);
    view().querySelector('#heim').onclick = () => zeige('lernen');
  };

  naechste();
}

/* ------------------------------ Talente ------------------------------ */
function screenTalente(p) {
  const werte = S.talentWerte(p);
  const sortiert = Object.entries(werte).sort((a,b)=>b[1]-a[1]);
  view().innerHTML = `
    <h1>Talent-Radar</h1>
    ${p.testGemacht ? '' : '<div class="card"><p>Der Talent-Test ist noch offen – die Werte sind bisher nur geschätzt.</p></div>'}
    <div class="card">${radar(werte)}</div>
    <div class="card">
      ${sortiert.map(([k,v],i) => `<div class="talent-row">
        <span class="em">${TALENTE[k].emoji}</span>
        <div class="tx"><b>${i===0?'⭐ ':''}${TALENTE[k].name}</b>
          <span class="bar" style="display:block;margin-top:5px"><i style="width:${v}%"></i></span>
          <span class="muted small">${TALENTE[k].kurz}</span></div>
        <span class="val">${v}</span></div>`).join('')}
    </div>
    <div class="card">
      <h3>Abzeichen</h3>
      <div class="row wrap">
        ${ABZEICHEN.map(a => { const hat = p.abzeichen.includes(a.id);
          return `<div style="width:76px;text-align:center;opacity:${hat?1:.3};margin-bottom:10px">
            <div class="badge-emoji">${a.em}</div><div class="small">${a.name}</div></div>`; }).join('')}
      </div>
    </div>
    <button class="btn ghost" id="retest">Talent-Test ${p.testGemacht?'wiederholen':'starten'}</button>
    <p class="muted small center" style="margin-top:8px">Kinder verändern sich – der Test darf alle paar Monate neu gemacht werden.</p>`;
  view().querySelector('#retest').onclick = () => zeige('test');
}

/* ------------------------------ Wege ------------------------------ */
function screenWege(p) {
  const werte = S.talentWerte(p);
  const genutzt = p.wegeGenutzt;
  const maxN = Math.max(1, ...Object.values(genutzt));
  view().innerHTML = `
    <h1>Ein Ziel – viele Wege</h1>
    <div class="card">
      <p>Alle Kinder lernen dasselbe. Aber ${esc(p.name)} bekommt die Aufgaben in der Sprache seines Talents.
      Jede 5. Aufgabe ist bewusst eine <b>Brücke 🌉</b> über einen anderen Weg – so wächst auch das, was noch schwerfällt.</p>
    </div>
    <div class="card">
      <h3>Deine Wege</h3>
      <p class="muted small">Der Balken zeigt, wie gut es über diesen Weg tatsächlich läuft –
        gemessen an deinen Aufgaben, nicht am Test.</p>
      ${Object.entries(WEGE).map(([k,w]) => {
        const wirk = S.wegWirksamkeit(p, k);
        const genug = wirk.n >= 5;
        return { k, w, wirk, genug };
      }).sort((a,b) => (b.genug?b.wirk.wert:-1) - (a.genug?a.wirk.wert:-1)).map(({k,w,wirk,genug}) => `
        <div class="talent-row">
          <span class="em">${w.emoji}</span>
          <div class="tx"><b>${w.name}</b>
            <span class="bar ${genug && wirk.wert>=75 ? 'ok':''}" style="display:block;margin-top:5px">
              <i style="width:${genug ? wirk.wert : 0}%"></i></span>
            <span class="muted small">${genug
              ? `${wirk.wert} % Treffer · ${wirk.n} Aufgaben`
              : `noch zu wenig geübt (${wirk.n} von 5)`}</span></div>
          <span class="val">${genutzt[k]||0}×</span></div>`).join('')}
    </div>
    <h2>Beispiel: dasselbe Ziel, vier Wege</h2>
    <div class="card">
      <b>🔢 ${ZIEL_MAP.einmaleins.titel}</b>
      <p class="muted small">${ZIEL_MAP.einmaleins.kompetenz}</p>
      <ul class="clean">
        <li>🥁 <b>Rhythmus-Weg:</b> „3 – 6 – 9 – __“ im Takt weiterklatschen.</li>
        <li>🧱 <b>Bau-Weg:</b> 4 Reihen mit je 6 Punkten – wie viele Punkte?</li>
        <li>📖 <b>Geschichten-Weg:</b> Lina packt 4 Tüten mit je 6 Bonbons.</li>
        <li>🤖 <b>Code-Weg:</b> wiederhole 4 mal { sammle 6 Münzen }</li>
      </ul>
      <p class="small muted">Vier Kinder, vier Wege – am Ende können alle 4 × 6.</p>
    </div>
    <div class="card">
      <h3>🏛️ Warum alte Rätsel?</h3>
      <p class="small">Die Aufgaben im Fach <b>Klassiker</b> sind zwischen 100 und über 1000 Jahre alt –
        von Alkuin (um 800) über Gauß und Dudeney bis zum Ziegenproblem von 1975. Sie haben überlebt,
        weil sie etwas können: Sie lassen sich in einem Satz erklären, wirken zunächst unlösbar und
        werden mit einem einzigen Gedanken plötzlich einfach.</p>
      <p class="small">Deshalb gibt es hier keine sofortige Hilfe. Wer nicht weiterkommt, holt sich
        einen Tipp – und noch einen. Wer ohne Tipp löst, bekommt das ausdrücklich gesagt.
        Zu jeder Aufgabe steht am Ende, wer sie sich ausgedacht hat und wann.</p>
    </div>
    <h2>Alle Lernziele</h2>
    <div class="card flat"><ul class="clean">
      ${ZIELE.map(z => `<li><b>${FAECHER[z.fach].emoji} ${esc(z.titel)}</b>
        <div class="muted small">${esc(z.kompetenz)}</div>
        <div class="row wrap" style="margin-top:6px">
          ${z.wege.map(w=>`<span class="pill">${WEGE[w].emoji} ${WEGE[w].name}</span>`).join('')}
        </div></li>`).join('')}
    </ul></div>`;
}

/* ------------------------------ Eltern ------------------------------ */
function screenEltern(p) {
  const s = p.stats;
  const ziele = S.zieleFuerKlasse(p);
  const tipps = empfehlungen(p);
  const letzte7 = Array.from({length:7}, (_,i) => {
    const d = new Date(Date.now() - (6-i)*864e5).toISOString().slice(0,10);
    return { d, n: s.tage[d] || 0 };
  });
  const maxTag = Math.max(1, ...letzte7.map(x=>x.n));
  view().innerHTML = `
    <h1>Eltern-Bereich</h1>
    <div class="card">
      <div class="row spread"><div><b>${esc(p.name)}</b>
          <div class="muted small">${S.etappeVon(p).emoji} ${S.etappeVon(p).name} · ${S.etappeVon(p).kurz}</div></div>
        <button class="btn small ghost" id="profile">Profile</button></div>
      <div class="grid two" style="margin-top:14px">
        <div><div class="muted small">Aufgaben gesamt</div><b style="font-size:1.4rem">${s.aufgabenGesamt}</b></div>
        <div><div class="muted small">Richtig</div><b style="font-size:1.4rem">${proz(s.richtigGesamt, s.aufgabenGesamt)} %</b></div>
        <div><div class="muted small">Lern-Serie</div><b style="font-size:1.4rem">${tage(S.serieAktuell(p))}</b></div>
        <div><div class="muted small">Beste Serie</div><b style="font-size:1.4rem">${tage(s.streakBest)}</b></div>
      </div>
    </div>
    <div class="card">
      <h3>Letzte 7 Tage</h3>
      <div class="row" style="align-items:flex-end;height:90px;gap:6px">
        ${letzte7.map(x => `<div style="flex:1;text-align:center">
          <div style="height:${Math.max(4, x.n/maxTag*70)}px;background:var(--brand);border-radius:6px 6px 0 0"></div>
          <div class="muted" style="font-size:.65rem">${x.d.slice(8)}.</div></div>`).join('')}
      </div>
    </div>
    <div class="card">
      <h3>Was bei ${esc(p.name)} wirkt</h3>
      <p class="muted small">Gemessen an tatsächlich gelösten Aufgaben – Trefferquote und Tempo.
        Danach richtet die App ihre Auswahl aus.</p>
      ${(() => {
        const wirkung = wegeNachWirkung(p).filter(x => x.n >= 5);
        if (!wirkung.length) return '<p class="small">Noch zu wenig Übung. Ab etwa 5 Aufgaben je Weg erscheint hier eine belastbare Reihenfolge.</p>';
        return wirkung.map(x => `<div class="talent-row">
          <span class="em">${WEGE[x.weg].emoji}</span>
          <div class="tx"><b>${WEGE[x.weg].name}</b>
            <span class="bar ${x.wert>=75?'ok':''}" style="display:block;margin-top:5px"><i style="width:${x.wert}%"></i></span>
            <span class="muted small">${x.n} Aufgaben · Verlässlichkeit ${Math.round(x.konfidenz*100)} %</span></div>
          <span class="val">${x.wert} %</span></div>`).join('');
      })()}
    </div>
    <div class="card">
      <h3>Grundlage des Talent-Profils</h3>
      <p class="muted small">${p.testGemacht
        ? `Talent-Test vom ${p.testDatum} · ${(p.testTeileGenutzt||[]).length} von 4 Fragearten genutzt`
        : 'Der Talent-Test wurde noch nicht gemacht – die Werte sind bisher geschätzt.'}</p>
      ${p.testTeile ? `<ul class="clean small">${
        [['likert','Vorlieben (Selbsteinschätzung)'],['paare','Entweder-oder-Vergleiche'],
         ['szenarien','Verhalten in Situationen'],['proben','Kleine Leistungsproben']]
        .map(([id,name]) => `<li>${p.testTeile[id] ? '✅' : '⬜'} ${name}</li>`).join('')}</ul>` : ''}
      <p class="small muted">Das Profil verschiebt sich mit der Zeit: Was in den Übungen sichtbar wird,
        zählt zunehmend mehr als die Selbsteinschätzung im Test.</p>
    </div>
    <div class="card">
      <h3>Lernziele im Überblick</h3>
      ${ziele.map(z => { const st = S.zielStand(p, z.id);
        return `<div style="margin-bottom:14px">
          <div class="row spread"><b>${FAECHER[z.fach].emoji} ${esc(z.titel)}</b>
            <span class="muted small">${st.gesamt ? proz(st.richtig, st.gesamt)+' %' : '–'}</span></div>
          <div class="muted small">${esc(z.kompetenz)}</div>
          <div class="bar ${st.gemeistert?'ok':''}" style="margin-top:6px"><i style="width:${Math.min(100,st.level/5*100)}%"></i></div>
          <div class="muted small" style="margin-top:4px">Level ${st.level}/5 · ${st.gesamt} Aufgaben${st.gemeistert?' · 🎓 gemeistert':''}</div>
        </div>`; }).join('')}
    </div>
    <div class="card">
      <h3>Was das für die Förderung heißt</h3>
      <ul class="clean">${tipps.map(t=>`<li>${fett(t)}</li>`).join('')}</ul>
    </div>
    <div class="card">
      <h3>Etappe</h3>
      <p class="muted small">Bestimmt, welche Lernziele angeboten werden und wie hart sie sind.
        Eine Etappe höher zu wählen fordert – zu weit oben frustriert.</p>
      <label class="field"><span class="sr">Etappe</span>
        <select id="etappeWahl">${ETAPPEN.map(e =>
          `<option value="${e.id}" ${e.id === (p.etappe||1) ? 'selected' : ''}>
            ${e.emoji} ${e.name} (${e.kurz})</option>`).join('')}</select></label>
      <p class="small muted">Aktuell ${S.zieleFuerEtappe(p).length} Lernziele freigeschaltet.</p>
    </div>
    <div class="card">
      <h3>Vorlesen</h3>
      <p class="muted small">Für Leseanfänger und Kinder mit Leseschwäche: Die App liest jede Aufgabe
        automatisch mit der Stimme des Geräts vor. Der Lautsprecher-Knopf 🔊 in der Aufgabe
        funktioniert unabhängig davon immer.</p>
      <button class="btn ${p.vorlesen ? '' : 'ghost'}" id="vorleseSchalter">
        ${p.vorlesen ? '🔊 Vorlesen ist an' : '🔈 Vorlesen einschalten'}</button>
      <p class="small muted" style="margin-top:8px">Hörgeschichten werden immer vorgelesen –
        dort ist der Text zuerst versteckt, damit wirklich zugehört wird.</p>
    </div>
    <div class="card" id="installKarte">
      <h3>Als App aufs Handy</h3>
      <p class="muted small">Kidzootopia läuft im Browser und lässt sich wie eine App auf den Startbildschirm legen –
        danach startet sie im Vollbild und funktioniert auch offline.</p>
      <button class="btn ghost" id="install" hidden>📲 Jetzt installieren</button>
      <ul class="clean small">
        <li><b>Android / Chrome:</b> Menü ⋮ → „App installieren“ bzw. „Zum Startbildschirm hinzufügen“.</li>
        <li><b>iPhone / Safari:</b> Teilen-Symbol → „Zum Home-Bildschirm“.</li>
      </ul>
    </div>
    <div class="card">
      <h3>Fortschritt sichern &amp; umziehen</h3>
      <p class="muted small">Alles liegt nur auf diesem Gerät – das schützt die Daten Ihres Kindes,
        macht sie aber auch verletzlich. Zwei Fallen sind bekannt:</p>
      <ul class="clean small">
        <li>📱 <b>App und Browser sind getrennt.</b> Auf dem iPhone hat die zum Startbildschirm
          hinzugefügte App einen eigenen Speicher. Im Safari angelegte Profile fehlen dort –
          sie sind nicht gelöscht, nur woanders. Der Umzugs-Code unten holt sie herüber.</li>
        <li>🧹 <b>Safari räumt nach 7 Tagen ohne Nutzung auf.</b> Dagegen hilft: die App zum
          Startbildschirm hinzufügen und regelmäßig nutzen – und ab und zu sichern.</li>
      </ul>
      <div id="speicherStatus" class="small muted" style="margin:10px 0"></div>
      <button class="btn" id="codeZeigen">🔑 Umzugs-Code anzeigen</button>
      <button class="btn ghost" id="codeEinfuegen" style="margin-top:10px">📥 Umzugs-Code einfügen</button>
      <div id="codeBereich"></div>
      <p class="small muted" style="margin-top:12px">Als Datei (für ein Backup am Rechner):</p>
      <div class="row">
        <button class="btn small ghost" id="export">📤 Datei</button>
        <button class="btn small quiet" id="importBtn">📥 Datei laden</button>
      </div>
      <input type="file" id="importFile" accept="application/json" hidden>
      <button class="btn danger" id="reset" style="margin-top:14px">Alle Daten löschen</button>
    </div>
`;
  view().querySelector('#profile').onclick = () => zeige('profile');
  view().querySelector('#etappeWahl').onchange = e => {
    p.etappe = Number(e.target.value); S.speichern(); zeige('eltern');
  };
  view().querySelector('#vorleseSchalter').onclick = () => {
    p.vorlesen = !p.vorlesen; S.speichern(); zeige('eltern');
  };

  /* Speicher-Status anzeigen und dauerhaften Speicher anfordern */
  (async () => {
    const feld = view().querySelector('#speicherStatus');
    if (!feld) return;
    const st = await S.speicherSichern();
    const app = S.alsAppGestartet();
    feld.innerHTML = `${app ? '📲 Läuft als App vom Startbildschirm' : '🌐 Läuft im Browser'} ·
      ${st.dauerhaft ? '🔒 Speicher ist dauerhaft geschützt'
        : '⚠️ Speicher nicht dauerhaft – bitte gelegentlich sichern'}`;
  })();

  const bereich = () => view().querySelector('#codeBereich');

  view().querySelector('#codeZeigen').onclick = () => {
    const code = S.alsCode();
    bereich().innerHTML = `
      <div class="card flat" style="margin-top:12px;background:var(--bg)">
        <p class="small"><b>So ziehen Sie den Fortschritt um:</b> Diesen Code kopieren,
          die andere Fassung öffnen (App bzw. Browser), dort auf
          „Umzugs-Code einfügen“ tippen und einsetzen.</p>
        <textarea id="codeFeld" readonly rows="4"
          style="width:100%;font-family:ui-monospace,monospace;font-size:.72rem;padding:10px;
                 border-radius:12px;border:2px solid var(--line);background:var(--card);
                 color:var(--ink)">${esc(code)}</textarea>
        <button class="btn small" id="kopieren" style="margin-top:8px">📋 Code kopieren</button>
        <span class="small muted" id="kopiertHinweis"></span>
      </div>`;
    bereich().querySelector('#kopieren').onclick = async () => {
      const feld = bereich().querySelector('#codeFeld');
      feld.select(); feld.setSelectionRange(0, 999999);
      try { await navigator.clipboard.writeText(code); }
      catch { document.execCommand?.('copy'); }
      bereich().querySelector('#kopiertHinweis').textContent = ' ✅ kopiert';
    };
  };

  view().querySelector('#codeEinfuegen').onclick = () => {
    bereich().innerHTML = `
      <div class="card flat" style="margin-top:12px;background:var(--bg)">
        <p class="small">Code hier einsetzen. Vorhandene Profile bleiben erhalten –
          bei gleichem Kind gewinnt der weiter fortgeschrittene Stand.</p>
        <textarea id="einfuegeFeld" rows="4" placeholder="Code hier einfügen …"
          style="width:100%;font-family:ui-monospace,monospace;font-size:.72rem;padding:10px;
                 border-radius:12px;border:2px solid var(--line);background:var(--card);
                 color:var(--ink)"></textarea>
        <button class="btn small" id="uebernehmen" style="margin-top:8px">Übernehmen</button>
        <div id="einfuegeErgebnis" class="small" style="margin-top:8px"></div>
      </div>`;
    bereich().querySelector('#uebernehmen').onclick = () => {
      const aus = bereich().querySelector('#einfuegeErgebnis');
      try {
        const r = S.ausCode(bereich().querySelector('#einfuegeFeld').value);
        aus.innerHTML = `✅ Übernommen: ${r.neu} neu, ${r.ersetzt} aktualisiert,
          ${r.gesamt} Profile insgesamt.`;
        setTimeout(() => zeige('lernen'), 1200);
      } catch (e) {
        aus.innerHTML = `❌ Das hat nicht geklappt: ${esc(e.message)}<br>
          <span class="muted">Bitte den ganzen Code einfügen, ohne fehlende Zeichen.</span>`;
      }
    };
  };

  view().querySelector('#export').onclick = () => {
    const blob = new Blob([S.exportieren()], { type:'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `kidzootopia-${new Date().toISOString().slice(0,10)}.json`;
    a.click(); URL.revokeObjectURL(a.href);
  };
  view().querySelector('#importBtn').onclick = () => view().querySelector('#importFile').click();
  view().querySelector('#importFile').onchange = async e => {
    const f = e.target.files[0]; if (!f) return;
    try { S.zusammenfuehren(await f.text()); alert('Fortschritt übernommen.'); zeige('lernen'); }
    catch (err) { alert('Hat nicht geklappt: ' + err.message); }
  };

  view().querySelector('#reset').onclick = () => {
    if (confirm('Wirklich ALLE Profile und Fortschritte löschen?')) { S.allesLoeschen(); zeige('start'); }
  };
}
