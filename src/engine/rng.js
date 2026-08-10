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
export function createRng(seed) {
    let state = seed | 0;
    function next() {
        state = (state + 0x6D2B79F5) | 0;
        let t = Math.imul(state ^ (state >>> 15), 1 | state);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
    function nextInt(min, max) {
        return Math.floor(next() * (max - min + 1)) + min;
    }
    function nextFloat(min, max) {
        return next() * (max - min) + min;
    }
    function nextBool(probability = 0.5) {
        return next() < probability;
    }
    /**
     * Fisher-Yates shuffle (in-place) using seeded RNG.
     * Returns the same array reference, mutated.
     */
    function shuffle(array) {
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
    function weightedPick(items, weights) {
        if (items.length === 0)
            return undefined;
        const totalWeight = weights.reduce((sum, w) => sum + w, 0);
        if (totalWeight <= 0)
            return items[Math.floor(next() * items.length)];
        let roll = next() * totalWeight;
        for (let i = 0; i < items.length; i++) {
            roll -= weights[i];
            if (roll <= 0)
                return items[i];
        }
        return items[items.length - 1];
    }
    return { next, nextInt, nextFloat, nextBool, shuffle, weightedPick, getSeed: () => seed };
}
//# sourceMappingURL=rng.js.map