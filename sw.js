const CACHE_VERSION = "v10";
const SHELL_CACHE = `kurs8-shell-${CACHE_VERSION}`;
const RUNTIME_CACHE = `kurs8-runtime-${CACHE_VERSION}`;
const PHASER_URL = "https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.min.js";

const SHELL_URLS = [
  "./",
  "./index.html",
  "./landing.html",
  "./landing.css",
  "./game.html",
  "./manifest.json",
  "./runtime-config.js",
  "./src/main.js",
  "./src/styles.css",
  "./src/config/assets.js",
  "./src/config/constants.js",
  "./src/config/districts.js",
  "./src/config/modes.js",
  "./src/config/route.js",
  "./src/config/ui.js",
  "./src/config/vehicles.js",
  "./src/logic/achievements.js",
  "./src/logic/dailyChallenge.js",
  "./src/logic/missions.js",
  "./src/logic/random.js",
  "./src/logic/runSummary.js",
  "./src/logic/scoring.js",
  "./src/scenes/BootScene.js",
  "./src/scenes/MenuScene.js",
  "./src/scenes/PreloadGameScene.js",
  "./src/scenes/GameScene.js",
  "./src/services/leaderboard.js",
  "./src/services/offlineQueue.js",
  "./src/services/profile.js",
  "./src/services/settings.js",
  "./src/services/storage.js",
  "./assets/fonts/lexend-deca-regular.woff2",
  "./assets/fonts/lexend-deca-900.woff2",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/sprites/track.png",
  "./assets/sprites/plac.png",
  "./assets/trams/tram-konstal.png",
  "./assets/trams/tram-pesa.png",
  "./assets/backgrounds/bg-piotrkowska.png",
  "./assets/branding/lcn-logo-menu.png",
  "./assets/branding/landing-tram.webp",
  "./assets/ui/button-danger.png",
  "./assets/ui/button-primary.png",
  "./assets/ui/button-secondary.png",
  "./assets/ui/button-selected.png",
  "./assets/ui/button-small.png",
  "./assets/ui/logo-plaque.png",
  "./assets/ui/mini-map-panel.png",
  "./assets/ui/panel-dark.png",
  "./assets/ui/panel-hud.png",
  "./assets/ui/pause-panel.png",
  "./assets/ui/route-pin.png",
  "./assets/ui/stop-card.png",
  "./assets/ui/title-plaque.png",
  "./assets/ui/warning-icon.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys
        .filter((key) => ![SHELL_CACHE, RUNTIME_CACHE].includes(key))
        .map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.hostname.endsWith("supabase.co")) return;

  if (url.href === PHASER_URL) {
    event.respondWith(cacheFirst(event.request, RUNTIME_CACHE, true));
    return;
  }

  if (url.origin !== self.location.origin) return;
  if (event.request.mode === "navigate") {
    event.respondWith(networkFirst(event.request, SHELL_CACHE, "./game.html"));
    return;
  }
  if (/\.(?:png|webp|ogg|woff2)$/.test(url.pathname)) {
    event.respondWith(cacheFirst(event.request, RUNTIME_CACHE));
    return;
  }
  if (/\.(?:js|css|json)$/.test(url.pathname)) {
    event.respondWith(networkFirst(event.request, SHELL_CACHE));
  }
});

async function cacheFirst(request, cacheName, allowOpaque = false) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response && (response.ok || (allowOpaque && response.type === "opaque"))) {
    const cache = await caches.open(cacheName);
    await cache.put(request, response.clone());
  }
  return response;
}

async function networkFirst(request, cacheName, fallbackUrl = null) {
  try {
    const response = await fetch(request);
    if (response?.ok) {
      const cache = await caches.open(cacheName);
      await cache.put(request, response.clone());
    }
    return response;
  } catch (_) {
    return (await caches.match(request)) || (fallbackUrl ? caches.match(fallbackUrl) : Response.error());
  }
}
