// ============================================
// Mandate Market — M5a engagement conditions
// ============================================
// A mandate is the same craft under different weather: market conditions,
// IC scrutiny, and buyer temperature move with the difficulty profile and
// seed, so each engagement plays differently without forking the authored
// content. (True short-form mandates arrive with phase compression in 5a.2.)

import type { ArchetypeId } from './archetypes';
import type { MandateDifficultyProfile, PhaseId } from '../types/game';

export const FLAGSHIP_PHASE_SEQUENCE: readonly PhaseId[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
export const SHORT_MANDATE_PHASE_SEQUENCE: readonly PhaseId[] = [3, 5, 7, 8, 10];

export interface MandateDefinition {
  id: string;
  label: string;
  conditions: string;      // one-line market weather
  description: string;
  difficulty: MandateDifficultyProfile;
  /** Deterministic seed base; the run seed derives from this + career count. */
  seedBase: number;
  /** The authored process stages this mandate asks the player to operate. */
  phaseSequence: readonly PhaseId[];
}

export const MANDATE_POOL: MandateDefinition[] = [
  {
    id: 'solara-flagship',
    label: 'Solara Systems — The Flagship',
    conditions: 'Balanced market. The process you know, played straight.',
    description: 'Ricardo Mendes wants a full competitive process for his industrial IoT platform. Standard conditions, standard scrutiny — the benchmark mandate.',
    difficulty: { processBreadth: 50, timePressure: 50, diligenceBurden: 50, stakeholderVolatility: 50, buyerFragility: 50, overall: 50 },
    seedBase: 11071,
    phaseSequence: FLAGSHIP_PHASE_SEQUENCE,
  },
  {
    id: 'solara-headwinds',
    label: 'Solara Systems — Headwinds',
    conditions: 'Cautious buyers, a skeptical IC, and a founder who reads every headline.',
    description: 'Rates moved, comparables cooled, and every committee wants twice the comfort. The same company — in a market that makes you earn each yes.',
    difficulty: { processBreadth: 55, timePressure: 65, diligenceBurden: 70, stakeholderVolatility: 70, buyerFragility: 65, overall: 65 },
    seedBase: 22093,
    phaseSequence: SHORT_MANDATE_PHASE_SEQUENCE,
  },
  {
    id: 'solara-tailwinds',
    label: 'Solara Systems — Hot Market',
    conditions: 'Sector momentum, eager buyers, forgiving committees.',
    description: 'The sector is running and everyone wants exposure. A gentler process — and a chance to practise the craft with the wind behind you.',
    difficulty: { processBreadth: 45, timePressure: 40, diligenceBurden: 40, stakeholderVolatility: 35, buyerFragility: 35, overall: 38 },
    seedBase: 33017,
    phaseSequence: SHORT_MANDATE_PHASE_SEQUENCE,
  },
];

export function getMandate(id: string | null | undefined): MandateDefinition | null {
  return MANDATE_POOL.find((mandate) => mandate.id === id) ?? null;
}

export function getMandatePhaseSequence(id: string | null | undefined): readonly PhaseId[] {
  return getMandate(id)?.phaseSequence ?? FLAGSHIP_PHASE_SEQUENCE;
}

export function getFirstMandatePhase(id: string | null | undefined): PhaseId {
  return getMandatePhaseSequence(id)[0] ?? 0;
}

export function getNextMandatePhase(id: string | null | undefined, current: PhaseId): PhaseId | null {
  const sequence = getMandatePhaseSequence(id);
  return sequence.find((phase) => phase > current) ?? null;
}

export function getSkippedMandatePhases(
  id: string | null | undefined,
  current: PhaseId,
  next: PhaseId,
): PhaseId[] {
  const included = new Set(getMandatePhaseSequence(id));
  return FLAGSHIP_PHASE_SEQUENCE.filter((phase) => phase > current && phase < next && !included.has(phase));
}

export function isShortMandate(id: string | null | undefined): boolean {
  return getMandatePhaseSequence(id).length < FLAGSHIP_PHASE_SEQUENCE.length;
}

// --- Pending-mandate handoff -------------------------------------------------
// Starting a mandate resets the run via a full reload; the chosen mandate
// travels through localStorage and is consumed exactly once at store init.

const PENDING_KEY = 'ma-rainmaker-next-mandate';

export interface PendingMandate {
  id: string;
  seed: number;
  difficulty: MandateDifficultyProfile;
  careerReputationBonus: number;
  runMode?: 'career' | 'daily' | 'challenge';
  dailyKey?: string | null;
  dailySeason?: string | null;
  challengeCode?: string | null;
  challengeSeason?: string | null;
  challengeAttemptId?: string | null;
  startingReputationBonus?: number;
  advisorArchetype?: ArchetypeId | null;
}

export function stashPendingMandate(pending: PendingMandate): void {
  localStorage.setItem(PENDING_KEY, JSON.stringify(pending));
}

export function consumePendingMandate(): PendingMandate | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    if (!raw) return null;
    localStorage.removeItem(PENDING_KEY);
    const parsed = JSON.parse(raw) as PendingMandate;
    if (!parsed || typeof parsed.seed !== 'number' || typeof parsed.id !== 'string') return null;
    return parsed;
  } catch {
    return null;
  }
}
