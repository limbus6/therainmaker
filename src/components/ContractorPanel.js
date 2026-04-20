import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useMemo } from 'react';
/**
 * Calculates the total weekly cost of all allocations
 * @param allocations - Array of contractor allocations
 * @returns Total weekly cost across all allocations
 */
const calculateTotalWeeklyCost = (allocations) => {
    return allocations.reduce((total, allocation) => {
        return total + allocation.weeklyRate;
    }, 0);
};
/**
 * Calculates the budget remaining
 * @param budget - Current budget consumed
 * @param budgetMax - Maximum budget available
 * @returns Remaining budget amount
 */
const calculateBudgetRemaining = (budget, budgetMax) => {
    return Math.max(0, budgetMax - budget);
};
/**
 * Calculates the percentage of budget consumed
 * @param budget - Current budget consumed
 * @param budgetMax - Maximum budget available
 * @returns Percentage as a number (0-100)
 */
const calculateBudgetPercentage = (budget, budgetMax) => {
    if (budgetMax === 0)
        return 0;
    return Math.min(100, (budget / budgetMax) * 100);
};
/**
 * Formats currency values for display
 * @param value - Numeric value to format
 * @returns Formatted currency string
 */
const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};
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
const ContractorPanel = ({ allocations, budget, budgetMax, onAllocate, onRemove, availableTasks, }) => {
    const [selectedTaskId, setSelectedTaskId] = useState('');
    const [weeklyRate, setWeeklyRate] = useState(0);
    const [speedMultiplier, setSpeedMultiplier] = useState(1);
    const [showAddForm, setShowAddForm] = useState(false);
    // Calculate derived values
    const totalWeeklyCost = useMemo(() => calculateTotalWeeklyCost(allocations), [allocations]);
    const budgetRemaining = useMemo(() => calculateBudgetRemaining(budget, budgetMax), [budget, budgetMax]);
    const budgetPercentage = useMemo(() => calculateBudgetPercentage(budget, budgetMax), [budget, budgetMax]);
    const isBudgetExceeded = budget > budgetMax;
    const canAddAllocation = budgetRemaining >= weeklyRate && selectedTaskId !== '';
    /**
     * Handles adding a new allocation
     */
    const handleAddAllocation = () => {
        if (!canAddAllocation) {
            return;
        }
        onAllocate(selectedTaskId, weeklyRate, speedMultiplier);
        // Reset form
        setSelectedTaskId('');
        setWeeklyRate(0);
        setSpeedMultiplier(1);
        setShowAddForm(false);
    };
    /**
     * Handles removing an allocation
     * @param taskId - ID of the task to remove
     */
    const handleRemoveAllocation = (taskId) => {
        onRemove(taskId);
    };
    /**
     * Gets the allocated task names for display
     */
    const allocatedTaskIds = new Set(allocations.map((a) => a.taskId));
    /**
     * Filters available tasks to exclude already allocated ones
     */
    const unallocatedTasks = availableTasks.filter((task) => !allocatedTaskIds.has(task.id));
    return (_jsxs("div", { className: "contractor-panel", style: styles.container, children: [_jsx("div", { style: styles.header, children: _jsx("h2", { style: styles.title, children: "Contractor Allocations" }) }), _jsxs("div", { style: styles.budgetSection, children: [_jsxs("div", { style: styles.budgetRow, children: [_jsx("span", { style: styles.label, children: "Budget Consumed:" }), _jsx("span", { style: styles.value, children: formatCurrency(budget) })] }), _jsxs("div", { style: styles.budgetRow, children: [_jsx("span", { style: styles.label, children: "Budget Remaining:" }), _jsx("span", { style: {
                                    ...styles.value,
                                    color: budgetRemaining < 0 ? '#dc2626' : '#059669',
                                }, children: formatCurrency(budgetRemaining) })] }), _jsxs("div", { style: styles.budgetRow, children: [_jsx("span", { style: styles.label, children: "Total Budget:" }), _jsx("span", { style: styles.value, children: formatCurrency(budgetMax) })] }), _jsx("div", { style: styles.progressBarContainer, children: _jsx("div", { style: {
                                ...styles.progressBar,
                                width: `${budgetPercentage}%`,
                                backgroundColor: isBudgetExceeded ? '#dc2626' : '#3b82f6',
                            } }) }), _jsxs("div", { style: styles.percentageText, children: [budgetPercentage.toFixed(1), "% of budget allocated"] }), isBudgetExceeded && (_jsxs("div", { style: styles.warningBox, children: ["\u26A0\uFE0F Budget exceeded by ", formatCurrency(budget - budgetMax)] }))] }), _jsxs("div", { style: styles.allocationsSection, children: [_jsx("h3", { style: styles.sectionTitle, children: "Active Allocations" }), allocations.length === 0 ? (_jsx("div", { style: styles.emptyState, children: "No contractor allocations yet. Add one to get started." })) : (_jsx("div", { style: styles.allocationsList, children: allocations.map((allocation) => (_jsxs("div", { style: styles.allocationRow, children: [_jsxs("div", { style: styles.allocationInfo, children: [_jsx("div", { style: styles.taskName, children: allocation.taskName }), _jsxs("div", { style: styles.allocationDetails, children: [_jsxs("span", { style: styles.detailItem, children: ["Weekly: ", formatCurrency(allocation.weeklyRate)] }), _jsxs("span", { style: styles.detailItem, children: ["Speed: ", allocation.speedMultiplier.toFixed(1), "x faster"] }), _jsxs("span", { style: styles.detailItem, children: ["Weeks: ", allocation.startWeek, allocation.endWeek ? ` - ${allocation.endWeek}` : '+'] })] })] }), _jsx("button", { onClick: () => handleRemoveAllocation(allocation.taskId), style: styles.removeButton, title: "Remove allocation", children: "\u2715" })] }, allocation.taskId))) }))] }), allocations.length > 0 && (_jsxs("div", { style: styles.weeklyCostSection, children: [_jsx("span", { style: styles.label, children: "Total Weekly Cost:" }), _jsx("span", { style: styles.weeklyCostValue, children: formatCurrency(totalWeeklyCost) })] })), _jsx("div", { style: styles.addAllocationSection, children: !showAddForm ? (_jsx("button", { onClick: () => setShowAddForm(true), style: styles.addButton, disabled: unallocatedTasks.length === 0, title: unallocatedTasks.length === 0
                        ? 'All available tasks are already allocated'
                        : 'Add a new contractor allocation', children: "+ Add Allocation" })) : (_jsxs("div", { style: styles.formContainer, children: [_jsx("h3", { style: styles.formTitle, children: "New Allocation" }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.formLabel, children: "Task:" }), _jsxs("select", { value: selectedTaskId, onChange: (e) => setSelectedTaskId(e.target.value), style: styles.formSelect, children: [_jsx("option", { value: "", children: "-- Select a task --" }), unallocatedTasks.map((task) => (_jsxs("option", { value: task.id, children: [task.name, " (", task.complexity, ")"] }, task.id)))] })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.formLabel, children: "Weekly Rate ($):" }), _jsx("input", { type: "number", min: "0", step: "100", value: weeklyRate, onChange: (e) => setWeeklyRate(Math.max(0, parseFloat(e.target.value) || 0)), style: styles.formInput, placeholder: "0" })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.formLabel, children: "Speed Multiplier:" }), _jsx("input", { type: "number", min: "0.5", max: "3", step: "0.1", value: speedMultiplier, onChange: (e) => setSpeedMultiplier(Math.max(0.5, Math.min(3, parseFloat(e.target.value) || 1))), style: styles.formInput, placeholder: "1.0" }), _jsxs("div", { style: styles.formHint, children: [speedMultiplier.toFixed(1), "x faster"] })] }), weeklyRate > budgetRemaining && (_jsxs("div", { style: styles.errorBox, children: ["\u26A0\uFE0F Insufficient budget. Need ", formatCurrency(weeklyRate), ", have", ' ', formatCurrency(budgetRemaining)] })), _jsxs("div", { style: styles.formActions, children: [_jsx("button", { onClick: handleAddAllocation, style: {
                                        ...styles.submitButton,
                                        opacity: canAddAllocation ? 1 : 0.5,
                                        cursor: canAddAllocation ? 'pointer' : 'not-allowed',
                                    }, disabled: !canAddAllocation, children: "Add" }), _jsx("button", { onClick: () => {
                                        setShowAddForm(false);
                                        setSelectedTaskId('');
                                        setWeeklyRate(0);
                                        setSpeedMultiplier(1);
                                    }, style: styles.cancelButton, children: "Cancel" })] })] })) })] }));
};
/**
 * Inline styles for the component
 */
const styles = {
    container: {
        padding: '20px',
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        maxWidth: '600px',
        margin: '0 auto',
    },
    header: {
        marginBottom: '20px',
        borderBottom: '2px solid #3b82f6',
        paddingBottom: '10px',
    },
    title: {
        margin: 0,
        fontSize: '24px',
        fontWeight: '600',
        color: '#1f2937',
    },
    budgetSection: {
        backgroundColor: '#fff',
        padding: '15px',
        borderRadius: '6px',
        marginBottom: '20px',
        border: '1px solid #e5e7eb',
    },
    budgetRow: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '10px',
        fontSize: '14px',
    },
    label: {
        fontWeight: '500',
        color: '#6b7280',
    },
    value: {
        fontWeight: '600',
        color: '#1f2937',
    },
    progressBarContainer: {
        width: '100%',
        height: '8px',
        backgroundColor: '#e5e7eb',
        borderRadius: '4px',
        overflow: 'hidden',
        marginTop: '12px',
        marginBottom: '6px',
    },
    progressBar: {
        height: '100%',
        transition: 'width 0.3s ease',
    },
    percentageText: {
        fontSize: '12px',
        color: '#6b7280',
        textAlign: 'right',
        marginBottom: '10px',
    },
    warningBox: {
        backgroundColor: '#fef2f2',
        border: '1px solid #fecaca',
        color: '#dc2626',
        padding: '10px',
        borderRadius: '4px',
        fontSize: '13px',
        marginTop: '10px',
    },
    errorBox: {
        backgroundColor: '#fef2f2',
        border: '1px solid #fecaca',
        color: '#dc2626',
        padding: '10px',
        borderRadius: '4px',
        fontSize: '13px',
        marginBottom: '10px',
    },
    allocationsSection: {
        marginBottom: '20px',
    },
    sectionTitle: {
        margin: '0 0 12px 0',
        fontSize: '16px',
        fontWeight: '600',
        color: '#1f2937',
    },
    emptyState: {
        backgroundColor: '#f3f4f6',
        padding: '20px',
        borderRadius: '6px',
        textAlign: 'center',
        color: '#6b7280',
        fontSize: '14px',
    },
    allocationsList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
    },
    allocationRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        backgroundColor: '#fff',
        padding: '12px',
        borderRadius: '6px',
        border: '1px solid #e5e7eb',
    },
    allocationInfo: {
        flex: 1,
    },
    taskName: {
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: '6px',
        fontSize: '14px',
    },
    allocationDetails: {
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
    },
    detailItem: {
        fontSize: '12px',
        color: '#6b7280',
    },
    removeButton: {
        backgroundColor: '#fee2e2',
        border: '1px solid #fecaca',
        color: '#dc2626',
        width: '28px',
        height: '28px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s ease',
        marginLeft: '10px',
        flexShrink: 0,
    },
    weeklyCostSection: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#eff6ff',
        padding: '12px',
        borderRadius: '6px',
        border: '1px solid #bfdbfe',
        marginBottom: '20px',
        fontSize: '14px',
    },
    weeklyCostValue: {
        fontWeight: '700',
        color: '#1e40af',
        fontSize: '16px',
    },
    addAllocationSection: {
        marginTop: '20px',
    },
    addButton: {
        width: '100%',
        padding: '12px',
        backgroundColor: '#3b82f6',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'background-color 0.2s ease',
    },
    formContainer: {
        backgroundColor: '#fff',
        padding: '15px',
        borderRadius: '6px',
        border: '1px solid #e5e7eb',
    },
    formTitle: {
        margin: '0 0 15px 0',
        fontSize: '16px',
        fontWeight: '600',
        color: '#1f2937',
    },
    formGroup: {
        marginBottom: '15px',
    },
    formLabel: {
        display: 'block',
        marginBottom: '6px',
        fontSize: '13px',
        fontWeight: '500',
        color: '#374151',
    },
    formSelect: {
        width: '100%',
        padding: '8px',
        border: '1px solid #d1d5db',
        borderRadius: '4px',
        fontSize: '13px',
        fontFamily: 'inherit',
        boxSizing: 'border-box',
    },
    formInput: {
        width: '100%',
        padding: '8px',
        border: '1px solid #d1d5db',
        borderRadius: '4px',
        fontSize: '13px',
        fontFamily: 'inherit',
        boxSizing: 'border-box',
    },
    formHint: {
        fontSize: '12px',
        color: '#6b7280',
        marginTop: '4px',
    },
    formActions: {
        display: 'flex',
        gap: '10px',
        marginTop: '15px',
    },
    submitButton: {
        flex: 1,
        padding: '10px',
        backgroundColor: '#10b981',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        fontSize: '13px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'background-color 0.2s ease',
    },
    cancelButton: {
        flex: 1,
        padding: '10px',
        backgroundColor: '#e5e7eb',
        color: '#374151',
        border: 'none',
        borderRadius: '4px',
        fontSize: '13px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'background-color 0.2s ease',
    },
};
export default ContractorPanel;
//# sourceMappingURL=ContractorPanel.js.map