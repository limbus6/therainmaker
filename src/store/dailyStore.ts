import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface DailyResult {
  dailyKey: string;
  dateKey: string;
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
  processScore: number;
  daysTaken: number;
  completedAt: string;
}

interface DailyState {
  results: DailyResult[];
  recordDailyResult: (result: DailyResult) => void;
}

export const useDailyStore = create<DailyState>()(
  persist(
    (set, get) => ({
      results: [],
      recordDailyResult: (result) => {
        if (get().results.some((existing) => existing.dailyKey === result.dailyKey)) return;
        set((state) => ({ results: [...state.results, result].slice(-120) }));
      },
    }),
    {
      name: 'ma-rainmaker-daily',
      version: 1,
    },
  ),
);

export function buildDailyShareText(result: DailyResult): string {
  const filled = Math.max(0, Math.min(5, Math.round(result.score / 20)));
  const scoreBar = `${'🟪'.repeat(filled)}${'⬛'.repeat(5 - filled)}`;
  const economics = result.outcome === 'closed'
    ? `€${result.closingValue}M${result.impliedMultiple === null ? '' : ` · ${result.impliedMultiple}x`}`
    : 'Deal collapsed';

  return [
    'THE M&A RAINMAKER — DAILY',
    `${result.dateKey} · ${result.seasonId}`,
    scoreBar,
    `${result.grade} · ${result.score}/100`,
    economics,
    `${result.archetype} · ${result.daysTaken} days`,
    `Seed ${result.seed}`,
  ].join('\n');
}
