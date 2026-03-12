import { clamp, randomInt } from "./helpers.js";

export const BUYER_TEMPLATES = [
  {
    key: "apexcloud",
    name: "ApexCloud Systems",
    type: "Strategic",
    baseConviction: 55,
    scores: { strategicFit: 70, valuationPosture: 62, executionCredibility: 75 },
    riskFlags: []
  },
  {
    key: "kestrel",
    name: "Kestrel Capital",
    type: "Sponsor",
    baseConviction: 48,
    scores: { strategicFit: 59, valuationPosture: 72, executionCredibility: 63 },
    riskFlags: ["FinancingSensitivity"]
  },
  {
    key: "northbridge",
    name: "Northbridge Industrial",
    type: "Strategic",
    baseConviction: 52,
    scores: { strategicFit: 66, valuationPosture: 58, executionCredibility: 68 },
    riskFlags: ["SlowGovernance"]
  },
  {
    key: "harbor_peak",
    name: "Harbor Peak Partners",
    type: "Sponsor",
    baseConviction: 50,
    scores: { strategicFit: 57, valuationPosture: 76, executionCredibility: 60 },
    riskFlags: ["RetradeRisk"]
  },
  {
    key: "solstice",
    name: "Solstice Tech Group",
    type: "Strategic",
    baseConviction: 46,
    scores: { strategicFit: 62, valuationPosture: 64, executionCredibility: 58 },
    riskFlags: ["IntegrationRisk"]
  },
  {
    key: "ridgeway",
    name: "Ridgeway Equity",
    type: "Sponsor",
    baseConviction: 54,
    scores: { strategicFit: 60, valuationPosture: 74, executionCredibility: 69 },
    riskFlags: []
  }
];

export const BUYER_STAGE_LABELS = {
  uncontacted: "No Reply",
  teaser_sent: "Teaser Sent",
  no_reply: "No Reply",
  nda_requested: "NDA Requested",
  nda_signed: "NDA Signed",
  im_access: "IM Access",
  soft_pass: "Soft Pass"
};

export function createBuyerUniverse(state, count = 6) {
  const universe = [];
  const pool = [...BUYER_TEMPLATES];

  for (let i = 0; i < count; i += 1) {
    if (!pool.length) break;

    const index = randomInt(state, 0, pool.length - 1);
    const template = pool.splice(index, 1)[0];
    const convictionNoise = randomInt(state, -6, 6);

    universe.push({
      id: `buyer_${template.key}_${i + 1}`,
      name: template.name,
      type: template.type,
      stage: "uncontacted",
      shortlistStatus: "none",
      phase3Score: 0,
      phase4Offer: {
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
      },
      phase5Lane: {
        active: false,
        status: "inactive",
        confidence: 55,
        pendingQuestions: 0,
        issueLoad: 0,
        retradeRisk: 0
      },
      phase6Bid: {
        submitted: false,
        analyzed: false,
        headlineValue: 0,
        adjustedValue: null,
        executionRisk: 50,
        conditionalDrag: 0,
        recommendation: "undecided",
        role: "none"
      },
      phase7Spa: {
        active: false,
        role: "none",
        stabilityState: "inactive",
        clauseLoad: 0,
        unresolvedBlocks: 0,
        lastMarkupSeverity: 0
      },
      phase8Signing: {
        active: false,
        role: "none",
        status: "inactive",
        blockerCount: 0,
        versionSync: 0,
        ceremonyReadiness: 0
      },
      phase9Closing: {
        active: false,
        role: "none",
        status: "inactive",
        cpProgress: 0,
        executionReadiness: 0,
        fundsReadiness: 0
      },
      visibleState: BUYER_STAGE_LABELS.uncontacted,
      hiddenConviction: clamp(template.baseConviction + convictionNoise, 20, 90),
      scores: { ...template.scores },
      riskFlags: [...template.riskFlags],
      pendingAction: false,
      lastTouchedWeek: state.clock.week,
      notes: []
    });
  }

  return universe;
}

export function countBuyersByStage(buyers, stage) {
  return buyers.filter((buyer) => buyer.stage === stage).length;
}

export function updateBuyerLabel(buyer) {
  const base = BUYER_STAGE_LABELS[buyer.stage] ?? "Unknown";
  const shortlistMap = { shortlisted: "Shortlisted", candidate: "Candidate", dropped: "Dropped" };
  const shortlist = shortlistMap[buyer.shortlistStatus] ?? null;
  const ddStatusMap = { stable: "DD Stable", stressed: "DD Stressed", conditional: "DD Conditional", risk: "DD Risk", dropped: "DD Dropped" };
  const laneStatus = buyer.phase5Lane?.status;
  const ddStatus = laneStatus && laneStatus !== "inactive" ? ddStatusMap[laneStatus] ?? "DD Active" : buyer.phase4Offer?.advanced ? "DD Invite" : null;
  const finalRoleMap = { preferred: "Preferred", backup: "Backup" };
  const finalRole = finalRoleMap[buyer.phase6Bid?.role] ?? null;
  const spaStateMap = {
    stable: "SPA Stable",
    executable: "SPA Executable",
    stretched: "SPA Stretched",
    fragile: "SPA Fragile",
    breakdown_risk: "SPA Breakdown Risk"
  };
  const spaState = buyer.phase7Spa?.active ? spaStateMap[buyer.phase7Spa.stabilityState] ?? "SPA Active" : null;
  const signingStateMap = {
    aligned: "Signing Aligned",
    fragile: "Signing Fragile",
    blocked: "Signing Blocked",
    ready: "Ready To Sign",
    signed: "Signed"
  };
  const signingState = buyer.phase8Signing?.active ? signingStateMap[buyer.phase8Signing.status] ?? "Signing Active" : null;
  const closingStateMap = {
    cp_progressing: "CPs Progressing",
    stable_delayed: "Stable but Delayed",
    fragile_pending: "Fragile Pending",
    ready_to_close: "Ready to Close",
    funds_warning: "Funds Flow Warning",
    execution_risk: "Execution Risk",
    clean_close: "Clean Close Achieved",
    completion_reduced: "Completion Reduced",
    closed: "Closed"
  };
  const closingState = buyer.phase9Closing?.active ? closingStateMap[buyer.phase9Closing.status] ?? "Closing Active" : null;
  const labels = [closingState, signingState, spaState, finalRole, ddStatus, shortlist, base].filter(Boolean);
  buyer.visibleState = labels.join(" | ");
}

