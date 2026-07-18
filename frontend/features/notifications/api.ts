import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/apiClient";

export interface NotificationRead {
  id: string;
  recipientId: string;
  actor: { id: string; username: string; fullName?: string; avatarUrl?: string | null } | null;
  type: string;
  title: string;
  message: string;
  entityType?: string | null;
  entityId?: string | null;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
}

export interface NotificationListRead {
  items: NotificationRead[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface NotificationPreference {
  id: string;
  type: string;
  enabled: boolean;
}

export interface NotificationParams {
  page?: number;
  limit?: number;
  unread_only?: boolean;
}

export const useNotifications = (params?: NotificationParams) =>
  useQuery<NotificationListRead>({
    queryKey: ["notifications", params],
    queryFn: () => api.get<NotificationListRead>("/notifications", { params }).then((r) => r.data),
  });

export const useUnreadCount = () =>
  useQuery<{ count: number }>({
    queryKey: ["notifications-unread"],
    queryFn: () => api.get<{ count: number }>("/notifications/unread-count").then((r) => r.data),
    refetchInterval: 30000,
  });

export const useMarkRead = () => {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => api.put(`/notifications/${id}/read`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["notifications-unread"] });
    },
  });
};

export const useMarkAllRead = () => {
  const qc = useQueryClient();
  return useMutation<{ updatedCount: number }, Error, void>({
    mutationFn: () => api.put("/notifications/read-all").then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["notifications-unread"] });
    },
  });
};

export const useDeleteNotification = () => {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => api.delete(`/notifications/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["notifications-unread"] });
    },
  });
};

export const useNotificationPreferences = () =>
  useQuery<{ preferences: NotificationPreference[] }>({
    queryKey: ["notification-prefs"],
    queryFn: () => api.get("/notifications/preferences").then((r) => r.data),
  });

export const useUpdateNotificationPreferences = () => {
  const qc = useQueryClient();
  return useMutation<
    { preferences: NotificationPreference[] },
    Error,
    { preferences: { type: string; enabled: boolean }[] }
  >({
    mutationFn: (preferences) =>
      api.put("/notifications/preferences", { preferences }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notification-prefs"] }),
  });
};
