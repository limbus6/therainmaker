// ============================================
// Resource Delta Attribution
// ============================================
// Compares resources before/after an advance and attaches a best-effort
// causal reason so the UI can show "Trust +4: Ricardo responded well"
// instead of a silent number jump.
const TRACKED_RESOURCES = [
    'budget',
    'teamCapacity',
    'dealMomentum',
    'clientTrust',
    'morale',
    'riskLevel',
    'reputation',
];
function attributeReason(resource, delta, result) {
    // 1. Critical outcomes that explicitly touched this resource
    const crit = result.criticalOutcomes.find((c) => c.bonus[resource] !== undefined);
    if (crit) {
        return {
            reason: `${crit.type === 'success' ? 'Exceptional result' : 'Setback'}: ${crit.taskName}`,
            sourceEntity: crit.taskName,
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
    // 6. Generic fallback — never block the feature on missing attribution
    return { reason: delta < 0 ? 'Weekly operations & burn' : 'Steady execution' };
}
/**
 * Builds the attributable delta list for one advance.
 * Zero-change resources are omitted.
 */
export function buildResourceDeltas(before, after, result) {
    const deltas = [];
    for (const resource of TRACKED_RESOURCES) {
        const b = before[resource];
        const a = after[resource];
        if (typeof b !== 'number' || typeof a !== 'number')
            continue;
        const delta = Math.round((a - b) * 10) / 10;
        if (delta === 0)
            continue;
        deltas.push({ resource, before: b, after: a, delta, ...attributeReason(resource, delta, result) });
    }
    return deltas;
}
//# sourceMappingURL=resourceDeltas.js.map