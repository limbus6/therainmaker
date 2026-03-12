export const PHASE_EVENTS = [
  {
    id: "ev_warm_intro",
    phaseIds: [0],
    kind: "scheduled",
    title: "Warm Introduction Arrives",
    text: "A trusted intermediary offered a direct path to the founder.",
    baseProbability: 0.2,
    condition: () => true,
    effects: { variables: { accessLevel: 6, leadHeat: 3 } }
  },
  {
    id: "ev_competing_advisor",
    phaseIds: [0],
    kind: "conditional",
    title: "Competing Advisor Appears",
    text: "A rival advisor is now active around this lead.",
    baseProbability: 0.18,
    condition: (state) => state.variables.leadHeat >= 50,
    effects: { variables: { competitivePressure: 10, leadHeat: -4 } }
  },
  {
    id: "ev_timing_window_weakens",
    phaseIds: [0],
    kind: "conditional",
    title: "Timing Window Weakens",
    text: "Founder focus drifts and process urgency softens.",
    baseProbability: 0.15,
    condition: (state) => state.resources.pressure > 1,
    effects: { variables: { leadHeat: -6 }, team: { morale: -1 } }
  },
  {
    id: "ev_client_docs_delay",
    phaseIds: [1],
    kind: "scheduled",
    title: "Client Documentation Delay",
    text: "Critical files did not arrive on schedule.",
    baseProbability: 0.2,
    condition: () => true,
    effects: { deliverables: { im: -8, model: -4 }, variables: { dataVisibility: -5, dataQuality: -4 } },
    chainTo: ["ev_internal_rework_wave"]
  },
  {
    id: "ev_partner_pushback",
    phaseIds: [1],
    kind: "conditional",
    title: "Partner Pushback",
    text: "Internal review challenged core assumptions in materials.",
    baseProbability: 0.15,
    condition: (state) => state.resources.pressure > 1.1 || state.variables.dataQuality < 45,
    effects: {
      team: { morale: -2 },
      workstreams: { pitchReadiness: { quality: -5 } },
      variables: { executionReadiness: -5 }
    },
    chainTo: ["ev_client_confidence_dip"]
  },
  {
    id: "ev_model_integrity_flag",
    phaseIds: [1],
    kind: "conditional",
    title: "Model Integrity Flag",
    text: "A formula break in the model triggered rework and partner concern.",
    baseProbability: 0.14,
    condition: (state) => state.deliverables.model.progress < 35 && state.clock.week >= 5,
    effects: {
      deliverables: { model: -10 },
      variables: { dataQuality: -8, executionReadiness: -5 },
      riskDebt: 2
    },
    chainTo: ["ev_internal_rework_wave"]
  },
  {
    id: "ev_dataroom_scrutiny",
    phaseIds: [1],
    kind: "conditional",
    title: "Data Room Scrutiny",
    text: "Early counterpart review flagged missing files and inconsistent folders.",
    baseProbability: 0.12,
    condition: (state) => state.deliverables.vdr.progress < 45 && state.clock.week >= 6,
    effects: {
      deliverables: { vdr: -12, im: -5 },
      variables: { dataQuality: -6, confidentialityRisk: 4 },
      riskDebt: 2
    }
  },
  {
    id: "ev_internal_rework_wave",
    phaseIds: [1],
    kind: "followup",
    title: "Internal Rework Wave",
    text: "The team is pulled into unplanned cross-check cycles this week.",
    baseProbability: 1,
    condition: () => true,
    effects: {
      team: { morale: -2 },
      variables: { executionReadiness: -3 },
      riskDebt: 1
    }
  },
  {
    id: "ev_client_confidence_dip",
    phaseIds: [1],
    kind: "followup",
    title: "Client Confidence Dip",
    text: "Client confidence softened after seeing repeated iteration and delay.",
    baseProbability: 1,
    condition: () => true,
    effects: {
      variables: { leadHeat: -4, executionReadiness: -4 },
      workstreams: { relationshipDevelopment: { quality: -4 } }
    }
  },
  {
    id: "ev_buyer_interest_spike",
    phaseIds: [2],
    kind: "scheduled",
    title: "Buyer Interest Spike",
    text: "A new thematic angle boosted buyer engagement this week.",
    baseProbability: 0.2,
    condition: (state) => state.variables.outreachCoverage >= 40,
    effects: {
      variables: { buyerHeat: 8, buyerResponseRate: 6, processMomentum: 4 }
    }
  },
  {
    id: "ev_nda_bottleneck",
    phaseIds: [2],
    kind: "conditional",
    title: "NDA Bottleneck",
    text: "Legal turn-times slowed and NDA requests started piling up.",
    baseProbability: 0.16,
    condition: (state) => state.variables.responseBacklogPressure >= 40,
    effects: {
      variables: { processMomentum: -6, buyerHeat: -4, responseBacklogPressure: 10 },
      team: { morale: -2 }
    },
    chainTo: ["ev_legal_queue_spike"]
  },
  {
    id: "ev_confidentiality_leak_rumor",
    phaseIds: [2],
    kind: "conditional",
    title: "Confidentiality Leak Rumor",
    text: "Market chatter suggested process details are leaking.",
    baseProbability: 0.14,
    condition: (state) => state.variables.confidentialityRisk >= 55,
    effects: {
      variables: { confidentialityRisk: 8, processMomentum: -10, buyerHeat: -8 },
      riskDebt: 2
    },
    chainTo: ["ev_client_confidence_dip_phase2"]
  },
  {
    id: "ev_sponsor_fast_track",
    phaseIds: [2],
    kind: "conditional",
    title: "Sponsor Fast-Track Request",
    text: "A sponsor requested accelerated diligence access.",
    baseProbability: 0.12,
    condition: (state) => state.variables.buyerConversionRate >= 15,
    effects: {
      variables: { buyerConversionRate: 5, processMomentum: 5, responseBacklogPressure: 6 }
    }
  },
  {
    id: "ev_legal_queue_spike",
    phaseIds: [2],
    kind: "followup",
    title: "Legal Queue Spike",
    text: "NDA queue pressure escalated into a legal coordination issue.",
    baseProbability: 1,
    condition: () => true,
    effects: {
      variables: { responseBacklogPressure: 12, executionReadiness: -3 },
      team: { morale: -2 }
    }
  },
  {
    id: "ev_client_confidence_dip_phase2",
    phaseIds: [2],
    kind: "followup",
    title: "Client Confidence Dip",
    text: "Client concerns increased after leak-related market noise.",
    baseProbability: 1,
    condition: () => true,
    effects: {
      variables: { leadHeat: -6, processMomentum: -4 }
    }
  },
  {
    id: "ev_shortlist_signal_noise",
    phaseIds: [3],
    kind: "scheduled",
    title: "Signal Noise In Shortlist",
    text: "Buyer feedback looked positive but lacked true execution substance.",
    baseProbability: 0.18,
    condition: (state) => state.variables.shortlistQuality < 60,
    effects: {
      variables: { shortlistQuality: -8, competitiveTension: -4, processMomentum: -3 }
    }
  },
  {
    id: "ev_client_preference_distortion",
    phaseIds: [3],
    kind: "conditional",
    title: "Client Preference Distortion",
    text: "Client leadership is overweighting one bidder for emotional reasons.",
    baseProbability: 0.16,
    condition: (state) => state.variables.clientAlignment < 55,
    effects: {
      variables: { clientAlignment: -8, shortlistQuality: -5, competitiveTension: -3 }
    },
    chainTo: ["ev_internal_alignment_recovery"]
  },
  {
    id: "ev_bidder_withdrawal_risk",
    phaseIds: [3],
    kind: "conditional",
    title: "Bidder Withdrawal Risk",
    text: "A weaker shortlisted buyer signaled potential withdrawal.",
    baseProbability: 0.14,
    condition: (state) => state.buyers.filter((buyer) => buyer.shortlistStatus === "shortlisted").length >= 3,
    effects: {
      variables: { competitiveTension: -10, processMomentum: -6 },
      riskDebt: 2
    },
    chainTo: ["ev_tension_rebuild_required"]
  },
  {
    id: "ev_internal_alignment_recovery",
    phaseIds: [3],
    kind: "followup",
    title: "Internal Alignment Recovery",
    text: "The team had to spend heavy cycles re-aligning shortlist narrative.",
    baseProbability: 1,
    condition: () => true,
    effects: {
      variables: { executionReadiness: -3, offerReadiness: -3 },
      team: { morale: -2 }
    }
  },
  {
    id: "ev_tension_rebuild_required",
    phaseIds: [3],
    kind: "followup",
    title: "Tension Rebuild Required",
    text: "Competitive shape weakened and required urgent outreach rebalancing.",
    baseProbability: 1,
    condition: () => true,
    effects: {
      variables: { competitiveTension: -4, responseBacklogPressure: 6 }
    }
  },
  {
    id: "ev_nbo_deadline_wave",
    phaseIds: [4],
    kind: "scheduled",
    title: "NBO Deadline Wave",
    text: "Multiple bidders submitted NBOs close to the process deadline.",
    baseProbability: 0.2,
    condition: (state) => state.buyers.filter((buyer) => buyer.shortlistStatus === "shortlisted").length >= 2,
    effects: {
      variables: { nboCoverage: 10, processMomentum: 4, responseBacklogPressure: 6 }
    }
  },
  {
    id: "ev_client_price_anchor_spike",
    phaseIds: [4],
    kind: "conditional",
    title: "Client Price Anchor Spike",
    text: "A headline number is driving client focus away from offer structure.",
    baseProbability: 0.16,
    condition: (state) => state.variables.priceConfidence < 55,
    effects: {
      variables: { clientAlignment: -8, advancementClarity: -8, processMomentum: -4 }
    },
    chainTo: ["ev_alignment_rework_phase4"]
  },
  {
    id: "ev_hidden_conditionality_trap",
    phaseIds: [4],
    kind: "conditional",
    title: "Hidden Conditionality Trap",
    text: "A high headline bid carried heavy financing conditions that were initially missed.",
    baseProbability: 0.14,
    condition: (state) => state.variables.offerComparability < 60 || state.resources.pressure > 1.1,
    effects: {
      variables: { priceConfidence: -10, advancementClarity: -6, responseBacklogPressure: 8 },
      riskDebt: 2
    },
    chainTo: ["ev_offer_matrix_rework"]
  },
  {
    id: "ev_clean_offer_set",
    phaseIds: [4],
    kind: "conditional",
    title: "Clean Offer Set Emerges",
    text: "Offer assumptions aligned cleanly, making side-by-side evaluation faster.",
    baseProbability: 0.12,
    condition: (state) => state.variables.offerComparability >= 65,
    effects: {
      variables: { offerComparability: 8, priceConfidence: 6, advancementClarity: 4, processMomentum: 4 }
    }
  },
  {
    id: "ev_alignment_rework_phase4",
    phaseIds: [4],
    kind: "followup",
    title: "Client Alignment Rework",
    text: "Additional partner time was required to reframe price versus certainty.",
    baseProbability: 1,
    condition: () => true,
    effects: {
      team: { morale: -2 },
      variables: { executionReadiness: -3, responseBacklogPressure: 4 }
    }
  },
  {
    id: "ev_offer_matrix_rework",
    phaseIds: [4],
    kind: "followup",
    title: "Offer Matrix Rework",
    text: "The comparison matrix required urgent updates after hidden assumptions surfaced.",
    baseProbability: 1,
    condition: () => true,
    effects: {
      variables: { offerComparability: -4, executionReadiness: -2 },
      team: { morale: -1 }
    }
  },
  {
    id: "ev_dd_request_surge",
    phaseIds: [5],
    kind: "scheduled",
    title: "DD Request Surge",
    text: "Parallel buyer lanes generated a sudden wave of data requests.",
    baseProbability: 0.2,
    condition: (state) => state.variables.ddPressure < 70,
    effects: {
      variables: { ddPressure: 10, buyerConfidence: -4, responseBacklogPressure: 6 }
    }
  },
  {
    id: "ev_issue_emergence_spike",
    phaseIds: [5],
    kind: "conditional",
    title: "Issue Emergence Spike",
    text: "A diligence workstream surfaced a material issue requiring escalation.",
    baseProbability: 0.16,
    condition: (state) => state.variables.issueContainment < 60,
    effects: {
      variables: { retradeRisk: 10, buyerConfidence: -8, ddPressure: 8 },
      riskDebt: 2
    },
    chainTo: ["ev_issue_escalation_followup"]
  },
  {
    id: "ev_management_misalignment",
    phaseIds: [5],
    kind: "conditional",
    title: "Management Narrative Misalignment",
    text: "Management comments conflicted with diligence responses, reducing buyer trust.",
    baseProbability: 0.12,
    condition: (state) => state.variables.ddReadiness < 55,
    effects: {
      variables: { buyerConfidence: -9, retradeRisk: 6, ddPressure: 5 },
      team: { morale: -2 }
    }
  },
  {
    id: "ev_dd_lane_stabilizes",
    phaseIds: [5],
    kind: "conditional",
    title: "DD Lane Stabilizes",
    text: "A well-managed lane regained confidence after strong responsiveness.",
    baseProbability: 0.12,
    condition: (state) => state.variables.issueContainment >= 65 && state.variables.ddPressure <= 45,
    effects: {
      variables: { buyerConfidence: 8, ddPressure: -6, processMomentum: 4, ddReadiness: 5 }
    }
  },
  {
    id: "ev_issue_escalation_followup",
    phaseIds: [5],
    kind: "followup",
    title: "Issue Escalation Follow-up",
    text: "The issue required additional legal and finance response cycles.",
    baseProbability: 1,
    condition: () => true,
    effects: {
      variables: { ddPressure: 6, issueContainment: -4 },
      team: { morale: -1 }
    }
  },
  {
    id: "ev_final_offer_reveal_wave",
    phaseIds: [6],
    kind: "scheduled",
    title: "Final Offer Reveal Wave",
    text: "Final bids arrived nearly simultaneously, compressing decision pressure.",
    baseProbability: 0.2,
    condition: (state) => state.variables.executableCertainty < 75,
    effects: {
      variables: { finalOfferStrength: 8, finalOfferComparability: 4, responseBacklogPressure: 6 }
    }
  },
  {
    id: "ev_false_winner_signal",
    phaseIds: [6],
    kind: "conditional",
    title: "False Winner Signal",
    text: "A top headline bidder showed legal terms that materially weaken execution certainty.",
    baseProbability: 0.16,
    condition: (state) => state.variables.falseWinnerRisk >= 55,
    effects: {
      variables: { falseWinnerRisk: 10, executableCertainty: -8, clientAlignment: -6 },
      riskDebt: 2
    },
    chainTo: ["ev_client_anchor_tension_phase6"]
  },
  {
    id: "ev_backup_bidder_cools",
    phaseIds: [6],
    kind: "conditional",
    title: "Backup Bidder Cools",
    text: "The runner-up lane is losing urgency and may disengage without active management.",
    baseProbability: 0.12,
    condition: (state) => state.variables.backupBidderStrength < 45,
    effects: {
      variables: { backupBidderStrength: -8, processMomentum: -4, falseWinnerRisk: 4 }
    }
  },
  {
    id: "ev_clean_executable_bid",
    phaseIds: [6],
    kind: "conditional",
    title: "Clean Executable Bid",
    text: "One final offer scored strongly on both value and execution profile.",
    baseProbability: 0.12,
    condition: (state) => state.variables.executableCertainty >= 65 && state.variables.finalOfferComparability >= 65,
    effects: {
      variables: { executableCertainty: 8, falseWinnerRisk: -6, exclusivityReadiness: 5 }
    }
  },
  {
    id: "ev_client_anchor_tension_phase6",
    phaseIds: [6],
    kind: "followup",
    title: "Client Price Anchor Tension",
    text: "The client pushed for the highest number despite execution warnings.",
    baseProbability: 1,
    condition: () => true,
    effects: {
      variables: { clientAlignment: -6, falseWinnerRisk: 5 },
      team: { morale: -1 }
    }
  },
  {
    id: "ev_spa_markup_wave",
    phaseIds: [7],
    kind: "scheduled",
    title: "SPA Markup Wave",
    text: "Counsel returned a dense markup that reopened multiple clause families.",
    baseProbability: 0.2,
    condition: (state) => state.variables.signingReadiness < 85,
    effects: {
      variables: { residualLegalDrag: 10, clausePressure: 8, preferredBidderStability: -4 }
    }
  },
  {
    id: "ev_client_resists_concession_phase7",
    phaseIds: [7],
    kind: "conditional",
    title: "Client Resists Concession",
    text: "Client leadership rejected a proposed legal compromise and forced rework.",
    baseProbability: 0.16,
    condition: (state) => state.variables.clientValueSensitivity >= 65 && state.variables.concessionDiscipline < 50,
    effects: {
      variables: { signingReadiness: -6, clientAlignment: -8, falseClosureRisk: 6, residualLegalDrag: 4 }
    },
    chainTo: ["ev_client_escalation_cycle_phase7"]
  },
  {
    id: "ev_package_trade_unlock_phase7",
    phaseIds: [7],
    kind: "conditional",
    title: "Package Trade Unlock",
    text: "A balanced package trade resolved multiple interlinked clauses at once.",
    baseProbability: 0.12,
    condition: (state) =>
      state.variables.concessionDiscipline >= 60 && state.variables.legalControl >= 55 && state.variables.residualLegalDrag >= 15,
    effects: {
      variables: { residualLegalDrag: -12, signingReadiness: 8, preferredBidderStability: 5, falseClosureRisk: -4 }
    }
  },
  {
    id: "ev_fallback_leverage_weakens_phase7",
    phaseIds: [7],
    kind: "conditional",
    title: "Fallback Leverage Weakens",
    text: "The backup lane cooled, making buyer counsel visibly more aggressive.",
    baseProbability: 0.12,
    condition: (state) => state.variables.fallbackLeverage < 30,
    effects: {
      variables: { fallbackLeverage: -10, clausePressure: 10, preferredBidderStability: -6 }
    }
  },
  {
    id: "ev_near_agreement_fragility_phase7",
    phaseIds: [7],
    kind: "conditional",
    title: "Near-Agreement Fragility Exposed",
    text: "Late coherence review exposed contradictions in supposedly resolved clauses.",
    baseProbability: 0.12,
    condition: (state) => state.variables.signingReadiness >= 80 && state.variables.falseClosureRisk >= 45,
    effects: {
      variables: { signingReadiness: -12, residualLegalDrag: 12, falseClosureRisk: 8, paperFragility: 8 },
      riskDebt: 2
    }
  },
  {
    id: "ev_client_escalation_cycle_phase7",
    phaseIds: [7],
    kind: "followup",
    title: "Client Escalation Cycle",
    text: "Escalation calls consumed a full cycle and delayed clause closure.",
    baseProbability: 1,
    condition: () => true,
    effects: {
      variables: { clientValueSensitivity: 8, concessionDiscipline: -4, signingReadiness: -3 },
      team: { morale: -1 }
    }
  },
  {
    id: "ev_final_version_instability_phase8",
    phaseIds: [8],
    kind: "scheduled",
    title: "Final Version Instability Emerges",
    text: "Late drafting mismatch destabilized the signature version and reopened technical fixes.",
    baseProbability: 0.2,
    condition: (state) => state.variables.documentStability < 85,
    effects: {
      variables: { documentStability: -14, signability: -8, openItemMateriality: 10, ceremonyRisk: 6 }
    }
  },
  {
    id: "ev_minor_item_becomes_blocker_phase8",
    phaseIds: [8],
    kind: "conditional",
    title: "Minor Item Becomes Blocker",
    text: "A low-priority administrative item escalated and now blocks the signing package.",
    baseProbability: 0.16,
    condition: (state) => state.variables.openItemClosureRate < 75,
    effects: {
      variables: { openItemMateriality: 12, openItemClosureRate: -10, signingTimingIntegrity: -8, signingConfidence: -6 }
    }
  },
  {
    id: "ev_client_hesitation_before_signature_phase8",
    phaseIds: [8],
    kind: "conditional",
    title: "Client Hesitates Before Signature",
    text: "Client concern over late wording changes paused execution while counsel re-explains risk allocation.",
    baseProbability: 0.12,
    condition: (state) => state.variables.clientAlignment < 60 || state.variables.signability < 70,
    effects: {
      variables: { signingConfidence: -10, counterpartyAlignment: -6, coordinationQuality: -4, lastMilePressure: 8 }
    },
    chainTo: ["ev_signing_delay_followup_phase8"]
  },
  {
    id: "ev_false_finish_pressure_phase8",
    phaseIds: [8],
    kind: "conditional",
    title: "False Finish Pressure",
    text: "Execution appears close, but hidden defects increased post-signing fragility risk.",
    baseProbability: 0.12,
    condition: (state) => state.variables.documentStability < 100 && state.variables.signingConfidence >= 85,
    effects: {
      variables: { residualPostSigningFragility: 12, realExecutionRisk: 10, signability: -6 }
    }
  },
  {
    id: "ev_clean_final_review_phase8",
    phaseIds: [8],
    kind: "conditional",
    title: "Clean Final Review",
    text: "Integrated legal and execution review removed hidden defects from the signing package.",
    baseProbability: 0.12,
    condition: (state) => state.variables.signability >= 80 && state.variables.documentStability >= 90,
    effects: {
      variables: { realExecutionRisk: -12, ceremonyRisk: -8, signingConfidence: 8, closingPreparationQuality: 6 }
    }
  },
  {
    id: "ev_signing_delay_followup_phase8",
    phaseIds: [8],
    kind: "followup",
    title: "Signing Delay Follow-up",
    text: "The timetable slipped while signatures were re-coordinated across parties.",
    baseProbability: 1,
    condition: () => true,
    effects: {
      variables: { signingTimingIntegrity: -8, lastMilePressure: 10, counterpartyAlignment: -4 },
      team: { morale: -1 }
    }
  },
  {
    id: "ev_critical_cp_delays_close_phase9",
    phaseIds: [9],
    kind: "scheduled",
    title: "Critical CP Delays Close",
    text: "A key condition precedent stalled and reset downstream sequencing.",
    baseProbability: 0.18,
    condition: (state) => state.runtime?.phase9Stage === "9A_PreClosing" && state.variables.cpCompletion < 100,
    effects: {
      variables: { cpCompletion: -8, cpDrag: 10, delayRisk: 12, completionConfidence: -10, interimRisk: 8 },
      riskDebt: 2
    },
    chainTo: ["ev_cp_delay_followup_phase9"]
  },
  {
    id: "ev_banking_coordination_problem_phase9",
    phaseIds: [9],
    kind: "conditional",
    title: "Banking Coordination Problem Emerges",
    text: "Bank compliance flagged instruction sequencing and put wires on hold.",
    baseProbability: 0.16,
    condition: (state) => state.runtime?.phase9Stage === "9B_Execution" && state.variables.executionDiscipline < 65,
    effects: {
      variables: { fundsFlowReadiness: -20, paymentTimingIntegrity: -14, delayRisk: 10, completionConfidence: -8 },
      riskDebt: 2
    },
    chainTo: ["ev_wire_cutoff_miss_followup_phase9"]
  },
  {
    id: "ev_final_version_issue_delays_execution_phase9",
    phaseIds: [9],
    kind: "conditional",
    title: "Final Version Issue Delays Execution",
    text: "A document-pack mismatch blocked legal release and delayed ownership filings.",
    baseProbability: 0.14,
    condition: (state) => state.runtime?.phase9Stage === "9B_Execution" && state.variables.signatureIntegrity < 85 && state.variables.ownershipTransferReadiness >= 60,
    effects: {
      variables: { signatureIntegrity: -12, ownershipTransferReadiness: -8, closingExecutionQuality: -10, delayRisk: 8 },
      riskDebt: 2
    }
  },
  {
    id: "ev_value_integrity_holds_phase9",
    phaseIds: [9],
    kind: "conditional",
    title: "Value Integrity Holds Through Final Stretch",
    text: "Economic mechanics held under pressure and buyer claw-back pressure faded.",
    baseProbability: 0.12,
    condition: (state) => state.runtime?.phase9Stage === "9A_PreClosing" && state.variables.valueIntegrity >= 90 && state.variables.cpCompletion >= 60,
    effects: {
      variables: { valueIntegrity: 4, completionConfidence: 6, clientOutcomeSatisfaction: 4 }
    }
  },
  {
    id: "ev_completion_quality_reduced_phase9",
    phaseIds: [9],
    kind: "conditional",
    title: "Completion Quality Reduced by Friction",
    text: "Closing can still happen, but friction is degrading execution quality and final reputation.",
    baseProbability: 0.12,
    condition: (state) => state.runtime?.phase9Stage === "9B_Execution" && (state.variables.delayRisk > 50 || state.variables.closingExecutionQuality < 60),
    effects: {
      variables: { closingExecutionQuality: -8, reputationOutcome: -8, completionConfidence: -4 },
      riskDebt: 1
    }
  },
  {
    id: "ev_cp_delay_followup_phase9",
    phaseIds: [9],
    kind: "followup",
    title: "CP Delay Follow-up",
    text: "Rework and sequencing overhead consumed another cycle.",
    baseProbability: 1,
    condition: () => true,
    effects: {
      variables: { cpDrag: 8, interimRisk: 6, delayRisk: 8 },
      team: { morale: -1 }
    }
  },
  {
    id: "ev_wire_cutoff_miss_followup_phase9",
    phaseIds: [9],
    kind: "followup",
    title: "Wire Cut-Off Missed",
    text: "Daily banking cut-off was missed and closing mechanics slipped by one day.",
    baseProbability: 1,
    condition: () => true,
    effects: {
      variables: { paymentTimingIntegrity: -10, delayRisk: 12, counterpartyAlignment: -6 },
      team: { morale: -1 }
    }
  },
  {
    id: "ev_results_board_opened_phase10",
    phaseIds: [10],
    kind: "scheduled",
    title: "Results Board Activated",
    text: "The mandate outcome has been consolidated into a full endgame evaluation board.",
    baseProbability: 1,
    condition: (state) => state.clock.week === state.runtime.phaseEnteredWeek,
    effects: {
      variables: { processMomentum: 2, rainmakerProgressImpact: 3 }
    }
  },
  {
    id: "ev_market_echo_positive_phase10",
    phaseIds: [10],
    kind: "conditional",
    title: "Market Echo: Strong Mandate Reputation",
    text: "Market participants are referencing this deal as a high-quality execution benchmark.",
    baseProbability: 0.22,
    condition: (state) =>
      state.clock.week === state.runtime.phaseEnteredWeek &&
      (state.resultsBoard?.scores?.overallDealScore ?? 0) >= 75,
    effects: {
      variables: { reputationOutcome: 4, rainmakerProgressImpact: 4 }
    }
  },
  {
    id: "ev_market_echo_negative_phase10",
    phaseIds: [10],
    kind: "conditional",
    title: "Market Echo: Execution Questions",
    text: "Peers flagged this mandate as a case where process discipline did not hold under pressure.",
    baseProbability: 0.22,
    condition: (state) =>
      state.clock.week === state.runtime.phaseEnteredWeek &&
      (state.resultsBoard?.scores?.overallDealScore ?? 100) < 45,
    effects: {
      variables: { reputationOutcome: -4, rainmakerProgressImpact: -3 },
      team: { morale: -2 }
    }
  }
];

export function getEventById(eventId) {
  return PHASE_EVENTS.find((eventDef) => eventDef.id === eventId) ?? null;
}

export function getEventPool(state, kind) {
  return PHASE_EVENTS.filter((eventDef) => {
    if (eventDef.kind !== kind) return false;
    if (!eventDef.phaseIds.includes(state.deal.phaseId)) return false;
    return eventDef.condition(state);
  });
}





