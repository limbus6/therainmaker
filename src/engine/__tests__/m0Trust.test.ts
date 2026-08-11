import { describe, expect, it } from 'vitest';
import { getAdvancePacePreview, resolveWeek } from '../weekEngine';
import { useGameStore } from '../../store/gameStore';
import type { Email, GameTask, PlayerResources } from '../../types/game';
import { deriveDealMomentum } from '../dealMomentum';

function makeResources(overrides: Partial<PlayerResources> = {}): PlayerResources {
  return {
    budget: 100,
    budgetMax: 100,
    teamCapacity: 80,
    teamCapacityMax: 100,
    morale: 70,
    clientTrust: 40,
    dealMomentum: 50,
    riskLevel: 20,
    reputation: 50,
    ...overrides,
  };
}

describe('M0 — trustworthy advancement', () => {
  it('uses the same seeded outcome for the same game state and turn', () => {
    const state = useGameStore.getState();

    const first = resolveWeek(state, 3);
    const second = resolveWeek(state, 3);

    expect(second).toEqual(first);
    expect(first.rngTrace.draws).toBeGreaterThan(0);
  });

  it('explains the exact reason for the next advance', () => {
    const state = useGameStore.getState();
    const urgentEmail: Email = {
      id: 'm0-urgent',
      week: state.week,
      phase: state.phase,
      sender: 'Ricardo Mendes',
      subject: 'Need your answer',
      body: 'Please respond today.',
      preview: 'Please respond today.',
      category: 'client',
      state: 'unread',
      priority: 'urgent',
      timestamp: 'Day 1',
    };

    expect(getAdvancePacePreview({ ...state, emails: [urgentEmail] }).days).toBe(1);
    expect(getAdvancePacePreview({ ...state, emails: [urgentEmail] }).reason).toContain('Urgent reply pending');
  });

  it('applies email response effects exactly and normalises visible resources to integers', () => {
    const state = useGameStore.getState();
    const responseEmail: Email = {
      id: 'm0-response',
      week: state.week,
      phase: state.phase,
      sender: 'Ricardo Mendes',
      subject: 'Alignment check',
      body: 'How do you want to respond?',
      preview: 'How do you want to respond?',
      category: 'client',
      state: 'unread',
      priority: 'high',
      timestamp: 'Day 1',
      responseOptions: [{ id: 'commit', label: 'Commit', resourceEffects: { clientTrust: 2, dealMomentum: -3 } }],
    };

    useGameStore.setState({
      resources: makeResources({ clientTrust: 40.4, dealMomentum: 50.6 }),
      emails: [responseEmail],
    });

    useGameStore.getState().respondToEmail(responseEmail.id, 'commit');
    const resources = useGameStore.getState().resources;

    expect(resources.clientTrust).toBe(42);
    expect(resources.riskLevel).toBe(21);
    expect(resources.dealMomentum).toBe(deriveDealMomentum(useGameStore.getState()));
    expect(Object.values(resources).every(Number.isInteger)).toBe(true);
  });

  it('keeps a committed priority and its first consequence in one action', () => {
    const priority: GameTask = {
      id: 'm05-priority',
      name: 'Prepare buyer call brief',
      description: 'A focused short-turn priority.',
      phase: 0,
      category: 'relationship',
      status: 'available',
      cost: 0,
      work: 3,
      complexity: 'low',
      effectSummary: 'Strengthens the upcoming buyer conversation.',
    };

    useGameStore.setState({
      phase: 0,
      day: 1,
      week: 1,
      totalDays: 1,
      isWeekInProgress: false,
      resources: makeResources(),
      tasks: [priority],
      emails: [],
      events: [],
      commitments: [],
    });

    useGameStore.getState().commitAndAdvance(priority.id);
    const next = useGameStore.getState();

    expect(next.day).toBe(2);
    expect(next.tasks[0].status).toBe('completed');
    expect(next.lastWeekResult?.daysAdvanced).toBe(1);
  });
});
