// ============================================
// Mandate Market — choose the next engagement (M5a)
// ============================================

import { useCareerStore } from '../store/careerStore';
import { MANDATE_POOL, stashPendingMandate } from '../content/mandates';
import { Briefcase, TrendingUp, Landmark } from 'lucide-react';

export default function MandateMarketScreen() {
  const tombstones = useCareerStore((s) => s.tombstones);
  const careerReputation = useCareerStore((s) => s.careerReputation);

  const startMandate = (mandateId: string) => {
    const mandate = MANDATE_POOL.find((m) => m.id === mandateId);
    if (!mandate) return;
    stashPendingMandate({
      id: mandate.id,
      // Deterministic per (mandate, career step) — replaying the market after
      // another mandate offers a genuinely different run of the same weather.
      seed: mandate.seedBase + tombstones.length * 7919,
      difficulty: mandate.difficulty,
      careerReputationBonus: careerReputation,
    });
    localStorage.removeItem('ma-rainmaker-save');
    window.location.replace(import.meta.env.BASE_URL);
  };

  return (
    <div className="min-h-screen bg-bg-primary px-4 py-10">
      <div className="mx-auto w-full max-w-4xl space-y-8">
        <header className="text-center">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-text-accent">Clearwater Advisory</p>
          <h1 className="mt-2 text-3xl font-display font-semibold text-text-primary">The Mandate Market</h1>
          <p className="mt-2 text-[13px] text-text-secondary">Every engagement is the same craft under different weather. Choose yours.</p>
        </header>

        {/* Career strip */}
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 rounded-[var(--radius-lg)] border border-border-subtle bg-bg-secondary/70 px-6 py-4">
          <span className="flex items-center gap-2 text-[12px] text-text-secondary">
            <Landmark size={14} className="text-text-accent" />
            Tombstones: <span className="font-mono font-semibold text-text-primary">{tombstones.length}</span>
          </span>
          <span className="flex items-center gap-2 text-[12px] text-text-secondary">
            <TrendingUp size={14} className="text-text-accent" />
            Career reputation: <span className="font-mono font-semibold text-text-primary">+{careerReputation}</span>
          </span>
          {tombstones.length > 0 && (
            <span className="text-[11px] font-mono text-text-muted">
              Last: {tombstones.at(-1)!.mandateLabel.split('—')[1]?.trim() ?? tombstones.at(-1)!.mandateLabel} · {tombstones.at(-1)!.outcome === 'closed' ? `€${tombstones.at(-1)!.closingValue}M · ${tombstones.at(-1)!.grade}` : 'Collapsed'}
            </span>
          )}
        </div>

        {/* Mandate cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {MANDATE_POOL.map((mandate) => {
            const attempts = tombstones.filter((t) => t.mandateId === mandate.id);
            const bestClosed = attempts.filter((t) => t.outcome === 'closed').sort((a, b) => b.closingValue - a.closingValue)[0];
            return (
              <button
                key={mandate.id}
                onClick={() => startMandate(mandate.id)}
                className="flex flex-col rounded-[var(--radius-lg)] border-2 border-border-subtle bg-bg-secondary/90 p-5 text-left transition-all hover:-translate-y-0.5 hover:border-accent-primary active:scale-95"
              >
                <div className="flex items-center gap-2 text-text-accent">
                  <Briefcase size={14} />
                  <span className="text-[10px] font-mono uppercase tracking-widest">Difficulty {mandate.difficulty.overall}</span>
                </div>
                <h2 className="mt-2 text-[15px] font-semibold leading-snug text-text-primary">{mandate.label}</h2>
                <p className="mt-1 text-[11px] italic text-text-secondary">{mandate.conditions}</p>
                <p className="mt-3 flex-1 text-[11px] leading-relaxed text-text-muted">{mandate.description}</p>
                <div className="mt-4 space-y-1 border-t border-border-subtle/60 pt-3">
                  {careerReputation > 0 && (
                    <p className="text-[10px] text-text-muted">Career reputation carries in: <span className="font-mono text-text-accent">+{careerReputation} starting reputation</span></p>
                  )}
                  <p className="text-[10px] font-mono text-text-muted">
                    {attempts.length === 0 ? 'Never attempted' : bestClosed ? `Best close: €${bestClosed.closingValue}M (${bestClosed.grade})` : `${attempts.length} attempt${attempts.length === 1 ? '' : 's'}, no close yet`}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        <p className="text-center text-[10px] font-mono uppercase tracking-widest text-text-muted">
          Accepting a mandate opens a fresh engagement — your career and tombstones persist.
        </p>
      </div>
    </div>
  );
}
