# Changelog

All notable changes to this project are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses [Semantic Versioning](https://semver.org/).

## [1.0.0] - 22.10.2206

### Added

- Kanji cards open in Migaku's font preview instead of the stroke-order drawing animation.
- CSS guard that keeps the drawing hidden until the card has switched, so it never flashes on flip.
- One-second failsafe that restores Migaku's default UI if the "Aa" toggle can't be found.
- Playwright e2e suite with a frame-by-frame flash test.
