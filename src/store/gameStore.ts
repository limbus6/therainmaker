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
  BuyerStatus,
  SPABuyerState,
  SPABuyerProfile,
  SPANegotiation,
  SPARound,
  SPATerms,
  GameEvent,
  BudgetRequest,
  Buyer,
  CompetitorThreat,
  EventDirectorState,
  ResourceDelta,
  OfferRevealState,
} from '../types/game';
import type { ActionCommitment } from '../types/dealBeat';
import { createInitialEventDirectorState } from '../engine/eventDirector';
import { buildResourceDeltas } from '../engine/resourceDeltas';
import { createRng, deriveSeed } from '../engine/rng';
import { resolveWeek, checkPhaseGate, unlockTasks, checkDealCollapse, calcDaysToAdvance, buildUpcomingBeats } from '../engine/weekEngine';
import type { WeekResult, PhaseGateResult } from '../engine/weekEngine';
import { getGoldenMandateOfferDriver } from '../engine/goldenMandate';
import { PHASE_BASE_BUDGETS, STAFF_PROFILES, CONTRACTOR_PROFILES, MITIGATION_ACTIONS } from '../config/phaseBudgets';
import { getRiskMitigationPlans } from '../config/riskMitigation';
import { REVIEW_CHECKPOINTS_BY_ID } from '../config/reviewCheckpoints';
import { retireObsoleteRisks, updatePhaseWorkstreamProgress } from '../utils/gameplayState';

import { loadPhaseContent, type PhaseContent } from '../content/loadPhaseContent';

// ============================================
// Phase 0 Origination Constants
// ============================================
export const INVESTIGATION_COST_K = 0; // kEUR per investigation dimension - research uses capacity, not budget
export const INVESTIGATION_CAPACITY_COST = 4; // % team capacity per investigation dimension

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
  dealMomentum: 25,
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
    body: 'We are behind on our origination targets for this quarter. I need you to secure a new sell-side mandate within the next few weeks to close the gap.\n\nA referral just came in — Solara Systems, a founder-led industrial IoT platform. Ricardo Mendes is considering a full exit. This looks like the right profile: strong SaaS metrics, credible buyer universe. I\'ve already briefed the team.\n\nYou have a €50k origination budget. Get into the opportunity, run the qualification, and come back to me with a recommendation. Move fast — the window is open now.',
    preview: 'A referral just came in — Solara Systems. Get into it fast.',
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
    phase: 0, category: 'internal', status: 'recommended', cost: 0, work: 4, complexity: 'medium',
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

function createInitialDataroomCategories(): DataroomCategory[] {
  return [
    { id: 'dr-financials', name: 'Financial Statements', description: 'P&L, balance sheet, cash flow, management accounts, ARR breakdown.', sensitivity: 'low', accessLevel: 'partial' },
    { id: 'dr-customers', name: 'Customer Contracts', description: 'Key account agreements, MSAs, concentration analysis, churn data.', sensitivity: 'high', accessLevel: 'restricted' },
    { id: 'dr-technology', name: 'Technology & IP', description: 'Platform architecture, source code summary, patent filings, technical debt audit.', sensitivity: 'critical', accessLevel: 'restricted' },
    { id: 'dr-employees', name: 'Employee & HR Data', description: 'Org chart, key employee contracts, comp structure, retention agreements.', sensitivity: 'high', accessLevel: 'restricted' },
    { id: 'dr-legal', name: 'Legal & Litigation', description: 'Corporate documents, material contracts, pending litigation, IP disputes.', sensitivity: 'medium', accessLevel: 'partial' },
    { id: 'dr-regulatory', name: 'Regulatory & Compliance', description: 'Industry certifications, regulatory filings, GDPR/data handling policies.', sensitivity: 'medium', accessLevel: 'partial' },
    { id: 'dr-commercial', name: 'Commercial Pipeline', description: 'Sales pipeline, win/loss data, go-to-market strategy, pricing model.', sensitivity: 'high', accessLevel: 'restricted' },
    { id: 'dr-operations', name: 'Operational KPIs', description: 'Product uptime, support metrics, deployment architecture, SLA performance.', sensitivity: 'low', accessLevel: 'full' },
  ];
}

function applyDebugBuyerState(buyers: Buyer[], targetPhase: PhaseId): Buyer[] {
  const phaseStatusMap: Partial<Record<PhaseId, Partial<Record<string, BuyerStatus>>>> = {
    2: {
      'buyer-01': 'identified',
      'buyer-02': 'identified',
      'buyer-03': 'identified',
      'buyer-04': 'identified',
      'buyer-05': 'identified',
    },
    3: {
      'buyer-01': 'nda_signed',
      'buyer-02': 'identified',
      'buyer-03': 'reviewing',
      'buyer-04': 'nda_signed',
      'buyer-05': 'active',
    },
    4: {
      'buyer-01': 'shortlisted',
      'buyer-02': 'excluded',
      'buyer-03': 'shortlisted',
      'buyer-04': 'active',
      'buyer-05': 'active',
    },
    5: {
      'buyer-01': 'bidding',
      'buyer-02': 'dropped',
      'buyer-03': 'bidding',
      'buyer-04': 'shortlisted',
      'buyer-05': 'excluded',
    },
    6: {
      'buyer-01': 'active',
      'buyer-02': 'dropped',
      'buyer-03': 'active',
      'buyer-04': 'active',
      'buyer-05': 'dropped',
    },
    7: {
      'buyer-01': 'bidding',
      'buyer-02': 'dropped',
      'buyer-03': 'bidding',
      'buyer-04': 'bidding',
      'buyer-05': 'dropped',
    },
    8: {
      'buyer-01': 'shortlisted',
      'buyer-02': 'dropped',
      'buyer-03': 'preferred',
      'buyer-04': 'dropped',
      'buyer-05': 'dropped',
    },
    9: {
      'buyer-01': 'excluded',
      'buyer-02': 'dropped',
      'buyer-03': 'preferred',
      'buyer-04': 'dropped',
      'buyer-05': 'dropped',
    },
    10: {
      'buyer-01': 'excluded',
      'buyer-02': 'dropped',
      'buyer-03': 'preferred',
      'buyer-04': 'dropped',
      'buyer-05': 'dropped',
    },
  };

  const overrides = phaseStatusMap[targetPhase] ?? {};
  return buyers.map((buyer) => {
    const status = overrides[buyer.id] ?? buyer.status;
    return {
      ...buyer,
      status,
      bindingOfferSubmitted: targetPhase >= 7 ? !['dropped', 'excluded'].includes(status) : buyer.bindingOfferSubmitted,
    };
  });
}

const DEBUG_FEE_TERMS: FeeTerms = {
  retainerType: 'upfront',
  retainerAmount: 50,
  successFeePercent: 2.0,
  ratchetEnabled: true,
  ratchetThresholdEV: 100,
  ratchetBonusPercent: 5.0,
  totalFeeProjection: 2050,
  agreedWeek: 0,
};

const DEBUG_SPA_TERMS: SPATerms = {
  warrantyScope: 'standard',
  warrantyCap: 22,
  escrowPercent: 8.5,
  specificIndemnity: true,
  agreedWeek: 0,
};

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
    notes.push(`That success fee percentage doesn't work for me. I'd need to see something closer to ${profile === 'serious_demanding' ? '1.5%' : '2%'}.`);
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
    companyName: 'Vektor Health Tech',
    sector: 'MedTech / Diagnostic Software',
    founderName: 'Dra. Clara Vance',
    origin: 'Partner network intro',
    description: 'AI-assisted diagnostic software for hospital radiology networks. €14M ARR, 48% YoY growth. High margin business but faces regulatory scrutiny in Germany.',
    investmentCaseSummary: 'Rapid growth in high-demand sector. Strategic fit for healthcare conglomerates, though regulatory approvals add execution risk.',
    investigation: { sector: 'none', company: 'none', shareholder: 'none', market: 'none' },
    meetingDone: false,
    hiddenMotivations: 'Wants a strategic buy-out to expand into US market.',
    hiddenGrowth: 'high',
    hiddenRisk: 'moderate',
    researchNotes: []
  },
  {
    id: 'lead-3',
    companyName: 'Nexa Automation',
    sector: 'Supply Chain Tech / Robotics',
    founderName: 'Tomás Silva',
    origin: 'Outreach campaign target',
    description: 'Automated warehouse dispatch and fleet optimization platform. €19M revenue, 20% YoY growth. Solid cashflow, but heavy hardware dependency.',
    investmentCaseSummary: 'Established enterprise client base with long-term contracts. Lower growth profile than Solara but reliable cashflow generation.',
    investigation: { sector: 'none', company: 'none', shareholder: 'none', market: 'none' },
    meetingDone: false,
    hiddenMotivations: 'Co-founders have divergent views on valuation; timing is tight.',
    hiddenGrowth: 'moderate',
    hiddenRisk: 'high',
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
  preferredBidderConfirmed: boolean;
  phaseEntryDay: Partial<Record<number, number>>;

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
  offerReveal: OfferRevealState;
  preferredBidderId: string | null;
  spaNegotiation: SPANegotiation | null;
  agreedSPATerms: SPATerms | null;
  dataroomCategories: DataroomCategory[];
  phaseDeadline: number | null; // calendar day when phase 3/4/6 deadline expires
  pitchDocumentReady: boolean;  // unlocked when pitch document task completes
  bindingOffersReceived: number; // count of buyers who submitted binding offer before Phase 6 deadline
  unaddressedQACount: number;   // counter incremented by DD Q&A events; reduced by Q&A response task
  weekPace: 'sprint' | 'standard' | 'deliberate';
  rngSeed: number;
  eventDirectorState: EventDirectorState;
  activeMissionId?: string;
  commitments: ActionCommitment[];

  // Turn playback (non-blocking live turn) — transient, not persisted
  turnPlayback: { status: 'playing' | 'done'; fromDay: number; toDay: number } | null;
  lastResourceDeltas: ResourceDelta[];
  showWeekReport: boolean;
  pendingReportAutoOpen: boolean;

  // GameActions
  selectMissionFocus: (missionId: string) => void;
  commitToAction: (taskId: string) => void;
  commitAndAdvance: (taskId: string) => void;
  advanceWeek: () => void;
  advancePhase: () => Promise<void>;
  debugJumpToPhase: (targetPhase: PhaseId) => Promise<void>;
  debugJumpToCheckpoint: (checkpointId: string) => Promise<void>;
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
  completeTurnPlayback: () => void;
  openWeekReport: () => void;
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
  selectPreferredBidder: (buyerId: string, confirmed?: boolean) => void;
  completeOfferReveal: (status: 'completed' | 'skipped', revealedBuyerIds: string[]) => void;
  // Dataroom
  setDataroomAccess: (categoryId: string, level: DataroomAccessLevel) => void;
  // SPA
  initSPANegotiation: () => void;
  submitSPARound: (terms: Pick<SPARound, 'playerWarrantyScope' | 'playerWarrantyCap' | 'playerEscrowPercent' | 'playerSpecificIndemnity'>) => void;
  acceptSPATerms: () => void;
  setWeekPace: (pace: 'sprint' | 'standard' | 'deliberate') => void;
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
      const taskProgress = Math.min(90, Math.round(linkedTask.progress ?? 15));
      return { ...del, status: 'drafting' as const, completion: Math.max(del.completion, taskProgress) };
    }
    return del;
  });
}

// ============================================
// Helper: sync team workload from in-progress tasks
// ============================================
function syncTeamLoad(team: TeamMember[], tasks: GameTask[], phase: PhaseId): TeamMember[] {
  const inProgress = tasks.filter((t) => t.status === 'in_progress' && t.phase === phase);
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

type LeadInvestigationDimension = keyof Lead['investigation'];

const PHASE_ZERO_DIMENSION_TASK_SUFFIX: Record<LeadInvestigationDimension, string> = {
  sector: '-sector',
  company: '-company',
  shareholder: '-shareholder',
  market: '-market',
};

function mapTaskStatusToInvestigationStatus(
  status: GameTask['status']
): Lead['investigation'][LeadInvestigationDimension] {
  if (status === 'completed') return 'completed';
  if (status === 'in_progress') return 'in_progress';
  return 'none';
}

function syncLeadsFromTasks(leads: Lead[], tasks: GameTask[]): Lead[] {
  return leads.map((lead) => {
    const nextInvestigation: Lead['investigation'] = { ...lead.investigation };

    (Object.keys(PHASE_ZERO_DIMENSION_TASK_SUFFIX) as LeadInvestigationDimension[]).forEach((dimension) => {
      if (lead.investigation[dimension] === 'completed') return;
      const taskId = `task-investigate-${lead.id}${PHASE_ZERO_DIMENSION_TASK_SUFFIX[dimension]}`;
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;
      nextInvestigation[dimension] = mapTaskStatusToInvestigationStatus(task.status);
    });

    return { ...lead, investigation: nextInvestigation };
  });
}

function normalizeResources(resources: PlayerResources): PlayerResources {
  const whole = (value: number) => Math.round(Number.isFinite(value) ? value : 0);
  return {
    ...resources,
    budget: Math.max(0, whole(resources.budget)),
    budgetMax: Math.max(0, whole(resources.budgetMax)),
    teamCapacity: Math.max(0, Math.min(whole(resources.teamCapacityMax), whole(resources.teamCapacity))),
    teamCapacityMax: Math.max(0, whole(resources.teamCapacityMax)),
    morale: Math.max(0, Math.min(100, whole(resources.morale))),
    clientTrust: Math.max(0, Math.min(100, whole(resources.clientTrust))),
    dealMomentum: Math.max(0, Math.min(100, whole(resources.dealMomentum))),
    riskLevel: Math.max(0, Math.min(100, whole(resources.riskLevel))),
    reputation: Math.max(0, Math.min(100, whole(resources.reputation))),
  };
}

const DEFAULT_PREFERRED_BUYER = 'Kestrel Capital';
const DEFAULT_FALLBACK_BUYER = 'Vektor Industries';
const SAVE_SCHEMA_VERSION = 7;

function hashIdentifier(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createActionRng(state: Pick<GameStore, 'rngSeed' | 'day' | 'week' | 'phase'>, action: string) {
  return createRng(deriveSeed(state.rngSeed, state.day, state.week, state.phase, hashIdentifier(action)));
}

function logCausalChange(action: string, details: Record<string, unknown>): void {
  const isLocalDevelopment = typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  if (isLocalDevelopment) {
    console.info(`[Rainmaker causal] ${action}`, details);
  }
}

function possessive(name: string): string {
  return name.endsWith('s') ? `${name}'` : `${name}'s`;
}

function replacePreferredBuyerText(text: string, preferredBuyerName: string): string {
  if (preferredBuyerName === DEFAULT_PREFERRED_BUYER) return text;

  const preferredToken = '__SELECTED_BUYER__';
  const preferredPossessiveToken = '__SELECTED_BUYER_POSSESSIVE__';
  let personalized = text
    .replaceAll(`${DEFAULT_PREFERRED_BUYER}'s`, preferredPossessiveToken)
    .replaceAll(DEFAULT_PREFERRED_BUYER, preferredToken)
    .replaceAll("Kestrel's", preferredPossessiveToken)
    .replace(/\bKestrel\b/g, preferredToken);

  // Phase 8 assumes Vektor is the warm fallback. If Vektor wins, swap Kestrel
  // into that role so the preferred bidder is never presented as its own backup.
  if (preferredBuyerName === DEFAULT_FALLBACK_BUYER) {
    personalized = personalized
      .replaceAll(`${DEFAULT_FALLBACK_BUYER}'s`, possessive(DEFAULT_PREFERRED_BUYER))
      .replaceAll(DEFAULT_FALLBACK_BUYER, DEFAULT_PREFERRED_BUYER)
      .replaceAll("Vektor's", possessive(DEFAULT_PREFERRED_BUYER))
      .replace(/\bVektor\b/g, DEFAULT_PREFERRED_BUYER);
  }

  return personalized
    .replaceAll(preferredPossessiveToken, possessive(preferredBuyerName))
    .replaceAll(preferredToken, preferredBuyerName);
}

function personalizeNarrativeValue<T>(value: T, preferredBuyerName: string): T {
  if (typeof value === 'string') {
    return replacePreferredBuyerText(value, preferredBuyerName) as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => personalizeNarrativeValue(item, preferredBuyerName)) as T;
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, personalizeNarrativeValue(item, preferredBuyerName)])
    ) as T;
  }
  return value;
}

function personalizePhaseContent(content: PhaseContent, preferredBuyerName?: string): PhaseContent {
  if (!preferredBuyerName || preferredBuyerName === DEFAULT_PREFERRED_BUYER) return content;
  return personalizeNarrativeValue(content, preferredBuyerName);
}

function replaceClientText(text: string, clientName?: string, companyName?: string): string {
  if (!companyName || companyName === 'Solara Systems') return text;
  const shortCompany = companyName.split(' ')[0];
  const firstName = clientName ? clientName.split(' ')[0] : 'Ricardo';

  return text
    .replaceAll('Solara Systems', companyName)
    .replaceAll('Solara', shortCompany)
    .replaceAll('Ricardo Mendes', clientName || 'Ricardo Mendes')
    .replaceAll('Ricardo', firstName);
}

function personalizeClientValue<T>(value: T, clientName?: string, companyName?: string): T {
  if (!companyName || companyName === 'Solara Systems') return value;
  if (typeof value === 'string') {
    return replaceClientText(value, clientName, companyName) as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => personalizeClientValue(item, clientName, companyName)) as T;
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, personalizeClientValue(item, clientName, companyName)])
    ) as T;
  }
  return value;
}

function personalizeClientContent(content: PhaseContent, clientName?: string, companyName?: string): PhaseContent {
  if (!companyName || companyName === 'Solara Systems') return content;
  return personalizeClientValue(content, clientName, companyName);
}

// ============================================
// Helper: generate Final Offers for Phase 7
// ============================================
function generateFinalOffers(
  buyers: import('../types/game').Buyer[],
  momentum: number,
  week: number,
  rngSeed: number,
  storyFlags: Record<string, string> = {},
): FinalOffer[] {
  const BASE_EV = 120; // €M Solara baseline
  const offers: FinalOffer[] = [];
  const rng = createRng(deriveSeed(rngSeed, week, Math.round(momentum), buyers.length, 7));

  for (const buyer of buyers) {
    if (['dropped', 'excluded'].includes(buyer.status)) continue;

    // EV range based on valuation posture
    const postureMultiplier =
      buyer.valuationPosture === 'aggressive' ? 1.12 :
      buyer.valuationPosture === 'fair' ? 1.02 : 0.93;

    // Momentum adds up to ±10%
    const momentumMod = (momentum - 50) / 500; // ±10% at extremes
    const goldenDriver = getGoldenMandateOfferDriver(buyer.id, storyFlags);
    const goldenModifier = buyer.id === 'buyer-01'
      ? storyFlags['golden-ricardo-stance'] === 'hold-process'
        ? 1.04
        : storyFlags['golden-ricardo-stance'] === 'private-lane'
          ? 0.97
          : 1
      : 1;
    const rawEV = BASE_EV * postureMultiplier * (1 + momentumMod) * goldenModifier;

    // Structure based on buyer type
    const structure: FinalOffer['structure'] =
      buyer.type === 'pe' ? (rng.nextBool(0.5) ? 'mixed' : 'earnout_heavy') :
      buyer.type === 'strategic' ? (rng.nextBool(0.6) ? 'full_cash' : 'mixed') :
      'full_cash';

    // Earnout based on structure
    const earnoutPct = structure === 'full_cash' ? 0 : structure === 'mixed' ? rng.nextFloat(0.15, 0.25) : rng.nextFloat(0.3, 0.45);
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

    const drivers = [
      buyer.valuationPosture === 'aggressive'
        ? 'Aggressive valuation posture supports the headline value.'
        : buyer.valuationPosture === 'fair'
          ? 'Fair valuation posture anchors the offer near the process range.'
          : 'Conservative valuation posture limits the headline value.',
      momentum >= 60
        ? 'Strong competitive momentum supports buyer urgency.'
        : momentum < 45
          ? 'Muted process momentum gives the buyer more room on price.'
          : 'Current process momentum keeps the offer near the core valuation range.',
      buyer.ddFriction === 'low'
        ? 'Low diligence friction supports cleaner conditionality.'
        : `Diligence friction drives ${conditionality.replace('_', ' ')}.`,
      ...(goldenDriver ? [goldenDriver] : []),
    ];

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
      drivers,
    });
  }

  // Sort by totalEV descending
  return offers.sort((a, b) => b.totalEV - a.totalEV);
}

// ============================================
// Helper: generate SPA buyer state
// ============================================
function generateSPABuyerState(
  buyer: import('../types/game').Buyer,
  rngSeed: number,
  day: number,
): SPABuyerState {
  const profile =
    buyer.type === 'pe' ? 'aggressive_buyer' :
    buyer.type === 'strategic' ? 'reasonable_buyer' : 'conservative_buyer';

  const base = {
    aggressive_buyer:  { cap: 35, escrow: 10, ps: 8, pc: 9, pe: 7, pi: 8 },
    reasonable_buyer:  { cap: 22, escrow: 6,  ps: 5, pc: 7, pe: 5, pi: 5 },
    conservative_buyer:{ cap: 15, escrow: 4,  ps: 3, pc: 5, pe: 4, pi: 3 },
  }[profile];

  const rng = createRng(deriveSeed(rngSeed, day, hashIdentifier(buyer.id), 8));
  const jitter = (n: number, range: number) => Math.round(n + rng.nextFloat(-range, range));

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
  round: number
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
  activeLeadId: 'lead-1',
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
  offerReveal: { status: 'completed', revealedBuyerIds: [] },
  preferredBidderId: null,
  spaNegotiation: null,
  agreedSPATerms: null,
  dataroomCategories: createInitialDataroomCategories(),
  phaseDeadline: null,
  pitchDocumentReady: false,
  preferredBidderConfirmed: false,
  phaseEntryDay: { 0: 1 },
  bindingOffersReceived: 0,
  unaddressedQACount: 0,
  weekPace: 'standard' as const,
  rngSeed: Date.now(),
  eventDirectorState: createInitialEventDirectorState(),
  activeMissionId: undefined,
  commitments: [],
  turnPlayback: null,
  lastResourceDeltas: [],
  showWeekReport: false,
  pendingReportAutoOpen: false,

  // Actions
  selectMissionFocus: (missionId: string) => set({ activeMissionId: missionId }),

  commitToAction: (taskId: string) => {
    const state = get();
    const task = state.tasks.find((t) => t.id === taskId);
    if (!task) return;

    if (task.status !== 'in_progress' && task.status !== 'completed') {
      state.startTask(taskId);
    }

    const newCommitment: ActionCommitment = {
      id: `commit-${taskId}-${state.day}`,
      actionId: taskId,
      actionName: task.name,
      startDay: state.day,
      expectedFinishDay: state.day + Math.max(1, Math.ceil(task.work / 3)),
      progress: task.progress ?? 0,
      workloadDays: Math.max(1, Math.ceil(task.work / 3)),
      linkedTaskId: taskId,
    };

    set((s) => ({
      commitments: [...s.commitments.filter((c) => c.linkedTaskId !== taskId), newCommitment],
    }));
  },
  commitAndAdvance: (taskId: string) => {
    const state = get();
    const task = state.tasks.find((candidate) =>
      candidate.id === taskId &&
      candidate.phase === state.phase &&
      (candidate.status === 'available' || candidate.status === 'recommended')
    );
    if (!task || state.resources.budget < task.cost || state.isWeekInProgress) return;

    // Keep the decision and its first visible consequence in one deliberate
    // action. Players can still use Commit only when they want to queue work.
    get().commitToAction(taskId);
    get().advanceWeek();
  },
  advanceWeek: () => {
    const state = get();

    // Determine how many days to advance before the next meaningful event
    const daysToAdvance = calcDaysToAdvance(state);

    // Run the week engine for the calculated number of days
    const result = resolveWeek(state, daysToAdvance);

    // Apply task status changes
    const updatedTasks = state.tasks.map((t) => {
      const completed = result.tasksCompleted.find((task) => task.id === t.id && task.phase === t.phase);
      if (completed) {
        return { ...t, status: 'completed' as const, progress: 100 };
      }
      const progressed = result.tasksProgressed.find((task) => task.id === t.id && task.phase === t.phase);
      if (progressed) return { ...t, progress: progressed.progress };
      return t;
    });

    if (result.newTasks && result.newTasks.length > 0) {
      updatedTasks.push(...result.newTasks);
    }

    // Unlock tasks whose dependencies are now met
    const unlockedTasks = unlockTasks(updatedTasks);

    // Fix 5: track pitch document readiness — set when task-15 (Prepare Pitch Deck) completes
    const pitchDocumentReady = state.pitchDocumentReady || result.tasksCompleted.some((t) => t.id === 'task-15');

    // Apply resource changes
    const newResources = { ...state.resources };
    for (const [key, value] of Object.entries(result.resourceChanges)) {
      if (value !== undefined) {
        (newResources as unknown as Record<string, number>)[key] = value as number;
      }
    }

    // Update only the current phase's active workstreams.
    const updatedWorkstreams = updatePhaseWorkstreamProgress(state.workstreams, unlockedTasks, state.phase);

    // Apply buyer progression from engine
    const updatedBuyers = (result._updatedBuyers && result._updatedBuyers.length > 0) ? result._updatedBuyers : state.buyers;

    const updatedBindingOffersReceived = state.bindingOffersReceived + (result.bindingOfferDelta ?? 0);

    // Add new risks, emails, headlines from engine and retire risks that no longer apply.
    const newRisks = retireObsoleteRisks([...state.risks, ...result.newRisks], state.phase, updatedBindingOffersReceived);
    const newEmails = [...state.emails, ...result.newEmails];
    const newHeadlines = [...state.headlines, ...result.newHeadlines];
    const newEvents = [...state.events, ...result.newEvents];

    // Create competitor threats from competing advisor events
    const isCompetitorEvent = (ev: GameEvent) =>
      ev.title?.includes('Competing Advisor') || ev.id?.includes('rivalpitch');
    const newCompetitorThreats = [...state.competitorThreats];
    for (const event of result.newEvents) {
      if (isCompetitorEvent(event)) {
        const advisorName = event.id?.includes('rivalpitch')
          ? 'Beacon Partners'
          : event.description?.includes('firm') ? 'Competing Advisory Firm' : 'Rival Advisor';
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

    // Process scheduled meetings
    const meetingCost = 5; // k€
    let totalMeetingCost = 0;
    const resolvedLeads = state.leads.map((l) => {
      if (l.meetingScheduled && !l.meetingDone) {
        totalMeetingCost += meetingCost;
        newQualNotes.push({
          id: `qn-${newDay}-${l.id}-intro`,
          week: newWeekNum,
          source: 'meeting',
          content: `Introductory meeting with ${l.founderName} (${l.companyName}). Client is receptive to our advisory approach.`,
          sentiment: 'positive',
        });
        return { ...l, meetingScheduled: false, meetingDone: true };
      }
      return l;
    });

    if (totalMeetingCost > 0) {
      newResources.budget = Math.max(0, newResources.budget - totalMeetingCost);
    }

    if (state.phase === 0) {
      // General macro tasks
      if (completedTaskIds.has('task-gen-02') && !newQualNotes.some((n) => n.content.includes('Market momentum'))) {
        newQualNotes.push({
          id: `qn-${newDay}-gen02`,
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
            id: `qn-${newDay}-${lead.id}-company`,
            week: newWeekNum,
            source: 'team_research',
            content: `Company screening complete for ${lead.companyName}. Financial profile and sector fit confirmed. Viable profile for a structured process.`,
            sentiment: 'positive',
          });
        }
        if (completedTaskIds.has(shareholderTaskId) && !newQualNotes.some((n) => n.content.includes(lead.companyName) && n.source === 'meeting')) {
          newQualNotes.push({
            id: `qn-${newDay}-${lead.id}-shareholder`,
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
      (alloc) => (
        (alloc.phase === undefined || alloc.phase === state.phase) &&
        completedTaskIds.has(alloc.taskId)
      )
    );
    const updatedTempAllocations = state.tempCapacityAllocations.filter(
      (alloc) => !releasedAllocations.some((released) => released.id === alloc.id)
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
      risks: newRisks,
      buyers: updatedBuyers,
      boardSubmission: resolvedBoardSub,
      qualificationNotes: newQualNotes,
      bindingOffersReceived: updatedBindingOffersReceived,
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

    // Attributable resource deltas for the turn tape and KPI chips
    const resourceDeltas = buildResourceDeltas(state.resources, normalizedResources, result);

    logCausalChange('advance', {
      phase: state.phase,
      fromDay: state.day,
      toDay: newDay,
      rng: result.rngTrace,
      tasksCompleted: result.tasksCompleted.map((task) => task.id),
      events: result.newEvents.map((event) => event.id),
      deltas: resourceDeltas,
    });

    // The Situation Report only auto-opens on major beats; routine turns play
    // out on the dashboard tape without blocking input.
    const wasGateReady = state.phaseGate?.canTransition ?? false;
    const autoOpenReport =
      (gate.canTransition && !wasGateReady) ||
      result.criticalOutcomes.length > 0 ||
      result.directorSignal.tensionBand === 'danger';

    set({
      day: newDay,
      week: newWeekNum,
      totalDays: state.totalDays + daysToAdvance,
      resources: normalizedResources,
      tasks: unlockedTasks,
      leads: syncLeadsFromTasks(resolvedLeads, unlockedTasks),
      workstreams: updatedWorkstreams,
      deliverables: syncDeliverables(state.deliverables, unlockedTasks),
      team: syncTeamLoad(state.team, unlockedTasks, state.phase),
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
      eventDirectorState: result.nextDirectorState || state.eventDirectorState,
      isWeekInProgress: true,
      savedAt: new Date().toISOString(),
      lastWeekResult: result,
      lastResourceDeltas: resourceDeltas,
      turnPlayback: { status: 'playing' as const, fromDay: state.day, toDay: newDay },
      showWeekReport: false,
      pendingReportAutoOpen: autoOpenReport && !collapse.collapsed && !isGameComplete,
      phaseGate: gate,
      pitchDocumentReady,
      bindingOffersReceived: updatedBindingOffersReceived,
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
    const newWorkstreams = state.workstreams;
    let newBuyers = state.buyers;
    let newClient = state.client;
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
    }

    if (nextPhase >= 1) {
      const rawPhaseContent = await loadPhaseContent(nextPhase as Exclude<PhaseId, 0>);
      const preferredBuyerName = state.preferredBidderId
        ? state.buyers.find((buyer) => buyer.id === state.preferredBidderId)?.name
        : undefined;

      const clientPersonalizedContent = personalizeClientContent(rawPhaseContent, newClient.name, newClient.companyName);
      const phaseContent = nextPhase >= 8
        ? personalizePhaseContent(clientPersonalizedContent, preferredBuyerName)
        : clientPersonalizedContent;

      newTasks = [...state.tasks, ...phaseContent.tasks];

      // Mark obsolete Phase 0 emails as read when advancing to Phase 1+
      const cleanedExistingEmails = state.emails.map((e) =>
        e.phase === 0 ? { ...e, state: 'read' as const } : e
      );

      newEmails = [...cleanedExistingEmails, ...stampEmails(phaseContent.emails)];
      newDeliverables = [...state.deliverables, ...phaseContent.deliverables];
      newRisks = [...state.risks, ...phaseContent.risks];
      newHeadlines = [...state.headlines, ...phaseContent.headlines];
      if (phaseContent.buyers) {
        newBuyers = [...state.buyers, ...phaseContent.buyers];
      }
    }
    const phaseSpent = Math.max(0, state.resources.budgetMax - state.resources.budget);
    const newTotalBudgetSpent = state.totalBudgetSpent + phaseSpent;
    const carryover = Math.max(0, state.resources.budget);
    const phaseBase = PHASE_BASE_BUDGETS[nextPhase] ?? 0;
    const newBudget = carryover + phaseBase;
    const newFinalOffers = nextPhase === 7
      ? generateFinalOffers(newBuyers, state.resources.dealMomentum, state.week + 1, state.rngSeed, state.eventDirectorState.storyFlags)
      : state.finalOffers;
    const nextOfferReveal: OfferRevealState = nextPhase === 7 && newFinalOffers.length > 0
      ? { status: 'pending', revealedBuyerIds: [] }
      : state.offerReveal;
    const nextBindingOffersReceived = nextPhase === 7 ? state.bindingOffersReceived : 0;
    const unlockedPhaseTasks = unlockTasks(newTasks);
    const phaseWorkstreams = updatePhaseWorkstreamProgress(newWorkstreams, unlockedPhaseTasks, nextPhase);
    const phaseRisks = retireObsoleteRisks(newRisks, nextPhase, nextBindingOffersReceived);
    const phaseDirectorState = {
      ...state.eventDirectorState,
      storyFlags: { ...(state.eventDirectorState.storyFlags ?? {}) },
      upcomingBeats: [],
    };
    const phaseProjection = {
      ...state,
      phase: nextPhase,
      tasks: unlockedPhaseTasks,
      resources: normalizeResources({ ...state.resources, budget: newBudget, budgetMax: newBudget }),
      client: newClient,
      buyers: newBuyers,
      risks: phaseRisks,
      phaseDeadline: null,
      eventDirectorState: phaseDirectorState,
    } as GameStore;
    set({
      phase: nextPhase,
      phaseEntryDay: { ...state.phaseEntryDay, [nextPhase]: state.day },
      tasks: unlockedPhaseTasks,
      emails: newEmails,
      deliverables: newDeliverables,
      risks: phaseRisks,
      headlines: newHeadlines,
      workstreams: phaseWorkstreams,
      buyers: newBuyers,
      team: syncTeamLoad(state.team, unlockedPhaseTasks, nextPhase),
      tempCapacityAllocations: [],
      client: newClient,
      phaseGate: null,
      resources: normalizeResources({
        ...state.resources,
        budget: newBudget,
        budgetMax: newBudget,
      }),
      totalBudgetSpent: newTotalBudgetSpent,
      phaseBudget: { phaseBase, carryover },
      eventDirectorState: {
        ...phaseDirectorState,
        upcomingBeats: buildUpcomingBeats(phaseProjection),
      },
      feeNegotiation: null,
      // agreedFeeTerms intentionally preserved — fee terms negotiated in Phase 1 must survive to resultsEngine
      phaseDeadline: null,
      pitchDocumentReady: false,
      bindingOffersReceived: nextBindingOffersReceived,
      unaddressedQACount: 0,
      finalOffers: newFinalOffers,
      offerReveal: nextOfferReveal,
      preferredBidderId: nextPhase === 7 ? null : state.preferredBidderId,
    });
  },

  debugJumpToPhase: async (targetPhase: PhaseId) => {
    const state = get();
    const baseBudget = PHASE_BASE_BUDGETS[targetPhase] ?? 100;

    const phase0Tasks = state.tasks.filter((t) => t.phase === 0).map((t) => ({ ...t }));
    let accumulatedTasks: GameTask[] = [...phase0Tasks];
    let accumulatedDeliverables: Deliverable[] = [];
    let accumulatedRisks: Risk[] = [];
    let accumulatedHeadlines: Headline[] = [];
    let currentBuyers: Buyer[] = [];

    let accumulatedEmails: Email[] = targetPhase === 0 ? [...initialEmails] : [];

    for (let p = 1; p <= targetPhase; p++) {
      const content = await loadPhaseContent(p as Exclude<PhaseId, 0>);
      accumulatedTasks = [...accumulatedTasks, ...content.tasks];
      accumulatedDeliverables = [...accumulatedDeliverables, ...content.deliverables];
      accumulatedRisks = [...accumulatedRisks, ...content.risks];
      accumulatedHeadlines = [...accumulatedHeadlines, ...content.headlines];
      if (content.emails) {
        const stamped = content.emails.map((e) => ({
          ...e,
          state: p < targetPhase ? ('read' as const) : e.state,
        }));
        accumulatedEmails = [...accumulatedEmails, ...stamped];
      }
      if (content.buyers) {
        currentBuyers = [...currentBuyers, ...content.buyers];
      }
    }

    const newTasks = accumulatedTasks.map((task) =>
      task.phase < targetPhase ? { ...task, status: 'completed' as const } : task,
    );
    const unlockedTasks = unlockTasks(newTasks);
    const newDeliverables = syncDeliverables(accumulatedDeliverables, unlockedTasks);
    const buyers = applyDebugBuyerState(currentBuyers, targetPhase);
    const day = targetPhase === 0 ? 1 : targetPhase * 20;
    const week = Math.max(1, Math.ceil(day / 7));
    const resources = normalizeResources({
      ...state.resources,
      budget: baseBudget,
      budgetMax: baseBudget,
      dealMomentum: targetPhase === 0 ? 25 : 50,
      clientTrust: targetPhase === 0 ? 40 : 60,
      riskLevel: targetPhase >= 6 ? 28 : 25,
      morale: 78,
    });
    const bindingOffersReceived = targetPhase >= 7 ? 1 : 0;
    const finalOffers = targetPhase >= 7 ? generateFinalOffers(buyers, resources.dealMomentum, week, state.rngSeed, state.eventDirectorState.storyFlags) : [];
    const risks = retireObsoleteRisks(accumulatedRisks, targetPhase, bindingOffersReceived);
    const workstreams = updatePhaseWorkstreamProgress(initialWorkstreams, unlockedTasks, targetPhase);
    const debugDirectorState = {
      ...state.eventDirectorState,
      storyFlags: {},
      upcomingBeats: [],
    };
    const debugProjection = {
      ...state,
      phase: targetPhase,
      day,
      week,
      resources,
      tasks: unlockedTasks,
      buyers,
      emails: accumulatedEmails,
      events: [],
      risks,
      phaseDeadline: null,
      eventDirectorState: debugDirectorState,
    } as GameStore;

    const newPhaseEntryDay: Partial<Record<number, number>> = {};
    for (let p = 0; p <= targetPhase; p++) {
      newPhaseEntryDay[p] = p === 0 ? 1 : p * 20;
    }

    set({
      phase: targetPhase,
      phaseEntryDay: newPhaseEntryDay,
      week,
      day,
      totalDays: day,
      resources,
      client: syncClient(state.client, resources),
      tasks: unlockedTasks,
      deliverables: newDeliverables,
      risks,
      headlines: accumulatedHeadlines,
      workstreams,
      buyers,
      phaseBudget: { phaseBase: baseBudget, carryover: 0 },
      emails: accumulatedEmails,
      events: [],
      qualificationNotes: targetPhase > 0 ? [{
        id: 'qn-debug-1',
        week,
        source: 'internal',
        content: 'Debug jump generated a baseline qualification memo.',
        sentiment: 'positive',
      }] : [],
      budgetRequests: [],
      boardSubmission: targetPhase > 0 ? {
        recommendation: 'proceed',
        rationale: 'Debug jump',
        status: 'approved',
        submittedWeek: 0,
        leadId: state.leads[0]?.id ?? 'lead1',
      } : null,
      feeNegotiation: null,
      agreedFeeTerms: targetPhase > 1 ? {
        retainerType: 'upfront',
        retainerAmount: 50,
        successFeePercent: 2.0,
        ratchetEnabled: true,
        ratchetThresholdEV: 100,
        ratchetBonusPercent: 5.0,
        totalFeeProjection: 2050,
        agreedWeek: 0,
      } : null,
      competitorThreats: [],
      phaseDeadline: null,
      pitchDocumentReady: targetPhase >= 1,
      bindingOffersReceived,
      unaddressedQACount: 0,
      finalOffers,
      eventDirectorState: {
        ...debugDirectorState,
        upcomingBeats: buildUpcomingBeats(debugProjection),
      },
      offerReveal: targetPhase === 7 && finalOffers.length > 0
        ? { status: 'pending', revealedBuyerIds: [] }
        : { status: 'completed', revealedBuyerIds: finalOffers.map((offer) => offer.buyerId) },
      preferredBidderId: targetPhase >= 8 ? 'buyer-03' : null,
      spaNegotiation: null,
      agreedSPATerms: null,
      dataroomCategories: createInitialDataroomCategories(),
      collapseReason: null,
      collapseHeadline: null,
      collapseDescription: null,
      gameComplete: false,
      phaseGate: null,
    });
  },

  debugJumpToCheckpoint: async (checkpointId) => {
    const checkpoint = REVIEW_CHECKPOINTS_BY_ID[checkpointId];
    if (!checkpoint) return;

    await get().debugJumpToPhase(checkpoint.phase);

    const state = get();
    const completedTaskIds = new Set(checkpoint.completedTaskIds ?? []);
    let tasks = unlockTasks(state.tasks.map((task) => (
      task.phase === checkpoint.phase && completedTaskIds.has(task.id)
        ? { ...task, status: 'completed' as const }
        : task
    )));
    const deliverables = syncDeliverables(state.deliverables, tasks);

    let buyers = state.buyers.map((buyer) => {
      const status = checkpoint.buyerStatuses?.[buyer.id];
      if (!status) return buyer;
      return {
        ...buyer,
        status,
        bindingOfferSubmitted: checkpoint.phase >= 7 ? !['dropped', 'excluded'].includes(status) : buyer.bindingOfferSubmitted,
      };
    });

    if (checkpoint.preferredBidderId) {
      buyers = buyers.map((buyer) => (
        buyer.id === checkpoint.preferredBidderId
          ? { ...buyer, status: 'preferred' as const }
          : buyer.status === 'preferred'
            ? { ...buyer, status: 'shortlisted' as const }
            : buyer
      ));
    }

    const resources = normalizeResources({
      ...state.resources,
      clientTrust: checkpoint.clientTrust ?? state.resources.clientTrust,
      dealMomentum: checkpoint.dealMomentum ?? state.resources.dealMomentum,
      riskLevel: checkpoint.riskLevel ?? state.resources.riskLevel,
    });

    const leadId = state.leads[0]?.id;
    const leads = state.leads.map((lead, index) => {
      if (index > 0) return lead;
      return {
        ...lead,
        meetingDone: checkpoint.leadMeetingDone ?? lead.meetingDone,
        investigation: checkpoint.leadInvestigated
          ? { sector: 'completed' as const, company: 'completed' as const, shareholder: 'completed' as const, market: 'completed' as const }
          : lead.investigation,
      };
    });

    const qualificationNotes = checkpoint.qualificationNotes
      ? Array.from({ length: checkpoint.qualificationNotes }, (_, index) => ({
          id: `qn-debug-${checkpoint.id}-${index}`,
          week: Math.max(1, Math.ceil(checkpoint.day / 7)),
          source: index === 0 ? 'team_research' as const : 'meeting' as const,
          content: index === 0
            ? 'Debug checkpoint: qualification research confirms a credible sell-side path.'
            : 'Debug checkpoint: founder meeting and qualification follow-up completed.',
          sentiment: 'positive' as const,
        }))
      : state.qualificationNotes;

    const checkpointWeek = Math.max(1, Math.ceil(checkpoint.day / 7));
    const agreedFeeTerms = checkpoint.feeAgreed ? { ...DEBUG_FEE_TERMS, agreedWeek: checkpointWeek } : state.agreedFeeTerms;
    const finalOffers = checkpoint.phase >= 7 ? generateFinalOffers(buyers, resources.dealMomentum, checkpointWeek, state.rngSeed, state.eventDirectorState.storyFlags) : [];
    const feeNegotiation = checkpoint.feeAgreed ? {
      phase: 1 as PhaseId,
      pitchPresented: true,
      status: 'agreed' as const,
      clientState: buildClientNegotiationState(deriveClientProfile(resources.clientTrust, qualificationNotes), state.client.valuationExpectationEV ?? 100),
      rounds: [],
      agreedTerms: agreedFeeTerms ?? undefined,
    } : state.feeNegotiation;
    const agreedSPATerms = checkpoint.spaAgreed ? { ...DEBUG_SPA_TERMS, agreedWeek: checkpointWeek } : state.agreedSPATerms;
    const bindingOffersReceived = checkpoint.bindingOffersReceived ?? state.bindingOffersReceived;
    const risks = retireObsoleteRisks(state.risks, checkpoint.phase, bindingOffersReceived);
    const workstreams = updatePhaseWorkstreamProgress(state.workstreams, tasks, checkpoint.phase);

    const spaNegotiation = checkpoint.phase >= 8 && checkpoint.preferredBidderId
      ? (() => {
          const preferredBuyer = buyers.find((buyer) => buyer.id === checkpoint.preferredBidderId);
          if (!preferredBuyer) return null;
          const buyerState = generateSPABuyerState(preferredBuyer, state.rngSeed, state.day);
          return {
            phase: checkpoint.phase,
            preferredBuyerId: checkpoint.preferredBidderId,
            status: checkpoint.spaAgreed ? 'agreed' as const : 'in_progress' as const,
            buyerState,
            rounds: [],
            agreedTerms: checkpoint.spaAgreed ? agreedSPATerms ?? undefined : undefined,
          };
        })()
      : null;

    if (checkpoint.spaAgreed && !spaNegotiation && checkpoint.preferredBidderId) {
      tasks = tasks.map((task) => (
        task.phase === 8 && task.id === 'task-109' ? { ...task, status: 'completed' as const } : task
      ));
    }

    set({
      phase: checkpoint.phase,
      day: checkpoint.day,
      totalDays: checkpoint.day,
      week: Math.max(1, Math.ceil(checkpoint.day / 7)),
      resources,
      client: syncClient(state.client, resources),
      leads,
      tasks,
      deliverables: syncDeliverables(deliverables, tasks),
      workstreams,
      buyers,
      risks,
      qualificationNotes,
      boardSubmission: checkpoint.boardApproved
        ? {
            recommendation: 'proceed',
            rationale: 'Gameplay review checkpoint',
            status: 'approved',
            submittedWeek: checkpointWeek,
            leadId,
          }
        : state.boardSubmission,
      agreedFeeTerms,
      feeNegotiation,
      pitchDocumentReady: checkpoint.pitchDocumentReady ?? state.pitchDocumentReady,
      phaseDeadline: checkpoint.phaseDeadlineDay ?? state.phaseDeadline,
      bindingOffersReceived,
      preferredBidderId: checkpoint.preferredBidderId ?? state.preferredBidderId,
      finalOffers,
      offerReveal: checkpoint.phase === 7 && finalOffers.length > 0
        ? { status: 'pending', revealedBuyerIds: [] }
        : { status: 'completed', revealedBuyerIds: finalOffers.map((offer) => offer.buyerId) },
      spaNegotiation,
      agreedSPATerms,
      dataroomCategories: createInitialDataroomCategories(),
      emails: [],
      events: [],
      weekSummary: null,
      lastWeekResult: null,
      turnPlayback: null,
      lastResourceDeltas: [],
      showWeekReport: false,
      pendingReportAutoOpen: false,
      phaseGate: checkPhaseGate({
        ...state,
        phase: checkpoint.phase,
        day: checkpoint.day,
        totalDays: checkpoint.day,
        week: Math.max(1, Math.ceil(checkpoint.day / 7)),
        resources,
        client: syncClient(state.client, resources),
        leads,
        tasks,
        deliverables: syncDeliverables(deliverables, tasks),
        workstreams,
        buyers,
        risks,
        qualificationNotes,
        boardSubmission: checkpoint.boardApproved
          ? {
              recommendation: 'proceed',
              rationale: 'Gameplay review checkpoint',
              status: 'approved',
              submittedWeek: checkpointWeek,
              leadId,
            }
          : state.boardSubmission,
        agreedFeeTerms,
        feeNegotiation,
        pitchDocumentReady: checkpoint.pitchDocumentReady ?? state.pitchDocumentReady,
        phaseDeadline: checkpoint.phaseDeadlineDay ?? state.phaseDeadline,
        bindingOffersReceived,
        preferredBidderId: checkpoint.preferredBidderId ?? state.preferredBidderId,
        finalOffers,
        spaNegotiation,
        agreedSPATerms,
      } as GameStore),
      collapseReason: null,
      collapseHeadline: null,
      collapseDescription: null,
      gameComplete: false,
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

    // Apply the effect exactly as promised. Narrative events can vary, but a
    // response label such as "+2 trust" must never resolve to a different number.
    let newResources = state.resources;
    if (response?.resourceEffects) {
      newResources = { ...state.resources };
      for (const [key, delta] of Object.entries(response.resourceEffects)) {
        const k = key as keyof PlayerResources;
        const current = newResources[k];
        if (typeof current === 'number' && typeof delta === 'number') {
          const maxVal = k === 'budget' ? newResources.budgetMax : k === 'teamCapacity' ? newResources.teamCapacityMax : 100;
          (newResources as unknown as Record<string, number>)[k] = Math.max(0, Math.min(maxVal, current + delta));
        }
      }
    }

    const normalizedResources = normalizeResources(newResources);
    const nextEmails = state.emails.map((e) =>
      e.id === emailId ? { ...e, state: 'resolved' as const } : e
    );
    const currentDirectorState = state.eventDirectorState ?? createInitialEventDirectorState();
    const nextDirectorState = {
      ...currentDirectorState,
      storyFlags: response?.storyDecision
        ? { ...(currentDirectorState.storyFlags ?? {}), [response.storyDecision.key]: response.storyDecision.value }
        : { ...(currentDirectorState.storyFlags ?? {}) },
    };
    const stateAfterResponse = {
      ...state,
      resources: normalizedResources,
      emails: nextEmails,
      eventDirectorState: nextDirectorState,
    } as GameStore;
    logCausalChange('email_response', {
      emailId,
      responseId,
      effects: response?.resourceEffects ?? {},
      storyDecision: response?.storyDecision,
    });

    return {
      resources: normalizedResources,
      emails: nextEmails,
      eventDirectorState: {
        ...nextDirectorState,
        upcomingBeats: buildUpcomingBeats(stateAfterResponse),
      },
    };
  }),

  startTask: (taskId) => set((state) => {
    const task = state.tasks.find((t) =>
      t.id === taskId &&
      t.phase === state.phase &&
      (t.status === 'available' || t.status === 'recommended')
    );
    if (!task || state.resources.budget < task.cost) return {};

    const updated = state.tasks.map((t) =>
      t.id === taskId && t.phase === state.phase && (t.status === 'available' || t.status === 'recommended')
        ? { ...t, status: 'in_progress' as const, progress: t.progress ?? 0 }
        : t
    );
    const unlockedUpdated = unlockTasks(updated);
    return {
      tasks: unlockedUpdated,
      resources: normalizeResources({
        ...state.resources,
        budget: Math.max(0, state.resources.budget - task.cost),
      }),
      leads: syncLeadsFromTasks(state.leads, unlockedUpdated),
      deliverables: syncDeliverables(state.deliverables, unlockedUpdated),
      team: syncTeamLoad(state.team, unlockedUpdated, state.phase),
    };
  }),

  completeTask: (taskId) => set((state) => {
    const updated = state.tasks.map((t) =>
      t.id === taskId && t.phase === state.phase && t.status === 'in_progress' ? { ...t, status: 'completed' as const, progress: 100 } : t
    );
    const unlockedUpdated = unlockTasks(updated);
    const updatedWorkstreams = updatePhaseWorkstreamProgress(state.workstreams, unlockedUpdated, state.phase);

    return {
      tasks: unlockedUpdated,
      leads: syncLeadsFromTasks(state.leads, unlockedUpdated),
      workstreams: updatedWorkstreams,
      deliverables: syncDeliverables(state.deliverables, unlockedUpdated),
      team: syncTeamLoad(state.team, unlockedUpdated, state.phase),
      pitchDocumentReady: state.pitchDocumentReady || taskId === 'task-15',
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
    const rng = createActionRng(state, `mitigation:${riskId}:${planId}`);

    let baseResources: PlayerResources = {
      ...state.resources,
      budget: state.resources.budget - plan.budgetCost,
      teamCapacity: state.resources.teamCapacity - plan.capacityCost,
    };

    const catastrophicFail =
      !!plan.catastrophicFailureChance && rng.nextBool(plan.catastrophicFailureChance);
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
          { id: `toast-mitigation-${riskId}-${planId}-${state.day}`, message: 'Mitigation backfired: client exited the process.', type: 'danger' as const },
        ],
      };
    }

    const success = rng.nextBool(plan.successChance);
    const effects = success ? plan.onSuccess : plan.onFailure;
    const { probabilityDelta = 0, ...resourceDeltas } = effects;

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
              probability: Math.round(nextRiskProbability),
              mitigated: success ? true : r.mitigated,
            }
          : r
      ),
      boardSubmission: boardSubmissionUpdate,
      toasts: [
        ...state.toasts,
        {
          id: `toast-mitigation-${riskId}-${planId}-${state.day}`,
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


  dismissWeekSummary: () => set({ showWeekReport: false, isWeekInProgress: false }),

  completeTurnPlayback: () => set((s) => ({
    turnPlayback: s.turnPlayback ? { ...s.turnPlayback, status: 'done' as const } : null,
    isWeekInProgress: false,
    showWeekReport: s.pendingReportAutoOpen ? true : s.showWeekReport,
    pendingReportAutoOpen: false,
  })),

  openWeekReport: () => set({ showWeekReport: true }),

  // ─── Phase Deadline ──────────────────────────────────────────────────────
  setPhaseDeadline: (weeks) => set((state) => ({
    phaseDeadline: state.day + weeks * 7,
  })),

  // ─── Budget ─────────────────────────────────────────────────────────────
  requestBudget: (amount, justification) => set((state) => ({
    budgetRequests: [
      ...state.budgetRequests,
      {
        id: `br-${state.day}-${state.budgetRequests.length + 1}`,
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
    const cost = INVESTIGATION_COST_K;

    const leadIndex = state.leads.findIndex((l) => l.id === leadId);
    if (leadIndex === -1) return {};

    // Guard: already investigated or in progress
    const currentStatus = state.leads[leadIndex].investigation[dimension];
    if (currentStatus === 'completed' || currentStatus === 'in_progress') return {};

    const updatedLeads = [...state.leads];
    // Investigation completes immediately — no phantom task dependency needed.
    updatedLeads[leadIndex] = {
      ...updatedLeads[leadIndex],
      investigation: {
        ...updatedLeads[leadIndex].investigation,
        [dimension]: 'completed' as const,
      },
    };

    const dimensionNames = {
      sector: 'Sector Dynamics',
      company: 'Company Fundamentals',
      shareholder: 'Shareholder Objectives',
      market: 'Market Read',
    };

    const newNote: QualificationNote = {
      id: `qn-${state.day}-${leadId}-${dimension}`,
      week: state.week,
      source: 'team_research',
      content: `${dimensionNames[dimension]} investigation complete for ${updatedLeads[leadIndex].companyName}. Findings look viable for a structured process.`,
      sentiment: 'neutral',
    };

    return {
      resources: normalizeResources({
        ...state.resources,
        budget: state.resources.budget - cost,
        teamCapacity: Math.max(0, state.resources.teamCapacity - INVESTIGATION_CAPACITY_COST),
      }),
      leads: updatedLeads,
      qualificationNotes: [...state.qualificationNotes, newNote],
      toasts: [
        ...state.toasts,
        {
          id: `toast-investigation-${state.day}-${leadId}-${dimension}`,
          message: `${dimensionNames[dimension]} investigation complete for ${updatedLeads[leadIndex].companyName}.`,
          type: 'success',
        },
      ],
    };
  }),

  scheduleMeeting: (leadId) => set((state) => {
    const leadIndex = state.leads.findIndex((l) => l.id === leadId);
    if (leadIndex === -1) return {};

    const updatedLeads = [...state.leads];
    updatedLeads[leadIndex] = {
      ...updatedLeads[leadIndex],
      meetingScheduled: true
    };

    return {
      leads: updatedLeads,
      toasts: [
        ...state.toasts,
        {
          id: `toast-meeting-${state.day}-${leadId}`,
          message: `Introductory meeting scheduled for ${updatedLeads[leadIndex].companyName}.`,
          type: 'success'
        }
      ]
    };
  }),

  addQualificationNote: (note) => set((state) => ({
    qualificationNotes: [
      ...state.qualificationNotes,
      { ...note, id: `qn-${state.day}-${state.qualificationNotes.length + 1}` },
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
      id: `tm-hired-${state.day}-${state.team.length + 1}`,
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
      id: `tca-${taskId}-${state.day}`,
      taskId,
      phase: state.phase,
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
  selectPreferredBidder: (buyerId, confirmed = false) => set((state) => {
    if (state.preferredBidderConfirmed) return {};
    if (state.preferredBidderId && !confirmed) return {};

    return {
      preferredBidderId: buyerId,
      preferredBidderConfirmed: confirmed,
      buyers: state.buyers.map((b) =>
        b.id === buyerId
          ? { ...b, status: 'preferred' as const }
          : b.status === 'preferred'
            ? { ...b, status: 'bidding' as const }
            : b
      ),
    };
  }),

  completeOfferReveal: (status, revealedBuyerIds) => set({
    offerReveal: { status, revealedBuyerIds },
  }),

  // SPA actions
  initSPANegotiation: () => set((state) => {
    const preferredBuyer = state.preferredBidderId
      ? state.buyers.find((b) => b.id === state.preferredBidderId)
      : null;
    if (!preferredBuyer) return {};
    const buyerState = generateSPABuyerState(preferredBuyer, state.rngSeed, state.day);
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

    const rawResult = evaluateSPARound(effectiveTerms, neg.buyerState, round);

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
    toasts: [...state.toasts, { id: `toast-${state.day}-${state.toasts.length + 1}`, message, type }],
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

  setWeekPace: (pace) => set({ weekPace: pace }),
}), {
  name: 'ma-rainmaker-save',
  version: SAVE_SCHEMA_VERSION,
  migrate: (persistedState: unknown, fromVersion: number) => {
    if (!persistedState || typeof persistedState !== 'object') {
      return undefined as unknown;
    }
    const s = { ...(persistedState as Record<string, unknown>) };
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
    if (fromVersion < 3) {
      const currentPhase = (s.phase as PhaseId | undefined) ?? 0;
      if (Array.isArray(s.tasks)) {
        s.tasks = (s.tasks as GameTask[]).map((task) => ({
          ...task,
          progress: task.status === 'completed' ? 100 : task.status === 'in_progress' ? 20 : task.progress,
        }));
      }
      if (Array.isArray(s.tempCapacityAllocations)) {
        s.tempCapacityAllocations = (s.tempCapacityAllocations as TempCapacityAllocation[]).map((allocation) => ({
          ...allocation,
          phase: allocation.phase ?? currentPhase,
        }));
      }
    }
    if (fromVersion < 4) {
      const currentPhase = (s.phase as PhaseId | undefined) ?? 0;
      const preferredBidderId = s.preferredBidderId as string | null | undefined;
      const preferredBuyerName = Array.isArray(s.buyers)
        ? (s.buyers as Buyer[]).find((buyer) => buyer.id === preferredBidderId)?.name
        : undefined;

      if (currentPhase >= 8 && preferredBuyerName && preferredBuyerName !== DEFAULT_PREFERRED_BUYER) {
        const personalizeLatePhaseItems = <T extends { phase: PhaseId }>(items: unknown): T[] | unknown => (
          Array.isArray(items)
            ? (items as T[]).map((item) => item.phase >= 8
              ? personalizeNarrativeValue(item, preferredBuyerName)
              : item)
            : items
        );

        s.tasks = personalizeLatePhaseItems<GameTask>(s.tasks);
        s.emails = personalizeLatePhaseItems<Email>(s.emails);
        s.deliverables = personalizeLatePhaseItems<Deliverable>(s.deliverables);
        if (Array.isArray(s.risks)) {
          s.risks = (s.risks as Risk[]).map((risk) => risk.surfacedPhase >= 8
            ? personalizeNarrativeValue(risk, preferredBuyerName)
            : risk);
        }
        if (Array.isArray(s.headlines)) {
          s.headlines = (s.headlines as Headline[]).map((headline) => headline.week >= 40
            ? personalizeNarrativeValue(headline, preferredBuyerName)
            : headline);
        }
      }
    }
    if (fromVersion < 5) {
      // Fluidity v2 introduced deterministic event-director state. Give
      // existing runs a stable, state-derived seed rather than discarding them.
      const day = typeof s.day === 'number' ? s.day : 1;
      const phase = typeof s.phase === 'number' ? s.phase : 0;
      if (typeof s.rngSeed !== 'number') {
        s.rngSeed = ((day * 73856093) ^ (phase * 19349663) ^ 0x1f123bb5) >>> 0;
      }
      if (!s.eventDirectorState || typeof s.eventDirectorState !== 'object') {
        s.eventDirectorState = createInitialEventDirectorState();
      }
      if (!Array.isArray(s.commitments)) s.commitments = [];
    }
    if (fromVersion < 7) {
      const savedDirector = s.eventDirectorState && typeof s.eventDirectorState === 'object'
        ? s.eventDirectorState as Partial<EventDirectorState>
        : {};
      s.eventDirectorState = {
        ...createInitialEventDirectorState(),
        ...savedDirector,
        upcomingBeats: Array.isArray(savedDirector.upcomingBeats) ? savedDirector.upcomingBeats : [],
        storyFlags: savedDirector.storyFlags && typeof savedDirector.storyFlags === 'object' ? savedDirector.storyFlags : {},
      };
      if (!s.offerReveal || typeof s.offerReveal !== 'object') {
        const existingOffers = Array.isArray(s.finalOffers) ? s.finalOffers as FinalOffer[] : [];
        s.offerReveal = { status: 'completed', revealedBuyerIds: existingOffers.map((offer) => offer.buyerId) };
      }
    }
    if (fromVersion < SAVE_SCHEMA_VERSION && s.resources && typeof s.resources === 'object') {
      // M0 makes all visible resource values integer-valued at the engine
      // boundary. Migrate existing fractional saves once, rather than showing
      // a mixed-format run after upgrade.
      s.resources = normalizeResources(s.resources as PlayerResources);
    }
    return s;
  },
  merge: (persistedState: unknown, currentState: GameStore) => {
    const merged = {
      ...currentState,
      ...(persistedState as Partial<GameStore>),
    };
    if (merged.day !== undefined) {
      merged.week = Math.ceil(merged.day / 7);
    }
    return merged;
  },
  partialize: (state) => {
    // Exclude transient UI state from persistence
    const {
      lastWeekResult, phaseGate, isWeekInProgress, toasts, week,
      turnPlayback, lastResourceDeltas, showWeekReport, pendingReportAutoOpen,
      ...persisted
    } = state;
    void lastWeekResult; void phaseGate; void isWeekInProgress; void toasts; void week;
    void turnPlayback; void lastResourceDeltas; void showWeekReport; void pendingReportAutoOpen;
    return persisted;
  },
}));
