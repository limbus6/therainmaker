import { describe, expect, it } from 'vitest';
import {
  FLAGSHIP_PHASE_SEQUENCE,
  MANDATE_POOL,
  SHORT_MANDATE_PHASE_SEQUENCE,
  getFirstMandatePhase,
  getMandatePhaseSequence,
  getNextMandatePhase,
  getSkippedMandatePhases,
  isShortMandate,
} from '../mandates';

describe('mandate phase plans', () => {
  it('keeps the flagship on the complete eleven-phase process', () => {
    expect(getMandatePhaseSequence('solara-flagship')).toEqual(FLAGSHIP_PHASE_SEQUENCE);
    expect(getFirstMandatePhase('solara-flagship')).toBe(0);
    expect(isShortMandate('solara-flagship')).toBe(false);
  });

  it('compresses condition variants to five consequential stages', () => {
    expect(getMandatePhaseSequence('solara-headwinds')).toEqual(SHORT_MANDATE_PHASE_SEQUENCE);
    expect(getMandatePhaseSequence('solara-tailwinds')).toEqual(SHORT_MANDATE_PHASE_SEQUENCE);
    expect(getFirstMandatePhase('solara-headwinds')).toBe(3);
    expect(isShortMandate('solara-headwinds')).toBe(true);
  });

  it('moves only through the mandate plan and names omitted bridges', () => {
    expect(getNextMandatePhase('solara-headwinds', 0)).toBe(3);
    expect(getNextMandatePhase('solara-headwinds', 3)).toBe(5);
    expect(getNextMandatePhase('solara-headwinds', 8)).toBe(10);
    expect(getNextMandatePhase('solara-headwinds', 10)).toBeNull();
    expect(getSkippedMandatePhases('solara-headwinds', 3, 5)).toEqual([4]);
    expect(getSkippedMandatePhases('solara-headwinds', 5, 7)).toEqual([6]);
  });

  it('declares an ordered, unique plan ending at close for every mandate', () => {
    for (const mandate of MANDATE_POOL) {
      expect([...new Set(mandate.phaseSequence)]).toEqual(mandate.phaseSequence);
      expect([...mandate.phaseSequence].sort((a, b) => a - b)).toEqual(mandate.phaseSequence);
      expect(mandate.phaseSequence.at(-1)).toBe(10);
    }
  });
});
