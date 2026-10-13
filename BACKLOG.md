# Backlog

- [ ] Audit mobile viewport scaling for UI elements.

## Found while scaffolding (Build 0.0.1)
- [ ] The emoji Pause button (about 10-44px from the top) extends a few px below the 40px `HUD_H` line; check on a real phone and tighten the controls' offset / padding in `anchor-ui.js`.
- [ ] Emoji glyphs ignore `color`, so themes cannot tint the controls (only the glow). Decide whether to move to themable SVG / pixel icons.
- [ ] `lib/` is copied by hand; decide how this repo should stay in step with `anchor-core-lib` (marker + sync, or a CI check).
- [ ] Verify live `<select>` switching and offline mode on a phone (checked so far: each theme renders in headless Chromium at 360x640).
- [ ] Create the GitHub repo, push, and enable Pages (Source: GitHub Actions).
