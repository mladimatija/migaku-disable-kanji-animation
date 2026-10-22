import { defineConfig } from 'vite';
import { crx } from '@crxjs/vite-plugin';
import manifest from './manifest.json' with { type: 'json' };
import pkg from './package.json' with { type: 'json' };

/**
 * Convert a SemVer string into a Chrome-manifest-compatible version.
 *
 * Chrome's manifest format only accepts up to four dot-separated integers
 * (e.g. "1.2.3.4"). SemVer prereleases like "0.2.0-beta.1" or "1.0.0+build"
 * are not valid, so we strip everything after the first `-` or `+`. The
 * normalized version is written into the manifest at build time so that
 * `package.json.version` is the single source of truth - never edit
 * `manifest.json.version` by hand.
 */
function toChromeVersion(semver: string): string {
	return semver.split(/[-+]/, 1)[0] ?? semver;
}

const syncedManifest = {
	...manifest,
	version: toChromeVersion(pkg.version),
};

export default defineConfig({
	plugins: [crx({ manifest: syncedManifest })],
	build: {
		// Sourcemaps are intentionally OFF in production builds.
		//
		// @crxjs/vite-plugin wraps content scripts in `(function(){…})()` and,
		// under Vite 8 / Rolldown, emits the closing `})()` on the same line as
		// the `//# sourceMappingURL=…` comment, so the IIFE never closes and the
		// bundle fails to parse. Re-enable once upstream is patched.
		sourcemap: false,
		// NOTE: do not set `rolldownOptions` / `rollupOptions` here - it shadows
		// the CRX plugin's own content-script input mapping.
	},
});
