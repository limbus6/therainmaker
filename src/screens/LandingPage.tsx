import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { PHASE_NAMES } from '../types/game';

function formatSavedAt(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString([], { day: '2-digit', month: 'short' }) +
    ' at ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function LandingPage() {
  const navigate = useNavigate();
  const playerName = useGameStore((s) => s.playerName);
  const setPlayerName = useGameStore((s) => s.setPlayerName);
  const phase = useGameStore((s) => s.phase);
  const week = useGameStore((s) => s.week);
  const savedAt = useGameStore((s) => s.savedAt);

  const hasSavedGame = !!playerName && (phase > 0 || week > 1);

  const [nameInput, setNameInput] = useState('');
  const [showNameForm, setShowNameForm] = useState(false);
  const [error, setError] = useState('');

  const handleContinue = () => navigate('/game');

  const handleNewGame = () => {
    if (hasSavedGame && !window.confirm('Start a new game? Your current save will be lost.')) return;
    localStorage.removeItem('ma-rainmaker-save');
    window.location.replace('/');
  };

  const handleEnterClick = () => setShowNameForm(true);

  const handleSaveName = () => {
    const trimmed = nameInput.trim();
    if (!trimmed) { setError('Please enter your name to continue.'); return; }
    setPlayerName(trimmed);
    navigate('/game');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSaveName();
    if (e.key === 'Escape') { setShowNameForm(false); setError(''); }
  };

  return (
    <div className="min-h-screen w-full bg-bg-primary flex items-center justify-center overflow-hidden relative">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-primary via-bg-primary to-bg-secondary" />
      </div>
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-accent-primary to-transparent opacity-10 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center justify-center gap-0 px-4 text-center w-full max-w-5xl mx-auto">
        
        {/* Logo */}
        <div className="w-96 h-96 md:w-[36rem] md:h-[36rem] lg:w-[48rem] lg:h-[48rem] flex items-center justify-center">
          <img src="./logo-game.png" alt="M&A Rainmaker Logo" className="w-full h-full object-contain drop-shadow-2xl" />
        </div>


        {/* Name entry form */}
        {showNameForm ? (
          <div className="w-full max-w-sm space-y-4">
            <div className="space-y-1">
              <label className="block text-[11px] font-mono uppercase tracking-widest text-text-muted text-left">
                Your Name
              </label>
              <input
                autoFocus
                type="text"
                value={nameInput}
                onChange={(e) => { setNameInput(e.target.value); setError(''); }}
                onKeyDown={handleKeyDown}
                placeholder="e.g. Alex Mercer"
                maxLength={40}
                className="w-full px-4 py-3 rounded-lg bg-bg-secondary border border-border-subtle text-text-primary text-[14px] placeholder:text-text-muted focus:outline-none focus:border-accent-primary transition-colors"
              />
              {error && <p className="text-[12px] text-state-danger">{error}</p>}
            </div>
            <button
              onClick={handleSaveName}
              className="w-full px-6 py-3 rounded-lg bg-accent-primary hover:bg-accent-primary/90 active:scale-95 transition-all duration-150 text-[14px] font-semibold text-text-primary"
            >
              Save &amp; Enter →
            </button>
            <button
              onClick={() => { setShowNameForm(false); setError(''); }}
              className="w-full text-[12px] text-text-muted hover:text-text-secondary transition-colors"
            >
              ← Back
            </button>
          </div>

        ) : hasSavedGame ? (
          /* Returning player — show save card + options */
          <div className="w-full max-w-sm space-y-3">
            {/* Save card */}
            <div className="rounded-lg border border-border-subtle bg-bg-secondary/60 overflow-hidden">
              <div className="px-4 py-2 border-b border-border-subtle/50 bg-accent-primary/5">
                <p className="text-[10px] font-mono uppercase tracking-widest text-text-muted">Saved Game</p>
              </div>
              <div className="px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-accent-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-[13px] font-bold text-text-accent">{playerName[0].toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-[13px] font-semibold text-text-primary">{playerName}</p>
                  <p className="text-[11px] text-text-secondary">
                    Phase {phase} — {PHASE_NAMES[phase]} · Week {String(week).padStart(2, '0')}
                  </p>
                </div>
              </div>
              {savedAt && (
                <div className="px-4 pb-3">
                  <p className="text-[10px] text-text-muted font-mono">Last saved: {formatSavedAt(savedAt)}</p>
                </div>
              )}
            </div>

            {/* Continue */}
            <button
              onClick={handleContinue}
              className="w-full px-6 py-3 rounded-lg bg-accent-primary hover:bg-accent-primary/90 active:scale-95 transition-all duration-150 text-[14px] font-semibold text-text-primary"
            >
              <span className="animate-pulse">▶ Continue Game</span>
            </button>

            {/* New game */}
            <button
              onClick={handleNewGame}
              className="w-full px-6 py-2.5 rounded-lg border border-border-subtle bg-transparent hover:bg-surface-hover text-[13px] text-text-muted hover:text-text-primary transition-colors"
            >
              New Game
            </button>
          </div>

        ) : (
          /* First-time player */
          <>
            <button
              onClick={handleEnterClick}
              className="mt-2 px-10 py-4 text-lg md:text-xl font-semibold text-text-primary rounded-lg bg-accent-primary hover:bg-accent-primary/90 active:scale-95 transition-all duration-200 shadow-lg border border-accent-primary/40"
            >
              <span className="inline-block animate-pulse">↓ Click here to enter ↓</span>
            </button>
          </>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-accent-primary to-transparent opacity-10 pointer-events-none" />
    </div>
  );
}
