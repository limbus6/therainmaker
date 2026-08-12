import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../gameStore';
import type { Buyer, Lead, GameTask } from '../../types/game';
import { phase2Buyers } from '../../content/phase2';

describe('Game Store', () => {
  beforeEach(() => {
    // Reset store state before each test if necessary
    // But since Zustand doesn't auto-reset between tests, we do it manually or override state
    useGameStore.setState({
      preferredBidderId: null,
      preferredBidderConfirmed: false,
      buyers: [
        { id: 'buyer-01', name: 'Buyer 1', type: 'pe', executionCredibility: 100, ddFriction: 'low', valuationPosture: 'fair', status: 'bidding', bindingOfferSubmitted: true } as unknown as Buyer,
        { id: 'buyer-02', name: 'Buyer 2', type: 'pe', executionCredibility: 100, ddFriction: 'high', valuationPosture: 'fair', status: 'bidding', bindingOfferSubmitted: true } as unknown as Buyer
      ],
      leads: [
        {
          id: 'lead-1',
          companyName: 'Company 1',
          investigation: { sector: 'none', company: 'none', shareholder: 'none', market: 'none' },
          meetingScheduled: false,
          meetingDone: false,
        } as unknown as Lead
      ],
      tasks: [],
      processLog: [],
      scoringModelVersion: 'causal-v2',
      phaseEntryDay: {},
      day: 1,
      mandateId: 'solara-flagship',
    });
  });

  it('selectPreferredBidder with confirmed=true locks the selection', () => {
    useGameStore.getState().selectPreferredBidder('buyer-01', true);
    
    let state = useGameStore.getState();
    expect(state.preferredBidderId).toBe('buyer-01');
    expect(state.preferredBidderConfirmed).toBe(true);
    expect(state.processLog).toHaveLength(1);
    expect(state.processLog[0]).toMatchObject({
      category: 'judgment',
      sourceType: 'buyer_decision',
      sourceId: 'buyer-01',
    });

    // Subsequent calls should be no-ops
    useGameStore.getState().selectPreferredBidder('buyer-02', false);
    state = useGameStore.getState();
    expect(state.preferredBidderId).toBe('buyer-01');
    expect(state.preferredBidderConfirmed).toBe(true);
    
    useGameStore.getState().selectPreferredBidder('buyer-02', true);
    state = useGameStore.getState();
    expect(state.preferredBidderId).toBe('buyer-01');
    expect(state.processLog).toHaveLength(1);
  });

  it('selectPreferredBidder without confirmed is rejected when already set', () => {
    useGameStore.getState().selectPreferredBidder('buyer-01', false);
    
    let state = useGameStore.getState();
    expect(state.preferredBidderId).toBe('buyer-01');
    expect(state.preferredBidderConfirmed).toBe(false);

    // Try to change it without confirmed=true
    useGameStore.getState().selectPreferredBidder('buyer-02', false);
    state = useGameStore.getState();
    // It should remain buyer-01 because the second call didn't have confirmed=true while preferredBidderId is already set
    expect(state.preferredBidderId).toBe('buyer-01');
  });

  it('syncLeadsFromTasks does not overwrite completed investigations', () => {
    useGameStore.setState({
      leads: [
        {
          id: 'lead-1',
          companyName: 'Company 1',
          investigation: { sector: 'completed', company: 'none', shareholder: 'none', market: 'none' },
          meetingScheduled: false,
          meetingDone: false,
        } as unknown as Lead
      ],
      tasks: [
        {
          id: 'task-investigate-lead-1-sector',
          status: 'in_progress',
        } as unknown as GameTask
      ]
    });

    // Advance week triggers syncLeadsFromTasks
    useGameStore.getState().advanceWeek();

    const state = useGameStore.getState();
    // sector should remain 'completed', not overridden by 'in_progress' from the task
    expect(state.leads[0].investigation.sector).toBe('completed');
  });

  it('scheduleMeeting sets meetingScheduled but not meetingDone', () => {
    useGameStore.getState().scheduleMeeting('lead-1');
    
    const state = useGameStore.getState();
    expect(state.leads[0].meetingScheduled).toBe(true);
    expect(state.leads[0].meetingDone).toBe(false);
  });

  it('phaseEntryDay is populated on phase advance', async () => {
    useGameStore.setState({ phase: 0, day: 10, phaseEntryDay: { 0: 1 } });
    
    await useGameStore.getState().advancePhase();
    
    const state = useGameStore.getState();
    expect(state.phase).toBe(1);
    expect(state.phaseEntryDay[1]).toBe(10);
  });

  it('starts a short mandate at Outreach with accepted terms and no skipped-phase credit', async () => {
    useGameStore.setState({
      mandateId: 'solara-headwinds',
      phase: 0,
      day: 1,
      phaseEntryDay: { 0: 1 },
      tasks: [],
      emails: [],
      deliverables: [],
      risks: [],
      headlines: [],
      buyers: [],
      processLog: [],
      replayTrace: [],
      advisorArchetype: 'relationship_banker',
    });

    await useGameStore.getState().startMandate();

    const state = useGameStore.getState();
    expect(state.phase).toBe(3);
    expect(state.phaseEntryDay).toEqual({ 3: 1 });
    expect(state.tasks.length).toBeGreaterThan(0);
    expect(state.tasks.every((task) => task.phase === 3)).toBe(true);
    expect(state.buyers.length).toBeGreaterThan(2);
    expect(state.buyers.every((buyer) => buyer.status === 'identified')).toBe(true);
    expect(state.buyers[0].chemistryWithSeller).toBe(55);
    expect(state.boardSubmission?.status).toBe('approved');
    expect(state.agreedFeeTerms?.successFeePercent).toBe(2);
    expect(state.processLog).toEqual([]);
    expect(state.replayTrace.at(-1)?.input).toMatchObject({ skippedPhases: [1, 2] });
  });

  it('bridges omitted shortlist and diligence phases without loading their tasks', async () => {
    useGameStore.setState({
      mandateId: 'solara-headwinds',
      phase: 3,
      day: 20,
      week: 3,
      phaseEntryDay: { 3: 1 },
      tasks: [],
      emails: [],
      deliverables: [],
      risks: [],
      headlines: [],
      buyers: [
        { ...phase2Buyers[0], id: 'credible', status: 'active', executionCredibility: 85, interest: 'warm' } as Buyer,
        { ...phase2Buyers[1], id: 'weak', status: 'active', executionCredibility: 40, interest: 'lukewarm' } as Buyer,
      ],
    });

    await useGameStore.getState().advancePhase();
    let state = useGameStore.getState();
    expect(state.phase).toBe(5);
    expect(state.tasks.some((task) => task.phase === 4)).toBe(false);
    expect(state.buyers.find((buyer) => buyer.id === 'credible')?.status).toBe('shortlisted');
    expect(state.buyers.find((buyer) => buyer.id === 'weak')?.status).toBe('excluded');

    await useGameStore.getState().advancePhase();
    state = useGameStore.getState();
    expect(state.phase).toBe(7);
    expect(state.tasks.some((task) => task.phase === 6)).toBe(false);
    expect(state.buyers.find((buyer) => buyer.id === 'credible')?.status).toBe('bidding');
    expect(state.finalOffers.length).toBeGreaterThan(0);
    expect(state.bindingOffersReceived).toBe(state.finalOffers.length);
  });

  it('migrates pre-v8 saves without pretending they contain causal evidence', async () => {
    const migrate = useGameStore.persist.getOptions().migrate;
    expect(migrate).toBeTypeOf('function');

    const migrated = await migrate!({
      resources: {
        budget: 20.4,
        budgetMax: 40,
        teamCapacity: 80,
        teamCapacityMax: 100,
        morale: 70,
        clientTrust: 60,
        dealMomentum: 50,
        riskLevel: 20,
        reputation: 55,
      },
    }, 7) as Record<string, unknown>;

    expect(migrated.contentVersion).toBe('solara-events-v4');
    expect(migrated.scoringModelVersion).toBe('legacy-v1');
    expect(migrated.processLog).toEqual([]);
    expect(migrated.boardRejectionCount).toBe(0);
    expect(migrated.replayTrace).toEqual([]);
    expect((migrated.resources as { budget: number }).budget).toBe(20);
    expect(migrated.resources).not.toHaveProperty('dealMomentum');
  });

  it('migrates v14 runs to active abilities and ceremony tracking without replaying old moments', async () => {
    const migrate = useGameStore.persist.getOptions().migrate;
    const migrated = await migrate!({ advisorArchetype: 'shark' }, 14) as Record<string, unknown>;
    expect(migrated.archetypeAbilityUse).toBeNull();
    expect(migrated.apexCeremonies).toEqual({ pending: null, history: [] });
  });
});
