import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider, useApp } from './context/AppContext'
import type { ReactNode } from 'react'
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

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user } = useApp()
  if (!user) return <Navigate to="/login" replace />
  if (!user.onboardingComplete) return <Navigate to="/onboarding" replace />
  return <>{children}</>
}

function AuthRoute({ children }: { children: ReactNode }) {
  const { user } = useApp()
  if (user) return <Navigate to={user.onboardingComplete ? '/dashboard' : '/onboarding'} replace />
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<AuthRoute><LoginPage /></AuthRoute>} />
      <Route path="/register" element={<AuthRoute><RegisterPage /></AuthRoute>} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/inventory" element={<ProtectedRoute><InventoryPage /></ProtectedRoute>} />
      <Route path="/routines" element={<ProtectedRoute><RoutineSchedulerPage /></ProtectedRoute>} />
      <Route path="/actives" element={<ProtectedRoute><ProgressionTrackerPage /></ProtectedRoute>} />
      <Route path="/reactions" element={<ProtectedRoute><ReactionLogPage /></ProtectedRoute>} />
      <Route path="/project-pan" element={<ProtectedRoute><ProjectPanPage /></ProtectedRoute>} />
      <Route path="/milestones" element={<ProtectedRoute><MilestonesPage /></ProtectedRoute>} />
      <Route path="/skin-analysis" element={<ProtectedRoute><SkinAnalysisPage /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  )
}

export default App
