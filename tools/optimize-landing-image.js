const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("@playwright/test");

run();

async function run() {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    const source = path.resolve("assets/trams/tram-konstal.png").replace(/\\/g, "/");
    await page.goto(`file:///${source}`);
    const dataUrl = await page.evaluate(() => {
      const image = document.querySelector("img");
      const width = 760;
      const height = Math.round(width * image.naturalHeight / image.naturalWidth);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d").drawImage(image, 0, 0, width, height);
      return canvas.toDataURL("image/webp", 0.82);
    });
    fs.writeFileSync("assets/branding/landing-tram.webp", Buffer.from(dataUrl.split(",")[1], "base64"));
  } finally {
    await browser.close();
  }
}
