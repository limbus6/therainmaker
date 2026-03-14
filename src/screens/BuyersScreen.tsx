import { useGameStore } from '../store/gameStore';
import Panel from '../components/ui/Panel';
import StatusChip from '../components/ui/StatusChip';
import { Briefcase, Users } from 'lucide-react';
import type { BuyerInterest, BuyerStatus } from '../types/game';

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
  const phase = useGameStore((s) => s.phase);

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

          {/* Buyer Table */}
          <Panel title="Buyer Pipeline">
            <div className="overflow-x-auto -mx-1">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-border-subtle">
                  {['Name', 'Type', 'Geography', 'Interest', 'Status', 'Valuation', 'Exec. Cred.'].map((h) => (
                    <th key={h} className="text-left text-[10px] font-mono uppercase tracking-wider text-text-muted pb-2 px-2">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {buyers.map((buyer) => (
                  <tr key={buyer.id} className="border-b border-border-subtle/50 hover:bg-surface-hover transition-colors cursor-pointer">
                    <td className="py-2.5 px-2 text-[12px] font-medium text-text-primary">{buyer.name}</td>
                    <td className="py-2.5 px-2"><StatusChip label={buyer.type.replace('_', ' ')} /></td>
                    <td className="py-2.5 px-2 text-[12px] text-text-secondary">{buyer.geography}</td>
                    <td className="py-2.5 px-2"><StatusChip label={buyer.interest.replace('_', ' ')} variant={interestVariant[buyer.interest]} /></td>
                    <td className="py-2.5 px-2"><StatusChip label={buyer.status.replace('_', ' ')} variant={statusVariant[buyer.status]} /></td>
                    <td className="py-2.5 px-2 text-[12px] text-text-secondary capitalize">{buyer.valuationPosture}</td>
                    <td className="py-2.5 px-2 text-[12px] font-mono text-text-muted">{buyer.executionCredibility}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </Panel>
        </>
      )}
    </div>
  );
}
