import { describe, expect, it } from 'vitest';
import { buildPendingChallenge, createChallengeCode, decodeChallengeCode } from '../challengeSeed';

const CONFIG = {
  mandateId: 'solara-headwinds',
  archetypeId: 'shark' as const,
  seed: 4_000_000_001,
  startingReputationBonus: 7,
  seasonId: 'challenge-season-v1',
};

describe('challenge seed codes', () => {
  it('round-trips every fixed starting input', () => {
    const code = createChallengeCode(CONFIG);
    const decoded = decodeChallengeCode(code.toLowerCase(), CONFIG.seasonId);

    expect(code).toMatch(/^RM1-[A-Z0-9-]+$/);
    expect(decoded).toMatchObject({
      ok: true,
      config: {
        code,
        seasonId: CONFIG.seasonId,
        mandateId: CONFIG.mandateId,
        archetypeId: CONFIG.archetypeId,
        seed: CONFIG.seed,
        startingReputationBonus: CONFIG.startingReputationBonus,
      },
    });
  });

  it('rejects an altered code before launching a run', () => {
    const code = createChallengeCode(CONFIG);
    const altered = `${code.slice(0, -1)}${code.endsWith('A') ? 'B' : 'A'}`;
    expect(decodeChallengeCode(altered, CONFIG.seasonId)).toMatchObject({ ok: false, error: 'tampered' });
  });

  it('rejects incompatible comparison seasons', () => {
    const code = createChallengeCode(CONFIG);
    expect(decodeChallengeCode(code, 'challenge-season-v2')).toMatchObject({ ok: false, error: 'incompatible_season' });
  });

  it('builds a challenge handoff with no dependency on the receiving career', () => {
    const decoded = decodeChallengeCode(createChallengeCode(CONFIG), CONFIG.seasonId);
    if (!decoded.ok) throw new Error(decoded.message);
    expect(buildPendingChallenge(decoded.config, 'attempt-1')).toMatchObject({
      id: 'solara-headwinds',
      seed: CONFIG.seed,
      runMode: 'challenge',
      careerReputationBonus: 7,
      startingReputationBonus: 7,
      challengeAttemptId: 'attempt-1',
      advisorArchetype: 'shark',
    });
  });
});
