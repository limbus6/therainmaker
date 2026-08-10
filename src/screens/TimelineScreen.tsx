import { useGameStore } from '../store/gameStore';
import { PHASE_NAMES } from '../types/game';
import type { PhaseId } from '../types/game';
import Panel from '../components/ui/Panel';
import StatusChip from '../components/ui/StatusChip';
import { CheckCircle2, Lock, MapPin } from 'lucide-react';

export default function TimelineScreen() {
  const phase = useGameStore((s) => s.phase);
  const day = useGameStore((s) => s.day);
  const phaseEntryDay = useGameStore((s) => s.phaseEntryDay) || {};
  const currentWeek = Math.ceil(day / 7);

  const phases = (Object.keys(PHASE_NAMES) as unknown as PhaseId[]).map(Number) as PhaseId[];

  return (
    <div className="space-y-6 max-w-[1200px]">
      <div>
        <h1 className="text-2xl font-display font-semibold text-text-primary">Timeline</h1>
        <p className="text-[12px] text-text-muted mt-1">Strategic overview of deal progression</p>
      </div>

      {/* Phase Strip */}
      <Panel variant="elevated">
        <div className="relative">
          {/* Track line */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-border-subtle" />

          <div className="space-y-0">
            {phases.map((p) => {
              const isCurrent = p === phase;
              const isCompleted = p < phase;
              const isFuture = p > phase;
              
              const startDay = phaseEntryDay[p];
              const nextPhaseStartDay = phaseEntryDay[(p + 1) as PhaseId];
              const hasStarted = startDay !== undefined;
              
              const startWeek = hasStarted ? Math.ceil(startDay / 7) : null;
              
              let durationDays = 0;
              if (isCompleted && hasStarted && nextPhaseStartDay !== undefined) {
                durationDays = nextPhaseStartDay - startDay;
              } else if (isCurrent && hasStarted) {
                durationDays = day - startDay;
              }

              return (
                <div key={p} className={`relative flex items-start gap-4 py-4 ${isCurrent ? '' : ''}`}>
                  {/* Node */}
                  <div className={`relative z-10 shrink-0 w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                    isCurrent
                      ? 'bg-accent-primary/20 border-accent-primary shadow-[var(--shadow-glow-strong)]'
                      : isCompleted
                      ? 'bg-state-success/20 border-state-success'
                      : 'bg-surface-default border-border-subtle'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle2 size={18} className="text-state-success" />
                    ) : isCurrent ? (
                      <MapPin size={18} className="text-accent-primary" />
                    ) : (
                      <Lock size={14} className="text-text-muted/30" />
                    )}
                  </div>

                  {/* Phase Info */}
                  <div className={`flex-1 pt-1 ${isFuture ? 'opacity-40' : ''}`}>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-text-muted">Phase {p}</span>
                      {isCurrent && <StatusChip label="Current" variant="accent" />}
                      {isCompleted && <StatusChip label="Complete" variant="success" />}
                      {isFuture && <StatusChip label="Locked" variant="muted" />}
                    </div>
                    <h3 className={`text-[15px] font-semibold mt-1 ${isCurrent ? 'text-text-accent' : isCompleted ? 'text-text-primary' : 'text-text-muted'}`}>
                      {PHASE_NAMES[p]}
                    </h3>
                    <div className="text-[11px] font-mono text-text-muted mt-1">
                      {hasStarted ? (
                        <>
                          Started Day {startDay} (Week {startWeek})
                          <span className="ml-3 text-text-muted/70">
                            Duration: {durationDays} days
                          </span>
                        </>
                      ) : (
                        <span className="italic text-text-muted/50">upcoming</span>
                      )}
                    </div>

                    {/* Current phase detail */}
                    {isCurrent && hasStarted && (
                      <div className="mt-3 p-3 rounded-[var(--radius-md)] bg-accent-soft/50 border border-border-accent/30">
                        <div className="text-[11px] text-text-secondary">
                          Currently week {currentWeek} (Day {day}). You have spent {durationDays} days in this phase.
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Panel>

      {/* Week marker */}
      <Panel title="Current Position">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-3xl font-mono font-bold text-text-accent">{currentWeek}</div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-text-muted">Week</div>
          </div>
          <div className="h-8 w-px bg-border-subtle" />
          <div className="text-center">
            <div className="text-3xl font-mono font-bold text-text-primary">{phase}</div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-text-muted">Phase</div>
          </div>
          <div className="h-8 w-px bg-border-subtle" />
          <div>
            <div className="text-[14px] font-semibold text-text-secondary">{PHASE_NAMES[phase]}</div>
            <div className="text-[11px] text-text-muted">Deal process in early stages</div>
          </div>
        </div>
      </Panel>
    </div>
  );
}
