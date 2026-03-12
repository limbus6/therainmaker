export const COMPLEXITY_BASE_PROBABILITY = {
  Low: 0.1,
  Medium: 0.3,
  High: 0.5
};

export const ACTION_LIBRARY = [
  {
    id: "p0_founder_research",
    name: "Founder Research",
    category: "Information",
    phaseIds: [0],
    cost: 3,
    work: 6,
    complexity: "Medium",
    hiddenWorkRange: [2, 5],
    effects: {
      variables: { dataVisibility: 8, fitScore: 3, dataQuality: 3 },
      workstreams: { targetIntelligence: { progress: 12, quality: 8 } }
    }
  },
  {
    id: "p0_prepare_founder_meeting",
    name: "Prepare Founder Meeting",
    category: "Narrative",
    phaseIds: [0],
    cost: 4,
    work: 7,
    complexity: "Medium",
    hiddenWorkRange: [2, 6],
    effects: {
      variables: { accessLevel: 8, leadHeat: 4 },
      workstreams: { relationshipDevelopment: { progress: 14, quality: 6 } }
    }
  },
  {
    id: "p0_founder_intro_call",
    name: "Founder Intro Call",
    category: "Process Control",
    phaseIds: [0],
    cost: 2,
    work: 5,
    complexity: "Low",
    hiddenWorkRange: [1, 3],
    effects: {
      variables: { leadHeat: 6, accessLevel: 10 },
      workstreams: { relationshipDevelopment: { progress: 10, quality: 8 } }
    }
  },
  {
    id: "p0_qualification_analysis",
    name: "Qualification Analysis",
    category: "Information",
    phaseIds: [0],
    cost: 3,
    work: 6,
    complexity: "Medium",
    hiddenWorkRange: [2, 5],
    effects: {
      variables: { fitScore: 10, executionReadiness: 4 },
      workstreams: {
        qualification: { progress: 14, quality: 9 },
        pitchReadiness: { progress: 8, quality: 7 }
      }
    }
  },
  {
    id: "p0_prelim_valuation",
    name: "Preliminary Valuation Analysis",
    category: "Materials",
    phaseIds: [0],
    cost: 5,
    work: 9,
    complexity: "High",
    hiddenWorkRange: [4, 8],
    effects: {
      variables: { confidentialityRisk: 3, executionReadiness: 6 },
      workstreams: {
        valuationFraming: { progress: 18, quality: 10 },
        pitchReadiness: { progress: 12, quality: 8 }
      },
      riskDebt: 1
    }
  },
  {
    id: "p1_financial_deep_dive",
    name: "Financial Deep Dive",
    category: "Information",
    phaseIds: [1],
    cost: 5,
    work: 12,
    complexity: "Medium",
    hiddenWorkRange: [5, 8],
    effects: {
      variables: { dataQuality: 8, executionReadiness: 5 },
      workstreams: {
        targetIntelligence: { progress: 10, quality: 10 },
        qualification: { progress: 8, quality: 8 }
      },
      deliverables: { model: 20 }
    }
  },
  {
    id: "p1_revenue_quality_analysis",
    name: "Revenue Quality Analysis",
    category: "Information",
    phaseIds: [1],
    cost: 4,
    work: 10,
    complexity: "Medium",
    hiddenWorkRange: [4, 7],
    effects: {
      variables: { dataQuality: 10, executionReadiness: 4 },
      deliverables: { model: 10 },
      workstreams: { targetIntelligence: { progress: 8, quality: 10 } }
    }
  },
  {
    id: "p1_draft_teaser",
    name: "Draft Teaser",
    category: "Narrative",
    phaseIds: [1],
    requiresAny: ["p1_financial_deep_dive", "p1_revenue_quality_analysis"],
    cost: 4,
    work: 8,
    complexity: "Medium",
    hiddenWorkRange: [3, 6],
    effects: {
      variables: { executionReadiness: 6 },
      deliverables: { teaser: 25 },
      workstreams: { pitchReadiness: { progress: 6, quality: 7 } }
    }
  },
  {
    id: "p1_draft_im",
    name: "Draft Information Memorandum",
    category: "Materials",
    phaseIds: [1],
    requiresAll: ["p1_financial_deep_dive", "p1_draft_teaser"],
    cost: 12,
    work: 30,
    complexity: "High",
    hiddenWorkRange: [8, 14],
    effects: {
      variables: { executionReadiness: 8 },
      deliverables: { im: 25 },
      workstreams: { pitchReadiness: { progress: 10, quality: 10 } },
      team: { morale: -2 },
      riskDebt: 1
    }
  },
  {
    id: "p1_financial_model_integration",
    name: "Financial Model Integration",
    category: "Materials",
    phaseIds: [1],
    requiresAll: ["p1_financial_deep_dive", "p1_revenue_quality_analysis"],
    cost: 6,
    work: 14,
    complexity: "High",
    hiddenWorkRange: [6, 10],
    effects: {
      variables: { dataQuality: 7, executionReadiness: 6 },
      deliverables: { model: 20 },
      workstreams: { valuationFraming: { progress: 10, quality: 11 } }
    }
  },
  {
    id: "p1_build_buyer_list",
    name: "Build Buyer List",
    category: "Market Intelligence",
    phaseIds: [1],
    requiresAny: ["p1_draft_teaser", "p1_draft_im"],
    cost: 6,
    work: 10,
    complexity: "Low",
    hiddenWorkRange: [2, 4],
    effects: {
      variables: { fitScore: 4, executionReadiness: 4 },
      deliverables: { buyerList: 20 }
    }
  },
  {
    id: "p1_data_room_structure",
    name: "Data Room Structure",
    category: "Process Control",
    phaseIds: [1],
    requiresAny: ["p1_draft_im", "p1_financial_model_integration"],
    cost: 4,
    work: 10,
    complexity: "Medium",
    hiddenWorkRange: [4, 6],
    effects: {
      variables: { dataQuality: 6, executionReadiness: 5 },
      deliverables: { vdr: 20 },
      workstreams: { confidentialityConflicts: { progress: 8, quality: 8 } }
    }
  },
  {
    id: "p1_quality_check_data_room",
    name: "Quality Check Data Room",
    category: "Process Control",
    phaseIds: [1],
    requiresAll: ["p1_data_room_structure"],
    cost: 5,
    work: 12,
    complexity: "Medium",
    hiddenWorkRange: [5, 8],
    effects: {
      variables: { dataQuality: 9, executionReadiness: 7, confidentialityRisk: -2 },
      deliverables: { vdr: 25 },
      workstreams: { confidentialityConflicts: { progress: 10, quality: 10 } }
    }
  },
  {
    id: "p1_prepare_management_presentation",
    name: "Prepare Management Presentation",
    category: "Narrative",
    phaseIds: [1],
    requiresAll: ["p1_draft_im"],
    cost: 5,
    work: 10,
    complexity: "Medium",
    hiddenWorkRange: [4, 7],
    effects: {
      variables: { executionReadiness: 6 },
      workstreams: { relationshipDevelopment: { progress: 8, quality: 9 } },
      team: { morale: -1 }
    }
  },
  {
    id: "p2_send_teasers_universe",
    name: "Send Teasers To Universe",
    category: "Market Intelligence",
    phaseIds: [2],
    systemTags: ["outreach_send"],
    requiresDeliverables: [
      { id: "teaser", minProgress: 60 },
      { id: "buyerList", minProgress: 50 }
    ],
    cost: 5,
    work: 12,
    complexity: "Medium",
    hiddenWorkRange: [4, 8],
    effects: {
      variables: { outreachCoverage: 25, processMomentum: 8, buyerHeat: 4 }
    }
  },
  {
    id: "p2_expand_outreach_wave",
    name: "Expand Outreach Wave",
    category: "Market Intelligence",
    phaseIds: [2],
    systemTags: ["outreach_send", "outreach_expand"],
    requiresAny: ["p2_send_teasers_universe"],
    cost: 5,
    work: 10,
    complexity: "Medium",
    hiddenWorkRange: [4, 6],
    effects: {
      variables: { outreachCoverage: 18, processMomentum: 4, confidentialityRisk: 3 }
    }
  },
  {
    id: "p2_follow_up_priority_buyers",
    name: "Follow Up Priority Buyers",
    category: "Process Control",
    phaseIds: [2],
    systemTags: ["outreach_followup"],
    requiresAny: ["p2_send_teasers_universe", "p2_expand_outreach_wave"],
    cost: 4,
    work: 9,
    complexity: "Low",
    hiddenWorkRange: [2, 4],
    effects: {
      variables: { processMomentum: 6, buyerHeat: 6 }
    }
  },
  {
    id: "p2_process_nda_requests",
    name: "Process NDA Requests",
    category: "Process Control",
    phaseIds: [2],
    systemTags: ["nda_process"],
    requiresBuyerStageCounts: [{ stage: "nda_requested", min: 1 }],
    cost: 4,
    work: 10,
    complexity: "Medium",
    hiddenWorkRange: [3, 6],
    effects: {
      variables: { buyerConversionRate: 8, responseBacklogPressure: -18, processMomentum: 5 }
    }
  },
  {
    id: "p2_grant_im_access",
    name: "Grant IM Access",
    category: "Process Control",
    phaseIds: [2],
    systemTags: ["im_grant"],
    requiresBuyerStageCounts: [{ stage: "nda_signed", min: 1 }],
    requiresDeliverables: [{ id: "im", minProgress: 60 }],
    cost: 3,
    work: 7,
    complexity: "Medium",
    hiddenWorkRange: [2, 5],
    effects: {
      variables: { buyerHeat: 6, processMomentum: 6, confidentialityRisk: 2 }
    }
  },
  {
    id: "p2_buyer_qna_response",
    name: "Buyer Q&A Response Sprint",
    category: "Information",
    phaseIds: [2],
    systemTags: ["qna_response"],
    requiresBuyerStageCounts: [{ stage: "im_access", min: 1 }],
    cost: 4,
    work: 11,
    complexity: "High",
    hiddenWorkRange: [5, 9],
    effects: {
      variables: { processMomentum: 8, dataQuality: 2, executionReadiness: 2 }
    }
  },
  {
    id: "p2_confidentiality_lockdown",
    name: "Confidentiality Lockdown",
    category: "Process Control",
    phaseIds: [2],
    systemTags: ["confidentiality_control"],
    requiresAny: ["p2_send_teasers_universe", "p2_expand_outreach_wave"],
    cost: 3,
    work: 6,
    complexity: "Low",
    hiddenWorkRange: [1, 3],
    effects: {
      variables: { confidentialityRisk: -12, processMomentum: 3 }
    }
  },
  {
    id: "p2_market_signal_refresh",
    name: "Market Signal Refresh",
    category: "Market Intelligence",
    phaseIds: [2],
    systemTags: ["market_scan"],
    requiresAny: ["p2_send_teasers_universe", "p2_expand_outreach_wave"],
    cost: 2,
    work: 5,
    complexity: "Low",
    hiddenWorkRange: [1, 2],
    effects: {
      variables: { processMomentum: 2, dataVisibility: 4, buyerHeat: 2 }
    }
  },
  {
    id: "p3_build_buyer_matrix",
    name: "Build Buyer Evaluation Matrix",
    category: "Information",
    phaseIds: [3],
    systemTags: ["shortlist_score"],
    requiresBuyerStageCounts: [{ stage: "nda_signed", min: 1 }],
    cost: 6,
    work: 12,
    complexity: "Medium",
    hiddenWorkRange: [4, 7],
    effects: {
      variables: { shortlistQuality: 12, competitiveTension: 4, processMomentum: 4 }
    }
  },
  {
    id: "p3_score_execution_certainty",
    name: "Score Execution Certainty",
    category: "Information",
    phaseIds: [3],
    systemTags: ["shortlist_score"],
    requiresAny: ["p3_build_buyer_matrix"],
    cost: 4,
    work: 8,
    complexity: "Low",
    hiddenWorkRange: [2, 4],
    effects: {
      variables: { shortlistQuality: 8, buyerConversionRate: 3, offerReadiness: 3 }
    }
  },
  {
    id: "p3_select_shortlist",
    name: "Select Buyer Shortlist",
    category: "Process Control",
    phaseIds: [3],
    systemTags: ["shortlist_select"],
    requiresAny: ["p3_build_buyer_matrix", "p3_score_execution_certainty"],
    requiresBuyerStageCounts: [{ stage: "nda_signed", min: 2 }],
    cost: 5,
    work: 10,
    complexity: "Medium",
    hiddenWorkRange: [3, 6],
    effects: {
      variables: { shortlistQuality: 6, competitiveTension: 6, clientAlignment: 4 }
    }
  },
  {
    id: "p3_calibrate_competitive_tension",
    name: "Calibrate Competitive Tension",
    category: "Negotiation",
    phaseIds: [3],
    systemTags: ["tension_manage"],
    requiresShortlistCounts: [{ status: "shortlisted", min: 2 }],
    cost: 4,
    work: 9,
    complexity: "Medium",
    hiddenWorkRange: [3, 6],
    effects: {
      variables: { competitiveTension: 10, processMomentum: 5, offerReadiness: 4 }
    }
  },
  {
    id: "p3_client_alignment_session",
    name: "Client Alignment Session",
    category: "Narrative",
    phaseIds: [3],
    systemTags: ["client_align"],
    requiresAny: ["p3_select_shortlist"],
    cost: 3,
    work: 7,
    complexity: "Low",
    hiddenWorkRange: [2, 3],
    effects: {
      variables: { clientAlignment: 10, leadHeat: 4, shortlistQuality: 4 }
    }
  },
  {
    id: "p3_prepare_nbo_instruction_pack",
    name: "Prepare NBO Instruction Pack",
    category: "Materials",
    phaseIds: [3],
    systemTags: ["prepare_nbo"],
    requiresShortlistCounts: [{ status: "shortlisted", min: 2 }],
    requiresDeliverables: [{ id: "im", minProgress: 60 }],
    cost: 5,
    work: 11,
    complexity: "Medium",
    hiddenWorkRange: [4, 7],
    effects: {
      variables: { offerReadiness: 12, executionReadiness: 4, processMomentum: 4 }
    }
  },
  {
    id: "p3_drop_low_conviction_bidders",
    name: "Drop Low-Conviction Bidders",
    category: "Process Control",
    phaseIds: [3],
    systemTags: ["shortlist_prune"],
    requiresAny: ["p3_build_buyer_matrix"],
    cost: 2,
    work: 5,
    complexity: "Low",
    hiddenWorkRange: [1, 3],
    effects: {
      variables: { competitiveTension: 4, responseBacklogPressure: -8, shortlistQuality: 2 }
    }
  },
  {
    id: "p4_chase_missing_nbo",
    name: "Chase Missing NBO",
    category: "Process Control",
    phaseIds: [4],
    systemTags: ["nbo_collect"],
    requiresShortlistCounts: [{ status: "shortlisted", min: 2 }],
    cost: 3,
    work: 7,
    complexity: "Low",
    hiddenWorkRange: [1, 3],
    effects: {
      variables: { nboCoverage: 10, processMomentum: 3, responseBacklogPressure: -4 }
    }
  },
  {
    id: "p4_compare_headline_values",
    name: "Compare Headline Values",
    category: "Information",
    phaseIds: [4],
    systemTags: ["offer_compare"],
    requiresOfferCounts: [{ kind: "submitted", min: 1 }],
    cost: 4,
    work: 8,
    complexity: "Low",
    hiddenWorkRange: [1, 3],
    effects: {
      variables: { offerComparability: 8, advancementClarity: 4 }
    }
  },
  {
    id: "p4_normalize_bid_assumptions",
    name: "Normalize Bid Assumptions",
    category: "Information",
    phaseIds: [4],
    systemTags: ["offer_normalize"],
    requiresAny: ["p4_compare_headline_values"],
    requiresOfferCounts: [{ kind: "submitted", min: 2 }],
    cost: 7,
    work: 16,
    complexity: "High",
    hiddenWorkRange: [5, 9],
    effects: {
      variables: { offerComparability: 12, priceConfidence: 8, executionReadiness: 4 }
    }
  },
  {
    id: "p4_review_conditionality_profile",
    name: "Review Conditionality Profile",
    category: "Risk Control",
    phaseIds: [4],
    systemTags: ["offer_condition_review"],
    requiresOfferCounts: [{ kind: "submitted", min: 2 }],
    cost: 6,
    work: 14,
    complexity: "High",
    hiddenWorkRange: [4, 8],
    effects: {
      variables: { priceConfidence: 10, advancementClarity: 5, responseBacklogPressure: 4 }
    }
  },
  {
    id: "p4_build_nbo_matrix",
    name: "Build NBO Comparison Matrix",
    category: "Materials",
    phaseIds: [4],
    systemTags: ["offer_matrix"],
    requiresAny: ["p4_normalize_bid_assumptions", "p4_review_conditionality_profile"],
    requiresOfferCounts: [{ kind: "submitted", min: 2 }],
    cost: 5,
    work: 12,
    complexity: "Medium",
    hiddenWorkRange: [3, 6],
    effects: {
      variables: { offerComparability: 14, advancementClarity: 8, processMomentum: 5 }
    }
  },
  {
    id: "p4_present_offer_readout",
    name: "Present Offer Interpretation To Client",
    category: "Narrative",
    phaseIds: [4],
    systemTags: ["client_reframe"],
    requiresAny: ["p4_build_nbo_matrix", "p4_review_conditionality_profile"],
    cost: 4,
    work: 10,
    complexity: "Medium",
    hiddenWorkRange: [3, 6],
    effects: {
      variables: { clientAlignment: 8, priceConfidence: 6, advancementClarity: 6 }
    }
  },
  {
    id: "p4_build_dd_recommendation",
    name: "Build DD Invite Recommendation",
    category: "Negotiation",
    phaseIds: [4],
    systemTags: ["offer_recommend"],
    requiresAny: ["p4_build_nbo_matrix"],
    requiresOfferCounts: [{ kind: "analyzed", min: 2 }],
    cost: 5,
    work: 11,
    complexity: "High",
    hiddenWorkRange: [4, 7],
    effects: {
      variables: { advancementClarity: 12, processMomentum: 4 }
    }
  },
  {
    id: "p4_finalize_dd_invite_list",
    name: "Finalize DD Invite List",
    category: "Process Control",
    phaseIds: [4],
    systemTags: ["offer_selectivity"],
    requiresAny: ["p4_build_dd_recommendation", "p4_present_offer_readout"],
    requiresOfferCounts: [{ kind: "submitted", min: 2 }],
    cost: 4,
    work: 9,
    complexity: "Medium",
    hiddenWorkRange: [2, 5],
    effects: {
      variables: { advancementClarity: 10, processMomentum: 6, responseBacklogPressure: -8 }
    }
  },
  {
    id: "p4_prepare_dd_entry_package",
    name: "Prepare DD Entry Package",
    category: "Materials",
    phaseIds: [4],
    systemTags: ["phase5_prepare"],
    requiresAny: ["p4_finalize_dd_invite_list", "p4_build_dd_recommendation"],
    requiresOfferCounts: [{ kind: "advanced", min: 2 }],
    cost: 6,
    work: 13,
    complexity: "Medium",
    hiddenWorkRange: [4, 7],
    effects: {
      variables: { executionReadiness: 8, priceConfidence: 6, processMomentum: 4 },
      deliverables: { vdr: 12 }
    }
  },
  {
    id: "p5_launch_structured_qna_tracker",
    name: "Launch Structured Q&A Tracker",
    category: "Process Control",
    phaseIds: [5],
    systemTags: ["dd_qna_launch"],
    requiresOfferCounts: [{ kind: "advanced", min: 2 }],
    cost: 4,
    work: 11,
    complexity: "Low",
    hiddenWorkRange: [2, 4],
    effects: {
      variables: { ddPressure: -8, buyerConfidence: 6, processMomentum: 4 }
    }
  },
  {
    id: "p5_triage_incoming_dd_requests",
    name: "Triage Incoming DD Requests",
    category: "Process Control",
    phaseIds: [5],
    systemTags: ["dd_qna_triage"],
    requiresAny: ["p5_launch_structured_qna_tracker"],
    cost: 4,
    work: 10,
    complexity: "Medium",
    hiddenWorkRange: [3, 6],
    effects: {
      variables: { ddPressure: -10, issueContainment: 6, buyerConfidence: 3 }
    }
  },
  {
    id: "p5_refresh_data_room_materials",
    name: "Refresh Data Room Materials",
    category: "Materials",
    phaseIds: [5],
    systemTags: ["dd_data_refresh"],
    requiresAny: ["p5_launch_structured_qna_tracker"],
    cost: 4,
    work: 9,
    complexity: "Low",
    hiddenWorkRange: [2, 4],
    effects: {
      variables: { ddPressure: -6, issueContainment: 4, buyerConfidence: 4 },
      deliverables: { vdr: 10 }
    }
  },
  {
    id: "p5_respond_to_buyer_question_pack",
    name: "Respond To Buyer Question Pack",
    category: "Information",
    phaseIds: [5],
    systemTags: ["dd_qna_respond"],
    requiresDdLaneCounts: [{ kind: "active", min: 2 }],
    cost: 5,
    work: 14,
    complexity: "High",
    hiddenWorkRange: [5, 9],
    effects: {
      variables: { ddPressure: -14, buyerConfidence: 5, issueContainment: 3 }
    }
  },
  {
    id: "p5_investigate_emerging_issue",
    name: "Investigate Emerging Issue",
    category: "Risk Control",
    phaseIds: [5],
    systemTags: ["dd_issue_investigate"],
    requiresAny: ["p5_triage_incoming_dd_requests", "p5_respond_to_buyer_question_pack"],
    cost: 4,
    work: 10,
    complexity: "Medium",
    hiddenWorkRange: [3, 6],
    effects: {
      variables: { issueContainment: 8, retradeRisk: -4, ddPressure: -3 }
    }
  },
  {
    id: "p5_build_mitigation_pack",
    name: "Build Mitigation Pack",
    category: "Risk Control",
    phaseIds: [5],
    systemTags: ["dd_issue_contain"],
    requiresAny: ["p5_investigate_emerging_issue"],
    cost: 6,
    work: 16,
    complexity: "High",
    hiddenWorkRange: [6, 10],
    effects: {
      variables: { issueContainment: 12, retradeRisk: -8, buyerConfidence: 5, ddPressure: -4 }
    }
  },
  {
    id: "p5_prepare_management_dd_session",
    name: "Prepare Management For DD Session",
    category: "Narrative",
    phaseIds: [5],
    systemTags: ["dd_mgmt_prep"],
    requiresAny: ["p5_launch_structured_qna_tracker"],
    cost: 5,
    work: 13,
    complexity: "High",
    hiddenWorkRange: [4, 8],
    effects: {
      variables: { buyerConfidence: 8, issueContainment: 5, ddReadiness: 6, processMomentum: 3 }
    }
  },
  {
    id: "p5_retain_shaky_bidder",
    name: "Retain Shaky But Valuable Bidder",
    category: "Negotiation",
    phaseIds: [5],
    systemTags: ["dd_retain"],
    requiresDdLaneCounts: [{ kind: "risk", min: 1 }],
    cost: 4,
    work: 10,
    complexity: "Medium",
    hiddenWorkRange: [3, 6],
    effects: {
      variables: { fieldSurvival: 8, buyerConfidence: 6, ddPressure: -2 }
    }
  },
  {
    id: "p5_deprioritise_dd_heavy_buyer",
    name: "De-prioritise DD-Heavy Buyer",
    category: "Process Control",
    phaseIds: [5],
    systemTags: ["dd_prune"],
    requiresDdLaneCounts: [{ kind: "active", min: 3 }],
    cost: 2,
    work: 6,
    complexity: "Low",
    hiddenWorkRange: [1, 3],
    effects: {
      variables: { ddPressure: -10, fieldSurvival: -4, buyerConfidence: -2 }
    }
  },
  {
    id: "p5_final_dd_readiness_review",
    name: "Final DD Readiness Review",
    category: "Process Control",
    phaseIds: [5],
    systemTags: ["dd_final_readiness"],
    requiresAny: ["p5_build_mitigation_pack", "p5_prepare_management_dd_session", "p5_respond_to_buyer_question_pack"],
    requiresDdLaneCounts: [{ kind: "active", min: 2 }],
    cost: 4,
    work: 9,
    complexity: "Low",
    hiddenWorkRange: [2, 4],
    effects: {
      variables: { ddReadiness: 14, issueContainment: 6, buyerConfidence: 4 }
    }
  },
  {
    id: "p6_confirm_final_offer_receipt",
    name: "Confirm Final Offer Receipt",
    category: "Process Control",
    phaseIds: [6],
    systemTags: ["fo_collect"],
    requiresDdLaneCounts: [{ kind: "active", min: 2 }],
    cost: 3,
    work: 7,
    complexity: "Low",
    hiddenWorkRange: [2, 4],
    effects: {
      variables: { finalOfferStrength: 8, finalOfferComparability: 4, processMomentum: 3 }
    }
  },
  {
    id: "p6_compare_final_offer_values",
    name: "Compare Final Offer Values",
    category: "Information",
    phaseIds: [6],
    systemTags: ["fo_compare"],
    requiresFinalBidCounts: [{ kind: "submitted", min: 2 }],
    cost: 4,
    work: 9,
    complexity: "Low",
    hiddenWorkRange: [2, 4],
    effects: {
      variables: { finalOfferStrength: 10, finalOfferComparability: 8 }
    }
  },
  {
    id: "p6_score_executability",
    name: "Score Executability",
    category: "Risk Control",
    phaseIds: [6],
    systemTags: ["fo_execute_score"],
    requiresFinalBidCounts: [{ kind: "submitted", min: 2 }],
    requiresAny: ["p6_compare_final_offer_values"],
    cost: 6,
    work: 14,
    complexity: "High",
    hiddenWorkRange: [5, 9],
    effects: {
      variables: { executableCertainty: 12, falseWinnerRisk: -8, finalOfferComparability: 5 }
    }
  },
  {
    id: "p6_assess_conditional_drag",
    name: "Assess Hidden Conditional Drag",
    category: "Risk Control",
    phaseIds: [6],
    systemTags: ["fo_drag_assess"],
    requiresAny: ["p6_compare_final_offer_values"],
    cost: 5,
    work: 12,
    complexity: "High",
    hiddenWorkRange: [4, 8],
    effects: {
      variables: { finalOfferComparability: 10, falseWinnerRisk: -6, executableCertainty: 6 }
    }
  },
  {
    id: "p6_test_apparent_winner_robustness",
    name: "Test Apparent Winner Robustness",
    category: "Risk Control",
    phaseIds: [6],
    systemTags: ["fo_false_winner_test"],
    requiresAny: ["p6_score_executability", "p6_assess_conditional_drag"],
    cost: 6,
    work: 13,
    complexity: "High",
    hiddenWorkRange: [5, 8],
    effects: {
      variables: { falseWinnerRisk: -12, executableCertainty: 8 }
    }
  },
  {
    id: "p6_build_final_recommendation_matrix",
    name: "Build Final Recommendation Matrix",
    category: "Materials",
    phaseIds: [6],
    systemTags: ["fo_matrix"],
    requiresAny: ["p6_score_executability", "p6_assess_conditional_drag"],
    requiresFinalBidCounts: [{ kind: "analyzed", min: 2 }],
    cost: 4,
    work: 10,
    complexity: "Medium",
    hiddenWorkRange: [3, 6],
    effects: {
      variables: { finalOfferComparability: 12, executableCertainty: 5, processMomentum: 4 }
    }
  },
  {
    id: "p6_recommend_preferred_bidder",
    name: "Recommend Preferred Bidder",
    category: "Negotiation",
    phaseIds: [6],
    systemTags: ["fo_pick_preferred"],
    requiresAny: ["p6_build_final_recommendation_matrix"],
    requiresFinalBidCounts: [{ kind: "analyzed", min: 2 }],
    cost: 4,
    work: 9,
    complexity: "High",
    hiddenWorkRange: [3, 6],
    effects: {
      variables: { executableCertainty: 6, falseWinnerRisk: -4, processMomentum: 4 }
    }
  },
  {
    id: "p6_name_backup_bidder",
    name: "Name Backup Bidder",
    category: "Negotiation",
    phaseIds: [6],
    systemTags: ["fo_pick_backup"],
    requiresAny: ["p6_recommend_preferred_bidder", "p6_build_final_recommendation_matrix"],
    requiresFinalBidCounts: [{ kind: "submitted", min: 2 }],
    cost: 3,
    work: 7,
    complexity: "Low",
    hiddenWorkRange: [2, 4],
    effects: {
      variables: { backupBidderStrength: 10, processMomentum: 3 }
    }
  },
  {
    id: "p6_present_final_offer_recommendation",
    name: "Present Final-Offer Recommendation",
    category: "Narrative",
    phaseIds: [6],
    systemTags: ["fo_client_align"],
    requiresAny: ["p6_recommend_preferred_bidder"],
    cost: 5,
    work: 12,
    complexity: "High",
    hiddenWorkRange: [4, 7],
    effects: {
      variables: { clientAlignment: 8, executableCertainty: 4, falseWinnerRisk: -3 }
    }
  },
  {
    id: "p6_prepare_exclusivity_transition_pack",
    name: "Prepare Exclusivity Transition Pack",
    category: "Materials",
    phaseIds: [6],
    systemTags: ["fo_exclusivity_prepare"],
    requiresAny: ["p6_recommend_preferred_bidder", "p6_name_backup_bidder", "p6_present_final_offer_recommendation"],
    requiresFinalBidCounts: [{ kind: "preferred", min: 1 }],
    cost: 5,
    work: 11,
    complexity: "Medium",
    hiddenWorkRange: [3, 6],
    effects: {
      variables: { exclusivityReadiness: 14, executableCertainty: 4, processMomentum: 4 }
    }
  },
  {
    id: "p7_build_clause_priority_map",
    name: "Build Clause Priority Map",
    category: "Information",
    phaseIds: [7],
    systemTags: ["spa_map"],
    requiresFinalBidCounts: [{ kind: "preferred", min: 1 }],
    cost: 3,
    work: 8,
    complexity: "Low",
    hiddenWorkRange: [1, 3],
    effects: {
      variables: { legalControl: 10, residualLegalDrag: -8, clausePackageComplexity: -8 }
    }
  },
  {
    id: "p7_package_linked_issues",
    name: "Package Linked Issues",
    category: "Process Control",
    phaseIds: [7],
    systemTags: ["spa_package"],
    requiresAny: ["p7_build_clause_priority_map"],
    requiresFinalBidCounts: [{ kind: "preferred", min: 1 }],
    cost: 5,
    work: 13,
    complexity: "High",
    hiddenWorkRange: [5, 8],
    effects: {
      variables: { residualLegalDrag: -10, clausePackageComplexity: -12, signingReadiness: 5, legalControl: 6 }
    }
  },
  {
    id: "p7_push_back_on_aggressive_markup",
    name: "Push Back On Aggressive Markup",
    category: "Negotiation",
    phaseIds: [7],
    systemTags: ["spa_pushback"],
    requiresAny: ["p7_build_clause_priority_map", "p7_package_linked_issues"],
    requiresFinalBidCounts: [{ kind: "preferred", min: 1 }],
    cost: 4,
    work: 10,
    complexity: "Medium",
    hiddenWorkRange: [3, 6],
    effects: {
      variables: { clausePressure: -10, valueProtectionQuality: 5, preferredBidderStability: -6, legalControl: 4 }
    }
  },
  {
    id: "p7_accept_controlled_legal_compromise",
    name: "Accept Controlled Legal Compromise",
    category: "Negotiation",
    phaseIds: [7],
    systemTags: ["spa_concede"],
    requiresAny: ["p7_build_clause_priority_map"],
    requiresFinalBidCounts: [{ kind: "preferred", min: 1 }],
    cost: 2,
    work: 6,
    complexity: "Low",
    hiddenWorkRange: [1, 3],
    effects: {
      variables: {
        residualLegalDrag: -12,
        signingReadiness: 10,
        valueProtectionQuality: -8,
        concessionDiscipline: -4,
        preferredBidderStability: 4,
        falseClosureRisk: 6
      }
    }
  },
  {
    id: "p7_trade_concession_for_certainty",
    name: "Trade Concession For Certainty",
    category: "Negotiation",
    phaseIds: [7],
    systemTags: ["spa_trade"],
    requiresAny: ["p7_package_linked_issues", "p7_push_back_on_aggressive_markup"],
    requiresFinalBidCounts: [{ kind: "preferred", min: 1 }],
    cost: 6,
    work: 15,
    complexity: "High",
    hiddenWorkRange: [5, 9],
    effects: {
      variables: {
        residualLegalDrag: -14,
        signingReadiness: 12,
        valueProtectionQuality: -4,
        concessionDiscipline: 8,
        preferredBidderStability: 6,
        falseClosureRisk: -5
      }
    }
  },
  {
    id: "p7_tighten_fallback_signalling",
    name: "Tighten Fallback Signalling",
    category: "Process Control",
    phaseIds: [7],
    systemTags: ["spa_shadow"],
    requiresFinalBidCounts: [{ kind: "backup", min: 1 }],
    cost: 3,
    work: 9,
    complexity: "Medium",
    hiddenWorkRange: [2, 5],
    effects: {
      variables: { fallbackLeverage: 12, clausePressure: -6, preferredBidderStability: 4, backupBidderStrength: 4 }
    }
  },
  {
    id: "p7_brief_client_on_legal_tradeoffs",
    name: "Brief Client On Legal Trade-Offs",
    category: "Narrative",
    phaseIds: [7],
    systemTags: ["spa_client_brief"],
    requiresAny: ["p7_build_clause_priority_map", "p7_accept_controlled_legal_compromise"],
    cost: 4,
    work: 11,
    complexity: "High",
    hiddenWorkRange: [4, 7],
    effects: {
      variables: { clientAlignment: 8, concessionDiscipline: 6, clientValueSensitivity: -10, legalControl: 4 }
    }
  },
  {
    id: "p7_test_preferred_bidder_stability",
    name: "Test Preferred Bidder Stability",
    category: "Risk Control",
    phaseIds: [7],
    systemTags: ["spa_test_stability"],
    requiresFinalBidCounts: [{ kind: "preferred", min: 1 }],
    cost: 3,
    work: 8,
    complexity: "Low",
    hiddenWorkRange: [2, 4],
    effects: {
      variables: { preferredBidderStability: 4, falseClosureRisk: -2, legalControl: 3 }
    }
  },
  {
    id: "p7_build_signing_checklist",
    name: "Build Signing Checklist",
    category: "Process Control",
    phaseIds: [7],
    systemTags: ["spa_checklist"],
    requiresAny: ["p7_build_clause_priority_map", "p7_trade_concession_for_certainty"],
    requiresFinalBidCounts: [{ kind: "preferred", min: 1 }],
    cost: 4,
    work: 10,
    complexity: "Low",
    hiddenWorkRange: [2, 4],
    effects: {
      variables: { signingChecklistProgress: 32, signingReadiness: 6, legalControl: 5, processMomentum: 3 }
    }
  },
  {
    id: "p7_run_pre_signing_paper_review",
    name: "Run Pre-Signing Paper Review",
    category: "Risk Control",
    phaseIds: [7],
    systemTags: ["spa_review"],
    requiresAny: ["p7_build_signing_checklist", "p7_trade_concession_for_certainty"],
    requiresFinalBidCounts: [{ kind: "preferred", min: 1 }],
    cost: 8,
    work: 20,
    complexity: "High",
    hiddenWorkRange: [6, 10],
    effects: {
      variables: { falseClosureRisk: -14, paperFragility: -8, legalControl: 6, signingReadiness: 5, signingChecklistProgress: 20 }
    }
  },
  {
    id: "p7_finalize_signing_path",
    name: "Finalize Signing Path",
    category: "Process Control",
    phaseIds: [7],
    systemTags: ["spa_signing_path"],
    requiresAny: ["p7_build_signing_checklist", "p7_run_pre_signing_paper_review"],
    requiresFinalBidCounts: [{ kind: "preferred", min: 1 }],
    cost: 5,
    work: 12,
    complexity: "Medium",
    hiddenWorkRange: [3, 6],
    effects: {
      variables: { signingReadiness: 12, residualLegalDrag: -8, preferredBidderStability: 3, processMomentum: 4 }
    }
  },
  {
    id: "p8_run_signability_review",
    name: "Run Signability Review",
    category: "Risk Control",
    phaseIds: [8],
    systemTags: ["si_signability_review"],
    requiresFinalBidCounts: [{ kind: "preferred", min: 1 }],
    cost: 3,
    work: 10,
    complexity: "High",
    hiddenWorkRange: [4, 7],
    effects: {
      variables: { signability: 14, openItemMateriality: -8, realExecutionRisk: -8 }
    }
  },
  {
    id: "p8_close_signing_blockers",
    name: "Close Signing Blockers",
    category: "Process Control",
    phaseIds: [8],
    systemTags: ["si_close_blockers"],
    requiresAny: ["p8_run_signability_review"],
    requiresFinalBidCounts: [{ kind: "preferred", min: 1 }],
    cost: 4,
    work: 13,
    complexity: "High",
    hiddenWorkRange: [5, 8],
    effects: {
      variables: { openItemClosureRate: 18, openItemMateriality: -12, signingConfidence: 6 }
    }
  },
  {
    id: "p8_escalate_unresolved_signing_blocker",
    name: "Escalate Unresolved Signing Blocker",
    category: "Negotiation",
    phaseIds: [8],
    systemTags: ["si_escalate_blocker"],
    requiresAny: ["p8_close_signing_blockers", "p8_run_signability_review"],
    requiresFinalBidCounts: [{ kind: "preferred", min: 1 }],
    cost: 4,
    work: 12,
    complexity: "High",
    hiddenWorkRange: [5, 8],
    effects: {
      variables: { openItemClosureRate: 16, counterpartyAlignment: 6, executionDiscipline: 5, signingConfidence: 5 }
    }
  },
  {
    id: "p8_finalize_document_version",
    name: "Finalize Document Version",
    category: "Materials",
    phaseIds: [8],
    systemTags: ["si_finalize_version"],
    requiresAny: ["p8_run_signability_review"],
    requiresFinalBidCounts: [{ kind: "preferred", min: 1 }],
    cost: 2,
    work: 8,
    complexity: "Low",
    hiddenWorkRange: [2, 4],
    effects: {
      variables: { documentStability: 12, coordinationQuality: 6, signingConfidence: 4 }
    }
  },
  {
    id: "p8_reconcile_markup_mismatch",
    name: "Reconcile Markup Mismatch",
    category: "Process Control",
    phaseIds: [8],
    systemTags: ["si_reconcile_markup"],
    requiresAny: ["p8_finalize_document_version"],
    requiresFinalBidCounts: [{ kind: "preferred", min: 1 }],
    cost: 4,
    work: 12,
    complexity: "Medium",
    hiddenWorkRange: [4, 6],
    effects: {
      variables: { documentStability: 14, coordinationQuality: 8, ceremonyRisk: -6, signingTimingIntegrity: 4 }
    }
  },
  {
    id: "p8_lock_signature_version",
    name: "Lock Signature Version",
    category: "Process Control",
    phaseIds: [8],
    systemTags: ["si_lock_signature"],
    requiresAny: ["p8_reconcile_markup_mismatch"],
    requiresFinalBidCounts: [{ kind: "preferred", min: 1 }],
    cost: 3,
    work: 10,
    complexity: "High",
    hiddenWorkRange: [4, 7],
    effects: {
      variables: { documentStability: 18, executionDiscipline: 8, realExecutionRisk: -6, signingConfidence: 5 }
    }
  },
  {
    id: "p8_review_final_drafting_coherence",
    name: "Review Final Drafting Coherence",
    category: "Risk Control",
    phaseIds: [8],
    systemTags: ["si_review_coherence"],
    requiresAny: ["p8_lock_signature_version", "p8_reconcile_markup_mismatch"],
    requiresFinalBidCounts: [{ kind: "preferred", min: 1 }],
    cost: 5,
    work: 18,
    complexity: "High",
    hiddenWorkRange: [6, 10],
    effects: {
      variables: { signability: 16, realExecutionRisk: -14, ceremonyRisk: -5, signingConfidence: 6 }
    }
  },
  {
    id: "p8_sequence_final_approvals",
    name: "Sequence Final Approvals",
    category: "Process Control",
    phaseIds: [8],
    systemTags: ["si_sequence_approvals"],
    requiresAny: ["p8_finalize_document_version", "p8_reconcile_markup_mismatch"],
    requiresFinalBidCounts: [{ kind: "preferred", min: 1 }],
    cost: 2,
    work: 7,
    complexity: "Low",
    hiddenWorkRange: [2, 4],
    effects: {
      variables: { coordinationQuality: 10, counterpartyAlignment: 6, signingTimingIntegrity: 6, signingConfidence: 5 }
    }
  },
  {
    id: "p8_confirm_party_signoff_readiness",
    name: "Confirm Party Sign-Off Readiness",
    category: "Process Control",
    phaseIds: [8],
    systemTags: ["si_confirm_signoff"],
    requiresAny: ["p8_sequence_final_approvals"],
    requiresFinalBidCounts: [{ kind: "preferred", min: 1 }],
    cost: 2,
    work: 8,
    complexity: "Low",
    hiddenWorkRange: [2, 4],
    effects: {
      variables: { coordinationQuality: 8, ceremonyRisk: -8, signingConfidence: 8, counterpartyAlignment: 5 }
    }
  },
  {
    id: "p8_brief_client_before_signing",
    name: "Brief Client Before Signing",
    category: "Narrative",
    phaseIds: [8],
    systemTags: ["si_client_brief"],
    requiresAny: ["p8_sequence_final_approvals", "p8_confirm_party_signoff_readiness"],
    requiresFinalBidCounts: [{ kind: "preferred", min: 1 }],
    cost: 3,
    work: 10,
    complexity: "Medium",
    hiddenWorkRange: [3, 6],
    effects: {
      variables: { clientAlignment: 7, counterpartyAlignment: 4, executionDiscipline: 5, signingConfidence: 5 }
    }
  },
  {
    id: "p8_map_residual_obligations",
    name: "Map Residual Obligations",
    category: "Process Control",
    phaseIds: [8],
    systemTags: ["si_map_obligations"],
    requiresAny: ["p8_run_signability_review", "p8_close_signing_blockers"],
    requiresFinalBidCounts: [{ kind: "preferred", min: 1 }],
    cost: 3,
    work: 11,
    complexity: "Medium",
    hiddenWorkRange: [3, 6],
    effects: {
      variables: { closingPreparationQuality: 14, residualPostSigningFragility: -8, signingConfidence: 4 }
    }
  },
  {
    id: "p8_run_pre_closing_transition_review",
    name: "Run Pre-Closing Transition Review",
    category: "Risk Control",
    phaseIds: [8],
    systemTags: ["si_transition_review"],
    requiresAny: ["p8_map_residual_obligations", "p8_review_final_drafting_coherence"],
    requiresFinalBidCounts: [{ kind: "preferred", min: 1 }],
    cost: 4,
    work: 16,
    complexity: "High",
    hiddenWorkRange: [5, 9],
    effects: {
      variables: { closingPreparationQuality: 18, residualPostSigningFragility: -10, signability: 8, signingConfidence: 6 }
    }
  },
  {
    id: "p8_trigger_signature",
    name: "Trigger Signature",
    category: "Execution",
    phaseIds: [8],
    systemTags: ["si_trigger_signature"],
    requiresAny: ["p8_lock_signature_version", "p8_confirm_party_signoff_readiness", "p8_review_final_drafting_coherence"],
    requiresFinalBidCounts: [{ kind: "preferred", min: 1 }],
    cost: 3,
    work: 9,
    complexity: "Medium",
    hiddenWorkRange: [3, 6],
    effects: {
      variables: { signingConfidence: 10, coordinationQuality: 6, ceremonyRisk: -6, signingTimingIntegrity: 6 }
    }
  },
  {
    id: "p9_build_cp_tracker",
    name: "Build CP Tracker",
    category: "Process Control",
    phaseIds: [9],
    systemTags: ["cl_cp_tracker"],
    requiresFinalBidCounts: [{ kind: "preferred", min: 1 }],
    cost: 2,
    work: 15,
    complexity: "Low",
    hiddenWorkRange: [2, 4],
    effects: {
      variables: { cpCompletion: 6, cpDrag: -14, cpComplexity: -4, closingReadiness: 8, completionConfidence: 4 }
    }
  },
  {
    id: "p9_resequence_cp_dependencies",
    name: "Re-sequence CP Dependencies",
    category: "Process Control",
    phaseIds: [9],
    systemTags: ["cl_cp_resequence"],
    requiresAny: ["p9_build_cp_tracker"],
    requiresFinalBidCounts: [{ kind: "preferred", min: 1 }],
    cost: 2,
    work: 10,
    complexity: "Low",
    hiddenWorkRange: [2, 4],
    effects: {
      variables: { cpCompletion: 8, cpDrag: -12, delayRisk: -6, closingReadiness: 5, completionConfidence: 4 }
    }
  },
  {
    id: "p9_chase_critical_approval",
    name: "Chase Critical Approval",
    category: "Execution",
    phaseIds: [9],
    systemTags: ["cl_chase_approval"],
    requiresAny: ["p9_build_cp_tracker", "p9_resequence_cp_dependencies"],
    requiresFinalBidCounts: [{ kind: "preferred", min: 1 }],
    cost: 3,
    work: 15,
    complexity: "Medium",
    hiddenWorkRange: [4, 7],
    effects: {
      variables: { cpCompletion: 14, cpDrag: -4, completionConfidence: 6, delayRisk: -5, counterpartyAlignment: 3 }
    }
  },
  {
    id: "p9_escalate_blocked_condition",
    name: "Escalate Blocked Condition",
    category: "Negotiation",
    phaseIds: [9],
    systemTags: ["cl_escalate_blocked"],
    requiresAny: ["p9_chase_critical_approval", "p9_resequence_cp_dependencies"],
    requiresFinalBidCounts: [{ kind: "preferred", min: 1 }],
    cost: 4,
    work: 20,
    complexity: "High",
    hiddenWorkRange: [6, 10],
    effects: {
      variables: { cpCompletion: 16, cpDrag: -10, executionDiscipline: 5, counterpartyAlignment: 6, interimRisk: 2 }
    }
  },
  {
    id: "p9_review_closing_readiness",
    name: "Review Closing Readiness",
    category: "Risk Control",
    phaseIds: [9],
    systemTags: ["cl_review_readiness"],
    requiresAny: ["p9_build_cp_tracker", "p9_resequence_cp_dependencies", "p9_chase_critical_approval"],
    requiresFinalBidCounts: [{ kind: "preferred", min: 1 }],
    cost: 2,
    work: 10,
    complexity: "Low",
    hiddenWorkRange: [2, 4],
    effects: {
      variables: { closingReadiness: 14, completionConfidence: 10, delayRisk: -6, fundsFlowReadiness: 6 }
    }
  },
  {
    id: "p9_review_interim_stability",
    name: "Review Interim Stability",
    category: "Risk Control",
    phaseIds: [9],
    systemTags: ["cl_review_interim"],
    requiresFinalBidCounts: [{ kind: "preferred", min: 1 }],
    cost: 2,
    work: 10,
    complexity: "Medium",
    hiddenWorkRange: [3, 5],
    effects: {
      variables: { interimRisk: -10, interimStability: 12, valueIntegrity: 2, completionConfidence: 4 }
    }
  },
  {
    id: "p9_manage_buyer_nervousness",
    name: "Manage Buyer Nervousness",
    category: "Narrative",
    phaseIds: [9],
    systemTags: ["cl_manage_nervousness"],
    requiresAny: ["p9_review_interim_stability"],
    requiresFinalBidCounts: [{ kind: "preferred", min: 1 }],
    cost: 4,
    work: 20,
    complexity: "Medium",
    hiddenWorkRange: [5, 8],
    effects: {
      variables: { counterpartyAlignment: 10, interimRisk: -6, delayRisk: -4, completionConfidence: 5 }
    }
  },
  {
    id: "p9_push_counterparty_responsiveness",
    name: "Push Counterparty Responsiveness",
    category: "Negotiation",
    phaseIds: [9],
    systemTags: ["cl_push_responsive"],
    requiresAny: ["p9_review_closing_readiness", "p9_manage_buyer_nervousness"],
    requiresFinalBidCounts: [{ kind: "preferred", min: 1 }],
    cost: 3,
    work: 10,
    complexity: "Medium",
    hiddenWorkRange: [3, 6],
    effects: {
      variables: { counterpartyAlignment: 8, cpCompletion: 6, completionConfidence: 6, delayRisk: -4 }
    }
  },
  {
    id: "p9_contain_drift_concern",
    name: "Contain Drift Concern",
    category: "Risk Control",
    phaseIds: [9],
    systemTags: ["cl_contain_drift"],
    requiresAny: ["p9_review_interim_stability", "p9_manage_buyer_nervousness"],
    requiresFinalBidCounts: [{ kind: "preferred", min: 1 }],
    cost: 5,
    work: 25,
    complexity: "High",
    hiddenWorkRange: [7, 11],
    effects: {
      variables: { interimRisk: -12, interimStability: 10, valueIntegrity: 5, delayRisk: -5 }
    }
  },
  {
    id: "p9_confirm_payment_instructions",
    name: "Confirm Payment Instructions",
    category: "Execution",
    phaseIds: [9],
    systemTags: ["cl_confirm_payment"],
    requiresAny: ["p9_review_closing_readiness"],
    requiresFinalBidCounts: [{ kind: "preferred", min: 1 }],
    cost: 2,
    work: 10,
    complexity: "Low",
    hiddenWorkRange: [2, 4],
    effects: {
      variables: { fundsFlowReadiness: 18, paymentTimingIntegrity: 10, fundsFlowIntegrity: 8, completionConfidence: 4 }
    }
  },
  {
    id: "p9_coordinate_funds_release",
    name: "Coordinate Funds Release",
    category: "Execution",
    phaseIds: [9],
    systemTags: ["cl_coordinate_funds"],
    requiresAny: ["p9_confirm_payment_instructions"],
    requiresFinalBidCounts: [{ kind: "preferred", min: 1 }],
    cost: 3,
    work: 15,
    complexity: "High",
    hiddenWorkRange: [5, 9],
    effects: {
      variables: { fundsFlowReadiness: 20, fundsFlowIntegrity: 16, paymentTimingIntegrity: 12, delayRisk: -6, executionDiscipline: 6 }
    }
  },
  {
    id: "p9_resolve_signature_mismatch",
    name: "Resolve Signature Mismatch",
    category: "Process Control",
    phaseIds: [9],
    systemTags: ["cl_resolve_signature"],
    requiresAny: ["p9_confirm_payment_instructions", "p9_coordinate_funds_release"],
    requiresFinalBidCounts: [{ kind: "preferred", min: 1 }],
    cost: 4,
    work: 20,
    complexity: "High",
    hiddenWorkRange: [6, 10],
    effects: {
      variables: { signatureIntegrity: 20, fundsFlowIntegrity: 5, paymentTimingIntegrity: 4, delayRisk: -4 }
    }
  },
  {
    id: "p9_confirm_ownership_transfer",
    name: "Confirm Ownership Transfer",
    category: "Execution",
    phaseIds: [9],
    systemTags: ["cl_confirm_transfer"],
    requiresAny: ["p9_coordinate_funds_release"],
    requiresFinalBidCounts: [{ kind: "preferred", min: 1 }],
    cost: 1,
    work: 5,
    complexity: "Low",
    hiddenWorkRange: [1, 3],
    effects: {
      variables: { ownershipTransferReadiness: 24, fundsFlowIntegrity: 6, completionConfidence: 6 }
    }
  },
  {
    id: "p9_run_closing_day_coordination_check",
    name: "Run Closing-Day Coordination Check",
    category: "Risk Control",
    phaseIds: [9],
    systemTags: ["cl_coordination_check"],
    requiresAny: ["p9_confirm_payment_instructions", "p9_resolve_signature_mismatch"],
    requiresFinalBidCounts: [{ kind: "preferred", min: 1 }],
    cost: 2,
    work: 10,
    complexity: "Medium",
    hiddenWorkRange: [3, 6],
    effects: {
      variables: { paymentTimingIntegrity: 16, executionDiscipline: 8, fundsFlowReadiness: 8, signatureIntegrity: 8, delayRisk: -8 }
    }
  },
  {
    id: "p9_trigger_success_fee_realisation",
    name: "Trigger Success Fee Realisation",
    category: "Execution",
    phaseIds: [9],
    systemTags: ["cl_trigger_fee"],
    requiresAny: ["p9_confirm_ownership_transfer", "p9_coordinate_funds_release"],
    requiresFinalBidCounts: [{ kind: "preferred", min: 1 }],
    cost: 1,
    work: 5,
    complexity: "Low",
    hiddenWorkRange: [1, 3],
    effects: {
      variables: { feeRealisation: 30, outcomeIntegrity: 8, clientOutcomeSatisfaction: 6, rainmakerProgressImpact: 6 }
    }
  },
  {
    id: "p9_run_post_close_execution_review",
    name: "Run Post-Close Execution Review",
    category: "Narrative",
    phaseIds: [9],
    systemTags: ["cl_post_close_review"],
    requiresAny: ["p9_trigger_success_fee_realisation"],
    cost: 2,
    work: 10,
    complexity: "Low",
    hiddenWorkRange: [2, 4],
    effects: {
      variables: { reputationOutcome: 12, rainmakerProgressImpact: 14, outcomeIntegrity: 10 },
      team: { morale: 2 }
    }
  },
  {
    id: "p10_view_deal_log",
    name: "View Deal Log",
    category: "Review",
    phaseIds: [10],
    systemTags: ["rb_view_log"],
    cost: 0,
    work: 0,
    complexity: "Low",
    hiddenWorkRange: [0, 0],
    effects: {
      variables: { processMomentum: 2 }
    }
  },
  {
    id: "p10_export_results_summary",
    name: "Export Results Summary",
    category: "Review",
    phaseIds: [10],
    systemTags: ["rb_export_summary"],
    cost: 0,
    work: 0,
    complexity: "Low",
    hiddenWorkRange: [0, 0],
    effects: {
      variables: { reputationOutcome: 2, rainmakerProgressImpact: 2 }
    }
  },
  {
    id: "p10_start_next_mandate_brief",
    name: "Start Next Mandate Brief",
    category: "Review",
    phaseIds: [10],
    systemTags: ["rb_next_mandate"],
    cost: 0,
    work: 0,
    complexity: "Low",
    hiddenWorkRange: [0, 0],
    effects: {
      variables: { processMomentum: 3 },
      team: { morale: 2 },
      riskDebt: -1
    }
  }
];

function getTaskCompletionCount(state, taskId) {
  return state.runtime?.taskCompletions?.[taskId] ?? 0;
}

function countBuyersByStage(state, stage) {
  return state.buyers.filter((buyer) => buyer.stage === stage).length;
}

function countBuyersByShortlistStatus(state, status) {
  return state.buyers.filter((buyer) => buyer.shortlistStatus === status).length;
}

function countBuyersByOfferState(state, kind) {
  return state.buyers.filter((buyer) => {
    const offer = buyer.phase4Offer ?? {};
    if (kind === "submitted") return Boolean(offer.submitted);
    if (kind === "analyzed") return Boolean(offer.analyzed);
    if (kind === "advanced") return Boolean(offer.advanced);
    return false;
  }).length;
}

function countBuyersByDdLaneState(state, kind) {
  return state.buyers.filter((buyer) => {
    const lane = buyer.phase5Lane ?? {};
    if (kind === "active") return Boolean(lane.active) && lane.status !== "dropped";
    if (kind === "stable") return Boolean(lane.active) && lane.status === "stable";
    if (kind === "risk") return Boolean(lane.active) && ["risk", "conditional", "stressed"].includes(lane.status);
    if (kind === "dropped") return lane.status === "dropped";
    return false;
  }).length;
}

function countBuyersByFinalBidState(state, kind) {
  return state.buyers.filter((buyer) => {
    const bid = buyer.phase6Bid ?? {};
    if (kind === "submitted") return Boolean(bid.submitted);
    if (kind === "analyzed") return Boolean(bid.analyzed);
    if (kind === "preferred") return bid.role === "preferred";
    if (kind === "backup") return bid.role === "backup";
    return false;
  }).length;
}

function checkRequirements(state, action) {
  const reasons = [];

  if (Array.isArray(action.requiresAll) && action.requiresAll.length) {
    const missing = action.requiresAll.filter((taskId) => getTaskCompletionCount(state, taskId) <= 0);
    if (missing.length) reasons.push(`Requires all: ${missing.join(", ")}`);
  }

  if (Array.isArray(action.requiresAny) && action.requiresAny.length) {
    const hasAny = action.requiresAny.some((taskId) => getTaskCompletionCount(state, taskId) > 0);
    if (!hasAny) reasons.push(`Requires one of: ${action.requiresAny.join(", ")}`);
  }

  if (Array.isArray(action.requiresDeliverables) && action.requiresDeliverables.length) {
    action.requiresDeliverables.forEach((requirement) => {
      const deliverable = state.deliverables[requirement.id];
      const current = deliverable?.progress ?? 0;
      if (current < requirement.minProgress) {
        reasons.push(`Needs ${requirement.id} progress >= ${requirement.minProgress}`);
      }
    });
  }

  if (Array.isArray(action.requiresBuyerStageCounts) && action.requiresBuyerStageCounts.length) {
    action.requiresBuyerStageCounts.forEach((requirement) => {
      const current = countBuyersByStage(state, requirement.stage);
      if (current < requirement.min) {
        reasons.push(`Needs buyers at ${requirement.stage}: ${requirement.min}`);
      }
    });
  }

  if (Array.isArray(action.requiresShortlistCounts) && action.requiresShortlistCounts.length) {
    action.requiresShortlistCounts.forEach((requirement) => {
      const current = countBuyersByShortlistStatus(state, requirement.status);
      if (current < requirement.min) {
        reasons.push(`Needs buyers ${requirement.status}: ${requirement.min}`);
      }
    });
  }

  if (Array.isArray(action.requiresOfferCounts) && action.requiresOfferCounts.length) {
    action.requiresOfferCounts.forEach((requirement) => {
      const current = countBuyersByOfferState(state, requirement.kind);
      if (current < requirement.min) {
        reasons.push(`Needs offers ${requirement.kind}: ${requirement.min}`);
      }
    });
  }

  if (Array.isArray(action.requiresDdLaneCounts) && action.requiresDdLaneCounts.length) {
    action.requiresDdLaneCounts.forEach((requirement) => {
      const current = countBuyersByDdLaneState(state, requirement.kind);
      if (current < requirement.min) {
        reasons.push(`Needs DD lanes ${requirement.kind}: ${requirement.min}`);
      }
    });
  }

  if (Array.isArray(action.requiresFinalBidCounts) && action.requiresFinalBidCounts.length) {
    action.requiresFinalBidCounts.forEach((requirement) => {
      const current = countBuyersByFinalBidState(state, requirement.kind);
      if (current < requirement.min) {
        reasons.push(`Needs final bids ${requirement.kind}: ${requirement.min}`);
      }
    });
  }

  return reasons;
}

export function getActionAvailability(state, action) {
  const reasons = [];

  if (!action.phaseIds.includes(state.deal.phaseId)) {
    reasons.push("Not available in this phase");
  }

  if (state.runtime?.phase9Closed && action.phaseIds.includes(9)) {
    reasons.push("Deal already closed");
  }

  if (state.resources.budget < action.cost) {
    reasons.push(`Insufficient budget (${action.cost} required)`);
  }

  reasons.push(...checkRequirements(state, action));

  return {
    queueable: reasons.length === 0,
    reasons
  };
}

export function canExecuteAction(state, action) {
  return getActionAvailability(state, action);
}

export function getActionsForPhase(phaseId) {
  return ACTION_LIBRARY.filter((action) => action.phaseIds.includes(phaseId));
}

export function getActionById(actionId) {
  return ACTION_LIBRARY.find((action) => action.id === actionId) ?? null;
}



