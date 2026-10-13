# Project Status

**Phase 1: Harness Scaffolded and Theme Switcher Active**

- **Build:** 0.0.2 (`version.js`; `sw.js` cache `arcade-ui-harness-v0.0.2`)
- **Branch:** `main`, pushed to github.com/BradR98/arcade-ui-harness (public). Pages source: GitHub Actions -> https://bradr98.github.io/arcade-ui-harness/
- **Works:** mock game background + `#ui-overlay`; Anchor HUD (Level / Score / High) and emoji controls; three themes switchable live; PWA files; Pages workflow; `npm test` 19 pass / 0 fail.
- **Verified in a browser:** each theme renders correctly in headless Chromium at 360x640 (HUD fits in the 40px band). Not yet verified: on a real phone, offline mode, live switching by hand.
- **Known issues:** see `BACKLOG.md` (Pause button slightly past the HUD line; emoji can't be tinted; `lib/` synced by hand).
- **Anchor sync:** has `.arcade-game`, so `sync-anchor.sh` keeps `lib/` identical to `anchor-core-lib`. The legacy `mob-swarm` monolith has no marker and is excluded.
- **Next:** mobile viewport audit.
