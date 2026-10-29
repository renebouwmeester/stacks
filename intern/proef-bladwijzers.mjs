// Bouwt intern/proef-bladwijzers.js uit deep-roon-mcp (zoals kopieer-intern.mjs); zie BLADWIJZERS.md.
import { createRequire } from 'module';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
const hier = path.dirname(fileURLToPath(import.meta.url));
const deep = path.resolve(process.argv[2] ?? path.join(os.homedir(), 'Documents/Apps/deep-roon-mcp'));
if (!fs.existsSync(path.join(deep, 'src/core/session.ts'))) { console.error(`geen deep-roon-mcp in ${deep}`); process.exit(1); }
const esbuild = createRequire(path.join(deep, 'package.json'))('esbuild');
await esbuild.build({
  entryPoints: [path.join(hier, 'proef-bladwijzers.ts')], bundle: true, platform: 'node', format: 'cjs', target: 'node18',
  outfile: path.join(hier, 'proef-bladwijzers.js'), external: ['bufferutil', 'utf-8-validate'], logLevel: 'warning',
  nodePaths: [path.join(deep, 'node_modules')],
  plugins: [{ name: 'deep', setup(b) {
    b.onResolve({ filter: /^deep\// }, a => ({ path: path.join(deep, 'src', a.path.slice(5) + '.ts') }));
    b.onResolve({ filter: /^\.\/official$/ }, a => ({ path: path.join(hier, 'official.ts') }));
  } }],
});
console.log('intern/proef-bladwijzers.js');
