import { describe, it, expect } from 'vitest';
import {
  getPeopleUpcomingBeat,
  resolvePeopleBeat,
  getPeopleOfferDriver,
  KESTREL_APPROACH_FLAG,
  SCHNEIDER_DD_FLAG,
} from '../peopleBeats';
import { deriveFounderMood } from '../founderPulse';
import type { GameEvent } from '../../types/game';

function makeState(overrides: Record<string, unknown> = {}) {
  return {
    phase: 3 as const,
    day: 61,
    week: 9,
    phaseEntryDay: { 3: 60 },
    phaseDeadline: null,
    resources: { clientTrust: 60, dealMomentum: 55, riskLevel: 20 },
    client: { name: 'Ricardo Mendes', companyName: 'Solara Systems' },
    events: [] as GameEvent[],
    buyers: [
      { id: 'buyer-03', name: 'Kestrel Capital', status: 'contacted' },
      { id: 'buyer-04', name: 'Schneider Digital', status: 'contacted' },
    ],
    ...overrides,
  };
}

describe('founder pulse', () => {
  it('derives anxious under low trust, restless under low momentum, confident when strong', () => {
    expect(deriveFounderMood({ clientTrust: 40, dealMomentum: 60, riskLevel: 20, daysUntilDeadline: null })).toBe('anxious');
    expect(deriveFounderMood({ clientTrust: 60, dealMomentum: 30, riskLevel: 20, daysUntilDeadline: null })).toBe('restless');
    expect(deriveFounderMood({ clientTrust: 70, dealMomentum: 60, riskLevel: 20, daysUntilDeadline: null })).toBe('confident');
    expect(deriveFounderMood({ clientTrust: 55, dealMomentum: 50, riskLevel: 20, daysUntilDeadline: null })).toBe('steady');
  });
});

describe('people beats scheduling', () => {
  it('telegraphs the Ricardo check-in first in phase 3', () => {
    const beat = getPeopleUpcomingBeat(makeState());
    expect(beat?.id).toBe('people-ricardo-p3');
    expect(beat?.source).toBe('decision');
  });

  it('does not resolve before the due day and resolves once due', () => {
    const state = makeState();
    expect(resolvePeopleBeat(state, 62)).toBeNull(); // due day 63
    const result = resolvePeopleBeat(state, 63);
    expect(result?.event.id).toContain('people-ricardo-p3');
    expect(result?.email.responseOptions?.length).toBeGreaterThanOrEqual(2);
  });

  it('never fires the same beat twice', () => {
    const first = resolvePeopleBeat(makeState(), 70)!;
    const state = makeState({ events: [first.event] });
    const second = resolvePeopleBeat(state, 70);
    expect(second?.event.id).not.toContain('people-ricardo-p3');
  });

  it('adapts the check-in to the founder mood', () => {
    const calm = resolvePeopleBeat(makeState(), 63)!;
    const confident = resolvePeopleBeat(
      makeState({ resources: { clientTrust: 80, dealMomentum: 75, riskLevel: 10 } }),
      63,
    )!;
    const worried = resolvePeopleBeat(
      makeState({ resources: { clientTrust: 35, dealMomentum: 30, riskLevel: 30 } }),
      63,
    )!;
    expect(calm.event.title).toBe('Ricardo checks in');
    expect(confident.event.title).toBe('Ricardo sees leverage');
    expect(worried.event.title).toBe('Ricardo needs reassurance');
    expect(calm.email.subject).not.toBe(worried.email.subject);
    expect(confident.email.subject).not.toBe(calm.email.subject);
  });

  it('skips buyer beats when the buyer has left the process', () => {
    const first = resolvePeopleBeat(makeState(), 70)!; // ricardo fires first
    const state = makeState({
      events: [first.event],
      buyers: [{ id: 'buyer-03', name: 'Kestrel Capital', status: 'dropped' }],
    });
    expect(resolvePeopleBeat(state, 70)).toBeNull();
  });

  it('carries the story decision on the Kestrel beat', () => {
    const ricardo = resolvePeopleBeat(makeState(), 70)!;
    const kestrel = resolvePeopleBeat(makeState({ events: [ricardo.event] }), 70)!;
    expect(kestrel.event.id).toContain('kestrel');
    const option = kestrel.email.responseOptions?.find((o) => o.id === 'direct-partner');
    expect(option?.storyDecision?.key).toBe(KESTREL_APPROACH_FLAG);
    expect(option?.buyerEffects?.buyerId).toBe('buyer-03');
  });
});

describe('people offer drivers', () => {
  it('narrates the Kestrel relationship decision on their offer', () => {
    expect(getPeopleOfferDriver('buyer-03', { [KESTREL_APPROACH_FLAG]: 'direct-partner' }))
      .toContain('founder sessions');
    expect(getPeopleOfferDriver('buyer-03', {})).toBeNull();
  });

  it('prefers the DD decision over governance for Schneider', () => {
    const driver = getPeopleOfferDriver('buyer-04', {
      'schneider-governance': 'grant-access',
      [SCHNEIDER_DD_FLAG]: 'deep-session',
    });
    expect(driver).toContain('deep-dive');
  });
});
