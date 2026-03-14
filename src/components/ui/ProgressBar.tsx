interface ProgressBarProps {
  value: number; // 0-100
  color?: 'accent' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

const colorMap = {
  accent: 'bg-accent-primary',
  success: 'bg-state-success',
  warning: 'bg-state-warning',
  danger: 'bg-state-danger',
  info: 'bg-state-info',
};

export default function ProgressBar({ value, color = 'accent', size = 'sm', showLabel = false }: ProgressBarProps) {
  const h = size === 'sm' ? 'h-1.5' : 'h-2.5';
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div className="flex items-center gap-2">
      <div className={`flex-1 ${h} rounded-full bg-surface-default overflow-hidden`}>
        <div
          className={`${h} rounded-full ${colorMap[color]} transition-all duration-500 ease-out`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-[10px] font-mono text-text-muted w-8 text-right">{clamped}%</span>
      )}
    </div>
  );
}
