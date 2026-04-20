import React, { useState, useMemo } from 'react';

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
 * Calculates the approval probability for a budget request
 * Formula: 0.5 + (trust/100)*0.3 - (risk/100)*0.2 + phaseFactor
 * 
 * @param clientTrust - Client trust level (0-100)
 * @param riskLevel - Risk level (0-100)
 * @param phase - Current phase (1-5)
 * @returns Approval probability as a decimal (0-1)
 */
const calculateApprovalProbability = (
  clientTrust: number,
  riskLevel: number,
  phase: number
): number => {
  // Clamp values to valid ranges
  const trust = Math.max(0, Math.min(100, clientTrust));
  const risk = Math.max(0, Math.min(100, riskLevel));
  
  // Calculate phase factor (increases with phase)
  const phaseFactor = (phase - 1) * 0.05; // 0, 0.05, 0.1, 0.15, 0.2 for phases 1-5
  
  // Apply formula
  const probability = 0.5 + (trust / 100) * 0.3 - (risk / 100) * 0.2 + phaseFactor;
  
  // Clamp result to 0-1 range
  return Math.max(0, Math.min(1, probability));
};

/**
 * Gets the CSS class for status badge styling
 * 
 * @param status - Request status
 * @returns CSS class string for styling
 */
const getStatusBadgeClass = (status: 'pending' | 'approved' | 'rejected'): string => {
  switch (status) {
    case 'approved':
      return 'badge-approved';
    case 'rejected':
      return 'badge-rejected';
    case 'pending':
    default:
      return 'badge-pending';
  }
};

/**
 * Gets the display text for a status
 * 
 * @param status - Request status
 * @returns Formatted status text
 */
const getStatusText = (status: 'pending' | 'approved' | 'rejected'): string => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

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
const BudgetRequest: React.FC<BudgetRequestProps> = ({
  requests,
  clientTrust,
  riskLevel,
  phase,
  onSubmit,
  onRetry,
}) => {
  // Form state
  const [amount, setAmount] = useState<string>('');
  const [justification, setJustification] = useState<string>('');
  const [validationError, setValidationError] = useState<string>('');
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  // Calculate approval probability
  const approvalProbability = useMemo(
    () => calculateApprovalProbability(clientTrust, riskLevel, phase),
    [clientTrust, riskLevel, phase]
  );

  // Calculate statistics
  const stats = useMemo(() => {
    const approved = requests.filter((r) => r.status === 'approved').length;
    const rejected = requests.filter((r) => r.status === 'rejected').length;
    const pending = requests.filter((r) => r.status === 'pending').length;
    const totalAmount = requests
      .filter((r) => r.status === 'approved')
      .reduce((sum, r) => sum + r.amount, 0);

    return { approved, rejected, pending, totalAmount };
  }, [requests]);

  /**
   * Validates the budget request form
   * 
   * @returns true if form is valid, false otherwise
   */
  const validateForm = (): boolean => {
    setValidationError('');

    const amountNum = parseFloat(amount);

    if (!amount || isNaN(amountNum)) {
      setValidationError('Amount must be a valid number');
      return false;
    }

    if (amountNum <= 0) {
      setValidationError('Amount must be greater than 0');
      return false;
    }

    if (!justification.trim()) {
      setValidationError('Justification cannot be empty');
      return false;
    }

    if (justification.trim().length < 10) {
      setValidationError('Justification must be at least 10 characters');
      return false;
    }

    return true;
  };

  /**
   * Handles form submission
   */
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const amountNum = parseFloat(amount);
    onSubmit(amountNum, justification.trim());

    // Reset form
    setAmount('');
    setJustification('');
    setSubmitSuccess(true);

    // Clear success message after 3 seconds
    setTimeout(() => setSubmitSuccess(false), 3000);
  };

  /**
   * Handles retry for rejected requests
   */
  const handleRetry = (requestId: string): void => {
    onRetry(requestId);
  };

  // Sort requests by week (newest first)
  const sortedRequests = [...requests].sort((a, b) => b.week - a.week);

  return (
    <div className="budget-request-container">
      <div className="budget-request-header">
        <h1>Budget Request Management</h1>
        <p className="subtitle">Submit and track budget requests for M&A initiatives</p>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-label">Approval Probability</div>
          <div className="metric-value">{(approvalProbability * 100).toFixed(1)}%</div>
          <div className="metric-formula">
            0.5 + (trust/100)×0.3 - (risk/100)×0.2 + phase×0.05
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Client Trust</div>
          <div className="metric-value">{clientTrust}%</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Risk Level</div>
          <div className="metric-value">{riskLevel}%</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Phase</div>
          <div className="metric-value">{phase}</div>
        </div>
      </div>

      {/* Statistics */}
      <div className="stats-section">
        <h2>Request Statistics</h2>
        <div className="stats-grid">
          <div className="stat-item approved">
            <span className="stat-label">Approved</span>
            <span className="stat-number">{stats.approved}</span>
          </div>
          <div className="stat-item pending">
            <span className="stat-label">Pending</span>
            <span className="stat-number">{stats.pending}</span>
          </div>
          <div className="stat-item rejected">
            <span className="stat-label">Rejected</span>
            <span className="stat-number">{stats.rejected}</span>
          </div>
          <div className="stat-item total">
            <span className="stat-label">Total Approved</span>
            <span className="stat-number">${stats.totalAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Submit Form */}
      <div className="form-section">
        <h2>Submit New Request</h2>
        <form onSubmit={handleSubmit} className="budget-form">
          <div className="form-group">
            <label htmlFor="amount">Budget Amount ($)</label>
            <input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="justification">Justification</label>
            <textarea
              id="justification"
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="Explain why this budget is needed (minimum 10 characters)"
              className="form-textarea"
              rows={4}
            />
          </div>

          {validationError && (
            <div className="error-message">{validationError}</div>
          )}

          {submitSuccess && (
            <div className="success-message">
              Budget request submitted successfully!
            </div>
          )}

          <button type="submit" className="submit-button">
            Submit Request
          </button>
        </form>
      </div>

      {/* Request History */}
      <div className="history-section">
        <h2>Request History</h2>
        {sortedRequests.length === 0 ? (
          <div className="empty-state">
            <p>No budget requests yet. Submit your first request above.</p>
          </div>
        ) : (
          <div className="requests-list">
            {sortedRequests.map((request) => (
              <div key={request.id} className="request-card">
                <div className="request-header">
                  <div className="request-info">
                    <span className="request-amount">
                      ${request.amount.toLocaleString()}
                    </span>
                    <span className={`status-badge ${getStatusBadgeClass(request.status)}`}>
                      {getStatusText(request.status)}
                    </span>
                    <span className="request-week">Week {request.week}</span>
                  </div>
                  {request.status === 'rejected' && (
                    <button
                      onClick={() => handleRetry(request.id)}
                      className="retry-button"
                    >
                      Retry
                    </button>
                  )}
                </div>

                <div className="request-justification">
                  <strong>Justification:</strong>
                  <p>{request.justification}</p>
                </div>

                {request.approvalReasoning && (
                  <div className="request-reasoning">
                    <strong>
                      {request.status === 'approved' ? 'Approval' : 'Rejection'} Reasoning:
                    </strong>
                    <p>{request.approvalReasoning}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .budget-request-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 24px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
            Ubuntu, Cantarell, sans-serif;
          background-color: #f9fafb;
          border-radius: 8px;
        }

        .budget-request-header {
          margin-bottom: 32px;
        }

        .budget-request-header h1 {
          margin: 0 0 8px 0;
          font-size: 28px;
          font-weight: 700;
          color: #1f2937;
        }

        .subtitle {
          margin: 0;
          font-size: 14px;
          color: #6b7280;
        }

        /* Metrics Grid */
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 32px;
        }

        .metric-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        .metric-label {
          font-size: 12px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }

        .metric-value {
          font-size: 24px;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 8px;
        }

        .metric-formula {
          font-size: 11px;
          color: #9ca3af;
          font-family: 'Courier New', monospace;
          line-height: 1.4;
        }

        /* Statistics Section */
        .stats-section {
          margin-bottom: 32px;
        }

        .stats-section h2 {
          margin: 0 0 16px 0;
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 12px;
        }

        .stat-item {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          padding: 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .stat-item.approved {
          border-left: 4px solid #10b981;
        }

        .stat-item.pending {
          border-left: 4px solid #f59e0b;
        }

        .stat-item.rejected {
          border-left: 4px solid #ef4444;
        }

        .stat-item.total {
          border-left: 4px solid #3b82f6;
        }

        .stat-label {
          font-size: 12px;
          font-weight: 600;
          color: #6b7280;
          margin-bottom: 4px;
        }

        .stat-number {
          font-size: 20px;
          font-weight: 700;
          color: #1f2937;
        }

        /* Form Section */
        .form-section {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 24px;
          margin-bottom: 32px;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        .form-section h2 {
          margin: 0 0 20px 0;
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
        }

        .budget-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-group label {
          font-size: 14px;
          font-weight: 600;
          color: #374151;
        }

        .form-input,
        .form-textarea {
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          font-family: inherit;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .form-input:focus,
        .form-textarea:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .form-textarea {
          resize: vertical;
          min-height: 100px;
        }

        .error-message {
          padding: 12px;
          background-color: #fee2e2;
          border: 1px solid #fecaca;
          border-radius: 6px;
          color: #991b1b;
          font-size: 14px;
          font-weight: 500;
        }

        .success-message {
          padding: 12px;
          background-color: #dcfce7;
          border: 1px solid #bbf7d0;
          border-radius: 6px;
          color: #166534;
          font-size: 14px;
          font-weight: 500;
        }

        .submit-button {
          padding: 12px 24px;
          background-color: #3b82f6;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s, box-shadow 0.2s;
          align-self: flex-start;
        }

        .submit-button:hover {
          background-color: #2563eb;
          box-shadow: 0 4px 6px rgba(37, 99, 235, 0.2);
        }

        .submit-button:active {
          background-color: #1d4ed8;
        }

        /* History Section */
        .history-section {
          margin-bottom: 24px;
        }

        .history-section h2 {
          margin: 0 0 16px 0;
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
        }

        .empty-state {
          background: white;
          border: 1px dashed #d1d5db;
          border-radius: 8px;
          padding: 32px;
          text-align: center;
          color: #6b7280;
        }

        .empty-state p {
          margin: 0;
          font-size: 14px;
        }

        .requests-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .request-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
          transition: box-shadow 0.2s;
        }

        .request-card:hover {
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .request-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .request-info {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .request-amount {
          font-size: 16px;
          font-weight: 700;
          color: #1f2937;
        }

        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .badge-approved {
          background-color: #d1fae5;
          color: #065f46;
        }

        .badge-pending {
          background-color: #fef3c7;
          color: #92400e;
        }

        .badge-rejected {
          background-color: #fee2e2;
          color: #991b1b;
        }

        .request-week {
          font-size: 12px;
          color: #6b7280;
          font-weight: 500;
        }

        .retry-button {
          padding: 6px 16px;
          background-color: #f59e0b;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .retry-button:hover {
          background-color: #d97706;
        }

        .request-justification {
          margin-bottom: 12px;
        }

        .request-justification strong {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 4px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .request-justification p {
          margin: 0;
          font-size: 14px;
          color: #4b5563;
          line-height: 1.5;
        }

        .request-reasoning {
          padding-top: 12px;
          border-top: 1px solid #e5e7eb;
        }

        .request-reasoning strong {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 4px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .request-reasoning p {
          margin: 0;
          font-size: 14px;
          color: #4b5563;
          line-height: 1.5;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .budget-request-container {
            padding: 16px;
          }

          .budget-request-header h1 {
            font-size: 24px;
          }

          .metrics-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .request-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .request-info {
            width: 100%;
          }

          .retry-button {
            align-self: flex-start;
          }
        }

        @media (max-width: 480px) {
          .metrics-grid {
            grid-template-columns: 1fr;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
};

export default BudgetRequest;
