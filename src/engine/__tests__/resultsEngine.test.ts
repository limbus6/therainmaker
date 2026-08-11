import { describe, it, expect } from 'vitest';
import { buildResultsBoard } from '../resultsEngine';
import { GameStore } from '../../store/gameStore';
import type { ProcessCategory, ProcessRecord } from '../../types/game';

describe('Results Engine', () => {
  const getMockState = (): GameStore => ({
    phase: 10,
    preferredBidderId: 'buyer-01',
    finalOffers: [
      {
        buyerId: 'buyer-01',
        submittedPhase: 7,
        submittedWeek: 1,
        cashEV: 200,
        earnoutAmount: 0,
        earnoutConditions: 'None',
        totalEV: 200,
        structure: 'full_cash',
        conditionality: 'clean',
        exclusivityRequested: true,
        impliedMultiple: 12,
        advisorNote: '',
      },
      {
        buyerId: 'buyer-02',
        submittedPhase: 7,
        submittedWeek: 1,
        cashEV: 100,
        earnoutAmount: 100,
        earnoutConditions: 'Hard conditions',
        totalEV: 200,
        structure: 'earnout_heavy',
        conditionality: 'heavy_conditions',
        exclusivityRequested: false,
        impliedMultiple: 12,
        advisorNote: '',
      }
    ],
    buyers: [
      { id: 'buyer-01', name: 'Buyer 1', type: 'pe', executionCredibility: 100, ddFriction: 'low', valuationPosture: 'fair', status: 'preferred', bindingOfferSubmitted: true },
      { id: 'buyer-02', name: 'Buyer 2', type: 'pe', executionCredibility: 100, ddFriction: 'high', valuationPosture: 'fair', status: 'bidding', bindingOfferSubmitted: true }
    ],
    resources: {
      dealMomentum: 50,
      clientTrust: 50,
      morale: 50,
      budget: 100,
      budgetMax: 200,
      teamCapacity: 100,
      teamCapacityMax: 100,
      riskLevel: 10,
      reputation: 50,
    },
    tasks: [],
    risks: [],
    agreedFeeTerms: { successFeePercent: 2 }
  } as unknown as GameStore);

  it('closingValue uses selected offer\'s totalEV (not hardcoded 120M)', () => {
    const state = getMockState();
    const result = buildResultsBoard(state);
    expect(result.financial.closingValue).toBe(200);
  });

  it('clean conditionality yields higher value than heavy_conditions', () => {
    const stateClean = getMockState();
    stateClean.preferredBidderId = 'buyer-01'; // clean
    
    const stateHeavy = getMockState();
    stateHeavy.preferredBidderId = 'buyer-02'; // heavy_conditions

    const resultClean = buildResultsBoard(stateClean);
    const resultHeavy = buildResultsBoard(stateHeavy);
    
    expect(resultClean.financial.closingValue).toBeGreaterThan(resultHeavy.financial.closingValue);
    expect(resultClean.scores.financialScore).toBeGreaterThan(resultHeavy.scores.financialScore);
  });

  it('fallback to momentum when no offer found', () => {
    const state = getMockState();
    state.preferredBidderId = null;
    
    const result = buildResultsBoard(state);
    expect(result.financial.closingValue).toBeGreaterThan(0);
    expect(result.financial.closingValue).not.toBe(200); // Should fallback to base 120M modified by momentum
    expect(result.financial.closingValue).toBe(114); // 120 * (0.7 + 0.5 * 0.5) = 114
  });

  it('financial scoring reflects cash certainty', () => {
    const stateCash = getMockState();
    stateCash.preferredBidderId = 'buyer-01'; // full_cash, clean
    
    const stateEarnout = getMockState();
    stateEarnout.preferredBidderId = 'buyer-02'; // earnout_heavy, heavy_conditions

    const resultCash = buildResultsBoard(stateCash);
    const resultEarnout = buildResultsBoard(stateEarnout);
    
    expect(resultCash.scores.financialScore).toBeGreaterThan(resultEarnout.scores.financialScore);
  });

  const processRecords = (rating: number): ProcessRecord[] => (
    (['judgment', 'execution', 'stakeholder', 'risk', 'negotiation'] as ProcessCategory[]).map((category, index) => ({
      id: `process-${category}`,
      dedupeKey: `test:${category}`,
      day: index + 1,
      phase: index as 0 | 1 | 2 | 3 | 4,
      category,
      rating,
      weight: 3,
      sourceType: category === 'execution' ? 'task' : 'email',
      sourceId: category,
      headline: `${category} moment`,
      explanation: `A recorded ${category} decision.`,
    }))
  );

  it('can award strong process quality even when the deal fails', () => {
    const state = getMockState();
    state.phase = 8;
    state.scoringModelVersion = 'causal-v2';
    state.mandateDifficulty = { processBreadth: 50, timePressure: 50, diligenceBurden: 50, stakeholderVolatility: 50, buyerFragility: 50, overall: 50 };
    state.processLog = processRecords(1);

    const result = buildResultsBoard(state);

    expect(result.dealOutcome).toBe('deal_failed');
    expect(result.scores.processScore).toBe(100);
  });

  it('does not award strong process quality merely because the deal closed', () => {
    const state = getMockState();
    state.scoringModelVersion = 'causal-v2';
    state.mandateDifficulty = { processBreadth: 50, timePressure: 50, diligenceBurden: 50, stakeholderVolatility: 50, buyerFragility: 50, overall: 50 };
    state.processLog = processRecords(0);

    const result = buildResultsBoard(state);

    expect(result.dealOutcome).not.toBe('deal_failed');
    expect(result.scores.processScore).toBe(0);
  });

  it('builds the player debrief from recorded moments', () => {
    const state = getMockState();
    state.scoringModelVersion = 'causal-v2';
    state.mandateDifficulty = { processBreadth: 50, timePressure: 50, diligenceBurden: 50, stakeholderVolatility: 50, buyerFragility: 50, overall: 50 };
    state.processLog = processRecords(1);

    const result = buildResultsBoard(state);

    expect(result.debrief).toHaveLength(5);
    expect(result.debrief.every((finding) => finding.sourceRecordId)).toBe(true);
    expect(result.debrief.some((finding) => finding.headline === 'judgment moment')).toBe(true);
  });
});
