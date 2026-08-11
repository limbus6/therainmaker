import { describe, expect, it } from 'vitest';
import {
  DEFAULT_MANDATE_DIFFICULTY,
  appendProcessRecord,
  calculateCausalProcessScore,
} from '../processScoring';

describe('causal process scoring', () => {
  it('deduplicates replayed decisions', () => {
    const input = {
      day: 4,
      phase: 1 as const,
      category: 'judgment' as const,
      rating: 1,
      weight: 3 as const,
      sourceType: 'board' as const,
      sourceId: 'solara',
      headline: 'Board recommendation',
      explanation: 'Evidence-backed recommendation.',
    };
    const once = appendProcessRecord([], input);
    const replayed = appendProcessRecord(once, input);

    expect(replayed).toHaveLength(1);
    expect(replayed[0].id).toBe('process-4-1-board-solara');
  });

  it('scores recorded process quality independently by discipline', () => {
    const highJudgment = appendProcessRecord([], {
      day: 4,
      phase: 1,
      category: 'judgment',
      rating: 1,
      weight: 3,
      sourceType: 'board',
      sourceId: 'solara',
      headline: 'Board recommendation',
      explanation: 'Evidence-backed recommendation.',
    });
    const score = calculateCausalProcessScore(highJudgment, DEFAULT_MANDATE_DIFFICULTY);

    expect(score.categories.judgment).toBe(100);
    expect(score.categories.execution).toBe(50);
    expect(score.score).toBe(65);
  });

  it('caps the mandate difficulty adjustment at five points', () => {
    const score = calculateCausalProcessScore([], {
      ...DEFAULT_MANDATE_DIFFICULTY,
      overall: 100,
    });

    expect(score.rawScore).toBe(50);
    expect(score.difficultyAdjustment).toBe(5);
    expect(score.score).toBe(55);
  });
});
