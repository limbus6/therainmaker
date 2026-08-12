// ============================================
// Career Store — persistent across mandates (M5)
// ============================================
// Lives in its own localStorage key so starting a new mandate never touches
// it. Tombstones are the collection; career reputation is the slow currency
// that carries between engagements.

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  buildBeaconMarketTombstone,
  buildBeaconRunTombstone,
  type BeaconTombstone,
} from '../engine/beaconCareer';

export type { BeaconTombstone } from '../engine/beaconCareer';

export interface Tombstone {
  /** Dedupe key for the run (mandateId + run seed). */
  runKey: string;
  mandateId: string;
  mandateLabel: string;
  companyName: string;
  buyerName: string | null;      // null on a collapsed run
  closingValue: number;          // €M; 0 when the deal failed
  impliedMultiple: number | null;
  totalAdvisoryFee: number;      // €k
  grade: string;
  processScore: number;
  outcome: 'closed' | 'collapsed';
  archetype: string | null;
  daysTaken: number;
  completedAt: string;           // ISO date
}

export interface CareerState {
  tombstones: Tombstone[];
  /** 0-20: slow-earned, disclosed as a start bonus on mandate cards. */
  careerReputation: number;
  beaconTombstones: BeaconTombstone[];
  marketStep: number;
  recordMandate: (tombstone: Tombstone) => void;
  recordMarketDecision: (chosenMandateId: string, completedAt: string) => void;
  recordBeaconRun: (input: {
    playerRunKey: string;
    mandateId: string;
    playerOutcome: 'closed' | 'collapsed';
    seed: number;
    completedAt: string;
  }) => void;
}

function reputationDelta(tombstone: Tombstone): number {
  if (tombstone.outcome === 'collapsed') {
    // A well-run failure still teaches the market your name.
    return tombstone.processScore >= 70 ? 1 : -1;
  }
  // Closed deals earn by how well the process was run, not by luck.
  return tombstone.processScore >= 80 ? 3 : tombstone.processScore >= 60 ? 2 : 1;
}

export const useCareerStore = create<CareerState>()(
  persist(
    (set, get) => ({
      tombstones: [],
      careerReputation: 0,
      beaconTombstones: [],
      marketStep: 0,

      recordMandate: (tombstone) => {
        if (get().tombstones.some((existing) => existing.runKey === tombstone.runKey)) return;
        set((state) => ({
          tombstones: [...state.tombstones, tombstone].slice(-50),
          careerReputation: Math.max(0, Math.min(20, state.careerReputation + reputationDelta(tombstone))),
        }));
      },

      recordMarketDecision: (chosenMandateId, completedAt) => {
        const step = get().marketStep;
        const beaconTombstone = buildBeaconMarketTombstone(chosenMandateId, step, completedAt);
        set((state) => ({
          marketStep: state.marketStep + 1,
          beaconTombstones: beaconTombstone && !state.beaconTombstones.some((entry) => entry.runKey === beaconTombstone.runKey)
            ? [...state.beaconTombstones, beaconTombstone].slice(-50)
            : state.beaconTombstones,
        }));
      },

      recordBeaconRun: (input) => {
        const beaconTombstone = buildBeaconRunTombstone(input);
        if (!beaconTombstone || get().beaconTombstones.some((entry) => entry.runKey === beaconTombstone.runKey)) return;
        set((state) => ({
          beaconTombstones: [...state.beaconTombstones, beaconTombstone].slice(-50),
        }));
      },
    }),
    {
      name: 'ma-rainmaker-career',
      version: 2,
      migrate: (persistedState, fromVersion) => {
        const state = persistedState as Partial<CareerState>;
        if (fromVersion < 2) {
          return { ...state, beaconTombstones: [], marketStep: 0 } as CareerState;
        }
        return state as CareerState;
      },
    },
  ),
);
