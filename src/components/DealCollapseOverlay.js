import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
export default function DealCollapseOverlay({ headline, description, onComplete }) {
    const [stage, setStage] = useState('fade-in');
    useEffect(() => {
        const t1 = setTimeout(() => setStage('hold'), 800);
        const t2 = setTimeout(() => setStage('fade-out'), 5000);
        const t3 = setTimeout(onComplete, 5600);
        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }, [onComplete]);
    return (_jsxs("div", { className: `fixed inset-0 z-[70] flex items-center justify-center bg-bg-primary transition-opacity duration-800 ${stage === 'fade-in' ? 'opacity-0' : stage === 'hold' ? 'opacity-100' : 'opacity-0'}`, children: [_jsx("div", { className: "absolute inset-0 overflow-hidden", children: _jsx("div", { className: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-state-danger/8 blur-[120px]" }) }), _jsxs("div", { className: "relative text-center space-y-6 max-w-lg mx-auto px-6", children: [_jsx("div", { className: "text-[10px] font-mono uppercase tracking-[0.3em] text-state-danger", children: "Deal Collapsed" }), _jsx("h1", { className: "text-3xl font-display font-bold text-text-primary tracking-tight", children: headline }), _jsx("p", { className: "text-[14px] text-text-secondary leading-relaxed", children: description }), _jsx("div", { className: "w-24 h-px bg-state-danger/40 mx-auto" }), _jsx("p", { className: "text-[11px] font-mono uppercase tracking-widest text-text-muted", children: "Transaction Terminated" })] })] }));
}
//# sourceMappingURL=DealCollapseOverlay.js.map