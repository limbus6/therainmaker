import type { PhaseId, StaffProfile, ContractorProfile } from '../types/game';
export declare const PHASE_BASE_BUDGETS: Record<PhaseId, number>;
export declare const BUDGET_LOW_THRESHOLD = 10;
export interface StaffProfileConfig {
    id: StaffProfile;
    label: string;
    role: string;
    seniority: 'junior' | 'mid' | 'senior';
    hireCost: number;
    capacityBoost: number;
    skills: string[];
}
export declare const STAFF_PROFILES: StaffProfileConfig[];
export interface ContractorProfileConfig {
    id: ContractorProfile;
    label: string;
    weeklyRate: number;
    speedMultiplier: number;
    description: string;
}
export declare const CONTRACTOR_PROFILES: ContractorProfileConfig[];
import type { MitigationActionId } from '../types/game';
export interface MitigationActionConfig {
    id: MitigationActionId;
    label: string;
    description: string;
    category: 'relationship' | 'process';
    budgetCost: number;
    effects: {
        clientTrust?: number;
        dealMomentum?: number;
        reputation?: number;
        pitchWeeksReduced?: number;
    };
}
export declare const MITIGATION_ACTIONS: MitigationActionConfig[];
//# sourceMappingURL=phaseBudgets.d.ts.map