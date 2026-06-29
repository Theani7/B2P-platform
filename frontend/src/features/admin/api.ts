import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../services/apiClient";
import type {
  DashboardStats,
  AdminUserListResponse,
  AdminUserRead,
  VerificationRequestListResponse,
  AdminCampaignListResponse,
  AdminReviewListResponse,
  AuditLogListResponse,
  PlatformSettingListResponse,
  AnalyticsData,
} from "./types";

// --- Dashboard ---
export function useAdminDashboard() {
  return useQuery<DashboardStats>({
    queryKey: ["admin-dashboard"],
    queryFn: async () => {
      const res = await api.get("/admin/dashboard");
      return res.data;
    },
  });
}

// --- Users ---
export function useAdminUsers(params?: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  is_active?: boolean;
}) {
  return useQuery<AdminUserListResponse>({
    queryKey: ["admin-users", params],
    queryFn: async () => {
      const qs = new URLSearchParams();
      if (params?.page) qs.set("page", String(params.page));
      if (params?.limit) qs.set("limit", String(params.limit));
      if (params?.search) qs.set("search", params.search);
      if (params?.role) qs.set("role", params.role);
      if (params?.is_active !== undefined) qs.set("is_active", String(params.is_active));
      const res = await api.get(`/admin/users${qs.toString() ? `?${qs.toString()}` : ""}`);
      return res.data;
    },
  });
}

export function useAdminUserDetail(userId: string) {
  return useQuery<AdminUserRead>({
    queryKey: ["admin-user", userId],
    queryFn: async () => {
      const res = await api.get(`/admin/users/${userId}`);
      return res.data;
    },
    enabled: !!userId,
  });
}

export function useAdminSuspendUser() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (userId) => {
      await api.patch(`/admin/users/${userId}/suspend`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      qc.invalidateQueries({ queryKey: ["admin-user"] });
    },
  });
}

export function useAdminActivateUser() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (userId) => {
      await api.patch(`/admin/users/${userId}/activate`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      qc.invalidateQueries({ queryKey: ["admin-user"] });
    },
  });
}

export function useAdminDeleteUser() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (userId) => {
      await api.delete(`/admin/users/${userId}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
}

// --- Verification ---
export function useAdminVerificationRequests(params?: {
  page?: number;
  limit?: number;
  status?: string;
}) {
  return useQuery<VerificationRequestListResponse>({
    queryKey: ["admin-verification-requests", params],
    queryFn: async () => {
      const qs = new URLSearchParams();
      if (params?.page) qs.set("page", String(params.page));
      if (params?.limit) qs.set("limit", String(params.limit));
      if (params?.status) qs.set("status", params.status);
      const res = await api.get(`/admin/verification-requests${qs.toString() ? `?${qs.toString()}` : ""}`);
      return res.data;
    },
  });
}

export function useAdminApproveVerification() {
  const qc = useQueryClient();
  return useMutation<void, Error, { requestId: string; admin_notes?: string }>({
    mutationFn: async ({ requestId, admin_notes }) => {
      await api.post(`/admin/verification-requests/${requestId}/approve`, { admin_notes });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-verification-requests"] });
      qc.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
  });
}

export function useAdminRejectVerification() {
  const qc = useQueryClient();
  return useMutation<void, Error, { requestId: string; admin_notes?: string }>({
    mutationFn: async ({ requestId, admin_notes }) => {
      await api.post(`/admin/verification-requests/${requestId}/reject`, { admin_notes });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-verification-requests"] });
      qc.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
  });
}

export function useAdminRevokeVerification() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (promoterProfileId) => {
      await api.post(`/admin/promoters/${promoterProfileId}/revoke-verification`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-verification-requests"] });
      qc.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
  });
}

export function useSubmitVerificationRequest() {
  const qc = useQueryClient();
  return useMutation<void, Error, void>({
    mutationFn: async () => {
      await api.post("/promoter/verification-request");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["promoter-profile"] });
    },
  });
}

// --- Campaigns ---
export function useAdminCampaigns(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}) {
  return useQuery<AdminCampaignListResponse>({
    queryKey: ["admin-campaigns", params],
    queryFn: async () => {
      const qs = new URLSearchParams();
      if (params?.page) qs.set("page", String(params.page));
      if (params?.limit) qs.set("limit", String(params.limit));
      if (params?.search) qs.set("search", params.search);
      if (params?.status) qs.set("status", params.status);
      const res = await api.get(`/admin/campaigns${qs.toString() ? `?${qs.toString()}` : ""}`);
      return res.data;
    },
  });
}

export function useAdminArchiveCampaign() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (campaignId) => {
      await api.patch(`/admin/campaigns/${campaignId}/archive`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-campaigns"] });
    },
  });
}

export function useAdminCancelCampaign() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (campaignId) => {
      await api.patch(`/admin/campaigns/${campaignId}/cancel`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-campaigns"] });
    },
  });
}

// --- Reviews ---
export function useAdminReviews(params?: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  return useQuery<AdminReviewListResponse>({
    queryKey: ["admin-reviews", params],
    queryFn: async () => {
      const qs = new URLSearchParams();
      if (params?.page) qs.set("page", String(params.page));
      if (params?.limit) qs.set("limit", String(params.limit));
      if (params?.search) qs.set("search", params.search);
      const res = await api.get(`/admin/reviews${qs.toString() ? `?${qs.toString()}` : ""}`);
      return res.data;
    },
  });
}

export function useAdminDeleteReview() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (reviewId) => {
      await api.delete(`/admin/reviews/${reviewId}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-reviews"] });
    },
  });
}

// --- Audit Logs ---
export function useAdminAuditLogs(params?: {
  page?: number;
  limit?: number;
  search?: string;
  action?: string;
  user_id?: string;
  date_from?: string;
  date_to?: string;
}) {
  return useQuery<AuditLogListResponse>({
    queryKey: ["admin-audit-logs", params],
    queryFn: async () => {
      const qs = new URLSearchParams();
      if (params?.page) qs.set("page", String(params.page));
      if (params?.limit) qs.set("limit", String(params.limit));
      if (params?.search) qs.set("search", params.search);
      if (params?.action) qs.set("action", params.action);
      if (params?.user_id) qs.set("user_id", params.user_id);
      if (params?.date_from) qs.set("date_from", params.date_from);
      if (params?.date_to) qs.set("date_to", params.date_to);
      const res = await api.get(`/admin/audit-logs${qs.toString() ? `?${qs.toString()}` : ""}`);
      return res.data;
    },
  });
}

// --- Settings ---
export function useAdminSettings() {
  return useQuery<PlatformSettingListResponse>({
    queryKey: ["admin-settings"],
    queryFn: async () => {
      const res = await api.get("/admin/settings");
      return res.data;
    },
  });
}

export function useAdminUpdateSetting() {
  const qc = useQueryClient();
  return useMutation<void, Error, { setting_key: string; setting_value: string; description?: string }>({
    mutationFn: async ({ setting_key, setting_value, description }) => {
      await api.put(`/admin/settings/${setting_key}`, { setting_value, description });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-settings"] });
    },
  });
}

export function useAdminSeedSettings() {
  const qc = useQueryClient();
  return useMutation<void, Error, void>({
    mutationFn: async () => {
      await api.get("/admin/settings/seed");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-settings"] });
    },
  });
}

export function useAdminDeleteSetting() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (setting_key) => {
      await api.delete(`/admin/settings/${setting_key}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-settings"] });
    },
  });
}

// --- Analytics ---
export function useAdminAnalytics() {
  return useQuery<AnalyticsData>({
    queryKey: ["admin-analytics"],
    queryFn: async () => {
      const res = await api.get("/admin/analytics");
      return res.data;
    },
  });
}
