import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
const LandingPage = lazy(() => import('./screens/LandingPage'));
const DashboardScreen = lazy(() => import('./screens/DashboardScreen'));
const InboxScreen = lazy(() => import('./screens/InboxScreen'));
const ClientScreen = lazy(() => import('./screens/ClientScreen'));
const TeamScreen = lazy(() => import('./screens/TeamScreen'));
const BuyersScreen = lazy(() => import('./screens/BuyersScreen'));
const TasksScreen = lazy(() => import('./screens/TasksScreen'));
const DeliverablesScreen = lazy(() => import('./screens/DeliverablesScreen'));
const MarketScreen = lazy(() => import('./screens/MarketScreen'));
const RisksScreen = lazy(() => import('./screens/RisksScreen'));
const TimelineScreen = lazy(() => import('./screens/TimelineScreen'));
const ResultsBoardScreen = lazy(() => import('./screens/ResultsBoardScreen'));
const FinalOffersScreen = lazy(() => import('./screens/FinalOffersScreen'));
const DataroomScreen = lazy(() => import('./screens/DataroomScreen'));
function RouteFallback() {
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-bg-primary text-text-muted text-[12px] font-mono uppercase tracking-widest", children: "Loading..." }));
}
export default function App() {
    return (_jsx(Suspense, { fallback: _jsx(RouteFallback, {}), children: _jsxs(Routes, { children: [_jsx(Route, { index: true, element: _jsx(LandingPage, {}) }), _jsx(Route, { path: "results", element: _jsx(ResultsBoardScreen, {}) }), _jsxs(Route, { element: _jsx(AppShell, {}), children: [_jsx(Route, { path: "game", element: _jsx(DashboardScreen, {}) }), _jsx(Route, { path: "inbox", element: _jsx(InboxScreen, {}) }), _jsx(Route, { path: "client", element: _jsx(ClientScreen, {}) }), _jsx(Route, { path: "team", element: _jsx(TeamScreen, {}) }), _jsx(Route, { path: "buyers", element: _jsx(BuyersScreen, {}) }), _jsx(Route, { path: "tasks", element: _jsx(TasksScreen, {}) }), _jsx(Route, { path: "deliverables", element: _jsx(DeliverablesScreen, {}) }), _jsx(Route, { path: "market", element: _jsx(MarketScreen, {}) }), _jsx(Route, { path: "risks", element: _jsx(RisksScreen, {}) }), _jsx(Route, { path: "timeline", element: _jsx(TimelineScreen, {}) }), _jsx(Route, { path: "final-offers", element: _jsx(FinalOffersScreen, {}) }), _jsx(Route, { path: "dataroom", element: _jsx(DataroomScreen, {}) })] })] }) }));
}
//# sourceMappingURL=App.js.map