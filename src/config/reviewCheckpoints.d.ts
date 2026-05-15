import type { BuyerStatus, PhaseId } from '../types/game';
export interface ReviewCheckpoint {
    id: string;
    phase: PhaseId;
    label: string;
    description: string;
    route: string;
    day: number;
    completedTaskIds?: string[];
    clientTrust?: number;
    dealMomentum?: number;
    riskLevel?: number;
    phaseDeadlineDay?: number;
    bindingOffersReceived?: number;
    preferredBidderId?: string;
    buyerStatuses?: Partial<Record<string, BuyerStatus>>;
    boardApproved?: boolean;
    leadInvestigated?: boolean;
    leadMeetingDone?: boolean;
    qualificationNotes?: number;
    pitchDocumentReady?: boolean;
    feeAgreed?: boolean;
    spaAgreed?: boolean;
}
export declare const REVIEW_CHECKPOINTS: ReviewCheckpoint[];
export declare const REVIEW_CHECKPOINTS_BY_ID: Record<string, ReviewCheckpoint>;
//# sourceMappingURL=reviewCheckpoints.d.ts.map