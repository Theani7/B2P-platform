import { lazy, Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./providers/AuthProvider";
import { Role } from "./constants/roles";
import LoadingSpinner from "./components/LoadingSpinner";
import React from "react";

const Landing = lazy(() => import("./pages/Landing"));
const DashboardLayout = lazy(() => import("./layouts/DashboardLayout"));
const BusinessDashboard = lazy(() => import("./pages/BusinessDashboard"));
const PromoterDashboard = lazy(() => import("./pages/PromoterDashboard"));
const Login = lazy(() => import("./pages/LoginPage"));
const Register = lazy(() => import("./pages/RegisterPage"));
const BusinessProfilePage = lazy(() => import("./pages/BusinessProfilePage"));
const PromoterProfilePage = lazy(() => import("./pages/PromoterProfilePage"));
const PublicPromoterProfilePage = lazy(() => import("./pages/PublicPromoterProfilePage"));
const CampaignListPage = lazy(() => import("./pages/CampaignListPage"));
const CampaignDetailsPage = lazy(() => import("./pages/CampaignDetailsPage"));
const CreateCampaignPage = lazy(() => import("./pages/CreateCampaignPage"));
const EditCampaignPage = lazy(() => import("./pages/EditCampaignPage"));
const PromoterDirectoryPage = lazy(() => import("./pages/PromoterDirectoryPage"));
const SavedPromotersPage = lazy(() => import("./pages/SavedPromotersPage"));
const CampaignMarketplacePage = lazy(() => import("./pages/CampaignMarketplacePage"));
const MyApplicationsPage = lazy(() => import("./pages/MyApplicationsPage"));
const BusinessApplicationsPage = lazy(() => import("./pages/BusinessApplicationsPage"));
const BusinessInvitationsPage = lazy(() => import("./pages/BusinessInvitationsPage"));
const PromoterInvitationsPage = lazy(() => import("./pages/PromoterInvitationsPage"));
const CollaborationsPage = lazy(() => import("./pages/CollaborationsPage"));
const CampaignMatchesPage = lazy(() => import("./pages/CampaignMatchesPage"));
const MyReviewsPage = lazy(() => import("./pages/MyReviewsPage"));
const UserReviewsPage = lazy(() => import("./pages/UserReviewsPage"));
const PromoterSettingsPage = lazy(() => import("./pages/PromoterSettingsPage"));

function ProtectedRoute({ role, children }: { role?: Role; children: React.ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  const location = useLocation();

  if (authLoading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;

  const isProfilePage =
    location.pathname === "/business/profile" ||
    location.pathname === "/promoter/profile";

  if (!user.has_profile && !isProfilePage && user.role !== Role.ADMIN) {
    const profilePath =
      user.role === Role.BUSINESS ? "/business/profile" : "/promoter/profile";
    return <Navigate to={profilePath} replace />;
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <DashboardLayout role={user.role as string}>
        {children}
      </DashboardLayout>
    </Suspense>
  );
}

function GuestRoute({ children }: { children: React.ReactNode }) {
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
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
      <Route path="/business/dashboard" element={<ProtectedRoute role={Role.BUSINESS}><BusinessDashboard /></ProtectedRoute>} />
      <Route path="/business/profile" element={<ProtectedRoute role={Role.BUSINESS}><BusinessProfilePage /></ProtectedRoute>} />
      <Route path="/promoter/dashboard" element={<ProtectedRoute role={Role.PROMOTER}><PromoterDashboard /></ProtectedRoute>} />
      <Route path="/promoter/profile" element={<ProtectedRoute role={Role.PROMOTER}><PromoterProfilePage /></ProtectedRoute>} />
      <Route path="/promoters/:username" element={<PublicPromoterProfilePage />} />
      <Route path="/business/campaigns" element={<ProtectedRoute role={Role.BUSINESS}><CampaignListPage /></ProtectedRoute>} />
      <Route path="/business/campaigns/create" element={<ProtectedRoute role={Role.BUSINESS}><CreateCampaignPage /></ProtectedRoute>} />
      <Route path="/business/campaigns/:id" element={<ProtectedRoute role={Role.BUSINESS}><CampaignDetailsPage /></ProtectedRoute>} />
      <Route path="/business/campaigns/:id/edit" element={<ProtectedRoute role={Role.BUSINESS}><EditCampaignPage /></ProtectedRoute>} />
      <Route path="/business/promoters" element={<ProtectedRoute role={Role.BUSINESS}><PromoterDirectoryPage /></ProtectedRoute>} />
      <Route path="/business/saved-promoters" element={<ProtectedRoute role={Role.BUSINESS}><SavedPromotersPage /></ProtectedRoute>} />
      <Route path="/business/collaborations" element={<ProtectedRoute><CollaborationsPage /></ProtectedRoute>} />
      <Route path="/business/invitations" element={<ProtectedRoute role={Role.BUSINESS}><BusinessInvitationsPage /></ProtectedRoute>} />
      <Route path="/business/campaigns/:campaignId/applications" element={<ProtectedRoute role={Role.BUSINESS}><BusinessApplicationsPage /></ProtectedRoute>} />
      <Route path="/business/campaigns/:campaignId/matches" element={<ProtectedRoute role={Role.BUSINESS}><CampaignMatchesPage /></ProtectedRoute>} />
      <Route path="/promoter/marketplace" element={<ProtectedRoute role={Role.PROMOTER}><CampaignMarketplacePage /></ProtectedRoute>} />
      <Route path="/promoter/applications" element={<ProtectedRoute role={Role.PROMOTER}><MyApplicationsPage /></ProtectedRoute>} />
      <Route path="/promoter/invitations" element={<ProtectedRoute role={Role.PROMOTER}><PromoterInvitationsPage /></ProtectedRoute>} />
      <Route path="/promoter/collaborations" element={<ProtectedRoute><CollaborationsPage /></ProtectedRoute>} />
      <Route path="/my/reviews" element={<ProtectedRoute><MyReviewsPage /></ProtectedRoute>} />
      <Route path="/users/:userId/reviews" element={<ProtectedRoute><UserReviewsPage /></ProtectedRoute>} />
      <Route path="/promoter/settings" element={<ProtectedRoute role={Role.PROMOTER}><PromoterSettingsPage /></ProtectedRoute>} />
      <Route path="*" element={<RoleRedirect />} />
    </Routes>
  );
}
