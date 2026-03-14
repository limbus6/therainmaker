import { Routes, Route } from 'react-router-dom';
import LandingPage from './screens/LandingPage';
import AppShell from './components/layout/AppShell';
import DashboardScreen from './screens/DashboardScreen';
import InboxScreen from './screens/InboxScreen';
import ClientScreen from './screens/ClientScreen';
import TeamScreen from './screens/TeamScreen';
import BuyersScreen from './screens/BuyersScreen';
import TasksScreen from './screens/TasksScreen';
import DeliverablesScreen from './screens/DeliverablesScreen';
import MarketScreen from './screens/MarketScreen';
import RisksScreen from './screens/RisksScreen';
import TimelineScreen from './screens/TimelineScreen';
import ResultsBoardScreen from './screens/ResultsBoardScreen';
import FinalOffersScreen from './screens/FinalOffersScreen';
import DataroomScreen from './screens/DataroomScreen';

export default function App() {
  return (
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
  );
}
