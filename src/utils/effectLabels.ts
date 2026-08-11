/** Remove exact promises for the derived momentum view from legacy task copy. */
export function formatTaskEffectSummary(summary: string): string {
  return summary.replace(
    /([+-])\d+\s+(?:deal\s+)?momentum/gi,
    (_match, direction: '+' | '-') => direction === '+' ? 'advances live process' : 'may slow live process',
  );
}
