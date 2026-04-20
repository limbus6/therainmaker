import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useMemo } from 'react';
import { useGameStore } from '../store/gameStore';
import Panel from '../components/ui/Panel';
import StatusChip from '../components/ui/StatusChip';
import { Search, Mail, MailOpen, Star, ChevronRight, Reply, AlertCircle, CheckCircle2, ArrowUpDown, ArrowUpRight, } from 'lucide-react';
const CATEGORY_COLORS = {
    client: 'text-state-info',
    internal: 'text-text-secondary',
    partner: 'text-text-accent',
    buyer: 'text-state-success',
    advisor: 'text-muted-lavender',
    market: 'text-state-warning',
    system: 'text-text-muted',
};
const CATEGORY_LABELS = {
    client: 'Client',
    internal: 'Internal',
    partner: 'Partner',
    buyer: 'Buyer',
    advisor: 'Advisor',
    market: 'Market Intel',
    system: 'System',
};
const PRIORITY_RANK = { urgent: 4, high: 3, normal: 2, low: 1 };
export default function InboxScreen() {
    const { emails, markEmailRead, respondToEmail, flagEmail, escalateEmail } = useGameStore();
    const [selectedId, setSelectedId] = useState(null);
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortKey, setSortKey] = useState('newest');
    const filteredEmails = useMemo(() => {
        const filtered = emails.filter((e) => {
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                const hit = e.subject.toLowerCase().includes(q)
                    || e.sender.toLowerCase().includes(q)
                    || e.body.toLowerCase().includes(q)
                    || e.preview.toLowerCase().includes(q);
                if (!hit)
                    return false;
            }
            switch (activeTab) {
                case 'unread': return e.state === 'unread';
                case 'flagged': return !!e.flagged;
                case 'important': return e.priority === 'high' || e.priority === 'urgent';
                case 'requires_response': return e.state === 'requires_response' || (e.responseOptions && e.responseOptions.length > 0 && e.state !== 'resolved');
                default: return true;
            }
        });
        return [...filtered].sort((a, b) => {
            switch (sortKey) {
                case 'newest': return (b.day ?? b.week * 7) - (a.day ?? a.week * 7);
                case 'oldest': return (a.day ?? a.week * 7) - (b.day ?? b.week * 7);
                case 'sender': return a.sender.localeCompare(b.sender);
                case 'priority': return (PRIORITY_RANK[b.priority] ?? 2) - (PRIORITY_RANK[a.priority] ?? 2);
                case 'category': return a.category.localeCompare(b.category);
                default: return 0;
            }
        });
    }, [emails, searchQuery, activeTab, sortKey]);
    const selected = emails.find((e) => e.id === selectedId);
    function handleSelect(email) {
        setSelectedId(email.id);
        if (email.state === 'unread') {
            markEmailRead(email.id);
        }
    }
    function handleRespond(emailId, responseId) {
        respondToEmail(emailId, responseId);
    }
    const flaggedCount = emails.filter((e) => e.flagged).length;
    const tabs = [
        { key: 'all', label: 'All' },
        { key: 'unread', label: 'Unread' },
        { key: 'flagged', label: `Flagged${flaggedCount > 0 ? ` (${flaggedCount})` : ''}` },
        { key: 'important', label: 'Important' },
        { key: 'requires_response', label: 'Action Required' },
    ];
    return (_jsxs("div", { className: "h-full flex flex-col gap-4 max-w-[1200px]", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-display font-semibold text-text-primary", children: "Inbox" }), _jsxs("p", { className: "text-[12px] text-text-muted mt-1", children: [emails.filter((e) => e.state === 'unread').length, " unread messages"] })] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "flex items-center gap-0.5 bg-surface-default rounded-[var(--radius-md)] p-0.5", children: tabs.map((tab) => (_jsx("button", { onClick: () => setActiveTab(tab.key), className: `px-3 py-1.5 text-[12px] rounded-[var(--radius-sm)] transition-all duration-150 ${activeTab === tab.key
                                ? 'bg-accent-soft text-text-accent font-medium'
                                : 'text-text-muted hover:text-text-secondary'}`, children: tab.label }, tab.key))) }), _jsxs("div", { className: "relative flex-1 max-w-xs", children: [_jsx(Search, { size: 14, className: "absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" }), _jsx("input", { type: "text", placeholder: "Search messages...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "w-full pl-9 pr-3 py-1.5 text-[12px] bg-surface-default border border-border-subtle rounded-[var(--radius-md)] text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-border-accent transition-colors" })] }), _jsxs("div", { className: "flex items-center gap-1.5 shrink-0", children: [_jsx(ArrowUpDown, { size: 13, className: "text-text-muted" }), _jsxs("select", { value: sortKey, onChange: (e) => setSortKey(e.target.value), className: "text-[12px] bg-surface-default border border-border-subtle rounded-[var(--radius-md)] text-text-secondary px-2 py-1.5 focus:outline-none focus:border-border-accent transition-colors cursor-pointer", children: [_jsx("option", { value: "newest", children: "Newest" }), _jsx("option", { value: "oldest", children: "Oldest" }), _jsx("option", { value: "priority", children: "Priority" }), _jsx("option", { value: "sender", children: "Sender" }), _jsx("option", { value: "category", children: "Category" })] })] })] }), _jsxs("div", { className: "flex flex-col md:flex-row gap-4 flex-1 min-h-0", children: [_jsx("div", { className: "w-full md:w-[340px] lg:w-[380px] shrink-0 overflow-y-auto space-y-0.5", children: filteredEmails.length === 0 ? (_jsxs("div", { className: "text-center py-12", children: [_jsx(Mail, { size: 24, className: "text-text-muted/30 mx-auto mb-2" }), _jsx("p", { className: "text-[12px] text-text-muted", children: "No messages match your filter." })] })) : (filteredEmails.map((email) => (_jsx("button", { onClick: () => handleSelect(email), className: `w-full text-left p-3 rounded-[var(--radius-md)] border transition-all duration-150 ${selectedId === email.id
                                ? 'bg-accent-soft border-border-accent shadow-[var(--shadow-glow-soft)]'
                                : email.state === 'unread'
                                    ? 'bg-surface-active border-transparent hover:bg-surface-hover hover:border-border-subtle'
                                    : 'bg-surface-default border-transparent hover:bg-surface-hover hover:border-border-subtle'}`, children: _jsxs("div", { className: "flex items-start gap-2.5", children: [_jsx("div", { className: "mt-1 shrink-0", children: email.state === 'unread' ? (_jsx("span", { className: "block w-3 h-3 rounded-full bg-accent-primary" })) : email.state === 'resolved' ? (_jsx(CheckCircle2, { size: 14, className: "text-state-success" })) : (_jsx("span", { className: "block w-3 h-3" })) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center justify-between gap-2", children: [_jsx("span", { className: `text-[12px] truncate ${email.state === 'unread' ? 'font-semibold text-text-primary' : 'text-text-secondary'}`, children: email.sender }), _jsx("span", { className: "text-[10px] font-mono text-text-muted shrink-0", children: email.timestamp })] }), _jsxs("div", { className: "flex items-center gap-1.5 mt-0.5", children: [_jsx("span", { className: `text-[10px] font-mono uppercase ${CATEGORY_COLORS[email.category]}`, children: CATEGORY_LABELS[email.category] }), email.priority === 'urgent' && _jsx(AlertCircle, { size: 10, className: "text-state-danger" }), email.priority === 'high' && _jsx(Star, { size: 10, className: "text-state-warning" }), email.flagged && _jsx(Star, { size: 10, className: "text-text-accent fill-text-accent" }), email.escalated && _jsx(ArrowUpRight, { size: 10, className: "text-muted-lavender" })] }), _jsx("div", { className: `text-[12px] mt-1 truncate ${email.state === 'unread' ? 'font-medium text-text-primary' : 'text-text-secondary'}`, children: email.subject }), _jsx("div", { className: "text-[11px] text-text-muted truncate mt-0.5", children: email.preview })] }), _jsx(ChevronRight, { size: 14, className: "text-text-muted/30 shrink-0 mt-1" })] }) }, email.id)))) }), _jsx("div", { className: "flex-1 min-w-0", children: selected ? (_jsxs(Panel, { variant: "elevated", className: "h-full flex flex-col", children: [_jsxs("div", { className: "border-b border-border-subtle pb-4 mb-4", children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-lg font-semibold text-text-primary", children: selected.subject }), _jsxs("div", { className: "flex items-center gap-2 mt-1.5", children: [_jsx("span", { className: "text-[12px] text-text-secondary font-medium", children: selected.sender }), selected.senderRole && (_jsxs("span", { className: "text-[11px] text-text-muted", children: ["\u2014 ", selected.senderRole] }))] })] }), _jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx(StatusChip, { label: CATEGORY_LABELS[selected.category], variant: selected.category === 'client' ? 'info' : selected.category === 'partner' ? 'accent' : 'default' }), selected.priority === 'high' && _jsx(StatusChip, { label: "Important", variant: "warning" }), selected.priority === 'urgent' && _jsx(StatusChip, { label: "Urgent", variant: "danger" })] })] }), _jsx("div", { className: "text-[10px] font-mono text-text-muted mt-2", children: selected.timestamp })] }), _jsx("div", { className: "flex-1 overflow-y-auto", children: _jsx("div", { className: "text-[13px] text-text-secondary leading-relaxed whitespace-pre-wrap", children: selected.body }) }), selected.responseOptions && selected.responseOptions.length > 0 && selected.state !== 'resolved' && (_jsxs("div", { className: "border-t border-border-subtle pt-4 mt-4", children: [_jsx("div", { className: "text-[11px] font-mono uppercase tracking-wider text-text-muted mb-2", children: "Response Options" }), _jsx("div", { className: "space-y-2", children: selected.responseOptions.map((opt) => (_jsxs("button", { onClick: () => handleRespond(selected.id, opt.id), className: "w-full flex items-center justify-between p-3 rounded-[var(--radius-md)] border border-border-subtle bg-surface-default hover:bg-surface-hover hover:border-border-accent transition-all duration-150 group", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Reply, { size: 14, className: "text-text-muted group-hover:text-text-accent" }), _jsx("span", { className: "text-[12px] text-text-primary", children: opt.label })] }), opt.effects && (_jsx("span", { className: "text-[10px] font-mono text-text-muted", children: opt.effects }))] }, opt.id))) })] })), selected.state === 'resolved' && (_jsx("div", { className: "border-t border-border-subtle pt-4 mt-4", children: _jsxs("div", { className: "flex items-center gap-2 text-state-success", children: [_jsx(CheckCircle2, { size: 14 }), _jsx("span", { className: "text-[12px] font-medium", children: "Responded" })] }) })), _jsxs("div", { className: "flex items-center gap-2 mt-4 pt-3 border-t border-border-subtle", children: [_jsxs("button", { onClick: () => selected && escalateEmail(selected.id), disabled: selected?.escalated, title: selected?.escalated ? 'Already escalated to Marcus' : 'Send to Marcus Aldridge for strategic advice (costs €2k)', className: `flex items-center gap-1.5 px-3 py-1.5 text-[11px] rounded-[var(--radius-md)] transition-colors ${selected?.escalated
                                                ? 'text-muted-lavender bg-surface-default cursor-default opacity-60'
                                                : 'text-text-muted hover:text-text-primary bg-surface-default hover:bg-surface-hover'}`, children: [_jsx(ArrowUpRight, { size: 12 }), selected?.escalated ? 'Escalated' : 'Escalate to Marcus'] }), _jsxs("button", { onClick: () => selected && flagEmail(selected.id), title: selected?.flagged ? 'Remove flag' : 'Flag for follow-up', className: `flex items-center gap-1.5 px-3 py-1.5 text-[11px] rounded-[var(--radius-md)] transition-colors ${selected?.flagged
                                                ? 'text-text-accent bg-accent-soft hover:bg-accent-soft/70'
                                                : 'text-text-muted hover:text-text-primary bg-surface-default hover:bg-surface-hover'}`, children: [_jsx(Star, { size: 12, className: selected?.flagged ? 'fill-text-accent' : '' }), selected?.flagged ? 'Flagged' : 'Flag'] })] })] })) : (_jsx("div", { className: "h-full flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx(MailOpen, { size: 32, className: "text-text-muted/20 mx-auto mb-3" }), _jsx("p", { className: "text-[13px] text-text-muted", children: "Select a message to read" })] }) })) })] })] }));
}
//# sourceMappingURL=InboxScreen.js.map