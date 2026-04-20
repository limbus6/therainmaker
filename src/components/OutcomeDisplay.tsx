import React, { useState, useMemo } from 'react';

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
 * Interface for resource delta calculations
 * Tracks individual resource changes
 */
interface ResourceDelta {
  clientTrust: number;
  dealMomentum: number;
  reputation: number;
  morale: number;
  riskLevel: number;
}

/**
 * Interface for summary statistics
 * Tracks outcome counts and totals
 */
interface SummaryStats {
  successCount: number;
  failureCount: number;
  totalOutcomes: number;
  netResourceImpact: ResourceDelta;
}

/**
 * Calculates the net resource impact across all outcomes
 * @param outcomes - Array of outcome objects
 * @returns ResourceDelta object with aggregated values
 */
const calculateNetResourceImpact = (
  outcomes: OutcomeDisplayProps['outcomes']
): ResourceDelta => {
  const initial: ResourceDelta = {
    clientTrust: 0,
    dealMomentum: 0,
    reputation: 0,
    morale: 0,
    riskLevel: 0,
  };

  return outcomes.reduce((acc, outcome) => {
    return {
      clientTrust: acc.clientTrust + (outcome.bonus.clientTrust || 0),
      dealMomentum: acc.dealMomentum + (outcome.bonus.dealMomentum || 0),
      reputation: acc.reputation + (outcome.bonus.reputation || 0),
      morale: acc.morale + (outcome.bonus.morale || 0),
      riskLevel: acc.riskLevel + (outcome.bonus.riskLevel || 0),
    };
  }, initial);
};

/**
 * Calculates summary statistics for all outcomes
 * @param outcomes - Array of outcome objects
 * @returns SummaryStats object with counts and net impact
 */
const calculateSummaryStats = (
  outcomes: OutcomeDisplayProps['outcomes']
): SummaryStats => {
  const successCount = outcomes.filter((o) => o.type === 'success').length;
  const failureCount = outcomes.filter((o) => o.type === 'failure').length;
  const netResourceImpact = calculateNetResourceImpact(outcomes);

  return {
    successCount,
    failureCount,
    totalOutcomes: outcomes.length,
    netResourceImpact,
  };
};

/**
 * Gets the CSS class for outcome type styling
 * @param type - The outcome type ('success' or 'failure')
 * @returns CSS class string for styling
 */
const getOutcomeTypeClass = (type: 'success' | 'failure'): string => {
  return type === 'success'
    ? 'outcome-card--success'
    : 'outcome-card--failure';
};

/**
 * Gets the header background color class for outcome type
 * @param type - The outcome type ('success' or 'failure')
 * @returns CSS class string for header background
 */
const getOutcomeTypeHeaderClass = (type: 'success' | 'failure'): string => {
  return type === 'success'
    ? 'bg-green-100'
    : 'bg-red-100';
};

/**
 * Gets the text color class for outcome type
 * @param type - The outcome type ('success' or 'failure')
 * @returns CSS class string for text color
 */
const getOutcomeTypeTextClass = (type: 'success' | 'failure'): string => {
  return type === 'success'
    ? 'text-green-700'
    : 'text-red-700';
};

/**
 * Gets the badge text for outcome type
 * @param type - The outcome type ('success' or 'failure')
 * @returns Badge text string
 */
const getOutcomeTypeBadge = (type: 'success' | 'failure'): string => {
  return type === 'success' ? 'SUCCESS' : 'FAILURE';
};

/**
 * Renders a single resource delta item
 * @param value - The numeric value
 * @param label - The resource label
 * @returns JSX element or null if value is 0
 */
const ResourceDeltaItem: React.FC<{
  value: number;
  label: string;
}> = ({ value, label }) => {
  if (value === 0) return null;

  const sign = value > 0 ? '+' : '';
  const textColor = value > 0 ? 'text-green-600' : 'text-red-600';

  return (
    <span className={`text-sm font-medium ${textColor}`}>
      {sign}{value} {label}
    </span>
  );
};

/**
 * Renders the resource deltas for a single outcome
 * @param bonus - The bonus object containing resource changes
 * @returns JSX element with formatted resource deltas
 */
const OutcomeResourceDeltas: React.FC<{
  bonus: OutcomeDisplayProps['outcomes'][0]['bonus'];
}> = ({ bonus }) => {
  const deltas = [
    { value: bonus.clientTrust || 0, label: 'Client Trust' },
    { value: bonus.dealMomentum || 0, label: 'Deal Momentum' },
    { value: bonus.reputation || 0, label: 'Reputation' },
    { value: bonus.morale || 0, label: 'Morale' },
    { value: bonus.riskLevel || 0, label: 'Risk Level' },
  ];

  const hasAnyDelta = deltas.some((d) => d.value !== 0);

  if (!hasAnyDelta) {
    return <p className="text-sm text-gray-500">No resource changes</p>;
  }

  return (
    <div className="flex flex-wrap gap-3">
      {deltas.map((delta) =>
        delta.value !== 0 ? (
          <ResourceDeltaItem
            key={delta.label}
            value={delta.value}
            label={delta.label}
          />
        ) : null
      )}
    </div>
  );
};

/**
 * Renders a single outcome card
 * @param outcome - The outcome object
 * @param index - The index for animation delay
 * @param onDismiss - Callback function when dismiss button is clicked
 * @returns JSX element for the outcome card
 */
const OutcomeCard: React.FC<{
  outcome: OutcomeDisplayProps['outcomes'][0];
  index: number;
  onDismiss: (taskId: string) => void;
}> = ({ outcome, index, onDismiss }) => {
  const animationDelay = `${index * 100}ms`;

  return (
    <div
      className={`outcome-card ${getOutcomeTypeClass(outcome.type)} animate-fade-in`}
      style={{ animationDelay }}
    >
      <div
        className={`outcome-card__header ${getOutcomeTypeHeaderClass(outcome.type)}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span
              className={`outcome-card__badge ${getOutcomeTypeTextClass(outcome.type)}`}
            >
              {getOutcomeTypeBadge(outcome.type)}
            </span>
            <h3 className={`outcome-card__title ${getOutcomeTypeTextClass(outcome.type)}`}>
              {outcome.taskName}
            </h3>
          </div>
          <button
            className="outcome-card__dismiss"
            onClick={() => onDismiss(outcome.taskId)}
            aria-label={`Dismiss ${outcome.taskName}`}
            title="Dismiss outcome"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="outcome-card__body">
        <p className="outcome-card__description">{outcome.description}</p>

        <div className="outcome-card__resources">
          <h4 className="outcome-card__resources-label">Resource Impact:</h4>
          <OutcomeResourceDeltas bonus={outcome.bonus} />
        </div>
      </div>
    </div>
  );
};

/**
 * Renders the summary statistics section
 * @param stats - The summary statistics object
 * @returns JSX element with summary information
 */
const SummarySection: React.FC<{ stats: SummaryStats }> = ({ stats }) => {
  const hasOutcomes = stats.totalOutcomes > 0;

  if (!hasOutcomes) {
    return null;
  }

  const netDeltas = [
    { value: stats.netResourceImpact.clientTrust, label: 'Client Trust' },
    { value: stats.netResourceImpact.dealMomentum, label: 'Deal Momentum' },
    { value: stats.netResourceImpact.reputation, label: 'Reputation' },
    { value: stats.netResourceImpact.morale, label: 'Morale' },
    { value: stats.netResourceImpact.riskLevel, label: 'Risk Level' },
  ];

  const hasNetImpact = netDeltas.some((d) => d.value !== 0);

  return (
    <div className="summary-section">
      <div className="summary-section__header">
        <h2 className="summary-section__title">Week {stats.totalOutcomes > 0 ? 'Summary' : 'No Outcomes'}</h2>
      </div>

      <div className="summary-section__stats">
        <div className="summary-stat">
          <span className="summary-stat__label">Total Outcomes:</span>
          <span className="summary-stat__value">{stats.totalOutcomes}</span>
        </div>

        <div className="summary-stat summary-stat--success">
          <span className="summary-stat__label">Successes:</span>
          <span className="summary-stat__value">{stats.successCount}</span>
        </div>

        <div className="summary-stat summary-stat--failure">
          <span className="summary-stat__label">Failures:</span>
          <span className="summary-stat__value">{stats.failureCount}</span>
        </div>
      </div>

      {hasNetImpact && (
        <div className="summary-section__net-impact">
          <h3 className="summary-section__net-impact-title">Net Resource Impact:</h3>
          <div className="flex flex-wrap gap-4">
            {netDeltas.map((delta) =>
              delta.value !== 0 ? (
                <ResourceDeltaItem
                  key={delta.label}
                  value={delta.value}
                  label={delta.label}
                />
              ) : null
            )}
          </div>
        </div>
      )}
    </div>
  );
};

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
const OutcomeDisplay: React.FC<OutcomeDisplayProps> = ({
  outcomes,
  onDismiss,
}) => {
  const [dismissedOutcomes, setDismissedOutcomes] = useState<Set<string>>(
    new Set()
  );

  /**
   * Handles outcome dismissal
   * @param taskId - The ID of the task to dismiss
   */
  const handleDismiss = (taskId: string) => {
    setDismissedOutcomes((prev) => new Set(prev).add(taskId));
    onDismiss(taskId);
  };

  // Filter out dismissed outcomes
  const visibleOutcomes = useMemo(
    () => outcomes.filter((o) => !dismissedOutcomes.has(o.taskId)),
    [outcomes, dismissedOutcomes]
  );

  // Calculate summary statistics
  const stats = useMemo(
    () => calculateSummaryStats(visibleOutcomes),
    [visibleOutcomes]
  );

  return (
    <div className="outcome-display">
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
          opacity: 0;
        }

        .outcome-display {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 1.5rem;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
            'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
            sans-serif;
        }

        .outcome-cards-container {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .outcome-card {
          border-radius: 0.5rem;
          border: 2px solid;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }

        .outcome-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transform: translateY(-2px);
        }

        .outcome-card--success {
          border-color: #10b981;
          background-color: #f0fdf4;
        }

        .outcome-card--failure {
          border-color: #ef4444;
          background-color: #fef2f2;
        }

        .outcome-card__header {
          padding: 1rem;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        }

        .outcome-card__header.bg-green-100 {
          background-color: #dcfce7;
        }

        .outcome-card__header.bg-red-100 {
          background-color: #fee2e2;
        }

        .outcome-card__badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.05em;
        }

        .outcome-card__title {
          font-size: 1.125rem;
          font-weight: 600;
          margin: 0;
        }

        .outcome-card__dismiss {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0.25rem 0.5rem;
          color: inherit;
          opacity: 0.6;
          transition: opacity 0.2s ease;
          line-height: 1;
        }

        .outcome-card__dismiss:hover {
          opacity: 1;
        }

        .outcome-card__body {
          padding: 1rem;
        }

        .outcome-card__description {
          margin: 0 0 1rem 0;
          font-size: 0.95rem;
          line-height: 1.5;
          color: #374151;
        }

        .outcome-card__resources {
          margin-top: 1rem;
        }

        .outcome-card__resources-label {
          margin: 0 0 0.5rem 0;
          font-size: 0.875rem;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .summary-section {
          background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
          border-radius: 0.5rem;
          padding: 1.5rem;
          border: 1px solid #d1d5db;
        }

        .summary-section__header {
          margin-bottom: 1.5rem;
        }

        .summary-section__title {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
        }

        .summary-section__stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .summary-stat {
          background: white;
          padding: 1rem;
          border-radius: 0.375rem;
          border-left: 4px solid #9ca3af;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .summary-stat--success {
          border-left-color: #10b981;
        }

        .summary-stat--failure {
          border-left-color: #ef4444;
        }

        .summary-stat__label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .summary-stat__value {
          font-size: 1.875rem;
          font-weight: 700;
          color: #1f2937;
        }

        .summary-section__net-impact {
          background: white;
          padding: 1rem;
          border-radius: 0.375rem;
          border: 1px solid #e5e7eb;
        }

        .summary-section__net-impact-title {
          margin: 0 0 1rem 0;
          font-size: 0.95rem;
          font-weight: 600;
          color: #374151;
        }

        .empty-state {
          text-align: center;
          padding: 3rem 1.5rem;
          color: #6b7280;
        }

        .empty-state__icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .empty-state__text {
          font-size: 1.125rem;
          margin: 0;
        }

        @media (max-width: 768px) {
          .outcome-display {
            padding: 1rem;
          }

          .outcome-cards-container {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .summary-section__stats {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {visibleOutcomes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">📋</div>
          <p className="empty-state__text">
            {outcomes.length === 0
              ? 'No outcomes to display'
              : 'All outcomes dismissed'}
          </p>
        </div>
      ) : (
        <>
          <div className="outcome-cards-container">
            {visibleOutcomes.map((outcome, index) => (
              <OutcomeCard
                key={outcome.taskId}
                outcome={outcome}
                index={index}
                onDismiss={handleDismiss}
              />
            ))}
          </div>

          <SummarySection stats={stats} />
        </>
      )}
    </div>
  );
};

export default OutcomeDisplay;
