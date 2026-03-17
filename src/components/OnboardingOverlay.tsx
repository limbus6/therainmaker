import { useState } from 'react';
import { useGameStore } from '../store/gameStore';

const SLIDES = [
  {
    title: 'Welcome to M&A Rainmaker',
    body: `You are a sell-side M&A banker at Clearwater Advisory. Your client, Ricardo Mendes, has hired you to run a full sale process for Solara Systems — his industrial automation company.\n\nYour job: find the right buyer, manage the process, and close the deal at the best possible price.`,
    cta: 'Got it →',
  },
  {
    title: 'How the Game Works',
    body: `The deal runs across 11 phases — from origination to closing. Each week you:\n\n• Complete tasks to drive the process forward\n• Respond to emails from your client, team, and buyers\n• Manage risks before they derail the deal\n• Advance the week when you're ready\n\nYour resources — budget, momentum, trust, and team capacity — determine whether the deal closes.`,
    cta: 'Understood →',
  },
  {
    title: 'Phase 0 — Deal Origination',
    body: `You're starting in Phase 0: Deal Origination.\n\nYour immediate objectives:\n1. Screen the market and confirm Solara is ready to sell\n2. Meet Ricardo and assess his motivations\n3. Align internally on whether to pursue the mandate\n4. Prepare to enter Phase 1 (Pitch & Mandate)\n\nCheck your Inbox and Tasks to get started. Good luck.`,
    cta: 'Start the Deal →',
  },
];

interface OnboardingOverlayProps {
  onComplete: () => void;
}

export default function OnboardingOverlay({ onComplete }: OnboardingOverlayProps) {
  const [slide, setSlide] = useState(0);
  const markOnboardingSeen = useGameStore((s) => s.markOnboardingSeen);
  const playerName = useGameStore((s) => s.playerName);

  const current = SLIDES[slide];
  const isLast = slide === SLIDES.length - 1;

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
          {SLIDES.map((_, i) => (
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
            {slide + 1} / {SLIDES.length}
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
