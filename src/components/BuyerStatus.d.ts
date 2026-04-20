import React from 'react';
/**
 * Status type for buyer lifecycle
 */
type BuyerStatusType = 'prospect' | 'qualified' | 'bidding' | 'preferred' | 'dropped';
/**
 * Change history entry for buyer status transitions
 */
interface StatusChange {
    field: string;
    from: string;
    to: string;
    metadata?: {
        dropoutReason?: string;
    };
}
/**
 * Buyer data structure
 */
interface Buyer {
    id: string;
    name: string;
    status: BuyerStatusType;
    executionCredibility: number;
    ddDropoutRisk: number;
    financialCapacity: number;
}
/**
 * Props for BuyerStatus component
 */
interface BuyerStatusProps {
    buyer: Buyer;
    changes?: StatusChange[];
    week: number;
}
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
declare const BuyerStatus: React.FC<BuyerStatusProps>;
export default BuyerStatus;
//# sourceMappingURL=BuyerStatus.d.ts.map