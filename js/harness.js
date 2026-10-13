/**
 * harness.js - wires the real Anchor UI (emoji controls + DOM HUD) onto a mock game, and swaps theme stylesheets live.
 * There is no canvas and no game loop: a tiny ticker fakes score / level so the dirty-checked HUD has something to show.
 */
import { State } from '../lib/anchor-loop.js';
import { createControls, initAnchorHUD } from '../lib/anchor-ui.js';
import { BUILD_VERSION } from '../version.js';

/** name -> stylesheet. Keep in sync with <select> options and css/themes/ (test/harness.test.mjs checks all three). */
export const THEMES = { akrynoid: 'css/themes/akrynoid.css', 'mob-swarm': 'css/themes/mob-swarm.css', halloween: 'css/themes/halloween.css' };
const STORE_KEY = 'arcade-ui-harness.theme';

const overlay = document.getElementById('ui-overlay');
const select = document.getElementById('theme-select');
document.getElementById('build').textContent = 'harness v' + BUILD_VERSION;

/* ---- mock collaborators: the two shapes createControls() needs from AnchorLoop / audio ---- */
const loop = { state: State.PLAY, togglePause() { this.state = this.state === State.PAUSE ? State.PLAY : State.PAUSE; return true; } };
const audio = { enabled: false, toggle() { this.enabled = !this.enabled; }, suspend() {}, resume() {} };
createControls({ stage: overlay, loop, audio });
const updateHUD = initAnchorHUD({ stage: overlay, W: 360, H: 640, hudH: 40, padLeft: 12, padRight: 130 });   // emoji buttons sit top-right

/* ---- fake game state (paused with the Pause button, like a real game) ---- */
let level = 1, score = 0, high = 24000;
updateHUD({ level, score, high });
setInterval(() => {
  if (loop.state !== State.PLAY) return;
  score += 10; if (score % 500 === 0) level++; if (score > high) high = score;
  updateHUD({ level, score, high });
}, 400);

/* ---- theme switcher ---- */
let current = document.getElementById('theme-link'), seq = 0;
function applyTheme(name) {
  if (!THEMES[name]) return;
  select.value = name;
  try { localStorage.setItem(STORE_KEY, name); } catch (_) { /* private mode: not persisted */ }
  const my = ++seq, next = document.createElement('link');
  next.rel = 'stylesheet'; next.href = THEMES[name];
  // keep the old sheet until the new one has loaded (no unstyled flash); ignore out-of-order loads from rapid switching
  next.onload = () => { if (my !== seq) { next.remove(); return; } const prev = current; current = next; if (prev !== next) prev.remove(); };
  next.onerror = () => next.remove();
  current.after(next);
}
select.addEventListener('change', () => applyTheme(select.value));
let saved = null; try { saved = localStorage.getItem(STORE_KEY); } catch (_) { /* ignore */ }
applyTheme(THEMES[saved] ? saved : 'akrynoid');
