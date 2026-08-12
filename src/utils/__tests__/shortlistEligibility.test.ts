import { describe, it, expect } from 'vitest';
import { getShortlistEligibleStatuses, isShortlistFallbackActive, getShortlistRevertStatus } from '../shortlistEligibility';
import type { Buyer } from '../../types/game';

function makeBuyers(statuses: Buyer['status'][]): Buyer[] {
  return statuses.map((status, i) => ({ id: `b${i}`, status } as Buyer));
}

describe('shortlist eligibility tiers', () => {
  it('uses the strict tier when any buyer reached nda_signed/reviewing/active', () => {
    const buyers = makeBuyers(['identified', 'nda_signed', 'contacted']);
    expect(getShortlistEligibleStatuses(buyers)).toEqual(['nda_signed', 'reviewing', 'active']);
    expect(isShortlistFallbackActive(buyers)).toBe(false);
  });

  it('does not require an undecided buyer to still be literally at the strict tier once others are already shortlisted, as long as one remains', () => {
    // nda-buyer has already been shortlisted; reviewing-buyer is still undecided and
    // literally at 'reviewing', which is enough to keep the strict tier active for it.
    const buyers = makeBuyers(['shortlisted', 'reviewing']);
    expect(getShortlistEligibleStatuses(buyers)).toEqual(['nda_signed', 'reviewing', 'active']);
  });

  it('falls back to contacted when nobody reached the strict tier', () => {
    const buyers = makeBuyers(['identified', 'contacted', 'identified']);
    expect(getShortlistEligibleStatuses(buyers)).toEqual(['contacted']);
    expect(isShortlistFallbackActive(buyers)).toBe(true);
  });

  it('falls back to identified as the last resort', () => {
    const buyers = makeBuyers(['identified', 'identified']);
    expect(getShortlistEligibleStatuses(buyers)).toEqual(['identified']);
    expect(isShortlistFallbackActive(buyers)).toBe(true);
  });

  it('does not let an already-shortlisted buyer alone imply the strict tier for a fallback-only pool', () => {
    // Both buyers were promoted from 'identified' via the fallback rule; the second
    // one being undecided must still read as eligible under the fallback tier.
    const buyers = makeBuyers(['shortlisted', 'identified']);
    expect(getShortlistEligibleStatuses(buyers)).toEqual(['identified']);
  });

  it('reverts a removed buyer to the active tier default when the strict tier is in play', () => {
    expect(getShortlistRevertStatus(makeBuyers(['nda_signed', 'shortlisted']))).toBe('active');
  });

  it('treats a buyer already shortlisted/bidding/preferred as evidence the strict tier was reached, for revert purposes', () => {
    for (const status of ['shortlisted', 'bidding', 'preferred'] as const) {
      expect(getShortlistRevertStatus(makeBuyers([status, 'identified']))).toBe('active');
    }
  });

  it('reverts a removed buyer to the fallback tier it actually came from', () => {
    expect(getShortlistRevertStatus(makeBuyers(['contacted', 'identified']))).toBe('contacted');
    expect(getShortlistRevertStatus(makeBuyers(['identified', 'identified']))).toBe('identified');
  });
});
