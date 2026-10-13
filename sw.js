/**
 * Arcade UI Harness service worker: precache the whole app, then serve cache-first (instant + offline).
 * IMPORTANT: cache-first means returning visitors keep the cached build until CACHE changes.
 * Bump the version below on every deploy, in step with version.js (test/harness.test.mjs enforces they match).
 */
const CACHE = 'arcade-ui-harness-v0.0.2';
const PRECACHE = [
  './',
  'index.html',
  'js/harness.js',
  'version.js',
  'manifest.json',
  'css/anchor-core.css',
  'css/themes/arktrix.css',
  'css/themes/mob-swarm.css',
  'css/themes/halloween.css',
  'icons/icon-180.png',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'lib/anchor-loop.js',
  'lib/anchor-input.js',
  'lib/anchor-headless.js',
  'lib/anchor-audio.js',
  'lib/anchor-ui.js',
  'lib/anchor-leaderboard.js',
  'lib/anchor-save.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then((hit) => {
      if (hit) return hit;                                              // cache-first
      return fetch(req).then((res) => {
        if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
        return res;
      }).catch(() => (req.mode === 'navigate' ? caches.match('index.html') : Response.error()));
    })
  );
});
