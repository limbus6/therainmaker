// ============================================
// Offer Reveal — staged, skippable Phase 7 ceremony
// ============================================

import { useEffect, useRef, useState } from 'react';
import { FastForward, MailOpen, Sparkles, Radio } from 'lucide-react';
import type { Buyer, FinalOffer } from '../types/game';
import type { FounderMood } from '../engine/founderPulse';
import { getRicardoReaction, getMarketChatter, getComparisonLine } from '../engine/offerReactions';
import { animateCounter, staggerReveal, prefersReducedMotion } from '../utils/motion';

interface OfferRevealOverlayProps {
  offers: FinalOffer[];
  buyers: Buyer[];
  founderMood: FounderMood;
  storyFlags: Record<string, string>;
  onComplete: (status: 'completed' | 'skipped', revealedBuyerIds: string[]) => void;
}

const STRUCTURE_LABELS: Record<FinalOffer['structure'], string> = {
  full_cash: 'Full cash',
  mixed: 'Cash + earnout',
  earnout_heavy: 'Earnout-heavy',
};

const CONDITIONALITY_LABELS: Record<FinalOffer['conditionality'], string> = {
  clean: 'Clean conditionality',
  light_conditions: 'Light conditions',
  heavy_conditions: 'Heavy conditions',
};

export default function OfferRevealOverlay({ offers, buyers, founderMood, storyFlags, onComplete }: OfferRevealOverlayProps) {
  const [offerIndex, setOfferIndex] = useState(0);
  const [stage, setStage] = useState(0);
  const valueRef = useRef<HTMLSpanElement>(null);
  const termsRef = useRef<HTMLDivElement>(null);
  const reactionRef = useRef<HTMLDivElement>(null);
  const offer = offers[offerIndex];
  const buyer = buyers.find((candidate) => candidate.id === offer?.buyerId);
  const isLast = offerIndex === offers.length - 1;
  const comparison = offer ? getComparisonLine(offer, offers.slice(0, offerIndex)) : null;

  useEffect(() => {
    if (stage !== 1 || !offer) return;
    const tween = animateCounter(valueRef.current, 0, offer.totalEV, 0.75, '€', 'M');
    return () => { tween?.kill(); };
  }, [offer, stage]);

  useEffect(() => {
    if (stage === 2 && termsRef.current) {
      staggerReveal(Array.from(termsRef.current.children) as HTMLElement[], 0.12, 0.3);
    }
    if (stage === 3 && reactionRef.current) {
      staggerReveal(Array.from(reactionRef.current.children) as HTMLElement[], 0.15, 0.35);
    }
  }, [stage]);

  if (!offer || !buyer) return null;

  const openEnvelope = () => {
    if (prefersReducedMotion()) {
      setStage(3);
      return;
    }
    setStage(1);
  };

  const nextStage = () => {
    if (stage < 3) {
      setStage(stage + 1);
      return;
    }
    if (isLast) {
      onComplete('completed', offers.map((item) => item.buyerId));
      return;
    }
    setOfferIndex((current) => current + 1);
    setStage(0);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-bg-primary/90 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-[var(--radius-lg)] border border-border-accent/40 bg-bg-elevated p-5 shadow-[var(--shadow-glow-strong)]">
        <div className="flex items-start justify-between gap-4 border-b border-border-subtle pb-4">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-text-accent">Binding offer {offerIndex + 1} of {offers.length}</p>
            <h2 className="mt-1 text-xl font-display font-semibold text-text-primary">A sealed offer has arrived</h2>
            <p className="mt-1 text-[12px] text-text-muted">Open each offer before comparing the field.</p>
          </div>
          <button
            onClick={() => onComplete('skipped', offers.map((item) => item.buyerId))}
            className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-border-subtle px-2.5 py-1.5 text-[11px] text-text-muted hover:bg-surface-hover"
          >
            <FastForward size={12} /> Skip ceremony
          </button>
        </div>

        <div className="min-h-[310px] py-6">
          {stage === 0 && (
            <div className="flex h-full min-h-[250px] flex-col items-center justify-center text-center">
              <div className="flex h-24 w-36 items-center justify-center rounded-md border border-border-accent/60 bg-accent-soft shadow-[var(--shadow-glow-soft)]">
                <MailOpen size={34} className="text-text-accent" />
              </div>
              <p className="mt-5 text-[13px] text-text-secondary">{buyer.name} has submitted a binding offer.</p>
              <button
                onClick={openEnvelope}
                className="mt-5 inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-accent-primary px-4 py-2 text-[12px] font-semibold text-white hover:bg-accent-hover"
              >
                <MailOpen size={14} /> Open offer
              </button>
            </div>
          )}

          {stage >= 1 && (
            <div className="text-center">
              <p className="text-[11px] font-mono uppercase tracking-widest text-text-muted">{buyer.name}</p>
              <span ref={valueRef} className="mt-3 block text-5xl font-mono font-semibold text-text-primary">€{offer.totalEV}M</span>
              <p className="mt-2 text-[12px] text-text-muted">Total enterprise value · {offer.impliedMultiple}x EBITDA</p>
              {comparison && (
                <p className={`mt-2 text-[12px] font-medium ${comparison.startsWith('New leader') ? 'text-state-success' : 'text-text-secondary'}`}>{comparison}</p>
              )}
            </div>
          )}

          {stage >= 2 && (
            <div ref={termsRef} className="mt-6 grid grid-cols-3 gap-3 border-y border-border-subtle py-4 text-left">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-wider text-text-muted">Cash at close</p>
                <p className="mt-1 text-[15px] font-mono font-semibold text-state-success">€{offer.cashEV}M</p>
              </div>
              <div>
                <p className="text-[10px] font-mono uppercase tracking-wider text-text-muted">Structure</p>
                <p className="mt-1 text-[12px] font-medium text-text-primary">{STRUCTURE_LABELS[offer.structure]}</p>
              </div>
              <div>
                <p className="text-[10px] font-mono uppercase tracking-wider text-text-muted">Conditions</p>
                <p className="mt-1 text-[12px] font-medium text-text-primary">{CONDITIONALITY_LABELS[offer.conditionality]}</p>
              </div>
            </div>
          )}

          {stage >= 3 && (
            <div ref={reactionRef} className="mt-5 space-y-3 text-left">
              <div className="rounded-[var(--radius-md)] border border-border-accent/25 bg-accent-soft/30 p-3">
                <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-text-accent"><Sparkles size={13} /> Why these terms</div>
                <ul className="mt-2 space-y-1.5 text-[12px] leading-relaxed text-text-secondary">
                  {(offer.drivers ?? []).map((driver) => <li key={driver}>• {driver}</li>)}
                </ul>
              </div>
              <p className="text-[13px] italic leading-relaxed text-text-primary">Ricardo: “{getRicardoReaction(offer, founderMood, storyFlags)}”</p>
              <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-text-muted"><Radio size={12} className="mt-0.5 shrink-0" /> {getMarketChatter(offer, buyer)}</p>
            </div>
          )}
        </div>

        {stage > 0 && (
          <div className="flex justify-end border-t border-border-subtle pt-4">
            <button onClick={nextStage} className="rounded-[var(--radius-md)] bg-accent-primary px-4 py-2 text-[12px] font-semibold text-white hover:bg-accent-hover">
              {stage < 3 ? 'Reveal next term' : isLast ? 'Compare offers' : 'Open next offer'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
