import { describe, it, expect } from 'vitest';
import { useGameStore } from '../../store/gameStore';
import { buildResultsBoard } from '../resultsEngine';

describe('End-to-End Game Playthrough Simulation', () => {
  it('simulates phase progression from Phase 0 to Phase 10 cleanly', async () => {
    // 1. Reset state
    useGameStore.setState({
      phase: 0,
      day: 1,
      week: 1,
      preferredBidderId: null,
      preferredBidderConfirmed: false,
      finalOffers: [
        {
          buyerId: 'buyer-01',
          submittedPhase: 7,
          submittedWeek: 28,
          cashEV: 150,
          earnoutAmount: 30,
          earnoutConditions: 'EBITDA milestone at €25M',
          totalEV: 180,
          structure: 'mixed',
          conditionality: 'clean',
          exclusivityRequested: true,
          impliedMultiple: 12.5,
          advisorNote: 'Top strategic offer with clean terms.',
        },
      ],
      buyers: [
        {
          id: 'buyer-01',
          name: 'Apex Strategic Holdings',
          type: 'strategic',
          geography: 'Europe',
          interest: 'hot',
          valuationPosture: 'aggressive',
          executionCredibility: 95,
          chemistryWithSeller: 90,
          status: 'preferred',
          ddFriction: 'low',
          politicalSensitivity: 'low',
          notes: 'Primary bidder',
          enteredPhase: 0,
          bindingOfferSubmitted: true,
        },
      ],
    });

    const store = useGameStore.getState();

    // 2. Select preferred bidder with confirmation
    store.selectPreferredBidder('buyer-01', true);
    expect(useGameStore.getState().preferredBidderId).toBe('buyer-01');
    expect(useGameStore.getState().preferredBidderConfirmed).toBe(true);

    // 3. Advance phase sequentially P0 -> P10
    for (let p = 0; p < 10; p++) {
      useGameStore.setState({ day: (p + 1) * 7 });
      await useGameStore.getState().advancePhase();
      expect(useGameStore.getState().phase).toBe(p + 1);
    }

    // 4. Verify Phase 10 state and results board calculation
    const finalState = useGameStore.getState();
    expect(finalState.phase).toBe(10);

    const board = buildResultsBoard(finalState);
    expect(board).toBeDefined();
    expect(board.financial.closingValue).toBeGreaterThan(0);
    expect(typeof board.scores.overallGrade).toBe('string');
    expect(board.scores.overallGrade.length).toBeGreaterThan(0);
  });
});
