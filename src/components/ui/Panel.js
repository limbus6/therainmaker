import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const variantStyles = {
    default: 'bg-bg-panel/60 border-border-subtle',
    elevated: 'bg-bg-elevated/60 border-border-default shadow-[var(--shadow-panel)]',
    accent: 'bg-bg-panel/60 border-border-accent shadow-[var(--shadow-glow-soft)]',
    critical: 'bg-bg-panel/60 border-state-danger/30',
};
export default function Panel({ children, title, subtitle, variant = 'default', className = '', headerRight }) {
    return (_jsxs("div", { className: `rounded-[var(--radius-lg)] border p-4 ${variantStyles[variant]} ${className}`, children: [(title || headerRight) && (_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsxs("div", { children: [title && _jsx("h3", { className: "text-[13px] font-semibold uppercase tracking-wider text-text-secondary", children: title }), subtitle && _jsx("p", { className: "text-[11px] text-text-muted mt-0.5", children: subtitle })] }), headerRight] })), children] }));
}
//# sourceMappingURL=Panel.js.map