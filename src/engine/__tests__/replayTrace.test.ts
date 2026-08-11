import { describe, expect, it } from 'vitest';
import { useGameStore } from '../../store/gameStore';
import { appendReplayTrace, buildReplayExport } from '../replayTrace';

describe('replay trace', () => {
  it('assigns stable action sequence numbers', () => {
    const first = appendReplayTrace([], { day: 1, phase: 0, action: 'task_start', input: { taskId: 'task-1' } });
    const second = appendReplayTrace(first, { day: 2, phase: 0, action: 'advance', input: {}, rng: { seed: 42, draws: 3, state: 99 } });

    expect(second.map((entry) => entry.sequence)).toEqual([1, 2]);
    expect(second[1].rng).toEqual({ seed: 42, draws: 3, state: 99 });
  });

  it('keeps sequence numbers monotonic after the bounded trace rolls over', () => {
    let trace = [] as ReturnType<typeof appendReplayTrace>;
    for (let index = 0; index < 501; index += 1) {
      trace = appendReplayTrace(trace, { day: index + 1, phase: 0, action: 'advance', input: {} });
    }

    expect(trace).toHaveLength(500);
    expect(trace[0].sequence).toBe(2);
    expect(trace.at(-1)?.sequence).toBe(501);
  });

  it('exports the run identity and causal evidence together', () => {
    const state = useGameStore.getState();
    const exported = buildReplayExport({ ...state, replayTrace: [] }, '2026-08-11T10:00:00.000Z');

    expect(exported.format).toBe('rainmaker-replay-v1');
    expect(exported.exportedAt).toBe('2026-08-11T10:00:00.000Z');
    expect(exported.run).toMatchObject({ seed: state.rngSeed, contentVersion: state.contentVersion });
    expect(exported.actions).toEqual([]);
    expect(exported.processLog).toBe(state.processLog);
  });
});
