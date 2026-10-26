// Kopieert het deel van Deep Roon dat Stacks gebruikt (album, Focus-bibliotheek, en het interne protocol eronder) naar
// één bestand, lib/intern.js — kopiëren en aanpassen, geen gedeeld pakket (René, 26 okt 2026). Breekt een Roon-update
// het protocol: eerst Deep Roon repareren, dan dit opnieuw draaien.
//   node intern/kopieer-intern.mjs [pad naar deep-roon-mcp]   (standaard ~/Documents/Apps/deep-roon-mcp)
import { createRequire } from 'module';
import { execSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

const hier = path.dirname(fileURLToPath(import.meta.url));
const deep = path.resolve(process.argv[2] ?? path.join(os.homedir(), 'Documents/Apps/deep-roon-mcp'));
if (!fs.existsSync(path.join(deep, 'src/core/session.ts'))) { console.error(`geen deep-roon-mcp in ${deep}`); process.exit(1); }
const esbuild = createRequire(path.join(deep, 'package.json'))('esbuild');

const git = c => { try { return execSync(`git -C "${deep}" ${c}`, { encoding: 'utf8' }).trim(); } catch { return '?'; } };
const commit = git('rev-parse --short HEAD'), vuil = git('status --porcelain -- src') ? ' (met wijzigingen buiten git)' : '';
const versie = JSON.parse(fs.readFileSync(path.join(deep, 'package.json'), 'utf8')).version;

const uit = path.join(hier, '../lib/intern.js');
await esbuild.build({
  entryPoints: [path.join(hier, 'ingang.ts')],
  bundle: true, platform: 'node', format: 'cjs', target: 'node18', outfile: uit,
  external: ['bufferutil', 'utf-8-validate'],
  logLevel: 'warning',
  nodePaths: [path.join(deep, 'node_modules')],
  plugins: [{
    name: 'deep',
    setup(b) {
      // "deep/…" = deep-roon-mcp/src/…
      b.onResolve({ filter: /^deep\// }, a => ({ path: path.join(deep, 'src', a.path.slice(5) + '.ts') }));
      // Deep Roon's eigen extensie eruit: session.ts krijgt Stacks' koppeling.
      b.onResolve({ filter: /^\.\/official$/ }, a => a.importer.endsWith(path.join('core', 'session.ts')) ? { path: path.join(hier, 'official.ts') } : undefined);
    },
  }],
  banner: { js: `// lib/intern.js — GEKOPIEERD uit deep-roon-mcp ${versie} @ ${commit}${vuil} door intern/kopieer-intern.mjs op ${new Date().toISOString().slice(0, 10)}.\n// Niet met de hand bewerken. Bevat Roon's interne protocol via Arthur Soares' roon-api-reverse-engineering (zie deep-roon-mcp/NOTICE).` },
});
// De licenties gaan mee: Deep Roon (Apache-2.0, NOTICE) en Arthur Soares' kern (MIT).
fs.copyFileSync(path.join(deep, 'NOTICE'), path.join(hier, 'NOTICE-deep-roon-mcp'));
fs.copyFileSync(path.join(deep, 'LICENSE'), path.join(hier, 'LICENSE-deep-roon-mcp'));
fs.copyFileSync(path.join(deep, 'src/intern/LICENSE'), path.join(hier, 'LICENSE-roon-api-reverse-engineering'));
const kb = Math.round(fs.statSync(uit).size / 1024);
console.log(`lib/intern.js: deep-roon-mcp ${versie} @ ${commit}${vuil}, ${kb} kB`);
