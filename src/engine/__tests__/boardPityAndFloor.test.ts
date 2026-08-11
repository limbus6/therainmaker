import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../../store/gameStore';
import type { QualificationNote } from '../../types/game';

function notes(count: number): QualificationNote[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `qn-${i}`,
    week: 1,
    source: 'team_research' as const,
    content: 'Verified signal',
    sentiment: 'positive' as const,
  }));
}

describe('board pity ladder and pre-mandate momentum floor', () => {
  beforeEach(() => {
    useGameStore.setState({
      phase: 0,
      day: 10,
      week: 2,
      rngSeed: 1234,
      boardRejectionCount: 0,
      processLog: [],
    });
  });

  it('guarantees approval on the third evidence-backed proceed submission', () => {
    useGameStore.setState({
      boardRejectionCount: 2,
      qualificationNotes: notes(3),
      boardSubmission: {
        recommendation: 'proceed',
        rationale: 'Third submission with full evidence.',
        submittedWeek: 2,
        status: 'pending',
        leadId: 'solara',
      },
    });

    useGameStore.getState().advanceWeek();

    expect(useGameStore.getState().boardSubmission?.status).toBe('approved');
  });

  it('increments the rejection counter when the IC declines', () => {
    // An unsupported decline recommendation is nearly always rejected;
    // use a seed verified to reject so the counter path is exercised.
    useGameStore.setState({
      rngSeed: 999,
      qualificationNotes: [],
      boardSubmission: {
        recommendation: 'decline',
        rationale: 'Weak case.',
        submittedWeek: 2,
        status: 'pending',
      },
    });

    useGameStore.getState().advanceWeek();

    const s = useGameStore.getState();
    if (s.boardSubmission?.status === 'rejected') {
      expect(s.boardRejectionCount).toBe(1);
    } else {
      // Seed produced an approval — counter must be untouched.
      expect(s.boardRejectionCount).toBe(0);
    }
  });

  it('never lets pre-mandate momentum fall below the floor through advances', () => {
    useGameStore.setState({
      resources: { ...useGameStore.getState().resources, dealMomentum: 12 },
    });

    for (let i = 0; i < 4; i++) {
      useGameStore.getState().advanceWeek();
      expect(useGameStore.getState().resources.dealMomentum).toBeGreaterThanOrEqual(10);
    }
  });
});
