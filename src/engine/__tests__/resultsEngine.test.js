import { describe, it, expect } from 'vitest';
import { buildResultsBoard } from '../resultsEngine';
describe('Results Engine', () => {
    const getMockState = () => ({
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
    });
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
});
//# sourceMappingURL=resultsEngine.test.js.map