/* Kleines Radar-Diagramm (reines SVG, keine Bibliothek). */
import { TALENTE } from './data.js';

export function radar(werte, groesse = 300) {
  const keys = Object.keys(TALENTE);
  const cx = groesse/2, cy = groesse/2, rMax = groesse/2 - 46;
  const punkt = (i, r) => {
    const a = (Math.PI*2 * i / keys.length) - Math.PI/2;
    return [cx + Math.cos(a)*r, cy + Math.sin(a)*r];
  };
  const netz = [0.25,0.5,0.75,1].map(f =>
    `<polygon points="${keys.map((_,i)=>punkt(i, rMax*f).map(n=>n.toFixed(1)).join(',')).join(' ')}"
      fill="none" stroke="var(--line)" stroke-width="1"/>`).join('');
  const achsen = keys.map((_,i) => {
    const [x,y] = punkt(i, rMax);
    return `<line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="var(--line)"/>`;
  }).join('');
  const flaeche = keys.map((k,i) => punkt(i, rMax * Math.max(6, werte[k]||0)/100).map(n=>n.toFixed(1)).join(',')).join(' ');
  const labels = keys.map((k,i) => {
    const [x,y] = punkt(i, rMax + 24);
    const anchor = x < cx - 8 ? 'end' : x > cx + 8 ? 'start' : 'middle';
    return `<text x="${x.toFixed(1)}" y="${(y+4).toFixed(1)}" text-anchor="${anchor}"
      font-size="17" fill="var(--muted)">${TALENTE[k].emoji}</text>`;
  }).join('');
  return `<svg viewBox="0 0 ${groesse} ${groesse}" width="100%" role="img"
    aria-label="Talent-Radar">${netz}${achsen}
    <polygon points="${flaeche}" fill="var(--brand)" fill-opacity=".28" stroke="var(--brand)" stroke-width="2.5"/>
    ${labels}</svg>`;
}
