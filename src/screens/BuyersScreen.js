import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useGameStore } from '../store/gameStore';
import Panel from '../components/ui/Panel';
import StatusChip from '../components/ui/StatusChip';
import { Briefcase, Users } from 'lucide-react';
const interestVariant = {
    cold: 'muted',
    lukewarm: 'default',
    warm: 'info',
    hot: 'warning',
    on_fire: 'danger',
};
const statusVariant = {
    identified: 'muted',
    contacted: 'default',
    nda_signed: 'info',
    reviewing: 'info',
    active: 'accent',
    shortlisted: 'accent',
    bidding: 'warning',
    preferred: 'success',
    dropped: 'danger',
    excluded: 'danger',
};
export default function BuyersScreen() {
    const buyers = useGameStore((s) => s.buyers);
    const phase = useGameStore((s) => s.phase);
    return (_jsxs("div", { className: "space-y-6 max-w-[1200px]", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-display font-semibold text-text-primary", children: "Buyers" }), _jsx("p", { className: "text-[12px] text-text-muted mt-1", children: "Manage the buyer universe and track engagement" })] }), buyers.length === 0 ? (_jsx(Panel, { variant: "elevated", className: "py-16", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "w-16 h-16 rounded-full bg-surface-default border border-border-subtle flex items-center justify-center mx-auto mb-4", children: _jsx(Briefcase, { size: 28, className: "text-text-muted/30" }) }), _jsx("h2", { className: "text-lg font-display font-semibold text-text-secondary mb-2", children: "No Buyers Identified Yet" }), _jsx("p", { className: "text-[13px] text-text-muted max-w-md mx-auto", children: phase < 2
                                ? 'Buyer identification begins during the Pitch & Mandate phase. Complete origination and win the mandate first.'
                                : 'Begin buyer outreach to populate the pipeline.' })] }) })) : (_jsxs(_Fragment, { children: [_jsx("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-3", children: [
                            { label: 'Total Identified', count: buyers.length, icon: _jsx(Users, { size: 16 }) },
                            { label: 'Active / Engaged', count: buyers.filter((b) => ['active', 'shortlisted', 'bidding', 'preferred'].includes(b.status)).length },
                            { label: 'Shortlisted', count: buyers.filter((b) => b.status === 'shortlisted' || b.status === 'bidding').length },
                            { label: 'Dropped', count: buyers.filter((b) => b.status === 'dropped' || b.status === 'excluded').length },
                        ].map((item) => (_jsxs(Panel, { children: [_jsx("div", { className: "text-[10px] font-mono uppercase tracking-widest text-text-muted mb-1", children: item.label }), _jsx("div", { className: "text-xl font-mono font-semibold text-text-primary", children: item.count })] }, item.label))) }), _jsx(Panel, { title: "Buyer Pipeline", children: _jsx("div", { className: "overflow-x-auto -mx-1", children: _jsxs("table", { className: "w-full min-w-[600px]", children: [_jsx("thead", { children: _jsx("tr", { className: "border-b border-border-subtle", children: ['Name', 'Type', 'Geography', 'Interest', 'Status', 'Valuation', 'Exec. Cred.'].map((h) => (_jsx("th", { className: "text-left text-[10px] font-mono uppercase tracking-wider text-text-muted pb-2 px-2", children: h }, h))) }) }), _jsx("tbody", { children: buyers.map((buyer) => (_jsxs("tr", { className: "border-b border-border-subtle/50 hover:bg-surface-hover transition-colors cursor-pointer", children: [_jsx("td", { className: "py-2.5 px-2 text-[12px] font-medium text-text-primary", children: buyer.name }), _jsx("td", { className: "py-2.5 px-2", children: _jsx(StatusChip, { label: buyer.type.replace('_', ' ') }) }), _jsx("td", { className: "py-2.5 px-2 text-[12px] text-text-secondary", children: buyer.geography }), _jsx("td", { className: "py-2.5 px-2", children: _jsx(StatusChip, { label: buyer.interest.replace('_', ' '), variant: interestVariant[buyer.interest] }) }), _jsx("td", { className: "py-2.5 px-2", children: _jsx(StatusChip, { label: buyer.status.replace('_', ' '), variant: statusVariant[buyer.status] }) }), _jsx("td", { className: "py-2.5 px-2 text-[12px] text-text-secondary capitalize", children: buyer.valuationPosture }), _jsxs("td", { className: "py-2.5 px-2 text-[12px] font-mono text-text-muted", children: [buyer.executionCredibility, "%"] })] }, buyer.id))) })] }) }) })] }))] }));
}
//# sourceMappingURL=BuyersScreen.js.map