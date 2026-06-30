import { STOPS, SWITCHES } from "../config/route.js";

export function missionResults({
  interrupted = false,
  stats = {},
  smoothness = 0,
  satisfaction = 0,
  punctuality = 0,
  totalStops = STOPS.length,
  totalSwitches = SWITCHES.length
} = {}) {
  return [
    { label: "Dojedź do Teofilowa", ok: !interrupted },
    { label: "Obsłuż wszystkie przystanki", ok: stats.missedStops === 0 && stats.servedStops >= totalStops },
    { label: "Płynność minimum 75%", ok: smoothness >= 75 },
    { label: "Zadowolenie minimum 70%", ok: satisfaction >= 70 },
    { label: "Punktualność minimum 70%", ok: punctuality >= 70 },
    { label: "Bez przejazdu na czerwonym", ok: stats.redSignals === 0 },
    { label: "Zwrotnice bez pomyłki", ok: stats.switchWrong === 0 && stats.switchCorrect >= totalSwitches }
  ];
}

export function missionByLabel(results, label) {
  return results.find((mission) => mission.label === label);
}
