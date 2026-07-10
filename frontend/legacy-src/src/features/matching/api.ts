import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../services/apiClient";
import type { MatchResultListResponse, MatchGenerateResponse } from "./types";

export function useCampaignMatches(
  campaignId: string,
  params?: { page?: number; limit?: number; classification?: string; min_score?: number; verified?: boolean }
) {
  return useQuery<MatchResultListResponse>({
    queryKey: ["campaign-matches", campaignId, params],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.set("page", String(params.page));
      if (params?.limit) queryParams.set("limit", String(params.limit));
      if (params?.classification) queryParams.set("classification", params.classification);
      if (params?.min_score !== undefined) queryParams.set("min_score", String(params.min_score));
      if (params?.verified) queryParams.set("verified", "true");
      const qs = queryParams.toString();
      const res = await api.get(`/campaigns/${campaignId}/matches${qs ? `?${qs}` : ""}`);
      return res.data;
    },
    enabled: !!campaignId,
  });
}

export function useGenerateMatches(campaignId: string) {
  const qc = useQueryClient();
  return useMutation<MatchGenerateResponse, Error, void>({
    mutationFn: async () => {
      const res = await api.post(`/campaigns/${campaignId}/generate-matches`);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["campaign-matches", campaignId] });
    },
  });
}
