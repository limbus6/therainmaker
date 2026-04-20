import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
export default function LandingPage() {
    const navigate = useNavigate();
    const playerName = useGameStore((s) => s.playerName);
    const setPlayerName = useGameStore((s) => s.setPlayerName);
    const phase = useGameStore((s) => s.phase);
    const week = useGameStore((s) => s.week);
    let persistedState = null;
    try {
        const raw = localStorage.getItem('ma-rainmaker-save');
        if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed?.state)
                persistedState = parsed.state;
        }
    }
    catch {
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
        if (!hasSavedGame)
            return;
        navigate('/game');
    };
    const handleNewGame = () => {
        if (hasSavedGame && !window.confirm('Start a new game? Your current save will be lost.'))
            return;
        localStorage.removeItem('ma-rainmaker-save');
        window.location.replace('/');
    };
    const handleEnterClick = () => setShowNameForm(true);
    const handleSaveName = () => {
        const trimmed = nameInput.trim();
        if (!trimmed) {
            setError('Please enter your name to continue.');
            return;
        }
        setPlayerName(trimmed);
        navigate('/game');
    };
    const handleKeyDown = (e) => {
        if (e.key === 'Enter')
            handleSaveName();
        if (e.key === 'Escape') {
            setShowNameForm(false);
            setError('');
        }
    };
    return (_jsxs("div", { className: "min-h-screen w-full bg-bg-primary flex items-center justify-center overflow-hidden relative", children: [_jsx("div", { className: "absolute inset-0 opacity-20 pointer-events-none", children: _jsx("div", { className: "absolute inset-0 bg-gradient-to-br from-accent-primary via-bg-primary to-bg-secondary" }) }), _jsx("div", { className: "absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-accent-primary to-transparent opacity-10 pointer-events-none" }), _jsxs("div", { className: "relative z-10 flex flex-col items-center justify-center gap-0 px-4 text-center w-full max-w-5xl mx-auto", children: [_jsx("div", { className: "w-[14rem] h-[14rem] sm:w-[20rem] sm:h-[20rem] md:w-[28rem] md:h-[28rem] lg:w-[38rem] lg:h-[38rem] flex items-center justify-center pointer-events-none md:-mt-48", children: _jsx("img", { src: "./logo-game.png", alt: "M&A Rainmaker Logo", className: "w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]" }) }), showNameForm ? (_jsxs("div", { className: "w-full max-w-sm space-y-4 relative mt-4 md:-mt-48 z-20 bg-bg-secondary/95 p-6 rounded-2xl border-2 border-border-subtle backdrop-blur-md shadow-2xl", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "block text-[11px] font-mono uppercase tracking-widest text-text-muted text-left font-bold border-b border-border-subtle/30 pb-1 mb-2", children: "Identity" }), _jsx("input", { autoFocus: true, type: "text", value: nameInput, onChange: (e) => { setNameInput(e.target.value); setError(''); }, onKeyDown: handleKeyDown, placeholder: "Name", maxLength: 40, className: "w-full px-4 py-2 rounded-xl bg-bg-primary border-2 border-border-subtle text-text-primary text-lg placeholder:text-text-muted/50 focus:outline-none focus:border-accent-primary transition-colors" }), error && _jsx("p", { className: "text-[10px] font-medium text-state-danger mt-1", children: error })] }), _jsxs("div", { className: "space-y-2 pt-1", children: [_jsx("button", { onClick: handleSaveName, className: "w-full px-4 py-3 rounded-xl bg-accent-primary hover:bg-accent-primary/90 active:scale-95 transition-all duration-150 text-base font-bold text-text-primary shadow-lg", children: "Start \u2192" }), _jsx("button", { onClick: () => { setShowNameForm(false); setError(''); }, className: "w-full text-xs text-text-muted hover:text-text-secondary transition-colors", children: "\u2190 Back" })] })] })) : hasSavedGame ? (
                    /* Returning player — show save card + options */
                    _jsxs("div", { className: "w-full max-w-sm space-y-2 relative mt-4 md:-mt-48 z-20", children: [_jsxs("div", { className: "rounded-xl border-2 border-border-subtle bg-bg-secondary/90 overflow-hidden backdrop-blur-md shadow-2xl", children: [_jsx("div", { className: "px-3 py-1.5 border-b border-border-subtle/50 bg-accent-primary/10", children: _jsx("p", { className: "text-[10px] font-mono uppercase tracking-widest text-text-muted font-semibold", children: "Saved Game" }) }), _jsxs("div", { className: "px-3 py-2.5 flex items-center gap-2", children: [_jsx("div", { className: "w-8 h-8 rounded-full bg-accent-primary/20 flex items-center justify-center shrink-0", children: _jsx("span", { className: "text-sm font-bold text-text-accent", children: savedPlayerName[0].toUpperCase() }) }), _jsxs("div", { className: "flex-1 min-w-0 text-left", children: [_jsx("p", { className: "text-base font-bold text-text-primary leading-tight", children: savedPlayerName }), _jsxs("p", { className: "text-[10px] text-text-secondary mt-0.5", children: ["Phase ", savedPhase, " \u00B7 Week ", String(savedWeek).padStart(2, '0')] })] })] })] }), _jsx("button", { onClick: handleContinue, className: "w-full px-5 py-3 rounded-xl bg-accent-primary hover:bg-accent-primary/90 active:scale-95 transition-all duration-150 text-base font-bold text-text-primary shadow-xl", children: "Carregar Jogo Gravado" }), _jsx("button", { onClick: handleNewGame, className: "w-full px-5 py-1.5 rounded-xl border-2 border-border-subtle bg-bg-secondary/40 backdrop-blur-md hover:bg-surface-hover hover:border-text-primary/30 text-[11px] font-semibold text-text-muted hover:text-text-primary transition-all", children: "Start New" })] })) : (
                    /* First-time player */
                    _jsx("div", { className: "relative mt-4 md:-mt-[13.5rem] z-20", children: _jsx("button", { onClick: handleEnterClick, className: "px-8 py-5 text-xl md:text-2xl font-black tracking-tight text-text-primary rounded-2xl bg-accent-primary hover:bg-accent-primary/90 active:scale-95 transition-all duration-300 shadow-[0_0_40px_rgba(100,100,255,0.2)] border-2 border-accent-primary/50 backdrop-blur-xl group", children: _jsx("span", { className: "inline-block group-hover:-translate-y-0.5 transition-transform", children: "\u2193 ENTER \u2193" }) }) }))] }), _jsx("div", { className: "absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-accent-primary to-transparent opacity-10 pointer-events-none" })] }));
}
//# sourceMappingURL=LandingPage.js.map