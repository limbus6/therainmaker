// ============================================
// Mission Progress & Active Mission Selection
// ============================================
// Derives per-mission completion from task state so the Deal Desk can show
// "Mission 2 of 3", a progress count, and rotate to the next incomplete mission.
export function getMissionProgress(missions, tasks, phase) {
    return missions.map((mission, index) => {
        const required = mission.completionCriteria.requiredActionIds;
        const completedRequired = required.filter((id) => tasks.some((t) => t.id === id && t.phase === phase && t.status === 'completed')).length;
        return {
            mission,
            index,
            completedRequired,
            totalRequired: required.length,
            complete: required.length > 0 && completedRequired === required.length,
        };
    });
}
/**
 * Picks the mission the Deal Desk should surface: an explicit player focus if
 * it is still incomplete, otherwise the first incomplete mission, otherwise
 * the last mission (all complete — desk shows the completed state).
 */
export function getActiveMission(entries, activeMissionId) {
    if (entries.length === 0)
        return null;
    if (activeMissionId) {
        const focused = entries.find((e) => e.mission.id === activeMissionId && !e.complete);
        if (focused)
            return focused;
    }
    return entries.find((e) => !e.complete) ?? entries[entries.length - 1];
}
//# sourceMappingURL=missionProgress.js.map