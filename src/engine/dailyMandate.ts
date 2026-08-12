import { ADVISOR_ARCHETYPES, type ArchetypeId } from '../content/archetypes';
import { CONTENT_VERSION } from '../content/contentVersion';
import { MANDATE_POOL, type PendingMandate } from '../content/mandates';
import { deriveSeed } from './rng';

export interface DailyMandateConfig {
  dailyKey: string;
  dateKey: string;
  seasonId: string;
  seed: number;
  mandateId: string;
  mandateLabel: string;
  archetypeId: ArchetypeId;
  archetypeName: string;
  pendingMandate: PendingMandate;
}

export function getUtcDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function hashDailyPart(value: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

export function getDailyMandate(date: Date, contentVersion = CONTENT_VERSION): DailyMandateConfig {
  const dateKey = getUtcDateKey(date);
  const seasonId = contentVersion;
  const seed = deriveSeed(hashDailyPart(dateKey), hashDailyPart(contentVersion), 0xda17);
  const shortMandates = MANDATE_POOL.filter((mandate) => mandate.phaseSequence.length === 5);
  const mandate = shortMandates[seed % shortMandates.length];
  const archetype = ADVISOR_ARCHETYPES[Math.floor(seed / Math.max(1, shortMandates.length)) % ADVISOR_ARCHETYPES.length];
  const dailyKey = `${seasonId}:${dateKey}`;

  return {
    dailyKey,
    dateKey,
    seasonId,
    seed,
    mandateId: mandate.id,
    mandateLabel: mandate.label,
    archetypeId: archetype.id,
    archetypeName: archetype.name,
    pendingMandate: {
      id: mandate.id,
      seed,
      difficulty: { ...mandate.difficulty },
      careerReputationBonus: 0,
      startingReputationBonus: 0,
      runMode: 'daily',
      dailyKey,
      dailySeason: seasonId,
      advisorArchetype: archetype.id,
    },
  };
}
