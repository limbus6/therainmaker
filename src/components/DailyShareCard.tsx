import { useState } from 'react';
import { Check, Copy, CalendarDays } from 'lucide-react';
import { buildDailyShareText, type DailyResult } from '../store/dailyStore';

export default function DailyShareCard({ result }: { result: DailyResult }) {
  const [copied, setCopied] = useState(false);
  const shareText = buildDailyShareText(result);

  const copyResult = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="rounded-[var(--radius-lg)] border border-border-accent bg-accent-soft p-5 sm:p-6" aria-labelledby="daily-result-heading">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-text-accent">
            <CalendarDays size={14} />
            <h2 id="daily-result-heading" className="text-[10px] font-mono uppercase tracking-[0.2em]">Official Daily Result</h2>
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-text-secondary">
            First result locked for {result.dateKey} UTC. Daily results do not change career reputation or the Beacon ledger.
          </p>
        </div>
        <button
          type="button"
          onClick={() => { void copyResult(); }}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-[var(--radius-md)] border border-border-accent bg-bg-secondary/70 px-4 py-2 text-[10px] font-mono uppercase tracking-wider text-text-accent transition-colors hover:bg-bg-elevated"
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? 'Copied' : 'Copy Result'}
        </button>
      </div>
      <pre className="mt-4 overflow-x-auto rounded-[var(--radius-md)] border border-border-subtle bg-bg-primary/70 p-4 text-[10px] leading-relaxed text-text-primary">{shareText}</pre>
    </section>
  );
}
