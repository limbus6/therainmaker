import { describe, expect, it } from 'vitest';
import { simulateArchetypeBalance } from '../archetypeBalance';

describe('seeded archetype and fee-structure balance proxy', () => {
  it('runs hundreds of matched seeds without one build leading every outcome axis', () => {
    const results = simulateArchetypeBalance(600);
    expect(results).toHaveLength(3);
    expect(results.every((result) => result.runs === 600)).toBe(true);
    expect(results.every((result) => Object.values(result.feeStrategyRuns).every((count) => count === 200))).toBe(true);

    const closeLeader = [...results].sort((a, b) => b.closeRate - a.closeRate)[0].archetypeId;
    const valueLeader = [...results].sort((a, b) => b.averageCloseEV - a.averageCloseEV)[0].archetypeId;
    const relationshipLeader = [...results].sort((a, b) => b.relationshipIndex - a.relationshipIndex)[0].archetypeId;
    expect(new Set([closeLeader, valueLeader, relationshipLeader]).size).toBeGreaterThanOrEqual(2);

    for (const result of results) {
      expect(result.closeRate).toBeGreaterThanOrEqual(60);
      expect(result.closeRate).toBeLessThanOrEqual(80);
    }
  });
});
