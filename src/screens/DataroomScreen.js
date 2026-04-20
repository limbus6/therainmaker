import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useGameStore } from '../store/gameStore';
import Panel from '../components/ui/Panel';
import StatusChip from '../components/ui/StatusChip';
import { Database, Lock, Eye, Unlock, AlertTriangle, Users, CheckCircle2, Info } from 'lucide-react';
// ─── Access level config ────────────────────────────────────────────────────
const ACCESS_LEVELS = [
    { level: 'restricted', label: 'Restricted', icon: _jsx(Lock, { size: 12 }), color: 'text-state-danger', bg: 'bg-state-danger/10 border-state-danger/30' },
    { level: 'partial', label: 'Partial', icon: _jsx(Eye, { size: 12 }), color: 'text-state-warning', bg: 'bg-state-warning/10 border-state-warning/30' },
    { level: 'full', label: 'Full Access', icon: _jsx(Unlock, { size: 12 }), color: 'text-state-success', bg: 'bg-state-success/10 border-state-success/30' },
];
const SENSITIVITY_CONFIG = {
    low: { label: 'Low', color: 'text-state-success', variant: 'success' },
    medium: { label: 'Medium', color: 'text-state-warning', variant: 'warning' },
    high: { label: 'High', color: 'text-state-danger', variant: 'danger' },
    critical: { label: 'Critical', color: 'text-text-accent', variant: 'accent' },
};
// ─── Risk summary helpers ────────────────────────────────────────────────────
function computeExposureRisk(categories) {
    const weights = { low: 5, medium: 15, high: 30, critical: 50 };
    const multipliers = { restricted: 0, partial: 0.4, full: 1.0 };
    const total = categories.reduce((sum, c) => sum + weights[c.sensitivity] * multipliers[c.accessLevel], 0);
    const max = categories.reduce((sum, c) => sum + weights[c.sensitivity], 0);
    return max > 0 ? Math.round((total / max) * 100) : 0;
}
function computeBuyerReadiness(categories) {
    // Buyers need financials, legal, and at least partial on key docs
    const financials = categories.find((c) => c.id === 'dr-financials');
    const legal = categories.find((c) => c.id === 'dr-legal');
    const ops = categories.find((c) => c.id === 'dr-operations');
    let score = 0;
    if (financials?.accessLevel !== 'restricted')
        score += 40;
    if (legal?.accessLevel !== 'restricted')
        score += 30;
    if (ops?.accessLevel !== 'restricted')
        score += 20;
    if (categories.filter((c) => c.accessLevel === 'full').length >= 3)
        score += 10;
    return Math.min(100, score);
}
// ─── Screen ─────────────────────────────────────────────────────────────────
export default function DataroomScreen() {
    const phase = useGameStore((s) => s.phase);
    const dataroomCategories = useGameStore((s) => s.dataroomCategories);
    const setDataroomAccess = useGameStore((s) => s.setDataroomAccess);
    const buyers = useGameStore((s) => s.buyers);
    const tasks = useGameStore((s) => s.tasks);
    const resources = useGameStore((s) => s.resources);
    if (phase < 5) {
        return (_jsx("div", { className: "flex items-center justify-center h-full", children: _jsxs("div", { className: "text-center", children: [_jsx(Database, { size: 32, className: "text-text-muted/20 mx-auto mb-3" }), _jsx("p", { className: "text-[13px] text-text-muted", children: "The data room opens in Phase 5 \u2014 Non-Binding Offers." }), _jsx("p", { className: "text-[11px] text-text-muted/60 mt-1", children: "Buyers will gain access once shortlisting is complete." })] }) }));
    }
    const activeBuyers = buyers.filter((b) => !['dropped', 'excluded'].includes(b.status));
    const exposureRisk = computeExposureRisk(dataroomCategories);
    const buyerReadiness = computeBuyerReadiness(dataroomCategories);
    // Q&A related tasks (phase 6 tasks 80-84 are Q&A)
    const ddTasks = tasks.filter((t) => t.phase === 6 && (t.category === 'external_advisor' || t.description?.toLowerCase().includes('q&a') || t.description?.toLowerCase().includes('dataroom') || t.name?.toLowerCase().includes('q&a') || t.name?.toLowerCase().includes('data room')));
    return (_jsxs("div", { className: "space-y-6 max-w-[1200px]", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-display font-semibold text-text-primary", children: "Data Room" }), _jsx("p", { className: "text-[12px] text-text-muted mt-1", children: "Manage document access levels for due diligence. Balance buyer engagement against information risk." })] }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3", children: [_jsxs("div", { className: "bg-bg-panel/60 border border-border-subtle rounded-[var(--radius-md)] p-3", children: [_jsx("p", { className: "text-[10px] font-mono uppercase tracking-widest text-text-muted mb-1", children: "Active Buyers in DD" }), _jsx("p", { className: "text-xl font-semibold font-mono text-text-primary", children: activeBuyers.length })] }), _jsxs("div", { className: "bg-bg-panel/60 border border-border-subtle rounded-[var(--radius-md)] p-3", children: [_jsx("p", { className: "text-[10px] font-mono uppercase tracking-widest text-text-muted mb-1", children: "Buyer Readiness" }), _jsxs("p", { className: `text-xl font-semibold font-mono ${buyerReadiness >= 70 ? 'text-state-success' : buyerReadiness >= 40 ? 'text-state-warning' : 'text-state-danger'}`, children: [buyerReadiness, "%"] })] }), _jsxs("div", { className: "bg-bg-panel/60 border border-border-subtle rounded-[var(--radius-md)] p-3", children: [_jsx("p", { className: "text-[10px] font-mono uppercase tracking-widest text-text-muted mb-1", children: "Exposure Risk" }), _jsxs("p", { className: `text-xl font-semibold font-mono ${exposureRisk <= 30 ? 'text-state-success' : exposureRisk <= 60 ? 'text-state-warning' : 'text-state-danger'}`, children: [exposureRisk, "%"] })] }), _jsxs("div", { className: "bg-bg-panel/60 border border-border-subtle rounded-[var(--radius-md)] p-3", children: [_jsx("p", { className: "text-[10px] font-mono uppercase tracking-widest text-text-muted mb-1", children: "Deal Momentum" }), _jsx("p", { className: `text-xl font-semibold font-mono ${resources.dealMomentum >= 60 ? 'text-state-success' : resources.dealMomentum >= 35 ? 'text-state-warning' : 'text-state-danger'}`, children: resources.dealMomentum })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [_jsxs("div", { className: "lg:col-span-2 space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h2", { className: "text-[13px] font-semibold text-text-primary uppercase tracking-wider", children: "Document Access Control" }), _jsxs("div", { className: "flex items-center gap-3 text-[10px] text-text-muted font-mono", children: [_jsxs("span", { className: "flex items-center gap-1", children: [_jsx(Lock, { size: 10, className: "text-state-danger" }), " Restricted"] }), _jsxs("span", { className: "flex items-center gap-1", children: [_jsx(Eye, { size: 10, className: "text-state-warning" }), " Partial"] }), _jsxs("span", { className: "flex items-center gap-1", children: [_jsx(Unlock, { size: 10, className: "text-state-success" }), " Full"] })] })] }), dataroomCategories.map((cat) => {
                                const sensConfig = SENSITIVITY_CONFIG[cat.sensitivity];
                                return (_jsxs(Panel, { variant: "default", className: "p-0 overflow-hidden", children: [_jsxs("div", { className: "flex items-start gap-0", children: [_jsx("div", { className: `w-1 self-stretch shrink-0 ${cat.sensitivity === 'critical' ? 'bg-text-accent' :
                                                        cat.sensitivity === 'high' ? 'bg-state-danger' :
                                                            cat.sensitivity === 'medium' ? 'bg-state-warning' : 'bg-state-success'}` }), _jsxs("div", { className: "flex-1 px-4 py-3 flex flex-col md:flex-row md:items-center gap-3", children: [_jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center gap-2 mb-0.5", children: [_jsx("span", { className: "text-[13px] font-medium text-text-primary", children: cat.name }), _jsx(StatusChip, { label: sensConfig.label, variant: sensConfig.variant })] }), _jsx("p", { className: "text-[11px] text-text-muted leading-relaxed", children: cat.description })] }), _jsx("div", { className: "shrink-0 flex items-center gap-1 bg-bg-secondary rounded-[var(--radius-md)] p-0.5", children: ACCESS_LEVELS.map((a) => (_jsxs("button", { onClick: () => setDataroomAccess(cat.id, a.level), className: `flex items-center gap-1 px-2.5 py-1.5 rounded text-[11px] font-medium transition-all duration-150 border ${cat.accessLevel === a.level
                                                                    ? `${a.color} ${a.bg}`
                                                                    : 'text-text-muted border-transparent hover:text-text-secondary hover:bg-surface-hover'}`, children: [a.icon, _jsx("span", { className: "hidden sm:inline", children: a.label })] }, a.level))) })] })] }), cat.accessLevel === 'full' && (cat.sensitivity === 'high' || cat.sensitivity === 'critical') && (_jsxs("div", { className: "mx-5 mb-3 px-3 py-2 rounded bg-state-warning/10 border border-state-warning/20 flex items-center gap-2", children: [_jsx(AlertTriangle, { size: 12, className: "text-state-warning shrink-0" }), _jsx("p", { className: "text-[11px] text-state-warning", children: cat.sensitivity === 'critical'
                                                        ? 'Critical data fully exposed. Consider restricting once buyers have reviewed key sections.'
                                                        : 'High sensitivity data fully exposed. Monitor buyer behaviour closely.' })] }))] }, cat.id));
                            })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs(Panel, { variant: "elevated", children: [_jsxs("div", { className: "flex items-center gap-2 mb-3", children: [_jsx(Users, { size: 14, className: "text-text-muted" }), _jsx("h3", { className: "text-[12px] font-semibold text-text-primary uppercase tracking-wider", children: "Buyer DD Status" })] }), activeBuyers.length === 0 ? (_jsx("p", { className: "text-[12px] text-text-muted", children: "No active buyers." })) : (_jsx("div", { className: "space-y-2", children: activeBuyers.map((buyer) => {
                                            const frictionColor = buyer.ddFriction === 'high' ? 'text-state-danger' : buyer.ddFriction === 'medium' ? 'text-state-warning' : 'text-state-success';
                                            const dropRisk = buyer.ddFriction === 'high' && exposureRisk < 30;
                                            return (_jsxs("div", { className: "flex items-center justify-between py-2 border-b border-border-subtle/40 last:border-0", children: [_jsxs("div", { children: [_jsx("p", { className: "text-[12px] font-medium text-text-primary", children: buyer.name }), _jsxs("p", { className: "text-[10px] text-text-muted", children: [buyer.type === 'pe' ? 'PE' : 'Strategic', " \u00B7 ", buyer.geography] })] }), _jsxs("div", { className: "text-right", children: [_jsx("p", { className: `text-[11px] font-medium ${frictionColor}`, children: buyer.ddFriction === 'high' ? '⚠ High Friction' : buyer.ddFriction === 'medium' ? '~ Medium' : '✓ Low Friction' }), dropRisk && (_jsx("p", { className: "text-[10px] text-state-danger", children: "Risk: may drop" }))] })] }, buyer.id));
                                        }) }))] }), _jsx(Panel, { variant: "default", className: "bg-state-info/5 border-state-info/20", children: _jsxs("div", { className: "flex items-start gap-2", children: [_jsx(Info, { size: 13, className: "text-state-info shrink-0 mt-0.5" }), _jsxs("p", { className: "text-[11px] text-text-muted leading-relaxed", children: ["Buyers with ", _jsx("strong", { className: "text-text-secondary", children: "high DD friction" }), " need access to Financials, Legal, and Operational data to stay engaged. Opening ", _jsx("strong", { className: "text-text-secondary", children: "critical or high-sensitivity" }), " categories builds conviction but increases deal risk \u2014 manage the balance."] })] }) }), ddTasks.length > 0 && (_jsxs(Panel, { variant: "elevated", children: [_jsxs("div", { className: "flex items-center gap-2 mb-3", children: [_jsx(CheckCircle2, { size: 14, className: "text-text-muted" }), _jsx("h3", { className: "text-[12px] font-semibold text-text-primary uppercase tracking-wider", children: "Q&A Tasks" })] }), _jsx("div", { className: "space-y-2", children: ddTasks.map((t) => (_jsxs("div", { className: "flex items-start gap-2 py-1.5 border-b border-border-subtle/40 last:border-0", children: [_jsx("div", { className: `mt-0.5 w-2 h-2 rounded-full shrink-0 ${t.status === 'completed' ? 'bg-state-success' : t.status === 'in_progress' ? 'bg-state-warning' : 'bg-border-subtle'}` }), _jsxs("div", { children: [_jsx("p", { className: "text-[12px] text-text-primary", children: t.name }), _jsx("p", { className: "text-[10px] text-text-muted capitalize", children: t.status.replace('_', ' ') })] })] }, t.id))) })] }))] })] })] }));
}
//# sourceMappingURL=DataroomScreen.js.map