import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { X, TrendingUp, Shield, BarChart2, ChevronRight, HandshakeIcon, Lock, Lightbulb } from 'lucide-react';
import { gsap } from 'gsap';
const RETAINER_LABELS = {
    none: 'No Retainer',
    monthly: 'Monthly (€2k–€10k/month)',
    per_phase: 'Per Phase (€5k–€10k/phase)',
    upfront: 'Upfront (€20k–€40k at signing)',
};
const RETAINER_RANGES = {
    none: { min: 0, max: 0, step: 1 },
    monthly: { min: 2, max: 10, step: 1 },
    per_phase: { min: 5, max: 10, step: 1 },
    upfront: { min: 20, max: 40, step: 5 },
};
const reactionColor = {
    green: 'text-green-400 border-green-500/40 bg-green-500/10',
    yellow: 'text-yellow-400 border-yellow-500/40 bg-yellow-500/10',
    red: 'text-red-400 border-red-500/40 bg-red-500/10',
};
const reactionEmoji = {
    green: '🟢',
    yellow: '🟡',
    red: '🔴',
};
const reactionLabel = {
    green: 'Acceptable',
    yellow: 'Borderline',
    red: 'Rejected',
};
const profileDescriptions = {
    serious_reasonable: 'Realistic expectations. Will pay fair advisory fees.',
    serious_demanding: 'Committed to the deal. Fights hard on percentage.',
    unsure_optimistic: 'Unrealistic valuation. Wants to pay only on upside.',
    unsure_reluctant: 'Not fully committed. Resists all financial commitments.',
};
export default function FeeNegotiationModal({ onClose }) {
    const client = useGameStore((s) => s.client);
    const resources = useGameStore((s) => s.resources);
    const feeNegotiation = useGameStore((s) => s.feeNegotiation);
    const agreedFeeTerms = useGameStore((s) => s.agreedFeeTerms);
    const startFeeNegotiation = useGameStore((s) => s.startFeeNegotiation);
    const submitFeeRound = useGameStore((s) => s.submitFeeRound);
    const acceptFeeTerms = useGameStore((s) => s.acceptFeeTerms);
    const week = useGameStore((s) => s.week);
    // Draft state — terms builder
    const [retainerType, setRetainerType] = useState('none');
    const [retainerAmount, setRetainerAmount] = useState(0);
    const [successFeePercent, setSuccessFeePercent] = useState(2.5);
    const [ratchetEnabled, setRatchetEnabled] = useState(false);
    const [ratchetThresholdEV, setRatchetThresholdEV] = useState(client.valuationExpectationEV ?? 100);
    const [ratchetBonusPercent, setRatchetBonusPercent] = useState(5);
    const [showReactions, setShowReactions] = useState(false);
    // Refs for GSAP
    const modalRef = useRef(null);
    const handshakeRef = useRef(null);
    const patienceBarRef = useRef(null);
    const reactionRefs = useRef([]);
    if (!feeNegotiation)
        return null;
    const { clientState, rounds, status } = feeNegotiation;
    const latestRound = rounds.at(-1);
    // Entrance animation
    useEffect(() => {
        if (modalRef.current) {
            gsap.fromTo(modalRef.current, { scale: 0.95, opacity: 0, y: 20 }, { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: 'back.out(1.5)' });
        }
    }, []);
    // Handshake animation
    useEffect(() => {
        if (status === 'agreed' && handshakeRef.current) {
            gsap.fromTo(handshakeRef.current, { scale: 0.5, opacity: 0, rotation: -15 }, { scale: 1, opacity: 1, rotation: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)', delay: 0.1 });
        }
    }, [status]);
    // Patience sizzle animation on red reaction
    useEffect(() => {
        if (showReactions && patienceBarRef.current && feeNegotiation) {
            const latest = feeNegotiation.rounds.at(-1);
            if (latest && (latest.reactionRetainer === 'red' || latest.reactionSuccessFee === 'red' || latest.reactionRatchet === 'red')) {
                gsap.to(patienceBarRef.current, {
                    x: 'random(-4, 4)',
                    y: 'random(-2, 2)',
                    duration: 0.05,
                    repeat: 10,
                    yoyo: true,
                    clearProps: 'all'
                });
            }
        }
    }, [showReactions, feeNegotiation]);
    const maxRounds = resources.clientTrust > 60 ? 4 : 3;
    const ev = client.valuationExpectationEV ?? 100;
    // Live fee projection
    const baseFee = (successFeePercent / 100) * ev;
    const ratchetFee = ratchetEnabled && ratchetThresholdEV && ratchetBonusPercent
        ? (ratchetBonusPercent / 100) * Math.max(0, ev - ratchetThresholdEV)
        : 0;
    const totalFee = Math.round((baseFee + ratchetFee) * 10) / 10;
    const retainerRange = RETAINER_RANGES[retainerType];
    const handleChangeRetainerType = (t) => {
        setRetainerType(t);
        if (t === 'none')
            setRetainerAmount(0);
        else
            setRetainerAmount(RETAINER_RANGES[t].min);
    };
    const isRetainerLocked = clientState.lockedComponents.includes('retainer');
    const isSuccessFeeLocked = clientState.lockedComponents.includes('successFee');
    const isRatchetLocked = clientState.lockedComponents.includes('ratchet');
    const handleSubmit = () => {
        submitFeeRound({
            playerRetainerType: isRetainerLocked ? (clientState.lockedRetainerType ?? retainerType) : retainerType,
            playerRetainerAmount: isRetainerLocked ? (clientState.lockedRetainerAmount ?? retainerAmount) : retainerAmount,
            playerSuccessFeePercent: isSuccessFeeLocked ? (clientState.lockedSuccessFeePercent ?? successFeePercent) : successFeePercent,
            playerRatchetEnabled: ratchetEnabled,
            playerRatchetThresholdEV: ratchetEnabled ? ratchetThresholdEV : undefined,
            playerRatchetBonusPercent: ratchetEnabled ? ratchetBonusPercent : undefined,
        });
        setShowReactions(true);
        // Animate reaction reveal sequence
        setTimeout(() => {
            reactionRefs.current.forEach((ref, index) => {
                if (ref) {
                    gsap.fromTo(ref, { scale: 0.5, opacity: 0, y: 10 }, { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: 'back.out(1.7)', delay: index * 0.15 });
                }
            });
        }, 50);
    };
    const handleRevise = () => {
        setShowReactions(false);
        // Pre-fill with current values
    };
    // Priority hint (0-10 → low/medium/high)
    const priorityLabel = (val) => val <= 3 ? 'Low' : val <= 6 ? 'Medium' : 'High';
    const priorityWidth = (val) => `${(val / 10) * 100}%`;
    const priorityColor = (val) => val <= 3 ? 'bg-green-500' : val <= 6 ? 'bg-yellow-500' : 'bg-red-500';
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm", children: _jsxs("div", { ref: modalRef, className: `bg-bg-secondary border rounded-[var(--radius-lg)] shadow-[var(--shadow-heavy)] w-full max-w-4xl mx-4 overflow-hidden flex flex-col max-h-[92vh] ${status === 'agreed' ? 'border-green-500/50 shadow-green-500/10' :
                status === 'failed' ? 'border-red-500/50 shadow-red-500/10' :
                    'border-accent-primary/50 shadow-accent-primary/10'}`, children: [_jsxs("div", { className: "flex items-center justify-between px-6 py-3.5 border-b border-border-subtle shrink-0", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-[15px] font-semibold text-text-primary", children: "Fee Negotiation" }), _jsx("p", { className: "text-[12px] text-text-muted mt-0.5", children: status === 'agreed' ? '✓ Terms agreed' :
                                        status === 'failed' ? '✕ Negotiation failed' :
                                            status === 'pitch_pending' ? 'Start negotiation to begin' :
                                                `Round ${Math.min(rounds.length + (showReactions ? 0 : 1), maxRounds)} of ${maxRounds}` })] }), _jsx("div", { className: "flex items-center gap-1.5 mr-4", children: Array.from({ length: maxRounds }).map((_, i) => (_jsx("div", { className: `w-2 h-2 rounded-full transition-all ${i < rounds.length
                                    ? rounds[i].outcome === 'accepted' ? 'bg-green-500' : rounds[i].outcome === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'
                                    : i === rounds.length ? 'bg-accent-primary' : 'bg-border-subtle'}` }, i))) }), _jsx("button", { onClick: onClose, className: "p-1.5 rounded-[var(--radius-md)] hover:bg-surface-hover text-text-muted hover:text-text-primary transition-colors", children: _jsx(X, { size: 16 }) })] }), status === 'agreed' && agreedFeeTerms && (_jsxs("div", { className: "p-8 flex flex-col items-center text-center gap-5", children: [_jsx("div", { ref: handshakeRef, className: "w-16 h-16 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center", children: _jsx(HandshakeIcon, { size: 28, className: "text-green-400" }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-[17px] font-bold text-text-primary", children: "Mandate Terms Agreed" }), _jsxs("p", { className: "text-[13px] text-text-muted mt-1", children: ["Agreement reached with ", client.name, " \u00B7 Week ", week] })] }), _jsxs("div", { className: "bg-bg-primary border border-border-subtle rounded-[var(--radius-md)] p-5 w-full max-w-sm text-left space-y-2.5", children: [_jsxs("div", { className: "flex justify-between text-[12px]", children: [_jsx("span", { className: "text-text-muted", children: "Retainer" }), _jsx("span", { className: "text-text-secondary font-medium capitalize", children: agreedFeeTerms.retainerType === 'none' ? '—' : `€${agreedFeeTerms.retainerAmount}k (${agreedFeeTerms.retainerType.replace('_', ' ')})` })] }), _jsxs("div", { className: "flex justify-between text-[12px]", children: [_jsx("span", { className: "text-text-muted", children: "Success Fee" }), _jsxs("span", { className: "text-text-accent font-semibold", children: [agreedFeeTerms.successFeePercent, "%"] })] }), agreedFeeTerms.ratchetEnabled && (_jsxs("div", { className: "flex justify-between text-[12px]", children: [_jsx("span", { className: "text-text-muted", children: "Ratchet" }), _jsxs("span", { className: "text-text-secondary", children: [agreedFeeTerms.ratchetBonusPercent, "% above \u20AC", agreedFeeTerms.ratchetThresholdEV, "M"] })] })), _jsxs("div", { className: "border-t border-border-subtle pt-2.5 flex justify-between text-[13px]", children: [_jsx("span", { className: "text-text-secondary font-semibold", children: "Total projected fee" }), _jsxs("span", { className: "text-text-accent font-bold", children: ["\u20AC", agreedFeeTerms.totalFeeProjection, "M"] })] }), _jsxs("p", { className: "text-[10px] text-text-muted", children: ["At expected EV of \u20AC", ev, "M"] })] }), _jsx("button", { onClick: onClose, className: "px-6 py-2.5 bg-accent-primary text-white rounded-[var(--radius-md)] text-[13px] font-medium hover:bg-accent-primary/90", children: "Continue" })] })), status === 'failed' && (_jsxs("div", { className: "p-8 flex flex-col items-center text-center gap-4", children: [_jsx("div", { className: "w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-2xl", children: "\u2715" }), _jsxs("div", { children: [_jsx("h3", { className: "text-[17px] font-bold text-text-primary", children: "Negotiation Broken Down" }), _jsx("p", { className: "text-[13px] text-text-muted mt-1", children: "\u221210 client trust applied. Revise your position significantly to re-open." })] }), latestRound && (_jsxs("div", { className: "bg-bg-primary border border-red-500/20 rounded-[var(--radius-md)] p-4 text-left max-w-md w-full", children: [_jsxs("p", { className: "text-[12px] text-text-muted italic", children: ["\"", latestRound.clientNote, "\""] }), _jsx("div", { className: "flex gap-3 mt-3 text-[11px]", children: ['Retainer', 'Success Fee', 'Ratchet'].map((label, i) => {
                                        const reaction = i === 0 ? latestRound.reactionRetainer : i === 1 ? latestRound.reactionSuccessFee : latestRound.reactionRatchet;
                                        return (_jsxs("span", { className: `px-2 py-1 rounded border ${reactionColor[reaction]}`, children: [reactionEmoji[reaction], " ", label] }, label));
                                    }) })] })), _jsx("button", { onClick: () => { setShowReactions(false); }, className: "px-6 py-2.5 bg-accent-primary text-white rounded-[var(--radius-md)] text-[13px] font-medium hover:bg-accent-primary/90", children: "Return & Revise Offer" })] })), status === 'pitch_pending' && (_jsxs("div", { className: "p-8 flex flex-col items-center text-center gap-4", children: [_jsxs("p", { className: "text-[13px] text-text-muted", children: ["The pitch has been presented. ", client.name, " is now ready to discuss mandate terms."] }), _jsx("button", { onClick: () => startFeeNegotiation(), className: "px-6 py-3 bg-accent-primary text-white rounded-[var(--radius-md)] text-[14px] font-semibold hover:bg-accent-primary/90 transition-all", children: "Begin Fee Negotiation" })] })), status === 'in_progress' && (_jsxs("div", { className: "flex flex-1 min-h-0 overflow-hidden", children: [_jsxs("div", { className: "w-64 shrink-0 border-r border-border-subtle p-5 space-y-4 overflow-y-auto", children: [_jsxs("div", { children: [_jsx("div", { className: "w-10 h-10 rounded-full bg-bg-primary border border-border-subtle flex items-center justify-center text-lg mb-2", children: "\uD83D\uDC64" }), _jsx("p", { className: "text-[13px] font-semibold text-text-primary", children: client.name }), _jsx("p", { className: "text-[11px] text-text-muted mt-0.5 capitalize", children: clientState.profile.replace('_', ' ') }), _jsx("p", { className: "text-[11px] text-text-muted/70 mt-1 leading-relaxed", children: profileDescriptions[clientState.profile] })] }), _jsxs("div", { className: "space-y-2.5", children: [_jsx("p", { className: "text-[10px] text-text-muted uppercase tracking-widest", children: "Term Priorities" }), [
                                            { label: 'Retainer', val: clientState.priorityRetainer },
                                            { label: 'Success Fee', val: clientState.prioritySuccessFee },
                                            { label: 'Ratchet', val: clientState.priorityRatchet },
                                        ].map(({ label, val }) => (_jsxs("div", { children: [_jsxs("div", { className: "flex justify-between text-[10px] mb-0.5", children: [_jsx("span", { className: "text-text-muted", children: label }), _jsx("span", { className: "text-text-secondary", children: priorityLabel(val) })] }), _jsx("div", { className: "h-1 bg-bg-primary rounded-full overflow-hidden", children: _jsx("div", { className: `h-full rounded-full ${priorityColor(val)} transition-all`, style: { width: priorityWidth(val) } }) })] }, label)))] }), _jsxs("div", { ref: patienceBarRef, children: [_jsxs("div", { className: "flex justify-between text-[10px] mb-0.5", children: [_jsx("span", { className: "text-text-muted", children: "Client Patience" }), _jsxs("span", { className: `font-mono ${clientState.patienceRemaining > 50 ? 'text-green-400' : clientState.patienceRemaining > 25 ? 'text-yellow-400' : 'text-red-400'}`, children: [Math.round(clientState.patienceRemaining), "%"] })] }), _jsx("div", { className: "h-2 bg-bg-primary rounded-full overflow-hidden", children: _jsx("div", { className: `h-full rounded-full transition-all ${clientState.patienceRemaining > 50 ? 'bg-green-500' : clientState.patienceRemaining > 25 ? 'bg-yellow-500' : 'bg-red-500'}`, style: { width: `${clientState.patienceRemaining}%` } }) })] }), clientState.revealedHints.length > 0 && (_jsxs("div", { className: "space-y-2", children: [_jsxs("p", { className: "text-[10px] text-text-muted uppercase tracking-widest flex items-center gap-1", children: [_jsx(Lightbulb, { size: 10 }), " Signals"] }), clientState.revealedHints.map((hint, i) => (_jsx("div", { className: "p-2 bg-yellow-500/5 border border-yellow-500/20 rounded-[var(--radius-sm)]", children: _jsx("p", { className: "text-[11px] text-yellow-300 leading-relaxed", children: hint }) }, i)))] })), latestRound && (_jsx("div", { className: "p-3 bg-bg-primary rounded-[var(--radius-md)] border border-border-subtle/50", children: _jsxs("p", { className: "text-[11px] text-text-secondary italic leading-relaxed", children: ["\"", latestRound.clientNote, "\""] }) }))] }), _jsxs("div", { className: "flex-1 overflow-y-auto p-5 flex flex-col gap-5", children: [showReactions && latestRound && (_jsxs("div", { className: "p-4 bg-bg-primary border border-border-subtle rounded-[var(--radius-md)] space-y-3", children: [_jsxs("h3", { className: "text-[11px] font-semibold text-text-muted uppercase tracking-widest", children: ["Client Response \u2014 Round ", latestRound.round] }), _jsx("div", { className: "flex gap-3", children: [
                                                { label: 'Retainer', reaction: latestRound.reactionRetainer },
                                                { label: 'Success Fee', reaction: latestRound.reactionSuccessFee },
                                                { label: 'Ratchet', reaction: latestRound.reactionRatchet },
                                            ].map(({ label, reaction }, index) => (_jsxs("div", { ref: (el) => { reactionRefs.current[index] = el; }, className: `flex-1 flex flex-col items-center gap-1 py-2 rounded-[var(--radius-sm)] border ${reactionColor[reaction]}`, children: [_jsx("span", { className: "text-xl", children: reactionEmoji[reaction] }), _jsx("span", { className: "text-[10px] font-medium", children: label }), _jsx("span", { className: "text-[10px] opacity-80", children: reactionLabel[reaction] })] }, label))) }), _jsxs("p", { className: "text-[12px] text-text-secondary italic", children: ["\"", latestRound.clientNote, "\""] }), _jsx("div", { className: "flex gap-2", children: latestRound.outcome === 'counter' && (_jsxs(_Fragment, { children: [_jsx("button", { onClick: handleRevise, className: "flex-1 py-2 text-[12px] font-medium text-text-secondary border border-border-subtle rounded-[var(--radius-md)] hover:bg-surface-hover transition-colors", children: "Revise & Counter" }), _jsx("button", { onClick: () => { acceptFeeTerms(); }, className: "flex-1 py-2 text-[12px] font-medium text-accent-primary border border-accent-primary/40 rounded-[var(--radius-md)] hover:bg-accent-soft transition-colors", children: "Accept Client Terms" })] })) })] })), !showReactions && (_jsxs(_Fragment, { children: [_jsxs("div", { className: isRetainerLocked ? 'opacity-60 pointer-events-none' : '', children: [_jsxs("div", { className: "flex items-center gap-1.5 text-[11px] font-semibold text-text-muted uppercase tracking-widest mb-2", children: [_jsx(Shield, { size: 11 }), "Retainer Structure", isRetainerLocked && (_jsxs("span", { className: "ml-auto flex items-center gap-1 text-green-400 normal-case text-[10px] font-normal", children: [_jsx(Lock, { size: 10 }), " Agreed \u2014 ", clientState.lockedRetainerType === 'none' ? 'None' : `€${clientState.lockedRetainerAmount}k (${clientState.lockedRetainerType?.replace('_', ' ')})`] }))] }), !isRetainerLocked && (_jsxs(_Fragment, { children: [_jsx("div", { className: "grid grid-cols-2 gap-2 mb-3", children: ['none', 'monthly', 'per_phase', 'upfront'].map((t) => (_jsx("button", { onClick: () => handleChangeRetainerType(t), className: `py-2 px-3 text-[11px] rounded-[var(--radius-md)] border text-left transition-all ${retainerType === t
                                                                    ? 'border-accent-primary/40 bg-accent-soft text-text-accent'
                                                                    : 'border-border-subtle text-text-muted hover:border-border-subtle/80 hover:text-text-secondary'}`, children: RETAINER_LABELS[t] }, t))) }), retainerType !== 'none' && (_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("input", { type: "range", min: retainerRange.min, max: retainerRange.max, step: retainerRange.step, value: retainerAmount, onChange: (e) => setRetainerAmount(Number(e.target.value)), className: "flex-1 accent-[var(--color-accent-primary)]" }), _jsxs("span", { className: "font-mono text-[13px] text-text-accent w-16 text-right", children: ["\u20AC", retainerAmount, "k"] })] }))] }))] }), _jsxs("div", { className: isSuccessFeeLocked ? 'opacity-60 pointer-events-none' : '', children: [_jsxs("div", { className: "flex items-center gap-1.5 text-[11px] font-semibold text-text-muted uppercase tracking-widest mb-2", children: [_jsx(TrendingUp, { size: 11 }), "Success Fee", isSuccessFeeLocked && (_jsxs("span", { className: "ml-auto flex items-center gap-1 text-green-400 normal-case text-[10px] font-normal", children: [_jsx(Lock, { size: 10 }), " Agreed \u2014 ", clientState.lockedSuccessFeePercent, "%"] }))] }), !isSuccessFeeLocked && (_jsxs("div", { className: "relative", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("input", { type: "range", min: 1, max: 10, step: 0.5, value: successFeePercent, onChange: (e) => setSuccessFeePercent(Number(e.target.value)), className: "flex-1 accent-[var(--color-accent-primary)]" }), _jsxs("span", { className: "font-mono font-bold text-[14px] text-text-accent w-14 text-right", children: [successFeePercent, "%"] })] }), _jsxs("div", { className: "flex justify-between text-[9px] text-text-muted mt-1", children: [_jsx("span", { children: "1% (floor)" }), _jsx("span", { className: "text-yellow-500/70", children: "5% (soft ceiling)" }), _jsx("span", { children: "10% (hard cap)" })] }), successFeePercent > 5 && (_jsx("p", { className: "text-[10px] text-yellow-400 mt-1", children: "\u26A0 Above typical range \u2014 most clients resist >5%" })), _jsxs("p", { className: "text-[11px] text-text-muted mt-1", children: ["Base fee at \u20AC", ev, "M EV: ", _jsxs("span", { className: "font-mono text-text-accent", children: ["\u20AC", baseFee.toFixed(1), "M"] })] })] }))] }), _jsxs("div", { className: isRatchetLocked ? 'opacity-60 pointer-events-none' : '', children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsxs("div", { className: "flex items-center gap-1.5 text-[11px] font-semibold text-text-muted uppercase tracking-widest", children: [_jsx(BarChart2, { size: 11 }), "Ratchet / Premio", isRatchetLocked && (_jsxs("span", { className: "flex items-center gap-1 text-green-400 normal-case text-[10px] font-normal", children: [_jsx(Lock, { size: 10 }), " Agreed"] }))] }), _jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [_jsx("span", { className: "text-[11px] text-text-muted", children: ratchetEnabled ? 'Enabled' : 'Disabled' }), _jsx("div", { onClick: () => setRatchetEnabled(!ratchetEnabled), className: `w-9 h-5 rounded-full transition-colors cursor-pointer relative ${ratchetEnabled ? 'bg-accent-primary' : 'bg-bg-primary border border-border-subtle'}`, children: _jsx("div", { className: `w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${ratchetEnabled ? 'translate-x-4' : 'translate-x-0.5'}` }) })] })] }), ratchetEnabled && (_jsxs("div", { className: "space-y-3 bg-bg-primary p-3 rounded-[var(--radius-md)] border border-border-subtle", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex justify-between text-[11px] text-text-muted mb-1", children: [_jsx("span", { children: "EV Threshold" }), _jsxs("span", { className: "font-mono text-text-secondary", children: ["\u20AC", ratchetThresholdEV, "M"] })] }), _jsx("input", { type: "range", min: 50, max: 200, step: 5, value: ratchetThresholdEV, onChange: (e) => setRatchetThresholdEV(Number(e.target.value)), className: "w-full accent-[var(--color-accent-primary)]" })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex justify-between text-[11px] text-text-muted mb-1", children: [_jsx("span", { children: "Ratchet Bonus %" }), _jsxs("span", { className: "font-mono text-text-secondary", children: [ratchetBonusPercent, "%"] })] }), _jsx("input", { type: "range", min: 1, max: 15, step: 1, value: ratchetBonusPercent, onChange: (e) => setRatchetBonusPercent(Number(e.target.value)), className: "w-full accent-[var(--color-accent-primary)]" })] }), _jsxs("p", { className: "text-[11px] text-text-muted", children: ["Ratchet payout at \u20AC", ev, "M EV:", _jsxs("span", { className: "font-mono text-yellow-400 ml-1", children: ["\u20AC", ratchetFee.toFixed(1), "M"] })] })] }))] }), _jsxs("div", { className: "bg-accent-soft border border-accent-primary/20 rounded-[var(--radius-md)] p-4 space-y-1.5", children: [_jsxs("p", { className: "text-[11px] text-text-muted", children: ["If the deal closes at expected EV (\u20AC", ev, "M):"] }), retainerType !== 'none' && (_jsxs("div", { className: "flex justify-between text-[12px]", children: [_jsx("span", { className: "text-text-muted", children: "Retainer income" }), _jsxs("span", { className: "text-text-secondary font-mono", children: ["\u20AC", retainerAmount, "k (", retainerType === 'monthly' ? '/mo' : retainerType === 'per_phase' ? '/phase' : 'upfront', ")"] })] })), _jsxs("div", { className: "flex justify-between text-[12px]", children: [_jsxs("span", { className: "text-text-muted", children: ["Base success fee (", successFeePercent, "%)"] }), _jsxs("span", { className: "text-text-secondary font-mono", children: ["\u20AC", baseFee.toFixed(1), "M"] })] }), ratchetEnabled && ratchetFee > 0 && (_jsxs("div", { className: "flex justify-between text-[12px]", children: [_jsx("span", { className: "text-text-muted", children: "Ratchet premio" }), _jsxs("span", { className: "text-yellow-400 font-mono", children: ["\u20AC", ratchetFee.toFixed(1), "M"] })] })), _jsxs("div", { className: "border-t border-accent-primary/10 pt-1.5 flex justify-between text-[13px] font-semibold", children: [_jsx("span", { className: "text-text-secondary", children: "Total advisory fee" }), _jsxs("span", { className: "text-text-accent font-mono", children: ["\u20AC", totalFee, "M"] })] })] }), _jsxs("button", { onClick: handleSubmit, className: "w-full py-3 bg-accent-primary text-white font-semibold text-[14px] rounded-[var(--radius-md)] hover:bg-accent-primary/90 transition-all flex items-center justify-center gap-2", children: ["Submit Proposal ", _jsx(ChevronRight, { size: 16 })] })] }))] })] }))] }) }));
}
//# sourceMappingURL=FeeNegotiationModal.js.map