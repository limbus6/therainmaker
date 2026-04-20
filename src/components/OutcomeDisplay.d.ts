import React from 'react';
/**
 * Props interface for the OutcomeDisplay component
 * Defines the structure of outcome data and component behavior
 */
interface OutcomeDisplayProps {
    outcomes: Array<{
        taskId: string;
        taskName: string;
        type: 'success' | 'failure';
        description: string;
        bonus: {
            clientTrust?: number;
            dealMomentum?: number;
            reputation?: number;
            morale?: number;
            riskLevel?: number;
        };
    }>;
    week: number;
    onDismiss: (taskId: string) => void;
}
/**
 * OutcomeDisplay Component
 *
 * Displays critical outcomes from M&A Rainmaker tasks with visual feedback,
 * resource impact tracking, and summary statistics.
 *
 * Features:
 * - Color-coded outcome cards (green for success, red for failure)
 * - Animated fade-in effect for each outcome
 * - Resource delta display with +/- signs
 * - Dismissible outcomes
 * - Summary statistics with net resource impact
 * - Responsive layout
 *
 * @component
 * @param {OutcomeDisplayProps} props - Component props
 * @param {Array} props.outcomes - Array of outcome objects
 * @param {number} props.week - Current week number
 * @param {Function} props.onDismiss - Callback when outcome is dismissed
 * @returns {React.ReactElement} The rendered component
 *
 * @example
 * const outcomes = [
 *   {
 *     taskId: 'task-1',
 *     taskName: 'Client Meeting',
 *     type: 'success',
 *     description: 'Successfully negotiated better terms',
 *     bonus: { clientTrust: 10, morale: 5 }
 *   }
 * ];
 *
 * <OutcomeDisplay
 *   outcomes={outcomes}
 *   week={1}
 *   onDismiss={(taskId) => console.log(`Dismissed ${taskId}`)}
 * />
 */
declare const OutcomeDisplay: React.FC<OutcomeDisplayProps>;
export default OutcomeDisplay;
//# sourceMappingURL=OutcomeDisplay.d.ts.map