import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import Panel from '../components/ui/Panel';
import StatusChip from '../components/ui/StatusChip';
import ProgressBar from '../components/ui/ProgressBar';
import { Play, CheckCircle2, Lock, ChevronDown, ChevronRight } from 'lucide-react';
import type { TaskStatus, TaskCategory } from '../types/game';

const statusVariant: Record<TaskStatus, 'default' | 'accent' | 'muted' | 'info' | 'success' | 'warning'> = {
  available: 'default',
  recommended: 'accent',
  locked: 'muted',
  in_progress: 'info',
  completed: 'success',
  reopened: 'warning',
};

const categoryLabels: Record<TaskCategory, string> = {
  deliverable: 'Deliverable',
  relationship: 'Relationship',
  market: 'Market',
  internal: 'Internal',
  external_advisor: 'External',
  strategic: 'Strategic',
};

type ViewFilter = 'all' | 'available' | 'in_progress' | 'completed';

export default function TasksScreen() {
  const { tasks, workstreams, startTask } = useGameStore();
  const [filter, setFilter] = useState<ViewFilter>('all');
  const [expandedTask, setExpandedTask] = useState<string | null>(null);

  const filteredTasks = tasks.filter((t) => {
    switch (filter) {
      case 'available': return t.status === 'available' || t.status === 'recommended';
      case 'in_progress': return t.status === 'in_progress';
      case 'completed': return t.status === 'completed';
      default: return true;
    }
  });

  const activeWorkstreams = workstreams.filter((w) => w.active);

  const filters: { key: ViewFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'available', label: 'Available' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'completed', label: 'Completed' },
  ];

  return (
    <div className="space-y-6 max-w-[1200px]">
      <div>
        <h1 className="text-2xl font-display font-semibold text-text-primary">Tasks & Workstreams</h1>
        <p className="text-[12px] text-text-muted mt-1">Operational control — manage execution and resource allocation</p>
      </div>

      {/* Workstream Progress */}
      {activeWorkstreams.length > 0 && (
        <Panel title="Active Workstreams">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeWorkstreams.map((ws) => (
              <div key={ws.id} className="p-3 rounded-[var(--radius-md)] bg-surface-default border border-border-subtle">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[12px] font-medium text-text-secondary">{ws.name}</span>
                  <span className="text-[10px] font-mono text-text-muted">Q: {ws.quality}%</span>
                </div>
                <ProgressBar value={ws.progress} color="accent" showLabel />
              </div>
            ))}
          </div>
        </Panel>
      )}

      {/* Task Filters */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-0.5 bg-surface-default rounded-[var(--radius-md)] p-0.5">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 text-[12px] rounded-[var(--radius-sm)] transition-all duration-150 ${
                filter === f.key
                  ? 'bg-accent-soft text-text-accent font-medium'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <span className="text-[11px] text-text-muted font-mono">{filteredTasks.length} tasks</span>
      </div>

      {/* Task List */}
      <div className="space-y-1.5">
        {filteredTasks.map((task) => {
          const isExpanded = expandedTask === task.id;
          const isActionable = task.status === 'available' || task.status === 'recommended';

          return (
            <div key={task.id} className={`rounded-[var(--radius-md)] border transition-all duration-150 ${
              isExpanded ? 'bg-bg-panel/80 border-border-default' : 'bg-surface-default border-transparent hover:border-border-subtle'
            }`}>
              {/* Task Row */}
              <button
                onClick={() => setExpandedTask(isExpanded ? null : task.id)}
                className="w-full flex items-center gap-3 p-3 text-left"
              >
                {/* Status icon */}
                <span className="shrink-0">
                  {task.status === 'locked' ? <Lock size={14} className="text-text-muted/40" /> :
                   task.status === 'completed' ? <CheckCircle2 size={14} className="text-state-success" /> :
                   task.status === 'in_progress' ? <Play size={14} className="text-state-info" /> :
                   isExpanded ? <ChevronDown size={14} className="text-text-muted" /> :
                   <ChevronRight size={14} className="text-text-muted" />}
                </span>

                {/* Name + Category */}
                <div className="flex-1 min-w-0">
                  <div className={`text-[13px] ${task.status === 'locked' ? 'text-text-muted' : 'text-text-primary'} font-medium truncate`}>
                    {task.name}
                  </div>
                </div>

                {/* Chips */}
                <StatusChip label={categoryLabels[task.category]} variant="muted" />
                <StatusChip label={task.status.replace('_', ' ')} variant={statusVariant[task.status]} />

                {/* Costs */}
                <div className="flex items-center gap-3 text-[11px] font-mono text-text-muted shrink-0 w-32 justify-end">
                  <span>€{task.cost}k</span>
                  <span>{task.work}h</span>
                  <StatusChip label={task.complexity} variant={task.complexity === 'high' ? 'warning' : task.complexity === 'medium' ? 'default' : 'muted'} />
                </div>
              </button>

              {/* Expanded Detail */}
              {isExpanded && (
                <div className="px-3 pb-3 pt-0 border-t border-border-subtle mx-3">
                  <div className="pt-3 space-y-3">
                    <p className="text-[12px] text-text-secondary leading-relaxed">{task.description}</p>
                    <div className="flex items-center gap-4 text-[11px]">
                      <span className="text-text-muted">Effect: <span className="text-text-secondary">{task.effectSummary}</span></span>
                      {task.dependencies && task.dependencies.length > 0 && (
                        <span className="text-state-warning">Requires: {task.dependencies.join(', ')}</span>
                      )}
                    </div>
                    {isActionable && (
                      <button
                        onClick={(e) => { e.stopPropagation(); startTask(task.id); }}
                        className="flex items-center gap-2 px-4 py-2 bg-accent-primary hover:bg-accent-hover text-white text-[12px] font-semibold rounded-[var(--radius-md)] transition-colors shadow-[var(--shadow-glow-soft)]"
                      >
                        <Play size={12} /> Start Task
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
