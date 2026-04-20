import type { GameTask, PlayerResources, Risk, Email, Headline, GameEvent, PhaseId, Buyer, QualificationNote } from '../types/game';
import type { GameStore } from '../store/gameStore';
export interface WeekResult {
    tasksCompleted: GameTask[];
    tasksProgressed: GameTask[];
    resourceChanges: Partial<PlayerResources>;
    newRisks: Risk[];
    newEmails: Email[];
    newHeadlines: Headline[];
    newEvents: GameEvent[];
    newQualificationNotes: Omit<QualificationNote, 'id' | 'week'>[];
    buyerChanges: BuyerChange[];
    hiddenWorkload: {
        taskId: string;
        description: string;
        extraWork: number;
    } | null;
    criticalOutcomes: {
        taskId: string;
        taskName: string;
        type: 'success' | 'failure';
        description: string;
        bonus: Partial<PlayerResources>;
    }[];
    narrativeSummary: string;
    phaseProgressDelta: number;
    resolvedBudgetRequests: {
        id: string;
        approved: boolean;
        amount: number;
    }[];
    resolvedBoardSubmission: {
        approved: boolean;
        notes: string;
    } | null;
    newTasks?: GameTask[];
    /** How many calendar days this advance covered (1–7) */
    daysAdvanced: number;
    /** Internal: updated buyer array for store to apply */
    _updatedBuyers: Buyer[];
    /** How many buyers submitted binding offers this advance (Phase 6 deadline trigger) */
    bindingOfferDelta: number;
}
export interface BuyerChange {
    buyerId: string;
    field: 'status' | 'interest';
    from: string;
    to: string;
}
export declare function resolveWeek(state: GameStore, daysToAdvance?: number): WeekResult;
export declare function calcDaysToAdvance(state: GameStore): number;
export type CollapseReason = 'client_walked' | 'all_buyers_gone' | 'firm_cannot_continue' | 'momentum_dead';
export interface CollapseResult {
    collapsed: boolean;
    reason: CollapseReason | null;
    headline: string;
    description: string;
}
export declare function checkDealCollapse(state: GameStore): CollapseResult;
export interface PhaseGateResult {
    canTransition: boolean;
    requirements: {
        label: string;
        met: boolean;
    }[];
    nextPhase: PhaseId;
}
export declare function checkPhaseGate(state: GameStore): PhaseGateResult;
export declare function unlockTasks(tasks: GameTask[]): GameTask[];
//# sourceMappingURL=weekEngine.d.ts.map