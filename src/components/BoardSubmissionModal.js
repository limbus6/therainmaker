import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { X, CheckCircle, XCircle, Clock, FileText, TrendingUp } from 'lucide-react';
export default function BoardSubmissionModal({ onClose }) {
    const resources = useGameStore((s) => s.resources);
    const qualificationNotes = useGameStore((s) => s.qualificationNotes);
    const boardSubmission = useGameStore((s) => s.boardSubmission);
    const submitBoardRecommendation = useGameStore((s) => s.submitBoardRecommendation);
    const competitorThreats = useGameStore((s) => s.competitorThreats);
    const leads = useGameStore((s) => s.leads);
    const phase = useGameStore((s) => s.phase);
    const activeThreats = competitorThreats.filter((t) => !t.resolved);
    const [recommendation, setRecommendation] = useState('proceed');
    const [selectedLeadId, setSelectedLeadId] = useState(null);
    const [selectedPoints, setSelectedPoints] = useState([]);
    const PROCEED_POINTS = [
        { id: 'ahead', text: 'We need to move now to stay ahead of the competing advisor.' },
        { id: 'great_deal', text: 'This is a great deal and we cannot afford to lose it.' },
        { id: 'workable_risk', text: 'It is a good opportunity with risks we can manage.' },
        { id: 'fee', text: 'The mandate can generate an attractive fee for the firm.' },
        { id: 'founder_fit', text: 'The founder fit and sector position justify moving quickly.' },
        { id: 'trust', text: 'Client engagement is strong enough to justify a full push.' },
    ];
    const DECLINE_POINTS = [
        { id: 'valuation', text: 'The valuation gap is too wide for a credible mandate.' },
        { id: 'depth', text: 'The management bench is too thin for a stable process.' },
        { id: 'momentum', text: 'Momentum and trust are still too weak to justify escalation.' },
        { id: 'regulatory', text: 'Execution risk is too high relative to likely fee.' },
        { id: 'competitor', text: 'The competing advisor is too far ahead for a clean win.' },
    ];
    const activePoints = recommendation === 'proceed' ? PROCEED_POINTS : DECLINE_POINTS;
    const rationale = selectedPoints
        .map((id) => activePoints.find((p) => p.id === id)?.text ?? '')
        .filter(Boolean)
        .join(' | ');
    function togglePoint(id) {
        setSelectedPoints((prev) => prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]);
    }
    const positiveNotes = qualificationNotes.filter((n) => n.sentiment === 'positive').length;
    const negativeNotes = qualificationNotes.filter((n) => n.sentiment === 'negative').length;
    const qualScore = qualificationNotes.length >= 2 && resources.clientTrust > 40 && resources.dealMomentum >= 10;
    const canSubmit = boardSubmission?.status !== 'pending' &&
        boardSubmission?.status !== 'approved' &&
        selectedPoints.length >= 1 &&
        qualificationNotes.length >= 1 &&
        (phase > 0 || selectedLeadId !== null); // Force selection if in phase 0
    const handleSubmit = () => {
        if (!canSubmit)
            return;
        submitBoardRecommendation(recommendation, rationale.trim(), selectedLeadId || undefined);
    };
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm", children: _jsxs("div", { className: "bg-bg-secondary border border-border-subtle rounded-[var(--radius-lg)] shadow-[var(--shadow-heavy)] w-full max-w-2xl mx-4 overflow-hidden flex flex-col max-h-[90vh]", children: [_jsxs("div", { className: "flex items-center justify-between px-6 py-4 border-b border-border-subtle shrink-0", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-[15px] font-semibold text-text-primary", children: "Board Recommendation" }), _jsx("p", { className: "text-[12px] text-text-muted mt-0.5", children: "Should we pursue the Solara Systems mandate?" })] }), _jsx("button", { onClick: onClose, className: "p-1.5 rounded-[var(--radius-md)] hover:bg-surface-hover text-text-muted hover:text-text-primary transition-colors", children: _jsx(X, { size: 16 }) })] }), _jsxs("div", { className: "overflow-y-auto flex-1 p-6 space-y-5", children: [boardSubmission && (_jsxs("div", { className: `flex items-start gap-3 p-4 rounded-[var(--radius-md)] border ${boardSubmission.status === 'pending' ? 'bg-yellow-500/10 border-yellow-500/30' :
                                boardSubmission.status === 'approved' ? 'bg-green-500/10 border-green-500/30' :
                                    'bg-red-500/10 border-red-500/30'}`, children: [boardSubmission.status === 'pending' && _jsx(Clock, { size: 16, className: "text-yellow-400 shrink-0 mt-0.5" }), boardSubmission.status === 'approved' && _jsx(CheckCircle, { size: 16, className: "text-green-400 shrink-0 mt-0.5" }), boardSubmission.status === 'rejected' && _jsx(XCircle, { size: 16, className: "text-red-400 shrink-0 mt-0.5" }), _jsxs("div", { children: [_jsxs("p", { className: `text-[13px] font-medium ${boardSubmission.status === 'pending' ? 'text-yellow-300' :
                                                boardSubmission.status === 'approved' ? 'text-green-300' : 'text-red-300'}`, children: [boardSubmission.status === 'pending' && 'Awaiting board decision', boardSubmission.status === 'approved' && 'Board approved — proceed to Pitch & Mandate', boardSubmission.status === 'rejected' && 'Board rejected — additional qualification needed'] }), boardSubmission.boardNotes && (_jsxs("p", { className: "text-[12px] text-text-muted mt-1 italic", children: ["\"", boardSubmission.boardNotes, "\""] }))] })] })), _jsxs("div", { children: [_jsx("h3", { className: "text-[12px] font-semibold text-text-muted uppercase tracking-widest mb-3", children: "Qualification Signals" }), _jsx("div", { className: "grid grid-cols-3 gap-3", children: [
                                        { label: 'Client Trust', value: resources.clientTrust, threshold: 40 },
                                        { label: 'Deal Momentum', value: resources.dealMomentum, threshold: 10 },
                                        { label: 'Research Notes', value: qualificationNotes.length, threshold: 2, max: 5 },
                                    ].map(({ label, value, threshold, max = 100 }) => {
                                        const pct = Math.min(100, (value / max) * 100);
                                        const ok = value >= threshold;
                                        return (_jsxs("div", { className: `p-3 rounded-[var(--radius-md)] border ${ok ? 'border-green-500/30 bg-green-500/5' : 'border-yellow-500/30 bg-yellow-500/5'}`, children: [_jsx("div", { className: "text-[11px] text-text-muted mb-1", children: label }), _jsxs("div", { className: `text-[18px] font-mono font-bold ${ok ? 'text-green-400' : 'text-yellow-400'}`, children: [value, max === 100 ? '' : ''] }), _jsx("div", { className: "h-1 bg-bg-primary rounded-full mt-2 overflow-hidden", children: _jsx("div", { className: `h-full rounded-full transition-all ${ok ? 'bg-green-500' : 'bg-yellow-500'}`, style: { width: `${pct}%` } }) }), !ok && _jsxs("p", { className: "text-[10px] text-yellow-500/80 mt-1", children: ["min ", threshold] })] }, label));
                                    }) })] }), qualificationNotes.length > 0 && (_jsxs("div", { children: [_jsxs("h3", { className: "text-[12px] font-semibold text-text-muted uppercase tracking-widest mb-3 flex items-center gap-1.5", children: [_jsx(FileText, { size: 12 }), "Qualification Notes (", qualificationNotes.length, ")"] }), _jsx("div", { className: "space-y-2 max-h-36 overflow-y-auto pr-1", children: qualificationNotes.map((note) => (_jsxs("div", { className: "flex items-start gap-2 p-2.5 bg-bg-primary rounded-[var(--radius-md)]", children: [_jsx("span", { className: `w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${note.sentiment === 'positive' ? 'bg-green-400' :
                                                    note.sentiment === 'negative' ? 'bg-red-400' : 'bg-yellow-400'}` }), _jsxs("div", { children: [_jsx("p", { className: "text-[12px] text-text-secondary", children: note.content }), _jsxs("p", { className: "text-[10px] text-text-muted mt-0.5 capitalize", children: [note.source.replace('_', ' '), " \u00B7 Week ", note.week] })] })] }, note.id))) }), _jsxs("div", { className: "flex gap-2 mt-2 text-[11px]", children: [_jsxs("span", { className: "text-green-400", children: [positiveNotes, " positive"] }), _jsx("span", { className: "text-text-muted", children: "\u00B7" }), _jsxs("span", { className: "text-red-400", children: [negativeNotes, " concern", negativeNotes !== 1 ? 's' : ''] })] })] })), qualificationNotes.length === 0 && (_jsx("div", { className: "p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-[var(--radius-md)] text-[12px] text-yellow-400", children: "Complete at least one research or meeting task before submitting to the board." })), boardSubmission?.status !== 'pending' && boardSubmission?.status !== 'approved' && (_jsxs(_Fragment, { children: [activeThreats.length > 0 && (_jsx("div", { className: "p-3 rounded-[var(--radius-md)] border border-red-500/30 bg-red-500/10 text-[12px] text-red-200", children: "Rival advisor pressure detected. Fast board escalation may preserve initiative, but a weak case can still be rejected." })), phase === 0 && leads.length > 0 && (_jsxs("div", { children: [_jsxs("h3", { className: "text-[12px] font-semibold text-text-muted uppercase tracking-widest mb-3 flex items-center gap-1.5", children: [_jsx(CheckCircle, { size: 12 }), "Target Lead Selection"] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-3 mb-6", children: leads.map(lead => (_jsxs("button", { type: "button", onClick: () => setSelectedLeadId(lead.id), className: `text-left p-3 rounded-[var(--radius-md)] border text-[13px] transition-all flex flex-col items-start ${selectedLeadId === lead.id
                                                    ? 'bg-accent-primary/10 border-accent-primary text-text-primary'
                                                    : 'bg-bg-primary border-border-subtle text-text-muted hover:text-text-secondary hover:border-border-subtle/80'}`, children: [_jsx("div", { className: "font-semibold mb-1", children: lead.companyName }), _jsx("div", { className: "text-[11px] truncate w-full", children: lead.sector })] }, lead.id))) })] })), _jsxs("div", { children: [_jsxs("h3", { className: "text-[12px] font-semibold text-text-muted uppercase tracking-widest mb-3 flex items-center gap-1.5", children: [_jsx(TrendingUp, { size: 12 }), "My Recommendation"] }), _jsx("div", { className: "grid grid-cols-2 gap-3", children: ['proceed', 'decline'].map((opt) => (_jsx("button", { onClick: () => { setRecommendation(opt); setSelectedPoints([]); }, className: `py-3 rounded-[var(--radius-md)] border text-[13px] font-medium transition-all ${recommendation === opt
                                                    ? opt === 'proceed'
                                                        ? 'bg-green-500/15 border-green-500/40 text-green-300'
                                                        : 'bg-red-500/15 border-red-500/40 text-red-300'
                                                    : 'bg-bg-primary border-border-subtle text-text-muted hover:text-text-secondary hover:border-border-subtle/80'}`, children: opt === 'proceed' ? '✓ Proceed to Pitch' : '✕ Decline Opportunity' }, opt))) })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-[12px] font-medium text-text-secondary mb-2", children: ["Rationale ", _jsx("span", { className: "text-text-muted", children: "(select 1 or more options)" })] }), _jsx("div", { className: "space-y-2", children: activePoints.map((p) => (_jsx("button", { type: "button", onClick: () => togglePoint(p.id), className: `w-full text-left px-3 py-2.5 rounded-[var(--radius-md)] border text-[12px] leading-relaxed transition-all ${selectedPoints.includes(p.id)
                                                    ? recommendation === 'proceed'
                                                        ? 'bg-green-500/10 border-green-500/40 text-green-200'
                                                        : 'bg-red-500/10 border-red-500/40 text-red-200'
                                                    : 'bg-bg-primary border-border-subtle text-text-muted hover:text-text-secondary hover:border-border-subtle/80'}`, children: p.text }, p.id))) }), _jsxs("p", { className: "text-[11px] text-text-muted mt-1.5", children: [selectedPoints.length, " selected"] })] }), !qualScore && qualificationNotes.length >= 1 && (_jsx("p", { className: "text-[11px] text-yellow-400/80", children: "\u26A0 Board approval is more likely if trust, momentum, and research signals are stronger. Completing more Phase 0 tasks before submitting improves your odds." })), _jsx("button", { onClick: handleSubmit, disabled: !canSubmit, className: "w-full py-2.5 rounded-[var(--radius-md)] bg-accent-primary text-white font-medium text-[13px] hover:bg-accent-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed", children: boardSubmission?.status === 'rejected' ? 'Resubmit to Board' : 'Submit to Board' })] }))] })] }) }));
}
//# sourceMappingURL=BoardSubmissionModal.js.map