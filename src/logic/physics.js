export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function calculateSafeSpeed({ vehicle, trackCondition, mode }) {
  return vehicle.maxSpeed * trackCondition * vehicle.handling * mode.speedAllowance;
}

export function updateSpeed({ speed = 0, throttle = 0, dt = 0, vehicle, powerTimer = 0, doorsOpen = false } = {}) {
  if (doorsOpen && speed > 3) return { speed, gameOverReason: "Ruszono z otwartymi drzwiami" };
  const target = vehicle.maxSpeed * throttle;
  const force = speed < target ? vehicle.acceleration : vehicle.braking;
  let nextSpeed = speed + Math.sign(target - speed) * force * dt;
  if (Math.abs(target - nextSpeed) < force * dt) nextSpeed = target;
  if (powerTimer > 0) nextSpeed = Math.max(0, nextSpeed - 150 * dt);
  return { speed: clamp(nextSpeed, 0, vehicle.maxSpeed), target, force };
}

export function recommendedStopSpeed({ distanceToStop, vehicle }) {
  if (distanceToStop <= 138) return 10;
  const brakingDistance = Math.max(0, distanceToStop - 138);
  return clamp(Math.sqrt(2 * vehicle.braking * brakingDistance) * 0.62, 10, vehicle.maxSpeed * 0.72);
}

export function updateDangerTime({ speed, safeSpeed, dangerTime = 0, dt = 0 }) {
  if (speed > safeSpeed) {
    const nextDangerTime = dangerTime + dt;
    return {
      dangerTime: nextDangerTime,
      derailed: nextDangerTime > 2.15
    };
  }
  return {
    dangerTime: Math.max(0, dangerTime - dt * 1.6),
    derailed: false
  };
}

export function calculateRideComfortSample({
  speed = 0,
  safeSpeed = 0,
  vehicle,
  trackCondition = 1,
  inputJerk = 0,
  rideEventPenalty = 0
} = {}) {
  const speedRatio = clamp(speed / vehicle.maxSpeed, 0, 1);
  const safeRatio = safeSpeed > 0 ? speed / safeSpeed : 0;
  const overSpeedPenalty = safeRatio > 1 ? clamp((safeRatio - 1) * 82, 0, 58) : 0;
  const roughness = clamp(1 - trackCondition, 0, 1);
  const trackPenalty = speedRatio * roughness * vehicle.shake * 9;
  const jerkPenalty = clamp(inputJerk * (18 / vehicle.comfort), 0, 32);
  return clamp(100 - overSpeedPenalty - trackPenalty - jerkPenalty - rideEventPenalty, 0, 100);
}

export function toDisplaySpeed({ rawSpeed, vehicle }) {
  return (rawSpeed / vehicle.maxSpeed) * vehicle.displayMaxSpeed;
}
