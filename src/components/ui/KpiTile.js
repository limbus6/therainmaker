import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { formatNumber } from '../../utils/numberFormat';
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
export default function KpiTile({ label, value, trend, color = 'default', onClick }) {
    const [flash, setFlash] = useState(false);
    const [prevValue, setPrevValue] = useState(value);
    useEffect(() => {
        if (value !== prevValue) {
            setFlash(true);
            setPrevValue(value);
            const timer = setTimeout(() => setFlash(false), 600);
            return () => clearTimeout(timer);
        }
    }, [value, prevValue]);
    const renderedValue = typeof value === 'number' ? formatNumber(value) : value;
    return (_jsxs("div", { className: `bg-bg-panel/60 border border-border-subtle rounded-[var(--radius-md)] p-3 min-w-[120px] ${onClick ? 'cursor-pointer hover:border-accent-primary/40 transition-colors' : ''}`, onClick: onClick, children: [_jsx("div", { className: "text-[10px] font-mono uppercase tracking-widest text-text-muted mb-1", children: label }), _jsxs("div", { className: "flex items-baseline gap-2", children: [_jsx("span", { className: `text-xl font-semibold font-mono ${colorMap[color]} ${flash ? 'animate-pulse' : ''}`, children: renderedValue }), trend && (_jsx("span", { className: `text-[10px] ${trendColor[trend]}`, children: trendSymbol[trend] }))] })] }));
}
//# sourceMappingURL=KpiTile.js.map