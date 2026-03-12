import { getActionAvailability, getActionById, getActionsForPhase } from "./action-library.js";
import { getPhaseById, getPhaseGateStatus } from "./phase-definitions.js";

const PHASE8_STRATEGY_STEPS = [
  "Run signability + final drafting checks before signature.",
  "Lock document version and approvals before ceremony.",
  "Clear blockers before pressing trigger signature.",
  "Use trigger signature only with stable document and low ceremony risk."
];

const PHASE9_STRATEGY_STEPS = [
  "Burn down CPs first: tracker, resequence, then chase blockers.",
  "Keep interim risk controlled while CP completion advances.",
  "Only switch to execution mode when readiness is genuinely high.",
  "In execution, sequence payment, signatures, and transfer before fee trigger."
];

let strategyGuideVisible = false;
let resultsBoardVisible = false;

export function toggleStrategyGuide() {
  strategyGuideVisible = !strategyGuideVisible;
}

export function toggleResultsBoard() {
  resultsBoardVisible = !resultsBoardVisible;
}

function setText(id, text) {
  const node = document.getElementById(id);
  if (node) node.textContent = text;
}

function listItem(content) {
  const li = document.createElement("li");
  li.className = "list-item";
  li.appendChild(content);
  return li;
}

function metricRow(label, value) {
  const row = document.createElement("div");
  row.className = "row";

  const left = document.createElement("span");
  left.className = "meta";
  left.textContent = label;

  const right = document.createElement("span");
  right.textContent = String(value);

  row.append(left, right);
  return row;
}

function formatCurrency(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(amount);
}

function formatPercent(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "-";
  return `${amount.toFixed(1)}%`;
}

function formatRatioPercent(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "-";
  return `${(amount * 100).toFixed(1)}%`;
}

function formatSigned(value, suffix = "") {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "-";
  return `${amount > 0 ? "+" : ""}${amount}${suffix}`;
}

function createResultsCard(titleText, subtitleText) {
  const card = document.createElement("article");
  card.className = "results-card";

  const title = document.createElement("h4");
  title.className = "results-card-title";
  title.textContent = titleText;

  const subtitle = document.createElement("div");
  subtitle.className = "results-card-subtitle";
  subtitle.textContent = subtitleText;

  card.append(title, subtitle);
  return card;
}

function appendResultsMetric(card, label, value) {
  const metric = document.createElement("div");
  metric.className = "results-metric";

  const metricLabel = document.createElement("span");
  metricLabel.className = "meta";
  metricLabel.textContent = label;

  const metricValue = document.createElement("span");
  metricValue.className = "results-metric-value";
  metricValue.textContent = String(value);

  metric.append(metricLabel, metricValue);
  card.appendChild(metric);
}

function renderGateChecks(gate) {
  const node = document.getElementById("gateChecks");
  node.innerHTML = "";

  if (!gate.checks.length) {
    const li = document.createElement("li");
    li.className = "list-item";
    li.textContent = "No detailed gate checks available for this phase yet.";
    node.appendChild(li);
    return;
  }

  gate.checks.forEach((check) => {
    const content = document.createElement("div");
    const title = document.createElement("span");
    title.className = "list-item-title";
    const marker = check.ok ? "OK" : "X";
    title.textContent = `${marker} ${check.label}`;

    const thresholdLabel = check.type === "max" ? `<= ${check.target}` : `>= ${check.target}`;
    const meta = document.createElement("div");
    meta.className = "meta";
    meta.textContent = `Current ${check.current} | Required ${thresholdLabel}`;

    content.append(title, meta);
    node.appendChild(listItem(content));
  });
}

function stagePriority(stage) {
  const order = {
    im_access: 6,
    nda_signed: 5,
    nda_requested: 4,
    teaser_sent: 3,
    no_reply: 2,
    soft_pass: 1,
    uncontacted: 0
  };
  return order[stage] ?? -1;
}

function shortlistPriority(shortlistStatus) {
  const order = {
    shortlisted: 3,
    candidate: 2,
    none: 1,
    dropped: 0
  };
  return order[shortlistStatus] ?? -1;
}

function renderBuyerSnapshot(state) {
  const node = document.getElementById("buyerSnapshot");
  node.innerHTML = "";

  if (state.deal.phaseId < 2 && !state.buyers.length) {
    const li = document.createElement("li");
    li.className = "list-item";
    li.textContent = "Buyer funnel unlocks in Phase 2.";
    node.appendChild(li);
    return;
  }

  const metrics = [
    ["Coverage", `${state.variables.outreachCoverage}%`],
    ["Response", `${state.variables.buyerResponseRate}%`],
    ["Conversion", `${state.variables.buyerConversionRate}%`],
    ["Heat", state.variables.buyerHeat],
    ["Momentum", state.variables.processMomentum],
    ["Backlog", `${state.variables.responseBacklogPressure}%`]
  ];

  if (state.deal.phaseId >= 3) {
    metrics.push(["Shortlist Quality", state.variables.shortlistQuality]);
    metrics.push(["Tension", state.variables.competitiveTension]);
    metrics.push(["Client Align", state.variables.clientAlignment]);
    metrics.push(["Offer Ready", state.variables.offerReadiness]);
  }

  if (state.deal.phaseId >= 4) {
    metrics.push(["NBO Coverage", `${state.variables.nboCoverage}%`]);
    metrics.push(["Comparability", state.variables.offerComparability]);
    metrics.push(["Advancement", state.variables.advancementClarity]);
    metrics.push(["Price Confidence", state.variables.priceConfidence]);
  }

  if (state.deal.phaseId >= 5) {
    metrics.push(["DD Pressure", state.variables.ddPressure]);
    metrics.push(["Issue Contain", state.variables.issueContainment]);
    metrics.push(["Buyer Confidence", state.variables.buyerConfidence]);
    metrics.push(["Retrade Risk", state.variables.retradeRisk]);
    metrics.push(["Field Survival", state.variables.fieldSurvival]);
    metrics.push(["DD Readiness", state.variables.ddReadiness]);
  }

  if (state.deal.phaseId >= 6) {
    metrics.push(["Final Strength", state.variables.finalOfferStrength]);
    metrics.push(["Final Compare", state.variables.finalOfferComparability]);
    metrics.push(["Exec Certainty", state.variables.executableCertainty]);
    metrics.push(["False Winner", state.variables.falseWinnerRisk]);
    metrics.push(["Backup Strength", state.variables.backupBidderStrength]);
    metrics.push(["Exclusivity", state.variables.exclusivityReadiness]);
  }

  if (state.deal.phaseId >= 7) {
    metrics.push(["Signing Ready", state.variables.signingReadiness]);
    metrics.push(["Legal Drag", state.variables.residualLegalDrag]);
    metrics.push(["Value Protect", state.variables.valueProtectionQuality]);
    metrics.push(["Clause Pressure", state.variables.clausePressure]);
    metrics.push(["Concession Disc", state.variables.concessionDiscipline]);
    metrics.push(["Fallback Lev", state.variables.fallbackLeverage]);
    metrics.push(["Preferred Stable", state.variables.preferredBidderStability]);
    metrics.push(["False Closure", state.variables.falseClosureRisk]);
    metrics.push(["Paper Fragility", state.variables.paperFragility]);
    metrics.push(["Legal Control", state.variables.legalControl]);
    metrics.push(["Client Sensitivity", state.variables.clientValueSensitivity]);
    metrics.push(["Checklist", state.variables.signingChecklistProgress]);
  }

  if (state.deal.phaseId >= 9) {
    metrics.push(["Closing Stage", state.runtime.phase9Stage]);
    metrics.push(["Closed", state.runtime.phase9Closed ? "Yes" : "No"]);
    metrics.push(["CP Completion", state.variables.cpCompletion]);
    metrics.push(["CP Drag", state.variables.cpDrag]);
    metrics.push(["CP Complexity", state.variables.cpComplexity]);
    metrics.push(["Interim Risk", state.variables.interimRisk]);
    metrics.push(["Interim Stability", state.variables.interimStability]);
    metrics.push(["Closing Readiness", state.variables.closingReadiness]);
    metrics.push(["Completion Conf", state.variables.completionConfidence]);
    metrics.push(["Funds Ready", state.variables.fundsFlowReadiness]);
    metrics.push(["Funds Integrity", state.variables.fundsFlowIntegrity]);
    metrics.push(["Signature Integrity", state.variables.signatureIntegrity]);
    metrics.push(["Pay Timing", state.variables.paymentTimingIntegrity]);
    metrics.push(["Transfer Ready", state.variables.ownershipTransferReadiness]);
    metrics.push(["Delay Risk", state.variables.delayRisk]);
    metrics.push(["Value Integrity", state.variables.valueIntegrity]);
    metrics.push(["Close Quality", state.variables.closingExecutionQuality]);
    metrics.push(["Outcome", state.variables.outcomeIntegrity]);
    metrics.push(["Client Outcome", state.variables.clientOutcomeSatisfaction]);
    metrics.push(["Reputation", state.variables.reputationOutcome]);
    metrics.push(["Fee", state.variables.feeRealisation]);
    metrics.push(["Rainmaker XP", state.variables.rainmakerProgressImpact]);
  }

  if (state.deal.phaseId >= 8) {
    metrics.push(["Sign Conf", state.variables.signingConfidence]);
    metrics.push(["Signability", state.variables.signability]);
    metrics.push(["Item Material", state.variables.openItemMateriality]);
    metrics.push(["Item Closure", state.variables.openItemClosureRate]);
    metrics.push(["Doc Stability", state.variables.documentStability]);
    metrics.push(["Coordination", state.variables.coordinationQuality]);
    metrics.push(["Exec Discipline", state.variables.executionDiscipline]);
    metrics.push(["Counterparty", state.variables.counterpartyAlignment]);
    metrics.push(["Last-Mile", state.variables.lastMilePressure]);
    metrics.push(["Ceremony Risk", state.variables.ceremonyRisk]);
    metrics.push(["Execution Risk", state.variables.realExecutionRisk]);
    metrics.push(["Timing Integrity", state.variables.signingTimingIntegrity]);
    metrics.push(["Closing Prep", state.variables.closingPreparationQuality]);
    metrics.push(["Post Fragility", state.variables.residualPostSigningFragility]);
    metrics.push(["Signed", state.runtime.phase8Signed ? "Yes" : "No"]);
  }

  metrics.forEach(([label, value]) => {
    const wrap = document.createElement("div");
    wrap.appendChild(metricRow(label, value));
    node.appendChild(listItem(wrap));
  });

  const sorted = [...state.buyers].sort((a, b) => {
    const shortlistDelta = shortlistPriority(b.shortlistStatus) - shortlistPriority(a.shortlistStatus);
    if (shortlistDelta !== 0) return shortlistDelta;

    if (state.deal.phaseId >= 3) {
      const scoreDelta = (b.phase3Score ?? 0) - (a.phase3Score ?? 0);
      if (scoreDelta !== 0) return scoreDelta;
    }

    return stagePriority(b.stage) - stagePriority(a.stage);
  });

  sorted.slice(0, 8).forEach((buyer) => {
    const content = document.createElement("div");
    const title = document.createElement("span");
    title.className = "list-item-title";
    title.textContent = `${buyer.name} (${buyer.type})`;

    const stage = document.createElement("div");
    stage.className = "meta";
    const phase3Score = state.deal.phaseId >= 3 ? ` | Score ${buyer.phase3Score ?? 0}` : "";
    const phase4Offer =
      state.deal.phaseId >= 4 && buyer.phase4Offer?.submitted
        ? ` | Offer ${buyer.phase4Offer.qualityScore ?? 0}`
        : "";
    const phase5Lane =
      state.deal.phaseId >= 5 && buyer.phase5Lane?.active
        ? ` | DD ${buyer.phase5Lane.status} Q${buyer.phase5Lane.pendingQuestions}`
        : "";
    const phase6Bid =
      state.deal.phaseId >= 6 && buyer.phase6Bid?.submitted
        ? ` | Final H${buyer.phase6Bid.headlineValue} A${typeof buyer.phase6Bid.adjustedValue === "number" ? buyer.phase6Bid.adjustedValue : "?"} R${buyer.phase6Bid.executionRisk}${buyer.phase6Bid.role !== "none" ? ` ${buyer.phase6Bid.role}` : ""}`
        : "";
    const phase7Spa =
      state.deal.phaseId >= 7 && buyer.phase7Spa?.active
        ? ` | SPA ${buyer.phase7Spa.stabilityState} L${buyer.phase7Spa.clauseLoad} U${buyer.phase7Spa.unresolvedBlocks}`
        : "";
    const phase8Signing =
      state.deal.phaseId >= 8 && buyer.phase8Signing?.active
        ? ` | Signing ${buyer.phase8Signing.status} B${buyer.phase8Signing.blockerCount} V${buyer.phase8Signing.versionSync}`
        : "";
    const phase9Closing =
      state.deal.phaseId >= 9 && buyer.phase9Closing?.active
        ? ` | Closing ${buyer.phase9Closing.status} CP${buyer.phase9Closing.cpProgress} F${buyer.phase9Closing.fundsReadiness}`
        : "";
    stage.textContent = `${buyer.visibleState} | Conviction ${buyer.hiddenConviction}${phase3Score}${phase4Offer}${phase5Lane}${phase6Bid}${phase7Spa}${phase8Signing}${phase9Closing}${buyer.pendingAction ? " | Pending" : ""}`;

    content.append(title, stage);
    node.appendChild(listItem(content));
  });
}

function renderOfferSnapshot(state) {
  const node = document.getElementById("offerSnapshot");
  if (!node) return;

  node.innerHTML = "";

  if (state.deal.phaseId < 4) {
    const li = document.createElement("li");
    li.className = "list-item";
    li.textContent = "Offer matrix unlocks in Phase 4.";
    node.appendChild(li);
    return;
  }

  if (state.deal.phaseId >= 9) {
    const closingLanes = state.buyers
      .filter((buyer) => buyer.phase9Closing?.active)
      .sort((a, b) => {
        const cpDelta = (b.phase9Closing?.cpProgress ?? 0) - (a.phase9Closing?.cpProgress ?? 0);
        if (cpDelta !== 0) return cpDelta;
        return (b.phase9Closing?.fundsReadiness ?? 0) - (a.phase9Closing?.fundsReadiness ?? 0);
      });

    if (!closingLanes.length) {
      const li = document.createElement("li");
      li.className = "list-item";
      li.textContent = "No active closing execution lanes.";
      node.appendChild(li);
      return;
    }

    closingLanes.forEach((buyer) => {
      const closing = buyer.phase9Closing;
      const content = document.createElement("div");
      const title = document.createElement("span");
      title.className = "list-item-title";
      title.textContent = `${buyer.name} (${closing.role})`;

      const detail = document.createElement("div");
      detail.className = "meta";
      detail.textContent = `Status ${closing.status} | CP ${closing.cpProgress} | Exec ${closing.executionReadiness} | Funds ${closing.fundsReadiness}${buyer.pendingAction ? " | Action Needed" : ""}`;

      content.append(title, detail);
      node.appendChild(listItem(content));
    });
    return;
  }

  if (state.deal.phaseId >= 8) {
    const signingLanes = state.buyers
      .filter((buyer) => buyer.phase8Signing?.active)
      .sort((a, b) => {
        const blockerDelta = (a.phase8Signing?.blockerCount ?? 0) - (b.phase8Signing?.blockerCount ?? 0);
        if (blockerDelta !== 0) return blockerDelta;
        return (b.phase8Signing?.versionSync ?? 0) - (a.phase8Signing?.versionSync ?? 0);
      });

    if (!signingLanes.length) {
      const li = document.createElement("li");
      li.className = "list-item";
      li.textContent = "No active signing execution lanes.";
      node.appendChild(li);
      return;
    }

    signingLanes.forEach((buyer) => {
      const signing = buyer.phase8Signing;
      const content = document.createElement("div");
      const title = document.createElement("span");
      title.className = "list-item-title";
      title.textContent = `${buyer.name} (${signing.role})`;

      const detail = document.createElement("div");
      detail.className = "meta";
      detail.textContent = `Status ${signing.status} | Blockers ${signing.blockerCount} | Version ${signing.versionSync} | Ceremony ${signing.ceremonyReadiness}${buyer.pendingAction ? " | Action Needed" : ""}`;

      content.append(title, detail);
      node.appendChild(listItem(content));
    });
    return;
  }

  if (state.deal.phaseId >= 7) {
    const spaLanes = state.buyers
      .filter((buyer) => buyer.phase7Spa?.active)
      .sort((a, b) => {
        const unresolvedDelta = (a.phase7Spa?.unresolvedBlocks ?? 0) - (b.phase7Spa?.unresolvedBlocks ?? 0);
        if (unresolvedDelta !== 0) return unresolvedDelta;
        return (a.phase7Spa?.clauseLoad ?? 0) - (b.phase7Spa?.clauseLoad ?? 0);
      });

    if (!spaLanes.length) {
      const li = document.createElement("li");
      li.className = "list-item";
      li.textContent = "No active SPA negotiation lanes.";
      node.appendChild(li);
      return;
    }

    spaLanes.forEach((buyer) => {
      const spa = buyer.phase7Spa;
      const content = document.createElement("div");
      const title = document.createElement("span");
      title.className = "list-item-title";
      title.textContent = `${buyer.name} (${spa.role})`;

      const detail = document.createElement("div");
      detail.className = "meta";
      detail.textContent = `State ${spa.stabilityState} | ClauseLoad ${spa.clauseLoad} | Unresolved ${spa.unresolvedBlocks} | Markup ${spa.lastMarkupSeverity}${buyer.pendingAction ? " | Action Needed" : ""}`;

      content.append(title, detail);
      node.appendChild(listItem(content));
    });
    return;
  }

  if (state.deal.phaseId >= 6) {
    const finalBids = state.buyers
      .filter((buyer) => buyer.phase6Bid?.submitted)
      .sort((a, b) => {
        const adjustedA = typeof a.phase6Bid?.adjustedValue === "number" ? a.phase6Bid.adjustedValue : a.phase6Bid?.headlineValue ?? 0;
        const adjustedB = typeof b.phase6Bid?.adjustedValue === "number" ? b.phase6Bid.adjustedValue : b.phase6Bid?.headlineValue ?? 0;
        if (adjustedB !== adjustedA) return adjustedB - adjustedA;
        return (a.phase6Bid?.executionRisk ?? 100) - (b.phase6Bid?.executionRisk ?? 100);
      });

    if (!finalBids.length) {
      const li = document.createElement("li");
      li.className = "list-item";
      li.textContent = "No submitted final bids yet.";
      node.appendChild(li);
      return;
    }

    finalBids.forEach((buyer) => {
      const bid = buyer.phase6Bid;
      const role = bid.role === "preferred" ? "preferred" : bid.role === "backup" ? "backup" : bid.recommendation;
      const adjustedValue = typeof bid.adjustedValue === "number" ? bid.adjustedValue : "?";

      const content = document.createElement("div");
      const title = document.createElement("span");
      title.className = "list-item-title";
      title.textContent = `${buyer.name} (${role})`;

      const detail = document.createElement("div");
      detail.className = "meta";
      detail.textContent = `H ${bid.headlineValue} | A ${adjustedValue} | ExecRisk ${bid.executionRisk} | Drag ${bid.conditionalDrag}${bid.analyzed ? " | Analyzed" : " | Pending Analysis"}`;

      content.append(title, detail);
      node.appendChild(listItem(content));
    });
    return;
  }

  if (state.deal.phaseId >= 5) {
    const lanes = state.buyers
      .filter((buyer) => buyer.phase5Lane?.active)
      .sort((a, b) => (b.phase5Lane?.confidence ?? 0) - (a.phase5Lane?.confidence ?? 0));

    if (!lanes.length) {
      const li = document.createElement("li");
      li.className = "list-item";
      li.textContent = "No active DD lanes.";
      node.appendChild(li);
      return;
    }

    lanes.forEach((buyer) => {
      const lane = buyer.phase5Lane;
      const content = document.createElement("div");
      const title = document.createElement("span");
      title.className = "list-item-title";
      title.textContent = `${buyer.name} (${lane.status})`;

      const detail = document.createElement("div");
      detail.className = "meta";
      detail.textContent = `Confidence ${lane.confidence} | Q ${lane.pendingQuestions} | Issue ${lane.issueLoad} | Retrade ${lane.retradeRisk}`;

      content.append(title, detail);
      node.appendChild(listItem(content));
    });
    return;
  }

  const offers = state.buyers
    .filter((buyer) => buyer.shortlistStatus === "shortlisted" && buyer.phase4Offer?.submitted)
    .sort((a, b) => (b.phase4Offer?.qualityScore ?? 0) - (a.phase4Offer?.qualityScore ?? 0));

  if (!offers.length) {
    const li = document.createElement("li");
    li.className = "list-item";
    li.textContent = "No submitted NBOs yet.";
    node.appendChild(li);
    return;
  }

  offers.forEach((buyer) => {
    const offer = buyer.phase4Offer;
    const content = document.createElement("div");
    const title = document.createElement("span");
    title.className = "list-item-title";
    title.textContent = `${buyer.name} (${offer.recommendation})`;

    const normalizedValue = typeof offer.normalizedValue === "number" ? offer.normalizedValue : "?";
    const detail = document.createElement("div");
    detail.className = "meta";
    detail.textContent = `H ${offer.headlineValue} | N ${normalizedValue} | Cert ${offer.certainty} | Cond ${offer.conditionality} | Q ${offer.qualityScore}${offer.advanced ? " | DD Invite" : ""}`;

    content.append(title, detail);
    node.appendChild(listItem(content));
  });
}


function renderStrategyGuide(state) {
  const button = document.getElementById("strategyGuideBtn");
  const panel = document.getElementById("strategyGuidePanel");
  if (!button || !panel) return;

  button.hidden = false;
  button.textContent = strategyGuideVisible ? "Hide Recommended Strategy" : "Show Recommended Strategy";
  panel.hidden = !strategyGuideVisible;

  if (!strategyGuideVisible) {
    panel.textContent = "";
    return;
  }

  panel.innerHTML = "";

  const title = document.createElement("div");
  title.className = "list-item-title";

  const meta = document.createElement("div");
  meta.className = "meta";

  if (state.deal.phaseId < 8) {
    const phase = getPhaseById(state.deal.phaseId);
    title.textContent = phase.name + " Strategy Hint";
    meta.textContent = "Detailed signing playbook unlocks in Phase 8. For now, protect budget runway, control risk debt, and avoid over-queueing tasks.";
    panel.append(title, meta);
    return;
  }

  const list = document.createElement("ol");
  const steps = state.deal.phaseId >= 9 ? PHASE9_STRATEGY_STEPS : PHASE8_STRATEGY_STEPS;

  title.textContent = state.deal.phaseId >= 9 ? "Phase 9 Recommended Sequence" : "Phase 8 Recommended Sequence";
  meta.textContent = "Use as a weekly checklist. Run fewer tasks if budget/capacity is tight.";

  steps.forEach((step) => {
    const item = document.createElement("li");
    item.textContent = step;
    list.appendChild(item);
  });

  panel.append(title, meta, list);
}

function renderResultsBoard(state) {
  const button = document.getElementById("resultsBoardBtn");
  const panel = document.getElementById("resultsBoardPanel");
  if (!button || !panel) return;

  button.hidden = false;
  button.textContent = resultsBoardVisible ? "Hide Results Board" : "Show Results Board";
  panel.hidden = !resultsBoardVisible;

  if (!resultsBoardVisible) {
    panel.innerHTML = "";
    return;
  }

  panel.innerHTML = "";

  if (state.deal.phaseId < 10 || !state.resultsBoard) {
    const empty = document.createElement("div");
    empty.className = "results-empty";
    empty.textContent = "Results Board unlocks in Phase 10 after a terminal Phase 9 outcome.";
    panel.appendChild(empty);
    return;
  }

  const board = state.resultsBoard;

  const hero = document.createElement("section");
  hero.className = "results-hero";

  const heroMetrics = [
    ["Deal Outcome", board.dealOutcomeLabel ?? "-"],
    ["Success Fee", formatCurrency(board.financial?.successFee)],
    ["Total Project Cost", formatCurrency(board.financial?.projectCost)],
    ["Net Project Profit", formatCurrency(board.financial?.netProjectProfit)],
    ["Overall Deal Grade", `${board.scores?.overallGrade ?? "-"} (${board.scores?.overallDealScore ?? "-"})`]
  ];

  heroMetrics.forEach(([label, value]) => {
    const tile = document.createElement("article");
    tile.className = "results-hero-item";

    const metricLabel = document.createElement("div");
    metricLabel.className = "meta";
    metricLabel.textContent = label;

    const metricValue = document.createElement("div");
    metricValue.className = "results-hero-value";
    metricValue.textContent = String(value);

    tile.append(metricLabel, metricValue);
    hero.appendChild(tile);
  });

  const grid = document.createElement("section");
  grid.className = "results-grid";

  const financialCard = createResultsCard("Financial Outcome", board.labels?.financial ?? "Economics");
  appendResultsMetric(financialCard, "Transaction Value Achieved", formatCurrency(board.financial?.closingValue));
  appendResultsMetric(financialCard, "Success Fee", formatCurrency(board.financial?.successFee));
  appendResultsMetric(financialCard, "Total Project Cost", formatCurrency(board.financial?.projectCost));
  appendResultsMetric(financialCard, "Net Project Profit", formatCurrency(board.financial?.netProjectProfit));
  appendResultsMetric(financialCard, "Project Margin", formatRatioPercent(board.financial?.projectMargin));
  appendResultsMetric(financialCard, "Budget Variance", formatCurrency(board.financial?.budgetVariance));

  const clientCard = createResultsCard("Client Outcome", board.labels?.client ?? "Client State");
  appendResultsMetric(clientCard, "Client Satisfaction", formatPercent(board.client?.satisfaction));
  appendResultsMetric(clientCard, "Client Trust", formatPercent(board.client?.trust));
  appendResultsMetric(clientCard, "Outcome vs Expectations", formatPercent(board.client?.expectationFit));
  appendResultsMetric(clientCard, "Rehire Probability", formatPercent(board.client?.rehireProbability));
  appendResultsMetric(clientCard, "Referral Probability", formatPercent(board.client?.referralProbability));

  const teamCard = createResultsCard("Team Outcome", board.labels?.team ?? "Team State");
  appendResultsMetric(teamCard, "Team Morale", formatPercent(board.team?.morale));
  appendResultsMetric(teamCard, "Burnout Level", formatPercent(board.team?.burnout));
  appendResultsMetric(teamCard, "Team Cohesion", formatPercent(board.team?.cohesion));
  appendResultsMetric(teamCard, "Execution Pride", formatPercent(board.team?.pride));
  appendResultsMetric(teamCard, "Retention Risk", formatPercent(board.team?.retentionRisk));

  const processCard = createResultsCard("Process Quality", "Execution discipline across the full run");
  appendResultsMetric(processCard, "Process Quality", formatPercent(board.process?.processQuality));
  appendResultsMetric(processCard, "Buyer Management", formatPercent(board.process?.buyerManagement));
  appendResultsMetric(processCard, "Confidentiality Discipline", formatPercent(board.process?.confidentiality));
  appendResultsMetric(processCard, "Risk Control", formatPercent(board.process?.riskControl));
  appendResultsMetric(processCard, "Negotiation Quality", formatPercent(board.process?.negotiationQuality));
  appendResultsMetric(processCard, "Closing Quality", formatPercent(board.process?.closingQuality));

  const careerCard = createResultsCard("Career Impact", "Rainmaker progression effect");
  appendResultsMetric(careerCard, "Reputation Gain", formatSigned(board.career?.reputationGain, " pts"));
  appendResultsMetric(careerCard, "Rainmaker Score", formatPercent(board.career?.rainmakerScore));
  appendResultsMetric(careerCard, "Future Deal Flow Impact", formatSigned(board.career?.futureDealFlowImpact, "%"));
  appendResultsMetric(careerCard, "Sector Credibility Gain", formatSigned(board.career?.sectorCredibilityGain, " pts"));

  const driversCard = createResultsCard("Key Drivers", "Why this run ended this way");
  const driversList = document.createElement("ul");
  driversList.className = "results-drivers";
  (Array.isArray(board.keyDrivers) ? board.keyDrivers : []).slice(0, 5).forEach((driver) => {
    const item = document.createElement("li");
    item.textContent = driver;
    driversList.appendChild(item);
  });

  if (!driversList.children.length) {
    const item = document.createElement("li");
    item.textContent = "No key drivers recorded for this run.";
    driversList.appendChild(item);
  }

  driversCard.appendChild(driversList);

  grid.append(financialCard, clientCard, teamCard, processCard, careerCard, driversCard);

  const actionHint = document.createElement("div");
  actionHint.className = "results-actions";
  actionHint.textContent = "Phase 10 actions are available in the task list (View Log, Export Summary, Start Next Mandate).";

  panel.append(hero, grid, actionHint);
}

export function renderApp(state) {
  renderTopBar(state);
  renderTasks(state);
  renderStrategyGuide(state);
  renderResultsBoard(state);
  renderInbox(state);
  renderHeadlines(state);
  renderWorkstreams(state);
  renderRuntime(state);
  renderBuyerSnapshot(state);
  renderOfferSnapshot(state);
  renderHistory(state);
}

function renderTopBar(state) {
  const phase = getPhaseById(state.deal.phaseId);
  setText("phaseLabel", phase.name);
  setText("weekLabel", `Week ${state.clock.week}`);
  setText("budgetLabel", `Budget: ${state.resources.budget}`);
  setText("capacityLabel", `Capacity: ${state.resources.usedCapacity}/${state.resources.maxCapacity}`);
  setText("pressureLabel", `Pressure: ${state.resources.pressure.toFixed(2)}`);
  setText("moraleLabel", `Morale: ${state.team.morale}`);
  setText("phaseObjective", phase.objective);
}

function renderTasks(state) {
  const availableTasks = getActionsForPhase(state.deal.phaseId);
  const availableNode = document.getElementById("availableTasks");
  const queuedNode = document.getElementById("queuedTasks");

  availableNode.innerHTML = "";
  queuedNode.innerHTML = "";

  availableTasks.forEach((task) => {
    const wrapper = document.createElement("div");
    const title = document.createElement("span");
    title.className = "list-item-title";
    const completions = state.runtime.taskCompletions[task.id] ?? 0;
    title.textContent = `${task.name}${completions ? ` (${completions}x)` : ""}`;
    wrapper.appendChild(title);
    wrapper.appendChild(metricRow("Cost", task.cost));
    wrapper.appendChild(metricRow("Work", task.work));
    wrapper.appendChild(metricRow("Complexity", task.complexity));

    const availability = getActionAvailability(state, task);
    const alreadyQueued = state.planning.selectedTaskIds.includes(task.id);

    const queueBtn = document.createElement("button");
    queueBtn.className = "btn";
    queueBtn.dataset.actionId = task.id;
    queueBtn.dataset.intent = "queue";
    queueBtn.textContent = alreadyQueued ? "Queued" : "Queue";
    queueBtn.disabled = alreadyQueued || !availability.queueable;

    const row = document.createElement("div");
    row.className = "row";
    row.appendChild(queueBtn);
    wrapper.appendChild(row);

    if (!availability.queueable) {
      const lockText = document.createElement("div");
      lockText.className = "meta";
      lockText.textContent = `Locked: ${availability.reasons.join(" | ")}`;
      wrapper.appendChild(lockText);
    }

    availableNode.appendChild(listItem(wrapper));
  });

  state.planning.selectedTaskIds.forEach((taskId) => {
    const task = getActionById(taskId);
    if (!task) return;

    const wrapper = document.createElement("div");
    const title = document.createElement("span");
    title.className = "list-item-title";
    title.textContent = task.name;
    wrapper.appendChild(title);
    wrapper.appendChild(metricRow("Cost", task.cost));
    wrapper.appendChild(metricRow("Work", task.work));

    const removeBtn = document.createElement("button");
    removeBtn.className = "btn btn-danger";
    removeBtn.dataset.actionId = task.id;
    removeBtn.dataset.intent = "remove";
    removeBtn.textContent = "Remove";

    wrapper.appendChild(removeBtn);
    queuedNode.appendChild(listItem(wrapper));
  });
}

function renderInbox(state) {
  const node = document.getElementById("inboxList");
  node.innerHTML = "";

  const messages = state.inbox.slice(0, 10);
  if (!messages.length) {
    const empty = document.createElement("li");
    empty.className = "list-item";
    empty.textContent = "No messages.";
    node.appendChild(empty);
    return;
  }

  messages.forEach((message) => {
    const content = document.createElement("div");
    const title = document.createElement("span");
    title.className = "list-item-title";
    title.textContent = `[${message.category}] ${message.title}`;

    const meta = document.createElement("div");
    meta.className = "meta";
    meta.textContent = `Week ${message.week}: ${message.text}`;

    content.append(title, meta);
    node.appendChild(listItem(content));
  });
}

function renderHeadlines(state) {
  const node = document.getElementById("headlineList");
  node.innerHTML = "";

  state.headlines.slice(0, 5).forEach((headline) => {
    const content = document.createElement("div");
    content.textContent = `Week ${headline.week}: ${headline.text}`;
    node.appendChild(listItem(content));
  });
}

function renderWorkstreams(state) {
  const node = document.getElementById("workstreamGrid");
  node.innerHTML = "";

  Object.entries(state.workstreams).forEach(([id, values]) => {
    const container = document.createElement("div");
    container.className = "list-item";

    const title = document.createElement("div");
    title.className = "row";
    title.innerHTML = `<span class="list-item-title">${id}</span><span class="meta">P ${values.progress} / Q ${values.quality}</span>`;

    const progress = document.createElement("div");
    progress.className = "progress";
    const bar = document.createElement("span");
    bar.style.width = `${values.progress}%`;
    progress.appendChild(bar);

    container.append(title, progress);
    node.appendChild(container);
  });
}

function renderRuntime(state) {
  const gate = getPhaseGateStatus(state);
  setText("gateStatus", gate.text);
  renderGateChecks(gate);

  const eventStatus = state.runtime.lastEventIds.length
    ? `Events: ${state.runtime.lastEventIds.join(", ")} | Pending follow-ups: ${state.runtime.pendingEventIds.length}`
    : `Events: none this week | Pending follow-ups: ${state.runtime.pendingEventIds.length}`;
  setText("eventStatus", eventStatus);

  const summaryNode = document.getElementById("weeklySummary");
  summaryNode.textContent = state.runtime.weeklySummary ? JSON.stringify(state.runtime.weeklySummary, null, 2) : "-";

  const debugNode = document.getElementById("debugState");
  const debug = {
    phaseId: state.deal.phaseId,
    selectedTaskIds: state.planning.selectedTaskIds,
    riskDebt: state.riskDebt,
    phase8Signed: state.runtime.phase8Signed,
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
    variables: state.variables,
    buyers: state.buyers.map((buyer) => ({
      id: buyer.id,
      stage: buyer.stage,
      shortlistStatus: buyer.shortlistStatus,
      phase3Score: buyer.phase3Score,
      phase4Offer: {
        submitted: buyer.phase4Offer?.submitted,
        analyzed: buyer.phase4Offer?.analyzed,
        advanced: buyer.phase4Offer?.advanced,
        recommendation: buyer.phase4Offer?.recommendation,
        qualityScore: buyer.phase4Offer?.qualityScore
      },
      phase5Lane: {
        active: buyer.phase5Lane?.active,
        status: buyer.phase5Lane?.status,
        confidence: buyer.phase5Lane?.confidence,
        pendingQuestions: buyer.phase5Lane?.pendingQuestions,
        issueLoad: buyer.phase5Lane?.issueLoad,
        retradeRisk: buyer.phase5Lane?.retradeRisk
      },
      phase6Bid: {
        submitted: buyer.phase6Bid?.submitted,
        analyzed: buyer.phase6Bid?.analyzed,
        headlineValue: buyer.phase6Bid?.headlineValue,
        adjustedValue: buyer.phase6Bid?.adjustedValue,
        executionRisk: buyer.phase6Bid?.executionRisk,
        conditionalDrag: buyer.phase6Bid?.conditionalDrag,
        recommendation: buyer.phase6Bid?.recommendation,
        role: buyer.phase6Bid?.role
      },
      phase7Spa: {
        active: buyer.phase7Spa?.active,
        role: buyer.phase7Spa?.role,
        stabilityState: buyer.phase7Spa?.stabilityState,
        clauseLoad: buyer.phase7Spa?.clauseLoad,
        unresolvedBlocks: buyer.phase7Spa?.unresolvedBlocks,
        lastMarkupSeverity: buyer.phase7Spa?.lastMarkupSeverity
      },
      phase8Signing: {
        active: buyer.phase8Signing?.active,
        role: buyer.phase8Signing?.role,
        status: buyer.phase8Signing?.status,
        blockerCount: buyer.phase8Signing?.blockerCount,
        versionSync: buyer.phase8Signing?.versionSync,
        ceremonyReadiness: buyer.phase8Signing?.ceremonyReadiness
      },
      phase9Closing: {
        active: buyer.phase9Closing?.active,
        role: buyer.phase9Closing?.role,
        status: buyer.phase9Closing?.status,
        cpProgress: buyer.phase9Closing?.cpProgress,
        executionReadiness: buyer.phase9Closing?.executionReadiness,
        fundsReadiness: buyer.phase9Closing?.fundsReadiness
      },
      pendingAction: buyer.pendingAction
    })),
    taskCompletions: state.runtime.taskCompletions
  };
  debugNode.textContent = JSON.stringify(debug, null, 2);
}

function renderHistory(state) {
  const node = document.getElementById("historyList");
  node.innerHTML = "";

  if (!state.history.length) {
    const li = document.createElement("li");
    li.className = "list-item";
    li.textContent = "No history yet.";
    node.appendChild(li);
    return;
  }

  state.history.slice(0, 10).forEach((entry) => {
    const li = document.createElement("li");
    li.className = "list-item";
    li.textContent = entry;
    node.appendChild(li);
  });
}
























