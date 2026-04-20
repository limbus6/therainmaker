import React from 'react';
/**
 * Props interface for BudgetRequest component
 * Defines the structure of budget request data and callback handlers
 */
interface BudgetRequestProps {
    requests: Array<{
        id: string;
        amount: number;
        justification: string;
        status: 'pending' | 'approved' | 'rejected';
        approvalReasoning?: string;
        week: number;
    }>;
    clientTrust: number;
    riskLevel: number;
    phase: number;
    onSubmit: (amount: number, justification: string) => void;
    onRetry: (requestId: string) => void;
}
/**
 * BudgetRequest Component
 *
 * A comprehensive React component for submitting and tracking budget requests in M&A Rainmaker.
 * Features include:
 * - Submit new budget requests with justification
 * - View historical requests with status tracking
 * - Calculate and display approval probability
 * - Retry rejected requests
 * - Input validation
 *
 * @component
 * @param props - Component props
 * @returns React component for budget request management
 */
declare const BudgetRequest: React.FC<BudgetRequestProps>;
export default BudgetRequest;
//# sourceMappingURL=BudgetRequest.d.ts.map