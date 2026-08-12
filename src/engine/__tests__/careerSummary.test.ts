import { describe, expect, it } from 'vitest';
import { buildCareerSummary } from '../careerSummary';
import type { Tombstone } from '../../store/careerStore';

function tombstone(runKey: string, overrides: Partial<Tombstone> = {}): Tombstone {
  return {
    runKey,
    mandateId: 'solara-flagship',
    mandateLabel: 'Solara Systems — The Flagship',
    companyName: 'Solara Systems',
    buyerName: 'Vektor Industries',
    closingValue: 100,
    impliedMultiple: 8.3,
    totalAdvisoryFee: 2_000,
    grade: 'Strong Outcome',
    processScore: 70,
    outcome: 'closed',
    archetype: 'technician',
    daysTaken: 200,
    completedAt: '2026-08-12T00:00:00.000Z',
    ...overrides,
  };
}

describe('career summary', () => {
  it('returns an honest empty summary', () => {
    expect(buildCareerSummary([])).toEqual({
      totalMandates: 0,
      closedDeals: 0,
      failedDeals: 0,
      closeRate: 0,
      aggregateClosingValue: 0,
      aggregateAdvisoryFees: 0,
      bestClose: null,
      bestProcess: null,
      fastestClose: null,
      bestFee: null,
    });
  });

  it('calculates totals and explains each record with its source mandate', () => {
    const collapse = tombstone('collapse', {
      outcome: 'collapsed',
      buyerName: null,
      closingValue: 0,
      impliedMultiple: null,
      totalAdvisoryFee: 50,
      processScore: 92,
      daysTaken: 140,
    });
    const largest = tombstone('largest', { closingValue: 180, totalAdvisoryFee: 3_600, daysTaken: 220 });
    const fastest = tombstone('fastest', { closingValue: 120, totalAdvisoryFee: 4_200, daysTaken: 110 });

    const summary = buildCareerSummary([collapse, largest, fastest]);

    expect(summary.totalMandates).toBe(3);
    expect(summary.closedDeals).toBe(2);
    expect(summary.failedDeals).toBe(1);
    expect(summary.closeRate).toBe(67);
    expect(summary.aggregateClosingValue).toBe(300);
    expect(summary.aggregateAdvisoryFees).toBe(7_850);
    expect(summary.bestClose?.tombstone.runKey).toBe('largest');
    expect(summary.bestProcess?.tombstone.runKey).toBe('collapse');
    expect(summary.fastestClose?.tombstone.runKey).toBe('fastest');
    expect(summary.bestFee?.tombstone.runKey).toBe('fastest');
  });
});
