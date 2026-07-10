import apiClient from "../../services/apiClient";
import type { Notification, UnreadCountResponse } from "./types";

export const notificationKeys = {
  all: ["notifications"] as const,
  list: (filters: any) => [...notificationKeys.all, "list", filters] as const,
  unreadCount: () => [...notificationKeys.all, "unreadCount"] as const,
};

export const getNotifications = async (page = 1, limit = 10, unreadOnly = false) => {
  const { data } = await apiClient.get<{ items: Notification[], total: number, page: number, pages: number }>(
    `/notifications?page=${page}&limit=${limit}&unread_only=${unreadOnly}`
  );
  return data;
};

export const getUnreadCount = async () => {
  const { data } = await apiClient.get<UnreadCountResponse>("/notifications/unread-count");
  return data.count;
};

export const markAsRead = async (id: string) => {
  const { data } = await apiClient.put<Notification>(`/notifications/${id}/read`);
  return data;
};

export const markAllAsRead = async () => {
  await apiClient.put("/notifications/read-all");
};

export const deleteNotification = async (id: string) => {
  await apiClient.delete(`/notifications/${id}`);
};
