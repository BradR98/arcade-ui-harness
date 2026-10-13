# Changelog

## Build 0.0.1
- Initial scaffold: game-free harness with mock backdrop, `#ui-overlay`, Anchor emoji controls and DOM HUD (`initAnchorHUD`, 6-digit Level / Score / High).
- CSS architecture: `css/anchor-core.css` (structure only; paint via `var(--arcade-*)` with fallbacks) and themes `akrynoid`, `mob-swarm`, `halloween`.
- Theme `<select>` swaps the theme `<link>` live (old sheet kept until the new one loads), choice remembered in `localStorage`.
- PWA: `manifest.json`, generated icons, cache-first `sw.js` (`arcade-ui-harness-v0.0.1`, matches `version.js`), GitHub Pages workflow.
- `lib/` copied from `anchor-core-lib`, which gained opt-in theme hooks in `anchor-ui.js`: `var(--arcade-*, <previous value>)` for HUD / control text colour, font and shadow, plus `.anchor-*` class names (no visual change when variables are unset).
- Tests: `test/harness.test.mjs` (19 checks).
