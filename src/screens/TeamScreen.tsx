import { useGameStore } from '../store/gameStore';
import Panel from '../components/ui/Panel';
import ProgressBar from '../components/ui/ProgressBar';
import StatusChip from '../components/ui/StatusChip';
import { User } from 'lucide-react';

export default function TeamScreen() {
  const team = useGameStore((s) => s.team);
  const resources = useGameStore((s) => s.resources);

  return (
    <div className="space-y-6 max-w-[1200px]">
      <div>
        <h1 className="text-2xl font-display font-semibold text-text-primary">Team</h1>
        <p className="text-[12px] text-text-muted mt-1">Manage capacity, morale, and allocation</p>
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
          <div className="text-xl font-mono font-semibold text-text-primary">{team.length}</div>
        </Panel>
      </div>

      {/* Team Members */}
      <Panel title="Team Members">
        <div className="space-y-3">
          {team.map((member) => (
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
    </div>
  );
}
