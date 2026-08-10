import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { formatNumber } from '../../utils/numberFormat';
import { animateCounter, prefersReducedMotion } from '../../utils/motion';
const colorMap = {
    default: 'text-text-primary',
    success: 'text-state-success',
    warning: 'text-state-warning',
    danger: 'text-state-danger',
    accent: 'text-text-accent',
};
const trendSymbol = {
    up: '▲',
    down: '▼',
    stable: '—',
};
const trendColor = {
    up: 'text-state-success',
    down: 'text-state-danger',
    stable: 'text-text-muted',
};
export default function KpiTile({ label, value, prefix = '', suffix = '', trend, color = 'default', onClick, delta, deltaReason, deltaKey, invertDelta = false, }) {
    const [flash, setFlash] = useState(false);
    const [chipVisible, setChipVisible] = useState(false);
    const valueRef = useRef(null);
    const prevValueRef = useRef(value);
    const prevDeltaKeyRef = useRef(deltaKey);
    // Animate numeric value changes old → new; flash for string changes.
    useEffect(() => {
        const prev = prevValueRef.current;
        if (value === prev)
            return;
        prevValueRef.current = value;
        if (typeof value === 'number' && typeof prev === 'number' && !prefersReducedMotion()) {
            animateCounter(valueRef.current, prev, value, 0.7, prefix, suffix);
        }
        else if (valueRef.current) {
            valueRef.current.textContent = typeof value === 'number' ? `${prefix}${formatNumber(value)}${suffix}` : String(value);
        }
        const onTimer = setTimeout(() => setFlash(true), 0);
        const offTimer = setTimeout(() => setFlash(false), 600);
        return () => { clearTimeout(onTimer); clearTimeout(offTimer); };
    }, [value, prefix, suffix]);
    // Show the delta chip whenever a new advance produced a change.
    useEffect(() => {
        if (deltaKey === prevDeltaKeyRef.current)
            return;
        prevDeltaKeyRef.current = deltaKey;
        if (!delta)
            return;
        const onTimer = setTimeout(() => setChipVisible(true), 0);
        const offTimer = setTimeout(() => setChipVisible(false), 2400);
        return () => { clearTimeout(onTimer); clearTimeout(offTimer); };
    }, [deltaKey, delta]);
    const renderedValue = typeof value === 'number' ? `${prefix}${formatNumber(value)}${suffix}` : value;
    const deltaIsGood = delta !== undefined && (invertDelta ? delta < 0 : delta > 0);
    return (_jsxs("div", { className: `relative bg-bg-panel/60 border border-border-subtle rounded-[var(--radius-md)] p-3 min-w-[120px] ${onClick ? 'cursor-pointer hover:border-accent-primary/40 transition-colors' : ''}`, onClick: onClick, children: [chipVisible && delta !== undefined && delta !== 0 && (_jsx("span", { title: deltaReason, className: `kpi-delta-chip absolute -top-2 right-2 px-1.5 py-0.5 rounded-full border text-[10px] font-mono font-semibold pointer-events-none ${deltaIsGood
                    ? 'border-state-success/40 bg-state-success/15 text-state-success'
                    : 'border-state-danger/40 bg-state-danger/15 text-state-danger'}`, children: delta > 0 ? `+${delta}` : delta })), _jsx("div", { className: "text-[10px] font-mono uppercase tracking-widest text-text-muted mb-1", children: label }), _jsxs("div", { className: "flex items-baseline gap-2", children: [_jsx("span", { ref: valueRef, className: `text-xl font-semibold font-mono ${colorMap[color]} ${flash ? 'animate-pulse' : ''}`, children: renderedValue }), trend && (_jsx("span", { className: `text-[10px] ${trendColor[trend]}`, children: trendSymbol[trend] }))] })] }));
}
//# sourceMappingURL=KpiTile.js.map