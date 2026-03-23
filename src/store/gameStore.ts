import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  PhaseId,
  Email,
  GameTask,
  Workstream,
  Deliverable,
  Risk,
  Headline,
  Client,
  Lead,
  PlayerResources,
  TeamMember,
  StaffProfile,
  ContractorProfile,
  MitigationActionId,
  QualificationNote,
  BoardSubmission,
  TempCapacityAllocation,
  FeeNegotiation,
  FeeTerms,
  NegotiationRound,
  ClientNegotiationState,
  ClientNegotiationProfile,
  ComponentReaction,
  Toast,
  FinalOffer,
  DataroomCategory,
  DataroomAccessLevel,
  SPABuyerState,
  SPABuyerProfile,
  SPANegotiation,
  SPARound,
  SPATerms,
  GameEvent,
  BudgetRequest,
  Buyer,
  CompetitorThreat,
} from '../types/game';
import { resolveWeek, checkPhaseGate, unlockTasks, checkDealCollapse, calcDaysToAdvance } from '../engine/weekEngine';
import type { WeekResult, PhaseGateResult } from '../engine/weekEngine';
import { PHASE_BASE_BUDGETS, STAFF_PROFILES, CONTRACTOR_PROFILES, MITIGATION_ACTIONS } from '../config/phaseBudgets';
import { getRiskMitigationPlans } from '../config/riskMitigation';
import { round2 } from '../utils/numberFormat';

import { loadPhaseContent } from '../content/loadPhaseContent';

// ============================================
// Initial Phase 0: Deal Origination Seed Data
// ============================================

const initialResources: PlayerResources = {
  budget: PHASE_BASE_BUDGETS[0],
  budgetMax: PHASE_BASE_BUDGETS[0],
  teamCapacity: 90,
  teamCapacityMax: 100,
  morale: 80,
  clientTrust: 40,
  dealMomentum: 15,
  riskLevel: 10,
  reputation: 40,
};

const initialClient: Client = {
  name: 'Ricardo Mendes',
  companyName: 'Solara Systems',
  sector: 'Industrial SaaS / Energy Tech',
  description: 'Founder-led industrial IoT platform specialising in predictive maintenance for energy infrastructure. €28M ARR, growing 35% YoY. The founder is considering a full exit after 12 years.',
  objectives: ['Maximise valuation', 'Ensure cultural continuity', 'Clean exit within 6 months'],
  valuationExpectation: '10-12x EBITDA',
  valuationExpectationEV: 120, // ~€120M EV
  timeSensitivity: 'medium',
  riskTolerance: 'moderate',
  trust: 40,
  confidence: 35,
};

const initialTeam: TeamMember[] = [
  { id: 'tm-1', name: 'Ana Ferreira', role: 'Vice President', seniority: 'senior', capacity: 95, morale: 80, currentLoad: 10, skills: ['Financial Modelling', 'Client Management'] },
  { id: 'tm-2', name: 'James Wu', role: 'Associate', seniority: 'mid', capacity: 100, morale: 85, currentLoad: 5, skills: ['Market Research', 'Buyer Mapping'] },
  { id: 'tm-3', name: 'Sofia Lindqvist', role: 'Analyst', seniority: 'junior', capacity: 100, morale: 90, currentLoad: 0, skills: ['Data Analysis', 'Presentations'] },
];

// Phase 0: Origination emails — the opportunity surfaces
const initialEmails: Email[] = [
  {
    id: 'email-1',
    week: 1,
    phase: 0,
    sender: 'Marcus Aldridge',
    senderRole: 'Managing Partner',
    subject: 'Q3 Mandate Objective',
    body: 'We are behind on our origination targets for this quarter. I need you to secure a new sell-side mandate within the next few weeks to close the gap.\n\nThe Deal Origination team is currently scanning the market and should have a shortlist of actionable targets for you shortly. In the meantime, you have a €50k origination budget to deploy. Use it to build a solid investment case once the targets are identified.\n\nStart warming up your broader market read now so we\'re ready to move fast.',
    preview: 'We need a mandate this quarter. Deal Origination is...',
    category: 'partner',
    state: 'unread',
    priority: 'high',
    timestamp: 'Week 1, Monday',
    responseOptions: [
      { id: 'r1', label: 'Understood. I\'ll get the team ready.', effects: '+2 momentum', resourceEffects: { dealMomentum: 2 } },
    ],
  }
];

// Phase 0: Origination tasks — assess the opportunity
const initialTasks: GameTask[] = [
  {
    id: 'task-gen-01', name: 'Assess Macro Environment', description: 'Review current interest rates, generic M&A volume trends, and macroeconomic indicators to understand the broader backdrop for dealmaking this quarter.',
    phase: 0, category: 'market', status: 'available', cost: 1, work: 3, complexity: 'low',
    effectSummary: 'Generates macro insights, +2 momentum',
  },
  {
    id: 'task-gen-02', name: 'Research Market Momentum', description: 'Deep dive into sector-agnostic market momentum. Which sectors are seeing the highest multiples and buyer activity? Prepares the team to evaluate upcoming targets.',
    phase: 0, category: 'internal', status: 'recommended', cost: 2, work: 4, complexity: 'medium',
    effectSummary: 'Prepares team for execution, +5 momentum',
  },
  {
    id: 'task-gen-03', name: 'Review Active Buyer Universe', description: 'Update the internal database of active Private Equity sponsors and strategic buyers currently deploying capital. Establishes a baseline for future buyer outreach.',
    phase: 0, category: 'market', status: 'available', cost: 3, work: 5, complexity: 'medium',
    effectSummary: 'Improves future outreach quality, +3 reputation',
  }
];

const initialWorkstreams: Workstream[] = [
  { id: 'preparation', name: 'Origination & Qualification', progress: 0, quality: 50, active: true },
  { id: 'financials', name: 'Financials', progress: 0, quality: 50, active: false },
  { id: 'marketing_materials', name: 'Marketing Materials', progress: 0, quality: 50, active: false },
  { id: 'buyer_outreach', name: 'Buyer Outreach', progress: 0, quality: 50, active: false },
  { id: 'management', name: 'Management', progress: 0, quality: 50, active: false },
  { id: 'due_diligence', name: 'Due Diligence', progress: 0, quality: 50, active: false },
  { id: 'negotiation', name: 'Negotiation', progress: 0, quality: 50, active: false },
  { id: 'closing', name: 'Closing Readiness', progress: 0, quality: 50, active: false },
];

// No deliverables yet — origination produces assessments, not formal documents
const initialDeliverables: Deliverable[] = [];

const initialRisks: Risk[] = [
  {
    id: 'risk-1', name: 'Founder May Not Be Serious',
    description: 'Ricardo Mendes may be testing the market for a valuation number rather than genuinely committed to a sale process.',
    category: 'client', severity: 'medium', probability: 35, mitigated: false, surfacedWeek: 1, surfacedPhase: 0,
  },
];

const initialHeadlines: Headline[] = [
  { id: 'hl-1', week: 1, text: 'PE financing spreads tighten again across Europe.', category: 'macro' },
  { id: 'hl-2', week: 1, text: 'Industrial IoT consolidation accelerates — three deals closed in Q1.', category: 'sector' },
  { id: 'hl-3', week: 1, text: 'Mid-market advisory mandates surge as founders eye exit window.', category: 'sector' },
];

// ============================================
// Fee Negotiation Helpers
// ============================================

function deriveClientProfile(
  clientTrust: number,
  qualificationNotes: QualificationNote[]
): ClientNegotiationProfile {
  const sentimentScore = qualificationNotes.reduce((acc, n) => {
    if (n.sentiment === 'positive') return acc + 1;
    if (n.sentiment === 'negative') return acc - 1;
    return acc;
  }, 0);
  const positiveNotes = sentimentScore > 0;

  if (clientTrust > 60 && positiveNotes) return 'serious_reasonable';
  if (clientTrust > 60 && !positiveNotes) return 'serious_demanding';
  if (clientTrust >= 40 && positiveNotes) return 'unsure_optimistic';
  return 'unsure_reluctant';
}

function buildClientNegotiationState(
  profile: ClientNegotiationProfile,
  expectedEV: number
): ClientNegotiationState {
  const configs: Record<ClientNegotiationProfile, Omit<ClientNegotiationState, 'patienceRemaining' | 'lockedComponents' | 'revealedHints' | 'lockedRetainerType' | 'lockedRetainerAmount' | 'lockedSuccessFeePercent'>> = {
    serious_reasonable: {
      profile,
      reservationSuccessFeeMin: 1.5,
      reservationSuccessFeeMax: 3.5,
      reservationRetainerMin: 0,
      priorityRetainer: 3,
      prioritySuccessFee: 7,
      priorityRatchet: 3,
    },
    serious_demanding: {
      profile,
      reservationSuccessFeeMin: 1.0,
      reservationSuccessFeeMax: 2.5,
      reservationRetainerMin: 0,
      priorityRetainer: 2,
      prioritySuccessFee: 9,
      priorityRatchet: 5,
    },
    unsure_optimistic: {
      profile,
      reservationSuccessFeeMin: 0.5,
      // High EV expectation means they want low base % but high ratchet
      reservationSuccessFeeMax: expectedEV > 150 ? 2.0 : 5.0,
      reservationRetainerMin: 0,
      priorityRetainer: 4,
      prioritySuccessFee: 5,
      priorityRatchet: 9,
    },
    unsure_reluctant: {
      profile,
      reservationSuccessFeeMin: 0.5,
      reservationSuccessFeeMax: 1.5,
      reservationRetainerMin: 0,
      priorityRetainer: 8,
      prioritySuccessFee: 6,
      priorityRatchet: 1,
    },
  };
  const isRetainerAverse = profile === 'unsure_reluctant' || profile === 'unsure_optimistic';
  return {
    ...configs[profile],
    patienceRemaining: 100,
    lockedComponents: isRetainerAverse ? ['retainer'] : [],
    revealedHints: isRetainerAverse
      ? [profile === 'unsure_reluctant'
          ? "No upfront fees — our commitment hinges entirely on what we achieve at closing."
          : "We're not interested in a retainer structure. Performance alignment is what matters to us."]
      : [],
    lockedRetainerType: isRetainerAverse ? 'none' : undefined,
    lockedRetainerAmount: isRetainerAverse ? 0 : undefined,
  };
}

function resolveRetainerReaction(
  terms: Pick<NegotiationRound, 'playerRetainerType' | 'playerRetainerAmount'>,
  clientState: ClientNegotiationState
): ComponentReaction {
  if (terms.playerRetainerType === 'none') return 'green';
  // unsure_reluctant and serious_demanding resist all retainer
  if (
    clientState.profile === 'unsure_reluctant' ||
    clientState.profile === 'serious_demanding'
  ) return 'red';
  // Upfront is preferred over monthly (signals commitment)
  if (terms.playerRetainerType === 'upfront') {
    return terms.playerRetainerAmount <= 30 ? 'green' : 'yellow';
  }
  if (terms.playerRetainerType === 'per_phase') {
    return terms.playerRetainerAmount <= 7 ? 'green' : 'yellow';
  }
  // monthly — most friction
  if (clientState.profile === 'unsure_optimistic') return 'red';
  return terms.playerRetainerAmount <= 4 ? 'yellow' : 'red';
}

function resolveSuccessFeeReaction(
  percent: number,
  clientState: ClientNegotiationState
): ComponentReaction {
  if (percent < clientState.reservationSuccessFeeMin) return 'red'; // too low — client expects more signal
  if (percent > clientState.reservationSuccessFeeMax) return 'red'; // too high
  // Yellow zone: within 0.5% of ceiling
  if (percent > clientState.reservationSuccessFeeMax - 0.5) return 'yellow';
  return 'green';
}

function resolveRatchetReaction(
  terms: Pick<NegotiationRound, 'playerRatchetEnabled' | 'playerRatchetThresholdEV' | 'playerRatchetBonusPercent'>,
  clientState: ClientNegotiationState
): ComponentReaction {
  const { priorityRatchet, profile } = clientState;
  if (!terms.playerRatchetEnabled) {
    // If client really wants ratchet (unsure_optimistic), no ratchet = red
    if (profile === 'unsure_optimistic') return 'red';
    return priorityRatchet >= 7 ? 'yellow' : 'green';
  }
  // Ratchet present — evaluate threshold and bonus
  const bonus = terms.playerRatchetBonusPercent ?? 0;
  if (profile === 'unsure_optimistic') {
    // They want big upside — bonus < 8% is yellow, < 5% is red
    if (bonus < 5) return 'red';
    if (bonus < 8) return 'yellow';
    return 'green';
  }
  // Others: ratchet is a bonus, not a priority
  return 'green';
}

function computeSatisfactionScore(
  rRetainer: ComponentReaction,
  rSuccessFee: ComponentReaction,
  rRatchet: ComponentReaction,
  clientState: ClientNegotiationState
): number {
  const score = (r: ComponentReaction) => r === 'green' ? 10 : r === 'yellow' ? 5 : 0;
  const weighted =
    score(rRetainer) * clientState.priorityRetainer +
    score(rSuccessFee) * clientState.prioritySuccessFee +
    score(rRatchet) * clientState.priorityRatchet;
  const maxPossible = 10 * (clientState.priorityRetainer + clientState.prioritySuccessFee + clientState.priorityRatchet);
  return maxPossible > 0 ? (weighted / maxPossible) * 10 : 0;
}

function generateClientNote(
  profile: ClientNegotiationProfile,
  rRetainer: ComponentReaction,
  rSuccessFee: ComponentReaction,
  rRatchet: ComponentReaction,
  outcome: NegotiationRound['outcome']
): string {
  if (outcome === 'accepted') {
    const map: Record<ClientNegotiationProfile, string> = {
      serious_reasonable: "This feels fair. I'd like to sleep on it but I think we can make this work.",
      serious_demanding: "I'm not thrilled, but I understand your model. Let's move forward.",
      unsure_optimistic: "If we close at the right number, this works out well for both of us. I'm in.",
      unsure_reluctant: "Fine. But I want to make sure we revisit this if things change.",
    };
    return map[profile];
  }
  if (outcome === 'rejected') {
    if (rRetainer === 'red' && profile === 'unsure_reluctant') {
      return "Look, I told you — I'm not paying a retainer. That's a dealbreaker for me. Any retainer signals you're not committed to the outcome.";
    }
    if (rSuccessFee === 'red') {
      return "That success fee is simply not something I'm comfortable with given my valuation expectations. We're too far apart.";
    }
    if (rRatchet === 'red' && profile === 'unsure_optimistic') {
      return "If I'm going to pay for a great outcome, I want you truly aligned with that upside. A 3% ratchet above my target isn't enough skin in the game.";
    }
    return "I'm afraid we're not aligned on the fee structure. I need to think carefully about whether this relationship makes sense.";
  }
  // Counter
  const notes: string[] = [];
  if (rRetainer === 'red') {
    const retainerNotes: Record<ClientNegotiationProfile, string> = {
      serious_reasonable: 'I\'d prefer no monthly retainer — maybe an upfront payment instead if you need commitment.',
      serious_demanding: 'I\'m not paying a retainer. I want you motivated purely by outcome.',
      unsure_optimistic: 'A monthly retainer tells me you don\'t believe in this deal. I\'m not interested in that structure.',
      unsure_reluctant: 'No retainer. Full stop.',
    };
    notes.push(retainerNotes[profile]);
  } else if (rRetainer === 'yellow') {
    notes.push('The retainer is a stretch, but I could live with it if the other terms improve.');
  }
  if (rSuccessFee === 'red') {
    notes.push(`That success fee percentage doesn\'t work for me. I\'d need to see something closer to ${profile === 'serious_demanding' ? '1.5%' : '2%'}.`);
  } else if (rSuccessFee === 'yellow') {
    notes.push('The fee is a bit rich, but I understand your rationale. What can you give me on the other terms?');
  }
  if (rRatchet === 'red' && profile === 'unsure_optimistic') {
    notes.push('The ratchet is too conservative. If we close above my target, I want you properly incentivised to push for that.');
  }
  return notes.join(' ') || 'Let me think about this. Come back with something that works better for both of us.';
}

// ============================================
// Store Actions
// ============================================

const initialLeads: Lead[] = [
  {
    id: 'lead-1',
    companyName: 'Solara Systems',
    sector: 'Industrial SaaS / Energy Tech',
    founderName: 'Ricardo Mendes',
    origin: 'Inbound network referral',
    description: 'Founder-led industrial IoT platform specialising in predictive maintenance for energy infrastructure. €28M ARR, growing 35% YoY. The founder is considering a full exit after 12 years.',
    investmentCaseSummary: 'Strong SaaS metrics and clear strategic value to industrial buyers. High likelihood of aggressive bidding if properly positioned.',
    investigation: { sector: 'none', company: 'none', shareholder: 'none', market: 'none' },
    meetingDone: false,
    hiddenMotivations: 'Wife is pressuring him to retire; he is burned out but won\'t admit it easily.',
    hiddenGrowth: 'high',
    hiddenRisk: 'low',
    researchNotes: []
  },
  {
    id: 'lead-2',
    companyName: 'Zephyr Logistics',
    sector: 'Supply Chain Tech',
    founderName: 'Amina Al-Fayed',
    origin: 'Outbound origination campaign',
    description: 'Asset-light freight forwarding platform using AI for route optimisation. €45M GMV. Margins are tight but volume is scaling fast.',
    investmentCaseSummary: 'A scale play. Potential for margin expansion under the umbrella of a larger logistics incumbent.',
    investigation: { sector: 'none', company: 'none', shareholder: 'none', market: 'none' },
    meetingDone: false,
    hiddenMotivations: 'Needs a large cash injection to survive price war with competitors.',
    hiddenGrowth: 'moderate',
    hiddenRisk: 'high',
    researchNotes: []
  },
  {
    id: 'lead-3',
    companyName: 'Nexus BioPharma',
    sector: 'Healthcare / Biotech',
    founderName: 'Dr. Elias Vance',
    origin: 'Conference meeting',
    description: 'Contract Research Organisation (CRO) specializing in rare disease trials. Highly profitable, €15M EBITDA, but reliant on 3 key clients.',
    investmentCaseSummary: 'Cash cow with high customer concentration risk. Excellent target for PE roll-up strategies.',
    investigation: { sector: 'none', company: 'none', shareholder: 'none', market: 'none' },
    meetingDone: false,
    hiddenMotivations: 'Wants to cash out and return to pure academic research.',
    hiddenGrowth: 'low',
    hiddenRisk: 'moderate',
    researchNotes: []
  }
];

export interface GameStore {
  phase: PhaseId;
  day: number;
  totalDays: number;
  week: number;
  
  // Phase 0 Mechanics
  leads: Lead[];
  activeLeadId?: string;

  resources: PlayerResources;
  client: Client;
  team: TeamMember[];
  emails: Email[];
  buyers: Buyer[];
  tasks: GameTask[];
  workstreams: Workstream[];
  deliverables: Deliverable[];
  risks: Risk[];
  events: GameEvent[];
  headlines: Headline[];
  weekSummary: string | null;
  weekHistory: { day: number; week: number; daysAdvanced: number; summary: string; phase: PhaseId; }[];
  isWeekInProgress: boolean;
  playerName: string;
  savedAt: string | null;
  hasSeenOnboarding: boolean;
  gameComplete: boolean;
  collapseReason: string | null;
  collapseHeadline: string | null;
  collapseDescription: string | null;
  lastWeekResult: WeekResult | null;
  phaseGate: PhaseGateResult | null;
  // New systems
  totalBudgetSpent: number;
  phaseBudget: { phaseBase: number; carryover: number };
  budgetRequests: BudgetRequest[];
  qualificationNotes: QualificationNote[];
  boardSubmission: BoardSubmission | null;
  tempCapacityAllocations: TempCapacityAllocation[];
  feeNegotiation: FeeNegotiation | null;
  agreedFeeTerms: FeeTerms | null;
  competitorThreats: CompetitorThreat[];
  toasts: Toast[];
  finalOffers: FinalOffer[];
  preferredBidderId: string | null;
  spaNegotiation: SPANegotiation | null;
  agreedSPATerms: SPATerms | null;
  dataroomCategories: DataroomCategory[];
  phaseDeadline: number | null; // calendar day when phase 3/4/6 deadline expires
  pitchDocumentReady: boolean;  // unlocked when pitch document task completes
  bindingOffersReceived: number; // count of buyers who submitted binding offer before Phase 6 deadline
  unaddressedQACount: number;   // counter incremented by DD Q&A events; reduced by Q&A response task

  // GameActions
  advanceWeek: () => void;
  advancePhase: () => Promise<void>;
  updateResources: (partial: Partial<PlayerResources>) => void;
  markEmailRead: (emailId: string) => void;
  flagEmail: (emailId: string) => void;
  escalateEmail: (emailId: string) => void;
  respondToEmail: (emailId: string, responseId: string) => void;
  startTask: (taskId: string) => void;
  completeTask: (taskId: string) => void;
  mitigateRisk: (riskId: string) => void;
  executeRiskMitigationPlan: (riskId: string, planId: string) => void;
  setPlayerName: (name: string) => void;
  markOnboardingSeen: () => void;
  saveGame: () => void;
  completeGame: () => void;
  dismissWeekSummary: () => void;
  // Budget
  requestBudget: (amount: number, justification: string) => void;
  resolveBudgetRequest: (id: string, approved: boolean, approvedAmount?: number) => void;
  // Phase 0 Qualification
  investigateDimension: (leadId: string, dimension: keyof NonNullable<Lead['investigation']>) => void;
  scheduleMeeting: (leadId: string) => void;
  addQualificationNote: (note: Omit<QualificationNote, 'id'>) => void;
  submitBoardRecommendation: (recommendation: BoardSubmission['recommendation'], rationale: string, leadId?: string) => void;
  // Staffing
  hireStaffer: (profile: StaffProfile) => void;
  allocateTempCapacity: (taskId: string, profile: ContractorProfile) => void;
  releaseTempCapacity: (allocationId: string) => void;
  // Fee negotiation
  presentPitch: () => void;
  startFeeNegotiation: () => void;
  submitFeeRound: (terms: Pick<NegotiationRound, 'playerRetainerType' | 'playerRetainerAmount' | 'playerSuccessFeePercent' | 'playerRatchetEnabled' | 'playerRatchetThresholdEV' | 'playerRatchetBonusPercent'>) => void;
  acceptFeeTerms: () => void;
  // Competitor
  executeMitigationAction: (threatId: string, action: MitigationActionId) => void;
  // Toasts
  addToast: (message: string, type: Toast['type']) => void;
  removeToast: (id: string) => void;
  // Deadline
  setPhaseDeadline: (weeks: number) => void;
  // Final Offers
  selectPreferredBidder: (buyerId: string) => void;
  // Dataroom
  setDataroomAccess: (categoryId: string, level: DataroomAccessLevel) => void;
  // SPA
  initSPANegotiation: () => void;
  submitSPARound: (terms: Pick<SPARound, 'playerWarrantyScope' | 'playerWarrantyCap' | 'playerEscrowPercent' | 'playerSpecificIndemnity'>) => void;
  acceptSPATerms: () => void;
}

// ============================================
// Helper: sync deliverable status from linked tasks
// ============================================
function syncDeliverables(deliverables: Deliverable[], tasks: GameTask[]): Deliverable[] {
  return deliverables.map((del) => {
    const linkedTask = tasks.find((t) => t.linkedDeliverableId === del.id);
    if (!linkedTask) return del;

    if (linkedTask.status === 'completed') {
      return { ...del, status: 'approved' as const, completion: 100, quality: 'good' as const };
    }
    if (linkedTask.status === 'in_progress') {
      return { ...del, status: 'drafting' as const, completion: Math.max(del.completion, 30) };
    }
    return del;
  });
}

// ============================================
// Helper: sync team workload from in-progress tasks
// ============================================
function syncTeamLoad(team: TeamMember[], tasks: GameTask[]): TeamMember[] {
  const inProgress = tasks.filter((t) => t.status === 'in_progress');
  const totalWork = inProgress.reduce((sum, t) => sum + t.work, 0);

  // Distribute work across team proportionally by seniority
  return team.map((m) => {
    const weight = m.seniority === 'senior' ? 0.4 : m.seniority === 'mid' ? 0.35 : 0.25;
    const load = Math.min(100, Math.round(totalWork * weight));
    return { ...m, currentLoad: load };
  });
}

// ============================================
// Helper: sync client trust/confidence from resources
// ============================================
function syncClient(client: Client, resources: PlayerResources): Client {
  return {
    ...client,
    trust: resources.clientTrust,
    confidence: Math.min(100, Math.round(resources.clientTrust * 0.8 + resources.dealMomentum * 0.2)),
  };
}

function normalizeResources(resources: PlayerResources): PlayerResources {
  return {
    ...resources,
    budget: Math.max(0, round2(resources.budget)),
    budgetMax: Math.max(0, round2(resources.budgetMax)),
    teamCapacity: Math.max(0, Math.min(resources.teamCapacityMax, round2(resources.teamCapacity))),
    teamCapacityMax: Math.max(0, round2(resources.teamCapacityMax)),
    morale: Math.max(0, Math.min(100, round2(resources.morale))),
    clientTrust: Math.max(0, Math.min(100, round2(resources.clientTrust))),
    dealMomentum: Math.max(0, Math.min(100, round2(resources.dealMomentum))),
    riskLevel: Math.max(0, Math.min(100, round2(resources.riskLevel))),
    reputation: Math.max(0, Math.min(100, round2(resources.reputation))),
  };
}

// ============================================
// Helper: generate Final Offers for Phase 7
// ============================================
function generateFinalOffers(buyers: import('../types/game').Buyer[], momentum: number, week: number): FinalOffer[] {
  const BASE_EV = 120; // €M Solara baseline
  const offers: FinalOffer[] = [];

  for (const buyer of buyers) {
    if (['dropped', 'excluded'].includes(buyer.status)) continue;

    // EV range based on valuation posture
    const postureMultiplier =
      buyer.valuationPosture === 'aggressive' ? 1.12 :
      buyer.valuationPosture === 'fair' ? 1.02 : 0.93;

    // Momentum adds up to ±10%
    const momentumMod = (momentum - 50) / 500; // ±10% at extremes
    const rawEV = BASE_EV * postureMultiplier * (1 + momentumMod);

    // Structure based on buyer type
    const structure: FinalOffer['structure'] =
      buyer.type === 'pe' ? (Math.random() > 0.5 ? 'mixed' : 'earnout_heavy') :
      buyer.type === 'strategic' ? (Math.random() > 0.4 ? 'full_cash' : 'mixed') :
      'full_cash';

    // Earnout based on structure
    const earnoutPct = structure === 'full_cash' ? 0 : structure === 'mixed' ? 0.15 + Math.random() * 0.1 : 0.3 + Math.random() * 0.15;
    const earnoutAmount = Math.round(rawEV * earnoutPct * 10) / 10;
    const cashEV = Math.round((rawEV - earnoutAmount) * 10) / 10;
    const totalEV = Math.round((cashEV + earnoutAmount) * 10) / 10;

    // Conditionality based on DD friction
    const conditionality: FinalOffer['conditionality'] =
      buyer.ddFriction === 'high' ? 'heavy_conditions' :
      buyer.ddFriction === 'medium' ? 'light_conditions' : 'clean';

    // Earnout conditions text
    const earnoutConditions = earnoutAmount > 0
      ? `€${earnoutAmount}M payable if revenue exceeds €35M in Year 2 post-close`
      : 'None';

    // Advisor note
    const note = buyer.executionCredibility >= 75
      ? `Strong execution track record. Offer is ${structure === 'full_cash' ? 'clean and fully funded' : 'mixed but credible'}.`
      : buyer.executionCredibility >= 50
        ? `Reasonable execution profile. ${earnoutAmount > 0 ? 'Earnout adds risk — verify covenants.' : 'Monitor closing conditions.'}`
        : `Execution risk is elevated. ${conditionality === 'heavy_conditions' ? 'Heavy conditions — recommend close scrutiny.' : 'Proceed with caution.'}`;

    offers.push({
      buyerId: buyer.id,
      submittedPhase: 7,
      submittedWeek: week,
      cashEV,
      earnoutAmount,
      earnoutConditions,
      totalEV,
      structure,
      conditionality,
      exclusivityRequested: buyer.type === 'pe' || buyer.valuationPosture === 'aggressive',
      impliedMultiple: Math.round((totalEV / 12) * 10) / 10, // assume ~€12M EBITDA
      advisorNote: note,
    });
  }

  // Sort by totalEV descending
  return offers.sort((a, b) => b.totalEV - a.totalEV);
}

// ============================================
// Helper: generate SPA buyer state
// ============================================
function generateSPABuyerState(buyer: import('../types/game').Buyer): SPABuyerState {
  const profile =
    buyer.type === 'pe' ? 'aggressive_buyer' :
    buyer.type === 'strategic' ? 'reasonable_buyer' : 'conservative_buyer';

  const base = {
    aggressive_buyer:  { cap: 35, escrow: 10, ps: 8, pc: 9, pe: 7, pi: 8 },
    reasonable_buyer:  { cap: 22, escrow: 6,  ps: 5, pc: 7, pe: 5, pi: 5 },
    conservative_buyer:{ cap: 15, escrow: 4,  ps: 3, pc: 5, pe: 4, pi: 3 },
  }[profile];

  // Small random variation
  const jitter = (n: number, range: number) => Math.round(n + (Math.random() * range * 2 - range));

  return {
    profile,
    reservationWarrantyCap: jitter(base.cap, 5),
    reservationEscrowPercent: jitter(base.escrow, 2),
    priorityScope: base.ps,
    priorityCap: base.pc,
    priorityEscrow: base.pe,
    priorityIndemnity: base.pi,
    patienceRemaining: 100,
    lockedComponents: [],
    revealedHints: [],
  };
}

// ============================================
// Helper: progressive component locking — Fee
// ============================================
type FeeComponent = 'retainer' | 'successFee' | 'ratchet';
type SPAComponent = 'scope' | 'cap' | 'escrow' | 'indemnity';

const FEE_LOCK_ORDER: Record<ClientNegotiationProfile, FeeComponent[]> = {
  serious_demanding:  ['successFee', 'retainer', 'ratchet'],
  unsure_optimistic:  ['ratchet', 'successFee', 'retainer'],
  unsure_reluctant:   ['successFee', 'ratchet', 'retainer'],
  serious_reasonable: ['successFee', 'ratchet', 'retainer'],
};

const FEE_LOCK_HINTS: Record<string, string> = {
  'serious_demanding/successFee->retainer':  "Good — the success fee is settled. Now let's find a retainer structure that works.",
  'serious_demanding/retainer->ratchet':     "Retainer agreed. The performance ratchet is the final piece.",
  'unsure_optimistic/ratchet->successFee':   "Ratchet aligned — now let's agree a base fee that reflects our shared upside.",
  'unsure_optimistic/successFee->retainer':  "Base fee settled. As discussed, no retainer — we pay on results.",
  'unsure_reluctant/successFee->ratchet':    "Success fee agreed. Whether a ratchet makes sense depends on your deal conviction.",
  'unsure_reluctant/ratchet->retainer':      "Ratchet is off the table. The retainer remains a firm no from us.",
  'serious_reasonable/successFee->ratchet':  "Success fee looks fair. A modest ratchet above the target EV would be welcome.",
  'serious_reasonable/ratchet->retainer':    "Ratchet agreed. On retainer — we'd prefer upfront if you need a commitment signal.",
};

const FEE_REACTION_HINTS: Record<string, Record<ComponentReaction, string>> = {
  successFee: {
    yellow: "The success fee is borderline — try coming down 0.5% and we might be there.",
    red:    "That fee level is too high. A meaningful reduction is needed before we can move forward.",
    green:  '',
  },
  retainer: {
    yellow: "The retainer is acceptable in principle, but the amount feels steep.",
    red:    "We're not comfortable with this retainer structure. Reconsider the type or amount.",
    green:  '',
  },
  ratchet: {
    yellow: "The ratchet bonus is in range, but we'd want it higher above the target EV.",
    red:    "The ratchet structure needs a meaningful increase in the upside bonus.",
    green:  '',
  },
};

function applyFeeProgressiveLocking(
  clientState: ClientNegotiationState,
  terms: Pick<NegotiationRound, 'playerRetainerType' | 'playerRetainerAmount' | 'playerSuccessFeePercent'>,
  reactions: { retainer: ComponentReaction; successFee: ComponentReaction; ratchet: ComponentReaction }
): Partial<ClientNegotiationState> {
  const order = FEE_LOCK_ORDER[clientState.profile];
  const newLocked = [...clientState.lockedComponents];
  const newHints = [...clientState.revealedHints];
  const updates: Partial<ClientNegotiationState> = {};

  const nextToLock = order.find(c => !newLocked.includes(c));
  if (!nextToLock) return {};

  if (reactions[nextToLock] === 'green') {
    newLocked.push(nextToLock);
    if (nextToLock === 'retainer') {
      updates.lockedRetainerType = terms.playerRetainerType;
      updates.lockedRetainerAmount = terms.playerRetainerAmount;
    } else if (nextToLock === 'successFee') {
      updates.lockedSuccessFeePercent = terms.playerSuccessFeePercent;
    }
    const remaining = order.filter(c => !newLocked.includes(c));
    if (remaining.length > 0) {
      const key = `${clientState.profile}/${nextToLock}->${remaining[0]}`;
      if (FEE_LOCK_HINTS[key]) newHints.push(FEE_LOCK_HINTS[key]);
    }
  } else {
    const hint = FEE_REACTION_HINTS[nextToLock]?.[reactions[nextToLock]];
    if (hint && !newHints.includes(hint)) newHints.push(hint);
  }

  return { ...updates, lockedComponents: newLocked, revealedHints: newHints };
}

// ============================================
// Helper: progressive component locking — SPA
// ============================================
const SPA_LOCK_ORDER: Record<SPABuyerProfile, SPAComponent[]> = {
  aggressive_buyer:   ['indemnity', 'escrow', 'cap', 'scope'],
  reasonable_buyer:   ['indemnity', 'scope', 'escrow', 'cap'],
  conservative_buyer: ['scope', 'indemnity', 'escrow', 'cap'],
};

const SPA_LOCK_HINTS: Record<string, string> = {
  'aggressive_buyer/indemnity->escrow':   "Indemnity agreed. Now let's align on escrow — retention protection is critical for us.",
  'aggressive_buyer/escrow->cap':         "Escrow locked. The warranty cap is the main remaining point — we need strong coverage.",
  'aggressive_buyer/cap->scope':          "Cap agreed. Fundamental warranty scope is the last piece for a PE buyer.",
  'reasonable_buyer/indemnity->scope':    "Indemnity settled. Warranty scope is important — standard is the minimum we'd accept.",
  'reasonable_buyer/scope->escrow':       "Scope agreed. Let's finalise the escrow — we need some comfort on the retention.",
  'reasonable_buyer/escrow->cap':         "Escrow locked. A fair cap protects both sides — let's find common ground.",
  'conservative_buyer/scope->indemnity':  "Scope is fine. The indemnity is a smaller point — we appreciate the flexibility here.",
  'conservative_buyer/indemnity->escrow': "Indemnity settled. Let's resolve the escrow percentage.",
  'conservative_buyer/escrow->cap':       "Escrow agreed. The cap is where we need to land now.",
};

const SPA_REACTION_HINTS: Record<string, Record<ComponentReaction, string>> = {
  scope:     { yellow: "Warranty scope is borderline — standard is the minimum we'd accept.", red: "Limited scope is a problem for us. We need proper rep coverage.", green: '' },
  cap:       { yellow: "The cap is low. Bring it up and we're closer to a deal.", red: "That cap level isn't acceptable. We need meaningfully more protection.", green: '' },
  escrow:    { yellow: "The escrow is slightly below our expectation. A small increase would help.", red: "We need a more substantial escrow to feel protected post-close.", green: '' },
  indemnity: { yellow: "The indemnity ask is reasonable — consider agreeing as a gesture of good faith.", red: "The specific indemnity is important to us on the identified exposure.", green: '' },
};

function applySPAProgressiveLocking(
  buyerState: SPABuyerState,
  terms: Pick<SPARound, 'playerWarrantyScope' | 'playerWarrantyCap' | 'playerEscrowPercent'>,
  reactions: { scope: ComponentReaction; cap: ComponentReaction; escrow: ComponentReaction; indemnity: ComponentReaction }
): Partial<SPABuyerState> {
  const order = SPA_LOCK_ORDER[buyerState.profile];
  const newLocked = [...buyerState.lockedComponents];
  const newHints = [...buyerState.revealedHints];
  const updates: Partial<SPABuyerState> = {};

  const nextToLock = order.find(c => !newLocked.includes(c));
  if (!nextToLock) return {};

  if (reactions[nextToLock] === 'green') {
    newLocked.push(nextToLock);
    if (nextToLock === 'scope') updates.lockedWarrantyScope = terms.playerWarrantyScope;
    else if (nextToLock === 'cap') updates.lockedWarrantyCap = terms.playerWarrantyCap;
    else if (nextToLock === 'escrow') updates.lockedEscrowPercent = terms.playerEscrowPercent;
    const remaining = order.filter(c => !newLocked.includes(c));
    if (remaining.length > 0) {
      const key = `${buyerState.profile}/${nextToLock}->${remaining[0]}`;
      if (SPA_LOCK_HINTS[key]) newHints.push(SPA_LOCK_HINTS[key]);
    }
  } else {
    const hint = SPA_REACTION_HINTS[nextToLock]?.[reactions[nextToLock]];
    if (hint && !newHints.includes(hint)) newHints.push(hint);
  }

  return { ...updates, lockedComponents: newLocked, revealedHints: newHints };
}

// ============================================
// Helper: evaluate SPA round reactions
// ============================================
function evaluateSPARound(
  terms: Pick<SPARound, 'playerWarrantyScope' | 'playerWarrantyCap' | 'playerEscrowPercent' | 'playerSpecificIndemnity'>,
  buyerState: SPABuyerState,
  round: number,
  _resources: import('../types/game').PlayerResources
): Omit<SPARound, 'round' | 'playerWarrantyScope' | 'playerWarrantyCap' | 'playerEscrowPercent' | 'playerSpecificIndemnity'> {

  // Scope reaction
  const reactionScope: import('../types/game').ComponentReaction =
    terms.playerWarrantyScope === 'fundamental' ? 'green' :
    terms.playerWarrantyScope === 'standard' ?
      (buyerState.profile === 'aggressive_buyer' ? 'yellow' : 'green') :
    // limited
    buyerState.profile === 'aggressive_buyer' ? 'red' :
    buyerState.profile === 'reasonable_buyer' ? 'yellow' : 'green';

  // Cap reaction
  const capGap = buyerState.reservationWarrantyCap - terms.playerWarrantyCap;
  const reactionCap: import('../types/game').ComponentReaction =
    capGap <= 0 ? 'green' :
    capGap <= 8 ? 'yellow' : 'red';

  // Escrow reaction
  const escrowGap = buyerState.reservationEscrowPercent - terms.playerEscrowPercent;
  const reactionEscrow: import('../types/game').ComponentReaction =
    escrowGap <= 0 ? 'green' :
    escrowGap <= 3 ? 'yellow' : 'red';

  // Indemnity reaction
  const reactionIndemnity: import('../types/game').ComponentReaction =
    terms.playerSpecificIndemnity ? 'green' :
    buyerState.priorityIndemnity >= 7 ? 'red' :
    buyerState.priorityIndemnity >= 4 ? 'yellow' : 'green';

  // Overall outcome
  const reds = [reactionScope, reactionCap, reactionEscrow, reactionIndemnity].filter((r) => r === 'red').length;
  const yellows = [reactionScope, reactionCap, reactionEscrow, reactionIndemnity].filter((r) => r === 'yellow').length;

  const patience = buyerState.patienceRemaining;
  let outcome: SPARound['outcome'] =
    reds === 0 && yellows <= 1 ? 'accepted' :
    reds >= 2 || patience < 20 ? 'rejected' : 'counter';

  // Force rejection on last round if not all green/yellow
  if (round >= 3 && reds >= 1) outcome = 'rejected';

  // Generate buyer note
  const notes: string[] = [];
  if (reactionScope === 'red') notes.push("Limited warranty scope is not acceptable — we need proper protection on fundamental reps.");
  else if (reactionScope === 'yellow') notes.push("We'd prefer broader warranty coverage, but we can work with this.");
  if (reactionCap === 'red') notes.push(`A ${terms.playerWarrantyCap}% cap is too low given deal complexity — our investment committee needs at least ${buyerState.reservationWarrantyCap}%.`);
  else if (reactionCap === 'yellow') notes.push("The cap is lower than we'd like, but we're not walking away over this.");
  if (reactionEscrow === 'red') notes.push(`Escrow of ${terms.playerEscrowPercent}% doesn't give us sufficient security — we need at least ${buyerState.reservationEscrowPercent}%.`);
  if (reactionIndemnity === 'red') notes.push("We need a specific indemnity for the identified risk — no indemnity, no deal.");
  if (notes.length === 0) {
    notes.push(outcome === 'accepted'
      ? "These terms are workable. We can instruct our lawyers to proceed."
      : "We see movement in the right direction. Let's get this across the line.");
  }

  return {
    reactionScope,
    reactionCap,
    reactionEscrow,
    reactionIndemnity,
    buyerNote: notes[0],
    outcome,
  };
}

export const useGameStore = create<GameStore>()(persist((set, get) => ({
  // State
  phase: 0 as PhaseId,
  day: 1,
  week: 1,
  totalDays: 1,
  leads: initialLeads,
  activeLeadId: undefined,
  resources: initialResources,
  client: initialClient,
  team: initialTeam,
  emails: initialEmails,
  buyers: [],
  tasks: initialTasks,
  workstreams: initialWorkstreams,
  deliverables: initialDeliverables,
  risks: initialRisks,
  events: [],
  headlines: initialHeadlines,
  weekSummary: null,
  weekHistory: [],
  isWeekInProgress: false,
  playerName: '',
  savedAt: null,
  hasSeenOnboarding: false,
  gameComplete: false,
  collapseReason: null,
  collapseHeadline: null,
  collapseDescription: null,
  lastWeekResult: null,
  phaseGate: null,
  // New systems
  totalBudgetSpent: 0,
  phaseBudget: { phaseBase: PHASE_BASE_BUDGETS[0], carryover: 0 },
  budgetRequests: [],
  qualificationNotes: [],
  boardSubmission: null,
  tempCapacityAllocations: [],
  feeNegotiation: null,
  agreedFeeTerms: null,
  competitorThreats: [],
  toasts: [],
  finalOffers: [],
  preferredBidderId: null,
  spaNegotiation: null,
  agreedSPATerms: null,
  dataroomCategories: [
    { id: 'dr-financials', name: 'Financial Statements', description: 'P&L, balance sheet, cash flow, management accounts, ARR breakdown.', sensitivity: 'low', accessLevel: 'partial' },
    { id: 'dr-customers', name: 'Customer Contracts', description: 'Key account agreements, MSAs, concentration analysis, churn data.', sensitivity: 'high', accessLevel: 'restricted' },
    { id: 'dr-technology', name: 'Technology & IP', description: 'Platform architecture, source code summary, patent filings, technical debt audit.', sensitivity: 'critical', accessLevel: 'restricted' },
    { id: 'dr-employees', name: 'Employee & HR Data', description: 'Org chart, key employee contracts, comp structure, retention agreements.', sensitivity: 'high', accessLevel: 'restricted' },
    { id: 'dr-legal', name: 'Legal & Litigation', description: 'Corporate documents, material contracts, pending litigation, IP disputes.', sensitivity: 'medium', accessLevel: 'partial' },
    { id: 'dr-regulatory', name: 'Regulatory & Compliance', description: 'Industry certifications, regulatory filings, GDPR/data handling policies.', sensitivity: 'medium', accessLevel: 'partial' },
    { id: 'dr-commercial', name: 'Commercial Pipeline', description: 'Sales pipeline, win/loss data, go-to-market strategy, pricing model.', sensitivity: 'high', accessLevel: 'restricted' },
    { id: 'dr-operations', name: 'Operational KPIs', description: 'Product uptime, support metrics, deployment architecture, SLA performance.', sensitivity: 'low', accessLevel: 'full' },
  ] as DataroomCategory[],
  phaseDeadline: null,
  pitchDocumentReady: false,
  bindingOffersReceived: 0,
  unaddressedQACount: 0,

  // Actions
  advanceWeek: () => {
    const state = get();

    // Determine how many days to advance before the next meaningful event
    const daysToAdvance = calcDaysToAdvance(state);

    // Run the week engine for the calculated number of days
    const result = resolveWeek(state, daysToAdvance);

    // Apply task status changes
    const updatedTasks = state.tasks.map((t) => {
      if (result.tasksCompleted.find((c) => c.id === t.id)) {
        return { ...t, status: 'completed' as const };
      }
      return t;
    });

    if (result.newTasks && result.newTasks.length > 0) {
      updatedTasks.push(...result.newTasks);
    }

    // Unlock tasks whose dependencies are now met
    const unlockedTasks = unlockTasks(updatedTasks);

    // Apply resource changes
    const newResources = { ...state.resources };
    for (const [key, value] of Object.entries(result.resourceChanges)) {
      if (value !== undefined) {
        (newResources as unknown as Record<string, number>)[key] = value as number;
      }
    }

    // Update workstream progress based on completed tasks
    const updatedWorkstreams = state.workstreams.map((ws) => {
      if (!ws.active) return ws;
      // Find tasks linked to this workstream, or all phase tasks for 'preparation'
      const wsTasks = unlockedTasks.filter((t) =>
        t.workstreamId === ws.id || (ws.id === 'preparation' && t.phase === state.phase && !t.workstreamId)
      );
      if (wsTasks.length === 0) return ws;
      const completed = wsTasks.filter((t) => t.status === 'completed').length;
      return { ...ws, progress: Math.round((completed / wsTasks.length) * 100) };
    });

    // Apply buyer progression from engine
    const updatedBuyers = result._updatedBuyers.length > 0 ? result._updatedBuyers : state.buyers;

    // Add new risks, emails, headlines from engine
    const newRisks = [...state.risks, ...result.newRisks];
    const newEmails = [...state.emails, ...result.newEmails];
    const newHeadlines = [...state.headlines, ...result.newHeadlines];
    const newEvents = [...state.events, ...result.newEvents];

    // Create competitor threats from competing advisor events
    const newCompetitorThreats = [...state.competitorThreats];
    for (const event of result.newEvents) {
      if (event.title?.includes('Competing Advisor')) {
        const advisorName = event.description?.includes('firm') ? 'Competing Advisory Firm' : 'Rival Advisor';
        newCompetitorThreats.push({
          id: `threat-${event.id}`,
          advisorName,
          surfacedWeek: event.week,
          usedActions: [],
          resolved: false,
        });
      }
    }

    // Auto-generate qualification notes when key Phase 0 tasks complete
    const completedTaskIds = new Set(result.tasksCompleted.map((t) => t.id));
    const newQualNotes = [...state.qualificationNotes];
    const newDay = state.day + daysToAdvance;
    const newWeekNum = Math.ceil(newDay / 7);
    if (state.phase === 0) {
      // General macro tasks
      if (completedTaskIds.has('task-gen-02') && !newQualNotes.some((n) => n.content.includes('Market momentum'))) {
        newQualNotes.push({
          id: `qn-${Date.now()}-gen02`,
          week: newWeekNum,
          source: 'team_research',
          content: 'Market momentum research complete. Elevated M&A activity in tech-enabled services and SaaS. Multiples healthy at 8-14x EBITDA for quality assets.',
          sentiment: 'positive',
        });
      }
      // Target-specific investigation tasks
      for (const lead of state.leads) {
        const companyTaskId = `task-investigate-${lead.id}-company`;
        const shareholderTaskId = `task-investigate-${lead.id}-shareholder`;
        if (completedTaskIds.has(companyTaskId) && !newQualNotes.some((n) => n.content.includes(lead.companyName) && n.source === 'team_research')) {
          newQualNotes.push({
            id: `qn-${Date.now()}-${lead.id}-company`,
            week: newWeekNum,
            source: 'team_research',
            content: `Company screening complete for ${lead.companyName}. Financial profile and sector fit confirmed. Viable profile for a structured process.`,
            sentiment: 'positive',
          });
        }
        if (completedTaskIds.has(shareholderTaskId) && !newQualNotes.some((n) => n.content.includes(lead.companyName) && n.source === 'meeting')) {
          newQualNotes.push({
            id: `qn-${Date.now()}-${lead.id}-shareholder`,
            week: newWeekNum,
            source: 'meeting',
            content: `Shareholder assessment complete for ${lead.companyName}. Founder appears motivated, timeline realistic, and valuation expectations within market range.`,
            sentiment: 'neutral',
          });
        }
      }
    }

    // Auto-release temp capacity allocations for tasks that completed this week
    const releasedAllocations = state.tempCapacityAllocations.filter(
      (alloc) => completedTaskIds.has(alloc.taskId)
    );
    const updatedTempAllocations = state.tempCapacityAllocations.filter(
      (alloc) => !completedTaskIds.has(alloc.taskId)
    );

    // Apply resolved board submission (for accurate phase gate check this week)
    const resolvedBoardSub = result.resolvedBoardSubmission
      ? {
          ...state.boardSubmission!,
          status: result.resolvedBoardSubmission.approved ? 'approved' as const : 'rejected' as const,
          boardNotes: result.resolvedBoardSubmission.notes,
        }
      : state.boardSubmission;

    // Check phase gate (with resolved board submission so gate reflects this week's board decision)
    const nextState = {
      ...state,
      week: newWeekNum,
      tasks: unlockedTasks,
      resources: newResources,
      buyers: updatedBuyers,
      boardSubmission: resolvedBoardSub,
      qualificationNotes: newQualNotes,
    } as GameStore;
    const gate = checkPhaseGate(nextState);

    // Phase 10 gate met = game complete (success)
    const isGameComplete = state.phase === 10 && gate.canTransition;

    // Check for deal collapse (failure)
    const collapse = checkDealCollapse(nextState);

    // Generate release emails for freed contractors
    for (const freed of releasedAllocations) {
      newEmails.push({
        id: `email-contractor-released-${freed.id}`,
        week: newWeekNum,
        phase: state.phase,
        sender: 'James Wu',
        senderRole: 'Associate',
        subject: 'Contractor engagement concluded',
        body: `The contractor engagement for task completion has been wrapped up. The ${freed.profile.replace(/_/g, ' ')} has been released as the linked task is now complete.`,
        preview: 'Contractor engagement concluded...',
        category: 'internal',
        state: 'unread',
        priority: 'low',
        timestamp: `Week ${newWeekNum}, Monday`,
      });
    }

    const normalizedResources = normalizeResources(newResources);

    set({
      day: newDay,
      week: newWeekNum,
      totalDays: state.totalDays + daysToAdvance,
      resources: normalizedResources,
      tasks: unlockedTasks,
      workstreams: updatedWorkstreams,
      deliverables: syncDeliverables(state.deliverables, unlockedTasks),
      team: syncTeamLoad(state.team, unlockedTasks),
      client: syncClient(state.client, normalizedResources),
      risks: newRisks,
      emails: newEmails,
      headlines: newHeadlines,
      buyers: updatedBuyers,
      events: newEvents,
      competitorThreats: newCompetitorThreats,
      qualificationNotes: newQualNotes,
      tempCapacityAllocations: updatedTempAllocations,
      boardSubmission: resolvedBoardSub,
      budgetRequests: state.budgetRequests.map((req) => {
        const resolved = result.resolvedBudgetRequests.find((r) => r.id === req.id);
        if (resolved) {
          return {
            ...req,
            status: resolved.approved ? 'approved' as const : 'rejected' as const,
            approvedAmount: resolved.approved ? resolved.amount : 0,
          };
        }
        return req;
      }),
      weekSummary: result.narrativeSummary,
      weekHistory: [...state.weekHistory, { day: newDay, week: newWeekNum, daysAdvanced: daysToAdvance, summary: result.narrativeSummary, phase: state.phase }],
      isWeekInProgress: true,
      savedAt: new Date().toISOString() as any,
      lastWeekResult: result,
      phaseGate: gate,
      bindingOffersReceived: state.bindingOffersReceived + (result.bindingOfferDelta ?? 0),
      ...(isGameComplete ? { gameComplete: true } : {}),
      ...(collapse.collapsed ? {
        gameComplete: true,
        collapseReason: collapse.reason,
        collapseHeadline: collapse.headline,
        collapseDescription: collapse.description,
      } : {}),
    });
  },

  advancePhase: async () => {
    const state = get();
    const nextPhase = Math.min(state.phase + 1, 10) as PhaseId;
    // Stamp phase emails with current game day so timestamps are accurate.
    const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    function stampEmails(emails: Email[]): Email[] {
      return emails.map((e, i) => ({
        ...e,
        week: state.week,
        day: state.day + i,
        timestamp: `Day ${state.day + i} (Week ${state.week}), ${DAY_NAMES[(state.day + i - 1) % 5]}`,
      }));
    }
    let newTasks = state.tasks;
    let newEmails = state.emails;
    let newDeliverables = state.deliverables;
    let newRisks = state.risks;
    let newHeadlines = state.headlines;
    let newWorkstreams = state.workstreams;
    let newBuyers = state.buyers;
    let newClient = state.client;
    if (nextPhase >= 1) {
      const phaseContent = await loadPhaseContent(nextPhase as Exclude<PhaseId, 0>);
      newTasks = [...state.tasks, ...phaseContent.tasks];
      newEmails = [...state.emails, ...stampEmails(phaseContent.emails)];
      newDeliverables = [...state.deliverables, ...phaseContent.deliverables];
      newRisks = [...state.risks, ...phaseContent.risks];
      newHeadlines = [...state.headlines, ...phaseContent.headlines];
      if (phaseContent.buyers) {
        newBuyers = [...state.buyers, ...phaseContent.buyers];
      }
    }
    if (nextPhase === 1) {
      if (state.boardSubmission?.leadId) {
        const chosenLead = state.leads.find(l => l.id === state.boardSubmission?.leadId);
        if (chosenLead) {
          newClient = {
            ...state.client,
            name: chosenLead.founderName,
            companyName: chosenLead.companyName,
            sector: chosenLead.sector,
            description: chosenLead.description,
          };
        }
      }
      newWorkstreams = state.workstreams.map((ws) => {
        if (['financials', 'marketing_materials', 'buyer_outreach'].includes(ws.id)) {
          return { ...ws, active: true };
        }
        return ws;
      });
    } else if (nextPhase === 2) {
      newWorkstreams = state.workstreams.map((ws) => {
        if (ws.id === 'management' || ws.id === 'due_diligence') {
          return { ...ws, active: true };
        }
        return ws;
      });
    } else if (nextPhase === 4) {
      newWorkstreams = state.workstreams.map((ws) => {
        if (ws.id === 'negotiation') {
          return { ...ws, active: true };
        }
        return ws;
      });
    } else if (nextPhase === 6) {
      newWorkstreams = state.workstreams.map((ws) => {
        if (ws.id === 'due_diligence') {
          return { ...ws, active: true };
        }
        return ws;
      });
    } else if (nextPhase === 8) {
      newWorkstreams = state.workstreams.map((ws) => {
        if (ws.id === 'negotiation') {
          return { ...ws, active: true };
        }
        return ws;
      });
    } else if (nextPhase === 10) {
      newWorkstreams = state.workstreams.map((ws) => {
        if (ws.id === 'closing') {
          return { ...ws, active: true };
        }
        return ws;
      });
    }
    const phaseSpent = Math.max(0, state.resources.budgetMax - state.resources.budget);
    const newTotalBudgetSpent = state.totalBudgetSpent + phaseSpent;
    const carryover = Math.max(0, state.resources.budget);
    const phaseBase = PHASE_BASE_BUDGETS[nextPhase] ?? 0;
    const newBudget = carryover + phaseBase;
    const newFinalOffers = nextPhase === 7
      ? generateFinalOffers(newBuyers, state.resources.dealMomentum, state.week + 1)
      : state.finalOffers;
    set({
      phase: nextPhase,
      tasks: unlockTasks(newTasks),
      emails: newEmails,
      deliverables: newDeliverables,
      risks: newRisks,
      headlines: newHeadlines,
      workstreams: newWorkstreams,
      buyers: newBuyers,
      client: newClient,
      phaseGate: null,
      resources: normalizeResources({
        ...state.resources,
        budget: newBudget,
        budgetMax: newBudget,
      }),
      totalBudgetSpent: newTotalBudgetSpent,
      phaseBudget: { phaseBase, carryover },
      feeNegotiation: null,
      agreedFeeTerms: null,
      phaseDeadline: null,
      pitchDocumentReady: false,
      bindingOffersReceived: 0,
      unaddressedQACount: 0,
      finalOffers: newFinalOffers,
      preferredBidderId: null,
    });
  },

  updateResources: (partial) => set((state) => ({
    resources: normalizeResources({ ...state.resources, ...partial }),
  })),

  markEmailRead: (emailId) => set((state) => ({
    emails: state.emails.map((e) =>
      e.id === emailId && e.state === 'unread' ? { ...e, state: 'read' } : e
    ),
  })),

  flagEmail: (emailId) => set((state) => ({
    emails: state.emails.map((e) =>
      e.id === emailId ? { ...e, flagged: !e.flagged } : e
    ),
  })),

  escalateEmail: (emailId) => set((state) => {
    const email = state.emails.find((e) => e.id === emailId);
    if (!email || email.escalated) return {};

    // Context-aware advice from Marcus Aldridge
    const advice: Record<string, { subject: string; body: string }> = {
      client: {
        subject: `Re: "${email.subject}" — Marcus`,
        body: `I've reviewed the situation with Ricardo.\n\nMy read: this is a trust issue as much as a tactical one. The moment a client starts second-guessing the process, you have to over-communicate — short status notes every 3 days without being asked. Frequency of contact at this stage matters more than depth.\n\nOn the substance: take their concern at face value first. Push back only after they feel heard. Don't try to win the argument before you've validated the relationship.\n\nLet me know if you want me to join the next call.`,
      },
      buyer: {
        subject: `Re: "${email.subject}" — Marcus`,
        body: `I've seen this move before.\n\nThe buyer is applying pressure at a predictable inflection point. Their behaviour is consistent with a firm that has approved a strong investment case internally but wants optionality — they're trying to lock in terms before the process gets competitive.\n\nDon't blink first. Acknowledge their concern professionally, hold the timeline, and remind them the process structure protects their interests as much as the seller's.\n\nIf they walk over process, they would have walked over something else later anyway.`,
      },
      partner: {
        subject: `Re: "${email.subject}" — Marcus`,
        body: `Thanks for looping me in.\n\nMy view: partners act in their own interest — that's not a criticism, it's a feature of the ecosystem. If they're pushing in a direction that doesn't serve our client, that's a sign to recalibrate the relationship, not the deal.\n\nBe direct with them. Tell them where we're aligned and where our obligations to Solara take precedence. Good partners respect that.`,
      },
      market: {
        subject: `Re: "${email.subject}" — Marcus`,
        body: `Market signals at this stage are noise until proven otherwise.\n\nI've been in processes where three consecutive bad headlines turned out to be entirely irrelevant to final price. Buyers know the difference between sector volatility and asset-specific risk — your job is to reinforce that Solara's story is idiosyncratic, not correlated to whatever is moving markets this week.\n\nPrepare a one-page differentiation note. Short. Factual. Send it proactively to all active buyers before they ask.`,
      },
      internal: {
        subject: `Re: "${email.subject}" — Marcus`,
        body: `Good that you flagged this.\n\nInternal frictions at this stage of a deal are usually a sign that someone's bandwidth is stretched and expectations haven't been re-calibrated. Address it directly — don't manage around it.\n\nIf it's capacity: reallocate. If it's process: fix the decision right. If it's morale: have the conversation now rather than later when it affects output.\n\nI'm available this week if useful.`,
      },
    };

    const adv = advice[email.category] ?? {
      subject: `Re: "${email.subject}" — Marcus`,
      body: `I've looked at this.\n\nMy instinct: stay deliberate and don't add urgency prematurely. Situations like this tend to resolve when you address the core issue directly and keep the team focused on process.\n\nIdentify the single most important thing to do next and do that first. Happy to discuss if it would help.`,
    };

    const marcusEmail: Email = {
      id: `email-escalated-${emailId}-${state.day}`,
      week: state.week,
      day: state.day,
      phase: state.phase,
      sender: 'Marcus Aldridge',
      senderRole: 'Managing Partner, Clearwater Advisory',
      subject: adv.subject,
      body: adv.body,
      preview: `Marcus weighs in on: ${email.subject.substring(0, 45)}...`,
      category: 'partner',
      state: 'unread',
      priority: 'high',
      timestamp: `Week ${state.week}, Day ${state.day}`,
    };

    return {
      emails: [
        ...state.emails.map((e) => e.id === emailId ? { ...e, escalated: true } : e),
        marcusEmail,
      ],
      resources: normalizeResources({
        ...state.resources,
        budget: Math.max(0, state.resources.budget - 2), // costs 2k to pull in Marcus
      }),
    };
  }),

  respondToEmail: (emailId, responseId) => set((state) => {
    const email = state.emails.find((e) => e.id === emailId);
    const response = email?.responseOptions?.find((r) => r.id === responseId);

    // Apply resource effects from the chosen response — with ±25% variance
    // The same decision can play out slightly differently each time
    let newResources = state.resources;
    if (response?.resourceEffects) {
      newResources = { ...state.resources };
      for (const [key, delta] of Object.entries(response.resourceEffects)) {
        const k = key as keyof PlayerResources;
        const current = newResources[k];
        if (typeof current === 'number' && typeof delta === 'number') {
          // Apply ±25% noise to the effect magnitude (keeps sign intact)
          const noise = 1 + (Math.random() - 0.5) * 0.5;
          const variedDelta = Math.round(delta * noise);
          const maxVal = k === 'budget' ? newResources.budgetMax : k === 'teamCapacity' ? newResources.teamCapacityMax : 100;
          (newResources as unknown as Record<string, number>)[k] = Math.max(0, Math.min(maxVal, current + variedDelta));
        }
      }
    }

    return {
      resources: normalizeResources(newResources),
      emails: state.emails.map((e) =>
        e.id === emailId ? { ...e, state: 'resolved' as const } : e
      ),
    };
  }),

  startTask: (taskId) => set((state) => {
    const updated = state.tasks.map((t) =>
      t.id === taskId && (t.status === 'available' || t.status === 'recommended')
        ? { ...t, status: 'in_progress' as const }
        : t
    );
    const unlockedUpdated = unlockTasks(updated);
    return {
      tasks: unlockedUpdated,
      deliverables: syncDeliverables(state.deliverables, unlockedUpdated),
      team: syncTeamLoad(state.team, unlockedUpdated),
    };
  }),

  completeTask: (taskId) => set((state) => {
    const updated = state.tasks.map((t) =>
      t.id === taskId && t.status === 'in_progress' ? { ...t, status: 'completed' as const } : t
    );
    const unlockedUpdated = unlockTasks(updated);

    // Sync workstream progress
    const updatedWorkstreams = state.workstreams.map((ws) => {
      if (!ws.active) return ws;
      const wsTasks = unlockedUpdated.filter((t) =>
        t.workstreamId === ws.id || (ws.id === 'preparation' && t.phase === state.phase && !t.workstreamId)
      );
      if (wsTasks.length === 0) return ws;
      const completed = wsTasks.filter((t) => t.status === 'completed').length;
      return { ...ws, progress: Math.round((completed / wsTasks.length) * 100) };
    });

    return {
      tasks: unlockedUpdated,
      workstreams: updatedWorkstreams,
      deliverables: syncDeliverables(state.deliverables, unlockedUpdated),
      team: syncTeamLoad(state.team, unlockedUpdated),
    };
  }),

  mitigateRisk: (riskId) => set((state) => {
    const risk = state.risks.find((r) => r.id === riskId);
    if (!risk || risk.mitigated) return {};

    // Mitigation costs resources
    const costMap: Record<string, number> = { low: 2, medium: 4, high: 6, critical: 8 };
    const cost = costMap[risk.severity] ?? 4;

    return {
      risks: state.risks.map((r) =>
        r.id === riskId ? { ...r, mitigated: true, probability: Math.max(0, r.probability - 20) } : r
      ),
      resources: normalizeResources({
        ...state.resources,
        budget: Math.max(0, state.resources.budget - cost),
        riskLevel: Math.max(0, state.resources.riskLevel - 5),
      }),
    };
  }),

  executeRiskMitigationPlan: (riskId, planId) => set((state) => {
    const risk = state.risks.find((r) => r.id === riskId);
    if (!risk || risk.mitigated) return {};

    const plan = getRiskMitigationPlans(risk).find((p) => p.id === planId);
    if (!plan) return {};

    if (state.resources.budget < plan.budgetCost) return {};
    if (state.resources.teamCapacity < plan.capacityCost) return {};

    let baseResources: PlayerResources = {
      ...state.resources,
      budget: state.resources.budget - plan.budgetCost,
      teamCapacity: state.resources.teamCapacity - plan.capacityCost,
    };

    const catastrophicFail =
      !!plan.catastrophicFailureChance && Math.random() < plan.catastrophicFailureChance;
    if (catastrophicFail) {
      baseResources = normalizeResources({ ...baseResources, clientTrust: 0, dealMomentum: 0, riskLevel: 100 });
      return {
        resources: baseResources,
        gameComplete: true,
        collapseReason: 'client_walked' as const,
        collapseHeadline: plan.catastrophicHeadline ?? 'Client Walked',
        collapseDescription:
          plan.catastrophicDescription ??
          'The mitigation move backfired and the client terminated the engagement.',
        toasts: [
          ...state.toasts,
          { id: Math.random().toString(36).substr(2, 9), message: 'Mitigation backfired: client exited the process.', type: 'danger' as const },
        ],
      };
    }

    const success = Math.random() < plan.successChance;
    const effects = success ? plan.onSuccess : plan.onFailure;
    const probabilityDelta = effects.probabilityDelta ?? 0;
    const { probabilityDelta: _, ...resourceDeltas } = effects;

    const mergedResources = { ...baseResources };
    for (const [key, delta] of Object.entries(resourceDeltas)) {
      const k = key as keyof PlayerResources;
      const current = mergedResources[k];
      if (typeof current === 'number' && typeof delta === 'number') {
        (mergedResources as unknown as Record<string, number>)[k] = current + delta;
      }
    }

    const nextRiskProbability = Math.max(0, Math.min(100, risk.probability + probabilityDelta));
    const boardSubmissionUpdate =
      success && plan.boardRecommendation && !state.boardSubmission
        ? {
            recommendation: plan.boardRecommendation.recommendation,
            rationale: plan.boardRecommendation.rationale,
            submittedWeek: state.week,
            status: 'pending' as const,
          }
        : state.boardSubmission;

    return {
      resources: normalizeResources(mergedResources),
      risks: state.risks.map((r) =>
        r.id === riskId
          ? {
              ...r,
              probability: round2(nextRiskProbability),
              mitigated: success ? true : r.mitigated,
            }
          : r
      ),
      boardSubmission: boardSubmissionUpdate,
      toasts: [
        ...state.toasts,
        {
          id: Math.random().toString(36).substr(2, 9),
          message: success
            ? plan.boardRecommendation && !state.boardSubmission
              ? 'Mitigation executed and board memo submitted.'
              : 'Mitigation plan executed successfully.'
            : 'Mitigation plan underperformed. Risk remains active.',
          type: success ? 'success' as const : 'warning' as const,
        },
      ],
    };
  }),

  setPlayerName: (name: string) => set({ playerName: name }),
  markOnboardingSeen: () => set({ hasSeenOnboarding: true }),
  saveGame: () => set({ savedAt: new Date().toISOString() }),
  completeGame: () => set({ gameComplete: true }),


  dismissWeekSummary: () => set({ lastWeekResult: null, isWeekInProgress: false }),

  // ─── Phase Deadline ──────────────────────────────────────────────────────
  setPhaseDeadline: (weeks) => set((state) => ({
    phaseDeadline: state.day + weeks * 7,
  })),

  // ─── Budget ─────────────────────────────────────────────────────────────
  requestBudget: (amount, justification) => set((state) => ({
    budgetRequests: [
      ...state.budgetRequests,
      {
        id: `br-${Date.now()}`,
        week: state.week,
        phase: state.phase,
        amount,
        justification,
        status: 'pending' as const,
      },
    ],
  })),

  resolveBudgetRequest: (id, approved, approvedAmount) => set((state) => {
    const req = state.budgetRequests.find((r) => r.id === id);
    if (!req) return {};
    const injected = approved ? (approvedAmount ?? req.amount) : 0;
    return {
      budgetRequests: state.budgetRequests.map((r) =>
        r.id === id
          ? { ...r, status: approved ? 'approved' as const : 'rejected' as const, approvedAmount: injected }
          : r
      ),
      resources: approved
        ? normalizeResources({ ...state.resources, budget: state.resources.budget + injected })
        : state.resources,
    };
  }),

  // ─── Phase 0 Qualification ───────────────────────────────────────────────
  investigateDimension: (leadId, dimension) => set((state) => {
    const cost = 2; // k€
    if (state.resources.budget < cost) return {};

    const leadIndex = state.leads.findIndex((l) => l.id === leadId);
    if (leadIndex === -1) return {};

    const updatedLeads = [...state.leads];
    updatedLeads[leadIndex] = {
      ...updatedLeads[leadIndex],
      investigation: {
        ...updatedLeads[leadIndex].investigation,
        [dimension]: 'completed'
      }
    };

    const dimensionNames = {
      sector: 'Sector Dynamics',
      company: 'Company Fundamentals',
      shareholder: 'Shareholder Objectives',
      market: 'Market Read'
    };

    const newNote: QualificationNote = {
      id: `qn-${Date.now()}-${dimension}`,
      week: state.week,
      source: 'team_research',
      content: `Investigated ${dimensionNames[dimension]} for ${updatedLeads[leadIndex].companyName}. Findings look viable for a structured process.`,
      sentiment: 'neutral',
    };

    return {
      resources: normalizeResources({
        ...state.resources,
        budget: state.resources.budget - cost
      }),
      leads: updatedLeads,
      qualificationNotes: [...state.qualificationNotes, newNote],
      toasts: [
        ...state.toasts,
        {
          id: `t-${Date.now()}`,
          message: `Investigating ${dimensionNames[dimension]} for ${updatedLeads[leadIndex].companyName}.`,
          type: 'info'
        }
      ]
    };
  }),

  scheduleMeeting: (leadId) => set((state) => {
    const cost = 5; // k€
    if (state.resources.budget < cost) return {};

    const leadIndex = state.leads.findIndex((l) => l.id === leadId);
    if (leadIndex === -1) return {};

    const updatedLeads = [...state.leads];
    updatedLeads[leadIndex] = {
      ...updatedLeads[leadIndex],
      meetingDone: true
    };

    const newNote: QualificationNote = {
      id: `qn-${Date.now()}-intro`,
      week: state.week,
      source: 'meeting',
      content: `Introductory meeting with ${updatedLeads[leadIndex].founderName} (${updatedLeads[leadIndex].companyName}). Client is receptive to our advisory approach.`,
      sentiment: 'positive',
    };

    return {
      resources: normalizeResources({
        ...state.resources,
        budget: state.resources.budget - cost
      }),
      leads: updatedLeads,
      qualificationNotes: [...state.qualificationNotes, newNote],
      toasts: [
        ...state.toasts,
        {
          id: `t-${Date.now()}`,
          message: `Introductory meeting scheduled for ${updatedLeads[leadIndex].companyName}.`,
          type: 'success'
        }
      ]
    };
  }),

  addQualificationNote: (note) => set((state) => ({
    qualificationNotes: [
      ...state.qualificationNotes,
      { ...note, id: `qn-${Date.now()}` },
    ],
  })),

  submitBoardRecommendation: (recommendation, rationale, leadId) => set((state) => ({
    boardSubmission: {
      recommendation,
      rationale,
      leadId,
      submittedWeek: state.week,
      status: 'pending' as const,
    },
  })),

  // ─── Staffing ────────────────────────────────────────────────────────────
  hireStaffer: (profile) => set((state) => {
    const cfg = STAFF_PROFILES.find((p) => p.id === profile);
    if (!cfg) return {};
    if (state.resources.budget < cfg.hireCost) return {};
    const newMember: TeamMember = {
      id: `tm-hired-${Date.now()}`,
      name: cfg.label,
      role: cfg.role,
      seniority: cfg.seniority,
      capacity: cfg.capacityBoost,
      morale: 80,
      currentLoad: 0,
      skills: cfg.skills,
      isContractor: false,
    };
    return {
      team: [...state.team, newMember],
      resources: normalizeResources({
        ...state.resources,
        budget: state.resources.budget - cfg.hireCost,
        teamCapacity: state.resources.teamCapacity + cfg.capacityBoost,
        teamCapacityMax: state.resources.teamCapacityMax + cfg.capacityBoost,
      }),
    };
  }),

  allocateTempCapacity: (taskId, profile) => set((state) => {
    const cfg = CONTRACTOR_PROFILES.find((p) => p.id === profile);
    if (!cfg) return {};
    const allocation: TempCapacityAllocation = {
      id: `tca-${Date.now()}`,
      taskId,
      profile,
      weeklyRate: cfg.weeklyRate,
      speedMultiplier: cfg.speedMultiplier,
    };
    return { tempCapacityAllocations: [...state.tempCapacityAllocations, allocation] };
  }),

  releaseTempCapacity: (allocationId) => set((state) => ({
    tempCapacityAllocations: state.tempCapacityAllocations.filter((a) => a.id !== allocationId),
  })),

  // ─── Fee Negotiation ─────────────────────────────────────────────────────
  presentPitch: () => set((state) => {
    if (!state.feeNegotiation) {
      // Initialise negotiation shell for current phase
      const clientProfile = deriveClientProfile(state.resources.clientTrust, state.qualificationNotes);
      const clientState = buildClientNegotiationState(clientProfile, state.client.valuationExpectationEV ?? 100);
      const negotiation: FeeNegotiation = {
        phase: state.phase,
        pitchPresented: true,
        status: 'pitch_pending',
        clientState,
        rounds: [],
      };
      return { feeNegotiation: negotiation };
    }
    return { feeNegotiation: { ...state.feeNegotiation, pitchPresented: true, status: 'pitch_pending' } };
  }),

  startFeeNegotiation: () => set((state) => {
    if (!state.feeNegotiation?.pitchPresented) return {};
    return { feeNegotiation: { ...state.feeNegotiation, status: 'in_progress' } };
  }),

  submitFeeRound: (terms) => set((state) => {
    if (!state.feeNegotiation || state.feeNegotiation.status !== 'in_progress') return {};
    const { clientState } = state.feeNegotiation;
    const currentRound = state.feeNegotiation.rounds.length + 1;
    const maxRounds = state.resources.clientTrust > 60 ? 4 : 3;

    // Use locked values for locked components
    const effectiveTerms = {
      ...terms,
      playerRetainerType: clientState.lockedComponents.includes('retainer')
        ? (clientState.lockedRetainerType ?? terms.playerRetainerType)
        : terms.playerRetainerType,
      playerRetainerAmount: clientState.lockedComponents.includes('retainer')
        ? (clientState.lockedRetainerAmount ?? terms.playerRetainerAmount)
        : terms.playerRetainerAmount,
      playerSuccessFeePercent: clientState.lockedComponents.includes('successFee')
        ? (clientState.lockedSuccessFeePercent ?? terms.playerSuccessFeePercent)
        : terms.playerSuccessFeePercent,
    };

    // Resolve per-component reactions — locked components always green
    const reactionRetainer: ComponentReaction = clientState.lockedComponents.includes('retainer')
      ? 'green' : resolveRetainerReaction(effectiveTerms, clientState);
    const reactionSuccessFee: ComponentReaction = clientState.lockedComponents.includes('successFee')
      ? 'green' : resolveSuccessFeeReaction(effectiveTerms.playerSuccessFeePercent, clientState);
    const reactionRatchet: ComponentReaction = clientState.lockedComponents.includes('ratchet')
      ? 'green' : resolveRatchetReaction(effectiveTerms, clientState);

    // Net satisfaction score
    const score = computeSatisfactionScore(reactionRetainer, reactionSuccessFee, reactionRatchet, clientState);
    const redCount = [reactionRetainer, reactionSuccessFee, reactionRatchet].filter((r) => r === 'red').length;

    // Patience drain: -25 per red, weighted by priority
    const patienceDrain =
      (reactionRetainer === 'red' ? 25 * (clientState.priorityRetainer / 10) : 0) +
      (reactionSuccessFee === 'red' ? 25 * (clientState.prioritySuccessFee / 10) : 0) +
      (reactionRatchet === 'red' ? 25 * (clientState.priorityRatchet / 10) : 0);
    const newPatience = Math.max(0, clientState.patienceRemaining - patienceDrain);

    // Determine outcome
    const accepted = redCount === 0 || (score >= 6 && redCount <= 1);
    const failed = redCount >= 2 || newPatience <= 0 || currentRound >= maxRounds;
    const outcome: NegotiationRound['outcome'] = accepted ? 'accepted' : (failed ? 'rejected' : 'counter');

    const clientNote = generateClientNote(clientState.profile, reactionRetainer, reactionSuccessFee, reactionRatchet, outcome);

    const newRound: NegotiationRound = {
      round: currentRound,
      ...effectiveTerms,
      reactionRetainer,
      reactionSuccessFee,
      reactionRatchet,
      clientNote,
      outcome,
    };

    // Apply progressive locking (only on counter — not on accepted/rejected)
    const lockUpdates = outcome === 'counter'
      ? applyFeeProgressiveLocking(clientState, effectiveTerms, { retainer: reactionRetainer, successFee: reactionSuccessFee, ratchet: reactionRatchet })
      : {};

    const updatedClientState: ClientNegotiationState = { ...clientState, patienceRemaining: newPatience, ...lockUpdates };

    if (accepted) {
      const ev = state.client.valuationExpectationEV ?? 100;
      const baseFee = (effectiveTerms.playerSuccessFeePercent / 100) * ev;
      const ratchetFee = effectiveTerms.playerRatchetEnabled && effectiveTerms.playerRatchetThresholdEV && effectiveTerms.playerRatchetBonusPercent
        ? (effectiveTerms.playerRatchetBonusPercent / 100) * Math.max(0, ev - effectiveTerms.playerRatchetThresholdEV)
        : 0;
      const agreedTerms: FeeTerms = {
        retainerType: effectiveTerms.playerRetainerType,
        retainerAmount: effectiveTerms.playerRetainerAmount,
        successFeePercent: effectiveTerms.playerSuccessFeePercent,
        ratchetEnabled: effectiveTerms.playerRatchetEnabled,
        ratchetThresholdEV: effectiveTerms.playerRatchetThresholdEV,
        ratchetBonusPercent: effectiveTerms.playerRatchetBonusPercent,
        totalFeeProjection: Math.round((baseFee + ratchetFee) * 10) / 10,
        agreedWeek: state.week,
      };
      return {
        feeNegotiation: {
          ...state.feeNegotiation,
          status: 'agreed',
          clientState: updatedClientState,
          rounds: [...state.feeNegotiation.rounds, newRound],
          agreedTerms,
        },
        agreedFeeTerms: agreedTerms,
      };
    }

    if (outcome === 'rejected') {
      return {
        feeNegotiation: {
          ...state.feeNegotiation,
          status: 'failed',
          clientState: updatedClientState,
          rounds: [...state.feeNegotiation.rounds, newRound],
        },
        resources: normalizeResources({ ...state.resources, clientTrust: Math.max(0, state.resources.clientTrust - 10) }),
      };
    }

    return {
      feeNegotiation: {
        ...state.feeNegotiation,
        clientState: updatedClientState,
        rounds: [...state.feeNegotiation.rounds, newRound],
      },
    };
  }),

  acceptFeeTerms: () => set((state) => {
    const lastRound = state.feeNegotiation?.rounds[state.feeNegotiation.rounds.length - 1];
    if (!lastRound || !state.feeNegotiation) return {};
    const ev = state.client.valuationExpectationEV ?? 100;
    const baseFee = (lastRound.playerSuccessFeePercent / 100) * ev;
    const ratchetFee = lastRound.playerRatchetEnabled && lastRound.playerRatchetThresholdEV && lastRound.playerRatchetBonusPercent
      ? (lastRound.playerRatchetBonusPercent / 100) * Math.max(0, ev - lastRound.playerRatchetThresholdEV)
      : 0;
    const agreedTerms: FeeTerms = {
      retainerType: lastRound.playerRetainerType,
      retainerAmount: lastRound.playerRetainerAmount,
      successFeePercent: lastRound.playerSuccessFeePercent,
      ratchetEnabled: lastRound.playerRatchetEnabled,
      ratchetThresholdEV: lastRound.playerRatchetThresholdEV,
      ratchetBonusPercent: lastRound.playerRatchetBonusPercent,
      totalFeeProjection: Math.round((baseFee + ratchetFee) * 10) / 10,
      agreedWeek: state.week,
    };
    return {
      feeNegotiation: { ...state.feeNegotiation, status: 'agreed', agreedTerms },
      agreedFeeTerms: agreedTerms,
    };
  }),

  // ─── Competitor Mitigation ───────────────────────────────────────────────
  // Final offer selection
  selectPreferredBidder: (buyerId) => set((state) => ({
    preferredBidderId: buyerId,
    buyers: state.buyers.map((b) =>
      b.id === buyerId
        ? { ...b, status: 'preferred' as const }
        : b.status === 'preferred'
          ? { ...b, status: 'bidding' as const }
          : b
    ),
  })),

  // SPA actions
  initSPANegotiation: () => set((state) => {
    const preferredBuyer = state.buyers.find((b) => b.id === state.preferredBidderId || b.status === 'preferred');
    if (!preferredBuyer) return {};
    const buyerState = generateSPABuyerState(preferredBuyer);
    return {
      spaNegotiation: {
        phase: state.phase,
        preferredBuyerId: preferredBuyer.id,
        status: 'in_progress',
        buyerState,
        rounds: [],
      },
    };
  }),

  submitSPARound: (terms) => set((state) => {
    const neg = state.spaNegotiation;
    if (!neg || neg.status !== 'in_progress') return {};

    const round = neg.rounds.length + 1;
    const lockedComponents = neg.buyerState.lockedComponents;

    // Use locked values for locked components
    const effectiveTerms = {
      ...terms,
      playerWarrantyScope: lockedComponents.includes('scope')
        ? (neg.buyerState.lockedWarrantyScope ?? terms.playerWarrantyScope)
        : terms.playerWarrantyScope,
      playerWarrantyCap: lockedComponents.includes('cap')
        ? (neg.buyerState.lockedWarrantyCap ?? terms.playerWarrantyCap)
        : terms.playerWarrantyCap,
      playerEscrowPercent: lockedComponents.includes('escrow')
        ? (neg.buyerState.lockedEscrowPercent ?? terms.playerEscrowPercent)
        : terms.playerEscrowPercent,
    };

    const rawResult = evaluateSPARound(effectiveTerms, neg.buyerState, round, state.resources);

    // Override locked component reactions to always green
    const reactionScope: ComponentReaction  = lockedComponents.includes('scope')     ? 'green' : rawResult.reactionScope;
    const reactionCap: ComponentReaction    = lockedComponents.includes('cap')       ? 'green' : rawResult.reactionCap;
    const reactionEscrow: ComponentReaction = lockedComponents.includes('escrow')    ? 'green' : rawResult.reactionEscrow;
    const reactionIndemnity: ComponentReaction = lockedComponents.includes('indemnity') ? 'green' : rawResult.reactionIndemnity;

    // Recompute outcome with overridden reactions
    const reds = [reactionScope, reactionCap, reactionEscrow, reactionIndemnity].filter(r => r === 'red').length;
    const yellows = [reactionScope, reactionCap, reactionEscrow, reactionIndemnity].filter(r => r === 'yellow').length;
    const patience = neg.buyerState.patienceRemaining;
    let outcome: SPARound['outcome'] = reds === 0 && yellows <= 1 ? 'accepted' : reds >= 2 || patience < 20 ? 'rejected' : 'counter';
    if (round >= 3 && reds >= 1) outcome = 'rejected';

    const result = { ...rawResult, reactionScope, reactionCap, reactionEscrow, reactionIndemnity, outcome };

    const newRound: SPARound = { round, ...effectiveTerms, ...result };
    const newPatience = Math.max(0, neg.buyerState.patienceRemaining - (result.reactionCap === 'red' || result.reactionScope === 'red' ? 30 : 15));

    // Apply progressive locking on counter
    const lockUpdates = outcome === 'counter'
      ? applySPAProgressiveLocking(neg.buyerState, effectiveTerms, { scope: reactionScope, cap: reactionCap, escrow: reactionEscrow, indemnity: reactionIndemnity })
      : {};

    const newStatus = result.outcome === 'accepted' ? 'agreed' :
                     result.outcome === 'rejected' ? 'failed' : 'in_progress';

    const agreedTerms: SPATerms | undefined = result.outcome === 'accepted' ? {
      warrantyScope: effectiveTerms.playerWarrantyScope,
      warrantyCap: effectiveTerms.playerWarrantyCap,
      escrowPercent: terms.playerEscrowPercent,
      specificIndemnity: terms.playerSpecificIndemnity,
      agreedWeek: state.week,
    } : undefined;

    const resourceEffect = result.outcome === 'accepted'
      ? { dealMomentum: Math.min(100, state.resources.dealMomentum + 10), clientTrust: Math.min(100, state.resources.clientTrust + 5), riskLevel: Math.max(0, state.resources.riskLevel - 5) }
      : result.outcome === 'rejected'
        ? { clientTrust: Math.max(0, state.resources.clientTrust - 10), riskLevel: Math.min(100, state.resources.riskLevel + 8) }
        : {};

    return {
      spaNegotiation: {
        ...neg,
        status: newStatus,
        buyerState: { ...neg.buyerState, patienceRemaining: newPatience, ...lockUpdates },
        rounds: [...neg.rounds, newRound],
        agreedTerms,
      },
      agreedSPATerms: agreedTerms ?? state.agreedSPATerms,
      resources: normalizeResources({ ...state.resources, ...resourceEffect }),
    };
  }),

  acceptSPATerms: () => set((state) => {
    const neg = state.spaNegotiation;
    if (!neg) return {};
    // Accept buyer's minimum (reservation) terms
    const agreedTerms: SPATerms = {
      warrantyScope: 'standard',
      warrantyCap: neg.buyerState.reservationWarrantyCap,
      escrowPercent: neg.buyerState.reservationEscrowPercent,
      specificIndemnity: neg.buyerState.priorityIndemnity >= 7,
      agreedWeek: state.week,
    };
    return {
      spaNegotiation: { ...neg, status: 'agreed', agreedTerms },
      agreedSPATerms: agreedTerms,
      resources: normalizeResources({
        ...state.resources,
        dealMomentum: Math.min(100, state.resources.dealMomentum + 8),
        clientTrust: Math.min(100, state.resources.clientTrust + 5),
      }),
    };
  }),

  // Dataroom access
  setDataroomAccess: (categoryId, level) => set((state) => {
    const cat = state.dataroomCategories.find((c) => c.id === categoryId);
    if (!cat || cat.accessLevel === level) return {};

    const prev = cat.accessLevel;
    const opening = (prev === 'restricted' && level !== 'restricted') || (prev === 'partial' && level === 'full');
    const restricting = (prev === 'full' && level !== 'full') || (prev !== 'restricted' && level === 'restricted');

    // Resource effects based on sensitivity and direction
    const sensitivityWeight = cat.sensitivity === 'critical' ? 1.0 : cat.sensitivity === 'high' ? 0.7 : cat.sensitivity === 'medium' ? 0.4 : 0.2;
    let momentumDelta = 0;
    let riskDelta = 0;
    let trustDelta = 0;

    if (opening) {
      momentumDelta = Math.round(8 * sensitivityWeight);   // buyers more engaged
      riskDelta = Math.round(10 * sensitivityWeight);       // more exposure
      trustDelta = Math.round(5 * sensitivityWeight);       // client trusts the process
    } else if (restricting) {
      momentumDelta = Math.round(-5 * sensitivityWeight);   // buyers frustrated
      riskDelta = Math.round(-6 * sensitivityWeight);       // less exposure
    }

    const newResources = {
      ...state.resources,
      dealMomentum: Math.max(0, Math.min(100, state.resources.dealMomentum + momentumDelta)),
      riskLevel: Math.max(0, Math.min(100, state.resources.riskLevel + riskDelta)),
      clientTrust: Math.max(0, Math.min(100, state.resources.clientTrust + trustDelta)),
    };

    return {
      dataroomCategories: state.dataroomCategories.map((c) =>
        c.id === categoryId ? { ...c, accessLevel: level } : c
      ),
      resources: normalizeResources(newResources),
    };
  }),

  // Toast actions
  addToast: (message, type) => set((state) => ({
    toasts: [...state.toasts, { id: Math.random().toString(36).substr(2, 9), message, type }],
  })),
  removeToast: (id) => set((state) => ({
    toasts: state.toasts.filter((t) => t.id !== id),
  })),

  executeMitigationAction: (threatId, action) => set((state) => {
    const cfg = MITIGATION_ACTIONS.find((a) => a.id === action);
    if (!cfg) return {};
    if (state.resources.budget < cfg.budgetCost) return {};
    const effects = cfg.effects;
    return {
      competitorThreats: state.competitorThreats.map((t) => {
        if (t.id !== threatId) return t;
        const updatedActions = [...t.usedActions, action];
        // Threat is resolved once 2+ mitigation actions have been used
        const resolved = updatedActions.length >= 2;
        return { ...t, usedActions: updatedActions, resolved };
      }),
      resources: normalizeResources({
        ...state.resources,
        budget: state.resources.budget - cfg.budgetCost,
        clientTrust: Math.min(100, state.resources.clientTrust + (effects.clientTrust ?? 0)),
        dealMomentum: Math.min(100, state.resources.dealMomentum + (effects.dealMomentum ?? 0)),
        reputation: Math.min(100, state.resources.reputation + (effects.reputation ?? 0)),
      }),
    };
  }),
}), {
  name: 'ma-rainmaker-save',
  version: 2,
  migrate: (persistedState: unknown, fromVersion: number) => {
    const s = persistedState as Record<string, unknown>;
    if (fromVersion < 2) {
      // Add day/totalDays fields introduced in v2 (day-based time system)
      const week = (s.week as number | undefined) ?? 1;
      if (s.day === undefined) s.day = week;
      if (s.totalDays === undefined) s.totalDays = week * 7;
      // Patch weekHistory entries to include day and daysAdvanced
      if (Array.isArray(s.weekHistory)) {
        s.weekHistory = (s.weekHistory as Record<string, unknown>[]).map((entry) => ({
          ...entry,
          day: entry.day ?? ((entry.week as number) * 7),
          daysAdvanced: entry.daysAdvanced ?? 7,
        }));
      }
    }
    return s;
  },
  partialize: (state) => {
    // Exclude transient UI state from persistence
    const { lastWeekResult, phaseGate, isWeekInProgress, toasts, ...persisted } = state;
    return persisted;
  },
}));



