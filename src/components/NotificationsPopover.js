import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useEffect } from 'react';
import { Bell, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
const PRIORITY_COLOR = {
    high: 'bg-state-danger',
    normal: 'bg-accent-primary',
    low: 'bg-text-muted',
};
export default function NotificationsPopover({ isOpen, onClose }) {
    const popoverRef = useRef(null);
    const navigate = useNavigate();
    const emails = useGameStore((s) => s.emails);
    const markAsRead = useGameStore((s) => s.markEmailRead);
    const unreadEmails = emails.filter((e) => e.state === 'unread');
    const readEmails = emails.filter((e) => e.state === 'read').slice(0, 3);
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (popoverRef.current && !popoverRef.current.contains(e.target)) {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isOpen, onClose]);
    if (!isOpen)
        return null;
    const handleEmailClick = (email) => {
        markAsRead(email.id);
        navigate('/inbox');
        onClose();
    };
    return (_jsxs("div", { ref: popoverRef, className: "absolute top-full mt-1 right-0 w-[min(22rem,90vw)] bg-bg-secondary border border-border-subtle rounded-lg shadow-2xl z-[100] overflow-hidden", children: [_jsxs("div", { className: "flex items-center gap-2 px-4 py-3 border-b border-border-subtle bg-bg-primary/60", children: [_jsx(Bell, { size: 14, className: "text-accent-primary" }), _jsx("h3", { className: "text-[13px] font-semibold text-text-primary flex-1", children: "Inbox Notifications" }), unreadEmails.length > 0 && (_jsxs("span", { className: "text-[10px] font-mono bg-accent-primary/20 text-text-accent px-2 py-0.5 rounded-full", children: [unreadEmails.length, " unread"] }))] }), _jsxs("div", { className: "max-h-96 overflow-y-auto", children: [unreadEmails.length === 0 ? (_jsxs("div", { className: "px-4 py-10 text-center flex flex-col items-center gap-3", children: [_jsx(Mail, { size: 28, className: "text-text-muted/40" }), _jsx("p", { className: "text-[12px] text-text-tertiary", children: "No new notifications" })] })) : (_jsxs("div", { children: [_jsx("p", { className: "px-4 pt-3 pb-1 text-[10px] font-mono uppercase tracking-widest text-text-muted", children: "New" }), unreadEmails.map((email) => (_jsx("button", { onClick: () => handleEmailClick(email), className: "w-full px-4 py-3 border-b border-border-subtle/50 hover:bg-surface-hover transition-colors text-left", children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx("div", { className: `w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${PRIORITY_COLOR[email.priority] ?? 'bg-accent-primary'}` }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center justify-between gap-2", children: [_jsx("p", { className: "text-[12px] font-semibold text-text-primary truncate", children: email.sender }), _jsx("p", { className: "text-[10px] text-text-muted flex-shrink-0", children: email.timestamp.split(',')[0] })] }), _jsx("p", { className: "text-[11px] text-text-secondary truncate mt-0.5", children: email.subject }), _jsx("p", { className: "text-[10px] text-text-tertiary truncate mt-0.5", children: email.preview })] })] }) }, email.id)))] })), readEmails.length > 0 && (_jsxs("div", { children: [_jsx("p", { className: "px-4 pt-3 pb-1 text-[10px] font-mono uppercase tracking-widest text-text-muted", children: "Recent" }), readEmails.map((email) => (_jsx("button", { onClick: () => { navigate('/inbox'); onClose(); }, className: "w-full px-4 py-3 border-b border-border-subtle/30 hover:bg-surface-hover/50 transition-colors text-left opacity-50", children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx("div", { className: "w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 bg-border-subtle" }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center justify-between gap-2", children: [_jsx("p", { className: "text-[12px] text-text-secondary truncate", children: email.sender }), _jsx("p", { className: "text-[10px] text-text-muted flex-shrink-0", children: email.timestamp.split(',')[0] })] }), _jsx("p", { className: "text-[11px] text-text-tertiary truncate mt-0.5", children: email.subject })] })] }) }, email.id)))] }))] }), unreadEmails.length > 0 && (_jsx("div", { className: "px-4 py-2.5 border-t border-border-subtle bg-bg-primary/40 text-center", children: _jsx("p", { className: "text-[10px] text-text-muted font-mono", children: "Click a notification to open in Inbox" }) }))] }));
}
//# sourceMappingURL=NotificationsPopover.js.map