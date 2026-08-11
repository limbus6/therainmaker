// ============================================
// Turn Tape — Non-blocking Live Turn Strip
// ============================================
// Persistent dashboard strip that plays each advance in place: animated day
// ticker, staggered tape items, and attributable resource delta chips.
// Replaces the blocking Situation Report modal for routine turns.

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { CheckCircle2, Mail, Users, AlertTriangle, Zap, FileText, FastForward, Clock3 } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { animateCounter, staggerReveal, prefersReducedMotion } from '../utils/motion';
import type { WeekResult } from '../engine/weekEngine';
import { formatResponseEffects } from '../utils/responseEffects';

const RESOURCE_LABELS: Record<string, string> = {
  budget: 'Budget',
  teamCapacity: 'Capacity',
  dealMomentum: 'Momentum',
  clientTrust: 'Trust',
  morale: 'Morale',
  riskLevel: 'Risk',
  reputation: 'Reputation',
};

const MAX_VISIBLE_ITEMS = 6;

interface TapeItem {
  id: string;
  icon: typeof CheckCircle2;
  title: string;
  subtitle: string;
  color: string;
}

function buildTapeItems(result: WeekResult): TapeItem[] {
  const items: TapeItem[] = [];

  result.tasksCompleted.forEach((t) => {
    items.push({ id: `task-${t.id}`, icon: CheckCircle2, title: t.name, subtitle: 'Completed', color: 'text-state-success' });
  });

  result.newEvents.forEach((evt) => {
    items.push({ id: `event-${evt.id}`, icon: Zap, title: evt.title, subtitle: 'Event', color: 'text-text-accent' });
  });

  result.buyerChanges.forEach((bc) => {
    items.push({
      id: `buyer-${bc.buyerId}-${bc.field}`,
      icon: Users,
      title: bc.buyerId,
      subtitle: `${bc.from} → ${bc.to}`,
      color: 'text-text-accent',
    });
  });

  result.newEmails
    .filter((e) => e.priority === 'urgent' || e.priority === 'high')
    .forEach((e) => {
      items.push({ id: `email-${e.id}`, icon: Mail, title: e.subject, subtitle: e.sender, color: 'text-state-warning' });
    });

  result.newRisks.forEach((r) => {
    items.push({ id: `risk-${r.id}`, icon: AlertTriangle, title: r.name, subtitle: `Risk (${r.severity})`, color: 'text-state-danger' });
  });

  return items;
}

export default function TurnTape() {
  const playback = useGameStore((s) => s.turnPlayback);
  const result = useGameStore((s) => s.lastWeekResult);
  const deltas = useGameStore((s) => s.lastResourceDeltas);
  const upcomingBeat = useGameStore((s) => s.eventDirectorState.upcomingBeats[0]);
  const completeTurnPlayback = useGameStore((s) => s.completeTurnPlayback);
  const openWeekReport = useGameStore((s) => s.openWeekReport);
  const emails = useGameStore((s) => s.emails);
  const respondToEmail = useGameStore((s) => s.respondToEmail);
  const addToast = useGameStore((s) => s.addToast);

  const dayRef = useRef<HTMLSpanElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const chipsRef = useRef<HTMLDivElement>(null);

  const playing = playback?.status === 'playing';
  const items = result ? buildTapeItems(result) : [];
  const visibleItems = items.slice(0, MAX_VISIBLE_ITEMS);
  const hiddenCount = items.length - visibleItems.length;
  const directDecision = playback?.status === 'done'
    ? result?.newEmails
        .map((newEmail) => emails.find((email) => email.id === newEmail.id))
        .find((email) =>
          email
          && email.state !== 'resolved'
          && (email.priority === 'urgent' || email.priority === 'high')
          && !!email.responseOptions?.length
        )
    : undefined;

  // Play the turn sequence in place, then release input.
  useEffect(() => {
    if (!playback || playback.status !== 'playing') return;

    if (prefersReducedMotion()) {
      completeTurnPlayback();
      return;
    }

    const tweens: (gsap.core.Tween | null)[] = [];
    tweens.push(animateCounter(dayRef.current, playback.fromDay, playback.toDay, 0.9, 'Day '));
    if (listRef.current) {
      tweens.push(staggerReveal(Array.from(listRef.current.children) as HTMLElement[], 0.12, 0.35));
    }
    if (chipsRef.current) {
      tweens.push(staggerReveal(Array.from(chipsRef.current.children) as HTMLElement[], 0.08, 0.3));
    }

    const totalMs = Math.min(2500, 1000 + visibleItems.length * 140 + deltas.length * 90);
    const timer = setTimeout(completeTurnPlayback, totalMs);

    return () => {
      clearTimeout(timer);
      tweens.forEach((tw) => tw?.kill());
    };
  }, [playback, completeTurnPlayback, visibleItems.length, deltas.length]);

  // Snap everything to its final state once playback ends (including skips).
  useEffect(() => {
    if (playback?.status !== 'done') return;
    if (dayRef.current) dayRef.current.textContent = `Day ${playback.toDay}`;
    if (listRef.current) gsap.set(listRef.current.children, { opacity: 1, y: 0, clearProps: 'transform' });
    if (chipsRef.current) gsap.set(chipsRef.current.children, { opacity: 1, y: 0, clearProps: 'transform' });
  }, [playback?.status, playback?.toDay]);

  if (!playback || !result) return null;

  return (
    <div className="rounded-[var(--radius-lg)] border border-border-subtle bg-bg-secondary p-4 min-h-[76px]">
      {/* Header row: day ticker, label, skip / report controls */}
      <div className="flex items-center justify-between gap-3 pb-2 border-b border-border-subtle">
        <div className="flex items-baseline gap-3">
          <span ref={dayRef} className="text-[15px] font-mono font-semibold text-text-primary">
            Day {playing ? playback.fromDay : playback.toDay}
          </span>
          <span className="text-[10px] font-mono uppercase tracking-widest text-text-muted">
            Deal Tape · +{result.daysAdvanced}d
          </span>
        </div>
        <div className="flex items-center gap-2">
          {playing ? (
            <button
              onClick={completeTurnPlayback}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius-sm)] border border-border-subtle text-[11px] text-text-secondary hover:bg-surface-hover transition-colors"
            >
              <FastForward size={12} /> Skip
            </button>
          ) : (
            <button
              onClick={openWeekReport}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius-sm)] border border-border-accent bg-border-accent/10 text-[11px] font-medium text-text-accent hover:bg-border-accent/20 transition-colors"
            >
              <FileText size={12} /> Situation Report
            </button>
          )}
        </div>
      </div>

      {/* Resource delta chips */}
      {deltas.length > 0 && (
        <div ref={chipsRef} className="flex flex-wrap items-center gap-2 pt-2.5">
          {deltas.map((d) => (
            <span
              key={d.resource}
              title={d.reason}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-mono cursor-default ${
                (d.resource === 'riskLevel' ? d.delta < 0 : d.delta > 0)
                  ? 'border-state-success/30 bg-state-success/10 text-state-success'
                  : 'border-state-danger/30 bg-state-danger/10 text-state-danger'
              }`}
            >
              {RESOURCE_LABELS[d.resource] ?? d.resource} {d.delta > 0 ? `+${d.delta}` : d.delta}
            </span>
          ))}
        </div>
      )}

      {/* Tape items */}
      {visibleItems.length === 0 ? (
        <p className="text-[12px] text-text-muted italic pt-2.5">
          Smooth progress — background workstreams advancing on schedule.
        </p>
      ) : (
        <div ref={listRef} className="space-y-1.5 pt-2.5">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.id} className="flex items-center gap-2.5 text-[12px]">
                <Icon size={14} className={`${item.color} shrink-0`} />
                <span className="font-medium text-text-primary truncate">{item.title}</span>
                <span className="text-[10px] font-mono text-text-muted ml-auto shrink-0">{item.subtitle}</span>
              </div>
            );
          })}
          {hiddenCount > 0 && (
            <button onClick={openWeekReport} className="text-[11px] text-text-accent hover:underline">
              +{hiddenCount} more in the Situation Report
            </button>
          )}
        </div>
      )}

      {directDecision?.responseOptions && (
        <div className="mt-3 rounded-[var(--radius-md)] border border-state-warning/30 bg-state-warning/5 p-3">
          <div className="mb-2 flex items-start gap-2">
            <Mail size={14} className="mt-0.5 shrink-0 text-state-warning" />
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-state-warning">Respond from the tape</p>
              <p className="mt-0.5 text-[12px] font-medium text-text-primary">{directDecision.subject}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {directDecision.responseOptions.map((option) => {
              const exactEffects = formatResponseEffects(option);
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    respondToEmail(directDecision.id, option.id);
                    addToast(`Response sent: ${option.label}`, 'success');
                  }}
                  title={exactEffects ?? undefined}
                  className="rounded-[var(--radius-sm)] border border-border-accent bg-border-accent/10 px-2.5 py-1.5 text-left text-[11px] font-medium text-text-accent transition-colors hover:bg-border-accent/20"
                >
                  <span>{option.label}</span>
                  {exactEffects && <span className="ml-1.5 font-mono text-[9px] text-text-muted">{exactEffects}</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {upcomingBeat && (
        <div className="mt-3 flex items-start gap-2 border-t border-border-subtle pt-2.5 text-[11px]">
          <Clock3 size={13} className="mt-0.5 shrink-0 text-text-accent" />
          <div>
            <span className="font-mono uppercase tracking-widest text-[9px] text-text-muted">Next on the tape</span>
            <p className="mt-0.5 text-text-secondary">{upcomingBeat.label}</p>
          </div>
        </div>
      )}
    </div>
  );
}
