import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/apiClient";

export interface SearchHit {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
  type: "campaign" | "promoter" | "business" | "user";
  url: string;
  score: number;
}

export interface SearchResults {
  campaigns: SearchHit[];
  promoters: SearchHit[];
  businesses: SearchHit[];
  collaborations: SearchHit[];
  messages: SearchHit[];
  users: SearchHit[];
}

export interface SearchParams {
  q: string;
  type?: "campaign" | "promoter" | "business" | "user";
  page?: number;
  limit?: number;
}

export interface SearchHistoryItem {
  id: string;
  query: string;
  createdAt: string;
}

export const useSearch = (params: SearchParams | null) =>
  useQuery<SearchResults>({
    queryKey: ["search", params],
    queryFn: () => api.get<SearchResults>("/search", { params }).then((r) => r.data),
    enabled: !!params && params.q.trim().length > 0,
  });

export const useSearchHistory = () =>
  useQuery<SearchHistoryItem[]>({
    queryKey: ["search-history"],
    queryFn: () => api.get<SearchHistoryItem[]>("/search/history").then((r) => r.data),
  });

export const useClearSearchHistory = () => {
  const qc = useQueryClient();
  return useMutation<void, Error, void>({
    mutationFn: () => api.delete("/search/history"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["search-history"] }),
  });
};
