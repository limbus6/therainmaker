import { describe, it, expect } from 'vitest';
import { getMissionProgress, getActiveMission } from '../missionProgress';
import type { PhaseMission } from '../../types/dealBeat';
import type { GameTask } from '../../types/game';

function makeMission(id: string, requiredActionIds: string[]): PhaseMission {
  return {
    id,
    phase: 2,
    title: `Mission ${id}`,
    strategicChoice: 'A vs B',
    description: '',
    primaryActionIds: requiredActionIds,
    supportingTaskIds: [],
    completionCriteria: { requiredActionIds },
  };
}

function makeTask(id: string, status: GameTask['status']): GameTask {
  return { id, name: id, description: '', phase: 2, category: 'internal', status, cost: 0, work: 3, complexity: 'low', effectSummary: '' } as GameTask;
}

const missions = [
  makeMission('m1', ['t1', 't2']),
  makeMission('m2', ['t3']),
  makeMission('m3', ['t4']),
];

describe('getMissionProgress', () => {
  it('counts completed required actions per mission', () => {
    const tasks = [makeTask('t1', 'completed'), makeTask('t2', 'in_progress'), makeTask('t3', 'available')];
    const entries = getMissionProgress(missions, tasks, 2);
    expect(entries[0].completedRequired).toBe(1);
    expect(entries[0].totalRequired).toBe(2);
    expect(entries[0].complete).toBe(false);
    expect(entries[1].completedRequired).toBe(0);
  });

  it('marks a mission complete when all required actions are completed', () => {
    const tasks = [makeTask('t1', 'completed'), makeTask('t2', 'completed')];
    const entries = getMissionProgress(missions, tasks, 2);
    expect(entries[0].complete).toBe(true);
  });

  it('ignores tasks from other phases with the same id', () => {
    const otherPhaseTask = { ...makeTask('t1', 'completed'), phase: 3 as const };
    const entries = getMissionProgress(missions, [otherPhaseTask], 2);
    expect(entries[0].completedRequired).toBe(0);
  });
});

describe('getActiveMission', () => {
  it('returns the first incomplete mission by default', () => {
    const tasks = [makeTask('t1', 'completed'), makeTask('t2', 'completed')];
    const entries = getMissionProgress(missions, tasks, 2);
    expect(getActiveMission(entries)!.mission.id).toBe('m2');
  });

  it('honours an explicit focus while it is incomplete', () => {
    const entries = getMissionProgress(missions, [], 2);
    expect(getActiveMission(entries, 'm3')!.mission.id).toBe('m3');
  });

  it('falls back past a focused mission once it is complete', () => {
    const tasks = [makeTask('t3', 'completed')];
    const entries = getMissionProgress(missions, tasks, 2);
    expect(getActiveMission(entries, 'm2')!.mission.id).toBe('m1');
  });

  it('returns the last mission when everything is complete', () => {
    const tasks = [makeTask('t1', 'completed'), makeTask('t2', 'completed'), makeTask('t3', 'completed'), makeTask('t4', 'completed')];
    const entries = getMissionProgress(missions, tasks, 2);
    const active = getActiveMission(entries);
    expect(active!.mission.id).toBe('m3');
    expect(active!.complete).toBe(true);
  });

  it('returns null for an empty mission list', () => {
    expect(getActiveMission([])).toBeNull();
  });
});
