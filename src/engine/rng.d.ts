/**
 * Creates a seeded PRNG instance.
 * All randomness in the game engine should flow through this
 * to enable deterministic replays and QA checkpoints.
 */
export declare function createRng(seed: number): SeededRng;
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
}
//# sourceMappingURL=rng.d.ts.map