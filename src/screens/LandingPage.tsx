import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { ADVISOR_ARCHETYPES } from '../content/archetypes';


export default function LandingPage() {
  const navigate = useNavigate();
  const playerName = useGameStore((s) => s.playerName);
  const setPlayerName = useGameStore((s) => s.setPlayerName);
  const phase = useGameStore((s) => s.phase);
  const week = useGameStore((s) => s.week);
  const runMode = useGameStore((s) => s.runMode);
  const advisorArchetype = useGameStore((s) => s.advisorArchetype);

  let persistedState: { playerName?: string; phase?: number; week?: number } | null = null;
  try {
    const raw = localStorage.getItem('ma-rainmaker-save');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.state) persistedState = parsed.state;
    }
  } catch {
    persistedState = null;
  }

  const savedPlayerName = persistedState?.playerName ?? playerName;
  const savedPhase = persistedState?.phase ?? phase;
  const savedWeek = persistedState?.week ?? week;
  const hasSavedGame = !!savedPlayerName;

  const [nameInput, setNameInput] = useState('');
  const [showNameForm, setShowNameForm] = useState(false);
  const [error, setError] = useState('');

  const handleContinue = () => {
    if (!hasSavedGame) return;
    navigate('/game');
  };

  const handleNewGame = () => {
    if (hasSavedGame && !window.confirm('Start a new game? Your current save will be lost.')) return;
    localStorage.removeItem('ma-rainmaker-save');
    // Respect the Vite base path — replacing to '/' strands the player on a
    // 404 when the app is served from /therainmaker/ on GitHub Pages.
    window.location.replace(import.meta.env.BASE_URL);
  };

  const [showArchetypes, setShowArchetypes] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const selectArchetype = useGameStore((s) => s.selectArchetype);
  const startMandate = useGameStore((s) => s.startMandate);

  const handleEnterClick = () => setShowNameForm(true);

  const handleSaveName = async () => {
    const trimmed = nameInput.trim();
    if (!trimmed) { setError('Please enter your name to continue.'); return; }
    setPlayerName(trimmed);
    if (runMode === 'daily' || runMode === 'challenge') {
      setIsStarting(true);
      await startMandate();
      navigate('/game');
      return;
    }
    setShowNameForm(false);
    setShowArchetypes(true);
  };

  const handlePickArchetype = async (id: (typeof ADVISOR_ARCHETYPES)[number]['id']) => {
    if (isStarting) return;
    setIsStarting(true);
    selectArchetype(id);
    await startMandate();
    navigate('/game');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') void handleSaveName();
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
        <div className="w-[14rem] h-[14rem] sm:w-[20rem] sm:h-[20rem] md:w-[28rem] md:h-[28rem] lg:w-[38rem] lg:h-[38rem] flex items-center justify-center pointer-events-none md:-mt-48">
          <img src="./logo-game.png" alt="M&A Rainmaker Logo" className="w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]" />
        </div>

        {/* Archetype selection */}
        {showArchetypes ? (
          <div className="w-full max-w-3xl space-y-3 relative mt-4 md:-mt-48 z-20">
            <p className="text-[11px] font-mono uppercase tracking-widest text-text-muted font-bold">Choose your practice</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {ADVISOR_ARCHETYPES.map((archetype) => (
                <button
                  key={archetype.id}
                  onClick={() => handlePickArchetype(archetype.id)}
                  disabled={isStarting}
                  className="rounded-2xl border-2 border-border-subtle bg-bg-secondary/95 p-4 text-left backdrop-blur-md shadow-xl transition-all hover:border-accent-primary hover:-translate-y-0.5 active:scale-95 disabled:cursor-wait disabled:opacity-60"
                >
                  <p className="text-[14px] font-bold text-text-primary">{archetype.name}</p>
                  <p className="mt-1 text-[11px] italic text-text-secondary leading-snug">{archetype.tagline}</p>
                  <ul className="mt-3 space-y-1 border-t border-border-subtle/50 pt-2">
                    {archetype.effects.map((effect) => (
                      <li key={effect} className="text-[10px] leading-snug text-text-muted">• {effect}</li>
                    ))}
                  </ul>
                </button>
              ))}
            </div>
          </div>
        ) : showNameForm ? (
          <div className="w-full max-w-sm space-y-4 relative mt-4 md:-mt-48 z-20 bg-bg-secondary/95 p-6 rounded-2xl border-2 border-border-subtle backdrop-blur-md shadow-2xl">
            <div className="space-y-2">
              <label className="block text-[11px] font-mono uppercase tracking-widest text-text-muted text-left font-bold border-b border-border-subtle/30 pb-1 mb-2">
                {runMode === 'daily' ? 'Daily identity' : runMode === 'challenge' ? 'Challenge identity' : 'Identity'}
              </label>
              {(runMode === 'daily' || runMode === 'challenge') && (
                <p className="text-left text-[10px] leading-relaxed text-text-secondary">
                  {runMode === 'daily' ? 'Today’s' : 'This challenge’s'} build is fixed for every player: {ADVISOR_ARCHETYPES.find((archetype) => archetype.id === advisorArchetype)?.name ?? 'Fixed build'}.
                </p>
              )}
              <input
                autoFocus
                type="text"
                value={nameInput}
                onChange={(e) => { setNameInput(e.target.value); setError(''); }}
                onKeyDown={handleKeyDown}
                placeholder="Name"
                maxLength={40}
                className="w-full px-4 py-2 rounded-xl bg-bg-primary border-2 border-border-subtle text-text-primary text-lg placeholder:text-text-muted/50 focus:outline-none focus:border-accent-primary transition-colors"
              />
              {error && <p className="text-[10px] font-medium text-state-danger mt-1">{error}</p>}
            </div>
            <div className="space-y-2 pt-1">
              <button
                onClick={() => { void handleSaveName(); }}
                disabled={isStarting}
                className="w-full px-4 py-3 rounded-xl bg-accent-primary hover:bg-accent-primary/90 active:scale-95 transition-all duration-150 text-base font-bold text-text-primary shadow-lg disabled:cursor-wait disabled:opacity-60"
              >
                Start →
              </button>
              <button
                onClick={() => { setShowNameForm(false); setError(''); }}
                className="w-full text-xs text-text-muted hover:text-text-secondary transition-colors"
              >
                ← Back
              </button>
            </div>
          </div>

        ) : hasSavedGame ? (
          /* Returning player — show save card + options */
          <div className="w-full max-w-sm space-y-2 relative mt-4 md:-mt-48 z-20">
            {/* Save card */}
            <div className="rounded-xl border-2 border-border-subtle bg-bg-secondary/90 overflow-hidden backdrop-blur-md shadow-2xl">
              <div className="px-3 py-1.5 border-b border-border-subtle/50 bg-accent-primary/10">
                <p className="text-[10px] font-mono uppercase tracking-widest text-text-muted font-semibold">Saved Game</p>
              </div>
              <div className="px-3 py-2.5 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-accent-primary/20 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-text-accent">{savedPlayerName[0].toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-base font-bold text-text-primary leading-tight">{savedPlayerName}</p>
                  <p className="text-[10px] text-text-secondary mt-0.5">
                    Phase {savedPhase} · Week {String(savedWeek).padStart(2, '0')}
                  </p>
                </div>
              </div>
            </div>

            {/* Continue */}
            <button
              onClick={handleContinue}
              className="w-full px-5 py-3 rounded-xl bg-accent-primary hover:bg-accent-primary/90 active:scale-95 transition-all duration-150 text-base font-bold text-text-primary shadow-xl"
            >
              Continue
            </button>

            {/* New game */}
            <button
              onClick={handleNewGame}
              className="w-full px-5 py-1.5 rounded-xl border-2 border-border-subtle bg-bg-secondary/40 backdrop-blur-md hover:bg-surface-hover hover:border-text-primary/30 text-[11px] font-semibold text-text-muted hover:text-text-primary transition-all"
            >
              Start New
            </button>
          </div>

        ) : (
          /* First-time player */
          <div className="relative mt-4 md:-mt-[13.5rem] z-20">
            <button
              onClick={handleEnterClick}
              className="px-8 py-5 text-xl md:text-2xl font-black tracking-tight text-text-primary rounded-2xl bg-accent-primary hover:bg-accent-primary/90 active:scale-95 transition-all duration-300 shadow-[0_0_40px_rgba(100,100,255,0.2)] border-2 border-accent-primary/50 backdrop-blur-xl group"
            >
              <span className="inline-block group-hover:-translate-y-0.5 transition-transform">
                ↓ ENTER ↓
              </span>
            </button>
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-accent-primary to-transparent opacity-10 pointer-events-none" />
    </div>
  );
}
