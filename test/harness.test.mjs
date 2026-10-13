// Harness checks: PWA wiring, version single-source, theme contract, structure-vs-paint split, HUD + control theming hooks.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { initAnchorHUD, createControls } from '../lib/anchor-ui.js';
import { State } from '../lib/anchor-loop.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (f) => readFileSync(join(root, f), 'utf8');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('PASS ' + m); } else { fail++; console.log('FAIL ' + m); } };

// --- PWA ---
const m = JSON.parse(read('manifest.json'));
ok(m.name && m.short_name && m.start_url && m.display && m.icons.length >= 2, 'manifest has name, short_name, start_url, display, icons');
ok(m.icons.every((i) => existsSync(join(root, i.src))), 'every manifest icon exists');
ok(existsSync(join(root, 'icons/icon-180.png')), 'apple-touch icon exists');
const sw = read('sw.js'), ver = /BUILD_VERSION = '([^']+)'/.exec(read('version.js'))[1];
ok(sw.includes("const CACHE = 'arcade-ui-harness-v" + ver + "'"), 'sw.js cache version matches version.js (' + ver + ')');
const pre = [...sw.matchAll(/^\s+'([^']+)',?$/gm)].map((x) => x[1]).filter((p) => p !== './');
ok(pre.every((p) => existsSync(join(root, p))), 'every precached path exists on disk');
const listed = (dir, ext) => readdirSync(join(root, dir)).filter((f) => f.endsWith(ext)).map((f) => dir + '/' + f);
const missing = [...listed('lib', '.js'), ...listed('css', '.css'), ...listed('css/themes', '.css')].filter((f) => !pre.includes(f));
ok(missing.length === 0, 'sw precaches every file in lib/, css/, css/themes/' + (missing.length ? ' (missing: ' + missing + ')' : ''));
ok(/cache-first/i.test(sw) && /skipWaiting/.test(sw) && /clients\.claim/.test(sw), 'sw is cache-first with skipWaiting / claim');
ok(existsSync(join(root, '.github/workflows/pages.yml')) && /deploy-pages/.test(read('.github/workflows/pages.yml')), 'GitHub Pages workflow present');
const html = read('index.html');
ok(!/<canvas/i.test(html), 'index.html has no <canvas>');
ok(/id="ui-overlay"/.test(html) && /id="theme-select"/.test(html) && /rel="manifest"/.test(html), 'index.html has #ui-overlay, theme <select>, manifest link');

// --- themes ---
const REQUIRED = ['--arcade-text-color', '--arcade-font', '--arcade-glow', '--arcade-label-color', '--arcade-accent-color', '--arcade-bg', '--arcade-bg-2', '--arcade-line'];
const themeFiles = readdirSync(join(root, 'css/themes')).filter((f) => f.endsWith('.css')).map((f) => f.replace('.css', '')).sort();
ok(themeFiles.join() === 'arktrix,halloween,mob-swarm', 'themes: arktrix, halloween, mob-swarm');
for (const t of themeFiles) {
  const css = read('css/themes/' + t + '.css');
  ok(/:root\s*\{/.test(css) && REQUIRED.every((v) => new RegExp(v + '\\s*:').test(css)), t + ' defines every required :root variable');
}
const js = read('js/harness.js');
ok(themeFiles.every((t) => js.includes("'css/themes/" + t + ".css'") && html.includes('value="' + t + '"')), 'harness.js THEMES + <select> options match theme files');

// --- structure vs paint ---
const core = read('css/anchor-core.css').replace(/\/\*[\s\S]*?\*\//g, '');
const paintProps = [...core.matchAll(/(?:^|[;{\s])((?:background(?:-color)?|color|font-family|text-shadow|border(?:-top)?)\s*:[^;}]*)/gm)].map((x) => x[1]);
const bad = paintProps.filter((d) => !/var\(--arcade-/.test(d) && !/^(border(?:-top)?)\s*:\s*none/.test(d) && !/inherit|transparent|CanvasText|Canvas|text-shadow:\s*none/.test(d));
ok(bad.length === 0, 'anchor-core.css: every paint property goes through var(--arcade-*)' + (bad.length ? ' (offenders: ' + bad.join(' | ') + ')' : ''));

// --- HUD + controls theming hooks (fake DOM) ---
const mk = () => ({ style: {}, className: '', children: [], _h: '', setAttribute() {}, addEventListener() {}, appendChild(c) { this.children.push(c); }, set innerHTML(v) { this._h = v; }, get innerHTML() { return this._h; } });
const doc = { createElement: mk };
const stage = mk();
const hud = initAnchorHUD({ stage, document: doc });
hud({ level: 2, score: 300, high: 500 });
ok(hud.root.className === 'anchor-hud' && /var\(--arcade-text-color/.test(hud.root.style.color) && /var\(--arcade-font/.test(hud.root.style.fontFamily) && /var\(--arcade-glow/.test(hud.root.style.textShadow), 'HUD root reads text colour / font / glow from theme variables');
ok(/var\(--arcade-label-color/.test(hud.root.innerHTML) && /var\(--arcade-accent-color/.test(hud.root.innerHTML) && /000300/.test(hud.root.innerHTML) && /000500/.test(hud.root.innerHTML), 'HUD labels use theme variables; values render');
const ctl = createControls({ stage, loop: { state: State.PLAY, togglePause: () => true }, audio: { enabled: false, toggle() {}, suspend() {}, resume() {} }, document: doc });
ok(/var\(--arcade-text-color/.test(ctl.sound.style.color) && ctl.sound.className === 'anchor-btn', 'emoji control buttons read colour from --arcade-text-color');

console.log('\n' + pass + ' PASS, ' + fail + ' FAIL'); process.exit(fail ? 1 : 0);
