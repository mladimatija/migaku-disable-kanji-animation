/**
 * Migaku DOM contract. Everything the extension knows about Migaku's markup
 * lives here, so a Migaku redesign means touching this file (and the matching
 * selectors in styles.css) only.
 *
 * `.UiStrokeOrder` is the Vue component on the back of a kanji card. It mounts
 * fresh on every card flip, in "drawing" mode (SVG stroke-order animation).
 * Its "Aa" button toggles to "font" mode, which renders
 * `.UiStrokeOrder__character-view` - that element exists only in font mode.
 */
export const SELECTORS = {
	root: '.UiStrokeOrder',
	showCharacterButton: '.UiStrokeOrder__show-character',
	characterView: '.UiStrokeOrder__character-view',
} as const;

/**
 * Marker attribute set on a `.UiStrokeOrder` once we've switched it to font
 * mode. styles.css hides the drawing on any root WITHOUT this attribute, so
 * the drawing can never paint before we've acted. Keep in sync with styles.css.
 */
export const READY_ATTR = 'data-mdka-ready';

/** Set on <html> when the content script is running (used by the e2e tests). */
export const ACTIVE_ATTR = 'data-mdka-active';

/**
 * If a root can't be switched within this window (e.g. Migaku renamed the
 * button), mark it ready anyway so the CSS stops hiding the drawing - the
 * user gets Migaku's default behavior instead of an empty card.
 */
export const FAILSAFE_MS = 1000;
