import type { Buyer, Deliverable, Email, GameTask, Headline, PhaseId, Risk } from '../types/game';
export interface PhaseContent {
    tasks: GameTask[];
    emails: Email[];
    deliverables: Deliverable[];
    risks: Risk[];
    headlines: Headline[];
    buyers?: Buyer[];
}
export declare function loadPhaseContent(phase: Exclude<PhaseId, 0>): Promise<PhaseContent>;
//# sourceMappingURL=loadPhaseContent.d.ts.map