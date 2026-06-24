import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import ErrorBoundary from "../components/ErrorBoundary";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../providers/AuthProvider";
import { Role } from "../constants/roles";

const Login = lazy(() => import("../pages/Login"));
const Register = lazy(() => import("../pages/Register"));
const BusinessDashboard = lazy(() => import("../pages/BusinessDashboard"));
const PromoterDashboard = lazy(() => import("../pages/PromoterDashboard"));
const AdminDashboard = lazy(() => import("../pages/AdminDashboard"));

function ProtectedRoute({ role, children }: { role?: string; children: JSX.Element }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}

function GuestRoute({ children }: { children: JSX.Element }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <LoadingSpinner />;
  if (user) {
    switch (user.role) {
      case Role.BUSINESS:
        return <Navigate to="/business/dashboard" replace />;
      case Role.PROMOTER:
        return <Navigate to="/promoter/dashboard" replace />;
      case Role.ADMIN:
        return <Navigate to="/admin/dashboard" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }
  return children;
}

function RoleRedirect() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  switch (user.role) {
    case Role.BUSINESS:
      return <Navigate to="/business/dashboard" replace />;
    case Role.PROMOTER:
      return <Navigate to="/promoter/dashboard" replace />;
    case Role.ADMIN:
      return <Navigate to="/admin/dashboard" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
}

export default function AppRoutes() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<RoleRedirect />} />
          <Route
            path="/login"
            element={
              <GuestRoute>
                <AuthLayout title="Welcome back" subtitle="Log in to your account">
                  <Login />
                </AuthLayout>
              </GuestRoute>
            }
          />
          <Route
            path="/register"
            element={
              <GuestRoute>
                <AuthLayout title="Create account" subtitle="Join B2P Connect">
                  <Register />
                </AuthLayout>
              </GuestRoute>
            }
          />
          <Route
            path="/business/dashboard"
            element={
              <ProtectedRoute role={Role.BUSINESS}>
                <DashboardLayout role="Business">
                  <BusinessDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/promoter/dashboard"
            element={
              <ProtectedRoute role={Role.PROMOTER}>
                <DashboardLayout role="Promoter">
                  <PromoterDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute role={Role.ADMIN}>
                <DashboardLayout role="Admin">
                  <AdminDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<RoleRedirect />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
