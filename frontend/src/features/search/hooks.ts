import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { searchApi } from "./api";
import type { SearchQuery } from "./types";
import { useAuth } from "../../providers/AuthProvider";

export const searchKeys = {
  all: ["search"] as const,
  query: (params: SearchQuery) => [...searchKeys.all, "query", params] as const,
  history: () => [...searchKeys.all, "history"] as const,
};

export function useSearch(params: SearchQuery) {
  const { token } = useAuth();
  return useQuery({
    queryKey: searchKeys.query(params),
    queryFn: () => searchApi.search(params),
    enabled: !!token && params.q.length >= 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useSearchHistory() {
  const { token } = useAuth();
  return useQuery({
    queryKey: searchKeys.history(),
    queryFn: searchApi.getHistory,
    enabled: !!token,
  });
}

export function useClearSearchHistory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: searchApi.clearHistory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: searchKeys.history() });
    },
  });
}
