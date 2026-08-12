import { describe, expect, it } from 'vitest';
import type { Buyer, PlayerResources, Risk } from '../../types/game';
import { getArchetypeAbilityAvailability, getArchetypeOfferDriver, getArchetypeOfferModifier, resolveArchetypeAbility } from '../archetypeAbilities';

const resources: PlayerResources = {
  budget: 50,
  budgetMax: 50,
  teamCapacity: 70,
  teamCapacityMax: 100,
  morale: 70,
  clientTrust: 60,
  dealMomentum: 55,
  riskLevel: 35,
  reputation: 50,
};

const buyers: Buyer[] = [
  { id: 'b1', name: 'Buyer One', type: 'pe', geography: 'EU', interest: 'hot', valuationPosture: 'fair', executionCredibility: 75, chemistryWithSeller: 60, status: 'bidding', ddFriction: 'medium', politicalSensitivity: 'low', notes: '', enteredPhase: 3 },
  { id: 'b2', name: 'Buyer Two', type: 'strategic', geography: 'EU', interest: 'warm', valuationPosture: 'aggressive', executionCredibility: 80, chemistryWithSeller: 65, status: 'bidding', ddFriction: 'low', politicalSensitivity: 'low', notes: '', enteredPhase: 3 },
];

const risks: Risk[] = [
  { id: 'r1', name: 'Customer concentration', description: '', category: 'commercial', severity: 'high', probability: 60, mitigated: false, surfacedWeek: 1, surfacedPhase: 2 },
  { id: 'r2', name: 'Timing', description: '', category: 'timing', severity: 'medium', probability: 70, mitigated: false, surfacedWeek: 1, surfacedPhase: 2 },
];

describe('active advisor abilities', () => {
  it('makes the Relationship Banker trade capacity for founder trust exactly once', () => {
    const context = { advisorArchetype: 'relationship_banker' as const, usedAbilityId: null, phase: 4 as const, resources, buyers, risks };
    const result = resolveArchetypeAbility(context)!;
    expect(result.resources.clientTrust).toBe(70);
    expect(result.resources.teamCapacity).toBe(64);
    expect(getArchetypeAbilityAvailability({ ...context, usedAbilityId: result.abilityId }).available).toBe(false);
  });

  it('makes the Technician attack the highest-severity live risk', () => {
    const result = resolveArchetypeAbility({ advisorArchetype: 'technician', usedAbilityId: null, phase: 6, resources, buyers, risks })!;
    expect(result.resources.riskLevel).toBe(23);
    expect(result.resources.teamCapacity).toBe(62);
    expect(result.risks.find((risk) => risk.id === 'r1')?.probability).toBe(35);
    expect(result.risks.find((risk) => risk.id === 'r2')?.probability).toBe(70);
  });

  it('makes the Shark disclose its relationship/risk cost before setting the price flag', () => {
    const result = resolveArchetypeAbility({ advisorArchetype: 'shark', usedAbilityId: null, phase: 5, resources, buyers, risks })!;
    expect(result.resources.clientTrust).toBe(53);
    expect(result.resources.teamCapacity).toBe(66);
    expect(result.resources.riskLevel).toBe(38);
    expect(result.storyFlag).toEqual({ key: 'archetype-shark-tension', value: 'used' });
    expect(getArchetypeOfferModifier({ [result.storyFlag.key]: result.storyFlag.value })).toBe(1.04);
    expect(getArchetypeOfferDriver({ [result.storyFlag.key]: result.storyFlag.value })).toContain('4%');
  });
});
