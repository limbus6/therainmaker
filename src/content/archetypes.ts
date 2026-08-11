// ============================================
// Advisor Archetypes — M4 run identity
// ============================================
// Chosen once at run start. Every modifier is disclosed on the selection
// card and applied through visible, causally-labeled channels — archetypes
// never silently change numbers the UI promises elsewhere.

export type ArchetypeId = 'relationship_banker' | 'technician' | 'shark';

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
}

export const ADVISOR_ARCHETYPES: AdvisorArchetype[] = [
  {
    id: 'relationship_banker',
    name: 'The Relationship Banker',
    tagline: 'You know everyone, and everyone returns your calls.',
    effects: [
      'Ricardo starts with more trust in you (+8).',
      'Every buyer opens warmer to the process (+5 chemistry).',
    ],
    startClientTrust: 8,
    startReputation: 0,
    startBuyerChemistry: 5,
    deliverableWorkFactor: 1,
    negotiationPatienceBonus: 0,
  },
  {
    id: 'technician',
    name: 'The Technician',
    tagline: 'Your models are the ones other banks quietly copy.',
    effects: [
      'Document and deliverable work takes 15% less effort.',
      'Your reputation precedes you (+3).',
    ],
    startClientTrust: 0,
    startReputation: 3,
    startBuyerChemistry: 0,
    deliverableWorkFactor: 0.85,
    negotiationPatienceBonus: 0,
  },
  {
    id: 'shark',
    name: 'The Shark',
    tagline: 'Counterparties clear their calendars when you call.',
    effects: [
      'Negotiating counterparties bring more patience to the table (+15).',
      'Your reputation opens doors (+5) — though clients trust charm less (-3).',
    ],
    startClientTrust: -3,
    startReputation: 5,
    startBuyerChemistry: 0,
    deliverableWorkFactor: 1,
    negotiationPatienceBonus: 15,
  },
];

export function getArchetype(id: ArchetypeId | null | undefined): AdvisorArchetype | null {
  return ADVISOR_ARCHETYPES.find((archetype) => archetype.id === id) ?? null;
}
