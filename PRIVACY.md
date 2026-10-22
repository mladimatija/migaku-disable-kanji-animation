# Privacy

Disable Kanji Animation for Migaku:

- requests **no extension permissions** - it only declares a content script for `https://study.migaku.com/*`;
- makes **no network requests**;
- reads and stores **no data** - it doesn't use cookies, `localStorage`, `chrome.storage` or any other storage;
- only changes how Migaku's kanji cards are displayed, by pressing Migaku's own "Aa" toggle on each card.

Nothing about you or your reviews leaves your browser.
