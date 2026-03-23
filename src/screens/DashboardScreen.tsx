import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { PHASE_NAMES } from '../types/game';
import { BUDGET_LOW_THRESHOLD } from '../config/phaseBudgets';
import { Link, useNavigate } from 'react-router-dom';
import Panel from '../components/ui/Panel';
import KpiTile from '../components/ui/KpiTile';
import StatusChip from '../components/ui/StatusChip';
import ProgressBar from '../components/ui/ProgressBar';
import CompetitorMitigationPanel from '../components/CompetitorMitigationPanel';
import BudgetRequestModal from '../components/BudgetRequestModal';
import BoardSubmissionModal from '../components/BoardSubmissionModal';
import StaffingModal from '../components/StaffingModal';
import PitchPresentationModal from '../components/PitchPresentationModal';
import FeeNegotiationModal from '../components/FeeNegotiationModal';
import SPANegotiationModal from '../components/SPANegotiationModal';
import PhaseZeroDashboard from '../components/PhaseZeroDashboard';
import PhaseDeadlineModal from '../components/PhaseDeadlineModal';
import { ArrowRight, Mail, AlertTriangle, ChevronRight, Wallet, Users, Presentation, FileText, Handshake, Trophy, ScrollText, Clock } from 'lucide-react';

function kpiColor(value: number, thresholds: [number, number] = [30, 60]) {
  if (value >= thresholds[1]) return 'success' as const;
  if (value >= thresholds[0]) return 'warning' as const;
  return 'danger' as const;
}

type ModalId = 'budget' | 'board' | 'staffing' | 'pitch' | 'fee' | 'spa' | null;

export default function DashboardScreen() {
  const {
    phase, day, week, resources, emails, tasks, workstreams, buyers, risks, deliverables, headlines,
    advanceWeek, isWeekInProgress, weekHistory,
    budgetRequests, boardSubmission, feeNegotiation, agreedFeeTerms, competitorThreats, advancePhase,
  } = useGameStore();

  const phaseBudget = useGameStore((s) => s.phaseBudget);
  const phaseGate = useGameStore((s) => s.phaseGate);

  const daysPreview = useGameStore((s) => {
    if (s.emails.some((e) => e.priority === 'urgent' && e.state === 'unread')) return 1;
    const inProg = s.tasks.filter((t) => t.status === 'in_progress');
    if (inProg.some((t) => t.complexity === 'low')) return 1;
    if (inProg.some((t) => t.complexity === 'medium')) return 2;
    if (inProg.some((t) => t.complexity === 'high')) return 3;
    if (s.boardSubmission?.status === 'pending') return 2;
    if (s.budgetRequests.some((r) => r.status === 'pending')) return 2;
    if (s.competitorThreats.some((t) => !t.resolved)) return 2;
    return 7;
  });
  const preferredBidderId = useGameStore((s) => s.preferredBidderId);
  const spaNegotiation = useGameStore((s) => s.spaNegotiation);
  const agreedSPATerms = useGameStore((s) => s.agreedSPATerms);
  const phaseDeadline = useGameStore((s) => s.phaseDeadline);
  const bindingOffersReceived = useGameStore((s) => s.bindingOffersReceived);

  const needsDeadline = (phase === 3 || phase === 4 || phase === 6) && phaseDeadline === null;
  const daysUntilDeadline = phaseDeadline !== null ? Math.max(0, phaseDeadline - day) : null;
  void bindingOffersReceived; // consumed by phase gate display

  const [modal, setModal] = useState<ModalId>(null);
  const navigate = useNavigate();

  const unreadEmails = emails.filter((e) => e.state === 'unread');
  const urgentEmails = emails.filter((e) => e.priority === 'urgent' || e.priority === 'high');
  const activeTasks = tasks.filter((t) => t.status === 'available' || t.status === 'recommended');
  const activeWorkstreams = workstreams.filter((w) => w.active);
  const activeRisks = risks.filter((r) => !r.mitigated);
  const activeThreats = competitorThreats.filter((t) => !t.resolved);
  const pendingBudgetRequest = budgetRequests.find((r) => r.status === 'pending' && r.phase === phase);
  const isBudgetLow = resources.budget < BUDGET_LOW_THRESHOLD;

  const pitchPresented = feeNegotiation?.pitchPresented ?? false;
  const feeAgreed = feeNegotiation?.status === 'agreed' || !!agreedFeeTerms;
  const boardApproved = boardSubmission?.status === 'approved';
  const engineGateMet = phaseGate?.canTransition ?? false;

  const canAdvancePhase =
    phase === 0 ? (boardApproved && engineGateMet) :
    phase === 1 ? (pitchPresented && feeAgreed && engineGateMet) :
    engineGateMet;

  return (
    <div className="space-y-6 max-w-[1200px]">
      <div className="flex items-baseline justify-between">
        <div>
          <h1 className="text-2xl font-display font-semibold text-text-primary">Dashboard</h1>
          <p className="text-[12px] text-text-muted mt-1">
            Phase {phase}: {PHASE_NAMES[phase]} — Day {day} <span className="opacity-50">(Week {week})</span>
            {daysUntilDeadline !== null && (
              <span className={`ml-2 inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full border ${
                daysUntilDeadline <= 7 ? 'border-red-500/40 text-red-400 bg-red-500/10' : 'border-yellow-500/40 text-yellow-400 bg-yellow-500/10'
              }`}>
                <Clock size={10} /> {daysUntilDeadline}d to deadline
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setModal('staffing')} className="flex items-center gap-1.5 px-3 py-2 border border-border-subtle rounded-[var(--radius-md)] text-[12px] text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-colors">
            <Users size={13} /> Staffing
          </button>
          <button onClick={advanceWeek} disabled={isWeekInProgress} className="flex items-center gap-2 px-4 py-2 bg-accent-primary hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white text-[13px] font-semibold rounded-[var(--radius-md)] transition-colors duration-150 shadow-[var(--shadow-glow-soft)]">
            Advance <span className="text-[11px] font-mono opacity-70">~{daysPreview}d</span> <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {activeThreats.length > 0 && <CompetitorMitigationPanel />}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <KpiTile label="Deal Momentum" value={resources.dealMomentum} color={kpiColor(resources.dealMomentum)} trend="stable" />
        <KpiTile label="Client Trust" value={resources.clientTrust} color={kpiColor(resources.clientTrust)} onClick={() => navigate('/client')} />
        <KpiTile label="Team Capacity" value={`${resources.teamCapacity}%`} color={kpiColor(resources.teamCapacity)} onClick={() => navigate('/team')} />
        <KpiTile label="Budget" value={`€${resources.budget}k`} color={isBudgetLow ? 'danger' : resources.budget < 30 ? 'warning' : 'default'} onClick={() => setModal('budget')} />
        <KpiTile label="Risk Level" value={resources.riskLevel} color={resources.riskLevel > 50 ? 'danger' : resources.riskLevel > 25 ? 'warning' : 'success'} onClick={() => navigate('/risks')} />
      </div>

      <div className="rounded-[var(--radius-lg)] border border-border-subtle bg-bg-secondary p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[11px] font-semibold text-text-muted uppercase tracking-widest">Phase Gate</span>
          {canAdvancePhase && <StatusChip label="Ready to advance" variant="success" />}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {phase === 0 ? (
            <>
              <button onClick={() => setModal('board')} className={`flex items-center gap-1.5 px-3 py-2 rounded-[var(--radius-md)] border text-[12px] font-medium transition-colors ${boardApproved ? 'border-green-500/30 bg-green-500/5 text-green-400' : 'border-accent-primary/40 bg-accent-soft text-text-accent hover:bg-accent-soft/80'}`}>
                <FileText size={13} /> {boardApproved ? '✓ Board Approved' : 'Submit Board Recommendation'}
              </button>
            </>
          ) : phase === 1 ? (
            <>
              <button onClick={() => setModal('pitch')} className={`flex items-center gap-1.5 px-3 py-2 rounded-[var(--radius-md)] border text-[12px] font-medium transition-colors ${pitchPresented ? 'border-green-500/30 bg-green-500/5 text-green-400' : 'border-accent-primary/40 bg-accent-soft text-text-accent hover:bg-accent-soft/80'}`}>
                <Presentation size={13} /> {pitchPresented ? '✓ Pitch Presented' : 'Present Pitch'}
              </button>
              <ChevronRight size={14} className="text-text-muted/40" />
              <button onClick={() => pitchPresented && setModal('fee')} disabled={!pitchPresented} className={`flex items-center gap-1.5 px-3 py-2 rounded-[var(--radius-md)] border text-[12px] font-medium transition-colors ${feeAgreed ? 'border-green-500/30 bg-green-500/5 text-green-400' : pitchPresented ? 'border-accent-primary/40 bg-accent-soft text-text-accent hover:bg-accent-soft/80' : 'border-border-subtle/40 text-text-muted/40 cursor-not-allowed'}`}>
                <Handshake size={13} /> {feeAgreed ? `✓ Fee Agreed (${agreedFeeTerms?.successFeePercent}%)` : feeNegotiation?.status === 'in_progress' ? `Negotiating` : 'Negotiate Fees'}
              </button>
            </>
          ) : (
            <>
              {phaseGate ? (
                <div className="flex flex-wrap items-center gap-2">
                  {phaseGate.requirements.map((req, i) => (
                    <span key={i} className={`text-[11px] px-2 py-1 rounded border ${req.met ? 'border-green-500/30 bg-green-500/5 text-green-400' : 'border-border-subtle text-text-muted'}`}>
                      {req.met ? '✓' : '○'} {req.label}
                    </span>
                  ))}
                  {phase === 7 && (
                    <Link to="/final-offers" className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-md)] border text-[12px] font-medium transition-colors ml-2 ${preferredBidderId ? 'border-green-500/30 bg-green-500/5 text-green-400' : 'border-accent-primary/40 bg-accent-soft text-text-accent hover:bg-accent-primary/20'}`}>
                      <Trophy size={12} /> {preferredBidderId ? '✓ Preferred Bidder Set' : 'Compare & Select Bidder'}
                    </Link>
                  )}
                  {phase === 8 && (
                    <button onClick={() => setModal('spa')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-md)] border text-[12px] font-medium transition-colors ml-2 ${agreedSPATerms ? 'border-green-500/30 bg-green-500/5 text-green-400' : spaNegotiation?.status === 'in_progress' ? 'border-state-warning/40 bg-state-warning/5 text-state-warning' : 'border-accent-primary/40 bg-accent-soft text-text-accent hover:bg-accent-primary/20'}`}>
                      <ScrollText size={12} /> {agreedSPATerms ? '✓ SPA Agreed' : 'Negotiate SPA'}
                    </button>
                  )}
                </div>
              ) : (
                <span className="text-[11px] text-text-muted">Complete phase tasks and advance week to unlock gate check.</span>
              )}
            </>
          )}

          {canAdvancePhase && (
            <>
              <ChevronRight size={14} className="text-text-muted/40" />
              <button onClick={() => advancePhase()} className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-[12px] font-semibold rounded-[var(--radius-md)] transition-colors">
                Advance to Phase {phase + 1} <ArrowRight size={13} />
              </button>
            </>
          )}

          <div className="ml-auto flex items-center gap-2">
            {isBudgetLow && !pendingBudgetRequest && (
              <button onClick={() => setModal('budget')} className="flex items-center gap-1.5 px-3 py-2 rounded-[var(--radius-md)] border border-red-500/40 text-red-400 text-[11px] font-medium hover:bg-red-500/10 transition-colors">
                <Wallet size={11} /> Low Budget — Request More
              </button>
            )}
            {pendingBudgetRequest && <span className="text-[11px] text-yellow-400 flex items-center gap-1"><Wallet size={11} /> Budget request pending</span>}
            {phaseBudget && <span className="text-[10px] text-text-muted">Phase budget: €{phaseBudget.phaseBase}k + €{phaseBudget.carryover}k carryover</span>}
          </div>
        </div>
      </div>

      {phase === 0 ? (
        <PhaseZeroDashboard />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <Panel title="Priority Actions" subtitle="Tasks requiring your attention" variant="accent">
              {activeTasks.length === 0 ? (
                <p className="text-[12px] text-text-muted">No pending actions this week.</p>
              ) : (
                <div className="space-y-2">
                  {activeTasks.slice(0, 4).map((task) => (
                    <Link key={task.id} to="/tasks" className="flex items-center justify-between p-2.5 rounded-[var(--radius-md)] bg-surface-default hover:bg-surface-hover transition-colors group">
                      <div className="flex items-center gap-3">
                        <StatusChip label={task.status === 'recommended' ? 'Recommended' : 'Available'} variant={task.status === 'recommended' ? 'accent' : 'default'} />
                        <div>
                          <div className="text-[13px] text-text-primary font-medium">{task.name}</div>
                          <div className="text-[11px] text-text-muted">{task.effectSummary}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] font-mono text-text-muted">
                        <span>€{task.cost}k</span>
                        <span>{task.work}h</span>
                        <ChevronRight size={14} className="text-text-muted/40 group-hover:text-text-accent transition-colors" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              <Link to="/tasks" className="flex items-center gap-1 mt-3 text-[11px] text-text-accent hover:underline">View all tasks <ArrowRight size={12} /></Link>
            </Panel>

            <Panel title="Active Workstreams" headerRight={<Link to="/tasks" className="text-[11px] text-text-accent hover:underline">View tasks</Link>}>
              <div className="space-y-3">
                {activeWorkstreams.map((ws) => (
                  <Link key={ws.id} to="/tasks" className="flex items-center gap-4 group hover:opacity-80 transition-opacity">
                    <span className="text-[12px] text-text-secondary w-36 shrink-0 group-hover:text-text-accent transition-colors">{ws.name}</span>
                    <div className="flex-1"><ProgressBar value={ws.progress} color="accent" /></div>
                    <span className="text-[10px] font-mono text-text-muted w-10 text-right">{ws.progress}%</span>
                  </Link>
                ))}
              </div>
            </Panel>

            <Panel title="Inbox" subtitle={`${unreadEmails.length} unread`} headerRight={<Link to="/inbox" className="text-[11px] text-text-accent hover:underline">Open</Link>}>
              {unreadEmails.length === 0 && urgentEmails.length === 0 ? (
                <p className="text-[12px] text-text-muted">Your inbox is clear.</p>
              ) : (
                <div className="space-y-1.5">
                  {[...unreadEmails, ...urgentEmails].slice(0, 3).map((email) => (
                    <Link key={email.id} to="/inbox" className="flex items-center gap-3 p-2 rounded-[var(--radius-md)] hover:bg-surface-hover transition-colors group">
                      <Mail size={14} className="text-text-muted shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] font-medium text-text-primary truncate">{email.sender}</span>
                          {email.priority === 'high' && <StatusChip label="Important" variant="warning" />}
                          {email.priority === 'urgent' && <StatusChip label="Urgent" variant="danger" />}
                        </div>
                        <div className="text-[11px] text-text-muted truncate">{email.subject}</div>
                      </div>
                      <span className="text-[10px] font-mono text-text-muted shrink-0">{email.timestamp}</span>
                    </Link>
                  ))}
                </div>
              )}
            </Panel>
          </div>

          <div className="space-y-4">
            <Panel title="Buyer Pipeline" headerRight={buyers.length > 0 ? <Link to="/buyers" className="text-[11px] text-text-accent hover:underline">View all</Link> : null}>
              {buyers.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-[12px] text-text-muted">No buyers identified yet.</p>
                  <p className="text-[11px] text-text-muted/60 mt-1">Complete sector scan to begin buyer mapping.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {buyers.slice(0, 5).map((buyer) => (
                    <Link key={buyer.id} to="/buyers" className="flex items-center justify-between p-2 rounded-[var(--radius-md)] bg-surface-default hover:bg-surface-hover transition-colors group">
                      <span className="text-[12px] text-text-primary group-hover:text-text-accent transition-colors">{buyer.name}</span>
                      <StatusChip label={buyer.interest} variant={buyer.interest === 'hot' ? 'danger' : buyer.interest === 'warm' ? 'warning' : 'default'} />
                    </Link>
                  ))}
                </div>
              )}
            </Panel>

            <Panel title="Deliverables" headerRight={<Link to="/deliverables" className="text-[11px] text-text-accent hover:underline">View all</Link>}>
              <div className="space-y-2.5">
                {deliverables.slice(0, 5).map((del) => (
                  <Link key={del.id} to="/deliverables" className="block space-y-1 group">
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-text-secondary group-hover:text-text-accent transition-colors">{del.name}</span>
                      <StatusChip label={del.status.replace('_', ' ')} variant={del.status === 'approved' ? 'success' : del.status === 'not_started' ? 'muted' : 'info'} />
                    </div>
                    <ProgressBar value={del.completion} color={del.completion === 100 ? 'success' : 'accent'} size="sm" />
                  </Link>
                ))}
              </div>
            </Panel>

            <Panel title="Active Risks" variant={activeRisks.some((r) => r.severity === 'high' || r.severity === 'critical') ? 'critical' : 'default'} headerRight={activeRisks.length > 0 ? <Link to="/risks" className="text-[11px] text-text-accent hover:underline">View all</Link> : null}>
              {activeRisks.length === 0 ? (
                <p className="text-[12px] text-text-muted">No active risks.</p>
              ) : (
                <div className="space-y-2">
                  {activeRisks.slice(0, 4).map((risk) => (
                    <Link key={risk.id} to="/risks" className="flex items-start gap-2 p-2 rounded-[var(--radius-md)] bg-surface-default hover:bg-surface-hover transition-colors group">
                      <AlertTriangle size={14} className={`shrink-0 mt-0.5 ${risk.severity === 'critical' ? 'text-state-danger' : risk.severity === 'high' ? 'text-state-warning' : 'text-text-muted'}`} />
                      <div>
                        <div className="text-[12px] text-text-primary group-hover:text-text-accent transition-colors">{risk.name}</div>
                        <div className="text-[10px] text-text-muted">{risk.description}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </Panel>

            <Panel title="Market Headlines" headerRight={<Link to="/market" className="text-[11px] text-text-accent hover:underline">Full view</Link>}>
              <div className="space-y-2">
                {headlines.slice(0, 4).map((hl) => (
                  <Link key={hl.id} to="/market" className="flex items-start gap-2 py-1.5 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-primary/60 mt-1.5 shrink-0 group-hover:bg-accent-primary transition-colors" />
                    <p className="text-[11px] text-text-secondary leading-relaxed group-hover:text-text-primary transition-colors">{hl.text}</p>
                  </Link>
                ))}
              </div>
            </Panel>
          </div>
        </div>
      )}

      {weekHistory.length > 0 && (
        <Panel title="Recent Activity" subtitle="Day-by-day log">
          <div className="space-y-2">
            {weekHistory.slice(-5).reverse().map((entry) => (
              <div key={entry.day} className="flex items-start gap-3 p-2 rounded-[var(--radius-md)] bg-surface-default">
                <div className="text-[10px] font-mono text-text-muted shrink-0 w-14 pt-0.5">Day {entry.day}</div>
                <p className="text-[12px] text-text-secondary leading-relaxed">{entry.summary}</p>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {modal === 'budget' && <BudgetRequestModal onClose={() => setModal(null)} />}
      {modal === 'board' && <BoardSubmissionModal onClose={() => setModal(null)} />}
      {modal === 'staffing' && <StaffingModal onClose={() => setModal(null)} />}
      {modal === 'pitch' && <PitchPresentationModal onClose={() => setModal(null)} />}
      {modal === 'fee' && <FeeNegotiationModal onClose={() => setModal(null)} />}
      {modal === 'spa' && <SPANegotiationModal onClose={() => setModal(null)} />}
      {needsDeadline && <PhaseDeadlineModal phase={phase as 3 | 4 | 6} />}
    </div>
  );
}
