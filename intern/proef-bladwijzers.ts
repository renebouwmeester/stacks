// Meetscript (29 okt 2026, zie BLADWIJZERS.md): Roon's bladwijzers uit Broker.ClientData — alleen lezen. Niet in lib/intern.js.
import { ObjectGraph } from 'deep/intern/proto/objects';
import { BinaryReader } from 'deep/intern/proto/reader';
import { withCore, shutdown } from 'deep/core/session';
import { zetGekoppeld } from './official';
zetGekoppeld(true);
const G: any = ObjectGraph.prototype, orig = G.pushObj;
G.pushObj = function (r: BinaryReader, populate: boolean) {
  const start = r.pos;
  const k = new BinaryReader(r.buf); k.pos = start;
  const oid = k.flexLong(), typeId = k.flexInt();
  const name = this.types.get(typeId)?.name ?? '';
  if (populate && /DataDictionary/.test(name)) {
    const ruw = Buffer.from(r.buf.slice(k.pos, Math.min(r.buf.length, k.pos + 4000)));
    console.log(`DICT oid ${oid} ${name} — ${r.buf.length - k.pos} bytes na de kop`);
    try {
      const n = k.integer(); console.log('  aantal?', n);
      for (let i = 0; i < n && k.remaining > 0; i++) {
        const sleutel = k.string(), waarde = k.string();
        console.log('  ', sleutel, '·', waarde?.length ?? 0, 'tekens');
        if (sleutel && /ookmark/i.test(sleutel)) console.log('JSON', waarde);
      }
    } catch (e: any) { console.log('  geen telling+paren:', e.message); console.log('  hex:', ruw.slice(0, 200).toString('hex')); console.log('  tekst:', ruw.slice(0, 600).toString('latin1').replace(/[^\x20-\x7e]/g, '.')); }
  }
  return orig.call(this, r, populate);
};
withCore(async () => { await new Promise(r => setTimeout(r, 3000)); })
  .catch((e: any) => console.log('fout:', e.message)).finally(() => { shutdown(); setTimeout(() => process.exit(0), 300); });
