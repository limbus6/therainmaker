import { X, ArrowRight, Mail, ListChecks, ShieldAlert, Gauge, Users } from 'lucide-react';

interface GameInstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CORE_STEPS = [
  {
    icon: Mail,
    title: 'Read the Inbox',
    body: 'Emails bring client pressure, team requests, buyer signals, and events that can change the direction of the deal.',
  },
  {
    icon: ListChecks,
    title: 'Choose Tasks',
    body: 'Tasks move workstreams, deliverables, and phase gates forward. Prioritize what unlocks progress without overloading capacity.',
  },
  {
    icon: ShieldAlert,
    title: 'Mitigate Risks',
    body: 'Ignored risks can become negative events, lost client trust, or broken deal momentum.',
  },
  {
    icon: Gauge,
    title: 'Advance Time',
    body: 'Once you have set your move, advance time. The game resolves tasks, events, buyers, and resources.',
  },
];

export default function GameInstructionsModal({ isOpen, onClose }: GameInstructionsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[320] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl overflow-hidden rounded-[var(--radius-lg)] border border-border-subtle bg-bg-secondary shadow-[var(--shadow-heavy)]">
        <div className="flex items-start justify-between gap-4 border-b border-border-subtle px-6 py-5">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.24em] text-text-accent">Game instructions</p>
            <h2 className="mt-1 font-display text-[22px] font-semibold text-text-primary">How to Run the Deal</h2>
            <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-text-secondary">
              Your goal is to close the sale of Solara Systems without losing buyers, client trust, or control of the process.
              The game should sit in a healthy tension band: neither an automatic checklist nor unfair chaos.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-[var(--radius-md)] p-1.5 text-text-muted transition-colors hover:bg-surface-hover hover:text-text-primary"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid gap-4 px-6 py-6 md:grid-cols-2">
          {CORE_STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="rounded-[var(--radius-md)] border border-border-subtle bg-bg-primary p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-text-accent">
                    <Icon size={16} />
                  </div>
                  <h3 className="text-[14px] font-semibold text-text-primary">{step.title}</h3>
                </div>
                <p className="mt-3 text-[12px] leading-relaxed text-text-secondary">{step.body}</p>
              </div>
            );
          })}
        </div>

        <div className="border-t border-border-subtle bg-bg-primary/60 px-6 py-5">
          <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
            <div>
              <div className="flex items-center gap-2 text-[12px] font-semibold text-text-primary">
                <Users size={14} className="text-text-accent" />
                What to Watch
              </div>
              <p className="mt-2 text-[12px] leading-relaxed text-text-secondary">
                Keep momentum and trust high, budget and capacity under control, risk below critical levels,
                and enough buyers in the process to preserve competitive tension.
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-[12px] font-semibold text-text-primary">
                <ArrowRight size={14} className="text-text-accent" />
                How to Progress
              </div>
              <p className="mt-2 text-[12px] leading-relaxed text-text-secondary">
                Each phase has a gate. Complete the core requirements, advance time to resolve consequences,
                and move to the next phase when the gate shows the process is ready.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="mt-5 w-full rounded-[var(--radius-md)] bg-accent-primary px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-accent-hover"
          >
            Back to Game
          </button>
        </div>
      </div>
    </div>
  );
}
