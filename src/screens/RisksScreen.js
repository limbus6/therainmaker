import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useGameStore } from '../store/gameStore';
import Panel from '../components/ui/Panel';
import StatusChip from '../components/ui/StatusChip';
import { AlertTriangle, Shield, Wrench } from 'lucide-react';
import { getRiskMitigationPlans } from '../config/riskMitigation';
import { formatNumber } from '../utils/numberFormat';
const severityVariant = {
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
    return (_jsxs("div", { className: "space-y-6 max-w-[1200px]", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-display font-semibold text-text-primary", children: "Risks & Issues" }), _jsx("p", { className: "text-[12px] text-text-muted mt-1", children: "Structured transaction risk management" })] }), _jsx("div", { className: "grid grid-cols-4 gap-3", children: ['critical', 'high', 'medium', 'low'].map((sev) => {
                    const count = activeRisks.filter((r) => r.severity === sev).length;
                    return (_jsxs(Panel, { children: [_jsx("div", { className: "text-[10px] font-mono uppercase tracking-widest text-text-muted mb-1", children: sev }), _jsx("div", { className: `text-xl font-mono font-semibold ${sev === 'critical' ? 'text-state-danger' : sev === 'high' ? 'text-state-warning' : 'text-text-primary'}`, children: count })] }, sev));
                }) }), _jsx(Panel, { title: "Active Risks", variant: activeRisks.some((r) => r.severity === 'critical') ? 'critical' : 'default', children: activeRisks.length === 0 ? (_jsxs("div", { className: "flex items-center gap-2 py-4 text-state-success", children: [_jsx(Shield, { size: 16 }), _jsx("span", { className: "text-[13px]", children: "No active risks. Process health is strong." })] })) : (_jsx("div", { className: "space-y-2", children: activeRisks.map((risk) => (_jsxs("div", { className: "flex items-start gap-3 p-3 rounded-[var(--radius-md)] bg-surface-default border border-border-subtle", children: [_jsx(AlertTriangle, { size: 16, className: `shrink-0 mt-0.5 ${risk.severity === 'critical' || risk.severity === 'high' ? 'text-state-danger' : 'text-state-warning'}` }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-[13px] font-medium text-text-primary", children: risk.name }), _jsx(StatusChip, { label: risk.severity, variant: severityVariant[risk.severity] }), _jsx(StatusChip, { label: risk.category })] }), _jsx("p", { className: "text-[12px] text-text-muted mt-1", children: risk.description }), _jsxs("div", { className: "text-[10px] font-mono text-text-muted mt-2", children: ["Probability: ", formatNumber(risk.probability), "% | Surfaced: Phase ", risk.surfacedPhase, ", Week ", risk.surfacedWeek] }), _jsx("div", { className: "mt-3 space-y-2", children: getRiskMitigationPlans(risk).map((plan) => {
                                            const canAffordBudget = budget >= plan.budgetCost;
                                            const canAffordCapacity = teamCapacity >= plan.capacityCost;
                                            const canRun = canAffordBudget && canAffordCapacity;
                                            return (_jsxs("div", { className: "rounded-[var(--radius-md)] border border-border-subtle p-2.5 bg-bg-primary/35", children: [_jsxs("div", { className: "flex items-center justify-between gap-3", children: [_jsxs("div", { children: [_jsx("p", { className: "text-[12px] font-medium text-text-secondary", children: plan.title }), _jsxs("p", { className: "text-[10px] text-text-muted mt-0.5", children: ["Budget: \u20AC", formatNumber(plan.budgetCost), "k \u00B7 Capacity: ", formatNumber(plan.capacityCost), "%", ' ', "\u00B7 Success: ", formatNumber(plan.successChance * 100), "%", plan.catastrophicFailureChance
                                                                                ? ` · Catastrophic fail: ${formatNumber(plan.catastrophicFailureChance * 100)}%`
                                                                                : ''] })] }), _jsxs("button", { onClick: () => executeRiskMitigationPlan(risk.id, plan.id), disabled: !canRun, className: "flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium bg-accent-primary/10 text-text-accent hover:bg-accent-primary/20 disabled:opacity-40 disabled:cursor-not-allowed rounded-[var(--radius-md)] transition-colors", children: [_jsx(Wrench, { size: 12 }), "Run Plan"] })] }), _jsx("div", { className: "mt-2 space-y-1", children: plan.actions.map((action, idx) => (_jsxs("p", { className: "text-[11px] text-text-muted", children: ["- ", action] }, idx))) }), !canRun && (_jsxs("p", { className: "text-[10px] text-state-warning mt-2", children: ["Insufficient resources: ", !canAffordBudget ? 'budget ' : '', !canAffordCapacity ? 'capacity' : ''] }))] }, plan.id));
                                        }) })] })] }, risk.id))) })) }), mitigatedRisks.length > 0 && (_jsx(Panel, { title: "Mitigated Risks", children: _jsx("div", { className: "space-y-2", children: mitigatedRisks.map((risk) => (_jsxs("div", { className: "flex items-center gap-3 p-2 rounded-[var(--radius-md)] bg-surface-default opacity-60", children: [_jsx(Shield, { size: 14, className: "text-state-success" }), _jsx("span", { className: "text-[12px] text-text-secondary", children: risk.name }), _jsx(StatusChip, { label: "Mitigated", variant: "success" })] }, risk.id))) }) }))] }));
}
//# sourceMappingURL=RisksScreen.js.map