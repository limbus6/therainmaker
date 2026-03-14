import { useGameStore } from '../store/gameStore';
import { PHASE_NAMES } from '../types/game';
import type { PhaseId } from '../types/game';
import Panel from '../components/ui/Panel';
import StatusChip from '../components/ui/StatusChip';
import { CheckCircle2, Lock, MapPin } from 'lucide-react';

const PHASE_WEEK_RANGES: Record<PhaseId, [number, number]> = {
  0: [1, 3],       // Deal Origination — qualify the opportunity
  1: [4, 7],       // Pitch & Mandate — win the engagement
  2: [8, 14],      // Preparation — build materials, VDD, data room
  3: [15, 20],     // Market Outreach — teaser, NDA, IM distribution
  4: [21, 24],     // Shortlist — filter to serious buyers
  5: [25, 28],     // Non-Binding Offers — NBOs received and analysed
  6: [29, 36],     // Due Diligence — VDR, expert sessions, mgmt presentations
  7: [37, 40],     // Final Offers — BAFO, SPA draft
  8: [41, 44],     // SPA Negotiation — mark-ups, reps & warranties
  9: [45, 47],     // Signing — contracts in agreed form
  10: [48, 52],    // Closing & Execution — conditions precedent, wire
};

export default function TimelineScreen() {
  const { phase, week } = useGameStore();

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
              const [weekStart, weekEnd] = PHASE_WEEK_RANGES[p];

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
                      Weeks {weekStart}–{weekEnd}
                      {isCurrent && (
                        <span className="ml-3 text-text-accent">
                          Currently week {week}
                        </span>
                      )}
                    </div>

                    {/* Current phase detail */}
                    {isCurrent && (
                      <div className="mt-3 p-3 rounded-[var(--radius-md)] bg-accent-soft/50 border border-border-accent/30">
                        <div className="text-[11px] text-text-secondary">
                          Week {week} of {weekEnd} in this phase. {weekEnd - week} weeks remaining before expected transition.
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
            <div className="text-3xl font-mono font-bold text-text-accent">{week}</div>
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
