// ============================================
// THE M&A RAINMAKER — Core Game Types
// ============================================

export type PhaseId = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export const PHASE_NAMES: Record<PhaseId, string> = {
  0: 'Deal Origination',
  1: 'Pitch & Mandate',
  2: 'Preparation',
  3: 'Market Outreach',
  4: 'Shortlist',
  5: 'Non-Binding Offers',
  6: 'Due Diligence',
  7: 'Final Offers',
  8: 'SPA Negotiation',
  9: 'Signing',
  10: 'Closing & Execution',
};

// --- Resources ---

export interface PlayerResources {
  budget: number;
  budgetMax: number;
  teamCapacity: number;
  teamCapacityMax: number;
  morale: number;       // 0-100
  clientTrust: number;  // 0-100
  dealMomentum: number; // 0-100
  riskLevel: number;    // 0-100
  reputation: number;   // 0-100
}

// --- Emails / Inbox ---

export type EmailCategory = 'client' | 'internal' | 'partner' | 'buyer' | 'advisor' | 'market' | 'system';
export type EmailState = 'unread' | 'read' | 'requires_response' | 'urgent' | 'resolved';
export type EmailPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface EmailResponseOption {
  id: string;
  label: string;
  effects?: string;
  resourceEffects?: Partial<Record<keyof PlayerResources, number>>;
}

export interface Email {
  id: string;
  week: number;
  day?: number;  // calendar day when email arrived (undefined for seed emails)
  phase: PhaseId;
  sender: string;
  senderRole?: string;
  subject: string;
  body: string;
  preview: string;
  category: EmailCategory;
  state: EmailState;
  priority: EmailPriority;
  responseOptions?: EmailResponseOption[];
  timestamp: string;
  linkedEntityId?: string;
  linkedEntityType?: 'buyer' | 'task' | 'deliverable' | 'risk';
  flagged?: boolean;
  escalated?: boolean;
}

// --- Buyers ---

export type BuyerType = 'strategic' | 'pe' | 'family_office' | 'consortium' | 'other';
export type BuyerInterest = 'cold' | 'lukewarm' | 'warm' | 'hot' | 'on_fire';
export type BuyerStatus = 'identified' | 'contacted' | 'nda_signed' | 'reviewing' | 'active' | 'shortlisted' | 'bidding' | 'preferred' | 'dropped' | 'excluded';

export interface Buyer {
  id: string;
  name: string;
  type: BuyerType;
  geography: string;
  interest: BuyerInterest;
  valuationPosture: 'conservative' | 'fair' | 'aggressive';
  executionCredibility: number; // 0-100
  chemistryWithSeller: number; // 0-100
  status: BuyerStatus;
  ddFriction: 'low' | 'medium' | 'high';
  politicalSensitivity: 'low' | 'medium' | 'high';
  notes: string;
  enteredPhase: PhaseId;
}

// --- Tasks ---

export type TaskStatus = 'available' | 'recommended' | 'locked' | 'in_progress' | 'completed' | 'reopened';
export type TaskCategory = 'deliverable' | 'relationship' | 'market' | 'internal' | 'external_advisor' | 'strategic';

export interface GameTask {
  id: string;
  name: string;
  description: string;
  phase: PhaseId;
  category: TaskCategory;
  status: TaskStatus;
  cost: number;
  work: number;
  complexity: 'low' | 'medium' | 'high';
  effectSummary: string;
  workstreamId?: string;
  linkedDeliverableId?: string;
  dependencies?: string[];
  deadline?: number; // week number
  owner?: string;
  targetId?: string; // Links task to a specific lead/target in Phase 0
}

// --- Workstreams ---

export type WorkstreamId = 'preparation' | 'financials' | 'marketing_materials' | 'buyer_outreach' | 'management' | 'due_diligence' | 'negotiation' | 'closing';

export interface Workstream {
  id: WorkstreamId;
  name: string;
  progress: number; // 0-100
  quality: number;  // 0-100
  active: boolean;
}

// --- Deliverables ---

export type DeliverableStatus = 'not_started' | 'drafting' | 'in_review' | 'revision' | 'approved' | 'delivered';
export type QualityTier = 'poor' | 'adequate' | 'good' | 'excellent';

export interface Deliverable {
  id: string;
  name: string;
  phase: PhaseId;
  status: DeliverableStatus;
  completion: number; // 0-100
  quality: QualityTier;
  owner?: string;
  dependencies?: string[];
  deadline?: number;
}

// --- Risks ---

export type RiskCategory = 'client' | 'buyer' | 'diligence' | 'legal' | 'financing' | 'timing' | 'team' | 'market';
export type RiskSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface Risk {
  id: string;
  name: string;
  description: string;
  category: RiskCategory;
  severity: RiskSeverity;
  probability: number; // 0-100
  mitigated: boolean;
  surfacedWeek: number;
  surfacedPhase: PhaseId;
}

// --- Events ---

export type EventType = 'active' | 'passive' | 'cascade';

export interface GameEvent {
  id: string;
  week: number;
  phase: PhaseId;
  type: EventType;
  title: string;
  description: string;
  resolved: boolean;
}

// --- Headlines ---

export interface Headline {
  id: string;
  week: number;
  text: string;
  category: 'macro' | 'sector' | 'comparable' | 'competitor' | 'regulatory' | 'buyer_strategy';
}

// --- Team ---

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  seniority: 'junior' | 'mid' | 'senior' | 'partner';
  capacity: number;     // 0-100 available
  morale: number;       // 0-100
  currentLoad: number;  // 0-100
  skills: string[];
  isContractor?: boolean;  // true for temp/hired staff
  weeklyRate?: number;     // k€/week burn for contractors
}

// --- Client ---

export interface Client {
  name: string;
  companyName: string;
  sector: string;
  description: string;
  objectives: string[];
  valuationExpectation: string;
  valuationExpectationEV?: number; // numeric EV estimate in €M for fee calculations
  timeSensitivity: 'low' | 'medium' | 'high';
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  trust: number;       // 0-100
  confidence: number;  // 0-100
}

// ============================================
// NEW: Budget System
// ============================================

export interface PhaseBudgetAllocation {
  phaseBase: number;   // base budget injected at phase start (k€)
  carryover: number;   // unspent from previous phase (k€)
}

export interface BudgetRequest {
  id: string;
  week: number;
  phase: PhaseId;
  amount: number;
  justification: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedAmount?: number;
}

// ============================================
// NEW: Phase 0 Qualification
// ============================================

export interface InvestigationStatus {
  sector: 'none' | 'in_progress' | 'completed';
  company: 'none' | 'in_progress' | 'completed';
  shareholder: 'none' | 'in_progress' | 'completed';
  market: 'none' | 'in_progress' | 'completed';
}

export interface Lead {
  id: string;
  companyName: string;
  sector: string;
  founderName: string;
  origin: string;
  description: string;
  investmentCaseSummary: string;
  
  // Investigation metrics
  investigation: InvestigationStatus;
  meetingDone: boolean;
  
  // Hidden backend values to drive notes generation
  hiddenMotivations: string;
  hiddenGrowth: 'high' | 'moderate' | 'low';
  hiddenRisk: 'high' | 'moderate' | 'low';
  
  // Gathered insights by the player
  researchNotes: QualificationNote[];
  meetingTranscript?: string;
}

export interface QualificationNote {
  id: string;
  week: number;
  source: 'team_research' | 'meeting' | 'internal';
  content: string;
  sentiment: 'positive' | 'neutral' | 'negative';
}

export interface BoardSubmission {
  leadId?: string; // Optional for backward compatibility, but required for Phase 0
  recommendation: 'proceed' | 'decline';
  rationale: string;
  submittedWeek: number;
  status: 'pending' | 'approved' | 'rejected';
  boardNotes?: string;
}

// ============================================
// NEW: Team Staffing
// ============================================

export type StaffProfile = 'junior_analyst' | 'senior_analyst' | 'associate' | 'external_advisor';

// ============================================
// NEW: Temporary Capacity
// ============================================

export type ContractorProfile = 'freelance_analyst' | 'external_specialist' | 'secondment';

export interface TempCapacityAllocation {
  id: string;
  taskId: string;          // locked to a specific task
  profile: ContractorProfile;
  weeklyRate: number;      // k€/week
  speedMultiplier: number; // e.g. 1.4 = task completes 40% faster
}

// ============================================
// NEW: Fee Negotiation Micro-Game
// ============================================

export type RetainerType = 'none' | 'monthly' | 'per_phase' | 'upfront';
// monthly: €2k–€10k/month
// per_phase: €5k–€10k per new phase entry (from Preparation onwards)
// upfront: one-off signing payment €20k–€40k

export type ClientNegotiationProfile =
  | 'serious_reasonable'   // realistic expectations, pays fair fees
  | 'serious_demanding'    // committed but fights hard on %
  | 'unsure_optimistic'    // unrealistic valuation, only pays in ratchet upside
  | 'unsure_reluctant';    // not truly committed; resists all commitments

export type ComponentReaction = 'green' | 'yellow' | 'red';

export interface NegotiationRound {
  round: number;
  // Player's proposal
  playerRetainerType: RetainerType;
  playerRetainerAmount: number;
  playerSuccessFeePercent: number;
  playerRatchetEnabled: boolean;
  playerRatchetThresholdEV?: number;
  playerRatchetBonusPercent?: number;
  // Client's per-component reaction (revealed after submission)
  reactionRetainer: ComponentReaction;
  reactionSuccessFee: ComponentReaction;
  reactionRatchet: ComponentReaction;
  clientNote: string;
  outcome: 'counter' | 'accepted' | 'rejected';
}

export interface ClientNegotiationState {
  profile: ClientNegotiationProfile;
  // Hidden reservation prices (never shown directly)
  reservationSuccessFeeMin: number;  // floor %
  reservationSuccessFeeMax: number;  // ceiling %
  reservationRetainerMin: number;    // min retainer amount (0 = resists all retainer)
  // Hidden priority weights (which component they care most about, 0–10)
  priorityRetainer: number;
  prioritySuccessFee: number;
  priorityRatchet: number;
  // Patience (starts 100; depletes when reds occur)
  patienceRemaining: number;
  // Progressive negotiation state
  lockedComponents: ('retainer' | 'successFee' | 'ratchet')[];
  revealedHints: string[];
  lockedRetainerType?: RetainerType;
  lockedRetainerAmount?: number;
  lockedSuccessFeePercent?: number;
}

export interface FeeNegotiation {
  phase: PhaseId;
  pitchPresented: boolean;
  status: 'not_started' | 'pitch_pending' | 'in_progress' | 'agreed' | 'failed';
  clientState: ClientNegotiationState;
  rounds: NegotiationRound[];
  agreedTerms?: FeeTerms;
}

export interface FeeTerms {
  retainerType: RetainerType;
  retainerAmount: number;
  successFeePercent: number;
  ratchetEnabled: boolean;
  ratchetThresholdEV?: number;
  ratchetBonusPercent?: number;
  totalFeeProjection: number;  // calculated at client's EV expectation
  agreedWeek: number;
}

// ============================================
// SPA Negotiation (Phase 8)
// ============================================

export type WarrantyScope = 'fundamental' | 'standard' | 'limited';

export type SPABuyerProfile = 'aggressive_buyer' | 'reasonable_buyer' | 'conservative_buyer';

export interface SPABuyerState {
  profile: SPABuyerProfile;
  reservationWarrantyCap: number;    // min % of EV they will accept
  reservationEscrowPercent: number;  // min escrow % they will accept
  priorityScope: number;      // 0-10 how much they care about warranty scope
  priorityCap: number;        // 0-10
  priorityEscrow: number;     // 0-10
  priorityIndemnity: number;  // 0-10
  patienceRemaining: number;  // 0-100
  // Progressive locking
  lockedComponents: ('scope' | 'cap' | 'escrow' | 'indemnity')[];
  revealedHints: string[];
  lockedWarrantyScope?: WarrantyScope;
  lockedWarrantyCap?: number;
  lockedEscrowPercent?: number;
}

export interface SPARound {
  round: number;
  playerWarrantyScope: WarrantyScope;
  playerWarrantyCap: number;        // % of EV
  playerEscrowPercent: number;      // % of EV
  playerSpecificIndemnity: boolean;
  reactionScope: ComponentReaction;
  reactionCap: ComponentReaction;
  reactionEscrow: ComponentReaction;
  reactionIndemnity: ComponentReaction;
  buyerNote: string;
  outcome: 'counter' | 'accepted' | 'rejected';
}

export interface SPATerms {
  warrantyScope: WarrantyScope;
  warrantyCap: number;
  escrowPercent: number;
  specificIndemnity: boolean;
  agreedWeek: number;
}

export interface SPANegotiation {
  phase: PhaseId;
  preferredBuyerId: string;
  status: 'not_started' | 'in_progress' | 'agreed' | 'failed';
  buyerState: SPABuyerState;
  rounds: SPARound[];
  agreedTerms?: SPATerms;
}

// ============================================
// Dataroom / Due Diligence (Phase 5-6)
// ============================================

export type DataroomAccessLevel = 'restricted' | 'partial' | 'full';

export interface DataroomCategory {
  id: string;
  name: string;
  description: string;
  sensitivity: 'low' | 'medium' | 'high' | 'critical';
  accessLevel: DataroomAccessLevel;
}

// ============================================
// Final Offers (Phase 7)
// ============================================

export interface FinalOffer {
  buyerId: string;
  submittedPhase: PhaseId;
  submittedWeek: number;
  cashEV: number;           // €M cash at closing
  earnoutAmount: number;    // €M earnout potential (0 if none)
  earnoutConditions: string;
  totalEV: number;          // cashEV + earnoutAmount
  structure: 'full_cash' | 'mixed' | 'earnout_heavy';
  conditionality: 'clean' | 'light_conditions' | 'heavy_conditions';
  exclusivityRequested: boolean;
  impliedMultiple: number;  // totalEV / ~EBITDA (synthetic)
  advisorNote: string;      // generated recommendation blurb
}

// ============================================
// Toast Notifications
// ============================================

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'warning' | 'danger' | 'info';
}

// ============================================
// NEW: Competitor Mitigation
// ============================================

export type MitigationActionId =
  | 'golf_padel_dinner'
  | 'client_reference_intro'
  | 'conference_invite'
  | 'advance_pitch'
  | 'surge_staffing';

export interface CompetitorThreat {
  id: string;
  advisorName: string;
  surfacedWeek: number;
  usedActions: MitigationActionId[];
  resolved: boolean;
}

