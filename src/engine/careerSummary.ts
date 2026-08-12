import type { Tombstone } from '../store/careerStore';

export interface CareerRecord {
  tombstone: Tombstone;
  value: number;
}

export interface CareerSummary {
  totalMandates: number;
  closedDeals: number;
  failedDeals: number;
  closeRate: number;
  aggregateClosingValue: number;
  aggregateAdvisoryFees: number;
  bestClose: CareerRecord | null;
  bestProcess: CareerRecord | null;
  fastestClose: CareerRecord | null;
  bestFee: CareerRecord | null;
}

function maximumBy(
  tombstones: Tombstone[],
  value: (tombstone: Tombstone) => number,
): CareerRecord | null {
  return tombstones.reduce<CareerRecord | null>((best, tombstone) => {
    const next = { tombstone, value: value(tombstone) };
    return !best || next.value > best.value ? next : best;
  }, null);
}

export function buildCareerSummary(tombstones: Tombstone[]): CareerSummary {
  const closed = tombstones.filter((tombstone) => tombstone.outcome === 'closed');
  const totalMandates = tombstones.length;

  return {
    totalMandates,
    closedDeals: closed.length,
    failedDeals: totalMandates - closed.length,
    closeRate: totalMandates === 0 ? 0 : Math.round((closed.length / totalMandates) * 100),
    aggregateClosingValue: closed.reduce((total, tombstone) => total + tombstone.closingValue, 0),
    aggregateAdvisoryFees: tombstones.reduce((total, tombstone) => total + tombstone.totalAdvisoryFee, 0),
    bestClose: maximumBy(closed, (tombstone) => tombstone.closingValue),
    bestProcess: maximumBy(tombstones, (tombstone) => tombstone.processScore),
    fastestClose: closed.reduce<CareerRecord | null>((best, tombstone) => {
      const next = { tombstone, value: tombstone.daysTaken };
      return !best || next.value < best.value ? next : best;
    }, null),
    bestFee: maximumBy(closed, (tombstone) => tombstone.totalAdvisoryFee),
  };
}
