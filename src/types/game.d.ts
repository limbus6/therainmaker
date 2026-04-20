export type PhaseId = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export declare const PHASE_NAMES: Record<PhaseId, string>;
export interface PlayerResources {
    budget: number;
    budgetMax: number;
    teamCapacity: number;
    teamCapacityMax: number;
    morale: number;
    clientTrust: number;
    dealMomentum: number;
    riskLevel: number;
    reputation: number;
}
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
    day?: number;
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
    executionCredibility: number;
    chemistryWithSeller: number;
    status: BuyerStatus;
    ddFriction: 'low' | 'medium' | 'high';
    politicalSensitivity: 'low' | 'medium' | 'high';
    notes: string;
    enteredPhase: PhaseId;
    bindingOfferSubmitted?: boolean;
    ddDropoutRisk?: number;
}
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
    deadline?: number;
    owner?: string;
    targetId?: string;
}
export type WorkstreamId = 'preparation' | 'financials' | 'marketing_materials' | 'buyer_outreach' | 'management' | 'due_diligence' | 'negotiation' | 'closing';
export interface Workstream {
    id: WorkstreamId;
    name: string;
    progress: number;
    quality: number;
    active: boolean;
}
export type DeliverableStatus = 'not_started' | 'drafting' | 'in_review' | 'revision' | 'approved' | 'delivered';
export type QualityTier = 'poor' | 'adequate' | 'good' | 'excellent';
export interface Deliverable {
    id: string;
    name: string;
    phase: PhaseId;
    status: DeliverableStatus;
    completion: number;
    quality: QualityTier;
    owner?: string;
    dependencies?: string[];
    deadline?: number;
}
export type RiskCategory = 'client' | 'buyer' | 'diligence' | 'legal' | 'financing' | 'timing' | 'team' | 'market';
export type RiskSeverity = 'low' | 'medium' | 'high' | 'critical';
export interface Risk {
    id: string;
    name: string;
    description: string;
    category: RiskCategory;
    severity: RiskSeverity;
    probability: number;
    mitigated: boolean;
    surfacedWeek: number;
    surfacedPhase: PhaseId;
}
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
export interface Headline {
    id: string;
    week: number;
    text: string;
    category: 'macro' | 'sector' | 'comparable' | 'competitor' | 'regulatory' | 'buyer_strategy';
}
export interface TeamMember {
    id: string;
    name: string;
    role: string;
    seniority: 'junior' | 'mid' | 'senior' | 'partner';
    capacity: number;
    morale: number;
    currentLoad: number;
    skills: string[];
    isContractor?: boolean;
    weeklyRate?: number;
}
export interface Client {
    name: string;
    companyName: string;
    sector: string;
    description: string;
    objectives: string[];
    valuationExpectation: string;
    valuationExpectationEV?: number;
    timeSensitivity: 'low' | 'medium' | 'high';
    riskTolerance: 'conservative' | 'moderate' | 'aggressive';
    trust: number;
    confidence: number;
}
export interface PhaseBudgetAllocation {
    phaseBase: number;
    carryover: number;
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
    investigation: InvestigationStatus;
    meetingDone: boolean;
    hiddenMotivations: string;
    hiddenGrowth: 'high' | 'moderate' | 'low';
    hiddenRisk: 'high' | 'moderate' | 'low';
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
    leadId?: string;
    recommendation: 'proceed' | 'decline';
    rationale: string;
    submittedWeek: number;
    status: 'pending' | 'approved' | 'rejected';
    boardNotes?: string;
}
export type StaffProfile = 'junior_analyst' | 'senior_analyst' | 'associate' | 'external_advisor';
export type ContractorProfile = 'freelance_analyst' | 'external_specialist' | 'secondment';
export interface TempCapacityAllocation {
    id: string;
    taskId: string;
    profile: ContractorProfile;
    weeklyRate: number;
    speedMultiplier: number;
}
export type RetainerType = 'none' | 'monthly' | 'per_phase' | 'upfront';
export type ClientNegotiationProfile = 'serious_reasonable' | 'serious_demanding' | 'unsure_optimistic' | 'unsure_reluctant';
export type ComponentReaction = 'green' | 'yellow' | 'red';
export interface NegotiationRound {
    round: number;
    playerRetainerType: RetainerType;
    playerRetainerAmount: number;
    playerSuccessFeePercent: number;
    playerRatchetEnabled: boolean;
    playerRatchetThresholdEV?: number;
    playerRatchetBonusPercent?: number;
    reactionRetainer: ComponentReaction;
    reactionSuccessFee: ComponentReaction;
    reactionRatchet: ComponentReaction;
    clientNote: string;
    outcome: 'counter' | 'accepted' | 'rejected';
}
export interface ClientNegotiationState {
    profile: ClientNegotiationProfile;
    reservationSuccessFeeMin: number;
    reservationSuccessFeeMax: number;
    reservationRetainerMin: number;
    priorityRetainer: number;
    prioritySuccessFee: number;
    priorityRatchet: number;
    patienceRemaining: number;
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
    totalFeeProjection: number;
    agreedWeek: number;
}
export type WarrantyScope = 'fundamental' | 'standard' | 'limited';
export type SPABuyerProfile = 'aggressive_buyer' | 'reasonable_buyer' | 'conservative_buyer';
export interface SPABuyerState {
    profile: SPABuyerProfile;
    reservationWarrantyCap: number;
    reservationEscrowPercent: number;
    priorityScope: number;
    priorityCap: number;
    priorityEscrow: number;
    priorityIndemnity: number;
    patienceRemaining: number;
    lockedComponents: ('scope' | 'cap' | 'escrow' | 'indemnity')[];
    revealedHints: string[];
    lockedWarrantyScope?: WarrantyScope;
    lockedWarrantyCap?: number;
    lockedEscrowPercent?: number;
}
export interface SPARound {
    round: number;
    playerWarrantyScope: WarrantyScope;
    playerWarrantyCap: number;
    playerEscrowPercent: number;
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
export type DataroomAccessLevel = 'restricted' | 'partial' | 'full';
export interface DataroomCategory {
    id: string;
    name: string;
    description: string;
    sensitivity: 'low' | 'medium' | 'high' | 'critical';
    accessLevel: DataroomAccessLevel;
}
export interface FinalOffer {
    buyerId: string;
    submittedPhase: PhaseId;
    submittedWeek: number;
    cashEV: number;
    earnoutAmount: number;
    earnoutConditions: string;
    totalEV: number;
    structure: 'full_cash' | 'mixed' | 'earnout_heavy';
    conditionality: 'clean' | 'light_conditions' | 'heavy_conditions';
    exclusivityRequested: boolean;
    impliedMultiple: number;
    advisorNote: string;
}
export interface Toast {
    id: string;
    message: string;
    type: 'success' | 'warning' | 'danger' | 'info';
}
export type MitigationActionId = 'golf_padel_dinner' | 'client_reference_intro' | 'conference_invite' | 'advance_pitch' | 'surge_staffing';
export interface CompetitorThreat {
    id: string;
    advisorName: string;
    surfacedWeek: number;
    usedActions: MitigationActionId[];
    resolved: boolean;
}
//# sourceMappingURL=game.d.ts.map