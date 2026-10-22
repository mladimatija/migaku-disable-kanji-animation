// E2E behaviour tests against the fixture study page (see tests/fixtures/).

import { test, expect, type Page } from '../fixtures/extension.ts';

declare global {
	interface Window {
		__mdkaFrames?: string[];
	}
}

const ROOT = '.UiStrokeOrder';
const FONT_VIEW = '.UiStrokeOrder__character-view';
const GRAPH = '.UiStrokeOrder__graph';
const TOGGLE = '.UiStrokeOrder__show-character';

/**
 * Record what each animation frame would paint, from now until `stop()`.
 * rAF callbacks run right before paint, so if the drawing is visible in any
 * sample, the user would have seen it flash.
 */
async function startFrameSampler(page: Page): Promise<void> {
	await page.evaluate(
		({ root, fontView, graph }) => {
			const frames: string[] = (window.__mdkaFrames = []);
			const tick = (): void => {
				const r = document.querySelector(root);
				if (!r) frames.push('no-card');
				else {
					const g = r.querySelector(graph);
					const drawingVisible = !!g && getComputedStyle(g).visibility === 'visible';
					frames.push(r.querySelector(fontView) ? 'font' : drawingVisible ? 'DRAWING' : 'hidden');
				}
				if (frames.length < 60) requestAnimationFrame(tick);
			};
			requestAnimationFrame(tick);
		},
		{ root: ROOT, fontView: FONT_VIEW, graph: GRAPH },
	);
}

async function readFrames(page: Page): Promise<string[]> {
	await page.waitForFunction(() => (window.__mdkaFrames?.length ?? 0) >= 60);
	return page.evaluate(() => window.__mdkaFrames ?? []);
}

test('revealed card opens in font preview', async ({ openStudy }) => {
	const page = await openStudy();
	await page.keyboard.press('Space');
	await expect(page.locator(FONT_VIEW)).toBeVisible();
	await expect(page.locator(GRAPH)).toBeHidden();
	await expect(page.locator(ROOT)).toHaveAttribute('data-mdka-ready', '');
});

test('the drawing never paints while the card flips', async ({ openStudy }) => {
	const page = await openStudy();
	await startFrameSampler(page);
	await page.keyboard.press('Space');
	const frames = await readFrames(page);
	expect(frames).toContain('font');
	expect(frames).not.toContain('DRAWING');
});

test('pressing Aa still shows the stroke order', async ({ openStudy }) => {
	const page = await openStudy();
	await page.keyboard.press('Space');
	await expect(page.locator(FONT_VIEW)).toBeVisible();

	await page.locator(TOGGLE).click();
	await expect(page.locator(FONT_VIEW)).toHaveCount(0);
	await expect(page.locator(GRAPH)).toBeVisible();
	// ...and the extension doesn't flip it back.
	await page.waitForTimeout(300);
	await expect(page.locator(GRAPH)).toBeVisible();
});

test('every new card opens in font preview again', async ({ openStudy }) => {
	const page = await openStudy();
	for (const kanji of ['其', '角', '八']) {
		await expect(page.locator('.front')).toHaveText(kanji);
		await page.keyboard.press('Space');
		await expect(page.locator(FONT_VIEW)).toHaveText(kanji);
		// Leave the previous card in drawing mode to prove state doesn't leak.
		await page.locator(TOGGLE).click();
		await expect(page.locator(GRAPH)).toBeVisible();
		await page.locator('#next').click();
	}
});

test('a card already in font mode is left alone', async ({ openStudy }) => {
	const page = await openStudy('?startFont=1');
	await page.keyboard.press('Space');
	await page.waitForTimeout(200);
	await expect(page.locator(FONT_VIEW)).toBeVisible();
	await expect(page.locator(ROOT)).toHaveAttribute('data-mdka-ready', '');
});

test('falls back to the drawing if the Aa button is missing', async ({ openStudy }) => {
	const page = await openStudy('?noToggle=1');
	await page.keyboard.press('Space');
	await expect(page.locator(GRAPH)).toBeHidden();
	// After the failsafe window the CSS releases the drawing instead of leaving a blank card.
	await expect(page.locator(GRAPH)).toBeVisible({ timeout: 3000 });
});
