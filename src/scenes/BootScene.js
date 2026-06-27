import { queueMenuAssets } from "../config/assets.js";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload() {
    queueMenuAssets(this);
  }

  create() {
    this.scene.start("MenuScene");
  }
}
