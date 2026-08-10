import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Bug, ChevronDown, ChevronUp, Send, SkipForward } from 'lucide-react';
import { REVIEW_CHECKPOINTS } from '../config/reviewCheckpoints';
import { useGameStore } from '../store/gameStore';
import { PHASE_NAMES } from '../types/game';
function formatFixesEntry(payload) {
    const timestamp = new Date().toISOString().replace('T', ' ').replace('Z', ' UTC');
    return [
        `## ${timestamp}`,
        `- Phase: P${payload.phase} — ${payload.phaseLabel}`,
        `- Checkpoint: ${payload.checkpointLabel}`,
        `- Route: ${payload.route}`,
        `- Context: ${payload.checkpointDescription}`,
        '',
        payload.review,
        '',
    ].join('\n');
}
function buildGitHubIssueUrl(payload, fixesEntry) {
    const title = `[Gameplay Fix] P${payload.phase} - ${payload.checkpointLabel}`;
    const body = [
        'This issue was created from the in-game review bar.',
        '',
        'When submitted, the `Append Gameplay Fix` workflow automatically appends the block below to `Fixes.md`.',
        '',
        '<!-- gameplay-fix-entry -->',
        fixesEntry,
        '<!-- /gameplay-fix-entry -->',
    ].join('\n');
    const params = new URLSearchParams({
        title,
        body,
    });
    return `https://github.com/limbus6/therainmaker/issues/new?${params.toString()}`;
}
export default function GameplayReviewBar() {
    const debugJumpToCheckpoint = useGameStore((s) => s.debugJumpToCheckpoint);
    const addToast = useGameStore((s) => s.addToast);
    const currentPhase = useGameStore((s) => s.phase);
    const [selectedPhase, setSelectedPhase] = useState(currentPhase);
    const [selectedCheckpointId, setSelectedCheckpointId] = useState(() => REVIEW_CHECKPOINTS.find((cp) => cp.phase === currentPhase)?.id ?? REVIEW_CHECKPOINTS[0].id);
    const [reviewText, setReviewText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const availableCheckpoints = REVIEW_CHECKPOINTS.filter((cp) => cp.phase === selectedPhase);
    const selectedCheckpoint = availableCheckpoints.find((cp) => cp.id === selectedCheckpointId) ?? availableCheckpoints[0];
    const handleJump = () => {
        if (!selectedCheckpoint)
            return;
        debugJumpToCheckpoint(selectedCheckpoint.id);
        addToast(`Jumped to scenario: P${selectedCheckpoint.phase} ${selectedCheckpoint.label}`, 'info');
    };
    const handleSubmitReview = async () => {
        if (!selectedCheckpoint || !reviewText.trim()) {
            addToast('Please write a review note before sending.', 'warning');
            return;
        }
        const payload = {
            phase: selectedCheckpoint.phase,
            phaseLabel: PHASE_NAMES[selectedCheckpoint.phase],
            checkpointId: selectedCheckpoint.id,
            checkpointLabel: selectedCheckpoint.label,
            checkpointDescription: selectedCheckpoint.description,
            route: selectedCheckpoint.route,
            review: reviewText.trim(),
        };
        const fixesEntry = formatFixesEntry(payload);
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (response.ok) {
                addToast('Review note appended to Fixes.md', 'success');
                setReviewText('');
                return;
            }
        }
        catch {
            // Fallback below
        }
        finally {
            setIsSubmitting(false);
        }
        const issueUrl = buildGitHubIssueUrl(payload, fixesEntry);
        window.open(issueUrl, '_blank', 'noopener,noreferrer');
        addToast('Opened GitHub Issue draft with your formatted review block.', 'info');
    };
    if (!isExpanded) {
        return (_jsxs("button", { type: "button", onClick: () => setIsExpanded(true), className: "fixed bottom-4 right-4 z-50 inline-flex items-center gap-2 rounded-full border border-border-subtle bg-surface-elevated/90 px-3.5 py-2 text-[12px] font-medium text-text-muted shadow-lg backdrop-blur-md transition-all hover:border-border-accent hover:text-text-primary hover:scale-105", children: [_jsx(Bug, { size: 14, className: "text-text-accent" }), _jsx("span", { children: "QA Review" }), _jsx(ChevronUp, { size: 14 })] }));
    }
    return (_jsxs("section", { className: "fixed bottom-4 right-4 z-50 w-[calc(100vw-2rem)] max-w-2xl rounded-[var(--radius-lg)] border border-border-subtle bg-surface-elevated/95 p-4 shadow-2xl backdrop-blur-lg", children: [_jsxs("div", { className: "flex items-center justify-between gap-3 border-b border-border-subtle pb-3", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Bug, { size: 16, className: "text-text-accent" }), _jsx("h3", { className: "text-[13px] font-semibold text-text-primary", children: "Gameplay Review & Checkpoints" })] }), _jsx("button", { type: "button", onClick: () => setIsExpanded(false), className: "rounded-[var(--radius-sm)] p-1 text-text-muted transition-colors hover:text-text-primary", children: _jsx(ChevronDown, { size: 16 }) })] }), _jsxs("div", { className: "mt-3 space-y-3", children: [_jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [_jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx("span", { className: "text-[11px] font-mono text-text-muted", children: "Phase:" }), _jsx("select", { value: selectedPhase, onChange: (e) => {
                                            const p = Number(e.target.value);
                                            setSelectedPhase(p);
                                            const first = REVIEW_CHECKPOINTS.find((c) => c.phase === p);
                                            if (first)
                                                setSelectedCheckpointId(first.id);
                                        }, className: "rounded-[var(--radius-sm)] border border-border-subtle bg-bg-panel px-2 py-1 text-[12px] text-text-primary outline-none", children: Object.entries(PHASE_NAMES).map(([id, name]) => (_jsxs("option", { value: id, children: ["P", id, " \u2014 ", name] }, id))) })] }), _jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx("span", { className: "text-[11px] font-mono text-text-muted", children: "Scenario:" }), _jsx("select", { value: selectedCheckpointId, onChange: (e) => setSelectedCheckpointId(e.target.value), className: "rounded-[var(--radius-sm)] border border-border-subtle bg-bg-panel px-2 py-1 text-[12px] text-text-primary outline-none", children: availableCheckpoints.map((cp) => (_jsx("option", { value: cp.id, children: cp.label }, cp.id))) })] }), _jsxs("button", { type: "button", onClick: handleJump, className: "ml-auto inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-border-accent bg-border-accent/10 px-3 py-1 text-[12px] font-medium text-text-accent transition-colors hover:bg-border-accent/20", children: [_jsx(SkipForward, { size: 13 }), _jsx("span", { children: "Jump" })] })] }), selectedCheckpoint && (_jsxs("div", { className: "grid gap-3 lg:grid-cols-[minmax(0,220px)_minmax(0,1fr)]", children: [_jsxs("div", { className: "rounded-[var(--radius-md)] border border-border-subtle bg-surface-default p-2.5", children: [_jsx("p", { className: "text-[10px] font-mono uppercase tracking-wider text-text-muted", children: "Scenario Context" }), _jsx("p", { className: "mt-1 text-[12px] font-semibold text-text-primary", children: selectedCheckpoint.label }), _jsx("p", { className: "mt-1 text-[11px] text-text-secondary leading-snug", children: selectedCheckpoint.description })] }), _jsxs("div", { className: "rounded-[var(--radius-md)] border border-border-subtle bg-surface-default p-2.5", children: [_jsxs("div", { className: "flex items-center justify-between gap-2 mb-2", children: [_jsx("p", { className: "text-[10px] font-mono uppercase tracking-wider text-text-muted", children: "Review Note" }), _jsxs("button", { type: "button", onClick: handleSubmitReview, disabled: isSubmitting, className: "inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-border-default bg-bg-panel px-2.5 py-1 text-[11px] font-semibold text-text-primary hover:border-border-accent", children: [_jsx(Send, { size: 12 }), _jsx("span", { children: isSubmitting ? 'Sending...' : 'Save Note' })] })] }), _jsx("textarea", { value: reviewText, onChange: (e) => setReviewText(e.target.value), placeholder: "Describe bug or UX feedback for this scenario...", className: "h-[56px] w-full rounded-[var(--radius-sm)] border border-border-default bg-bg-panel p-2 text-[11px] text-text-primary outline-none focus:border-border-accent" })] })] }))] })] }));
}
//# sourceMappingURL=GameplayReviewBar.js.map