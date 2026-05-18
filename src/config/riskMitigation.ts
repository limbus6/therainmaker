import type { Risk, PlayerResources } from '../types/game';

export interface RiskMitigationPlan {
  id: string;
  title: string;
  actions: string[];
  budgetCost: number;
  capacityCost: number;
  successChance: number; // 0..1
  catastrophicFailureChance?: number; // 0..1
  boardRecommendation?: {
    recommendation: 'proceed' | 'decline';
    rationale: string;
  };
  onSuccess: Partial<Record<keyof PlayerResources, number>> & { probabilityDelta?: number };
  onFailure: Partial<Record<keyof PlayerResources, number>> & { probabilityDelta?: number };
  catastrophicHeadline?: string;
  catastrophicDescription?: string;
}

function founderCommitmentPlans(): RiskMitigationPlan[] {
  return [
    {
      id: 'client_commitment_gate',
      title: 'Commitment Fee + Extended Discovery Sprint',
      actions: [
        'Propose a commitment fee for initial research.',
        'Run an additional market validation sprint with the internal team.',
        'Make the formal sale process contingent on accepting the commitment structure.',
      ],
      budgetCost: 0,
      capacityCost: 12,
      successChance: 0.62,
      catastrophicFailureChance: 0.18,
      onSuccess: { clientTrust: 6, dealMomentum: 5, riskLevel: -8, probabilityDelta: -25 },
      onFailure: { clientTrust: -8, dealMomentum: -4, riskLevel: 6, probabilityDelta: 10 },
      catastrophicHeadline: 'Client Walked After Commitment Ask',
      catastrophicDescription:
        'Ricardo rejected the commitment structure and terminated the engagement immediately.',
    },
    {
      id: 'external_reputational_dd',
      title: 'Reputational DD + External KIC',
      actions: [
        'Commission independent reputational due diligence.',
        'Bring in an external KIC advisor to validate commitment signals.',
        'Reframe the process proposal based on external evidence.',
      ],
      budgetCost: 5,
      capacityCost: 6,
      successChance: 0.76,
      onSuccess: { clientTrust: 4, dealMomentum: 4, reputation: 5, riskLevel: -7, probabilityDelta: -20 },
      onFailure: { budget: -1, dealMomentum: -2, riskLevel: 4, probabilityDelta: 8 },
    },
  ];
}

function competingAdvisorPlans(): RiskMitigationPlan[] {
  return [
    {
      id: 'fast_track_board_memo',
      title: 'Fast-Track Board Memo',
      actions: [
        'Draft accelerated board memo to move ahead of the rival advisor.',
        'Burn extra internal effort to compress the approval cycle.',
        'Ask the board to release you into full pitch mode immediately.',
      ],
      budgetCost: 0,
      capacityCost: 20,
      successChance: 0.58,
      boardRecommendation: {
        recommendation: 'proceed',
        rationale: 'We need to move now to stay ahead of the competing advisor.',
      },
      onSuccess: { dealMomentum: 7, reputation: 2, riskLevel: -5, probabilityDelta: -18 },
      onFailure: { dealMomentum: -5, morale: -4, riskLevel: 7, probabilityDelta: 10 },
    },
    {
      id: 'client_dinner_reset',
      title: 'Private Dinner With Client',
      actions: [
        'Meet Ricardo informally over dinner.',
        'Reinforce chemistry and show tailored attention.',
        'Probe whether the rival advisor is really converting trust into momentum.',
      ],
      budgetCost: 1,
      capacityCost: 4,
      successChance: 0.69,
      onSuccess: { clientTrust: 8, dealMomentum: 3, riskLevel: -4, probabilityDelta: -14 },
      onFailure: { clientTrust: -2, dealMomentum: -2, probabilityDelta: 6 },
    },
    {
      id: 'golf_club_invitation',
      title: 'Golf Club Invitation',
      actions: [
        'Invite Ricardo to a club setting to build personal rapport.',
        'Test whether he values social chemistry over pure advisor brand.',
        'Accept that the move can either unlock trust fast or backfire as tone-deaf.',
      ],
      budgetCost: 1,
      capacityCost: 3,
      successChance: 0.5,
      catastrophicFailureChance: 0.1,
      onSuccess: { clientTrust: 12, dealMomentum: 4, probabilityDelta: -16 },
      onFailure: { clientTrust: -6, reputation: -3, probabilityDelta: 8 },
      catastrophicHeadline: 'Client Rejected Social Positioning',
      catastrophicDescription:
        'Ricardo read the golf club invitation as superficial and misaligned. The relationship broke down immediately.',
    },
  ];
}

const CATEGORY_PLANS: Record<string, RiskMitigationPlan[]> = {
  client: [
    {
      id: 'stakeholder_alignment_sprint',
      title: 'Stakeholder Alignment Sprint',
      actions: [
        'Map decision-makers and client misalignment.',
        'Run 2 executive alignment sessions.',
        'Publish a formal weekly communication plan.',
      ],
      budgetCost: 2,
      capacityCost: 8,
      successChance: 0.74,
      onSuccess: { clientTrust: 7, dealMomentum: 4, riskLevel: -6, probabilityDelta: -18 },
      onFailure: { clientTrust: -4, dealMomentum: -3, riskLevel: 5, probabilityDelta: 8 },
    },
    {
      id: 'partner_intervention',
      title: 'Partner Intervention Track',
      actions: [
        'Bring a senior partner into critical meetings.',
        'Re-negotiate valuation and timeline expectations.',
        'Formalize governance with biweekly checkpoints.',
      ],
      budgetCost: 3,
      capacityCost: 6,
      successChance: 0.7,
      onSuccess: { clientTrust: 6, reputation: 3, riskLevel: -5, probabilityDelta: -15 },
      onFailure: { clientTrust: -5, riskLevel: 5, probabilityDelta: 8 },
    },
  ],
  buyer: [
    {
      id: 'buyer_reengagement_pack',
      title: 'Buyer Re-Engagement Pack',
      actions: [
        'Prepare a strategic response pack by buyer.',
        'Reopen 1:1 calls with decision-makers.',
        'Update the synergy-driven value rationale.',
      ],
      budgetCost: 2,
      capacityCost: 7,
      successChance: 0.71,
      onSuccess: { dealMomentum: 6, reputation: 2, riskLevel: -6, probabilityDelta: -16 },
      onFailure: { dealMomentum: -4, riskLevel: 6, probabilityDelta: 10 },
    },
    {
      id: 'targeted_management_roadshow',
      title: 'Targeted Management Roadshow',
      actions: [
        'Schedule a mini-roadshow with the management team.',
        'Cover technical objections in dedicated sessions.',
        'Refresh critical data points before follow-up.',
      ],
      budgetCost: 4,
      capacityCost: 10,
      successChance: 0.68,
      onSuccess: { dealMomentum: 7, clientTrust: 3, riskLevel: -5, probabilityDelta: -15 },
      onFailure: { morale: -4, dealMomentum: -3, riskLevel: 6, probabilityDelta: 9 },
    },
  ],
  diligence: [
    {
      id: 'dd_control_tower',
      title: 'DD Control Tower',
      actions: [
        'Create a DD war room with owners by topic.',
        'Enforce a 48h SLA for critical responses.',
        'Publish a daily blockers and decisions log.',
      ],
      budgetCost: 3,
      capacityCost: 9,
      successChance: 0.73,
      onSuccess: { dealMomentum: 4, riskLevel: -8, probabilityDelta: -20 },
      onFailure: { morale: -3, riskLevel: 6, probabilityDelta: 10 },
    },
    {
      id: 'specialist_gap_closure',
      title: 'Specialist Gap Closure',
      actions: [
        'Hire specialists for high-friction topics.',
        'Run an independent review of critical documentation.',
        'Close gaps with auditable evidence.',
      ],
      budgetCost: 5,
      capacityCost: 6,
      successChance: 0.78,
      onSuccess: { reputation: 4, riskLevel: -9, probabilityDelta: -22 },
      onFailure: { budget: -1, riskLevel: 5, probabilityDelta: 9 },
    },
  ],
  legal: [
    {
      id: 'legal_redline_sprint',
      title: 'Legal Redline Sprint',
      actions: [
        'Reinforce the legal team for an intensive redline sprint.',
        'Negotiate fallback clauses with buyer counsel.',
        'Set non-negotiable points with the client.',
      ],
      budgetCost: 4,
      capacityCost: 7,
      successChance: 0.7,
      onSuccess: { dealMomentum: 3, riskLevel: -7, probabilityDelta: -18 },
      onFailure: { dealMomentum: -3, riskLevel: 7, probabilityDelta: 10 },
    },
    {
      id: 'outside_counsel_escalation',
      title: 'Outside Counsel Escalation',
      actions: [
        'Escalate to specialist outside counsel.',
        'Obtain a written opinion on critical clause risks.',
        'Strengthen the negotiating position with precedents.',
      ],
      budgetCost: 5,
      capacityCost: 5,
      successChance: 0.75,
      onSuccess: { reputation: 3, riskLevel: -8, probabilityDelta: -20 },
      onFailure: { budget: -1, riskLevel: 5, probabilityDelta: 8 },
    },
  ],
  financing: [
    {
      id: 'financing_contingency_track',
      title: 'Financing Contingency Track',
      actions: [
        'Map alternative financing options in parallel.',
        'Update the buyer with a fallback structure.',
        'Protect the signing/closing timetable.',
      ],
      budgetCost: 3,
      capacityCost: 6,
      successChance: 0.69,
      onSuccess: { dealMomentum: 5, riskLevel: -6, probabilityDelta: -17 },
      onFailure: { dealMomentum: -4, riskLevel: 6, probabilityDelta: 10 },
    },
    {
      id: 'banking_advisor_fastlane',
      title: 'Banking Advisor Fastlane',
      actions: [
        'Bring in a debt/financing advisor for fast review.',
        'Secure additional comfort letters.',
        'Reduce last-mile retrading risk.',
      ],
      budgetCost: 5,
      capacityCost: 5,
      successChance: 0.74,
      onSuccess: { dealMomentum: 4, reputation: 2, riskLevel: -7, probabilityDelta: -18 },
      onFailure: { budget: -1, riskLevel: 5, probabilityDelta: 8 },
    },
  ],
  timing: [
    {
      id: 'critical_path_replan',
      title: 'Critical Path Replan',
      actions: [
        'Rebaseline the critical path with daily milestones.',
        'Remove non-essential dependencies.',
        'Redistribute the team for immediate unblock.',
      ],
      budgetCost: 2,
      capacityCost: 10,
      successChance: 0.72,
      onSuccess: { dealMomentum: 6, riskLevel: -6, probabilityDelta: -16 },
      onFailure: { morale: -4, riskLevel: 6, probabilityDelta: 10 },
    },
    {
      id: 'parallel_workstream_push',
      title: 'Parallel Workstream Push',
      actions: [
        'Run workstreams in parallel with dedicated owners.',
        'Increase governance cadence to twice per week.',
        'Close decisions within 24h for blocked items.',
      ],
      budgetCost: 3,
      capacityCost: 9,
      successChance: 0.7,
      onSuccess: { dealMomentum: 5, riskLevel: -5, probabilityDelta: -15 },
      onFailure: { morale: -5, dealMomentum: -3, probabilityDelta: 10 },
    },
  ],
  team: [
    {
      id: 'team_load_rebalancing',
      title: 'Team Load Rebalancing',
      actions: [
        'Rebalance load between senior and mid-level staff.',
        'Cut non-critical backlog for 1 week.',
        'Define a morale recovery path.',
      ],
      budgetCost: 1,
      capacityCost: 4,
      successChance: 0.77,
      onSuccess: { morale: 8, teamCapacity: 6, riskLevel: -5, probabilityDelta: -14 },
      onFailure: { morale: -3, riskLevel: 4, probabilityDelta: 8 },
    },
    {
      id: 'targeted_external_support',
      title: 'Targeted External Support',
      actions: [
        'Allocate external support to peak workload tasks.',
        'Protect the core team from burnout.',
        'Maintain critical output without sacrificing quality.',
      ],
      budgetCost: 4,
      capacityCost: 3,
      successChance: 0.74,
      onSuccess: { morale: 6, teamCapacity: 5, riskLevel: -5, probabilityDelta: -13 },
      onFailure: { budget: -1, morale: -2, probabilityDelta: 7 },
    },
  ],
  market: [
    {
      id: 'market_repositioning_memo',
      title: 'Market Repositioning Memo',
      actions: [
        'Reframe the equity story for an adverse macro backdrop.',
        'Update comparables and defensibility thesis.',
        'Recommunicate the narrative to active buyers.',
      ],
      budgetCost: 2,
      capacityCost: 7,
      successChance: 0.71,
      onSuccess: { dealMomentum: 4, reputation: 3, riskLevel: -5, probabilityDelta: -14 },
      onFailure: { dealMomentum: -4, riskLevel: 5, probabilityDelta: 9 },
    },
    {
      id: 'countercyclical_buyer_expansion',
      title: 'Counter-Cyclical Buyer Expansion',
      actions: [
        'Expand the universe to counter-cyclical buyers.',
        'Activate international coverage networks.',
        'Create an alternative shortlist to preserve competition.',
      ],
      budgetCost: 4,
      capacityCost: 8,
      successChance: 0.67,
      onSuccess: { dealMomentum: 6, reputation: 2, riskLevel: -4, probabilityDelta: -13 },
      onFailure: { dealMomentum: -3, riskLevel: 6, probabilityDelta: 9 },
    },
  ],
};

export function getRiskMitigationPlans(risk: Risk): RiskMitigationPlan[] {
  const name = risk.name.toLowerCase();
  if (name.includes('founder') && name.includes('serious')) {
    return founderCommitmentPlans();
  }
  if (name.includes('competing advisor') || name.includes('competitor')) {
    return competingAdvisorPlans();
  }
  return CATEGORY_PLANS[risk.category] ?? CATEGORY_PLANS.market;
}
