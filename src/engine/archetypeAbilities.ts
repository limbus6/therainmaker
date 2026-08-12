import type { Buyer, PhaseId, PlayerResources, Risk } from '../types/game';
import { getArchetype, type ArchetypeAbilityId, type ArchetypeId } from '../content/archetypes';

export interface ArchetypeAbilityContext {
  advisorArchetype: ArchetypeId | null;
  usedAbilityId: ArchetypeAbilityId | null;
  phase: PhaseId;
  resources: PlayerResources;
  buyers: Buyer[];
  risks: Risk[];
}

export interface ArchetypeAbilityAvailability {
  available: boolean;
  reason: string;
}

export interface ArchetypeAbilityResolution {
  abilityId: ArchetypeAbilityId;
  resources: PlayerResources;
  buyers: Buyer[];
  risks: Risk[];
  storyFlag: { key: string; value: string };
  summary: string;
  process: {
    category: 'stakeholder' | 'risk' | 'negotiation';
    rating: number;
    headline: string;
    explanation: string;
  };
}

const LIVE_BUYER_STATUSES = new Set<Buyer['status']>(['active', 'shortlisted', 'bidding', 'preferred']);
const SEVERITY_WEIGHT: Record<Risk['severity'], number> = { low: 1, medium: 2, high: 3, critical: 4 };

export function getArchetypeOfferModifier(storyFlags: Record<string, string>): number {
  return storyFlags['archetype-shark-tension'] === 'used' ? 1.04 : 1;
}

export function getArchetypeOfferDriver(storyFlags: Record<string, string>): string | null {
  return getArchetypeOfferModifier(storyFlags) > 1
    ? 'The Shark reopened competitive tension before final offers, adding a disclosed 4% price premium.'
    : null;
}

export function getArchetypeAbilityAvailability(context: ArchetypeAbilityContext): ArchetypeAbilityAvailability {
  const archetype = getArchetype(context.advisorArchetype);
  if (!archetype) return { available: false, reason: 'Choose an advisor build first.' };
  if (context.usedAbilityId) return { available: false, reason: `Used already: ${archetype.ability.name}.` };

  if (archetype.id === 'relationship_banker') {
    if (context.phase >= 10) return { available: false, reason: 'The founder call must happen before closing.' };
    if (context.resources.teamCapacity < 6) return { available: false, reason: 'Requires 6 Team Capacity.' };
    if (context.resources.clientTrust >= 100) return { available: false, reason: 'Client Trust is already at its ceiling.' };
    return { available: true, reason: 'Ready — exact cost: 6 Capacity.' };
  }

  if (archetype.id === 'technician') {
    if (context.phase < 2 || context.phase > 8) return { available: false, reason: 'Available from Preparation through SPA.' };
    if (context.resources.teamCapacity < 8) return { available: false, reason: 'Requires 8 Team Capacity.' };
    const hasLiveRisk = context.resources.riskLevel > 0 || context.risks.some((risk) => !risk.mitigated && !risk.retired);
    if (!hasLiveRisk) return { available: false, reason: 'No live risk remains to red-team.' };
    return { available: true, reason: 'Ready — exact cost: 8 Capacity.' };
  }

  if (context.phase < 5 || context.phase > 6) return { available: false, reason: 'Available during NBO or Due Diligence, before final offers.' };
  if (context.resources.clientTrust < 7) return { available: false, reason: 'Requires at least 7 Client Trust.' };
  if (context.resources.teamCapacity < 4) return { available: false, reason: 'Requires 4 Team Capacity.' };
  const liveBuyers = context.buyers.filter((buyer) => LIVE_BUYER_STATUSES.has(buyer.status));
  if (liveBuyers.length < 2) return { available: false, reason: 'Requires at least two live buyers.' };
  return { available: true, reason: 'Ready — final offers +4%; exact cost: 7 Trust, 4 Capacity, 3 Risk.' };
}

function copyResources(resources: PlayerResources, changes: Partial<PlayerResources>): PlayerResources {
  return { ...resources, ...changes };
}

export function resolveArchetypeAbility(context: ArchetypeAbilityContext): ArchetypeAbilityResolution | null {
  const availability = getArchetypeAbilityAvailability(context);
  const archetype = getArchetype(context.advisorArchetype);
  if (!availability.available || !archetype) return null;

  if (archetype.id === 'relationship_banker') {
    return {
      abilityId: archetype.ability.id,
      resources: copyResources(context.resources, {
        clientTrust: context.resources.clientTrust + 10,
        teamCapacity: context.resources.teamCapacity - 6,
      }),
      buyers: context.buyers,
      risks: context.risks,
      storyFlag: { key: 'archetype-founder-call', value: 'used' },
      summary: 'Founder Call used: Ricardo received the direct senior read he needed.',
      process: {
        category: 'stakeholder',
        rating: 0.85,
        headline: 'Founder Call used deliberately',
        explanation: 'You spent scarce senior capacity to stabilise the founder relationship before closing.',
      },
    };
  }

  if (archetype.id === 'technician') {
    const target = [...context.risks]
      .filter((risk) => !risk.mitigated && !risk.retired)
      .sort((a, b) => (SEVERITY_WEIGHT[b.severity] * 100 + b.probability) - (SEVERITY_WEIGHT[a.severity] * 100 + a.probability))[0];
    const risks = target
      ? context.risks.map((risk) => {
          if (risk.id !== target.id) return risk;
          const probability = Math.max(0, risk.probability - 25);
          return { ...risk, probability, mitigated: probability <= 15 ? true : risk.mitigated };
        })
      : context.risks;
    return {
      abilityId: archetype.ability.id,
      resources: copyResources(context.resources, {
        riskLevel: context.resources.riskLevel - 12,
        teamCapacity: context.resources.teamCapacity - 8,
      }),
      buyers: context.buyers,
      risks,
      storyFlag: { key: 'archetype-red-team-review', value: target?.id ?? 'portfolio' },
      summary: target
        ? `Red-Team Review used: ${target.name} was pressure-tested before buyers could exploit it.`
        : 'Red-Team Review used: the live risk portfolio was pressure-tested.',
      process: {
        category: 'risk',
        rating: 0.9,
        headline: 'Red-Team Review exposed the weak assumption',
        explanation: target
          ? `The team concentrated its effort on ${target.name}, reducing the risk while it was still actionable.`
          : 'The team challenged the live assumptions while they were still actionable.',
      },
    };
  }

  return {
    abilityId: archetype.ability.id,
    resources: copyResources(context.resources, {
      clientTrust: context.resources.clientTrust - 7,
      teamCapacity: context.resources.teamCapacity - 4,
      riskLevel: context.resources.riskLevel + 3,
    }),
    buyers: context.buyers,
    risks: context.risks,
    storyFlag: { key: 'archetype-shark-tension', value: 'used' },
    summary: 'Competitive tension reopened: every live bidder was told the process remained contested.',
    process: {
      category: 'negotiation',
      rating: 0.78,
      headline: 'Competitive tension reopened at a disclosed cost',
      explanation: 'You pressed the buyer field before final offers, accepting a visible client and execution cost for price tension.',
    },
  };
}
