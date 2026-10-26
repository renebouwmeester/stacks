// Rekent per kandidaat de rugkleuren uit de Roon-hoes uit en zet ze naast Apple's: kandidaten.json → tekening.json
const fs = require('fs'), path = require('path');
const { rugkleuren, contrast } = require('../lib/kleur');
const hx = h => [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16));
const k = JSON.parse(fs.readFileSync(path.join(__dirname, 'kandidaten.json')));
for (const a of k) {
  a.eigen = rugkleuren(fs.readFileSync(path.join(__dirname, a.hoes)));
  const e = a.eigen, ap = a.apple_kleur;
  console.log(a.title.padEnd(22).slice(0, 22), e.bg, e.t1, e.t2, `${contrast(hx(e.t1), hx(e.bg)).toFixed(1)}/${contrast(hx(e.t2), hx(e.bg)).toFixed(1)}`,
    JSON.stringify(e.waarom), '| apple', ap ? `${ap.bg} ${ap.t1} ${ap.t2}` : '—');
}
fs.writeFileSync(path.join(__dirname, 'tekening.json'), JSON.stringify(k, null, 1));
