import type { PhaseId, PlayerResources } from './game';
export interface DealBeatAction {
    id: string;
    name: string;
    description: string;
    cost: number;
    capacityWork: number;
    workloadDays: number;
    effectSummary: string;
    resourceEffects?: Partial<PlayerResources>;
    linkedTaskId?: string;
}
export interface ActionCommitment {
    id: string;
    actionId: string;
    actionName: string;
    startDay: number;
    expectedFinishDay: number;
    progress: number;
    workloadDays: number;
    linkedTaskId?: string;
}
export type BeatStatus = 'pending' | 'in_progress' | 'resolved';
export interface DealBeat {
    id: string;
    phase: PhaseId;
    title: string;
    objective: string;
    availableActions: DealBeatAction[];
    status: BeatStatus;
    deadlineDay?: number;
    consequencesSummary?: string;
}
export interface PhaseMission {
    id: string;
    phase: PhaseId;
    title: string;
    strategicChoice: string;
    description: string;
    primaryActionIds: string[];
    supportingTaskIds: string[];
    qualityBonusTaskIds?: string[];
    completionCriteria: {
        requiredActionIds: string[];
        minQualityScore?: number;
    };
}
//# sourceMappingURL=dealBeat.d.ts.map