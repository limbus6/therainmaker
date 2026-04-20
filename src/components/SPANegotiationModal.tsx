import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import type { WarrantyScope, ComponentReaction } from '../types/game';
import { X, Shield, Lock, Percent, HandshakeIcon, ChevronRight, AlertTriangle, Lightbulb } from 'lucide-react';

interface Props { onClose: () => void; }

// ─── Config ─────────────────────────────────────────────────────────────────

const WARRANTY_SCOPE_LABELS: Record<WarrantyScope, { label: string; desc: string }> = {
  fundamental: { label: 'Fundamental',  desc: 'Broadest protection — title, capacity, no undisclosed liabilities' },
  standard:    { label: 'Standard',     desc: 'Market-standard reps and warranties package' },
  limited:     { label: 'Limited',      desc: 'Narrow scope — knowledge-qualified, heavily carved out' },
};

const PROFILE_LABELS: Record<string, string> = {
  aggressive_buyer:   'PE Acquirer — Experienced, protection-focused. Hard on cap and scope.',
  reasonable_buyer:   'Strategic Buyer — Balanced. Will compromise if rationale is clear.',
  conservative_buyer: 'Conservative Acquirer — Flexible. Less focused on legal protections.',
};

const reactionColor: Record<ComponentReaction, string> = {
  green:  'text-green-400 border-green-500/40 bg-green-500/10',
  yellow: 'text-yellow-400 border-yellow-500/40 bg-yellow-500/10',
  red:    'text-red-400 border-red-500/40 bg-red-500/10',
};
const reactionEmoji: Record<ComponentReaction, string> = { green: '🟢', yellow: '🟡', red: '🔴' };
const reactionLabel: Record<ComponentReaction, string> = { green: 'Acceptable', yellow: 'Borderline', red: 'Rejected' };

// ─── Component ──────────────────────────────────────────────────────────────

export default function SPANegotiationModal({ onClose }: Props) {
  const spaNegotiation = useGameStore((s) => s.spaNegotiation);
  const agreedSPATerms = useGameStore((s) => s.agreedSPATerms);
  const preferredBidderId = useGameStore((s) => s.preferredBidderId);
  const buyers = useGameStore((s) => s.buyers);
  const initSPANegotiation = useGameStore((s) => s.initSPANegotiation);
  const submitSPARound = useGameStore((s) => s.submitSPARound);
  const acceptSPATerms = useGameStore((s) => s.acceptSPATerms);
  const week = useGameStore((s) => s.week);

  const [warrantyScope, setWarrantyScope] = useState<WarrantyScope>('standard');
  const [warrantyCap, setWarrantyCap] = useState(20);
  const [escrowPercent, setEscrowPercent] = useState(5);
  const [specificIndemnity, setSpecificIndemnity] = useState(false);
  const [showReactions, setShowReactions] = useState(false);

  const preferredBuyer = buyers.find((b) => b.id === preferredBidderId || b.status === 'preferred');
  const maxRounds = 3;

  // Not yet initialised
  if (!spaNegotiation) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
        <div className="bg-bg-secondary border border-border-subtle rounded-[var(--radius-lg)] shadow-xl w-full max-w-lg mx-4 p-8 flex flex-col items-center gap-5 text-center">
          <div className="w-14 h-14 rounded-full bg-accent-soft border border-accent-primary/30 flex items-center justify-center">
            <HandshakeIcon size={24} className="text-text-accent" />
          </div>
          <div>
            <h2 className="text-[16px] font-bold text-text-primary">SPA Negotiation</h2>
            <p className="text-[12px] text-text-muted mt-2 max-w-sm">
              {preferredBuyer
                ? `Negotiate Sale and Purchase Agreement terms with ${preferredBuyer.name}. Agree on warranty scope, liability cap, escrow, and indemnities.`
                : 'No preferred bidder selected. Return to Final Offers and select a preferred bidder first.'}
            </p>
          </div>
          {preferredBuyer && (
            <button
              onClick={() => initSPANegotiation()}
              className="px-6 py-3 bg-accent-primary text-white rounded-[var(--radius-md)] text-[13px] font-semibold hover:bg-accent-primary/90 transition-all"
            >
              Begin SPA Negotiation
            </button>
          )}
          <button onClick={onClose} className="text-[12px] text-text-muted hover:text-text-secondary">Cancel</button>
        </div>
      </div>
    );
  }

  const { status, buyerState, rounds } = spaNegotiation;
  const latestRound = rounds.at(-1);

  const isScopeLocked     = buyerState.lockedComponents.includes('scope');
  const isCapLocked       = buyerState.lockedComponents.includes('cap');
  const isEscrowLocked    = buyerState.lockedComponents.includes('escrow');
  const isIndemnityLocked = buyerState.lockedComponents.includes('indemnity');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-bg-secondary border border-border-subtle rounded-[var(--radius-lg)] shadow-xl w-full max-w-4xl mx-4 overflow-hidden flex flex-col max-h-[92vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-border-subtle shrink-0">
          <div>
            <h2 className="text-[15px] font-semibold text-text-primary">SPA Negotiation</h2>
            <p className="text-[12px] text-text-muted mt-0.5">
              {status === 'agreed' ? '✓ SPA terms agreed' :
               status === 'failed' ? '✕ Negotiation failed' :
               `Round ${Math.min(rounds.length + (showReactions ? 0 : 1), maxRounds)} of ${maxRounds} · ${preferredBuyer?.name ?? ''}`}
            </p>
          </div>
          <div className="flex items-center gap-1.5 mr-4">
            {Array.from({ length: maxRounds }).map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full transition-all ${
                i < rounds.length
                  ? rounds[i].outcome === 'accepted' ? 'bg-green-500' : rounds[i].outcome === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'
                  : i === rounds.length ? 'bg-accent-primary' : 'bg-border-subtle'
              }`} />
            ))}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-[var(--radius-md)] hover:bg-surface-hover text-text-muted hover:text-text-primary transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* AGREED */}
        {status === 'agreed' && agreedSPATerms && (
          <div className="p-8 flex flex-col items-center text-center gap-5">
            <div className="w-16 h-16 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center">
              <HandshakeIcon size={28} className="text-green-400" />
            </div>
            <div>
              <h3 className="text-[17px] font-bold text-text-primary">SPA Terms Agreed</h3>
              <p className="text-[13px] text-text-muted mt-1">Deal locked with {preferredBuyer?.name ?? 'buyer'} · Week {week}</p>
            </div>
            <div className="bg-bg-primary border border-border-subtle rounded-[var(--radius-md)] p-5 w-full max-w-sm text-left space-y-2.5">
              <div className="flex justify-between text-[12px]">
                <span className="text-text-muted">Warranty Scope</span>
                <span className="text-text-secondary font-medium capitalize">{agreedSPATerms.warrantyScope}</span>
              </div>
              <div className="flex justify-between text-[12px]">
                <span className="text-text-muted">Warranty Cap</span>
                <span className="text-text-accent font-semibold">{agreedSPATerms.warrantyCap}% of EV</span>
              </div>
              <div className="flex justify-between text-[12px]">
                <span className="text-text-muted">Escrow</span>
                <span className="text-text-secondary">{agreedSPATerms.escrowPercent}% of EV · 18 months</span>
              </div>
              <div className="flex justify-between text-[12px]">
                <span className="text-text-muted">Specific Indemnity</span>
                <span className="text-text-secondary">{agreedSPATerms.specificIndemnity ? 'Agreed' : 'Not agreed'}</span>
              </div>
            </div>
            <button onClick={onClose} className="px-6 py-2.5 bg-accent-primary text-white rounded-[var(--radius-md)] text-[13px] font-medium hover:bg-accent-primary/90">
              Continue
            </button>
          </div>
        )}

        {/* FAILED */}
        {status === 'failed' && (
          <div className="p-8 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-2xl">✕</div>
            <div>
              <h3 className="text-[17px] font-bold text-text-primary">SPA Negotiation Broken Down</h3>
              <p className="text-[13px] text-text-muted mt-1">−10 client trust. Revise your position significantly to re-open.</p>
            </div>
            {latestRound && (
              <div className="bg-bg-primary border border-red-500/20 rounded-[var(--radius-md)] p-4 text-left max-w-md w-full">
                <p className="text-[12px] text-text-muted italic">"{latestRound.buyerNote}"</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {(['Scope', 'Cap', 'Escrow', 'Indemnity'] as const).map((label, i) => {
                    const rx = i === 0 ? latestRound.reactionScope : i === 1 ? latestRound.reactionCap : i === 2 ? latestRound.reactionEscrow : latestRound.reactionIndemnity;
                    return <span key={label} className={`text-[11px] px-2 py-1 rounded border ${reactionColor[rx as ComponentReaction]}`}>{reactionEmoji[rx as ComponentReaction]} {label}</span>;
                  })}
                </div>
              </div>
            )}
            <button onClick={() => setShowReactions(false)} className="px-6 py-2.5 bg-accent-primary text-white rounded-[var(--radius-md)] text-[13px] font-medium hover:bg-accent-primary/90">
              Return & Revise
            </button>
          </div>
        )}

        {/* IN PROGRESS */}
        {status === 'in_progress' && (
          <div className="flex flex-1 min-h-0 overflow-hidden">
            {/* Buyer profile panel */}
            <div className="w-60 shrink-0 border-r border-border-subtle p-5 space-y-4 overflow-y-auto">
              <div>
                <div className="w-10 h-10 rounded-full bg-bg-primary border border-border-subtle flex items-center justify-center text-lg mb-2">🏢</div>
                <p className="text-[13px] font-semibold text-text-primary">{preferredBuyer?.name ?? 'Buyer'}</p>
                <p className="text-[11px] text-text-muted/70 mt-1 leading-relaxed">{PROFILE_LABELS[buyerState.profile]}</p>
              </div>

              {/* Priority bars */}
              <div className="space-y-2.5">
                <p className="text-[10px] text-text-muted uppercase tracking-widest">Negotiation Priorities</p>
                {[
                  { label: 'Scope', val: buyerState.priorityScope },
                  { label: 'Cap', val: buyerState.priorityCap },
                  { label: 'Escrow', val: buyerState.priorityEscrow },
                  { label: 'Indemnity', val: buyerState.priorityIndemnity },
                ].map(({ label, val }) => {
                  const pColor = val <= 3 ? 'bg-green-500' : val <= 6 ? 'bg-yellow-500' : 'bg-red-500';
                  const pLabel = val <= 3 ? 'Low' : val <= 6 ? 'Medium' : 'High';
                  return (
                    <div key={label}>
                      <div className="flex justify-between text-[10px] mb-0.5">
                        <span className="text-text-muted">{label}</span>
                        <span className="text-text-secondary">{pLabel}</span>
                      </div>
                      <div className="h-1 bg-bg-primary rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${pColor}`} style={{ width: `${(val / 10) * 100}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Patience */}
              <div>
                <div className="flex justify-between text-[10px] mb-0.5">
                  <span className="text-text-muted">Buyer Patience</span>
                  <span className={`font-mono ${buyerState.patienceRemaining > 50 ? 'text-green-400' : buyerState.patienceRemaining > 25 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {Math.round(buyerState.patienceRemaining)}%
                  </span>
                </div>
                <div className="h-2 bg-bg-primary rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${buyerState.patienceRemaining > 50 ? 'bg-green-500' : buyerState.patienceRemaining > 25 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${buyerState.patienceRemaining}%` }} />
                </div>
              </div>

              {/* Revealed signals */}
              {buyerState.revealedHints.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] text-text-muted uppercase tracking-widest flex items-center gap-1">
                    <Lightbulb size={10} /> Signals
                  </p>
                  {buyerState.revealedHints.map((hint, i) => (
                    <div key={i} className="p-2 bg-yellow-500/5 border border-yellow-500/20 rounded-[var(--radius-sm)]">
                      <p className="text-[11px] text-yellow-300 leading-relaxed">{hint}</p>
                    </div>
                  ))}
                </div>
              )}

              {latestRound && (
                <div className="p-3 bg-bg-primary rounded-[var(--radius-md)] border border-border-subtle/50">
                  <p className="text-[11px] text-text-secondary italic leading-relaxed">"{latestRound.buyerNote}"</p>
                </div>
              )}
            </div>

            {/* Terms builder */}
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
              {/* Reaction reveal */}
              {showReactions && latestRound && (
                <div className="p-4 bg-bg-primary border border-border-subtle rounded-[var(--radius-md)] space-y-3">
                  <h3 className="text-[11px] font-semibold text-text-muted uppercase tracking-widest">Buyer Response — Round {latestRound.round}</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {(['Scope', 'Cap', 'Escrow', 'Indemnity'] as const).map((label, i) => {
                      const rx = i === 0 ? latestRound.reactionScope : i === 1 ? latestRound.reactionCap : i === 2 ? latestRound.reactionEscrow : latestRound.reactionIndemnity;
                      return (
                        <div key={label} className={`flex flex-col items-center gap-1 py-2 rounded border ${reactionColor[rx as ComponentReaction]}`}>
                          <span className="text-xl">{reactionEmoji[rx as ComponentReaction]}</span>
                          <span className="text-[10px] font-medium">{label}</span>
                          <span className="text-[10px] opacity-80">{reactionLabel[rx as ComponentReaction]}</span>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-[12px] text-text-secondary italic">"{latestRound.buyerNote}"</p>
                  {latestRound.outcome === 'counter' && (
                    <div className="flex gap-2">
                      <button onClick={() => setShowReactions(false)} className="flex-1 py-2 text-[12px] font-medium text-text-secondary border border-border-subtle rounded-[var(--radius-md)] hover:bg-surface-hover">
                        Revise & Counter
                      </button>
                      <button onClick={() => acceptSPATerms()} className="flex-1 py-2 text-[12px] font-medium text-accent-primary border border-accent-primary/40 rounded-[var(--radius-md)] hover:bg-accent-soft">
                        Accept Buyer Terms
                      </button>
                    </div>
                  )}
                </div>
              )}

              {!showReactions && (
                <>
                  {/* Warranty Scope */}
                  <div className={isScopeLocked ? 'opacity-60 pointer-events-none' : ''}>
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-text-muted uppercase tracking-widest mb-2">
                      <Shield size={11} /> Warranty Scope
                      {isScopeLocked && (
                        <span className="ml-auto flex items-center gap-1 text-green-400 normal-case text-[10px] font-normal">
                          <Lock size={10} /> Agreed — {buyerState.lockedWarrantyScope}
                        </span>
                      )}
                    </div>
                    {!isScopeLocked && (
                      <>
                        <div className="grid grid-cols-3 gap-2">
                          {(['fundamental', 'standard', 'limited'] as WarrantyScope[]).map((s) => (
                            <button key={s} onClick={() => setWarrantyScope(s)}
                              className={`p-3 text-left rounded-[var(--radius-md)] border transition-all ${warrantyScope === s ? 'border-accent-primary/40 bg-accent-soft' : 'border-border-subtle hover:bg-surface-hover'}`}>
                              <p className={`text-[12px] font-semibold mb-0.5 ${warrantyScope === s ? 'text-text-accent' : 'text-text-secondary'}`}>
                                {WARRANTY_SCOPE_LABELS[s].label}
                              </p>
                              <p className="text-[10px] text-text-muted leading-relaxed">{WARRANTY_SCOPE_LABELS[s].desc}</p>
                            </button>
                          ))}
                        </div>
                        {warrantyScope === 'limited' && buyerState.profile === 'aggressive_buyer' && (
                          <p className="text-[11px] text-state-warning mt-1.5 flex items-center gap-1">
                            <AlertTriangle size={11} /> PE buyers typically reject limited scope — expect pushback.
                          </p>
                        )}
                      </>
                    )}
                  </div>

                  {/* Warranty Cap */}
                  <div className={isCapLocked ? 'opacity-60 pointer-events-none' : ''}>
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-text-muted uppercase tracking-widest mb-2">
                      <Percent size={11} /> Warranty Cap (% of EV)
                      {isCapLocked && (
                        <span className="ml-auto flex items-center gap-1 text-green-400 normal-case text-[10px] font-normal">
                          <Lock size={10} /> Agreed — {buyerState.lockedWarrantyCap}%
                        </span>
                      )}
                    </div>
                    {!isCapLocked && (
                      <>
                        <div className="flex items-center gap-3">
                          <input type="range" min={5} max={50} step={1} value={warrantyCap}
                            onChange={(e) => setWarrantyCap(Number(e.target.value))}
                            className="flex-1 accent-[var(--color-accent-primary)]" />
                          <span className="font-mono font-bold text-[14px] text-text-accent w-16 text-right">{warrantyCap}%</span>
                        </div>
                        <div className="flex justify-between text-[9px] text-text-muted mt-1">
                          <span>5% (seller-friendly)</span>
                          <span className="text-yellow-500/70">~20% (market)</span>
                          <span>50% (buyer-friendly)</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Escrow */}
                  <div className={isEscrowLocked ? 'opacity-60 pointer-events-none' : ''}>
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-text-muted uppercase tracking-widest mb-2">
                      <Lock size={11} /> Escrow / Retention (% of EV · 18 months)
                      {isEscrowLocked && (
                        <span className="ml-auto flex items-center gap-1 text-green-400 normal-case text-[10px] font-normal">
                          <Lock size={10} /> Agreed — {buyerState.lockedEscrowPercent}%
                        </span>
                      )}
                    </div>
                    {!isEscrowLocked && (
                      <>
                        <div className="flex items-center gap-3">
                          <input type="range" min={0} max={15} step={0.5} value={escrowPercent}
                            onChange={(e) => setEscrowPercent(Number(e.target.value))}
                            className="flex-1 accent-[var(--color-accent-primary)]" />
                          <span className="font-mono font-bold text-[14px] text-text-accent w-16 text-right">{escrowPercent}%</span>
                        </div>
                        <div className="flex justify-between text-[9px] text-text-muted mt-1">
                          <span>0% (clean)</span>
                          <span className="text-yellow-500/70">5-8% (market)</span>
                          <span>15% (max)</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Specific Indemnity */}
                  <div className={isIndemnityLocked ? 'opacity-60 pointer-events-none' : ''}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-text-muted uppercase tracking-widest">
                        <Shield size={11} /> Specific Indemnity
                        {isIndemnityLocked && (
                          <span className="flex items-center gap-1 text-green-400 normal-case text-[10px] font-normal">
                            <Lock size={10} /> Agreed
                          </span>
                        )}
                      </div>
                      {!isIndemnityLocked && (
                        <label className="flex items-center gap-2 cursor-pointer">
                          <span className="text-[11px] text-text-muted">{specificIndemnity ? 'Agreed' : 'Declined'}</span>
                          <div onClick={() => setSpecificIndemnity(!specificIndemnity)}
                            className={`w-9 h-5 rounded-full transition-colors cursor-pointer relative ${specificIndemnity ? 'bg-accent-primary' : 'bg-bg-primary border border-border-subtle'}`}>
                            <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${specificIndemnity ? 'translate-x-4' : 'translate-x-0.5'}`} />
                          </div>
                        </label>
                      )}
                    </div>
                    <p className="text-[11px] text-text-muted">Buyer requests a specific indemnity for the identified tax exposure. Accepting reduces deal risk but increases post-close liability for Ricardo.</p>
                  </div>

                  {/* Summary */}
                  <div className="bg-accent-soft border border-accent-primary/20 rounded-[var(--radius-md)] p-4 space-y-1.5">
                    <p className="text-[11px] text-text-muted mb-2">Your proposal:</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[12px]">
                      <div className="flex justify-between"><span className="text-text-muted">Scope</span><span className="font-medium text-text-secondary capitalize">{warrantyScope}</span></div>
                      <div className="flex justify-between"><span className="text-text-muted">Cap</span><span className="font-mono text-text-accent">{warrantyCap}% of EV</span></div>
                      <div className="flex justify-between"><span className="text-text-muted">Escrow</span><span className="font-mono text-text-accent">{escrowPercent}%</span></div>
                      <div className="flex justify-between"><span className="text-text-muted">Indemnity</span><span className="text-text-secondary">{specificIndemnity ? 'Yes' : 'No'}</span></div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      submitSPARound({
                        playerWarrantyScope: isScopeLocked ? (buyerState.lockedWarrantyScope ?? warrantyScope) : warrantyScope,
                        playerWarrantyCap: isCapLocked ? (buyerState.lockedWarrantyCap ?? warrantyCap) : warrantyCap,
                        playerEscrowPercent: isEscrowLocked ? (buyerState.lockedEscrowPercent ?? escrowPercent) : escrowPercent,
                        playerSpecificIndemnity: specificIndemnity,
                      });
                      setShowReactions(true);
                    }}
                    className="w-full py-3 bg-accent-primary text-white font-semibold text-[14px] rounded-[var(--radius-md)] hover:bg-accent-primary/90 transition-all flex items-center justify-center gap-2"
                  >
                    Submit Proposal <ChevronRight size={16} />
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
