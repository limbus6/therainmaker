import type { ReactNode } from 'react';

interface PanelProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  variant?: 'default' | 'elevated' | 'accent' | 'critical';
  className?: string;
  headerRight?: ReactNode;
}

const variantStyles = {
  default: 'bg-bg-panel/60 border-border-subtle',
  elevated: 'bg-bg-elevated/60 border-border-default shadow-[var(--shadow-panel)]',
  accent: 'bg-bg-panel/60 border-border-accent shadow-[var(--shadow-glow-soft)]',
  critical: 'bg-bg-panel/60 border-state-danger/30',
};

export default function Panel({ children, title, subtitle, variant = 'default', className = '', headerRight }: PanelProps) {
  return (
    <div className={`rounded-[var(--radius-lg)] border p-4 ${variantStyles[variant]} ${className}`}>
      {(title || headerRight) && (
        <div className="flex items-center justify-between mb-3">
          <div>
            {title && <h3 className="text-[13px] font-semibold uppercase tracking-wider text-text-secondary">{title}</h3>}
            {subtitle && <p className="text-[11px] text-text-muted mt-0.5">{subtitle}</p>}
          </div>
          {headerRight}
        </div>
      )}
      {children}
    </div>
  );
}
