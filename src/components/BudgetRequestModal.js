import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { BUDGET_LOW_THRESHOLD } from '../config/phaseBudgets';
import { PHASE_NAMES } from '../types/game';
import { X, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
export default function BudgetRequestModal({ onClose }) {
    const phase = useGameStore((s) => s.phase);
    const resources = useGameStore((s) => s.resources);
    const phaseBudget = useGameStore((s) => s.phaseBudget);
    const budgetRequests = useGameStore((s) => s.budgetRequests);
    const requestBudget = useGameStore((s) => s.requestBudget);
    const [amount, setAmount] = useState(10);
    const [selectedReasons, setSelectedReasons] = useState([]);
    const [submitted, setSubmitted] = useState(false);
    const PRESET_REASONS = [
        { id: 'legal', label: 'Legal escalation', text: 'Unexpected legal complexity' },
        { id: 'valuation', label: 'Valuation support', text: 'Strengthen valuation positioning' },
        { id: 'mgmt', label: 'Management prep', text: 'Prepare management for buyer sessions' },
        { id: 'specialist', label: 'External specialist', text: 'Bring in specialist support' },
        { id: 'client', label: 'Client relationship', text: 'Protect client trust in a critical phase' },
        { id: 'contingency', label: 'Process contingency', text: 'Cover process extension and complications' },
        { id: 'dataroom', label: 'Dataroom / DD support', text: 'Support dataroom and DD response load' },
        { id: 'advisor', label: 'Third-party advisor', text: 'Fund third-party advisor work' },
    ];
    const justification = selectedReasons
        .map((id) => PRESET_REASONS.find((r) => r.id === id)?.text ?? '')
        .filter(Boolean)
        .join(' | ');
    function toggleReason(id) {
        setSelectedReasons((prev) => prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]);
    }
    const pendingRequest = budgetRequests.find((r) => r.status === 'pending' && r.phase === phase);
    const lastResolved = budgetRequests
        .filter((r) => r.phase === phase && r.status !== 'pending')
        .at(-1);
    const isBudgetLow = resources.budget < BUDGET_LOW_THRESHOLD;
    const handleSubmit = () => {
        if (amount < 1 || selectedReasons.length === 0)
            return;
        requestBudget(amount, justification.trim());
        setSubmitted(true);
    };
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm", children: _jsxs("div", { className: "bg-bg-secondary border border-border-subtle rounded-[var(--radius-lg)] shadow-[var(--shadow-heavy)] w-full max-w-lg mx-4 overflow-hidden", children: [_jsxs("div", { className: "flex items-center justify-between px-6 py-4 border-b border-border-subtle", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-[15px] font-semibold text-text-primary", children: "Request Additional Budget" }), _jsxs("p", { className: "text-[12px] text-text-muted mt-0.5", children: [PHASE_NAMES[phase], " \u00B7 Board Approval Required"] })] }), _jsx("button", { onClick: onClose, className: "p-1.5 rounded-[var(--radius-md)] hover:bg-surface-hover text-text-muted hover:text-text-primary transition-colors", children: _jsx(X, { size: 16 }) })] }), _jsxs("div", { className: "p-6 space-y-5", children: [_jsxs("div", { className: `rounded-[var(--radius-md)] border p-3 ${isBudgetLow ? 'bg-red-500/10 border-red-500/30' : 'bg-accent-soft border-accent-primary/20'}`, children: [_jsxs("div", { className: "flex items-center justify-between text-[12px]", children: [_jsx("span", { className: "text-text-muted", children: "Current budget" }), _jsxs("span", { className: `font-mono font-semibold ${isBudgetLow ? 'text-red-400' : 'text-text-accent'}`, children: ["\u20AC", resources.budget, "k"] })] }), _jsxs("div", { className: "flex items-center justify-between text-[12px] mt-1", children: [_jsx("span", { className: "text-text-muted", children: "Phase base allocated" }), _jsxs("span", { className: "font-mono text-text-secondary", children: ["\u20AC", phaseBudget.phaseBase, "k"] })] }), _jsxs("div", { className: "flex items-center justify-between text-[12px] mt-1", children: [_jsx("span", { className: "text-text-muted", children: "Carried over from previous phase" }), _jsxs("span", { className: "font-mono text-text-secondary", children: ["\u20AC", phaseBudget.carryover, "k"] })] })] }), pendingRequest && (_jsxs("div", { className: "flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-[var(--radius-md)] text-[12px]", children: [_jsx(Clock, { size: 14, className: "text-yellow-400 shrink-0 mt-0.5" }), _jsxs("div", { children: [_jsx("p", { className: "text-yellow-300 font-medium", children: "Request pending board review" }), _jsxs("p", { className: "text-text-muted mt-0.5", children: ["\u20AC", pendingRequest.amount, "k requested \u00B7 Awaiting decision next week."] })] })] })), lastResolved && !pendingRequest && (_jsxs("div", { className: `flex items-start gap-2 p-3 rounded-[var(--radius-md)] border text-[12px] ${lastResolved.status === 'approved' ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`, children: [lastResolved.status === 'approved'
                                    ? _jsx(CheckCircle, { size: 14, className: "text-green-400 shrink-0 mt-0.5" })
                                    : _jsx(AlertTriangle, { size: 14, className: "text-red-400 shrink-0 mt-0.5" }), _jsxs("span", { className: lastResolved.status === 'approved' ? 'text-green-300' : 'text-red-300', children: ["Last request ", lastResolved.status === 'approved'
                                            ? `approved — €${lastResolved.approvedAmount}k added.`
                                            : 'rejected by the board.'] })] })), !pendingRequest && !submitted && (_jsxs(_Fragment, { children: [_jsxs("div", { children: [_jsxs("label", { className: "block text-[12px] font-medium text-text-secondary mb-1.5", children: ["Amount requested ", _jsx("span", { className: "text-text-muted", children: "(k\u20AC)" })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("input", { type: "range", min: 5, max: 50, step: 5, value: amount, onChange: (e) => setAmount(Number(e.target.value)), className: "flex-1 accent-[var(--color-accent-primary)]" }), _jsxs("span", { className: "font-mono font-semibold text-text-accent text-[14px] w-12 text-right", children: ["\u20AC", amount, "k"] })] })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-[12px] font-medium text-text-secondary mb-2", children: ["Reason ", _jsx("span", { className: "text-text-muted", children: "(select all that apply)" })] }), _jsx("div", { className: "grid grid-cols-2 gap-2", children: PRESET_REASONS.map((r) => (_jsx("button", { type: "button", onClick: () => toggleReason(r.id), className: `text-left px-3 py-2 rounded-[var(--radius-md)] border text-[12px] transition-all ${selectedReasons.includes(r.id)
                                                    ? 'bg-accent-soft border-accent-primary/40 text-text-accent'
                                                    : 'bg-bg-primary border-border-subtle text-text-muted hover:text-text-secondary hover:border-border-subtle/80'}`, children: r.label }, r.id))) }), selectedReasons.length > 0 && (_jsx("p", { className: "text-[11px] text-text-muted mt-2 leading-relaxed", children: justification }))] }), _jsx("button", { onClick: handleSubmit, disabled: amount < 1 || selectedReasons.length === 0, className: "w-full py-2.5 rounded-[var(--radius-md)] bg-accent-primary text-white font-medium text-[13px] hover:bg-accent-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed", children: "Submit to Board" })] })), submitted && (_jsxs("div", { className: "flex items-center gap-2 p-3 bg-accent-soft border border-accent-primary/20 rounded-[var(--radius-md)]", children: [_jsx(CheckCircle, { size: 16, className: "text-text-accent" }), _jsxs("div", { children: [_jsx("p", { className: "text-[13px] font-medium text-text-accent", children: "Request submitted" }), _jsx("p", { className: "text-[11px] text-text-muted mt-0.5", children: "The board will respond in the next week advance." })] })] }))] })] }) }));
}
//# sourceMappingURL=BudgetRequestModal.js.map