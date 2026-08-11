// ============================================
// Desk Decision Card
// ============================================
// Surfaces the top urgent decision directly on the Dashboard so the player
// can respond in place instead of navigating to the Inbox. Reuses the
// inline-panel pattern established by CompetitorMitigationPanel.

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertOctagon, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { formatResponseEffects } from '../utils/responseEffects';

export default function DeskDecisionCard() {
  const emails = useGameStore((s) => s.emails);
  const phase = useGameStore((s) => s.phase);
  const respondToEmail = useGameStore((s) => s.respondToEmail);
  const markEmailRead = useGameStore((s) => s.markEmailRead);
  const addToast = useGameStore((s) => s.addToast);
  const [expanded, setExpanded] = useState(false);

  const decisionEmails = emails
    .filter((email) =>
      email.phase === phase
      && email.state === 'unread'
      && (email.priority === 'urgent' || email.priority === 'high')
      && !!email.responseOptions?.length
    )
    .sort((a, b) => (a.priority === 'urgent' ? -1 : 0) - (b.priority === 'urgent' ? -1 : 0));
  const email = decisionEmails[0];
  if (!email) return null;

  const hasOptions = (email.responseOptions?.length ?? 0) > 0;
  const moreCount = decisionEmails.length - 1;

  const handleRespond = (optionId: string) => {
    const option = email.responseOptions?.find((o) => o.id === optionId);
    respondToEmail(email.id, optionId);
    const effects = option ? formatResponseEffects(option) : null;
    addToast(`Responded to ${email.sender}${effects ? ` — ${effects}` : ''}`, 'success');
  };

  const handleAcknowledge = () => {
    markEmailRead(email.id);
    addToast(`Noted: ${email.subject}`, 'info');
  };

  return (
    <div className="rounded-[var(--radius-lg)] border border-state-danger/30 bg-state-danger/5 p-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-state-danger/15 text-state-danger">
          <AlertOctagon size={15} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-state-danger">Decision Required</span>
            <span className="text-[11px] font-mono text-text-muted">{email.sender}{email.senderRole ? ` · ${email.senderRole}` : ''}</span>
            {moreCount > 0 && (
              <Link to="/inbox" className="ml-auto text-[11px] text-text-accent hover:underline shrink-0">
                +{moreCount} more decisions in Inbox
              </Link>
            )}
          </div>
          <h3 className="text-[14px] font-semibold text-text-primary mt-1">{email.subject}</h3>
          <p className={`text-[12px] text-text-secondary leading-relaxed mt-1 whitespace-pre-line ${expanded ? '' : 'line-clamp-3'}`}>
            {email.body}
          </p>
          <button
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center gap-1 mt-1 text-[11px] text-text-accent hover:underline"
          >
            {expanded ? <>Collapse <ChevronUp size={12} /></> : <>Read full message <ChevronDown size={12} /></>}
          </button>

          <div className="flex flex-wrap gap-2 mt-3">
            {hasOptions ? (
              email.responseOptions!.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleRespond(option.id)}
                  className="flex flex-col items-start gap-0.5 px-3 py-2 rounded-[var(--radius-md)] border border-border-accent bg-border-accent/10 hover:bg-border-accent/20 transition-colors text-left max-w-full"
                >
                  <span className="text-[12px] font-medium text-text-accent">{option.label}</span>
                  {formatResponseEffects(option) && (
                    <span className="text-[10px] font-mono text-text-muted">{formatResponseEffects(option)}</span>
                  )}
                </button>
              ))
            ) : (
              <>
                <button
                  onClick={handleAcknowledge}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[var(--radius-md)] border border-border-subtle text-[12px] text-text-secondary hover:bg-surface-hover transition-colors"
                >
                  <Check size={13} /> Acknowledge
                </button>
                <Link
                  to="/inbox"
                  className="inline-flex items-center px-3 py-2 rounded-[var(--radius-md)] border border-border-accent bg-border-accent/10 text-[12px] font-medium text-text-accent hover:bg-border-accent/20 transition-colors"
                >
                  Review in Inbox
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
