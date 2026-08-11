// ============================================
// QA Checkpoint Narrative Continuity
// ============================================
// A review checkpoint jump must not sever the story: flags recorded by
// earlier decisions survive the jump, and offer drivers derived from them
// appear in regenerated final offers. (The organic advancePhase path always
// had this; the chained checkpoint jump used to wipe flags between its two
// internal steps.)

import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../../store/gameStore';
import { GOLDEN_RICARDO_DECISION } from '../goldenMandate';

describe('checkpoint jump narrative continuity', () => {
  beforeEach(() => {
    useGameStore.setState({
      rngSeed: 4242,
      eventDirectorState: {
        ...useGameStore.getState().eventDirectorState,
        storyFlags: { [GOLDEN_RICARDO_DECISION]: 'hold-process' },
      },
    });
  });

  it('preserves story flags across a checkpoint jump', async () => {
    await useGameStore.getState().debugJumpToCheckpoint('p7-final-offers-live');
    expect(useGameStore.getState().eventDirectorState.storyFlags[GOLDEN_RICARDO_DECISION]).toBe('hold-process');
  });

  it('carries the golden offer driver into checkpoint-generated offers', async () => {
    await useGameStore.getState().debugJumpToCheckpoint('p7-final-offers-live');

    const s = useGameStore.getState();
    const vektor = s.finalOffers.find((offer) => offer.buyerId === 'buyer-01');
    expect(vektor).toBeDefined();
    expect((vektor!.drivers ?? []).join(' ')).toContain('held the competitive process');
  });
});
