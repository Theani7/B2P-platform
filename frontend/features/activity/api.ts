import { useQuery } from "@tanstack/react-query";
import api from "@/lib/apiClient";

export interface ActivityLog {
  id: string;
  actorId: string | null;
  actorRole: string | null;
  entityType: string | null;
  entityId: string | null;
  action: string;
  title: string;
  description: string | null;
  metadataInfo: Record<string, unknown> | null;
  createdAt: string;
  actorName: string | null;
  actorAvatar: string | null;
}

export interface ActivityListRead {
  items: ActivityLog[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface ActivityParams {
  page?: number;
  size?: number;
}

export const useMyActivities = (params?: ActivityParams) =>
  useQuery<ActivityListRead>({
    queryKey: ["activities-me", params],
    queryFn: () => api.get<ActivityListRead>("/activity/me", { params }).then((r) => r.data),
  });

export const useBusinessActivities = (params?: ActivityParams) =>
  useQuery<ActivityListRead>({
    queryKey: ["activities-business", params],
    queryFn: () => api.get<ActivityListRead>("/activity/business", { params }).then((r) => r.data),
  });

export const useAdminActivities = (params?: ActivityParams) =>
  useQuery<ActivityListRead>({
    queryKey: ["activities-admin", params],
    queryFn: () => api.get<ActivityListRead>("/activity/admin", { params }).then((r) => r.data),
  });
