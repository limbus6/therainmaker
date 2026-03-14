import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { STAFF_PROFILES, CONTRACTOR_PROFILES } from '../config/phaseBudgets';
import type { StaffProfile, ContractorProfile } from '../types/game';
import { X, Users, Zap, AlertTriangle } from 'lucide-react';

interface Props {
  onClose: () => void;
}

type Tab = 'permanent' | 'temporary';

export default function StaffingModal({ onClose }: Props) {
  const [tab, setTab] = useState<Tab>('permanent');
  const resources = useGameStore((s) => s.resources);
  const tasks = useGameStore((s) => s.tasks);
  const tempAllocations = useGameStore((s) => s.tempCapacityAllocations);
  const hireStaffer = useGameStore((s) => s.hireStaffer);
  const allocateTempCapacity = useGameStore((s) => s.allocateTempCapacity);
  const releaseTempCapacity = useGameStore((s) => s.releaseTempCapacity);

  const [selectedTask, setSelectedTask] = useState<string>('');
  const [hiredProfile, setHiredProfile] = useState<StaffProfile | null>(null);

  const eligibleTasks = tasks.filter(
    (t) => t.status === 'in_progress' || t.status === 'available' || t.status === 'recommended'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-bg-secondary border border-border-subtle rounded-[var(--radius-lg)] shadow-[var(--shadow-heavy)] w-full max-w-2xl mx-4 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle shrink-0">
          <div>
            <h2 className="text-[15px] font-semibold text-text-primary">Staffing & Capacity</h2>
            <p className="text-[12px] text-text-muted mt-0.5">Budget available: <span className="font-mono text-text-accent">€{resources.budget}k</span></p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-[var(--radius-md)] hover:bg-surface-hover text-text-muted hover:text-text-primary transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border-subtle px-6 shrink-0">
          {(['permanent', 'temporary'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`py-3 px-4 text-[12px] font-medium border-b-2 -mb-px transition-colors ${
                tab === t
                  ? 'border-accent-primary text-text-accent'
                  : 'border-transparent text-text-muted hover:text-text-secondary'
              }`}
            >
              {t === 'permanent' ? (
                <span className="flex items-center gap-1.5"><Users size={12} /> Permanent Hire</span>
              ) : (
                <span className="flex items-center gap-1.5"><Zap size={12} /> Temporary Capacity</span>
              )}
            </button>
          ))}
        </div>

        <div className="overflow-y-auto flex-1 p-6">
          {tab === 'permanent' && (
            <div className="space-y-3">
              <p className="text-[12px] text-text-muted mb-4">
                Permanent hires join your team for the rest of the engagement. One-off cost deducted from budget immediately.
              </p>
              {STAFF_PROFILES.map((profile) => {
                const canAfford = resources.budget >= profile.hireCost;
                const isHired = hiredProfile === profile.id;
                return (
                  <div
                    key={profile.id}
                    className={`p-4 rounded-[var(--radius-md)] border transition-all ${
                      isHired ? 'border-green-500/40 bg-green-500/5' :
                      canAfford ? 'border-border-subtle hover:border-accent-primary/30 bg-bg-primary cursor-pointer' :
                      'border-border-subtle/50 bg-bg-primary/50 opacity-60'
                    }`}
                    onClick={() => canAfford && !isHired && null}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-[13px] font-semibold text-text-primary">{profile.label}</h4>
                        <p className="text-[11px] text-text-muted mt-0.5 capitalize">{profile.seniority} · {profile.skills.join(', ')}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-semibold text-[13px] text-text-accent">€{profile.hireCost}k</span>
                        <p className="text-[10px] text-text-muted mt-0.5">one-off</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-[11px] text-text-muted">+{profile.capacityBoost} capacity</span>
                      {!canAfford ? (
                        <span className="text-[11px] text-red-400 flex items-center gap-1"><AlertTriangle size={10} /> Insufficient budget</span>
                      ) : isHired ? (
                        <span className="text-[11px] text-green-400">✓ Hired</span>
                      ) : (
                        <button
                          onClick={() => { hireStaffer(profile.id as StaffProfile); setHiredProfile(profile.id as StaffProfile); }}
                          className="text-[11px] font-medium text-accent-primary hover:text-accent-primary/80 transition-colors py-1 px-2.5 rounded-[var(--radius-sm)] border border-accent-primary/30 hover:bg-accent-soft"
                        >
                          Hire
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'temporary' && (
            <div className="space-y-4">
              <p className="text-[12px] text-text-muted">
                Contractors are allocated to a specific task. Higher weekly cost, but much faster execution. Released automatically when the task completes.
              </p>

              {/* Task selector */}
              <div>
                <label className="block text-[12px] font-medium text-text-secondary mb-1.5">Target task</label>
                <select
                  value={selectedTask}
                  onChange={(e) => setSelectedTask(e.target.value)}
                  className="w-full bg-bg-primary border border-border-subtle rounded-[var(--radius-md)] px-3 py-2 text-[13px] text-text-primary focus:outline-none focus:border-accent-primary/50"
                >
                  <option value="">— Select a task —</option>
                  {eligibleTasks.map((t) => (
                    <option key={t.id} value={t.id}>{t.name} ({t.status})</option>
                  ))}
                </select>
              </div>

              {/* Contractor profiles */}
              <div className="space-y-3">
                {CONTRACTOR_PROFILES.map((profile) => {
                  const alreadyAllocated = tempAllocations.some((a) => a.taskId === selectedTask && a.profile === profile.id);
                  return (
                    <div key={profile.id} className="p-4 rounded-[var(--radius-md)] border border-border-subtle bg-bg-primary">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-[13px] font-semibold text-text-primary">{profile.label}</h4>
                          <p className="text-[11px] text-text-muted mt-0.5">{profile.description}</p>
                        </div>
                        <div className="text-right ml-4 shrink-0">
                          <span className="font-mono font-semibold text-[13px] text-text-accent">€{profile.weeklyRate}k</span>
                          <p className="text-[10px] text-text-muted mt-0.5">/week</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-[11px] text-text-muted flex items-center gap-1">
                          <Zap size={10} className="text-yellow-400" />
                          ×{profile.speedMultiplier} speed
                        </span>
                        {!selectedTask ? (
                          <span className="text-[11px] text-text-muted/60">Select a task first</span>
                        ) : alreadyAllocated ? (
                          <span className="text-[11px] text-green-400">Already allocated</span>
                        ) : (
                          <button
                            onClick={() => allocateTempCapacity(selectedTask, profile.id as ContractorProfile)}
                            className="text-[11px] font-medium text-accent-primary hover:text-accent-primary/80 transition-colors py-1 px-2.5 rounded-[var(--radius-sm)] border border-accent-primary/30 hover:bg-accent-soft"
                          >
                            Allocate
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Active allocations */}
              {tempAllocations.length > 0 && (
                <div>
                  <h3 className="text-[12px] font-semibold text-text-muted uppercase tracking-widest mb-2 mt-4">Active Contractors</h3>
                  {tempAllocations.map((a) => {
                    const task = tasks.find((t) => t.id === a.taskId);
                    const profile = CONTRACTOR_PROFILES.find((p) => p.id === a.profile);
                    return (
                      <div key={a.id} className="flex items-center justify-between py-2.5 border-b border-border-subtle/50 last:border-0">
                        <div>
                          <p className="text-[12px] text-text-secondary">{profile?.label}</p>
                          <p className="text-[11px] text-text-muted">{task?.name ?? a.taskId} · €{a.weeklyRate}k/week</p>
                        </div>
                        <button
                          onClick={() => releaseTempCapacity(a.id)}
                          className="text-[11px] text-red-400 hover:text-red-300 transition-colors py-1 px-2 rounded-[var(--radius-sm)] border border-red-500/20 hover:bg-red-500/10"
                        >
                          Release
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
