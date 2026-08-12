// @vitest-environment jsdom

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import ResultsBoardScreen from '../ResultsBoardScreen';
import { useGameStore } from '../../store/gameStore';
import { useCareerStore } from '../../store/careerStore';
import { useDailyStore } from '../../store/dailyStore';
import { useChallengeStore } from '../../store/challengeStore';

describe('daily Results Board isolation', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    useCareerStore.setState({ tombstones: [], careerReputation: 0, beaconTombstones: [], marketStep: 0 });
    useDailyStore.setState({ results: [] });
    useChallengeStore.setState({ results: [] });
    useGameStore.setState({
      gameComplete: true,
      runMode: 'daily',
      dailyKey: 'season-test:2026-08-12',
      dailySeason: 'season-test',
      mandateId: 'solara-headwinds',
      advisorArchetype: 'shark',
      rngSeed: 424242,
      totalDays: 108,
      collapseReason: 'qa-collapse',
      collapseHeadline: 'QA daily ended',
      collapseDescription: 'Daily isolation fixture.',
    });
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
  });

  it('locks a daily result without minting career or Beacon tombstones', async () => {
    await act(async () => {
      root.render(<MemoryRouter><ResultsBoardScreen /></MemoryRouter>);
      await Promise.resolve();
    });

    expect(useDailyStore.getState().results).toHaveLength(1);
    expect(useCareerStore.getState().tombstones).toEqual([]);
    expect(useCareerStore.getState().beaconTombstones).toEqual([]);
    expect(useDailyStore.getState().results[0]).toMatchObject({
      dailyKey: 'season-test:2026-08-12',
      seasonId: 'season-test',
      seed: 424242,
      mandateId: 'solara-headwinds',
      archetype: 'The Shark',
    });
    expect(container.textContent).toContain('Official Daily Result');
    expect(container.textContent).toContain('Daily results do not change career reputation');
  });

  it('records a challenge attempt without touching Daily, career, or Beacon', async () => {
    useGameStore.setState({
      runMode: 'challenge',
      dailyKey: null,
      dailySeason: null,
      challengeCode: 'RM1-TEST-1-2-SEED-0-CHECK',
      challengeSeason: 'season-test',
      challengeAttemptId: 'attempt-test-1',
      startingReputationBonus: 5,
    });

    await act(async () => {
      root.render(<MemoryRouter><ResultsBoardScreen /></MemoryRouter>);
      await Promise.resolve();
    });

    expect(useChallengeStore.getState().results).toHaveLength(1);
    expect(useChallengeStore.getState().results[0]).toMatchObject({
      attemptId: 'attempt-test-1',
      challengeCode: 'RM1-TEST-1-2-SEED-0-CHECK',
      seasonId: 'season-test',
    });
    expect(useDailyStore.getState().results).toEqual([]);
    expect(useCareerStore.getState().tombstones).toEqual([]);
    expect(useCareerStore.getState().beaconTombstones).toEqual([]);
    expect(container.textContent).toContain('Challenge This Run');
    expect(container.textContent).toContain('Challenge attempts never change career, Beacon, or Daily records');
  });
});
