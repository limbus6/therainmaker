import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useGameStore } from '../store/gameStore';
import { PHASE_NAMES } from '../types/game';
import Panel from '../components/ui/Panel';
import StatusChip from '../components/ui/StatusChip';
import { CheckCircle2, Lock, MapPin } from 'lucide-react';
const PHASE_WEEK_RANGES = {
    0: [1, 3], // Deal Origination — qualify the opportunity
    1: [4, 7], // Pitch & Mandate — win the engagement
    2: [8, 14], // Preparation — build materials, VDD, data room
    3: [15, 20], // Market Outreach — teaser, NDA, IM distribution
    4: [21, 24], // Shortlist — filter to serious buyers
    5: [25, 28], // Non-Binding Offers — NBOs received and analysed
    6: [29, 36], // Due Diligence — VDR, expert sessions, mgmt presentations
    7: [37, 40], // Final Offers — BAFO, SPA draft
    8: [41, 44], // SPA Negotiation — mark-ups, reps & warranties
    9: [45, 47], // Signing — contracts in agreed form
    10: [48, 52], // Closing & Execution — conditions precedent, wire
};
export default function TimelineScreen() {
    const { phase, week } = useGameStore();
    const phases = Object.keys(PHASE_NAMES).map(Number);
    return (_jsxs("div", { className: "space-y-6 max-w-[1200px]", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-display font-semibold text-text-primary", children: "Timeline" }), _jsx("p", { className: "text-[12px] text-text-muted mt-1", children: "Strategic overview of deal progression" })] }), _jsx(Panel, { variant: "elevated", children: _jsxs("div", { className: "relative", children: [_jsx("div", { className: "absolute left-6 top-0 bottom-0 w-px bg-border-subtle" }), _jsx("div", { className: "space-y-0", children: phases.map((p) => {
                                const isCurrent = p === phase;
                                const isCompleted = p < phase;
                                const isFuture = p > phase;
                                const [weekStart, weekEnd] = PHASE_WEEK_RANGES[p];
                                return (_jsxs("div", { className: `relative flex items-start gap-4 py-4 ${isCurrent ? '' : ''}`, children: [_jsx("div", { className: `relative z-10 shrink-0 w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${isCurrent
                                                ? 'bg-accent-primary/20 border-accent-primary shadow-[var(--shadow-glow-strong)]'
                                                : isCompleted
                                                    ? 'bg-state-success/20 border-state-success'
                                                    : 'bg-surface-default border-border-subtle'}`, children: isCompleted ? (_jsx(CheckCircle2, { size: 18, className: "text-state-success" })) : isCurrent ? (_jsx(MapPin, { size: 18, className: "text-accent-primary" })) : (_jsx(Lock, { size: 14, className: "text-text-muted/30" })) }), _jsxs("div", { className: `flex-1 pt-1 ${isFuture ? 'opacity-40' : ''}`, children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("span", { className: "text-[10px] font-mono uppercase tracking-widest text-text-muted", children: ["Phase ", p] }), isCurrent && _jsx(StatusChip, { label: "Current", variant: "accent" }), isCompleted && _jsx(StatusChip, { label: "Complete", variant: "success" }), isFuture && _jsx(StatusChip, { label: "Locked", variant: "muted" })] }), _jsx("h3", { className: `text-[15px] font-semibold mt-1 ${isCurrent ? 'text-text-accent' : isCompleted ? 'text-text-primary' : 'text-text-muted'}`, children: PHASE_NAMES[p] }), _jsxs("div", { className: "text-[11px] font-mono text-text-muted mt-1", children: ["Weeks ", weekStart, "\u2013", weekEnd, isCurrent && (_jsxs("span", { className: "ml-3 text-text-accent", children: ["Currently week ", week] }))] }), isCurrent && (_jsx("div", { className: "mt-3 p-3 rounded-[var(--radius-md)] bg-accent-soft/50 border border-border-accent/30", children: _jsxs("div", { className: "text-[11px] text-text-secondary", children: ["Week ", week, " of ", weekEnd, " in this phase. ", weekEnd - week, " weeks remaining before expected transition."] }) }))] })] }, p));
                            }) })] }) }), _jsx(Panel, { title: "Current Position", children: _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-3xl font-mono font-bold text-text-accent", children: week }), _jsx("div", { className: "text-[10px] font-mono uppercase tracking-widest text-text-muted", children: "Week" })] }), _jsx("div", { className: "h-8 w-px bg-border-subtle" }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-3xl font-mono font-bold text-text-primary", children: phase }), _jsx("div", { className: "text-[10px] font-mono uppercase tracking-widest text-text-muted", children: "Phase" })] }), _jsx("div", { className: "h-8 w-px bg-border-subtle" }), _jsxs("div", { children: [_jsx("div", { className: "text-[14px] font-semibold text-text-secondary", children: PHASE_NAMES[phase] }), _jsx("div", { className: "text-[11px] text-text-muted", children: "Deal process in early stages" })] })] }) })] }));
}
//# sourceMappingURL=TimelineScreen.js.map