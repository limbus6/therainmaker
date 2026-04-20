import { jsx as _jsx } from "react/jsx-runtime";
const variantStyles = {
    default: 'bg-surface-default text-text-secondary border-border-subtle',
    success: 'bg-state-success/15 text-state-success border-state-success/30',
    warning: 'bg-state-warning/15 text-state-warning border-state-warning/30',
    danger: 'bg-state-danger/15 text-state-danger border-state-danger/30',
    info: 'bg-state-info/15 text-state-info border-state-info/30',
    accent: 'bg-accent-soft text-text-accent border-border-accent',
    muted: 'bg-surface-default text-text-muted border-border-subtle',
};
export default function StatusChip({ label, variant = 'default', size = 'sm' }) {
    const sizeClass = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-[11px] px-2.5 py-1';
    return (_jsx("span", { className: `inline-flex items-center rounded-[var(--radius-sm)] border font-mono uppercase tracking-wider font-medium ${sizeClass} ${variantStyles[variant]}`, children: label }));
}
//# sourceMappingURL=StatusChip.js.map