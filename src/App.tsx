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
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary text-text-muted text-[12px] font-mono uppercase tracking-widest">
      Loading...
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route index element={<LandingPage />} />
        <Route path="results" element={<ResultsBoardScreen />} />
        <Route element={<AppShell />}>
          <Route path="game" element={<DashboardScreen />} />
          <Route path="inbox" element={<InboxScreen />} />
          <Route path="client" element={<ClientScreen />} />
          <Route path="team" element={<TeamScreen />} />
          <Route path="buyers" element={<BuyersScreen />} />
          <Route path="tasks" element={<TasksScreen />} />
          <Route path="deliverables" element={<DeliverablesScreen />} />
          <Route path="market" element={<MarketScreen />} />
          <Route path="risks" element={<RisksScreen />} />
          <Route path="timeline" element={<TimelineScreen />} />
          <Route path="final-offers" element={<FinalOffersScreen />} />
          <Route path="dataroom" element={<DataroomScreen />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
