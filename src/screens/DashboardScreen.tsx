import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  BriefcaseBusiness,
  ChevronDown,
  ChevronUp,
  Clock,
  FileText,
  Handshake,
  ListChecks,
  Mail,
  Presentation,
  ScrollText,
  Swords,
  Target,
  Trophy,
  Users,
  Wallet,
} from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { useCareerStore } from '../store/careerStore';
import { PHASE_NAMES } from '../types/game';
import { BUDGET_LOW_THRESHOLD } from '../config/phaseBudgets';
import StatusChip from '../components/ui/StatusChip';
import ProgressBar from '../components/ui/ProgressBar';
import BudgetRequestModal from '../components/BudgetRequestModal';
import BoardSubmissionModal from '../components/BoardSubmissionModal';
import StaffingModal from '../components/StaffingModal';
import PitchPresentationModal from '../components/PitchPresentationModal';
import FeeNegotiationModal from '../components/FeeNegotiationModal';
import SPANegotiationModal from '../components/SPANegotiationModal';
import PhaseZeroDashboard from '../components/PhaseZeroDashboard';
import PhaseDeadlineModal from '../components/PhaseDeadlineModal';
import TurnTape from '../components/TurnTape';
import DeskDecisionCard from '../components/DeskDecisionCard';
import ArchetypeAbilityPanel from '../components/ArchetypeAbilityPanel';
import { getActiveRisks } from '../utils/gameplayState';
import { checkPhaseGate, getAdvancePacePreview } from '../engine/weekEngine';
import { getMissionsForPhase } from '../content/missions';
import { getTargetNarrative, personalizeTargetNarrativeValue } from '../content/targetNarratives';
import { getMandatePhaseSequence, isShortMandate } from '../content/mandates';
import { getMissionProgress, getActiveMission } from '../utils/missionProgress';
import { buildBeaconSummary } from '../engine/beaconCareer';
import { formatTaskEffectSummary } from '../utils/effectLabels';

type ModalId = 'budget' | 'board' | 'staffing' | 'pitch' | 'fee' | 'spa' | null;

export default function DashboardScreen() {
  const gameState = useGameStore();
  const {
    phase,
    day,
    resources,
    emails,
    tasks,
    buyers,
    risks,
    leads,
    advanceWeek,
    isWeekInProgress,
    budgetRequests,
    boardSubmission,
    feeNegotiation,
    agreedFeeTerms,
    competitorThreats,
    advancePhase,
    completeGame,
    weekPace,
    setWeekPace,
    commitAndAdvance,
  } = gameState;

  const [modal, setModal] = useState<ModalId>(null);
  const [showGateDetails, setShowGateDetails] = useState(false);

  const phaseBudget = useGameStore((state) => state.phaseBudget);
  const phaseGate = checkPhaseGate(gameState);
  const mandatePhases = getMandatePhaseSequence(gameState.mandateId);
  const mandateStage = Math.max(0, mandatePhases.indexOf(phase));
  const nextMandatePhase = phaseGate.nextPhase;
  const shortMandate = isShortMandate(gameState.mandateId);
  const beaconTombstones = useCareerStore((state) => state.beaconTombstones);
  const rivalry = buildBeaconSummary(beaconTombstones);

  const advancePreview = getAdvancePacePreview(gameState);
  const daysPreview = advancePreview.days;
  const preferredBidderId = useGameStore((state) => state.preferredBidderId);
  const agreedSPATerms = useGameStore((state) => state.agreedSPATerms);
  const phaseDeadline = useGameStore((state) => state.phaseDeadline);
  const bindingOffersReceived = useGameStore((state) => state.bindingOffersReceived);

  const needsDeadline = (phase === 3 || phase === 4 || phase === 6) && phaseDeadline === null;
  const daysUntilDeadline = phaseDeadline !== null ? Math.max(0, phaseDeadline - day) : null;
  const priorityRank = { urgent: 0, high: 1, normal: 2, low: 3 };
  const dashboardEmails = emails
    .filter((email) => email.phase === phase && email.state === 'unread')
    .sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority]);
  const urgentDecisionEmail = dashboardEmails.find((email) =>
    (email.priority === 'urgent' || email.priority === 'high') && !!email.responseOptions?.length
  );
  const activeTasks = tasks.filter((task) =>
    task.phase === phase && (task.status === 'available' || task.status === 'recommended')
  );
  const inProgressTasks = tasks.filter((task) => task.phase === phase && task.status === 'in_progress');
  const activeRisks = getActiveRisks(risks, phase, bindingOffersReceived);
  const activeThreats = competitorThreats.filter((threat) => !threat.resolved);
  const pendingBudgetRequest = budgetRequests.find((request) => request.status === 'pending' && request.phase === phase);
  const isBudgetLow = resources.budget < BUDGET_LOW_THRESHOLD;
  const liveBuyers = buyers.filter((buyer) => !['dropped', 'excluded'].includes(buyer.status));
  const activeLead = leads.find((lead) => lead.id === gameState.activeLeadId) ?? leads[0];

  const shortlistCount = buyers.filter((buyer) => buyer.status === 'shortlisted').length;
  const shortlistAnalysisReady = tasks.some((task) => task.phase === 4 && task.id === 'task-60' && task.status === 'completed');
  const needsShortlistDecision = phase === 4 && shortlistAnalysisReady && shortlistCount < 2;

  const phaseMissions = personalizeTargetNarrativeValue(
    getMissionsForPhase(phase),
    getTargetNarrative(gameState.targetNarrativeId),
  );
  const missionEntries = getMissionProgress(phaseMissions, tasks, phase);
  const activeMissionEntry = getActiveMission(missionEntries, gameState.activeMissionId);
  const completedMissionCount = missionEntries.filter((entry) => entry.complete).length;
  const allMissionsComplete = missionEntries.length > 0 && completedMissionCount === missionEntries.length;
  const missionProgress = activeMissionEntry && activeMissionEntry.totalRequired > 0
    ? Math.round((activeMissionEntry.completedRequired / activeMissionEntry.totalRequired) * 100)
    : missionEntries.length > 0 && completedMissionCount === missionEntries.length
      ? 100
      : 0;

  const pitchPresented = feeNegotiation?.pitchPresented ?? false;
  const feeAgreed = feeNegotiation?.status === 'agreed' || !!agreedFeeTerms;
  const boardApproved = boardSubmission?.status === 'approved';
  const engineGateMet = phaseGate.canTransition;
  const requiredGateItems = phaseGate.requirements.filter((requirement) => !requirement.optional);
  const metGateItems = requiredGateItems.filter((requirement) => requirement.met).length;
  const blockingStepsRemaining = requiredGateItems.length - metGateItems;
  const gateProgress = requiredGateItems.length > 0
    ? Math.round((metGateItems / requiredGateItems.length) * 100)
    : 100;

  const canAdvancePhase =
    phase === 0 ? boardApproved && engineGateMet :
    phase === 1 ? pitchPresented && feeAgreed && engineGateMet :
    engineGateMet;
  const nextPriority = activeTasks[0];
  const nextGateRequirement = requiredGateItems.find((requirement) => !requirement.met);
  const needsBidderDecision = phase === 7 && !preferredBidderId;
  const needsSpaDecision = phase === 8 && !agreedSPATerms;

  const focusTitle = needsShortlistDecision
    ? `Choose the provisional shortlist (${shortlistCount}/2)`
    : needsBidderDecision
      ? 'Choose the preferred bidder'
      : needsSpaDecision
        ? 'Negotiate the SPA'
        : nextPriority
          ? nextPriority.name
          : inProgressTasks.length > 0
      ? 'Let committed work land'
      : canAdvancePhase
          ? phase === 10 ? 'Review the mandate result' : `Move to ${PHASE_NAMES[nextMandatePhase]}`
          : nextGateRequirement?.label ?? 'Review the live deal state';

  const focusDescription = needsShortlistDecision
    ? 'Select the engaged buyers that advance. This is a direct decision, not another timed task.'
    : needsBidderDecision
      ? 'Compare the binding offers and grant exclusivity to the bidder you recommend.'
      : needsSpaDecision
        ? 'Open the bilateral negotiation with the bidder you selected.'
        : nextPriority
          ? `${formatTaskEffectSummary(nextPriority.effectSummary)}. This is the clearest next move.`
          : inProgressTasks.length > 0
      ? advancePreview.reason
      : canAdvancePhase
          ? 'All required gates are clear.'
          : 'This is the first requirement still blocking phase progression.';

  const renderFocusAction = () => {
    if (needsShortlistDecision) {
      return <Link to="/buyers" className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-accent-primary px-4 py-2.5 text-[12px] font-semibold text-white hover:bg-accent-hover"><Users size={14} /> Choose shortlist</Link>;
    }
    if (needsBidderDecision) {
      return <Link to="/final-offers" className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-accent-primary px-4 py-2.5 text-[12px] font-semibold text-white"><Trophy size={14} /> Compare offers</Link>;
    }
    if (needsSpaDecision) {
      return <button type="button" onClick={() => setModal('spa')} className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-accent-primary px-4 py-2.5 text-[12px] font-semibold text-white"><ScrollText size={14} /> Negotiate SPA</button>;
    }
    if (nextPriority) {
      if (resources.budget < nextPriority.cost) {
        return (
          <button type="button" onClick={() => setModal('budget')} className="inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-state-danger/35 bg-state-danger/10 px-4 py-2.5 text-[12px] font-semibold text-state-danger">
            <Wallet size={14} /> Request budget
          </button>
        );
      }
      return (
        <button type="button" onClick={() => commitAndAdvance(nextPriority.id)} disabled={isWeekInProgress} className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-accent-primary px-4 py-2.5 text-[12px] font-semibold text-white hover:bg-accent-hover disabled:opacity-50">
          <Target size={14} /> Start &amp; advance
        </button>
      );
    }
    if (inProgressTasks.length > 0) {
      return (
        <button type="button" onClick={advanceWeek} disabled={isWeekInProgress} className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-accent-primary px-4 py-2.5 text-[12px] font-semibold text-white hover:bg-accent-hover disabled:opacity-50">
          Advance ~{daysPreview}d <ArrowRight size={14} />
        </button>
      );
    }
    if (canAdvancePhase) {
      return (
        <button type="button" onClick={() => phase === 10 ? completeGame() : advancePhase()} className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-state-success px-4 py-2.5 text-[12px] font-semibold text-white hover:brightness-110">
          {phase === 10 ? 'View results' : `Advance to ${PHASE_NAMES[nextMandatePhase]}`} <ArrowRight size={14} />
        </button>
      );
    }
    if (phase === 0 && !boardApproved) {
      return <button type="button" onClick={() => setModal('board')} className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-accent-primary px-4 py-2.5 text-[12px] font-semibold text-white"><FileText size={14} /> Submit to board</button>;
    }
    if (phase === 1 && !pitchPresented) {
      return <button type="button" onClick={() => setModal('pitch')} className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-accent-primary px-4 py-2.5 text-[12px] font-semibold text-white"><Presentation size={14} /> Present pitch</button>;
    }
    if (phase === 1 && !feeAgreed) {
      return <button type="button" onClick={() => setModal('fee')} className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-accent-primary px-4 py-2.5 text-[12px] font-semibold text-white"><Handshake size={14} /> Negotiate fees</button>;
    }
    return <Link to="/tasks" className="inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-border-accent bg-border-accent/10 px-4 py-2.5 text-[12px] font-semibold text-text-accent"><ListChecks size={14} /> Open tasks</Link>;
  };

  return (
    <div className="max-w-[1120px] space-y-4">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-display font-semibold text-text-primary">Dashboard</h1>
            <StatusChip label={shortMandate ? `Stage ${mandateStage + 1}/${mandatePhases.length} · ${PHASE_NAMES[phase]}` : `P${phase} · ${PHASE_NAMES[phase]}`} variant="muted" />
            {daysUntilDeadline !== null && (
              <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-mono ${daysUntilDeadline <= 7 ? 'border-state-danger/35 bg-state-danger/10 text-state-danger' : 'border-state-warning/35 bg-state-warning/10 text-state-warning'}`}>
                <Clock size={10} /> {daysUntilDeadline === 0 ? 'Deadline reached' : `${daysUntilDeadline}d left`}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 rounded-[var(--radius-md)] border border-border-subtle bg-surface-default px-2.5 py-2 text-[11px] text-text-muted">
            Pace
            <select value={weekPace} onChange={(event) => setWeekPace(event.target.value as typeof weekPace)} aria-label="Execution pace" className="bg-transparent text-[11px] font-medium capitalize text-text-primary outline-none">
              <option value="deliberate">Deliberate</option>
              <option value="standard">Standard</option>
              <option value="sprint">Sprint</option>
            </select>
          </label>
          <button type="button" onClick={() => setModal('staffing')} className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] border border-border-subtle px-3 py-2 text-[11px] text-text-secondary hover:bg-surface-hover">
            <Users size={13} /> Staffing
          </button>
          <button
            type="button"
            onClick={() => advancePreview.requiresChoice ? document.getElementById('dashboard-focus')?.scrollIntoView({ behavior: 'smooth', block: 'center' }) : advanceWeek()}
            disabled={isWeekInProgress}
            title={advancePreview.reason}
            className="inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-border-accent bg-border-accent/10 px-3.5 py-2 text-[12px] font-semibold text-text-accent hover:bg-border-accent/20 disabled:opacity-50"
          >
            {advancePreview.requiresChoice ? 'Choose action' : `Advance ~${daysPreview}d`} <ArrowRight size={13} />
          </button>
        </div>
      </header>

      <TurnTape />

      <section id="dashboard-focus">
        {urgentDecisionEmail ? (
          <DeskDecisionCard />
        ) : (
          <div className="rounded-[var(--radius-lg)] border border-border-accent/40 bg-gradient-to-br from-accent-soft/35 to-bg-secondary p-5 shadow-[var(--shadow-glow-soft)]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-[9px] font-mono uppercase tracking-[0.18em] text-text-accent">Focus now</p>
                <h2 className="mt-1 text-[18px] font-semibold text-text-primary">{focusTitle}</h2>
                <p className="mt-1 max-w-2xl text-[11px] leading-relaxed text-text-secondary">{focusDescription}</p>
              </div>
              {renderFocusAction()}
            </div>
          </div>
        )}
      </section>

      <section className="rounded-[var(--radius-lg)] border border-border-subtle bg-bg-secondary p-4">
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <div className="flex items-center justify-between gap-3">
              <p className="text-[10px] font-mono uppercase tracking-widest text-text-muted">Phase plan</p>
              <span className="text-[10px] font-mono text-text-muted">{completedMissionCount}/{missionEntries.length} missions</span>
            </div>
            <p className="mt-1.5 truncate text-[13px] font-medium text-text-primary">{allMissionsComplete ? 'All mission work complete' : activeMissionEntry?.mission.title ?? 'No mission work pending'}</p>
            <div className="mt-2"><ProgressBar value={missionProgress} color={missionProgress === 100 ? 'success' : 'accent'} size="sm" /></div>
          </div>

          <div className="border-t border-border-subtle pt-4 md:border-l md:border-t-0 md:pl-5 md:pt-0">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[10px] font-mono uppercase tracking-widest text-text-muted">Phase gate</p>
              <StatusChip label={canAdvancePhase ? 'Ready' : `${blockingStepsRemaining} left`} variant={canAdvancePhase ? 'success' : 'warning'} />
            </div>
            <p className="mt-1.5 truncate text-[13px] font-medium text-text-primary">{canAdvancePhase ? 'Ready to advance' : nextGateRequirement?.label ?? 'Review requirements'}</p>
            <div className="mt-2"><ProgressBar value={gateProgress} color={canAdvancePhase ? 'success' : 'accent'} size="sm" /></div>
          </div>
        </div>

        <button type="button" onClick={() => setShowGateDetails((visible) => !visible)} className="mt-3 inline-flex items-center gap-1 text-[10px] font-medium text-text-muted hover:text-text-accent">
          {showGateDetails ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          {showGateDetails ? 'Hide requirements' : 'Show requirements'}
        </button>

        {showGateDetails && (
          <div className="mt-3 flex flex-wrap gap-2 border-t border-border-subtle pt-3">
            {phaseGate.requirements.map((requirement, index) => (
              <span key={`${requirement.label}-${index}`} className={`rounded-full border px-2.5 py-1 text-[10px] ${requirement.met ? 'border-state-success/30 bg-state-success/10 text-state-success' : requirement.optional ? 'border-border-subtle text-text-muted' : 'border-state-warning/30 bg-state-warning/10 text-state-warning'}`}>
                {requirement.met ? '✓' : requirement.optional ? 'Optional' : '○'} {requirement.label}
              </span>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-2 text-[10px] font-mono uppercase tracking-widest text-text-muted">At a glance</h2>
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          <Link to="/tasks" className="group rounded-[var(--radius-md)] border border-border-subtle bg-surface-default p-3 hover:border-border-accent/50">
            <div className="flex items-center gap-2 text-text-muted"><ListChecks size={13} /><span className="text-[9px] font-mono uppercase tracking-wider">Work</span></div>
            <p className="mt-2 text-[15px] font-semibold text-text-primary group-hover:text-text-accent">{activeTasks.length} ready</p>
            <p className="mt-0.5 truncate text-[10px] text-text-muted">{inProgressTasks.length > 0 ? `${inProgressTasks.length} in progress` : 'Open task list'}</p>
          </Link>

          <Link to="/inbox" className="group rounded-[var(--radius-md)] border border-border-subtle bg-surface-default p-3 hover:border-border-accent/50">
            <div className="flex items-center gap-2 text-text-muted"><Mail size={13} /><span className="text-[9px] font-mono uppercase tracking-wider">Inbox</span></div>
            <p className="mt-2 text-[15px] font-semibold text-text-primary group-hover:text-text-accent">{dashboardEmails.length} unread</p>
            <p className="mt-0.5 truncate text-[10px] text-text-muted">{dashboardEmails[0]?.subject ?? 'Inbox clear'}</p>
          </Link>

          <Link to={phase === 0 ? '/game' : '/buyers'} className="group rounded-[var(--radius-md)] border border-border-subtle bg-surface-default p-3 hover:border-border-accent/50">
            <div className="flex items-center gap-2 text-text-muted"><BriefcaseBusiness size={13} /><span className="text-[9px] font-mono uppercase tracking-wider">{phase === 0 ? 'Targets' : 'Buyers'}</span></div>
            <p className="mt-2 text-[15px] font-semibold text-text-primary group-hover:text-text-accent">{phase === 0 ? `${leads.length} options` : `${liveBuyers.length} live`}</p>
            <p className="mt-0.5 truncate text-[10px] text-text-muted">{phase === 0 ? activeLead?.companyName ?? 'Choose a target' : liveBuyers[0]?.name ?? 'No buyer activity'}</p>
          </Link>

          <Link to="/risks" className="group rounded-[var(--radius-md)] border border-border-subtle bg-surface-default p-3 hover:border-border-accent/50">
            <div className="flex items-center gap-2 text-text-muted"><AlertTriangle size={13} /><span className="text-[9px] font-mono uppercase tracking-wider">Risks</span></div>
            <p className={`mt-2 text-[15px] font-semibold group-hover:text-text-accent ${activeRisks.some((risk) => risk.severity === 'critical' || risk.severity === 'high') ? 'text-state-warning' : 'text-text-primary'}`}>{activeRisks.length} active</p>
            <p className="mt-0.5 truncate text-[10px] text-text-muted">{activeRisks[0]?.name ?? 'No live issues'}</p>
          </Link>
        </div>
      </section>

      <ArchetypeAbilityPanel />

      {activeThreats.length > 0 && (
        <Link to="/client" className="flex items-center gap-3 rounded-[var(--radius-md)] border border-state-danger/30 bg-state-danger/5 p-3 hover:bg-state-danger/10">
          <AlertTriangle size={15} className="shrink-0 text-state-danger" />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold text-state-danger">Competing advisor active</p>
            <p className="truncate text-[10px] text-text-muted">Resolve the threat in the Client view.</p>
          </div>
          <ArrowRight size={13} className="text-state-danger" />
        </Link>
      )}

      {phase === 0 && <PhaseZeroDashboard />}

      {!shortMandate && (
        <Link to="/career" className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] border border-border-subtle px-3 py-2 text-[10px] text-text-muted hover:border-border-accent/40 hover:text-text-secondary">
          <span className="inline-flex items-center gap-2"><Swords size={12} /> Beacon rivalry · Clearwater {rivalry.clearwaterWins}—{rivalry.beaconWins} Beacon</span>
          <span>Career record →</span>
        </Link>
      )}

      {(isBudgetLow || pendingBudgetRequest) && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-[var(--radius-md)] border border-state-warning/25 bg-state-warning/5 px-3 py-2 text-[10px] text-state-warning">
          <span>{pendingBudgetRequest ? 'Budget request pending' : `Low budget · €${resources.budget}k remains`}</span>
          {!pendingBudgetRequest && <button type="button" onClick={() => setModal('budget')} className="font-semibold underline">Request more</button>}
          {phaseBudget && <span className="text-text-muted">Phase base €{phaseBudget.phaseBase}k · €{phaseBudget.carryover}k carried</span>}
        </div>
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
