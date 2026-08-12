import { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, LogOut, RotateCcw, Settings, Save } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { PHASE_NAMES } from '../types/game';
import { buildReplayExport } from '../engine/replayTrace';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const phase = useGameStore((s) => s.phase);
  const week = useGameStore((s) => s.week);
  const resources = useGameStore((s) => s.resources);
  const playerName = useGameStore((s) => s.playerName);
  const savedAt = useGameStore((s) => s.savedAt);
  const saveGame = useGameStore((s) => s.saveGame);
  const replayCount = useGameStore((s) => s.replayTrace.length);
  const weekPace = useGameStore((s) => s.weekPace);
  const setWeekPace = useGameStore((s) => s.setWeekPace);

  const lastSaved = savedAt
    ? new Date(savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'Not yet saved';

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
    return undefined;
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleResetGame = () => {
    if (window.confirm('Reset game? All progress will be permanently lost.')) {
      localStorage.removeItem('ma-rainmaker-save');
      navigate('/');
      onClose();
    }
  };

  const handleExitToMenu = () => {
    navigate('/');
    onClose();
  };

  const handleExportReplay = () => {
    const replay = buildReplayExport(useGameStore.getState());
    const blob = new Blob([JSON.stringify(replay, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    const player = playerName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'run';
    anchor.href = url;
    anchor.download = `rainmaker-replay-${player}-day-${replay.run.day}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      ref={popoverRef}
      className="absolute top-full mt-1 right-0 w-[min(22rem,90vw)] bg-bg-secondary border border-border-subtle rounded-lg shadow-2xl z-[100] overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border-subtle bg-bg-primary/60">
        <Settings size={14} className="text-accent-primary" />
        <h3 className="text-[13px] font-semibold text-text-primary flex-1">Settings</h3>
        {playerName && (
          <span className="text-[11px] font-mono text-text-accent truncate max-w-[120px]">{playerName}</span>
        )}
      </div>

      {/* Game Status Card */}
      <div className="mx-4 mt-4 rounded-lg border border-border-subtle bg-bg-primary/40 overflow-hidden">
        <div className="px-4 py-2 border-b border-border-subtle/50 bg-accent-primary/5">
          <p className="text-[10px] font-mono uppercase tracking-widest text-text-muted">Active Deal</p>
        </div>
        <div className="px-4 py-3 grid grid-cols-3 gap-3">
          <div className="text-center">
            <p className="text-[10px] text-text-muted mb-1">Phase</p>
            <p className="text-[18px] font-bold font-mono text-text-primary">{phase}</p>
          </div>
          <div className="text-center border-x border-border-subtle/40">
            <p className="text-[10px] text-text-muted mb-1">Week</p>
            <p className="text-[18px] font-bold font-mono text-text-primary">{String(week).padStart(2, '0')}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-text-muted mb-1">Budget</p>
            <p className="text-[18px] font-bold font-mono text-text-primary">€{resources.budget}k</p>
          </div>
        </div>
        <div className="px-4 pb-3 text-center">
          <p className="text-[11px] text-text-tertiary">{PHASE_NAMES[phase]}</p>
        </div>
      </div>

      {/* Execution pace */}
      <div className="mx-4 mt-3 rounded-lg border border-border-subtle bg-bg-primary/40 px-4 py-3">
        <p className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-2">Execution Pace</p>
        <div className="grid grid-cols-3 gap-1.5">
          {(['deliberate', 'standard', 'sprint'] as const).map((pace) => (
            <button
              key={pace}
              onClick={() => setWeekPace(pace)}
              className={`px-2 py-1.5 rounded-md text-[11px] font-medium capitalize transition-colors ${
                weekPace === pace
                  ? 'bg-accent-primary/15 text-text-accent border border-accent-primary/40'
                  : 'bg-surface-default text-text-secondary border border-transparent hover:bg-surface-hover'
              }`}
            >
              {pace}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 py-4 space-y-2">
        <button
          onClick={saveGame}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg border border-border-subtle bg-surface-default hover:bg-surface-hover transition-colors text-[13px] font-medium text-text-primary"
        >
          <Save size={14} className="text-text-muted" />
          Save Game
          <span className="ml-auto text-[11px] text-text-muted font-mono">{lastSaved}</span>
        </button>

        <button
          onClick={handleExitToMenu}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg border border-border-subtle bg-surface-default hover:bg-surface-hover transition-colors text-[13px] font-medium text-text-primary"
        >
          <LogOut size={14} className="text-text-muted" />
          Exit to Main Menu
          <span className="ml-auto text-[11px] text-text-muted">(saves)</span>
        </button>

        <button
          onClick={handleExportReplay}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg border border-border-subtle bg-surface-default hover:bg-surface-hover transition-colors text-[13px] font-medium text-text-primary"
        >
          <Download size={14} className="text-text-muted" />
          Export Replay Trace
          <span className="ml-auto text-[11px] text-text-muted font-mono">{replayCount} actions</span>
        </button>

        <button
          onClick={handleResetGame}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg border border-state-danger/30 bg-state-danger/5 hover:bg-state-danger/10 transition-colors text-[13px] font-medium text-state-danger"
        >
          <RotateCcw size={14} />
          Reset Game
          <span className="ml-auto text-[11px] text-state-danger/60">(clears all)</span>
        </button>

        {/* Go Back */}
        <button
          onClick={onClose}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-accent-primary hover:bg-accent-primary/90 transition-colors text-[13px] font-semibold text-text-primary mt-1"
        >
          <ArrowLeft size={14} />
          Go Back to Game
        </button>
      </div>
    </div>
  );
}
