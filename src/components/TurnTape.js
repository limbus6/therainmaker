import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
// ============================================
// Turn Tape — Non-blocking Live Turn Strip
// ============================================
// Persistent dashboard strip that plays each advance in place: animated day
// ticker, staggered tape items, and attributable resource delta chips.
// Replaces the blocking Situation Report modal for routine turns.
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { CheckCircle2, Mail, Users, AlertTriangle, Zap, FileText, FastForward } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { animateCounter, staggerReveal, prefersReducedMotion } from '../utils/motion';
const RESOURCE_LABELS = {
    budget: 'Budget',
    teamCapacity: 'Capacity',
    dealMomentum: 'Momentum',
    clientTrust: 'Trust',
    morale: 'Morale',
    riskLevel: 'Risk',
    reputation: 'Reputation',
};
const MAX_VISIBLE_ITEMS = 6;
function buildTapeItems(result) {
    const items = [];
    result.tasksCompleted.forEach((t) => {
        items.push({ id: `task-${t.id}`, icon: CheckCircle2, title: t.name, subtitle: 'Completed', color: 'text-state-success' });
    });
    result.newEvents.forEach((evt) => {
        items.push({ id: `event-${evt.id}`, icon: Zap, title: evt.title, subtitle: 'Event', color: 'text-text-accent' });
    });
    result.buyerChanges.forEach((bc) => {
        items.push({
            id: `buyer-${bc.buyerId}-${bc.field}`,
            icon: Users,
            title: bc.buyerId,
            subtitle: `${bc.from} → ${bc.to}`,
            color: 'text-text-accent',
        });
    });
    result.newEmails
        .filter((e) => e.priority === 'urgent' || e.priority === 'high')
        .forEach((e) => {
        items.push({ id: `email-${e.id}`, icon: Mail, title: e.subject, subtitle: e.sender, color: 'text-state-warning' });
    });
    result.newRisks.forEach((r) => {
        items.push({ id: `risk-${r.id}`, icon: AlertTriangle, title: r.name, subtitle: `Risk (${r.severity})`, color: 'text-state-danger' });
    });
    return items;
}
export default function TurnTape() {
    const playback = useGameStore((s) => s.turnPlayback);
    const result = useGameStore((s) => s.lastWeekResult);
    const deltas = useGameStore((s) => s.lastResourceDeltas);
    const completeTurnPlayback = useGameStore((s) => s.completeTurnPlayback);
    const openWeekReport = useGameStore((s) => s.openWeekReport);
    const dayRef = useRef(null);
    const listRef = useRef(null);
    const chipsRef = useRef(null);
    const playing = playback?.status === 'playing';
    const items = result ? buildTapeItems(result) : [];
    const visibleItems = items.slice(0, MAX_VISIBLE_ITEMS);
    const hiddenCount = items.length - visibleItems.length;
    // Play the turn sequence in place, then release input.
    useEffect(() => {
        if (!playback || playback.status !== 'playing')
            return;
        if (prefersReducedMotion()) {
            completeTurnPlayback();
            return;
        }
        const tweens = [];
        tweens.push(animateCounter(dayRef.current, playback.fromDay, playback.toDay, 0.9, 'Day '));
        if (listRef.current) {
            tweens.push(staggerReveal(Array.from(listRef.current.children), 0.12, 0.35));
        }
        if (chipsRef.current) {
            tweens.push(staggerReveal(Array.from(chipsRef.current.children), 0.08, 0.3));
        }
        const totalMs = Math.min(2500, 1000 + visibleItems.length * 140 + deltas.length * 90);
        const timer = setTimeout(completeTurnPlayback, totalMs);
        return () => {
            clearTimeout(timer);
            tweens.forEach((tw) => tw?.kill());
        };
    }, [playback?.status, playback?.toDay]);
    // Snap everything to its final state once playback ends (including skips).
    useEffect(() => {
        if (playback?.status !== 'done')
            return;
        if (dayRef.current)
            dayRef.current.textContent = `Day ${playback.toDay}`;
        if (listRef.current)
            gsap.set(listRef.current.children, { opacity: 1, y: 0, clearProps: 'transform' });
        if (chipsRef.current)
            gsap.set(chipsRef.current.children, { opacity: 1, y: 0, clearProps: 'transform' });
    }, [playback?.status, playback?.toDay]);
    if (!playback || !result)
        return null;
    return (_jsxs("div", { className: "rounded-[var(--radius-lg)] border border-border-subtle bg-bg-secondary p-4 min-h-[76px]", children: [_jsxs("div", { className: "flex items-center justify-between gap-3 pb-2 border-b border-border-subtle", children: [_jsxs("div", { className: "flex items-baseline gap-3", children: [_jsxs("span", { ref: dayRef, className: "text-[15px] font-mono font-semibold text-text-primary", children: ["Day ", playing ? playback.fromDay : playback.toDay] }), _jsxs("span", { className: "text-[10px] font-mono uppercase tracking-widest text-text-muted", children: ["Deal Tape \u00B7 +", result.daysAdvanced, "d"] })] }), _jsx("div", { className: "flex items-center gap-2", children: playing ? (_jsxs("button", { onClick: completeTurnPlayback, className: "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius-sm)] border border-border-subtle text-[11px] text-text-secondary hover:bg-surface-hover transition-colors", children: [_jsx(FastForward, { size: 12 }), " Skip"] })) : (_jsxs("button", { onClick: openWeekReport, className: "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius-sm)] border border-border-accent bg-border-accent/10 text-[11px] font-medium text-text-accent hover:bg-border-accent/20 transition-colors", children: [_jsx(FileText, { size: 12 }), " Situation Report"] })) })] }), deltas.length > 0 && (_jsx("div", { ref: chipsRef, className: "flex flex-wrap items-center gap-2 pt-2.5", children: deltas.map((d) => (_jsxs("span", { title: d.reason, className: `inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-mono cursor-default ${(d.resource === 'riskLevel' ? d.delta < 0 : d.delta > 0)
                        ? 'border-state-success/30 bg-state-success/10 text-state-success'
                        : 'border-state-danger/30 bg-state-danger/10 text-state-danger'}`, children: [RESOURCE_LABELS[d.resource] ?? d.resource, " ", d.delta > 0 ? `+${d.delta}` : d.delta] }, d.resource))) })), visibleItems.length === 0 ? (_jsx("p", { className: "text-[12px] text-text-muted italic pt-2.5", children: "Smooth progress \u2014 background workstreams advancing on schedule." })) : (_jsxs("div", { ref: listRef, className: "space-y-1.5 pt-2.5", children: [visibleItems.map((item) => {
                        const Icon = item.icon;
                        return (_jsxs("div", { className: "flex items-center gap-2.5 text-[12px]", children: [_jsx(Icon, { size: 14, className: `${item.color} shrink-0` }), _jsx("span", { className: "font-medium text-text-primary truncate", children: item.title }), _jsx("span", { className: "text-[10px] font-mono text-text-muted ml-auto shrink-0", children: item.subtitle })] }, item.id));
                    }), hiddenCount > 0 && (_jsxs("button", { onClick: openWeekReport, className: "text-[11px] text-text-accent hover:underline", children: ["+", hiddenCount, " more in the Situation Report"] }))] }))] }));
}
//# sourceMappingURL=TurnTape.js.map