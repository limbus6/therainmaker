// ============================================
// Seeded Pseudo-Random Number Generator
// ============================================
// Deterministic PRNG for reproducible game runs.
// Uses the Mulberry32 algorithm — fast, simple, and sufficient for game simulation.

/**
 * Creates a seeded PRNG instance.
 * All randomness in the game engine should flow through this
 * to enable deterministic replays and QA checkpoints.
 */
export function createRng(seed: number): SeededRng {
  let state = seed | 0;
  let drawCount = 0;

  function next(): number {
    drawCount += 1;
    state = (state + 0x6D2B79F5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  function nextInt(min: number, max: number): number {
    return Math.floor(next() * (max - min + 1)) + min;
  }

  function nextFloat(min: number, max: number): number {
    return next() * (max - min) + min;
  }

  function nextBool(probability = 0.5): boolean {
    return next() < probability;
  }

  /**
   * Fisher-Yates shuffle (in-place) using seeded RNG.
   * Returns the same array reference, mutated.
   */
  function shuffle<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(next() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  /**
   * Weighted random selection from an array of items with weights.
   * Returns the selected item, or undefined if the array is empty.
   */
  function weightedPick<T>(items: T[], weights: number[]): T | undefined {
    if (items.length === 0) return undefined;
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    if (totalWeight <= 0) return items[Math.floor(next() * items.length)];

    let roll = next() * totalWeight;
    for (let i = 0; i < items.length; i++) {
      roll -= weights[i];
      if (roll <= 0) return items[i];
    }
    return items[items.length - 1];
  }

  return {
    next,
    nextInt,
    nextFloat,
    nextBool,
    shuffle,
    weightedPick,
    getSeed: () => seed,
    getDrawCount: () => drawCount,
    getState: () => state >>> 0,
  };
}

/**
 * Derives a stable child seed without consuming the parent generator.
 *
 * A turn's outcomes can therefore be reproduced from the run seed plus its
 * calendar context, even after reloading a persisted game.
 */
export function deriveSeed(seed: number, ...parts: number[]): number {
  let mixed = seed | 0;
  for (const part of parts) {
    mixed ^= part | 0;
    mixed = Math.imul(mixed ^ (mixed >>> 16), 0x45d9f3b);
    mixed ^= mixed >>> 16;
  }
  return mixed >>> 0;
}

export interface SeededRng {
  /** Returns a float in [0, 1) */
  next(): number;
  /** Returns an integer in [min, max] (inclusive) */
  nextInt(min: number, max: number): number;
  /** Returns a float in [min, max) */
  nextFloat(min: number, max: number): number;
  /** Returns true with the given probability (default 0.5) */
  nextBool(probability?: number): boolean;
  /** Fisher-Yates shuffle in-place */
  shuffle<T>(array: T[]): T[];
  /** Weighted random selection */
  weightedPick<T>(items: T[], weights: number[]): T | undefined;
  /** Returns the original seed */
  getSeed(): number;
  /** Number of draws consumed by this generator. Useful in deterministic QA logs. */
  getDrawCount(): number;
  /** Current internal state, for diagnostic logs only. */
  getState(): number;
}
