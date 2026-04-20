import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import Panel from '../components/ui/Panel';
import StatusChip from '../components/ui/StatusChip';
import ProgressBar from '../components/ui/ProgressBar';
import { Play, CheckCircle2, Lock, ChevronDown, ChevronRight } from 'lucide-react';
const statusVariant = {
    available: 'default',
    recommended: 'accent',
    locked: 'muted',
    in_progress: 'info',
    completed: 'success',
    reopened: 'warning',
};
const categoryLabels = {
    deliverable: 'Deliverable',
    relationship: 'Relationship',
    market: 'Market',
    internal: 'Internal',
    external_advisor: 'External',
    strategic: 'Strategic',
};
export default function TasksScreen() {
    const { tasks, workstreams, startTask, phase, leads } = useGameStore();
    const [filter, setFilter] = useState('all');
    const [expandedTask, setExpandedTask] = useState(null);
    const filteredTasks = tasks.filter((t) => {
        switch (filter) {
            case 'available': return t.status === 'available' || t.status === 'recommended';
            case 'in_progress': return t.status === 'in_progress';
            case 'completed': return t.status === 'completed';
            case 'all': return t.status !== 'completed';
            default: return true;
        }
    });
    const activeWorkstreams = workstreams.filter((w) => w.active);
    const filters = [
        { key: 'all', label: 'All' },
        { key: 'available', label: 'Available' },
        { key: 'in_progress', label: 'In Progress' },
        { key: 'completed', label: 'Completed' },
    ];
    const renderTaskList = (taskList) => (_jsx("div", { className: "space-y-1.5", children: taskList.map((task) => {
            const isExpanded = expandedTask === task.id;
            const isActionable = task.status === 'available' || task.status === 'recommended';
            return (_jsxs("div", { className: `rounded-[var(--radius-md)] border transition-all duration-150 ${isExpanded ? 'bg-bg-panel/80 border-border-default' : 'bg-surface-default border-transparent hover:border-border-subtle'}`, children: [_jsx("button", { onClick: () => setExpandedTask(isExpanded ? null : task.id), className: "w-full p-3 text-left", children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx("span", { className: "shrink-0", children: task.status === 'locked' ? _jsx(Lock, { size: 14, className: "text-text-muted/40" }) :
                                        task.status === 'completed' ? _jsx(CheckCircle2, { size: 14, className: "text-state-success" }) :
                                            task.status === 'in_progress' ? _jsx(Play, { size: 14, className: "text-state-info" }) :
                                                isExpanded ? _jsx(ChevronDown, { size: 14, className: "text-text-muted" }) :
                                                    _jsx(ChevronRight, { size: 14, className: "text-text-muted" }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("div", { className: `text-[13px] ${task.status === 'locked' ? 'text-text-muted' : 'text-text-primary'} font-medium break-words sm:truncate`, children: task.name }), _jsxs("div", { className: "mt-2 flex flex-wrap items-center gap-2 sm:hidden", children: [_jsx(StatusChip, { label: categoryLabels[task.category], variant: "muted" }), _jsx(StatusChip, { label: task.status.replace('_', ' '), variant: statusVariant[task.status] }), _jsxs("span", { className: "text-[11px] font-mono text-text-muted", children: ["\u20AC", task.cost, "k"] }), _jsxs("span", { className: "text-[11px] font-mono text-text-muted", children: [task.work, "h"] }), _jsx(StatusChip, { label: task.complexity, variant: task.complexity === 'high' ? 'warning' : task.complexity === 'medium' ? 'default' : 'muted' })] })] }), _jsxs("div", { className: "hidden sm:flex sm:items-center sm:gap-2", children: [_jsx(StatusChip, { label: categoryLabels[task.category], variant: "muted" }), _jsx(StatusChip, { label: task.status.replace('_', ' '), variant: statusVariant[task.status] })] }), _jsxs("div", { className: "hidden sm:flex sm:items-center sm:gap-3 sm:text-[11px] sm:font-mono sm:text-text-muted sm:shrink-0 sm:w-32 sm:justify-end", children: [_jsxs("span", { children: ["\u20AC", task.cost, "k"] }), _jsxs("span", { children: [task.work, "h"] }), _jsx(StatusChip, { label: task.complexity, variant: task.complexity === 'high' ? 'warning' : task.complexity === 'medium' ? 'default' : 'muted' })] })] }) }), isExpanded && (_jsx("div", { className: "px-3 pb-3 pt-0 border-t border-border-subtle mx-3", children: _jsxs("div", { className: "pt-3 space-y-3", children: [_jsx("p", { className: "text-[12px] text-text-secondary leading-relaxed", children: task.description }), _jsxs("div", { className: "flex items-center gap-4 text-[11px]", children: [_jsxs("span", { className: "text-text-muted", children: ["Effect: ", _jsx("span", { className: "text-text-secondary", children: task.effectSummary })] }), task.dependencies && task.dependencies.length > 0 && (_jsxs("span", { className: "text-state-warning", children: ["Requires: ", task.dependencies.join(', ')] }))] }), isActionable && (_jsxs("button", { onClick: (e) => { e.stopPropagation(); startTask(task.id); }, className: "flex items-center gap-2 px-4 py-2 bg-accent-primary hover:bg-accent-hover text-white text-[12px] font-semibold rounded-[var(--radius-md)] transition-colors shadow-[var(--shadow-glow-soft)]", children: [_jsx(Play, { size: 12 }), " Start Task"] }))] }) }))] }, task.id));
        }) }));
    let taskContent;
    if (phase === 0) {
        const generalTasks = filteredTasks.filter(t => !t.targetId);
        const targetGroups = leads.map(lead => ({
            lead,
            tasks: filteredTasks.filter(t => t.targetId === lead.id)
        })).filter(g => g.tasks.length > 0);
        taskContent = (_jsxs("div", { className: "space-y-8", children: [generalTasks.length > 0 && (_jsxs("div", { children: [_jsx("h2", { className: "text-[13px] font-semibold text-text-muted uppercase tracking-widest mb-3", children: "General Origination" }), renderTaskList(generalTasks)] })), targetGroups.map(g => (_jsxs("div", { children: [_jsx("h2", { className: "text-[13px] font-semibold text-text-muted uppercase tracking-widest mb-3", children: g.lead.companyName }), renderTaskList(g.tasks)] }, g.lead.id))), filteredTasks.length === 0 && (_jsx("div", { className: "p-8 text-center border border-dashed border-border-default rounded-[var(--radius-lg)]", children: _jsx("p", { className: "text-[13px] text-text-muted", children: "No tasks found for this view." }) }))] }));
    }
    else {
        taskContent = filteredTasks.length > 0 ? renderTaskList(filteredTasks) : (_jsx("div", { className: "p-8 text-center border border-dashed border-border-default rounded-[var(--radius-lg)]", children: _jsx("p", { className: "text-[13px] text-text-muted", children: "No tasks found for this view." }) }));
    }
    return (_jsxs("div", { className: "space-y-6 max-w-[1200px]", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-display font-semibold text-text-primary", children: "Tasks & Workstreams" }), _jsx("p", { className: "text-[12px] text-text-muted mt-1", children: "Operational control \u2014 manage execution and resource allocation" })] }), activeWorkstreams.length > 0 && (_jsx(Panel, { title: "Active Workstreams", children: _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: activeWorkstreams.map((ws) => (_jsxs("div", { className: "p-3 rounded-[var(--radius-md)] bg-surface-default border border-border-subtle", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("span", { className: "text-[12px] font-medium text-text-secondary", children: ws.name }), _jsxs("span", { className: "text-[10px] font-mono text-text-muted", children: ["Q: ", ws.quality, "%"] })] }), _jsx(ProgressBar, { value: ws.progress, color: "accent", showLabel: true })] }, ws.id))) }) })), _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "flex items-center gap-0.5 bg-surface-default rounded-[var(--radius-md)] p-0.5", children: filters.map((f) => (_jsx("button", { onClick: () => setFilter(f.key), className: `px-3 py-1.5 text-[12px] rounded-[var(--radius-sm)] transition-all duration-150 ${filter === f.key
                                ? 'bg-accent-soft text-text-accent font-medium'
                                : 'text-text-muted hover:text-text-secondary'}`, children: f.label }, f.key))) }), _jsxs("span", { className: "text-[11px] text-text-muted font-mono", children: [filteredTasks.length, " tasks"] })] }), taskContent] }));
}
//# sourceMappingURL=TasksScreen.js.map