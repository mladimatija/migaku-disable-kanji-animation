// Shared Playwright fixture: boots Chromium with the built extension loaded
// unpacked, and serves tests/fixtures/migaku-study.html at the real Migaku URL
// so the content script's `matches` pattern fires without a Migaku account.

import { chromium, test as base, type BrowserContext, type Page } from '@playwright/test';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../..');
const distDir = path.join(repoRoot, 'dist');
const fixtureHtml = path.join(__dirname, 'migaku-study.html');

export const STUDY_URL = 'https://study.migaku.com/study';

if (!existsSync(distDir)) {
	throw new Error(`dist/ not found at ${distDir}. Run \`npm run build\` before \`npm test\`.`);
}

interface Fixtures {
	context: BrowserContext;
	/** Opens the fixture study page (optionally with query flags) once the content script is active. */
	openStudy: (query?: string) => Promise<Page>;
}

export const test = base.extend<Fixtures>({
	// `headless: false` because Playwright's headless mode doesn't load
	// extensions, and Chrome 137+ also needs the DisableLoadExtensionCommandLineSwitch
	// feature turned off. On Linux CI, wrap the run in `xvfb-run`.
	//
	// PWTEST_BROWSER=chrome uses your installed Chrome stable;
	// PWTEST_CHROMIUM_PATH points at any other Chromium binary.
	context: async ({ headless: _headless }, use) => {
		const useSystemChrome = process.env.PWTEST_BROWSER === 'chrome';
		const executablePath = process.env.PWTEST_CHROMIUM_PATH;
		const context = await chromium.launchPersistentContext('', {
			headless: false,
			...(useSystemChrome ? { channel: 'chrome' } : {}),
			...(executablePath ? { executablePath } : {}),
			locale: 'en-US',
			args: [
				`--disable-extensions-except=${distDir}`,
				`--load-extension=${distDir}`,
				'--lang=en-US',
				'--disable-features=DisableLoadExtensionCommandLineSwitch',
				'--no-sandbox',
			],
		});
		await use(context);
		await context.close();
	},

	openStudy: async ({ context }, use) => {
		const html = readFileSync(fixtureHtml, 'utf8');
		await context.route('https://study.migaku.com/**', async (route) => {
			await route.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: html });
		});

		await use(async (query = '') => {
			const page = context.pages()[0] ?? (await context.newPage());
			await page.goto(STUDY_URL + query);
			// The content script flags <html> when it's running.
			await page.waitForSelector('html[data-mdka-active]', { state: 'attached', timeout: 5000 });
			return page;
		});
	},
});

export { expect } from '@playwright/test';
export type { Page } from '@playwright/test';
