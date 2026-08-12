import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { getMandatePhaseSequence, isShortMandate } from '../content/mandates';

const FLAGSHIP_SLIDES = [
  {
    title: 'Welcome to M&A Rainmaker',
    body: `You are a sell-side M&A banker at Clearwater Advisory. You do not have the mandate yet.\n\nDeal Origination has surfaced three founder-led opportunities with different sectors, motives and execution risks. Your first objective is to qualify them, choose the campaign you believe in, win internal approval, and then pitch for the mandate.`,
    cta: 'Got it →',
  },
  {
    title: 'How the Game Works',
    body: `The deal advances across 11 phases, from origination to closing. Each week you should:\n\n• Choose a priority and use Start & Advance to see it move immediately\n• Queue several actions only when you want to set a broader workplan\n• Respond to emails from prospects, the client, your team, and buyers\n• Mitigate risks before they derail the deal\n\nYour resources — budget, momentum, trust, and team capacity — determine whether the deal reaches closing.`,
    cta: 'Understood →',
  },
  {
    title: 'Phase 0 — Deal Origination',
    body: `You start in Phase 0: Deal Origination.\n\nImmediate objectives:\n1. Compare Solara Systems, Vektor Health Tech and Nexa Automation\n2. Investigate the target you favour and meet its founder\n3. Build enough evidence for a board recommendation\n4. If approved, enter Phase 1 with that target's campaign locked in\n\nYour choice changes the founder, economics, buyer universe and deal risks through closing.`,
    cta: 'Start the Deal →',
  },
];

const SHORT_MANDATE_SLIDES = [
  {
    title: 'Your Mandate Is Live',
    body: `You are a sell-side M&A banker at Clearwater Advisory. Solara has already appointed the firm and the preparation work is complete.\n\nThe market is opening now. Your job is to protect competitive tension, manage Ricardo and the buyers, and convert the process into a clean close.`,
    cta: 'Got it →',
  },
  {
    title: 'A Compressed Engagement',
    body: `This mandate focuses on five consequential stages rather than the complete 11-phase flagship process.\n\n• Market Outreach\n• Non-Binding Offers\n• Final Offers\n• SPA Negotiation\n• Closing\n\nAdministrative bridge work is assumed. Your score comes only from the decisions and execution you actually control.`,
    cta: 'Understood →',
  },
  {
    title: 'Stage 1 — Market Outreach',
    body: `The buyer universe is ready and the teaser can go out.\n\nImmediate objectives:\n1. Set the outreach deadline\n2. Launch the first buyer wave\n3. Process NDAs and buyer questions\n4. Qualify enough credible buyers for the NBO round\n\nStart with the decision card and Deal Desk.`,
    cta: 'Open the Market →',
  },
];

interface OnboardingOverlayProps {
  onComplete: () => void;
}

export default function OnboardingOverlay({ onComplete }: OnboardingOverlayProps) {
  const [slide, setSlide] = useState(0);
  const markOnboardingSeen = useGameStore((s) => s.markOnboardingSeen);
  const playerName = useGameStore((s) => s.playerName);
  const mandateId = useGameStore((s) => s.mandateId);
  const slides = isShortMandate(mandateId) ? SHORT_MANDATE_SLIDES : FLAGSHIP_SLIDES;
  const stageCount = getMandatePhaseSequence(mandateId).length;

  const current = slides[slide];
  const isLast = slide === slides.length - 1;

  const handleNext = () => {
    if (isLast) {
      markOnboardingSeen();
      onComplete();
    } else {
      setSlide(slide + 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[300]">
      <div className="bg-bg-secondary border border-border-subtle rounded-xl shadow-2xl w-[480px] max-w-[90vw] overflow-hidden">

        {/* Progress dots */}
        <div className="flex gap-1.5 px-6 pt-5">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full flex-1 transition-all duration-300 ${
                i <= slide ? 'bg-accent-primary' : 'bg-border-subtle'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {slide === 0 && playerName && (
            <p className="text-[12px] font-mono text-text-accent mb-3">
              Hello, {playerName}.
            </p>
          )}
          <h2 className="text-[20px] font-bold font-display text-text-primary mb-4">
            {current.title}
          </h2>
          <p className="text-[13px] text-text-secondary leading-relaxed whitespace-pre-line">
            {current.body}
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex items-center justify-between">
          <span className="text-[11px] font-mono text-text-muted">
            {slide + 1} / {slides.length}{isShortMandate(mandateId) ? ` · ${stageCount} stages` : ''}
          </span>
          <button
            onClick={handleNext}
            className="px-6 py-2.5 rounded-lg bg-accent-primary hover:bg-accent-primary/90 active:scale-95 transition-all duration-150 text-[13px] font-semibold text-text-primary"
          >
            {current.cta}
          </button>
        </div>
      </div>
    </div>
  );
}
