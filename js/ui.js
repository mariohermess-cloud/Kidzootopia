/* Oberflaeche: alle Bildschirme. Bewusst gross, ruhig und antippbar (Handy zuerst). */

import { TALENTE, WEGE, FAECHER, ZIELE, ZIEL_MAP, TEST_FRAGEN, SKALA, AVATARE, ABZEICHEN } from './data.js';
import * as S from './store.js';
import { starteSession, empfehlungen, wegRanking } from './engine.js';
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
    p.testGemacht ? `${TALENTE[t].emoji} ${TALENTE[t].name} · Klasse ${p.klasse}` : `Klasse ${p.klasse} · Talent-Test offen`;
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
          <span class="muted small"> · Klasse ${p.klasse}</span>
        </button>`).join('')}</div></div>` : ''}
    <div class="card">
      <h2>${profile.length ? 'Neues Kind hinzufügen' : 'Los geht’s'}</h2>
      <label class="field"><span>Name</span><input type="text" id="nName" placeholder="z. B. Mia" maxlength="20"></label>
      <label class="field"><span>Klasse</span>
        <select id="nKlasse">${[1,2,3,4,5,6].map(k=>`<option value="${k}" ${k===3?'selected':''}>Klasse ${k}</option>`).join('')}</select></label>
      <label class="field"><span>Lieblingstier</span></label>
      <div class="row wrap" id="avatarWahl" style="margin-bottom:14px">
        ${AVATARE.map((a,i)=>`<button class="avatar-btn ${i===0?'sel':''}" data-av="${a}"
          style="${i===0?'border-color:var(--brand)':''}">${a}</button>`).join('')}
      </div>
      <button class="btn" id="nAnlegen">Profil anlegen</button>
    </div>`;

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
    S.neuesProfil({ name, avatar: gewaehlt, klasse: view().querySelector('#nKlasse').value });
    zeige('test');
  };
}

function screenProfile() {
  view().innerHTML = `<h1>Profile</h1>
    <div class="card">
      ${S.alleProfile().map(p => `<div class="row spread" style="padding:10px 0;border-bottom:1px solid var(--line)">
        <div class="row"><span style="font-size:26px">${p.avatar}</span>
          <div><b>${esc(p.name)}</b><div class="muted small">Klasse ${p.klasse} · ${p.stats.aufgabenGesamt} Aufgaben</div></div></div>
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
function screenTest(p) {
  let i = 0; const antworten = [];
  const frage = () => {
    if (i >= TEST_FRAGEN.length) return fertig();
    const f = TEST_FRAGEN[i];
    view().innerHTML = `
      <div class="card">
        <div class="row spread"><span class="pill">Talent-Test</span>
          <span class="muted small">${i+1} / ${TEST_FRAGEN.length}</span></div>
        <div class="bar" style="margin:12px 0 18px"><i style="width:${(i/TEST_FRAGEN.length*100)}%"></i></div>
        <p class="task pop">${esc(f.q)}</p>
        <div class="scale">
          ${SKALA.map(s => `<button data-v="${s.v}"><b>${s.em}</b><small>${s.label}</small></button>`).join('')}
        </div>
        ${i>0?'<button class="btn quiet small" id="zurueck" style="margin-top:14px">← zurück</button>':''}
      </div>
      <p class="muted small center">Es gibt kein Richtig oder Falsch. Antworte einfach ehrlich.</p>`;
    view().querySelectorAll('[data-v]').forEach(b => b.onclick = () => {
      antworten[i] = { t: f.t, v: Number(b.dataset.v) }; i++; frage();
    });
    view().querySelector('#zurueck')?.addEventListener('click', () => { i--; frage(); });
  };
  const fertig = () => {
    S.testAuswerten(p, antworten);
    kopfzeile(p);
    const werte = S.talentWerte(p);
    const top = S.topTalente(p,3);
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
        <p class="muted small" style="margin-top:10px">Das Radar lernt weiter mit: Je mehr du übst, desto genauer wird es.</p>
      </div>
      <button class="btn" id="losgehts">Jetzt lernen 🚀</button>`;
    view().querySelector('#losgehts').onclick = () => zeige('lernen');
  };
  frage();
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
  view().querySelectorAll('[data-fach]').forEach(b => b.onclick = () => zeige('session', { fach:b.dataset.fach, laenge:8 }));
  view().querySelectorAll('[data-ziel]').forEach(b => b.onclick = () => zeige('session', { zielId:b.dataset.ziel, laenge:8 }));
}

/* ------------------------------ Übungs-Session ------------------------------ */
function screenSession(p, opts = {}) {
  const sess = starteSession(p, opts);
  const status = [];

  const naechste = () => {
    const a = sess.naechste();
    if (!a) return ende();
    render(a, null);
  };

  const render = (a, ergebnis, eingabe = '') => {
    const punkte = Array.from({length: sess.laenge}, (_,i) =>
      `<i class="${status[i] || (i===sess.index?'now':'')}"></i>`).join('');
    view().innerHTML = `
      <div class="row spread" style="margin-bottom:10px">
        <button class="btn quiet small" id="raus">✕ Beenden</button>
        <span class="pill grey">${FAECHER[a.ziel.fach].emoji} ${esc(a.ziel.titel)} · Level ${a.level}</span>
      </div>
      <div class="progress-dots">${punkte}</div>
      <div class="card">
        <span class="wegtag">${a.wegInfo.emoji} ${a.wegInfo.name}${a.bruecke ? ' · Brücke 🌉' : ''}</span>
        <p class="task pop">${esc(a.frage)}</p>
        <div id="antwortbereich"></div>
        <div id="fb"></div>
      </div>
      <p class="muted small center">${esc(a.wegInfo.hinweis)}</p>`;
    view().querySelector('#raus').onclick = () => zeige('lernen');

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

    if (ergebnis !== null) {
      view().querySelector('#fb').innerHTML = `
        <div class="feedback ${ergebnis?'ok':'bad'} pop">
          ${ergebnis ? '✅ Richtig! Super gemacht.'
            : `❌ Nicht ganz. Richtig wäre: <u>${esc(a.antwort)}</u>`}
          ${a.hilfe ? `<div class="small" style="margin-top:6px;font-weight:500">💡 ${esc(a.hilfe)}</div>` : ''}
        </div>
        <button class="btn" id="weiter" style="margin-top:12px">
          ${sess.index >= sess.laenge ? 'Ergebnis ansehen' : 'Weiter →'}</button>`;
      view().querySelector('#weiter').onclick = naechste;
    }
  };

  const auswerten = (a, eingabe) => {
    if (a.typ === 'text' && !String(eingabe).trim()) return;
    const ok = pruefe(a, eingabe);
    status[sess.index] = ok ? 'done' : 'miss';
    sess.index++; if (ok) sess.richtig++;
    sess.verlauf.push({ ziel:a.ziel.id, weg:a.weg, ok, bruecke:a.bruecke });
    S.verbuche(p, { zielId:a.ziel.id, weg:a.weg, level:a.level, richtig:ok, bruecke:a.bruecke });
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
      ${Object.entries(WEGE).sort((a,b)=>(werte[b[1].talent]||0)-(werte[a[1].talent]||0)).map(([k,w]) => `
        <div class="talent-row">
          <span class="em">${w.emoji}</span>
          <div class="tx"><b>${w.name}</b>
            <span class="bar" style="display:block;margin-top:5px"><i style="width:${Math.round((genutzt[k]||0)/maxN*100)}%"></i></span>
            <span class="muted small">${w.hinweis}</span></div>
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
      <div class="row spread"><div><b>${esc(p.name)}</b><div class="muted small">Klasse ${p.klasse}</div></div>
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
      <h3>Daten</h3>
      <p class="muted small">Alles bleibt auf diesem Gerät. Für einen Gerätewechsel oder ein Backup:</p>
      <button class="btn ghost" id="export">📤 Fortschritt exportieren</button>
      <button class="btn quiet" id="importBtn" style="margin-top:10px">📥 Fortschritt importieren</button>
      <input type="file" id="importFile" accept="application/json" hidden>
      <button class="btn danger" id="reset" style="margin-top:10px">Alle Daten löschen</button>
    </div>`;
  view().querySelector('#profile').onclick = () => zeige('profile');
  if (window.installPrompt) {
    const btn = view().querySelector('#install');
    btn.hidden = false;
    btn.onclick = async () => { window.installPrompt.prompt(); window.installPrompt = null; btn.hidden = true; };
  }
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
    try { S.importieren(await f.text()); alert('Import erfolgreich.'); zeige('lernen'); }
    catch (err) { alert('Import fehlgeschlagen: ' + err.message); }
  };
  view().querySelector('#reset').onclick = () => {
    if (confirm('Wirklich ALLE Profile und Fortschritte löschen?')) { S.allesLoeschen(); zeige('start'); }
  };
}
