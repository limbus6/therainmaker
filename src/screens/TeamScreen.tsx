import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import Panel from '../components/ui/Panel';
import ProgressBar from '../components/ui/ProgressBar';
import StatusChip from '../components/ui/StatusChip';
import StaffingModal from '../components/StaffingModal';
import { User, Plus, X } from 'lucide-react';

export default function TeamScreen() {
  const team = useGameStore((s) => s.team);
  const resources = useGameStore((s) => s.resources);
  const tasks = useGameStore((s) => s.tasks);
  const tempCapacityAllocations = useGameStore((s) => s.tempCapacityAllocations);
  const releaseTempCapacity = useGameStore((s) => s.releaseTempCapacity);

  const [showStaffing, setShowStaffing] = useState(false);

  const permanentTeam = team.filter((m) => !m.isContractor);

  return (
    <div className="space-y-6 max-w-[1200px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-semibold text-text-primary">Team</h1>
          <p className="text-[12px] text-text-muted mt-1">Manage capacity, morale, and allocation</p>
        </div>
        <button
          onClick={() => setShowStaffing(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-[var(--radius-md)] bg-accent-primary text-bg-primary text-[13px] font-medium hover:bg-accent-hover transition-colors"
        >
          <Plus size={14} />
          Add Resource
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Panel>
          <div className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-1">Total Capacity</div>
          <div className="text-xl font-mono font-semibold text-text-primary">{resources.teamCapacity}%</div>
          <ProgressBar value={resources.teamCapacity} color={resources.teamCapacity > 60 ? 'success' : resources.teamCapacity > 30 ? 'warning' : 'danger'} size="md" />
        </Panel>
        <Panel>
          <div className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-1">Team Morale</div>
          <div className="text-xl font-mono font-semibold text-text-primary">{resources.morale}</div>
          <ProgressBar value={resources.morale} color={resources.morale > 60 ? 'success' : 'warning'} size="md" />
        </Panel>
        <Panel>
          <div className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-1">Team Size</div>
          <div className="text-xl font-mono font-semibold text-text-primary">{permanentTeam.length}</div>
        </Panel>
      </div>

      {/* Permanent Team Members */}
      <Panel title="Team Members">
        <div className="space-y-3">
          {permanentTeam.map((member) => (
            <div key={member.id} className="flex items-center gap-4 p-3 rounded-[var(--radius-md)] bg-surface-default border border-border-subtle hover:border-border-default transition-colors">
              <div className="w-10 h-10 rounded-full bg-bg-elevated flex items-center justify-center shrink-0">
                <User size={18} className="text-text-muted" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-medium text-text-primary">{member.name}</span>
                  <StatusChip label={member.seniority} variant={member.seniority === 'partner' ? 'accent' : member.seniority === 'senior' ? 'info' : 'muted'} />
                </div>
                <div className="text-[11px] text-text-muted">{member.role}</div>
              </div>
              <div className="flex items-center gap-6 shrink-0">
                <div className="w-24">
                  <div className="text-[10px] font-mono text-text-muted mb-1">Load</div>
                  <ProgressBar value={member.currentLoad} color={member.currentLoad > 80 ? 'danger' : member.currentLoad > 50 ? 'warning' : 'success'} showLabel />
                </div>
                <div className="w-24">
                  <div className="text-[10px] font-mono text-text-muted mb-1">Morale</div>
                  <ProgressBar value={member.morale} color={member.morale > 60 ? 'success' : 'warning'} showLabel />
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-mono text-text-muted">Capacity</div>
                  <div className="text-[13px] font-mono font-semibold text-text-primary">{member.capacity}%</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      {/* Active Contractors */}
      {tempCapacityAllocations.length > 0 && (
        <Panel title="Active Contractors">
          <div className="space-y-3">
            {tempCapacityAllocations.map((alloc) => {
              const linkedTask = tasks.find((t) => t.id === alloc.taskId);
              return (
                <div key={alloc.id} className="flex items-center gap-4 p-3 rounded-[var(--radius-md)] bg-surface-default border border-border-subtle">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[13px] font-medium text-text-primary capitalize">{alloc.profile.replace(/_/g, ' ')}</span>
                      <StatusChip label="Contractor" variant="warning" size="sm" />
                    </div>
                    <div className="text-[11px] text-text-muted">
                      Assigned to: <span className="text-text-secondary">{linkedTask?.name ?? alloc.taskId}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 shrink-0 text-right">
                    <div>
                      <div className="text-[10px] font-mono text-text-muted">Rate</div>
                      <div className="text-[12px] font-mono font-semibold text-yellow-400">€{alloc.weeklyRate}k/wk</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-mono text-text-muted">Speed</div>
                      <div className="text-[12px] font-mono font-semibold text-green-400">×{alloc.speedMultiplier}</div>
                    </div>
                    <button
                      onClick={() => releaseTempCapacity(alloc.id)}
                      className="p-1.5 rounded text-text-muted hover:text-red-400 hover:bg-surface-raised transition-colors"
                      title="Release contractor"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      )}

      {showStaffing && <StaffingModal onClose={() => setShowStaffing(false)} />}
    </div>
  );
}
