import { ADVISOR_ARCHETYPES, type ArchetypeId } from '../content/archetypes';
import { createRng, deriveSeed } from './rng';

export type FeeStrategy = 'retainer' | 'balanced' | 'ratchet';

export interface ArchetypeBalanceResult {
  archetypeId: ArchetypeId;
  runs: number;
  closeRate: number;
  averageCloseEV: number;
  relationshipIndex: number;
  averageFeeValue: number;
  feeStrategyRuns: Record<FeeStrategy, number>;
}

/**
 * Offline, deterministic balance proxy. It deliberately uses the same market
 * draw for every build at each seed, then applies only the disclosed build and
 * fee trade-offs. It is not a replacement for human playtesting; it is the CI
 * tripwire that stops one build from quietly leading every outcome axis.
 */
export function simulateArchetypeBalance(seedCount = 400): ArchetypeBalanceResult[] {
  return ADVISOR_ARCHETYPES.map((archetype) => {
    let closes = 0;
    let totalEV = 0;
    let totalRelationship = 0;
    let totalFee = 0;
    const feeStrategyRuns: Record<FeeStrategy, number> = { retainer: 0, balanced: 0, ratchet: 0 };

    for (let seed = 1; seed <= seedCount; seed += 1) {
      const rng = createRng(deriveSeed(0x5a17, seed));
      const feeStrategy: FeeStrategy = seed % 3 === 0 ? 'ratchet' : seed % 3 === 1 ? 'retainer' : 'balanced';
      feeStrategyRuns[feeStrategy] += 1;

      const marketEV = 105 + rng.nextFloat(0, 35);
      const marketDifficulty = rng.nextFloat(-8, 12);
      let trust = 55 + rng.nextFloat(-10, 10) + archetype.startClientTrust;
      let risk = 38 + marketDifficulty;
      const relationship = 55 + rng.nextFloat(-8, 8) + archetype.startBuyerChemistry;
      let reputation = 45 + archetype.startReputation;
      let evMultiplier = 1;
      let executionBonus = archetype.deliverableWorkFactor < 1 ? 0.018 : 0;

      if (archetype.id === 'relationship_banker') {
        trust += 10;
      } else if (archetype.id === 'technician') {
        risk -= 12;
        executionBonus += 0.018;
      } else {
        trust -= 7;
        risk += 3;
        evMultiplier *= 1.04;
        executionBonus += 0.02;
      }

      if (feeStrategy === 'retainer') trust += 3;
      if (feeStrategy === 'ratchet') {
        risk += 3;
        evMultiplier *= 1.018;
      }
      if (feeStrategy === 'balanced') reputation += 1;

      const closeChance = Math.max(0.2, Math.min(0.92,
        0.41
        + trust * 0.0015
        + (100 - risk) * 0.003
        + relationship * 0.001
        + reputation * 0.0005
        + executionBonus,
      ));
      const closed = rng.nextBool(closeChance);
      const closeEV = closed ? marketEV * evMultiplier : 0;
      const feeValue = feeStrategy === 'retainer'
        ? 0.55 + closeEV * 0.009
        : feeStrategy === 'ratchet'
          ? (closed ? closeEV * 0.014 + Math.max(0, closeEV - 125) * 0.02 : 0)
          : (closed ? 0.2 + closeEV * 0.012 : 0.2);

      if (closed) {
        closes += 1;
        totalEV += closeEV;
      }
      totalRelationship += Math.max(0, Math.min(100, trust * 0.6 + relationship * 0.4));
      totalFee += feeValue;
    }

    return {
      archetypeId: archetype.id,
      runs: seedCount,
      closeRate: Math.round((closes / seedCount) * 1000) / 10,
      averageCloseEV: Math.round((totalEV / Math.max(1, closes)) * 10) / 10,
      relationshipIndex: Math.round((totalRelationship / seedCount) * 10) / 10,
      averageFeeValue: Math.round((totalFee / seedCount) * 100) / 100,
      feeStrategyRuns,
    };
  });
}
