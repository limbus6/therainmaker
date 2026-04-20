import React, { useState, useMemo } from 'react';

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
 * Calculates the total weekly cost of all allocations
 * @param allocations - Array of contractor allocations
 * @returns Total weekly cost across all allocations
 */
const calculateTotalWeeklyCost = (allocations: Allocation[]): number => {
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
const calculateBudgetRemaining = (budget: number, budgetMax: number): number => {
  return Math.max(0, budgetMax - budget);
};

/**
 * Calculates the percentage of budget consumed
 * @param budget - Current budget consumed
 * @param budgetMax - Maximum budget available
 * @returns Percentage as a number (0-100)
 */
const calculateBudgetPercentage = (budget: number, budgetMax: number): number => {
  if (budgetMax === 0) return 0;
  return Math.min(100, (budget / budgetMax) * 100);
};

/**
 * Formats currency values for display
 * @param value - Numeric value to format
 * @returns Formatted currency string
 */
const formatCurrency = (value: number): string => {
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
const ContractorPanel: React.FC<ContractorPanelProps> = ({
  allocations,
  budget,
  budgetMax,
  onAllocate,
  onRemove,
  availableTasks,
}) => {
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [weeklyRate, setWeeklyRate] = useState<number>(0);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  // Calculate derived values
  const totalWeeklyCost = useMemo(
    () => calculateTotalWeeklyCost(allocations),
    [allocations]
  );

  const budgetRemaining = useMemo(
    () => calculateBudgetRemaining(budget, budgetMax),
    [budget, budgetMax]
  );

  const budgetPercentage = useMemo(
    () => calculateBudgetPercentage(budget, budgetMax),
    [budget, budgetMax]
  );

  const isBudgetExceeded = budget > budgetMax;
  const canAddAllocation = budgetRemaining >= weeklyRate && selectedTaskId !== '';

  /**
   * Handles adding a new allocation
   */
  const handleAddAllocation = (): void => {
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
  const handleRemoveAllocation = (taskId: string): void => {
    onRemove(taskId);
  };

  /**
   * Gets the allocated task names for display
   */
  const allocatedTaskIds = new Set(allocations.map((a) => a.taskId));

  /**
   * Filters available tasks to exclude already allocated ones
   */
  const unallocatedTasks = availableTasks.filter(
    (task) => !allocatedTaskIds.has(task.id)
  );

  return (
    <div className="contractor-panel" style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>Contractor Allocations</h2>
      </div>

      {/* Budget Summary */}
      <div style={styles.budgetSection}>
        <div style={styles.budgetRow}>
          <span style={styles.label}>Budget Consumed:</span>
          <span style={styles.value}>{formatCurrency(budget)}</span>
        </div>
        <div style={styles.budgetRow}>
          <span style={styles.label}>Budget Remaining:</span>
          <span
            style={{
              ...styles.value,
              color: budgetRemaining < 0 ? '#dc2626' : '#059669',
            }}
          >
            {formatCurrency(budgetRemaining)}
          </span>
        </div>
        <div style={styles.budgetRow}>
          <span style={styles.label}>Total Budget:</span>
          <span style={styles.value}>{formatCurrency(budgetMax)}</span>
        </div>

        {/* Budget Percentage Bar */}
        <div style={styles.progressBarContainer}>
          <div
            style={{
              ...styles.progressBar,
              width: `${budgetPercentage}%`,
              backgroundColor: isBudgetExceeded ? '#dc2626' : '#3b82f6',
            }}
          />
        </div>
        <div style={styles.percentageText}>
          {budgetPercentage.toFixed(1)}% of budget allocated
        </div>

        {/* Budget Warning */}
        {isBudgetExceeded && (
          <div style={styles.warningBox}>
            ⚠️ Budget exceeded by {formatCurrency(budget - budgetMax)}
          </div>
        )}
      </div>

      {/* Allocations List */}
      <div style={styles.allocationsSection}>
        <h3 style={styles.sectionTitle}>Active Allocations</h3>

        {allocations.length === 0 ? (
          <div style={styles.emptyState}>
            No contractor allocations yet. Add one to get started.
          </div>
        ) : (
          <div style={styles.allocationsList}>
            {allocations.map((allocation) => (
              <div key={allocation.taskId} style={styles.allocationRow}>
                <div style={styles.allocationInfo}>
                  <div style={styles.taskName}>{allocation.taskName}</div>
                  <div style={styles.allocationDetails}>
                    <span style={styles.detailItem}>
                      Weekly: {formatCurrency(allocation.weeklyRate)}
                    </span>
                    <span style={styles.detailItem}>
                      Speed: {allocation.speedMultiplier.toFixed(1)}x faster
                    </span>
                    <span style={styles.detailItem}>
                      Weeks: {allocation.startWeek}
                      {allocation.endWeek ? ` - ${allocation.endWeek}` : '+'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveAllocation(allocation.taskId)}
                  style={styles.removeButton}
                  title="Remove allocation"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Weekly Cost Summary */}
      {allocations.length > 0 && (
        <div style={styles.weeklyCostSection}>
          <span style={styles.label}>Total Weekly Cost:</span>
          <span style={styles.weeklyCostValue}>{formatCurrency(totalWeeklyCost)}</span>
        </div>
      )}

      {/* Add Allocation Form */}
      <div style={styles.addAllocationSection}>
        {!showAddForm ? (
          <button
            onClick={() => setShowAddForm(true)}
            style={styles.addButton}
            disabled={unallocatedTasks.length === 0}
            title={
              unallocatedTasks.length === 0
                ? 'All available tasks are already allocated'
                : 'Add a new contractor allocation'
            }
          >
            + Add Allocation
          </button>
        ) : (
          <div style={styles.formContainer}>
            <h3 style={styles.formTitle}>New Allocation</h3>

            {/* Task Selector */}
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Task:</label>
              <select
                value={selectedTaskId}
                onChange={(e) => setSelectedTaskId(e.target.value)}
                style={styles.formSelect}
              >
                <option value="">-- Select a task --</option>
                {unallocatedTasks.map((task) => (
                  <option key={task.id} value={task.id}>
                    {task.name} ({task.complexity})
                  </option>
                ))}
              </select>
            </div>

            {/* Weekly Rate Input */}
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Weekly Rate ($):</label>
              <input
                type="number"
                min="0"
                step="100"
                value={weeklyRate}
                onChange={(e) => setWeeklyRate(Math.max(0, parseFloat(e.target.value) || 0))}
                style={styles.formInput}
                placeholder="0"
              />
            </div>

            {/* Speed Multiplier Input */}
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Speed Multiplier:</label>
              <input
                type="number"
                min="0.5"
                max="3"
                step="0.1"
                value={speedMultiplier}
                onChange={(e) =>
                  setSpeedMultiplier(Math.max(0.5, Math.min(3, parseFloat(e.target.value) || 1)))
                }
                style={styles.formInput}
                placeholder="1.0"
              />
              <div style={styles.formHint}>{speedMultiplier.toFixed(1)}x faster</div>
            </div>

            {/* Budget Check */}
            {weeklyRate > budgetRemaining && (
              <div style={styles.errorBox}>
                ⚠️ Insufficient budget. Need {formatCurrency(weeklyRate)}, have{' '}
                {formatCurrency(budgetRemaining)}
              </div>
            )}

            {/* Form Actions */}
            <div style={styles.formActions}>
              <button
                onClick={handleAddAllocation}
                style={{
                  ...styles.submitButton,
                  opacity: canAddAllocation ? 1 : 0.5,
                  cursor: canAddAllocation ? 'pointer' : 'not-allowed',
                }}
                disabled={!canAddAllocation}
              >
                Add
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setSelectedTaskId('');
                  setWeeklyRate(0);
                  setSpeedMultiplier(1);
                }}
                style={styles.cancelButton}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Inline styles for the component
 */
const styles: Record<string, React.CSSProperties> = {
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
