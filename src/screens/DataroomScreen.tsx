import { useGameStore } from '../store/gameStore';
import Panel from '../components/ui/Panel';
import StatusChip from '../components/ui/StatusChip';
import { Database, Lock, Eye, Unlock, AlertTriangle, Users, CheckCircle2, Info } from 'lucide-react';
import type { DataroomAccessLevel, DataroomCategory } from '../types/game';

// ─── Access level config ────────────────────────────────────────────────────

const ACCESS_LEVELS: { level: DataroomAccessLevel; label: string; icon: React.ReactNode; color: string; bg: string }[] = [
  { level: 'restricted', label: 'Restricted', icon: <Lock size={12} />, color: 'text-state-danger', bg: 'bg-state-danger/10 border-state-danger/30' },
  { level: 'partial',    label: 'Partial',    icon: <Eye size={12} />, color: 'text-state-warning', bg: 'bg-state-warning/10 border-state-warning/30' },
  { level: 'full',       label: 'Full Access', icon: <Unlock size={12} />, color: 'text-state-success', bg: 'bg-state-success/10 border-state-success/30' },
];

const SENSITIVITY_CONFIG = {
  low:      { label: 'Low',      color: 'text-state-success',  variant: 'success' as const },
  medium:   { label: 'Medium',   color: 'text-state-warning',  variant: 'warning' as const },
  high:     { label: 'High',     color: 'text-state-danger',   variant: 'danger' as const },
  critical: { label: 'Critical', color: 'text-text-accent',    variant: 'accent' as const },
};

// ─── Risk summary helpers ────────────────────────────────────────────────────

function computeExposureRisk(categories: DataroomCategory[]): number {
  const weights = { low: 5, medium: 15, high: 30, critical: 50 };
  const multipliers = { restricted: 0, partial: 0.4, full: 1.0 };
  const total = categories.reduce((sum, c) => sum + weights[c.sensitivity] * multipliers[c.accessLevel], 0);
  const max = categories.reduce((sum, c) => sum + weights[c.sensitivity], 0);
  return max > 0 ? Math.round((total / max) * 100) : 0;
}

function computeBuyerReadiness(categories: DataroomCategory[]): number {
  // Buyers need financials, legal, and at least partial on key docs
  const financials = categories.find((c) => c.id === 'dr-financials');
  const legal = categories.find((c) => c.id === 'dr-legal');
  const ops = categories.find((c) => c.id === 'dr-operations');
  let score = 0;
  if (financials?.accessLevel !== 'restricted') score += 40;
  if (legal?.accessLevel !== 'restricted') score += 30;
  if (ops?.accessLevel !== 'restricted') score += 20;
  if (categories.filter((c) => c.accessLevel === 'full').length >= 3) score += 10;
  return Math.min(100, score);
}

// ─── Screen ─────────────────────────────────────────────────────────────────

export default function DataroomScreen() {
  const phase = useGameStore((s) => s.phase);
  const dataroomCategories = useGameStore((s) => s.dataroomCategories);
  const setDataroomAccess = useGameStore((s) => s.setDataroomAccess);
  const buyers = useGameStore((s) => s.buyers);
  const tasks = useGameStore((s) => s.tasks);
  const resources = useGameStore((s) => s.resources);

  if (phase < 5) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Database size={32} className="text-text-muted/20 mx-auto mb-3" />
          <p className="text-[13px] text-text-muted">The data room opens in Phase 5 — Non-Binding Offers.</p>
          <p className="text-[11px] text-text-muted/60 mt-1">Buyers will gain access once shortlisting is complete.</p>
        </div>
      </div>
    );
  }

  const activeBuyers = buyers.filter((b) => !['dropped', 'excluded'].includes(b.status));
  const exposureRisk = computeExposureRisk(dataroomCategories);
  const buyerReadiness = computeBuyerReadiness(dataroomCategories);

  // Q&A related tasks (phase 6 tasks 80-84 are Q&A)
  const ddTasks = tasks.filter((t) => t.phase === 6 && (t.category === 'external_advisor' || t.description?.toLowerCase().includes('q&a') || t.description?.toLowerCase().includes('dataroom') || t.name?.toLowerCase().includes('q&a') || t.name?.toLowerCase().includes('data room')));

  return (
    <div className="space-y-6 max-w-[1200px]">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-semibold text-text-primary">Data Room</h1>
        <p className="text-[12px] text-text-muted mt-1">
          Manage document access levels for due diligence. Balance buyer engagement against information risk.
        </p>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-bg-panel/60 border border-border-subtle rounded-[var(--radius-md)] p-3">
          <p className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-1">Active Buyers in DD</p>
          <p className="text-xl font-semibold font-mono text-text-primary">{activeBuyers.length}</p>
        </div>
        <div className="bg-bg-panel/60 border border-border-subtle rounded-[var(--radius-md)] p-3">
          <p className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-1">Buyer Readiness</p>
          <p className={`text-xl font-semibold font-mono ${buyerReadiness >= 70 ? 'text-state-success' : buyerReadiness >= 40 ? 'text-state-warning' : 'text-state-danger'}`}>
            {buyerReadiness}%
          </p>
        </div>
        <div className="bg-bg-panel/60 border border-border-subtle rounded-[var(--radius-md)] p-3">
          <p className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-1">Exposure Risk</p>
          <p className={`text-xl font-semibold font-mono ${exposureRisk <= 30 ? 'text-state-success' : exposureRisk <= 60 ? 'text-state-warning' : 'text-state-danger'}`}>
            {exposureRisk}%
          </p>
        </div>
        <div className="bg-bg-panel/60 border border-border-subtle rounded-[var(--radius-md)] p-3">
          <p className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-1">Deal Momentum</p>
          <p className={`text-xl font-semibold font-mono ${resources.dealMomentum >= 60 ? 'text-state-success' : resources.dealMomentum >= 35 ? 'text-state-warning' : 'text-state-danger'}`}>
            {resources.dealMomentum}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Access Control Grid */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[13px] font-semibold text-text-primary uppercase tracking-wider">Document Access Control</h2>
            <div className="flex items-center gap-3 text-[10px] text-text-muted font-mono">
              <span className="flex items-center gap-1"><Lock size={10} className="text-state-danger" /> Restricted</span>
              <span className="flex items-center gap-1"><Eye size={10} className="text-state-warning" /> Partial</span>
              <span className="flex items-center gap-1"><Unlock size={10} className="text-state-success" /> Full</span>
            </div>
          </div>

          {dataroomCategories.map((cat) => {
            const sensConfig = SENSITIVITY_CONFIG[cat.sensitivity];

            return (
              <Panel key={cat.id} variant="default" className="p-0 overflow-hidden">
                <div className="flex items-start gap-0">
                  {/* Sensitivity stripe */}
                  <div className={`w-1 self-stretch shrink-0 ${
                    cat.sensitivity === 'critical' ? 'bg-text-accent' :
                    cat.sensitivity === 'high' ? 'bg-state-danger' :
                    cat.sensitivity === 'medium' ? 'bg-state-warning' : 'bg-state-success'
                  }`} />

                  <div className="flex-1 px-4 py-3 flex flex-col md:flex-row md:items-center gap-3">
                    {/* Category info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[13px] font-medium text-text-primary">{cat.name}</span>
                        <StatusChip label={sensConfig.label} variant={sensConfig.variant} />
                      </div>
                      <p className="text-[11px] text-text-muted leading-relaxed">{cat.description}</p>
                    </div>

                    {/* Access level toggle */}
                    <div className="shrink-0 flex items-center gap-1 bg-bg-secondary rounded-[var(--radius-md)] p-0.5">
                      {ACCESS_LEVELS.map((a) => (
                        <button
                          key={a.level}
                          onClick={() => setDataroomAccess(cat.id, a.level)}
                          className={`flex items-center gap-1 px-2.5 py-1.5 rounded text-[11px] font-medium transition-all duration-150 border ${
                            cat.accessLevel === a.level
                              ? `${a.color} ${a.bg}`
                              : 'text-text-muted border-transparent hover:text-text-secondary hover:bg-surface-hover'
                          }`}
                        >
                          {a.icon}
                          <span className="hidden sm:inline">{a.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Risk callout for full access on sensitive docs */}
                {cat.accessLevel === 'full' && (cat.sensitivity === 'high' || cat.sensitivity === 'critical') && (
                  <div className="mx-5 mb-3 px-3 py-2 rounded bg-state-warning/10 border border-state-warning/20 flex items-center gap-2">
                    <AlertTriangle size={12} className="text-state-warning shrink-0" />
                    <p className="text-[11px] text-state-warning">
                      {cat.sensitivity === 'critical'
                        ? 'Critical data fully exposed. Consider restricting once buyers have reviewed key sections.'
                        : 'High sensitivity data fully exposed. Monitor buyer behaviour closely.'}
                    </p>
                  </div>
                )}
              </Panel>
            );
          })}
        </div>

        {/* Right sidebar: Buyer DD Status + Q&A Tasks */}
        <div className="space-y-4">
          {/* Buyer DD Status */}
          <Panel variant="elevated">
            <div className="flex items-center gap-2 mb-3">
              <Users size={14} className="text-text-muted" />
              <h3 className="text-[12px] font-semibold text-text-primary uppercase tracking-wider">Buyer DD Status</h3>
            </div>
            {activeBuyers.length === 0 ? (
              <p className="text-[12px] text-text-muted">No active buyers.</p>
            ) : (
              <div className="space-y-2">
                {activeBuyers.map((buyer) => {
                  const frictionColor = buyer.ddFriction === 'high' ? 'text-state-danger' : buyer.ddFriction === 'medium' ? 'text-state-warning' : 'text-state-success';
                  const dropRisk = buyer.ddFriction === 'high' && exposureRisk < 30;

                  return (
                    <div key={buyer.id} className="flex items-center justify-between py-2 border-b border-border-subtle/40 last:border-0">
                      <div>
                        <p className="text-[12px] font-medium text-text-primary">{buyer.name}</p>
                        <p className="text-[10px] text-text-muted">{buyer.type === 'pe' ? 'PE' : 'Strategic'} · {buyer.geography}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-[11px] font-medium ${frictionColor}`}>
                          {buyer.ddFriction === 'high' ? '⚠ High Friction' : buyer.ddFriction === 'medium' ? '~ Medium' : '✓ Low Friction'}
                        </p>
                        {dropRisk && (
                          <p className="text-[10px] text-state-danger">Risk: may drop</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Panel>

          {/* DD Advisory tip */}
          <Panel variant="default" className="bg-state-info/5 border-state-info/20">
            <div className="flex items-start gap-2">
              <Info size={13} className="text-state-info shrink-0 mt-0.5" />
              <p className="text-[11px] text-text-muted leading-relaxed">
                Buyers with <strong className="text-text-secondary">high DD friction</strong> need access to Financials, Legal, and Operational data to stay engaged. Opening <strong className="text-text-secondary">critical or high-sensitivity</strong> categories builds conviction but increases deal risk — manage the balance.
              </p>
            </div>
          </Panel>

          {/* Q&A Tasks */}
          {ddTasks.length > 0 && (
            <Panel variant="elevated">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 size={14} className="text-text-muted" />
                <h3 className="text-[12px] font-semibold text-text-primary uppercase tracking-wider">Q&A Tasks</h3>
              </div>
              <div className="space-y-2">
                {ddTasks.map((t) => (
                  <div key={t.id} className="flex items-start gap-2 py-1.5 border-b border-border-subtle/40 last:border-0">
                    <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${t.status === 'completed' ? 'bg-state-success' : t.status === 'in_progress' ? 'bg-state-warning' : 'bg-border-subtle'}`} />
                    <div>
                      <p className="text-[12px] text-text-primary">{t.name}</p>
                      <p className="text-[10px] text-text-muted capitalize">{t.status.replace('_', ' ')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}
