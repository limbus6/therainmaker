import { useRef, useEffect } from 'react';
import { Bell, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import type { Email } from '../types/game';

interface NotificationsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRIORITY_COLOR: Record<string, string> = {
  high: 'bg-state-danger',
  normal: 'bg-accent-primary',
  low: 'bg-text-muted',
};

export default function NotificationsPopover({ isOpen, onClose }: NotificationsPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const emails = useGameStore((s) => s.emails);
  const markAsRead = useGameStore((s) => s.markEmailRead);

  const unreadEmails = emails.filter((e) => e.state === 'unread');
  const readEmails = emails.filter((e) => e.state === 'read').slice(0, 3);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleEmailClick = (email: Email) => {
    markAsRead(email.id);
    navigate('/inbox');
    onClose();
  };

  return (
    <div
      ref={popoverRef}
      className="absolute top-full mt-1 right-0 w-[min(22rem,90vw)] bg-bg-secondary border border-border-subtle rounded-lg shadow-2xl z-[100] overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border-subtle bg-bg-primary/60">
        <Bell size={14} className="text-accent-primary" />
        <h3 className="text-[13px] font-semibold text-text-primary flex-1">Inbox Notifications</h3>
        {unreadEmails.length > 0 && (
          <span className="text-[10px] font-mono bg-accent-primary/20 text-text-accent px-2 py-0.5 rounded-full">
            {unreadEmails.length} unread
          </span>
        )}
      </div>

      <div className="max-h-96 overflow-y-auto">
        {/* Unread */}
        {unreadEmails.length === 0 ? (
          <div className="px-4 py-10 text-center flex flex-col items-center gap-3">
            <Mail size={28} className="text-text-muted/40" />
            <p className="text-[12px] text-text-tertiary">No new notifications</p>
          </div>
        ) : (
          <div>
            <p className="px-4 pt-3 pb-1 text-[10px] font-mono uppercase tracking-widest text-text-muted">New</p>
            {unreadEmails.map((email: Email) => (
              <button
                key={email.id}
                onClick={() => handleEmailClick(email)}
                className="w-full px-4 py-3 border-b border-border-subtle/50 hover:bg-surface-hover transition-colors text-left"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${PRIORITY_COLOR[email.priority] ?? 'bg-accent-primary'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[12px] font-semibold text-text-primary truncate">{email.sender}</p>
                      <p className="text-[10px] text-text-muted flex-shrink-0">{email.timestamp.split(',')[0]}</p>
                    </div>
                    <p className="text-[11px] text-text-secondary truncate mt-0.5">{email.subject}</p>
                    <p className="text-[10px] text-text-tertiary truncate mt-0.5">{email.preview}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Recent read */}
        {readEmails.length > 0 && (
          <div>
            <p className="px-4 pt-3 pb-1 text-[10px] font-mono uppercase tracking-widest text-text-muted">Recent</p>
            {readEmails.map((email: Email) => (
              <button
                key={email.id}
                onClick={() => { navigate('/inbox'); onClose(); }}
                className="w-full px-4 py-3 border-b border-border-subtle/30 hover:bg-surface-hover/50 transition-colors text-left opacity-50"
              >
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 bg-border-subtle" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[12px] text-text-secondary truncate">{email.sender}</p>
                      <p className="text-[10px] text-text-muted flex-shrink-0">{email.timestamp.split(',')[0]}</p>
                    </div>
                    <p className="text-[11px] text-text-tertiary truncate mt-0.5">{email.subject}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {unreadEmails.length > 0 && (
        <div className="px-4 py-2.5 border-t border-border-subtle bg-bg-primary/40 text-center">
          <p className="text-[10px] text-text-muted font-mono">Click a notification to open in Inbox</p>
        </div>
      )}
    </div>
  );
}
