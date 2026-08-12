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
  MandateDifficultyProfile,
  ProcessRecord,
  ProcessScoringModel,
  ReplayTraceEntry,
  ApexCeremonyState,
} from '../types/game';
import type { ActionCommitment } from '../types/dealBeat';
import { createInitialEventDirectorState } from '../engine/eventDirector';
import { buildResourceDeltas } from '../engine/resourceDeltas';
import { assessBoardCase } from '../engine/boardCase';
import { createRng, deriveSeed } from '../engine/rng';
import { resolveWeek, checkPhaseGate, unlockTasks, checkDealCollapse, calcDaysToAdvance, buildUpcomingBeats } from '../engine/weekEngine';
import type { WeekResult, PhaseGateResult } from '../engine/weekEngine';
import { getGoldenMandateOfferDriver } from '../engine/goldenMandate';
import { getPeopleOfferDriver } from '../engine/peopleBeats';
import { getArchetype, type ArchetypeAbilityUse, type ArchetypeId } from '../content/archetypes';
import {
  consumePendingMandate,
  getFirstMandatePhase,
  getNextMandatePhase,
  getSkippedMandatePhases,
} from '../content/mandates';
import { PHASE_BASE_BUDGETS, STAFF_PROFILES, CONTRACTOR_PROFILES, MITIGATION_ACTIONS } from '../config/phaseBudgets';
import { getRiskMitigationPlans } from '../config/riskMitigation';
import { REVIEW_CHECKPOINTS_BY_ID } from '../config/reviewCheckpoints';
import { retireObsoleteRisks, updatePhaseWorkstreamProgress } from '../utils/gameplayState';
import { CONTENT_VERSION } from '../content/contentVersion';
import {
  DEFAULT_MANDATE_DIFFICULTY,
  appendProcessRecord,
  appendProcessRecords,
  reactionRating,
} from '../engine/processScoring';
import { deriveDealMomentum, explainDealMomentumChange } from '../engine/dealMomentum';
import { appendReplayTrace } from '../engine/replayTrace';
import { getRoutineEmails, getRoutineTasks } from '../utils/friction';
import { getArchetypeOfferDriver, getArchetypeOfferModifier, resolveArchetypeAbility } from '../engine/archetypeAbilities';

import { loadPhaseContent, type PhaseContent } from '../content/loadPhaseContent';
import {
  createTargetLeads,
  deriveTargetNarrativeId,
  getTargetNarrative,
  getTargetNarrativeForLead,
  personalizeTargetNarrativeValue,
  type TargetNarrativeId,
} from '../content/targetNarratives';

// ============================================
// Phase 0 Origination Constants
// ============================================
export const INVESTIGATION_COST_K = 0; // kEUR per investigation dimension - research uses capacity, not budget
export const INVESTIGATION_CAPACITY_COST = 4; // % team capacity per investigation dimension

// ============================================
// Initial Phase 0: Deal Origination Seed Data
// ============================================

// M5a: a mandate chosen on the market travels through a reload and is
// consumed exactly once when the fresh run initialises.
const pendingMandate = typeof window !== 'undefined' ? consumePendingMandate() : null;
const pendingArchetype = getArchetype(pendingMandate?.advisorArchetype);

const initialResources: PlayerResources = {
  budget: PHASE_BASE_BUDGETS[0],
  budgetMax: PHASE_BASE_BUDGETS[0],
  teamCapacity: 90,
  teamCapacityMax: 100,
  morale: 80,
  clientTrust: 40 + (pendingArchetype?.startClientTrust ?? 0),
  dealMomentum: 25,
  riskLevel: 10,
  reputation: Math.min(60, 40 + (pendingMandate?.careerReputationBonus ?? 0) + (pendingArchetype?.startReputation ?? 0)),
};

const initialClient: Client = { ...getTargetNarrative('solara').client };

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
    body: 'We are behind on our origination targets for this quarter. I need you to secure a new sell-side mandate within the next few weeks to close the gap.\n\nDeal Origination has surfaced three credible founder-led opportunities across industrial software, diagnostic technology and warehouse automation. Each has a different execution risk and buyer universe. I\'ve already briefed the team.\n\nYou have a €50k origination budget. Qualify the targets, choose the opportunity you believe we can win, and come back to me with a recommendation. Move fast — the window is open now.',
    preview: 'Three founder-led opportunities are ready for qualification.',
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
    id: 'risk-1', name: 'Founder Commitment Untested',
    description: 'The selected founder may be testing the market rather than genuinely committed to a sale process. Qualification must separate curiosity from readiness.',
    category: 'client', severity: 'medium', probability: 35, mitigated: false, surfacedWeek: 1, surfacedPhase: 0,
  },
];

const initialHeadlines: Headline[] = [
  { id: 'hl-1', week: 1, text: 'PE financing spreads tighten again across Europe.', category: 'macro' },
  { id: 'hl-2', week: 1, text: 'Founder-led technology assets draw strategic interest across Europe.', category: 'sector' },
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

const ACCEPTED_MANDATE_FEE_TERMS: FeeTerms = {
  retainerType: 'upfront',
  retainerAmount: 50,
  successFeePercent: 2,
  ratchetEnabled: true,
  ratchetThresholdEV: 100,
  ratchetBonusPercent: 5,
  totalFeeProjection: 2050,
  agreedWeek: 1,
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
  expectedEV: number,
  patienceBonus = 0,
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
    patienceRemaining: 100 + patienceBonus,
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

const initialLeads: Lead[] = createTargetLeads();

export interface GameStore {
  phase: PhaseId;
  day: number;
  totalDays: number;
  week: number;
  
  // Phase 0 Mechanics
  leads: Lead[];
  activeLeadId?: string;
  /** Narrative/economic campaign locked by the selected Phase 0 target. */
  targetNarrativeId: TargetNarrativeId;
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
  /** IC rejections this run — drives the resubmission pity ladder. */
  boardRejectionCount: number;
  /** Run identity chosen at start; null on legacy saves (no modifiers). */
  advisorArchetype: ArchetypeId | null;
  /** The single disclosed active build action, once used in this mandate. */
  archetypeAbilityUse: ArchetypeAbilityUse | null;
  tempCapacityAllocations: TempCapacityAllocation[];
  feeNegotiation: FeeNegotiation | null;
  agreedFeeTerms: FeeTerms | null;
  competitorThreats: CompetitorThreat[];
  toasts: Toast[];
  finalOffers: FinalOffer[];
  offerReveal: OfferRevealState;
  apexCeremonies: ApexCeremonyState;
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
  contentVersion: string;
  scoringModelVersion: ProcessScoringModel;
  mandateDifficulty: MandateDifficultyProfile;
  /** Which market engagement this run is (M5a). */
  mandateId: string;
  /** Daily runs are mechanically isolated from the career progression layer. */
  runMode: 'career' | 'daily' | 'challenge';
  dailyKey: string | null;
  dailySeason: string | null;
  challengeCode: string | null;
  challengeSeason: string | null;
  challengeAttemptId: string | null;
  startingReputationBonus: number;
  processLog: ProcessRecord[];
  replayTrace: ReplayTraceEntry[];

  // Turn playback (non-blocking live turn) — transient, not persisted
  turnPlayback: { status: 'playing' | 'done'; fromDay: number; toDay: number } | null;
  lastResourceDeltas: ResourceDelta[];
  showWeekReport: boolean;
  pendingReportAutoOpen: boolean;

  // GameActions
  selectMissionFocus: (missionId: string) => void;
  commitToAction: (taskId: string) => void;
  commitAndAdvance: (taskId: string) => void;
  startMandate: () => Promise<void>;
  advanceWeek: () => void;
  advancePhase: () => Promise<void>;
  debugJumpToPhase: (targetPhase: PhaseId) => Promise<void>;
  debugJumpToCheckpoint: (checkpointId: string) => Promise<void>;
  updateResources: (partial: Partial<PlayerResources>) => void;
  markEmailRead: (emailId: string) => void;
  acknowledgeRoutineEmails: () => void;
  flagEmail: (emailId: string) => void;
  escalateEmail: (emailId: string) => void;
  respondToEmail: (emailId: string, responseId: string) => void;
  startTask: (taskId: string) => void;
  queueRoutineTasks: () => void;
  completeTask: (taskId: string) => void;
  mitigateRisk: (riskId: string) => void;
  executeRiskMitigationPlan: (riskId: string, planId: string) => void;
  setPlayerName: (name: string) => void;
  selectArchetype: (id: ArchetypeId) => void;
  useArchetypeAbility: () => void;
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
  selectActiveLead: (leadId: string) => void;
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
  completeApexCeremony: (status: 'completed' | 'skipped') => void;
  // Dataroom
  setDataroomAccess: (categoryId: string, level: DataroomAccessLevel) => void;
  // SPA
  initSPANegotiation: () => void;
  submitSPARound: (terms: Pick<SPARound, 'playerWarrantyScope' | 'playerWarrantyCap' | 'playerEscrowPercent' | 'playerSpecificIndemnity'>) => void;
  acceptSPATerms: () => void;
  setWeekPace: (pace: 'sprint' | 'standard' | 'deliberate') => void;
}

// ============================================
// Helper: archetype modifiers on authored tasks
// ============================================
function applyArchetypeToTasks(tasks: GameTask[], archetypeId: ArchetypeId | null): GameTask[] {
  const archetype = getArchetype(archetypeId);
  if (!archetype || archetype.deliverableWorkFactor === 1) return tasks;
  return tasks.map((task) => task.category === 'deliverable'
    ? { ...task, work: Math.max(1, Math.round(task.work * archetype.deliverableWorkFactor)) }
    : task);
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

function applyArchetypeBuyerChemistry(buyers: Buyer[], archetypeId: ArchetypeId | null): Buyer[] {
  const chemistryBonus = getArchetype(archetypeId)?.startBuyerChemistry ?? 0;
  if (chemistryBonus === 0) return buyers;
  return buyers.map((buyer) => ({
    ...buyer,
    chemistryWithSeller: Math.min(100, buyer.chemistryWithSeller + chemistryBonus),
  }));
}

function bridgeBuyersAcrossSkippedPhases(buyers: Buyer[], skippedPhases: PhaseId[]): Buyer[] {
  const skipsShortlist = skippedPhases.includes(4);
  const skipsDiligence = skippedPhases.includes(6);

  return buyers.map((buyer) => {
    let next = { ...buyer };
    if (skipsShortlist && next.status === 'active') {
      next = next.executionCredibility >= 70 || next.interest === 'hot' || next.interest === 'on_fire'
        ? { ...next, status: 'shortlisted' }
        : { ...next, status: 'excluded' };
    }
    if (skipsDiligence && next.status === 'shortlisted') {
      next = { ...next, status: 'bidding', bindingOfferSubmitted: true };
    }
    return next;
  });
}

const DEFAULT_PREFERRED_BUYER = 'Kestrel Capital';
const DEFAULT_FALLBACK_BUYER = 'Vektor Industries';
const SAVE_SCHEMA_VERSION = 16;

function hashIdentifier(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createActionRng(state: Pick<GameStore, 'rngSeed' | 'day' | 'week' | 'phase'>, action: string) {
  const seed = deriveSeed(state.rngSeed, state.day, state.week, state.phase, hashIdentifier(action));
  return { rng: createRng(seed), seed };
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

// ============================================
// Helper: generate Final Offers for Phase 7
// ============================================
function generateFinalOffers(
  buyers: import('../types/game').Buyer[],
  momentum: number,
  week: number,
  rngSeed: number,
  targetNarrativeId: TargetNarrativeId,
  storyFlags: Record<string, string> = {},
): FinalOffer[] {
  const targetProfile = getTargetNarrative(targetNarrativeId);
  const BASE_EV = targetProfile.baseEV;
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
    const peopleDriver = getPeopleOfferDriver(buyer.id, storyFlags);
    const goldenModifier = buyer.id === 'buyer-01'
      ? storyFlags['golden-ricardo-stance'] === 'hold-process'
        ? 1.04
        : storyFlags['golden-ricardo-stance'] === 'private-lane'
          ? 0.97
          : 1
      : 1;
    const sharkModifier = getArchetypeOfferModifier(storyFlags);
    const archetypeDriver = getArchetypeOfferDriver(storyFlags);
    const rawEV = BASE_EV * postureMultiplier * (1 + momentumMod) * goldenModifier * sharkModifier;

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
      ...(peopleDriver ? [peopleDriver] : []),
      ...(archetypeDriver ? [archetypeDriver] : []),
    ];

    offers.push(personalizeTargetNarrativeValue({
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
      impliedMultiple: Math.round((totalEV / targetProfile.earningsBase) * 10) / 10,
      advisorNote: note,
      drivers,
    }, targetProfile));
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
  patienceBonus = 0,
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
    patienceRemaining: 100 + patienceBonus,
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

export const useGameStore = create<GameStore>()(persist((rawSet, get) => {
  // All action-driven state changes rematerialise momentum from the resulting
  // deal state. Explicit `dealMomentum` deltas in legacy content are ignored.
  const set = (partial: Partial<GameStore> | ((state: GameStore) => Partial<GameStore>)) => {
    rawSet((state) => {
      const patch = typeof partial === 'function' ? partial(state) : partial;
      const candidate = {
        ...state,
        ...patch,
        resources: { ...state.resources, ...(patch.resources ?? {}) },
      } as GameStore;
      return {
        ...patch,
        resources: {
          ...candidate.resources,
          dealMomentum: deriveDealMomentum(candidate),
        },
      };
    });
  };

  return ({
  // State
  phase: 0 as PhaseId,
  day: 1,
  week: 1,
  totalDays: 1,
  leads: initialLeads,
  activeLeadId: 'lead-1',
  targetNarrativeId: 'solara',
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
  boardRejectionCount: 0,
  advisorArchetype: pendingMandate?.advisorArchetype ?? null,
  archetypeAbilityUse: null,
  tempCapacityAllocations: [],
  feeNegotiation: null,
  agreedFeeTerms: null,
  competitorThreats: [],
  toasts: [],
  finalOffers: [],
  offerReveal: { status: 'completed', revealedBuyerIds: [] },
  apexCeremonies: { pending: null, history: [] },
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
  rngSeed: pendingMandate?.seed ?? Date.now(),
  eventDirectorState: createInitialEventDirectorState(),
  activeMissionId: undefined,
  commitments: [],
  contentVersion: CONTENT_VERSION,
  scoringModelVersion: 'causal-v2' as const,
  mandateDifficulty: pendingMandate?.difficulty ?? DEFAULT_MANDATE_DIFFICULTY,
  mandateId: pendingMandate?.id ?? 'solara-flagship',
  runMode: pendingMandate?.runMode ?? 'career',
  dailyKey: pendingMandate?.dailyKey ?? null,
  dailySeason: pendingMandate?.dailySeason ?? null,
  challengeCode: pendingMandate?.challengeCode ?? null,
  challengeSeason: pendingMandate?.challengeSeason ?? null,
  challengeAttemptId: pendingMandate?.challengeAttemptId ?? null,
  startingReputationBonus: pendingMandate?.startingReputationBonus ?? pendingMandate?.careerReputationBonus ?? 0,
  processLog: [],
  replayTrace: [],
  turnPlayback: null,
  lastResourceDeltas: [],
  showWeekReport: false,
  pendingReportAutoOpen: false,

  // Actions
  selectMissionFocus: (missionId: string) => set({ activeMissionId: missionId }),

  startMandate: async () => {
    const state = get();
    const firstPhase = getFirstMandatePhase(state.mandateId);
    if (state.phase !== 0 || firstPhase === 0) return;
    await get().advancePhase();
  },

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
          targetId: l.id,
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
            targetId: lead.id,
            source: 'team_research',
            content: `Company screening complete for ${lead.companyName}. Financial profile and sector fit confirmed. Viable profile for a structured process.`,
            sentiment: 'positive',
          });
        }
        if (completedTaskIds.has(shareholderTaskId) && !newQualNotes.some((n) => n.content.includes(lead.companyName) && n.source === 'meeting')) {
          newQualNotes.push({
            id: `qn-${newDay}-${lead.id}-shareholder`,
            week: newWeekNum,
            targetId: lead.id,
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
    const nextBoardRejectionCount =
      result.resolvedBoardSubmission && !result.resolvedBoardSubmission.approved
        ? state.boardRejectionCount + 1
        : state.boardRejectionCount;

    newResources.dealMomentum = deriveDealMomentum({
      ...state,
      tasks: unlockedTasks,
      resources: newResources,
      risks: newRisks,
      buyers: updatedBuyers,
      competitorThreats: newCompetitorThreats,
      boardSubmission: resolvedBoardSub,
    });

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
    const processLog = appendProcessRecords(
      state.processLog,
      result.tasksCompleted
        .filter((task) => !task.isBackgroundTask)
        .map((task) => ({
          day: newDay,
          phase: state.phase,
          category: 'execution' as const,
          rating: task.deadline === undefined || newWeekNum <= task.deadline ? 1 : 0.4,
          weight: task.complexity === 'high' ? 3 as const : task.complexity === 'medium' ? 2 as const : 1 as const,
          sourceType: 'task' as const,
          sourceId: task.id,
          headline: `Delivered: ${task.name}`,
          explanation: task.deadline === undefined || newWeekNum <= task.deadline
            ? 'Completed with the committed work still relevant to the live process.'
            : 'Completed after its decision window, limiting its usefulness to the process.',
        })),
    );

    // Attributable resource deltas for the turn tape and KPI chips
    const resourceDeltas = buildResourceDeltas(state.resources, normalizedResources, result).map((delta) =>
      delta.resource === 'dealMomentum'
        ? { ...delta, reason: explainDealMomentumChange(state, nextState), sourceEntity: 'Live deal state' }
        : delta
    );
    const replayTrace = appendReplayTrace(state.replayTrace, {
      day: state.day,
      phase: state.phase,
      action: 'advance',
      input: { days: daysToAdvance, pace: state.weekPace },
      rng: result.rngTrace,
      resourceDeltas,
      sources: [
        ...result.tasksCompleted.map((task) => `task:${task.id}`),
        ...result.newEvents.map((event) => `event:${event.id}`),
        ...result.newEmails.map((email) => `email:${email.id}`),
      ],
    });

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

    const currentCeremonies = state.apexCeremonies ?? { pending: null, history: [] };
    const nextApexCeremonies: ApexCeremonyState = collapse.collapsed
      ? currentCeremonies
      : isGameComplete
        ? {
            ...currentCeremonies,
            pending: {
              id: `closing-${state.mandateId}-${state.rngSeed}`,
              type: 'closing',
              day: newDay,
              phase: 10,
            },
          }
        : result.resolvedBoardSubmission
          ? {
              ...currentCeremonies,
              pending: {
                id: `board-${state.rngSeed}-${state.boardRejectionCount + 1}`,
                type: 'board',
                day: newDay,
                phase: 0,
                outcome: result.resolvedBoardSubmission.approved ? 'approved' : 'rejected',
              },
            }
          : currentCeremonies;

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
      boardRejectionCount: nextBoardRejectionCount,
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
      processLog,
      replayTrace,
      phaseGate: gate,
      apexCeremonies: nextApexCeremonies,
      pitchDocumentReady,
      bindingOffersReceived: updatedBindingOffersReceived,
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
    const nextPhase = getNextMandatePhase(state.mandateId, state.phase);
    if (nextPhase === null) return;
    const skippedPhases = getSkippedMandatePhases(state.mandateId, state.phase, nextPhase);
    const isCompressedBootstrap = state.phase === 0 && nextPhase > 1;
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
    let newTasks = isCompressedBootstrap ? [] : state.tasks;
    let newEmails = isCompressedBootstrap ? [] : state.emails;
    let newDeliverables = isCompressedBootstrap ? [] : state.deliverables;
    let newRisks = isCompressedBootstrap ? [] : state.risks;
    let newHeadlines = isCompressedBootstrap ? [] : state.headlines;
    const newWorkstreams = state.workstreams;
    let newBuyers = isCompressedBootstrap ? [] : state.buyers;
    let newClient = state.client;
    let nextTargetNarrativeId = isCompressedBootstrap ? 'solara' as const : state.targetNarrativeId;
    if (nextPhase === 1) {
      if (state.boardSubmission?.leadId) {
        const targetProfile = getTargetNarrativeForLead(state.boardSubmission.leadId);
        nextTargetNarrativeId = targetProfile.id;
        newClient = { ...targetProfile.client };
      }
    }
    const targetProfile = getTargetNarrative(nextTargetNarrativeId);

    if (isCompressedBootstrap) {
      // This engagement is already mandated and prepared. Carry the authored
      // buyer universe into the first playable stage, but never award process
      // credit for the phases the player did not operate.
      const preparationContent = await loadPhaseContent(2);
      const targetPreparation = personalizeTargetNarrativeValue(preparationContent, targetProfile);
      newBuyers = applyArchetypeBuyerChemistry(targetPreparation.buyers ?? [], state.advisorArchetype);
    }

    if (nextPhase >= 1) {
      const rawPhaseContent = await loadPhaseContent(nextPhase as Exclude<PhaseId, 0>);
      const preferredBuyerName = state.preferredBidderId
        ? state.buyers.find((buyer) => buyer.id === state.preferredBidderId)?.name
        : undefined;

      const bidderPersonalizedContent = nextPhase >= 8
        ? personalizePhaseContent(rawPhaseContent, preferredBuyerName)
        : rawPhaseContent;
      const phaseContent = personalizeTargetNarrativeValue(bidderPersonalizedContent, targetProfile);

      newTasks = [...newTasks, ...applyArchetypeToTasks(phaseContent.tasks, state.advisorArchetype)];

      // Mark obsolete Phase 0 emails as read when advancing to Phase 1+
      const cleanedExistingEmails = newEmails.map((e) =>
        e.phase === 0 ? { ...e, state: 'read' as const } : e
      );

      newEmails = [...cleanedExistingEmails, ...stampEmails(phaseContent.emails)];
      newDeliverables = [...newDeliverables, ...phaseContent.deliverables];
      newRisks = [...newRisks, ...phaseContent.risks];
      newHeadlines = [...newHeadlines, ...phaseContent.headlines];
      if (phaseContent.buyers) {
        const incoming = applyArchetypeBuyerChemistry(phaseContent.buyers, state.advisorArchetype);
        newBuyers = [...newBuyers, ...incoming];
      }
    }
    newBuyers = bridgeBuyersAcrossSkippedPhases(newBuyers, skippedPhases);
    const phaseSpent = isCompressedBootstrap ? 0 : Math.max(0, state.resources.budgetMax - state.resources.budget);
    const newTotalBudgetSpent = isCompressedBootstrap ? 0 : state.totalBudgetSpent + phaseSpent;
    const carryover = isCompressedBootstrap ? 0 : Math.max(0, state.resources.budget);
    const phaseBase = PHASE_BASE_BUDGETS[nextPhase] ?? 0;
    const newBudget = carryover + phaseBase;
    const newFinalOffers = nextPhase === 7
      ? generateFinalOffers(newBuyers, state.resources.dealMomentum, state.week + 1, state.rngSeed, nextTargetNarrativeId, state.eventDirectorState.storyFlags)
      : state.finalOffers;
    const nextOfferReveal: OfferRevealState = nextPhase === 7 && newFinalOffers.length > 0
      ? { status: 'pending', revealedBuyerIds: [] }
      : state.offerReveal;
    const nextBindingOffersReceived = nextPhase === 7
      ? (skippedPhases.includes(6) ? newFinalOffers.length : state.bindingOffersReceived)
      : 0;
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
      targetNarrativeId: nextTargetNarrativeId,
      buyers: newBuyers,
      risks: phaseRisks,
      phaseDeadline: null,
      eventDirectorState: phaseDirectorState,
      boardSubmission: isCompressedBootstrap ? {
        recommendation: 'proceed',
        rationale: 'Mandate accepted from the career market.',
        status: 'approved',
        submittedWeek: 1,
        leadId: state.leads[0]?.id,
      } : state.boardSubmission,
      agreedFeeTerms: isCompressedBootstrap ? ACCEPTED_MANDATE_FEE_TERMS : state.agreedFeeTerms,
    } as GameStore;
    const nextApexCeremonies: ApexCeremonyState = nextPhase === 10
      ? {
          ...(state.apexCeremonies ?? { pending: null, history: [] }),
          pending: {
            id: `signing-${state.mandateId}-${state.rngSeed}`,
            type: 'signing',
            day: state.day,
            phase: 10,
          },
        }
      : state.apexCeremonies;
    set({
      phase: nextPhase,
      phaseEntryDay: isCompressedBootstrap
        ? { [nextPhase]: state.day }
        : { ...state.phaseEntryDay, [nextPhase]: state.day },
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
      targetNarrativeId: nextTargetNarrativeId,
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
      agreedFeeTerms: isCompressedBootstrap ? ACCEPTED_MANDATE_FEE_TERMS : state.agreedFeeTerms,
      boardSubmission: isCompressedBootstrap ? {
        recommendation: 'proceed',
        rationale: 'Mandate accepted from the career market.',
        status: 'approved',
        submittedWeek: 1,
        leadId: state.leads[0]?.id,
      } : state.boardSubmission,
      phaseDeadline: null,
      pitchDocumentReady: isCompressedBootstrap,
      bindingOffersReceived: nextBindingOffersReceived,
      unaddressedQACount: 0,
      finalOffers: newFinalOffers,
      offerReveal: nextOfferReveal,
      apexCeremonies: nextApexCeremonies,
      preferredBidderId: nextPhase === 7 ? null : state.preferredBidderId,
      activeMissionId: undefined,
      commitments: [],
      replayTrace: appendReplayTrace(state.replayTrace, {
        day: state.day,
        phase: state.phase,
        action: 'phase_advance',
        input: { fromPhase: state.phase, toPhase: nextPhase, skippedPhases },
      }),
    });
  },

  debugJumpToPhase: async (targetPhase: PhaseId) => {
    const state = get();
    const targetProfile = getTargetNarrative(state.targetNarrativeId);
    const baseBudget = PHASE_BASE_BUDGETS[targetPhase] ?? 100;

    const phase0Tasks = state.tasks.filter((t) => t.phase === 0).map((t) => ({ ...t }));
    let accumulatedTasks: GameTask[] = [...phase0Tasks];
    let accumulatedDeliverables: Deliverable[] = [];
    let accumulatedRisks: Risk[] = [];
    let accumulatedHeadlines: Headline[] = [];
    let currentBuyers: Buyer[] = [];

    let accumulatedEmails: Email[] = targetPhase === 0 ? [...initialEmails] : [];

    for (let p = 1; p <= targetPhase; p++) {
      const rawContent = await loadPhaseContent(p as Exclude<PhaseId, 0>);
      const content = personalizeTargetNarrativeValue(rawContent, targetProfile);
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
    const finalOffers = targetPhase >= 7 ? generateFinalOffers(buyers, resources.dealMomentum, week, state.rngSeed, state.targetNarrativeId, state.eventDirectorState.storyFlags) : [];
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
      client: syncClient(targetProfile.client, resources),
      targetNarrativeId: state.targetNarrativeId,
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
        targetId: targetProfile.leadId,
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
        leadId: targetProfile.leadId,
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
      apexCeremonies: { pending: null, history: [] },
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

    // The chained phase jump wipes story flags; capture them first so a QA
    // jump keeps narrative continuity (offer drivers, chain payoffs).
    const preservedStoryFlags = { ...get().eventDirectorState.storyFlags };
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

    const leadId = getTargetNarrative(state.targetNarrativeId).leadId;
    const leads = state.leads.map((lead) => {
      if (lead.id !== leadId) return lead;
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
          targetId: leadId,
          source: index === 0 ? 'team_research' as const : 'meeting' as const,
          content: index === 0
            ? 'Debug checkpoint: qualification research confirms a credible sell-side path.'
            : 'Debug checkpoint: founder meeting and qualification follow-up completed.',
          sentiment: 'positive' as const,
        }))
      : state.qualificationNotes;

    const checkpointWeek = Math.max(1, Math.ceil(checkpoint.day / 7));
    const agreedFeeTerms = checkpoint.feeAgreed ? { ...DEBUG_FEE_TERMS, agreedWeek: checkpointWeek } : state.agreedFeeTerms;
    const finalOffers = checkpoint.phase >= 7 ? generateFinalOffers(buyers, resources.dealMomentum, checkpointWeek, state.rngSeed, state.targetNarrativeId, preservedStoryFlags) : [];
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
      apexCeremonies: checkpoint.apexCeremony
        ? {
            pending: {
              id: `debug-${checkpoint.id}`,
              type: checkpoint.apexCeremony.type,
              day: checkpoint.day,
              phase: checkpoint.phase,
              outcome: checkpoint.apexCeremony.outcome,
            },
            history: [],
          }
        : { pending: null, history: [] },
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
      boardRejectionCount: 0,
      eventDirectorState: {
        ...state.eventDirectorState,
        storyFlags: preservedStoryFlags,
      },
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

  acknowledgeRoutineEmails: () => {
    const routineIds = new Set(getRoutineEmails(get().emails, get().phase).map((email) => email.id));
    if (routineIds.size === 0) return;
    set((state) => ({
      emails: state.emails.map((email) =>
        routineIds.has(email.id) ? { ...email, state: 'read' as const } : email
      ),
    }));
    get().addToast(`${routineIds.size} routine update${routineIds.size === 1 ? '' : 's'} cleared`, 'info');
  },

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
        body: `I've reviewed the situation with ${state.client.name}.\n\nMy read: this is a trust issue as much as a tactical one. The moment a client starts second-guessing the process, you have to over-communicate — short status notes every 3 days without being asked. Frequency of contact at this stage matters more than depth.\n\nOn the substance: take their concern at face value first. Push back only after they feel heard. Don't try to win the argument before you've validated the relationship.\n\nLet me know if you want me to join the next call.`,
      },
      buyer: {
        subject: `Re: "${email.subject}" — Marcus`,
        body: `I've seen this move before.\n\nThe buyer is applying pressure at a predictable inflection point. Their behaviour is consistent with a firm that has approved a strong investment case internally but wants optionality — they're trying to lock in terms before the process gets competitive.\n\nDon't blink first. Acknowledge their concern professionally, hold the timeline, and remind them the process structure protects their interests as much as the seller's.\n\nIf they walk over process, they would have walked over something else later anyway.`,
      },
      partner: {
        subject: `Re: "${email.subject}" — Marcus`,
        body: `Thanks for looping me in.\n\nMy view: partners act in their own interest — that's not a criticism, it's a feature of the ecosystem. If they're pushing in a direction that doesn't serve our client, that's a sign to recalibrate the relationship, not the deal.\n\nBe direct with them. Tell them where we're aligned and where our obligations to ${state.client.companyName} take precedence. Good partners respect that.`,
      },
      market: {
        subject: `Re: "${email.subject}" — Marcus`,
        body: `Market signals at this stage are noise until proven otherwise.\n\nI've been in processes where three consecutive bad headlines turned out to be entirely irrelevant to final price. Buyers know the difference between sector volatility and asset-specific risk — your job is to reinforce that ${state.client.companyName}'s story is idiosyncratic, not correlated to whatever is moving markets this week.\n\nPrepare a one-page differentiation note. Short. Factual. Send it proactively to all active buyers before they ask.`,
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
        if (k === 'dealMomentum') {
          const translatedRiskDelta = -Math.round(delta / 2);
          newResources.riskLevel = Math.max(0, Math.min(100, newResources.riskLevel + translatedRiskDelta));
          continue;
        }
        const current = newResources[k];
        if (typeof current === 'number' && typeof delta === 'number') {
          const maxVal = k === 'budget' ? newResources.budgetMax : k === 'teamCapacity' ? newResources.teamCapacityMax : 100;
          (newResources as unknown as Record<string, number>)[k] = Math.max(0, Math.min(maxVal, current + delta));
        }
      }
    }

    const normalizedResources = normalizeResources(newResources);

    // M2 people beats: relationship consequences land on the named buyer
    // through the same attributes that already drive DD and the endgame.
    let nextBuyers = state.buyers;
    if (response?.buyerEffects) {
      const fx = response.buyerEffects;
      nextBuyers = state.buyers.map((buyer) => buyer.id === fx.buyerId
        ? {
            ...buyer,
            chemistryWithSeller: Math.max(0, Math.min(100, buyer.chemistryWithSeller + (fx.chemistryDelta ?? 0))),
            executionCredibility: Math.max(0, Math.min(100, buyer.executionCredibility + (fx.executionCredibilityDelta ?? 0))),
            ddFriction: fx.ddFriction ?? buyer.ddFriction,
          }
        : buyer);
    }

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
      buyers: nextBuyers,
      eventDirectorState: nextDirectorState,
    } as GameStore;
    logCausalChange('email_response', {
      emailId,
      responseId,
      effects: response?.resourceEffects ?? {},
      buyerEffects: response?.buyerEffects,
      storyDecision: response?.storyDecision,
    });

    const responseAge = email?.day === undefined ? 0 : Math.max(0, state.day - email.day);
    const responseRating = email?.priority === 'urgent'
      ? (responseAge <= 1 ? 1 : responseAge <= 3 ? 0.6 : 0.2)
      : email?.priority === 'high'
        ? (responseAge <= 2 ? 1 : responseAge <= 5 ? 0.6 : 0.3)
        : 1;
    const processLog = email && response
      ? appendProcessRecord(state.processLog, {
          day: state.day,
          phase: state.phase,
          category: ['client', 'buyer', 'partner'].includes(email.category) ? 'stakeholder' : 'judgment',
          rating: responseRating,
          weight: email.priority === 'urgent' ? 3 : email.priority === 'high' ? 2 : 1,
          sourceType: 'email',
          sourceId: email.id,
          headline: `Responded: ${email.subject}`,
          explanation: responseAge === 0
            ? 'Handled in the same decision window in which it surfaced.'
            : `Handled ${responseAge} day${responseAge === 1 ? '' : 's'} after it surfaced.`,
        })
      : state.processLog;

    return {
      resources: normalizedResources,
      emails: nextEmails,
      buyers: nextBuyers,
      processLog,
      replayTrace: email && response
        ? appendReplayTrace(state.replayTrace, {
            day: state.day,
            phase: state.phase,
            action: 'email_response',
            input: { emailId, responseId },
            sources: [`email:${emailId}`],
          })
        : state.replayTrace,
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
      replayTrace: appendReplayTrace(state.replayTrace, {
        day: state.day,
        phase: state.phase,
        action: 'task_start',
        input: { taskId },
        sources: [`task:${taskId}`],
      }),
    };
  }),

  queueRoutineTasks: () => {
    const state = get();
    let remainingBudget = state.resources.budget;
    const routineTasks = getRoutineTasks(state.tasks, state.phase).filter((task) => {
      if (task.cost > remainingBudget) return false;
      remainingBudget -= task.cost;
      return true;
    });
    routineTasks.forEach((task) => get().startTask(task.id));
    if (routineTasks.length > 0) {
      get().addToast(`${routineTasks.length} routine task${routineTasks.length === 1 ? '' : 's'} queued`, 'info');
    }
  },

  completeTask: (taskId) => set((state) => {
    const completedTask = state.tasks.find((task) => task.id === taskId && task.phase === state.phase && task.status === 'in_progress');
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
      processLog: completedTask && !completedTask.isBackgroundTask && completedTask.complexity !== 'low'
        ? appendProcessRecord(state.processLog, {
            day: state.day,
            phase: state.phase,
            category: 'execution',
            rating: completedTask.deadline === undefined || state.week <= completedTask.deadline ? 1 : 0.4,
            weight: completedTask.complexity === 'high' ? 3 : 2,
            sourceType: 'task',
            sourceId: completedTask.id,
            headline: `Delivered: ${completedTask.name}`,
            explanation: completedTask.deadline === undefined || state.week <= completedTask.deadline
              ? 'Completed while the work was still relevant to the live process.'
              : 'Completed after its decision window, limiting its usefulness to the process.',
          })
        : state.processLog,
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
      processLog: appendProcessRecord(state.processLog, {
        day: state.day,
        phase: state.phase,
        category: 'risk',
        rating: risk.severity === 'critical' || risk.severity === 'high' ? 1 : risk.severity === 'medium' ? 0.75 : 0.4,
        weight: risk.severity === 'critical' ? 3 : risk.severity === 'high' ? 2 : 1,
        sourceType: 'risk',
        sourceId: risk.id,
        dedupeKey: `risk:${risk.id}`,
        headline: `Mitigated: ${risk.name}`,
        explanation: `Addressed a ${risk.severity}-severity risk before it could further constrain the process.`,
      }),
      replayTrace: appendReplayTrace(state.replayTrace, {
        day: state.day,
        phase: state.phase,
        action: 'risk_mitigation',
        input: { riskId, planId: 'direct' },
        sources: [`risk:${riskId}`],
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
    const { rng, seed: mitigationSeed } = createActionRng(state, `mitigation:${riskId}:${planId}`);
    const processLog = appendProcessRecord(state.processLog, {
      day: state.day,
      phase: state.phase,
      category: 'risk',
      rating: risk.severity === 'critical' || risk.severity === 'high' ? 1 : risk.severity === 'medium' ? 0.75 : 0.4,
      weight: risk.severity === 'critical' ? 3 : risk.severity === 'high' ? 2 : 1,
      sourceType: 'risk',
      sourceId: `${risk.id}:${plan.id}`,
      dedupeKey: `risk:${risk.id}`,
      headline: `Acted on: ${risk.name}`,
      explanation: `Committed the ${plan.title} plan against a ${risk.severity}-severity exposure; the score evaluates the decision, not the random outcome.`,
    });

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
        processLog,
        replayTrace: appendReplayTrace(state.replayTrace, {
          day: state.day,
          phase: state.phase,
          action: 'risk_mitigation',
          input: { riskId, planId, outcome: 'catastrophic_failure' },
          rng: { seed: mitigationSeed, draws: rng.getDrawCount(), state: rng.getState() },
          sources: [`risk:${riskId}`],
        }),
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
      processLog,
      replayTrace: appendReplayTrace(state.replayTrace, {
        day: state.day,
        phase: state.phase,
        action: 'risk_mitigation',
        input: { riskId, planId, outcome: success ? 'success' : 'failure' },
        rng: { seed: mitigationSeed, draws: rng.getDrawCount(), state: rng.getState() },
        sources: [`risk:${riskId}`],
      }),
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

  selectArchetype: (id: ArchetypeId) => set((state) => {
    if (state.advisorArchetype) return {}; // one identity per run
    const archetype = getArchetype(id);
    if (!archetype) return {};
    logCausalChange('archetype_selected', { id });
    return {
      advisorArchetype: id,
      archetypeAbilityUse: null,
      resources: normalizeResources({
        ...state.resources,
        clientTrust: state.resources.clientTrust + archetype.startClientTrust,
        reputation: state.resources.reputation + archetype.startReputation,
      }),
      tasks: applyArchetypeToTasks(state.tasks, id),
      toasts: [
        ...state.toasts,
        { id: `toast-archetype-${id}`, message: `${archetype.name}: ${archetype.tagline}`, type: 'info' as const },
      ],
    };
  }),
  useArchetypeAbility: () => set((state) => {
    const resolution = resolveArchetypeAbility({
      advisorArchetype: state.advisorArchetype,
      usedAbilityId: state.archetypeAbilityUse?.abilityId ?? null,
      phase: state.phase,
      resources: state.resources,
      buyers: state.buyers,
      risks: state.risks,
    });
    if (!resolution) return {};

    const baseResources = normalizeResources(resolution.resources);
    const nextDirectorState = {
      ...state.eventDirectorState,
      storyFlags: {
        ...state.eventDirectorState.storyFlags,
        [resolution.storyFlag.key]: resolution.storyFlag.value,
      },
    };
    const projection = {
      ...state,
      resources: baseResources,
      buyers: resolution.buyers,
      risks: resolution.risks,
      eventDirectorState: nextDirectorState,
    } as GameStore;
    const nextResources = normalizeResources({
      ...baseResources,
      dealMomentum: deriveDealMomentum(projection),
    });
    const resourceDeltas = (Object.keys(nextResources) as (keyof PlayerResources)[])
      .filter((resource) => nextResources[resource] !== state.resources[resource])
      .map((resource) => ({
        resource,
        before: state.resources[resource],
        after: nextResources[resource],
        delta: nextResources[resource] - state.resources[resource],
        reason: getArchetype(state.advisorArchetype)?.ability.name ?? 'Advisor ability',
        sourceEntity: getArchetype(state.advisorArchetype)?.name,
      }));
    const abilityUse: ArchetypeAbilityUse = {
      abilityId: resolution.abilityId,
      day: state.day,
      phase: state.phase,
    };

    logCausalChange('archetype_ability', {
      archetype: state.advisorArchetype,
      abilityId: resolution.abilityId,
      phase: state.phase,
      day: state.day,
      deltas: resourceDeltas,
    });

    const projectedWithResources = { ...projection, resources: nextResources } as GameStore;
    return {
      archetypeAbilityUse: abilityUse,
      resources: nextResources,
      client: syncClient(state.client, nextResources),
      buyers: resolution.buyers,
      risks: resolution.risks,
      eventDirectorState: {
        ...nextDirectorState,
        upcomingBeats: buildUpcomingBeats(projectedWithResources),
      },
      lastResourceDeltas: resourceDeltas,
      processLog: appendProcessRecord(state.processLog, {
        day: state.day,
        phase: state.phase,
        category: resolution.process.category,
        rating: resolution.process.rating,
        weight: 2,
        sourceType: 'archetype',
        sourceId: resolution.abilityId,
        dedupeKey: `archetype:${resolution.abilityId}`,
        headline: resolution.process.headline,
        explanation: resolution.process.explanation,
      }),
      replayTrace: appendReplayTrace(state.replayTrace, {
        day: state.day,
        phase: state.phase,
        action: 'archetype_ability',
        input: { archetype: state.advisorArchetype, abilityId: resolution.abilityId },
        resourceDeltas,
        sources: [`archetype:${resolution.abilityId}`],
      }),
      toasts: [
        ...state.toasts,
        { id: `toast-ability-${resolution.abilityId}`, message: resolution.summary, type: 'success' as const },
      ],
    };
  }),
  markOnboardingSeen: () => set({ hasSeenOnboarding: true }),
  saveGame: () => set({ savedAt: new Date().toISOString() }),
  completeGame: () => set((state) => {
    if (state.phase !== 10) return {};
    const ceremonies = state.apexCeremonies ?? { pending: null, history: [] };
    const ceremonyId = `closing-${state.mandateId}-${state.rngSeed}`;
    if (ceremonies.history.some((record) => record.id === ceremonyId)) return { gameComplete: true };
    return {
      apexCeremonies: {
        ...ceremonies,
        pending: { id: ceremonyId, type: 'closing', day: state.day, phase: 10 },
      },
    };
  }),


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
  selectActiveLead: (leadId) => set((state) => {
    if (state.phase !== 0 || state.boardSubmission?.status === 'pending' || state.boardSubmission?.status === 'approved') return {};
    const profile = getTargetNarrativeForLead(leadId);
    if (profile.leadId !== leadId) return {};
    return {
      activeLeadId: leadId,
      targetNarrativeId: profile.id,
      client: syncClient(profile.client, state.resources),
    };
  }),

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
      targetId: leadId,
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
    // Idempotent: repeat clicks cannot double-schedule or duplicate toasts.
    if (state.leads[leadIndex].meetingScheduled || state.leads[leadIndex].meetingDone) return {};

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

  submitBoardRecommendation: (recommendation, rationale, leadId) => set((state) => {
    // Judgment is rated on what the player verified before deciding —
    // investigation coverage, founder meeting, evidence quality — via the
    // same assessment the modal telegraphs. No string-length proxies.
    const lead = state.leads.find((l) => l.id === leadId);
    const assessment = assessBoardCase({
      lead,
      qualificationNotes: state.qualificationNotes,
      recommendation,
    });
    const profile = getTargetNarrativeForLead(leadId);
    return {
      activeLeadId: profile.leadId,
      targetNarrativeId: profile.id,
      client: syncClient(profile.client, state.resources),
      boardSubmission: {
        recommendation,
        rationale,
        leadId,
        submittedWeek: state.week,
        status: 'pending' as const,
      },
      processLog: appendProcessRecord(state.processLog, {
        day: state.day,
        phase: state.phase,
        category: 'judgment',
        rating: assessment.rating,
        weight: 3,
        sourceType: 'board',
        sourceId: leadId ?? 'unassigned',
        dedupeKey: 'board:mandate-recommendation',
        headline: `Board recommendation: ${recommendation}`,
        explanation: assessment.gaps.length === 0
          ? 'Recommendation was backed by full investigation, a founder meeting, and documented evidence.'
          : `Recommendation went to the IC with gaps: ${assessment.gaps.join('; ')}.`,
      }),
      replayTrace: appendReplayTrace(state.replayTrace, {
        day: state.day,
        phase: state.phase,
        action: 'board_submission',
        input: { recommendation, rationale, leadId },
      }),
    };
  }),

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
    // Walking into the founder pitch without the deck is a judgment call the
    // process score must see — the trust hit alone is outcome, not process.
    const processLog = appendProcessRecord(state.processLog, {
      day: state.day,
      phase: state.phase,
      category: 'judgment',
      rating: state.pitchDocumentReady ? 1 : 0.4,
      weight: 2,
      sourceType: 'pitch',
      sourceId: 'mandate-pitch',
      dedupeKey: 'pitch:mandate-pitch',
      headline: state.pitchDocumentReady ? 'Pitch presented, fully prepared' : 'Pitch presented without the deck',
      explanation: state.pitchDocumentReady
        ? 'The pitch went in with the prepared deck behind it.'
        : 'The pitch was presented before the pitch deck was ready — an avoidable credibility risk.',
    });
    if (!state.feeNegotiation) {
      // Initialise negotiation shell for current phase
      const clientProfile = deriveClientProfile(state.resources.clientTrust, state.qualificationNotes);
      const clientState = buildClientNegotiationState(clientProfile, state.client.valuationExpectationEV ?? 100, getArchetype(state.advisorArchetype)?.negotiationPatienceBonus ?? 0);
      const negotiation: FeeNegotiation = {
        phase: state.phase,
        pitchPresented: true,
        status: 'pitch_pending',
        clientState,
        rounds: [],
      };
      return { feeNegotiation: negotiation, processLog };
    }
    return { feeNegotiation: { ...state.feeNegotiation, pitchPresented: true, status: 'pitch_pending' }, processLog };
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
    const processLog = appendProcessRecord(state.processLog, {
      day: state.day,
      phase: state.phase,
      category: 'negotiation',
      rating: reactionRating([reactionRetainer, reactionSuccessFee, reactionRatchet]),
      weight: 2,
      sourceType: 'fee_round',
      sourceId: `round-${currentRound}`,
      headline: `Fee negotiation — round ${currentRound}`,
      explanation: `The proposal produced ${redCount} red reaction${redCount === 1 ? '' : 's'} across retainer, success fee and ratchet.`,
    });
    const replayTrace = appendReplayTrace(state.replayTrace, {
      day: state.day,
      phase: state.phase,
      action: 'fee_round',
      input: { round: currentRound, terms: effectiveTerms, outcome },
    });

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
        processLog,
        replayTrace,
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
        processLog,
        replayTrace,
      };
    }

    return {
      feeNegotiation: {
        ...state.feeNegotiation,
        clientState: updatedClientState,
        rounds: [...state.feeNegotiation.rounds, newRound],
      },
      processLog,
      replayTrace,
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
    const selectedBuyer = state.buyers.find((buyer) => buyer.id === buyerId);
    const selectedOffer = state.finalOffers.find((offer) => offer.buyerId === buyerId);
    const conditionalityRating = selectedOffer?.conditionality === 'clean'
      ? 1
      : selectedOffer?.conditionality === 'light_conditions'
        ? 0.7
        : 0.35;
    const choiceRating = selectedBuyer
      ? (selectedBuyer.executionCredibility / 100 + conditionalityRating) / 2
      : 0.5;

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
      processLog: confirmed
        ? appendProcessRecord(state.processLog, {
            day: state.day,
            phase: state.phase,
            category: 'judgment',
            rating: choiceRating,
            weight: 3,
            sourceType: 'buyer_decision',
            sourceId: buyerId,
            dedupeKey: 'buyer_decision:preferred',
            headline: `Preferred bidder: ${selectedBuyer?.name ?? buyerId}`,
            explanation: 'Selection quality reflects the execution credibility and conditionality visible when the choice was confirmed.',
        })
        : state.processLog,
      replayTrace: confirmed
        ? appendReplayTrace(state.replayTrace, {
            day: state.day,
            phase: state.phase,
            action: 'buyer_selection',
            input: { buyerId, confirmed },
          })
        : state.replayTrace,
    };
  }),

  completeOfferReveal: (status, revealedBuyerIds) => set((state) => ({
    offerReveal: { status, revealedBuyerIds },
    replayTrace: appendReplayTrace(state.replayTrace, {
      day: state.day,
      phase: state.phase,
      action: 'ceremony',
      input: { type: 'offer', status, revealedBuyerIds },
    }),
  })),

  completeApexCeremony: (status) => set((state) => {
    const ceremonies = state.apexCeremonies ?? { pending: null, history: [] };
    const pending = ceremonies.pending;
    if (!pending) return {};
    const record = { ...pending, status };
    return {
      apexCeremonies: {
        pending: null,
        history: [...ceremonies.history.filter((item) => item.id !== pending.id), record].slice(-30),
      },
      replayTrace: appendReplayTrace(state.replayTrace, {
        day: state.day,
        phase: state.phase,
        action: 'ceremony',
        input: { type: pending.type, status, ceremonyId: pending.id },
      }),
      ...(pending.type === 'closing' ? { gameComplete: true } : {}),
    };
  }),

  // SPA actions
  initSPANegotiation: () => set((state) => {
    const preferredBuyer = state.preferredBidderId
      ? state.buyers.find((b) => b.id === state.preferredBidderId)
      : null;
    if (!preferredBuyer) return {};
    const buyerState = generateSPABuyerState(preferredBuyer, state.rngSeed, state.day, getArchetype(state.advisorArchetype)?.negotiationPatienceBonus ?? 0);
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
    const processLog = appendProcessRecord(state.processLog, {
      day: state.day,
      phase: state.phase,
      category: 'negotiation',
      rating: reactionRating([reactionScope, reactionCap, reactionEscrow, reactionIndemnity]),
      weight: 3,
      sourceType: 'spa_round',
      sourceId: `round-${round}`,
      headline: `SPA negotiation — round ${round}`,
      explanation: `The proposal produced ${reds} red and ${yellows} yellow reactions across the four negotiated components.`,
    });
    const replayTrace = appendReplayTrace(state.replayTrace, {
      day: state.day,
      phase: state.phase,
      action: 'spa_round',
      input: { round, terms: effectiveTerms, outcome },
    });
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
      ? { clientTrust: Math.min(100, state.resources.clientTrust + 5), riskLevel: Math.max(0, state.resources.riskLevel - 5) }
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
      processLog,
      replayTrace,
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
    let riskDelta = 0;
    let trustDelta = 0;

    if (opening) {
      riskDelta = Math.round(10 * sensitivityWeight);       // more exposure
      trustDelta = Math.round(5 * sensitivityWeight);       // client trusts the process
    } else if (restricting) {
      riskDelta = Math.round(-6 * sensitivityWeight);       // less exposure
    }

    const newResources = {
      ...state.resources,
      riskLevel: Math.max(0, Math.min(100, state.resources.riskLevel + riskDelta)),
      clientTrust: Math.max(0, Math.min(100, state.resources.clientTrust + trustDelta)),
    };
    const sensitiveCategory = cat.sensitivity === 'critical' || cat.sensitivity === 'high';
    const accessRating = sensitiveCategory
      ? (level === 'partial' ? 1 : level === 'full' ? 0.7 : 0.4)
      : (level === 'full' ? 1 : level === 'partial' ? 0.75 : 0.4);

    return {
      dataroomCategories: state.dataroomCategories.map((c) =>
        c.id === categoryId ? { ...c, accessLevel: level } : c
      ),
      resources: normalizeResources(newResources),
      processLog: appendProcessRecord(state.processLog, {
        day: state.day,
        phase: state.phase,
        category: 'risk',
        rating: accessRating,
        weight: sensitiveCategory ? 2 : 1,
        sourceType: 'dataroom',
        sourceId: categoryId,
        headline: `Dataroom access: ${cat.name}`,
        explanation: `${level} access was selected for a ${cat.sensitivity}-sensitivity category, balancing buyer momentum against disclosure exposure.`,
      }),
      replayTrace: appendReplayTrace(state.replayTrace, {
        day: state.day,
        phase: state.phase,
        action: 'dataroom_access',
        input: { categoryId, from: prev, to: level },
      }),
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
        reputation: Math.min(100, state.resources.reputation + (effects.reputation ?? 0)),
      }),
    };
  }),

  setWeekPace: (pace) => set({ weekPace: pace }),
  });
}, {
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
    if (fromVersion < 8) {
      // Keep historical runs comparable: they retain the previous end-state
      // score, while new games collect causal process evidence from day one.
      s.contentVersion = CONTENT_VERSION;
      s.scoringModelVersion = 'legacy-v1';
      s.mandateDifficulty = { ...DEFAULT_MANDATE_DIFFICULTY };
      s.processLog = [];
    }
    if (fromVersion < 12) {
      s.mandateId = 'solara-flagship';
    }
    if (fromVersion < 13) {
      s.runMode = 'career';
      s.dailyKey = null;
      s.dailySeason = null;
    }
    if (fromVersion < 14) {
      s.challengeCode = null;
      s.challengeSeason = null;
      s.challengeAttemptId = null;
      s.startingReputationBonus = 0;
    }
    if (fromVersion < 15) {
      s.archetypeAbilityUse = null;
      s.apexCeremonies = { pending: null, history: [] };
    }
    if (fromVersion < 16) {
      const savedClient = s.client && typeof s.client === 'object' ? s.client as Client : undefined;
      const savedBoard = s.boardSubmission && typeof s.boardSubmission === 'object'
        ? s.boardSubmission as BoardSubmission
        : undefined;
      s.targetNarrativeId = deriveTargetNarrativeId(savedClient, savedBoard?.leadId);
      s.activeLeadId = savedBoard?.leadId ?? getTargetNarrative(s.targetNarrativeId as string).leadId;
    }
    if (fromVersion < 11) {
      // Archetypes are a run-start identity; mid-run saves stay 'balanced'.
      s.advisorArchetype = null;
    }
    if (fromVersion < 9) {
      // Pity ladder for IC resubmissions. A run mid-rejection loses at most
      // one historical rejection's worth of pity — acceptable versus
      // guessing from emails.
      s.boardRejectionCount = 0;
    }
    if (fromVersion < 10) {
      s.replayTrace = [];
    }
    if (fromVersion < SAVE_SCHEMA_VERSION && s.resources && typeof s.resources === 'object') {
      // M0 makes all visible resource values integer-valued at the engine
      // boundary. Migrate existing fractional saves once, rather than showing
      // a mixed-format run after upgrade.
      s.resources = normalizeResources(s.resources as PlayerResources);
    }
    if (fromVersion < 10 && s.resources && typeof s.resources === 'object') {
      // Momentum is materialised from the merged run state and is no longer
      // part of the persisted resource payload.
      const migratedResources = { ...(s.resources as Record<string, unknown>) };
      delete migratedResources.dealMomentum;
      s.resources = migratedResources;
    }
    return s;
  },
  merge: (persistedState: unknown, currentState: GameStore) => {
    const persisted = (persistedState ?? {}) as Partial<GameStore> & { resources?: Partial<PlayerResources> };
    const merged = {
      ...currentState,
      ...persisted,
      resources: { ...currentState.resources, ...(persisted.resources ?? {}) },
    } as GameStore;
    if (merged.day !== undefined) {
      merged.week = Math.ceil(merged.day / 7);
    }
    merged.resources.dealMomentum = deriveDealMomentum(merged);
    return merged;
  },
  partialize: (state) => {
    // Exclude transient UI state from persistence
    const {
      lastWeekResult, phaseGate, isWeekInProgress, toasts, week,
      turnPlayback, lastResourceDeltas, showWeekReport, pendingReportAutoOpen,
      ...persisted
    } = state;
    const { dealMomentum: _derivedMomentum, ...persistedResources } = persisted.resources;
    void lastWeekResult; void phaseGate; void isWeekInProgress; void toasts; void week;
    void turnPlayback; void lastResourceDeltas; void showWeekReport; void pendingReportAutoOpen;
    void _derivedMomentum;
    return { ...persisted, resources: persistedResources as PlayerResources };
  },
}));
