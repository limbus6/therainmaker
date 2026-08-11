import type { EmailResponseOption, PlayerResources } from '../types/game';

const LABELS: Record<keyof PlayerResources, string> = {
  budget: 'Budget',
  budgetMax: 'Budget ceiling',
  teamCapacity: 'Capacity',
  teamCapacityMax: 'Capacity ceiling',
  morale: 'Morale',
  clientTrust: 'Trust',
  dealMomentum: 'Momentum',
  riskLevel: 'Risk',
  reputation: 'Reputation',
};

/** Mirrors the exact resource transformation performed by respondToEmail. */
export function getVisibleResponseEffects(option: EmailResponseOption): string[] {
  const effects: string[] = [];
  for (const [key, rawDelta] of Object.entries(option.resourceEffects ?? {})) {
    if (typeof rawDelta !== 'number' || rawDelta === 0) continue;
    const resource = key as keyof PlayerResources;
    if (resource === 'dealMomentum') {
      const riskDelta = -Math.round(rawDelta / 2);
      if (riskDelta !== 0) effects.push(`${LABELS.riskLevel} ${riskDelta > 0 ? '+' : ''}${riskDelta}`);
      continue;
    }
    const suffix = resource === 'budget' || resource === 'budgetMax' ? 'k' : '';
    effects.push(`${LABELS[resource]} ${rawDelta > 0 ? '+' : ''}${rawDelta}${suffix}`);
  }
  if (option.storyDecision) effects.push('Remembered choice');
  return effects;
}

export function formatResponseEffects(option: EmailResponseOption): string | null {
  const effects = getVisibleResponseEffects(option);
  return effects.length > 0 ? effects.join(' · ') : null;
}
