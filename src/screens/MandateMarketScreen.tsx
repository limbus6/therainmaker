// ============================================
// Mandate Market — choose the next engagement (M5a)
// ============================================

import { useRef, useState } from 'react';
import { useCareerStore } from '../store/careerStore';
import { MANDATE_POOL, isShortMandate, stashPendingMandate } from '../content/mandates';
import { buildBeaconSummary } from '../engine/beaconCareer';
import { getDailyMandate } from '../engine/dailyMandate';
import { buildPendingChallenge, decodeChallengeCode, type ChallengeConfig } from '../engine/challengeSeed';
import { useDailyStore } from '../store/dailyStore';
import { useNavigate } from 'react-router-dom';
import { Briefcase, TrendingUp, Landmark, LibraryBig, Swords, CalendarDays, LockKeyhole, KeyRound, Play } from 'lucide-react';

export default function MandateMarketScreen() {
  const navigate = useNavigate();
  const tombstones = useCareerStore((s) => s.tombstones);
  const careerReputation = useCareerStore((s) => s.careerReputation);
  const beaconTombstones = useCareerStore((s) => s.beaconTombstones);
  const recordMarketDecision = useCareerStore((s) => s.recordMarketDecision);
  const dailyResults = useDailyStore((state) => state.results);
  const rivalry = buildBeaconSummary(beaconTombstones);
  const daily = getDailyMandate(new Date());
  const dailyResult = dailyResults.find((result) => result.dailyKey === daily.dailyKey);
  const startingRef = useRef(false);
  const [startingMandateId, setStartingMandateId] = useState<string | null>(null);
  const [challengeInput, setChallengeInput] = useState('');
  const [challengeError, setChallengeError] = useState('');
  const [challengePreview, setChallengePreview] = useState<ChallengeConfig | null>(null);

  const startMandate = (mandateId: string) => {
    if (startingRef.current) return;
    const mandate = MANDATE_POOL.find((m) => m.id === mandateId);
    if (!mandate) return;
    startingRef.current = true;
    setStartingMandateId(mandateId);
    recordMarketDecision(mandate.id, new Date().toISOString());
    stashPendingMandate({
      id: mandate.id,
      // Deterministic per (mandate, career step) — replaying the market after
      // another mandate offers a genuinely different run of the same weather.
      seed: mandate.seedBase + tombstones.length * 7919,
      difficulty: mandate.difficulty,
      careerReputationBonus: careerReputation,
      startingReputationBonus: careerReputation,
    });
    localStorage.removeItem('ma-rainmaker-save');
    window.location.replace(import.meta.env.BASE_URL);
  };

  const startDailyMandate = () => {
    if (startingRef.current) return;
    startingRef.current = true;
    setStartingMandateId('daily');
    stashPendingMandate(daily.pendingMandate);
    localStorage.removeItem('ma-rainmaker-save');
    window.location.replace(import.meta.env.BASE_URL);
  };

  const inspectChallenge = () => {
    const decoded = decodeChallengeCode(challengeInput);
    if (!decoded.ok) {
      setChallengePreview(null);
      setChallengeError(decoded.message);
      return;
    }
    setChallengeError('');
    setChallengePreview(decoded.config);
  };

  const startChallenge = () => {
    const decoded = decodeChallengeCode(challengeInput);
    if (!decoded.ok) {
      setChallengePreview(null);
      setChallengeError(decoded.message);
      return;
    }
    if (startingRef.current) return;
    startingRef.current = true;
    setStartingMandateId('challenge');
    const attemptId = `challenge-${Date.now().toString(36)}`;
    stashPendingMandate(buildPendingChallenge(decoded.config, attemptId));
    localStorage.removeItem('ma-rainmaker-save');
    window.location.replace(import.meta.env.BASE_URL);
  };

  return (
    <div className="min-h-screen bg-bg-primary px-4 py-10">
      <div className="mx-auto w-full max-w-4xl space-y-8">
        <header className="relative text-center">
          <button
            type="button"
            onClick={() => navigate('/career')}
            className="mb-5 inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-border-default px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-text-secondary transition-colors hover:border-border-accent hover:text-text-accent sm:absolute sm:right-0 sm:top-0 sm:mb-0"
          >
            <LibraryBig size={13} /> View Career
          </button>
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-text-accent">Clearwater Advisory</p>
          <h1 className="mt-2 text-3xl font-display font-semibold text-text-primary">The Mandate Market</h1>
          <p className="mt-2 text-[13px] text-text-secondary">Every engagement is the same craft under different weather. Choose yours.</p>
        </header>

        {/* Career strip */}
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 rounded-[var(--radius-lg)] border border-border-subtle bg-bg-secondary/70 px-6 py-4">
          <span className="flex items-center gap-2 text-[12px] text-text-secondary">
            <Landmark size={14} className="text-text-accent" />
            Tombstones: <span className="font-mono font-semibold text-text-primary">{tombstones.length}</span>
          </span>
          <span className="flex items-center gap-2 text-[12px] text-text-secondary">
            <TrendingUp size={14} className="text-text-accent" />
            Career reputation: <span className="font-mono font-semibold text-text-primary">+{careerReputation}</span>
          </span>
          <span className="flex items-center gap-2 text-[12px] text-text-secondary">
            <Swords size={14} className="text-text-accent" />
            Rivalry: <span className="font-mono font-semibold text-text-primary">Clearwater {rivalry.clearwaterWins}—{rivalry.beaconWins} Beacon</span>
          </span>
          {tombstones.length > 0 && (
            <span className="text-[11px] font-mono text-text-muted">
              Last: {tombstones.at(-1)!.mandateLabel.split('—')[1]?.trim() ?? tombstones.at(-1)!.mandateLabel} · {tombstones.at(-1)!.outcome === 'closed' ? `€${tombstones.at(-1)!.closingValue}M · ${tombstones.at(-1)!.grade}` : 'Collapsed'}
            </span>
          )}
        </div>

        {/* Daily comparison mandate */}
        <section className="rounded-[var(--radius-lg)] border border-border-accent bg-gradient-to-r from-accent-soft to-bg-secondary p-5 sm:p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-2 text-text-accent">
                <CalendarDays size={15} />
                <span className="text-[10px] font-mono uppercase tracking-[0.2em]">Today’s Daily Mandate</span>
                {dailyResult && <span className="rounded-full border border-state-success/30 bg-state-success/10 px-2 py-0.5 text-[9px] font-mono uppercase text-state-success">Result locked</span>}
              </div>
              <h2 className="mt-2 text-xl font-display font-semibold text-text-primary">{daily.mandateLabel}</h2>
              <p className="mt-1 text-[11px] leading-relaxed text-text-secondary">
                {daily.dateKey} UTC · {daily.archetypeName} · five stages · seed {daily.seed}
              </p>
              <div className="mt-3 flex items-start gap-2 text-[10px] leading-relaxed text-text-muted">
                <LockKeyhole size={12} className="mt-0.5 shrink-0 text-text-accent" />
                <span>Same season, mandate, build, buyer pool and RNG for everyone. Career reputation is ignored and today’s first result is final.</span>
              </div>
              {dailyResult && (
                <p className="mt-3 text-[10px] font-mono text-text-primary">
                  Official: {dailyResult.grade} · {dailyResult.score}/100 · {dailyResult.outcome === 'closed' ? `€${dailyResult.closingValue}M` : 'Collapsed'}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={startDailyMandate}
              disabled={startingMandateId !== null}
              className="shrink-0 rounded-[var(--radius-md)] bg-accent-primary px-5 py-3 text-[11px] font-mono font-semibold uppercase tracking-wider text-white transition-all hover:bg-accent-hover hover:shadow-[var(--shadow-glow-soft)] disabled:cursor-wait disabled:opacity-60"
            >
              {startingMandateId === 'daily' ? 'Opening…' : dailyResult ? 'Replay Unranked' : 'Play Today'}
            </button>
          </div>
          <p className="mt-4 border-t border-border-subtle/60 pt-3 text-[9px] font-mono text-text-muted">Comparison season: {daily.seasonId}</p>
        </section>

        {/* Friend challenge seed */}
        <section className="rounded-[var(--radius-lg)] border border-border-subtle bg-bg-secondary/70 p-5 sm:p-6">
          <div className="flex items-center gap-2 text-text-accent">
            <KeyRound size={14} />
            <h2 className="text-[10px] font-mono uppercase tracking-[0.2em]">Play a Challenge Seed</h2>
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-text-secondary">
            Paste a friend’s RM1 code. The code fixes every starting input; your career, Beacon ledger, and Daily record stay untouched.
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={challengeInput}
              onChange={(event) => {
                setChallengeInput(event.target.value.toUpperCase());
                setChallengeError('');
                setChallengePreview(null);
              }}
              placeholder="RM1-…"
              aria-label="Challenge code"
              className="min-w-0 flex-1 rounded-[var(--radius-md)] border border-border-default bg-bg-primary px-4 py-2.5 text-[11px] font-mono tracking-wide text-text-primary outline-none transition-colors placeholder:text-text-muted/50 focus:border-border-accent"
            />
            <button
              type="button"
              onClick={challengePreview ? startChallenge : inspectChallenge}
              disabled={!challengeInput.trim() || startingMandateId !== null}
              className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] border border-border-accent px-5 py-2.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-text-accent transition-colors hover:bg-accent-soft disabled:cursor-not-allowed disabled:opacity-40"
            >
              {challengePreview ? <Play size={12} /> : <KeyRound size={12} />}
              {startingMandateId === 'challenge' ? 'Opening…' : challengePreview ? 'Play Challenge' : 'Verify Code'}
            </button>
          </div>
          {challengeError && <p role="alert" className="mt-2 text-[10px] text-state-danger">{challengeError}</p>}
          {challengePreview && (
            <div className="mt-3 rounded-[var(--radius-md)] border border-state-success/25 bg-state-success/5 p-3">
              <p className="text-[10px] font-semibold text-state-success">Verified for season {challengePreview.seasonId}</p>
              <p className="mt-1 text-[10px] text-text-secondary">
                {challengePreview.mandateLabel} · {challengePreview.archetypeName} · seed {challengePreview.seed} · fixed reputation +{challengePreview.startingReputationBonus}
              </p>
            </div>
          )}
        </section>

        {/* Mandate cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {MANDATE_POOL.map((mandate) => {
            const attempts = tombstones.filter((t) => t.mandateId === mandate.id);
            const bestClosed = attempts.filter((t) => t.outcome === 'closed').sort((a, b) => b.closingValue - a.closingValue)[0];
            return (
              <button
                key={mandate.id}
                onClick={() => startMandate(mandate.id)}
                disabled={startingMandateId !== null}
                className="flex flex-col rounded-[var(--radius-lg)] border-2 border-border-subtle bg-bg-secondary/90 p-5 text-left transition-all hover:-translate-y-0.5 hover:border-accent-primary active:scale-95 disabled:cursor-wait disabled:opacity-60"
              >
                <div className="flex items-center gap-2 text-text-accent">
                  <Briefcase size={14} />
                  <span className="text-[10px] font-mono uppercase tracking-widest">Difficulty {mandate.difficulty.overall}</span>
                </div>
                <p className="mt-2 text-[9px] font-mono uppercase tracking-wider text-text-muted">
                  {isShortMandate(mandate.id) ? 'Short engagement' : 'Flagship engagement'} · {mandate.phaseSequence.length} stages
                </p>
                <h2 className="mt-2 text-[15px] font-semibold leading-snug text-text-primary">{mandate.label}</h2>
                <p className="mt-1 text-[11px] italic text-text-secondary">{mandate.conditions}</p>
                <p className="mt-3 flex-1 text-[11px] leading-relaxed text-text-muted">{mandate.description}</p>
                <div className="mt-4 space-y-1 border-t border-border-subtle/60 pt-3">
                  {careerReputation > 0 && (
                    <p className="text-[10px] text-text-muted">Career reputation carries in: <span className="font-mono text-text-accent">+{careerReputation} starting reputation</span></p>
                  )}
                  <p className="text-[10px] font-mono text-text-muted">
                    {attempts.length === 0 ? 'Never attempted' : bestClosed ? `Best close: €${bestClosed.closingValue}M (${bestClosed.grade})` : `${attempts.length} attempt${attempts.length === 1 ? '' : 's'}, no close yet`}
                  </p>
                  {startingMandateId === mandate.id && <p className="text-[10px] font-mono text-text-accent">Opening engagement…</p>}
                </div>
              </button>
            );
          })}
        </div>

        <p className="text-center text-[10px] font-mono uppercase tracking-widest text-text-muted">
          Accepting a mandate opens a fresh engagement — your career and tombstones persist.
        </p>
        <p className="text-center text-[10px] text-text-muted">
          Beacon rule: when Clearwater chooses, Beacon takes the highest-difficulty mandate left on the table.
        </p>
      </div>
    </div>
  );
}
