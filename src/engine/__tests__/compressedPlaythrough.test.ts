import { describe, expect, it } from 'vitest';
import { useGameStore } from '../../store/gameStore';
import { checkPhaseGate } from '../weekEngine';
import { buildResultsBoard } from '../resultsEngine';

function completeCurrentPhaseTasks(): void {
  const state = useGameStore.getState();
  useGameStore.setState({
    tasks: state.tasks.map((task) => task.phase === state.phase
      ? { ...task, status: 'completed' as const, progress: 100 }
      : task),
  });
}

describe('compressed mandate playthrough', () => {
  it('crosses every real gate from short-mandate start to Results without debug jumps', async () => {
    useGameStore.setState({
      mandateId: 'solara-tailwinds',
      phase: 0,
      day: 1,
      week: 1,
      totalDays: 1,
      phaseEntryDay: { 0: 1 },
      tasks: [],
      emails: [],
      deliverables: [],
      risks: [],
      events: [],
      headlines: [],
      buyers: [],
      processLog: [],
      replayTrace: [],
      boardSubmission: null,
      agreedFeeTerms: null,
      preferredBidderId: null,
      preferredBidderConfirmed: false,
      spaNegotiation: null,
      agreedSPATerms: null,
      finalOffers: [],
      gameComplete: false,
      advisorArchetype: 'technician',
    });

    await useGameStore.getState().startMandate();
    expect(useGameStore.getState().phase).toBe(3);

    completeCurrentPhaseTasks();
    useGameStore.setState((state) => ({
      phaseDeadline: state.day,
      buyers: state.buyers.map((buyer, index) => ({
        ...buyer,
        status: index < 4 ? 'active' as const : buyer.status,
      })),
    }));
    expect(checkPhaseGate(useGameStore.getState())).toMatchObject({ canTransition: true, nextPhase: 5 });
    await useGameStore.getState().advancePhase();

    completeCurrentPhaseTasks();
    expect(checkPhaseGate(useGameStore.getState())).toMatchObject({ canTransition: true, nextPhase: 7 });
    await useGameStore.getState().advancePhase();

    const offer = useGameStore.getState().finalOffers[0];
    expect(offer).toBeDefined();
    useGameStore.getState().selectPreferredBidder(offer.buyerId, true);
    expect(checkPhaseGate(useGameStore.getState())).toMatchObject({ canTransition: true, nextPhase: 8 });
    await useGameStore.getState().advancePhase();

    completeCurrentPhaseTasks();
    useGameStore.getState().initSPANegotiation();
    useGameStore.setState((state) => ({
      spaNegotiation: state.spaNegotiation ? { ...state.spaNegotiation, status: 'agreed' as const } : null,
    }));
    expect(checkPhaseGate(useGameStore.getState())).toMatchObject({ canTransition: true, nextPhase: 10 });
    await useGameStore.getState().advancePhase();
    expect(useGameStore.getState().apexCeremonies.pending?.type).toBe('signing');
    useGameStore.getState().completeApexCeremony('completed');

    completeCurrentPhaseTasks();
    expect(checkPhaseGate(useGameStore.getState()).canTransition).toBe(true);
    useGameStore.getState().completeGame();
    expect(useGameStore.getState().gameComplete).toBe(false);
    expect(useGameStore.getState().apexCeremonies.pending?.type).toBe('closing');
    useGameStore.getState().completeApexCeremony('completed');

    const finalState = useGameStore.getState();
    expect(finalState.gameComplete).toBe(true);
    expect(finalState.phase).toBe(10);
    expect(Object.keys(finalState.phaseEntryDay).map(Number)).toEqual([3, 5, 7, 8, 10]);
    expect(finalState.tasks.some((task) => [0, 1, 2, 4, 6, 9].includes(task.phase))).toBe(false);
    expect(buildResultsBoard(finalState).financial.closingValue).toBeGreaterThan(0);
  });
});
