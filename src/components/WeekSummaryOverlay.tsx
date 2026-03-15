import { useGameStore } from '../store/gameStore';
import StatusChip from './ui/StatusChip';
import ProgressBar from './ui/ProgressBar';
import { CheckCircle2, Clock, AlertTriangle, TrendingUp, TrendingDown, ArrowRight, X, Users, Zap } from 'lucide-react';

export default function WeekSummaryOverlay() {
  const result = useGameStore((s) => s.lastWeekResult);
  const day = useGameStore((s) => s.day);
  const week = useGameStore((s) => s.week);
  const resources = useGameStore((s) => s.resources);
  const phaseGate = useGameStore((s) => s.phaseGate);
  const buyers = useGameStore((s) => s.buyers);
  const dismiss = useGameStore((s) => s.dismissWeekSummary);
  const advancePhase = useGameStore((s) => s.advancePhase);

  if (!result) return null;

  const hasCompleted = result.tasksCompleted.length > 0;
  const hasProgressed = result.tasksProgressed.length > 0;
  const hasBuyerChanges = result.buyerChanges.length > 0;
  const hasEvents = result.newEvents.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-primary/80 backdrop-blur-sm">
      <div className="bg-bg-panel border border-border-subtle rounded-[var(--radius-lg)] shadow-[var(--shadow-elevated)] w-full max-w-xl max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border-subtle">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-text-muted">
              {result?.daysAdvanced === 1 ? '1 Day Advanced' : `${result?.daysAdvanced ?? '?'} Days Advanced`}
              <span className="ml-2 text-text-muted/50">· Day {day} · Week {week}</span>
            </div>
            <h2 className="text-lg font-display font-semibold text-text-primary mt-1">Situation Report</h2>
          </div>
          <button onClick={dismiss} className="p-1.5 rounded-[var(--radius-sm)] hover:bg-surface-hover transition-colors">
            <X size={16} className="text-text-muted" />
          </button>
        </div>

        {/* Narrative */}
        <div className="px-5 py-4 border-b border-border-subtle">
          <p className="text-[13px] text-text-secondary leading-relaxed">{result.narrativeSummary}</p>
        </div>

        {/* Tasks Resolved */}
        {(hasCompleted || hasProgressed) && (
          <div className="px-5 py-4 border-b border-border-subtle space-y-3">
            <div className="text-[10px] font-mono uppercase tracking-widest text-text-muted">Task Progress</div>
            {result.tasksCompleted.map((t) => (
              <div key={t.id} className="flex items-center gap-3 p-2 rounded-[var(--radius-md)] bg-state-success/10">
                <CheckCircle2 size={14} className="text-state-success shrink-0" />
                <span className="text-[12px] text-text-primary">{t.name}</span>
                <StatusChip label="Completed" variant="success" />
              </div>
            ))}
            {result.tasksProgressed.map((t) => (
              <div key={t.id} className="flex items-center gap-3 p-2 rounded-[var(--radius-md)] bg-surface-default">
                <Clock size={14} className="text-text-muted shrink-0" />
                <span className="text-[12px] text-text-secondary">{t.name}</span>
                <StatusChip label="In Progress" variant="info" />
              </div>
            ))}
          </div>
        )}

        {/* Hidden Workload */}
        {result.hiddenWorkload && (
          <div className="px-5 py-4 border-b border-border-subtle">
            <div className="flex items-start gap-3 p-3 rounded-[var(--radius-md)] bg-state-warning/10 border border-state-warning/20">
              <AlertTriangle size={16} className="text-state-warning shrink-0 mt-0.5" />
              <div>
                <div className="text-[12px] font-semibold text-text-primary">Complication</div>
                <p className="text-[11px] text-text-secondary mt-1">{result.hiddenWorkload.description}</p>
                <p className="text-[10px] font-mono text-text-muted mt-1">+{result.hiddenWorkload.extraWork}h extra work</p>
              </div>
            </div>
          </div>
        )}

        {/* Buyer Changes */}
        {hasBuyerChanges && (
          <div className="px-5 py-4 border-b border-border-subtle space-y-3">
            <div className="text-[10px] font-mono uppercase tracking-widest text-text-muted">Buyer Activity</div>
            {result.buyerChanges.map((change, i) => {
              const buyer = buyers.find((b) => b.id === change.buyerId);
              const label = change.field === 'status'
                ? `${change.from} → ${change.to}`
                : `Interest: ${change.from} → ${change.to}`;
              return (
                <div key={i} className="flex items-center gap-3 p-2 rounded-[var(--radius-md)] bg-accent-primary/5">
                  <Users size={14} className="text-accent-primary shrink-0" />
                  <span className="text-[12px] text-text-primary">{buyer?.name ?? change.buyerId}</span>
                  <StatusChip label={label} variant={change.field === 'status' ? 'accent' : 'info'} />
                </div>
              );
            })}
          </div>
        )}

        {/* Events */}
        {hasEvents && (
          <div className="px-5 py-4 border-b border-border-subtle space-y-3">
            <div className="text-[10px] font-mono uppercase tracking-widest text-text-muted">Events</div>
            {result.newEvents.map((evt) => (
              <div key={evt.id} className="flex items-start gap-3 p-3 rounded-[var(--radius-md)] bg-accent-primary/5 border border-accent-primary/10">
                <Zap size={14} className="text-accent-primary shrink-0 mt-0.5" />
                <div>
                  <div className="text-[12px] font-semibold text-text-primary">{evt.title}</div>
                  <p className="text-[11px] text-text-secondary mt-1">{evt.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Resource Changes */}
        <div className="px-5 py-4 border-b border-border-subtle">
          <div className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-3">Resources</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: 'Budget', value: `€${resources.budget}k`, max: resources.budgetMax, current: resources.budget, color: 'accent' as const },
              { label: 'Capacity', value: `${resources.teamCapacity}%`, max: 100, current: resources.teamCapacity, color: 'success' as const },
              { label: 'Momentum', value: resources.dealMomentum, max: 100, current: resources.dealMomentum, color: 'accent' as const },
              { label: 'Trust', value: resources.clientTrust, max: 100, current: resources.clientTrust, color: 'info' as const },
            ].map((r) => (
              <div key={r.label} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-text-secondary">{r.label}</span>
                  <span className="text-[11px] font-mono text-text-primary">{r.value}</span>
                </div>
                <ProgressBar value={Math.round((r.current / r.max) * 100)} color={r.color} size="sm" />
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-3 text-[11px]">
            <span className="flex items-center gap-1 text-text-secondary">
              Morale: <span className="font-mono text-text-primary">{resources.morale}</span>
              {resources.morale >= 70 ? <TrendingUp size={12} className="text-state-success" /> : <TrendingDown size={12} className="text-state-danger" />}
            </span>
            <span className="flex items-center gap-1 text-text-secondary">
              Risk: <span className="font-mono text-text-primary">{resources.riskLevel}</span>
            </span>
          </div>
        </div>

        {/* Phase Gate Status */}
        {phaseGate && (
          <div className="px-5 py-4 border-b border-border-subtle">
            <div className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-3">Phase Gate</div>
            <div className="space-y-2">
              {phaseGate.requirements.map((req) => (
                <div key={req.label} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${req.met ? 'bg-state-success' : 'bg-border-subtle'}`} />
                  <span className={`text-[11px] ${req.met ? 'text-text-primary' : 'text-text-muted'}`}>{req.label}</span>
                </div>
              ))}
            </div>
            {phaseGate.canTransition && (
              <button
                onClick={() => { advancePhase(); dismiss(); }}
                className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-accent-primary hover:bg-accent-hover text-white text-[13px] font-semibold rounded-[var(--radius-md)] transition-colors shadow-[var(--shadow-glow-strong)]"
              >
                Advance to Next Phase
                <ArrowRight size={14} />
              </button>
            )}
          </div>
        )}

        {/* Dismiss */}
        <div className="p-5">
          <button
            onClick={dismiss}
            className="w-full px-4 py-2.5 text-[13px] font-medium text-text-secondary border border-border-subtle rounded-[var(--radius-md)] hover:bg-surface-hover transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
