export const GAME_MODES = {
  last: {
    label: "Ostatni kurs",
    description: "Pelna trasa, normalny ruch, liczy sie komplet przystankow i plynna jazda",
    timeLimit: 860,
    traffic: 1,
    eventPressure: 1,
    speedAllowance: 1,
    trackMin: 0.36,
    trackMax: 0.94,
    passengerDemand: 1,
    dwellScale: 1,
    night: false,
    allowGameOver: true
  },
  training: {
    label: "Trening",
    description: "Dluzszy czas, mniej ruchu, bledy nie koncza kursu od razu",
    timeLimit: 1260,
    traffic: 0.75,
    eventPressure: 0.65,
    speedAllowance: 1.12,
    trackMin: 0.44,
    trackMax: 0.98,
    passengerDemand: 0.85,
    dwellScale: 0.9,
    night: false,
    allowGameOver: false
  },
  rush: {
    label: "Godziny szczytu",
    description: "Wiecej aut i pasazerow, ciasniejszy rozklad, kary bola mocniej",
    timeLimit: 720,
    traffic: 2.25,
    eventPressure: 1.35,
    speedAllowance: 0.98,
    trackMin: 0.42,
    trackMax: 0.95,
    passengerDemand: 1.48,
    dwellScale: 1.28,
    night: false,
    allowGameOver: true
  },
  night: {
    label: "Nocny kurs",
    description: "Ciemniej, mniej ruchu, szybsze przeloty i krotsze postoje",
    timeLimit: 900,
    traffic: 0.55,
    eventPressure: 0.8,
    speedAllowance: 1.22,
    trackMin: 0.48,
    trackMax: 0.98,
    passengerDemand: 0.58,
    dwellScale: 0.72,
    night: true,
    allowGameOver: true
  }
};

