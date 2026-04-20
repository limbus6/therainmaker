import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useGameStore } from '../store/gameStore';
import Panel from '../components/ui/Panel';
import ProgressBar from '../components/ui/ProgressBar';
import StatusChip from '../components/ui/StatusChip';
const statusVariant = {
    not_started: 'muted',
    drafting: 'info',
    in_review: 'accent',
    revision: 'warning',
    approved: 'success',
    delivered: 'success',
};
const qualityVariant = {
    poor: 'danger',
    adequate: 'warning',
    good: 'info',
    excellent: 'success',
};
export default function DeliverablesScreen() {
    const deliverables = useGameStore((s) => s.deliverables);
    return (_jsxs("div", { className: "space-y-6 max-w-[1200px]", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-display font-semibold text-text-primary", children: "Deliverables" }), _jsx("p", { className: "text-[12px] text-text-muted mt-1", children: "Track all formal process outputs" })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: deliverables.map((del) => (_jsxs(Panel, { variant: del.status === 'in_review' || del.status === 'revision' ? 'accent' : 'default', children: [_jsx("div", { className: "flex items-start justify-between mb-3", children: _jsxs("div", { children: [_jsx("h3", { className: "text-[14px] font-semibold text-text-primary", children: del.name }), _jsxs("div", { className: "flex items-center gap-2 mt-1", children: [_jsx(StatusChip, { label: del.status.replace('_', ' '), variant: statusVariant[del.status] }), _jsx(StatusChip, { label: `Quality: ${del.quality}`, variant: qualityVariant[del.quality] })] })] }) }), _jsx(ProgressBar, { value: del.completion, color: del.completion === 100 ? 'success' : 'accent', size: "md", showLabel: true }), del.owner && (_jsxs("div", { className: "text-[10px] font-mono text-text-muted mt-2", children: ["Owner: ", del.owner] }))] }, del.id))) })] }));
}
//# sourceMappingURL=DeliverablesScreen.js.map