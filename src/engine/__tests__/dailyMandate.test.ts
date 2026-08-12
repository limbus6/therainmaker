import { describe, expect, it } from 'vitest';
import { getDailyMandate, getUtcDateKey } from '../dailyMandate';

describe('daily mandate configuration', () => {
  it('uses the UTC date rather than the player timezone', () => {
    expect(getUtcDateKey(new Date('2026-08-12T23:59:59.000Z'))).toBe('2026-08-12');
    expect(getUtcDateKey(new Date('2026-08-13T00:00:00.000Z'))).toBe('2026-08-13');
  });

  it('reproduces the complete daily configuration for date and content season', () => {
    const first = getDailyMandate(new Date('2026-08-12T08:00:00.000Z'), 'season-test-v1');
    const replay = getDailyMandate(new Date('2026-08-12T20:00:00.000Z'), 'season-test-v1');
    expect(replay).toEqual(first);
    expect(first.pendingMandate).toMatchObject({
      runMode: 'daily',
      careerReputationBonus: 0,
      dailyKey: 'season-test-v1:2026-08-12',
    });
    expect(['solara-headwinds', 'solara-tailwinds']).toContain(first.mandateId);
    expect(['relationship_banker', 'technician', 'shark']).toContain(first.archetypeId);
  });

  it('starts a new comparison season when content version changes', () => {
    const date = new Date('2026-08-12T12:00:00.000Z');
    const oldSeason = getDailyMandate(date, 'season-v1');
    const newSeason = getDailyMandate(date, 'season-v2');
    expect(newSeason.dailyKey).not.toBe(oldSeason.dailyKey);
    expect(newSeason.seasonId).toBe('season-v2');
    expect(newSeason.seed).not.toBe(oldSeason.seed);
  });
});
