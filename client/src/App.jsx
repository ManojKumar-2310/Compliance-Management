import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AdminLogin from './pages/AdminLogin';
import EmployeeLogin from './pages/EmployeeLogin';
import AuditorLogin from './pages/AuditorLogin';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import AuditorDashboard from './pages/auditor/AuditorDashboard';
import MissionControl from './pages/auditor/MissionControl';
import VerificationQueue from './pages/auditor/VerificationQueue';
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import useAuth from './hooks/useAuth';
import Regulations from './pages/Regulations';
import Tasks from './pages/Tasks';
import Users from './pages/Users';
import Documents from './pages/Documents';
import Audits from './pages/Audits';
import Risks from './pages/Risks';

import Reports from './pages/Reports';
import EmployeeTasks from './pages/EmployeeTasks';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  console.log('ProtectedRoute - Loading:', loading, 'User:', user?.email || 'No user');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="spinner w-16 h-16 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('No user found, redirecting to landing page');
    return <Navigate to="/" replace />;
  }

  return <Layout><Outlet /></Layout>;
};

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route path="/employee-login" element={<EmployeeLogin />} />
              <Route path="/auditor-login" element={<AuditorLogin />} />

              {/* Protected Workspace */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />

                {/* Role-Specific Dashboards */}
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/auditor/dashboard" element={<AuditorDashboard />} />
                <Route path="/auditor/mission-control" element={<MissionControl />} />
                <Route path="/auditor/verification-queue" element={<VerificationQueue />} />
                <Route path="/employee/dashboard" element={<EmployeeDashboard />} />

                {/* Common Routes */}
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/employee-tasks" element={<EmployeeTasks />} />
                <Route path="/regulations" element={<Regulations />} />
                <Route path="/users" element={<Users />} />
                <Route path="/documents" element={<Documents />} />
                <Route path="/audits" element={<Audits />} />
                <Route path="/risks" element={<Risks />} />
                <Route path="/reports" element={<Reports />} />
              </Route>
            </Routes>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
