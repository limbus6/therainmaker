import { describe, it, expect } from 'vitest';
import { createRng } from '../rng';
describe('SeededRng', () => {
    it('produces deterministic sequences for the same seed', () => {
        const rng1 = createRng(42);
        const rng2 = createRng(42);
        const seq1 = Array.from({ length: 10 }, () => rng1.next());
        const seq2 = Array.from({ length: 10 }, () => rng2.next());
        expect(seq1).toEqual(seq2);
    });
    it('produces different sequences for different seeds', () => {
        const rng1 = createRng(42);
        const rng2 = createRng(99);
        const val1 = rng1.next();
        const val2 = rng2.next();
        expect(val1).not.toEqual(val2);
    });
    it('next() returns values in [0, 1)', () => {
        const rng = createRng(12345);
        for (let i = 0; i < 1000; i++) {
            const v = rng.next();
            expect(v).toBeGreaterThanOrEqual(0);
            expect(v).toBeLessThan(1);
        }
    });
    it('nextInt returns values in [min, max] inclusive', () => {
        const rng = createRng(777);
        const results = new Set();
        for (let i = 0; i < 1000; i++) {
            const v = rng.nextInt(1, 5);
            expect(v).toBeGreaterThanOrEqual(1);
            expect(v).toBeLessThanOrEqual(5);
            results.add(v);
        }
        // With 1000 rolls, we should see all values 1-5
        expect(results.size).toBe(5);
    });
    it('nextBool respects probability', () => {
        const rng = createRng(42);
        let trueCount = 0;
        const n = 10000;
        for (let i = 0; i < n; i++) {
            if (rng.nextBool(0.3))
                trueCount++;
        }
        // Should be roughly 30% ± 3%
        expect(trueCount / n).toBeGreaterThan(0.25);
        expect(trueCount / n).toBeLessThan(0.35);
    });
    it('shuffle is deterministic', () => {
        const arr1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        const arr2 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        createRng(42).shuffle(arr1);
        createRng(42).shuffle(arr2);
        expect(arr1).toEqual(arr2);
    });
    it('weightedPick respects weights', () => {
        const rng = createRng(42);
        const items = ['rare', 'common'];
        const weights = [1, 99];
        let rareCount = 0;
        const n = 10000;
        for (let i = 0; i < n; i++) {
            if (rng.weightedPick(items, weights) === 'rare')
                rareCount++;
        }
        // ~1% ± 1%
        expect(rareCount / n).toBeLessThan(0.03);
    });
    it('getSeed returns the original seed', () => {
        const rng = createRng(42);
        expect(rng.getSeed()).toBe(42);
    });
});
//# sourceMappingURL=rng.test.js.map