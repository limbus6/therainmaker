import { beforeEach, describe, expect, it } from 'vitest';
import { buildDailyShareText, useDailyStore, type DailyResult } from '../dailyStore';

const RESULT: DailyResult = {
  dailyKey: 'season-v1:2026-08-12',
  dateKey: '2026-08-12',
  seasonId: 'season-v1',
  seed: 12345,
  mandateId: 'solara-headwinds',
  mandateLabel: 'Solara Systems — Headwinds',
  outcome: 'closed',
  score: 82,
  grade: 'Excellent Outcome',
  closingValue: 118,
  impliedMultiple: 9.8,
  archetype: 'The Shark',
  processScore: 77,
  daysTaken: 112,
  completedAt: '2026-08-12T20:00:00.000Z',
};

describe('daily result store', () => {
  beforeEach(() => useDailyStore.setState({ results: [] }));

  it('locks the first result for each daily key', () => {
    useDailyStore.getState().recordDailyResult(RESULT);
    useDailyStore.getState().recordDailyResult({ ...RESULT, score: 100 });
    expect(useDailyStore.getState().results).toEqual([RESULT]);
  });

  it('keeps incompatible seasons as separate results', () => {
    useDailyStore.getState().recordDailyResult(RESULT);
    useDailyStore.getState().recordDailyResult({ ...RESULT, dailyKey: 'season-v2:2026-08-12', seasonId: 'season-v2' });
    expect(useDailyStore.getState().results).toHaveLength(2);
  });

  it('builds a compact comparable share card', () => {
    const share = buildDailyShareText(RESULT);
    expect(share).toContain('2026-08-12 · season-v1');
    expect(share).toContain('🟪🟪🟪🟪⬛');
    expect(share).toContain('€118M · 9.8x');
    expect(share).toContain('Seed 12345');
  });
});
