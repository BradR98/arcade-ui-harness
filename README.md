# Arcade UI Harness

Part of Brad's 80's Arcade. A **game-free** page (no `<canvas>`) for testing the shared Anchor UI (emoji Sound / Pause controls and the DOM HUD) and CSS-variable theming. A mock backdrop stands in for the game, `#ui-overlay` sits on top, and a `<select>` in the middle swaps the theme stylesheet live. A small ticker fakes Level / Score / High so the HUD updates (Pause stops it).

Live (once Pages is enabled): `https://bradr98.github.io/arcade-ui-harness/`

## Run locally
```
npm run serve        # python3 -m http.server 8080, then open http://localhost:8080
npm test             # PWA wiring, version single-source, theme contract, structure-vs-paint, HUD hooks
```

## Layout
| Path | Role |
|---|---|
| `index.html` | `#stage` > `#mock-game` + `#ui-overlay` (theme `<select>`, HUD and controls mount here) |
| `js/harness.js` | mock `loop` / `audio`, `createControls`, `initAnchorHUD`, theme switcher (remembers the choice in `localStorage`) |
| `css/anchor-core.css` | **Structure only** (position / flex / pointer-events / sizing). All paint is `var(--arcade-*, fallback)` |
| `css/themes/*.css` | **Paint**: each defines the `:root` variables below (`akrynoid`, `mob-swarm`, `halloween`) |
| `lib/` | Copy of `anchor-core-lib` (see "Anchor lib" below) |

## Theme variables
All optional; the fallback is the default Anchor look. `lib/anchor-ui.js` reads the first five directly (inline `var()` with the same fallbacks), so a game with no theme CSS looks exactly as before.

| Variable | Used for | Fallback |
|---|---|---|
| `--arcade-text-color` | HUD text, emoji control colour | `#fff` |
| `--arcade-font` | HUD / UI font stack | `"Courier New", monospace` |
| `--arcade-glow` | `text-shadow` (HUD fallback `1px 1px 0 #000`; controls fallback `none`) | see left |
| `--arcade-label-color` | HUD `LEVEL` label | `#9aa5ff` |
| `--arcade-accent-color` | HUD `SCORE` / `HI` labels | `#ff3b3b` |
| `--arcade-bg`, `--arcade-bg-2` | harness backdrop gradient (top, bottom) | `#05060f`, `#0b0f26` |
| `--arcade-line` | harness HUD-boundary line (the 40/640 `HUD_H`) | `#1d2350` |

Hooks for game CSS: `.anchor-hud`, `.anchor-hud-cell`, `.anchor-hud-label`, `.anchor-hud-value`, `.anchor-controls`, `.anchor-btn`.
Note: emoji glyphs (🔊 ⏸️) ignore `color`; the theme tints their `text-shadow` only.

### Add a theme
1. Create `css/themes/<name>.css` defining every variable above on `:root`.
2. Add it to `THEMES` in `js/harness.js`, add an `<option>` in `index.html`, and add the path to `PRECACHE` in `sw.js`.
3. `npm test` checks all of the above agree.

## Anchor lib
`lib/` mirrors `anchor-core-lib` (workspace source of truth). This repo has an `.arcade-game` marker, so the workspace `sync-anchor.sh` keeps it identical and commits the update. Do not edit `lib/` here; patch `anchor-core-lib` and run the sync.

## Standing instructions: PWA
- Cache-first `sw.js` precaches everything. **Bump the version on every deploy**: `CACHE` in `sw.js` and `BUILD_VERSION` in `version.js` must match (tested). Add any new file to `PRECACHE` (tested).
- `manifest.json` + icons (`node tools/make-icons.mjs` regenerates `icons/`).

## Standing instructions: GitHub Pages
- `.github/workflows/pages.yml` runs `npm test` then deploys on every push to `main`.
- Pages is enabled with source **GitHub Actions** (one-time: Settings > Pages, or `gh api -X POST repos/BradR98/arcade-ui-harness/pages -f build_type=workflow`). All paths are relative, so it works under `/arcade-ui-harness/`.
- Before every commit: update `README.md`, `BACKLOG.md`, `CHANGELOG.md`, `PROJECT_STATUS.md` (Arcade Standing Order 2).
