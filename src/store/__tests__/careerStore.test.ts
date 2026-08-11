import { describe, it, expect, beforeEach } from 'vitest';
import { useCareerStore, type Tombstone } from '../careerStore';
import { stashPendingMandate, consumePendingMandate, MANDATE_POOL } from '../../content/mandates';
import { useGameStore } from '../gameStore';

function makeTombstone(overrides: Partial<Tombstone> = {}): Tombstone {
  return {
    runKey: 'solara-flagship-123',
    mandateId: 'solara-flagship',
    mandateLabel: 'Solara Systems — The Flagship',
    companyName: 'Solara Systems',
    buyerName: 'Vektor Industries',
    closingValue: 180,
    impliedMultiple: 12,
    totalAdvisoryFee: 3600,
    grade: 'A-',
    processScore: 82,
    outcome: 'closed',
    archetype: 'shark',
    daysTaken: 240,
    completedAt: '2026-08-11T00:00:00.000Z',
    ...overrides,
  };
}

describe('career store', () => {
  beforeEach(() => {
    useCareerStore.setState({ tombstones: [], careerReputation: 0 });
  });

  it('records a tombstone and earns reputation from a well-run close', () => {
    useCareerStore.getState().recordMandate(makeTombstone({ processScore: 82 }));
    const s = useCareerStore.getState();
    expect(s.tombstones).toHaveLength(1);
    expect(s.careerReputation).toBe(3);

    useCareerStore.getState().recordMandate(makeTombstone({ runKey: 'lucky', processScore: 45 }));
    expect(useCareerStore.getState().careerReputation).toBe(4); // lucky close earns just +1
  });

  it('dedupes by runKey — a revisited results screen records once', () => {
    useCareerStore.getState().recordMandate(makeTombstone());
    useCareerStore.getState().recordMandate(makeTombstone());
    expect(useCareerStore.getState().tombstones).toHaveLength(1);
    expect(useCareerStore.getState().careerReputation).toBe(3);
  });

  it('a well-run collapse still earns a point; a sloppy one costs one', () => {
    useCareerStore.getState().recordMandate(makeTombstone({ runKey: 'a', outcome: 'collapsed', processScore: 75, closingValue: 0, buyerName: null }));
    expect(useCareerStore.getState().careerReputation).toBe(1);
    useCareerStore.getState().recordMandate(makeTombstone({ runKey: 'b', outcome: 'collapsed', processScore: 30, closingValue: 0, buyerName: null }));
    expect(useCareerStore.getState().careerReputation).toBe(0);
  });
});

describe('pending mandate handoff', () => {
  it('round-trips through localStorage and consumes exactly once', () => {
    const mandate = MANDATE_POOL[1];
    stashPendingMandate({ id: mandate.id, seed: 999, difficulty: mandate.difficulty, careerReputationBonus: 4 });
    const consumed = consumePendingMandate();
    expect(consumed?.id).toBe('solara-headwinds');
    expect(consumed?.seed).toBe(999);
    expect(consumePendingMandate()).toBeNull();
  });
});

describe('save schema v12', () => {
  it('migrates pre-v12 saves to the flagship mandate', async () => {
    const migrate = useGameStore.persist.getOptions().migrate;
    const migrated = await migrate!({}, 11) as Record<string, unknown>;
    expect(migrated.mandateId).toBe('solara-flagship');
  });
});
