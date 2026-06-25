import { useQuery } from "@tanstack/react-query";
import apiClient from "../../services/apiClient";
import type { ActivityResponse, ActivityFilters } from "./types";

export const activityKeys = {
  all: ["activity"] as const,
  me: (filters: ActivityFilters) => [...activityKeys.all, "me", filters] as const,
  business: (filters: ActivityFilters) => [...activityKeys.all, "business", filters] as const,
  admin: (filters: ActivityFilters) => [...activityKeys.all, "admin", filters] as const,
};

export function useMyActivity(filters: ActivityFilters = {}) {
  return useQuery({
    queryKey: activityKeys.me(filters),
    queryFn: async () => {
      const { data } = await apiClient.get<ActivityResponse>("/activity/me", { params: filters });
      return data;
    },
  });
}

export function useBusinessActivity(filters: ActivityFilters = {}) {
  return useQuery({
    queryKey: activityKeys.business(filters),
    queryFn: async () => {
      const { data } = await apiClient.get<ActivityResponse>("/activity/business", { params: filters });
      return data;
    },
  });
}

export function useAdminActivity(filters: ActivityFilters = {}) {
  return useQuery({
    queryKey: activityKeys.admin(filters),
    queryFn: async () => {
      const { data } = await apiClient.get<ActivityResponse>("/activity/admin", { params: filters });
      return data;
    },
  });
}
