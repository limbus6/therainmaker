import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { X, ArrowRight, Mail, ListChecks, ShieldAlert, Gauge, Users } from 'lucide-react';
const CORE_STEPS = [
    {
        icon: Mail,
        title: 'Read the Inbox',
        body: 'Emails bring client pressure, team requests, buyer signals, and events that can change the direction of the deal.',
    },
    {
        icon: ListChecks,
        title: 'Choose Tasks',
        body: 'Tasks move workstreams, deliverables, and phase gates forward. Prioritize what unlocks progress without overloading capacity.',
    },
    {
        icon: ShieldAlert,
        title: 'Mitigate Risks',
        body: 'Ignored risks can become negative events, lost client trust, or broken deal momentum.',
    },
    {
        icon: Gauge,
        title: 'Advance Time',
        body: 'Once you have set your move, advance time. The game resolves tasks, events, buyers, and resources.',
    },
];
export default function GameInstructionsModal({ isOpen, onClose }) {
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 z-[320] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm", children: _jsxs("div", { className: "w-full max-w-3xl overflow-hidden rounded-[var(--radius-lg)] border border-border-subtle bg-bg-secondary shadow-[var(--shadow-heavy)]", children: [_jsxs("div", { className: "flex items-start justify-between gap-4 border-b border-border-subtle px-6 py-5", children: [_jsxs("div", { children: [_jsx("p", { className: "text-[10px] font-mono uppercase tracking-[0.24em] text-text-accent", children: "Game instructions" }), _jsx("h2", { className: "mt-1 font-display text-[22px] font-semibold text-text-primary", children: "How to Run the Deal" }), _jsx("p", { className: "mt-2 max-w-2xl text-[13px] leading-relaxed text-text-secondary", children: "Your goal is to close the sale of Solara Systems without losing buyers, client trust, or control of the process. The game should sit in a healthy tension band: neither an automatic checklist nor unfair chaos." })] }), _jsx("button", { type: "button", onClick: onClose, className: "rounded-[var(--radius-md)] p-1.5 text-text-muted transition-colors hover:bg-surface-hover hover:text-text-primary", children: _jsx(X, { size: 18 }) })] }), _jsx("div", { className: "grid gap-4 px-6 py-6 md:grid-cols-2", children: CORE_STEPS.map((step) => {
                        const Icon = step.icon;
                        return (_jsxs("div", { className: "rounded-[var(--radius-md)] border border-border-subtle bg-bg-primary p-4", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-text-accent", children: _jsx(Icon, { size: 16 }) }), _jsx("h3", { className: "text-[14px] font-semibold text-text-primary", children: step.title })] }), _jsx("p", { className: "mt-3 text-[12px] leading-relaxed text-text-secondary", children: step.body })] }, step.title));
                    }) }), _jsxs("div", { className: "border-t border-border-subtle bg-bg-primary/60 px-6 py-5", children: [_jsxs("div", { className: "grid gap-4 md:grid-cols-[1fr_1fr]", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2 text-[12px] font-semibold text-text-primary", children: [_jsx(Users, { size: 14, className: "text-text-accent" }), "What to Watch"] }), _jsx("p", { className: "mt-2 text-[12px] leading-relaxed text-text-secondary", children: "Keep momentum and trust high, budget and capacity under control, risk below critical levels, and enough buyers in the process to preserve competitive tension." })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2 text-[12px] font-semibold text-text-primary", children: [_jsx(ArrowRight, { size: 14, className: "text-text-accent" }), "How to Progress"] }), _jsx("p", { className: "mt-2 text-[12px] leading-relaxed text-text-secondary", children: "Each phase has a gate. Complete the core requirements, advance time to resolve consequences, and move to the next phase when the gate shows the process is ready." })] })] }), _jsx("button", { type: "button", onClick: onClose, className: "mt-5 w-full rounded-[var(--radius-md)] bg-accent-primary px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-accent-hover", children: "Back to Game" })] })] }) }));
}
//# sourceMappingURL=GameInstructionsModal.js.map