import { getActionsForPhase } from "./action-library.js";
import { DELIVERABLE_LIBRARY } from "./deliverable-library.js";
import { BUYER_STAGE_LABELS } from "./buyer-library.js";
import { clamp } from "./helpers.js";

export const GAME_STATE_VERSION = "0.8.0";

const BOUNDED_VARIABLE_KEYS = [
  "leadHeat",
  "accessLevel",
  "dataVisibility",
  "competitivePressure",
  "confidentialityRisk",
  "fitScore",
  "dataQuality",
  "executionReadiness",
  "outreachCoverage",
  "buyerResponseRate",
  "buyerConversionRate",
  "buyerHeat",
  "processMomentum",
  "responseBacklogPressure",
  "shortlistQuality",
  "competitiveTension",
  "clientAlignment",
  "offerReadiness",
  "nboCoverage",
  "offerComparability",
  "advancementClarity",
  "priceConfidence",
  "ddPressure",
  "issueContainment",
  "buyerConfidence",
  "retradeRisk",
  "fieldSurvival",
  "ddReadiness",
  "finalOfferStrength",
  "finalOfferComparability",
  "executableCertainty",
  "falseWinnerRisk",
  "backupBidderStrength",
  "exclusivityReadiness",
  "signingReadiness",
  "residualLegalDrag",
  "valueProtectionQuality",
  "clausePressure",
  "clausePackageComplexity",
  "concessionDiscipline",
  "fallbackLeverage",
  "preferredBidderStability",
  "falseClosureRisk",
  "paperFragility",
  "legalControl",
  "clientValueSensitivity",
  "signingChecklistProgress",
  "signingConfidence",
  "signability",
  "openItemMateriality",
  "openItemClosureRate",
  "documentStability",
  "coordinationQuality",
  "executionDiscipline",
  "counterpartyAlignment",
  "lastMilePressure",
  "ceremonyRisk",
  "realExecutionRisk",
  "signingTimingIntegrity",
  "closingPreparationQuality",
  "residualPostSigningFragility",
  "cpCompletion",
  "cpDrag",
  "cpComplexity",
  "interimRisk",
  "interimStability",
  "closingReadiness",
  "completionConfidence",
  "fundsFlowReadiness",
  "fundsFlowIntegrity",
  "signatureIntegrity",
  "paymentTimingIntegrity",
  "ownershipTransferReadiness",
  "delayRisk",
  "valueIntegrity",
  "closingExecutionQuality",
  "outcomeIntegrity",
  "clientOutcomeSatisfaction",
  "reputationOutcome",
  "feeRealisation",
  "rainmakerProgressImpact"
];

function buildInitialDeliverables() {
  return DELIVERABLE_LIBRARY.reduce((acc, def) => {
    acc[def.id] = { status: "empty", qualityTier: null, progress: 0 };
    return acc;
  }, {});
}

function initialInbox() {
  return [
    {
      id: "msg_bootstrap_001",
      week: 1,
      category: "Internal",
      title: "Lead surfaced: Project Atlas",
      text: "You have one active lead. Qualify before a competitor secures access."
    }
  ];
}

function initialRuntime() {
  return {
    lastResolvedTaskIds: [],
    lastEventIds: [],
    weeklySummary: null,
    taskCompletions: {},
    pendingEventIds: [],
    phaseEnteredWeek: 1,
    lastWeekPressure: 0,
    phase2Initialized: false,
    phase3Initialized: false,
    phase4Initialized: false,
    phase5Initialized: false,
    phase6Initialized: false,
    phase7Initialized: false,
    phase8Initialized: false,
    phase8Signed: false,
    phase9Initialized: false,
    phase9Stage: "inactive",
    phase9Closed: false,
    phase10Initialized: false
  };
}

function initialVariables() {
  return {
    leadHeat: 55,
    accessLevel: 20,
    dataVisibility: 10,
    competitivePressure: 15,
    confidentialityRisk: 20,
    fitScore: 50,
    dataQuality: 30,
    executionReadiness: 15,
    outreachCoverage: 0,
    buyerResponseRate: 0,
    buyerConversionRate: 0,
    buyerHeat: 0,
    processMomentum: 0,
    responseBacklogPressure: 0,
    shortlistQuality: 0,
    competitiveTension: 0,
    clientAlignment: 0,
    offerReadiness: 0,
    nboCoverage: 0,
    offerComparability: 0,
    advancementClarity: 0,
    priceConfidence: 0,
    ddPressure: 0,
    issueContainment: 0,
    buyerConfidence: 0,
    retradeRisk: 0,
    fieldSurvival: 0,
    ddReadiness: 0,
    finalOfferStrength: 0,
    finalOfferComparability: 0,
    executableCertainty: 0,
    falseWinnerRisk: 0,
    backupBidderStrength: 0,
    exclusivityReadiness: 0,
    signingReadiness: 0,
    residualLegalDrag: 0,
    valueProtectionQuality: 0,
    clausePressure: 0,
    clausePackageComplexity: 0,
    concessionDiscipline: 0,
    fallbackLeverage: 0,
    preferredBidderStability: 0,
    falseClosureRisk: 0,
    paperFragility: 0,
    legalControl: 0,
    clientValueSensitivity: 0,
    signingChecklistProgress: 0,
    signingConfidence: 0,
    signability: 0,
    openItemMateriality: 0,
    openItemClosureRate: 0,
    documentStability: 0,
    coordinationQuality: 0,
    executionDiscipline: 0,
    counterpartyAlignment: 0,
    lastMilePressure: 0,
    ceremonyRisk: 0,
    realExecutionRisk: 0,
    signingTimingIntegrity: 0,
    closingPreparationQuality: 0,
    residualPostSigningFragility: 0,
    cpCompletion: 0,
    cpDrag: 0,
    cpComplexity: 0,
    interimRisk: 0,
    interimStability: 0,
    closingReadiness: 0,
    completionConfidence: 0,
    fundsFlowReadiness: 0,
    fundsFlowIntegrity: 0,
    signatureIntegrity: 0,
    paymentTimingIntegrity: 0,
    ownershipTransferReadiness: 0,
    delayRisk: 0,
    valueIntegrity: 100,
    closingExecutionQuality: 0,
    outcomeIntegrity: 0,
    clientOutcomeSatisfaction: 0,
    reputationOutcome: 0,
    feeRealisation: 0,
    rainmakerProgressImpact: 0
  };
}

export function createInitialState(seed = Date.now()) {
  const normalizedSeed = Math.abs(Number(seed)) >>> 0 || 1;

  const state = {
    meta: { version: GAME_STATE_VERSION, rngSeed: normalizedSeed },
    deal: { id: "deal_001", name: "Project Atlas", phaseId: 0, status: "lead" },
    clock: { week: 1 },
    resources: { budget: 150, maxCapacity: 60, usedCapacity: 0, pressure: 0 },
    team: { morale: 85 },
    variables: initialVariables(),
    workstreams: {
      targetIntelligence: { progress: 0, quality: 0 },
      relationshipDevelopment: { progress: 0, quality: 0 },
      qualification: { progress: 0, quality: 0 },
      valuationFraming: { progress: 0, quality: 0 },
      confidentialityConflicts: { progress: 0, quality: 0 },
      pitchReadiness: { progress: 0, quality: 0 }
    },
    deliverables: buildInitialDeliverables(),
    buyers: [],
    riskDebt: 0,
    inbox: initialInbox(),
    headlines: [],
    history: [],
    activeTasks: getActionsForPhase(0).map((task) => task.id),
    planning: { selectedTaskIds: [] },
    runtime: initialRuntime(),
    resultsBoard: null,
    ui: { selectedTaskId: null }
  };

  return recomputeDerivedState(state);
}

function normalizeBuyer(buyer, week) {
  const next = { ...buyer };
  next.stage = next.stage ?? "uncontacted";
  next.shortlistStatus = next.shortlistStatus ?? "none";
  next.visibleState = BUYER_STAGE_LABELS[next.stage] ?? next.visibleState ?? "No Reply";
  next.hiddenConviction = clamp(next.hiddenConviction ?? 45, 0, 100);
  next.pendingAction = Boolean(next.pendingAction);
  next.lastTouchedWeek = Number.isInteger(next.lastTouchedWeek) ? next.lastTouchedWeek : week;
  next.riskFlags = Array.isArray(next.riskFlags) ? next.riskFlags : [];
  next.scores = {
    strategicFit: clamp(next.scores?.strategicFit ?? 50, 0, 100),
    valuationPosture: clamp(next.scores?.valuationPosture ?? 50, 0, 100),
    executionCredibility: clamp(next.scores?.executionCredibility ?? 50, 0, 100)
  };
  next.phase3Score = clamp(next.phase3Score ?? 0, 0, 100);
  next.phase4Offer = {
    submitted: Boolean(next.phase4Offer?.submitted),
    onTime: Boolean(next.phase4Offer?.onTime),
    analyzed: Boolean(next.phase4Offer?.analyzed),
    advanced: Boolean(next.phase4Offer?.advanced),
    recommendation: next.phase4Offer?.recommendation ?? "undecided",
    headlineValue: Math.max(0, Number(next.phase4Offer?.headlineValue ?? 0)),
    normalizedValue:
      typeof next.phase4Offer?.normalizedValue === "number"
        ? Math.max(0, Number(next.phase4Offer.normalizedValue))
        : null,
    conditionality: clamp(next.phase4Offer?.conditionality ?? 50, 0, 100),
    certainty: clamp(next.phase4Offer?.certainty ?? 50, 0, 100),
    qualityScore: clamp(next.phase4Offer?.qualityScore ?? 0, 0, 100)
  };
  next.phase5Lane = {
    active: Boolean(next.phase5Lane?.active),
    status: next.phase5Lane?.status ?? "inactive",
    confidence: clamp(next.phase5Lane?.confidence ?? 55, 0, 100),
    pendingQuestions: clamp(next.phase5Lane?.pendingQuestions ?? 0, 0, 999),
    issueLoad: clamp(next.phase5Lane?.issueLoad ?? 0, 0, 100),
    retradeRisk: clamp(next.phase5Lane?.retradeRisk ?? 0, 0, 100)
  };
  next.phase6Bid = {
    submitted: Boolean(next.phase6Bid?.submitted),
    analyzed: Boolean(next.phase6Bid?.analyzed),
    headlineValue: Math.max(0, Number(next.phase6Bid?.headlineValue ?? 0)),
    adjustedValue:
      typeof next.phase6Bid?.adjustedValue === "number"
        ? Math.max(0, Number(next.phase6Bid.adjustedValue))
        : null,
    executionRisk: clamp(next.phase6Bid?.executionRisk ?? 50, 0, 100),
    conditionalDrag: clamp(next.phase6Bid?.conditionalDrag ?? 0, 0, 100),
    recommendation: next.phase6Bid?.recommendation ?? "undecided",
    role: next.phase6Bid?.role ?? "none"
  };
  next.phase7Spa = {
    active: Boolean(next.phase7Spa?.active),
    role: next.phase7Spa?.role ?? "none",
    stabilityState: next.phase7Spa?.stabilityState ?? "inactive",
    clauseLoad: clamp(next.phase7Spa?.clauseLoad ?? 0, 0, 100),
    unresolvedBlocks: clamp(next.phase7Spa?.unresolvedBlocks ?? 0, 0, 100),
    lastMarkupSeverity: clamp(next.phase7Spa?.lastMarkupSeverity ?? 0, 0, 100)
  };
  next.phase8Signing = {
    active: Boolean(next.phase8Signing?.active),
    role: next.phase8Signing?.role ?? "none",
    status: next.phase8Signing?.status ?? "inactive",
    blockerCount: clamp(next.phase8Signing?.blockerCount ?? 0, 0, 100),
    versionSync: clamp(next.phase8Signing?.versionSync ?? 0, 0, 100),
    ceremonyReadiness: clamp(next.phase8Signing?.ceremonyReadiness ?? 0, 0, 100)
  };
  next.phase9Closing = {
    active: Boolean(next.phase9Closing?.active),
    role: next.phase9Closing?.role ?? "none",
    status: next.phase9Closing?.status ?? "inactive",
    cpProgress: clamp(next.phase9Closing?.cpProgress ?? 0, 0, 100),
    executionReadiness: clamp(next.phase9Closing?.executionReadiness ?? 0, 0, 100),
    fundsReadiness: clamp(next.phase9Closing?.fundsReadiness ?? 0, 0, 100)
  };
  next.notes = Array.isArray(next.notes) ? next.notes : [];
  return next;
}

export function recomputeDerivedState(state) {
  const next = state;

  next.resources.usedCapacity = clamp(next.resources.usedCapacity, 0, 999);
  next.resources.maxCapacity = Math.max(1, next.resources.maxCapacity);
  next.resources.pressure = Number((next.resources.usedCapacity / next.resources.maxCapacity).toFixed(2));

  BOUNDED_VARIABLE_KEYS.forEach((key) => {
    if (typeof next.variables[key] !== "number") next.variables[key] = 0;
    next.variables[key] = clamp(next.variables[key], 0, 100);
  });

  Object.values(next.workstreams).forEach((ws) => {
    ws.progress = clamp(ws.progress, 0, 100);
    ws.quality = clamp(ws.quality, 0, 100);
  });

  next.team.morale = clamp(next.team.morale, 0, 100);
  next.riskDebt = clamp(next.riskDebt, 0, 999);

  Object.values(next.deliverables).forEach((deliverable) => {
    deliverable.progress = clamp(deliverable.progress, 0, 100);
    if (deliverable.progress <= 0) {
      deliverable.status = "empty";
      deliverable.qualityTier = null;
      return;
    }

    if (deliverable.progress < 60) {
      deliverable.status = "drafting";
      if (deliverable.qualityTier && deliverable.progress < 50) {
        deliverable.qualityTier = null;
      }
      return;
    }

    deliverable.status = "complete";
  });

  if (typeof next.resultsBoard !== "object" || next.resultsBoard === null) {
    next.resultsBoard = null;
  }

  if (!Array.isArray(next.buyers)) {
    next.buyers = [];
  } else {
    next.buyers = next.buyers.map((buyer) => normalizeBuyer(buyer, next.clock.week));
  }

  return next;
}

export function hydrateState(candidate) {
  try {
    const fresh = createInitialState(1);
    const merged = {
      ...fresh,
      ...candidate,
      meta: { ...fresh.meta, ...(candidate?.meta ?? {}) },
      deal: { ...fresh.deal, ...(candidate?.deal ?? {}) },
      clock: { ...fresh.clock, ...(candidate?.clock ?? {}) },
      resources: { ...fresh.resources, ...(candidate?.resources ?? {}) },
      team: { ...fresh.team, ...(candidate?.team ?? {}) },
      variables: { ...initialVariables(), ...(candidate?.variables ?? {}) },
      workstreams: { ...fresh.workstreams, ...(candidate?.workstreams ?? {}) },
      deliverables: { ...fresh.deliverables, ...(candidate?.deliverables ?? {}) },
      planning: { ...fresh.planning, ...(candidate?.planning ?? {}) },
      runtime: { ...initialRuntime(), ...(candidate?.runtime ?? {}) },
      ui: { ...fresh.ui, ...(candidate?.ui ?? {}) }
    };

    if (!Array.isArray(merged.inbox)) merged.inbox = fresh.inbox;
    if (!Array.isArray(merged.headlines)) merged.headlines = [];
    if (!Array.isArray(merged.history)) merged.history = [];
    if (!Array.isArray(merged.activeTasks)) merged.activeTasks = getActionsForPhase(merged.deal.phaseId).map((task) => task.id);
    if (!Array.isArray(merged.buyers)) merged.buyers = [];
    if (!Array.isArray(merged.runtime.pendingEventIds)) merged.runtime.pendingEventIds = [];
    if (typeof merged.runtime.taskCompletions !== "object" || merged.runtime.taskCompletions === null) {
      merged.runtime.taskCompletions = {};
    }

    if (!Number.isInteger(merged.meta.rngSeed)) merged.meta.rngSeed = 1;

    return recomputeDerivedState(merged);
  } catch (_error) {
    return createInitialState();
  }
}












