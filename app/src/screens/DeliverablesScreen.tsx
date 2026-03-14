import { useGameStore } from '../store/gameStore';
import Panel from '../components/ui/Panel';
import ProgressBar from '../components/ui/ProgressBar';
import StatusChip from '../components/ui/StatusChip';
import type { DeliverableStatus, QualityTier } from '../types/game';

const statusVariant: Record<DeliverableStatus, 'muted' | 'info' | 'warning' | 'accent' | 'success'> = {
  not_started: 'muted',
  drafting: 'info',
  in_review: 'accent',
  revision: 'warning',
  approved: 'success',
  delivered: 'success',
};

const qualityVariant: Record<QualityTier, 'danger' | 'warning' | 'info' | 'success'> = {
  poor: 'danger',
  adequate: 'warning',
  good: 'info',
  excellent: 'success',
};

export default function DeliverablesScreen() {
  const deliverables = useGameStore((s) => s.deliverables);

  return (
    <div className="space-y-6 max-w-[1200px]">
      <div>
        <h1 className="text-2xl font-display font-semibold text-text-primary">Deliverables</h1>
        <p className="text-[12px] text-text-muted mt-1">Track all formal process outputs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {deliverables.map((del) => (
          <Panel key={del.id} variant={del.status === 'in_review' || del.status === 'revision' ? 'accent' : 'default'}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-[14px] font-semibold text-text-primary">{del.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <StatusChip label={del.status.replace('_', ' ')} variant={statusVariant[del.status]} />
                  <StatusChip label={`Quality: ${del.quality}`} variant={qualityVariant[del.quality]} />
                </div>
              </div>
            </div>
            <ProgressBar value={del.completion} color={del.completion === 100 ? 'success' : 'accent'} size="md" showLabel />
            {del.owner && (
              <div className="text-[10px] font-mono text-text-muted mt-2">Owner: {del.owner}</div>
            )}
          </Panel>
        ))}
      </div>
    </div>
  );
}
