import type {
  BoardSubmission,
  Buyer,
  CompetitorThreat,
  FeeTerms,
  GameTask,
  PhaseId,
  PlayerResources,
  Risk,
  SPATerms,
} from '../types/game';

export interface DealMomentumState {
  phase: PhaseId;
  resources: Pick<PlayerResources, 'clientTrust' | 'riskLevel'>;
  tasks: GameTask[];
  buyers: Buyer[];
  risks: Risk[];
  competitorThreats: CompetitorThreat[];
  boardSubmission: BoardSubmission | null;
  agreedFeeTerms: FeeTerms | null;
  preferredBidderId: string | null;
  agreedSPATerms: SPATerms | null;
}

export interface DealMomentumBreakdown {
  phasePosition: number;
  taskCurrency: number;
  buyerConviction: number;
  clientConfidence: number;
  milestoneControl: number;
  riskPressure: number;
  total: number;
}

const PHASE_POSITION: Record<PhaseId, number> = {
  0: 18,
  1: 22,
  2: 26,
  3: 30,
  4: 34,
  5: 38,
  6: 42,
  7: 46,
  8: 50,
  9: 54,
  10: 58,
};

const INTEREST_SCORE: Record<Buyer['interest'], number> = {
  cold: 0,
  lukewarm: 2,
  warm: 5,
  hot: 8,
  on_fire: 10,
};

const STATUS_SCORE: Partial<Record<Buyer['status'], number>> = {
  contacted: 1,
  nda_signed: 2,
  reviewing: 3,
  active: 4,
  shortlisted: 5,
  bidding: 7,
  preferred: 10,
};

const RISK_PRESSURE: Record<Risk['severity'], number> = {
  low: 0.5,
  medium: 1,
  high: 2,
  critical: 4,
};

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

/**
 * Momentum is a materialised view of the live deal, never an independently
 * authored resource. Every component below is inspectable in the UI.
 */
export function deriveDealMomentumBreakdown(state: DealMomentumState): DealMomentumBreakdown {
  const phaseTasks = state.tasks.filter((task) => task.phase === state.phase && !task.isBackgroundTask);
  const taskProgress = phaseTasks.length === 0
    ? 0
    : phaseTasks.reduce((sum, task) => {
        if (task.status === 'completed') return sum + 1;
        if (task.status === 'in_progress') return sum + Math.min(0.9, (task.progress ?? 0) / 100);
        return sum;
      }, 0) / phaseTasks.length;
  const taskCurrency = Math.round(taskProgress * 18);

  const activeBuyers = state.buyers.filter((buyer) => !['dropped', 'excluded'].includes(buyer.status));
  const buyerConviction = state.phase < 3 || activeBuyers.length === 0
    ? 0
    : Math.min(22, Math.round(
        Math.min(6, activeBuyers.length * 1.5) +
        activeBuyers.reduce((sum, buyer) => sum + INTEREST_SCORE[buyer.interest], 0) / activeBuyers.length +
        Math.max(...activeBuyers.map((buyer) => STATUS_SCORE[buyer.status] ?? 0)),
      ));

  const clientConfidence = Math.round(state.resources.clientTrust * 0.2);
  const milestoneControl =
    (state.boardSubmission?.status === 'approved' ? 3 : 0) +
    (state.agreedFeeTerms ? 3 : 0) +
    (state.preferredBidderId ? 4 : 0) +
    (state.agreedSPATerms ? 4 : 0);

  const activeRiskPressure = state.risks
    .filter((risk) => !risk.mitigated && !risk.retired)
    .reduce((sum, risk) => sum + RISK_PRESSURE[risk.severity], 0);
  const threatPressure = state.competitorThreats.filter((threat) => !threat.resolved).length * 3;
  const riskPressure = Math.min(18, Math.round(activeRiskPressure + threatPressure + state.resources.riskLevel * 0.04));

  const phasePosition = PHASE_POSITION[state.phase];
  const total = clamp(phasePosition + taskCurrency + buyerConviction + clientConfidence + milestoneControl - riskPressure);

  return {
    phasePosition,
    taskCurrency,
    buyerConviction,
    clientConfidence,
    milestoneControl,
    riskPressure,
    total,
  };
}

export function deriveDealMomentum(state: DealMomentumState): number {
  return deriveDealMomentumBreakdown(state).total;
}

export function explainDealMomentum(state: DealMomentumState): string {
  const parts = deriveDealMomentumBreakdown(state);
  return `Derived from phase position ${parts.phasePosition}, task currency +${parts.taskCurrency}, buyer conviction +${parts.buyerConviction}, client confidence +${parts.clientConfidence}, milestone control +${parts.milestoneControl}, and risk pressure -${parts.riskPressure}.`;
}

export function explainDealMomentumChange(before: DealMomentumState, after: DealMomentumState): string {
  const previous = deriveDealMomentumBreakdown(before);
  const next = deriveDealMomentumBreakdown(after);
  const changes: string[] = [];
  const addContribution = (label: string, key: keyof Omit<DealMomentumBreakdown, 'total'>) => {
    const delta = next[key] - previous[key];
    if (delta !== 0) changes.push(`${label} ${delta > 0 ? '+' : ''}${delta}`);
  };

  addContribution('phase position', 'phasePosition');
  addContribution('task currency', 'taskCurrency');
  addContribution('buyer conviction', 'buyerConviction');
  addContribution('client confidence', 'clientConfidence');
  addContribution('milestone control', 'milestoneControl');
  const riskDelta = next.riskPressure - previous.riskPressure;
  if (riskDelta !== 0) {
    changes.push(`risk pressure ${riskDelta > 0 ? 'increased' : 'eased'} by ${Math.abs(riskDelta)}`);
  }

  return changes.length > 0
    ? `Derived from live deal state: ${changes.join(', ')}`
    : 'Derived from live phase, current work, buyer conviction, client confidence, milestones, and active risk';
}
