// ============================================
// Resource Delta Attribution
// ============================================
// Compares resources before/after an advance and attaches a best-effort
// causal reason so the UI can show "Trust +4: Ricardo responded well"
// instead of a silent number jump.

import type { PlayerResources, ResourceDelta } from '../types/game';
import type { WeekResult } from './weekEngine';

const TRACKED_RESOURCES: (keyof PlayerResources)[] = [
  'budget',
  'teamCapacity',
  'dealMomentum',
  'clientTrust',
  'morale',
  'riskLevel',
  'reputation',
];

type AttributionContext = Pick<
  WeekResult,
  'tasksCompleted' | 'criticalOutcomes' | 'newEvents' | 'hiddenWorkload' | 'resolvedBudgetRequests'
>;

function attributeReason(
  resource: keyof PlayerResources,
  delta: number,
  result: AttributionContext
): { reason: string; sourceEntity?: string } {
  // 1. Critical outcomes that explicitly touched this resource
  const crit = result.criticalOutcomes.find(
    (c) => (c.bonus as Record<string, number | undefined>)[resource] !== undefined
  );
  if (crit) {
    return {
      reason: `${crit.type === 'success' ? 'Exceptional result' : 'Setback'}: ${crit.taskName}`,
      sourceEntity: crit.taskName,
    };
  }

  if (resource === 'dealMomentum') {
    return {
      reason: 'Derived from phase progress, current work, buyer conviction, client trust, and active risk',
      sourceEntity: 'Live deal state',
    };
  }

  // 2. Budget approvals are the dominant cause of budget increases
  if (resource === 'budget' && delta > 0) {
    const approved = result.resolvedBudgetRequests.find((r) => r.approved);
    if (approved) {
      return { reason: `Budget request approved (+€${approved.amount}k)`, sourceEntity: 'Investment Committee' };
    }
  }

  // 3. Complications drive risk level up
  if (resource === 'riskLevel' && delta > 0 && result.hiddenWorkload) {
    return { reason: `Complication: ${result.hiddenWorkload.description}` };
  }

  // 4. Events are the usual cause of trust/momentum/morale swings
  if (result.newEvents.length > 0) {
    const evt = result.newEvents[0];
    return { reason: evt.title, sourceEntity: evt.title };
  }

  // 5. Completed work moves momentum and eases risk
  if (result.tasksCompleted.length > 0) {
    const task = result.tasksCompleted[0];
    return { reason: `${task.name} completed`, sourceEntity: task.name };
  }

  // 6. Routine engine effects still name their concrete mechanism. Never show
  // a made-up "steady execution" label for a movement the player cannot audit.
  if (resource === 'budget') {
    return { reason: delta < 0 ? 'Execution and contractor spend' : 'Budget carryover adjustment' };
  }
  if (resource === 'teamCapacity') {
    return { reason: delta < 0 ? 'Active work allocation' : 'Capacity recovered between workstreams' };
  }
  if (resource === 'morale') {
    return { reason: delta < 0 ? 'Sustained delivery load' : 'Recovery between workstreams' };
  }
  if (resource === 'riskLevel') {
    return { reason: delta < 0 ? 'Completed work reduced execution risk' : 'No completed milestone increased execution risk' };
  }
  if (resource === 'clientTrust') {
    return { reason: delta < 0 ? 'Client confidence weakened during execution' : 'Client confidence improved through execution' };
  }
  return { reason: delta < 0 ? 'Market standing weakened' : 'Market standing improved' };
}

/**
 * Builds the attributable delta list for one advance.
 * Zero-change resources are omitted.
 */
export function buildResourceDeltas(
  before: PlayerResources,
  after: PlayerResources,
  result: AttributionContext
): ResourceDelta[] {
  const deltas: ResourceDelta[] = [];
  for (const resource of TRACKED_RESOURCES) {
    const b = before[resource];
    const a = after[resource];
    if (typeof b !== 'number' || typeof a !== 'number') continue;
    const delta = Math.round(a - b);
    if (delta === 0) continue;
    deltas.push({ resource, before: b, after: a, delta, ...attributeReason(resource, delta, result) });
  }
  return deltas;
}
