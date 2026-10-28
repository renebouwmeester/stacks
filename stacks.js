// Stacks for Roon (26 okt 2026): Basso's Stacks voor een Roon-bibliotheek. Een kleine Roon-extensie die een webpagina
// serveert; de pagina toont de albums als liggende ruggen in de kleuren van de hoes. Stap 2: alleen de officiële API —
// de albumlijst (browse), de hoezen (image) en daaruit de rugkleuren (lib/kleur.js), bewaard per image_key.
// Stap 3: een rug klapt open (hoes, tracks, knoppen) en speelt op een Roon-zone (browse-acties en transport).
// Stap 4: de rijkere laag (speelduur, datums, catalogusnummer, credits) uit Roon's interne protocol — de twee functies
// gekopieerd uit Deep Roon (lib/intern.js); uit te zetten in Roon's instellingen.
//
// Gebruik: node stacks.js   (poort 9360, of PORT=…; gegevens in ./data, of STACKS_DATA=…; de Core met de hand: ROON_CORE=host[:poort])
const RoonApi = require('node-roon-api');
const RoonApiBrowse = require('node-roon-api-browse');
const RoonApiImage = require('node-roon-api-image');
const RoonApiStatus = require('node-roon-api-status');
const RoonApiTransport = require('node-roon-api-transport');
const RoonApiSettings = require('node-roon-api-settings');
const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { rugkleuren } = require('./lib/kleur');
const { maakDeep } = require('./lib/deep');

const POORT = Number(process.env.PORT) || 9360;
const DATA = process.env.STACKS_DATA || path.join(__dirname, 'data');
fs.mkdirSync(DATA, { recursive: true });
// De koppeling met Roon (node-roon-api's config.json: het token en de instellingen) woont in de datamap, zodat een container
// hem in zijn volume houdt (28 okt, Docker). Van daarvóór stond hij naast stacks.js: één keer meeverhuizen.
{
  const oud = path.join(__dirname, 'config.json'), nieuw = path.join(DATA, 'config.json');
  if (!fs.existsSync(nieuw) && fs.existsSync(oud)) fs.copyFileSync(oud, nieuw);
  process.chdir(DATA);
}
const KLEURBESTAND = path.join(DATA, 'kleuren.json');

function log(...a) { console.log(new Date().toISOString().slice(11, 19), ...a); }

// ---- de kleuren, per image_key (een hoes verandert niet onder dezelfde sleutel) ----
let kleuren = {};
try { kleuren = JSON.parse(fs.readFileSync(KLEURBESTAND, 'utf8')); } catch { }
let bewaarTimer = null;
function bewaar() {
  clearTimeout(bewaarTimer);
  bewaarTimer = setTimeout(() => fs.writeFile(KLEURBESTAND, JSON.stringify(kleuren), () => { }), 2000);
}

// ---- Roon ----
let browse = null, image = null, transport = null, kern = null;
const zones = new Map();
// De wachtrij per zone, steeds bij (Now Playing en What's Next in de lessenaar; Play From Here zoekt er de track in).
// Een open abonnement per zone — play_from_here antwoordt alleen met een abonnement dat nog openstaat (log 26 okt).
const wachtrijen = new Map();
function volgWachtrij(id) {
  if (wachtrijen.has(id) || !transport) return;
  const w = { items: [], abo: null };
  wachtrijen.set(id, w);
  w.abo = transport.subscribe_queue(id, 200, (cmd, d) => {
    if (cmd === 'Subscribed') w.items = d.items ?? [];
    else if (cmd === 'Changed') for (const c of d.changes ?? []) {
      if (c.operation === 'remove') w.items.splice(c.index, c.count);
      else if (c.operation === 'insert') w.items.splice(c.index, 0, ...(c.items ?? []));
    }
  });
}
let albums = [];          // { title, artist, image }
let laadt = false;

const roon = new RoonApi({
  extension_id: 'nl.renebouwmeester.stacks',
  display_name: `Stacks on ${os.hostname().split('.')[0]}`,
  display_version: require('./package.json').version,
  publisher: 'René Bouwmeester',
  email: '',
  website: 'https://github.com/renebouwmeester/stacks',
  log_level: 'none',
  core_paired(core) {
    kern = core; browse = core.services.RoonApiBrowse; image = core.services.RoonApiImage; transport = core.services.RoonApiTransport;
    log('gekoppeld aan', core.display_name);
    deep.zetGekoppeld(true);
    transport.subscribe_zones((cmd, data) => {
      if (cmd === 'Subscribed') { zones.clear(); wachtrijen.clear(); for (const z of data.zones ?? []) { zones.set(z.zone_id, z); volgWachtrij(z.zone_id); } }
      else if (cmd === 'Changed') {
        for (const z of data.zones_added ?? []) { zones.set(z.zone_id, z); volgWachtrij(z.zone_id); }
        for (const z of data.zones_changed ?? []) zones.set(z.zone_id, z);
        for (const id of data.zones_removed ?? []) { zones.delete(id); try { wachtrijen.get(id)?.abo?.unsubscribe(); } catch { } wachtrijen.delete(id); }
        for (const z of data.zones_seek_changed ?? []) { const o = zones.get(z.zone_id); if (o?.now_playing) o.now_playing.seek_position = z.seek_position; }
      }
    });
    laadAlbums();
  },
  core_unpaired(core) {
    kern = null; browse = null; image = null; transport = null; zones.clear(); wachtrijen.clear();
    log('ontkoppeld van', core.display_name);
    deep.zetGekoppeld(false);
    toonStatus();
  },
});
const status = new RoonApiStatus(roon);

// ---- Deep Roon en de instellingen (in Roon › Settings › Extensions › Stacks) ----
const deep = maakDeep({ bestand: path.join(DATA, 'deep.json'), log });
// Richer data staat bij een nieuwe installatie aan (René, 29 okt: "het is toch minimaal readonly werk, maar het raakt wel
// aan de core promise van Stacks"; op 28 okt nog uit). Uit te zetten in Roon's instellingen; een opgeslagen keuze blijft.
let instellingen = { deep: 'on', catorde: 'catno', catrug: 'sorted', capsule: 'on' };
instellingen = { ...instellingen, ...(roon.load_config('instellingen') ?? {}) };
// Van vóór de kopie (26 okt): toen was 'deep' het adres van een Deep Roon MCP — ingevuld telt als aan, leeg als uit.
if (!['on', 'off'].includes(instellingen.deep)) instellingen.deep = instellingen.deep ? 'on' : 'off';
deep.zetAan(instellingen.deep === 'on');
// Korte regels: Roon breekt een label niet af (Solo, 11 okt).
function layout(v) {
  return { values: v, has_error: false, layout: [
    { type: 'group', title: 'Richer data (optional)', items: [
      { type: 'label', title: 'Play times, credits, dates and catalog numbers' },
      { type: 'label', title: 'come from Roon\'s internal protocol, as Deep Roon reads it' },
      { type: 'label', title: 'It is unofficial and can break with a Roon update' },
      { type: 'dropdown', title: 'Richer data', setting: 'deep', values: [{ title: 'On', value: 'on' }, { title: 'Off', value: 'off' }] },
      { type: 'label', title: deep.stand },
    ] },
    { type: 'dropdown', title: 'Catalog # order uses', setting: 'catorde',
      values: [{ title: 'Catalogue number', value: 'catno' }, { title: 'Barcode', value: 'barcode' }] },
    // Het nummer op de rug aan of uit (René, 26 okt): altijd, of alleen als de stapel erop gesorteerd is.
    { type: 'dropdown', title: 'Catalog # on the spines', setting: 'catrug',
      values: [{ title: 'Only in Catalog # order', value: 'sorted' }, { title: 'Always', value: 'always' }] },
    // De speelcapsule onderin als Now Playing dicht is: aan of uit (René, 26 okt: "de mini-player optioneel").
    { type: 'dropdown', title: 'Mini player when Now Playing is hidden', setting: 'capsule',
      values: [{ title: 'Show', value: 'on' }, { title: 'Hide', value: 'off' }] },
  ] };
}
const settings = new RoonApiSettings(roon, {
  get_settings(cb) { cb(layout(instellingen)); },
  save_settings(req, isDryRun, s) {
    const l = layout(s.values);
    req.send_complete(l.has_error ? 'NotValid' : 'Success', { settings: l });
    if (isDryRun || l.has_error) return;
    const ander = (l.values.deep === 'off' ? 'off' : 'on') !== instellingen.deep;
    instellingen = { deep: l.values.deep === 'off' ? 'off' : 'on', catorde: l.values.catorde === 'barcode' ? 'barcode' : 'catno',
                     catrug: l.values.catrug === 'always' ? 'always' : 'sorted', capsule: l.values.capsule === 'off' ? 'off' : 'on' };
    roon.save_config('instellingen', instellingen);
    if (ander) { deep.zetAan(instellingen.deep === 'on'); deep.ververs(veranderd); }
  },
});
function veranderd() { toonStatus(); settings.update_settings(layout(instellingen)); }

roon.init_services({ required_services: [RoonApiBrowse, RoonApiImage, RoonApiTransport], provided_services: [status, settings] });
// De Core vinden: zelf zoeken (SOOD, UDP-multicast op 9003), of met de hand via ROON_CORE=host[:poort] (28 okt, Basso
// Development: Docker Desktop op de Mac draait containers in een Linux-VM, en daar komt die multicast niet door). Met de hand
// verbindt hij rechtstreeks over TCP en blijft hij het opnieuw proberen als de verbinding wegvalt. De kopie van Deep Roon
// (lib/intern.js) leest hetzelfde adres als ROON_HOST.
const handCore = (process.env.ROON_CORE ?? '').trim();
if (handCore) {
  const m = /^\[?([^\]]+?)\]?(?::(\d+))?$/.exec(handCore);
  const host = m?.[1] ?? handCore, port = Number(m?.[2] ?? 9330);
  process.env.ROON_HOST ??= `${host}:${port}`;
  log('Core met de hand:', `${host}:${port}`);
  const verbind = () => roon.ws_connect({ host, port, onclose: () => setTimeout(verbind, 3000) });
  verbind();
} else roon.start_discovery();

function adres() {
  // In een container ziet Stacks alleen zijn eigen interne adres: STACKS_URL zegt waar de pagina echt te openen is.
  if (process.env.STACKS_URL) return process.env.STACKS_URL.replace(/\/$/, '');
  for (const lijst of Object.values(os.networkInterfaces()))
    for (const a of lijst ?? []) if (a.family === 'IPv4' && !a.internal) return `http://${a.address}:${POORT}`;
  return `http://localhost:${POORT}`;
}
function toonStatus() {
  if (!kern) return status.set_status('Waiting for a Roon Core', false);
  const open = albums.filter(a => a.image && !kleuren[a.image]).length;
  status.set_status(laadt ? 'Reading the library…'
    : `${albums.length} albums${open ? `, colouring ${open}` : ''} · open ${adres()}${deep.aan ? ' · richer data on' : ''}`, false);
}

// Elk antwoord van Roon met een tijdslimiet (René, 26 okt: "kan geen album meer openklappen" — één verzoek waarop Roon
// nooit antwoordde, hield de hele rij erachter vast). Na 10 s geeft hij op en zegt in de log wat er hing.
function metLimiet(wat, maak, ms = 10000) {
  return new Promise((ok, mis) => {
    const t = setTimeout(() => { log('hangt:', wat); mis(new Error('Roon did not answer, try again')); }, ms);
    maak(r => { clearTimeout(t); ok(r); }, e => { clearTimeout(t); mis(e); });
  });
}
const vraag = (fn, opts) => metLimiet(`browse ${fn === browse.browse ? 'browse' : 'load'} ${JSON.stringify({ ...opts, zone_or_output_id: opts.zone_or_output_id ? 'zone' : undefined })}`,
  (ok, mis) => fn.call(browse, opts, (err, r) => err ? mis(new Error(err)) : ok(r)));

// De bibliotheek: Library › Albums, de hele lijst in pakjes van 100. De officiële API geeft per album titel, artiest
// (subtitle) en image_key — geen speelduur, datums of catalogusnummer; die komen later uit Deep Roon.
async function laadAlbums() {
  if (laadt || !browse) return;
  laadt = true; toonStatus();
  try {
    const opts = { hierarchy: 'albums', multi_session_key: 'stacks' };
    const top = await vraag(browse.browse, { ...opts, pop_all: true });
    const totaal = top.list?.count ?? 0, nieuw = [];
    for (let offset = 0; offset < totaal; offset += 100) {
      const r = await vraag(browse.load, { ...opts, offset, count: 100 });
      (r.items ?? []).forEach((it, j) => {
        // n = de plek in Roon's eigen lijst: daarmee vindt het openen het album terug (item_keys gelden maar één sessie).
        if (it.hint !== 'action') nieuw.push({ n: offset + j, title: it.title, artist: it.subtitle ?? '', image: it.image_key ?? null });
      });
    }
    albums = nieuw;
    log('bibliotheek:', albums.length, 'albums');
  } catch (e) { log('bibliotheek mislukt:', e.message); }
  laadt = false; toonStatus();
  kleurAlles();
  deep.ververs(veranderd);
}
setInterval(() => kern && laadAlbums(), 15 * 60 * 1000);

// ---- één album: de tracks en de acties ----
// Een eigen browse-sessie ('open'), één verzoek tegelijk: browse is een plek (een stapel niveaus), geen vraag-en-antwoord.
let rij = Promise.resolve();
function opRij(fn) {
  const p = rij.then(() => metLimiet('rij', (ok, mis) => Promise.resolve().then(fn).then(ok, mis), 30000));
  rij = p.catch(() => { }); return p;
}

async function naarAlbum(n, image, zone) {
  const opts = { hierarchy: 'albums', multi_session_key: 'open', ...(zone ? { zone_or_output_id: zone } : {}) };
  await vraag(browse.browse, { ...opts, pop_all: true });
  const r = await vraag(browse.load, { ...opts, offset: n, count: 1 });
  const it = r.items?.[0];
  // De bibliotheek veranderde sinds de laatste lading: opnieuw lezen, de pagina vraagt dan opnieuw.
  if (!it || (image && it.image_key !== image)) { laadAlbums(); throw new Error('Library changed, try again'); }
  await vraag(browse.browse, { ...opts, item_key: it.item_key });
  const l = await vraag(browse.load, { ...opts, offset: 0, count: 500 });
  return { opts, list: l.list, items: l.items ?? [] };
}

// Het inlegvel: de tracks zoals Roon ze noemt ("3. Modul 70_51", bij meer schijven "2-3. …"), met de uitvoerenden.
async function album(n, img) {
  const a = await naarAlbum(n, img);
  const tracks = a.items.filter(i => i.hint === 'action_list' && i.title !== 'Play Album').map(i => {
    const m = /^(\d+(?:-\d+)?)\.\s+(.*)$/.exec(i.title);
    return { nr: m ? m[1] : '', title: m ? m[2] : i.title, artist: i.subtitle ?? '' };
  });
  return { title: a.list.title, artist: a.list.subtitle ?? '', image: a.list.image_key ?? null, tracks };
}

// Afspelen: het album (of track `track`, de plek in de tracklijst) op een zone, met een van Roon's eigen acties —
// "Play Now", "Add Next", "Queue", "Start Radio", bij een track ook "Play From Here". Shuffle kent Roon's actielijst
// niet: dan eerst shuffle aan op de zone, daarna Play Now (Roon schudt dan de nieuwe wachtrij).
async function speel({ n, image: img, zone, track, action }) {
  if (!zones.has(zone)) throw new Error('Choose a zone');
  // Play From Here biedt Roon bij een albumtrack niet aan (gemeten 26 okt: alleen Play Now, Add Next, Queue, Start
  // Radio). Dus: het hele album met Play Now in de wachtrij, en dan met transport naar die track springen.
  if (action === 'Play From Here' && track != null) {
    const a = await naarAlbum(n, img, zone);
    const lijst = a.items.filter(i => i.hint === 'action_list' && i.title !== 'Play Album');
    const titel = (/^\d+(?:-\d+)?\.\s+(.*)$/.exec(lijst[track]?.title ?? '') ?? [])[1];
    log('play from here:', JSON.stringify(titel), 'track', track + 1, 'van', lijst.length);
    const oud = new Set((wachtrijen.get(zone)?.items ?? []).map(i => i.queue_item_id));
    await speel({ n, image: img, zone, action: 'Play Now' });
    log('play from here: album speelt');
    if (track === 0) return { ok: true };
    const item = await zoekInWachtrij(zone, titel, lijst.length, oud);
    log('play from here: in de wachtrij', item ? `gevonden (${item.queue_item_id})` : 'NIET gevonden');
    if (!item) throw new Error('Playing from the start: the queue did not show the track');
    await springNaar(zone, item.queue_item_id);
    return { ok: true };
  }
  const schud = action === 'Shuffle';
  const a = await naarAlbum(n, img, zone);
  const lijst = a.items.filter(i => i.hint === 'action_list');
  const doel = track == null ? lijst.find(i => i.title === 'Play Album') : lijst.filter(i => i.title !== 'Play Album')[track];
  if (!doel) throw new Error('Nothing to play');
  await vraag(browse.browse, { ...a.opts, item_key: doel.item_key });
  const acties = (await vraag(browse.load, { ...a.opts, offset: 0, count: 20 })).items ?? [];
  // Hoofdletterongevoelig: Roon schrijft niet overal dezelfde hoofdletters (René, 26 okt: "Play from here" bij een track).
  const gezocht = (schud ? 'Play Now' : action).toLowerCase();
  const actie = acties.find(i => i.title.toLowerCase() === gezocht);
  if (!actie) { log('geen actie', action, '— Roon biedt:', acties.map(i => i.title).join(', ')); throw new Error(`Roon offers no "${action}" here`); }
  if (schud) await metLimiet('change_settings', ok => transport.change_settings(zone, { shuffle: true }, ok));
  const r = await vraag(browse.browse, { ...a.opts, item_key: actie.item_key });
  return { ok: true, message: r.message ?? null };
}

// Wachten tot het album in de wachtrij van de zone staat (hooguit 4 s): het item met deze titel.
// Alleen nieuwe items: speelt hetzelfde album al, dan staat de track ook nog in de oude wachtrij.
async function zoekInWachtrij(zone, titel, aantal, oud = new Set()) {
  for (let i = 0; i < 40; i++) {
    const items = wachtrijen.get(zone)?.items ?? [];
    const vind = items.find(x => !oud.has(x.queue_item_id) && (x.three_line?.line1 ?? x.one_line?.line1) === titel);
    if (vind && items.length >= aantal) return vind;
    await new Promise(ok => setTimeout(ok, 100));
  }
  return null;
}
// Naar een item in de wachtrij springen. Roon antwoordt op play_from_here niet altijd (log 26 okt, 18:56 en 20:28: tien
// seconden stilte, ook met een open abonnement) — dus niet op het antwoord wachten, maar kijken wat er gebeurt: staat het
// item binnen 4 s vooraan in de wachtrij (Roon's wachtrij begint bij wat speelt), dan is het gelukt.
async function springNaar(zone, item) {
  let antwoord = null;
  transport.play_from_here(zone, item, m => { antwoord = m?.name ?? m; log('play_from_here: antwoord', antwoord); });
  for (let i = 0; i < 40; i++) {
    await new Promise(ok => setTimeout(ok, 100));
    if (wachtrijen.get(zone)?.items?.[0]?.queue_item_id === item) return;
    if (antwoord && antwoord !== 'Success') throw new Error(String(antwoord));
  }
  log('play_from_here: na 4 s niet vooraan in de wachtrij, antwoord', antwoord ?? 'geen');
  if (antwoord !== 'Success') throw new Error('Roon did not jump to that track');
}

// De zones voor de kiezer en de knoppen: naam, stand en wat er speelt (om Play in Pause te veranderen bij dit album).
function zoneLijst() {
  return [...zones.values()].map(z => ({
    id: z.zone_id, name: z.display_name, state: z.state,
    now: z.now_playing ? { title: z.now_playing.three_line?.line1 ?? '', artist: z.now_playing.three_line?.line2 ?? '',
                           album: z.now_playing.three_line?.line3 ?? '', image: z.now_playing.image_key ?? null,
                           len: z.now_playing.length ?? null, seek: z.now_playing.seek_position ?? null } : null,
    // Voor de lessenaar: shuffle en herhalen, wat mag, en het volume van de eerste uitgang (als Roon het kan zetten).
    shuffle: !!z.settings?.shuffle, loop: z.settings?.loop ?? 'disabled',
    kan: { prev: !!z.is_previous_allowed, next: !!z.is_next_allowed, seek: !!z.is_seek_allowed },
    volume: (() => { const v = z.outputs?.[0]?.volume; return v && v.type !== 'incremental' ? { value: v.value, min: v.min, max: v.max, step: v.step, muted: !!v.is_muted } : null; })(),
  })).sort((a, b) => a.name.localeCompare(b.name));
}

function stuur(res, code, d) {
  res.writeHead(code, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(d));
}
function lees(req) {
  return new Promise(ok => { let b = ''; req.on('data', d => { b += d; if (b.length > 1e5) req.destroy(); });
    req.on('end', () => { try { ok(JSON.parse(b || '{}')); } catch { ok({}); } }); });
}

function hoes(key, maat) {
  return new Promise((ok, mis) => image.get_image(key, { scale: 'fit', width: maat, height: maat, format: 'image/jpeg' },
    (err, type, body) => err ? mis(new Error(err)) : ok(body)));
}

// De kleuren in de achtergrond, vier tegelijk; 300 px is genoeg (de berekening verkleint toch tot 48×48).
let kleurt = false;
async function kleurAlles() {
  if (kleurt) return;
  kleurt = true;
  const rij = [...new Set(albums.map(a => a.image).filter(k => k && !kleuren[k]))];
  log('kleuren te berekenen:', rij.length);
  let gedaan = 0;
  const werker = async () => {
    while (rij.length && image) {
      const k = rij.shift();
      try { const { bg, t1, t2 } = rugkleuren(await hoes(k, 300)); kleuren[k] = { bg, t1, t2 }; }
      catch (e) { kleuren[k] = { fout: e.message }; }
      if (++gedaan % 50 === 0) { bewaar(); toonStatus(); }
    }
  };
  await Promise.all([werker(), werker(), werker(), werker()]);
  bewaar(); kleurt = false; toonStatus();
  log('kleuren klaar');
}

// ---- de webpagina ----
const PUBLIEK = path.join(__dirname, 'web');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png' };

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  if (url.pathname === '/api/albums') {
    // Deep Roon per album (als hij er is): koppelen op titel + artiest; twee albums met dezelfde naam krijgen de
    // sleutels in volgorde.
    const gezien = new Map();
    const rijen = albums.map(a => {
      const k = a.image && kleuren[a.image];
      let r = k && !k.fout ? { ...a, ...k } : { ...a };
      if (deep.aan) {
        const nk = a.title + '\u0000' + a.artist, v = gezien.get(nk) ?? 0; gezien.set(nk, v + 1);
        const dk = deep.koppel(a.title, a.artist, v), d = deep.rug(dk);
        if (d) r = { ...r, deep: dk, ...d };
      }
      return r;
    });
    res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
    return res.end(JSON.stringify({
      core: kern?.display_name ?? null, loading: laadt, deep: deep.aan, deepBusy: deep.bezig, catorde: instellingen.catorde, catrug: instellingen.catrug, capsule: instellingen.capsule,
      pending: albums.filter(a => a.image && !kleuren[a.image]).length, albums: rijen,
    }));
  }
  if (url.pathname === '/api/zones') return stuur(res, 200, { zones: zoneLijst() });
  if (url.pathname === '/api/album') {
    if (!browse) return stuur(res, 503, { error: 'Not connected to Roon' });
    try {
      const a = await opRij(() => album(Number(url.searchParams.get('n')), url.searchParams.get('image')));
      // De rijkere laag erbij; mislukt hij, dan het album zoals de officiële API het geeft.
      const dk = url.searchParams.get('deep');
      if (dk && deep.aan) { try { a.deep = await deep.album(dk); } catch (e) { log('deep roon album:', e.message); } }
      return stuur(res, 200, a);
    }
    catch (e) { return stuur(res, 409, { error: e.message }); }
  }
  if (url.pathname === '/api/actions') {
    if (!browse) return stuur(res, 503, { error: 'Not connected to Roon' });
    try {
      return stuur(res, 200, await opRij(async () => {
        const a = await naarAlbum(Number(url.searchParams.get('n')), url.searchParams.get('image'), url.searchParams.get('zone'));
        const lijst = a.items.filter(i => i.hint === 'action_list'), t = url.searchParams.get('track');
        const doel = t == null ? lijst.find(i => i.title === 'Play Album') : lijst.filter(i => i.title !== 'Play Album')[Number(t)];
        await vraag(browse.browse, { ...a.opts, item_key: doel.item_key });
        return { actions: ((await vraag(browse.load, { ...a.opts, offset: 0, count: 20 })).items ?? []).map(i => i.title) };
      }));
    } catch (e) { return stuur(res, 409, { error: e.message }); }
  }
  if (url.pathname === '/api/play' && req.method === 'POST') {
    if (!browse) return stuur(res, 503, { error: 'Not connected to Roon' });
    try { const v = await lees(req); return stuur(res, 200, await opRij(() => speel(v))); }
    catch (e) { return stuur(res, 409, { error: e.message }); }
  }
  if (url.pathname === '/api/queue') {
    const items = wachtrijen.get(url.searchParams.get('zone'))?.items ?? [];
    return stuur(res, 200, { items: items.map(i => ({ id: i.queue_item_id, title: i.three_line?.line1 ?? i.one_line?.line1 ?? '',
      artist: i.three_line?.line2 ?? '', album: i.three_line?.line3 ?? '', image: i.image_key ?? null, len: i.length ?? null })) });
  }
  // De lessenaar: zoeken in de track, volume, shuffle/herhalen, een item uit de wachtrij spelen.
  if (req.method === 'POST' && ['/api/seek', '/api/volume', '/api/mute', '/api/settings', '/api/jump'].includes(url.pathname)) {
    if (!transport) return stuur(res, 503, { error: 'Not connected to Roon' });
    const v = await lees(req), z = zones.get(v.zone);
    if (!z) return stuur(res, 400, { error: 'Choose a zone' });
    const klaar = err => stuur(res, err && err !== 'Success' ? 409 : 200, err && err !== 'Success' ? { error: String(err) } : { ok: true });
    try {
      if (url.pathname === '/api/seek') return transport.seek(z.zone_id, 'absolute', Math.max(0, Math.round(Number(v.seconds) || 0)), klaar);
      if (url.pathname === '/api/volume') {
        const o = z.outputs?.[0];
        if (!o?.volume || o.volume.type === 'incremental') return stuur(res, 409, { error: 'Roon cannot set this volume' });
        const w = Math.min(o.volume.max, Math.max(o.volume.min, Number(v.value)));
        return transport.change_volume(o.output_id, 'absolute', w, klaar);
      }
      // Het luidsprekertje (René, 26 okt: "kan het ook functioneel worden?"): geluid uit en weer aan.
      if (url.pathname === '/api/mute') {
        const o = z.outputs?.[0];
        if (!o?.volume) return stuur(res, 409, { error: 'Roon cannot mute this zone' });
        return transport.mute(o.output_id, o.volume.is_muted ? 'unmute' : 'mute', klaar);
      }
      if (url.pathname === '/api/settings') {
        const zet = {};
        if (typeof v.shuffle === 'boolean') zet.shuffle = v.shuffle;
        if (['disabled', 'loop', 'loop_one'].includes(v.loop)) zet.loop = v.loop;
        return transport.change_settings(z.zone_id, zet, klaar);
      }
      await springNaar(z.zone_id, v.item); return stuur(res, 200, { ok: true });
    } catch (e) { return stuur(res, 409, { error: e.message }); }
  }
  if (url.pathname === '/api/control' && req.method === 'POST') {
    if (!transport) return stuur(res, 503, { error: 'Not connected to Roon' });
    const v = await lees(req);
    if (!zones.has(v.zone) || !['playpause', 'play', 'pause', 'next', 'previous'].includes(v.control)) return stuur(res, 400, { error: 'Bad request' });
    return transport.control(v.zone, v.control, err => stuur(res, err ? 409 : 200, err ? { error: String(err) } : { ok: true }));
  }
  const hoesPad = /^\/cover\/([^/]+)$/.exec(url.pathname);
  if (hoesPad) {
    if (!image) { res.writeHead(503); return res.end(); }
    try {
      const body = await hoes(decodeURIComponent(hoesPad[1]), Math.min(Number(url.searchParams.get('size')) || 600, 1200));
      res.writeHead(200, { 'Content-Type': 'image/jpeg', 'Cache-Control': 'max-age=86400' });
      return res.end(body);
    } catch { res.writeHead(404); return res.end(); }
  }
  const bestand = path.join(PUBLIEK, url.pathname === '/' ? 'index.html' : path.normalize(url.pathname));
  if (!bestand.startsWith(PUBLIEK)) { res.writeHead(403); return res.end(); }
  fs.readFile(bestand, (err, d) => {
    if (err) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(bestand)] ?? 'application/octet-stream' });
    res.end(d);
  });
}).listen(POORT, () => { log('Stacks op', adres()); toonStatus(); });

// Netjes stoppen: de verbinding van het interne protocol met de Core dicht (Roon Labs' wens: niets laten hangen).
for (const sig of ['SIGTERM', 'SIGINT']) process.on(sig, () => { try { require('./lib/intern').shutdown(); } catch { } process.exit(0); });
