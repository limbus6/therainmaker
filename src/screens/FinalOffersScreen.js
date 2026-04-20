import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useGameStore } from '../store/gameStore';
import Panel from '../components/ui/Panel';
import StatusChip from '../components/ui/StatusChip';
import { Trophy, CheckCircle2, AlertTriangle, Star, TrendingUp } from 'lucide-react';
const STRUCTURE_LABELS = {
    full_cash: 'Full Cash',
    mixed: 'Mixed (Cash + Earnout)',
    earnout_heavy: 'Earnout Heavy',
};
const STRUCTURE_COLOR = {
    full_cash: 'text-state-success',
    mixed: 'text-state-warning',
    earnout_heavy: 'text-state-danger',
};
const CONDITIONALITY_LABELS = {
    clean: 'Clean',
    light_conditions: 'Light Conditions',
    heavy_conditions: 'Heavy Conditions',
};
const CONDITIONALITY_COLOR = {
    clean: 'text-state-success',
    light_conditions: 'text-state-warning',
    heavy_conditions: 'text-state-danger',
};
export default function FinalOffersScreen() {
    const phase = useGameStore((s) => s.phase);
    const finalOffers = useGameStore((s) => s.finalOffers);
    const preferredBidderId = useGameStore((s) => s.preferredBidderId);
    const buyers = useGameStore((s) => s.buyers);
    const selectPreferredBidder = useGameStore((s) => s.selectPreferredBidder);
    const getBuyer = (buyerId) => buyers.find((b) => b.id === buyerId);
    const preferredOffer = finalOffers.find((o) => o.buyerId === preferredBidderId);
    const preferredBuyer = preferredBidderId ? getBuyer(preferredBidderId) : null;
    if (phase < 7) {
        return (_jsx("div", { className: "flex items-center justify-center h-full", children: _jsxs("div", { className: "text-center", children: [_jsx(Trophy, { size: 32, className: "text-text-muted/20 mx-auto mb-3" }), _jsx("p", { className: "text-[13px] text-text-muted", children: "Final offers are collected in Phase 7 \u2014 Final Offers." }), _jsx("p", { className: "text-[11px] text-text-muted/60 mt-1", children: "Advance to Phase 7 to view and compare bids." })] }) }));
    }
    if (finalOffers.length === 0) {
        return (_jsx("div", { className: "flex items-center justify-center h-full", children: _jsxs("div", { className: "text-center", children: [_jsx(Trophy, { size: 32, className: "text-text-muted/20 mx-auto mb-3" }), _jsx("p", { className: "text-[13px] text-text-muted", children: "No final offers available." }), _jsx("p", { className: "text-[11px] text-text-muted/60 mt-1", children: "Ensure at least one buyer remains active before entering Phase 7." })] }) }));
    }
    return (_jsxs("div", { className: "space-y-6 max-w-[1200px]", children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-display font-semibold text-text-primary", children: "Final Offers" }), _jsxs("p", { className: "text-[12px] text-text-muted mt-1", children: [finalOffers.length, " binding offer", finalOffers.length !== 1 ? 's' : '', " received \u2014 compare and recommend a preferred bidder to Ricardo."] })] }), preferredBuyer && (_jsxs("div", { className: "flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-lg", children: [_jsx(CheckCircle2, { size: 14, className: "text-green-400" }), _jsxs("span", { className: "text-[12px] text-green-400 font-medium", children: ["Preferred: ", preferredBuyer.name] })] }))] }), preferredOffer && preferredBuyer && (_jsx(Panel, { variant: "elevated", className: "border-green-500/20 bg-green-500/5", children: _jsxs("div", { className: "flex items-start gap-4", children: [_jsx("div", { className: "w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0", children: _jsx(Trophy, { size: 14, className: "text-green-400" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-[12px] font-semibold text-green-400 uppercase tracking-wider mb-1", children: "Preferred Bidder Selected" }), _jsx("p", { className: "text-[14px] font-semibold text-text-primary", children: preferredBuyer.name }), _jsxs("p", { className: "text-[12px] text-text-secondary mt-0.5", children: ["Total EV: \u20AC", preferredOffer.totalEV, "M \u00B7 ", STRUCTURE_LABELS[preferredOffer.structure], " \u00B7 ", CONDITIONALITY_LABELS[preferredOffer.conditionality]] }), _jsx("p", { className: "text-[11px] text-text-muted mt-1.5 italic", children: preferredOffer.advisorNote })] })] }) })), _jsx("div", { className: "space-y-4", children: finalOffers.map((offer, idx) => {
                    const buyer = getBuyer(offer.buyerId);
                    if (!buyer)
                        return null;
                    const isPreferred = offer.buyerId === preferredBidderId;
                    const isTop = idx === 0;
                    return (_jsxs(Panel, { variant: isPreferred ? 'elevated' : 'default', className: `transition-all duration-200 ${isPreferred ? 'border-green-500/40 shadow-[0_0_16px_rgba(74,222,128,0.1)]' : ''}`, children: [_jsxs("div", { className: "flex flex-col lg:flex-row lg:items-start gap-4", children: [_jsxs("div", { className: "lg:w-48 shrink-0", children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [isTop && !isPreferred && _jsx(Star, { size: 12, className: "text-state-warning" }), isPreferred && _jsx(CheckCircle2, { size: 12, className: "text-green-400" }), _jsx("span", { className: "text-[13px] font-semibold text-text-primary truncate", children: buyer.name })] }), _jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx(StatusChip, { label: buyer.type === 'pe' ? 'PE' : buyer.type === 'strategic' ? 'Strategic' : buyer.type.replace('_', ' '), variant: buyer.type === 'strategic' ? 'info' : buyer.type === 'pe' ? 'accent' : 'default' }), _jsx("span", { className: "text-[10px] text-text-muted", children: buyer.geography })] }), offer.exclusivityRequested && (_jsxs("p", { className: "text-[10px] text-state-warning mt-1.5 flex items-center gap-1", children: [_jsx(AlertTriangle, { size: 10 }), " Exclusivity requested"] }))] }), _jsxs("div", { className: "flex-1 grid grid-cols-2 md:grid-cols-4 gap-3", children: [_jsxs("div", { children: [_jsx("p", { className: "text-[10px] font-mono uppercase tracking-wider text-text-muted mb-0.5", children: "Total EV" }), _jsxs("p", { className: "text-lg font-semibold font-mono text-text-primary", children: ["\u20AC", offer.totalEV, "M"] }), _jsxs("p", { className: "text-[10px] text-text-muted", children: [offer.impliedMultiple, "x EBITDA"] })] }), _jsxs("div", { children: [_jsx("p", { className: "text-[10px] font-mono uppercase tracking-wider text-text-muted mb-0.5", children: "Cash at Close" }), _jsxs("p", { className: "text-[15px] font-semibold font-mono text-state-success", children: ["\u20AC", offer.cashEV, "M"] }), offer.earnoutAmount > 0 && (_jsxs("p", { className: "text-[10px] text-text-muted", children: ["+\u20AC", offer.earnoutAmount, "M earnout"] }))] }), _jsxs("div", { children: [_jsx("p", { className: "text-[10px] font-mono uppercase tracking-wider text-text-muted mb-0.5", children: "Structure" }), _jsx("p", { className: `text-[12px] font-medium ${STRUCTURE_COLOR[offer.structure]}`, children: STRUCTURE_LABELS[offer.structure] }), offer.earnoutAmount > 0 && (_jsx("p", { className: "text-[10px] text-text-muted/70 mt-0.5", children: offer.earnoutConditions }))] }), _jsxs("div", { children: [_jsx("p", { className: "text-[10px] font-mono uppercase tracking-wider text-text-muted mb-0.5", children: "Conditionality" }), _jsx("p", { className: `text-[12px] font-medium ${CONDITIONALITY_COLOR[offer.conditionality]}`, children: CONDITIONALITY_LABELS[offer.conditionality] }), _jsxs("div", { className: "flex items-center gap-1 mt-0.5", children: [_jsx(TrendingUp, { size: 10, className: "text-text-muted" }), _jsxs("p", { className: "text-[10px] text-text-muted", children: ["Exec: ", buyer.executionCredibility, "/100"] })] })] })] }), _jsxs("div", { className: "lg:w-40 shrink-0 flex lg:flex-col items-center lg:items-end gap-2", children: [_jsx("button", { onClick: () => selectPreferredBidder(offer.buyerId), className: `px-4 py-2 rounded-[var(--radius-md)] text-[12px] font-semibold transition-all duration-150 ${isPreferred
                                                    ? 'bg-green-500/20 border border-green-500/40 text-green-400 cursor-default'
                                                    : 'bg-accent-soft border border-accent-primary/40 text-text-accent hover:bg-accent-primary/20 active:scale-95'}`, children: isPreferred ? '✓ Preferred' : 'Select as Preferred' }), _jsxs("p", { className: "text-[10px] text-text-muted text-right hidden lg:block", children: [buyer.chemistryWithSeller, "/100 chemistry"] })] })] }), _jsx("div", { className: "mt-3 pt-3 border-t border-border-subtle/50", children: _jsx("p", { className: "text-[11px] text-text-muted italic", children: offer.advisorNote }) })] }, offer.buyerId));
                }) }), _jsx("div", { className: "text-[11px] text-text-muted/60 text-center pb-4", children: "Recommending a preferred bidder sets them to exclusivity. The choice is final \u2014 advise Ricardo carefully." })] }));
}
//# sourceMappingURL=FinalOffersScreen.js.map