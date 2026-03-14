import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  GameState,
  PhaseId,
  Email,
  GameTask,
  Workstream,
  Deliverable,
  Risk,
  Headline,
  TeamMember,
  Client,
  PlayerResources,
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
  SPARound,
  SPATerms,
} from '../types/game';
import { resolveWeek, checkPhaseGate, unlockTasks, checkDealCollapse } from '../engine/weekEngine';
import type { WeekResult, PhaseGateResult } from '../engine/weekEngine';
import { PHASE_BASE_BUDGETS, STAFF_PROFILES, CONTRACTOR_PROFILES, MITIGATION_ACTIONS } from '../config/phaseBudgets';

import { phase1Tasks, phase1Emails, phase1Deliverables, phase1Risks, phase1Headlines } from '../content/phase1';
import { phase2Tasks, phase2Emails, phase2Deliverables, phase2Risks, phase2Headlines, phase2Buyers } from '../content/phase2';
import { phase3Tasks, phase3Emails, phase3Deliverables, phase3Risks, phase3Headlines } from '../content/phase3';
import { phase4Tasks, phase4Emails, phase4Deliverables, phase4Risks, phase4Headlines } from '../content/phase4';
import { phase5Tasks, phase5Emails, phase5Deliverables, phase5Risks, phase5Headlines } from '../content/phase5';
import { phase6Tasks, phase6Emails, phase6Deliverables, phase6Risks, phase6Headlines } from '../content/phase6';
import { phase7Tasks, phase7Emails, phase7Deliverables, phase7Risks, phase7Headlines } from '../content/phase7';
import { phase8Tasks, phase8Emails, phase8Deliverables, phase8Risks, phase8Headlines } from '../content/phase8';
import { phase9Tasks, phase9Emails, phase9Deliverables, phase9Risks, phase9Headlines } from '../content/phase9';
import { phase10Tasks, phase10Emails, phase10Deliverables, phase10Risks, phase10Headlines } from '../content/phase10';

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
    subject: 'Potential opportunity — Solara Systems',
    body: 'Ricardo Mendes, founder of Solara Systems, reached out through our Lisbon network. Industrial IoT platform, predictive maintenance for energy infrastructure. Claims €28M ARR and 35% growth.\n\nI need you to assess whether this is worth pursuing. Schedule an intro call, do a quick company screen, and give me your read on whether this is a real opportunity or just a founder fishing for a valuation number.\n\nDon\'t commit to anything yet. This is origination, not a mandate.',
    preview: 'Potential opportunity — need you to assess...',
    category: 'partner',
    state: 'unread',
    priority: 'high',
    timestamp: 'Week 1, Monday',
    responseOptions: [
      { id: 'r1', label: 'On it — I\'ll schedule the intro call this week', effects: '+5 momentum', resourceEffects: { dealMomentum: 5 } },
      { id: 'r2', label: 'I\'ll run a quick screen first before reaching out', effects: '+3 reputation (thorough)', resourceEffects: { reputation: 3 } },
    ],
  },
  {
    id: 'email-2',
    week: 1,
    phase: 0,
    sender: 'Ricardo Mendes',
    senderRole: 'Founder & CEO, Solara Systems',
    subject: 'Introduction',
    body: 'Marcus suggested I reach out directly. I\'ve been running Solara for 12 years and I\'m starting to think about what comes next. A few PE firms have approached us informally, but I want to understand what a structured process would look like before making any decisions.\n\nI\'m not in a rush, but I\'d like to have a conversation soon if your team is interested.',
    preview: 'Marcus suggested I reach out directly...',
    category: 'client',
    state: 'unread',
    priority: 'normal',
    timestamp: 'Week 1, Monday',
    responseOptions: [
      { id: 'r1', label: 'Propose an introductory meeting this week', effects: '+5 client trust', resourceEffects: { clientTrust: 5 } },
      { id: 'r2', label: 'Reply warmly but take time to research first', effects: '+3 reputation, slight delay', resourceEffects: { reputation: 3 } },
      { id: 'r3', label: 'Ask for key financial metrics upfront', effects: '+5 momentum, -3 client trust (too transactional)', resourceEffects: { dealMomentum: 5, clientTrust: -3 } },
    ],
  },
];

// Phase 0: Origination tasks — assess the opportunity
const initialTasks: GameTask[] = [
  {
    id: 'task-01', name: 'Initial Company Screening', description: 'Review publicly available information on Solara Systems: product, market position, competitors, recent press. Determine if the company profile fits our advisory sweet spot.',
    phase: 0, category: 'internal', status: 'recommended', cost: 2, work: 4, complexity: 'low',
    effectSummary: 'Validates opportunity quality, +5 momentum',
  },
  {
    id: 'task-02', name: 'Schedule Introductory Meeting', description: 'Arrange a first meeting with Ricardo Mendes. Understand his motivations, timeline, and initial expectations. This is a listening exercise — not a pitch.',
    phase: 0, category: 'relationship', status: 'available', cost: 1, work: 3, complexity: 'low',
    effectSummary: '+8 client trust, unlocks client assessment',
  },
  {
    id: 'task-03', name: 'Client Motivation Assessment', description: 'Through the introductory conversation, assess: Why now? Is the founder truly committed to a sale, or testing the market? Are there other advisors in the picture?',
    phase: 0, category: 'relationship', status: 'locked', cost: 2, work: 5, complexity: 'medium',
    effectSummary: 'Reveals client true intent, +10 client trust', dependencies: ['task-02'],
  },
  {
    id: 'task-04', name: 'Quick Market Read', description: 'Assess the industrial IoT / energy tech M&A landscape. Recent transactions, active buyers, current multiples. Is this a hot sector or cooling?',
    phase: 0, category: 'market', status: 'available', cost: 3, work: 6, complexity: 'low',
    effectSummary: 'Informs opportunity quality, +5 momentum',
  },
  {
    id: 'task-05', name: 'Internal Opportunity Review', description: 'Present initial findings to Marcus Aldridge. Discuss fit with current deal pipeline, team capacity, and strategic value of the mandate. Get partner alignment on whether to proceed to pitch.',
    phase: 0, category: 'internal', status: 'locked', cost: 1, work: 3, complexity: 'medium',
    effectSummary: 'Partner buy-in, unlocks Phase 1 transition', dependencies: ['task-01', 'task-03'],
  },
  {
    id: 'task-06', name: 'Competitive Intelligence', description: 'Discreetly assess if other advisory firms are in conversation with Solara. Understanding the competitive landscape for the mandate itself.',
    phase: 0, category: 'market', status: 'available', cost: 2, work: 4, complexity: 'low',
    effectSummary: 'Intelligence on competing advisors, +3 reputation',
  },
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
  const configs: Record<ClientNegotiationProfile, Omit<ClientNegotiationState, 'patienceRemaining'>> = {
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
  return { ...configs[profile], patienceRemaining: 100 };
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


interface GameActions {
  advanceWeek: () => void;
  advancePhase: () => void;
  updateResources: (partial: Partial<PlayerResources>) => void;
  markEmailRead: (emailId: string) => void;
  respondToEmail: (emailId: string, responseId: string) => void;
  startTask: (taskId: string) => void;
  completeTask: (taskId: string) => void;
  mitigateRisk: (riskId: string) => void;
  setPlayerName: (name: string) => void;
  markOnboardingSeen: () => void;
  saveGame: () => void;
  completeGame: () => void;
  dismissWeekSummary: () => void;
  // Budget
  requestBudget: (amount: number, justification: string) => void;
  resolveBudgetRequest: (id: string, approved: boolean, approvedAmount?: number) => void;
  // Phase 0 qualification
  addQualificationNote: (note: Omit<QualificationNote, 'id'>) => void;
  submitBoardRecommendation: (recommendation: BoardSubmission['recommendation'], rationale: string) => void;
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
  // Final Offers
  selectPreferredBidder: (buyerId: string) => void;
  // Dataroom
  setDataroomAccess: (categoryId: string, level: DataroomAccessLevel) => void;
  // SPA
  initSPANegotiation: () => void;
  submitSPARound: (terms: Pick<SPARound, 'playerWarrantyScope' | 'playerWarrantyCap' | 'playerEscrowPercent' | 'playerSpecificIndemnity'>) => void;
  acceptSPATerms: () => void;
  lastWeekResult: WeekResult | null;
  phaseGate: PhaseGateResult | null;
}

export type GameStore = GameState & GameActions;

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
  };
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
  if (reactionEscrow === 'red') notes.push("Escrow of ${terms.playerEscrowPercent}% doesn't give us sufficient security — we need at least ${buyerState.reservationEscrowPercent}%.");
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
  week: 1,
  totalWeeks: 1,
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

  // Actions
  advanceWeek: () => {
    const state = get();

    // Run the week engine
    const result = resolveWeek(state);

    // Apply task status changes
    const updatedTasks = state.tasks.map((t) => {
      if (result.tasksCompleted.find((c) => c.id === t.id)) {
        return { ...t, status: 'completed' as const };
      }
      return t;
    });

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
        // Extract advisor name or use generic
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

    // Check phase gate
    const nextState = {
      ...state,
      week: state.week + 1,
      tasks: unlockedTasks,
      resources: newResources,
      buyers: updatedBuyers,
    } as GameState;
    const gate = checkPhaseGate(nextState);

    // Phase 10 gate met = game complete (success)
    const isGameComplete = state.phase === 10 && gate.canTransition;

    // Check for deal collapse (failure)
    const collapse = checkDealCollapse(nextState);

    set({
      week: state.week + 1,
      totalWeeks: state.totalWeeks + 1,
      resources: newResources,
      tasks: unlockedTasks,
      workstreams: updatedWorkstreams,
      deliverables: syncDeliverables(state.deliverables, unlockedTasks),
      team: syncTeamLoad(state.team, unlockedTasks),
      client: syncClient(state.client, newResources),
      risks: newRisks,
      emails: newEmails,
      headlines: newHeadlines,
      buyers: updatedBuyers,
      events: newEvents,
      competitorThreats: newCompetitorThreats,
      weekSummary: result.narrativeSummary,
      weekHistory: [...state.weekHistory, { week: state.week + 1, summary: result.narrativeSummary, phase: state.phase }],
      isWeekInProgress: true,
      savedAt: new Date().toISOString(),
      lastWeekResult: result,
      phaseGate: gate,
      ...(isGameComplete ? { gameComplete: true } : {}),
      ...(collapse.collapsed ? {
        gameComplete: true,
        collapseReason: collapse.reason,
        collapseHeadline: collapse.headline,
        collapseDescription: collapse.description,
      } : {}),
    });
  },

  advancePhase: () => set((state) => {
    const nextPhase = Math.min(state.phase + 1, 10) as PhaseId;

    // Load phase-specific content
    let newTasks = state.tasks;
    let newEmails = state.emails;
    let newDeliverables = state.deliverables;
    let newRisks = state.risks;
    let newHeadlines = state.headlines;
    let newWorkstreams = state.workstreams;
    let newBuyers = state.buyers;

    if (nextPhase === 1) {
      newTasks = [...state.tasks, ...phase1Tasks];
      newEmails = [...state.emails, ...phase1Emails];
      newDeliverables = [...state.deliverables, ...phase1Deliverables];
      newRisks = [...state.risks, ...phase1Risks];
      newHeadlines = [...state.headlines, ...phase1Headlines];
      newWorkstreams = state.workstreams.map((ws) => {
        if (['financials', 'marketing_materials', 'buyer_outreach'].includes(ws.id)) {
          return { ...ws, active: true };
        }
        return ws;
      });
    } else if (nextPhase === 2) {
      newTasks = [...state.tasks, ...phase2Tasks];
      newEmails = [...state.emails, ...phase2Emails];
      newDeliverables = [...state.deliverables, ...phase2Deliverables];
      newRisks = [...state.risks, ...phase2Risks];
      newHeadlines = [...state.headlines, ...phase2Headlines];
      newBuyers = [...state.buyers, ...phase2Buyers];
      newWorkstreams = state.workstreams.map((ws) => {
        if (ws.id === 'management' || ws.id === 'due_diligence') {
          return { ...ws, active: true };
        }
        return ws;
      });
    } else if (nextPhase === 3) {
      newTasks = [...state.tasks, ...phase3Tasks];
      newEmails = [...state.emails, ...phase3Emails];
      newDeliverables = [...state.deliverables, ...phase3Deliverables];
      newRisks = [...state.risks, ...phase3Risks];
      newHeadlines = [...state.headlines, ...phase3Headlines];
    } else if (nextPhase === 4) {
      newTasks = [...state.tasks, ...phase4Tasks];
      newEmails = [...state.emails, ...phase4Emails];
      newDeliverables = [...state.deliverables, ...phase4Deliverables];
      newRisks = [...state.risks, ...phase4Risks];
      newHeadlines = [...state.headlines, ...phase4Headlines];
      newWorkstreams = state.workstreams.map((ws) => {
        if (ws.id === 'negotiation') return { ...ws, active: true };
        return ws;
      });
    } else if (nextPhase === 5) {
      newTasks = [...state.tasks, ...phase5Tasks];
      newEmails = [...state.emails, ...phase5Emails];
      newDeliverables = [...state.deliverables, ...phase5Deliverables];
      newRisks = [...state.risks, ...phase5Risks];
      newHeadlines = [...state.headlines, ...phase5Headlines];
    } else if (nextPhase === 6) {
      newTasks = [...state.tasks, ...phase6Tasks];
      newEmails = [...state.emails, ...phase6Emails];
      newDeliverables = [...state.deliverables, ...phase6Deliverables];
      newRisks = [...state.risks, ...phase6Risks];
      newHeadlines = [...state.headlines, ...phase6Headlines];
      newWorkstreams = state.workstreams.map((ws) => {
        if (ws.id === 'due_diligence') return { ...ws, active: true };
        return ws;
      });
    } else if (nextPhase === 7) {
      newTasks = [...state.tasks, ...phase7Tasks];
      newEmails = [...state.emails, ...phase7Emails];
      newDeliverables = [...state.deliverables, ...phase7Deliverables];
      newRisks = [...state.risks, ...phase7Risks];
      newHeadlines = [...state.headlines, ...phase7Headlines];
    } else if (nextPhase === 8) {
      newTasks = [...state.tasks, ...phase8Tasks];
      newEmails = [...state.emails, ...phase8Emails];
      newDeliverables = [...state.deliverables, ...phase8Deliverables];
      newRisks = [...state.risks, ...phase8Risks];
      newHeadlines = [...state.headlines, ...phase8Headlines];
      newWorkstreams = state.workstreams.map((ws) => {
        if (ws.id === 'negotiation') return { ...ws, active: true };
        return ws;
      });
    } else if (nextPhase === 9) {
      newTasks = [...state.tasks, ...phase9Tasks];
      newEmails = [...state.emails, ...phase9Emails];
      newDeliverables = [...state.deliverables, ...phase9Deliverables];
      newRisks = [...state.risks, ...phase9Risks];
      newHeadlines = [...state.headlines, ...phase9Headlines];
    } else if (nextPhase === 10) {
      newTasks = [...state.tasks, ...phase10Tasks];
      newEmails = [...state.emails, ...phase10Emails];
      newDeliverables = [...state.deliverables, ...phase10Deliverables];
      newRisks = [...state.risks, ...phase10Risks];
      newHeadlines = [...state.headlines, ...phase10Headlines];
      newWorkstreams = state.workstreams.map((ws) => {
        if (ws.id === 'closing') return { ...ws, active: true };
        return ws;
      });
    }

    // Accumulate total budget spent before resetting
    const phaseSpent = Math.max(0, state.resources.budgetMax - state.resources.budget);
    const newTotalBudgetSpent = state.totalBudgetSpent + phaseSpent;

    // Inject phase budget on advance
    const carryover = Math.max(0, state.resources.budget);
    const phaseBase = PHASE_BASE_BUDGETS[nextPhase] ?? 0;
    const newBudget = carryover + phaseBase;

    // Generate Final Offers when entering Phase 7
    const newFinalOffers = nextPhase === 7
      ? generateFinalOffers(newBuyers, state.resources.dealMomentum, state.week + 1)
      : state.finalOffers;

    return {
      phase: nextPhase,
      tasks: unlockTasks(newTasks),
      emails: newEmails,
      deliverables: newDeliverables,
      risks: newRisks,
      headlines: newHeadlines,
      workstreams: newWorkstreams,
      buyers: newBuyers,
      phaseGate: null,
      resources: {
        ...state.resources,
        budget: newBudget,
        budgetMax: newBudget, // Reset max to this phase's allocation
      },
      totalBudgetSpent: newTotalBudgetSpent,
      phaseBudget: { phaseBase, carryover },
      feeNegotiation: null,
      finalOffers: newFinalOffers,
      preferredBidderId: null,
    };
  }),

  updateResources: (partial) => set((state) => ({
    resources: { ...state.resources, ...partial },
  })),

  markEmailRead: (emailId) => set((state) => ({
    emails: state.emails.map((e) =>
      e.id === emailId && e.state === 'unread' ? { ...e, state: 'read' } : e
    ),
  })),

  respondToEmail: (emailId, responseId) => set((state) => {
    const email = state.emails.find((e) => e.id === emailId);
    const response = email?.responseOptions?.find((r) => r.id === responseId);

    // Apply resource effects from the chosen response
    let newResources = state.resources;
    if (response?.resourceEffects) {
      newResources = { ...state.resources };
      for (const [key, delta] of Object.entries(response.resourceEffects)) {
        const k = key as keyof PlayerResources;
        const current = newResources[k];
        if (typeof current === 'number' && typeof delta === 'number') {
          // Clamp 0-100 for percentage stats, no negative budget
          const maxVal = k === 'budget' ? newResources.budgetMax : k === 'teamCapacity' ? newResources.teamCapacityMax : 100;
          (newResources as unknown as Record<string, number>)[k] = Math.max(0, Math.min(maxVal, current + delta));
        }
      }
    }

    return {
      resources: newResources,
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
      resources: {
        ...state.resources,
        budget: Math.max(0, state.resources.budget - cost),
        riskLevel: Math.max(0, state.resources.riskLevel - 5),
      },
    };
  }),

  setPlayerName: (name: string) => set({ playerName: name }),
  markOnboardingSeen: () => set({ hasSeenOnboarding: true }),
  saveGame: () => set({ savedAt: new Date().toISOString() }),
  completeGame: () => set({ gameComplete: true }),


  dismissWeekSummary: () => set({ lastWeekResult: null, isWeekInProgress: false }),

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
        ? { ...state.resources, budget: state.resources.budget + injected }
        : state.resources,
    };
  }),

  // ─── Phase 0 Qualification ───────────────────────────────────────────────
  addQualificationNote: (note) => set((state) => ({
    qualificationNotes: [
      ...state.qualificationNotes,
      { ...note, id: `qn-${Date.now()}` },
    ],
  })),

  submitBoardRecommendation: (recommendation, rationale) => set((state) => ({
    boardSubmission: {
      recommendation,
      rationale,
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
      resources: {
        ...state.resources,
        budget: state.resources.budget - cfg.hireCost,
        teamCapacity: state.resources.teamCapacity + cfg.capacityBoost,
        teamCapacityMax: state.resources.teamCapacityMax + cfg.capacityBoost,
      },
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

    // Resolve per-component reactions
    const reactionRetainer = resolveRetainerReaction(terms, clientState);
    const reactionSuccessFee = resolveSuccessFeeReaction(terms.playerSuccessFeePercent, clientState);
    const reactionRatchet = resolveRatchetReaction(terms, clientState);

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
      ...terms,
      reactionRetainer,
      reactionSuccessFee,
      reactionRatchet,
      clientNote,
      outcome,
    };

    const updatedClientState: ClientNegotiationState = { ...clientState, patienceRemaining: newPatience };

    if (accepted) {
      const ev = state.client.valuationExpectationEV ?? 100;
      const baseFee = (terms.playerSuccessFeePercent / 100) * ev;
      const ratchetFee = terms.playerRatchetEnabled && terms.playerRatchetThresholdEV && terms.playerRatchetBonusPercent
        ? (terms.playerRatchetBonusPercent / 100) * Math.max(0, ev - terms.playerRatchetThresholdEV)
        : 0;
      const agreedTerms: FeeTerms = {
        retainerType: terms.playerRetainerType,
        retainerAmount: terms.playerRetainerAmount,
        successFeePercent: terms.playerSuccessFeePercent,
        ratchetEnabled: terms.playerRatchetEnabled,
        ratchetThresholdEV: terms.playerRatchetThresholdEV,
        ratchetBonusPercent: terms.playerRatchetBonusPercent,
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
        resources: { ...state.resources, clientTrust: Math.max(0, state.resources.clientTrust - 10) },
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
    const result = evaluateSPARound(terms, neg.buyerState, round, state.resources);

    const newRound: SPARound = { round, ...terms, ...result };
    const newPatience = Math.max(0, neg.buyerState.patienceRemaining - (result.reactionCap === 'red' || result.reactionScope === 'red' ? 30 : 15));

    const newStatus = result.outcome === 'accepted' ? 'agreed' :
                     result.outcome === 'rejected' ? 'failed' : 'in_progress';

    const agreedTerms: SPATerms | undefined = result.outcome === 'accepted' ? {
      warrantyScope: terms.playerWarrantyScope,
      warrantyCap: terms.playerWarrantyCap,
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
        buyerState: { ...neg.buyerState, patienceRemaining: newPatience },
        rounds: [...neg.rounds, newRound],
        agreedTerms,
      },
      agreedSPATerms: agreedTerms ?? state.agreedSPATerms,
      resources: { ...state.resources, ...resourceEffect },
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
      resources: {
        ...state.resources,
        dealMomentum: Math.min(100, state.resources.dealMomentum + 8),
        clientTrust: Math.min(100, state.resources.clientTrust + 5),
      },
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
      resources: newResources,
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
      competitorThreats: state.competitorThreats.map((t) =>
        t.id === threatId
          ? { ...t, usedActions: [...t.usedActions, action] }
          : t
      ),
      resources: {
        ...state.resources,
        budget: state.resources.budget - cfg.budgetCost,
        clientTrust: Math.min(100, state.resources.clientTrust + (effects.clientTrust ?? 0)),
        dealMomentum: Math.min(100, state.resources.dealMomentum + (effects.dealMomentum ?? 0)),
        reputation: Math.min(100, state.resources.reputation + (effects.reputation ?? 0)),
      },
    };
  }),
}), {
  name: 'ma-rainmaker-save',
  version: 1,
  partialize: (state) => {
    // Exclude transient UI state from persistence
    const { lastWeekResult, phaseGate, isWeekInProgress, toasts, ...persisted } = state;
    return persisted;
  },
}));
