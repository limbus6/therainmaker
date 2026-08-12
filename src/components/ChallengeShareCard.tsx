import { useState } from 'react';
import { Check, Copy, Swords } from 'lucide-react';
import { buildChallengeShareText, type ChallengeShareTarget } from '../store/challengeStore';

export default function ChallengeShareCard({ target, attemptCount = 0 }: { target: ChallengeShareTarget; attemptCount?: number }) {
  const [copied, setCopied] = useState(false);
  const shareText = buildChallengeShareText(target);

  const copyChallenge = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="rounded-[var(--radius-lg)] border border-border-accent bg-bg-panel/70 p-5 sm:p-6" aria-labelledby="challenge-result-heading">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-text-accent">
            <Swords size={14} />
            <h2 id="challenge-result-heading" className="text-[10px] font-mono uppercase tracking-[0.2em]">Challenge This Run</h2>
          </div>
          <p className="mt-2 max-w-2xl text-[11px] leading-relaxed text-text-secondary">
            This code fixes the season, mandate, build, seed, difficulty and starting reputation bonus. Challenge attempts never change career, Beacon, or Daily records.
          </p>
          {attemptCount > 0 && <p className="mt-1 text-[9px] font-mono text-text-muted">{attemptCount} local attempt{attemptCount === 1 ? '' : 's'} recorded for this code.</p>}
        </div>
        <button
          type="button"
          onClick={() => { void copyChallenge(); }}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-accent-primary px-4 py-2 text-[10px] font-mono uppercase tracking-wider text-white transition-colors hover:bg-accent-hover"
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? 'Copied' : 'Copy Challenge'}
        </button>
      </div>
      <p className="mt-4 break-all rounded-[var(--radius-md)] border border-border-subtle bg-bg-primary/70 p-4 text-[12px] font-mono font-semibold tracking-wide text-text-primary">{target.challengeCode}</p>
    </section>
  );
}
