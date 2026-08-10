import { describe, it, expect } from 'vitest';
import { PHASE_MISSIONS, getMissionsForPhase } from '../missions';
describe('Phase Missions', () => {
    it('defines 2-4 strategic missions for every phase 0 to 10', () => {
        for (let phase = 0; phase <= 10; phase++) {
            const missions = getMissionsForPhase(phase);
            expect(missions.length).toBeGreaterThanOrEqual(2);
            expect(missions.length).toBeLessThanOrEqual(4);
        }
    });
    it('ensures each mission has a title, strategicChoice, and primaryActionIds', () => {
        Object.values(PHASE_MISSIONS).flatMap((m) => m).forEach((mission) => {
            expect(mission.title.length).toBeGreaterThan(0);
            expect(mission.strategicChoice.length).toBeGreaterThan(0);
            expect(mission.primaryActionIds.length).toBeGreaterThan(0);
            expect(mission.completionCriteria.requiredActionIds.length).toBeGreaterThan(0);
        });
    });
    it('retrieves correct missions for specific phase', () => {
        const p0Missions = getMissionsForPhase(0);
        expect(p0Missions[0].id).toBe('p0-m1');
        expect(p0Missions[1].id).toBe('p0-m2');
    });
});
//# sourceMappingURL=missions.test.js.map