import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
// ============================================
// Deal Tape Animated Progression Component
// ============================================
// Displays a visual timeline ticker of turn events with staggered GSAP reveals and causal deltas.
import { useEffect, useRef } from 'react';
import { CheckCircle2, Mail, Users, AlertTriangle, ArrowRight } from 'lucide-react';
import { staggerReveal } from '../utils/motion';
export default function DealTape({ result, fromDay, toDay }) {
    const containerRef = useRef(null);
    const tapeItems = [];
    // Completed tasks
    result.tasksCompleted.forEach((t) => {
        tapeItems.push({
            id: `task-${t.id}`,
            icon: CheckCircle2,
            title: t.name,
            subtitle: 'Task Completed',
            color: 'text-state-success',
        });
    });
    // Buyer changes
    result.buyerChanges.forEach((bc) => {
        tapeItems.push({
            id: `buyer-${bc.buyerId}-${bc.field}`,
            icon: Users,
            title: bc.buyerId,
            subtitle: `${bc.field}: ${bc.from} → ${bc.to}`,
            color: 'text-text-accent',
        });
    });
    // New urgent/high emails
    result.newEmails
        .filter((e) => e.priority === 'urgent' || e.priority === 'high')
        .forEach((e) => {
        tapeItems.push({
            id: `email-${e.id}`,
            icon: Mail,
            title: e.subject,
            subtitle: `From: ${e.sender}`,
            color: 'text-state-warning',
        });
    });
    // New risks
    result.newRisks.forEach((r) => {
        tapeItems.push({
            id: `risk-${r.id}`,
            icon: AlertTriangle,
            title: r.name,
            subtitle: `Risk Flagged (${r.severity})`,
            color: 'text-state-danger',
        });
    });
    useEffect(() => {
        if (containerRef.current) {
            const children = Array.from(containerRef.current.children);
            staggerReveal(children, 0.1, 0.4);
        }
    }, [result]);
    return (_jsxs("div", { className: "rounded-[var(--radius-md)] border border-border-subtle bg-surface-default p-3 space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between text-[11px] font-mono text-text-muted border-b border-border-subtle pb-2", children: [_jsxs("span", { children: ["Day ", fromDay] }), _jsxs("div", { className: "flex items-center gap-1 text-text-accent", children: [_jsxs("span", { children: ["Advancing +", result.daysAdvanced, "d"] }), _jsx(ArrowRight, { size: 12 })] }), _jsxs("span", { children: ["Day ", toDay] })] }), tapeItems.length === 0 ? (_jsx("p", { className: "text-[12px] text-text-muted italic py-1", children: "Smooth progress \u2014 background workstreams advancing on schedule." })) : (_jsx("div", { ref: containerRef, className: "space-y-2", children: tapeItems.map((item) => {
                    const Icon = item.icon;
                    return (_jsxs("div", { className: "flex items-center gap-2.5 text-[12px]", children: [_jsx(Icon, { size: 14, className: `${item.color} shrink-0` }), _jsx("span", { className: "font-medium text-text-primary truncate", children: item.title }), _jsx("span", { className: "text-[10px] font-mono text-text-muted ml-auto shrink-0", children: item.subtitle })] }, item.id));
                }) }))] }));
}
//# sourceMappingURL=DealTape.js.map