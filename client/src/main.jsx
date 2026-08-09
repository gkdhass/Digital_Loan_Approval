import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import './index.css';

import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import ToastContainer from './components/ToastContainer';
import { ToastProvider } from './hooks/useToast.jsx';
import ErrorBoundary from './components/ErrorBoundary';
import SplashScreen from './components/SplashScreen';
import AnimatedBackground from './components/AnimatedBackground';
import CustomCursor from './components/CustomCursor';
import withRouteErrorBoundary from './components/withRouteErrorBoundary';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import LoanTypes from './pages/LoanTypes';
import ApplyLoan from './pages/ApplyLoan';
import Applications from './pages/Applications';
import ApplicationDetail from './pages/ApplicationDetail';
import EmiCalculator from './pages/EmiCalculator';
import LoanHistory from './pages/LoanHistory';
import Profile from './pages/Profile';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminApplications from './pages/admin/AdminApplications';
import AdminApplicationDetail from './pages/admin/AdminApplicationDetail';
import AdminUsers from './pages/admin/AdminUsers';
import AdminAuditLogs from './pages/admin/AdminAuditLogs';
import AdminReports from './pages/admin/AdminReports';
import AdminLoanTypes from './pages/admin/AdminLoanTypes';

// Wrap pages with route-level error boundaries
const HomeWithBoundary = withRouteErrorBoundary(Home, 'Home', '/');
const LoginWithBoundary = withRouteErrorBoundary(Login, 'Login', '/');
const RegisterWithBoundary = withRouteErrorBoundary(Register, 'Register', '/login');
const DashboardWithBoundary = withRouteErrorBoundary(Dashboard, 'Dashboard', '/');
const LoanTypesWithBoundary = withRouteErrorBoundary(LoanTypes, 'Loan Types', '/');
const ApplyLoanWithBoundary = withRouteErrorBoundary(ApplyLoan, 'Apply for Loan', '/loan-types');
const ApplicationsWithBoundary = withRouteErrorBoundary(Applications, 'Applications', '/dashboard');
const ApplicationDetailWithBoundary = withRouteErrorBoundary(ApplicationDetail, 'Application Details', '/applications');
const EmiCalculatorWithBoundary = withRouteErrorBoundary(EmiCalculator, 'EMI Calculator', '/');
const LoanHistoryWithBoundary = withRouteErrorBoundary(LoanHistory, 'Loan History', '/dashboard');
const ProfileWithBoundary = withRouteErrorBoundary(Profile, 'Profile', '/dashboard');
const AdminDashboardWithBoundary = withRouteErrorBoundary(AdminDashboard, 'Admin Dashboard', '/admin/dashboard');
const AdminApplicationsWithBoundary = withRouteErrorBoundary(AdminApplications, 'Admin Applications', '/admin/dashboard');
const AdminApplicationDetailWithBoundary = withRouteErrorBoundary(AdminApplicationDetail, 'Admin Application Details', '/admin/applications');
const AdminUsersWithBoundary = withRouteErrorBoundary(AdminUsers, 'User Management', '/admin/dashboard');
const AdminAuditLogsWithBoundary = withRouteErrorBoundary(AdminAuditLogs, 'Audit Logs', '/admin/dashboard');
const AdminReportsWithBoundary = withRouteErrorBoundary(AdminReports, 'Reports', '/admin/dashboard');
const AdminLoanTypesWithBoundary = withRouteErrorBoundary(AdminLoanTypes, 'Loan Types Management', '/admin/dashboard');

// Animated Routes Component
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/" element={<HomeWithBoundary />} />
        <Route path="/login" element={<LoginWithBoundary />} />
        <Route path="/register" element={<RegisterWithBoundary />} />
        <Route path="/loan-types" element={<LoanTypesWithBoundary />} />
        <Route path="/emi-calculator" element={<EmiCalculatorWithBoundary />} />

        {/* Protected Customer Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardWithBoundary />
            </ProtectedRoute>
          }
        />
        <Route
          path="/apply-loan/:loanTypeId"
          element={
            <ProtectedRoute>
              <ApplyLoanWithBoundary />
            </ProtectedRoute>
          }
        />
        <Route
          path="/applications"
          element={
            <ProtectedRoute>
              <ApplicationsWithBoundary />
            </ProtectedRoute>
          }
        />
        <Route
          path="/applications/:id"
          element={
            <ProtectedRoute>
              <ApplicationDetailWithBoundary />
            </ProtectedRoute>
          }
        />
        <Route
          path="/loan-history"
          element={
            <ProtectedRoute>
              <LoanHistoryWithBoundary />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfileWithBoundary />
            </ProtectedRoute>
          }
        />

        {/* Protected Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute adminOnly>
              <AdminDashboardWithBoundary />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/applications"
          element={
            <ProtectedRoute adminOnly>
              <AdminApplicationsWithBoundary />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/applications/:id"
          element={
            <ProtectedRoute adminOnly>
              <AdminApplicationDetailWithBoundary />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute adminOnly>
              <AdminUsersWithBoundary />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/audit-logs"
          element={
            <ProtectedRoute adminOnly>
              <AdminAuditLogsWithBoundary />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute adminOnly>
              <AdminReportsWithBoundary />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/loan-types"
          element={
            <ProtectedRoute adminOnly>
              <AdminLoanTypesWithBoundary />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

// App Content Component
function AppContent() {
  return (
    <div className="min-h-screen bg-background dark:bg-transparent transition-colors duration-300 relative">
      <AnimatedBackground />
      <CustomCursor />
      <div className="relative z-10">
        <Navbar />
        <AnimatedRoutes />
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <Router>
          <ToastProvider>
            <AuthProvider>
              <SplashScreen />
              <AppContent />
            </AuthProvider>
          </ToastProvider>
        </Router>
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
