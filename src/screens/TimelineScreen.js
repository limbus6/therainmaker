import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useGameStore } from '../store/gameStore';
import { PHASE_NAMES } from '../types/game';
import Panel from '../components/ui/Panel';
import StatusChip from '../components/ui/StatusChip';
import { CheckCircle2, Lock, MapPin } from 'lucide-react';
export default function TimelineScreen() {
    const phase = useGameStore((s) => s.phase);
    const day = useGameStore((s) => s.day);
    const phaseEntryDay = useGameStore((s) => s.phaseEntryDay) || {};
    const currentWeek = Math.ceil(day / 7);
    const phases = Object.keys(PHASE_NAMES).map(Number);
    return (_jsxs("div", { className: "space-y-6 max-w-[1200px]", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-display font-semibold text-text-primary", children: "Timeline" }), _jsx("p", { className: "text-[12px] text-text-muted mt-1", children: "Strategic overview of deal progression" })] }), _jsx(Panel, { variant: "elevated", children: _jsxs("div", { className: "relative", children: [_jsx("div", { className: "absolute left-6 top-0 bottom-0 w-px bg-border-subtle" }), _jsx("div", { className: "space-y-0", children: phases.map((p) => {
                                const isCurrent = p === phase;
                                const isCompleted = p < phase;
                                const isFuture = p > phase;
                                const startDay = phaseEntryDay[p];
                                const nextPhaseStartDay = phaseEntryDay[(p + 1)];
                                const hasStarted = startDay !== undefined;
                                const startWeek = hasStarted ? Math.ceil(startDay / 7) : null;
                                let durationDays = 0;
                                if (isCompleted && hasStarted && nextPhaseStartDay !== undefined) {
                                    durationDays = nextPhaseStartDay - startDay;
                                }
                                else if (isCurrent && hasStarted) {
                                    durationDays = day - startDay;
                                }
                                return (_jsxs("div", { className: `relative flex items-start gap-4 py-4 ${isCurrent ? '' : ''}`, children: [_jsx("div", { className: `relative z-10 shrink-0 w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${isCurrent
                                                ? 'bg-accent-primary/20 border-accent-primary shadow-[var(--shadow-glow-strong)]'
                                                : isCompleted
                                                    ? 'bg-state-success/20 border-state-success'
                                                    : 'bg-surface-default border-border-subtle'}`, children: isCompleted ? (_jsx(CheckCircle2, { size: 18, className: "text-state-success" })) : isCurrent ? (_jsx(MapPin, { size: 18, className: "text-accent-primary" })) : (_jsx(Lock, { size: 14, className: "text-text-muted/30" })) }), _jsxs("div", { className: `flex-1 pt-1 ${isFuture ? 'opacity-40' : ''}`, children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("span", { className: "text-[10px] font-mono uppercase tracking-widest text-text-muted", children: ["Phase ", p] }), isCurrent && _jsx(StatusChip, { label: "Current", variant: "accent" }), isCompleted && _jsx(StatusChip, { label: "Complete", variant: "success" }), isFuture && _jsx(StatusChip, { label: "Locked", variant: "muted" })] }), _jsx("h3", { className: `text-[15px] font-semibold mt-1 ${isCurrent ? 'text-text-accent' : isCompleted ? 'text-text-primary' : 'text-text-muted'}`, children: PHASE_NAMES[p] }), _jsx("div", { className: "text-[11px] font-mono text-text-muted mt-1", children: hasStarted ? (_jsxs(_Fragment, { children: ["Started Day ", startDay, " (Week ", startWeek, ")", _jsxs("span", { className: "ml-3 text-text-muted/70", children: ["Duration: ", durationDays, " days"] })] })) : (_jsx("span", { className: "italic text-text-muted/50", children: "upcoming" })) }), isCurrent && hasStarted && (_jsx("div", { className: "mt-3 p-3 rounded-[var(--radius-md)] bg-accent-soft/50 border border-border-accent/30", children: _jsxs("div", { className: "text-[11px] text-text-secondary", children: ["Currently week ", currentWeek, " (Day ", day, "). You have spent ", durationDays, " days in this phase."] }) }))] })] }, p));
                            }) })] }) }), _jsx(Panel, { title: "Current Position", children: _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-3xl font-mono font-bold text-text-accent", children: currentWeek }), _jsx("div", { className: "text-[10px] font-mono uppercase tracking-widest text-text-muted", children: "Week" })] }), _jsx("div", { className: "h-8 w-px bg-border-subtle" }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-3xl font-mono font-bold text-text-primary", children: phase }), _jsx("div", { className: "text-[10px] font-mono uppercase tracking-widest text-text-muted", children: "Phase" })] }), _jsx("div", { className: "h-8 w-px bg-border-subtle" }), _jsxs("div", { children: [_jsx("div", { className: "text-[14px] font-semibold text-text-secondary", children: PHASE_NAMES[phase] }), _jsx("div", { className: "text-[11px] text-text-muted", children: "Deal process in early stages" })] })] }) })] }));
}
//# sourceMappingURL=TimelineScreen.js.map