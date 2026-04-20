import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useGameStore } from '../store/gameStore';
import Panel from './ui/Panel';
import StatusChip from './ui/StatusChip';
import { Building2, LineChart, Users, Globe, Handshake, ChevronRight } from 'lucide-react';
export default function PhaseZeroDashboard() {
    const leads = useGameStore((s) => s.leads);
    const activeLeadId = useGameStore((s) => s.activeLeadId);
    const setStore = useGameStore.setState;
    if (!leads || leads.length === 0)
        return null;
    const setActiveLead = (id) => {
        setStore({ activeLeadId: id });
    };
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h2", { className: "text-lg font-display font-semibold text-text-primary", children: "Source & Qualify Leads" }), _jsx("p", { className: "text-[12px] text-text-muted", children: "Investigate dimensions to build an investment case before pitching to the Board." })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: leads.map((lead) => {
                    const isActive = activeLeadId === lead.id;
                    return (_jsxs("div", { onClick: () => setActiveLead(lead.id), className: `rounded-[var(--radius-lg)] border p-4 transition-all cursor-pointer ${isActive
                            ? 'border-accent-primary bg-surface-default shadow-[var(--shadow-glow-soft)]'
                            : 'border-border-subtle bg-bg-secondary hover:border-border-strong hover:bg-surface-default'}`, children: [_jsxs("div", { className: "flex items-start justify-between mb-3", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-[15px] font-semibold text-text-primary", children: lead.companyName }), _jsx("div", { className: "text-[11px] text-text-muted mt-1", children: lead.sector })] }), _jsx(StatusChip, { label: lead.origin, variant: "default" })] }), _jsx("div", { className: "text-[12px] text-text-secondary leading-relaxed mb-4 line-clamp-3", children: lead.description }), _jsxs("div", { className: "space-y-2", children: [_jsx("div", { className: "text-[11px] font-semibold text-text-muted uppercase tracking-widest mb-1", children: "Investigation" }), _jsxs("div", { className: "space-y-1.5", children: [_jsx(DimensionRow, { label: "Sector", icon: _jsx(Globe, { size: 13 }), status: lead.investigation.sector }), _jsx(DimensionRow, { label: "Company", icon: _jsx(Building2, { size: 13 }), status: lead.investigation.company }), _jsx(DimensionRow, { label: "Shareholder", icon: _jsx(Users, { size: 13 }), status: lead.investigation.shareholder }), _jsx(DimensionRow, { label: "Market Read", icon: _jsx(LineChart, { size: 13 }), status: lead.investigation.market })] })] }), _jsxs("div", { className: "mt-4 pt-4 border-t border-border-subtle flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-1.5 text-[12px] font-medium text-text-primary", children: [_jsx(Handshake, { size: 14, className: lead.meetingDone ? "text-green-400" : "text-text-muted" }), lead.meetingDone ? 'Meeting Complete' : 'Intro Pending'] }), _jsx(ChevronRight, { size: 14, className: isActive ? "text-accent-primary" : "text-border-strong" })] })] }, lead.id));
                }) }), activeLeadId && (_jsx(LeadActionPanel, { lead: leads.find(l => l.id === activeLeadId) }))] }));
}
function DimensionRow({ label, icon, status }) {
    return (_jsxs("div", { className: "flex items-center justify-between text-[12px]", children: [_jsxs("div", { className: "flex items-center gap-2 text-text-secondary", children: [_jsx("span", { className: "text-text-muted", children: icon }), label] }), _jsx(StatusChip, { label: status === 'completed' ? 'Done' : status === 'in_progress' ? 'Active' : 'Missing', variant: status === 'completed' ? 'success' : status === 'in_progress' ? 'accent' : 'default' })] }));
}
function LeadActionPanel({ lead }) {
    const { investigateDimension, scheduleMeeting, resources } = useGameStore();
    const handleInvestigate = (dim) => {
        investigateDimension(lead.id, dim);
    };
    const handleMeet = () => {
        scheduleMeeting(lead.id);
    };
    const budgetCost = 5;
    const canAfford = resources.budget >= budgetCost;
    return (_jsx(Panel, { title: `Active Lead Actions: ${lead.companyName}`, variant: "accent", className: "mt-6", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "bg-bg-secondary border border-border-subtle rounded-[var(--radius-md)] p-4", children: [_jsx("h4", { className: "text-[13px] font-semibold text-text-primary mb-3", children: "Conduct Research" }), _jsxs("p", { className: "text-[11px] text-text-muted mb-4", children: ["Assign team time to uncover hidden attributes. Costs \u20AC", budgetCost, "k."] }), _jsx("div", { className: "space-y-2", children: ['sector', 'company', 'shareholder', 'market'].map((dim) => {
                                const isDone = lead.investigation[dim] === 'completed';
                                return (_jsxs("button", { onClick: () => handleInvestigate(dim), disabled: isDone || !canAfford, className: `w-full flex items-center justify-between px-3 py-2 rounded border text-[12px] font-medium transition-colors ${isDone
                                        ? 'border-green-500/30 bg-green-500/5 text-green-400 cursor-not-allowed'
                                        : canAfford
                                            ? 'border-accent-primary/40 text-text-accent hover:bg-accent-primary/10'
                                            : 'border-border-subtle text-text-muted opacity-50 cursor-not-allowed'}`, children: [_jsxs("span", { className: "capitalize", children: [dim, " Deep-Dive"] }), _jsx("span", { children: isDone ? '✓' : `€${budgetCost}k` })] }, dim));
                            }) })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "bg-bg-secondary border border-border-subtle rounded-[var(--radius-md)] p-4", children: [_jsx("h4", { className: "text-[13px] font-semibold text-text-primary mb-3", children: "Founder Engagement" }), _jsx("p", { className: "text-[11px] text-text-muted mb-4", children: "Request introductory meeting to gauge motivation." }), _jsxs("button", { onClick: handleMeet, disabled: lead.meetingDone, className: `w-full flex items-center justify-center gap-2 px-3 py-2 rounded border text-[12px] font-medium transition-colors ${lead.meetingDone
                                        ? 'border-green-500/30 bg-green-500/5 text-green-400 cursor-not-allowed'
                                        : 'border-accent-primary/40 text-text-accent hover:bg-accent-primary/10'}`, children: [_jsx(Handshake, { size: 14 }), lead.meetingDone ? 'Meeting Completed' : 'Schedule Intro'] })] }), (lead.investigation.company === 'completed' || lead.meetingDone) && (_jsxs("div", { className: "bg-surface-default border border-border-subtle rounded-[var(--radius-md)] p-4", children: [_jsx("h4", { className: "text-[12px] font-semibold text-text-primary mb-2", children: "Discovered Insights" }), _jsxs("ul", { className: "space-y-2 text-[11px] text-text-secondary leading-relaxed", children: [lead.investigation.company === 'completed' && (_jsxs("li", { children: [_jsx("strong", { children: "Growth Profile:" }), " ", lead.hiddenGrowth, " potential"] })), lead.investigation.market === 'completed' && (_jsxs("li", { children: [_jsx("strong", { children: "Risk Profile:" }), " ", lead.hiddenRisk, " severity risks identified"] })), lead.meetingDone && (_jsxs("li", { children: [_jsx("strong", { children: "Vendor Motivation:" }), " \"", lead.hiddenMotivations, "\""] }))] })] }))] })] }) }));
}
//# sourceMappingURL=PhaseZeroDashboard.js.map