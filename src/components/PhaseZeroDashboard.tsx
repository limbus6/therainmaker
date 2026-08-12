import { CheckCircle2, ChevronRight, Clock, Handshake, Target } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import type { Lead } from '../types/game';
import { getTargetNarrativeForLead } from '../content/targetNarratives';

const DIMENSIONS = ['sector', 'company', 'shareholder', 'market'] as const;

export default function PhaseZeroDashboard() {
  const leads = useGameStore((state) => state.leads);
  const activeLeadId = useGameStore((state) => state.activeLeadId);
  const selectActiveLead = useGameStore((state) => state.selectActiveLead);

  if (!leads.length) return null;
  const activeLead = leads.find((lead) => lead.id === activeLeadId) ?? leads[0];

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-[14px] font-semibold text-text-primary">Choose the mandate</h2>
        <p className="mt-0.5 text-[10px] text-text-muted">Compare the evidence, investigate one target and take a recommendation to IC.</p>
      </div>

      <div className="grid gap-2 md:grid-cols-3">
        {leads.map((lead) => {
          const isActive = activeLead.id === lead.id;
          const evidenceCount = DIMENSIONS.filter((dimension) => lead.investigation[dimension] === 'completed').length;
          return (
            <button
              type="button"
              key={lead.id}
              onClick={() => selectActiveLead(lead.id)}
              className={`rounded-[var(--radius-md)] border p-3 text-left transition-colors ${isActive ? 'border-border-accent bg-accent-soft/20' : 'border-border-subtle bg-surface-default hover:border-border-default'}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-[12px] font-semibold text-text-primary">{lead.companyName}</p>
                  <p className="mt-0.5 truncate text-[9px] text-text-muted">{lead.sector}</p>
                </div>
                {isActive ? <CheckCircle2 size={13} className="shrink-0 text-text-accent" /> : <ChevronRight size={13} className="shrink-0 text-text-muted" />}
              </div>
              <p className="mt-2 line-clamp-2 text-[10px] leading-relaxed text-text-secondary">{lead.description}</p>
              <div className="mt-3 flex items-center justify-between border-t border-border-subtle pt-2 text-[9px] text-text-muted">
                <span>{evidenceCount}/4 evidence</span>
                <span className={lead.meetingDone ? 'text-state-success' : ''}>{lead.meetingDone ? 'Founder met' : lead.meetingScheduled ? 'Meeting queued' : 'Intro pending'}</span>
              </div>
            </button>
          );
        })}
      </div>

      <LeadActionPanel lead={activeLead} />
    </section>
  );
}

function LeadActionPanel({ lead }: { lead: Lead }) {
  const { investigateDimension, scheduleMeeting, submitBoardRecommendation, boardSubmission } = useGameStore();
  const campaign = getTargetNarrativeForLead(lead.id);
  const isSubmitted = boardSubmission?.leadId === lead.id;
  const evidenceCount = DIMENSIONS.filter((dimension) => lead.investigation[dimension] === 'completed').length;

  return (
    <div className="rounded-[var(--radius-lg)] border border-border-accent/40 bg-bg-secondary p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-[9px] font-mono uppercase tracking-widest text-text-accent">Selected target</p>
          <h3 className="mt-1 text-[15px] font-semibold text-text-primary">{lead.companyName}</h3>
          <p className="mt-1 max-w-2xl text-[10px] leading-relaxed text-text-secondary">{campaign.campaignPromise}</p>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[9px] font-mono text-text-muted">
            <span>Founder: <strong className="text-text-secondary">{lead.founderName}</strong></span>
            <span>Value anchor: <strong className="text-text-accent">€{campaign.baseEV}M</strong></span>
            <span>Evidence: <strong className="text-text-secondary">{evidenceCount}/4</strong></span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => submitBoardRecommendation('proceed', `Strong fit: ${lead.companyName}`, lead.id)}
          disabled={isSubmitted || boardSubmission?.status === 'approved'}
          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-[var(--radius-md)] bg-accent-primary px-3.5 py-2 text-[11px] font-semibold text-white hover:bg-accent-hover disabled:opacity-50"
        >
          {isSubmitted ? <CheckCircle2 size={13} /> : <Target size={13} />}
          {isSubmitted ? 'Submitted to IC' : 'Recommend to IC'}
        </button>
      </div>

      <div className="mt-4 grid gap-3 border-t border-border-subtle pt-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div>
          <p className="text-[9px] font-mono uppercase tracking-wider text-text-muted">Build evidence</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {DIMENSIONS.map((dimension) => {
              const status = lead.investigation[dimension];
              return (
                <button
                  type="button"
                  key={dimension}
                  onClick={() => investigateDimension(lead.id, dimension)}
                  disabled={status === 'completed'}
                  className={`rounded-[var(--radius-sm)] border px-2.5 py-1.5 text-[10px] capitalize transition-colors ${status === 'completed' ? 'border-state-success/25 bg-state-success/5 text-state-success' : 'border-border-subtle bg-surface-default text-text-secondary hover:border-border-accent hover:text-text-accent'}`}
                >
                  {status === 'completed' ? '✓ ' : '+ '}{dimension}
                </button>
              );
            })}
          </div>
        </div>
        <button
          type="button"
          onClick={() => scheduleMeeting(lead.id)}
          disabled={lead.meetingDone || lead.meetingScheduled}
          className="inline-flex items-center justify-center gap-1.5 rounded-[var(--radius-sm)] border border-border-accent bg-border-accent/10 px-3 py-1.5 text-[10px] font-semibold text-text-accent hover:bg-border-accent/20 disabled:opacity-50"
        >
          {lead.meetingDone ? <CheckCircle2 size={12} /> : lead.meetingScheduled ? <Clock size={12} /> : <Handshake size={12} />}
          {lead.meetingDone ? 'Founder met' : lead.meetingScheduled ? 'Meeting queued' : 'Schedule founder meeting'}
        </button>
      </div>
    </div>
  );
}
