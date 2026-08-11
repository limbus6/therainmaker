import { useEffect, useRef, useState } from 'react';
import { formatNumber } from '../../utils/numberFormat';
import { animateCounter, prefersReducedMotion } from '../../utils/motion';

interface KpiTileProps {
  label: string;
  value: string | number;
  /** Rendered before/after numeric values, e.g. "€" / "k". Only used when value is a number. */
  prefix?: string;
  suffix?: string;
  trend?: 'up' | 'down' | 'stable';
  color?: 'default' | 'success' | 'warning' | 'danger' | 'accent';
  onClick?: () => void;
  /** Attributable change from the last advance; shows a floating chip. */
  delta?: number;
  deltaReason?: string;
  /** Changes to this key retrigger the delta chip (e.g. current game day). */
  deltaKey?: string | number;
  /** When true, positive deltas are bad (e.g. risk level). */
  invertDelta?: boolean;
  /** Plain-language explanation for values that are derived from several inputs. */
  explanation?: string;
}

const colorMap = {
  default: 'text-text-primary',
  success: 'text-state-success',
  warning: 'text-state-warning',
  danger: 'text-state-danger',
  accent: 'text-text-accent',
};

const trendSymbol = {
  up: '▲',
  down: '▼',
  stable: '—',
};

const trendColor = {
  up: 'text-state-success',
  down: 'text-state-danger',
  stable: 'text-text-muted',
};

export default function KpiTile({
  label, value, prefix = '', suffix = '', trend, color = 'default', onClick,
  delta, deltaReason, deltaKey, invertDelta = false, explanation,
}: KpiTileProps) {
  const [flash, setFlash] = useState(false);
  const [chipVisible, setChipVisible] = useState(false);
  const valueRef = useRef<HTMLSpanElement>(null);
  const prevValueRef = useRef(value);
  const prevDeltaKeyRef = useRef(deltaKey);

  // Animate numeric value changes old → new; flash for string changes.
  useEffect(() => {
    const prev = prevValueRef.current;
    if (value === prev) return;
    prevValueRef.current = value;

    if (typeof value === 'number' && typeof prev === 'number' && !prefersReducedMotion()) {
      animateCounter(valueRef.current, prev, value, 0.7, prefix, suffix);
    } else if (valueRef.current) {
      valueRef.current.textContent = typeof value === 'number' ? `${prefix}${formatNumber(value)}${suffix}` : String(value);
    }
    const onTimer = setTimeout(() => setFlash(true), 0);
    const offTimer = setTimeout(() => setFlash(false), 600);
    return () => { clearTimeout(onTimer); clearTimeout(offTimer); };
  }, [value, prefix, suffix]);

  // Show the delta chip whenever a new advance produced a change.
  useEffect(() => {
    if (deltaKey === prevDeltaKeyRef.current) return;
    prevDeltaKeyRef.current = deltaKey;
    if (!delta) return;
    const onTimer = setTimeout(() => setChipVisible(true), 0);
    const offTimer = setTimeout(() => setChipVisible(false), 2400);
    return () => { clearTimeout(onTimer); clearTimeout(offTimer); };
  }, [deltaKey, delta]);

  const renderedValue = typeof value === 'number' ? `${prefix}${formatNumber(value)}${suffix}` : value;
  const deltaIsGood = delta !== undefined && (invertDelta ? delta < 0 : delta > 0);

  return (
    <div
      className={`relative bg-bg-panel/60 border border-border-subtle rounded-[var(--radius-md)] p-3 min-w-[120px] ${onClick ? 'cursor-pointer hover:border-accent-primary/40 transition-colors' : ''}`}
      onClick={onClick}
      title={explanation}
    >
      {chipVisible && delta !== undefined && delta !== 0 && (
        <span
          title={deltaReason}
          className={`kpi-delta-chip absolute -top-2 right-2 px-1.5 py-0.5 rounded-full border text-[10px] font-mono font-semibold pointer-events-none ${
            deltaIsGood
              ? 'border-state-success/40 bg-state-success/15 text-state-success'
              : 'border-state-danger/40 bg-state-danger/15 text-state-danger'
          }`}
        >
          {delta > 0 ? `+${delta}` : delta}
        </span>
      )}
      <div className="flex items-center justify-between gap-2 text-[10px] font-mono uppercase tracking-widest text-text-muted mb-1">
        <span>{label}</span>
        {explanation && <span className="normal-case tracking-normal text-[9px] text-text-accent">Derived</span>}
      </div>
      <div className="flex items-baseline gap-2">
        <span ref={valueRef} className={`text-xl font-semibold font-mono ${colorMap[color]} ${flash ? 'animate-pulse' : ''}`}>{renderedValue}</span>
        {trend && (
          <span className={`text-[10px] ${trendColor[trend]}`}>{trendSymbol[trend]}</span>
        )}
      </div>
    </div>
  );
}
