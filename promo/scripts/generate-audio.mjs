import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const promoRoot = path.resolve(scriptDir, "..");
const output = path.join(promoRoot, "public", "audio", "promo-track.wav");
const sampleRate = 44100;
const duration = 24;
const channels = 2;
const frames = sampleRate * duration;
const left = new Float64Array(frames);
const right = new Float64Array(frames);
const bpm = 92;
const beat = 60 / bpm;
let randomState = 0x8a11ce;

const random = () => {
  randomState = (1664525 * randomState + 1013904223) >>> 0;
  return randomState / 0xffffffff;
};

const add = (time, length, generator, volume = 1, pan = 0) => {
  const start = Math.max(0, Math.floor(time * sampleRate));
  const count = Math.min(frames - start, Math.floor(length * sampleRate));
  const leftGain = Math.sqrt((1 - pan) * 0.5) * volume;
  const rightGain = Math.sqrt((1 + pan) * 0.5) * volume;
  for (let index = 0; index < count; index += 1) {
    const localTime = index / sampleRate;
    const value = generator(localTime, localTime / length);
    left[start + index] += value * leftGain;
    right[start + index] += value * rightGain;
  }
};

const sine = (frequency, time) => Math.sin(Math.PI * 2 * frequency * time);
const triangle = (frequency, time) => (2 / Math.PI) * Math.asin(sine(frequency, time));

const bassNotes = [73.42, 73.42, 87.31, 98.0, 65.41, 73.42, 87.31, 98.0];
for (let bar = 0; bar < 10; bar += 1) {
  for (let step = 0; step < 8; step += 1) {
    const time = bar * beat * 4 + step * beat * 0.5;
    if (time >= duration - 1) continue;
    const note = bassNotes[(bar + step) % bassNotes.length];
    add(time, beat * 0.42, (t, progress) => triangle(note, t) * Math.exp(-progress * 3.8), 0.14, -0.12);
  }
}

for (let time = 0; time < duration; time += beat) {
  add(time, 0.24, (t) => sine(74 - t * 120, t) * Math.exp(-t * 19), 0.62);
  add(time + beat * 0.5, 0.08, (t) => (random() * 2 - 1) * Math.exp(-t * 42), 0.11, 0.25);
}

for (let time = beat; time < duration; time += beat * 2) {
  add(time, 0.16, (t) => (random() * 2 - 1) * Math.exp(-t * 18), 0.17, -0.18);
}

const chordRoots = [146.83, 174.61, 130.81, 196.0];
for (let bar = 0; bar < 10; bar += 1) {
  const time = bar * beat * 4;
  const root = chordRoots[bar % chordRoots.length];
  [1, 1.25, 1.5].forEach((ratio, index) => {
    add(time, beat * 4.2, (t, progress) => sine(root * ratio, t) * Math.sin(Math.PI * Math.min(1, progress)), 0.026, (index - 1) * 0.45);
  });
}

const bell = (time) => {
  [880, 1320, 1760].forEach((frequency, index) => {
    add(time + index * 0.11, 0.15, (t) => sine(frequency, t) * Math.exp(-t * 22), 0.2, index === 1 ? 0.28 : -0.16);
  });
};

bell(2.55);
bell(20.3);
[7.2, 7.36].forEach((time, index) => add(time, 0.2, (t) => triangle(index ? 360 : 280, t) * Math.exp(-t * 17), 0.13));
add(12.9, 0.75, (t, progress) => (random() * 2 - 1) * Math.sin(Math.PI * progress) * (1 - progress), 0.16, 0.2);
[16.55, 16.68, 16.82, 16.96].forEach((time, index) => {
  add(time, 0.16, (t) => sine(1600 + index * 310, t) * Math.exp(-t * 26), 0.12, index % 2 ? 0.5 : -0.5);
});
[523.25, 659.25, 783.99].forEach((frequency, index) => {
  add(21.35 + index * 0.18, 0.34, (t) => sine(frequency, t) * Math.exp(-t * 8), 0.14, (index - 1) * 0.3);
});

let peak = 0;
for (let index = 0; index < frames; index += 1) {
  peak = Math.max(peak, Math.abs(left[index]), Math.abs(right[index]));
}
const gain = peak > 0 ? 0.88 / peak : 1;
const dataSize = frames * channels * 2;
const buffer = Buffer.alloc(44 + dataSize);
buffer.write("RIFF", 0);
buffer.writeUInt32LE(36 + dataSize, 4);
buffer.write("WAVE", 8);
buffer.write("fmt ", 12);
buffer.writeUInt32LE(16, 16);
buffer.writeUInt16LE(1, 20);
buffer.writeUInt16LE(channels, 22);
buffer.writeUInt32LE(sampleRate, 24);
buffer.writeUInt32LE(sampleRate * channels * 2, 28);
buffer.writeUInt16LE(channels * 2, 32);
buffer.writeUInt16LE(16, 34);
buffer.write("data", 36);
buffer.writeUInt32LE(dataSize, 40);

for (let index = 0; index < frames; index += 1) {
  buffer.writeInt16LE(Math.round(Math.max(-1, Math.min(1, left[index] * gain)) * 32767), 44 + index * 4);
  buffer.writeInt16LE(Math.round(Math.max(-1, Math.min(1, right[index] * gain)) * 32767), 46 + index * 4);
}

await mkdir(path.dirname(output), { recursive: true });
await writeFile(output, buffer);
console.log(`Wygenerowano ${output}`);
