import { jsxs as _jsxs, jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useMemo } from 'react';
/**
 * Calculates the net resource impact across all outcomes
 * @param outcomes - Array of outcome objects
 * @returns ResourceDelta object with aggregated values
 */
const calculateNetResourceImpact = (outcomes) => {
    const initial = {
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
const calculateSummaryStats = (outcomes) => {
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
const getOutcomeTypeClass = (type) => {
    return type === 'success'
        ? 'outcome-card--success'
        : 'outcome-card--failure';
};
/**
 * Gets the header background color class for outcome type
 * @param type - The outcome type ('success' or 'failure')
 * @returns CSS class string for header background
 */
const getOutcomeTypeHeaderClass = (type) => {
    return type === 'success'
        ? 'bg-green-100'
        : 'bg-red-100';
};
/**
 * Gets the text color class for outcome type
 * @param type - The outcome type ('success' or 'failure')
 * @returns CSS class string for text color
 */
const getOutcomeTypeTextClass = (type) => {
    return type === 'success'
        ? 'text-green-700'
        : 'text-red-700';
};
/**
 * Gets the badge text for outcome type
 * @param type - The outcome type ('success' or 'failure')
 * @returns Badge text string
 */
const getOutcomeTypeBadge = (type) => {
    return type === 'success' ? 'SUCCESS' : 'FAILURE';
};
/**
 * Renders a single resource delta item
 * @param value - The numeric value
 * @param label - The resource label
 * @returns JSX element or null if value is 0
 */
const ResourceDeltaItem = ({ value, label }) => {
    if (value === 0)
        return null;
    const sign = value > 0 ? '+' : '';
    const textColor = value > 0 ? 'text-green-600' : 'text-red-600';
    return (_jsxs("span", { className: `text-sm font-medium ${textColor}`, children: [sign, value, " ", label] }));
};
/**
 * Renders the resource deltas for a single outcome
 * @param bonus - The bonus object containing resource changes
 * @returns JSX element with formatted resource deltas
 */
const OutcomeResourceDeltas = ({ bonus }) => {
    const deltas = [
        { value: bonus.clientTrust || 0, label: 'Client Trust' },
        { value: bonus.dealMomentum || 0, label: 'Deal Momentum' },
        { value: bonus.reputation || 0, label: 'Reputation' },
        { value: bonus.morale || 0, label: 'Morale' },
        { value: bonus.riskLevel || 0, label: 'Risk Level' },
    ];
    const hasAnyDelta = deltas.some((d) => d.value !== 0);
    if (!hasAnyDelta) {
        return _jsx("p", { className: "text-sm text-gray-500", children: "No resource changes" });
    }
    return (_jsx("div", { className: "flex flex-wrap gap-3", children: deltas.map((delta) => delta.value !== 0 ? (_jsx(ResourceDeltaItem, { value: delta.value, label: delta.label }, delta.label)) : null) }));
};
/**
 * Renders a single outcome card
 * @param outcome - The outcome object
 * @param index - The index for animation delay
 * @param onDismiss - Callback function when dismiss button is clicked
 * @returns JSX element for the outcome card
 */
const OutcomeCard = ({ outcome, index, onDismiss }) => {
    const animationDelay = `${index * 100}ms`;
    return (_jsxs("div", { className: `outcome-card ${getOutcomeTypeClass(outcome.type)} animate-fade-in`, style: { animationDelay }, children: [_jsx("div", { className: `outcome-card__header ${getOutcomeTypeHeaderClass(outcome.type)}`, children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: `outcome-card__badge ${getOutcomeTypeTextClass(outcome.type)}`, children: getOutcomeTypeBadge(outcome.type) }), _jsx("h3", { className: `outcome-card__title ${getOutcomeTypeTextClass(outcome.type)}`, children: outcome.taskName })] }), _jsx("button", { className: "outcome-card__dismiss", onClick: () => onDismiss(outcome.taskId), "aria-label": `Dismiss ${outcome.taskName}`, title: "Dismiss outcome", children: "\u2715" })] }) }), _jsxs("div", { className: "outcome-card__body", children: [_jsx("p", { className: "outcome-card__description", children: outcome.description }), _jsxs("div", { className: "outcome-card__resources", children: [_jsx("h4", { className: "outcome-card__resources-label", children: "Resource Impact:" }), _jsx(OutcomeResourceDeltas, { bonus: outcome.bonus })] })] })] }));
};
/**
 * Renders the summary statistics section
 * @param stats - The summary statistics object
 * @returns JSX element with summary information
 */
const SummarySection = ({ stats }) => {
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
    return (_jsxs("div", { className: "summary-section", children: [_jsx("div", { className: "summary-section__header", children: _jsxs("h2", { className: "summary-section__title", children: ["Week ", stats.totalOutcomes > 0 ? 'Summary' : 'No Outcomes'] }) }), _jsxs("div", { className: "summary-section__stats", children: [_jsxs("div", { className: "summary-stat", children: [_jsx("span", { className: "summary-stat__label", children: "Total Outcomes:" }), _jsx("span", { className: "summary-stat__value", children: stats.totalOutcomes })] }), _jsxs("div", { className: "summary-stat summary-stat--success", children: [_jsx("span", { className: "summary-stat__label", children: "Successes:" }), _jsx("span", { className: "summary-stat__value", children: stats.successCount })] }), _jsxs("div", { className: "summary-stat summary-stat--failure", children: [_jsx("span", { className: "summary-stat__label", children: "Failures:" }), _jsx("span", { className: "summary-stat__value", children: stats.failureCount })] })] }), hasNetImpact && (_jsxs("div", { className: "summary-section__net-impact", children: [_jsx("h3", { className: "summary-section__net-impact-title", children: "Net Resource Impact:" }), _jsx("div", { className: "flex flex-wrap gap-4", children: netDeltas.map((delta) => delta.value !== 0 ? (_jsx(ResourceDeltaItem, { value: delta.value, label: delta.label }, delta.label)) : null) })] }))] }));
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
const OutcomeDisplay = ({ outcomes, onDismiss, }) => {
    const [dismissedOutcomes, setDismissedOutcomes] = useState(new Set());
    /**
     * Handles outcome dismissal
     * @param taskId - The ID of the task to dismiss
     */
    const handleDismiss = (taskId) => {
        setDismissedOutcomes((prev) => new Set(prev).add(taskId));
        onDismiss(taskId);
    };
    // Filter out dismissed outcomes
    const visibleOutcomes = useMemo(() => outcomes.filter((o) => !dismissedOutcomes.has(o.taskId)), [outcomes, dismissedOutcomes]);
    // Calculate summary statistics
    const stats = useMemo(() => calculateSummaryStats(visibleOutcomes), [visibleOutcomes]);
    return (_jsxs("div", { className: "outcome-display", children: [_jsx("style", { children: `
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
      ` }), visibleOutcomes.length === 0 ? (_jsxs("div", { className: "empty-state", children: [_jsx("div", { className: "empty-state__icon", children: "\uD83D\uDCCB" }), _jsx("p", { className: "empty-state__text", children: outcomes.length === 0
                            ? 'No outcomes to display'
                            : 'All outcomes dismissed' })] })) : (_jsxs(_Fragment, { children: [_jsx("div", { className: "outcome-cards-container", children: visibleOutcomes.map((outcome, index) => (_jsx(OutcomeCard, { outcome: outcome, index: index, onDismiss: handleDismiss }, outcome.taskId))) }), _jsx(SummarySection, { stats: stats })] }))] }));
};
export default OutcomeDisplay;
//# sourceMappingURL=OutcomeDisplay.js.map