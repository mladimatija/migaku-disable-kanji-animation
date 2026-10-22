import { defineConfig } from '@playwright/test';

// The extension needs a persistent, headed Chromium context - keep everything serial.
export default defineConfig({
	testDir: './tests',
	testMatch: /tests\/e2e\/.*\.spec\.ts$/,
	fullyParallel: false,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 1 : 0,
	workers: 1,
	reporter: process.env.CI ? [['list'], ['github']] : 'list',
	use: {
		screenshot: 'only-on-failure',
		trace: 'on-first-retry',
	},
});
