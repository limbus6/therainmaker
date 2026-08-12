import { ADVISOR_ARCHETYPES, type ArchetypeId } from '../content/archetypes';
import { CONTENT_VERSION } from '../content/contentVersion';
import { MANDATE_POOL, type PendingMandate } from '../content/mandates';
import { hashDailyPart } from './dailyMandate';

const CHALLENGE_CODE_VERSION = 'RM1';

export interface ChallengeConfig {
  code: string;
  seasonId: string;
  mandateId: string;
  mandateLabel: string;
  archetypeId: ArchetypeId;
  archetypeName: string;
  seed: number;
  startingReputationBonus: number;
}

export type ChallengeDecodeResult =
  | { ok: true; config: ChallengeConfig }
  | { ok: false; error: 'invalid' | 'tampered' | 'incompatible_season'; message: string };

function base36(value: number): string {
  return (value >>> 0).toString(36).toUpperCase();
}

function checksum(payload: string): string {
  return base36(hashDailyPart(payload)).slice(-5).padStart(5, '0');
}

function normalizeCode(value: string): string {
  return value.trim().toUpperCase().replace(/\s+/g, '');
}

export function createChallengeCode({
  mandateId,
  archetypeId,
  seed,
  startingReputationBonus = 0,
  seasonId = CONTENT_VERSION,
}: {
  mandateId: string;
  archetypeId: ArchetypeId;
  seed: number;
  startingReputationBonus?: number;
  seasonId?: string;
}): string {
  const mandateIndex = MANDATE_POOL.findIndex((mandate) => mandate.id === mandateId);
  const archetypeIndex = ADVISOR_ARCHETYPES.findIndex((archetype) => archetype.id === archetypeId);
  if (mandateIndex < 0 || archetypeIndex < 0 || !Number.isFinite(seed)) {
    throw new Error('Cannot create a challenge code from an unknown mandate, build, or seed.');
  }
  const bonus = Math.max(0, Math.min(20, Math.round(startingReputationBonus)));
  const payload = [
    CHALLENGE_CODE_VERSION,
    base36(hashDailyPart(seasonId)),
    mandateIndex.toString(36).toUpperCase(),
    archetypeIndex.toString(36).toUpperCase(),
    base36(seed),
    bonus.toString(36).toUpperCase(),
  ].join('-');
  return `${payload}-${checksum(payload)}`;
}

export function decodeChallengeCode(
  rawCode: string,
  currentSeasonId = CONTENT_VERSION,
): ChallengeDecodeResult {
  const code = normalizeCode(rawCode);
  const parts = code.split('-');
  if (parts.length !== 7 || parts[0] !== CHALLENGE_CODE_VERSION) {
    return { ok: false, error: 'invalid', message: 'Use a complete Rainmaker challenge code beginning with RM1.' };
  }

  const payload = parts.slice(0, -1).join('-');
  if (parts.at(-1) !== checksum(payload)) {
    return { ok: false, error: 'tampered', message: 'This challenge code is incomplete or has been altered.' };
  }

  if (parts[1] !== base36(hashDailyPart(currentSeasonId))) {
    return {
      ok: false,
      error: 'incompatible_season',
      message: `This challenge belongs to a different comparison season. Current season: ${currentSeasonId}.`,
    };
  }

  const mandateIndex = Number.parseInt(parts[2], 36);
  const archetypeIndex = Number.parseInt(parts[3], 36);
  const seed = Number.parseInt(parts[4], 36);
  const startingReputationBonus = Number.parseInt(parts[5], 36);
  const mandate = MANDATE_POOL[mandateIndex];
  const archetype = ADVISOR_ARCHETYPES[archetypeIndex];
  if (
    !mandate || !archetype || !Number.isSafeInteger(seed) || seed < 0 || seed > 0xffffffff
    || !Number.isSafeInteger(startingReputationBonus) || startingReputationBonus < 0 || startingReputationBonus > 20
  ) {
    return { ok: false, error: 'invalid', message: 'This challenge code contains an unsupported configuration.' };
  }

  return {
    ok: true,
    config: {
      code,
      seasonId: currentSeasonId,
      mandateId: mandate.id,
      mandateLabel: mandate.label,
      archetypeId: archetype.id,
      archetypeName: archetype.name,
      seed,
      startingReputationBonus,
    },
  };
}

export function buildPendingChallenge(config: ChallengeConfig, attemptId: string): PendingMandate {
  const mandate = MANDATE_POOL.find((candidate) => candidate.id === config.mandateId);
  if (!mandate) throw new Error('Challenge mandate is unavailable in this season.');
  return {
    id: mandate.id,
    seed: config.seed,
    difficulty: { ...mandate.difficulty },
    careerReputationBonus: config.startingReputationBonus,
    startingReputationBonus: config.startingReputationBonus,
    runMode: 'challenge',
    challengeCode: config.code,
    challengeSeason: config.seasonId,
    challengeAttemptId: attemptId,
    advisorArchetype: config.archetypeId,
  };
}
