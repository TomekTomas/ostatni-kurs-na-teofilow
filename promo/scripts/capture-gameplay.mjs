import { spawn, spawnSync } from "node:child_process";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const promoRoot = path.resolve(scriptDir, "..");
const projectRoot = path.resolve(promoRoot, "..");
const rawDir = path.join(promoRoot, ".capture");
const outputDir = path.join(promoRoot, "public", "footage");
const port = 4180;
const baseUrl = `http://127.0.0.1:${port}`;

await mkdir(rawDir, { recursive: true });
await mkdir(outputDir, { recursive: true });

const server = spawn(process.execPath, [path.join(projectRoot, "tools", "dev-server.js")], {
  cwd: projectRoot,
  env: { ...process.env, PORT: String(port) },
  stdio: "ignore",
});

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const waitForServer = async () => {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/game.html`);
      if (response.ok) return;
    } catch {
      // Server is still starting.
    }
    await sleep(200);
  }
  throw new Error("Nie udalo sie uruchomic serwera gry");
};

const setCleanGameplayState = async (page, options) => {
  await page.evaluate(({ distance, speedRatio, hazard, score }) => {
    const scene = window.__KURS8_GAME__.scene.getScene("GameScene");
    scene.tutorialShown = {
      training: true,
      start: true,
      "first-stop": true,
      "first-car": true,
      "first-switch": true,
    };
    scene.tutorialLayer?.setVisible(false);
    scene.messageText?.setVisible(false);
    scene.feedbackText?.setVisible(false);
    scene.routeMomentText?.setVisible(false);
    scene.distance = distance;
    scene.currentStopIndex = Math.max(0, scene.stations.findIndex((stop) => stop.distance > distance));
    scene.updateRouteBackground();
    scene.trackCondition = 0.96;
    scene.trackTargetCondition = 0.96;
    scene.speed = scene.vehicle.maxSpeed * speedRatio;
    scene.throttle = speedRatio;
    scene.lastThrottle = speedRatio;
    scene.timeLeft = Math.max(scene.timeLeft, 520);
    if (hazard && scene.roadHazards?.[0]) {
      scene.roadHazards[0].worldDistance = scene.distance + 520;
      scene.configureRoadHazard(scene.roadHazards[0], 0);
    }
    if (scene.oncomingTrams?.[0]) {
      scene.oncomingTrams[0].container.x = 1180;
      scene.oncomingTrams[0].ownSpeed = 125;
      scene.oncomingTrams[0].container.setVisible(true);
    }
    if (score) {
      scene.score = 6200;
      scene.delivered = 146;
      scene.satisfaction = 96;
      scene.smoothness = 93;
      scene.punctuality = 91;
      scene.stats.servedStops = 34;
    }
    scene.updateHud();
    scene.updateOdometerHud();
  }, options);
};

const startGame = async (page, vehicleKey, modeKey) => {
  await page.evaluate(({ vehicleKey, modeKey }) => {
    window.__KURS8_GAME__.scene.start("PreloadGameScene", { vehicleKey, modeKey });
  }, { vehicleKey, modeKey });
  await page.waitForFunction(() => window.__KURS8_GAME__?.scene?.isActive("GameScene"), null, { timeout: 30000 });
  await page.waitForTimeout(500);
};

const clickCanvas = async (page, gameX, gameY) => {
  const box = await page.locator("canvas").boundingBox();
  await page.mouse.click(box.x + (gameX / 1280) * box.width, box.y + (gameY / 720) * box.height);
};

const clips = [
  {
    name: "menu",
    duration: 4.2,
    setup: async (page) => {
      await page.waitForFunction(() => window.__KURS8_GAME__?.scene?.isActive("MenuScene"));
      await page.evaluate(() => {
        const scene = window.__KURS8_GAME__.scene.getScene("MenuScene");
        scene.children.list
          .filter((object) => object.texture?.key === "lcn-logo-menu")
          .forEach((object) => object.setVisible(false));
      });
      await page.waitForTimeout(450);
      setTimeout(() => clickCanvas(page, 820, 342), 900);
      setTimeout(() => clickCanvas(page, 820, 210), 2450);
    },
  },
  {
    name: "day",
    duration: 5.5,
    setup: async (page) => {
      await page.waitForFunction(() => window.__KURS8_GAME__?.scene?.isActive("MenuScene"));
      await startGame(page, "konstal", "training");
      await setCleanGameplayState(page, { distance: 28600, speedRatio: 0.58, hazard: false, score: false });
    },
  },
  {
    name: "hazards",
    duration: 5.0,
    setup: async (page) => {
      await page.waitForFunction(() => window.__KURS8_GAME__?.scene?.isActive("MenuScene"));
      await startGame(page, "konstal", "training");
      await setCleanGameplayState(page, { distance: 43800, speedRatio: 0.42, hazard: true, score: false });
    },
  },
  {
    name: "night",
    duration: 5.5,
    setup: async (page) => {
      await page.waitForFunction(() => window.__KURS8_GAME__?.scene?.isActive("MenuScene"));
      await startGame(page, "pesa", "night");
      await setCleanGameplayState(page, { distance: 70200, speedRatio: 0.67, hazard: false, score: false });
      await page.evaluate(() => window.__KURS8_GAME__.scene.getScene("GameScene").spawnPantographSparkBurst());
      setTimeout(() => page.evaluate(() => window.__KURS8_GAME__.scene.getScene("GameScene").spawnPantographSparkBurst()), 2400);
    },
  },
  {
    name: "score",
    duration: 4.2,
    setup: async (page) => {
      await page.waitForFunction(() => window.__KURS8_GAME__?.scene?.isActive("MenuScene"));
      await startGame(page, "pesa", "last");
      await setCleanGameplayState(page, { distance: 88500, speedRatio: 0.32, hazard: false, score: true });
    },
  },
];

const browser = await chromium.launch({ headless: true });

try {
  await waitForServer();
  const selectedClips = process.env.PROMO_CLIP
    ? clips.filter((clip) => clip.name === process.env.PROMO_CLIP)
    : clips;
  if (!selectedClips.length) throw new Error(`Nieznany klip: ${process.env.PROMO_CLIP}`);
  for (const clip of selectedClips) {
    const contextStartedAt = Date.now();
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      recordVideo: { dir: rawDir, size: { width: 1280, height: 720 } },
      serviceWorkers: "block",
    });
    const page = await context.newPage();
    await page.goto(`${baseUrl}/game.html?promo=${Date.now()}`);
    await page.addStyleTag({ content: ".back-to-landing { display: none !important; }" });
    await clip.setup(page);
    const contentStartedAt = Date.now();
    await page.waitForTimeout(clip.duration * 1000);
    const video = page.video();
    await context.close();
    const rawPath = await video.path();
    const trimStart = Math.max(0, (contentStartedAt - contextStartedAt) / 1000);
    const output = path.join(outputDir, `${clip.name}.mp4`);
    const result = spawnSync("ffmpeg", [
      "-y",
      "-i",
      rawPath,
      "-ss",
      trimStart.toFixed(3),
      "-t",
      String(clip.duration),
      "-vf",
      "fps=30,scale=1280:720",
      "-an",
      "-c:v",
      "libx264",
      "-preset",
      "medium",
      "-crf",
      "18",
      "-pix_fmt",
      "yuv420p",
      output,
    ], { stdio: "inherit" });
    if (result.status !== 0) throw new Error(`FFmpeg nie przygotowal klipu ${clip.name}`);
    console.log(`Gotowy klip: ${output}`);
  }
} finally {
  await browser.close();
  server.kill();
}
