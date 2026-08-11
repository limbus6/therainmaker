// ============================================
// Seeded Event-Sequence Regression Test
// ============================================
// Proves the event pipeline is behaviour-preserving across refactors.
//
// The baseline fixture was captured from the PRE-extraction engine
// (commit 9a54c42, EVENT_POOL inline in weekEngine.ts) and verified
// byte-identical against the extracted catalogue in src/content/events/.
// Any change to this sequence means engine behaviour changed.
//
// If the change is INTENTIONAL (event content edited), regenerate the
// fixture by uncommenting the write below, re-running this test, and bump
// CONTENT_VERSION in src/content/contentVersion.ts in the same commit.

import { describe, it, expect } from 'vitest';
import { useGameStore } from '../../store/gameStore';
import type { PhaseId } from '../../types/game';
import baseline from './__fixtures__/eventSequences.baseline.json';
import { writeFileSync } from 'node:fs';

const SEEDS = [11, 23, 47];
const ADVANCES_PER_PHASE = 4;

async function captureSequences(): Promise<Record<string, string[]>> {
  const capture: Record<string, string[]> = {};

  for (const seed of SEEDS) {
    const seq: string[] = [];
    for (let p = 0; p <= 10; p++) {
      useGameStore.setState({ rngSeed: seed });
      await useGameStore.getState().debugJumpToPhase(p as PhaseId);
      useGameStore.setState({ rngSeed: seed });

      for (let i = 0; i < ADVANCES_PER_PHASE; i++) {
        useGameStore.getState().advanceWeek();
        const s = useGameStore.getState();
        const r = s.lastWeekResult;
        seq.push(
          `p${p} day${s.day} +${r?.daysAdvanced ?? '?'}d ` +
          `events[${(r?.newEvents ?? []).map((e) => e.id).join(',')}]`
        );
      }
    }
    capture[`seed-${seed}`] = seq;
  }
  return capture;
}

describe('seeded event-sequence regression', () => {
  it('reproduces the pre-extraction baseline for fixed seeds', async () => {
    const capture = await captureSequences();

    // Intentional state/content changes must bump CONTENT_VERSION and opt in
    // explicitly when refreshing this deterministic fixture.
    if (process.env.UPDATE_EVENT_SEQUENCE_FIXTURE === '1') {
      writeFileSync(
        'src/engine/__tests__/__fixtures__/eventSequences.baseline.json',
        `${JSON.stringify(capture, null, 2)}\n`,
      );
      return;
    }

    expect(capture).toEqual(baseline);
  }, 180000);
});
