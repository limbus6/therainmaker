import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { X, CheckCircle, XCircle, Clock, FileText, TrendingUp } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export default function BoardSubmissionModal({ onClose }: Props) {
  const resources = useGameStore((s) => s.resources);
  const qualificationNotes = useGameStore((s) => s.qualificationNotes);
  const boardSubmission = useGameStore((s) => s.boardSubmission);
  const submitBoardRecommendation = useGameStore((s) => s.submitBoardRecommendation);

  const [recommendation, setRecommendation] = useState<'proceed' | 'decline'>('proceed');
  const [rationale, setRationale] = useState('');

  const positiveNotes = qualificationNotes.filter((n) => n.sentiment === 'positive').length;
  const negativeNotes = qualificationNotes.filter((n) => n.sentiment === 'negative').length;
  const qualScore = qualificationNotes.length >= 2 && resources.clientTrust > 40 && resources.dealMomentum > 30;

  const canSubmit =
    !boardSubmission &&
    rationale.trim().length >= 50 &&
    qualificationNotes.length >= 1;

  const handleSubmit = () => {
    if (!canSubmit) return;
    submitBoardRecommendation(recommendation, rationale.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-bg-secondary border border-border-subtle rounded-[var(--radius-lg)] shadow-[var(--shadow-heavy)] w-full max-w-2xl mx-4 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle shrink-0">
          <div>
            <h2 className="text-[15px] font-semibold text-text-primary">Board Recommendation</h2>
            <p className="text-[12px] text-text-muted mt-0.5">Should we pursue the Solara Systems mandate?</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-[var(--radius-md)] hover:bg-surface-hover text-text-muted hover:text-text-primary transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-5">
          {/* Board submission status */}
          {boardSubmission && (
            <div className={`flex items-start gap-3 p-4 rounded-[var(--radius-md)] border ${
              boardSubmission.status === 'pending' ? 'bg-yellow-500/10 border-yellow-500/30' :
              boardSubmission.status === 'approved' ? 'bg-green-500/10 border-green-500/30' :
              'bg-red-500/10 border-red-500/30'
            }`}>
              {boardSubmission.status === 'pending' && <Clock size={16} className="text-yellow-400 shrink-0 mt-0.5" />}
              {boardSubmission.status === 'approved' && <CheckCircle size={16} className="text-green-400 shrink-0 mt-0.5" />}
              {boardSubmission.status === 'rejected' && <XCircle size={16} className="text-red-400 shrink-0 mt-0.5" />}
              <div>
                <p className={`text-[13px] font-medium ${
                  boardSubmission.status === 'pending' ? 'text-yellow-300' :
                  boardSubmission.status === 'approved' ? 'text-green-300' : 'text-red-300'
                }`}>
                  {boardSubmission.status === 'pending' && 'Awaiting board decision'}
                  {boardSubmission.status === 'approved' && 'Board approved — proceed to Pitch & Mandate'}
                  {boardSubmission.status === 'rejected' && 'Board rejected — additional qualification needed'}
                </p>
                {boardSubmission.boardNotes && (
                  <p className="text-[12px] text-text-muted mt-1 italic">"{boardSubmission.boardNotes}"</p>
                )}
              </div>
            </div>
          )}

          {/* Qualification signals */}
          <div>
            <h3 className="text-[12px] font-semibold text-text-muted uppercase tracking-widest mb-3">Qualification Signals</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Client Trust', value: resources.clientTrust, threshold: 40 },
                { label: 'Deal Momentum', value: resources.dealMomentum, threshold: 30 },
                { label: 'Research Notes', value: qualificationNotes.length, threshold: 2, max: 5 },
              ].map(({ label, value, threshold, max = 100 }) => {
                const pct = Math.min(100, (value / max) * 100);
                const ok = value >= threshold;
                return (
                  <div key={label} className={`p-3 rounded-[var(--radius-md)] border ${ok ? 'border-green-500/30 bg-green-500/5' : 'border-yellow-500/30 bg-yellow-500/5'}`}>
                    <div className="text-[11px] text-text-muted mb-1">{label}</div>
                    <div className={`text-[18px] font-mono font-bold ${ok ? 'text-green-400' : 'text-yellow-400'}`}>{value}{max === 100 ? '' : ''}</div>
                    <div className="h-1 bg-bg-primary rounded-full mt-2 overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${ok ? 'bg-green-500' : 'bg-yellow-500'}`} style={{ width: `${pct}%` }} />
                    </div>
                    {!ok && <p className="text-[10px] text-yellow-500/80 mt-1">min {threshold}</p>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Qualification notes log */}
          {qualificationNotes.length > 0 && (
            <div>
              <h3 className="text-[12px] font-semibold text-text-muted uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <FileText size={12} />
                Qualification Notes ({qualificationNotes.length})
              </h3>
              <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                {qualificationNotes.map((note) => (
                  <div key={note.id} className="flex items-start gap-2 p-2.5 bg-bg-primary rounded-[var(--radius-md)]">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${
                      note.sentiment === 'positive' ? 'bg-green-400' :
                      note.sentiment === 'negative' ? 'bg-red-400' : 'bg-yellow-400'
                    }`} />
                    <div>
                      <p className="text-[12px] text-text-secondary">{note.content}</p>
                      <p className="text-[10px] text-text-muted mt-0.5 capitalize">{note.source.replace('_', ' ')} · Week {note.week}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-2 text-[11px]">
                <span className="text-green-400">{positiveNotes} positive</span>
                <span className="text-text-muted">·</span>
                <span className="text-red-400">{negativeNotes} concern{negativeNotes !== 1 ? 's' : ''}</span>
              </div>
            </div>
          )}

          {qualificationNotes.length === 0 && (
            <div className="p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-[var(--radius-md)] text-[12px] text-yellow-400">
              Complete at least one research or meeting task before submitting to the board.
            </div>
          )}

          {!boardSubmission && (
            <>
              {/* Recommendation */}
              <div>
                <h3 className="text-[12px] font-semibold text-text-muted uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <TrendingUp size={12} />
                  My Recommendation
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {(['proceed', 'decline'] as const).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setRecommendation(opt)}
                      className={`py-3 rounded-[var(--radius-md)] border text-[13px] font-medium transition-all ${
                        recommendation === opt
                          ? opt === 'proceed'
                            ? 'bg-green-500/15 border-green-500/40 text-green-300'
                            : 'bg-red-500/15 border-red-500/40 text-red-300'
                          : 'bg-bg-primary border-border-subtle text-text-muted hover:text-text-secondary hover:border-border-subtle/80'
                      }`}
                    >
                      {opt === 'proceed' ? '✓ Proceed to Pitch' : '✕ Decline Opportunity'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rationale */}
              <div>
                <label className="block text-[12px] font-medium text-text-secondary mb-1.5">
                  Rationale <span className="text-text-muted">(min 50 characters)</span>
                </label>
                <textarea
                  value={rationale}
                  onChange={(e) => setRationale(e.target.value)}
                  placeholder={recommendation === 'proceed'
                    ? 'Explain why Solara Systems represents a strong mandate opportunity...'
                    : 'Explain why we should not pursue this opportunity at this time...'
                  }
                  rows={4}
                  className="w-full bg-bg-primary border border-border-subtle rounded-[var(--radius-md)] px-3 py-2.5 text-[13px] text-text-primary placeholder:text-text-muted/50 resize-none focus:outline-none focus:border-accent-primary/50 transition-colors"
                />
                <p className="text-[11px] text-text-muted mt-1">{rationale.length} / 50 min characters</p>
              </div>

              {!qualScore && qualificationNotes.length >= 1 && (
                <p className="text-[11px] text-yellow-400/80">
                  ⚠ Board approval is more likely if trust, momentum, and research signals are stronger.
                  Completing more Phase 0 tasks before submitting improves your odds.
                </p>
              )}

              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="w-full py-2.5 rounded-[var(--radius-md)] bg-accent-primary text-white font-medium text-[13px] hover:bg-accent-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Submit to Board
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
