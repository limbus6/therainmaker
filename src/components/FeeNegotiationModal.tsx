import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import type { RetainerType, ComponentReaction } from '../types/game';
import { X, TrendingUp, Shield, BarChart2, ChevronRight, HandshakeIcon, Lock, Lightbulb } from 'lucide-react';

interface Props {
  onClose: () => void;
}

const RETAINER_LABELS: Record<RetainerType, string> = {
  none: 'No Retainer',
  monthly: 'Monthly (€2k–€10k/month)',
  per_phase: 'Per Phase (€5k–€10k/phase)',
  upfront: 'Upfront (€20k–€40k at signing)',
};

const RETAINER_RANGES: Record<RetainerType, { min: number; max: number; step: number }> = {
  none: { min: 0, max: 0, step: 1 },
  monthly: { min: 2, max: 10, step: 1 },
  per_phase: { min: 5, max: 10, step: 1 },
  upfront: { min: 20, max: 40, step: 5 },
};

const reactionColor: Record<ComponentReaction, string> = {
  green: 'text-green-400 border-green-500/40 bg-green-500/10',
  yellow: 'text-yellow-400 border-yellow-500/40 bg-yellow-500/10',
  red: 'text-red-400 border-red-500/40 bg-red-500/10',
};

const reactionEmoji: Record<ComponentReaction, string> = {
  green: '🟢',
  yellow: '🟡',
  red: '🔴',
};

const reactionLabel: Record<ComponentReaction, string> = {
  green: 'Acceptable',
  yellow: 'Borderline',
  red: 'Rejected',
};

const profileDescriptions: Record<string, string> = {
  serious_reasonable: 'Realistic expectations. Will pay fair advisory fees.',
  serious_demanding: 'Committed to the deal. Fights hard on percentage.',
  unsure_optimistic: 'Unrealistic valuation. Wants to pay only on upside.',
  unsure_reluctant: 'Not fully committed. Resists all financial commitments.',
};

export default function FeeNegotiationModal({ onClose }: Props) {
  const client = useGameStore((s) => s.client);
  const resources = useGameStore((s) => s.resources);
  const feeNegotiation = useGameStore((s) => s.feeNegotiation);
  const agreedFeeTerms = useGameStore((s) => s.agreedFeeTerms);
  const startFeeNegotiation = useGameStore((s) => s.startFeeNegotiation);
  const submitFeeRound = useGameStore((s) => s.submitFeeRound);
  const acceptFeeTerms = useGameStore((s) => s.acceptFeeTerms);
  const week = useGameStore((s) => s.week);

  // Draft state — terms builder
  const [retainerType, setRetainerType] = useState<RetainerType>('none');
  const [retainerAmount, setRetainerAmount] = useState(0);
  const [successFeePercent, setSuccessFeePercent] = useState(2.5);
  const [ratchetEnabled, setRatchetEnabled] = useState(false);
  const [ratchetThresholdEV, setRatchetThresholdEV] = useState(client.valuationExpectationEV ?? 100);
  const [ratchetBonusPercent, setRatchetBonusPercent] = useState(5);
  const [showReactions, setShowReactions] = useState(false);

  if (!feeNegotiation) return null;

  const { clientState, rounds, status } = feeNegotiation;
  const latestRound = rounds.at(-1);
  const maxRounds = resources.clientTrust > 60 ? 4 : 3;
  const ev = client.valuationExpectationEV ?? 100;

  // Live fee projection
  const baseFee = (successFeePercent / 100) * ev;
  const ratchetFee =
    ratchetEnabled && ratchetThresholdEV && ratchetBonusPercent
      ? (ratchetBonusPercent / 100) * Math.max(0, ev - ratchetThresholdEV)
      : 0;
  const totalFee = Math.round((baseFee + ratchetFee) * 10) / 10;

  const retainerRange = RETAINER_RANGES[retainerType];

  const handleChangeRetainerType = (t: RetainerType) => {
    setRetainerType(t);
    if (t === 'none') setRetainerAmount(0);
    else setRetainerAmount(RETAINER_RANGES[t].min);
  };

  const isRetainerLocked = clientState.lockedComponents.includes('retainer');
  const isSuccessFeeLocked = clientState.lockedComponents.includes('successFee');
  const isRatchetLocked = clientState.lockedComponents.includes('ratchet');

  const handleSubmit = () => {
    submitFeeRound({
      playerRetainerType: isRetainerLocked ? (clientState.lockedRetainerType ?? retainerType) : retainerType,
      playerRetainerAmount: isRetainerLocked ? (clientState.lockedRetainerAmount ?? retainerAmount) : retainerAmount,
      playerSuccessFeePercent: isSuccessFeeLocked ? (clientState.lockedSuccessFeePercent ?? successFeePercent) : successFeePercent,
      playerRatchetEnabled: ratchetEnabled,
      playerRatchetThresholdEV: ratchetEnabled ? ratchetThresholdEV : undefined,
      playerRatchetBonusPercent: ratchetEnabled ? ratchetBonusPercent : undefined,
    });
    setShowReactions(true);
  };

  const handleRevise = () => {
    setShowReactions(false);
    // Pre-fill with current values
  };

  // Priority hint (0-10 → low/medium/high)
  const priorityLabel = (val: number) => val <= 3 ? 'Low' : val <= 6 ? 'Medium' : 'High';
  const priorityWidth = (val: number) => `${(val / 10) * 100}%`;
  const priorityColor = (val: number) => val <= 3 ? 'bg-green-500' : val <= 6 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-bg-secondary border border-border-subtle rounded-[var(--radius-lg)] shadow-[var(--shadow-heavy)] w-full max-w-4xl mx-4 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-border-subtle shrink-0">
          <div>
            <h2 className="text-[15px] font-semibold text-text-primary">Fee Negotiation</h2>
            <p className="text-[12px] text-text-muted mt-0.5">
              {status === 'agreed' ? '✓ Terms agreed' :
               status === 'failed' ? '✕ Negotiation failed' :
               status === 'pitch_pending' ? 'Start negotiation to begin' :
               `Round ${Math.min(rounds.length + (showReactions ? 0 : 1), maxRounds)} of ${maxRounds}`}
            </p>
          </div>
          {/* Round indicator */}
          <div className="flex items-center gap-1.5 mr-4">
            {Array.from({ length: maxRounds }).map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  i < rounds.length
                    ? rounds[i].outcome === 'accepted' ? 'bg-green-500' : rounds[i].outcome === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'
                    : i === rounds.length ? 'bg-accent-primary' : 'bg-border-subtle'
                }`}
              />
            ))}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-[var(--radius-md)] hover:bg-surface-hover text-text-muted hover:text-text-primary transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* AGREED STATE */}
        {status === 'agreed' && agreedFeeTerms && (
          <div className="p-8 flex flex-col items-center text-center gap-5">
            <div className="w-16 h-16 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center">
              <HandshakeIcon size={28} className="text-green-400" />
            </div>
            <div>
              <h3 className="text-[17px] font-bold text-text-primary">Mandate Terms Agreed</h3>
              <p className="text-[13px] text-text-muted mt-1">Agreement reached with {client.name} · Week {week}</p>
            </div>
            <div className="bg-bg-primary border border-border-subtle rounded-[var(--radius-md)] p-5 w-full max-w-sm text-left space-y-2.5">
              <div className="flex justify-between text-[12px]">
                <span className="text-text-muted">Retainer</span>
                <span className="text-text-secondary font-medium capitalize">
                  {agreedFeeTerms.retainerType === 'none' ? '—' : `€${agreedFeeTerms.retainerAmount}k (${agreedFeeTerms.retainerType.replace('_', ' ')})`}
                </span>
              </div>
              <div className="flex justify-between text-[12px]">
                <span className="text-text-muted">Success Fee</span>
                <span className="text-text-accent font-semibold">{agreedFeeTerms.successFeePercent}%</span>
              </div>
              {agreedFeeTerms.ratchetEnabled && (
                <div className="flex justify-between text-[12px]">
                  <span className="text-text-muted">Ratchet</span>
                  <span className="text-text-secondary">{agreedFeeTerms.ratchetBonusPercent}% above €{agreedFeeTerms.ratchetThresholdEV}M</span>
                </div>
              )}
              <div className="border-t border-border-subtle pt-2.5 flex justify-between text-[13px]">
                <span className="text-text-secondary font-semibold">Total projected fee</span>
                <span className="text-text-accent font-bold">€{agreedFeeTerms.totalFeeProjection}M</span>
              </div>
              <p className="text-[10px] text-text-muted">At expected EV of €{ev}M</p>
            </div>
            <button onClick={onClose} className="px-6 py-2.5 bg-accent-primary text-white rounded-[var(--radius-md)] text-[13px] font-medium hover:bg-accent-primary/90">
              Continue
            </button>
          </div>
        )}

        {/* FAILED STATE */}
        {status === 'failed' && (
          <div className="p-8 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-2xl">✕</div>
            <div>
              <h3 className="text-[17px] font-bold text-text-primary">Negotiation Broken Down</h3>
              <p className="text-[13px] text-text-muted mt-1">−10 client trust applied. Revise your position significantly to re-open.</p>
            </div>
            {latestRound && (
              <div className="bg-bg-primary border border-red-500/20 rounded-[var(--radius-md)] p-4 text-left max-w-md w-full">
                <p className="text-[12px] text-text-muted italic">"{latestRound.clientNote}"</p>
                <div className="flex gap-3 mt-3 text-[11px]">
                  {(['Retainer', 'Success Fee', 'Ratchet'] as const).map((label, i) => {
                    const reaction = i === 0 ? latestRound.reactionRetainer : i === 1 ? latestRound.reactionSuccessFee : latestRound.reactionRatchet;
                    return (
                      <span key={label} className={`px-2 py-1 rounded border ${reactionColor[reaction]}`}>
                        {reactionEmoji[reaction]} {label}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
            <button
              onClick={() => { setShowReactions(false); }}
              className="px-6 py-2.5 bg-accent-primary text-white rounded-[var(--radius-md)] text-[13px] font-medium hover:bg-accent-primary/90"
            >
              Return & Revise Offer
            </button>
          </div>
        )}

        {/* PITCH PENDING — start button */}
        {status === 'pitch_pending' && (
          <div className="p-8 flex flex-col items-center text-center gap-4">
            <p className="text-[13px] text-text-muted">The pitch has been presented. {client.name} is now ready to discuss mandate terms.</p>
            <button
              onClick={() => startFeeNegotiation()}
              className="px-6 py-3 bg-accent-primary text-white rounded-[var(--radius-md)] text-[14px] font-semibold hover:bg-accent-primary/90 transition-all"
            >
              Begin Fee Negotiation
            </button>
          </div>
        )}

        {/* IN PROGRESS — main negotiation UI */}
        {status === 'in_progress' && (
          <div className="flex flex-1 min-h-0 overflow-hidden">
            {/* Left — Client Profile Panel */}
            <div className="w-64 shrink-0 border-r border-border-subtle p-5 space-y-4 overflow-y-auto">
              <div>
                <div className="w-10 h-10 rounded-full bg-bg-primary border border-border-subtle flex items-center justify-center text-lg mb-2">
                  👤
                </div>
                <p className="text-[13px] font-semibold text-text-primary">{client.name}</p>
                <p className="text-[11px] text-text-muted mt-0.5 capitalize">{clientState.profile.replace('_', ' ')}</p>
                <p className="text-[11px] text-text-muted/70 mt-1 leading-relaxed">{profileDescriptions[clientState.profile]}</p>
              </div>

              {/* Priority bars */}
              <div className="space-y-2.5">
                <p className="text-[10px] text-text-muted uppercase tracking-widest">Term Priorities</p>
                {[
                  { label: 'Retainer', val: clientState.priorityRetainer },
                  { label: 'Success Fee', val: clientState.prioritySuccessFee },
                  { label: 'Ratchet', val: clientState.priorityRatchet },
                ].map(({ label, val }) => (
                  <div key={label}>
                    <div className="flex justify-between text-[10px] mb-0.5">
                      <span className="text-text-muted">{label}</span>
                      <span className="text-text-secondary">{priorityLabel(val)}</span>
                    </div>
                    <div className="h-1 bg-bg-primary rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${priorityColor(val)} transition-all`} style={{ width: priorityWidth(val) }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Patience meter */}
              <div>
                <div className="flex justify-between text-[10px] mb-0.5">
                  <span className="text-text-muted">Client Patience</span>
                  <span className={`font-mono ${clientState.patienceRemaining > 50 ? 'text-green-400' : clientState.patienceRemaining > 25 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {Math.round(clientState.patienceRemaining)}%
                  </span>
                </div>
                <div className="h-2 bg-bg-primary rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${clientState.patienceRemaining > 50 ? 'bg-green-500' : clientState.patienceRemaining > 25 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${clientState.patienceRemaining}%` }}
                  />
                </div>
              </div>

              {/* Revealed signals */}
              {clientState.revealedHints.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] text-text-muted uppercase tracking-widest flex items-center gap-1">
                    <Lightbulb size={10} /> Signals
                  </p>
                  {clientState.revealedHints.map((hint, i) => (
                    <div key={i} className="p-2 bg-yellow-500/5 border border-yellow-500/20 rounded-[var(--radius-sm)]">
                      <p className="text-[11px] text-yellow-300 leading-relaxed">{hint}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Client quote */}
              {latestRound && (
                <div className="p-3 bg-bg-primary rounded-[var(--radius-md)] border border-border-subtle/50">
                  <p className="text-[11px] text-text-secondary italic leading-relaxed">"{latestRound.clientNote}"</p>
                </div>
              )}
            </div>

            {/* Right — Terms Builder */}
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
              {/* Reaction reveal (shown after submit) */}
              {showReactions && latestRound && (
                <div className="p-4 bg-bg-primary border border-border-subtle rounded-[var(--radius-md)] space-y-3">
                  <h3 className="text-[11px] font-semibold text-text-muted uppercase tracking-widest">Client Response — Round {latestRound.round}</h3>
                  <div className="flex gap-3">
                    {[
                      { label: 'Retainer', reaction: latestRound.reactionRetainer },
                      { label: 'Success Fee', reaction: latestRound.reactionSuccessFee },
                      { label: 'Ratchet', reaction: latestRound.reactionRatchet },
                    ].map(({ label, reaction }) => (
                      <div key={label} className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-[var(--radius-sm)] border ${reactionColor[reaction]}`}>
                        <span className="text-xl">{reactionEmoji[reaction]}</span>
                        <span className="text-[10px] font-medium">{label}</span>
                        <span className="text-[10px] opacity-80">{reactionLabel[reaction]}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[12px] text-text-secondary italic">"{latestRound.clientNote}"</p>
                  <div className="flex gap-2">
                    {latestRound.outcome === 'counter' && (
                      <>
                        <button
                          onClick={handleRevise}
                          className="flex-1 py-2 text-[12px] font-medium text-text-secondary border border-border-subtle rounded-[var(--radius-md)] hover:bg-surface-hover transition-colors"
                        >
                          Revise & Counter
                        </button>
                        <button
                          onClick={() => { acceptFeeTerms(); }}
                          className="flex-1 py-2 text-[12px] font-medium text-accent-primary border border-accent-primary/40 rounded-[var(--radius-md)] hover:bg-accent-soft transition-colors"
                        >
                          Accept Client Terms
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Terms builder (hidden while showing reactions) */}
              {!showReactions && (
                <>
                  {/* Retainer */}
                  <div className={isRetainerLocked ? 'opacity-60 pointer-events-none' : ''}>
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-text-muted uppercase tracking-widest mb-2">
                      <Shield size={11} />
                      Retainer Structure
                      {isRetainerLocked && (
                        <span className="ml-auto flex items-center gap-1 text-green-400 normal-case text-[10px] font-normal">
                          <Lock size={10} /> Agreed — {clientState.lockedRetainerType === 'none' ? 'None' : `€${clientState.lockedRetainerAmount}k (${clientState.lockedRetainerType?.replace('_', ' ')})`}
                        </span>
                      )}
                    </div>
                    {!isRetainerLocked && (
                      <>
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          {(['none', 'monthly', 'per_phase', 'upfront'] as RetainerType[]).map((t) => (
                            <button
                              key={t}
                              onClick={() => handleChangeRetainerType(t)}
                              className={`py-2 px-3 text-[11px] rounded-[var(--radius-md)] border text-left transition-all ${
                                retainerType === t
                                  ? 'border-accent-primary/40 bg-accent-soft text-text-accent'
                                  : 'border-border-subtle text-text-muted hover:border-border-subtle/80 hover:text-text-secondary'
                              }`}
                            >
                              {RETAINER_LABELS[t]}
                            </button>
                          ))}
                        </div>
                        {retainerType !== 'none' && (
                          <div className="flex items-center gap-3">
                            <input
                              type="range"
                              min={retainerRange.min}
                              max={retainerRange.max}
                              step={retainerRange.step}
                              value={retainerAmount}
                              onChange={(e) => setRetainerAmount(Number(e.target.value))}
                              className="flex-1 accent-[var(--color-accent-primary)]"
                            />
                            <span className="font-mono text-[13px] text-text-accent w-16 text-right">€{retainerAmount}k</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Success Fee */}
                  <div className={isSuccessFeeLocked ? 'opacity-60 pointer-events-none' : ''}>
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-text-muted uppercase tracking-widest mb-2">
                      <TrendingUp size={11} />
                      Success Fee
                      {isSuccessFeeLocked && (
                        <span className="ml-auto flex items-center gap-1 text-green-400 normal-case text-[10px] font-normal">
                          <Lock size={10} /> Agreed — {clientState.lockedSuccessFeePercent}%
                        </span>
                      )}
                    </div>
                    {!isSuccessFeeLocked && (
                      <div className="relative">
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min={1}
                            max={10}
                            step={0.5}
                            value={successFeePercent}
                            onChange={(e) => setSuccessFeePercent(Number(e.target.value))}
                            className="flex-1 accent-[var(--color-accent-primary)]"
                          />
                          <span className="font-mono font-bold text-[14px] text-text-accent w-14 text-right">{successFeePercent}%</span>
                        </div>
                        <div className="flex justify-between text-[9px] text-text-muted mt-1">
                          <span>1% (floor)</span>
                          <span className="text-yellow-500/70">5% (soft ceiling)</span>
                          <span>10% (hard cap)</span>
                        </div>
                        {successFeePercent > 5 && (
                          <p className="text-[10px] text-yellow-400 mt-1">⚠ Above typical range — most clients resist &gt;5%</p>
                        )}
                        <p className="text-[11px] text-text-muted mt-1">
                          Base fee at €{ev}M EV: <span className="font-mono text-text-accent">€{baseFee.toFixed(1)}M</span>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Ratchet */}
                  <div className={isRatchetLocked ? 'opacity-60 pointer-events-none' : ''}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-text-muted uppercase tracking-widest">
                        <BarChart2 size={11} />
                        Ratchet / Premio
                        {isRatchetLocked && (
                          <span className="flex items-center gap-1 text-green-400 normal-case text-[10px] font-normal">
                            <Lock size={10} /> Agreed
                          </span>
                        )}
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <span className="text-[11px] text-text-muted">{ratchetEnabled ? 'Enabled' : 'Disabled'}</span>
                        <div
                          onClick={() => setRatchetEnabled(!ratchetEnabled)}
                          className={`w-9 h-5 rounded-full transition-colors cursor-pointer relative ${ratchetEnabled ? 'bg-accent-primary' : 'bg-bg-primary border border-border-subtle'}`}
                        >
                          <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${ratchetEnabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
                        </div>
                      </label>
                    </div>
                    {ratchetEnabled && (
                      <div className="space-y-3 bg-bg-primary p-3 rounded-[var(--radius-md)] border border-border-subtle">
                        <div>
                          <div className="flex justify-between text-[11px] text-text-muted mb-1">
                            <span>EV Threshold</span>
                            <span className="font-mono text-text-secondary">€{ratchetThresholdEV}M</span>
                          </div>
                          <input
                            type="range"
                            min={50}
                            max={200}
                            step={5}
                            value={ratchetThresholdEV}
                            onChange={(e) => setRatchetThresholdEV(Number(e.target.value))}
                            className="w-full accent-[var(--color-accent-primary)]"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-[11px] text-text-muted mb-1">
                            <span>Ratchet Bonus %</span>
                            <span className="font-mono text-text-secondary">{ratchetBonusPercent}%</span>
                          </div>
                          <input
                            type="range"
                            min={1}
                            max={15}
                            step={1}
                            value={ratchetBonusPercent}
                            onChange={(e) => setRatchetBonusPercent(Number(e.target.value))}
                            className="w-full accent-[var(--color-accent-primary)]"
                          />
                        </div>
                        <p className="text-[11px] text-text-muted">
                          Ratchet payout at €{ev}M EV:
                          <span className="font-mono text-yellow-400 ml-1">€{ratchetFee.toFixed(1)}M</span>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Live Fee Summary */}
                  <div className="bg-accent-soft border border-accent-primary/20 rounded-[var(--radius-md)] p-4 space-y-1.5">
                    <p className="text-[11px] text-text-muted">If the deal closes at expected EV (€{ev}M):</p>
                    {retainerType !== 'none' && (
                      <div className="flex justify-between text-[12px]">
                        <span className="text-text-muted">Retainer income</span>
                        <span className="text-text-secondary font-mono">€{retainerAmount}k ({retainerType === 'monthly' ? '/mo' : retainerType === 'per_phase' ? '/phase' : 'upfront'})</span>
                      </div>
                    )}
                    <div className="flex justify-between text-[12px]">
                      <span className="text-text-muted">Base success fee ({successFeePercent}%)</span>
                      <span className="text-text-secondary font-mono">€{baseFee.toFixed(1)}M</span>
                    </div>
                    {ratchetEnabled && ratchetFee > 0 && (
                      <div className="flex justify-between text-[12px]">
                        <span className="text-text-muted">Ratchet premio</span>
                        <span className="text-yellow-400 font-mono">€{ratchetFee.toFixed(1)}M</span>
                      </div>
                    )}
                    <div className="border-t border-accent-primary/10 pt-1.5 flex justify-between text-[13px] font-semibold">
                      <span className="text-text-secondary">Total advisory fee</span>
                      <span className="text-text-accent font-mono">€{totalFee}M</span>
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    onClick={handleSubmit}
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
