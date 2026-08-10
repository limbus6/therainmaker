import { describe, it, expect } from 'vitest';
import { buildResourceDeltas } from '../resourceDeltas';
import type { PlayerResources, GameEvent, GameTask } from '../../types/game';

function makeResources(overrides: Partial<PlayerResources> = {}): PlayerResources {
  return {
    budget: 100,
    budgetMax: 200,
    teamCapacity: 80,
    teamCapacityMax: 100,
    dealMomentum: 50,
    clientTrust: 60,
    morale: 70,
    riskLevel: 20,
    reputation: 55,
    ...overrides,
  } as PlayerResources;
}

const emptyResult = {
  tasksCompleted: [] as GameTask[],
  criticalOutcomes: [] as { taskId: string; taskName: string; type: 'success' | 'failure'; description: string; bonus: Partial<PlayerResources> }[],
  newEvents: [] as GameEvent[],
  hiddenWorkload: null as { taskId: string; description: string; extraWork: number } | null,
  resolvedBudgetRequests: [] as { id: string; approved: boolean; amount: number }[],
};

describe('buildResourceDeltas', () => {
  it('omits resources with no change', () => {
    const before = makeResources();
    const deltas = buildResourceDeltas(before, makeResources(), emptyResult);
    expect(deltas).toHaveLength(0);
  });

  it('computes before/after/delta for changed resources', () => {
    const before = makeResources();
    const after = makeResources({ clientTrust: 64, budget: 92 });
    const deltas = buildResourceDeltas(before, after, emptyResult);

    const trust = deltas.find((d) => d.resource === 'clientTrust');
    expect(trust).toBeDefined();
    expect(trust!.before).toBe(60);
    expect(trust!.after).toBe(64);
    expect(trust!.delta).toBe(4);

    const budget = deltas.find((d) => d.resource === 'budget');
    expect(budget!.delta).toBe(-8);
  });

  it('attributes deltas to critical outcomes touching the resource first', () => {
    const before = makeResources();
    const after = makeResources({ dealMomentum: 58 });
    const deltas = buildResourceDeltas(before, after, {
      ...emptyResult,
      criticalOutcomes: [
        { taskId: 't1', taskName: 'CIM Draft', type: 'success', description: '', bonus: { dealMomentum: 8 } },
      ],
      newEvents: [{ id: 'e1', week: 1, phase: 2, type: 'passive', title: 'Some Event', description: '', resolved: false }],
    });
    const momentum = deltas.find((d) => d.resource === 'dealMomentum');
    expect(momentum!.reason).toContain('CIM Draft');
    expect(momentum!.reason).toContain('Exceptional');
  });

  it('attributes budget increases to approved budget requests', () => {
    const before = makeResources();
    const after = makeResources({ budget: 130 });
    const deltas = buildResourceDeltas(before, after, {
      ...emptyResult,
      resolvedBudgetRequests: [{ id: 'br1', approved: true, amount: 30 }],
    });
    expect(deltas.find((d) => d.resource === 'budget')!.reason).toContain('approved');
  });

  it('attributes risk increases to complications when present', () => {
    const before = makeResources();
    const after = makeResources({ riskLevel: 25 });
    const deltas = buildResourceDeltas(before, after, {
      ...emptyResult,
      hiddenWorkload: { taskId: 't2', description: 'Data room gaps discovered', extraWork: 6 },
    });
    expect(deltas.find((d) => d.resource === 'riskLevel')!.reason).toContain('Data room gaps');
  });

  it('falls back to event titles, then completed tasks, then a generic label', () => {
    const before = makeResources();
    const after = makeResources({ morale: 74 });

    const withEvent = buildResourceDeltas(before, after, {
      ...emptyResult,
      newEvents: [{ id: 'e1', week: 1, phase: 2, type: 'passive', title: 'Team Win', description: '', resolved: false }],
    });
    expect(withEvent[0].reason).toBe('Team Win');

    const withTask = buildResourceDeltas(before, after, {
      ...emptyResult,
      tasksCompleted: [{ id: 't3', name: 'Teaser Sent', phase: 2 } as GameTask],
    });
    expect(withTask[0].reason).toContain('Teaser Sent');

    const generic = buildResourceDeltas(before, after, emptyResult);
    expect(generic[0].reason.length).toBeGreaterThan(0);
  });
});
