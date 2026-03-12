import { COMPLEXITY_BASE_PROBABILITY, canExecuteAction, getActionById, getActionsForPhase } from "./action-library.js";
import { createBuyerUniverse, updateBuyerLabel } from "./buyer-library.js";
import { getEventById, getEventPool } from "./event-library.js";
import { getPhaseGateStatus } from "./phase-definitions.js";
import { applyDelta, clamp, deepClone, pickOne, pressureBand, randomInt, rollChance } from "./helpers.js";
import { recomputeDerivedState } from "./game-state.js";

const HEADLINES = [
  "Macro sentiment stable; no major financing shock this week.",
  "Sector chatter points to disciplined buyer behavior.",
  "Private capital remains selective on process quality.",
  "Comparable transactions suggest mixed valuation signals.",
  "Selective PE dry powder remains active in high-quality processes.",
  "Corporate strategy teams are prioritizing cleaner execution certainty."
];

function buyerCounts(state) {
  return {
    total: state.buyers.length,
    contacted: state.buyers.filter((buyer) => buyer.stage !== "uncontacted").length,
    engaged: state.buyers.filter((buyer) => ["nda_requested", "nda_signed", "im_access", "soft_pass"].includes(buyer.stage)).length,
    converted: state.buyers.filter((buyer) => ["nda_signed", "im_access"].includes(buyer.stage)).length,
    imAccess: state.buyers.filter((buyer) => buyer.stage === "im_access").length,
    backlog: state.buyers.filter((buyer) => buyer.pendingAction).length,
    shortlisted: state.buyers.filter((buyer) => buyer.shortlistStatus === "shortlisted").length,
    candidates: state.buyers.filter((buyer) => ["shortlisted", "candidate"].includes(buyer.shortlistStatus)).length,
    nboSubmitted: state.buyers.filter((buyer) => buyer.phase4Offer?.submitted).length,
    nboAnalyzed: state.buyers.filter((buyer) => buyer.phase4Offer?.analyzed).length,
    nboAdvanced: state.buyers.filter((buyer) => buyer.phase4Offer?.advanced).length,
    ddActive: state.buyers.filter((buyer) => buyer.phase5Lane?.active && buyer.phase5Lane?.status !== "dropped").length,
    ddStable: state.buyers.filter((buyer) => buyer.phase5Lane?.active && buyer.phase5Lane?.status === "stable").length,
    ddRisk: state.buyers.filter((buyer) => buyer.phase5Lane?.active && ["risk", "conditional", "stressed"].includes(buyer.phase5Lane?.status)).length,
    ddDropped: state.buyers.filter((buyer) => buyer.phase5Lane?.status === "dropped").length,
    finalSubmitted: state.buyers.filter((buyer) => buyer.phase6Bid?.submitted).length,
    finalAnalyzed: state.buyers.filter((buyer) => buyer.phase6Bid?.analyzed).length,
    finalPreferred: state.buyers.filter((buyer) => buyer.phase6Bid?.role === "preferred").length,
    finalBackup: state.buyers.filter((buyer) => buyer.phase6Bid?.role === "backup").length,
    spaActive: state.buyers.filter((buyer) => buyer.phase7Spa?.active).length,
    spaPreferred: state.buyers.filter((buyer) => buyer.phase7Spa?.role === "preferred").length,
    spaBackup: state.buyers.filter((buyer) => buyer.phase7Spa?.role === "backup").length,
    signingActive: state.buyers.filter((buyer) => buyer.phase8Signing?.active).length,
    signingReady: state.buyers.filter((buyer) => buyer.phase8Signing?.status === "ready").length,
    signingBlocked: state.buyers.filter((buyer) => buyer.phase8Signing?.status === "blocked").length,
    signingSigned: state.buyers.filter((buyer) => buyer.phase8Signing?.status === "signed").length,
    closingActive: state.buyers.filter((buyer) => buyer.phase9Closing?.active).length,
    closingReady: state.buyers.filter((buyer) => ["ready_to_close", "clean_close", "completion_reduced", "closed"].includes(buyer.phase9Closing?.status)).length,
    closingWarning: state.buyers.filter((buyer) => ["fragile_pending", "funds_warning", "execution_risk", "stable_delayed"].includes(buyer.phase9Closing?.status)).length,
    closingClosed: state.buyers.filter((buyer) => ["clean_close", "completion_reduced", "closed"].includes(buyer.phase9Closing?.status)).length
  };
}

function emptyOfferState() {
  return {
    submitted: false,
    onTime: false,
    analyzed: false,
    advanced: false,
    recommendation: "undecided",
    headlineValue: 0,
    normalizedValue: null,
    conditionality: 50,
    certainty: 50,
    qualityScore: 0
  };
}

function emptyPhase5LaneState() {
  return {
    active: false,
    status: "inactive",
    confidence: 55,
    pendingQuestions: 0,
    issueLoad: 0,
    retradeRisk: 0
  };
}

function emptyPhase6BidState() {
  return {
    submitted: false,
    analyzed: false,
    headlineValue: 0,
    adjustedValue: null,
    executionRisk: 50,
    conditionalDrag: 0,
    recommendation: "undecided",
    role: "none"
  };
}

function emptyPhase7SpaState() {
  return {
    active: false,
    role: "none",
    stabilityState: "inactive",
    clauseLoad: 0,
    unresolvedBlocks: 0,
    lastMarkupSeverity: 0
  };
}

function emptyPhase8SigningState() {
  return {
    active: false,
    role: "none",
    status: "inactive",
    blockerCount: 0,
    versionSync: 0,
    ceremonyReadiness: 0
  };
}

function emptyPhase9ClosingState() {
  return {
    active: false,
    role: "none",
    status: "inactive",
    cpProgress: 0,
    executionReadiness: 0,
    fundsReadiness: 0
  };
}

function adjustedBidValue(bid) {
  return typeof bid?.adjustedValue === "number" ? bid.adjustedValue : bid?.headlineValue ?? 0;
}

function computePhase6BidScore(bid) {
  const adjusted = adjustedBidValue(bid);
  const valueScore = clamp(Math.round((adjusted / 165) * 100), 0, 100);
  const executionScore = clamp(100 - (bid.executionRisk ?? 50), 0, 100);
  const structureScore = clamp(100 - (bid.conditionalDrag ?? 0), 0, 100);
  return clamp(Math.round(valueScore * 0.5 + executionScore * 0.35 + structureScore * 0.15), 0, 100);
}

function buildPhase6BidForBuyer(state, buyer) {
  const baseOffer = buyer.phase4Offer ?? {};
  const lane = buyer.phase5Lane ?? {};
  const normalizedNbo = typeof baseOffer.normalizedValue === "number" ? baseOffer.normalizedValue : baseOffer.headlineValue ?? 70;

  const confidence = lane.confidence ?? 55;
  const issueLoad = lane.issueLoad ?? 25;
  const retradeRisk = lane.retradeRisk ?? 30;
  const convictionBoost = (buyer.hiddenConviction - 50) * 0.18;
  const typePremium = buyer.type === "Strategic" ? 4 : 1;

  const headlineValue = clamp(
    Math.round(
      normalizedNbo + 6 + convictionBoost + confidence * 0.08 - retradeRisk * 0.06 + typePremium + randomInt(state, -6, 9)
    ),
    35,
    185
  );

  const conditionalDrag = clamp(
    Math.round(
      retradeRisk * 0.45 + issueLoad * 0.5 + (buyer.type === "Sponsor" ? 6 : 2) + randomInt(state, -5, 7)
    ),
    5,
    90
  );

  const executionRisk = clamp(
    Math.round(60 - confidence * 0.45 + retradeRisk * 0.55 + issueLoad * 0.25 + randomInt(state, -7, 7)),
    2,
    95
  );

  const adjustedValue = clamp(Math.round(headlineValue - conditionalDrag * 0.4 + randomInt(state, -3, 3)), 25, 190);
  const submittedProbability = clamp(
    0.7 + (buyer.hiddenConviction - 50) / 260 + (lane.status === "stable" ? 0.1 : 0) - (retradeRisk > 60 ? 0.08 : 0),
    0.35,
    0.97
  );

  return {
    ...emptyPhase6BidState(),
    submitted: rollChance(state, submittedProbability),
    headlineValue,
    adjustedValue,
    executionRisk,
    conditionalDrag
  };
}


function classifyScore(score, bands) {
  for (const band of bands) {
    if (score >= band.min) return band.label;
  }
  return bands[bands.length - 1]?.label ?? "Unknown";
}

function derivePhase10DealOutcome(state) {
  if (state.deal.status === "failed" || !state.runtime.phase9Closed) {
    return { key: "deal_failed", label: "Deal Failed" };
  }

  if (state.variables.closingExecutionQuality >= 88 && state.variables.delayRisk <= 22 && state.variables.valueIntegrity >= 90) {
    return { key: "excellent_close", label: "Excellent Close" };
  }

  if (state.variables.closingExecutionQuality >= 82 && state.variables.delayRisk <= 32) {
    return { key: "clean_close", label: "Clean Close" };
  }

  if (state.variables.closingExecutionQuality >= 68) {
    return { key: "closed_with_friction", label: "Closed with Friction" };
  }

  return { key: "closed_degraded", label: "Closed with Degraded Outcome" };
}

function buildPhase10KeyDrivers(state, board) {
  const drivers = [];

  if (state.variables.shortlistQuality >= 70 && state.variables.competitiveTension >= 60) {
    drivers.push("Strong shortlist composition improved competitive tension and pricing discipline.");
  }

  if (state.variables.ddPressure >= 55 || state.variables.issueContainment < 58) {
    drivers.push("Heavy DD pressure reduced execution headroom and increased transaction friction.");
  }

  if (state.variables.signingReadiness >= 82 && state.variables.residualLegalDrag <= 18) {
    drivers.push("Clean SPA packaging and signing discipline improved closing control.");
  }

  if (state.variables.fallbackLeverage < 30 && state.variables.falseWinnerRisk >= 45) {
    drivers.push("Weak fallback leverage reduced negotiating power in the final stretch.");
  }

  if (state.variables.closingExecutionQuality >= 82 && state.variables.delayRisk <= 32) {
    drivers.push("Disciplined closing execution protected value and client confidence.");
  }

  if (state.team.morale < 55) {
    drivers.push("Sustained pressure eroded team morale and reduced post-deal energy.");
  }

  if (state.riskDebt >= 120) {
    drivers.push("Accumulated risk debt weakened process resilience over the full mandate.");
  }

  if (board.financial.netProjectProfit < 0) {
    drivers.push("Project economics were undermined by cost intensity relative to fee realisation.");
  }

  if (drivers.length < 3) {
    drivers.push("Execution remained controlled across major phases, limiting avoidable volatility.");
    drivers.push("Client communication quality influenced final trust and relationship durability.");
    drivers.push("Outcome quality was shaped by both economics and process discipline.");
  }

  return drivers.slice(0, 5);
}

function buildPhase10ResultsBoardState(state) {
  const outcome = derivePhase10DealOutcome(state);
  const preferredBidder = state.buyers.find((buyer) => buyer.phase6Bid?.role === "preferred") ?? null;
  const preferredValue = preferredBidder ? adjustedBidValue(preferredBidder.phase6Bid) : state.variables.finalOfferStrength;

  const closingValue = state.runtime.phase9Closed ? Math.round(Math.max(35, preferredValue) * 1_000_000) : 0;
  const feePercent = 0.015;
  const feeRealisationFactor = state.runtime.phase9Closed
    ? clamp((state.variables.feeRealisation || 60) / 100, 0.35, 1)
    : 0;

  const successFee = Math.round(closingValue * feePercent * feeRealisationFactor);

  const initialBudgetUnits = 150;
  const budgetUnitValue = 12000;
  const spentBudgetUnits = clamp(initialBudgetUnits - state.resources.budget, 0, 999);

  const internalCost = Math.round(spentBudgetUnits * budgetUnitValue + state.clock.week * 1800);
  const externalCost = Math.round(
    Math.max(0, state.riskDebt - 20) * 2800 +
      state.variables.delayRisk * 2500 +
      state.variables.cpDrag * 1200
  );

  const projectCost = internalCost + externalCost;
  const netProjectProfit = successFee - projectCost;
  const projectMargin = successFee > 0 ? netProjectProfit / successFee : 0;
  const budgetVariance = Math.round(initialBudgetUnits * budgetUnitValue - projectCost);

  const feeScore = clamp(Math.round((successFee / 2_500_000) * 100), 0, 100);
  const marginScore = clamp(Math.round((projectMargin + 0.25) * 120), 0, 100);
  const profitScore = clamp(Math.round(50 + (netProjectProfit / Math.max(projectCost, 1)) * 40), 0, 100);
  const costControlScore = clamp(
    Math.round(50 + (budgetVariance / Math.max(initialBudgetUnits * budgetUnitValue, 1)) * 70),
    0,
    100
  );

  const financialScore = clamp(
    Math.round((state.runtime.phase9Closed ? 28 : 0) + feeScore * 0.24 + marginScore * 0.28 + profitScore * 0.25 + costControlScore * 0.23),
    0,
    100
  );

  const clientSatisfaction = clamp(
    Math.round(
      state.variables.clientOutcomeSatisfaction * 0.55 +
        state.variables.clientAlignment * 0.2 +
        state.variables.valueIntegrity * 0.15 +
        (state.runtime.phase9Closed ? 6 : -14)
    ),
    0,
    100
  );

  const clientTrust = clamp(
    Math.round(
      state.variables.clientAlignment * 0.4 +
        state.variables.reputationOutcome * 0.3 +
        (100 - state.variables.delayRisk) * 0.15 +
        state.variables.processMomentum * 0.15
    ),
    0,
    100
  );

  const expectationFit = clamp(
    Math.round(
      state.variables.valueIntegrity * 0.45 +
        state.variables.outcomeIntegrity * 0.35 +
        state.variables.finalOfferStrength * 0.2
    ),
    0,
    100
  );

  const rehireProbability = clamp(
    Math.round(clientSatisfaction * 0.45 + clientTrust * 0.4 + (state.runtime.phase9Closed ? 10 : -15)),
    0,
    100
  );

  const referralProbability = clamp(
    Math.round(clientSatisfaction * 0.35 + clientTrust * 0.35 + expectationFit * 0.3),
    0,
    100
  );

  const clientScore = clamp(
    Math.round(
      clientSatisfaction * 0.34 +
        clientTrust * 0.28 +
        expectationFit * 0.18 +
        rehireProbability * 0.1 +
        referralProbability * 0.1
    ),
    0,
    100
  );

  const burnout = clamp(
    Math.round((state.runtime.lastWeekPressure ?? 0) * 55 + state.riskDebt * 0.32 + (100 - state.team.morale) * 0.4),
    0,
    100
  );
  const cohesion = clamp(
    Math.round(state.team.morale * 0.45 + (100 - burnout) * 0.3 + state.variables.executionDiscipline * 0.25),
    0,
    100
  );
  const pride = clamp(
    Math.round(state.variables.outcomeIntegrity * 0.35 + state.variables.closingExecutionQuality * 0.35 + state.variables.reputationOutcome * 0.3),
    0,
    100
  );
  const retentionRisk = clamp(Math.round(burnout * 0.55 + (100 - state.team.morale) * 0.35 - pride * 0.2), 0, 100);

  const teamScore = clamp(
    Math.round(state.team.morale * 0.35 + (100 - burnout) * 0.25 + cohesion * 0.2 + pride * 0.2),
    0,
    100
  );

  const processQuality = clamp(
    Math.round(
      state.variables.dataQuality * 0.08 +
        state.variables.shortlistQuality * 0.12 +
        state.variables.ddReadiness * 0.12 +
        state.variables.finalOfferComparability * 0.12 +
        state.variables.signingReadiness * 0.12 +
        state.variables.closingExecutionQuality * 0.24 +
        (100 - clamp(state.riskDebt * 0.55, 0, 100)) * 0.2
    ),
    0,
    100
  );

  const buyerManagement = clamp(
    Math.round(state.variables.shortlistQuality * 0.35 + state.variables.buyerConfidence * 0.35 + state.variables.competitiveTension * 0.3),
    0,
    100
  );
  const confidentiality = clamp(100 - state.variables.confidentialityRisk, 0, 100);
  const riskControl = clamp(100 - clamp(state.riskDebt * 0.65 + Math.max(0, state.variables.delayRisk - 25) * 0.6, 0, 100), 0, 100);
  const negotiationQuality = clamp(
    Math.round(
      state.variables.concessionDiscipline * 0.25 +
        state.variables.fallbackLeverage * 0.2 +
        state.variables.executableCertainty * 0.25 +
        state.variables.finalOfferComparability * 0.15 +
        state.variables.valueProtectionQuality * 0.15
    ),
    0,
    100
  );
  const closingQuality = state.runtime.phase9Closed ? state.variables.closingExecutionQuality : clamp(state.variables.closingExecutionQuality * 0.6, 0, 100);

  const processScore = clamp(
    Math.round(
      processQuality * 0.28 +
        buyerManagement * 0.18 +
        confidentiality * 0.14 +
        riskControl * 0.16 +
        negotiationQuality * 0.12 +
        closingQuality * 0.12
    ),
    0,
    100
  );

  const reputationGain = Math.round((state.variables.reputationOutcome - 50) / 3 + (state.runtime.phase9Closed ? 6 : -8));
  const rainmakerScore = clamp(
    Math.round(
      state.variables.rainmakerProgressImpact * 0.45 +
        state.variables.reputationOutcome * 0.25 +
        processScore * 0.2 +
        clientScore * 0.1
    ),
    0,
    100
  );
  const futureDealFlowImpact = clamp(
    Math.round((rainmakerScore - 50) * 0.3 + (rehireProbability - 50) * 0.2),
    -30,
    30
  );
  const sectorCredibilityGain = clamp(
    Math.round((processScore - 45) * 0.25 + (state.runtime.phase9Closed ? 8 : -6)),
    -25,
    25
  );

  const careerImpactScore = clamp(
    Math.round(
      rainmakerScore * 0.55 +
        rehireProbability * 0.2 +
        referralProbability * 0.15 +
        clamp(50 + reputationGain * 2, 0, 100) * 0.1
    ),
    0,
    100
  );

  const overallDealScore = clamp(
    Number(
      (
        financialScore * 0.35 +
        clientScore * 0.2 +
        teamScore * 0.15 +
        processScore * 0.2 +
        careerImpactScore * 0.1
      ).toFixed(2)
    ),
    0,
    100
  );

  const overallGrade = classifyScore(overallDealScore, [
    { min: 90, label: "Elite Rainmaker Outcome" },
    { min: 75, label: "Excellent Outcome" },
    { min: 60, label: "Strong Outcome" },
    { min: 40, label: "Acceptable Outcome" },
    { min: 0, label: "Weak Outcome" }
  ]);

  const board = {
    phaseId: 10,
    generatedWeek: state.clock.week,
    dealOutcome: outcome.key,
    dealOutcomeLabel: outcome.label,
    financial: {
      closingValue,
      feePercent,
      successFee,
      internalCost,
      externalCost,
      projectCost,
      netProjectProfit,
      projectMargin,
      budgetVariance
    },
    client: {
      satisfaction: clientSatisfaction,
      trust: clientTrust,
      expectationFit,
      rehireProbability,
      referralProbability
    },
    team: {
      morale: state.team.morale,
      burnout,
      cohesion,
      pride,
      retentionRisk
    },
    process: {
      processQuality,
      buyerManagement,
      confidentiality,
      riskControl,
      negotiationQuality,
      closingQuality
    },
    career: {
      reputationGain,
      rainmakerScore,
      futureDealFlowImpact,
      sectorCredibilityGain
    },
    scores: {
      financialScore,
      clientScore,
      teamScore,
      processScore,
      careerImpactScore,
      overallDealScore,
      overallGrade
    },
    labels: {
      financial: classifyScore(financialScore, [
        { min: 80, label: "Excellent Economics" },
        { min: 65, label: "Strong Economics" },
        { min: 45, label: "Acceptable Economics" },
        { min: 0, label: "Weak Economics" }
      ]),
      client: classifyScore(clientScore, [
        { min: 85, label: "Trusted Advisor" },
        { min: 72, label: "Very Satisfied" },
        { min: 55, label: "Satisfied" },
        { min: 40, label: "Acceptable" },
        { min: 0, label: "Disappointed" }
      ]),
      team: classifyScore(teamScore, [
        { min: 82, label: "Energised" },
        { min: 68, label: "Strong" },
        { min: 52, label: "Stable" },
        { min: 35, label: "Strained" },
        { min: 0, label: "Burnt Out" }
      ])
    }
  };

  board.keyDrivers = buildPhase10KeyDrivers(state, board);
  return board;
}

function ensurePhase10Context(state, context) {
  if (state.deal.phaseId !== 10) return;
  if (state.runtime.phase10Initialized && state.resultsBoard) return;

  state.runtime.phase10Initialized = true;
  state.resultsBoard = buildPhase10ResultsBoardState(state);

  state.buyers.forEach((buyer) => {
    buyer.pendingAction = false;
    updateBuyerLabel(buyer);
  });

  context.generatedMessages.push({
    category: "Milestone",
    title: "Phase 10 results board ready",
    text: "The mandate is complete. Review economics, client outcome, team impact, process quality, and rainmaker progression."
  });
}
function ensurePhase2BuyerUniverse(state, context) {
  if (state.deal.phaseId !== 2) return;
  if (state.runtime.phase2Initialized && state.buyers.length) return;

  state.buyers = createBuyerUniverse(state, 6).map((buyer) => ({
    ...buyer,
    shortlistStatus: "none",
    phase3Score: 0,
    phase4Offer: emptyOfferState()
  }));
  state.runtime.phase2Initialized = true;

  const avgConviction = Math.round(
    state.buyers.reduce((acc, buyer) => acc + buyer.hiddenConviction, 0) / Math.max(state.buyers.length, 1)
  );

  state.variables.outreachCoverage = Math.max(state.variables.outreachCoverage, 20);
  state.variables.buyerHeat = Math.max(state.variables.buyerHeat, avgConviction);
  state.variables.processMomentum = Math.max(state.variables.processMomentum, 30);

  context.generatedMessages.push({
    category: "Milestone",
    title: "Buyer universe initialized",
    text: `${state.buyers.length} buyers are now active in outreach.`
  });
}

function computePhase3Score(buyer, state) {
  const convictionWeight = buyer.hiddenConviction * 0.35;
  const fitWeight = buyer.scores.strategicFit * 0.2;
  const postureWeight = buyer.scores.valuationPosture * 0.15;
  const executionWeight = buyer.scores.executionCredibility * 0.2;
  const momentumWeight = state.variables.processMomentum * 0.1;
  return clamp(Math.round(convictionWeight + fitWeight + postureWeight + executionWeight + momentumWeight), 0, 100);
}

function computePhase4QualityScore(offer) {
  const comparableValue = typeof offer.normalizedValue === "number" ? offer.normalizedValue : offer.headlineValue;
  const valueScore = clamp(Math.round((comparableValue / 140) * 100), 0, 100);
  const certaintyScore = clamp(Math.round(offer.certainty * 0.6 + (100 - offer.conditionality) * 0.4), 0, 100);
  return clamp(Math.round(valueScore * 0.55 + certaintyScore * 0.45), 0, 100);
}

function buildPhase4OfferForBuyer(state, buyer) {
  const headlineBase =
    50 + buyer.phase3Score * 0.5 + buyer.scores.valuationPosture * 0.25 + (buyer.type === "Strategic" ? 6 : 0);
  const headlineValue = clamp(Math.round(headlineBase + randomInt(state, -8, 8)), 45, 155);

  const riskPenalty = buyer.riskFlags.length * 5;
  const conditionalityBase =
    40 + (buyer.type === "Sponsor" ? 8 : 0) + (buyer.scores.executionCredibility < 60 ? 6 : 0) + riskPenalty;
  const conditionality = clamp(Math.round(conditionalityBase + randomInt(state, -8, 8)), 15, 90);

  const certainty = clamp(
    Math.round(100 - conditionality + buyer.scores.executionCredibility * 0.2 + randomInt(state, -8, 6)),
    25,
    95
  );

  const submitted = rollChance(
    state,
    clamp(0.66 + (buyer.hiddenConviction - 50) / 220 + (buyer.shortlistStatus === "shortlisted" ? 0.1 : 0), 0.35, 0.95)
  );

  const offer = {
    ...emptyOfferState(),
    submitted,
    onTime: submitted ? rollChance(state, 0.82) : false,
    headlineValue,
    conditionality,
    certainty
  };
  offer.qualityScore = computePhase4QualityScore(offer);
  return offer;
}

function ensurePhase3Context(state, context) {
  if (state.deal.phaseId !== 3) return;
  if (state.runtime.phase3Initialized) return;

  state.runtime.phase3Initialized = true;
  state.variables.shortlistQuality = Math.max(state.variables.shortlistQuality, 35);
  state.variables.competitiveTension = Math.max(state.variables.competitiveTension, 30);
  state.variables.clientAlignment = Math.max(
    state.variables.clientAlignment,
    Math.round((state.workstreams.relationshipDevelopment.quality + state.variables.leadHeat) / 2)
  );
  state.variables.offerReadiness = Math.max(state.variables.offerReadiness, 25);

  state.buyers.forEach((buyer) => {
    buyer.phase3Score = computePhase3Score(buyer, state);

    if (["im_access", "nda_signed", "nda_requested"].includes(buyer.stage)) {
      buyer.shortlistStatus = "candidate";
    } else if (buyer.stage === "soft_pass") {
      buyer.shortlistStatus = "dropped";
    } else {
      buyer.shortlistStatus = "none";
    }

    buyer.phase4Offer = { ...emptyOfferState() };
    updateBuyerLabel(buyer);
  });

  context.generatedMessages.push({
    category: "Milestone",
    title: "Phase 3 shortlist context initialized",
    text: "Buyer pool is now in shortlist analysis mode."
  });
}

function ensurePhase4Context(state, context) {
  if (state.deal.phaseId !== 4) return;
  if (state.runtime.phase4Initialized) return;

  state.runtime.phase4Initialized = true;
  const shortlisted = state.buyers.filter((buyer) => buyer.shortlistStatus === "shortlisted");

  shortlisted.forEach((buyer) => {
    buyer.phase4Offer = buildPhase4OfferForBuyer(state, buyer);
  });

  const minimumSubmitted = Math.min(shortlisted.length, 2);
  let submitted = shortlisted.filter((buyer) => buyer.phase4Offer?.submitted).length;

  if (submitted < minimumSubmitted) {
    shortlisted
      .filter((buyer) => !buyer.phase4Offer?.submitted)
      .sort((a, b) => b.phase3Score - a.phase3Score)
      .slice(0, minimumSubmitted - submitted)
      .forEach((buyer) => {
        buyer.phase4Offer.submitted = true;
        buyer.phase4Offer.onTime = true;
        buyer.phase4Offer.qualityScore = computePhase4QualityScore(buyer.phase4Offer);
      });
  }

  state.buyers.forEach((buyer) => {
    if (!buyer.phase4Offer) {
      buyer.phase4Offer = { ...emptyOfferState() };
    }

    if (!buyer.phase5Lane) {
      buyer.phase5Lane = { ...emptyPhase5LaneState() };
    }

    if (buyer.shortlistStatus !== "shortlisted") {
      buyer.phase4Offer = { ...emptyOfferState() };
      buyer.phase5Lane = { ...emptyPhase5LaneState() };
      buyer.pendingAction = false;
    } else {
      buyer.phase5Lane = { ...emptyPhase5LaneState() };
      buyer.pendingAction = Boolean(buyer.phase4Offer.submitted) && !buyer.phase4Offer.analyzed;
    }

    updateBuyerLabel(buyer);
  });

  submitted = shortlisted.filter((buyer) => buyer.phase4Offer?.submitted).length;
  const submittedRate = shortlisted.length ? Math.round((submitted / shortlisted.length) * 100) : 0;

  state.variables.nboCoverage = Math.max(state.variables.nboCoverage, submittedRate);
  state.variables.offerComparability = Math.max(state.variables.offerComparability, 20);
  state.variables.advancementClarity = Math.max(state.variables.advancementClarity, 25);
  state.variables.priceConfidence = Math.max(state.variables.priceConfidence, 22);
  state.variables.processMomentum = Math.max(state.variables.processMomentum, 45);

  context.generatedMessages.push({
    category: "Milestone",
    title: "Phase 4 NBO context initialized",
    text: `${submitted} of ${shortlisted.length} shortlisted buyers submitted NBOs.`
  });
}

function ensurePhase5Context(state, context) {
  if (state.deal.phaseId !== 5) return;
  if (state.runtime.phase5Initialized) return;

  state.runtime.phase5Initialized = true;
  const advanced = state.buyers.filter((buyer) => buyer.phase4Offer?.advanced);

  advanced.forEach((buyer) => {
    const baseConfidence = clamp(
      Math.round((buyer.phase4Offer?.certainty ?? 55) * 0.65 + (buyer.phase4Offer?.qualityScore ?? 55) * 0.25 + randomInt(state, -6, 6)),
      30,
      95
    );

    buyer.phase5Lane = {
      active: true,
      status: "stable",
      confidence: baseConfidence,
      pendingQuestions: randomInt(state, 5, 12),
      issueLoad: randomInt(state, 10, 35),
      retradeRisk: clamp(100 - baseConfidence + randomInt(state, 0, 8), 5, 70)
    };
    buyer.pendingAction = true;
    updateBuyerLabel(buyer);
  });

  state.buyers
    .filter((buyer) => !buyer.phase4Offer?.advanced)
    .forEach((buyer) => {
      buyer.phase5Lane = { ...emptyPhase5LaneState() };
      buyer.pendingAction = false;
      updateBuyerLabel(buyer);
    });

  const active = advanced.length;
  const avgConfidence = active
    ? Math.round(advanced.reduce((acc, buyer) => acc + buyer.phase5Lane.confidence, 0) / active)
    : 0;
  const avgQuestions = active
    ? Math.round(advanced.reduce((acc, buyer) => acc + buyer.phase5Lane.pendingQuestions, 0) / active)
    : 0;
  const avgIssueLoad = active
    ? Math.round(advanced.reduce((acc, buyer) => acc + buyer.phase5Lane.issueLoad, 0) / active)
    : 0;

  state.variables.fieldSurvival = clamp(active * 25, 0, 100);
  state.variables.buyerConfidence = Math.max(state.variables.buyerConfidence, avgConfidence);
  state.variables.ddPressure = Math.max(state.variables.ddPressure, clamp(avgQuestions * 6, 20, 95));
  state.variables.issueContainment = Math.max(state.variables.issueContainment, clamp(68 - avgIssueLoad / 2, 20, 75));
  state.variables.retradeRisk = Math.max(state.variables.retradeRisk, clamp(100 - avgConfidence + avgIssueLoad / 3, 10, 90));
  state.variables.ddReadiness = Math.max(state.variables.ddReadiness, 30);

  context.generatedMessages.push({
    category: "Milestone",
    title: "Phase 5 diligence lanes initialized",
    text: `${active} buyer lanes are active in due diligence.`
  });
}

function ensurePhase6Context(state, context) {
  if (state.deal.phaseId !== 6) return;
  if (state.runtime.phase6Initialized) return;

  state.runtime.phase6Initialized = true;
  const ddSurvivors = state.buyers.filter((buyer) => buyer.phase5Lane?.active && buyer.phase5Lane?.status !== "dropped");
  const finalists =
    ddSurvivors.length >= 2
      ? ddSurvivors
      : state.buyers
          .filter((buyer) => buyer.phase4Offer?.advanced)
          .sort((a, b) => (b.phase4Offer?.qualityScore ?? 0) - (a.phase4Offer?.qualityScore ?? 0))
          .slice(0, Math.max(2, ddSurvivors.length));

  finalists.forEach((buyer) => {
    buyer.phase6Bid = buildPhase6BidForBuyer(state, buyer);
    buyer.pendingAction = Boolean(buyer.phase6Bid.submitted) && !buyer.phase6Bid.analyzed;
    buyer.phase6Bid.role = "none";
    updateBuyerLabel(buyer);
  });

  let submitted = finalists.filter((buyer) => buyer.phase6Bid?.submitted).length;
  const minimumSubmitted = Math.min(finalists.length, 2);
  if (submitted < minimumSubmitted) {
    finalists
      .filter((buyer) => !buyer.phase6Bid?.submitted)
      .sort((a, b) => (b.phase5Lane?.confidence ?? 0) - (a.phase5Lane?.confidence ?? 0))
      .slice(0, minimumSubmitted - submitted)
      .forEach((buyer) => {
        buyer.phase6Bid.submitted = true;
        buyer.phase6Bid.adjustedValue = clamp(
          Math.round(buyer.phase6Bid.headlineValue - buyer.phase6Bid.conditionalDrag * 0.38),
          25,
          190
        );
        buyer.pendingAction = true;
      });
  }

  state.buyers
    .filter((buyer) => !finalists.includes(buyer))
    .forEach((buyer) => {
      buyer.phase6Bid = { ...emptyPhase6BidState() };
      buyer.pendingAction = false;
      updateBuyerLabel(buyer);
    });

  submitted = finalists.filter((buyer) => buyer.phase6Bid?.submitted).length;
  const submittedBids = finalists.filter((buyer) => buyer.phase6Bid?.submitted);
  const avgHeadline = submittedBids.length
    ? Math.round(submittedBids.reduce((acc, buyer) => acc + (buyer.phase6Bid?.headlineValue ?? 0), 0) / submittedBids.length)
    : 0;
  const avgExecutionRisk = submittedBids.length
    ? Math.round(submittedBids.reduce((acc, buyer) => acc + (buyer.phase6Bid?.executionRisk ?? 50), 0) / submittedBids.length)
    : 55;

  state.variables.finalOfferStrength = Math.max(
    state.variables.finalOfferStrength,
    clamp(Math.round((avgHeadline - 50) * 0.95 + submitted * 8), 0, 100)
  );
  state.variables.finalOfferComparability = Math.max(state.variables.finalOfferComparability, 25);
  state.variables.executableCertainty = Math.max(state.variables.executableCertainty, clamp(100 - avgExecutionRisk, 10, 95));
  state.variables.falseWinnerRisk = Math.max(state.variables.falseWinnerRisk, 28);
  state.variables.backupBidderStrength = Math.max(state.variables.backupBidderStrength, finalists.length >= 2 ? 35 : 0);
  state.variables.exclusivityReadiness = Math.max(
    state.variables.exclusivityReadiness,
    clamp(Math.round(state.variables.executableCertainty * 0.55 + state.variables.clientAlignment * 0.2), 0, 100)
  );
  state.variables.processMomentum = Math.max(state.variables.processMomentum, 48);

  context.generatedMessages.push({
    category: "Milestone",
    title: "Phase 6 final-offer context initialized",
    text: `${submitted} of ${finalists.length} finalist buyer(s) submitted final bids.`
  });
}

function ensurePhase7Context(state, context) {
  if (state.deal.phaseId !== 7) return;
  if (state.runtime.phase7Initialized) return;

  state.runtime.phase7Initialized = true;

  const submittedPool = state.buyers
    .filter((buyer) => buyer.phase6Bid?.submitted)
    .sort((a, b) => computePhase6BidScore(b.phase6Bid) - computePhase6BidScore(a.phase6Bid));

  let preferred = state.buyers.find((buyer) => buyer.phase6Bid?.role === "preferred") ?? submittedPool[0] ?? null;
  let backup = state.buyers.find((buyer) => buyer.phase6Bid?.role === "backup") ?? null;

  if (!backup && submittedPool.length >= 2) {
    backup = submittedPool.find((buyer) => !preferred || buyer.id !== preferred.id) ?? null;
  }

  if (preferred && preferred.phase6Bid?.role !== "preferred") {
    preferred.phase6Bid.role = "preferred";
  }

  if (backup && backup.phase6Bid?.role === "none") {
    backup.phase6Bid.role = "backup";
  }

  state.buyers.forEach((buyer) => {
    buyer.phase7Spa = { ...emptyPhase7SpaState() };
    buyer.pendingAction = false;
  });

  if (preferred) {
    preferred.phase7Spa.active = true;
    preferred.phase7Spa.role = "preferred";
    preferred.phase7Spa.stabilityState = "executable";
    preferred.phase7Spa.clauseLoad = clamp(Math.round(48 + randomInt(state, -6, 8)), 20, 90);
    preferred.phase7Spa.unresolvedBlocks = clamp(Math.round(62 + randomInt(state, -8, 10)), 20, 95);
    preferred.phase7Spa.lastMarkupSeverity = clamp(Math.round(52 + randomInt(state, -10, 12)), 10, 95);
    preferred.pendingAction = true;
  }

  if (backup) {
    backup.phase7Spa.active = true;
    backup.phase7Spa.role = "backup";
    backup.phase7Spa.stabilityState = "stretched";
    backup.phase7Spa.clauseLoad = clamp(Math.round(28 + randomInt(state, -5, 7)), 5, 70);
    backup.phase7Spa.unresolvedBlocks = clamp(Math.round(30 + randomInt(state, -6, 8)), 5, 75);
    backup.phase7Spa.lastMarkupSeverity = clamp(Math.round(32 + randomInt(state, -6, 8)), 0, 70);
  }

  const baselineLegalControl = clamp(
    Math.round(state.variables.finalOfferComparability * 0.45 + state.variables.clientAlignment * 0.25 + 18),
    15,
    90
  );
  const baselineStability = clamp(
    Math.round(72 - state.variables.falseWinnerRisk * 0.35 + state.variables.executableCertainty * 0.25 + randomInt(state, -5, 6)),
    20,
    92
  );
  const baselineClausePressure = clamp(
    Math.round(
      42 +
        (100 - state.variables.executableCertainty) * 0.35 +
        state.variables.falseWinnerRisk * 0.3 +
        (state.variables.backupBidderStrength < 45 ? 8 : 0) +
        randomInt(state, -6, 8)
    ),
    20,
    95
  );

  state.variables.legalControl = Math.max(state.variables.legalControl, baselineLegalControl);
  state.variables.preferredBidderStability = Math.max(state.variables.preferredBidderStability, baselineStability);
  state.variables.fallbackLeverage = Math.max(
    state.variables.fallbackLeverage,
    clamp(Math.round(state.variables.backupBidderStrength * 0.9 + (backup ? 6 : -8)), 0, 100)
  );
  state.variables.valueProtectionQuality = Math.max(
    state.variables.valueProtectionQuality,
    clamp(Math.round(58 + state.variables.executableCertainty * 0.22 - state.variables.falseWinnerRisk * 0.18), 25, 92)
  );
  state.variables.clausePressure = Math.max(state.variables.clausePressure, baselineClausePressure);
  state.variables.clausePackageComplexity = Math.max(
    state.variables.clausePackageComplexity,
    clamp(Math.round(56 + randomInt(state, -8, 10)), 20, 95)
  );
  state.variables.concessionDiscipline = Math.max(
    state.variables.concessionDiscipline,
    clamp(Math.round(state.variables.clientAlignment * 0.45 + 18), 15, 80)
  );
  state.variables.clientValueSensitivity = Math.max(
    state.variables.clientValueSensitivity,
    clamp(Math.round(64 - state.variables.clientAlignment * 0.18 + randomInt(state, -6, 8)), 20, 95)
  );
  state.variables.residualLegalDrag = Math.max(
    state.variables.residualLegalDrag,
    clamp(Math.round(64 + baselineClausePressure * 0.2 - baselineLegalControl * 0.15), 20, 95)
  );
  state.variables.falseClosureRisk = Math.max(
    state.variables.falseClosureRisk,
    clamp(Math.round(18 + state.variables.clausePackageComplexity * 0.25 - state.variables.legalControl * 0.12), 5, 85)
  );
  state.variables.paperFragility = Math.max(
    state.variables.paperFragility,
    clamp(Math.round((100 - state.variables.valueProtectionQuality) * 0.55 + state.variables.falseClosureRisk * 0.3), 5, 85)
  );
  state.variables.signingChecklistProgress = Math.max(state.variables.signingChecklistProgress, 0);
  state.variables.signingReadiness = Math.max(
    state.variables.signingReadiness,
    clamp(
      Math.round(
        (100 - state.variables.residualLegalDrag) * 0.35 +
          state.variables.preferredBidderStability * 0.3 +
          state.variables.legalControl * 0.2 +
          state.variables.exclusivityReadiness * 0.15
      ),
      10,
      75
    )
  );
  state.variables.processMomentum = Math.max(state.variables.processMomentum, 52);

  state.buyers.forEach((buyer) => updateBuyerLabel(buyer));

  context.generatedMessages.push({
    category: "Milestone",
    title: "Phase 7 SPA context initialized",
    text: preferred
      ? `${preferred.name} entered SPA as preferred bidder${backup ? ` with ${backup.name} as fallback leverage.` : "."}`
      : "No clear preferred bidder found; SPA started under unstable leverage."
  });
}


function ensurePhase8Context(state, context) {
  if (state.deal.phaseId !== 8) return;
  if (state.runtime.phase8Initialized) return;

  state.runtime.phase8Initialized = true;
  state.runtime.phase8Signed = false;

  const preferred =
    state.buyers.find((buyer) => buyer.phase7Spa?.role === "preferred") ??
    state.buyers.find((buyer) => buyer.phase6Bid?.role === "preferred") ??
    null;
  const backup =
    state.buyers.find((buyer) => buyer.phase7Spa?.role === "backup") ??
    state.buyers.find((buyer) => buyer.phase6Bid?.role === "backup") ??
    null;

  state.buyers.forEach((buyer) => {
    buyer.phase8Signing = { ...emptyPhase8SigningState() };
    buyer.pendingAction = false;
  });

  if (preferred) {
    preferred.phase8Signing.active = true;
    preferred.phase8Signing.role = "preferred";
    preferred.phase8Signing.status = "fragile";
    preferred.phase8Signing.blockerCount = clamp(Math.round(state.variables.residualLegalDrag * 0.45 + randomInt(state, -2, 4)), 5, 50);
    preferred.phase8Signing.versionSync = clamp(Math.round(state.variables.legalControl * 0.6 + randomInt(state, -6, 6)), 20, 90);
    preferred.phase8Signing.ceremonyReadiness = clamp(Math.round(state.variables.signingReadiness * 0.55 + randomInt(state, -5, 5)), 10, 85);
    preferred.pendingAction = true;
  }

  if (backup) {
    backup.phase8Signing.active = true;
    backup.phase8Signing.role = "backup";
    backup.phase8Signing.status = "aligned";
    backup.phase8Signing.blockerCount = clamp(Math.round(state.variables.residualLegalDrag * 0.25 + randomInt(state, -2, 3)), 0, 35);
    backup.phase8Signing.versionSync = clamp(Math.round(state.variables.fallbackLeverage * 0.7 + randomInt(state, -5, 5)), 15, 85);
    backup.phase8Signing.ceremonyReadiness = clamp(Math.round(state.variables.preferredBidderStability * 0.45 + randomInt(state, -4, 4)), 10, 80);
  }

  state.variables.signingConfidence = Math.max(
    state.variables.signingConfidence,
    clamp(
      Math.round(
        state.variables.signingReadiness * 0.55 +
          state.variables.preferredBidderStability * 0.2 +
          (100 - state.variables.residualLegalDrag) * 0.15 +
          state.variables.clientAlignment * 0.1
      ),
      20,
      88
    )
  );

  state.variables.signability = Math.max(
    state.variables.signability,
    clamp(Math.round(100 - state.variables.falseClosureRisk * 0.55 - state.variables.paperFragility * 0.35), 20, 92)
  );

  state.variables.openItemMateriality = Math.max(
    state.variables.openItemMateriality,
    clamp(Math.round(state.variables.residualLegalDrag * 0.6 + state.variables.falseClosureRisk * 0.25), 10, 95)
  );

  state.variables.openItemClosureRate = Math.max(
    state.variables.openItemClosureRate,
    clamp(Math.round(100 - state.variables.residualLegalDrag * 0.8), 10, 85)
  );

  state.variables.documentStability = Math.max(
    state.variables.documentStability,
    clamp(Math.round(state.variables.signability * 0.45 + state.variables.legalControl * 0.4), 15, 90)
  );

  state.variables.coordinationQuality = Math.max(
    state.variables.coordinationQuality,
    clamp(Math.round(state.variables.clientAlignment * 0.45 + state.variables.preferredBidderStability * 0.35), 15, 90)
  );

  state.variables.executionDiscipline = Math.max(
    state.variables.executionDiscipline,
    clamp(Math.round(state.variables.concessionDiscipline * 0.55 + state.variables.legalControl * 0.25), 10, 90)
  );

  state.variables.counterpartyAlignment = Math.max(
    state.variables.counterpartyAlignment,
    clamp(Math.round(state.variables.preferredBidderStability * 0.65 + state.variables.fallbackLeverage * 0.15), 10, 90)
  );

  state.variables.signingTimingIntegrity = Math.max(
    state.variables.signingTimingIntegrity,
    clamp(Math.round(state.variables.processMomentum * 0.45 + state.variables.exclusivityReadiness * 0.25), 10, 90)
  );

  state.variables.lastMilePressure = Math.max(
    state.variables.lastMilePressure,
    clamp(Math.round(38 + (100 - state.variables.signingTimingIntegrity) * 0.35), 10, 95)
  );

  state.variables.ceremonyRisk = Math.max(
    state.variables.ceremonyRisk,
    clamp(Math.round((100 - state.variables.coordinationQuality) * 0.55 + state.variables.lastMilePressure * 0.25), 8, 90)
  );

  state.variables.realExecutionRisk = Math.max(
    state.variables.realExecutionRisk,
    clamp(Math.round((100 - state.variables.signability) * 0.65 + state.variables.paperFragility * 0.2), 8, 90)
  );

  state.variables.closingPreparationQuality = Math.max(
    state.variables.closingPreparationQuality,
    clamp(Math.round(state.variables.signingChecklistProgress * 0.4 + state.variables.legalControl * 0.35), 10, 90)
  );

  state.variables.residualPostSigningFragility = Math.max(
    state.variables.residualPostSigningFragility,
    clamp(Math.round(state.variables.falseClosureRisk * 0.45 + state.variables.paperFragility * 0.35), 10, 90)
  );

  state.buyers.forEach((buyer) => updateBuyerLabel(buyer));

  context.generatedMessages.push({
    category: "Milestone",
    title: "Phase 8 signing context initialized",
    text: preferred
      ? `${preferred.name} moved into signing execution; remaining blockers must be cleared before signature.`
      : "Signing phase started without a clear preferred signer; execution risk is elevated."
  });
}
function ensurePhase9Context(state, context) {
  if (state.deal.phaseId !== 9) return;
  if (state.runtime.phase9Initialized) return;

  state.runtime.phase9Initialized = true;
  state.runtime.phase9Stage = "9A_PreClosing";
  state.runtime.phase9Closed = false;
  if (state.deal.status !== "closed") state.deal.status = "active";

  const preferred =
    state.buyers.find((buyer) => buyer.phase8Signing?.role === "preferred") ??
    state.buyers.find((buyer) => buyer.phase7Spa?.role === "preferred") ??
    state.buyers.find((buyer) => buyer.phase6Bid?.role === "preferred") ??
    null;

  const backup =
    state.buyers.find((buyer) => buyer.phase8Signing?.role === "backup") ??
    state.buyers.find((buyer) => buyer.phase7Spa?.role === "backup") ??
    state.buyers.find((buyer) => buyer.phase6Bid?.role === "backup") ??
    null;

  state.buyers.forEach((buyer) => {
    buyer.phase9Closing = { ...emptyPhase9ClosingState() };
    buyer.pendingAction = false;
  });

  const old = state.variables;

  state.variables.cpComplexity = Math.max(
    state.variables.cpComplexity,
    clamp(
      Math.round(
        42 +
          old.residualPostSigningFragility * 0.3 +
          (100 - old.documentStability) * 0.22 +
          (old.ceremonyRisk > 35 ? 6 : 0)
      ),
      20,
      95
    )
  );

  state.variables.cpDrag = Math.max(
    state.variables.cpDrag,
    clamp(
      Math.round(
        state.variables.cpComplexity * 0.52 +
          (100 - old.closingPreparationQuality) * 0.35 +
          (old.residualPostSigningFragility > 45 ? 6 : 0)
      ),
      12,
      95
    )
  );

  state.variables.cpCompletion = Math.max(
    state.variables.cpCompletion,
    clamp(Math.round(old.closingPreparationQuality * 0.72 + old.openItemClosureRate * 0.15 + 8), 25, 88)
  );

  state.variables.interimRisk = Math.max(
    state.variables.interimRisk,
    clamp(
      Math.round(
        old.realExecutionRisk * 0.5 +
          old.ceremonyRisk * 0.25 +
          old.residualPostSigningFragility * 0.25 +
          randomInt(state, -3, 4)
      ),
      10,
      95
    )
  );

  state.variables.interimStability = Math.max(
    state.variables.interimStability,
    clamp(
      Math.round(100 - state.variables.interimRisk * 0.82 + old.clientAlignment * 0.14 + randomInt(state, -2, 3)),
      8,
      95
    )
  );

  state.variables.closingReadiness = Math.max(
    state.variables.closingReadiness,
    clamp(
      Math.round(old.closingPreparationQuality * 0.6 + old.signability * 0.2 + (100 - state.variables.cpDrag) * 0.2),
      25,
      90
    )
  );

  state.variables.completionConfidence = Math.max(
    state.variables.completionConfidence,
    clamp(
      Math.round(
        old.signingConfidence * 0.35 +
          state.variables.closingReadiness * 0.3 +
          state.variables.cpCompletion * 0.2 +
          (100 - state.variables.cpDrag) * 0.15
      ),
      20,
      92
    )
  );

  state.variables.fundsFlowReadiness = Math.max(
    state.variables.fundsFlowReadiness,
    clamp(Math.round(old.coordinationQuality * 0.3 + old.executionDiscipline * 0.2), 0, 45)
  );

  state.variables.fundsFlowIntegrity = Math.max(
    state.variables.fundsFlowIntegrity,
    clamp(Math.round(old.executionDiscipline * 0.3 + old.signingTimingIntegrity * 0.2), 0, 40)
  );

  state.variables.signatureIntegrity = Math.max(
    state.variables.signatureIntegrity,
    clamp(Math.round(old.documentStability * 0.75 + old.signability * 0.15), 45, 95)
  );

  state.variables.paymentTimingIntegrity = Math.max(
    state.variables.paymentTimingIntegrity,
    clamp(Math.round(old.signingTimingIntegrity * 0.75 + old.processMomentum * 0.15), 30, 80)
  );

  state.variables.ownershipTransferReadiness = Math.max(
    state.variables.ownershipTransferReadiness,
    clamp(Math.round(old.closingPreparationQuality * 0.7 + old.executionDiscipline * 0.15), 25, 80)
  );

  state.variables.delayRisk = Math.max(
    state.variables.delayRisk,
    clamp(
      Math.round(
        50 +
          state.variables.cpDrag * 0.2 +
          (100 - state.variables.completionConfidence) * 0.25 +
          randomInt(state, -5, 6)
      ),
      8,
      95
    )
  );

  state.variables.valueIntegrity = Math.max(
    state.variables.valueIntegrity,
    clamp(
      Math.round(88 + old.finalOfferStrength * 0.07 - old.falseClosureRisk * 0.08 - state.variables.delayRisk * 0.04),
      68,
      100
    )
  );

  state.variables.closingExecutionQuality = Math.max(
    state.variables.closingExecutionQuality,
    clamp(Math.round(old.executionDiscipline * 0.45 + old.coordinationQuality * 0.35 + 12), 25, 85)
  );

  state.variables.outcomeIntegrity = clamp(state.variables.outcomeIntegrity, 0, 100);
  state.variables.clientOutcomeSatisfaction = Math.max(
    state.variables.clientOutcomeSatisfaction,
    clamp(Math.round(old.clientAlignment * 0.5 + state.variables.valueIntegrity * 0.3), 20, 90)
  );
  state.variables.reputationOutcome = Math.max(
    state.variables.reputationOutcome,
    clamp(Math.round(old.processMomentum * 0.35 + state.variables.completionConfidence * 0.25), 15, 85)
  );

  if (preferred) {
    preferred.phase9Closing.active = true;
    preferred.phase9Closing.role = "preferred";
    preferred.phase9Closing.status = "cp_progressing";
    preferred.phase9Closing.cpProgress = state.variables.cpCompletion;
    preferred.phase9Closing.executionReadiness = state.variables.completionConfidence;
    preferred.phase9Closing.fundsReadiness = state.variables.fundsFlowReadiness;
    preferred.pendingAction = true;
  }

  if (backup) {
    backup.phase9Closing.active = true;
    backup.phase9Closing.role = "backup";
    backup.phase9Closing.status = "stable_delayed";
    backup.phase9Closing.cpProgress = clamp(Math.round(state.variables.cpCompletion * 0.8), 0, 100);
    backup.phase9Closing.executionReadiness = clamp(Math.round(state.variables.completionConfidence * 0.75), 0, 100);
    backup.phase9Closing.fundsReadiness = clamp(Math.round(state.variables.fundsFlowReadiness * 0.7), 0, 100);
  }

  state.buyers.forEach((buyer) => updateBuyerLabel(buyer));

  context.generatedMessages.push({
    category: "Milestone",
    title: "Phase 9 closing context initialized",
    text: preferred
      ? `${preferred.name} entered post-signing closing. CP clearance and execution sequencing now determine outcome quality.`
      : "Closing started without a clearly defined preferred counterparty lane; execution control risk is elevated."
  });
}

function initializePhaseContext(state, context) {
  if (state.deal.phaseId === 2) {
    ensurePhase2BuyerUniverse(state, context);
  }

  if (state.deal.phaseId === 3) {
    ensurePhase3Context(state, context);
  }

  if (state.deal.phaseId === 4) {
    ensurePhase4Context(state, context);
  }

  if (state.deal.phaseId === 5) {
    ensurePhase5Context(state, context);
  }

  if (state.deal.phaseId === 6) {
    ensurePhase6Context(state, context);
  }

  if (state.deal.phaseId === 7) {
    ensurePhase7Context(state, context);
  }

  if (state.deal.phaseId === 8) {
    ensurePhase8Context(state, context);
  }

  if (state.deal.phaseId === 9) {
    ensurePhase9Context(state, context);
  }

  if (state.deal.phaseId === 10) {
    ensurePhase10Context(state, context);
  }
}

export function runWeekResolution(inputState) {
  const state = deepClone(inputState);
  const context = {
    previousDeliverables: deepClone(state.deliverables),
    preBuyerCounts: buyerCounts(state),
    executedActions: [],
    blockedActions: [],
    hiddenWorkHits: [],
    triggeredEvents: [],
    generatedMessages: [],
    generatedHeadlines: []
  };

  initializePhaseContext(state, context);
  resolveQueuedTasks(state, context);
  applyCapacityConsumption(state);
  applyPressureEffects(state, context);
  triggerHiddenWorkload(state, context);
  triggerScheduledEvents(state, context);
  triggerConditionalEvents(state, context);
  updateDeliverables(state, context);
  updateWorkstreams(state);
  updateBuyerStates(state, context);
  updateRiskDebt(state, context);
  updateResources(state);
  generateMessages(state, context);
  generateHeadlines(state, context);
  checkPhaseTransition(state, context);
  pushWeeklySummary(state, context);
  advanceClock(state);

  return recomputeDerivedState(state);
}

const PHASE8_EXECUTION_PRIORITY = {
  p8_run_signability_review: 10,
  p8_finalize_document_version: 20,
  p8_reconcile_markup_mismatch: 30,
  p8_lock_signature_version: 40,
  p8_close_signing_blockers: 50,
  p8_escalate_unresolved_signing_blocker: 60,
  p8_sequence_final_approvals: 70,
  p8_confirm_party_signoff_readiness: 80,
  p8_review_final_drafting_coherence: 85,
  p8_map_residual_obligations: 90,
  p8_run_pre_closing_transition_review: 95,
  p8_trigger_signature: 100,
  p8_brief_client_before_signing: 110
};

const PHASE9_EXECUTION_PRIORITY = {
  p9_build_cp_tracker: 10,
  p9_resequence_cp_dependencies: 20,
  p9_review_interim_stability: 30,
  p9_chase_critical_approval: 40,
  p9_push_counterparty_responsiveness: 50,
  p9_manage_buyer_nervousness: 55,
  p9_escalate_blocked_condition: 60,
  p9_contain_drift_concern: 65,
  p9_review_closing_readiness: 70,
  p9_confirm_payment_instructions: 80,
  p9_run_closing_day_coordination_check: 90,
  p9_resolve_signature_mismatch: 100,
  p9_coordinate_funds_release: 110,
  p9_confirm_ownership_transfer: 120,
  p9_trigger_success_fee_realisation: 130,
  p9_run_post_close_execution_review: 140
};

function prioritizeQueuedTasks(state, taskIds) {
  if (state.deal.phaseId === 8) {
    return [...taskIds].sort((left, right) => {
      const leftPriority = PHASE8_EXECUTION_PRIORITY[left] ?? 999;
      const rightPriority = PHASE8_EXECUTION_PRIORITY[right] ?? 999;
      return leftPriority - rightPriority;
    });
  }

  if (state.deal.phaseId === 9) {
    return [...taskIds].sort((left, right) => {
      const leftPriority = PHASE9_EXECUTION_PRIORITY[left] ?? 999;
      const rightPriority = PHASE9_EXECUTION_PRIORITY[right] ?? 999;
      return leftPriority - rightPriority;
    });
  }

  return taskIds;
}

function resolveQueuedTasks(state, context) {
  const requestedTaskIds = prioritizeQueuedTasks(state, [...new Set(state.planning.selectedTaskIds)]);

  requestedTaskIds.forEach((taskId) => {
    const action = getActionById(taskId);
    if (!action) return;

    const availability = canExecuteAction(state, action);
    if (!availability.queueable) {
      context.blockedActions.push({ actionId: taskId, reasons: availability.reasons });
      return;
    }

    state.resources.budget -= action.cost;
    state.resources.usedCapacity += action.work;

    applyActionEffects(state, action.effects);
    context.executedActions.push(action);

    state.runtime.taskCompletions[action.id] = (state.runtime.taskCompletions[action.id] ?? 0) + 1;
  });

  state.runtime.lastResolvedTaskIds = context.executedActions.map((action) => action.id);
  state.planning.selectedTaskIds = [];

  if (context.executedActions.length) {
    context.generatedMessages.push({
      category: "Execution",
      title: `Executed ${context.executedActions.length} task(s)`,
      text: context.executedActions.map((action) => action.name).join(", ")
    });
  }

  if (context.blockedActions.length) {
    context.generatedMessages.push({
      category: "Warning",
      title: `${context.blockedActions.length} queued task(s) blocked`,
      text: "Some tasks could not execute due to dependencies or budget constraints."
    });
  }
}

function applyActionEffects(state, effects = {}) {
  applyDelta(state.variables, effects.variables);
  applyDelta(state.team, effects.team);

  if (typeof effects.riskDebt === "number") {
    state.riskDebt += effects.riskDebt;
  }

  if (effects.workstreams) {
    Object.entries(effects.workstreams).forEach(([workstreamId, delta]) => {
      const ws = state.workstreams[workstreamId];
      if (!ws) return;
      ws.progress += delta.progress ?? 0;
      ws.quality += delta.quality ?? 0;
    });
  }

  if (effects.deliverables) {
    Object.entries(effects.deliverables).forEach(([deliverableId, progressDelta]) => {
      if (!state.deliverables[deliverableId]) return;
      state.deliverables[deliverableId].progress += progressDelta;
    });
  }
}

function applyCapacityConsumption(state) {
  state.resources.pressure = Number((state.resources.usedCapacity / state.resources.maxCapacity).toFixed(2));
}

function applyPressureEffects(state, context) {
  const pressure = state.resources.pressure;

  if (pressure > 1.2) {
    state.team.morale -= 5;
    state.riskDebt += 3;
    state.variables.dataQuality -= 4;
    state.variables.executionReadiness -= 5;
    context.generatedMessages.push({
      category: "Internal",
      title: "Critical pressure",
      text: "Team overload reduced quality and raised downstream execution risk."
    });
    return;
  }

  if (pressure > 1.0) {
    state.team.morale -= 2;
    state.riskDebt += 1;
    state.variables.executionReadiness -= 2;
    context.generatedMessages.push({
      category: "Internal",
      title: "Strained workload",
      text: "Current staffing is stretched; execution quality may slip."
    });
  }
}

function hiddenWorkProbabilityMultiplier(pressure) {
  if (pressure <= 0.85) return 1.0;
  if (pressure <= 1.0) return 1.05;
  if (pressure <= 1.2) return 1.25;
  return 1.5;
}

function triggerHiddenWorkload(state, context) {
  const pressureMultiplier = hiddenWorkProbabilityMultiplier(state.resources.pressure);

  context.executedActions.forEach((action) => {
    const base = COMPLEXITY_BASE_PROBABILITY[action.complexity] ?? 0.1;
    const finalProbability = clamp(base * pressureMultiplier, 0, 0.95);

    if (!rollChance(state, finalProbability)) return;

    const extraWork = randomInt(state, action.hiddenWorkRange[0], action.hiddenWorkRange[1]);
    state.resources.usedCapacity += extraWork;
    state.riskDebt += 1;
    state.variables.executionReadiness -= Math.ceil(extraWork / 3);

    context.hiddenWorkHits.push({ actionId: action.id, extraWork });
    context.generatedMessages.push({
      category: "Issue",
      title: `Hidden workload: ${action.name}`,
      text: `Unexpected rework added ${extraWork} work units.`
    });
  });
}

function triggerScheduledEvents(state, context) {
  resolvePendingFollowupEvent(state, context);
  rollSingleEvent(state, context, "scheduled");
}

function triggerConditionalEvents(state, context) {
  rollSingleEvent(state, context, "conditional");
}

function resolvePendingFollowupEvent(state, context) {
  if (!state.runtime.pendingEventIds.length) return;

  const pendingId = state.runtime.pendingEventIds.shift();
  const eventDef = getEventById(pendingId);
  if (!eventDef) return;
  if (!eventDef.phaseIds.includes(state.deal.phaseId)) return;

  applyEvent(state, context, eventDef);
}

function rollSingleEvent(state, context, kind) {
  const candidates = getEventPool(state, kind);
  const eventDef = pickOne(state, candidates);
  if (!eventDef) return;

  if (!rollChance(state, eventDef.baseProbability)) return;

  applyEvent(state, context, eventDef);
}

function applyEvent(state, context, eventDef) {
  applyActionEffects(state, eventDef.effects);
  context.triggeredEvents.push(eventDef.id);
  context.generatedMessages.push({
    category: "Event",
    title: eventDef.title,
    text: eventDef.text
  });

  if (Array.isArray(eventDef.chainTo)) {
    eventDef.chainTo.forEach((followupId) => {
      state.runtime.pendingEventIds.push(followupId);
    });
  }
}

function updateDeliverables(state, context) {
  if (state.deal.phaseId === 1 && state.deliverables.teaser.progress < 60) {
    const blended = Math.round((state.workstreams.targetIntelligence.progress + state.workstreams.qualification.progress) / 5);
    state.deliverables.teaser.progress = Math.max(state.deliverables.teaser.progress, clamp(blended, 0, 100));
  }

  if (state.deal.phaseId === 1) {
    const passiveImBoost = state.deliverables.model.progress >= 40 ? 2 : 0;
    const passiveBuyerBoost = state.deliverables.teaser.progress >= 60 ? 2 : 0;

    state.deliverables.im.progress += passiveImBoost;
    state.deliverables.buyerList.progress += passiveBuyerBoost;
  }

  const tierAnchors = {
    teaser: (state.workstreams.relationshipDevelopment.quality + state.workstreams.pitchReadiness.quality) / 2,
    im: (state.workstreams.pitchReadiness.quality + state.workstreams.targetIntelligence.quality + state.variables.dataQuality) / 3,
    model: (state.workstreams.valuationFraming.quality + state.variables.dataQuality) / 2,
    buyerList: (state.workstreams.qualification.quality + state.variables.fitScore) / 2,
    vdr: (state.workstreams.confidentialityConflicts.quality + state.variables.dataQuality) / 2
  };

  Object.entries(state.deliverables).forEach(([deliverableId, deliverable]) => {
    deliverable.progress = clamp(deliverable.progress, 0, 100);

    if (deliverable.progress >= 60) {
      const anchor = tierAnchors[deliverableId] ?? state.workstreams.pitchReadiness.quality;
      deliverable.qualityTier = anchor >= 80 ? "Exceptional" : anchor >= 60 ? "Solid" : "Basic";
    } else {
      deliverable.qualityTier = null;
    }

    const previousProgress = context.previousDeliverables[deliverableId]?.progress ?? 0;
    if (previousProgress < 60 && deliverable.progress >= 60) {
      context.generatedMessages.push({
        category: "Milestone",
        title: `${deliverableId.toUpperCase()} complete`,
        text: `Deliverable completed with ${deliverable.qualityTier ?? "Basic"} quality.`
      });
    }
  });
}

function updateWorkstreams(state) {
  if (state.deal.phaseId === 10) return;
  if (state.deal.phaseId === 0) {
    const pivot = Math.round(
      (state.workstreams.targetIntelligence.progress +
        state.workstreams.relationshipDevelopment.progress +
        state.workstreams.qualification.progress +
        state.workstreams.valuationFraming.progress) /
        4
    );
    state.workstreams.pitchReadiness.progress = clamp(pivot, 0, 100);
    return;
  }

  if (state.deal.phaseId === 1) {
    const readinessBlend = Math.round(
      (state.deliverables.im.progress + state.deliverables.model.progress + state.deliverables.teaser.progress) / 3
    );
    state.workstreams.pitchReadiness.progress = Math.max(state.workstreams.pitchReadiness.progress, readinessBlend);
    state.workstreams.pitchReadiness.quality = Math.max(
      state.workstreams.pitchReadiness.quality,
      Math.round((state.variables.dataQuality + state.variables.executionReadiness) / 2)
    );

    state.workstreams.confidentialityConflicts.progress = Math.max(
      state.workstreams.confidentialityConflicts.progress,
      Math.round(state.deliverables.vdr.progress * 0.8)
    );

    state.workstreams.valuationFraming.progress = Math.max(
      state.workstreams.valuationFraming.progress,
      Math.round(state.deliverables.model.progress * 0.8)
    );
  }

  if (state.deal.phaseId === 2) {
    state.workstreams.relationshipDevelopment.quality = Math.max(
      state.workstreams.relationshipDevelopment.quality,
      Math.round((state.variables.buyerResponseRate + state.variables.processMomentum) / 2)
    );

    state.workstreams.qualification.progress = Math.max(
      state.workstreams.qualification.progress,
      Math.round((state.variables.outreachCoverage + state.variables.buyerResponseRate) / 2)
    );

    state.workstreams.confidentialityConflicts.quality = Math.max(
      state.workstreams.confidentialityConflicts.quality,
      Math.round(100 - state.variables.confidentialityRisk)
    );
  }

  if (state.deal.phaseId === 3) {
    state.workstreams.qualification.quality = Math.max(
      state.workstreams.qualification.quality,
      Math.round((state.variables.shortlistQuality + state.variables.clientAlignment) / 2)
    );

    state.workstreams.relationshipDevelopment.quality = Math.max(
      state.workstreams.relationshipDevelopment.quality,
      Math.round((state.variables.clientAlignment + state.variables.competitiveTension) / 2)
    );

    state.workstreams.pitchReadiness.quality = Math.max(
      state.workstreams.pitchReadiness.quality,
      Math.round((state.variables.offerReadiness + state.variables.shortlistQuality) / 2)
    );
  }

  if (state.deal.phaseId === 4) {
    state.workstreams.valuationFraming.quality = Math.max(
      state.workstreams.valuationFraming.quality,
      Math.round((state.variables.offerComparability + state.variables.priceConfidence) / 2)
    );

    state.workstreams.relationshipDevelopment.quality = Math.max(
      state.workstreams.relationshipDevelopment.quality,
      Math.round((state.variables.clientAlignment + state.variables.advancementClarity) / 2)
    );

    state.workstreams.pitchReadiness.quality = Math.max(
      state.workstreams.pitchReadiness.quality,
      Math.round((state.variables.priceConfidence + state.variables.executionReadiness) / 2)
    );
  }

  if (state.deal.phaseId === 5) {
    state.workstreams.confidentialityConflicts.quality = Math.max(
      state.workstreams.confidentialityConflicts.quality,
      Math.round((state.variables.issueContainment + (100 - state.variables.retradeRisk)) / 2)
    );

    state.workstreams.relationshipDevelopment.quality = Math.max(
      state.workstreams.relationshipDevelopment.quality,
      Math.round((state.variables.buyerConfidence + state.variables.fieldSurvival) / 2)
    );

    state.workstreams.pitchReadiness.quality = Math.max(
      state.workstreams.pitchReadiness.quality,
      Math.round((state.variables.ddReadiness + state.variables.issueContainment) / 2)
    );
  }

  if (state.deal.phaseId === 6) {
    state.workstreams.valuationFraming.quality = Math.max(
      state.workstreams.valuationFraming.quality,
      Math.round((state.variables.finalOfferStrength + state.variables.finalOfferComparability) / 2)
    );

    state.workstreams.relationshipDevelopment.quality = Math.max(
      state.workstreams.relationshipDevelopment.quality,
      Math.round((state.variables.clientAlignment + state.variables.backupBidderStrength) / 2)
    );

    state.workstreams.confidentialityConflicts.quality = Math.max(
      state.workstreams.confidentialityConflicts.quality,
      Math.round((state.variables.executableCertainty + (100 - state.variables.falseWinnerRisk)) / 2)
    );

    state.workstreams.pitchReadiness.quality = Math.max(
      state.workstreams.pitchReadiness.quality,
      Math.round((state.variables.exclusivityReadiness + state.variables.executableCertainty) / 2)
    );
  }

  if (state.deal.phaseId === 7) {
    state.workstreams.valuationFraming.progress = Math.max(
      state.workstreams.valuationFraming.progress,
      Math.round(state.variables.valueProtectionQuality)
    );

    state.workstreams.confidentialityConflicts.progress = Math.max(
      state.workstreams.confidentialityConflicts.progress,
      Math.round(100 - state.variables.residualLegalDrag)
    );

    state.workstreams.pitchReadiness.progress = Math.max(
      state.workstreams.pitchReadiness.progress,
      Math.round(state.variables.signingReadiness)
    );

    state.workstreams.valuationFraming.quality = Math.max(
      state.workstreams.valuationFraming.quality,
      Math.round((state.variables.valueProtectionQuality + state.variables.concessionDiscipline) / 2)
    );

    state.workstreams.relationshipDevelopment.quality = Math.max(
      state.workstreams.relationshipDevelopment.quality,
      Math.round((state.variables.preferredBidderStability + state.variables.clientAlignment) / 2)
    );

    state.workstreams.confidentialityConflicts.quality = Math.max(
      state.workstreams.confidentialityConflicts.quality,
      Math.round((state.variables.legalControl + (100 - state.variables.falseClosureRisk)) / 2)
    );

    state.workstreams.pitchReadiness.quality = Math.max(
      state.workstreams.pitchReadiness.quality,
      Math.round((state.variables.signingReadiness + state.variables.signingChecklistProgress) / 2)
    );

    state.workstreams.qualification.quality = Math.max(
      state.workstreams.qualification.quality,
      Math.round((100 - state.variables.residualLegalDrag + state.variables.concessionDiscipline) / 2)
    );
  }

  if (state.deal.phaseId === 8) {
    state.workstreams.pitchReadiness.progress = Math.max(
      state.workstreams.pitchReadiness.progress,
      Math.round(state.variables.signingConfidence)
    );

    state.workstreams.confidentialityConflicts.progress = Math.max(
      state.workstreams.confidentialityConflicts.progress,
      Math.round(state.variables.documentStability)
    );

    state.workstreams.relationshipDevelopment.progress = Math.max(
      state.workstreams.relationshipDevelopment.progress,
      Math.round(state.variables.coordinationQuality)
    );

    state.workstreams.qualification.progress = Math.max(
      state.workstreams.qualification.progress,
      Math.round(state.variables.openItemClosureRate)
    );

    state.workstreams.valuationFraming.quality = Math.max(
      state.workstreams.valuationFraming.quality,
      Math.round((state.variables.signability + state.variables.executionDiscipline) / 2)
    );

    state.workstreams.relationshipDevelopment.quality = Math.max(
      state.workstreams.relationshipDevelopment.quality,
      Math.round((state.variables.counterpartyAlignment + state.variables.clientAlignment) / 2)
    );

    state.workstreams.confidentialityConflicts.quality = Math.max(
      state.workstreams.confidentialityConflicts.quality,
      Math.round((state.variables.documentStability + (100 - state.variables.realExecutionRisk)) / 2)
    );

    state.workstreams.pitchReadiness.quality = Math.max(
      state.workstreams.pitchReadiness.quality,
      Math.round((state.variables.signingConfidence + state.variables.coordinationQuality) / 2)
    );
  }

  if (state.deal.phaseId === 9) {
    state.workstreams.pitchReadiness.progress = Math.max(
      state.workstreams.pitchReadiness.progress,
      Math.round(state.variables.closingReadiness)
    );

    state.workstreams.qualification.progress = Math.max(
      state.workstreams.qualification.progress,
      Math.round(state.variables.cpCompletion)
    );

    state.workstreams.relationshipDevelopment.progress = Math.max(
      state.workstreams.relationshipDevelopment.progress,
      Math.round(state.variables.fundsFlowReadiness)
    );

    state.workstreams.confidentialityConflicts.progress = Math.max(
      state.workstreams.confidentialityConflicts.progress,
      Math.round(state.variables.signatureIntegrity)
    );

    state.workstreams.valuationFraming.quality = Math.max(
      state.workstreams.valuationFraming.quality,
      Math.round((state.variables.valueIntegrity + state.variables.fundsFlowIntegrity) / 2)
    );

    state.workstreams.relationshipDevelopment.quality = Math.max(
      state.workstreams.relationshipDevelopment.quality,
      Math.round((state.variables.counterpartyAlignment + state.variables.interimStability) / 2)
    );

    state.workstreams.confidentialityConflicts.quality = Math.max(
      state.workstreams.confidentialityConflicts.quality,
      Math.round((state.variables.signatureIntegrity + state.variables.paymentTimingIntegrity) / 2)
    );

    state.workstreams.pitchReadiness.quality = Math.max(
      state.workstreams.pitchReadiness.quality,
      Math.round((state.variables.completionConfidence + state.variables.closingExecutionQuality) / 2)
    );
  }
}

function updateBuyerStates(state, context) {
  if (state.deal.phaseId === 2) {
    updatePhase2BuyerStates(state, context);
    return;
  }

  if (state.deal.phaseId === 3) {
    updatePhase3BuyerStates(state, context);
    return;
  }

  if (state.deal.phaseId === 4) {
    updatePhase4BuyerStates(state, context);
    return;
  }

  if (state.deal.phaseId === 5) {
    updatePhase5BuyerStates(state, context);
    return;
  }

  if (state.deal.phaseId === 6) {
    updatePhase6BuyerStates(state, context);
    return;
  }

  if (state.deal.phaseId === 7) {
    updatePhase7BuyerStates(state, context);
    return;
  }

  if (state.deal.phaseId === 8) {
    updatePhase8BuyerStates(state, context);
    return;
  }

  if (state.deal.phaseId === 9) {
    updatePhase9BuyerStates(state, context);
  }
}

function updatePhase2BuyerStates(state, context) {
  ensurePhase2BuyerUniverse(state, context);

  const executedTags = new Set(
    context.executedActions.flatMap((action) => (Array.isArray(action.systemTags) ? action.systemTags : []))
  );

  const sentOutreach = executedTags.has("outreach_send") || executedTags.has("outreach_expand");
  const followedUp = executedTags.has("outreach_followup");
  const processedNdas = executedTags.has("nda_process");
  const grantedIm = executedTags.has("im_grant");
  const qnaResponse = executedTags.has("qna_response");
  const confidentialityControl = executedTags.has("confidentiality_control");

  state.buyers.forEach((buyer) => {
    if (buyer.stage === "uncontacted" && sentOutreach) {
      buyer.stage = "teaser_sent";
      buyer.pendingAction = false;
      buyer.lastTouchedWeek = state.clock.week;
    }

    if (["teaser_sent", "no_reply"].includes(buyer.stage)) {
      const responseProb = clamp(
        0.18 + buyer.hiddenConviction / 250 + (followedUp ? 0.15 : 0) + (state.variables.buyerHeat - 50) / 300,
        0.05,
        0.85
      );
      const softPassProb = clamp(
        0.22 - buyer.hiddenConviction / 500 + (state.variables.confidentialityRisk > 60 ? 0.08 : 0),
        0.08,
        0.4
      );

      if (rollChance(state, responseProb)) {
        if (rollChance(state, softPassProb)) {
          buyer.stage = "soft_pass";
          buyer.pendingAction = false;
        } else {
          buyer.stage = "nda_requested";
          buyer.pendingAction = true;
        }
        buyer.lastTouchedWeek = state.clock.week;
      } else if (buyer.stage === "teaser_sent") {
        buyer.stage = "no_reply";
      }
    }

    if (buyer.stage === "nda_requested") {
      if (processedNdas) {
        buyer.stage = "nda_signed";
        buyer.pendingAction = false;
        buyer.hiddenConviction = clamp(buyer.hiddenConviction + randomInt(state, 2, 5), 0, 100);
        buyer.lastTouchedWeek = state.clock.week;
      } else {
        buyer.pendingAction = true;
      }
    }

    if (buyer.stage === "nda_signed") {
      if (grantedIm) {
        buyer.stage = "im_access";
        buyer.pendingAction = !qnaResponse;
        buyer.hiddenConviction = clamp(buyer.hiddenConviction + randomInt(state, 1, 4), 0, 100);
        buyer.lastTouchedWeek = state.clock.week;
      } else {
        buyer.pendingAction = true;
      }
    }

    if (buyer.stage === "im_access") {
      buyer.pendingAction = !qnaResponse;

      if (qnaResponse) {
        buyer.hiddenConviction = clamp(buyer.hiddenConviction + randomInt(state, 1, 5), 0, 100);
        buyer.lastTouchedWeek = state.clock.week;
      }

      if (followedUp && rollChance(state, 0.1)) {
        buyer.hiddenConviction = clamp(buyer.hiddenConviction + 2, 0, 100);
      }
    }

    if (buyer.stage === "soft_pass") {
      if (followedUp && buyer.hiddenConviction >= 55 && rollChance(state, 0.12)) {
        buyer.stage = "no_reply";
        buyer.pendingAction = false;
      }
    }

    if (!followedUp && state.clock.week - buyer.lastTouchedWeek >= 2 && ["teaser_sent", "no_reply"].includes(buyer.stage)) {
      buyer.hiddenConviction = clamp(buyer.hiddenConviction - 2, 0, 100);
    }

    if (confidentialityControl) {
      buyer.pendingAction = buyer.stage === "nda_requested";
    }

    updateBuyerLabel(buyer);
  });

  const counts = buyerCounts(state);
  const total = Math.max(counts.total, 1);
  const avgConviction = Math.round(state.buyers.reduce((acc, buyer) => acc + buyer.hiddenConviction, 0) / total);

  const computedCoverage = Math.round((counts.contacted / total) * 100);
  const computedResponse = Math.round((counts.engaged / total) * 100);
  const computedConversion = Math.round((counts.converted / total) * 100);
  const computedBacklog = Math.round((counts.backlog / total) * 100);

  state.variables.outreachCoverage = clamp(
    Math.max(computedCoverage, state.variables.outreachCoverage + (sentOutreach ? 6 : -2)),
    0,
    100
  );
  state.variables.buyerResponseRate = clamp(
    Math.max(computedResponse, state.variables.buyerResponseRate + (followedUp ? 3 : -1)),
    0,
    100
  );
  state.variables.buyerConversionRate = clamp(
    Math.max(computedConversion, state.variables.buyerConversionRate + (processedNdas ? 6 : 0) + (grantedIm ? 4 : 0) - (processedNdas || grantedIm ? 0 : 1)),
    0,
    100
  );
  state.variables.buyerHeat = clamp(
    Math.round(avgConviction + (followedUp ? 2 : 0) - (state.variables.confidentialityRisk > 60 ? 4 : 0)),
    0,
    100
  );
  state.variables.responseBacklogPressure = clamp(
    computedBacklog + (processedNdas || grantedIm || qnaResponse ? -15 : 0),
    0,
    100
  );

  if (confidentialityControl) {
    state.variables.confidentialityRisk -= 6;
  }

  state.variables.processMomentum = clamp(
    Math.round(
      state.variables.outreachCoverage * 0.25 +
        state.variables.buyerResponseRate * 0.25 +
        state.variables.buyerConversionRate * 0.35 +
        (100 - state.variables.responseBacklogPressure) * 0.15
    ),
    0,
    100
  );

  const postCounts = buyerCounts(state);
  if (postCounts.converted > context.preBuyerCounts.converted) {
    context.generatedMessages.push({
      category: "Milestone",
      title: "Buyer conversion improved",
      text: `Converted buyers increased to ${postCounts.converted}.`
    });
  }

  if (postCounts.backlog > context.preBuyerCounts.backlog && postCounts.backlog >= 2) {
    context.generatedMessages.push({
      category: "Warning",
      title: "Backlog building",
      text: `Buyer action backlog increased to ${postCounts.backlog}.`
    });
  }
}

function updatePhase3BuyerStates(state, context) {
  ensurePhase3Context(state, context);

  const executedTags = new Set(
    context.executedActions.flatMap((action) => (Array.isArray(action.systemTags) ? action.systemTags : []))
  );

  const scored = executedTags.has("shortlist_score");
  const selected = executedTags.has("shortlist_select");
  const tensionManaged = executedTags.has("tension_manage");
  const clientAligned = executedTags.has("client_align");
  const nboPrepared = executedTags.has("prepare_nbo");
  const pruned = executedTags.has("shortlist_prune");

  state.buyers.forEach((buyer) => {
    buyer.phase3Score = computePhase3Score(buyer, state);

    if (["im_access", "nda_signed", "nda_requested"].includes(buyer.stage) && buyer.shortlistStatus === "none") {
      buyer.shortlistStatus = "candidate";
    }

    if (pruned && buyer.shortlistStatus === "candidate" && buyer.phase3Score < 58) {
      buyer.shortlistStatus = "dropped";
      buyer.pendingAction = false;
    }

    if (buyer.shortlistStatus === "shortlisted") {
      buyer.pendingAction = !nboPrepared;
      if (tensionManaged) {
        buyer.hiddenConviction = clamp(buyer.hiddenConviction + randomInt(state, 1, 4), 0, 100);
      } else if (state.clock.week - buyer.lastTouchedWeek >= 2) {
        buyer.hiddenConviction = clamp(buyer.hiddenConviction - 2, 0, 100);
      }
      buyer.lastTouchedWeek = state.clock.week;
    }

    if (buyer.shortlistStatus === "candidate" && scored) {
      buyer.hiddenConviction = clamp(buyer.hiddenConviction + randomInt(state, -1, 2), 0, 100);
      buyer.lastTouchedWeek = state.clock.week;
    }

    if (selected && buyer.shortlistStatus !== "dropped") {
      buyer.pendingAction = buyer.shortlistStatus === "shortlisted";
    }

    updateBuyerLabel(buyer);
  });

  if (selected) {
    const pool = state.buyers
      .filter((buyer) => ["candidate", "shortlisted"].includes(buyer.shortlistStatus))
      .sort((a, b) => b.phase3Score - a.phase3Score);

    pool.forEach((buyer, idx) => {
      buyer.shortlistStatus = idx < 3 ? "shortlisted" : "candidate";
      buyer.pendingAction = buyer.shortlistStatus === "shortlisted";
      updateBuyerLabel(buyer);
    });
  }

  if (pruned) {
    const candidates = state.buyers.filter((buyer) => buyer.shortlistStatus === "candidate");
    candidates
      .sort((a, b) => a.phase3Score - b.phase3Score)
      .slice(0, 1)
      .forEach((buyer) => {
        buyer.shortlistStatus = "dropped";
        buyer.pendingAction = false;
      });
  }

  const shortlisted = state.buyers.filter((buyer) => buyer.shortlistStatus === "shortlisted");
  const candidatePool = state.buyers.filter((buyer) => ["shortlisted", "candidate"].includes(buyer.shortlistStatus));

  const shortlistAvgScore = shortlisted.length
    ? Math.round(shortlisted.reduce((acc, buyer) => acc + buyer.phase3Score, 0) / shortlisted.length)
    : 0;

  const candidateAvgScore = candidatePool.length
    ? Math.round(candidatePool.reduce((acc, buyer) => acc + buyer.phase3Score, 0) / candidatePool.length)
    : 0;

  state.variables.shortlistQuality = clamp(
    Math.round(candidateAvgScore + (scored ? 5 : 0) + (clientAligned ? 3 : 0) + (pruned ? 2 : 0)),
    0,
    100
  );

  state.variables.competitiveTension = clamp(
    Math.round(
      shortlisted.length * 12 +
        state.variables.processMomentum * 0.35 +
        (tensionManaged ? 10 : 0) -
        (shortlisted.length < 2 ? 10 : 0)
    ),
    0,
    100
  );

  state.variables.clientAlignment = clamp(
    Math.round(
      (state.variables.clientAlignment + state.workstreams.relationshipDevelopment.quality) / 2 + (clientAligned ? 8 : -2)
    ),
    0,
    100
  );

  state.variables.offerReadiness = clamp(
    Math.round(
      state.variables.offerReadiness * 0.7 +
        state.variables.shortlistQuality * 0.2 +
        state.variables.competitiveTension * 0.1 +
        (nboPrepared ? 12 : 0)
    ),
    0,
    100
  );

  state.variables.responseBacklogPressure = clamp(
    Math.round(shortlisted.filter((buyer) => buyer.pendingAction).length * 20 + (nboPrepared ? -15 : 0)),
    0,
    100
  );

  state.variables.processMomentum = clamp(
    Math.round(
      state.variables.processMomentum * 0.6 +
        state.variables.shortlistQuality * 0.2 +
        state.variables.competitiveTension * 0.2
    ),
    0,
    100
  );

  if (shortlisted.length < 2) {
    context.generatedMessages.push({
      category: "Warning",
      title: "Shortlist too thin",
      text: "At least two credible bidders are needed to preserve process leverage."
    });
  }

  if (selected) {
    context.generatedMessages.push({
      category: "Milestone",
      title: "Shortlist refreshed",
      text: `${shortlisted.length} buyers are currently shortlisted.`
    });
  }
}

function updatePhase4BuyerStates(state, context) {
  ensurePhase4Context(state, context);

  const executedTags = new Set(
    context.executedActions.flatMap((action) => (Array.isArray(action.systemTags) ? action.systemTags : []))
  );

  const collected = executedTags.has("nbo_collect");
  const compared = executedTags.has("offer_compare");
  const normalized = executedTags.has("offer_normalize");
  const reviewed = executedTags.has("offer_condition_review");
  const matrixBuilt = executedTags.has("offer_matrix");
  const clientReframed = executedTags.has("client_reframe");
  const recommended = executedTags.has("offer_recommend");
  const selectivityLocked = executedTags.has("offer_selectivity");
  const phase5Prepared = executedTags.has("phase5_prepare");

  const shortlisted = state.buyers.filter((buyer) => buyer.shortlistStatus === "shortlisted");

  if (collected) {
    shortlisted
      .filter((buyer) => !buyer.phase4Offer?.submitted)
      .forEach((buyer) => {
        const converted = rollChance(
          state,
          clamp(0.48 + buyer.hiddenConviction / 260 + (state.variables.processMomentum - 50) / 250, 0.2, 0.92)
        );
        if (!converted) return;

        buyer.phase4Offer.submitted = true;
        buyer.phase4Offer.onTime = false;
        buyer.phase4Offer.qualityScore = computePhase4QualityScore(buyer.phase4Offer);
      });
  }

  shortlisted.forEach((buyer) => {
    if (!buyer.phase4Offer) {
      buyer.phase4Offer = buildPhase4OfferForBuyer(state, buyer);
    }

    const offer = buyer.phase4Offer;

    if (!offer.submitted) {
      offer.analyzed = false;
      offer.advanced = false;
      buyer.pendingAction = false;
      updateBuyerLabel(buyer);
      return;
    }

    if (compared || matrixBuilt) {
      offer.analyzed = true;
    }

    if (normalized) {
      const structurePenalty = clamp(Math.round((offer.conditionality - 45) * 0.18), -10, 18);
      offer.normalizedValue = clamp(offer.headlineValue - structurePenalty + randomInt(state, -2, 2), 35, 165);
      offer.analyzed = true;
    }

    if (reviewed) {
      offer.conditionality = clamp(offer.conditionality + randomInt(state, -4, 2), 8, 95);
      const certaintyShift = offer.conditionality <= 45 ? 6 : offer.conditionality >= 70 ? -5 : 2;
      offer.certainty = clamp(offer.certainty + certaintyShift + randomInt(state, -2, 3), 10, 97);
      offer.analyzed = true;
    }

    offer.qualityScore = computePhase4QualityScore(offer);

    if (recommended) {
      if (offer.qualityScore >= 68) {
        offer.recommendation = "advance";
      } else if (offer.qualityScore >= 54) {
        offer.recommendation = "hold";
      } else {
        offer.recommendation = "drop";
      }
    }

    offer.advanced = false;
    buyer.pendingAction = offer.submitted && !offer.analyzed;
    buyer.lastTouchedWeek = state.clock.week;
    updateBuyerLabel(buyer);
  });

  if (selectivityLocked) {
    const pool = shortlisted
      .filter((buyer) => buyer.phase4Offer?.submitted)
      .sort((a, b) => {
        const scoreDelta = (b.phase4Offer?.qualityScore ?? 0) - (a.phase4Offer?.qualityScore ?? 0);
        if (scoreDelta !== 0) return scoreDelta;
        return (b.phase3Score ?? 0) - (a.phase3Score ?? 0);
      });

    const preferred = pool.filter((buyer) => buyer.phase4Offer?.recommendation !== "drop");
    const target = clamp(pool.length >= 4 ? 3 : 2, 1, 4);
    const chosen = preferred.length >= target ? preferred.slice(0, target) : pool.slice(0, target);

    pool.forEach((buyer) => {
      buyer.phase4Offer.advanced = chosen.includes(buyer);
      if (buyer.phase4Offer.advanced) {
        buyer.phase4Offer.recommendation = "advance";
      } else if (buyer.phase4Offer.recommendation === "undecided") {
        buyer.phase4Offer.recommendation = "hold";
      }

      if (phase5Prepared && buyer.phase4Offer.advanced) {
        buyer.pendingAction = false;
      }

      updateBuyerLabel(buyer);
    });
  }

  const submittedOffers = shortlisted.filter((buyer) => buyer.phase4Offer?.submitted);
  const analyzedOffers = submittedOffers.filter((buyer) => buyer.phase4Offer?.analyzed);
  const advancedOffers = submittedOffers.filter((buyer) => buyer.phase4Offer?.advanced);
  const pendingCount = submittedOffers.filter((buyer) => buyer.pendingAction).length;

  const avgQuality = submittedOffers.length
    ? Math.round(
        submittedOffers.reduce((acc, buyer) => acc + (buyer.phase4Offer?.qualityScore ?? 0), 0) / submittedOffers.length
      )
    : 0;

  const avgCertainty = submittedOffers.length
    ? Math.round(
        submittedOffers.reduce((acc, buyer) => acc + (buyer.phase4Offer?.certainty ?? 0), 0) / submittedOffers.length
      )
    : 0;

  const submittedPct = shortlisted.length ? Math.round((submittedOffers.length / shortlisted.length) * 100) : 0;
  const analyzedPct = submittedOffers.length ? Math.round((analyzedOffers.length / submittedOffers.length) * 100) : 0;
  const recommendationPct = submittedOffers.length
    ? Math.round(
        (submittedOffers.filter((buyer) => buyer.phase4Offer?.recommendation !== "undecided").length /
          submittedOffers.length) *
          100
      )
    : 0;

  state.variables.nboCoverage = clamp(
    Math.round(submittedPct * 0.75 + (collected ? 10 : 0) + state.variables.nboCoverage * 0.25),
    0,
    100
  );

  state.variables.offerComparability = clamp(
    Math.round(analyzedPct * 0.65 + avgQuality * 0.2 + (normalized ? 8 : 0) + (matrixBuilt ? 8 : 0)),
    0,
    100
  );

  state.variables.advancementClarity = clamp(
    Math.round(
      recommendationPct * 0.45 +
        (advancedOffers.length ? (advancedOffers.length >= 2 ? 25 : 10) : 0) +
        state.variables.clientAlignment * 0.2 +
        (recommended ? 8 : 0)
    ),
    0,
    100
  );

  state.variables.priceConfidence = clamp(
    Math.round(
      avgCertainty * 0.5 +
        state.variables.offerComparability * 0.3 +
        state.variables.clientAlignment * 0.2 +
        (reviewed ? 6 : 0) +
        (clientReframed ? 4 : 0)
    ),
    0,
    100
  );

  state.variables.clientAlignment = clamp(
    Math.round(
      state.variables.clientAlignment * 0.7 + state.variables.advancementClarity * 0.2 + (clientReframed ? 10 : -2)
    ),
    0,
    100
  );

  state.variables.responseBacklogPressure = clamp(
    Math.round((pendingCount / Math.max(submittedOffers.length, 1)) * 100 + (phase5Prepared ? -15 : 0)),
    0,
    100
  );

  state.variables.processMomentum = clamp(
    Math.round(
      state.variables.processMomentum * 0.45 +
        state.variables.nboCoverage * 0.2 +
        state.variables.offerComparability * 0.2 +
        state.variables.advancementClarity * 0.15
    ),
    0,
    100
  );

  if (submittedOffers.length < 2) {
    context.generatedMessages.push({
      category: "Warning",
      title: "Thin NBO set",
      text: "At least two submitted offers are needed to preserve leverage into due diligence."
    });
  }

  if (selectivityLocked) {
    context.generatedMessages.push({
      category: advancedOffers.length >= 2 ? "Milestone" : "Warning",
      title: advancedOffers.length >= 2 ? "DD invite list locked" : "DD invite list weak",
      text:
        advancedOffers.length >= 2
          ? `${advancedOffers.length} buyers marked to advance into due diligence.`
          : "Fewer than two buyers were advanced; process leverage is now fragile."
    });
  }

  if (matrixBuilt && normalized && reviewed) {
    context.generatedMessages.push({
      category: "Milestone",
      title: "Offer matrix calibrated",
      text: "Price, structure, and conditionality are now comparable across active bids."
    });
  }
}

function updatePhase5BuyerStates(state, context) {
  ensurePhase5Context(state, context);

  const executedTags = new Set(
    context.executedActions.flatMap((action) => (Array.isArray(action.systemTags) ? action.systemTags : []))
  );

  const qnaLaunch = executedTags.has("dd_qna_launch");
  const qnaTriage = executedTags.has("dd_qna_triage");
  const dataRefresh = executedTags.has("dd_data_refresh");
  const qnaRespond = executedTags.has("dd_qna_respond");
  const issueInvestigate = executedTags.has("dd_issue_investigate");
  const issueContain = executedTags.has("dd_issue_contain");
  const mgmtPrep = executedTags.has("dd_mgmt_prep");
  const retainBidder = executedTags.has("dd_retain");
  const pruneBuyer = executedTags.has("dd_prune");
  const finalReview = executedTags.has("dd_final_readiness");

  const activeBefore = state.buyers.filter((buyer) => buyer.phase5Lane?.active && buyer.phase5Lane.status !== "dropped").length;
  let droppedThisWeek = 0;

  state.buyers.forEach((buyer) => {
    const lane = buyer.phase5Lane;
    if (!lane?.active || lane.status === "dropped") {
      if (lane) lane.status = lane?.status ?? "inactive";
      buyer.pendingAction = false;
      updateBuyerLabel(buyer);
      return;
    }

    lane.pendingQuestions = clamp(lane.pendingQuestions + randomInt(state, 1, 4), 0, 999);
    lane.issueLoad = clamp(lane.issueLoad + randomInt(state, -1, 3), 0, 100);
    lane.confidence = clamp(lane.confidence - 1, 0, 100);

    if (qnaLaunch) lane.pendingQuestions = clamp(lane.pendingQuestions - 2, 0, 999);
    if (qnaTriage) lane.pendingQuestions = clamp(lane.pendingQuestions - 3, 0, 999);
    if (dataRefresh) {
      lane.pendingQuestions = clamp(lane.pendingQuestions - 2, 0, 999);
      lane.confidence = clamp(lane.confidence + 2, 0, 100);
    }

    if (qnaRespond) {
      lane.pendingQuestions = clamp(lane.pendingQuestions - randomInt(state, 4, 8), 0, 999);
      lane.confidence = clamp(lane.confidence + 3, 0, 100);
    }

    if (issueInvestigate) {
      lane.issueLoad = clamp(lane.issueLoad - randomInt(state, 2, 5), 0, 100);
      lane.retradeRisk = clamp(lane.retradeRisk - randomInt(state, 2, 4), 0, 100);
    }

    if (issueContain) {
      lane.issueLoad = clamp(lane.issueLoad - randomInt(state, 4, 8), 0, 100);
      lane.retradeRisk = clamp(lane.retradeRisk - randomInt(state, 4, 7), 0, 100);
      lane.confidence = clamp(lane.confidence + 2, 0, 100);
    }

    if (mgmtPrep) {
      lane.confidence = clamp(lane.confidence + 3, 0, 100);
    }

    if (retainBidder && ["risk", "conditional", "stressed"].includes(lane.status)) {
      lane.confidence = clamp(lane.confidence + randomInt(state, 4, 8), 0, 100);
      lane.pendingQuestions = clamp(lane.pendingQuestions - randomInt(state, 1, 4), 0, 999);
    }

    if (pruneBuyer && lane.status === "risk" && lane.confidence < 45 && rollChance(state, 0.5)) {
      lane.active = false;
      lane.status = "dropped";
      buyer.pendingAction = false;
      droppedThisWeek += 1;
      updateBuyerLabel(buyer);
      return;
    }

    lane.retradeRisk = clamp(
      Math.round(lane.retradeRisk * 0.65 + lane.issueLoad * 0.25 + lane.pendingQuestions * 0.5 / 10),
      0,
      100
    );

    if (lane.confidence >= 70 && lane.issueLoad <= 35 && lane.pendingQuestions <= 12) {
      lane.status = "stable";
    } else if (lane.confidence >= 55 && lane.issueLoad <= 55) {
      lane.status = "stressed";
    } else if (lane.confidence >= 40) {
      lane.status = "conditional";
    } else {
      lane.status = "risk";
    }

    buyer.pendingAction = lane.pendingQuestions >= 10;
    buyer.lastTouchedWeek = state.clock.week;
    updateBuyerLabel(buyer);
  });

  const activeLanes = state.buyers.filter((buyer) => buyer.phase5Lane?.active && buyer.phase5Lane.status !== "dropped");
  const avgConfidence = activeLanes.length
    ? Math.round(activeLanes.reduce((acc, buyer) => acc + buyer.phase5Lane.confidence, 0) / activeLanes.length)
    : 0;
  const avgPending = activeLanes.length
    ? Math.round(activeLanes.reduce((acc, buyer) => acc + buyer.phase5Lane.pendingQuestions, 0) / activeLanes.length)
    : 0;
  const avgIssueLoad = activeLanes.length
    ? Math.round(activeLanes.reduce((acc, buyer) => acc + buyer.phase5Lane.issueLoad, 0) / activeLanes.length)
    : 0;
  const avgRetrade = activeLanes.length
    ? Math.round(activeLanes.reduce((acc, buyer) => acc + buyer.phase5Lane.retradeRisk, 0) / activeLanes.length)
    : 0;

  state.variables.ddPressure = clamp(
    Math.round(avgPending * 5 + activeLanes.length * 4 - (qnaRespond ? 12 : 0) - (qnaTriage ? 8 : 0)),
    0,
    100
  );

  state.variables.issueContainment = clamp(
    Math.round(100 - avgIssueLoad + (issueInvestigate ? 6 : 0) + (issueContain ? 10 : 0) + (dataRefresh ? 3 : 0)),
    0,
    100
  );

  state.variables.buyerConfidence = clamp(
    Math.round(avgConfidence + (mgmtPrep ? 4 : 0) + (qnaRespond ? 3 : 0) - (state.variables.ddPressure > 70 ? 6 : 0)),
    0,
    100
  );

  state.variables.retradeRisk = clamp(
    Math.round(avgRetrade + (issueContain ? -8 : 0) + (state.variables.issueContainment < 50 ? 8 : 0)),
    0,
    100
  );

  state.variables.fieldSurvival = clamp(activeLanes.length * 25, 0, 100);

  state.variables.ddReadiness = clamp(
    Math.round(
      state.variables.ddReadiness * 0.45 +
        state.variables.issueContainment * 0.25 +
        state.variables.buyerConfidence * 0.2 +
        (finalReview ? 18 : 0)
    ),
    0,
    100
  );

  state.variables.responseBacklogPressure = clamp(
    Math.round(avgPending * 4 - (qnaRespond ? 10 : 0) - (qnaTriage ? 6 : 0)),
    0,
    100
  );

  state.variables.processMomentum = clamp(
    Math.round(
      state.variables.processMomentum * 0.5 +
        state.variables.buyerConfidence * 0.2 +
        state.variables.issueContainment * 0.2 +
        state.variables.ddReadiness * 0.1
    ),
    0,
    100
  );

  if (activeLanes.length < 2) {
    context.generatedMessages.push({
      category: "Warning",
      title: "DD field thinning",
      text: "Fewer than two active DD lanes remain, threatening leverage for final offers."
    });
  }

  if (droppedThisWeek > 0 || activeLanes.length < activeBefore) {
    context.generatedMessages.push({
      category: "Warning",
      title: "Buyer attrition in DD",
      text: `${Math.max(droppedThisWeek, activeBefore - activeLanes.length)} buyer lane(s) dropped this week.`
    });
  }

  if (finalReview && state.variables.ddReadiness >= 65) {
    context.generatedMessages.push({
      category: "Milestone",
      title: "Final DD readiness improved",
      text: "Process controls are approaching final-offer readiness thresholds."
    });
  }
}

function updatePhase6BuyerStates(state, context) {
  ensurePhase6Context(state, context);

  const executedTags = new Set(
    context.executedActions.flatMap((action) => (Array.isArray(action.systemTags) ? action.systemTags : []))
  );

  const collected = executedTags.has("fo_collect");
  const compared = executedTags.has("fo_compare");
  const scoredExecutability = executedTags.has("fo_execute_score");
  const assessedDrag = executedTags.has("fo_drag_assess");
  const testedFalseWinner = executedTags.has("fo_false_winner_test");
  const matrixBuilt = executedTags.has("fo_matrix");
  const pickedPreferred = executedTags.has("fo_pick_preferred");
  const pickedBackup = executedTags.has("fo_pick_backup");
  const clientAligned = executedTags.has("fo_client_align");
  const exclusivityPrepared = executedTags.has("fo_exclusivity_prepare");

  const finalPool = state.buyers.filter(
    (buyer) => buyer.phase6Bid?.submitted || buyer.phase5Lane?.active || buyer.phase6Bid?.role !== "none"
  );

  if (collected) {
    finalPool
      .filter((buyer) => !buyer.phase6Bid?.submitted)
      .forEach((buyer) => {
        const submissionChance = clamp(
          0.42 + buyer.hiddenConviction / 260 + (state.variables.processMomentum - 50) / 260,
          0.15,
          0.9
        );
        if (!rollChance(state, submissionChance)) return;
        buyer.phase6Bid.submitted = true;
        buyer.phase6Bid.headlineValue = Math.max(
          buyer.phase6Bid.headlineValue,
          clamp(Math.round((buyer.phase4Offer?.headlineValue ?? 65) + randomInt(state, 2, 12)), 30, 190)
        );
        buyer.phase6Bid.adjustedValue = clamp(
          Math.round(buyer.phase6Bid.headlineValue - buyer.phase6Bid.conditionalDrag * 0.38 + randomInt(state, -2, 2)),
          25,
          190
        );
      });
  }

  finalPool.forEach((buyer) => {
    if (!buyer.phase6Bid) buyer.phase6Bid = { ...emptyPhase6BidState() };
    const bid = buyer.phase6Bid;

    if (!bid.submitted) {
      bid.analyzed = false;
      bid.adjustedValue = null;
      bid.recommendation = "undecided";
      bid.role = "none";
      buyer.pendingAction = false;
      updateBuyerLabel(buyer);
      return;
    }

    bid.executionRisk = clamp(bid.executionRisk + randomInt(state, -1, 2), 0, 100);

    if (compared) {
      bid.adjustedValue = clamp(
        Math.round((bid.adjustedValue ?? bid.headlineValue) + randomInt(state, -2, 2)),
        25,
        190
      );
      bid.analyzed = true;
    }

    if (assessedDrag) {
      bid.conditionalDrag = clamp(
        Math.round(bid.conditionalDrag + randomInt(state, -4, 7) + (buyer.type === "Sponsor" ? 1 : -1)),
        0,
        100
      );
      bid.adjustedValue = clamp(Math.round(bid.headlineValue - bid.conditionalDrag * 0.4 + randomInt(state, -3, 2)), 20, 190);
      bid.analyzed = true;
    }

    if (scoredExecutability) {
      const lane = buyer.phase5Lane ?? {};
      const laneConfidence = lane.confidence ?? 55;
      const laneRetrade = lane.retradeRisk ?? 30;
      const laneIssues = lane.issueLoad ?? 25;
      const inferredRisk = Math.round(62 - laneConfidence * 0.5 + laneRetrade * 0.5 + laneIssues * 0.2);
      bid.executionRisk = clamp(inferredRisk + randomInt(state, -5, 5), 0, 100);
      bid.analyzed = true;
    }

    if (matrixBuilt || compared || assessedDrag || scoredExecutability) {
      const score = computePhase6BidScore(bid);
      if (score >= 72) bid.recommendation = "preferred";
      else if (score >= 60) bid.recommendation = "backup";
      else if (score >= 48) bid.recommendation = "hold";
      else bid.recommendation = "drop";
    }

    buyer.pendingAction = bid.submitted && !bid.analyzed;
    buyer.lastTouchedWeek = state.clock.week;
    updateBuyerLabel(buyer);
  });

  const submittedBids = finalPool.filter((buyer) => buyer.phase6Bid?.submitted);
  const analyzedBids = submittedBids.filter((buyer) => buyer.phase6Bid?.analyzed);

  if (testedFalseWinner && submittedBids.length >= 2) {
    const headlineLeader = [...submittedBids].sort(
      (a, b) => (b.phase6Bid?.headlineValue ?? 0) - (a.phase6Bid?.headlineValue ?? 0)
    )[0];
    const bestRobust = [...submittedBids].sort(
      (a, b) => computePhase6BidScore(b.phase6Bid) - computePhase6BidScore(a.phase6Bid)
    )[0];

    if (headlineLeader && bestRobust && headlineLeader.id !== bestRobust.id) {
      const flagged = headlineLeader.phase6Bid;
      flagged.recommendation = flagged.recommendation === "preferred" ? "hold" : flagged.recommendation;
      flagged.adjustedValue = clamp(Math.round((flagged.adjustedValue ?? flagged.headlineValue) - randomInt(state, 3, 8)), 15, 190);
      flagged.executionRisk = clamp(flagged.executionRisk + randomInt(state, 3, 8), 0, 100);
      state.variables.falseWinnerRisk = clamp(state.variables.falseWinnerRisk - 8, 0, 100);
      context.generatedMessages.push({
        category: "Issue",
        title: "False winner pattern detected",
        text: `${headlineLeader.name} shows weaker execution than the headline price implies.`
      });
    } else {
      state.variables.falseWinnerRisk = clamp(state.variables.falseWinnerRisk - 5, 0, 100);
      context.generatedMessages.push({
        category: "Milestone",
        title: "Apparent winner validated",
        text: "False winner stress test did not expose a major headline-versus-execution mismatch."
      });
    }
  }

  if (pickedPreferred) {
    const sorted = [...analyzedBids].sort(
      (a, b) => computePhase6BidScore(b.phase6Bid) - computePhase6BidScore(a.phase6Bid)
    );
    state.buyers.forEach((buyer) => {
      if (buyer.phase6Bid?.role === "preferred") buyer.phase6Bid.role = "none";
    });
    const preferred = sorted[0] ?? null;
    if (preferred) {
      preferred.phase6Bid.role = "preferred";
      preferred.phase6Bid.recommendation = "preferred";
      preferred.pendingAction = false;
      preferred.lastTouchedWeek = state.clock.week;
      context.generatedMessages.push({
        category: "Milestone",
        title: "Preferred bidder selected",
        text: `${preferred.name} is now marked as preferred for exclusivity recommendation.`
      });
    }
  }

  if (pickedBackup) {
    const preferredId = state.buyers.find((buyer) => buyer.phase6Bid?.role === "preferred")?.id ?? null;
    const sorted = [...submittedBids]
      .filter((buyer) => buyer.id !== preferredId)
      .sort((a, b) => computePhase6BidScore(b.phase6Bid) - computePhase6BidScore(a.phase6Bid));

    state.buyers.forEach((buyer) => {
      if (buyer.phase6Bid?.role === "backup") buyer.phase6Bid.role = "none";
    });

    const backup = sorted[0] ?? null;
    if (backup) {
      backup.phase6Bid.role = "backup";
      if (backup.phase6Bid.recommendation === "drop") backup.phase6Bid.recommendation = "backup";
      backup.lastTouchedWeek = state.clock.week;
      context.generatedMessages.push({
        category: "Milestone",
        title: "Backup bidder named",
        text: `${backup.name} is now preserved as backup leverage.`
      });
    }
  }

  const preferred = state.buyers.find((buyer) => buyer.phase6Bid?.role === "preferred") ?? null;
  const backup = state.buyers.find((buyer) => buyer.phase6Bid?.role === "backup") ?? null;

  if (clientAligned && preferred) {
    state.variables.clientAlignment = clamp(state.variables.clientAlignment + 8, 0, 100);
  } else if (clientAligned && !preferred) {
    state.variables.clientAlignment = clamp(state.variables.clientAlignment - 3, 0, 100);
  }

  if (exclusivityPrepared && preferred) {
    state.variables.exclusivityReadiness = clamp(state.variables.exclusivityReadiness + 14, 0, 100);
  }

  const avgHeadline = submittedBids.length
    ? Math.round(submittedBids.reduce((acc, buyer) => acc + (buyer.phase6Bid?.headlineValue ?? 0), 0) / submittedBids.length)
    : 0;
  const avgRisk = analyzedBids.length
    ? Math.round(analyzedBids.reduce((acc, buyer) => acc + (buyer.phase6Bid?.executionRisk ?? 50), 0) / analyzedBids.length)
    : 55;
  const avgDrag = analyzedBids.length
    ? Math.round(analyzedBids.reduce((acc, buyer) => acc + (buyer.phase6Bid?.conditionalDrag ?? 0), 0) / analyzedBids.length)
    : 40;

  const analyzedPct = submittedBids.length ? Math.round((analyzedBids.length / submittedBids.length) * 100) : 0;
  const submittedPct = finalPool.length ? Math.round((submittedBids.length / finalPool.length) * 100) : 0;

  const headlineLeader = [...submittedBids].sort((a, b) => (b.phase6Bid?.headlineValue ?? 0) - (a.phase6Bid?.headlineValue ?? 0))[0];
  const robustLeader = [...submittedBids].sort((a, b) => computePhase6BidScore(b.phase6Bid) - computePhase6BidScore(a.phase6Bid))[0];
  const mismatchPenalty = headlineLeader && robustLeader && headlineLeader.id !== robustLeader.id ? 14 : 0;
  const headlineRiskPenalty = headlineLeader && (headlineLeader.phase6Bid?.executionRisk ?? 0) > 62 ? 8 : 0;

  state.variables.finalOfferStrength = clamp(
    Math.round(
      state.variables.finalOfferStrength * 0.4 +
        submittedPct * 0.25 +
        (avgHeadline > 0 ? clamp(Math.round((avgHeadline - 45) * 0.85), 0, 100) * 0.35 : 0) +
        (collected ? 5 : 0)
    ),
    0,
    100
  );

  state.variables.finalOfferComparability = clamp(
    Math.round(analyzedPct * 0.55 + (100 - avgDrag) * 0.15 + (compared ? 8 : 0) + (assessedDrag ? 8 : 0) + (matrixBuilt ? 8 : 0)),
    0,
    100
  );

  const previousExecutableCertainty = state.variables.executableCertainty;
  const previousFalseWinnerRisk = state.variables.falseWinnerRisk;
  const rawExecutableCertainty = clamp(
    Math.round(
      (100 - avgRisk) * 0.55 +
        state.variables.finalOfferComparability * 0.2 +
        (scoredExecutability ? 10 : 0) +
        (testedFalseWinner ? 6 : 0) +
        (clientAligned ? 4 : 0)
    ),
    0,
    100
  );

  const executableStabilityFloor =
    preferred && backup && analyzedBids.length >= 2 && state.variables.finalOfferComparability >= 65
      ? scoredExecutability || testedFalseWinner
        ? 62
        : 58
      : 0;

  state.variables.executableCertainty = clamp(
    Math.max(
      executableStabilityFloor,
      Math.round(
        previousExecutableCertainty * 0.4 +
          rawExecutableCertainty * 0.6 +
          (analyzedPct >= 80 ? 3 : 0) +
          (analyzedPct < 50 ? -6 : 0)
      )
    ),
    0,
    100
  );

  state.variables.falseWinnerRisk = clamp(
    Math.round(
      previousFalseWinnerRisk * 0.45 +
        avgRisk * 0.25 +
        mismatchPenalty +
        headlineRiskPenalty +
        (testedFalseWinner ? -10 : 0) +
        (scoredExecutability ? -4 : 0)
    ),
    0,
    100
  );

  const backupScore = backup ? computePhase6BidScore(backup.phase6Bid) : 0;
  state.variables.backupBidderStrength = clamp(
    Math.round(
      backupScore * 0.75 +
        (pickedBackup && backup ? 12 : 0) +
        (submittedBids.length >= 2 ? 8 : -6) +
        (collected ? 4 : 0)
    ),
    0,
    100
  );

  state.variables.exclusivityReadiness = clamp(
    Math.round(
      state.variables.exclusivityReadiness * 0.35 +
        state.variables.executableCertainty * 0.3 +
        state.variables.clientAlignment * 0.2 +
        (preferred ? 15 : 0) +
        (backup ? 8 : 0) +
        (exclusivityPrepared ? 14 : 0)
    ),
    0,
    100
  );

  state.variables.responseBacklogPressure = clamp(
    Math.round(
      (submittedBids.filter((buyer) => buyer.pendingAction).length / Math.max(submittedBids.length, 1)) * 100 +
        (matrixBuilt ? -10 : 0) +
        (exclusivityPrepared ? -8 : 0)
    ),
    0,
    100
  );

  state.variables.processMomentum = clamp(
    Math.round(
      state.variables.processMomentum * 0.45 +
        state.variables.finalOfferStrength * 0.2 +
        state.variables.executableCertainty * 0.2 +
        state.variables.exclusivityReadiness * 0.15
    ),
    0,
    100
  );

  if (submittedBids.length < 2) {
    context.generatedMessages.push({
      category: "Warning",
      title: "Final bid field too thin",
      text: "Fewer than two final bids were received, weakening leverage for exclusivity."
    });
  }

  if (!preferred) {
    context.generatedMessages.push({
      category: "Warning",
      title: "Preferred bidder not selected",
      text: "A preferred bidder is required before entering SPA negotiation."
    });
  }

  if (preferred && !backup) {
    context.generatedMessages.push({
      category: "Warning",
      title: "Backup bidder missing",
      text: "No backup bidder is designated, reducing leverage if the preferred lane stalls."
    });
  }

  if (exclusivityPrepared && state.variables.exclusivityReadiness >= 65) {
    context.generatedMessages.push({
      category: "Milestone",
      title: "Exclusivity transition ready",
      text: "Exclusivity package is credible for handoff into SPA negotiation."
    });
  }

  if (state.variables.falseWinnerRisk >= 65) {
    context.generatedMessages.push({
      category: "Warning",
      title: "False winner risk elevated",
      text: "The highest headline bid may still be structurally weaker than alternatives."
    });
  }

  state.buyers.forEach((buyer) => updateBuyerLabel(buyer));
}

function updatePhase7BuyerStates(state, context) {
  ensurePhase7Context(state, context);

  const executedTags = new Set(
    context.executedActions.flatMap((action) => (Array.isArray(action.systemTags) ? action.systemTags : []))
  );

  const mapped = executedTags.has("spa_map");
  const packaged = executedTags.has("spa_package");
  const pushedBack = executedTags.has("spa_pushback");
  const conceded = executedTags.has("spa_concede");
  const traded = executedTags.has("spa_trade");
  const shadowSignalled = executedTags.has("spa_shadow");
  const clientBriefed = executedTags.has("spa_client_brief");
  const stabilityTested = executedTags.has("spa_test_stability");
  const checklistBuilt = executedTags.has("spa_checklist");
  const paperReviewed = executedTags.has("spa_review");
  const signingPathBuilt = executedTags.has("spa_signing_path");

  const madeProgressAction =
    mapped || packaged || conceded || traded || checklistBuilt || paperReviewed || signingPathBuilt;

  let preferred = state.buyers.find((buyer) => buyer.phase7Spa?.role === "preferred") ?? null;
  if (!preferred) {
    preferred =
      state.buyers.find((buyer) => buyer.phase6Bid?.role === "preferred") ??
      [...state.buyers]
        .filter((buyer) => buyer.phase6Bid?.submitted)
        .sort((a, b) => computePhase6BidScore(b.phase6Bid) - computePhase6BidScore(a.phase6Bid))[0] ??
      null;
    if (preferred) {
      preferred.phase7Spa = { ...emptyPhase7SpaState(), active: true, role: "preferred", stabilityState: "fragile" };
      preferred.phase6Bid.role = "preferred";
    }
  }

  const backup =
    state.buyers.find((buyer) => buyer.phase7Spa?.role === "backup") ??
    state.buyers.find((buyer) => buyer.phase6Bid?.role === "backup") ??
    null;

  const old = { ...state.variables };

  const residualLegalDrag = clamp(
    Math.round(
      old.residualLegalDrag +
        (mapped ? -8 : 0) +
        (packaged ? -12 : 0) +
        (conceded ? -10 : 0) +
        (traded ? -14 : 0) +
        (signingPathBuilt ? -9 : 0) +
        (old.clausePressure > 65 ? 7 : 0) +
        (!madeProgressAction ? 4 : 0) +
        (paperReviewed && old.falseClosureRisk > 45 ? 3 : 0) +
        randomInt(state, -2, 3)
    ),
    0,
    100
  );

  const clausePressure = clamp(
    Math.round(
      old.clausePressure * 0.55 +
        old.residualLegalDrag * 0.25 +
        (pushedBack ? -8 : 0) +
        (traded ? -5 : 0) +
        (shadowSignalled ? -6 : 0) +
        (old.preferredBidderStability < 45 ? 8 : 0) +
        (old.fallbackLeverage < 25 ? 7 : 0) +
        randomInt(state, -3, 4)
    ),
    0,
    100
  );

  const valueProtectionQuality = clamp(
    Math.round(
      old.valueProtectionQuality * 0.65 +
        (pushedBack ? 8 : 0) +
        (traded ? 3 : 0) +
        (conceded ? -9 : 0) +
        (clausePressure > 75 ? -4 : 0) +
        (paperReviewed ? 2 : 0)
    ),
    0,
    100
  );

  const concessionDiscipline = clamp(
    Math.round(
      old.concessionDiscipline * 0.55 +
        (traded ? 16 : 0) +
        (clientBriefed ? 10 : 0) +
        (pushedBack ? 4 : 0) +
        (packaged ? 5 : 0) +
        (conceded ? -8 : 0) +
        (conceded && !clientBriefed ? -4 : 0)
    ),
    0,
    100
  );

  const fallbackLeverage = clamp(
    Math.round(
      old.fallbackLeverage * 0.65 +
        (shadowSignalled ? 14 : 0) +
        (backup ? 8 : 0) +
        (old.signingReadiness > 85 ? -6 : 0) +
        randomInt(state, -2, 2)
    ),
    0,
    100
  );

  const preferredBidderStability = clamp(
    Math.round(
      old.preferredBidderStability +
        (stabilityTested ? 6 : 0) +
        (traded ? 5 : 0) +
        (conceded ? 4 : 0) +
        (shadowSignalled ? 3 : 0) +
        (clientBriefed ? 2 : 0) +
        (pushedBack ? -7 : 0) +
        (!madeProgressAction ? -4 : 0) +
        (clausePressure > 70 ? -6 : 0) +
        (residualLegalDrag > 45 ? -4 : 0) +
        randomInt(state, -2, 2)
    ),
    0,
    100
  );

  const legalControl = clamp(
    Math.round(
      old.legalControl * 0.5 +
        (mapped ? 14 : 0) +
        (packaged ? 8 : 0) +
        (paperReviewed ? 10 : 0) +
        (clientBriefed ? 5 : 0) +
        (stabilityTested ? 4 : 0) +
        (conceded ? -3 : 0) +
        (clausePressure > 72 ? -6 : 0)
    ),
    0,
    100
  );

  const clientValueSensitivity = clamp(
    Math.round(
      old.clientValueSensitivity * 0.7 +
        (clientBriefed ? -14 : 0) +
        (conceded ? 6 : 0) +
        (traded ? -4 : 0) +
        (pushedBack ? 3 : 0) +
        (old.signingReadiness > 88 ? 4 : 0) +
        randomInt(state, -2, 3)
    ),
    0,
    100
  );

  const falseClosureRisk = clamp(
    Math.round(
      old.falseClosureRisk * 0.45 +
        residualLegalDrag * 0.25 +
        (100 - legalControl) * 0.15 +
        (valueProtectionQuality < 40 ? 10 : 0) +
        (conceded ? 8 : 0) +
        (traded ? -5 : 0) +
        (paperReviewed ? -15 : 0) +
        (checklistBuilt ? -4 : 0) +
        (packaged ? -3 : 0)
    ),
    0,
    100
  );

  const paperFragility = clamp(
    Math.round(
      old.paperFragility * 0.45 +
        (100 - valueProtectionQuality) * 0.35 +
        falseClosureRisk * 0.2 +
        (conceded ? 6 : 0) +
        (traded ? -3 : 0) +
        (paperReviewed ? -6 : 0)
    ),
    0,
    100
  );

  const signingChecklistProgress = clamp(
    Math.round(
      old.signingChecklistProgress +
        (checklistBuilt ? 34 : 0) +
        (paperReviewed ? 20 : 0) +
        (signingPathBuilt ? 18 : 0) +
        (!madeProgressAction ? -2 : 0)
    ),
    0,
    100
  );

  const readinessImpulse =
    (conceded ? 10 : 0) +
    (traded ? 12 : 0) +
    (signingPathBuilt ? 14 : 0) +
    (packaged ? 4 : 0) +
    (checklistBuilt ? 6 : 0) +
    (paperReviewed ? 5 : 0) +
    (preferredBidderStability >= 60 ? 3 : 0) -
    (residualLegalDrag > 50 ? 8 : 0) -
    (clausePressure > 70 ? 5 : 0) -
    (falseClosureRisk > 55 ? 6 : 0);

  const signingReadiness = clamp(
    Math.round(
      old.signingReadiness * 0.48 +
        (100 - residualLegalDrag) * 0.22 +
        signingChecklistProgress * 0.2 +
        readinessImpulse
    ),
    0,
    100
  );

  state.variables.residualLegalDrag = residualLegalDrag;
  state.variables.clausePressure = clausePressure;
  state.variables.valueProtectionQuality = valueProtectionQuality;
  state.variables.concessionDiscipline = concessionDiscipline;
  state.variables.fallbackLeverage = fallbackLeverage;
  state.variables.preferredBidderStability = preferredBidderStability;
  state.variables.legalControl = legalControl;
  state.variables.clientValueSensitivity = clientValueSensitivity;
  state.variables.falseClosureRisk = falseClosureRisk;
  state.variables.paperFragility = paperFragility;
  state.variables.signingChecklistProgress = signingChecklistProgress;
  state.variables.signingReadiness = signingReadiness;
  state.variables.processMomentum = clamp(
    Math.round(
      old.processMomentum * 0.45 +
        signingReadiness * 0.25 +
        (100 - residualLegalDrag) * 0.15 +
        preferredBidderStability * 0.15
    ),
    0,
    100
  );

  state.buyers.forEach((buyer) => {
    if (!buyer.phase7Spa) buyer.phase7Spa = { ...emptyPhase7SpaState() };

    if (preferred && buyer.id === preferred.id) {
      buyer.phase7Spa.active = true;
      buyer.phase7Spa.role = "preferred";
      buyer.phase7Spa.clauseLoad = clamp(Math.round(clausePressure * 0.65 + randomInt(state, -5, 5)), 0, 100);
      buyer.phase7Spa.unresolvedBlocks = clamp(Math.round(residualLegalDrag * 0.75 + randomInt(state, -4, 4)), 0, 100);
      buyer.phase7Spa.lastMarkupSeverity = clamp(Math.round(clausePressure + randomInt(state, -6, 6)), 0, 100);

      if (preferredBidderStability >= 70 && clausePressure < 55) buyer.phase7Spa.stabilityState = "stable";
      else if (preferredBidderStability >= 58) buyer.phase7Spa.stabilityState = "executable";
      else if (preferredBidderStability >= 45) buyer.phase7Spa.stabilityState = "stretched";
      else if (preferredBidderStability >= 30) buyer.phase7Spa.stabilityState = "fragile";
      else buyer.phase7Spa.stabilityState = "breakdown_risk";

      buyer.pendingAction = buyer.phase7Spa.unresolvedBlocks > 15 && signingReadiness < 98;
      buyer.lastTouchedWeek = state.clock.week;
      updateBuyerLabel(buyer);
      return;
    }

    if (backup && buyer.id === backup.id) {
      buyer.phase7Spa.active = fallbackLeverage > 8;
      buyer.phase7Spa.role = "backup";
      buyer.phase7Spa.clauseLoad = clamp(Math.round(clausePressure * 0.35 + randomInt(state, -4, 4)), 0, 100);
      buyer.phase7Spa.unresolvedBlocks = clamp(Math.round(residualLegalDrag * 0.35 + randomInt(state, -3, 3)), 0, 100);
      buyer.phase7Spa.lastMarkupSeverity = clamp(Math.round(clausePressure * 0.45 + randomInt(state, -4, 5)), 0, 100);

      if (fallbackLeverage >= 60) buyer.phase7Spa.stabilityState = "stable";
      else if (fallbackLeverage >= 40) buyer.phase7Spa.stabilityState = "executable";
      else if (fallbackLeverage >= 20) buyer.phase7Spa.stabilityState = "stretched";
      else buyer.phase7Spa.stabilityState = "fragile";

      buyer.pendingAction = false;
      updateBuyerLabel(buyer);
      return;
    }

    buyer.phase7Spa = { ...emptyPhase7SpaState() };
    buyer.pendingAction = false;
    updateBuyerLabel(buyer);
  });

  if (!preferred) {
    context.generatedMessages.push({
      category: "Warning",
      title: "No preferred lane in SPA",
      text: "SPA negotiation started without a clear preferred bidder; execution risk is escalating."
    });
  }

  if (preferredBidderStability < 35) {
    context.generatedMessages.push({
      category: "Warning",
      title: "Preferred bidder fragility",
      text: "Preferred bidder stability is low; further hard pushback can trigger breakdown risk."
    });
  }

  if (falseClosureRisk >= 55) {
    context.generatedMessages.push({
      category: "Warning",
      title: "False closure risk elevated",
      text: "Progress appears high, but unresolved structural issues may still derail signing."
    });
  }

  if (signingChecklistProgress >= 100 && residualLegalDrag <= 12) {
    context.generatedMessages.push({
      category: "Milestone",
      title: "Signing safeguards in place",
      text: "Checklist execution is complete and residual legal drag is near clean-signing range."
    });
  }
}
function updatePhase8BuyerStates(state, context) {
  ensurePhase8Context(state, context);

  const executedTags = new Set(
    context.executedActions.flatMap((action) => (Array.isArray(action.systemTags) ? action.systemTags : []))
  );

  const reviewedSignability = executedTags.has("si_signability_review");
  const closeBlockers = executedTags.has("si_close_blockers");
  const escalatedBlocker = executedTags.has("si_escalate_blocker");
  const finalizedVersion = executedTags.has("si_finalize_version");
  const reconciledMarkup = executedTags.has("si_reconcile_markup");
  const lockedSignature = executedTags.has("si_lock_signature");
  const reviewedCoherence = executedTags.has("si_review_coherence");
  const sequencedApprovals = executedTags.has("si_sequence_approvals");
  const confirmedSignoff = executedTags.has("si_confirm_signoff");
  const clientBriefed = executedTags.has("si_client_brief");
  const mappedObligations = executedTags.has("si_map_obligations");
  const transitionReviewed = executedTags.has("si_transition_review");
  const triggeredSignature = executedTags.has("si_trigger_signature");

  const madeProgressAction =
    reviewedSignability ||
    closeBlockers ||
    escalatedBlocker ||
    finalizedVersion ||
    reconciledMarkup ||
    lockedSignature ||
    reviewedCoherence ||
    sequencedApprovals ||
    confirmedSignoff ||
    clientBriefed ||
    mappedObligations ||
    transitionReviewed;

  const old = { ...state.variables };

  const openItemMateriality = clamp(
    Math.round(
      old.openItemMateriality * 0.68 +
        (closeBlockers ? -14 : 0) +
        (escalatedBlocker ? -10 : 0) +
        (reviewedSignability ? -6 : 0) +
        (reconciledMarkup ? -4 : 0) +
        (old.lastMilePressure > 70 ? 6 : 0) +
        (!madeProgressAction ? 2 : 0) +
        randomInt(state, -2, 3)
    ),
    0,
    100
  );

  const openItemClosureRate = clamp(
    Math.round(
      old.openItemClosureRate * 0.65 +
        (100 - openItemMateriality) * 0.22 +
        (closeBlockers ? 16 : 0) +
        (escalatedBlocker ? 12 : 0) +
        (reviewedSignability ? 5 : 0) +
        (transitionReviewed ? 4 : 0) +
        (!madeProgressAction ? -3 : 0)
    ),
    0,
    100
  );

  const documentStability = clamp(
    Math.round(
      old.documentStability * 0.7 +
        (finalizedVersion ? 12 : 0) +
        (reconciledMarkup ? 14 : 0) +
        (lockedSignature ? 18 : 0) +
        (reviewedCoherence ? 8 : 0) +
        (old.lastMilePressure > 75 ? -5 : 0) +
        (!lockedSignature && !reconciledMarkup ? -2 : 0)
    ),
    0,
    100
  );

  const signability = clamp(
    Math.round(
      old.signability * 0.66 +
        (reviewedSignability ? 14 : 0) +
        (reviewedCoherence ? 15 : 0) +
        (closeBlockers ? 8 : 0) +
        (escalatedBlocker ? 6 : 0) +
        (documentStability >= 95 ? 4 : 0) +
        (openItemMateriality > 55 ? -5 : 0)
    ),
    0,
    100
  );

  const coordinationQuality = clamp(
    Math.round(
      old.coordinationQuality * 0.68 +
        (sequencedApprovals ? 12 : 0) +
        (confirmedSignoff ? 14 : 0) +
        (clientBriefed ? 8 : 0) +
        (reconciledMarkup ? 6 : 0) +
        (old.lastMilePressure > 70 ? -4 : 0) +
        randomInt(state, -2, 3)
    ),
    0,
    100
  );

  const executionDiscipline = clamp(
    Math.round(
      old.executionDiscipline * 0.7 +
        (lockedSignature ? 10 : 0) +
        (reviewedCoherence ? 8 : 0) +
        (escalatedBlocker ? 6 : 0) +
        (clientBriefed ? 4 : 0) +
        (triggeredSignature && (documentStability < 90 || signability < 80) ? -8 : 0) +
        (old.lastMilePressure > 80 ? -6 : 0)
    ),
    0,
    100
  );

  const counterpartyAlignment = clamp(
    Math.round(
      old.counterpartyAlignment * 0.66 +
        (confirmedSignoff ? 10 : 0) +
        (sequencedApprovals ? 8 : 0) +
        (clientBriefed ? 4 : 0) +
        (escalatedBlocker ? 3 : 0) +
        (!madeProgressAction ? -3 : 0) +
        (openItemMateriality > 60 ? -5 : 0)
    ),
    0,
    100
  );

  const signingTimingIntegrity = clamp(
    Math.round(
      old.signingTimingIntegrity * 0.7 +
        (sequencedApprovals ? 10 : 0) +
        (confirmedSignoff ? 8 : 0) +
        (transitionReviewed ? 5 : 0) +
        (!madeProgressAction ? -4 : 0) +
        (openItemMateriality > 65 ? -4 : 0)
    ),
    0,
    100
  );

  const lastMilePressure = clamp(
    Math.round(
      old.lastMilePressure * 0.62 +
        (100 - signingTimingIntegrity) * 0.35 +
        (100 - coordinationQuality) * 0.2 +
        (!madeProgressAction ? 6 : -3)
    ),
    0,
    100
  );

  const ceremonyRisk = clamp(
    Math.round(
      old.ceremonyRisk * 0.52 +
        (100 - coordinationQuality) * 0.35 +
        lastMilePressure * 0.2 +
        (confirmedSignoff ? -6 : 0) +
        (sequencedApprovals ? -4 : 0)
    ),
    0,
    100
  );

  const realExecutionRisk = clamp(
    Math.round(
      old.realExecutionRisk * 0.52 +
        (100 - signability) * 0.38 +
        (100 - documentStability) * 0.2 +
        (reviewedCoherence ? -14 : 0) +
        (reviewedSignability ? -6 : 0)
    ),
    0,
    100
  );

  const closingPreparationQuality = clamp(
    Math.round(
      old.closingPreparationQuality * 0.64 +
        (mappedObligations ? 16 : 0) +
        (transitionReviewed ? 18 : 0) +
        (reviewedCoherence ? 5 : 0) +
        (openItemClosureRate >= 90 ? 3 : 0)
    ),
    0,
    100
  );

  const residualPostSigningFragility = clamp(
    Math.round(
      old.residualPostSigningFragility * 0.58 +
        realExecutionRisk * 0.28 +
        (100 - closingPreparationQuality) * 0.14 +
        (mappedObligations ? -8 : 0) +
        (transitionReviewed ? -10 : 0)
    ),
    0,
    100
  );

  let signingConfidence = clamp(
    Math.round(
      old.signingConfidence * 0.62 +
        signability * 0.16 +
        documentStability * 0.14 +
        coordinationQuality * 0.12 +
        (confirmedSignoff ? 8 : 0) +
        (lockedSignature ? 8 : 0) -
        (ceremonyRisk > 55 ? 6 : 0) -
        (realExecutionRisk > 45 ? 6 : 0)
    ),
    0,
    100
  );

  const passiveExecutionFloor = clamp(
    Math.round(old.signingReadiness * 0.45 + old.legalControl * 0.25 + old.preferredBidderStability * 0.15),
    20,
    75
  );

  const noProgressDrift = !madeProgressAction && !triggeredSignature;

  const finalDocumentStability = noProgressDrift ? Math.max(documentStability, clamp(passiveExecutionFloor - 5, 0, 100)) : documentStability;
  const finalSignability = noProgressDrift ? Math.max(signability, clamp(passiveExecutionFloor - 8, 0, 100)) : signability;
  const finalCoordinationQuality =
    noProgressDrift ? Math.max(coordinationQuality, clamp(passiveExecutionFloor - 10, 0, 100)) : coordinationQuality;
  const finalExecutionDiscipline =
    noProgressDrift ? Math.max(executionDiscipline, clamp(passiveExecutionFloor - 12, 0, 100)) : executionDiscipline;

  const allowedRegression = madeProgressAction ? 2 : 6;
  const stabilizedOpenItemClosureRate = clamp(Math.max(openItemClosureRate, old.openItemClosureRate - allowedRegression), 0, 100);
  const stabilizedDocumentStability = clamp(Math.max(finalDocumentStability, old.documentStability - allowedRegression), 0, 100);
  const stabilizedSignability = clamp(Math.max(finalSignability, old.signability - allowedRegression), 0, 100);
  const stabilizedCoordinationQuality = clamp(
    Math.max(finalCoordinationQuality, old.coordinationQuality - allowedRegression),
    0,
    100
  );
  const stabilizedCounterpartyAlignment = clamp(
    Math.max(counterpartyAlignment, old.counterpartyAlignment - allowedRegression),
    0,
    100
  );
  const stabilizedClosingPreparationQuality = clamp(
    Math.max(closingPreparationQuality, old.closingPreparationQuality - allowedRegression),
    0,
    100
  );

  state.variables.openItemMateriality = openItemMateriality;
  state.variables.openItemClosureRate = stabilizedOpenItemClosureRate;
  state.variables.documentStability = stabilizedDocumentStability;
  state.variables.signability = stabilizedSignability;
  state.variables.coordinationQuality = stabilizedCoordinationQuality;
  state.variables.executionDiscipline = finalExecutionDiscipline;
  state.variables.counterpartyAlignment = stabilizedCounterpartyAlignment;
  state.variables.signingTimingIntegrity = signingTimingIntegrity;
  state.variables.lastMilePressure = lastMilePressure;
  state.variables.ceremonyRisk = ceremonyRisk;
  state.variables.realExecutionRisk = realExecutionRisk;
  state.variables.closingPreparationQuality = stabilizedClosingPreparationQuality;
  state.variables.residualPostSigningFragility = residualPostSigningFragility;

  const phase8ActionCount = context.executedActions.filter((action) => action.phaseIds?.includes(8)).length;
  if (phase8ActionCount > 8) {
    const overload = phase8ActionCount - 8;
    const overloadPenalty = clamp(overload * 2, 0, 14);

    state.variables.documentStability = clamp(state.variables.documentStability - overloadPenalty, 0, 100);
    state.variables.signability = clamp(state.variables.signability - Math.round(overloadPenalty * 0.85), 0, 100);
    state.variables.coordinationQuality = clamp(state.variables.coordinationQuality - overloadPenalty, 0, 100);
    state.variables.counterpartyAlignment = clamp(
      state.variables.counterpartyAlignment - Math.round(overloadPenalty * 0.65),
      0,
      100
    );
    state.variables.lastMilePressure = clamp(state.variables.lastMilePressure + Math.round(overloadPenalty * 0.75), 0, 100);
    state.variables.ceremonyRisk = clamp(state.variables.ceremonyRisk + overloadPenalty, 0, 100);
    state.variables.realExecutionRisk = clamp(
      state.variables.realExecutionRisk + Math.round(overloadPenalty * 0.85),
      0,
      100
    );
    signingConfidence = clamp(signingConfidence - overloadPenalty, 0, 100);

    context.generatedMessages.push({
      category: "Warning",
      title: "Signing lane overloaded",
      text: "Too many parallel signing moves reduced coordination quality and reintroduced execution risk."
    });
  }

  const preferred =
    state.buyers.find((buyer) => buyer.phase8Signing?.role === "preferred") ??
    state.buyers.find((buyer) => buyer.phase7Spa?.role === "preferred") ??
    state.buyers.find((buyer) => buyer.phase6Bid?.role === "preferred") ??
    null;

  const backup =
    state.buyers.find((buyer) => buyer.phase8Signing?.role === "backup") ??
    state.buyers.find((buyer) => buyer.phase7Spa?.role === "backup") ??
    state.buyers.find((buyer) => buyer.phase6Bid?.role === "backup") ??
    null;

  if (triggeredSignature) {
    const ceremonyReady =
      state.variables.coordinationQuality >= 72 &&
      state.variables.documentStability >= 95 &&
      state.variables.openItemClosureRate >= 95;
    const executionReady =
      state.variables.signability >= 85 &&
      state.variables.realExecutionRisk <= 25 &&
      state.variables.ceremonyRisk <= 35 &&
      state.variables.counterpartyAlignment >= 55;

    if (ceremonyReady && executionReady) {
      state.runtime.phase8Signed = true;
      signingConfidence = Math.max(signingConfidence, 95);
      context.generatedMessages.push({
        category: "Milestone",
        title: "Signature executed",
        text: "All parties executed the locked signature version with no material execution defects."
      });
    } else {
      state.runtime.phase8Signed = false;
      state.variables.counterpartyAlignment = clamp(state.variables.counterpartyAlignment - 10, 0, 100);
      state.variables.signingTimingIntegrity = clamp(state.variables.signingTimingIntegrity - 8, 0, 100);
      state.variables.lastMilePressure = clamp(state.variables.lastMilePressure + 10, 0, 100);
      state.variables.ceremonyRisk = clamp(state.variables.ceremonyRisk + 8, 0, 100);
      state.variables.realExecutionRisk = clamp(state.variables.realExecutionRisk + 8, 0, 100);
      signingConfidence = clamp(signingConfidence - 12, 0, 100);
      context.generatedMessages.push({
        category: "Warning",
        title: "Signing attempt failed",
        text: "Signature execution was attempted before the package was fully stable and aligned."
      });
    }
  }

  if (noProgressDrift) {
    signingConfidence = Math.max(signingConfidence, clamp(Math.round(old.signingConfidence * 0.72), 0, 100));
  }

  state.variables.signingConfidence = signingConfidence;
  state.variables.processMomentum = clamp(
    Math.round(
      old.processMomentum * 0.45 +
        state.variables.signingConfidence * 0.3 +
        state.variables.documentStability * 0.15 +
        state.variables.closingPreparationQuality * 0.1
    ),
    0,
    100
  );

  state.buyers.forEach((buyer) => {
    if (!buyer.phase8Signing) buyer.phase8Signing = { ...emptyPhase8SigningState() };

    if (preferred && buyer.id === preferred.id) {
      buyer.phase8Signing.active = true;
      buyer.phase8Signing.role = "preferred";
      buyer.phase8Signing.blockerCount = clamp(Math.round((100 - state.variables.openItemClosureRate) * 0.45), 0, 100);
      buyer.phase8Signing.versionSync = state.variables.documentStability;
      buyer.phase8Signing.ceremonyReadiness = state.variables.signingConfidence;

      if (state.runtime.phase8Signed) buyer.phase8Signing.status = "signed";
      else if (buyer.phase8Signing.blockerCount > 20 || state.variables.documentStability < 85) buyer.phase8Signing.status = "blocked";
      else if (state.variables.signingConfidence >= 90 && state.variables.openItemClosureRate >= 95) buyer.phase8Signing.status = "ready";
      else if (state.variables.signingConfidence >= 70) buyer.phase8Signing.status = "aligned";
      else buyer.phase8Signing.status = "fragile";

      buyer.pendingAction = !state.runtime.phase8Signed && buyer.phase8Signing.status !== "ready";
      buyer.lastTouchedWeek = state.clock.week;
      updateBuyerLabel(buyer);
      return;
    }

    if (backup && buyer.id === backup.id) {
      buyer.phase8Signing.active = true;
      buyer.phase8Signing.role = "backup";
      buyer.phase8Signing.blockerCount = clamp(Math.round((100 - state.variables.openItemClosureRate) * 0.25), 0, 100);
      buyer.phase8Signing.versionSync = clamp(Math.round(state.variables.documentStability * 0.7), 0, 100);
      buyer.phase8Signing.ceremonyReadiness = clamp(Math.round(state.variables.counterpartyAlignment * 0.7), 0, 100);
      buyer.phase8Signing.status = state.runtime.phase8Signed ? "signed" : state.variables.counterpartyAlignment >= 65 ? "aligned" : "fragile";
      buyer.pendingAction = false;
      updateBuyerLabel(buyer);
      return;
    }

    buyer.phase8Signing = { ...emptyPhase8SigningState() };
    buyer.pendingAction = false;
    updateBuyerLabel(buyer);
  });

  if (!state.runtime.phase8Signed && state.variables.signingConfidence >= 90 && state.variables.openItemClosureRate >= 95) {
    context.generatedMessages.push({
      category: "Milestone",
      title: "Ready to sign",
      text: "Execution conditions are met; the deal is ready for a controlled signature trigger."
    });
  }

  if (state.variables.lastMilePressure >= 75) {
    context.generatedMessages.push({
      category: "Warning",
      title: "Last-mile pressure elevated",
      text: "Delay pressure is compounding and can destabilize signoff discipline."
    });
  }
}
function updatePhase9BuyerStates(state, context) {
  ensurePhase9Context(state, context);

  const executedTags = new Set(
    context.executedActions.flatMap((action) => (Array.isArray(action.systemTags) ? action.systemTags : []))
  );

  const buildTracker = executedTags.has("cl_cp_tracker");
  const resequence = executedTags.has("cl_cp_resequence");
  const chaseApproval = executedTags.has("cl_chase_approval");
  const escalateBlocked = executedTags.has("cl_escalate_blocked");
  const reviewReadiness = executedTags.has("cl_review_readiness");
  const reviewInterim = executedTags.has("cl_review_interim");
  const manageNervousness = executedTags.has("cl_manage_nervousness");
  const pushResponsive = executedTags.has("cl_push_responsive");
  const containDrift = executedTags.has("cl_contain_drift");
  const confirmPayment = executedTags.has("cl_confirm_payment");
  const coordinateFunds = executedTags.has("cl_coordinate_funds");
  const resolveSignature = executedTags.has("cl_resolve_signature");
  const confirmTransfer = executedTags.has("cl_confirm_transfer");
  const runCoordinationCheck = executedTags.has("cl_coordination_check");
  const triggerFee = executedTags.has("cl_trigger_fee");
  const postCloseReview = executedTags.has("cl_post_close_review");

  const stage = state.runtime.phase9Stage ?? "9A_PreClosing";
  const old = { ...state.variables };

  const madeProgress9A =
    buildTracker ||
    resequence ||
    chaseApproval ||
    escalateBlocked ||
    reviewReadiness ||
    reviewInterim ||
    manageNervousness ||
    pushResponsive ||
    containDrift;

  const madeProgress9B =
    confirmPayment ||
    coordinateFunds ||
    resolveSignature ||
    confirmTransfer ||
    runCoordinationCheck ||
    triggerFee ||
    postCloseReview;

  if (stage === "9A_PreClosing") {
    const cpDrag = clamp(
      Math.round(
        old.cpDrag * 0.72 +
          (buildTracker ? -16 : 0) +
          (resequence ? -12 : 0) +
          (escalateBlocked ? -9 : 0) +
          (old.interimRisk > 60 ? 5 : 0) +
          (!madeProgress9A ? 4 : 0) +
          randomInt(state, -2, 3)
      ),
      0,
      100
    );

    const cpCompletion = clamp(
      Math.round(
        old.cpCompletion * 0.68 +
          (100 - cpDrag) * 0.12 +
          (buildTracker ? 6 : 0) +
          (resequence ? 7 : 0) +
          (chaseApproval ? 10 : 0) +
          (escalateBlocked ? 8 : 0) +
          (pushResponsive ? 4 : 0) +
          (!madeProgress9A ? -4 : 0)
      ),
      0,
      100
    );

    const interimRisk = clamp(
      Math.round(
        old.interimRisk * 0.7 +
          (reviewInterim ? -10 : 0) +
          (manageNervousness ? -8 : 0) +
          (containDrift ? -12 : 0) +
          (cpDrag > 65 ? 8 : 0) +
          (!madeProgress9A ? 4 : 0) +
          randomInt(state, -2, 3)
      ),
      0,
      100
    );

    const interimStability = clamp(
      Math.round(
        old.interimStability * 0.65 +
          (100 - interimRisk) * 0.28 +
          (reviewInterim ? 8 : 0) +
          (containDrift ? 10 : 0) +
          (manageNervousness ? 4 : 0)
      ),
      0,
      100
    );

    const closingReadiness = clamp(
      Math.round(
        old.closingReadiness * 0.64 +
          (reviewReadiness ? 11 : 0) +
          (buildTracker ? 4 : 0) +
          (resequence ? 4 : 0) +
          (chaseApproval ? 3 : 0) +
          (pushResponsive ? 2 : 0) +
          (cpCompletion >= 95 ? 4 : 0) -
          (cpDrag > 70 ? 7 : 0)
      ),
      0,
      100
    );

    const completionConfidence = clamp(
      Math.round(
        old.completionConfidence * 0.62 +
          cpCompletion * 0.15 +
          closingReadiness * 0.15 +
          interimStability * 0.12 +
          (reviewReadiness ? 6 : 0) +
          (manageNervousness ? 4 : 0) -
          (old.delayRisk > 65 ? 8 : 0)
      ),
      0,
      100
    );

    const delayRisk = clamp(
      Math.round(
        old.delayRisk * 0.6 +
          cpDrag * 0.22 +
          (100 - completionConfidence) * 0.2 +
          (reviewReadiness ? -6 : 0) +
          (manageNervousness ? -4 : 0) +
          (containDrift ? -5 : 0) +
          (!madeProgress9A ? 6 : 0)
      ),
      0,
      100
    );

    const valueIntegrity = clamp(
      Math.round(
        old.valueIntegrity * 0.85 +
          (containDrift ? 5 : 0) +
          (reviewInterim ? 2 : 0) -
          (interimRisk > 65 ? 4 : 0) -
          (delayRisk > 70 ? 3 : 0)
      ),
      0,
      100
    );

    state.variables.cpDrag = cpDrag;
    state.variables.cpCompletion = cpCompletion;
    state.variables.interimRisk = interimRisk;
    state.variables.interimStability = interimStability;
    state.variables.closingReadiness = closingReadiness;
    state.variables.completionConfidence = completionConfidence;
    state.variables.delayRisk = delayRisk;
    state.variables.valueIntegrity = valueIntegrity;

    state.variables.fundsFlowReadiness = clamp(
      Math.round(old.fundsFlowReadiness * 0.75 + (reviewReadiness ? 5 : 0) + (confirmPayment ? 14 : 0)),
      0,
      100
    );

    state.variables.signatureIntegrity = clamp(
      Math.round(
        old.signatureIntegrity * 0.8 +
          old.documentStability * 0.08 +
          (resolveSignature ? 10 : 0) -
          (old.documentStability < 85 ? 2 : 0)
      ),
      0,
      100
    );

    state.variables.paymentTimingIntegrity = clamp(
      Math.round(old.paymentTimingIntegrity * 0.8 + (reviewReadiness ? 4 : 0) + (confirmPayment ? 8 : 0)),
      0,
      100
    );

    state.variables.ownershipTransferReadiness = clamp(
      Math.round(old.ownershipTransferReadiness * 0.82 + (reviewReadiness ? 4 : 0) + (confirmTransfer ? 14 : 0)),
      0,
      100
    );

    state.variables.fundsFlowIntegrity = clamp(
      Math.round(old.fundsFlowIntegrity * 0.8 + (confirmPayment ? 6 : 0) + (state.variables.fundsFlowReadiness >= 40 ? 2 : 0)),
      0,
      100
    );

    state.variables.closingExecutionQuality = clamp(
      Math.round(
        old.closingExecutionQuality * 0.7 +
          completionConfidence * 0.1 +
          (100 - delayRisk) * 0.1 +
          old.executionDiscipline * 0.1
      ),
      0,
      100
    );

    if (cpCompletion >= 100 && closingReadiness >= 90) {
      state.runtime.phase9Stage = "9B_Execution";
      state.variables.fundsFlowReadiness = Math.max(state.variables.fundsFlowReadiness, 40);
      state.variables.signatureIntegrity = Math.max(state.variables.signatureIntegrity, 85);
      state.variables.paymentTimingIntegrity = Math.max(state.variables.paymentTimingIntegrity, 60);
      state.variables.ownershipTransferReadiness = Math.max(state.variables.ownershipTransferReadiness, 65);
      context.generatedMessages.push({
        category: "Milestone",
        title: "Ready to close",
        text: "Conditions precedent are complete and the deal moved into closing execution mechanics."
      });
    }

    if (state.variables.cpCompletion >= 85 && state.variables.closingReadiness >= 80) {
      context.generatedMessages.push({
        category: "Milestone",
        title: "Pre-closing architecture stabilizing",
        text: "CP clearance and readiness are converging toward execution range."
      });
    }
  }

  if (state.runtime.phase9Stage === "9B_Execution") {
    const fundsFlowReadiness = clamp(
      Math.round(
        old.fundsFlowReadiness * 0.64 +
          (confirmPayment ? 10 : 0) +
          (coordinateFunds ? 12 : 0) +
          (runCoordinationCheck ? 6 : 0) +
          (!madeProgress9B ? -11 : 0) +
          randomInt(state, -2, 3)
      ),
      0,
      100
    );

    const paymentTimingIntegrity = clamp(
      Math.round(
        old.paymentTimingIntegrity * 0.62 +
          (confirmPayment ? 8 : 0) +
          (coordinateFunds ? 9 : 0) +
          (runCoordinationCheck ? 10 : 0) +
          (!madeProgress9B ? -12 : 0)
      ),
      0,
      100
    );

    const signatureIntegrity = clamp(
      Math.round(
        old.signatureIntegrity * 0.72 +
          (resolveSignature ? 14 : 0) +
          (runCoordinationCheck ? 6 : 0) +
          (postCloseReview ? 2 : 0) +
          (old.documentStability < 85 ? -6 : 0) +
          (!resolveSignature && old.signatureIntegrity < 85 ? -9 : 0)
      ),
      0,
      100
    );

    const ownershipTransferReadiness = clamp(
      Math.round(
        old.ownershipTransferReadiness * 0.63 +
          (confirmTransfer ? 15 : 0) +
          (coordinateFunds ? 4 : 0) +
          (resolveSignature ? 3 : 0)
      ),
      0,
      100
    );

    const fundsFlowIntegrity = clamp(
      Math.round(
        old.fundsFlowIntegrity * 0.6 +
          fundsFlowReadiness * 0.15 +
          (coordinateFunds ? 10 : 0) +
          (confirmPayment ? 5 : 0) +
          (confirmTransfer ? 4 : 0) +
          (resolveSignature ? 3 : 0) +
          (old.delayRisk > 60 ? -11 : 0)
      ),
      0,
      100
    );

    const delayRisk = clamp(
      Math.round(
        old.delayRisk * 0.65 +
          (100 - paymentTimingIntegrity) * 0.26 +
          (100 - fundsFlowReadiness) * 0.2 +
          (runCoordinationCheck ? -9 : 0) +
          (coordinateFunds ? -5 : 0) +
          (!madeProgress9B ? 10 : 0)
      ),
      0,
      100
    );

    const completionConfidence = clamp(
      Math.round(
        old.completionConfidence * 0.56 +
          fundsFlowIntegrity * 0.16 +
          signatureIntegrity * 0.12 +
          ownershipTransferReadiness * 0.09 +
          paymentTimingIntegrity * 0.08 -
          (delayRisk > 60 ? 12 : 0)
      ),
      0,
      100
    );

    const valueIntegrity = clamp(
      Math.round(
        old.valueIntegrity * 0.9 +
          (triggerFee ? 2 : 0) -
          (delayRisk > 70 ? 3 : 0) -
          (fundsFlowIntegrity < 70 ? 2 : 0)
      ),
      0,
      100
    );

    const closingExecutionQuality = clamp(
      Math.round(
        old.closingExecutionQuality * 0.5 +
          fundsFlowIntegrity * 0.17 +
          signatureIntegrity * 0.13 +
          paymentTimingIntegrity * 0.1 +
          ownershipTransferReadiness * 0.08 -
          (delayRisk > 55 ? 14 : 0)
      ),
      0,
      100
    );

    state.variables.fundsFlowReadiness = fundsFlowReadiness;
    state.variables.paymentTimingIntegrity = paymentTimingIntegrity;
    state.variables.signatureIntegrity = signatureIntegrity;
    state.variables.ownershipTransferReadiness = ownershipTransferReadiness;
    state.variables.fundsFlowIntegrity = fundsFlowIntegrity;
    state.variables.delayRisk = delayRisk;
    state.variables.completionConfidence = completionConfidence;
    state.variables.valueIntegrity = valueIntegrity;
    state.variables.closingExecutionQuality = closingExecutionQuality;

    const structuralFriction = clamp(
      Math.round(
        state.variables.cpComplexity * 0.06 +
          state.variables.cpDrag * 0.05 +
          Math.max(0, state.variables.interimRisk - 30) * 0.12
      ),
      0,
      16
    );

    state.variables.closingExecutionQuality = clamp(
      state.variables.closingExecutionQuality - structuralFriction,
      0,
      100
    );

    const phase9ActionCount = context.executedActions.filter((action) => action.phaseIds?.includes(9)).length;
    if (phase9ActionCount > 5) {
      const overload = phase9ActionCount - 5;
      const overloadPenalty = clamp(overload * 3, 0, 15);

      state.variables.fundsFlowReadiness = clamp(state.variables.fundsFlowReadiness - overloadPenalty, 0, 100);
      state.variables.paymentTimingIntegrity = clamp(state.variables.paymentTimingIntegrity - overloadPenalty, 0, 100);
      state.variables.signatureIntegrity = clamp(
        state.variables.signatureIntegrity - Math.round(overloadPenalty * 0.85),
        0,
        100
      );
      state.variables.fundsFlowIntegrity = clamp(
        state.variables.fundsFlowIntegrity - Math.round(overloadPenalty * 0.75),
        0,
        100
      );
      state.variables.delayRisk = clamp(state.variables.delayRisk + overloadPenalty, 0, 100);
      state.variables.completionConfidence = clamp(
        state.variables.completionConfidence - Math.round(overloadPenalty * 0.65),
        0,
        100
      );
      state.variables.closingExecutionQuality = clamp(
        state.variables.closingExecutionQuality - Math.round(overloadPenalty * 0.7),
        0,
        100
      );

      context.generatedMessages.push({
        category: "Warning",
        title: "Closing execution overloaded",
        text: "Too many parallel closing moves introduced sequencing friction and execution error risk."
      });
    }

    if (triggerFee) {
      state.variables.feeRealisation = clamp(
        Math.max(old.feeRealisation, Math.round(state.variables.finalOfferStrength * 0.45 + valueIntegrity * 0.35)),
        0,
        100
      );
    }

    if (postCloseReview) {
      state.variables.reputationOutcome = clamp(old.reputationOutcome + 10, 0, 100);
      state.variables.rainmakerProgressImpact = clamp(old.rainmakerProgressImpact + 12, 0, 100);
    }

    const closeReady =
      state.variables.fundsFlowIntegrity >= 96 &&
      state.variables.ownershipTransferReadiness >= 95 &&
      state.variables.signatureIntegrity >= 95 &&
      state.variables.paymentTimingIntegrity >= 87 &&
      state.variables.completionConfidence >= 84 &&
      state.variables.closingExecutionQuality >= 68 &&
      state.variables.delayRisk <= 40;

    if (closeReady) {
      state.runtime.phase9Closed = true;
      state.runtime.phase9Stage = "Closed";
      state.deal.status = "closed";

      const closeFriction = clamp(
        Math.round(
          Math.max(0, state.variables.cpDrag - 18) * 0.18 +
            Math.max(0, state.variables.interimRisk - 25) * 0.22 +
            Math.max(0, state.variables.delayRisk - 20) * 0.35
        ),
        0,
        18
      );

      state.variables.closingExecutionQuality = clamp(
        Math.min(
          Math.max(state.variables.closingExecutionQuality - closeFriction, state.variables.delayRisk <= 30 ? 80 : 60),
          96
        ),
        0,
        100
      );

      const outcomeIntegrity = clamp(
        Math.round(
          state.variables.valueIntegrity * 0.32 +
            state.variables.closingExecutionQuality * 0.28 +
            state.variables.completionConfidence * 0.2 +
            state.variables.feeRealisation * 0.1 +
            (100 - state.variables.delayRisk) * 0.1
        ),
        0,
        100
      );

      state.variables.outcomeIntegrity = Math.max(state.variables.outcomeIntegrity, outcomeIntegrity);
      state.variables.clientOutcomeSatisfaction = clamp(
        Math.round(state.variables.valueIntegrity * 0.5 + outcomeIntegrity * 0.25 + state.variables.clientAlignment * 0.25),
        0,
        100
      );
      state.variables.reputationOutcome = clamp(
        Math.round(outcomeIntegrity * 0.55 + state.variables.closingExecutionQuality * 0.3 + (100 - state.riskDebt) * 0.15),
        0,
        100
      );
      state.variables.rainmakerProgressImpact = clamp(
        Math.round(outcomeIntegrity * 0.45 + state.variables.reputationOutcome * 0.35 + state.variables.feeRealisation * 0.2),
        0,
        100
      );

      context.generatedMessages.push({
        category: "Milestone",
        title: state.variables.closingExecutionQuality >= 82 ? "Clean close achieved" : "Completion achieved, quality reduced",
        text:
          state.variables.closingExecutionQuality >= 82
            ? "Funds and ownership transferred cleanly; outcome integrity is preserved."
            : "The deal closed, but delay and execution friction reduced final quality."
      });
    }

    if (!closeReady) {
      state.runtime.phase9Closed = false;
      if (!madeProgress9B) {
        state.variables.fundsFlowReadiness = clamp(state.variables.fundsFlowReadiness - 8, 0, 100);
        state.variables.paymentTimingIntegrity = clamp(state.variables.paymentTimingIntegrity - 8, 0, 100);
        state.variables.delayRisk = clamp(state.variables.delayRisk + 10, 0, 100);
        state.variables.completionConfidence = clamp(state.variables.completionConfidence - 6, 0, 100);
      }
    }

    if (
      !closeReady &&
      state.variables.delayRisk >= 88 &&
      state.variables.completionConfidence <= 45 &&
      state.variables.fundsFlowIntegrity < 75
    ) {
      state.runtime.phase9Closed = false;
      state.runtime.phase9Stage = "Failed";
      state.deal.status = "failed";
      state.variables.outcomeIntegrity = Math.min(
        state.variables.outcomeIntegrity,
        clamp(Math.round(state.variables.valueIntegrity * 0.55), 20, 65)
      );

      context.generatedMessages.push({
        category: "Warning",
        title: "Closing failed",
        text: "Execution friction and delay risk breached control limits; the transaction failed to complete."
      });
    }

    if (state.variables.fundsFlowIntegrity >= 90 && state.variables.signatureIntegrity >= 95 && !state.runtime.phase9Closed) {
      context.generatedMessages.push({
        category: "Milestone",
        title: "Near-close execution state",
        text: "Funds and documentation are nearly synchronized; final transfer confirmation is within reach."
      });
    }
  }

  state.variables.processMomentum = clamp(
    Math.round(old.processMomentum * 0.5 + state.variables.completionConfidence * 0.3 + (100 - state.variables.delayRisk) * 0.2),
    0,
    100
  );

  if (state.variables.interimRisk >= 70 && state.runtime.phase9Stage !== "Closed") {
    context.generatedMessages.push({
      category: "Warning",
      title: "Interim risk elevated",
      text: "Business drift is threatening closing certainty while CP mechanics are still active."
    });
  }

  if (state.variables.valueIntegrity < 85 && state.runtime.phase9Stage !== "Closed") {
    context.generatedMessages.push({
      category: "Warning",
      title: "Value integrity under pressure",
      text: "Closing economics are degrading and may reduce client satisfaction at completion."
    });
  }

  if (state.runtime.phase9Stage === "9B_Execution" && state.variables.delayRisk >= 60) {
    context.generatedMessages.push({
      category: "Warning",
      title: "Closing delay risk elevated",
      text: "Execution sequencing is unstable and can push transfer beyond the intended close window."
    });
  }

  const preferred =
    state.buyers.find((buyer) => buyer.phase8Signing?.role === "preferred") ??
    state.buyers.find((buyer) => buyer.phase7Spa?.role === "preferred") ??
    state.buyers.find((buyer) => buyer.phase6Bid?.role === "preferred") ??
    null;

  const backup =
    state.buyers.find((buyer) => buyer.phase8Signing?.role === "backup") ??
    state.buyers.find((buyer) => buyer.phase7Spa?.role === "backup") ??
    state.buyers.find((buyer) => buyer.phase6Bid?.role === "backup") ??
    null;

  state.buyers.forEach((buyer) => {
    if (!buyer.phase9Closing) buyer.phase9Closing = { ...emptyPhase9ClosingState() };

    if (preferred && buyer.id === preferred.id) {
      buyer.phase9Closing.active = true;
      buyer.phase9Closing.role = "preferred";
      buyer.phase9Closing.cpProgress = state.variables.cpCompletion;
      buyer.phase9Closing.executionReadiness =
        state.runtime.phase9Stage === "9A_PreClosing" ? state.variables.completionConfidence : state.variables.closingExecutionQuality;
      buyer.phase9Closing.fundsReadiness = state.variables.fundsFlowReadiness;

      if (state.runtime.phase9Closed) {
        buyer.phase9Closing.status =
          state.variables.closingExecutionQuality >= 75 && state.variables.delayRisk <= 45
            ? "clean_close"
            : "completion_reduced";
      } else if (state.runtime.phase9Stage === "9A_PreClosing") {
        if (state.variables.cpCompletion >= 100 && state.variables.closingReadiness >= 90) buyer.phase9Closing.status = "ready_to_close";
        else if (state.variables.interimRisk >= 65) buyer.phase9Closing.status = "fragile_pending";
        else if (state.variables.delayRisk >= 55) buyer.phase9Closing.status = "stable_delayed";
        else buyer.phase9Closing.status = "cp_progressing";
      } else {
        if (state.variables.fundsFlowReadiness < 60 || state.variables.fundsFlowIntegrity < 70) buyer.phase9Closing.status = "funds_warning";
        else if (state.variables.signatureIntegrity < 90 || state.variables.paymentTimingIntegrity < 75) buyer.phase9Closing.status = "execution_risk";
        else buyer.phase9Closing.status = "ready_to_close";
      }

      buyer.pendingAction =
        !state.runtime.phase9Closed &&
        ["cp_progressing", "fragile_pending", "stable_delayed", "funds_warning", "execution_risk"].includes(buyer.phase9Closing.status);
      buyer.lastTouchedWeek = state.clock.week;
      updateBuyerLabel(buyer);
      return;
    }

    if (backup && buyer.id === backup.id) {
      buyer.phase9Closing.active = true;
      buyer.phase9Closing.role = "backup";
      buyer.phase9Closing.cpProgress = clamp(Math.round(state.variables.cpCompletion * 0.8), 0, 100);
      buyer.phase9Closing.executionReadiness = clamp(Math.round(state.variables.completionConfidence * 0.78), 0, 100);
      buyer.phase9Closing.fundsReadiness = clamp(Math.round(state.variables.fundsFlowReadiness * 0.75), 0, 100);

      if (state.runtime.phase9Closed) buyer.phase9Closing.status = "closed";
      else if (state.runtime.phase9Stage === "9B_Execution" && state.variables.fundsFlowReadiness < 55) buyer.phase9Closing.status = "funds_warning";
      else buyer.phase9Closing.status = "stable_delayed";

      buyer.pendingAction = false;
      updateBuyerLabel(buyer);
      return;
    }

    buyer.phase9Closing = { ...emptyPhase9ClosingState() };
    buyer.pendingAction = false;
    updateBuyerLabel(buyer);
  });
}

function updateRiskDebt(state, context) {
  if (state.deal.phaseId === 10) return;
  if (context.triggeredEvents.length > 0) state.riskDebt += 1;

  if (state.variables.dataQuality < 40) state.riskDebt += 1;
  if (state.variables.executionReadiness < 40) state.riskDebt += 1;
  if (state.deliverables.im.progress >= 60 && state.deliverables.im.qualityTier === "Basic") state.riskDebt += 1;

  if (state.deal.phaseId === 2) {
    if (state.variables.responseBacklogPressure > 55) state.riskDebt += 1;
    if (state.variables.confidentialityRisk > 65) state.riskDebt += 2;
    if (state.variables.buyerConversionRate < 15 && state.variables.outreachCoverage > 60) state.riskDebt += 1;
  }

  if (state.deal.phaseId === 3) {
    if (state.variables.shortlistQuality < 50) state.riskDebt += 1;
    if (state.variables.competitiveTension < 40) state.riskDebt += 1;
    if (state.variables.clientAlignment < 45) state.riskDebt += 1;
  }

  if (state.deal.phaseId === 4) {
    if (state.variables.nboCoverage < 60) state.riskDebt += 1;
    if (state.variables.offerComparability < 55) state.riskDebt += 1;
    if (state.variables.priceConfidence < 50) state.riskDebt += 1;
    if (state.variables.advancementClarity < 50) state.riskDebt += 1;
  }

  if (state.deal.phaseId === 5) {
    if (state.variables.ddPressure > 60) state.riskDebt += 2;
    if (state.variables.issueContainment < 55) state.riskDebt += 1;
    if (state.variables.buyerConfidence < 50) state.riskDebt += 1;
    if (state.variables.retradeRisk > 65) state.riskDebt += 2;
    if (state.variables.fieldSurvival < 50) state.riskDebt += 2;
  }

  if (state.deal.phaseId === 6) {
    const preferredCount = state.buyers.filter((buyer) => buyer.phase6Bid?.role === "preferred").length;
    const backupCount = state.buyers.filter((buyer) => buyer.phase6Bid?.role === "backup").length;
    if (state.variables.finalOfferComparability < 60) state.riskDebt += 1;
    if (state.variables.executableCertainty < 55) state.riskDebt += 2;
    if (state.variables.falseWinnerRisk > 60) state.riskDebt += 2;
    if (state.variables.backupBidderStrength < 40) state.riskDebt += 1;
    if (state.variables.exclusivityReadiness < 55) state.riskDebt += 1;
    if (preferredCount < 1) state.riskDebt += 2;
    if (backupCount < 1) state.riskDebt += 1;
  }

  if (state.deal.phaseId === 7) {
    if (state.variables.signingReadiness < 65) state.riskDebt += 1;
    if (state.variables.residualLegalDrag > 25) state.riskDebt += 2;
    if (state.variables.preferredBidderStability < 45) state.riskDebt += 2;
    if (state.variables.falseClosureRisk > 45) state.riskDebt += 2;
    if (state.variables.valueProtectionQuality < 35) state.riskDebt += 2;
    if (state.variables.fallbackLeverage < 20) state.riskDebt += 1;
    if (state.variables.signingChecklistProgress < 80) state.riskDebt += 1;
    if (state.variables.paperFragility > 60) state.riskDebt += 2;
  }

  if (state.deal.phaseId === 8) {
    if (!state.runtime.phase8Signed && state.variables.signingConfidence < 80) state.riskDebt += 1;
    if (state.variables.openItemClosureRate < 85) state.riskDebt += 2;
    if (state.variables.documentStability < 90) state.riskDebt += 2;
    if (state.variables.coordinationQuality < 65) state.riskDebt += 1;
    if (state.variables.counterpartyAlignment < 55) state.riskDebt += 2;
    if (state.variables.executionDiscipline < 60) state.riskDebt += 2;
    if (state.variables.ceremonyRisk > 40) state.riskDebt += 2;
    if (state.variables.realExecutionRisk > 30) state.riskDebt += 2;
    if (state.variables.closingPreparationQuality < 55) state.riskDebt += 1;
    if (state.variables.residualPostSigningFragility > 50) state.riskDebt += 2;
  }
  if (state.deal.phaseId === 9) {
    if (!state.runtime.phase9Closed && state.variables.cpCompletion < 100) state.riskDebt += 2;
    if (!state.runtime.phase9Closed && state.variables.closingReadiness < 85) state.riskDebt += 1;
    if (state.variables.interimRisk > 60) state.riskDebt += 2;
    if (state.variables.delayRisk > 55) state.riskDebt += 2;
    if (state.variables.fundsFlowReadiness < 70) state.riskDebt += 1;
    if (state.variables.fundsFlowIntegrity < 75) state.riskDebt += 2;
    if (state.variables.signatureIntegrity < 90) state.riskDebt += 1;
    if (state.variables.paymentTimingIntegrity < 80) state.riskDebt += 1;
    if (state.variables.ownershipTransferReadiness < 90) state.riskDebt += 1;
    if (state.variables.valueIntegrity < 85) state.riskDebt += 2;
    if (state.runtime.phase9Closed && state.variables.closingExecutionQuality < 65) state.riskDebt += 1;
  }
}

function updateResources(state) {
  state.runtime.lastWeekPressure = state.resources.pressure;
  state.resources.usedCapacity = 0;
  state.resources.pressure = 0;
}

function generateMessages(state, context) {
  const week = state.clock.week;
  context.generatedMessages.forEach((message, idx) => {
    state.inbox.unshift({
      id: `msg_${week}_${idx}_${Date.now()}`,
      week,
      category: message.category,
      title: message.title,
      text: message.text
    });
  });

  state.inbox = state.inbox.slice(0, 60);
  state.runtime.lastEventIds = context.triggeredEvents;
}

function generateHeadlines(state, context) {
  const headline = pickOne(state, HEADLINES);
  if (!headline) return;

  context.generatedHeadlines.push(headline);
  state.headlines.unshift({ week: state.clock.week, text: headline });
  state.headlines = state.headlines.slice(0, 20);
}

function checkPhaseTransition(state, context) {
  const gate = getPhaseGateStatus(state);
  const from = state.deal.phaseId;

  if (from === 9 && state.runtime.phase9Closed) {
    state.deal.status = "closed";
  }

  if (!gate.ready || gate.nextPhaseId === null) return;
  if (from >= 10) return;

  state.deal.phaseId = gate.nextPhaseId;
  state.runtime.phaseEnteredWeek = state.clock.week;
  state.activeTasks = getActionsForPhase(state.deal.phaseId).map((task) => task.id);

  if (state.deal.phaseId === 2) {
    ensurePhase2BuyerUniverse(state, context);
  }

  if (state.deal.phaseId === 3) {
    ensurePhase3Context(state, context);
  }

  if (state.deal.phaseId === 4) {
    ensurePhase4Context(state, context);
  }

  if (state.deal.phaseId === 5) {
    ensurePhase5Context(state, context);
  }

  if (state.deal.phaseId === 6) {
    ensurePhase6Context(state, context);
  }

  if (state.deal.phaseId === 7) {
    ensurePhase7Context(state, context);
  }

  if (state.deal.phaseId === 8) {
    ensurePhase8Context(state, context);
  }

  if (state.deal.phaseId === 9) {
    ensurePhase9Context(state, context);
  }

  if (state.deal.phaseId === 10) {
    ensurePhase10Context(state, context);
  }

  state.inbox.unshift({
    id: `msg_${state.clock.week}_phase_${from}_${state.deal.phaseId}_${Date.now()}`,
    week: state.clock.week,
    category: "Milestone",
    title: "Phase transition",
    text: `Moved from phase ${from} to phase ${state.deal.phaseId}.`
  });
}
function pushWeeklySummary(state, context) {
  const gate = getPhaseGateStatus(state);
  const counts = buyerCounts(state);

  const summary = {
    week: state.clock.week,
    phaseId: state.deal.phaseId,
    dealStatus: state.deal.status,
    phase9Stage: state.runtime.phase9Stage,
    phase9Closed: state.runtime.phase9Closed,
    phase10Initialized: state.runtime.phase10Initialized,
    resultsBoard: state.resultsBoard
      ? {
          dealOutcome: state.resultsBoard.dealOutcomeLabel,
          overallGrade: state.resultsBoard.scores?.overallGrade,
          overallDealScore: state.resultsBoard.scores?.overallDealScore
        }
      : null,
    executedTasks: context.executedActions.map((task) => task.id),
    blockedTasks: context.blockedActions,
    hiddenWorkHits: context.hiddenWorkHits,
    events: context.triggeredEvents,
    budgetRemaining: state.resources.budget,
    morale: state.team.morale,
    riskDebt: state.riskDebt,
    gateReady: gate.ready,
    pendingFollowups: state.runtime.pendingEventIds.length,
    pressureBand: pressureBand(state.runtime.lastWeekPressure ?? 0),
    buyerFunnel: {
      total: counts.total,
      contacted: counts.contacted,
      engaged: counts.engaged,
      converted: counts.converted,
      imAccess: counts.imAccess,
      backlog: counts.backlog,
      shortlisted: counts.shortlisted,
      candidatePool: counts.candidates,
      nboSubmitted: counts.nboSubmitted,
      nboAnalyzed: counts.nboAnalyzed,
      nboAdvanced: counts.nboAdvanced,
      ddActive: counts.ddActive,
      ddStable: counts.ddStable,
      ddRisk: counts.ddRisk,
      ddDropped: counts.ddDropped,
      finalSubmitted: counts.finalSubmitted,
      finalAnalyzed: counts.finalAnalyzed,
      finalPreferred: counts.finalPreferred,
      finalBackup: counts.finalBackup,
      spaActive: counts.spaActive,
      spaPreferred: counts.spaPreferred,
      spaBackup: counts.spaBackup,
      signingActive: counts.signingActive,
      signingReady: counts.signingReady,
      signingBlocked: counts.signingBlocked,
      signingSigned: counts.signingSigned,
      closingActive: counts.closingActive,
      closingReady: counts.closingReady,
      closingWarning: counts.closingWarning,
      closingClosed: counts.closingClosed
    }
  };

  state.runtime.weeklySummary = summary;
  state.history.unshift(
    state.deal.phaseId === 10 && summary.resultsBoard
      ? `Week ${summary.week}: phase 10 board ready (${summary.resultsBoard.overallGrade}, score ${summary.resultsBoard.overallDealScore}).`
      : `Week ${summary.week}: ${summary.executedTasks.length} tasks, ${summary.events.length} events, gate ${summary.gateReady ? "ready" : "blocked"}, risk debt ${summary.riskDebt}.`
  );
  state.history = state.history.slice(0, 50);
}

function advanceClock(state) {
  state.clock.week += 1;
}







































































