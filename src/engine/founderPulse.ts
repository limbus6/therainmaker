// ============================================
// Founder Pulse — Ricardo's derived emotional state
// ============================================
// The founder's mood is never stored: it is read off the deal at the moment
// it matters, so his check-ins react to what the player actually did. Trust
// movement in M2 flows primarily through these interactions, not through
// silent mechanical ticks.

export type FounderMood = 'confident' | 'steady' | 'restless' | 'anxious';

export interface FounderPulseInputs {
  clientTrust: number;
  dealMomentum: number;
  riskLevel: number;
  /** Days until the current phase deadline; null when no deadline is set. */
  daysUntilDeadline: number | null;
}

export function deriveFounderMood(inputs: FounderPulseInputs): FounderMood {
  const { clientTrust, dealMomentum, riskLevel, daysUntilDeadline } = inputs;
  const deadlinePressure = daysUntilDeadline !== null && daysUntilDeadline <= 7;

  if (clientTrust < 45 || (deadlinePressure && dealMomentum < 45) || riskLevel >= 60) {
    return 'anxious';
  }
  if (dealMomentum < 40) {
    return 'restless';
  }
  if (clientTrust >= 65 && dealMomentum >= 55) {
    return 'confident';
  }
  return 'steady';
}

/** One line of observable behaviour — never a number. */
export const FOUNDER_MOOD_NOTES: Record<FounderMood, string> = {
  confident: 'Ricardo has been forwarding buyer emails with one-word comments: "Good."',
  steady: 'Ricardo is checking in on schedule and letting the team work.',
  restless: 'Ricardo has started asking why things take as long as they take.',
  anxious: 'Ricardo is calling after hours and rereading every buyer signal twice.',
};
