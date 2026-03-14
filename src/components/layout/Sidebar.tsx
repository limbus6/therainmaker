import { NavLink } from 'react-router-dom';
import { useGameStore } from '../../store/gameStore';
import {
  LayoutDashboard,
  Inbox,
  Users,
  UserCircle,
  Briefcase,
  ListChecks,
  FileText,
  Newspaper,
  AlertTriangle,
  Clock,
  Trophy,
  Database,
} from 'lucide-react';

interface NavEntry {
  to: string;
  label: string;
  icon: React.ReactNode;
  badgeKey?: 'unreadEmails' | 'activeRisks' | 'pendingTasks';
}

const NAV_ITEMS: NavEntry[] = [
  { to: '/game', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { to: '/inbox', label: 'Inbox', icon: <Inbox size={18} />, badgeKey: 'unreadEmails' },
  { to: '/client', label: 'Client', icon: <UserCircle size={18} /> },
  { to: '/team', label: 'Team', icon: <Users size={18} /> },
  { to: '/buyers', label: 'Buyers', icon: <Briefcase size={18} /> },
  { to: '/tasks', label: 'Tasks', icon: <ListChecks size={18} />, badgeKey: 'pendingTasks' },
  { to: '/deliverables', label: 'Deliverables', icon: <FileText size={18} /> },
  { to: '/market', label: 'Market', icon: <Newspaper size={18} /> },
  { to: '/risks', label: 'Risks', icon: <AlertTriangle size={18} />, badgeKey: 'activeRisks' },
  { to: '/timeline', label: 'Timeline', icon: <Clock size={18} /> },
];

export default function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const emails = useGameStore((s) => s.emails);
  const risks = useGameStore((s) => s.risks);
  const tasks = useGameStore((s) => s.tasks);
  const phase = useGameStore((s) => s.phase);
  const playerName = useGameStore((s) => s.playerName);
  const savedAt = useGameStore((s) => s.savedAt);

  const lastSaved = savedAt
    ? new Date(savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

  const badges: Record<string, number> = {
    unreadEmails: emails.filter((e) => e.state === 'unread').length,
    activeRisks: risks.filter((r) => !r.mitigated && r.severity !== 'low').length,
    pendingTasks: tasks.filter((t) => t.status === 'available' || t.status === 'recommended').length,
  };

  const visibleNavItems: NavEntry[] = [
    ...NAV_ITEMS,
    ...(phase >= 5 ? [{ to: '/dataroom', label: 'Data Room', icon: <Database size={18} /> }] : []),
    ...(phase >= 7 ? [{ to: '/final-offers', label: 'Final Offers', icon: <Trophy size={18} /> }] : []),
  ];

  return (
    <aside className="w-52 h-full bg-bg-secondary border-r border-border-subtle flex flex-col py-3 overflow-y-auto">
      <nav className="flex flex-col gap-0.5 px-2">
        {visibleNavItems.map((item) => {
          const count = item.badgeKey ? badges[item.badgeKey] : 0;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/game'}
              onClick={onNavigate}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-[var(--radius-md)] text-[13px] transition-all duration-150 group ${
                  isActive
                    ? 'bg-accent-soft text-text-accent border-l-2 border-accent-primary shadow-[var(--shadow-glow-soft)]'
                    : 'text-text-muted hover:text-text-secondary hover:bg-surface-hover border-l-2 border-transparent'
                }`
              }
            >
              <span className="shrink-0 opacity-80 group-hover:opacity-100">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {count > 0 && (
                <span className="min-w-[20px] h-5 flex items-center justify-center rounded-full bg-accent-primary/20 text-text-accent text-[10px] font-mono font-semibold px-1.5">
                  {count}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="mt-auto px-3 pt-3 border-t border-border-subtle space-y-2">
        {playerName && (
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-accent-primary/5 border border-accent-primary/10">
            <div className="w-6 h-6 rounded-full bg-accent-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="text-[10px] font-bold text-text-accent">{playerName[0].toUpperCase()}</span>
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-semibold text-text-primary truncate">{playerName}</p>
              {lastSaved && (
                <p className="text-[9px] text-text-muted font-mono">Saved {lastSaved}</p>
              )}
            </div>
          </div>
        )}
        <div className="text-[10px] font-mono uppercase tracking-widest text-text-muted/60 px-2">
          Clearwater Advisory
        </div>
      </div>
    </aside>
  );
}
