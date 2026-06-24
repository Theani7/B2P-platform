import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import BusinessDashboard from "./pages/BusinessDashboard";
import PromoterDashboard from "./pages/PromoterDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import { useAuth } from "./providers/AuthProvider";

const AppRoutes = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) return null; // could show spinner

  const RequireRole = ({ role, children }: { role: string; children: JSX.Element }) => {
    if (!user) return <Navigate to="/login" replace />;
    return user.role === role ? children : <Navigate to="/" replace />;
  };

  const roleRedirect = () => {
    if (!user) return <Navigate to="/login" replace />;
    switch (user.role) {
      case "BUSINESS":
        return <Navigate to="/business/dashboard" replace />;
      case "PROMOTER":
        return <Navigate to="/promoter/dashboard" replace />;
      case "ADMIN":
        return <Navigate to="/admin/dashboard" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  };

  return (
    <Routes>
      {/* public */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* protected */}
      <Route
        path="/business/dashboard"
        element={<RequireRole role="BUSINESS"><BusinessDashboard /></RequireRole>}
      />
      <Route
        path="/promoter/dashboard"
        element={<RequireRole role="PROMOTER"><PromoterDashboard /></RequireRole>}
      />
      <Route
        path="/admin/dashboard"
        element={<RequireRole role="ADMIN"><AdminDashboard /></RequireRole>}
      />

      {/* fallback */}
      <Route path="*" element={roleRedirect()} />
    </Routes>
  );
};

export default AppRoutes;
