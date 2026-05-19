import type { Buyer, Deliverable, FinalOffer, GameTask, PhaseId, Risk, RiskSeverity, Workstream, WorkstreamId } from '../types/game';

export const WORKSTREAMS_BY_PHASE: Record<PhaseId, WorkstreamId[]> = {
  0: ['preparation'],
  1: ['financials', 'marketing_materials', 'buyer_outreach'],
  2: ['financials', 'marketing_materials', 'buyer_outreach', 'management'],
  3: ['buyer_outreach', 'marketing_materials'],
  4: ['buyer_outreach', 'negotiation'],
  5: ['negotiation', 'due_diligence'],
  6: ['due_diligence', 'management'],
  7: ['negotiation'],
  8: ['negotiation'],
  9: ['negotiation', 'closing'],
  10: ['closing'],
};

const SEVERITY_SCORE: Record<RiskSeverity, number> = {
  critical: 400,
  high: 300,
  medium: 200,
  low: 100,
};

export function getMomentumLabel(phase: PhaseId): string {
  if (phase === 0) return 'Opportunity Signal';
  if (phase === 1) return 'Mandate Momentum';
  return 'Deal Momentum';
}

export function isActiveRisk(risk: Risk): boolean {
  return !risk.mitigated && !risk.retired;
}

function retireReasonForRisk(risk: Risk, phase: PhaseId, bindingOffersReceived: number): string | null {
  const name = risk.name.toLowerCase();

  if (risk.expiresAfterPhase !== undefined && phase > risk.expiresAfterPhase) {
    return `Retired after Phase ${risk.expiresAfterPhase}.`;
  }
  if (name.includes('competing advisor') && phase > 1) {
    return 'Mandate signed; competing advisor risk no longer drives the process.';
  }
  if (name.includes('nda processing bottleneck') && phase > 3) {
    return 'NDA processing window has closed.';
  }
  if (name.includes('material quality risk') && (phase > 5 || bindingOffersReceived > 0)) {
    return 'Marketing materials have already supported the NBO and binding-offer process.';
  }

  return null;
}

export function retireObsoleteRisks(risks: Risk[], phase: PhaseId, bindingOffersReceived = 0): Risk[] {
  return risks.map((risk) => {
    if (risk.retired || risk.mitigated) return risk;
    const retiredReason = retireReasonForRisk(risk, phase, bindingOffersReceived);
    return retiredReason ? { ...risk, retired: true, retiredReason } : risk;
  });
}

export function riskUrgencyScore(risk: Risk, currentPhase: PhaseId): number {
  const phaseDistance = Math.abs(currentPhase - risk.surfacedPhase);
  const currentPhaseBonus = risk.surfacedPhase === currentPhase ? 80 : Math.max(0, 36 - phaseDistance * 12);
  return SEVERITY_SCORE[risk.severity] + risk.probability * 2 + currentPhaseBonus;
}

export function sortRisksByUrgency(risks: Risk[], currentPhase: PhaseId): Risk[] {
  return [...risks].sort((a, b) => {
    const urgency = riskUrgencyScore(b, currentPhase) - riskUrgencyScore(a, currentPhase);
    if (urgency !== 0) return urgency;
    return b.surfacedPhase - a.surfacedPhase;
  });
}

export function getActiveRisks(risks: Risk[], currentPhase: PhaseId): Risk[] {
  return sortRisksByUrgency(risks.filter(isActiveRisk), currentPhase);
}

export function getRetiredRisks(risks: Risk[]): Risk[] {
  return risks.filter((risk) => risk.retired && !risk.mitigated);
}

export function applyPhaseWorkstreams(workstreams: Workstream[], phase: PhaseId): Workstream[] {
  const activeIds = new Set(WORKSTREAMS_BY_PHASE[phase]);
  return workstreams.map((workstream) => ({
    ...workstream,
    active: activeIds.has(workstream.id),
  }));
}

function getWorkstreamTasks(tasks: GameTask[], workstreamId: WorkstreamId, phase: PhaseId): GameTask[] {
  const defaultWorkstreamId = WORKSTREAMS_BY_PHASE[phase][0];
  return tasks.filter((task) => {
    if (task.phase !== phase) return false;
    if (task.workstreamId === workstreamId) return true;
    return !task.workstreamId && workstreamId === defaultWorkstreamId;
  });
}

export function updatePhaseWorkstreamProgress(workstreams: Workstream[], tasks: GameTask[], phase: PhaseId): Workstream[] {
  return applyPhaseWorkstreams(workstreams, phase).map((workstream) => {
    if (!workstream.active) return workstream;
    const workstreamTasks = getWorkstreamTasks(tasks, workstream.id, phase);
    if (workstreamTasks.length === 0) return workstream;
    const completed = workstreamTasks.filter((task) => task.status === 'completed').length;
    return { ...workstream, progress: Math.round((completed / workstreamTasks.length) * 100) };
  });
}

export function getDashboardDeliverables(deliverables: Deliverable[], phase: PhaseId): Deliverable[] {
  const relevant = deliverables.filter((deliverable) => deliverable.phase === phase || deliverable.phase === Math.min(phase + 1, 10));
  const pool = relevant.length > 0 ? relevant : deliverables;
  return [...pool]
    .sort((a, b) => {
      const phaseSort = b.phase - a.phase;
      if (phaseSort !== 0) return phaseSort;
      return b.completion - a.completion;
    })
    .slice(0, 5);
}

export function getEstimatedValuationRange(buyer: Buyer): string {
  const range = buyer.valuationPosture === 'aggressive'
    ? '€130-150M'
    : buyer.valuationPosture === 'fair'
      ? '€115-130M'
      : '€100-115M';
  return `${range} est.`;
}

export function getBuyerOfferLabel(buyer: Buyer, finalOffers: FinalOffer[]): string {
  const offer = finalOffers.find((item) => item.buyerId === buyer.id);
  if (!offer) return getEstimatedValuationRange(buyer);
  const cashLabel = offer.earnoutAmount > 0 ? ` / €${offer.cashEV}M cash` : '';
  const structure = offer.structure.replace(/_/g, ' ');
  return `€${offer.totalEV}M${cashLabel} · ${structure}`;
}
