import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { Calendar, Clock, AlertTriangle } from 'lucide-react';

interface PhaseDeadlineModalProps {
  phase: 3 | 4 | 6;
}

const PHASE_COPY: Record<3 | 4 | 6, { title: string; description: string; action: string; icon?: string }> = {
  3: {
    title: 'Set Shortlist Deadline',
    description: 'Buyers need time to review the teaser, sign NDAs, and qualify their interest. When do you want to close outreach and move to shortlist?',
    action: 'Close Market Outreach & Begin Shortlist',
  },
  4: {
    title: 'Set NBO Deadline',
    description: 'Shortlisted buyers must submit their Non-Binding Offers by this date. After the deadline, no further offers will be accepted.',
    action: 'Set NBO Deadline & Open Bidding',
  },
  6: {
    title: 'Issue Process Letter',
    description: 'The Process Letter sets the deadline for buyers to complete due diligence, mark up the SPA, and submit a binding offer. Buyers who miss this deadline will be excluded from the process.',
    action: 'Issue Process Letter & Set Binding Offer Deadline',
  },
};

const ADVISORY: Record<3 | 4 | 6, (weeks: number) => string> = {
  3: (w) => w <= 1
    ? 'Very tight. Buyers may not have enough time to mobilise. Risk of low participation.'
    : w === 2 ? 'Standard market timeline. Balances speed and buyer preparation.'
    : w === 3 ? 'Comfortable timeline. Maximises buyer participation but delays momentum.'
    : 'Extended window. Reduces urgency and may signal desperation to the market.',
  4: (w) => w <= 1
    ? 'Very tight. Buyers may not have enough time to compile NBOs. Risk of low quality bids.'
    : w === 2 ? 'Standard NBO window. Allows adequate buyer preparation.'
    : w === 3 ? 'Generous timeline. Buyers well-prepared but deal momentum may suffer.'
    : 'Extended window. Signals process weakness. May attract opportunistic lowball offers.',
  6: (w) => w <= 1
    ? 'Very tight. Buyers may not have enough time to complete DD and mark up the SPA. High dropout risk.'
    : w === 2 ? 'Standard binding offer window. Tests buyer seriousness and creates urgency.'
    : w === 3 ? 'Comfortable timeline. Reduces dropout risk but extends process. Client may lose patience.'
    : 'Extended window. Buyers may drift. High risk of re-trading or material changes before signing.',
};

const WEEKS = [1, 2, 3, 4] as const;

export default function PhaseDeadlineModal({ phase }: PhaseDeadlineModalProps) {
  const { setPhaseDeadline, week } = useGameStore();
  const [selected, setSelected] = useState<1 | 2 | 3 | 4>(phase === 6 ? 3 : 2);
  const copy = PHASE_COPY[phase];
  const advisory = ADVISORY[phase](selected);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-bg-panel border border-border-default rounded-xl shadow-2xl w-full max-w-md mx-4 p-6 space-y-5">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent-soft flex items-center justify-center shrink-0">
            <Calendar size={18} className="text-text-accent" />
          </div>
          <div>
            <h2 className="text-[16px] font-display font-semibold text-text-primary">{copy.title}</h2>
            <p className="text-[12px] text-text-muted mt-1 leading-relaxed">{copy.description}</p>
          </div>
        </div>

        {/* Phase 6 risk callout */}
        {phase === 6 && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/5 border border-red-500/20">
            <AlertTriangle size={13} className="text-red-400 mt-0.5 shrink-0" />
            <p className="text-[11px] text-red-300 leading-relaxed">
              Buyers who cannot complete DD or mark up the SPA in time will be excluded. Ensure the dataroom is well-stocked and all Q&A has been addressed before issuing.
            </p>
          </div>
        )}

        {/* Week selector */}
        <div>
          <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-3">Duration from Week {week}</p>
          <div className="grid grid-cols-4 gap-2">
            {WEEKS.map((w) => (
              <button
                key={w}
                onClick={() => setSelected(w)}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border text-center transition-all ${
                  selected === w
                    ? 'bg-accent-soft border-border-accent text-text-accent'
                    : 'bg-surface-default border-border-subtle text-text-secondary hover:border-border-default'
                }`}
              >
                <span className="text-[18px] font-bold">{w}</span>
                <span className="text-[10px] font-mono mt-0.5">{w === 1 ? 'week' : 'weeks'}</span>
                <span className="text-[10px] text-text-muted mt-1">Wk {week + w}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Advisory note */}
        <div className="flex items-start gap-2 p-3 rounded-lg bg-surface-default border border-border-subtle">
          <Clock size={13} className="text-text-muted mt-0.5 shrink-0" />
          <p className="text-[11px] text-text-muted leading-relaxed">{advisory}</p>
        </div>

        {/* CTA */}
        <button
          onClick={() => setPhaseDeadline(selected)}
          className="w-full py-2.5 bg-accent-primary hover:bg-accent-hover text-white text-[13px] font-semibold rounded-lg transition-colors shadow-sm"
        >
          {copy.action}
        </button>
      </div>
    </div>
  );
}
