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
} from '../types/game';
import type { GameStore } from '../store/gameStore';

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
  _updatedBuyers: Buyer[];
  /** How many buyers submitted binding offers this advance (Phase 6 deadline trigger) */
  bindingOfferDelta: number;
}

export interface BuyerChange {
  buyerId: string;
  field: 'status' | 'interest';
  from: string;
  to: string;
}

// Determine if a task completes in the given number of days
// Uses per-day probability derived from weekly baseline:
//   medium weekly = 60% → per-day = 1 - 0.4^(1/7) ≈ 12.9%
//   high weekly   = 40% → per-day = 1 - 0.6^(1/7) ≈ 8.0%
// In N days: P(complete) = 1 - (1-weeklyP)^(N/7)
function resolveTaskProgress(task: GameTask, _week: number, tempAllocations: TempCapacityAllocation[] = [], daysToAdvance: number = 7): 'completed' | 'progressed' {
  const alloc = tempAllocations.find((a) => a.taskId === task.id);
  const boost = alloc ? alloc.speedMultiplier : 1.0;
  const ratio = (daysToAdvance / 7) * boost;

  if (task.complexity === 'low') return 'completed';
  if (task.complexity === 'medium') {
    // 1 - (1 - 0.6)^ratio = 1 - 0.4^ratio
    const prob = 1 - Math.pow(0.4, ratio);
    return Math.random() < Math.min(0.97, prob) ? 'completed' : 'progressed';
  }
  // High: 1 - (1 - 0.4)^ratio = 1 - 0.6^ratio
  const prob = 1 - Math.pow(0.6, ratio);
  return Math.random() < Math.min(0.92, prob) ? 'completed' : 'progressed';
}

// Hidden workload check — some tasks trigger surprise extra work
function checkHiddenWorkload(completedTasks: GameTask[]): WeekResult['hiddenWorkload'] {
  for (const task of completedTasks) {
    // Higher complexity = higher chance of hidden workload
    const chance = task.complexity === 'high' ? 0.4 : task.complexity === 'medium' ? 0.2 : 0.05;
    if (Math.random() < chance) {
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
        description: descriptions[Math.floor(Math.random() * descriptions.length)],
        extraWork: Math.ceil(task.work * (0.2 + Math.random() * 0.3)),
      };
    }
  }
  return null;
}

// Critical outcome roll — tasks can occasionally deliver exceptional or poor results
type CriticalOutcome = { taskId: string; taskName: string; type: 'success' | 'failure'; description: string; bonus: Partial<PlayerResources> };

function rollCriticalOutcomes(completedTasks: GameTask[]): CriticalOutcome[] {
  const outcomes: CriticalOutcome[] = [];

  const successPool: Record<string, { description: string; bonus: Partial<PlayerResources> }[]> = {
    deliverable: [
      { description: 'Exceptional quality — client shared the output with their board as a benchmark document.', bonus: { clientTrust: 8, dealMomentum: 5 } },
      { description: 'Deliverable praised by buyer advisors — positions the process as highly professional.', bonus: { reputation: 6, dealMomentum: 4 } },
    ],
    relationship: [
      { description: 'Chemistry exceeded all expectations — the counterpart requested an exclusive relationship going forward.', bonus: { clientTrust: 10, reputation: 5 } },
      { description: 'Relationship meeting produced an unexpected referral to a second strategic buyer.', bonus: { dealMomentum: 8, reputation: 4 } },
    ],
    market: [
      { description: 'Intelligence uncovered a premium buyer previously outside the target list — immediately added to outreach.', bonus: { dealMomentum: 10 } },
      { description: 'Market work surfaced a sector thesis that materially strengthens valuation positioning.', bonus: { dealMomentum: 6, clientTrust: 4 } },
    ],
    internal: [
      { description: 'Process streamlined ahead of schedule — team capacity freed for higher-priority work.', bonus: { morale: 8, dealMomentum: 3 } },
      { description: 'Internal review produced an insight that pre-empts a likely buyer objection.', bonus: { reputation: 5, riskLevel: -6 } },
    ],
    strategic: [
      { description: 'Strategic initiative landed with unusual force — deal momentum accelerated significantly.', bonus: { dealMomentum: 12, clientTrust: 6 } },
      { description: 'Client reacted with visible relief and confidence — trust elevated beyond expectations.', bonus: { clientTrust: 12, morale: 5 } },
    ],
    external_advisor: [
      { description: 'External advisor delivered a report that resolves a key risk the team had been tracking.', bonus: { riskLevel: -10, dealMomentum: 4 } },
    ],
  };

  const failurePool: { description: string; bonus: Partial<PlayerResources> }[] = [
    { description: 'Work product contained an error discovered post-delivery — had to issue a correction with apologies.', bonus: { reputation: -5, clientTrust: -4 } },
    { description: 'Stakeholder interaction went off-script — relationship requires deliberate rebuilding over the coming days.', bonus: { clientTrust: -6, dealMomentum: -4 } },
    { description: 'Deliverable released prematurely — had to be recalled and revised under time pressure.', bonus: { morale: -5, reputation: -4, riskLevel: 5 } },
    { description: 'Outcome fell short of the brief — client flagged disappointment and requested a revised approach.', bonus: { clientTrust: -7, dealMomentum: -3 } },
  ];

  for (const task of completedTasks) {
    const successChance = task.complexity === 'high' ? 0.12 : task.complexity === 'medium' ? 0.08 : 0.04;
    const failChance = task.complexity === 'high' ? 0.07 : task.complexity === 'medium' ? 0.04 : 0.01;
    const roll = Math.random();

    if (roll < successChance) {
      const pool = successPool[task.category] ?? successPool['internal'];
      const pick = pool[Math.floor(Math.random() * pool.length)];
      outcomes.push({ taskId: task.id, taskName: task.name, type: 'success', ...pick });
    } else if (roll < successChance + failChance) {
      const pick = failurePool[Math.floor(Math.random() * failurePool.length)];
      outcomes.push({ taskId: task.id, taskName: task.name, type: 'failure', ...pick });
    }
  }

  return outcomes;
}

// Small stochastic noise applied to resources each advance — the market never stands still
function applyResourceNoise(resourceChanges: Partial<PlayerResources>, state: GameStore): Partial<PlayerResources> {
  const volatility = state.phase >= 6 ? 1.6 : state.phase >= 3 ? 1.1 : 0.6;
  const noised = { ...resourceChanges };

  const moraleNoise = Math.round((Math.random() - 0.5) * 4 * volatility);
  const currentMorale = (noised.morale as number | undefined) ?? state.resources.morale;
  noised.morale = Math.max(0, Math.min(100, currentMorale + moraleNoise));

  const momentumNoise = Math.round((Math.random() - 0.5) * 6 * volatility);
  const currentMomentum = (noised.dealMomentum as number | undefined) ?? state.resources.dealMomentum;
  noised.dealMomentum = Math.max(0, Math.min(100, currentMomentum + momentumNoise));

  return noised;
}

// Calculate resource consumption, scaled to the number of days advanced
function calculateResourceConsumption(
  inProgressTasks: GameTask[],
  resources: PlayerResources,
  tempCapacityAllocations: TempCapacityAllocation[] = [],
  daysToAdvance: number = 7,
): Partial<PlayerResources> {
  const scale = daysToAdvance / 7;
  let budgetSpent = 0;
  let workLoad = 0;

  for (const task of inProgressTasks) {
    const weeklyBudget = task.complexity === 'low' ? task.cost : Math.ceil(task.cost / 2);
    const weeklyWork = task.complexity === 'low' ? task.work : Math.ceil(task.work / 2);
    budgetSpent += weeklyBudget * scale;
    workLoad += weeklyWork * scale;
  }

  // Deduct contractor rates pro-rated for days elapsed
  for (const alloc of tempCapacityAllocations) {
    if (inProgressTasks.some((t) => t.id === alloc.taskId)) {
      budgetSpent += alloc.weeklyRate * scale;
    }
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
    budget: Math.max(0, resources.budget - Math.round(budgetSpent)),
    teamCapacity: Math.min(resources.teamCapacityMax, newCapacity + 8 * scale),
    morale: Math.max(0, Math.min(100, Math.round(resources.morale + moraleDelta))),
  };
}

// Calculate momentum and trust changes based on completed tasks
function calculateStateChanges(
  completedTasks: GameTask[],
  resources: PlayerResources,
): Partial<PlayerResources> {
  let momentumDelta = 0;
  let trustDelta = 0;

  for (const task of completedTasks) {
    // Parse effect summary for rough deltas
    if (task.category === 'relationship') {
      trustDelta += 5;
      momentumDelta += 2;
    } else if (task.category === 'market') {
      momentumDelta += 5;
    } else if (task.category === 'deliverable') {
      momentumDelta += 4;
      trustDelta += 2;
    } else if (task.category === 'internal') {
      momentumDelta += 3;
    } else if (task.category === 'strategic') {
      momentumDelta += 6;
      trustDelta += 3;
    }
  }

  // Natural decay if no progress
  if (completedTasks.length === 0) {
    momentumDelta -= 2;
  }

  return {
    dealMomentum: Math.max(0, Math.min(100, resources.dealMomentum + momentumDelta)),
    clientTrust: Math.max(0, Math.min(100, resources.clientTrust + trustDelta)),
  };
}

// Generate narrative summary
function generateSummary(result: Omit<WeekResult, 'narrativeSummary' | '_updatedBuyers' | 'criticalOutcomes'> & { criticalOutcomes: CriticalOutcome[] }, _week: number): string {
  const parts: string[] = [];

  if (result.tasksCompleted.length > 0) {
    const names = result.tasksCompleted.map((t) => t.name).join(', ');
    parts.push(`Completed: ${names}.`);
  }

  if (result.tasksProgressed.length > 0) {
    parts.push(`${result.tasksProgressed.length} task${result.tasksProgressed.length > 1 ? 's' : ''} still in progress.`);
  }

  if (result.hiddenWorkload) {
    parts.push(`Complication: ${result.hiddenWorkload.description}`);
  }

  if (result.resourceChanges.budget !== undefined) {
    parts.push(`Budget deployed this week.`);
  }

  if (result.newRisks.length > 0) {
    parts.push(`New risk identified: ${result.newRisks[0].name}.`);
  }

  // Buyer changes
  const statusChanges = result.buyerChanges.filter((c) => c.field === 'status');
  if (statusChanges.length > 0) {
    const label = statusChanges.length === 1
      ? `1 buyer status update.`
      : `${statusChanges.length} buyer status updates.`;
    parts.push(label);
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
    parts.push(quietLines[Math.floor(Math.random() * quietLines.length)]);
  }

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
): { buyers: Buyer[]; changes: BuyerChange[] } {
  if (buyers.length === 0) return { buyers, changes: [] };

  const changes: BuyerChange[] = [];
  const completedIds = new Set(completedTasks.map((t) => t.id));

  const updated = buyers.map((buyer) => {
    let newBuyer = { ...buyer };

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
        if (Math.random() < signChance) {
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
        if (Math.random() < warmChance) {
          const oldInterest = newBuyer.interest;
          newBuyer.interest = INTEREST_ORDER[currentIdx + 1];
          changes.push({ buyerId: buyer.id, field: 'interest', from: oldInterest, to: newBuyer.interest });
        }
      }

      // Interest cooling — low momentum cools buyers
      if (momentum < 30 && currentIdx > 0 && Math.random() < 0.15) {
        const oldInterest = newBuyer.interest;
        newBuyer.interest = INTEREST_ORDER[currentIdx - 1];
        changes.push({ buyerId: buyer.id, field: 'interest', from: oldInterest, to: newBuyer.interest });
      }

      // Unpredictable mood swings — buyers can act independently of momentum
      // "Cold feet" — 4% chance any active buyer cools unexpectedly
      if (currentIdx > 1 && Math.random() < 0.04) {
        const oldInterest = newBuyer.interest;
        newBuyer.interest = INTEREST_ORDER[currentIdx - 1];
        changes.push({ buyerId: buyer.id, field: 'interest', from: oldInterest, to: newBuyer.interest });
      }
      // "Breakthrough interest" — 3% chance a lukewarm/warm buyer jumps two levels
      if (currentIdx >= 1 && currentIdx <= 2 && Math.random() < 0.03) {
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
// Event System
// ============================================

interface EventTemplate {
  id: string;
  phases: number[];
  probability: number;
  condition?: (state: GameStore) => boolean;
  generate: (state: GameStore) => {
    event: GameEvent;
    resourceEffects?: Partial<PlayerResources>;
    riskGenerated?: Risk;
    emailGenerated?: Email;
  };
}

const EVENT_POOL: EventTemplate[] = [
  // Phase 0-1: Early deal events
  {
    id: 'evt-competing-advisor',
    phases: [0, 1],
    probability: 0.15,
    condition: (s) => s.week >= 2 && s.resources.dealMomentum < 40,
    generate: (s) => ({
      event: {
        id: `evt-${s.week}-compete`,
        week: s.week + 1,
        phase: s.phase,
        type: 'passive',
        title: 'Competing Advisor Moves',
        description: 'Word reaches you that a competing advisory firm has submitted a proposal to Ricardo. They are positioning themselves as the larger, more established option.',
        resolved: false,
      },
      resourceEffects: { dealMomentum: -5, clientTrust: -3 },
    }),
  },
  // Phase 2: Preparation events
  {
    id: 'evt-data-quality-issue',
    phases: [2],
    probability: 0.2,
    condition: (s) => s.tasks.some((t) => t.id === 'task-20' && t.status === 'in_progress'),
    generate: (s) => ({
      event: {
        id: `evt-${s.week}-dataquality`,
        week: s.week + 1,
        phase: s.phase,
        type: 'active',
        title: 'Financial Data Inconsistency',
        description: 'The financial model team has found discrepancies between audited accounts and management reports. Revenue recognition timing differs by €1.2M across two periods.',
        resolved: false,
      },
      resourceEffects: { riskLevel: 8 },
    }),
  },
  {
    id: 'evt-client-impatient',
    phases: [2],
    probability: 0.15,
    condition: (s) => s.week >= 11 && s.resources.dealMomentum < 45,
    generate: (s) => ({
      event: {
        id: `evt-${s.week}-impatient`,
        week: s.week + 1,
        phase: s.phase,
        type: 'passive',
        title: 'Client Growing Restless',
        description: 'Ricardo emails asking why things are taking so long. He mentions a PE firm has reached out to him directly with an "attractive proposition."',
        resolved: false,
      },
      resourceEffects: { clientTrust: -5 },
      emailGenerated: {
        id: `email-evt-${s.week}`,
        week: s.week + 1,
        phase: s.phase,
        sender: 'Ricardo Mendes',
        senderRole: 'Founder & CEO, Solara Systems',
        subject: 'Are we on track?',
        body: 'I had a PE firm contact me directly last week — Ironclad Holdings. They said they could close a deal in 8 weeks without a full process.\n\nI\'m not considering it seriously, but it made me wonder: are we on schedule? When do we actually go to market?\n\nI trust your judgement, but I need to see progress.',
        preview: 'PE firm approached client directly — pressure building...',
        category: 'client',
        state: 'unread',
        priority: 'high',
        timestamp: `Week ${s.week + 1}, Wednesday`,
        responseOptions: [
          { id: 'r1', label: 'We\'re on track — I\'ll send you a detailed timeline today', effects: '+5 trust', resourceEffects: { clientTrust: 5 } },
          { id: 'r2', label: 'A bilateral deal leaves money on the table. Trust the process.', effects: '+3 reputation, +3 trust', resourceEffects: { reputation: 3, clientTrust: 3 } },
        ],
      },
    }),
  },
  // Phase 3: Market events
  {
    id: 'evt-leak-rumour',
    phases: [3],
    probability: 0.12,
    condition: (s) => s.tasks.some((t) => t.id === 'task-41' && t.status === 'completed'),
    generate: (s) => ({
      event: {
        id: `evt-${s.week}-leak`,
        week: s.week + 1,
        phase: s.phase,
        type: 'cascade',
        title: 'Market Leak Rumour',
        description: 'An industry newsletter mentions "a major European IoT platform exploring strategic options." No name yet, but it\'s uncomfortably close to Solara\'s profile.',
        resolved: false,
      },
      resourceEffects: { riskLevel: 12, clientTrust: -5 },
      riskGenerated: {
        id: `risk-evt-${s.week}`,
        name: 'Process Leak',
        description: 'Market rumours suggest the sale process may have leaked. If Solara is identified, customers and competitors could react negatively.',
        category: 'market',
        severity: 'high',
        probability: 40,
        mitigated: false,
        surfacedWeek: s.week + 1,
        surfacedPhase: s.phase,
      },
    }),
  },
  {
    id: 'evt-premium-buyer-early',
    phases: [3],
    probability: 0.15,
    condition: (s) => s.buyers.some((b) => b.status === 'reviewing' && b.executionCredibility >= 85),
    generate: (s) => {
      const premBuyer = s.buyers.find((b) => b.status === 'reviewing' && b.executionCredibility >= 85);
      return {
        event: {
          id: `evt-${s.week}-premium`,
          week: s.week + 1,
          phase: s.phase,
          type: 'active',
          title: 'Premium Buyer Signals Strong Interest',
          description: `${premBuyer?.name ?? 'A top-tier buyer'} has requested an accelerated timeline and early management access. They appear to be building a serious internal investment case.`,
          resolved: false,
        },
        resourceEffects: { dealMomentum: 8 },
      };
    },
  },
  {
    id: 'evt-nda-redline-battle',
    phases: [3],
    probability: 0.2,
    condition: (s) => s.tasks.some((t) => t.id === 'task-42' && t.status === 'in_progress'),
    generate: (s) => ({
      event: {
        id: `evt-${s.week}-nda`,
        week: s.week + 1,
        phase: s.phase,
        type: 'active',
        title: 'NDA Redline Standoff',
        description: 'A PE buyer\'s legal counsel has returned the NDA with 14 redlines, including removal of the non-solicitation clause and addition of a mutual confidentiality carve-out. Processing this will consume significant legal capacity.',
        resolved: false,
      },
      resourceEffects: { budget: -3 },
    }),
  },
  // Phase 4: Shortlist events
  {
    id: 'evt-buyer-drops-out',
    phases: [4],
    probability: 0.15,
    condition: (s) => s.buyers.filter((b) => b.status === 'shortlisted').length >= 3,
    generate: (s) => {
      const shortlisted = s.buyers.filter((b) => b.status === 'shortlisted');
      const dropper = shortlisted.find((b) => b.ddFriction === 'high') ?? shortlisted[shortlisted.length - 1];
      return {
        event: {
          id: `evt-${s.week}-dropout`,
          week: s.week + 1,
          phase: s.phase,
          type: 'cascade',
          title: 'Buyer Drops from Process',
          description: `${dropper.name} has informed you they are withdrawing from the process, citing "internal strategic reprioritisation." This reduces competitive tension.`,
          resolved: false,
        },
        resourceEffects: { dealMomentum: -8, clientTrust: -3 },
      };
    },
  },
  {
    id: 'evt-client-logo-bias',
    phases: [4],
    probability: 0.2,
    condition: (s) => s.buyers.some((b) => b.politicalSensitivity === 'high' && b.status !== 'excluded'),
    generate: (s) => ({
      event: {
        id: `evt-${s.week}-logobias`,
        week: s.week + 1,
        phase: s.phase,
        type: 'active',
        title: 'Client Demands Prestige Buyer Stays',
        description: 'Ricardo insists that the highest-profile strategic buyer remains on the shortlist despite their slow engagement and governance complexity. "They\'re the biggest name in the industry — we can\'t cut them."',
        resolved: false,
      },
      resourceEffects: { clientTrust: -3 },
    }),
  },
  // Phase 5: NBO events
  {
    id: 'evt-lowball-offer',
    phases: [5],
    probability: 0.2,
    condition: (s) => s.buyers.some((b) => b.status === 'bidding' && b.valuationPosture === 'conservative'),
    generate: (s) => ({
      event: {
        id: `evt-${s.week}-lowball`,
        week: s.week + 1,
        phase: s.phase,
        type: 'active',
        title: 'Disappointing Indicative Offer',
        description: 'One buyer\'s NBO comes in 20% below the valuation range. Ricardo is concerned about market positioning. Careful handling required to maintain client confidence.',
        resolved: false,
      },
      resourceEffects: { clientTrust: -4, dealMomentum: -3 },
    }),
  },
  {
    id: 'evt-strong-nbo',
    phases: [5],
    probability: 0.15,
    condition: (s) => s.resources.dealMomentum > 55,
    generate: (s) => ({
      event: {
        id: `evt-${s.week}-strongnbo`,
        week: s.week + 1,
        phase: s.phase,
        type: 'passive',
        title: 'Strong NBO Received',
        description: 'A credible buyer submits an NBO at the top end of the valuation range with clean terms. Competitive tension intensifies.',
        resolved: false,
      },
      resourceEffects: { dealMomentum: 6, clientTrust: 3 },
    }),
  },
  // Phase 6: Due Diligence events
  {
    id: 'evt-dd-finding',
    phases: [6],
    probability: 0.2,
    condition: (s) => s.week >= 30,
    generate: (s) => ({
      event: {
        id: `evt-${s.week}-ddfinding`,
        week: s.week + 1,
        phase: s.phase,
        type: 'active',
        title: 'DD Red Flag Surfaced',
        description: 'Buyer\'s advisors have identified a material contract with a change-of-control clause that could trigger termination on closing. Legal review is urgent.',
        resolved: false,
      },
      resourceEffects: { riskLevel: 8, dealMomentum: -4 },
    }),
  },
  {
    id: 'evt-mgmt-pres-success',
    phases: [6],
    probability: 0.15,
    condition: (s) => s.resources.clientTrust > 55,
    generate: (s) => ({
      event: {
        id: `evt-${s.week}-mgmtpres`,
        week: s.week + 1,
        phase: s.phase,
        type: 'passive',
        title: 'Management Presentation Impresses',
        description: 'Ricardo\'s presentation to the shortlisted buyers lands exceptionally well. Multiple buyers request follow-up sessions.',
        resolved: false,
      },
      resourceEffects: { dealMomentum: 5, reputation: 3 },
    }),
  },
  // Phase 7: Final Offers events
  {
    id: 'evt-bidder-pulls-out',
    phases: [7],
    probability: 0.15,
    condition: (s) => s.buyers.filter((b) => b.status === 'bidding').length >= 2,
    generate: (s) => ({
      event: {
        id: `evt-${s.week}-bidpull`,
        week: s.week + 1,
        phase: s.phase,
        type: 'cascade',
        title: 'Bidder Withdraws at Final Stage',
        description: 'A bidder\'s board has declined to approve the final offer, citing valuation concerns. The competitive field narrows.',
        resolved: false,
      },
      resourceEffects: { dealMomentum: -5, clientTrust: -3 },
    }),
  },
  {
    id: 'evt-competing-premium',
    phases: [7],
    probability: 0.12,
    condition: (s) => s.resources.dealMomentum > 60,
    generate: (s) => ({
      event: {
        id: `evt-${s.week}-comprem`,
        week: s.week + 1,
        phase: s.phase,
        type: 'passive',
        title: 'Competitive Premium Emerges',
        description: 'The tension between remaining bidders drives a meaningful uplift. One buyer signals willingness to stretch on price to secure exclusivity.',
        resolved: false,
      },
      resourceEffects: { dealMomentum: 6, clientTrust: 4 },
    }),
  },
  // Phase 8: SPA Negotiation events
  {
    id: 'evt-warranty-dispute',
    phases: [8],
    probability: 0.2,
    condition: (s) => s.week >= 38,
    generate: (s) => ({
      event: {
        id: `evt-${s.week}-warranty`,
        week: s.week + 1,
        phase: s.phase,
        type: 'active',
        title: 'Warranty Package Standoff',
        description: 'The buyer\'s legal team has pushed back hard on the seller warranty package. Reps on IP ownership, tax, and environmental are heavily contested.',
        resolved: false,
      },
      resourceEffects: { dealMomentum: -4, riskLevel: 5 },
    }),
  },
  // Phase 9-10: Late deal events
  {
    id: 'evt-regulatory-query',
    phases: [9, 10],
    probability: 0.15,
    condition: (s) => s.resources.riskLevel > 30,
    generate: (s) => ({
      event: {
        id: `evt-${s.week}-regquery`,
        week: s.week + 1,
        phase: s.phase,
        type: 'active',
        title: 'Regulatory Supplementary Request',
        description: 'The antitrust authority has issued a supplementary information request. This could delay clearance by 2-3 weeks if not handled quickly.',
        resolved: false,
      },
      resourceEffects: { riskLevel: 6, dealMomentum: -3 },
    }),
  },
  {
    id: 'evt-closing-momentum',
    phases: [9, 10],
    probability: 0.15,
    condition: (s) => s.resources.dealMomentum > 50 && s.resources.riskLevel < 40,
    generate: (s) => ({
      event: {
        id: `evt-${s.week}-closemom`,
        week: s.week + 1,
        phase: s.phase,
        type: 'passive',
        title: 'Closing Momentum Building',
        description: 'All parties are aligned and conditions precedent are being satisfied on schedule. The legal teams are operating efficiently.',
        resolved: false,
      },
      resourceEffects: { dealMomentum: 4, morale: 3 },
    }),
  },
  // Generic events for any phase
  {
    id: 'evt-team-burnout',
    phases: [2, 3, 4, 5, 6, 7, 8],
    probability: 0.1,
    condition: (s) => s.resources.morale < 50,
    generate: (s) => ({
      event: {
        id: `evt-${s.week}-burnout`,
        week: s.week + 1,
        phase: s.phase,
        type: 'passive',
        title: 'Team Showing Signs of Burnout',
        description: 'The associate has been working weekends for three straight weeks. Quality of work is starting to slip — a Q&A response went out with an error that had to be corrected.',
        resolved: false,
      },
      resourceEffects: { morale: -5, reputation: -2 },
    }),
  },
  {
    id: 'evt-market-tailwind',
    phases: [1, 2, 3, 4, 5],
    probability: 0.1,
    condition: (s) => s.resources.dealMomentum > 50,
    generate: (s) => ({
      event: {
        id: `evt-${s.week}-tailwind`,
        week: s.week + 1,
        phase: s.phase,
        type: 'passive',
        title: 'Sector Tailwind',
        description: 'A major comparable transaction closes at a significant premium, validating the sector thesis. This lifts sentiment across all active buyer conversations.',
        resolved: false,
      },
      resourceEffects: { dealMomentum: 5 },
      riskGenerated: undefined,
    }),
  },
  {
    id: 'evt-client-confidence-boost',
    phases: [5, 6, 7, 8, 9],
    probability: 0.1,
    condition: (s) => s.resources.clientTrust > 65 && s.resources.dealMomentum > 55,
    generate: (s) => ({
      event: {
        id: `evt-${s.week}-clientboost`,
        week: s.week + 1,
        phase: s.phase,
        type: 'passive',
        title: 'Client Expresses Confidence',
        description: 'Ricardo calls Marcus to say he is impressed with how the process has been managed. He mentions recommending Clearwater to a fellow founder considering a sale.',
        resolved: false,
      },
      resourceEffects: { clientTrust: 3, reputation: 4 },
    }),
  },

  // ── Surprise Events ───────────────────────────────────────────────────────

  {
    id: 'evt-key-employee-departure',
    phases: [5, 6, 7],
    probability: 0.14,
    condition: (s) => s.week >= 18 && s.resources.riskLevel > 25,
    generate: (s) => ({
      event: {
        id: `evt-${s.week}-keyemp`,
        week: s.week + 1,
        phase: s.phase,
        type: 'cascade',
        title: 'Key Employee Threatens to Resign',
        description: "Solara's VP of Engineering — the platform's lead architect — has quietly signalled to Ricardo that he is considering leaving. He hasn't signed a retention package and has received approaches from a competitor. Buyers in DD will see this as a critical key-man risk.",
        resolved: false,
      },
      resourceEffects: { riskLevel: 18, dealMomentum: -12, clientTrust: -8 },
      riskGenerated: {
        id: `risk-keyemp-${s.week}`,
        name: 'Key-Man Risk — VP Engineering',
        description: 'Lead platform architect may resign mid-process. If discovered by buyers it could trigger renegotiation or withdrawal.',
        category: 'operational',
        severity: 'high',
        probability: 55,
        mitigated: false,
        surfacedWeek: s.week + 1,
        mitigationCost: 18,
      },
      emailGenerated: {
        id: `email-keyemp-${s.week}`,
        week: s.week + 1,
        phase: s.phase,
        sender: 'Ricardo Mendes',
        senderRole: 'Founder & CEO, Solara Systems',
        subject: 'URGENT — Pedro is thinking of leaving',
        body: "I need to speak with you today.\n\nPedro Alves — our VP Engineering — pulled me aside yesterday. He's been headhunted by Volterra Systems and is seriously considering it. He says he feels 'out of the loop' on what's happening with the company.\n\nI told him nothing is decided yet, but he's not buying it.\n\nIf he walks, this process could collapse. The entire platform runs on his knowledge. Buyers will find out during DD interviews. I need your advice — urgently.",
        preview: 'VP Engineering may resign — urgent advice needed on retention...',
        category: 'client',
        state: 'unread',
        priority: 'urgent',
        timestamp: `Week ${s.week + 1}, Monday`,
        responseOptions: [
          {
            id: 'r1',
            label: 'Recommend a confidential retention package immediately',
            effects: '-15 budget, -12 risk, +5 trust',
            resourceEffects: { budget: -15, riskLevel: -12, clientTrust: 5 },
          },
          {
            id: 'r2',
            label: 'Brief Ricardo — bring Pedro into a selective disclosure meeting',
            effects: '-5 budget, -6 risk, +3 trust (slower but builds loyalty)',
            resourceEffects: { budget: -5, riskLevel: -6, clientTrust: 3 },
          },
          {
            id: 'r3',
            label: 'Monitor for now — intervening too soon could backfire',
            effects: '+8 risk, -5 momentum (risky delay)',
            resourceEffects: { riskLevel: 8, dealMomentum: -5 },
          },
        ],
      },
    }),
  },

  {
    id: 'evt-market-downturn',
    phases: [3, 4, 5, 6, 7, 8],
    probability: 0.07,
    condition: (s) => s.resources.dealMomentum >= 35,
    generate: (s) => ({
      event: {
        id: `evt-${s.week}-mktdown`,
        week: s.week + 1,
        phase: s.phase,
        type: 'cascade',
        title: 'Sector Valuation Reset',
        description: 'A major listed peer reports a significant earnings miss and issues a profit warning. Sector multiples contract sharply overnight. Two buyers have flagged concerns about valuation assumptions and are revisiting their investment memos.',
        resolved: false,
      },
      resourceEffects: { dealMomentum: -18, riskLevel: 12 },
      emailGenerated: {
        id: `email-mktdown-${s.week}`,
        week: s.week + 1,
        phase: s.phase,
        sender: 'Marcus Aldridge',
        senderRole: 'Managing Partner, Clearwater Advisory',
        subject: 'Sector dislocation — how do we handle this?',
        body: "The Zentara Group earnings miss is reverberating. Zentara is the closest listed comp to Solara and they just guided 15% below consensus. Our buyers' investment committees will be recalibrating.\n\nKestrel already sent a note asking whether Solara's ARR growth is 'at risk from the same macro headwinds.'\n\nHow we respond in the next 48 hours will define whether this becomes a repricing or a walk-away. I need your call.",
        preview: 'Sector comp down 20% — buyers re-examining valuation assumptions...',
        category: 'partner',
        state: 'unread',
        priority: 'urgent',
        timestamp: `Week ${s.week + 1}, Tuesday`,
        responseOptions: [
          {
            id: 'r1',
            label: 'Prepare differentiation memo and brief all buyers immediately',
            effects: '-12 budget, +8 momentum, -5 risk (strong response)',
            resourceEffects: { budget: -12, dealMomentum: 8, riskLevel: -5 },
          },
          {
            id: 'r2',
            label: 'Acknowledge the volatility, hold firm on Solara\'s metrics',
            effects: '+3 reputation, -3 momentum (credible but slower)',
            resourceEffects: { reputation: 3, dealMomentum: -3 },
          },
        ],
      },
    }),
  },

  {
    id: 'evt-customer-churn-signal',
    phases: [5, 6],
    probability: 0.12,
    condition: (s) => s.resources.riskLevel > 20 && s.buyers.filter((b) => !['dropped', 'excluded'].includes(b.status)).length >= 2,
    generate: (s) => ({
      event: {
        id: `evt-${s.week}-churn`,
        week: s.week + 1,
        phase: s.phase,
        type: 'active',
        title: 'Top Customer Shows Churn Signal',
        description: "During DD, buyers discover Solara's largest customer — representing 22% of ARR — is in contract renewal negotiations and has not yet re-signed. The buyer consortium flags this as a material concentration risk.",
        resolved: false,
      },
      resourceEffects: { riskLevel: 14, dealMomentum: -8 },
      riskGenerated: {
        id: `risk-churn-${s.week}`,
        name: 'Top Customer Renewal Risk',
        description: '22% ARR customer in renewal negotiations. Buyers will request sight of contract status and may reprice on concentration risk.',
        category: 'commercial',
        severity: 'high',
        probability: 45,
        mitigated: false,
        surfacedWeek: s.week + 1,
        mitigationCost: 12,
      },
      emailGenerated: {
        id: `email-churn-${s.week}`,
        week: s.week + 1,
        phase: s.phase,
        sender: 'Kestrel Capital Partners',
        senderRole: 'Deal Lead',
        subject: 'DD Finding — ARR concentration and renewal status',
        body: "Our DD team has flagged that Meridian Energy (22% of ARR) is in the middle of contract renewal discussions and has not re-signed.\n\nThis is a material item. Before we can finalise our valuation, we need:\n1. Current status of the Meridian renewal\n2. Any side letters, pricing discussions, or at-risk flags\n3. A call with Solara's Chief Commercial Officer\n\nWe may need to revisit our headline number depending on the outcome.",
        preview: 'DD team flags top customer renewal as material risk to valuation...',
        category: 'buyer',
        state: 'unread',
        priority: 'urgent',
        timestamp: `Week ${s.week + 1}, Thursday`,
        responseOptions: [
          {
            id: 'r1',
            label: 'Arrange CCO call — get ahead of it with full transparency',
            effects: '+6 trust, -6 risk, -8 budget',
            resourceEffects: { clientTrust: 6, riskLevel: -6, budget: -8 },
          },
          {
            id: 'r2',
            label: 'Provide written update only — control the narrative',
            effects: '-5 momentum (buyers less satisfied with response)',
            resourceEffects: { dealMomentum: -5 },
          },
        ],
      },
    }),
  },

  {
    id: 'evt-competing-deal-collapse',
    phases: [6, 7, 8, 9],
    probability: 0.09,
    condition: (s) => s.resources.dealMomentum >= 45 && s.buyers.filter((b) => !['dropped', 'excluded'].includes(b.status)).length >= 2,
    generate: (s) => ({
      event: {
        id: `evt-${s.week}-compcollapse`,
        week: s.week + 1,
        phase: s.phase,
        type: 'passive',
        title: 'Competing Deal Collapses',
        description: 'A parallel sector process — BrightStar Industrial — has collapsed at SPA stage after a buyer walked over warranty terms. This redirects capital and attention from competing buyers towards Solara, and creates urgency among your own buyer pool to move faster.',
        resolved: false,
      },
      resourceEffects: { dealMomentum: 10, clientTrust: 3 },
    }),
  },

  // ── New: Phase 0-1 ────────────────────────────────────────────────────────
  {
    id: 'evt-client-second-thoughts',
    phases: [0, 1],
    probability: 0.14,
    condition: (s) => s.week >= 3 && s.resources.clientTrust < 55,
    generate: (s) => ({
      event: {
        id: `evt-${s.week}-secondthoughts`,
        week: s.week + 1,
        phase: s.phase,
        type: 'active',
        title: 'Client Having Second Thoughts',
        description: 'Ricardo calls to say he had a long conversation with his wife and is "questioning whether now is the right time." He is not withdrawing, but his commitment is wavering.',
        resolved: false,
      },
      resourceEffects: { clientTrust: -8, dealMomentum: -6 },
      emailGenerated: {
        id: `email-2thoughts-${s.week}`,
        week: s.week + 1,
        phase: s.phase,
        sender: 'Ricardo Mendes',
        senderRole: 'Founder & CEO, Solara Systems',
        subject: 'Need to talk — having doubts',
        body: "I've been lying awake at night thinking about this.\n\nSelling means losing what I've spent 11 years building. I'm not saying I want to stop — but I need to understand again why now is the right moment, and why the process you're proposing is the best path.\n\nCan we meet this week?",
        preview: 'Ricardo is questioning timing — confidence wavering...',
        category: 'client',
        state: 'unread',
        priority: 'urgent',
        timestamp: `Week ${s.week + 1}, Monday`,
        responseOptions: [
          { id: 'r1', label: 'Arrange a face-to-face and walk him through the strategic rationale again', effects: '+10 trust, +5 momentum', resourceEffects: { clientTrust: 10, dealMomentum: 5 } },
          { id: 'r2', label: 'Send a written memo — sector window, buyer appetite, personal liquidity', effects: '+6 trust', resourceEffects: { clientTrust: 6 } },
          { id: 'r3', label: 'Give him space — check in again in a few days', effects: '-4 momentum (risks further doubt)', resourceEffects: { dealMomentum: -4 } },
        ],
      },
    }),
  },

  // ── New: Phase 2 ──────────────────────────────────────────────────────────
  {
    id: 'evt-sector-expert-conflicts',
    phases: [2],
    probability: 0.16,
    condition: (s) => s.week >= 9,
    generate: (s) => ({
      event: {
        id: `evt-${s.week}-expertconflict`,
        week: s.week + 1,
        phase: s.phase,
        type: 'active',
        title: 'Sector Expert Conflicts Out',
        description: "The industry expert we planned to use for buyer management meetings has disclosed a prior advisory relationship with one of the target buyers. They cannot participate. Finding a credible replacement in time will require budget and effort.",
        resolved: false,
      },
      resourceEffects: { budget: -6, dealMomentum: -3 },
    }),
  },
  {
    id: 'evt-regulatory-prescreen',
    phases: [2, 3],
    probability: 0.13,
    condition: (s) => s.buyers.some((b) => b.type === 'strategic'),
    generate: (s) => ({
      event: {
        id: `evt-${s.week}-regpre`,
        week: s.week + 1,
        phase: s.phase,
        type: 'active',
        title: 'Regulatory Pre-Screen Alert',
        description: 'An informal pre-screen with competition counsel flagged that one of the strategic buyers could face merger review in two jurisdictions. This needs to be factored into process timing and any exclusivity period.',
        resolved: false,
      },
      resourceEffects: { riskLevel: 9, dealMomentum: -4 },
      riskGenerated: {
        id: `risk-reg-${s.week}`,
        name: 'Regulatory Clearance Risk',
        description: 'One or more buyers may face competition review. Could add 6–10 weeks to closing timeline.',
        category: 'legal',
        severity: 'medium',
        probability: 35,
        mitigated: false,
        surfacedWeek: s.week + 1,
        surfacedPhase: s.phase,
      },
    }),
  },

  // ── New: Phase 3 ──────────────────────────────────────────────────────────
  {
    id: 'evt-surprise-inbound',
    phases: [3],
    probability: 0.14,
    condition: (s) => s.resources.reputation > 50,
    generate: (s) => ({
      event: {
        id: `evt-${s.week}-inbound`,
        week: s.week + 1,
        phase: s.phase,
        type: 'passive',
        title: 'Unsolicited Strategic Approach',
        description: "A major US strategic — not on the original buyer list — has reached out through a banker contact. They saw the CIM circulating and want to be included. Adding them creates competitive tension but also complexity.",
        resolved: false,
      },
      resourceEffects: { dealMomentum: 9, riskLevel: 4 },
      emailGenerated: {
        id: `email-inbound-${s.week}`,
        week: s.week + 1,
        phase: s.phase,
        sender: 'Marcus Aldridge',
        senderRole: 'Managing Partner, Clearwater Advisory',
        subject: 'Inbound — Axiom Technologies wants in',
        body: "Received a call from David Lund at Morrison & Co — he represents Axiom Technologies (NYSE: AXT). They picked up the process through the network and want to be included.\n\nAxiom is a tier-1 strategic with strong IoT credentials. Adding them would add credibility and potentially drive up prices. But it also adds complexity, timeline risk, and a party we know less well.\n\nYour call.",
        preview: 'Unsolicited strategic buyer wants to join the process...',
        category: 'partner',
        state: 'unread',
        priority: 'high',
        timestamp: `Week ${s.week + 1}, Wednesday`,
        responseOptions: [
          { id: 'r1', label: 'Add Axiom to the process — more competition, better price', effects: '+8 momentum, +6 risk (complexity)', resourceEffects: { dealMomentum: 8, riskLevel: 6 } },
          { id: 'r2', label: 'Request a one-pager before deciding — qualify them first', effects: '+4 reputation, neutral', resourceEffects: { reputation: 4 } },
          { id: 'r3', label: 'Decline politely — process is already at the right stage', effects: '+2 reputation, -3 momentum', resourceEffects: { reputation: 2, dealMomentum: -3 } },
        ],
      },
    }),
  },
  {
    id: 'evt-journalist-contact',
    phases: [3, 4],
    probability: 0.1,
    condition: (s) => s.resources.riskLevel > 15,
    generate: (s) => ({
      event: {
        id: `evt-${s.week}-journalist`,
        week: s.week + 1,
        phase: s.phase,
        type: 'cascade',
        title: 'Financial Journalist Makes Enquiry',
        description: "A journalist at a financial newswire has emailed Solara's PR contact asking for comment on 'strategic options being explored by the IoT platform.' The enquiry suggests partial market awareness — a full leak could disrupt the buyer pool.",
        resolved: false,
      },
      resourceEffects: { riskLevel: 11, clientTrust: -5, dealMomentum: -4 },
      riskGenerated: {
        id: `risk-press-${s.week}`,
        name: 'Press Leak Risk',
        description: 'Journalist has made an enquiry. Risk of premature public disclosure.',
        category: 'market',
        severity: 'high',
        probability: 50,
        mitigated: false,
        surfacedWeek: s.week + 1,
        surfacedPhase: s.phase,
      },
    }),
  },

  // ── New: Phase 4-5 ────────────────────────────────────────────────────────
  {
    id: 'evt-buyer-consortium',
    phases: [4, 5],
    probability: 0.12,
    condition: (s) => s.buyers.filter((b) => b.status === 'shortlisted' || b.status === 'bidding').length >= 3,
    generate: (s) => ({
      event: {
        id: `evt-${s.week}-consortium`,
        week: s.week + 1,
        phase: s.phase,
        type: 'cascade',
        title: 'Two Buyers Form Consortium',
        description: "Two of the shortlisted buyers have quietly agreed to submit a joint bid. This removes a competitive dynamic but may strengthen their combined execution credibility. Ricardo will have mixed views.",
        resolved: false,
      },
      resourceEffects: { dealMomentum: -5, riskLevel: 6 },
    }),
  },
  {
    id: 'evt-fx-concern',
    phases: [4, 5, 6],
    probability: 0.11,
    condition: (s) => s.buyers.some((b) => b.geography !== 'Europe' && !['dropped', 'excluded'].includes(b.status)),
    generate: (s) => ({
      event: {
        id: `evt-${s.week}-fx`,
        week: s.week + 1,
        phase: s.phase,
        type: 'active',
        title: 'FX Volatility Spooks Overseas Buyer',
        description: "The EUR/USD rate has moved 4% against the overseas buyer over the past two weeks. Their investment committee is requesting a sensitivity analysis on currency risk before confirming their valuation range.",
        resolved: false,
      },
      resourceEffects: { dealMomentum: -5, budget: -4 },
    }),
  },

  // ── New: Phase 6 ──────────────────────────────────────────────────────────
  {
    id: 'evt-ip-challenge',
    phases: [6],
    probability: 0.13,
    condition: (s) => s.resources.riskLevel > 20,
    generate: (s) => ({
      event: {
        id: `evt-${s.week}-ipchallenge`,
        week: s.week + 1,
        phase: s.phase,
        type: 'active',
        title: 'IP Ownership Gap Discovered',
        description: "DD has uncovered that two core platform modules were partially built by an ex-employee who left without signing a proper IP assignment agreement. The buyer's legal team considers this material. Clean-up will require legal work and potentially a deed of assignment.",
        resolved: false,
      },
      resourceEffects: { riskLevel: 14, dealMomentum: -6, budget: -8 },
      riskGenerated: {
        id: `risk-ip-${s.week}`,
        name: 'IP Ownership Gap',
        description: 'Two platform modules have unresolved IP assignment from a former employee. Buyers may require indemnity or escrow.',
        category: 'legal',
        severity: 'high',
        probability: 55,
        mitigated: false,
        surfacedWeek: s.week + 1,
        surfacedPhase: s.phase,
      },
    }),
  },

  // ── New: Phase 7-8 ────────────────────────────────────────────────────────
  {
    id: 'evt-exclusivity-standoff',
    phases: [7, 8],
    probability: 0.15,
    condition: (s) => s.buyers.some((b) => b.status === 'preferred' || b.status === 'bidding'),
    generate: (s) => ({
      event: {
        id: `evt-${s.week}-excl`,
        week: s.week + 1,
        phase: s.phase,
        type: 'active',
        title: 'Buyer Demands Exclusivity Immediately',
        description: "The preferred bidder is refusing to progress SPA negotiations until they have a signed exclusivity agreement. Ricardo is uncomfortable granting exclusivity before terms are locked. You are caught in the middle.",
        resolved: false,
      },
      resourceEffects: { dealMomentum: -7, clientTrust: -4 },
      emailGenerated: {
        id: `email-excl-${s.week}`,
        week: s.week + 1,
        phase: s.phase,
        sender: 'Kestrel Capital Partners',
        senderRole: 'Deal Lead',
        subject: 'Exclusivity required before SPA kickoff',
        body: "Our investment committee's approval to proceed with SPA negotiations is conditional on receiving a signed exclusivity letter first.\n\nWe understand Ricardo's position, but our committee will not authorise legal and management resources at this level without protection from parallel processes.\n\nWe need a 4-week exclusivity window. Non-negotiable at this stage.",
        preview: 'Preferred buyer halts SPA until exclusivity is signed...',
        category: 'buyer',
        state: 'unread',
        priority: 'urgent',
        timestamp: `Week ${s.week + 1}, Friday`,
        responseOptions: [
          { id: 'r1', label: 'Grant 3-week exclusivity — close faster, accept the constraint', effects: '+8 momentum, -5 trust (Ricardo unhappy)', resourceEffects: { dealMomentum: 8, clientTrust: -5 } },
          { id: 'r2', label: 'Counter with a 2-week window — protect optionality', effects: '+4 momentum, -3 trust', resourceEffects: { dealMomentum: 4, clientTrust: -3 } },
          { id: 'r3', label: 'Refuse and maintain parallel track — call their bluff', effects: '+5 trust, -8 momentum (may lose preferred bidder)', resourceEffects: { clientTrust: 5, dealMomentum: -8 } },
        ],
      },
    }),
  },
  {
    id: 'evt-buyer-financing-wobble',
    phases: [7, 8],
    probability: 0.12,
    condition: (s) => s.buyers.some((b) => b.type === 'pe' && !['dropped', 'excluded'].includes(b.status)),
    generate: (s) => ({
      event: {
        id: `evt-${s.week}-finwobble`,
        week: s.week + 1,
        phase: s.phase,
        type: 'cascade',
        title: "PE Buyer's Financing Under Pressure",
        description: "The PE buyer's bank has requested an additional equity cushion following a change in leveraged lending guidelines. The buyer is seeking to renegotiate price by 5% to compensate. This is a credible financing constraint, not a negotiation tactic.",
        resolved: false,
      },
      resourceEffects: { dealMomentum: -9, riskLevel: 10 },
    }),
  },

  // ── New: Phase 9-10 ───────────────────────────────────────────────────────
  {
    id: 'evt-completion-accounts-dispute',
    phases: [9, 10],
    probability: 0.14,
    condition: (s) => s.resources.riskLevel > 15,
    generate: (s) => ({
      event: {
        id: `evt-${s.week}-compacc`,
        week: s.week + 1,
        phase: s.phase,
        type: 'active',
        title: 'Completion Accounts Dispute',
        description: 'The buyer has challenged the completion accounts, claiming working capital is €1.8M below the agreed target. The difference could reduce Ricardo\'s net proceeds. Accountants on both sides are now arguing over the normalisation methodology.',
        resolved: false,
      },
      resourceEffects: { riskLevel: 8, dealMomentum: -5, clientTrust: -4 },
    }),
  },
  {
    id: 'evt-conditions-precedent-drag',
    phases: [9, 10],
    probability: 0.13,
    condition: (s) => s.week >= 42,
    generate: (s) => ({
      event: {
        id: `evt-${s.week}-cpdrag`,
        week: s.week + 1,
        phase: s.phase,
        type: 'active',
        title: 'Conditions Precedent Running Behind',
        description: "Three CPs are still outstanding and the scheduled closing date is under pressure. The buyer's counsel is threatening to invoke a long-stop date extension clause if they are not satisfied within 10 days.",
        resolved: false,
      },
      resourceEffects: { dealMomentum: -6, riskLevel: 9 },
    }),
  },

  // ── New: Cross-phase ─────────────────────────────────────────────────────
  {
    id: 'evt-team-recognition',
    phases: [2, 3, 4, 5, 6, 7],
    probability: 0.08,
    condition: (s) => s.resources.morale >= 70 && s.tasks.filter((t) => t.status === 'completed').length >= 5,
    generate: (s) => ({
      event: {
        id: `evt-${s.week}-teamrec`,
        week: s.week + 1,
        phase: s.phase,
        type: 'passive',
        title: 'Marcus Recognises the Team',
        description: "Marcus sends a personal note to the deal team recognising their output over the past weeks. He mentions the Solara process is being cited internally as a model for how to run a complex sell-side mandate.",
        resolved: false,
      },
      resourceEffects: { morale: 10, reputation: 5 },
    }),
  },
  {
    id: 'evt-advisor-positive-press',
    phases: [3, 4, 5],
    probability: 0.07,
    condition: (s) => s.resources.reputation > 60,
    generate: (s) => ({
      event: {
        id: `evt-${s.week}-press`,
        week: s.week + 1,
        phase: s.phase,
        type: 'passive',
        title: 'Clearwater Mentioned in Industry Press',
        description: "A mergers & acquisitions trade publication names Clearwater Advisory in their annual 'boutiques to watch' list, citing activity in the European technology sector. Several buyer contacts have mentioned seeing it.",
        resolved: false,
      },
      resourceEffects: { reputation: 8, dealMomentum: 3 },
    }),
  },

  // ── Phase 0: Additional Events ────────────────────────────────────────────
  {
    id: 'evt-macro-rate-hike',
    phases: [0],
    probability: 0.12,
    condition: (s) => s.week >= 2,
    generate: (s) => ({
      event: {
        id: `evt-${s.week}-ratehike`,
        week: s.week + 1,
        phase: s.phase,
        type: 'passive',
        title: 'Central Bank Unexpected Rate Hike',
        description: "The ECB announced an unexpected 50bps rate hike. Leverage is getting more expensive, which might cool down Private Equity appetite, making PE-reliant leads slightly harder to sell.",
        resolved: false,
      },
      resourceEffects: { dealMomentum: -5, riskLevel: 5 },
    }),
  },
  {
    id: 'evt-macro-sector-boom',
    phases: [0],
    probability: 0.12,
    condition: (s) => s.week >= 2,
    generate: (s) => ({
      event: {
        id: `evt-${s.week}-sectorboom`,
        week: s.week + 1,
        phase: s.phase,
        type: 'passive',
        title: 'B2B Software Sector Boom',
        description: "A major US software conglomerate just bought a European player for 18x ARR. Suddenly, all B2B and Aviation Software assets are looking highly attractive to strategics.",
        resolved: false,
      },
      resourceEffects: { dealMomentum: 8, clientTrust: 2 },
    }),
  },
  {
    id: 'evt-rival-pitches-ricardo',
    phases: [0],
    probability: 0.18,
    condition: (s) => s.week >= 1,
    generate: (s) => ({
      event: {
        id: `evt-${s.week}-rivalpitch`,
        week: s.week + 1,
        phase: s.phase,
        type: 'active',
        title: 'Rival Firm Pitches Ricardo Directly',
        description: "Beacon Partners — a larger advisory firm — has reached out to Ricardo with a credentials deck and a reference list of 'comparable successful exits.' Ricardo forwarded it to you with the note: 'Is their track record really better?'",
        resolved: false,
      },
      resourceEffects: { clientTrust: -4, dealMomentum: -3, reputation: -2 },
      emailGenerated: {
        id: `email-rivalpitch-${s.week}`,
        week: s.week + 1,
        phase: s.phase,
        sender: 'Ricardo Mendes',
        senderRole: 'Founder & CEO, Solara Systems',
        subject: 'FWD: Beacon Partners — credentials for your review',
        body: "See below — Beacon approached me directly. Their pitch pack is slick and their track record looks impressive on paper.\n\nI'm not going anywhere, but I'd like to understand how Clearwater's approach is differentiated. Can you put something together?",
        preview: 'Rival firm pitched Ricardo — he wants a differentiation response...',
        category: 'client',
        state: 'unread',
        priority: 'high',
        timestamp: `Week ${s.week + 1}, Tuesday`,
        responseOptions: [
          { id: 'r1', label: 'Send a focused differentiation memo — sector depth, boutique attention, track record', effects: '+8 trust, +5 reputation', resourceEffects: { clientTrust: 8, reputation: 5 } },
          { id: 'r2', label: 'Request a call — address it face-to-face and reinforce the relationship', effects: '+6 trust, +3 momentum', resourceEffects: { clientTrust: 6, dealMomentum: 3 } },
          { id: 'r3', label: 'Downplay the competitor — focus Ricardo on the process you\'ve already started', effects: '+2 trust, -3 reputation (appears defensive)', resourceEffects: { clientTrust: 2, reputation: -3 } },
        ],
      },
    }),
  },
  {
    id: 'evt-cfo-joins-meeting',
    phases: [1],
    probability: 0.14,
    condition: (s) => s.week >= 4,
    generate: (s) => ({
      event: {
        id: `evt-${s.week}-cfojoin`,
        week: s.week + 1,
        phase: s.phase,
        type: 'active',
        title: "Ricardo's CFO Raises Concerns",
        description: "Solara's CFO — Inês Carvalho — joined a mandate discussion call unexpectedly. She challenged the process timeline, the proposed fee structure, and whether 'now is really the best time.' Ricardo looked uncomfortable.",
        resolved: false,
      },
      resourceEffects: { clientTrust: -5, dealMomentum: -4 },
    }),
  },
  {
    id: 'evt-founder-reference',
    phases: [0, 1],
    probability: 0.1,
    condition: (s) => s.resources.reputation > 45,
    generate: (s) => ({
      event: {
        id: `evt-${s.week}-reference`,
        week: s.week + 1,
        phase: s.phase,
        type: 'passive',
        title: 'Positive Reference Check',
        description: 'Ricardo mentioned he spoke with a founder who sold his company with Clearwater two years ago. The reference was overwhelmingly positive — he said it was the main reason he is comfortable proceeding.',
        resolved: false,
      },
      resourceEffects: { clientTrust: 8, reputation: 5 },
    }),
  },

  // ── Phase 1: Additional Events ────────────────────────────────────────────
  {
    id: 'evt-client-wants-faster',
    phases: [1],
    probability: 0.15,
    condition: (s) => s.resources.clientTrust > 50,
    generate: (s) => ({
      event: {
        id: `evt-${s.week}-faster`,
        week: s.week + 1,
        phase: s.phase,
        type: 'active',
        title: "Client Wants to Accelerate",
        description: "Ricardo calls to say he has 'personal reasons' to want the deal completed before year end. He is not elaborating. He asks if it's possible to compress the timeline by 4–6 weeks.",
        resolved: false,
      },
      resourceEffects: { dealMomentum: 5, riskLevel: 7 },
      emailGenerated: {
        id: `email-faster-${s.week}`,
        week: s.week + 1,
        phase: s.phase,
        sender: 'Ricardo Mendes',
        senderRole: 'Founder & CEO, Solara Systems',
        subject: 'Timeline — can we move faster?',
        body: "I know this might sound abrupt but I need to ask: is there a realistic path to completing by end of November?\n\nI have some personal circumstances that make it important to me — I'd rather not go into detail, but trust that it's significant.\n\nIs it possible, or at least worth exploring?",
        preview: 'Client pushing for accelerated timeline — personal reasons...',
        category: 'client',
        state: 'unread',
        priority: 'high',
        timestamp: `Week ${s.week + 1}, Monday`,
        responseOptions: [
          { id: 'r1', label: "Yes — we'll compress market outreach and run parallel workstreams", effects: '+6 trust, +8 risk (timeline pressure)', resourceEffects: { clientTrust: 6, riskLevel: 8 } },
          { id: 'r2', label: "We can try — but only if we don't compromise buyer quality", effects: '+4 trust, +4 risk', resourceEffects: { clientTrust: 4, riskLevel: 4 } },
          { id: 'r3', label: "Rushing risks leaving money on the table — recommend we stay the course", effects: '+3 reputation, -3 trust (disappoints him)', resourceEffects: { reputation: 3, clientTrust: -3 } },
        ],
      },
    }),
  },
  {
    id: 'evt-mandate-lawyer-review',
    phases: [1],
    probability: 0.13,
    condition: (s) => s.week >= 6,
    generate: (s) => ({
      event: {
        id: `evt-${s.week}-lawyerreview`,
        week: s.week + 1,
        phase: s.phase,
        type: 'active',
        title: 'Mandate Letter Challenged by Client Lawyer',
        description: "Ricardo's lawyer has reviewed the engagement letter and returned it with annotations. They are challenging the success fee cap provision and the exclusivity period. Legal back-and-forth will delay mandate signing.",
        resolved: false,
      },
      resourceEffects: { budget: -4, dealMomentum: -5 },
    }),
  },
  {
    id: 'evt-ic-approves-early',
    phases: [1],
    probability: 0.1,
    condition: (s) => s.resources.dealMomentum > 55 && s.resources.clientTrust > 55,
    generate: (s) => ({
      event: {
        id: `evt-${s.week}-icearly`,
        week: s.week + 1,
        phase: s.phase,
        type: 'passive',
        title: 'IC Gives Early Green Light',
        description: 'Marcus has spoken to the Investment Committee ahead of schedule. Given the strength of the opportunity, they have given informal approval to proceed without waiting for the next formal IC date. This accelerates the mandate.',
        resolved: false,
      },
      resourceEffects: { dealMomentum: 8, morale: 5 },
    }),
  },

  // ── Phase 2: Additional Events ────────────────────────────────────────────
  {
    id: 'evt-model-assumptions-challenged',
    phases: [2],
    probability: 0.16,
    condition: (s) => s.tasks.some((t) => t.id === 'task-20' && (t.status === 'in_progress' || t.status === 'completed')),
    generate: (s) => ({
      event: {
        id: `evt-${s.week}-modelchallenge`,
        week: s.week + 1,
        phase: s.phase,
        type: 'active',
        title: 'Financial Model Assumptions Challenged',
        description: "The auditor has flagged that Solara's revenue growth model uses an aggressive churn assumption that differs from the actual trailing 12-month figure. Revising this brings EBITDA 7% lower in year 2. The financial model needs to be updated before it goes to buyers.",
        resolved: false,
      },
      resourceEffects: { riskLevel: 8, dealMomentum: -4, budget: -5 },
    }),
  },
  {
    id: 'evt-management-job-security',
    phases: [2, 3],
    probability: 0.12,
    condition: (s) => s.resources.clientTrust < 65,
    generate: (s) => ({
      event: {
        id: `evt-${s.week}-jobsecurity`,
        week: s.week + 1,
        phase: s.phase,
        type: 'cascade',
        title: 'Management Team Anxious About Roles',
        description: "Two members of Solara's senior management team have heard rumours of a sale and approached Ricardo asking about their job security post-close. Ricardo is now asking you to help manage the messaging before it becomes a retention issue.",
        resolved: false,
      },
      resourceEffects: { riskLevel: 7, clientTrust: -4, dealMomentum: -3 },
    }),
  },
  {
    id: 'evt-comparable-premium',
    phases: [2, 3],
    probability: 0.11,
    condition: (s) => s.resources.dealMomentum > 45,
    generate: (s) => ({
      event: {
        id: `evt-${s.week}-comppremium`,
        week: s.week + 1,
        phase: s.phase,
        type: 'passive',
        title: 'Sector Deal Closes at Significant Premium',
        description: "A close comparable — VaultSense Technologies — has been acquired at 14x EV/EBITDA, 40% above consensus estimates. This meaningfully strengthens Solara's valuation positioning and gives buyers a new market reference point.",
        resolved: false,
      },
      resourceEffects: { dealMomentum: 8, clientTrust: 5 },
    }),
  },
  {
    id: 'evt-junior-breach',
    phases: [2],
    probability: 0.09,
    condition: (s) => s.resources.riskLevel > 10,
    generate: (s) => ({
      event: {
        id: `evt-${s.week}-juniorbreach`,
        week: s.week + 1,
        phase: s.phase,
        type: 'cascade',
        title: 'Junior Analyst Shares Confidential Details',
        description: "A junior member of the Solara deal team — an analyst seconded from another engagement — shared preliminary financial information with a peer at a competing firm. It has not yet reached a buyer, but the breach needs to be contained immediately.",
        resolved: false,
      },
      resourceEffects: { riskLevel: 15, clientTrust: -8, reputation: -6 },
      riskGenerated: {
        id: `risk-breach-${s.week}`,
        name: 'Confidentiality Breach',
        description: 'Internal team member shared preliminary deal information externally. Containment in progress.',
        category: 'team',
        severity: 'high',
        probability: 40,
        mitigated: false,
        surfacedWeek: s.week + 1,
        surfacedPhase: s.phase,
      },
    }),
  },

  // ── Phase 3: Additional Events ────────────────────────────────────────────
  {
    id: 'evt-strong-buyer-drops-early',
    phases: [3],
    probability: 0.13,
    condition: (s) => s.buyers.some((b) => b.executionCredibility >= 80 && b.status === 'contacted'),
    generate: (s) => {
      const dropBuyer = s.buyers.find((b) => b.executionCredibility >= 80 && b.status === 'contacted');
      return {
        event: {
          id: `evt-${s.week}-earlydrop`,
          week: s.week + 1,
          phase: s.phase,
          type: 'cascade',
          title: 'Premium Buyer Cites Internal M&A Freeze',
          description: `${dropBuyer?.name ?? 'A strong buyer'} has informed us they are subject to an internal M&A moratorium following a large acquisition they closed last quarter. They are interested in Solara but cannot act until Q2. This removes them from the current process.`,
          resolved: false,
        },
        resourceEffects: { dealMomentum: -9, clientTrust: -4 },
      };
    },
  },
  {
    id: 'evt-pre-nda-indicative',
    phases: [3],
    probability: 0.1,
    condition: (s) => s.buyers.some((b) => b.interest === 'hot' || b.interest === 'on_fire'),
    generate: (s) => {
      const hotBuyer = s.buyers.find((b) => b.interest === 'hot' || b.interest === 'on_fire');
      return {
        event: {
          id: `evt-${s.week}-prenda`,
          week: s.week + 1,
          phase: s.phase,
          type: 'passive',
          title: 'Buyer Makes Pre-NDA Indicative Bid',
          description: `${hotBuyer?.name ?? 'An enthusiastic buyer'} has submitted an indicative valuation range before even signing an NDA — an unusual but strong signal of strategic urgency. They are prepared to move on an accelerated timeline.`,
          resolved: false,
        },
        resourceEffects: { dealMomentum: 11, clientTrust: 5 },
      };
    },
  },
  {
    id: 'evt-competing-cim-circulating',
    phases: [3, 4],
    probability: 0.11,
    condition: (s) => s.resources.riskLevel > 12,
    generate: (s) => ({
      event: {
        id: `evt-${s.week}-compecim`,
        week: s.week + 1,
        phase: s.phase,
        type: 'cascade',
        title: 'Competing CIM Reaching Same Buyer Pool',
        description: "Word has reached us that a competing advisor is circulating a CIM for a similar IoT platform to some of the same buyers currently reviewing Solara. Buyers' investment bandwidth is not unlimited — this creates competition for attention.",
        resolved: false,
      },
      resourceEffects: { dealMomentum: -6, riskLevel: 5 },
    }),
  },
  {
    id: 'evt-cyber-audit',
    phases: [3],
    probability: 0.1,
    condition: (s) => s.buyers.some((b) => b.type === 'pe' && !['dropped', 'excluded'].includes(b.status)),
    generate: (s) => ({
      event: {
        id: `evt-${s.week}-cyber`,
        week: s.week + 1,
        phase: s.phase,
        type: 'active',
        title: 'Cyber Security Gap Found in Pre-Process Audit',
        description: "A pre-process technical review commissioned by a PE buyer's DD team has flagged outdated authentication protocols on Solara's customer portal. This is a material item that buyers will raise and needs a remediation plan before formal DD begins.",
        resolved: false,
      },
      resourceEffects: { riskLevel: 11, budget: -7 },
      riskGenerated: {
        id: `risk-cyber-${s.week}`,
        name: 'Cyber Security Vulnerability',
        description: 'Outdated authentication protocols flagged in pre-process audit. Buyers will require a remediation plan.',
        category: 'diligence',
        severity: 'medium',
        probability: 35,
        mitigated: false,
        surfacedWeek: s.week + 1,
        surfacedPhase: s.phase,
      },
    }),
  },

  // ── Phase 4: Additional Events ────────────────────────────────────────────
  {
    id: 'evt-shortlisted-buyer-acquired',
    phases: [4],
    probability: 0.09,
    condition: (s) => s.buyers.filter((b) => b.status === 'shortlisted').length >= 2,
    generate: (s) => {
      const shortlisted = s.buyers.filter((b) => b.status === 'shortlisted');
      const acquired = shortlisted[Math.floor(Math.random() * shortlisted.length)];
      return {
        event: {
          id: `evt-${s.week}-buyeracq`,
          week: s.week + 1,
          phase: s.phase,
          type: 'cascade',
          title: 'Shortlisted Buyer Gets Acquired',
          description: `${acquired.name} has announced it is itself being acquired by a larger competitor. Their M&A team is frozen pending integration — they can no longer participate in the Solara process. Competitive tension reduces.`,
          resolved: false,
        },
        resourceEffects: { dealMomentum: -7 },
      };
    },
  },
  {
    id: 'evt-client-pushes-back-shortlist',
    phases: [4],
    probability: 0.14,
    condition: (s) => s.resources.clientTrust < 70,
    generate: (s) => ({
      event: {
        id: `evt-${s.week}-clientshort`,
        week: s.week + 1,
        phase: s.phase,
        type: 'active',
        title: 'Client Wants a Different Shortlist',
        description: "Ricardo has reviewed the shortlist and disagrees with two of the exclusions. He argues one excluded buyer is 'strategically interesting' despite low execution credibility. Reopening this debate could complicate the process.",
        resolved: false,
      },
      resourceEffects: { clientTrust: -4, dealMomentum: -3 },
    }),
  },
  {
    id: 'evt-serious-buyer-site-visit',
    phases: [4, 5],
    probability: 0.12,
    condition: (s) => s.buyers.some((b) => b.status === 'shortlisted' && b.executionCredibility >= 75),
    generate: (s) => ({
      event: {
        id: `evt-${s.week}-sitevisit`,
        week: s.week + 1,
        phase: s.phase,
        type: 'passive',
        title: 'Shortlisted Buyer Requests Site Visit',
        description: "A shortlisted buyer has requested an early site visit to Solara's offices — ahead of the scheduled management presentation timeline. This signals very serious intent and gives Ricardo an early read on chemistry.",
        resolved: false,
      },
      resourceEffects: { dealMomentum: 6, clientTrust: 4 },
    }),
  },
  {
    id: 'evt-interest-rate-spike',
    phases: [3, 4, 5, 6, 7],
    probability: 0.07,
    condition: (s) => s.buyers.some((b) => b.type === 'pe' && !['dropped', 'excluded'].includes(b.status)),
    generate: (s) => ({
      event: {
        id: `evt-${s.week}-rates`,
        week: s.week + 1,
        phase: s.phase,
        type: 'cascade',
        title: 'Central Bank Rate Hike Squeezes PE Leverage',
        description: "The ECB has raised rates unexpectedly by 50bps. PE buyers' leveraged buyout models are re-running with higher cost of debt. At least one PE buyer has asked for a 24-hour pause to remodel. The strategic buyers are unaffected.",
        resolved: false,
      },
      resourceEffects: { dealMomentum: -8, riskLevel: 7 },
    }),
  },

  // ── Phase 5: Additional Events ────────────────────────────────────────────
  {
    id: 'evt-double-nbo-same-day',
    phases: [5],
    probability: 0.12,
    condition: (s) => s.buyers.filter((b) => b.status === 'bidding').length >= 2,
    generate: (s) => ({
      event: {
        id: `evt-${s.week}-doublenbo`,
        week: s.week + 1,
        phase: s.phase,
        type: 'passive',
        title: 'Two NBOs Arrive on the Same Day',
        description: 'Two competitive NBOs have been submitted within hours of each other — both at the upper end of expectations. The near-simultaneous timing suggests mutual awareness of the other party. Competitive tension is at its highest point.',
        resolved: false,
      },
      resourceEffects: { dealMomentum: 12, clientTrust: 7 },
    }),
  },
  {
    id: 'evt-client-rejects-all-nbos',
    phases: [5],
    probability: 0.1,
    condition: (s) => s.resources.clientTrust < 60 && s.buyers.filter((b) => b.status === 'bidding').length >= 1,
    generate: (s) => ({
      event: {
        id: `evt-${s.week}-rejectnbo`,
        week: s.week + 1,
        phase: s.phase,
        type: 'active',
        title: "Client Dissatisfied With All NBOs",
        description: "Ricardo has reviewed the indicative offers and is disappointed with all of them. He says the valuations are 'at least 20% below what the business is worth' and is asking whether the process should be restarted with a wider universe. You need to manage his expectations carefully.",
        resolved: false,
      },
      resourceEffects: { clientTrust: -8, dealMomentum: -6 },
      emailGenerated: {
        id: `email-rejectnbo-${s.week}`,
        week: s.week + 1,
        phase: s.phase,
        sender: 'Ricardo Mendes',
        senderRole: 'Founder & CEO, Solara Systems',
        subject: 'These offers are not acceptable',
        body: "I've reviewed the indicative bids and I have to be honest — I'm disappointed.\n\nThe best offer is €48M. My expectation was €60M plus. I built this business for 11 years and this doesn't reflect what it's worth.\n\nIs it possible to reopen the process? Or at least push back harder on these numbers?",
        preview: 'Ricardo rejects all NBOs — wants to push for higher valuation...',
        category: 'client',
        state: 'unread',
        priority: 'urgent',
        timestamp: `Week ${s.week + 1}, Thursday`,
        responseOptions: [
          { id: 'r1', label: 'Validate his concern but explain why the offers reflect the market — guide expectations', effects: '+5 trust, +4 momentum (realistic approach)', resourceEffects: { clientTrust: 5, dealMomentum: 4 } },
          { id: 'r2', label: 'Go back to buyers for best and final offers — create auction pressure', effects: '+6 momentum, -3 trust (risky if buyers don\'t stretch)', resourceEffects: { dealMomentum: 6, clientTrust: -3 } },
          { id: 'r3', label: 'Propose running a limited second phase with new buyers', effects: '-8 momentum, +4 trust (major delay)', resourceEffects: { dealMomentum: -8, clientTrust: 4 } },
        ],
      },
    }),
  },
  {
    id: 'evt-consortium-breaks',
    phases: [5],
    probability: 0.1,
    condition: (s) => s.buyers.filter((b) => b.status === 'bidding').length >= 2,
    generate: (s) => ({
      event: {
        id: `evt-${s.week}-consorbreak`,
        week: s.week + 1,
        phase: s.phase,
        type: 'cascade',
        title: 'Buyer Consortium Collapses',
        description: "Two buyers who had agreed to submit a joint NBO have split up. Each will now bid independently. This unexpectedly increases competitive tension — but also means each party's firepower is reduced without the combined equity.",
        resolved: false,
      },
      resourceEffects: { dealMomentum: 4, riskLevel: 5 },
    }),
  },
  {
    id: 'evt-industry-riskoff',
    phases: [4, 5, 6],
    probability: 0.08,
    condition: (s) => s.resources.dealMomentum > 30,
    generate: (s) => ({
      event: {
        id: `evt-${s.week}-riskoff`,
        week: s.week + 1,
        phase: s.phase,
        type: 'cascade',
        title: "Sector M&A Slowdown Creates 'Risk-Off' Sentiment",
        description: "Three major European tech M&A processes have paused in the last week, cited as 'macro uncertainty.' Buyers' investment committees are becoming more cautious and increasing their required return thresholds. Expect more scrutiny on assumptions.",
        resolved: false,
      },
      resourceEffects: { dealMomentum: -7, riskLevel: 8 },
    }),
  },

  // ── Phase 6: Additional Events ────────────────────────────────────────────
  {
    id: 'evt-dd-question-unanswered',
    phases: [6],
    probability: 0.15,
    condition: (s) => s.week >= 28,
    generate: (s) => ({
      event: {
        id: `evt-${s.week}-ddq`,
        week: s.week + 1,
        phase: s.phase,
        type: 'active',
        title: 'Buyer Threatens Reprice on Unanswered DD',
        description: "A core DD question on Solara's customer contract termination rights has been in the dataroom for 12 days without a response. The buyer's legal team has written to say that if it is not addressed in 48 hours, they will reflect the risk in a revised valuation.",
        resolved: false,
      },
      resourceEffects: { dealMomentum: -7, riskLevel: 9, budget: -5 },
    }),
  },
  {
    id: 'evt-mgmt-qa-heated',
    phases: [6],
    probability: 0.12,
    condition: (s) => s.resources.clientTrust < 70,
    generate: (s) => ({
      event: {
        id: `evt-${s.week}-qaheated`,
        week: s.week + 1,
        phase: s.phase,
        type: 'active',
        title: 'Management Presentation Q&A Gets Heated',
        description: "During the management presentation Q&A session, a PE buyer's associate asked an aggressive question about customer concentration. Ricardo responded defensively and the session ended on a poor note. Buyers left with concerns about his composure under pressure.",
        resolved: false,
      },
      resourceEffects: { clientTrust: -5, dealMomentum: -6 },
    }),
  },
  {
    id: 'evt-dataroom-security',
    phases: [6],
    probability: 0.09,
    condition: (s) => s.resources.riskLevel > 18,
    generate: (s) => ({
      event: {
        id: `evt-${s.week}-drmsec`,
        week: s.week + 1,
        phase: s.phase,
        type: 'cascade',
        title: 'Dataroom Access Anomaly Detected',
        description: "The dataroom provider has flagged that an authorised user account downloaded a large number of documents outside normal business hours from an unrecognised IP address. It may be authorised — or a security issue. Investigation required.",
        resolved: false,
      },
      resourceEffects: { riskLevel: 12, clientTrust: -4 },
    }),
  },
  {
    id: 'evt-dd-extension-requested',
    phases: [6],
    probability: 0.14,
    condition: (s) => s.week >= 30,
    generate: (s) => ({
      event: {
        id: `evt-${s.week}-ddextend`,
        week: s.week + 1,
        phase: s.phase,
        type: 'active',
        title: 'Buyer Requests DD Timeline Extension',
        description: "The lead buyer's external DD team is running 2 weeks behind schedule. They are requesting a 10-day extension to complete financial and commercial DD. Ricardo is unhappy about the delay. You need to decide whether to grant it.",
        resolved: false,
      },
      resourceEffects: { dealMomentum: -5, clientTrust: -3 },
      emailGenerated: {
        id: `email-ddextend-${s.week}`,
        week: s.week + 1,
        phase: s.phase,
        sender: 'Kestrel Capital Partners',
        senderRole: 'Deal Lead',
        subject: 'Request: DD timeline extension — 10 additional days',
        body: "Our DD team has encountered unexpected depth in the financial and commercial analysis. We are running approximately 10 working days behind the original schedule.\n\nWe would like to request a formal extension. We remain committed to the process and our indicative offer range — this is purely a resourcing matter.\n\nWe hope this can be accommodated.",
        preview: 'Lead buyer requests 10-day DD extension...',
        category: 'buyer',
        state: 'unread',
        priority: 'high',
        timestamp: `Week ${s.week + 1}, Wednesday`,
        responseOptions: [
          { id: 'r1', label: 'Grant the extension — better quality DD than a rushed process', effects: '-4 momentum, +4 trust (buyer relationship)', resourceEffects: { dealMomentum: -4, clientTrust: 4 } },
          { id: 'r2', label: "Grant 5 days only — protect timeline but show goodwill", effects: '-2 momentum', resourceEffects: { dealMomentum: -2 } },
          { id: 'r3', label: 'Decline — other buyers are on schedule; this creates inequality', effects: '+3 momentum, -5 buyer trust (risk they drop)', resourceEffects: { dealMomentum: 3, clientTrust: -5 } },
        ],
      },
    }),
  },

  // ── Phase 7: Additional Events ────────────────────────────────────────────
  {
    id: 'evt-preferred-gets-cold-feet',
    phases: [7],
    probability: 0.12,
    condition: (s) => s.resources.dealMomentum < 60,
    generate: (s) => ({
      event: {
        id: `evt-${s.week}-coldfeet`,
        week: s.week + 1,
        phase: s.phase,
        type: 'cascade',
        title: 'Preferred Bidder Signals Price Hesitation',
        description: "The preferred bidder's CFO has sent an informal note saying their board is 'less comfortable' with the valuation after final sensitivity analysis. They are not withdrawing but are signalling a desire to discuss price before final submission.",
        resolved: false,
      },
      resourceEffects: { dealMomentum: -8, clientTrust: -5 },
    }),
  },
  {
    id: 'evt-late-third-party',
    phases: [7],
    probability: 0.1,
    condition: (s) => s.resources.dealMomentum > 50,
    generate: (s) => ({
      event: {
        id: `evt-${s.week}-lateparty`,
        week: s.week + 1,
        phase: s.phase,
        type: 'active',
        title: 'Third Party Approaches With Late Interest',
        description: "A previously uninvolved strategic has reached out through a banker expressing serious interest. They are asking whether it is too late to participate. Including them would add leverage but delay the process by at least 3 weeks.",
        resolved: false,
      },
      resourceEffects: { dealMomentum: 5, riskLevel: 6 },
      emailGenerated: {
        id: `email-lateparty-${s.week}`,
        week: s.week + 1,
        phase: s.phase,
        sender: 'Marcus Aldridge',
        senderRole: 'Managing Partner, Clearwater Advisory',
        subject: 'Late inbound — do we let Meridian Group in?',
        body: "Received a call from James Whitfield at Harrison & Co. He represents Meridian Group — a well-capitalised strategic that has been watching from the sidelines.\n\nThey've asked if it's too late to receive materials and submit a final offer.\n\nMeridian could meaningfully improve competitive tension. But it adds 3+ weeks and risks alienating current bidders who've invested heavily in the process.",
        preview: 'Late-stage strategic buyer wants to join — do we let them in?',
        category: 'partner',
        state: 'unread',
        priority: 'high',
        timestamp: `Week ${s.week + 1}, Tuesday`,
        responseOptions: [
          { id: 'r1', label: 'Allow Meridian in on a compressed timeline — max competitive tension', effects: '+9 momentum, +6 risk (delay), -4 trust (Ricardo nervous)', resourceEffects: { dealMomentum: 9, riskLevel: 6, clientTrust: -4 } },
          { id: 'r2', label: 'Invite them for a bilateral track only — keep main process intact', effects: '+5 momentum, +3 risk', resourceEffects: { dealMomentum: 5, riskLevel: 3 } },
          { id: 'r3', label: 'Decline — process is too advanced and existing bidders deserve protection', effects: '+3 trust, -3 momentum', resourceEffects: { clientTrust: 3, dealMomentum: -3 } },
        ],
      },
    }),
  },
  {
    id: 'evt-earnout-heavy-structure',
    phases: [7],
    probability: 0.11,
    condition: (s) => s.buyers.some((b) => b.valuationPosture === 'conservative' && !['dropped', 'excluded'].includes(b.status)),
    generate: (s) => ({
      event: {
        id: `evt-${s.week}-earnout`,
        week: s.week + 1,
        phase: s.phase,
        type: 'active',
        title: 'Unconventional Earnout-Heavy Offer',
        description: "One bidder has structured their final offer with 35% of consideration as a 3-year earnout tied to ARR growth targets that management considers aggressive. Ricardo finds the headline number attractive but is concerned about the contingent element.",
        resolved: false,
      },
      resourceEffects: { dealMomentum: -4, clientTrust: -3 },
    }),
  },

  // ── Phase 8: Additional Events ────────────────────────────────────────────
  {
    id: 'evt-seller-new-spa-clauses',
    phases: [8],
    probability: 0.13,
    condition: (s) => s.week >= 35,
    generate: (s) => ({
      event: {
        id: `evt-${s.week}-newclauses`,
        week: s.week + 1,
        phase: s.phase,
        type: 'active',
        title: "Seller's Lawyers Introduce New SPA Clauses",
        description: "Ricardo's legal team has introduced three new clauses into the SPA draft at a late stage: a material adverse change carve-out, an enhanced management retention covenant, and a change-of-control consent requirement on the top 5 contracts. Buyer counsel is unhappy with the late additions.",
        resolved: false,
      },
      resourceEffects: { dealMomentum: -6, riskLevel: 7 },
    }),
  },
  {
    id: 'evt-tax-authority-inquiry',
    phases: [8],
    probability: 0.1,
    condition: (s) => s.resources.riskLevel > 20,
    generate: (s) => ({
      event: {
        id: `evt-${s.week}-tax`,
        week: s.week + 1,
        phase: s.phase,
        type: 'cascade',
        title: 'Tax Authority Issues Inquiry',
        description: "The Portuguese tax authority has opened an inquiry into Solara's transfer pricing arrangements for its subsidiary in Ireland. The inquiry is routine but creates uncertainty about potential liability. Buyers are requesting clarification on the exposure before SPA signature.",
        resolved: false,
      },
      resourceEffects: { riskLevel: 14, dealMomentum: -7 },
      riskGenerated: {
        id: `risk-tax-${s.week}`,
        name: 'Tax Authority Inquiry',
        description: 'Transfer pricing inquiry opened by Portuguese tax authority. Potential liability unclear.',
        category: 'legal',
        severity: 'high',
        probability: 40,
        mitigated: false,
        surfacedWeek: s.week + 1,
        surfacedPhase: s.phase,
      },
    }),
  },
  {
    id: 'evt-buyer-ceo-change',
    phases: [8],
    probability: 0.09,
    condition: (s) => s.buyers.some((b) => b.status === 'preferred'),
    generate: (s) => ({
      event: {
        id: `evt-${s.week}-ceochg`,
        week: s.week + 1,
        phase: s.phase,
        type: 'cascade',
        title: "Buyer's CEO Changes — New Decision-Maker",
        description: "The preferred buyer has announced that its CEO is stepping down effective next month. The incoming CEO is unknown — and may have different views on the acquisition strategy. The deal team needs to re-establish alignment with new senior stakeholders.",
        resolved: false,
      },
      resourceEffects: { dealMomentum: -10, riskLevel: 9 },
    }),
  },

  // ── Phase 9-10: Additional Events ─────────────────────────────────────────
  {
    id: 'evt-bank-wire-delay',
    phases: [10],
    probability: 0.12,
    condition: (s) => s.resources.riskLevel < 35,
    generate: (s) => ({
      event: {
        id: `evt-${s.week}-wiredelay`,
        week: s.week + 1,
        phase: s.phase,
        type: 'active',
        title: 'Bank Wire Delayed on Closing Day',
        description: "The buyer's bank has flagged a compliance hold on the closing wire — a €47M transfer requires enhanced due diligence under AML regulations. Ricardo is waiting. The legal team has been on a conference call for four hours.",
        resolved: false,
      },
      resourceEffects: { riskLevel: 6, morale: -5, clientTrust: -3 },
    }),
  },
  {
    id: 'evt-victory-leak',
    phases: [9, 10],
    probability: 0.09,
    condition: (s) => s.resources.dealMomentum > 55,
    generate: (s) => ({
      event: {
        id: `evt-${s.week}-victleak`,
        week: s.week + 1,
        phase: s.phase,
        type: 'cascade',
        title: "Team Member Leaks Signing News Prematurely",
        description: "A team member posted a cryptic congratulatory message on LinkedIn before the official announcement. This triggered press speculation and a call from the buyer's communications team. The announcement is being brought forward to contain the story.",
        resolved: false,
      },
      resourceEffects: { riskLevel: 7, reputation: -4, clientTrust: -3 },
    }),
  },
  {
    id: 'evt-regulatory-final-push',
    phases: [9],
    probability: 0.13,
    condition: (s) => s.resources.riskLevel > 20,
    generate: (s) => ({
      event: {
        id: `evt-${s.week}-regfinal`,
        week: s.week + 1,
        phase: s.phase,
        type: 'active',
        title: 'Regulatory Clearance: Final Information Burst',
        description: "Competition counsel has received a final supplementary questionnaire from the antitrust regulator requesting detailed market share data across 12 sub-segments. Response deadline is 5 working days. Full team mobilisation required.",
        resolved: false,
      },
      resourceEffects: { riskLevel: 8, budget: -6, dealMomentum: -4 },
    }),
  },

  // ── Additional Cross-Phase Events ─────────────────────────────────────────
  {
    id: 'evt-deal-pause-personal',
    phases: [3, 4, 5, 6],
    probability: 0.07,
    condition: (s) => s.resources.clientTrust < 60,
    generate: (s) => ({
      event: {
        id: `evt-${s.week}-pause`,
        week: s.week + 1,
        phase: s.phase,
        type: 'cascade',
        title: "Client Requests Brief Process Pause",
        description: "Ricardo has asked for a one-week pause in buyer communications. He has not explained why. The team suspects a family matter. All scheduled buyer meetings are on hold.",
        resolved: false,
      },
      resourceEffects: { dealMomentum: -6, riskLevel: 5 },
    }),
  },
  {
    id: 'evt-lateral-hire-interest',
    phases: [4, 5, 6, 7],
    probability: 0.07,
    condition: (s) => s.resources.reputation > 65,
    generate: (s) => ({
      event: {
        id: `evt-${s.week}-lateral`,
        week: s.week + 1,
        phase: s.phase,
        type: 'passive',
        title: 'Clearwater Attracts Lateral Hire Interest',
        description: "The Solara process profile has attracted attention from an MD at a bulge-bracket firm who has reached out to Marcus about a lateral move to Clearwater. It signals the firm's growing reputation in the European tech M&A space.",
        resolved: false,
      },
      resourceEffects: { reputation: 7, morale: 4 },
    }),
  },
  {
    id: 'evt-shadow-advisor',
    phases: [2, 3, 4],
    probability: 0.1,
    condition: (s) => s.resources.clientTrust < 65 && s.week >= 8,
    generate: (s) => ({
      event: {
        id: `evt-${s.week}-shadowadv`,
        week: s.week + 1,
        phase: s.phase,
        type: 'cascade',
        title: "Ricardo Consults Another Advisor Quietly",
        description: "It has come to light that Ricardo has been taking informal advice from a retired investment banker — a family friend — without informing Clearwater. The advice appears to be conflicting with the process strategy.",
        resolved: false,
      },
      resourceEffects: { clientTrust: -7, dealMomentum: -5 },
    }),
  },
  {
    id: 'evt-deal-awards-recognition',
    phases: [9, 10],
    probability: 0.08,
    condition: (s) => s.resources.reputation > 60,
    generate: (s) => ({
      event: {
        id: `evt-${s.week}-awards`,
        week: s.week + 1,
        phase: s.phase,
        type: 'passive',
        title: 'Deal Shortlisted for Industry Award',
        description: "The Solara transaction has been shortlisted for 'Boutique Deal of the Year' at a major European M&A awards ceremony. This is excellent for Clearwater's profile and validates the approach taken throughout the process.",
        resolved: false,
      },
      resourceEffects: { reputation: 10, morale: 6 },
    }),
  },
  {
    id: 'evt-key-advisor-falls-ill',
    phases: [3, 4, 5, 6],
    probability: 0.07,
    condition: (s) => s.resources.morale < 65,
    generate: (s) => ({
      event: {
        id: `evt-${s.week}-illhealth`,
        week: s.week + 1,
        phase: s.phase,
        type: 'active',
        title: 'Key Advisor Temporarily Unavailable',
        description: "A key member of the deal team is out for 5 days due to illness. Their portfolio of buyer interactions and dataroom management now falls on the remaining team. Workload and risk increase temporarily.",
        resolved: false,
      },
      resourceEffects: { morale: -7, riskLevel: 6, dealMomentum: -3 },
    }),
  },
];

function rollEvents(state: GameStore): {
  events: GameEvent[];
  resourceEffects: Partial<PlayerResources>;
  risks: Risk[];
  emails: Email[];
} {
  const result = {
    events: [] as GameEvent[],
    resourceEffects: {} as Record<string, number>,
    risks: [] as Risk[],
    emails: [] as Email[],
  };

  // Track fired event IDs to prevent duplicates within a session
  const firedIds = new Set(state.events.map((e) => e.id));

  // Variable event density — some sessions are quiet, others chaotic
  // Roll fresh each advance so density fluctuates naturally throughout a game
  const densityRoll = Math.random();
  const densityMultiplier = densityRoll < 0.20 ? 0.25   // 20%: very quiet stretch
    : densityRoll < 0.50 ? 0.6                          // 30%: calm period
    : densityRoll < 0.80 ? 1.0                          // 30%: normal activity
    : densityRoll < 0.95 ? 1.5                          // 15%: busy period
    : 2.2;                                               //  5%: everything happens at once

  for (const template of EVENT_POOL) {
    // Phase check
    if (!template.phases.includes(state.phase)) continue;

    // Don't fire same event template twice in close succession
    const recentlyFired = state.events.some(
      (e) => e.id.includes(template.id.replace('evt-', '')) && state.week - e.week < 3
    );
    if (recentlyFired) continue;

    // Condition check
    if (template.condition && !template.condition(state)) continue;

    // Probability roll with density scaling
    if (Math.random() > template.probability * densityMultiplier) continue;

    const generated = template.generate(state);

    // Prevent duplicate event IDs
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
  const inProgressTasks = state.tasks.filter((t) => t.status === 'in_progress');
  const newDay = state.day + daysToAdvance;
  const newWeek = Math.ceil(newDay / 7);

  // 1. Resolve task progress
  const tasksCompleted: GameTask[] = [];
  const tasksProgressed: GameTask[] = [];

  for (const task of inProgressTasks) {
    const outcome = resolveTaskProgress(task, newWeek, state.tempCapacityAllocations, daysToAdvance);
    if (outcome === 'completed') {
      tasksCompleted.push(task);
    } else {
      tasksProgressed.push(task);
    }
  }

  // 2. Calculate resource consumption
  const resourceConsumption = calculateResourceConsumption(inProgressTasks, state.resources, state.tempCapacityAllocations, daysToAdvance);

  // 3. Calculate state changes from completions
  const stateChanges = calculateStateChanges(tasksCompleted, state.resources);

  // 4. Check for hidden workload
  const hiddenWorkload = checkHiddenWorkload(tasksCompleted);

  // 4b. Roll critical outcomes for completed tasks
  const criticalOutcomes = rollCriticalOutcomes(tasksCompleted);

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
  let resourceChanges: Partial<PlayerResources> = {
    ...resourceConsumption,
    ...stateChanges,
  };

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

  // 6. Risk level adjustment
  const riskDelta = hiddenWorkload ? 5 : (tasksCompleted.length > 0 ? -2 : 1);
  resourceChanges.riskLevel = Math.max(0, Math.min(100, state.resources.riskLevel + riskDelta));

  // 7. Buyer progression
  const buyerResult = progressBuyers(state.buyers, tasksCompleted, state.phase, state.resources.dealMomentum);

  // 9. Event system
  const eventResult = rollEvents(state);

  // 9b. Resolve pending budget requests (Board decision)
  const resolvedRequests: { id: string; approved: boolean; amount: number; justification: string }[] = [];
  for (const req of state.budgetRequests) {
    if (req.status === 'pending') {
      // Logic: Higher client trust and reasonable amount increases approval chance
      // Max approval chance 90% at 100 trust; Min 10%
      const approvalChance = (state.resources.clientTrust / 100) * 0.8 + 0.1;
      const approved = Math.random() < approvalChance;
      const approvedAmount = approved ? req.amount : 0;
      
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
          ? `The Board has reviewed your request for €${req.amount}k regarding: "${req.justification}". \n\nGiven the current deal trajectory, we have approved this additional allocation. Spend it wisely.`
          : `We have reviewed your request for extra budget. At this stage, the Committee is not convinced that additional spend is justified. Focus on the core workstreams.`,
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
    // Chance based on deal momentum and reputation
    const approvalChance = (state.resources.dealMomentum / 100) * 0.6 + (state.resources.reputation / 100) * 0.3 + 0.1;
    const approved = Math.random() < approvalChance;
    const notes = approved
      ? "The Investment Committee has reviewed the Solara opportunity. Given the sector tailwinds and founder profile, we approve the mandate. Proceed to formal pitch."
      : "The Committee remains concerned about the founder's valuation expectations and current deal momentum. We are not prepared to release further resources at this stage. Strengthen the investment case.";
    
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
    if (k === 'budget') {
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

  // Apply stochastic noise — small random drift makes each advance feel unique
  resourceChanges = applyResourceNoise(resourceChanges, state);

  // ─── Phase 6: Binding Offer Deadline Evaluation ──────────────────────────────
  // When the process letter deadline passes, evaluate each active buyer's likelihood
  // of submitting a binding offer. Three dropout risk factors:
  //   1. High risk level (undisclosed DD issues from poor preparation)
  //   2. Weak dataroom (not enough documents at full/partial access)
  //   3. High unaddressed Q&A count (slow or incomplete Q&A responses)
  let bindingOfferDelta = 0;
  const updatedBuyersAfterDeadline = [...state.buyers];

  if (
    state.phase === 6 &&
    state.phaseDeadline !== null &&
    newDay >= state.phaseDeadline &&
    state.day < state.phaseDeadline // only trigger once when crossing the deadline
  ) {
    // Compute dataroom completeness (% of categories with 'full' or 'partial' access)
    const totalCats = state.dataroomCategories.length;
    const openCats = state.dataroomCategories.filter(c => c.accessLevel === 'full' || c.accessLevel === 'partial').length;
    const dataroomScore = totalCats > 0 ? openCats / totalCats : 0; // 0–1

    // Active DD buyers who haven't yet submitted
    const ddBuyers = updatedBuyersAfterDeadline.filter(
      b => !['dropped', 'excluded'].includes(b.status) && !b.bindingOfferSubmitted
    );

    for (const buyer of ddBuyers) {
      // Base dropout probability
      let dropoutP = 0.15; // 15% base

      // Factor 1: Risk level from undisclosed DD issues
      const riskPenalty = Math.max(0, (state.resources.riskLevel - 40) / 100 * 0.4);
      dropoutP += riskPenalty;

      // Factor 2: Weak dataroom
      if (dataroomScore < 0.5) dropoutP += 0.30;
      else if (dataroomScore < 0.75) dropoutP += 0.12;

      // Factor 3: Unaddressed Q&A
      const qaPenalty = Math.min(0.30, (state.unaddressedQACount / 5) * 0.15);
      dropoutP += qaPenalty;

      // Buyer-specific modifier: high DD friction buyers are more likely to drop
      if (buyer.ddFriction === 'high') dropoutP += 0.15;
      else if (buyer.ddFriction === 'medium') dropoutP += 0.05;

      dropoutP = Math.min(0.95, dropoutP);

      const rolled = Math.random();
      const submits = rolled > dropoutP;

      const idx = updatedBuyersAfterDeadline.findIndex(b => b.id === buyer.id);
      if (submits) {
        updatedBuyersAfterDeadline[idx] = { ...buyer, bindingOfferSubmitted: true, status: 'bidding' };
        bindingOfferDelta += 1;
        eventResult.emails.push({
          id: `email-bindoffer-${buyer.id}-${Date.now()}`,
          week: newWeek,
          phase: 6,
          sender: buyer.name,
          senderRole: 'Corporate Development',
          subject: `Binding Offer Submitted — ${buyer.name}`,
          body: `We are pleased to confirm submission of our binding offer ahead of the process letter deadline. Our legal team has also returned a marked-up draft SPA for your review. We remain committed to completing this transaction on a timely basis and look forward to your feedback.`,
          preview: `Binding offer and SPA mark-up received from ${buyer.name}.`,
          category: 'buyer',
          state: 'unread',
          priority: 'high',
          timestamp: `Week ${newWeek}`,
          linkedEntityId: buyer.id,
          linkedEntityType: 'buyer',
        });
      } else {
        // Determine the main dropout reason for the email
        const reason =
          riskPenalty > 0.20 ? 'material issues identified during due diligence that were not adequately disclosed in the data room'
          : dataroomScore < 0.5 ? 'insufficient documentation in the data room to complete their legal and financial review'
          : state.unaddressedQACount > 3 ? 'outstanding Q&A requests that were not responded to in a timely manner'
          : 'internal constraints and transaction priorities';

        updatedBuyersAfterDeadline[idx] = { ...buyer, status: 'dropped', bindingOfferSubmitted: false };
        eventResult.emails.push({
          id: `email-dropout-${buyer.id}-${Date.now()}`,
          week: newWeek,
          phase: 6,
          sender: buyer.name,
          senderRole: 'Corporate Development',
          subject: `Process Withdrawal — ${buyer.name}`,
          body: `Following our internal review, we regret to inform you that we will not be submitting a binding offer by the process letter deadline. This decision was driven by ${reason}. We wish you and your client success in completing this transaction.`,
          preview: `${buyer.name} has withdrawn from the process.`,
          category: 'buyer',
          state: 'unread',
          priority: 'high',
          timestamp: `Week ${newWeek}`,
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
  };

  const narrativeSummary = generateSummary(partialResult, newWeek);

  return {
    ...partialResult,
    daysAdvanced: daysToAdvance,
    narrativeSummary,
    _updatedBuyers: updatedBuyersAfterDeadline,
    bindingOfferDelta,
  };
}

// ============================================
// Calculate Days to Next Meaningful Event
// ============================================

export function calcDaysToAdvance(state: GameStore): number {
  let days = 7; // default: advance a full week if nothing is urgent

  // Urgent unread emails: check inbox tomorrow
  if (state.emails.some((e) => e.priority === 'urgent' && e.state === 'unread')) {
    days = Math.min(days, 1);
  }

  // Low complexity tasks: complete in 1 day
  const inProgress = state.tasks.filter((t) => t.status === 'in_progress');
  if (inProgress.some((t) => t.complexity === 'low')) {
    days = Math.min(days, 1);
  }

  // Medium complexity tasks: 2-3 days
  if (inProgress.some((t) => t.complexity === 'medium')) {
    days = Math.min(days, 2 + Math.floor(Math.random() * 2));
  }

  // High complexity tasks: 3-5 days (give the team time to work)
  if (inProgress.some((t) => t.complexity === 'high') && days > 3) {
    days = Math.min(days, 3 + Math.floor(Math.random() * 3));
  }

  // Pending board submission: board convenes in 2-3 days
  if (state.boardSubmission?.status === 'pending') {
    days = Math.min(days, 2 + Math.floor(Math.random() * 2));
  }

  // Pending budget request: IC responds in 2 days
  if (state.budgetRequests.some((r) => r.status === 'pending')) {
    days = Math.min(days, 2);
  }

  // Active competitor threat: urgent counter-action needed
  if (state.competitorThreats.some((t) => !t.resolved)) {
    days = Math.min(days, 2 + Math.floor(Math.random() * 2));
  }

  return Math.max(1, Math.min(7, days));
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
  requirements: { label: string; met: boolean }[];
  nextPhase: PhaseId;
}

export function checkPhaseGate(state: GameStore): PhaseGateResult {
  const { phase, tasks, resources } = state;
  const phaseTasks = tasks.filter((t) => t.phase === phase);
  const completedCount = phaseTasks.filter((t) => t.status === 'completed').length;
  const totalCount = phaseTasks.length;

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
        nextPhase: 1,
      };
    }

    case 1: { // Pitch & Mandate → Preparation
      const pitchPresented = state.feeNegotiation?.pitchPresented === true;
      const feeAgreed = state.feeNegotiation?.status === 'agreed' || state.agreedFeeTerms !== null;
      return {
        canTransition: pitchPresented && feeAgreed,
        requirements: [
          { label: 'Pitch document prepared', met: state.pitchDocumentReady === true },
          { label: 'Pitch presented to client', met: pitchPresented },
          { label: 'Fee terms agreed', met: feeAgreed },
        ],
        nextPhase: 2,
      };
    }

    case 2: { // Preparation → Market Outreach
      const modelDone = tasks.find((t) => t.id === 'task-20')?.status === 'completed';
      const cimDone = tasks.find((t) => t.id === 'task-21')?.status === 'completed';
      const teaserDone = tasks.find((t) => t.id === 'task-22')?.status === 'completed';
      const buyerListDone = tasks.find((t) => t.id === 'task-25')?.status === 'completed';

      return {
        canTransition: !!modelDone && !!cimDone && !!teaserDone && !!buyerListDone,
        requirements: [
          { label: 'Financial model completed', met: !!modelDone },
          { label: 'CIM drafted', met: !!cimDone },
          { label: 'Teaser prepared', met: !!teaserDone },
          { label: 'Buyer list approved by client', met: !!buyerListDone },
        ],
        nextPhase: 3,
      };
    }

    case 3: { // Market Outreach → Shortlist — deadline-gated
      const outreachLaunched = tasks.find((t) => t.id === 'task-40')?.status === 'completed';
      const ndasProcessed = tasks.find((t) => t.id === 'task-42')?.status === 'completed';
      const qaResponded = tasks.find((t) => t.id === 'task-46')?.status === 'completed';
      const buyerQualified = tasks.find((t) => t.id === 'task-48')?.status === 'completed';
      const activeBuyersWithNDA = state.buyers.filter(b => b.status === 'nda_signed' || b.status === 'reviewing' || b.status === 'active' || b.status === 'shortlisted' || b.status === 'bidding').length;
      const deadlineSet = state.phaseDeadline !== null;
      const deadlinePassed = deadlineSet && state.day >= (state.phaseDeadline ?? Infinity);
      const enoughBuyers = activeBuyersWithNDA >= 10;

      return {
        canTransition: !!outreachLaunched && !!ndasProcessed && !!qaResponded && !!buyerQualified && (enoughBuyers || deadlinePassed),
        requirements: [
          { label: 'Outreach deadline set', met: deadlineSet },
          { label: 'Tier 1 outreach launched', met: !!outreachLaunched },
          { label: 'NDAs processed', met: !!ndasProcessed },
          { label: 'Buyer Q&A responded', met: !!qaResponded },
          { label: 'Buyers qualified', met: !!buyerQualified },
          { label: `Buyers with NDA: ${activeBuyersWithNDA}/10 or deadline reached`, met: enoughBuyers || deadlinePassed },
        ],
        nextPhase: 4,
      };
    }

    case 4: { // Shortlist → Non-Binding Offers — deadline-gated
      const shortlistBuilt = tasks.find((t) => t.id === 'task-61')?.status === 'completed';
      const clientApproved = tasks.find((t) => t.id === 'task-63')?.status === 'completed';
      const processNote = tasks.find((t) => t.id === 'task-64')?.status === 'completed';
      const shortlistedBuyers = state.buyers.filter(b => b.status === 'shortlisted' || b.status === 'bidding').length;
      const deadlineSet = state.phaseDeadline !== null;
      const deadlinePassed = deadlineSet && state.day >= (state.phaseDeadline ?? Infinity);

      return {
        canTransition: !!shortlistBuilt && !!clientApproved && !!processNote && shortlistedBuyers >= 2 && deadlinePassed,
        requirements: [
          { label: 'NBO deadline set', met: deadlineSet },
          { label: 'Shortlist built', met: !!shortlistBuilt },
          { label: 'Client approved shortlist', met: !!clientApproved },
          { label: 'Process note sent to buyers', met: !!processNote },
          { label: `Shortlisted buyers: ${shortlistedBuyers}/2 required`, met: shortlistedBuyers >= 2 },
          { label: 'NBO deadline reached', met: deadlinePassed },
        ],
        nextPhase: 5,
      };
    }

    case 5: { // Non-Binding Offers → Due Diligence
      const matrixBuilt = tasks.some((t) => t.phase === 5 && t.linkedDeliverableId === 'del-50' && t.status === 'completed');
      const ddPackage = tasks.some((t) => t.phase === 5 && t.linkedDeliverableId === 'del-51' && t.status === 'completed');
      const nbosReceived = state.buyers.filter(b => b.status === 'bidding' || b.status === 'shortlisted' || b.status === 'preferred').length;
      const clientSelectedDD = tasks.some((t) => t.phase === 5 && (t.name.toLowerCase().includes('select dd') || t.name.toLowerCase().includes('dd candidate')) && t.status === 'completed');

      return {
        canTransition: !!matrixBuilt && !!ddPackage && nbosReceived >= 2 && clientSelectedDD,
        requirements: [
          { label: 'NBO comparison matrix completed', met: !!matrixBuilt },
          { label: 'DD entry package prepared', met: !!ddPackage },
          { label: `NBOs received: ${nbosReceived}/2 required`, met: nbosReceived >= 2 },
          { label: 'Client selected DD candidates', met: clientSelectedDD },
        ],
        nextPhase: 6,
      };
    }

    case 6: { // Due Diligence → Final Offers (process letter deadline-gated)
      const processLetter = tasks.some((t) => t.phase === 6 && t.linkedDeliverableId === 'del-63' && t.status === 'completed');
      const deadlineSet = state.phaseDeadline !== null;
      const deadlinePassed = deadlineSet && state.day >= (state.phaseDeadline ?? Infinity);
      const bindingOffersIn = state.bindingOffersReceived > 0;
      const activeDDBuyers = state.buyers.filter(b => !['dropped', 'excluded'].includes(b.status)).length;

      return {
        canTransition: !!processLetter && deadlinePassed && bindingOffersIn && activeDDBuyers >= 1 && resources.dealMomentum >= 40,
        requirements: [
          { label: 'Process letter issued (sets binding offer deadline)', met: !!processLetter },
          { label: 'Binding offer deadline set', met: deadlineSet },
          { label: 'Binding offer deadline passed', met: deadlinePassed },
          { label: `Binding offers received: ${state.bindingOffersReceived} (need ≥1)`, met: bindingOffersIn },
          { label: `Active buyers remain: ${activeDDBuyers} (need ≥1)`, met: activeDDBuyers >= 1 },
          { label: 'Deal momentum ≥40', met: resources.dealMomentum >= 40 },
        ],
        nextPhase: 7,
      };
    }

    case 7: { // Final Offers → SPA Negotiation
      const preferredSelected = state.preferredBidderId !== null;
      const exclusivityReady = tasks.some((t) => t.phase === 7 && t.linkedDeliverableId === 'del-72' && t.status === 'completed');

      return {
        canTransition: preferredSelected && exclusivityReady,
        requirements: [
          { label: 'Preferred bidder selected', met: preferredSelected },
          { label: 'Exclusivity agreement prepared', met: exclusivityReady },
        ],
        nextPhase: 8,
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
        nextPhase: 9,
      };
    }

    case 9: { // Signing → Closing & Execution
      const docLocked = tasks.some((t) => t.phase === 9 && t.name.toLowerCase().includes('lock signature') && t.status === 'completed');
      const signedOff = tasks.some((t) => t.phase === 9 && t.linkedDeliverableId === 'del-90' && t.status === 'completed');

      return {
        canTransition: !!docLocked && !!signedOff && resources.riskLevel < 40,
        requirements: [
          { label: 'Signature version locked', met: !!docLocked },
          { label: 'SPA signed', met: !!signedOff },
          { label: 'Risk level below 40', met: resources.riskLevel < 40 },
        ],
        nextPhase: 10,
      };
    }

    default: {
      // Phase 10 (Closing): final gate = game completion
      const completionRatio = totalCount > 0 ? completedCount / totalCount : 0;
      return {
        canTransition: completionRatio >= 0.7 && resources.dealMomentum >= 40,
        requirements: [
          { label: `Phase tasks completed (${completedCount}/${totalCount})`, met: completionRatio >= 0.7 },
          { label: 'Deal momentum above 40', met: resources.dealMomentum >= 40 },
        ],
        nextPhase: Math.min(phase + 1, 10) as PhaseId,
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
      const dep = tasks.find((t) => t.id === depId);
      return dep?.status === 'completed';
    });

    if (allDepsMet) {
      return { ...task, status: 'available' as const };
    }
    return task;
  });
}
