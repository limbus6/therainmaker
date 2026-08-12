// ============================================
// Offer Reveal Reactions — Ricardo & the market
// ============================================
// Deterministic, state-derived colour for the Phase 7 ceremony. Ricardo's
// line reads his current mood (founderPulse) and the relationship decisions
// that shaped the bid, so the reveal pays off earlier choices instead of
// repeating a stock phrase.

import type { Buyer, FinalOffer } from '../types/game';
import type { FounderMood } from './founderPulse';
import {
  KESTREL_APPROACH_FLAG,
  SCHNEIDER_DD_FLAG,
} from './peopleBeats';
import { GOLDEN_RICARDO_DECISION } from './goldenMandate';
import { getTargetNarrative, personalizeTargetNarrativeValue, type TargetNarrativeId } from '../content/targetNarratives';

export type OfferTier = 'strong' | 'solid' | 'soft';

/** Tiers are relative to the selected target's disclosed valuation baseline. */
export function getOfferTier(offer: FinalOffer, baseEV = 120): OfferTier {
  if (offer.totalEV >= baseEV * 1.125) return 'strong';
  if (offer.totalEV >= baseEV * 0.933) return 'solid';
  return 'soft';
}

const RICARDO_LINES: Record<FounderMood, Record<OfferTier, string>> = {
  confident: {
    strong: 'That is what running a real process looks like. Now show me it closes.',
    solid: 'Fair number. I expected it — which tells you how far we have come.',
    soft: 'They can do better than that, and they know it. Let the process answer them.',
  },
  steady: {
    strong: 'That is a serious number. Show me how real it is.',
    solid: 'Workable. The question is what sits behind it.',
    soft: 'Lower than I hoped. Tell me what this does to the field.',
  },
  restless: {
    strong: 'Finally. Can we move before they rethink it?',
    solid: 'Is this what all the patience was for? Convince me it grows from here.',
    soft: 'Weeks of process for this? I need to see the next envelope beat it.',
  },
  anxious: {
    strong: 'Do not celebrate yet. Strong numbers have fallen apart before.',
    solid: 'I can live with that number — if nothing behind it bites us.',
    soft: 'This is what I was afraid of. Tell me honestly: is the process failing?',
  },
};

/**
 * Relationship payoff lines take precedence over the mood matrix when the
 * bid was visibly shaped by a decision the player made about this buyer.
 */
function relationshipLine(
  offer: FinalOffer,
  storyFlags: Record<string, string>,
  tier: OfferTier,
): string | null {
  if (offer.buyerId === 'buyer-01' && storyFlags[GOLDEN_RICARDO_DECISION] === 'hold-process' && tier !== 'soft') {
    return 'You told me holding the line would protect the number. You were right.';
  }
  if (offer.buyerId === 'buyer-01' && storyFlags[GOLDEN_RICARDO_DECISION] === 'private-lane' && tier === 'soft') {
    return 'We gave them the private lane. Is this how they repay the courtesy?';
  }
  if (offer.buyerId === 'buyer-03' && storyFlags[KESTREL_APPROACH_FLAG] === 'direct-partner' && tier !== 'soft') {
    return 'All those founder sessions with Kestrel — this is what they were worth.';
  }
  if (offer.buyerId === 'buyer-04' && storyFlags[SCHNEIDER_DD_FLAG] === 'deep-session' && tier !== 'soft') {
    return 'Schneider met the team and finally believed. That day cost us — and paid.';
  }
  return null;
}

export function getRicardoReaction(
  offer: FinalOffer,
  mood: FounderMood,
  storyFlags: Record<string, string>,
): string {
  const tier = getOfferTier(offer);
  return relationshipLine(offer, storyFlags, tier) ?? RICARDO_LINES[mood][tier];
}

export function getFounderReaction(
  offer: FinalOffer,
  mood: FounderMood,
  storyFlags: Record<string, string>,
  targetNarrativeId: TargetNarrativeId,
): string {
  const profile = getTargetNarrative(targetNarrativeId);
  const tier = getOfferTier(offer, profile.baseEV);
  const line = relationshipLine(offer, storyFlags, tier) ?? profile.offerReactionLines[mood][tier];
  return personalizeTargetNarrativeValue(line, profile);
}

/** One line of market texture, derived from buyer facts — never random. */
export function getMarketChatter(offer: FinalOffer, buyer: Buyer, baseEV = 120): string {
  const tier = getOfferTier(offer, baseEV);
  if (buyer.type === 'pe') {
    return tier === 'strong'
      ? `A sponsor stretching to ${offer.impliedMultiple}x will echo through every fund letter this quarter.`
      : `Funds price discipline, not sentiment — ${buyer.name}'s number says exactly where their model tops out.`;
  }
  if (buyer.type === 'strategic') {
    return tier === 'strong'
      ? `A strategic at ${offer.impliedMultiple}x resets the sector comps; rival corp-dev desks will notice.`
      : `${buyer.name}'s committee priced the risk, not the story — typical of a strategic mid-cycle.`;
  }
  return `The market reads ${buyer.name}'s bid as a reference point for the whole field.`;
}

/** Best-so-far framing for reveal drama; null for the first envelope. */
export function getComparisonLine(
  offer: FinalOffer,
  revealedSoFar: FinalOffer[],
): string | null {
  if (revealedSoFar.length === 0) return null;
  const best = Math.max(...revealedSoFar.map((o) => o.totalEV));
  const delta = Math.round((offer.totalEV - best) * 10) / 10;
  if (delta > 0) return `New leader — €${delta}M above the best number on the table.`;
  if (delta < 0) return `€${Math.abs(delta)}M short of the leading offer.`;
  return 'Matches the leading offer exactly.';
}
