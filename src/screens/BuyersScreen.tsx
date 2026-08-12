import { useGameStore } from '../store/gameStore';
import Panel from '../components/ui/Panel';
import StatusChip from '../components/ui/StatusChip';
import { Briefcase, CheckCircle2, UserMinus, UserPlus, Users } from 'lucide-react';
import type { BuyerInterest, BuyerStatus } from '../types/game';
import { getBuyerOfferLabel } from '../utils/gameplayState';
import { getShortlistEligibleStatuses, isShortlistFallbackActive } from '../utils/shortlistEligibility';

const interestVariant: Record<BuyerInterest, 'muted' | 'default' | 'info' | 'warning' | 'danger'> = {
  cold: 'muted',
  lukewarm: 'default',
  warm: 'info',
  hot: 'warning',
  on_fire: 'danger',
};

const statusVariant: Record<BuyerStatus, 'muted' | 'default' | 'info' | 'success' | 'warning' | 'danger' | 'accent'> = {
  identified: 'muted',
  contacted: 'default',
  nda_signed: 'info',
  reviewing: 'info',
  active: 'accent',
  shortlisted: 'accent',
  bidding: 'warning',
  preferred: 'success',
  dropped: 'danger',
  excluded: 'danger',
};

export default function BuyersScreen() {
  const buyers = useGameStore((s) => s.buyers);
  const finalOffers = useGameStore((s) => s.finalOffers);
  const phase = useGameStore((s) => s.phase);
  const tasks = useGameStore((s) => s.tasks);
  const setBuyerShortlisted = useGameStore((s) => s.setBuyerShortlisted);
  const shortlistCount = buyers.filter((buyer) => buyer.status === 'shortlisted').length;
  const shortlistAnalysisReady = tasks.some((task) => (
    task.phase === 4 && task.id === 'task-60' && task.status === 'completed'
  ));
  const eligibleStatuses = getShortlistEligibleStatuses(buyers);
  const eligibilityFallbackActive = phase === 4 && isShortlistFallbackActive(buyers);

  return (
    <div className="space-y-6 max-w-[1200px]">
      <div>
        <h1 className="text-2xl font-display font-semibold text-text-primary">Buyers</h1>
        <p className="text-[12px] text-text-muted mt-1">Manage the buyer universe and track engagement</p>
      </div>

      {buyers.length === 0 ? (
        <Panel variant="elevated" className="py-16">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-surface-default border border-border-subtle flex items-center justify-center mx-auto mb-4">
              <Briefcase size={28} className="text-text-muted/30" />
            </div>
            <h2 className="text-lg font-display font-semibold text-text-secondary mb-2">No Buyers Identified Yet</h2>
            <p className="text-[13px] text-text-muted max-w-md mx-auto">
              {phase < 2
                ? 'Buyer identification begins during the Pitch & Mandate phase. Complete origination and win the mandate first.'
                : 'Begin buyer outreach to populate the pipeline.'}
            </p>
          </div>
        </Panel>
      ) : (
        <>
          {/* Funnel Summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'Total Identified', count: buyers.length, icon: <Users size={16} /> },
              { label: 'Active / Engaged', count: buyers.filter((b) => ['active', 'shortlisted', 'bidding', 'preferred'].includes(b.status)).length },
              { label: 'Shortlisted', count: buyers.filter((b) => b.status === 'shortlisted' || b.status === 'bidding').length },
              { label: 'Dropped', count: buyers.filter((b) => b.status === 'dropped' || b.status === 'excluded').length },
            ].map((item) => (
              <Panel key={item.label}>
                <div className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-1">{item.label}</div>
                <div className="text-xl font-mono font-semibold text-text-primary">{item.count}</div>
              </Panel>
            ))}
          </div>

          {phase === 4 && (
            <Panel title="Provisional Shortlist" variant="elevated">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className={shortlistCount >= 2 ? 'text-state-success' : 'text-state-warning'} />
                    <p className="text-[13px] font-semibold text-text-primary">
                      {shortlistCount} buyer{shortlistCount === 1 ? '' : 's'} selected <span className="font-normal text-text-muted">(minimum 2 · maximum 5)</span>
                    </p>
                  </div>
                  <p className="mt-1 text-[11px] text-text-muted">
                    {shortlistAnalysisReady
                      ? shortlistCount >= 2
                        ? 'The phase gate has enough shortlisted buyers. You can still refine the list before advancing.'
                        : 'Choose at least two engaged buyers below. You do not need to wait for another task or event.'
                      : 'Complete Score Buyer Seriousness before selecting the buyers that advance.'}
                  </p>
                </div>
                <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider ${
                  shortlistCount >= 2
                    ? 'border-state-success/30 bg-state-success/10 text-state-success'
                    : 'border-state-warning/30 bg-state-warning/10 text-state-warning'
                }`}>
                  {shortlistCount >= 2 ? 'Gate ready' : `${2 - shortlistCount} still needed`}
                </span>
              </div>
              {eligibilityFallbackActive && (
                <p className="mt-3 border-t border-border-subtle pt-3 text-[11px] leading-relaxed text-state-warning">
                  No buyer reached full NDA engagement during outreach, so the usual bar is relaxed for this run: buyers
                  {eligibleStatuses[0] === 'contacted' ? ' who were at least contacted' : ' as identified so far'} can be shortlisted here so the process is never stuck.
                </p>
              )}
            </Panel>
          )}

          {/* Buyer Table */}
          <Panel title="Buyer Pipeline">
            <div className="overflow-x-auto -mx-1">
            <table className={`w-full ${phase === 4 ? 'min-w-[720px]' : 'min-w-[600px]'}`}>
              <thead>
                <tr className="border-b border-border-subtle">
                  {['Name', 'Type', 'Geography', 'Interest', 'Status', 'Valuation / Offer', 'Exec. Cred.', ...(phase === 4 ? ['Decision'] : [])].map((h) => (
                    <th key={h} className="text-left text-[10px] font-mono uppercase tracking-wider text-text-muted pb-2 px-2">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {buyers.map((buyer) => {
                  const isShortlisted = buyer.status === 'shortlisted';
                  const canEnterShortlist = eligibleStatuses.includes(buyer.status);
                  const shortlistFull = shortlistCount >= 5 && !isShortlisted;
                  const decisionDisabled = !shortlistAnalysisReady || (!isShortlisted && (!canEnterShortlist || shortlistFull));

                  return (
                  <tr key={buyer.id} className="border-b border-border-subtle/50 hover:bg-surface-hover transition-colors">
                    <td className="py-2.5 px-2 text-[12px] font-medium text-text-primary">{buyer.name}</td>
                    <td className="py-2.5 px-2"><StatusChip label={buyer.type.replace('_', ' ')} /></td>
                    <td className="py-2.5 px-2 text-[12px] text-text-secondary">{buyer.geography}</td>
                    <td className="py-2.5 px-2"><StatusChip label={buyer.interest.replace('_', ' ')} variant={interestVariant[buyer.interest]} /></td>
                    <td className="py-2.5 px-2"><StatusChip label={buyer.status.replace('_', ' ')} variant={statusVariant[buyer.status]} /></td>
                    <td className="py-2.5 px-2 text-[12px] text-text-secondary">{getBuyerOfferLabel(buyer, finalOffers)}</td>
                    <td className="py-2.5 px-2 text-[12px] font-mono text-text-muted">{buyer.executionCredibility}%</td>
                    {phase === 4 && (() => {
                      const disabledReason = !shortlistAnalysisReady
                        ? 'Complete Score Buyer Seriousness first'
                        : shortlistFull
                          ? 'Shortlist is limited to five buyers'
                          : !isShortlisted && !canEnterShortlist
                            ? eligibleStatuses[0] === 'nda_signed'
                              ? 'Needs an NDA before it can be shortlisted'
                              : eligibleStatuses[0] === 'contacted'
                                ? 'Not contacted during outreach'
                                : 'No engagement recorded during outreach'
                            : undefined;
                      return (
                        <td className="py-2.5 px-2">
                          <div className="flex flex-col items-start gap-1">
                            <button
                              type="button"
                              onClick={() => setBuyerShortlisted(buyer.id, !isShortlisted)}
                              disabled={decisionDisabled}
                              title={disabledReason}
                              className={`inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border px-2.5 py-1.5 text-[11px] font-semibold transition-colors ${
                                isShortlisted
                                  ? 'border-state-danger/30 bg-state-danger/5 text-state-danger hover:bg-state-danger/10'
                                  : decisionDisabled
                                    ? 'cursor-not-allowed border-border-subtle bg-surface-default text-text-muted/50'
                                    : 'border-border-accent bg-border-accent/10 text-text-accent hover:bg-border-accent/20'
                              }`}
                            >
                              {isShortlisted ? <UserMinus size={11} /> : <UserPlus size={11} />}
                              {isShortlisted ? 'Remove' : 'Shortlist'}
                            </button>
                            {disabledReason && (
                              <span className="text-[10px] leading-tight text-text-muted">{disabledReason}</span>
                            )}
                          </div>
                        </td>
                      );
                    })()}
                  </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          </Panel>
        </>
      )}
    </div>
  );
}
