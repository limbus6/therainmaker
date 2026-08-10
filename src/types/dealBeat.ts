// ============================================
// Deal Beat & Phase Mission Types
// ============================================
// Core types driving the "Plan -> Execute -> Observe -> React" gameplay loop.

import type { PhaseId, PlayerResources } from './game';

export interface DealBeatAction {
  id: string;
  name: string;
  description: string;
  cost: number;           // k€ budget cost
  capacityWork: number;   // team capacity % consumed
  workloadDays: number;   // days needed to complete (1-5)
  effectSummary: string;
  resourceEffects?: Partial<PlayerResources>;
  linkedTaskId?: string;  // mapped back to existing GameTask if applicable
}

export interface ActionCommitment {
  id: string;
  actionId: string;
  actionName: string;
  startDay: number;
  expectedFinishDay: number;
  progress: number;       // 0-100 accumulated execution progress
  workloadDays: number;
  linkedTaskId?: string;
}

export type BeatStatus = 'pending' | 'in_progress' | 'resolved';

export interface DealBeat {
  id: string;
  phase: PhaseId;
  title: string;
  objective: string;
  availableActions: DealBeatAction[]; // Max 4 priority actions presented at a time
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
