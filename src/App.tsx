import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import InventoryPage from './pages/InventoryPage'
import OnboardingPage from './pages/OnboardingPage'
import RoutineSchedulerPage from './pages/RoutineSchedulerPage'
import ProgressionTrackerPage from './pages/ProgressionTrackerPage'
import ReactionLogPage from './pages/ReactionLogPage'
import ProjectPanPage from './pages/ProjectPanPage'
import MilestonesPage from './pages/MilestonesPage'
import SkinAnalysisPage from './pages/SkinAnalysisPage'
import SettingsPage from './pages/SettingsPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/routines" element={<RoutineSchedulerPage />} />
        <Route path="/actives" element={<ProgressionTrackerPage />} />
        <Route path="/reactions" element={<ReactionLogPage />} />
        <Route path="/project-pan" element={<ProjectPanPage />} />
        <Route path="/milestones" element={<MilestonesPage />} />
        <Route path="/skin-analysis" element={<SkinAnalysisPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
