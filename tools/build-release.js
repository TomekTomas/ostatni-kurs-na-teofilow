const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const output = path.join(root, "_site");
if (process.env.REQUIRE_AUDIO_LICENSE_CONFIRMATION === "true" && process.env.AUDIO_LICENSES_CONFIRMED !== "true") {
  throw new Error("Release blocked: confirm ride-loop audio rights with AUDIO_LICENSES_CONFIRMED=true");
}
const rootFiles = [
  "index.html", "landing.html", "landing.css", "game.html", "manifest.json", "sw.js", "runtime-config.js"
];
const assetGroups = {
  "assets/fonts": null,
  "assets/icons": null,
  "assets/ui": null,
  "assets/backgrounds": null,
  "assets/trams": null,
  "assets/sprites": null,
  "assets/audio": ["konstal_ride_loop.ogg", "pesa_ride_loop.ogg"],
  "assets/sprites-ai": ["arrow-left.png", "arrow-right.png", "car.png", "car-green.png"],
  "assets/branding": ["lcn-logo-menu.png", "landing-tram.webp", "lcn-billboard-generated.png", "lcn-billboard-1.png", "lcn-billboard-2.png", "lcn-billboard-3.png"],
  "assets/generated": [
    "stajnia-jednorozcow-stop.png", "lodz-detail-lcn.png", "lodz-detail-mural.png", "lodz-detail-cafe.png",
    "lodz-detail-works-alpha.png", "landmark-znicze.png", "landmark-drzewo.png", "landmark-smolarek-mural.png",
    "landmark-witcher-mural.png", "widzew-fans-bg.png", "landmark-unicorn-statue.png"
  ]
};

if (path.dirname(output) !== root || path.basename(output) !== "_site") {
  throw new Error("Unsafe release output path");
}
fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });

rootFiles.forEach((file) => copyFile(file));
fs.writeFileSync(path.join(output, ".nojekyll"), "");
if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
  fs.writeFileSync(path.join(output, "runtime-config.js"), `window.KURS8_SUPABASE = ${JSON.stringify({
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
    captchaToken: ""
  })};\n`);
}
copyTree("src", (file) => /\.(?:js|css)$/.test(file));
Object.entries(assetGroups).forEach(([directory, files]) => {
  if (files === null) copyTree(directory, () => true);
  else files.forEach((file) => copyFile(path.join(directory, file)));
});

const shellBytes = totalBytes([
  "landing.html", "landing.css", "game.html", "manifest.json", "runtime-config.js", "src",
  "assets/fonts", "assets/icons", "assets/ui", "assets/sprites/track.png", "assets/sprites/plac.png",
  "assets/trams/tram-konstal.png", "assets/trams/tram-pesa.png", "assets/backgrounds/bg-piotrkowska.png",
  "assets/branding/lcn-logo-menu.png"
]);
const total = directoryBytes(output);
const gameplay = total - shellBytes;
const budgets = { shell: 4 * 1024 * 1024, gameplay: 14 * 1024 * 1024, total: 22 * 1024 * 1024 };
if (shellBytes > budgets.shell || gameplay > budgets.gameplay || total > budgets.total) {
  throw new Error(`Release budget exceeded: shell=${mb(shellBytes)} MB gameplay=${mb(gameplay)} MB total=${mb(total)} MB`);
}
console.log(`Release OK: shell=${mb(shellBytes)} MB gameplay=${mb(gameplay)} MB total=${mb(total)} MB`);

function copyTree(relative, include) {
  const source = path.join(root, relative);
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const child = path.join(relative, entry.name);
    if (entry.isDirectory()) copyTree(child, include);
    else if (include(child)) copyFile(child);
  }
}

function copyFile(relative) {
  const source = path.join(root, relative);
  if (!fs.existsSync(source)) throw new Error(`Missing runtime file: ${relative}`);
  const target = path.join(output, relative);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
}

function totalBytes(relativePaths) {
  return relativePaths.reduce((sum, relative) => {
    const target = path.join(output, relative);
    return sum + (fs.statSync(target).isDirectory() ? directoryBytes(target) : fs.statSync(target).size);
  }, 0);
}

function directoryBytes(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).reduce((sum, entry) => {
    const target = path.join(directory, entry.name);
    return sum + (entry.isDirectory() ? directoryBytes(target) : fs.statSync(target).size);
  }, 0);
}

function mb(bytes) {
  return (bytes / 1024 / 1024).toFixed(2);
}
