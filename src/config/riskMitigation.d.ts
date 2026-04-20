import type { Risk, PlayerResources } from '../types/game';
export interface RiskMitigationPlan {
    id: string;
    title: string;
    actions: string[];
    budgetCost: number;
    capacityCost: number;
    successChance: number;
    catastrophicFailureChance?: number;
    boardRecommendation?: {
        recommendation: 'proceed' | 'decline';
        rationale: string;
    };
    onSuccess: Partial<Record<keyof PlayerResources, number>> & {
        probabilityDelta?: number;
    };
    onFailure: Partial<Record<keyof PlayerResources, number>> & {
        probabilityDelta?: number;
    };
    catastrophicHeadline?: string;
    catastrophicDescription?: string;
}
export declare function getRiskMitigationPlans(risk: Risk): RiskMitigationPlan[];
//# sourceMappingURL=riskMitigation.d.ts.map