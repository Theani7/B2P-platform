import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationKeys, getNotifications, getUnreadCount, markAsRead, markAllAsRead, deleteNotification } from "./api";

export function useNotifications(page = 1, limit = 10, unreadOnly = false) {
  return useQuery({
    queryKey: notificationKeys.list({ page, limit, unreadOnly }),
    queryFn: () => getNotifications(page, limit, unreadOnly),
  });
}

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: getUnreadCount,
    refetchInterval: 60000, // Fallback polling every 60s
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}
