import { rename, rm } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.resolve(scriptDir, "..", "out");
const input = path.join(outputDir, "ostatni-kurs-reel.mp4");
const normalized = path.join(outputDir, "ostatni-kurs-reel-normalized.mp4");

const result = spawnSync("ffmpeg", [
  "-y",
  "-i",
  input,
  "-c:v",
  "copy",
  "-af",
  "volume=5.8dB,alimiter=limit=0.75:attack=5:release=50:level=false",
  "-c:a",
  "aac",
  "-b:a",
  "192k",
  "-ar",
  "48000",
  "-movflags",
  "+faststart",
  normalized,
], { stdio: "inherit" });

if (result.status !== 0) throw new Error("Nie udalo sie znormalizowac dzwieku rolki");
await rm(input);
await rename(normalized, input);
console.log(`Znormalizowano dzwiek: ${input}`);
