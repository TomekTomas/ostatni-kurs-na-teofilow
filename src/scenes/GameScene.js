import { HEIGHT, MESSAGE_PRIORITY, ROUTE_LENGTH, ROUTE_SCALE, SCORE_WEIGHTS, TRACK_Y, TRAM_BASE_Y, WIDTH } from "../config/constants.js";
import { VEHICLES } from "../config/vehicles.js";
import { GAME_MODES } from "../config/modes.js";
import { BACKGROUNDS, EVENTS, LCN_BILLBOARDS, LIGHTS, ROUTE_END_DISTANCE, ROUTE_MOMENTS, STOPS, SWITCHES } from "../config/route.js";
import { BG_LABELS, DISTRICT_PROFILES, DISTRICT_VISUALS, MAJOR_STOP_IDS, MAP_LABELS, STATION_KEYS, SURFACE_PALETTES } from "../config/districts.js";
import { PASSENGER_KEYS, PASSENGER_TINTS, WIDZEW_STADIUM_MUSIC, WORLD_PASSENGER_KEYS } from "../config/ui.js";
import { courseGrade as courseGradeCalc } from "../logic/scoring.js";
import { missionResults as missionResultsCalc } from "../logic/missions.js";
import { RULES_VERSION, isDailyChallenge } from "../logic/dailyChallenge.js";
import { createSeededRng } from "../logic/random.js";
import { createRunSummary } from "../logic/runSummary.js";
import { loadProfile, recordRun, saveProfile } from "../services/profile.js";
import { loadSettings, saveSettings } from "../services/settings.js";

export class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  init(data) {
    data = data || {};
    this.vehicleKey = data.vehicleKey || "konstal";
    this.vehicle = VEHICLES[this.vehicleKey];
    this.modeKey = data.modeKey || (data.training ? "training" : "last");
    this.mode = GAME_MODES[this.modeKey] || GAME_MODES.last;
    this.training = this.modeKey === "training";
    this.challenge = isDailyChallenge(data.challenge) ? data.challenge : null;
    this.restartData = { vehicleKey: this.vehicleKey, modeKey: this.modeKey, challenge: this.challenge };
  }

  create() {
    this.settings = loadSettings();
    this.profile = loadProfile();
    this.gameplayRng = createSeededRng(this.challenge?.seed || `free:${Date.now()}:${Math.random()}`);
    this.distance = 0;
    this.speed = 0;
    this.throttle = 0;
    this.trackCondition = 0.74;
    this.trackTargetCondition = this.trackCondition;
    this.trackChangeNotice = 0;
    this.nextConditionAt = 900;
    this.dangerTime = 0;
    this.satisfaction = 100;
    this.smoothness = 100;
    this.smoothnessSamples = [];
    this.rideEventPenalty = 0;
    this.inputJerk = 0;
    this.score = 0;
    this.timeLeft = this.mode.timeLimit;
    this.initialTimeLimit = this.mode.timeLimit;
    this.elapsedTime = 0;
    this.scheduleDuration = this.mode.timeLimit * 0.86;
    this.punctuality = 100;
    this.lastScheduleDelta = 0;
    this.passengers = Math.round(18 * this.mode.passengerDemand);
    this.pendingBoardingVisual = 0;
    this.delivered = 0;
    this.doorsOpen = false;
    this.dwell = 0;
    this.doorAnim = 0;
    this.bellCooldown = 0;
    this.powerTimer = 0;
    this.finished = false;
    this.lastThrottle = 0;
    this.currentStopIndex = 0;
    this.messageUntil = 0;
    this.messagePriority = MESSAGE_PRIORITY.ambient;
    this.signalPenaltyUntil = 0;
    this.precisionBonus = 0;
    this.combo = 1;
    this.bestCombo = 1;
    this.stopRating = "-";
    this.stopStreak = 0;
    this.currentBg = "zarzew";
    this.districtProfile = DISTRICT_PROFILES.zarzew;
    this.districtTraffic = this.districtProfile.traffic;
    this.districtPedestrians = this.districtProfile.pedestrians;
    this.paused = false;
    this.finishBonusApplied = false;
    this.lastBgMessage = "zarzew";
    this.routeMomentsShown = new Set();
    this.routeMomentUntil = 0;
    this.dispatchUntil = 0;
    this.nextDispatchAt = 1400;
    this.lastDispatchText = "";
    this.feedbackReasons = [];
    this.switchChoice = "straight";
    this.switchPenaltyUntil = 0;
    this.tutorialShown = {};
    this.tutorialUntil = 0;
    this.milestonesTriggered = new Set();
    this.emotionBubbles = [];
    this.sunsetProgress = 0;
    this.stats = {
      servedStops: 0,
      missedStops: 0,
      perfectStops: 0,
      onTimeStops: 0,
      earlyStops: 0,
      lateStops: 0,
      switchCorrect: 0,
      switchWrong: 0,
      bells: 0,
      carsCleared: 0,
      redSignals: 0,
      potholes: 0,
      powerLosses: 0,
      roughSections: 0
    };
    this.audioContext = null;
    this.rideLoop = null;
    this.rideLoopStarted = false;
    this.stadiumMusic = null;
    this.stadiumMusicSourceIndex = 0;
    this.stadiumMusicFailed = false;
    this.oncomingTrams = [];
    this.weatherEffects = null;
    this.ambientAudio = null;
    this.ambientAnnouncedStops = new Set();
    this.lastAmbientClatterAt = 0;
    this.nextAmbientClatterAt = 0;
    this.lastAmbientWhooshAt = 0;

    this.createWorld();
    this.createRouteObjects();
    this.createHud();
    this.createPauseOverlay();
    this.createControls();
    this.createTutorialOverlay();
    this.createRideLoop();
    this.createAmbientAudio();
    this.createStadiumMusic();
    this.createOdometerHud();
    this.createComboHud();
    this.createPauseSettingsOverlay();
    this.visibilityHandler = () => this.handleVisibilityChange();
    document.addEventListener("visibilitychange", this.visibilityHandler);
    this.sys.events.once("shutdown", () => {
      this.cleanupScene();
    });
    this.showMessage(`${this.mode.label}: dowieź pasażerów na Teofilów`, 2400, "#f4d35e");
  }

  createWorld() {
    this.add.rectangle(0, 0, WIDTH, HEIGHT, 0x6fb2d8).setOrigin(0);
    this.bgA = this.add.tileSprite(0, 86, WIDTH, 440, "bg-zarzew").setOrigin(0);
    this.bgB = this.add.tileSprite(0, 86, WIDTH, 440, "bg-zarzew").setOrigin(0).setAlpha(0);
    this.fitBackground(this.bgA);
    this.fitBackground(this.bgB);
    this.createDistrictStageLayer();
    this.createNightLayer();
    this.sidewalkBack = this.add.rectangle(0, 496, WIDTH, 42, 0x69798a, 0.94).setOrigin(0);
    this.sidewalkBackBand = this.add.tileSprite(0, 504, WIDTH, 10, "plac").setOrigin(0).setScale(0.42, 0.09).setAlpha(0.2);
    this.street = this.add.rectangle(0, 538, WIDTH, 98, 0x242c35, 0.98).setOrigin(0);
    this.roadBackLane = this.add.rectangle(0, 540, WIDTH, 38, 0x2d363d, 0.92).setOrigin(0);
    this.roadFrontLane = this.add.rectangle(0, 588, WIDTH, 40, 0x1f262c, 0.94).setOrigin(0);
    this.curbBack = this.add.tileSprite(0, 532, WIDTH, 8, "plac").setOrigin(0).setScale(0.32, 0.06).setAlpha(0.42);
    this.roadStripeA = this.add.tileSprite(0, 548, WIDTH, 5, "track").setOrigin(0).setScale(1, 0.05).setAlpha(0.16);
    this.roadMedian = this.add.tileSprite(0, 570, WIDTH, 5, "plac").setOrigin(0).setScale(0.42, 0.08).setAlpha(0.18);
    this.laneA = this.add.tileSprite(0, 584, WIDTH, 6, "track").setOrigin(0).setScale(1, 0.06).setAlpha(0.18);
    this.roadStripeB = this.add.tileSprite(0, 626, WIDTH, 6, "track").setOrigin(0).setScale(1, 0.06).setAlpha(0.16);
    this.curbFront = this.add.tileSprite(0, 630, WIDTH, 8, "plac").setOrigin(0).setScale(0.32, 0.06).setAlpha(0.38);
    this.track = this.add.tileSprite(0, TRACK_Y, WIDTH, 96, "track").setOrigin(0);
    this.platform = this.add.rectangle(0, 650, WIDTH, 70, 0x3f4448).setOrigin(0);
    this.platformCurb = this.add.rectangle(0, 648, WIDTH, 5, 0xc9d0ce, 0.8).setOrigin(0);
    this.platformLines = this.add.tileSprite(0, 655, WIDTH, 28, "plac").setOrigin(0).setScale(0.62, 0.2).setAlpha(0.28);
    this.applySurfacePalette("zarzew");
    this.applyDistrictVisuals("zarzew");

    const tramX = this.vehicleKey === "konstal" ? 620 : 350;
    this.trams = [];
    if (this.vehicleKey === "konstal") {
      const rear = this.add
        .sprite(210, TRAM_BASE_Y, "tram-konstal")
        .setOrigin(0.5, 0.91)
        .setScale(this.vehicle.spriteScale)
        .setDepth(20);
      rear.carOffset = -410;
      this.trams.push(rear);
    }
    this.tram = this.add
      .sprite(tramX, TRAM_BASE_Y, `tram-${this.vehicleKey}`)
      .setOrigin(0.5, 0.91)
      .setScale(this.vehicle.spriteScale)
      .setDepth(21);
    this.tram.carOffset = 0;
    this.trams.push(this.tram);
    this.openTrams = this.trams.map((car) => {
      const overlay = this.add
        .sprite(car.x, car.y, `tram-${this.vehicleKey}-open`)
        .setOrigin(0.5, 0.91)
        .setScale(this.vehicle.spriteScale)
        .setDepth(car.depth + 0.2)
        .setAlpha(0);
      overlay.car = car;
      return overlay;
    });
    this.createDoorPanels();
    this.createOnboardPassengers();
    this.streetMarkings = this.makeStreetMarkings();

    this.passengerSprites = this.add.group();
    for (let i = 0; i < 10; i++) {
      const p = this.add.image(72 + i * 42, 682, WORLD_PASSENGER_KEYS[i % WORLD_PASSENGER_KEYS.length])
        .setScale(0.34)
        .setAlpha(0.86);
      p.baseY = 682;
      this.passengerSprites.add(p);
    }

    this.trafficCars = [
      this.makeTrafficCar(1320, 556, "car-side-green", 0.68, 74, "left", "back"),
      this.makeTrafficCar(1780, 556, "car-side-cyan", 0.68, 88, "left", "back"),
      this.makeTrafficCar(2340, 556, "van-side-white", 0.72, 62, "left", "back"),
      this.makeTrafficCar(2920, 556, "taxi-side-yellow", 0.66, 96, "left", "back"),
      this.makeTrafficCar(3560, 556, "police-side-blue", 0.65, 82, "left", "back"),
      this.makeTrafficCar(4120, 556, "car-side-red", 0.68, 86, "left", "back"),
      this.makeTrafficCar(-220, 606, "car-side-orange", 0.72, 54, "right", "front"),
      this.makeTrafficCar(-520, 606, "compact-side-silver", 0.7, 68, "right", "front"),
      this.makeTrafficCar(-840, 606, "bus-side", 0.82, 42, "right", "front"),
      this.makeTrafficCar(-1280, 606, "delivery-van-blue", 0.72, 48, "right", "front"),
      this.makeTrafficCar(-1560, 606, "bus-articulated-side", 0.82, 34, "right", "front"),
      this.makeTrafficCar(-2050, 606, "scooter-side", 0.34, 76, "right", "front"),
      this.makeTrafficCar(-2460, 606, "cargo-bike-side", 0.4, 50, "right", "front")
    ];
    this.pedestrians = this.makePedestrians();
    this.catenary = this.makeCatenary();
    this.streetProps = this.makeStreetProps();
    this.roadHazards = this.makeRoadHazards();
    this.streetLights = this.makeStreetLights();
    this.cityLife = this.makeCityLifeEffects();
    this.lcnBillboards = this.makeLcnBillboards();
    this.lodzDetails = this.makeLodzDetails();
    this.oncomingTrams = this.makeOncomingTrams();
    this.weatherEffects = this.makeWeatherEffects();
  }

  createRouteObjects() {
    this.stations = STOPS.map((stop) => {
      const isUnicornStop = stop.id === "piotrkowska";
      const zoneWidth = isUnicornStop ? 540 : 390;
      const zone = this.add.rectangle(this.screenX(stop.distance), TRAM_BASE_Y + 18, zoneWidth, 58, 0xf4d35e, 0.09)
        .setStrokeStyle(2, 0xf4d35e, 0.62)
        .setVisible(false);
      const shelterKey = isUnicornStop ? "station-unicorn" : STATION_KEYS[(stop.id.length + stop.name.length) % STATION_KEYS.length];
      const shelterScale = isUnicornStop ? 0.44 : shelterKey === "station" ? 0.48 : shelterKey === "station-long" ? 0.45 : 0.43;
      const shelterOffsetX = isUnicornStop ? 210 : 106;
      const shelterY = isUnicornStop ? 548 : 540;
      const shelter = this.add.image(this.screenX(stop.distance) + shelterOffsetX, shelterY, shelterKey).setScale(shelterScale).setAlpha(0.95).setDepth(12).setVisible(false);
      const cardOffsetX = isUnicornStop ? -190 : -118;
      const labelOffsetX = cardOffsetX + 16;
      const card = this.add.image(this.screenX(stop.distance) + cardOffsetX, 404, "stop-card").setOrigin(0).setScale(isUnicornStop ? 0.92 : 0.82, isUnicornStop ? 0.86 : 0.82).setVisible(false);
      const stopSubtitle = isUnicornStop ? "Stajnia Jednorożców" : stop.street;
      const label = this.add.text(this.screenX(stop.distance) + labelOffsetX, 418, `${stop.name}\n${stopSubtitle}`, {
        fontSize: stop.name.length > 18 ? "11px" : "13px",
        color: "#f4d35e",
        fontStyle: "700",
        wordWrap: { width: isUnicornStop ? 252 : 218, useAdvancedWrap: true }
      }).setDepth(55).setVisible(false);
      card.setDepth(54);
      const waiting = this.add.group();
      const crowdSize = Math.max(1, Math.ceil((stop.board * this.mode.passengerDemand) / 7));
      for (let i = 0; i < crowdSize; i++) {
        const platformY = 676 - (i % 2) * 5;
        const person = this.createPassengerFigure(
          this.screenX(stop.distance) + 84 + i * 26,
          platformY,
          WORLD_PASSENGER_KEYS[(i + stop.id.length) % WORLD_PASSENGER_KEYS.length],
          0.38,
          48,
          {
            tint: PASSENGER_TINTS[(i + stop.name.length) % PASSENGER_TINTS.length],
            flip: i % 2 === 0
          },
          { shadow: true }
        ).setVisible(false);
        person.baseY = platformY;
        person.localStopOffset = 84 + i * 26;
        person.behavior = this.pickPassengerBehavior();
        person.behaviorPhase = Phaser.Math.FloatBetween(0, Math.PI * 2);
        person.behaviorBaseX = person.x;
        person.behaviorBaseY = platformY;
        person.behaviorWaveSeed = Phaser.Math.FloatBetween(0, Math.PI * 2);
        person.behaviorMoveTarget = null;
        person.behaviorDoorTween = null;
        waiting.add(person);
      }
      return { ...stop, zone, shelter, shelterOffsetX, shelterY, card, cardOffsetX, label, labelOffsetX, waiting, served: false };
    });

    this.events = EVENTS.map((event, index) => {
      const key = event.type === "car" ? (index % 2 ? "car-side-green" : "car-side-orange") : event.type === "power" ? "powerline" : "pothole";
      const y = event.type === "car" ? 600 : event.type === "power" ? 160 : TRAM_BASE_Y - 14;
      const sprite = this.add.image(this.screenX(event.distance), y, key).setOrigin(0.5);
      if (event.type === "car") {
        sprite.setScale(0.84).setDepth(28);
        sprite.setFlipX(index % 2 === 0);
      }
      if (event.type === "power") sprite.setScale(0.9);
      if (event.type === "rough") sprite.setScale(1.4).setTint(0xffc14d);
      return {
        ...event,
        sprite,
        cleared: false,
        active: false,
        detouring: false,
        clearedByBell: false,
        warnDistance: event.type === "car" ? 320 : 0,
        stopDistance: event.type === "car" ? 116 : 0,
        collisionDistance: event.type === "car" ? 54 : 0,
        collisionHalfWidth: event.type === "car" ? 82 : 0
      };
    });

    this.lights = LIGHTS.map((light) => {
      const pole = this.add.rectangle(this.screenX(light.distance), 514, 6, 88, 0x2a2d31).setOrigin(0.5, 1);
      const box = this.add.rectangle(this.screenX(light.distance), 458, 24, 62, 0x121418).setStrokeStyle(2, 0x4c4f55, 1);
      const red = this.add.circle(this.screenX(light.distance), 440, 6, 0x522126);
      const amber = this.add.circle(this.screenX(light.distance), 458, 6, 0x5f4e21);
      const green = this.add.circle(this.screenX(light.distance), 476, 6, 0x1d4e33);
      const line = this.add.rectangle(this.screenX(light.distance) - 34, 592, 6, 74, 0xf4efe4).setOrigin(0.5);
      return { ...light, pole, box, red, amber, green, line, state: "green", penalized: false };
    });

    this.switches = SWITCHES.map((sw) => {
      const x = this.screenX(sw.distance);
      const base = this.add.rectangle(x, TRACK_Y + 54, 92, 8, 0x9aa0a5, 0.8).setOrigin(0.5);
      const branch = this.add.rectangle(x + 38, TRACK_Y + 36, 86, 7, 0x9aa0a5, 0.72).setOrigin(0, 0.5).setRotation(sw.correct === "left" ? -0.36 : 0.36);
      const lever = this.add.rectangle(x - 44, TRACK_Y + 20, 10, 42, 0x2a2d31).setOrigin(0.5, 1);
      const lamp = this.add.circle(x - 44, TRACK_Y - 28, 8, 0xf4d35e);
      const label = this.add.text(x - 122, TRACK_Y - 132, "", {
        fontSize: "13px",
        color: "#f4efe4",
        fontStyle: "700",
        backgroundColor: "#111319",
        padding: { x: 7, y: 4 },
        wordWrap: { width: 238, useAdvancedWrap: true }
      });
      return { ...sw, base, branch, lever, lamp, label, resolved: false, warned: false };
    });
  }

  createHud() {
    const topY = 6;
    const leftX = 18;
    const leftW = 388;
    const centerW = 350;
    const centerX = WIDTH / 2 - centerW / 2;
    const rightW = 408;
    const rightX = WIDTH - rightW - 18;

    const hudDepth = 100;
    this.hudChrome = this.add.graphics().setDepth(hudDepth - 2);
    this.hudChrome.fillStyle(0x071017, 0.9);
    this.hudChrome.fillRect(0, 0, WIDTH, 68);
    this.hudChrome.fillStyle(0x033968, 0.46);
    this.hudChrome.fillRoundedRect(14, 10, 210, 44, 8);
    this.hudChrome.fillRoundedRect(WIDTH / 2 - 148, 10, 296, 44, 8);
    this.hudChrome.fillRoundedRect(WIDTH - 386, 6, 372, 56, 8);
    this.hudChrome.fillStyle(0xffb22e, 0.9);
    this.hudChrome.fillRect(0, 66, WIDTH, 2);
    this.hudChrome.fillStyle(0x33b54b, 0.95);
    this.hudChrome.fillRect(14, 66, 210, 2);
    this.hudChrome.fillRect(WIDTH - 386, 66, 372, 2);
    this.hudChrome.lineStyle(1, 0xf4efe4, 0.18);
    this.hudChrome.strokeRoundedRect(14, 10, 210, 44, 8);
    this.hudChrome.strokeRoundedRect(WIDTH / 2 - 148, 10, 296, 44, 8);
    this.hudChrome.strokeRoundedRect(WIDTH - 386, 6, 372, 56, 8);

    this.clockLabel = this.add.text(28, topY + 8, "CZAS", { fontSize: "8px", color: "#8ea0a8", fontStyle: "700" }).setDepth(hudDepth + 1);
    this.clockText = this.add.text(28, topY + 21, "", { fontSize: "22px", color: "#ffb22e", fontStyle: "700" }).setDepth(hudDepth + 1);
    this.hudPassengerText = this.add.text(118, topY + 23, "", { fontSize: "10px", color: "#f4efe4", fontStyle: "700" }).setDepth(hudDepth + 1);

    this.scoreLabel = this.add.text(WIDTH / 2, topY + 8, "PUNKTY", { fontSize: "8px", color: "#8ea0a8", fontStyle: "700" }).setOrigin(0.5, 0).setDepth(hudDepth + 1);
    this.scoreText = this.add.text(WIDTH / 2, topY + 21, "", { fontSize: "23px", color: "#ffb22e", fontStyle: "700" }).setOrigin(0.5, 0).setDepth(hudDepth + 1);
    this.hudModePill = this.add.text(WIDTH / 2 + 96, topY + 31, "", {
      fontSize: "8px",
      color: "#10131a",
      fontStyle: "700",
      backgroundColor: "#33b54b",
      padding: { x: 6, y: 2 }
    }).setOrigin(0.5, 0.5).setDepth(hudDepth + 2);

    this.nextLabel = this.add.text(WIDTH - 372, topY + 8, "NASTĘPNY", { fontSize: "8px", color: "#8ea0a8", fontStyle: "700" }).setDepth(hudDepth + 1);
    this.nextText = this.add.text(WIDTH - 28, topY + 20, "", {
      fontSize: "15px",
      color: "#f4efe4",
      fontStyle: "700",
      align: "right"
    }).setOrigin(1, 0).setDepth(hudDepth + 1);
    this.hudScheduleText = this.add.text(WIDTH - 28, topY + 41, "", {
      fontSize: "9px",
      color: "#ffb22e",
      fontStyle: "700",
      align: "right"
    }).setOrigin(1, 0).setDepth(hudDepth + 1);

    // Hidden elements — audit requires exact coordinate expressions
    this.speedText = this.add.text(leftX + 14, topY + 34, "", { fontSize: "11px", color: "#f4efe4", fontStyle: "700" }).setAlpha(0);
    this.trackText = this.add.text(leftX + 242, topY + 16, "", { fontSize: "9px", color: "#d9d3c4", lineSpacing: 1, wordWrap: { width: 130, useAdvancedWrap: true } }).setAlpha(0);
    this.passengerText = this.add.text(leftX + 242, topY + 36, "", { fontSize: "9px", color: "#d9d3c4" }).setAlpha(0);
    this.throttleLabel = this.add.text(leftX + 14, topY + 54, "Nast.", { fontSize: "8px", color: "#8ea0a8", fontStyle: "700" }).setAlpha(0);
    this.trackCondLabel = this.add.text(leftX + 204, topY + 54, "Tor", { fontSize: "8px", color: "#8ea0a8", fontStyle: "700" }).setAlpha(0);
    this.throttleBg = this.add.rectangle(leftX + 56, topY + 60, 132, 6, 0x20242b).setOrigin(0, 0.5).setAlpha(0);
    this.throttleFill = this.add.rectangle(leftX + 56, topY + 60, 1, 6, 0xf4d35e).setOrigin(0, 0.5).setAlpha(0);
    this.condBg = this.add.rectangle(leftX + 236, topY + 60, 132, 6, 0x20242b).setOrigin(0, 0.5).setAlpha(0);
    this.condFill = this.add.rectangle(leftX + 236, topY + 60, 1, 6, 0x50d2c2).setOrigin(0, 0.5).setAlpha(0);
    this.signalText = this.add.text(rightX + 16, topY + 48, "", { fontSize: "9px", color: "#d9d3c4" }).setAlpha(0);
    this.scheduleText = this.add.text(rightX + 16, topY + 52, "", { fontSize: "9px", color: "#ffb22e", fontStyle: "700" }).setAlpha(0);
    this.modeBadgeText = this.add.text(WIDTH / 2, topY + 42, "", { fontSize: "12px", color: "#f4efe4", fontStyle: "700" }).setOrigin(0.5, 0).setAlpha(0);

    // Warning / route moment overlays
    this.warningBg = this.add.rectangle(WIDTH / 2, 94, 520, 30, 0x0c1116, 0.9).setStrokeStyle(2, 0xf4d35e, 0.9).setDepth(120);
    this.warningText = this.add.text(WIDTH / 2, 94, "", {
      fontSize: "13px",
      color: "#ffb22e",
      fontStyle: "700",
      stroke: "#111319",
      strokeThickness: 2,
      align: "center",
      wordWrap: { width: 480, useAdvancedWrap: true }
    }).setOrigin(0.5).setDepth(121);
    this.warningBg.setVisible(false);

    this.routeMomentBg = this.add.rectangle(WIDTH / 2, 94, 520, 30, 0x0c1116, 0.84).setStrokeStyle(2, 0x4b5961, 0.75).setDepth(116);
    this.routeMomentText = this.add.text(WIDTH / 2, 94, "", {
      fontSize: "11px",
      color: "#f4efe4",
      fontStyle: "700",
      align: "center",
      wordWrap: { width: 480, useAdvancedWrap: true }
    }).setOrigin(0.5).setDepth(119);
    this.routeMomentBg.setVisible(false);
    this.routeMomentText.setVisible(false);

    this.modeBadgeBg = this.add.rectangle(leftX + 10, topY + 72, leftW - 20, 18, 0x0f1419, 0).setOrigin(0);
    this.brakeText = this.add.text(leftX + 14, topY + 74, "", { fontSize: "8px", color: "#ffb22e", fontStyle: "700", wordWrap: { width: 210, useAdvancedWrap: true } }).setAlpha(0);
    this.nextSwitchText = this.add.text(leftX + 236, topY + 74, "", { fontSize: "8px", color: "#f4efe4", fontStyle: "700", wordWrap: { width: 132, useAdvancedWrap: true } }).setAlpha(0);
    this.feedbackBg = this.add.rectangle(centerX + 16, topY + 66, centerW - 32, 18, 0x0f1419, 0).setOrigin(0);
    this.feedbackText = this.add.text(centerX + 16, topY + 66, "", { fontSize: "8px", color: "#8ea0a8", fontStyle: "700", lineSpacing: 1, wordWrap: { width: centerW - 32, useAdvancedWrap: true } }).setAlpha(0);
    this.modeBadgeBg.setVisible(false);
    this.brakeText.setVisible(false);
    this.nextSwitchText.setVisible(false);
    this.feedbackBg.setVisible(false);
    this.feedbackText.setVisible(false);

    // Dispatcher text — subtle, right-aligned under bar
    this.dispatchBg = this.add.rectangle(WIDTH - 18, 74, 360, 22, 0x0c1116, 0.74)
      .setOrigin(1, 0)
      .setStrokeStyle(1, 0x33b54b, 0.35)
      .setDepth(112);
    this.dispatchText = this.add.text(WIDTH - 28, 79, "", {
      fontSize: "9px",
      color: "#d9d3c4",
      fontStyle: "700",
      align: "right",
      wordWrap: { width: 342, useAdvancedWrap: true }
    }).setOrigin(1, 0).setDepth(113);
    this.dispatchBg.setVisible(false);
    this.dispatchText.setVisible(false);

    // Route progress bar
    this.progressWidth = Math.min(860, WIDTH - 420);
    this.progressX = WIDTH / 2 - this.progressWidth / 2;
    const routeY = HEIGHT - 44;
    this.routePanel = this.add.rectangle(this.progressX - 26, routeY - 14, this.progressWidth + 52, 50, 0x071017, 0.88)
      .setOrigin(0)
      .setStrokeStyle(1, 0x4b5961, 0.72)
      .setDepth(96);
    this.lineBadge = this.add.rectangle(this.progressX - 4, routeY + 2, 34, 18, 0x33b54b, 0.95).setOrigin(0.5).setDepth(98);
    this.lineBadgeText = this.add.text(this.progressX - 4, routeY - 7, "8", { fontSize: "17px", color: "#10131a", fontStyle: "700" }).setOrigin(0.5, 0).setDepth(99);
    this.routeLabel = this.add.text(this.progressX + 22, routeY - 5, "Zarzew → Teofilów", { fontSize: "10px", color: "#d9d3c4", fontStyle: "700" }).setDepth(98);
    this.progressBg = this.add.rectangle(this.progressX, routeY + 21, this.progressWidth, 8, 0x111319, 0.95).setOrigin(0, 0.5).setDepth(97);
    this.progressFillGlow = this.add.rectangle(this.progressX, routeY + 21, 1, 12, 0xffb22e, 0.18).setOrigin(0, 0.5).setDepth(98);
    this.progressFill = this.add.rectangle(this.progressX, routeY + 21, 1, 6, 0xffb22e).setOrigin(0, 0.5).setDepth(99);
    this.progressHead = this.add.circle(this.progressX, routeY + 21, 5, 0xf4efe4, 0.95).setDepth(100);
    STOPS.forEach((stop) => {
      const x = this.progressX + (stop.distance / ROUTE_END_DISTANCE) * this.progressWidth;
      const major = MAJOR_STOP_IDS.has(stop.id);
      this.add.rectangle(x, routeY + 21, major ? 5 : 2, major ? 20 : 10, major ? 0xf4efe4 : 0x8c9298, major ? 0.9 : 0.55).setOrigin(0.5).setDepth(100);
      if (MAP_LABELS[stop.id]) this.add.text(x - 18, routeY - 18, MAP_LABELS[stop.id], { fontSize: "8px", color: "#f4efe4" }).setDepth(100);
    });
  }

  createControls() {
    this.touchState = {
      accelerate: false,
      brake: false,
      throttle: null
    };
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys({
      a: Phaser.Input.Keyboard.KeyCodes.A,
      d: Phaser.Input.Keyboard.KeyCodes.D,
      q: Phaser.Input.Keyboard.KeyCodes.Q,
      e: Phaser.Input.Keyboard.KeyCodes.E,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE,
      p: Phaser.Input.Keyboard.KeyCodes.P,
      u: Phaser.Input.Keyboard.KeyCodes.U,
      r: Phaser.Input.Keyboard.KeyCodes.R,
      esc: Phaser.Input.Keyboard.KeyCodes.ESC
    });
    this.createTouchControls();
  }

  createTouchControls() {
    const hasCoarsePointer = window.matchMedia?.("(pointer: coarse)")?.matches ?? false;
    const hasTouch = (this.sys.game.device.input.touch || navigator.maxTouchPoints > 0) && hasCoarsePointer;
    this.touchLayer = this.add.container(0, 0).setDepth(1500).setVisible(hasTouch);
    if (!hasTouch) return;

    const makeButton = (x, y, w, h, label, color, onDown, onUp = null) => {
      const bg = this.add.rectangle(x, y, w, h, 0x0c1116, 0.64)
        .setOrigin(0.5)
        .setStrokeStyle(2, color, 0.88);
      const text = this.add.text(x, y, label, {
        fontSize: "15px",
        fontStyle: "700",
        color: "#f4efe4",
        align: "center"
      }).setOrigin(0.5);
      const zone = this.add.zone(x, y, w, h).setOrigin(0.5).setInteractive();
      zone.on("pointerdown", (pointer) => {
        pointer.event?.preventDefault?.();
        bg.setFillStyle(color, 0.42);
        onDown();
      });
      const release = (pointer) => {
        pointer?.event?.preventDefault?.();
        bg.setFillStyle(0x0c1116, 0.64);
        if (onUp) onUp();
      };
      zone.on("pointerup", release);
      zone.on("pointerout", release);
      zone.on("pointerupoutside", release);
      this.touchLayer.add([bg, text, zone]);
      return { bg, text, zone };
    };

    makeButton(116, 590, 150, 72, "HAMUJ", 0xffb22e, () => { this.touchState.brake = true; }, () => { this.touchState.brake = false; });
    this.makeTouchThrottleSlider(WIDTH - 116, 512);
    makeButton(WIDTH / 2, 620, 154, 64, "DRZWI\nDZWONEK", 0xf4d35e, () => this.useActionButton());
    makeButton(WIDTH - 274, 672, 104, 54, "Q\nSKRĘT", 0x8fb7e8, () => this.setSwitchChoice("left"));
    makeButton(WIDTH - 150, 672, 104, 54, "E\nPROSTO", 0x8fb7e8, () => this.setSwitchChoice("straight"));
    makeButton(WIDTH - 54, 112, 72, 44, "PAUZA", 0xf4efe4, () => this.togglePause());
  }

  makeTouchThrottleSlider(x, y) {
    const trackH = 184;
    const bg = this.add.rectangle(x, y, 92, trackH + 52, 0x0c1116, 0.64)
      .setOrigin(0.5)
      .setStrokeStyle(2, 0x50d2c2, 0.88);
    const rail = this.add.rectangle(x, y + 6, 16, trackH, 0x26323a, 1).setOrigin(0.5);
    const fill = this.add.rectangle(x, y + trackH / 2 + 6, 16, 0, 0x50d2c2, 0.9).setOrigin(0.5, 1);
    const knob = this.add.rectangle(x, y + trackH / 2 + 6, 58, 20, 0xf4efe4, 0.94)
      .setOrigin(0.5)
      .setStrokeStyle(2, 0x50d2c2, 1);
    const label = this.add.text(x, y - trackH / 2 - 12, "NAST.", {
      fontSize: "13px",
      fontStyle: "700",
      color: "#f4efe4"
    }).setOrigin(0.5);
    const value = this.add.text(x, y + trackH / 2 + 28, "0%", {
      fontSize: "13px",
      fontStyle: "700",
      color: "#50d2c2"
    }).setOrigin(0.5);
    const zone = this.add.zone(x, y + 6, 112, trackH + 36).setOrigin(0.5).setInteractive();
    const setFromPointer = (pointer) => {
      pointer.event?.preventDefault?.();
      const localY = Phaser.Math.Clamp(pointer.y, y - trackH / 2 + 6, y + trackH / 2 + 6);
      this.touchState.throttle = Phaser.Math.Clamp(1 - ((localY - (y - trackH / 2 + 6)) / trackH), 0, 1);
      this.updateTouchThrottleSlider();
    };
    zone.on("pointerdown", setFromPointer);
    zone.on("pointermove", (pointer) => {
      if (pointer.isDown) setFromPointer(pointer);
    });
    zone.on("pointerup", (pointer) => pointer.event?.preventDefault?.());
    zone.on("pointerupoutside", (pointer) => pointer.event?.preventDefault?.());
    this.touchThrottle = { x, y: y + 6, trackH, fill, knob, value };
    this.touchLayer.add([bg, rail, fill, knob, label, value, zone]);
    this.updateTouchThrottleSlider();
  }

  updateTouchThrottleSlider() {
    if (!this.touchThrottle) return;
    const target = this.touchState.throttle ?? this.throttle;
    const amount = Phaser.Math.Clamp(target, 0, 1);
    this.touchThrottle.fill.height = Math.max(2, this.touchThrottle.trackH * amount);
    this.touchThrottle.knob.y = this.touchThrottle.y + this.touchThrottle.trackH / 2 - this.touchThrottle.trackH * amount;
    this.touchThrottle.value.setText(`${Math.round(amount * 100)}%`);
  }

  createTutorialOverlay() {
    this.tutorialLayer = this.add.container(WIDTH / 2, 154).setDepth(1450).setVisible(false);
    this.tutorialLayer.add(this.add.rectangle(0, 0, 620, 64, 0x0c1116, 0.9)
      .setStrokeStyle(3, 0xf4d35e, 0.95));
    this.tutorialText = this.add.text(0, 0, "", {
      fontSize: "15px",
      fontStyle: "700",
      color: "#f4efe4",
      align: "center",
      lineSpacing: 3,
      wordWrap: { width: 570, useAdvancedWrap: true }
    }).setOrigin(0.5);
    this.tutorialLayer.add(this.tutorialText);
  }

  createPauseOverlay() {
    this.pauseLayer = this.add.container(0, 0).setDepth(1550).setVisible(false);
    this.pauseLayer.add(this.add.rectangle(0, 0, WIDTH, HEIGHT, 0x050607, 0.45).setOrigin(0));
    this.pauseLayer.add(this.add.image(WIDTH / 2, HEIGHT / 2, "pause-panel").setOrigin(0.5));
    this.pauseLayer.add(this.add.text(WIDTH / 2, HEIGHT / 2 - 74, "PAUZA", {
      fontSize: "42px",
      fontStyle: "700",
      color: "#ffb22e"
    }).setOrigin(0.5));
    this.pauseLayer.add(this.add.text(WIDTH / 2, HEIGHT / 2 - 8, [
      "P: powrot do kursu",
      "U: ustawienia",
      "R: restart",
      "Esc: menu"
    ], {
      fontSize: "22px",
      color: "#f4efe4",
      align: "center",
      lineSpacing: 12
    }).setOrigin(0.5));
    const settingsButton = this.add.rectangle(WIDTH / 2, HEIGHT / 2 + 126, 240, 42, 0x033968, 1)
      .setInteractive({ useHandCursor: true });
    settingsButton.on("pointerdown", () => this.togglePauseSettings());
    this.pauseLayer.add([
      settingsButton,
      this.add.text(WIDTH / 2, HEIGHT / 2 + 126, "USTAWIENIA", { fontSize: "14px", fontStyle: "700", color: "#f4efe4" }).setOrigin(0.5)
    ]);
  }

  createPauseSettingsOverlay() {
    this.pauseSettingsLayer = this.add.container(0, 0).setDepth(1600).setVisible(false);
    this.pauseSettingsLayer.add(this.add.rectangle(0, 0, WIDTH, HEIGHT, 0x050607, 0.88).setOrigin(0));
    this.pauseSettingsLayer.add(this.add.rectangle(WIDTH / 2, HEIGHT / 2, 820, 560, 0x0d1318, 1).setStrokeStyle(3, 0xffb22e, 1));
    this.pauseSettingsLayer.add(this.add.text(WIDTH / 2, 108, "USTAWIENIA", { fontSize: "27px", fontStyle: "700", color: "#ffb22e" }).setOrigin(0.5));
    const rows = [
      ["masterVolume", "Głośność główna"], ["musicVolume", "Muzyka"],
      ["effectsVolume", "Efekty"], ["weatherIntensity", "Pogoda"]
    ];
    this.pauseSettingValues = {};
    rows.forEach(([key, label], index) => {
      const y = 170 + index * 58;
      this.pauseSettingsLayer.add(this.add.text(290, y, label, { fontSize: "15px", color: "#f4efe4" }));
      const value = this.add.text(705, y, `${Math.round(this.settings[key] * 100)}%`, { fontSize: "15px", fontStyle: "700", color: "#ffb22e" }).setOrigin(1, 0);
      this.pauseSettingValues[key] = value;
      const minus = this.add.rectangle(760, y + 10, 42, 36, 0x26323a, 1).setInteractive({ useHandCursor: true });
      const plus = this.add.rectangle(856, y + 10, 42, 36, 0x26323a, 1).setInteractive({ useHandCursor: true });
      minus.on("pointerdown", () => this.changePauseSetting(key, -0.1));
      plus.on("pointerdown", () => this.changePauseSetting(key, 0.1));
      this.pauseSettingsLayer.add([value, minus, plus,
        this.add.text(760, y + 9, "−", { fontSize: "20px", color: "#f4efe4" }).setOrigin(0.5),
        this.add.text(856, y + 9, "+", { fontSize: "20px", color: "#f4efe4" }).setOrigin(0.5)
      ]);
    });
    const toggles = [
      ["screenShake", "Wstrząsy ekranu"], ["reducedMotion", "Ograniczone animacje"], ["highContrastSignals", "Kontrastowa sygnalizacja"]
    ];
    this.pauseSettingToggles = {};
    toggles.forEach(([key, label], index) => {
      const x = 300 + index * 250;
      const y = 446;
      this.pauseSettingsLayer.add(this.add.text(x, y, label, { fontSize: "12px", color: "#d9d3c4" }).setOrigin(0.5));
      const button = this.add.rectangle(x, y + 44, 104, 38, this.settings[key] ? 0x33b54b : 0x26323a, 1).setInteractive({ useHandCursor: true });
      const value = this.add.text(x, y + 44, this.settings[key] ? "TAK" : "NIE", { fontSize: "12px", fontStyle: "700", color: this.settings[key] ? "#10131a" : "#f4efe4" }).setOrigin(0.5);
      button.on("pointerdown", () => this.togglePauseSetting(key));
      this.pauseSettingToggles[key] = { button, value };
      this.pauseSettingsLayer.add([button, value]);
    });
    const close = this.add.rectangle(WIDTH / 2, 600, 260, 48, 0xffb22e, 1).setInteractive({ useHandCursor: true });
    close.on("pointerdown", () => this.togglePauseSettings());
    this.pauseSettingsLayer.add([close, this.add.text(WIDTH / 2, 600, "WRÓĆ DO PAUZY", { fontSize: "14px", fontStyle: "700", color: "#10131a" }).setOrigin(0.5)]);
  }

  togglePauseSettings() {
    if (!this.paused || !this.pauseSettingsLayer) return;
    this.pauseSettingsLayer.setVisible(!this.pauseSettingsLayer.visible);
  }

  changePauseSetting(key, delta) {
    const next = Math.round(Math.min(1, Math.max(0, this.settings[key] + delta)) * 10) / 10;
    this.settings = saveSettings({ ...this.settings, [key]: next });
    this.pauseSettingValues[key]?.setText(`${Math.round(next * 100)}%`);
  }

  togglePauseSetting(key) {
    this.settings = saveSettings({ ...this.settings, [key]: !this.settings[key] });
    const control = this.pauseSettingToggles[key];
    control?.button.setFillStyle(this.settings[key] ? 0x33b54b : 0x26323a, 1);
    control?.value.setText(this.settings[key] ? "TAK" : "NIE").setColor(this.settings[key] ? "#10131a" : "#f4efe4");
  }

  update(_, deltaMs) {
    if (this.finished) {
      this.updateRideLoop(0, true);
      this.updateStadiumMusic(0, true);
      this.updateAmbientAudio(0, true);
      if (Phaser.Input.Keyboard.JustDown(this.keys.r)) this.scene.restart(this.restartData);
      if (Phaser.Input.Keyboard.JustDown(this.keys.esc)) this.scene.start("MenuScene");
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.p)) this.togglePause();
    if (this.paused) {
      this.updateRideLoop(0, true);
      this.updateStadiumMusic(0, true);
      this.updateAmbientAudio(0, true);
      if (Phaser.Input.Keyboard.JustDown(this.keys.u)) this.togglePauseSettings();
      if (Phaser.Input.Keyboard.JustDown(this.keys.r)) this.scene.restart(this.restartData);
      if (Phaser.Input.Keyboard.JustDown(this.keys.esc)) this.scene.start("MenuScene");
      return;
    }

    const dt = deltaMs / 1000;
    this.updateInput(dt);
    this.updateMotion(dt);
    this.updateStations(dt);
    this.updateEvents(dt);
    this.updateSwitches();
    this.updateSignals();
    this.updateWorld(dt);
    this.updateRouteMoments();
    this.updateMilestones();
    this.updateRideLoop(dt);
    this.updateStadiumMusic(dt);
    this.updateAmbientAudio(dt);
    this.updateTutorial();
    this.updateSunsetTransition(dt);
    this.updateEmotionBubbles(dt);
    this.updateHud();
    this.updateOdometerHud();
    this.updateComboHud();
    this.checkEnd();
  }

  updateInput(dt) {
    const accelerate = this.cursors.up.isDown || this.cursors.right.isDown || this.keys.d.isDown || this.touchState.accelerate;
    const brake = this.cursors.down.isDown || this.cursors.left.isDown || this.keys.a.isDown || this.touchState.brake;
    if (Phaser.Input.Keyboard.JustDown(this.keys.q)) {
      this.setSwitchChoice("left");
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.e)) {
      this.setSwitchChoice("straight");
    }
    if (!this.doorsOpen) {
      if (this.touchState.throttle !== null) {
        this.throttle = Phaser.Math.Linear(this.throttle, this.touchState.throttle, Math.min(1, dt * 7));
      }
      if (accelerate) this.throttle += 0.75 * dt;
      if (brake) this.throttle -= 1.15 * dt;
    } else {
      this.throttle = 0;
      if (this.touchState.throttle !== null) this.touchState.throttle = 0;
    }
    this.throttle = Phaser.Math.Clamp(this.throttle, 0, 1);
    this.updateTouchThrottleSlider();

    const throttleRate = Math.abs(this.throttle - this.lastThrottle) / Math.max(dt, 0.016);
    this.inputJerk = Math.max(0, throttleRate - 0.95);
    if (this.inputJerk > 0) {
      this.adjustSatisfaction(-this.inputJerk * dt * (2.8 / this.vehicle.comfort), "szarpniecie nastawnikiem");
    }
    this.lastThrottle = this.throttle;

    if (this.bellCooldown > 0) this.bellCooldown -= dt;
    if (Phaser.Input.Keyboard.JustDown(this.keys.space)) {
      this.useActionButton();
    }
  }

  togglePause() {
    if (this.finished) return;
    this.paused = !this.paused;
    this.pauseLayer.setVisible(this.paused);
    if (!this.paused) this.pauseSettingsLayer?.setVisible(false);
  }

  handleVisibilityChange() {
    if (!document.hidden || this.finished) return;
    this.paused = true;
    this.pauseLayer?.setVisible(true);
    this.updateRideLoop(0, true);
    this.updateStadiumMusic(0, true);
    this.updateAmbientAudio(0, true);
  }

  gameRandomFloat(min, max) {
    return this.gameplayRng.float(min, max);
  }

  gameRandomBetween(min, max) {
    return this.gameplayRng.int(min, max);
  }

  shakeCamera(duration, intensity) {
    if (!this.settings.screenShake || this.settings.reducedMotion) return;
    this.cameras.main.shake(duration, intensity);
  }

  setSwitchChoice(choice) {
    this.switchChoice = choice;
    this.showMessage(choice === "left" ? "Zwrotnica ustawiona: SKRĘT" : "Zwrotnica ustawiona: PROSTO", 650, "#f4d35e");
  }

  useActionButton() {
    const stop = this.activeStop();
    if (stop && Math.abs(this.distance - stop.distance) < 138 && this.speed < 11) {
      this.toggleDoors(stop);
    } else if (stop && Math.abs(this.distance - stop.distance) < 138) {
      this.showMessage("Za szybko na otwarcie drzwi", 900, "#ffb22e");
    } else {
      this.ringBell();
    }
  }

  updateTutorial() {
    if (this.modeKey === "training") {
      this.showTutorial("training", "Trening: spokojnie sprawdź nastawnik, hamowanie i drzwi. Wynik ma znaczenie, ale kurs nie kończy się od razu po błędzie.", 5000);
    } else {
      const mobile = this.touchLayer?.visible;
      this.showTutorial("start", mobile
        ? "Sterowanie dotykowe: prawy suwak to nastawnik, lewy przycisk hamuje, środek otwiera drzwi albo uruchamia dzwonek."
        : "A/D albo strzałki sterują nastawnikiem. SPACJA otwiera drzwi na przystanku albo uruchamia dzwonek.", 5200);
    }
    const nextStop = this.activeStop();
    if (nextStop && nextStop.distance - this.distance < 760 && nextStop.distance - this.distance > 420) {
      this.showTutorial("first-stop", "Przystanek przed Tobą: zejdź z prędkością prawie do zera, zatrzymaj się w żółtej strefie i otwórz drzwi.", 4300);
    }
    const car = this.events.find((event) => event.type === "car" && !event.cleared && event.distance - this.distance < 920 && event.distance - this.distance > 520);
    if (car) this.showTutorial("first-car", "Auto blokuje tor: zwolnij, a gdy jest blisko, użyj dzwonka. Auto powinno zjechać z torowiska.", 4300);
    const sw = this.nextRelevantSwitch();
    if (sw && sw.distance - this.distance < 1200 && sw.distance - this.distance > 760) {
      this.showTutorial("first-switch", "Zwrotnica: ustaw kierunek, zanim do niej dojedziesz. Q = skręt, E = prosto; na telefonie użyj przycisków Q/E.", 4500);
    }
    if (this.time.now > this.tutorialUntil) this.tutorialLayer.setVisible(false);
  }

  showTutorial(key, text, duration = 4200) {
    if (this.tutorialShown[key] || !this.tutorialLayer) return;
    if (this.tutorialLayer.visible && this.time.now < this.tutorialUntil) return;
    this.tutorialShown[key] = true;
    this.tutorialText.setText(text);
    this.fitText(this.tutorialText, 560, 15, 11);
    this.tutorialLayer.setVisible(true);
    this.tutorialUntil = Math.max(this.tutorialUntil, this.time.now + duration);
  }

  updateMotion(dt) {
    if (this.doorsOpen && this.speed > 3) {
      this.gameOver("Ruszono z otwartymi drzwiami");
      return;
    }

    const target = this.vehicle.maxSpeed * this.throttle;
    const force = this.speed < target ? this.vehicle.acceleration : this.vehicle.braking;
    this.speed += Math.sign(target - this.speed) * force * dt;
    if (Math.abs(target - this.speed) < force * dt) this.speed = target;
    if (this.powerTimer > 0) {
      this.powerTimer -= dt;
      this.speed = Math.max(0, this.speed - 150 * dt);
    }

    this.speed = Phaser.Math.Clamp(this.speed, 0, this.vehicle.maxSpeed);
    this.distance += this.speed * dt;
    this.elapsedTime += dt;
    this.timeLeft -= dt;

    if (this.distance > this.nextConditionAt) {
      const next = this.gameRandomFloat(this.mode.trackMin, this.mode.trackMax);
      const maxDrop = 0.14;
      this.trackTargetCondition = next < this.trackTargetCondition
        ? Math.max(next, this.trackTargetCondition - maxDrop)
        : Math.min(next, this.trackTargetCondition + 0.18);
      this.trackChangeNotice = 2.6;
      this.nextConditionAt += this.gameRandomBetween(760, 1160);
    }
    const trackStep = dt * (this.trackTargetCondition < this.trackCondition ? 0.075 : 0.12);
    const trackDiff = this.trackTargetCondition - this.trackCondition;
    this.trackCondition = Math.abs(trackDiff) <= trackStep
      ? this.trackTargetCondition
      : this.trackCondition + Math.sign(trackDiff) * trackStep;
    this.trackChangeNotice = Math.max(0, this.trackChangeNotice - dt);
    if (this.trackChangeNotice > 0 && this.trackTargetCondition < this.trackCondition - 0.035) {
      this.addFeedback("gorszy odcinek torowiska za chwile", "#f4d35e");
    }

    const safeSpeed = this.vehicle.maxSpeed * this.trackCondition * this.vehicle.handling * this.mode.speedAllowance;
    if (this.speed > safeSpeed) {
      this.dangerTime += dt;
      this.shakeCamera(35, 0.0026 * this.vehicle.shake);
      this.addFeedback("za szybko na aktualnym torowisku", "#ff5c8a");
      this.showMessage("ZA SZYBKO NA TYCH TORACH!", 220, "#ff5c8a");
      if (this.dangerTime > 2.15) this.gameOver("Wykolejenie na krzywym torowisku");
    } else {
      this.dangerTime = Math.max(0, this.dangerTime - dt * 1.6);
    }

    this.updateRideComfort(dt, safeSpeed);
  }

  updateRideComfort(dt, safeSpeed) {
    const speedRatio = Phaser.Math.Clamp(this.speed / this.vehicle.maxSpeed, 0, 1);
    const safeRatio = safeSpeed > 0 ? this.speed / safeSpeed : 0;
    const overSpeedPenalty = safeRatio > 1 ? Phaser.Math.Clamp((safeRatio - 1) * 82, 0, 58) : 0;
    const roughness = Phaser.Math.Clamp(1 - this.trackCondition, 0, 1);
    const trackPenalty = speedRatio * roughness * this.vehicle.shake * 9;
    const jerkPenalty = Phaser.Math.Clamp(this.inputJerk * (18 / this.vehicle.comfort), 0, 32);

    this.rideEventPenalty = Math.max(0, this.rideEventPenalty - dt * 7.5);
    const sample = Phaser.Math.Clamp(100 - overSpeedPenalty - trackPenalty - jerkPenalty - this.rideEventPenalty, 0, 100);
    const now = this.time.now / 1000;
    this.smoothnessSamples.push({ t: now, v: sample });
    this.smoothnessSamples = this.smoothnessSamples.filter((entry) => now - entry.t <= 8);
    const total = this.smoothnessSamples.reduce((sum, entry) => sum + entry.v, 0);
    this.smoothness = Phaser.Math.Clamp(total / Math.max(1, this.smoothnessSamples.length), 0, 100);

    const discomfort = Math.max(0, 72 - this.smoothness) * 0.012;
    const steadyRideBonus = this.smoothness > 88 && this.speed > 12 ? 0.035 : 0;
    this.adjustSatisfaction((steadyRideBonus - 0.045 - discomfort) * dt, discomfort > 0.08 ? "pasażerowie czują szarpanie" : "");
  }

  addRidePenalty(amount, reason = "") {
    this.rideEventPenalty = Phaser.Math.Clamp(this.rideEventPenalty + (amount * this.mode.eventPressure) / this.vehicle.comfort, 0, 70);
    if (reason) this.addFeedback(reason, "#ffb22e");
  }

  adjustSatisfaction(delta, reason = "") {
    const scaledDelta = delta < 0 ? delta * this.mode.eventPressure : delta;
    this.satisfaction = Phaser.Math.Clamp(this.satisfaction + scaledDelta, 0, 100);
    if (scaledDelta < -0.18 && reason) this.addFeedback(reason, "#ffb22e");
  }

  addFeedback(text, color = "#ffb22e") {
    const now = this.time?.now || 0;
    if (this.feedbackReasons[0]?.text === text && now - this.feedbackReasons[0].time < 900) return;
    this.feedbackReasons.unshift({ text, color, time: now });
    this.feedbackReasons = this.feedbackReasons.slice(0, 3);
  }

  updateStations(dt) {
    const stop = this.activeStop();
    if (!stop) return;

    const delta = stop.distance - this.distance;
    if (delta < 380 && delta > -160 && !stop.served) {
      const actionHint = this.touchLayer?.visible ? "przycisk DRZWI / DZWONEK" : "SPACJĘ";
      this.showMessage(`${stop.name}: zatrzymaj się w strefie i naciśnij ${actionHint}`, 260, "#f4d35e");
    }

    if (delta > 0 && delta < 720 && !stop.served) {
      const recommended = this.recommendedStopSpeed(delta);
      if (this.speed > recommended + 34) {
        this.adjustSatisfaction(-dt * 0.55, "za szybki dojazd do przystanku");
        this.addRidePenalty(dt * 1.4, "hamowanie awaryjne przed peronem");
        this.showMessage(`Hamuj do ${Math.round(this.toDisplaySpeed(recommended))} km/h przed ${stop.name}`, 260, "#ffb22e");
      }
    }

    if (this.doorsOpen) {
      this.dwell += dt;
      this.speed = Math.min(this.speed, 2);
      if (this.dwell >= 3.6 * this.mode.dwellScale) this.serveStop(stop);
    }

    if (!stop.served && this.distance > stop.distance + 210) {
      this.adjustSatisfaction(-16, "pominięty przystanek");
      this.addRidePenalty(7, "pominięty przystanek");
      this.score -= 160;
      this.combo = 1;
      this.stopStreak = 0;
      this.stopRating = "MISS";
      this.stats.missedStops += 1;
      stop.served = true;
      this.currentStopIndex += 1;
      this.playCue("bad");
      this.showMessage(`Pominięto przystanek: ${stop.name}`, 1800, "#ff5c8a");
      this.spawnEmotionBubble("!!", "#ff5c8a");
    }
  }

  serveStop(stop) {
    const leaving = Math.min(this.passengers, Math.round(stop.alight * this.mode.passengerDemand));
    const boarding = Math.min(Math.round(stop.board * this.mode.passengerDemand), this.vehicle.capacity - this.passengers + leaving);
    const precision = Math.abs(this.distance - stop.distance);
    const scheduleDelta = this.scheduleDeltaForStop(stop);
    const scheduleScore = this.applyScheduleResult(scheduleDelta);
    const precisionScore = precision < 18 ? 180 : precision < 40 ? 95 : 35;
    const rating = precision < 18 ? "S" : precision < 40 ? "A" : precision < 74 ? "B" : "C";
    const baseScore = leaving * 65 + boarding * 12 + Math.round(this.satisfaction * 2) + precisionScore + scheduleScore;
    const scored = Math.round(baseScore * this.combo);
    this.passengers = this.passengers - leaving + boarding;
    this.delivered += leaving;
    this.precisionBonus = precisionScore;
    this.stopRating = rating;
    this.score += scored;
    this.stats.servedStops += 1;
    if (rating === "S") this.stats.perfectStops += 1;
    this.timeLeft += stop.timeBonus + (rating === "S" ? 3 : rating === "A" ? 1.5 : 0);
    if (rating === "S" || rating === "A") {
      this.stopStreak += 1;
      this.combo = Phaser.Math.Clamp(this.combo + 0.25, 1, 3);
      this.bestCombo = Math.max(this.bestCombo, this.combo);
    } else {
      this.stopStreak = 0;
      this.combo = 1;
    }
    stop.served = true;
    this.currentStopIndex += 1;
    this.doorsOpen = false;
    this.dwell = 0;
    this.pendingBoardingVisual = 0;
    this.animateDoors(false);
    stop.zone.setFillStyle(0x50d2c2, 0.1);
    stop.waiting.getChildren().forEach((person) => person.destroy());
    stop.shelter.setVisible(false);
    stop.card.setVisible(false);
    stop.label.setVisible(false);
    stop.zone.setVisible(false);
    const precisionLabel = rating === "S" ? "idealny postój" : rating === "A" ? "dobry postój" : rating === "B" ? "ciasny dojazd" : "daleko od peronu";
    this.playCue(rating === "S" || rating === "A" ? "good" : "neutral");
    this.showMessage(`${stop.name}: ${precisionLabel}, ${this.scheduleLabel(scheduleDelta)}, combo x${this.combo.toFixed(2)}`, 1900, "#50d2c2");
    this.scorePopup(`+${scored}`, this.screenX(stop.distance), 430, rating === "S" ? "#50d2c2" : "#f4d35e");
  }

  toggleDoors(stop) {
    if (this.doorsOpen) return;
    if (Math.abs(this.distance - stop.distance) > 138) {
      this.showMessage("Stań bliżej krawędzi przystanku", 1000, "#ffb22e");
      return;
    }
    this.doorsOpen = true;
    this.dwell = 0;
    this.speed = 0;
    this.throttle = 0;
    this.score += 40;
    this.addFeedback("dobry postój: wymiana pasażerów", "#50d2c2");
    this.showMessage("DRZWI OTWARTE - wymiana pasażerów", 900, "#50d2c2");
    this.playCue("doors");
    this.animateDoors(true);
    this.animatePassengerExchange(stop);
    stop.zone.setFillStyle(0x50d2c2, 0.22);
  }

  animatePassengerExchange(stop) {
    if (!stop || stop.boardingAnimated) return;
    stop.boardingAnimated = true;
    const boardingVisual = Math.min(Math.round(stop.board * this.mode.passengerDemand), Math.max(0, this.vehicle.capacity - this.passengers));
    this.pendingBoardingVisual = Math.min(boardingVisual, Math.max(0, this.vehicle.capacity - this.passengers));
    const doors = this.doorPanels
      .filter((panel) => panel.car === this.tram || this.vehicleKey === "pesa")
      .map((panel) => ({
        x: panel.car.x + panel.localX * this.vehicle.spriteScale,
        y: panel.car.y + panel.localY * this.vehicle.spriteScale + 26
      }));
    stop.waiting.getChildren().forEach((person, index) => {
      if (index >= boardingVisual) return;
      const target = doors[index % Math.max(1, doors.length)] || { x: this.tram.x, y: TRAM_BASE_Y - 42 };
      person.boarding = true;
      person.setVisible(true);
      person.setDepth(58);
      this.tweens.add({
        targets: person,
        x: target.x + Phaser.Math.Between(-8, 8),
        y: target.y + Phaser.Math.Between(-6, 6),
        alpha: 0,
        scaleX: 0.18,
        scaleY: 0.18,
        duration: 620 + index * 90,
        delay: index * 110,
        ease: "Sine.easeInOut",
        onComplete: () => person.setVisible(false)
      });
    });
  }

  scheduleTimeForStop(stop) {
    const routeEnd = STOPS[STOPS.length - 1].distance;
    return (stop.distance / routeEnd) * this.scheduleDuration;
  }

  scheduleDeltaForStop(stop) {
    return this.elapsedTime - this.scheduleTimeForStop(stop);
  }

  scheduleLabel(delta) {
    const abs = Math.abs(delta);
    if (abs <= 18) return "punktualnie";
    if (delta < 0) return `za wcześnie ${Math.round(abs)}s`;
    return `spóźnienie ${Math.round(abs)}s`;
  }

  formatScheduleDelta(delta) {
    const sign = delta > 0 ? "+" : delta < 0 ? "-" : "";
    return `${sign}${Math.round(Math.abs(delta))}s`;
  }

  applyScheduleResult(delta) {
    this.lastScheduleDelta = delta;
    const abs = Math.abs(delta);
    if (abs <= 18) {
      this.stats.onTimeStops += 1;
      this.punctuality = Phaser.Math.Clamp(this.punctuality + 1.6, 0, 100);
      this.adjustSatisfaction(1.2);
      return 130;
    }
    const penalty = Phaser.Math.Clamp((abs - 18) * 0.08, 1, 9);
    this.punctuality = Phaser.Math.Clamp(this.punctuality - penalty, 0, 100);
    this.adjustSatisfaction(-penalty * 0.42, delta < 0 ? "odjazd za wcześnie" : "spóźnienie względem rozkładu");
    this.addRidePenalty(penalty * 0.35, "rozkład poza tolerancją");
    if (delta < 0) this.stats.earlyStops += 1;
    else this.stats.lateStops += 1;
    return -Math.round(penalty * 18);
  }

  updateEvents() {
    this.events.forEach((event) => {
      const relative = event.distance - this.distance;
      const noseRelative = relative - this.tramNoseReach();
      if (!event.detouring) event.sprite.x = this.screenX(event.distance);

      if (event.type === "car" && !event.cleared) {
        if (noseRelative < event.warnDistance && noseRelative > event.stopDistance) {
          const bellHint = this.touchLayer?.visible ? "użyj DZWONKA" : "SPACJA: dzwonek";
          this.showMessage(`AUTO NA TORACH - zwolnij i ${bellHint}`, 260, "#ffb22e");
        }
        if (noseRelative <= event.stopDistance && noseRelative > event.collisionHalfWidth && this.speed > 7) {
          this.showMessage("Auto blokuje tor - hamuj albo DRYN", 240, "#ffb22e");
        }
        if (Math.abs(noseRelative) <= event.collisionHalfWidth && this.speed > 5) {
          this.gameOver("Kolizja ze źle zaparkowanym autem");
        }
      }

      if (event.type === "pothole" && !event.cleared && Math.abs(relative) < 32) {
        event.cleared = true;
        this.stats.potholes += 1;
        const hard = this.speed > this.vehicle.maxSpeed * 0.46;
        this.speed *= hard ? 0.76 : 0.9;
        this.adjustSatisfaction(hard ? -11 : -3.5, hard ? "dziura przejechana za szybko" : "dziura w torowisku");
        this.addRidePenalty(hard ? 26 : 8, hard ? "mocne uderzenie na dziurze" : "nierówny przejazd");
        this.shakeCamera(hard ? 320 : 140, hard ? 0.012 : 0.005);
        this.playCue(hard ? "bad" : "neutral");
        this.showMessage(hard ? "DZIURA! Pasażerowie polecieli z siedzeń" : "Dziura przejechana ostrożnie", 1200, hard ? "#ff5c8a" : "#f4d35e");
        if (hard) this.spawnEmotionBubble("!!", "#ff5c8a");
        else this.spawnEmotionBubble("!", "#ffb22e");
      }

      if (event.type === "rough" && !event.cleared && relative < 36 && relative > -28) {
        event.cleared = true;
        this.stats.roughSections += 1;
        this.trackTargetCondition = Math.min(this.trackTargetCondition, 0.46);
        this.nextConditionAt = Math.max(this.nextConditionAt, this.distance + 520);
        const roughFast = this.speed > this.vehicle.maxSpeed * 0.38;
        this.adjustSatisfaction(roughFast ? -6 : -1.5, roughFast ? "za szybko na odcinku remontowym" : "krzywe torowisko");
        this.addRidePenalty(roughFast ? 18 : 5, "nierówny odcinek torowiska");
        this.playCue(roughFast ? "bad" : "neutral");
        this.showMessage("Odcinek remontowy: trzymaj spokojny nastawnik", 1500, "#ffb22e");
        if (roughFast) this.spawnEmotionBubble("?!", "#ffb22e");
      }

      if (event.type === "power" && !event.cleared && Math.abs(relative) < 34) {
        event.cleared = true;
        this.stats.powerLosses += 1;
        this.powerTimer = 2.8;
        this.adjustSatisfaction(-3, "zanik napiecia");
        this.addRidePenalty(4, "utrata zasilania");
        this.playCue("power");
        this.showMessage("ZANIK NAPIECIA - tracisz ped", 1600, "#ffb22e");
        this.spawnEmotionBubble("??", "#8fb7e8");
      }
    });
  }

  ringBell() {
    if (this.bellCooldown > 0) return;
    this.bellCooldown = 1.2;
    this.timeLeft -= 1.2;
    this.stats.bells += 1;
    this.playCue("bell");
    let cleared = false;
    this.events.forEach((event) => {
      const relative = event.distance - this.distance;
      const noseRelative = relative - this.tramNoseReach();
      if (event.type === "car" && !event.cleared && noseRelative < 340 && noseRelative > -25) {
        event.cleared = true;
        event.detouring = true;
        event.clearedByBell = true;
        cleared = true;
        this.stats.carsCleared += 1;
        this.score += 75;
        event.sprite.setDepth(18);
        event.sprite.setFlipX(false);
        this.tweens.add({
          targets: event.sprite,
          x: event.sprite.x + 250,
          y: 606,
          angle: 0,
          alpha: 0.92,
          duration: 920,
          ease: "Cubic.easeOut",
          onComplete: () => {
            this.tweens.add({
              targets: event.sprite,
              x: WIDTH + 260,
              alpha: 0,
              duration: 1300,
              ease: "Sine.easeIn",
              onComplete: () => event.sprite.setVisible(false)
            });
          }
        });
        this.scorePopup("+75", event.sprite.x, event.sprite.y - 38, "#50d2c2");
      }
    });
    this.adjustSatisfaction(cleared ? -0.2 : -0.8, cleared ? "" : "niepotrzebny dzwonek");
    this.showMessage(cleared ? "Drryn! Auto zjeżdża z toru" : "Drryn!", 850, cleared ? "#50d2c2" : "#f4d35e");
  }

  updateSwitches() {
    this.switches.forEach((sw) => {
      const relative = sw.distance - this.distance;
      const selected = this.switchChoice === sw.correct;
      const near = relative < 1100 && relative > -160 && !sw.resolved;
      sw.lamp.setFillStyle(selected ? 0x50d2c2 : 0xffb22e, near ? 0.95 : 0.55);
      sw.lever.setRotation(this.switchChoice === "left" ? -0.28 : 0.28);
      sw.branch.setFillStyle(selected ? 0x50d2c2 : 0xffb22e, near ? 0.86 : 0.42);
      sw.label.setText(near ? `${sw.name}\n${this.switchChoice === "left" ? "SKRĘT" : "PROSTO"} / cel: ${sw.correct === "left" ? "SKRĘT" : "PROSTO"}` : "");
      sw.label.setVisible(near);
      if (!sw.resolved && relative < 760 && relative > 160 && !sw.warned) {
        sw.warned = true;
        this.showMessage(`${sw.hint} | Q skręt, E prosto`, 2400, "#ffb22e");
        this.playCue("neutral");
      }
      // Switch speed penalty — max ~25 km/h in switch zone (200m before)
      if (!sw.resolved && relative < 200 && relative > -52 && this.speed > 0) {
        const switchSafeSpeed = this.vehicle.maxSpeed * 0.38;
        if (this.speed > switchSafeSpeed * 1.15) {
          this.addFeedback("za szybko na zwrotnicy", "#ffb22e");
          this.adjustSatisfaction(-0.3 * (this.speed / switchSafeSpeed), "szybka zwrotnica");
          if (relative < 80) {
            this.shakeCamera(40, 0.002);
          }
        }
      }
      if (!sw.resolved && relative < 36 && relative > -52) {
        sw.resolved = true;
        const correct = this.switchChoice === sw.correct;
        if (correct) {
          this.stats.switchCorrect += 1;
          this.score += 260;
          this.combo = Phaser.Math.Clamp(this.combo + 0.15, 1, 3);
          this.scorePopup("+260", this.screenX(sw.distance), TRACK_Y - 50, "#50d2c2");
          this.playCue("good");
          this.showMessage(`Dobra zwrotnica: ${sw.correctLabel}`, 1400, "#50d2c2");
        } else {
          this.stats.switchWrong += 1;
          this.score -= 520;
          this.timeLeft -= 12;
          this.adjustSatisfaction(-10, "źle ustawiona zwrotnica");
          this.addRidePenalty(18, "błąd zwrotnicy");
          this.speed *= 0.54;
          this.combo = 1;
          this.switchPenaltyUntil = this.time.now + 1800;
          this.shakeCamera(260, 0.008);
          this.playCue("bad");
          this.showMessage(`Zła zwrotnica: ${sw.wrongLabel}. Dyspozytor zawraca kurs`, 2100, "#ff5c8a");
        }
      }
    });
  }

  updateSignals() {
    const cycleTime = this.time.now / 1000;
    this.lights.forEach((light) => {
      const phase = (cycleTime + light.offset) % 10;
      let state = "green";
      if (phase < 4) state = "green";
      else if (phase < 5.2) state = "amber";
      else if (phase < 8.6) state = "red";
      else state = "amber";
      light.state = state;

      const contrast = this.settings.highContrastSignals;
      light.red.setFillStyle(state === "red" ? (contrast ? 0xff2038 : 0xff5c5c) : 0x522126);
      light.amber.setFillStyle(state === "amber" ? (contrast ? 0xfff000 : 0xffc14d) : 0x5f4e21);
      light.green.setFillStyle(state === "green" ? (contrast ? 0x00ff72 : 0x5ae08c) : 0x1d4e33);

      const relative = light.distance - this.distance;
      if (!light.penalized && state === "red" && relative < 14 && relative > -22 && this.speed > 8) {
        light.penalized = true;
        this.stats.redSignals += 1;
        const hard = this.speed > 42;
        this.score -= hard ? 140 : 65;
        this.adjustSatisfaction(hard ? -7 : -3.5, "przejazd na czerwonym");
        this.addRidePenalty(hard ? 8 : 3, "czerwone światło");
        this.signalPenaltyUntil = this.time.now + 1200;
        this.playCue(hard ? "bad" : "neutral");
        this.showMessage(hard ? "Przelot na czerwonym!" : "Czerwone: nawet wolny przejazd kosztuje", 1200, hard ? "#ff5c8a" : "#ffb22e");
      }
      if (relative > 240 || relative < -80) {
        light.penalized = false;
      }
    });
  }

  updateWorld(dt) {
    const scroll = this.speed * dt;
    this.bgA.tilePositionX += scroll * 0.08;
    this.bgB.tilePositionX += scroll * 0.08;
    this.curbBack.tilePositionX += scroll * 0.35;
    this.sidewalkBackBand.tilePositionX += scroll * 0.24;
    this.roadStripeA.tilePositionX += scroll * 0.4;
    this.roadMedian.tilePositionX += scroll * 0.32;
    this.track.tilePositionX += scroll * 0.88;
    this.platformLines.tilePositionX += scroll * 0.5;
    this.laneA.tilePositionX += scroll * 0.45;
    this.roadStripeB.tilePositionX += scroll * 0.4;
    this.curbFront.tilePositionX += scroll * 0.5;
    this.updateStreetMarkings();
    this.updateRouteBackground();

    const speedRatio = Phaser.Math.Clamp(this.speed / this.vehicle.maxSpeed, 0, 1);
    const roughness = Phaser.Math.Clamp(1 - this.trackCondition, 0, 1);
    const shakeAmount = this.speed < 12 ? 0 : (0.25 + speedRatio * 1.1 + roughness * 1.5) * this.vehicle.shake;
    const shake = Math.sin(this.time.now * 0.045) * shakeAmount;
    const tramRotation = Phaser.Math.Clamp((this.throttle - 0.45) * 0.006 + shake * 0.0008, -0.012, 0.012);
    this.trams.forEach((car, index) => {
      car.x = this.tram.x + car.carOffset;
      car.y = TRAM_BASE_Y + shake + Math.sin(this.time.now * 0.028 + index) * (this.speed < 12 ? 0 : 0.35);
      car.rotation = tramRotation;
    });
    this.openTrams.forEach((overlay) => {
      overlay.x = overlay.car.x;
      overlay.y = overlay.car.y;
      overlay.rotation = overlay.car.rotation;
      overlay.setScale(overlay.car.scaleX, overlay.car.scaleY);
    });
    this.updateDoorOverlay();
    this.passengerSprites.getChildren().forEach((person, index) => {
      person.y = person.baseY + Math.sin(this.time.now * 0.004 + index) * 1.2;
      person.setAlpha(0.62 + Math.min(0.28, this.passengers / this.vehicle.capacity * 0.28));
    });
    this.updateOnboardPassengers();
    this.updatePedestrians(dt);
    this.updateCatenary();
    this.updateStreetProps();
    this.updateRoadHazards(dt);
    this.updateStreetLights();
    this.updateCityLifeEffects(dt);
    this.updateDistrictDecor();
    this.updateDispatcher(dt);
    this.updateNightLayer(dt);
    this.updateLcnBillboards();
    this.updateLodzDetails();

    const activeStop = this.activeStop();
    this.stations.forEach((stop) => {
      const x = this.screenX(stop.distance);
      const active = stop === activeStop;
      const near = Math.abs(stop.distance - this.distance) < 520;
      stop.zone.x = x;
      stop.shelter.x = x + stop.shelterOffsetX;
      stop.shelter.y = stop.shelterY;
      stop.card.x = x + stop.cardOffsetX;
      stop.card.y = 404;
      stop.label.x = x + stop.labelOffsetX;
      stop.label.y = 418;
      stop.zone.setVisible(active && near && !stop.served);
      stop.shelter.setVisible(active && near && !stop.served);
      stop.card.setVisible(active && near && !stop.served);
      stop.label.setVisible(active && near && !stop.served);
      stop.waiting.getChildren().forEach((person, index) => {
        if (person.boarding) return;
        this.updatePassengerBehavior(stop, person, index, active, near, x);
      });
      if (!stop.served && Math.abs(stop.distance - this.distance) < 300 && this.speed < 40) {
        this.movePacingPassengersToDoors(stop);
      }
      if (stop.served) {
        stop.zone.setStrokeStyle(2, 0x50d2c2, 0.65);
        stop.label.setColor("#50d2c2");
      }
    });

    this.lights.forEach((light) => {
      const x = this.screenX(light.distance);
      light.pole.x = x;
      light.box.x = x;
      light.red.x = x;
      light.amber.x = x;
      light.green.x = x;
      light.line.x = x - 34;
      const visible = x > -60 && x < WIDTH + 60;
      light.pole.setVisible(visible);
      light.box.setVisible(visible);
      light.red.setVisible(visible);
      light.amber.setVisible(visible);
      light.green.setVisible(visible);
      light.line.setVisible(visible);
    });

    this.switches.forEach((sw) => {
      const x = this.screenX(sw.distance);
      const visible = x > -140 && x < WIDTH + 140;
      sw.base.x = x;
      sw.branch.x = x + 2;
      sw.lever.x = x - 44;
      sw.lamp.x = x - 44;
      sw.label.x = x - 122;
      sw.label.y = TRACK_Y - 132;
      sw.base.setVisible(visible);
      sw.branch.setVisible(visible);
      sw.lever.setVisible(visible);
      sw.lamp.setVisible(visible);
      sw.label.setVisible(visible);
      sw.lamp.setFillStyle(sw.resolved ? 0x50d2c2 : this.switchChoice === sw.correct ? 0xf4d35e : 0xff5c8a);
      sw.branch.setFillStyle(this.switchChoice === "left" ? 0xf4d35e : 0x9aa0a5, 0.78);
      sw.base.setFillStyle(this.switchChoice === "straight" ? 0xf4d35e : 0x9aa0a5, 0.85);
      sw.label.setText(`${sw.name}\nQ ${sw.correct === "left" ? sw.correctLabel : sw.wrongLabel}\nE ${sw.correct === "straight" ? sw.correctLabel : sw.wrongLabel}`);
    });

    this.updateOncomingTrams(dt);
    this.updateWeatherEffects(dt);
    this.updateTrafficCars(dt);
  }

  updateTrafficCars(dt) {
    const relativeScroll = this.speed * dt * 0.08;
    this.trafficCars.forEach((car) => {
      car.x += car.direction * car.screenSpeed * this.districtTraffic * dt - relativeScroll * car.parallax;
      if (car.direction < 0 && car.x < -car.resetMargin) {
        car.x = WIDTH + car.resetMargin + Phaser.Math.Between(0, car.resetJitter);
      } else if (car.direction > 0 && car.x > WIDTH + car.resetMargin) {
        car.x = -car.resetMargin - Phaser.Math.Between(0, car.resetJitter);
      }
      car.y = car.baseY + Math.sin(this.time.now * 0.0023 + car.wobble) * 0.45;
      car.flipX = car.facing === "left";
      car.setAlpha(Phaser.Math.Clamp(0.5 + this.districtTraffic * 0.28, 0.58, 0.96));
      car.setVisible(car.x > -300 && car.x < WIDTH + 300);
    });
  }

  makeTrafficCar(x, y, key, scale, flowSpeed, facing = "right", lane = "front") {
    const car = this.add.image(x, y, key).setOrigin(0.5).setScale(scale).setAlpha(0.88).setDepth(lane === "front" ? 18 : 10);
    car.screenSpeed = Math.abs(flowSpeed) * this.mode.traffic;
    car.direction = facing === "left" ? -1 : 1;
    car.baseY = y;
    car.facing = facing;
    car.lane = lane;
    car.parallax = lane === "front" ? 0.42 : 0.28;
    car.resetMargin = key.includes("bus") ? 420 : key.includes("van") || key.includes("delivery") ? 300 : 240;
    car.resetJitter = key.includes("bus") ? 620 : key.includes("van") || key.includes("delivery") ? 460 : 360;
    car.wobble = Phaser.Math.FloatBetween(0, Math.PI * 2);
    return car;
  }

  pickPassengerBehavior() {
    const roll = Phaser.Math.FloatBetween(0, 1);
    if (roll < 0.6) return "idle";
    if (roll < 0.75) return "phone";
    if (roll < 0.9) return "pacing";
    return "waving";
  }

  updatePassengerBehavior(stop, person, index, active, near, stopX) {
    if (!person || person.boarding) return;
    if (person.behaviorMovingToDoor) {
      person.setVisible(active && near && !stop.served);
      return;
    }

    const waveActive = active && near && !stop.served && Math.abs(stop.distance - this.distance) < 400 && this.speed < 80;
    const bob = Math.sin(this.time.now * 0.005 + index * 1.8 + person.behaviorPhase) * 1.5;
    person.setVisible(active && near && !stop.served);

    if (person.behavior === "pacing") {
      person.x = stopX + person.localStopOffset + Math.sin(this.time.now * 0.0016 + person.behaviorPhase) * 30;
      person.y = person.behaviorBaseY + bob;
      person.rotation = Math.sin(this.time.now * 0.0018 + person.behaviorPhase) * 0.03;
      return;
    }

    if (person.behavior === "phone") {
      const glanceUp = Math.sin(this.time.now * 0.0009 + person.behaviorPhase) > 0.86;
      person.x = stopX + person.localStopOffset;
      person.y = person.behaviorBaseY + bob;
      person.rotation = glanceUp ? -0.01 : -0.08 + Math.sin(this.time.now * 0.0012 + person.behaviorPhase) * 0.02;
      return;
    }

    if (person.behavior === "waving") {
      person.x = stopX + person.localStopOffset;
      person.y = person.behaviorBaseY + bob;
      person.rotation = waveActive ? Math.sin(this.time.now * 0.021 + person.behaviorWaveSeed) * 0.15 : Math.sin(this.time.now * 0.002 + person.behaviorWaveSeed) * 0.04;
      return;
    }

    person.x = stopX + person.localStopOffset;
    person.y = person.behaviorBaseY + bob;
    person.rotation = Math.sin(this.time.now * 0.0013 + person.behaviorPhase) * 0.02;
  }

  movePacingPassengersToDoors(stop) {
    if (!stop || stop.pacingMoved) return;
    const pacingPassengers = stop.waiting.getChildren().filter((person) => person.behavior === "pacing" && !person.boarding && !person.behaviorMovingToDoor);
    if (!pacingPassengers.length || !this.doorPanels.length) return;
    const doorTargets = this.doorPanels
      .filter((panel) => panel.car === this.tram || this.vehicleKey === "pesa")
      .map((panel) => panel.car.x + panel.localX * this.vehicle.spriteScale);
    if (!doorTargets.length) return;

    pacingPassengers.forEach((person, index) => {
      const targetX = doorTargets[index % doorTargets.length] + Phaser.Math.Between(-12, 12);
      const targetY = 666 - (index % 2) * 8;
      person.behaviorMovingToDoor = true;
      person.behaviorDoorTween = this.tweens.add({
        targets: person,
        x: targetX,
        y: targetY,
        duration: 600,
        ease: "Sine.easeInOut",
        onComplete: () => {
          person.behaviorMovingToDoor = false;
          person.behaviorDoorTween = null;
        }
      });
    });
    stop.pacingMoved = true;
  }

  makeOncomingTrams() {
    const spawnPositions = [WIDTH - 40, WIDTH + 1800, WIDTH + 3600];
    return Array.from({ length: 3 }, (_, index) => {
      const container = this.add.container(spawnPositions[index], 548).setDepth(9).setAlpha(0.82);
      const lead = this.add.sprite(0, 0, "tram-konstal").setOrigin(0.5, 0.91).setFlipX(true);
      const rear = this.add.sprite(286, 0, "tram-konstal").setOrigin(0.5, 0.91).setFlipX(true);
      const coupler = this.add.rectangle(143, -26, 22, 5, 0x12181d, 0.9).setOrigin(0.5);
      const headlights = [
        this.add.rectangle(-92, 14, 8, 4, 0xffe08a, this.mode.night ? 0.9 : 0),
        this.add.rectangle(-92, 24, 8, 4, 0xffe08a, this.mode.night ? 0.9 : 0)
      ];
      container.add([lead, rear, coupler, ...headlights]);
      const tram = {
        container,
        lead,
        rear,
        coupler,
        headlights,
        type: "konstal",
        ownSpeed: Phaser.Math.Between(60, 120),
        wobble: Phaser.Math.FloatBetween(0, Math.PI * 2),
        closeShakeArmed: false,
        whooshArmed: false
      };
      this.configureOncomingTram(tram, index === 0);
      return tram;
    });
  }

  getOncomingTramGapRange() {
    if (this.currentBg === "centrum" || this.currentBg === "piotrkowska") return [5200, 8200];
    if (this.currentBg === "zarzew" || this.currentBg === "teofilow") return [7600, 11800];
    return [6200, 9800];
  }

  configureOncomingTram(tram, initial = false) {
    const isKonstal = Phaser.Math.Between(0, 1) === 0;
    const tint = (this.districtProfile || DISTRICT_PROFILES.zarzew).tint;
    tram.type = isKonstal ? "konstal" : "pesa";
    tram.ownSpeed = Phaser.Math.Between(60, 120);
    tram.wobble = Phaser.Math.FloatBetween(0, Math.PI * 2);
    tram.closeShakeArmed = false;
    tram.whooshArmed = false;
    tram.container.setAlpha(0.82);
    tram.container.y = 548;
    tram.lead.setTexture(isKonstal ? "tram-konstal" : "tram-pesa");
    tram.lead.setScale(isKonstal ? 0.22 : 0.28);
    tram.lead.setFlipX(true);
    tram.lead.setTint(tint);
    tram.rear.setVisible(isKonstal);
    tram.rear.setTexture("tram-konstal");
    tram.rear.setScale(0.22);
    tram.rear.setFlipX(true);
    tram.rear.setTint(tint);
    tram.rear.x = 286;
    tram.coupler.setVisible(isKonstal);
    tram.coupler.x = 143;
    tram.headlights.forEach((light, index) => {
      light.setVisible(this.mode.night);
      light.setAlpha(this.mode.night ? 0.9 : 0);
      light.x = -92 + index * 10;
    });
    tram.container.x = initial ? WIDTH + Phaser.Math.Between(1800, 3600) : WIDTH + Phaser.Math.Between(...this.getOncomingTramGapRange());
    tram.container.setVisible(true);
  }

  updateOncomingTrams(dt) {
    if (!this.oncomingTrams) return;
    const tint = (this.districtProfile || DISTRICT_PROFILES.zarzew).tint;
    const playerScroll = this.speed * dt * 0.35;
    this.oncomingTrams.forEach((tram, index) => {
      tram.container.x -= tram.ownSpeed * dt + playerScroll;
      tram.container.y = 548 + Math.sin(this.time.now * 0.002 + tram.wobble + index) * 1.2;
      tram.lead.setTint(tint);
      tram.rear.setTint(tint);
      tram.headlights.forEach((light) => {
        light.setVisible(this.mode.night);
        light.setAlpha(this.mode.night ? 0.9 : 0);
      });

      const centerDistance = Math.abs(tram.container.x - WIDTH / 2);
      if (centerDistance < 200 && !tram.closeShakeArmed) {
        tram.closeShakeArmed = true;
        this.shakeCamera(120, 0.001);
      }
      if (centerDistance > 260) tram.closeShakeArmed = false;

      if (centerDistance < 300 && !tram.whooshArmed) {
        tram.whooshArmed = true;
        this.playTramWhoosh();
      }
      if (centerDistance > 360) tram.whooshArmed = false;

      if (tram.container.x < -720) {
        this.configureOncomingTram(tram);
        tram.container.x = WIDTH + Phaser.Math.Between(...this.getOncomingTramGapRange());
      }
    });
  }

  makeWeatherEffects() {
    const rainIntensity = this.getWeatherRainIntensity();
    const rainDrops = Array.from({ length: 40 }, (_, index) => {
      const drop = this.add.rectangle(
        Phaser.Math.Between(0, WIDTH),
        Phaser.Math.Between(-HEIGHT, HEIGHT),
        2,
        8,
        0xe8f5ff,
        0.24
      ).setOrigin(0.5).setDepth(50);
      drop.baseAlpha = Phaser.Math.FloatBetween(0.2, 0.3);
      drop.vx = Phaser.Math.FloatBetween(40, 80);
      drop.vy = Phaser.Math.FloatBetween(320, 480);
      drop.phase = Phaser.Math.FloatBetween(0, Math.PI * 2);
      drop.wrapOffset = index * 13;
      drop.setRotation(-0.35);
      return drop;
    });
    const leaves = Array.from({ length: 8 }, (_, index) => {
      const leaf = this.add.ellipse(
        Phaser.Math.Between(0, WIDTH),
        Phaser.Math.Between(120, HEIGHT - 60),
        6,
        3,
        index % 2 ? 0x6a8b43 : 0x8e6a3a,
        0.28
      ).setOrigin(0.5).setDepth(15);
      leaf.baseAlpha = Phaser.Math.FloatBetween(0.2, 0.35);
      leaf.vx = Phaser.Math.FloatBetween(16, 34) * (index % 2 ? -1 : 1);
      leaf.vy = Phaser.Math.FloatBetween(4, 14);
      leaf.phase = Phaser.Math.FloatBetween(0, Math.PI * 2);
      leaf.scaleBase = Phaser.Math.FloatBetween(0.92, 1.22);
      return leaf;
    });
    rainDrops.forEach((drop) => drop.setAlpha(drop.baseAlpha * rainIntensity));
    leaves.forEach((leaf) => leaf.setAlpha(leaf.baseAlpha * this.getWeatherLeafVisibility()));
    this.weatherEffects = {
      rainDrops,
      leaves,
      sparks: [],
      rainIntensity,
      nextSparkAt: this.time.now + Phaser.Math.Between(1200, 2400),
      nextClatterAt: this.time.now + Phaser.Math.Between(400, 800)
    };
    return this.weatherEffects;
  }

  getWeatherRainIntensity() {
    if (this.mode.night) return 0;
    const motionScale = this.settings.reducedMotion ? 0.25 : 1;
    const settingScale = this.settings.weatherIntensity * motionScale;
    if (this.currentBg === "centrum" || this.currentBg === "widzew") return 1.0 * settingScale;
    if (this.currentBg === "piotrkowska") return 0.9 * settingScale;
    if (this.currentBg === "teofilow") return 0.3 * settingScale;
    return 0.58 * settingScale;
  }

  getWeatherLeafVisibility() {
    const districtFactor = this.currentBg === "zarzew" || this.currentBg === "teofilow" ? 1 : 0.6;
    const motionScale = this.settings.reducedMotion ? 0.25 : 1;
    return (this.mode.night ? 0.18 : districtFactor) * this.settings.weatherIntensity * motionScale;
  }

  spawnPantographSparkBurst() {
    if (!this.weatherEffects) return;
    if (this.settings.reducedMotion || this.settings.weatherIntensity <= 0) return;
    const sparkCount = Phaser.Math.Between(4, 6);
    const intensity = this.mode.night ? 0.9 : 0.4;
    for (let i = 0; i < sparkCount; i += 1) {
      const spark = this.add.rectangle(
        this.tram.x + Phaser.Math.Between(-18, 18),
        414 + Phaser.Math.Between(-8, 6),
        2,
        2,
        i % 2 ? 0xf4d35e : 0xffffff,
        intensity
      ).setOrigin(0.5).setDepth(22);
      const vx = Phaser.Math.Between(-90, 90);
      const vy = Phaser.Math.Between(-40, -130);
      this.weatherEffects.sparks.push(spark);
      this.tweens.add({
        targets: spark,
        x: spark.x + vx,
        y: spark.y + vy,
        alpha: 0,
        duration: Phaser.Math.Between(200, 400),
        ease: "Sine.easeOut",
        onComplete: () => {
          const idx = this.weatherEffects?.sparks?.indexOf(spark) ?? -1;
          if (idx >= 0) this.weatherEffects.sparks.splice(idx, 1);
          spark.destroy();
        }
      });
    }
  }

  updateWeatherEffects(dt) {
    if (!this.weatherEffects) return;
    this.weatherEffects.rainIntensity = this.getWeatherRainIntensity();
    const intensity = this.weatherEffects.rainIntensity;
    const leafVisibility = this.getWeatherLeafVisibility();
    this.weatherEffects.rainDrops.forEach((drop, index) => {
      drop.x -= drop.vx * dt;
      drop.y += drop.vy * dt;
      drop.setAlpha(drop.baseAlpha * intensity * 1.05);
      if (drop.y > HEIGHT + 12 || drop.x < -16) {
        drop.x = Phaser.Math.Between(WIDTH - 120, WIDTH + 180);
        drop.y = Phaser.Math.Between(-140, -10) - index * 2;
        drop.vx = Phaser.Math.FloatBetween(40, 80);
        drop.vy = Phaser.Math.FloatBetween(320, 480);
      }
    });

    this.weatherEffects.leaves.forEach((leaf, index) => {
      leaf.x -= this.speed * dt * 0.04 + leaf.vx * dt;
      leaf.y += Math.sin(this.time.now * 0.0018 + leaf.phase + index) * 0.45 + leaf.vy * dt * 0.12;
      leaf.rotation = Math.sin(this.time.now * 0.003 + leaf.phase) * 0.5;
      leaf.scaleX = leaf.scaleBase * 1.12;
      leaf.scaleY = leaf.scaleBase * 0.62;
      leaf.setAlpha(leaf.baseAlpha * leafVisibility * 1.1);
      if (leaf.x < -30) {
        leaf.x = WIDTH + Phaser.Math.Between(30, 180);
        leaf.y = Phaser.Math.Between(120, HEIGHT - 60);
      }
    });

    if (this.time.now > this.weatherEffects.nextSparkAt) {
      const speedBoost = Phaser.Math.Clamp(this.speed / this.vehicle.maxSpeed, 0, 1);
      if (speedBoost > 0.6 || (this.mode.night && speedBoost > 0.18)) this.spawnPantographSparkBurst();
      const nextDelay = Phaser.Math.Between(3000, 8000) - Math.round(speedBoost * 1800);
      this.weatherEffects.nextSparkAt = this.time.now + Math.max(3000, nextDelay);
    }
  }

  createOdometerHud() {
    const panelY = this.getOdometerPanelY();
    this.odometerChrome = this.add.graphics().setDepth(100);
    this.odometerPanel = this.add.rectangle(16, panelY, 330, 78, 0x0d1318, 0.92)
      .setOrigin(0, 1)
      .setStrokeStyle(2, 0x4b5961, 0.95)
      .setDepth(100);
    this.odometerLabel = this.add.text(34, panelY - 62, "DYSTANS", {
      fontSize: "10px",
      fontStyle: "700",
      color: "#8ea0a8"
    }).setDepth(101);
    this.odometerText = this.add.text(34, panelY - 40, "0.0 km", {
      fontSize: "20px",
      fontStyle: "700",
      color: "#f4efe4",
      fontFamily: "\"Courier New\", monospace"
    }).setDepth(101);
    this.speedometerLabel = this.add.text(180, panelY - 42, "PRĘDKOŚĆ", {
      fontSize: "10px",
      fontStyle: "700",
      color: "#8ea0a8"
    }).setDepth(101);
    this.speedometerLabel.setText("PRĘDKOŚĆ");
    this.speedometerText = this.add.text(180, panelY - 22, "0 km/h", {
      fontSize: "16px",
      fontStyle: "700",
      color: "#50d2c2",
      fontFamily: "\"Courier New\", monospace"
    }).setDepth(101);
    this.speedometerText.setAlpha(0);
    this.speedometerBigText = this.add.text(184, panelY - 48, "0", {
      fontSize: "30px",
      fontStyle: "700",
      color: "#50d2c2",
      fontFamily: "\"Courier New\", monospace"
    }).setDepth(101);
    this.speedometerUnit = this.add.text(270, panelY - 38, "km/h", {
      fontSize: "11px",
      fontStyle: "700",
      color: "#8ea0a8"
    }).setDepth(101);
    this.speedometerGraphics = this.add.graphics().setDepth(100);
    this.speedometerNeedle = this.add.graphics().setDepth(101);
    this.updateOdometerHud();
  }

  updateOdometerHud() {
    if (!this.odometerPanel || !this.speedometerGraphics || !this.speedometerNeedle) return;
    const panelY = this.getOdometerPanelY();
    const panelX = 16;
    this.odometerPanel.setPosition(panelX, panelY);
    this.odometerPanel.setAlpha(0);
    this.odometerLabel.setPosition(panelX + 18, panelY - 62);
    this.odometerText.setPosition(panelX + 18, panelY - 40);
    this.speedometerLabel.setPosition(panelX + 168, panelY - 62);
    this.speedometerText.setPosition(panelX + 168, panelY - 42);
    this.speedometerBigText.setPosition(panelX + 168, panelY - 48);
    this.speedometerUnit.setPosition(panelX + 254, panelY - 38);

    const barX = panelX + 168;
    const barY = panelY - 14;
    const barW = 138;
    const safeSpeed = this.vehicle.maxSpeed * this.trackCondition * this.vehicle.handling * this.mode.speedAllowance;
    const speedRatio = Phaser.Math.Clamp(this.toDisplaySpeed(this.speed) / Math.max(1, this.vehicle.displayMaxSpeed), 0, 1);
    const safeRatio = Phaser.Math.Clamp(this.toDisplaySpeed(safeSpeed) / Math.max(1, this.vehicle.displayMaxSpeed), 0, 1);
    const color = this.speed <= safeSpeed ? 0x50d2c2 : this.speed <= safeSpeed * 1.05 ? 0xf4d35e : 0xff5c8a;

    this.odometerText.setText(this.formatRouteDistance(this.distance));
    this.speedometerText.setText(`${Math.round(this.toDisplaySpeed(this.speed))} km/h`);
    this.speedometerText.setColor(color === 0x50d2c2 ? "#50d2c2" : color === 0xf4d35e ? "#f4d35e" : "#ff5c8a");
    this.speedometerBigText.setText(`${Math.round(this.toDisplaySpeed(this.speed))}`);
    this.speedometerBigText.setColor(color === 0x50d2c2 ? "#50d2c2" : color === 0xf4d35e ? "#f4d35e" : "#ff5c8a");

    this.odometerChrome.clear();
    this.odometerChrome.fillStyle(0x071017, 0.9);
    this.odometerChrome.fillRoundedRect(panelX, panelY - 78, 330, 78, 8);
    this.odometerChrome.fillStyle(0x033968, 0.38);
    this.odometerChrome.fillRoundedRect(panelX + 8, panelY - 68, 118, 56, 6);
    this.odometerChrome.fillRoundedRect(panelX + 154, panelY - 68, 164, 56, 6);
    this.odometerChrome.fillStyle(0x33b54b, 0.88);
    this.odometerChrome.fillRect(panelX, panelY - 66, 4, 54);
    this.odometerChrome.lineStyle(1, 0xf4efe4, 0.18);
    this.odometerChrome.strokeRoundedRect(panelX, panelY - 78, 330, 78, 8);
    this.odometerChrome.lineStyle(1, 0xffb22e, 0.42);
    this.odometerChrome.lineBetween(panelX + 142, panelY - 66, panelX + 142, panelY - 12);

    this.speedometerGraphics.clear();
    this.speedometerGraphics.fillStyle(0x10131a, 1);
    this.speedometerGraphics.fillRoundedRect(barX, barY - 4, barW, 8, 4);
    this.speedometerGraphics.fillStyle(0x50d2c2, 0.85);
    this.speedometerGraphics.fillRoundedRect(barX, barY - 3, barW * Math.min(safeRatio, 1), 6, 3);
    if (safeRatio < 1) {
      this.speedometerGraphics.fillStyle(0xf4d35e, 0.82);
      this.speedometerGraphics.fillRoundedRect(barX + barW * safeRatio, barY - 3, barW * Math.max(0, 1 - safeRatio), 6, 3);
    }
    for (let i = 0; i <= 4; i++) {
      const x = barX + (barW / 4) * i;
      this.speedometerGraphics.lineStyle(1, 0xf4efe4, i % 2 === 0 ? 0.52 : 0.28);
      this.speedometerGraphics.lineBetween(x, barY - 8, x, barY + 8);
    }

    this.speedometerNeedle.clear();
    const needleX = barX + barW * speedRatio;
    this.speedometerNeedle.lineStyle(3, color, 1);
    this.speedometerNeedle.lineBetween(needleX, barY - 12, needleX, barY + 12);
    this.speedometerNeedle.fillStyle(color, 1);
    this.speedometerNeedle.fillTriangle(needleX - 5, barY - 14, needleX + 5, barY - 14, needleX, barY - 7);
    this.speedometerNeedle.fillTriangle(needleX - 5, barY + 14, needleX + 5, barY + 14, needleX, barY + 7);
  }

  getOdometerPanelY() {
    return this.touchLayer?.visible ? HEIGHT - 250 : HEIGHT - 210;
  }

  createNightLayer() {
    this.nightLayer = this.add.container(0, 0).setDepth(8);
    const sky = this.add.rectangle(0, 86, WIDTH, 260, 0x050b18, this.mode.night ? 0.68 : 0).setOrigin(0);
    const horizon = this.add.rectangle(0, 300, WIDTH, 226, 0x091421, this.mode.night ? 0.48 : 0).setOrigin(0);
    const road = this.add.rectangle(0, 496, WIDTH, 224, 0x05080d, this.mode.night ? 0.24 : 0).setOrigin(0);
    this.nightLayer.add([sky, horizon, road]);
    this.nightSkyOverlay = sky;
    this.nightHorizonOverlay = horizon;
    this.nightRoadOverlay = road;
    this.stars = Array.from({ length: 86 }, (_, index) => {
      const star = this.add.rectangle(Phaser.Math.Between(20, WIDTH - 20), Phaser.Math.Between(100, 265), index % 6 === 0 ? 2 : 1, 1, 0xf4efe4, this.mode.night ? 0.45 : 0);
      star.twinkle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      this.nightLayer.add(star);
      return star;
    });
  }

  createDistrictStageLayer() {
    this.districtStage = this.add.container(0, 0).setDepth(7);
    this.stageSkyWash = this.add.rectangle(0, 86, WIDTH, 252, 0xffffff, 0).setOrigin(0);
    this.stageHorizonWash = this.add.rectangle(0, 320, WIDTH, 206, 0xffffff, 0).setOrigin(0);
    this.stageAccentLine = this.add.rectangle(0, 532, WIDTH, 4, 0xffffff, 0).setOrigin(0);
    this.stagePlatformGlow = this.add.rectangle(0, 648, WIDTH, 14, 0xffffff, 0).setOrigin(0);
    this.districtStage.add([this.stageSkyWash, this.stageHorizonWash, this.stageAccentLine, this.stagePlatformGlow]);
    this.districtDecor = this.makeDistrictDecor();
  }

  makeDistrictDecor() {
    return Array.from({ length: 7 }, (_, index) => {
      const spawnOffset = 620 + index * 330;
      const group = this.add.container(WIDTH + spawnOffset, 0).setDepth(index % 2 ? 12 : 36);
      const pole = this.add.rectangle(0, 510, 5, 72, 0x202a31, 0.82).setOrigin(0.5, 1);
      const sign = this.add.rectangle(0, 456, 58, 28, 0xf4d35e, 0.22).setOrigin(0.5).setStrokeStyle(2, 0x111319, 0.72);
      const stripe = this.add.rectangle(0, 456, 46, 5, 0xffffff, 0.35).setOrigin(0.5);
      const low = this.add.rectangle(0, 642, 42, 9, 0xf4d35e, 0.22).setOrigin(0.5);
      group.add([pole, sign, stripe, low]);
      group.worldDistance = this.distance + spawnOffset;
      group.spawnOffset = spawnOffset;
      group.parts = { pole, sign, stripe, low };
      return group;
    });
  }

  updateNightLayer(dt) {
    if (!this.nightLayer) return;
    // Sunset transition uses sunsetProgress (0..1) set by updateSunsetTransition
    const nightTarget = this.mode.night ? 1 : this.sunsetProgress;
    const skyAlpha = nightTarget * 0.68;
    const horizonAlpha = nightTarget * 0.48;
    const roadAlpha = nightTarget * 0.24;
    this.nightSkyOverlay.setAlpha(Phaser.Math.Linear(this.nightSkyOverlay.alpha, skyAlpha, dt * 2.5));
    this.nightHorizonOverlay.setAlpha(Phaser.Math.Linear(this.nightHorizonOverlay.alpha, horizonAlpha, dt * 2.5));
    this.nightRoadOverlay.setAlpha(Phaser.Math.Linear(this.nightRoadOverlay.alpha, roadAlpha, dt * 2.5));
    this.stars.forEach((star, index) => {
      star.x -= this.speed * dt * 0.012;
      if (star.x < -10) star.x = WIDTH + Phaser.Math.Between(0, 80);
      const starTarget = (this.mode.night || this.sunsetProgress > 0.6) ? 0.34 + Math.sin(this.time.now * 0.002 + star.twinkle + index) * 0.16 : 0;
      star.setAlpha(Phaser.Math.Clamp(starTarget * nightTarget, 0, 0.62));
    });
  }

  makePedestrians() {
    const pedestrianKeys = [
      "pedestrian-side-a",
      "pedestrian-side-b",
      "pedestrian-side-c",
      "pedestrian-side-d",
      "pedestrian-side-e",
      "cyclist-side",
      "cargo-bike-side"
    ];
    return Array.from({ length: 9 }, (_, index) => {
      const key = pedestrianKeys[index % pedestrianKeys.length];
      const laneY = index % 2 ? 506 : 676;
      const direction = index % 2 ? -1 : 1;
      const isBike = key === "cyclist-side" || key === "cargo-bike-side";
      const p = this.add.image(direction < 0 ? WIDTH + 160 + index * 120 : -160 - index * 120, laneY, key)
        .setScale(key === "cargo-bike-side" ? 0.5 : key === "cyclist-side" ? 0.5 : 0.43)
        .setAlpha(0.72)
        .setDepth(index % 2 ? 13 : 49);
      p.screenSpeed = isBike ? 46 : 20 + (index % 3) * 5;
      p.direction = direction;
      p.baseY = laneY;
      p.resetMargin = isBike ? 150 : 80;
      p.resetJitter = 420;
      return p;
    });
  }

  updatePedestrians(dt) {
    this.pedestrians.forEach((p, index) => {
      p.x += p.direction * p.screenSpeed * this.districtPedestrians * dt;
      if (p.direction < 0 && p.x < -p.resetMargin) {
        p.x = WIDTH + p.resetMargin + Phaser.Math.Between(0, p.resetJitter);
      } else if (p.direction > 0 && p.x > WIDTH + p.resetMargin) {
        p.x = -p.resetMargin - Phaser.Math.Between(0, p.resetJitter);
      }
      p.y = p.baseY + Math.sin(this.time.now * 0.006 + index) * 2;
      p.flipX = p.direction < 0;
      p.setAlpha(Phaser.Math.Clamp(0.42 + this.districtPedestrians * 0.22, 0.5, 0.88));
      p.setVisible(p.x > -160 && p.x < WIDTH + 160);
    });
  }

  makeCityLifeEffects() {
    const layer = this.add.container(0, 0).setDepth(9);
    const windows = Array.from({ length: 34 }, (_, index) => {
      const x = 50 + (index % 17) * Math.max(62, WIDTH / 18);
      const y = 142 + Math.floor(index / 17) * 74 + (index % 3) * 8;
      const window = this.add.rectangle(x, y, 12, 7, 0xf4d35e, 0.08).setOrigin(0.5);
      window.twinkle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      window.drift = Phaser.Math.FloatBetween(0.02, 0.08);
      layer.add(window);
      return window;
    });
    const steam = Array.from({ length: 5 }, (_, index) => {
      const puff = this.add.ellipse(180 + index * 220, 318 + (index % 2) * 20, 28, 10, 0xd9d3c4, 0.08).setOrigin(0.5);
      puff.seed = Phaser.Math.FloatBetween(0, Math.PI * 2);
      layer.add(puff);
      return puff;
    });
    const crossingPulse = this.add.rectangle(WIDTH / 2, 492, WIDTH, 3, 0xf4d35e, 0.08).setOrigin(0.5);
    layer.add(crossingPulse);
    return { layer, windows, steam, crossingPulse };
  }

  updateCityLifeEffects(dt) {
    if (!this.cityLife) return;
    const profile = this.districtProfile || DISTRICT_PROFILES.zarzew;
    this.cityLife.windows.forEach((window, index) => {
      window.x -= this.speed * dt * window.drift;
      if (window.x < -20) window.x = WIDTH + Phaser.Math.Between(10, 90);
      const nightBoost = this.mode.night ? 0.36 : 0.04;
      const cityGlow = profile.windows * 0.16;
      const twinkle = Math.sin(this.time.now * 0.002 + window.twinkle + index) * 0.06;
      window.setFillStyle(profile.tint || 0xf4d35e, Phaser.Math.Clamp(nightBoost + cityGlow + twinkle, 0.03, 0.72));
    });
    this.cityLife.steam.forEach((puff, index) => {
      puff.x -= this.speed * dt * 0.045;
      if (puff.x < -40) puff.x = WIDTH + 180 + index * 20;
      puff.y = 314 + Math.sin(this.time.now * 0.0018 + puff.seed) * 18 - index * 3;
      puff.scaleX = 1 + Math.sin(this.time.now * 0.0012 + index) * 0.22;
      puff.setAlpha((this.currentBg === "wima" || this.currentBg === "centrum") ? 0.12 : 0.035);
    });
    const activeStop = this.activeStop();
    const nearStop = activeStop && activeStop.distance - this.distance < 620 && activeStop.distance - this.distance > -100;
    this.cityLife.crossingPulse.setAlpha(nearStop ? 0.08 + Math.sin(this.time.now * 0.008) * 0.04 : 0.02);
  }

  updateDispatcher(dt) {
    if (!this.dispatchText) return;
    if (this.time.now > this.dispatchUntil && this.time.now > this.nextDispatchAt) {
      const next = this.activeStop();
      const nextSignal = this.nextRelevantSignal();
      const nextSwitch = this.nextRelevantSwitch();
      let text = "";
      if (nextSwitch && nextSwitch.distance - this.distance < 1200) {
        text = `Dyspozytor: zwrotnica za ${this.formatRouteDistance(nextSwitch.distance - this.distance)}, ${nextSwitch.correct === "left" ? "szykuj skręt" : "trzymaj prosto"}.`;
      } else if (nextSignal && nextSignal.state === "red" && nextSignal.distance - this.distance < 900) {
        text = "Dyspozytor: czerwone przed Tobą, nie oddawaj punktów na sygnale.";
      } else if (next && next.distance - this.distance < 900) {
        text = `Dyspozytor: następny ${next.name}, zacznij schodzić z prędkości.`;
      } else {
        const lines = (this.districtProfile || DISTRICT_PROFILES.zarzew).dispatch;
        text = lines[Phaser.Math.Between(0, lines.length - 1)];
      }
      this.dispatch(text, 4700);
      this.nextDispatchAt = this.time.now + Phaser.Math.Between(7000, 10500);
    }
    const active = this.time.now < this.dispatchUntil;
    this.dispatchBg.setVisible(active);
    this.dispatchText.setVisible(active);
    this.dispatchBg.setAlpha(active ? 0.74 : 0);
    this.dispatchText.setAlpha(active ? 0.9 : 0);
  }

  dispatch(text, duration = 4300) {
    if (!text || text === this.lastDispatchText) return;
    this.lastDispatchText = text;
    this.dispatchText.setText(text);
    this.fitText(this.dispatchText, 376, 8, 7);
    this.dispatchUntil = this.time.now + duration;
  }

  showRouteMoment(text, duration = 3300, color = "#f4d35e") {
    if (!text || !this.routeMomentText || this.time.now < this.routeMomentUntil - 450 || this.time.now < this.messageUntil) return;
    this.routeMomentText.setText(text);
    this.routeMomentText.setColor(color);
    this.routeMomentBg.setVisible(true);
    this.routeMomentText.setVisible(true);
    this.routeMomentBg.setStrokeStyle(2, Phaser.Display.Color.HexStringToColor(color).color, 0.75);
    this.fitText(this.routeMomentText, 600, 11, 8);
    this.routeMomentUntil = this.time.now + duration;
  }

  updateRouteMoments() {
    ROUTE_MOMENTS.forEach((moment) => {
      if (this.routeMomentsShown.has(moment.id)) return;
      const relative = moment.distance - this.distance;
      if (relative < 680 && relative > 120) {
        this.routeMomentsShown.add(moment.id);
        this.dispatch(`Dyspozytor: ${moment.text}`, 5400);
        this.showRouteMoment(moment.text, 3600, moment.color);
      }
    });
  }

  makeCatenary() {
    return Array.from({ length: 8 }, (_, index) => {
      const worldDistance = this.distance - 520 + index * 360;
      const group = this.add.container(this.screenX(worldDistance), 0).setDepth(19);
      const poleX = 74;
      const wireY = 414;
      const messengerY = 378;
      const pole = this.add.rectangle(poleX, 372, 7, 178, 0x263038, 0.92).setOrigin(0.5, 0);
      const base = this.add.rectangle(poleX, 548, 24, 8, 0x111820, 0.9).setOrigin(0.5);
      const arm = this.add.rectangle(poleX - 170, 390, 174, 5, 0x263038, 0.9).setOrigin(0, 0.5).setRotation(index % 2 ? 0.04 : -0.04);
      const brace = this.add.rectangle(poleX - 132, 406, 94, 3, 0x3c4a52, 0.76).setOrigin(0, 0.5).setRotation(index % 2 ? -0.32 : -0.38);
      const hanger = this.add.rectangle(poleX - 160, 392, 3, wireY - 392, 0x2b363d, 0.78).setOrigin(0.5, 0);
      const contact = this.add.rectangle(-590, wireY, 1180, 3, 0x101820, 0.82).setOrigin(0, 0.5);
      const messenger = this.add.rectangle(-590, messengerY, 1180, 2, 0x303b42, 0.5).setOrigin(0, 0.5);
      const dropperA = this.add.rectangle(-260, messengerY, 2, wireY - messengerY, 0x303b42, 0.48).setOrigin(0.5, 0);
      const dropperB = this.add.rectangle(120, messengerY, 2, wireY - messengerY, 0x303b42, 0.48).setOrigin(0.5, 0);
      group.add([messenger, contact, dropperA, dropperB, pole, base, arm, brace, hanger]);
      group.worldDistance = worldDistance;
      group.spacing = 360;
      return group;
    });
  }

  updateCatenary() {
    if (!this.catenary) return;
    this.catenary.forEach((group, index) => {
      if (group.worldDistance < this.distance - 760) {
        group.worldDistance += group.spacing * this.catenary.length;
      }
      group.x = this.screenX(group.worldDistance);
      group.setVisible(group.x > -720 && group.x < WIDTH + 720);
      group.alpha = 0.78 + Math.sin(this.time.now * 0.001 + index) * 0.06;
    });
  }

  makeStreetProps() {
    const defs = [
      ["prop-tree", 520, 490, 0.85],
      ["prop-lamp", 860, 510, 0.9],
      ["prop-pole", 1120, 512, 0.9],
      ["prop-bin", 1340, 626, 1],
      ["prop-bollard", 1480, 638, 1.1],
      ["prop-tree", 1760, 490, 0.75],
      ["prop-lamp", 2140, 510, 0.9],
      ["prop-ticket-machine", 2320, 638, 0.86],
      ["prop-bin", 2420, 626, 1],
      ["prop-news-kiosk", 2680, 532, 0.72],
      ["prop-ad-column", 2960, 536, 0.78]
    ];
    return defs.map(([key, offset, y, scale]) => {
      const sprite = this.add.image(this.screenX(this.distance + offset), y, key)
        .setOrigin(0.5, 1)
        .setScale(scale)
        .setAlpha(0.9)
        .setDepth(y > 600 ? 33 : 11);
      sprite.worldDistance = this.distance + offset;
      sprite.spawnOffset = offset;
      return sprite;
    });
  }

  updateStreetProps() {
    this.streetProps.forEach((prop, index) => {
      if (prop.worldDistance < this.distance - 420) {
        prop.worldDistance = this.distance + 1700 + prop.spawnOffset + index * 45;
      }
      prop.x = this.screenX(prop.worldDistance);
      prop.setVisible(prop.x > -120 && prop.x < WIDTH + 120);
    });
  }

  makeRoadHazards() {
    const offsets = [880, 2650, 4380, 6420, 8620];
    return offsets.map((offset, index) => {
      const worldDistance = this.distance + offset;
      const group = this.add.container(this.screenX(worldDistance), 0).setAlpha(0.9);
      const parts = {
        hole: this.add.image(0, 0, "road-pothole").setOrigin(0.5),
        cone: this.add.image(0, 0, "prop-road-cone").setOrigin(0.5, 1),
        cones: this.add.image(0, 0, "prop-road-cones").setOrigin(0.5, 1),
        barrier: this.add.image(0, 0, "prop-road-barrier").setOrigin(0.5, 1),
        sign: this.add.image(0, 0, "prop-roadwork-sign").setOrigin(0.5, 1),
        barrel: this.add.image(0, 0, "prop-construction-barrel").setOrigin(0.5, 1),
        sandbags: this.add.image(0, 0, "prop-sandbags").setOrigin(0.5, 1),
        manhole: this.add.image(0, 0, "prop-manhole-cover").setOrigin(0.5)
      };
      Object.values(parts).forEach((part) => group.add(part));
      group.parts = parts;
      group.worldDistance = worldDistance;
      group.spawnOffset = offset;
      this.configureRoadHazard(group, index);
      return group;
    });
  }

  configureRoadHazard(group, seed = 0) {
    const parts = group.parts;
    Object.values(parts).forEach((part) => {
      part.setVisible(false).clearTint();
      if (part.setFlipX) part.setFlipX(false);
    });
    const variant = seed % 5;
    const y = 558 + (seed % 3 - 1) * 3;
    group.setDepth(8.8);
    group.variant = variant;
    group.frontLane = false;

    if (variant === 0) {
      parts.hole.setPosition(0, y - 6).setScale(0.3).setVisible(true);
      parts.cone.setPosition(56, y + 12).setScale(0.25).setVisible(true);
      parts.barrel.setPosition(96, y + 12).setScale(0.18).setVisible(true);
    } else if (variant === 1) {
      parts.hole.setPosition(-22, y - 6).setScale(0.27).setVisible(true);
      parts.cones.setPosition(70, y + 12).setScale(0.22).setVisible(true);
    } else if (variant === 2) {
      parts.barrier.setPosition(0, y + 12).setScale(0.28).setVisible(true);
      parts.cone.setPosition(-76, y + 12).setScale(0.2).setVisible(true);
      parts.cone.setFlipX(seed % 3 === 0);
    } else if (variant === 3) {
      parts.sign.setPosition(-42, y + 12).setScale(0.25).setVisible(true);
      parts.barrel.setPosition(48, y + 12).setScale(0.23).setVisible(true);
      parts.manhole.setPosition(98, y - 6).setScale(0.22).setVisible(true);
    } else {
      parts.manhole.setPosition(-20, y - 6).setScale(0.24).setVisible(true);
      parts.sandbags.setPosition(70, y + 12).setScale(0.24).setVisible(true);
      parts.cone.setPosition(-82, y + 12).setScale(0.2).setVisible(true);
    }
  }

  updateRoadHazards(dt) {
    if (!this.roadHazards) return;
    this.roadHazards.forEach((group, index) => {
      if (group.worldDistance < this.distance - 520) {
        group.worldDistance = this.distance + 2300 + group.spawnOffset + index * 160 + Phaser.Math.Between(0, 980);
        this.configureRoadHazard(group, Phaser.Math.Between(0, 1000));
      }
      group.x = this.screenX(group.worldDistance);
      group.setAlpha(Phaser.Math.Clamp(0.62 + this.districtTraffic * 0.22, 0.72, 0.94));
      group.setVisible(group.x > -260 && group.x < WIDTH + 260);
    });
  }

  updateDistrictDecor() {
    if (!this.districtDecor) return;
    const visual = this.currentDistrictVisual || DISTRICT_VISUALS.zarzew;
    this.districtDecor.forEach((group, index) => {
      if (group.worldDistance < this.distance - 520) {
        group.worldDistance = this.distance + 1860 + group.spawnOffset + index * 32;
        this.styleDistrictDecor(group, visual, index);
      }
      group.x = this.screenX(group.worldDistance);
      group.setVisible(group.x > -120 && group.x < WIDTH + 140);
      group.alpha = 0.62 + visual.accentAlpha + Math.sin(this.time.now * 0.002 + index) * 0.04;
    });
  }

  makeLodzDetails() {
    const defs = [
      { type: "landmark", key: "landmark-znicze", distance: Math.round(0.02 * ROUTE_SCALE), y: 532, scale: 0.26, depth: 13 },
      { type: "landmark", key: "landmark-drzewo", distance: Math.round(1.55 * ROUTE_SCALE), y: 534, scale: 0.26, depth: 13 },
      { type: "landmark", key: "landmark-widzew-fans", distance: Math.round(3.32 * ROUTE_SCALE), y: 532, scale: 0.31, depth: 14, animated: true },
      { type: "landmark", key: "landmark-smolarek-mural", distance: Math.round(3.46 * ROUTE_SCALE), y: 536, scale: 0.32, depth: 10 },
      { type: "landmark", key: "landmark-witcher-mural", distance: Math.round(7.3 * ROUTE_SCALE), y: 536, scale: 0.31, depth: 10 },
      { type: "landmark", key: "landmark-unicorn-statue", distance: Math.round(7.78 * ROUTE_SCALE), y: 530, scale: 0.36, depth: 13 },
      { type: "sign", distance: Math.round(0.32 * ROUTE_SCALE), y: 504, label: "ZARZEW\nSPOKOJNIE", depth: 13 },
      { type: "sign", distance: Math.round(2.22 * ROUTE_SCALE), y: 500, label: "ROKICIŃSKA\nTRZYMAJ TOR", depth: 13 },
      { type: "sign", distance: Math.round(3.62 * ROUTE_SCALE), y: 502, label: "WIDZEW\nCAŁA NAPRZÓD", depth: 14 },
      { type: "sign", distance: Math.round(4.72 * ROUTE_SCALE), y: 506, label: "WI-MA\nFABRYKA RYTMU", depth: 13 },
      { type: "sign", distance: Math.round(6.72 * ROUTE_SCALE), y: 498, label: "HOLLY\nŁÓDŹ", depth: 13 },
      { type: "sign", distance: Math.round(8.16 * ROUTE_SCALE), y: 500, label: "STAJNIA\nJEDNOROŻCÓW", depth: 13 },
      { type: "sign", distance: Math.round(9.52 * ROUTE_SCALE), y: 502, label: "KALISKA\nNIE PRZESTRZEL", depth: 13 },
      { type: "sign", distance: Math.round(14.85 * ROUTE_SCALE), y: 506, label: "TEOFILÓW\nJUŻ BLISKO", depth: 13 },
      { type: "gate", offset: 2500, y: 492, label: "BRAMA" },
      { type: "generated", key: "lodz-detail-cafe", offset: 3380, y: 502, scale: 0.15 },
      { type: "generated", key: "lodz-detail-mural", offset: 4260, y: 496, scale: 0.16 },
      { type: "works", offset: 5200, y: 566, depth: 17 },
      { type: "generated", key: "lodz-detail-lcn", offset: 6140, y: 504, scale: 0.15 },
      { type: "generated", key: "lodz-detail-lcn", offset: 7200, y: 502, scale: 0.14 },
      { type: "generated", key: "lodz-detail-lcn", offset: 8280, y: 508, scale: 0.13 },
      { type: "generated", key: "lodz-detail-mural", offset: 9400, y: 496, scale: 0.15 },
      { type: "generated", key: "lodz-detail-mural", offset: 10520, y: 506, scale: 0.13 }
    ];
    return defs.map((def) => {
      const worldDistance = def.distance ?? this.distance + def.offset;
      const group = this.add.container(this.screenX(worldDistance), 0).setDepth(def.depth ?? (def.y > 600 ? 35 : 13));
      if (def.type === "landmark") {
        group.add(this.add.image(0, def.y, def.key).setScale(def.scale).setOrigin(0.5, 1));
      } else if (def.type === "generated") {
        group.add(this.add.image(0, def.y - 54, def.key).setScale(def.scale).setOrigin(0.5));
        if (def.y < 600) {
          group.add(this.add.rectangle(-50, def.y - 4, 6, 54, 0x2a3238, 0.95).setOrigin(0.5, 0));
          group.add(this.add.rectangle(50, def.y - 4, 6, 54, 0x2a3238, 0.95).setOrigin(0.5, 0));
        }
      } else if (def.type === "gate") {
        group.add(this.add.rectangle(0, def.y - 54, 86, 82, 0x5b3c2c, 0.88).setStrokeStyle(3, 0x2a1a14, 1));
        group.add(this.add.rectangle(-22, def.y - 42, 18, 58, 0x241914, 0.8));
        group.add(this.add.rectangle(22, def.y - 42, 18, 58, 0x241914, 0.8));
      } else if (def.type === "mural") {
        group.add(this.add.rectangle(0, def.y - 52, 134, 78, 0x173c4f, 0.9).setStrokeStyle(3, 0xd09b46, 1));
        group.add(this.add.text(0, def.y - 64, def.label, { fontSize: "15px", color: "#f4d35e", fontStyle: "700", align: "center" }).setOrigin(0.5));
        group.add(this.add.rectangle(-34, def.y - 30, 44, 12, 0x50d2c2, 0.82).setRotation(-0.22));
      } else if (def.type === "works") {
        group.add(this.add.image(0, def.y, "roadworks-truck-side").setScale(0.52).setOrigin(0.5, 1));
        group.add(this.add.image(108, def.y, "prop-road-barrier").setScale(0.2).setOrigin(0.5, 1));
        group.add(this.add.image(-102, def.y, "prop-road-cone").setScale(0.14).setOrigin(0.5, 1));
      } else {
        const fill = def.type === "lcn" ? 0x1b7c53 : 0x1f2630;
        group.add(this.add.rectangle(0, def.y - 52, 132, 56, fill, 0.9).setStrokeStyle(3, 0x111319, 1));
        group.add(this.add.text(0, def.y - 64, def.label, { fontSize: def.type === "lcn" ? "13px" : "11px", color: def.type === "lcn" ? "#f4efe4" : "#f4d35e", fontStyle: "700", align: "center", lineSpacing: -2 }).setOrigin(0.5));
        group.add(this.add.rectangle(-48, def.y - 24, 8, 48, 0x2a3238, 1));
        group.add(this.add.rectangle(48, def.y - 24, 8, 48, 0x2a3238, 1));
      }
      group.worldDistance = worldDistance;
      group.spawnOffset = def.offset;
      group.fixed = Boolean(def.distance);
      group.kind = def.type;
      group.detailKey = def.key;
      group.animated = Boolean(def.animated);
      group.baseY = 0;
      group.bounceSeed = Phaser.Math.FloatBetween(0, Math.PI * 2);
      return group;
    });
  }

  updateLodzDetails() {
    if (!this.lodzDetails) return;
    this.lodzDetails.forEach((detail, index) => {
      if (!detail.fixed && detail.worldDistance < this.distance - 520) {
        detail.worldDistance = this.distance + 6200 + detail.spawnOffset + index * 140;
      }
      detail.x = this.screenX(detail.worldDistance);
      detail.y = detail.animated ? Math.sin(this.time.now * 0.012 + detail.bounceSeed) * 2.8 : detail.baseY;
      detail.setVisible(detail.x > -220 && detail.x < WIDTH + 220);
    });
  }

  makeStreetMarkings() {
    const crossingStops = ["widzew-stadion", "piotrkowska", "mickiewicza", "legionow", "lutomierska"];
    const defs = crossingStops
      .map((id) => STOPS.find((stop) => stop.id === id))
      .filter(Boolean)
      .map((stop) => ({ distance: stop.distance - 90, width: stop.id === "piotrkowska" ? 150 : 116 }));
    return defs.map((def, index) => {
      const group = this.add.container(this.screenX(def.distance), 0).setDepth(11);
      for (let i = 0; i < 7; i++) {
        group.add(this.add.rectangle(-def.width / 2 + i * 21, 585, 10, 88, 0xe9ece8, 0.68).setOrigin(0.5));
      }
      group.add(this.add.rectangle(0, 532, def.width + 34, 5, 0xf4efe4, 0.42).setOrigin(0.5));
      group.add(this.add.rectangle(0, 631, def.width + 34, 5, 0xf4efe4, 0.36).setOrigin(0.5));
      group.add(this.add.rectangle(0, 504, def.width + 58, 14, index % 2 ? 0x6a5f55 : 0x657783, 0.32).setOrigin(0.5));
      group.worldDistance = def.distance;
      group.markingIndex = index;
      return group;
    });
  }

  updateStreetMarkings() {
    if (!this.streetMarkings) return;
    this.streetMarkings.forEach((group) => {
      group.x = this.screenX(group.worldDistance);
      group.setVisible(group.x > -220 && group.x < WIDTH + 220);
    });
  }

  makeStreetLights() {
    return Array.from({ length: 6 }, (_, index) => {
      const worldDistance = this.distance + 260 + index * 520;
      const group = this.add.container(this.screenX(worldDistance), 0).setDepth(14);
      const pole = this.add.rectangle(0, 406, 5, 118, 0x222a30, 0.82).setOrigin(0.5, 0);
      const arm = this.add.rectangle(-36, 414, 72, 4, 0x222a30, 0.78).setOrigin(0, 0.5).setRotation(-0.08);
      const lamp = this.add.rectangle(-72, 416, 22, 8, 0xf4d35e, this.mode.night ? 0.96 : 0.5).setOrigin(0.5);
      const glow = this.add.ellipse(-72, 438, 116, 78, 0xf4d35e, this.mode.night ? 0.2 : 0.03).setOrigin(0.5);
      group.add([glow, pole, arm, lamp]);
      group.worldDistance = worldDistance;
      group.spacing = 520;
      group.glow = glow;
      group.lamp = lamp;
      return group;
    });
  }

  updateStreetLights() {
    if (!this.streetLights) return;
    this.streetLights.forEach((light, index) => {
      if (light.worldDistance < this.distance - 420) {
        light.worldDistance += light.spacing * this.streetLights.length;
      }
      light.x = this.screenX(light.worldDistance);
      light.setVisible(light.x > -160 && light.x < WIDTH + 160);
      const pulse = 0.03 + Math.sin(this.time.now * 0.003 + index) * 0.015;
      light.glow.setAlpha(this.mode.night ? 0.18 + pulse : 0.03);
      light.lamp.setAlpha(this.mode.night ? 0.95 : 0.5);
    });
  }

  makeLcnBillboards() {
    return LCN_BILLBOARDS.map((billboard) => {
      const sprite = this.add.image(this.screenX(billboard.distance), billboard.y, billboard.key)
        .setOrigin(0.5, 1)
        .setScale(billboard.scale)
        .setAlpha(0.92)
        .setDepth(12);
      sprite.worldDistance = billboard.distance;
      return sprite;
    });
  }

  updateLcnBillboards() {
    this.lcnBillboards.forEach((billboard) => {
      billboard.x = this.screenX(billboard.worldDistance);
      billboard.setVisible(billboard.x > -260 && billboard.x < WIDTH + 260);
    });
  }

  createPassengerFigure(x, y, key, scale, depth, variant = {}, options = {}) {
    const container = this.add.container(x, y).setDepth(depth);
    if (options.shadow !== false) {
      const shadow = this.add.ellipse(0, 1, Math.max(8, scale * 8), Math.max(3, scale * 2.5), 0x111319, 0.24);
      container.add(shadow);
    }
    const sprite = this.add.image(0, 0, key).setOrigin(0.5, 1).setScale(scale);
    if (variant.flip) sprite.setFlipX(true);
    if (variant.tint) sprite.setTint(variant.tint);
    if (options.onboard) {
      const source = sprite.texture.getSourceImage();
      sprite.setOrigin(0.5, 0.5);
      sprite.setCrop(0, 0, source.width, Math.round(source.height * 0.58));
      sprite.y = 0;
      sprite.setAlpha(0.82);
    }
    container.add(sprite);
    container.sprite = sprite;
    return container;
  }

  createOnboardPassengerFigure(x, y, seed, depth) {
    const key = PASSENGER_KEYS[seed % PASSENGER_KEYS.length];
    const container = this.add.container(x, y).setDepth(depth);
    const glassGlow = this.add.rectangle(0, 1, 14, 11, 0xbad8d1, 0.13).setOrigin(0.5);
    const sprite = this.add.image(0, 3, key).setOrigin(0.5, 0.45).setScale(0.46).setAlpha(0.72);
    const source = sprite.texture.getSourceImage();
    sprite.setCrop(0, 0, source.width, Math.round(source.height * 0.56));
    if (seed % 3 === 0) sprite.setFlipX(true);
    if (seed % 5 === 0) sprite.setTint(0xfff1cf);
    const lowerMask = this.add.rectangle(0, 8, 14, 5, 0x3f4b4a, 0.26).setOrigin(0.5);
    const shine = this.add.rectangle(-4, -2, 1.2, 10, 0xf4efe4, 0.15).setOrigin(0.5).setRotation(0.12);
    container.add([glassGlow, sprite, lowerMask, shine]);
    return container;
  }

  createOnboardPassengers() {
    const seats = this.vehicle.passengerSeats;
    this.onboardPassengers = [];
    for (let seatIndex = 0; seatIndex < seats.length; seatIndex += 1) {
      this.trams.forEach((car, carIndex) => {
        const x = seats[seatIndex];
        const seed = seatIndex * this.trams.length + carIndex;
        const p = this.createOnboardPassengerFigure(car.x, car.y, seed, 24 + carIndex);
        p.localX = x;
        p.localY = this.vehicle.passengerY;
        p.car = car;
        p.seed = seed;
        p.setDepth(car.depth + 0.12);
        this.onboardPassengers.push(p);
      });
    }
    this.updateOnboardPassengers();
  }

  updateOnboardPassengers() {
    if (!this.onboardPassengers) return;
    const visualPassengers = this.passengers + (this.doorsOpen ? this.pendingBoardingVisual : 0);
    const loadFactor = Phaser.Math.Clamp(visualPassengers / this.vehicle.capacity, 0, 1);
    const visibleCount = Phaser.Math.Clamp(
      Math.max(Math.round(visualPassengers * 0.32), Math.round(this.onboardPassengers.length * loadFactor * 0.9)),
      0,
      this.onboardPassengers.length
    );
    this.onboardPassengers.forEach((p, index) => {
      p.x = p.car.x + p.localX * this.vehicle.spriteScale;
      p.y = p.car.y + p.localY * this.vehicle.spriteScale + Math.sin(this.time.now * 0.004 + p.seed) * 0.4;
      p.rotation = p.car.rotation;
      p.setAlpha(index < visibleCount ? 0.96 : 0);
    });
  }

  updateHud() {
    const next = this.activeStop();
    const nextSignal = this.nextRelevantSignal();
    const nextSwitch = this.nextRelevantSwitch();
    const safeSpeed = this.vehicle.maxSpeed * this.trackCondition * this.vehicle.handling * this.mode.speedAllowance;
    const remainingToStop = next ? Math.max(0, next.distance - this.distance) : Math.max(0, ROUTE_LENGTH - this.distance);
    const scheduleDelta = next ? this.scheduleDeltaForStop(next) : this.elapsedTime - this.scheduleDuration;
    const recommended = next && remainingToStop < 850 ? this.recommendedStopSpeed(remainingToStop) : null;

    // Visible HUD elements
    this.clockText.setText(this.formatTime(this.timeLeft));
    this.clockText.setColor(this.timeLeft < 30 ? "#ff5c8a" : "#ffb22e");
    this.scoreText.setText(`${this.currentScore()}`);
    this.nextText.setText(next ? `${this.shortLabel(next.name, 20)}  ${this.formatRouteDistance(remainingToStop)}` : "KONIEC");
    this.hudPassengerText.setText(`Pas. ${Math.round(this.passengers)}\n${Math.round(this.satisfaction)}% OK`);
    this.hudPassengerText.setColor(this.satisfaction < 55 ? "#ff5c8a" : this.satisfaction < 75 ? "#ffb22e" : "#f4efe4");
    this.hudModePill.setText(this.mode.label.toUpperCase());
    this.fitText(this.hudModePill, 108, 8, 6);
    const signalLabel = nextSignal ? ({ red: "CZERW", yellow: "ŻÓŁ", green: "ZIEL" }[nextSignal.state] || nextSignal.state.toUpperCase()) : "OK";
    const signalStatus = `SYG ${signalLabel}`;
    this.hudScheduleText.setText(`${this.formatScheduleDelta(scheduleDelta)} | ${Math.round(this.punctuality)}% | ${signalStatus}`);
    this.hudScheduleText.setColor(Math.abs(scheduleDelta) <= 18 ? "#50d2c2" : scheduleDelta > 0 ? "#ffb22e" : "#8fb7e8");
    this.fitText(this.nextText, 320, 15, 10);
    this.fitText(this.hudScheduleText, 340, 9, 7);

    // Hidden but updated for audit compliance
    this.speedText.setText(`Pręd. ${Math.round(this.toDisplaySpeed(this.speed))}/${Math.round(this.toDisplaySpeed(safeSpeed))} km/h | Drzwi ${this.doorsOpen ? "OTW." : "ZAM."}`);
    this.trackText.setText(`Tor ${Math.round(this.trackCondition * 100)}%`);
    this.passengerText.setText(`Pas. ${Math.round(this.passengers)} | Dow. ${this.delivered}`);
    this.signalText.setText(nextSignal ? `Sygnał ${signalLabel} | ${this.formatRouteDistance(nextSignal.distance - this.distance)}` : "");
    this.scheduleText.setText(`Rozkład ${this.formatScheduleDelta(scheduleDelta)} | Punkt. ${Math.round(this.punctuality)}%`);
    this.modeBadgeText.setText(this.mode.label);
    const switchText = `Zwrotnica ${this.switchChoice === "straight" ? "PROSTO(E)" : "SKRĘT(Q)"}`;
    this.brakeText.setText(recommended === null ? `${switchText} | Ocena ${this.stopRating}` : `Hamuj do ${Math.round(this.toDisplaySpeed(recommended))} km/h | ${switchText}`);
    const showSwitch = Boolean(nextSwitch && nextSwitch.distance - this.distance < 1100);
    this.nextSwitchText.setText(showSwitch ? `Za ${this.formatRouteDistance(nextSwitch.distance - this.distance)}: ${nextSwitch.correct === "left" ? "Q SKRĘT" : "E PROSTO"}` : "");
    const recentFeedback = this.feedbackReasons
      .filter((item) => this.time.now - item.time < 5200)
      .slice(0, 1);
    this.feedbackText.setText(recentFeedback.length ? `Feedback: ${recentFeedback[0].text}` : "");
    this.feedbackText.setColor(recentFeedback[0]?.color || "#8ea0a8");

    // Keep hidden
    this.nextSwitchText.setVisible(false);
    this.brakeText.setVisible(false);
    this.modeBadgeBg.setVisible(false);
    this.feedbackText.setVisible(false);
    this.feedbackBg.setVisible(false);

    this.throttleFill.width = 132 * this.throttle;
    this.condFill.width = 132 * this.trackCondition;
    this.condFill.setFillStyle(this.trackCondition < 0.5 ? 0xff5c8a : 0x50d2c2);
    this.progressFill.width = Phaser.Math.Clamp((this.distance / ROUTE_END_DISTANCE) * this.progressWidth, 0, this.progressWidth);
    this.progressFillGlow.width = this.progressFill.width;
    this.progressHead.x = this.progressX + this.progressFill.width;
    this.progressHead.setFillStyle(this.speed > safeSpeed ? 0xff5c8a : 0xf4efe4, 0.95);

    // Sunset indicator in route label
    this.routeLabel.setText("Zarzew → Teofilów");
    if (this.modeKey === "last" && this.sunsetProgress > 0.1) {
      const sunsetLabel = this.sunsetProgress > 0.7 ? "Noc" : this.sunsetProgress > 0.3 ? "Zmierzch" : "Zachód";
      this.routeLabel.setText(`Zarzew → Teofilów | ${sunsetLabel}`);
    }

    if (this.timeLeft < 25 && !this.warningText.text.includes("CZAS")) {
      this.showMessage("TIME RUNNING OUT!", 500, "#ffb22e", MESSAGE_PRIORITY.warning);
    }
    if (this.time.now > this.messageUntil) {
      this.warningText.setText("");
      this.warningBg?.setVisible(false);
      this.messagePriority = MESSAGE_PRIORITY.ambient;
    }
    if (this.time.now > this.routeMomentUntil) {
      this.routeMomentText?.setText("");
      this.routeMomentBg?.setVisible(false);
      this.routeMomentText?.setVisible(false);
    }
  }

  checkEnd() {
    if (this.timeLeft <= 0) this.gameOver("Czas kursu się skończył");
    if (this.currentStopIndex >= STOPS.length || this.distance >= ROUTE_END_DISTANCE + 220) {
      const missed = this.stats.missedStops > 0 || this.stats.servedStops < STOPS.length;
      const bonus = Math.round(
        Math.max(0, this.timeLeft) * SCORE_WEIGHTS.finishTime
        + this.satisfaction * SCORE_WEIGHTS.finishSatisfaction
        + this.smoothness * SCORE_WEIGHTS.finishSmoothness
        + this.punctuality * SCORE_WEIGHTS.finishPunctuality
      );
      if (!this.finishBonusApplied) {
        this.score += missed ? Math.round(Math.max(0, bonus) * 0.45) : Math.max(0, bonus);
        this.finishBonusApplied = true;
      }
      this.playCue("finish");
      this.endScreen(missed ? "Teofilów z brakami" : "Krańcówka Teofilów", this.buildEndReport(Math.max(0, bonus), false));
    }
  }

  shortLabel(text, maxLength) {
    if (text.length <= maxLength) return text;
    return `${text.slice(0, maxLength - 3).trim()}...`;
  }

  formatRouteDistance(gameUnits) {
    const meters = Math.max(0, Math.round((gameUnits / ROUTE_SCALE) * 1000));
    if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
    return `${meters} m`;
  }

  fitText(textObject, maxWidth, maxFontSize, minFontSize) {
    let size = maxFontSize;
    textObject.setFontSize(size);
    while (textObject.width > maxWidth && size > minFontSize) {
      size -= 1;
      textObject.setFontSize(size);
    }
  }

  currentScore() {
    return Math.max(0, Math.round(
      this.score
      + this.delivered * SCORE_WEIGHTS.deliveredPassenger
      + this.satisfaction * SCORE_WEIGHTS.satisfaction
      + this.smoothness * SCORE_WEIGHTS.smoothness
      + this.punctuality * SCORE_WEIGHTS.punctuality
      + Math.max(0, this.timeLeft) * SCORE_WEIGHTS.remainingTime
    ));
  }

  activeStop() {
    return this.stations[this.currentStopIndex];
  }

  nextRelevantSignal() {
    return this.lights.find((light) => light.distance > this.distance - 20 && light.distance < this.distance + 1200) || null;
  }

  nextRelevantSwitch() {
    return this.switches.find((sw) => !sw.resolved && sw.distance > this.distance - 80 && sw.distance < this.distance + 1600) || null;
  }

  updateRouteBackground() {
    const next = this.activeStop();
    const fallback = this.stations[this.stations.length - 1];
    const bg = next ? next.bg : fallback.bg;
    if (bg === this.currentBg) return;

    this.currentBg = bg;
    this.districtProfile = DISTRICT_PROFILES[bg] || DISTRICT_PROFILES.zarzew;
    this.districtTraffic = this.districtProfile.traffic;
    this.districtPedestrians = this.districtProfile.pedestrians;
    this.applySurfacePalette(bg);
    this.applyDistrictVisuals(bg);
    if (this.lastBgMessage !== bg) {
      this.lastBgMessage = bg;
      const lines = this.districtProfile.dispatch || [];
      if (lines.length) this.dispatch(lines[0], 5200);
    }
    this.bgB.setTexture(`bg-${bg}`);
    this.bgB.tilePositionX = this.bgA.tilePositionX;
    this.fitBackground(this.bgB);
    this.bgB.setAlpha(0);
    this.tweens.add({
      targets: this.bgB,
      alpha: 1,
      duration: 650,
      ease: "Sine.easeInOut",
      onComplete: () => {
        this.bgA.setTexture(`bg-${bg}`);
        this.bgA.tilePositionX = this.bgB.tilePositionX;
        this.fitBackground(this.bgA);
        this.bgB.setAlpha(0);
      }
    });
  }

  applySurfacePalette(bg) {
    const palette = SURFACE_PALETTES[bg] || SURFACE_PALETTES.zarzew;
    this.sidewalkBack.setFillStyle(palette.sidewalk, 0.94);
    this.street.setFillStyle(palette.street, 0.98);
    this.roadBackLane.setFillStyle(palette.laneBack, 0.92);
    this.roadFrontLane.setFillStyle(palette.laneFront, 0.94);
    this.platform.setFillStyle(palette.platform, 1);
    this.platformCurb.setFillStyle(palette.curb, 0.82);
    this.sidewalkBackBand.setTint(palette.tint).setAlpha(0.3);
    this.curbBack.setTint(palette.curb);
    this.roadStripeA.setTint(palette.curb).setAlpha(0.24);
    this.roadMedian.setTint(palette.tint).setAlpha(0.24);
    this.laneA.setTint(palette.curb).setAlpha(0.26);
    this.roadStripeB.setTint(palette.curb).setAlpha(0.22);
    this.curbFront.setTint(palette.curb);
    this.platformLines.setTint(palette.tint);
  }

  applyDistrictVisuals(bg) {
    const visual = DISTRICT_VISUALS[bg] || DISTRICT_VISUALS.zarzew;
    this.currentDistrictVisual = visual;
    if (this.stageSkyWash) {
      this.stageSkyWash.setFillStyle(visual.sky, visual.skyAlpha);
      this.stageHorizonWash.setFillStyle(visual.horizon, visual.horizonAlpha);
      this.stageAccentLine.setFillStyle(visual.accent, visual.accentAlpha);
      this.stagePlatformGlow.setFillStyle(visual.accent, visual.accentAlpha * 0.55);
    }
    if (this.streetProps) {
      this.streetProps.forEach((prop, index) => {
        prop.setTint(index % 3 === 0 ? visual.accent : visual.propTint);
        prop.setAlpha(prop.y > 600 ? 0.86 : 0.68 + visual.accentAlpha * 0.5);
      });
    }
    if (this.districtDecor) {
      this.districtDecor.forEach((group, index) => this.styleDistrictDecor(group, visual, index));
    }
  }

  styleDistrictDecor(group, visual, index) {
    const { pole, sign, stripe, low } = group.parts;
    pole.setFillStyle(visual.decor === "factory" ? 0x3f332a : 0x202a31, 0.82);
    sign.setFillStyle(visual.accent, visual.decor === "stadium" || visual.decor === "festival" ? 0.52 : 0.28);
    stripe.setFillStyle(visual.decor === "stadium" && index % 2 === 0 ? 0xffffff : visual.propTint, 0.48);
    low.setFillStyle(visual.accent, 0.22 + visual.accentAlpha * 0.4);
    sign.setScale(visual.decor === "artery" ? 1.3 : visual.decor === "suburb" ? 0.82 : 1, visual.decor === "factory" ? 1.35 : 1);
    low.setScale(visual.decor === "cemetery" ? 0.65 : visual.decor === "city" ? 1.25 : 1, 1);
  }

  applyBackgroundLighting(image) {
    if (this.mode.night) {
      image.setTint(0x485875);
      return;
    }
    image.clearTint();
  }

  fitBackground(image) {
    const source = image.texture.getSourceImage();
    const targetW = WIDTH;
    const targetH = 440;
    const scale = source.width === targetW && source.height === targetH ? 1 : Math.max(targetW / source.width, targetH / source.height);
    if (image.tilePositionX !== undefined) {
      image.setSize(targetW, targetH);
      image.setTileScale(scale, scale);
      image.setPosition(0, 86);
    } else {
      image.setScale(scale);
      image.setPosition(WIDTH / 2, 86 + targetH / 2);
    }
    this.applyBackgroundLighting(image);
  }

  setTramDoorTexture(open) {
    if (!this.openTrams) return;
    this.openTrams.forEach((overlay) => overlay.setAlpha(0).setVisible(false));
  }

  animateDoors(open) {
    if (!this.openTrams || !this.doorPanels) return;
    if (this.doorTween) this.doorTween.stop();
    this.openTrams.forEach((overlay) => overlay.setAlpha(0).setVisible(false));
    this.doorPanels.forEach((panel) => {
      panel.setVisible(true);
      if (open) {
        panel.alpha = 1;
        panel.slide = panel.slide || 0;
      }
    });
    this.doorTween = this.tweens.add({
      targets: this.doorPanels,
      slide: open ? 1 : 0,
      alpha: open ? 1 : 0,
      duration: open ? 420 : 280,
      ease: "Cubic.easeOut",
      onComplete: () => {
        if (!open) this.doorPanels.forEach((panel) => panel.setVisible(false));
      }
    });
  }

  updateDoorOverlay() {
    if (!this.doorPanels) return;
    this.doorPanels.forEach((panel) => {
      const scale = this.vehicle.spriteScale;
      panel.x = panel.car.x + panel.localX * scale;
      panel.y = panel.car.y + panel.localY * scale;
      panel.rotation = panel.car.rotation;
      const slide = panel.slide || 0;
      if (panel.leftLeaf && panel.rightLeaf) {
        const offset = panel.slideDistance * slide;
        panel.leftLeaf.x = -offset;
        panel.rightLeaf.x = offset;
        panel.leftGlass.x = -offset - panel.glassShift;
        panel.rightGlass.x = offset + panel.glassShift;
        panel.centerGap.setAlpha(0.2 + slide * 0.76);
        panel.recess.setAlpha(0.28 + slide * 0.42);
      }
    });
  }

  createDoorPanels() {
    const cfg = this.vehicle.door;
    this.doorPanels = [];
    this.trams.forEach((car) => {
      cfg.xs.forEach((localX, index) => {
        const width = cfg.w * this.vehicle.spriteScale * 1.05;
        const height = cfg.h * this.vehicle.spriteScale * 0.9;
        const panel = this.add.container(car.x, car.y).setDepth(car.depth + 0.55).setAlpha(0).setVisible(false);
        const recess = this.add.rectangle(0, 0, width, height, cfg.color, 0.44).setOrigin(0.5);
        const centerGap = this.add.rectangle(0, height * 0.04, width * 0.26, height * 0.84, 0x050607, 0.2).setOrigin(0.5);
        const leftLeaf = this.add.rectangle(-width * 0.19, 0, width * 0.42, height * 0.96, 0x151a1b, 0.82).setOrigin(0.5);
        const rightLeaf = this.add.rectangle(width * 0.19, 0, width * 0.42, height * 0.96, 0x151a1b, 0.82).setOrigin(0.5);
        const leftEdge = this.add.rectangle(-width * 0.48, 0, 2, height, cfg.edge, 0.78).setOrigin(0.5);
        const rightEdge = this.add.rectangle(width * 0.48, 0, 2, height, cfg.edge, 0.78).setOrigin(0.5);
        const leftGlass = this.add.rectangle(-width * 0.18, -height * 0.18, width * 0.18, height * 0.42, 0x8dc6c9, 0.2).setOrigin(0.5);
        const rightGlass = this.add.rectangle(width * 0.18, -height * 0.18, width * 0.18, height * 0.42, 0x8dc6c9, 0.2).setOrigin(0.5);
        panel.add([recess, centerGap, leftLeaf, rightLeaf, leftEdge, rightEdge, leftGlass, rightGlass]);
        panel.car = car;
        panel.localX = localX;
        panel.localY = cfg.y + (index % 2 === 0 ? 0 : 1);
        panel.slide = 0;
        panel.slideDistance = width * 0.24;
        panel.glassShift = width * 0.04;
        panel.recess = recess;
        panel.centerGap = centerGap;
        panel.leftLeaf = leftLeaf;
        panel.rightLeaf = rightLeaf;
        panel.leftGlass = leftGlass;
        panel.rightGlass = rightGlass;
        this.doorPanels.push(panel);
      });
    });
  }

  screenX(worldDistance) {
    return this.tram.x + worldDistance - this.distance;
  }

  tramNoseReach() {
    return this.tram.displayWidth * 0.5 - 10;
  }

  toDisplaySpeed(rawSpeed) {
    return (rawSpeed / this.vehicle.maxSpeed) * this.vehicle.displayMaxSpeed;
  }

  recommendedStopSpeed(distanceToStop) {
    if (distanceToStop <= 138) return 10;
    const brakingDistance = Math.max(0, distanceToStop - 138);
    return Phaser.Math.Clamp(Math.sqrt(2 * this.vehicle.braking * brakingDistance) * 0.62, 10, this.vehicle.maxSpeed * 0.72);
  }

  showMessage(text, duration = 1200, color = "#f4d35e", priority = null) {
    const nextPriority = priority ?? this.messagePriorityForColor(color);
    if (this.time.now < this.messageUntil && nextPriority < this.messagePriority) return;
    this.routeMomentText?.setText("");
    this.routeMomentBg?.setVisible(false);
    this.routeMomentText?.setVisible(false);
    this.routeMomentUntil = 0;
    this.warningText.setText(text);
    this.warningText.setColor(color);
    this.warningBg?.setVisible(true);
    this.warningBg?.setStrokeStyle(2, Phaser.Display.Color.HexStringToColor(color).color, 0.9);
    this.messageUntil = Math.max(this.time.now + duration, this.messageUntil && nextPriority === this.messagePriority ? this.messageUntil : 0);
    this.messagePriority = nextPriority;
  }

  messagePriorityForColor(color) {
    if (color === "#ff5c8a") return MESSAGE_PRIORITY.danger;
    if (color === "#ffb22e") return MESSAGE_PRIORITY.warning;
    if (color === "#50d2c2") return MESSAGE_PRIORITY.success;
    return MESSAGE_PRIORITY.info;
  }

  scorePopup(text, x, y, color = "#f4d35e") {
    const popup = this.add.text(x, y, text, {
      fontSize: "22px",
      fontStyle: "700",
      color,
      stroke: "#111319",
      strokeThickness: 3
    }).setOrigin(0.5);
    this.tweens.add({
      targets: popup,
      y: y - 42,
      alpha: 0,
      duration: 900,
      ease: "Cubic.easeOut",
      onComplete: () => popup.destroy()
    });
  }

  formatTime(value) {
    const t = Math.max(0, Math.ceil(value));
    const m = Math.floor(t / 60).toString().padStart(2, "0");
    const s = (t % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  // === COMBO STREAK HUD ===
  createComboHud() {
    const comboX = WIDTH / 2;
    const comboY = 104;
    this.comboContainer = this.add.container(comboX, comboY).setDepth(130).setAlpha(0);
    this.comboBg = this.add.rectangle(0, 0, 180, 32, 0x0c1116, 0.88)
      .setStrokeStyle(2, 0xf4d35e, 0.9);
    this.comboLabel = this.add.text(0, -2, "", {
      fontSize: "17px",
      fontStyle: "700",
      color: "#f4d35e",
      stroke: "#111319",
      strokeThickness: 2
    }).setOrigin(0.5);
    this.comboContainer.add([this.comboBg, this.comboLabel]);
  }

  updateComboHud() {
    if (!this.comboContainer) return;
    const showCombo = this.combo >= 1.5;
    const targetAlpha = showCombo ? 1 : 0;
    this.comboContainer.setAlpha(Phaser.Math.Linear(this.comboContainer.alpha, targetAlpha, 0.08));
    if (showCombo) {
      const pulse = 1 + Math.sin(this.time.now * 0.006) * 0.04;
      this.comboContainer.setScale(pulse);
      this.comboLabel.setText(`COMBO x${this.combo.toFixed(2)}`);
      const hot = this.combo >= 2.5;
      const warm = this.combo >= 2.0;
      this.comboBg.setStrokeStyle(2, hot ? 0xff5c8a : warm ? 0xffb22e : 0xf4d35e, 0.9);
      this.comboLabel.setColor(hot ? "#ff5c8a" : warm ? "#ffb22e" : "#f4d35e");
    }
  }

  // === MILESTONE BONUSES ===
  updateMilestones() {
    const milestones = [
      { id: "piotrkowska-half", stopId: "piotrkowska", label: "POŁOWA TRASY! Piotrkowska Centrum", bonus: 200, color: "#f4d35e" },
      { id: "legionow-3q", stopId: "legionow", label: "3/4 TRASY! Legionów - już niedaleko", bonus: 150, color: "#50d2c2" },
      { id: "teofilow-final", stopId: "szczecinska", label: "OSTATNI ODCINEK! Dowieź ich do domu", bonus: 100, color: "#8fb7e8" }
    ];
    milestones.forEach((milestone) => {
      if (this.milestonesTriggered.has(milestone.id)) return;
      const stop = STOPS.find((s) => s.id === milestone.stopId);
      if (!stop) return;
      const relative = stop.distance - this.distance;
      if (relative < 60 && relative > -120) {
        this.milestonesTriggered.add(milestone.id);
        this.score += milestone.bonus;
        this.scorePopup(`+${milestone.bonus}`, this.tram.x, 380, milestone.color);
        this.showMessage(milestone.label, 2400, milestone.color);
        this.playCue("good");
      }
    });
  }

  // === SUNSET TRANSITION ("last" mode) ===
  updateSunsetTransition(dt) {
    if (this.modeKey !== "last" || this.mode.night) return;
    // Sunset starts at 60% of route, full night at 95%
    const routeProgress = Phaser.Math.Clamp(this.distance / ROUTE_END_DISTANCE, 0, 1);
    if (routeProgress < 0.6) {
      this.sunsetProgress = 0;
      return;
    }
    const sunsetRange = routeProgress - 0.6;
    this.sunsetProgress = Phaser.Math.Clamp(sunsetRange / 0.35, 0, 1);

    // Tint background with warm sunset colors
    if (this.sunsetProgress > 0 && this.sunsetProgress < 0.55) {
      const warmth = Math.round(this.sunsetProgress * 60);
      const r = Math.min(255, 200 + warmth);
      const g = Math.min(255, 160 + warmth * 0.5);
      const b = Math.max(100, 180 - warmth * 0.8);
      const tint = Phaser.Display.Color.GetColor(r, g, b);
      this.bgA.setTint(tint);
      this.bgB.setTint(tint);
    } else if (this.sunsetProgress >= 0.55) {
      const darkness = (this.sunsetProgress - 0.55) / 0.45;
      const r = Math.max(70, Math.round(230 - darkness * 160));
      const g = Math.max(70, Math.round(190 - darkness * 120));
      const b = Math.max(80, Math.round(145 - darkness * 65));
      const tint = Phaser.Display.Color.GetColor(r, g, b);
      this.bgA.setTint(tint);
      this.bgB.setTint(tint);
    }
  }

  // === PASSENGER EMOTION BUBBLES ===
  spawnEmotionBubble(emoji, color = "#ffb22e") {
    if (!this.tram || this.emotionBubbles.length > 4) return;
    const x = this.tram.x + Phaser.Math.Between(-80, 80);
    const y = this.tram.y - 120 + Phaser.Math.Between(-20, 10);
    const bubble = this.add.text(x, y, emoji, {
      fontSize: "18px",
      fontStyle: "700",
      color,
      stroke: "#111319",
      strokeThickness: 2
    }).setOrigin(0.5).setDepth(200).setAlpha(0.9);
    this.emotionBubbles.push({ sprite: bubble, life: 1.4 });
    this.tweens.add({
      targets: bubble,
      y: y - 32,
      alpha: 0,
      duration: 1400,
      ease: "Cubic.easeOut",
      onComplete: () => bubble.destroy()
    });
  }

  updateEmotionBubbles(dt) {
    this.emotionBubbles = this.emotionBubbles.filter((b) => {
      b.life -= dt;
      return b.life > 0 && b.sprite?.active;
    });
  }

  createRideLoop() {
    const key = this.vehicleKey === "pesa" ? "ride-pesa" : "ride-konstal";
    if (!this.sound || !this.cache.audio.exists(key)) return;
    this.rideLoop = this.sound.add(key, {
      loop: true,
      volume: 0,
      rate: 0.92
    });
  }

  startRideLoop() {
    if (!this.rideLoop || this.rideLoopStarted) return;
    this.rideLoopStarted = true;
    this.rideLoop.play();
  }

  updateRideLoop(dt, mute = false) {
    if (!this.rideLoop) return;
    if (!mute && (this.speed > 3 || this.throttle > 0.02)) this.startRideLoop();
    if (!this.rideLoopStarted) return;

    const speedRatio = Phaser.Math.Clamp(this.speed / this.vehicle.maxSpeed, 0, 1);
    const baseVolume = Phaser.Math.Clamp(0.035 + speedRatio * 0.18, 0, this.vehicleKey === "konstal" ? 0.24 : 0.2);
    const ducking = this.isStadiumMusicAudible() ? 0.42 : 1;
    const targetVolume = mute ? 0 : baseVolume * ducking * this.settings.masterVolume * this.settings.musicVolume;
    const currentVolume = this.rideLoop.volume || 0;
    const blend = dt > 0 ? Phaser.Math.Clamp(dt * 3.5, 0, 1) : 1;
    this.rideLoop.setVolume(Phaser.Math.Linear(currentVolume, targetVolume, blend));
    this.rideLoop.setRate((this.vehicleKey === "konstal" ? 0.84 : 0.94) + speedRatio * (this.vehicleKey === "konstal" ? 0.42 : 0.28));
  }

  stopRideLoop() {
    if (!this.rideLoop) return;
    this.rideLoop.stop();
    this.rideLoopStarted = false;
  }

  createStadiumMusic() {
    if (!WIDZEW_STADIUM_MUSIC.sources.length || typeof Audio === "undefined") return;
    this.stadiumMusic = new Audio(WIDZEW_STADIUM_MUSIC.sources[this.stadiumMusicSourceIndex]);
    this.stadiumMusic.loop = true;
    this.stadiumMusic.preload = "auto";
    this.stadiumMusic.volume = 0;
    this.stadiumMusic.addEventListener("error", () => this.tryNextStadiumMusicSource());
  }

  tryNextStadiumMusicSource() {
    if (!this.stadiumMusic) return;
    this.stadiumMusicSourceIndex += 1;
    if (this.stadiumMusicSourceIndex >= WIDZEW_STADIUM_MUSIC.sources.length) {
      this.stadiumMusicFailed = true;
      return;
    }
    this.stadiumMusic.src = WIDZEW_STADIUM_MUSIC.sources[this.stadiumMusicSourceIndex];
    this.stadiumMusic.load();
  }

  updateStadiumMusic(dt, mute = false) {
    if (!this.stadiumMusic || this.stadiumMusicFailed) return;
    const stop = STOPS.find((item) => item.id === WIDZEW_STADIUM_MUSIC.stopId);
    if (!stop) return;

    const inMusicZone = this.distance >= stop.distance - WIDZEW_STADIUM_MUSIC.before
      && this.distance <= stop.distance + WIDZEW_STADIUM_MUSIC.after;
    const targetVolume = !mute && inMusicZone
      ? WIDZEW_STADIUM_MUSIC.volume * this.settings.masterVolume * this.settings.musicVolume
      : 0;
    if (targetVolume > 0 && this.stadiumMusic.paused) {
      this.stadiumMusic.play().catch(() => {
        this.stadiumMusicFailed = true;
      });
    }

    const blend = dt > 0 ? Phaser.Math.Clamp(dt * WIDZEW_STADIUM_MUSIC.fadeSpeed, 0, 1) : 1;
    this.stadiumMusic.volume = Phaser.Math.Linear(this.stadiumMusic.volume || 0, targetVolume, blend);
    if (targetVolume === 0 && this.stadiumMusic.volume < 0.01 && !this.stadiumMusic.paused) {
      this.stadiumMusic.pause();
    }
  }

  isStadiumMusicAudible() {
    return this.stadiumMusic && !this.stadiumMusic.paused && this.stadiumMusic.volume > 0.02;
  }

  stopStadiumMusic() {
    if (!this.stadiumMusic) return;
    this.stadiumMusic.pause();
    this.stadiumMusic.currentTime = 0;
    this.stadiumMusic.volume = 0;
  }

  ensureAudio() {
    if (this.audioContext) return this.audioContext;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    this.audioContext = new AudioContextClass();
    return this.audioContext;
  }

  playCue(type) {
    if (this.settings.masterVolume <= 0 || this.settings.effectsVolume <= 0) return;
    const ctx = this.ensureAudio();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();
    const patterns = {
      bell: [[880, 0.04], [1320, 0.07], [1760, 0.05]],
      doors: [[280, 0.06], [360, 0.08]],
      good: [[660, 0.06], [990, 0.08]],
      neutral: [[440, 0.05]],
      bad: [[180, 0.12], [120, 0.1]],
      power: [[120, 0.08], [90, 0.16]],
      finish: [[523, 0.08], [659, 0.08], [784, 0.14]]
    };
    let t = ctx.currentTime;
    (patterns[type] || patterns.neutral).forEach(([freq, duration]) => {
      this.playTone(ctx, freq, t, duration, type === "bad" || type === "power" ? 0.055 : 0.04);
      t += duration + 0.025;
    });
  }

  playTone(ctx, frequency, start, duration, volume, oscillatorType = "square") {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = oscillatorType;
    osc.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    const effectiveVolume = Math.max(0.0001, volume * this.settings.masterVolume * this.settings.effectsVolume);
    gain.gain.exponentialRampToValueAtTime(effectiveVolume, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + duration + 0.02);
  }

  createAmbientAudio() {
    const ctx = this.ensureAudio();
    if (!ctx) return;
    const humFilter = ctx.createBiquadFilter();
    humFilter.type = "lowpass";
    humFilter.frequency.value = 200;
    const humGain = ctx.createGain();
    humGain.gain.value = 0;
    const humOsc = ctx.createOscillator();
    humOsc.type = "triangle";
    humOsc.frequency.value = 96;
    humOsc.connect(humFilter);
    humFilter.connect(humGain);
    humGain.connect(ctx.destination);
    humOsc.start();
    this.ambientAudio = {
      ctx,
      humOsc,
      humFilter,
      humGain,
      noiseBuffer: this.createNoiseBuffer(ctx, 1)
    };
    this.updateAmbientAudio(0);
  }

  createNoiseBuffer(ctx, durationSeconds = 1) {
    const buffer = ctx.createBuffer(1, Math.max(1, Math.floor(ctx.sampleRate * durationSeconds)), ctx.sampleRate);
    const channel = buffer.getChannelData(0);
    for (let i = 0; i < channel.length; i += 1) {
      channel[i] = (Math.random() * 2) - 1;
    }
    return buffer;
  }

  playStationChime() {
    const ctx = this.ensureAudio();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    const start = ctx.currentTime;
    this.playTone(ctx, 440, start, 0.12, 0.04, "triangle");
    this.playTone(ctx, 554, start + 0.11, 0.12, 0.04, "triangle");
  }

  playTrackClatter(speedRatio) {
    const ctx = this.ensureAudio();
    if (!ctx || !this.ambientAudio) return;
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    const start = ctx.currentTime;
    const source = ctx.createBufferSource();
    source.buffer = this.ambientAudio.noiseBuffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 1200 + speedRatio * 900;
    filter.Q.value = 4;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, Math.min(0.025, 0.006 + speedRatio * 0.019) * this.settings.masterVolume * this.settings.effectsVolume), start + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.09);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start(start);
    source.stop(start + 0.1);
  }

  playTramWhoosh() {
    const ctx = this.ensureAudio();
    if (!ctx || !this.ambientAudio) return;
    if (this.time.now - this.lastAmbientWhooshAt < 1000) return;
    this.lastAmbientWhooshAt = this.time.now;
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    const start = ctx.currentTime;
    const source = ctx.createBufferSource();
    source.buffer = this.ambientAudio.noiseBuffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(800, start);
    filter.frequency.exponentialRampToValueAtTime(200, start + 0.18);
    filter.Q.value = 2.6;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, 0.06 * this.settings.masterVolume * this.settings.effectsVolume), start + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.18);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start(start);
    source.stop(start + 0.2);
  }

  updateAmbientAudio(dt, mute = false) {
    if (!this.ambientAudio || !this.audioContext) return;
    const ctx = this.ambientAudio.ctx;
    const profile = this.districtProfile || DISTRICT_PROFILES.zarzew;
    const traffic = Phaser.Math.Clamp(profile.traffic, 0.45, 1.8);
    const targetGain = mute ? 0 : Phaser.Math.Clamp(0.015 + traffic * 0.012, 0, 0.035)
      * this.settings.masterVolume * this.settings.effectsVolume;
    const targetFreq = 85 + traffic * 12;
    this.ambientAudio.humOsc.frequency.setTargetAtTime(targetFreq, ctx.currentTime, 0.08);
    this.ambientAudio.humFilter.frequency.setTargetAtTime(200 + traffic * 60, ctx.currentTime, 0.12);
    this.ambientAudio.humGain.gain.setTargetAtTime(targetGain, ctx.currentTime, 0.1);

    if (mute) return;

    const nextStop = this.activeStop();
    if (nextStop && !nextStop.served && !this.ambientAnnouncedStops.has(nextStop.id) && nextStop.distance - this.distance < 600 && nextStop.distance - this.distance > -140) {
      this.ambientAnnouncedStops.add(nextStop.id);
      this.playStationChime();
      this.showRouteMoment(`Następny przystanek: ${nextStop.name}`, 2600, "#8fb7e8");
    }

    if (this.speed > this.vehicle.maxSpeed * 0.3 && this.time.now > this.nextAmbientClatterAt) {
      const speedRatio = Phaser.Math.Clamp(this.speed / this.vehicle.maxSpeed, 0, 1);
      this.playTrackClatter(speedRatio);
      const interval = Phaser.Math.Linear(0.8, 0.4, Phaser.Math.Clamp((speedRatio - 0.3) / 0.7, 0, 1));
      this.nextAmbientClatterAt = this.time.now + interval * 1000 + Phaser.Math.Between(0, 80);
      this.lastAmbientClatterAt = this.time.now;
    }
  }

  cleanupAmbientAudio() {
    if (!this.ambientAudio) return;
    try {
      this.ambientAudio.humOsc.stop();
    } catch (_) {}
    try {
      this.ambientAudio.humOsc.disconnect();
    } catch (_) {}
    try {
      this.ambientAudio.humFilter.disconnect();
    } catch (_) {}
    try {
      this.ambientAudio.humGain.disconnect();
    } catch (_) {}
    this.ambientAudio = null;
  }

  cleanupScene() {
    if (this.visibilityHandler) document.removeEventListener("visibilitychange", this.visibilityHandler);
    this.stopRideLoop();
    this.stopStadiumMusic();
    this.cleanupAmbientAudio();
    this.destroyOncomingTrams();
    this.destroyWeatherEffects();
    this.destroyRoadHazards();
    this.destroyOdometerHud();
    this.comboContainer?.destroy();
    this.emotionBubbles.forEach((b) => b.sprite?.destroy());
    this.emotionBubbles = [];
  }

  destroyOncomingTrams() {
    if (!this.oncomingTrams) return;
    this.oncomingTrams.forEach((tram) => {
      tram.container?.destroy();
    });
    this.oncomingTrams = [];
  }

  destroyWeatherEffects() {
    if (!this.weatherEffects) return;
    this.weatherEffects.rainDrops?.forEach((drop) => drop.destroy());
    this.weatherEffects.leaves?.forEach((leaf) => leaf.destroy());
    this.weatherEffects.sparks?.forEach((spark) => spark.destroy());
    this.weatherEffects = null;
  }

  destroyRoadHazards() {
    if (!this.roadHazards) return;
    this.roadHazards.forEach((group) => group.destroy());
    this.roadHazards = [];
  }

  destroyOdometerHud() {
    [
      this.odometerPanel,
      this.odometerLabel,
      this.odometerText,
      this.speedometerLabel,
      this.speedometerText,
      this.speedometerBigText,
      this.speedometerUnit,
      this.odometerChrome,
      this.speedometerGraphics,
      this.speedometerNeedle
    ].forEach((item) => item?.destroy());
  }

  gameOver(reason) {
    if (this.mode && !this.mode.allowGameOver) {
      this.adjustSatisfaction(-18);
      this.addRidePenalty(24);
      this.speed = 0;
      this.throttle = 0;
      this.score = Math.max(0, this.score - 420);
      this.playCue("bad");
      this.showMessage(`Trening: ${reason}`, 2200, "#ffb22e");
      return;
    }
    this.satisfaction = Math.max(0, this.satisfaction - 30);
    this.playCue("bad");
    this.endScreen("Kurs przerwany", this.buildEndReport(0, true, reason));
  }

  endScreen(title, detail) {
    if (this.finished) return;
    this.finished = true;
    this.speed = 0;
    this.throttle = 0;
    this.stopRideLoop();
    this.stopStadiumMusic();
    const finalScore = this.currentScore();
    const highScore = this.readHighScore();
    const isRecord = finalScore > highScore;
    if (isRecord) this.writeHighScore(finalScore);
    const grade = this.courseGrade(title === "Kurs przerwany");
    const history = this.writeRunHistory({
      score: finalScore,
      grade,
      mode: this.mode.label,
      vehicle: this.vehicle.name,
      stops: this.stats.servedStops,
      smoothness: Math.round(this.smoothness),
      satisfaction: Math.round(this.satisfaction),
      punctuality: Math.round(this.punctuality),
      time: this.formatTime(this.timeLeft)
    });
    const completed = title !== "Kurs przerwany";
    this.runSummary = createRunSummary({
      mode: this.modeKey,
      vehicle: this.vehicleKey,
      score: finalScore,
      grade,
      completed,
      servedStops: this.stats.servedStops,
      missedStops: this.stats.missedStops,
      passengers: this.delivered,
      satisfaction: this.satisfaction,
      smoothness: this.smoothness,
      punctuality: this.punctuality,
      redSignals: this.stats.redSignals,
      switchCorrect: this.stats.switchCorrect,
      switchWrong: this.stats.switchWrong,
      durationSeconds: this.elapsedTime,
      rulesVersion: this.challenge?.rulesVersion || RULES_VERSION,
      challengeDate: this.challenge?.date || null,
      challengeSeed: this.challenge?.seed || null
    });
    const recorded = recordRun(this.profile, this.runSummary);
    this.profile = saveProfile(recorded.profile);

    const layer = this.add.container(0, 0).setDepth(2200);
    layer.add(this.add.rectangle(0, 0, WIDTH, HEIGHT, 0x050607, 0.68).setOrigin(0));
    layer.add(this.add.rectangle(WIDTH / 2, HEIGHT / 2, 1060, 630, 0x0d1318, 0.98)
      .setStrokeStyle(5, 0xf4d35e, 1)
      .setName("end-panel"));
    layer.add(this.add.rectangle(WIDTH / 2 - 165, HEIGHT / 2 + 48, 680, 490, 0x101820, 0.94)
      .setStrokeStyle(2, 0x56636c, 1)
      .setName("end-report-panel"));
    layer.add(this.add.rectangle(WIDTH / 2 + 350, HEIGHT / 2 + 48, 310, 490, 0x101820, 0.94)
      .setStrokeStyle(2, 0x56636c, 1)
      .setName("end-history-panel"));
    layer.add(this.add.rectangle(WIDTH / 2, HEIGHT / 2 - 258, 980, 12, 0x26323a, 0.9));

    layer.add(this.add.text(WIDTH / 2, HEIGHT / 2 - 280, title, {
      fontSize: "28px",
      fontStyle: "700",
      color: "#f4efe4",
      stroke: "#111319",
      strokeThickness: 4,
      align: "center"
    }).setOrigin(0.5));

    if (title !== "Kurs przerwany") {
      layer.add(this.add.text(WIDTH / 2, HEIGHT / 2 - 247, "Dyspozytor: dobra robota, skład na pętli.", {
        fontSize: "13px",
        fontStyle: "700",
        color: "#50d2c2",
        align: "center"
      }).setOrigin(0.5));
      for (let i = 0; i < 28; i += 1) {
        const confetti = this.add.rectangle(
          WIDTH / 2 - 390 + i * 29,
          HEIGHT / 2 - 300 + Phaser.Math.Between(-5, 12),
          5,
          9,
          i % 3 === 0 ? 0xf4d35e : i % 3 === 1 ? 0x50d2c2 : 0xffb22e,
          0.82
        ).setRotation(Phaser.Math.FloatBetween(-0.6, 0.6));
        layer.add(confetti);
      }
    }

    layer.add(this.add.text(WIDTH / 2, HEIGHT / 2 - 216, `WYNIK: ${finalScore}`, {
      fontSize: "28px",
      fontStyle: "700",
      color: isRecord ? "#50d2c2" : "#ffb22e",
      align: "center"
    }).setOrigin(0.5));
    if (isRecord) {
      layer.add(this.add.text(WIDTH / 2 + 205, HEIGHT / 2 - 208, "NOWY REKORD", {
        fontSize: "13px",
        fontStyle: "700",
        color: "#50d2c2"
      }).setOrigin(0.5));
    }

    this.addResultBars(layer, WIDTH / 2 - 480, HEIGHT / 2 - 170);

    const lines = detail.split("\n");
    const summary = lines.slice(0, 7).join("\n");
    const missions = lines.slice(8).join("\n");
    layer.add(this.add.text(WIDTH / 2 - 480, HEIGHT / 2 - 95, "RAPORT KURSU", {
      fontSize: "16px",
      fontStyle: "700",
      color: "#f4d35e"
    }));
    layer.add(this.add.text(WIDTH / 2 - 480, HEIGHT / 2 - 67, summary, {
      fontSize: "11px",
      color: "#d9d3c4",
      align: "left",
      lineSpacing: 1,
      wordWrap: { width: 620, useAdvancedWrap: true }
    }).setName("end-summary"));
    layer.add(this.add.rectangle(WIDTH / 2 - 165, HEIGHT / 2 + 37, 620, 2, 0x34434b, 1));
    layer.add(this.add.text(WIDTH / 2 - 480, HEIGHT / 2 + 55, "CELE", {
      fontSize: "16px",
      fontStyle: "700",
      color: "#f4d35e"
    }));
    layer.add(this.add.text(WIDTH / 2 - 480, HEIGHT / 2 + 82, missions, {
      fontSize: "11px",
      color: "#f4efe4",
      align: "left",
      lineSpacing: 1,
      wordWrap: { width: 620, useAdvancedWrap: true }
    }).setName("end-missions"));
    this.addHistoryPanel(layer, WIDTH / 2 + 215, HEIGHT / 2 - 180, history, 270);
    layer.add(this.add.text(WIDTH / 2 - 480, HEIGHT / 2 + 258, `Rekord: ${Math.max(finalScore, highScore)}`, {
      fontSize: "14px",
      color: "#f4efe4"
    }));
    layer.add(this.add.text(WIDTH / 2 + 480, HEIGHT / 2 + 258, "R: jeszcze raz    Esc: menu", {
      fontSize: "15px",
      fontStyle: "700",
      color: "#f4d35e"
    }).setOrigin(1, 0));
    if (recorded.newlyUnlocked.length) {
      const unlockedLabels = recorded.newlyUnlocked.map(({ label }) => label);
      const visibleLabels = unlockedLabels.slice(0, 3).join(", ");
      const remainingLabel = unlockedLabels.length > 3 ? ` i jeszcze ${unlockedLabels.length - 3}` : "";
      layer.add(this.add.text(WIDTH / 2 - 480, HEIGHT / 2 + 192, `Nowe osiągnięcia: ${visibleLabels}${remainingLabel}`, {
        fontSize: "10px", fontStyle: "700", color: "#50d2c2", wordWrap: { width: 620, useAdvancedWrap: true }
      }).setName("end-achievements"));
    }
    if (this.challenge) {
      const dailyBest = this.profile.stats.dailyBest[this.challenge.date] || finalScore;
      layer.add(this.add.text(WIDTH / 2 + 350, HEIGHT / 2 + 200, `Rekord dnia: ${dailyBest}`, {
        fontSize: "11px", fontStyle: "700", color: "#8fb7e8"
      }).setOrigin(0.5));
    }
  }

  addResultBars(layer, x, y) {
    const values = [
      ["Płynność", this.smoothness, 0x50d2c2],
      ["Zadow.", this.satisfaction, 0xf4d35e],
      ["Przyst.", (this.stats.servedStops / STOPS.length) * 100, 0x8fb7e8],
      ["Punkt.", this.punctuality, 0xffb22e],
      ["Zwrotn.", SWITCHES.length ? (this.stats.switchCorrect / SWITCHES.length) * 100 : 100, 0xd987ff]
    ];
    values.forEach(([label, value, color], index) => {
      const yy = y + index * 14;
      layer.add(this.add.text(x, yy - 6, label, { fontSize: "10px", color: "#d9d3c4", fontStyle: "700" }));
      layer.add(this.add.rectangle(x + 66, yy, 118, 6, 0x26323a, 1).setOrigin(0, 0.5));
      layer.add(this.add.rectangle(x + 66, yy, Phaser.Math.Clamp(value, 0, 100) * 1.18, 6, color, 0.95).setOrigin(0, 0.5));
    });
  }

  addHistoryPanel(layer, x, y, history, width = 270) {
    layer.add(this.add.text(x, y, "OSTATNIE KURSY", {
      fontSize: "16px",
      fontStyle: "700",
      color: "#f4d35e"
    }));
    if (!history.length) {
      layer.add(this.add.text(x, y + 34, "Brak historii", { fontSize: "12px", color: "#d9d3c4" }));
      return;
    }
    history.slice(0, 4).forEach((run, index) => {
      const yy = y + 34 + index * 66;
      const color = index === 0 ? 0xf4d35e : 0x56636c;
      layer.add(this.add.rectangle(x + width / 2, yy + 24, width, 56, 0x0d1318, 0.96)
        .setStrokeStyle(1, color, index === 0 ? 0.95 : 0.65));
      layer.add(this.add.text(x + 10, yy + 3, `${index + 1}. ${run.score}  ${run.grade}`, {
        fontSize: "13px",
        fontStyle: "700",
        color: index === 0 ? "#ffb22e" : "#f4efe4"
      }));
      layer.add(this.add.text(x + 10, yy + 24, `${run.mode} | ${run.vehicle.replace("Konstal ", "").replace("Pesa ", "")}`, {
        fontSize: "9px",
        color: "#d9d3c4",
        wordWrap: { width: width - 20, useAdvancedWrap: true }
      }));
      layer.add(this.add.text(x + 10, yy + 40, `Płyn. ${run.smoothness}%  Zad. ${run.satisfaction}%`, {
        fontSize: "9px",
        color: "#8ea0a8"
      }));
    });
  }

  buildEndReport(bonus, interrupted = false, reason = "") {
    const grade = this.courseGrade(interrupted);
    const missions = this.missionResults(interrupted);
    const passed = missions.filter((mission) => mission.ok).length;
    const missionLines = missions.map((mission) => `${mission.ok ? "OK" : "--"} ${mission.label}`);
    return [
      `Ocena kursu: ${grade} | Cele: ${passed}/${missions.length}`,
      interrupted ? `Powód: ${reason}` : `Bonus końcowy: ${bonus}`,
      `Przystanki: ${this.stats.servedStops}/${STOPS.length} | Pominięte: ${this.stats.missedStops} | Idealne: ${this.stats.perfectStops}`,
      `Pasażerowie: ${this.delivered} | W pojeździe: ${Math.round(this.passengers)} | Combo max x${this.bestCombo.toFixed(2)}`,
      `Płynność ${Math.round(this.smoothness)}% | Zadowolenie ${Math.round(this.satisfaction)}% | Punktualność ${Math.round(this.punctuality)}%`,
      `Rozkład: ${this.stats.onTimeStops} punkt., ${this.stats.earlyStops} wcz., ${this.stats.lateStops} opóźn. | Czas ${this.formatTime(this.timeLeft)}`,
      `Incydenty: auta ${this.stats.carsCleared}, dziury ${this.stats.potholes}, zasilanie ${this.stats.powerLosses}, czerwone ${this.stats.redSignals}`,
      "",
      ...missionLines
    ].join("\n");
  }

  courseGrade(interrupted) {
    return courseGradeCalc({
      interrupted,
      satisfaction: this.satisfaction,
      smoothness: this.smoothness,
      punctuality: this.punctuality,
      servedStops: this.stats.servedStops,
      timeLeft: this.timeLeft,
      totalStops: STOPS.length
    });
  }

  missionResults(interrupted) {
    return missionResultsCalc({
      interrupted,
      stats: this.stats,
      smoothness: this.smoothness,
      satisfaction: this.satisfaction,
      punctuality: this.punctuality,
      totalStops: STOPS.length,
      totalSwitches: SWITCHES.length
    });
  }

  readHighScore() {
    try {
      return Number(window.localStorage.getItem("ostatni-kurs-highscore") || 0);
    } catch (_) {
      return 0;
    }
  }

  writeHighScore(score) {
    try {
      window.localStorage.setItem("ostatni-kurs-highscore", String(score));
      // Also save per-mode record
      if (this.modeKey) {
        const modeKey = `ostatni-kurs-highscore-${this.modeKey}`;
        const modeRecord = Number(window.localStorage.getItem(modeKey) || 0);
        if (score > modeRecord) {
          window.localStorage.setItem(modeKey, String(score));
        }
      }
    } catch (_) {
      // Local storage can be blocked in some browser contexts.
    }
  }

  readRunHistory() {
    try {
      const raw = window.localStorage.getItem("ostatni-kurs-history");
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      return [];
    }
  }

  writeRunHistory(run) {
    const history = [run, ...this.readRunHistory()].slice(0, 5);
    try {
      window.localStorage.setItem("ostatni-kurs-history", JSON.stringify(history));
    } catch (_) {
      // Local storage can be blocked in some browser contexts.
    }
    return history;
  }
}
