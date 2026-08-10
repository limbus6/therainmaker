import { describe, expect, it } from 'vitest';
import { createInitialEventDirectorState } from '../eventDirector';
import { getGoldenMandateUpcomingBeat, GOLDEN_RICARDO_DECISION, resolveGoldenMandateBeat } from '../goldenMandate';
import { getAdvancePacePreview } from '../weekEngine';
import { useGameStore } from '../../store/gameStore';

function makeArcState() {
  return {
    phase: 5 as const,
    day: 29,
    week: 5,
    client: { name: 'Ricardo Mendes', companyName: 'Solara Systems' },
    events: [],
    emails: [],
    eventDirectorState: createInitialEventDirectorState(),
  };
}

describe('V1 — Golden Mandate slice', () => {
  it('telegraphs and then resolves the authored buyer arc in order', () => {
    const initial = makeArcState();
    const signal = getGoldenMandateUpcomingBeat(initial);
    expect(signal).toMatchObject({ id: 'golden-signal', dueDay: 30 });

    const signalResult = resolveGoldenMandateBeat(initial, 30);
    expect(signalResult?.event.chainStep).toBe(1);

    const afterSignal = { ...initial, day: 30, events: [signalResult!.event] };
    expect(getGoldenMandateUpcomingBeat(afterSignal)?.id).toBe('golden-ricardo-crisis');

    const crisisResult = resolveGoldenMandateBeat(afterSignal, 31);
    expect(crisisResult?.email?.responseOptions?.[0].storyDecision).toEqual({
      key: GOLDEN_RICARDO_DECISION,
      value: 'hold-process',
    });

    const afterDecision = {
      ...afterSignal,
      day: 31,
      events: [...afterSignal.events, crisisResult!.event],
      emails: [{ ...crisisResult!.email!, state: 'resolved' as const }],
      eventDirectorState: {
        ...initial.eventDirectorState,
        storyFlags: { [GOLDEN_RICARDO_DECISION]: 'hold-process' },
      },
    };
    const conflict = resolveGoldenMandateBeat(afterDecision, 32);
    expect(conflict?.event.chainStep).toBe(3);
    expect(conflict?.resourceEffects).toMatchObject({ dealMomentum: 5, reputation: 2 });
  });

  it('makes a telegraphed V1 event the exact next advance', () => {
    const state = useGameStore.getState();
    const preview = getAdvancePacePreview({
      ...state,
      phase: 5,
      day: 29,
      events: [],
      emails: [],
      eventDirectorState: createInitialEventDirectorState(),
    });

    expect(preview.days).toBe(1);
    expect(preview.reason).toContain("Vektor's investment committee");
  });
});
