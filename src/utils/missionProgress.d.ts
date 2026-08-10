import type { PhaseMission } from '../types/dealBeat';
import type { GameTask, PhaseId } from '../types/game';
export interface MissionProgressEntry {
    mission: PhaseMission;
    index: number;
    completedRequired: number;
    totalRequired: number;
    complete: boolean;
}
export declare function getMissionProgress(missions: PhaseMission[], tasks: GameTask[], phase: PhaseId): MissionProgressEntry[];
/**
 * Picks the mission the Deal Desk should surface: an explicit player focus if
 * it is still incomplete, otherwise the first incomplete mission, otherwise
 * the last mission (all complete — desk shows the completed state).
 */
export declare function getActiveMission(entries: MissionProgressEntry[], activeMissionId?: string): MissionProgressEntry | null;
//# sourceMappingURL=missionProgress.d.ts.map