import { useQuery } from "@tanstack/react-query";
import api from "@/lib/apiClient";

export interface ChartDataPoint {
  name: string;
  value: number;
}

export interface DateDataPoint {
  month: string;
  value: number;
}

export interface BusinessAnalyticsRead {
  summary: {
    active_campaigns: number;
    total_campaigns: number;
    total_spent: number;
    applications_received: number;
    total_applications: number;
    active_collaborations: number;
    collaborations_completed: number;
    average_roi: number;
    profile_views: number;
    average_rating: number;
  };
  charts: {
    application_status_distribution?: ChartDataPoint[];
    monthly_applications?: DateDataPoint[];
    monthly_collaborations?: DateDataPoint[];
    top_campaigns_by_applications?: ChartDataPoint[];
  };
  growth: {
    campaign_growth?: number;
    application_growth?: number;
    collaboration_growth?: number;
  };
  metadata: {
    period: string;
  };
}

export const useBusinessAnalytics = () =>
  useQuery<BusinessAnalyticsRead>({
    queryKey: ["business-analytics"],
    queryFn: () => api.get<BusinessAnalyticsRead>("/business/analytics").then((r) => r.data),
  });
