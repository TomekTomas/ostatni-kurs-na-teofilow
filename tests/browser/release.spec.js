const { test, expect } = require("@playwright/test");

test("landing -> menu -> wyzwanie -> GameScene -> ekran koncowy", async ({ page }) => {
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/");
  await page.locator(".play-button").click();
  await expect(page).toHaveURL(/game\.html/);
  await expect(page.locator("canvas")).toBeVisible();
  await page.waitForFunction(() => window.__KURS8_GAME__?.scene?.isActive("MenuScene"));
  const menuLayout = await page.evaluate(() => {
    const scene = window.__KURS8_GAME__.scene.getScene("MenuScene");
    scene.modeRecordText.setText("Rekord Ostatni kurs: 2859");
    const recordPanel = scene.recordPanel.getBounds();
    const recordText = scene.modeRecordText.getBounds();
    const modePanel = scene.modePanel.getBounds();
    const modeDescription = scene.modeDescription.getBounds();
    const titlePlaque = scene.children.list.find((object) => object.texture?.key === "title-plaque").getBounds();
    const firstTab = scene.tabButtons[0].bg.getBounds();
    const recordLines = scene.children.list
      .filter((object) => object.type === "Text" && object.x === 98 && object.y >= 172 && object.y <= 276)
      .sort((first, second) => first.y - second.y)
      .map((object) => object.getBounds());
    return {
      tabLabels: scene.tabButtons.map((button) => button.label),
      titleToTabsGap: firstTab.top - titlePlaque.bottom,
      tabsToPanelsGap: recordPanel.top - firstTab.bottom,
      recordTextBottom: recordText.bottom,
      recordPanelBottom: recordPanel.bottom,
      modeDescriptionBottom: modeDescription.bottom,
      modePanelBottom: modePanel.bottom,
      minimumRecordGap: Math.min(...recordLines.slice(1).map((line, index) => line.y - recordLines[index].bottom))
    };
  });
  expect(menuLayout.recordTextBottom).toBeLessThanOrEqual(menuLayout.recordPanelBottom - 4);
  expect(menuLayout.tabLabels).toEqual(["GRAJ", "WYZWANIE", "OSIĄGNIĘCIA", "USTAWIENIA"]);
  expect(menuLayout.titleToTabsGap).toBeGreaterThanOrEqual(6);
  expect(menuLayout.tabsToPanelsGap).toBeGreaterThanOrEqual(8);
  expect(menuLayout.modeDescriptionBottom).toBeLessThanOrEqual(menuLayout.modePanelBottom - 6);
  expect(menuLayout.minimumRecordGap).toBeGreaterThanOrEqual(4);

  await clickCanvas(page, 500, 128);
  await clickCanvas(page, 960, 410);
  await page.waitForFunction(() => window.__KURS8_GAME__?.scene?.isActive("GameScene"), null, { timeout: 30_000 });
  const hudLayout = await page.evaluate(() => {
    const scene = window.__KURS8_GAME__.scene.getScene("GameScene");
    const nextBounds = scene.nextText.getBounds();
    const scheduleBounds = scene.hudScheduleText.getBounds();
    return {
      width: scene.scale.width,
      odometerBottom: scene.getOdometerPanelY(),
      nextRight: nextBounds.right,
      scheduleRight: scheduleBounds.right,
      scheduleBottom: scheduleBounds.bottom
    };
  });
  expect(hudLayout.odometerBottom).toBeLessThanOrEqual(510);
  expect(hudLayout.nextRight).toBeLessThanOrEqual(hudLayout.width - 14);
  expect(hudLayout.scheduleRight).toBeLessThanOrEqual(hudLayout.width - 14);
  expect(hudLayout.scheduleBottom).toBeLessThanOrEqual(62);
  const vehicleScale = await page.evaluate(() => {
    const scene = window.__KURS8_GAME__.scene.getScene("GameScene");
    const scooter = scene.trafficCars.find((vehicle) => vehicle.texture.key === "scooter-side");
    const cargoBike = scene.trafficCars.find((vehicle) => vehicle.texture.key === "cargo-bike-side");
    return {
      scooterHeight: scooter.displayHeight,
      cargoBikeHeight: cargoBike.displayHeight,
      tramHeight: scene.tram.displayHeight
    };
  });
  expect(vehicleScale.scooterHeight).toBeLessThan(vehicleScale.tramHeight * 0.6);
  expect(vehicleScale.cargoBikeHeight).toBeLessThan(vehicleScale.tramHeight * 0.6);
  await page.keyboard.press("p");
  await page.keyboard.press("u");
  await page.waitForFunction(() => window.__KURS8_GAME__.scene.getScene("GameScene").pauseSettingsLayer.visible === true);
  await page.keyboard.press("u");
  await page.keyboard.press("p");
  await page.evaluate(() => {
    const scene = window.__KURS8_GAME__.scene.getScene("GameScene");
    scene.currentStopIndex = 34;
    scene.checkEnd();
  });
  await page.waitForFunction(() => window.__KURS8_GAME__?.scene?.getScene("GameScene")?.finished === true);
  const summary = await page.evaluate(() => window.__KURS8_GAME__.scene.getScene("GameScene").runSummary);
  expect(summary).toMatchObject({ version: 1, completed: true });
  expect(errors).toEqual([]);
});

test("gra uruchamia menu offline po pierwszym wczytaniu", async ({ page, context }) => {
  await page.goto("/game.html");
  await page.waitForFunction(() => window.__KURS8_GAME__?.scene?.isActive("MenuScene"));
  await page.waitForFunction(async () => Boolean(await navigator.serviceWorker.ready));
  await page.reload();
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
  await context.setOffline(true);
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => window.__KURS8_GAME__?.scene?.isActive("MenuScene"), null, { timeout: 30_000 });
  await expect(page.locator("canvas")).toBeVisible();
  await context.setOffline(false);
});

test("interfejs miesci sie w mobilnym landscape", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:4173/game.html");
  await page.waitForFunction(() => window.__KURS8_GAME__?.scene?.isActive("MenuScene"));
  const box = await page.locator("canvas").boundingBox();
  expect(box.width).toBeLessThanOrEqual(844);
  expect(box.height).toBeLessThanOrEqual(390);
  expect(box.width).toBeGreaterThan(600);
  await context.close();
});

async function clickCanvas(page, gameX, gameY) {
  const canvas = page.locator("canvas");
  const box = await canvas.boundingBox();
  await page.mouse.click(box.x + (gameX / 1280) * box.width, box.y + (gameY / 720) * box.height);
}
