import { useQuery } from "@tanstack/react-query";
import apiClient from "../../services/apiClient";
import type { BusinessAnalyticsResponse, PromoterAnalyticsResponse, AdminAnalyticsResponse } from "./types";

export const analyticsKeys = {
  all: ["analytics"] as const,
  business: () => [...analyticsKeys.all, "business"] as const,
  promoter: () => [...analyticsKeys.all, "promoter"] as const,
  admin: () => [...analyticsKeys.all, "admin"] as const,
};

export function useBusinessAnalytics() {
  return useQuery({
    queryKey: analyticsKeys.business(),
    queryFn: async () => {
      const { data } = await apiClient.get<BusinessAnalyticsResponse>("/analytics/business");
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function usePromoterAnalytics() {
  return useQuery({
    queryKey: analyticsKeys.promoter(),
    queryFn: async () => {
      try {
        const { data } = await apiClient.get<PromoterAnalyticsResponse>("/analytics/promoter");
        return data;
      } catch (err) {
        return { summary: { total_earnings: 0, pending_payouts: 0, active_collaborations: 0, completed_collaborations: 0, average_rating: 0, reviews_received: 0, invitations_pending: 0, applications_pending: 0 } } as any;
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useAdminAnalytics() {
  return useQuery({
    queryKey: analyticsKeys.admin(),
    queryFn: async () => {
      const { data } = await apiClient.get<AdminAnalyticsResponse>("/analytics/admin");
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}
