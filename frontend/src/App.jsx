import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import RequireAuth from './components/routing/RequireAuth';
import RequireRole from './components/routing/RequireRole';
import Login from './pages/Login';
import Register from './pages/Register';
import LandingPage from './pages/public/LandingPage';
import CandidateDashboard from './pages/candidate/Dashboard';
import GreenRoom from './pages/candidate/GreenRoom';
import InterviewRoom from './pages/candidate/InterviewRoom';
import AdminLayout from './components/layout/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import TagManager from './pages/admin/TagManager';
import QuestionManager from './pages/admin/QuestionManager';
import QuestionEditor from './pages/admin/QuestionEditor';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes (Require Authentication) */}
          <Route element={<RequireAuth />}>
            <Route path="/dashboard" element={<CandidateDashboard />} />
            <Route path="/green-room" element={<GreenRoom />} />
            <Route path="/interview/:id" element={<InterviewRoom />} />

            {/* Protected Admin Routes (RBAC: Admin Role Required) */}
            <Route element={<RequireRole allowedRoles={['admin']} />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="tags" element={<TagManager />} />
                <Route path="questions" element={<QuestionManager />} />
                <Route path="questions/new" element={<QuestionEditor />} />
                <Route path="questions/:id/edit" element={<QuestionEditor />} />
              </Route>
            </Route>
          </Route>

          {/* Fallback Redirects */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
