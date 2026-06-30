import { FONT_FAMILY, HEIGHT, WIDTH } from "./config/constants.js";
import { BootScene } from "./scenes/BootScene.js";
import { MenuScene } from "./scenes/MenuScene.js";
import { PreloadGameScene } from "./scenes/PreloadGameScene.js";
import { GameScene } from "./scenes/GameScene.js";

const config = {
  type: Phaser.AUTO,
  parent: "game",
  width: WIDTH,
  height: HEIGHT,
  backgroundColor: "#10131a",
  render: {
    pixelArt: true,
    roundPixels: true
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [BootScene, MenuScene, PreloadGameScene, GameScene]
};

window.addEventListener("load", () => {
  if (!window.Phaser) {
    document.getElementById("game").innerHTML = "<p style='padding:24px;color:#f4efe4;font:20px Lexend Deca, Segoe UI, sans-serif'>Nie udało się załadować Phaser 3 z CDN.</p>";
    return;
  }
  const originalTextFactory = Phaser.GameObjects.GameObjectFactory.prototype.text;
  Phaser.GameObjects.GameObjectFactory.prototype.text = function patchedLexendText(x, y, text, style = {}) {
    return originalTextFactory.call(this, x, y, text, { fontFamily: FONT_FAMILY, ...style });
  };
  let game = null;
  const startGame = () => {
    game = new Phaser.Game(config);
    if (["localhost", "127.0.0.1"].includes(window.location.hostname)) {
      window.__KURS8_GAME__ = game;
    }
    attachRuntimeGuards(game);
    return game;
  };
  const refreshGameScale = () => {
    window.clearTimeout(window.__lastCourseResizeTimer);
    window.__lastCourseResizeTimer = window.setTimeout(() => {
      game?.scale?.refresh();
    }, 180);
  };
  window.addEventListener("orientationchange", refreshGameScale, { passive: true });
  window.addEventListener("resize", refreshGameScale, { passive: true });
  window.visualViewport?.addEventListener("resize", refreshGameScale, { passive: true });
  if (document.fonts && document.fonts.load) {
    document.fonts.load('16px "Lexend Deca"').finally(startGame);
  } else {
    startGame();
  }
});

function attachRuntimeGuards(game) {
  const canvas = game.canvas;
  if (!canvas) return;
  canvas.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    const target = document.getElementById("game");
    if (!target || document.getElementById("renderer-warning")) return;
    const warning = document.createElement("div");
    warning.id = "renderer-warning";
    warning.textContent = "Renderer został zatrzymany. Odśwież grę, jeśli obraz nie wróci automatycznie.";
    target.appendChild(warning);
  });
  canvas.addEventListener("webglcontextrestored", () => {
    document.getElementById("renderer-warning")?.remove();
  });
}
