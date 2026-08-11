import { readdir } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const sourceRoot = fileURLToPath(new URL('../src/', import.meta.url));
const allowedDeclarations = new Set(['vite-env.d.ts']);
const forbidden = [];

async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      await walk(path);
      continue;
    }

    const relativePath = relative(sourceRoot, path).replaceAll('\\', '/');
    const isGeneratedJavaScript = extname(entry.name) === '.js';
    const isSourceMap = entry.name.endsWith('.map');
    const isDeclaration = entry.name.endsWith('.d.ts') && !allowedDeclarations.has(relativePath);
    if (isGeneratedJavaScript || isSourceMap || isDeclaration) forbidden.push(relativePath);
  }
}

await walk(sourceRoot);

if (forbidden.length > 0) {
  console.error('Generated artifacts found in src/. TypeScript must remain the only runtime source:');
  forbidden.forEach((path) => console.error(`  - src/${path}`));
  process.exitCode = 1;
} else {
  console.log('Source hygiene check passed: no generated JavaScript, maps, or declarations in src/.');
}
