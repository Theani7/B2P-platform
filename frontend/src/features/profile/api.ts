import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../services/apiClient";
import { BusinessProfileRead } from "./business_profile";
import { PromoterProfileRead } from "./promoter_profile";

// Business profile hooks
export const useBusinessProfile = () =>
  useQuery<BusinessProfileRead>({ queryKey: ["business-profile"], queryFn: () => api.get("/business/profile").then(r => r.data) });

export const useUpsertBusinessProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { company_name: string; industry: string; description?: string; location?: string; website?: string }) =>
      api.post("/business/profile", data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["business-profile"] }),
  });
};

// Promoter profile hooks
export const usePromoterProfile = () =>
  useQuery<PromoterProfileRead>({ queryKey: ["promoter-profile"], queryFn: () => api.get("/promoter/profile").then(r => r.data) });

export const useUpsertPromoterProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post("/promoter/profile", data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["promoter-profile"] }),
  });
};

// Public promoter profile
export const usePublicPromoterProfile = (username: string) =>
  useQuery<PromoterProfileRead>({ queryKey: ["promoter", username], queryFn: () => api.get(`/promoters/${username}`).then(r => r.data) });

// Directory
export const usePromoterDirectory = () =>
  useQuery<{ items: PromoterProfileRead[] }>({ queryKey: ["promoter-directory"], queryFn: () => api.get("/directory/promoters").then(r => r.data) });