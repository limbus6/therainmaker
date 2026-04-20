import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut, RotateCcw, Settings, Save } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { PHASE_NAMES } from '../types/game';
export default function SettingsModal({ isOpen, onClose }) {
    const popoverRef = useRef(null);
    const navigate = useNavigate();
    const phase = useGameStore((s) => s.phase);
    const week = useGameStore((s) => s.week);
    const resources = useGameStore((s) => s.resources);
    const playerName = useGameStore((s) => s.playerName);
    const savedAt = useGameStore((s) => s.savedAt);
    const saveGame = useGameStore((s) => s.saveGame);
    const lastSaved = savedAt
        ? new Date(savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : 'Not yet saved';
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
    const handleResetGame = () => {
        if (window.confirm('Reset game? All progress will be permanently lost.')) {
            localStorage.removeItem('ma-rainmaker-save');
            navigate('/');
            onClose();
        }
    };
    const handleExitToMenu = () => {
        navigate('/');
        onClose();
    };
    return (_jsxs("div", { ref: popoverRef, className: "absolute top-full mt-1 right-0 w-[min(22rem,90vw)] bg-bg-secondary border border-border-subtle rounded-lg shadow-2xl z-[100] overflow-hidden", children: [_jsxs("div", { className: "flex items-center gap-2 px-4 py-3 border-b border-border-subtle bg-bg-primary/60", children: [_jsx(Settings, { size: 14, className: "text-accent-primary" }), _jsx("h3", { className: "text-[13px] font-semibold text-text-primary flex-1", children: "Settings" }), playerName && (_jsx("span", { className: "text-[11px] font-mono text-text-accent truncate max-w-[120px]", children: playerName }))] }), _jsxs("div", { className: "mx-4 mt-4 rounded-lg border border-border-subtle bg-bg-primary/40 overflow-hidden", children: [_jsx("div", { className: "px-4 py-2 border-b border-border-subtle/50 bg-accent-primary/5", children: _jsx("p", { className: "text-[10px] font-mono uppercase tracking-widest text-text-muted", children: "Active Deal" }) }), _jsxs("div", { className: "px-4 py-3 grid grid-cols-3 gap-3", children: [_jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-[10px] text-text-muted mb-1", children: "Phase" }), _jsx("p", { className: "text-[18px] font-bold font-mono text-text-primary", children: phase })] }), _jsxs("div", { className: "text-center border-x border-border-subtle/40", children: [_jsx("p", { className: "text-[10px] text-text-muted mb-1", children: "Week" }), _jsx("p", { className: "text-[18px] font-bold font-mono text-text-primary", children: String(week).padStart(2, '0') })] }), _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-[10px] text-text-muted mb-1", children: "Budget" }), _jsxs("p", { className: "text-[18px] font-bold font-mono text-text-primary", children: ["\u20AC", resources.budget, "k"] })] })] }), _jsx("div", { className: "px-4 pb-3 text-center", children: _jsx("p", { className: "text-[11px] text-text-tertiary", children: PHASE_NAMES[phase] }) })] }), _jsxs("div", { className: "px-4 py-4 space-y-2", children: [_jsxs("button", { onClick: saveGame, className: "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg border border-border-subtle bg-surface-default hover:bg-surface-hover transition-colors text-[13px] font-medium text-text-primary", children: [_jsx(Save, { size: 14, className: "text-text-muted" }), "Save Game", _jsx("span", { className: "ml-auto text-[11px] text-text-muted font-mono", children: lastSaved })] }), _jsxs("button", { onClick: handleExitToMenu, className: "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg border border-border-subtle bg-surface-default hover:bg-surface-hover transition-colors text-[13px] font-medium text-text-primary", children: [_jsx(LogOut, { size: 14, className: "text-text-muted" }), "Exit to Main Menu", _jsx("span", { className: "ml-auto text-[11px] text-text-muted", children: "(saves)" })] }), _jsxs("button", { onClick: handleResetGame, className: "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg border border-state-danger/30 bg-state-danger/5 hover:bg-state-danger/10 transition-colors text-[13px] font-medium text-state-danger", children: [_jsx(RotateCcw, { size: 14 }), "Reset Game", _jsx("span", { className: "ml-auto text-[11px] text-state-danger/60", children: "(clears all)" })] }), _jsxs("button", { onClick: onClose, className: "w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-accent-primary hover:bg-accent-primary/90 transition-colors text-[13px] font-semibold text-text-primary mt-1", children: [_jsx(ArrowLeft, { size: 14 }), "Go Back to Game"] })] })] }));
}
//# sourceMappingURL=SettingsModal.js.map