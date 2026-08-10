import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// ============================================
// Desk Decision Card
// ============================================
// Surfaces the top urgent decision directly on the Dashboard so the player
// can respond in place instead of navigating to the Inbox. Reuses the
// inline-panel pattern established by CompetitorMitigationPanel.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertOctagon, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
export default function DeskDecisionCard() {
    const emails = useGameStore((s) => s.emails);
    const phase = useGameStore((s) => s.phase);
    const respondToEmail = useGameStore((s) => s.respondToEmail);
    const markEmailRead = useGameStore((s) => s.markEmailRead);
    const addToast = useGameStore((s) => s.addToast);
    const [expanded, setExpanded] = useState(false);
    const urgentEmails = emails.filter((e) => e.phase === phase && e.state === 'unread' && e.priority === 'urgent');
    const email = urgentEmails[0];
    if (!email)
        return null;
    const hasOptions = (email.responseOptions?.length ?? 0) > 0;
    const moreCount = urgentEmails.length - 1;
    const handleRespond = (optionId) => {
        const option = email.responseOptions?.find((o) => o.id === optionId);
        respondToEmail(email.id, optionId);
        addToast(`Responded to ${email.sender}${option?.effects ? ` — ${option.effects}` : ''}`, 'success');
    };
    const handleAcknowledge = () => {
        markEmailRead(email.id);
        addToast(`Noted: ${email.subject}`, 'info');
    };
    return (_jsx("div", { className: "rounded-[var(--radius-lg)] border border-state-danger/30 bg-state-danger/5 p-4", children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx("div", { className: "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-state-danger/15 text-state-danger", children: _jsx(AlertOctagon, { size: 15 }) }), _jsxs("div", { className: "min-w-0 flex-1", children: [_jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [_jsx("span", { className: "text-[10px] font-mono uppercase tracking-widest text-state-danger", children: "Decision Required" }), _jsxs("span", { className: "text-[11px] font-mono text-text-muted", children: [email.sender, email.senderRole ? ` · ${email.senderRole}` : ''] }), moreCount > 0 && (_jsxs(Link, { to: "/inbox", className: "ml-auto text-[11px] text-text-accent hover:underline shrink-0", children: ["+", moreCount, " more urgent in Inbox"] }))] }), _jsx("h3", { className: "text-[14px] font-semibold text-text-primary mt-1", children: email.subject }), _jsx("p", { className: `text-[12px] text-text-secondary leading-relaxed mt-1 whitespace-pre-line ${expanded ? '' : 'line-clamp-3'}`, children: email.body }), _jsx("button", { onClick: () => setExpanded(!expanded), className: "inline-flex items-center gap-1 mt-1 text-[11px] text-text-accent hover:underline", children: expanded ? _jsxs(_Fragment, { children: ["Collapse ", _jsx(ChevronUp, { size: 12 })] }) : _jsxs(_Fragment, { children: ["Read full message ", _jsx(ChevronDown, { size: 12 })] }) }), _jsx("div", { className: "flex flex-wrap gap-2 mt-3", children: hasOptions ? (email.responseOptions.map((option) => (_jsxs("button", { onClick: () => handleRespond(option.id), className: "flex flex-col items-start gap-0.5 px-3 py-2 rounded-[var(--radius-md)] border border-border-accent bg-border-accent/10 hover:bg-border-accent/20 transition-colors text-left max-w-full", children: [_jsx("span", { className: "text-[12px] font-medium text-text-accent", children: option.label }), option.effects && (_jsx("span", { className: "text-[10px] font-mono text-text-muted", children: option.effects }))] }, option.id)))) : (_jsxs(_Fragment, { children: [_jsxs("button", { onClick: handleAcknowledge, className: "inline-flex items-center gap-1.5 px-3 py-2 rounded-[var(--radius-md)] border border-border-subtle text-[12px] text-text-secondary hover:bg-surface-hover transition-colors", children: [_jsx(Check, { size: 13 }), " Acknowledge"] }), _jsx(Link, { to: "/inbox", className: "inline-flex items-center px-3 py-2 rounded-[var(--radius-md)] border border-border-accent bg-border-accent/10 text-[12px] font-medium text-text-accent hover:bg-border-accent/20 transition-colors", children: "Review in Inbox" })] })) })] })] }) }));
}
//# sourceMappingURL=DeskDecisionCard.js.map