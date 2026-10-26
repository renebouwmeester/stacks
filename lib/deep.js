// De rijkere laag (26 okt 2026, René: "Official API first, internal protocol where needed"). Eerst via een draaiende Deep
// Roon MCP; sinds dezelfde avond (René: "als we maar twee commando's via Deep Roon doen — kunnen we die niet isoleren?")
// met de twee functies zelf — album en de Focus-bibliotheek — en het interne protocol eronder, gekopieerd uit deep-roon-mcp
// naar lib/intern.js (intern/kopieer-intern.mjs). Staat hij uit, of breekt hij bij een Roon-update, dan valt alles hier
// stil terug op null en werkt Stacks door met de officiële API.
//
// Wat hij levert, per album uit de bibliotheek: speelduur (de dikte van de rug), releasedatum, catalogusnummer, barcode,
// formaat, label, jaar — één keer gehaald en bewaard (data/deep.json); de volgorde van "Date Added" uit Roon's Focus; en
// bij het openen de tracktijden en de credits.
const fs = require('fs');
const intern = require('./intern');

function maakDeep({ bestand, log }) {
  let aan = false, bereikbaar = false, fout = null;
  let cache = {};
  try { cache = JSON.parse(fs.readFileSync(bestand, 'utf8')); } catch { }
  let bewaarTimer = null;
  const bewaar = () => { clearTimeout(bewaarTimer); bewaarTimer = setTimeout(() => fs.writeFile(bestand, JSON.stringify(cache), () => { }), 2000); };

  // index: genormaliseerd "titel|artiest" → Deep Roon-sleutels (een artiest kan twee albums met dezelfde titel hebben)
  let index = new Map(), toegevoegd = new Map(), aantal = 0, bezig = false;

  const norm = s => (s ?? '').normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '');
  const sleutel = (titel, artiest) => norm(titel) + '|' + norm(artiest);

  // Dezelfde antwoorden als Deep Roon's tools roon_library en roon_album (hun run() voegt alleen image_url's toe).
  async function roep(naam, args) {
    if (!aan) throw new Error('Deep Roon is off');
    if (naam === 'roon_library') return intern.library({}, args.sort, undefined, args.limit, args.offset);
    if (naam === 'roon_album') return intern.album(args.key, args.credits === true);
    throw new Error(`unknown: ${naam}`);
  }

  const seconden = s => (s ?? '').split(':').map(Number).reduce((a, b) => a * 60 + b, 0) || null;
  // Het schildje op de rug (René, 26 okt: "de echte bitdiepte / sample rate", en daarna "alle albums een bitvermelding, in
  // een eigen rechte rij"): Roon's "FLAC 96/24" wordt "24/96", de afgekapte 44/88/176/352 weer 44.1/88.2/176.4/352.8; MQA
  // heet "MQA", TIDAL's "Mixed Formats" "Mixed", een AAC "AAC".
  const VOL = { 44: '44.1', 88: '88.2', 176: '176.4', 352: '352.8', 705: '705.6' };
  function schild(f) {
    if (!f) return null;
    const m = /(\d+)\/(\d+)/.exec(f);
    if (m) return `${m[2]}/${VOL[m[1]] ?? m[1]}`;
    if (/^MQA/.test(f)) return 'MQA';
    if (/mixed/i.test(f)) return 'Mixed';
    if (/^(AAC|MP3|DSD\d*)/i.test(f)) return f.split(' ')[0].toUpperCase();
    return null;
  }

  // De bibliotheek volgens Deep Roon, op Roon's eigen "added"-volgorde (nieuwste eerst), in pagina's van 100: de sleutels
  // om de officiële albums aan te koppelen, en meteen de volgorde voor Date Added.
  async function leesBibliotheek() {
    const rijen = [];
    for (let offset = 0; ; offset += 100) {
      const p = await roep('roon_library', { sort: 'added', limit: 100, offset });
      rijen.push(...(p.rows ?? []));
      if (!p.rows?.length || rijen.length >= (p.total ?? 0)) break;
    }
    const i = new Map(), t = new Map();
    rijen.forEach((r, n) => {
      const k = sleutel(r.title, r.artist);
      if (!i.has(k)) i.set(k, []);
      i.get(k).push({ key: r.key, title: r.title, artist: r.artist });
      t.set(r.key, n);
      const c = cache[r.key] ?? {};
      cache[r.key] = { ...c, format: r.format ?? c.format, year: r.year ?? c.year, label: r.label ?? c.label };
    });
    index = i; toegevoegd = t; aantal = rijen.length;
    return rijen;
  }

  // Per album één keer de albumpagina: speelduur, releasedatum, catalogusnummer, barcode. Rustig na elkaar — het interne
  // protocol is "not hardened for 3rd party use".
  async function vulAan(rijen, klaar) {
    const open = rijen.filter(r => cache[r.key]?.len === undefined);
    if (open.length) log('deep roon: albums te lezen:', open.length);
    let n = 0;
    for (const r of open) {
      if (!aan) return;
      try {
        const a = await roep('roon_album', { key: r.key });
        cache[r.key] = { ...cache[r.key], len: seconden(a.length), released: a.released ?? null,
                         catno: a.catalogue_number ?? null, barcode: a.barcode ?? null };
      } catch (e) { cache[r.key] = { ...cache[r.key], len: null }; }
      if (++n % 50 === 0) { bewaar(); klaar?.(); }
      await new Promise(ok => setTimeout(ok, 40));
    }
    bewaar(); klaar?.();
  }

  return {
    get aan() { return aan && bereikbaar; },
    get bezig() { return bezig; },
    get stand() {
      if (!aan) return 'Off';
      if (bezig) return 'Reading the library…';
      return bereikbaar ? `On · ${aantal.toLocaleString('en')} albums` : `Not available${fout ? `: ${fout}` : ''}`;
    },
    zetAan(a) { aan = !!a; bereikbaar = false; fout = null; if (!aan) intern.closeSoon('switched off'); },
    // De toestemming: het interne protocol opent alleen als Stacks in Roon is ingeschakeld.
    zetGekoppeld(g) { intern.zetGekoppeld(g); if (!g) intern.closeSoon('unpaired'); },
    // Lezen (bij de start en na elke lading van de officiële bibliotheek).
    async ververs(klaar) {
      if (!aan || bezig) return;
      bezig = true;
      try { const rijen = await leesBibliotheek(); bereikbaar = true; fout = null; klaar?.(); await vulAan(rijen, klaar); }
      catch (e) { bereikbaar = false; fout = e.message; log('deep roon:', fout); }
      bezig = false; klaar?.();
    },
    // De Deep Roon-sleutel bij een officieel album (titel + artiest); bij meer kandidaten de n-de van dezelfde naam.
    // Eerst letterlijk (Brad Mehldau Trio "Live" en ": Live" zijn twee uitgaven die genormaliseerd gelijk zijn).
    koppel(titel, artiest, volgnummer = 0) {
      const k = index.get(sleutel(titel, artiest));
      if (!k) return null;
      const precies = k.filter(x => x.title === titel && x.artist === artiest);
      const lijst = precies.length ? precies : k;
      return (lijst[volgnummer] ?? lijst[0]).key;
    },
    // Wat een rug nodig heeft.
    rug(key) {
      const c = key && cache[key];
      if (!c) return null;
      return { len: c.len ?? null, released: c.released ?? null, added: toegevoegd.get(key) ?? null,
               catno: c.catno ?? null, barcode: c.barcode ?? null, fmt: schild(c.format), year: c.year ?? null, label: c.label ?? null };
    },
    // Het inlegvel: tracktijden en credits, live (alleen bij het openen).
    async album(key) {
      const a = await roep('roon_album', { key, credits: true });
      return {
        tracks: (a.tracks ?? []).map(t => ({ n: t.n, title: t.title, len: seconden(t.length) })),
        credits: a.credits ?? [], released: a.released ?? null, label: a.album?.label ?? null, format: a.album?.format ?? null,
        year: a.album?.year ?? null, catno: a.catalogue_number ?? null, barcode: a.barcode ?? null, len: seconden(a.length),
      };
    },
  };
}

module.exports = { maakDeep };
