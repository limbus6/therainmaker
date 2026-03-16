import { useState, useMemo } from 'react';
import { useGameStore } from '../store/gameStore';
import Panel from '../components/ui/Panel';
import StatusChip from '../components/ui/StatusChip';
import {
  Search,
  Mail,
  MailOpen,
  Star,
  ChevronRight,
  Reply,
  AlertCircle,
  CheckCircle2,
  ArrowUpDown,
  ArrowUpRight,
} from 'lucide-react';
import type { Email, EmailCategory } from '../types/game';

const CATEGORY_COLORS: Record<EmailCategory, string> = {
  client: 'text-state-info',
  internal: 'text-text-secondary',
  partner: 'text-text-accent',
  buyer: 'text-state-success',
  advisor: 'text-muted-lavender',
  market: 'text-state-warning',
  system: 'text-text-muted',
};

const CATEGORY_LABELS: Record<EmailCategory, string> = {
  client: 'Client',
  internal: 'Internal',
  partner: 'Partner',
  buyer: 'Buyer',
  advisor: 'Advisor',
  market: 'Market Intel',
  system: 'System',
};

const PRIORITY_RANK: Record<string, number> = { urgent: 4, high: 3, normal: 2, low: 1 };

type FilterTab = 'all' | 'unread' | 'flagged' | 'important' | 'requires_response';
type SortKey = 'newest' | 'oldest' | 'sender' | 'priority' | 'category';

export default function InboxScreen() {
  const { emails, markEmailRead, respondToEmail, flagEmail, escalateEmail } = useGameStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('newest');

  const filteredEmails = useMemo(() => {
    const filtered = emails.filter((e) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const hit = e.subject.toLowerCase().includes(q)
          || e.sender.toLowerCase().includes(q)
          || e.body.toLowerCase().includes(q)
          || e.preview.toLowerCase().includes(q);
        if (!hit) return false;
      }
      switch (activeTab) {
        case 'unread': return e.state === 'unread';
        case 'flagged': return !!e.flagged;
        case 'important': return e.priority === 'high' || e.priority === 'urgent';
        case 'requires_response': return e.state === 'requires_response' || (e.responseOptions && e.responseOptions.length > 0 && e.state !== 'resolved');
        default: return true;
      }
    });

    return [...filtered].sort((a, b) => {
      switch (sortKey) {
        case 'newest': return (b.day ?? b.week * 7) - (a.day ?? a.week * 7);
        case 'oldest': return (a.day ?? a.week * 7) - (b.day ?? b.week * 7);
        case 'sender': return a.sender.localeCompare(b.sender);
        case 'priority': return (PRIORITY_RANK[b.priority] ?? 2) - (PRIORITY_RANK[a.priority] ?? 2);
        case 'category': return a.category.localeCompare(b.category);
        default: return 0;
      }
    });
  }, [emails, searchQuery, activeTab, sortKey]);

  const selected = emails.find((e) => e.id === selectedId);

  function handleSelect(email: Email) {
    setSelectedId(email.id);
    if (email.state === 'unread') {
      markEmailRead(email.id);
    }
  }

  function handleRespond(emailId: string, responseId: string) {
    respondToEmail(emailId, responseId);
  }

  const flaggedCount = emails.filter((e) => e.flagged).length;

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'unread', label: 'Unread' },
    { key: 'flagged', label: `Flagged${flaggedCount > 0 ? ` (${flaggedCount})` : ''}` },
    { key: 'important', label: 'Important' },
    { key: 'requires_response', label: 'Action Required' },
  ];

  return (
    <div className="h-full flex flex-col gap-4 max-w-[1200px]">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-semibold text-text-primary">Inbox</h1>
        <p className="text-[12px] text-text-muted mt-1">
          {emails.filter((e) => e.state === 'unread').length} unread messages
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-0.5 bg-surface-default rounded-[var(--radius-md)] p-0.5">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 text-[12px] rounded-[var(--radius-sm)] transition-all duration-150 ${
                activeTab === tab.key
                  ? 'bg-accent-soft text-text-accent font-medium'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-[12px] bg-surface-default border border-border-subtle rounded-[var(--radius-md)] text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-border-accent transition-colors"
          />
        </div>

        {/* Sort */}
        <div className="flex items-center gap-1.5 shrink-0">
          <ArrowUpDown size={13} className="text-text-muted" />
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="text-[12px] bg-surface-default border border-border-subtle rounded-[var(--radius-md)] text-text-secondary px-2 py-1.5 focus:outline-none focus:border-border-accent transition-colors cursor-pointer"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="priority">Priority</option>
            <option value="sender">Sender</option>
            <option value="category">Category</option>
          </select>
        </div>
      </div>

      {/* Mail List + Preview */}
      <div className="flex flex-col md:flex-row gap-4 flex-1 min-h-0">
        {/* Mail List */}
        <div className="w-full md:w-[340px] lg:w-[380px] shrink-0 overflow-y-auto space-y-0.5">
          {filteredEmails.length === 0 ? (
            <div className="text-center py-12">
              <Mail size={24} className="text-text-muted/30 mx-auto mb-2" />
              <p className="text-[12px] text-text-muted">No messages match your filter.</p>
            </div>
          ) : (
            filteredEmails.map((email) => (
              <button
                key={email.id}
                onClick={() => handleSelect(email)}
                className={`w-full text-left p-3 rounded-[var(--radius-md)] border transition-all duration-150 ${
                  selectedId === email.id
                    ? 'bg-accent-soft border-border-accent shadow-[var(--shadow-glow-soft)]'
                    : email.state === 'unread'
                    ? 'bg-surface-active border-transparent hover:bg-surface-hover hover:border-border-subtle'
                    : 'bg-surface-default border-transparent hover:bg-surface-hover hover:border-border-subtle'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {/* Unread dot */}
                  <div className="mt-1 shrink-0">
                    {email.state === 'unread' ? (
                      <span className="block w-3 h-3 rounded-full bg-accent-primary" />
                    ) : email.state === 'resolved' ? (
                      <CheckCircle2 size={14} className="text-state-success" />
                    ) : (
                      <span className="block w-3 h-3" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[12px] truncate ${email.state === 'unread' ? 'font-semibold text-text-primary' : 'text-text-secondary'}`}>
                        {email.sender}
                      </span>
                      <span className="text-[10px] font-mono text-text-muted shrink-0">{email.timestamp}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`text-[10px] font-mono uppercase ${CATEGORY_COLORS[email.category]}`}>
                        {CATEGORY_LABELS[email.category]}
                      </span>
                      {email.priority === 'urgent' && <AlertCircle size={10} className="text-state-danger" />}
                      {email.priority === 'high' && <Star size={10} className="text-state-warning" />}
                      {email.flagged && <Star size={10} className="text-text-accent fill-text-accent" />}
                      {email.escalated && <ArrowUpRight size={10} className="text-muted-lavender" />}
                    </div>
                    <div className={`text-[12px] mt-1 truncate ${email.state === 'unread' ? 'font-medium text-text-primary' : 'text-text-secondary'}`}>
                      {email.subject}
                    </div>
                    <div className="text-[11px] text-text-muted truncate mt-0.5">{email.preview}</div>
                  </div>
                  <ChevronRight size={14} className="text-text-muted/30 shrink-0 mt-1" />
                </div>
              </button>
            ))
          )}
        </div>

        {/* Email Preview */}
        <div className="flex-1 min-w-0">
          {selected ? (
            <Panel variant="elevated" className="h-full flex flex-col">
              {/* Email Header */}
              <div className="border-b border-border-subtle pb-4 mb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-text-primary">{selected.subject}</h2>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[12px] text-text-secondary font-medium">{selected.sender}</span>
                      {selected.senderRole && (
                        <span className="text-[11px] text-text-muted">— {selected.senderRole}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <StatusChip label={CATEGORY_LABELS[selected.category]} variant={selected.category === 'client' ? 'info' : selected.category === 'partner' ? 'accent' : 'default'} />
                    {selected.priority === 'high' && <StatusChip label="Important" variant="warning" />}
                    {selected.priority === 'urgent' && <StatusChip label="Urgent" variant="danger" />}
                  </div>
                </div>
                <div className="text-[10px] font-mono text-text-muted mt-2">{selected.timestamp}</div>
              </div>

              {/* Email Body */}
              <div className="flex-1 overflow-y-auto">
                <div className="text-[13px] text-text-secondary leading-relaxed whitespace-pre-wrap">
                  {selected.body}
                </div>
              </div>

              {/* Response Options */}
              {selected.responseOptions && selected.responseOptions.length > 0 && selected.state !== 'resolved' && (
                <div className="border-t border-border-subtle pt-4 mt-4">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-text-muted mb-2">Response Options</div>
                  <div className="space-y-2">
                    {selected.responseOptions.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => handleRespond(selected.id, opt.id)}
                        className="w-full flex items-center justify-between p-3 rounded-[var(--radius-md)] border border-border-subtle bg-surface-default hover:bg-surface-hover hover:border-border-accent transition-all duration-150 group"
                      >
                        <div className="flex items-center gap-2">
                          <Reply size={14} className="text-text-muted group-hover:text-text-accent" />
                          <span className="text-[12px] text-text-primary">{opt.label}</span>
                        </div>
                        {opt.effects && (
                          <span className="text-[10px] font-mono text-text-muted">{opt.effects}</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selected.state === 'resolved' && (
                <div className="border-t border-border-subtle pt-4 mt-4">
                  <div className="flex items-center gap-2 text-state-success">
                    <CheckCircle2 size={14} />
                    <span className="text-[12px] font-medium">Responded</span>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border-subtle">
                <button
                  onClick={() => selected && escalateEmail(selected.id)}
                  disabled={selected?.escalated}
                  title={selected?.escalated ? 'Already escalated to Marcus' : 'Send to Marcus Aldridge for strategic advice (costs €2k)'}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] rounded-[var(--radius-md)] transition-colors ${
                    selected?.escalated
                      ? 'text-muted-lavender bg-surface-default cursor-default opacity-60'
                      : 'text-text-muted hover:text-text-primary bg-surface-default hover:bg-surface-hover'
                  }`}
                >
                  <ArrowUpRight size={12} />
                  {selected?.escalated ? 'Escalated' : 'Escalate to Marcus'}
                </button>
                <button
                  onClick={() => selected && flagEmail(selected.id)}
                  title={selected?.flagged ? 'Remove flag' : 'Flag for follow-up'}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] rounded-[var(--radius-md)] transition-colors ${
                    selected?.flagged
                      ? 'text-text-accent bg-accent-soft hover:bg-accent-soft/70'
                      : 'text-text-muted hover:text-text-primary bg-surface-default hover:bg-surface-hover'
                  }`}
                >
                  <Star size={12} className={selected?.flagged ? 'fill-text-accent' : ''} />
                  {selected?.flagged ? 'Flagged' : 'Flag'}
                </button>
              </div>
            </Panel>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <MailOpen size={32} className="text-text-muted/20 mx-auto mb-3" />
                <p className="text-[13px] text-text-muted">Select a message to read</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
