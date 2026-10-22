// Wipes `dist/` and the root zip artifact before each build so stale assets
// never linger and an out-of-date zip can't end up in a release. Uses Node's
// `fs.rmSync` (cross-platform) rather than `rm -rf`.

import { rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '..');

const targets = [path.join(repoRoot, 'dist'), path.join(repoRoot, 'migaku-disable-kanji-animation.zip')];
for (const target of targets) {
	rmSync(target, { recursive: true, force: true });
	console.log(`cleaned ${target}`);
}
