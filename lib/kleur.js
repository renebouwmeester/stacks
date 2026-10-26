// Rugkleuren uit een hoes: een achtergrond (bg) en twee leesbare letterkleuren (t1 voor de artiest, t2 voor de titel),
// zoals Apple ze per album meegeeft en Roon niet. Puur JS (jpeg-js), zodat het ook op een Core, Pi of in Docker draait.
//
// Werkwijze:
//  1. de hoes verkleinen tot 48×48 (blokgemiddelde, dat dempt korrel en tekst);
//  2. de pixels in emmers van 4 bits per kanaal, en emmers die in OKLab dicht bij elkaar liggen samenvoegen tot een palet;
//  3. bg = de kleur die de RAND domineert (de buitenste 4 pixels rondom), mits die minstens 30% van de rand is —
//     een rug is de "zijkant" van de hoes; anders de kleur die de hele hoes domineert;
//  4. t1/t2 = de twee meest karaktervolle andere kleuren van de hoes, opgetild tot WCAG-contrast 11 (artiest) en 7
//     (titel); heeft de hoes er maar één kleur naast bg, dan is t2 een menging van t1 en bg.
const jpeg = require('jpeg-js');

const N = 48, RAND = 4;
// Contrastdoelen (WCAG): Apple's letters halen meestal 10+; haalt de rug het niet (middengrijs), dan wordt het wit/zwart.
const T1 = 11, T2 = 7;

function lin(c) { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }
function luminantie([r, g, b]) { return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b); }
function contrast(a, b) { const x = luminantie(a), y = luminantie(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
function oklab([r, g, b]) {
  const R = lin(r), G = lin(g), B = lin(b);
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
  return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
          0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s];
}
function uitOklab([L, a, b]) {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3, m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3,
        s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const rgb = [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
               -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s];
  return rgb.map(v => { v = v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(Math.max(v, 0), 1 / 2.4) - 0.055; return Math.round(Math.min(1, Math.max(0, v)) * 255); });
}
function afstand(a, b) { const p = oklab(a), q = oklab(b); return Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]); }
function chroma(c) { const [, a, b] = oklab(c); return Math.hypot(a, b); }
function meng(a, b, t) { return a.map((v, i) => Math.round(v * (1 - t) + b[i] * t)); }
function hex(c) { return c.map(v => v.toString(16).padStart(2, '0')).join(''); }

function verklein(img) {
  const { width: w, height: h, data } = img, uit = [];
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const x0 = Math.floor(x * w / N), x1 = Math.floor((x + 1) * w / N), y0 = Math.floor(y * h / N), y1 = Math.floor((y + 1) * h / N);
    let r = 0, g = 0, b = 0, n = 0;
    for (let yy = y0; yy < y1; yy++) for (let xx = x0; xx < x1; xx++) { const i = (yy * w + xx) * 4; r += data[i]; g += data[i + 1]; b += data[i + 2]; n++; }
    uit.push({ c: [r / n, g / n, b / n].map(Math.round), rand: x < RAND || y < RAND || x >= N - RAND || y >= N - RAND });
  }
  return uit;
}

// Emmers → palet: grootste emmer eerst, alles binnen 0.06 OKLab erbij (gewogen gemiddelde).
function palet(px) {
  const emmers = new Map();
  for (const p of px) {
    const k = (p.c[0] >> 4) << 8 | (p.c[1] >> 4) << 4 | (p.c[2] >> 4);
    const e = emmers.get(k) || { som: [0, 0, 0], n: 0, rand: 0 };
    p.c.forEach((v, i) => e.som[i] += v); e.n++; if (p.rand) e.rand++;
    emmers.set(k, e);
  }
  const lijst = [...emmers.values()].map(e => ({ c: e.som.map(v => v / e.n), n: e.n, rand: e.rand })).sort((a, b) => b.n - a.n);
  const pal = [];
  for (const e of lijst) {
    const doel = pal.find(p => afstand(p.c, e.c) < 0.06);
    if (doel) { const t = e.n / (doel.n + e.n); doel.c = doel.c.map((v, i) => v * (1 - t) + e.c[i] * t); doel.n += e.n; doel.rand += e.rand; }
    else pal.push({ ...e, c: [...e.c] });
  }
  const tot = px.length, randTot = px.filter(p => p.rand).length;
  return pal.map(p => ({ c: p.c.map(Math.round), aandeel: p.n / tot, randAandeel: p.rand / randTot })).sort((a, b) => b.aandeel - a.aandeel);
}

// Een letterkleur: de meest karaktervolle kleur van de hoes (aandeel × verzadiging) die niet op bg lijkt, opgetild — naar wit
// op een donkere rug, naar zwart op een lichte — tot hij het gevraagde contrast haalt. Zo krijg je Apple's getinte
// bijna-witten (zandkleur op Spin, roze op Vulture Prince) in plaats van een donkere hoeskleur die nét leesbaar is.
function letter(bg, pal, doel, deel, niet) {
  const k = pal.filter(p => p.aandeel >= 0.005 && afstand(p.c, bg) > 0.08 && (!niet || afstand(p.c, niet) > 0.06))
    .map(p => ({ ...p, score: Math.pow(p.aandeel, 0.35) * (1 + 20 * chroma(p.c)) }))
    .sort((a, b) => b.score - a.score)[0];
  if (!k) return null;
  return { c: til(k.c, bg, doel, deel), bron: k.c };
}
// Op een middentoon (Travel Guide, Hanging Gardens) is 11 niet haalbaar; dan een doel net onder het haalbare, zodat de
// letters hun tint houden en t1 en t2 niet allebei zuiver wit worden.
// Optillen in OKLab: alleen de lichtheid schuift (omhoog op een donkere rug, omlaag op een lichte), tint en verzadiging
// blijven — mengen met wit bleekte Spin's oranje en Vulture Prince' roze tot grijs. Wat buiten sRGB valt, verliest
// stap voor stap verzadiging. Op een middentoon (Travel Guide, Hanging Gardens) is het doel niet haalbaar; dan een doel
// net onder het haalbare, zodat t1 en t2 niet allebei zuiver wit worden.
function til(c, bg, doel, deel) {
  const licht = contrast([255, 255, 255], bg) >= contrast([0, 0, 0], bg);
  doel = Math.min(doel, 1 + (contrast(licht ? [255, 255, 255] : [0, 0, 0], bg) - 1) * deel);
  const [L0, a, b] = oklab(c);
  for (let v = 1; v >= -0.001; v -= 0.1) {   // zoveel mogelijk verzadiging houden; pas als het niet past, minder
    for (let i = 0; i <= 50; i++) {
      const L = licht ? L0 + (1 - L0) * i / 50 : L0 * (1 - i / 50);
      const m = uitOklab([L, a * v, b * v]), t = oklab(m);
      if (Math.hypot(t[0] - L, t[1] - a * v, t[2] - b * v) < 0.01 && contrast(m, bg) >= doel) return m;
    }
  }
  return licht ? [255, 255, 255] : [0, 0, 0];
}

function rugkleuren(jpg) {
  const img = jpeg.decode(jpg, { useTArray: true, formatAsRGBA: true });
  const px = verklein(img), pal = palet(px);
  const randKleur = [...pal].sort((a, b) => b.randAandeel - a.randAandeel)[0];
  const bron = randKleur.randAandeel >= 0.30 ? 'edge' : 'dominant';
  const bg = bron === 'edge' ? randKleur.c : pal[0].c;

  let k1 = letter(bg, pal, T1, 0.95), k2 = letter(bg, pal, T2, 0.8, k1 && k1.bron);
  // De artiest draagt de kleur van de hoes, zoals bij Apple (Spin, Sphere, Vulture Prince): is de tweede bron kleuriger,
  // dan wisselen ze van plaats, elk opnieuw opgetild naar zijn eigen doel.
  if (k1 && k2 && chroma(k2.bron) > chroma(k1.bron)) {
    [k1, k2] = [{ c: til(k2.bron, bg, T1, 0.95), bron: k2.bron }, { c: til(k1.bron, bg, T2, 0.8), bron: k1.bron }];
  }
  const t1 = k1 ? k1.c : til(bg, bg, T1, 0.95);
  const t2 = k2 ? k2.c : til(meng(t1, bg, 0.25), bg, T2, 0.8);
  return {
    bg: hex(bg), t1: hex(t1), t2: hex(t2),
    waarom: { bron, randAandeel: +randKleur.randAandeel.toFixed(2), kleuren: pal.filter(p => p.aandeel >= 0.02).length,
              t1: k1 ? 'cover' : 'neutral', t2: k2 ? 'cover' : 'blend' },
  };
}

module.exports = { rugkleuren, contrast };
