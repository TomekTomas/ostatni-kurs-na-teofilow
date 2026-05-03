const fs = require("fs");

const source = fs.readFileSync("src/main.js", "utf8");
const html = fs.readFileSync("index.html", "utf8");
const css = fs.readFileSync("src/styles.css", "utf8");
const failures = [];
const warnings = [];

function fail(message) {
  failures.push(message);
}

function warn(message) {
  warnings.push(message);
}

function expectSource(pattern, message) {
  if (!pattern.test(source)) fail(message);
}

function expectHtml(pattern, message) {
  if (!pattern.test(html)) fail(message);
}

function expectCss(pattern, message) {
  if (!pattern.test(css)) fail(message);
}

for (const match of source.matchAll(/this\.load\.image\("([^"]+)", "([^"]+)"\)/g)) {
  if (!fs.existsSync(match[2])) fail(`Missing image asset: ${match[1]} -> ${match[2]}`);
}

const backgrounds = [...source.match(/const BACKGROUNDS = \[([\s\S]*?)\];/)[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
for (const bg of backgrounds) {
  const file = `assets/backgrounds/bg-${bg}.png`;
  if (!fs.existsSync(file)) fail(`Missing route background: ${file}`);
}

const routeScale = Number(source.match(/const ROUTE_SCALE = ([0-9.]+);/)[1]);
const routeLength = Number(source.match(/const ROUTE_LENGTH = ([0-9.]+);/)[1]);
const stopBlock = source.match(/const STOPS = \[([\s\S]*?)\]\.map/)[1];
const stopKm = [...stopBlock.matchAll(/distance: ([0-9.]+)/g)].map((m) => Number(m[1]));
const stopDistances = stopKm.map((km) => Math.round(km * routeScale));
const stopNames = [...stopBlock.matchAll(/name: "([^"]+)"/g)].map((m) => m[1]);

if (stopDistances.length !== 34) fail(`Route 8 should have 34 stops, found ${stopDistances.length}`);
if (stopNames[0] !== "Cm. Zarzew" || stopNames[stopNames.length - 1] !== "Teofilow") {
  fail("Route 8 should run from Cm. Zarzew to Teofilow");
}
if (Math.abs(stopKm[stopKm.length - 1] - 16.7) > 0.01) {
  fail(`Route 8 length should be 16.7 km, found ${stopKm[stopKm.length - 1]} km`);
}

for (let i = 1; i < stopDistances.length; i++) {
  const gap = stopDistances[i] - stopDistances[i - 1];
  if (gap <= 0) fail(`Route stop order is not increasing at ${stopNames[i]}`);
  if (gap < 1000) warn(`Short stop gap ${gap} m before ${stopNames[i]}`);
}

if (stopDistances[stopDistances.length - 1] > routeLength) {
  fail("Last stop is beyond ROUTE_LENGTH");
}
if (routeLength - stopDistances[stopDistances.length - 1] > 5000) {
  warn("ROUTE_LENGTH leaves a long tail after the final stop");
}

for (const key of ["tram-konstal-open", "tram-pesa-open", "station-long", "station-board"]) {
  if (!source.includes(`"${key}"`)) warn(`Expected polished asset key not referenced: ${key}`);
}

for (const file of [
  "assets/branding/lcn-logo-menu.png",
  "assets/branding/lcn-billboard-generated.png",
  "assets/branding/lcn-billboard-1.png",
  "assets/branding/lcn-billboard-2.png",
  "assets/branding/lcn-billboard-3.png",
  "assets/fonts/lexend-deca-regular.woff2",
  "assets/fonts/lexend-deca-900.woff2",
  "assets/audio/README.md",
  "assets/audio/konstal_ride_loop.ogg",
  "assets/audio/pesa_ride_loop.ogg"
]) {
  if (!fs.existsSync(file)) fail(`Missing LCN branding asset: ${file}`);
}

expectSource(/smoothnessSamples\.push/, "Smoothness should be calculated from recent ride samples");
expectSource(/openTrams/, "Door opening should use dedicated open tram overlays");
expectSource(/tramNoseReach/, "Car obstacle collision should be measured against the tram nose");
expectSource(/displayMaxSpeed:\s*65[\s\S]*displayMaxSpeed:\s*70/, "Vehicle display speed caps should stay near real Lodz tram speeds");
expectSource(/roadBackLane[\s\S]*roadFrontLane/, "City traffic should have separated visual road lanes");
expectSource(/car\.parallax/, "Ambient traffic should move with a small world-relative parallax");
expectSource(/event\.detouring/, "Obstacle cars should have a dedicated detour state after the bell");
expectSource(/fitText\(/, "HUD text should be fitted to avoid overflowing panels");
expectSource(/PASSENGER_KEYS\[seed % PASSENGER_KEYS\.length\]/, "Onboard passengers should use sprite-based figures");
expectSource(/shortLabel\(/, "Long stop names should be shortened in compact HUD fields");
expectSource(/formatRouteDistance\(/, "HUD should convert internal route units back to real meters/kilometers");
expectSource(/door:\s*\{ xs: \[-520, -105, 448\], y: -106/, "Konstal door openings should use measured and lowered local door coordinates");
expectSource(/bus-articulated-side", 0\.82/, "Articulated bus scale should be comparable to tram scale");
expectSource(/localStopOffset/, "Waiting passengers should be anchored on the platform, not on the tram roof");
expectSource(/buildEndReport\(/, "End screen should show a detailed course report");
expectSource(/setDepth\(2200\)/, "End screen should render above route labels and station cards");
expectSource(/missionResults\(/, "Game should evaluate course mission goals");
expectSource(/playCue\(/, "Gameplay actions should trigger simple audio cues");
expectSource(/AudioContext/, "Audio cues should use browser WebAudio without external sound files");
expectSource(/this\.load\.audio\("ride-konstal"/, "Konstal ride loop should be preloaded");
expectSource(/this\.load\.audio\("ride-pesa"/, "Pesa ride loop should be preloaded");
expectSource(/updateRideLoop\(dt\)/, "Ride loop should be updated during gameplay");
expectSource(/setRate\(/, "Ride loop playback rate should react to speed");
expectSource(/makeCatenary\(/, "Route should include procedural tram catenary poles and wires");
expectSource(/updateCatenary\(/, "Catenary should scroll with the tram route");
expectSource(/contact = this\.add\.rectangle/, "Catenary should include a contact wire over the pantograph");
expectSource(/const poleX = 74/, "Catenary poles should sit close to the track, not far across the street");
expectSource(/const wireY = 414/, "Catenary contact wire should be lowered near the pantograph");
expectSource(/shelterKey === "station" \? 0\.48/, "Station shelters should stay scaled below tram height");
expectSource(/setScale\(0\.82, 0\.82\)/, "Stop name cards should be scaled down to match the shelter");
expectSource(/const GAME_MODES = \{/, "Game should expose configurable modes");
expectSource(/makeModeButton\(/, "Menu should allow choosing a game mode");
expectSource(/addResultBars\(/, "Results screen should show visual rating bars");
expectSource(/allowGameOver/, "Training mode should be able to soften game-over conditions");
expectSource(/night:\s*\{[\s\S]*speedAllowance:\s*1\.22[\s\S]*night:\s*true/, "Night mode should allow faster running and enable night visuals");
expectSource(/rush:\s*\{[\s\S]*traffic:\s*1\.65/, "Rush-hour mode should meaningfully increase city traffic");
expectSource(/this\.mode\.speedAllowance/, "Safe speed calculations should use the selected mode allowance");
expectSource(/createNightLayer\(/, "Night mode should render a dark sky and stars layer");
expectSource(/makeStreetLights\(/, "Night mode should include lit street lamps along the route");
expectSource(/applyBackgroundLighting\(/, "Night mode should tint bright route backgrounds, not only overlay them");
expectSource(/nightHorizonOverlay/, "Night mode should darken the bright cloud horizon separately");
expectSource(/trackMin:\s*0\.48[\s\S]*trackMax:\s*0\.98/, "Night mode should have better track condition for faster running");
expectSource(/passengerDemand:\s*0\.58/, "Night mode should have lighter passenger demand");
expectSource(/dwellScale:\s*0\.72/, "Night mode should shorten stop dwell time");
expectSource(/this\.mode\.passengerDemand/, "Passenger boarding and crowds should react to selected mode");
expectSource(/nextRelevantSwitch\(/, "HUD should expose the next relevant switch decision");
expectSource(/modeBadgeText/, "HUD should display the active mode and its gameplay modifiers");
expectSource(/scheduleDuration/, "Game should track a route timetable, not only remaining time");
expectSource(/scheduleDeltaForStop\(/, "Stops should be evaluated against the timetable");
expectSource(/applyScheduleResult\(/, "Punctuality should affect scoring and passenger comfort");
expectSource(/scheduleText/, "HUD should show timetable delta and punctuality");
expectSource(/Punktualnosc minimum 70%/, "Mission results should include a punctuality goal");
expectSource(/modeBadgeBg = this\.add\.rectangle\(16, 210, 410, 62/, "Mode HUD panel should sit under the left HUD instead of covering the playfield center");
expectSource(/this\.scheduleText = this\.add\.text\(WIDTH - 382, 66/, "Top-right HUD should reserve a separate schedule row");
expectSource(/panel\.slideDistance/, "Door animation should slide door leaves, not just fade a block");
expectSource(/leftLeaf[\s\S]*rightLeaf/, "Door panels should be built from two sliding leaves");
expectSource(/makeLodzDetails\(/, "Route should include local Lodz detail props and easter eggs");
expectSource(/animatePassengerExchange\(/, "Opening doors should animate passengers boarding from the platform");
expectSource(/pendingBoardingVisual/, "Onboard passengers should appear in windows during boarding");
expectSource(/this\.add\.image\(70, 488, "panel-dark"\)/, "Menu mode panel should be contained on the start screen");
expectSource(/key: "lodz-detail-lcn"/, "Lodz details should include LCN easter egg signage");
expectSource(/lodz-detail-lcn/, "Generated Lodz detail images should replace simple procedural billboards");
expectSource(/assets\/generated\/lodz-detail-works-alpha\.png/, "Roadworks easter egg should use a transparent generated bitmap asset");
expectSource(/landmark-znicze/, "Route should include a generated cemetery candle kiosk landmark");
expectSource(/landmark-znicze", distance: Math\.round\(0\.02 \* ROUTE_SCALE\)/, "Cemetery candle kiosk should appear at the starting cemetery, not later in Widzew");
expectSource(/landmark-drzewo/, "Route should include the Widzew Wschod Drzewo sculpture landmark");
expectSource(/landmark-smolarek-mural/, "Route should include a generated Widzew football mural landmark");
expectSource(/landmark-witcher-mural/, "Route should include a generated Centrum tower mural landmark");
expectSource(/createTouchControls\(/, "Mobile version should expose on-screen touch controls");
expectSource(/touchState\.accelerate/, "Touch controls should drive acceleration");
expectSource(/touchState\.brake/, "Touch controls should drive braking");
expectSource(/makeTouchThrottleSlider\(/, "Mobile controls should include a throttle slider, not only tap buttons");
expectSource(/touchState\.throttle/, "Touch throttle slider should drive the tram controller");
expectSource(/updateTouchThrottleSlider\(/, "Touch throttle slider should visually track the current controller value");
expectSource(/useActionButton\(/, "Door and bell action should be shared by keyboard and touch controls");
expectSource(/createTutorialOverlay\(/, "Game should include an in-game tutorial overlay");
expectSource(/updateTutorial\(/, "Tutorial prompts should be triggered by route context");
expectSource(/showTutorial\(/, "Tutorial prompts should be one-shot and non-spammy");
expectSource(/writeRunHistory\(/, "End screen should persist a recent run history");
expectSource(/addHistoryPanel\(/, "End screen should render recent runs for replay motivation");
expectSource(/BASE_WIDTH/, "Game should keep a base 16:9 width for desktop layouts");
expectSource(/visualViewport/, "Mobile landscape should expand the logical game width to match wide phone screens");
expectSource(/orientationchange/, "Mobile orientation changes should rebuild the Phaser canvas with the correct aspect ratio");
expectHtml(/user-scalable=no/, "Mobile viewport should prevent accidental zoom during play");
expectCss(/touch-action:\s*none/, "Mobile CSS should prevent browser gestures from stealing gameplay input");
expectCss(/100dvw/, "Game container should fill the dynamic mobile viewport width");
expectCss(/100dvh/, "Game container should fill the dynamic mobile viewport height");

if (/this\.smoothness\s*-=/g.test(source)) {
  fail("Smoothness must not be permanently decremented; use addRidePenalty/updateRideComfort");
}

if (failures.length) {
  console.error(["GAME AUDIT FAILED", ...failures, ...warnings.map((w) => `WARN: ${w}`)].join("\n"));
  process.exit(1);
}

console.log(["GAME AUDIT OK", ...warnings.map((w) => `WARN: ${w}`)].join("\n"));
