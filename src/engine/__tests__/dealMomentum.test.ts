import { describe, expect, it } from 'vitest';
import { useGameStore } from '../../store/gameStore';
import { deriveDealMomentum, deriveDealMomentumBreakdown, explainDealMomentumChange } from '../dealMomentum';
import type { Buyer, GameTask, Risk } from '../../types/game';

describe('derived deal momentum', () => {
  it('starts from inspectable deal-state components', () => {
    const state = useGameStore.getState();
    const breakdown = deriveDealMomentumBreakdown({
      ...state,
      phase: 0,
      tasks: [],
      buyers: [],
      risks: [],
      competitorThreats: [],
      resources: { clientTrust: 40, riskLevel: 20 },
      boardSubmission: null,
      agreedFeeTerms: null,
      preferredBidderId: null,
      agreedSPATerms: null,
    });

    expect(breakdown).toMatchObject({
      phasePosition: 18,
      taskCurrency: 0,
      buyerConviction: 0,
      clientConfidence: 8,
      riskPressure: 1,
      total: 25,
    });
  });

  it('rises with current work and buyer conviction, then falls under active risk', () => {
    const state = useGameStore.getState();
    const task = {
      id: 'momentum-task', phase: 5, status: 'completed', complexity: 'medium', category: 'strategic',
    } as GameTask;
    const buyer = {
      id: 'momentum-buyer', status: 'bidding', interest: 'hot',
    } as Buyer;
    const base = {
      ...state,
      phase: 5 as const,
      tasks: [],
      buyers: [],
      risks: [],
      competitorThreats: [],
    };
    const strengthened = { ...base, tasks: [task], buyers: [buyer] };
    const pressured = {
      ...strengthened,
      risks: [{ id: 'momentum-risk', severity: 'critical', mitigated: false, retired: false } as Risk],
    };

    expect(deriveDealMomentum(strengthened)).toBeGreaterThan(deriveDealMomentum(base));
    expect(deriveDealMomentum(pressured)).toBeLessThan(deriveDealMomentum(strengthened));
    expect(explainDealMomentumChange(base, strengthened)).toContain('task currency +18');
    expect(explainDealMomentumChange(strengthened, pressured)).toContain('risk pressure increased');
  });
});
