import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Providers } from './providers';
import { AppLayout } from './components/layout/app-layout';
import { useAuthStore } from './lib/auth-store';

import LoginPage from './pages/login';
import RegisterPage from './pages/register';
import DashboardPage from './pages/dashboard';
import CalendarPage from './pages/calendar';
import AnalyticsPage from './pages/analytics';
import WeeklyReportPage from './pages/weekly-report';
import HistoryPage from './pages/history';
import AchievementsPage from './pages/achievements';
import SettingsPage from './pages/settings';
import ProfilePage from './pages/profile';
import LandingPage from './pages/landing';
import NotFoundPage from './pages/not-found';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const token = localStorage.getItem('accessToken');

  if (!isAuthenticated && !token) {
    return <Navigate to="/auth/login" replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const token = localStorage.getItem('accessToken');

  if (isAuthenticated || token) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Providers>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/auth/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/auth/register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/weekly-report" element={<WeeklyReportPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/achievements" element={<AchievementsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Providers>
    </BrowserRouter>
  );
}
