import { useGameStore } from '../store/gameStore';
import Panel from '../components/ui/Panel';
import StatusChip from '../components/ui/StatusChip';
import { Trophy, CheckCircle2, AlertTriangle, Star, TrendingUp } from 'lucide-react';
import type { FinalOffer } from '../types/game';

const STRUCTURE_LABELS: Record<FinalOffer['structure'], string> = {
  full_cash: 'Full Cash',
  mixed: 'Mixed (Cash + Earnout)',
  earnout_heavy: 'Earnout Heavy',
};

const STRUCTURE_COLOR: Record<FinalOffer['structure'], string> = {
  full_cash: 'text-state-success',
  mixed: 'text-state-warning',
  earnout_heavy: 'text-state-danger',
};

const CONDITIONALITY_LABELS: Record<FinalOffer['conditionality'], string> = {
  clean: 'Clean',
  light_conditions: 'Light Conditions',
  heavy_conditions: 'Heavy Conditions',
};

const CONDITIONALITY_COLOR: Record<FinalOffer['conditionality'], string> = {
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

  const getBuyer = (buyerId: string) => buyers.find((b) => b.id === buyerId);
  const preferredOffer = finalOffers.find((o) => o.buyerId === preferredBidderId);
  const preferredBuyer = preferredBidderId ? getBuyer(preferredBidderId) : null;

  if (phase < 7) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Trophy size={32} className="text-text-muted/20 mx-auto mb-3" />
          <p className="text-[13px] text-text-muted">Final offers are collected in Phase 7 — Final Offers.</p>
          <p className="text-[11px] text-text-muted/60 mt-1">Advance to Phase 7 to view and compare bids.</p>
        </div>
      </div>
    );
  }

  if (finalOffers.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Trophy size={32} className="text-text-muted/20 mx-auto mb-3" />
          <p className="text-[13px] text-text-muted">No final offers available.</p>
          <p className="text-[11px] text-text-muted/60 mt-1">Ensure at least one buyer remains active before entering Phase 7.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1200px]">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-semibold text-text-primary">Final Offers</h1>
          <p className="text-[12px] text-text-muted mt-1">
            {finalOffers.length} binding offer{finalOffers.length !== 1 ? 's' : ''} received — compare and recommend a preferred bidder to Ricardo.
          </p>
        </div>
        {preferredBuyer && (
          <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-lg">
            <CheckCircle2 size={14} className="text-green-400" />
            <span className="text-[12px] text-green-400 font-medium">
              Preferred: {preferredBuyer.name}
            </span>
          </div>
        )}
      </div>

      {/* Preferred bidder summary — shown once selected */}
      {preferredOffer && preferredBuyer && (
        <Panel variant="elevated" className="border-green-500/20 bg-green-500/5">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
              <Trophy size={14} className="text-green-400" />
            </div>
            <div>
              <p className="text-[12px] font-semibold text-green-400 uppercase tracking-wider mb-1">Preferred Bidder Selected</p>
              <p className="text-[14px] font-semibold text-text-primary">{preferredBuyer.name}</p>
              <p className="text-[12px] text-text-secondary mt-0.5">
                Total EV: €{preferredOffer.totalEV}M · {STRUCTURE_LABELS[preferredOffer.structure]} · {CONDITIONALITY_LABELS[preferredOffer.conditionality]}
              </p>
              <p className="text-[11px] text-text-muted mt-1.5 italic">{preferredOffer.advisorNote}</p>
            </div>
          </div>
        </Panel>
      )}

      {/* Offer cards grid */}
      <div className="space-y-4">
        {finalOffers.map((offer, idx) => {
          const buyer = getBuyer(offer.buyerId);
          if (!buyer) return null;
          const isPreferred = offer.buyerId === preferredBidderId;
          const isTop = idx === 0;

          return (
            <Panel
              key={offer.buyerId}
              variant={isPreferred ? 'elevated' : 'default'}
              className={`transition-all duration-200 ${isPreferred ? 'border-green-500/40 shadow-[0_0_16px_rgba(74,222,128,0.1)]' : ''}`}
            >
              <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                {/* Left: Buyer identity */}
                <div className="lg:w-48 shrink-0">
                  <div className="flex items-center gap-2 mb-1">
                    {isTop && !isPreferred && <Star size={12} className="text-state-warning" />}
                    {isPreferred && <CheckCircle2 size={12} className="text-green-400" />}
                    <span className="text-[13px] font-semibold text-text-primary truncate">{buyer.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <StatusChip
                      label={buyer.type === 'pe' ? 'PE' : buyer.type === 'strategic' ? 'Strategic' : buyer.type.replace('_', ' ')}
                      variant={buyer.type === 'strategic' ? 'info' : buyer.type === 'pe' ? 'accent' : 'default'}
                    />
                    <span className="text-[10px] text-text-muted">{buyer.geography}</span>
                  </div>
                  {offer.exclusivityRequested && (
                    <p className="text-[10px] text-state-warning mt-1.5 flex items-center gap-1">
                      <AlertTriangle size={10} /> Exclusivity requested
                    </p>
                  )}
                </div>

                {/* Center: Offer metrics */}
                <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-wider text-text-muted mb-0.5">Total EV</p>
                    <p className="text-lg font-semibold font-mono text-text-primary">€{offer.totalEV}M</p>
                    <p className="text-[10px] text-text-muted">{offer.impliedMultiple}x EBITDA</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-wider text-text-muted mb-0.5">Cash at Close</p>
                    <p className="text-[15px] font-semibold font-mono text-state-success">€{offer.cashEV}M</p>
                    {offer.earnoutAmount > 0 && (
                      <p className="text-[10px] text-text-muted">+€{offer.earnoutAmount}M earnout</p>
                    )}
                  </div>
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-wider text-text-muted mb-0.5">Structure</p>
                    <p className={`text-[12px] font-medium ${STRUCTURE_COLOR[offer.structure]}`}>
                      {STRUCTURE_LABELS[offer.structure]}
                    </p>
                    {offer.earnoutAmount > 0 && (
                      <p className="text-[10px] text-text-muted/70 mt-0.5">{offer.earnoutConditions}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-wider text-text-muted mb-0.5">Conditionality</p>
                    <p className={`text-[12px] font-medium ${CONDITIONALITY_COLOR[offer.conditionality]}`}>
                      {CONDITIONALITY_LABELS[offer.conditionality]}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <TrendingUp size={10} className="text-text-muted" />
                      <p className="text-[10px] text-text-muted">Exec: {buyer.executionCredibility}/100</p>
                    </div>
                  </div>
                </div>

                {/* Right: Action */}
                <div className="lg:w-40 shrink-0 flex lg:flex-col items-center lg:items-end gap-2">
                  <button
                    onClick={() => selectPreferredBidder(offer.buyerId)}
                    className={`px-4 py-2 rounded-[var(--radius-md)] text-[12px] font-semibold transition-all duration-150 ${
                      isPreferred
                        ? 'bg-green-500/20 border border-green-500/40 text-green-400 cursor-default'
                        : 'bg-accent-soft border border-accent-primary/40 text-text-accent hover:bg-accent-primary/20 active:scale-95'
                    }`}
                  >
                    {isPreferred ? '✓ Preferred' : 'Select as Preferred'}
                  </button>
                  <p className="text-[10px] text-text-muted text-right hidden lg:block">{buyer.chemistryWithSeller}/100 chemistry</p>
                </div>
              </div>

              {/* Advisor note */}
              <div className="mt-3 pt-3 border-t border-border-subtle/50">
                <p className="text-[11px] text-text-muted italic">{offer.advisorNote}</p>
              </div>
            </Panel>
          );
        })}
      </div>

      {/* Bottom tip */}
      <div className="text-[11px] text-text-muted/60 text-center pb-4">
        Recommending a preferred bidder sets them to exclusivity. The choice is final — advise Ricardo carefully.
      </div>
    </div>
  );
}
