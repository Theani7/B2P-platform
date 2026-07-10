export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api/v1";
export const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "http://localhost:8000";

export const ROUTES = {
  login: "/login",
  register: "/register",
  verifyEmail: "/verify-email",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  businessDashboard: "/business/dashboard",
  promoterDashboard: "/promoter/dashboard",
  adminDashboard: "/admin/dashboard",
} as const;
