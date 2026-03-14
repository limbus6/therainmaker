import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { buildResultsBoard } from '../engine/resultsEngine';
import type { ResultsBoard } from '../engine/resultsEngine';
import ProgressBar from '../components/ui/ProgressBar';
import { Trophy, TrendingUp, Users, Shield, Briefcase, Star, ChevronRight, RotateCcw } from 'lucide-react';

const OUTCOME_LABELS: Record<ResultsBoard['dealOutcome'], string> = {
  deal_failed: 'Deal Failed',
  closed_with_friction: 'Closed with Friction',
  clean_close: 'Clean Close',
  premium_close: 'Premium Close',
};

const OUTCOME_COLORS: Record<ResultsBoard['dealOutcome'], string> = {
  deal_failed: 'text-state-danger',
  closed_with_friction: 'text-state-warning',
  clean_close: 'text-state-success',
  premium_close: 'text-text-accent',
};

const GRADE_COLORS: Record<string, string> = {
  'Weak Outcome': 'text-state-danger',
  'Acceptable Outcome': 'text-state-warning',
  'Strong Outcome': 'text-state-success',
  'Excellent Outcome': 'text-text-accent',
  'Elite Rainmaker Outcome': 'text-text-accent',
};

function ScoreRing({ score, size = 80, label }: { score: number; size?: number; label?: string }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 75 ? '#FF7BC7' : score >= 55 ? '#4FD88B' : score >= 35 ? '#F3B64A' : '#FF5A6B';

  return (
    <div className="flex flex-col items-center gap-1.5">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={4} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={color} strokeWidth={4} strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex items-center justify-center" style={{ width: size, height: size }}>
        <span className="text-lg font-mono font-semibold text-text-primary">{score}</span>
      </div>
      {label && <span className="text-[10px] font-mono uppercase tracking-widest text-text-muted">{label}</span>}
    </div>
  );
}

function MetricRow({ label, value, max = 100, suffix = '' }: { label: string; value: number; max?: number; suffix?: string }) {
  const pct = Math.round((Math.max(0, value) / max) * 100);
  const color: 'success' | 'warning' | 'danger' | 'accent' =
    pct >= 70 ? 'success' : pct >= 45 ? 'warning' : 'danger';

  return (
    <div className="flex items-center gap-3">
      <span className="text-[11px] text-text-secondary w-40 shrink-0">{label}</span>
      <div className="flex-1"><ProgressBar value={pct} color={color} size="sm" /></div>
      <span className="text-[11px] font-mono text-text-primary w-12 text-right">{value}{suffix}</span>
    </div>
  );
}

function Card({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-bg-panel/60 border border-border-subtle rounded-[var(--radius-lg)] p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="text-text-accent">{icon}</div>
        <h3 className="text-[12px] font-semibold uppercase tracking-wider text-text-secondary">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export default function ResultsBoardScreen() {
  const state = useGameStore();
  const navigate = useNavigate();
  const results = useMemo(() => buildResultsBoard(state), [state]);

  // Redirect back if game isn't complete
  if (!state.gameComplete) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-text-secondary text-sm">The deal is still in progress.</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 text-[12px] font-mono uppercase tracking-wider text-text-accent border border-accent-primary/30 rounded-[var(--radius-md)] hover:bg-accent-soft transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary overflow-y-auto">
    <div className="max-w-[1100px] mx-auto space-y-6 px-6 pb-16 pt-4">
      {/* Hero Section */}
      <div className="text-center py-8 space-y-4">
        <div className={`text-[10px] font-mono uppercase tracking-[0.3em] ${
          state.collapseReason ? 'text-state-danger' : 'text-text-muted'
        }`}>
          {state.collapseReason ? 'Transaction Failed' : 'Transaction Complete'}
        </div>
        <h1 className="text-4xl font-display font-semibold text-text-primary">The M&A Rainmaker</h1>
        <p className="text-[13px] text-text-secondary">Solara Systems — {state.client.sector}</p>
        {state.collapseHeadline && (
          <p className="text-[12px] text-state-danger/80 max-w-md mx-auto">{state.collapseHeadline}</p>
        )}
      </div>

      {/* Top Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-bg-panel/60 border border-border-subtle rounded-[var(--radius-lg)] p-5 text-center">
          <div className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-2">Deal Outcome</div>
          <div className={`text-lg font-display font-semibold ${OUTCOME_COLORS[results.dealOutcome]}`}>
            {OUTCOME_LABELS[results.dealOutcome]}
          </div>
        </div>
        <div className="bg-bg-panel/60 border border-border-subtle rounded-[var(--radius-lg)] p-5 text-center">
          <div className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-2">Success Fee</div>
          <div className="text-lg font-mono font-semibold text-text-primary">
            {results.financial.successFee > 0 ? `€${(results.financial.successFee / 1000).toFixed(1)}M` : '—'}
          </div>
        </div>
        <div className="bg-bg-panel/60 border border-border-subtle rounded-[var(--radius-lg)] p-5 text-center">
          <div className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-2">Net Profit</div>
          <div className={`text-lg font-mono font-semibold ${results.financial.netProjectProfit >= 0 ? 'text-state-success' : 'text-state-danger'}`}>
            €{results.financial.netProjectProfit}k
          </div>
        </div>
        <div className="bg-bg-panel/60 border border-border-accent rounded-[var(--radius-lg)] p-5 text-center shadow-[var(--shadow-glow-soft)]">
          <div className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-2">Overall Grade</div>
          <div className={`text-lg font-display font-semibold ${GRADE_COLORS[results.scores.overallGrade]}`}>
            {results.scores.overallGrade}
          </div>
        </div>
      </div>

      {/* Score Overview */}
      <div className="bg-bg-panel/60 border border-border-subtle rounded-[var(--radius-lg)] p-6">
        <div className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-5 text-center">Performance Breakdown</div>
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
          {[
            { score: results.scores.financialScore, label: 'Financial' },
            { score: results.scores.clientScore, label: 'Client' },
            { score: results.scores.teamScore, label: 'Team' },
            { score: results.scores.processScore, label: 'Process' },
            { score: results.scores.careerImpactScore, label: 'Career' },
          ].map((item) => (
            <div key={item.label} className="relative flex flex-col items-center gap-2">
              <ScoreRing score={item.score} />
              <span className="text-[10px] font-mono uppercase tracking-widest text-text-muted">{item.label}</span>
            </div>
          ))}
          <div className="w-px h-20 bg-border-subtle mx-4" />
          <div className="relative flex flex-col items-center gap-2">
            <ScoreRing score={results.scores.overallDealScore} size={96} />
            <span className="text-[10px] font-mono uppercase tracking-widest text-text-accent">Overall</span>
          </div>
        </div>
      </div>

      {/* Detail Cards - Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card title="Financial Outcome" icon={<TrendingUp size={14} />}>
          <div className="space-y-3">
            <div className="flex justify-between text-[12px]">
              <span className="text-text-secondary">Transaction Value</span>
              <span className="font-mono text-text-primary">€{results.financial.closingValue}M</span>
            </div>
            <div className="flex justify-between text-[12px]">
              <span className="text-text-secondary">Success Fee ({(results.financial.feePercent * 100).toFixed(1)}%)</span>
              <span className="font-mono text-text-primary">€{results.financial.successFee}k</span>
            </div>
            <div className="flex justify-between text-[12px]">
              <span className="text-text-secondary">Project Cost</span>
              <span className="font-mono text-text-primary">€{results.financial.internalCost}k</span>
            </div>
            <div className="h-px bg-border-subtle my-1" />
            <div className="flex justify-between text-[12px]">
              <span className="text-text-secondary font-medium">Net Profit</span>
              <span className={`font-mono font-semibold ${results.financial.netProjectProfit >= 0 ? 'text-state-success' : 'text-state-danger'}`}>
                €{results.financial.netProjectProfit}k
              </span>
            </div>
            <div className="flex justify-between text-[12px]">
              <span className="text-text-secondary">Project Margin</span>
              <span className="font-mono text-text-primary">{Math.round(results.financial.projectMargin * 100)}%</span>
            </div>
            <div className="flex justify-between text-[12px]">
              <span className="text-text-secondary">Budget Remaining</span>
              <span className="font-mono text-text-primary">€{results.financial.budgetVariance}k</span>
            </div>
          </div>
        </Card>

        <Card title="Client Outcome" icon={<Users size={14} />}>
          <div className="mb-4">
            <span className={`text-[13px] font-semibold ${
              results.client.label === 'Trusted Advisor' ? 'text-text-accent' :
              results.client.label === 'Very Satisfied' ? 'text-state-success' :
              results.client.label === 'Satisfied' ? 'text-state-warning' : 'text-state-danger'
            }`}>{results.client.label}</span>
          </div>
          <div className="space-y-2.5">
            <MetricRow label="Satisfaction" value={results.client.satisfaction} />
            <MetricRow label="Trust" value={results.client.trust} />
            <MetricRow label="Expectation Fit" value={results.client.expectationFit} />
            <MetricRow label="Rehire Probability" value={results.client.rehireProbability} suffix="%" />
          </div>
        </Card>

        <Card title="Team Outcome" icon={<Briefcase size={14} />}>
          <div className="mb-4">
            <span className={`text-[13px] font-semibold ${
              results.team.label === 'Strong' ? 'text-state-success' :
              results.team.label === 'Solid' ? 'text-state-info' :
              results.team.label === 'Strained' ? 'text-state-warning' : 'text-state-danger'
            }`}>{results.team.label}</span>
          </div>
          <div className="space-y-2.5">
            <MetricRow label="Morale" value={results.team.morale} />
            <MetricRow label="Burnout" value={results.team.burnout} />
            <MetricRow label="Cohesion" value={results.team.cohesion} />
            <MetricRow label="Execution Pride" value={results.team.pride} />
          </div>
        </Card>
      </div>

      {/* Detail Cards - Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card title="Process Quality" icon={<Shield size={14} />}>
          <div className="space-y-2.5">
            <MetricRow label="Process Quality" value={results.process.processQuality} />
            <MetricRow label="Buyer Management" value={results.process.buyerManagement} />
            <MetricRow label="Risk Control" value={results.process.riskControl} />
            <MetricRow label="Negotiation Quality" value={results.process.negotiationQuality} />
            <MetricRow label="Closing Quality" value={results.process.closingQuality} />
          </div>
        </Card>

        <Card title="Career Impact" icon={<Star size={14} />}>
          <div className="space-y-4">
            <div className="flex justify-between text-[12px]">
              <span className="text-text-secondary">Reputation Gain</span>
              <span className={`font-mono font-semibold ${results.career.reputationGain >= 0 ? 'text-state-success' : 'text-state-danger'}`}>
                {results.career.reputationGain > 0 ? '+' : ''}{results.career.reputationGain}
              </span>
            </div>
            <div>
              <div className="flex justify-between text-[12px] mb-1">
                <span className="text-text-secondary">Rainmaker Score</span>
                <span className="font-mono text-text-primary">{results.career.rainmakerScore}</span>
              </div>
              <ProgressBar value={results.career.rainmakerScore} color="accent" size="md" />
            </div>
            <div className="flex justify-between text-[12px]">
              <span className="text-text-secondary">Sector Credibility</span>
              <span className={`font-mono font-semibold ${results.career.sectorCredibilityGain >= 0 ? 'text-state-success' : 'text-state-danger'}`}>
                {results.career.sectorCredibilityGain > 0 ? '+' : ''}{results.career.sectorCredibilityGain}
              </span>
            </div>
          </div>
        </Card>

        <Card title="Key Drivers" icon={<Trophy size={14} />}>
          <div className="space-y-2.5">
            {results.keyDrivers.map((driver, i) => (
              <div key={i} className="flex items-start gap-2">
                <ChevronRight size={12} className="text-text-accent shrink-0 mt-0.5" />
                <p className="text-[11px] text-text-secondary leading-relaxed">{driver}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Deal Summary */}
      <div className="bg-bg-panel/60 border border-border-subtle rounded-[var(--radius-lg)] p-6 text-center">
        <p className="text-[12px] text-text-muted">
          Completed in {state.totalWeeks} weeks across {state.phase + 1} phases
          {' '}— {state.tasks.filter((t) => t.status === 'completed').length} tasks completed
          {' '}— {state.buyers.length} buyers engaged
        </p>
      </div>

      {/* Play Again */}
      <div className="flex justify-center pt-4 pb-8">
        <button
          onClick={() => {
            localStorage.removeItem('ma-rainmaker-save');
            window.location.replace('/');
          }}
          className="flex items-center gap-2 px-6 py-3 text-[12px] font-mono uppercase tracking-wider text-text-accent border border-accent-primary/30 rounded-[var(--radius-md)] hover:bg-accent-soft hover:shadow-[var(--shadow-glow-soft)] transition-all duration-200"
        >
          <RotateCcw size={14} />
          Play Again
        </button>
      </div>
    </div>
    </div>
  );
}
