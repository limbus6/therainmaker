import { useGameStore } from '../store/gameStore';
import Panel from '../components/ui/Panel';
import StatusChip from '../components/ui/StatusChip';
import { AlertTriangle, Shield, Wrench } from 'lucide-react';
import type { RiskSeverity } from '../types/game';
import { getRiskMitigationPlans } from '../config/riskMitigation';
import { formatNumber } from '../utils/numberFormat';

const severityVariant: Record<RiskSeverity, 'muted' | 'warning' | 'danger'> = {
  low: 'muted',
  medium: 'warning',
  high: 'danger',
  critical: 'danger',
};

export default function RisksScreen() {
  const risks = useGameStore((s) => s.risks);
  const budget = useGameStore((s) => s.resources.budget);
  const teamCapacity = useGameStore((s) => s.resources.teamCapacity);
  const executeRiskMitigationPlan = useGameStore((s) => s.executeRiskMitigationPlan);
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
                  <div className="text-[10px] font-mono text-text-muted mt-2">
                    Probability: {formatNumber(risk.probability)}% | Surfaced: Phase {risk.surfacedPhase}, Week {risk.surfacedWeek}
                  </div>

                  <div className="mt-3 space-y-2">
                    {getRiskMitigationPlans(risk).map((plan) => {
                      const canAffordBudget = budget >= plan.budgetCost;
                      const canAffordCapacity = teamCapacity >= plan.capacityCost;
                      const canRun = canAffordBudget && canAffordCapacity;
                      return (
                        <div key={plan.id} className="rounded-[var(--radius-md)] border border-border-subtle p-2.5 bg-bg-primary/35">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-[12px] font-medium text-text-secondary">{plan.title}</p>
                              <p className="text-[10px] text-text-muted mt-0.5">
                                Budget: €{formatNumber(plan.budgetCost)}k · Capacity: {formatNumber(plan.capacityCost)}%
                                {' '}· Success: {formatNumber(plan.successChance * 100)}%
                                {plan.catastrophicFailureChance
                                  ? ` · Catastrophic fail: ${formatNumber(plan.catastrophicFailureChance * 100)}%`
                                  : ''}
                              </p>
                            </div>
                            <button
                              onClick={() => executeRiskMitigationPlan(risk.id, plan.id)}
                              disabled={!canRun}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium bg-accent-primary/10 text-text-accent hover:bg-accent-primary/20 disabled:opacity-40 disabled:cursor-not-allowed rounded-[var(--radius-md)] transition-colors"
                            >
                              <Wrench size={12} />
                              Run Plan
                            </button>
                          </div>
                          <div className="mt-2 space-y-1">
                            {plan.actions.map((action, idx) => (
                              <p key={idx} className="text-[11px] text-text-muted">- {action}</p>
                            ))}
                          </div>
                          {!canRun && (
                            <p className="text-[10px] text-state-warning mt-2">
                              Insufficient resources: {!canAffordBudget ? 'budget ' : ''}{!canAffordCapacity ? 'capacity' : ''}
                            </p>
                          )}
                        </div>
                      );
                    })}
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
