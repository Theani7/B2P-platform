import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/apiClient";

export interface AdminDashboardStats {
  totalUsers: number;
  totalBusinesses: number;
  totalPromoters: number;
  verifiedPromoters: number;
  totalCampaigns: number;
  totalApplications: number;
  totalCollaborations: number;
  totalReviews: number;
  averageRating: number;
  openVerificationRequests: number;
}

export interface AdminAnalytics extends AdminDashboardStats {
  acceptanceRate: number;
  topNiches: Record<string, number>;
  topLocations: Record<string, number>;
}

export interface AdminUser {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  hasBusinessProfile: boolean;
  hasPromoterProfile: boolean;
}

export type AdminUserDetail = AdminUser;

export interface AdminUserQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: "BUSINESS" | "PROMOTER" | "ADMIN";
  isActive?: boolean;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface AdminCampaign {
  id: string;
  title: string;
  businessCompanyName: string;
  category: string | null;
  budget: number;
  location: string | null;
  status: string;
  visibility: string | null;
  createdAt: string;
}

export interface AdminCampaignQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export interface AdminReview {
  id: string;
  collaborationId: string;
  reviewerUsername: string;
  revieweeUsername: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

export interface AdminReviewQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export interface AuditLog {
  id: string;
  userId: string | null;
  username: string;
  action: string;
  entityType: string | null;
  entityId: string | null;
  ipAddress: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface AuditLogQuery {
  page?: number;
  limit?: number;
  search?: string;
  action?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface PlatformSetting {
  id: string;
  settingKey: string;
  settingValue: string;
  description: string | null;
  updatedAt: string;
}

// --- Dashboard & analytics ---
export const useAdminDashboard = () =>
  useQuery<AdminDashboardStats>({
    queryKey: ["admin-dashboard"],
    queryFn: () => api.get<AdminDashboardStats>("/admin/dashboard").then((r) => r.data),
  });

export const useAdminAnalytics = () =>
  useQuery<AdminAnalytics>({
    queryKey: ["admin-analytics"],
    queryFn: () => api.get<AdminAnalytics>("/admin/analytics").then((r) => r.data),
  });

// --- Users ---
export const useAdminUsers = (params: AdminUserQuery) =>
  useQuery<Paginated<AdminUser>>({
    queryKey: ["admin-users", params],
    queryFn: () => api.get<Paginated<AdminUser>>("/admin/users", { params }).then((r) => r.data),
  });

export const useAdminUser = (userId: string) =>
  useQuery<AdminUserDetail>({
    queryKey: ["admin-user", userId],
    queryFn: () => api.get<AdminUserDetail>(`/admin/users/${userId}`).then((r) => r.data),
    enabled: !!userId,
  });

export const useSuspendUser = () => {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (userId) => api.patch(`/admin/users/${userId}/suspend`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
};

export const useActivateUser = () => {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (userId) => api.patch(`/admin/users/${userId}/activate`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
};

export const useDeleteUser = () => {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (userId) => api.delete(`/admin/users/${userId}`),
    onMutate: async (userId) => {
      await qc.cancelQueries({ queryKey: ["admin-users"] });
      
      const previousUsers = qc.getQueryData(["admin-users"]);
      
      qc.setQueriesData({ queryKey: ["admin-users"] }, (old: any) => {
        if (!old || !old.items) return old;
        return {
          ...old,
          items: old.items.filter((u: any) => u.id !== userId)
        };
      });
      
      return { previousUsers };
    },
    onError: (err, userId, context: any) => {
      if (context?.previousUsers) {
        qc.setQueryData(["admin-users"], context.previousUsers);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
};

// --- Campaigns ---
export const useAdminCampaigns = (params: AdminCampaignQuery) =>
  useQuery<Paginated<AdminCampaign>>({
    queryKey: ["admin-campaigns", params],
    queryFn: () => api.get<Paginated<AdminCampaign>>("/admin/campaigns", { params }).then((r) => r.data),
  });

export const useArchiveCampaign = () => {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => api.patch(`/admin/campaigns/${id}/archive`),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["admin-campaigns"] });
      const previous = qc.getQueryData(["admin-campaigns"]);
      qc.setQueriesData({ queryKey: ["admin-campaigns"] }, (old: any) => {
        if (!old || !old.items) return old;
        return {
          ...old,
          items: old.items.map((c: any) => c.id === id ? { ...c, status: "ARCHIVED" } : c)
        };
      });
      return { previous };
    },
    onError: (err, id, context: any) => {
      if (context?.previous) qc.setQueryData(["admin-campaigns"], context.previous);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["admin-campaigns"] });
    },
  });
};

export const useCancelCampaign = () => {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => api.patch(`/admin/campaigns/${id}/cancel`),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["admin-campaigns"] });
      const previous = qc.getQueryData(["admin-campaigns"]);
      qc.setQueriesData({ queryKey: ["admin-campaigns"] }, (old: any) => {
        if (!old || !old.items) return old;
        return {
          ...old,
          items: old.items.map((c: any) => c.id === id ? { ...c, status: "CANCELLED" } : c)
        };
      });
      return { previous };
    },
    onError: (err, id, context: any) => {
      if (context?.previous) qc.setQueryData(["admin-campaigns"], context.previous);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["admin-campaigns"] });
    },
  });
};

// --- Reviews ---
export const useAdminReviews = (params: AdminReviewQuery) =>
  useQuery<Paginated<AdminReview>>({
    queryKey: ["admin-reviews", params],
    queryFn: () => api.get<Paginated<AdminReview>>("/admin/reviews", { params }).then((r) => r.data),
  });

export const useDeleteReview = () => {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => api.delete(`/admin/reviews/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-reviews"] }),
  });
};

// --- Platform settings ---
export const useAdminSettings = () =>
  useQuery<Paginated<PlatformSetting> | PlatformSetting[]>({
    queryKey: ["admin-settings"],
    queryFn: () => api.get<any>("/admin/settings").then((r) => (r.data.items ? r.data.items : r.data)),
  });

export const useSeedSettings = () => {
  const qc = useQueryClient();
  return useMutation<void, Error>({
    mutationFn: () => api.post("/admin/settings/seed"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-settings"] }),
  });
};

export const useUpdateSetting = () => {
  const qc = useQueryClient();
  return useMutation<void, Error, { key: string; settingValue: string; description?: string }>({
    mutationFn: ({ key, settingValue, description }) =>
      api.put(`/admin/settings/${key}`, { settingValue, description }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-settings"] }),
  });
};

export const useDeleteSetting = () => {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (key) => api.delete(`/admin/settings/${key}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-settings"] }),
  });
};

// --- Verification requests (admin) ---
export interface VerificationRequest {
  id: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  requester_name: string;
  requester_type: "BUSINESS" | "PROMOTER";
  submitted_at: string;
  requester_headline?: string | null;
  admin_notes?: string | null;
  profile_data?: {
    niche?: string;
    followers_count?: number;
    engagement_rate?: number;
    website?: string;
    company_size?: number;
    location?: string;
  } | null;
}

export interface VerificationQuery {
  status?: string;
  page?: number;
  limit?: number;
}

export const useAdminVerificationRequests = (params: VerificationQuery) =>
  useQuery<Paginated<VerificationRequest>>({
    queryKey: ["admin-verification-requests", params],
    queryFn: () => api.get<Paginated<VerificationRequest>>("/verification-requests", { params }).then((r) => r.data),
  });

export const useAdminApproveVerification = () => {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => api.post(`/verification-requests/${id}/approve`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-verification-requests"] }),
  });
};

export const useAdminRejectVerification = () => {
  const qc = useQueryClient();
  return useMutation<void, Error, { id: string; adminNotes?: string }>({
    mutationFn: ({ id, adminNotes }) => api.post(`/verification-requests/${id}/reject`, { adminNotes }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-verification-requests"] }),
  });
};
