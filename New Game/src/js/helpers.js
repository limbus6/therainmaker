export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function sum(values) {
  return values.reduce((acc, current) => acc + current, 0);
}

export function nextSeed(seed) {
  return (seed * 1664525 + 1013904223) >>> 0;
}

export function drawRandom(state) {
  const safeSeed = Number.isInteger(state?.meta?.rngSeed) ? state.meta.rngSeed : 1;
  const n = nextSeed(safeSeed);
  state.meta.rngSeed = n;
  return n / 4294967296;
}

export function rollChance(state, probability) {
  return drawRandom(state) < clamp(probability, 0, 1);
}

export function randomInt(state, min, max) {
  const low = Math.ceil(Math.min(min, max));
  const high = Math.floor(Math.max(min, max));
  return Math.floor(drawRandom(state) * (high - low + 1)) + low;
}

export function pickOne(state, items) {
  if (!items.length) return null;
  return items[Math.floor(drawRandom(state) * items.length)];
}

export function applyDelta(target, deltas = {}) {
  Object.entries(deltas).forEach(([key, delta]) => {
    target[key] = (target[key] ?? 0) + delta;
  });
}

export function formatPercent(value) {
  return `${Math.round(clamp(value, 0, 1) * 100)}%`;
}

export function pressureBand(pressure) {
  if (pressure <= 0.85) return "Healthy";
  if (pressure <= 1.0) return "Tight";
  if (pressure <= 1.2) return "Strained";
  return "Critical";
}
