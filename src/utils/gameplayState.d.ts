import type { Buyer, Deliverable, FinalOffer, GameTask, PhaseId, Risk, Workstream, WorkstreamId } from '../types/game';
export declare const WORKSTREAMS_BY_PHASE: Record<PhaseId, WorkstreamId[]>;
export declare function getMomentumLabel(phase: PhaseId): string;
export declare function isActiveRisk(risk: Risk): boolean;
export declare function retireObsoleteRisks(risks: Risk[], phase: PhaseId, bindingOffersReceived?: number): Risk[];
export declare function riskUrgencyScore(risk: Risk, currentPhase: PhaseId): number;
export declare function sortRisksByUrgency(risks: Risk[], currentPhase: PhaseId): Risk[];
export declare function getActiveRisks(risks: Risk[], currentPhase: PhaseId): Risk[];
export declare function getRetiredRisks(risks: Risk[]): Risk[];
export declare function applyPhaseWorkstreams(workstreams: Workstream[], phase: PhaseId): Workstream[];
export declare function updatePhaseWorkstreamProgress(workstreams: Workstream[], tasks: GameTask[], phase: PhaseId): Workstream[];
export declare function getDashboardDeliverables(deliverables: Deliverable[], phase: PhaseId): Deliverable[];
export declare function getEstimatedValuationRange(buyer: Buyer): string;
export declare function getBuyerOfferLabel(buyer: Buyer, finalOffers: FinalOffer[]): string;
//# sourceMappingURL=gameplayState.d.ts.map