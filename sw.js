const CACHE_NAME = "ostatni-kurs-v1";
const CORE_URLS = [
  "./",
  "./index.html",
  "./landing.html",
  "./landing.css",
  "./game.html",
  "./manifest.json",
  "./src/main.js",
  "./src/styles.css",
  "./src/config/constants.js",
  "./src/config/districts.js",
  "./src/config/modes.js",
  "./src/config/route.js",
  "./src/config/ui.js",
  "./src/config/vehicles.js",
  "./src/scenes/BootScene.js",
  "./src/scenes/MenuScene.js",
  "./src/scenes/GameScene.js"
];

const ASSET_URLS = [
  "./assets/audio/README.md",
  "./assets/audio/konstal_ride_loop.ogg",
  "./assets/audio/pesa_ride_loop.ogg",
  "./assets/audio/taniec-eleny.ogg",
  "./assets/backgrounds/bg-centrum.png",
  "./assets/backgrounds/bg-kaliska.png",
  "./assets/backgrounds/bg-piotrkowska.png",
  "./assets/backgrounds/bg-rokicinska.png",
  "./assets/backgrounds/bg-teofilow.png",
  "./assets/backgrounds/bg-widzew-wschod.png",
  "./assets/backgrounds/bg-widzew.png",
  "./assets/backgrounds/bg-wima.png",
  "./assets/backgrounds/bg-wlokniarzy.png",
  "./assets/backgrounds/bg-zarzew-bloki.png",
  "./assets/backgrounds/bg-zarzew.png",
  "./assets/branding/lcn-billboard-1.png",
  "./assets/branding/lcn-billboard-2.png",
  "./assets/branding/lcn-billboard-3.png",
  "./assets/branding/lcn-billboard-generated.png",
  "./assets/branding/lcn-logo-menu-white.png",
  "./assets/branding/lcn-logo-menu.png",
  "./assets/branding/lcn-logo-pixel-dark.png",
  "./assets/branding/lcn-logo-pixel.png",
  "./assets/branding/lcn_logo-tlo_biale.png",
  "./assets/branding/lcn_logo-tlo_gradient.png",
  "./assets/fonts/lexend-deca-900.woff2",
  "./assets/fonts/lexend-deca-regular.woff2",
  "./assets/generated/landmark-drzewo.png",
  "./assets/generated/landmark-smolarek-mural.png",
  "./assets/generated/landmark-unicorn-statue.png",
  "./assets/generated/landmark-witcher-mural.png",
  "./assets/generated/landmark-znicze.png",
  "./assets/generated/lodz-detail-cafe.png",
  "./assets/generated/lodz-detail-lcn.png",
  "./assets/generated/lodz-detail-mural.png",
  "./assets/generated/lodz-detail-works-alpha.png",
  "./assets/generated/lodz-detail-works.png",
  "./assets/generated/lodz-easter-details-sheet.png",
  "./assets/generated/lodz-pixel-sprite-sheet.png",
  "./assets/generated/lodz-route-background-sheet-v2.png",
  "./assets/generated/lodz-route-background-sheet.png",
  "./assets/generated/lodz-route-landmarks-sheet-magenta.png",
  "./assets/generated/lodz-route-landmarks-sheet.png",
  "./assets/generated/stajnia-jednorozcow-stop.png",
  "./assets/generated/station-shelter-sheet-v2.png",
  "./assets/generated/traffic-sprite-sheet-v2.png",
  "./assets/generated/tram-side-sprite-sheet.png",
  "./assets/generated/widzew-fans-bg.png",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/sprites-ai/arrow-left.png",
  "./assets/sprites-ai/arrow-right.png",
  "./assets/sprites-ai/car-green.png",
  "./assets/sprites-ai/car.png",
  "./assets/sprites-ai/manufaktura.png",
  "./assets/sprites-ai/passenger-2.png",
  "./assets/sprites-ai/passenger-3.png",
  "./assets/sprites-ai/passenger.png",
  "./assets/sprites-ai/plac.png",
  "./assets/sprites-ai/pothole.png",
  "./assets/sprites-ai/powerline.png",
  "./assets/sprites-ai/road-tile.png",
  "./assets/sprites-ai/sidewalk.png",
  "./assets/sprites-ai/track-crossing.png",
  "./assets/sprites-ai/track-road.png",
  "./assets/sprites-ai/track.png",
  "./assets/sprites-ai/tram-konstal.png",
  "./assets/sprites-ai/tram-pesa.png",
  "./assets/sprites-ai/unicorn.png",
  "./assets/sprites/bus-articulated-side.png",
  "./assets/sprites/bus-side.png",
  "./assets/sprites/car-side-cyan.png",
  "./assets/sprites/car-side-green.png",
  "./assets/sprites/car-side-orange.png",
  "./assets/sprites/car.png",
  "./assets/sprites/cyclist-side.png",
  "./assets/sprites/maintenance-van-side.png",
  "./assets/sprites/manufaktura.png",
  "./assets/sprites/passenger-a.png",
  "./assets/sprites/passenger-b.png",
  "./assets/sprites/passenger-c.png",
  "./assets/sprites/passenger-d.png",
  "./assets/sprites/passenger-e.png",
  "./assets/sprites/passenger.png",
  "./assets/sprites/pedestrian-side-a.png",
  "./assets/sprites/pedestrian-side-b.png",
  "./assets/sprites/pedestrian-side-c.png",
  "./assets/sprites/plac.png",
  "./assets/sprites/pothole.png",
  "./assets/sprites/powerline.png",
  "./assets/sprites/prop-bin.png",
  "./assets/sprites/prop-bollard.png",
  "./assets/sprites/prop-lamp.png",
  "./assets/sprites/prop-pole.png",
  "./assets/sprites/prop-tree.png",
  "./assets/sprites/roadworks-truck-side.png",
  "./assets/sprites/station-pole-bench.png",
  "./assets/sprites/station-shelter-board.png",
  "./assets/sprites/station-shelter-long.png",
  "./assets/sprites/station-shelter-modern.png",
  "./assets/sprites/track.png",
  "./assets/sprites/tram-konstal.png",
  "./assets/sprites/tram-pesa.png",
  "./assets/sprites/unicorn.png",
  "./assets/sprites/van-side-white.png",
  "./assets/trams/tram-konstal-open.png",
  "./assets/trams/tram-konstal.png",
  "./assets/trams/tram-pesa-open.png",
  "./assets/trams/tram-pesa.png",
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
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll([...CORE_URLS, ...ASSET_URLS]))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type === "opaque") return response;
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      });
    })
  );
});
