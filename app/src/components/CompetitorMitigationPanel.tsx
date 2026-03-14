import { useGameStore } from '../store/gameStore';
import { MITIGATION_ACTIONS } from '../config/phaseBudgets';
import type { MitigationActionId } from '../types/game';
import { AlertTriangle, Users, Zap, CheckCircle } from 'lucide-react';

export default function CompetitorMitigationPanel() {
  const competitorThreats = useGameStore((s) => s.competitorThreats);
  const resources = useGameStore((s) => s.resources);
  const executeMitigationAction = useGameStore((s) => s.executeMitigationAction);

  const activeThreats = competitorThreats.filter((t) => !t.resolved);
  if (activeThreats.length === 0) return null;

  const relationshipActions = MITIGATION_ACTIONS.filter((a) => a.category === 'relationship');
  const processActions = MITIGATION_ACTIONS.filter((a) => a.category === 'process');

  return (
    <div className="rounded-[var(--radius-lg)] border border-red-500/30 bg-red-500/5 overflow-hidden">
      {/* Threat Header */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-red-500/20 bg-red-500/10">
        <AlertTriangle size={15} className="text-red-400 shrink-0" />
        <div>
          <h3 className="text-[13px] font-semibold text-red-300">Competing Advisor Detected</h3>
          <p className="text-[11px] text-red-400/70 mt-0.5">
            {activeThreats.map((t) => t.advisorName).join(', ')} {activeThreats.length === 1 ? 'is' : 'are'} in discussions with {' '}
            {useGameStore.getState().client.name}
          </p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {activeThreats.map((threat) => (
          <div key={threat.id} className="space-y-3">
            {/* Relationship Accelerators */}
            <div>
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-2">
                <Users size={10} />
                Relationship Accelerators
              </div>
              <div className="grid grid-cols-1 gap-2">
                {relationshipActions.map((action) => {
                  const used = threat.usedActions.includes(action.id);
                  const canAfford = resources.budget >= action.budgetCost;
                  return (
                    <div
                      key={action.id}
                      className={`flex items-center justify-between p-3 rounded-[var(--radius-md)] border transition-all ${
                        used ? 'border-green-500/30 bg-green-500/5 opacity-70' :
                        canAfford ? 'border-border-subtle bg-bg-primary hover:border-accent-primary/30' :
                        'border-border-subtle/40 bg-bg-primary/50 opacity-50'
                      }`}
                    >
                      <div>
                        <p className="text-[12px] font-medium text-text-secondary">{action.label}</p>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-text-muted">
                          {action.effects.clientTrust && <span className="text-green-400">+{action.effects.clientTrust} trust</span>}
                          {action.effects.dealMomentum && <span className="text-blue-400">+{action.effects.dealMomentum} momentum</span>}
                          {action.effects.reputation && <span className="text-purple-400">+{action.effects.reputation} reputation</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-3 shrink-0">
                        {action.budgetCost > 0 && (
                          <span className={`text-[10px] font-mono ${canAfford ? 'text-text-muted' : 'text-red-400'}`}>
                            €{action.budgetCost}k
                          </span>
                        )}
                        {used ? (
                          <CheckCircle size={14} className="text-green-400" />
                        ) : (
                          <button
                            onClick={() => executeMitigationAction(threat.id, action.id as MitigationActionId)}
                            disabled={!canAfford}
                            className="text-[10px] font-medium py-1 px-2.5 rounded-[var(--radius-sm)] border border-accent-primary/30 text-accent-primary hover:bg-accent-soft transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            Execute
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Process Accelerators */}
            <div>
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-2">
                <Zap size={10} />
                Process Accelerators
              </div>
              <div className="grid grid-cols-1 gap-2">
                {processActions.map((action) => {
                  const used = threat.usedActions.includes(action.id);
                  const canAfford = resources.budget >= action.budgetCost;
                  return (
                    <div
                      key={action.id}
                      className={`flex items-center justify-between p-3 rounded-[var(--radius-md)] border transition-all ${
                        used ? 'border-green-500/30 bg-green-500/5 opacity-70' :
                        canAfford ? 'border-border-subtle bg-bg-primary hover:border-accent-primary/30' :
                        'border-border-subtle/40 bg-bg-primary/50 opacity-50'
                      }`}
                    >
                      <div>
                        <p className="text-[12px] font-medium text-text-secondary">{action.label}</p>
                        <p className="text-[10px] text-text-muted mt-0.5">{action.description}</p>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px]">
                          {action.effects.pitchWeeksReduced && (
                            <span className="text-yellow-400">−{action.effects.pitchWeeksReduced} weeks</span>
                          )}
                          {action.effects.dealMomentum && <span className="text-blue-400">+{action.effects.dealMomentum} momentum</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-3 shrink-0">
                        {action.budgetCost > 0 && (
                          <span className={`text-[10px] font-mono ${canAfford ? 'text-text-muted' : 'text-red-400'}`}>
                            €{action.budgetCost}k
                          </span>
                        )}
                        {used ? (
                          <CheckCircle size={14} className="text-green-400" />
                        ) : (
                          <button
                            onClick={() => executeMitigationAction(threat.id, action.id as MitigationActionId)}
                            disabled={!canAfford}
                            className="text-[10px] font-medium py-1 px-2.5 rounded-[var(--radius-sm)] border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            Execute
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
