import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useState, useCallback, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Topbar from './Topbar';
import Sidebar from './Sidebar';
import WeekSummaryOverlay from '../WeekSummaryOverlay';
import PhaseTransitionOverlay from '../PhaseTransitionOverlay';
import DealCollapseOverlay from '../DealCollapseOverlay';
import OnboardingOverlay from '../OnboardingOverlay';
import ToastContainer from '../ToastContainer';
import { useGameStore } from '../../store/gameStore';
export default function AppShell() {
    const phase = useGameStore((s) => s.phase);
    const gameComplete = useGameStore((s) => s.gameComplete);
    const collapseHeadline = useGameStore((s) => s.collapseHeadline);
    const collapseDescription = useGameStore((s) => s.collapseDescription);
    const hasSeenOnboarding = useGameStore((s) => s.hasSeenOnboarding);
    const [showOnboarding, setShowOnboarding] = useState(!hasSeenOnboarding);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const prevPhaseRef = useRef(phase);
    const [showCollapse, setShowCollapse] = useState(false);
    const hasNavigatedRef = useRef(false);
    // Show collapse overlay or navigate directly to results
    useEffect(() => {
        if (!gameComplete || hasNavigatedRef.current)
            return;
        if (collapseHeadline) {
            // Deal collapsed — show cinematic overlay first
            setShowCollapse(true);
        }
        else {
            // Deal succeeded — navigate straight to results
            hasNavigatedRef.current = true;
            navigate('/results');
        }
    }, [gameComplete, collapseHeadline, navigate]);
    const handleCollapseComplete = useCallback(() => {
        setShowCollapse(false);
        hasNavigatedRef.current = true;
        navigate('/results');
    }, [navigate]);
    const [transition, setTransition] = useState(null);
    // Detect phase changes
    if (phase !== prevPhaseRef.current && !transition) {
        setTransition({ from: prevPhaseRef.current, to: phase });
        prevPhaseRef.current = phase;
    }
    const handleTransitionComplete = useCallback(() => {
        setTransition(null);
    }, []);
    return (_jsxs("div", { className: "flex flex-col h-screen overflow-hidden bg-bg-primary", children: [_jsx(Topbar, { onMenuToggle: () => setSidebarOpen((o) => !o) }), _jsxs("div", { className: "flex flex-1 overflow-hidden", children: [sidebarOpen && (_jsx("div", { className: "fixed inset-0 bg-black/50 z-40 lg:hidden", onClick: () => setSidebarOpen(false) })), _jsx("div", { className: `
          fixed inset-y-0 left-0 z-50 transition-transform duration-300 lg:static lg:translate-x-0 lg:z-auto
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `, children: _jsx(Sidebar, { onNavigate: () => setSidebarOpen(false) }) }), _jsx("main", { className: "flex-1 overflow-y-auto p-4 md:p-6", children: _jsx(Outlet, {}) })] }), _jsx(WeekSummaryOverlay, {}), transition && (_jsx(PhaseTransitionOverlay, { fromPhase: transition.from, toPhase: transition.to, onComplete: handleTransitionComplete })), showCollapse && collapseHeadline && collapseDescription && (_jsx(DealCollapseOverlay, { headline: collapseHeadline, description: collapseDescription, onComplete: handleCollapseComplete })), showOnboarding && (_jsx(OnboardingOverlay, { onComplete: () => setShowOnboarding(false) })), _jsx(ToastContainer, {})] }));
}
//# sourceMappingURL=AppShell.js.map