export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function formatNumber(value: number, maxDecimals: number = 2): string {
  if (!Number.isFinite(value)) return '0';
  const rounded = round2(value);
  return rounded.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDecimals,
  });
}

