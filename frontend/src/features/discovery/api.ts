import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../services/apiClient";
import {
  PromoterDirectoryResponse,
  PromoterPublicProfile,
  DirectorySearchParams,
} from "./types";

export const usePromoterDirectory = (params: DirectorySearchParams) =>
  useQuery<PromoterDirectoryResponse>({
    queryKey: ["promoter-directory", params],
    queryFn: () => api.get("/promoters", { params }).then((r) => r.data),
  });

export const usePublicPromoterProfile = (username: string) =>
  useQuery<PromoterPublicProfile>({
    queryKey: ["promoter", username],
    queryFn: () => api.get(`/promoters/${username}`).then((r) => r.data),
    enabled: !!username,
  });

export const useSavePromoter = () => {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (promoterId) => api.post(`/business/saved-promoters/${promoterId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["saved-promoters"] });
      qc.invalidateQueries({ queryKey: ["promoter-directory"] });
    },
  });
};

export const useRemoveSavedPromoter = () => {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (promoterId) => api.delete(`/business/saved-promoters/${promoterId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["saved-promoters"] });
      qc.invalidateQueries({ queryKey: ["promoter-directory"] });
    },
  });
};

export const useSavedPromoters = (params: { search?: string; page?: number; limit?: number }) =>
  useQuery<PromoterDirectoryResponse>({
    queryKey: ["saved-promoters", params],
    queryFn: () => api.get("/business/saved-promoters", { params }).then((r) => r.data),
  });
