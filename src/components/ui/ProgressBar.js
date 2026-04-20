import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { formatNumber } from '../../utils/numberFormat';
const colorMap = {
    accent: 'bg-accent-primary',
    success: 'bg-state-success',
    warning: 'bg-state-warning',
    danger: 'bg-state-danger',
    info: 'bg-state-info',
};
export default function ProgressBar({ value, color = 'accent', size = 'sm', showLabel = false }) {
    const h = size === 'sm' ? 'h-1.5' : 'h-2.5';
    const clamped = Math.max(0, Math.min(100, value));
    return (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: `flex-1 ${h} rounded-full bg-surface-default overflow-hidden`, children: _jsx("div", { className: `${h} rounded-full ${colorMap[color]} transition-all duration-500 ease-out`, style: { width: `${clamped}%` } }) }), showLabel && (_jsxs("span", { className: "text-[10px] font-mono text-text-muted w-10 text-right", children: [formatNumber(clamped), "%"] }))] }));
}
//# sourceMappingURL=ProgressBar.js.map