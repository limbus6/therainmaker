import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useMemo } from 'react';
/**
 * Color configuration for different buyer statuses
 */
const STATUS_COLORS = {
    prospect: { bg: '#f3f4f6', text: '#6b7280', border: '#d1d5db' },
    qualified: { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' },
    bidding: { bg: '#dcfce7', text: '#166534', border: '#86efac' },
    preferred: { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' },
    dropped: { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' },
};
/**
 * Get human-readable status label
 * @param status - The buyer status type
 * @returns Formatted status label
 */
const getStatusLabel = (status) => {
    const labels = {
        prospect: 'Prospect',
        qualified: 'Qualified',
        bidding: 'Bidding',
        preferred: 'Preferred',
        dropped: 'Dropped',
    };
    return labels[status];
};
/**
 * Get progress bar color based on value
 * @param value - Numeric value 0-100
 * @returns CSS color string
 */
const getProgressColor = (value) => {
    if (value >= 75)
        return '#10b981';
    if (value >= 50)
        return '#f59e0b';
    if (value >= 25)
        return '#ef4444';
    return '#6b7280';
};
/**
 * ProgressBar component for displaying metrics
 * @param label - Label for the progress bar
 * @param value - Numeric value 0-100
 * @param unit - Optional unit suffix
 * @returns React component
 */
const ProgressBar = ({ label, value, unit = '%', }) => {
    const clampedValue = Math.min(Math.max(value, 0), 100);
    const color = getProgressColor(clampedValue);
    return (_jsxs("div", { style: { marginBottom: '12px' }, children: [_jsxs("div", { style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '4px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                }, children: [_jsx("span", { children: label }), _jsxs("span", { style: { color: '#6b7280' }, children: [clampedValue, unit] })] }), _jsx("div", { style: {
                    width: '100%',
                    height: '8px',
                    backgroundColor: '#e5e7eb',
                    borderRadius: '4px',
                    overflow: 'hidden',
                }, children: _jsx("div", { style: {
                        width: `${clampedValue}%`,
                        height: '100%',
                        backgroundColor: color,
                        transition: 'width 0.3s ease',
                    } }) })] }));
};
/**
 * StatusBadge component for displaying buyer status
 * @param status - The buyer status type
 * @returns React component
 */
const StatusBadge = ({ status }) => {
    const colors = STATUS_COLORS[status];
    const label = getStatusLabel(status);
    return (_jsx("span", { style: {
            display: 'inline-block',
            padding: '6px 12px',
            backgroundColor: colors.bg,
            color: colors.text,
            border: `1px solid ${colors.border}`,
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: '600',
            textTransform: 'capitalize',
        }, children: label }));
};
/**
 * ChangeHistory component for displaying status transitions
 * @param changes - Array of status changes
 * @returns React component
 */
const ChangeHistory = ({ changes }) => {
    if (!changes || changes.length === 0) {
        return (_jsx("div", { style: { color: '#9ca3af', fontSize: '14px', fontStyle: 'italic' }, children: "No status changes recorded" }));
    }
    return (_jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: '8px' }, children: changes.map((change, index) => (_jsxs("div", { style: {
                padding: '8px 12px',
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '4px',
                fontSize: '13px',
            }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }, children: [_jsx("span", { style: { fontWeight: '600', color: '#374151' }, children: change.field }), _jsx("span", { style: { color: '#9ca3af' }, children: "\u2192" }), _jsxs("span", { style: { color: '#6b7280' }, children: [change.from, " ", _jsx("strong", { children: "\u2192" }), " ", change.to] })] }), change.metadata?.dropoutReason && (_jsxs("div", { style: { color: '#dc2626', fontSize: '12px', marginTop: '4px' }, children: [_jsx("strong", { children: "Reason:" }), " ", change.metadata.dropoutReason] }))] }, index))) }));
};
/**
 * BuyerStatus Component
 *
 * Displays comprehensive buyer information including:
 * - Current status with color-coded badge
 * - Execution credibility and financial capacity metrics
 * - Due diligence dropout risk assessment
 * - Status change history with dropout reasons
 *
 * @param props - Component props
 * @returns React component
 */
const BuyerStatus = ({ buyer, changes = [], week }) => {
    const [expandHistory, setExpandHistory] = useState(false);
    // Memoize status changes filtered for this buyer
    const buyerChanges = useMemo(() => {
        return changes.filter((change) => change.field === 'status');
    }, [changes]);
    // Determine if buyer is dropped
    const isDropped = buyer.status === 'dropped';
    // Get dropout reason if available
    const dropoutReason = useMemo(() => {
        const droppedChange = buyerChanges.find((change) => change.to === 'dropped');
        return droppedChange?.metadata?.dropoutReason;
    }, [buyerChanges]);
    return (_jsxs("div", { style: {
            padding: '16px',
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }, children: [_jsxs("div", { style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '16px',
                    gap: '12px',
                    flexWrap: 'wrap',
                }, children: [_jsxs("div", { children: [_jsx("h3", { style: {
                                    margin: '0 0 8px 0',
                                    fontSize: '18px',
                                    fontWeight: '700',
                                    color: '#111827',
                                }, children: buyer.name }), _jsxs("p", { style: {
                                    margin: '0',
                                    fontSize: '12px',
                                    color: '#9ca3af',
                                }, children: ["ID: ", buyer.id, " \u2022 Week ", week] })] }), _jsx(StatusBadge, { status: buyer.status })] }), isDropped && dropoutReason && (_jsxs("div", { style: {
                    padding: '12px',
                    backgroundColor: '#fee2e2',
                    border: '1px solid #fca5a5',
                    borderRadius: '6px',
                    marginBottom: '16px',
                    fontSize: '13px',
                    color: '#991b1b',
                }, children: [_jsx("strong", { children: "Dropout Reason:" }), " ", dropoutReason] })), _jsxs("div", { style: {
                    marginBottom: '16px',
                    padding: '12px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '6px',
                }, children: [_jsx("h4", { style: {
                            margin: '0 0 12px 0',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#374151',
                        }, children: "Buyer Metrics" }), _jsx(ProgressBar, { label: "Execution Credibility", value: buyer.executionCredibility }), _jsx(ProgressBar, { label: "Financial Capacity", value: buyer.financialCapacity }), _jsx(ProgressBar, { label: "DD Dropout Risk", value: buyer.ddDropoutRisk })] }), _jsxs("div", { children: [_jsxs("button", { onClick: () => setExpandHistory(!expandHistory), style: {
                            width: '100%',
                            padding: '10px 12px',
                            backgroundColor: '#f3f4f6',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontWeight: '600',
                            color: '#374151',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            transition: 'background-color 0.2s',
                        }, onMouseEnter: (e) => {
                            e.currentTarget.style.backgroundColor = '#e5e7eb';
                        }, onMouseLeave: (e) => {
                            e.currentTarget.style.backgroundColor = '#f3f4f6';
                        }, children: [_jsxs("span", { children: ["Status Change History (", buyerChanges.length, ")"] }), _jsx("span", { style: { fontSize: '12px' }, children: expandHistory ? '▼' : '▶' })] }), expandHistory && (_jsx("div", { style: {
                            marginTop: '12px',
                            padding: '12px',
                            backgroundColor: '#f9fafb',
                            borderRadius: '6px',
                            border: '1px solid #e5e7eb',
                        }, children: _jsx(ChangeHistory, { changes: buyerChanges }) }))] }), _jsx("style", { children: `
        @media (max-width: 640px) {
          div[style*="display: flex"][style*="justifyContent: space-between"] {
            flex-direction: column;
          }
        }
      ` })] }));
};
export default BuyerStatus;
//# sourceMappingURL=BuyerStatus.js.map