import { useQuery } from "@tanstack/react-query";
import apiClient from "../../services/apiClient";
import type { ProfileCompletionResponse } from "./types";

export const profileCompletionKeys = {
  all: ["profile-completion"] as const,
  business: () => [...profileCompletionKeys.all, "business"] as const,
  promoter: () => [...profileCompletionKeys.all, "promoter"] as const,
};

export function useBusinessProfileCompletion() {
  return useQuery({
    queryKey: profileCompletionKeys.business(),
    queryFn: async () => {
      const { data } = await apiClient.get<ProfileCompletionResponse>("/profile-completion/business");
      return data;
    },
  });
}

export function usePromoterProfileCompletion() {
  return useQuery({
    queryKey: profileCompletionKeys.promoter(),
    queryFn: async () => {
      const { data } = await apiClient.get<ProfileCompletionResponse>("/profile-completion/promoter");
      return data;
    },
  });
}
