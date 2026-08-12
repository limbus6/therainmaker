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
    useCareerStore.setState({ tombstones: [], careerReputation: 0, beaconTombstones: [], marketStep: 0 });
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

  it('keeps the latest 50 tombstones without hiding failed history', () => {
    for (let index = 0; index < 51; index += 1) {
      useCareerStore.getState().recordMandate(makeTombstone({
        runKey: `run-${index}`,
        outcome: index === 50 ? 'collapsed' : 'closed',
        buyerName: index === 50 ? null : 'Vektor Industries',
        closingValue: index === 50 ? 0 : 100 + index,
      }));
    }

    const { tombstones } = useCareerStore.getState();
    expect(tombstones).toHaveLength(50);
    expect(tombstones[0].runKey).toBe('run-1');
    expect(tombstones.at(-1)).toMatchObject({ runKey: 'run-50', outcome: 'collapsed' });
  });

  it('records one explicit Beacon market result per mandate choice', () => {
    useCareerStore.getState().recordMarketDecision('solara-flagship', '2026-08-12T00:00:00.000Z');
    const state = useCareerStore.getState();
    expect(state.marketStep).toBe(1);
    expect(state.beaconTombstones).toHaveLength(1);
    expect(state.beaconTombstones[0]).toMatchObject({
      mandateId: 'solara-headwinds',
      trigger: 'player_declined',
      outcome: 'beacon_win',
    });
  });

  it('dedupes the Beacon result for a revisited results screen', () => {
    const input = {
      playerRunKey: 'player-run-1',
      mandateId: 'solara-flagship',
      playerOutcome: 'closed' as const,
      seed: 123,
      completedAt: '2026-08-12T00:00:00.000Z',
    };
    useCareerStore.getState().recordBeaconRun(input);
    useCareerStore.getState().recordBeaconRun(input);
    expect(useCareerStore.getState().beaconTombstones).toHaveLength(1);
  });

  it('migrates the v1 career ledger without touching player tombstones', async () => {
    const legacy = { tombstones: [makeTombstone()], careerReputation: 3 };
    const migrate = useCareerStore.persist.getOptions().migrate;
    const migrated = await migrate!(legacy, 1) as Partial<ReturnType<typeof useCareerStore.getState>>;
    expect(migrated.tombstones).toEqual(legacy.tombstones);
    expect(migrated.careerReputation).toBe(3);
    expect(migrated.beaconTombstones).toEqual([]);
    expect(migrated.marketStep).toBe(0);
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

describe('save schema v14', () => {
  it('migrates pre-v12 saves to a standard career flagship mandate', async () => {
    const migrate = useGameStore.persist.getOptions().migrate;
    const migrated = await migrate!({}, 11) as Record<string, unknown>;
    expect(migrated.mandateId).toBe('solara-flagship');
    expect(migrated.runMode).toBe('career');
    expect(migrated.dailyKey).toBeNull();
    expect(migrated.dailySeason).toBeNull();
    expect(migrated.challengeCode).toBeNull();
    expect(migrated.challengeSeason).toBeNull();
    expect(migrated.challengeAttemptId).toBeNull();
    expect(migrated.startingReputationBonus).toBe(0);
  });
});
