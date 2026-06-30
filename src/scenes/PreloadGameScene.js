import { HEIGHT, WIDTH } from "../config/constants.js";
import { queueGameAssets } from "../config/assets.js";

export class PreloadGameScene extends Phaser.Scene {
  constructor() {
    super("PreloadGameScene");
  }

  init(data = {}) {
    this.gameData = data;
    this.failedAssets = [];
  }

  preload() {
    this.add.rectangle(0, 0, WIDTH, HEIGHT, 0x10131a).setOrigin(0);
    this.add.rectangle(WIDTH / 2, 108, 118, 82, 0x033968, 1).setStrokeStyle(3, 0xffb22e, 1);
    this.add.text(WIDTH / 2, 96, "TT", { fontSize: "32px", fontStyle: "700", color: "#ffffff" }).setOrigin(0.5);
    this.add.text(WIDTH / 2, 129, "TOMASZ TOMAS", { fontSize: "9px", fontStyle: "700", color: "#ffb22e" }).setOrigin(0.5);
    this.add.text(WIDTH / 2, 232, "PRZYGOTOWANIE KURSU", {
      fontSize: "28px", fontStyle: "700", color: "#ffb22e"
    }).setOrigin(0.5);
    this.add.text(WIDTH / 2, 275, "Ładujemy trasę z Zarzewa na Teofilów", {
      fontSize: "14px", color: "#d9d3c4"
    }).setOrigin(0.5);
    this.add.rectangle(WIDTH / 2, 354, 650, 30, 0x071017, 1).setStrokeStyle(2, 0x4b5961, 1);
    this.progressFill = this.add.rectangle(WIDTH / 2 - 319, 354, 1, 18, 0x33b54b, 1).setOrigin(0, 0.5);
    this.progressText = this.add.text(WIDTH / 2, 397, "0%", { fontSize: "18px", color: "#f4efe4", fontStyle: "700" }).setOrigin(0.5);

    this.load.on("progress", (progress) => {
      this.progressFill.width = Math.max(1, 638 * progress);
      this.progressText.setText(`${Math.round(progress * 100)}%`);
    });
    this.load.on("loaderror", (file) => this.failedAssets.push(file.src || file.key));
    queueGameAssets(this);
  }

  create() {
    if (this.failedAssets.length === 0) {
      this.scene.start("GameScene", this.gameData);
      return;
    }
    this.add.text(WIDTH / 2, 455, `Nie udało się wczytać ${this.failedAssets.length} plików.`, {
      fontSize: "17px", color: "#ff5c8a", fontStyle: "700"
    }).setOrigin(0.5);
    const button = this.add.rectangle(WIDTH / 2, 525, 260, 62, 0xffb22e, 1).setInteractive({ useHandCursor: true });
    this.add.text(WIDTH / 2, 525, "SPRÓBUJ PONOWNIE", { fontSize: "17px", color: "#10131a", fontStyle: "700" }).setOrigin(0.5);
    button.on("pointerdown", () => this.scene.restart(this.gameData));
  }
}
