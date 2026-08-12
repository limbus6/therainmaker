import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Gauge,
  KeyRound,
  Landmark,
  Swords,
  Trophy,
} from 'lucide-react';
import { getArchetype, type ArchetypeId } from '../content/archetypes';
import { buildBeaconSummary } from '../engine/beaconCareer';
import { buildCareerSummary, type CareerRecord } from '../engine/careerSummary';
import { getDailyMandate } from '../engine/dailyMandate';
import { useCareerStore, type BeaconTombstone, type Tombstone } from '../store/careerStore';
import { useDailyStore, type DailyResult } from '../store/dailyStore';
import { buildChallengeAttemptSummary, useChallengeStore } from '../store/challengeStore';
import { formatNumber } from '../utils/numberFormat';

function mandateName(label: string): string {
  return label.split('—')[1]?.trim() ?? label;
}

function completedDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date unavailable';
  return date.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
}

function buildName(archetype: string | null): string {
  if (!archetype) return 'No build recorded';
  return getArchetype(archetype as ArchetypeId)?.name ?? archetype.replaceAll('_', ' ');
}

function StatCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-border-subtle bg-bg-panel/60 p-4">
      <p className="text-[9px] font-mono uppercase tracking-[0.18em] text-text-muted">{label}</p>
      <p className="mt-2 text-2xl font-display font-semibold text-text-primary">{value}</p>
      <p className="mt-1 text-[10px] leading-relaxed text-text-secondary">{detail}</p>
    </div>
  );
}

function RecordCard({
  icon,
  title,
  record,
  value,
  rule,
}: {
  icon: React.ReactNode;
  title: string;
  record: CareerRecord | null;
  value: (record: CareerRecord) => string;
  rule: string;
}) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-border-subtle bg-bg-secondary/70 p-4">
      <div className="flex items-center gap-2 text-text-accent">
        {icon}
        <p className="text-[10px] font-mono uppercase tracking-wider">{title}</p>
      </div>
      <p className="mt-3 text-xl font-display font-semibold text-text-primary">
        {record ? value(record) : '—'}
      </p>
      <p className="mt-1 text-[10px] text-text-secondary">
        {record ? `${mandateName(record.tombstone.mandateLabel)} · ${completedDate(record.tombstone.completedAt)}` : 'Complete a mandate to set this record.'}
      </p>
      <p className="mt-2 border-t border-border-subtle/60 pt-2 text-[9px] leading-relaxed text-text-muted">{rule}</p>
    </div>
  );
}

function TombstoneCard({ tombstone, number }: { tombstone: Tombstone; number: number }) {
  const closed = tombstone.outcome === 'closed';

  return (
    <article className={`rounded-[var(--radius-lg)] border bg-bg-panel/55 p-4 sm:p-5 ${closed ? 'border-border-subtle' : 'border-state-danger/25'}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[9px] font-mono uppercase tracking-widest text-text-muted">Mandate {String(number).padStart(2, '0')}</span>
            <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider ${closed ? 'border-state-success/30 bg-state-success/10 text-state-success' : 'border-state-danger/30 bg-state-danger/10 text-state-danger'}`}>
              {closed ? <CheckCircle2 size={10} /> : <AlertTriangle size={10} />}
              {closed ? 'Closed' : 'Collapsed'}
            </span>
          </div>
          <h2 className="mt-2 text-[16px] font-semibold text-text-primary">{tombstone.mandateLabel}</h2>
          <p className="mt-0.5 text-[11px] text-text-secondary">{tombstone.companyName} · {completedDate(tombstone.completedAt)}</p>
        </div>
        <div className="shrink-0 sm:text-right">
          <p className={`text-2xl font-display font-semibold ${closed ? 'text-text-accent' : 'text-state-danger'}`}>
            {closed ? `€${formatNumber(tombstone.closingValue)}M` : 'No close'}
          </p>
          <p className="text-[10px] font-mono text-text-muted">
            {tombstone.impliedMultiple === null ? 'Multiple —' : `${formatNumber(tombstone.impliedMultiple, 1)}x implied multiple`}
          </p>
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-border-subtle/60 pt-4 sm:grid-cols-3 lg:grid-cols-6">
        {[
          ['Buyer', tombstone.buyerName ?? 'No buyer selected'],
          ['Advisory fee', `€${formatNumber(tombstone.totalAdvisoryFee)}k`],
          ['Grade', tombstone.grade],
          ['Process', `${formatNumber(tombstone.processScore, 0)}/100`],
          ['Build', buildName(tombstone.archetype)],
          ['Elapsed', `${formatNumber(tombstone.daysTaken, 0)} days`],
        ].map(([label, value]) => (
          <div key={label} className="min-w-0">
            <dt className="text-[8px] font-mono uppercase tracking-wider text-text-muted">{label}</dt>
            <dd className="mt-1 break-words text-[10px] font-medium capitalize text-text-primary">{value}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}

function BeaconHistoryCard({ tombstone }: { tombstone: BeaconTombstone }) {
  const beaconWon = tombstone.outcome === 'beacon_win';
  const trigger = tombstone.trigger === 'player_declined'
    ? 'Mandate declined by Clearwater'
    : tombstone.trigger === 'player_lost'
      ? 'Clearwater process collapsed'
      : 'Clearwater closed the mandate';

  return (
    <article className={`rounded-[var(--radius-lg)] border p-4 ${beaconWon ? 'border-state-danger/25 bg-state-danger/5' : 'border-state-success/25 bg-state-success/5'}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={`text-[9px] font-mono uppercase tracking-wider ${beaconWon ? 'text-state-danger' : 'text-state-success'}`}>
            {beaconWon ? 'Beacon win' : 'Clearwater win'}
          </p>
          <h3 className="mt-1 text-[13px] font-semibold text-text-primary">{mandateName(tombstone.mandateLabel)}</h3>
          <p className="mt-0.5 text-[9px] text-text-muted">{trigger} · {completedDate(tombstone.completedAt)}</p>
        </div>
        <p className={`shrink-0 text-lg font-display font-semibold ${beaconWon ? 'text-state-danger' : 'text-state-success'}`}>
          {beaconWon ? `€${formatNumber(tombstone.closingValue)}M` : 'Beaten'}
        </p>
      </div>
      {beaconWon && (
        <p className="mt-3 text-[10px] text-text-secondary">
          {tombstone.buyerName} · €{formatNumber(tombstone.totalAdvisoryFee)}k fee · {tombstone.daysTaken} days
        </p>
      )}
      <p className="mt-3 border-t border-border-subtle/60 pt-2 text-[9px] leading-relaxed text-text-muted">{tombstone.rule}</p>
    </article>
  );
}

function DailyHistoryCard({ result }: { result: DailyResult }) {
  return (
    <article className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-border-subtle bg-bg-secondary/60 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[9px] font-mono uppercase tracking-wider text-text-accent">{result.dateKey} UTC</p>
          <span className="text-[8px] font-mono text-text-muted">{result.seasonId}</span>
        </div>
        <h3 className="mt-1 text-[12px] font-semibold text-text-primary">{mandateName(result.mandateLabel)} · {result.archetype}</h3>
        <p className="mt-0.5 text-[9px] text-text-muted">Process {result.processScore}/100 · {result.daysTaken} days · seed {result.seed}</p>
      </div>
      <div className="shrink-0 sm:text-right">
        <p className="text-lg font-display font-semibold text-text-primary">{result.score}/100</p>
        <p className={`text-[9px] font-mono ${result.outcome === 'closed' ? 'text-state-success' : 'text-state-danger'}`}>
          {result.outcome === 'closed' ? `€${formatNumber(result.closingValue)}M${result.impliedMultiple === null ? '' : ` · ${result.impliedMultiple}x`}` : 'Collapsed'}
        </p>
      </div>
    </article>
  );
}

export default function CareerScreen() {
  const navigate = useNavigate();
  const tombstones = useCareerStore((state) => state.tombstones);
  const careerReputation = useCareerStore((state) => state.careerReputation);
  const beaconTombstones = useCareerStore((state) => state.beaconTombstones);
  const dailyResults = useDailyStore((state) => state.results);
  const challengeResults = useChallengeStore((state) => state.results);
  const summary = useMemo(() => buildCareerSummary(tombstones), [tombstones]);
  const newestFirst = useMemo(() => [...tombstones].reverse(), [tombstones]);
  const beaconSummary = useMemo(() => buildBeaconSummary(beaconTombstones), [beaconTombstones]);
  const newestBeaconFirst = useMemo(() => [...beaconTombstones].reverse(), [beaconTombstones]);
  const currentDaily = getDailyMandate(new Date());
  const currentSeasonResults = useMemo(
    () => dailyResults.filter((result) => result.seasonId === currentDaily.seasonId),
    [currentDaily.seasonId, dailyResults],
  );
  const bestDailyScore = currentSeasonResults.reduce<DailyResult | null>((best, result) => !best || result.score > best.score ? result : best, null);
  const bestDailyClose = currentSeasonResults.filter((result) => result.outcome === 'closed').reduce<DailyResult | null>((best, result) => !best || result.closingValue > best.closingValue ? result : best, null);
  const fastestDailyClose = currentSeasonResults.filter((result) => result.outcome === 'closed').reduce<DailyResult | null>((best, result) => !best || result.daysTaken < best.daysTaken ? result : best, null);
  const challengeCodes = useMemo(
    () => [...new Set([...challengeResults].reverse().map((result) => result.challengeCode))],
    [challengeResults],
  );

  return (
    <main className="min-h-screen bg-bg-primary px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-6xl space-y-8">
        <header className="flex flex-col gap-5 border-b border-border-subtle pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <button
              type="button"
              onClick={() => navigate('/mandates')}
              className="mb-4 inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-text-muted transition-colors hover:text-text-accent"
            >
              <ArrowLeft size={12} /> Mandate Market
            </button>
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-text-accent">Clearwater Advisory</p>
            <h1 className="mt-2 text-4xl font-display font-semibold text-text-primary">The Deal Shelf</h1>
            <p className="mt-2 max-w-2xl text-[12px] leading-relaxed text-text-secondary">
              Every mandate stays on the shelf. Wins carry their economics; failures preserve the process that produced them.
            </p>
          </div>
          <div className="rounded-[var(--radius-lg)] border border-border-accent bg-accent-soft px-5 py-3 sm:text-right">
            <p className="text-[9px] font-mono uppercase tracking-widest text-text-muted">Career reputation</p>
            <p className="mt-1 text-2xl font-display font-semibold text-text-accent">{careerReputation}<span className="text-sm text-text-muted"> / 20</span></p>
            <p className="text-[9px] text-text-secondary">Earned from process quality, never closing luck.</p>
          </div>
        </header>

        <section aria-labelledby="career-totals">
          <h2 id="career-totals" className="mb-3 text-[10px] font-mono uppercase tracking-[0.2em] text-text-muted">Career ledger</h2>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard label="Mandates" value={String(summary.totalMandates)} detail={`${summary.closedDeals} closed · ${summary.failedDeals} collapsed`} />
            <StatCard label="Close rate" value={`${summary.closeRate}%`} detail="Closed mandates divided by all recorded attempts." />
            <StatCard label="Aggregate deal value" value={`€${formatNumber(summary.aggregateClosingValue)}M`} detail="Closing value from successful mandates only." />
            <StatCard label="Advisory fees" value={`€${formatNumber(summary.aggregateAdvisoryFees)}k`} detail="Total recorded fees, including retained fees on failures." />
          </div>
        </section>

        <section aria-labelledby="career-records">
          <div className="mb-3 flex items-end justify-between gap-4">
            <div>
              <h2 id="career-records" className="text-[10px] font-mono uppercase tracking-[0.2em] text-text-muted">Personal records</h2>
              <p className="mt-1 text-[10px] text-text-secondary">Each record names the mandate that set it.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <RecordCard icon={<Trophy size={13} />} title="Best close" record={summary.bestClose} value={(record) => `€${formatNumber(record.value)}M`} rule="Highest closing value among completed deals." />
            <RecordCard icon={<Gauge size={13} />} title="Best process" record={summary.bestProcess} value={(record) => `${formatNumber(record.value, 0)}/100`} rule="Highest causal process score, including well-run failures." />
            <RecordCard icon={<CalendarDays size={13} />} title="Fastest close" record={summary.fastestClose} value={(record) => `${formatNumber(record.value, 0)} days`} rule="Fewest elapsed days among completed deals." />
            <RecordCard icon={<CircleDollarSign size={13} />} title="Largest fee" record={summary.bestFee} value={(record) => `€${formatNumber(record.value)}k`} rule="Highest total advisory fee on a completed deal." />
          </div>
        </section>

        <section aria-labelledby="rival-ledger">
          <div className="rounded-[var(--radius-lg)] border border-border-accent bg-bg-panel/50 p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 id="rival-ledger" className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-text-accent">
                  <Swords size={14} /> Beacon Partners — Rival ledger
                </h2>
                <p className="mt-2 max-w-2xl text-[11px] leading-relaxed text-text-secondary">
                  Beacon wins through named career rules, never hidden rubber-banding. Every result below says why it happened.
                </p>
              </div>
              <div className="shrink-0 sm:text-right">
                <p className="text-2xl font-display font-semibold text-text-primary">Clearwater {beaconSummary.clearwaterWins}—{beaconSummary.beaconWins} Beacon</p>
                <p className="text-[9px] font-mono text-text-muted">
                  {beaconSummary.declinedMandatesWon} declined · {beaconSummary.rescuedProcesses} restarted
                </p>
              </div>
            </div>

            {newestBeaconFirst.length === 0 ? (
              <p className="mt-5 rounded-[var(--radius-md)] border border-dashed border-border-default px-4 py-6 text-center text-[10px] text-text-muted">
                Choose a mandate to begin the rivalry ledger.
              </p>
            ) : (
              <div className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-2">
                {newestBeaconFirst.map((tombstone) => <BeaconHistoryCard key={tombstone.runKey} tombstone={tombstone} />)}
              </div>
            )}
          </div>
        </section>

        <section aria-labelledby="daily-ledger">
          <div className="rounded-[var(--radius-lg)] border border-border-subtle bg-bg-panel/50 p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 id="daily-ledger" className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-text-accent">
                  <CalendarDays size={14} /> Daily league
                </h2>
                <p className="mt-2 text-[11px] text-text-secondary">Season {currentDaily.seasonId} · results are isolated from career power.</p>
              </div>
              <button type="button" onClick={() => navigate('/mandates')} className="text-[10px] font-mono uppercase tracking-wider text-text-accent hover:underline">
                Play today →
              </button>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <StatCard label="Best daily score" value={bestDailyScore ? `${bestDailyScore.score}/100` : '—'} detail={bestDailyScore ? bestDailyScore.dateKey : 'No result in this season.'} />
              <StatCard label="Best daily close" value={bestDailyClose ? `€${formatNumber(bestDailyClose.closingValue)}M` : '—'} detail={bestDailyClose ? bestDailyClose.dateKey : 'No close in this season.'} />
              <StatCard label="Fastest daily close" value={fastestDailyClose ? `${fastestDailyClose.daysTaken} days` : '—'} detail={fastestDailyClose ? fastestDailyClose.dateKey : 'No close in this season.'} />
            </div>

            {dailyResults.length === 0 ? (
              <p className="mt-4 rounded-[var(--radius-md)] border border-dashed border-border-default px-4 py-6 text-center text-[10px] text-text-muted">No daily results yet.</p>
            ) : (
              <div className="mt-4 space-y-2">
                {[...dailyResults].reverse().slice(0, 12).map((result) => <DailyHistoryCard key={result.dailyKey} result={result} />)}
                {dailyResults.length > 12 && <p className="text-center text-[9px] font-mono text-text-muted">Showing the latest 12 of {dailyResults.length} daily results.</p>}
              </div>
            )}
          </div>
        </section>

        <section aria-labelledby="challenge-ledger">
          <div className="rounded-[var(--radius-lg)] border border-border-subtle bg-bg-panel/50 p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 id="challenge-ledger" className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-text-accent">
                  <KeyRound size={14} /> Challenge room
                </h2>
                <p className="mt-2 text-[11px] text-text-secondary">Local attempts are grouped by code so you can compare score, close value, and speed.</p>
              </div>
              <button type="button" onClick={() => navigate('/mandates')} className="text-[10px] font-mono uppercase tracking-wider text-text-accent hover:underline">
                Enter a code →
              </button>
            </div>

            {challengeCodes.length === 0 ? (
              <p className="mt-4 rounded-[var(--radius-md)] border border-dashed border-border-default px-4 py-6 text-center text-[10px] text-text-muted">No challenge attempts yet.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {challengeCodes.slice(0, 10).map((code) => {
                  const challenge = buildChallengeAttemptSummary(challengeResults, code);
                  const latest = challenge.attempts.at(-1)!;
                  return (
                    <article key={code} className="rounded-[var(--radius-lg)] border border-border-subtle bg-bg-secondary/60 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <p className="break-all text-[10px] font-mono font-semibold tracking-wide text-text-primary">{code}</p>
                          <p className="mt-1 text-[9px] text-text-muted">{latest.mandateLabel} · {latest.archetype} · reputation +{latest.startingReputationBonus} · season {latest.seasonId}</p>
                        </div>
                        <p className="shrink-0 text-[9px] font-mono uppercase tracking-wider text-text-accent">{challenge.attempts.length} attempt{challenge.attempts.length === 1 ? '' : 's'}</p>
                      </div>
                      <dl className="mt-3 grid grid-cols-3 gap-3 border-t border-border-subtle/60 pt-3">
                        <div><dt className="text-[8px] font-mono uppercase text-text-muted">Best score</dt><dd className="mt-1 text-[11px] text-text-primary">{challenge.bestScore?.score ?? '—'}/100</dd></div>
                        <div><dt className="text-[8px] font-mono uppercase text-text-muted">Best close</dt><dd className="mt-1 text-[11px] text-text-primary">{challenge.bestClose ? `€${formatNumber(challenge.bestClose.closingValue)}M` : '—'}</dd></div>
                        <div><dt className="text-[8px] font-mono uppercase text-text-muted">Fastest</dt><dd className="mt-1 text-[11px] text-text-primary">{challenge.fastestClose ? `${challenge.fastestClose.daysTaken} days` : '—'}</dd></div>
                      </dl>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <section aria-labelledby="tombstone-shelf">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="tombstone-shelf" className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-text-muted">
                <Landmark size={13} className="text-text-accent" /> Tombstone shelf
              </h2>
              <p className="mt-1 text-[10px] text-text-secondary">Newest mandate first · up to 50 career entries retained.</p>
            </div>
            {summary.totalMandates > 0 && <p className="text-[10px] font-mono text-text-muted">{summary.totalMandates} / 50 entries</p>}
          </div>

          {newestFirst.length === 0 ? (
            <div className="rounded-[var(--radius-lg)] border border-dashed border-border-default bg-bg-panel/40 px-6 py-14 text-center">
              <Briefcase size={24} className="mx-auto text-text-muted" />
              <h3 className="mt-4 text-lg font-display font-semibold text-text-primary">The shelf is waiting.</h3>
              <p className="mt-1 text-[11px] text-text-secondary">Complete or lose a mandate and its history will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {newestFirst.map((tombstone, index) => (
                <TombstoneCard key={tombstone.runKey} tombstone={tombstone} number={tombstones.length - index} />
              ))}
            </div>
          )}
        </section>

        <div className="flex justify-center border-t border-border-subtle pb-6 pt-8">
          <button
            type="button"
            onClick={() => navigate('/mandates')}
            className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-accent-primary px-6 py-3 text-[11px] font-mono font-semibold uppercase tracking-wider text-white transition-all hover:bg-accent-hover hover:shadow-[var(--shadow-glow-soft)] active:scale-95"
          >
            Choose Next Mandate <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </main>
  );
}
