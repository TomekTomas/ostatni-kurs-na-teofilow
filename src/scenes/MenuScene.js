import { HEIGHT, WIDTH } from "../config/constants.js";
import { VEHICLES } from "../config/vehicles.js";
import { GAME_MODES } from "../config/modes.js";
import { missionResults } from "../logic/missions.js";
import { achievementProgress } from "../logic/achievements.js";
import { createDailyChallenge } from "../logic/dailyChallenge.js";
import { loadProfile, saveProfile, sanitizeNickname } from "../services/profile.js";
import { loadSettings, saveSettings } from "../services/settings.js";
import { fetchDailyChallenge, syncPlayerProfile } from "../services/leaderboard.js";

export class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  create() {
    this.selected = "konstal";
    this.selectedMode = "last";
    this.currentTab = "GRAJ";
    this.profile = loadProfile();
    this.settings = loadSettings();
    this.dailyChallenge = createDailyChallenge();
    this.highScore = this.readHighScore();
    this.add.rectangle(0, 0, WIDTH, HEIGHT, 0x10131a).setOrigin(0);
    this.add.image(WIDTH / 2, 302, "bg-piotrkowska").setAlpha(0.86);
    this.add.rectangle(0, 0, WIDTH, HEIGHT, 0x070808, 0.2).setOrigin(0);
    this.add.rectangle(0, 526, WIDTH, 194, 0x202832, 0.92).setOrigin(0);
    this.add.tileSprite(0, 560, WIDTH, 96, "track").setOrigin(0).setAlpha(0.95);
    this.add.rectangle(0, 655, WIDTH, 65, 0x3f4448).setOrigin(0);
    this.add.tileSprite(0, 663, WIDTH, 26, "plac").setOrigin(0).setScale(0.62, 0.2).setAlpha(0.24);
    this.drawMenuChrome();

    this.add.image(WIDTH / 2, 59, "title-plaque").setOrigin(0.5).setScale(0.86, 0.68);
    this.add.text(WIDTH / 2, 39, "OSTATNI KURS", {
      fontSize: "31px",
      fontStyle: "700",
      color: "#ffb22e",
      stroke: "#111319",
      strokeThickness: 4
    }).setOrigin(0.5);
    this.add.text(WIDTH / 2, 80, "NA TEOFILÓW", {
      fontSize: "19px",
      fontStyle: "700",
      color: "#f4efe4",
      stroke: "#111319",
      strokeThickness: 3
    }).setOrigin(0.5);

    this.recordPanel = this.add.image(70, 156, "panel-hud").setOrigin(0).setScale(1.04, 1.25);
    this.add.text(98, 172, "REKORD", { fontSize: "15px", color: "#8ea0a8", fontStyle: "700" });
    this.add.text(98, 194, `${this.highScore}`, { fontSize: "32px", color: "#ffb22e", fontStyle: "700" });
    this.add.text(98, 236, "Linia 8: Zarzew -> Teofilów", { fontSize: "12px", color: "#f4efe4" });
    this.add.text(98, 256, "Cel: dowieź komplet pasażerów", { fontSize: "12px", color: "#d9d3c4" });
    this.add.rectangle(462, 222, 58, 58, 0x033968, 0.98).setStrokeStyle(2, 0xffb22e, 1);
    this.add.text(462, 216, "TT", { fontSize: "20px", fontStyle: "700", color: "#ffffff" }).setOrigin(0.5);
    this.add.text(462, 245, "TOMASZ TOMAS", { fontSize: "6px", fontStyle: "700", color: "#ffb22e" }).setOrigin(0.5);

    this.modeRecordText = this.add.text(98, 276, "", { fontSize: "11px", color: "#8ea0a8" });

    this.konstalButton = this.makeVehicleButton(596, 156, "konstal");
    this.pesaButton = this.makeVehicleButton(596, 286, "pesa");
    this.refreshButtons();

    this.previewRear = this.add.sprite(500, 610, "tram-konstal").setOrigin(0.5, 0.91).setScale(VEHICLES.konstal.spriteScale * 0.82);
    this.preview = this.add.sprite(850, 610, "tram-konstal").setOrigin(0.5, 0.91).setScale(VEHICLES.konstal.spriteScale * 0.82);
    this.add.image(640, 570, "route-pin").setScale(1.2);
    this.add.image(1080, 570, "route-pin").setScale(1.2);
    this.add.text(622, 598, "Zarzew", { fontSize: "14px", color: "#f4efe4" });
    this.add.text(1052, 598, "Teofilów", { fontSize: "14px", color: "#f4efe4" });

    this.add.image(70, 318, "panel-dark").setOrigin(0).setScale(1.04, 1.34);
    this.add.text(98, 340, "STEROWANIE", { fontSize: "17px", color: "#f4d35e", fontStyle: "700" });
    this.add.text(98, 372, [
      "A/D lub strzałki: nastawnik",
      "SPACJA: drzwi lub dzwonek",
      "Q/E: zwrotnica skręt/prosto",
      "P: pauza | R: restart"
    ], { fontSize: "12px", color: "#d9d3c4", lineSpacing: 3 });

    this.modePanel = this.add.image(70, 488, "panel-dark").setOrigin(0).setScale(1.04, 1.96);
    this.add.text(98, 510, "TRYB", { fontSize: "17px", color: "#f4d35e", fontStyle: "700" });
    this.modeButtons = [
      this.makeModeButton(98, 544, "last"),
      this.makeModeButton(256, 544, "training"),
      this.makeModeButton(98, 594, "rush"),
      this.makeModeButton(256, 594, "night")
    ];
    this.modeDescription = this.add.text(98, 642, "", { fontSize: "11px", color: "#d9d3c4", wordWrap: { width: 360, useAdvancedWrap: true } });
    this.refreshModes();

    this.startGlow = this.add.rectangle(904, 602, 280, 92, 0xffb22e, 0.14)
      .setOrigin(0)
      .setStrokeStyle(2, 0xffb22e, 0.42);
    this.startButton = this.makeImageButton(914, 612, "button-primary", "START", () => this.startSelectedGame());

    this.createMainTabs();
    this.input.keyboard.once("keydown-SPACE", () => {
      if (this.currentTab === "GRAJ") this.startSelectedGame();
    });
    fetchDailyChallenge().then((challenge) => {
      if (!this.scene.isActive()) return;
      this.dailyChallenge = challenge;
      if (this.currentTab === "WYZWANIE") this.showTab("WYZWANIE");
    });
  }

  drawMenuChrome() {
    const g = this.add.graphics();
    g.fillStyle(0x071017, 0.74);
    g.fillRoundedRect(54, 150, 500, 146, 10);
    g.fillRoundedRect(54, 304, 500, 158, 10);
    g.fillRoundedRect(54, 474, 500, 208, 10);
    g.fillRoundedRect(576, 150, 600, 266, 10);
    g.fillStyle(0x033968, 0.38);
    g.fillRoundedRect(64, 156, 480, 130, 8);
    g.fillRoundedRect(586, 156, 580, 112, 8);
    g.fillRoundedRect(586, 286, 580, 112, 8);
    g.fillStyle(0x33b54b, 0.92);
    g.fillRect(54, 150, 4, 146);
    g.fillRect(576, 150, 4, 266);
    g.fillStyle(0xffb22e, 0.82);
    g.fillRect(54, 474, 500, 3);
    g.fillRect(576, 150, 600, 3);
    g.lineStyle(1, 0xf4efe4, 0.14);
    g.strokeRoundedRect(54, 150, 500, 146, 10);
    g.strokeRoundedRect(54, 304, 500, 158, 10);
    g.strokeRoundedRect(54, 474, 500, 208, 10);
    g.strokeRoundedRect(576, 150, 600, 266, 10);
  }

  startSelectedGame() {
    this.requestImmersiveMode();
    this.showMissionPreview(() => {
      this.scene.start("PreloadGameScene", { vehicleKey: this.selected, modeKey: this.selectedMode });
    });
  }

  startDailyChallenge() {
    this.requestImmersiveMode();
    const challenge = this.dailyChallenge;
    this.scene.start("PreloadGameScene", {
      vehicleKey: challenge.vehicle,
      modeKey: challenge.mode,
      challenge
    });
  }

  requestImmersiveMode() {
    const hasTouch = this.sys.game.device.input.touch || navigator.maxTouchPoints > 0;
    const isStandalone = window.matchMedia?.("(display-mode: fullscreen)")?.matches
      || window.matchMedia?.("(display-mode: standalone)")?.matches;
    if (!hasTouch || isStandalone || document.fullscreenElement || document.webkitFullscreenElement) return;

    const root = document.documentElement;
    const enterFullscreen = root.requestFullscreen
      ? () => root.requestFullscreen({ navigationUI: "hide" })
      : root.webkitRequestFullscreen
        ? () => root.webkitRequestFullscreen()
        : null;
    if (!enterFullscreen) return;

    Promise.resolve(enterFullscreen())
      .then(() => {
        const lockOrientation = window.screen.orientation?.lock;
        if (typeof lockOrientation !== "function") return null;
        return lockOrientation.call(window.screen.orientation, "landscape").catch(() => null);
      })
      .catch(() => {});
  }

  createMainTabs() {
    const tabs = [
      { label: "GRAJ", width: 112 },
      { label: "WYZWANIE", width: 176 },
      { label: "OSIĄGNIĘCIA", width: 200 },
      { label: "USTAWIENIA", width: 176 }
    ];
    const totalWidth = tabs.reduce((sum, tab) => sum + tab.width, 0);
    let x = (WIDTH - totalWidth) / 2;
    this.tabBar = this.add.container(0, 0).setDepth(3000);
    tabs.forEach(({ label, width: tabWidth }) => {
      const width = tabWidth - 8;
      const bg = this.add.rectangle(x, 110, width, 36, label === "GRAJ" ? 0xffb22e : 0x071017, 0.98)
        .setOrigin(0)
        .setStrokeStyle(1, label === "GRAJ" ? 0xf4efe4 : 0x4b5961, 0.9)
        .setInteractive({ useHandCursor: true });
      const text = this.add.text(x + width / 2, 128, label, {
        fontSize: "12px", fontStyle: "700", color: label === "GRAJ" ? "#10131a" : "#f4efe4"
      }).setOrigin(0.5);
      bg.on("pointerdown", () => this.showTab(label));
      this.tabBar.add([bg, text]);
      if (!this.tabButtons) this.tabButtons = [];
      this.tabButtons.push({ label, bg, text });
      x += tabWidth;
    });
  }

  showTab(label) {
    this.currentTab = label;
    this.tabButtons.forEach((button) => {
      const active = button.label === label;
      button.bg.setFillStyle(active ? 0xffb22e : 0x071017, 0.98);
      button.bg.setStrokeStyle(1, active ? 0xf4efe4 : 0x4b5961, 0.9);
      button.text.setColor(active ? "#10131a" : "#f4efe4");
    });
    this.tabOverlay?.destroy();
    this.tabOverlay = null;
    if (label === "GRAJ") return;
    this.tabOverlay = this.add.container(0, 0).setDepth(2500);
    this.tabOverlay.add(this.add.rectangle(38, 160, WIDTH - 76, HEIGHT - 184, 0x0d1318, 0.985)
      .setOrigin(0)
      .setStrokeStyle(2, 0x4b5961, 1));
    this.tabOverlay.add(this.add.rectangle(38, 160, 6, HEIGHT - 184, 0x33b54b, 1).setOrigin(0));
    if (label === "WYZWANIE") this.renderChallengeTab();
    if (label === "OSIĄGNIĘCIA") this.renderAchievementsTab();
    if (label === "USTAWIENIA") this.renderSettingsTab();
  }

  addOverlayTitle(title, subtitle) {
    this.tabOverlay.add(this.add.text(78, 190, title, { fontSize: "28px", fontStyle: "700", color: "#ffb22e" }));
    this.tabOverlay.add(this.add.text(78, 230, subtitle, { fontSize: "13px", color: "#d9d3c4" }));
  }

  renderChallengeTab() {
    const challenge = this.dailyChallenge;
    this.addOverlayTitle("WYZWANIE DNIA", `Wspólne zasady dla wszystkich graczy • ${challenge.date} UTC`);
    const mode = GAME_MODES[challenge.mode];
    const vehicle = VEHICLES[challenge.vehicle];
    this.tabOverlay.add(this.add.rectangle(78, 282, 720, 250, 0x101820, 1).setOrigin(0).setStrokeStyle(2, 0x033968, 1));
    this.tabOverlay.add(this.add.text(112, 312, mode.label.toUpperCase(), { fontSize: "23px", fontStyle: "700", color: "#50d2c2" }));
    this.tabOverlay.add(this.add.text(112, 354, vehicle.name, { fontSize: "28px", fontStyle: "700", color: "#f4efe4" }));
    this.tabOverlay.add(this.add.text(112, 402, mode.description, {
      fontSize: "14px", color: "#d9d3c4", wordWrap: { width: 640, useAdvancedWrap: true }, lineSpacing: 5
    }));
    this.tabOverlay.add(this.add.text(112, 480, `Seed: ${challenge.seed}\nWersja zasad: ${challenge.rulesVersion} • próby bez limitu`, {
      fontSize: "11px", color: "#8ea0a8", lineSpacing: 4
    }));
    const play = this.add.rectangle(960, 410, 300, 104, 0xffb22e, 1).setInteractive({ useHandCursor: true });
    const playText = this.add.text(960, 410, "GRAJ WYZWANIE", { fontSize: "22px", fontStyle: "700", color: "#10131a" }).setOrigin(0.5);
    play.on("pointerdown", () => this.startDailyChallenge());
    this.tabOverlay.add([play, playText]);
    const best = this.profile.stats.dailyBest[challenge.date] || 0;
    this.tabOverlay.add(this.add.text(960, 486, `Twój rekord dnia: ${best}`, { fontSize: "13px", color: "#f4efe4" }).setOrigin(0.5));
  }

  renderAchievementsTab() {
    const progress = achievementProgress(this.profile);
    this.addOverlayTitle("OSIĄGNIĘCIA", `Odblokowano ${progress.filter(({ unlocked }) => unlocked).length}/${progress.length}`);
    progress.forEach((achievement, index) => {
      const column = index % 3;
      const row = Math.floor(index / 3);
      const x = 78 + column * 380;
      const y = 282 + row * 86;
      this.tabOverlay.add(this.add.rectangle(x, y, 346, 64, achievement.unlocked ? 0x103d2b : 0x101820, 1).setOrigin(0).setStrokeStyle(2, achievement.unlocked ? 0x33b54b : 0x34434b, 1));
      this.tabOverlay.add(this.add.text(x + 22, y + 18, achievement.unlocked ? "✓" : "•", { fontSize: "24px", fontStyle: "700", color: achievement.unlocked ? "#50d2c2" : "#56636c" }));
      this.tabOverlay.add(this.add.text(x + 60, y + 23, achievement.label, { fontSize: "13px", fontStyle: "700", color: achievement.unlocked ? "#f4efe4" : "#8ea0a8" }));
    });
    this.tabOverlay.add(this.add.text(78, 648, `Kursy: ${this.profile.stats.runs} • Ukończone: ${this.profile.stats.completed} • Pasażerowie: ${this.profile.stats.passengers} • Seria wyzwań: ${this.profile.stats.challengeStreak}`, { fontSize: "13px", color: "#d9d3c4" }));
  }

  renderSettingsTab() {
    this.addOverlayTitle("USTAWIENIA", "Profil, dźwięk, ruch i czytelność");
    this.tabOverlay.add(this.add.text(78, 282, `PROFIL: ${this.profile.nickname}`, { fontSize: "17px", fontStyle: "700", color: "#f4efe4" }));
    const nickButton = this.add.rectangle(450, 293, 190, 38, 0x033968, 1).setInteractive({ useHandCursor: true });
    const nickText = this.add.text(450, 293, "ZMIEŃ NICK", { fontSize: "12px", fontStyle: "700", color: "#f4efe4" }).setOrigin(0.5);
    nickButton.on("pointerdown", () => this.editNickname());
    this.tabOverlay.add([nickButton, nickText]);
    const volumeRows = [
      ["masterVolume", "Głośność główna"], ["musicVolume", "Muzyka"], ["effectsVolume", "Efekty"], ["weatherIntensity", "Pogoda"]
    ];
    volumeRows.forEach(([key, label], index) => this.addSettingStepper(key, label, 78, 350 + index * 56));
    const toggles = [
      ["screenShake", "Wstrząsy ekranu"], ["reducedMotion", "Ograniczone animacje"], ["highContrastSignals", "Kontrastowa sygnalizacja"]
    ];
    toggles.forEach(([key, label], index) => this.addSettingToggle(key, label, 720, 350 + index * 68));
  }

  addSettingStepper(key, label, x, y) {
    this.tabOverlay.add(this.add.text(x, y, label, { fontSize: "14px", color: "#f4efe4" }));
    const value = this.add.text(x + 390, y, `${Math.round(this.settings[key] * 100)}%`, { fontSize: "14px", fontStyle: "700", color: "#ffb22e" }).setOrigin(1, 0);
    const minus = this.add.rectangle(x + 430, y + 9, 38, 34, 0x111820, 1).setInteractive({ useHandCursor: true });
    const plus = this.add.rectangle(x + 526, y + 9, 38, 34, 0x111820, 1).setInteractive({ useHandCursor: true });
    this.tabOverlay.add([minus, plus, value, this.add.text(x + 430, y + 8, "−", { fontSize: "20px", color: "#f4efe4" }).setOrigin(0.5), this.add.text(x + 526, y + 8, "+", { fontSize: "20px", color: "#f4efe4" }).setOrigin(0.5)]);
    const change = (delta) => {
      this.settings = saveSettings({ ...this.settings, [key]: Math.round(Math.min(1, Math.max(0, this.settings[key] + delta)) * 10) / 10 });
      value.setText(`${Math.round(this.settings[key] * 100)}%`);
    };
    minus.on("pointerdown", () => change(-0.1));
    plus.on("pointerdown", () => change(0.1));
  }

  addSettingToggle(key, label, x, y) {
    const button = this.add.rectangle(x + 330, y + 10, 100, 38, this.settings[key] ? 0x33b54b : 0x26323a, 1).setInteractive({ useHandCursor: true });
    const value = this.add.text(x + 330, y + 10, this.settings[key] ? "TAK" : "NIE", { fontSize: "12px", fontStyle: "700", color: this.settings[key] ? "#10131a" : "#f4efe4" }).setOrigin(0.5);
    this.tabOverlay.add([this.add.text(x, y, label, { fontSize: "14px", color: "#f4efe4" }), button, value]);
    button.on("pointerdown", () => {
      this.settings = saveSettings({ ...this.settings, [key]: !this.settings[key] });
      button.setFillStyle(this.settings[key] ? 0x33b54b : 0x26323a, 1);
      value.setText(this.settings[key] ? "TAK" : "NIE").setColor(this.settings[key] ? "#10131a" : "#f4efe4");
    });
  }

  editNickname() {
    const value = window.prompt("Nick (3–16 znaków)", this.profile.nickname);
    if (value === null) return;
    const nickname = sanitizeNickname(value);
    if (!nickname) {
      window.alert("Nick musi mieć 3–16 znaków i może zawierać litery, cyfry, spację, _ oraz -.");
      return;
    }
    this.profile.nickname = nickname;
    saveProfile(this.profile);
    syncPlayerProfile(nickname).finally(() => {
      if (!this.scene.isActive()) return;
      this.profile = loadProfile();
      this.showTab("USTAWIENIA");
    });
    this.showTab("USTAWIENIA");
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
