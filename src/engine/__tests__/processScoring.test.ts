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

    // A single weight-3 record carries half confidence: 50 + (100-50) * 3/6.
    expect(score.categories.judgment).toBe(75);
    expect(score.categories.execution).toBe(50);
    expect(score.score).toBe(58);
  });

  it('reaches full confidence once a category has enough recorded evidence', () => {
    let log = appendProcessRecord([], {
      day: 4, phase: 1, category: 'judgment', rating: 1, weight: 3,
      sourceType: 'board', sourceId: 'solara',
      headline: 'Board recommendation', explanation: 'Evidence-backed.',
    });
    log = appendProcessRecord(log, {
      day: 9, phase: 1, category: 'judgment', rating: 1, weight: 3,
      sourceType: 'pitch', sourceId: 'mandate-pitch',
      headline: 'Prepared pitch', explanation: 'Deck ready before presenting.',
    });
    const score = calculateCausalProcessScore(log, DEFAULT_MANDATE_DIFFICULTY);
    expect(score.categories.judgment).toBe(100);
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
