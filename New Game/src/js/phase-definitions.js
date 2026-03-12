export const PHASES = [
  { id: 0, name: "Deal Origination", objective: "Qualify the lead and secure pitch readiness." },
  { id: 1, name: "Preparation", objective: "Build market-ready materials and process readiness." },
  { id: 2, name: "Market Outreach", objective: "Create serious buyer engagement and NDA traction." },
  { id: 3, name: "Shortlist", objective: "Shape a credible shortlist with live competition." },
  { id: 4, name: "NBOs", objective: "Collect and interpret first-round offers." },
  { id: 5, name: "Due Diligence", objective: "Contain issues and maintain confidence under scrutiny." },
  { id: 6, name: "Final Offers", objective: "Maximize value while preserving certainty." },
  { id: 7, name: "SPA Negotiation", objective: "Control legal erosion and concession discipline." },
  { id: 8, name: "Signing", objective: "Stabilize execution and close open items." },
  { id: 9, name: "Closing", objective: "Execute final transfer with minimal residual risk." },
  { id: 10, name: "Results Board", objective: "Interpret full deal outcome across economics, client, team, process, and career impact." }
];

export function getPhaseById(phaseId) {
  return PHASES.find((phase) => phase.id === phaseId) ?? PHASES[0];
}

function minCheck(label, current, target) {
  return { label, current, target, type: "min", ok: current >= target };
}

function maxCheck(label, current, target) {
  return { label, current, target, type: "max", ok: current <= target };
}

function summarizeChecks(checks, readyText, blockedText) {
  const ready = checks.every((check) => check.ok);
  return {
    ready,
    checks,
    text: ready ? readyText : blockedText
  };
}

function countBuyerStages(state, stages) {
  const targets = Array.isArray(stages) ? stages : [stages];
  return state.buyers.filter((buyer) => targets.includes(buyer.stage)).length;
}

function countShortlist(state, statuses) {
  const targets = Array.isArray(statuses) ? statuses : [statuses];
  return state.buyers.filter((buyer) => targets.includes(buyer.shortlistStatus)).length;
}

function countOffers(state, kind) {
  return state.buyers.filter((buyer) => {
    const offer = buyer.phase4Offer ?? {};
    if (kind === "submitted") return Boolean(offer.submitted);
    if (kind === "analyzed") return Boolean(offer.analyzed);
    if (kind === "advanced") return Boolean(offer.advanced);
    return false;
  }).length;
}

function countDdLanes(state, kind) {
  return state.buyers.filter((buyer) => {
    const lane = buyer.phase5Lane ?? {};
    if (kind === "active") return Boolean(lane.active) && lane.status !== "dropped";
    if (kind === "stable") return Boolean(lane.active) && lane.status === "stable";
    if (kind === "risk") return Boolean(lane.active) && ["risk", "conditional", "stressed"].includes(lane.status);
    return false;
  }).length;
}

function countFinalBids(state, kind) {
  return state.buyers.filter((buyer) => {
    const bid = buyer.phase6Bid ?? {};
    if (kind === "submitted") return Boolean(bid.submitted);
    if (kind === "analyzed") return Boolean(bid.analyzed);
    if (kind === "preferred") return bid.role === "preferred";
    if (kind === "backup") return bid.role === "backup";
    return false;
  }).length;
}

export function getPhaseGateStatus(state) {
  const ws = state.workstreams;

  if (state.deal.phaseId === 0) {
    const checks = [
      minCheck("Pitch Readiness Progress", ws.pitchReadiness.progress, 60),
      minCheck("Relationship Progress", ws.relationshipDevelopment.progress, 40),
      minCheck("Qualification Quality", ws.qualification.quality, 35),
      minCheck("Lead Heat", state.variables.leadHeat, 35)
    ];

    return {
      nextPhaseId: 1,
      ...summarizeChecks(
        checks,
        "Gate ready: transition to Phase 1 available.",
        "Phase 0 gate not met: improve readiness, relationship quality, and lead momentum."
      )
    };
  }

  if (state.deal.phaseId === 1) {
    const checks = [
      minCheck("IM Progress", state.deliverables.im.progress, 60),
      minCheck("Buyer List Progress", state.deliverables.buyerList.progress, 50),
      minCheck("Model Progress", state.deliverables.model.progress, 45),
      minCheck("Data Quality", state.variables.dataQuality, 60),
      minCheck("Execution Readiness", state.variables.executionReadiness, 65),
      maxCheck("Risk Debt", state.riskDebt, 25)
    ];

    return {
      nextPhaseId: 2,
      ...summarizeChecks(
        checks,
        "Gate ready: transition to Phase 2 available.",
        "Phase 1 gate not met: strengthen materials, quality, and process integrity."
      )
    };
  }

  if (state.deal.phaseId === 2) {
    const ndaSignedOrBetter = countBuyerStages(state, ["nda_signed", "im_access"]);
    const engagedBuyers = countBuyerStages(state, ["nda_requested", "nda_signed", "im_access", "soft_pass"]);

    const checks = [
      minCheck("Outreach Coverage", state.variables.outreachCoverage, 80),
      minCheck("Buyer Response Rate", state.variables.buyerResponseRate, 35),
      minCheck("Buyer Conversion Rate", state.variables.buyerConversionRate, 20),
      minCheck("Engaged Buyers", engagedBuyers, 3),
      minCheck("NDA Signed / IM Access", ndaSignedOrBetter, 2),
      minCheck("Process Momentum", state.variables.processMomentum, 55),
      maxCheck("Response Backlog Pressure", state.variables.responseBacklogPressure, 40),
      maxCheck("Confidentiality Risk", state.variables.confidentialityRisk, 65)
    ];

    return {
      nextPhaseId: 3,
      ...summarizeChecks(
        checks,
        "Gate ready: transition to Phase 3 available.",
        "Phase 2 gate not met: increase buyer traction while controlling backlog and leakage risk."
      )
    };
  }

  if (state.deal.phaseId === 3) {
    const shortlisted = countShortlist(state, "shortlisted");
    const liveCandidates = countShortlist(state, ["shortlisted", "candidate"]);

    const checks = [
      minCheck("Live Candidate Pool", liveCandidates, 3),
      minCheck("Shortlisted Buyers", shortlisted, 2),
      maxCheck("Shortlisted Buyers", shortlisted, 4),
      minCheck("Shortlist Quality", state.variables.shortlistQuality, 60),
      minCheck("Competitive Tension", state.variables.competitiveTension, 50),
      minCheck("Client Alignment", state.variables.clientAlignment, 55),
      minCheck("Offer Readiness", state.variables.offerReadiness, 55),
      maxCheck("Risk Debt", state.riskDebt, 40)
    ];

    return {
      nextPhaseId: 4,
      ...summarizeChecks(
        checks,
        "Gate ready: transition to Phase 4 available.",
        "Phase 3 gate not met: refine shortlist quality, tension, and client alignment before NBO round."
      )
    };
  }

  if (state.deal.phaseId === 4) {
    const submitted = countOffers(state, "submitted");
    const analyzed = countOffers(state, "analyzed");
    const advanced = countOffers(state, "advanced");

    const checks = [
      minCheck("NBOs Submitted", submitted, 2),
      minCheck("NBOs Analyzed", analyzed, 2),
      minCheck("DD Invite Buyers", advanced, 2),
      maxCheck("DD Invite Buyers", advanced, 4),
      minCheck("NBO Coverage", state.variables.nboCoverage, 70),
      minCheck("Offer Comparability", state.variables.offerComparability, 65),
      minCheck("Advancement Clarity", state.variables.advancementClarity, 60),
      minCheck("Price Confidence", state.variables.priceConfidence, 60),
      maxCheck("Response Backlog Pressure", state.variables.responseBacklogPressure, 45),
      maxCheck("Risk Debt", state.riskDebt, 55)
    ];

    return {
      nextPhaseId: 5,
      ...summarizeChecks(
        checks,
        "Gate ready: transition to Phase 5 available.",
        "Phase 4 gate not met: increase NBO comparability and lock a credible DD invite set."
      )
    };
  }

  if (state.deal.phaseId === 5) {
    const activeLanes = countDdLanes(state, "active");
    const stableLanes = countDdLanes(state, "stable");

    const checks = [
      minCheck("Active DD Buyers", activeLanes, 2),
      maxCheck("Active DD Buyers", activeLanes, 4),
      minCheck("Stable DD Buyers", stableLanes, 1),
      minCheck("Issue Containment", state.variables.issueContainment, 62),
      minCheck("Buyer Confidence", state.variables.buyerConfidence, 58),
      minCheck("DD Readiness", state.variables.ddReadiness, 65),
      maxCheck("DD Pressure", state.variables.ddPressure, 48),
      maxCheck("Retrade Risk", state.variables.retradeRisk, 65),
      maxCheck("Risk Debt", state.riskDebt, 70)
    ];

    return {
      nextPhaseId: 6,
      ...summarizeChecks(
        checks,
        "Gate ready: transition to Phase 6 available.",
        "Phase 5 gate not met: stabilize DD lanes, contain issues, and protect bidder confidence."
      )
    };
  }

  if (state.deal.phaseId === 6) {
    const submitted = countFinalBids(state, "submitted");
    const analyzed = countFinalBids(state, "analyzed");
    const preferred = countFinalBids(state, "preferred");
    const backup = countFinalBids(state, "backup");

    const checks = [
      minCheck("Final Bids Submitted", submitted, 2),
      minCheck("Final Bids Analyzed", analyzed, 2),
      minCheck("Preferred Bidder Selected", preferred, 1),
      minCheck("Backup Bidder Assigned", backup, 1),
      minCheck("Final Offer Comparability", state.variables.finalOfferComparability, 65),
      minCheck("Executable Certainty", state.variables.executableCertainty, 60),
      minCheck("Backup Bidder Strength", state.variables.backupBidderStrength, 40),
      minCheck("Exclusivity Readiness", state.variables.exclusivityReadiness, 65),
      maxCheck("False Winner Risk", state.variables.falseWinnerRisk, 55),
      maxCheck("Risk Debt", state.riskDebt, 80)
    ];

    return {
      nextPhaseId: 7,
      ...summarizeChecks(
        checks,
        "Gate ready: transition to Phase 7 available.",
        "Phase 6 gate not met: validate final bids, confirm preferred/backup logic, and secure exclusivity readiness."
      )
    };
  }

  if (state.deal.phaseId === 7) {
    const preferred = countFinalBids(state, "preferred");

    const checks = [
      minCheck("Preferred Bidder Active", preferred, 1),
      minCheck("Signing Readiness", state.variables.signingReadiness, 78),
      maxCheck("Residual Legal Drag", state.variables.residualLegalDrag, 10),
      minCheck("Signing Checklist", state.variables.signingChecklistProgress, 100),
      minCheck("Preferred Bidder Stability", state.variables.preferredBidderStability, 50),
      minCheck("Concession Discipline", state.variables.concessionDiscipline, 15),
      maxCheck("False Closure Risk", state.variables.falseClosureRisk, 30),
      maxCheck("Paper Fragility", state.variables.paperFragility, 55),
      maxCheck("Risk Debt", state.riskDebt, 95)
    ];

    return {
      nextPhaseId: 8,
      ...summarizeChecks(
        checks,
        "Gate ready: transition to Phase 8 available.",
        "Phase 7 gate not met: reduce residual drag, stabilize the preferred lane, and complete signing safeguards."
      )
    };
  }

  if (state.deal.phaseId === 8) {
    const checks = [
      minCheck("Signed Status", state.runtime.phase8Signed ? 1 : 0, 1),
      minCheck("Signing Confidence", state.variables.signingConfidence, 90),
      minCheck("Signability", state.variables.signability, 85),
      minCheck("Open Item Closure", state.variables.openItemClosureRate, 95),
      minCheck("Document Stability", state.variables.documentStability, 95),
      minCheck("Coordination Quality", state.variables.coordinationQuality, 70),
      minCheck("Counterparty Alignment", state.variables.counterpartyAlignment, 55),
      minCheck("Execution Discipline", state.variables.executionDiscipline, 50),
      minCheck("Closing Preparation", state.variables.closingPreparationQuality, 60),
      maxCheck("Ceremony Risk", state.variables.ceremonyRisk, 35),
      maxCheck("Real Execution Risk", state.variables.realExecutionRisk, 30),
      maxCheck("Residual Post-Signing Fragility", state.variables.residualPostSigningFragility, 45),
      maxCheck("Risk Debt", state.riskDebt, 120)
    ];

    return {
      nextPhaseId: 9,
      ...summarizeChecks(
        checks,
        "Gate ready: transition to Phase 9 available.",
        "Phase 8 gate not met: secure signed execution, lock documents, and complete the closing handover package."
      )
    };
  }

  if (state.deal.phaseId === 9) {
    if (state.deal.status === "failed") {
      const checks = [minCheck("Terminal Status", 1, 1)];
      return {
        nextPhaseId: 10,
        ...summarizeChecks(
          checks,
          "Gate ready: transition to Phase 10 results board available.",
          "Phase 9 gate not met: resolve transaction into a terminal state."
        )
      };
    }

    const checks = [
      minCheck("CP Completion", state.variables.cpCompletion, 100),
      minCheck("Closing Readiness", state.variables.closingReadiness, 90),
      minCheck("Funds Flow Integrity", state.variables.fundsFlowIntegrity, 95),
      minCheck("Signature Integrity", state.variables.signatureIntegrity, 95),
      minCheck("Ownership Transfer", state.variables.ownershipTransferReadiness, 95),
      minCheck("Payment Timing Integrity", state.variables.paymentTimingIntegrity, 85),
      maxCheck("Delay Risk", state.variables.delayRisk, 55),
      maxCheck("Risk Debt", state.riskDebt, 140),
      minCheck("Closed Status", state.runtime.phase9Closed ? 1 : 0, 1)
    ];

    return {
      nextPhaseId: 10,
      ...summarizeChecks(
        checks,
        "Gate ready: transition to Phase 10 results board available.",
        "Phase 9 gate not met: complete CPs and execute clean funds + transfer mechanics to close."
      )
    };
  }

  if (state.deal.phaseId === 10) {
    return {
      ready: false,
      checks: [minCheck("Results Board Available", state.resultsBoard ? 1 : 0, 1)],
      nextPhaseId: null,
      text: "Run complete: review the results board and key drivers."
    };
  }

  return {
    ready: false,
    checks: [],
    nextPhaseId: null,
    text: "Further phase gates will be implemented in later sprints."
  };
}





