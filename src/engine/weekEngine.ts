import type {
  GameState,
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
} from '../types/game';

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
  buyerChanges: BuyerChange[];
  hiddenWorkload: { taskId: string; description: string; extraWork: number } | null;
  narrativeSummary: string;
  phaseProgressDelta: number;
  resolvedBudgetRequests: { id: string; approved: boolean; amount: number }[];
  resolvedBoardSubmission: { approved: boolean; notes: string } | null;
  /** How many calendar days this advance covered (1–7) */
  daysAdvanced: number;
  /** Internal: updated buyer array for store to apply */
  _updatedBuyers: Buyer[];
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
      ];
      return {
        taskId: task.id,
        description: descriptions[Math.floor(Math.random() * descriptions.length)],
        extraWork: Math.ceil(task.work * 0.3),
      };
    }
  }
  return null;
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
function generateSummary(result: Omit<WeekResult, 'narrativeSummary' | '_updatedBuyers'>, _week: number): string {
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

  if (parts.length === 0) {
    parts.push('A quiet week. The team is standing by for direction.');
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
  condition?: (state: GameState) => boolean;
  generate: (state: GameState) => {
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
];

function rollEvents(state: GameState): {
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

    // Probability roll
    if (Math.random() > template.probability) continue;

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

export function resolveWeek(state: GameState, daysToAdvance: number = 7): WeekResult {
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

  // 5. Combine all resource changes
  const resourceChanges: Partial<PlayerResources> = {
    ...resourceConsumption,
    ...stateChanges,
  };

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

  // 10. Phase progress estimate
  const phaseProgressDelta = tasksCompleted.length * 8 + tasksProgressed.length * 2;

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
    phaseProgressDelta,
    resolvedBudgetRequests: resolvedRequests,
    resolvedBoardSubmission,
    daysAdvanced: daysToAdvance,
  };

  const narrativeSummary = generateSummary(partialResult, newWeek);

  return { ...partialResult, daysAdvanced: daysToAdvance, narrativeSummary, _updatedBuyers: buyerResult.buyers };
}

// ============================================
// Calculate Days to Next Meaningful Event
// ============================================

export function calcDaysToAdvance(state: GameState): number {
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

export function checkDealCollapse(state: GameState): CollapseResult {
  const { resources, buyers, phase } = state;
  const none: CollapseResult = { collapsed: false, reason: null, headline: '', description: '' };

  // 1. Client walks — trust has fallen to zero
  if (resources.clientTrust <= 0) {
    return {
      collapsed: true,
      reason: 'client_walked',
      headline: 'Client Terminated Engagement',
      description: 'Ricardo Ferreira has lost confidence in Clearwater\'s ability to deliver. The mandate has been withdrawn.',
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

export function checkPhaseGate(state: GameState): PhaseGateResult {
  const { phase, tasks, resources } = state;
  const phaseTasks = tasks.filter((t) => t.phase === phase);
  const completedCount = phaseTasks.filter((t) => t.status === 'completed').length;
  const totalCount = phaseTasks.length;

  switch (phase) {
    case 0: { // Deal Origination → Pitch & Mandate
      const screeningDone = tasks.find((t) => t.id === 'task-01')?.status === 'completed';
      const clientAssessed = tasks.find((t) => t.id === 'task-03')?.status === 'completed';
      const internalReview = tasks.find((t) => t.id === 'task-05')?.status === 'completed';
      const marketRead = tasks.find((t) => t.id === 'task-04')?.status === 'completed';
      const boardApproved = state.boardSubmission?.status === 'approved';
      const hasQualNotes = (state.qualificationNotes?.length ?? 0) >= 1;

      return {
        canTransition: !!screeningDone && !!clientAssessed && !!internalReview && boardApproved,
        requirements: [
          { label: 'Company screening completed', met: !!screeningDone },
          { label: 'Client motivation assessed', met: !!clientAssessed },
          { label: 'Quick market read completed', met: !!marketRead },
          { label: 'Internal opportunity review approved', met: !!internalReview },
          { label: 'Qualification notes gathered', met: hasQualNotes },
          { label: 'Board submission approved', met: boardApproved },
        ],
        nextPhase: 1,
      };
    }

    case 1: { // Pitch & Mandate → Preparation
      const completionRatio = totalCount > 0 ? completedCount / totalCount : 0;
      const pitchPresented = state.feeNegotiation?.pitchPresented === true;
      const feeAgreed = state.feeNegotiation?.status === 'agreed' || state.agreedFeeTerms !== null;
      return {
        canTransition: completionRatio >= 0.7 && resources.clientTrust >= 60 && pitchPresented && feeAgreed,
        requirements: [
          { label: `Phase tasks completed (${completedCount}/${totalCount})`, met: completionRatio >= 0.7 },
          { label: 'Client trust above 60 (mandate confidence)', met: resources.clientTrust >= 60 },
          { label: 'Pitch presented to client', met: pitchPresented },
          { label: 'Fee terms agreed', met: feeAgreed },
        ],
        nextPhase: 2,
      };
    }

    case 2: { // Preparation → Market Outreach
      const cimDone = tasks.find((t) => t.id === 'task-21')?.status === 'completed';
      const teaserDone = tasks.find((t) => t.id === 'task-22')?.status === 'completed';
      const modelDone = tasks.find((t) => t.id === 'task-20')?.status === 'completed';
      const qualityReview = tasks.find((t) => t.id === 'task-30')?.status === 'completed';
      const buyerListDone = tasks.find((t) => t.id === 'task-25')?.status === 'completed';

      return {
        canTransition: !!cimDone && !!teaserDone && !!modelDone && !!qualityReview,
        requirements: [
          { label: 'Financial model completed', met: !!modelDone },
          { label: 'CIM drafted', met: !!cimDone },
          { label: 'Teaser document prepared', met: !!teaserDone },
          { label: 'Buyer long list finalised', met: !!buyerListDone },
          { label: 'Quality review passed', met: !!qualityReview },
          { label: 'Deal momentum above 50', met: resources.dealMomentum >= 50 },
        ],
        nextPhase: 3,
      };
    }

    case 3: { // Market Outreach → Shortlist
      const outreachLaunched = tasks.find((t) => t.id === 'task-40')?.status === 'completed';
      const ndasProcessed = tasks.find((t) => t.id === 'task-42')?.status === 'completed';
      const qaResponded = tasks.find((t) => t.id === 'task-46')?.status === 'completed';
      const buyerQualified = tasks.find((t) => t.id === 'task-48')?.status === 'completed';
      const completionRatio3 = totalCount > 0 ? completedCount / totalCount : 0;

      return {
        canTransition: !!outreachLaunched && !!ndasProcessed && completionRatio3 >= 0.6 && resources.dealMomentum >= 50,
        requirements: [
          { label: 'Tier 1 outreach launched', met: !!outreachLaunched },
          { label: 'NDAs processed', met: !!ndasProcessed },
          { label: 'Buyer Q&A responded', met: !!qaResponded },
          { label: 'Buyer seriousness qualified', met: !!buyerQualified },
          { label: `Phase tasks completed (${completedCount}/${totalCount})`, met: completionRatio3 >= 0.6 },
          { label: 'Deal momentum above 50', met: resources.dealMomentum >= 50 },
        ],
        nextPhase: 4,
      };
    }

    case 4: { // Shortlist → Non-Binding Offers
      const shortlistBuilt = tasks.find((t) => t.id === 'task-61')?.status === 'completed';
      const clientApproved = tasks.find((t) => t.id === 'task-63')?.status === 'completed';
      const processNote = tasks.find((t) => t.id === 'task-64')?.status === 'completed';
      const completionRatio4 = totalCount > 0 ? completedCount / totalCount : 0;

      return {
        canTransition: !!shortlistBuilt && !!clientApproved && !!processNote && completionRatio4 >= 0.6,
        requirements: [
          { label: 'Provisional shortlist built', met: !!shortlistBuilt },
          { label: 'Shortlist presented to client', met: !!clientApproved },
          { label: 'First-round process note prepared', met: !!processNote },
          { label: `Phase tasks completed (${completedCount}/${totalCount})`, met: completionRatio4 >= 0.6 },
          { label: 'Deal momentum above 50', met: resources.dealMomentum >= 50 },
        ],
        nextPhase: 5,
      };
    }

    case 5: { // Non-Binding Offers → Due Diligence
      const matrixBuilt = tasks.some((t) => t.phase === 5 && t.linkedDeliverableId === 'del-50' && t.status === 'completed');
      const ddPackage = tasks.some((t) => t.phase === 5 && t.linkedDeliverableId === 'del-51' && t.status === 'completed');
      const completionRatio5 = totalCount > 0 ? completedCount / totalCount : 0;

      return {
        canTransition: !!matrixBuilt && !!ddPackage && completionRatio5 >= 0.6 && resources.dealMomentum >= 50,
        requirements: [
          { label: 'NBO comparison matrix completed', met: !!matrixBuilt },
          { label: 'DD entry package prepared', met: !!ddPackage },
          { label: `Phase tasks completed (${completedCount}/${totalCount})`, met: completionRatio5 >= 0.6 },
          { label: 'Deal momentum above 50', met: resources.dealMomentum >= 50 },
        ],
        nextPhase: 6,
      };
    }

    case 6: { // Due Diligence → Final Offers
      const processLetter = tasks.some((t) => t.phase === 6 && t.linkedDeliverableId === 'del-63' && t.status === 'completed');
      const ddReadiness = tasks.some((t) => t.phase === 6 && t.name.toLowerCase().includes('final dd readiness') && t.status === 'completed');
      const completionRatio6 = totalCount > 0 ? completedCount / totalCount : 0;

      return {
        canTransition: !!processLetter && completionRatio6 >= 0.6 && resources.dealMomentum >= 40,
        requirements: [
          { label: 'Final process letter issued', met: !!processLetter },
          { label: 'DD readiness reviewed', met: !!ddReadiness },
          { label: `Phase tasks completed (${completedCount}/${totalCount})`, met: completionRatio6 >= 0.6 },
          { label: 'Deal momentum above 40', met: resources.dealMomentum >= 40 },
          { label: 'At least 2 active buyers remain', met: state.buyers.filter((b) => !['dropped', 'excluded'].includes(b.status)).length >= 2 },
        ],
        nextPhase: 7,
      };
    }

    case 7: { // Final Offers → SPA Negotiation
      const preferredSelected = tasks.some((t) => t.phase === 7 && t.name.toLowerCase().includes('recommend preferred') && t.status === 'completed');
      const exclusivityReady = tasks.some((t) => t.phase === 7 && t.linkedDeliverableId === 'del-72' && t.status === 'completed');
      const completionRatio7 = totalCount > 0 ? completedCount / totalCount : 0;

      return {
        canTransition: !!preferredSelected && !!exclusivityReady && completionRatio7 >= 0.6,
        requirements: [
          { label: 'Preferred bidder recommended', met: !!preferredSelected },
          { label: 'Exclusivity agreement prepared', met: !!exclusivityReady },
          { label: `Phase tasks completed (${completedCount}/${totalCount})`, met: completionRatio7 >= 0.6 },
          { label: 'Client trust above 50', met: resources.clientTrust >= 50 },
        ],
        nextPhase: 8,
      };
    }

    case 8: { // SPA Negotiation → Signing
      const signingChecklist = tasks.some((t) => t.phase === 8 && t.linkedDeliverableId === 'del-82' && t.status === 'completed');
      const paperReview = tasks.some((t) => t.phase === 8 && t.name.toLowerCase().includes('pre-signing') && t.status === 'completed');
      const completionRatio8 = totalCount > 0 ? completedCount / totalCount : 0;

      return {
        canTransition: !!signingChecklist && completionRatio8 >= 0.6,
        requirements: [
          { label: 'Signing checklist completed', met: !!signingChecklist },
          { label: 'Pre-signing paper review done', met: !!paperReview },
          { label: `Phase tasks completed (${completedCount}/${totalCount})`, met: completionRatio8 >= 0.6 },
          { label: 'Deal momentum above 40', met: resources.dealMomentum >= 40 },
        ],
        nextPhase: 9,
      };
    }

    case 9: { // Signing → Closing & Execution
      const docLocked = tasks.some((t) => t.phase === 9 && t.name.toLowerCase().includes('lock signature') && t.status === 'completed');
      const signedOff = tasks.some((t) => t.phase === 9 && t.linkedDeliverableId === 'del-90' && t.status === 'completed');
      const completionRatio9 = totalCount > 0 ? completedCount / totalCount : 0;

      return {
        canTransition: !!docLocked && !!signedOff && completionRatio9 >= 0.7,
        requirements: [
          { label: 'Signature version locked', met: !!docLocked },
          { label: 'SPA signed', met: !!signedOff },
          { label: `Phase tasks completed (${completedCount}/${totalCount})`, met: completionRatio9 >= 0.7 },
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
