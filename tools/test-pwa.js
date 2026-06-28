const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "manifest.json"), "utf8"));
const sw = fs.readFileSync(path.join(root, "sw.js"), "utf8");
const failures = [];

for (const key of ["name", "short_name", "start_url", "display", "theme_color", "background_color", "icons"]) {
  if (!manifest[key]) failures.push(`manifest missing ${key}`);
}
if (manifest.display !== "fullscreen") failures.push("manifest display must remain fullscreen");
if (!sw.includes("const SHELL_URLS")) failures.push("service worker shell list missing");
if (!sw.includes("PHASER_URL")) failures.push("Phaser runtime cache missing");
if (!sw.includes("supabase.co")) failures.push("Supabase network bypass missing");
if (/sprite-sheet|source-sheet/.test(sw)) failures.push("source sprite sheets must not be precached");

const shellBlock = sw.match(/const SHELL_URLS = \[([\s\S]*?)\];/)?.[1] || "";
for (const match of shellBlock.matchAll(/"\.\/(.*?)"/g)) {
  const relative = match[1] || "index.html";
  if (!fs.existsSync(path.join(root, relative))) failures.push(`missing shell file ${relative}`);
}

if (failures.length) {
  console.error("PWA TEST FAILED");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log("PWA TEST OK");
