import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const packageJson = JSON.parse(
  readFileSync(path.join(packageRoot, 'package.json'), 'utf8'),
);
const packed = JSON.parse(
  execFileSync('npm', ['pack', '--dry-run', '--json'], {
    cwd: packageRoot,
    encoding: 'utf8',
  }),
)[0];
const packedPaths = new Set(packed.files.map(({ path: filePath }) => filePath));

const expectedFiles = ['README.md', 'LICENSE'];

for (const target of Object.values(packageJson.exports)) {
  const targets = typeof target === 'string' ? [target] : Object.values(target);
  for (const exportTarget of targets) {
    expectedFiles.push(exportTarget.replace(/^\.\//, ''));
  }
}

const missingFiles = expectedFiles.filter(
  (filePath) => !packedPaths.has(filePath),
);

if (missingFiles.length > 0) {
  throw new Error(
    `npm package is missing required files:\n${missingFiles.join('\n')}`,
  );
}

const requirePackage = createRequire(import.meta.url);
requirePackage(packageJson.name);
