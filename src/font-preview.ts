import { FAILSAFE_MS, READY_ATTR, SELECTORS } from './selectors.ts';

/** Roots we've already armed a failsafe timer for. */
const armed = new WeakSet<Element>();

function markReady(root: Element): void {
	root.setAttribute(READY_ATTR, '');
}

/**
 * Switch one `.UiStrokeOrder` to font mode, once.
 *
 * Clicking Migaku's own "Aa" button (rather than faking the font view) keeps
 * Vue's state consistent, so pressing "Aa" afterwards still shows the stroke
 * order. Vue re-renders in a microtask, i.e. before the next paint; combined
 * with the CSS hide in styles.css, the drawing never reaches the screen.
 *
 * Returns true when the root is done (switched, or already in font mode).
 */
export function switchToFontPreview(root: Element): boolean {
	if (root.hasAttribute(READY_ATTR)) return true;

	if (!root.querySelector(SELECTORS.characterView)) {
		const toggle = root.querySelector<HTMLElement>(SELECTORS.showCharacterButton);
		if (!toggle) {
			// Button isn't rendered yet - the CSS keeps the drawing hidden while we
			// wait for the next mutation. Bail out to the default UI if it never shows.
			if (!armed.has(root)) {
				armed.add(root);
				window.setTimeout(() => markReady(root), FAILSAFE_MS);
			}
			return false;
		}
		toggle.click();
	}

	markReady(root);
	return true;
}

/**
 * Watch the whole document for kanji cards and switch each one as it mounts.
 * Observes `documentElement` because the script runs at `document_start`,
 * before `<body>` exists.
 */
export function startFontPreview(doc: Document = document): MutationObserver {
	const run = (): void => {
		doc.querySelectorAll(SELECTORS.root).forEach(switchToFontPreview);
	};
	const observer = new MutationObserver(run);
	observer.observe(doc.documentElement, { childList: true, subtree: true });
	run();
	return observer;
}
