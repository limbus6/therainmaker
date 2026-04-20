import type { GameStore } from '../store/gameStore';
export interface ResultsBoard {
    dealOutcome: 'deal_failed' | 'closed_with_friction' | 'clean_close' | 'premium_close';
    financial: {
        closingValue: number;
        feePercent: number;
        successFee: number;
        internalCost: number;
        netProjectProfit: number;
        projectMargin: number;
        budgetVariance: number;
    };
    client: {
        satisfaction: number;
        trust: number;
        expectationFit: number;
        rehireProbability: number;
        label: 'Disappointed' | 'Satisfied' | 'Very Satisfied' | 'Trusted Advisor';
    };
    team: {
        morale: number;
        burnout: number;
        cohesion: number;
        pride: number;
        label: 'Burnt Out' | 'Strained' | 'Solid' | 'Strong';
    };
    process: {
        processQuality: number;
        buyerManagement: number;
        riskControl: number;
        negotiationQuality: number;
        closingQuality: number;
    };
    career: {
        reputationGain: number;
        rainmakerScore: number;
        sectorCredibilityGain: number;
    };
    scores: {
        financialScore: number;
        clientScore: number;
        teamScore: number;
        processScore: number;
        careerImpactScore: number;
        overallDealScore: number;
        overallGrade: 'Weak Outcome' | 'Acceptable Outcome' | 'Strong Outcome' | 'Excellent Outcome' | 'Elite Rainmaker Outcome';
    };
    keyDrivers: string[];
}
export declare function buildResultsBoard(state: GameStore): ResultsBoard;
//# sourceMappingURL=resultsEngine.d.ts.map