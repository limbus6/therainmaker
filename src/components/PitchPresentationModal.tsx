import { useGameStore } from '../store/gameStore';
import { X, Presentation, TrendingUp, BarChart3 } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export default function PitchPresentationModal({ onClose }: Props) {
  const client = useGameStore((s) => s.client);
  const week = useGameStore((s) => s.week);
  const resources = useGameStore((s) => s.resources);
  const feeNegotiation = useGameStore((s) => s.feeNegotiation);
  const presentPitch = useGameStore((s) => s.presentPitch);

  const alreadyPresented = feeNegotiation?.pitchPresented;

  const handlePresent = () => {
    presentPitch();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-bg-secondary border border-border-subtle rounded-[var(--radius-lg)] shadow-[var(--shadow-heavy)] w-full max-w-xl mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[var(--radius-md)] bg-accent-soft flex items-center justify-center">
              <Presentation size={16} className="text-text-accent" />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-text-primary">Pitch Presentation</h2>
              <p className="text-[12px] text-text-muted">Present your advisory proposal to {client.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-[var(--radius-md)] hover:bg-surface-hover text-text-muted hover:text-text-primary transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Pitch summary card */}
          <div className="bg-bg-primary border border-border-subtle rounded-[var(--radius-md)] overflow-hidden">
            <div className="px-4 py-3 border-b border-border-subtle/50 flex items-center justify-between">
              <h3 className="text-[12px] font-semibold text-text-secondary uppercase tracking-widest">Pitch Summary</h3>
              <span className="text-[10px] text-text-muted">Week {week}</span>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] text-text-muted">Company</p>
                  <p className="text-[14px] font-semibold text-text-primary">{client.companyName}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-text-muted">Sector</p>
                  <p className="text-[13px] text-text-secondary">{client.sector}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 bg-bg-secondary rounded-[var(--radius-sm)]">
                  <div className="flex items-center gap-1.5 text-[10px] text-text-muted mb-1">
                    <TrendingUp size={10} />
                    Valuation Target
                  </div>
                  <p className="text-[13px] font-semibold text-text-primary">{client.valuationExpectation}</p>
                </div>
                <div className="p-3 bg-bg-secondary rounded-[var(--radius-sm)]">
                  <div className="flex items-center gap-1.5 text-[10px] text-text-muted mb-1">
                    <BarChart3 size={10} />
                    Client Trust Score
                  </div>
                  <p className="text-[13px] font-semibold text-text-primary">{resources.clientTrust}<span className="text-[10px] text-text-muted font-normal">/100</span></p>
                </div>
              </div>

              <div className="pt-1">
                <p className="text-[11px] text-text-muted mb-1.5">Client Objectives</p>
                <ul className="space-y-1">
                  {client.objectives.map((obj, i) => (
                    <li key={i} className="flex items-center gap-1.5 text-[12px] text-text-secondary">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-primary/60 shrink-0" />
                      {obj}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-1">
                <p className="text-[11px] text-text-muted mb-1.5">Proposed Process</p>
                <p className="text-[12px] text-text-secondary leading-relaxed">
                  Structured M&A process: targeted buyer outreach across strategic and financial acquirers, 
                  competitive tension through parallel discussions, value maximisation through preparation 
                  quality and negotiation positioning. End-to-end support through Signing and Closing.
                </p>
              </div>
            </div>
          </div>

          {/* Action */}
          {alreadyPresented ? (
            <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-[var(--radius-md)]">
              <span className="text-green-400 text-lg">✓</span>
              <div>
                <p className="text-[13px] font-medium text-green-300">Pitch presented to {client.name}</p>
                <p className="text-[11px] text-text-muted mt-0.5">You can now open fee negotiation.</p>
              </div>
            </div>
          ) : (
            <>
              <p className="text-[12px] text-text-muted leading-relaxed">
                Presenting the pitch to {client.name} is a prerequisite to fee negotiation. 
                Once presented, Ricardo will have an initial reaction and you can begin discussing mandate terms.
              </p>
              <button
                onClick={handlePresent}
                className="w-full py-3 bg-accent-primary text-white font-semibold text-[14px] rounded-[var(--radius-md)] hover:bg-accent-primary/90 transition-all hover:shadow-lg hover:shadow-accent-primary/20 flex items-center justify-center gap-2"
              >
                <Presentation size={16} />
                Present Pitch to {client.name}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
