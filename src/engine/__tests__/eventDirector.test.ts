import { describe, it, expect } from 'vitest';
import { createRng } from '../rng';
import { selectEvents, createInitialEventDirectorState, type EventDirectorConfig } from '../eventDirector';
import type { Risk } from '../../types/game';

describe('EventDirector', () => {
  const mockState: { phase: number; day: number; risks: Risk[] } = {
    phase: 1,
    day: 10,
    risks: [],
  };

  const samplePool: EventDirectorConfig<typeof mockState>[] = [
    {
      id: 'evt-danger-1',
      phases: [1],
      baseProbability: 0.8,
      tensionCategory: 'danger',
      generate: () => ({
        event: { id: 'e1', week: 2, phase: 1, type: 'passive', title: 'Danger 1', description: 'desc', resolved: false },
      }),
    },
    {
      id: 'evt-recovery-1',
      phases: [1],
      baseProbability: 0.5,
      tensionCategory: 'recovery',
      generate: () => ({
        event: { id: 'e2', week: 2, phase: 1, type: 'active', title: 'Recovery 1', description: 'desc', resolved: false },
      }),
    },
    {
      id: 'evt-phase2-only',
      phases: [2],
      baseProbability: 1.0,
      generate: () => ({
        event: { id: 'e3', week: 2, phase: 2, type: 'passive', title: 'Phase 2 Only', description: 'desc', resolved: false },
      }),
    },
  ];

  it('selects eligible events for current phase and respects phase filter', () => {
    const rng = createRng(42);
    const directorState = createInitialEventDirectorState();

    const { selectedTemplates } = selectEvents(samplePool, mockState, directorState, 7, rng);

    expect(selectedTemplates.every((t) => t.phases.includes(1))).toBe(true);
    expect(selectedTemplates.some((t) => t.id === 'evt-phase2-only')).toBe(false);
  });

  it('enforces cooldowns on recently triggered templates', () => {
    const rng = createRng(42);
    const directorState = createInitialEventDirectorState();
    directorState.lastEventDays['evt-danger-1'] = 8; // triggered 2 days ago (cooldown default 14)

    const { selectedTemplates } = selectEvents(samplePool, { ...mockState, day: 10 }, directorState, 7, rng);

    expect(selectedTemplates.some((t) => t.id === 'evt-danger-1')).toBe(false);
  });

  it('boosts recovery events when recoveryCounter >= 2', () => {
    const rng = createRng(42);
    const directorState = {
      ...createInitialEventDirectorState(),
      recoveryCounter: 2,
    };

    const { selectedTemplates } = selectEvents(samplePool, mockState, directorState, 7, rng, 1);

    expect(selectedTemplates[0]?.id).toBe('evt-recovery-1');
  });

  it('suppresses danger events when an unmitigated major risk exists', () => {
    const rng = createRng(42);
    const directorState = createInitialEventDirectorState();
    const stateWithMajorRisk = {
      ...mockState,
      risks: [
        { id: 'r1', name: 'Critical Risk', category: 'legal', severity: 'critical', probability: 80, mitigated: false, surfacedWeek: 1, surfacedPhase: 1 } as Risk,
      ],
    };

    const { selectedTemplates } = selectEvents(samplePool, stateWithMajorRisk, directorState, 7, rng);

    expect(selectedTemplates.some((t) => t.tensionCategory === 'danger')).toBe(false);
  });

  it('produces deterministic selections given identical RNG seed', () => {
    const rng1 = createRng(12345);
    const rng2 = createRng(12345);
    const dState1 = createInitialEventDirectorState();
    const dState2 = createInitialEventDirectorState();

    const res1 = selectEvents(samplePool, mockState, dState1, 7, rng1);
    const res2 = selectEvents(samplePool, mockState, dState2, 7, rng2);

    expect(res1.selectedTemplates.map((t) => t.id)).toEqual(res2.selectedTemplates.map((t) => t.id));
  });
});
