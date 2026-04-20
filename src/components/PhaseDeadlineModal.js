import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { Calendar, Clock, AlertTriangle } from 'lucide-react';
const PHASE_COPY = {
    3: {
        title: 'Set Shortlist Deadline',
        description: 'Buyers need time to review the teaser, sign NDAs, and qualify their interest. When do you want to close outreach and move to shortlist?',
        action: 'Close Market Outreach & Begin Shortlist',
    },
    4: {
        title: 'Set NBO Deadline',
        description: 'Shortlisted buyers must submit their Non-Binding Offers by this date. After the deadline, no further offers will be accepted.',
        action: 'Set NBO Deadline & Open Bidding',
    },
    6: {
        title: 'Issue Process Letter',
        description: 'The Process Letter sets the deadline for buyers to complete due diligence, mark up the SPA, and submit a binding offer. Buyers who miss this deadline will be excluded from the process.',
        action: 'Issue Process Letter & Set Binding Offer Deadline',
    },
};
const ADVISORY = {
    3: (w) => w <= 1
        ? 'Very tight. Buyers may not have enough time to mobilise. Risk of low participation.'
        : w === 2 ? 'Standard market timeline. Balances speed and buyer preparation.'
            : w === 3 ? 'Comfortable timeline. Maximises buyer participation but delays momentum.'
                : 'Extended window. Reduces urgency and may signal desperation to the market.',
    4: (w) => w <= 1
        ? 'Very tight. Buyers may not have enough time to compile NBOs. Risk of low quality bids.'
        : w === 2 ? 'Standard NBO window. Allows adequate buyer preparation.'
            : w === 3 ? 'Generous timeline. Buyers well-prepared but deal momentum may suffer.'
                : 'Extended window. Signals process weakness. May attract opportunistic lowball offers.',
    6: (w) => w <= 1
        ? 'Very tight. Buyers may not have enough time to complete DD and mark up the SPA. High dropout risk.'
        : w === 2 ? 'Standard binding offer window. Tests buyer seriousness and creates urgency.'
            : w === 3 ? 'Comfortable timeline. Reduces dropout risk but extends process. Client may lose patience.'
                : 'Extended window. Buyers may drift. High risk of re-trading or material changes before signing.',
};
const WEEKS = [1, 2, 3, 4];
export default function PhaseDeadlineModal({ phase }) {
    const { setPhaseDeadline, week } = useGameStore();
    const [selected, setSelected] = useState(phase === 6 ? 3 : 2);
    const copy = PHASE_COPY[phase];
    const advisory = ADVISORY[phase](selected);
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm", children: _jsxs("div", { className: "bg-bg-panel border border-border-default rounded-xl shadow-2xl w-full max-w-md mx-4 p-6 space-y-5", children: [_jsxs("div", { className: "flex items-start gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-lg bg-accent-soft flex items-center justify-center shrink-0", children: _jsx(Calendar, { size: 18, className: "text-text-accent" }) }), _jsxs("div", { children: [_jsx("h2", { className: "text-[16px] font-display font-semibold text-text-primary", children: copy.title }), _jsx("p", { className: "text-[12px] text-text-muted mt-1 leading-relaxed", children: copy.description })] })] }), phase === 6 && (_jsxs("div", { className: "flex items-start gap-2 p-3 rounded-lg bg-red-500/5 border border-red-500/20", children: [_jsx(AlertTriangle, { size: 13, className: "text-red-400 mt-0.5 shrink-0" }), _jsx("p", { className: "text-[11px] text-red-300 leading-relaxed", children: "Buyers who cannot complete DD or mark up the SPA in time will be excluded. Ensure the dataroom is well-stocked and all Q&A has been addressed before issuing." })] })), _jsxs("div", { children: [_jsxs("p", { className: "text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-3", children: ["Duration from Week ", week] }), _jsx("div", { className: "grid grid-cols-4 gap-2", children: WEEKS.map((w) => (_jsxs("button", { onClick: () => setSelected(w), className: `flex flex-col items-center justify-center p-3 rounded-lg border text-center transition-all ${selected === w
                                    ? 'bg-accent-soft border-border-accent text-text-accent'
                                    : 'bg-surface-default border-border-subtle text-text-secondary hover:border-border-default'}`, children: [_jsx("span", { className: "text-[18px] font-bold", children: w }), _jsx("span", { className: "text-[10px] font-mono mt-0.5", children: w === 1 ? 'week' : 'weeks' }), _jsxs("span", { className: "text-[10px] text-text-muted mt-1", children: ["Wk ", week + w] })] }, w))) })] }), _jsxs("div", { className: "flex items-start gap-2 p-3 rounded-lg bg-surface-default border border-border-subtle", children: [_jsx(Clock, { size: 13, className: "text-text-muted mt-0.5 shrink-0" }), _jsx("p", { className: "text-[11px] text-text-muted leading-relaxed", children: advisory })] }), _jsx("button", { onClick: () => setPhaseDeadline(selected), className: "w-full py-2.5 bg-accent-primary hover:bg-accent-hover text-white text-[13px] font-semibold rounded-lg transition-colors shadow-sm", children: copy.action })] }) }));
}
//# sourceMappingURL=PhaseDeadlineModal.js.map