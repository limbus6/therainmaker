import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { PHASE_NAMES } from '../../types/game';
import {
  Settings,
  Bell,
  Menu,
} from 'lucide-react';
import NotificationsPopover from '../NotificationsPopover';
import SettingsModal from '../SettingsModal';

function KpiPill({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1 rounded-[var(--radius-md)] bg-surface-default border border-border-subtle">
      <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted">{label}</span>
      <span className={`text-[13px] font-semibold font-mono ${color || 'text-text-primary'}`}>{value}</span>
    </div>
  );
}

export default function Topbar({ onMenuToggle }: { onMenuToggle: () => void }) {
  const { phase, week, resources, emails } = useGameStore();
  const unreadCount = emails.filter((e) => e.state === 'unread').length;
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  return (
    <header className="h-12 flex items-center justify-between px-4 bg-bg-primary/80 backdrop-blur-sm border-b border-border-subtle shrink-0 z-50">
      {/* Left: Hamburger (mobile) + Title + Phase */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors"
        >
          <Menu size={18} />
        </button>
        <h1 className="text-[14px] md:text-[15px] font-display font-semibold text-text-accent tracking-wide whitespace-nowrap">
          THE M&A RAINMAKER
        </h1>
        <div className="hidden md:flex items-center gap-3">
          <div className="h-4 w-px bg-border-subtle" />
          <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted">P{phase}</span>
          <span className="hidden lg:inline text-[12px] text-text-secondary">{PHASE_NAMES[phase]}</span>
          <div className="h-4 w-px bg-border-subtle" />
          <span className="text-[12px] font-mono text-text-muted">
            WK <span className="text-text-primary font-semibold">{String(week).padStart(2, '0')}</span>
          </span>
        </div>
      </div>

      {/* Center: KPI Strip — hidden on mobile */}
      <div className="hidden md:flex items-center gap-1.5">
        <KpiPill label="Budget" value={`€${resources.budget}k`} />
        <KpiPill label="Capacity" value={`${resources.teamCapacity}%`} color={resources.teamCapacity < 30 ? 'text-state-danger' : undefined} />
        <KpiPill label="Momentum" value={resources.dealMomentum} color={resources.dealMomentum > 60 ? 'text-state-success' : undefined} />
        <KpiPill label="Trust" value={resources.clientTrust} />
        <KpiPill label="Risk" value={resources.riskLevel} color={resources.riskLevel > 50 ? 'text-state-danger' : resources.riskLevel > 30 ? 'text-state-warning' : 'text-state-success'} />
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-1 relative">
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative p-2 rounded-[var(--radius-md)] text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors duration-150"
        >
          <Bell size={16} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-accent-primary animate-pulse" />
          )}
        </button>
<button
          onClick={() => setShowSettings(true)}
          className="p-2 rounded-[var(--radius-md)] text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors duration-150"
          title="Settings"
        >
          <Settings size={16} />
        </button>

        {/* Popovers — anchored to this relative container */}
        <NotificationsPopover isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
        <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
      </div>
    </header>
  );
}
