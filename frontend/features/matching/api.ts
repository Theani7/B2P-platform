import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/apiClient";

export type MatchClassification = "EXCELLENT_MATCH" | "GOOD_MATCH" | "AVERAGE_MATCH" | "LOW_MATCH";

export interface MatchScoreBreakdown {
  niche?: number;
  location?: number;
  followers?: number;
  experience?: number;
  engagement?: number;
}

export interface MatchResult {
  id: string;
  campaignId: string;
  promoter: {
    id: string;
    username: string;
    headline?: string | null;
    avatarUrl?: string | null;
    niche: string;
    location?: string | null;
    followersCount: number;
    engagementRate: number;
    yearsExperience?: number | null;
    verified: boolean;
  };
  score: number;
  classification: MatchClassification;
  scoreBreakdown: MatchScoreBreakdown;
  createdAt: string;
  explanation: string;
}

export interface MatchListRead {
  items: MatchResult[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface MatchParams {
  page?: number;
  limit?: number;
  classification?: MatchClassification;
  minScore?: number;
  verified?: boolean;
}

export const useMatches = (campaignId: string, params?: MatchParams) =>
  useQuery<MatchListRead>({
    queryKey: ["matches", campaignId, params],
    queryFn: () => api.get<MatchListRead>(`/campaigns/${campaignId}/matches`, { params }).then((r) => r.data),
    enabled: !!campaignId,
  });

export const useGenerateMatches = () => {
  const qc = useQueryClient();
  return useMutation<{ totalMatches: number }, Error, string>({
    mutationFn: (campaignId) =>
      api.post(`/campaigns/${campaignId}/generate-matches`).then((r) => r.data),
    onSuccess: (_d, campaignId) => qc.invalidateQueries({ queryKey: ["matches", campaignId] }),
  });
};
