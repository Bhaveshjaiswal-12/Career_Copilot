import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './context/AuthContext.jsx';
import { ProtectedRoute, PublicRoute } from './routes/RouteGuards.jsx';

// Pages
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import ResetPasswordPage from './pages/ResetPasswordPage.jsx';
import LandingPage from './pages/LandingPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import AnalyzePage from './pages/AnalyzePage.jsx';
import JobDiscoveryPage from './pages/JobDiscoveryPage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';
import ReportDetailPage from './pages/ReportDetailPage.jsx';
import SkillGapPage from './pages/SkillGapPage.jsx';
import TechnicalQuestionsPage from './pages/TechnicalQuestionsPage.jsx';
import BehavioralQuestionsPage from './pages/BehavioralQuestionsPage.jsx';
import RoadmapPage from './pages/RoadmapPage.jsx';
import ResumePage from './pages/ResumePage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';

// Layout
import AppLayout from './layouts/AppLayout.jsx';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          richColors
          theme="light"
          toastOptions={{
            style: {
              background: '#FFFFFF',
              border: '1px solid #E7E1F1',
              color: '#26213A',
              boxShadow: '0 8px 24px rgba(73, 49, 111, 0.08)',
              borderRadius: '0.75rem',
            },
          }}
        />
        <Routes>
          {/* Public-only routes (redirect to dashboard if logged in) */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          </Route>

          {/* Landing page — always accessible */}
          <Route path="/" element={<LandingPage />} />

          {/* Protected routes — wrapped in sidebar layout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/analyze" element={<AnalyzePage />} />
              <Route path="/jobs" element={<JobDiscoveryPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/reports/:id" element={<ReportDetailPage />} />
              <Route path="/reports/:id/technical" element={<TechnicalQuestionsPage />} />
              <Route path="/reports/:id/behavioral" element={<BehavioralQuestionsPage />} />
              <Route path="/reports/:id/skills" element={<SkillGapPage />} />
              <Route path="/reports/:id/roadmap" element={<RoadmapPage />} />
              <Route path="/reports/:id/resume" element={<ResumePage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>

          {/* 404 */}
          <Route
            path="*"
            element={
              <div className="min-h-screen flex items-center justify-center bg-deep-bg text-text">
                <div className="text-center p-8 bg-surface border border-secondary-neutral rounded-2xl max-w-md mx-auto">
                  <h1 className="text-5xl font-bold text-text-strong mb-2">404</h1>
                  <p className="text-text-muted text-sm mb-6">The requested page could not be found.</p>
                  <a
                    href="/"
                    className="inline-flex items-center px-5 py-2.5 bg-text-strong text-deep-bg font-semibold rounded-lg hover:bg-white transition-colors"
                  >
                    Return Home
                  </a>
                </div>
              </div>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
