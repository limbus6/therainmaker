// ============================================
// Advisor Archetypes — M4 run identity
// ============================================
// Chosen once at run start. Every modifier is disclosed on the selection
// card and applied through visible, causally-labeled channels — archetypes
// never silently change numbers the UI promises elsewhere.

export type ArchetypeId = 'relationship_banker' | 'technician' | 'shark';
export type ArchetypeAbilityId = 'founder_call' | 'red_team_review' | 'reopen_tension';

export interface ArchetypeAbilityUse {
  abilityId: ArchetypeAbilityId;
  day: number;
  phase: number;
}

export interface AdvisorAbility {
  id: ArchetypeAbilityId;
  name: string;
  command: string;
  description: string;
  availability: string;
  effects: string[];
}

export interface AdvisorArchetype {
  id: ArchetypeId;
  name: string;
  tagline: string;
  /** Full-sentence effects, shown on the card — the contract with the player. */
  effects: string[];
  // One-time start modifiers
  startClientTrust: number;
  startReputation: number;
  startBuyerChemistry: number;
  // Structural modifiers (disclosed on card, applied at system entry points)
  deliverableWorkFactor: number;   // multiplies work on deliverable-category tasks
  negotiationPatienceBonus: number; // added to fee & SPA counterpart patience
  ability: AdvisorAbility;
}

export const ADVISOR_ARCHETYPES: AdvisorArchetype[] = [
  {
    id: 'relationship_banker',
    name: 'The Relationship Banker',
    tagline: 'You know everyone, and everyone returns your calls.',
    effects: [
      'The founder starts with more trust in you (+8).',
      'Every buyer opens warmer to the process (+5 chemistry).',
      'Active — Founder Call: once per mandate, spend 6 Capacity for +10 Trust.',
    ],
    startClientTrust: 8,
    startReputation: 0,
    startBuyerChemistry: 5,
    deliverableWorkFactor: 1,
    negotiationPatienceBonus: 0,
    ability: {
      id: 'founder_call',
      name: 'Founder Call',
      command: 'Call the founder now',
      description: 'Interrupt the process noise and give the founder a direct, candid read from the senior banker they chose.',
      availability: 'Available before closing while Trust is below 100 and the team has 6 Capacity.',
      effects: ['Client Trust +10', 'Team Capacity −6', 'One use per mandate'],
    },
  },
  {
    id: 'technician',
    name: 'The Technician',
    tagline: 'Your models are the ones other banks quietly copy.',
    effects: [
      'Document and deliverable work takes 15% less effort.',
      'Your reputation precedes you (+3).',
      'Active — Red-Team Review: once per mandate, spend 8 Capacity to cut Risk by 12 and pressure-test the leading live risk.',
    ],
    startClientTrust: 0,
    startReputation: 3,
    startBuyerChemistry: 0,
    deliverableWorkFactor: 0.85,
    negotiationPatienceBonus: 0,
    ability: {
      id: 'red_team_review',
      name: 'Red-Team Review',
      command: 'Red-team the analysis',
      description: 'Pull the model apart before a buyer does. The team concentrates its effort on the most dangerous unresolved assumption.',
      availability: 'Available in Preparation through SPA when a live risk remains and the team has 8 Capacity.',
      effects: ['Risk Level −12', 'Top live risk probability −25', 'Team Capacity −8', 'One use per mandate'],
    },
  },
  {
    id: 'shark',
    name: 'The Shark',
    tagline: 'Counterparties clear their calendars when you call.',
    effects: [
      'Negotiating counterparties bring more patience to the table (+15).',
      'Your reputation opens doors (+5) — though clients trust charm less (-3).',
      'Active — Reopen Tension: once in NBO/DD, lift every final offer by 4% at a cost of 7 Trust, 4 Capacity, and 3 Risk.',
    ],
    startClientTrust: -3,
    startReputation: 5,
    startBuyerChemistry: 0,
    deliverableWorkFactor: 1,
    negotiationPatienceBonus: 15,
    ability: {
      id: 'reopen_tension',
      name: 'Reopen Competitive Tension',
      command: 'Call the buyer field',
      description: 'Tell every credible bidder the process is still live. The pressure lifts price, but the founder sees exactly how hard you pushed.',
      availability: 'Available in NBO or DD with at least two live buyers, 7 Trust, and 4 Capacity.',
      effects: ['All final offers +4%', 'Client Trust −7', 'Team Capacity −4', 'Risk Level +3', 'One use per mandate'],
    },
  },
];

export function getArchetype(id: ArchetypeId | null | undefined): AdvisorArchetype | null {
  return ADVISOR_ARCHETYPES.find((archetype) => archetype.id === id) ?? null;
}
