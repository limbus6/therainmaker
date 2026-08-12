import { beforeEach, describe, expect, it } from 'vitest';
import {
  buildChallengeAttemptSummary,
  buildChallengeShareText,
  useChallengeStore,
  type ChallengeResult,
} from '../challengeStore';

const RESULT: ChallengeResult = {
  attemptId: 'attempt-1',
  challengeCode: 'RM1-ABC-1-2-XYZ-0-12345',
  seasonId: 'season-v1',
  seed: 123,
  mandateId: 'solara-headwinds',
  mandateLabel: 'Solara Systems — Headwinds',
  outcome: 'closed',
  score: 76,
  grade: 'Strong Outcome',
  closingValue: 120,
  impliedMultiple: 10,
  archetype: 'The Shark',
  startingReputationBonus: 7,
  processScore: 74,
  daysTaken: 104,
  completedAt: '2026-08-12T00:00:00.000Z',
};

describe('challenge result store', () => {
  beforeEach(() => useChallengeStore.setState({ results: [] }));

  it('dedupes a revisited Results screen by attempt id', () => {
    useChallengeStore.getState().recordChallengeResult(RESULT);
    useChallengeStore.getState().recordChallengeResult({ ...RESULT, score: 100 });
    expect(useChallengeStore.getState().results).toEqual([RESULT]);
  });

  it('compares multiple local attempts of the same challenge', () => {
    const faster = { ...RESULT, attemptId: 'attempt-2', score: 70, closingValue: 130, daysTaken: 90 };
    const failed = { ...RESULT, attemptId: 'attempt-3', outcome: 'collapsed' as const, score: 82, closingValue: 0, impliedMultiple: null };
    const summary = buildChallengeAttemptSummary([RESULT, faster, failed], RESULT.challengeCode);

    expect(summary.attempts).toHaveLength(3);
    expect(summary.bestScore?.attemptId).toBe('attempt-3');
    expect(summary.bestClose?.attemptId).toBe('attempt-2');
    expect(summary.fastestClose?.attemptId).toBe('attempt-2');
  });

  it('shares the code and target result together', () => {
    const text = buildChallengeShareText(RESULT);
    expect(text).toContain(RESULT.challengeCode);
    expect(text).toContain('Strong Outcome · 76/100');
    expect(text).toContain('€120M · 10x');
    expect(text).toContain('Reputation +7');
    expect(text).toContain('Can you beat this run?');
  });
});
