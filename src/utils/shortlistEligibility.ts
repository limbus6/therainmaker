// ============================================
// Phase 4 Shortlist Eligibility
// ============================================
// Single source of truth for which buyer statuses may enter the provisional
// shortlist. Normally that's NDA-or-later engagement. But engagement status
// is a byproduct of phase-3 outreach tasks, and phase-3 tasks are no longer
// reachable once the player is in phase 4 -- so if a run somehow reaches
// this screen with nobody past 'identified', the strict rule would be a
// permanent dead end with no recovery path. Both the Buyers screen and the
// store action that actually performs the selection must agree on the same
// tiered fallback, or the button can appear enabled while silently no-op'ing.

import type { Buyer, BuyerStatus } from '../types/game';

const STRICT_TIER: BuyerStatus[] = ['nda_signed', 'reviewing', 'active'];

/**
 * The loosest engagement tier that actually has an undecided (not yet
 * shortlisted) buyer sitting in it. Used to decide whether a specific,
 * still-undecided buyer may be added to the shortlist -- so it must read
 * literal current status, not infer through already-shortlisted buyers
 * (a buyer's own history is not recoverable once it becomes 'shortlisted').
 */
export function getShortlistEligibleStatuses(buyers: Buyer[]): BuyerStatus[] {
  if (STRICT_TIER.some((status) => buyers.some((buyer) => buyer.status === status))) {
    return STRICT_TIER;
  }
  if (buyers.some((buyer) => buyer.status === 'contacted')) {
    return ['contacted'];
  }
  return ['identified'];
}

export function isShortlistFallbackActive(buyers: Buyer[]): boolean {
  return getShortlistEligibleStatuses(buyers)[0] !== 'nda_signed';
}

/**
 * Where a buyer should return to when removed from the shortlist. Unlike
 * eligibility, this may treat an already-shortlisted/bidding/preferred buyer
 * as evidence the strict tier was reached (that's the only way to get those
 * statuses) -- the one case this can't distinguish is a pool where every
 * single buyer was promoted through the same relaxed fallback tier and all
 * of them are shortlisted simultaneously; that reverts to the strict tier's
 * default ('active') rather than the exact fallback tier, which is a minor
 * cosmetic imprecision in an already-rare edge case, not a functional block.
 */
export function getShortlistRevertStatus(buyers: Buyer[]): BuyerStatus {
  const descendantsOfStrictTier: BuyerStatus[] = ['shortlisted', 'bidding', 'preferred'];
  const reachedStrictTier = [...STRICT_TIER, ...descendantsOfStrictTier]
    .some((status) => buyers.some((buyer) => buyer.status === status));
  if (reachedStrictTier) return 'active';
  if (buyers.some((buyer) => buyer.status === 'contacted')) return 'contacted';
  return 'identified';
}
