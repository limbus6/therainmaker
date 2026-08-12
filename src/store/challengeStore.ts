import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ChallengeResult {
  attemptId: string;
  challengeCode: string;
  seasonId: string;
  seed: number;
  mandateId: string;
  mandateLabel: string;
  outcome: 'closed' | 'collapsed';
  score: number;
  grade: string;
  closingValue: number;
  impliedMultiple: number | null;
  archetype: string;
  startingReputationBonus: number;
  processScore: number;
  daysTaken: number;
  completedAt: string;
}

interface ChallengeState {
  results: ChallengeResult[];
  recordChallengeResult: (result: ChallengeResult) => void;
}

export const useChallengeStore = create<ChallengeState>()(
  persist(
    (set, get) => ({
      results: [],
      recordChallengeResult: (result) => {
        if (get().results.some((existing) => existing.attemptId === result.attemptId)) return;
        set((state) => ({ results: [...state.results, result].slice(-100) }));
      },
    }),
    {
      name: 'ma-rainmaker-challenges',
      version: 1,
    },
  ),
);

export interface ChallengeAttemptSummary {
  attempts: ChallengeResult[];
  bestScore: ChallengeResult | null;
  bestClose: ChallengeResult | null;
  fastestClose: ChallengeResult | null;
}

export function buildChallengeAttemptSummary(results: ChallengeResult[], code: string): ChallengeAttemptSummary {
  const attempts = results.filter((result) => result.challengeCode === code);
  const closed = attempts.filter((result) => result.outcome === 'closed');
  return {
    attempts,
    bestScore: attempts.reduce<ChallengeResult | null>((best, result) => !best || result.score > best.score ? result : best, null),
    bestClose: closed.reduce<ChallengeResult | null>((best, result) => !best || result.closingValue > best.closingValue ? result : best, null),
    fastestClose: closed.reduce<ChallengeResult | null>((best, result) => !best || result.daysTaken < best.daysTaken ? result : best, null),
  };
}

export type ChallengeShareTarget = Pick<ChallengeResult,
  'challengeCode' | 'seasonId' | 'score' | 'grade' | 'outcome' | 'closingValue' | 'impliedMultiple' | 'archetype' | 'startingReputationBonus' | 'daysTaken'
>;

export function buildChallengeShareText(result: ChallengeShareTarget): string {
  const economics = result.outcome === 'closed'
    ? `€${result.closingValue}M${result.impliedMultiple === null ? '' : ` · ${result.impliedMultiple}x`}`
    : 'Deal collapsed';
  return [
    'THE M&A RAINMAKER — CHALLENGE',
    result.challengeCode,
    `${result.grade} · ${result.score}/100`,
    economics,
    `${result.archetype} · Reputation +${result.startingReputationBonus} · ${result.daysTaken} days`,
    `Season ${result.seasonId}`,
    'Can you beat this run?',
  ].join('\n');
}
