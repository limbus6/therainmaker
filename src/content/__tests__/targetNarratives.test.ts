import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { loadPhaseContent } from '../loadPhaseContent';
import {
  createTargetLeads,
  getTargetNarrative,
  personalizeTargetNarrativeValue,
  type TargetNarrativeId,
} from '../targetNarratives';
import { useGameStore, type GameStore } from '../../store/gameStore';
import { checkPhaseGate } from '../../engine/weekEngine';

const CANONICAL_LEAKS = [
  'Ricardo Mendes',
  'Solara Systems',
  'Vektor Industries',
  'Kestrel Capital',
  'Schneider Digital',
];

describe('target narrative campaigns', () => {
  let snapshot: GameStore;

  beforeEach(() => {
    snapshot = useGameStore.getState();
  });

  afterEach(() => {
    useGameStore.setState(snapshot, true);
  });

  it('defines three distinct founders, economics and campaign tensions', () => {
    const leads = createTargetLeads();
    expect(leads.map((lead) => lead.companyName)).toEqual([
      'Solara Systems',
      'Vektor Health Tech',
      'Nexa Automation',
    ]);

    const profiles = (['solara', 'vektor-health', 'nexa'] as TargetNarrativeId[]).map(getTargetNarrative);
    expect(new Set(profiles.map((profile) => profile.client.name)).size).toBe(3);
    expect(profiles.map((profile) => profile.baseEV)).toEqual([120, 95, 82]);
    expect(new Set(profiles.map((profile) => profile.centralTension)).size).toBe(3);
  });

  it.each([
    ['vektor-health', 'Helix Diagnostics Group', 'Clinical Model Validation Gap Found'],
    ['nexa', 'Atlas Logistics Systems', 'Controller Supply Chain Vulnerability Found'],
  ] as const)('personalises authored content for %s without changing mechanical ids', async (targetId, leadBuyer, crisisTitle) => {
    const profile = getTargetNarrative(targetId);
    const phase2 = personalizeTargetNarrativeValue(await loadPhaseContent(2), profile);
    const crisis = personalizeTargetNarrativeValue({
      id: 'evt-cyber-audit',
      storyDecision: { key: 'golden-ricardo-stance', value: 'hold-process' },
      title: 'Cyber Security Gap Found in Pre-Process Audit',
      description: "Solara Systems and Ricardo Mendes face Vektor Industries in Kestrel Capital's process.",
    }, profile);

    expect(phase2.buyers?.[0].id).toBe('buyer-01');
    expect(phase2.buyers?.[0].name).toBe(leadBuyer);
    expect(crisis.id).toBe('evt-cyber-audit');
    expect(crisis.storyDecision.key).toBe('golden-ricardo-stance');
    expect(crisis.title).toBe(crisisTitle);

    const visibleCopy = JSON.stringify({ phase2, crisis });
    for (const leak of CANONICAL_LEAKS) expect(visibleCopy).not.toContain(leak);
  });

  it.each(['vektor-health', 'nexa'] as TargetNarrativeId[])('preserves already-live %s identities while adapting generated events', (targetId) => {
    const profile = getTargetNarrative(targetId);
    const generated = personalizeTargetNarrativeValue({
      sender: profile.client.name,
      senderRole: `${profile.founderRole}, ${profile.client.companyName}`,
      description: `${profile.client.name} asks about Solara Systems while Vektor Industries prepares its committee.`,
    }, profile, { protectExistingIdentity: true });

    expect(generated.sender).toBe(profile.client.name);
    expect(generated.senderRole).toContain(profile.client.companyName);
    expect(generated.description).toContain(profile.client.name);
    expect(generated.description).toContain(profile.client.companyName);
    expect(generated.description).toContain(profile.buyerNames['buyer-01']);
  });

  it.each([
    ['vektor-health', '€126M', '€83M'],
    ['nexa', '€108M', '€71M'],
  ] as const)('aligns %s authored final-offer drama to its valuation scale', async (targetId, falseWinnerEV, falseWinnerCash) => {
    const phase7 = personalizeTargetNarrativeValue(await loadPhaseContent(7), targetId);
    const copy = JSON.stringify(phase7);
    expect(copy).toContain(falseWinnerEV);
    expect(copy).toContain(falseWinnerCash);
    expect(copy).not.toContain('€320M');
    expect(copy).not.toContain('€285M');
    expect(copy).not.toContain('€270M');
  });

  it('locks the selected Phase 0 target into client, buyer and offer state', async () => {
    const profile = getTargetNarrative('nexa');
    useGameStore.setState({
      phase: 0,
      boardSubmission: null,
      activeLeadId: 'lead-1',
      targetNarrativeId: 'solara',
      client: getTargetNarrative('solara').client,
    });

    useGameStore.getState().selectActiveLead('lead-3');
    expect(useGameStore.getState().client.companyName).toBe('Nexa Automation');
    expect(useGameStore.getState().targetNarrativeId).toBe('nexa');

    await useGameStore.getState().debugJumpToPhase(7);
    const state = useGameStore.getState();
    expect(state.buyers.map((buyer) => buyer.name)).toContain('Atlas Logistics Systems');
    expect(state.finalOffers.length).toBeGreaterThan(0);
    expect(state.finalOffers.every((offer) => offer.totalEV < 120)).toBe(true);
    expect(state.client.valuationExpectationEV).toBe(profile.baseEV);
  });

  it('does not let research on one lead qualify a different selected target', () => {
    const state = useGameStore.getState();
    const leads = createTargetLeads().map((lead) => lead.id === 'lead-1'
      ? { ...lead, meetingDone: true, investigation: { ...lead.investigation, company: 'completed' as const } }
      : lead);
    const wrongTargetEvidence = {
      id: 'qn-solara-only', week: 1, targetId: 'lead-1', source: 'team_research' as const,
      content: 'Solara evidence', sentiment: 'positive' as const,
    };
    const projection = {
      ...state,
      phase: 0 as const,
      leads,
      qualificationNotes: [wrongTargetEvidence],
      boardSubmission: { recommendation: 'proceed' as const, rationale: 'Nexa', submittedWeek: 1, status: 'approved' as const, leadId: 'lead-3' },
    };

    expect(checkPhaseGate(projection).canTransition).toBe(false);
  });
});
