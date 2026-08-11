import type {
  MandateDifficultyProfile,
  PhaseId,
  ProcessCategory,
  ProcessRecord,
  ProcessSourceType,
} from '../types/game';

export const DEFAULT_MANDATE_DIFFICULTY: MandateDifficultyProfile = {
  processBreadth: 50,
  timePressure: 50,
  diligenceBurden: 50,
  stakeholderVolatility: 50,
  buyerFragility: 50,
  overall: 50,
};

export const PROCESS_CATEGORY_WEIGHTS: Record<ProcessCategory, number> = {
  judgment: 0.30,
  execution: 0.25,
  stakeholder: 0.20,
  risk: 0.15,
  negotiation: 0.10,
};

export const PROCESS_CATEGORY_LABELS: Record<ProcessCategory, string> = {
  judgment: 'Judgment',
  execution: 'Execution Discipline',
  stakeholder: 'Stakeholder Management',
  risk: 'Risk Stewardship',
  negotiation: 'Negotiation Craft',
};

export interface NewProcessRecord {
  day: number;
  phase: PhaseId;
  category: ProcessCategory;
  rating: number;
  weight: 1 | 2 | 3;
  sourceType: ProcessSourceType;
  sourceId: string;
  headline: string;
  explanation: string;
  dedupeKey?: string;
}

function safeToken(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
}

/** Append a deterministic record once. Replays and repeat clicks cannot inflate the score. */
export function appendProcessRecord(log: ProcessRecord[], input: NewProcessRecord): ProcessRecord[] {
  const dedupeKey = input.dedupeKey ?? `${input.category}:${input.sourceType}:${input.sourceId}`;
  if (log.some((record) => record.dedupeKey === dedupeKey)) return log;

  const record: ProcessRecord = {
    ...input,
    id: `process-${input.day}-${input.phase}-${safeToken(input.sourceType)}-${safeToken(input.sourceId)}`,
    dedupeKey,
    rating: Math.max(0, Math.min(1, input.rating)),
  };
  return [...log, record].slice(-200);
}

export function appendProcessRecords(log: ProcessRecord[], inputs: NewProcessRecord[]): ProcessRecord[] {
  return inputs.reduce(appendProcessRecord, log);
}

export interface CausalProcessScore {
  categories: Record<ProcessCategory, number>;
  rawScore: number;
  difficultyAdjustment: number;
  score: number;
}

export function calculateCausalProcessScore(
  log: ProcessRecord[],
  difficulty: MandateDifficultyProfile,
): CausalProcessScore {
  const categories = (Object.keys(PROCESS_CATEGORY_WEIGHTS) as ProcessCategory[]).reduce(
    (scores, category) => {
      const records = log.filter((record) => record.category === category);
      const totalWeight = records.reduce((sum, record) => sum + record.weight, 0);
      scores[category] = totalWeight === 0
        ? 50
        : Math.round(100 * records.reduce((sum, record) => sum + record.rating * record.weight, 0) / totalWeight);
      return scores;
    },
    {} as Record<ProcessCategory, number>,
  );

  const rawScore = Math.round(
    (Object.keys(PROCESS_CATEGORY_WEIGHTS) as ProcessCategory[])
      .reduce((sum, category) => sum + categories[category] * PROCESS_CATEGORY_WEIGHTS[category], 0),
  );
  const difficultyAdjustment = Math.max(-5, Math.min(5, Math.round((difficulty.overall - 50) / 6)));

  return {
    categories,
    rawScore,
    difficultyAdjustment,
    score: Math.max(0, Math.min(100, rawScore + difficultyAdjustment)),
  };
}

export function reactionRating(reactions: Array<'green' | 'yellow' | 'red'>): number {
  if (reactions.length === 0) return 0.5;
  const total = reactions.reduce((sum, reaction) => (
    sum + (reaction === 'green' ? 1 : reaction === 'yellow' ? 0.6 : 0)
  ), 0);
  return total / reactions.length;
}
