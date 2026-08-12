import { useState, useEffect } from 'react';
import { PHASE_NAMES } from '../types/game';
import type { PhaseId } from '../types/game';
import { useGameStore } from '../store/gameStore';
import { getTargetNarrative, personalizeTargetNarrativeValue } from '../content/targetNarratives';

const PHASE_ENTRY_NARRATIVES: Partial<Record<PhaseId, string>> = {
  2: "The mandate is signed. Now build the story buyers will pay a premium for.",
  3: "The desk is ready. The market is about to see Solara for the first time.",
  4: "Responses are in. Now separate serious buyers from market tourists.",
  5: "The shortlist is set. Buyers know they're competing. This is where price is made or lost.",
  6: "DD is open. Every question they ask is a negotiation in disguise.",
  7: "Schneider's offer landed first and looks strong — but three other buyers are still in the room.",
  8: "Preferred bidder selected. Now the lawyers take over and every word counts.",
  9: "Contracts in agreed form. One signature stands between Ricardo and the wire.",
  10: "Conditions satisfied. The deal is closing.",
};

const PHASE_TAGLINES: Record<PhaseId, string> = {
  0: 'Source, qualify, and assess the opportunity.',
  1: 'Build the investment case. Win the mandate.',
  2: 'Build materials, financial models, and the data room.',
  3: 'Distribute teasers, sign NDAs, engage the market.',
  4: 'Filter to serious buyers. Qualify intent and capacity.',
  5: 'Receive and analyse non-binding offers.',
  6: 'Open the data room. Expert sessions and management presentations.',
  7: 'Best and final offers. SPA drafts circulate.',
  8: 'Mark-ups, reps & warranties, disclosure schedules.',
  9: 'Contracts in agreed form. Board approvals.',
  10: 'Conditions precedent satisfied. Wire the funds.',
};

interface Props {
  fromPhase: PhaseId;
  toPhase: PhaseId;
  onComplete: () => void;
}

export default function PhaseTransitionOverlay({ fromPhase, toPhase, onComplete }: Props) {
  const [stage, setStage] = useState<'fade-in' | 'hold' | 'fade-out'>('fade-in');
  const targetNarrativeId = useGameStore((state) => state.targetNarrativeId);
  const entryNarrative = PHASE_ENTRY_NARRATIVES[toPhase]
    ? personalizeTargetNarrativeValue(PHASE_ENTRY_NARRATIVES[toPhase]!, getTargetNarrative(targetNarrativeId))
    : undefined;

  useEffect(() => {
    const t1 = setTimeout(() => setStage('hold'), 200);
    const t2 = setTimeout(() => setStage('fade-out'), 1200);
    const t3 = setTimeout(onComplete, 1600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  return (
    <div
      onClick={onComplete}
      className={`fixed inset-0 z-[60] cursor-pointer select-none flex items-center justify-center bg-bg-primary transition-opacity duration-300 ${
        stage === 'fade-in' ? 'opacity-0' : stage === 'hold' ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Glow effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-accent-primary/10 blur-[120px]" />
      </div>

      <div className="relative text-center space-y-6">
        {/* Previous phase */}
        <div className="text-[11px] font-mono uppercase tracking-widest text-text-muted">
          Phase {fromPhase}: {PHASE_NAMES[fromPhase]}
          <span className="mx-3 text-accent-primary">→</span>
        </div>

        {/* New phase */}
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-accent-primary mb-3">
            Phase {toPhase}
          </div>
          <h1 className="text-4xl font-display font-bold text-text-primary tracking-tight">
            {PHASE_NAMES[toPhase]}
          </h1>
        </div>

        {/* Tagline */}
        <p className="text-[14px] text-text-secondary max-w-md mx-auto leading-relaxed">
          {PHASE_TAGLINES[toPhase]}
        </p>

        {/* Entry narrative */}
        {entryNarrative && (
          <p className="text-[12px] text-text-accent/80 max-w-md mx-auto italic leading-relaxed">
            {entryNarrative}
          </p>
        )}

        {/* Divider & Skip hint */}
        <div className="pt-2">
          <div className="w-24 h-px bg-accent-primary/40 mx-auto mb-3" />
          <p className="text-[10px] font-mono text-text-muted uppercase tracking-widest animate-pulse">Click anywhere to skip</p>
        </div>
      </div>
    </div>
  );
}
