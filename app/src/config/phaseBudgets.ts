// ============================================
// THE M&A RAINMAKER — Phase Budget Config
// ============================================
import type { PhaseId, StaffProfile, ContractorProfile } from '../types/game';

// Base budget injected at the start of each phase (k€)
export const PHASE_BASE_BUDGETS: Record<PhaseId, number> = {
  0: 20,  // Deal Origination
  1: 30,  // Pitch & Mandate
  2: 50,  // Preparation — heavy deliverable phase (VDD, CIM, financial model)
  3: 30,  // Market Outreach — outreach costs, NDA processing
  4: 15,  // Shortlist
  5: 20,  // Non-Binding Offers
  6: 45,  // Due Diligence — maximum work intensity, legal/external costs
  7: 20,  // Final Offers
  8: 25,  // SPA Negotiation
  9: 15,  // Signing
  10: 20, // Closing & Execution
};

// Budget request: approved below this threshold a warning shows
export const BUDGET_LOW_THRESHOLD = 10; // k€

// ─── Permanent Staff Profiles ──────────────────────────────────────────────

export interface StaffProfileConfig {
  id: StaffProfile;
  label: string;
  role: string;
  seniority: 'junior' | 'mid' | 'senior';
  hireCost: number;       // one-off k€
  capacityBoost: number;  // extra team capacity points
  skills: string[];
}

export const STAFF_PROFILES: StaffProfileConfig[] = [
  {
    id: 'junior_analyst',
    label: 'Junior Analyst',
    role: 'Analyst',
    seniority: 'junior',
    hireCost: 8,
    capacityBoost: 15,
    skills: ['Data Analysis', 'Research'],
  },
  {
    id: 'senior_analyst',
    label: 'Senior Analyst',
    role: 'Senior Analyst',
    seniority: 'mid',
    hireCost: 15,
    capacityBoost: 25,
    skills: ['Financial Modelling', 'Presentations'],
  },
  {
    id: 'associate',
    label: 'Associate',
    role: 'Associate',
    seniority: 'mid',
    hireCost: 20,
    capacityBoost: 30,
    skills: ['Client Management', 'Buyer Outreach'],
  },
  {
    id: 'external_advisor',
    label: 'External Advisor',
    role: 'External Advisor',
    seniority: 'senior',
    hireCost: 12,
    capacityBoost: 20,
    skills: ['Sector Expertise', 'Market Intelligence'],
  },
];

// ─── Contractor / Temp Capacity Profiles ───────────────────────────────────

export interface ContractorProfileConfig {
  id: ContractorProfile;
  label: string;
  weeklyRate: number;      // k€/week
  speedMultiplier: number; // applied to linked task's work remaining
  description: string;
}

export const CONTRACTOR_PROFILES: ContractorProfileConfig[] = [
  {
    id: 'freelance_analyst',
    label: 'Freelance Analyst',
    weeklyRate: 3,
    speedMultiplier: 1.3,
    description: 'Experienced freelancer. Reduces task time by 30%. Weekly cost: €3k.',
  },
  {
    id: 'secondment',
    label: 'Secondment',
    weeklyRate: 4,
    speedMultiplier: 1.4,
    description: 'Borrowed from partner firm. Reduces task time by 40%. Weekly cost: €4k.',
  },
  {
    id: 'external_specialist',
    label: 'External Specialist',
    weeklyRate: 5,
    speedMultiplier: 1.5,
    description: 'Domain expert. Reduces task time by 50%. Weekly cost: €5k.',
  },
];

// ─── Mitigation Actions Config ─────────────────────────────────────────────

import type { MitigationActionId } from '../types/game';

export interface MitigationActionConfig {
  id: MitigationActionId;
  label: string;
  description: string;
  category: 'relationship' | 'process';
  budgetCost: number; // k€
  effects: {
    clientTrust?: number;
    dealMomentum?: number;
    reputation?: number;
    pitchWeeksReduced?: number; // process accelerator only
  };
}

export const MITIGATION_ACTIONS: MitigationActionConfig[] = [
  {
    id: 'golf_padel_dinner',
    label: 'Golf, Padel or Dinner',
    description: 'Host an informal social event with the client. Builds personal rapport and reduces competitor appeal.',
    category: 'relationship',
    budgetCost: 3,
    effects: { clientTrust: 5, dealMomentum: 2 },
  },
  {
    id: 'client_reference_intro',
    label: 'Reference Client Introduction',
    description: 'Introduce the client to a past client or relevant investor for an informal reference conversation.',
    category: 'relationship',
    budgetCost: 2,
    effects: { clientTrust: 3, dealMomentum: 5, reputation: 2 },
  },
  {
    id: 'conference_invite',
    label: 'Conference Invitation',
    description: 'Invite the client to a sector conference where they meet buyers, advisors and peers. Demonstrates your network.',
    category: 'relationship',
    budgetCost: 4,
    effects: { clientTrust: 4, reputation: 6 },
  },
  {
    id: 'advance_pitch',
    label: 'Advance Pitch Delivery',
    description: 'Surge the team to compress the pitch preparation timeline. Saves 2 weeks on pitch delivery.',
    category: 'process',
    budgetCost: 0,
    effects: { pitchWeeksReduced: 2, dealMomentum: 4 },
  },
  {
    id: 'surge_staffing',
    label: 'Emergency Capacity Surge',
    description: 'Bring in temporary specialist capacity to accelerate pitch work. Saves 1 week, higher contractor cost.',
    category: 'process',
    budgetCost: 5,
    effects: { pitchWeeksReduced: 1, dealMomentum: 3 },
  },
];
