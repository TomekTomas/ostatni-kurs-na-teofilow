import { HEIGHT, WIDTH } from "../config/constants.js";
import { VEHICLES } from "../config/vehicles.js";
import { GAME_MODES } from "../config/modes.js";
import { missionResults } from "../logic/missions.js";

export class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  create() {
    this.selected = "konstal";
    this.selectedMode = "last";
    this.highScore = this.readHighScore();
    this.add.rectangle(0, 0, WIDTH, HEIGHT, 0x10131a).setOrigin(0);
    this.add.image(WIDTH / 2, 302, "bg-piotrkowska").setAlpha(0.86);
    this.add.rectangle(0, 0, WIDTH, HEIGHT, 0x070808, 0.2).setOrigin(0);
    this.add.rectangle(0, 526, WIDTH, 194, 0x202832, 0.92).setOrigin(0);
    this.add.tileSprite(0, 560, WIDTH, 96, "track").setOrigin(0).setAlpha(0.95);
    this.add.rectangle(0, 655, WIDTH, 65, 0x3f4448).setOrigin(0);
    this.add.tileSprite(0, 663, WIDTH, 26, "plac").setOrigin(0).setScale(0.62, 0.2).setAlpha(0.24);
    this.drawMenuChrome();

    this.add.image(WIDTH / 2, 74, "title-plaque").setOrigin(0.5).setScale(0.88, 0.86);
    this.add.text(WIDTH / 2, 50, "OSTATNI KURS", {
      fontSize: "31px",
      fontStyle: "700",
      color: "#ffb22e",
      stroke: "#111319",
      strokeThickness: 4
    }).setOrigin(0.5);
    this.add.text(WIDTH / 2, 94, "NA TEOFILOW", {
      fontSize: "19px",
      fontStyle: "700",
      color: "#f4efe4",
      stroke: "#111319",
      strokeThickness: 3
    }).setOrigin(0.5);

    this.add.image(70, 156, "panel-hud").setOrigin(0).setScale(1.04, 1.22);
    this.add.text(98, 176, "REKORD", { fontSize: "15px", color: "#8ea0a8", fontStyle: "700" });
    this.add.text(98, 202, `${this.highScore}`, { fontSize: "32px", color: "#ffb22e", fontStyle: "700" });
    this.add.text(98, 240, "Linia 8: Zarzew -> Teofilow", { fontSize: "12px", color: "#f4efe4" });
    this.add.text(98, 262, "Cel: dowiez komplet pasazerow", { fontSize: "12px", color: "#d9d3c4" });
    this.add.image(462, 224, "lcn-logo-menu").setOrigin(0.5).setScale(0.3).setAlpha(0.96);

    this.modeRecordText = this.add.text(98, 280, "", { fontSize: "11px", color: "#8ea0a8" });

    this.konstalButton = this.makeVehicleButton(596, 156, "konstal");
    this.pesaButton = this.makeVehicleButton(596, 286, "pesa");
    this.refreshButtons();

    this.previewRear = this.add.sprite(500, 610, "tram-konstal").setOrigin(0.5, 0.91).setScale(VEHICLES.konstal.spriteScale * 0.82);
    this.preview = this.add.sprite(850, 610, "tram-konstal").setOrigin(0.5, 0.91).setScale(VEHICLES.konstal.spriteScale * 0.82);
    this.add.image(640, 570, "route-pin").setScale(1.2);
    this.add.image(1080, 570, "route-pin").setScale(1.2);
    this.add.text(622, 598, "Zarzew", { fontSize: "14px", color: "#f4efe4" });
    this.add.text(1052, 598, "Teofilow", { fontSize: "14px", color: "#f4efe4" });

    this.add.image(70, 318, "panel-dark").setOrigin(0).setScale(1.04, 1.34);
    this.add.text(98, 340, "STEROWANIE", { fontSize: "17px", color: "#f4d35e", fontStyle: "700" });
    this.add.text(98, 372, [
      "A/D lub strzalki: nastawnik",
      "SPACJA: drzwi lub dzwonek",
      "Q/E: zwrotnica skret/prosto",
      "P: pauza | R: restart"
    ], { fontSize: "12px", color: "#d9d3c4", lineSpacing: 3 });

    this.add.image(70, 488, "panel-dark").setOrigin(0).setScale(1.04, 1.5);
    this.add.text(98, 510, "TRYB", { fontSize: "17px", color: "#f4d35e", fontStyle: "700" });
    this.modeButtons = [
      this.makeModeButton(98, 544, "last"),
      this.makeModeButton(256, 544, "training"),
      this.makeModeButton(98, 594, "rush"),
      this.makeModeButton(256, 594, "night")
    ];
    this.modeDescription = this.add.text(98, 648, "", { fontSize: "11px", color: "#d9d3c4", wordWrap: { width: 360, useAdvancedWrap: true } });
    this.refreshModes();

    this.startGlow = this.add.rectangle(904, 602, 280, 92, 0xffb22e, 0.14)
      .setOrigin(0)
      .setStrokeStyle(2, 0xffb22e, 0.42);
    this.startButton = this.makeImageButton(914, 612, "button-primary", "START", () => this.startSelectedGame());

    this.input.keyboard.once("keydown-SPACE", () => this.startSelectedGame());
  }

  drawMenuChrome() {
    const g = this.add.graphics();
    g.fillStyle(0x071017, 0.74);
    g.fillRoundedRect(54, 140, 500, 156, 10);
    g.fillRoundedRect(54, 304, 500, 158, 10);
    g.fillRoundedRect(54, 474, 500, 208, 10);
    g.fillRoundedRect(576, 138, 600, 278, 10);
    g.fillStyle(0x033968, 0.38);
    g.fillRoundedRect(64, 150, 480, 136, 8);
    g.fillRoundedRect(586, 148, 580, 118, 8);
    g.fillRoundedRect(586, 278, 580, 118, 8);
    g.fillStyle(0x33b54b, 0.92);
    g.fillRect(54, 140, 4, 156);
    g.fillRect(576, 138, 4, 278);
    g.fillStyle(0xffb22e, 0.82);
    g.fillRect(54, 474, 500, 3);
    g.fillRect(576, 138, 600, 3);
    g.lineStyle(1, 0xf4efe4, 0.14);
    g.strokeRoundedRect(54, 140, 500, 156, 10);
    g.strokeRoundedRect(54, 304, 500, 158, 10);
    g.strokeRoundedRect(54, 474, 500, 208, 10);
    g.strokeRoundedRect(576, 138, 600, 278, 10);
    this.add.rectangle(WIDTH / 2 - 46, 122, 92, 22, 0x33b54b, 0.96).setOrigin(0.5);
    this.add.text(WIDTH / 2, 111, "LINIA 8", {
      fontSize: "13px",
      fontStyle: "700",
      color: "#10131a"
    }).setOrigin(0.5, 0);
  }

  startSelectedGame() {
    this.showMissionPreview(() => {
      this.scene.start("GameScene", { vehicleKey: this.selected, modeKey: this.selectedMode });
    });
  }

  showMissionPreview(callback) {
    const layer = this.add.container(0, 0).setDepth(2000);
    layer.add(this.add.rectangle(0, 0, WIDTH, HEIGHT, 0x050607, 0.72).setOrigin(0));
    layer.add(this.add.rectangle(WIDTH / 2, HEIGHT / 2, 620, 340, 0x0d1318, 0.98)
      .setStrokeStyle(3, 0xf4d35e, 0.95));
    layer.add(this.add.text(WIDTH / 2, HEIGHT / 2 - 140, "CELE KURSU", {
      fontSize: "26px",
      fontStyle: "700",
      color: "#f4d35e"
    }).setOrigin(0.5));

    const missions = missionResults({ interrupted: false, stats: { missedStops: 0, servedStops: 34, redSignals: 0, switchWrong: 0, switchCorrect: 3 }, smoothness: 100, satisfaction: 100, punctuality: 100 });
    missions.forEach((mission, index) => {
      const yy = HEIGHT / 2 - 98 + index * 32;
      layer.add(this.add.text(WIDTH / 2 - 258, yy, `${index + 1}.`, {
        fontSize: "14px",
        fontStyle: "700",
        color: "#ffb22e"
      }));
      layer.add(this.add.text(WIDTH / 2 - 230, yy, mission.label, {
        fontSize: "14px",
        color: "#f4efe4"
      }));
    });

    layer.add(this.add.text(WIDTH / 2, HEIGHT / 2 + 142, `Tryb: ${GAME_MODES[this.selectedMode].label} | Pojazd: ${VEHICLES[this.selected].name}`, {
      fontSize: "13px",
      color: "#8ea0a8",
      fontStyle: "700"
    }).setOrigin(0.5));

    const countdownText = this.add.text(WIDTH / 2, HEIGHT / 2 + 114, "START za 3...", {
      fontSize: "18px",
      fontStyle: "700",
      color: "#50d2c2"
    }).setOrigin(0.5);
    layer.add(countdownText);

    let countdown = 3;
    const timer = this.time.addEvent({
      delay: 1000,
      repeat: 2,
      callback: () => {
        countdown -= 1;
        if (countdown > 0) {
          countdownText.setText(`START za ${countdown}...`);
        } else {
          layer.destroy();
          callback();
        }
      }
    });

    // Allow skipping with space
    const skipKey = this.input.keyboard.once("keydown-SPACE", () => {
      timer.remove();
      layer.destroy();
      callback();
    });
  }

  makeVehicleButton(x, y, key) {
    const vehicle = VEHICLES[key];
    const glow = this.add.rectangle(x + 273, y + 56, 552, 116, 0x033968, 0.16)
      .setStrokeStyle(2, 0x4b5961, 0.62);
    const bg = this.add.image(x, y, "panel-hud").setOrigin(0).setScale(1.3, 1);
    const badge = this.add.rectangle(x + 40, y + 28, 52, 22, 0x33b54b, 0.88).setOrigin(0.5);
    const badgeText = this.add.text(x + 40, y + 18, key === "konstal" ? "805" : "PESA", {
      fontSize: "11px",
      fontStyle: "700",
      color: "#10131a"
    }).setOrigin(0.5, 0);
    const tramScale = vehicle.spriteScale * (key === "konstal" ? 0.3 : 0.36);
    const rear = key === "konstal"
      ? this.add.sprite(x + 260, y + 88, `tram-${key}`).setOrigin(0.5, 0.91).setScale(tramScale).setAlpha(0.92)
      : null;
    const tram = this.add.sprite(x + (key === "konstal" ? 380 : 360), y + 88, `tram-${key}`).setOrigin(0.5, 0.91).setScale(tramScale);
    const label = this.add.text(x + 76, y + 18, vehicle.name, { fontSize: "24px", color: "#f4efe4", fontStyle: "700" });
    const stats = this.add.text(x + 24, y + 58, `Vmax ${vehicle.displayMaxSpeed} km/h\nKomfort ${Math.round(vehicle.comfort * 100)}%  Ham. ${Math.round(vehicle.braking / vehicle.maxSpeed * 100)}%`, {
      fontSize: "12px",
      color: "#c6c1b8"
    });
    const zone = this.add.zone(x, y, 546, 112).setOrigin(0).setInteractive({ useHandCursor: true });
    zone.on("pointerdown", () => {
      this.selected = key;
      this.preview.setTexture(`tram-${key}`).setScale(vehicle.spriteScale * (key === "konstal" ? 0.82 : 0.74)).setX(key === "konstal" ? 850 : 760);
      this.previewRear.setTexture(`tram-${key}`).setScale(vehicle.spriteScale * 0.82).setX(500).setVisible(key === "konstal");
      this.refreshButtons();
    });
    return { key, glow, bg, badge, badgeText, label, stats, tram, rear };
  }

  makeImageButton(x, y, texture, label, callback) {
    const image = this.add.image(x, y, texture).setOrigin(0);
    const text = this.add.text(x + 130, y + 36, label, {
      fontSize: "24px",
      fontStyle: "700",
      color: texture === "button-primary" ? "#111319" : "#f4efe4"
    }).setOrigin(0.5);
    const zone = this.add.zone(x, y, 260, 74).setOrigin(0).setInteractive({ useHandCursor: true });
    zone.on("pointerover", () => image.setTexture(texture === "button-primary" ? "button-selected" : "button-primary"));
    zone.on("pointerout", () => image.setTexture(texture));
    zone.on("pointerdown", callback);
    return { image, text, zone };
  }

  makeModeButton(x, y, key) {
    const mode = GAME_MODES[key];
    const rect = this.add.rectangle(x, y, 138, 38, 0x111820, 0.92).setOrigin(0).setStrokeStyle(2, 0x4b5961, 1);
    const strip = this.add.rectangle(x, y, 4, 38, 0x33b54b, 0.58).setOrigin(0);
    const label = this.add.text(x + 69, y + 20, mode.label, {
      fontSize: "12px",
      fontStyle: "700",
      color: "#f4efe4"
    }).setOrigin(0.5);
    const zone = this.add.zone(x, y, 138, 38).setOrigin(0).setInteractive({ useHandCursor: true });
    zone.on("pointerdown", () => {
      this.selectedMode = key;
      this.refreshModes();
    });
    return { key, rect, strip, label };
  }

  readHighScore(mode = null) {
    try {
      if (mode) {
        return Number(window.localStorage.getItem(`ostatni-kurs-highscore-${mode}`) || 0);
      }
      // Return global high score (max of all modes)
      const modes = ["last", "training", "rush", "night"];
      let best = Number(window.localStorage.getItem("ostatni-kurs-highscore") || 0);
      modes.forEach((m) => {
        const val = Number(window.localStorage.getItem(`ostatni-kurs-highscore-${m}`) || 0);
        if (val > best) best = val;
      });
      return best;
    } catch (_) {
      return 0;
    }
  }

  refreshButtons() {
    [this.konstalButton, this.pesaButton].forEach((button) => {
      const active = button.key === this.selected;
      button.glow.setFillStyle(active ? 0x033968 : 0x071017, active ? 0.36 : 0.12);
      button.glow.setStrokeStyle(2, active ? 0xffb22e : 0x4b5961, active ? 0.96 : 0.5);
      button.bg.setTint(active ? 0xffe0a6 : 0xffffff);
      button.badge.setFillStyle(active ? 0xffb22e : 0x33b54b, active ? 0.96 : 0.74);
      button.badgeText.setColor(active ? "#10131a" : "#10131a");
      button.label.setColor(active ? "#ffb22e" : "#f4efe4");
      button.stats.setColor(active ? "#f4efe4" : "#c6c1b8");
      button.tram.setAlpha(active ? 1 : 0.65);
      if (button.rear) button.rear.setAlpha(active ? 0.92 : 0.5);
    });
  }

  refreshModes() {
    this.modeButtons.forEach((button) => {
      const active = button.key === this.selectedMode;
      button.rect.setFillStyle(active ? 0xf4d35e : 0x111820, active ? 0.95 : 0.92);
      button.rect.setStrokeStyle(2, active ? 0xf4efe4 : 0x4b5961, 1);
      button.strip.setFillStyle(active ? 0x33b54b : 0x033968, active ? 1 : 0.55);
      button.label.setColor(active ? "#111319" : "#f4efe4");
    });
    this.modeDescription.setText(GAME_MODES[this.selectedMode].description);
    const modeRecord = this.readHighScore(this.selectedMode);
    this.modeRecordText.setText(modeRecord > 0 ? `Rekord ${GAME_MODES[this.selectedMode].label}: ${modeRecord}` : "");
  }
}
