import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Outlet, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import Layout from './components/Layout';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Onboarding from './pages/Onboarding';
import LessonView from './pages/LessonView';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import Mfa from '@/pages/Mfa';
import LegacyGoalRedirect from '@/components/money/LegacyGoalRedirect';
import GoalDetail from './pages/GoalDetail';
import Dashboard from './pages/Dashboard';
import Money from './pages/Money';
import Basecamp from './pages/Basecamp';
import Baseline30 from './pages/Baseline30';
import ClipPathGroup from './pages/ClipPathGroup';
import BaseScoreQuiz from './pages/BaseScoreQuiz';
import BaseScore from './pages/BaseScore';
import CurriculumReview from './pages/CurriculumReview';

const AuthenticatedApp = () => {
  const { isLoadingPublicSettings } = useAuth();

  if (isLoadingPublicSettings) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Baseline30 />} />
      <Route path="/basescore-quiz" element={<BaseScoreQuiz />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/mfa" element={<Mfa />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/lesson/:moduleId" element={<LessonView />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/goals" element={<Navigate to="/money#goals" replace />} />
          <Route path="/goals/:goalId" element={<LegacyGoalRedirect />} />
          <Route path="/money/goals/:goalId" element={<GoalDetail />} />
          <Route path="/money" element={<Money />} />
          <Route path="/basecamp" element={<Basecamp />} />
          <Route path="/basescore" element={<BaseScore />} />
          <Route path="/curriculum-review" element={<CurriculumReview />} />
        </Route>
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;