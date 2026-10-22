/**
 * Content script entry, injected on study.migaku.com at `document_start`.
 *
 * Two layers make kanji cards open in the font preview without a flash:
 *   1. styles.css (injected by Chrome before any page script runs) hides the
 *      stroke-order drawing on every card we haven't processed yet.
 *   2. startFontPreview() sees each new card in the same tick it mounts and
 *      presses Migaku's "Aa" toggle, then marks the card so the CSS lets go.
 */
import { startFontPreview } from './font-preview.ts';
import { ACTIVE_ATTR } from './selectors.ts';

startFontPreview();
document.documentElement.setAttribute(ACTIVE_ATTR, '');
