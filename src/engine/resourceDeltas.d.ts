import type { PlayerResources, ResourceDelta } from '../types/game';
import type { WeekResult } from './weekEngine';
type AttributionContext = Pick<WeekResult, 'tasksCompleted' | 'criticalOutcomes' | 'newEvents' | 'hiddenWorkload' | 'resolvedBudgetRequests'>;
/**
 * Builds the attributable delta list for one advance.
 * Zero-change resources are omitted.
 */
export declare function buildResourceDeltas(before: PlayerResources, after: PlayerResources, result: AttributionContext): ResourceDelta[];
export {};
//# sourceMappingURL=resourceDeltas.d.ts.map