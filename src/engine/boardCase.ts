// ============================================
// Board Case Assessment
// ============================================
// Single source of truth for how strong an IC submission is *at the moment
// of the decision*. Used by the Board Submission modal (qualitative
// telegraph — the player sees strength and gaps, never probabilities) and by
// the causal process log (the judgment rating for the recommendation).

import type { Lead, QualificationNote } from '../types/game';

export type BoardCaseStrength = 'strong' | 'mixed' | 'thin';

export interface BoardCaseAssessment {
  /** 0-1 process rating for the recommendation decision itself. */
  rating: number;
  strength: BoardCaseStrength;
  /** Qualitative gaps the IC will notice. Empty when the case is airtight. */
  gaps: string[];
}

export function assessBoardCase(args: {
  lead: Lead | undefined;
  qualificationNotes: QualificationNote[];
  recommendation: 'proceed' | 'decline';
}): BoardCaseAssessment {
  const { lead, qualificationNotes, recommendation } = args;
  const gaps: string[] = [];

  const dims = lead
    ? (['sector', 'company', 'shareholder', 'market'] as const).filter(
        (d) => lead.investigation[d] === 'completed'
      ).length
    : 0;
  const meetingDone = lead?.meetingDone ?? false;
  const positives = qualificationNotes.filter((n) => n.sentiment === 'positive').length;
  const negatives = qualificationNotes.filter((n) => n.sentiment === 'negative').length;

  if (!lead) gaps.push('No target attached to the recommendation');
  if (lead && dims < 4) {
    const missing = (['sector', 'company', 'shareholder', 'market'] as const)
      .filter((d) => lead.investigation[d] !== 'completed');
    gaps.push(`Investigation incomplete: ${missing.join(', ')}`);
  }
  if (lead && !meetingDone) gaps.push('No founder meeting on file');
  if (qualificationNotes.length < 2) gaps.push('Qualification file is thin');

  // Evidence-based rating: what did the player actually verify before deciding?
  let rating = 0.3 + dims * 0.1 + (meetingDone ? 0.15 : 0) + Math.min(0.15, positives * 0.05);

  // Declining a deal the evidence argues against is good judgment, not failure.
  if (recommendation === 'decline') {
    rating = negatives > positives
      ? Math.max(rating, 0.85)
      : Math.min(rating, 0.5); // declining a well-supported deal is a judgment miss
  }

  rating = Math.max(0, Math.min(1, rating));

  const strength: BoardCaseStrength = rating >= 0.8 ? 'strong' : rating >= 0.55 ? 'mixed' : 'thin';
  return { rating, strength, gaps };
}
