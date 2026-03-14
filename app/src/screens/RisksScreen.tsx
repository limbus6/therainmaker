import { useGameStore } from '../store/gameStore';
import Panel from '../components/ui/Panel';
import StatusChip from '../components/ui/StatusChip';
import { AlertTriangle, Shield } from 'lucide-react';
import type { RiskSeverity } from '../types/game';

const severityVariant: Record<RiskSeverity, 'muted' | 'warning' | 'danger'> = {
  low: 'muted',
  medium: 'warning',
  high: 'danger',
  critical: 'danger',
};

const mitigationCost: Record<RiskSeverity, number> = { low: 2, medium: 4, high: 6, critical: 8 };

export default function RisksScreen() {
  const risks = useGameStore((s) => s.risks);
  const budget = useGameStore((s) => s.resources.budget);
  const mitigateRisk = useGameStore((s) => s.mitigateRisk);
  const activeRisks = risks.filter((r) => !r.mitigated);
  const mitigatedRisks = risks.filter((r) => r.mitigated);

  return (
    <div className="space-y-6 max-w-[1200px]">
      <div>
        <h1 className="text-2xl font-display font-semibold text-text-primary">Risks & Issues</h1>
        <p className="text-[12px] text-text-muted mt-1">Structured transaction risk management</p>
      </div>

      {/* Risk Heat Summary */}
      <div className="grid grid-cols-4 gap-3">
        {(['critical', 'high', 'medium', 'low'] as RiskSeverity[]).map((sev) => {
          const count = activeRisks.filter((r) => r.severity === sev).length;
          return (
            <Panel key={sev}>
              <div className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-1">{sev}</div>
              <div className={`text-xl font-mono font-semibold ${sev === 'critical' ? 'text-state-danger' : sev === 'high' ? 'text-state-warning' : 'text-text-primary'}`}>
                {count}
              </div>
            </Panel>
          );
        })}
      </div>

      {/* Active Risks */}
      <Panel title="Active Risks" variant={activeRisks.some((r) => r.severity === 'critical') ? 'critical' : 'default'}>
        {activeRisks.length === 0 ? (
          <div className="flex items-center gap-2 py-4 text-state-success">
            <Shield size={16} />
            <span className="text-[13px]">No active risks. Process health is strong.</span>
          </div>
        ) : (
          <div className="space-y-2">
            {activeRisks.map((risk) => (
              <div key={risk.id} className="flex items-start gap-3 p-3 rounded-[var(--radius-md)] bg-surface-default border border-border-subtle">
                <AlertTriangle size={16} className={`shrink-0 mt-0.5 ${risk.severity === 'critical' || risk.severity === 'high' ? 'text-state-danger' : 'text-state-warning'}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-medium text-text-primary">{risk.name}</span>
                    <StatusChip label={risk.severity} variant={severityVariant[risk.severity]} />
                    <StatusChip label={risk.category} />
                  </div>
                  <p className="text-[12px] text-text-muted mt-1">{risk.description}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-[10px] font-mono text-text-muted">
                      Probability: {risk.probability}% | Surfaced: Phase {risk.surfacedPhase}, Week {risk.surfacedWeek}
                    </div>
                    <button
                      onClick={() => mitigateRisk(risk.id)}
                      disabled={budget < mitigationCost[risk.severity]}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium bg-accent-primary/10 text-text-accent hover:bg-accent-primary/20 disabled:opacity-40 disabled:cursor-not-allowed rounded-[var(--radius-md)] transition-colors"
                    >
                      <Shield size={12} />
                      Mitigate (€{mitigationCost[risk.severity]}k)
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>

      {/* Mitigated */}
      {mitigatedRisks.length > 0 && (
        <Panel title="Mitigated Risks">
          <div className="space-y-2">
            {mitigatedRisks.map((risk) => (
              <div key={risk.id} className="flex items-center gap-3 p-2 rounded-[var(--radius-md)] bg-surface-default opacity-60">
                <Shield size={14} className="text-state-success" />
                <span className="text-[12px] text-text-secondary">{risk.name}</span>
                <StatusChip label="Mitigated" variant="success" />
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}
