import { useEffect, useMemo, useRef, useState } from 'react';
import { BadgeEuro, CheckCircle2, FastForward, Landmark, PenTool, Sparkles } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { buildResultsBoard } from '../engine/resultsEngine';
import { prefersReducedMotion, staggerReveal } from '../utils/motion';

type CeremonyStage = 'sealed' | 'revealed';

export default function ApexCeremonyOverlay() {
  const gameState = useGameStore();
  const pending = gameState.apexCeremonies.pending;
  const complete = gameState.completeApexCeremony;
  const [stage, setStage] = useState<CeremonyStage>('sealed');
  const revealRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (stage === 'revealed' && revealRef.current && !prefersReducedMotion()) {
      staggerReveal(Array.from(revealRef.current.children) as HTMLElement[], 0.12, 0.35);
    }
  }, [stage]);

  const content = useMemo(() => {
    if (!pending) return null;
    const preferredBuyer = gameState.buyers.find((buyer) => buyer.id === gameState.preferredBidderId);

    if (pending.type === 'board') {
      const approved = pending.outcome === 'approved';
      return {
        icon: <Landmark size={34} />,
        eyebrow: 'Investment Committee',
        title: 'The IC decision is in',
        prompt: 'The committee has finished its review. Open the decision before the mandate moves again.',
        revealCommand: 'Open IC decision',
        result: approved ? 'MANDATE APPROVED' : 'REWORK REQUIRED',
        resultTone: approved ? 'text-state-success' : 'text-state-warning',
        body: gameState.boardSubmission?.boardNotes ?? (approved
          ? 'The committee has authorised the mandate.'
          : 'The committee wants a stronger case before it commits the firm.'),
        checkpoints: approved
          ? ['Qualification evidence reviewed', 'Partner capital committed', 'Pitch authority granted']
          : ['Decision recorded', 'Evidence gaps returned', 'Resubmission path remains open'],
        finalCommand: approved ? 'Build the pitch' : 'Strengthen the case',
      };
    }

    if (pending.type === 'signing') {
      return {
        icon: <PenTool size={34} />,
        eyebrow: 'Execution ceremony',
        title: 'The execution copies are ready',
        prompt: `${preferredBuyer?.name ?? 'The preferred buyer'} and ${gameState.client.name} are waiting on the same signature page.`,
        revealCommand: 'Begin signing',
        result: 'SPA SIGNED',
        resultTone: 'text-state-success',
        body: `The sale agreement with ${preferredBuyer?.name ?? 'the preferred buyer'} is now executed. Every negotiated word has become an obligation.`,
        checkpoints: ['Seller authority confirmed', 'Buyer authority confirmed', 'Executed SPA released to both sides'],
        finalCommand: 'Move to closing',
      };
    }

    const results = buildResultsBoard(gameState);
    return {
      icon: <BadgeEuro size={34} />,
      eyebrow: 'Closing day',
      title: 'Funds flow is live',
      prompt: `${preferredBuyer?.name ?? 'The buyer'} has funded the escrow. One release instruction separates signing from certainty.`,
      revealCommand: 'Release the wire',
      result: 'FUNDS CLEARED',
      resultTone: 'text-state-success',
      body: `€${results.financial.closingValue}M has closed. ${gameState.client.name}'s proceeds and Clearwater's €${results.financial.totalAdvisoryFee}k fee are no longer projections.`,
      checkpoints: ['Purchase price received', 'Seller proceeds released', 'Advisory fee confirmed'],
      finalCommand: 'Open Results Board',
    };
  }, [gameState, pending]);

  if (!pending || !content) return null;

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="apex-ceremony-title" className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-bg-primary/95 px-4 py-6 backdrop-blur-md">
      <div className="relative w-full max-w-xl overflow-hidden rounded-[var(--radius-lg)] border border-border-accent/50 bg-bg-elevated p-5 shadow-[var(--shadow-glow-strong)] sm:p-7">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(90,125,255,0.16),transparent_55%)]" />
        <div className="relative">
          <div className="flex items-start justify-between gap-4 border-b border-border-subtle pb-4">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-text-accent">{content.eyebrow}</p>
              <h2 id="apex-ceremony-title" className="mt-1 text-xl font-display font-semibold text-text-primary">{content.title}</h2>
            </div>
            <button type="button" onClick={() => complete('skipped')} className="inline-flex shrink-0 items-center gap-1.5 rounded-[var(--radius-sm)] border border-border-subtle px-2.5 py-1.5 text-[11px] text-text-muted hover:bg-surface-hover">
              <FastForward size={12} /> Skip
            </button>
          </div>

          {stage === 'sealed' ? (
            <div className="flex min-h-[330px] flex-col items-center justify-center text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full border border-border-accent/60 bg-accent-soft text-text-accent shadow-[var(--shadow-glow-soft)]">
                {content.icon}
              </div>
              <p className="mt-6 max-w-md text-[13px] leading-relaxed text-text-secondary">{content.prompt}</p>
              <button type="button" onClick={() => setStage('revealed')} className="mt-6 inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-accent-primary px-5 py-2.5 text-[12px] font-semibold text-white hover:bg-accent-hover">
                <Sparkles size={14} /> {content.revealCommand}
              </button>
            </div>
          ) : (
            <div ref={revealRef} className="min-h-[330px] py-7 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-state-success/35 bg-state-success/10 text-state-success">
                <CheckCircle2 size={28} />
              </div>
              <p className={`mt-5 font-mono text-3xl font-semibold tracking-tight ${content.resultTone}`}>{content.result}</p>
              <p className="mx-auto mt-4 max-w-lg text-[13px] leading-relaxed text-text-secondary">{content.body}</p>
              <div className="mx-auto mt-6 grid max-w-lg gap-2 text-left sm:grid-cols-3">
                {content.checkpoints.map((checkpoint) => (
                  <div key={checkpoint} className="rounded-[var(--radius-md)] border border-border-subtle bg-surface-default p-3 text-[10px] leading-relaxed text-text-secondary">
                    <CheckCircle2 size={12} className="mb-2 text-state-success" /> {checkpoint}
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => complete('completed')} className="mt-7 rounded-[var(--radius-md)] bg-accent-primary px-5 py-2.5 text-[12px] font-semibold text-white hover:bg-accent-hover">
                {content.finalCommand}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
