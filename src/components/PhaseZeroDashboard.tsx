import { useGameStore } from '../store/gameStore';
import type { Lead } from '../types/game';
import StatusChip from './ui/StatusChip';
import { Building2, LineChart, Users, Globe, Handshake, ChevronRight, CheckCircle2, Clock } from 'lucide-react';

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
        <div>
          <h2 className="text-lg font-display font-semibold text-text-primary">Qualify Mandate Targets</h2>
          <p className="text-[12px] text-text-muted">Evaluate the 3 potential mandates. Build evidence and select which target to recommend to the Investment Committee.</p>
        </div>
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
                  : 'border-border-subtle bg-bg-secondary hover:border-border-default hover:bg-surface-default'
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
                  <Handshake size={14} className={lead.meetingDone ? "text-state-success" : "text-text-muted"} />
                  {lead.meetingDone ? 'Meeting Complete' : 'Intro Pending'}
                </div>
                <ChevronRight size={14} className={isActive ? "text-text-accent" : "text-text-muted"} />
              </div>
            </div>
          );
        })}
      </div>

      {activeLeadId && (
        <LeadActionPanel lead={leads.find(l => l.id === activeLeadId) || leads[0]} />
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
  const { investigateDimension, scheduleMeeting, submitBoardRecommendation, boardSubmission } = useGameStore();

  const handleInvestigate = (dim: keyof Lead['investigation']) => {
    investigateDimension(lead.id, dim);
  };

  const isSubmitted = boardSubmission?.leadId === lead.id;

  return (
    <div className="rounded-[var(--radius-lg)] border border-border-accent bg-bg-panel p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-border-subtle pb-3">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">Active Target Selected</span>
          <h3 className="text-base font-semibold text-text-primary">{lead.companyName} ({lead.founderName})</h3>
        </div>
        <button
          onClick={() => submitBoardRecommendation('proceed', `Strong fit: ${lead.companyName}`, lead.id)}
          disabled={isSubmitted || boardSubmission?.status === 'approved'}
          className="flex items-center gap-1.5 px-4 py-2 bg-accent-primary hover:bg-accent-hover disabled:opacity-50 text-white text-[12px] font-semibold rounded-[var(--radius-md)] transition-colors shadow-[var(--shadow-glow-soft)]"
        >
          {isSubmitted ? <CheckCircle2 size={14} /> : <Clock size={14} />}
          <span>{isSubmitted ? 'Submitted to Board' : `Recommend ${lead.companyName} to Board`}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[12px]">
        <div>
          <h4 className="font-semibold text-text-primary mb-1">Investment Case Summary</h4>
          <p className="text-text-secondary leading-relaxed">{lead.investmentCaseSummary}</p>
        </div>
        <div>
          <h4 className="font-semibold text-text-primary mb-1">Motivations & Risk Profile</h4>
          <p className="text-text-secondary leading-relaxed">{lead.hiddenMotivations}</p>
          <div className="flex items-center gap-3 mt-2 text-[11px] font-mono text-text-muted">
            <span>Growth Potential: <strong className="text-text-accent">{lead.hiddenGrowth}</strong></span>
            <span>Risk Profile: <strong className="text-text-primary">{lead.hiddenRisk}</strong></span>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-border-subtle flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-mono text-text-muted mr-2">Investigate Dimensions:</span>
        {(['sector', 'company', 'shareholder', 'market'] as const).map((dim) => (
          <button
            key={dim}
            onClick={() => handleInvestigate(dim)}
            disabled={lead.investigation[dim] === 'completed'}
            className="px-3 py-1.5 rounded-[var(--radius-sm)] border border-border-subtle bg-surface-default hover:bg-surface-hover disabled:opacity-40 text-[11px] font-mono capitalize text-text-primary transition-colors"
          >
            + {dim} ({lead.investigation[dim]})
          </button>
        ))}
        <button
          onClick={() => scheduleMeeting(lead.id)}
          disabled={lead.meetingDone}
          className="ml-auto px-3 py-1.5 rounded-[var(--radius-sm)] border border-border-accent bg-border-accent/10 text-text-accent hover:bg-border-accent/20 disabled:opacity-40 text-[11px] font-semibold transition-colors"
        >
          {lead.meetingDone ? 'Meeting Done' : 'Schedule Intro Meeting'}
        </button>
      </div>
    </div>
  );
}
