import React, { useState, useMemo } from 'react';

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
  metadata?: { dropoutReason?: string };
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
 * Color configuration for different buyer statuses
 */
const STATUS_COLORS: Record<BuyerStatusType, { bg: string; text: string; border: string }> = {
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
const getStatusLabel = (status: BuyerStatusType): string => {
  const labels: Record<BuyerStatusType, string> = {
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
const getProgressColor = (value: number): string => {
  if (value >= 75) return '#10b981';
  if (value >= 50) return '#f59e0b';
  if (value >= 25) return '#ef4444';
  return '#6b7280';
};

/**
 * ProgressBar component for displaying metrics
 * @param label - Label for the progress bar
 * @param value - Numeric value 0-100
 * @param unit - Optional unit suffix
 * @returns React component
 */
const ProgressBar: React.FC<{ label: string; value: number; unit?: string }> = ({
  label,
  value,
  unit = '%',
}) => {
  const clampedValue = Math.min(Math.max(value, 0), 100);
  const color = getProgressColor(clampedValue);

  return (
    <div style={{ marginBottom: '12px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '4px',
          fontSize: '14px',
          fontWeight: '500',
          color: '#374151',
        }}
      >
        <span>{label}</span>
        <span style={{ color: '#6b7280' }}>
          {clampedValue}
          {unit}
        </span>
      </div>
      <div
        style={{
          width: '100%',
          height: '8px',
          backgroundColor: '#e5e7eb',
          borderRadius: '4px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${clampedValue}%`,
            height: '100%',
            backgroundColor: color,
            transition: 'width 0.3s ease',
          }}
        />
      </div>
    </div>
  );
};

/**
 * StatusBadge component for displaying buyer status
 * @param status - The buyer status type
 * @returns React component
 */
const StatusBadge: React.FC<{ status: BuyerStatusType }> = ({ status }) => {
  const colors = STATUS_COLORS[status];
  const label = getStatusLabel(status);

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '6px 12px',
        backgroundColor: colors.bg,
        color: colors.text,
        border: `1px solid ${colors.border}`,
        borderRadius: '6px',
        fontSize: '13px',
        fontWeight: '600',
        textTransform: 'capitalize',
      }}
    >
      {label}
    </span>
  );
};

/**
 * ChangeHistory component for displaying status transitions
 * @param changes - Array of status changes
 * @returns React component
 */
const ChangeHistory: React.FC<{ changes: StatusChange[] }> = ({ changes }) => {
  if (!changes || changes.length === 0) {
    return (
      <div style={{ color: '#9ca3af', fontSize: '14px', fontStyle: 'italic' }}>
        No status changes recorded
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {changes.map((change, index) => (
        <div
          key={index}
          style={{
            padding: '8px 12px',
            backgroundColor: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '4px',
            fontSize: '13px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontWeight: '600', color: '#374151' }}>{change.field}</span>
            <span style={{ color: '#9ca3af' }}>→</span>
            <span style={{ color: '#6b7280' }}>
              {change.from} <strong>→</strong> {change.to}
            </span>
          </div>
          {change.metadata?.dropoutReason && (
            <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>
              <strong>Reason:</strong> {change.metadata.dropoutReason}
            </div>
          )}
        </div>
      ))}
    </div>
  );
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
const BuyerStatus: React.FC<BuyerStatusProps> = ({ buyer, changes = [], week }) => {
  const [expandHistory, setExpandHistory] = useState<boolean>(false);

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

  return (
    <div
      style={{
        padding: '16px',
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Header Section */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '16px',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h3
            style={{
              margin: '0 0 8px 0',
              fontSize: '18px',
              fontWeight: '700',
              color: '#111827',
            }}
          >
            {buyer.name}
          </h3>
          <p
            style={{
              margin: '0',
              fontSize: '12px',
              color: '#9ca3af',
            }}
          >
            ID: {buyer.id} • Week {week}
          </p>
        </div>
        <StatusBadge status={buyer.status} />
      </div>

      {/* Dropout Reason Alert */}
      {isDropped && dropoutReason && (
        <div
          style={{
            padding: '12px',
            backgroundColor: '#fee2e2',
            border: '1px solid #fca5a5',
            borderRadius: '6px',
            marginBottom: '16px',
            fontSize: '13px',
            color: '#991b1b',
          }}
        >
          <strong>Dropout Reason:</strong> {dropoutReason}
        </div>
      )}

      {/* Metrics Section */}
      <div
        style={{
          marginBottom: '16px',
          padding: '12px',
          backgroundColor: '#f9fafb',
          borderRadius: '6px',
        }}
      >
        <h4
          style={{
            margin: '0 0 12px 0',
            fontSize: '14px',
            fontWeight: '600',
            color: '#374151',
          }}
        >
          Buyer Metrics
        </h4>
        <ProgressBar label="Execution Credibility" value={buyer.executionCredibility} />
        <ProgressBar label="Financial Capacity" value={buyer.financialCapacity} />
        <ProgressBar label="DD Dropout Risk" value={buyer.ddDropoutRisk} />
      </div>

      {/* Change History Section */}
      <div>
        <button
          onClick={() => setExpandHistory(!expandHistory)}
          style={{
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
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#e5e7eb';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#f3f4f6';
          }}
        >
          <span>Status Change History ({buyerChanges.length})</span>
          <span style={{ fontSize: '12px' }}>{expandHistory ? '▼' : '▶'}</span>
        </button>

        {expandHistory && (
          <div
            style={{
              marginTop: '12px',
              padding: '12px',
              backgroundColor: '#f9fafb',
              borderRadius: '6px',
              border: '1px solid #e5e7eb',
            }}
          >
            <ChangeHistory changes={buyerChanges} />
          </div>
        )}
      </div>

      {/* Responsive Styles */}
      <style>{`
        @media (max-width: 640px) {
          div[style*="display: flex"][style*="justifyContent: space-between"] {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default BuyerStatus;
