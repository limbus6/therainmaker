import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    const navigate = useNavigate();
    const debugJumpToCheckpoint = useGameStore((s) => s.debugJumpToCheckpoint);
    const addToast = useGameStore((s) => s.addToast);
    const currentPhase = useGameStore((s) => s.phase);
    const [selectedPhase, setSelectedPhase] = useState(currentPhase);
    const [selectedCheckpointId, setSelectedCheckpointId] = useState(REVIEW_CHECKPOINTS.find((checkpoint) => checkpoint.phase === currentPhase)?.id ?? REVIEW_CHECKPOINTS[0].id);
    const [reviewText, setReviewText] = useState('');
    const [isJumping, setIsJumping] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(() => {
        if (typeof window === 'undefined')
            return false;
        return window.localStorage.getItem('gameplayReviewBarCollapsed') === 'true';
    });
    const phaseCheckpoints = REVIEW_CHECKPOINTS.filter((checkpoint) => checkpoint.phase === selectedPhase);
    const selectedCheckpoint = phaseCheckpoints.find((checkpoint) => checkpoint.id === selectedCheckpointId) ?? phaseCheckpoints[0];
    useEffect(() => {
        if (!phaseCheckpoints.some((checkpoint) => checkpoint.id === selectedCheckpointId) && phaseCheckpoints[0]) {
            setSelectedCheckpointId(phaseCheckpoints[0].id);
        }
    }, [phaseCheckpoints, selectedCheckpointId]);
    useEffect(() => {
        window.localStorage.setItem('gameplayReviewBarCollapsed', String(isCollapsed));
    }, [isCollapsed]);
    async function handleJump() {
        if (!selectedCheckpoint)
            return;
        setIsJumping(true);
        try {
            await debugJumpToCheckpoint(selectedCheckpoint.id);
            navigate(selectedCheckpoint.route);
            addToast(`Checkpoint loaded: P${selectedCheckpoint.phase} — ${selectedCheckpoint.label}`, 'info');
        }
        catch {
            addToast('Could not load the selected checkpoint.', 'danger');
        }
        finally {
            setIsJumping(false);
        }
    }
    async function handleSubmitReview() {
        const trimmedReview = reviewText.trim();
        if (!trimmedReview || !selectedCheckpoint) {
            addToast('Write a note before submitting.', 'warning');
            return;
        }
        const payload = {
            phase: selectedCheckpoint.phase,
            phaseLabel: PHASE_NAMES[selectedCheckpoint.phase],
            checkpointId: selectedCheckpoint.id,
            checkpointLabel: selectedCheckpoint.label,
            checkpointDescription: selectedCheckpoint.description,
            route: selectedCheckpoint.route,
            review: trimmedReview,
        };
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                throw new Error('Review submission failed');
            }
            setReviewText('');
            addToast('Note added to Fixes.md.', 'success');
        }
        catch {
            const fixesEntry = formatFixesEntry(payload);
            const storedDrafts = JSON.parse(window.localStorage.getItem('fixesDrafts') ?? '[]');
            const issueUrl = buildGitHubIssueUrl(payload, fixesEntry);
            window.localStorage.setItem('fixesDrafts', JSON.stringify([...storedDrafts, fixesEntry]));
            try {
                await navigator.clipboard.writeText(fixesEntry);
                addToast('Opening a GitHub issue. When you submit it, Fixes.md will update automatically.', 'warning');
            }
            catch {
                addToast('Opening a GitHub issue. The note was also saved as a local draft.', 'warning');
            }
            window.setTimeout(() => {
                window.location.assign(issueUrl);
            }, 250);
        }
        finally {
            setIsSubmitting(false);
        }
    }
    if (isCollapsed) {
        return (_jsx("section", { className: "shrink-0 border-b border-border-subtle bg-bg-panel/95", children: _jsxs("div", { className: "flex items-center justify-between gap-3 px-4 py-2 md:px-6", children: [_jsxs("div", { className: "flex min-w-0 items-center gap-2", children: [_jsx(Bug, { size: 14, className: "text-text-accent" }), _jsx("span", { className: "text-[10px] font-mono uppercase tracking-[0.22em] text-text-muted", children: "Review bar hidden" }), _jsx("span", { className: "hidden truncate text-[11px] text-text-secondary sm:inline", children: "Test checkpoints and Fixes.md notes remain available." })] }), _jsxs("button", { type: "button", onClick: () => setIsCollapsed(false), className: "inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-border-subtle bg-surface-default px-3 py-1.5 text-[11px] font-semibold text-text-primary transition-colors hover:border-border-accent hover:text-text-accent", children: [_jsx(ChevronDown, { size: 13 }), "Show Bar"] })] }) }));
    }
    return (_jsx("section", { className: "shrink-0 border-b border-border-subtle bg-[radial-gradient(circle_at_top_left,rgba(240,79,165,0.18),transparent_34%),linear-gradient(90deg,rgba(13,10,33,0.96),rgba(30,16,64,0.92))]", children: _jsxs("div", { className: "px-4 py-3 md:px-6", children: [_jsxs("div", { className: "flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between", children: [_jsxs("div", { className: "flex items-start gap-3 min-w-0", children: [_jsx("div", { className: "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border-accent bg-accent-soft text-text-accent shadow-[var(--shadow-glow-soft)]", children: _jsx(Bug, { size: 16 }) }), _jsxs("div", { className: "min-w-0", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("p", { className: "text-[11px] font-mono uppercase tracking-[0.24em] text-text-accent", children: "Gameplay Review" }), _jsx("span", { className: "rounded-full border border-border-subtle bg-surface-default px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-text-muted", children: "QA Bar" }), _jsxs("button", { type: "button", onClick: () => setIsCollapsed(true), className: "inline-flex items-center gap-1 rounded-full border border-border-subtle bg-surface-default px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-text-muted transition-colors hover:border-border-accent hover:text-text-accent", children: [_jsx(ChevronUp, { size: 12 }), "Hide"] })] }), _jsxs("p", { className: "mt-1 text-[12px] text-text-secondary", children: ["Jump to coherent phases and subphases for testing. Locally, notes are written to ", _jsx("span", { className: "font-mono text-text-primary", children: "Fixes.md" }), "; on GitHub Pages they open an issue that updates the file automatically."] })] })] }), _jsxs("div", { className: "grid gap-2 md:grid-cols-[minmax(0,180px)_minmax(0,280px)_auto] xl:min-w-[560px]", children: [_jsxs("label", { className: "flex flex-col gap-1", children: [_jsx("span", { className: "text-[10px] font-mono uppercase tracking-[0.2em] text-text-muted", children: "Phase" }), _jsxs("div", { className: "relative", children: [_jsx("select", { value: selectedPhase, onChange: (event) => setSelectedPhase(Number(event.target.value)), className: "w-full appearance-none rounded-[var(--radius-md)] border border-border-default bg-bg-panel px-3 py-2 pr-9 text-[12px] text-text-primary outline-none transition-colors focus:border-border-accent", children: Object.entries(PHASE_NAMES).map(([phaseId, label]) => (_jsx("option", { value: phaseId, children: `P${phaseId} — ${label}` }, phaseId))) }), _jsx(ChevronDown, { size: 14, className: "pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted" })] })] }), _jsxs("label", { className: "flex flex-col gap-1", children: [_jsx("span", { className: "text-[10px] font-mono uppercase tracking-[0.2em] text-text-muted", children: "Subphase" }), _jsxs("div", { className: "relative", children: [_jsx("select", { value: selectedCheckpointId, onChange: (event) => setSelectedCheckpointId(event.target.value), className: "w-full appearance-none rounded-[var(--radius-md)] border border-border-default bg-bg-panel px-3 py-2 pr-9 text-[12px] text-text-primary outline-none transition-colors focus:border-border-accent", children: phaseCheckpoints.map((checkpoint) => (_jsx("option", { value: checkpoint.id, children: checkpoint.label }, checkpoint.id))) }), _jsx(ChevronDown, { size: 14, className: "pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted" })] })] }), _jsxs("button", { type: "button", onClick: handleJump, disabled: isJumping || !selectedCheckpoint, className: "mt-[18px] inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] border border-border-accent bg-accent-primary px-4 py-2 text-[12px] font-semibold text-white transition-all hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60", children: [_jsx(SkipForward, { size: 14 }), isJumping ? 'Loading...' : 'Jump to Checkpoint'] })] })] }), selectedCheckpoint && (_jsxs("div", { className: "mt-3 grid gap-3 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]", children: [_jsxs("div", { className: "rounded-[var(--radius-md)] border border-border-subtle bg-surface-default px-3 py-3", children: [_jsx("p", { className: "text-[10px] font-mono uppercase tracking-[0.2em] text-text-muted", children: "Selected Scenario" }), _jsx("p", { className: "mt-1 text-[13px] font-semibold text-text-primary", children: `P${selectedCheckpoint.phase} — ${selectedCheckpoint.label}` }), _jsx("p", { className: "mt-1 text-[12px] text-text-secondary", children: selectedCheckpoint.description }), _jsxs("p", { className: "mt-2 text-[11px] font-mono text-text-muted", children: ["Route: ", _jsx("span", { className: "text-text-primary", children: selectedCheckpoint.route })] })] }), _jsxs("div", { className: "rounded-[var(--radius-md)] border border-border-subtle bg-surface-default px-3 py-3", children: [_jsxs("div", { className: "flex items-center justify-between gap-3", children: [_jsxs("div", { children: [_jsx("p", { className: "text-[10px] font-mono uppercase tracking-[0.2em] text-text-muted", children: "Review Note" }), _jsx("p", { className: "mt-1 text-[12px] text-text-secondary", children: "Describe bugs, edge cases, or UX adjustments found at this checkpoint." })] }), _jsxs("button", { type: "button", onClick: handleSubmitReview, disabled: isSubmitting, className: "inline-flex shrink-0 items-center gap-2 rounded-[var(--radius-md)] border border-border-default bg-bg-panel px-3 py-2 text-[12px] font-semibold text-text-primary transition-colors hover:border-border-accent hover:text-text-accent disabled:cursor-not-allowed disabled:opacity-60", children: [_jsx(Send, { size: 14 }), isSubmitting ? 'Submitting...' : 'Send to Fixes.md'] })] }), _jsx("textarea", { value: reviewText, onChange: (event) => setReviewText(event.target.value), placeholder: `Example: P${selectedCheckpoint.phase} / ${selectedCheckpoint.label} - buyer state did not reflect exclusivity, trust dropped too hard, the modal blocked the flow...`, className: "mt-3 min-h-[92px] w-full rounded-[var(--radius-md)] border border-border-default bg-bg-panel px-3 py-2 text-[12px] text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-border-accent" })] })] }))] }) }));
}
//# sourceMappingURL=GameplayReviewBar.js.map