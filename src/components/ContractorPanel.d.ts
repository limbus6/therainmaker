import React from 'react';
/**
 * Allocation record for a contractor assigned to a task
 */
interface Allocation {
    taskId: string;
    taskName: string;
    weeklyRate: number;
    speedMultiplier: number;
    startWeek: number;
    endWeek?: number;
}
/**
 * Available task for allocation
 */
interface AvailableTask {
    id: string;
    name: string;
    complexity: string;
}
/**
 * Props for the ContractorPanel component
 */
interface ContractorPanelProps {
    allocations: Allocation[];
    budget: number;
    budgetMax: number;
    onAllocate: (taskId: string, weeklyRate: number, speedMultiplier: number) => void;
    onRemove: (taskId: string) => void;
    availableTasks: AvailableTask[];
}
/**
 * ContractorPanel Component
 *
 * Manages contractor allocations for M&A Rainmaker, displaying active allocations,
 * budget consumption, and providing controls to add/remove allocations.
 *
 * @component
 * @param {ContractorPanelProps} props - Component props
 * @returns {React.ReactElement} The rendered contractor panel
 *
 * @example
 * ```tsx
 * <ContractorPanel
 *   allocations={[]}
 *   budget={50000}
 *   budgetMax={100000}
 *   onAllocate={(taskId, rate, multiplier) => console.log(taskId)}
 *   onRemove={(taskId) => console.log(taskId)}
 *   availableTasks={[{ id: '1', name: 'Task 1', complexity: 'High' }]}
 * />
 * ```
 */
declare const ContractorPanel: React.FC<ContractorPanelProps>;
export default ContractorPanel;
//# sourceMappingURL=ContractorPanel.d.ts.map