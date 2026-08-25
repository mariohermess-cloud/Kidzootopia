/* Oberflaeche: alle Bildschirme. Bewusst gross, ruhig und antippbar (Handy zuerst). */

import { TALENTE, WEGE, FAECHER, ZIELE, ZIEL_MAP, SKALA, AVATARE, ABZEICHEN, ETAPPEN,
         TEST_LIKERT, TEST_PAARE, TEST_SZENARIEN, TEST_PROBEN, TEST_TEILE } from './data.js';
import * as S from './store.js';
import { starteSession, empfehlungen, wegRanking, wegeNachWirkung, wegBewertung } from './engine.js';
import { auswerten, stichPaare, engeTalente } from './talenttest.js';
import { vorlesen, stopp, kannVorlesen } from './sprache.js';
import { anleitung, umgebung } from './installhilfe.js';
import { bewerte, BESTANDEN } from './zeichnen.js';
import * as Kunst from './kunstanalyse.js';
import * as Avatar from './avatar.js';
import { NUMMER, STAND, VERLAUF } from './version.js';
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
  if (p && neu !== 'start') { Avatar.aufbauen(p.avatar); Avatar.umschauen(); }
  else Avatar.verstecken();
  window.scrollTo(0,0);
  ({ start:screenStart, lernen:screenLernen, talente:screenTalente, wege:screenWege,
     eltern:screenEltern, test:screenTest, session:screenSession, profile:screenProfile,
     galerie:screenGalerie }[neu] || screenLernen)(p, daten);
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
    ${umgebung().standalone ? '' : installHtml()}
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
      <button class="btn quiet" id="diagnose" style="margin-top:10px">
        🔍 Was ist auf diesem Gerät gespeichert?</button>
      <div id="holBereich"></div>
    </details>
    <p class="small muted center" style="margin-top:18px">Kidzootopia · Version ${NUMMER} ·
      Stand ${esc(STAND)}</p>`;

  installVerdrahten(view());

  view().querySelector('#diagnose').onclick = () =>
    diagnoseAnzeigen(view().querySelector('#holBereich'));

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

/* ------------------------------ Zeichenbrett ------------------------------
   Fürs Tablet gedacht: Finger oder Stift zeichnen auf ein Feld, die Vorlage
   liegt blass darunter. Gemessen wird, wie genau getroffen wurde – nie, wie
   schön es aussieht. Freie Arbeiten werden gar nicht bewertet. */
function zeichenbrett(a, bereich, fertig) {
  const frei = a.modus === 'frei';
  bereich.innerHTML = `
    <div class="brett-huelle">
      <canvas id="brett" class="brett"></canvas>
      <div class="brett-hinweis" id="brettHinweis"></div>
    </div>
    <div class="row" style="margin-top:10px">
      <button class="btn small quiet" id="brettLeeren">↺ Nochmal</button>
      <button class="btn small ghost" id="brettZurueck">⬅️ Letzter Strich weg</button>
      <button class="btn small" id="brettFertig">✓ Fertig</button>
    </div>`;

  window.__vorlage = a.zielLinien || a.vorlage || null;   // erleichtert automatisches Testen
  const leinwand = bereich.querySelector('#brett');
  const hinweis = bereich.querySelector('#brettHinweis');
  const stift = leinwand.getContext('2d');
  let striche = [], aktuell = null, vorlageZeigen = a.modus !== 'gedaechtnis';

  const groesse = () => {
    const breite = Math.min(bereich.clientWidth || 320, 460);
    const px = Math.round(breite * (window.devicePixelRatio || 1));
    leinwand.width = px; leinwand.height = px;
    leinwand.style.width = breite + 'px'; leinwand.style.height = breite + 'px';
    malen();
  };

  const linieZeichnen = (linien, farbe, dicke) => {
    stift.strokeStyle = farbe; stift.lineWidth = dicke;
    stift.lineJoin = 'round'; stift.lineCap = 'round';
    for (const l of linien) {
      if (l.length < 2) {
        if (l.length === 1) { stift.beginPath();
          stift.arc(l[0].x * leinwand.width, l[0].y * leinwand.height, dicke/2, 0, 7); stift.fillStyle = farbe; stift.fill(); }
        continue;
      }
      stift.beginPath();
      stift.moveTo(l[0].x * leinwand.width, l[0].y * leinwand.height);
      for (const p of l.slice(1)) stift.lineTo(p.x * leinwand.width, p.y * leinwand.height);
      stift.stroke();
    }
  };

  const malen = () => {
    const stil = getComputedStyle(document.body);
    stift.clearRect(0, 0, leinwand.width, leinwand.height);
    if (a.modus === 'symmetrie') {                       // Mittelachse andeuten
      stift.setLineDash([6, 8]); stift.strokeStyle = stil.getPropertyValue('--line');
      stift.lineWidth = 2; stift.beginPath();
      stift.moveTo(leinwand.width/2, 0); stift.lineTo(leinwand.width/2, leinwand.height);
      stift.stroke(); stift.setLineDash([]);
    }
    if (a.vorlage && vorlageZeigen)
      linieZeichnen(a.vorlage, stil.getPropertyValue('--line'), Math.max(6, leinwand.width * 0.022));
    linieZeichnen(striche, stil.getPropertyValue('--brand'), Math.max(4, leinwand.width * 0.014));
  };

  const stelle = e => {
    const r = leinwand.getBoundingClientRect();
    /* Zeit und Stiftdruck kommen mit: Daraus lassen sich später Linienruhe,
       Fluss und Druckführung bestimmen (siehe kunstanalyse.js). */
    return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height,
             t: Math.round(performance.now()), d: e.pressure ?? 0.5 };
  };
  leinwand.addEventListener('pointerdown', e => {
    e.preventDefault(); leinwand.setPointerCapture(e.pointerId);
    aktuell = [stelle(e)]; striche.push(aktuell); malen();
  });
  leinwand.addEventListener('pointermove', e => {
    if (!aktuell) return;
    e.preventDefault();
    const jetzt = stelle(e), vorher = aktuell.at(-1);
    /* Zwischenpunkte einfügen: Wer schnell über das Tablet fährt, löst nur
       wenige Ereignisse aus. Ohne diese Ergänzung würde flottes, aber sauberes
       Zeichnen schlechter bewertet als langsames – das wäre unfair. */
    const strecke = Math.hypot(jetzt.x - vorher.x, jetzt.y - vorher.y);
    const schritte = Math.min(60, Math.floor(strecke / 0.008));
    for (let i = 1; i < schritte; i++)
      aktuell.push({ x: vorher.x + (jetzt.x - vorher.x) * i / schritte,
                     y: vorher.y + (jetzt.y - vorher.y) * i / schritte,
                     t: vorher.t + (jetzt.t - vorher.t) * i / schritte, d: jetzt.d });
    aktuell.push(jetzt);
    malen();
  });
  const loslassen = () => { aktuell = null; };
  leinwand.addEventListener('pointerup', loslassen);
  leinwand.addEventListener('pointercancel', loslassen);
  leinwand.addEventListener('pointerleave', loslassen);

  bereich.querySelector('#brettLeeren').onclick = () => { striche = []; malen(); };
  bereich.querySelector('#brettZurueck').onclick = () => { striche.pop(); malen(); };
  bereich.querySelector('#brettFertig').onclick = () => {
    if (!striche.flat().length) { hinweis.textContent = 'Da ist noch nichts gezeichnet.'; return; }
    fertig(striche, { einStrich: striche.length === 1 });
  };

  groesse();
  window.addEventListener('resize', groesse, { once: true });

  if (a.modus === 'gedaechtnis') {                       // Vorlage kurz zeigen
    vorlageZeigen = true; malen();
    let rest = 5;
    hinweis.textContent = `Einprägen … noch ${rest} Sekunden`;
    const uhr = setInterval(() => {
      rest--;
      if (rest > 0) { hinweis.textContent = `Einprägen … noch ${rest} Sekunden`; return; }
      clearInterval(uhr); vorlageZeigen = false; malen();
      hinweis.textContent = 'Jetzt aus dem Gedächtnis zeichnen.';
    }, 1000);
  } else if (frei) {
    hinweis.textContent = 'Freies Blatt – hier gibt es kein Richtig.';
  }
  return { striche: () => striche };
}

/* Menschzeichnung nach Goodenough (1926) / Harris (1963):
   Gezählt werden vorhandene Merkmale, nicht die Ausführung. Im Original zählt
   eine geschulte Person; hier hakt das Kind selbst ab, was es gezeichnet hat.
   Das ist keine standardisierte Durchführung – aber es schult das Hinsehen. */
function merkmalsBogen(p, a, bereich, striche, auswerten) {
  bereich.innerHTML = `
    <div class="card flat" style="background:var(--bg);margin-top:12px">
      <h3>Schau dein Bild genau an</h3>
      <p class="muted small">Hake ab, was du gezeichnet hast. Es geht nicht darum, wie schön es
        ist – nur darum, was da ist. Ehrlich sein zählt.</p>
      <div class="grid two" id="merkmale">
        ${Kunst.MENSCH_MERKMALE.map((m,i) =>
          `<button class="choice" data-m="${i}" style="padding:10px;font-size:.9rem">☐ ${esc(m)}</button>`).join('')}
      </div>
      <button class="btn" id="merkmaleFertig" style="margin-top:12px">Fertig</button>
    </div>`;
  const gewaehlt = new Set();
  bereich.querySelectorAll('[data-m]').forEach(b => b.onclick = () => {
    const i = b.dataset.m;
    if (gewaehlt.has(i)) { gewaehlt.delete(i); b.classList.remove('gewaehlt');
      b.textContent = '☐ ' + Kunst.MENSCH_MERKMALE[i]; }
    else { gewaehlt.add(i); b.classList.add('gewaehlt');
      b.textContent = '☑ ' + Kunst.MENSCH_MERKMALE[i]; }
  });
  bereich.querySelector('#merkmaleFertig').onclick = () => {
    const ergebnis = Kunst.menschAuswertung(gewaehlt.size, p.etappe || 1);
    const analyse = Kunst.analysiere(striche, { titel:'Mensch', alterEtappe: p.etappe || 1 });
    S.merkeMensch(p, ergebnis);
    S.merkeKunst(p, { modus:'mensch', merkmale: gewaehlt.size,
      ruhe: analyse.linienruhe.wert, fluss: analyse.fluss.wert,
      ausarbeitung: analyse.ausarbeitung.wert });
    S.inGalerie(p, { titel:'Mensch', auftrag:'Zeichne einen Menschen', striche });
    a.analyse = analyse;
    auswerten(a, `${ergebnis.anzahl} von ${Kunst.MENSCH_MERKMALE.length} Merkmalen – ${ergebnis.lage}`, true);
  };
}

/* Anleitung zum Ablegen auf dem Startbildschirm – passend zur erkannten Lage. */
function installHtml() {
  const a = anleitung();
  if (!a) return `<div class="card"><h3>📲 Läuft als App ✅</h3>
    <p class="muted small">Diese Fassung liegt auf dem Startbildschirm und hat einen eigenen,
      geschützten Speicher. Genau so ist es richtig.</p></div>`;
  return `
    <div class="card" ${a.warnung ? 'style="border:2px solid var(--warn)"' : ''}>
      <h3>${a.titel}</h3>
      ${a.text ? `<p class="small">${a.text}</p>` : ''}
      <ol class="small" style="padding-left:20px;line-height:1.8">
        ${a.schritte.map(x => `<li>${x}</li>`).join('')}
      </ol>
      ${a.adresse ? `<p class="small"><b>Adresse zum Eintippen:</b></p>
        <div class="row">
          <input type="text" id="adressFeld" readonly value="${esc(location.origin + location.pathname)}"
            style="font-size:.8rem">
          <button class="btn small ghost" id="adressKopieren">📋</button>
        </div>` : ''}
      ${window.installPrompt ? `<button class="btn" id="installJetzt" style="margin-top:10px">
        📲 Jetzt installieren</button>` : ''}
      ${a.hinweise?.length ? `<ul class="clean small" style="margin-top:10px">
        ${a.hinweise.map(h => `<li>💡 ${esc(h)}</li>`).join('')}</ul>` : ''}
      <p class="small muted" style="margin-top:10px">Warum das wichtig ist: Nur die abgelegte App
        hat einen eigenen Speicher. Im Browser räumt das iPhone nach einigen Tagen ohne Nutzung
        selbsttätig auf – dann sind die Profile weg.</p>
    </div>`;
}

function installVerdrahten(wurzel) {
  wurzel.querySelector('#installJetzt')?.addEventListener('click', async () => {
    const p = window.installPrompt;
    if (!p) return;
    window.installPrompt = null;
    try { await p.prompt(); } catch {}
    zeige(aktuelleRoute());
  });
  wurzel.querySelector('#adressKopieren')?.addEventListener('click', async () => {
    const f = wurzel.querySelector('#adressFeld');
    f.select(); f.setSelectionRange(0, 999999);
    try { await navigator.clipboard.writeText(f.value); } catch { document.execCommand?.('copy'); }
    f.style.borderColor = 'var(--ok)';
  });
}

/* Zeigt ungeschönt, was im Speicher dieses Geräts liegt. Bei „meine Profile
   sind weg“ hilft Nachsehen mehr als Vermuten. */
function diagnoseHtml() {
  const d = S.diagnose();
  return `
    <div class="card flat" style="margin-top:12px;background:var(--bg)">
      <h4 style="margin:0 0 8px">🔍 Speicher dieses Geräts</h4>
      <ul class="clean small">
        <li><b>Läuft als:</b> ${esc(d.modus)}</li>
        <li><b>Adresse:</b> <span style="word-break:break-all">${esc(d.adresse)}</span></li>
        <li><b>Speicher lesbar:</b> ${d.speicherLesbar ? 'ja' : 'nein (privater Modus?)'}</li>
        <li><b>Profile hier:</b> ${d.profile.length
          ? d.profile.map(p => `${esc(p.name)} (${p.aufgaben} Aufgaben, zuletzt ${esc(p.letzterTag)})`).join(', ')
          : '<b>keine</b>'}</li>
        <li><b>Zweitkopie:</b> ${d.sicherungVorhanden
          ? `vorhanden, ${d.sicherungProfile} Profil(e)` : 'keine'}</li>
        <li><b>Gespeicherte Einträge:</b> ${d.eintraege.length
          ? d.eintraege.map(e => `${esc(e.name)} (${e.groesse} Zeichen)`).join(', ')
          : 'keine'}</li>
      </ul>
      ${d.sicherungVorhanden && !d.profile.length
        ? '<button class="btn" id="sicherungHolen" style="margin-top:10px">♻️ Aus Zweitkopie wiederherstellen</button>'
        : ''}
      <p class="small muted" style="margin-top:10px">
        ${d.profile.length
          ? 'Hier liegen Profile – sie sollten oben in der Liste erscheinen.'
          : 'In <b>dieser</b> Fassung liegt nichts. Falls Sie zuvor die andere Fassung benutzt haben (Browser statt App oder umgekehrt), öffnen Sie dort dieselbe Adresse und prüfen Sie es dort ebenso.'}
      </p>
    </div>`;
}

function diagnoseAnzeigen(ziel) {
  ziel.innerHTML = diagnoseHtml();
  ziel.querySelector('#sicherungHolen')?.addEventListener('click', () => {
    try { const r = S.ausSicherung(); alert(`Wiederhergestellt: ${r.gesamt} Profil(e).`); zeige('lernen'); }
    catch (e) { alert('Hat nicht geklappt: ' + e.message); }
  });
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
      <div class="row spread">
        <div style="flex:1">
          <b>🎨 Zeichnen</b>
          <div class="muted small">Nachfahren, spiegeln, in einem Strich – oder frei drauflos
            (das wird nie bewertet).</div>
        </div>
        <div class="row">
          <button class="btn small ghost" id="zeichnenStart">Üben</button>
          <button class="btn small" id="freiStart">Frei</button>
        </div>
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
  view().querySelector('#zeichnenStart').onclick = () => zeige('session', { zielId:'zeichnen', laenge:4 });
  view().querySelector('#freiStart').onclick = () => zeige('session', { zielId:'kunstwerk', laenge:1 });
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

    } else if (a.typ === 'zeichnen') {
      if (ergebnis === null) {
        Avatar.reagiere('zeichnen');
        zeichenbrett(a, bereich, (striche, extra) => {
          if (a.modus === 'mensch') {                    // Merkmale zählen (Goodenough/Harris)
            merkmalsBogen(p, a, bereich, striche, auswerten);
            return;
          }
          if (a.modus === 'frei') {                      // wird nicht bewertet
            const titel = prompt('Wie heißt dein Bild?', '') || 'Ohne Titel';
            S.inGalerie(p, { titel, auftrag: a.auftrag, striche });
            const analyse = Kunst.analysiere(striche, { titel, auftrag: a.auftrag,
                                                        alterEtappe: p.etappe || 1 });
            S.merkeKunst(p, { modus:'frei', ruhe: analyse.linienruhe.wert,
              fluss: analyse.fluss.wert, ausarbeitung: analyse.ausarbeitung.wert,
              blatt: analyse.blattnutzung.wert, stufe: analyse.entwicklung.stufe,
              stufeName: analyse.entwicklung.name });
            a.analyse = analyse;
            auswerten(a, `„${titel}“ – in der Galerie gespeichert`, true);
            return;
          }
          const messziel = a.zielLinien || a.vorlage;   // 'ziel' ist das Lernziel-Objekt!
          const wert = bewerte(messziel, striche);
          const einStrichOk = a.modus !== 'einstrich' || extra.einStrich;
          const bestanden = wert.punkte >= BESTANDEN && einStrichOk;
          const analyse = Kunst.analysiere(striche, { vorlage: messziel, alterEtappe: p.etappe || 1 });
          a.analyse = analyse;
          S.merkeKunst(p, { modus: a.modus, treffer: wert.punkte,
            ruhe: analyse.linienruhe.wert, fluss: analyse.fluss.wert,
            proportion: analyse.proportion?.wert, geschlossen: analyse.geschlossenheit.wert,
            oekonomie: analyse.oekonomie?.wert, ausarbeitung: analyse.ausarbeitung.wert });
          auswerten(a, `${wert.punkte} von 100 Punkten` +
            (a.modus === 'einstrich' ? (extra.einStrich ? ' · in einem Strich ✏️' : ' · leider abgesetzt') : ''),
            bestanden, wert);
        });
      } else {
        bereich.innerHTML = `<p class="small muted" style="margin-top:12px">${esc(eingabe)}</p>`;
      }

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
      const zeichenAufgabe = a.typ === 'zeichnen' && !a.keineWertung;
      const denkAufgabe = a.typ === 'nachdenken' || (a.typ === 'zeichnen' && a.keineWertung);
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
          ${zeichenAufgabe
            ? (ergebnis ? `✅ Getroffen! ${esc(eingabe)}` : `🖌️ Noch nicht ganz: ${esc(eingabe)}`)
            : ergebnis ? '✅ Richtig! Super gemacht.'
                       : `❌ Nicht ganz. Richtig wäre: <u>${esc(a.antwort)}</u>`}
          ${zeichenAufgabe && a.messwerte ? `
            <div class="bar ${ergebnis?'ok':''}" style="margin-top:8px"><i style="width:${a.messwerte.punkte}%"></i></div>
            <div class="small" style="margin-top:6px;font-weight:500">
              Getroffene Linie: ${Math.round(a.messwerte.abdeckung*100)} % ·
              davon auf der Vorlage: ${Math.round(a.messwerte.genauigkeit*100)} %
            </div>` : ''}
          ${a.analyse ? `<div class="small" style="margin-top:8px;font-weight:500">
            ${[ a.analyse.linienruhe.wert !== null ? `✏️ Linienruhe ${a.analyse.linienruhe.wert}` : '',
                a.analyse.fluss.wert !== null ? `🌊 Fluss ${a.analyse.fluss.wert}` : '',
                a.analyse.proportion?.wert != null ? `📐 Proportion ${a.analyse.proportion.wert}` : '',
                a.analyse.oekonomie ? `🖊️ ${a.analyse.oekonomie.striche} Ansätze` : ''
              ].filter(Boolean).join(' · ')}
            </div>` : ''}
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

  const auswerten = (a, eingabe, okDirekt = null, messwerte = null) => {
    if (a.typ === 'text' && !String(eingabe).trim()) return;
    const ms = startZeit ? performance.now() - startZeit : 0;
    const ok = a.keineWertung ? true
             : okDirekt !== null ? okDirekt
             : pruefe(a, eingabe);
    if (messwerte) a.messwerte = messwerte;
    status[sess.index] = a.keineWertung ? 'denk' : (ok ? 'done' : 'miss');
    sess.index++;
    if (a.keineWertung) sess.laenge--;          // zählt nicht in die Quote der Runde
    else if (ok) sess.richtig++;
    if (!a.keineWertung) sess.verlauf.push({ ziel:a.ziel.id, weg:a.weg, ok, bruecke:a.bruecke, ms });
    // Zeit fliesst in die Wirksamkeit eines Weges ein – schnell und sicher zaehlt mehr.
    S.verbuche(p, { zielId:a.ziel.id, weg:a.weg, level:a.level, richtig:ok, bruecke:a.bruecke, ms,
                    tippsGenutzt, knacknuss: !!a.knacknuss, keineWertung: !!a.keineWertung });
    Avatar.reagiere(ok ? 'richtig' : 'falsch', { serie: S.zielStand(p, a.ziel.id).serie });
    if (ok && navigator.vibrate) navigator.vibrate(20);
    render(a, ok, String(eingabe));
  };

  const ende = () => {
    Avatar.reagiere('fertig');
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

  Avatar.reagiere('start');
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
    <button class="btn ghost" id="galerie">🎨 Galerie ansehen (${(p.galerie||[]).length})</button>
    <button class="btn ghost" id="retest" style="margin-top:10px">Talent-Test ${p.testGemacht?'wiederholen':'starten'}</button>
    <p class="muted small center" style="margin-top:8px">Kinder verändern sich – der Test darf alle paar Monate neu gemacht werden.</p>`;
  view().querySelector('#galerie').onclick = () => zeige('galerie');
  view().querySelector('#retest').onclick = () => zeige('test');
}

/* ------------------------------ Galerie ------------------------------ */
function screenGalerie(p) {
  const bilder = p.galerie || [];
  view().innerHTML = `
    <h1>🎨 Galerie</h1>
    <p class="muted small">Freie Zeichnungen werden nie bewertet. Sie stehen hier,
      weil sie dir gehören – nicht, weil sie eine Note bekommen.</p>
    ${bilder.length ? `<div class="tiles">${bilder.map((b, i) => `
      <div class="tile" style="cursor:default">
        <canvas class="mini" data-bild="${i}" width="300" height="300"></canvas>
        <b style="margin-top:8px">${esc(b.titel || 'Ohne Titel')}</b>
        <span class="muted small">${esc(b.datum)}</span>
        ${b.auftrag ? `<span class="muted small" style="display:block;margin-top:4px">${esc(b.auftrag)}</span>` : ''}
      </div>`).join('')}</div>`
      : `<div class="card center"><div class="badge-emoji">🖼️</div>
         <p class="small">Noch keine Bilder. Unter <b>Zeichnen → Freies Kunstwerk</b> entsteht das erste.</p>
         <button class="btn" id="malen">Jetzt zeichnen</button></div>`}
    ${bilder.length ? '<button class="btn ghost" id="malen" style="margin-top:14px">Neues Bild zeichnen</button>' : ''}`;

  view().querySelectorAll('canvas[data-bild]').forEach(c => {
    const b = bilder[Number(c.dataset.bild)];
    const stift = c.getContext('2d');
    stift.strokeStyle = getComputedStyle(document.body).getPropertyValue('--brand');
    stift.lineWidth = 4; stift.lineJoin = 'round'; stift.lineCap = 'round';
    for (const l of b.striche || []) {
      if (!l.length) continue;
      stift.beginPath(); stift.moveTo(l[0][0] * 300, l[0][1] * 300);
      for (const [x, y] of l.slice(1)) stift.lineTo(x * 300, y * 300);
      stift.stroke();
    }
  });
  view().querySelector('#malen')?.addEventListener('click',
    () => zeige('session', { zielId:'kunstwerk', laenge:1 }));
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


/* ------------------------ Welche Fassung läuft hier? ------------------------ */
/* Diese Datei liegt im Zwischenspeicher des Service Workers. Was hier steht, ist
   deshalb wirklich die Fassung, die auf diesem Gerät läuft. */

function versionsKarte() {
  const aelter = VERLAUF.slice(1);
  return `
    <div class="card">
      <h3>Fassung dieser App</h3>
      <div class="row spread" style="margin:6px 0 12px">
        <b style="font-size:1.5rem">Version ${NUMMER}</b>
        <span class="pill grey">Stand ${esc(STAND)}</span>
      </div>
      <p class="small muted">Diese Nummer kommt aus der App selbst, nicht vom Server –
        sie zeigt also, was auf <b>diesem</b> Gerät tatsächlich läuft. Steht auf dem iPad eine
        kleinere Nummer als auf dem Rechner, hat das iPad die Aktualisierung noch nicht geholt.</p>
      <p class="small" style="margin-top:12px"><b>Neu in Version ${NUMMER}:</b></p>
      <ul class="clean small">${VERLAUF[0].was.map(w => `<li>· ${esc(w)}</li>`).join('')}</ul>
      <div id="updateStatus" class="small muted" style="margin:12px 0"></div>
      <button class="btn ghost" id="updatePruefen">🔄 Nach Aktualisierung suchen</button>
      <details style="margin-top:12px">
        <summary class="small muted">Es kommt trotzdem immer die alte Fassung</summary>
        <p class="small muted" style="margin-top:8px">Dann hängt die App an ihrem
          Offline-Speicher fest – das passiert vor allem auf dem iPhone, wo eine App vom
          Startbildschirm sehr lange am Gespeicherten festhält. Der Knopf hier wirft den
          Offline-Speicher weg und holt alles neu.
          <b>Der Fortschritt Ihres Kindes bleibt erhalten</b> – der liegt woanders.
          Nur beim ersten Start danach braucht die App kurz eine Verbindung.</p>
        <button class="btn quiet" id="hartNeuladen" style="margin-top:8px">
          🧹 Offline-Speicher leeren und neu laden</button>
      </details>
      <details style="margin-top:12px">
        <summary class="small muted">Frühere Fassungen</summary>
        ${aelter.map(v => `
          <p class="small" style="margin:10px 0 2px"><b>Version ${v.nr}</b>
            <span class="muted">· ${esc(v.stand)}</span></p>
          <ul class="clean small">${v.was.map(w => `<li>· ${esc(w)}</li>`).join('')}</ul>`).join('')}
      </details>
    </div>`;
}

function versionVerdrahten() {
  const knopf = view().querySelector('#updatePruefen');
  const status = view().querySelector('#updateStatus');
  if (!knopf || !status) return;

  if (!('serviceWorker' in navigator)) {
    status.textContent = 'Offline-Betrieb wird von diesem Browser nicht unterstützt.';
    knopf.hidden = true;
    return;
  }

  const hart = view().querySelector('#hartNeuladen');
  if (hart) hart.onclick = async () => {
    hart.disabled = true;
    hart.textContent = '⏳ Räume auf …';
    try {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map(r => r.unregister()));
      const namen = await caches.keys();
      await Promise.all(namen.map(n => caches.delete(n)));
    } catch {}
    /* Zeitstempel in der Adresse: so umgeht der Neustart auch den Zwischenspeicher
       des Browsers selbst, nicht nur den der App. */
    location.replace(location.pathname + '?neu=' + Date.now());
  };

  knopf.onclick = async () => {
    knopf.disabled = true;
    status.textContent = '⏳ Suche …';
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      if (!reg) { status.textContent = 'Noch keine Offline-Fassung eingerichtet. Seite neu laden.'; }
      else {
        await reg.update();
        /* Der Service Worker meldet sich über 'updatefound', wenn es etwas Neues gibt.
           Kommt nach kurzer Zeit nichts, ist die Fassung aktuell. */
        const neues = await new Promise(fertig => {
          if (reg.installing || reg.waiting) return fertig(true);
          const horcher = () => fertig(true);
          reg.addEventListener('updatefound', horcher, { once: true });
          setTimeout(() => { reg.removeEventListener('updatefound', horcher); fertig(false); }, 4000);
        });
        status.innerHTML = neues
          ? '⬇️ Eine neue Fassung wird geladen. Nach dem Neustart ist sie da.'
          : `✅ Version ${NUMMER} ist die neueste – nichts zu tun.`;
      }
    } catch {
      status.textContent = '⚠️ Keine Verbindung. Bitte später noch einmal versuchen.';
    }
    knopf.disabled = false;
  };
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
    ${(() => {
      const m = p.kunst?.messungen || [];
      if (m.length < 3) return `<div class="card"><h3>🎨 Zeichnerisches Profil</h3>
        <p class="muted small">Nach etwa drei Zeichnungen erscheint hier eine fachliche
          Auswertung – Feinmotorik, Formtreue, Entwicklungsstufe und Kreativität nach
          Kellogg, Lowenfeld, Goodenough und Torrance.</p>
        <p class="small">Bisher ${m.length} von 3 Zeichnungen.</p></div>`;
      const zeile = (name, feld, deutung) => {
        const w = S.kunstMittel(p, feld);
        return w === null ? '' : `<div class="talent-row">
          <span class="em">${deutung.em}</span>
          <div class="tx"><b>${name}: ${w}</b>
            <span class="bar" style="display:block;margin-top:5px"><i style="width:${w}%"></i></span>
            <span class="muted small">${deutung.text}</span></div></div>`;
      };
      const letzteFrei = m.find(x => x.modus === 'frei');
      const kreativ = Kunst.kreativProfil(p.galerie || []);
      const mensch = p.kunst?.mensch;
      return `<div class="card">
        <h3>🎨 Zeichnerisches Profil</h3>
        <p class="muted small">Aus ${m.length} Zeichnungen. Bewertet wird nie die Schönheit,
          sondern Messbares: Linienführung, Formtreue, Entwicklungsmerkmale.</p>

        <h4 style="margin:14px 0 6px">Feinmotorik</h4>
        ${zeile('Linienruhe','ruhe',{em:'✏️',text:'Wie ruhig die Hand die Linie führt – gemessen an den Richtungswechseln im Kleinen.'})}
        ${zeile('Fluss','fluss',{em:'🌊',text:'Gleichmäßige Bewegung statt stockendem Nachziehen.'})}
        ${zeile('Formtreue','proportion',{em:'📐',text:'Stimmt das Seitenverhältnis mit der Vorlage überein?'})}
        ${zeile('Geschlossenheit','geschlossen',{em:'⭕',text:'Trifft das Ende einer Form ihren Anfang?'})}
        ${zeile('Ökonomie','oekonomie',{em:'🖊️',text:'Wie viele Ansätze wurden gebraucht?'})}
        ${zeile('Ausarbeitung','ausarbeitung',{em:'🎨',text:'Wie viel Aufwand steckt im Bild (Torrance: Elaboration)?'})}

        ${letzteFrei?.stufeName ? `<h4 style="margin:14px 0 6px">Entwicklungsstufe</h4>
          <p class="small"><b>${esc(letzteFrei.stufeName)}</b> – nach Kellogg (1969) und
          Lowenfeld (1947), zuletzt am ${esc(letzteFrei.datum)}.</p>
          <p class="small muted">Kinder springen zwischen den Stufen, fallen zurück und bleiben
          stehen. Alles davon ist normal; die Stufe ist keine Note.</p>` : ''}

        ${kreativ.fluessigkeit >= 2 ? `<h4 style="margin:14px 0 6px">Kreativität (nach Torrance, 1966)</h4>
          <ul class="clean small">
            <li><b>Flüssigkeit:</b> ${kreativ.fluessigkeit} benannte Einfälle</li>
            <li><b>Flexibilität:</b> ${kreativ.flexibilitaet} verschiedene Bereiche
              (${esc(kreativ.bereiche.join(', '))})</li>
          </ul>
          <p class="small muted">Torrance zählt Ideen und Bereiche – nicht deren Qualität.
            Wer viele Bilder aus einem einzigen Bereich malt, ist nicht schlechter, sondern
            vertieft.</p>` : ''}

        ${mensch ? `<h4 style="margin:14px 0 6px">Menschzeichnung</h4>
          <p class="small">${esc(mensch.erklaerung)}</p>
          <p class="small muted">${esc(mensch.warnung)}</p>` : ''}

        <p class="small muted" style="margin-top:12px">
          <b>Was das nicht ist:</b> kein Begabungs- oder Intelligenztest, keine Diagnose,
          keine Aussage über künstlerischen Wert. Es sind Anhaltspunkte aus wenigen
          Zeichnungen – aussagekräftig erst über Monate, und auch dann nur im Zusammenspiel
          mit dem, was Sie selbst sehen.</p>
      </div>`;
    })()}
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
    ${installHtml()}
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
      <button class="btn quiet" id="diagnoseEltern" style="margin-top:10px">
        🔍 Was ist auf diesem Gerät gespeichert?</button>
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
    ${versionsKarte()}
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

  view().querySelector('#diagnoseEltern').onclick = () => diagnoseAnzeigen(bereich());

  versionVerdrahten();

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
