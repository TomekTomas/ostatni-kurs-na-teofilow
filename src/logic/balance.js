export function initialPassengers(mode) {
  return Math.round(18 * mode.passengerDemand);
}

export function waitingCrowdSize(stop, mode) {
  return Math.max(1, Math.ceil((stop.board * mode.passengerDemand) / 7));
}

export function passengerExchange({ stop, mode, vehicle, passengers }) {
  const leaving = Math.min(passengers, Math.round(stop.alight * mode.passengerDemand));
  const boarding = Math.min(Math.round(stop.board * mode.passengerDemand), vehicle.capacity - passengers + leaving);
  return {
    leaving,
    boarding,
    passengers: passengers - leaving + boarding
  };
}

export function adjustSatisfaction({ satisfaction, delta, mode }) {
  const scaledDelta = delta < 0 ? delta * mode.eventPressure : delta;
  return clamp(satisfaction + scaledDelta, 0, 100);
}

export function addRidePenalty({ rideEventPenalty, amount, mode, vehicle }) {
  return clamp(rideEventPenalty + (amount * mode.eventPressure) / vehicle.comfort, 0, 70);
}

export function missedStopPenalty({ score, satisfaction, rideEventPenalty, mode, vehicle }) {
  return {
    score: score - 160,
    satisfaction: adjustSatisfaction({ satisfaction, delta: -16, mode }),
    rideEventPenalty: addRidePenalty({ rideEventPenalty, amount: 7, mode, vehicle }),
    combo: 1,
    stopStreak: 0,
    stopRating: "MISS"
  };
}

export function schedulePenalty(absDelta) {
  return clamp((absDelta - 18) * 0.08, 1, 9);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
