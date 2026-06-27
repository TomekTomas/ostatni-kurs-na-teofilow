const { spawn } = require("node:child_process");
const http = require("node:http");
const { chromium } = require("@playwright/test");

const port = 4174;
const server = spawn(process.execPath, ["tools/dev-server.js"], {
  cwd: process.cwd(),
  env: { ...process.env, PORT: String(port) },
  stdio: "ignore"
});

run().finally(() => server.kill());

async function run() {
  await waitForServer(`http://127.0.0.1:${port}/landing.html`);
  const [{ launch }, { default: lighthouse }] = await Promise.all([
    import("chrome-launcher"),
    import("lighthouse")
  ]);
  const chrome = await launch({ chromePath: chromium.executablePath(), chromeFlags: ["--headless", "--no-sandbox"] });
  try {
    const result = await lighthouse(`http://127.0.0.1:${port}/landing.html`, {
      port: chrome.port,
      output: "json",
      logLevel: "error",
      onlyCategories: ["performance"],
      formFactor: "desktop",
      screenEmulation: { mobile: false, width: 1350, height: 940, deviceScaleFactor: 1, disabled: false },
      throttlingMethod: "simulate"
    });
    const score = Math.round(result.lhr.categories.performance.score * 100);
    console.log(`LIGHTHOUSE PERFORMANCE ${score}`);
    if (score < 90) {
      Object.values(result.lhr.audits)
        .filter((audit) => audit.score !== null && audit.score < 0.9 && (audit.numericValue || audit.details?.overallSavingsMs))
        .sort((a, b) => (b.details?.overallSavingsMs || b.numericValue || 0) - (a.details?.overallSavingsMs || a.numericValue || 0))
        .slice(0, 8)
        .forEach((audit) => console.log(`- ${audit.id}: ${audit.displayValue || audit.title}`));
      process.exitCode = 1;
    }
  } finally {
    try {
      await chrome.kill();
    } catch (_) {
      // Windows can retain a locked Lighthouse profile briefly after Chrome exits.
    }
  }
}

function waitForServer(url, attempts = 50) {
  return new Promise((resolve, reject) => {
    const check = (remaining) => {
      http.get(url, (response) => {
        response.resume();
        if (response.statusCode === 200) resolve();
        else if (remaining > 0) setTimeout(() => check(remaining - 1), 200);
        else reject(new Error("Dev server did not become ready"));
      }).on("error", () => {
        if (remaining > 0) setTimeout(() => check(remaining - 1), 200);
        else reject(new Error("Dev server did not become ready"));
      });
    };
    check(attempts);
  });
}
