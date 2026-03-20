import { useGameStore } from '../store/gameStore';
import type { Lead } from '../types/game';
import Panel from './ui/Panel';
import StatusChip from './ui/StatusChip';
import { Building2, LineChart, Users, Globe, Handshake, ChevronRight } from 'lucide-react';

export default function PhaseZeroDashboard() {
  const leads = useGameStore((s) => s.leads);
  const activeLeadId = useGameStore((s) => s.activeLeadId);
  const setStore = useGameStore.setState;

  if (!leads || leads.length === 0) return null;

  const setActiveLead = (id: string) => {
    setStore({ activeLeadId: id });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-display font-semibold text-text-primary">Source & Qualify Leads</h2>
        <p className="text-[12px] text-text-muted">Investigate dimensions to build an investment case before pitching to the Board.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {leads.map((lead) => {
          const isActive = activeLeadId === lead.id;
          return (
            <div
              key={lead.id}
              onClick={() => setActiveLead(lead.id)}
              className={`rounded-[var(--radius-lg)] border p-4 transition-all cursor-pointer ${
                isActive 
                  ? 'border-accent-primary bg-surface-default shadow-[var(--shadow-glow-soft)]' 
                  : 'border-border-subtle bg-bg-secondary hover:border-border-strong hover:bg-surface-default'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-[15px] font-semibold text-text-primary">{lead.companyName}</h3>
                  <div className="text-[11px] text-text-muted mt-1">{lead.sector}</div>
                </div>
                <StatusChip label={lead.origin} variant="default" />
              </div>

              <div className="text-[12px] text-text-secondary leading-relaxed mb-4 line-clamp-3">
                {lead.description}
              </div>

              <div className="space-y-2">
                <div className="text-[11px] font-semibold text-text-muted uppercase tracking-widest mb-1">Investigation</div>
                <div className="space-y-1.5">
                   <DimensionRow label="Sector" icon={<Globe size={13} />} status={lead.investigation.sector} />
                   <DimensionRow label="Company" icon={<Building2 size={13} />} status={lead.investigation.company} />
                   <DimensionRow label="Shareholder" icon={<Users size={13} />} status={lead.investigation.shareholder} />
                   <DimensionRow label="Market Read" icon={<LineChart size={13} />} status={lead.investigation.market} />
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border-subtle flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[12px] font-medium text-text-primary">
                  <Handshake size={14} className={lead.meetingDone ? "text-green-400" : "text-text-muted"} />
                  {lead.meetingDone ? 'Meeting Complete' : 'Intro Pending'}
                </div>
                <ChevronRight size={14} className={isActive ? "text-accent-primary" : "text-border-strong"} />
              </div>
            </div>
          );
        })}
      </div>

      {activeLeadId && (
        <LeadActionPanel lead={leads.find(l => l.id === activeLeadId)!} />
      )}
    </div>
  );
}

function DimensionRow({ label, icon, status }: { label: string, icon: React.ReactNode, status: 'none' | 'in_progress' | 'completed' }) {
  return (
    <div className="flex items-center justify-between text-[12px]">
      <div className="flex items-center gap-2 text-text-secondary">
        <span className="text-text-muted">{icon}</span>
        {label}
      </div>
      <StatusChip 
        label={status === 'completed' ? 'Done' : status === 'in_progress' ? 'Active' : 'Missing'} 
        variant={status === 'completed' ? 'success' : status === 'in_progress' ? 'accent' : 'default'} 
      />
    </div>
  );
}

function LeadActionPanel({ lead }: { lead: Lead }) {
  const { investigateDimension, scheduleMeeting, resources } = useGameStore();

  const handleInvestigate = (dim: keyof Lead['investigation']) => {
    investigateDimension(lead.id, dim);
  };

  const handleMeet = () => {
    scheduleMeeting(lead.id);
  };

  const budgetCost = 5;
  const canAfford = resources.budget >= budgetCost;

  return (
    <Panel title={`Active Lead Actions: ${lead.companyName}`} variant="accent" className="mt-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Investigation Actions */}
        <div className="bg-bg-secondary border border-border-subtle rounded-[var(--radius-md)] p-4">
          <h4 className="text-[13px] font-semibold text-text-primary mb-3">Conduct Research</h4>
          <p className="text-[11px] text-text-muted mb-4">Assign team time to uncover hidden attributes. Costs €{budgetCost}k.</p>
          <div className="space-y-2">
            {(['sector', 'company', 'shareholder', 'market'] as const).map((dim) => {
              const isDone = lead.investigation[dim] === 'completed';
              return (
                <button
                  key={dim}
                  onClick={() => handleInvestigate(dim)}
                  disabled={isDone || !canAfford}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded border text-[12px] font-medium transition-colors ${
                    isDone 
                      ? 'border-green-500/30 bg-green-500/5 text-green-400 cursor-not-allowed'
                      : canAfford
                        ? 'border-accent-primary/40 text-text-accent hover:bg-accent-primary/10'
                        : 'border-border-subtle text-text-muted opacity-50 cursor-not-allowed'
                  }`}
                >
                  <span className="capitalize">{dim} Deep-Dive</span>
                  <span>{isDone ? '✓' : `€${budgetCost}k`}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Meeting & Output */}
        <div className="space-y-4">
          <div className="bg-bg-secondary border border-border-subtle rounded-[var(--radius-md)] p-4">
            <h4 className="text-[13px] font-semibold text-text-primary mb-3">Founder Engagement</h4>
            <p className="text-[11px] text-text-muted mb-4">Request introductory meeting to gauge motivation.</p>
            <button
              onClick={handleMeet}
              disabled={lead.meetingDone}
              className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded border text-[12px] font-medium transition-colors ${
                lead.meetingDone
                  ? 'border-green-500/30 bg-green-500/5 text-green-400 cursor-not-allowed'
                  : 'border-accent-primary/40 text-text-accent hover:bg-accent-primary/10'
              }`}
            >
              <Handshake size={14} />
              {lead.meetingDone ? 'Meeting Completed' : 'Schedule Intro'}
            </button>
          </div>

          {(lead.investigation.company === 'completed' || lead.meetingDone) && (
            <div className="bg-surface-default border border-border-subtle rounded-[var(--radius-md)] p-4">
              <h4 className="text-[12px] font-semibold text-text-primary mb-2">Discovered Insights</h4>
              <ul className="space-y-2 text-[11px] text-text-secondary leading-relaxed">
                {lead.investigation.company === 'completed' && (
                  <li><strong>Growth Profile:</strong> {lead.hiddenGrowth} potential</li>
                )}
                {lead.investigation.market === 'completed' && (
                  <li><strong>Risk Profile:</strong> {lead.hiddenRisk} severity risks identified</li>
                )}
                {lead.meetingDone && (
                  <li><strong>Vendor Motivation:</strong> "{lead.hiddenMotivations}"</li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    </Panel>
  );
}
