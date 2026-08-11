import { describe, it, expect } from 'vitest';
import { getOfferTier, getRicardoReaction, getMarketChatter, getComparisonLine } from '../offerReactions';
import type { Buyer, FinalOffer } from '../../types/game';

function makeOffer(overrides: Partial<FinalOffer> = {}): FinalOffer {
  return {
    buyerId: 'buyer-02',
    submittedPhase: 7,
    submittedWeek: 30,
    cashEV: 120,
    earnoutAmount: 0,
    earnoutConditions: 'None',
    totalEV: 120,
    structure: 'full_cash',
    conditionality: 'clean',
    exclusivityRequested: false,
    impliedMultiple: 10,
    advisorNote: '',
    ...overrides,
  };
}

const peBuyer = { id: 'buyer-03', name: 'Kestrel Capital', type: 'pe' } as Buyer;
const strategicBuyer = { id: 'buyer-04', name: 'Schneider Digital', type: 'strategic' } as Buyer;

describe('offer tiers and reactions', () => {
  it('tiers offers around the Solara baseline', () => {
    expect(getOfferTier(makeOffer({ totalEV: 150 }))).toBe('strong');
    expect(getOfferTier(makeOffer({ totalEV: 120 }))).toBe('solid');
    expect(getOfferTier(makeOffer({ totalEV: 100 }))).toBe('soft');
  });

  it("varies Ricardo's line with his mood for the same offer", () => {
    const offer = makeOffer({ totalEV: 150 });
    const confident = getRicardoReaction(offer, 'confident', {});
    const anxious = getRicardoReaction(offer, 'anxious', {});
    expect(confident).not.toBe(anxious);
    expect(anxious).toContain('fallen apart');
  });

  it('pays off relationship decisions ahead of the mood matrix', () => {
    const vektorStrong = makeOffer({ buyerId: 'buyer-01', totalEV: 150 });
    const line = getRicardoReaction(vektorStrong, 'anxious', { 'golden-ricardo-stance': 'hold-process' });
    expect(line).toContain('holding the line');

    const kestrelStrong = makeOffer({ buyerId: 'buyer-03', totalEV: 140 });
    expect(getRicardoReaction(kestrelStrong, 'steady', { 'kestrel-approach': 'direct-partner' }))
      .toContain('founder sessions');
  });

  it('does not use a payoff line when the decision went the other way on a soft bid', () => {
    const vektorSoft = makeOffer({ buyerId: 'buyer-01', totalEV: 100 });
    const line = getRicardoReaction(vektorSoft, 'steady', { 'golden-ricardo-stance': 'hold-process' });
    expect(line).not.toContain('holding the line');
  });

  it('derives market chatter from buyer facts', () => {
    expect(getMarketChatter(makeOffer({ totalEV: 150, impliedMultiple: 12.5 }), peBuyer)).toContain('sponsor');
    expect(getMarketChatter(makeOffer({ totalEV: 100 }), strategicBuyer)).toContain('committee');
  });

  it('frames each reveal against the best number so far', () => {
    const first = makeOffer({ totalEV: 130 });
    expect(getComparisonLine(first, [])).toBeNull();
    expect(getComparisonLine(makeOffer({ totalEV: 145 }), [first])).toContain('New leader');
    expect(getComparisonLine(makeOffer({ totalEV: 120 }), [first])).toContain('short of the leading');
  });
});
