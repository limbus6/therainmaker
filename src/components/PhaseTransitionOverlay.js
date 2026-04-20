import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { PHASE_NAMES } from '../types/game';
const PHASE_TAGLINES = {
    0: 'Source, qualify, and assess the opportunity.',
    1: 'Build the investment case. Win the mandate.',
    2: 'Build materials, financial models, and the data room.',
    3: 'Distribute teasers, sign NDAs, engage the market.',
    4: 'Filter to serious buyers. Qualify intent and capacity.',
    5: 'Receive and analyse non-binding offers.',
    6: 'Open the data room. Expert sessions and management presentations.',
    7: 'Best and final offers. SPA drafts circulate.',
    8: 'Mark-ups, reps & warranties, disclosure schedules.',
    9: 'Contracts in agreed form. Board approvals.',
    10: 'Conditions precedent satisfied. Wire the funds.',
};
export default function PhaseTransitionOverlay({ fromPhase, toPhase, onComplete }) {
    const [stage, setStage] = useState('fade-in');
    useEffect(() => {
        const t1 = setTimeout(() => setStage('hold'), 600);
        const t2 = setTimeout(() => setStage('fade-out'), 3000);
        const t3 = setTimeout(onComplete, 3600);
        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }, [onComplete]);
    return (_jsxs("div", { className: `fixed inset-0 z-[60] flex items-center justify-center bg-bg-primary transition-opacity duration-600 ${stage === 'fade-in' ? 'opacity-0' : stage === 'hold' ? 'opacity-100' : 'opacity-0'}`, children: [_jsx("div", { className: "absolute inset-0 overflow-hidden", children: _jsx("div", { className: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-accent-primary/10 blur-[120px]" }) }), _jsxs("div", { className: "relative text-center space-y-6", children: [_jsxs("div", { className: "text-[11px] font-mono uppercase tracking-widest text-text-muted", children: ["Phase ", fromPhase, ": ", PHASE_NAMES[fromPhase], _jsx("span", { className: "mx-3 text-accent-primary", children: "\u2192" })] }), _jsxs("div", { children: [_jsxs("div", { className: "text-[10px] font-mono uppercase tracking-[0.3em] text-accent-primary mb-3", children: ["Phase ", toPhase] }), _jsx("h1", { className: "text-4xl font-display font-bold text-text-primary tracking-tight", children: PHASE_NAMES[toPhase] })] }), _jsx("p", { className: "text-[14px] text-text-secondary max-w-md mx-auto leading-relaxed", children: PHASE_TAGLINES[toPhase] }), _jsx("div", { className: "w-24 h-px bg-accent-primary/40 mx-auto" })] })] }));
}
//# sourceMappingURL=PhaseTransitionOverlay.js.map