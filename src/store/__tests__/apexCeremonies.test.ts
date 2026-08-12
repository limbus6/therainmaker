import { beforeEach, describe, expect, it } from 'vitest';
import { useGameStore } from '../gameStore';

describe('M3 apex ceremony state', () => {
  beforeEach(() => {
    useGameStore.setState({
      phase: 10,
      gameComplete: false,
      apexCeremonies: { pending: null, history: [] },
      replayTrace: [],
      mandateId: 'solara-flagship',
      rngSeed: 77,
      day: 180,
    });
  });

  it('provides a dedicated IC reveal checkpoint for browser review', async () => {
    await useGameStore.getState().debugJumpToCheckpoint('p0-ic-decision');

    expect(useGameStore.getState().apexCeremonies.pending).toMatchObject({
      type: 'board',
      outcome: 'approved',
      phase: 0,
    });
  });

  it('gates Results behind a recorded closing ceremony', () => {
    useGameStore.getState().completeGame();
    expect(useGameStore.getState().gameComplete).toBe(false);
    expect(useGameStore.getState().apexCeremonies.pending).toMatchObject({ type: 'closing' });

    useGameStore.getState().completeApexCeremony('completed');
    const state = useGameStore.getState();
    expect(state.gameComplete).toBe(true);
    expect(state.apexCeremonies.pending).toBeNull();
    expect(state.apexCeremonies.history).toContainEqual(expect.objectContaining({ type: 'closing', status: 'completed' }));
    expect(state.replayTrace).toContainEqual(expect.objectContaining({ action: 'ceremony' }));
  });

  it('records a skipped ceremony without replaying it', () => {
    useGameStore.getState().completeGame();
    useGameStore.getState().completeApexCeremony('skipped');
    useGameStore.setState({ gameComplete: false });
    useGameStore.getState().completeGame();
    expect(useGameStore.getState().gameComplete).toBe(true);
    expect(useGameStore.getState().apexCeremonies.pending).toBeNull();
  });

  it('queues the actual IC outcome when a pending board case resolves', () => {
    useGameStore.setState({
      phase: 0,
      day: 1,
      week: 1,
      totalDays: 1,
      gameComplete: false,
      boardRejectionCount: 2,
      boardSubmission: {
        recommendation: 'proceed',
        rationale: 'Evidence-backed case',
        leadId: 'lead-1',
        submittedWeek: 1,
        status: 'pending',
      },
      qualificationNotes: [
        { id: 'q1', week: 1, source: 'team_research', content: 'Sector verified', sentiment: 'positive' },
        { id: 'q2', week: 1, source: 'meeting', content: 'Founder verified', sentiment: 'positive' },
        { id: 'q3', week: 1, source: 'internal', content: 'Economics verified', sentiment: 'positive' },
      ],
      apexCeremonies: { pending: null, history: [] },
    });

    useGameStore.getState().advanceWeek();
    const state = useGameStore.getState();
    expect(state.boardSubmission?.status).toBe('approved');
    expect(state.apexCeremonies.pending).toMatchObject({ type: 'board', outcome: 'approved' });
  });
});
