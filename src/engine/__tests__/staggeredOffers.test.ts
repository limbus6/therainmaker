import { describe, expect, it } from 'vitest';
import { useGameStore } from '../../store/gameStore';
import { resolveWeek } from '../weekEngine';

describe('M3 staggered binding-offer window', () => {
  it('can land deterministic offers before the formal deadline instead of batching the field', async () => {
    await useGameStore.getState().debugJumpToPhase(6);
    const jumped = useGameStore.getState();
    const base = {
      ...jumped,
      day: 100,
      week: 15,
      phase: 6 as const,
      phaseEntryDay: { ...jumped.phaseEntryDay, 6: 100 },
      phaseDeadline: 120,
      unaddressedQACount: 0,
      resources: { ...jumped.resources, riskLevel: 10 },
      dataroomCategories: jumped.dataroomCategories.map((category) => ({ ...category, accessLevel: 'full' as const })),
      buyers: jumped.buyers.map((buyer) => ({ ...buyer, status: 'bidding' as const, bindingOfferSubmitted: false, ddFriction: 'low' as const })),
    };

    const candidate = Array.from({ length: 80 }, (_, index) => index + 1)
      .map((rngSeed) => ({ rngSeed, result: resolveWeek({ ...base, rngSeed }, 5) }))
      .find(({ result }) => result.bindingOfferDelta > 0);

    expect(candidate).toBeDefined();
    expect(candidate!.result.bindingOfferDelta).toBeGreaterThan(0);
    expect(candidate!.result.bindingOfferDelta).toBeLessThan(base.buyers.length);
    const arrivals = candidate!.result.newEmails.filter((email) => email.subject.startsWith('Binding Offer Submitted'));
    expect(arrivals.length).toBe(candidate!.result.bindingOfferDelta);
    expect(arrivals.every((email) => (email.day ?? 999) < base.phaseDeadline)).toBe(true);

    const replay = resolveWeek({ ...base, rngSeed: candidate!.rngSeed }, 5);
    expect(replay.newEmails.map((email) => email.id)).toEqual(candidate!.result.newEmails.map((email) => email.id));
  });
});
