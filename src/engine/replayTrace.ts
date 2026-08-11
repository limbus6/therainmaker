import type { GameStore } from '../store/gameStore';
import type { ReplayTraceEntry } from '../types/game';

export interface ReplayExport {
  format: 'rainmaker-replay-v1';
  exportedAt: string;
  run: {
    seed: number;
    contentVersion: string;
    scoringModelVersion: string;
    playerName: string;
    phase: number;
    day: number;
  };
  actions: ReplayTraceEntry[];
  processLog: GameStore['processLog'];
  eventIds: string[];
}

export function appendReplayTrace(
  trace: ReplayTraceEntry[],
  entry: Omit<ReplayTraceEntry, 'sequence'>,
): ReplayTraceEntry[] {
  const sequence = (trace.at(-1)?.sequence ?? 0) + 1;
  return [...trace, { ...entry, sequence }].slice(-500);
}

export function buildReplayExport(state: GameStore, exportedAt = new Date().toISOString()): ReplayExport {
  return {
    format: 'rainmaker-replay-v1',
    exportedAt,
    run: {
      seed: state.rngSeed,
      contentVersion: state.contentVersion,
      scoringModelVersion: state.scoringModelVersion,
      playerName: state.playerName,
      phase: state.phase,
      day: state.day,
    },
    actions: state.replayTrace,
    processLog: state.processLog,
    eventIds: state.events.map((event) => event.id),
  };
}
