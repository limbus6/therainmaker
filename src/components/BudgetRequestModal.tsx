import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { BUDGET_LOW_THRESHOLD } from '../config/phaseBudgets';
import { PHASE_NAMES } from '../types/game';
import { X, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export default function BudgetRequestModal({ onClose }: Props) {
  const phase = useGameStore((s) => s.phase);
  const resources = useGameStore((s) => s.resources);
  const phaseBudget = useGameStore((s) => s.phaseBudget);
  const budgetRequests = useGameStore((s) => s.budgetRequests);
  const requestBudget = useGameStore((s) => s.requestBudget);

  const [amount, setAmount] = useState(10);
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const PRESET_REASONS = [
    { id: 'legal', label: 'Legal escalation', text: 'Unexpected legal complexity' },
    { id: 'valuation', label: 'Valuation support', text: 'Strengthen valuation positioning' },
    { id: 'mgmt', label: 'Management prep', text: 'Prepare management for buyer sessions' },
    { id: 'specialist', label: 'External specialist', text: 'Bring in specialist support' },
    { id: 'client', label: 'Client relationship', text: 'Protect client trust in a critical phase' },
    { id: 'contingency', label: 'Process contingency', text: 'Cover process extension and complications' },
    { id: 'dataroom', label: 'Dataroom / DD support', text: 'Support dataroom and DD response load' },
    { id: 'advisor', label: 'Third-party advisor', text: 'Fund third-party advisor work' },
  ];

  const justification = selectedReasons
    .map((id) => PRESET_REASONS.find((r) => r.id === id)?.text ?? '')
    .filter(Boolean)
    .join(' | ');

  function toggleReason(id: string) {
    setSelectedReasons((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  }

  const pendingRequest = budgetRequests.find(
    (r) => r.status === 'pending' && r.phase === phase
  );
  const lastResolved = budgetRequests
    .filter((r) => r.phase === phase && r.status !== 'pending')
    .at(-1);

  const isBudgetLow = resources.budget < BUDGET_LOW_THRESHOLD;

  const handleSubmit = () => {
    if (amount < 1 || selectedReasons.length === 0) return;
    requestBudget(amount, justification.trim());
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-bg-secondary border border-border-subtle rounded-[var(--radius-lg)] shadow-[var(--shadow-heavy)] w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle">
          <div>
            <h2 className="text-[15px] font-semibold text-text-primary">Request Additional Budget</h2>
            <p className="text-[12px] text-text-muted mt-0.5">{PHASE_NAMES[phase]} · Board Approval Required</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-[var(--radius-md)] hover:bg-surface-hover text-text-muted hover:text-text-primary transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Budget status */}
          <div className={`rounded-[var(--radius-md)] border p-3 ${isBudgetLow ? 'bg-red-500/10 border-red-500/30' : 'bg-accent-soft border-accent-primary/20'}`}>
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-text-muted">Current budget</span>
              <span className={`font-mono font-semibold ${isBudgetLow ? 'text-red-400' : 'text-text-accent'}`}>
                €{resources.budget}k
              </span>
            </div>
            <div className="flex items-center justify-between text-[12px] mt-1">
              <span className="text-text-muted">Phase base allocated</span>
              <span className="font-mono text-text-secondary">€{phaseBudget.phaseBase}k</span>
            </div>
            <div className="flex items-center justify-between text-[12px] mt-1">
              <span className="text-text-muted">Carried over from previous phase</span>
              <span className="font-mono text-text-secondary">€{phaseBudget.carryover}k</span>
            </div>
          </div>

          {/* Pending request warning */}
          {pendingRequest && (
            <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-[var(--radius-md)] text-[12px]">
              <Clock size={14} className="text-yellow-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-yellow-300 font-medium">Request pending board review</p>
                <p className="text-text-muted mt-0.5">€{pendingRequest.amount}k requested · Awaiting decision next week.</p>
              </div>
            </div>
          )}

          {/* Last resolved */}
          {lastResolved && !pendingRequest && (
            <div className={`flex items-start gap-2 p-3 rounded-[var(--radius-md)] border text-[12px] ${lastResolved.status === 'approved' ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
              {lastResolved.status === 'approved'
                ? <CheckCircle size={14} className="text-green-400 shrink-0 mt-0.5" />
                : <AlertTriangle size={14} className="text-red-400 shrink-0 mt-0.5" />
              }
              <span className={lastResolved.status === 'approved' ? 'text-green-300' : 'text-red-300'}>
                Last request {lastResolved.status === 'approved'
                  ? `approved — €${lastResolved.approvedAmount}k added.`
                  : 'rejected by the board.'}
              </span>
            </div>
          )}

          {!pendingRequest && !submitted && (
            <>
              {/* Amount */}
              <div>
                <label className="block text-[12px] font-medium text-text-secondary mb-1.5">
                  Amount requested <span className="text-text-muted">(k€)</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={5}
                    max={50}
                    step={5}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="flex-1 accent-[var(--color-accent-primary)]"
                  />
                  <span className="font-mono font-semibold text-text-accent text-[14px] w-12 text-right">€{amount}k</span>
                </div>
              </div>

              {/* Justification — multi-select presets */}
              <div>
                <label className="block text-[12px] font-medium text-text-secondary mb-2">
                  Reason <span className="text-text-muted">(select all that apply)</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {PRESET_REASONS.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => toggleReason(r.id)}
                      className={`text-left px-3 py-2 rounded-[var(--radius-md)] border text-[12px] transition-all ${
                        selectedReasons.includes(r.id)
                          ? 'bg-accent-soft border-accent-primary/40 text-text-accent'
                          : 'bg-bg-primary border-border-subtle text-text-muted hover:text-text-secondary hover:border-border-subtle/80'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
                {selectedReasons.length > 0 && (
                  <p className="text-[11px] text-text-muted mt-2 leading-relaxed">{justification}</p>
                )}
              </div>

              <button
                onClick={handleSubmit}
                disabled={amount < 1 || selectedReasons.length === 0}
                className="w-full py-2.5 rounded-[var(--radius-md)] bg-accent-primary text-white font-medium text-[13px] hover:bg-accent-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Submit to Board
              </button>
            </>
          )}

          {submitted && (
            <div className="flex items-center gap-2 p-3 bg-accent-soft border border-accent-primary/20 rounded-[var(--radius-md)]">
              <CheckCircle size={16} className="text-text-accent" />
              <div>
                <p className="text-[13px] font-medium text-text-accent">Request submitted</p>
                <p className="text-[11px] text-text-muted mt-0.5">The board will respond in the next week advance.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
