// ============================================
// Event Director Engine
// ============================================
// Fair, weighted, seeded event director replacing fixed-order random rolls.

import type { GameEvent, EventDirectorState, TensionCategory, PlayerResources, Risk, Email } from '../types/game';
import type { SeededRng } from './rng';

export interface EventDirectorConfig<TState = unknown> {
  id: string;
  phases: number[];
  baseProbability: number;
  weight?: number;          // Default: 1.0. Relative weight in weighted draw.
  cooldownDays?: number;    // Default: 14 days. Minimum days between triggers of this template.
  chainId?: string;         // Optional event chain identifier.
  chainStep?: number;       // Step number in the event chain (1, 2, 3...).
  tensionCategory?: TensionCategory; // 'danger' | 'pressure' | 'recovery' | 'agency'
  condition?: (state: TState) => boolean;
  generate: (state: TState, rng: SeededRng) => {
    event: GameEvent;
    resourceEffects?: Partial<PlayerResources>;
    riskGenerated?: Risk;
    emailGenerated?: Email;
  };
}

export function createInitialEventDirectorState(): EventDirectorState {
  return {
    tensionScore: 50,
    recoveryCounter: 0,
    activeThreatsCount: 0,
    lastEventDays: {},
    activeChains: {},
  };
}

export interface SelectionResult<TState = unknown> {
  selectedTemplates: EventDirectorConfig<TState>[];
  nextDirectorState: EventDirectorState;
}

/**
 * Selects 0 to maxEvents eligible events using weighted selection, seeded RNG,
 * cooldown enforcement, tension balancing, and chain progression.
 */
export function selectEvents<TState extends { phase: number; day: number; risks?: Risk[] }>(
  pool: EventDirectorConfig<TState>[],
  state: TState,
  directorState: EventDirectorState,
  daysElapsed: number,
  rng: SeededRng,
  maxEvents = 2
): SelectionResult<TState> {
  const currentDay = state.day;
  const nextDirectorState: EventDirectorState = {
    ...directorState,
    lastEventDays: { ...directorState.lastEventDays },
    activeChains: { ...directorState.activeChains },
  };

  // Count active unresolved major risks
  const activeMajorRisks = (state.risks || []).filter(
    (r) => !r.mitigated && !r.retired && (r.severity === 'high' || r.severity === 'critical')
  ).length;

  // Time-normalization multiplier (base probabilities are calibrated for 7-day advance)
  const timeFactor = Math.min(2.0, Math.max(0.14, daysElapsed / 7.0));

  // 1. Filter eligible templates
  const eligiblePool = pool.filter((tmpl) => {
    // Phase check
    if (!tmpl.phases.includes(state.phase)) return false;

    // Cooldown check (default 14 days cooldown)
    const cooldown = tmpl.cooldownDays ?? 14;
    const lastDay = nextDirectorState.lastEventDays[tmpl.id];
    if (lastDay !== undefined && currentDay - lastDay < cooldown) {
      return false;
    }

    // Cap: If active major unresolved threats exist, suppress additional 'danger' events
    if (activeMajorRisks >= 1 && tmpl.tensionCategory === 'danger') {
      return false;
    }

    // Condition check
    if (tmpl.condition && !tmpl.condition(state)) {
      return false;
    }

    return true;
  });

  if (eligiblePool.length === 0) {
    return { selectedTemplates: [], nextDirectorState };
  }

  // 2. Calculate dynamic weights for eligible templates
  const weightedCandidates = eligiblePool.map((tmpl) => {
    let weight = (tmpl.weight ?? 1.0) * tmpl.baseProbability * timeFactor;

    // Recovery mode boost: after 2 consecutive adverse events, favor recovery/agency
    if (nextDirectorState.recoveryCounter >= 2) {
      if (tmpl.tensionCategory === 'recovery' || tmpl.tensionCategory === 'agency') {
        weight *= 3.0;
      } else if (tmpl.tensionCategory === 'danger') {
        weight *= 0.2;
      }
    }

    // Chain progression priority boost
    if (tmpl.chainId && nextDirectorState.activeChains[tmpl.chainId]) {
      const activeChain = nextDirectorState.activeChains[tmpl.chainId];
      if (tmpl.chainStep === activeChain.currentStep + 1) {
        weight *= 2.5; // Boost next step in active chain
      }
    }

    return { tmpl, weight };
  });

  // 3. Perform weighted draws
  const selectedTemplates: EventDirectorConfig<TState>[] = [];
  const remainingCandidates = [...weightedCandidates];

  for (let i = 0; i < maxEvents; i++) {
    if (remainingCandidates.length === 0) break;

    const totalWeight = remainingCandidates.reduce((sum, c) => sum + c.weight, 0);
    if (totalWeight <= 0) break;

    // Check if any event triggers this slot (probabilistic trigger based on average candidate weight)
    const avgProb = Math.min(0.85, (totalWeight / remainingCandidates.length) * 1.2);
    if (!rng.nextBool(avgProb) && selectedTemplates.length > 0) {
      // First event is likely, second event is optional
      break;
    }

    const items = remainingCandidates.map((c) => c.tmpl);
    const weights = remainingCandidates.map((c) => c.weight);
    const chosen = rng.weightedPick(items, weights);

    if (!chosen) break;

    selectedTemplates.push(chosen);
    nextDirectorState.lastEventDays[chosen.id] = currentDay;

    // Track chain progress
    if (chosen.chainId && chosen.chainStep !== undefined) {
      nextDirectorState.activeChains[chosen.chainId] = {
        chainId: chosen.chainId,
        currentStep: chosen.chainStep,
        startedDay: currentDay,
      };
    }

    // Update tension & recovery tracking
    if (chosen.tensionCategory === 'danger' || chosen.tensionCategory === 'pressure') {
      nextDirectorState.recoveryCounter += 1;
      nextDirectorState.tensionScore = Math.min(100, nextDirectorState.tensionScore + 10);
    } else if (chosen.tensionCategory === 'recovery' || chosen.tensionCategory === 'agency') {
      nextDirectorState.recoveryCounter = 0;
      nextDirectorState.tensionScore = Math.max(0, nextDirectorState.tensionScore - 15);
    }

    // Remove chosen from remaining candidates for this turn
    const index = remainingCandidates.findIndex((c) => c.tmpl.id === chosen.id);
    if (index !== -1) {
      remainingCandidates.splice(index, 1);
    }
  }

  return { selectedTemplates, nextDirectorState };
}
