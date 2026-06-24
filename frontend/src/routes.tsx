import { lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import { Role } from "../constants/roles";

const BusinessDashboard = lazy(() => import("../pages/BusinessDashboard"));
const PromoterDashboard = lazy(() => import("../pages/PromoterDashboard"));
const AdminDashboard = lazy(() => import("../pages/AdminDashboard"));
const Login = lazy(() => import("../pages/Login"));
const Register = lazy(() => import("../pages/Register"));
const BusinessProfilePage = lazy(() => import("../pages/BusinessProfilePage"));
const PromoterProfilePage = lazy(() => import("../pages/PromoterProfilePage"));
const PublicPromoterProfilePage = lazy(() => import("../pages/PublicPromoterProfilePage"));
const CampaignListPage = lazy(() => import("../pages/CampaignListPage"));
const CampaignDetailsPage = lazy(() => import("../pages/CampaignDetailsPage"));
const CreateCampaignPage = lazy(() => import("../pages/CreateCampaignPage"));
const EditCampaignPage = lazy(() => import("../pages/EditCampaignPage"));
const LoadingSpinner = lazy(() => import("../components/LoadingSpinner"));

function ProtectedRoute({ role, children }: { role?: Role; children: JSX.Element }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}

function GuestRoute({ children }: { children: JSX.Element }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <LoadingSpinner />;
  if (user) return <Navigate to={`/${user.role.toLowerCase()}/dashboard`} replace />;
  return children;
}

function RoleRedirect() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={`/${user.role.toLowerCase()}/dashboard`} replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RoleRedirect />} />
      <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
      <Route path="/business/dashboard" element={<ProtectedRoute role={Role.BUSINESS}><BusinessDashboard /></ProtectedRoute>} />
      <Route path="/business/profile" element={<ProtectedRoute role={Role.BUSINESS}><BusinessProfilePage /></ProtectedRoute>} />
      <Route path="/promoter/dashboard" element={<ProtectedRoute role={Role.PROMOTER}><PromoterDashboard /></ProtectedRoute>} />
      <Route path="/promoter/profile" element={<ProtectedRoute role={Role.PROMOTER}><PromoterProfilePage /></ProtectedRoute>} />
      <Route path="/promoter/directory" element={<ProtectedRoute role={Role.BUSINESS}><div>Directory (Business only)</div></ProtectedRoute>} />
      <Route path="/promoters/:username" element={<PublicPromoterProfilePage />} />
      <Route path="/business/campaigns" element={<ProtectedRoute role={Role.BUSINESS}><CampaignListPage /></ProtectedRoute>} />
      <Route path="/business/campaigns/create" element={<ProtectedRoute role={Role.BUSINESS}><CreateCampaignPage /></ProtectedRoute>} />
      <Route path="/business/campaigns/:id" element={<ProtectedRoute role={Role.BUSINESS}><CampaignDetailsPage /></ProtectedRoute>} />
      <Route path="/business/campaigns/:id/edit" element={<ProtectedRoute role={Role.BUSINESS}><EditCampaignPage /></ProtectedRoute>} />
      <Route path="*" element={<RoleRedirect />} />
    </Routes>
  );
}