import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/apiClient";

export interface MarketplaceCampaign {
  id: string;
  businessProfileId: string;
  title: string;
  description: string;
  category: string;
  budget: number;
  location: string;
  targetAudience?: string | null;
  requirements?: string | null;
  startDate: string;
  endDate: string;
  createdAt: string;
  businessName: string;
  hasApplied: boolean;
  isBookmarked: boolean;
  applicantCount: number;
}

export interface MarketplaceListRead {
  items: MarketplaceCampaign[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface MarketplaceParams {
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

export const useMarketplace = (params?: MarketplaceParams) =>
  useQuery<MarketplaceListRead>({
    queryKey: ["marketplace", params],
    queryFn: () => api.get<MarketplaceListRead>("/campaign-marketplace", { params }).then((r) => r.data),
  });

export const useBookmarkCampaign = () => {
  const qc = useQueryClient();
  return useMutation<{ success: boolean; bookmarked: boolean }, Error, string>({
    mutationFn: (campaignId) =>
      api.post(`/campaign-marketplace/${campaignId}/bookmark`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["marketplace"] }),
  });
};

export const useRemoveBookmark = () => {
  const qc = useQueryClient();
  return useMutation<{ success: boolean; bookmarked: boolean }, Error, string>({
    mutationFn: (campaignId) =>
      api.delete(`/campaign-marketplace/${campaignId}/bookmark`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["marketplace"] }),
  });
};
