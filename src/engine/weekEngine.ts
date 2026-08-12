import type {
  GameTask,
  PlayerResources,
  Risk,
  Email,
  Headline,
  GameEvent,
  PhaseId,
  Buyer,
  BuyerInterest,
  TempCapacityAllocation,
  QualificationNote,
  UpcomingBeat,
} from '../types/game';
import type { GameStore } from '../store/gameStore';
import { isActiveRisk } from '../utils/gameplayState';
import { createRng, deriveSeed, type SeededRng } from './rng';
import { selectEvents, createInitialEventDirectorState, type EventDirectorConfig } from './eventDirector';
import type { EventDirectorState } from '../types/game';
import { getGoldenMandateUpcomingBeat, resolveGoldenMandateBeat } from './goldenMandate';
import { getPeopleUpcomingBeat, resolvePeopleBeat, PEOPLE_BEATS_CHAIN } from './peopleBeats';
import { EVENT_POOL } from '../content/events';
import { getNextMandatePhase } from '../content/mandates';

// ============================================
// Week Resolution Engine
// ============================================

export interface WeekResult {
  tasksCompleted: GameTask[];
  tasksProgressed: GameTask[];
  resourceChanges: Partial<PlayerResources>;
  newRisks: Risk[];
  newEmails: Email[];
  newHeadlines: Headline[];
  newEvents: GameEvent[];
  newQualificationNotes: Omit<QualificationNote, 'id' | 'week'>[];
  buyerChanges: BuyerChange[];
  hiddenWorkload: { taskId: string; description: string; extraWork: number } | null;
  criticalOutcomes: { taskId: string; taskName: string; type: 'success' | 'failure'; description: string; bonus: Partial<PlayerResources> }[];
  narrativeSummary: string;
  phaseProgressDelta: number;
  resolvedBudgetRequests: { id: string; approved: boolean; amount: number }[];
  resolvedBoardSubmission: { approved: boolean; notes: string } | null;
  newTasks?: GameTask[];
  /** How many calendar days this advance covered (1–7) */
  daysAdvanced: number;
  /** Internal: updated buyer array for store to apply */
  _updatedBuyers?: Buyer[];
  /** Internal: updated Event Director state for store to apply */
  nextDirectorState?: EventDirectorState;
  /** How many buyers submitted binding offers this advance (Phase 6 deadline trigger) */
  bindingOfferDelta: number;
  directorSignal: GameplayDirectorSignal;
  /** Reproduction metadata for development diagnostics. */
  rngTrace: { seed: number; draws: number; state: number };
}
export interface BuyerChange {
  buyerId: string;
  field: 'status' | 'interest';
  from: string;
  to: string;
}

export interface GameplayDirectorSignal {
  tensionBand: 'recovery' | 'steady' | 'live' | 'danger';
  pressureScore: number;
  eventBias: number;
  complicationBias: number;
  recoveryBias: number;
  headline: string;
  explanation: string;
  nextPressure: string;
}

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

function hashText(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createGameplayDirectorSignal(state: GameStore): GameplayDirectorSignal {
  const unresolvedRiskPressure = state.risks
    .filter(isActiveRisk)
    .reduce((total, risk) => total + (risk.severity === 'critical' ? 10 : risk.severity === 'high' ? 7 : risk.severity === 'medium' ? 4 : 2), 0);
  const inProgressWork = state.tasks
    .filter((task) => task.status === 'in_progress' && task.phase === state.phase)
    .reduce((total, task) => total + task.work, 0);
  const activeBuyers = state.buyers.filter((buyer) => !['dropped', 'excluded'].includes(buyer.status));
  const fragileBuyerCount = activeBuyers.filter((buyer) => buyer.interest === 'cold' || buyer.ddFriction === 'high').length;
  const urgentInboxPressure = state.emails.filter((email) => email.phase === state.phase && email.state !== 'resolved' && ['urgent', 'high'].includes(email.priority)).length * 3;
  const deadlinePressure = state.phaseDeadline && state.day <= state.phaseDeadline
    ? Math.max(0, 14 - (state.phaseDeadline - state.day))
    : 0;

  const resourceStress =
    Math.max(0, 55 - state.resources.dealMomentum) * 0.35 +
    Math.max(0, 55 - state.resources.clientTrust) * 0.25 +
    Math.max(0, 45 - state.resources.morale) * 0.25 +
    Math.max(0, state.resources.riskLevel - 35) * 0.45 +
    Math.max(0, inProgressWork - state.resources.teamCapacity * 0.45) * 0.35 +
    unresolvedRiskPressure +
    fragileBuyerCount * 3 +
    urgentInboxPressure +
    deadlinePressure;

  const pressureScore = Math.round(clamp(resourceStress));
  const tensionBand: GameplayDirectorSignal['tensionBand'] =
    pressureScore >= 72 ? 'danger'
      : pressureScore >= 48 ? 'live'
        : pressureScore <= 22 ? 'recovery'
          : 'steady';

  const eventBias = tensionBand === 'danger' ? 0.85 : tensionBand === 'live' ? 1.2 : tensionBand === 'recovery' ? 0.75 : 1;
  const complicationBias = tensionBand === 'danger' ? -0.1 : tensionBand === 'live' ? 0.08 : tensionBand === 'recovery' ? -0.12 : 0;
  const recoveryBias = tensionBand === 'danger' ? 0.18 : tensionBand === 'recovery' ? -0.04 : 0;

  const headline = tensionBand === 'danger'
    ? 'The deal is under strain, but the market is still giving you recovery routes.'
    : tensionBand === 'live'
      ? 'The process feels alive: buyers, risks and deadlines are all moving at once.'
      : tensionBand === 'recovery'
        ? 'The desk is quieter, giving the team room to prepare and regain control.'
        : 'The transaction is in a healthy tension band.';

  const explanation = tensionBand === 'danger'
    ? 'The director will dampen random punishment and surface stabilising chances so the run does not spiral unfairly.'
    : tensionBand === 'live'
      ? 'The director will allow more organic movement and light complications while preserving player agency.'
      : tensionBand === 'recovery'
        ? 'The director will keep surprise workload low and reward preparation, avoiding dead time.'
        : 'The director will keep events varied without making the week feel chaotic.';

  const nextPressure = state.phase >= 6
    ? 'Keep DD scope, buyer confidence and SPA discipline under control.'
    : state.phase >= 3
      ? 'Protect buyer momentum while avoiding process leaks and overloading the team.'
      : 'Build credibility quickly without burning budget or client trust.';

  return {
    tensionBand,
    pressureScore,
    eventBias,
    complicationBias,
    recoveryBias,
    headline,
    explanation,
    nextPressure,
  };
}

interface TaskProgressResult {
  outcome: 'completed' | 'progressed';
  progress: number;
}

// Progress accumulates on every advance. Small variance keeps timing organic,
// while persistent progress prevents a task from failing the same random roll forever.
function resolveTaskProgress(
  task: GameTask,
  rng: SeededRng,
  tempAllocations: TempCapacityAllocation[] = [],
  daysToAdvance: number = 7,
  budget: number = 0,
  paceCompletionMult: number = 1.0,
): TaskProgressResult {
  const alloc = tempAllocations.find((a) =>
    a.taskId === task.id && (a.phase === undefined || a.phase === task.phase)
  );
  const contractorCost = alloc ? alloc.weeklyRate * (daysToAdvance / 7) : 0;
  const contractorFunded = !!alloc && budget >= contractorCost;
  const speedMultiplier = contractorFunded ? alloc.speedMultiplier : 1;
  const baseDailyProgress = task.complexity === 'low' ? 100 : task.complexity === 'medium' ? 26 : 17;
  const workloadFactor = clamp(10 / Math.max(task.work, 6), 0.75, 1.2);
  const timingVariance = rng.nextFloat(0.9, 1.1);
  const increment = daysToAdvance * baseDailyProgress * workloadFactor * speedMultiplier * paceCompletionMult * timingVariance;
  const progress = Math.min(100, Math.round(((task.progress ?? 0) + increment) * 10) / 10);

  return {
    outcome: progress >= 100 ? 'completed' : 'progressed',
    progress,
  };
}

// Hidden workload check — some tasks trigger surprise extra work
function checkHiddenWorkload(
  completedTasks: GameTask[],
  directorSignal: GameplayDirectorSignal,
  rng: SeededRng,
): WeekResult['hiddenWorkload'] {
  for (const task of completedTasks) {
    // Higher complexity = higher chance of hidden workload
    const baseChance = task.complexity === 'high' ? 0.34 : task.complexity === 'medium' ? 0.16 : 0.04;
    const chance = clamp((baseChance + directorSignal.complicationBias) * 100, 2, 42) / 100;
    if (rng.nextBool(chance)) {
      const descriptions = [
        `${task.name} revealed inconsistencies that require additional clean-up.`,
        `Partner review of ${task.name} flagged items requiring revision.`,
        `Client requested additional detail following ${task.name} output.`,
        `Quality check on ${task.name} surfaced gaps in the underlying data.`,
        `${task.name} triggered a cascade review of three related documents.`,
        `A third party introduced via ${task.name} returned with 12 detailed questions.`,
        `${task.name} output was well-received but created appetite for a follow-on deliverable.`,
        `Scope of ${task.name} expanded mid-delivery — additional sign-off required.`,
      ];
      return {
        taskId: task.id,
        description: descriptions[rng.nextInt(0, descriptions.length - 1)],
        extraWork: Math.ceil(task.work * rng.nextFloat(0.2, 0.5)),
      };
    }
  }
  return null;
}

// Critical outcome roll — tasks can occasionally deliver exceptional or poor results
type CriticalOutcome = { taskId: string; taskName: string; type: 'success' | 'failure'; description: string; bonus: Partial<PlayerResources> };

function translateDerivedMomentumEffect(effects: Partial<PlayerResources>): Partial<PlayerResources> {
  const { dealMomentum, ...causalEffects } = effects;
  if (typeof dealMomentum === 'number' && dealMomentum !== 0) {
    causalEffects.riskLevel = (causalEffects.riskLevel ?? 0) - Math.round(dealMomentum / 2);
  }
  return causalEffects;
}

function rollCriticalOutcomes(
  completedTasks: GameTask[],
  rng: SeededRng,
  morale: number = 50,
  directorSignal: GameplayDirectorSignal | undefined,
): CriticalOutcome[] {
  const outcomes: CriticalOutcome[] = [];

  const successPool: Record<string, { description: string; bonus: Partial<PlayerResources> }[]> = {
    deliverable: [
      { description: 'Exceptional quality — client shared the output with their board as a benchmark document.', bonus: { clientTrust: 8, dealMomentum: 5, morale: 3 } },
      { description: 'Deliverable praised by buyer advisors — positions the process as highly professional.', bonus: { reputation: 6, dealMomentum: 4, morale: 2 } },
    ],
    relationship: [
      { description: 'Chemistry exceeded all expectations — the counterpart requested an exclusive relationship going forward.', bonus: { clientTrust: 10, reputation: 5, morale: 4 } },
      { description: 'Relationship meeting produced an unexpected referral to a second strategic buyer.', bonus: { dealMomentum: 8, reputation: 4, morale: 3 } },
    ],
    market: [
      { description: 'Intelligence uncovered a premium buyer previously outside the target list — immediately added to outreach.', bonus: { dealMomentum: 10, morale: 2 } },
      { description: 'Market work surfaced a sector thesis that materially strengthens valuation positioning.', bonus: { dealMomentum: 6, clientTrust: 4, morale: 2 } },
    ],
    internal: [
      { description: 'Process streamlined ahead of schedule — team capacity freed for higher-priority work.', bonus: { morale: 8, dealMomentum: 3 } },
      { description: 'Internal review produced an insight that pre-empts a likely buyer objection.', bonus: { reputation: 5, riskLevel: -6, morale: 3 } },
    ],
    strategic: [
      { description: 'Strategic initiative landed with unusual force — deal momentum accelerated significantly.', bonus: { dealMomentum: 12, clientTrust: 6, morale: 5 } },
      { description: 'Client reacted with visible relief and confidence — trust elevated beyond expectations.', bonus: { clientTrust: 12, morale: 5 } },
    ],
    external_advisor: [
      { description: 'External advisor delivered a report that resolves a key risk the team had been tracking.', bonus: { riskLevel: -10, dealMomentum: 4, morale: 2 } },
    ],
  };

  const failurePool: { description: string; bonus: Partial<PlayerResources> }[] = [
    { description: 'Work product contained an error discovered post-delivery — had to issue a correction with apologies.', bonus: { reputation: -5, clientTrust: -4, morale: -3, riskLevel: 3 } },
    { description: 'Stakeholder interaction went off-script — relationship requires deliberate rebuilding over the coming days.', bonus: { clientTrust: -6, dealMomentum: -4, morale: -4, riskLevel: 4 } },
    { description: 'Deliverable released prematurely — had to be recalled and revised under time pressure.', bonus: { morale: -5, reputation: -4, riskLevel: 5 } },
    { description: 'Outcome fell short of the brief — client flagged disappointment and requested a revised approach.', bonus: { clientTrust: -7, dealMomentum: -3, morale: -3, riskLevel: 3 } },
  ];

  for (const task of completedTasks) {
    // Probability based on complexity and morale
    const baseSuccessChance = task.complexity === 'high' ? 0.12 : task.complexity === 'medium' ? 0.08 : 0.04;
    const baseFailChance = task.complexity === 'high' ? 0.07 : task.complexity === 'medium' ? 0.04 : 0.01;

    // Morale factor: higher morale increases success chance, decreases failure chance
    const moraleFactor = (morale / 100) * 0.2;
    const directorRecovery = directorSignal?.recoveryBias ?? 0;
    const directorComplication = directorSignal?.complicationBias ?? 0;
    const successChance = Math.min(0.32, baseSuccessChance + moraleFactor + Math.max(0, directorRecovery * 0.35));
    const failChance = Math.max(0.01, baseFailChance - moraleFactor * 0.5 + Math.max(0, directorComplication * 0.25) - Math.max(0, directorRecovery * 0.3));

    const roll = rng.next();

    if (roll < successChance) {
      const pool = successPool[task.category] ?? successPool['internal'];
      const pick = pool[rng.nextInt(0, pool.length - 1)];
      outcomes.push({
        taskId: task.id,
        taskName: task.name,
        type: 'success',
        ...pick,
        bonus: translateDerivedMomentumEffect(pick.bonus),
      });
    } else if (roll < successChance + failChance) {
      const pick = failurePool[rng.nextInt(0, failurePool.length - 1)];
      outcomes.push({
        taskId: task.id,
        taskName: task.name,
        type: 'failure',
        ...pick,
        bonus: translateDerivedMomentumEffect(pick.bonus),
      });
    }
  }

  return outcomes;
}

// Calculate resource consumption, scaled to the number of days advanced
function calculateResourceConsumption(
  inProgressTasks: GameTask[],
  resources: PlayerResources,
  daysToAdvance: number = 7,
): Partial<PlayerResources> {
  const scale = daysToAdvance / 7;
  let workLoad = 0;

  for (const task of inProgressTasks) {
    const weeklyWork = task.complexity === 'low' ? task.work : Math.ceil(task.work / 2);
    workLoad += weeklyWork * scale;
  }

  const capacityUsed = Math.min(workLoad, 25 * scale);
  const newCapacity = Math.max(0, resources.teamCapacity - capacityUsed);

  // Morale thresholds scale with days so feel is proportional
  const moraleDelta = workLoad > 25 * scale ? -4 * scale
    : workLoad > 18 * scale ? -2 * scale
    : workLoad > 10 * scale ? 0
    : workLoad > 0 ? 2 * scale
    : 3 * scale; // idle = recovery

  return {
    teamCapacity: Math.min(resources.teamCapacityMax, newCapacity + 8 * scale),
    morale: Math.max(0, Math.min(100, Math.round(resources.morale + moraleDelta))),
  };
}

// Calculate momentum and trust changes based on completed tasks
function calculateStateChanges(
  completedTasks: GameTask[],
  resources: PlayerResources,
): Partial<PlayerResources> {
  let trustDelta = 0;

  for (const task of completedTasks) {
    // Parse effect summary for rough deltas
    if (task.category === 'relationship') {
      trustDelta += 5;
    } else if (task.category === 'deliverable') {
      trustDelta += 2;
    } else if (task.category === 'strategic') {
      trustDelta += 3;
    }
  }

  return {
    clientTrust: Math.max(0, Math.min(100, resources.clientTrust + trustDelta)),
  };
}

// Generate narrative summary
function generateSummary(
  result: Omit<WeekResult, 'narrativeSummary' | '_updatedBuyers' | 'criticalOutcomes' | 'directorSignal' | 'rngTrace'> & { criticalOutcomes: CriticalOutcome[] },
  _week: number,
  directorSignal: GameplayDirectorSignal,
  rng: SeededRng,
): string {
  const parts: string[] = [];
  parts.push(directorSignal.headline);

  if (result.tasksCompleted.length > 0) {
    const names = result.tasksCompleted.slice(0, 3).map((t) => t.name).join(', ');
    const extra = result.tasksCompleted.length > 3 ? ` plus ${result.tasksCompleted.length - 3} more` : '';
    parts.push(`Execution moved: ${names}${extra}.`);
  }

  if (result.tasksProgressed.length > 0) {
    parts.push(`${result.tasksProgressed.length} workstream${result.tasksProgressed.length > 1 ? 's' : ''} kept moving but need another pass.`);
  }

  if (result.hiddenWorkload) {
    parts.push(`Complication: ${result.hiddenWorkload.description}`);
  }

  if (result.resourceChanges.budget !== undefined) {
    parts.push(`Budget and team capacity shifted with the workplan.`);
  }

  if (result.newRisks.length > 0) {
    parts.push(`New risk identified: ${result.newRisks[0].name}.`);
  }

  // Buyer changes
  const statusChanges = result.buyerChanges.filter((c) => c.field === 'status');
  const interestChanges = result.buyerChanges.filter((c) => c.field === 'interest');
  if (statusChanges.length > 0) {
    const label = statusChanges.length === 1
      ? `1 buyer status update.`
      : `${statusChanges.length} buyer status updates.`;
    parts.push(label);
  }
  if (interestChanges.length > 0) {
    parts.push(`${interestChanges.length} buyer sentiment signal${interestChanges.length > 1 ? 's' : ''} changed.`);
  }

  // Events
  if (result.newEvents.length > 0) {
    parts.push(`Event: ${result.newEvents[0].title}.`);
  }

  // Critical outcomes
  const crits = result.criticalOutcomes;
  if (crits.some((c) => c.type === 'success')) {
    parts.push(`Exceptional outcome on ${crits.find((c) => c.type === 'success')!.taskName}.`);
  }
  if (crits.some((c) => c.type === 'failure')) {
    parts.push(`Setback on ${crits.find((c) => c.type === 'failure')!.taskName} — requires attention.`);
  }

  if (parts.length === 0) {
    const quietLines = [
      'A quiet stretch. The team is standing by for direction.',
      'No major developments. Momentum holds steady.',
      'Routine progress. The deal remains on track.',
      'Calm period — good time to prepare for the next phase.',
    ];
    parts.push(quietLines[rng.nextInt(0, quietLines.length - 1)]);
  }

  parts.push(`Next pressure: ${directorSignal.nextPressure}`);

  return parts.join(' ');
}

// ============================================
// Buyer Progression Engine
// ============================================

const INTEREST_ORDER: BuyerInterest[] = ['cold', 'lukewarm', 'warm', 'hot', 'on_fire'];


function progressBuyers(
  buyers: Buyer[],
  completedTasks: GameTask[],
  phase: number,
  momentum: number,
  rng: SeededRng,
): { buyers: Buyer[]; changes: BuyerChange[] } {
  if (buyers.length === 0) return { buyers, changes: [] };

  const changes: BuyerChange[] = [];
  const completedIds = new Set(completedTasks.map((t) => t.id));

  const updated = buyers.map((buyer) => {
    const newBuyer = { ...buyer };

    // Phase 3: Outreach progression
    if (phase === 3) {
      // Outreach launched → buyers become contacted
      if (buyer.status === 'identified' && completedIds.has('task-40')) {
        const oldStatus = buyer.status;
        newBuyer.status = 'contacted';
        changes.push({ buyerId: buyer.id, field: 'status', from: oldStatus, to: 'contacted' });
      }

      // NDAs processed → some contacted buyers sign NDAs
      if (buyer.status === 'contacted' && completedIds.has('task-42')) {
        // Higher execution credibility = higher chance of signing
        const signChance = (buyer.executionCredibility / 100) * 0.7 + (momentum / 100) * 0.3;
        if (rng.nextBool(signChance)) {
          newBuyer.status = 'nda_signed';
          changes.push({ buyerId: buyer.id, field: 'status', from: 'contacted', to: 'nda_signed' });
        }
      }

      // CIM access granted → NDA-signed buyers start reviewing
      if (buyer.status === 'nda_signed' && completedIds.has('task-43')) {
        newBuyer.status = 'reviewing';
        changes.push({ buyerId: buyer.id, field: 'status', from: 'nda_signed', to: 'reviewing' });
      }

      // Buyer qualification → reviewing buyers become active
      if (buyer.status === 'reviewing' && completedIds.has('task-48')) {
        newBuyer.status = 'active';
        changes.push({ buyerId: buyer.id, field: 'status', from: 'reviewing', to: 'active' });
      }
    }

    // Phase 4: Shortlist progression
    if (phase === 4) {
      if (buyer.status === 'active' && completedIds.has('task-61')) {
        if (buyer.executionCredibility >= 70) {
          newBuyer.status = 'shortlisted';
          changes.push({ buyerId: buyer.id, field: 'status', from: 'active', to: 'shortlisted' });
        }
      }
      if (buyer.status === 'active' && completedIds.has('task-62')) {
        if (buyer.executionCredibility < 70 && buyer.interest !== 'hot') {
          newBuyer.status = 'excluded';
          changes.push({ buyerId: buyer.id, field: 'status', from: 'active', to: 'excluded' });
        }
      }
    }

    // Phase 5: NBO — shortlisted buyers start bidding
    if (phase === 5) {
      if (buyer.status === 'shortlisted' && completedIds.has('task-70')) {
        newBuyer.status = 'bidding';
        changes.push({ buyerId: buyer.id, field: 'status', from: 'shortlisted', to: 'bidding' });
      }
    }

     // Phase 7: Final Offers — bidding buyers become preferred/excluded
     if (phase === 7) {
       if (buyer.status === 'bidding') {
         // Preferred bidder selection
         const preferredSelected = completedTasks.some((t) => t.name.toLowerCase().includes('recommend preferred'));
         if (preferredSelected && buyer.executionCredibility >= 80) {
           newBuyer.status = 'preferred';
           changes.push({ buyerId: buyer.id, field: 'status', from: 'bidding', to: 'preferred' });
         }
       }
     }

    // Interest warming — buyers warm up based on momentum and phase engagement
    if (newBuyer.status !== 'dropped' && newBuyer.status !== 'excluded') {
      const currentIdx = INTEREST_ORDER.indexOf(newBuyer.interest);
      if (currentIdx < INTEREST_ORDER.length - 1) {
        // Chance to warm up: momentum-driven + random
        const warmChance = momentum > 60 ? 0.25 : momentum > 40 ? 0.15 : 0.05;
        if (rng.nextBool(warmChance)) {
          const oldInterest = newBuyer.interest;
          newBuyer.interest = INTEREST_ORDER[currentIdx + 1];
          changes.push({ buyerId: buyer.id, field: 'interest', from: oldInterest, to: newBuyer.interest });
        }
      }

      // Interest cooling — low momentum cools buyers
      if (momentum < 30 && currentIdx > 0 && rng.nextBool(0.15)) {
        const oldInterest = newBuyer.interest;
        newBuyer.interest = INTEREST_ORDER[currentIdx - 1];
        changes.push({ buyerId: buyer.id, field: 'interest', from: oldInterest, to: newBuyer.interest });
      }

      // Unpredictable mood swings — buyers can act independently of momentum
      // "Cold feet" — 4% chance any active buyer cools unexpectedly
      if (currentIdx > 1 && rng.nextBool(0.04)) {
        const oldInterest = newBuyer.interest;
        newBuyer.interest = INTEREST_ORDER[currentIdx - 1];
        changes.push({ buyerId: buyer.id, field: 'interest', from: oldInterest, to: newBuyer.interest });
      }
      // "Breakthrough interest" — 3% chance a lukewarm/warm buyer jumps two levels
      if (currentIdx >= 1 && currentIdx <= 2 && rng.nextBool(0.03)) {
        const jumpIdx = Math.min(currentIdx + 2, INTEREST_ORDER.length - 1);
        const oldInterest = newBuyer.interest;
        newBuyer.interest = INTEREST_ORDER[jumpIdx];
        changes.push({ buyerId: buyer.id, field: 'interest', from: oldInterest, to: newBuyer.interest });
      }
    }

    return newBuyer;
  });

  return { buyers: updated, changes };
}

// ============================================
// Event definitions live in src/content/events; this engine owns selection and integration.

function rollEvents(
  state: GameStore,
  daysToAdvance: number,
  directorSignal: GameplayDirectorSignal,
  rng: SeededRng,
): {
  events: GameEvent[];
  resourceEffects: Partial<PlayerResources>;
  risks: Risk[];
  emails: Email[];
  nextDirectorState?: EventDirectorState;
} {
  const directorState = state.eventDirectorState || createInitialEventDirectorState();

  const directorPool: EventDirectorConfig<GameStore>[] = EVENT_POOL.map((t) => ({
    id: t.id,
    phases: t.phases,
    baseProbability: t.probability,
    condition: t.condition,
    generate: (s, eventRng) => t.generate(s, eventRng),
  }));

  const maxEvents = directorSignal.tensionBand === 'danger' ? 1 : directorSignal.tensionBand === 'live' ? 3 : 2;
  const { selectedTemplates, nextDirectorState } = selectEvents(
    directorPool,
    state,
    directorState,
    daysToAdvance,
    rng,
    maxEvents
  );

  const result = {
    events: [] as GameEvent[],
    resourceEffects: {} as Record<string, number>,
    risks: [] as Risk[],
    emails: [] as Email[],
    nextDirectorState,
  };

  const firedIds = new Set(state.events.map((e) => e.id));

  for (const template of selectedTemplates) {
    const generated = template.generate(state, rng);

    if (firedIds.has(generated.event.id)) continue;
    firedIds.add(generated.event.id);

    result.events.push(generated.event);

    if (generated.resourceEffects) {
      for (const [k, v] of Object.entries(generated.resourceEffects)) {
        result.resourceEffects[k] = (result.resourceEffects[k] ?? 0) + (v as number);
      }
    }

    if (generated.riskGenerated) {
      result.risks.push(generated.riskGenerated);
    }

    if (generated.emailGenerated) {
      result.emails.push(generated.emailGenerated);
    }
  }

  return result;
}

// ============================================
// Main Week Resolution Function
// ============================================

export function resolveWeek(state: GameStore, daysToAdvance: number = 7): WeekResult {
  const inProgressTasks = state.tasks.filter((t) => t.status === 'in_progress' && t.phase === state.phase);
  const newDay = state.day + daysToAdvance;
  const newWeek = Math.ceil(newDay / 7);
  const directorSignal = createGameplayDirectorSignal(state);
  const turnSeed = deriveSeed(
    state.rngSeed,
    state.day,
    state.phase,
    daysToAdvance,
    state.eventDirectorState?.tensionScore ?? 0,
  );
  const rng = createRng(turnSeed);

  const weekPace = state.weekPace ?? 'standard';
  const paceCompletionMult = weekPace === 'sprint' ? 1.35 : weekPace === 'deliberate' ? 0.75 : 1.0;
  const paceMoraleDelta   = weekPace === 'sprint' ? -5  : weekPace === 'deliberate' ? 7   : 0;
  const paceContractorMult = weekPace === 'sprint' ? 1.25 : weekPace === 'deliberate' ? 0.8  : 1.0;

  // 1. Resolve task progress
  const tasksCompleted: GameTask[] = [];
  const tasksProgressed: GameTask[] = [];

  for (const task of inProgressTasks) {
    const result = resolveTaskProgress(task, rng, state.tempCapacityAllocations, daysToAdvance, state.resources.budget, paceCompletionMult);
    const progressedTask = { ...task, progress: result.progress };
    if (result.outcome === 'completed') {
      tasksCompleted.push(progressedTask);
    } else {
      tasksProgressed.push(progressedTask);
    }
  }

  // 2. Calculate resource consumption
  const resourceConsumption = calculateResourceConsumption(inProgressTasks, state.resources, daysToAdvance);

  // Contractors are the only recurring task cost. Charge once and pro-rate it.
  const contractorSpend = state.tempCapacityAllocations
    .filter((alloc) => (
      (alloc.phase === undefined || alloc.phase === state.phase) &&
      inProgressTasks.some((task) => task.id === alloc.taskId)
    ))
    .reduce((sum, alloc) => sum + alloc.weeklyRate * (daysToAdvance / 7) * paceContractorMult, 0);
  if (contractorSpend > 0) {
    resourceConsumption.budget = Math.max(
      0,
      Math.round((state.resources.budget - contractorSpend) * 100) / 100,
    );
  }

  // 3. Calculate state changes from completions
  const stateChanges = calculateStateChanges(tasksCompleted, state.resources);

  // 4. Check for hidden workload
  const hiddenWorkload = checkHiddenWorkload(tasksCompleted, directorSignal, rng);

  // 4b. Roll critical outcomes for completed tasks
  const criticalOutcomes = rollCriticalOutcomes(tasksCompleted, rng, state.resources.morale, directorSignal);

  // 4c. Generate qualification notes for Phase 0 tasks
  const newQualificationNotes: Omit<QualificationNote, 'id' | 'week'>[] = [];
  if (state.phase === 0) {
    for (const task of tasksCompleted) {
      // General macro tasks → market context note
      if (task.id === 'task-gen-02') { // Research Market Momentum
        newQualificationNotes.push({
          source: 'team_research',
          content: 'Market momentum research complete. Current M&A environment shows elevated activity in tech-enabled services and SaaS verticals. Multiples remain healthy at 8-14x EBITDA for quality assets.',
          sentiment: 'positive',
        });
      }
      // Target-specific investigation tasks → company-specific notes
      if (task.id.startsWith('task-investigate-') && task.id.endsWith('-company')) {
        const lead = state.leads.find(l => task.id.includes(l.id));
        if (lead) {
          newQualificationNotes.push({
            source: 'team_research',
            content: `Company screening complete for ${lead.companyName}. Financial profile verified and sector fit confirmed. Deal fundamentals look credible for a structured process.`,
            sentiment: 'positive',
          });
        }
      }
      if (task.id.startsWith('task-investigate-') && task.id.endsWith('-shareholder')) {
        const lead = state.leads.find(l => task.id.includes(l.id));
        if (lead) {
          newQualificationNotes.push({
            source: 'meeting',
            content: `Shareholder assessment complete for ${lead.companyName}. Founder appears motivated and timeline is realistic. Valuation expectations are within market range.`,
            sentiment: 'neutral',
          });
        }
      }
    }
  }

  // 5. Combine all resource changes
  const resourceChanges: Partial<PlayerResources> = {
    ...resourceConsumption,
    ...stateChanges,
  };

  // Risk is a causal input to derived momentum and must be established before
  // critical outcomes add their own named mitigation or pressure.
  const riskDelta = hiddenWorkload ? 5 : (tasksCompleted.length > 0 ? -2 : 1);
  resourceChanges.riskLevel = Math.max(0, Math.min(100, state.resources.riskLevel + riskDelta));

  // 5b. Apply critical outcome bonuses/penalties
  for (const crit of criticalOutcomes) {
    for (const [key, delta] of Object.entries(crit.bonus)) {
      const k = key as keyof PlayerResources;
      const current = (resourceChanges[k] as number | undefined) ?? state.resources[k];
      if (typeof current === 'number' && typeof delta === 'number') {
        const maxVal = k === 'teamCapacity' ? state.resources.teamCapacityMax : k === 'budget' ? state.resources.budgetMax : 100;
        (resourceChanges as Record<string, number>)[k] = Math.max(0, Math.min(maxVal, current + (delta as number)));
      }
    }
  }

  // 7. Buyer progression
  const buyerResult = progressBuyers(state.buyers, tasksCompleted, state.phase, state.resources.dealMomentum, rng);

  // 9. Event system
  const eventResult = rollEvents(state, daysToAdvance, directorSignal, rng);

  // V1's authored Golden Mandate beats are scheduled and telegraphed before
  // they resolve. They sit alongside (rather than inside) the weighted pool so
  // a setup can never be silently skipped by a random draw.
  const goldenBeat = resolveGoldenMandateBeat(state, newDay);
  if (goldenBeat) {
    eventResult.events.unshift(goldenBeat.event);
    if (goldenBeat.email) eventResult.emails.unshift(goldenBeat.email);
    const currentDirector = eventResult.nextDirectorState ?? state.eventDirectorState ?? createInitialEventDirectorState();
    eventResult.nextDirectorState = {
      ...currentDirector,
      activeChains: {
        ...currentDirector.activeChains,
        [goldenBeat.event.chainId!]: {
          chainId: goldenBeat.event.chainId!,
          currentStep: goldenBeat.event.chainStep!,
          startedDay: currentDirector.activeChains[goldenBeat.event.chainId!]?.startedDay ?? newDay,
        },
      },
    };
    if (goldenBeat.resourceEffects) {
      for (const [key, value] of Object.entries(goldenBeat.resourceEffects)) {
        const resource = key as keyof PlayerResources;
        eventResult.resourceEffects[resource] = (eventResult.resourceEffects[resource] ?? 0) + (value ?? 0);
      }
    }
  }

  // M2 people beats follow the same authored-lane rule as the golden arc:
  // scheduled, telegraphed, never subject to the weighted random pool.
  const peopleBeat = resolvePeopleBeat(state, newDay);
  if (peopleBeat) {
    eventResult.events.unshift(peopleBeat.event);
    eventResult.emails.unshift(peopleBeat.email);
    const currentDirector = eventResult.nextDirectorState ?? state.eventDirectorState ?? createInitialEventDirectorState();
    eventResult.nextDirectorState = {
      ...currentDirector,
      activeChains: {
        ...currentDirector.activeChains,
        [PEOPLE_BEATS_CHAIN]: {
          chainId: PEOPLE_BEATS_CHAIN,
          currentStep: (currentDirector.activeChains[PEOPLE_BEATS_CHAIN]?.currentStep ?? 0) + 1,
          startedDay: currentDirector.activeChains[PEOPLE_BEATS_CHAIN]?.startedDay ?? newDay,
        },
      },
    };
  }

  // 9b. Resolve pending budget requests (Board decision)
  const resolvedRequests: { id: string; approved: boolean; amount: number; justification: string }[] = [];
  for (const req of state.budgetRequests) {
    if (req.status === 'pending') {
      // Logic: Higher client trust, lower risk, and phase context increase approval chance
      // Base: 50% + (clientTrust / 100) * 30% - (riskLevel / 100) * 20%
      const trustFactor = (state.resources.clientTrust / 100) * 0.3;
      const riskFactor = (state.resources.riskLevel / 100) * 0.2;
      const phaseFactor = state.phase >= 3 ? 0.1 : 0; // Easier to approve in later phases
      const approvalChance = Math.max(0.1, Math.min(0.9, 0.5 + trustFactor - riskFactor + phaseFactor));
      const approved = rng.nextBool(approvalChance);
      const approvedAmount = approved ? req.amount : 0;

      // Generate reasoning
      let reasoning = '';
      if (approved) {
        if (trustFactor > 0.2) reasoning = 'Strong client trust supports additional investment.';
        else if (phaseFactor > 0) reasoning = 'Deal progression justifies additional resources.';
        else reasoning = 'Budget allocation approved by committee.';
      } else {
        if (riskFactor > 0.1) reasoning = 'Risk level too high for additional spend.';
        else if (state.resources.budget < req.amount) reasoning = 'Insufficient budget available.';
        else reasoning = 'Committee prefers to focus on core workstreams.';
      }

      resolvedRequests.push({ id: req.id, approved, amount: approvedAmount, justification: req.justification });

      // Generate email from "The Board"
      eventResult.emails.push({
        id: `email-budget-${req.id}`,
        week: newWeek,
        phase: state.phase,
        sender: 'Investment Committee',
        senderRole: 'Clearwater Partners',
        subject: approved ? 'Budget Request Approved' : 'Budget Request Declined',
        body: approved
          ? `The Board has reviewed your request for €${req.amount}k regarding: "${req.justification}". \n\nReasoning: ${reasoning}\n\nGiven the current deal trajectory, we have approved this additional allocation. Spend it wisely.`
          : `We have reviewed your request for €${req.amount}k. \n\nReasoning: ${reasoning}\n\nAt this stage, the Committee is not convinced that additional spend is justified. Focus on the core workstreams.`,
        preview: approved ? 'Budget request approved...' : 'Budget request declined...',
        category: 'partner',
        state: 'unread',
        priority: approved ? 'high' : 'urgent',
        timestamp: `Week ${newWeek}, Monday`,
      });

      if (approved) {
        resourceChanges.budget = (resourceChanges.budget ?? state.resources.budget) + approvedAmount;
      }
    }
  }

  // 9c. Resolve pending board submission (Phase 0)
  let resolvedBoardSubmission: WeekResult['resolvedBoardSubmission'] | null = null;
  if (state.phase === 0 && state.boardSubmission && state.boardSubmission.status === 'pending') {
    // Base approval chance — starts at 65% so a reasonably prepared player usually gets through
    let approvalChance = 0.65;

    // + momentum bonus (up to +15%)
    approvalChance += (state.resources.dealMomentum / 100) * 0.15;

    // + reputation bonus (up to +10%)
    approvalChance += (state.resources.reputation / 100) * 0.10;

    // + qualification note quality bonus
    const qualNotes = state.qualificationNotes ?? [];
    const positiveNotes = qualNotes.filter((n) => n.sentiment === 'positive').length;
    const negativeNotes = qualNotes.filter((n) => n.sentiment === 'negative').length;
    approvalChance += Math.min(0.15, positiveNotes * 0.05); // up to +15%
    approvalChance -= Math.min(0.15, negativeNotes * 0.05); // up to -15%

    // Penalty if player recommended "decline" (they're telling the board it's bad)
    if (state.boardSubmission.recommendation === 'decline') approvalChance -= 0.40;

    // Penalty if submitting with very few notes (unprepared)
    if (qualNotes.length === 0) approvalChance -= 0.30;
    else if (qualNotes.length === 1) approvalChance -= 0.10;

    // Hard floor: always at least 20% chance if they recommend 'proceed'
    if (state.boardSubmission.recommendation === 'proceed') {
      approvalChance = Math.max(0.20, approvalChance);
    }
    approvalChance = Math.min(0.95, approvalChance); // cap at 95%

    // Pity ladder: repeated rejections cannot invalidate honest preparation.
    // Each prior rejection adds +20%; after two rejections a 'proceed'
    // submission backed by real evidence (3+ notes) is approved outright —
    // the dice may delay the mandate, never kill it.
    const priorRejections = state.boardRejectionCount ?? 0;
    approvalChance = Math.min(0.98, approvalChance + priorRejections * 0.20);
    if (
      priorRejections >= 2 &&
      state.boardSubmission.recommendation === 'proceed' &&
      qualNotes.length >= 3
    ) {
      approvalChance = 1;
    }

    const approved = approvalChance >= 1 ? true : rng.nextBool(approvalChance);

    const notes = approved
      ? "The Investment Committee has reviewed the Solara Systems opportunity. The qualification signals and sector dynamics support the case for mandate. We approve — proceed to formal pitch and fee negotiation."
      : qualNotes.length < 2
        ? "The Investment Committee is not convinced at this stage. The qualification package is thin — we need stronger research signals and clearer investment rationale before committing. Strengthen the case and resubmit."
        : negativeNotes > positiveNotes
          ? "The Committee notes significant concerns surfaced during qualification. The risk profile as presented outweighs the upside. Address the key concerns and resubmit with a clearer mitigation narrative."
          : "The mandate falls short of the IC threshold at this stage. Deal momentum and reputation signals need to improve. Continue building the case and resubmit when the position is stronger.";

    resolvedBoardSubmission = { approved, notes };

    eventResult.emails.push({
      id: `email-board-decision-${state.week}`,
      week: newWeek,
      phase: 0,
      sender: 'Marcus Aldridge',
      senderRole: 'Managing Partner',
      subject: approved ? 'Solara Mandate: APPROVED' : 'Solara Mandate: DECLINED',
      body: notes,
      preview: approved ? 'Mandate approved by IC...' : 'Mandate declined by IC...',
      category: 'partner',
      state: 'unread',
      priority: 'urgent',
      timestamp: `Week ${newWeek}, Monday`,
    });
  }
  for (const [key, value] of Object.entries(eventResult.resourceEffects)) {
    const k = key as keyof PlayerResources;
    if (k === 'dealMomentum') {
      const currentRisk = resourceChanges.riskLevel ?? state.resources.riskLevel;
      resourceChanges.riskLevel = Math.max(0, Math.min(100, currentRisk - Math.round((value as number) / 2)));
    } else if (k === 'budget') {
      // Budget effects are additive (can be negative cost)
      resourceChanges.budget = (resourceChanges.budget ?? state.resources.budget) + (value as number);
      resourceChanges.budget = Math.max(0, resourceChanges.budget);
    } else {
      const current = (resourceChanges[k] as number | undefined) ?? state.resources[k];
      if (typeof current === 'number') {
        const maxVal = k === 'teamCapacity' ? state.resources.teamCapacityMax : 100;
        (resourceChanges as Record<string, number>)[k] = Math.max(0, Math.min(maxVal, current + (value as number)));
      }
    }
  }

  // Pace: morale adjustment
  if (paceMoraleDelta !== 0) {
    const currentMorale = (resourceChanges.morale as number | undefined) ?? state.resources.morale;
    resourceChanges.morale = Math.max(0, Math.min(100, currentMorale + paceMoraleDelta));
  }
  // ─── Phase 6: Staggered binding-offer window ─────────────────────────────────
  // Each buyer receives a deterministic due day inside the DD window. Credible
  // offers therefore land across multiple advances; the formal deadline remains
  // the final evaluation point for buyers that did not submit early.
  let bindingOfferDelta = 0;
  const updatedBuyersAfterDeadline = [...state.buyers];
  if (state.phase === 6 && state.phaseDeadline !== null) {
    const totalCats = state.dataroomCategories.length;
    const openCats = state.dataroomCategories.filter((category) => category.accessLevel === 'full' || category.accessLevel === 'partial').length;
    const dataroomScore = totalCats > 0 ? openCats / totalCats : 0;
    const riskPenalty = Math.max(0, (state.resources.riskLevel - 40) / 100 * 0.4);

    const dropoutProbability = (buyer: Buyer) => {
      let dropoutP = 0.15 + riskPenalty;
      if (dataroomScore < 0.5) dropoutP += 0.30;
      else if (dataroomScore < 0.75) dropoutP += 0.12;
      dropoutP += Math.min(0.30, (state.unaddressedQACount / 5) * 0.15);
      if (buyer.ddFriction === 'high') dropoutP += 0.15;
      else if (buyer.ddFriction === 'medium') dropoutP += 0.05;
      return Math.min(0.95, dropoutP);
    };

    const recordSubmission = (buyer: Buyer, arrivalDay: number) => {
      const index = updatedBuyersAfterDeadline.findIndex((candidate) => candidate.id === buyer.id);
      if (index < 0 || updatedBuyersAfterDeadline[index].bindingOfferSubmitted) return;
      updatedBuyersAfterDeadline[index] = { ...updatedBuyersAfterDeadline[index], bindingOfferSubmitted: true, status: 'bidding' };
      bindingOfferDelta += 1;
      eventResult.emails.push({
        id: `email-bindoffer-${buyer.id}-${arrivalDay}`,
        week: Math.ceil(arrivalDay / 7),
        day: arrivalDay,
        phase: 6,
        sender: buyer.name,
        senderRole: 'Corporate Development',
        subject: `Binding Offer Submitted — ${buyer.name}`,
        body: 'We are pleased to confirm submission of our binding offer. Our legal team has also returned a marked-up draft SPA. We remain committed to completing this transaction on the process timetable.',
        preview: `Binding offer and SPA mark-up received from ${buyer.name}.`,
        category: 'buyer',
        state: 'unread',
        priority: 'high',
        timestamp: `Day ${arrivalDay}`,
        linkedEntityId: buyer.id,
        linkedEntityType: 'buyer',
      });
    };

    const windowBuyers = updatedBuyersAfterDeadline
      .filter((buyer) => !['dropped', 'excluded'].includes(buyer.status))
      .sort((a, b) => a.id.localeCompare(b.id));
    const phaseEntryDay = state.phaseEntryDay[6] ?? Math.max(1, state.phaseDeadline - 21);
    const windowDays = Math.max(2, state.phaseDeadline - phaseEntryDay);

    for (const [index, buyer] of windowBuyers.entries()) {
      if (buyer.bindingOfferSubmitted) continue;
      const scheduledDay = Math.min(
        state.phaseDeadline - 1,
        phaseEntryDay + Math.max(1, Math.floor(((index + 1) * windowDays) / (windowBuyers.length + 1))),
      );
      const crossesScheduledDay = state.day < scheduledDay && newDay >= scheduledDay;
      if (!crossesScheduledDay) continue;
      const arrivalRng = createRng(deriveSeed(state.rngSeed, hashText(buyer.id), scheduledDay, 606));
      if (arrivalRng.next() > dropoutProbability(buyer)) recordSubmission(buyer, scheduledDay);
    }

    const crossesDeadline = newDay >= state.phaseDeadline && state.day < state.phaseDeadline;
    if (crossesDeadline) {
      const remainingBuyers = updatedBuyersAfterDeadline.filter(
        (buyer) => !['dropped', 'excluded'].includes(buyer.status) && !buyer.bindingOfferSubmitted,
      );
      for (const buyer of remainingBuyers) {
        const deadlineRng = createRng(deriveSeed(state.rngSeed, hashText(buyer.id), state.phaseDeadline, 607));
        if (deadlineRng.next() > dropoutProbability(buyer)) {
          recordSubmission(buyer, state.phaseDeadline);
          continue;
        }

        const index = updatedBuyersAfterDeadline.findIndex((candidate) => candidate.id === buyer.id);
        if (index < 0) continue;
        const reason = riskPenalty > 0.20
          ? 'material issues identified during due diligence that were not adequately disclosed in the data room'
          : dataroomScore < 0.5
            ? 'insufficient documentation in the data room to complete their legal and financial review'
            : state.unaddressedQACount > 3
              ? 'outstanding Q&A requests that were not answered in time'
              : 'internal constraints and transaction priorities';
        updatedBuyersAfterDeadline[index] = { ...buyer, status: 'dropped', bindingOfferSubmitted: false };
        eventResult.emails.push({
          id: `email-dropout-${buyer.id}-${state.phaseDeadline}`,
          week: Math.ceil(state.phaseDeadline / 7),
          day: state.phaseDeadline,
          phase: 6,
          sender: buyer.name,
          senderRole: 'Corporate Development',
          subject: `Process Withdrawal — ${buyer.name}`,
          body: `Following our internal review, we will not submit a binding offer. The decision was driven by ${reason}.`,
          preview: `${buyer.name} has withdrawn from the process.`,
          category: 'buyer',
          state: 'unread',
          priority: 'high',
          timestamp: `Day ${state.phaseDeadline}`,
          linkedEntityId: buyer.id,
          linkedEntityType: 'buyer',
        });
      }
    }
  }

  // 10. Phase progress estimate
  const phaseProgressDelta = tasksCompleted.length * 8 + tasksProgressed.length * 2;


  // 9d. Day 2 Trigger: Deal Origination identifies targets
  const newTasks: GameTask[] = [];
  if (state.phase === 0 && state.day < 2 && newDay >= 2 && !state.events.some(e => e.id === 'evt-do-day2')) {
    eventResult.emails.push({
      id: 'email-do-targets',
      week: newWeek,
      phase: 0,
      sender: 'Sarah Jenkins',
      senderRole: 'Head of Deal Origination',
      subject: 'Target Shortlist for Q3 Mandate',
      body: 'Marcus mentioned you need actionable targets quickly. The DO team has pulled together 3 highly qualified opportunities across different sectors. \n\nI’ve formally added them to your dashboard and pipeline. Review the materials and decide where you want to focus your origination budget. Let me know if you need our analysts to dig into any specific dimensions before you recommend one to the board.',
      preview: 'Marcus mentioned you need targets. The team has...',
      category: 'partner',
      state: 'unread',
      priority: 'high',
      timestamp: `Week ${newWeek}, Tuesday`,
      responseOptions: [
        { id: 'r1', label: 'Thanks Sarah. I\'ll review the targets with the team.', effects: '+3 momentum', resourceEffects: { dealMomentum: 3 } },
      ],
    });

    eventResult.events.push({
      id: 'evt-do-day2',
      week: newWeek,
      phase: 0,
      type: 'passive',
      title: 'Actionable Targets Identified',
      description: 'Deal Origination has delivered three potential mandate targets. You can now investigate them before submitting a board recommendation.',
      resolved: false,
    });
    
    // Generate Target-Specific Tasks
    state.leads.forEach(lead => {
      newTasks.push({
        id: `task-investigate-${lead.id}-sector`,
        name: `Sector Dynamics: ${lead.companyName}`,
        description: `Deep dive into the sector dynamics surrounding ${lead.companyName}. Uncover growth trends and competitive pressures.`,
        phase: 0, category: 'internal', status: 'available', cost: 1, work: 3, complexity: 'low',
        effectSummary: `Sector insights for ${lead.companyName}`, targetId: lead.id,
      });
      newTasks.push({
        id: `task-investigate-${lead.id}-company`,
        name: `Company Fundamentals: ${lead.companyName}`,
        description: `Analyze ${lead.companyName}'s product, tech stack, and financial health to ensure it meets our mandate criteria.`,
        phase: 0, category: 'internal', status: 'available', cost: 2, work: 4, complexity: 'medium',
        effectSummary: `Company fundamentals for ${lead.companyName}`, targetId: lead.id,
      });
      newTasks.push({
        id: `task-investigate-${lead.id}-shareholder`,
        name: `Shareholder Objectives: ${lead.companyName}`,
        description: `Assess the cap table and founder motivations for ${lead.companyName}. Are they actually ready to sell?`,
        phase: 0, category: 'internal', status: 'available', cost: 2, work: 3, complexity: 'medium',
        effectSummary: `Shareholder alignment for ${lead.companyName}`, targetId: lead.id,
      });
      newTasks.push({
        id: `task-investigate-${lead.id}-market`,
        name: `Market Read: ${lead.companyName}`,
        description: `Quick market read on active buyers and recent multiples for businesses similar to ${lead.companyName}.`,
        phase: 0, category: 'market', status: 'available', cost: 2, work: 5, complexity: 'medium',
        effectSummary: `Market insights for ${lead.companyName}`, targetId: lead.id,
      });
    });
  }

  // Persist only real forward pull: a scheduled V1 payoff, an urgent answer,
  // active work, or a known deadline. This is intentionally a projection of
  // state, so an old teaser cannot survive after its cause is resolved.
  const directorState = eventResult.nextDirectorState ?? state.eventDirectorState ?? createInitialEventDirectorState();
  const projectedState = {
    ...state,
    day: newDay,
    week: newWeek,
    events: [...state.events, ...eventResult.events],
    emails: [...state.emails, ...eventResult.emails],
    eventDirectorState: directorState,
  } as GameStore;
  eventResult.nextDirectorState = {
    ...directorState,
    upcomingBeats: buildUpcomingBeats(projectedState),
    storyFlags: { ...(directorState.storyFlags ?? {}) },
  };

  // Build result (without narrative first)
  const partialResult = {
    tasksCompleted,
    tasksProgressed,
    resourceChanges,
    newRisks: [...eventResult.risks],
    newEmails: [...eventResult.emails],
    newHeadlines: [] as Headline[],
    newEvents: [...eventResult.events],
    buyerChanges: buyerResult.changes,
    hiddenWorkload,
    criticalOutcomes,
    phaseProgressDelta,
    resolvedBudgetRequests: resolvedRequests,
    resolvedBoardSubmission,
    daysAdvanced: daysToAdvance,
    newQualificationNotes,
    newTasks,
    bindingOfferDelta: 0, // will be overwritten in the return if deadline triggers
    directorSignal,
  };

  const narrativeSummary = generateSummary(partialResult, newWeek, directorSignal, rng);

  return {
    ...partialResult,
    daysAdvanced: daysToAdvance,
    narrativeSummary,
    _updatedBuyers: updatedBuyersAfterDeadline,
    nextDirectorState: eventResult.nextDirectorState,
    bindingOfferDelta,
    newQualificationNotes,
    rngTrace: {
      seed: turnSeed,
      draws: rng.getDrawCount(),
      state: rng.getState(),
    },
  };
}

// ============================================
// Calculate Days to Next Meaningful Event
// ============================================

export interface AdvancePacePreview {
  days: number;
  reason: string;
  requiresChoice?: boolean;
}

/**
 * Produces a small, ordered queue of developments which are already implied
 * by game state. The same function feeds the CTA, tape, timeline and save
 * state so they cannot disagree about what happens next.
 */
export function buildUpcomingBeats(state: GameStore): UpcomingBeat[] {
  const beats: UpcomingBeat[] = [];
  const add = (beat: UpcomingBeat | null) => {
    if (beat && !beats.some((candidate) => candidate.id === beat.id)) beats.push(beat);
  };

  const urgentEmail = state.emails.find(
    (email) => email.phase === state.phase && email.priority === 'urgent' && email.state === 'unread'
  );
  if (urgentEmail) {
    add({
      id: `email-${urgentEmail.id}`,
      dueDay: state.day + 1,
      label: `Reply due: ${urgentEmail.subject}`,
      source: 'email',
    });
  }

  add(getGoldenMandateUpcomingBeat(state));
  add(getPeopleUpcomingBeat(state));

  const inProgress = state.tasks.filter((task) => task.status === 'in_progress' && task.phase === state.phase);
  const nextTask = inProgress.sort((a, b) => a.work - b.work)[0];
  if (nextTask) {
    const days = nextTask.complexity === 'low' ? 1 : nextTask.complexity === 'medium' ? 2 : 3;
    add({
      id: `task-${nextTask.id}`,
      dueDay: state.day + days,
      label: `${nextTask.name} reaches its next review point.`,
      source: 'task',
    });
  }

  if (state.phaseDeadline !== null) {
    add({
      id: `deadline-phase-${state.phase}`,
      dueDay: state.phaseDeadline,
      label: `Phase deadline: ${Math.max(0, state.phaseDeadline - state.day)} days remaining.`,
      source: 'deadline',
    });
  }

  if (state.boardSubmission?.status === 'pending') {
    add({ id: 'board-review', dueDay: state.day + 2, label: 'Investment Committee review is pending.', source: 'decision' });
  }

  if (state.budgetRequests.some((request) => request.status === 'pending')) {
    add({ id: 'budget-review', dueDay: state.day + 2, label: 'Investment Committee response is due shortly.', source: 'decision' });
  }

  if (state.competitorThreats.some((threat) => !threat.resolved)) {
    add({ id: 'competitor-response', dueDay: state.day + 2, label: 'A competitor threat needs a near-term response.', source: 'buyer' });
  }

  const sourcePriority: Record<UpcomingBeat['source'], number> = {
    email: 0,
    decision: 1,
    event_chain: 2,
    buyer: 3,
    task: 4,
    deadline: 5,
  };
  return beats
    .sort((a, b) => a.dueDay - b.dueDay || sourcePriority[a.source] - sourcePriority[b.source])
    .slice(0, 3);
}

/**
 * Explains the earliest real reason time will advance. This deliberately has
 * no random component: the label on the CTA must match the engine outcome.
 */
export function getAdvancePacePreview(state: GameStore): AdvancePacePreview {
  // Urgent unread emails: check inbox tomorrow.
  if (state.emails.some((e) => e.phase === state.phase && e.priority === 'urgent' && e.state === 'unread')) {
    return { days: 1, reason: 'Urgent reply pending — advancing to tomorrow.' };
  }

  const scheduledBeat = buildUpcomingBeats(state)[0];
  if (scheduledBeat && scheduledBeat.id.startsWith('golden-')) {
    return {
      days: Math.max(1, scheduledBeat.dueDay - state.day),
      reason: scheduledBeat.label,
    };
  }

  const inProgress = state.tasks.filter((t) => t.status === 'in_progress' && t.phase === state.phase);
  if (inProgress.some((t) => t.complexity === 'low')) {
    return { days: 1, reason: 'Quick-turn work is underway — advancing to tomorrow.' };
  }

  if (inProgress.some((t) => t.complexity === 'medium')) {
    return { days: 2, reason: 'Medium-complexity work needs a short execution window.' };
  }

  if (inProgress.some((t) => t.complexity === 'high')) {
    return { days: 3, reason: 'Complex work needs time to land before the next beat.' };
  }

  if (state.boardSubmission?.status === 'pending') {
    return { days: 2, reason: 'Investment Committee review is pending.' };
  }

  if (state.budgetRequests.some((r) => r.status === 'pending')) {
    return { days: 2, reason: 'Investment Committee response is due shortly.' };
  }

  if (state.competitorThreats.some((t) => !t.resolved)) {
    return { days: 2, reason: 'A competitor threat needs a near-term response.' };
  }

  const availablePriorities = state.tasks.filter((task) =>
    task.phase === state.phase && (task.status === 'available' || task.status === 'recommended')
  );
  if (state.phase > 0 && availablePriorities.length > 0) {
    return {
      days: 7,
      reason: 'Choose a priority first — Start & Advance keeps the decision and consequence together.',
      requiresChoice: true,
    };
  }

  return { days: 7, reason: 'No immediate deadline — advancing one week.' };
}

export function calcDaysToAdvance(state: GameStore): number {
  return getAdvancePacePreview(state).days;
}

// ============================================
// Deal Collapse Detection
// ============================================

export type CollapseReason =
  | 'client_walked'
  | 'all_buyers_gone'
  | 'firm_cannot_continue'
  | 'momentum_dead';

export interface CollapseResult {
  collapsed: boolean;
  reason: CollapseReason | null;
  headline: string;
  description: string;
}

export function checkDealCollapse(state: GameStore): CollapseResult {
  const { resources, buyers, phase } = state;
  const none: CollapseResult = { collapsed: false, reason: null, headline: '', description: '' };

  // 1. Client walks — trust has fallen to zero
  if (resources.clientTrust <= 0) {
    return {
      collapsed: true,
      reason: 'client_walked',
      headline: 'Client Terminated Engagement',
      description: 'Ricardo Mendes has lost confidence in Clearwater\'s ability to deliver. The mandate has been withdrawn.',
    };
  }

  // 2. All buyers gone — no counterparties left (only relevant once buyers exist, Phase 2+)
  if (phase >= 3 && buyers.length > 0) {
    const activeBuyers = buyers.filter((b) => !['dropped', 'excluded'].includes(b.status));
    if (activeBuyers.length === 0) {
      return {
        collapsed: true,
        reason: 'all_buyers_gone',
        headline: 'No Buyers Remaining',
        description: 'Every prospective buyer has exited the process. Without counterparties, the transaction cannot proceed.',
      };
    }
  }

  // 3. Firm cannot continue — budget and morale both critically depleted
  if (resources.budget <= 0 && resources.morale <= 10) {
    return {
      collapsed: true,
      reason: 'firm_cannot_continue',
      headline: 'Advisory Firm Withdraws',
      description: 'Clearwater has exhausted its project budget and the team is unable to continue. The engagement has been suspended.',
    };
  }

  // 4. Momentum dead — deal has stalled for too long (momentum at zero)
  if (resources.dealMomentum <= 0 && phase >= 2) {
    return {
      collapsed: true,
      reason: 'momentum_dead',
      headline: 'Deal Momentum Collapsed',
      description: 'The transaction has lost all forward momentum. Market credibility is gone and the process cannot be revived.',
    };
  }

  return none;
}

// ============================================
// Phase Gate Checks
// ============================================

export interface PhaseGateResult {
  canTransition: boolean;
  requirements: { label: string; met: boolean; optional?: boolean }[];
  nextPhase: PhaseId;
}

export function checkPhaseGate(state: GameStore): PhaseGateResult {
  const { phase, tasks } = state;
  const nextPhase = getNextMandatePhase(state.mandateId, phase) ?? phase;
  const phaseTasks = tasks.filter((t) => t.phase === phase);
  const completedCount = phaseTasks.filter((t) => t.status === 'completed').length;
  const totalCount = phaseTasks.length;
  const currentTaskCompleted = (taskId: string) => phaseTasks.find((task) => task.id === taskId)?.status === 'completed';

  switch (phase) {
    case 0: { // Deal Origination → Pitch & Mandate
      const anyLeadInvestigated = state.leads.some(l =>
        l.investigation.sector === 'completed' ||
        l.investigation.company === 'completed' ||
        l.investigation.shareholder === 'completed' ||
        l.investigation.market === 'completed'
      );
      const anyLeadMet = state.leads.some(l => l.meetingDone);
      const boardApproved = state.boardSubmission?.status === 'approved';
      const hasQualNotes = (state.qualificationNotes?.length ?? 0) >= 1;

      return {
        canTransition: anyLeadInvestigated && anyLeadMet && hasQualNotes && boardApproved,
        requirements: [
          { label: 'Lead dimensions investigated', met: anyLeadInvestigated },
          { label: 'Introductory meeting held', met: anyLeadMet },
          { label: 'Qualification notes gathered', met: hasQualNotes },
          { label: 'Board submission approved', met: boardApproved },
        ],
        nextPhase,
      };
    }

    case 1: { // Pitch & Mandate → Preparation
      const pitchDocReady = state.pitchDocumentReady === true;
      const pitchPresented = state.feeNegotiation?.pitchPresented === true;
      const feeAgreed = state.feeNegotiation?.status === 'agreed' || state.agreedFeeTerms !== null;
      return {
        canTransition: pitchDocReady && pitchPresented && feeAgreed,
        requirements: [
          { label: 'Pitch document prepared (task-15)', met: pitchDocReady },
          { label: 'Pitch presented to client', met: pitchPresented },
          { label: 'Fee terms agreed', met: feeAgreed },
        ],
        nextPhase,
      };
    }

    case 2: { // Preparation → Market Outreach
      const modelDone = currentTaskCompleted('task-20');
      const cimDone = currentTaskCompleted('task-21');
      const teaserDone = currentTaskCompleted('task-22');
      const buyerListDone = currentTaskCompleted('task-25');

      return {
        canTransition: !!modelDone && !!cimDone && !!teaserDone && !!buyerListDone,
        requirements: [
          { label: 'Financial model completed', met: !!modelDone },
          { label: 'CIM drafted', met: !!cimDone },
          { label: 'Teaser prepared', met: !!teaserDone },
          { label: 'Buyer list approved by client', met: !!buyerListDone },
        ],
        nextPhase,
      };
    }

    case 3: { // Market Outreach → Shortlist — deadline-gated
      const outreachLaunched = currentTaskCompleted('task-40');
      const ndasProcessed = currentTaskCompleted('task-42');
      const qaResponded = currentTaskCompleted('task-46');
      const buyerQualified = currentTaskCompleted('task-48');
      const activeBuyersWithNDA = state.buyers.filter(b => b.status === 'nda_signed' || b.status === 'reviewing' || b.status === 'active' || b.status === 'shortlisted' || b.status === 'bidding').length;
      const deadlineSet = state.phaseDeadline !== null;
      const deadlinePassed = deadlineSet && state.day >= (state.phaseDeadline ?? Infinity);
      const requiredNdaBuyers = Math.max(2, Math.min(6, Math.ceil(Math.max(1, state.buyers.length) * 0.6)));
      const enoughBuyers = activeBuyersWithNDA >= requiredNdaBuyers;

      return {
        canTransition: deadlineSet && outreachLaunched && ndasProcessed && qaResponded && buyerQualified && (enoughBuyers || deadlinePassed),
        requirements: [
          { label: 'Outreach deadline set', met: deadlineSet },
          { label: 'Tier 1 outreach launched', met: !!outreachLaunched },
          { label: 'NDAs processed', met: !!ndasProcessed },
          { label: 'Buyer Q&A responded', met: !!qaResponded },
          { label: 'Buyers qualified', met: !!buyerQualified },
          { label: `Qualified NDA buyers: ${activeBuyersWithNDA}/${requiredNdaBuyers} or deadline reached`, met: enoughBuyers || deadlinePassed },
        ],
        nextPhase,
      };
    }

    case 4: { // Shortlist → Non-Binding Offers — deadline-gated
      const shortlistBuilt = currentTaskCompleted('task-61');
      const clientApproved = currentTaskCompleted('task-63');
      const processNote = currentTaskCompleted('task-64');
      const shortlistedBuyers = state.buyers.filter(b => b.status === 'shortlisted' || b.status === 'bidding').length;
      const deadlineSet = state.phaseDeadline !== null;
      const deadlinePassed = deadlineSet && state.day >= (state.phaseDeadline ?? Infinity);

      return {
        canTransition: deadlineSet && shortlistBuilt && clientApproved && processNote && shortlistedBuyers >= 2,
        requirements: [
          { label: 'NBO deadline set', met: deadlineSet },
          { label: 'Shortlist built', met: shortlistBuilt },
          { label: 'Client approved shortlist', met: clientApproved },
          { label: 'Process note sent to buyers', met: processNote },
          { label: `Shortlisted buyers: ${shortlistedBuyers}/2 required`, met: shortlistedBuyers >= 2 },
          { label: 'Wait for NBO deadline (optional)', met: deadlinePassed, optional: true },
        ],
        nextPhase,
      };
    }

    case 5: { // Non-Binding Offers → Due Diligence
      const matrixBuilt = tasks.some((t) => t.phase === 5 && t.linkedDeliverableId === 'del-50' && t.status === 'completed');
      const ddPackage = tasks.some((t) => t.phase === 5 && t.linkedDeliverableId === 'del-51' && t.status === 'completed');
      const nbosReceived = state.buyers.filter(b => b.status === 'bidding' || b.status === 'shortlisted' || b.status === 'preferred').length;
      const clientSelectedDD = tasks.some((t) => (
        t.id === 'task-75' ||
        t.id === 'task-76' ||
        t.name.toLowerCase().includes('advancement recommendation') ||
        t.name.toLowerCase().includes('dd candidate')
      ) && t.status === 'completed');

      return {
        canTransition: !!matrixBuilt && !!ddPackage && nbosReceived >= 2 && clientSelectedDD,
        requirements: [
          { label: 'NBO comparison matrix completed', met: !!matrixBuilt },
          { label: 'DD entry package prepared', met: !!ddPackage },
          { label: `NBOs received: ${nbosReceived}/2 required`, met: nbosReceived >= 2 },
          { label: 'Client selected DD candidates', met: clientSelectedDD },
        ],
        nextPhase,
      };
    }

    case 6: { // Due Diligence → Final Offers
      const processLetter = phaseTasks.some((t) => t.linkedDeliverableId === 'del-63' && t.status === 'completed');
      const deadlineSet = state.phaseDeadline !== null;
      const deadlinePassed = deadlineSet && state.day >= (state.phaseDeadline ?? Infinity);
      const bindingOffersIn = state.bindingOffersReceived > 0;
      const activeDDBuyers = state.buyers.filter(b => !['dropped', 'excluded'].includes(b.status)).length;
      const finalDdReady = deadlineSet && processLetter && bindingOffersIn && activeDDBuyers >= 1;

      return {
        canTransition: finalDdReady,
        requirements: [
          { label: 'Final DD Readiness Review completed (process gate)', met: !!processLetter },
          { label: 'Binding offer deadline set', met: deadlineSet },
          { label: deadlinePassed ? 'Binding offer deadline reached' : 'Binding offers can supersede deadline wait', met: deadlinePassed || bindingOffersIn },
          { label: `Binding offers received: ${state.bindingOffersReceived} (need ≥1)`, met: bindingOffersIn },
          { label: `Active buyers remain: ${activeDDBuyers} (need ≥1)`, met: activeDDBuyers >= 1 },
        ],
        nextPhase,
      };
    }

    case 7: { // Final Offers → SPA Negotiation
      const preferredSelected = state.preferredBidderId !== null;
      const exclusivityReady = tasks.some((t) => t.phase === 7 && t.linkedDeliverableId === 'del-72' && t.status === 'completed');

      return {
        canTransition: preferredSelected,
        requirements: [
          { label: 'Preferred bidder selected', met: preferredSelected },
          { label: 'Exclusivity agreement prepared (optional quality boost)', met: exclusivityReady, optional: true },
        ],
        nextPhase,
      };
    }

    case 8: { // SPA Negotiation → Signing
      const spaNegotiationAgreed = state.spaNegotiation?.status === 'agreed';
      const signingChecklist = tasks.some((t) => t.phase === 8 && t.linkedDeliverableId === 'del-82' && t.status === 'completed');

      return {
        canTransition: spaNegotiationAgreed && !!signingChecklist,
        requirements: [
          { label: 'SPA terms agreed by preferred buyer', met: spaNegotiationAgreed },
          { label: 'Signing checklist completed', met: !!signingChecklist },
        ],
        nextPhase,
      };
    }

    case 9: { // Signing → Closing & Execution
      const docLocked = tasks.some((t) => t.phase === 9 && t.name.toLowerCase().includes('lock signature') && t.status === 'completed');
      const signedOff = tasks.some((t) => t.phase === 9 && t.linkedDeliverableId === 'del-90' && t.status === 'completed');

      return {
        canTransition: !!docLocked && !!signedOff,
        requirements: [
          { label: 'Signature version locked', met: !!docLocked },
          { label: 'SPA signed', met: !!signedOff },
        ],
        nextPhase,
      };
    }

    default: {
      const fundsReleased = currentTaskCompleted('task-126');
      const ownershipTransferred = currentTaskCompleted('task-128');
      const closingMemoReady = currentTaskCompleted('task-129');
      const successFeeRealised = currentTaskCompleted('task-130');
      return {
        canTransition: fundsReleased && ownershipTransferred && closingMemoReady && successFeeRealised,
        requirements: [
          { label: 'Purchase funds released', met: fundsReleased },
          { label: 'Ownership transfer confirmed', met: ownershipTransferred },
          { label: 'Closing memorandum completed', met: closingMemoReady },
          { label: 'Success fee realised', met: successFeeRealised },
          { label: `Optional closing work completed (${completedCount}/${totalCount})`, met: completedCount === totalCount, optional: true },
        ],
        nextPhase,
      };
    }
  }
}

// ============================================
// Unlock tasks when dependencies are met
// ============================================

export function unlockTasks(tasks: GameTask[]): GameTask[] {
  return tasks.map((task) => {
    if (task.status !== 'locked' || !task.dependencies) return task;

    const allDepsMet = task.dependencies.every((depId) => {
      // IDs in legacy saves can repeat across phases. Resolve within the task's
      // own phase first, then allow an intentional dependency on prior work.
      const dep = tasks.find((candidate) => candidate.id === depId && candidate.phase === task.phase)
        ?? tasks.find((candidate) => candidate.id === depId && candidate.phase < task.phase && candidate.status === 'completed')
        ?? tasks.find((candidate) => candidate.id === depId);
      return dep?.status === 'completed';
    });

    if (allDepsMet) {
      return { ...task, status: 'available' as const };
    }
    return task;
  });
}
