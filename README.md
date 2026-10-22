# Disable Kanji Animation for Migaku

A tiny Chrome extension for [Migaku](https://study.migaku.com/) kanji cards: when a card flips, it opens in the **font preview** (the "Aa" view) instead of playing the stroke-order drawing animation. No flash of the drawing, no permissions, nothing leaves your browser.

> **Unofficial.** Not affiliated with, endorsed by, or supported by Migaku. "Migaku" is used only to describe what this extension works with; no Migaku logos or other assets are included.

## What it does

- Every time a kanji card is revealed, the extension presses Migaku's own **Aa** toggle for you, so the card shows the finished character in the font view.
- CSS hides the drawing until that switch has happened, so it never paints – not even for a frame.
- Press **Aa** yourself to see the stroke order as usual. The next card opens in the font preview again.
- If Migaku ever changes its markup and the toggle can't be found, the extension steps aside after one second and you get Migaku's default behaviour rather than a blank card.

## Use at your own risk

[Migaku's Terms of Service](https://migaku.com/terms) don't allow accessing the service through third-party, community-made or unofficial extensions, and Migaku says it won't provide support, data recovery or account remediation for problems caused by them. This is one of those unofficial extensions.

To keep the footprint as small as possible, it only clicks Migaku's own **Aa** button on the card you're looking at and hides the drawing until it has done so. It doesn't make network requests, read or change your reviews, automate studying, or touch your account. Even so, using it is your decision. If Migaku support asks, disable the extension first.

## Install (unpacked)

```bash
npm install
npm run build
```

Then open `chrome://extensions`, enable **Developer mode**, click **Load unpacked** and pick the `dist/` folder. After rebuilding, hit the reload icon on the extension card and refresh Migaku.

## How it works

| File                  | Role                                                                                                                                                           |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/styles.css`      | Injected by Chrome at `document_start`. Hides `.UiStrokeOrder`'s graph, guide cross, progress bar and buttons until the card carries `data-mdka-ready`.        |
| `src/font-preview.ts` | A `MutationObserver` sees each new `.UiStrokeOrder` in the tick it mounts, clicks `.UiStrokeOrder__show-character` (Vue re-renders before paint), marks ready. |
| `src/selectors.ts`    | Every Migaku class name the extension depends on. Start here if Migaku updates its UI.                                                                         |
| `src/content.ts`      | Entry point.                                                                                                                                                   |

Migaku mounts a fresh `.UiStrokeOrder` component on every flip, and `.UiStrokeOrder__character-view` only exists in font mode - those two facts are the whole contract.

## Development

| Command           | What it does                                                    |
| ----------------- | --------------------------------------------------------------- |
| `npm run dev`     | Vite + CRXJS dev build with HMR into `dist/`                    |
| `npm run build`   | Clean, render icons, type-check, production build               |
| `npm run check`   | ESLint + Prettier check + `tsc`                                 |
| `npm test`        | Build, then Playwright e2e against a fixture study page         |
| `npm run package` | Build and zip `dist/` into `migaku-disable-kanji-animation.zip` |

The e2e suite (`tests/`) loads the built extension into Chromium and serves `tests/fixtures/migaku-study.html` at `https://study.migaku.com/study`, a stand-in that mimics Migaku's stroke-order component (including Vue's async re-render). The flash test samples every animation frame during a flip and fails if the drawing would have been painted. Tests need a headed browser: on Linux run them under `xvfb-run`. Set `PWTEST_BROWSER=chrome` to use your installed Chrome, or `PWTEST_CHROMIUM_PATH` to point at another Chromium binary.

## Privacy

See [PRIVACY.md](PRIVACY.md). Short version: no permissions, no network requests, no storage.

## License

[MIT](LICENSE)
